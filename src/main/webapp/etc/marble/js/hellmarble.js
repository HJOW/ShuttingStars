import { BOARD, WON, LEAGUES, BUILD_LIMITS, TOKENS, COUPONS, couponById } from './data.js';

/** 저장 데이터 형식의 버전이다. */
const SAVE_VERSION = 1;
/** 저장 슬롯 및 설정의 이름 공간이다. */
const STORAGE_PREFIX = 'hellmarble.v1.';
/** 저장 및 불러오기 시 허용하는 게임 단계이다. */
const PHASES = ['ready', 'radio', 'travel', 'move', 'land', 'buy', 'build', 'coupon', 'pass', 'debt', 'finish', 'ended'];

/** JSON으로 저장할 수 있는 상태를 깊게 복사한다. */
export function copy(value) { return JSON.parse(JSON.stringify(value)); }

/** 플레이어 수를 리그별 상대 가중치에 따라 결정한다. */
export function chooseAILeagueCount(league, random = Math.random) {
  let weights = LEAGUES[league].weights;
  let draw = random() * weights.reduce(/** 가중치 합을 계산한다. */ function sum(total, value) { return total + value; }, 0);
  // 각 인원 구간의 가중치를 차감해 추첨 결과를 찾는다.
  for (let index = 0; index < weights.length; index++) {
    draw -= weights[index];
    if (draw < 0) return index + 1;
  }
  return 3;
}

/** 주사위 두 개의 눈을 생성한다. */
export function dicePair(random = Math.random) { return [Math.floor(random() * 6) + 1, Math.floor(random() * 6) + 1]; }

/** 섞인 쿠폰 덱과 순서 결정 주사위를 포함하는 새 게임을 만든다. */
export function createGame(name, league, random = Math.random) {
  if (!LEAGUES[league]) throw new Error('지원하지 않는 리그입니다.');
  let multiplier = LEAGUES[league].multiplier;
  let players = [];
  let count = chooseAILeagueCount(league, random) + 1;
  // 참가자에게 리그 배율을 적용한 시작 자금과 고유 번호를 부여한다.
  for (let id = 0; id < count; id++) players.push({ id, name: id === 0 ? name : `AI ${id}`, cash: 300 * WON * multiplier, position: 0, alive: true, island: 0, boarded: false, cards: [], openingDice: dicePair(random) });
  let order = players.map(/** 플레이어 번호를 추출한다. */ function playerId(player) { return player.id; });
  order.sort(/** 주사위 합이 같으면 낮은 플레이어 번호부터 배치한다. */ function compare(a, b) { return players[b].openingDice[0] + players[b].openingDice[1] - players[a].openingDice[0] - players[a].openingDice[1] || a - b; });
  let deck = [];
  // 명세의 장수만큼 쿠폰을 구성한다.
  for (let card of COUPONS) {
    // 같은 종류의 쿠폰을 지정 장수만큼 추가한다.
    for (let index = 0; index < card.count; index++) deck.push(card.id);
  }
  // 피셔 예이츠 방식으로 덱을 최초 한 번 섞는다.
  for (let index = deck.length - 1; index > 0; index--) {
    let other = Math.floor(random() * (index + 1));
    [deck[index], deck[other]] = [deck[other], deck[index]];
  }
  let state = { league, multiplier, players, order, cursor: 0, turn: 1, phase: 'ready', properties: BOARD.map(/** 각 칸의 소유권과 건물을 초기화한다. */ function emptyProperty() { return { owner: null, buildings: [0, 0, 0] }; }), deck, pendingCards: [], currentCard: null, fund: 0, dice: [1, 1], movement: null, debt: null, result: null, logs: [] };
  let engine = new GameEngine(state, random);
  engine.log(`게임 시작 · ${players.length}명 · ${LEAGUES[league].name} 리그`, `Game started · ${players.length} players · ${LEAGUES[league].name} league`);
  // 시작 순서를 정한 눈을 기록해 사용자에게 공개한다.
  for (let id of order) engine.log(`${players[id].name}: ${players[id].openingDice.join(' + ')}`, `${players[id].name}: ${players[id].openingDice.join(' + ')}`);
  return state;
}

/** 화면과 독립적으로 턴, 이동, 소유권, 지불 및 쿠폰을 처리하는 게임 규칙 엔진이다. */
export class GameEngine {
  /** 저장 가능한 상태와 교체 가능한 난수 생성기를 받는다. */
  constructor(state, random = Math.random) { this.state = state; this.random = random; }
  /** 현재 차례의 플레이어를 반환한다. */
  get player() { return this.state.players[this.state.order[this.state.cursor]]; }
  /** 한국어와 영어로 함께 진행 기록을 남긴다. */
  log(ko, en) { this.state.logs.push({ ko, en }); if (this.state.logs.length > 40) this.state.logs.shift(); }
  /** 현재 단계에서 허용한 행동인지 검사한다. */
  require(...phases) { if (!phases.includes(this.state.phase)) throw new Error(`현재 단계에서 사용할 수 없는 행동: ${this.state.phase}`); }
  /** 배율을 적용한 토지 및 건물의 전체 구매 가치를 계산한다. */
  value(index) {
    let tile = BOARD[index];
    let total = tile.price;
    // 건물의 종류별 건설 원가를 토지 가치에 더한다.
    for (let kind = 0; kind < 3; kind++) total += (tile.costs[kind] || 0) * this.state.properties[index].buildings[kind];
    return total * this.state.multiplier;
  }
  /** 배율을 적용한 토지 통행료와 모든 건물 이용료를 합산한다. */
  toll(index) {
    let tile = BOARD[index];
    let total = tile.toll;
    // 건물 종류별로 실제 개수만큼 이용료를 합산한다.
    for (let kind = 0; kind < 3; kind++) total += (tile.rents[kind] || 0) * this.state.properties[index].buildings[kind];
    return total * this.state.multiplier;
  }
  /** 지정 플레이어가 소유한 토지의 보드 번호 목록을 반환한다. */
  owned(id = this.player.id) {
    let result = [];
    // 소유자가 일치하는 칸만 매각 및 정산 목록에 포함한다.
    for (let index = 0; index < BOARD.length; index++) if (this.state.properties[index].owner === id) result.push(index);
    return result;
  }
  /** 이번 도착에서 건설할 수 있는 종류 목록을 반환한다. */
  buildOptions() {
    let index = this.player.position;
    let tile = BOARD[index];
    let property = this.state.properties[index];
    let result = [];
    if (tile.type !== 'city' || property.owner !== this.player.id) return result;
    // 건물의 개수 제한과 보유 현금을 동시에 검사한다.
    for (let kind = 0; kind < 3; kind++) if (property.buildings[kind] < BUILD_LIMITS[kind] && this.player.cash >= tile.costs[kind] * this.state.multiplier) result.push(kind);
    return result;
  }
  /** 다음 자기 턴의 무전기 또는 우주여행 선택 단계를 결정한다. */
  prepareTurn() {
    this.state.phase = this.player.boarded ? 'travel' : this.player.island > 0 && this.player.cards.includes('radio') ? 'radio' : 'ready';
  }
  /** 무전기 사용 여부를 적용하고 일반 주사위 단계로 진행한다. */
  useRadio(use) {
    this.require('radio');
    if (use) { this.consume('radio'); this.player.island = 0; this.log(`${this.player.name} 무전기로 탈출`, `${this.player.name} escaped using a radio`); }
    this.state.phase = 'ready';
  }
  /** 보관 쿠폰 한 장을 소모하고 덱 맨 뒤로 돌려놓는다. */
  consume(id) {
    let index = this.player.cards.indexOf(id);
    if (index < 0) throw new Error('보유하지 않은 쿠폰입니다.');
    this.player.cards.splice(index, 1);
    this.state.deck.push(id);
  }
  /** 주사위를 적용하며 무인도 세 번째 턴에는 자동 탈출한다. */
  roll(dice = dicePair(this.random)) {
    this.require('ready');
    if (dice.length !== 2 || !dice.every(/** 주사위 눈 범위를 검사한다. */ function valid(value) { return Number.isInteger(value) && value >= 1 && value <= 6; })) throw new Error('잘못된 주사위입니다.');
    this.state.dice = dice;
    this.log(`${this.player.name} 주사위 ${dice.join(' + ')}`, `${this.player.name} rolled ${dice.join(' + ')}`);
    if (this.player.island > 0) {
      this.player.island--;
      if (dice[0] !== dice[1] && this.player.island > 0) { this.state.phase = 'finish'; this.log('무인도에서 탈출하지 못했습니다.', 'The island escape failed.'); return; }
      this.player.island = 0;
      this.log('무인도 탈출!', 'Escaped the island!');
    }
    this.move(dice[0] + dice[1]);
  }
  /** 칸 단위 애니메이션이 가능한 이동 상태를 만든다. */
  move(steps, salary = true, freeSpace = false) {
    this.state.movement = { remaining: Math.abs(steps), direction: steps < 0 ? -1 : 1, salary, freeSpace };
    this.state.phase = steps === 0 ? 'land' : 'move';
  }
  /** 전진 방향으로 목적지까지의 이동을 예약한다. */
  goTo(target, salary = true, freeSpace = false) { this.move((target - this.player.position + BOARD.length) % BOARD.length, salary, freeSpace); }
  /** 우주여행 목적지를 선택하고 탑승 상태를 해제한다. */
  travel(target) {
    this.require('travel');
    if (!Number.isInteger(target) || target < 0 || target >= BOARD.length) throw new Error('잘못된 목적지입니다.');
    this.player.boarded = false;
    this.goTo(target);
  }
  /** 한 칸 이동하고 출발지를 전진 통과했을 때 월급을 한 번 지급한다. */
  step() {
    this.require('move');
    let movement = this.state.movement;
    this.player.position = (this.player.position + movement.direction + BOARD.length) % BOARD.length;
    if (movement.salary && movement.direction > 0 && this.player.position === 0) {
      this.player.cash += 20 * WON * this.state.multiplier;
      this.log(`${this.player.name} 월급 수령`, `${this.player.name} collected salary`);
    }
    movement.remaining--;
    if (movement.remaining === 0) this.state.phase = 'land';
  }
  /** 도착한 땅의 효과를 처리하고 필요한 사용자 선택 단계로 전환한다. */
  land() {
    this.require('land');
    let index = this.player.position;
    let tile = BOARD[index];
    let property = this.state.properties[index];
    let freeSpace = this.state.movement?.freeSpace;
    this.state.movement = null;
    this.log(`${this.player.name} → ${tile.name}`, `${this.player.name} → ${tile.en}`);
    if (tile.price > 0) {
      if (property.owner === null) this.state.phase = this.player.cash >= tile.price * this.state.multiplier ? 'buy' : 'finish';
      else if (property.owner === this.player.id) this.state.phase = this.buildOptions().length ? 'build' : 'finish';
      else this.requestPayment(this.toll(index), property.owner, 'end', tile.name, tile.en, true);
    } else if (tile.type === 'coupon') {
      this.state.currentCard = this.state.deck.shift();
      if (!this.state.currentCard) throw new Error('쿠폰 덱이 비어 있습니다.');
      this.state.phase = 'coupon';
    } else if (tile.type === 'island') {
      this.player.island = 3;
      this.state.phase = 'finish';
    } else if (tile.type === 'collection') {
      let amount = Math.min(this.player.cash, 15 * WON * this.state.multiplier);
      this.player.cash -= amount;
      this.state.fund += amount;
      this.log(`${this.player.name} 기금 ${amount.toLocaleString()}원 납부`, `${this.player.name} contributed ₩${amount.toLocaleString()}`);
      this.state.phase = 'finish';
    } else if (tile.type === 'fund') {
      this.log(`${this.player.name} 기금 ${this.state.fund.toLocaleString()}원 수령`, `${this.player.name} collected ₩${this.state.fund.toLocaleString()} from the fund`);
      this.player.cash += this.state.fund;
      this.state.fund = 0;
      this.state.phase = 'finish';
    } else if (tile.type === 'space') {
      let owner = this.state.properties[32].owner;
      if (freeSpace || owner === null || owner === this.player.id) { this.player.boarded = true; this.state.phase = 'finish'; }
      else this.requestPayment(20 * WON * this.state.multiplier, owner, 'board', '우주여행', 'Space travel', true);
    } else this.state.phase = 'finish';
  }
  /** 빈 땅을 구매하거나 구매를 건너뛰며 같은 턴의 건설은 허용하지 않는다. */
  buy(accept) {
    this.require('buy');
    let index = this.player.position;
    if (accept) {
      let price = BOARD[index].price * this.state.multiplier;
      if (this.state.properties[index].owner !== null || this.player.cash < price) throw new Error('구매할 수 없습니다.');
      this.player.cash -= price;
      this.state.properties[index].owner = this.player.id;
      this.log(`${this.player.name} ${BOARD[index].name} 구매`, `${this.player.name} bought ${BOARD[index].en}`);
    }
    this.state.phase = 'finish';
  }
  /** 건물 한 개를 건설하거나 이번 턴의 건설을 건너뛴다. */
  build(kind) {
    this.require('build');
    if (kind !== null) {
      if (!this.buildOptions().includes(kind)) throw new Error('건설할 수 없습니다.');
      let index = this.player.position;
      this.player.cash -= BOARD[index].costs[kind] * this.state.multiplier;
      this.state.properties[index].buildings[kind]++;
      this.log(`${this.player.name} ${BOARD[index].name} 건물 건설`, `${this.player.name} built in ${BOARD[index].en}`);
    }
    this.state.phase = 'finish';
  }
  /** 지불 의무와 완료 후 진행할 효과를 저장한다. */
  requestPayment(amount, creditor, after, ko, en, passAllowed = false) {
    this.state.debt = { amount, creditor, after, ko, en };
    if (amount > 0 && passAllowed && this.player.cards.includes('pass')) this.state.phase = 'pass';
    else this.settleDebt();
  }
  /** 우대권 사용 시 이용료를 면제하고 이번 턴을 종료한다. */
  usePass(use) {
    this.require('pass');
    if (!use) { this.settleDebt(); return; }
    this.consume('pass');
    if (this.state.debt.after === 'board') this.player.boarded = true;
    this.log(`${this.player.name} 우대권 사용`, `${this.player.name} used a free pass`);
    this.state.debt = null;
    this.state.phase = 'finish';
  }
  /** 현금 또는 매각 가능한 총자산을 확인해 지불, 매각 선택, 패배를 처리한다. */
  settleDebt() {
    let debt = this.state.debt;
    let owned = this.owned();
    let available = this.player.cash;
    // 토지를 통째로 매각했을 때 받을 수 있는 금액을 합산한다.
    for (let index of owned) available += Math.floor(this.value(index) * .7);
    if (this.player.cash >= debt.amount) {
      this.transfer(debt.amount, debt.creditor);
      this.log(`${this.player.name} ${debt.ko} ${debt.amount.toLocaleString()}원 지불`, `${this.player.name} paid ₩${debt.amount.toLocaleString()} for ${debt.en}`);
      this.state.debt = null;
      if (debt.after === 'board') { this.player.boarded = true; this.state.phase = 'finish'; }
      else if (debt.after === 'flight') this.goTo(1);
      else this.state.phase = 'finish';
    } else if (available < debt.amount) {
      // 전부 매각해도 부족하면 남은 자산을 은행에 모두 반환한다.
      for (let index of owned) this.sell(index, .7);
      this.transfer(this.player.cash, debt.creditor);
      this.player.alive = false;
      this.player.boarded = false;
      this.player.island = 0;
      // 패배자가 보관하던 쿠폰을 다시 덱에 돌려놓는다.
      for (let card of this.player.cards) this.state.deck.push(card);
      this.player.cards = [];
      this.log(`${this.player.name} 패배`, `${this.player.name} was eliminated`);
      this.state.debt = null;
      this.state.phase = 'finish';
    } else this.state.phase = 'debt';
  }
  /** 남은 현금에서 지불하고 플레이어 또는 은행에 전달한다. */
  transfer(amount, creditor) { this.player.cash -= amount; if (creditor !== null) this.state.players[creditor].cash += amount; }
  /** 소유 토지와 모든 건물을 은행에 지정 비율로 매각한다. */
  sell(index, ratio) {
    if (this.state.properties[index]?.owner !== this.player.id) throw new Error('본인 소유 토지만 매각할 수 있습니다.');
    let amount = Math.floor(this.value(index) * ratio);
    this.player.cash += amount;
    this.state.properties[index] = { owner: null, buildings: [0, 0, 0] };
    this.log(`${this.player.name} ${BOARD[index].name} 매각`, `${this.player.name} sold ${BOARD[index].en}`);
  }
  /** 지불에 필요한 토지를 매각한 뒤 부족 금액을 다시 확인한다. */
  liquidate(index) { this.require('debt'); this.sell(index, .7); this.settleDebt(); }
  /** 표시가 끝난 쿠폰을 실행하며 이동 쿠폰의 도착 효과도 처리한다. */
  resolveCoupon() {
    this.require('coupon');
    let card = couponById(this.state.currentCard);
    this.state.currentCard = null;
    this.log(`${this.player.name} 쿠폰: ${card.name}`, `${this.player.name} coupon: ${card.en}`);
    if (card.effect === 'hold') { this.player.cards.push(card.id); this.state.phase = 'finish'; return; }
    this.state.pendingCards.push(card.id);
    if (card.effect === 'gain') { this.player.cash += card.amount * WON * this.state.multiplier; this.state.phase = 'finish'; }
    else if (card.effect === 'pay') this.requestPayment(card.amount * WON * this.state.multiplier, null, 'end', card.name, card.en);
    else if (card.effect === 'move') this.goTo(card.target, card.salary !== false);
    else if (card.effect === 'back') this.move(-3, false);
    else if (card.effect === 'invite') {
      this.player.position = 10;
      this.player.boarded = true;
      this.state.phase = 'finish';
    } else if (card.effect === 'flight') {
      let owner = this.state.properties[15].owner;
      if (owner === null || owner === this.player.id) this.goTo(1);
      else this.requestPayment(this.toll(15), owner, 'flight', '콩코드 여객기', 'Concorde', true);
    } else if (card.effect === 'sale') {
      let owned = this.owned();
      owned.sort(/** 토지 구매가가 같으면 보드 순서로 자동 선정한다. */ function compare(a, b) { return BOARD[b].price - BOARD[a].price || a - b; });
      if (owned.length) this.sell(owned[0], .5);
      this.state.phase = 'finish';
    } else if (card.effect === 'tax') {
      let amount = 0;
      // 보유한 모든 토지의 건물을 종류별로 과세한다.
      for (let index of this.owned()) {
        // 세율에 건물 개수와 리그 배율을 적용한다.
        for (let kind = 0; kind < 3; kind++) amount += this.state.properties[index].buildings[kind] * card.rates[kind] * WON * this.state.multiplier;
      }
      this.requestPayment(amount, null, 'end', card.name, card.en);
    }
  }
  /** 턴 완료 후 쿠폰을 반환하고 패배자 제외 및 승리 여부를 판단한다. */
  finishTurn() {
    this.require('finish');
    // 해당 턴에서 효과 이행을 끝낸 쿠폰을 뽑힌 순서대로 반환한다.
    for (let card of this.state.pendingCards) this.state.deck.push(card);
    this.state.pendingCards = [];
    let survivors = this.state.players.filter(/** 생존 플레이어를 찾는다. */ function alive(player) { return player.alive; });
    if (!this.state.players[0].alive || survivors.length === 1) {
      this.state.result = this.state.players[0].alive ? 'win' : 'loss';
      this.state.phase = 'ended';
      return;
    }
    // 패배자는 건너뛰며 다음 생존 플레이어의 차례를 찾는다.
    do { this.state.cursor = (this.state.cursor + 1) % this.state.order.length; } while (!this.player.alive);
    this.state.turn++;
    this.prepareTurn();
  }
  /** 승리 보상으로 현금과 토지 및 건물의 원가를 한 번만 합산한다. */
  reward() {
    if (this.state.result !== 'win') return 0;
    let amount = this.state.players[0].cash;
    // 승리자의 토지와 건물을 100% 가치로 정산한다.
    for (let index of this.owned(0)) amount += this.value(index);
    return amount;
  }
  /** AI가 유동성을 남기면서 빈 땅을 구매할지 판단한다. */
  aiBuy() { return this.player.cash - BOARD[this.player.position].price * this.state.multiplier >= 15 * WON * this.state.multiplier; }
  /** AI가 건설 후 유동성을 유지하며 이용료 대비 비용이 좋은 건물을 고른다. */
  aiBuild() {
    let tile = BOARD[this.player.position];
    let best = null;
    let score = -Infinity;
    // 가능한 건물 중 자금 여유가 있고 수익 비율이 가장 높은 종류를 고른다.
    for (let kind of this.buildOptions()) {
      if (this.player.cash - tile.costs[kind] * this.state.multiplier < 20 * WON * this.state.multiplier) continue;
      let candidate = tile.rents[kind] / tile.costs[kind];
      if (candidate > score) { best = kind; score = candidate; }
    }
    return best;
  }
  /** AI가 매각 가치 대비 통행료 수익이 낮은 토지를 먼저 매각한다. */
  aiSale() {
    let owned = this.owned();
    let engine = this;
    owned.sort(/** 토지의 수익 비율을 비교하고 동률이면 보드 번호를 적용한다. */ function compare(a, b) { return engine.toll(a) / engine.value(a) - engine.toll(b) / engine.value(b) || a - b; });
    return owned[0];
  }
  /** AI가 월급, 기금, 구매 기회 및 통행료를 고려해 우주여행 목적지를 선택한다. */
  aiDestination() {
    let best = 0;
    let bestScore = -Infinity;
    // 모든 칸을 비교하되 무인도와 우주여행 재탑승은 피한다.
    for (let index = 0; index < BOARD.length; index++) {
      let tile = BOARD[index];
      let property = this.state.properties[index];
      let score = index < this.player.position ? 20 * WON * this.state.multiplier : 0;
      if (tile.type === 'island' || tile.type === 'space') continue;
      if (tile.type === 'fund') score += this.state.fund;
      if (tile.type === 'collection') score -= 15 * WON * this.state.multiplier;
      if (tile.price && property.owner === null && this.player.cash + score >= tile.price * this.state.multiplier) score += tile.toll * this.state.multiplier * .6;
      else if (property.owner !== null && property.owner !== this.player.id) score -= this.toll(index);
      else if (property.owner === this.player.id && tile.type === 'city') score += 4 * WON * this.state.multiplier;
      if (score > bestScore) { bestScore = score; best = index; }
    }
    return best;
  }
}

/** localStorage를 다른 저장 구현으로 교체할 수 있도록 감싼 기본 저장소이다. */
export class LocalStorageStore {
  /** 브라우저 저장소 또는 테스트용 저장소를 받는다. */
  constructor(storage = globalThis.localStorage) { this.storage = storage; }
  /** 키의 JSON 값을 읽고 빈 키는 null을 반환한다. */
  read(key) { let value = this.storage.getItem(STORAGE_PREFIX + key); return value === null ? null : JSON.parse(value); }
  /** 지정 키의 값을 JSON으로 저장한다. */
  write(key, value) { this.storage.setItem(STORAGE_PREFIX + key, JSON.stringify(value)); }
  /** 지정 키의 저장 값을 제거한다. */
  remove(key) { this.storage.removeItem(STORAGE_PREFIX + key); }
}

/** 저장 슬롯의 최소 구조와 자산, 소유권 및 쿠폰 보존을 검증한다. */
export function validateProfile(profile) {
  if (!profile || profile.version !== SAVE_VERSION || typeof profile.name !== 'string' || !profile.name.trim() || !Number.isSafeInteger(profile.wallet) || profile.wallet < 0) throw new Error('지원하지 않거나 손상된 저장 데이터입니다.');
  if (profile.game === null) return true;
  let game = profile.game;
  if (!game || !LEAGUES[game.league] || game.multiplier !== LEAGUES[game.league].multiplier || !PHASES.includes(game.phase) || !Array.isArray(game.players) || game.players.length < 2 || game.players.length > 4 || !Array.isArray(game.properties) || game.properties.length !== 40 || !Array.isArray(game.order) || game.order.length !== game.players.length || new Set(game.order).size !== game.players.length || !Number.isInteger(game.cursor) || game.cursor < 0 || game.cursor >= game.order.length || !Number.isSafeInteger(game.fund) || game.fund < 0 || !Array.isArray(game.deck) || !Array.isArray(game.pendingCards) || !Array.isArray(game.logs)) throw new Error('게임 저장 데이터가 손상되었습니다.');
  let cards = [...game.deck, ...game.pendingCards];
  if (game.currentCard) cards.push(game.currentCard);
  // 모든 플레이어의 위치와 돈 및 쿠폰을 확인한다.
  for (let index = 0; index < game.players.length; index++) {
    let player = game.players[index];
    if (player.id !== index || typeof player.name !== 'string' || typeof player.alive !== 'boolean' || typeof player.boarded !== 'boolean' || !Number.isSafeInteger(player.cash) || player.cash < 0 || !Number.isInteger(player.position) || player.position < 0 || player.position >= 40 || !Number.isInteger(player.island) || player.island < 0 || player.island > 3 || !Array.isArray(player.cards) || !game.order.includes(index)) throw new Error('플레이어 저장 데이터가 손상되었습니다.');
    // 보관할 수 없는 쿠폰이 인벤토리에 들어 있는지 검사한다.
    for (let card of player.cards) if (!['pass', 'radio'].includes(card)) throw new Error('보관 쿠폰 데이터가 손상되었습니다.');
    cards.push(...player.cards);
  }
  // 소유권과 건물 개수의 유효 범위를 확인한다.
  for (let index = 0; index < game.properties.length; index++) {
    let property = game.properties[index];
    if (!property || !Array.isArray(property.buildings) || property.buildings.length !== 3 || (property.owner !== null && (!Number.isInteger(property.owner) || !game.players[property.owner]?.alive || !BOARD[index].price))) throw new Error('소유권 데이터가 손상되었습니다.');
    // 일반 도시만 건물을 보유하며 종류별 한도를 지켜야 한다.
    for (let kind = 0; kind < 3; kind++) if (!Number.isInteger(property.buildings[kind]) || property.buildings[kind] < 0 || property.buildings[kind] > BUILD_LIMITS[kind] || ((property.owner === null || BOARD[index].type !== 'city') && property.buildings[kind] > 0)) throw new Error('건물 데이터가 손상되었습니다.');
  }
  if (cards.length !== 55) throw new Error('쿠폰 장수가 일치하지 않습니다.');
  // 쿠폰 종류별 장수가 저장 전후에 보존되는지 확인한다.
  for (let card of COUPONS) if (cards.filter(/** 해당 종류만 세기 위해 비교한다. */ function matches(id) { return id === card.id; }).length !== card.count) throw new Error('쿠폰 구성 데이터가 손상되었습니다.');
  return true;
}

/** 사용자 입력을 HTML에 안전하게 표시한다. */
function escapeHtml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }

/** 지정 시간만큼 애니메이션 또는 화면 표시를 기다린다. */
function delay(milliseconds) { return new Promise(/** 타이머 완료 시 대기를 해제한다. */ function executor(resolve) { setTimeout(resolve, milliseconds); }); }

/** 화면별 메뉴, 저장 및 턴 진행을 조정하는 브라우저 애플리케이션이다. */
export class HellmarbleApp {
  /** 게임을 표시할 요소와 교체 가능한 저장소 및 애니메이션 시간을 받는다. */
  constructor(root, options = {}) {
    if (!root) throw new Error('게임을 표시할 요소가 필요합니다.');
    this.root = root;
    this.root.tabIndex = -1;
    this.storage = options.storage || new LocalStorageStore();
    this.random = options.random || Math.random;
    this.timings = { step: 1000, dice: 120, ai: 850, coupon: 6000, result: 2600, turn: 500, ...options.timings };
    this.settings = { language: 'ko', dark: false };
    this.screen = 'main';
    this.profile = null;
    this.engine = null;
    this.slot = null;
    this.slots = [];
    this.busy = false;
    this.running = false;
    this.disposed = false;
    this.modal = null;
    this.decision = null;
    this.inspected = null;
    this.saveError = false;
    this.notice = null;
    this.rolling = false;
    this.displayDice = [1, 1];
    this.resultSummary = null;
    this.boundClick = this.onClick.bind(this);
    this.boundSubmit = this.onSubmit.bind(this);
    this.boundChange = this.onChange.bind(this);
    this.boundKeydown = this.onKeydown.bind(this);
    try {
      let settings = this.storage.read('settings');
      if (settings && ['ko', 'en'].includes(settings.language) && typeof settings.dark === 'boolean') this.settings = settings;
    } catch { this.notice = this.t('설정을 읽을 수 없습니다. 기본 설정으로 시작합니다.', 'Settings could not be loaded. Using defaults.'); }
    this.root.addEventListener('click', this.boundClick);
    this.root.addEventListener('submit', this.boundSubmit);
    this.root.addEventListener('change', this.boundChange);
    this.root.addEventListener('keydown', this.boundKeydown);
    this.render();
  }
  /** 선택 언어에 맞는 문자열을 반환한다. */
  t(ko, en) { return this.settings.language === 'en' ? en : ko; }
  /** 금액을 선택한 언어의 표시 형식으로 변환한다. */
  money(amount) { return this.settings.language === 'en' ? '₩' + amount.toLocaleString('en-US') : (amount / WON).toLocaleString('ko-KR', { maximumFractionDigits: 4 }) + '만원'; }
  /** 보드 칸 이름을 현재 언어로 표시한다. */
  tileName(index) { return this.t(BOARD[index].name, BOARD[index].en); }
  /** 버튼 마크업을 만들며 현재 잠금 상태를 반영한다. */
  button(action, label, className = '', disabled = false, value = '') { return `<button type="button" class="${className}" data-action="${action}" data-value="${escapeHtml(value)}" ${disabled ? 'disabled' : ''}>${escapeHtml(label)}</button>`; }
  /** 전체 화면을 현재 상태에 맞춰 그린다. */
  render() {
    if (this.disposed) return;
    let focused = this.root.contains(document.activeElement) ? document.activeElement : null;
    let focusedAction = focused?.dataset?.action;
    let focusedValue = focused?.dataset?.value;
    let focusedId = focused?.id;
    document.documentElement.lang = this.settings.language;
    document.documentElement.dataset.theme = this.settings.dark ? 'dark' : 'light';
    let content = '';
    if (this.screen === 'main') content = this.mainScreen();
    else if (this.screen === 'slots') content = this.slotScreen();
    else if (this.screen === 'nickname') content = this.nicknameScreen();
    else if (this.screen === 'lobby') content = this.lobbyScreen();
    else if (this.screen === 'settings') content = this.settingsScreen();
    else if (this.screen === 'game') content = this.gameScreen();
    else if (this.screen === 'result') content = this.resultScreen();
    this.root.innerHTML = `<header class="topbar"><span class="wordmark">HELL<span>MARBLE</span><i>●</i></span><span class="top-note">${this.t('한 바퀴의 여행, 한 번의 선택', 'A journey. A choice. Your empire.')}</span><span class="edition">BOARD GAME / 01</span></header><main>${content}</main><footer>HELLMARBLE <span>·</span> ${this.t('주사위 두 개로 시작하는 세계 여행', 'Your world tour begins with two dice')}</footer>${this.notice ? `<div class="notice" role="status">${escapeHtml(this.notice)} ${this.button('dismiss', '×', 'quiet')}</div>` : ''}${this.saveError ? `<div class="save-error" role="alert">${this.t('저장하지 못했습니다. 저장소를 확인한 후 다시 시도하세요.', 'Save failed. Check your storage and retry.')} ${this.button('retry-save', this.t('다시 저장', 'Retry save'))}</div>` : ''}${this.modalMarkup()}`;
    if (this.modal) this.root.querySelector('.modal button, .modal input')?.focus();
    else if (focusedId) this.root.querySelector(`#${CSS.escape(focusedId)}`)?.focus({ preventScroll: true });
    else if (focusedAction) {
      let next = this.root.querySelector(`[data-action="${CSS.escape(focusedAction)}"][data-value="${CSS.escape(focusedValue || '')}"]:not(:disabled)`);
      (next || this.root).focus({ preventScroll: true });
    } else if (this.screen === 'game') this.root.focus({ preventScroll: true });
  }
  /** 시작 화면의 세 가지 필수 메뉴를 표시한다. */
  mainScreen() {
    return `<section class="hero"><div class="hero-copy"><span class="eyebrow">ROLL. TRAVEL. BUILD.</span><h1>${this.t('당신의 다음 한 수는?', 'Where will you land?')}</h1><p>${this.t('도시를 사고, 호텔을 짓고, 세계를 여행하세요.<br>마지막까지 살아남는 당신의 이야기가 시작됩니다.', 'Buy cities, build hotels, and travel the world.<br>Your journey to be the last player standing starts here.')}</p><div class="menu-actions">${this.button('new', this.t('게임 시작', 'New game'), 'primary')}${this.button('load', this.t('불러오기', 'Load game'))}${this.button('settings', this.t('설정', 'Settings'), 'quiet')}</div><div class="hero-facts"><span>2–4 ${this.t('플레이어', 'PLAYERS')}</span><span>40 ${this.t('개의 목적지', 'DESTINATIONS')}</span><span>3 ${this.t('개의 리그', 'LEAGUES')}</span></div></div><div class="hero-art" aria-hidden="true"><div class="orbit"><span class="mini-city c1">SEOUL</span><span class="mini-city c2">PARIS</span><span class="mini-city c3">TAIPEI</span><span class="mini-city c4">NEW YORK</span><div class="art-center"><span class="art-dice">⚄</span><span class="art-dice second">⚂</span><strong>THE WORLD<br>IS YOUR BOARD.</strong></div></div></div></section>`;
  }
  /** 새 게임 또는 불러오기용 저장 슬롯 목록을 표시한다. */
  slotScreen() {
    let cards = '';
    // 세 저장 슬롯을 같은 구조로 표시한다.
    for (let index = 0; index < 3; index++) {
      let slot = this.slots[index];
      let description = slot?.corrupt ? this.t('읽을 수 없는 저장 데이터', 'Unreadable save data') : slot ? `${escapeHtml(slot.name)}<br>${this.money(slot.wallet)} · ${slot.game ? this.t('게임 진행 중', 'Game in progress') : this.t('대기실', 'Lobby')}` : this.t('비어 있는 슬롯', 'Empty slot');
      cards += `<article class="slot-card"><span class="eyebrow">SAVE / 0${index + 1}</span><h2>${this.t('슬롯', 'Slot')} ${index + 1}</h2><p>${description}</p>${this.button('select-slot', this.slotMode === 'new' ? this.t('이 슬롯에 시작', 'Start here') : this.t('불러오기', 'Load'), 'primary', this.slotMode === 'load' && (!slot || slot.corrupt), index)}</article>`;
    }
    return `<section class="page"><span class="eyebrow">YOUR JOURNEY</span><h1>${this.slotMode === 'new' ? this.t('저장할 곳을 선택하세요', 'Choose a save slot') : this.t('여행을 이어가세요', 'Continue your journey')}</h1><div class="slot-grid">${cards}</div>${this.button('main', this.t('메인 메뉴', 'Main menu'), 'quiet')}</section>`;
  }
  /** 새 프로필의 이름을 입력받는 화면을 표시한다. */
  nicknameScreen() { return `<section class="page narrow"><span class="eyebrow">PLAYER / 01</span><h1>${this.t('어떤 이름으로 떠날까요?', 'What should we call you?')}</h1><form data-form="nickname"><label for="nickname">${this.t('이름 / 닉네임', 'Name / nickname')}</label><input id="nickname" name="nickname" maxlength="24" required autocomplete="nickname" placeholder="${this.t('최대 24자', 'Up to 24 characters')}"><p>${this.t('대기실 자금 2,000만원으로 시작합니다.', 'Start with ₩20,000,000 in your lobby wallet.')}</p><button class="primary" type="submit">${this.t('대기실로 이동', 'Enter lobby')}</button></form>${this.button('main', this.t('메인 메뉴', 'Main menu'), 'quiet')}</section>`; }
  /** 대기실 잔액과 세 가지 리그를 표시한다. */
  lobbyScreen() {
    let cards = '';
    // 리그별 참가비와 배율을 같은 카드 형식으로 표시한다.
    for (let key of Object.keys(LEAGUES)) {
      let league = LEAGUES[key];
      let fee = 300 * WON * league.multiplier;
      cards += `<article class="league-card ${key}"><span class="league-dot"></span><span class="eyebrow">LEAGUE / ×${league.multiplier}</span><h2>${league.name}</h2><p>${this.t('더 큰 도시, 더 큰 기회.', 'Bigger stakes. Bigger possibilities.')}</p><div class="league-fee"><small>${this.t('참가비 / 시작 자금', 'Entry / starting cash')}</small><strong>${this.money(fee)}</strong></div>${this.button('league', this.t('리그 참여', 'Join league'), 'primary', this.saveError, key)}<small>${this.t('사용자 1명 + AI 1~3명', 'You + 1–3 AI players')}</small></article>`;
    }
    return `<section class="page"><div class="page-heading"><div><span class="eyebrow">PLAYER LOUNGE</span><h1>${escapeHtml(this.profile.name)}${this.t('님의 대기실', "’s lounge")}</h1><p>${this.t('오늘은 어떤 리그에 도전할까요?', 'Choose your next challenge.')}</p></div><div class="wallet"><small>${this.t('대기실 잔액', 'Lobby wallet')}</small><strong>${this.money(this.profile.wallet)}</strong></div></div><div class="league-grid">${cards}</div>${this.profile.wallet < 300 * WON ? `<p class="warning">${this.t('참가비가 부족합니다. 새 저장 슬롯에서 다시 시작할 수 있습니다.', 'Insufficient funds. You can start again in a new save slot.')}</p>` : ''}${this.button('main', this.t('메인 메뉴', 'Main menu'), 'quiet')}</section>`;
  }
  /** 언어 및 다크 모드 선택 화면을 표시한다. */
  settingsScreen() { return `<section class="page narrow"><span class="eyebrow">MAKE IT YOURS</span><h1>${this.t('설정', 'Settings')}</h1><div class="settings-card"><label for="language">${this.t('언어', 'Language')}</label><select id="language" name="language"><option value="ko" ${this.settings.language === 'ko' ? 'selected' : ''}>한국어</option><option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option></select><label class="toggle" for="dark"><span>${this.t('다크 모드', 'Dark mode')}</span><input id="dark" name="dark" type="checkbox" ${this.settings.dark ? 'checked' : ''}></label><p>${this.t('설정은 자동 저장됩니다.', 'Settings are saved automatically.')}</p></div>${this.button('main', this.t('메인 메뉴', 'Main menu'), 'quiet')}</section>`; }
  /** 보드 번호에 대응하는 11칸 정사각 격자의 위치를 계산한다. */
  tilePosition(index) {
    if (index <= 10) return [11, 11 - index];
    if (index <= 20) return [21 - index, 1];
    if (index <= 30) return [1, index - 19];
    return [index - 29, 11];
  }
  /** 플레이어 고유 문양을 접근 가능한 이름과 함께 표시한다. */
  token(player, small = false) { return `<span class="token ${small ? 'small' : ''}" style="--token:${TOKENS[player.id].color}" title="${escapeHtml(player.name)}" aria-label="${escapeHtml(player.name)}">${TOKENS[player.id].shape}</span>`; }
  /** 보드 전체와 차례, 잔액, 진행 기록 및 조작부를 표시한다. */
  gameScreen() {
    let game = this.engine.state;
    let human = this.engine.player.id === 0;
    let unlocked = !this.busy && !this.saveError;
    let travel = game.phase === 'travel' && human && unlocked;
    let tiles = '';
    // 전체 보드 가장자리에 칸과 말 및 건물 개수를 표시한다.
    for (let index = 0; index < BOARD.length; index++) {
      let tile = BOARD[index];
      let property = game.properties[index];
      let position = this.tilePosition(index);
      let tokens = '';
      // 같은 칸에 있는 생존 플레이어의 문양을 모두 표시한다.
      for (let player of game.players) if (player.alive && player.position === index) tokens += this.token(player, true);
      let owner = property.owner === null ? '' : `--owner:${TOKENS[property.owner].color};`;
      let buildings = property.buildings.some(/** 건물 존재 여부를 확인한다. */ function positive(value) { return value > 0; }) ? `<span class="tile-buildings">${property.buildings[0] ? '⌂'.repeat(property.buildings[0]) : ''}${property.buildings[1] ? '▥' : ''}${property.buildings[2] ? '♜' : ''}</span>` : '';
      tiles += `<button type="button" class="tile ${tile.color} ${[0, 10, 20, 30].includes(index) ? 'corner' : ''} ${property.owner !== null ? 'owned' : ''} ${this.inspected === index ? 'selected' : ''} ${travel ? 'destination' : ''}" style="grid-row:${position[0]};grid-column:${position[1]};${owner}" data-action="${travel ? 'destination' : 'inspect'}" data-value="${index}" ${!unlocked ? 'disabled' : ''} aria-label="${escapeHtml(this.tileName(index))}${property.owner !== null ? ', ' + escapeHtml(game.players[property.owner].name) : ''}${tokens ? ', ' + this.t('플레이어 위치', 'Occupied') : ''}"><span class="tile-name">${escapeHtml(this.tileName(index))}</span>${tile.price ? `<small>${this.money(tile.price * game.multiplier)}</small>` : `<small>${{ start: '↻', coupon: '?', space: '↗', island: '⚓', fund: '＋', collection: '−' }[tile.type]}</small>`}${buildings}<span class="tile-tokens">${tokens}</span></button>`;
    }
    let players = '';
    // 보드 옆에 생존 여부와 자산, 보관 쿠폰을 표시한다.
    for (let player of game.players) {
      let current = player.id === this.engine.player.id;
      let cardText = '';
      // 보관 쿠폰의 이름을 표시한다.
      for (let card of player.cards) cardText += `<span class="inventory">${this.t(couponById(card).name, couponById(card).en)}</span>`;
      players += `<article class="player-card ${current ? 'current' : ''} ${!player.alive ? 'eliminated' : ''}"><div class="player-heading">${this.token(player)}<strong>${escapeHtml(player.name)}</strong><small>${player.id === 0 ? this.t('사용자', 'YOU') : 'AI'}</small></div><strong class="player-cash">${player.alive ? this.money(player.cash) : this.t('패배', 'Eliminated')}</strong><div class="player-meta">${player.alive ? `${this.tileName(player.position)} · ${this.t('소유', 'Properties')} ${this.engine.owned(player.id).length}` : ''}</div><div class="player-cards">${cardText}${player.boarded ? `<span class="inventory">${this.t('탑승 중', 'Boarded')}</span>` : ''}${player.island ? `<span class="inventory">${this.t('무인도', 'Island')} ${4 - player.island}/3</span>` : ''}</div></article>`;
    }
    let dice = this.rolling ? this.displayDice : game.dice;
    let rollEnabled = unlocked && human && game.phase === 'ready';
    let menuEnabled = unlocked && human && ['ready', 'travel'].includes(game.phase);
    let status = travel ? this.t('이동할 칸을 선택하세요', 'Choose a destination on the board') : this.busy ? this.t('게임 진행 중', 'Turn in progress') : `${this.engine.player.name}${this.t('님의 차례', "’s turn")}`;
    let logs = '';
    // 최근 기록을 최신 항목부터 표시한다.
    for (let log of game.logs.slice(-8).reverse()) logs += `<li>${escapeHtml(this.t(log.ko, log.en))}</li>`;
    return `<section class="game-page"><div class="game-heading"><div><span class="eyebrow">${LEAGUES[game.league].name.toUpperCase()} LEAGUE / ×${game.multiplier}</span><h1>${this.t('세계 일주', 'Around the world')}</h1></div><div class="turn-badge">${this.t('턴', 'TURN')} ${game.turn}</div></div><div class="game-layout"><div class="board" aria-label="${this.t('전체 보드', 'Game board')}">${tiles}<div class="board-center"><span class="eyebrow">HELLMARBLE</span><h2>${escapeHtml(this.engine.player.name)}</h2><p class="turn-status" aria-live="polite">${escapeHtml(status)}</p><div class="dice ${this.rolling ? 'rolling' : ''}"><span>${['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice[0]]}</span><span>${['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice[1]]}</span></div>${this.button('roll', this.t('주사위 굴리기', 'Roll dice'), 'primary roll-button', !rollEnabled)}<div class="fund-display"><small>${this.t('사회복지기금', 'Welfare fund')}</small><strong>${this.money(game.fund)}</strong></div><div class="board-help">${this.t('칸을 클릭하면 상세 정보를 볼 수 있습니다.', 'Click a space to see its details.')}</div>${this.button('leave', this.t('저장 후 메인 메뉴', 'Save & main menu'), 'quiet', !menuEnabled)}</div>${this.inspected !== null && !this.busy ? `<div class="tile-details">${this.button('close-inspect', '×', 'close-detail')}<h2>${escapeHtml(this.tileName(this.inspected))}</h2>${this.assetDetails(this.inspected)}</div>` : ''}</div><aside class="game-sidebar"><div class="player-list">${players}</div><section class="activity"><span class="eyebrow">${this.t('진행 기록', 'ACTIVITY')}</span><ol>${logs}</ol></section></aside></div></section>`;
  }
  /** 소유자, 토지 가격, 건설비 및 모든 이용료를 상세히 표시한다. */
  assetDetails(index) {
    let tile = BOARD[index];
    let game = this.engine.state;
    let property = game.properties[index];
    let owner = property.owner === null ? this.t('은행 / 미소유', 'Bank / unowned') : game.players[property.owner].name;
    if (!tile.price) {
      let descriptions = {
        start: this.t(`전진 통과 또는 도착 시 월급 ${this.money(20 * WON * game.multiplier)}`, `Collect ${this.money(20 * WON * game.multiplier)} when passing or arriving while moving forward.`),
        coupon: this.t('쿠폰 한 장을 뽑아 내용을 이행합니다. 우대권과 무전기는 보관합니다.', 'Draw and resolve one coupon. Keep free passes and radios.'),
        space: this.t('다음 자기 턴에 원하는 칸으로 이동합니다. 다른 콜롬비아 호 소유자가 있으면 이용료를 냅니다.', 'Choose any destination next turn. Pay the Columbia owner if owned by another player.'),
        island: this.t('두 턴 동안 더블로 탈출을 시도합니다. 세 번째 턴에는 자동으로 탈출합니다.', 'Roll doubles to escape for two turns. Automatically escape on your third turn.'),
        fund: this.t('쌓인 사회복지기금을 전부 받습니다.', 'Collect the entire welfare fund.'),
        collection: this.t(`${this.money(15 * WON * game.multiplier)}을 기금에 냅니다. 부족하면 남은 현금만 내며 패배하지 않습니다.`, `Contribute ${this.money(15 * WON * game.multiplier)} to the fund, or your remaining cash. No liquidation or elimination.`)
      };
      return `<p>${escapeHtml(descriptions[tile.type])}</p>`;
    }
    let rows = `<tr><th>${this.t('소유자', 'Owner')}</th><td>${escapeHtml(owner)}</td></tr><tr><th>${this.t('땅 구매', 'Land purchase')}</th><td>${this.money(tile.price * game.multiplier)}</td></tr><tr><th>${this.t('기본 통행료', 'Base toll')}</th><td>${this.money(tile.toll * game.multiplier)}</td></tr>`;
    // 일반 도시의 건물별 건설 비용 및 개별 이용료를 표시한다.
    for (let kind = 0; kind < tile.costs.length; kind++) rows += `<tr><th>${this.buildingName(kind)} ${this.t('건설 / 이용료', 'cost / rent')}</th><td>${this.money(tile.costs[kind] * game.multiplier)} / ${this.money(tile.rents[kind] * game.multiplier)}<small>${this.t('보유', 'Built')} ${property.buildings[kind]}/${BUILD_LIMITS[kind]}</small></td></tr>`;
    if (index === 32) rows += `<tr><th>${this.t('우주여행 이용료', 'Space travel fee')}</th><td>${this.money(20 * WON * game.multiplier)}</td></tr>`;
    rows += `<tr class="total"><th>${this.t('현재 총 통행료', 'Current total toll')}</th><td>${this.money(this.engine.toll(index))}</td></tr>`;
    return `<table class="asset-table"><tbody>${rows}</tbody></table>${tile.type !== 'city' ? `<p>${this.t('이 땅에는 건물을 지을 수 없습니다.', 'Buildings cannot be constructed here.')}</p>` : `<p>${this.t('통행료와 모든 건물 이용료를 합산합니다.', 'Tolls include the base fee and every building’s rent.')}</p>`}`;
  }
  /** 건물 종류를 선택 언어로 표시한다. */
  buildingName(kind) { return this.t(['별장', '빌딩', '호텔'][kind], ['Villa', 'Building', 'Hotel'][kind]); }
  /** 게임 결과와 한 번 정산한 보상 및 잔액을 표시한다. */
  resultScreen() { return `<section class="page result"><span class="result-symbol">${this.resultSummary.result === 'win' ? '♛' : '◇'}</span><span class="eyebrow">${this.resultSummary.result === 'win' ? 'VICTORY' : 'NEXT TIME'}</span><h1>${this.resultSummary.result === 'win' ? this.t('당신의 세계가 완성됐습니다', 'The world is yours') : this.t('다음 여행을 기약하며', 'Until your next journey')}</h1><p>${this.t('정산 금액', 'Settlement')} ${this.money(this.resultSummary.reward)}</p><p>${this.t('대기실 잔액', 'Lobby wallet')} ${this.money(this.profile.wallet)}</p><small>${this.t('잠시 후 대기실로 돌아갑니다.', 'Returning to the lobby shortly.')}</small></section>`; }
  /** 사용자 결정 또는 쿠폰 표시용 모달을 구성한다. */
  modalMarkup() {
    if (!this.modal) return '';
    let buttons = '';
    // 결정 가능한 항목만 버튼으로 표시하며 쿠폰 표시 중에는 버튼을 만들지 않는다.
    for (let choice of this.modal.choices || []) buttons += this.button('choice', choice.label, choice.primary ? 'primary' : '', false, choice.value);
    return `<div class="modal-backdrop"><section class="modal ${this.modal.coupon ? 'coupon-modal' : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><span class="eyebrow">${this.modal.coupon ? 'SECRET COUPON' : 'YOUR CHOICE'}</span><h2 id="modal-title">${escapeHtml(this.modal.title)}</h2><div class="modal-body">${this.modal.body}</div>${this.modal.coupon ? `<div class="coupon-timer" style="--duration:${this.timings.coupon}ms"></div><small>${this.t('6초 동안 표시 후 적용됩니다.', 'Resolves after six seconds.')}</small>` : `<div class="modal-actions">${buttons}</div>`}</section></div>`;
  }
  /** 화면에 선택지를 표시하고 사용자의 결정을 기다린다. */
  choose(title, body, choices) {
    let app = this;
    return new Promise(/** 사용자 결정의 완료 콜백을 보관한다. */ function executor(resolve) { app.decision = resolve; app.modal = { title, body, choices }; app.render(); });
  }
  /** 저장 슬롯 목록을 읽고 손상된 슬롯은 덮어쓰기 가능한 상태로 표시한다. */
  readSlots(mode) {
    this.slotMode = mode;
    this.slots = [];
    // 저장 슬롯을 개별로 검사해 한 슬롯의 오류가 나머지를 막지 않게 한다.
    for (let index = 0; index < 3; index++) {
      try { let profile = this.storage.read(`slot${index}`); if (profile) validateProfile(profile); this.slots.push(profile); }
      catch { this.slots.push({ corrupt: true }); }
    }
    this.screen = 'slots';
    this.render();
  }
  /** 현재 프로필을 단일 쓰기로 저장하고 실패한 경우 진행을 중지한다. */
  persist() {
    this.failedSaveKind = 'profile';
    try {
      this.profile.updatedAt = new Date().toISOString();
      validateProfile(this.profile);
      this.storage.write(`slot${this.slot}`, this.profile);
      this.saveError = false;
      return true;
    } catch { this.saveError = true; this.render(); return false; }
  }
  /** 메뉴와 보드 및 모달의 클릭을 처리한다. */
  async onClick(event) {
    let button = event.target.closest('button[data-action]');
    if (!button || !this.root.contains(button) || button.disabled) return;
    let action = button.dataset.action;
    let value = button.dataset.value;
    if (action === 'choice') {
      if (!this.decision) return;
      let resolve = this.decision;
      this.decision = null;
      this.modal = null;
      resolve(value);
      return;
    }
    if (this.modal) return;
    if (action === 'dismiss') { this.notice = null; this.render(); return; }
    if (action === 'retry-save') {
      if (this.failedSaveKind === 'settings' ? this.saveSettings() : this.persist()) {
        if (this.screen === 'nickname' || this.screen === 'result') this.screen = 'lobby';
        this.render();
        if (this.screen === 'game') await this.drive();
      }
      return;
    }
    if (this.busy) return;
    if (action === 'new' || action === 'load') { this.readSlots(action); return; }
    if (action === 'settings') { this.screen = 'settings'; this.render(); return; }
    if (action === 'main') {
      if (this.screen === 'lobby' && !this.persist()) return;
      this.screen = 'main';
      this.saveError = false;
      this.render();
      return;
    }
    if (action === 'select-slot') {
      let index = Number(value);
      if (this.slotMode === 'new') {
        if (this.slots[index]) {
          let decision = await this.choose(this.t('저장 데이터를 덮어쓸까요?', 'Overwrite this save?'), `<p>${this.t('기존 프로필과 진행 중인 게임이 삭제됩니다.', 'The existing profile and game will be replaced.')}</p>`, [{ value: 'no', label: this.t('취소', 'Cancel') }, { value: 'yes', label: this.t('덮어쓰기', 'Overwrite'), primary: true }]);
          if (decision !== 'yes') { this.render(); return; }
        }
        this.slot = index;
        this.screen = 'nickname';
        this.render();
        this.root.querySelector('#nickname')?.focus();
      } else {
        this.slot = index;
        this.profile = copy(this.slots[index]);
        this.saveError = false;
        this.engine = this.profile.game ? new GameEngine(this.profile.game, this.random) : null;
        this.screen = this.engine ? 'game' : 'lobby';
        this.render();
        if (this.engine) await this.drive();
      }
      return;
    }
    if (action === 'league') {
      let fee = 300 * WON * LEAGUES[value].multiplier;
      if (this.profile.wallet < fee) { this.notice = this.t('리그 참가비가 부족합니다.', 'Insufficient funds for this league.'); this.render(); return; }
      let decision = await this.choose(this.t('리그에 참여할까요?', 'Join this league?'), `<p>${LEAGUES[value].name} · ${this.t('참가비', 'Entry fee')} ${this.money(fee)}</p><p>${this.t('패배하면 참가비를 잃습니다.', 'The entry fee is lost if you are eliminated.')}</p>`, [{ value: 'no', label: this.t('취소', 'Cancel') }, { value: 'yes', label: this.t('게임 시작', 'Start game'), primary: true }]);
      if (decision !== 'yes') { this.render(); return; }
      let previous = copy(this.profile);
      this.profile.wallet -= fee;
      this.profile.game = createGame(this.profile.name, value, this.random);
      this.engine = new GameEngine(this.profile.game, this.random);
      if (!this.persist()) { this.profile = previous; this.engine = null; this.render(); return; }
      this.screen = 'game';
      this.inspected = null;
      this.render();
      await this.drive();
      return;
    }
    if (action === 'leave') {
      if (this.screen !== 'game' || this.engine.player.id !== 0 || !['ready', 'travel'].includes(this.engine.state.phase)) return;
      if (this.persist()) { this.screen = 'main'; this.inspected = null; this.render(); }
      return;
    }
    if (action === 'inspect') { this.inspected = this.inspected === Number(value) ? null : Number(value); this.render(); return; }
    if (action === 'close-inspect') { this.inspected = null; this.render(); return; }
    if (action === 'destination') { this.inspected = null; this.engine.travel(Number(value)); await this.drive(); return; }
    if (action === 'roll') {
      if (this.engine.player.id !== 0 || this.engine.state.phase !== 'ready' || this.saveError) return;
      this.inspected = null;
      this.busy = true;
      await this.animateDice();
      if (this.disposed) return;
      this.engine.roll();
      this.busy = false;
      await this.drive();
    }
  }
  /** 닉네임 입력을 검사하고 새 프로필을 저장한다. */
  onSubmit(event) {
    if (event.target.dataset.form !== 'nickname') return;
    event.preventDefault();
    let name = new FormData(event.target).get('nickname').trim().slice(0, 24);
    if (!name) { this.notice = this.t('이름을 입력하세요.', 'Enter a name.'); this.render(); return; }
    this.profile = { version: SAVE_VERSION, name, wallet: 2000 * WON, game: null, updatedAt: null };
    if (this.persist()) { this.screen = 'lobby'; this.render(); }
  }
  /** 언어 및 다크 모드 변경을 즉시 저장한다. */
  onChange(event) {
    if (this.screen !== 'settings') return;
    if (event.target.name === 'language') this.settings.language = event.target.value;
    if (event.target.name === 'dark') this.settings.dark = event.target.checked;
    this.saveSettings();
    this.render();
  }
  /** 설정을 저장하고 저장소 오류를 사용자에게 알린다. */
  saveSettings() { this.failedSaveKind = 'settings'; try { this.storage.write('settings', this.settings); this.saveError = false; return true; } catch { this.saveError = true; return false; } }
  /** 모달 안에 키보드 초점을 유지하고 상세 정보의 닫기를 지원한다. */
  onKeydown(event) {
    if (this.modal && event.key === 'Tab') {
      let buttons = this.root.querySelectorAll('.modal button:not(:disabled)');
      if (!buttons.length) { event.preventDefault(); return; }
      let first = buttons[0];
      let last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    } else if (!this.modal && event.key === 'Escape' && this.inspected !== null) { this.inspected = null; this.render(); }
  }
  /** 두 주사위가 굴러가는 모습을 보여주며 조작을 잠근다. */
  async animateDice() {
    this.rolling = true;
    // 실제 결과와 별개인 장식용 눈을 짧은 간격으로 표시한다.
    for (let frame = 0; frame < 7; frame++) { this.displayDice = dicePair(); this.render(); await delay(this.timings.dice); }
    this.rolling = false;
  }
  /** AI와 효과 처리 단계를 진행하다가 사용자 주사위 또는 목적지 선택에서 멈춘다. */
  async drive() {
    if (this.running || this.disposed || this.saveError) return;
    this.running = true;
    this.busy = true;
    this.inspected = null;
    try {
      // 사용자 결정이 필요한 단계까지 진행하되 각 단계는 저장 가능한 상태로 유지한다.
      while (!this.disposed && this.screen === 'game') {
        let engine = this.engine;
        let game = engine.state;
        let human = engine.player.id === 0;
        if ((game.phase === 'ready' || game.phase === 'travel') && human) break;
        this.render();
        if (game.phase === 'ready') { await delay(this.timings.ai); if (this.disposed) break; await this.animateDice(); if (this.disposed) break; engine.roll(); }
        else if (game.phase === 'radio') {
          let choice = human ? await this.choose(this.t('무전기를 사용할까요?', 'Use your radio?'), `<p>${this.t('무인도에서 즉시 탈출한 뒤 주사위를 굴립니다.', 'Escape the island immediately, then roll the dice.')}</p>`, [{ value: 'no', label: this.t('보관', 'Keep it') }, { value: 'yes', label: this.t('사용', 'Use'), primary: true }]) : (engine.player.island > 1 ? 'yes' : 'no');
          if (this.disposed) break;
          engine.useRadio(choice === 'yes');
        } else if (game.phase === 'travel') { await delay(this.timings.ai); engine.travel(engine.aiDestination()); }
        else if (game.phase === 'move') { await delay(this.timings.step); if (this.disposed) break; engine.step(); }
        else if (game.phase === 'land') engine.land();
        else if (game.phase === 'buy') {
          let choice;
          if (human) choice = await this.choose(this.tileName(engine.player.position), this.assetDetails(engine.player.position) + `<p>${this.t('보유 현금', 'Available cash')} ${this.money(engine.player.cash)}</p>`, [{ value: 'no', label: this.t('구매하지 않기', 'Skip') }, { value: 'yes', label: this.t('땅 구매', 'Buy land'), primary: true }]);
          else { await delay(this.timings.ai); choice = engine.aiBuy() ? 'yes' : 'no'; }
          if (this.disposed) break;
          engine.buy(choice === 'yes');
        } else if (game.phase === 'build') {
          let kind = null;
          if (human) {
            let choices = [{ value: 'skip', label: this.t('건설하지 않기', 'Skip construction') }];
            // 한 턴에 선택할 수 있는 건물 종류를 각각 하나의 버튼으로 표시한다.
            for (let option of engine.buildOptions()) choices.push({ value: String(option), label: `${this.buildingName(option)} · ${this.money(BOARD[engine.player.position].costs[option] * game.multiplier)}`, primary: true });
            let choice = await this.choose(this.t('건물을 건설할까요?', 'Build here?'), this.assetDetails(engine.player.position) + `<p>${this.t('보유 현금', 'Available cash')} ${this.money(engine.player.cash)}</p>`, choices);
            kind = choice === 'skip' ? null : Number(choice);
          } else { await delay(this.timings.ai); kind = engine.aiBuild(); }
          if (this.disposed) break;
          engine.build(kind);
        } else if (game.phase === 'pass') {
          let choice = human ? await this.choose(this.t('우대권을 사용할까요?', 'Use a free pass?'), `<p>${escapeHtml(this.t(game.debt.ko, game.debt.en))} · ${this.money(game.debt.amount)}</p><p>${this.t('이용료를 면제하고 이번 턴을 종료합니다.', 'Waive the fee and end this turn.')}</p>`, [{ value: 'no', label: this.t('지불', 'Pay') }, { value: 'yes', label: this.t('우대권 사용', 'Use free pass'), primary: true }]) : (game.debt.amount >= 10 * WON * game.multiplier || engine.player.cash < game.debt.amount ? 'yes' : 'no');
          if (this.disposed) break;
          engine.usePass(choice === 'yes');
        } else if (game.phase === 'debt') {
          let index;
          if (human) {
            let choices = [];
            // 매각 가능한 토지만 보여주고 건물까지 합산한 70% 금액을 안내한다.
            for (let owned of engine.owned()) choices.push({ value: String(owned), label: `${this.tileName(owned)} · ${this.money(Math.floor(engine.value(owned) * .7))}` });
            let choice = await this.choose(this.t('지불을 위해 땅을 매각하세요', 'Sell land to make the payment'), `<p>${escapeHtml(this.t(game.debt.ko, game.debt.en))}: ${this.money(game.debt.amount)}</p><p>${this.t('보유 현금', 'Available cash')}: ${this.money(engine.player.cash)}<br>${this.t('부족 금액', 'Shortfall')}: ${this.money(game.debt.amount - engine.player.cash)}</p><p>${this.t('토지와 모든 건물을 함께 70% 가치로 매각합니다.', 'Land and all its buildings are sold together at 70% of cost.')}</p>`, choices);
            index = Number(choice);
          } else { await delay(this.timings.ai); index = engine.aiSale(); }
          if (this.disposed) break;
          engine.liquidate(index);
        } else if (game.phase === 'coupon') {
          let card = couponById(game.currentCard);
          this.modal = { title: this.t(card.name, card.en), body: `<p>${escapeHtml(this.t(card.text, card.english))}</p><p class="coupon-multiplier">${this.t('금액 적용 배율', 'Money multiplier')} ×${game.multiplier}</p>`, coupon: true };
          this.render();
          await delay(this.timings.coupon);
          if (this.disposed) break;
          this.modal = null;
          engine.resolveCoupon();
        } else if (game.phase === 'finish') {
          await delay(this.timings.turn);
          if (this.disposed) break;
          engine.finishTurn();
          if (game.phase !== 'ended' && !this.persist()) break;
        } else if (game.phase === 'ended') {
          this.resultSummary = { result: game.result, reward: engine.reward() };
          this.profile.wallet += this.resultSummary.reward;
          this.profile.game = null;
          this.screen = 'result';
          this.engine = null;
          if (!this.persist()) break;
          this.render();
          await delay(this.timings.result);
          if (this.disposed) break;
          this.screen = 'lobby';
          break;
        }
      }
    } catch (error) { this.notice = this.t('진행 오류: ', 'Game error: ') + error.message; }
    finally { this.running = false; this.busy = false; this.render(); }
  }
  /** 이벤트 연결을 해제해 다른 호스트에서 앱을 안전하게 종료한다. */
  destroy() {
    this.disposed = true;
    this.root.removeEventListener('click', this.boundClick);
    this.root.removeEventListener('submit', this.boundSubmit);
    this.root.removeEventListener('change', this.boundChange);
    this.root.removeEventListener('keydown', this.boundKeydown);
    if (this.decision) { this.decision(null); this.decision = null; }
  }
}

/** HTML에서 명시적으로 호출할 때만 게임 화면을 초기화한다. */
export function initializeHellmarble(root, options = {}) { return new HellmarbleApp(root, options); }
