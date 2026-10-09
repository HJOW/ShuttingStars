/**
 * @file Hellmarble : 웹으로 즐기는 보드게임의 주 구현 파일이다.
 * 게임 데이터, 규칙 엔진, 인공지능, 저장소 추상화, 화면 구성과 화면의 모양(스타일시트)을 모두 이 파일에서 제공한다.
 * 이 파일은 스스로 게임을 초기화하지 않으므로, HTML 에서 initHellmarble() 을 호출해야 한다.
 * @author HJOW
 * @copyright 2026 HJOW
 * @license Apache-2.0
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* ==========================================================================
 * 1. 기본 상수
 * ========================================================================== */

/**
 * 보드 전체 칸(땅)의 수이다.
 * @type {number}
 */
export const BOARD_SIZE = 40;
/**
 * 게임 시작 시 각 플레이어가 받는 기본 금액(원)이다. 리그 배율이 곱해진다.
 * @type {number}
 */
export const START_CASH = 3000000;
/**
 * 출발지를 지나거나 출발지에 멈출 때 받는 기본 월급(원)이다.
 * @type {number}
 */
export const SALARY = 200000;
/**
 * 사회복지기금 접수처에서 내는 기본 금액(원)이다.
 * @type {number}
 */
export const WELFARE_FEE = 150000;
/**
 * 콜롬비아 호 소유자에게 내는 우주여행 기본 이용료(원)이다.
 * @type {number}
 */
export const SPACE_FEE = 200000;
/**
 * 우주여행 코스에서 출발지(지구)를 지나거나 지구에 멈출 때 받는 기본 월급(원)이다.
 * @type {number}
 */
export const SPACE_SALARY = 300000;
/**
 * 우주여행 코스에서 타임머신 소유자에게 내는 시간여행 기본 이용료(원)이다.
 * @type {number}
 */
export const TIME_FEE = 300000;
/**
 * 우주여행 코스에서 모인 기금이 없는 우주조난기지에 도착했을 때 내는 기본 금액(원)이다.
 * @type {number}
 */
export const RESCUE_FEE = 200000;
/**
 * 우주여행 코스에서 기지를 한 번 증축하는 기본 비용(원)이다. 어느 별이나 같다.
 * @type {number}
 */
export const ANNEX_COST = 100000;
/**
 * 우주여행 코스에서 기지를 한 번 증축할 때마다 오르는 기본 이용료(원)이다. 어느 별이나 같다.
 * @type {number}
 */
export const ANNEX_FEE = 100000;
/**
 * 우주여행 코스에서 기지를 끝까지(BUILD_LIMIT.annex 번) 증축했을 때 이용료가 추가로 더 오르는 기본 금액(원)이다. 어느 별이나 같다.
 * @type {number}
 */
export const ANNEX_BONUS = 200000;
/**
 * 우주여행 코스에서 시간여행에 탑승한 뒤, 또는 블랙홀에서 3턴 째에 풀려난 뒤 굴린 주사위의 합이 이 값 이상이어야 뜻대로 된다.
 * (시간여행은 원하는 칸으로 이동하고, 블랙홀은 땅을 반납하지 않는다.)
 * @type {number}
 */
export const SAFE_SUM = 4;
/**
 * 우주여행 코스에서 시간여행에 탑승한 뒤 굴린 주사위의 합이 모자랄 때 앞으로 이동하는 칸 수이다.
 * @type {number}
 */
export const TIME_SLIP = 5;
/**
 * 저장 슬롯을 새로 만들 때 대기실에 지급되는 금액(원)이다.
 * @type {number}
 */
export const LOBBY_MONEY = 20000000;
/**
 * 저장 슬롯의 개수이다.
 * @type {number}
 */
export const SLOT_COUNT = 3;
/**
 * 은행에 땅을 매각할 때 돌려받는 비율(%)이다.
 * @type {number}
 */
export const SELL_PERCENT = 70;
/**
 * 반액대매출 쿠폰으로 매각할 때 돌려받는 비율(%)이다.
 * @type {number}
 */
export const HALF_PERCENT = 50;
/**
 * 무인도에 도착한 뒤 갇혀 있는 턴 수이다. (2턴 간 갇힘, 3턴 째 이동)
 * @type {number}
 */
export const ISLAND_TURNS = 3;
/**
 * 건물 종류 목록이다. (가치가 낮은 순서)
 * @type {string[]}
 */
export const BUILDINGS = ['villa', 'building', 'hotel'];
/**
 * 땅 하나에 지을 수 있는 건물 종류별 최대 개수이다. (세계여행 코스의 별장, 빌딩, 호텔과 우주여행 코스의 기지, 기지의 증축)
 * 증축(annex)은 따로 서는 건물이 아니라 그 별의 기지를 키우는 것이어서, 증축한 기지도 기지 하나로 센다.
 * @type {Object<string, number>}
 */
export const BUILD_LIMIT = { villa: 2, building: 1, hotel: 1, base: 1, annex: 3 };
/**
 * 구매할 수 있는 땅의 종류 목록이다. (세계여행 코스의 일반 도시, 한국 도시, 특수 시설과 우주여행 코스의 별)
 * @type {string[]}
 */
export const PROPERTY_TYPES = ['city', 'korea', 'special', 'star'];
/**
 * 사용자가 차례 진행 대신 메인 메뉴로 나가기를 선택했음을 나타내는 값이다.
 * @type {string}
 */
export const QUIT = 'quit';
/**
 * 사용자가 게임 포기를 확정했음을 나타내는 값이다.
 * @type {string}
 */
export const FORFEIT = 'forfeit';
/**
 * 돈 이동 연출에서 돈을 내거나 받는 쪽이 은행임을 나타내는 값이다. 은행은 출발지 칸에 있는 것으로 본다.
 * @type {string}
 */
export const BANK = 'bank';
/**
 * 돈 이동 연출에서 돈을 내거나 받는 쪽이 사회복지기금 본부임을 나타내는 값이다.
 * @type {string}
 */
export const FUND = 'fund';
/**
 * 진행 기록(로그)을 보관하는 최대 개수이다.
 * @type {number}
 */
const LOG_LIMIT = 80;
/**
 * 저장 데이터의 형식 버전이다. 슬롯 데이터와 그 안의 게임 진행 상태에 함께 적는다.
 * 저장 데이터의 모양을 바꾸면 이 값을 올리고, 바로 앞 버전의 데이터를 새 모양으로 바꾸는 함수를 SAVE_UPGRADES 에 더한다.
 * @type {number}
 */
export const SAVE_VERSION = 8;
/**
 * 버전 표기가 없는 저장 데이터를 취급하는 버전이다. 슬롯 데이터에 버전을 적기 시작하기 바로 전의 형식이다.
 * @type {number}
 */
export const LEGACY_VERSION = 5;
/**
 * 게임 진행을 강제로 중단시킬 때 던지는 신호 객체이다.
 * @type {{stop: boolean}}
 */
const STOP = { stop: true };
/**
 * 같은 자리를 쓰는 두 터의 건물 사이에 두어야 하는 간격이다. (보드 너비의 백분율, cqw)
 * @type {number}
 */
const LOT_GAP = 0.25;
/**
 * 같은 자리를 쓰는 두 터가 겹칠 때 별장을 줄여 보는 크기 비율이다. 앞에서부터 차례로 써 보고, 겹치지 않게 되는 첫 비율을 쓴다.
 * @type {number[]}
 */
const LOT_SCALES = [1, 0.9, 0.8, 0.7, 0.6, 0.5];
/**
 * 같은 자리를 쓰는 두 터를 밀어 볼 때, 가운데에서 칸의 끝까지를 나누는 단계의 수이다.
 * @type {number}
 */
const LOT_STEPS = 10;
/**
 * 사용자 이름의 최대 글자 수이다.
 * @type {number}
 */
const NAME_LIMIT = 12;

/**
 * 화면 연출에 쓰이는 시간(밀리초) 기본값이다.
 * dice: 주사위 굴림, step: 일반 이동 1칸 (0.5초), fastStep: 비밀쿠폰/우주여행 이동 1칸 (0.25초),
 * coupon: 비밀쿠폰 표시 (6초), transfer: 플레이어 간 돈 이동, bank: 은행 또는 사회복지기금 본부와의 돈 이동 (자주 일어나므로 조금 짧다),
 * boost: 큰 금액이 오갈 때 돈 이동에 더하는 시간, use: 우대권 또는 무전기 사용 표시,
 * charm: 부적 효과 발동 표시, defeat: 패배한 플레이어의 말이 폭발과 함께 보드 밖으로 튕겨나가는 모습,
 * notice: 우주여행 코스의 카드 효과 같은 사건 알림 표시, cast: 카드의 효과로 굴리는 주사위의 굴림,
 * think: 인공지능 판단, pause: 연출 사이 간격, result: 패배 화면 표시
 * @type {Object<string, number>}
 */
export const TIMINGS = { dice: 900, step: 500, fastStep: 250, coupon: 6000, transfer: 1800, bank: 1200, boost: 200, use: 1700, charm: 1900, defeat: 1800, notice: 1600, cast: 700, think: 700, pause: 500, result: 3500 };

/**
 * 패배한 플레이어의 말이 폭발할 때 사방으로 튀는 불티의 수이다.
 * @type {number}
 */
const BLAST_SPARKS = 16;

/**
 * 돈 이동을 더 크게 연출하기 시작하는 금액이다. (원, 리그 배율을 적용하기 전의 값) 오간 돈이 이 금액 이상이면 지폐를 훨씬 많이 날린다.
 * @type {number}
 */
export const BIG_TRANSFER = 1500000;
/**
 * 큰 금액이 오갈 때 날리는 지폐의 수이다. (보통의 돈 이동은 금액에 따라 6장에서 16장을 날린다.)
 * @type {number}
 */
const BIG_BILLS = 44;

/**
 * 리그별 설정이다. 적힌 순서대로 대기실에 나온다.
 * course 는 그 리그가 진행되는 코스(COURSES 의 키 : 'world' 세계여행 코스, 'space' 우주여행 코스)이다.
 * multiplier 는 금액 배율, fee 는 참가비(원), cash 는 게임을 시작할 때 모든 플레이어가 가지는 돈(원),
 * weights 는 인공지능 플레이어가 1, 2, 3명일 확률의 가중치이다. (가중치가 0 인 인원으로는 진행하지 않는다.)
 * reward 는 정해진 승리 보상(원)이며, null 이면 게임에서 가진 돈과 땅, 건물의 가치를 얻는다.
 * hideFrom 은 대기실 보유 금액이 이 값 이상이면 리그를 보여주지 않는 기준(원)이며, null 이면 언제나 보여준다.
 * items 는 소모형 아이템을 게임에 가져가 쓸 수 있는지 여부이다.
 * rivalCharms 는 인공지능 한 명이 장착하고 시작하는 부적의 등급 목록이며, 비어 있으면 인공지능은 부적을 쓰지 않는다.
 * @type {Object<string, {course: string, multiplier: number, fee: number, cash: number, weights: number[], color: string, reward: number|null, hideFrom: number|null, items: boolean, rivalCharms: string[]}>}
 */
export const LEAGUES = {
  white: { course: 'world', multiplier: 1, fee: 0, cash: 1000000, weights: [1, 0, 0], color: '#868e96', reward: 3000000, hideFrom: 5000000, items: false, rivalCharms: [] },
  green: { course: 'world', multiplier: 1, fee: 3000000, cash: 3000000, weights: [1, 2, 1], color: '#2f9e44', reward: null, hideFrom: null, items: true, rivalCharms: [] },
  orange: { course: 'world', multiplier: 5, fee: 15000000, cash: 15000000, weights: [1, 1, 2], color: '#f08c00', reward: null, hideFrom: null, items: true, rivalCharms: [] },
  red: { course: 'world', multiplier: 30, fee: 90000000, cash: 90000000, weights: [1, 2, 4], color: '#e03131', reward: null, hideFrom: null, items: true, rivalCharms: ['common', 'uncommon'] },
  purple: { course: 'space', multiplier: 1, fee: 4000000, cash: 4000000, weights: [1, 2, 1], color: '#7950f2', reward: null, hideFrom: null, items: true, rivalCharms: [] },
  black: { course: 'space', multiplier: 20, fee: 80000000, cash: 80000000, weights: [1, 1, 2], color: '#495057', reward: null, hideFrom: null, items: true, rivalCharms: ['common', 'uncommon'] },
};

/**
 * 땅 색상 이름에 대응하는 화면 표시 색이다.
 * @type {Object<string, string>}
 */
export const LAND_COLORS = { yellow: '#f5c211', blue: '#3b9dea', navy: '#3d4fd6', red: '#e03131', green: '#2f9e44', gold: '#d4a017', purple: '#9c36b5', gray: '#868e96' };

/**
 * 한 게임에 참여할 수 있는 최대 플레이어 수이다. (사용자 1명과 인공지능 최대 3명)
 * @type {number}
 */
export const MAX_PLAYERS = 4;

/**
 * 장착형 아이템(플레이어를 나타내는 색상 또는 모양) 한 종류의 정보이다.
 * @typedef {Object} HellmarbleEquip
 * @property {string} slot 장착하는 자리 ('color' : 색상, 'shape' : 모양). 상점과 보유 목록의 분류로도 쓴다.
 * @property {number} price 상점의 구매 가격 (원). 0 이면 처음부터 주어지는 기본 아이템이며 사고팔 수 없다.
 * @property {string} value 색상이면 '#rrggbb' 형식의 색, 모양이면 말에 그리는 문자
 * @property {string} [ink] 그 색상 위에 그리는 모양의 글자색 (색상만)
 * @property {string} [family] 비슷해 보이는 색을 묶은 계열. 인공지능 플레이어의 색을 정할 때 사용자의 색과 같은 계열을 피한다. (색상만)
 * @property {string} [fill] 금속 색상처럼 단색 대신 말과 소유 표시에 칠하는 CSS 배경 (색상만, 선택)
 */

/**
 * 장착형 아이템의 구성이다. 색상과 모양을 하나씩 장착해야 리그에 참여할 수 있으며, 장착한 것이 게임에서 사용자의 말과 땅의 소유 표시에 쓰인다.
 * 가격이 0 인 것(색상 5종, 모양 4종)은 새 슬롯이 처음부터 가지는 기본 아이템이다.
 * @type {Object<string, HellmarbleEquip>}
 */
export const EQUIPS = {
  red: { slot: 'color', price: 0, value: '#e03131', ink: '#ffffff', family: 'red' },
  blue: { slot: 'color', price: 0, value: '#1c7ed6', ink: '#ffffff', family: 'blue' },
  green: { slot: 'color', price: 0, value: '#2f9e44', ink: '#ffffff', family: 'green' },
  yellow: { slot: 'color', price: 0, value: '#f5c211', ink: '#232733', family: 'yellow' },
  purple: { slot: 'color', price: 0, value: '#7c3aed', ink: '#ffffff', family: 'purple' },
  sky: { slot: 'color', price: 5000000, value: '#4dabf7', ink: '#232733', family: 'blue' },
  lime: { slot: 'color', price: 5000000, value: '#8ce99a', ink: '#232733', family: 'green' },
  hotpink: { slot: 'color', price: 5000000, value: '#d6336c', ink: '#ffffff', family: 'red' },
  pink: { slot: 'color', price: 10000000, value: '#faa2c1', ink: '#232733', family: 'red' },
  brown: { slot: 'color', price: 10000000, value: '#8d5a2b', ink: '#ffffff', family: 'brown' },
  graphite: { slot: 'color', price: 20000000, value: '#454a52', ink: '#ffffff', family: 'gray' },
  bronze: { slot: 'color', price: 50000000, value: '#b0703c', ink: '#ffffff', family: 'brown', fill: 'linear-gradient(135deg, #e6ad76 0%, #b0703c 48%, #77441f 100%)' },
  silver: { slot: 'color', price: 100000000, value: '#b4bcc8', ink: '#232733', family: 'gray', fill: 'linear-gradient(135deg, #f6f8fb 0%, #b4bcc8 48%, #7d8695 100%)' },
  gold: { slot: 'color', price: 1000000000, value: '#e0aa0e', ink: '#232733', family: 'yellow', fill: 'linear-gradient(135deg, #fff3ad 0%, #e0aa0e 48%, #a37100 100%)' },
  star: { slot: 'shape', price: 0, value: '★' },
  triangle: { slot: 'shape', price: 0, value: '▲' },
  square: { slot: 'shape', price: 0, value: '■' },
  diamond: { slot: 'shape', price: 0, value: '◆' },
  plus: { slot: 'shape', price: 5000000, value: '+' },
  minus: { slot: 'shape', price: 5000000, value: '−' },
  times: { slot: 'shape', price: 5000000, value: '×' },
  divide: { slot: 'shape', price: 5000000, value: '÷' },
  spa: { slot: 'shape', price: 10000000, value: '♨︎' },
  club: { slot: 'shape', price: 20000000, value: '♧' },
  spade: { slot: 'shape', price: 50000000, value: '♤' },
  heart: { slot: 'shape', price: 100000000, value: '♡' },
  note: { slot: 'shape', price: 200000000, value: '♪' },
  notes: { slot: 'shape', price: 500000000, value: '♬' },
};
/**
 * 새 슬롯이 처음에 장착하고 있는 색상과 모양이다. (빨강, 별)
 * @type {{color: string, shape: string}}
 */
export const DEFAULT_LOOK = { color: 'red', shape: 'star' };

/**
 * 부적의 등급별 설정이다. 일반, 고급, 희귀, 전설의 순서이다.
 * weight 는 추첨에서 그 등급이 나올 확률의 가중치이다. 고급은 일반의 5분의 1, 희귀는 100분의 1, 전설은 2000분의 1의 확률로 나온다.
 * sell 은 상점에 팔 때 받는 금액(원)이며, 다른 아이템과 달리 구매 가격의 비율로 정하지 않는다.
 * @type {Object<string, {weight: number, sell: number}>}
 */
export const CHARM_GRADES = {
  common: { weight: 2000, sell: 100000 },
  uncommon: { weight: 400, sell: 50000000 },
  rare: { weight: 20, sell: 200000000 },
  legend: { weight: 1, sell: 1000000000000 },
};

/**
 * 부적 한 종류의 정보이다. 부적은 장착형 아이템이며 장착하면 그 게임 내내 효과가 적용된다.
 * @typedef {Object} HellmarbleCharm
 * @property {string} grade 등급 (CHARM_GRADES 의 키)
 * @property {string} icon 부적을 나타내는 그림 문자
 * @property {string} effect 효과의 종류 ('double' : 더블 확률 증가, 'discount' : 땅 구매 할인, 'toll' : 통행료·이용료 할인, 'redraw' : 손해 보는 비밀쿠폰 다시 뽑기, 'build' : 건물 무료 건설)
 * @property {number} chance 효과가 일어날 확률 (%). double 에서는 더블이 나올 확률에 더해지는 값이다.
 * @property {number} [percent] 땅값 또는 통행료·이용료를 깎아 주는 비율 (%) (discount, toll 만)
 * @property {string} [building] 무료로 지어지는 건물의 종류 (build 만)
 * @property {boolean} [revisit] 땅을 살 때뿐 아니라 자기 땅에 다시 도착했을 때에도 적용되는지 여부 (build 만)
 * @property {number} [base] 우주여행 코스에서 건물 대신 기지 하나가 무료로 지어질 확률 (%) (build 만. 그 코스에는 별장, 빌딩, 호텔이 없어 효과가 이렇게 바뀐다.)
 */

/**
 * 부적의 구성이다. 상점에서 직접 살 수 없고 부적 추첨권으로만 얻는다.
 * @type {Object<string, HellmarbleCharm>}
 */
export const CHARMS = {
  brokendice: { grade: 'common', icon: '🎲', effect: 'double', chance: 10 },
  oldcoin: { grade: 'common', icon: '🪙', effect: 'discount', chance: 5, percent: 10 },
  expiredvoucher: { grade: 'common', icon: '🏷️', effect: 'toll', chance: 5, percent: 5 },
  tornlottery: { grade: 'uncommon', icon: '🎫', effect: 'redraw', chance: 10 },
  realtor: { grade: 'uncommon', icon: '📇', effect: 'build', chance: 20, building: 'villa', revisit: false, base: 10 },
  scratched: { grade: 'uncommon', icon: '🎟️', effect: 'redraw', chance: 20 },
  woodendice: { grade: 'uncommon', icon: '🪵', effect: 'double', chance: 15 },
  memorialcoin: { grade: 'uncommon', icon: '🏅', effect: 'discount', chance: 10, percent: 10 },
  mysteryvoucher: { grade: 'uncommon', icon: '🎁', effect: 'toll', chance: 7, percent: 7 },
  fortunecookie: { grade: 'rare', icon: '🥠', effect: 'redraw', chance: 30 },
  lawfirm: { grade: 'rare', icon: '💼', effect: 'build', chance: 10, building: 'building', revisit: true, base: 15 },
  stock: { grade: 'rare', icon: '📈', effect: 'discount', chance: 10, percent: 25 },
  expresscard: { grade: 'rare', icon: '💳', effect: 'toll', chance: 10, percent: 10 },
  president: { grade: 'legend', icon: '🏛️', effect: 'build', chance: 10, building: 'hotel', revisit: true, base: 20 },
  pendant: { grade: 'legend', icon: '📿', effect: 'redraw', chance: 45 },
  etf: { grade: 'legend', icon: '📊', effect: 'discount', chance: 10, percent: 50 },
  blackcard: { grade: 'legend', icon: '🖤', effect: 'toll', chance: 15, percent: 15 },
};

/**
 * 새 슬롯이 처음부터 하나 가지고 장착한 채로 시작하는 부적이다. (낡은 동전) 이미 저장된 슬롯에는 소급하여 주지 않는다.
 * @type {string}
 */
export const STARTER_CHARM = 'oldcoin';

/**
 * 상점에서 파는 부적 추첨권이다. 사는 즉시 사용되어 draws 개의 부적을 추첨한다. (보관되지 않는다.)
 * @type {Object<string, {price: number, draws: number, icon: string, badge: string}>}
 */
export const CHARM_TICKETS = {
  charmticket: { price: 100000000, draws: 1, icon: '🧧', badge: '×1' },
  charmticket10: { price: 900000000, draws: 10, icon: '🧧', badge: '×10' },
};

/**
 * 아이템 한 종류의 정보이다.
 * @typedef {Object} HellmarbleItem
 * @property {number} price 구매 가격 (원). 리그 배율을 적용하지 않는다.
 * @property {string} icon 아이템을 나타내는 그림 문자
 * @property {string} [badge] 그림 문자가 같은 아이템을 구분하려고 그림 위에 덧붙이는 짧은 표시 (예 : 주사위에서 나오는 눈)
 * @property {string} category 상점과 보유 목록에서 묶어 보여주는 분류 (ITEM_CATEGORIES 의 값)
 * @property {string} use 사용 방식. 'ask' 는 쓸 상황이 되면 게임이 사용 여부를 묻고, 'turn' 은 주사위를 굴릴 차례에 아이템 목록에서 직접 쓴다.
 * @property {string} limit 게임 한 판의 사용 횟수 제한을 함께 쓰는 묶음의 이름. 같은 묶음의 아이템은 합쳐서 정해진 횟수까지만 쓸 수 있다.
 * @property {number} [uses] 게임 한 판에 쓸 수 있는 횟수 (생략하면 1). 같은 묶음의 아이템은 같은 값을 적는다.
 * @property {string} [course] 쓸 수 있는 코스 (COURSES 의 키). 생략하면 어느 코스에서나 쓸 수 있다. 쓸 수 없는 코스의 게임에는 가져가지 않는다.
 * @property {string} [effect] 직접 쓰는 아이템의 효과 ('space' : 우주여행 무료 탑승, 'time' : 시간여행 무료 탑승, 'dice' : 주사위 조작)
 * @property {number[]} [faces] 주사위 조작형 아이템을 썼을 때 주사위에서 나오는 눈
 */

/**
 * 대기실에서 사고팔 수 있는 아이템의 구성이다. 여기에 항목을 더하면 상점과 보유 목록에 자동으로 나타난다.
 * @type {Object<string, HellmarbleItem>}
 */
export const ITEMS = {
  pass: { price: 300000, icon: '🎟️', category: 'support', use: 'ask', limit: 'pass', course: 'world' },
  radio: { price: 200000, icon: '📻', category: 'support', use: 'ask', limit: 'radio', course: 'world' },
  invitation: { price: 200000, icon: '💌', category: 'travel', use: 'turn', limit: 'invitation', course: 'world', effect: 'space' },
  timeinvite: { price: 200000, icon: '📨', category: 'travel', use: 'turn', limit: 'timeinvite', course: 'space', effect: 'time' },
  angel: { price: 400000, icon: '👼', category: 'support', use: 'ask', limit: 'angel', uses: 2, course: 'space' },
  escape: { price: 200000, icon: '🛸', category: 'support', use: 'ask', limit: 'escape', course: 'space' },
  bigdice: { price: 200000, icon: '🎲', badge: '4~6', category: 'dice', use: 'turn', limit: 'dice', effect: 'dice', faces: [4, 5, 6] },
  smalldice: { price: 200000, icon: '🎲', badge: '1~3', category: 'dice', use: 'turn', limit: 'dice', effect: 'dice', faces: [1, 2, 3] },
};
/**
 * 아이템의 분류를 화면에 보여주는 순서대로 나열한 것이다.
 * (support : 보조, travel : 이동, dice : 주사위, color : 장착형 색상, shape : 장착형 모양, charm : 부적과 부적 추첨권)
 * @type {string[]}
 */
export const ITEM_CATEGORIES = ['support', 'travel', 'dice', 'color', 'shape', 'charm'];
/**
 * 상점에서 아이템을 은행에 되팔 때 돌려받는 구매 가격의 비율이다.
 * @type {number}
 */
export const ITEM_SELL_PERCENT = 70;
/**
 * 상점에서 한 번에 사고팔 수 있는 최대 수량이다.
 * @type {number}
 */
export const ITEM_BULK = 99;
/**
 * 주사위를 굴릴 차례에 아이템을 쓰겠다고 답할 때, 아이템 식별자 앞에 붙이는 말이다. (예 : 'item:bigdice')
 * @type {string}
 */
export const ITEM_PREFIX = 'item:';

/**
 * 칸, 건물, 보관 쿠폰을 나타내는 그림 문자이다.
 * @type {Object<string, string>}
 */
const ICONS = {
  start: '🏁', coupon: '🎫', space: '🚀', island: '🏝️', fund: '💰', desk: '🧾',
  jeju: '🍊', busan: '🌊', seoul: '👑', concorde: '✈️', columbia: '🛰️',
  villa: '🏠', building: '🏢', hotel: '🏨', pass: '🎟️', radio: '📻', bank: '🏦', defeat: '💥',
  earth: '🌍', telepathy: '🔮', neuron: '🧠', timetravel: '⏳', blackhole: '🕳️', rescue: '🛟', halley: '☄️', timemachine: '🕰️',
  moon: '🌙', saturn: '🪐', vega: '💜', altair: '💜', base: '📡', annex: '🔧', angel: '👼', escape: '🛸', dice: '🎲', notice: '✨',
};

/**
 * 주사위 눈(1~6)별로 3x3 격자에서 점이 찍히는 위치이다.
 * @type {number[][]}
 */
const DICE_PIPS = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];

/**
 * WebMCP 로 제공하는 도구의 구성이다. 실제 도구 이름은 앞에 'hellmarble_' 이 붙는다.
 * readOnly 는 화면을 바꾸지 않는 조회 도구인지 여부, schema 는 입력값의 JSON 스키마이다.
 * 설명은 어느 언어의 에이전트든 읽을 수 있도록 한국어와 영어를 함께 적는다.
 * @type {Object<string, {readOnly: boolean, title: string, description: string, schema: Object}>}
 */
const MCP_TOOLS = {
  get_rules: {
    readOnly: true, title: 'Hellmarble 플레이 방법 (How to play)',
    description: 'Hellmarble 보드게임의 규칙과 플레이 방법을 설명한다. (Explains the rules of the Hellmarble board game and how to play it.)',
    schema: { type: 'object', properties: {} },
  },
  get_guide: {
    readOnly: true, title: '화면 사용 방법 (How to use this page)',
    description: '이 웹 화면의 사용 방법과 WebMCP 도구를 쓰는 순서를 설명한다. (Explains how to use this web page and in what order to use these tools.)',
    schema: { type: 'object', properties: {} },
  },
  get_state: {
    readOnly: true, title: '현재 화면 상황 (Current state)',
    description: '현재 화면, 떠 있는 창, 지금 누를 수 있는 동작 목록(actions), 게임 진행 상황(플레이어, 소유한 땅, 최근 기록)을 JSON 으로 돌려준다. (Returns the current screen, open dialog, the actions that can be pressed now, and the game status as JSON.)',
    schema: { type: 'object', properties: {} },
  },
  get_land: {
    readOnly: true, title: '땅 정보 (Land info)',
    description: '보드 한 칸의 가격, 건설 비용, 통행료와 이용료, 소유자, 건물, 현실 소개 글을 돌려준다. (Returns the price, building costs, toll and fees, owner, buildings and real-world note of one board tile.)',
    schema: { type: 'object', properties: { index: { type: 'integer', minimum: 0, maximum: 39, description: '칸 번호. 0 은 출발지이고 진행 방향으로 39 까지이다. (Tile index: 0 is Start, up to 39 in the direction of travel.)' } }, required: ['index'] },
  },
  act: {
    readOnly: false, title: '동작 누르기 (Press an action)',
    description: 'hellmarble_get_state 의 actions 에 있는 동작 하나를 누른다. 메뉴 이동, 슬롯 선택, 리그 참여, 주사위 굴리기, 창의 선택지 고르기, 칸이나 플레이어 정보 보기, 우주여행 이동 등 화면의 모든 조작을 이 도구로 한다. (Presses one of the actions listed by hellmarble_get_state. Every operation of the page is done with this tool.)',
    schema: {
      type: 'object',
      properties: {
        action: { type: 'string', description: '누를 동작의 이름. 예 : game.roll, dialog.answer (The action name, e.g. game.roll or dialog.answer.)' },
        value: { type: 'string', description: '동작에 딸린 값. actions 목록에 value 가 있는 동작에만 넣는다. (The value of the action, only for actions listed with a value.)' },
      },
      required: ['action'],
    },
  },
  set_text: {
    readOnly: false, title: '글자 입력 (Enter text)',
    description: '화면의 입력란(이름 입력, JSON 불러오기)에 글자를 넣는다. 넣은 뒤에는 hellmarble_act 로 해당 동작을 눌러야 한다. (Fills the text field on screen: the name input or the JSON import box. Press the matching action afterwards.)',
    schema: { type: 'object', properties: { text: { type: 'string', description: '입력할 글자 (The text to enter.)' } }, required: ['text'] },
  },
  wait: {
    readOnly: true, title: '입력 차례까지 기다리기 (Wait for your turn)',
    description: '주사위, 이동, 다른 플레이어의 차례 같은 연출이 끝나 사용자의 입력이 필요해질 때까지 기다린 뒤 현재 상황을 돌려준다. (Waits until animations and other players\' turns finish and the game needs input, then returns the state.)',
    schema: { type: 'object', properties: { seconds: { type: 'number', minimum: 1, maximum: 120, description: '기다릴 최대 시간(초). 기본값 30. (Maximum seconds to wait, 30 by default.)' } } },
  },
};

/* ==========================================================================
 * 2. 보드 및 비밀쿠폰 구성
 * ========================================================================== */

/**
 * 보드 한 칸의 정보이다. 구매할 수 없는 기능 칸(출발지, 비밀쿠폰 등)에는 색상과 금액 항목이 없다.
 * @typedef {Object} HellmarbleTile
 * @property {string} id 칸 식별자
 * @property {string} type 칸 종류 (세계여행 코스 : city, korea, special, start, coupon, space, island, fund, desk /
 *   우주여행 코스 : star, special, start, telepathy, neuron, timetravel, blackhole, rescue, halley)
 * @property {string} [color] 땅 색상 이름 (규칙상의 색)
 * @property {string} [show] 화면에 보일 색상 이름
 * @property {number} [price] 땅 구매가 (원)
 * @property {number} [toll] 기본 통행료 (원). 별에서는 기지가 없을 때의 이용료이다.
 * @property {Object<string, number>} [cost] 건물 종류별 건설비 (원). 일반 도시와 별에만 있다.
 * @property {Object<string, number>} [fee] 건물 종류별 이용료 (원). 일반 도시에서는 통행료에 더하는 금액이고, 별에서는 기지가 있을 때의 이용료 전체이다.
 */

/**
 * 카드 한 종류의 정보이다. 세계여행 코스의 비밀쿠폰과 우주여행 코스의 텔레파시 카드, 뉴런의 골짜기 카드가 이 모양을 함께 쓴다.
 * @typedef {Object} HellmarbleCoupon
 * @property {number} count 덱에 들어가는 장수
 * @property {string} effect 효과의 종류 (비밀쿠폰 : gain, pay, tax, move, back, island, space, air, halfsale, keep / 우주여행 코스의 카드는 TELEPATHY 와 NEURON 의 설명 참고)
 * @property {number} [amount] 받거나 내는 기본 금액 (원)
 * @property {string} [target] 이동할 칸의 식별자
 * @property {number} [steps] 이동할 칸 수 (뒤로 이동하는 카드의 칸 수, 케플러의 조화의 법칙에서는 별 하나당 칸 수)
 * @property {Object<string, number>} [rates] 건물 종류별 1개당 내는 금액 (원)
 * @property {number} [bare] 기지가 없는 별 하나당 내는 금액 (원)
 * @property {number} [built] 기지가 있는 별 하나당 내는 금액 (원)
 * @property {number} [pay] 조건에 걸렸을 때 내는 금액 (원)
 * @property {number} [gain] 조건에 걸리지 않았을 때 받는 금액 (원)
 * @property {number} [need] 효과를 얻는 데 필요한 주사위 눈의 합
 * @property {number} [range] 효과가 미치는 앞뒤 칸의 수
 * @property {boolean} [harm] 뽑은 플레이어에게 바로 손해가 되는 카드인지 여부 (돈을 내거나 땅이나 기지를 잃거나 갇힘). 부적의 다시 뽑기 효과가 본다.
 */

/**
 * 만원 단위 금액을 원 단위 정수로 바꾼다.
 * @param {number} man 만원 단위 금액
 * @returns {number} 원 단위 금액
 */
function won(man) {
  return Math.round(man * 10000);
}

/**
 * 건물을 지을 수 있는 일반 도시의 땅 정보를 만든다.
 * @param {string} id 땅 식별자
 * @param {string} color 땅 색상 이름
 * @param {number} price 땅 구매가 (만원)
 * @param {number[]} costs 별장, 빌딩, 호텔 건설비 (만원)
 * @param {number} toll 기본 통행료 (만원)
 * @param {number[]} fees 별장(1개당), 빌딩, 호텔 이용료 (만원)
 * @returns {Object} 땅 정보
 */
function city(id, color, price, costs, toll, fees) {
  return {
    id, type: 'city', color, show: color, price: won(price), toll: won(toll),
    cost: { villa: won(costs[0]), building: won(costs[1]), hotel: won(costs[2]) },
    fee: { villa: won(fees[0]), building: won(fees[1]), hotel: won(fees[2]) },
  };
}

/**
 * 건물을 지을 수 없는 한국 도시 또는 특수 시설의 땅 정보를 만든다.
 * @param {string} id 땅 식별자
 * @param {string} type 땅 종류 ('korea' 또는 'special')
 * @param {number} price 땅 구매가 (만원)
 * @param {number} toll 통행료 (만원)
 * @param {string} [show] 화면에 보일 색상 이름 (생략 시 초록)
 * @returns {Object} 땅 정보
 */
function estate(id, type, price, toll, show) {
  return { id, type, color: 'green', show: show || 'green', price: won(price), toll: won(toll) };
}

/**
 * 우주여행 코스에서 기지를 지을 수 있는 별(행성 또는 별자리)의 땅 정보를 만든다.
 * 기지의 증축 비용과 증축 한 번에 오르는 이용료는 어느 별이나 같다. (ANNEX_COST, ANNEX_FEE)
 * @param {string} id 땅 식별자
 * @param {string} color 땅 색상 이름
 * @param {number} price 땅 구매가 (만원)
 * @param {number} base 기지 건설비 (만원)
 * @param {number[]} fees 기지가 없을 때와 있을 때의 이용료 (만원)
 * @returns {Object} 땅 정보
 */
function star(id, color, price, base, fees) {
  return {
    id, type: 'star', color, show: color, price: won(price), toll: won(fees[0]),
    cost: { base: won(base), annex: ANNEX_COST }, fee: { base: won(fees[1]), annex: ANNEX_FEE },
  };
}

/**
 * 구매할 수 없는 기능 칸(출발지, 비밀쿠폰 등)의 정보를 만든다.
 * @param {string} id 칸 식별자
 * @param {string} [type] 칸 종류 (생략하면 식별자와 같다.)
 * @returns {Object} 칸 정보
 */
function spot(id, type) {
  return { id, type: type || id };
}

/**
 * 세계여행 코스의 보드 구성이다. 출발지(0번)부터 진행 방향 순서대로 40칸을 나열한다.
 * 1면: 0~10, 2면: 10~20, 3면: 20~30, 4면: 30~0 이며 모서리 칸은 두 면이 공유한다.
 * @type {HellmarbleTile[]}
 */
export const BOARD = [
  spot('start'),
  city('taipei', 'yellow', 5, [5, 15, 25], 0.2, [1, 9, 25]),
  spot('coupon'),
  city('hongkong', 'yellow', 8, [5, 15, 25], 0.4, [2, 18, 45]),
  city('manila', 'yellow', 8, [5, 15, 25], 0.4, [2, 18, 45]),
  estate('jeju', 'korea', 20, 30),
  city('singapore', 'yellow', 10, [5, 15, 25], 0.6, [3, 27, 55]),
  spot('coupon'),
  city('cairo', 'yellow', 10, [5, 15, 25], 0.6, [3, 27, 55]),
  city('istanbul', 'yellow', 12, [5, 15, 25], 0.8, [4, 30, 60]),
  spot('space'),
  city('athens', 'blue', 14, [10, 30, 50], 1, [5, 45, 75]),
  spot('coupon'),
  city('copenhagen', 'blue', 16, [10, 30, 50], 1.2, [6, 50, 90]),
  city('stockholm', 'blue', 16, [10, 30, 50], 1.2, [6, 50, 90]),
  estate('concorde', 'special', 20, 30),
  city('zurich', 'blue', 18, [10, 30, 50], 1.4, [7, 55, 95]),
  spot('coupon'),
  city('berlin', 'blue', 18, [10, 30, 50], 1.4, [7, 55, 95]),
  city('montreal', 'blue', 20, [10, 30, 50], 1.6, [8, 60, 100]),
  spot('island'),
  city('buenosaires', 'navy', 22, [15, 45, 75], 1.8, [9, 70, 105]),
  spot('coupon'),
  city('saopaulo', 'navy', 24, [15, 45, 75], 2, [10, 75, 110]),
  city('sydney', 'navy', 24, [15, 45, 75], 2, [10, 75, 110]),
  estate('busan', 'korea', 50, 60),
  city('hawaii', 'navy', 26, [15, 45, 75], 2.2, [11, 80, 115]),
  city('lisbon', 'navy', 26, [15, 45, 75], 2.2, [11, 80, 115]),
  spot('coupon'),
  city('madrid', 'navy', 28, [15, 45, 75], 2.4, [12, 85, 120]),
  spot('fund'),
  city('tokyo', 'red', 30, [20, 60, 100], 2.6, [13, 90, 130]),
  estate('columbia', 'special', 45, 40),
  city('paris', 'red', 32, [20, 60, 100], 2.8, [15, 100, 140]),
  city('rome', 'red', 32, [20, 60, 100], 2.8, [15, 100, 140]),
  spot('coupon'),
  city('london', 'red', 35, [20, 60, 100], 3.5, [17, 110, 150]),
  city('newyork', 'red', 35, [20, 60, 100], 3.5, [17, 110, 150]),
  spot('desk'),
  estate('seoul', 'korea', 100, 200, 'gold'),
];

/**
 * 우주여행 코스의 보드 구성이다. 지구(출발지, 0번)부터 진행 방향 순서대로 40칸을 나열한다.
 * 1면: 0~10, 2면: 10~20, 3면: 20~30, 4면: 30~0 이며 모서리 칸은 두 면이 공유한다.
 * 별의 금액은 순서대로 땅 구매, 기지 건설, 기지가 없을 때의 이용료, 기지가 있을 때의 이용료이다.
 * @type {HellmarbleTile[]}
 */
export const SPACE_BOARD = [
  spot('earth', 'start'),
  star('moon', 'yellow', 10, 5, [5, 20]),
  spot('telepathy'),
  star('mars', 'yellow', 15, 8, [10, 25]),
  star('jupiter', 'yellow', 30, 15, [20, 45]),
  star('vega', 'purple', 50, 25, [35, 80]),
  star('saturn', 'yellow', 30, 15, [20, 45]),
  spot('telepathy'),
  star('uranus', 'yellow', 15, 8, [10, 25]),
  star('neptune', 'yellow', 15, 8, [10, 25]),
  spot('timetravel'),
  star('aries', 'red', 25, 13, [16, 40]),
  star('taurus', 'red', 30, 15, [20, 45]),
  spot('telepathy'),
  star('gemini', 'red', 40, 20, [27, 60]),
  spot('neuron'),
  star('cancer', 'red', 45, 23, [30, 70]),
  { id: 'timemachine', type: 'special', color: 'gray', show: 'gray', price: won(50), toll: won(30) },
  star('leo', 'red', 50, 25, [35, 80]),
  star('virgo', 'red', 60, 30, [40, 100]),
  spot('blackhole'),
  star('libra', 'blue', 60, 30, [40, 100]),
  star('scorpius', 'blue', 50, 25, [35, 80]),
  spot('telepathy'),
  star('sagittarius', 'blue', 45, 23, [30, 70]),
  star('altair', 'purple', 50, 25, [35, 80]),
  star('capricornus', 'blue', 40, 20, [27, 60]),
  star('aquarius', 'blue', 30, 15, [20, 45]),
  star('pisces', 'blue', 25, 13, [16, 40]),
  spot('telepathy'),
  spot('rescue'),
  star('ursamajor', 'green', 30, 15, [15, 45]),
  star('andromeda', 'green', 40, 20, [27, 60]),
  spot('telepathy'),
  star('orion', 'green', 40, 20, [27, 60]),
  spot('neuron'),
  star('cygnus', 'green', 30, 15, [15, 45]),
  spot('halley'),
  star('mercury', 'yellow', 10, 5, [5, 20]),
  star('venus', 'yellow', 10, 5, [5, 20]),
];

/**
 * 칸 식별자로 칸 번호를 찾을 수 있는 표를 만든다. (같은 식별자가 여럿이면 첫 칸을 쓴다.)
 * @param {HellmarbleTile[]} board 보드의 칸 목록
 * @returns {Object<string, number>} 식별자별 칸 번호
 */
function indexTiles(board) {
  let table = {};
  // 보드의 모든 칸을 순회하며 식별자별 첫 칸 번호를 기록한다.
  for (let index = 0; index < board.length; index++) {
    if (table[board[index].id] === undefined) table[board[index].id] = index;
  }
  return table;
}

/**
 * 세계여행 코스의 칸 식별자별 칸 번호이다. (예: TILES.island 는 무인도의 칸 번호)
 * @type {Object<string, number>}
 */
export const TILES = indexTiles(BOARD);
/**
 * 우주여행 코스의 칸 식별자별 칸 번호이다. (예: SPACE_TILES.blackhole 은 블랙홀의 칸 번호)
 * @type {Object<string, number>}
 */
export const SPACE_TILES = indexTiles(SPACE_BOARD);
/**
 * 우주여행 코스에서 한 플레이어가 함께 가질 수 없는 두 별(직녀성, 견우성)의 식별자이다.
 * 두 별 모두 주인이 생기면 두 주인은 지구로 이동하여 월급을 받고 기지를 지을 기회를 얻는다.
 * @type {string[]}
 */
export const LOVERS = ['vega', 'altair'];
/**
 * 뉴런의 골짜기 카드 "조디악의 선물"에서 주사위 눈의 수(1~12)에 대응하는 별의 식별자이다.
 * @type {string[]}
 */
export const ZODIAC = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpius', 'sagittarius', 'capricornus', 'aquarius', 'pisces'];

/**
 * 비밀쿠폰의 구성이다. count 는 장수, effect 는 효과의 종류이다.
 * gain: 은행에서 받음, pay: 은행에 냄, tax: 건물별로 은행에 냄, move: 지정한 칸으로 전진,
 * back: 뒤로 이동, island: 월급 없이 무인도로 이동, space: 무료 우주여행, air: 항공 여행,
 * halfsale: 반액대매출, keep: 보관하는 쿠폰
 * harm 이 true 인 쿠폰은 뽑은 플레이어에게 바로 손해가 되는 것으로, 부적의 다시 뽑기 효과가 피하려는 대상이다.
 * @type {Object<string, HellmarbleCoupon>}
 */
export const COUPONS = {
  welfare: { count: 2, effect: 'move', target: 'desk', harm: true },
  dividend: { count: 2, effect: 'move', target: 'fund' },
  speeding: { count: 4, effect: 'pay', amount: won(5), harm: true },
  jeju: { count: 2, effect: 'move', target: 'jeju' },
  busan: { count: 1, effect: 'move', target: 'busan' },
  seoul: { count: 1, effect: 'move', target: 'seoul' },
  pass: { count: 2, effect: 'keep' },
  radio: { count: 2, effect: 'keep' },
  halfsale: { count: 1, effect: 'halfsale', harm: true },
  lottery: { count: 3, effect: 'gain', amount: won(50) },
  study: { count: 4, effect: 'pay', amount: won(10), harm: true },
  invitation: { count: 1, effect: 'space' },
  security: { count: 2, effect: 'tax', rates: { hotel: won(5), building: won(3), villa: won(1) }, harm: true },
  repair: { count: 1, effect: 'tax', rates: { hotel: won(10), building: won(6), villa: won(3) }, harm: true },
  incometax: { count: 1, effect: 'tax', rates: { hotel: won(15), building: won(10), villa: won(3) }, harm: true },
  airtravel: { count: 2, effect: 'air' },
  hospital: { count: 4, effect: 'pay', amount: won(10), harm: true },
  moving: { count: 2, effect: 'back', steps: 3 },
  scholarship: { count: 4, effect: 'gain', amount: won(10) },
  highway: { count: 4, effect: 'move', target: 'start' },
  amateur: { count: 4, effect: 'gain', amount: won(20) },
  pension: { count: 4, effect: 'gain', amount: won(5) },
  castaway: { count: 2, effect: 'island', harm: true },
};

/**
 * 우주여행 코스의 텔레파시 카드 구성이다. (53장) count 는 장수, effect 는 효과의 종류이다.
 * gain: 은행에서 받음, pay: 은행에 냄, bases: 기지 수만큼 받음, basepay: 기지 수만큼 냄, ecology: 별마다 냄(기지 유무에 따라 다름),
 * rescue: 우주조난기지로 가서 기금을 받음, lovers: 견우성 또는 직녀성을 무료로 얻음, luckydice: 주사위 1개의 눈만큼 받음,
 * party: 다른 플레이어를 화성으로 보냄, blackhole: 블랙홀로 이동, valley: 뉴런의 골짜기 칸으로 이동, move: 지정한 칸으로 전진,
 * machinefix: 타임머신의 주인에게서 받음, rob: 다른 모든 플레이어에게서 받음, offcourse: 돈을 내고 뒤로 이동, reverse: 주사위 1개의 눈만큼 뒤로 이동,
 * basereturn: 기지 하나를 반납, roundtrip: 보드를 한 바퀴 돎, timetravel: 무료 시간여행, keep: 보관하는 카드
 * harm 이 true 인 카드는 뽑은 플레이어에게 바로 손해가 되는 것으로, 부적의 다시 뽑기 효과가 피하려는 대상이다.
 * @type {Object<string, HellmarbleCoupon>}
 */
export const TELEPATHY = {
  architecture: { count: 1, effect: 'bases', amount: won(10) },
  ecology: { count: 1, effect: 'ecology', bare: won(5), built: won(10), harm: true },
  rescue: { count: 2, effect: 'rescue' },
  lovers: { count: 1, effect: 'lovers' },
  meteorite: { count: 4, effect: 'gain', amount: won(30) },
  luckydice: { count: 2, effect: 'luckydice', amount: won(10) },
  cosmos: { count: 2, effect: 'gain', amount: won(50) },
  party: { count: 1, effect: 'party', target: 'mars' },
  fear: { count: 1, effect: 'blackhole', harm: true },
  virus: { count: 4, effect: 'pay', amount: won(25), harm: true },
  waste: { count: 1, effect: 'basepay', amount: won(5), harm: true },
  baserepair: { count: 1, effect: 'basepay', amount: won(5), harm: true },
  valley: { count: 2, effect: 'valley' },
  recall: { count: 2, effect: 'move', target: 'earth' },
  asteroid: { count: 1, effect: 'basepay', amount: won(10), harm: true },
  machinefix: { count: 2, effect: 'machinefix', amount: won(30) },
  spectrumgun: { count: 1, effect: 'rob', amount: won(10) },
  offcourse: { count: 2, effect: 'offcourse', amount: won(25), steps: 3, harm: true },
  peace: { count: 4, effect: 'gain', amount: won(50) },
  basereturn: { count: 1, effect: 'basereturn', harm: true },
  roundtrip: { count: 2, effect: 'roundtrip' },
  timeticket: { count: 2, effect: 'timetravel' },
  robot: { count: 4, effect: 'gain', amount: won(50) },
  pirates: { count: 1, effect: 'basereturn', harm: true },
  reverse: { count: 3, effect: 'reverse' },
  escape: { count: 3, effect: 'keep' },
  angel: { count: 2, effect: 'keep' },
};

/**
 * 우주여행 코스의 뉴런의 골짜기 카드 구성이다. (28장) count 는 장수, effect 는 효과의 종류이며 카드마다 고유한 효과를 가진다.
 * huygens: 토성으로 가서 주사위로 빼앗기를 겨룸, apollo: 달에 들렀다가 지구로 돌아와 월급을 받음, newton: 가장 가까운 주인 없는 별로 이동,
 * freebase: 자기 별에 기지를 무료로 건설, einstein: 눈이 가장 낮은 플레이어의 가장 비싼 별과 자기의 가장 싼 별을 교환,
 * psychic: 자기 별과 주인 없는 별을 교환, doppler: 별이 가장 많으면 내고 아니면 받음, zodiac: 주사위 눈에 해당하는 별자리로 이동,
 * moravec: 원하는 칸으로 이동, copernicus: 지구로 가서 월급을 받고 한 번 더 굴림, kepler: 가진 별의 수에 비례해 전진,
 * shapley: 앞뒤의 별 주인들에게서 측정료를 받음, humboldt: 눈이 가장 낮은 플레이어의 가장 싼 땅을 반납시킴,
 * spectrum: 주사위 2개의 합이 need 이상이면 기지를 무료로 건설, mobius: 눈이 가장 높은 플레이어와 함께 전진,
 * contract: 별이 가장 많은 플레이어와 별을 교환, pascal: 남의 별로 가서 주사위로 이용료를 겨룸
 * @type {Object<string, HellmarbleCoupon>}
 */
export const NEURON = {
  huygens: { count: 1, effect: 'huygens', target: 'saturn' },
  apollo: { count: 2, effect: 'apollo', target: 'moon' },
  newton: { count: 2, effect: 'newton' },
  appleseed: { count: 2, effect: 'freebase' },
  einstein: { count: 1, effect: 'einstein' },
  psychic: { count: 1, effect: 'psychic' },
  doppler: { count: 2, effect: 'doppler', pay: won(30), gain: won(70), harm: true },
  zodiac: { count: 2, effect: 'zodiac' },
  moravec: { count: 2, effect: 'moravec' },
  copernicus: { count: 2, effect: 'copernicus' },
  kepler: { count: 2, effect: 'kepler', steps: 2 },
  shapley: { count: 2, effect: 'shapley', amount: won(20), range: 5 },
  humboldt: { count: 1, effect: 'humboldt' },
  spectrum: { count: 2, effect: 'spectrum', need: 7 },
  mobius: { count: 2, effect: 'mobius' },
  contract: { count: 1, effect: 'contract' },
  pascal: { count: 1, effect: 'pascal', amount: won(30) },
};

/**
 * 코스 하나의 구성(보드와 카드, 그 코스만의 값과 이름의 묶음)이다. 리그마다 어느 코스로 진행하는지 정해져 있다. (LEAGUES 의 course)
 * 여기에는 값만 둔다. 그 코스만의 규칙은 HellmarbleGame 을 상속한 엔진 클래스에, 판단은 HellmarbleAI 를 상속한 인공지능 클래스에 구현하며,
 * 코스와 엔진 클래스는 ENGINES 가 이어 준다.
 * @typedef {Object} HellmarbleCourse
 * @property {HellmarbleTile[]} board 보드의 칸 목록 (40칸)
 * @property {Object<string, number>} tiles 칸 식별자별 칸 번호
 * @property {number} salary 출발지에서 받는 기본 월급 (원)
 * @property {string[]} buildings 땅에 지을 수 있는 건물 종류 (가치가 낮은 순서). 우주여행 코스에서는 기지와, 그 기지를 키우는 증축(annex)이다.
 * @property {string} deck 주 카드 덱의 이름 ('coupon' : 비밀쿠폰, 'telepathy' : 텔레파시 카드). 진행 상태의 deck 에 들어가며 그 이름의 칸에서 뽑는다.
 * @property {Object<string, HellmarbleCoupon>} cards 주 카드 덱의 구성
 * @property {Object<string, HellmarbleCoupon>} valley 둘째 카드 덱(뉴런의 골짜기 카드)의 구성. 진행 상태의 valley 에 들어가며, 없는 코스에서는 비어 있다.
 * @property {string[]} keeps 플레이어가 보관할 수 있는 카드의 식별자 목록
 * @property {number} start 출발지의 칸 번호. 은행도 이 칸에 있는 것으로 본다.
 * @property {number} fund 기금이 쌓이는 칸의 번호 (사회복지기금 본부, 우주조난기지)
 * @property {number} trap 갇히는 칸의 번호 (무인도, 블랙홀)
 * @property {boolean} leftover 주인 없는 땅에 건물이 남아 있을 수 있는지 여부 (저장 데이터를 검사할 때 쓴다.)
 * @property {boolean} flight 탑승한 다음 차례에 주사위를 굴리지 않고 곧바로 목적지를 고르는지 여부 (화면이 그 차례에 주사위 대신 우주선을 보여준다.)
 *   이 값이 false 인 코스에서도 플레이어의 direct 가 켜진 탑승(우주여행 코스의 시간여행 초청장)은 주사위 없이 목적지를 고른다.
 * @property {string} fundIcon 쌓인 기금을 나타내는 그림 문자의 이름 (ICONS 의 키)
 * @property {Object<string, string|Object<string, string>>} logs 공통 규칙이 남기는 진행 기록 가운데 코스마다 문구가 다른 것의 키.
 *   board : 탑승, fund : 쌓인 기금 수령, stay : 갇힌 채 차례를 보냄, flee : 더블로 탈출, free : 3턴 째에 풀려남, toll : 통행료·이용료 지불,
 *   keep : 카드를 보관, draw : 카드를 뽑음 (덱의 이름별), barred : 가질 수 없는 땅에 도착함 (그런 땅이 있는 코스에만 있다.),
 *   built : 자기 땅에 건물을 지음 (건물 종류별. 공통 문구 log.build 와 다르게 적어야 하는 종류만 적으며, 그런 종류가 없는 코스에는 없다.)
 * @property {Object<string, string>} words 화면이 보여주는 글 가운데 코스마다 다른 것의 문구 키.
 *   fund : 쌓인 기금의 이름, trapped : 갇힌 상태의 꼬리표, boarded : 탑승 상태의 꼬리표, kept : 보관한 카드의 이름, card : 보관한 카드의 출처,
 *   toll : 내야 하는 돈의 이름, total : 지금 내야 하는 돈의 이름, build : 건설 창의 문구 앞부분, trapHint : 갇힌 차례의 안내, freeHint : 풀려나는 차례의 안내,
 *   aboard : 탑승한 채 주사위를 굴리는 차례의 안내 (그런 차례가 없는 코스에는 없다.), travelHint : 탑승한 뒤 주사위 없이 목적지를 고르는 차례의 안내,
 *   ship : 그 차례에 주사위 자리에 보여주는 우주선이 무엇인지 읽어 주는 이름 (탑승하는 칸의 이름)
 */

/**
 * 코스의 구성이다. world 는 세계여행 코스, space 는 우주여행 코스이다. 적힌 순서대로 대기실에 나온다.
 * @type {Object<string, HellmarbleCourse>}
 */
export const COURSES = {
  world: {
    board: BOARD, tiles: TILES, salary: SALARY, buildings: BUILDINGS, deck: 'coupon', cards: COUPONS, valley: {}, keeps: ['pass', 'radio'],
    start: TILES.start, fund: TILES.fund, trap: TILES.island, leftover: false, flight: true, fundIcon: 'fund',
    logs: { board: 'log.board', fund: 'log.fundGet', stay: 'log.islandStay', flee: 'log.islandDouble', free: 'log.islandFree', toll: 'log.toll', keep: 'log.keep', draw: { coupon: 'log.coupon' } },
    words: {
      fund: 'game.fund', trapped: 'player.island', boarded: 'player.boarded', kept: 'playerinfo.coupons', card: 'use.source.coupon',
      toll: 'info.toll', total: 'info.total', build: 'ask.build', trapHint: 'hint.island', freeHint: 'hint.release', travelHint: 'hint.travel', ship: 'tile.space',
    },
  },
  space: {
    board: SPACE_BOARD, tiles: SPACE_TILES, salary: SPACE_SALARY, buildings: ['base', 'annex'], deck: 'telepathy', cards: TELEPATHY, valley: NEURON, keeps: ['angel', 'escape'],
    start: SPACE_TILES.earth, fund: SPACE_TILES.rescue, trap: SPACE_TILES.blackhole, leftover: true, flight: false, fundIcon: 'rescue',
    logs: {
      board: 'log.timeBoard', fund: 'log.rescueGet', stay: 'log.blackholeStay', flee: 'log.blackholeDouble', free: 'log.blackholeFree', toll: 'log.fee', keep: 'log.keepCard',
      barred: 'log.loversBlock', draw: { telepathy: 'log.card.telepathy', neuron: 'log.card.neuron' }, built: { annex: 'log.annex' },
    },
    words: {
      fund: 'game.fund.space', trapped: 'player.blackhole', boarded: 'player.timetravel', kept: 'playerinfo.cards', card: 'use.source.card',
      toll: 'info.usage', total: 'info.totalFee', build: 'ask.base', trapHint: 'hint.blackhole', freeHint: 'hint.parole', aboard: 'hint.timeroll',
      travelHint: 'hint.timetravel', ship: 'tile.timetravel',
    },
  },
};

/**
 * 리그가 진행되는 코스의 구성을 구한다.
 * @param {string} league 리그 식별자
 * @returns {HellmarbleCourse} 코스의 구성 (모르는 리그이면 세계여행 코스)
 */
export function courseOf(league) {
  return COURSES[Object.hasOwn(LEAGUES, league) ? LEAGUES[league].course : 'world'];
}

/**
 * 카드 식별자가 어느 덱의 카드인지 찾는다. 카드 식별자는 모든 코스와 덱을 통틀어 겹치지 않는다. (보관하는 카드와 같은 이름의 아이템은 따로 다룬다.)
 * @param {string} id 카드 식별자
 * @returns {{deck: string, card: HellmarbleCoupon}|null} 덱의 이름('coupon', 'telepathy', 'neuron')과 카드 정보. 모르는 카드이면 null
 */
export function findCard(id) {
  if (Object.hasOwn(COUPONS, id)) return { deck: 'coupon', card: COUPONS[id] };
  if (Object.hasOwn(TELEPATHY, id)) return { deck: 'telepathy', card: TELEPATHY[id] };
  if (Object.hasOwn(NEURON, id)) return { deck: 'neuron', card: NEURON[id] };
  return null;
}

/* ==========================================================================
 * 3. 다국어 문구
 * ========================================================================== */

/**
 * 한국어 문구이다.
 * @type {Object<string, string>}
 */
const TEXT_KO = {
  'app.title': 'Hellmarble',
  'app.subtitle': '주사위 두 개로 떠나는 세계 일주 보드게임',
  'menu.new': '게임 시작',
  'menu.load': '불러오기',
  'menu.settings': '설정',
  'common.yes': '예',
  'common.no': '아니오',
  'common.ok': '확인',
  'common.back': '뒤로',
  'common.menu': '메인 메뉴',
  'game.forfeit': '포기',
  'confirm.forfeit.title': '게임을 포기하시겠습니까?',
  'confirm.forfeit.text': '포기하면 즉시 패배하며, 참가비를 돌려받을 수 없습니다.',
  'confirm.forfeit.yes': '포기하고 패배하기',
  'common.none': '없음',
  'common.count': '{n}개',
  'slot.new': '저장 슬롯 선택',
  'slot.newHint': '새 게임을 저장할 슬롯을 선택하세요.',
  'slot.load': '불러오기',
  'slot.loadHint': '불러올 슬롯을 선택하세요.',
  'slot.name': '슬롯 {n}',
  'slot.empty': '비어 있음',
  'slot.lobby': '대기실',
  'slot.playing': '{league} 진행 중',
  'slot.overwriteTitle': '덮어쓰기 확인',
  'slot.overwrite': '슬롯 {n}에 이미 저장된 데이터가 있습니다.\n덮어쓰시겠습니까?\n덮어쓰지 않고 저장된 데이터를 불러올 수도 있습니다.',
  'slot.overwriteYes': '덮어쓰기',
  'name.title': '이름 / 닉네임 입력',
  'name.hint': '게임에서 사용할 이름을 입력하세요. (최대 {n}자)',
  'name.default': '플레이어',
  'name.submit': '대기실로 이동',
  'lobby.title': '대기실',
  'lobby.welcome': '{name} 님, 참여할 리그를 선택하세요.',
  'lobby.money': '보유 금액',
  'lobby.fee': '참가비',
  'lobby.free': '무료',
  'lobby.cash': '시작 자금',
  'lobby.reward': '승리 보상',
  'lobby.multiplier': '금액 배율',
  'lobby.times': '{n}배',
  'lobby.rivals': '상대',
  'lobby.join': '참여하기',
  'lobby.shortTitle': '참여 불가',
  'lobby.short': '돈이 부족하여 {league}에 참여할 수 없습니다.\n필요 금액 : {fee}\n보유 금액 : {money}',
  'lobby.confirmTitle': '참여 확인',
  'lobby.confirm': '{league}에 참여하시겠습니까?\n참가비 {fee}이 보유 금액에서 차감됩니다.',
  'lobby.confirmFree': '{league}에 참여하시겠습니까?\n참가비는 없습니다.',
  'lobby.noItems': '이 리그에서는 소모형 아이템을 사용할 수 없습니다. 가진 아이템은 대기실에 그대로 둡니다.',
  'lobby.whiteNote': '{league}는 보유 금액이 {limit} 미만일 때에만 나타납니다. 참가비 없이 {cash}으로 시작하며, 승리하면 {reward}을 받고 패배해도 잃는 돈이 없습니다. 소모형 아이템은 사용할 수 없습니다.',
  'lobby.note': '승리하면 게임에서 가진 돈과 땅, 건물의 가치를 돌려받습니다. 게임에 가져간 소모형 아이템은 승리·패배와 관계없이 쓰지 않고 남은 것이 대기실로 돌아오며, 게임에서 사용한 것만 사라집니다. 색상과 모양은 사라지지 않습니다. 패배하면 참가비를 잃습니다.',
  'mcp.items.rules': '[아이템 규칙]\n- 대기실 상점에서 아이템을 사서 보관하거나, 구매 가격의 {itemSell}%에 되팔 수 있다.\n- 게임에 들어갈 때 그 코스에서 쓸 수 있는 소모형 아이템을 모두 가져가며(다른 코스에서만 쓰는 아이템은 대기실에 남는다), 게임이 끝나면 이기든 지든 쓰지 않고 남은 아이템은 대기실로 돌아온다. 게임에서 사용한 아이템만 사라진다.\n- 아이템은 종류마다 게임 한 판에 한 번만 쓸 수 있다. (천사의 빛은 두 번까지) 주사위 조작형 아이템(빅 다이즈, 스몰 다이즈)은 둘을 합쳐 한 번이다. 비밀쿠폰이나 텔레파시 카드로 얻은 것(우대권, 무전기, 천사의 빛, 블랙홀 탈출포트)과는 따로 센다.\n- 쓸 상황이 되면 게임이 사용 여부를 묻는 아이템과, 주사위를 굴릴 차례에 아이템 목록에서 직접 쓰는 아이템이 있다.\n[아이템 목록]',
  'mcp.items.entry': '- {item} ({price}, 사용 코스 : {course}) : {description} [사용 시점] {when}',
  'mcp.items.guide': '- 대기실의 "상점"(lobby.shop)은 구매 / 판매 탭(items.tab), 분류 버튼(items.filter), 아이템 카드 목록으로 되어 있다. 카드를 누르면(items.pick) 상세 팝업이 뜨고, 수량을 정한 뒤(items.less / items.more / items.max) 구매 또는 판매(items.trade)한다. 상세 팝업은 items.back, 상점은 items.close 로 닫는다.\n- "아이템 확인"(lobby.items)과 게임 중 자기 차례의 "아이템"(game.items)은 보유 아이템 목록을 연다. 게임 중 주사위를 굴릴 차례에는 상세 팝업의 "사용"(items.use)으로 우주여행 초청장과 주사위 조작형 아이템을 쓸 수 있으며, 한 번 더 확인받는다.\n- 통행료·이용료를 낼 때 우대권이 있으면 창 하나가 뜬다. 창의 글에 지불할 금액이 함께 적혀 있고, 가진 것에 따라 "비밀쿠폰 우대권 사용"(dialog.answer, coupon), "아이템 우대권 사용"(dialog.answer, item), "사용하지 않음"(dialog.answer, no) 가운데 고른다.\n- 무인도에서 무전기가 있을 때에도 창 하나가 떠서 "비밀쿠폰 무전기 사용"(coupon), "아이템 무전기 사용"(item), "사용하지 않음"(no) 가운데 고른다. 무인도에 막 도착했을 때에는 아이템 무전기만 쓸 수 있다.\n- 설정의 "설정 초기화"는 확인 후 언어와 화면을 기본값으로 되돌리고 저장 슬롯 세 개를 비운 뒤 메인 메뉴로 간다.',
  'lobby.shop': '상점',
  'lobby.items': '아이템 확인',
  'item.owned': '보유 아이템',
  'item.none': '보유한 아이템이 없습니다.',
  'item.hint.barred': '{league}에서는 소모형 아이템을 사용할 수 없습니다. 가진 아이템은 대기실에 그대로 있습니다. 가진 부적의 자세한 설명은 여기에서 볼 수 있습니다.',
  'item.noneLobby': '보유한 아이템이 없습니다. 대기실의 상점에서 구매할 수 있습니다.',
  'item.noneIn': '이 분류에는 아이템이 없습니다.',
  'item.total': '{kinds}종 · {count}개',
  'item.count': '보유 수량',
  'item.hint.lobby': '아이템을 누르면 자세한 설명을 볼 수 있고, 색상과 모양, 부적은 그 자리에서 장착할 수 있습니다. 게임에 참여하면 그 코스에서 쓸 수 있는 소모형 아이템을 모두 가져가며, 게임이 끝나면 쓰지 않고 남은 것은 대기실로 돌아옵니다. 게임에서 사용한 아이템만 사라집니다. 색상과 모양, 부적은 사라지지 않습니다.',
  'item.hint.game': '이번 게임에 가져온 아이템입니다. 아이템을 누르면 자세한 설명을 볼 수 있고, 주사위를 굴릴 차례에 쓰는 아이템은 그 자리에서 사용할 수 있습니다. 쓰지 않은 아이템은 게임이 끝나면 대기실로 돌아갑니다. 가진 부적의 자세한 설명도 여기에서 볼 수 있습니다.',
  'item.category.all': '전체',
  'item.category.support': '보조',
  'item.category.travel': '이동',
  'item.category.dice': '주사위',
  'item.category.color': '색상',
  'item.category.shape': '모양',
  'item.info.when': '사용 시점',
  'item.info.limit': '사용 제한',
  'item.info.state': '이번 게임',
  'item.state.ready': '사용 가능',
  'item.state.spent': '사용 완료',
  'item.limit.single': '게임 한 판에 한 번만 쓸 수 있습니다. 여러 개를 가지고 있어도 한 번입니다.',
  'item.limit.shared': '게임 한 판에 한 번만 쓸 수 있습니다. {items} 가운데 어느 것을 쓰든 합쳐서 한 번입니다.',
  'lobby.look': '내 말',
  'lobby.needLook': '색상과 모양을 하나씩 장착해야 리그에 참여할 수 있습니다.\n대기실의 "아이템 확인"에서 가지고 있는 색상과 모양을 장착하세요.',
  'equip.none.color': '색상 없음',
  'equip.none.shape': '모양 없음',
  'equip.slot.color': '색상',
  'equip.slot.shape': '모양',
  'equip.color.brief': '말과 땅에 칠해지는 내 색상',
  'equip.color.description': '게임에서 나를 나타내는 색상입니다. 내 말과 플레이어 카드, 내가 소유한 땅의 표시가 이 색으로 칠해집니다. 장착형 아이템이라 써도 사라지지 않고, 게임이 끝난 뒤에도 그대로 남습니다.',
  'equip.color.when': '대기실의 아이템 확인 창이나 상점에서 장착합니다. 색상과 모양을 하나씩 장착해야 리그에 참여할 수 있습니다.',
  'equip.shape.brief': '말과 땅에 그려지는 내 모양',
  'equip.shape.description': '게임에서 나를 나타내는 모양입니다. 내 말과 내가 소유한 땅의 표시에 이 모양이 그려집니다. 장착형 아이템이라 써도 사라지지 않고, 게임이 끝난 뒤에도 그대로 남습니다.',
  'equip.shape.when': '대기실의 아이템 확인 창이나 상점에서 장착합니다. 색상과 모양을 하나씩 장착해야 리그에 참여할 수 있습니다.',
  'equip.limit.basic': '처음부터 주어지는 기본 아이템입니다. 사고팔 수 없으며 사라지지 않습니다.',
  'equip.limit.extra': '종류마다 하나만 가질 수 있습니다. 소모되지 않지만, 상점에 판매하면 사라집니다.',
  'equip.info.owned': '보유',
  'equip.info.state': '장착',
  'equip.owned': '보유 중',
  'equip.missing': '보유하지 않음',
  'equip.on': '장착 중',
  'equip.off': '장착하지 않음',
  'equip.equip': '장착',
  'equip.done': '{item}을(를) 장착했습니다.',
  'equip.sold': '장착하고 있던 {slot}을(를) 판매했습니다. 다른 {slot}을(를) 장착해야 리그에 참여할 수 있습니다.',
  'store.have': '이미 가지고 있습니다. 장착형 아이템은 종류마다 하나만 가질 수 있습니다.',
  'store.boughtOne': '{item}을(를) 구매했습니다.',
  'store.soldOne': '{item}을(를) 판매하고 {amount}을 받았습니다.',
  'item.red.title': '빨강',
  'item.blue.title': '파랑',
  'item.green.title': '초록',
  'item.yellow.title': '노랑',
  'item.purple.title': '보라',
  'item.sky.title': '하늘색',
  'item.lime.title': '연한 초록색',
  'item.hotpink.title': '진한 분홍색',
  'item.pink.title': '연한 분홍색',
  'item.brown.title': '갈색',
  'item.graphite.title': '그라파이트',
  'item.bronze.title': '브론즈',
  'item.silver.title': '실버',
  'item.gold.title': '골드',
  'item.star.title': '별',
  'item.triangle.title': '삼각형',
  'item.square.title': '사각형',
  'item.diamond.title': '마름모',
  'item.plus.title': '더하기 (+)',
  'item.minus.title': '빼기 (−)',
  'item.times.title': '곱하기 (×)',
  'item.divide.title': '나누기 (÷)',
  'item.spa.title': '온천 (♨)',
  'item.club.title': '클로버 (♧)',
  'item.spade.title': '스페이드 (♤)',
  'item.heart.title': '하트 (♡)',
  'item.note.title': '음표 (♪)',
  'item.notes.title': '겹음표 (♬)',
  'mcp.equips.rules': '[장착형 아이템]\n- 색상과 모양이 있으며, 하나씩 장착해야 리그에 참여할 수 있다. 장착한 색상과 모양은 게임에서 사용자의 말과 소유한 땅의 표시에 쓰인다.\n- 처음에는 색상 5종(빨강, 파랑, 초록, 노랑, 보라)과 모양 4종(별, 삼각형, 사각형, 마름모)을 가지고, 빨강과 별을 장착한 채로 시작한다. 이 기본 아이템은 사고팔 수 없다.\n- 상점에서 다른 색상과 모양을 살 수 있다. 종류마다 하나만 가질 수 있고 소모되지 않으며, 팔면 구매 가격의 {itemSell}%를 돌려받고 사라진다. 장착하고 있던 것을 팔면 다른 것을 장착해야 한다.\n- 게임 중에는 바꿀 수 없다. 인공지능 플레이어는 사용자와 겹치지 않는 기본 색상과 모양을 쓴다.\n[상점에서 파는 색상과 모양]',
  'mcp.equips.entry': '- [{slot}] {item} ({price})',
  'mcp.equips.guide': '- 색상과 모양(장착형 아이템)은 상점과 "아이템 확인"의 분류 "색상", "모양"에 있다. 카드를 눌러(items.pick) 뜬 상세 팝업에서 "장착"(items.equip)을 누르면 장착된다. 상점에서는 구매와 판매(items.trade)도 한다. 대기실의 "내 말"에 지금 장착한 색상과 모양이 보이며, 둘 중 하나라도 비어 있으면 리그에 참여할 수 없다.',
  'item.category.charm': '부적',
  'charm.grade.common': '일반',
  'charm.grade.uncommon': '고급',
  'charm.grade.rare': '희귀',
  'charm.grade.legend': '전설',
  'charm.info.grade': '등급',
  'charm.info.sell': '판매 가격',
  'charm.double.brief': '더블이 나올 확률 +{chance}%',
  'charm.double.description': '게임에서 주사위를 굴릴 때 더블이 나올 확률이 {chance}% 높아집니다. (보통 주사위라면 약 16.7% → 약 {total}%) 더블이 나오면 주사위를 한 번 더 굴리고, 무인도에 갇혀 있다면 바로 탈출합니다.',
  'charm.discount.brief': '땅을 살 때 {chance}% 확률로 {percent}% 할인',
  'charm.discount.description': '게임에서 땅을 살 때 {chance}% 확률로 {percent}% 할인된 값만 냅니다. 할인 전 가격만큼의 돈이 있어야 살 수 있는 것은 그대로입니다. 건물 건설, 통행료와 이용료, 사회복지기금, 비밀쿠폰으로 내는 돈에는 적용되지 않습니다.',
  'charm.toll.brief': '통행료·이용료를 낼 때 {chance}% 확률로 {percent}% 할인',
  'charm.toll.description': '게임에서 다른 플레이어에게 통행료나 이용료(우주여행 이용료 포함)를 내야 할 때 {chance}% 확률로 {percent}% 할인된 금액만 냅니다. 돈이 모자라 땅을 매각해야 하는 경우에도 매각하기 전에 먼저 할인됩니다. 땅 구매와 건물 건설, 사회복지기금, 비밀쿠폰으로 은행에 내는 돈에는 적용되지 않습니다.',
  'charm.redraw.brief': '손해 보는 비밀쿠폰을 {chance}% 확률로 다시 뽑기',
  'charm.redraw.description': '게임에서 비밀쿠폰을 뽑을 때, 벌금이나 세금을 내거나 땅을 잃거나 무인도로 가는 것처럼 나에게 바로 손해가 되는 쿠폰이 나올 차례이면 {chance}% 확률로 그 쿠폰을 덱 맨 뒤로 보내고 다시 뽑습니다.',
  'charm.build.brief': '땅을 살 때 {chance}% 확률로 {building} 무료 건설',
  'charm.build.description': '게임에서 땅을 살 때 {chance}% 확률로 {building} 한 채가 그 자리에서 무료로 지어집니다. 땅을 막 샀을 때에만 적용되고, 건물을 지을 수 없는 땅에는 적용되지 않습니다.',
  'charm.build.revisit': '게임에서 땅을 살 때, 그리고 내 땅에 다시 도착했을 때 그 땅에 {building}이(가) 없으면 {chance}% 확률로 {building} 한 채가 무료로 지어집니다. 건물을 지을 수 없는 땅에는 적용되지 않습니다.',
  'charm.build.space': '우주여행 코스에서는 건물 대신 {base}% 확률로 기지 하나가 무료로 지어지는 효과로 바뀝니다. (기지를 지을 수 있는 별에만 적용됩니다.)',
  'charm.when': '대기실의 아이템 확인 창에서 장착합니다. 한 번에 하나만 장착할 수 있고, 장착하지 않아도 리그에 참여할 수 있습니다. 장착한 부적의 효과는 그 게임 내내 적용됩니다.',
  'charm.limit': '소모되지 않습니다. 같은 부적을 여러 개 가질 수 있고, 상점에 판매하면 사라집니다.',
  'charm.unequip': '장착 해제',
  'charm.undone': '{item}의 장착을 해제했습니다.',
  'charm.sold': '장착하고 있던 부적을 모두 판매하여 장착이 해제되었습니다.',
  'charm.shopOnly': '부적은 대기실의 아이템 확인 창에서 장착합니다.',
  'charm.gameOnly': '게임 중에는 부적을 바꿀 수 없습니다. 이번 게임에는 참여할 때 장착하고 있던 부적이 적용됩니다.',
  'use.pass.title': '우대권 사용!',
  'use.pass.text': '{tile} 통행료·이용료 면제',
  'use.pass.travel': '{tile} 이용료 면제',
  'use.pass.stamp': '면제',
  'use.radio.title': '무전기 사용!',
  'use.radio.text': '무인도에서 탈출합니다.',
  'use.radio.stamp': '탈출',
  'use.source.coupon': '비밀쿠폰',
  'use.source.item': '아이템',
  'defeat.bankrupt.title': '{player}님이 파산하였습니다.',
  'defeat.forfeit.title': '{player}님이 포기하였습니다.',
  'charm.flash': '{item} 발동!',
  'charm.flash.double': '더블이 나왔습니다!',
  'charm.flash.discount': '{tile} 땅값 {percent}% 할인',
  'charm.flash.toll': '{tile} 통행료·이용료 {percent}% 할인',
  'charm.flash.build': '{tile}에 {building} 한 채를 무료로 지었습니다.',
  'charm.flash.redraw': '[{coupon}] 쿠폰을 덱 맨 뒤로 보내고 다시 뽑습니다.',
  'ticket.brief': '부적 {n}개를 무작위로 획득',
  'ticket.description': '구매하면 바로 사용되어 부적 {n}개를 무작위로 얻습니다. 이미 가진 부적이 또 나올 수 있습니다. 부적은 따로 살 수 없고 추첨으로만 얻으며, 얻은 부적은 대기실의 아이템 확인 창에서 장착합니다.',
  'ticket.when': '구매하는 즉시 사용됩니다.',
  'ticket.limit': '구매 횟수에는 제한이 없습니다. 부적을 하나씩 같은 확률로 따로 추첨합니다.',
  'ticket.odds': '등급별 확률',
  'ticket.chance': '{grade} {percent}%',
  'ticket.draw': '추첨하기',
  'draw.title': '부적 추첨 결과',
  'draw.best': '{grade} 등급 획득!',
  'draw.tally': '{grade} {n}개',
  'draw.done': '확인',
  'draw.again': '한 번 더',
  'item.charmticket.title': '부적 추첨권',
  'item.charmticket10.title': '부적 10개 추첨권',
  'item.brokendice.title': '부서진 주사위',
  'item.oldcoin.title': '낡은 동전',
  'item.expiredvoucher.title': '사용기한 지난 상품권',
  'item.tornlottery.title': '찢어진 복권',
  'item.realtor.title': '동네 공인중개사 명함',
  'item.scratched.title': '이미 긁은 복권',
  'item.woodendice.title': '나무 주사위',
  'item.memorialcoin.title': '기념 주화',
  'item.mysteryvoucher.title': '정체불명의 상품권',
  'item.fortunecookie.title': '포춘 쿠키',
  'item.lawfirm.title': '대형 로펌 명함',
  'item.stock.title': '주식 증서',
  'item.expresscard.title': '익스프레스 카드',
  'item.president.title': '대통령 명함',
  'item.pendant.title': '행운의 펜던트',
  'item.etf.title': '레버리지 ETF 증서',
  'item.blackcard.title': '블랙 카드',
  'mcp.leagues.rules': '[리그]\n- 대기실에서 리그를 골라 참여한다. 참가비를 내고 시작하며, 승리하면 게임에서 가진 돈과 땅, 건물의 가치를 대기실 금액으로 얻고 패배하면 참가비를 잃는다. 금액 배율은 월급, 땅값, 건설비, 통행료와 이용료, 비밀쿠폰의 금액에 모두 적용된다.',
  'mcp.leagues.entry': '- {league} : 참가비 {fee}, 시작 자금 {cash}, 금액 배율 {n}배, {rivals}.',
  'mcp.leagues.reward': '승리 보상은 {reward}으로 정해져 있고 그 밖의 보상은 없다.',
  'mcp.leagues.hidden': '대기실 보유 금액이 {limit} 이상이면 리그 목록에 나타나지 않는다.',
  'mcp.leagues.noItems': '소모형 아이템을 쓸 수 없다. (색상, 모양, 부적과 비밀쿠폰은 그대로 쓴다.)',
  'mcp.charms.rules': '[부적]\n- 부적은 장착형 아이템이다. 하나만 장착할 수 있고 장착하지 않아도 리그에 참여할 수 있다. 장착한 부적의 효과는 그 게임 내내 적용된다. 인공지능 플레이어는 Red 리그에서만 한 명이 일반 또는 고급 부적 하나를 장착한다.\n- 상점에서 직접 살 수 없고, 부적 추첨권({ticket})이나 부적 10개 추첨권({ticket10})을 사면 그 자리에서 무작위로 얻는다. 같은 부적이 또 나올 수 있다.\n- 새로 시작한 슬롯은 {starter} 하나를 가지고 장착한 채로 시작한다. (이미 저장된 슬롯에는 주지 않는다.)\n- 등급은 일반, 고급, 희귀, 전설이 있다. 추첨에서 고급은 일반의 5분의 1, 희귀는 100분의 1, 전설은 2000분의 1의 확률로 나온다. ({odds})\n- 가진 부적은 상점에서 팔 수 있다. 판매 가격은 등급으로 정해진다. ({sells})\n- 부적의 자세한 설명은 아이템 확인 창(대기실의 "아이템 확인", 게임 중의 "아이템")에서만 볼 수 있고, 장착은 대기실에서만 한다. 게임 중 플레이어 정보 창(game.player)에는 그 플레이어가 장착한 부적의 이름만 나온다. 그 밖에는 효과가 일어났을 때에만 알림이 뜬다.\n[부적 목록]',
  'mcp.charms.entry': '- [{grade}] {item} : {brief}',
  'mcp.charms.guide': '- 부적 추첨 : 상점의 분류 "부적"에서 추첨권 카드를 누르고(items.pick) 상세 팝업의 "추첨하기"(items.trade)를 누르면 돈이 빠지고 추첨 결과가 뜬다. "확인"(items.done)으로 닫는다. 가진 부적은 판매 탭에서 판다.\n- 부적 장착 : "아이템 확인"의 분류 "부적"에서 카드를 누르고 "장착"(items.equip) 또는 "장착 해제"(items.unequip)를 누른다.',
  'item.pass.title': '우대권',
  'item.pass.brief': '통행료·이용료 한 번 면제',
  'item.pass.description': '세계여행 코스에서만 쓸 수 있습니다. 다른 플레이어의 땅에 도착했을 때 내야 하는 통행료와 이용료를 한 번 면제받습니다. 다른 플레이어가 콜롬비아 호를 가지고 있을 때 내는 우주여행 이용료에도 쓸 수 있습니다. 비밀쿠폰으로 얻은 우대권과는 따로 보관되고 따로 쓰입니다. 쓰면 한 개가 사라집니다.',
  'item.pass.when': '통행료나 이용료를 내야 할 때 게임이 사용할지 물어봅니다.',
  'item.radio.title': '무전기',
  'item.radio.brief': '무인도에서 바로 탈출',
  'item.radio.description': '세계여행 코스에서만 쓸 수 있습니다. 무인도에 갇혔을 때 더블을 기다리지 않고 바로 탈출한 뒤 주사위를 굴려 이동합니다. 비밀쿠폰으로 얻은 무전기와는 따로 보관되고 따로 쓰입니다. 쓰면 한 개가 사라집니다.',
  'item.radio.when': '무인도에 도착했을 때와, 갇혀 있는 동안 주사위를 굴리기 직전에 게임이 사용할지 물어봅니다.',
  'item.invitation.title': '우주여행 초청장',
  'item.invitation.brief': '우주여행 무료 탑승',
  'item.invitation.description': '세계여행 코스에서만 쓸 수 있습니다. 주사위를 굴리는 대신 우주여행 칸으로 곧바로 이동해 탑승하고 차례를 마칩니다. 콜롬비아 호의 주인이 있어도 이용료를 내지 않으며, 가는 길에 출발지를 지나면 월급도 받습니다. 다음 차례에는 보드의 원하는 칸으로 이동할 수 있습니다. 쓰면 한 개가 사라집니다.',
  'item.invitation.when': '내가 주사위를 굴릴 차례에 아이템 목록에서 직접 사용합니다.',
  'item.timeinvite.title': '시간여행 초청장',
  'item.timeinvite.brief': '시간여행 무료 탑승',
  'item.timeinvite.description': '우주여행 코스에서만 쓸 수 있습니다. 주사위를 굴리는 대신 시간여행 칸으로 곧바로 이동해 탑승하고 차례를 마칩니다. 타임머신의 주인이 있어도 이용료를 내지 않으며, 가는 길에 지구를 지나면 월급도 받습니다. 다음 차례에는 주사위를 굴리지 않고 보드의 원하는 칸으로 바로 이동할 수 있습니다. 텔레파시 카드의 타임머신 초청장과는 따로 셉니다. 쓰면 한 개가 사라집니다.',
  'item.timeinvite.when': '내가 주사위를 굴릴 차례에 아이템 목록에서 직접 사용합니다.',
  'item.bigdice.title': '빅 다이즈',
  'item.bigdice.brief': '4·5·6만 나오는 주사위',
  'item.bigdice.description': '어느 코스에서나 쓸 수 있습니다. 이번에 굴리는 주사위 두 개를 4, 5, 6 눈만 나오는 주사위로 바꿉니다. (1, 2, 3 눈이 각각 4, 5, 6 으로 바뀝니다.) 멀리 가고 싶을 때 좋습니다. 효과는 사용한 차례의 주사위 한 번에만 적용되어, 더블이 나와 다시 굴릴 때에는 보통 주사위로 돌아갑니다. 사용하는 즉시 한 개가 사라지며, 그 차례에 주사위를 굴리지 않아도 돌려받지 못합니다.',
  'item.bigdice.when': '내가 주사위를 굴릴 차례에 아이템 목록에서 직접 사용한 뒤 주사위를 굴립니다.',
  'item.smalldice.title': '스몰 다이즈',
  'item.smalldice.brief': '1·2·3만 나오는 주사위',
  'item.smalldice.description': '어느 코스에서나 쓸 수 있습니다. 이번에 굴리는 주사위 두 개를 1, 2, 3 눈만 나오는 주사위로 바꿉니다. (4, 5, 6 눈이 각각 1, 2, 3 으로 바뀝니다.) 가까운 칸에 멈추고 싶을 때 좋습니다. 효과는 사용한 차례의 주사위 한 번에만 적용되어, 더블이 나와 다시 굴릴 때에는 보통 주사위로 돌아갑니다. 사용하는 즉시 한 개가 사라지며, 그 차례에 주사위를 굴리지 않아도 돌려받지 못합니다.',
  'item.smalldice.when': '내가 주사위를 굴릴 차례에 아이템 목록에서 직접 사용한 뒤 주사위를 굴립니다.',
  'store.title': '아이템 상점',
  'store.money': '보유 금액',
  'store.hint': '아이템을 누르면 자세한 설명을 보고 사고팔 수 있습니다. 판매하면 구매 가격의 {n}%를 돌려받습니다.',
  'store.tab.buy': '구매',
  'store.tab.sell': '판매',
  'store.nothing': '판매할 아이템이 없습니다. 구매 탭에서 아이템을 살 수 있습니다.',
  'store.owned': '보유 ×{n}',
  'store.priceBuy': '구매 가격',
  'store.priceSell': '판매 가격 ({n}%)',
  'store.quantity': '수량',
  'store.less': '수량 줄이기',
  'store.more': '수량 늘리기',
  'store.max': '최대',
  'store.total.buy': '결제 금액',
  'store.total.sell': '받을 금액',
  'store.buy': '{n}개 구매',
  'store.sell': '{n}개 판매',
  'store.bought': '{item} {n}개를 구매했습니다. (보유 {total}개)',
  'store.sold': '{item} {n}개를 판매하고 {amount}을 받았습니다. (보유 {total}개)',
  'store.short': '보유 금액이 부족하여 구매할 수 없습니다.',
  'settings.reset': '설정 초기화',
  'settings.resetTitle': '설정과 저장 데이터 초기화',
  'settings.resetText': '언어와 다크 모드를 기본 설정으로 되돌리고, 세 슬롯과 아이템을 포함한 모든 저장 데이터를 삭제한 뒤 메인 메뉴로 이동합니다. 계속하시겠습니까?',
  'settings.resetDoneTitle': '초기화 완료',
  'settings.resetDone': '설정과 저장 데이터를 초기화했습니다.',
  'item.use': '사용',
  'item.use.title': '{item} 사용',
  'item.use.note': '지금 사용하시겠습니까? 사용하는 즉시 한 개가 사라지며 되돌릴 수 없습니다.',
  'item.block.ask': '직접 사용하는 아이템이 아닙니다. 쓸 상황이 되면 게임이 사용할지 물어봅니다.',
  'item.block.turn': '주사위를 굴릴 차례에만 사용할 수 있습니다.',
  'item.block.spent': '이번 게임에서 이미 사용했습니다. 게임 한 판에 한 번만 쓸 수 있습니다.',
  'item.block.shared': '이번 게임에서 {items} 가운데 하나를 이미 사용했습니다. 합쳐서 한 판에 한 번만 쓸 수 있습니다.',
  'league.white': 'White 리그',
  'league.green': 'Green 리그',
  'league.orange': 'Orange 리그',
  'league.red': 'Red 리그',
  'league.white.rivals': '인공지능 1명 (1:1 대결)',
  'league.green.rivals': '인공지능 1~3명 (2명일 확률이 높음)',
  'league.orange.rivals': '인공지능 1~3명 (3명일 확률이 높음)',
  'league.red.rivals': '인공지능 1~3명 (3명일 확률이 높고 1명은 드묾), 그중 한 명은 일반 또는 고급 부적 장착',
  'settings.title': '설정',
  'settings.language': '언어',
  'settings.dark': '다크 모드',
  'settings.on': '켜짐',
  'settings.off': '꺼짐',
  'language.ko': '한국어',
  'language.en': 'English',
  'player.ai': '컴퓨터 {n}',
  'player.you': '나',
  'player.cash': '보유 현금',
  'player.lands': '땅 {n}곳',
  'player.turn': '차례',
  'player.island': '무인도 (남은 턴 {n})',
  'player.boarded': '우주여행 탑승',
  'player.bankrupt': '파산',
  'game.roll': '주사위 굴리기',
  'game.items': '아이템',
  'game.turn': '{player} 님의 차례',
  'game.fund': '사회복지기금',
  'game.bank': '은행',
  'game.league': '{league} · 배율 {n}배',
  'game.players': '플레이어',
  'game.log': '진행 기록',
  'game.travelHere': '이곳으로 이동',
  'game.closeHint': '다시 클릭하면 닫힙니다.',
  'hint.roll': '당신의 차례입니다. 주사위를 굴리세요.',
  'hint.double': '더블! 주사위를 한 번 더 굴리세요.',
  'hint.loaded': '{item} 적용 중 : 이번 주사위는 {faces} 눈만 나옵니다.',
  'hint.island': '무인도에 갇혀 있습니다. 더블이 나오면 탈출합니다. (남은 턴 {n})',
  'hint.release': '이번 차례에 무인도에서 풀려납니다. 주사위를 굴리세요.',
  'hint.travel': '우주여행! 이동할 칸을 클릭한 뒤 [이곳으로 이동] 을 누르세요.',
  'hint.timetravel': '시간여행! 주사위를 굴리지 않고 이동합니다. 이동할 칸을 클릭한 뒤 [이곳으로 이동] 을 누르세요.',
  'hint.wait': '{player} 님이 차례를 진행하고 있습니다.',
  'intro.rolling': '{player} 님이 턴 순서를 정할 주사위를 굴립니다.',
  'intro.title': '턴 순서 결정',
  'intro.text': '주사위 두 개의 합이 큰 순서대로 진행합니다. (동점이면 플레이어 번호가 낮은 순)',
  'intro.start': '게임 시작',
  'type.city': '일반 도시',
  'type.korea': '한국 도시',
  'type.special': '특수 시설',
  'type.start': '출발지',
  'type.coupon': '비밀쿠폰',
  'type.space': '우주여행',
  'type.island': '무인도',
  'type.fund': '사회복지기금 본부',
  'type.desk': '사회복지기금 접수처',
  'desc.city': '구매한 뒤 다시 도착하면 별장(최대 2개), 빌딩(1개), 호텔(1개)을 한 턴에 하나씩 지을 수 있습니다.',
  'desc.korea': '한국 도시입니다. 건물을 지을 수 없습니다.',
  'desc.special': '특수 시설입니다. 건물을 지을 수 없습니다.',
  'desc.columbia': '특수 시설입니다. 건물을 지을 수 없습니다. 소유하면 우주여행 칸에 도착한 다른 플레이어에게 우주여행 이용료를 받습니다.',
  'desc.start': '모든 플레이어가 이곳에서 시작합니다. 이곳을 지나거나 멈추면 월급을 받습니다.',
  'desc.coupon': '비밀쿠폰을 한 장 뽑아 적힌 내용대로 이행합니다.',
  'desc.space': '도착하면 탑승 상태가 되어 다음 차례에 원하는 칸으로 이동합니다. 콜롬비아 호의 소유자가 있으면 이용료를 지불해야 합니다.',
  'desc.island': '도착하면 갇힙니다. 더블이 나오면 즉시 탈출하고, 그렇지 않으면 2턴을 쉰 뒤 3턴 째에 이동합니다.',
  'desc.fund': '쌓여 있는 사회복지기금을 모두 가져갑니다.',
  'desc.desk': '사회복지기금을 납부합니다. 돈이 부족하면 가진 만큼만 내며 패배하지 않습니다.',
  'tile.start': '출발지',
  'tile.coupon': '비밀쿠폰',
  'tile.space': '우주여행',
  'tile.island': '무인도',
  'tile.fund': '사회복지기금 본부',
  'tile.desk': '사회복지기금 접수처',
  'tile.taipei': '타이페이',
  'tile.hongkong': '홍콩',
  'tile.manila': '마닐라',
  'tile.jeju': '제주도',
  'tile.singapore': '싱가폴',
  'tile.cairo': '카이로',
  'tile.istanbul': '이스탄불',
  'tile.athens': '아테네',
  'tile.copenhagen': '코펜하겐',
  'tile.stockholm': '스톡홀름',
  'tile.concorde': '콩코드 여객기',
  'tile.zurich': '취리히',
  'tile.berlin': '베를린',
  'tile.montreal': '몬트리올',
  'tile.buenosaires': '부에노스 아이레스',
  'tile.saopaulo': '상파울로',
  'tile.sydney': '시드니',
  'tile.busan': '부산',
  'tile.hawaii': '하와이',
  'tile.lisbon': '리스본',
  'tile.madrid': '마드리드',
  'tile.tokyo': '도쿄',
  'tile.columbia': '콜롬비아 호',
  'tile.paris': '파리',
  'tile.rome': '로마',
  'tile.london': '런던',
  'tile.newyork': '뉴욕',
  'tile.seoul': '서울',
  'building.villa': '별장',
  'building.building': '빌딩',
  'building.hotel': '호텔',
  'info.price': '땅 구매',
  'info.cost': '{building} 건설',
  'info.toll': '통행료',
  'info.fee': '{building} 이용료',
  'info.feeEach': '{building} 이용료 (1개당)',
  'info.spaceFee': '우주여행 이용료',
  'info.salary': '월급',
  'info.welfare': '납부 금액',
  'info.fund': '쌓인 기금',
  'info.owner': '소유자',
  'info.buildings': '건물',
  'info.total': '현재 통행료·이용료 합계',
  'info.sale': '은행 매각 시 ({n}%)',
  'ask.buy.title': '땅을 구매하시겠습니까?',
  'ask.buy.yes': '구매 ({amount})',
  'ask.buy.no': '구매하지 않음',
  'ask.build.title': '건물을 건설하시겠습니까?',
  'ask.build.text': '한 턴에 건물 하나만 지을 수 있습니다.',
  'ask.build.option': '{building} 건설 ({amount})',
  'ask.build.max': '{building} (더 지을 수 없음)',
  'ask.build.short': '{building} 건설 ({amount}) - 돈 부족',
  'ask.build.no': '건설하지 않음',
  'ask.sell.title': '지불할 돈이 부족합니다',
  'ask.sell.text': '지불할 금액 : {amount}\n보유 현금 : {cash}\n부족한 금액 : {short}\n\n지불할 돈이 마련될 때까지 매각할 땅을 선택하세요. (구매·건설 가격의 {n}%를 돌려받습니다.)',
  'ask.sell.option': '{tile} 매각 (+{amount})',
  'ask.pass.title': '우대권 사용',
  'ask.pass.text': '{tile}의 통행료·이용료를 내야 합니다.\n우대권을 사용하면 이 금액을 내지 않습니다.',
  'ask.pass.travel': '{tile} 이용료를 내야 합니다.\n아이템 우대권을 사용하면 이 금액을 내지 않습니다.',
  'ask.pass.due': '지불할 금액',
  'ask.pass.coupon': '비밀쿠폰 우대권 사용 (보유 {n}장)',
  'ask.pass.item': '아이템 우대권 사용 (보유 {n}개 · 게임당 1회)',
  'ask.radio.title': '무전기 사용',
  'ask.radio.text': '무인도에 갇혀 있습니다.\n무전기를 사용하면 즉시 탈출하여 주사위를 굴려 이동합니다.',
  'ask.radio.arrival': '무인도에 도착했습니다.\n아이템 무전기를 사용하면 갇히지 않고, 다음 차례에 주사위를 굴려 이동합니다.',
  'ask.radio.coupon': '비밀쿠폰 무전기 사용 (보유 {n}장)',
  'ask.radio.item': '아이템 무전기 사용 (보유 {n}개 · 게임당 1회)',
  'ask.keep': '사용하지 않음',
  'result.win.title': '승리!',
  'result.win.text': '다른 플레이어가 모두 파산했습니다.\n게임에서 가진 돈과 땅, 건물의 가치를 모두 얻습니다.',
  'result.win.fixed': '다른 플레이어가 모두 파산했습니다.\n{league}의 승리 보상은 정해져 있습니다. (게임에서 가진 돈과 땅은 보상에 들어가지 않습니다.)',
  'result.cash': '보유 현금',
  'result.property': '땅과 건물의 가치',
  'result.reward': '획득 금액',
  'result.lose.title': '패배',
  'result.lose.text': '이번 게임에서 패배했습니다.\n잠시 후 대기실로 돌아갑니다.',
  'result.lose.free': '이번 게임에서 패배했습니다. 잃은 돈은 없습니다.\n잠시 후 대기실로 돌아갑니다.',
  'result.lobby': '대기실로',
  'coupon.header': '비밀쿠폰',
  'coupon.drawer': '{player} 님이 뽑은 쿠폰',
  'coupon.welfare.title': '사회복지기금',
  'coupon.welfare.text': '사회복지기금 접수처로 가시오.\n출발지를 거칠 경우 월급 수령.',
  'coupon.dividend.title': '사회복지기금 배당',
  'coupon.dividend.text': '사회복지기금 본부로 가시오.\n출발지를 거칠 경우 월급 수령.',
  'coupon.speeding.title': '과속 운전 벌금',
  'coupon.speeding.text': '과속 운전을 하였으므로 벌금 {amount}을 내시오.',
  'coupon.jeju.title': '관광 여행',
  'coupon.jeju.text': '제주도로 가시오.\n제주도를 구매한 다른 플레이어 존재 시 통행료 지불.\n출발지를 거칠 경우 월급 수령.',
  'coupon.busan.title': '관광 여행',
  'coupon.busan.text': '부산으로 가시오.\n부산을 구매한 다른 플레이어 존재 시 통행료 지불.\n출발지를 거칠 경우 월급 수령.',
  'coupon.seoul.title': '관광 여행',
  'coupon.seoul.text': '서울로 가시오.\n서울을 구매한 다른 플레이어 존재 시 통행료 지불.',
  'coupon.pass.title': '우대권',
  'coupon.pass.text': '이 우대권을 가지고 있을 경우, 사용 시 상대방의 장소를 통행료, 이용료 없이 지나갈 수 있습니다.\n보유할 수 있으며, 1회 사용 시 소모됨.',
  'coupon.radio.title': '무전기',
  'coupon.radio.text': '이 무전기를 가지고 있을 경우, 무인도에서 사용할 수 있으며, 사용 시 무인도 탈출.\n보유할 수 있으며, 1회 사용 시 소모됨.',
  'coupon.halfsale.title': '반액대매출',
  'coupon.halfsale.text': '당신이 보유한 땅 (도시, 특수 시설) 중 제일 비싼 곳을 반액 (50%) 으로 은행에 매각하십시오.\n해당 땅의 건물도 함께 매각됩니다.',
  'coupon.lottery.title': '복권 당첨',
  'coupon.lottery.text': '축하합니다. 복권에 당첨 되었습니다.\n당첨금 {amount} 획득.',
  'coupon.study.title': '해외 유학',
  'coupon.study.text': '학교 등록금을 내시오.\n등록금 {amount} 은행에 납부.',
  'coupon.invitation.title': '우주여행 초청장',
  'coupon.invitation.text': '우주항공국에서 우주여행초청장이 왔습니다.\n우주여행 칸으로 즉시 이동하시오.\n초청장이 있어 콜롬비아 호 소유 플레이어에게 이용료를 납부하지 않고도 탑승 가능.',
  'coupon.security.title': '방범비',
  'coupon.repair.title': '건물수리비',
  'coupon.incometax.title': '정기종합소득세',
  'coupon.tax.text': '본인이 소유한 모든 땅의 각 건물 별로 다음과 같이 은행에 지불하시오.\n호텔 - 1개 당 {hotel}\n빌딩 - 1개 당 {building}\n별장 - 1개 당 {villa}',
  'coupon.airtravel.title': '항공 여행',
  'coupon.airtravel.text': '콩코드 여객기를 타고 타이페이로 가시오.\n콩코드 여객기 소유 플레이어가 있으면 이용료 (통행료) 지불.\n출발지를 거쳐갈 경우 월급 수령.\n타이페이 소유 플레이어가 있으면 통행료 및 이용료 지불.',
  'coupon.hospital.title': '병원비 지불',
  'coupon.hospital.text': '병원에서 건강검진을 받았습니다.\n병원비 {amount}을 은행에 내시오.',
  'coupon.moving.title': '이사',
  'coupon.moving.text': '현재의 위치에서 뒤로 세 칸 이동하시오.\n(목적지 도착 후 해당 땅의 효과 적용.)',
  'coupon.scholarship.title': '장학금 혜택',
  'coupon.scholarship.text': '은행에서 장학금 {amount}을 받으시오.',
  'coupon.highway.title': '고속도로',
  'coupon.highway.text': '출발지로 가시오.',
  'coupon.amateur.title': '아마추어 대회 우승',
  'coupon.amateur.text': '은행에서 우승 상금 {amount}을 받으시오.',
  'coupon.pension.title': '연금 혜택',
  'coupon.pension.text': '은행에서 노후연금 {amount}을 받으시오.',
  'coupon.castaway.title': '무인도 표류',
  'coupon.castaway.text': '즉시 무인도로 가시오.\n이번에는 출발지를 거치더라도 월급을 수령하지 못함.',
  'log.order': '턴 순서 : {order}',
  'log.dice': '{player} 님의 주사위 : {a} + {b} = {sum}',
  'log.double': '{player} 님이 더블이 나와 주사위를 한 번 더 굴립니다.',
  'log.salary': '{player} 님이 월급 {amount}을 받았습니다.',
  'log.buy': '{player} 님이 {tile} 땅을 {amount}에 구매했습니다.',
  'log.build': '{player} 님이 {tile}에 {building} 건설을 마쳤습니다. ({amount})',
  'log.toll': '{player} 님이 {target} 님에게 {tile} 통행료·이용료 {amount}을 지불했습니다.',
  'log.spaceFee': '{player} 님이 {target} 님에게 우주여행 이용료 {amount}을 지불했습니다.',
  'log.payBank': '{player} 님이 은행에 {amount}을 지불했습니다.',
  'log.gain': '{player} 님이 은행에서 {amount}을 받았습니다.',
  'log.sell': '{player} 님이 {tile} 땅을 은행에 매각했습니다. (+{amount})',
  'log.halfsale': '{player} 님이 반액대매출로 {tile} 땅을 매각했습니다. (+{amount})',
  'log.sellAll': '{player} 님은 땅을 모두 매각해도 지불할 돈이 부족합니다.',
  'log.partial': '{player} 님이 남은 돈 {amount}만 지불했습니다.',
  'log.bankrupt': '{player} 님이 파산하여 패배했습니다.',
  'log.forfeit': '{player} 님이 게임을 포기했습니다.',
  'log.coupon': '{player} 님이 비밀쿠폰 [{coupon}] 을 뽑았습니다.',
  'log.keep': '{player} 님이 [{coupon}] 쿠폰을 보관합니다.',
  'log.pass': '{player} 님이 우대권을 사용하여 {tile} 통행료·이용료 {amount}을 면제받았습니다.',
  'log.exempt': '{player} 님은 우대권의 효과로 {tile} 통행료·이용료 {amount}을 면제받았습니다.',
  'log.radio': '{player} 님이 무전기를 사용하여 무인도에서 탈출했습니다.',
  'log.itemPass': '{player} 님이 아이템 우대권을 사용하여 {tile} 이용료 {amount}을 면제받았습니다.',
  'log.itemRadio': '{player} 님이 아이템 무전기를 사용하여 무인도에서 탈출했습니다.',
  'log.itemUse': '{player} 님이 아이템 [{item}] 을 사용했습니다.',
  'log.charmDouble': '{player} 님의 부적 [{item}] 효과로 더블이 나왔습니다.',
  'log.charmDiscount': '{player} 님이 부적 [{item}] 의 효과로 {tile} 땅값을 {percent}% 할인받았습니다.',
  'log.charmToll': '{player} 님이 부적 [{item}] 의 효과로 {tile} 통행료·이용료를 {percent}% 할인받았습니다.',
  'log.charmBuild': '{player} 님의 부적 [{item}] 효과로 {tile}에 {building}이(가) 무료로 지어졌습니다.',
  'log.charmRedraw': '{player} 님이 부적 [{item}] 의 효과로 [{coupon}] 쿠폰을 덱 맨 뒤로 보내고 다시 뽑습니다.',
  'log.island': '{player} 님이 무인도에 갇혔습니다.',
  'log.islandStay': '{player} 님은 더블이 나오지 않아 무인도에 머뭅니다.',
  'log.islandDouble': '{player} 님이 더블로 무인도에서 탈출했습니다!',
  'log.islandFree': '{player} 님이 무인도에서 풀려났습니다.',
  'log.fundPay': '{player} 님이 사회복지기금 {amount}을 납부했습니다.',
  'log.fundGet': '{player} 님이 쌓인 사회복지기금 {amount}을 받았습니다.',
  'log.board': '{player} 님이 우주여행에 탑승했습니다. 다음 차례에 원하는 칸으로 이동합니다.',
  'log.travel': '{player} 님의 우주여행 목적지 : {tile}',
  'log.nothing': '{player} 님은 해당하는 땅이나 건물이 없어 아무 일도 일어나지 않았습니다.',
  'log.win': '{player} 님이 승리했습니다!',
  'common.close': '닫기',
  'common.goBack': '뒤로가기',
  'lobby.export': 'JSON 내보내기',
  'export.title': 'JSON 내보내기',
  'export.done': '저장 데이터를 JSON 텍스트로 클립보드에 복사했습니다.',
  'export.manual': '클립보드에 복사하지 못했습니다. 아래 내용을 직접 복사하세요.',
  'load.load': '불러오기',
  'load.copy': 'JSON 복사',
  'load.delete': '삭제',
  'load.cancel': '취소',
  'load.summary': '{name}\n보유 금액 : {money}\n{state}',
  'load.emptyText': '비어 있는 슬롯입니다.\nJSON 으로 내보낸 저장 데이터를 이 슬롯에 불러올 수 있습니다.',
  'load.import': 'JSON 불러오기',
  'load.deleteTitle': '삭제 확인',
  'load.deleteText': '슬롯 {n}의 저장 데이터를 정말 삭제하시겠습니까?\n삭제하면 되돌릴 수 없습니다.',
  'import.title': 'JSON 불러오기',
  'import.text': '내보낸 JSON 텍스트를 아래 입력창에 입력하거나 붙여넣으세요. ( // 와 /* */ 주석을 쓸 수 있습니다. )\n입력창을 누르면 입력할 수 있고, ESC 키를 누르면 입력 모드에서 빠져나옵니다.',
  'import.placeholder': '{ "name": "플레이어", "money": 20000000, "game": null }',
  'import.submit': '불러오기',
  'import.failTitle': '불러오기 실패',
  'import.failParse': 'JSON 형식이 올바르지 않습니다.',
  'import.failData': '저장 데이터의 내용이 올바르지 않습니다.',
  'import.failVersion': '이 게임이 지원하지 않는 버전의 저장 데이터입니다. (더 새로운 버전의 게임에서 만든 데이터일 수 있습니다.)',
  'playerinfo.assets': '총 자산',
  'playerinfo.coupons': '보관 쿠폰',
  'playerinfo.charm': '장착한 부적',
  'playerinfo.status': '상태',
  'playerinfo.playing': '진행 중',
  'playerinfo.lands': '소유한 땅 ({n}곳)',
  'playerinfo.none': '소유한 땅이 없습니다.',
  'playerinfo.hint': '땅을 누르면 건설 비용과 통행료, 이용료를 자세히 볼 수 있습니다.',
  'real.title': '현실에서는',
  'real.taipei': '한때 세계에서 가장 높았던 타이베이 101(2004~2010년)에는 660톤짜리 황금색 쇠공이 매달려 있습니다. 태풍에 건물이 덜 흔들리게 잡아 주는 추인데, 귀여운 캐릭터 "댐퍼 베이비"가 되어 기념품으로도 팔립니다. 세상에서 가장 무거운 마스코트일지도 모릅니다.',
  'real.hongkong': '높이 150m가 넘는 빌딩이 550개 넘게 있어 세계에서 초고층 빌딩이 가장 많은 도시입니다. 언덕길이 힘들면 800m 넘게 이어지는 세계에서 가장 긴 옥외 에스컬레이터를 타면 됩니다. 출근길이 놀이기구가 되는 곳입니다.',
  'real.manila': '2차 세계대전 뒤에 남겨진 군용 지프를 길게 늘이고 화려하게 꾸민 "지프니"가 거리의 주인공입니다. 별명은 "도로의 왕"인데, 조용히 지나가는 법은 모르는 왕입니다.',
  'real.jeju': '돌, 바람, 여자가 많다고 해서 삼다도라 불립니다. 산소통 없이 바다에 들어가는 해녀 문화는 2016년 유네스코 인류무형문화유산이 되었고, 한라산(1,947m)은 남한에서 가장 높은 산입니다. 귤은 한 상자씩 사게 되니 주의하세요.',
  'real.singapore': '1992년부터 껌을 팔지 않는 나라입니다. 지하철 문 센서에 껌을 붙이는 장난 때문에 열차가 멈추곤 했거든요. 대신 2020년 유네스코에 등재된 호커 센터에 가면 씹을 거리는 얼마든지 있습니다.',
  'real.cairo': '도시 바로 옆 기자에 있는 대피라미드는 3,800년 넘게 세계에서 가장 높은 건축물이었습니다. 이 기록을 깨려면 우선 3,800년쯤 서 있어야 합니다.',
  'real.istanbul': '유럽과 아시아에 한 발씩 걸친 도시입니다. 1461년부터 열린 그랜드 바자르에는 지붕 덮인 골목 61개에 가게가 4,000곳 넘게 있어서, 들어가기는 쉬워도 빈손으로 나오기는 어렵습니다.',
  'real.athens': '1896년 제1회 근대 올림픽이 열린 도시입니다. 마라톤 평원에서 아테네까지 약 40km를 달려 승전 소식을 전했다는 전설이 마라톤 경기의 시작이죠. 파르테논 신전은 2,400살이 넘었으니, 이 동네에서 "오래된 건물"이라고 하려면 기준이 꽤 높습니다.',
  'real.copenhagen': '도심으로 들어오는 자전거가 자동차보다 많은 도시입니다. 인어공주 동상은 키가 1.25m라서 "생각보다 작네"가 가장 흔한 감상이고, 1843년에 문을 연 티볼리 공원은 월트 디즈니에게 영감을 주었습니다.',
  'real.stockholm': '14개의 섬을 57개의 다리로 이은 도시입니다. 1628년 전함 바사호는 첫 항해에서 겨우 1,300m를 가고 가라앉았는데, 333년 뒤에 건져 올려 지금은 인기 있는 박물관이 되었습니다. 실패도 오래 묵히면 관광 자원이 됩니다.',
  'real.zurich': '물가가 높기로 유명하지만 물은 공짜입니다. 시내 곳곳에 마실 수 있는 물이 나오는 분수가 1,200개 넘게 있거든요. 이 도시에서 가장 확실한 절약 방법입니다.',
  'real.berlin': '다리가 960개가 넘어서 물의 도시 베네치아(약 435개)보다 훨씬 많습니다. 1949년 헤르타 호이버가 처음 팔았다는 커리부어스트는 베를린을 대표하는 간식입니다. 곤돌라 대신 소시지를 고른 도시랄까요.',
  'real.montreal': '겨울이 워낙 추워서 땅속에 32km짜리 지하 도시를 만들었습니다. 감자튀김에 치즈와 그레이비를 얹은 푸틴, 꿀물에 데쳐 장작 화덕에 굽는 베이글이 명물입니다. 추위는 칼로리로 이겨 냅니다.',
  'real.buenosaires': '탱고의 고향입니다. 7월 9일 대로는 폭이 110m로 세계에서 가장 넓은 길로 꼽히는데, 초록불 한 번에 끝까지 건너기는 쉽지 않습니다. 중간에 쉬어 가도 창피한 일이 아닙니다.',
  'real.saopaulo': '남반구에서 가장 큰 도시입니다. 피자 가게만 6,000곳쯤 되고 하루에 굽는 피자가 100만 판에 이른다고 합니다. 길이 막히면 헬리콥터를 타는 사람이 많아서 헬리콥터 보유 대수도 세계 최고 수준입니다.',
  'real.sydney': '오페라 하우스는 4년이면 된다던 공사가 14년이 걸렸고, 700만 달러라던 예산은 1억 200만 달러가 되었습니다. 그래도 결과가 좋으면 다 용서됩니다. 참고로 호주의 수도는 여기가 아니라 캔버라입니다.',
  'real.busan': '우리나라 컨테이너 화물의 대부분이 드나드는 제1의 항구 도시입니다. 국내 최대 수산물 시장인 자갈치시장의 인사말은 "오이소, 보이소, 사이소"이고, 1996년에 시작한 부산국제영화제 때는 바다와 영화를 한 번에 즐길 수 있습니다.',
  'real.hawaii': '마우나케아는 바다 밑바닥에서부터 재면 10,210m로 에베레스트보다 높습니다. 주민들이 한 해에 먹는 스팸은 약 700만 캔. 그리고 섬 전체가 해마다 10cm쯤 일본 쪽으로 움직이고 있으니, 아주 느긋하게 기다리면 비행기 값을 아낄 수 있습니다.',
  'real.lisbon': '일곱 언덕의 도시라서 1914년에 개통한 노란 28번 트램이 오르막을 대신 올라 줍니다. 1837년부터 굽고 있는 벨렝의 에그타르트는 비법을 아는 사람이 여섯 명 정도뿐이라고 하니, 통행료보다 지키기 어려운 비밀입니다.',
  'real.madrid': '해발 667m, 유럽연합에서 가장 높은 곳에 있는 수도입니다. 1725년에 문을 연 식당 보틴은 기네스가 인정한 세계에서 가장 오래된 식당인데, 300년째 영업 중이어도 예약은 여전히 필요합니다.',
  'real.tokyo': '신주쿠역은 하루 약 350만 명이 이용하여 기네스에 오른, 세계에서 가장 붐비는 역입니다. 시부야 교차로는 초록불 한 번에 3,000명이 건너고, 미쉐린 별을 받은 식당도 세계에서 가장 많습니다. 길을 잃어도 맛있는 곳에서 잃게 됩니다.',
  'real.paris': '에펠탑은 여름이면 쇠가 늘어나서 키가 15cm쯤 자랍니다. 프랑스에서는 한 해에 바게트를 60억 개 넘게 굽고, 그 제빵 문화는 2022년 유네스코 무형문화유산이 되었습니다. 빵을 옆구리에 끼는 것도 문화유산인 셈입니다.',
  'real.rome': '트레비 분수에 던져지는 동전은 한 해에 약 150만 유로. 모두 건져서 자선 단체에 기부합니다. 목이 마르면 "큰 코"라는 뜻의 식수대 나소니가 2,500개쯤 있으니, 로마에서는 소원도 물도 길에서 해결됩니다.',
  'real.london': '빅 벤은 시계탑이 아니라 그 안에 있는 종의 별명입니다. (탑의 이름은 엘리자베스 타워) 1863년에 개통한 세계 최초의 지하철이 있고, 택시 기사가 되려면 25,000개가 넘는 거리를 외우는 시험을 통과해야 합니다. 내비게이션이 사람인 도시입니다.',
  'real.newyork': '센트럴 파크는 모나코 공국보다 넓습니다. 지하철은 역이 472개이고 24시간 달리며, "빅 애플"이라는 별명은 1920년대 경마 기자가 퍼뜨렸습니다. 잠들지 않는 도시라서 통행료도 쉬지 않습니다.',
  'real.seoul': '1394년 조선이 도읍을 옮긴 뒤로 630년 넘게 수도 자리를 지키고 있습니다. 한강 공원 어디에 앉아 있어도 치킨이 찾아오는 도시이기도 하죠. 이 보드에서 가장 비싼 땅인 이유는 통행료를 한 번 내 보면 알게 됩니다.',
  'real.concorde': '마하 2로 날아서 런던에서 뉴욕까지 3시간 반이면 가던 초음속 여객기입니다. (최고 기록은 2시간 52분 59초) 서쪽으로 가면 현지 시각으로는 출발한 시각보다 "일찍" 도착했고, 비행 중에는 열 때문에 기체가 15~25cm 늘어났습니다. 20대만 만들어졌고 2003년에 은퇴했습니다.',
  'real.columbia': '1981년 4월 12일, 처음으로 우주에 다녀온 우주왕복선입니다. 첫 비행에서 54시간 반 동안 지구를 37바퀴 돌았으니 한 바퀴에 90분도 안 걸린 셈입니다. 로켓처럼 올라가 비행기처럼 내려왔고 모두 28번의 임무를 수행했습니다. 보드 한 바퀴쯤은 눈 깜짝할 사이입니다.',
  'course.world': '세계여행 코스',
  'course.space': '우주여행 코스',
  'lobby.course': '코스',
  'lobby.otherItems': '이 코스에서 쓸 수 없는 소모형 아이템은 가져가지 않고 대기실에 그대로 둡니다.',
  'league.purple': 'Purple 리그',
  'league.black': 'Black 리그',
  'league.purple.rivals': '인공지능 1~3명 (2명일 확률이 높음)',
  'league.black.rivals': '인공지능 1~3명 (3명일 확률이 높음), 그중 한 명은 일반 또는 고급 부적 장착',
  'item.info.course': '사용 코스',
  'item.course.any': '모든 코스',
  'item.limit.times': '게임 한 판에 {n}번까지 쓸 수 있습니다. 여러 개를 가지고 있어도 {n}번까지입니다.',
  'item.state.left': '{n}번 더 사용 가능',
  'item.block.spentTimes': '이번 게임에서 이미 {n}번 사용했습니다. 게임 한 판에 {n}번까지만 쓸 수 있습니다.',
  'item.angel.title': '천사의 빛',
  'item.angel.brief': '이용료 면제 · 블랙홀 탈출 · 해로운 카드 면제',
  'item.angel.description': '우주여행 코스에서 나를 지켜 주는 아이템입니다. 다른 플레이어의 별이나 특수시설에 내야 하는 이용료(시간여행 이용료 포함)를 한 번 면제받거나, 블랙홀에 빠졌을 때 바로 탈출하거나, 텔레파시 카드와 뉴런의 골짜기 카드의 해로운 효과(천사의 빛으로 면제받을 수 있다고 적힌 것)를 한 번 면제받습니다. 텔레파시 카드로 얻은 천사의 빛과는 따로 보관되고 따로 쓰입니다. 쓰면 한 개가 사라집니다.',
  'item.angel.when': '이용료를 내야 할 때, 블랙홀에 빠졌을 때, 면제받을 수 있는 해로운 카드 효과가 일어날 때 게임이 사용할지 물어봅니다.',
  'item.escape.title': '블랙홀 탈출포트',
  'item.escape.brief': '블랙홀에서 바로 탈출',
  'item.escape.description': '우주여행 코스에서 블랙홀에 빠졌을 때 더블을 기다리지 않고 바로 탈출합니다. 탈출한 뒤에는 보통 차례처럼 주사위를 굴려 이동하며, 주사위의 합이 작아도 별을 반납하지 않습니다. 텔레파시 카드로 얻은 블랙홀 탈출포트와는 따로 보관되고 따로 쓰입니다. 쓰면 한 개가 사라집니다.',
  'item.escape.when': '블랙홀에 도착했을 때와, 갇혀 있는 동안 주사위를 굴리기 직전에 게임이 사용할지 물어봅니다.',
  'tile.earth': '지구',
  'tile.moon': '달',
  'tile.telepathy': '텔레파시 카드',
  'tile.mars': '화성',
  'tile.jupiter': '목성',
  'tile.vega': '직녀성',
  'tile.saturn': '토성',
  'tile.uranus': '천왕성',
  'tile.neptune': '해왕성',
  'tile.timetravel': '시간여행',
  'tile.aries': '양자리',
  'tile.taurus': '황소자리',
  'tile.gemini': '쌍둥이자리',
  'tile.neuron': '뉴런의 골짜기',
  'tile.cancer': '게자리',
  'tile.timemachine': '타임머신',
  'tile.leo': '사자자리',
  'tile.virgo': '처녀자리',
  'tile.blackhole': '블랙홀',
  'tile.libra': '천칭자리',
  'tile.scorpius': '전갈자리',
  'tile.sagittarius': '궁수자리',
  'tile.altair': '견우성',
  'tile.capricornus': '염소자리',
  'tile.aquarius': '물병자리',
  'tile.pisces': '물고기자리',
  'tile.rescue': '우주조난기지',
  'tile.ursamajor': '큰곰자리',
  'tile.andromeda': '안드로메다',
  'tile.orion': '오리온자리',
  'tile.cygnus': '백조자리',
  'tile.halley': '핼리혜성',
  'tile.mercury': '수성',
  'tile.venus': '금성',
  'type.star': '별',
  'type.telepathy': '텔레파시 카드',
  'type.neuron': '뉴런의 골짜기 카드',
  'type.timetravel': '시간여행',
  'type.blackhole': '블랙홀',
  'type.rescue': '우주조난기지',
  'type.halley': '핼리혜성',
  'desc.star': '구매한 뒤 다시 도착하면 기지를 하나 지을 수 있습니다. 기지를 지으면 이용료가 크게 오릅니다. 기지가 있는 별에 다시 도착하면 기지를 증축할 수 있습니다. (세 번까지, 도착할 때마다 한 번씩. 끝까지 증축하면 이용료가 더 크게 오릅니다.)',
  'desc.earth': '모든 플레이어가 이곳에서 시작합니다. 이곳을 지나거나 멈추면 월급을 받습니다. 지나가지 않고 이곳에 멈추면, 자기 별 하나를 골라 기지를 짓거나(기지가 없는 별) 기지를 한 번 증축할 수도 있습니다. (건설비나 증축 비용을 냅니다.)',
  'desc.telepathy': '텔레파시 카드를 한 장 뽑아 적힌 내용대로 이행합니다.',
  'desc.neuron': '뉴런의 골짜기 카드를 한 장 뽑아 적힌 내용대로 이행합니다.',
  'desc.timetravel': '도착하면 탑승 상태가 됩니다. 다음 차례에 주사위 2개를 굴려 합이 4 이상이면 원하는 칸으로 이동하고(출발지를 지나도 월급 없음), 3 이하이면 5칸 앞으로 이동합니다. 타임머신의 소유자가 있으면 이용료를 지불해야 합니다.',
  'desc.blackhole': '도착하면 갇힙니다. 더블이 나오면 즉시 탈출하고, 그렇지 않으면 2턴을 쉰 뒤 3턴 째에 풀려납니다. 풀려난 차례에 굴린 주사위의 합이 3 이하이면 가진 땅 하나를 은행에 반납하고 이동합니다.',
  'desc.rescue': '모인 기금이 있으면 모두 가져가고, 없으면 기금을 납부합니다. 돈이 부족하면 가진 만큼만 냅니다.',
  'desc.halley': '도착하면 화성 옆의 텔레파시 카드 칸으로 이동합니다. 출발지를 지나도 월급을 받지 못합니다.',
  'desc.timemachine': '특수시설입니다. 기지를 지을 수 없습니다. 소유하면 시간여행 칸에 도착한 다른 플레이어에게 시간여행 이용료를 받습니다.',
  'desc.vega': '별입니다. 기지를 하나 짓고 세 번까지 증축할 수 있습니다. 견우성과 함께 가질 수 없으며, 견우성과 직녀성 모두 주인이 생기면 두 주인은 지구로 이동해 월급을 받고 자기 별 하나에 기지를 짓거나 증축할 기회를 얻습니다.',
  'desc.altair': '별입니다. 기지를 하나 짓고 세 번까지 증축할 수 있습니다. 직녀성과 함께 가질 수 없으며, 견우성과 직녀성 모두 주인이 생기면 두 주인은 지구로 이동해 월급을 받고 자기 별 하나에 기지를 짓거나 증축할 기회를 얻습니다.',
  'building.base': '기지',
  'building.annex': '기지 증축',
  'info.feeBare': '이용료 (기지 없음)',
  'info.feeBase': '이용료 (기지 있음)',
  'info.usage': '이용료',
  'info.timeFee': '시간여행 이용료',
  'info.rescue': '납부 금액 (모인 기금이 없을 때)',
  'info.totalFee': '현재 이용료',
  'info.base': '기지',
  'info.built': '건설됨',
  'info.leftover': '건설됨 (구매하면 함께 얻음)',
  'info.annex': '증축',
  'info.annexCount': '{n}회 (최대 {limit}회)',
  'info.feeAnnex': '증축 1회당 이용료 인상',
  'info.feeFull': '최대({limit}회) 증축 시 추가 인상',
  'info.cost.annex': '{building} (1회당, 최대 {limit}회)',
  'game.fund.space': '우주조난기금',
  'hint.blackhole': '블랙홀에 갇혀 있습니다. 더블이 나오면 탈출합니다. (남은 턴 {n})',
  'hint.parole': '이번 차례에 블랙홀에서 풀려납니다. 주사위의 합이 3 이하이면 땅 하나를 반납합니다.',
  'hint.timeroll': '시간여행! 주사위를 굴려 합이 4 이상이면 원하는 칸으로 이동합니다.',
  'hint.pick': '이동할 칸을 클릭한 뒤 [이곳으로 이동] 을 누르세요.',
  'player.blackhole': '블랙홀 (남은 턴 {n})',
  'player.timetravel': '시간여행 탑승',
  'card.header.telepathy': '텔레파시 카드',
  'card.header.neuron': '뉴런의 골짜기 카드',
  'card.drawer': '{player} 님이 뽑은 카드',
  'card.architecture.title': '아름다운 건축상',
  'card.architecture.text': '우주에서 가장 아름다운 건축물로 선정되었습니다.\n상금을 받습니다. (자신의 모든 별의 기지 수 × {amount})',
  'card.ecology.title': '우주환경 부담금',
  'card.ecology.text': '우주 환경 부담금을 다음과 같이 지불합니다.\n기지가 없는 별 하나당 {bare}\n기지가 있는 별 하나당 {built}',
  'card.rescue.title': '우주조난기지',
  'card.rescue.text': '우주 여행 중 식량이 모두 떨어졌습니다. 우주조난기지로 가서 모인 기금을 받습니다.\n(모여 있는 기금이 없어도 기금을 내지 않습니다.)',
  'card.lovers.title': '견우와 직녀',
  'card.lovers.text': '견우성과 직녀성 중 주인이 없는 곳 가운데 원하는 한 곳으로 이동하여 무료로 그 별을 얻습니다.\n(두 별 모두 주인이 있다면 아무 일도 일어나지 않습니다.)',
  'card.meteorite.title': '운석 발견',
  'card.meteorite.text': '우주 탐사 중 대형 운석을 발견하였습니다. 운석을 판매하여 수입금을 얻습니다.\n(은행에서 {amount} 수령)',
  'card.luckydice.title': '주사위의 행운',
  'card.luckydice.text': '주사위 1개를 던져, 나온 눈의 수 × {amount}을 받습니다.',
  'card.cosmos.title': '코스모스 상',
  'card.cosmos.text': '우주 개척 및 우주 기술 발전에 크게 기여하였으므로, 올해의 코스모스상을 수여합니다.\n(상금 {amount})',
  'card.party.title': '우주파티 초대권',
  'card.party.text': '화성에서 개최하는 환상의 우주파티에 초대받았습니다. 하지만 바쁜 일정으로 참석할 수 없습니다.\n다른 플레이어 중 1명을 선택하여 화성으로 강제로 보냅니다.\n(출발지를 지나도 월급을 받지 못함)',
  'card.fear.title': '공포의 블랙홀',
  'card.fear.text': '블랙홀에 빠졌습니다.\n(블랙홀로 이동, 출발지를 지나도 월급을 받지 못함)',
  'card.virus.title': '바이러스 감염',
  'card.virus.text': '우주 여행 중 C-2021 바이러스에 감염되었습니다. 감마선 치료를 받으세요.\n(치료비 {amount} 지불)',
  'card.waste.title': '폐기물 처리',
  'card.waste.text': '기지 건설 과정에서 폐기물이 발생하였습니다. 처리비용을 지불하세요.\n(자신이 보유한 모든 별의 기지 수 × {amount} 지불)',
  'card.baserepair.title': '우주기지 수리',
  'card.baserepair.text': '정기적으로 우주 기지를 수리해야 합니다.\n(자신이 보유한 모든 별의 기지 수 × {amount} 지불)',
  'card.valley.title': '뉴런의 골짜기',
  'card.valley.text': '원하는 뉴런의 골짜기 칸으로 이동하세요.\n지구(출발지)를 지나면 월급을 받습니다.',
  'card.recall.title': '지구 귀환 명령',
  'card.recall.text': '휴식이 필요해 보입니다.\n지구(출발지)로 이동하세요. (월급 수령 가능)',
  'card.asteroid.title': '소행성 충돌',
  'card.asteroid.text': '소행성 충돌로 모든 기지가 파괴되었습니다. 모든 기지를 수리해야 합니다.\n(자신이 보유한 모든 별의 기지 수 × {amount} 지불)',
  'card.machinefix.title': '타임머신 수리',
  'card.machinefix.text': '타임머신을 수리했습니다.\n타임머신의 주인에게서 수리비 {amount}을 받습니다.\n(주인이 없으면 은행에서 받습니다. 주인은 천사의 빛으로 면제받을 수 있습니다.)',
  'card.spectrumgun.title': '스펙트럼 건 개발',
  'card.spectrumgun.text': '어떠한 물질이든 파괴할 수 있는 스펙트럼 건을 개발하였습니다.\n이를 이용해 다른 모든 플레이어에게서 {amount}씩 강탈합니다.\n(천사의 빛으로 면제받을 수 있습니다.)',
  'card.offcourse.title': '우주항로 이탈',
  'card.offcourse.text': '기계 결함으로 항로를 이탈했습니다. 수리비 {amount}을 지불하고, {steps}칸 뒤로 이동합니다.\n(뒤로 이동하면서 출발지를 지나도 월급을 받지 못함)',
  'card.peace.title': '우주 평화상',
  'card.peace.text': '우주 평화에 기여한 공이 크므로 상금을 수여합니다.\n(상금 {amount})',
  'card.basereturn.title': '우주기지 반납',
  'card.basereturn.text': '기지 건설 과정에서 우주 연방국의 규칙을 위반했습니다. 자신의 기지 1개를 반납하세요.\n(천사의 빛으로 면제받을 수 있습니다.)',
  'card.roundtrip.title': '우주왕복 초대권',
  'card.roundtrip.text': '우주를 한 바퀴 돌며 월급과, 적립된 우주조난기금을 받으세요.\n(제자리에 다시 도착하며, 텔레파시 카드를 다시 뽑지는 않습니다.)',
  'card.timeticket.title': '타임머신 초청장',
  'card.timeticket.text': '타임머신 초청장을 받았습니다. 즉시 시간여행 탑승장으로 가세요.\n(무료이므로 타임머신의 주인이 있어도 이용료를 내지 않습니다. 가는 길에 출발지를 지나도 월급을 받지 못함)',
  'card.robot.title': '무인 로봇 탐사 대회',
  'card.robot.text': '무인 로봇 탐사 대회에서 우승하였습니다.\n우승 상금 {amount}을 받습니다.',
  'card.pirates.title': '우주해적 출몰',
  'card.pirates.text': '우주의 해적 하이에나가 출몰하였습니다. 자신의 기지 1개를 반납하세요.\n(천사의 빛으로 면제받을 수 있습니다.)',
  'card.reverse.title': '역추진',
  'card.reverse.text': '주사위 1개를 굴려 눈 수만큼 뒤로 이동하세요.\n(뒤로 이동하면서 지구를 지나도 월급을 받지 못합니다.)',
  'card.escape.title': '블랙홀 탈출포트',
  'card.escape.text': '이 카드는 보관할 수 있습니다.\n블랙홀에 빠졌을 때 즉시 탈출하는 데 사용할 수 있습니다.\n1회 사용 후 소모됩니다.',
  'card.angel.title': '천사의 빛',
  'card.angel.text': '이 카드는 보관할 수 있습니다.\n블랙홀에 빠졌을 때 즉시 탈출하거나, 이용료를 내야 할 때 면제받는 데 사용할 수 있습니다.\n일부 카드의 해로운 효과도 면제받을 수 있습니다. 1회 사용 후 소모됩니다.',
  'card.huygens.title': '하위헌스의 암호문',
  'card.huygens.text': '토성의 고리를 발견하였습니다. 토성으로 가세요.\n토성의 주인이 있으면 서로 주사위 1개를 굴려, 당신의 눈이 더 크면 토성을 빼앗고(기지 포함) 주인의 눈이 더 크면 이용료를 지불합니다.\n주인이 없으면 토성을 구입할 수 있습니다. (주인은 천사의 빛으로 취소 가능)',
  'card.apollo.title': '아폴로 계획',
  'card.apollo.text': '일단 달로 이동하세요.\n달의 주인이 있으면 이용료를 지불하고, 없으면 달을 구입할 수 있습니다.\n그 뒤 지구(출발지)로 이동해 월급을 받으세요.',
  'card.newton.title': '뉴턴의 만유인력의 법칙',
  'card.newton.text': '현재의 위치에서 진행 방향으로 가장 가까운, 주인이 없는 별로 이동하고 그 별을 구입할 수 있습니다.\n(가는 길에 출발지를 지나도 월급을 받지 못함)',
  'card.appleseed.title': '애플시드의 개척정신',
  'card.appleseed.text': '자신의 별 중 기지가 건설되지 않은 별을 선택하여 기지를 무료로 건설할 수 있습니다.',
  'card.einstein.title': '아인슈타인의 상대성 이론',
  'card.einstein.text': '다른 플레이어들이 주사위 1개씩을 굴립니다.\n눈이 가장 낮은 플레이어의 가장 비싼 별과, 자신의 가장 싼 별을 서로 교환합니다.\n(기지째 교환. 상대는 천사의 빛으로 취소할 수 있습니다.)',
  'card.psychic.title': '초능력',
  'card.psychic.text': '자신이 소유한 별 한 곳과, 주인이 없는 별 한 곳을 교환합니다.\n(반드시 교환해야 하며, 기지는 별에 그대로 남습니다.)',
  'card.doppler.title': '도플러 효과',
  'card.doppler.text': '자신의 별 개수가 다른 모든 플레이어보다 많으면 {pay}을 은행에 지불합니다. (천사의 빛으로 면제 가능)\n그렇지 않으면 {gain}을 은행에서 받습니다.',
  'card.zodiac.title': '조디악의 선물',
  'card.zodiac.text': '주사위를 1개 또는 2개 던져, 나온 수에 해당하는 별자리로 이동합니다.\n1 양 · 2 황소 · 3 쌍둥이 · 4 게 · 5 사자 · 6 처녀\n7 천칭 · 8 전갈 · 9 궁수 · 10 염소 · 11 물병 · 12 물고기\n(출발지를 지나도 월급을 받지 못함)',
  'card.moravec.title': '모라비트의 항법',
  'card.moravec.text': '원하는 곳으로 이동하세요.\n(출발지를 지나도 월급을 받지 못함. 단, 출발지로 이동하면 월급을 받습니다.)',
  'card.copernicus.title': '코페르니쿠스의 지동설',
  'card.copernicus.text': '"그래도 지구는 돕니다."\n즉시 지구(출발지)로 간 뒤 월급을 받고 주사위를 한 번 더 굴립니다.',
  'card.kepler.title': '케플러의 조화의 법칙',
  'card.kepler.text': '지금 가지고 있는 별의 수 × {steps} 만큼 앞으로 이동하세요.',
  'card.shapley.title': '샤프레이의 성단거리측정',
  'card.shapley.text': '현재 위치의 앞뒤 {range}칸 안에 있는 별의 주인들에게서 측정료 {amount}씩을 받습니다.\n(별의 수와 관계없이 플레이어당 한 번. 천사의 빛으로 면제받을 수 있습니다.)',
  'card.humboldt.title': '홈 볼트의 지적',
  'card.humboldt.text': '"유성, 원석, 우주진 등이 우주를 공포로 몰아넣고 있습니다. 이곳을 찾아내어 반납시킵시다."\n다른 플레이어들이 주사위 1개씩을 던져, 가장 낮은 눈이 나온 플레이어의 가장 싼 땅을 은행에 반납시킵니다.\n(천사의 빛으로 면제받을 수 있습니다.)',
  'card.spectrum.title': '스펙트럼 매직',
  'card.spectrum.text': '주사위 2개를 던져 눈의 합이 {need} 이상이면, 가지고 있는 별 하나를 선택해 무료로 기지를 건설할 수 있습니다.',
  'card.mobius.title': '뫼비우스의 띠',
  'card.mobius.text': '다른 플레이어들이 주사위 1개씩을 던집니다.\n눈이 가장 높은 플레이어가 주사위 2개를 던지고, 자신과 그 플레이어 모두 그 눈의 합만큼 앞으로 이동합니다.\n(블랙홀에 갇혀 있어도 탈출하여 이동합니다.)',
  'card.contract.title': '뒤바뀐 우주계약서',
  'card.contract.text': '별이 가장 많은 다른 플레이어의 별과 자신의 별을 서로 교환합니다.\n자신의 별은 원하는 것을 고르고, 상대의 별은 무작위로 뽑습니다.\n(상대는 천사의 빛으로 무효화할 수 있습니다.)',
  'card.pascal.title': '파스칼과 페르마의 확률',
  'card.pascal.text': '다른 플레이어의 별 중 원하는 곳으로 가서, 그 주인과 주사위 1개씩을 굴립니다.\n자신의 눈이 더 크면 주인에게서 그 별의 이용료를 받고, 같거나 작으면 주인에게 {amount}을 지불합니다.\n(어느 쪽이든 천사의 빛으로 면제받을 수 있습니다.)',
  'ask.base.title': '기지를 건설하시겠습니까?',
  'ask.base.text': '별 하나에 기지를 하나만 지을 수 있습니다. 기지를 지은 뒤 이 별에 다시 도착하면 증축할 수 있습니다.',
  'ask.base.no': '건설하지 않음',
  'ask.annex.title': '기지를 증축하시겠습니까?',
  'ask.annex.text': '증축할 때마다 이 별의 이용료가 {fee}씩 오르고, 끝까지({limit}번) 증축하면 {bonus} 더 오릅니다.\n증축은 {limit}번까지, 한 번 도착할 때마다 한 번만 할 수 있습니다. (지금까지 {n}번 증축)',
  'ask.annex.option': '{building} ({amount}) · 이용료 {from} → {to}',
  'ask.annex.no': '증축하지 않음',
  'ask.angel.title': '천사의 빛 사용',
  'ask.angel.fee': '{tile}의 이용료를 내야 합니다.\n천사의 빛을 사용하면 이 금액을 내지 않습니다.',
  'ask.angel.timefee': '타임머신의 주인에게 시간여행 이용료를 내야 합니다.\n천사의 빛을 사용하면 이 금액을 내지 않고 탑승합니다.',
  'ask.angel.pay': '[{card}] 카드의 효과로 은행에 돈을 내야 합니다.\n천사의 빛을 사용하면 이 금액을 내지 않습니다.',
  'ask.angel.claim': '[{card}] 카드의 효과로 {target} 님에게 돈을 내야 합니다.\n천사의 빛을 사용하면 이 금액을 내지 않습니다.',
  'ask.angel.base': '[{card}] 카드의 효과로 기지 하나를 반납해야 합니다.\n천사의 빛을 사용하면 반납하지 않습니다.',
  'ask.angel.steal': '[{card}] 카드의 효과로 {target} 님에게 {tile}을(를) 빼앗기게 되었습니다.\n천사의 빛을 사용하면 빼앗기지 않습니다.',
  'ask.angel.swap': '[{card}] 카드의 효과로 내 {tile}과(와) {target} 님의 {other}이(가) 교환됩니다.\n천사의 빛을 사용하면 교환하지 않습니다.',
  'ask.angel.land': '[{card}] 카드의 효과로 {tile}을(를) 은행에 반납해야 합니다.\n천사의 빛을 사용하면 반납하지 않습니다.',
  'ask.angel.coupon': '텔레파시 카드 천사의 빛 사용 (보유 {n}장)',
  'ask.angel.item': '아이템 천사의 빛 사용 (보유 {n}개 · 이번 게임 {left}번 남음)',
  'ask.escape.title': '블랙홀 탈출',
  'ask.escape.arrival': '블랙홀에 빠졌습니다.\n블랙홀 탈출포트나 천사의 빛을 사용하면 갇히지 않고, 다음 차례에 주사위를 굴려 이동합니다.',
  'ask.escape.text': '블랙홀에 갇혀 있습니다.\n블랙홀 탈출포트나 천사의 빛을 사용하면 즉시 탈출하여 주사위를 굴려 이동합니다.',
  'ask.escape.last': '이번 차례에 블랙홀에서 풀려나지만, 주사위의 합이 3 이하이면 땅 하나를 반납해야 합니다.\n블랙홀 탈출포트나 천사의 빛을 사용하면 반납하지 않습니다.',
  'ask.escape.coupon': '텔레파시 카드 블랙홀 탈출포트 사용 (보유 {n}장)',
  'ask.escape.item': '아이템 블랙홀 탈출포트 사용 (보유 {n}개 · 게임당 1회)',
  'ask.pick.blackhole.title': '반납할 땅 선택',
  'ask.pick.blackhole.text': '블랙홀에서 풀려났지만 주사위의 합이 3 이하입니다.\n은행에 반납할 땅을 하나 고르세요. (돌려받는 돈은 없습니다.)',
  'ask.pick.basereturn.title': '반납할 기지 선택',
  'ask.pick.basereturn.text': '[{card}] 카드의 효과로 기지 하나를 반납해야 합니다.\n기지를 반납할 별을 고르세요. (증축한 기지는 증축도 함께 사라집니다.)',
  'ask.pick.freebase.title': '기지 무료 건설',
  'ask.pick.freebase.text': '[{card}] 카드의 효과로 기지 하나를 무료로 지을 수 있습니다.\n기지를 지을 별을 고르세요.',
  'ask.pick.reunion.title': '견우와 직녀의 만남',
  'ask.pick.reunion.text': '견우성과 직녀성의 주인이 모두 나타났습니다!\n가진 별 하나를 골라 기지를 짓거나(기지가 없는 별) 기지를 한 번 증축할 수 있습니다. (건설비나 증축 비용을 냅니다.)',
  'ask.pick.earth.title': '지구 도착',
  'ask.pick.earth.text': '지구에 도착했습니다!\n내 별 하나를 골라 기지를 짓거나(기지가 없는 별) 기지를 한 번 증축할 수 있습니다. (건설비나 증축 비용을 냅니다.)',
  'ask.pick.valley.title': '뉴런의 골짜기 선택',
  'ask.pick.valley.text': '이동할 뉴런의 골짜기 칸을 고르세요.',
  'ask.pick.lovers.title': '견우와 직녀',
  'ask.pick.lovers.text': '무료로 얻을 별을 고르세요. 그 별로 이동합니다.',
  'ask.pick.give.title': '내줄 별 선택',
  'ask.pick.give.text': '[{card}] 카드의 효과로 내 별 하나를 내주어야 합니다.\n내줄 별을 고르세요.',
  'ask.pick.take.title': '얻을 별 선택',
  'ask.pick.take.text': '내준 별 대신 얻을, 주인이 없는 별을 고르세요.',
  'ask.pick.pascal.title': '찾아갈 별 선택',
  'ask.pick.pascal.text': '찾아갈 다른 플레이어의 별을 고르세요.\n주사위에서 이기면 그 별의 이용료를 받습니다.',
  'ask.pick.moravec.title': '모라비트의 항법',
  'ask.pick.moravec.text': '이동할 칸을 보드에서 고르세요.',
  'ask.pick.timetravel.title': '시간여행',
  'ask.pick.timetravel.text': '이동할 칸을 보드에서 고르세요.',
  'ask.pick.skip': '선택하지 않음',
  'ask.pick.value': '가치 {amount}',
  'ask.pick.fee': '이용료 {amount}',
  'ask.pick.cost': '건설비 {amount}',
  'ask.pick.annex': '증축 {amount}',
  'ask.pick.rise': '이용료 {from} → {to}',
  'ask.pick.owner': '{player} · 이용료 {amount}',
  'ask.target.title': '보낼 플레이어 선택',
  'ask.target.text': '[{card}] 카드의 효과로 화성에 보낼 플레이어를 고르세요.',
  'ask.dicecount.title': '주사위 개수 선택',
  'ask.dicecount.text': '주사위를 1개 던지면 1~6번(양자리~처녀자리), 2개 던지면 2~12번(황소자리~물고기자리) 별자리로 이동합니다.',
  'ask.dicecount.one': '주사위 1개',
  'ask.dicecount.two': '주사위 2개',
  'use.angel.title': '천사의 빛 사용!',
  'use.angel.fee': '{tile} 이용료 면제',
  'use.angel.escape': '블랙홀에서 탈출합니다.',
  'use.angel.card': '[{card}] 카드의 해로운 효과를 면했습니다.',
  'use.angel.stamp': '면제',
  'use.escape.title': '블랙홀 탈출포트 사용!',
  'use.escape.text': '블랙홀에서 탈출합니다.',
  'use.escape.stamp': '탈출',
  'use.source.card': '텔레파시 카드',
  'cast.rolling': '{player} 님이 주사위를 굴립니다.',
  'log.card.telepathy': '{player} 님이 텔레파시 카드 [{coupon}] 을 뽑았습니다.',
  'log.card.neuron': '{player} 님이 뉴런의 골짜기 카드 [{coupon}] 을 뽑았습니다.',
  'log.keepCard': '{player} 님이 [{coupon}] 카드를 보관합니다.',
  'log.fee': '{player} 님이 {target} 님에게 {tile} 이용료 {amount}을 지불했습니다.',
  'log.timeFee': '{player} 님이 {target} 님에게 시간여행 이용료 {amount}을 지불했습니다.',
  'log.timeBoard': '{player} 님이 시간여행에 탑승했습니다. 다음 차례에 주사위를 굴려 목적지를 정합니다.',
  'log.timeGo': '{player} 님의 시간여행 목적지 : {tile}',
  'log.timeInvite': '{player} 님이 시간여행 초청장으로 시간여행에 탑승했습니다. 다음 차례에 주사위를 굴리지 않고 원하는 칸으로 이동합니다.',
  'log.reverse': '{player} 님이 역추진으로 {n}칸 뒤로 이동합니다.',
  'log.timeSlip': '{player} 님은 주사위의 합이 작아 {n}칸 앞으로 이동합니다.',
  'log.blackhole': '{player} 님이 블랙홀에 빠졌습니다.',
  'log.blackholeStay': '{player} 님은 더블이 나오지 않아 블랙홀에 머뭅니다.',
  'log.blackholeDouble': '{player} 님이 더블로 블랙홀에서 탈출했습니다!',
  'log.blackholeFree': '{player} 님이 블랙홀에서 풀려났습니다.',
  'log.surrender': '{player} 님이 주사위의 합이 작아 {tile}을(를) 은행에 반납했습니다.',
  'log.escape': '{player} 님이 블랙홀 탈출포트를 사용하여 블랙홀에서 탈출했습니다.',
  'log.itemEscape': '{player} 님이 아이템 블랙홀 탈출포트를 사용하여 블랙홀에서 탈출했습니다.',
  'log.angelEscape': '{player} 님이 천사의 빛을 사용하여 블랙홀에서 탈출했습니다.',
  'log.itemAngelEscape': '{player} 님이 아이템 천사의 빛을 사용하여 블랙홀에서 탈출했습니다.',
  'log.angelFee': '{player} 님이 천사의 빛을 사용하여 {tile} 이용료 {amount}을 면제받았습니다.',
  'log.itemAngelFee': '{player} 님이 아이템 천사의 빛을 사용하여 {tile} 이용료 {amount}을 면제받았습니다.',
  'log.angel': '{player} 님이 천사의 빛을 사용하여 [{coupon}] 카드의 해로운 효과를 면했습니다.',
  'log.itemAngel': '{player} 님이 아이템 천사의 빛을 사용하여 [{coupon}] 카드의 해로운 효과를 면했습니다.',
  'log.rescuePay': '{player} 님이 우주조난기지에 기금 {amount}을 납부했습니다.',
  'log.rescueGet': '{player} 님이 우주조난기지에 모인 기금 {amount}을 받았습니다.',
  'log.rescueNone': '우주조난기지에 모인 기금이 없어 {player} 님은 아무것도 받지 못했습니다.',
  'log.halley': '{player} 님이 핼리혜성을 타고 화성 옆의 텔레파시 카드 칸으로 이동합니다.',
  'log.cast': '{player} 님이 주사위를 굴렸습니다 : {n}',
  'log.castTie': '눈이 같아 주사위를 다시 굴립니다.',
  'log.loversBlock': '{player} 님은 견우성과 직녀성을 함께 가질 수 없어 {tile}을(를) 구매할 수 없습니다.',
  'log.loversCancel': '견우성과 직녀성을 한 플레이어가 함께 가질 수 없어 {player} 님이 뽑은 카드의 효과가 취소되었습니다.',
  'log.reunion': '견우성과 직녀성의 주인이 모두 나타났습니다! {player} 님과 {target} 님이 지구로 이동하여 월급을 받습니다.',
  'log.freeLand': '{player} 님이 {tile}을(를) 무료로 얻었습니다.',
  'log.freeBase': '{player} 님이 {tile}에 기지를 무료로 건설했습니다.',
  'log.baseLost': '{player} 님이 {tile}의 기지를 반납했습니다.',
  'log.annex': '{player} 님이 {tile}의 기지를 증축했습니다. ({amount})',
  'log.landLost': '{player} 님이 {tile}을(를) 은행에 반납했습니다.',
  'log.steal': '{player} 님이 주사위에서 이겨 {target} 님의 {tile}을(를) 빼앗았습니다!',
  'log.stealFail': '{player} 님이 주사위에서 져 {target} 님에게 {tile} 이용료를 냅니다.',
  'log.swap': '{player} 님의 {tile}과(와) {target} 님의 {other}이(가) 서로 교환되었습니다.',
  'log.swapFree': '{player} 님이 {tile}을(를) 내놓고 주인이 없던 {other}을(를) 얻었습니다.',
  'log.claim': '{player} 님이 {target} 님에게 {amount}을 지불했습니다.',
  'log.spectrumFail': '{player} 님은 주사위의 합이 {n}보다 작아 기지를 얻지 못했습니다.',
  'log.zodiac': '{player} 님이 {tile}(으)로 이동합니다.',
  'log.party': '{player} 님이 {target} 님을 화성으로 보냅니다.',
  'log.roundtrip': '{player} 님이 우주를 한 바퀴 돕니다.',
  'log.bonusRoll': '{player} 님이 주사위를 한 번 더 굴립니다.',
  'log.mobius': '{player} 님과 {target} 님이 {n}칸씩 앞으로 이동합니다.',
  'log.kepler': '{player} 님이 가진 별의 수에 따라 {n}칸 앞으로 이동합니다.',
  'log.pascalWin': '{player} 님이 주사위에서 이겨 {target} 님에게서 {tile} 이용료를 받습니다.',
  'log.pascalLose': '{player} 님이 주사위에서 이기지 못해 {target} 님에게 돈을 냅니다.',
  'log.contest': '{player} 님이 주사위 눈으로 뽑혔습니다.',
  'log.noEffect': '{player} 님이 뽑은 [{coupon}] 카드는 조건이 맞지 않아 아무 일도 일어나지 않았습니다.',
  'playerinfo.cards': '보관 카드',
  'real.moon': '지구에서 평균 38만 4천 km 떨어져 있습니다. 1969년 아폴로 11호가 처음으로 사람을 내려놓았고, 지금까지 달 표면을 걸어 본 사람은 12명뿐입니다. 공기가 없어서 그때의 발자국이 아직도 남아 있다고 하니, 이 땅을 사도 청소는 안 해도 됩니다.',
  'real.mars': '태양계에서 가장 높은 화산인 올림푸스 산이 있습니다. 높이가 약 22km로 에베레스트의 두 배를 훌쩍 넘습니다. 하루는 24시간 37분쯤이라 지구와 비슷해서, 이사 가도 시차 적응은 금방입니다. 다만 붉은 먼지는 각오해야 합니다.',
  'real.jupiter': '태양계에서 가장 큰 행성으로, 지구가 1,300개쯤 들어갈 부피입니다. 대적점이라 불리는 거대한 폭풍은 150년이 넘도록 관측되고 있습니다. 하루가 10시간도 안 될 만큼 빨리 돌아서, 여기서는 월급날이 눈 깜짝할 사이에 돌아옵니다.',
  'real.saturn': '아름다운 고리로 유명합니다. 고리는 대부분 얼음 조각으로 이루어져 있습니다. 평균 밀도가 물보다 낮아서, 충분히 큰 욕조만 있다면 물에 뜰 것이라는 농담이 있습니다. 욕조를 구하는 것은 주인의 몫입니다.',
  'real.uranus': '자전축이 약 98도 기울어져 있어 옆으로 누운 채 태양을 돕니다. 1781년 윌리엄 허셜이 발견한, 망원경으로 찾은 첫 행성입니다. 태양을 한 바퀴 도는 데 84년이 걸리니, 이곳의 생일 파티는 평생 한 번이면 충분합니다.',
  'real.neptune': '1846년에 발견된 행성으로, 눈으로 먼저 찾은 것이 아니라 계산으로 위치를 먼저 맞힌 것으로 유명합니다. 태양계에서 가장 빠른 바람이 불어 시속 2,000km에 이르기도 합니다. 우산은 소용없습니다.',
  'real.vega': '거문고자리에서 가장 밝은 별로, 지구에서 약 25광년 떨어져 있습니다. 밤하늘에서 다섯 번째로 밝은 별입니다. 약 1만 2천 년 뒤에는 북극성 자리를 물려받을 예정이라, 미리 사 두면 장기 투자가 됩니다.',
  'real.altair': '독수리자리에서 가장 밝은 별로, 지구에서 약 17광년 떨어져 있습니다. 자전이 아주 빨라 9시간쯤에 한 바퀴를 돌고, 그 탓에 적도 쪽이 불룩합니다. 칠월칠석에 직녀를 만나러 가느라 바쁜 모양입니다.',
  'real.aries': '황도 12궁의 첫 번째 별자리입니다. 가장 밝은 별은 하말이며, 그리스 신화의 황금 양털을 가진 숫양에서 왔습니다. 약 2천 년 전에는 춘분점이 이곳에 있어서 별자리 달력의 맨 앞자리를 차지했습니다. 지금도 줄은 맨 앞에 섭니다.',
  'real.taurus': '붉은 눈처럼 빛나는 알데바란과, 맨눈으로도 보이는 플레이아데스 성단이 있습니다. 1054년에 관측된 초신성의 흔적인 게성운도 이 별자리에 있습니다. 볼거리가 많아 관광 수입이 기대됩니다.',
  'real.gemini': '쌍둥이 형제 카스토르와 폴룩스의 이름을 딴 두 밝은 별이 나란히 있습니다. 매년 12월 중순에는 쌍둥이자리 유성우가 쏟아집니다. 둘이 함께 와도 이용료는 한 번만 받습니다.',
  'real.cancer': '황도 12궁 가운데 가장 어두운 별자리입니다. 대신 한가운데에 벌집 성단(프레세페)이 있어 맑은 밤에는 맨눈으로도 뿌옇게 보입니다. 눈에 잘 띄지 않아 조용히 살기 좋습니다.',
  'real.leo': '사자의 심장에 해당하는 밝은 별 레굴루스가 있습니다. 머리 부분은 물음표를 뒤집은 모양이라 낫이라고도 부릅니다. 매년 11월에는 사자자리 유성우가 찾아옵니다. 손님이 하늘에서 떨어지는 셈입니다.',
  'real.virgo': '황도 12궁 가운데 가장 큰 별자리이고, 전체 88개 별자리 중에서도 두 번째로 큽니다. 가장 밝은 별은 스피카입니다. 은하가 천 개 넘게 모인 처녀자리 은하단도 이 방향에 있으니 땅값이 비쌀 만합니다.',
  'real.libra': '황도 12궁 가운데 유일하게 살아 있는 것이 아닌 물건, 저울을 나타내는 별자리입니다. 옛날에는 전갈자리의 집게발로 여겨졌습니다. 공정한 거래를 약속하지만 이용료는 깎아 주지 않습니다.',
  'real.scorpius': '전갈의 심장 자리에 붉은 초거성 안타레스가 있습니다. 안타레스라는 이름은 화성의 맞수라는 뜻으로, 화성만큼 붉게 보여서 붙었습니다. 꼬리 쪽은 조심해서 지나가세요.',
  'real.sagittarius': '우리 은하의 중심이 이 별자리 방향에 있습니다. 밝은 별들을 이으면 주전자 모양이 되어 주전자라는 별명도 있습니다. 은하 중심가의 땅이니 전망은 최고입니다.',
  'real.capricornus': '상반신은 염소, 하반신은 물고기인 바다 염소의 모습입니다. 황도 12궁 가운데 게자리 다음으로 어두운 별자리입니다. 남회귀선을 영어로 염소자리 회귀선이라 부르는 것도 이 별자리에서 왔습니다. 이름값은 톡톡히 하는 셈입니다.',
  'real.aquarius': '물병에서 물을 쏟는 사람의 모습을 한 별자리입니다. 지구에서 가장 가까운 행성상 성운 가운데 하나인 나선 성운이 이곳에 있습니다. 주변에는 물고기자리, 고래자리처럼 물과 관련된 별자리가 모여 있어 수도 요금 걱정은 없습니다.',
  'real.pisces': '끈으로 이어진 두 마리 물고기의 모습입니다. 지금은 춘분점이 이 별자리에 있어서, 봄에 태양이 하늘의 적도를 건너는 자리가 바로 이곳입니다. 물고기 두 마리가 지키는 땅이니 낚시는 삼가 주세요.',
  'real.ursamajor': '북두칠성이 바로 이 별자리의 일부입니다. 국자 끝의 두 별을 이은 선을 다섯 배 늘이면 북극성을 찾을 수 있습니다. 88개 별자리 중 세 번째로 넓습니다. 길을 잃을 걱정은 없는 땅입니다.',
  'real.andromeda': '맨눈으로 볼 수 있는 가장 먼 천체 가운데 하나인 안드로메다 은하가 있습니다. 약 250만 광년 떨어져 있으며, 수십억 년 뒤에는 우리 은하와 만날 것으로 예상됩니다. 이웃사촌이 될 날을 느긋하게 기다리면 됩니다.',
  'real.orion': '나란히 놓인 세 별, 오리온의 허리띠로 쉽게 찾을 수 있습니다. 붉은 베텔게우스와 푸른 리겔이 대각선으로 마주 보고, 허리띠 아래에는 별이 태어나는 오리온 대성운이 있습니다. 겨울 밤하늘의 대표 관광지입니다.',
  'real.cygnus': '밝은 별들이 십자 모양을 이루어 북십자성이라고도 부릅니다. 꼬리의 별 데네브는 직녀성, 견우성과 함께 여름철 대삼각형을 이룹니다. 처음으로 널리 인정받은 블랙홀 후보 백조자리 X-1 도 이곳에 있으니 발밑을 조심하세요.',
  'real.mercury': '태양에 가장 가까운 행성으로, 88일 만에 태양을 한 바퀴 돕니다. 태양계 행성 가운데 가장 작습니다. 대기가 거의 없어 낮에는 섭씨 400도를 넘고 밤에는 영하 170도 아래로 떨어집니다. 냉난방비는 각오하세요.',
  'real.venus': '하루가 1년보다 깁니다. 자전에 243일, 공전에 225일이 걸리기 때문입니다. 게다가 다른 행성과 반대 방향으로 돌아서 해가 서쪽에서 뜹니다. 두꺼운 이산화탄소 대기 탓에 태양계에서 가장 뜨거운 행성이기도 합니다.',
  'real.timemachine': '아직 현실에는 없습니다. 타임머신이라는 말은 1895년 H. G. 웰스의 소설 제목으로 널리 퍼졌습니다. 다만 빠르게 움직이면 시간이 느리게 간다는 것은 실험으로 확인된 사실이라, 우주 비행사들은 아주 조금 미래로 다녀온 셈입니다.',
  'mcp.space.rules': '[우주여행 코스 (Purple 리그, Black 리그)]\n- 보드와 카드가 세계여행 코스와 다르다. 땅은 별(행성, 별자리)과 특수시설(타임머신)이고, 월급은 {salary}이다. 차례의 진행, 더블, 구매와 매각({sell}%), 파산의 규칙은 같다.\n- 별 : 사서 다시 도착하면 기지를 하나 지을 수 있다. 이용료는 기지가 없을 때와 있을 때가 다르다. 특수시설에는 기지를 지을 수 없다.\n- 기지의 증축 : 기지가 있는 자기 별에 다시 도착하면 기지를 증축할 수 있다. 별마다 {annexLimit}번까지, 도착할 때마다 한 번씩만 한다. 비용은 어느 별이나 {annexCost}이고 증축할 때마다 그 별의 이용료가 {annexFee}씩 오르며, 끝까지({annexLimit}번) 증축하면 추가로 {annexBonus} 더 오른다. 증축한 기지도 기지 하나로 세며, 기지를 반납하면 증축도 함께 사라진다.\n- 지구(출발지) : 지나거나 멈추면 월급을 받는다. 지나가지 않고 멈추면 월급과 별도로, 자기 별 하나를 골라 기지를 짓거나(기지가 없는 별) 기지를 한 번 증축할 수 있다. (둘 가운데 하나만 한다. 건설비나 증축 비용을 낸다. 하지 않아도 된다.)\n- 견우성과 직녀성은 한 플레이어가 함께 가질 수 없다. 두 별 모두 주인이 생기면 두 주인은 곧바로 지구로 이동해 월급을 받고, 각자 가진 별 하나를 골라 기지를 짓거나 한 번 증축할 수 있다. (건설비나 증축 비용을 낸다.)\n- 텔레파시 카드 칸, 뉴런의 골짜기 카드 칸 : 카드를 한 장 뽑아 적힌 대로 한다. 텔레파시 카드의 "천사의 빛"과 "블랙홀 탈출포트"는 보관했다가 쓴다.\n- 천사의 빛 : 이용료(시간여행 이용료 포함)를 한 번 면제받거나, 블랙홀에서 바로 탈출하거나, 카드에 면제받을 수 있다고 적힌 해로운 효과를 한 번 면제받는다.\n- 시간여행 칸 : 탑승한다. 타임머신을 다른 플레이어가 가지고 있으면 이용료({time})를 낸다. 다음 차례에 주사위 2개를 굴려 합이 4 이상이면 원하는 칸으로 이동하고(출발지를 지나도 월급 없음, 지구에 도착하면 월급을 받음), 3 이하이면 5칸 앞으로 이동한다. 아이템 시간여행 초청장으로 탑승했으면 다음 차례에 주사위를 굴리지 않고 곧바로 원하는 칸으로 이동한다.\n- 블랙홀 칸 : 갇힌다. 더블이 나오면 탈출하여 그 눈만큼 이동하고, 아니면 2턴을 쉬고 3턴 째에 풀려난다. 풀려난 차례에 굴린 주사위의 합이 3 이하이면 가진 땅 하나를 골라 은행에 반납한 뒤(돌려받는 돈 없음) 이동하며, 이 차례의 더블은 효과가 없다. 블랙홀 탈출포트나 천사의 빛을 쓰면 바로 풀려나고 땅도 반납하지 않는다.\n- 우주조난기지 칸 : 모인 기금이 있으면 모두 가져가고, 없으면 {rescue}을 낸다. (모자라면 가진 만큼만)\n- 핼리혜성 칸 : 화성 옆의 텔레파시 카드 칸으로 이동하여 카드를 뽑는다. (월급 없음)\n- 카드 가운데에는 주사위를 굴려 상대를 정하거나, 별을 교환하거나 빼앗거나 반납시키는 것이 있다. 견우성과 직녀성을 한 플레이어가 갖게 되는 교환은 취소된다.',
  'mcp.space.guide': '[우주여행 코스의 화면]\n- 대기실의 리그 목록은 코스별로 나뉘어 있다. Purple 리그와 Black 리그가 우주여행 코스이다.\n- 시간여행에 탑승한 다음 차례에는 먼저 "주사위 굴리기"를 누른다. 합이 4 이상이면 보드의 칸을 눌러 "이곳으로 이동"(game.travel)을 누른다. 모라비트의 항법 카드도 같은 방식으로 칸을 고른다. 이때에는 메인 메뉴와 포기를 누를 수 없다.\n- 아이템 시간여행 초청장으로 탑승한 다음 차례에는 주사위를 굴리지 않는다. 주사위 자리에 우주선이 보이며, 곧바로 보드의 칸을 눌러 "이곳으로 이동"(game.travel)을 누른다. 이때에는 메인 메뉴와 포기를 누를 수 있다.\n- 카드의 효과로 별이나 플레이어, 주사위 개수를 골라야 할 때에는 선택지가 든 창이 뜬다. (dialog.answer)\n- 기지가 있는 자기 별에 도착하면 건설 창 대신 증축 여부를 묻는 창이 뜬다. (dialog.answer 의 value 가 annex 이면 증축, skip 이면 하지 않음) 지구에 멈추면 기지를 짓거나 증축할 별을 고르는 창이 뜬다. (지을 수 있는 별이 없으면 뜨지 않는다. 선택지의 value 는 칸 번호이고, 기지가 없는 별은 기지 건설, 기지가 있는 별은 증축이다.)\n- 천사의 빛이나 블랙홀 탈출포트를 쓸 수 있는 상황이 되면 사용 여부를 묻는 창이 뜬다. 텔레파시 카드로 얻은 것과 아이템으로 가져온 것의 선택지가 따로 나온다. 다른 플레이어의 차례에도 내가 손해를 보게 되면 이 창이 뜰 수 있다.\n- 텔레파시 카드와 뉴런의 골짜기 카드도 6초 동안 표시되며 "닫기"(coupon.close)로 바로 닫을 수 있다.',
  'mcp.rules': '[Hellmarble 플레이 방법]\n- 2~4명이 하는 턴제 보드게임이다. 사용자 1명과 인공지능 1~3명이 참여한다.\n- 모두 같은 돈(리그마다 다르다. 아래 [리그] 참고)을 가지고 출발지에서 시작한다. 다른 플레이어가 모두 파산하면 승리하고, 사용자가 파산하면 즉시 패배한다.\n- 시작할 때 각자 주사위 2개를 굴려 합이 큰 순서로 차례를 정한다. (동점이면 플레이어 번호가 낮은 쪽이 먼저)\n- 차례가 되면 주사위 2개를 굴려 나온 수만큼 앞으로 이동한다. 출발지를 지나거나 출발지에 멈추면 월급({salary})을 받는다.\n- 더블(두 눈이 같음)이면 도착한 칸의 처리를 마친 뒤 한 번 더 굴린다. 더블이 이어지면 계속 굴린다. 단, 무인도에 갇히거나 우주여행에 탑승하면 차례가 끝난다.\n- 빈 땅(일반 도시, 한국 도시, 특수 시설)에 도착하면 돈이 충분할 때 살 수 있다.\n- 자기 일반 도시에 다시 도착하면 별장(최대 2개), 빌딩(1개), 호텔(1개) 가운데 하나를 지을 수 있다. 한국 도시와 특수 시설에는 지을 수 없다.\n- 남의 땅에 도착하면 통행료와 건물 이용료의 합을 소유자에게 낸다. 우대권이 있으면 써서 면제받을 수 있다.\n- 낼 돈이 모자라면 자기 땅을 은행에 팔아(구매·건설 가격의 {sell}%) 마련해야 하고, 모두 팔아도 모자라면 파산한다.\n- 비밀쿠폰 칸 : 쿠폰 한 장을 뽑아 적힌 대로 한다. 우대권과 무전기는 보관했다가 쓸 수 있다.\n- 우주여행 칸 : 탑승하여 다음 차례에 원하는 칸으로 이동한다. 콜롬비아 호를 다른 플레이어가 가지고 있으면 이용료({space})를 낸다.\n- 무인도 칸 : 갇힌다. 더블이 나오면 탈출하여 그 눈만큼 이동하고(이 더블로는 다시 굴리지 않는다), 아니면 2턴을 쉬고 3턴 째에 이동한다. 무전기를 쓰면 바로 풀려난다.\n- 사회복지기금 접수처 : {welfare}을 낸다. (모자라면 가진 만큼만 내고 파산하지 않는다.) 사회복지기금 본부 : 쌓인 돈을 모두 가져간다.\n- 코스는 세계여행 코스(White, Green, Orange, Red 리그)와 우주여행 코스(Purple, Black 리그) 두 가지이다. 위의 칸과 비밀쿠폰 설명은 세계여행 코스의 것이며, 우주여행 코스는 아래에 따로 설명한다. 배율은 게임 안의 모든 금액에 곱해진다. (리그마다의 참가비와 배율은 [리그] 참고)\n- 승리하면 게임에서 가진 현금과 땅, 건물의 가치(100%)를 대기실 금액으로 받는다. 패배하면 참가비를 잃는다.',
  'mcp.guide': '[화면 사용 방법]\n- 메인 메뉴 : 게임 시작(저장 슬롯 선택 → 이름 입력 → 대기실), 불러오기, 설정.\n  게임 시작에서 데이터가 있는 슬롯을 누르면 덮어쓰기 / 불러오기 / 취소를 고른다. 불러오기를 고르면 덮어쓰지 않고 그 슬롯을 불러온다.\n- 불러오기 : 데이터가 있는 슬롯을 누르면 불러오기 / JSON 복사 / 삭제 / 취소, 빈 슬롯을 누르면 JSON 불러오기 / 취소를 고른다. "JSON 복사"는 그 슬롯의 저장 데이터를 클립보드에 복사한다.\n- 대기실 : 리그를 골라 참여한다. (한 번 더 확인받는다.) "JSON 내보내기"는 저장 데이터를 클립보드에 복사한다.\n- 게임 : 자기 차례에는 "주사위 굴리기", "아이템", "메인 메뉴"(저장하고 나감), "포기"를 사용할 수 있다. 구매, 건설, 매각, 쿠폰 사용은 화면에 뜨는 창에서 고른다.\n  칸을 누르면 땅 정보가 뜨고 다시 누르면 닫힌다. 플레이어를 누르면 자산과 소유한 땅 목록이 뜬다.\n  우주여행에 탑승한 차례에는 칸을 누른 뒤 "이곳으로 이동"을 누른다.\n  비밀쿠폰은 6초 동안 표시되며 "닫기"(coupon.close)를 누르면 바로 닫고 진행한다.\n  주사위·말 이동·돈 이동·패배 연출 중에는 조작할 수 없으므로 hellmarble_wait 로 다음 입력 시점까지 기다린다. 돈은 플레이어 사이뿐 아니라 은행(출발지 칸)·사회복지기금 본부와 오갈 때도 지폐 이동으로 표시된다. 누군가 패배하면(파산, 포기) 그 플레이어의 말이 폭발과 함께 보드 밖으로 튕겨나가는 연출이 나온 뒤 진행된다.\n- 설정 : 언어(한국어 / English)와 다크 모드를 고른다.\n\n[WebMCP 도구 사용 순서]\n1. hellmarble_get_state 로 현재 화면과 지금 누를 수 있는 동작(actions) 목록을 본다.\n2. hellmarble_act 에 그 목록의 action 과 value 를 그대로 넘겨서 누른다. 창(dialog)이 떠 있으면 창 안의 동작만 누를 수 있다.\n3. 글자를 입력해야 하면(이름, JSON) hellmarble_set_text 로 입력한 뒤 해당 동작을 누른다.\n4. 주사위를 굴리거나 선택을 한 뒤에는 hellmarble_wait 로 다음 입력 차례가 될 때까지 기다린다.\n5. 칸의 자세한 정보는 hellmarble_get_land 로 본다. (index 0 = 출발지, 진행 방향으로 39까지)\n- 금액은 모두 원 단위 정수이다.',
  'mcp.tiles': '칸 정보 보기 또는 닫기 (value : 0~39)',
  'mcp.unknown': '지금 누를 수 없는 동작입니다. hellmarble_get_state 의 actions 를 확인하세요.',
  'mcp.noInput': '지금 화면에는 글자를 입력할 곳이 없습니다.',
};

/**
 * 영어 문구이다.
 * @type {Object<string, string>}
 */
const TEXT_EN = {
  'app.title': 'Hellmarble',
  'app.subtitle': 'A round-the-world board game with two dice',
  'menu.new': 'New Game',
  'menu.load': 'Load',
  'menu.settings': 'Settings',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.ok': 'OK',
  'common.back': 'Back',
  'common.menu': 'Main Menu',
  'game.forfeit': 'Forfeit',
  'confirm.forfeit.title': 'Give up this game?',
  'confirm.forfeit.text': 'Giving up ends the game in defeat. The entry fee will not be refunded.',
  'confirm.forfeit.yes': 'Give up and lose',
  'common.none': 'None',
  'common.count': '{n}',
  'slot.new': 'Choose a Save Slot',
  'slot.newHint': 'Pick the slot to store your new game.',
  'slot.load': 'Load',
  'slot.loadHint': 'Pick the slot to load.',
  'slot.name': 'Slot {n}',
  'slot.empty': 'Empty',
  'slot.lobby': 'In the lobby',
  'slot.playing': '{league} in progress',
  'slot.overwriteTitle': 'Overwrite?',
  'slot.overwrite': 'Slot {n} already has saved data.\nDo you want to overwrite it?\nYou can also load the saved data instead.',
  'slot.overwriteYes': 'Overwrite',
  'name.title': 'Enter Your Name',
  'name.hint': 'Enter the name to use in the game. (up to {n} characters)',
  'name.default': 'Player',
  'name.submit': 'Go to Lobby',
  'lobby.title': 'Lobby',
  'lobby.welcome': '{name}, choose a league to join.',
  'lobby.money': 'Your money',
  'lobby.fee': 'Entry fee',
  'lobby.free': 'Free',
  'lobby.cash': 'Starting cash',
  'lobby.reward': 'Win reward',
  'lobby.multiplier': 'Money multiplier',
  'lobby.times': 'x{n}',
  'lobby.rivals': 'Opponents',
  'lobby.join': 'Join',
  'lobby.shortTitle': 'Cannot Join',
  'lobby.short': 'You do not have enough money to join the {league}.\nRequired : {fee}\nYou have : {money}',
  'lobby.confirmTitle': 'Confirm',
  'lobby.confirm': 'Join the {league}?\nThe entry fee of {fee} will be deducted from your money.',
  'lobby.confirmFree': 'Join the {league}?\nThere is no entry fee.',
  'lobby.noItems': 'Consumable items cannot be used in this league. Your items stay in the lobby.',
  'lobby.whiteNote': 'The {league} appears only while you have less than {limit}. It has no entry fee and starts you with {cash}; winning pays {reward} and losing costs nothing. Consumable items cannot be used.',
  'lobby.note': 'If you win, you get back your in-game cash plus the full value of your lands and buildings. Consumable items you take into a game come back to the lobby whether you win or lose, apart from the ones you actually used in it. Colors and shapes are never lost. If you lose, the entry fee is gone.',
  'mcp.items.rules': '[Item rules]\n- Buy items in the lobby shop and keep them, or sell them back for {itemSell}% of the purchase price.\n- All your consumable items that can be used on that course go into a game with you (items for the other course stay in the lobby). When it ends, whether you win or lose, the items you did not use come back to the lobby; only the items you used are gone.\n- Each kind of item can be used only once per game (Angel\'s Light: twice). The dice items (Big Dice, Small Dice) share a single use between them. Kept coupons and cards (passes, radios, Angel\'s Light, Escape Pods) are counted separately.\n- Some items are offered by the game when the situation arises; others are used from the item list on your turn to roll.\n[Items]',
  'mcp.items.entry': '- {item} ({price}, course : {course}) : {description} [When] {when}',
  'mcp.items.guide': '- The lobby "Item Shop" (lobby.shop) has Buy / Sell tabs (items.tab), category buttons (items.filter) and a list of item cards. Press a card (items.pick) to open its detail popup, set the quantity (items.less / items.more / items.max), then buy or sell (items.trade). Close the popup with items.back and the shop with items.close.\n- "My Items" (lobby.items) and the "Items" button on your turn (game.items) open your inventory. In a game, on your turn to roll, "Use" (items.use) in the detail popup uses a Space Travel Invitation or a dice item after one more confirmation.\n- When a toll or fee is due and you hold a free pass, a single window appears. Its text includes the amount due, and depending on what you hold you choose "Use Coupon Free Pass" (dialog.answer, coupon), "Use Item Free Pass" (dialog.answer, item) or "Do not use" (dialog.answer, no).\n- On the island, holding a radio also opens a single window offering "Use Coupon Radio" (coupon), "Use Item Radio" (item) or "Do not use" (no). Right after landing on the island only an item radio can be used.\n- "Reset Settings" on the settings screen asks first, restores the default language and theme, clears all three save slots, and returns to the main menu.',
  'lobby.shop': 'Item Shop',
  'lobby.items': 'My Items',
  'item.owned': 'My Items',
  'item.none': 'You do not have any items.',
  'item.hint.barred': 'Consumable items cannot be used in the {league}. Your items are still in the lobby. You can read the details of the charms you own here.',
  'item.noneLobby': 'You do not have any items. You can buy some in the lobby shop.',
  'item.noneIn': 'There are no items in this category.',
  'item.total': '{kinds} kind(s) · {count} item(s)',
  'item.count': 'In stock',
  'item.hint.lobby': 'Click an item to read its details. Colors, shapes and charms can be equipped right there. Consumable items that can be used on that course all go into a game with you; the ones you do not use come back to the lobby when it ends, and only the items you use are gone. Colors, shapes and charms are never lost.',
  'item.hint.game': 'These are the items you brought into this game. Click an item to read its details. Items used on your turn to roll can be used right there. Items you do not use come back to the lobby when the game ends. You can also read the details of the charms you own here.',
  'item.category.all': 'All',
  'item.category.support': 'Support',
  'item.category.travel': 'Travel',
  'item.category.dice': 'Dice',
  'item.category.color': 'Colors',
  'item.category.shape': 'Shapes',
  'item.info.when': 'When to use',
  'item.info.limit': 'Limit',
  'item.info.state': 'This game',
  'item.state.ready': 'Ready',
  'item.state.spent': 'Used',
  'item.limit.single': 'Can be used only once per game, no matter how many you own.',
  'item.limit.shared': 'Can be used only once per game. {items} share that single use between them.',
  'lobby.look': 'My token',
  'lobby.needLook': 'You must equip one color and one shape to join a league.\nEquip a color and a shape you own in "My Items" in the lobby.',
  'equip.none.color': 'No color',
  'equip.none.shape': 'No shape',
  'equip.slot.color': 'color',
  'equip.slot.shape': 'shape',
  'equip.color.brief': 'Your color on tokens and lands',
  'equip.color.description': 'The color that stands for you in a game. Your token, your player card and the marks on the lands you own are painted in it. It is an equippable item, so using it never consumes it and you keep it after the game.',
  'equip.color.when': 'Equip it in the lobby item window or in the shop. You need one color and one shape equipped to join a league.',
  'equip.shape.brief': 'Your shape on tokens and lands',
  'equip.shape.description': 'The shape that stands for you in a game. It is drawn on your token and on the marks of the lands you own. It is an equippable item, so using it never consumes it and you keep it after the game.',
  'equip.shape.when': 'Equip it in the lobby item window or in the shop. You need one color and one shape equipped to join a league.',
  'equip.limit.basic': 'A basic item you have from the start. It cannot be bought or sold and never goes away.',
  'equip.limit.extra': 'You can own only one of each kind. It is never consumed, but selling it to the shop removes it.',
  'equip.info.owned': 'Owned',
  'equip.info.state': 'Equipped',
  'equip.owned': 'Owned',
  'equip.missing': 'Not owned',
  'equip.on': 'Equipped',
  'equip.off': 'Not equipped',
  'equip.equip': 'Equip',
  'equip.done': 'Equipped {item}.',
  'equip.sold': 'You sold the {slot} you had equipped. Equip another {slot} to join a league.',
  'store.have': 'You already own this. You can own only one of each equippable item.',
  'store.boughtOne': 'Bought {item}.',
  'store.soldOne': 'Sold {item} for {amount}.',
  'item.red.title': 'Red',
  'item.blue.title': 'Blue',
  'item.green.title': 'Green',
  'item.yellow.title': 'Yellow',
  'item.purple.title': 'Purple',
  'item.sky.title': 'Sky Blue',
  'item.lime.title': 'Light Green',
  'item.hotpink.title': 'Deep Pink',
  'item.pink.title': 'Light Pink',
  'item.brown.title': 'Brown',
  'item.graphite.title': 'Graphite',
  'item.bronze.title': 'Bronze',
  'item.silver.title': 'Silver',
  'item.gold.title': 'Gold',
  'item.star.title': 'Star',
  'item.triangle.title': 'Triangle',
  'item.square.title': 'Square',
  'item.diamond.title': 'Diamond',
  'item.plus.title': 'Plus (+)',
  'item.minus.title': 'Minus (−)',
  'item.times.title': 'Times (×)',
  'item.divide.title': 'Divide (÷)',
  'item.spa.title': 'Hot Spring (♨)',
  'item.club.title': 'Club (♧)',
  'item.spade.title': 'Spade (♤)',
  'item.heart.title': 'Heart (♡)',
  'item.note.title': 'Note (♪)',
  'item.notes.title': 'Notes (♬)',
  'mcp.equips.rules': '[Equippable items]\n- There are colors and shapes. You must equip one of each to join a league. The equipped color and shape are used in a game for your token and for the marks on the lands you own.\n- You start with 5 colors (Red, Blue, Green, Yellow, Purple) and 4 shapes (Star, Triangle, Square, Diamond), with Red and Star equipped. These basic items cannot be bought or sold.\n- More colors and shapes are sold in the shop. You can own only one of each; they are never consumed; selling one returns {itemSell}% of its price and removes it. If you sell the one you had equipped, you must equip another.\n- They cannot be changed during a game. AI players use basic colors and shapes that do not clash with yours.\n[Colors and shapes sold in the shop]',
  'mcp.equips.entry': '- [{slot}] {item} ({price})',
  'mcp.equips.guide': '- Colors and shapes (equippable items) are under the "Colors" and "Shapes" categories of the shop and of "My Items". Press a card (items.pick) and then "Equip" (items.equip) in its detail popup. The shop also buys and sells them (items.trade). "My token" in the lobby shows what is equipped; you cannot join a league while either one is empty.',
  'item.category.charm': 'Charms',
  'charm.grade.common': 'Common',
  'charm.grade.uncommon': 'Uncommon',
  'charm.grade.rare': 'Rare',
  'charm.grade.legend': 'Legendary',
  'charm.info.grade': 'Grade',
  'charm.info.sell': 'Resale price',
  'charm.double.brief': 'Doubles chance +{chance}%',
  'charm.double.description': 'When you roll the dice in a game, your chance of rolling doubles goes up by {chance}%. (With normal dice, about 16.7% → about {total}%) Doubles give you another roll, and get you off the Desert Island at once.',
  'charm.discount.brief': '{chance}% chance of {percent}% off a land',
  'charm.discount.description': 'When you buy a land in a game, there is a {chance}% chance that you pay {percent}% less. You still need enough money for the full price to buy it. It does not apply to buildings, tolls and fees, the welfare fund, or payments from Secret Coupons.',
  'charm.toll.brief': '{chance}% chance of {percent}% off a toll or fee',
  'charm.toll.description': 'When you owe another player a toll or fee in a game (the space travel fee included), there is a {chance}% chance that you pay {percent}% less. If you are short of cash, the discount is applied before you have to sell any land. It does not apply to buying lands, buildings, the welfare fund, or payments to the bank from Secret Coupons.',
  'charm.redraw.brief': '{chance}% chance to redraw a bad Secret Coupon',
  'charm.redraw.description': 'When you draw a Secret Coupon in a game and the next one would hurt you right away, such as a fine, a tax, losing a land or being sent to the Desert Island, there is a {chance}% chance that it goes to the back of the deck and you draw again.',
  'charm.build.brief': '{chance}% chance of a free {building} on a new land',
  'charm.build.description': 'When you buy a land in a game, there is a {chance}% chance that one {building} is built on it for free right away. It applies only when you have just bought the land, and not to lands where nothing can be built.',
  'charm.build.revisit': 'When you buy a land in a game, and whenever you arrive at your own land that has no {building}, there is a {chance}% chance that one {building} is built on it for free. It does not apply to lands where nothing can be built.',
  'charm.build.space': 'On the Space Tour Course this becomes a {base}% chance of one free base instead. (It applies only to stars, where a base can be built.)',
  'charm.when': 'Equip it in the lobby item window. You can equip only one at a time, and you can join a league without one. The effect of the equipped charm lasts for the whole game.',
  'charm.limit': 'It is never consumed. You can own several of the same charm, and selling it to the shop removes it.',
  'charm.unequip': 'Unequip',
  'charm.undone': 'Unequipped {item}.',
  'charm.sold': 'You sold every copy of the charm you had equipped, so it is no longer equipped.',
  'charm.shopOnly': 'Charms are equipped in "My Items" in the lobby.',
  'charm.gameOnly': 'Charms cannot be changed during a game. The charm you had equipped when you joined applies to this game.',
  'use.pass.title': 'Free Pass used!',
  'use.pass.text': 'Toll and fees for {tile} waived',
  'use.pass.travel': 'Fee for {tile} waived',
  'use.pass.stamp': 'FREE',
  'use.radio.title': 'Radio used!',
  'use.radio.text': 'Escaping the island.',
  'use.radio.stamp': 'ESCAPE',
  'use.source.coupon': 'Secret Coupon',
  'use.source.item': 'Item',
  'defeat.bankrupt.title': '{player} went bankrupt.',
  'defeat.forfeit.title': '{player} forfeited.',
  'charm.flash': '{item} activated!',
  'charm.flash.double': 'You rolled doubles!',
  'charm.flash.discount': '{percent}% off {tile}',
  'charm.flash.toll': '{percent}% off the toll and fees for {tile}',
  'charm.flash.build': 'A free {building} was built in {tile}.',
  'charm.flash.redraw': 'The [{coupon}] coupon goes to the back of the deck. Drawing again.',
  'ticket.brief': 'Get {n} random charm(s)',
  'ticket.description': 'It is used the moment you buy it and gives you {n} random charm(s). You may get a charm you already own. Charms cannot be bought directly, only drawn, and you equip them in "My Items" in the lobby.',
  'ticket.when': 'It is used as soon as you buy it.',
  'ticket.limit': 'You can buy it as many times as you like. Each charm is drawn separately with the same odds.',
  'ticket.odds': 'Odds by grade',
  'ticket.chance': '{grade} {percent}%',
  'ticket.draw': 'Draw',
  'draw.title': 'Charm Draw Results',
  'draw.best': 'You got a {grade} charm!',
  'draw.tally': '{grade} × {n}',
  'draw.done': 'OK',
  'draw.again': 'Draw Again',
  'item.charmticket.title': 'Charm Ticket',
  'item.charmticket10.title': '10-Charm Ticket',
  'item.brokendice.title': 'Broken Dice',
  'item.oldcoin.title': 'Old Coin',
  'item.expiredvoucher.title': 'Expired Gift Voucher',
  'item.tornlottery.title': 'Torn Lottery Ticket',
  'item.realtor.title': "Local Realtor's Card",
  'item.scratched.title': 'Scratched Lottery Ticket',
  'item.woodendice.title': 'Wooden Dice',
  'item.memorialcoin.title': 'Commemorative Coin',
  'item.mysteryvoucher.title': 'Mystery Gift Voucher',
  'item.fortunecookie.title': 'Fortune Cookie',
  'item.lawfirm.title': 'Big Law Firm Card',
  'item.stock.title': 'Stock Certificate',
  'item.expresscard.title': 'Express Card',
  'item.president.title': "President's Card",
  'item.pendant.title': 'Lucky Pendant',
  'item.etf.title': 'Leveraged ETF Certificate',
  'item.blackcard.title': 'Black Card',
  'mcp.leagues.rules': '[Leagues]\n- Choose a league in the lobby. You pay the entry fee to start; if you win you get your in-game cash plus the full value of your lands and buildings as lobby money, and if you lose the fee is gone. The money multiplier applies to salaries, land prices, building costs, tolls and fees, and coupon amounts.',
  'mcp.leagues.entry': '- {league} : entry fee {fee}, starting cash {cash}, money multiplier x{n}, {rivals}.',
  'mcp.leagues.reward': 'The win reward is fixed at {reward} and nothing else is paid.',
  'mcp.leagues.hidden': 'It does not appear in the league list while your lobby money is {limit} or more.',
  'mcp.leagues.noItems': 'Consumable items cannot be used. (Colors, shapes, charms and secret coupons work as usual.)',
  'mcp.charms.rules': '[Charms]\n- A charm is an equippable item. You can equip only one, and you can join a league without one. The equipped charm works for the whole game. Among AI players, only one in the Red League has a Common or Uncommon charm.\n- Charms cannot be bought directly. Buying a Charm Ticket ({ticket}) or a 10-Charm Ticket ({ticket10}) in the shop draws random charms on the spot. You may get the same charm again.\n- A newly started slot begins with one {starter}, already equipped. (Slots saved earlier do not receive one.)\n- The grades are Common, Uncommon, Rare and Legendary. In a draw, Uncommon is 1/5 as likely as Common, Rare 1/100 and Legendary 1/2000. ({odds})\n- Charms you own can be sold in the shop for a price set by grade. ({sells})\n- Charm details can be read only in the item window ("My Items" in the lobby, "Items" during a game), and charms are equipped only in the lobby. During a game the player info window (game.player) shows just the name of the charm that player has equipped. Otherwise a notice appears only when an effect happens.\n[Charm list]',
  'mcp.charms.entry': '- [{grade}] {item} : {brief}',
  'mcp.charms.guide': '- Drawing charms : under the "Charms" category of the shop, press a ticket card (items.pick) and then "Draw" (items.trade) in its detail popup. The money is deducted and the results appear; close them with "OK" (items.done). Sell charms you own on the Sell tab.\n- Equipping a charm : under the "Charms" category of "My Items", press a card and then "Equip" (items.equip) or "Unequip" (items.unequip).',
  'item.pass.title': 'Free Pass',
  'item.pass.brief': 'Skip one toll and fee',
  'item.pass.description': "World Tour Course only. Skip the toll and building fees you owe when you land on another player's land, one time. It also covers the space travel fee charged when another player owns the Columbia. It is kept and used separately from Secret Coupon passes. Using it removes one from your stock.",
  'item.pass.when': 'The game asks whether to use it when you have to pay a toll or fee.',
  'item.radio.title': 'Radio',
  'item.radio.brief': 'Escape the island at once',
  'item.radio.description': 'World Tour Course only. When you are stuck on the Desert Island, escape at once without waiting for doubles, then roll the dice and move. It is kept and used separately from Secret Coupon radios. Using it removes one from your stock.',
  'item.radio.when': 'The game asks whether to use it when you land on the island, and before each roll while you are stuck there.',
  'item.invitation.title': 'Space Travel Invitation',
  'item.invitation.brief': 'Board space travel for free',
  'item.invitation.description': 'World Tour Course only. Instead of rolling the dice, move straight to Space Travel, board, and end your turn. You pay no fee even if someone owns the Columbia, and you collect your salary if you pass Start on the way. On your next turn you can move to any tile on the board. Using it removes one from your stock.',
  'item.invitation.when': 'Use it yourself from the item list on your turn to roll the dice.',
  'item.timeinvite.title': 'Time Travel Invitation',
  'item.timeinvite.brief': 'Board time travel for free',
  'item.timeinvite.description': 'Space Tour Course only. Instead of rolling the dice, move straight to Time Travel, board, and end your turn. You pay no fee even if someone owns the Time Machine, and you collect your salary if you pass Earth on the way. On your next turn you move straight to any tile on the board without rolling the dice. It is counted separately from the Time Machine Invitation Telepathy card. Using it removes one from your stock.',
  'item.timeinvite.when': 'Use it yourself from the item list on your turn to roll the dice.',
  'item.bigdice.title': 'Big Dice',
  'item.bigdice.brief': 'Dice that roll only 4, 5, 6',
  'item.bigdice.description': 'Usable on any course. Swap both dice for this roll with dice that only show 4, 5 and 6. (Faces 1, 2, 3 become 4, 5, 6.) Handy when you want to go far. The effect covers a single roll on the turn you use it, so if you roll doubles the extra roll uses normal dice again. One is removed from your stock the moment you use it, and it is not returned even if you do not roll that turn.',
  'item.bigdice.when': 'Use it yourself from the item list on your turn to roll, then roll the dice.',
  'item.smalldice.title': 'Small Dice',
  'item.smalldice.brief': 'Dice that roll only 1, 2, 3',
  'item.smalldice.description': 'Usable on any course. Swap both dice for this roll with dice that only show 1, 2 and 3. (Faces 4, 5, 6 become 1, 2, 3.) Handy when you want to stop close by. The effect covers a single roll on the turn you use it, so if you roll doubles the extra roll uses normal dice again. One is removed from your stock the moment you use it, and it is not returned even if you do not roll that turn.',
  'item.smalldice.when': 'Use it yourself from the item list on your turn to roll, then roll the dice.',
  'store.title': 'Item Shop',
  'store.money': 'Your money',
  'store.hint': 'Click an item to read its details and buy or sell it. Selling returns {n}% of the purchase price.',
  'store.tab.buy': 'Buy',
  'store.tab.sell': 'Sell',
  'store.nothing': 'You have nothing to sell. You can buy items on the Buy tab.',
  'store.owned': 'Owned ×{n}',
  'store.priceBuy': 'Purchase price',
  'store.priceSell': 'Resale price ({n}%)',
  'store.quantity': 'Quantity',
  'store.less': 'Decrease quantity',
  'store.more': 'Increase quantity',
  'store.max': 'Max',
  'store.total.buy': 'Total cost',
  'store.total.sell': 'You receive',
  'store.buy': 'Buy {n}',
  'store.sell': 'Sell {n}',
  'store.bought': 'Bought {n} × {item}. (In stock : {total})',
  'store.sold': 'Sold {n} × {item} for {amount}. (In stock : {total})',
  'store.short': 'You do not have enough money to buy this.',
  'settings.reset': 'Reset Settings',
  'settings.resetTitle': 'Reset settings and saved data',
  'settings.resetText': 'Restore the default language and light theme, delete all three save slots and items, then return to the main menu. Continue?',
  'settings.resetDoneTitle': 'Reset complete',
  'settings.resetDone': 'Settings and saved data have been reset.',
  'item.use': 'Use',
  'item.use.title': 'Use {item}',
  'item.use.note': 'Use it now? One is removed from your stock at once and this cannot be undone.',
  'item.block.ask': 'This item is not used directly. The game asks whether to use it when the situation arises.',
  'item.block.turn': 'It can only be used on your turn to roll the dice.',
  'item.block.spent': 'Already used in this game. It can be used only once per game.',
  'item.block.shared': 'One of {items} has already been used in this game. They share a single use per game.',
  'league.white': 'White League',
  'league.green': 'Green League',
  'league.orange': 'Orange League',
  'league.red': 'Red League',
  'league.white.rivals': '1 AI player (one on one)',
  'league.green.rivals': '1-3 AI players (2 is most likely)',
  'league.orange.rivals': '1-3 AI players (3 is most likely)',
  'league.red.rivals': '1-3 AI players (3 is most likely, 1 is rare); one of them has a Common or Uncommon charm',
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.dark': 'Dark mode',
  'settings.on': 'On',
  'settings.off': 'Off',
  'language.ko': '한국어',
  'language.en': 'English',
  'player.ai': 'Computer {n}',
  'player.you': 'You',
  'player.cash': 'Cash',
  'player.lands': '{n} land(s)',
  'player.turn': 'Turn',
  'player.island': 'Island ({n} turn(s) left)',
  'player.boarded': 'On board',
  'player.bankrupt': 'Bankrupt',
  'game.roll': 'Roll Dice',
  'game.items': 'Items',
  'game.turn': "{player}'s turn",
  'game.fund': 'Welfare fund',
  'game.bank': 'Bank',
  'game.league': '{league} · x{n}',
  'game.players': 'Players',
  'game.log': 'Game Log',
  'game.travelHere': 'Travel Here',
  'game.closeHint': 'Click again to close.',
  'hint.roll': 'It is your turn. Roll the dice.',
  'hint.double': 'Doubles! Roll the dice again.',
  'hint.loaded': '{item} active : this roll only shows {faces}.',
  'hint.island': 'You are stuck on the island. Roll doubles to escape. ({n} turn(s) left)',
  'hint.release': 'You leave the island this turn. Roll the dice.',
  'hint.travel': 'Space travel! Click a tile, then press [Travel Here].',
  'hint.timetravel': 'Time travel! No dice this turn. Click a tile, then press [Travel Here].',
  'hint.wait': '{player} is taking a turn.',
  'intro.rolling': '{player} rolls for the turn order.',
  'intro.title': 'Turn Order',
  'intro.text': 'Players take turns from the highest dice total. (Ties go to the lower player number.)',
  'intro.start': 'Start',
  'type.city': 'City',
  'type.korea': 'Korean City',
  'type.special': 'Special Facility',
  'type.start': 'Start',
  'type.coupon': 'Secret Coupon',
  'type.space': 'Space Travel',
  'type.island': 'Desert Island',
  'type.fund': 'Welfare Fund HQ',
  'type.desk': 'Welfare Fund Desk',
  'desc.city': 'After buying it, each time you land here again you may build one building: villas (up to 2), a building (1) or a hotel (1).',
  'desc.korea': 'A Korean city. No buildings can be built here.',
  'desc.special': 'A special facility. No buildings can be built here.',
  'desc.columbia': 'A special facility. No buildings can be built here. Its owner collects the space travel fee from other players who land on Space Travel.',
  'desc.start': 'Everyone starts here. You receive a salary whenever you pass or stop here.',
  'desc.coupon': 'Draw a secret coupon and do what it says.',
  'desc.space': 'You board the shuttle and move to any tile on your next turn. If someone owns the Columbia, you must pay the fee.',
  'desc.island': 'You are stuck here. Roll doubles to escape at once; otherwise you rest for 2 turns and move on the 3rd.',
  'desc.fund': 'Take all of the welfare fund piled up here.',
  'desc.desk': 'Pay into the welfare fund. If you are short, you pay only what you have and do not lose.',
  'tile.start': 'Start',
  'tile.coupon': 'Secret Coupon',
  'tile.space': 'Space Travel',
  'tile.island': 'Desert Island',
  'tile.fund': 'Welfare Fund HQ',
  'tile.desk': 'Welfare Fund Desk',
  'tile.taipei': 'Taipei',
  'tile.hongkong': 'Hong Kong',
  'tile.manila': 'Manila',
  'tile.jeju': 'Jeju Island',
  'tile.singapore': 'Singapore',
  'tile.cairo': 'Cairo',
  'tile.istanbul': 'Istanbul',
  'tile.athens': 'Athens',
  'tile.copenhagen': 'Copenhagen',
  'tile.stockholm': 'Stockholm',
  'tile.concorde': 'Concorde',
  'tile.zurich': 'Zurich',
  'tile.berlin': 'Berlin',
  'tile.montreal': 'Montreal',
  'tile.buenosaires': 'Buenos Aires',
  'tile.saopaulo': 'Sao Paulo',
  'tile.sydney': 'Sydney',
  'tile.busan': 'Busan',
  'tile.hawaii': 'Hawaii',
  'tile.lisbon': 'Lisbon',
  'tile.madrid': 'Madrid',
  'tile.tokyo': 'Tokyo',
  'tile.columbia': 'Columbia',
  'tile.paris': 'Paris',
  'tile.rome': 'Rome',
  'tile.london': 'London',
  'tile.newyork': 'New York',
  'tile.seoul': 'Seoul',
  'building.villa': 'Villa',
  'building.building': 'Building',
  'building.hotel': 'Hotel',
  'info.price': 'Land price',
  'info.cost': 'Build a {building}',
  'info.toll': 'Toll',
  'info.fee': '{building} fee',
  'info.feeEach': '{building} fee (each)',
  'info.spaceFee': 'Space travel fee',
  'info.salary': 'Salary',
  'info.welfare': 'Payment',
  'info.fund': 'Fund piled up',
  'info.owner': 'Owner',
  'info.buildings': 'Buildings',
  'info.total': 'Current toll and fees',
  'info.sale': 'Sale to the bank ({n}%)',
  'ask.buy.title': 'Buy this land?',
  'ask.buy.yes': 'Buy ({amount})',
  'ask.buy.no': 'Do not buy',
  'ask.build.title': 'Build something?',
  'ask.build.text': 'You may build only one building per turn.',
  'ask.build.option': 'Build a {building} ({amount})',
  'ask.build.max': '{building} (limit reached)',
  'ask.build.short': 'Build a {building} ({amount}) - not enough cash',
  'ask.build.no': 'Do not build',
  'ask.sell.title': 'Not Enough Cash',
  'ask.sell.text': 'Amount due : {amount}\nYour cash : {cash}\nShortfall : {short}\n\nChoose lands to sell until you can pay. (You get back {n}% of the purchase and building prices.)',
  'ask.sell.option': 'Sell {tile} (+{amount})',
  'ask.pass.title': 'Use Free Pass',
  'ask.pass.text': 'You owe the toll and fees for {tile}.\nUsing a free pass skips this payment.',
  'ask.pass.travel': 'You owe the fee for {tile}.\nUsing an item free pass skips this payment.',
  'ask.pass.due': 'Amount due',
  'ask.pass.coupon': 'Use Coupon Free Pass (have {n})',
  'ask.pass.item': 'Use Item Free Pass (have {n} · once per game)',
  'ask.radio.title': 'Use Radio',
  'ask.radio.text': 'You are stuck on the island.\nUsing a radio lets you escape at once and roll the dice to move.',
  'ask.radio.arrival': 'You have landed on the island.\nUsing an item radio keeps you from being stuck, so you roll and move on your next turn.',
  'ask.radio.coupon': 'Use Coupon Radio (have {n})',
  'ask.radio.item': 'Use Item Radio (have {n} · once per game)',
  'ask.keep': 'Do not use',
  'result.win.title': 'Victory!',
  'result.win.text': 'All the other players went bankrupt.\nYou get your in-game cash plus the full value of your lands and buildings.',
  'result.win.fixed': 'All the other players went bankrupt.\nThe {league} pays a fixed reward. (Your in-game cash and lands are not part of it.)',
  'result.cash': 'Cash',
  'result.property': 'Lands and buildings',
  'result.reward': 'Reward',
  'result.lose.title': 'Defeat',
  'result.lose.text': 'You lost this game.\nReturning to the lobby shortly.',
  'result.lose.free': 'You lost this game, but it cost you nothing.\nReturning to the lobby shortly.',
  'result.lobby': 'To the Lobby',
  'coupon.header': 'Secret Coupon',
  'coupon.drawer': 'Drawn by {player}',
  'coupon.welfare.title': 'Welfare Fund',
  'coupon.welfare.text': 'Go to the Welfare Fund Desk.\nCollect your salary if you pass Start.',
  'coupon.dividend.title': 'Welfare Fund Dividend',
  'coupon.dividend.text': 'Go to the Welfare Fund HQ.\nCollect your salary if you pass Start.',
  'coupon.speeding.title': 'Speeding Fine',
  'coupon.speeding.text': 'You were caught speeding. Pay a fine of {amount}.',
  'coupon.jeju.title': 'Sightseeing Trip',
  'coupon.jeju.text': 'Go to Jeju Island.\nPay the toll if another player owns it.\nCollect your salary if you pass Start.',
  'coupon.busan.title': 'Sightseeing Trip',
  'coupon.busan.text': 'Go to Busan.\nPay the toll if another player owns it.\nCollect your salary if you pass Start.',
  'coupon.seoul.title': 'Sightseeing Trip',
  'coupon.seoul.text': 'Go to Seoul.\nPay the toll if another player owns it.',
  'coupon.pass.title': 'Free Pass',
  'coupon.pass.text': "While you hold this pass, you may use it to pass through another player's place without paying the toll or fees.\nYou may keep it. It is used up after one use.",
  'coupon.radio.title': 'Radio',
  'coupon.radio.text': 'While you hold this radio, you may use it on the island to escape.\nYou may keep it. It is used up after one use.',
  'coupon.halfsale.title': 'Half-Price Sale',
  'coupon.halfsale.text': 'Sell your most expensive land (city or special facility) to the bank at half price (50%).\nIts buildings are sold with it.',
  'coupon.lottery.title': 'Lottery Winner',
  'coupon.lottery.text': 'Congratulations. You won the lottery.\nCollect {amount}.',
  'coupon.study.title': 'Study Abroad',
  'coupon.study.text': 'Pay your tuition.\nPay {amount} to the bank.',
  'coupon.invitation.title': 'Space Travel Invitation',
  'coupon.invitation.text': 'The space agency has sent you an invitation.\nMove to Space Travel at once.\nWith the invitation you board for free, without paying the owner of the Columbia.',
  'coupon.security.title': 'Security Fee',
  'coupon.repair.title': 'Building Repairs',
  'coupon.incometax.title': 'Income Tax',
  'coupon.tax.text': 'Pay the bank for every building on all the lands you own.\nHotel - {hotel} each\nBuilding - {building} each\nVilla - {villa} each',
  'coupon.airtravel.title': 'Air Travel',
  'coupon.airtravel.text': 'Take the Concorde to Taipei.\nPay the fee (toll) if a player owns the Concorde.\nCollect your salary if you pass Start.\nPay the toll and fees if a player owns Taipei.',
  'coupon.hospital.title': 'Hospital Bill',
  'coupon.hospital.text': 'You had a medical checkup.\nPay {amount} to the bank.',
  'coupon.moving.title': 'Moving House',
  'coupon.moving.text': 'Move back three tiles from where you are.\n(The effect of the tile you arrive at applies.)',
  'coupon.scholarship.title': 'Scholarship',
  'coupon.scholarship.text': 'Receive a scholarship of {amount} from the bank.',
  'coupon.highway.title': 'Highway',
  'coupon.highway.text': 'Go to Start.',
  'coupon.amateur.title': 'Amateur Tournament Win',
  'coupon.amateur.text': 'Receive prize money of {amount} from the bank.',
  'coupon.pension.title': 'Pension',
  'coupon.pension.text': 'Receive a pension of {amount} from the bank.',
  'coupon.castaway.title': 'Castaway',
  'coupon.castaway.text': 'Go to the Desert Island at once.\nThis time you do not collect a salary even if you pass Start.',
  'log.order': 'Turn order : {order}',
  'log.dice': '{player} rolled {a} + {b} = {sum}',
  'log.double': '{player} rolled doubles and rolls again.',
  'log.salary': '{player} received a salary of {amount}.',
  'log.buy': '{player} bought {tile} for {amount}.',
  'log.build': '{player} built a {building} in {tile}. ({amount})',
  'log.toll': '{player} paid {target} {amount} in toll and fees for {tile}.',
  'log.spaceFee': '{player} paid {target} a space travel fee of {amount}.',
  'log.payBank': '{player} paid {amount} to the bank.',
  'log.gain': '{player} received {amount} from the bank.',
  'log.sell': '{player} sold {tile} to the bank. (+{amount})',
  'log.halfsale': '{player} sold {tile} in the half-price sale. (+{amount})',
  'log.sellAll': '{player} cannot pay even after selling every land.',
  'log.partial': '{player} paid only the remaining {amount}.',
  'log.bankrupt': '{player} went bankrupt and lost.',
  'log.forfeit': '{player} gave up the game.',
  'log.coupon': '{player} drew the secret coupon [{coupon}].',
  'log.keep': '{player} keeps the [{coupon}] coupon.',
  'log.pass': '{player} used a free pass and skipped {amount} for {tile}.',
  'log.exempt': "{player} skipped {amount} for {tile} thanks to the free pass.",
  'log.radio': '{player} used a radio and escaped the island.',
  'log.itemPass': '{player} used an item pass and skipped the {amount} fee at {tile}.',
  'log.itemRadio': '{player} used an item radio and escaped the island.',
  'log.itemUse': '{player} used the item [{item}].',
  'log.charmDouble': "{player}'s charm [{item}] turned the roll into doubles.",
  'log.charmDiscount': '{player} got {percent}% off {tile} thanks to the charm [{item}].',
  'log.charmToll': '{player} got {percent}% off the toll and fees for {tile} thanks to the charm [{item}].',
  'log.charmBuild': "{player}'s charm [{item}] built a free {building} in {tile}.",
  'log.charmRedraw': '{player} sent the [{coupon}] coupon to the back of the deck with the charm [{item}] and draws again.',
  'log.island': '{player} is stuck on the island.',
  'log.islandStay': '{player} did not roll doubles and stays on the island.',
  'log.islandDouble': '{player} rolled doubles and escaped the island!',
  'log.islandFree': '{player} was released from the island.',
  'log.fundPay': '{player} paid {amount} into the welfare fund.',
  'log.fundGet': '{player} collected the welfare fund of {amount}.',
  'log.board': '{player} boarded the shuttle and will move to any tile next turn.',
  'log.travel': "{player}'s space travel destination : {tile}",
  'log.nothing': '{player} has no matching land or building, so nothing happened.',
  'log.win': '{player} won the game!',
  'common.close': 'Close',
  'common.goBack': 'Back',
  'lobby.export': 'Export JSON',
  'export.title': 'Export JSON',
  'export.done': 'Your save data was copied to the clipboard as JSON text.',
  'export.manual': 'Could not copy to the clipboard. Please copy the text below yourself.',
  'load.load': 'Load',
  'load.copy': 'Copy JSON',
  'load.delete': 'Delete',
  'load.cancel': 'Cancel',
  'load.summary': '{name}\nMoney : {money}\n{state}',
  'load.emptyText': 'This slot is empty.\nYou can import save data that was exported as JSON into this slot.',
  'load.import': 'Import JSON',
  'load.deleteTitle': 'Delete?',
  'load.deleteText': 'Really delete the save data in slot {n}?\nThis cannot be undone.',
  'import.title': 'Import JSON',
  'import.text': 'Type or paste the exported JSON text into the box below. ( // and /* */ comments are allowed. )\nClick the box to start typing and press ESC to leave it.',
  'import.placeholder': '{ "name": "Player", "money": 20000000, "game": null }',
  'import.submit': 'Import',
  'import.failTitle': 'Import Failed',
  'import.failParse': 'The text is not valid JSON.',
  'import.failData': 'The contents of the save data are not valid.',
  'import.failVersion': 'This save data is in a version this game does not support. (It may have been made by a newer version of the game.)',
  'playerinfo.assets': 'Total assets',
  'playerinfo.coupons': 'Coupons held',
  'playerinfo.charm': 'Equipped charm',
  'playerinfo.status': 'Status',
  'playerinfo.playing': 'Playing',
  'playerinfo.lands': 'Lands owned ({n})',
  'playerinfo.none': 'No lands owned.',
  'playerinfo.hint': 'Click a land to see its building costs, toll and fees.',
  'real.title': 'In real life',
  'real.taipei': 'Taipei 101, the tallest building in the world from 2004 to 2010, has a 660-tonne golden steel ball hanging inside. It keeps the tower from swaying in typhoons, and it became a cute mascot called "Damper Baby" sold in the gift shop. Possibly the heaviest mascot on Earth.',
  'real.hongkong': 'With more than 550 buildings over 150 m, no city has more skyscrapers. If the hills wear you out, ride the longest outdoor covered escalator system in the world, over 800 m of it. Here the commute is a theme park ride.',
  'real.manila': 'The stars of the street are jeepneys: surplus military jeeps left after World War II, stretched and painted in dazzling colors. They are nicknamed "King of the Road", and this king has never learned to pass quietly.',
  'real.jeju': 'Known as the island of three abundances: rocks, wind and women. Its haenyeo, women who dive without oxygen tanks, joined the UNESCO intangible heritage list in 2016, and Hallasan (1,947 m) is the highest mountain in South Korea. Warning: tangerines are bought by the box here.',
  'real.singapore': 'Chewing gum has not been sold here since 1992, after gum stuck on subway door sensors kept stopping the trains. No worries: the hawker centres, UNESCO-listed in 2020, offer plenty of other things to chew.',
  'real.cairo': 'The Great Pyramid in Giza, right next to the city, was the tallest structure on Earth for more than 3,800 years. To beat that record, first you need to stay standing for about 3,800 years.',
  'real.istanbul': 'A city with one foot in Europe and one in Asia. The Grand Bazaar, open since 1461, packs more than 4,000 shops into 61 covered streets. Getting in is easy; getting out empty-handed is not.',
  'real.athens': 'Host of the first modern Olympic Games in 1896. The marathon comes from the legend of a messenger running about 40 km from Marathon to Athens with news of victory. The Parthenon is over 2,400 years old, so around here the bar for calling a building "old" is rather high.',
  'real.copenhagen': 'More bicycles than cars roll into the city centre. The Little Mermaid statue is only 1.25 m tall, so "smaller than I thought" is the standard review, and Tivoli Gardens, opened in 1843, inspired Walt Disney.',
  'real.stockholm': 'A city of 14 islands joined by 57 bridges. In 1628 the warship Vasa sank just 1,300 m into her maiden voyage; raised 333 years later, she is now a hugely popular museum. Leave a failure long enough and it becomes a tourist attraction.',
  'real.zurich': 'Famously expensive, yet the water is free: more than 1,200 fountains around town pour drinkable water. It is the most reliable way to save money here.',
  'real.berlin': 'With over 960 bridges, Berlin has far more than Venice (about 435). Currywurst, first sold by Herta Heuwer in 1949, is the signature snack. Call it the city that chose sausages over gondolas.',
  'real.montreal': 'Winters are so cold that the city built 32 km of underground city. Local stars are poutine, fries topped with cheese curds and gravy, and bagels boiled in honey water and baked in wood-fired ovens. Here, cold is defeated with calories.',
  'real.buenosaires': 'The birthplace of tango. Avenida 9 de Julio, 110 m wide, is often called the widest avenue in the world, and crossing it on a single green light is no easy feat. There is no shame in resting halfway.',
  'real.saopaulo': 'The largest city in the Southern Hemisphere. It has some 6,000 pizzerias said to bake about a million pizzas a day. When traffic jams, many people simply take a helicopter, giving the city one of the largest helicopter fleets in the world.',
  'real.sydney': 'The Opera House was supposed to take 4 years and cost 7 million dollars; it took 14 years and 102 million. All is forgiven when the result looks this good. By the way, the capital of Australia is not here but in Canberra.',
  'real.busan': 'The number one port of Korea, handling most of the nation\'s container cargo. At Jagalchi, the largest seafood market in the country, the greeting is "Come, look, buy", and during the Busan International Film Festival, started in 1996, you get the sea and the movies at once.',
  'real.hawaii': 'Measured from its base on the sea floor, Mauna Kea is 10,210 m tall, higher than Everest. Residents eat about 7 million cans of Spam a year. And the islands drift about 10 cm closer to Japan every year, so if you are very patient you can save on airfare.',
  'real.lisbon': 'A city of seven hills, where the yellow Tram 28, running since 1914, does the climbing for you. The custard tarts of Belém have been baked since 1837 and only about six people are said to know the recipe: a secret guarded better than any toll.',
  'real.madrid': 'At 667 m above sea level, it is the highest capital in the European Union. Botín, opened in 1725, is recognized by Guinness as the oldest restaurant in the world. After 300 years in business you still need a reservation.',
  'real.tokyo': 'Shinjuku Station serves about 3.5 million passengers a day, a Guinness record for the busiest station on Earth. Up to 3,000 people cross Shibuya Crossing on a single green light, and no city has more Michelin-starred restaurants. If you get lost, at least you get lost somewhere delicious.',
  'real.paris': 'In summer the iron expands and the Eiffel Tower grows about 15 cm taller. France bakes more than 6 billion baguettes a year, and that bread-making culture joined the UNESCO intangible heritage list in 2022. Carrying bread under your arm is basically cultural heritage.',
  'real.rome': 'About 1.5 million euros in coins are tossed into the Trevi Fountain every year, and all of it is fished out and given to charity. If you are thirsty, some 2,500 "nasoni" (big nose) fountains pour free water. In Rome, both wishes and water are handled on the street.',
  'real.london': 'Big Ben is not the clock tower but the nickname of the bell inside it. (The tower is the Elizabeth Tower.) London has the first underground railway in the world, opened in 1863, and cab drivers must pass a test on more than 25,000 streets. This is a city where the navigation system is a person.',
  'real.newyork': 'Central Park is bigger than the country of Monaco. The subway has 472 stations and runs around the clock, and the nickname "Big Apple" was spread by a horse-racing writer in the 1920s. The city never sleeps, and neither do its tolls.',
  'real.seoul': 'The capital for more than 630 years, ever since the Joseon dynasty moved here in 1394. It is also a city where fried chicken will find you anywhere in the Han River parks. Why is it the priciest land on this board? Pay the toll once and you will know.',
  'real.concorde': 'A supersonic airliner that cruised at Mach 2 and flew London to New York in about three and a half hours. (The record is 2 hours 52 minutes 59 seconds.) Heading west, you landed "earlier" than you took off by local time, and in flight the heat stretched the airframe by 15 to 25 cm. Only 20 were built, and it retired in 2003.',
  'real.columbia': 'On 12 April 1981 it became the first space shuttle to fly to space. On that first flight it circled the Earth 37 times in 54 and a half hours, less than 90 minutes per lap. It went up like a rocket, came down like an airplane, and flew 28 missions in all. One lap around this board is nothing.',
  'course.world': 'World Tour Course',
  'course.space': 'Space Tour Course',
  'lobby.course': 'Course',
  'lobby.otherItems': 'Consumable items that cannot be used on this course are not taken along; they stay in the lobby.',
  'league.purple': 'Purple League',
  'league.black': 'Black League',
  'league.purple.rivals': '1-3 AI players (2 is most likely)',
  'league.black.rivals': '1-3 AI players (3 is most likely); one of them has a Common or Uncommon charm',
  'item.info.course': 'Course',
  'item.course.any': 'Any course',
  'item.limit.times': 'Can be used up to {n} times per game, no matter how many you own.',
  'item.state.left': '{n} more use(s) left',
  'item.block.spentTimes': 'Already used {n} times in this game. It can be used only {n} times per game.',
  'item.angel.title': "Angel's Light",
  'item.angel.brief': 'Waive a fee, escape the black hole, or cancel a harmful card',
  'item.angel.description': "Your guardian on the Space Tour Course. Use it once to skip the fee you owe on another player's star or special facility (the time travel fee included), to escape the Black Hole at once, or to cancel a harmful Telepathy or Neuron Valley card effect that says Angel's Light can waive it. It is kept and used separately from the Angel's Light Telepathy card. Using it removes one from your stock.",
  'item.angel.when': 'The game asks whether to use it when you owe a fee, when you fall into the Black Hole, and when a harmful card effect that it can waive is about to hit you.',
  'item.escape.title': 'Black Hole Escape Pod',
  'item.escape.brief': 'Escape the black hole at once',
  'item.escape.description': 'When you fall into the Black Hole on the Space Tour Course, escape at once without waiting for doubles. After escaping you roll and move as on a normal turn, and you do not give up a star even if the roll is low. It is kept and used separately from the Black Hole Escape Pod Telepathy card. Using it removes one from your stock.',
  'item.escape.when': 'The game asks whether to use it when you land on the Black Hole, and before each roll while you are stuck there.',
  'tile.earth': 'Earth',
  'tile.moon': 'Moon',
  'tile.telepathy': 'Telepathy Card',
  'tile.mars': 'Mars',
  'tile.jupiter': 'Jupiter',
  'tile.vega': 'Vega',
  'tile.saturn': 'Saturn',
  'tile.uranus': 'Uranus',
  'tile.neptune': 'Neptune',
  'tile.timetravel': 'Time Travel',
  'tile.aries': 'Aries',
  'tile.taurus': 'Taurus',
  'tile.gemini': 'Gemini',
  'tile.neuron': 'Neuron Valley',
  'tile.cancer': 'Cancer',
  'tile.timemachine': 'Time Machine',
  'tile.leo': 'Leo',
  'tile.virgo': 'Virgo',
  'tile.blackhole': 'Black Hole',
  'tile.libra': 'Libra',
  'tile.scorpius': 'Scorpius',
  'tile.sagittarius': 'Sagittarius',
  'tile.altair': 'Altair',
  'tile.capricornus': 'Capricornus',
  'tile.aquarius': 'Aquarius',
  'tile.pisces': 'Pisces',
  'tile.rescue': 'Space Rescue Base',
  'tile.ursamajor': 'Ursa Major',
  'tile.andromeda': 'Andromeda',
  'tile.orion': 'Orion',
  'tile.cygnus': 'Cygnus',
  'tile.halley': "Halley's Comet",
  'tile.mercury': 'Mercury',
  'tile.venus': 'Venus',
  'type.star': 'Star',
  'type.telepathy': 'Telepathy Card',
  'type.neuron': 'Neuron Valley Card',
  'type.timetravel': 'Time Travel',
  'type.blackhole': 'Black Hole',
  'type.rescue': 'Space Rescue Base',
  'type.halley': "Halley's Comet",
  'desc.star': 'After buying it, you may build one base when you land here again. A base raises the fee a lot. Landing again on a star that has a base lets you expand the base. (Up to three times, once per landing. A fully expanded base raises the fee even more.)',
  'desc.earth': 'Every player starts here. You receive a salary whenever you pass or stop here. If you stop here instead of passing, you may also choose one of your stars and either build a base on it (if it has none) or expand its base once. (You pay the building or expansion cost.)',
  'desc.telepathy': 'Draw a Telepathy card and do what it says.',
  'desc.neuron': 'Draw a Neuron Valley card and do what it says.',
  'desc.timetravel': 'You board the time machine. On your next turn you roll two dice: on 4 or more you move to any tile (no salary for passing Earth), on 3 or less you move 5 tiles ahead. If someone owns the Time Machine, you must pay the fee.',
  'desc.blackhole': 'You are stuck here. Roll doubles to escape at once; otherwise you rest for 2 turns and are released on the 3rd. If the roll on that turn totals 3 or less, you give one of your lands back to the bank before moving.',
  'desc.rescue': 'If a fund has piled up you take it all; if not, you pay into the fund. If you are short, you pay only what you have.',
  'desc.halley': 'You are carried to the Telepathy Card tile next to Mars. You get no salary for passing Earth.',
  'desc.timemachine': 'A special facility. No base can be built here. Its owner collects the time travel fee from other players who land on Time Travel.',
  'desc.vega': 'A star. You may build one base and expand it up to three times. It cannot be owned together with Altair. When both Vega and Altair have owners, the two owners move to Earth, receive a salary, and may each build or expand a base on one of their stars.',
  'desc.altair': 'A star. You may build one base and expand it up to three times. It cannot be owned together with Vega. When both Vega and Altair have owners, the two owners move to Earth, receive a salary, and may each build or expand a base on one of their stars.',
  'building.base': 'Base',
  'building.annex': 'Base expansion',
  'info.feeBare': 'Fee (no base)',
  'info.feeBase': 'Fee (with a base)',
  'info.usage': 'Fee',
  'info.timeFee': 'Time travel fee',
  'info.rescue': 'Payment (when the fund is empty)',
  'info.totalFee': 'Current fee',
  'info.base': 'Base',
  'info.built': 'Built',
  'info.leftover': 'Built (comes with the purchase)',
  'info.annex': 'Expansions',
  'info.annexCount': '{n} (up to {limit})',
  'info.feeAnnex': 'Fee increase per expansion',
  'info.feeFull': 'Extra increase at full expansion ({limit})',
  'info.cost.annex': '{building} (each, up to {limit})',
  'game.fund.space': 'Space Rescue Fund',
  'hint.blackhole': 'You are stuck in the Black Hole. Roll doubles to escape. ({n} turn(s) left)',
  'hint.parole': 'You leave the Black Hole this turn. If the roll totals 3 or less, you give back one land.',
  'hint.timeroll': 'Time travel! Roll the dice: on 4 or more you move to any tile.',
  'hint.pick': 'Click a tile, then press [Travel Here].',
  'player.blackhole': 'Black Hole ({n} turn(s) left)',
  'player.timetravel': 'Time travel boarded',
  'card.header.telepathy': 'Telepathy Card',
  'card.header.neuron': 'Neuron Valley Card',
  'card.drawer': 'Drawn by {player}',
  'card.architecture.title': 'Beautiful Architecture Award',
  'card.architecture.text': 'Your work was chosen as the most beautiful architecture in space.\nYou receive prize money. (Number of bases on all your stars x {amount})',
  'card.ecology.title': 'Space Environment Levy',
  'card.ecology.text': 'Pay the space environment levy as follows.\n{bare} for each of your stars without a base\n{built} for each of your stars with a base',
  'card.rescue.title': 'Space Rescue Base',
  'card.rescue.text': 'You ran out of food on your journey. Go to the Space Rescue Base and take the fund piled up there.\n(You do not pay into the fund even if it is empty.)',
  'card.lovers.title': 'Altair and Vega',
  'card.lovers.text': 'Move to whichever of Altair and Vega has no owner (your choice) and get that star for free.\n(If both stars have owners, nothing happens.)',
  'card.meteorite.title': 'Meteorite Found',
  'card.meteorite.text': 'You found a huge meteorite while exploring space and sold it.\n(Receive {amount} from the bank.)',
  'card.luckydice.title': 'Lucky Die',
  'card.luckydice.text': 'Roll one die and receive the number rolled x {amount}.',
  'card.cosmos.title': 'Cosmos Award',
  'card.cosmos.text': 'For your great contribution to space exploration and technology, you receive this year\'s Cosmos Award.\n(Prize money {amount})',
  'card.party.title': 'Space Party Invitation',
  'card.party.text': 'You are invited to a fantastic space party on Mars, but you are too busy to go.\nChoose another player and send them to Mars by force.\n(No salary for passing Earth.)',
  'card.fear.title': 'Black Hole of Terror',
  'card.fear.text': 'You have fallen into the Black Hole.\n(Move to the Black Hole. No salary for passing Earth.)',
  'card.virus.title': 'Virus Infection',
  'card.virus.text': 'You caught the C-2021 virus on your journey. Get gamma-ray treatment.\n(Pay {amount} for treatment.)',
  'card.waste.title': 'Waste Disposal',
  'card.waste.text': 'Building your bases produced waste. Pay for its disposal.\n(Pay the number of bases on all your stars x {amount}.)',
  'card.baserepair.title': 'Space Base Maintenance',
  'card.baserepair.text': 'Space bases must be maintained regularly.\n(Pay the number of bases on all your stars x {amount}.)',
  'card.valley.title': 'Neuron Valley',
  'card.valley.text': 'Move to the Neuron Valley tile of your choice.\nYou receive a salary if you pass Earth.',
  'card.recall.title': 'Return to Earth',
  'card.recall.text': 'You look like you need a rest.\nMove to Earth. (You receive your salary.)',
  'card.asteroid.title': 'Asteroid Impact',
  'card.asteroid.text': 'An asteroid impact has wrecked all your bases. They all need repairs.\n(Pay the number of bases on all your stars x {amount}.)',
  'card.machinefix.title': 'Time Machine Repair',
  'card.machinefix.text': "You repaired the Time Machine.\nReceive a repair fee of {amount} from its owner.\n(If it has no owner, the bank pays. The owner may waive it with Angel's Light.)",
  'card.spectrumgun.title': 'Spectrum Gun',
  'card.spectrumgun.text': "You have developed the Spectrum Gun, which can destroy any material.\nUse it to take {amount} from every other player.\n(They may waive it with Angel's Light.)",
  'card.offcourse.title': 'Off Course',
  'card.offcourse.text': 'A mechanical fault has taken you off course. Pay {amount} for repairs and move back {steps} tiles.\n(No salary for passing Earth while moving back.)',
  'card.peace.title': 'Space Peace Prize',
  'card.peace.text': 'For your great contribution to peace in space, you are awarded prize money.\n(Prize money {amount})',
  'card.basereturn.title': 'Base Confiscated',
  'card.basereturn.text': "You broke the rules of the Space Federation while building a base. Give back one of your bases.\n(You may waive it with Angel's Light.)",
  'card.roundtrip.title': 'Round Trip Invitation',
  'card.roundtrip.text': 'Go once around space, collecting your salary and the Space Rescue Fund on the way.\n(You end on the same tile and do not draw another Telepathy card.)',
  'card.timeticket.title': 'Time Machine Invitation',
  'card.timeticket.text': 'You received an invitation to the Time Machine. Go to Time Travel at once.\n(It is free, so you pay no fee even if the Time Machine has an owner. No salary for passing Earth on the way.)',
  'card.robot.title': 'Robot Exploration Contest',
  'card.robot.text': 'You won the unmanned robot exploration contest.\nReceive prize money of {amount}.',
  'card.pirates.title': 'Space Pirates',
  'card.pirates.text': "The space pirates called the Hyenas have appeared. Give back one of your bases.\n(You may waive it with Angel's Light.)",
  'card.reverse.title': 'Reverse Thrust',
  'card.reverse.text': 'Roll one die and move back that many tiles.\n(No salary for passing Earth while moving back.)',
  'card.escape.title': 'Black Hole Escape Pod',
  'card.escape.text': 'You may keep this card.\nUse it to escape at once when you fall into the Black Hole.\nIt is used up after one use.',
  'card.angel.title': "Angel's Light",
  'card.angel.text': 'You may keep this card.\nUse it to escape the Black Hole at once, or to skip a fee you owe.\nIt can also waive the harmful effect of some cards. It is used up after one use.',
  'card.huygens.title': "Huygens' Cipher",
  'card.huygens.text': "You have discovered Saturn's rings. Go to Saturn.\nIf Saturn has an owner, each of you rolls one die: if yours is higher you take Saturn (base included); if the owner's is higher you pay the fee.\nIf it has no owner you may buy it. (The owner may cancel this with Angel's Light.)",
  'card.apollo.title': 'Apollo Program',
  'card.apollo.text': 'First, move to the Moon.\nIf the Moon has an owner you pay the fee; if not, you may buy it.\nThen move to Earth and receive your salary.',
  'card.newton.title': "Newton's Law of Gravitation",
  'card.newton.text': 'Move to the nearest star ahead of you that has no owner. You may buy it.\n(No salary for passing Earth on the way.)',
  'card.appleseed.title': "Appleseed's Pioneer Spirit",
  'card.appleseed.text': 'Choose one of your stars that has no base and build a base there for free.',
  'card.einstein.title': "Einstein's Relativity",
  'card.einstein.text': "The other players each roll one die.\nThe most expensive star of the player with the lowest roll is swapped with your cheapest star.\n(Bases go with the stars. That player may cancel this with Angel's Light.)",
  'card.psychic.title': 'Psychic Power',
  'card.psychic.text': 'Swap one of your stars with a star that has no owner.\n(The swap is mandatory, and bases stay on their stars.)',
  'card.doppler.title': 'Doppler Effect',
  'card.doppler.text': "If you own more stars than every other player, pay {pay} to the bank. (Angel's Light can waive it.)\nOtherwise, receive {gain} from the bank.",
  'card.zodiac.title': 'Gift of the Zodiac',
  'card.zodiac.text': 'Roll one die or two, and move to the constellation of that number.\n1 Aries · 2 Taurus · 3 Gemini · 4 Cancer · 5 Leo · 6 Virgo\n7 Libra · 8 Scorpius · 9 Sagittarius · 10 Capricornus · 11 Aquarius · 12 Pisces\n(No salary for passing Earth.)',
  'card.moravec.title': "Moravec's Navigation",
  'card.moravec.text': 'Move to any tile you like.\n(No salary for passing Earth, but you do receive it if you move to Earth itself.)',
  'card.copernicus.title': "Copernicus' Heliocentrism",
  'card.copernicus.text': '"And yet the Earth moves."\nGo to Earth at once, receive your salary and roll the dice once more.',
  'card.kepler.title': "Kepler's Harmonic Law",
  'card.kepler.text': 'Move forward by the number of stars you own x {steps}.',
  'card.shapley.title': "Shapley's Cluster Survey",
  'card.shapley.text': "Collect a survey fee of {amount} from each owner of a star within {range} tiles ahead of or behind you.\n(Once per player, however many stars. They may waive it with Angel's Light.)",
  'card.humboldt.title': "Humboldt's Remark",
  'card.humboldt.text': "\"Meteors, rocks and cosmic dust are terrorising space. Let us find the source and have it returned.\"\nThe other players each roll one die, and the cheapest land of the player with the lowest roll goes back to the bank.\n(That player may waive it with Angel's Light.)",
  'card.spectrum.title': 'Spectrum Magic',
  'card.spectrum.text': 'Roll two dice. If they total {need} or more, choose one of your stars and build a base there for free.',
  'card.mobius.title': 'Mobius Strip',
  'card.mobius.text': 'The other players each roll one die.\nThe player with the highest roll then rolls two dice, and both you and that player move forward by the total.\n(A player stuck in the Black Hole escapes and moves.)',
  'card.contract.title': 'Swapped Space Contract',
  'card.contract.text': "Swap one of your stars with a star of the other player who owns the most stars.\nYou choose your own star; theirs is picked at random.\n(That player may cancel this with Angel's Light.)",
  'card.pascal.title': 'Pascal and Fermat',
  'card.pascal.text': "Go to a star owned by another player, and each of you rolls one die.\nIf yours is higher, the owner pays you that star's fee; if it is equal or lower, you pay the owner {amount}.\n(Either side may waive it with Angel's Light.)",
  'ask.base.title': 'Build a base?',
  'ask.base.text': 'Each star can hold only one base. Once it is built, you can expand it when you land on this star again.',
  'ask.base.no': 'Do not build',
  'ask.annex.title': 'Expand the base?',
  'ask.annex.text': "Each expansion raises this star's fee by {fee}, and the last one (number {limit}) adds {bonus} more.\nA base can be expanded {limit} times, only once per landing. (Expanded {n} time(s) so far)",
  'ask.annex.option': '{building} ({amount}) · fee {from} → {to}',
  'ask.annex.no': 'Do not expand',
  'ask.angel.title': "Use Angel's Light",
  'ask.angel.fee': "You owe the fee for {tile}.\nUsing Angel's Light skips this payment.",
  'ask.angel.timefee': "You owe the time travel fee to the owner of the Time Machine.\nUsing Angel's Light lets you board without paying.",
  'ask.angel.pay': "The [{card}] card makes you pay the bank.\nUsing Angel's Light skips this payment.",
  'ask.angel.claim': "The [{card}] card makes you pay {target}.\nUsing Angel's Light skips this payment.",
  'ask.angel.base': "The [{card}] card makes you give back one base.\nUsing Angel's Light lets you keep it.",
  'ask.angel.steal': "The [{card}] card lets {target} take {tile} from you.\nUsing Angel's Light lets you keep it.",
  'ask.angel.swap': "The [{card}] card swaps your {tile} with {target}'s {other}.\nUsing Angel's Light cancels the swap.",
  'ask.angel.land': "The [{card}] card makes you give {tile} back to the bank.\nUsing Angel's Light lets you keep it.",
  'ask.angel.coupon': "Use Card Angel's Light (have {n})",
  'ask.angel.item': "Use Item Angel's Light (have {n} · {left} use(s) left this game)",
  'ask.escape.title': 'Escape the Black Hole',
  'ask.escape.arrival': "You have fallen into the Black Hole.\nUsing an Escape Pod or Angel's Light keeps you from being stuck, so you roll and move on your next turn.",
  'ask.escape.text': "You are stuck in the Black Hole.\nUsing an Escape Pod or Angel's Light lets you escape at once and roll the dice to move.",
  'ask.escape.last': "You leave the Black Hole this turn, but if the roll totals 3 or less you must give back one land.\nUsing an Escape Pod or Angel's Light spares you that.",
  'ask.escape.coupon': 'Use Card Escape Pod (have {n})',
  'ask.escape.item': 'Use Item Escape Pod (have {n} · once per game)',
  'ask.pick.blackhole.title': 'Choose a land to give back',
  'ask.pick.blackhole.text': 'You left the Black Hole, but the roll totals 3 or less.\nChoose one land to give back to the bank. (You get no money for it.)',
  'ask.pick.basereturn.title': 'Choose a base to give back',
  'ask.pick.basereturn.text': 'The [{card}] card makes you give back one base.\nChoose the star whose base you give back. (An expanded base loses its expansions too.)',
  'ask.pick.freebase.title': 'Free base',
  'ask.pick.freebase.text': 'The [{card}] card lets you build one base for free.\nChoose the star to build it on.',
  'ask.pick.reunion.title': 'Altair meets Vega',
  'ask.pick.reunion.text': 'Both Altair and Vega now have owners!\nYou may choose one of your stars and either build a base on it (if it has none) or expand its base once. (You pay the building or expansion cost.)',
  'ask.pick.earth.title': 'Landed on Earth',
  'ask.pick.earth.text': 'You have landed on Earth!\nYou may choose one of your stars and either build a base on it (if it has none) or expand its base once. (You pay the building or expansion cost.)',
  'ask.pick.valley.title': 'Choose a Neuron Valley',
  'ask.pick.valley.text': 'Choose the Neuron Valley tile to move to.',
  'ask.pick.lovers.title': 'Altair and Vega',
  'ask.pick.lovers.text': 'Choose the star to get for free. You move there.',
  'ask.pick.give.title': 'Choose a star to give up',
  'ask.pick.give.text': 'The [{card}] card makes you give up one of your stars.\nChoose the star to give up.',
  'ask.pick.take.title': 'Choose a star to take',
  'ask.pick.take.text': 'Choose the ownerless star you take in return.',
  'ask.pick.pascal.title': 'Choose a star to visit',
  'ask.pick.pascal.text': "Choose another player's star to visit.\nIf you win the roll, you collect that star's fee.",
  'ask.pick.moravec.title': "Moravec's Navigation",
  'ask.pick.moravec.text': 'Choose the tile to move to on the board.',
  'ask.pick.timetravel.title': 'Time Travel',
  'ask.pick.timetravel.text': 'Choose the tile to move to on the board.',
  'ask.pick.skip': 'Choose nothing',
  'ask.pick.value': 'worth {amount}',
  'ask.pick.fee': 'fee {amount}',
  'ask.pick.cost': 'cost {amount}',
  'ask.pick.annex': 'expansion {amount}',
  'ask.pick.rise': 'fee {from} → {to}',
  'ask.pick.owner': '{player} · fee {amount}',
  'ask.target.title': 'Choose a player to send',
  'ask.target.text': 'The [{card}] card lets you send a player to Mars. Choose who goes.',
  'ask.dicecount.title': 'How many dice?',
  'ask.dicecount.text': 'With one die you move to constellation 1-6 (Aries to Virgo); with two dice, to constellation 2-12 (Taurus to Pisces).',
  'ask.dicecount.one': 'One die',
  'ask.dicecount.two': 'Two dice',
  'use.angel.title': "Angel's Light used!",
  'use.angel.fee': 'Fee for {tile} waived',
  'use.angel.escape': 'Escaping the Black Hole.',
  'use.angel.card': 'The harmful effect of [{card}] is waived.',
  'use.angel.stamp': 'WAIVED',
  'use.escape.title': 'Escape Pod used!',
  'use.escape.text': 'Escaping the Black Hole.',
  'use.escape.stamp': 'ESCAPE',
  'use.source.card': 'Telepathy Card',
  'cast.rolling': '{player} rolls the dice.',
  'log.card.telepathy': '{player} drew the Telepathy card [{coupon}].',
  'log.card.neuron': '{player} drew the Neuron Valley card [{coupon}].',
  'log.keepCard': '{player} keeps the [{coupon}] card.',
  'log.fee': '{player} paid {target} a fee of {amount} for {tile}.',
  'log.timeFee': '{player} paid {target} a time travel fee of {amount}.',
  'log.timeBoard': '{player} boarded the time machine and will roll for a destination next turn.',
  'log.timeGo': "{player}'s time travel destination : {tile}",
  'log.timeInvite': '{player} boarded the time machine with a Time Travel Invitation and will move to any tile next turn without rolling.',
  'log.reverse': '{player} moves back {n} tile(s) with Reverse Thrust.',
  'log.timeSlip': '{player} rolled too low and moves {n} tiles ahead.',
  'log.blackhole': '{player} fell into the Black Hole.',
  'log.blackholeStay': '{player} did not roll doubles and stays in the Black Hole.',
  'log.blackholeDouble': '{player} rolled doubles and escaped the Black Hole!',
  'log.blackholeFree': '{player} was released from the Black Hole.',
  'log.surrender': '{player} rolled too low and gave {tile} back to the bank.',
  'log.escape': '{player} used an Escape Pod and escaped the Black Hole.',
  'log.itemEscape': '{player} used an item Escape Pod and escaped the Black Hole.',
  'log.angelEscape': "{player} used Angel's Light and escaped the Black Hole.",
  'log.itemAngelEscape': "{player} used an item Angel's Light and escaped the Black Hole.",
  'log.angelFee': "{player} used Angel's Light and skipped the {amount} fee for {tile}.",
  'log.itemAngelFee': "{player} used an item Angel's Light and skipped the {amount} fee for {tile}.",
  'log.angel': "{player} used Angel's Light and avoided the harmful effect of [{coupon}].",
  'log.itemAngel': "{player} used an item Angel's Light and avoided the harmful effect of [{coupon}].",
  'log.rescuePay': '{player} paid {amount} into the Space Rescue Fund.',
  'log.rescueGet': '{player} collected the Space Rescue Fund of {amount}.',
  'log.rescueNone': 'The Space Rescue Fund is empty, so {player} received nothing.',
  'log.halley': "{player} rides Halley's Comet to the Telepathy Card tile next to Mars.",
  'log.cast': '{player} rolled : {n}',
  'log.castTie': 'The rolls are tied, so the dice are rolled again.',
  'log.loversBlock': '{player} cannot buy {tile}, because Altair and Vega cannot be owned together.',
  'log.loversCancel': "The effect of {player}'s card was cancelled, because Altair and Vega cannot be owned by one player.",
  'log.reunion': 'Both Altair and Vega now have owners! {player} and {target} move to Earth and receive a salary.',
  'log.freeLand': '{player} got {tile} for free.',
  'log.freeBase': '{player} built a base on {tile} for free.',
  'log.baseLost': '{player} gave back the base on {tile}.',
  'log.annex': '{player} expanded the base on {tile}. ({amount})',
  'log.landLost': '{player} gave {tile} back to the bank.',
  'log.steal': '{player} won the roll and took {tile} from {target}!',
  'log.stealFail': '{player} lost the roll and pays {target} the fee for {tile}.',
  'log.swap': "{player}'s {tile} and {target}'s {other} were swapped.",
  'log.swapFree': '{player} gave up {tile} and took the ownerless {other}.',
  'log.claim': '{player} paid {target} {amount}.',
  'log.spectrumFail': '{player} rolled less than {n} and gets no base.',
  'log.zodiac': '{player} moves to {tile}.',
  'log.party': '{player} sends {target} to Mars.',
  'log.roundtrip': '{player} goes once around space.',
  'log.bonusRoll': '{player} rolls the dice once more.',
  'log.mobius': '{player} and {target} each move {n} tiles ahead.',
  'log.kepler': '{player} moves {n} tiles ahead for the stars owned.',
  'log.pascalWin': '{player} won the roll and collects the fee for {tile} from {target}.',
  'log.pascalLose': '{player} did not win the roll and pays {target}.',
  'log.contest': '{player} was picked by the dice.',
  'log.noEffect': 'The [{coupon}] card drawn by {player} had no effect, because its conditions were not met.',
  'playerinfo.cards': 'Cards held',
  'real.moon': 'It lies about 384,000 km from Earth on average. Apollo 11 put the first people on it in 1969, and only 12 people have ever walked on its surface. With no air to disturb them, their footprints are still there, so if you buy this land you will not need to clean it.',
  'real.mars': 'It is home to Olympus Mons, the tallest volcano in the solar system. At about 22 km high it is well over twice the height of Mount Everest. A day lasts about 24 hours and 37 minutes, so the jet lag is mild if you move here. Do expect some red dust.',
  'real.jupiter': 'The largest planet in the solar system; about 1,300 Earths would fit inside it. Its giant storm, the Great Red Spot, has been watched for more than 150 years. It spins so fast that a day lasts less than 10 hours, so payday comes around in no time.',
  'real.saturn': 'Famous for its beautiful rings, which are made mostly of chunks of ice. Its average density is lower than that of water, so the old joke says it would float if you had a big enough bathtub. Finding the bathtub is the owner\'s job.',
  'real.uranus': 'Its axis is tilted by about 98 degrees, so it rolls around the Sun lying on its side. William Herschel found it in 1781, the first planet discovered with a telescope. One trip around the Sun takes 84 years, so one birthday party per lifetime is plenty here.',
  'real.neptune': 'Discovered in 1846, it is famous for having been located by calculation before anyone saw it. It has the fastest winds in the solar system, reaching around 2,000 km/h. An umbrella will not help.',
  'real.vega': 'The brightest star in Lyra, about 25 light-years from Earth, and the fifth-brightest star in the night sky. In about 12,000 years it will take over as the North Star, so buying early counts as a long-term investment.',
  'real.altair': 'The brightest star in Aquila, about 17 light-years from Earth. It spins very fast, once in about 9 hours, which makes it bulge at the equator. It seems to be in a hurry to meet Vega on the seventh night of the seventh month.',
  'real.aries': 'The first constellation of the zodiac. Its brightest star is Hamal, and it comes from the ram with the Golden Fleece in Greek myth. About 2,000 years ago the spring equinox point lay here, which put it at the head of the star calendar. It still likes to stand first in line.',
  'real.taurus': 'It holds Aldebaran, glowing like a red eye, and the Pleiades cluster, visible to the naked eye. The Crab Nebula, the remains of a supernova seen in 1054, is here too. With so much to see, tourism income looks promising.',
  'real.gemini': 'Two bright stars named after the twin brothers Castor and Pollux sit side by side. Every year in mid-December the Geminid meteor shower pours down. Even if two visitors arrive together, the fee is collected only once.',
  'real.cancer': 'The faintest constellation of the zodiac. In its middle, however, lies the Beehive Cluster (Praesepe), a hazy patch visible to the naked eye on a clear night. Being hard to spot makes it a quiet place to live.',
  'real.leo': 'It holds the bright star Regulus, the heart of the lion. Its head looks like a backwards question mark and is nicknamed the Sickle. The Leonid meteor shower visits every November, so the guests arrive from the sky.',
  'real.virgo': 'The largest constellation of the zodiac and the second largest of all 88 constellations. Its brightest star is Spica. The Virgo Cluster, with more than a thousand galaxies, lies in this direction too, so no wonder the land is expensive.',
  'real.libra': 'The only constellation of the zodiac that shows an object, a pair of scales, rather than a living thing. Long ago it was seen as the claws of Scorpius. It promises fair dealing but gives no discount on the fee.',
  'real.scorpius': 'The red supergiant Antares sits at the scorpion\'s heart. The name Antares means rival of Mars, because it looks just as red as Mars. Mind the tail as you pass.',
  'real.sagittarius': 'The centre of our galaxy lies in the direction of this constellation. Its bright stars form the shape of a teapot, which gives it the nickname the Teapot. As downtown land in the Milky Way, it has the best view.',
  'real.capricornus': 'A sea goat: the front half of a goat with the tail of a fish. It is the second-faintest constellation of the zodiac, after Cancer. The Tropic of Capricorn takes its name from this constellation, so it certainly earns its keep in fame.',
  'real.aquarius': 'A figure pouring water from a jar. The Helix Nebula, one of the closest planetary nebulae to Earth, is found here. Its neighbours include Pisces and Cetus, other watery constellations, so there is no need to worry about the water bill.',
  'real.pisces': 'Two fish joined by a cord. The spring equinox point now lies in this constellation; it is where the Sun crosses the celestial equator each spring. Two fish guard this land, so please refrain from fishing.',
  'real.ursamajor': 'The Big Dipper is part of this constellation. Extend the line through the two stars at the end of the bowl about five times and you reach the North Star. It is the third largest of the 88 constellations. You will not get lost on this land.',
  'real.andromeda': 'It holds the Andromeda Galaxy, one of the most distant objects visible to the naked eye. It is about 2.5 million light-years away and is expected to meet our own galaxy in a few billion years. Just wait patiently for the new neighbours.',
  'real.orion': 'Easy to find by the three stars in a row that form Orion\'s Belt. Red Betelgeuse and blue Rigel face each other diagonally, and below the belt lies the Orion Nebula, where stars are being born. It is the top attraction of the winter night sky.',
  'real.cygnus': 'Its bright stars form a cross, so it is also called the Northern Cross. Deneb, the star at the tail, forms the Summer Triangle with Vega and Altair. Cygnus X-1, the first widely accepted black hole candidate, is here as well, so watch your step.',
  'real.mercury': 'The planet closest to the Sun, circling it in just 88 days, and the smallest planet in the solar system. With almost no atmosphere, it goes above 400°C by day and below -170°C by night. Be ready for the heating and cooling bills.',
  'real.venus': 'A day here is longer than a year: it takes 243 days to spin once and 225 days to go around the Sun. It also spins the opposite way to most planets, so the Sun rises in the west. Its thick carbon dioxide atmosphere makes it the hottest planet in the solar system.',
  'real.timemachine': 'It does not exist yet. The term became popular through the title of the 1895 novel by H. G. Wells. Still, experiments have confirmed that time runs slower when you move fast, so astronauts have in fact travelled a tiny bit into the future.',
  'mcp.space.rules': "[Space Tour Course (Purple League, Black League)]\n- The board and the cards differ from the World Tour Course. Lands are stars (planets and constellations) and a special facility (the Time Machine), and the salary is {salary}. Turns, doubles, buying, selling ({sell}%) and bankruptcy work the same way.\n- Star : after buying it you may build one base when you land on it again. The fee differs with and without a base. Nothing can be built on the special facility.\n- Base expansion : when you land again on your own star that has a base, you may expand the base. Each star allows {annexLimit} expansions, only one per landing. It costs {annexCost} on every star and each expansion raises that star's fee by {annexFee}; the last one (number {annexLimit}) adds {annexBonus} more. An expanded base still counts as one base, and giving back a base removes its expansions too.\n- Earth (Start) : you receive a salary whenever you pass or stop here. If you stop here instead of passing, apart from the salary you may choose one of your stars and either build a base on it (if it has none) or expand its base once. (Only one of the two. You pay the building or expansion cost. It is optional.)\n- Altair and Vega cannot be owned by the same player. When both have owners, the two owners move to Earth at once, receive a salary, and may each choose one of their stars and either build a base on it or expand its base once. (They pay the building or expansion cost.)\n- Telepathy Card and Neuron Valley Card tiles : draw a card and do what it says. The Telepathy cards \"Angel's Light\" and \"Black Hole Escape Pod\" can be kept for later.\n- Angel's Light : skips one fee (the time travel fee included), or frees you from the Black Hole at once, or waives one harmful card effect that says it can be waived.\n- Time Travel : you board. If another player owns the Time Machine, you pay a fee ({time}). On your next turn you roll two dice: on 4 or more you move to any tile (no salary for passing Earth, but you receive it if you land on Earth); on 3 or less you move 5 tiles ahead. If you boarded with the Time Travel Invitation item, on your next turn you move straight to any tile without rolling.\n- Black Hole : you are stuck. Doubles free you and you move by that roll; otherwise you rest for 2 turns and are released on the 3rd. If the roll on that turn totals 3 or less, you choose one of your lands and give it back to the bank (for no money) before moving, and doubles have no effect on that turn. An Escape Pod or Angel's Light frees you at once and spares you the land.\n- Space Rescue Base : if a fund has piled up you take it all; if not, you pay {rescue}. (If short, pay what you have.)\n- Halley's Comet : you move to the Telepathy Card tile next to Mars and draw a card. (No salary.)\n- Some cards use dice rolls to pick an opponent, or swap, take or return stars. A swap that would give Altair and Vega to one player is cancelled.",
  'mcp.space.guide': "[Screens of the Space Tour Course]\n- In the lobby the leagues are grouped by course. The Purple and Black leagues use the Space Tour Course.\n- On the turn after boarding Time Travel, press \"Roll Dice\" first. On 4 or more, click a tile on the board and press \"Travel Here\" (game.travel). The Moravec's Navigation card picks a tile the same way. Main Menu and Forfeit cannot be pressed at that moment.\n- On the turn after boarding with the Time Travel Invitation item, no dice are rolled. A spaceship is shown in place of the dice, and you click a tile on the board and press \"Travel Here\" (game.travel) right away. Main Menu and Forfeit can be pressed at that moment.\n- When a card needs you to choose a star, a player or the number of dice, a window with the choices appears. (dialog.answer)\n- When you land on your own star that already has a base, a window asks whether to expand it instead of the building window. (dialog.answer with the value annex expands, skip does not.) When you stop on Earth, a window lets you choose a star to build a base on or to expand. (It does not appear when there is no star you can build on. The value of each choice is the tile number; a star without a base gets a base, a star with a base gets one expansion.)\n- When Angel's Light or an Escape Pod can be used, a window asks whether to use it, with separate choices for the Telepathy card and for the item. It may also appear during another player's turn, when you are about to take a loss.\n- Telepathy and Neuron Valley cards also stay on screen for 6 seconds; press \"Close\" (coupon.close) to dismiss them at once.",
  'mcp.rules': '[How to play Hellmarble]\n- A turn-based board game for 2 to 4 players: one human and 1 to 3 AI players.\n- Everyone starts on Start with the same cash. (It depends on the league; see [Leagues] below.) You win when every other player is bankrupt, and you lose at once if you go bankrupt.\n- At the beginning everyone rolls two dice; turns go from the highest total. (Ties go to the lower player number.)\n- On your turn, roll two dice and move forward by the total. You receive a salary ({salary}) whenever you pass or stop on Start.\n- On doubles you roll again after the tile you landed on is resolved, and keep going while doubles continue. The turn ends, however, if you get stuck on the island or board the space shuttle.\n- If you land on an unowned land (city, Korean city or special facility) and have enough cash, you may buy it.\n- When you land on your own city again, you may build one building: villas (up to 2), a building (1) or a hotel (1). Nothing can be built on Korean cities or special facilities.\n- If you land on a land owned by another player, you pay its toll plus the fees of its buildings. A free pass, if you hold one, lets you skip the payment.\n- If you are short of cash, you must sell your lands to the bank ({sell}% of the purchase and building prices). If that is still not enough, you go bankrupt.\n- Secret Coupon : draw a coupon and do what it says. Free passes and radios can be kept for later.\n- Space Travel : you board and move to any tile on your next turn. If another player owns the Columbia, you pay a fee ({space}).\n- Desert Island : you are stuck. Doubles free you and you move by that roll (those doubles do not give another roll); otherwise you rest for 2 turns and move on the 3rd. A radio frees you at once.\n- Welfare Fund Desk : pay {welfare}. (If short, pay what you have; you do not go bankrupt.) Welfare Fund HQ : take all the money piled up.\n- There are two courses: the World Tour Course (White, Green, Orange and Red leagues) and the Space Tour Course (Purple and Black leagues). The tiles and Secret Coupons above belong to the World Tour Course; the Space Tour Course is described separately below. The multiplier applies to every amount in the game. (See [Leagues] for each league\'s entry fee and multiplier.)\n- If you win, your in-game cash plus the full value of your lands and buildings is added to your lobby money. If you lose, the entry fee is gone.',
  'mcp.guide': '[How to use the screens]\n- Main menu : New Game (choose a save slot → enter a name → lobby), Load, Settings.\n  In New Game, clicking a slot with data offers Overwrite / Load / Cancel. Load opens that slot without overwriting it.\n- Load : clicking a slot with data offers Load / Copy JSON / Delete / Cancel; clicking an empty slot offers Import JSON / Cancel. "Copy JSON" copies that slot\'s save data to the clipboard.\n- Lobby : choose a league to join. (You are asked to confirm.) "Export JSON" copies the save data to the clipboard.\n- Game : on your turn choose "Roll Dice", "Items", "Main Menu" (saves and leaves), or "Forfeit". Buying, building, selling and coupon use are chosen in the window that appears.\n  Click a tile to see its land info and click again to close it. Click a player to see their assets and lands.\n  On a space travel turn, click a tile and then press "Travel Here".\n  A secret coupon stays on screen for 6 seconds; press "Close" (coupon.close) to dismiss it at once.\n  Controls are unavailable during dice, movement, money transfer, and defeat animations; call hellmarble_wait until the next input is needed. Money visibly moves between players and also to or from the bank (shown at Start) and Welfare Fund HQ. When someone is defeated (bankruptcy or giving up), their token explodes and is blown off the board before the game goes on.\n- Settings : choose the language (한국어 / English) and dark mode.\n\n[How to use the WebMCP tools]\n1. Call hellmarble_get_state to see the current screen and the list of actions you can press now.\n2. Call hellmarble_act with the action and value taken from that list. While a dialog is open, only the actions inside it can be pressed.\n3. When text is needed (a name or JSON), call hellmarble_set_text first and then press the matching action.\n4. After rolling the dice or making a choice, call hellmarble_wait until the game needs your input again.\n5. Call hellmarble_get_land for the details of a tile. (index 0 = Start, up to 39 in the direction of travel)\n- All amounts are integers in Korean won.',
  'mcp.tiles': 'Show or hide the info of a tile (value : 0-39)',
  'mcp.unknown': 'That action cannot be pressed right now. Check the actions of hellmarble_get_state.',
  'mcp.noInput': 'There is no text field on the current screen.',
};

/**
 * 언어 코드별 문구 표이다.
 * @type {Object<string, Object<string, string>>}
 */
export const TEXTS = { ko: TEXT_KO, en: TEXT_EN };

/* ==========================================================================
 * 4. 공용 도구
 * ========================================================================== */

/**
 * 문구 표에서 문구를 찾아 값을 끼워 넣는다.
 * @param {string} language 언어 코드 ('ko' 또는 'en')
 * @param {string} key 문구 키
 * @param {Object} [params] 문구의 {이름} 자리에 넣을 값
 * @returns {string} 완성된 문구 (찾지 못하면 키를 그대로 돌려준다.)
 */
export function translate(language, key, params) {
  let table = TEXTS[language] || TEXTS.ko;
  let text = table[key] === undefined ? TEXTS.ko[key] : table[key];
  if (text === undefined) return key;
  // 넘겨받은 값을 하나씩 문구의 자리에 끼워 넣는다.
  for (let name in params || {}) text = text.split('{' + name + '}').join(String(params[name]));
  return text;
}

/**
 * 금액(원)을 언어에 맞는 문자열로 바꾼다. (예: 12000 → "1만 2천원" 또는 "₩12,000") 한국어는 조, 억, 만 단위로 끊어 쓴다.
 * @param {number} value 금액 (원)
 * @param {string} language 언어 코드
 * @returns {string} 금액 문자열
 */
export function formatMoney(value, language) {
  let amount = Math.round(value);
  let sign = amount < 0 ? '-' : '';
  let rest = Math.abs(amount);
  if (language === 'en') return sign + '₩' + rest.toLocaleString('en-US');
  let parts = [];
  let jo = Math.floor(rest / 1000000000000);
  let eok = Math.floor((rest % 1000000000000) / 100000000);
  let man = Math.floor((rest % 100000000) / 10000);
  let low = rest % 10000;
  if (jo > 0) parts.push(jo.toLocaleString('ko-KR') + '조');
  if (eok > 0) parts.push(eok.toLocaleString('ko-KR') + '억');
  if (man > 0) parts.push(man.toLocaleString('ko-KR') + '만');
  if (low > 0) parts.push(low % 1000 === 0 ? (low / 1000) + '천' : low.toLocaleString('ko-KR'));
  if (parts.length === 0) parts.push('0');
  return sign + parts.join(' ') + '원';
}

/**
 * 보드의 좁은 칸에 쓸 수 있도록 금액을 짧게 줄여 쓴다. (예: 12000 → "1.2만")
 * @param {number} value 금액 (원)
 * @param {string} language 언어 코드
 * @returns {string} 짧은 금액 문자열
 */
export function formatCompact(value, language) {
  let units = language === 'en' ? [[1000000000000, 'T'], [1000000000, 'B'], [1000000, 'M'], [1000, 'K']] : [[1000000000000, '조'], [100000000, '억'], [10000, '만'], [1000, '천']];
  // 큰 단위부터 살펴 처음으로 맞는 단위로 줄여 쓴다.
  for (let unit of units) {
    if (value >= unit[0]) return (language === 'en' ? '₩' : '') + (Math.round((value / unit[0]) * 10) / 10) + unit[1];
  }
  return (language === 'en' ? '₩' : '') + value;
}

/**
 * 지정한 시간만큼 기다린다. 시간이 0 이하이면 바로 이행한다.
 * @param {number} ms 기다릴 시간 (밀리초)
 * @returns {Promise<void>} 시간이 지나면 이행되는 약속
 */
export function wait(ms) {
  /**
   * 타이머가 끝나면 약속을 이행하도록 예약한다.
   * @param {Function} resolve 약속 이행 함수
   */
  function executor(resolve) {
    setTimeout(resolve, ms);
  }
  return ms > 0 ? new Promise(executor) : Promise.resolve();
}

/**
 * 바깥에서 나중에 이행할 수 있는 약속 묶음을 만든다.
 * @returns {{promise: Promise, resolve: Function}} 약속과 이행 함수
 */
function defer() {
  let handle = { promise: null, resolve: null };
  /**
   * 약속의 이행 함수를 묶음에 보관한다.
   * @param {Function} resolve 약속 이행 함수
   */
  function executor(resolve) {
    handle.resolve = resolve;
  }
  handle.promise = new Promise(executor);
  return handle;
}

/**
 * DOM 요소를 만든다.
 * @param {string} tag 태그 이름
 * @param {Object} [props] 속성 묶음 { class, text, data, style, attrs }
 * @param {Array<Node|string|null>} [children] 자식 노드 목록 (null 은 건너뛴다.)
 * @returns {HTMLElement} 만들어진 요소
 */
function el(tag, props, children) {
  let node = document.createElement(tag);
  let options = props || {};
  if (options.class) node.className = options.class;
  if (options.text !== undefined) node.textContent = String(options.text);
  // 데이터 속성을 하나씩 지정한다.
  for (let key in options.data || {}) node.dataset[key] = String(options.data[key]);
  // 인라인 스타일을 하나씩 지정한다.
  for (let key in options.style || {}) node.style.setProperty(key, String(options.style[key]));
  // 일반 속성을 하나씩 지정한다.
  for (let key in options.attrs || {}) node.setAttribute(key, String(options.attrs[key]));
  // 자식 노드를 순서대로 붙인다.
  for (let child of children || []) {
    if (child !== null && child !== undefined && child !== false) node.append(child);
  }
  return node;
}

/**
 * 클릭 시 동작 이름이 전달되는 버튼을 만든다.
 * @param {string} label 버튼에 보일 글자
 * @param {string} action 동작 이름
 * @param {string|number} [value] 동작에 함께 전달할 값
 * @param {string} [className] 추가할 클래스 이름
 * @returns {HTMLButtonElement} 만들어진 버튼
 */
function button(label, action, value, className) {
  let data = { action };
  if (value !== undefined) data.value = value;
  return el('button', { class: 'hm-button' + (className ? ' ' + className : ''), text: label, data, attrs: { type: 'button' } });
}

/**
 * '#rrggbb' 형식의 색을 투명도가 있는 rgba() 문자열로 바꾼다.
 * @param {string} hex '#rrggbb' 형식의 색
 * @param {number} alpha 불투명도 (0~1)
 * @returns {string} rgba() 색 문자열
 */
function tint(hex, alpha) {
  let value = parseInt(hex.slice(1), 16);
  return 'rgba(' + ((value >> 16) & 255) + ', ' + ((value >> 8) & 255) + ', ' + (value & 255) + ', ' + alpha + ')';
}

/**
 * 요소에 플레이어의 색, 그 위에 그리는 문양의 글자색, 칠하는 배경을 CSS 변수로 지정한다.
 * @param {HTMLElement} node 대상 요소
 * @param {string} name 변수 이름의 가운데 부분 ('player' 이면 --hm-player, --hm-player-ink, --hm-player-fill)
 * @param {{color: string, ink: string, fill: string}} style 그릴 값
 */
function paint(node, name, style) {
  node.style.setProperty('--hm-' + name, style.color);
  node.style.setProperty('--hm-' + name + '-ink', style.ink);
  node.style.setProperty('--hm-' + name + '-fill', style.fill);
}

/**
 * 칸 번호를 보드 격자(11x11)의 위치로 바꾼다.
 * 출발지는 오른쪽 아래 모서리이며, 시계 방향(아래 → 왼쪽 → 위 → 오른쪽)으로 진행한다.
 * @param {number} index 칸 번호
 * @returns {{row: number, column: number, side: string}} 격자의 행, 열과 칸이 놓인 면
 */
export function placeTile(index) {
  if (index <= 10) return { row: 11, column: 11 - index, side: index % 10 === 0 ? 'corner' : 'bottom' };
  if (index < 20) return { row: 21 - index, column: 1, side: 'left' };
  if (index <= 30) return { row: 1, column: index - 19, side: index % 10 === 0 ? 'corner' : 'top' };
  return { row: index - 29, column: 11, side: 'right' };
}

/**
 * 브라우저에 설정된 시스템 언어 중에서 게임이 지원하는 언어를 탐지한다.
 * 선호하는 순서대로 살펴 처음으로 지원하는 언어를 고르며, 지원하는 언어가 하나도 없으면 영어를 고른다.
 * 언어 정보를 제공하지 않는 브라우저이거나 탐지 중 오류가 나면 건너뛴다.
 * @returns {string|null} 언어 코드 ('ko' 또는 'en'). 탐지할 수 없으면 null
 */
export function detectLanguage() {
  try {
    let source = globalThis.navigator;
    let tags = source.languages && source.languages.length > 0 ? source.languages : [source.language || source.userLanguage];
    let found = false;
    // 브라우저가 알려준 언어를 선호하는 순서대로 살펴본다.
    for (let tag of tags) {
      if (typeof tag !== 'string' || tag === '') continue;
      let code = tag.toLowerCase().split('-')[0];
      if (Object.keys(TEXTS).includes(code)) return code;
      found = true;
    }
    return found ? 'en' : null;
  } catch (error) {
    return null;
  }
}

/**
 * 시스템이 어두운 화면(다크 모드)을 쓰도록 설정되어 있는지 탐지한다.
 * 이 기능을 지원하지 않는 브라우저이거나 탐지 중 오류가 나면 건너뛴다.
 * @returns {boolean|null} 다크 모드 여부. 탐지할 수 없으면 null
 */
export function detectDark() {
  try {
    return Boolean(globalThis.matchMedia('(prefers-color-scheme: dark)').matches);
  } catch (error) {
    return null;
  }
}

/**
 * 실패해도 넘어가면 되는 비동기 작업의 오류를 받아 아무 일도 하지 않는다.
 */
function ignore() {}

/**
 * 글을 클립보드에 복사한다. 클립보드 기능을 쓸 수 없으면 예전 방식(글을 선택한 뒤 복사 명령)을 시도한다.
 * @param {string} text 복사할 글
 * @returns {Promise<boolean>} 복사에 성공했으면 true
 */
export async function copyText(text) {
  try {
    await globalThis.navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // 아래의 예전 방식으로 다시 시도한다.
  }
  try {
    let area = el('textarea', { attrs: { readonly: '' }, style: { position: 'fixed', opacity: '0' } });
    area.value = text;
    document.body.append(area);
    area.select();
    let copied = document.execCommand('copy');
    area.remove();
    return Boolean(copied);
  } catch (error) {
    return false;
  }
}

/* ==========================================================================
 * 4-1. 저장 데이터 해석과 검사
 * ========================================================================== */

/**
 * JSON 텍스트에서 주석을 지운다.
 * JSON5 처럼 한 줄 주석(//)과 여러 줄 주석을 허용하며, 문자열 안의 내용은 건드리지 않는다.
 * @param {string} text 주석이 섞여 있을 수 있는 JSON 텍스트
 * @returns {string} 주석을 지운 JSON 텍스트
 */
export function stripJsonComments(text) {
  let result = '';
  let index = 0;
  let quoted = false;
  // 글자를 하나씩 살펴 문자열 밖에 있는 주석만 건너뛴다.
  while (index < text.length) {
    let char = text[index];
    let next = text[index + 1];
    if (quoted && char === '\\') {
      result += char + (next === undefined ? '' : next);
      index += 2;
    } else if (quoted) {
      quoted = char !== '"';
      result += char;
      index++;
    } else if (char === '/' && next === '/') {
      let end = text.indexOf('\n', index);
      index = end < 0 ? text.length : end;
    } else if (char === '/' && next === '*') {
      let end = text.indexOf('*/', index + 2);
      index = end < 0 ? text.length : end + 2;
      result += ' ';
    } else {
      quoted = char === '"';
      result += char;
      index++;
    }
  }
  return result;
}

/**
 * 주석이 섞여 있을 수 있는 JSON 텍스트를 해석한다.
 * @param {string} text JSON 텍스트
 * @returns {*} 해석한 값 (형식이 잘못되면 오류를 던진다.)
 */
export function parseJson(text) {
  return JSON.parse(stripJsonComments(String(text)));
}

/**
 * 값이 0 이상 max 이하의 정수인지 확인한다.
 * @param {*} value 확인할 값
 * @param {number} max 허용하는 최댓값
 * @returns {boolean} 범위 안의 정수이면 true
 */
function isCount(value, max) {
  return Number.isInteger(value) && value >= 0 && value <= max;
}

/**
 * 모든 아이템의 수량이 0인 아이템 주머니를 만든다.
 * @returns {Object<string, number>} 빈 아이템 주머니
 */
function emptyItems() {
  let bag = {};
  // 아이템 종류마다 수량 0을 넣는다.
  for (let id in ITEMS) bag[id] = 0;
  return bag;
}

/**
 * 게임 한 판의 아이템 사용 기록을 만든다. 사용 제한 묶음마다 아직 한 번도 쓰지 않은 상태로 시작한다.
 * @returns {Object<string, number>} 사용 제한 묶음별 사용 횟수
 */
function freshUsage() {
  let used = {};
  // 아이템마다 그 아이템이 속한 사용 제한 묶음의 사용 횟수를 0 으로 넣는다.
  for (let id in ITEMS) used[ITEMS[id].limit] = 0;
  return used;
}

/**
 * 사용 제한 묶음의 아이템을 게임 한 판에 몇 번까지 쓸 수 있는지 구한다.
 * @param {string} limit 사용 제한 묶음의 이름
 * @returns {number} 게임 한 판에 쓸 수 있는 횟수 (모르는 묶음이면 0)
 */
export function limitUses(limit) {
  let ids = itemsOfLimit(limit);
  return ids.length > 0 ? ITEMS[ids[0]].uses || 1 : 0;
}

/**
 * 아이템을 그 리그의 게임에서 쓸 수 있는지 확인한다. 소모형 아이템을 쓸 수 없는 리그이거나, 다른 코스에서만 쓰는 아이템이면 쓸 수 없다.
 * @param {string} id 아이템 식별자
 * @param {string} league 리그 식별자
 * @returns {boolean} 쓸 수 있으면 true
 */
export function itemFits(id, league) {
  let config = LEAGUES[league];
  return Boolean(config) && config.items && Object.hasOwn(ITEMS, id) && (!ITEMS[id].course || ITEMS[id].course === config.course);
}

/**
 * 대기실의 아이템 주머니를 그 리그의 게임에 가져갈 것과 대기실에 남겨 둘 것으로 나눈다.
 * 그 리그에서 쓸 수 있는 아이템만 가져가고, 쓸 수 없는 아이템은 대기실에 그대로 둔다.
 * @param {*} items 대기실의 아이템 주머니
 * @param {string} league 리그 식별자
 * @returns {{taken: Object<string, number>, left: Object<string, number>}} 게임에 가져갈 주머니와 대기실에 남길 주머니
 */
export function splitItems(items, league) {
  let bag = fillItems(items) || emptyItems();
  let taken = emptyItems();
  let left = emptyItems();
  // 아이템마다 그 리그에서 쓸 수 있으면 가져갈 주머니에, 아니면 남길 주머니에 담는다.
  for (let id in bag) {
    if (itemFits(id, league)) taken[id] = bag[id];
    else left[id] = bag[id];
  }
  return { taken, left };
}

/**
 * 저장된 아이템 주머니를 지금의 아이템 구성에 맞춘다. 저장한 뒤에 새로 생긴 아이템은 0개로 채운다.
 * @param {*} items 저장된 아이템 주머니 (없으면 undefined)
 * @returns {Object<string, number>|null} 모든 아이템의 수량이 든 주머니. 모르는 아이템이나 올바르지 않은 수량이 있으면 null
 */
function fillItems(items) {
  let bag = emptyItems();
  if (items === undefined) return bag;
  if (!items || typeof items !== 'object' || Array.isArray(items)) return null;
  // 저장된 아이템마다 종류와 수량을 확인하고 옮겨 담는다.
  for (let id in items) {
    if (!Object.hasOwn(ITEMS, id) || !isCount(items[id], Number.MAX_SAFE_INTEGER)) return null;
    bag[id] = items[id];
  }
  return bag;
}

/**
 * 아이템 주머니 두 개를 합친다. 게임에서 쓰지 않고 남은 아이템을 대기실의 주머니로 돌려줄 때 쓴다.
 * @param {Object<string, number>} bag 원래 주머니 (바뀌지 않는다.)
 * @param {Object<string, number>} extra 더할 주머니
 * @returns {Object<string, number>} 아이템 종류마다 수량을 더한 새 주머니
 */
function addItems(bag, extra) {
  let sum = emptyItems();
  // 아이템 종류마다 두 주머니의 수량을 더한다.
  for (let id in sum) sum[id] = (bag[id] || 0) + (extra[id] || 0);
  return sum;
}

/**
 * 같은 사용 제한 묶음에 속한 아이템의 식별자 목록을 구한다.
 * @param {string} limit 사용 제한 묶음의 이름
 * @returns {string[]} 아이템 식별자 목록
 */
function itemsOfLimit(limit) {
  let list = [];
  // 모든 아이템을 살펴 같은 묶음에 속한 것을 모은다.
  for (let id in ITEMS) {
    if (ITEMS[id].limit === limit) list.push(id);
  }
  return list;
}

/**
 * 식별자가 장착형 아이템(색상 또는 모양)의 것인지 확인한다.
 * @param {*} id 확인할 식별자
 * @returns {boolean} 장착형 아이템이면 true
 */
function isEquip(id) {
  return typeof id === 'string' && Object.hasOwn(EQUIPS, id);
}

/**
 * 새 슬롯이 처음에 가지는 장착형 아이템의 보유 목록을 만든다. 가격이 없는 기본 색상과 모양만 하나씩 가진다.
 * @returns {Object<string, number>} 장착형 아이템 종류별 보유 수 (0 또는 1)
 */
function starterEquips() {
  let owned = {};
  // 장착형 아이템마다 기본 아이템이면 1, 아니면 0을 넣는다.
  for (let id in EQUIPS) owned[id] = EQUIPS[id].price === 0 ? 1 : 0;
  return owned;
}

/**
 * 저장된 장착형 아이템의 보유 목록을 지금의 구성에 맞춘다. 장착형 아이템은 종류마다 하나만 가질 수 있다.
 * 저장한 뒤에 새로 생긴 것은 갖지 않은 것으로 채우고, 사고팔 수 없는 기본 아이템은 항상 가진 것으로 한다.
 * @param {*} equips 저장된 보유 목록 (없으면 undefined)
 * @returns {Object<string, number>|null} 모든 장착형 아이템의 보유 수가 든 목록. 모르는 아이템이나 올바르지 않은 수가 있으면 null
 */
function fillEquips(equips) {
  let owned = starterEquips();
  if (equips === undefined) return owned;
  if (!equips || typeof equips !== 'object' || Array.isArray(equips)) return null;
  // 저장된 아이템마다 종류와 보유 수를 확인하고, 기본 아이템이 아닌 것만 옮겨 담는다.
  for (let id in equips) {
    if (!isEquip(id) || !isCount(equips[id], 1)) return null;
    if (EQUIPS[id].price > 0) owned[id] = equips[id];
  }
  return owned;
}

/**
 * 식별자가 부적의 것인지 확인한다.
 * @param {*} id 확인할 식별자
 * @returns {boolean} 부적이면 true
 */
function isCharm(id) {
  return typeof id === 'string' && Object.hasOwn(CHARMS, id);
}

/**
 * 식별자가 부적 추첨권의 것인지 확인한다.
 * @param {*} id 확인할 식별자
 * @returns {boolean} 부적 추첨권이면 true
 */
function isTicket(id) {
  return typeof id === 'string' && Object.hasOwn(CHARM_TICKETS, id);
}

/**
 * 저장된 부적의 보유 수량을 지금의 구성에 맞춘다. 부적은 같은 것을 여러 개 가질 수 있다.
 * 저장한 뒤에 새로 생긴 부적은 0개로 채운다.
 * @param {*} charms 저장된 보유 수량 (없으면 undefined)
 * @returns {Object<string, number>|null} 모든 부적의 수량이 든 목록. 모르는 부적이나 올바르지 않은 수량이 있으면 null
 */
function fillCharms(charms) {
  let owned = {};
  // 부적 종류마다 수량 0을 넣는다.
  for (let id in CHARMS) owned[id] = 0;
  if (charms === undefined) return owned;
  if (!charms || typeof charms !== 'object' || Array.isArray(charms)) return null;
  // 저장된 부적마다 종류와 수량을 확인하고 옮겨 담는다.
  for (let id in charms) {
    if (!isCharm(id) || !isCount(charms[id], Number.MAX_SAFE_INTEGER)) return null;
    owned[id] = charms[id];
  }
  return owned;
}

/**
 * 새 슬롯이 처음에 가지는 부적의 보유 수량을 만든다. 시작 부적(낡은 동전) 하나만 가진다.
 * 새로 만드는 슬롯에만 쓰며, 이미 저장된 슬롯의 수량은 fillCharms 가 그대로 옮긴다. (소급 적용하지 않는다.)
 * @returns {Object<string, number>} 모든 부적의 수량이 든 목록
 */
function starterCharms() {
  let owned = fillCharms(undefined);
  owned[STARTER_CHARM] = 1;
  return owned;
}

/**
 * 부적 하나를 추첨한다. 먼저 등급을 가중치에 따라 정하고, 그 등급의 부적 가운데 하나를 같은 확률로 고른다.
 * 같은 부적이 거듭 나올 수 있으며, 여러 개를 뽑을 때에는 이 함수를 그만큼 따로 부른다. (독립 시행)
 * @param {Function} random 0 이상 1 미만의 난수를 돌려주는 함수
 * @returns {string} 뽑힌 부적의 식별자
 */
export function drawCharm(random) {
  let total = 0;
  let picked = '';
  let pool = [];
  // 등급 가중치의 합을 구한다.
  for (let grade in CHARM_GRADES) total += CHARM_GRADES[grade].weight;
  let point = random() * total;
  // 누적 가중치가 난수를 넘어서는 첫 등급을 고른다.
  for (let grade in CHARM_GRADES) {
    picked = grade;
    point -= CHARM_GRADES[grade].weight;
    if (point < 0) break;
  }
  // 그 등급의 부적을 모은다.
  for (let id in CHARMS) {
    if (CHARMS[id].grade === picked) pool.push(id);
  }
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}

/**
 * 저장된 장착 상태를 확인하여 다듬는다. 색상과 모양은 가지고 있는 아이템을 장착했거나 비어 있어야(null) 하고,
 * 부적은 가지고 있는 것 하나를 장착했거나 비어 있어야 한다.
 * @param {*} look 저장된 장착 상태 { color, shape, charm } (없으면 undefined)
 * @param {Object<string, number>} owned 색상과 모양의 보유 목록
 * @param {Object<string, number>} charms 부적의 보유 수량
 * @returns {{color: string|null, shape: string|null, charm: string|null}|null} 장착 상태. 저장된 것이 없으면 기본 장착, 올바르지 않으면 null
 */
function fillLook(look, owned, charms) {
  let result = {};
  if (look === undefined) return { ...DEFAULT_LOOK, charm: null };
  if (!look || typeof look !== 'object' || Array.isArray(look)) return null;
  // 색상과 모양 자리마다 장착한 아이템이 그 자리의 것이고 가지고 있는 것인지 확인한다.
  for (let slot in DEFAULT_LOOK) {
    let id = look[slot] === undefined ? null : look[slot];
    if (id !== null && !(isEquip(id) && EQUIPS[id].slot === slot && owned[id] > 0)) return null;
    result[slot] = id;
  }
  result.charm = look.charm === undefined ? null : look.charm;
  if (result.charm !== null && !(isCharm(result.charm) && charms[result.charm] > 0)) return null;
  return result;
}

/**
 * 플레이어의 생김새(색상과 모양)가 게임에 쓸 수 있는 올바른 것인지 확인한다. 색상과 모양이 모두 정해져 있어야 한다.
 * @param {*} look 확인할 생김새 { color, shape }
 * @returns {boolean} 올바르면 true
 */
function isValidLook(look) {
  if (!look || typeof look !== 'object') return false;
  // 색상과 모양 자리마다 그 자리에 맞는 장착형 아이템인지 확인한다.
  for (let slot in DEFAULT_LOOK) {
    if (!isEquip(look[slot]) || EQUIPS[look[slot]].slot !== slot) return false;
  }
  return true;
}

/**
 * 인공지능 플레이어들의 생김새를 정한다. 기본 색상과 기본 모양 가운데 사용자의 것과 겹치지 않는 것을 차례로 나눠 준다.
 * 색상은 사용자의 색과 같은 계열(예 : 파랑과 하늘색)도 피하여 서로 헷갈리지 않게 한다.
 * @param {{color: string, shape: string}} look 사용자의 생김새
 * @param {number} count 인공지능 플레이어의 수
 * @returns {Array<{color: string, shape: string}>} 인공지능 플레이어 순서대로의 생김새
 */
function rivalLooks(look, count) {
  let colors = [];
  let shapes = [];
  let looks = [];
  // 기본 아이템 가운데 사용자의 것과 겹치지 않는 색상과 모양을 모은다.
  for (let id in EQUIPS) {
    let item = EQUIPS[id];
    if (item.price > 0) continue;
    if (item.slot === 'color' && item.family !== EQUIPS[look.color].family) colors.push(id);
    if (item.slot === 'shape' && id !== look.shape) shapes.push(id);
  }
  // 인공지능 플레이어마다 모아 둔 색상과 모양을 하나씩 준다.
  for (let index = 0; index < count; index++) looks.push({ color: colors[index % colors.length], shape: shapes[index % shapes.length] });
  return looks;
}

/**
 * 생김새(장착한 색상과 모양)를 화면에 그릴 값으로 바꾼다. 장착하지 않은 자리는 회색과 빈 문자로 그린다.
 * @param {{color: string|null, shape: string|null}} look 생김새
 * @returns {{color: string, ink: string, fill: string, symbol: string}} 색, 문양의 글자색, 칠하는 배경, 문양 문자
 */
export function lookStyle(look) {
  let color = look && isEquip(look.color) ? EQUIPS[look.color] : { value: '#868e96', ink: '#ffffff' };
  let shape = look && isEquip(look.shape) ? EQUIPS[look.shape] : { value: '' };
  return { color: color.value, ink: color.ink, fill: color.fill || color.value, symbol: shape.value };
}

/**
 * 아이템 종류별 수량이 정해진 아이템 목록에 맞고 모두 안전한 정수인지 확인한다.
 * @param {*} items 확인할 아이템 주머니
 * @returns {boolean} 올바르면 true
 */
function isValidItemBag(items) {
  if (!items || typeof items !== 'object' || Array.isArray(items)) return false;
  // 모든 알려진 아이템의 수량을 검사한다.
  for (let id in ITEMS) {
    if (!isCount(items[id], Number.MAX_SAFE_INTEGER)) return false;
  }
  // 지원하지 않는 종류의 아이템이 섞였는지 확인한다.
  for (let id in items) {
    if (!Object.hasOwn(ITEMS, id)) return false;
  }
  return true;
}

/**
 * 플레이어의 아이템 수량, 게임 한 판의 사용 기록, 적용 중인 주사위 조작형 아이템이 올바른지 확인한다.
 * 아이템은 사용자만 가질 수 있으므로 인공지능 플레이어는 모두 비어 있어야 한다. 소모형 아이템을 쓸 수 없는 리그에서는 사용자도 그렇다.
 * @param {Object} player 확인할 플레이어
 * @param {boolean} bare 아이템을 가지거나 쓴 기록이 없어야 하는 플레이어인지 여부
 * @returns {boolean} 올바르면 true
 */
function isValidItemState(player, bare) {
  let used = player.usedItems;
  let loaded = player.loaded;
  if (!isValidItemBag(player.items) || !used || typeof used !== 'object') return false;
  if (loaded !== null && !(typeof loaded === 'string' && Object.hasOwn(ITEMS, loaded) && ITEMS[loaded].effect === 'dice')) return false;
  if (loaded !== null && (bare || !(used[ITEMS[loaded].limit] > 0))) return false;
  // 아이템마다 사용 횟수가 한도 안의 정수인지 확인하고, 아이템을 쓸 수 없는 플레이어가 아이템을 가졌거나 쓴 기록이 없는지 확인한다.
  for (let id in ITEMS) {
    if (!isCount(used[ITEMS[id].limit], limitUses(ITEMS[id].limit))) return false;
    if (bare && (player.items[id] !== 0 || used[ITEMS[id].limit] !== 0)) return false;
  }
  return true;
}

/**
 * 게임 진행 상태의 플레이어 목록, 턴 순서, 순서를 정한 주사위가 올바른지 확인한다.
 * 플레이어 수, 소모형 아이템, 인공지능의 부적은 그 리그의 설정에 맞아야 한다. (리그가 올바른지는 먼저 확인되어 있어야 한다.)
 * @param {Object} game 게임 진행 상태
 * @returns {boolean} 올바르면 true
 */
function isValidPlayers(game) {
  let league = LEAGUES[game.league];
  let count = game.players.length;
  let alive = 0;
  let charmed = 0;
  if (count < 2 || count > MAX_PLAYERS || game.order.length !== count || game.rolls.length !== count) return false;
  if (!(league.weights[count - 2] > 0)) return false;
  // 플레이어마다 번호, 돈, 위치, 상태 값의 형식과 범위를 확인한다.
  for (let id = 0; id < count; id++) {
    let player = game.players[id];
    let roll = game.rolls[id];
    if (!player || typeof player !== 'object' || player.id !== id || player.ai !== (id !== 0)) return false;
    if (!isCount(player.cash, Number.MAX_SAFE_INTEGER) || !isCount(player.position, BOARD_SIZE - 1) || !isCount(player.island, ISLAND_TURNS)) return false;
    if (typeof player.alive !== 'boolean' || typeof player.boarded !== 'boolean' || typeof player.direct !== 'boolean') return false;
    if (!player.coupons || typeof player.coupons !== 'object' || Array.isArray(player.coupons)) return false;
    if (!isValidItemState(player, player.ai || !league.items) || !isValidLook(player.look)) return false;
    if (player.charm !== null && !isCharm(player.charm)) return false;
    if (player.ai && player.charm !== null && !league.rivalCharms.includes(CHARMS[player.charm].grade)) return false;
    charmed += player.ai && player.charm !== null ? 1 : 0;
    if (!game.order.includes(id) || !Array.isArray(roll) || !isCount(roll[0] - 1, 5) || !isCount(roll[1] - 1, 5)) return false;
    if (id === 0 && typeof player.name !== 'string') return false;
    alive += player.alive ? 1 : 0;
  }
  let current = game.players[game.order[game.turn]];
  return charmed <= 1 && alive >= 2 && game.players[0].alive && isCount(game.turn, count - 1) && Boolean(current) && current.alive;
}

/**
 * 게임 진행 상태의 땅 소유 정보가 그 리그의 코스에 맞게 올바른지 확인한다.
 * 건물은 건물을 지을 수 있는 땅에만 있어야 한다. 주인 없는 땅에 건물이 남아 있을 수 있는지는 코스의 구성(leftover)을 따른다.
 * (세계여행 코스에서는 주인이 있는 땅에만 건물이 있고, 우주여행 코스에서는 카드의 효과로 주인 없는 별에 기지가 남아 있을 수 있다.)
 * 공통 형식을 확인한 뒤, 그 코스만의 규칙에 어긋나지 않는지는 코스의 엔진에 묻는다. (HellmarbleGame.sound : 우주여행 코스의 견우성과 직녀성)
 * @param {Object} game 게임 진행 상태
 * @returns {boolean} 올바르면 true
 */
function isValidLands(game) {
  let course = courseOf(game.league);
  if (game.lands.length !== course.board.length) return false;
  // 칸마다 소유자와 건물 개수의 형식과 범위를 확인한다.
  for (let index = 0; index < course.board.length; index++) {
    let tile = course.board[index];
    let land = game.lands[index];
    let built = 0;
    if (!PROPERTY_TYPES.includes(tile.type)) {
      if (land !== null) return false;
      continue;
    }
    if (!land || typeof land !== 'object') return false;
    if (land.owner !== null && (!isCount(land.owner, game.players.length - 1) || !game.players[land.owner].alive)) return false;
    // 건물 종류별 개수가 한도를 넘지 않는지 확인하고 지어진 건물의 수를 센다.
    for (let kind of course.buildings) {
      if (!isCount(land[kind], BUILD_LIMIT[kind])) return false;
      built += land[kind];
    }
    if (built > 0 && (!tile.cost || (land.owner === null && !course.leftover))) return false;
  }
  return engineOf(game.league).sound(game);
}

/**
 * 카드 덱 하나가 정해진 구성(덱과 보관 중인 카드를 합쳐 종류별 장수)과 같은지 확인한다.
 * @param {*} deck 덱에 든 카드의 식별자 목록
 * @param {Object<string, HellmarbleCoupon>} cards 덱의 구성
 * @param {Object<string, number>} kept 플레이어들이 보관 중인 카드의 종류별 장수
 * @returns {boolean} 올바르면 true
 */
function isValidCards(deck, cards, kept) {
  let counts = { ...kept };
  // 덱에 든 카드를 종류별로 센다.
  for (let id of deck) {
    if (!Object.hasOwn(cards, id)) return false;
    counts[id] = (counts[id] || 0) + 1;
  }
  // 종류별 장수가 정해진 구성과 같은지 확인한다.
  for (let id in cards) {
    if (counts[id] !== cards[id].count) return false;
  }
  return true;
}

/**
 * 게임 진행 상태의 카드(세계여행 코스의 비밀쿠폰, 우주여행 코스의 텔레파시 카드와 뉴런의 골짜기 카드)가 그 코스의 구성과 같은지 확인한다.
 * 플레이어는 그 코스에서 보관할 수 있는 카드만 보관할 수 있다.
 * @param {Object} game 게임 진행 상태
 * @returns {boolean} 올바르면 true
 */
function isValidDeck(game) {
  let course = courseOf(game.league);
  let kept = {};
  // 플레이어가 보관 중인 카드를 종류별로 더한다.
  for (let player of game.players) {
    // 보관한 카드마다 그 코스에서 보관할 수 있는 것인지와 장수를 확인한다.
    for (let id in player.coupons) {
      if (!course.keeps.includes(id) || !isCount(player.coupons[id], course.cards[id].count)) return false;
      kept[id] = (kept[id] || 0) + player.coupons[id];
    }
    // 보관할 수 있는 카드의 자리가 모두 있는지 확인한다.
    for (let id of course.keeps) {
      if (player.coupons[id] === undefined) return false;
    }
  }
  return isValidCards(game.deck, course.cards, kept) && isValidCards(game.valley, course.valley, {});
}

/**
 * 진행 기록 하나의 형식이 올바른지 확인한다. (화면에 그릴 때 오류가 나지 않는지)
 * @param {*} entry 진행 기록
 * @param {number} players 플레이어 수
 * @returns {boolean} 올바르면 true
 */
function isValidLog(entry, players) {
  if (!entry || typeof entry !== 'object' || typeof entry.key !== 'string' || !entry.params || typeof entry.params !== 'object') return false;
  // 기록에 담긴 값마다 종류에 맞는 형식인지 확인한다.
  for (let name in entry.params) {
    let value = entry.params[name];
    if ((name === 'player' || name === 'target') && !isCount(value, players - 1)) return false;
    if ((name === 'tile' || name === 'other') && !isCount(value, BOARD_SIZE - 1)) return false;
    if (name !== 'order' && value !== null && typeof value === 'object') return false;
    if (name !== 'order') continue;
    if (!Array.isArray(value)) return false;
    // 턴 순서에 담긴 플레이어 번호가 모두 올바른지 확인한다.
    for (let id of value) {
      if (!isCount(id, players - 1)) return false;
    }
  }
  return true;
}

/**
 * 게임 진행 상태가 이어서 진행할 수 있는 올바른 형식인지 확인한다.
 * @param {*} game 게임 진행 상태
 * @returns {boolean} 올바르면 true
 */
export function isValidGame(game) {
  if (!game || typeof game !== 'object' || game.version !== SAVE_VERSION || game.finished !== false) return false;
  // 목록이어야 하는 항목이 모두 배열인지 확인한다.
  for (let key of ['players', 'order', 'rolls', 'lands', 'deck', 'valley', 'dice', 'logs']) {
    if (!Array.isArray(game[key])) return false;
  }
  let league = Object.keys(LEAGUES).includes(game.league) ? LEAGUES[game.league] : null;
  if (!league || game.multiplier !== league.multiplier || !isCount(game.seed, 4294967295)) return false;
  if (!isCount(game.fund, Number.MAX_SAFE_INTEGER) || !isCount(game.turns, Number.MAX_SAFE_INTEGER)) return false;
  if (!isCount(game.dice[0] - 1, 5) || !isCount(game.dice[1] - 1, 5)) return false;
  return isValidPlayers(game) && isValidLands(game) && isValidDeck(game);
}

/**
 * 버전 5 의 저장 데이터를 버전 6 의 모양으로 바꾼다. 버전 5 는 슬롯 데이터에 버전을 적기 전의 마지막 형식이다.
 * 버전 6 에서는 우주여행 코스가 생겨 진행 상태에 뉴런의 골짜기 카드 덱(valley)이 더해졌고, 아이템의 사용 기록이 사용 여부(true / false)에서 사용 횟수로 바뀌었으며,
 * 새 아이템(천사의 빛, 블랙홀 탈출포트)의 자리가 플레이어의 아이템 주머니와 사용 기록에 더해졌다.
 * 버전 5 의 게임은 모두 세계여행 코스의 것이므로 덱과 땅, 보관 쿠폰은 그대로 쓴다. 진행 중인 게임이 버전 5 가 아니면 손대지 않는다. (나중의 검사에서 걸러진다.)
 * @param {Object} data 버전 5 의 저장 데이터 (직접 고친다.)
 * @returns {Object} 버전 6 의 저장 데이터
 */
function upgradeFrom5(data) {
  let game = data.game;
  if (!game || typeof game !== 'object' || game.version !== 5 || !Array.isArray(game.players)) return data;
  game.version = 6;
  if (game.valley === undefined) game.valley = [];
  // 플레이어마다 아이템의 사용 기록을 횟수로 바꾸고 새 아이템의 자리를 더한다.
  for (let player of game.players) {
    if (!player || typeof player !== 'object') continue;
    let used = player.usedItems && typeof player.usedItems === 'object' ? player.usedItems : {};
    let usage = { angel: 0, escape: 0 };
    // 사용 제한 묶음마다 사용 여부를 사용 횟수(쓴 적이 있으면 1, 없으면 0)로 바꾼다.
    for (let limit in used) usage[limit] = used[limit] === true ? 1 : used[limit] === false ? 0 : used[limit];
    player.usedItems = usage;
    if (!player.items || typeof player.items !== 'object' || Array.isArray(player.items)) continue;
    // 버전 6 에서 생긴 아이템을 0개로 채운다.
    for (let id of ['angel', 'escape']) {
      if (player.items[id] === undefined) player.items[id] = 0;
    }
  }
  return data;
}

/**
 * 버전 6 의 저장 데이터를 버전 7 의 모양으로 바꾼다.
 * 버전 7 에서는 우주여행 코스의 기지를 증축할 수 있게 되어, 그 코스의 땅 소유 정보에 증축 횟수(annex)가 더해졌다.
 * 버전 6 의 게임에는 증축이 없었으므로 0 으로 채운다. 세계여행 코스의 게임은 땅의 모양이 그대로여서 버전 표기만 올린다.
 * 진행 중인 게임이 버전 6 이 아니면 손대지 않는다. (나중의 검사에서 걸러진다.)
 * @param {Object} data 버전 6 의 저장 데이터 (직접 고친다.)
 * @returns {Object} 버전 7 의 저장 데이터
 */
function upgradeFrom6(data) {
  let game = data.game;
  if (!game || typeof game !== 'object' || game.version !== 6 || !Array.isArray(game.lands)) return data;
  game.version = 7;
  let kinds = Object.keys(LEAGUES).includes(game.league) ? courseOf(game.league).buildings : [];
  // 구매할 수 있는 칸마다, 그 코스의 건물 종류 가운데 자리가 없는 것(버전 7 에서 생긴 증축)을 0 으로 채운다.
  for (let land of game.lands) {
    if (!land || typeof land !== 'object') continue;
    // 건물 종류별로 자리가 있는지 확인한다.
    for (let kind of kinds) {
      if (land[kind] === undefined) land[kind] = 0;
    }
  }
  return data;
}

/**
 * 버전 7 의 저장 데이터를 버전 8 의 모양으로 바꾼다. 버전 8 에서는 세 가지가 더해졌다.
 * 아이템 시간여행 초청장이 생겨 플레이어의 아이템 주머니와 사용 기록에 그 자리(timeinvite)가 더해졌고,
 * 그 아이템으로 탑승하면 다음 차례에 주사위 없이 목적지를 고르므로 플레이어에 그 표시(direct)가 더해졌으며,
 * 우주여행 코스의 텔레파시 카드에 역추진 3장이 더해졌다. 진행 중이던 우주여행 코스의 게임에는 역추진을 덱에 고르게 끼워 넣는다.
 * (난수를 쓰지 않고 덱을 같은 간격으로 나눈 자리에 넣는다. 뽑힐 차례였던 카드들의 순서는 그대로이다.)
 * 진행 중인 게임이 버전 7 이 아니면 손대지 않는다. (나중의 검사에서 걸러진다.)
 * @param {Object} data 버전 7 의 저장 데이터 (직접 고친다.)
 * @returns {Object} 버전 8 의 저장 데이터
 */
function upgradeFrom7(data) {
  let game = data.game;
  if (!game || typeof game !== 'object' || game.version !== 7 || !Array.isArray(game.players)) return data;
  game.version = 8;
  // 플레이어마다 새 표시와 새 아이템의 자리를 더한다.
  for (let player of game.players) {
    if (!player || typeof player !== 'object') continue;
    if (player.direct === undefined) player.direct = false;
    // 아이템 주머니와 사용 기록에 시간여행 초청장의 자리를 0 으로 채운다.
    for (let bag of [player.items, player.usedItems]) {
      if (bag && typeof bag === 'object' && !Array.isArray(bag) && bag.timeinvite === undefined) bag.timeinvite = 0;
    }
  }
  let cards = Object.keys(LEAGUES).includes(game.league) ? courseOf(game.league).cards : {};
  if (!Object.hasOwn(cards, 'reverse') || !Array.isArray(game.deck) || game.deck.includes('reverse')) return data;
  let size = game.deck.length;
  let count = cards.reverse.count;
  // 역추진을 장수만큼, 원래의 덱을 같은 간격으로 나눈 자리에 끼워 넣는다. (앞에서 끼운 만큼 자리가 밀린다.)
  for (let turn = 0; turn < count; turn++) game.deck.splice(Math.floor((size * (turn + 1)) / (count + 1)) + turn, 0, 'reverse');
  return data;
}

/**
 * 저장 데이터를 한 버전 위의 형식으로 바꾸는 함수의 표이다. 키는 바꾸기 전의 버전이다.
 * 저장 데이터의 모양을 바꿔 SAVE_VERSION 을 올릴 때마다, 바로 앞 버전을 새 버전으로 바꾸는 함수를 여기에 더한다.
 * @type {Object<number, Function>}
 */
const SAVE_UPGRADES = { 5: upgradeFrom5, 6: upgradeFrom6, 7: upgradeFrom7 };

/**
 * 저장 데이터를 지금의 형식 버전(SAVE_VERSION)으로 변환한다.
 * 버전 표기가 없는 데이터는 표기를 시작하기 전의 형식(LEGACY_VERSION)으로 취급하며, 한 버전씩 차례로 올린다.
 * 변환할 수 없는 버전(표기를 시작하기 전의 형식보다 오래되었거나, 이 프로그램이 아는 것보다 새로운 버전)이면 오류를 던진다.
 * @param {Object} data 해석된 저장 데이터 (직접 고친다.)
 * @returns {Object} 지금 버전으로 바뀐 저장 데이터
 */
export function migrateSave(data) {
  let version = data.version === undefined ? LEGACY_VERSION : data.version;
  let saved = data;
  if (!Number.isInteger(version) || version < LEGACY_VERSION || version > SAVE_VERSION) throw new Error('version');
  // 지금 버전이 될 때까지 한 버전씩 올린다.
  while (version < SAVE_VERSION) {
    saved = SAVE_UPGRADES[version](saved);
    version++;
  }
  saved.version = SAVE_VERSION;
  return saved;
}

/**
 * 해석된 저장 데이터를 검사하여 슬롯 데이터로 다듬는다. 형식이 올바르지 않으면 오류를 던진다.
 * 이전 버전의 저장 데이터(버전 표기가 없는 것 포함)는 먼저 지금의 형식으로 변환한다. (`migrateSave`)
 * @param {*} data 해석된 저장 데이터
 * @param {string} fallback 이름이 비어 있을 때 쓸 이름
 * @param {boolean} strict 아이템이나 진행 중인 게임이 올바르지 않을 때 오류로 처리할지 여부 (false 이면 올바르지 않은 부분만 기본값으로 바꾸거나 버린다.)
 * @returns {Object} 슬롯 데이터 { version, name, money, items, equips, charms, equipped, game, updated }
 */
export function normalizeSave(data, fallback, strict) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || !isCount(data.money, Number.MAX_SAFE_INTEGER)) throw new Error('data');
  data = migrateSave(data);
  let name = typeof data.name === 'string' ? data.name.trim().slice(0, NAME_LIMIT) : '';
  let items = fillItems(data.items);
  if (items === null) {
    if (strict) throw new Error('data');
    items = emptyItems();
  }
  let equips = fillEquips(data.equips);
  if (equips === null) {
    if (strict) throw new Error('data');
    equips = starterEquips();
  }
  let charms = fillCharms(data.charms);
  if (charms === null) {
    if (strict) throw new Error('data');
    charms = fillCharms(undefined);
  }
  let equipped = fillLook(data.equipped, equips, charms);
  if (equipped === null) {
    if (strict) throw new Error('data');
    equipped = fillLook(undefined, equips, charms);
  }
  let game = data.game === undefined ? null : data.game;
  if (game !== null && !isValidGame(game)) {
    if (strict) throw new Error('data');
    game = null;
  }
  if (game !== null) {
    let logs = [];
    // 형식이 올바른 진행 기록만 남긴다.
    for (let entry of game.logs) {
      if (isValidLog(entry, game.players.length)) logs.push(entry);
    }
    game.logs = logs.slice(-LOG_LIMIT);
    game.players[0].name = game.players[0].name.slice(0, NAME_LIMIT) || name || fallback;
  }
  return { version: SAVE_VERSION, name: name || fallback, money: data.money, items, equips, charms, equipped, game, updated: isCount(data.updated, Number.MAX_SAFE_INTEGER) ? data.updated : 0 };
}

/* ==========================================================================
 * 5. 저장소 추상화
 * ========================================================================== */

/**
 * 게임의 설정과 진행 상황을 저장하는 저장소이다.
 * 기본 구현은 브라우저의 localStorage 를 사용한다.
 * 다른 저장 방식을 쓰려면 read, write, remove 를 구현한 객체(또는 이 클래스를 상속한 객체)를
 * initHellmarble() 의 options.storage 로 넘기면 된다.
 */
export class HellmarbleStorage {
  /**
   * 저장소를 만든다.
   * @param {string} [prefix] 저장 키 앞에 붙일 접두어
   */
  constructor(prefix) {
    this.prefix = prefix === undefined ? 'hellmarble.' : prefix;
    this.memory = {};
  }

  /**
   * 브라우저의 localStorage 를 돌려준다.
   * @returns {Storage|null} localStorage (쓸 수 없는 환경이면 null)
   */
  backend() {
    try {
      return globalThis.localStorage || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 저장된 값을 읽는다.
   * @param {string} key 저장 키
   * @returns {*} 저장된 값 (없거나 읽을 수 없으면 null)
   */
  read(key) {
    let name = this.prefix + key;
    let raw = null;
    try {
      let backend = this.backend();
      raw = backend ? backend.getItem(name) : null;
    } catch (error) {
      raw = null;
    }
    if (raw === null || raw === undefined) raw = this.memory[name] === undefined ? null : this.memory[name];
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  /**
   * 값을 저장한다. localStorage 를 쓸 수 없으면 메모리에 임시로 보관한다.
   * @param {string} key 저장 키
   * @param {*} value 저장할 값 (JSON 으로 바꿀 수 있어야 한다.)
   */
  write(key, value) {
    let name = this.prefix + key;
    let raw = JSON.stringify(value);
    try {
      let backend = this.backend();
      if (backend) {
        backend.setItem(name, raw);
        delete this.memory[name];
        return;
      }
    } catch (error) {
      // 저장에 실패하면 아래에서 메모리에 보관한다.
    }
    this.memory[name] = raw;
  }

  /**
   * 저장된 값을 지운다.
   * @param {string} key 저장 키
   */
  remove(key) {
    let name = this.prefix + key;
    delete this.memory[name];
    try {
      let backend = this.backend();
      if (backend) backend.removeItem(name);
    } catch (error) {
      // 지울 수 없는 환경이면 무시한다.
    }
  }
}

/* ==========================================================================
 * 6. 게임 진행 연출 및 입력 담당 (호스트)
 * ========================================================================== */

/**
 * 규칙 엔진이 화면 연출과 사용자 입력을 요청할 때 쓰는 기본 담당 객체이다.
 * 아무 연출도 하지 않으며, 사람 플레이어의 선택도 인공지능이 대신한다.
 * 화면이 없는 환경(시험, 모의 실행)에서는 이 클래스를 그대로 쓰고,
 * 실제 화면은 이 클래스를 상속한 HellmarbleApp 이 담당한다.
 */
export class HellmarbleHost {
  /**
   * 어떤 플레이어의 차례가 시작될 때 호출된다.
   * @param {Object} player 차례가 된 플레이어
   * @returns {Promise<void>}
   */
  async turnStart(player) {
    void player;
  }

  /**
   * 한 차례가 끝나 다음 플레이어로 넘어간 직후 호출된다. (저장 시점)
   * @returns {Promise<void>}
   */
  async turnEnd() {}

  /**
   * 주사위를 굴린 결과를 연출한다.
   * @param {Object} player 주사위를 굴린 플레이어
   * @param {number[]} dice 두 주사위의 눈
   * @param {number[]|null} [faces] 주사위 조작형 아이템이 적용되었으면 그 주사위에서 나올 수 있는 눈 (아니면 null)
   * @returns {Promise<void>}
   */
  async dice(player, dice, faces) {
    void player;
    void dice;
    void faces;
  }

  /**
   * 말이 한 칸 이동한 것을 연출한다.
   * @param {Object} player 이동한 플레이어
   * @param {boolean} fast 빠른 이동(비밀쿠폰, 우주여행) 여부
   * @returns {Promise<void>}
   */
  async step(player, fast) {
    void player;
    void fast;
  }

  /**
   * 뽑힌 비밀쿠폰의 내용을 보여준다.
   * @param {Object} player 쿠폰을 뽑은 플레이어
   * @param {string} id 쿠폰 식별자
   * @returns {Promise<void>}
   */
  async coupon(player, id) {
    void player;
    void id;
  }

  /**
   * 돈이 오가는 모습을 연출한다. 플레이어끼리(통행료, 이용료)뿐 아니라 은행(땅과 건물의 구매, 매각 대금, 월급, 비밀쿠폰의 납부와 수령),
   * 사회복지기금 본부(접수처에서의 납부, 본부에서의 수령)와 오가는 돈도 알려 준다.
   * @param {Object|string} payer 돈을 내는 쪽 (플레이어, 은행이면 BANK, 사회복지기금 본부이면 FUND)
   * @param {Object|string} receiver 돈을 받는 쪽 (플레이어, 은행이면 BANK, 사회복지기금 본부이면 FUND)
   * @param {number} amount 건넨 금액 (원)
   * @returns {Promise<void>}
   */
  async transfer(payer, receiver, amount) {
    void payer;
    void receiver;
    void amount;
  }

  /**
   * 플레이어가 우대권 또는 무전기를 사용한 것을 연출한다. 비밀쿠폰으로 보관하던 것과 아이템으로 가져온 것 모두 알린다.
   * @param {Object} player 사용한 플레이어
   * @param {Object} info 사용한 것 { kind : 'pass' (우대권) 또는 'radio' (무전기), source : 'coupon' (비밀쿠폰) 또는 'item' (아이템) } 과 종류별 값
   *   (pass : index 면제받은 칸, amount 면제받은 금액, travel 우주여행 이용료인지 여부 / radio : arrival 무인도에 막 도착한 것인지 여부)
   * @returns {Promise<void>}
   */
  async use(player, info) {
    void player;
    void info;
  }

  /**
   * 플레이어가 장착한 부적의 효과가 일어난 것을 연출한다.
   * @param {Object} player 부적을 장착한 플레이어
   * @param {Object} info 일어난 효과 { effect : 효과의 종류, charm : 부적 식별자 } 와 효과별 값
   *   (discount : index, price, paid / build : index, building / redraw : coupon)
   * @returns {Promise<void>}
   */
  async charm(player, info) {
    void player;
    void info;
  }

  /**
   * 플레이어가 패배한 것(파산 또는 포기)을 연출한다. 사용자와 인공지능을 가리지 않는다.
   * 그 플레이어는 이미 패배 처리되어 땅과 보관 쿠폰을 잃은 뒤이며, 진행 기록은 이 연출이 끝난 뒤에 남는다.
   * @param {Object} player 패배한 플레이어
   * @param {boolean} voluntary 포기로 인한 패배인지 여부
   * @returns {Promise<void>}
   */
  async defeat(player, voluntary) {
    void player;
    void voluntary;
  }

  /**
   * 카드의 효과로 플레이어가 주사위를 굴린 것을 연출한다. 이동하려고 굴리는 주사위(dice)와 달리 1개 또는 2개를 굴리며, 누가 굴렸는지를 함께 알린다.
   * @param {Object} player 주사위를 굴린 플레이어
   * @param {number[]} dice 굴린 주사위의 눈 (1개 또는 2개)
   * @returns {Promise<void>}
   */
  async cast(player, dice) {
    void player;
    void dice;
  }

  /**
   * 우주여행 코스에서 일어난 사건(별을 빼앗거나 교환하거나 반납함, 기지를 무료로 지음, 견우성과 직녀성의 주인이 모두 나타남 등)을 잠깐 크게 알린다.
   * 같은 내용이 진행 기록에도 남으며, 알림의 문장은 진행 기록과 같은 방식({ key, params })으로 만든다.
   * @param {Object} entry 알릴 내용 { key : 문구의 키, params : 문구에 담을 값 }
   * @returns {Promise<void>}
   */
  async notice(entry) {
    void entry;
  }

  /**
   * 인공지능 플레이어가 판단하는 동안의 시간을 연출한다.
   * @param {Object} player 판단 중인 플레이어
   * @param {Object} request 판단할 내용
   * @returns {Promise<void>}
   */
  async think(player, request) {
    void player;
    void request;
  }

  /**
   * 사람 플레이어에게 선택을 요청한다. 기본 구현은 인공지능이 대신 답한다.
   * roll 요청에는 QUIT, FORFEIT 외에 ITEM_PREFIX 뒤에 아이템 식별자를 붙인 값으로 답하여, 굴리기 전에 그 아이템을 쓸 수 있다.
   * @param {Object} player 선택할 플레이어
   * pass 요청은 { index, amount, travel, coupon, item }, radio 요청은 { arrival, coupon, item } 이며 coupon 과 item 은 비밀쿠폰의 것과 아이템의 것을 각각 쓸 수 있는지이다.
   * 'coupon' 또는 'item' 으로 답하면 그 우대권이나 무전기를 쓰고, 그 밖의 값은 쓰지 않는다. (true 는 비밀쿠폰의 것을 쓰겠다는 답으로 본다.)
   * 우주여행 코스에서는 다음 요청이 더 있다.
   * angel 요청은 { reason, coupon, item } 과 사유별 값(amount, index, target, other, card)이며 답은 pass 요청과 같다. (천사의 빛으로 손해를 면할지)
   * escape 요청은 { arrival, last, escape : { coupon, item }, angel : { coupon, item } } 이며 'escape.coupon', 'escape.item', 'angel.coupon', 'angel.item' 가운데 하나로 답하면 그것을 써서 블랙홀에서 탈출한다.
   * pick 요청은 { reason, options : 고를 수 있는 칸 번호 목록, optional : 고르지 않아도 되는지, map : 보드에서 고르는지, card } 이며 칸 번호(고르지 않으면 null)로 답한다.
   * target 요청은 { reason, options : 고를 수 있는 플레이어 번호 목록, card } 이며 플레이어 번호로 답한다. dicecount 요청은 굴릴 주사위의 수(1 또는 2)로 답한다.
   * @param {Object} request 선택할 내용 (type : roll, travel, radio, buy, build, pass, sell, angel, escape, pick, target, dicecount / roll 의 again 은 더블로 다시 굴리는 것인지 여부)
   * @param {HellmarbleGame} game 진행 중인 게임
   * @returns {Promise<*>} 선택 결과
   */
  async ask(player, request, game) {
    return game.ai.decide(player, request);
  }

  /**
   * 게임 상태가 바뀌어 화면을 다시 그려야 할 때 호출된다.
   * @param {HellmarbleGame} game 진행 중인 게임
   */
  update(game) {
    void game;
  }
}

/* ==========================================================================
 * 7. 인공지능
 * ========================================================================== */

/**
 * 인공지능 플레이어의 판단을 담당한다. 어느 코스에서나 같은 판단(구매, 건설, 매각, 칸 고르기)을 여기에 두는 상위 클래스이며,
 * 코스만의 판단은 이 클래스를 상속한 코스별 인공지능(HellmarbleWorldAI, HellmarbleSpaceAI)이 더한다. 엔진이 자기 코스의 인공지능을 만든다. (HellmarbleGame.createAI)
 * 비상금(위험 대비 현금)을 남겨 두는 범위 안에서 땅을 사고 건물을 지으며,
 * 돈이 모자랄 때에는 수입이 가장 적은 땅부터 매각한다.
 */
export class HellmarbleAI {
  /**
   * 인공지능을 만든다.
   * @param {HellmarbleGame} game 판단의 대상이 되는 게임
   */
  constructor(game) {
    this.game = game;
  }

  /**
   * 요청의 종류에 맞는 판단을 내린다. 여기에서는 어느 코스에나 있는 요청을 다루며, 코스만의 요청은 하위 클래스가 이 메소드를 재정의하여 먼저 다룬다.
   * @param {Object} player 판단할 플레이어
   * @param {Object} request 판단할 내용
   * @returns {*} 판단 결과 (모르는 요청에는 true)
   */
  decide(player, request) {
    switch (request.type) {
      case 'buy': return this.wantBuy(player, request);
      case 'build': return this.chooseBuild(player, request);
      case 'sell': return this.chooseSale(player, request);
      case 'pick': return this.choosePick(player, request);
      default: return true;
    }
  }

  /**
   * 다른 플레이어의 땅 중 가장 비싼 통행료·이용료를 구한다.
   * @param {Object} player 기준이 되는 플레이어
   * @returns {number} 가장 큰 통행료·이용료 (원)
   */
  threat(player) {
    let game = this.game;
    let worst = 0;
    // 모든 땅을 살펴 남이 가진 땅의 통행료 중 최댓값을 찾는다.
    for (let index = 0; index < BOARD_SIZE; index++) {
      let land = game.state.lands[index];
      if (land && land.owner !== null && land.owner !== player.id) worst = Math.max(worst, game.toll(index));
    }
    return worst;
  }

  /**
   * 위험에 대비해 남겨 둘 비상금을 계산한다.
   * @param {Object} player 기준이 되는 플레이어
   * @returns {number} 비상금 (원)
   */
  reserve(player) {
    let wanted = Math.max(this.game.salary * 1.5, this.threat(player) * 0.6) * (player.caution || 1);
    return Math.round(Math.min(wanted, player.cash * 0.5));
  }

  /**
   * 빈 땅을 살지 결정한다.
   * @param {Object} player 판단할 플레이어
   * @param {Object} request 구매 요청 { index, price }
   * @returns {boolean} 구매 여부
   */
  wantBuy(player, request) {
    return player.cash - request.price >= this.reserve(player);
  }

  /**
   * 어떤 건물을 지을지 결정한다.
   * @param {Object} player 판단할 플레이어
   * @param {Object} request 건설 요청 { index, options }
   * @returns {string|null} 지을 건물의 종류 (짓지 않으면 null)
   */
  chooseBuild(player, request) {
    let reserve = this.reserve(player);
    let kinds = this.game.course.buildings;
    // 이용료가 높은 건물(호텔 → 빌딩 → 별장, 우주여행 코스에서는 기지)부터 지을 수 있는지 살펴본다.
    for (let position = kinds.length - 1; position >= 0; position--) {
      let kind = kinds[position];
      if (request.options.includes(kind) && player.cash - this.game.buildCost(request.index, kind) >= reserve) return kind;
    }
    return null;
  }

  /**
   * 돈이 모자랄 때 매각할 땅을 결정한다.
   * 한 번에 부족한 돈을 채울 수 있는 땅 중 통행료 수입이 가장 적은 땅을 우선한다.
   * @param {Object} player 판단할 플레이어
   * @param {Object} request 매각 요청 { amount }
   * @returns {number} 매각할 땅의 칸 번호
   */
  chooseSale(player, request) {
    let game = this.game;
    let need = request.amount - player.cash;
    let best = -1;
    let bestCovers = false;
    let bestToll = 0;
    // 가진 땅을 하나씩 비교하여 손해가 가장 적은 땅을 고른다.
    for (let index of game.owned(player)) {
      let covers = game.saleValue(index) >= need;
      let toll = game.toll(index);
      if (best < 0 || (covers && !bestCovers) || (covers === bestCovers && toll < bestToll)) {
        best = index;
        bestCovers = covers;
        bestToll = toll;
      }
    }
    return best;
  }

  /**
   * 원하는 칸으로 이동할 때의 목적지로서 어떤 칸이 갖는 기대 가치를 계산한다.
   * 구매할 수 있는 땅은 여기에서 따지고(빈 땅이면 살 만한지, 남의 땅이면 낼 돈, 자기 땅이면 지을 건물), 그 밖의 칸은 코스마다 다르므로 spotScore 에 맡긴다.
   * @param {Object} player 판단할 플레이어
   * @param {number} index 살펴볼 칸 번호
   * @param {boolean} passing 가는 길에 출발지를 지나기만 해도 월급을 받는지 여부 (false 이면 출발지에 도착할 때에만 받는다.)
   * @returns {number} 기대 가치 (원 단위의 어림값)
   */
  travelScore(player, index, passing) {
    let game = this.game;
    let tile = game.board[index];
    let land = game.state.lands[index];
    let bonus = (passing ? index < player.position : index === game.course.start) ? game.salary : 0;
    if (land) {
      if (land.owner === null) {
        if (!game.canOwn(player, index) || player.cash - game.price(index) < this.reserve(player)) return bonus;
        return bonus + game.money(tile.toll) * 3 + game.price(index) * 0.2 + this.potential(tile);
      }
      if (land.owner !== player.id) return bonus - game.toll(index);
      let choice = this.chooseBuild(player, { index, options: game.buildOptions(player, index) });
      return bonus + (choice ? game.tollAfter(index, choice) - game.toll(index) : 0);
    }
    return this.spotScore(player, tile, bonus);
  }

  /**
   * 빈 땅을 샀을 때 나중에 건물을 지어 더 얻게 될 수입의 어림값을 구한다. 건물의 종류가 코스마다 다르므로 하위 클래스가 정한다.
   * @param {HellmarbleTile} tile 살펴볼 땅
   * @returns {number} 어림값 (원). 여기에서는 건물을 따지지 않아 0 이다.
   */
  potential(tile) {
    void tile;
    return 0;
  }

  /**
   * 구매할 수 없는 칸(카드 칸, 기금이 쌓이는 칸, 갇히는 칸 등)에 도착했을 때의 기대 가치를 구한다. 칸의 종류가 코스마다 다르므로 하위 클래스가 정한다.
   * @param {Object} player 판단할 플레이어
   * @param {HellmarbleTile} tile 살펴볼 칸
   * @param {number} bonus 그 칸으로 가면서 받게 되는 월급 (원)
   * @returns {number} 기대 가치 (원 단위의 어림값). 여기에서는 칸의 효과를 따지지 않아 월급뿐이다.
   */
  spotScore(player, tile, bonus) {
    void player;
    void tile;
    return bonus;
  }

  /**
   * 엔진이 칸 하나를 골라 달라고 할 때(HellmarbleGame.pick) 고를 칸을 결정한다. 사유마다 점수를 매겨 가장 높은 칸을 고른다.
   * @param {Object} player 판단할 플레이어
   * @param {Object} request 선택 요청 { reason, options, optional }
   * @returns {number|null} 고른 칸 번호 (고를 만한 칸이 없으면 null)
   */
  choosePick(player, request) {
    let best = null;
    let bestScore = -Infinity;
    // 고를 수 있는 칸마다 점수를 매겨 가장 높은 칸을 고른다.
    for (let index of request.options) {
      let score = this.pickScore(player, request.reason, index);
      if (score > bestScore) {
        best = index;
        bestScore = score;
      }
    }
    return best;
  }

  /**
   * 칸 하나를 골라야 할 때 그 칸이 갖는 점수를 매긴다. 고르는 사유가 코스마다 다르므로 하위 클래스가 정한다.
   * @param {Object} player 판단할 플레이어
   * @param {string} reason 고르는 사유
   * @param {number} index 살펴볼 칸 번호
   * @returns {number} 점수 (높을수록 고르기 좋다.) 여기에서는 사유를 따지지 않아 모두 0 이며, 그래서 첫 칸을 고르게 된다.
   */
  pickScore(player, reason, index) {
    void player;
    void reason;
    void index;
    return 0;
  }
}

/**
 * 세계여행 코스의 인공지능이다. 공통 판단(HellmarbleAI)에 우대권과 무전기를 쓸지, 우주여행으로 어디에 갈지에 대한 판단을 더한다.
 */
export class HellmarbleWorldAI extends HellmarbleAI {
  /**
   * 요청의 종류에 맞는 판단을 내린다. 세계여행 코스만의 요청(우대권, 무전기, 우주여행의 목적지)을 먼저 다루고 나머지는 공통 판단에 맡긴다.
   * @param {Object} player 판단할 플레이어
   * @param {Object} request 판단할 내용
   * @returns {*} 판단 결과
   */
  decide(player, request) {
    switch (request.type) {
      case 'pass': return this.wantPass(player, request);
      case 'radio': return this.wantRadio(player);
      case 'travel': return this.chooseTravel(player);
      default: return super.decide(player, request);
    }
  }

  /**
   * 빈 도시를 샀을 때 나중에 건물을 지어 더 얻게 될 수입의 어림값을 구한다. 빌딩 이용료의 일부로 어림한다.
   * @param {HellmarbleTile} tile 살펴볼 땅
   * @returns {number} 어림값 (원). 건물을 지을 수 없는 땅이면 0
   */
  potential(tile) {
    return tile.type === 'city' ? this.game.money(tile.fee.building) * 0.3 : 0;
  }

  /**
   * 세계여행 코스의 구매할 수 없는 칸(비밀쿠폰, 사회복지기금 본부와 접수처, 무인도)에 도착했을 때의 기대 가치를 구한다.
   * @param {Object} player 판단할 플레이어
   * @param {HellmarbleTile} tile 살펴볼 칸
   * @param {number} bonus 그 칸으로 가면서 받게 되는 월급 (원)
   * @returns {number} 기대 가치 (원 단위의 어림값)
   */
  spotScore(player, tile, bonus) {
    let game = this.game;
    switch (tile.type) {
      case 'coupon': return bonus + game.money(won(3));
      case 'fund': return bonus + game.state.fund;
      case 'desk': return bonus - Math.min(player.cash, game.money(WELFARE_FEE));
      case 'island': return bonus - game.salary * 2;
      default: return bonus;
    }
  }

  /**
   * 비밀쿠폰 우대권을 쓸지 결정한다. 월급 이상의 큰 금액이거나 현금으로 낼 수 없을 때 쓴다. (아이템 우대권은 쓰지 않는다.)
   * @param {Object} player 판단할 플레이어
   * @param {Object} request 우대권 요청 { index, amount }
   * @returns {boolean} 사용 여부
   */
  wantPass(player, request) {
    return request.amount >= this.game.salary || request.amount > player.cash;
  }

  /**
   * 비밀쿠폰 무전기를 쓸지 결정한다. 보드가 아직 위험하지 않을 때에만 써서 탈출한다. (아이템 무전기는 쓰지 않는다.)
   * @param {Object} player 판단할 플레이어
   * @returns {boolean} 사용 여부
   */
  wantRadio(player) {
    return this.threat(player) < player.cash * 0.3;
  }

  /**
   * 우주여행으로 이동할 칸을 결정한다.
   * @param {Object} player 판단할 플레이어
   * @returns {number} 이동할 칸 번호
   */
  chooseTravel(player) {
    let best = (player.position + 1) % BOARD_SIZE;
    let bestScore = -Infinity;
    // 현재 칸을 뺀 모든 칸의 기대 가치를 계산하여 가장 좋은 칸을 고른다.
    for (let index = 0; index < BOARD_SIZE; index++) {
      if (index === player.position) continue;
      let score = this.travelScore(player, index, true);
      if (score > bestScore) {
        best = index;
        bestScore = score;
      }
    }
    return best;
  }
}

/**
 * 우주여행 코스의 인공지능이다. 공통 판단(HellmarbleAI)에 천사의 빛과 블랙홀 탈출포트를 쓸지, 카드의 효과로 어느 칸이나 어느 플레이어를 고를지에 대한 판단을 더한다.
 */
export class HellmarbleSpaceAI extends HellmarbleAI {
  /**
   * 요청의 종류에 맞는 판단을 내린다. 우주여행 코스만의 요청(천사의 빛, 블랙홀 탈출, 플레이어 고르기, 주사위의 수)을 먼저 다루고 나머지는 공통 판단에 맡긴다.
   * @param {Object} player 판단할 플레이어
   * @param {Object} request 판단할 내용
   * @returns {*} 판단 결과
   */
  decide(player, request) {
    switch (request.type) {
      case 'angel': return this.wantAngel(player, request);
      case 'escape': return this.chooseEscape(player, request);
      case 'target': return this.chooseTarget(player, request);
      case 'dicecount': return this.chooseDiceCount(player);
      case 'travel': return this.chooseTravel(player);
      default: return super.decide(player, request);
    }
  }

  /**
   * 빈 별을 샀을 때 나중에 기지를 지어 더 얻게 될 수입의 어림값을 구한다. 기지가 있을 때의 이용료의 일부로 어림한다.
   * @param {HellmarbleTile} tile 살펴볼 땅
   * @returns {number} 어림값 (원). 기지를 지을 수 없는 땅이면 0
   */
  potential(tile) {
    return tile.type === 'star' ? this.game.money(tile.fee.base) * 0.3 : 0;
  }

  /**
   * 자기 별 하나에 지금 지을 차례가 된 것(기지가 없으면 기지, 있으면 증축)을 지었을 때 이용료가 얼마나 오르는지 구한다.
   * 비상금을 남기고 그 비용을 낼 수 없거나 더 지을 것이 없는 별은 지을 만하지 않은 것으로 본다.
   * @param {Object} player 판단할 플레이어
   * @param {number} index 별의 칸 번호
   * @returns {number} 오르는 이용료 (원). 지을 만하지 않으면 -Infinity
   */
  workGain(player, index) {
    let game = this.game;
    let kind = game.buildKinds(index)[0];
    if (game.state.lands[index][kind] >= BUILD_LIMIT[kind] || player.cash - game.buildCost(index, kind) < this.reserve(player)) return -Infinity;
    return game.tollAfter(index, kind) - game.toll(index);
  }

  /**
   * 지구에 멈췄을 때 기지를 짓거나 증축하여 더 얻게 될 수입의 어림값을 구한다.
   * 비상금을 남기고 비용을 낼 수 있는 자기 별 가운데 이용료가 가장 많이 오르는 별의 인상분이다.
   * @param {Object} player 판단할 플레이어
   * @returns {number} 어림값 (원). 지을 만한 별이 없으면 0
   */
  earthGain(player) {
    let best = 0;
    // 자기 별마다 지금 지을 수 있는 것으로 이용료가 얼마나 오르는지 살펴 가장 큰 것을 고른다.
    for (let index of this.game.stars(player)) best = Math.max(best, this.workGain(player, index));
    return best;
  }

  /**
   * 시간여행 초청장으로 탑승한 다음 차례에 이동할 칸을 결정한다. 현재 칸을 뺀 모든 칸의 기대 가치를 견주어 가장 좋은 칸을 고른다.
   * (가는 길에 지구를 지나도 월급이 없고, 지구에 도착할 때에만 월급을 받는 것으로 따진다.)
   * @param {Object} player 판단할 플레이어
   * @returns {number} 이동할 칸 번호
   */
  chooseTravel(player) {
    let options = [];
    // 현재 칸을 뺀 모든 칸을 후보로 삼는다.
    for (let index = 0; index < BOARD_SIZE; index++) {
      if (index !== player.position) options.push(index);
    }
    return this.choosePick(player, { reason: 'timetravel', options });
  }

  /**
   * 우주여행 코스의 구매할 수 없는 칸(지구, 텔레파시 카드, 핼리혜성, 뉴런의 골짜기, 우주조난기지, 블랙홀)에 도착했을 때의 기대 가치를 구한다.
   * 지구에 멈추면 기지가 없는 자기 별에 기지를 지을 수 있으므로 그만큼을 더한다.
   * @param {Object} player 판단할 플레이어
   * @param {HellmarbleTile} tile 살펴볼 칸
   * @param {number} bonus 그 칸으로 가면서 받게 되는 월급 (원)
   * @returns {number} 기대 가치 (원 단위의 어림값)
   */
  spotScore(player, tile, bonus) {
    let game = this.game;
    switch (tile.type) {
      case 'start': return bonus + this.earthGain(player);
      case 'telepathy': return bonus + game.money(won(10));
      case 'halley': return bonus + game.money(won(10));
      case 'neuron': return bonus + game.money(won(8));
      case 'rescue': return bonus + (game.state.fund > 0 ? game.state.fund : -Math.min(player.cash, game.money(RESCUE_FEE)));
      case 'blackhole': return bonus - game.salary * 2;
      default: return bonus;
    }
  }

  /**
   * 천사의 빛(텔레파시 카드로 보관한 것)을 써서 손해를 면할지 결정한다. 월급 이상의 큰 손해이거나 현금으로 감당할 수 없을 때 쓴다. (아이템 천사의 빛은 쓰지 않는다.)
   * @param {Object} player 판단할 플레이어
   * @param {Object} request 천사의 빛 요청 { reason, amount : 면하게 되는 손해의 크기(원) }
   * @returns {boolean} 사용 여부
   */
  wantAngel(player, request) {
    return request.amount >= this.game.salary || request.amount > player.cash;
  }

  /**
   * 블랙홀에서 탈출하는 데 무엇을 쓸지 결정한다. 텔레파시 카드로 보관한 블랙홀 탈출포트만 쓰며, 보드가 아직 위험하지 않거나 땅을 반납할 수도 있는 3턴 째일 때 쓴다.
   * (천사의 빛은 더 큰 손해를 막는 데 쓰려고 아낀다.)
   * @param {Object} player 판단할 플레이어
   * @param {Object} request 탈출 요청 { arrival, last, escape : { coupon, item }, angel : { coupon, item } }
   * @returns {string|null} 쓸 것 ('escape.coupon'), 쓰지 않으면 null
   */
  chooseEscape(player, request) {
    return request.escape.coupon && (request.last || this.threat(player) < player.cash * 0.3) ? 'escape.coupon' : null;
  }

  /**
   * 칸 하나를 골라야 할 때 그 칸이 갖는 점수를 사유에 맞게 매긴다. 점수가 높을수록 고르기 좋은 칸이다.
   * 잃는 것(반납, 내주기)은 값이 싼 것을, 얻는 것(기지 건설, 별 얻기)은 이익이 큰 것을 고르도록 매긴다.
   * @param {Object} player 판단할 플레이어
   * @param {string} reason 고르는 사유 (blackhole, give, basereturn, freebase, reunion, earth, take, pascal, valley, lovers, moravec, timetravel)
   * @param {number} index 살펴볼 칸 번호
   * @returns {number} 점수 (고르면 안 되는 칸은 -Infinity)
   */
  pickScore(player, reason, index) {
    let game = this.game;
    let tile = game.board[index];
    switch (reason) {
      case 'blackhole': return -game.value(index);
      case 'give': return -game.value(index);
      case 'basereturn': return -game.toll(index);
      case 'freebase': return tile.fee.base - tile.toll;
      case 'reunion': return this.workGain(player, index);
      case 'earth': return this.workGain(player, index);
      case 'take': return game.value(index);
      case 'pascal': return game.toll(index);
      case 'valley': return (index < player.position ? BOARD_SIZE : 0) - ((index - player.position + BOARD_SIZE) % BOARD_SIZE);
      case 'moravec': return this.travelScore(player, index, false);
      case 'timetravel': return this.travelScore(player, index, false);
      default: return 0;
    }
  }

  /**
   * 카드의 효과로 다른 플레이어 한 명을 골라야 할 때(우주파티 초대권) 고를 플레이어를 결정한다.
   * 보내질 칸에서 이용료를 내게 될 플레이어를 우선하고, 그 가운데 현금이 가장 많은 플레이어를 고른다.
   * @param {Object} player 판단할 플레이어
   * @param {Object} request 선택 요청 { reason, options : 플레이어 번호 목록, index : 보내질 칸 번호 }
   * @returns {number} 고른 플레이어의 번호
   */
  chooseTarget(player, request) {
    void player;
    let game = this.game;
    let land = game.state.lands[request.index];
    let owner = land ? land.owner : null;
    let best = request.options[0];
    let bestScore = -Infinity;
    // 고를 수 있는 플레이어마다 이용료를 내게 되는지와 현금을 살펴 가장 손해를 입힐 수 있는 플레이어를 고른다.
    for (let id of request.options) {
      let rival = game.state.players[id];
      let score = (owner !== null && owner !== id ? game.toll(request.index) : 0) + rival.cash / 1000;
      if (score > bestScore) {
        best = id;
        bestScore = score;
      }
    }
    return best;
  }

  /**
   * 조디악의 선물 카드에서 주사위를 1개 던질지 2개 던질지 결정한다. 도착하게 될 별자리들의 기대 가치를 눈이 나올 확률로 평균하여 더 좋은 쪽을 고른다.
   * @param {Object} player 판단할 플레이어
   * @returns {number} 던질 주사위의 수 (1 또는 2)
   */
  chooseDiceCount(player) {
    let game = this.game;
    let one = 0;
    let two = 0;
    // 주사위 1개의 눈(1~6)마다 도착할 별자리의 기대 가치를 더한다.
    for (let face = 1; face <= 6; face++) one += this.travelScore(player, game.tiles[ZODIAC[face - 1]], false) / 6;
    // 주사위 2개의 합(2~12)마다 그 합이 나올 경우의 수를 곱해 기대 가치를 더한다.
    for (let sum = 2; sum <= 12; sum++) two += (this.travelScore(player, game.tiles[ZODIAC[sum - 1]], false) * (6 - Math.abs(sum - 7))) / 36;
    return two > one ? 2 : 1;
  }
}

/* ==========================================================================
 * 8. 규칙 엔진
 * ========================================================================== */

/**
 * Hellmarble 의 규칙을 진행하는 엔진이다. 어느 코스에서나 같은 규칙을 여기에 두는 상위 클래스이며,
 * 코스만의 규칙은 이 클래스를 상속한 코스별 엔진(HellmarbleWorldGame, HellmarbleSpaceGame)이 더한다.
 * 진행 상태(state)는 그대로 저장할 수 있는 단순한 객체이며, 화면과 입력은 호스트에게 맡긴다.
 *
 * 여기에 있는 것 : 차례의 진행(주사위, 이동, 더블), 땅의 구매·건설·매각과 통행료·이용료 지불, 파산, 월급, 아이템과 부적,
 * 카드를 뽑아 이행하는 뼈대, 갇히고 탑승하는 뼈대, 승패의 판정.
 * 하위 클래스가 재정의하여 채우는 곳 : createAI (인공지능), toll (내야 할 금액), buildKinds (지을 차례가 된 건물), gift (부적이 지어 주는 건물), hurts (손해가 되는 카드),
 * waive (통행료·이용료의 면제), visit (코스만의 칸에 도착), acquired (땅을 얻은 뒤), applyCard (코스만의 카드 효과), itemEffect (직접 쓰는 아이템),
 * release (갇힌 플레이어가 풀려나는 경우), paroled (풀려난 굴림의 뒤처리), playStep (주사위를 굴리는 한 번의 진행).
 * 엔진은 직접 만들지 않고 HellmarbleGame.open 으로 만든다. 그래야 그 게임의 코스에 맞는 하위 클래스가 만들어진다.
 */
export class HellmarbleGame {
  /**
   * 게임 엔진을 만든다. 보통은 직접 부르지 않고 HellmarbleGame.open 으로 그 코스의 엔진을 만든다.
   * @param {Object} state 게임 진행 상태 (HellmarbleGame.create 로 만들거나 저장된 것을 불러온다.)
   * @param {HellmarbleHost} [host] 화면 연출과 사용자 입력 담당 (생략 시 연출 없이 진행)
   */
  constructor(state, host) {
    this.state = state;
    this.host = host || new HellmarbleHost();
    this.ai = this.createAI();
    this.stopped = false;
    this.exempt = false;
    this.parole = false;
    this.bonus = false;
    this.drawn = [];
  }

  /**
   * 진행 상태에 맞는 코스의 엔진을 만든다. 리그가 진행되는 코스(LEAGUES 의 course)의 엔진 클래스(ENGINES)를 고른다.
   * @param {Object} state 게임 진행 상태 (HellmarbleGame.create 로 만들거나 저장된 것을 불러온다.)
   * @param {HellmarbleHost} [host] 화면 연출과 사용자 입력 담당 (생략 시 연출 없이 진행)
   * @returns {HellmarbleGame} 그 코스의 엔진
   */
  static open(state, host) {
    return new (engineOf(state.league))(state, host);
  }

  /**
   * 이 엔진이 쓸 인공지능을 만든다. 코스별 엔진이 재정의하여 자기 코스의 인공지능을 만든다.
   * @returns {HellmarbleAI} 인공지능
   */
  createAI() {
    return new HellmarbleAI(this);
  }

  /**
   * 저장된 진행 상태가 이 코스만의 규칙에 어긋나지 않는지 확인한다. (공통 형식은 isValidGame 이 따로 검사한다.) 코스별 엔진이 재정의한다.
   * @param {Object} state 게임 진행 상태
   * @returns {boolean} 어긋나지 않으면 true
   */
  static sound(state) {
    void state;
    return true;
  }

  /**
   * 새 게임의 진행 상태를 만든다. 플레이어 구성, 턴 순서, 카드 덱(비밀쿠폰 또는 텔레파시 카드와 뉴런의 골짜기 카드)을 정한다.
   * 보드와 카드는 리그의 코스(세계여행 코스, 우주여행 코스)를 따른다.
   * 사용자는 장착한 색상과 모양을 쓰고, 인공지능 플레이어는 그와 겹치지 않는 기본 색상과 모양을 쓴다.
   * 시작하는 돈과 인공지능의 수, 소모형 아이템을 가져갈 수 있는지, 인공지능 한 명이 부적을 장착하는지는 리그의 설정(LEAGUES)을 따른다.
   * 아이템은 그 리그에서 쓸 수 있는 것만 가져간다. (소모형 아이템을 쓸 수 없는 리그, 다른 코스에서만 쓰는 아이템은 가져가지 않는다.)
   * @param {Object} options 설정 { league : 리그 식별자, name : 사용자 이름, items : 사용자가 가져갈 아이템 주머니(선택), look : 사용자가 장착한 색상과 모양(선택, 생략 시 기본 장착), charm : 사용자가 장착한 부적(선택), seed : 난수 씨앗(선택), rivals : 인공지능 수(선택) }
   * @returns {Object} 새 게임의 진행 상태
   */
  static create(options) {
    let league = LEAGUES[options.league];
    let course = COURSES[league.course];
    let seed = options.seed === undefined ? Math.floor(Math.random() * 4294967296) : options.seed;
    let humanItems = splitItems(options.items, options.league).taken;
    let look = isValidLook(options.look) ? { color: options.look.color, shape: options.look.shape } : { ...DEFAULT_LOOK };
    let looks = [look, ...rivalLooks(look, MAX_PLAYERS - 1)];
    let state = {
      version: SAVE_VERSION, league: options.league, multiplier: league.multiplier, seed: seed >>> 0,
      players: [], order: [], rolls: [], turn: 0, turns: 0, lands: [], deck: [], valley: [], fund: 0,
      dice: [1, 1], logs: [], finished: false, winner: null,
    };
    let game = HellmarbleGame.open(state);
    let rivals = league.weights[options.rivals - 1] > 0 ? options.rivals : game.pickWeighted(league.weights) + 1;
    let pool = [];
    // 사용자(0번)와 인공지능 플레이어를 만들고 턴 순서를 정할 주사위를 굴린다.
    for (let id = 0; id <= rivals; id++) {
      let kept = {};
      // 그 코스에서 보관할 수 있는 카드의 자리를 0장으로 만든다.
      for (let card of course.keeps) kept[card] = 0;
      state.players.push({
        id, name: id === 0 ? options.name : null, ai: id !== 0, cash: league.cash, position: course.start,
        alive: true, island: 0, boarded: false, direct: false, coupons: kept,
        items: id === 0 ? humanItems : emptyItems(), usedItems: freshUsage(), loaded: null, look: looks[id], charm: id === 0 && isCharm(options.charm) ? options.charm : null,
        caution: id === 0 ? 1 : 0.7 + game.random() * 0.6,
      });
      state.rolls.push([game.rollDie(), game.rollDie()]);
      state.order.push(id);
    }
    /**
     * 주사위 합이 큰 순서, 같으면 플레이어 번호가 낮은 순서로 비교한다.
     * @param {number} a 플레이어 번호
     * @param {number} b 플레이어 번호
     * @returns {number} 정렬 순서
     */
    function compare(a, b) {
      return (state.rolls[b][0] + state.rolls[b][1]) - (state.rolls[a][0] + state.rolls[a][1]) || a - b;
    }
    state.order.sort(compare);
    // 구매할 수 있는 칸마다 소유 정보(소유자와 그 코스의 건물 종류별 개수)를 만든다.
    for (let tile of course.board) {
      let land = { owner: null };
      // 그 코스에서 지을 수 있는 건물의 개수를 0 으로 넣는다.
      for (let kind of course.buildings) land[kind] = 0;
      state.lands.push(PROPERTY_TYPES.includes(tile.type) ? land : null);
    }
    // 주 카드 덱(비밀쿠폰 또는 텔레파시 카드)에 카드를 종류별 장수만큼 넣는다.
    for (let id in course.cards) {
      // 같은 카드를 정해진 장수만큼 반복해서 넣는다.
      for (let count = 0; count < course.cards[id].count; count++) state.deck.push(id);
    }
    game.shuffle(state.deck);
    // 둘째 카드 덱(뉴런의 골짜기 카드)에 카드를 종류별 장수만큼 넣는다. 이 덱이 없는 코스에서는 비어 있다.
    for (let id in course.valley) {
      // 같은 카드를 정해진 장수만큼 반복해서 넣는다.
      for (let count = 0; count < course.valley[id].count; count++) state.valley.push(id);
    }
    game.shuffle(state.valley);
    // 인공지능이 장착할 수 있는 등급의 부적을 모은다. (그런 등급을 정해 두지 않은 리그에서는 하나도 모이지 않는다.)
    for (let id in CHARMS) {
      if (league.rivalCharms.includes(CHARMS[id].grade)) pool.push(id);
    }
    if (pool.length > 0) state.players[1 + Math.floor(game.random() * rivals)].charm = pool[Math.floor(game.random() * pool.length)];
    game.log('log.order', { order: state.order.slice() });
    return state;
  }

  /**
   * 지금 차례인 플레이어이다.
   * @returns {Object} 차례인 플레이어
   */
  get current() {
    return this.state.players[this.state.order[this.state.turn]];
  }

  /**
   * 이 게임이 진행되는 코스의 구성이다. 리그에 따라 정해진다.
   * @returns {HellmarbleCourse} 코스의 구성
   */
  get course() {
    return courseOf(this.state.league);
  }

  /**
   * 이 게임의 보드(40칸)이다.
   * @returns {HellmarbleTile[]} 보드의 칸 목록
   */
  get board() {
    return this.course.board;
  }

  /**
   * 이 게임의 보드에서 칸 식별자로 칸 번호를 찾는 표이다.
   * @returns {Object<string, number>} 식별자별 칸 번호
   */
  get tiles() {
    return this.course.tiles;
  }

  /**
   * 출발지에서 받는 월급이다. (리그 배율 적용)
   * @returns {number} 월급 (원)
   */
  get salary() {
    return this.money(this.course.salary);
  }

  /**
   * 진행 상태에 저장된 씨앗으로 0 이상 1 미만의 난수를 만든다. (mulberry32)
   * 씨앗이 함께 저장되므로 불러온 뒤에도 같은 순서의 난수가 이어진다.
   * @returns {number} 난수
   */
  random() {
    let seed = (this.state.seed + 0x6d2b79f5) >>> 0;
    this.state.seed = seed;
    let value = Math.imul(seed ^ (seed >>> 15), seed | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * 주사위 하나를 굴린다.
   * @returns {number} 주사위의 눈 (1~6)
   */
  rollDie() {
    return Math.floor(this.random() * 6) + 1;
  }

  /**
   * 가중치에 비례한 확률로 항목 하나를 고른다.
   * @param {number[]} weights 항목별 가중치
   * @returns {number} 고른 항목의 순번
   */
  pickWeighted(weights) {
    let total = 0;
    // 가중치의 합을 구한다.
    for (let weight of weights) total += weight;
    let point = this.random() * total;
    // 누적 가중치가 난수를 넘어서는 첫 항목을 고른다.
    for (let index = 0; index < weights.length; index++) {
      point -= weights[index];
      if (point < 0) return index;
    }
    return weights.length - 1;
  }

  /**
   * 목록의 순서를 무작위로 섞는다. (피셔-예이츠)
   * @param {Array} list 섞을 목록
   */
  shuffle(list) {
    // 뒤에서부터 임의의 앞쪽 항목과 자리를 바꾼다.
    for (let index = list.length - 1; index > 0; index--) {
      let other = Math.floor(this.random() * (index + 1));
      let kept = list[index];
      list[index] = list[other];
      list[other] = kept;
    }
  }

  /**
   * 기본 금액에 리그 배율을 적용한다.
   * @param {number} base 기본 금액 (원)
   * @returns {number} 배율이 적용된 금액 (원)
   */
  money(base) {
    return base * this.state.multiplier;
  }

  /**
   * 땅의 구매가를 구한다.
   * @param {number} index 칸 번호
   * @returns {number} 구매가 (원)
   */
  price(index) {
    return this.money(this.board[index].price);
  }

  /**
   * 건물의 건설비를 구한다.
   * @param {number} index 칸 번호
   * @param {string} kind 건물 종류
   * @returns {number} 건설비 (원)
   */
  buildCost(index, kind) {
    return this.money(this.board[index].cost[kind]);
  }

  /**
   * 땅에 도착한 다른 플레이어가 내야 하는 금액을 구한다. 여기에서는 건물을 따지지 않은 기본 금액이며,
   * 지어진 건물에 따라 금액이 달라지는 방식은 코스마다 다르므로 코스별 엔진이 재정의한다.
   * @param {number} index 칸 번호
   * @returns {number} 내야 하는 금액 (원)
   */
  toll(index) {
    return this.money(this.board[index].toll);
  }

  /**
   * 이 땅에 그 종류의 건물을 하나 더 지은 뒤에 다른 플레이어가 내야 하는 금액을 구한다. (건설이나 증축을 묻는 창과 인공지능이 지은 뒤의 금액을 알리거나 견주는 데 쓴다.)
   * 건물에 따라 금액이 달라지는 방식이 코스마다 다르므로, 건물을 잠깐 더해 toll 로 구한 뒤 되돌린다. 진행 상태는 바뀌지 않는다.
   * @param {number} index 칸 번호
   * @param {string} kind 건물 종류
   * @returns {number} 지은 뒤에 내야 하는 금액 (원)
   */
  tollAfter(index, kind) {
    let land = this.state.lands[index];
    land[kind]++;
    let amount = this.toll(index);
    land[kind]--;
    return amount;
  }

  /**
   * 땅과 그 위 건물의 가치(구매 및 건설 가격의 100%)를 구한다.
   * @param {number} index 칸 번호
   * @returns {number} 가치 (원)
   */
  value(index) {
    let tile = this.board[index];
    let land = this.state.lands[index];
    let total = tile.price;
    // 건물을 지을 수 있는 땅이면 지어진 건물의 건설비를 종류별로 더한다.
    for (let kind of tile.cost ? this.course.buildings : []) total += tile.cost[kind] * land[kind];
    return this.money(total);
  }

  /**
   * 땅을 은행에 매각할 때 돌려받는 금액(가치의 70%)을 구한다.
   * @param {number} index 칸 번호
   * @returns {number} 매각 금액 (원)
   */
  saleValue(index) {
    return Math.floor((this.value(index) * SELL_PERCENT) / 100);
  }

  /**
   * 플레이어가 이번 게임에서 아이템을 쓸 수 있는지 확인한다.
   * 이 게임의 리그와 코스에서 쓸 수 있는 아이템이어야 하고, 가지고 있어야 하며, 같은 사용 제한 묶음의 아이템을 이번 게임에서 쓴 횟수가 한도보다 적어야 한다.
   * @param {Object} player 쓰려는 플레이어
   * @param {string} id 아이템 식별자
   * @returns {boolean} 쓸 수 있으면 true
   */
  canUseItem(player, id) {
    return !player.ai && player.alive && itemFits(id, this.state.league) && player.items[id] > 0 && player.usedItems[ITEMS[id].limit] < limitUses(ITEMS[id].limit);
  }

  /**
   * 아이템 한 개를 소모한다. 같은 사용 제한 묶음의 아이템은 게임 한 판에 정해진 횟수(대부분 한 번)까지만 쓸 수 있다.
   * @param {Object} player 사용한 플레이어
   * @param {string} id 아이템 식별자
   * @returns {boolean} 쓸 수 있어서 아이템 한 개를 소비했으면 true
   */
  consumeItem(player, id) {
    if (!this.canUseItem(player, id)) return false;
    player.items[id]--;
    player.usedItems[ITEMS[id].limit]++;
    return true;
  }

  /**
   * 주사위를 굴릴 차례에 아이템 목록에서 직접 쓰는 아이템을 사용한다. 사용하는 즉시 한 개가 소모된다.
   * 주사위 조작형 아이템이면 이번 차례에 굴릴 주사위에 적용되도록 표시해 둔다.
   * @param {Object} player 사용하는 플레이어
   * @param {string} id 아이템 식별자
   * @returns {boolean} 사용했으면 true (직접 쓰는 아이템이 아니거나 쓸 수 없으면 false)
   */
  useItem(player, id) {
    if (!Object.hasOwn(ITEMS, id) || ITEMS[id].use !== 'turn' || !this.consumeItem(player, id)) return false;
    if (ITEMS[id].effect === 'dice') player.loaded = id;
    this.log('log.itemUse', { player: player.id, item: id });
    return true;
  }

  /**
   * 플레이어가 장착한 부적이 지정한 효과의 것이면 그 부적의 정보를 돌려준다.
   * @param {Object} player 플레이어
   * @param {string} effect 효과의 종류 ('double', 'discount', 'toll', 'redraw', 'build')
   * @returns {Object|null} 부적의 정보. 그 효과의 부적을 장착하지 않았으면 null
   */
  charmOf(player, effect) {
    let charm = isCharm(player.charm) ? CHARMS[player.charm] : null;
    return charm && charm.effect === effect ? charm : null;
  }

  /**
   * 주어진 확률로 일어나는 일이 이번에 일어나는지 정한다. (부적의 효과에 쓴다.)
   * @param {number} percent 일어날 확률 (%)
   * @returns {boolean} 일어나면 true
   */
  luck(percent) {
    return this.random() * 100 < percent;
  }

  /**
   * 부적의 효과가 일어난 것을 기록하고 연출한다.
   * @param {Object} player 부적을 장착한 플레이어
   * @param {string} key 기록 문구의 키
   * @param {Object} info 일어난 효과 { effect } 와 효과별 값
   * @returns {Promise<void>}
   */
  async charmed(player, key, info) {
    let params = { player: player.id, item: player.charm };
    // 기록 문구에 쓰는 값(칸, 건물, 쿠폰, 할인율)만 옮겨 담는다.
    for (let name of ['tile', 'building', 'coupon', 'percent']) {
      if (info[name] !== undefined) params[name] = info[name];
    }
    this.log(key, params);
    await this.call('charm', player, { ...info, charm: player.charm });
  }

  /**
   * 땅을 살 때 실제로 낼 금액을 정한다. 할인 부적을 장착했으면 그 확률로 땅값을 깎아 준다.
   * 살 수 있는지는 할인 전 가격으로 따지므로, 이 함수는 사기로 정한 뒤에 부른다.
   * @param {Object} player 사는 플레이어
   * @param {number} index 땅의 칸 번호
   * @param {number} price 할인 전 가격 (원)
   * @returns {Promise<number>} 실제로 낼 금액 (원)
   */
  async discounted(player, index, price) {
    let charm = this.charmOf(player, 'discount');
    if (!charm || !this.luck(charm.chance)) return price;
    let paid = price - Math.floor((price * charm.percent) / 100);
    await this.charmed(player, 'log.charmDiscount', { effect: 'discount', tile: index, index, percent: charm.percent, price, paid });
    return paid;
  }

  /**
   * 다른 플레이어에게 통행료·이용료로 실제로 낼 금액을 정한다. 통행료 할인 부적을 장착했으면 그 확률로 금액을 깎아 준다.
   * 낼 돈이 모자라 땅을 매각해야 하는지는 깎인 금액으로 따지므로, 이 함수는 지불하기 전에(우대권 사용 여부를 묻기 전에) 부른다.
   * 땅 구매와 건물 건설, 사회복지기금, 은행에 내는 돈에는 쓰지 않는다.
   * @param {Object} player 지불하는 플레이어
   * @param {number} index 돈을 낼 칸 번호
   * @param {number} amount 할인 전 금액 (원)
   * @returns {Promise<number>} 실제로 낼 금액 (원)
   */
  async tollCut(player, index, amount) {
    let charm = this.charmOf(player, 'toll');
    if (!charm || amount <= 0 || !this.luck(charm.chance)) return amount;
    let paid = amount - Math.floor((amount * charm.percent) / 100);
    await this.charmed(player, 'log.charmToll', { effect: 'toll', tile: index, index, percent: charm.percent, price: amount, paid });
    return paid;
  }

  /**
   * 건물 부적을 장착했으면 그 확률로 건물 한 채를 무료로 짓는다. 건물을 지을 수 있는 땅에서, 그 건물이 아직 없을 때에만 적용된다.
   * 땅을 막 샀을 때 적용되며, 부적에 따라서는 자기 땅에 다시 도착했을 때에도 적용된다.
   * 어떤 건물을 얼마의 확률로 지어 주는지는 코스마다 다르므로 gift 가 정한다. (세계여행 코스는 부적에 적힌 건물, 우주여행 코스는 기지)
   * @param {Object} player 땅의 주인인 플레이어
   * @param {number} index 땅의 칸 번호
   * @param {boolean} revisit 막 산 것이 아니라 자기 땅에 다시 도착한 것인지 여부
   * @returns {Promise<void>}
   */
  async grantBuilding(player, index, revisit) {
    let charm = this.charmOf(player, 'build');
    let gift = charm ? this.gift(charm, index) : null;
    let land = this.state.lands[index];
    if (!gift || (revisit && !charm.revisit) || land[gift.building] > 0) return;
    if (!this.luck(gift.chance)) return;
    land[gift.building]++;
    await this.charmed(player, 'log.charmBuild', { effect: 'build', tile: index, index, building: gift.building });
  }

  /**
   * 건물 부적이 이 땅에 지어 줄 건물과 그 확률을 구한다. 건물의 종류가 코스마다 다르므로 코스별 엔진이 재정의한다.
   * @param {HellmarbleCharm} charm 장착한 건물 부적
   * @param {number} index 땅의 칸 번호
   * @returns {{building: string, chance: number}|null} 지어 줄 건물의 종류와 확률(%). 이 땅에 적용되지 않으면 null (여기에서는 언제나 null 이다.)
   */
  gift(charm, index) {
    void charm;
    void index;
    return null;
  }

  /**
   * 카드(비밀쿠폰, 텔레파시 카드, 뉴런의 골짜기 카드)가 뽑은 플레이어에게 바로 손해가 되는지 확인한다.
   * 돈을 내거나 땅이나 기지를 잃거나 갇히는 카드가 해당하며, 건물이나 기지, 별이 없어 낼 돈이나 잃을 것이 없으면 손해가 아니다.
   * @param {Object} player 카드를 뽑는 플레이어
   * @param {string} id 카드 식별자
   * @returns {boolean} 손해가 되면 true
   */
  harms(player, id) {
    let found = findCard(id);
    let card = found ? found.card : null;
    if (!card || !card.harm) return false;
    return this.hurts(player, card);
  }

  /**
   * 손해가 되는 카드로 표시된 카드(harm)가 지금 이 플레이어에게 실제로 손해가 되는지 확인한다.
   * 낼 돈이나 잃을 것이 없으면 손해가 아닌 카드가 있으며, 그런 카드는 코스마다 다르므로 코스별 엔진이 재정의한다.
   * @param {Object} player 카드를 뽑는 플레이어
   * @param {HellmarbleCoupon} card 카드 정보
   * @returns {boolean} 손해가 되면 true (여기에서는 언제나 true 이다.)
   */
  hurts(player, card) {
    void player;
    void card;
    return true;
  }

  /**
   * 주사위 두 개를 굴린다. 주사위 조작형 아이템을 쓴 상태이면 그 아이템의 눈만 나오도록 바꾼다.
   * 굴려 나온 눈을 아이템의 눈 세 가지에 차례로 대응시키므로, 빅 다이즈는 1, 2, 3 이 4, 5, 6 으로, 스몰 다이즈는 4, 5, 6 이 1, 2, 3 으로 바뀐다.
   * 아이템의 효과는 이 한 번의 굴림으로 끝난다.
   * 더블 부적을 장착했으면 더블이 나올 확률이 부적의 값만큼 높아진다. 더블이 아닌 눈이 나왔을 때 일정한 확률로 둘째 주사위를 첫째와 같게 맞추며,
   * 그 확률은 원래 더블이 아닐 확률로 나눈 값이어서 전체 더블 확률이 정확히 부적의 값만큼 늘어난다.
   * 더블이 도움이 되지 않는 굴림(우주여행 코스에서 눈의 합만 따지는 시간여행의 굴림, 블랙홀에서 3턴 째에 풀려난 뒤의 굴림)에서는 부적의 효과를 따지지 않는다.
   * @param {Object} player 굴리는 플레이어
   * @param {boolean} [plain=false] 더블 부적의 효과를 따지지 않을지 여부
   * @returns {{dice: number[], faces: number[]|null, lucky: boolean}} 두 주사위의 눈, 아이템이 적용되었으면 그 주사위의 눈 목록, 부적 때문에 더블이 되었는지 여부
   */
  throwDice(player, plain = false) {
    let faces = player.loaded && ITEMS[player.loaded] ? ITEMS[player.loaded].faces : null;
    let charm = plain ? null : this.charmOf(player, 'double');
    let dice = [this.rollDie(), this.rollDie()];
    let sides = faces ? faces.length : 6;
    let lucky = false;
    player.loaded = null;
    // 아이템이 적용된 주사위는 두 개 모두 그 아이템의 눈으로 바꾼다.
    for (let index = 0; faces && index < dice.length; index++) dice[index] = faces[(dice[index] - 1) % faces.length];
    if (charm && dice[0] !== dice[1] && this.luck(charm.chance / (1 - 1 / sides))) {
      dice[1] = dice[0];
      lucky = true;
    }
    return { dice, faces, lucky };
  }

  /**
   * 플레이어가 가진 땅의 칸 번호 목록을 구한다.
   * @param {Object} player 플레이어
   * @returns {number[]} 칸 번호 목록
   */
  owned(player) {
    let list = [];
    // 모든 칸을 살펴 이 플레이어가 소유한 땅을 모은다.
    for (let index = 0; index < BOARD_SIZE; index++) {
      let land = this.state.lands[index];
      if (land && land.owner === player.id) list.push(index);
    }
    return list;
  }

  /**
   * 플레이어가 가진 땅과 건물의 가치(100%) 합을 구한다.
   * @param {Object} player 플레이어
   * @returns {number} 땅과 건물의 가치 (원)
   */
  propertyValue(player) {
    let total = 0;
    // 가진 땅의 가치를 모두 더한다.
    for (let index of this.owned(player)) total += this.value(index);
    return total;
  }

  /**
   * 플레이어의 총 자산(현금 + 땅과 건물의 가치 100%)을 구한다. 승리 시 얻는 금액이다.
   * @param {Object} player 플레이어
   * @returns {number} 총 자산 (원)
   */
  assets(player) {
    return player.cash + this.propertyValue(player);
  }

  /**
   * 플레이어가 땅을 모두 매각했을 때 마련할 수 있는 돈(현금 + 매각 금액)을 구한다.
   * @param {Object} player 플레이어
   * @returns {number} 마련할 수 있는 돈 (원)
   */
  liquidation(player) {
    let total = player.cash;
    // 가진 땅의 매각 금액을 모두 더한다.
    for (let index of this.owned(player)) total += this.saleValue(index);
    return total;
  }

  /**
   * 패배하지 않은 다른 플레이어의 목록을 구한다.
   * @param {Object} player 기준이 되는 플레이어
   * @returns {Object[]} 다른 플레이어 목록 (플레이어 번호 순서)
   */
  rivals(player) {
    let list = [];
    // 자신을 뺀 생존 플레이어를 모은다.
    for (let rival of this.state.players) {
      if (rival.alive && rival.id !== player.id) list.push(rival);
    }
    return list;
  }

  /**
   * 땅의 목록에서 가치(땅값과 건설비의 합)가 가장 낮거나 가장 높은 땅을 찾는다. 가치가 같으면 칸 번호가 낮은 쪽을 고른다.
   * @param {number[]} list 칸 번호 목록
   * @param {boolean} dearest 가장 비싼 땅을 찾으면 true, 가장 싼 땅을 찾으면 false
   * @returns {number} 찾은 땅의 칸 번호 (목록이 비어 있으면 -1)
   */
  extreme(list, dearest) {
    let best = -1;
    // 목록의 땅을 하나씩 견주어 가치가 가장 낮은(또는 높은) 땅을 찾는다.
    for (let index of list) {
      if (best < 0 || (dearest ? this.value(index) > this.value(best) : this.value(index) < this.value(best))) best = index;
    }
    return best;
  }

  /**
   * 플레이어가 이 땅을 가질 수 있는지 확인한다. 가질 수 없는 땅은 사지 못하며, 인공지능도 그런 땅은 사러 가지 않는다.
   * 가질 수 있는 땅을 제한하는 규칙이 있는 코스는 코스별 엔진이 재정의한다. (우주여행 코스의 견우성과 직녀성)
   * @param {Object} player 플레이어
   * @param {number} index 땅의 칸 번호
   * @returns {boolean} 가질 수 있으면 true (여기에서는 제한이 없어 언제나 true 이다.)
   */
  canOwn(player, index) {
    void player;
    void index;
    return true;
  }

  /**
   * 이 땅에 지금 지을 차례가 된 건물의 종류를 구한다. 돈과 최대 개수는 따지지 않는다. (그것은 buildOptions 가 따진다.)
   * 여기에서는 그 코스의 건물 전부이며, 먼저 지어야 하는 건물이 있는 코스는 코스별 엔진이 재정의한다. (우주여행 코스 : 기지가 있어야 증축할 수 있다.)
   * @param {number} index 칸 번호
   * @returns {string[]} 건물 종류 목록
   */
  buildKinds(index) {
    void index;
    return this.course.buildings;
  }

  /**
   * 플레이어가 지금 이 땅에 지을 수 있는 건물의 종류를 구한다. (지을 차례가 된 건물 가운데 최대 개수 미만이고 돈이 충분한 것)
   * 세계여행 코스의 일반 도시에는 별장, 빌딩, 호텔을, 우주여행 코스의 별에는 기지를, 기지가 있는 별에는 증축을 할 수 있다.
   * @param {Object} player 플레이어
   * @param {number} index 칸 번호
   * @returns {string[]} 지을 수 있는 건물 종류 목록
   */
  buildOptions(player, index) {
    let options = [];
    let land = this.state.lands[index];
    if (!this.board[index].cost || !land || land.owner !== player.id) return options;
    // 건물 종류별로 지을 수 있는지 확인한다.
    for (let kind of this.buildKinds(index)) {
      if (land[kind] < BUILD_LIMIT[kind] && player.cash >= this.buildCost(index, kind)) options.push(kind);
    }
    return options;
  }

  /**
   * 진행 기록을 남기고 화면을 갱신하도록 알린다.
   * @param {string} key 기록 문구의 키
   * @param {Object} [params] 기록에 담을 값 (player, target : 플레이어 번호 / tile : 칸 번호 / amount : 금액 등)
   */
  log(key, params) {
    let logs = this.state.logs;
    logs.push({ key, params: params || {} });
    if (logs.length > LOG_LIMIT) logs.splice(0, logs.length - LOG_LIMIT);
    this.host.update(this);
  }

  /**
   * 게임 진행을 중단시킨다. 진행 중이던 차례는 다음 연출 시점에서 멈춘다.
   */
  stop() {
    this.stopped = true;
  }

  /**
   * 호스트의 연출 또는 입력 기능을 호출한다. 중단된 게임이면 진행을 멈춘다.
   * @param {string} name 호출할 호스트의 메소드 이름
   * @param {...*} args 메소드에 넘길 값
   * @returns {Promise<*>} 호스트가 돌려준 값
   */
  async call(name, ...args) {
    if (this.stopped) throw STOP;
    let result = await this.host[name](...args);
    if (this.stopped) throw STOP;
    return result;
  }

  /**
   * 플레이어에게 선택을 요청한다. 인공지능이면 스스로 판단하고, 사람이면 호스트에게 묻는다.
   * @param {Object} player 선택할 플레이어
   * @param {Object} request 선택할 내용
   * @returns {Promise<*>} 선택 결과
   */
  async decide(player, request) {
    if (player.ai) {
      await this.call('think', player, request);
      return this.ai.decide(player, request);
    }
    return this.call('ask', player, request, this);
  }

  /**
   * 돈이 오간 것을 호스트가 연출하도록 알린다. 오간 돈이 없으면 알리지 않는다.
   * 돈은 이미 옮겨진 뒤에 부르며, 연출이 끝난 뒤에 진행 기록을 남겨 화면의 금액이 지폐가 도착한 다음에 바뀌게 한다.
   * @param {Object|string} payer 돈을 낸 쪽 (플레이어, 은행이면 BANK, 사회복지기금 본부이면 FUND)
   * @param {Object|string} receiver 돈을 받은 쪽 (플레이어, 은행이면 BANK, 사회복지기금 본부이면 FUND)
   * @param {number} amount 오간 금액 (원)
   * @returns {Promise<void>}
   */
  async handover(payer, receiver, amount) {
    if (amount > 0) await this.call('transfer', payer, receiver, amount);
  }

  /**
   * 플레이어가 은행에서 돈을 받는다.
   * @param {Object} player 플레이어
   * @param {number} amount 받을 금액 (원)
   * @returns {Promise<void>}
   */
  async gain(player, amount) {
    player.cash += amount;
    await this.handover(BANK, player, amount);
    this.log('log.gain', { player: player.id, amount });
  }

  /**
   * 땅을 주인 없는 빈 땅으로 되돌린다. 지어진 건물도 모두 없앤다. (매각, 반납, 패배한 플레이어의 땅)
   * @param {number} index 땅의 칸 번호
   */
  vacate(index) {
    let land = this.state.lands[index];
    land.owner = null;
    // 지어진 건물을 모두 없앤다.
    for (let kind of this.course.buildings) land[kind] = 0;
  }

  /**
   * 사건을 호스트가 잠깐 크게 알리도록 한 뒤 진행 기록에 남긴다. (우주여행 코스에서 별을 빼앗거나 교환하거나 반납하는 일처럼 눈에 띄어야 하는 일에 쓴다.)
   * 상태는 이미 바뀐 뒤에 부르며, 알림이 끝난 뒤에 진행 기록을 남긴다.
   * @param {string} key 문구의 키
   * @param {Object} params 문구에 담을 값
   * @returns {Promise<void>}
   */
  async announce(key, params) {
    await this.call('notice', { key, params });
    this.log(key, params);
  }

  /**
   * 땅을 건물과 함께 은행에 매각한다. 매각 후에는 아무도 소유하지 않은 땅이 된다.
   * 은행에서 매각 대금이 들어오는 연출은 부르는 쪽에서 요청한다.
   * @param {Object} player 매각하는 플레이어
   * @param {number} index 매각할 땅의 칸 번호
   * @param {number} percent 돌려받는 비율 (%)
   * @returns {number} 돌려받은 금액 (원)
   */
  sell(player, index, percent) {
    let amount = Math.floor((this.value(index) * percent) / 100);
    this.vacate(index);
    player.cash += amount;
    this.log(percent === HALF_PERCENT ? 'log.halfsale' : 'log.sell', { player: player.id, tile: index, amount });
    return amount;
  }

  /**
   * 지불할 돈이 모자랄 때 땅을 매각하여 돈을 마련한다.
   * 모두 매각해도 모자라면 전부 매각하고, 그렇지 않으면 돈이 마련될 때까지 매각할 땅을 선택받는다.
   * 은행에서 들어오는 매각 대금은, 전부 매각할 때에는 합친 금액을 한 번에, 골라서 매각할 때에는 한 곳씩 연출한다.
   * @param {Object} player 플레이어
   * @param {number} amount 지불해야 할 금액 (원)
   * @returns {Promise<boolean>} 지불 재원을 마련했으면 true, 포기했으면 false
   */
  async raise(player, amount) {
    if (this.liquidation(player) < amount) {
      let total = 0;
      this.log('log.sellAll', { player: player.id });
      // 가진 땅을 모두 매각한다.
      for (let index of this.owned(player)) total += this.sell(player, index, SELL_PERCENT);
      await this.handover(BANK, player, total);
      return true;
    }
    // 지불할 돈이 마련될 때까지 매각할 땅을 선택받는다.
    while (player.cash < amount) {
      let owned = this.owned(player);
      let answer = await this.decide(player, { type: 'sell', amount });
      if (answer === FORFEIT) {
        await this.bankrupt(player, true);
        return false;
      }
      let choice = Number(answer);
      await this.handover(BANK, player, this.sell(player, owned.includes(choice) ? choice : owned[0], SELL_PERCENT));
    }
    return true;
  }

  /**
   * 플레이어가 돈을 지불한다. 모자라면 땅을 매각하며, 그래도 모자라면 남은 돈만 내고 파산한다.
   * 낸 돈이 있으면 받는 쪽(다른 플레이어 또는 은행)으로 돈이 가는 모습을 연출한다.
   * @param {Object} player 지불하는 플레이어
   * @param {number} amount 지불할 금액 (원)
   * @param {Object|null} creditor 돈을 받는 플레이어 (은행이면 null)
   * @returns {Promise<boolean>} 전액을 지불했으면 true, 파산했으면 false
   */
  async pay(player, amount, creditor) {
    if (amount <= 0) return true;
    if (player.cash < amount && !(await this.raise(player, amount))) return false;
    let paid = Math.min(player.cash, amount);
    player.cash -= paid;
    if (creditor) creditor.cash += paid;
    await this.handover(player, creditor || BANK, paid);
    if (paid === amount) return true;
    this.log('log.partial', { player: player.id, amount: paid });
    await this.bankrupt(player);
    return false;
  }

  /**
   * 플레이어가 은행에 돈을 지불한다.
   * @param {Object} player 지불하는 플레이어
   * @param {number} amount 지불할 금액 (원)
   * @returns {Promise<boolean>} 전액을 지불했으면 true, 파산했으면 false
   */
  async payBank(player, amount) {
    if (amount <= 0) {
      this.log('log.nothing', { player: player.id });
      return true;
    }
    let paid = await this.pay(player, amount, null);
    if (paid) this.log('log.payBank', { player: player.id, amount });
    return paid;
  }

  /**
   * 우대권 또는 무전기 요청의 답을, 실제로 쓸 수 있는 것으로 가린다.
   * true 는 비밀쿠폰의 것을 쓰겠다는 답으로 본다. (예 / 아니오로 답하는 호스트와 인공지능을 위한 것이다.)
   * @param {*} answer 요청에 대한 답
   * @param {boolean} coupon 비밀쿠폰의 것을 쓸 수 있는지 여부
   * @param {boolean} item 아이템의 것을 쓸 수 있는지 여부
   * @returns {string|null} 'coupon', 'item', 쓰지 않으면 null
   */
  sourceOf(answer, coupon, item) {
    if ((answer === true || answer === 'coupon') && coupon) return 'coupon';
    if (answer === 'item' && item) return 'item';
    return null;
  }

  /**
   * 다른 플레이어의 땅에 대한 통행료·이용료를 지불한다. 내기 전에 그 코스의 방법으로 면제받을 수 있으면 사용 여부를 확인한다. (waive)
   * 통행료 할인 부적의 효과는 그보다 먼저 따져서, 면제받을지 물을 때와 돈이 모자라 땅을 매각할 때 모두 깎인 금액을 기준으로 한다.
   * 면제 상태(exempt)이면 묻지도 내지도 않는다. (세계여행 코스에서 우대권을 쓴 뒤 같은 굴림 안에서 이어지는 통행료)
   * @param {Object} player 지불하는 플레이어
   * @param {number} index 통행료를 낼 땅의 칸 번호
   * @returns {Promise<boolean>} 파산하지 않았으면 true
   */
  async payToll(player, index) {
    let owner = this.state.players[this.state.lands[index].owner];
    let amount = this.toll(index);
    if (this.exempt) {
      this.log('log.exempt', { player: player.id, tile: index, amount });
      return true;
    }
    amount = await this.tollCut(player, index, amount);
    if (await this.waive(player, index, amount)) return true;
    let paid = await this.pay(player, amount, owner);
    if (paid) this.log(this.course.logs.toll, { player: player.id, target: owner.id, tile: index, amount });
    return paid;
  }

  /**
   * 내야 할 통행료·이용료를 면제받을지 플레이어에게 확인하고, 면제받기로 하면 그 처리를 한다.
   * 면제받는 방법이 코스마다 다르므로 코스별 엔진이 재정의한다. (세계여행 코스의 우대권, 우주여행 코스의 천사의 빛)
   * @param {Object} player 지불하는 플레이어
   * @param {number} index 돈을 낼 땅의 칸 번호
   * @param {number} amount 내야 할 금액 (원)
   * @returns {Promise<boolean>} 면제받았으면 true (여기에서는 면제받을 방법이 없어 언제나 false 이다.)
   */
  async waive(player, index, amount) {
    void player;
    void index;
    void amount;
    return false;
  }

  /**
   * 플레이어를 파산 또는 포기 처리한다. 남은 땅은 은행으로, 보관하던 쿠폰은 덱 맨 뒤로 돌아간다.
   * 패배 처리를 마친 뒤 호스트가 패배를 연출하도록 알리고, 연출이 끝난 뒤에 진행 기록을 남긴다.
   * @param {Object} player 파산한 플레이어
   * @param {boolean} [voluntary=false] 포기로 인한 패배인지 여부
   * @returns {Promise<void>}
   */
  async bankrupt(player, voluntary = false) {
    player.alive = false;
    player.boarded = false;
    player.direct = false;
    player.island = 0;
    // 남아 있는 땅과 건물을 모두 은행으로 돌려보낸다.
    for (let index of this.owned(player)) this.vacate(index);
    // 보관하던 쿠폰을 종류별로 덱 맨 뒤로 돌려보낸다.
    for (let id in player.coupons) {
      // 같은 종류의 쿠폰을 한 장씩 덱으로 옮긴다.
      while (player.coupons[id] > 0) {
        player.coupons[id]--;
        this.state.deck.push(id);
      }
    }
    await this.call('defeat', player, voluntary);
    this.log(voluntary ? 'log.forfeit' : 'log.bankrupt', { player: player.id });
  }

  /**
   * 출발지에 닿은 플레이어가 은행에서 월급을 받는다.
   * @param {Object} player 플레이어
   * @returns {Promise<void>}
   */
  async paySalary(player) {
    let amount = this.salary;
    player.cash += amount;
    await this.handover(BANK, player, amount);
    this.log('log.salary', { player: player.id, amount });
  }

  /**
   * 말을 앞으로 한 칸씩 이동시킨다. 출발지에 닿으면 그 칸에 선 모습을 보여준 뒤에 월급을 받는다.
   * @param {Object} player 이동할 플레이어
   * @param {number} steps 이동할 칸 수
   * @param {boolean} fast 빠른 이동 여부
   * @param {boolean} salary 출발지에서 월급을 받는지 여부
   * @returns {Promise<void>}
   */
  async moveBy(player, steps, fast, salary) {
    // 정해진 칸 수만큼 한 칸씩 전진한다.
    for (let count = 0; count < steps; count++) {
      player.position = (player.position + 1) % BOARD_SIZE;
      await this.call('step', player, fast);
      if (player.position === this.course.start && salary) await this.paySalary(player);
    }
  }

  /**
   * 말을 지정한 칸까지 앞으로(진행 방향으로) 빠르게 이동시킨다.
   * @param {Object} player 이동할 플레이어
   * @param {number} target 도착할 칸 번호
   * @param {boolean} salary 출발지에서 월급을 받는지 여부
   * @returns {Promise<void>}
   */
  async moveTo(player, target, salary) {
    await this.moveBy(player, (target - player.position + BOARD_SIZE) % BOARD_SIZE, true, salary);
  }

  /**
   * 말을 뒤로 한 칸씩 빠르게 이동시킨다. 뒤로 갈 때에는 월급을 받지 않는다.
   * @param {Object} player 이동할 플레이어
   * @param {number} steps 이동할 칸 수
   * @returns {Promise<void>}
   */
  async moveBack(player, steps) {
    // 정해진 칸 수만큼 한 칸씩 후진한다.
    for (let count = 0; count < steps; count++) {
      player.position = (player.position + BOARD_SIZE - 1) % BOARD_SIZE;
      await this.call('step', player, true);
    }
  }

  /**
   * 도착한 칸의 효과를 적용한다. 구매할 수 있는 땅과 주 카드 덱의 칸은 어느 코스에서나 같은 방식으로 처리하고,
   * 그 밖의 칸(갇히는 칸, 탑승하는 칸, 기금이 쌓이는 칸 등)은 코스마다 다르므로 visit 에 맡긴다. 월급은 이동하면서 받으므로 여기에서는 주지 않으며,
   * 출발지에 멈췄을 때의 효과가 있는 코스는 그것도 visit 에서 처리한다. (우주여행 코스 : 지구에 멈추면 기지를 지을 수 있다.)
   * @param {Object} player 도착한 플레이어
   * @returns {Promise<void>}
   */
  async arrive(player) {
    if (!player.alive) return;
    let tile = this.board[player.position];
    if (PROPERTY_TYPES.includes(tile.type)) await this.arriveProperty(player, player.position);
    else if (tile.type === this.course.deck) await this.drawCoupon(player);
    else await this.visit(player, tile);
  }

  /**
   * 그 코스만의 칸에 도착했을 때의 효과를 적용한다. 코스별 엔진이 재정의한다.
   * @param {Object} player 도착한 플레이어
   * @param {HellmarbleTile} tile 도착한 칸
   * @returns {Promise<void>}
   */
  async visit(player, tile) {
    void player;
    void tile;
  }

  /**
   * 구매할 수 있는 땅(도시, 별, 특수 시설)에 도착했을 때의 처리(구매, 건설, 통행료·이용료 지불)를 한다.
   * 부적을 장착했으면 땅을 살 때 할인이나 무료 건물이, 자기 땅에 다시 도착했을 때 무료 건물이 주어질 수 있다.
   * 그 코스의 규칙으로 가질 수 없는 땅(canOwn)이면 사지 못하고, 땅을 산 뒤에는 그 코스만의 후속 처리(acquired)를 한다.
   * @param {Object} player 도착한 플레이어
   * @param {number} index 도착한 칸 번호
   * @returns {Promise<void>}
   */
  async arriveProperty(player, index) {
    let land = this.state.lands[index];
    if (land.owner === null) {
      let price = this.price(index);
      if (!this.canOwn(player, index)) {
        this.log(this.course.logs.barred, { player: player.id, tile: index });
        return;
      }
      if (player.cash >= price && (await this.decide(player, { type: 'buy', index, price }))) {
        let paid = await this.discounted(player, index, price);
        player.cash -= paid;
        land.owner = player.id;
        await this.handover(player, BANK, paid);
        this.log('log.buy', { player: player.id, tile: index, amount: paid });
        await this.grantBuilding(player, index, false);
        await this.acquired(player, index);
      }
      return;
    }
    if (land.owner !== player.id) {
      await this.payToll(player, index);
      return;
    }
    await this.grantBuilding(player, index, true);
    let options = this.buildOptions(player, index);
    if (options.length === 0) return;
    let kind = await this.decide(player, { type: 'build', index, options });
    if (!options.includes(kind)) return;
    let cost = this.buildCost(index, kind);
    let special = this.course.logs.built;
    player.cash -= cost;
    land[kind]++;
    await this.handover(player, BANK, cost);
    this.log(special && special[kind] ? special[kind] : 'log.build', { player: player.id, tile: index, building: kind, amount: cost });
  }

  /**
   * 플레이어가 땅을 사서 주인이 된 뒤에 그 코스만의 후속 처리를 한다. 코스별 엔진이 재정의한다. (우주여행 코스 : 견우성과 직녀성의 주인이 모두 생겼으면 두 주인이 만난다.)
   * @param {Object} player 땅을 산 플레이어
   * @param {number} index 산 땅의 칸 번호
   * @returns {Promise<void>}
   */
  async acquired(player, index) {
    void player;
    void index;
  }

  /**
   * 플레이어를 탑승 상태로 만든다. (세계여행 코스의 우주여행, 우주여행 코스의 시간여행) 탑승한 다음 차례의 진행은 코스별 엔진이 정한다.
   * 보통의 탑승이므로, 주사위 없이 목적지를 고르는 탑승의 표시(direct : 우주여행 코스의 시간여행 초청장)는 지운다.
   * @param {Object} player 탑승할 플레이어
   */
  embark(player) {
    player.boarded = true;
    player.direct = false;
    this.log(this.course.logs.board, { player: player.id });
  }

  /**
   * 쌓인 기금을 모두 받는다. (세계여행 코스의 사회복지기금 본부, 우주여행 코스의 우주조난기지) 쌓인 기금이 없으면 아무 일도 없다.
   * @param {Object} player 도착한 플레이어
   * @returns {Promise<void>}
   */
  async collectFund(player) {
    let amount = this.state.fund;
    if (amount <= 0) return;
    this.state.fund = 0;
    player.cash += amount;
    await this.handover(FUND, player, amount);
    this.log(this.course.logs.fund, { player: player.id, amount });
  }

  /**
   * 그 코스의 주 카드 덱에서 카드를 한 장 뽑아 이행한다. (세계여행 코스의 비밀쿠폰, 우주여행 코스의 텔레파시 카드)
   * @param {Object} player 카드를 뽑는 플레이어
   * @returns {Promise<void>}
   */
  async drawCoupon(player) {
    await this.drawCard(player, this.course.deck);
  }

  /**
   * 카드를 한 장 뽑아 보여준 뒤 내용을 이행한다. (다시 뽑기 부적을 장착했으면 손해가 되는 카드를 건너뛸 수 있다.)
   * 보관하는 카드는 플레이어가 갖고, 그 밖의 카드는 이행 후 그 덱의 맨 뒤로 돌아간다.
   * 이행하는 동안에는 그 카드의 식별자를 기억해 두어, 카드의 효과로 묻는 요청과 기록에 어떤 카드 때문인지 알릴 수 있게 한다.
   * @param {Object} player 카드를 뽑는 플레이어
   * @param {string} name 덱의 이름. 그 코스의 주 카드 덱(COURSES 의 deck : 'coupon' 비밀쿠폰, 'telepathy' 텔레파시 카드)이면 진행 상태의 deck 에서,
   *   다른 이름('neuron' 뉴런의 골짜기 카드)이면 둘째 덱인 valley 에서 뽑는다.
   * @returns {Promise<void>}
   */
  async drawCard(player, name) {
    let second = name !== this.course.deck;
    let deck = second ? this.state.valley : this.state.deck;
    let cards = second ? this.course.valley : this.course.cards;
    let charm = this.charmOf(player, 'redraw');
    if (deck.length === 0) return;
    // 다시 뽑기 부적을 장착했으면, 손해가 되는 카드가 나올 차례일 때마다 그 확률로 카드를 덱 맨 뒤로 보내고 다음 것을 뽑는다.
    for (let tries = 0; charm && tries < deck.length && this.harms(player, deck[0]) && this.luck(charm.chance); tries++) {
      let skipped = deck.shift();
      deck.push(skipped);
      await this.charmed(player, 'log.charmRedraw', { effect: 'redraw', coupon: skipped });
    }
    let id = deck.shift();
    let coupon = cards[id];
    this.log(this.course.logs.draw[name], { player: player.id, coupon: id });
    if (coupon.effect === 'keep') {
      player.coupons[id]++;
      await this.call('coupon', player, id);
      this.log(this.course.logs.keep, { player: player.id, coupon: id });
      return;
    }
    this.drawn.push(id);
    try {
      await this.call('coupon', player, id);
      await this.applyCoupon(player, coupon, id);
    } finally {
      this.drawn.pop();
      deck.push(id);
    }
  }

  /**
   * 카드의 조건이 맞지 않아 아무 일도 일어나지 않았음을 기록한다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {string} id 카드 식별자
   */
  idle(player, id) {
    this.log('log.noEffect', { player: player.id, coupon: id });
  }

  /**
   * 카드(비밀쿠폰, 텔레파시 카드, 뉴런의 골짜기 카드)의 효과를 이행한다.
   * 어느 코스의 카드에나 있는 효과(은행에서 받음, 은행에 냄, 지정한 칸으로 전진, 뒤로 이동)는 여기에서 이행하고, 그 밖의 효과는 applyCard 에 맡긴다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {Object} coupon 카드 정보
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async applyCoupon(player, coupon, id) {
    switch (coupon.effect) {
      case 'gain':
        await this.gain(player, this.money(coupon.amount));
        break;
      case 'pay':
        await this.payBank(player, this.money(coupon.amount));
        break;
      case 'move':
        await this.moveTo(player, this.tiles[coupon.target], true);
        await this.arrive(player);
        break;
      case 'back':
        await this.moveBack(player, coupon.steps);
        await this.arrive(player);
        break;
      default:
        await this.applyCard(player, coupon, id);
        break;
    }
  }

  /**
   * 그 코스의 카드에만 있는 효과를 이행한다. 코스별 엔진이 재정의한다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {Object} coupon 카드 정보
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async applyCard(player, coupon, id) {
    void player;
    void coupon;
    void id;
  }

  /**
   * 카드의 효과로 주사위를 굴린다. (이동하려고 굴리는 것이 아니므로 아이템이나 부적의 효과를 따지지 않는다.)
   * @param {Object} player 굴리는 플레이어
   * @param {number} count 굴릴 주사위의 수 (1 또는 2)
   * @returns {Promise<number>} 나온 눈의 합
   */
  async cast(player, count) {
    let dice = [];
    let sum = 0;
    // 주사위를 정해진 수만큼 굴려 눈을 더한다.
    for (let index = 0; index < count; index++) {
      dice.push(this.rollDie());
      sum += dice[index];
    }
    await this.call('cast', player, dice);
    this.log('log.cast', { player: player.id, n: sum });
    return sum;
  }

  /**
   * 여러 플레이어가 주사위를 1개씩 굴려 눈이 가장 낮은(또는 가장 높은) 한 명을 뽑는다. 그 눈이 여럿이면 모두 다시 굴린다.
   * @param {Object[]} players 주사위를 굴릴 플레이어 목록 (한 명 이상)
   * @param {boolean} highest 눈이 가장 높은 플레이어를 뽑으면 true, 가장 낮은 플레이어를 뽑으면 false
   * @returns {Promise<Object>} 뽑힌 플레이어
   */
  async contest(players, highest) {
    // 한 명으로 정해질 때까지 모두 다시 굴린다.
    while (true) {
      let rolls = [];
      let picked = [];
      // 플레이어마다 주사위를 1개 굴린다.
      for (let rival of players) rolls.push(await this.cast(rival, 1));
      let mark = highest ? Math.max(...rolls) : Math.min(...rolls);
      // 가장 낮은(또는 높은) 눈이 나온 플레이어를 모은다.
      for (let index = 0; index < players.length; index++) {
        if (rolls[index] === mark) picked.push(players[index]);
      }
      if (picked.length === 1) {
        this.log('log.contest', { player: picked[0].id });
        return picked[0];
      }
      this.log('log.castTie', {});
    }
  }

  /**
   * 두 플레이어가 주사위를 1개씩 굴려 눈을 겨룬다.
   * @param {Object} first 첫째 플레이어 (카드를 뽑은 쪽)
   * @param {Object} second 둘째 플레이어
   * @param {boolean} again 눈이 같으면 다시 굴릴지 여부
   * @returns {Promise<number[]>} 두 플레이어의 눈
   */
  async duel(first, second, again) {
    // 승부가 날 때까지(또는 한 번만) 굴린다.
    while (true) {
      let rolls = [await this.cast(first, 1), await this.cast(second, 1)];
      if (!again || rolls[0] !== rolls[1]) return rolls;
      this.log('log.castTie', {});
    }
  }

  /**
   * 플레이어에게 칸 하나를 고르게 한다. 고를 수 있는 칸이 없으면 묻지 않는다.
   * 꼭 골라야 하는 선택에서 올바르지 않은 답이 오면 첫 칸을 고른 것으로 본다.
   * @param {Object} player 고르는 플레이어
   * @param {string} reason 고르는 사유 (blackhole, basereturn, freebase, reunion, earth, valley, lovers, give, take, pascal, moravec, timetravel)
   * @param {number[]} options 고를 수 있는 칸 번호 목록
   * @param {boolean} optional 고르지 않아도 되는지 여부
   * @returns {Promise<number|null>} 고른 칸 번호 (고르지 않았거나 고를 칸이 없으면 null)
   */
  async pick(player, reason, options, optional) {
    if (options.length === 0) return null;
    let card = this.drawn.length > 0 ? this.drawn[this.drawn.length - 1] : null;
    let answer = await this.decide(player, { type: 'pick', reason, options, optional, map: reason === 'moravec' || reason === 'timetravel', card });
    let choice = answer === null || answer === undefined || answer === '' ? NaN : Number(answer);
    if (options.includes(choice)) return choice;
    return optional ? null : options[0];
  }

  /**
   * 말을 지정한 칸까지 앞으로 빠르게 이동시키되, 가는 길에 출발지를 지나도 월급을 주지 않고 출발지에 도착했을 때에만 월급을 준다.
   * (우주여행 코스의 시간여행과 모라비트의 항법)
   * @param {Object} player 이동할 플레이어
   * @param {number} target 도착할 칸 번호
   * @returns {Promise<void>}
   */
  async warp(player, target) {
    await this.moveTo(player, target, false);
    if (target === this.course.start) await this.paySalary(player);
  }

  /**
   * 갇힌 플레이어(무인도, 블랙홀)가 주사위를 굴리기 전에 풀려나는 경우를 처리한다.
   * 어느 코스에서나 갇힌 지 3턴 째(남은 턴이 1)이면 갇힘이 풀린다. 그보다 먼저 탈출하는 방법(무전기, 블랙홀 탈출포트, 천사의 빛)과
   * 풀려난 뒤의 굴림에 붙는 조건(parole)은 코스마다 다르므로 코스별 엔진이 재정의하여 더한다.
   * 이렇게 먼저 풀려난 뒤에 굴리는 주사위는, 조건이 붙지 않았으면 일반 주사위와 같다.
   * @param {Object} player 플레이어
   * @returns {Promise<void>}
   */
  async release(player) {
    if (player.island !== 1) return;
    player.island = 0;
    this.log(this.course.logs.free, { player: player.id });
  }

  /**
   * 한 플레이어의 차례를 진행한다. (주사위 → 이동 → 도착한 칸의 효과)
   * 더블이 나오면 도착한 칸의 처리를 마친 뒤 주사위를 다시 굴리며, 더블이 이어지는 동안 계속 반복한다.
   * 주사위 조작형 아이템의 효과는 그 차례에만 유효하므로, 쓰고도 굴리지 않은 채 차례가 끝나면 사라진다.
   * 탑승한 플레이어의 차례처럼 진행이 다른 차례는 코스별 엔진이 이 메소드나 playStep 을 재정의하여 다룬다.
   * @param {Object} player 차례인 플레이어
   * @returns {Promise<boolean>} 차례를 마쳤으면 true, 메인 메뉴로 나가면 false
   */
  async playTurn(player) {
    this.exempt = false;
    this.bonus = false;
    return this.playRolls(player, false);
  }

  /**
   * 주사위를 굴리는 진행을, 더블이 나오는 동안(또는 카드의 효과로 한 번 더 굴리게 된 동안) 되풀이한다.
   * 보통은 차례의 처음부터 부르며(playTurn), 주사위 없이 이동한 뒤 카드의 효과로 한 번 더 굴리게 된 코스별 진행이 이어서 부르기도 한다.
   * @param {Object} player 차례인 플레이어
   * @param {boolean} again 처음 굴리는 것이 아니라 한 번 더 굴리는 것인지 여부
   * @returns {Promise<boolean>} 차례를 마쳤으면 true, 메인 메뉴로 나가면 false
   */
  async playRolls(player, again) {
    // 더블이 나오는 동안(또는 카드의 효과로 한 번 더 굴리게 된 동안) 주사위를 다시 굴린다.
    do {
      let step = await this.beforeRoll(player, again);
      if (step === QUIT) return false;
      again = step === 'roll' && (await this.playStep(player));
    } while (again);
    player.loaded = null;
    return true;
  }

  /**
   * 주사위를 굴리겠다는 답을 받은 뒤의 한 번의 진행을 한다. 보통은 주사위를 굴려 이동하는 것(playRoll)이며,
   * 굴린 주사위를 다르게 쓰는 차례가 있는 코스는 코스별 엔진이 재정의한다. (우주여행 코스에서 시간여행에 탑승한 차례)
   * @param {Object} player 차례인 플레이어
   * @returns {Promise<boolean>} 주사위를 한 번 더 굴려야 하면 true
   */
  playStep(player) {
    return this.playRoll(player);
  }

  /**
   * 카드의 효과(코페르니쿠스의 지동설)로 주사위를 한 번 더 굴리게 되었는지 확인하고 그 표시를 지운다.
   * 패배했거나 갇혔거나 탑승한 플레이어는 다시 굴리지 않는다.
   * @param {Object} player 차례인 플레이어
   * @returns {boolean} 주사위를 한 번 더 굴려야 하면 true
   */
  takeBonus(player) {
    let bonus = this.bonus;
    this.bonus = false;
    if (!bonus || !player.alive || player.island > 0 || player.boarded) return false;
    this.log('log.bonusRoll', { player: player.id });
    return true;
  }

  /**
   * 주사위를 굴릴 차례인 플레이어의 답을 받는다. 굴리기 전에 쓰겠다고 한 아이템이 있으면 그 효과를 먼저 적용한다.
   * 주사위 조작형 아이템은 쓴 뒤에 다시 묻고, 차례를 끝내는 효과의 아이템(itemEffect : 세계여행 코스의 우주여행 초청장)은 그 효과를 이행한 뒤 차례를 끝낸다.
   * 쓸 수 없는 아이템을 쓰겠다는 답은 주사위를 굴리겠다는 답으로 본다.
   * @param {Object} player 차례인 플레이어
   * @param {boolean} again 더블이 나와 주사위를 한 번 더 굴리는 것인지 여부
   * @returns {Promise<string>} 'roll' (주사위를 굴린다), 'end' (차례가 끝났다), QUIT (메인 메뉴로 나간다)
   */
  async beforeRoll(player, again) {
    // 주사위를 굴리거나 차례를 끝내는 답이 나올 때까지 묻는다.
    while (true) {
      let answer = await this.decide(player, { type: 'roll', again });
      if (answer === QUIT) return QUIT;
      if (answer === FORFEIT) {
        await this.bankrupt(player, true);
        return 'end';
      }
      let id = typeof answer === 'string' && answer.startsWith(ITEM_PREFIX) ? answer.slice(ITEM_PREFIX.length) : '';
      if (!this.useItem(player, id)) return 'roll';
      if (await this.itemEffect(player, id)) return 'end';
    }
  }

  /**
   * 주사위를 굴릴 차례에 직접 쓴 아이템 가운데, 주사위를 굴리는 대신 다른 일을 하고 차례를 끝내는 아이템의 효과를 이행한다.
   * 그런 아이템은 코스마다 다르므로 코스별 엔진이 재정의한다. (주사위 조작형 아이템은 useItem 이 표시해 두고 throwDice 가 적용하므로 여기에서 다루지 않는다.)
   * @param {Object} player 아이템을 쓴 플레이어
   * @param {string} id 아이템 식별자
   * @returns {Promise<boolean>} 효과를 이행하여 차례가 끝났으면 true (여기에서는 그런 아이템이 없어 언제나 false 이다.)
   */
  async itemEffect(player, id) {
    void player;
    void id;
    return false;
  }

  /**
   * 주사위를 한 번 굴려 이동하고 도착한 칸의 효과를 적용한다.
   * 갇힌 채로(무인도, 블랙홀) 굴린 주사위는 더블이어야만 탈출하여 그 눈대로 이동하며, 이 더블로는 다시 굴리지 않는다.
   * 그 밖의 더블은 다시 굴리되, 파산했거나 갇혔거나 탑승한 경우에는 차례가 끝난다.
   * 통행료·이용료의 면제 상태(exempt)는 주사위를 한 번 굴려 진행하는 동안에만 이어진다.
   * 풀려나면서 조건이 붙은 굴림(parole : 우주여행 코스에서 블랙홀에 갇힌 지 3턴 째에 풀려난 굴림)은 더블의 효과가 없고, 이동하기 전에 그 코스의 뒤처리(paroled)를 한다.
   * 카드의 효과(bonus)로 한 번 더 굴리게 된 경우에도 다시 굴린다.
   * @param {Object} player 차례인 플레이어
   * @returns {Promise<boolean>} 더블이 나왔거나 카드의 효과로 주사위를 한 번 더 굴려야 하면 true
   */
  async playRoll(player) {
    this.exempt = false;
    this.bonus = false;
    this.parole = false;
    await this.release(player);
    let trapped = player.island > 0;
    let parole = this.parole;
    let thrown = this.throwDice(player, parole);
    let dice = thrown.dice;
    let double = dice[0] === dice[1];
    this.state.dice = dice;
    await this.call('dice', player, dice, thrown.faces);
    this.log('log.dice', { player: player.id, a: dice[0], b: dice[1], sum: dice[0] + dice[1] });
    if (thrown.lucky) await this.charmed(player, 'log.charmDouble', { effect: 'double' });
    if (trapped && !double) {
      player.island--;
      this.log(this.course.logs.stay, { player: player.id });
      return false;
    }
    if (trapped) {
      player.island = 0;
      this.log(this.course.logs.flee, { player: player.id });
    }
    if (parole) await this.paroled(player, dice);
    await this.moveBy(player, dice[0] + dice[1], false, true);
    await this.arrive(player);
    if (this.takeBonus(player)) return true;
    if (!double || trapped || parole || !player.alive || player.island > 0 || player.boarded) return false;
    this.log('log.double', { player: player.id });
    return true;
  }

  /**
   * 풀려나면서 조건이 붙은 굴림(parole)에서, 주사위를 굴린 뒤 이동하기 전에 그 코스만의 뒤처리를 한다. 코스별 엔진이 재정의한다.
   * (우주여행 코스 : 눈의 합이 모자라면 가진 땅 하나를 반납한다.)
   * @param {Object} player 차례인 플레이어
   * @param {number[]} dice 굴린 두 주사위의 눈
   * @returns {Promise<void>}
   */
  async paroled(player, dice) {
    void player;
    void dice;
  }

  /**
   * 차례를 마무리한다. 승패를 판정하고, 게임이 계속되면 다음 생존 플레이어에게 차례를 넘긴다.
   */
  endTurn() {
    let state = this.state;
    let alive = [];
    let humans = 0;
    let humansAlive = 0;
    // 살아남은 플레이어와 사람 플레이어의 수를 센다.
    for (let player of state.players) {
      if (player.alive) alive.push(player);
      if (!player.ai) humans++;
      if (!player.ai && player.alive) humansAlive++;
    }
    state.turns++;
    if ((humans > 0 && humansAlive === 0) || alive.length <= 1) {
      state.finished = true;
      state.winner = alive.length === 1 ? alive[0].id : null;
      if (state.winner !== null) this.log('log.win', { player: state.winner });
      return;
    }
    // 살아 있는 다음 플레이어를 찾을 때까지 차례를 넘긴다.
    do {
      state.turn = (state.turn + 1) % state.order.length;
    } while (!this.current.alive);
  }

  /**
   * 게임이 끝나거나 사용자가 나갈 때까지 차례를 반복해서 진행한다.
   * @returns {Promise<boolean>} 게임이 끝났으면 true, 도중에 나갔거나 중단되었으면 false
   */
  async run() {
    try {
      // 게임이 끝날 때까지 차례를 반복한다.
      while (!this.state.finished) {
        let player = this.current;
        await this.call('turnStart', player);
        if (!(await this.playTurn(player))) return false;
        this.endTurn();
        await this.call('turnEnd');
      }
      return true;
    } catch (error) {
      if (error === STOP) return false;
      throw error;
    }
  }
}

/**
 * 세계여행 코스의 규칙 엔진이다. 공통 규칙(HellmarbleGame)에 이 코스만의 칸(우주여행, 무인도, 사회복지기금 본부와 접수처)과
 * 비밀쿠폰, 우대권과 무전기, 건물별 통행료·이용료를 더한다.
 */
export class HellmarbleWorldGame extends HellmarbleGame {
  /**
   * 세계여행 코스의 인공지능을 만든다.
   * @returns {HellmarbleWorldAI} 인공지능
   */
  createAI() {
    return new HellmarbleWorldAI(this);
  }

  /**
   * 땅에 도착한 다른 플레이어가 내야 하는 금액을 구한다. 일반 도시는 통행료에 지어진 모든 건물의 이용료를 합산한다.
   * @param {number} index 칸 번호
   * @returns {number} 통행료와 이용료의 합 (원)
   */
  toll(index) {
    let tile = this.board[index];
    let land = this.state.lands[index];
    let total = tile.toll;
    if (tile.type === 'city') {
      // 지어진 건물의 이용료를 종류별로 더한다.
      for (let kind of BUILDINGS) total += tile.fee[kind] * land[kind];
    }
    return this.money(total);
  }

  /**
   * 건물 부적이 이 땅에 지어 줄 건물과 그 확률을 구한다. 일반 도시에서만 적용되며, 부적에 적힌 건물(별장, 빌딩, 호텔)을 부적에 적힌 확률로 지어 준다.
   * @param {HellmarbleCharm} charm 장착한 건물 부적
   * @param {number} index 땅의 칸 번호
   * @returns {{building: string, chance: number}|null} 지어 줄 건물의 종류와 확률(%). 건물을 지을 수 없는 땅이면 null
   */
  gift(charm, index) {
    return this.board[index].type === 'city' ? { building: charm.building, chance: charm.chance } : null;
  }

  /**
   * 손해가 되는 비밀쿠폰이 지금 이 플레이어에게 실제로 손해가 되는지 확인한다. 건물이 없어 낼 돈이 없는 세금 쿠폰과, 팔 땅이 없는 반액대매출은 손해가 아니다.
   * @param {Object} player 쿠폰을 뽑는 플레이어
   * @param {HellmarbleCoupon} card 쿠폰 정보
   * @returns {boolean} 손해가 되면 true
   */
  hurts(player, card) {
    switch (card.effect) {
      case 'tax': return this.taxAmount(player, card.rates) > 0;
      case 'halfsale': return this.owned(player).length > 0;
      default: return true;
    }
  }

  /**
   * 내야 할 통행료·이용료를 우대권으로 면제받을지 확인하고, 쓰기로 한 우대권(비밀쿠폰, 아이템)을 소모한다.
   * 우대권을 쓰면 면제 상태(exempt)가 되어, 같은 굴림 안에서 이어지는 통행료·이용료도 내지 않는다.
   * @param {Object} player 지불하는 플레이어
   * @param {number} index 돈을 낼 땅의 칸 번호
   * @param {number} amount 내야 할 금액 (원)
   * @returns {Promise<boolean>} 우대권을 써서 면제받았으면 true
   */
  async waive(player, index, amount) {
    let choice = await this.choosePass(player, index, amount, false);
    if (choice === 'coupon') {
      player.coupons.pass--;
      this.state.deck.push('pass');
      this.exempt = true;
      await this.call('use', player, { kind: 'pass', source: 'coupon', index, amount, travel: false });
      this.log('log.pass', { player: player.id, tile: index, amount });
      return true;
    }
    if (choice === 'item') {
      this.consumeItem(player, 'pass');
      this.exempt = true;
      await this.call('use', player, { kind: 'pass', source: 'item', index, amount, travel: false });
      this.log('log.itemPass', { player: player.id, tile: index, amount });
      return true;
    }
    return false;
  }

  /**
   * 세계여행 코스만의 칸(우주여행, 무인도, 사회복지기금 본부와 접수처)에 도착했을 때의 효과를 적용한다.
   * @param {Object} player 도착한 플레이어
   * @param {HellmarbleTile} tile 도착한 칸
   * @returns {Promise<void>}
   */
  async visit(player, tile) {
    switch (tile.type) {
      case 'space':
        await this.arriveSpace(player);
        break;
      case 'island':
        player.island = ISLAND_TURNS;
        this.log('log.island', { player: player.id });
        await this.useRadio(player, true);
        break;
      case 'fund':
        await this.collectFund(player);
        break;
      case 'desk':
        await this.payFund(player);
        break;
      default:
        break;
    }
  }

  /**
   * 비밀쿠폰에만 있는 효과(건물별 세금, 무인도 표류, 우주여행 초청장, 항공 여행, 반액대매출)를 이행한다.
   * @param {Object} player 쿠폰을 뽑은 플레이어
   * @param {Object} coupon 쿠폰 정보
   * @param {string} id 쿠폰 식별자
   * @returns {Promise<void>}
   */
  async applyCard(player, coupon, id) {
    void id;
    switch (coupon.effect) {
      case 'tax':
        await this.payBank(player, this.taxAmount(player, coupon.rates));
        break;
      case 'island':
        await this.moveTo(player, this.tiles.island, false);
        await this.arrive(player);
        break;
      case 'space':
        await this.moveTo(player, this.tiles.space, true);
        this.embark(player);
        break;
      case 'air':
        await this.airTravel(player);
        break;
      case 'halfsale':
        await this.halfSale(player);
        break;
      default:
        break;
    }
  }

  /**
   * 주사위를 굴릴 차례에 직접 쓴 아이템 가운데 우주여행 초청장의 효과를 이행한다. 우주여행 칸으로 보내 탑승시키고 차례를 끝낸다.
   * @param {Object} player 아이템을 쓴 플레이어
   * @param {string} id 아이템 식별자
   * @returns {Promise<boolean>} 우주여행 초청장이어서 차례가 끝났으면 true
   */
  async itemEffect(player, id) {
    if (ITEMS[id].effect !== 'space') return false;
    await this.invite(player);
    return true;
  }

  /**
   * 무인도에 갇힌 플레이어가 주사위를 굴리기 전에 풀려나는 경우를 처리한다.
   * 무전기(비밀쿠폰, 아이템)가 있으면 사용 여부를 한 번에 확인하여 즉시 탈출시키고, 3턴 째이면 갇힘을 푼다. (3턴 째에는 어차피 풀려나므로 무전기를 묻지 않는다.)
   * 이렇게 먼저 풀려난 뒤에 굴리는 주사위는 일반 주사위와 같다.
   * @param {Object} player 플레이어
   * @returns {Promise<void>}
   */
  async release(player) {
    if (player.island > 1) await this.useRadio(player, false);
    await super.release(player);
  }

  /**
   * 한 플레이어의 차례를 진행한다. 우주여행에 탑승한 플레이어는 주사위를 굴리지 않고 원하는 칸을 골라 이동하며(playTravel), 그 밖에는 공통의 진행을 따른다.
   * @param {Object} player 차례인 플레이어
   * @returns {Promise<boolean>} 차례를 마쳤으면 true, 메인 메뉴로 나가면 false
   */
  async playTurn(player) {
    if (!player.boarded) return super.playTurn(player);
    this.exempt = false;
    this.bonus = false;
    return this.playTravel(player);
  }

  /**
   * 내야 할 통행료·이용료를 우대권으로 면제받을지 한 번에 묻는다.
   * 비밀쿠폰 우대권과 아이템 우대권을 모두 쓸 수 있으면 한 요청에서 둘 중 하나를 고르게 하고, 쓸 수 있는 것이 없으면 묻지 않는다.
   * 비밀쿠폰 우대권은 우주여행 이용료에는 쓸 수 없다.
   * @param {Object} player 지불하는 플레이어
   * @param {number} index 돈을 낼 칸 번호
   * @param {number} amount 내야 할 금액 (원)
   * @param {boolean} travel 우주여행 이용료인지 여부
   * @returns {Promise<string|null>} 쓰기로 한 우대권 ('coupon' 은 비밀쿠폰, 'item' 은 아이템), 쓰지 않으면 null
   */
  async choosePass(player, index, amount, travel) {
    let coupon = !travel && player.coupons.pass > 0;
    let item = this.canUseItem(player, 'pass');
    if (!coupon && !item) return null;
    return this.sourceOf(await this.decide(player, { type: 'pass', index, amount, travel, coupon, item }), coupon, item);
  }

  /**
   * 무인도에서 무전기로 탈출할지 한 번에 묻고, 쓰기로 한 무전기를 소모하여 갇힘을 푼다.
   * 비밀쿠폰 무전기와 아이템 무전기를 모두 쓸 수 있으면 한 요청에서 둘 중 하나를 고르게 하고, 쓸 수 있는 것이 없으면 묻지 않는다.
   * 무인도에 막 도착했을 때에는 아이템 무전기만 쓸 수 있다. (비밀쿠폰 무전기는 갇힌 뒤 주사위를 굴리기 전에 쓴다.)
   * @param {Object} player 무인도에 있는 플레이어
   * @param {boolean} arrival 무인도에 막 도착한 것인지 여부
   * @returns {Promise<void>}
   */
  async useRadio(player, arrival) {
    let coupon = !arrival && player.coupons.radio > 0;
    let item = this.canUseItem(player, 'radio');
    if (!coupon && !item) return;
    let choice = this.sourceOf(await this.decide(player, { type: 'radio', arrival, coupon, item }), coupon, item);
    if (choice === 'coupon') {
      player.coupons.radio--;
      this.state.deck.push('radio');
      player.island = 0;
      await this.call('use', player, { kind: 'radio', source: 'coupon', arrival });
      this.log('log.radio', { player: player.id });
    }
    if (choice === 'item') {
      this.consumeItem(player, 'radio');
      player.island = 0;
      await this.call('use', player, { kind: 'radio', source: 'item', arrival });
      this.log('log.itemRadio', { player: player.id });
    }
  }

  /**
   * 우주여행 칸에 도착했을 때의 처리를 한다. 콜롬비아 호의 소유자가 남이면 이용료를 내고 탑승한다.
   * @param {Object} player 도착한 플레이어
   * @returns {Promise<void>}
   */
  async arriveSpace(player) {
    let owner = this.state.lands[this.tiles.columbia].owner;
    let spot = this.tiles.space;
    if (owner !== null && owner !== player.id) {
      let amount = await this.tollCut(player, spot, this.money(SPACE_FEE));
      if ((await this.choosePass(player, spot, amount, true)) === 'item') {
        this.consumeItem(player, 'pass');
        await this.call('use', player, { kind: 'pass', source: 'item', index: spot, amount, travel: true });
        this.log('log.itemPass', { player: player.id, tile: spot, amount });
        this.embark(player);
        return;
      }
      if (!(await this.pay(player, amount, this.state.players[owner]))) return;
      this.log('log.spaceFee', { player: player.id, target: owner, amount });
    }
    this.embark(player);
  }

  /**
   * 사회복지기금 접수처에 돈을 낸다. 모자라면 가진 돈만 내며 땅을 팔거나 파산하지 않는다. 낸 돈은 사회복지기금 본부에 쌓인다.
   * @param {Object} player 도착한 플레이어
   * @returns {Promise<void>}
   */
  async payFund(player) {
    let amount = Math.min(player.cash, this.money(WELFARE_FEE));
    player.cash -= amount;
    this.state.fund += amount;
    await this.handover(player, FUND, amount);
    this.log('log.fundPay', { player: player.id, amount });
  }

  /**
   * 건물별로 내야 하는 금액(방범비, 건물수리비, 정기종합소득세)을 계산한다.
   * @param {Object} player 플레이어
   * @param {Object} rates 건물 종류별 1개당 금액 (원)
   * @returns {number} 내야 할 금액 (원)
   */
  taxAmount(player, rates) {
    let total = 0;
    // 가진 땅마다 지어진 건물의 금액을 더한다.
    for (let index of this.owned(player)) {
      // 건물 종류별로 개수만큼 금액을 더한다.
      for (let kind of BUILDINGS) total += rates[kind] * this.state.lands[index][kind];
    }
    return this.money(total);
  }

  /**
   * 항공 여행 쿠폰을 이행한다. 콩코드 여객기 이용료를 낸 뒤 타이페이로 이동한다.
   * @param {Object} player 플레이어
   * @returns {Promise<void>}
   */
  async airTravel(player) {
    let owner = this.state.lands[this.tiles.concorde].owner;
    if (owner !== null && owner !== player.id && !(await this.payToll(player, this.tiles.concorde))) return;
    await this.moveTo(player, this.tiles.taipei, true);
    await this.arrive(player);
  }

  /**
   * 반액대매출 쿠폰을 이행한다. 가진 땅 중 가치(건물 포함)가 가장 높은 곳을 자동으로 골라 50%에 매각한다.
   * @param {Object} player 플레이어
   * @returns {Promise<void>}
   */
  async halfSale(player) {
    let best = -1;
    // 가진 땅 중 가치가 가장 높은 땅을 찾는다.
    for (let index of this.owned(player)) {
      if (best < 0 || this.value(index) > this.value(best)) best = index;
    }
    if (best < 0) {
      this.log('log.nothing', { player: player.id });
      return;
    }
    await this.handover(BANK, player, this.sell(player, best, HALF_PERCENT));
  }

  /**
   * 우주여행 탑승 상태인 플레이어의 차례를 진행한다. 원하는 칸을 골라 이동한다.
   * @param {Object} player 플레이어
   * @returns {Promise<boolean>} 차례를 마쳤으면 true, 메인 메뉴로 나가면 false
   */
  async playTravel(player) {
    let answer = await this.decide(player, { type: 'travel' });
    if (answer === QUIT) return false;
    if (answer === FORFEIT) {
      await this.bankrupt(player, true);
      return true;
    }
    let target = Number(answer);
    if (!Number.isInteger(target) || target < 0 || target >= BOARD_SIZE || target === player.position) target = (player.position + 1) % BOARD_SIZE;
    player.boarded = false;
    this.log('log.travel', { player: player.id, tile: target });
    await this.moveTo(player, target, true);
    await this.arrive(player);
    return true;
  }

  /**
   * 우주여행 초청장 아이템의 효과를 이행한다. 주사위를 굴리지 않고 우주여행 칸으로 이동하여 이용료 없이 탑승한다.
   * 가는 길에 출발지를 지나면 월급을 받으며, 무인도에 갇혀 있었다면 풀려난다.
   * @param {Object} player 초청장을 쓴 플레이어
   * @returns {Promise<void>}
   */
  async invite(player) {
    player.island = 0;
    await this.moveTo(player, this.tiles.space, true);
    this.embark(player);
  }
}

/**
 * 우주여행 코스의 규칙 엔진이다. 공통 규칙(HellmarbleGame)에 이 코스만의 칸(시간여행, 블랙홀, 우주조난기지, 핼리혜성, 뉴런의 골짜기)과
 * 텔레파시 카드, 뉴런의 골짜기 카드, 천사의 빛과 블랙홀 탈출포트, 별과 기지, 견우성과 직녀성의 규칙을 더한다.
 */
export class HellmarbleSpaceGame extends HellmarbleGame {
  /**
   * 우주여행 코스의 인공지능을 만든다.
   * @returns {HellmarbleSpaceAI} 인공지능
   */
  createAI() {
    return new HellmarbleSpaceAI(this);
  }

  /**
   * 저장된 진행 상태가 우주여행 코스만의 규칙에 어긋나지 않는지 확인한다. 견우성과 직녀성은 한 플레이어가 함께 가질 수 없고,
   * 증축은 기지를 키우는 것이므로 기지가 없는 별에는 있을 수 없다.
   * @param {Object} state 게임 진행 상태
   * @returns {boolean} 어긋나지 않으면 true
   */
  static sound(state) {
    let owners = [];
    // 두 별의 주인을 모은다.
    for (let id of LOVERS) owners.push(state.lands[SPACE_TILES[id]].owner);
    // 기지 없이 증축만 있는 땅이 있는지 확인한다.
    for (let land of state.lands) {
      if (land && land.annex > 0 && land.base < 1) return false;
    }
    return owners[0] === null || owners[0] !== owners[1];
  }

  /**
   * 땅에 도착한 다른 플레이어가 내야 하는 금액을 구한다. 기지가 있는 별은 기지가 있을 때의 이용료가 되고(기지가 없을 때의 이용료에 더하지 않는다.),
   * 기지를 증축했으면 증축한 횟수만큼 이용료가 더 오르며, 끝까지 증축했으면 추가로 더 오른다. (ANNEX_BONUS)
   * @param {number} index 칸 번호
   * @returns {number} 이용료 (원)
   */
  toll(index) {
    let tile = this.board[index];
    let land = this.state.lands[index];
    if (tile.type !== 'star' || land.base < 1) return super.toll(index);
    return this.money(tile.fee.base + tile.fee.annex * land.annex + (land.annex >= BUILD_LIMIT.annex ? ANNEX_BONUS : 0));
  }

  /**
   * 이 별에 지금 지을 차례가 된 것을 구한다. 기지가 없으면 기지이고, 기지가 있으면 그 기지의 증축이다.
   * 자기 별에 한 번 도착할 때마다 하나만 지으므로(arriveProperty), 기지를 지은 방문에는 증축하지 못하고 증축도 방문할 때마다 한 번씩만 하게 된다.
   * @param {number} index 칸 번호
   * @returns {string[]} 건물 종류 목록 (기지 또는 증축 하나)
   */
  buildKinds(index) {
    let land = this.state.lands[index];
    return land && land.base > 0 ? ['annex'] : ['base'];
  }

  /**
   * 건물 부적이 이 땅에 지어 줄 건물과 그 확률을 구한다. 우주여행 코스에는 별장, 빌딩, 호텔이 없으므로,
   * 건물 부적의 효과가 별에 기지 하나를 지어 주는 것으로 바뀌며 확률도 부적마다 따로 정해져 있다. (CHARMS 의 base)
   * @param {HellmarbleCharm} charm 장착한 건물 부적
   * @param {number} index 땅의 칸 번호
   * @returns {{building: string, chance: number}|null} 지어 줄 건물(기지)과 확률(%). 기지를 지을 수 없는 땅(타임머신)이면 null
   */
  gift(charm, index) {
    return this.board[index].type === 'star' ? { building: 'base', chance: charm.base } : null;
  }

  /**
   * 손해가 되는 카드가 지금 이 플레이어에게 실제로 손해가 되는지 확인한다. 별이나 기지가 없어 낼 돈이나 잃을 것이 없는 카드와,
   * 돈을 받게 되는 도플러 효과는 손해가 아니다.
   * @param {Object} player 카드를 뽑는 플레이어
   * @param {HellmarbleCoupon} card 카드 정보
   * @returns {boolean} 손해가 되면 true
   */
  hurts(player, card) {
    switch (card.effect) {
      case 'ecology': return this.stars(player).length > 0;
      case 'basepay': return this.bases(player).length > 0;
      case 'basereturn': return this.bases(player).length > 0;
      case 'doppler': return this.leadsStars(player);
      default: return true;
    }
  }

  /**
   * 내야 할 이용료를 천사의 빛으로 면제받을지 확인하고, 쓰기로 하면 소모한다. (우주여행 코스에는 우대권이 없다.)
   * @param {Object} player 지불하는 플레이어
   * @param {number} index 돈을 낼 땅의 칸 번호
   * @param {number} amount 내야 할 금액 (원)
   * @returns {Promise<boolean>} 천사의 빛을 써서 면제받았으면 true
   */
  waive(player, index, amount) {
    return this.useAngel(player, { reason: 'fee', index, amount });
  }

  /**
   * 우주여행 코스만의 칸(지구, 뉴런의 골짜기, 시간여행, 블랙홀, 우주조난기지, 핼리혜성)에 도착했을 때의 효과를 적용한다.
   * 지구(출발지)에는 지나가지 않고 멈췄을 때에만 효과가 있다. 월급과는 따로, 자기 별 하나를 골라 기지를 짓거나(기지가 없는 별) 기지를 한 번 증축할 수 있다. (offerBuild)
   * @param {Object} player 도착한 플레이어
   * @param {HellmarbleTile} tile 도착한 칸
   * @returns {Promise<void>}
   */
  async visit(player, tile) {
    switch (tile.type) {
      case 'start':
        await this.offerBuild(player, 'earth');
        break;
      case 'neuron':
        await this.drawCard(player, 'neuron');
        break;
      case 'timetravel':
        await this.arriveTime(player);
        break;
      case 'blackhole':
        player.island = ISLAND_TURNS;
        player.boarded = false;
        player.direct = false;
        this.log('log.blackhole', { player: player.id });
        await this.useEscape(player, true);
        break;
      case 'rescue':
        await this.arriveRescue(player);
        break;
      case 'halley':
        this.log('log.halley', { player: player.id });
        await this.moveTo(player, this.tiles.mars - 1, false);
        await this.arrive(player);
        break;
      default:
        break;
    }
  }

  /**
   * 플레이어가 별을 사서 주인이 된 뒤의 후속 처리를 한다. 산 별이 견우성이나 직녀성이고 이로써 두 별 모두 주인이 생겼으면 두 주인이 지구에서 만난다.
   * (사기 전에는 그 별에 주인이 없었으므로 두 별 모두 주인이 있는 상태가 아니었다. 그래서 reunite 에 false 를 넘긴다.)
   * @param {Object} player 땅을 산 플레이어
   * @param {number} index 산 땅의 칸 번호
   * @returns {Promise<void>}
   */
  async acquired(player, index) {
    void player;
    if (LOVERS.includes(this.board[index].id)) await this.reunite(false);
  }

  /**
   * 블랙홀에 갇힌 플레이어가 주사위를 굴리기 전에 풀려나는 경우를 처리한다.
   * 블랙홀 탈출포트나 천사의 빛이 있으면 사용 여부를 확인하여 즉시 탈출시킨다. (탈출한 뒤의 주사위는 일반 주사위와 같다.)
   * 쓰지 않은 채 3턴 째가 되면 갇힘은 풀리지만, 이때 굴리는 주사위는 더블의 효과가 없고 눈의 합이 모자라면 땅을 반납해야 한다. (parole 로 표시한다.)
   * @param {Object} player 플레이어
   * @returns {Promise<void>}
   */
  async release(player) {
    if (player.island > 0) await this.useEscape(player, false);
    if (player.island === 1) this.parole = true;
    await super.release(player);
  }

  /**
   * 블랙홀에 갇힌 지 3턴 째에 풀려난 굴림의 뒤처리를 한다. 눈의 합이 SAFE_SUM 보다 작으면 이동하기 전에 가진 땅 하나를 은행에 반납한다.
   * @param {Object} player 차례인 플레이어
   * @param {number[]} dice 굴린 두 주사위의 눈
   * @returns {Promise<void>}
   */
  async paroled(player, dice) {
    if (dice[0] + dice[1] < SAFE_SUM) await this.surrender(player);
  }

  /**
   * 주사위를 굴릴 차례에 직접 쓴 아이템 가운데 시간여행 초청장의 효과를 이행한다. 시간여행 칸으로 보내 탑승시키고 차례를 끝낸다.
   * @param {Object} player 아이템을 쓴 플레이어
   * @param {string} id 아이템 식별자
   * @returns {Promise<boolean>} 시간여행 초청장이어서 차례가 끝났으면 true
   */
  async itemEffect(player, id) {
    if (ITEMS[id].effect !== 'time') return false;
    await this.timeInvite(player);
    return true;
  }

  /**
   * 시간여행 초청장 아이템의 효과를 이행한다. 주사위를 굴리지 않고 시간여행 칸으로 이동하여 이용료 없이 탑승한다.
   * 가는 길에 출발지를 지나면 월급을 받으며, 블랙홀에 갇혀 있었다면 풀려난다.
   * 이렇게 탑승하면 다음 차례에 주사위를 굴리지 않고 곧바로 원하는 칸을 골라 이동한다. (direct 로 표시해 둔다.)
   * @param {Object} player 초청장을 쓴 플레이어
   * @returns {Promise<void>}
   */
  async timeInvite(player) {
    player.island = 0;
    await this.moveTo(player, this.tiles.timetravel, true);
    player.boarded = true;
    player.direct = true;
    this.log('log.timeInvite', { player: player.id });
  }

  /**
   * 한 플레이어의 차례를 진행한다. 시간여행 초청장으로 탑승한 플레이어는 주사위를 굴리지 않고 원하는 칸을 골라 이동하며(playDirect),
   * 도착한 칸의 카드로 주사위를 한 번 더 굴리게 되었으면 보통의 차례처럼 이어서 굴린다. 그 밖에는 공통의 진행을 따른다.
   * (보통의 시간여행 탑승은 주사위를 굴려 목적지를 정하므로 공통의 진행 안에서 playStep 이 처리한다.)
   * @param {Object} player 차례인 플레이어
   * @returns {Promise<boolean>} 차례를 마쳤으면 true, 메인 메뉴로 나가면 false
   */
  async playTurn(player) {
    if (!player.boarded || !player.direct) return super.playTurn(player);
    this.exempt = false;
    this.bonus = false;
    let step = await this.playDirect(player);
    if (step === QUIT) return false;
    return step === 'roll' ? this.playRolls(player, true) : true;
  }

  /**
   * 시간여행 초청장으로 탑승한 플레이어의 차례를 진행한다. 주사위를 굴리지 않고 원하는 칸을 골라 이동한다.
   * 보통의 시간여행과 같이 가는 길에 출발지를 지나도 월급이 없고, 지구에 도착하면 월급을 받는다. 지금 있는 칸은 고를 수 없다.
   * @param {Object} player 플레이어
   * @returns {Promise<string>} 'roll' (도착한 칸의 카드로 주사위를 한 번 더 굴린다), 'end' (차례가 끝났다), QUIT (메인 메뉴로 나간다)
   */
  async playDirect(player) {
    let answer = await this.decide(player, { type: 'travel' });
    if (answer === QUIT) return QUIT;
    if (answer === FORFEIT) {
      await this.bankrupt(player, true);
      return 'end';
    }
    let target = Number(answer);
    if (!Number.isInteger(target) || target < 0 || target >= BOARD_SIZE || target === player.position) target = (player.position + 1) % BOARD_SIZE;
    player.boarded = false;
    player.direct = false;
    this.log('log.timeGo', { player: player.id, tile: target });
    await this.warp(player, target);
    await this.arrive(player);
    return this.takeBonus(player) ? 'roll' : 'end';
  }

  /**
   * 주사위를 굴리겠다는 답을 받은 뒤의 한 번의 진행을 한다. 시간여행에 탑승한 플레이어는 굴린 주사위로 목적지를 정하고(playTimeTravel), 그 밖에는 주사위를 굴려 이동한다.
   * @param {Object} player 차례인 플레이어
   * @returns {Promise<boolean>} 주사위를 한 번 더 굴려야 하면 true
   */
  playStep(player) {
    return player.boarded ? this.playTimeTravel(player) : this.playRoll(player);
  }

  /**
   * 플레이어가 가진 별(우주여행 코스의 행성과 별자리. 특수시설은 뺀다.)의 칸 번호 목록을 구한다.
   * @param {Object} player 플레이어
   * @returns {number[]} 칸 번호 목록
   */
  stars(player) {
    let list = [];
    // 가진 땅 가운데 별만 모은다.
    for (let index of this.owned(player)) {
      if (this.board[index].type === 'star') list.push(index);
    }
    return list;
  }

  /**
   * 플레이어가 가진 별 가운데 기지가 지어진 별의 칸 번호 목록을 구한다.
   * @param {Object} player 플레이어
   * @returns {number[]} 칸 번호 목록
   */
  bases(player) {
    let list = [];
    // 가진 별 가운데 기지가 있는 별만 모은다.
    for (let index of this.stars(player)) {
      if (this.state.lands[index].base > 0) list.push(index);
    }
    return list;
  }

  /**
   * 플레이어가 가진 별 가운데 기지가 아직 없는 별의 칸 번호 목록을 구한다.
   * @param {Object} player 플레이어
   * @returns {number[]} 칸 번호 목록
   */
  bare(player) {
    let list = [];
    // 가진 별 가운데 기지가 없는 별만 모은다.
    for (let index of this.stars(player)) {
      if (this.state.lands[index].base < 1) list.push(index);
    }
    return list;
  }

  /**
   * 플레이어의 별 개수가 다른 모든 플레이어의 별 개수보다 많은지 확인한다. (도플러 효과 카드)
   * @param {Object} player 플레이어
   * @returns {boolean} 다른 모든 플레이어보다 많으면 true
   */
  leadsStars(player) {
    let mine = this.stars(player).length;
    // 별이 같거나 더 많은 다른 플레이어가 하나라도 있으면 가장 많은 것이 아니다.
    for (let rival of this.rivals(player)) {
      if (this.stars(rival).length >= mine) return false;
    }
    return true;
  }

  /**
   * 플레이어가 이 땅을 가질 수 있는지 확인한다. 우주여행 코스의 견우성과 직녀성은 한 플레이어가 함께 가질 수 없다.
   * @param {Object} player 플레이어
   * @param {number} index 땅의 칸 번호
   * @returns {boolean} 가질 수 있으면 true
   */
  canOwn(player, index) {
    let tile = this.board[index];
    if (!LOVERS.includes(tile.id)) return true;
    // 짝이 되는 다른 별을 이미 가지고 있으면 가질 수 없다.
    for (let id of LOVERS) {
      if (id !== tile.id && this.state.lands[this.tiles[id]].owner === player.id) return false;
    }
    return true;
  }

  /**
   * 견우성과 직녀성 모두 주인이 있는지 확인한다. (세계여행 코스에서는 언제나 false 이다.)
   * @returns {boolean} 두 별 모두 주인이 있으면 true
   */
  paired() {
    // 두 별 가운데 하나라도 없거나 주인이 없으면 아니다.
    for (let id of LOVERS) {
      let index = this.tiles[id];
      if (index === undefined || this.state.lands[index].owner === null) return false;
    }
    return true;
  }

  /**
   * 땅의 주인을 주어진 대로 바꾸면 한 플레이어가 견우성과 직녀성을 함께 갖게 되는지 확인한다. (그런 교환이나 빼앗기는 취소된다.)
   * @param {Array<Array>} changes 바꿀 내용의 목록. 항목은 [칸 번호, 새 주인의 플레이어 번호 또는 null] 이다.
   * @returns {boolean} 한 플레이어가 두 별을 함께 갖게 되면 true
   */
  breaksPair(changes) {
    let owners = [];
    // 두 별마다 바뀐 뒤의 주인을 구한다.
    for (let id of LOVERS) {
      let index = this.tiles[id];
      let owner = this.state.lands[index].owner;
      // 이 별의 주인을 바꾸는 내용이 있으면 그 주인으로 본다.
      for (let change of changes) {
        if (change[0] === index) owner = change[1];
      }
      owners.push(owner);
    }
    return owners[0] !== null && owners[0] === owners[1];
  }

  /**
   * 우주여행 코스의 시간여행 칸에 도착했을 때의 처리를 한다. 타임머신의 소유자가 남이면 이용료를 내고 탑승한다.
   * 이용료는 천사의 빛으로 면제받을 수 있다.
   * @param {Object} player 도착한 플레이어
   * @returns {Promise<void>}
   */
  async arriveTime(player) {
    let owner = this.state.lands[this.tiles.timemachine].owner;
    let spot = this.tiles.timetravel;
    if (owner !== null && owner !== player.id) {
      let amount = await this.tollCut(player, spot, this.money(TIME_FEE));
      if (!(await this.useAngel(player, { reason: 'timefee', index: spot, amount }))) {
        if (!(await this.pay(player, amount, this.state.players[owner]))) return;
        this.log('log.timeFee', { player: player.id, target: owner, amount });
      }
    }
    this.embark(player);
  }

  /**
   * 우주여행 코스의 우주조난기지에 도착했을 때의 처리를 한다. 모인 기금이 있으면 모두 받고, 없으면 기금을 낸다.
   * 낼 돈이 모자라면 가진 돈만 내며 땅을 팔거나 파산하지 않는다.
   * @param {Object} player 도착한 플레이어
   * @returns {Promise<void>}
   */
  async arriveRescue(player) {
    if (this.state.fund > 0) {
      await this.collectFund(player);
      return;
    }
    let amount = Math.min(player.cash, this.money(RESCUE_FEE));
    player.cash -= amount;
    this.state.fund += amount;
    await this.handover(player, FUND, amount);
    this.log('log.rescuePay', { player: player.id, amount });
  }

  /**
   * 우주여행 코스의 카드에만 있는 효과를 이행한다. (텔레파시 카드와 뉴런의 골짜기 카드. 은행과 돈이 오가거나 지정한 칸으로 가는 공통 효과는 applyCoupon 이 이행한다.)
   * 효과가 긴 카드는 card 로 시작하는 메소드에 따로 구현한다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {Object} coupon 카드 정보
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async applyCard(player, coupon, id) {
    switch (coupon.effect) {
      case 'bases':
        if (this.bases(player).length === 0) this.idle(player, id);
        else await this.gain(player, this.money(coupon.amount) * this.bases(player).length);
        break;
      case 'basepay':
        await this.payBank(player, this.money(coupon.amount) * this.bases(player).length);
        break;
      case 'ecology':
        await this.payBank(player, this.money(coupon.bare) * this.bare(player).length + this.money(coupon.built) * this.bases(player).length);
        break;
      case 'luckydice':
        await this.gain(player, this.money(coupon.amount) * (await this.cast(player, 1)));
        break;
      case 'rescue':
        await this.moveTo(player, this.tiles.rescue, true);
        if (this.state.fund > 0) await this.collectFund(player);
        else this.log('log.rescueNone', { player: player.id });
        break;
      case 'blackhole':
        await this.moveTo(player, this.tiles.blackhole, false);
        await this.arrive(player);
        break;
      case 'offcourse':
        if (!(await this.payBank(player, this.money(coupon.amount)))) break;
        await this.moveBack(player, coupon.steps);
        await this.arrive(player);
        break;
      case 'reverse':
        await this.cardReverse(player);
        break;
      case 'timetravel':
        await this.moveTo(player, this.tiles.timetravel, false);
        this.embark(player);
        break;
      case 'rob':
        // 다른 플레이어마다 정해진 금액을 받아낸다.
        for (let rival of this.rivals(player)) await this.claim(rival, player, this.money(coupon.amount));
        break;
      case 'lovers': await this.cardLovers(player, id); break;
      case 'party': await this.cardParty(player, coupon, id); break;
      case 'valley': await this.cardValley(player); break;
      case 'machinefix': await this.cardMachineFix(player, coupon, id); break;
      case 'basereturn': await this.cardBaseReturn(player, id); break;
      case 'roundtrip': await this.cardRoundTrip(player); break;
      case 'huygens': await this.cardHuygens(player, coupon); break;
      case 'apollo': await this.cardApollo(player, coupon); break;
      case 'newton': await this.cardNewton(player, id); break;
      case 'freebase': await this.cardFreeBase(player, id, 0); break;
      case 'spectrum': await this.cardFreeBase(player, id, coupon.need); break;
      case 'einstein': await this.cardEinstein(player, id); break;
      case 'psychic': await this.cardPsychic(player, id); break;
      case 'doppler': await this.cardDoppler(player, coupon); break;
      case 'zodiac': await this.cardZodiac(player); break;
      case 'moravec': await this.cardMoravec(player); break;
      case 'copernicus': await this.cardCopernicus(player); break;
      case 'kepler': await this.cardKepler(player, coupon, id); break;
      case 'shapley': await this.cardShapley(player, coupon, id); break;
      case 'humboldt': await this.cardHumboldt(player, id); break;
      case 'mobius': await this.cardMobius(player, id); break;
      case 'contract': await this.cardContract(player, id); break;
      case 'pascal': await this.cardPascal(player, coupon, id); break;
      default:
        break;
    }
  }

  /**
   * 천사의 빛으로 손해를 면할지 묻고, 쓰기로 하면 소모한다. 텔레파시 카드로 보관한 것과 아이템으로 가져온 것을 한 요청에서 고르게 한다.
   * 쓸 수 있는 천사의 빛이 없으면 묻지 않는다. 아이템 천사의 빛은 게임 한 판에 정해진 횟수까지만 쓸 수 있다.
   * @param {Object} player 손해를 입게 된 플레이어
   * @param {Object} info 손해의 내용 { reason : 사유, amount : 손해의 크기(원) } 와 사유별 값
   *   (fee, timefee : index 돈을 낼 칸 / claim : target 돈을 받을 플레이어 번호 / steal : index 빼앗길 별, target 빼앗는 플레이어 번호 /
   *    swap : index 내줄 별, other 받을 별, target 상대 플레이어 번호 / land : index 반납할 땅 / pay, base : 추가 값 없음)
   * @returns {Promise<boolean>} 천사의 빛을 써서 손해를 면했으면 true
   */
  async useAngel(player, info) {
    let coupon = player.coupons.angel > 0;
    let item = this.canUseItem(player, 'angel');
    if (!player.alive || (!coupon && !item)) return false;
    let card = this.drawn.length > 0 ? this.drawn[this.drawn.length - 1] : null;
    let choice = this.sourceOf(await this.decide(player, { type: 'angel', ...info, card, coupon, item }), coupon, item);
    if (!choice) return false;
    if (choice === 'coupon') {
      player.coupons.angel--;
      this.state.deck.push('angel');
    } else {
      this.consumeItem(player, 'angel');
    }
    await this.call('use', player, { kind: 'angel', source: choice, ...info, card });
    if (info.reason === 'fee' || info.reason === 'timefee') this.log(choice === 'coupon' ? 'log.angelFee' : 'log.itemAngelFee', { player: player.id, tile: info.index, amount: info.amount });
    else this.log(choice === 'coupon' ? 'log.angel' : 'log.itemAngel', { player: player.id, coupon: card });
    return true;
  }

  /**
   * 블랙홀에서 블랙홀 탈출포트나 천사의 빛으로 탈출할지 한 번에 묻고, 쓰기로 한 것을 소모하여 갇힘을 푼다.
   * 텔레파시 카드로 보관한 것과 아이템으로 가져온 것을 각각 따로 고를 수 있으며, 쓸 수 있는 것이 없으면 묻지 않는다.
   * 블랙홀에 막 도착했을 때 쓰면 갇히지 않은 채 차례가 끝나고, 갇혀 있는 동안 주사위를 굴리기 전에 쓰면 곧바로 보통 차례처럼 주사위를 굴린다.
   * @param {Object} player 블랙홀에 있는 플레이어
   * @param {boolean} arrival 블랙홀에 막 도착한 것인지 여부
   * @returns {Promise<void>}
   */
  async useEscape(player, arrival) {
    let options = {
      escape: { coupon: player.coupons.escape > 0, item: this.canUseItem(player, 'escape') },
      angel: { coupon: player.coupons.angel > 0, item: this.canUseItem(player, 'angel') },
    };
    if (!options.escape.coupon && !options.escape.item && !options.angel.coupon && !options.angel.item) return;
    let answer = await this.decide(player, { type: 'escape', arrival, last: !arrival && player.island === 1, ...options });
    let parts = typeof answer === 'string' ? answer.split('.') : [];
    let kind = parts[0];
    let source = parts[1];
    if (!Object.hasOwn(options, kind) || options[kind][source] !== true) return;
    if (source === 'coupon') {
      player.coupons[kind]--;
      this.state.deck.push(kind);
    } else {
      this.consumeItem(player, kind);
    }
    player.island = 0;
    await this.call('use', player, { kind, source, arrival, reason: 'escape' });
    if (kind === 'escape') this.log(source === 'coupon' ? 'log.escape' : 'log.itemEscape', { player: player.id });
    else this.log(source === 'coupon' ? 'log.angelEscape' : 'log.itemAngelEscape', { player: player.id });
  }

  /**
   * 다른 플레이어에게서 돈을 받아낸다. (카드의 효과) 내는 쪽은 천사의 빛으로 면제받을 수 있고,
   * 돈이 모자라면 땅을 매각해서라도 내야 하며 그래도 모자라면 남은 돈만 내고 파산한다.
   * @param {Object} debtor 돈을 내는 플레이어
   * @param {Object} creditor 돈을 받는 플레이어
   * @param {number} amount 금액 (원)
   * @returns {Promise<void>}
   */
  async claim(debtor, creditor, amount) {
    if (!debtor.alive || !creditor.alive || amount <= 0) return;
    if (await this.useAngel(debtor, { reason: 'claim', amount, target: creditor.id })) return;
    if (await this.pay(debtor, amount, creditor)) this.log('log.claim', { player: debtor.id, target: creditor.id, amount });
  }

  /**
   * 플레이어에게 자기 별 하나를 골라 기지를 짓거나 기지를 한 번 증축할지 묻고, 고르면 그 비용을 받고 짓는다. (하지 않아도 된다.)
   * 기지가 없는 별을 고르면 기지를 짓고, 기지가 있는 별을 고르면 그 기지를 한 번 증축한다. 둘 가운데 하나만, 한 번만 한다.
   * 그 별에 가지 않고도 짓게 해 주는 것이며, 지구에 도착했을 때와 견우성·직녀성의 두 주인이 지구에서 만났을 때 쓴다.
   * 비용을 낼 수 있고 더 지을 것이 남은 별만 선택지가 되며, 그런 별이 없으면 묻지 않는다. (끝까지 증축한 별은 선택지가 아니다.)
   * @param {Object} player 지을 플레이어
   * @param {string} reason 고르는 사유 (earth : 지구에 도착함, reunion : 견우성과 직녀성의 주인이 만남)
   * @returns {Promise<void>}
   */
  async offerBuild(player, reason) {
    let options = [];
    if (!player.alive) return;
    // 가진 별 가운데 지금 지을 수 있는 것(기지 또는 증축)이 있는 별을 모은다.
    for (let index of this.stars(player)) {
      if (this.buildOptions(player, index).length > 0) options.push(index);
    }
    let index = await this.pick(player, reason, options, true);
    if (index === null) return;
    let kind = this.buildOptions(player, index)[0];
    let cost = this.buildCost(index, kind);
    player.cash -= cost;
    this.state.lands[index][kind]++;
    await this.handover(player, BANK, cost);
    this.log(this.course.logs.built[kind] || 'log.build', { player: player.id, tile: index, building: kind, amount: cost });
  }

  /**
   * 견우성과 직녀성 모두 주인이 새로 생겼으면 두 주인을 지구(출발지)에서 만나게 한다.
   * 두 주인은 곧바로 지구로 이동하여(블랙홀에 갇혀 있어도 탈출한다.) 월급을 받고, 각자 가진 별 가운데 하나를 골라 기지를 짓거나 증축할 수 있다. (비용을 내며, 하지 않아도 된다.)
   * 이것이 곧 지구에 도착했을 때의 건설이므로(offerBuild), 지구에 도착한 효과(visit)를 따로 또 적용하지는 않는다.
   * 땅의 주인이 바뀌는 일을 하기 전에 두 별 모두 주인이 있었는지(met)를 구해 두었다가, 바뀐 뒤에 이 메소드에 넘긴다.
   * @param {boolean} met 주인이 바뀌기 전에 이미 두 별 모두 주인이 있었는지 여부
   * @returns {Promise<void>}
   */
  async reunite(met) {
    let owners = [];
    if (met || !this.paired()) return;
    // 두 별의 주인을 모은다.
    for (let id of LOVERS) owners.push(this.state.players[this.state.lands[this.tiles[id]].owner]);
    await this.announce('log.reunion', { player: owners[0].id, target: owners[1].id });
    // 두 주인을 차례로 지구로 옮기고 월급을 준다.
    for (let owner of owners) {
      owner.island = 0;
      await this.moveTo(owner, this.course.start, false);
      await this.paySalary(owner);
    }
    // 두 주인에게 차례로, 자기 별 가운데 하나에 기지를 짓거나 증축할지 묻는다.
    for (let owner of owners) await this.offerBuild(owner, 'reunion');
  }

  /**
   * 블랙홀에서 3턴 째에 풀려난 뒤 굴린 주사위의 합이 모자라, 가진 땅 하나를 골라 은행에 반납한다. (돌려받는 돈은 없다.)
   * 가진 땅이 없으면 아무 일도 없다.
   * @param {Object} player 플레이어
   * @returns {Promise<void>}
   */
  async surrender(player) {
    let index = await this.pick(player, 'blackhole', this.owned(player), false);
    if (index === null) return;
    this.vacate(index);
    await this.announce('log.surrender', { player: player.id, tile: index });
  }

  /**
   * 텔레파시 카드 "견우와 직녀"를 이행한다. 견우성과 직녀성 가운데 주인이 없고 자신이 가질 수 있는 별 하나를 골라 그곳으로 이동하여 무료로 얻는다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async cardLovers(player, id) {
    let options = [];
    // 두 별 가운데 주인이 없고 가질 수 있는 별을 모은다.
    for (let name of LOVERS) {
      let index = this.tiles[name];
      if (this.state.lands[index].owner === null && this.canOwn(player, index)) options.push(index);
    }
    let index = await this.pick(player, 'lovers', options, false);
    if (index === null) {
      this.idle(player, id);
      return;
    }
    let met = this.paired();
    await this.moveTo(player, index, true);
    this.state.lands[index].owner = player.id;
    await this.announce('log.freeLand', { player: player.id, tile: index });
    await this.reunite(met);
  }

  /**
   * 텔레파시 카드 "우주파티 초대권"을 이행한다. 다른 플레이어 한 명을 골라 화성으로 보낸다. (월급 없음)
   * 보내진 플레이어는 블랙홀에 갇혀 있었어도 풀려나며, 화성에 도착한 것으로 처리한다. (구매, 이용료 지불 등)
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {Object} coupon 카드 정보
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async cardParty(player, coupon, id) {
    let options = [];
    let index = this.tiles[coupon.target];
    // 보낼 수 있는 다른 플레이어의 번호를 모은다.
    for (let rival of this.rivals(player)) options.push(rival.id);
    if (options.length === 0) {
      this.idle(player, id);
      return;
    }
    let answer = await this.decide(player, { type: 'target', reason: 'party', options, index, card: id });
    let choice = answer === null || answer === undefined || answer === '' ? NaN : Number(answer);
    let guest = this.state.players[options.includes(choice) ? choice : options[0]];
    this.log('log.party', { player: player.id, target: guest.id });
    guest.island = 0;
    await this.moveTo(guest, index, false);
    await this.arrive(guest);
  }

  /**
   * 텔레파시 카드 "뉴런의 골짜기"를 이행한다. 원하는 뉴런의 골짜기 칸으로 이동하여(출발지를 지나면 월급을 받는다.) 뉴런의 골짜기 카드를 뽑는다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @returns {Promise<void>}
   */
  async cardValley(player) {
    let options = [];
    // 뉴런의 골짜기 카드 칸을 모은다.
    for (let index = 0; index < BOARD_SIZE; index++) {
      if (this.board[index].type === 'neuron') options.push(index);
    }
    await this.moveTo(player, await this.pick(player, 'valley', options, false), true);
    await this.arrive(player);
  }

  /**
   * 텔레파시 카드 "타임머신 수리"를 이행한다. 타임머신의 주인에게서 수리비를 받는다. 주인이 없으면 은행에서 받고, 자신이 주인이면 아무 일도 없다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {Object} coupon 카드 정보
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async cardMachineFix(player, coupon, id) {
    let owner = this.state.lands[this.tiles.timemachine].owner;
    if (owner === null) await this.gain(player, this.money(coupon.amount));
    else if (owner === player.id) this.idle(player, id);
    else await this.claim(this.state.players[owner], player, this.money(coupon.amount));
  }

  /**
   * 별에 지어진 기지의 값(기지 건설비에 증축한 횟수만큼의 증축 비용을 더한 것)을 구한다. 기지를 잃을 때의 손해의 크기로 쓴다.
   * @param {number} index 별의 칸 번호
   * @returns {number} 기지의 값 (원). 기지가 없으면 0
   */
  baseWorth(index) {
    let land = this.state.lands[index];
    return land.base > 0 ? this.buildCost(index, 'base') + this.buildCost(index, 'annex') * land.annex : 0;
  }

  /**
   * 텔레파시 카드 "우주기지 반납"과 "우주해적 출몰"을 이행한다. 자신의 기지 가운데 하나를 골라 반납한다. 천사의 빛으로 면제받을 수 있다.
   * 증축은 기지를 키운 것이어서 기지와 함께 사라진다. (증축한 기지도 기지 하나이다.)
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async cardBaseReturn(player, id) {
    let options = this.bases(player);
    let least = Infinity;
    if (options.length === 0) {
      this.idle(player, id);
      return;
    }
    // 잃게 되는 기지의 값(증축 비용 포함) 가운데 가장 싼 것을 손해의 크기로 삼는다.
    for (let index of options) least = Math.min(least, this.baseWorth(index));
    if (await this.useAngel(player, { reason: 'base', amount: least })) return;
    let index = await this.pick(player, 'basereturn', options, false);
    this.state.lands[index].base = 0;
    this.state.lands[index].annex = 0;
    await this.announce('log.baseLost', { player: player.id, tile: index });
  }

  /**
   * 텔레파시 카드 "역추진"을 이행한다. 주사위 1개를 굴려 그 눈만큼 뒤로 이동하고, 도착한 칸의 효과를 적용한다.
   * 뒤로 가는 것이므로 지구를 지나거나 지구에 멈춰도 월급은 받지 않는다. (지구에 멈추면 그 칸의 효과인 기지 건설·증축은 할 수 있다.)
   * @param {Object} player 카드를 뽑은 플레이어
   * @returns {Promise<void>}
   */
  async cardReverse(player) {
    let steps = await this.cast(player, 1);
    this.log('log.reverse', { player: player.id, n: steps });
    await this.moveBack(player, steps);
    await this.arrive(player);
  }

  /**
   * 텔레파시 카드 "우주왕복 초대권"을 이행한다. 보드를 한 바퀴 돌아 제자리로 돌아오며, 지구를 지날 때 월급을, 우주조난기지를 지날 때 모인 기금을 받는다.
   * 제자리에 돌아와서는 그 칸의 효과를 다시 적용하지 않는다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @returns {Promise<void>}
   */
  async cardRoundTrip(player) {
    this.log('log.roundtrip', { player: player.id });
    // 보드의 칸 수만큼 한 칸씩 빠르게 전진한다.
    for (let count = 0; count < BOARD_SIZE; count++) {
      player.position = (player.position + 1) % BOARD_SIZE;
      await this.call('step', player, true);
      if (player.position === this.course.start) await this.paySalary(player);
      if (player.position === this.course.fund) await this.collectFund(player);
    }
  }

  /**
   * 뉴런의 골짜기 카드 "하위헌스의 암호문"을 이행한다. 토성으로 가서, 주인이 남이면 주사위 1개씩을 굴려 겨룬다. (눈이 같으면 다시 굴린다.)
   * 자신의 눈이 더 크면 토성을 기지째 빼앗고(주인은 천사의 빛으로 취소할 수 있다.), 주인의 눈이 더 크면 이용료를 낸다.
   * 주인이 없거나 자신이 주인이면 보통 도착한 것처럼 처리한다. (구매 또는 기지 건설)
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {Object} coupon 카드 정보
   * @returns {Promise<void>}
   */
  async cardHuygens(player, coupon) {
    let index = this.tiles[coupon.target];
    let land = this.state.lands[index];
    await this.moveTo(player, index, true);
    if (land.owner === null || land.owner === player.id) {
      await this.arrive(player);
      return;
    }
    let owner = this.state.players[land.owner];
    let rolls = await this.duel(player, owner, true);
    if (rolls[0] < rolls[1]) {
      this.log('log.stealFail', { player: player.id, target: owner.id, tile: index });
      await this.payToll(player, index);
      return;
    }
    if (await this.useAngel(owner, { reason: 'steal', amount: this.value(index), index, target: player.id })) return;
    land.owner = player.id;
    await this.announce('log.steal', { player: player.id, target: owner.id, tile: index });
  }

  /**
   * 뉴런의 골짜기 카드 "아폴로 계획"을 이행한다. 달로 이동하여 보통 도착한 것처럼 처리한 뒤(이용료 지불, 구매 등), 지구로 돌아와 월급을 받는다.
   * 달로 가는 길에 출발지를 지나는 것으로는 월급을 받지 않으며, 달에서 지구로는 뒤로 이동한다.
   * 지구에 멈추는 것이므로 월급을 받은 뒤 지구에 도착한 효과(기지 건설)도 적용한다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {Object} coupon 카드 정보
   * @returns {Promise<void>}
   */
  async cardApollo(player, coupon) {
    await this.moveTo(player, this.tiles[coupon.target], false);
    await this.arrive(player);
    if (!player.alive) return;
    await this.moveBack(player, (player.position - this.course.start + BOARD_SIZE) % BOARD_SIZE);
    await this.paySalary(player);
    await this.arrive(player);
  }

  /**
   * 뉴런의 골짜기 카드 "뉴턴의 만유인력의 법칙"을 이행한다. 진행 방향으로 가장 가까운, 주인이 없는 별로 이동하여(월급 없음) 보통 도착한 것처럼 처리한다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async cardNewton(player, id) {
    // 현재 위치의 다음 칸부터 한 바퀴를 살펴 처음 만나는 주인 없는 별로 간다.
    for (let step = 1; step < BOARD_SIZE; step++) {
      let index = (player.position + step) % BOARD_SIZE;
      if (this.board[index].type !== 'star' || this.state.lands[index].owner !== null) continue;
      await this.moveTo(player, index, false);
      await this.arrive(player);
      return;
    }
    this.idle(player, id);
  }

  /**
   * 뉴런의 골짜기 카드 "애플시드의 개척정신"과 "스펙트럼 매직"을 이행한다. 기지가 없는 자기 별 하나를 골라 기지를 무료로 짓는다. (짓지 않아도 된다.)
   * 스펙트럼 매직은 먼저 주사위 2개를 굴려 눈의 합이 정해진 값 이상이어야 한다. 기지를 지을 수 있는 별이 없으면 주사위도 굴리지 않는다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {string} id 카드 식별자
   * @param {number} need 필요한 주사위 눈의 합 (0 이면 주사위를 굴리지 않는다.)
   * @returns {Promise<void>}
   */
  async cardFreeBase(player, id, need) {
    let options = this.bare(player);
    if (options.length === 0) {
      this.idle(player, id);
      return;
    }
    if (need > 0 && (await this.cast(player, 2)) < need) {
      this.log('log.spectrumFail', { player: player.id, n: need });
      return;
    }
    let index = await this.pick(player, 'freebase', options, true);
    if (index === null) return;
    this.state.lands[index].base = 1;
    await this.announce('log.freeBase', { player: player.id, tile: index });
  }

  /**
   * 두 플레이어의 별을 기지째 서로 교환한다. 한 플레이어가 견우성과 직녀성을 함께 갖게 되는 교환은 취소되며, 상대는 천사의 빛으로 교환을 취소할 수 있다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {number} mine 카드를 뽑은 플레이어가 내줄 별의 칸 번호
   * @param {Object} rival 상대 플레이어
   * @param {number} theirs 상대가 내줄 별의 칸 번호
   * @returns {Promise<void>}
   */
  async swapStars(player, mine, rival, theirs) {
    if (this.breaksPair([[mine, rival.id], [theirs, player.id]])) {
      this.log('log.loversCancel', { player: player.id });
      return;
    }
    if (await this.useAngel(rival, { reason: 'swap', amount: Math.max(0, this.value(theirs) - this.value(mine)), index: theirs, other: mine, target: player.id })) return;
    this.state.lands[mine].owner = rival.id;
    this.state.lands[theirs].owner = player.id;
    await this.announce('log.swap', { player: player.id, tile: mine, target: rival.id, other: theirs });
  }

  /**
   * 뉴런의 골짜기 카드 "아인슈타인의 상대성 이론"을 이행한다. 다른 플레이어들이 주사위 1개씩을 굴려, 눈이 가장 낮은 플레이어의 가장 비싼 별과 자신의 가장 싼 별을 교환한다.
   * 자신이나 그 플레이어에게 별이 없으면 아무 일도 없다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async cardEinstein(player, id) {
    let mine = this.extreme(this.stars(player), false);
    let rivals = this.rivals(player);
    if (mine < 0 || rivals.length === 0) {
      this.idle(player, id);
      return;
    }
    let rival = await this.contest(rivals, false);
    let theirs = this.extreme(this.stars(rival), true);
    if (theirs < 0) this.idle(player, id);
    else await this.swapStars(player, mine, rival, theirs);
  }

  /**
   * 자기 별 하나를 내주고 대신 얻을 수 있는 주인 없는 별의 목록을 구한다. 얻으면 견우성과 직녀성을 함께 갖게 되는 별은 뺀다. (초능력 카드)
   * @param {Object} player 플레이어
   * @param {number} give 내줄 별의 칸 번호
   * @returns {number[]} 얻을 수 있는 별의 칸 번호 목록
   */
  takeOptions(player, give) {
    let list = [];
    // 주인이 없는 별 가운데 규칙에 어긋나지 않는 것을 모은다.
    for (let index = 0; index < BOARD_SIZE; index++) {
      if (this.board[index].type !== 'star' || this.state.lands[index].owner !== null) continue;
      if (!this.breaksPair([[give, null], [index, player.id]])) list.push(index);
    }
    return list;
  }

  /**
   * 뉴런의 골짜기 카드 "초능력"을 이행한다. 자기 별 하나와 주인 없는 별 하나를 골라 교환한다. (반드시 교환한다.)
   * 기지는 별에 그대로 남으므로, 내준 별의 기지는 나중에 그 별을 사는 플레이어가 함께 얻는다. 자기 별이 없거나 주인 없는 별이 없으면 아무 일도 없다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async cardPsychic(player, id) {
    let gives = [];
    // 자기 별 가운데 대신 얻을 별이 하나라도 있는 것을 모은다.
    for (let index of this.stars(player)) {
      if (this.takeOptions(player, index).length > 0) gives.push(index);
    }
    let give = await this.pick(player, 'give', gives, false);
    if (give === null) {
      this.idle(player, id);
      return;
    }
    let take = await this.pick(player, 'take', this.takeOptions(player, give), false);
    let met = this.paired();
    this.state.lands[give].owner = null;
    this.state.lands[take].owner = player.id;
    await this.announce('log.swapFree', { player: player.id, tile: give, other: take });
    await this.reunite(met);
  }

  /**
   * 뉴런의 골짜기 카드 "도플러 효과"를 이행한다. 자신의 별 개수가 다른 모든 플레이어보다 많으면 은행에 돈을 내고(천사의 빛으로 면제받을 수 있다.), 아니면 은행에서 돈을 받는다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {Object} coupon 카드 정보
   * @returns {Promise<void>}
   */
  async cardDoppler(player, coupon) {
    if (!this.leadsStars(player)) {
      await this.gain(player, this.money(coupon.gain));
      return;
    }
    if (await this.useAngel(player, { reason: 'pay', amount: this.money(coupon.pay) })) return;
    await this.payBank(player, this.money(coupon.pay));
  }

  /**
   * 뉴런의 골짜기 카드 "조디악의 선물"을 이행한다. 주사위를 1개 또는 2개 굴려(플레이어가 고른다.) 나온 수에 해당하는 별자리로 이동한다. (월급 없음)
   * @param {Object} player 카드를 뽑은 플레이어
   * @returns {Promise<void>}
   */
  async cardZodiac(player) {
    let count = Number(await this.decide(player, { type: 'dicecount' })) === 2 ? 2 : 1;
    let index = this.tiles[ZODIAC[(await this.cast(player, count)) - 1]];
    this.log('log.zodiac', { player: player.id, tile: index });
    await this.moveTo(player, index, false);
    await this.arrive(player);
  }

  /**
   * 뉴런의 골짜기 카드 "모라비트의 항법"을 이행한다. 원하는 칸으로 이동한다. (출발지를 지나도 월급이 없고, 출발지로 이동하면 월급을 받는다.)
   * @param {Object} player 카드를 뽑은 플레이어
   * @returns {Promise<void>}
   */
  async cardMoravec(player) {
    let options = [];
    // 지금 있는 칸을 뺀 모든 칸을 고를 수 있다.
    for (let index = 0; index < BOARD_SIZE; index++) {
      if (index !== player.position) options.push(index);
    }
    await this.warp(player, await this.pick(player, 'moravec', options, false));
    await this.arrive(player);
  }

  /**
   * 뉴런의 골짜기 카드 "코페르니쿠스의 지동설"을 이행한다. 지구로 가서 월급을 받고 주사위를 한 번 더 굴린다.
   * 자기 차례에 뽑았으면 도착한 칸의 처리를 모두 마친 뒤 주사위를 다시 굴리고, 남의 차례에 (카드의 효과로 이동하다가) 뽑았으면 그 자리에서 바로 굴려 이동한다.
   * 다시 굴리기 전에 지구에 멈춘 것이므로, 지구에 도착한 효과(기지 건설)를 먼저 적용한다. (더블로 지구에 도착해 다시 굴리는 경우와 같다.)
   * @param {Object} player 카드를 뽑은 플레이어
   * @returns {Promise<void>}
   */
  async cardCopernicus(player) {
    await this.moveTo(player, this.course.start, true);
    await this.arrive(player);
    if (player === this.current) {
      this.bonus = true;
      return;
    }
    let dice = [this.rollDie(), this.rollDie()];
    this.state.dice = dice;
    this.log('log.bonusRoll', { player: player.id });
    await this.call('dice', player, dice, null);
    this.log('log.dice', { player: player.id, a: dice[0], b: dice[1], sum: dice[0] + dice[1] });
    await this.moveBy(player, dice[0] + dice[1], false, true);
    await this.arrive(player);
  }

  /**
   * 뉴런의 골짜기 카드 "케플러의 조화의 법칙"을 이행한다. 가진 별의 수에 비례한 칸 수만큼 앞으로 이동하여 도착한 칸의 효과를 적용한다. 별이 없으면 아무 일도 없다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {Object} coupon 카드 정보
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async cardKepler(player, coupon, id) {
    let steps = this.stars(player).length * coupon.steps;
    if (steps === 0) {
      this.idle(player, id);
      return;
    }
    this.log('log.kepler', { player: player.id, n: steps });
    await this.moveBy(player, steps, true, true);
    await this.arrive(player);
  }

  /**
   * 뉴런의 골짜기 카드 "샤프레이의 성단거리측정"을 이행한다. 현재 위치의 앞뒤 정해진 칸 수 안에 있는 별의 주인들에게서 측정료를 받는다.
   * 별의 수와 관계없이 플레이어당 한 번만 받으며, 주인들은 천사의 빛으로 면제받을 수 있다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {Object} coupon 카드 정보
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async cardShapley(player, coupon, id) {
    let owners = [];
    // 앞뒤 범위 안의 칸을 살펴, 다른 플레이어가 주인인 별의 주인을 한 번씩만 모은다.
    for (let offset = -coupon.range; offset <= coupon.range; offset++) {
      let index = (player.position + offset + BOARD_SIZE) % BOARD_SIZE;
      let land = this.state.lands[index];
      if (offset === 0 || this.board[index].type !== 'star' || land.owner === null || land.owner === player.id || owners.includes(land.owner)) continue;
      owners.push(land.owner);
    }
    if (owners.length === 0) this.idle(player, id);
    // 모은 주인마다 측정료를 받아낸다.
    for (let owner of owners) await this.claim(this.state.players[owner], player, this.money(coupon.amount));
  }

  /**
   * 뉴런의 골짜기 카드 "홈 볼트의 지적"을 이행한다. 다른 플레이어들이 주사위 1개씩을 굴려, 눈이 가장 낮은 플레이어의 가장 싼 땅을 은행에 반납시킨다.
   * 그 플레이어는 천사의 빛으로 면제받을 수 있고, 가진 땅이 없으면 아무 일도 없다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async cardHumboldt(player, id) {
    let rivals = this.rivals(player);
    let rival = rivals.length > 0 ? await this.contest(rivals, false) : null;
    let index = rival ? this.extreme(this.owned(rival), false) : -1;
    if (index < 0) {
      this.idle(player, id);
      return;
    }
    if (await this.useAngel(rival, { reason: 'land', amount: this.value(index), index })) return;
    this.vacate(index);
    await this.announce('log.landLost', { player: rival.id, tile: index });
  }

  /**
   * 뉴런의 골짜기 카드 "뫼비우스의 띠"를 이행한다. 다른 플레이어들이 주사위 1개씩을 굴려 눈이 가장 높은 플레이어가 주사위 2개를 굴리고,
   * 자신과 그 플레이어 모두 그 눈의 합만큼 앞으로 이동한다. (블랙홀에 갇혀 있어도 탈출하며, 출발지를 지나면 월급을 받는다.) 두 플레이어 모두 도착한 칸의 효과를 적용한다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async cardMobius(player, id) {
    let rivals = this.rivals(player);
    if (rivals.length === 0) {
      this.idle(player, id);
      return;
    }
    let partner = await this.contest(rivals, true);
    let steps = await this.cast(partner, 2);
    this.log('log.mobius', { player: player.id, target: partner.id, n: steps });
    // 카드를 뽑은 플레이어부터 차례로 이동하고 도착한 칸의 효과를 적용한다.
    for (let mover of [player, partner]) {
      if (!mover.alive) continue;
      mover.island = 0;
      await this.moveBy(mover, steps, true, true);
      await this.arrive(mover);
    }
  }

  /**
   * 뉴런의 골짜기 카드 "뒤바뀐 우주계약서"를 이행한다. 별이 가장 많은 다른 플레이어(여럿이면 무작위로 한 명)의 별과 자신의 별을 교환한다.
   * 자신의 별은 고르고 상대의 별은 무작위로 뽑는다. 자신이나 다른 플레이어들에게 별이 없으면 아무 일도 없다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async cardContract(player, id) {
    let mine = this.stars(player);
    let leaders = [];
    let most = 0;
    // 별이 가장 많은 다른 플레이어들을 모은다.
    for (let rival of this.rivals(player)) {
      let count = this.stars(rival).length;
      if (count > most) leaders = [];
      if (count > 0 && count >= most) leaders.push(rival);
      most = Math.max(most, count);
    }
    if (mine.length === 0 || leaders.length === 0) {
      this.idle(player, id);
      return;
    }
    let rival = leaders[Math.floor(this.random() * leaders.length)];
    let pool = this.stars(rival);
    let theirs = pool[Math.floor(this.random() * pool.length)];
    await this.swapStars(player, await this.pick(player, 'give', mine, false), rival, theirs);
  }

  /**
   * 뉴런의 골짜기 카드 "파스칼과 페르마의 확률"을 이행한다. 다른 플레이어의 별 하나를 골라 그곳으로 가서 주인과 주사위 1개씩을 굴린다.
   * 자신의 눈이 더 크면 주인에게서 그 별의 이용료를 받고, 같거나 작으면 주인에게 정해진 금액을 낸다. (그 별의 이용료는 내지 않는다.)
   * 어느 쪽이든 내는 쪽은 천사의 빛으로 면제받을 수 있다. 다른 플레이어의 별이 없으면 아무 일도 없다.
   * @param {Object} player 카드를 뽑은 플레이어
   * @param {Object} coupon 카드 정보
   * @param {string} id 카드 식별자
   * @returns {Promise<void>}
   */
  async cardPascal(player, coupon, id) {
    let options = [];
    // 다른 플레이어가 주인인 별을 모은다.
    for (let index = 0; index < BOARD_SIZE; index++) {
      let land = this.state.lands[index];
      if (this.board[index].type === 'star' && land.owner !== null && land.owner !== player.id) options.push(index);
    }
    let index = await this.pick(player, 'pascal', options, false);
    if (index === null) {
      this.idle(player, id);
      return;
    }
    let owner = this.state.players[this.state.lands[index].owner];
    await this.moveTo(player, index, true);
    let rolls = await this.duel(player, owner, false);
    if (rolls[0] > rolls[1]) {
      this.log('log.pascalWin', { player: player.id, target: owner.id, tile: index });
      await this.claim(owner, player, this.toll(index));
    } else {
      this.log('log.pascalLose', { player: player.id, target: owner.id });
      await this.claim(player, owner, this.money(coupon.amount));
    }
  }

  /**
   * 우주여행 코스에서 시간여행에 탑승한 플레이어의 차례를 진행한다. 주사위 2개를 굴려 눈의 합이 SAFE_SUM 이상이면 원하는 칸을 골라 이동하고
   * (가는 길에 출발지를 지나도 월급이 없고, 지구에 도착하면 월급을 받는다.), 모자라면 TIME_SLIP 칸 앞으로 이동한다. 이 굴림의 더블은 효과가 없다.
   * @param {Object} player 플레이어
   * @returns {Promise<boolean>} 카드의 효과로 주사위를 한 번 더 굴려야 하면 true
   */
  async playTimeTravel(player) {
    let thrown = this.throwDice(player, true);
    let dice = thrown.dice;
    this.bonus = false;
    this.state.dice = dice;
    player.boarded = false;
    player.direct = false;
    await this.call('dice', player, dice, thrown.faces);
    this.log('log.dice', { player: player.id, a: dice[0], b: dice[1], sum: dice[0] + dice[1] });
    if (dice[0] + dice[1] >= SAFE_SUM) {
      let options = [];
      // 지금 있는 칸을 뺀 모든 칸을 고를 수 있다.
      for (let index = 0; index < BOARD_SIZE; index++) {
        if (index !== player.position) options.push(index);
      }
      let target = await this.pick(player, 'timetravel', options, false);
      this.log('log.timeGo', { player: player.id, tile: target });
      await this.warp(player, target);
    } else {
      this.log('log.timeSlip', { player: player.id, n: TIME_SLIP });
      await this.moveBy(player, TIME_SLIP, false, true);
    }
    await this.arrive(player);
    return this.takeBonus(player);
  }
}

/**
 * 코스별 규칙 엔진의 클래스이다. 키는 COURSES 의 키와 같다. 코스를 더하면 그 코스의 엔진 클래스를 만들어 여기에도 더한다.
 * @type {Object<string, typeof HellmarbleGame>}
 */
const ENGINES = { world: HellmarbleWorldGame, space: HellmarbleSpaceGame };

/**
 * 리그가 진행되는 코스의 엔진 클래스를 구한다.
 * @param {string} league 리그 식별자
 * @returns {typeof HellmarbleGame} 엔진 클래스 (모르는 리그이면 세계여행 코스의 엔진)
 */
function engineOf(league) {
  return ENGINES[Object.hasOwn(LEAGUES, league) ? LEAGUES[league].course : 'world'];
}

/* ==========================================================================
 * 9. 화면 (애플리케이션)
 * ========================================================================== */

/**
 * Hellmarble 의 화면 전체를 담당하는 애플리케이션이다.
 * 메인 메뉴, 저장 슬롯, 대기실, 설정, 게임 화면을 그리고, 규칙 엔진의 호스트로서 연출과 사용자 입력을 처리한다.
 * 화면의 모든 요소는 스크립트가 직접 만들므로 HTML 에는 게임을 그릴 빈 요소 하나만 있으면 된다.
 */
export class HellmarbleApp extends HellmarbleHost {
  /**
   * 애플리케이션을 만든다. 화면은 start() 를 호출해야 그려진다.
   * @param {HTMLElement} root 게임 화면을 그릴 요소
   * @param {Object} [options] 선택 사항 { storage : 저장소 객체, timings : 연출 시간(밀리초) 덮어쓰기, random : 부적 추첨에 쓸 난수 함수, style : false 이면 게임의 스타일시트를 넣지 않음 }
   */
  constructor(root, options) {
    super();
    let config = options || {};
    this.root = root;
    this.styled = config.style !== false;
    this.storage = config.storage || new HellmarbleStorage();
    this.timings = Object.assign({}, TIMINGS, config.timings);
    this.random = typeof config.random === 'function' ? config.random : Math.random;
    this.settings = { language: 'ko', dark: false };
    this.screen = '';
    this.slotMode = 'new';
    this.slotIndex = -1;
    this.pendingSlot = -1;
    this.slot = null;
    this.game = null;
    this.mode = 'busy';
    this.waiting = null;
    this.modal = null;
    this.popover = null;
    this.tiles = [];
    this.parts = {};
    this.moving = -1;
    this.rolling = false;
    this.flight = false;
    this.again = false;
    this.intro = false;
    this.cards = [];
    this.cardOrder = '';
    this.lots = [];
    this.lotState = [];
    this.lotPairs = [];
    this.lotsMoved = false;
    this.couponGate = null;
    this.request = null;
    this.castDice = null;
    this.pickOptions = null;
    this.itemView = null;
    this.tools = [];
    this.toolAbort = null;
  }

  /* ------------------------------ 공통 기능 ------------------------------ */

  /**
   * 현재 언어의 문구를 돌려준다.
   * @param {string} key 문구 키
   * @param {Object} [params] 문구에 끼워 넣을 값
   * @returns {string} 완성된 문구
   */
  t(key, params) {
    return translate(this.settings.language, key, params);
  }

  /**
   * 금액을 현재 언어에 맞는 문자열로 바꾼다.
   * @param {number} value 금액 (원)
   * @returns {string} 금액 문자열
   */
  money(value) {
    return formatMoney(value, this.settings.language);
  }

  /**
   * 금액을 데이터·수치용 글꼴로 보여주는 요소를 만든다. 금액이나 가격만 따로 표시하는 자리에 쓴다.
   * @param {number} value 금액 (원)
   * @param {string} [sign] 금액 앞에 붙일 부호
   * @returns {HTMLElement} 금액 요소
   */
  figure(value, sign) {
    return el('span', { class: 'hm-num', text: (sign || '') + this.money(value) });
  }

  /**
   * 플레이어의 생김새(색, 문양)를 화면에 그릴 값으로 구한다.
   * @param {Object} player 플레이어
   * @returns {{color: string, ink: string, fill: string, symbol: string}} 색, 문양의 글자색, 칠하는 배경, 문양 문자
   */
  styleOf(player) {
    return lookStyle(player.look);
  }

  /**
   * 저장된 설정이 없는 첫 접속일 때 시스템의 언어와 다크 모드 여부를 탐지하여 설정에 반영하고 저장한다.
   * 탐지하지 못한 항목은 기본값(한국어, 밝은 화면)을 그대로 둔다.
   */
  detectSettings() {
    let language = detectLanguage();
    let dark = detectDark();
    if (language !== null) this.settings.language = language;
    if (dark !== null) this.settings.dark = dark;
    this.storage.write('settings', this.settings);
  }

  /**
   * 게임 화면의 스타일시트를 문서에 넣고, 저장된 설정을 불러온(없으면 시스템 설정을 탐지한) 다음 입력 처리를 연결하고 메인 메뉴를 보여준다.
   * @returns {HellmarbleApp} 자기 자신
   */
  start() {
    if (this.styled) installStyle(this.root);
    let saved = this.storage.read('settings');
    if (saved && typeof saved === 'object') {
      if (Object.keys(TEXTS).includes(saved.language)) this.settings.language = saved.language;
      this.settings.dark = Boolean(saved.dark);
    } else {
      this.detectSettings();
    }
    this.root.classList.add('hm-root');
    this.root.addEventListener('click', this);
    this.root.addEventListener('submit', this);
    globalThis.addEventListener('keydown', this);
    globalThis.addEventListener('resize', this);
    this.applySettings();
    this.showMenu();
    this.registerTools();
    return this;
  }

  /**
   * 진행 중인 게임을 멈추고 입력 처리를 끊은 뒤 화면을 비운다. 등록한 WebMCP 도구도 해제한다.
   */
  destroy() {
    this.leaveGame();
    if (this.toolAbort) this.toolAbort.abort();
    this.toolAbort = null;
    this.root.removeEventListener('click', this);
    this.root.removeEventListener('submit', this);
    globalThis.removeEventListener('keydown', this);
    globalThis.removeEventListener('resize', this);
    this.root.replaceChildren();
    this.screen = '';
  }

  /**
   * 브라우저 이벤트를 받아 종류에 맞게 처리한다. (addEventListener 에 이 객체를 직접 등록한다.)
   * @param {Event} event 브라우저 이벤트
   */
  handleEvent(event) {
    switch (event.type) {
      case 'click':
        this.onClick(event);
        break;
      case 'submit':
        event.preventDefault();
        this.submitName();
        break;
      case 'keydown':
        if (event.key === 'Escape') this.onEscape();
        break;
      case 'resize':
        this.placePopover();
        break;
      default:
        break;
    }
  }

  /**
   * ESC 키를 눌렀을 때의 처리를 한다.
   * 글을 입력하는 중이면 입력 모드에서 빠져나오고(입력창의 초점을 뗀다), 아이템 창이 열려 있으면 상세 팝업부터 차례로 닫으며,
   * 그 밖에는 열려 있는 땅 정보 창을 닫는다.
   */
  onEscape() {
    let field = document.activeElement;
    if (field instanceof HTMLElement && field.classList.contains('hm-input') && this.root.contains(field)) field.blur();
    else if (this.itemView) this.onItemAction(this.itemView.detail ? 'back' : 'close');
    else this.closePopover();
  }

  /**
   * 클릭된 요소에서 동작 이름을 찾아 실행한다. 동작이 없는 곳을 클릭하면 땅 정보 창을 닫는다.
   * @param {MouseEvent} event 클릭 이벤트
   */
  onClick(event) {
    let target = event.target instanceof Element ? event.target.closest('[data-action]') : null;
    if (!target || !this.root.contains(target)) {
      this.closePopover();
      return;
    }
    if (target.disabled) return;
    this.handle(target.dataset.action, target.dataset.value);
  }

  /**
   * 동작 이름에 해당하는 기능을 실행한다.
   * @param {string} action 동작 이름
   * @param {string} [value] 동작에 딸린 값
   */
  handle(action, value) {
    switch (action) {
      case 'menu.new': this.showSlots('new'); break;
      case 'menu.load': this.showSlots('load'); break;
      case 'menu.settings': this.showSettings(); break;
      case 'menu.home': this.goHome(); break;
      case 'slot.pick': this.pickSlot(Number(value)); break;
      case 'name.submit': this.submitName(); break;
      case 'lobby.join': this.joinLeague(value); break;
      case 'lobby.export': this.exportSlot(); break;
      case 'lobby.shop': this.openItems('shop'); break;
      case 'lobby.items': this.openItems('lobby'); break;
      case 'settings.reset': this.resetAllData(); break;
      case 'game.player': this.showPlayer(Number(value)); break;
      case 'game.items': this.openItems('game'); break;
      case 'settings.language': this.changeSetting('language', value); break;
      case 'settings.dark': this.changeSetting('dark', value === 'on'); break;
      case 'dialog.answer': this.closeDialog(value); break;
      case 'game.roll': this.answer('roll', true); break;
      case 'game.menu': this.answer('', QUIT); break;
      case 'game.forfeit': this.confirmForfeit(); break;
      case 'game.tile': this.togglePopover(Number(value)); break;
      case 'game.travel': this.answer(this.mode === 'pick' ? 'pick' : 'travel', Number(value)); break;
      case 'popover.close': this.closePopover(); break;
      case 'coupon.close': this.closeCoupon(); break;
      default:
        if (action.startsWith('items.')) this.onItemAction(action.slice(6), value);
        break;
    }
  }

  /**
   * 메인 메뉴로 돌아간다. 대기실에서 나가는 경우에는 슬롯의 내용을 저장한 뒤 돌아간다.
   */
  goHome() {
    if (this.screen === 'lobby') this.saveSlot();
    this.showMenu();
  }

  /**
   * 화면의 내용을 새 요소로 바꾼다. 열려 있던 대화 상자와 땅 정보 창은 닫는다.
   * @param {HTMLElement} node 새로 보여줄 화면 요소
   */
  mount(node) {
    this.closePopover();
    this.closeDialog(null);
    this.root.replaceChildren(node);
  }

  /**
   * 언어와 다크 모드 설정을 화면에 반영한다.
   */
  applySettings() {
    this.root.dataset.theme = this.settings.dark ? 'dark' : 'light';
    this.root.lang = this.settings.language;
    document.documentElement.lang = this.settings.language;
    document.documentElement.style.colorScheme = this.settings.dark ? 'dark' : 'light';
  }

  /**
   * 설정 값을 바꾸고 저장한 뒤 설정 화면을 다시 그린다.
   * @param {string} name 설정 이름 ('language' 또는 'dark')
   * @param {*} value 새 값
   */
  changeSetting(name, value) {
    if (name === 'language' && !Object.keys(TEXTS).includes(value)) return;
    this.settings[name] = value;
    this.storage.write('settings', this.settings);
    this.applySettings();
    this.showSettings();
  }

  /**
   * 저장 슬롯의 내용을 읽는다. 형식이 맞지 않는 게임 진행 상태는 버린다.
   * @param {number} index 슬롯 순번 (0부터)
   * @returns {Object|null} 슬롯 데이터 { name, money, game, updated } (비어 있거나 읽을 수 없으면 null)
   */
  readSlot(index) {
    try {
      return normalizeSave(this.storage.read('slot.' + (index + 1)), this.t('name.default'), false);
    } catch (error) {
      return null;
    }
  }

  /**
   * 현재 슬롯의 데이터(대기실 금액과 게임 진행 상태)를 저장한다.
   */
  saveSlot() {
    if (!this.slot || this.slotIndex < 0) return;
    this.slot.updated = Date.now();
    this.storage.write('slot.' + (this.slotIndex + 1), this.slot);
  }

  /**
   * 플레이어의 표시 이름을 구한다.
   * @param {Object} player 플레이어
   * @returns {string} 표시 이름
   */
  playerName(player) {
    return player.ai ? this.t('player.ai', { n: player.id }) : player.name;
  }

  /**
   * 지금 화면이 다루는 코스의 구성을 구한다. 게임 중에는 그 게임의 코스이고, 게임 밖에서는 세계여행 코스이다.
   * @returns {HellmarbleCourse} 코스의 구성
   */
  courseNow() {
    return this.game ? this.game.course : COURSES.world;
  }

  /**
   * 칸의 표시 이름을 구한다.
   * @param {number} index 칸 번호
   * @returns {string} 칸 이름
   */
  tileName(index) {
    return this.t('tile.' + this.courseNow().board[index].id);
  }

  /**
   * 카드(비밀쿠폰, 텔레파시 카드, 뉴런의 골짜기 카드)의 문구 키 앞부분을 구한다. 비밀쿠폰은 'coupon.<식별자>', 우주여행 코스의 카드는 'card.<식별자>' 이다.
   * @param {string} id 카드 식별자
   * @returns {string} 문구 키의 앞부분
   */
  cardKey(id) {
    return (Object.hasOwn(COUPONS, id) ? 'coupon.' : 'card.') + id;
  }

  /**
   * 카드의 표시 이름을 구한다.
   * @param {string} id 카드 식별자
   * @returns {string} 카드 이름
   */
  cardTitle(id) {
    return this.t(this.cardKey(id) + '.title');
  }

  /* ------------------------------ 대화 상자 ------------------------------ */

  /**
   * 화면을 음영 처리하고 대화 상자를 띄운 뒤 사용자의 선택을 기다린다.
   * @param {Object} config 구성 { title, text, body : 요소 목록, buttons : [{ label, value, primary, disabled }], kind, stack }
   * @returns {Promise<string|null>} 선택한 버튼의 값 (선택 없이 닫히면 null)
   */
  dialog(config) {
    this.closeDialog(null);
    let handle = defer();
    let buttons = el('div', { class: 'hm-modal-buttons' + (config.stack ? ' hm-stack' : '') });
    // 선택지 버튼을 순서대로 만든다.
    for (let item of config.buttons) {
      let className = (item.primary ? 'hm-primary' : '') + (item.danger ? ' hm-danger' : '');
      let node = button(item.label, 'dialog.answer', item.value, className);
      node.disabled = Boolean(item.disabled);
      buttons.append(node);
    }
    let modal = el('div', { class: 'hm-modal' + (config.kind ? ' hm-modal-' + config.kind : ''), attrs: { role: 'dialog', 'aria-modal': 'true' } }, [
      el('h2', { class: 'hm-modal-title', text: config.title }),
      config.text ? el('p', { class: 'hm-modal-text', text: config.text }) : null,
      ...(config.body || []),
      buttons,
    ]);
    let overlay = el('div', { class: 'hm-overlay' }, [modal]);
    this.root.append(overlay);
    this.modal = { overlay, handle };
    let first = buttons.querySelector('button:not(:disabled)');
    if (first) first.focus({ preventScroll: true });
    return handle.promise;
  }

  /**
   * 열려 있는 대화 상자를 닫고 기다리던 쪽에 선택 값을 전달한다.
   * @param {string|null} value 전달할 값
   */
  closeDialog(value) {
    if (!this.modal) return;
    let modal = this.modal;
    this.modal = null;
    if (this.itemView && this.itemView.overlay === modal.overlay) this.itemView = null;
    modal.overlay.remove();
    modal.handle.resolve(value === undefined ? null : value);
  }

  /**
   * 예/아니오를 묻는 대화 상자를 띄운다.
   * @param {string} title 제목
   * @param {string} text 내용
   * @param {string} [yes] 예 버튼의 글자
   * @param {string} [no] 아니오 버튼의 글자
   * @returns {Promise<boolean>} 예를 선택했으면 true
   */
  async confirm(title, text, yes, no) {
    let answer = await this.dialog({
      title, text,
      buttons: [{ label: yes || this.t('common.yes'), value: 'yes', primary: true }, { label: no || this.t('common.no'), value: 'no' }],
    });
    return answer === 'yes';
  }

  /**
   * 사용자에게 게임 포기를 확인받고, 확정하면 현재 차례 입력에 포기 신호를 전달한다.
   * @returns {Promise<void>}
   */
  async confirmForfeit() {
    let confirmed = await this.confirm(
      this.t('confirm.forfeit.title'),
      this.t('confirm.forfeit.text'),
      this.t('confirm.forfeit.yes'),
      this.t('common.no'),
    );
    if (confirmed) this.answer('', FORFEIT);
  }

  /* ------------------------------ 메뉴 화면 ------------------------------ */

  /**
   * 메인 메뉴(게임 시작, 불러오기, 설정)를 보여준다.
   */
  showMenu() {
    this.leaveGame();
    this.screen = 'menu';
    this.mount(el('div', { class: 'hm-page' }, [
      el('div', { class: 'hm-card hm-menu' }, [
        el('div', { class: 'hm-logo-dice' }, [this.buildDie(5), this.buildDie(2)]),
        el('h1', { class: 'hm-logo', text: this.t('app.title') }),
        el('p', { class: 'hm-tagline', text: this.t('app.subtitle') }),
        el('div', { class: 'hm-menu-list' }, [
          button(this.t('menu.new'), 'menu.new', undefined, 'hm-primary hm-wide'),
          button(this.t('menu.load'), 'menu.load', undefined, 'hm-wide'),
          button(this.t('menu.settings'), 'menu.settings', undefined, 'hm-wide'),
        ]),
      ]),
    ]));
  }

  /**
   * 저장 슬롯 선택 화면을 보여준다.
   * @param {string} mode 'new' (새 게임을 저장할 슬롯 선택) 또는 'load' (불러올 슬롯 선택)
   */
  showSlots(mode) {
    this.leaveGame();
    this.screen = 'slots';
    this.slotMode = mode;
    let cards = [];
    // 슬롯 개수만큼 슬롯 카드를 만든다.
    for (let index = 0; index < SLOT_COUNT; index++) cards.push(this.buildSlotCard(index));
    this.mount(el('div', { class: 'hm-page' }, [
      el('div', { class: 'hm-card' }, [
        el('h1', { class: 'hm-heading', text: this.t(mode === 'new' ? 'slot.new' : 'slot.load') }),
        el('p', { class: 'hm-tagline', text: this.t(mode === 'new' ? 'slot.newHint' : 'slot.loadHint') }),
        el('div', { class: 'hm-slots' }, cards),
        button(this.t('common.back'), 'menu.home', undefined, 'hm-wide'),
      ]),
    ]));
  }

  /**
   * 저장 슬롯 하나의 요약 카드를 만든다.
   * @param {number} index 슬롯 순번 (0부터)
   * @returns {HTMLButtonElement} 슬롯 카드
   */
  buildSlotCard(index) {
    let saved = this.readSlot(index);
    let lines = [el('span', { class: 'hm-slot-title', text: this.t('slot.name', { n: index + 1 }) })];
    if (saved) {
      let state = saved.game ? this.t('slot.playing', { league: this.t('league.' + saved.game.league) }) : this.t('slot.lobby');
      lines.push(el('span', { class: 'hm-slot-name', text: saved.name }));
      lines.push(el('span', { class: 'hm-slot-money', text: this.money(saved.money) }));
      lines.push(el('span', { class: 'hm-slot-state', text: state }));
    } else {
      lines.push(el('span', { class: 'hm-slot-empty', text: this.t('slot.empty') }));
    }
    return el('button', { class: 'hm-slot' + (saved ? '' : ' hm-slot-blank'), data: { action: 'slot.pick', value: index }, attrs: { type: 'button' } }, lines);
  }

  /**
   * 슬롯을 선택했을 때의 처리를 한다.
   * 불러오기에서는 선택지를 제공하고, 새 게임에서는 덮어쓰기를 확인한 뒤 이름 입력으로 넘어간다.
   * 덮어쓰기 확인 창에서는 덮어쓰기 / 불러오기 / 취소 가운데 고르며, 불러오기를 고르면 덮어쓰지 않고 그 슬롯을 불러온다.
   * @param {number} index 슬롯 순번 (0부터)
   * @returns {Promise<void>}
   */
  async pickSlot(index) {
    if (this.screen !== 'slots' || !(index >= 0 && index < SLOT_COUNT)) return;
    let saved = this.readSlot(index);
    if (this.slotMode === 'load') {
      await this.chooseLoad(index, saved);
      return;
    }
    if (saved) {
      let answer = await this.dialog({
        title: this.t('slot.overwriteTitle'), text: this.t('slot.overwrite', { n: index + 1 }),
        buttons: [{ label: this.t('slot.overwriteYes'), value: 'yes', primary: true }, { label: this.t('load.load'), value: 'load' }, { label: this.t('load.cancel'), value: 'no' }],
      });
      if (this.screen !== 'slots') return;
      if (answer === 'load') {
        this.loadSlot(index, saved);
        return;
      }
      if (answer !== 'yes') return;
    }
    if (this.screen === 'slots') this.showName(index);
  }

  /**
   * 슬롯의 저장 데이터를 불러와, 진행 중인 게임이 있으면 게임 화면으로, 없으면 대기실로 들어간다.
   * @param {number} index 슬롯 순번 (0부터)
   * @param {Object} saved 슬롯에 저장된 데이터
   */
  loadSlot(index, saved) {
    this.slotIndex = index;
    this.slot = saved;
    if (saved.game) this.showGame(false);
    else this.showLobby();
  }

  /**
   * 불러오기 화면에서 슬롯을 눌렀을 때의 선택지를 제공한다.
   * 데이터가 있는 슬롯은 불러오기 / JSON 복사 / 삭제 / 취소, 빈 슬롯은 JSON 불러오기 / 취소 가운데 고른다.
   * 취소하면 불러오기 화면에 그대로 남고, 삭제는 한 번 더 확인받은 뒤 슬롯을 비운다.
   * JSON 복사는 대기실의 JSON 내보내기와 같이 저장 데이터를 클립보드에 넣고 불러오기 화면에 남는다.
   * @param {number} index 슬롯 순번 (0부터)
   * @param {Object|null} saved 슬롯에 저장된 데이터 (빈 슬롯이면 null)
   * @returns {Promise<void>}
   */
  async chooseLoad(index, saved) {
    let title = this.t('slot.name', { n: index + 1 });
    if (!saved) {
      let pick = await this.dialog({ title, text: this.t('load.emptyText'), buttons: [{ label: this.t('load.import'), value: 'import', primary: true }, { label: this.t('load.cancel'), value: 'cancel' }] });
      if (pick === 'import' && this.screen === 'slots') await this.importSlot(index);
      return;
    }
    let state = saved.game ? this.t('slot.playing', { league: this.t('league.' + saved.game.league) }) : this.t('slot.lobby');
    let answer = await this.dialog({
      title, text: this.t('load.summary', { name: saved.name, money: this.money(saved.money), state }),
      buttons: [{ label: this.t('load.load'), value: 'load', primary: true }, { label: this.t('load.copy'), value: 'copy' }, { label: this.t('load.delete'), value: 'delete' }, { label: this.t('load.cancel'), value: 'cancel' }],
    });
    if (this.screen !== 'slots') return;
    if (answer === 'load') {
      this.loadSlot(index, saved);
      return;
    }
    if (answer === 'copy') {
      await this.exportSlot(saved);
      return;
    }
    if (answer !== 'delete' || !(await this.confirm(this.t('load.deleteTitle'), this.t('load.deleteText', { n: index + 1 }), this.t('load.delete'), this.t('load.cancel')))) return;
    this.storage.remove('slot.' + (index + 1));
    if (this.slotIndex === index) {
      this.slotIndex = -1;
      this.slot = null;
    }
    if (this.screen === 'slots') this.showSlots('load');
  }

  /**
   * 빈 슬롯에 JSON 으로 내보낸 저장 데이터를 불러온다.
   * 레이어 팝업에 긴 글을 입력할 수 있는 입력창과 불러오기 / 취소 선택지를 보여준다.
   * 입력창은 일반 텍스트 입력창처럼 동작한다. 클릭하면 입력 모드가 되어 키보드 입력, 방향키 이동,
   * 복사 / 붙여넣기 / 전체 선택, SHIFT + 방향키 블록 선택을 할 수 있고, ESC 키를 누르면 입력 모드에서 빠져나온다.
   * 입력한 글을 해석(주석 허용)하고 검사한 뒤 슬롯에 저장하고 불러오기 화면으로 돌아간다.
   * 해석에 실패하거나 내용이 올바르지 않으면 안내 창을 띄우고 끝낸다.
   * @param {number} index 슬롯 순번 (0부터)
   * @returns {Promise<void>}
   */
  async importSlot(index) {
    let area = el('textarea', { class: 'hm-input hm-textarea', attrs: { rows: 10, spellcheck: 'false', autocomplete: 'off', placeholder: this.t('import.placeholder'), 'aria-label': this.t('import.title') } });
    let answer = await this.dialog({
      kind: 'wide', title: this.t('import.title'), text: this.t('import.text'), body: [area],
      buttons: [{ label: this.t('import.submit'), value: 'import', primary: true }, { label: this.t('load.cancel'), value: 'cancel' }],
    });
    if (answer !== 'import' || this.screen !== 'slots') return;
    let failure = '';
    try {
      let data = null;
      try {
        data = parseJson(area.value);
      } catch (error) {
        throw new Error('parse');
      }
      this.storage.write('slot.' + (index + 1), normalizeSave(data, this.t('name.default'), true));
    } catch (error) {
      failure = this.t(error && error.message === 'parse' ? 'import.failParse' : error && error.message === 'version' ? 'import.failVersion' : 'import.failData');
    }
    if (failure !== '') await this.dialog({ title: this.t('import.failTitle'), text: failure, buttons: [{ label: this.t('common.ok'), value: 'ok', primary: true }] });
    if (this.screen === 'slots') this.showSlots('load');
  }

  /**
   * 슬롯의 저장 데이터를 JSON 텍스트로 바꿔 클립보드에 복사한다.
   * 대기실에서는 현재 슬롯을, 불러오기 화면에서는 고른 슬롯을 복사한다.
   * 복사할 수 없는 브라우저에서는 직접 복사할 수 있도록 내용을 창에 보여준다.
   * @param {Object} [saved] 복사할 저장 데이터 (주지 않으면 현재 슬롯)
   * @returns {Promise<void>}
   */
  async exportSlot(saved) {
    let data = saved || this.slot;
    let screen = this.screen;
    if ((screen !== 'lobby' && screen !== 'slots') || !data) return;
    let text = JSON.stringify(data, null, 2);
    let copied = await copyText(text);
    if (this.screen !== screen) return;
    let area = el('textarea', { class: 'hm-input hm-textarea', attrs: { rows: 9, readonly: '', spellcheck: 'false', 'aria-label': this.t('export.title') } });
    area.value = text;
    await this.dialog({
      kind: copied ? '' : 'wide', title: this.t('export.title'), text: this.t(copied ? 'export.done' : 'export.manual'), body: copied ? [] : [area],
      buttons: [{ label: this.t('common.ok'), value: 'ok', primary: true }],
    });
  }

  /**
   * 사용자 이름 / 닉네임 입력 화면을 보여준다.
   * @param {number} index 새 게임을 저장할 슬롯 순번
   */
  showName(index) {
    this.screen = 'name';
    this.pendingSlot = index;
    let input = el('input', { class: 'hm-input', attrs: { type: 'text', maxlength: NAME_LIMIT, placeholder: this.t('name.default'), autocomplete: 'off', 'aria-label': this.t('name.title') } });
    this.mount(el('div', { class: 'hm-page' }, [
      el('form', { class: 'hm-card hm-form' }, [
        el('h1', { class: 'hm-heading', text: this.t('name.title') }),
        el('p', { class: 'hm-tagline', text: this.t('slot.name', { n: index + 1 }) + ' · ' + this.t('name.hint', { n: NAME_LIMIT }) }),
        input,
        button(this.t('name.submit'), 'name.submit', undefined, 'hm-primary hm-wide'),
        button(this.t('common.back'), 'menu.new', undefined, 'hm-wide'),
      ]),
    ]));
    input.focus();
  }

  /**
   * 입력한 이름으로 새 슬롯 데이터를 만들어 저장하고 대기실로 이동한다.
   * 새 슬롯은 기본 색상 5종과 기본 모양 4종을 가지며, 빨강과 별을 장착한 채로 시작한다.
   * 부적은 낡은 동전 하나를 가지고 장착한 채로 시작한다.
   */
  submitName() {
    if (this.screen !== 'name') return;
    let input = this.root.querySelector('.hm-input');
    let name = (input ? input.value : '').trim().slice(0, NAME_LIMIT) || this.t('name.default');
    this.slotIndex = this.pendingSlot;
    this.slot = { version: SAVE_VERSION, name, money: LOBBY_MONEY, items: emptyItems(), equips: starterEquips(), charms: starterCharms(), equipped: { ...DEFAULT_LOOK, charm: STARTER_CHARM }, game: null, updated: 0 };
    this.saveSlot();
    this.showLobby();
  }

  /**
   * 대기실을 보여준다. 보유 금액, 장착한 색상과 모양(내 말), 보유 아이템 수, 리그 목록, 상점과 아이템 확인, 메인 메뉴 버튼이 있다.
   * 리그는 보유 금액으로 참여할 수 있는 것만 보여준다. (White 리그는 보유 금액이 적을 때에만 나타난다.)
   */
  showLobby() {
    this.leaveGame();
    this.screen = 'lobby';
    let totals = this.itemTotals('lobby');
    let look = this.slot.equipped;
    let groups = [];
    let notes = [el('p', { class: 'hm-note', text: this.t('lobby.note') })];
    // 코스마다 그 코스로 진행되는 리그를 묶어 보여준다.
    for (let course in COURSES) {
      let cards = [];
      // 지금 보유 금액으로 보이는 리그마다 참여 카드를 만들고, 승리 보상이 정해진 리그는 안내를 덧붙인다.
      for (let id in LEAGUES) {
        let league = LEAGUES[id];
        if (league.course !== course || !this.leagueOpen(id)) continue;
        cards.push(this.buildLeagueCard(id));
        if (league.reward !== null && league.hideFrom !== null) notes.push(el('p', { class: 'hm-note hm-league-note', text: this.t('lobby.whiteNote', { league: this.t('league.' + id), limit: this.money(league.hideFrom), cash: this.money(league.cash), reward: this.money(league.reward) }) }));
      }
      if (cards.length === 0) continue;
      groups.push(el('section', { class: 'hm-course', data: { course } }, [
        el('h2', { class: 'hm-course-name', text: this.t('course.' + course) }),
        el('div', { class: 'hm-leagues', style: { '--hm-league-count': cards.length } }, cards),
      ]));
    }
    this.mount(el('div', { class: 'hm-page' }, [
      el('div', { class: 'hm-card hm-lobby' }, [
        el('h1', { class: 'hm-heading', text: this.t('lobby.title') }),
        el('p', { class: 'hm-tagline', text: this.t('lobby.welcome', { name: this.slot.name }) }),
        el('div', { class: 'hm-wallet' }, [
          el('span', { class: 'hm-wallet-label', text: this.t('lobby.money') }),
          el('strong', { class: 'hm-wallet-money', text: this.money(this.slot.money) }),
        ]),
        el('div', { class: 'hm-lobby-status' }, [
          el('p', { class: 'hm-look' + (look.color && look.shape ? '' : ' hm-look-missing') }, [this.buildLookToken(look), el('span', { class: 'hm-look-text', text: this.t('lobby.look') + ' : ' + this.lookText(look) })]),
          el('p', { class: 'hm-item-total', text: '🎒 ' + this.t('item.owned') + ' : ' + (totals.count > 0 ? this.t('item.total', totals) : this.t('item.none')) }),
        ]),
        el('div', { class: 'hm-courses' }, groups),
        ...notes,
        el('div', { class: 'hm-lobby-buttons' }, [
          button(this.t('lobby.shop'), 'lobby.shop'),
          button(this.t('lobby.items'), 'lobby.items'),
          button(this.t('lobby.export'), 'lobby.export'),
          button(this.t('common.menu'), 'menu.home'),
        ]),
      ]),
    ]));
  }

  /**
   * 설정을 기본값으로 되돌리고 세 저장 슬롯을 삭제한 뒤 메인 메뉴를 연다.
   * @returns {Promise<void>}
   */
  async resetAllData() {
    if (this.screen !== 'settings') return;
    let confirmed = await this.confirm(this.t('settings.resetTitle'), this.t('settings.resetText'), this.t('settings.reset'), this.t('common.no'));
    if (!confirmed || this.screen !== 'settings') return;
    this.storage.remove('settings');
    // 세 저장 슬롯을 모두 지운다.
    for (let index = 1; index <= SLOT_COUNT; index++) this.storage.remove('slot.' + index);
    this.slot = null;
    this.slotIndex = -1;
    this.pendingSlot = -1;
    this.settings = { language: 'ko', dark: false };
    this.storage.write('settings', this.settings);
    this.applySettings();
    this.showMenu();
  }

  /**
   * 리그가 지금 대기실의 리그 목록에 보이고 참여할 수 있는지 확인한다.
   * 보유 금액의 기준(hideFrom)이 있는 리그는 보유 금액이 그보다 적을 때에만 보인다.
   * @param {string} id 리그 식별자
   * @returns {boolean} 보이면 true
   */
  leagueOpen(id) {
    let league = LEAGUES[id];
    return Boolean(league) && Boolean(this.slot) && (league.hideFrom === null || this.slot.money < league.hideFrom);
  }

  /**
   * 리그 하나의 참여 카드를 만든다. 참가비, 금액 배율, 인공지능의 수를 보여주고,
   * 시작 자금이 참가비와 다르거나 승리 보상이 정해진 리그는 그것도 함께 보여준다.
   * @param {string} id 리그 식별자
   * @returns {HTMLElement} 리그 카드
   */
  buildLeagueCard(id) {
    let league = LEAGUES[id];
    return el('div', { class: 'hm-league', style: { '--hm-league': league.color }, data: { league: id } }, [
      el('h2', { class: 'hm-league-name', text: this.t('league.' + id) }),
      this.infoRow(this.t('lobby.fee'), league.fee > 0 ? this.figure(league.fee) : this.t('lobby.free')),
      league.cash !== league.fee ? this.infoRow(this.t('lobby.cash'), this.figure(league.cash)) : null,
      this.infoRow(this.t('lobby.multiplier'), this.t('lobby.times', { n: league.multiplier })),
      league.reward !== null ? this.infoRow(this.t('lobby.reward'), this.figure(league.reward)) : null,
      el('p', { class: 'hm-league-rivals', text: this.t('league.' + id + '.rivals') }),
      button(this.t('lobby.join'), 'lobby.join', id, 'hm-primary hm-wide'),
    ]);
  }

  /**
   * 리그 참여를 처리한다. 색상과 모양을 하나씩 장착했는지, 돈이 충분한지 확인하고, 한 번 더 확인받은 뒤 참가비를 차감하고 게임을 시작한다.
   * 장착한 색상과 모양이 게임에서 사용자의 생김새가 되고, 부적을 장착했으면 그 효과가 게임 내내 적용된다.
   * 대기실의 소모형 아이템은 모두 게임으로 옮겨지며, 게임이 끝나면 쓰지 않고 남은 것이 돌아온다. (`finishGame`)
   * 소모형 아이템을 쓸 수 없는 리그에서는 아이템을 옮기지 않고 대기실에 그대로 둔다. 참가비가 없는 리그는 돈을 차감하지 않는다.
   * @param {string} id 리그 식별자
   * @returns {Promise<void>}
   */
  async joinLeague(id) {
    if (this.screen !== 'lobby' || !this.leagueOpen(id)) return;
    let league = LEAGUES[id];
    let fee = league.fee;
    let params = { league: this.t('league.' + id), fee: this.money(fee), money: this.money(this.slot.money) };
    if (!this.slot.equipped.color || !this.slot.equipped.shape) {
      await this.dialog({ title: this.t('lobby.shortTitle'), text: this.t('lobby.needLook'), buttons: [{ label: this.t('common.ok'), value: 'ok', primary: true }] });
      return;
    }
    if (this.slot.money < fee) {
      await this.dialog({ title: this.t('lobby.shortTitle'), text: this.t('lobby.short', params), buttons: [{ label: this.t('common.ok'), value: 'ok', primary: true }] });
      return;
    }
    let stays = false;
    // 이 리그에서 쓸 수 없어 대기실에 남게 되는 아이템이 있는지 살핀다.
    for (let item in this.slot.items) stays = stays || (this.slot.items[item] > 0 && !itemFits(item, id));
    let question = this.t(fee > 0 ? 'lobby.confirm' : 'lobby.confirmFree', params) + (league.items ? (stays ? '\n' + this.t('lobby.otherItems') : '') : '\n' + this.t('lobby.noItems'));
    if (!(await this.confirm(this.t('lobby.confirmTitle'), question))) return;
    if (this.screen !== 'lobby' || !this.leagueOpen(id)) return;
    this.slot.money -= fee;
    this.slot.game = HellmarbleGame.create({ league: id, name: this.slot.name, items: this.slot.items, look: this.slot.equipped, charm: this.slot.equipped.charm });
    this.slot.items = splitItems(this.slot.items, id).left;
    this.saveSlot();
    this.showGame(true);
  }

  /**
   * 설정 화면(언어, 다크 모드)을 보여준다.
   */
  showSettings() {
    this.leaveGame();
    this.screen = 'settings';
    let languages = [];
    // 지원하는 언어마다 선택 버튼을 만든다.
    for (let code in TEXTS) languages.push(button(this.t('language.' + code), 'settings.language', code, this.settings.language === code ? 'hm-active' : ''));
    this.mount(el('div', { class: 'hm-page' }, [
      el('div', { class: 'hm-card' }, [
        el('h1', { class: 'hm-heading', text: this.t('settings.title') }),
        el('div', { class: 'hm-setting' }, [
          el('span', { class: 'hm-setting-label', text: this.t('settings.language') }),
          el('div', { class: 'hm-segment' }, languages),
        ]),
        el('div', { class: 'hm-setting' }, [
          el('span', { class: 'hm-setting-label', text: this.t('settings.dark') }),
          el('div', { class: 'hm-segment' }, [
            button(this.t('settings.on'), 'settings.dark', 'on', this.settings.dark ? 'hm-active' : ''),
            button(this.t('settings.off'), 'settings.dark', 'off', this.settings.dark ? '' : 'hm-active'),
          ]),
        ]),
        button(this.t('common.back'), 'menu.home', undefined, 'hm-wide'),
        button(this.t('settings.reset'), 'settings.reset', undefined, 'hm-danger hm-wide'),
      ]),
    ]));
  }

  /* ------------------------------ 아이템 창 (상점, 보유 목록) ------------------------------ */

  /**
   * 아이템의 표시 이름을 구한다. (소모형 아이템, 색상과 모양, 부적, 부적 추첨권 모두)
   * @param {string} id 아이템 식별자
   * @returns {string} 아이템 이름
   */
  itemName(id) {
    return this.t('item.' + id + '.title');
  }

  /**
   * 아이템의 종류를 구한다. 아이템 창은 네 종류를 함께 다루므로, 종류마다 다른 처리는 이 값으로 가른다.
   * @param {string} id 아이템 식별자
   * @returns {string} 'item' (게임에 가져가 쓰는 소모형 아이템), 'look' (색상과 모양), 'charm' (부적), 'ticket' (부적 추첨권)
   */
  itemKind(id) {
    if (isCharm(id)) return 'charm';
    if (isTicket(id)) return 'ticket';
    return isEquip(id) ? 'look' : 'item';
  }

  /**
   * 아이템의 구매 가격을 구한다. 상점에서 살 수 없는 것(기본 색상과 모양, 부적)은 0 이다.
   * @param {string} id 아이템 식별자
   * @returns {number} 구매 가격 (원)
   */
  itemPrice(id) {
    switch (this.itemKind(id)) {
      case 'charm': return 0;
      case 'ticket': return CHARM_TICKETS[id].price;
      case 'look': return EQUIPS[id].price;
      default: return ITEMS[id].price;
    }
  }

  /**
   * 아이템을 상점에 팔 때 한 개당 받는 금액을 구한다. 부적은 등급으로 정해진 금액이고, 그 밖의 아이템은 구매 가격의 일정 비율이다.
   * 팔 수 없는 것(기본 색상과 모양, 부적 추첨권)은 0 이다.
   * @param {string} id 아이템 식별자
   * @returns {number} 판매 금액 (원)
   */
  itemResale(id) {
    if (isCharm(id)) return CHARM_GRADES[CHARMS[id].grade].sell;
    return isTicket(id) ? 0 : Math.floor((this.itemPrice(id) * ITEM_SELL_PERCENT) / 100);
  }

  /**
   * 아이템의 분류를 구한다. 색상과 모양은 장착하는 자리가 곧 분류이고, 부적과 부적 추첨권은 같은 분류이다.
   * @param {string} id 아이템 식별자
   * @returns {string} 분류 (ITEM_CATEGORIES 의 값)
   */
  itemCategory(id) {
    switch (this.itemKind(id)) {
      case 'charm': return 'charm';
      case 'ticket': return 'charm';
      case 'look': return EQUIPS[id].slot;
      default: return ITEMS[id].category;
    }
  }

  /**
   * 아이템을 설명하는 문구를 구한다. 색상끼리, 모양끼리는 같은 문구를 쓰고, 부적은 효과의 종류별 문구에 확률 같은 값을 끼워 넣는다.
   * @param {string} id 아이템 식별자
   * @param {string} part 문구의 종류 ('brief' : 한 줄 요약, 'description' : 설명, 'when' : 사용 시점)
   * @returns {string} 문구
   */
  itemText(id, part) {
    switch (this.itemKind(id)) {
      case 'charm': return this.charmText(id, part);
      case 'ticket': return this.t('ticket.' + part, { n: CHARM_TICKETS[id].draws });
      case 'look': return this.t('equip.' + EQUIPS[id].slot + '.' + part);
      default: return this.t('item.' + id + '.' + part);
    }
  }

  /**
   * 부적을 설명하는 문구를 구한다. 더블 부적에는 보통 주사위에서 더블이 나올 확률(6분의 1)에 부적의 값을 더한 확률도 알려준다.
   * 건물 부적의 자세한 설명에는 우주여행 코스에서 기지를 지어 주는 효과로 바뀐다는 것과 그 확률을 덧붙인다.
   * @param {string} id 부적 식별자
   * @param {string} part 문구의 종류 ('brief', 'description', 'when')
   * @returns {string} 문구
   */
  charmText(id, part) {
    let charm = CHARMS[id];
    let params = { chance: charm.chance, percent: charm.percent, total: Math.round((100 / 6 + charm.chance) * 10) / 10, building: charm.building ? this.t('building.' + charm.building) : '' };
    if (part === 'when') return this.t('charm.when');
    let text = this.t('charm.' + charm.effect + '.' + (part === 'description' && charm.revisit ? 'revisit' : part), params);
    return part === 'description' && charm.base ? text + ' ' + this.t('charm.build.space', { base: charm.base }) : text;
  }

  /**
   * 부적의 등급 이름을 구한다.
   * @param {string} id 부적 식별자
   * @returns {string} 등급 이름
   */
  gradeName(id) {
    return this.t('charm.grade.' + CHARMS[id].grade);
  }

  /**
   * 아이템 창이 다루는 아이템의 식별자 목록을 구한다. 소모형 아이템, 색상과 모양, 부적 추첨권, 부적의 순서로 나열한다.
   * 게임 중에는 소모형 아이템과 부적만 다룬다. 부적은 자세한 설명을 보여줄 뿐이며, 게임 중에는 생김새와 부적을 바꿀 수 없다.
   * @param {string} source 창의 종류 ('shop', 'lobby', 'game')
   * @returns {string[]} 아이템 식별자 목록
   */
  itemIds(source) {
    return source === 'game' ? [...Object.keys(ITEMS), ...Object.keys(CHARMS)] : [...Object.keys(ITEMS), ...Object.keys(EQUIPS), ...Object.keys(CHARM_TICKETS), ...Object.keys(CHARMS)];
  }

  /**
   * 아이템을 몇 개 가지고 있는지 구한다. 게임 중에는 게임에 가져간 것을, 대기실에서는 슬롯에 보관한 것을 센다. 부적은 게임에 가져가지 않으므로 언제나 슬롯에 보관한 것을 센다.
   * 색상과 모양은 가지고 있으면 1 이고, 부적 추첨권은 사는 즉시 쓰이므로 언제나 0 이다.
   * @param {string} source 창의 종류 ('shop', 'lobby', 'game')
   * @param {string} id 아이템 식별자
   * @returns {number} 가진 개수
   */
  itemStock(source, id) {
    switch (this.itemKind(id)) {
      case 'charm': return this.slot.charms[id];
      case 'ticket': return 0;
      case 'look': return source === 'game' ? 0 : this.slot.equips[id];
      default: return source === 'game' ? this.game.state.players[0].items[id] : this.slot.items[id];
    }
  }

  /**
   * 가진 아이템의 종류 수와 전체 개수를 센다. 부적도 함께 세며, 대기실에서는 색상과 모양도 센다.
   * @param {string} source 창의 종류 ('shop', 'lobby', 'game')
   * @returns {{kinds: number, count: number}} 가진 아이템의 종류 수와 전체 개수
   */
  itemTotals(source) {
    let totals = { kinds: 0, count: 0 };
    // 아이템 종류마다 가진 개수를 더한다.
    for (let id of this.itemIds(source)) {
      let stock = this.itemStock(source, id);
      totals.kinds += stock > 0 ? 1 : 0;
      totals.count += stock;
    }
    return totals;
  }

  /**
   * 같은 사용 제한 묶음에 속한 아이템의 이름을 쉼표로 이어 쓴다.
   * @param {string} limit 사용 제한 묶음의 이름
   * @returns {string} 아이템 이름을 이은 문자열
   */
  itemGroupText(limit) {
    let names = [];
    // 묶음에 속한 아이템의 이름을 모은다.
    for (let id of itemsOfLimit(limit)) names.push(this.itemName(id));
    return names.join(', ');
  }

  /**
   * 아이템을 이번 게임에서 얼마나 쓸 수 있는지 설명하는 문구를 구한다. (상세 팝업의 "사용 제한")
   * @param {string} id 아이템 식별자
   * @returns {string} 문구
   */
  itemLimitText(id) {
    switch (this.itemKind(id)) {
      case 'charm': return this.t('charm.limit');
      case 'ticket': return this.t('ticket.limit');
      case 'look': return this.t(EQUIPS[id].price > 0 ? 'equip.limit.extra' : 'equip.limit.basic');
      default:
        if (limitUses(ITEMS[id].limit) > 1) return this.t('item.limit.times', { n: limitUses(ITEMS[id].limit) });
        return itemsOfLimit(ITEMS[id].limit).length > 1 ? this.t('item.limit.shared', { items: this.itemGroupText(ITEMS[id].limit) }) : this.t('item.limit.single');
    }
  }

  /**
   * 아이템을 쓸 수 있는 코스를 설명하는 문구를 구한다. (상세 팝업의 "사용 코스")
   * @param {string} id 소모형 아이템의 식별자
   * @returns {string} 코스의 이름. 어느 코스에서나 쓸 수 있으면 그렇다고 알린다.
   */
  itemCourseText(id) {
    return this.t(ITEMS[id].course ? 'course.' + ITEMS[id].course : 'item.course.any');
  }

  /**
   * 게임 중인 사용자가 이번 게임에서 아이템을 몇 번 더 쓸 수 있는지 구한다. (가진 수량과는 관계없이 사용 제한 묶음의 남은 횟수이다.)
   * @param {string} id 소모형 아이템의 식별자
   * @returns {number} 남은 사용 횟수
   */
  itemUsesLeft(id) {
    return Math.max(0, limitUses(ITEMS[id].limit) - this.game.state.players[0].usedItems[ITEMS[id].limit]);
  }

  /**
   * 아이템을 지금 장착하고 있는지 확인한다. 부적의 장착 여부는 아이템 확인 창에서만 알려준다.
   * 게임 중에는 이번 게임에 적용되는 부적(참여할 때 장착하고 있던 것)을 장착한 것으로 본다.
   * @param {string} source 창의 종류 ('shop', 'lobby', 'game')
   * @param {string} id 아이템 식별자
   * @returns {boolean} 장착하고 있으면 true
   */
  itemWorn(source, id) {
    if (source === 'game') return isCharm(id) && this.game.state.players[0].charm === id;
    if (isEquip(id)) return this.slot.equipped[EQUIPS[id].slot] === id;
    return isCharm(id) && source === 'lobby' && this.slot.equipped.charm === id;
  }

  /**
   * 아이템 창의 현재 탭에 나열할 아이템의 식별자 목록을 구한다. (분류는 적용하지 않은 것이다.)
   * 상점의 구매 탭에는 살 수 있는 것 전부를, 판매 탭에는 가진 것 가운데 팔 수 있는 것을, 보유 목록에는 가진 것을 나열한다.
   * 그래서 기본 색상과 모양은 보유 목록에만, 부적은 판매 탭과 보유 목록에만, 부적 추첨권은 구매 탭에만 나온다.
   * @param {Object} view 아이템 창의 상태
   * @returns {string[]} 아이템 식별자 목록
   */
  listItems(view) {
    let list = [];
    // 아이템마다 이 탭에 보일 것인지 확인한다.
    for (let id of this.itemIds(view.source)) {
      let stock = this.itemStock(view.source, id);
      let shown = view.source !== 'shop' ? stock > 0 : view.tab === 'buy' ? this.itemPrice(id) > 0 : stock > 0 && this.itemResale(id) > 0;
      if (shown) list.push(id);
    }
    return list;
  }

  /**
   * 상점의 상세 팝업에서 한 번에 사고팔 수 있는 최대 수량을 구한다. 구매는 가진 돈으로 살 수 있는 만큼, 판매는 가진 만큼이다.
   * 색상과 모양은 종류마다 하나만 가질 수 있으므로 이미 가지고 있으면 살 수 없고, 부적 추첨권은 한 번에 하나씩 산다.
   * @param {Object} view 아이템 창의 상태
   * @returns {number} 최대 수량 (사거나 팔 수 없으면 0)
   */
  itemLimit(view) {
    let id = view.detail;
    let kind = this.itemKind(id);
    let stock = this.itemStock('shop', id);
    let most = view.tab === 'buy' ? Math.floor(this.slot.money / this.itemPrice(id)) : stock;
    if (view.tab === 'buy' && kind === 'look') most = Math.min(most, 1 - stock);
    if (view.tab === 'buy' && kind === 'ticket') most = Math.min(most, 1);
    return Math.min(ITEM_BULK, most);
  }

  /**
   * 게임 중 아이템 목록에서, 아이템을 지금 직접 사용할 수 없는 이유를 구한다.
   * @param {string} id 아이템 식별자
   * @returns {string} 사용할 수 없는 이유를 설명하는 문구. 지금 사용할 수 있으면 빈 문자열
   */
  itemBlock(id) {
    let item = ITEMS[id];
    let uses = limitUses(item.limit);
    if (this.itemUsesLeft(id) < 1) {
      if (uses > 1) return this.t('item.block.spentTimes', { n: uses });
      return itemsOfLimit(item.limit).length > 1 ? this.t('item.block.shared', { items: this.itemGroupText(item.limit) }) : this.t('item.block.spent');
    }
    if (item.use !== 'turn') return this.t('item.block.ask');
    if (this.mode !== 'roll') return this.t('item.block.turn');
    return '';
  }

  /**
   * 아이템 창(대기실의 상점, 보유 아이템 목록)을 연다.
   * 창은 분류 버튼과 스크롤되는 아이템 카드 목록으로 이루어지며, 카드를 누르면 그 위에 상세 정보 팝업이 뜬다.
   * 상점의 상세 팝업에서는 사고팔거나 부적을 추첨하고, 대기실에서는 색상과 모양, 부적을 장착하며, 게임 중에는 주사위를 굴릴 차례에 쓰는 아이템을 사용한다.
   * @param {string} source 창의 종류 ('shop' : 대기실 상점, 'lobby' : 대기실의 보유 목록, 'game' : 게임 중의 보유 목록)
   * @param {string} [detail] 창을 열면서 바로 상세 정보를 보여줄 아이템의 식별자
   * @returns {Promise<void>} 창이 닫히면 이행된다.
   */
  async openItems(source, detail) {
    let allowed = source === 'game'
      ? this.screen === 'game' && Boolean(this.game) && this.game.current.id === 0 && ['roll', 'travel'].includes(this.mode)
      : this.screen === 'lobby' && Boolean(this.slot);
    if (!allowed) return;
    this.closePopover();
    this.closeDialog(null);
    let handle = defer();
    let win = el('div', { class: 'hm-modal hm-items', attrs: { role: 'dialog', 'aria-modal': 'true' } });
    let overlay = el('div', { class: 'hm-overlay' }, [win]);
    let view = { source, tab: source === 'shop' ? 'buy' : 'own', filter: 'all', detail: null, last: '', quantity: 1, notice: '', reveal: null, rewind: false, overlay, win, layer: null, card: null };
    this.root.append(overlay);
    this.modal = { overlay, handle };
    this.itemView = view;
    if (detail && this.listItems(view).includes(detail)) Object.assign(view, { detail, last: detail });
    this.renderItems();
    await handle.promise;
    if (source !== 'game' && this.screen === 'lobby' && this.slot && !this.modal) this.showLobby();
  }

  /**
   * 아이템 창에서 누른 동작을 처리한 뒤 창을 다시 그린다.
   * @param {string} name 동작 이름 ('items.' 뒤의 부분 : close, tab, filter, pick, back, less, more, max, trade, equip, unequip, done, use)
   * @param {string} [value] 동작에 딸린 값 (탭, 분류, 아이템 식별자)
   */
  onItemAction(name, value) {
    let view = this.itemView;
    if (!view) return;
    switch (name) {
      case 'close': this.closeDialog('close'); return;
      case 'use': this.useGameItem(view.detail); return;
      case 'tab':
        if (view.source !== 'shop' || !['buy', 'sell'].includes(value)) return;
        Object.assign(view, { tab: value, filter: 'all', notice: '', rewind: true });
        break;
      case 'filter':
        if (value !== 'all' && !ITEM_CATEGORIES.includes(value)) return;
        Object.assign(view, { filter: value, rewind: true });
        break;
      case 'pick':
        if (!this.listItems(view).includes(value)) return;
        Object.assign(view, { detail: value, last: value, quantity: 1, notice: '', reveal: null });
        break;
      case 'back': Object.assign(view, { detail: null, reveal: null }); break;
      case 'done': view.reveal = null; break;
      case 'less': view.quantity--; break;
      case 'more': view.quantity++; break;
      case 'max': view.quantity = ITEM_BULK; break;
      case 'trade': this.tradeItem(view); break;
      case 'equip': this.equipItem(view, true); break;
      case 'unequip': this.equipItem(view, false); break;
      default: return;
    }
    if (view.source === 'shop' && view.detail) view.quantity = Math.min(Math.max(1, view.quantity), Math.max(1, this.itemLimit(view)));
    this.renderItems();
  }

  /**
   * 상점의 상세 팝업에서 정한 수량만큼 아이템을 사거나 판 뒤 저장한다. 결과는 안내 문구로 남긴다.
   * 부적 추첨권을 사면 그 자리에서 추첨한다. 판매하여 남은 것이 없으면 상세 팝업을 닫으며, 장착하고 있던 것을 다 팔면 그 자리는 비게 된다.
   * @param {Object} view 아이템 창의 상태
   */
  tradeItem(view) {
    let id = view.detail;
    if (view.source !== 'shop' || !id || this.screen !== 'lobby' || !this.slot) return;
    let kind = this.itemKind(id);
    let bag = kind === 'look' ? this.slot.equips : kind === 'charm' ? this.slot.charms : this.slot.items;
    let count = Math.min(Math.max(1, view.quantity), this.itemLimit(view));
    let name = this.itemName(id);
    if (count < 1) return;
    if (kind === 'ticket') {
      this.drawCharms(view);
      return;
    }
    if (view.tab === 'buy') {
      this.slot.money -= this.itemPrice(id) * count;
      bag[id] += count;
      view.notice = kind === 'look' ? this.t('store.boughtOne', { item: name }) : this.t('store.bought', { item: name, n: count, total: bag[id] });
    } else {
      let proceeds = this.itemResale(id) * count;
      bag[id] -= count;
      this.slot.money += proceeds;
      view.notice = kind === 'look' ? this.t('store.soldOne', { item: name, amount: this.money(proceeds) }) : this.t('store.sold', { item: name, n: count, amount: this.money(proceeds), total: bag[id] });
      if (bag[id] < 1) view.detail = null;
    }
    if (kind === 'look' && bag[id] < 1 && this.slot.equipped[EQUIPS[id].slot] === id) {
      this.slot.equipped[EQUIPS[id].slot] = null;
      view.notice += ' ' + this.t('equip.sold', { slot: this.t('equip.slot.' + EQUIPS[id].slot) });
    }
    if (kind === 'charm' && bag[id] < 1 && this.slot.equipped.charm === id) {
      this.slot.equipped.charm = null;
      view.notice += ' ' + this.t('charm.sold');
    }
    view.quantity = 1;
    this.saveSlot();
  }

  /**
   * 부적 추첨권을 사서 그 자리에서 부적을 추첨한다. 추첨권에 적힌 수만큼 하나씩 따로 추첨하며, 이미 가진 부적이 또 나올 수 있다.
   * 얻은 부적을 보유 수량에 더해 저장하고, 상세 팝업을 추첨 결과를 보여주는 화면으로 바꾼다.
   * @param {Object} view 아이템 창의 상태
   */
  drawCharms(view) {
    let ticket = CHARM_TICKETS[view.detail];
    let drawn = [];
    if (!ticket || this.slot.money < ticket.price) return;
    this.slot.money -= ticket.price;
    // 추첨권에 적힌 수만큼 부적을 하나씩 추첨하여 보유 수량에 더한다.
    for (let count = 0; count < ticket.draws; count++) {
      let id = drawCharm(this.random);
      this.slot.charms[id]++;
      drawn.push(id);
    }
    Object.assign(view, { reveal: drawn, notice: '' });
    this.saveSlot();
  }

  /**
   * 상세 팝업에서 보고 있는 색상, 모양 또는 부적을 장착하거나(부적은 해제도) 한 뒤 저장한다.
   * 가지고 있는 것만 장착할 수 있으며, 같은 자리에 장착했던 것은 빠진다. 부적은 아이템 확인 창에서만 장착하고 해제한다.
   * @param {Object} view 아이템 창의 상태
   * @param {boolean} on 장착하면 true, 장착을 해제하면 false
   */
  equipItem(view, on) {
    let id = view.detail;
    let kind = this.itemKind(id);
    if (view.source === 'game' || this.screen !== 'lobby' || !this.slot || this.itemStock(view.source, id) < 1) return;
    if (kind === 'look' && on) {
      this.slot.equipped[EQUIPS[id].slot] = id;
    } else if (kind === 'charm' && view.source === 'lobby' && (on || this.slot.equipped.charm === id)) {
      this.slot.equipped.charm = on ? id : null;
    } else {
      return;
    }
    view.notice = this.t(on ? 'equip.done' : 'charm.undone', { item: this.itemName(id) });
    this.saveSlot();
  }

  /**
   * 게임 중 아이템 목록에서 고른 아이템을 사용한다. 한 번 더 확인받은 뒤, 주사위를 굴릴 차례의 입력에 아이템 사용으로 답한다.
   * 확인을 취소하면 아이템 목록의 상세 팝업으로 돌아간다.
   * @param {string} id 아이템 식별자
   * @returns {Promise<void>}
   */
  async useGameItem(id) {
    let game = this.game;
    if (!game || this.screen !== 'game' || !Object.hasOwn(ITEMS, id) || ITEMS[id].use !== 'turn' || this.itemBlock(id) !== '') return;
    let confirmed = await this.confirm(
      ITEMS[id].icon + ' ' + this.t('item.use.title', { item: this.itemName(id) }),
      this.t('item.' + id + '.description') + '\n\n' + this.t('item.use.note'),
      this.t('item.use'),
      this.t('load.cancel'),
    );
    if (this.game !== game || this.mode !== 'roll') return;
    if (confirmed) this.answer('roll', ITEM_PREFIX + id);
    else this.openItems('game', id);
  }

  /**
   * 아이템 창의 내용을 현재 상태(탭, 분류, 고른 아이템, 수량, 안내 문구, 추첨 결과)에 맞게 다시 그린다.
   * 창과 상세 팝업의 틀은 그대로 두고 안의 내용만 바꾸므로, 다시 그려도 창이 깜빡이지 않는다.
   * 목록의 스크롤 위치와 초점도 다시 그리기 전의 자리로 되돌린다. 다만 탭이나 분류를 바꿔 목록이 달라졌으면 맨 위부터 보여준다.
   */
  renderItems() {
    let view = this.itemView;
    if (!view) return;
    let active = document.activeElement instanceof HTMLElement && view.overlay.contains(document.activeElement) ? document.activeElement : null;
    let key = active && active.dataset.action ? '[data-action="' + active.dataset.action + '"]' + (active.dataset.value === undefined ? '' : '[data-value="' + active.dataset.value + '"]') : '';
    let grid = view.win.querySelector('.hm-item-grid');
    let scroll = grid && !view.rewind ? grid.scrollTop : 0;
    view.rewind = false;
    view.win.replaceChildren(...this.buildItemWindow(view));
    grid = view.win.querySelector('.hm-item-grid');
    if (grid) grid.scrollTop = scroll;
    if (view.detail && !view.layer) {
      view.card = el('div', { class: 'hm-modal hm-item-detail', attrs: { role: 'dialog', 'aria-modal': 'true' } });
      view.layer = el('div', { class: 'hm-layer' }, [view.card]);
      view.overlay.append(view.layer);
    }
    if (!view.detail && view.layer) {
      view.layer.remove();
      view.layer = null;
      view.card = null;
    }
    if (view.card) {
      view.card.classList.toggle('hm-draw', Boolean(view.reveal));
      view.card.replaceChildren(...(view.reveal ? this.buildDrawReveal(view) : this.buildItemDetail(view)));
    }
    view.win.inert = Boolean(view.detail);
    let scope = view.layer || view.win;
    let same = key ? scope.querySelector(key) : null;
    let fallback = view.layer
      ? scope.querySelector('.hm-modal-buttons .hm-button:not(:disabled)')
      : scope.querySelector('.hm-item-card[data-value="' + view.last + '"]') || scope.querySelector('.hm-items-foot .hm-button');
    let target = same && !same.disabled ? same : fallback;
    if (target) target.focus({ preventScroll: true });
  }

  /**
   * 아이템 창의 내용(제목과 보유 현황, 안내, 탭과 분류 버튼, 아이템 카드 목록, 닫기 버튼)을 만든다.
   * @param {Object} view 아이템 창의 상태
   * @returns {HTMLElement[]} 창 안에 넣을 요소 목록
   */
  buildItemWindow(view) {
    let shop = view.source === 'shop';
    let all = this.listItems(view);
    let totals = this.itemTotals(view.source);
    let counts = { all: all.length };
    let cards = [];
    let chips = [];
    let tabs = [];
    let wallet = [];
    // 이 창이 다루는 아이템의 분류마다 아이템의 수를 0부터 센다. (게임 중에는 색상과 모양 분류가 없다.)
    for (let id of this.itemIds(view.source)) counts[this.itemCategory(id)] = 0;
    // 이 탭의 아이템을 분류별로 세고, 고른 분류에 속한 것은 카드로 만든다.
    for (let id of all) {
      counts[this.itemCategory(id)]++;
      if (view.filter === 'all' || view.filter === this.itemCategory(id)) cards.push(this.buildItemCard(view, id));
    }
    // 전체와 각 분류를 고르는 버튼을 만든다.
    for (let category of ['all', ...ITEM_CATEGORIES]) {
      if (counts[category] === undefined) continue;
      let chip = button(this.t('item.category.' + category) + ' ' + counts[category], 'items.filter', category, 'hm-chip' + (view.filter === category ? ' hm-active' : ''));
      chip.setAttribute('aria-pressed', String(view.filter === category));
      chips.push(chip);
    }
    // 상점이면 구매 탭과 판매 탭을 만든다.
    for (let tab of shop ? ['buy', 'sell'] : []) {
      let node = button(this.t('store.tab.' + tab), 'items.tab', tab, 'hm-tab' + (view.tab === tab ? ' hm-active' : ''));
      node.setAttribute('aria-pressed', String(view.tab === tab));
      tabs.push(node);
    }
    if (shop) wallet.push(el('span', { class: 'hm-items-stat' }, [el('span', { class: 'hm-items-stat-label', text: this.t('store.money') }), el('strong', { class: 'hm-items-stat-value hm-items-money', text: this.money(this.slot.money) })]));
    wallet.push(el('span', { class: 'hm-items-stat' }, [el('span', { class: 'hm-items-stat-label', text: this.t('item.owned') }), el('strong', { class: 'hm-items-stat-value hm-items-count', text: this.t('item.total', totals) })]));
    let empty = all.length > 0 ? 'item.noneIn' : view.tab === 'sell' ? 'store.nothing' : view.source === 'lobby' ? 'item.noneLobby' : 'item.none';
    let cross = el('button', { class: 'hm-items-x', text: '✕', data: { action: 'items.close' }, attrs: { type: 'button', 'aria-label': this.t('common.close'), title: this.t('common.close') } });
    return [
      el('div', { class: 'hm-items-head' }, [
        el('h2', { class: 'hm-modal-title', text: (shop ? '🛒 ' : '🎒 ') + this.t(shop ? 'store.title' : 'item.owned') }),
        el('div', { class: 'hm-items-stats' }, wallet),
        cross,
      ]),
      el('p', { class: 'hm-modal-text hm-items-hint', text: shop ? this.t('store.hint', { n: ITEM_SELL_PERCENT }) : this.itemHint(view.source) }),
      el('div', { class: 'hm-items-bar' }, [tabs.length > 0 ? el('div', { class: 'hm-tabs' }, tabs) : null, el('div', { class: 'hm-chips' }, chips)]),
      el('div', { class: 'hm-item-grid' }, cards.length > 0 ? cards : [el('p', { class: 'hm-item-empty', text: this.t(empty) })]),
      el('div', { class: 'hm-items-foot' }, [
        el('p', { class: 'hm-items-notice', text: view.notice, attrs: { role: 'status' } }),
        button(this.t('common.close'), 'items.close', undefined, 'hm-primary'),
      ]),
    ];
  }

  /**
   * 아이템을 나타내는 그림을 만든다. 그림 문자가 같은 아이템은 덧붙인 표시로 구분한다.
   * 색상과 모양은 그것을 장착했을 때의 말을 그려서 보여주고(다른 자리에는 지금 장착한 것을 쓴다.), 부적은 등급의 색을 바탕에 깐다.
   * @param {string} id 아이템 식별자
   * @returns {HTMLElement} 아이템 그림
   */
  buildItemIcon(id) {
    let kind = this.itemKind(id);
    if (kind === 'look') {
      let look = { ...this.slot.equipped, [EQUIPS[id].slot]: id };
      return el('span', { class: 'hm-item-icon hm-item-icon-look', attrs: { 'aria-hidden': 'true' } }, [this.buildLookToken(look)]);
    }
    if (kind === 'charm') return el('span', { class: 'hm-item-icon hm-item-icon-charm hm-grade-' + CHARMS[id].grade, text: CHARMS[id].icon, attrs: { 'aria-hidden': 'true' } });
    let item = kind === 'ticket' ? CHARM_TICKETS[id] : ITEMS[id];
    return el('span', { class: 'hm-item-icon hm-item-icon-' + this.itemCategory(id), attrs: { 'aria-hidden': 'true' } }, [item.icon, item.badge ? el('span', { class: 'hm-item-mark', text: item.badge }) : null]);
  }

  /**
   * 아이템 목록의 카드 하나를 만든다. 누르면 그 아이템의 상세 팝업이 뜬다.
   * 상점에서는 가격(판매 탭에서는 판매 가격)을, 게임 중에는 이번 게임에서 이미 썼는지를, 장착형 아이템은 장착 중인지를, 부적은 등급을 함께 보여준다.
   * @param {Object} view 아이템 창의 상태
   * @param {string} id 아이템 식별자
   * @returns {HTMLButtonElement} 아이템 카드
   */
  buildItemCard(view, id) {
    let kind = this.itemKind(id);
    let owned = this.itemStock(view.source, id);
    let worn = this.itemWorn(view.source, id);
    let spent = kind === 'item' && view.source === 'game' && this.itemUsesLeft(id) < 1;
    let meta = [];
    if (view.source === 'shop') meta.push(el('span', { class: 'hm-item-price', text: this.money(view.tab === 'sell' ? this.itemResale(id) : this.itemPrice(id)) }));
    if (kind === 'charm') meta.push(el('span', { class: 'hm-item-flag hm-grade-tag hm-grade-' + CHARMS[id].grade, text: this.gradeName(id) }));
    if (kind === 'look' && owned > 0 && view.tab === 'buy') meta.push(el('span', { class: 'hm-item-stock', text: this.t('equip.owned') }));
    if (kind !== 'look' && owned > 0) meta.push(el('span', { class: 'hm-item-stock', text: view.tab === 'buy' ? this.t('store.owned', { n: owned }) : '×' + owned }));
    if (worn) meta.push(el('span', { class: 'hm-item-flag hm-item-worn', text: this.t('equip.on') }));
    if (spent) meta.push(el('span', { class: 'hm-item-flag', text: this.t('item.state.spent') }));
    return el('button', { class: 'hm-item-card' + (spent ? ' hm-item-spent' : '') + (worn ? ' hm-item-on' : ''), data: { action: 'items.pick', value: id }, attrs: { type: 'button' } }, [
      this.buildItemIcon(id),
      el('span', { class: 'hm-item-main' }, [
        el('span', { class: 'hm-item-name', text: this.itemName(id) }),
        el('span', { class: 'hm-item-brief', text: this.itemText(id, 'brief') }),
        el('span', { class: 'hm-item-meta' }, meta),
      ]),
    ]);
  }

  /**
   * 상점의 상세 팝업에서 수량을 정하고 합계를 보는 영역을 만든다. (여러 개를 가질 수 있는 소모형 아이템과 부적에 쓴다.)
   * @param {Object} view 아이템 창의 상태
   * @param {number} most 한 번에 사고팔 수 있는 최대 수량
   * @returns {HTMLElement} 수량 조절 영역
   */
  buildItemTrade(view, most) {
    let unit = view.tab === 'buy' ? this.itemPrice(view.detail) : this.itemResale(view.detail);
    let less = button('−', 'items.less', undefined, 'hm-step');
    let more = button('+', 'items.more', undefined, 'hm-step');
    let max = button(this.t('store.max'), 'items.max', undefined, 'hm-step hm-step-max');
    less.disabled = view.quantity <= 1;
    more.disabled = view.quantity >= most;
    max.disabled = view.quantity >= most;
    less.setAttribute('aria-label', this.t('store.less'));
    more.setAttribute('aria-label', this.t('store.more'));
    return el('div', { class: 'hm-trade' }, [
      el('div', { class: 'hm-trade-count' }, [el('span', { class: 'hm-trade-label', text: this.t('store.quantity') }), less, el('output', { class: 'hm-trade-number', text: view.quantity }), more, max]),
      el('div', { class: 'hm-trade-total' }, [el('span', { class: 'hm-trade-label', text: this.t('store.total.' + view.tab) }), el('strong', { class: 'hm-trade-money', text: this.money(unit * view.quantity) })]),
    ]);
  }

  /**
   * 부적 추첨에서 등급별로 나올 확률을 한 줄로 정리한다. (예 : "일반 82.6% · 고급 16.5% · 희귀 0.826% · 전설 0.0413%")
   * @returns {string} 등급별 확률
   */
  drawOdds() {
    let total = 0;
    let parts = [];
    // 등급 가중치의 합을 구한다.
    for (let grade in CHARM_GRADES) total += CHARM_GRADES[grade].weight;
    // 등급마다 확률을 유효숫자 세 자리의 백분율로 적는다.
    for (let grade in CHARM_GRADES) parts.push(this.t('ticket.chance', { grade: this.t('charm.grade.' + grade), percent: Number(((CHARM_GRADES[grade].weight / total) * 100).toPrecision(3)) }));
    return parts.join(' · ');
  }

  /**
   * 아이템 상세 팝업에 넣을 정보 줄(가격, 등급, 보유 수량, 장착 여부)을 만든다. 아이템의 종류와 창에 따라 보여주는 줄이 다르다.
   * @param {Object} view 아이템 창의 상태
   * @returns {HTMLElement[]} 정보 줄 목록
   */
  buildItemRows(view) {
    let id = view.detail;
    let kind = this.itemKind(id);
    let owned = this.itemStock(view.source, id);
    let worn = this.itemWorn(view.source, id);
    let rows = [];
    if (kind === 'charm') rows.push(this.infoRow(this.t('charm.info.grade'), el('span', { class: 'hm-item-flag hm-grade-tag hm-grade-' + CHARMS[id].grade, text: this.gradeName(id) })));
    if (view.source === 'shop' && kind !== 'charm') rows.push(this.infoRow(this.t('store.priceBuy'), this.figure(this.itemPrice(id))));
    if (view.source === 'shop' && (kind === 'item' || kind === 'look')) rows.push(this.infoRow(this.t('store.priceSell', { n: ITEM_SELL_PERCENT }), this.figure(this.itemResale(id))));
    if (view.source === 'shop' && kind === 'charm') rows.push(this.infoRow(this.t('charm.info.sell'), this.figure(this.itemResale(id))));
    if (kind === 'look') rows.push(this.infoRow(this.t('equip.info.owned'), this.t(owned > 0 ? 'equip.owned' : 'equip.missing')));
    if (kind === 'item' || kind === 'charm') rows.push(this.infoRow(this.t('item.count'), this.t('common.count', { n: owned })));
    if (kind === 'look' || (kind === 'charm' && view.source !== 'shop')) rows.push(this.infoRow(this.t('equip.info.state'), this.t(worn ? 'equip.on' : 'equip.off'), worn));
    return rows;
  }

  /**
   * 아이템 상세 팝업의 내용을 만든다. 설명, 사용 시점과 사용 제한, 가격과 보유 현황을 보여준다.
   * 상점에서는 사고파는 버튼(여러 개를 가질 수 있는 것은 수량 조절 포함)이나 추첨 버튼을, 장착형 아이템에는 장착 버튼을, 게임 중에는 직접 쓰는 아이템의 사용 버튼을 더한다.
   * @param {Object} view 아이템 창의 상태
   * @returns {HTMLElement[]} 상세 팝업 안에 넣을 요소 목록
   */
  buildItemDetail(view) {
    let id = view.detail;
    let kind = this.itemKind(id);
    let shop = view.source === 'shop';
    let game = view.source === 'game';
    let owned = this.itemStock(view.source, id);
    let worn = this.itemWorn(view.source, id);
    let rows = this.buildItemRows(view);
    let facts = [el('dt', { text: this.t('item.info.when') }), el('dd', { text: this.itemText(id, 'when') }), el('dt', { text: this.t('item.info.limit') }), el('dd', { text: this.itemLimitText(id) })];
    let buttons = [];
    let trade = null;
    let reason = '';
    if (kind === 'ticket') facts.push(el('dt', { text: this.t('ticket.odds') }), el('dd', { class: 'hm-num', text: this.drawOdds() }));
    if (kind === 'item') facts.push(el('dt', { text: this.t('item.info.course') }), el('dd', { text: this.itemCourseText(id) }));
    if (shop) {
      let most = this.itemLimit(view);
      let label = kind === 'ticket' ? this.t('ticket.draw') : kind === 'look' ? this.t('store.tab.' + view.tab) : this.t('store.' + view.tab, { n: view.quantity });
      let deal = button(label, 'items.trade', undefined, 'hm-primary');
      deal.disabled = most < 1;
      if (most < 1 && view.tab === 'buy') reason = this.t(kind === 'look' && owned > 0 ? 'store.have' : 'store.short');
      if (shop && kind === 'charm' && reason === '') reason = this.t('charm.shopOnly');
      if (kind === 'item' || kind === 'charm') trade = this.buildItemTrade(view, most);
      buttons.push(deal);
    }
    if (kind === 'look' && !game && owned > 0) {
      let wear = button(this.t(worn ? 'equip.on' : 'equip.equip'), 'items.equip', undefined, shop ? '' : 'hm-primary');
      wear.disabled = worn;
      buttons.push(wear);
    }
    if (kind === 'charm' && view.source === 'lobby') buttons.push(button(this.t(worn ? 'charm.unequip' : 'equip.equip'), worn ? 'items.unequip' : 'items.equip', undefined, worn ? '' : 'hm-primary'));
    if (game && kind === 'charm') reason = this.t('charm.gameOnly');
    if (game && kind === 'item') {
      let left = this.itemUsesLeft(id);
      let state = left < 1 ? this.t('item.state.spent') : limitUses(ITEMS[id].limit) > 1 ? this.t('item.state.left', { n: left }) : this.t('item.state.ready');
      reason = this.itemBlock(id);
      rows.push(this.infoRow(this.t('item.info.state'), state, true));
    }
    if (game && kind === 'item' && ITEMS[id].use === 'turn') {
      let use = button(this.t('item.use'), 'items.use', undefined, 'hm-primary');
      use.disabled = reason !== '';
      buttons.push(use);
    }
    buttons.push(button(this.t('common.close'), 'items.back'));
    let nodes = [
      el('div', { class: 'hm-item-detail-head' }, [
        this.buildItemIcon(id),
        el('div', { class: 'hm-item-detail-title' }, [
          el('h3', { class: 'hm-modal-title', text: this.itemName(id) }),
          el('span', { class: 'hm-item-tag', text: this.t('item.category.' + this.itemCategory(id)) }),
        ]),
      ]),
      el('p', { class: 'hm-modal-text', text: this.itemText(id, 'description') }),
      el('dl', { class: 'hm-item-facts' }, facts),
    ];
    if (rows.length > 0) nodes.push(el('div', { class: 'hm-land-rows' }, rows));
    if (trade) nodes.push(trade);
    nodes.push(el('p', { class: 'hm-items-notice' + (view.notice ? '' : ' hm-items-reason'), text: view.notice || reason, attrs: { role: 'status' } }));
    nodes.push(el('div', { class: 'hm-modal-buttons' }, buttons));
    return nodes;
  }

  /**
   * 부적 추첨의 결과를 보여주는 화면을 만든다. 뽑힌 부적마다 봉투가 차례로 뒤집히며 등급과 이름이 드러난다.
   * 봉투가 뒤집히는 차례와 빛나는 효과는 CSS 의 움직임으로 표현하며, 등급이 높을수록 화려하다. (.hm-grade-<등급>)
   * 모두 드러난 뒤에는 가장 높은 등급과 등급별 개수를 알려주고, 돈이 충분하면 한 번 더 추첨할 수 있다.
   * @param {Object} view 아이템 창의 상태 (view.reveal 에 뽑힌 부적의 식별자가 순서대로 들어 있다.)
   * @returns {HTMLElement[]} 상세 팝업 안에 넣을 요소 목록
   */
  buildDrawReveal(view) {
    let grades = Object.keys(CHARM_GRADES);
    let ticket = CHARM_TICKETS[view.detail];
    let counts = {};
    let cards = [];
    let tally = [];
    let best = 0;
    // 뽑힌 부적마다 뒤집히는 봉투를 만들고, 등급별 개수와 가장 높은 등급을 구한다.
    for (let order = 0; order < view.reveal.length; order++) {
      let id = view.reveal[order];
      let grade = CHARMS[id].grade;
      counts[grade] = (counts[grade] || 0) + 1;
      best = Math.max(best, grades.indexOf(grade));
      cards.push(el('div', { class: 'hm-draw-card hm-grade-' + grade, data: { charm: id }, style: { '--hm-order': order } }, [
        el('span', { class: 'hm-draw-back', text: ticket.icon, attrs: { 'aria-hidden': 'true' } }),
        el('span', { class: 'hm-draw-front' }, [
          el('span', { class: 'hm-draw-grade', text: this.gradeName(id) }),
          el('span', { class: 'hm-draw-icon', text: CHARMS[id].icon, attrs: { 'aria-hidden': 'true' } }),
          el('span', { class: 'hm-draw-name', text: this.itemName(id) }),
        ]),
      ]));
    }
    // 높은 등급부터 등급별 개수를 적는다.
    for (let rank = grades.length - 1; rank >= 0; rank--) {
      if (counts[grades[rank]]) tally.push(this.t('draw.tally', { grade: this.t('charm.grade.' + grades[rank]), n: counts[grades[rank]] }));
    }
    let again = button(this.t('draw.again') + ' · ' + this.money(ticket.price), 'items.trade');
    again.disabled = this.slot.money < ticket.price;
    return [
      el('h3', { class: 'hm-modal-title hm-draw-title', text: '🧧 ' + this.t('draw.title') }),
      el('div', { class: 'hm-draw-stage hm-draw-' + grades[best] + (cards.length > 1 ? ' hm-draw-many' : ' hm-draw-one'), style: { '--hm-count': cards.length } }, cards),
      el('p', { class: 'hm-draw-best hm-grade-' + grades[best], style: { '--hm-count': cards.length }, text: this.t('draw.best', { grade: this.t('charm.grade.' + grades[best]) }) }),
      el('p', { class: 'hm-modal-text hm-draw-summary', style: { '--hm-count': cards.length }, text: cards.length > 1 ? tally.join(' · ') : this.itemText(view.reveal[0], 'brief') }),
      el('div', { class: 'hm-modal-buttons' }, [again, button(this.t('draw.done'), 'items.done', undefined, 'hm-primary')]),
    ];
  }

  /* ------------------------------ 게임 화면 ------------------------------ */

  /**
   * 게임 화면을 만들고 게임 진행을 시작한다.
   * @param {boolean} intro 새 게임이어서 턴 순서를 정하는 과정을 먼저 보여줄지 여부
   */
  showGame(intro) {
    this.leaveGame();
    this.screen = 'game';
    this.intro = Boolean(intro);
    this.flight = false;
    this.cards = [];
    this.cardOrder = '';
    this.game = HellmarbleGame.open(this.slot.game, this);
    this.tiles = [];
    this.lots = [];
    this.lotState = [];
    let board = el('div', { class: 'hm-board' });
    // 40개의 칸을 만들어 보드의 가장자리에 배치한다.
    for (let index = 0; index < BOARD_SIZE; index++) {
      this.tiles.push(this.buildTile(index));
      board.append(this.tiles[index].node);
    }
    board.append(this.buildCenter());
    // 건물을 지을 수 있는 땅(일반 도시, 별)마다, 건물이 세워질 터를 칸의 보드 안쪽에 만든다.
    for (let index = 0; index < BOARD_SIZE; index++) {
      this.lots.push(this.game.board[index].cost ? this.buildLot(index) : null);
      if (this.lots[index]) board.append(this.lots[index]);
    }
    this.lotPairs = this.pairLots();
    this.lotsMoved = true;
    this.castDice = null;
    this.pickOptions = null;
    this.mount(el('div', { class: 'hm-game hm-course-' + LEAGUES[this.game.state.league].course }, [el('div', { class: 'hm-board-wrap' }, [board]), this.buildSide()]));
    this.refresh();
    this.runGame(intro);
  }

  /**
   * 도시 한 칸의 건물이 세워질 터를 만든다.
   * 터는 칸에서 보드 중앙 쪽으로 바로 붙은 격자 자리에 놓이며, 건물은 칸에 바닥을 대고 보드 중앙을 바라보며 서 있는 모습으로 그려진다.
   * (아랫줄은 똑바로, 왼쪽 줄은 오른쪽으로 누워서, 윗줄은 뒤집혀서, 오른쪽 줄은 왼쪽으로 누워서 선다. 돌리는 것은 CSS 의 .hm-lot-<면> 이 한다.)
   * 터는 그 칸의 가운데에 놓인다. 모서리 옆에서 같은 자리를 쓰는 두 터가 겹치게 되면 fitLots 가 자리와 별장의 크기를 맞춘다.
   * @param {number} index 칸 번호
   * @returns {HTMLElement} 건물 터 요소
   */
  buildLot(index) {
    let place = placeTile(index);
    let row = place.side === 'bottom' ? 10 : place.side === 'top' ? 2 : place.row;
    let column = place.side === 'left' ? 2 : place.side === 'right' ? 10 : place.column;
    return el('div', { class: 'hm-lot hm-lot-' + place.side, data: { tile: index }, style: { 'grid-row': row, 'grid-column': column }, attrs: { 'aria-hidden': 'true' } });
  }

  /**
   * 같은 격자 자리를 함께 쓰는 터의 짝을 찾는다. 보드 모서리 양옆의 두 칸(옆줄의 칸과 윗줄 또는 아랫줄의 칸)에 모두 터가 있으면 짝이다.
   * 짝을 이루는 터는 키가 작은 별장을 모서리에 가까운 쪽 끝에 둔다. 두 터가 만나는 곳에 낮은 건물이 오게 하여 겹치는 일을 줄이기 위해서이다.
   * 그러려고 건물의 순서를 뒤집어야 하는 터에는 hm-lot-flip 을 붙인다. (터를 돌려 놓은 방향에 따라 별장이 놓이는 쪽이 다르기 때문이다.)
   * @returns {Object[][]} 짝의 목록. 짝은 두 터의 정보 { index : 칸 번호, side : 칸이 놓인 면, flip : 건물의 순서를 뒤집었는지, x, y : 모서리에서 멀어지는 방향 (-1, 0, 1) } 로 이루어진다.
   */
  pairLots() {
    let pairs = [];
    // 네 모서리마다 그 양옆의 칸에 터가 둘 다 있는지 살핀다.
    for (let corner = 0; corner < BOARD_SIZE; corner += BOARD_SIZE / 4) {
      let ends = [(corner + BOARD_SIZE - 1) % BOARD_SIZE, corner + 1];
      let pair = [];
      if (!this.lots[ends[0]] || !this.lots[ends[1]]) continue;
      // 두 터마다 모서리가 어느 쪽에 있는지 살펴, 별장이 그쪽에 오도록 건물의 순서를 정한다.
      for (let index of ends) {
        let place = placeTile(index);
        let x = Math.sign(place.column - placeTile(corner).column);
        let y = Math.sign(place.row - placeTile(corner).row);
        let flip = place.side === 'bottom' ? x < 0 : place.side === 'top' ? x > 0 : place.side === 'left' ? y < 0 : y > 0;
        this.lots[index].classList.toggle('hm-lot-flip', flip);
        pair.push({ index, side: place.side, flip, x, y });
      }
      pairs.push(pair);
    }
    return pairs;
  }

  /**
   * 터 하나에 놓인 건물들의 자리와 높이를 잰다. 터를 돌려 놓기 전의 배치 값을 쓰므로 어느 면의 터이든 같은 방식으로 잰다.
   * 자리(start)는 터의 모서리에 가까운 쪽 끝에서부터, 높이(reach)는 터가 붙어 있는 칸의 가장자리에서부터 잰 것이다. (건물의 지붕과 간판까지 포함한다.)
   * 맨 앞의 조각은 터의 바닥선이다.
   * @param {Object} entry 터의 정보 (pairLots 가 만든 것)
   * @returns {{room: number, length: number, parts: Array<{start: number, reach: number}>}} 칸의 길이, 터의 길이, 바닥선과 건물들의 자리와 높이 (픽셀)
   */
  measureLot(entry) {
    let lot = this.lots[entry.index];
    let tile = this.tiles[entry.index].node;
    let style = getComputedStyle(lot);
    let edge = parseFloat(style.getPropertyValue('margin-' + entry.side)) || 0;
    let length = lot.offsetWidth;
    let parts = [{ start: 0, reach: edge + (parseFloat(style.borderBottomWidth) || 0) }];
    // 건물마다 모서리 쪽 끝에서의 거리와, 칸의 가장자리에서 건물 꼭대기까지의 높이를 잰다.
    for (let house of lot.children) {
      let start = entry.flip ? length - house.offsetLeft - house.offsetWidth : house.offsetLeft;
      parts.push({ start, reach: edge + lot.offsetHeight - house.offsetTop + (parseFloat(getComputedStyle(house).marginTop) || 0) });
    }
    return { room: entry.side === 'left' || entry.side === 'right' ? tile.offsetHeight : tile.offsetWidth, length, parts };
  }

  /**
   * 같은 자리를 쓰는 두 터가 주어진 자리에 놓였을 때 건물이 서로 겹치는지 확인한다.
   * 한 터의 조각은 모서리에서 start 만큼 떨어진 곳부터 놓이고 칸의 가장자리에서 reach 만큼 솟아 있다.
   * 두 터는 서로 직각으로 놓여 있으므로, 두 조각은 서로의 높이가 상대의 시작 자리보다 멀리 뻗을 때 겹친다.
   * @param {Object} first 한 터를 잰 값 (measureLot)
   * @param {Object} second 다른 터를 잰 값
   * @param {number} near 첫 터의 모서리 쪽 끝이 모서리에서 떨어진 거리 (픽셀)
   * @param {number} far 둘째 터의 모서리 쪽 끝이 모서리에서 떨어진 거리 (픽셀)
   * @param {number} gap 두 조각 사이에 두어야 하는 간격 (픽셀)
   * @returns {boolean} 겹치면 true
   */
  lotsCollide(first, second, near, far, gap) {
    // 첫 터의 조각마다 둘째 터의 모든 조각과 견주어 본다.
    for (let one of first.parts) {
      // 둘째 터의 조각을 하나씩 살핀다.
      for (let other of second.parts) {
        if (near + one.start < other.reach + gap && far + other.start < one.reach + gap) return true;
      }
    }
    return false;
  }

  /**
   * 같은 자리를 쓰는 두 터를 각자의 칸 안에서 모서리에서 먼 쪽으로 얼마나 밀어야 겹치지 않는지 구한다.
   * 가운데에 둔 자리에서 칸의 끝에 닿는 자리까지를 LOT_STEPS 단계로 나누어 모든 조합을 살피고, 겹치지 않는 것 가운데 가장 덜 미는 것을 고른다.
   * @param {Object} first 한 터를 잰 값 (measureLot)
   * @param {Object} second 다른 터를 잰 값
   * @param {number} gap 두 터의 건물 사이에 두어야 하는 간격 (픽셀)
   * @returns {{slides: number[], clear: boolean}} 두 터를 밀 거리(픽셀)와 겹치지 않게 되었는지 여부. 어떻게 밀어도 겹치면 끝까지 민 거리와 false 를 돌려준다.
   */
  spreadLots(first, second, gap) {
    let room = [Math.max(0, (first.room - first.length) / 2), Math.max(0, (second.room - second.length) / 2)];
    let best = null;
    // 첫 터를 미는 정도를 한 단계씩 늘려 본다.
    for (let one = 0; one <= LOT_STEPS; one++) {
      // 둘째 터를 미는 정도를 한 단계씩 늘려 본다.
      for (let other = 0; other <= LOT_STEPS; other++) {
        let slides = [(room[0] * one) / LOT_STEPS, (room[1] * other) / LOT_STEPS];
        let cost = slides[0] + slides[1] + Math.abs(slides[0] - slides[1]) / 1000;
        if (best && best.cost <= cost) continue;
        if (!this.lotsCollide(first, second, room[0] + slides[0], room[1] + slides[1], gap)) best = { slides, cost };
      }
    }
    return best ? { slides: best.slides, clear: true } : { slides: room, clear: false };
  }

  /**
   * 같은 자리를 함께 쓰는 두 터의 건물이 겹치지 않게 자리와 별장의 크기를 맞춘다. 겹치지 않으면 두 터 모두 칸의 가운데에 원래 크기로 둔다.
   * 겹치면 먼저 두 터를 각자의 칸 안에서 모서리에서 먼 쪽으로 밀어 보고, 그래도 겹치면 별장만 한 단계씩 줄여 가며 다시 밀어 본다. (LOT_SCALES)
   * 빌딩과 호텔의 크기는 바꾸지 않으며, 터가 자기 칸을 벗어나 옆 칸으로 넘어가지 않는다.
   * 미는 거리는 화면 크기가 바뀌어도 맞도록 보드 너비에 대한 비율(cqw)로 적는다.
   * 건물 구성이 바뀐 뒤에만 다시 맞추며, 보드가 아직 화면에 그려지지 않았으면 다음 기회로 미룬다.
   */
  fitLots() {
    let board = this.lotPairs.length > 0 ? this.lots[this.lotPairs[0][0].index].parentElement : null;
    let width = board ? board.clientWidth : 0;
    if (!this.lotsMoved || !(width > 0)) return;
    this.lotsMoved = false;
    // 짝마다 별장의 크기와 두 터의 자리를 정한다.
    for (let pair of this.lotPairs) {
      let lots = [this.lots[pair[0].index], this.lots[pair[1].index]];
      let slides = [0, 0];
      // 별장을 원래 크기부터 한 단계씩 줄여 가며, 두 터가 겹치지 않게 되는 자리를 찾는다. 한쪽에 건물이 없으면 원래대로 두고 끝낸다.
      for (let scale of LOT_SCALES) {
        // 두 터의 별장 크기를 정하고 밀어 둔 것을 되돌린다.
        for (let lot of lots) {
          lot.style.setProperty('--hm-villa', scale);
          lot.style.translate = '';
        }
        if (lots[0].childElementCount === 0 || lots[1].childElementCount === 0) break;
        let fit = this.spreadLots(this.measureLot(pair[0]), this.measureLot(pair[1]), (width * LOT_GAP) / 100);
        slides = fit.slides;
        if (fit.clear) break;
      }
      // 정한 거리만큼 두 터를 모서리에서 먼 쪽으로 민다.
      for (let turn = 0; turn < pair.length; turn++) {
        let far = (slides[turn] / width) * 100;
        if (far > 0) lots[turn].style.translate = (pair[turn].x * far).toFixed(3) + 'cqw ' + (pair[turn].y * far).toFixed(3) + 'cqw';
      }
    }
  }

  /**
   * 도시 한 칸의 터에 지어진 건물을 그린다. 건물 구성이 바뀌었을 때에만 다시 그리며, 방금 새로 지은 건물은 솟아오르는 움직임을 준다.
   * 건물 구성이 바뀌면, 같은 자리를 쓰는 터와 겹치는지 다시 살펴야 한다고 표시해 둔다. (fitLots)
   * @param {number} index 칸 번호
   */
  refreshLot(index) {
    let lot = this.lots[index];
    let before = this.lotState[index];
    if (!lot) return;
    let land = this.game.state.lands[index];
    let state = { key: String(land.owner), owner: land.owner };
    let houses = [];
    // 건물 종류별 개수를 모아, 건물 구성이 바뀌었는지 견줄 값을 만든다.
    for (let kind of this.game.course.buildings) {
      state[kind] = land[kind];
      state.key += ':' + land[kind];
    }
    if (before && before.key === state.key) return;
    // 건물 종류별로 지어진 개수만큼 건물을 세운다. (우주여행 코스에서는 주인이 없는 별에 기지가 남아 있을 수 있다.)
    for (let kind of this.game.course.buildings) {
      // 같은 종류의 건물을 한 채씩 만든다.
      for (let count = 0; count < land[kind]; count++) {
        let fresh = Boolean(before) && before.owner === land.owner && count >= before[kind];
        houses.push(el('span', { class: 'hm-house hm-house-' + kind + (fresh ? ' hm-house-new' : '') }));
      }
    }
    lot.replaceChildren(...houses);
    lot.classList.toggle('hm-lot-vacant', land.owner === null);
    this.lotsMoved = true;
    if (land.owner !== null) lot.style.setProperty('--hm-owner', this.styleOf(this.game.state.players[land.owner]).color);
    this.lotState[index] = state;
  }

  /**
   * 보드의 칸 하나를 만든다. 땅의 색상은 보드 중앙을 바라보는 쪽 테두리에 표시된다.
   * @param {number} index 칸 번호
   * @returns {Object} 칸을 이루는 요소 묶음 { node, sub, owner, tokens }
   */
  buildTile(index) {
    let tile = this.game.board[index];
    let place = placeTile(index);
    let node = el('button', {
      class: 'hm-tile hm-side-' + place.side + ' hm-type-' + tile.type,
      data: { action: 'game.tile', value: index },
      attrs: { type: 'button', title: this.tileName(index) },
      style: { 'grid-row': place.row, 'grid-column': place.column },
    });
    let parts = { node, sub: el('span', { class: 'hm-tile-sub' }), owner: el('span', { class: 'hm-tile-owner' }), tokens: el('span', { class: 'hm-tile-tokens' }) };
    if (tile.show) {
      node.style.setProperty('--hm-land', LAND_COLORS[tile.show]);
      node.append(el('span', { class: 'hm-tile-color' }));
    }
    node.append(el('span', { class: 'hm-tile-body' }, [
      ICONS[tile.id] ? el('span', { class: 'hm-tile-icon', text: ICONS[tile.id] }) : null,
      el('span', { class: 'hm-tile-name', text: this.tileName(index) }),
      parts.sub,
    ]), parts.owner, parts.tokens);
    return parts;
  }

  /**
   * 보드 가운데 영역(차례 표시, 주사위, 버튼, 사회복지기금)을 만든다.
   * @returns {HTMLElement} 가운데 영역
   */
  buildCenter() {
    let state = this.game.state;
    let parts = {
      turn: el('div', { class: 'hm-turn' }),
      dice: el('div', { class: 'hm-dice' }),
      status: el('p', { class: 'hm-status', attrs: { 'aria-live': 'polite' } }),
      roll: button(this.t('game.roll'), 'game.roll', undefined, 'hm-primary'),
      items: button(this.t('game.items'), 'game.items'),
      menu: button(this.t('common.menu'), 'game.menu'),
      forfeit: button(this.t('game.forfeit'), 'game.forfeit', undefined, 'hm-danger'),
      fund: el('strong', { class: 'hm-fund-money' }),
      players: el('div', { class: 'hm-players' }),
      log: el('ol', { class: 'hm-log' }),
    };
    parts.center = el('div', { class: 'hm-center' }, [
      el('div', { class: 'hm-brand', text: this.t('app.title') }),
      el('div', { class: 'hm-league-tag', text: this.t('game.league', { league: this.t('league.' + state.league), n: state.multiplier }), style: { '--hm-league': LEAGUES[state.league].color } }),
      parts.turn,
      parts.dice,
      parts.status,
      el('div', { class: 'hm-controls' }, [parts.roll, parts.items, parts.menu, parts.forfeit]),
      el('div', { class: 'hm-fund' }, [el('span', { text: ICONS[this.game.course.fundIcon] + ' ' + this.t(this.game.course.words.fund) }), parts.fund]),
    ]);
    this.parts = parts;
    return parts.center;
  }

  /**
   * 보드 옆 영역(플레이어 목록, 진행 기록)을 만든다.
   * @returns {HTMLElement} 옆 영역
   */
  buildSide() {
    return el('aside', { class: 'hm-side' }, [
      el('section', { class: 'hm-panel' }, [el('h2', { class: 'hm-panel-title', text: this.t('game.players') }), this.parts.players]),
      el('section', { class: 'hm-panel hm-panel-log' }, [el('h2', { class: 'hm-panel-title', text: this.t('game.log') }), this.parts.log]),
    ]);
  }

  /**
   * 게임을 진행시키고, 사용자가 나가거나 게임이 끝났을 때의 뒤처리를 한다.
   * @param {boolean} intro 턴 순서를 정하는 과정을 먼저 보여줄지 여부
   * @returns {Promise<void>}
   */
  async runGame(intro) {
    let game = this.game;
    if (intro) await this.playIntro(game);
    if (this.game !== game) return;
    let completed = await game.run();
    if (this.game !== game) return;
    if (completed) {
      await this.finishGame(game);
      return;
    }
    this.saveSlot();
    this.showMenu();
  }

  /**
   * 새 게임을 시작할 때 턴 순서를 정하는 과정을 보여준다.
   * 플레이어 번호 순서대로 한 명씩 주사위를 굴리는 모습을 보여준 뒤, 정해진 순서를 안내하는 창을 띄운다.
   * 이 과정이 끝나기 전에는 플레이어 목록을 번호 순서로 보여주고 진행 기록은 감춘다.
   * @param {HellmarbleGame} game 시작하는 게임
   * @returns {Promise<void>}
   */
  async playIntro(game) {
    // 플레이어 번호 순서대로 한 명씩 주사위를 굴리는 모습을 보여준다.
    for (let player of game.state.players) {
      let roll = game.state.rolls[player.id];
      let name = this.playerName(player);
      this.parts.turn.replaceChildren(this.buildToken(player), el('span', { text: name }));
      this.parts.status.textContent = this.t('intro.rolling', { player: name });
      await this.rollDice(roll);
      if (this.game !== game) return;
      this.parts.status.textContent = this.t('log.dice', { player: name, a: roll[0], b: roll[1], sum: roll[0] + roll[1] });
      await wait(this.timings.pause * 2);
      if (this.game !== game) return;
    }
    this.intro = false;
    this.refresh();
    await this.dialog(this.introConfig());
  }

  /**
   * 새 게임을 시작할 때 보여줄 턴 순서 안내 대화 상자의 구성을 만든다.
   * @returns {Object} 대화 상자 구성
   */
  introConfig() {
    let state = this.game.state;
    let rows = [];
    // 정해진 턴 순서대로 플레이어와 주사위 결과를 나열한다.
    for (let position = 0; position < state.order.length; position++) {
      let player = state.players[state.order[position]];
      let roll = state.rolls[player.id];
      rows.push(el('div', { class: 'hm-order-row' }, [
        el('span', { class: 'hm-order-rank', text: position + 1 }),
        this.buildToken(player),
        el('span', { class: 'hm-order-name', text: this.playerName(player) }),
        el('span', { class: 'hm-order-dice' }, [this.buildDie(roll[0]), this.buildDie(roll[1])]),
        el('span', { class: 'hm-order-sum', text: roll[0] + roll[1] }),
      ]));
    }
    return {
      title: this.t('intro.title'), text: this.t('intro.text'), body: [el('div', { class: 'hm-order' }, rows)],
      buttons: [{ label: this.t('intro.start'), value: 'ok', primary: true }],
    };
  }

  /**
   * 끝난 게임을 정산한다. 승리하면 현금과 땅, 건물의 가치(100%)를 대기실 금액에 더한다.
   * 승리 보상이 정해진 리그에서는 그 금액만 더하고, 게임에서 가진 돈과 땅은 보상에 넣지 않는다.
   * 승패와 관계없이 게임에서 쓰지 않고 남은 소모형 아이템은 대기실의 주머니로 돌려준다. (사용한 아이템만 사라진다.)
   * 정산을 저장한 뒤, 결과 화면을 거쳐 대기실로 돌아간다.
   * @param {HellmarbleGame} game 끝난 게임
   * @returns {Promise<void>}
   */
  async finishGame(game) {
    let human = game.state.players[0];
    let league = LEAGUES[game.state.league];
    let name = this.t('league.' + game.state.league);
    let won = game.state.winner === human.id;
    let cash = human.cash;
    let property = game.propertyValue(human);
    let reward = league.reward !== null ? league.reward : cash + property;
    this.slot.money += won ? reward : 0;
    this.slot.items = addItems(this.slot.items, human.items);
    this.slot.game = null;
    this.saveSlot();
    this.refresh();
    let leave = [{ label: this.t('result.lobby'), value: 'ok', primary: true }];
    if (won) {
      let rows = [
        league.reward === null ? this.infoRow(this.t('result.cash'), this.figure(cash)) : null,
        league.reward === null ? this.infoRow(this.t('result.property'), this.figure(property)) : null,
        this.infoRow(this.t('result.reward'), this.figure(reward, '+'), true),
      ];
      await this.dialog({ kind: 'win', title: this.t('result.win.title'), text: this.t(league.reward === null ? 'result.win.text' : 'result.win.fixed', { league: name }), body: [el('div', { class: 'hm-land-rows' }, rows)], buttons: leave });
    } else {
      await Promise.race([this.dialog({ kind: 'lose', title: this.t('result.lose.title'), text: this.t(league.fee > 0 ? 'result.lose.text' : 'result.lose.free'), buttons: leave }), wait(this.timings.result)]);
    }
    if (this.game === game) this.showLobby();
  }

  /**
   * 게임 화면을 떠날 때 진행 중인 게임을 멈추고 기다리던 입력을 정리한다.
   */
  leaveGame() {
    let game = this.game;
    let waiting = this.waiting;
    this.game = null;
    this.waiting = null;
    this.mode = 'busy';
    this.intro = false;
    if (game) game.stop();
    if (waiting) waiting.resolve(QUIT);
    this.closeCoupon();
    this.closePopover();
    this.closeDialog(null);
  }

  /**
   * 게임 화면 전체(보드, 가운데 영역, 플레이어 목록, 기록, 땅 정보 창)를 현재 상태에 맞게 다시 그린다.
   */
  refresh() {
    if (!this.game || this.screen !== 'game') return;
    // 모든 칸의 소유자, 건물, 말 표시를 갱신한다.
    for (let index = 0; index < BOARD_SIZE; index++) this.refreshTile(index);
    this.fitLots();
    this.refreshCenter();
    this.refreshPlayers();
    this.refreshLog();
    if (this.popover) this.popover.node.firstChild.replaceWith(this.buildLandInfo(this.popover.index));
  }

  /**
   * 칸 하나의 가격 또는 통행료, 소유자, 건물, 말 표시를 갱신한다.
   * 소유자는 칸 바깥쪽의 색 띠와 문양으로, 건물은 칸 안쪽 터에 세워진 모습으로 보여준다.
   * 말이 서 있는 칸은 그 플레이어의 색으로 배경을 칠해 확실하게 표시한다.
   * @param {number} index 칸 번호
   */
  refreshTile(index) {
    let game = this.game;
    let parts = this.tiles[index];
    let land = game.state.lands[index];
    let owned = Boolean(land && land.owner !== null);
    if (land) parts.sub.textContent = formatCompact(owned ? game.toll(index) : game.price(index), this.settings.language);
    let mark = owned ? this.styleOf(game.state.players[land.owner]) : null;
    parts.owner.textContent = mark ? mark.symbol : '';
    if (mark) paint(parts.node, 'owner', mark);
    parts.node.classList.toggle('hm-owned', owned);
    this.refreshLot(index);
    let tokens = [];
    let colors = [];
    // 이 칸에 서 있는 생존 플레이어의 말을 모은다.
    for (let player of game.state.players) {
      if (!player.alive || player.position !== index) continue;
      tokens.push(this.buildToken(player));
      colors.push(this.styleOf(player).color);
    }
    parts.tokens.replaceChildren(...tokens);
    parts.node.classList.toggle('hm-here', colors.length > 0);
    if (colors.length === 0) return;
    let stops = [];
    // 서 있는 플레이어 수만큼 배경을 나누어 각자의 색으로 칠한다.
    for (let position = 0; position < colors.length; position++) {
      stops.push(tint(colors[position], 0.5) + ' ' + (position * 100) / colors.length + '% ' + ((position + 1) * 100) / colors.length + '%');
    }
    parts.node.style.setProperty('--hm-here', 'linear-gradient(135deg, ' + stops.join(', ') + ')');
    parts.node.style.setProperty('--hm-here-edge', colors[0]);
  }

  /**
   * 플레이어의 말(고유 색과 문양)을 만든다.
   * @param {Object} player 플레이어
   * @returns {HTMLElement} 말 요소
   */
  buildToken(player) {
    let name = 'hm-token';
    if (this.game && !this.intro && !this.game.state.finished && this.game.current.id === player.id) name += ' hm-token-turn';
    if (this.moving === player.id) name += ' hm-token-hop';
    let token = this.buildLookToken(player.look, name);
    token.dataset.player = String(player.id);
    token.title = this.playerName(player);
    return token;
  }

  /**
   * 색상과 모양으로 말 하나를 그린다. 게임의 말과, 대기실과 아이템 창의 미리 보기에 함께 쓴다.
   * 장착하지 않은 자리가 있으면 회색 바탕 또는 빈 문양으로 그린다.
   * @param {{color: string|null, shape: string|null}} look 생김새
   * @param {string} [className] 요소의 클래스 이름 (생략하면 'hm-token')
   * @returns {HTMLElement} 말 요소
   */
  buildLookToken(look, className) {
    let style = lookStyle(look);
    let token = el('span', { class: className || 'hm-token', text: style.symbol });
    paint(token, 'player', style);
    return token;
  }

  /**
   * 장착한 색상과 모양의 이름을 이어 쓴다. 비어 있는 자리는 없다고 적는다.
   * @param {{color: string|null, shape: string|null}} look 장착 상태
   * @returns {string} 색상과 모양의 이름
   */
  lookText(look) {
    let names = [];
    // 색상과 모양 자리마다 장착한 아이템의 이름을 모은다.
    for (let slot in DEFAULT_LOOK) names.push(look[slot] ? this.itemName(look[slot]) : this.t('equip.none.' + slot));
    return names.join(' · ');
  }

  /**
   * 주사위 하나를 만든다.
   * @param {number} face 주사위의 눈 (1~6)
   * @returns {HTMLElement} 주사위 요소
   */
  buildDie(face) {
    let cells = [];
    // 3x3 격자의 자리마다 점이 찍히는지 표시한다.
    for (let cell = 0; cell < 9; cell++) cells.push(el('span', { class: DICE_PIPS[face].includes(cell) ? 'hm-pip hm-pip-on' : 'hm-pip' }));
    return el('span', { class: 'hm-die', attrs: { role: 'img', 'aria-label': face } }, cells);
  }

  /**
   * 우주선 하나를 만든다. 우주여행에 탑승한 플레이어가 주사위를 굴리는 대신 목적지를 고르는 차례에, 주사위 자리에 놓는다.
   * 불꽃, 양쪽 날개, 창문이 달린 몸통으로 이루어지며 모양은 CSS 로 그린다.
   * @returns {HTMLElement} 우주선 요소
   */
  buildShip() {
    return el('span', { class: 'hm-ship', attrs: { role: 'img', 'aria-label': this.t(this.game.course.words.ship) } }, [
      el('span', { class: 'hm-ship-flame' }),
      el('span', { class: 'hm-ship-fin hm-ship-fin-left' }),
      el('span', { class: 'hm-ship-fin hm-ship-fin-right' }),
      el('span', { class: 'hm-ship-body' }, [el('span', { class: 'hm-ship-window' })]),
    ]);
  }

  /**
   * 가운데 영역의 주사위 자리에 우주선을 그린다. 이미 그려져 있으면 그대로 둔다. (다시 그리면 움직임이 처음부터 다시 시작된다.)
   */
  renderShip() {
    if (!this.parts.dice.querySelector('.hm-ship')) this.parts.dice.replaceChildren(this.buildShip());
  }

  /**
   * 가운데 영역의 주사위를 지정한 눈으로 그린다. 보통은 두 개이고, 카드의 효과로 주사위를 하나만 굴렸을 때에는 하나만 그린다.
   * @param {number} first 첫째 주사위의 눈
   * @param {number} [second] 둘째 주사위의 눈 (주사위가 하나이면 생략)
   */
  renderDice(first, second) {
    let dice = [this.buildDie(first)];
    if (second !== undefined) dice.push(this.buildDie(second));
    this.parts.dice.replaceChildren(...dice);
  }

  /**
   * 가운데 영역(차례, 주사위, 안내 문구, 버튼, 사회복지기금)을 갱신한다.
   * 우주여행에 탑승한 플레이어의 차례에는 주사위를 굴리지 않으므로, 주사위 자리에 우주선을 보여준다.
   */
  refreshCenter() {
    if (!this.game || !this.parts.center) return;
    let state = this.game.state;
    let player = this.game.current;
    if (!this.intro) {
      this.parts.turn.replaceChildren(this.buildToken(player), el('span', { text: this.t('game.turn', { player: this.playerName(player) }) }));
      this.parts.status.textContent = this.statusText();
    }
    this.parts.roll.disabled = this.mode !== 'roll';
    this.parts.items.disabled = !['roll', 'travel'].includes(this.mode) || this.game.current.id !== 0;
    this.parts.menu.disabled = !['roll', 'travel'].includes(this.mode);
    this.parts.forfeit.disabled = !['roll', 'travel'].includes(this.mode);
    this.parts.fund.textContent = this.money(state.fund);
    this.parts.center.classList.toggle('hm-my-turn', this.mode !== 'busy');
    if (this.rolling) return;
    if (this.flight) this.renderShip();
    else this.renderDice(...(this.castDice || state.dice));
  }

  /**
   * 가운데 영역에 보일 안내 문구를 정한다. 사용자의 입력을 기다릴 때에는 할 일을, 그 밖에는 최근 기록을 보여준다.
   * 주사위 조작형 아이템을 쓴 뒤 굴리기 전이면 어떤 눈이 나오는지도 덧붙인다.
   * @returns {string} 안내 문구
   */
  statusText() {
    let player = this.game.current;
    let logs = this.game.state.logs;
    let loaded = player.loaded ? ' ' + ITEMS[player.loaded].icon + ' ' + this.t('hint.loaded', { item: this.itemName(player.loaded), faces: ITEMS[player.loaded].faces.join(', ') }) : '';
    let words = this.game.course.words;
    if (this.mode === 'travel') return this.t(words.travelHint);
    if (this.mode === 'pick') return this.t('hint.pick');
    if (this.mode === 'roll' && player.island > 1) return this.t(words.trapHint, { n: player.island - 1 }) + loaded;
    if (this.mode === 'roll' && player.island === 1) return this.t(words.freeHint) + loaded;
    if (this.mode === 'roll' && player.boarded && words.aboard) return this.t(words.aboard) + loaded;
    if (this.mode === 'roll') return this.t(this.again ? 'hint.double' : 'hint.roll') + loaded;
    return logs.length > 0 ? this.describe(logs[logs.length - 1]) : '';
  }

  /**
   * 플레이어 목록(턴 순서대로 이름, 현금, 자산, 보관 쿠폰, 상태)을 갱신한다.
   * 턴 순서를 정하는 과정이 끝나기 전에는 플레이어 번호 순서대로 보여준다.
   * 카드는 누르면 그 플레이어의 자산과 소유한 땅 목록이 뜨는 버튼이며, 갱신할 때 버튼 자체는 다시 만들지 않고 내용만 바꾼다.
   */
  refreshPlayers() {
    let game = this.game;
    let state = game.state;
    let ids = this.intro ? [] : state.order;
    let cards = [];
    // 턴 순서가 정해지기 전이면 플레이어 번호 순서대로 나열한다.
    for (let player of this.intro ? state.players : []) ids.push(player.id);
    // 정해진 순서대로 플레이어 카드의 내용을 갱신한다.
    for (let id of ids) {
      let player = state.players[id];
      let turn = !this.intro && player.alive && !state.finished && game.current.id === id;
      let badges = [];
      if (!player.alive) badges.push(this.t('player.bankrupt'));
      if (turn) badges.push(this.t('player.turn'));
      if (player.island > 0) badges.push(this.t(game.course.words.trapped, { n: player.island - 1 }));
      if (player.boarded) badges.push(this.t(game.course.words.boarded));
      if (player.loaded) badges.push(ITEMS[player.loaded].icon + ' ' + this.itemName(player.loaded));
      // 보관 중인 카드를 종류별로 표시한다.
      for (let coupon in player.coupons) {
        if (player.coupons[coupon] > 0) badges.push(ICONS[coupon] + ' ' + this.cardTitle(coupon) + ' ×' + player.coupons[coupon]);
      }
      let chips = [];
      // 상태와 쿠폰 표시를 하나씩 꼬리표로 만든다.
      for (let badge of badges) chips.push(el('span', { class: 'hm-badge', text: badge }));
      if (!this.cards[id]) {
        this.cards[id] = el('button', { data: { action: 'game.player', value: id }, attrs: { type: 'button' } });
        paint(this.cards[id], 'player', this.styleOf(player));
      }
      this.cards[id].className = 'hm-player' + (turn ? ' hm-player-turn' : '') + (player.alive ? '' : ' hm-player-out');
      this.cards[id].replaceChildren(
        this.buildToken(player),
        el('span', { class: 'hm-player-main' }, [
          el('span', { class: 'hm-player-name', text: this.playerName(player) + (player.ai ? '' : ' (' + this.t('player.you') + ')') }),
          el('span', { class: 'hm-player-cash', text: this.money(player.cash) }),
          el('span', { class: 'hm-player-meta' }, [this.t('player.lands', { n: game.owned(player).length }) + ' · ' + this.t('playerinfo.assets') + ' ', this.figure(game.assets(player))]),
          el('span', { class: 'hm-badges' }, chips),
        ]),
      );
      cards.push(this.cards[id]);
    }
    if (this.cardOrder === ids.join(',')) return;
    this.cardOrder = ids.join(',');
    this.parts.players.replaceChildren(...cards);
  }

  /**
   * 게임 중 플레이어를 눌렀을 때 레이어 팝업으로 그 플레이어의 자산과 소유한 땅 목록을 보여준다.
   * 목록에서 땅을 누르면 그 땅의 자세한 정보를 보여주고, 뒤로가기로 목록에 돌아가며, 닫기로 게임에 돌아간다.
   * @param {number} id 플레이어 번호
   * @returns {Promise<void>}
   */
  async showPlayer(id) {
    let game = this.game;
    let answer = 'list';
    if (!game || this.screen !== 'game' || !game.state.players[id]) return;
    // 닫기를 누를 때까지 목록 화면과 땅의 상세 화면을 오간다.
    while (this.game === game && typeof answer === 'string' && answer !== 'close') {
      let index = answer.startsWith('land:') ? Number(answer.slice(5)) : -1;
      answer = await this.dialog(game.state.lands[index] ? this.playerLandConfig(id, index) : this.playerConfig(id));
    }
  }

  /**
   * 플레이어의 자산과 소유한 땅 목록을 보여주는 팝업의 구성을 만든다.
   * @param {number} id 플레이어 번호
   * @returns {Object} 대화 상자 구성
   */
  playerConfig(id) {
    let game = this.game;
    let player = game.state.players[id];
    let owned = game.owned(player);
    let coupons = [];
    let lands = [];
    // 보관 중인 카드를 종류별로 모은다.
    for (let coupon in player.coupons) {
      if (player.coupons[coupon] > 0) coupons.push(ICONS[coupon] + ' ' + this.cardTitle(coupon) + ' ×' + player.coupons[coupon]);
    }
    // 소유한 땅마다 상세 화면으로 가는 버튼을 만든다.
    for (let index of owned) {
      lands.push(el('button', { class: 'hm-land-item', data: { action: 'dialog.answer', value: 'land:' + index }, attrs: { type: 'button' }, style: { '--hm-land': LAND_COLORS[game.board[index].show] } }, [
        el('span', { class: 'hm-land-item-name', text: this.landLabel(index) }),
        el('span', { class: 'hm-land-item-toll' }, [this.t(game.course.words.toll) + ' ', this.figure(game.toll(index))]),
      ]));
    }
    let trapped = this.t(game.course.words.trapped, { n: player.island - 1 });
    let status = !player.alive ? this.t('player.bankrupt') : player.island > 0 ? trapped : player.boarded ? this.t(game.course.words.boarded) : this.t('playerinfo.playing');
    return {
      kind: 'player', title: this.styleOf(player).symbol + ' ' + this.playerName(player),
      body: [
        el('div', { class: 'hm-land-rows hm-player-assets', style: { '--hm-player': this.styleOf(player).color } }, [
          this.infoRow(this.t('result.cash'), this.figure(player.cash)),
          this.infoRow(this.t('result.property'), this.figure(game.propertyValue(player))),
          this.infoRow(this.t('playerinfo.assets'), this.figure(game.assets(player)), true),
          this.infoRow(this.t(game.course.words.kept), coupons.length > 0 ? coupons.join('  ') : this.t('common.none')),
          this.infoRow(this.t('playerinfo.charm'), isCharm(player.charm) ? CHARMS[player.charm].icon + ' ' + this.itemName(player.charm) : this.t('common.none')),
          this.infoRow(this.t('playerinfo.status'), status),
        ]),
        el('h3', { class: 'hm-list-title', text: this.t('playerinfo.lands', { n: owned.length }) }),
        owned.length > 0 ? el('div', { class: 'hm-land-list' }, lands) : null,
        el('p', { class: 'hm-note', text: this.t(owned.length > 0 ? 'playerinfo.hint' : 'playerinfo.none') }),
      ],
      buttons: [{ label: this.t('common.close'), value: 'close', primary: true }],
    };
  }

  /**
   * 땅의 이름 뒤에 지어진 건물을 그림 문자로 덧붙인 표시를 만든다. (소유한 땅 목록, 매각이나 선택 창의 선택지)
   * @param {number} index 땅의 칸 번호
   * @returns {string} 땅의 이름과 건물 표시
   */
  landLabel(index) {
    let land = this.game.state.lands[index];
    let name = this.tileName(index);
    // 지어진 건물을 종류별 개수만큼 이름 뒤에 덧붙인다.
    for (let kind of land ? this.game.course.buildings : []) name += ICONS[kind].repeat(land[kind]);
    return name;
  }

  /**
   * 플레이어 팝업에서 땅 하나의 자세한 정보(구매·건설 비용, 통행료와 이용료, 현재의 합계)를 보여주는 구성을 만든다.
   * @param {number} id 플레이어 번호
   * @param {number} index 땅의 칸 번호
   * @returns {Object} 대화 상자 구성
   */
  playerLandConfig(id, index) {
    return {
      kind: 'player', title: this.styleOf(this.game.state.players[id]).symbol + ' ' + this.playerName(this.game.state.players[id]), body: [this.buildLandInfo(index)],
      buttons: [{ label: this.t('common.goBack'), value: 'list' }, { label: this.t('common.close'), value: 'close', primary: true }],
    };
  }

  /**
   * 진행 기록 목록을 최근 것부터 갱신한다. 턴 순서를 정하는 과정이 끝나기 전에는 비워 둔다.
   */
  refreshLog() {
    let logs = this.intro ? [] : this.game.state.logs;
    let items = [];
    // 가장 최근 기록부터 거꾸로 최대 40개를 목록으로 만든다.
    for (let index = logs.length - 1; index >= 0 && items.length < 40; index--) {
      let owner = logs[index].params.player;
      items.push(el('li', { class: 'hm-log-item', text: this.describe(logs[index]), style: { '--hm-player': owner === undefined ? 'transparent' : this.styleOf(this.game.state.players[owner]).color } }));
    }
    this.parts.log.replaceChildren(...items);
  }

  /**
   * 진행 기록 하나를 현재 언어의 문장으로 바꾼다.
   * @param {Object} entry 기록 { key, params }
   * @returns {string} 기록 문장
   */
  describe(entry) {
    let players = this.game.state.players;
    let params = {};
    // 기록에 담긴 값을 종류에 맞는 표시 문자열로 바꾼다.
    for (let name in entry.params) {
      let value = entry.params[name];
      if (name === 'player' || name === 'target') params[name] = this.playerName(players[value]);
      else if (name === 'tile' || name === 'other') params[name] = this.tileName(value);
      else if (name === 'amount') params[name] = this.money(value);
      else if (name === 'coupon') params[name] = this.cardTitle(value);
      else if (name === 'item') params[name] = this.itemName(value);
      else if (name === 'building') params[name] = this.t('building.' + value);
      else if (name === 'order') params[name] = this.orderText(value);
      else params[name] = value;
    }
    return this.t(entry.key, params);
  }

  /**
   * 턴 순서를 플레이어 이름으로 이어 쓴다.
   * @param {number[]} order 턴 순서대로 나열한 플레이어 번호
   * @returns {string} 이름을 화살표로 이은 문자열
   */
  orderText(order) {
    let names = [];
    // 순서대로 플레이어의 이름을 모은다.
    for (let id of order) names.push(this.playerName(this.game.state.players[id]));
    return names.join(' → ');
  }

  /* ------------------------------ 땅 정보 ------------------------------ */

  /**
   * 이름과 값으로 이루어진 정보 한 줄을 만든다.
   * @param {string} label 항목 이름
   * @param {string|Node} value 항목 값
   * @param {boolean} [strong] 강조 여부
   * @returns {HTMLElement} 정보 줄
   */
  infoRow(label, value, strong) {
    return el('div', { class: 'hm-row' + (strong ? ' hm-row-strong' : '') }, [el('span', { class: 'hm-row-label', text: label }), el('span', { class: 'hm-row-value' }, [value])]);
  }

  /**
   * 칸의 설명, 가격, 통행료와 이용료, 소유자를 담은 땅 정보 카드를 만든다.
   * 칸을 클릭했을 때의 확대 창과 땅 구매, 건물 건설 창이 이 카드를 함께 쓴다.
   * @param {number} index 칸 번호
   * @returns {HTMLElement} 땅 정보 카드
   */
  buildLandInfo(index) {
    let game = this.game;
    let tile = game.board[index];
    let land = game.state.lands[index];
    let words = game.course.words;
    let prices = [];
    let status = [];
    if (land) {
      prices.push(this.infoRow(this.t('info.price'), this.figure(game.price(index))));
      // 건물을 지을 수 있는 땅이면 건물 종류별 건설비를 넣는다. (종류에 맞춘 문구가 따로 있으면 그것을 쓴다. 기지의 증축은 횟수의 한도를 함께 적는다.)
      for (let kind of tile.cost ? game.course.buildings : []) {
        let label = this.t(TEXTS.ko['info.cost.' + kind] ? 'info.cost.' + kind : 'info.cost', { building: this.t('building.' + kind), limit: BUILD_LIMIT[kind] });
        prices.push(this.infoRow(ICONS[kind] + ' ' + label, this.figure(game.buildCost(index, kind))));
      }
      prices.push(this.infoRow(this.t(tile.type === 'star' ? 'info.feeBare' : words.toll), this.figure(game.money(tile.toll))));
      // 일반 도시이면 건물 종류별 이용료를 넣는다.
      for (let kind of tile.type === 'city' ? BUILDINGS : []) {
        prices.push(this.infoRow(ICONS[kind] + ' ' + this.t(kind === 'villa' ? 'info.feeEach' : 'info.fee', { building: this.t('building.' + kind) }), this.figure(game.money(tile.fee[kind]))));
      }
      if (tile.type === 'star') {
        prices.push(this.infoRow(ICONS.base + ' ' + this.t('info.feeBase'), this.figure(game.money(tile.fee.base))));
        prices.push(this.infoRow(ICONS.annex + ' ' + this.t('info.feeAnnex'), this.figure(game.money(tile.fee.annex), '+')));
        prices.push(this.infoRow(ICONS.annex + ' ' + this.t('info.feeFull', { limit: BUILD_LIMIT.annex }), this.figure(game.money(ANNEX_BONUS), '+')));
      }
      if (index === game.tiles.columbia) prices.push(this.infoRow(this.t('info.spaceFee'), this.figure(game.money(SPACE_FEE))));
      if (index === game.tiles.timemachine) prices.push(this.infoRow(this.t('info.timeFee'), this.figure(game.money(TIME_FEE))));
      status.push(this.infoRow(this.t('info.owner'), this.ownerLabel(land.owner)));
      if (tile.type === 'city') status.push(this.infoRow(this.t('info.buildings'), this.buildingText(land)));
      if (tile.type === 'star') {
        status.push(this.infoRow(this.t('info.base'), land.base > 0 ? this.t(land.owner === null ? 'info.leftover' : 'info.built') : this.t('common.none')));
        if (land.base > 0) status.push(this.infoRow(this.t('info.annex'), this.t('info.annexCount', { n: land.annex, limit: BUILD_LIMIT.annex })));
      }
      status.push(this.infoRow(this.t(words.total), this.figure(game.toll(index)), true));
      if (land.owner !== null) status.push(this.infoRow(this.t('info.sale', { n: SELL_PERCENT }), this.figure(game.saleValue(index))));
    }
    if (tile.type === 'start') prices.push(this.infoRow(this.t('info.salary'), this.figure(game.salary)));
    if (tile.type === 'space') {
      prices.push(this.infoRow(this.t('info.spaceFee'), this.figure(game.money(SPACE_FEE))));
      status.push(this.infoRow(this.tileName(game.tiles.columbia) + ' ' + this.t('info.owner'), this.ownerLabel(game.state.lands[game.tiles.columbia].owner)));
    }
    if (tile.type === 'timetravel') {
      prices.push(this.infoRow(this.t('info.timeFee'), this.figure(game.money(TIME_FEE))));
      status.push(this.infoRow(this.tileName(game.tiles.timemachine) + ' ' + this.t('info.owner'), this.ownerLabel(game.state.lands[game.tiles.timemachine].owner)));
    }
    if (tile.type === 'desk') prices.push(this.infoRow(this.t('info.welfare'), this.figure(game.money(WELFARE_FEE))));
    if (tile.type === 'rescue') prices.push(this.infoRow(this.t('info.rescue'), this.figure(game.money(RESCUE_FEE))));
    if (tile.type === 'desk' || tile.type === 'fund' || tile.type === 'rescue') status.push(this.infoRow(this.t('info.fund'), this.figure(game.state.fund), true));
    return el('div', { class: 'hm-land', style: { '--hm-land': tile.show ? LAND_COLORS[tile.show] : 'var(--hm-muted)' } }, [
      el('div', { class: 'hm-land-head' }, [
        el('span', { class: 'hm-land-name', text: (ICONS[tile.id] ? ICONS[tile.id] + ' ' : '') + this.tileName(index) }),
        el('span', { class: 'hm-land-type', text: this.t('type.' + tile.type) }),
      ]),
      el('p', { class: 'hm-land-desc', text: this.t(TEXTS.ko['desc.' + tile.id] ? 'desc.' + tile.id : 'desc.' + tile.type) }),
      prices.length > 0 ? el('div', { class: 'hm-land-rows' }, prices) : null,
      status.length > 0 ? el('div', { class: 'hm-land-rows hm-land-status' }, status) : null,
      TEXTS.ko['real.' + tile.id] ? el('p', { class: 'hm-land-real' }, [el('strong', { text: '🌍 ' + this.t('real.title') }), this.t('real.' + tile.id)]) : null,
    ]);
  }

  /**
   * 소유자를 말과 이름으로 표시한다. 소유자가 없으면 "없음"을 표시한다.
   * @param {number|null} owner 소유한 플레이어의 번호
   * @returns {HTMLElement} 소유자 표시
   */
  ownerLabel(owner) {
    if (owner === null) return el('span', { text: this.t('common.none') });
    let player = this.game.state.players[owner];
    return el('span', { class: 'hm-owner-label' }, [this.buildToken(player), this.playerName(player)]);
  }

  /**
   * 땅에 지어진 건물을 문자열로 나타낸다.
   * @param {Object} land 땅의 소유 정보
   * @returns {string} 건물 표시 (없으면 "없음")
   */
  buildingText(land) {
    let list = [];
    // 지어진 건물을 종류별로 개수와 함께 모은다.
    for (let kind of BUILDINGS) {
      if (land[kind] > 0) list.push(ICONS[kind] + ' ' + this.t('building.' + kind) + ' ×' + land[kind]);
    }
    return list.length > 0 ? list.join('  ') : this.t('common.none');
  }

  /**
   * 칸을 클릭했을 때 땅 정보 창을 열거나, 같은 칸을 다시 클릭했으면 닫는다.
   * @param {number} index 칸 번호
   */
  togglePopover(index) {
    if (!this.game || this.screen !== 'game' || !(index >= 0 && index < BOARD_SIZE)) return;
    if (this.popover && this.popover.index === index) this.closePopover();
    else this.openPopover(index);
  }

  /**
   * 칸 위에 확대된 땅 정보 창을 연다. 우주여행의 목적지를 고르는 중이거나 보드에서 이동할 칸을 고르는 중이면 이동 버튼도 함께 보여준다.
   * @param {number} index 칸 번호
   */
  openPopover(index) {
    this.closePopover();
    let travel = (this.mode === 'travel' && index !== this.game.current.position) || (this.mode === 'pick' && Boolean(this.pickOptions) && this.pickOptions.includes(index));
    let node = el('div', { class: 'hm-popover', data: { action: 'popover.close' }, attrs: { role: 'dialog' } }, [
      this.buildLandInfo(index),
      travel ? button(this.t('game.travelHere'), 'game.travel', index, 'hm-primary hm-wide') : null,
      el('p', { class: 'hm-popover-hint', text: this.t('game.closeHint') }),
    ]);
    this.root.append(node);
    this.popover = { index, node };
    this.tiles[index].node.classList.add('hm-tile-open');
    this.placePopover();
  }

  /**
   * 열려 있는 땅 정보 창을 닫는다.
   */
  closePopover() {
    if (!this.popover) return;
    let popover = this.popover;
    this.popover = null;
    popover.node.remove();
    if (this.tiles[popover.index]) this.tiles[popover.index].node.classList.remove('hm-tile-open');
  }

  /**
   * 땅 정보 창을 클릭한 칸 위에 겹쳐 놓되 화면 밖으로 나가지 않게 한다.
   */
  placePopover() {
    if (!this.popover) return;
    let node = this.popover.node;
    let rect = this.tiles[this.popover.index].node.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - node.offsetWidth / 2;
    let top = rect.top + rect.height / 2 - node.offsetHeight / 2;
    node.style.left = Math.max(8, Math.min(left, globalThis.innerWidth - node.offsetWidth - 8)) + 'px';
    node.style.top = Math.max(8, Math.min(top, globalThis.innerHeight - node.offsetHeight - 8)) + 'px';
  }

  /* ------------------------------ WebMCP ------------------------------ */

  /**
   * WebMCP 로 제공할 도구 목록을 만든다.
   * 플레이 방법, 화면 사용 방법, 현재 상황 조회, 땅 정보 조회, 화면 조작, 글자 입력, 입력 차례까지 기다리기 도구가 있다.
   * @returns {Object[]} 도구 목록 { name, title, description, inputSchema, annotations, execute }
   */
  buildTools() {
    let tools = [];
    // 도구 구성마다 WebMCP 형식의 도구를 만든다.
    for (let key in MCP_TOOLS) {
      let tool = MCP_TOOLS[key];
      tools.push({
        name: 'hellmarble_' + key, title: tool.title, description: tool.description, inputSchema: tool.schema,
        annotations: { readOnlyHint: tool.readOnly, untrustedContentHint: key === 'get_state' || key === 'wait' },
        execute: this.runTool.bind(this, key),
      });
    }
    return tools;
  }

  /**
   * 브라우저가 WebMCP 를 지원하면 도구들을 등록한다.
   * 최신 표준(document.modelContext)과 이전 위치(navigator.modelContext)를 모두 살피며,
   * 지원하지 않는 브라우저이거나 등록 중 오류가 나면 건너뛴다.
   */
  registerTools() {
    this.tools = this.buildTools();
    try {
      let context = (globalThis.document && globalThis.document.modelContext) || (globalThis.navigator && globalThis.navigator.modelContext);
      if (!context) return;
      if (typeof context.registerTool !== 'function') {
        if (typeof context.provideContext === 'function') context.provideContext({ tools: this.tools });
        return;
      }
      this.toolAbort = typeof AbortController === 'function' ? new AbortController() : null;
      // 도구를 하나씩 등록한다. 하나가 실패해도 나머지는 계속 등록한다.
      for (let tool of this.tools) {
        try {
          let pending = context.registerTool(tool, this.toolAbort ? { signal: this.toolAbort.signal } : {});
          if (pending && typeof pending.catch === 'function') pending.catch(ignore);
        } catch (error) {
          // 등록할 수 없는 도구는 건너뛴다.
        }
      }
    } catch (error) {
      // WebMCP 를 쓸 수 없는 브라우저에서는 아무 것도 하지 않는다.
    }
  }

  /**
   * WebMCP 도구 하나를 실행한다. 실행 중 오류가 나도 예외를 던지지 않고 오류 내용을 결과로 돌려준다.
   * @param {string} key 도구의 종류 (MCP_TOOLS 의 키)
   * @param {Object} [input] 도구의 입력값
   * @param {Object} [options] 실행 선택 사항 { signal : 중단 신호 }
   * @returns {Promise<Object>} 도구의 결과 { content : [{ type : 'text', text }] }
   */
  async runTool(key, input, options) {
    let args = input && typeof input === 'object' ? input : {};
    let amounts = { start: this.money(START_CASH), salary: this.money(SALARY), space: this.money(SPACE_FEE), welfare: this.money(WELFARE_FEE), sell: SELL_PERCENT, itemSell: ITEM_SELL_PERCENT };
    let cosmos = { salary: this.money(SPACE_SALARY), time: this.money(TIME_FEE), rescue: this.money(RESCUE_FEE), sell: SELL_PERCENT, annexCost: this.money(ANNEX_COST), annexFee: this.money(ANNEX_FEE), annexBonus: this.money(ANNEX_BONUS), annexLimit: BUILD_LIMIT.annex };
    let result = null;
    try {
      switch (key) {
        case 'get_rules': result = this.t('mcp.rules', amounts) + '\n' + this.t('mcp.space.rules', cosmos) + '\n' + this.cardRules() + '\n' + this.leagueRules() + '\n' + this.t('mcp.items.rules', amounts) + '\n' + this.itemRules() + '\n' + this.t('mcp.equips.rules', amounts) + '\n' + this.equipRules() + '\n' + this.charmRules(); break;
        case 'get_guide': result = this.t('mcp.guide') + '\n' + this.t('mcp.space.guide') + '\n' + this.t('mcp.items.guide') + '\n' + this.t('mcp.equips.guide') + '\n' + this.t('mcp.charms.guide'); break;
        case 'get_land': result = this.describeLand(Number(args.index)); break;
        case 'act': result = await this.pressAction(String(args.action), args.value); break;
        case 'set_text': result = this.typeText(String(args.text === undefined ? '' : args.text)); break;
        case 'wait': result = await this.waitForInput(Number(args.seconds), options ? options.signal : null); break;
        default: result = this.describeState(); break;
      }
    } catch (error) {
      result = { ok: false, error: String(error && error.message ? error.message : error) };
    }
    return { content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result) }] };
  }

  /**
   * 아이템마다 이름, 가격, 쓸 수 있는 코스, 설명, 사용 시점을 한 줄씩 정리한다. (WebMCP 의 플레이 방법 설명에 덧붙인다.)
   * @returns {string} 아이템 목록 설명
   */
  itemRules() {
    let lines = [];
    // 아이템마다 설명 한 줄을 만든다.
    for (let id in ITEMS) {
      lines.push(this.t('mcp.items.entry', { item: this.itemName(id), price: this.money(ITEMS[id].price), course: this.itemCourseText(id), description: this.t('item.' + id + '.description'), when: this.t('item.' + id + '.when') }));
    }
    return lines.join('\n');
  }

  /**
   * 카드에 적힌 글에 끼워 넣을 금액과 수치를 구한다. 금액에는 배율을 곱한다.
   * @param {HellmarbleCoupon} card 카드 정보
   * @param {number} multiplier 금액 배율
   * @returns {Object} 문구에 끼워 넣을 값
   */
  cardParams(card, multiplier) {
    let params = { steps: card.steps, need: card.need, range: card.range };
    // 금액인 항목마다 배율을 곱해 금액 문자열로 바꾼다.
    for (let name of ['amount', 'bare', 'built', 'pay', 'gain']) {
      if (card[name] !== undefined) params[name] = this.money(card[name] * multiplier);
    }
    // 건물별 금액이 있는 카드는 종류별 금액을 넣는다.
    for (let kind in card.rates || {}) params[kind] = this.money(card.rates[kind] * multiplier);
    return params;
  }

  /**
   * 카드에 적힌 글을 구한다. 건물별로 금액을 내는 비밀쿠폰 세 종은 같은 글을 쓴다.
   * @param {string} id 카드 식별자
   * @param {number} multiplier 금액 배율
   * @returns {string} 카드에 적힌 글
   */
  cardText(id, multiplier) {
    let card = findCard(id).card;
    return this.t(card.effect === 'tax' ? 'coupon.tax.text' : this.cardKey(id) + '.text', this.cardParams(card, multiplier));
  }

  /**
   * 우주여행 코스의 텔레파시 카드와 뉴런의 골짜기 카드마다 장수와 이름, 적힌 글을 한 줄씩 정리한다. (WebMCP 의 플레이 방법 설명에 덧붙인다.)
   * @returns {string} 카드 목록 설명
   */
  cardRules() {
    let lines = [];
    // 두 덱의 카드를 차례로 정리한다.
    for (let deck of ['telepathy', 'neuron']) {
      let cards = deck === 'neuron' ? NEURON : TELEPATHY;
      lines.push('[' + this.t('card.header.' + deck) + ']');
      // 카드마다 장수, 이름, 적힌 글을 한 줄로 만든다.
      for (let id in cards) lines.push('- ' + this.cardTitle(id) + ' ×' + cards[id].count + ' : ' + this.cardText(id, 1).replace(/\n/g, ' '));
    }
    return lines.join('\n');
  }

  /**
   * 상점에서 파는 색상과 모양마다 분류, 이름, 가격을 한 줄씩 정리한다. (WebMCP 의 플레이 방법 설명에 덧붙인다.)
   * @returns {string} 장착형 아이템 목록 설명
   */
  equipRules() {
    let lines = [];
    // 상점에서 파는 장착형 아이템마다 설명 한 줄을 만든다.
    for (let id in EQUIPS) {
      if (EQUIPS[id].price > 0) lines.push(this.t('mcp.equips.entry', { slot: this.t('item.category.' + EQUIPS[id].slot), item: this.itemName(id), price: this.money(EQUIPS[id].price) }));
    }
    return lines.join('\n');
  }

  /**
   * 리그마다의 참가비, 시작 자금, 금액 배율, 인공지능의 수와 그 리그만의 규칙을 정리한다. (WebMCP 의 플레이 방법 설명에 덧붙인다.)
   * @returns {string} 리그 설명
   */
  leagueRules() {
    let lines = [];
    // 리그마다 설명 한 줄을 만들고, 그 리그에만 있는 규칙을 뒤에 덧붙인다.
    for (let id in LEAGUES) {
      let league = LEAGUES[id];
      let line = this.t('mcp.leagues.entry', { league: this.t('league.' + id), fee: league.fee > 0 ? this.money(league.fee) : this.t('lobby.free'), cash: this.money(league.cash), n: league.multiplier, rivals: this.t('league.' + id + '.rivals') });
      if (league.reward !== null) line += ' ' + this.t('mcp.leagues.reward', { reward: this.money(league.reward) });
      if (league.hideFrom !== null) line += ' ' + this.t('mcp.leagues.hidden', { limit: this.money(league.hideFrom) });
      if (!league.items) line += ' ' + this.t('mcp.leagues.noItems');
      lines.push(line);
    }
    return this.t('mcp.leagues.rules') + '\n' + lines.join('\n');
  }

  /**
   * 아이템 창의 안내 문구를 구한다. 소모형 아이템을 쓸 수 없는 리그의 게임에서는 그 사실을 알린다.
   * @param {string} source 창의 종류 ('lobby' 또는 'game')
   * @returns {string} 안내 문구
   */
  itemHint(source) {
    let league = source === 'game' && this.game ? this.game.state.league : '';
    if (league !== '' && !LEAGUES[league].items) return this.t('item.hint.barred', { league: this.t('league.' + league) });
    return this.t('item.hint.' + source);
  }

  /**
   * 부적의 규칙(추첨권의 가격, 등급별 확률과 판매 가격)과 부적마다의 등급, 이름, 효과를 정리한다. (WebMCP 의 플레이 방법 설명에 덧붙인다.)
   * @returns {string} 부적 설명
   */
  charmRules() {
    let sells = [];
    let lines = [];
    // 등급마다 판매 가격을 적는다.
    for (let grade in CHARM_GRADES) sells.push(this.t('charm.grade.' + grade) + ' ' + this.money(CHARM_GRADES[grade].sell));
    // 부적마다 설명 한 줄을 만든다.
    for (let id in CHARMS) lines.push(this.t('mcp.charms.entry', { grade: this.gradeName(id), item: this.itemName(id), brief: this.itemText(id, 'brief') }));
    let params = { ticket: this.money(CHARM_TICKETS.charmticket.price), ticket10: this.money(CHARM_TICKETS.charmticket10.price), odds: this.drawOdds(), sells: sells.join(', '), starter: this.itemName(STARTER_CHARM) };
    return this.t('mcp.charms.rules', params) + '\n' + lines.join('\n');
  }

  /**
   * 지금 조작할 수 있는 영역을 구한다. 대화 상자가 떠 있으면 그 안만 조작할 수 있고,
   * 아이템 창 위에 상세 팝업이 떠 있으면 그 팝업 안만 조작할 수 있다.
   * @returns {HTMLElement} 조작할 수 있는 영역
   */
  activeScope() {
    if (!this.modal) return this.root;
    return this.itemView && this.itemView.layer ? this.itemView.layer : this.modal.overlay;
  }

  /**
   * 사용자의 입력 없이 연출(주사위, 이동, 다른 플레이어의 차례)이 진행되는 중인지 확인한다.
   * @returns {boolean} 진행 중이면 true
   */
  isBusy() {
    return this.screen === 'game' && !this.modal && this.mode === 'busy';
  }

  /**
   * 지금 누를 수 있는 동작의 목록을 만든다. 보드의 칸 40개는 한 줄로 줄여서 알려준다.
   * @returns {Object[]} 동작 목록 { action, value, label }
   */
  listActions() {
    let list = [];
    let tiles = false;
    // 누를 수 있는 요소를 모두 찾아 동작 이름, 값, 보이는 글자를 모은다.
    for (let node of this.activeScope().querySelectorAll('[data-action]')) {
      if (node.disabled) continue;
      if (node.dataset.action === 'game.tile') {
        tiles = true;
        continue;
      }
      let item = { action: node.dataset.action, label: node.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) };
      if (node.dataset.value !== undefined) item.value = node.dataset.value;
      list.push(item);
    }
    if (tiles) list.push({ action: 'game.tile', value: '0~39', label: this.t('mcp.tiles') });
    return list;
  }

  /**
   * 현재 화면의 상황을 정리한다. (화면 종류, 떠 있는 창, 아이템 창의 상태, 입력란, 누를 수 있는 동작, 게임 진행 상황)
   * @returns {Object} 현재 상황
   */
  describeState() {
    let scope = this.activeScope();
    let heading = scope.querySelector('.hm-modal-title, .hm-heading, .hm-logo');
    let text = scope.querySelector('.hm-modal-text');
    let due = scope.querySelector('.hm-due');
    let field = scope.querySelector('.hm-input');
    let state = { screen: this.screen, language: this.settings.language, dark: this.settings.dark, busy: this.isBusy(), title: heading ? heading.textContent : '' };
    if (this.modal) state.dialog = { title: state.title, text: (text ? text.textContent : '') + (due ? '\n' + due.firstChild.textContent + ' : ' + due.lastChild.textContent : '') };
    if (this.itemView) state.itemWindow = { kind: this.itemView.source, tab: this.itemView.tab, category: this.itemView.filter, detail: this.itemView.detail, quantity: this.itemView.quantity, notice: this.itemView.notice, drawn: this.itemView.reveal };
    if (field) state.input = { value: field.value };
    if (this.slot && (this.screen === 'lobby' || this.screen === 'game')) state.slot = { number: this.slotIndex + 1, name: this.slot.name, money: this.slot.money, items: this.screen === 'lobby' ? this.slot.items : this.game.state.players[0].items, equips: this.slot.equips, charms: this.slot.charms, equipped: this.slot.equipped };
    if (this.game) state.game = this.describeGame();
    state.actions = this.listActions();
    return state;
  }

  /**
   * 진행 중인 게임의 상황을 정리한다. (차례, 주사위, 플레이어, 소유자가 있는 땅, 최근 기록)
   * @returns {Object} 게임 상황
   */
  describeGame() {
    let game = this.game;
    let state = game.state;
    let players = [];
    let lands = [];
    let logs = [];
    // 플레이어마다 현재 상황을 정리한다.
    for (let player of state.players) {
      players.push({
        id: player.id, name: this.playerName(player), you: !player.ai, alive: player.alive, cash: player.cash, assets: game.assets(player),
        position: player.position, tile: this.tileName(player.position), island: player.island, boarded: player.boarded, direct: player.direct, coupons: player.coupons,
        items: player.items, usedItems: player.usedItems, loaded: player.loaded, look: player.look, color: this.styleOf(player).color, symbol: this.styleOf(player).symbol, charm: player.charm,
      });
    }
    // 소유자가 있는 땅(우주여행 코스에서는 기지가 남아 있는 주인 없는 별도)을 정리한다.
    for (let index = 0; index < BOARD_SIZE; index++) {
      let land = state.lands[index];
      if (!land || (land.owner === null && !(land.base > 0))) continue;
      let info = { index, name: this.tileName(index), owner: land.owner, toll: game.toll(index) };
      // 그 코스의 건물 종류별 개수를 넣는다.
      for (let kind of game.course.buildings) info[kind] = land[kind];
      lands.push(info);
    }
    // 최근 진행 기록을 문장으로 바꾼다.
    for (let entry of this.intro ? [] : state.logs.slice(-8)) logs.push(this.describe(entry));
    return {
      league: state.league, course: LEAGUES[state.league].course, multiplier: state.multiplier, mode: this.mode, ordering: this.intro, turnOf: game.current.id, again: this.mode === 'roll' && this.again,
      hint: this.parts.status ? this.parts.status.textContent : '', dice: state.dice, fund: state.fund, request: this.request,
      openLand: this.popover ? this.popover.index : null, players, lands, recentLogs: logs,
    };
  }

  /**
   * 보드 한 칸의 정보를 정리한다. 게임 중이 아니면 배율 1배의 기본 금액을 알려준다.
   * @param {number} index 칸 번호
   * @returns {Object} 칸의 정보
   */
  describeLand(index) {
    if (!isCount(index, BOARD_SIZE - 1)) return { ok: false, error: 'index : 0~39' };
    let course = this.courseNow();
    let tile = course.board[index];
    let game = this.game;
    let land = game ? game.state.lands[index] : null;
    let multiplier = game ? game.state.multiplier : 1;
    let info = { index, id: tile.id, name: this.tileName(index), type: this.t('type.' + tile.type), description: this.t(TEXTS.ko['desc.' + tile.id] ? 'desc.' + tile.id : 'desc.' + tile.type) };
    if (TEXTS.ko['real.' + tile.id]) info.real = this.t('real.' + tile.id);
    if (tile.price !== undefined) {
      info.color = tile.show;
      info.price = tile.price * multiplier;
      info.toll = tile.toll * multiplier;
    }
    // 건물을 지을 수 있는 땅이면 건물 종류별 건설비와 이용료를 넣는다. (별의 기지 이용료는 통행료에 더하는 값이 아니라 기지가 있을 때의 이용료 전체이다.)
    for (let kind of tile.cost ? course.buildings : []) {
      info[kind] = { cost: tile.cost[kind] * multiplier, fee: tile.fee[kind] * multiplier, limit: BUILD_LIMIT[kind], built: land ? land[kind] : 0 };
    }
    if (index === course.tiles.columbia || index === course.tiles.space) info.spaceFee = SPACE_FEE * multiplier;
    if (index === course.tiles.timemachine || index === course.tiles.timetravel) info.timeFee = TIME_FEE * multiplier;
    if (land) {
      info.owner = land.owner;
      info.ownerName = land.owner === null ? null : this.playerName(game.state.players[land.owner]);
      info.currentToll = game.toll(index);
      info.saleValue = game.saleValue(index);
    }
    if (game) {
      info.players = [];
      // 이 칸에 서 있는 생존 플레이어의 번호를 모은다.
      for (let player of game.state.players) {
        if (player.alive && player.position === index) info.players.push(player.id);
      }
    }
    return info;
  }

  /**
   * 지금 누를 수 있는 동작 하나를 실제로 누른다. 화면에 없는 동작이나 비활성화된 동작은 누를 수 없다.
   * 누른 뒤에는 이어지는 처리(창이 닫힌 뒤의 화면 전환 등)가 반영되도록 잠깐 기다렸다가 상황을 돌려준다.
   * @param {string} action 동작 이름
   * @param {*} [value] 동작에 딸린 값
   * @returns {Promise<Object>} 결과 { ok, state } 또는 { ok, error, actions }
   */
  async pressAction(action, value) {
    let wanted = value === undefined || value === null ? '' : String(value);
    // 조작할 수 있는 영역에서 동작 이름과 값이 같은 요소를 찾아 누른다.
    for (let node of this.activeScope().querySelectorAll('[data-action]')) {
      if (node.disabled || node.dataset.action !== action || (node.dataset.value || '') !== wanted) continue;
      node.click();
      await wait(1);
      return { ok: true, state: this.describeState() };
    }
    return { ok: false, error: this.t('mcp.unknown'), actions: this.listActions() };
  }

  /**
   * 화면의 입력란(이름 입력, JSON 불러오기)에 글자를 넣는다.
   * @param {string} text 넣을 글자
   * @returns {Object} 결과 { ok } 또는 { ok, error }
   */
  typeText(text) {
    let field = this.activeScope().querySelector('.hm-input');
    if (!field || field.readOnly) return { ok: false, error: this.t('mcp.noInput') };
    field.value = text;
    return { ok: true, input: { value: field.value }, actions: this.listActions() };
  }

  /**
   * 연출이 끝나 사용자의 입력이 필요해질 때까지 기다린 뒤 현재 상황을 돌려준다.
   * @param {number} [seconds] 기다릴 최대 시간 (초, 1~120, 기본값 30)
   * @param {AbortSignal} [signal] 기다리기를 중단시키는 신호
   * @returns {Promise<Object>} 현재 상황
   */
  async waitForInput(seconds, signal) {
    let limit = Date.now() + Math.min(120, Math.max(1, seconds || 30)) * 1000;
    // 입력이 필요해지거나 제한 시간이 지나거나 중단될 때까지 잠깐씩 기다린다.
    while (this.isBusy() && Date.now() < limit && !(signal && signal.aborted)) await wait(200);
    return this.describeState();
  }

  /* ------------------------------ 호스트 구현 ------------------------------ */

  /**
   * 차례가 시작될 때 화면을 갱신한다. 사용자의 차례가 되면 열려 있던 땅 정보 창을 자동으로 닫는다.
   * 주사위를 굴리지 않고 목적지를 고르는 차례(세계여행 코스의 우주여행에 탑승한 차례, 우주여행 코스에서 시간여행 초청장으로 탑승한 차례)인지 기억해 두어,
   * 그 차례가 끝날 때까지 주사위 자리에 우주선을 보여준다.
   * @param {Object} player 차례가 된 플레이어
   * @returns {Promise<void>}
   */
  async turnStart(player) {
    this.moving = -1;
    this.flight = Boolean(player.boarded) && (this.game.course.flight || Boolean(player.direct));
    this.castDice = null;
    if (!player.ai) this.closePopover();
    this.refresh();
  }

  /**
   * 차례가 끝날 때마다 진행 상황을 저장한다. (게임이 끝난 경우의 저장은 정산에서 한다.)
   * @returns {Promise<void>}
   */
  async turnEnd() {
    if (!this.game || this.game.state.finished) return;
    this.saveSlot();
    this.refresh();
    await wait(this.timings.pause);
  }

  /**
   * 주사위를 굴리는 모습을 보여준 뒤 결과를 표시한다.
   * @param {Object} player 주사위를 굴린 플레이어
   * @param {number[]} dice 두 주사위의 눈
   * @param {number[]|null} [faces] 주사위 조작형 아이템이 적용되었으면 그 주사위에서 나올 수 있는 눈
   * @returns {Promise<void>}
   */
  async dice(player, dice, faces) {
    void player;
    this.castDice = null;
    await this.rollDice(dice, faces);
    await wait(this.timings.pause);
  }

  /**
   * 카드의 효과로 플레이어가 주사위(1개 또는 2개)를 굴리는 모습을 보여준다. 누가 굴리는지를 안내 문구로 알리고, 결과는 다음 주사위를 굴리거나 다음 차례가 시작될 때까지 주사위 자리에 남긴다.
   * @param {Object} player 주사위를 굴린 플레이어
   * @param {number[]} dice 굴린 주사위의 눈 (1개 또는 2개)
   * @returns {Promise<void>}
   */
  async cast(player, dice) {
    if (!this.game || !this.parts.center) return;
    this.castDice = null;
    this.parts.status.textContent = this.t('cast.rolling', { player: this.playerName(player) });
    this.parts.dice.classList.add('hm-casting');
    paint(this.parts.dice, 'player', this.styleOf(player));
    await this.rollDice(dice, null, this.timings.cast);
    this.castDice = dice.slice();
    await wait(this.timings.pause);
    this.parts.dice.classList.remove('hm-casting');
  }

  /**
   * 가운데 영역의 주사위가 구르는 모습을 정해진 시간 동안 보여준 뒤 지정한 눈에서 멈춘다.
   * @param {number[]} dice 멈췄을 때 보일 주사위의 눈 (보통 두 개, 카드의 효과로 굴릴 때에는 하나일 수 있다.)
   * @param {number[]|null} [faces] 구르는 동안 보여줄 눈의 목록 (생략하면 1~6)
   * @param {number} [duration] 구르는 시간 (밀리초, 생략하면 주사위 굴림의 기본 시간)
   * @returns {Promise<void>}
   */
  async rollDice(dice, faces, duration) {
    let until = Date.now() + (duration === undefined ? this.timings.dice : duration);
    let shown = faces && faces.length > 0 ? faces : [1, 2, 3, 4, 5, 6];
    this.rolling = true;
    this.parts.dice.classList.add('hm-rolling');
    // 정해진 시간 동안 임의의 눈을 번갈아 보여준다.
    while (Date.now() < until) {
      this.renderDice(shown[Math.floor(Math.random() * shown.length)], dice.length > 1 ? shown[Math.floor(Math.random() * shown.length)] : undefined);
      await wait(70);
    }
    this.rolling = false;
    this.parts.dice.classList.remove('hm-rolling');
    this.renderDice(dice[0], dice[1]);
  }

  /**
   * 말이 한 칸 이동한 모습을 보여준다. (일반 이동은 0.5초, 빠른 이동은 0.25초에 한 칸)
   * @param {Object} player 이동한 플레이어
   * @param {boolean} fast 빠른 이동 여부
   * @returns {Promise<void>}
   */
  async step(player, fast) {
    this.moving = player.id;
    this.refresh();
    await wait(fast ? this.timings.fastStep : this.timings.step);
    this.moving = -1;
  }

  /**
   * 뽑힌 비밀쿠폰의 내용을 정해진 시간(6초) 동안 보드 가운데에 보여준다.
   * 닫기 버튼을 누르면 정해진 시간이 지나기 전에도 바로 닫고 진행한다.
   * @param {Object} player 쿠폰을 뽑은 플레이어
   * @param {string} id 쿠폰 식별자
   * @returns {Promise<void>}
   */
  async coupon(player, id) {
    let deck = findCard(id).deck;
    let gate = defer();
    let head = deck === 'coupon' ? ICONS.coupon + ' ' + this.t('coupon.header') : ICONS[deck] + ' ' + this.t('card.header.' + deck);
    let card = el('div', { class: 'hm-coupon hm-coupon-' + deck, style: { '--hm-coupon-time': this.timings.coupon + 'ms', '--hm-player': this.styleOf(player).color } }, [
      el('div', { class: 'hm-coupon-head', text: head }),
      el('div', { class: 'hm-coupon-title', text: this.cardTitle(id) }),
      el('p', { class: 'hm-coupon-text', text: this.cardText(id, this.game.state.multiplier) }),
      el('div', { class: 'hm-coupon-drawer' }, [this.buildLookToken(player.look), this.t(deck === 'coupon' ? 'coupon.drawer' : 'card.drawer', { player: this.playerName(player) })]),
      button(this.t('common.close'), 'coupon.close', undefined, 'hm-coupon-close'),
      el('div', { class: 'hm-coupon-bar' }),
    ]);
    this.couponGate = gate;
    this.parts.center.append(card);
    await Promise.race([wait(this.timings.coupon), gate.promise]);
    if (this.couponGate === gate) this.couponGate = null;
    card.remove();
  }

  /**
   * 보여주고 있는 비밀쿠폰을 바로 닫고 게임을 진행시킨다.
   */
  closeCoupon() {
    if (this.couponGate) this.couponGate.resolve();
  }

  /**
   * 돈이 오가는 모습을 보여준다. 플레이어끼리(통행료, 이용료)는 물론 은행, 사회복지기금 본부와 오가는 돈도 같은 방식으로 보여준다.
   * 누가 누구에게 얼마를 주는지 보드 가운데에 크게 띄우고, 내는 쪽에서 지폐가 나와 받는 쪽으로 날아가게 한다.
   * 지폐가 드나드는 자리는 플레이어는 말, 은행은 출발지 칸, 사회복지기금 본부는 그 칸이며, 은행과 본부의 칸은 연출하는 동안 테두리를 빛낸다.
   * 플레이어의 카드도 각각 내는 쪽과 받는 쪽으로 강조한다. 은행·본부와의 돈 이동은 자주 일어나므로 조금 짧게 보여준다.
   * 오간 돈이 큰 금액(BIG_TRANSFER 에 리그 배율을 곱한 금액 이상)이면 시간을 조금 더 들여 지폐를 훨씬 많이 날리고 안내 띠도 금빛으로 강조한다.
   * @param {Object|string} payer 돈을 내는 쪽 (플레이어, 은행이면 BANK, 사회복지기금 본부이면 FUND)
   * @param {Object|string} receiver 돈을 받는 쪽 (플레이어, 은행이면 BANK, 사회복지기금 본부이면 FUND)
   * @param {number} amount 건넨 금액 (원)
   * @returns {Promise<void>}
   */
  async transfer(payer, receiver, amount) {
    let offices = [this.officeTile(payer), this.officeTile(receiver)];
    let office = offices[0] >= 0 ? payer : offices[1] >= 0 ? receiver : null;
    let usual = office ? this.timings.bank : this.timings.transfer;
    if (!(usual > 0) || !this.game || !this.parts.center) return;
    let big = amount >= this.game.money(BIG_TRANSFER);
    let duration = usual + (big ? Math.max(0, this.timings.boost) : 0);
    let banner = el('div', { class: 'hm-transfer' + (office ? ' hm-transfer-' + office : '') + (big ? ' hm-transfer-big' : ''), style: { '--hm-time': duration + 'ms' }, attrs: { role: 'status' } }, [
      this.transferSide(payer),
      el('span', { class: 'hm-transfer-arrow', text: '➜' }),
      this.transferSide(receiver),
      el('strong', { class: 'hm-transfer-amount', text: this.money(amount) }),
    ]);
    let flying = this.flyBills(payer, receiver, amount, duration, big);
    let cards = [offices[0] < 0 ? this.cards[payer.id] : null, offices[1] < 0 ? this.cards[receiver.id] : null];
    let tile = office ? this.tiles[Math.max(offices[0], offices[1])].node : null;
    this.parts.center.append(banner);
    if (cards[0]) cards[0].classList.add('hm-player-pay');
    if (cards[1]) cards[1].classList.add('hm-player-get');
    if (tile) tile.classList.add('hm-tile-' + office);
    await wait(duration);
    banner.remove();
    // 날린 지폐와 금액 표시를 화면에서 치운다.
    for (let node of flying) node.remove();
    if (cards[0]) cards[0].classList.remove('hm-player-pay');
    if (cards[1]) cards[1].classList.remove('hm-player-get');
    if (tile) tile.classList.remove('hm-tile-' + office);
  }

  /**
   * 돈을 내거나 받는 쪽이 은행 또는 사회복지기금 본부이면 그곳이 있는 칸을 알려 준다. 은행은 출발지 칸에 있는 것으로 본다.
   * @param {Object|string} party 플레이어, 또는 은행(BANK)·사회복지기금 본부(FUND)
   * @returns {number} 칸 번호 (플레이어이면 -1)
   */
  officeTile(party) {
    if (party === BANK) return this.courseNow().start;
    if (party === FUND) return this.courseNow().fund;
    return -1;
  }

  /**
   * 돈 이동 안내 띠에 넣을, 돈을 내거나 받는 쪽의 표시를 만든다. 플레이어는 말과 이름, 은행과 사회복지기금 본부는 그림 문자와 이름이다.
   * @param {Object|string} party 플레이어, 또는 은행(BANK)·사회복지기금 본부(FUND)
   * @returns {HTMLElement} 만들어진 요소
   */
  transferSide(party) {
    if (this.officeTile(party) < 0) return el('span', { class: 'hm-transfer-side' }, [this.buildToken(party), this.playerName(party)]);
    let fund = this.courseNow().board[this.courseNow().fund].id;
    return el('span', { class: 'hm-transfer-side' }, [
      el('span', { class: 'hm-transfer-icon', text: party === BANK ? ICONS.bank : ICONS[fund], attrs: { 'aria-hidden': 'true' } }),
      this.t(party === BANK ? 'game.bank' : 'tile.' + fund),
    ]);
  }

  /**
   * 돈을 내거나 받는 쪽이 보드 위에 있는 화면상의 위치를 구한다. 플레이어는 말, 은행과 사회복지기금 본부는 그곳이 있는 칸의 가운데이다.
   * @param {Object|string} party 플레이어, 또는 은행(BANK)·사회복지기금 본부(FUND)
   * @returns {{x: number, y: number, size: number}} 가운데 좌표와 칸의 크기 (픽셀)
   */
  partyPoint(party) {
    let office = this.officeTile(party);
    let parts = this.tiles[office < 0 ? party.position : office];
    let token = office < 0 ? parts.tokens.querySelector('[data-player="' + party.id + '"]') : null;
    let rect = (token || parts.node).getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, size: parts.node.getBoundingClientRect().width };
  }

  /**
   * 내는 쪽에서 받는 쪽까지 지폐 여러 장을 시차를 두고 포물선으로 날린다. 금액이 클수록 지폐가 많이 날아간다.
   * 큰 금액이면 지폐를 세 배 가까이 많이, 더 넓게 퍼뜨려 날리고(금빛 지폐가 섞인다), 받는 쪽에서는 돈이 쏟아져 들어온 것을 터지는 빛으로 알린다.
   * 내는 플레이어에게는 빠져나간 금액을, 받는 쪽에는 들어온 금액을 띄운다.
   * 은행이나 사회복지기금 본부가 내는 쪽일 때에는 그 칸에 금액을 띄우지 않는다. (월급처럼 받는 플레이어가 같은 칸에 서 있는 경우가 많아 겹치기 때문이다.)
   * 움직임을 줄이도록 설정한 사용자에게는 금액 표시만 보여주며, 움직임 기능이 없는 브라우저에서는 건너뛴다.
   * @param {Object|string} payer 돈을 내는 쪽 (플레이어, 은행이면 BANK, 사회복지기금 본부이면 FUND)
   * @param {Object|string} receiver 돈을 받는 쪽 (플레이어, 은행이면 BANK, 사회복지기금 본부이면 FUND)
   * @param {number} amount 건넨 금액 (원)
   * @param {number} duration 연출 전체의 시간 (밀리초)
   * @param {boolean} [big=false] 큰 금액이어서 더 크게 연출할지 여부
   * @returns {HTMLElement[]} 화면에 띄운 요소 목록 (연출이 끝나면 치워야 한다.)
   */
  flyBills(payer, receiver, amount, duration, big = false) {
    let nodes = [];
    try {
      let from = this.partyPoint(payer);
      let to = this.partyPoint(receiver);
      let distance = Math.hypot(to.x - from.x, to.y - from.y);
      let still = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let count = still ? 0 : big ? BIG_BILLS : 6 + Math.min(10, Math.round((amount / this.game.money(START_CASH)) * 40));
      let tag = big ? ' hm-float-big' : '';
      if (this.officeTile(payer) < 0) nodes.push(el('span', { class: 'hm-float hm-float-pay' + tag, text: '-' + this.money(amount), style: { left: from.x + 'px', top: from.y + 'px', '--hm-time': duration + 'ms' } }));
      nodes.push(el('span', { class: 'hm-float hm-float-get' + tag, text: '+' + this.money(amount), style: { left: to.x + 'px', top: to.y + 'px', '--hm-time': duration + 'ms' } }));
      if (big && !still) nodes.push(el('span', { class: 'hm-burst', style: { left: to.x + 'px', top: to.y + 'px', '--hm-size': to.size + 'px', '--hm-time': duration + 'ms' } }));
      // 지폐를 한 장씩 만들어 조금씩 다른 길로, 시차를 두고 날린다.
      for (let index = 0; index < count; index++) {
        let bill = el('span', { class: 'hm-bill' + (big && index % 3 === 0 ? ' hm-bill-gold' : ''), text: '₩', style: { left: from.x + 'px', top: from.y + 'px', 'font-size': Math.max(11, from.size * (big ? 0.24 : 0.2)) + 'px' } });
        let sway = (index % 2 === 0 ? 1 : -1) * (10 + ((index * 17) % (big ? 110 : 40)));
        let controlX = (to.x - from.x) / 2 + sway;
        let controlY = (to.y - from.y) / 2 - Math.max(90, distance * 0.45) - Math.abs(sway);
        let frames = [];
        // 포물선 위의 점을 차례로 구해 지폐가 날아가는 길을 만든다.
        for (let step = 0; step <= 8; step++) {
          let t = step / 8;
          let x = 2 * (1 - t) * t * controlX + t * t * (to.x - from.x);
          let y = 2 * (1 - t) * t * controlY + t * t * (to.y - from.y);
          let edge = step === 0 || step === 8;
          frames.push({ transform: 'translate(-50%, -50%) translate(' + x + 'px, ' + y + 'px) scale(' + (edge ? 0.3 : 1 + 0.3 * Math.sin(Math.PI * t)) + ') rotate(' + sway * 9 * t + 'deg)', opacity: edge ? 0 : 1 });
        }
        bill.animate(frames, { duration: duration * 0.5, delay: (duration * 0.4 * index) / count, easing: 'ease-in-out', fill: 'both' });
        nodes.push(bill);
      }
    } catch (error) {
      // 움직임을 표현할 수 없는 브라우저에서는 만들어진 것까지만 보여준다.
    }
    this.root.append(...nodes);
    // 화면에 붙인 금액 표시가 화면 밖으로 나가지 않도록 자리를 잡는다.
    for (let node of nodes) {
      if (node.classList.contains('hm-float')) this.fitFloat(node);
    }
    return nodes;
  }

  /**
   * 금액 표시가 화면 밖으로 나가지 않도록 자리를 잡는다. (사회복지기금 본부처럼 보드 맨 윗줄이나 가장자리에서 띄우는 경우)
   * 위쪽에 떠오를 자리가 없으면 아래로 떠오르게 하고, 좌우로 넘치면 화면 안으로 당긴다.
   * 이미 시작된 움직임은 방향을 바꿔도 따라오지 않으므로, 크기를 재고 방향을 정하는 동안에는 움직임을 꺼 두었다가 다시 켠다.
   * @param {HTMLElement} node 화면에 붙인 금액 표시
   */
  fitFloat(node) {
    node.style.animation = 'none';
    let half = node.offsetWidth / 2 + 4;
    let width = document.documentElement.clientWidth;
    if (parseFloat(node.style.top) < node.offsetHeight * 2.6) node.classList.add('hm-float-down');
    if (width > half * 2) node.style.left = Math.max(half, Math.min(parseFloat(node.style.left), width - half)) + 'px';
    node.style.animation = '';
  }

  /**
   * 누군가 우대권이나 무전기를 사용한 것을 보드 가운데에 잠깐 크게 보여준다. 사용자와 인공지능, 비밀쿠폰과 아이템을 가리지 않는다.
   * 누가 무엇을 썼는지와 그 효과(면제받은 칸과 금액, 무인도 탈출)를 알리고, 보드 위에서는 사용한 플레이어의 말에서 빛의 고리가 퍼지며
   * 효과가 일어난 칸(우대권은 면제받은 칸, 무전기는 무인도)에 도장을 찍는다.
   * @param {Object} player 사용한 플레이어
   * @param {Object} info 사용한 것 { kind, source } 와 종류별 값 (pass : index, amount, travel / radio : arrival)
   * @returns {Promise<void>}
   */
  async use(player, info) {
    let duration = this.timings.use;
    if (!(duration > 0) || !this.game || !this.parts.center || !ICONS[info.kind]) return;
    let waived = info.kind === 'pass' || (info.kind === 'angel' && (info.reason === 'fee' || info.reason === 'timefee'));
    let index = waived ? info.index : player.position;
    let source = info.source === 'coupon' ? this.game.course.words.card : 'use.source.' + info.source;
    let banner = el('div', { class: 'hm-use-flash hm-use-' + info.kind, style: { '--hm-time': duration + 'ms' }, attrs: { role: 'status' } }, [
      el('span', { class: 'hm-use-flash-owner' }, [this.buildToken(player), this.playerName(player)]),
      el('span', { class: 'hm-use-flash-icon', text: ICONS[info.kind], attrs: { 'aria-hidden': 'true' } }),
      el('strong', { class: 'hm-use-flash-title', text: this.t('use.' + info.kind + '.title') }),
      el('span', { class: 'hm-use-flash-source', text: this.t(source) }),
      el('span', { class: 'hm-use-flash-text', text: this.useText(info, index) }),
      waived ? el('span', { class: 'hm-use-flash-amount' }, [el('s', { class: 'hm-num', text: this.money(info.amount) }), el('span', { text: '➜' }), el('strong', { text: this.t('use.' + info.kind + '.stamp') })]) : null,
    ]);
    let marks = this.markUse(player, info.kind, index, duration);
    this.parts.center.append(banner);
    await wait(duration);
    banner.remove();
    // 보드 위에 띄운 빛의 고리와 도장을 치운다.
    for (let node of marks) node.remove();
  }

  /**
   * 보관한 카드나 아이템을 사용했을 때 알림에 적을, 그 효과를 설명하는 문구를 구한다.
   * 우대권은 면제받은 칸, 무전기와 블랙홀 탈출포트는 탈출, 천사의 빛은 면제받은 이용료나 탈출 또는 면한 카드의 효과를 알린다.
   * @param {Object} info 사용한 것 { kind, reason, travel, card }
   * @param {number} index 효과가 일어난 칸 번호
   * @returns {string} 문구
   */
  useText(info, index) {
    switch (info.kind) {
      case 'pass': return this.t(info.travel ? 'use.pass.travel' : 'use.pass.text', { tile: this.tileName(index) });
      case 'radio': return this.t('use.radio.text');
      case 'escape': return this.t('use.escape.text');
      default:
        if (info.reason === 'fee' || info.reason === 'timefee') return this.t('use.angel.fee', { tile: this.tileName(index) });
        return info.reason === 'escape' ? this.t('use.angel.escape') : this.t('use.angel.card', { card: info.card ? this.cardTitle(info.card) : '' });
    }
  }

  /**
   * 우주여행 코스에서 일어난 사건을 보드 가운데에 잠깐 크게 알린다. 알리기 전에 화면을 갱신하여 바뀐 땅의 주인과 기지를 함께 보여준다.
   * 알림의 문장은 진행 기록과 같은 방식으로 만든다.
   * @param {Object} entry 알릴 내용 { key, params }
   * @returns {Promise<void>}
   */
  async notice(entry) {
    let duration = this.timings.notice;
    if (!(duration > 0) || !this.game || !this.parts.center) return;
    let owner = entry.params.player === undefined ? null : this.game.state.players[entry.params.player];
    let banner = el('div', { class: 'hm-use-flash hm-use-notice', style: { '--hm-time': duration + 'ms' }, attrs: { role: 'status' } }, [
      owner ? el('span', { class: 'hm-use-flash-owner' }, [this.buildToken(owner), this.playerName(owner)]) : null,
      el('span', { class: 'hm-use-flash-icon', text: ICONS.notice, attrs: { 'aria-hidden': 'true' } }),
      el('strong', { class: 'hm-use-flash-title', text: this.describe(entry) }),
    ]);
    this.refresh();
    this.parts.center.append(banner);
    await wait(duration);
    banner.remove();
  }

  /**
   * 우대권이나 무전기를 사용한 것을 보드 위에 표시한다. 사용한 플레이어의 말에서 빛의 고리 세 개가 차례로 퍼지고, 효과가 일어난 칸에 도장이 찍힌다.
   * 자리를 구할 수 없는 경우에는 만들어진 것까지만 보여준다.
   * @param {Object} player 사용한 플레이어
   * @param {string} kind 사용한 것 ('pass' 또는 'radio')
   * @param {number} index 효과가 일어난 칸 번호
   * @param {number} duration 연출 전체의 시간 (밀리초)
   * @returns {HTMLElement[]} 화면에 띄운 요소 목록 (연출이 끝나면 치워야 한다.)
   */
  markUse(player, kind, index, duration) {
    let nodes = [];
    try {
      let from = this.partyPoint(player);
      let rect = this.tiles[index].node.getBoundingClientRect();
      let style = { '--hm-size': from.size + 'px', '--hm-time': duration + 'ms' };
      // 말에서 퍼져 나가는 빛의 고리를 시차를 두고 세 개 만든다.
      for (let order = 0; order < 3; order++) nodes.push(el('span', { class: 'hm-ring hm-use-' + kind, style: { ...style, left: from.x + 'px', top: from.y + 'px', '--hm-order': order } }));
      nodes.push(el('span', { class: 'hm-stamp hm-use-' + kind, text: this.t('use.' + kind + '.stamp'), style: { ...style, left: rect.left + rect.width / 2 + 'px', top: rect.top + rect.height / 2 + 'px' } }));
    } catch (error) {
      // 자리를 구할 수 없으면 만들어진 것까지만 보여준다.
    }
    this.root.append(...nodes);
    return nodes;
  }

  /**
   * 누군가 패배한 것(파산 또는 포기)을 보여준다. 사용자와 인공지능을 가리지 않는다.
   * 패배한 플레이어의 말이 서 있던 자리에서 폭발이 일어나고, 말은 빙글빙글 돌며 보드 바깥으로 튕겨나간다.
   * 폭발하는 순간 화면을 갱신하여 칸에 있던 말과 그 플레이어의 땅, 건물을 함께 치우고, 보드가 잠깐 흔들리며 그 칸과 플레이어의 카드가 붉게 번쩍인다.
   * 보드 가운데에는 누가 어떻게 패배했는지를 알리는 알림을 띄운다. 진행 기록은 이 연출이 끝난 뒤에 남는다.
   * @param {Object} player 패배한 플레이어
   * @param {boolean} voluntary 포기로 인한 패배인지 여부
   * @returns {Promise<void>}
   */
  async defeat(player, voluntary) {
    let duration = this.timings.defeat;
    if (!(duration > 0) || !this.game || !this.parts.center) return;
    let kind = voluntary ? 'forfeit' : 'bankrupt';
    let tile = this.tiles[player.position].node;
    let board = tile.parentNode;
    let debris = this.blowAway(player, duration);
    let banner = el('div', { class: 'hm-defeat-flash', style: { '--hm-time': duration + 'ms' }, attrs: { role: 'status' } }, [
      el('span', { class: 'hm-defeat-flash-icon', text: ICONS.defeat, attrs: { 'aria-hidden': 'true' } }),
      el('strong', { class: 'hm-defeat-flash-title', text: this.t('defeat.' + kind + '.title', { player: this.playerName(player) }) }),
    ]);
    this.refresh();
    this.parts.center.append(banner);
    tile.classList.add('hm-tile-blast');
    if (debris.length > 0) board.classList.add('hm-board-quake');
    if (this.cards[player.id]) this.cards[player.id].classList.add('hm-player-pay');
    await wait(duration);
    banner.remove();
    // 보드 위에 띄운 폭발과 튕겨나간 말을 치운다.
    for (let node of debris) node.remove();
    tile.classList.remove('hm-tile-blast');
    board.classList.remove('hm-board-quake');
    if (this.cards[player.id]) this.cards[player.id].classList.remove('hm-player-pay');
  }

  /**
   * 패배한 플레이어의 말을 그 자리에서 터뜨려 보드 바깥으로 날려 보낸다.
   * 말이 서 있던 자리에 불덩이와 충격파, 연기를 띄우고 불티를 사방으로 튀긴 뒤, 말과 똑같이 생긴 것을 만들어 보드 중앙에서 먼 쪽으로 날린다.
   * 날아가는 말은 처음에는 제자리에서 크게 솟아오르고(보는 쪽으로 튀어 오르는 모습), 이어서 빙글빙글 돌며 보드를 벗어나 화면 밖으로 떨어진다.
   * 날아가는 거리는 그 방향의 화면 끝까지로 잡아, 화면 끝이 가깝든 멀든 말이 화면을 벗어나는 순간에 움직임이 끝나게 한다.
   * 칸에 있던 진짜 말은 부르는 쪽이 화면을 갱신하여 치우므로, 그 전에 불러서 말의 자리와 크기를 재야 한다.
   * 움직임을 줄이도록 설정한 사용자에게는 아무것도 띄우지 않으며, 움직임 기능이 없는 브라우저에서는 만들어진 것까지만 보여준다.
   * @param {Object} player 패배한 플레이어
   * @param {number} duration 연출 전체의 시간 (밀리초)
   * @returns {HTMLElement[]} 화면에 띄운 요소 목록 (연출이 끝나면 치워야 한다.)
   */
  blowAway(player, duration) {
    let nodes = [];
    try {
      if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) return nodes;
      let parts = this.tiles[player.position];
      let from = this.partyPoint(player);
      let piece = parts.tokens.querySelector('[data-player="' + player.id + '"]');
      let size = piece ? piece.getBoundingClientRect().width : from.size * 0.3;
      let board = parts.node.parentNode.getBoundingClientRect();
      let look = this.styleOf(player);
      let spot = { left: from.x + 'px', top: from.y + 'px', '--hm-size': from.size + 'px', '--hm-time': duration + 'ms' };
      let colors = [look.color, '#ffd43b', '#ff922b', '#fa5252'];
      nodes.push(el('span', { class: 'hm-blast-smoke', style: spot }), el('span', { class: 'hm-blast-wave', style: spot }), el('span', { class: 'hm-blast', style: spot }));
      // 불티를 조금씩 다른 방향과 거리로 사방에 튀긴다. 네 개에 하나는 말의 색으로 하여 말의 조각처럼 보이게 한다.
      for (let index = 0; index < BLAST_SPARKS; index++) {
        let angle = ((index + ((index * 37) % 10) / 10 - 0.5) / BLAST_SPARKS) * Math.PI * 2;
        let far = from.size * (0.8 + ((index * 53) % 80) / 100);
        nodes.push(el('span', { class: 'hm-spark', style: { ...spot, '--hm-spark': colors[index % colors.length], '--hm-dx': Math.cos(angle) * far + 'px', '--hm-dy': Math.sin(angle) * far + 'px' } }));
      }
      let awayX = from.x - (board.left + board.width / 2);
      let awayY = from.y - (board.top + board.height / 2);
      let away = Math.hypot(awayX, awayY) || 1;
      let unitX = awayX / away;
      let unitY = awayY / away;
      let width = document.documentElement.clientWidth;
      let height = document.documentElement.clientHeight;
      let exitX = unitX > 0 ? (width - from.x) / unitX : unitX < 0 ? -from.x / unitX : Infinity;
      let exitY = unitY > 0 ? (height - from.y) / unitY : unitY < 0 ? -from.y / unitY : Infinity;
      let reach = Math.max(Math.min(exitX, exitY) + size * 2.5, from.size * 1.5);
      let spin = player.id % 2 === 0 ? 1 : -1;
      let drift = spin * Math.min(reach * 0.35, board.width * 0.12);
      let margin = size * 2.5;
      let endX = from.x + unitX * reach - unitY * drift;
      let endY = from.y + unitY * reach + unitX * drift;
      // 옆으로 비껴가는 정도까지 반영해, 말 전체가 화면 밖으로 나갈 때까지 거리를 늘린다.
      while (endX >= -margin && endX <= width + margin && endY >= -margin && endY <= height + margin) {
        reach += Math.max(size * 0.5, board.width * 0.01);
        drift = spin * Math.min(reach * 0.35, board.width * 0.12);
        endX = from.x + unitX * reach - unitY * drift;
        endY = from.y + unitY * reach + unitX * drift;
      }
      let token = this.buildLookToken(player.look, 'hm-token hm-token-out');
      let frames = [];
      Object.assign(token.style, { left: from.x + 'px', top: from.y + 'px' });
      token.style.setProperty('--hm-size', size + 'px');
      // 날아가는 길 위의 점을 차례로 구한다. 나아간 거리는 뒤로 갈수록 빠르게 늘고, 크기는 솟았다가 떨어지며, 길은 옆으로 조금씩 비껴간다.
      for (let step = 0; step <= 12; step++) {
        let t = step / 12;
        let gone = reach * Math.pow(t, 1.8);
        let bend = drift * t;
        let x = unitX * gone - unitY * bend;
        let y = unitY * gone + unitX * bend;
        let scale = 1 + 1.9 * Math.sin(Math.PI * Math.pow(t, 0.6));
        frames.push({ transform: 'translate(-50%, -50%) translate(' + x + 'px, ' + y + 'px) scale(' + scale + ') rotate(' + spin * 1080 * t + 'deg)', opacity: t > 0.85 ? (1 - t) / 0.15 : 1 });
      }
      token.animate(frames, { duration: duration * 0.78, delay: duration * 0.04, easing: 'linear', fill: 'both' });
      nodes.push(token);
    } catch (error) {
      // 움직임을 표현할 수 없는 브라우저에서는 만들어진 것까지만 보여준다.
    }
    this.root.append(...nodes);
    return nodes;
  }

  /**
   * 장착한 부적의 효과가 일어난 것을 보드 가운데에 잠깐 크게 보여준다. 부적의 등급에 따라 빛의 색이 다르다.
   * 인공지능도 부적을 장착하는 리그가 있으므로, 누구의 부적인지 말과 이름으로 함께 알린다.
   * 땅값 할인과 통행료·이용료 할인은 원래 금액에 줄을 긋고 깎인 금액을 함께 보여주며, 이 연출이 끝난 뒤에 깎인 금액만 빠져나간다.
   * 부적의 자세한 설명은 아이템 확인 창에서만 보이며, 게임 화면에는 플레이어 정보 창의 이름과 효과가 일어난 이 순간, 진행 기록에만 나타난다.
   * @param {Object} player 부적을 장착한 플레이어
   * @param {Object} info 일어난 효과 { effect, charm } 와 효과별 값 (discount, toll : index, price, paid / build : index, building / redraw : coupon)
   * @returns {Promise<void>}
   */
  async charm(player, info) {
    let duration = this.timings.charm;
    let charm = CHARMS[info.charm];
    if (!(duration > 0) || !charm || !this.game || !this.parts.center) return;
    let params = {
      tile: info.index === undefined ? '' : this.tileName(info.index), percent: charm.percent,
      building: info.building ? this.t('building.' + info.building) : '', coupon: info.coupon ? this.t('coupon.' + info.coupon + '.title') : '',
    };
    let banner = el('div', { class: 'hm-charm-flash hm-grade-' + charm.grade, style: { '--hm-time': duration + 'ms' }, attrs: { role: 'status' } }, [
      el('span', { class: 'hm-charm-flash-owner' }, [this.buildToken(player), this.playerName(player)]),
      el('span', { class: 'hm-charm-flash-icon', text: charm.icon, attrs: { 'aria-hidden': 'true' } }),
      el('strong', { class: 'hm-charm-flash-title', text: this.t('charm.flash', { item: this.itemName(info.charm) }) }),
      el('span', { class: 'hm-charm-flash-text', text: this.t('charm.flash.' + info.effect, params) }),
      info.effect === 'discount' || info.effect === 'toll' ? el('span', { class: 'hm-charm-flash-price' }, [el('s', { class: 'hm-num', text: this.money(info.price) }), el('span', { text: '➜' }), this.figure(info.paid)]) : null,
    ]);
    this.parts.center.append(banner);
    await wait(duration);
    banner.remove();
  }

  /**
   * 인공지능 플레이어가 판단하는 동안 잠시 기다린다.
   * @param {Object} player 판단 중인 플레이어
   * @param {Object} request 판단할 내용
   * @returns {Promise<void>}
   */
  async think(player, request) {
    void player;
    void request;
    await wait(this.timings.think);
  }

  /**
   * 사용자에게 선택을 요청한다. 답을 받을 때까지 어떤 요청을 기다리는 중인지 기억해 둔다. (WebMCP 의 상황 조회에 쓴다.)
   * @param {Object} player 사용자 플레이어
   * @param {Object} request 선택할 내용
   * @returns {Promise<*>} 선택 결과
   */
  async ask(player, request) {
    this.request = request;
    try {
      return await this.respond(player, request);
    } finally {
      this.request = null;
    }
  }

  /**
   * 요청의 종류에 맞는 버튼 또는 대화 상자로 사용자의 입력을 받는다.
   * @param {Object} player 사용자 플레이어
   * @param {Object} request 선택할 내용
   * @returns {Promise<*>} 선택 결과
   */
  respond(player, request) {
    switch (request.type) {
      case 'roll': return this.awaitInput('roll', request.again);
      case 'travel': return this.awaitInput('travel');
      case 'buy': return this.askBuy(player, request);
      case 'build': return this.askBuild(player, request);
      case 'sell': return this.askSell(player, request);
      case 'pass': return this.askPass(player, request);
      case 'radio': return this.askRadio(player, request);
      case 'angel': return this.askAngel(player, request);
      case 'escape': return this.askEscape(player, request);
      case 'pick': return request.map ? this.awaitInput('pick', false, request.options) : this.askPick(player, request);
      case 'target': return this.askTarget(player, request);
      case 'dicecount': return this.askDiceCount();
      default: return null;
    }
  }

  /**
   * 게임 상태가 바뀌면 화면을 다시 그린다.
   * @param {HellmarbleGame} game 상태가 바뀐 게임
   */
  update(game) {
    if (game === this.game) this.refresh();
  }

  /**
   * 사용자가 주사위를 굴리거나(roll) 우주여행 목적지를 고를 때까지(travel) 기다린다.
   * 기다리는 동안에는 메인 메뉴로 나갈 수도 있다. 열려 있던 땅 정보 창은 닫는다.
   * 우주여행 코스에서 보드의 칸을 골라 이동할 때(pick : 시간여행, 모라비트의 항법)에도 쓰며, 이때에는 메인 메뉴로 나가거나 포기할 수 없다.
   * @param {string} mode 기다릴 입력의 종류 ('roll', 'travel' 또는 'pick')
   * @param {boolean} [again] 더블이 나와 주사위를 한 번 더 굴리는 것인지 여부
   * @param {number[]} [options] 고를 수 있는 칸 번호 목록 (pick 일 때)
   * @returns {Promise<*>} 입력 결과 (메인 메뉴로 나가면 QUIT)
   */
  awaitInput(mode, again, options) {
    this.closePopover();
    this.waiting = defer();
    this.mode = mode;
    this.again = Boolean(again);
    this.pickOptions = options || null;
    this.refreshCenter();
    if (mode === 'roll') this.parts.roll.focus({ preventScroll: true });
    return this.waiting.promise;
  }

  /**
   * 기다리던 사용자 입력에 답한다. 기다리는 입력의 종류가 맞지 않으면 무시한다.
   * @param {string} mode 답하려는 입력의 종류 (빈 문자열이면 종류를 가리지 않는다.)
   * @param {*} value 입력 결과
   */
  answer(mode, value) {
    if (!this.waiting || this.mode === 'busy' || (mode !== '' && mode !== this.mode)) return;
    let waiting = this.waiting;
    this.waiting = null;
    this.mode = 'busy';
    this.closePopover();
    this.refreshCenter();
    waiting.resolve(value);
  }

  /**
   * 사용자의 보유 현금을 보여주는 줄을 만든다.
   * @param {Object} player 사용자 플레이어
   * @returns {HTMLElement} 보유 현금 표시
   */
  cashLine(player) {
    return el('p', { class: 'hm-cash-line' }, [this.t('player.cash') + ' : ', this.figure(player.cash)]);
  }

  /**
   * 빈 땅의 구매 여부를 묻는다. 땅의 가격과 건설비, 통행료, 이용료 내역을 함께 보여준다.
   * @param {Object} player 사용자 플레이어
   * @param {Object} request 구매 요청 { index, price }
   * @returns {Promise<boolean>} 구매 여부
   */
  async askBuy(player, request) {
    let answer = await this.dialog({
      title: this.t('ask.buy.title'), body: [this.buildLandInfo(request.index), this.cashLine(player)],
      buttons: [{ label: this.t('ask.buy.yes', { amount: this.money(request.price) }), value: 'yes', primary: true }, { label: this.t('ask.buy.no'), value: 'no' }],
    });
    return answer === 'yes';
  }

  /**
   * 자기 땅에 지을 건물을 묻는다. 건설하지 않고 넘어가는 선택지도 제공한다.
   * 우주여행 코스에서 기지가 이미 있는 별이면 기지의 증축을 묻는 창이 된다. (증축 비용과, 증축한 뒤에 오르는 이용료를 선택지에 적는다.)
   * @param {Object} player 사용자 플레이어
   * @param {Object} request 건설 요청 { index, options }
   * @returns {Promise<string|null>} 지을 건물의 종류 (짓지 않으면 null)
   */
  async askBuild(player, request) {
    let game = this.game;
    let tile = game.board[request.index];
    let land = game.state.lands[request.index];
    let kinds = game.buildKinds(request.index);
    let annex = kinds.includes('annex');
    let name = annex ? 'ask.annex' : game.course.words.build;
    let buttons = [];
    // 지을 차례가 된 건물 종류별로 선택지를 만든다. 지을 수 없는 건물은 이유와 함께 비활성화한다.
    for (let kind of kinds) {
      let params = { building: ICONS[kind] + ' ' + this.t('building.' + kind), amount: this.money(game.buildCost(request.index, kind)) };
      let key = land[kind] >= BUILD_LIMIT[kind] ? 'ask.build.max' : request.options.includes(kind) ? 'ask.build.option' : 'ask.build.short';
      if (kind === 'annex') {
        key = 'ask.annex.option';
        params.from = this.money(game.toll(request.index));
        params.to = this.money(game.tollAfter(request.index, kind));
      }
      buttons.push({ label: this.t(key, params), value: kind, primary: true, disabled: !request.options.includes(kind) });
    }
    buttons.push({ label: this.t(name + '.no'), value: 'skip' });
    let text = this.t(name + '.text', annex ? { fee: this.money(game.money(tile.fee.annex)), bonus: this.money(game.money(ANNEX_BONUS)), limit: BUILD_LIMIT.annex, n: land.annex } : {});
    let answer = await this.dialog({ title: this.t(name + '.title'), text, body: [this.buildLandInfo(request.index), this.cashLine(player)], buttons, stack: true });
    return kinds.includes(answer) ? answer : null;
  }

  /**
   * 지불할 돈이 부족할 때 매각할 땅을 묻는다. 화면을 음영 처리하고 사용자가 가진 땅의 목록을 보여준다.
   * @param {Object} player 사용자 플레이어
   * @param {Object} request 매각 요청 { amount }
   * @returns {Promise<number|string>} 매각할 땅의 칸 번호 또는 포기 신호
   */
  async askSell(player, request) {
    let game = this.game;
    // 포기를 취소하면 매각 목록을 다시 보여준다.
    while (true) {
      let buttons = [];
      // 가진 땅마다 매각 선택지를 만든다.
      for (let index of game.owned(player)) {
        buttons.push({ label: this.t('ask.sell.option', { tile: this.landLabel(index), amount: this.money(game.saleValue(index)) }), value: index });
      }
      buttons.push({ label: this.t('game.forfeit'), value: FORFEIT, danger: true });
      let params = { amount: this.money(request.amount), cash: this.money(player.cash), short: this.money(request.amount - player.cash), n: SELL_PERCENT };
      let answer = await this.dialog({ kind: 'sell', title: this.t('ask.sell.title'), text: this.t('ask.sell.text', params), buttons, stack: true });
      if (answer !== FORFEIT) return Number(answer);
      if (await this.confirm(this.t('confirm.forfeit.title'), this.t('confirm.forfeit.text'), this.t('confirm.forfeit.yes'), this.t('common.no'))) return FORFEIT;
    }
  }

  /**
   * 내야 할 통행료·이용료를 우대권으로 면제받을지 창 하나로 묻는다.
   * 지불할 금액을 따로 한 줄로 강조하고, 쓸 수 있는 우대권마다(비밀쿠폰, 아이템) 선택지를 하나씩 두며 마지막에 사용하지 않는 선택지를 둔다.
   * @param {Object} player 사용자 플레이어
   * @param {Object} request 우대권 요청 { index, amount, travel, coupon, item }
   * @returns {Promise<string|null>} 'coupon' (비밀쿠폰 우대권), 'item' (아이템 우대권), 쓰지 않으면 null
   */
  async askPass(player, request) {
    let due = el('p', { class: 'hm-due' }, [el('span', { class: 'hm-due-label', text: this.t('ask.pass.due') }), this.figure(request.amount)]);
    let answer = await this.dialog({
      kind: 'pass', title: ICONS.pass + ' ' + this.t('ask.pass.title'), text: this.t(request.travel ? 'ask.pass.travel' : 'ask.pass.text', { tile: this.tileName(request.index) }),
      body: [due, this.cashLine(player)], buttons: this.sourceButtons('pass', player, request), stack: true,
    });
    return answer === 'coupon' || answer === 'item' ? answer : null;
  }

  /**
   * 무인도에서 무전기로 탈출할지 창 하나로 묻는다.
   * 쓸 수 있는 무전기마다(비밀쿠폰, 아이템) 선택지를 하나씩 두며 마지막에 사용하지 않는 선택지를 둔다.
   * @param {Object} player 사용자 플레이어
   * @param {Object} request 무전기 요청 { arrival, coupon, item }
   * @returns {Promise<string|null>} 'coupon' (비밀쿠폰 무전기), 'item' (아이템 무전기), 쓰지 않으면 null
   */
  async askRadio(player, request) {
    let answer = await this.dialog({
      kind: 'radio', title: ICONS.radio + ' ' + this.t('ask.radio.title'), text: this.t(request.arrival ? 'ask.radio.arrival' : 'ask.radio.text'),
      buttons: this.sourceButtons('radio', player, request), stack: true,
    });
    return answer === 'coupon' || answer === 'item' ? answer : null;
  }

  /**
   * 천사의 빛으로 손해를 면할지 창 하나로 묻는다. 어떤 손해인지 알리고, 낼 돈이 있는 경우에는 그 금액을 따로 한 줄로 강조한다.
   * 쓸 수 있는 천사의 빛마다(텔레파시 카드, 아이템) 선택지를 하나씩 두며 마지막에 사용하지 않는 선택지를 둔다.
   * 다른 플레이어의 차례에 카드의 효과로 손해를 보게 되었을 때에도 이 창이 뜬다.
   * @param {Object} player 사용자 플레이어
   * @param {Object} request 천사의 빛 요청 { reason, amount, index, target, other, card, coupon, item }
   * @returns {Promise<string|null>} 'coupon' (텔레파시 카드 천사의 빛), 'item' (아이템 천사의 빛), 쓰지 않으면 null
   */
  async askAngel(player, request) {
    let players = this.game.state.players;
    let params = {
      card: request.card ? this.cardTitle(request.card) : '', tile: request.index === undefined ? '' : this.tileName(request.index),
      other: request.other === undefined ? '' : this.tileName(request.other), target: request.target === undefined ? '' : this.playerName(players[request.target]),
    };
    let owed = ['fee', 'timefee', 'pay', 'claim'].includes(request.reason);
    let due = owed ? el('p', { class: 'hm-due' }, [el('span', { class: 'hm-due-label', text: this.t('ask.pass.due') }), this.figure(request.amount)]) : null;
    let buttons = [];
    if (request.coupon) buttons.push({ label: this.t('ask.angel.coupon', { n: player.coupons.angel }), value: 'coupon', primary: true });
    if (request.item) buttons.push({ label: this.t('ask.angel.item', { n: player.items.angel, left: this.itemUsesLeft('angel') }), value: 'item', primary: true });
    buttons.push({ label: this.t('ask.keep'), value: 'no' });
    let answer = await this.dialog({ kind: 'angel', title: ICONS.angel + ' ' + this.t('ask.angel.title'), text: this.t('ask.angel.' + request.reason, params), body: [due, owed ? this.cashLine(player) : null], buttons, stack: true });
    return answer === 'coupon' || answer === 'item' ? answer : null;
  }

  /**
   * 블랙홀에서 블랙홀 탈출포트나 천사의 빛으로 탈출할지 창 하나로 묻는다.
   * 쓸 수 있는 것마다(텔레파시 카드 블랙홀 탈출포트, 아이템 블랙홀 탈출포트, 텔레파시 카드 천사의 빛, 아이템 천사의 빛) 선택지를 하나씩 두며 마지막에 사용하지 않는 선택지를 둔다.
   * @param {Object} player 사용자 플레이어
   * @param {Object} request 탈출 요청 { arrival, last, escape : { coupon, item }, angel : { coupon, item } }
   * @returns {Promise<string|null>} 'escape.coupon', 'escape.item', 'angel.coupon', 'angel.item' 가운데 하나, 쓰지 않으면 null
   */
  async askEscape(player, request) {
    let buttons = [];
    if (request.escape.coupon) buttons.push({ label: this.t('ask.escape.coupon', { n: player.coupons.escape }), value: 'escape.coupon', primary: true });
    if (request.escape.item) buttons.push({ label: this.t('ask.escape.item', { n: player.items.escape }), value: 'escape.item', primary: true });
    if (request.angel.coupon) buttons.push({ label: this.t('ask.angel.coupon', { n: player.coupons.angel }), value: 'angel.coupon', primary: true });
    if (request.angel.item) buttons.push({ label: this.t('ask.angel.item', { n: player.items.angel, left: this.itemUsesLeft('angel') }), value: 'angel.item', primary: true });
    buttons.push({ label: this.t('ask.keep'), value: 'no' });
    let text = this.t(request.arrival ? 'ask.escape.arrival' : request.last ? 'ask.escape.last' : 'ask.escape.text');
    let answer = await this.dialog({ kind: 'escape', title: ICONS.blackhole + ' ' + this.t('ask.escape.title'), text, buttons, stack: true });
    return typeof answer === 'string' && answer.includes('.') ? answer : null;
  }

  /**
   * 자기 땅 하나에 지금 지을 차례가 된 것(우주여행 코스 : 기지가 없으면 기지 건설, 있으면 증축)의 비용과, 지은 뒤 이용료가 어떻게 바뀌는지를 적은 설명을 만든다.
   * 지구에 도착했을 때나 견우성·직녀성의 주인이 만났을 때 지을 별을 고르는 창의 선택지에 덧붙인다.
   * @param {number} index 칸 번호
   * @returns {string} 설명 (예 : "건설비 5만원 · 이용료 5만원 → 20만원", "증축 10만원 · 이용료 25만원 → 35만원")
   */
  workDetail(index) {
    let game = this.game;
    let kind = game.buildKinds(index)[0];
    let cost = this.t(kind === 'annex' ? 'ask.pick.annex' : 'ask.pick.cost', { amount: this.money(game.buildCost(index, kind)) });
    return cost + ' · ' + this.t('ask.pick.rise', { from: this.money(game.toll(index)), to: this.money(game.tollAfter(index, kind)) });
  }

  /**
   * 칸을 고르는 창의 선택지에 덧붙일, 그 칸에 대한 짧은 설명을 사유에 맞게 만든다. (잃는 것은 가치를, 기지는 이용료의 변화를, 남의 별은 주인과 이용료를 알린다.)
   * @param {string} reason 고르는 사유
   * @param {number} index 칸 번호
   * @returns {string} 설명 (덧붙일 것이 없으면 빈 문자열)
   */
  pickDetail(reason, index) {
    let game = this.game;
    let tile = game.board[index];
    let land = game.state.lands[index];
    switch (reason) {
      case 'blackhole': return this.t('ask.pick.value', { amount: this.money(game.value(index)) });
      case 'give': return this.t('ask.pick.value', { amount: this.money(game.value(index)) });
      case 'take': return this.t('ask.pick.value', { amount: this.money(game.value(index)) });
      case 'basereturn': return this.t('ask.pick.fee', { amount: this.money(game.toll(index)) });
      case 'freebase': return this.t('ask.pick.rise', { from: this.money(game.money(tile.toll)), to: this.money(game.money(tile.fee.base)) });
      case 'reunion': return this.workDetail(index);
      case 'earth': return this.workDetail(index);
      case 'pascal': return this.t('ask.pick.owner', { player: this.playerName(game.state.players[land.owner]), amount: this.money(game.toll(index)) });
      default: return '';
    }
  }

  /**
   * 카드의 효과 등으로 칸 하나를 골라야 할 때 선택지가 든 창으로 묻는다. 고르지 않아도 되는 선택에는 고르지 않는 선택지를 더한다.
   * @param {Object} player 사용자 플레이어
   * @param {Object} request 선택 요청 { reason, options, optional, card }
   * @returns {Promise<number|null>} 고른 칸 번호 (고르지 않으면 null)
   */
  async askPick(player, request) {
    let buttons = [];
    void player;
    // 고를 수 있는 칸마다 이름과 짧은 설명을 적은 선택지를 만든다.
    for (let index of request.options) {
      let detail = this.pickDetail(request.reason, index);
      buttons.push({ label: this.landLabel(index) + (detail ? ' (' + detail + ')' : ''), value: index, primary: true });
    }
    if (request.optional) buttons.push({ label: this.t('ask.pick.skip'), value: 'skip' });
    let params = { card: request.card ? this.cardTitle(request.card) : '' };
    let answer = await this.dialog({ kind: 'pick', title: this.t('ask.pick.' + request.reason + '.title'), text: this.t('ask.pick.' + request.reason + '.text', params), buttons, stack: true });
    return answer === null || answer === 'skip' ? null : Number(answer);
  }

  /**
   * 카드의 효과로 다른 플레이어 한 명을 골라야 할 때 선택지가 든 창으로 묻는다.
   * @param {Object} player 사용자 플레이어
   * @param {Object} request 선택 요청 { reason, options : 플레이어 번호 목록, card }
   * @returns {Promise<number|null>} 고른 플레이어의 번호
   */
  async askTarget(player, request) {
    let buttons = [];
    void player;
    // 고를 수 있는 플레이어마다 이름과 보유 현금을 적은 선택지를 만든다.
    for (let id of request.options) {
      let rival = this.game.state.players[id];
      buttons.push({ label: this.styleOf(rival).symbol + ' ' + this.playerName(rival) + ' (' + this.money(rival.cash) + ')', value: id, primary: true });
    }
    let answer = await this.dialog({ kind: 'pick', title: this.t('ask.target.title'), text: this.t('ask.target.text', { card: request.card ? this.cardTitle(request.card) : '' }), buttons, stack: true });
    return answer === null ? null : Number(answer);
  }

  /**
   * 조디악의 선물 카드에서 주사위를 1개 던질지 2개 던질지 묻는다.
   * @returns {Promise<number>} 던질 주사위의 수 (1 또는 2)
   */
  async askDiceCount() {
    let answer = await this.dialog({
      kind: 'pick', title: ICONS.dice + ' ' + this.t('ask.dicecount.title'), text: this.t('ask.dicecount.text'),
      buttons: [{ label: this.t('ask.dicecount.one'), value: 1, primary: true }, { label: this.t('ask.dicecount.two'), value: 2, primary: true }], stack: true,
    });
    return Number(answer) === 2 ? 2 : 1;
  }

  /**
   * 우대권 또는 무전기 사용 창의 선택지를 만든다.
   * 비밀쿠폰의 것, 아이템의 것 순서로 쓸 수 있는 것만 넣고 마지막에 사용하지 않는 선택지를 둔다.
   * @param {string} id 우대권이면 'pass', 무전기이면 'radio'
   * @param {Object} player 사용자 플레이어
   * @param {Object} request 요청 { coupon, item }
   * @returns {Object[]} 대화 상자의 선택지 목록
   */
  sourceButtons(id, player, request) {
    let buttons = [];
    if (request.coupon) buttons.push({ label: this.t('ask.' + id + '.coupon', { n: player.coupons[id] }), value: 'coupon', primary: true });
    if (request.item) buttons.push({ label: this.t('ask.' + id + '.item', { n: player.items[id] }), value: 'item', primary: true });
    buttons.push({ label: this.t('ask.keep'), value: 'no' });
    return buttons;
  }
}

/* ==========================================================================
 * 9-1. 화면 모양 (스타일)
 * ========================================================================== */

/**
 * 게임의 스타일 요소에 붙이는 표시(속성 이름)이다. 같은 곳에 스타일을 두 번 넣지 않도록, 이 표시로 이미 넣은 것을 찾는다.
 * @type {string}
 */
export const STYLE_MARK = 'data-hellmarble-style';

/**
 * 게임 화면의 모양을 정하는 스타일시트(CSS)의 내용이다.
 * 화면의 요소와 마찬가지로 모양도 이 파일이 가지고 있다가, 초기화할 때 installStyle() 이 문서에 넣는다.
 * 그래서 css/hellmarble.css 가 없어도 게임 화면은 그대로 그려진다. (그 파일에는 게임을 초기화하기 전의 페이지 스타일만 있다. 글꼴 파일은 css/fonts.css 가 불러온다.)
 * 선택자는 모두 게임이 만드는 요소의 클래스(hm- 으로 시작한다)만 쓰므로, 페이지의 다른 요소에는 영향을 주지 않는다.
 * 보드 안쪽의 크기는 보드 너비에 비례하는 단위(cqw)를 써서 화면 크기에 맞게 함께 커지고 작아진다.
 * CSS 의 역슬래시를 그대로 적을 수 있도록 String.raw 로 적었다. 내용에 백틱과 "${" 는 쓸 수 없다.
 * @type {string}
 */
export const STYLE_TEXT = String.raw`
/* ---------- 색상 (밝은 화면 / 어두운 화면) ---------- */

.hm-root {
  --hm-bg: #ece6d8;
  --hm-surface: #fffdf7;
  --hm-surface-2: #f4eee0;
  --hm-text: #232733;
  --hm-muted: #6a6f7d;
  --hm-line: #d6cdb8;
  --hm-accent: #0f766e;
  --hm-accent-ink: #ffffff;
  --hm-tile: #fffdf7;
  --hm-corner: #f1e9d6;
  --hm-felt-a: #dcefe6;
  --hm-felt-b: #c5e0d4;
  --hm-paper: #fff7dc;
  --hm-shadow: 0 16px 40px rgba(60, 50, 20, 0.16);
  /*
   * 글꼴은 글을 보여주는 것과 데이터·수치를 보여주는 것으로 나눈다. 글꼴 파일은 fonts.css 가 불러온다.
   * Noto Sans 자리에는 fonts.css 가 불러오는 언어별 Noto Sans (한국어, 일본어, 중국어 간체, 그 밖의 문자)를 모두 적는다.
   * 데이터·수치용에는 고정폭인 Noto Sans Mono 를 그 앞에 둔다.
   */
  --hm-font-noto: "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", "Noto Sans";
  --hm-font-text: "Pretendard", var(--hm-font-noto), "D2Coding", sans-serif;
  --hm-font-data: "D2Coding", "Nanum Gothic Coding", "Noto Sans Mono", var(--hm-font-noto), monospace;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--hm-bg);
  color: var(--hm-text);
  font-family: var(--hm-font-text);
  font-size: 16px;
  line-height: 1.45;
  -webkit-text-size-adjust: 100%;
}

.hm-root[data-theme="dark"] {
  --hm-bg: #0f1219;
  --hm-surface: #1a1f2a;
  --hm-surface-2: #232937;
  --hm-text: #e9ecf3;
  --hm-muted: #9aa3b5;
  --hm-line: #364054;
  --hm-accent: #2cc7b5;
  --hm-accent-ink: #05211e;
  --hm-tile: #232a38;
  --hm-corner: #2b3344;
  --hm-felt-a: #17242b;
  --hm-felt-b: #1d3136;
  --hm-paper: #2c2818;
  --hm-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
}

.hm-root *,
.hm-root *::before,
.hm-root *::after {
  box-sizing: border-box;
}

/* ---------- 데이터·수치용 글꼴 ---------- */

/*
 * 금액과 가격을 따로 보여주는 자리에는 데이터·수치용 글꼴을 쓴다. (JSON 입력창은 .hm-textarea 에서 지정한다.)
 * 문장 안에 섞여 있는 금액은 문장의 글꼴을 그대로 따른다.
 */
.hm-num,
.hm-slot-money,
.hm-wallet-money,
.hm-items-money,
.hm-item-price,
.hm-trade-number,
.hm-trade-money,
.hm-tile-sub,
.hm-fund-money,
.hm-player-cash,
.hm-transfer-amount,
.hm-float {
  font-family: var(--hm-font-data);
}

/* ---------- 버튼 ---------- */

.hm-button {
  appearance: none;
  padding: 12px 18px;
  border: 1px solid var(--hm-line);
  border-radius: 12px;
  background: var(--hm-surface-2);
  color: var(--hm-text);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.08s ease, filter 0.15s ease, background 0.15s ease;
}

.hm-button:hover:not(:disabled) {
  filter: brightness(1.06);
}

.hm-button:active:not(:disabled) {
  transform: translateY(1px);
}

.hm-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.hm-button:focus-visible,
.hm-tile:focus-visible,
.hm-slot:focus-visible,
.hm-player:focus-visible,
.hm-land-item:focus-visible,
.hm-item-card:focus-visible,
.hm-items-x:focus-visible,
.hm-input:focus-visible {
  outline: 3px solid var(--hm-accent);
  outline-offset: 2px;
}

.hm-primary,
.hm-active {
  border-color: var(--hm-accent);
  background: var(--hm-accent);
  color: var(--hm-accent-ink);
}

.hm-danger:not(:disabled) {
  border-color: #e03131;
  color: #e03131;
}

.hm-danger:not(:disabled):hover {
  background: rgba(224, 49, 49, 0.12);
}

.hm-wide {
  width: 100%;
}

/* ---------- 메뉴, 슬롯, 대기실, 설정 화면 ---------- */

.hm-page {
  display: grid;
  place-items: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 24px 16px;
}

.hm-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: min(100%, 560px);
  padding: 32px;
  border: 1px solid var(--hm-line);
  border-radius: 22px;
  background: var(--hm-surface);
  box-shadow: var(--hm-shadow);
}

.hm-lobby {
  width: min(100%, 900px);
}

.hm-menu {
  align-items: center;
  width: min(100%, 420px);
  text-align: center;
}

.hm-logo-dice {
  display: flex;
  gap: 12px;
  transform: rotate(-8deg);
}

.hm-logo {
  margin: 4px 0 0;
  font-size: clamp(34px, 9vw, 52px);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.hm-heading {
  margin: 0;
  font-size: 26px;
  font-weight: 900;
}

.hm-tagline {
  margin: 0;
  color: var(--hm-muted);
}

.hm-menu-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: 12px;
}

.hm-menu-list .hm-button {
  padding: 15px 18px;
  font-size: 18px;
}

.hm-slots {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.hm-slot {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-height: 136px;
  padding: 16px;
  border: 2px solid var(--hm-line);
  border-radius: 16px;
  background: var(--hm-surface-2);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.08s ease;
}

.hm-slot:hover:not(:disabled) {
  border-color: var(--hm-accent);
  transform: translateY(-2px);
}

.hm-slot:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hm-slot-blank {
  border-style: dashed;
  background: transparent;
}

.hm-slot-title {
  color: var(--hm-muted);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.hm-slot-name {
  max-width: 100%;
  overflow: hidden;
  font-size: 19px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hm-slot-money {
  font-weight: 700;
}

.hm-slot-state,
.hm-slot-empty {
  color: var(--hm-muted);
  font-size: 14px;
}

.hm-form {
  width: min(100%, 440px);
}

.hm-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--hm-line);
  border-radius: 12px;
  background: var(--hm-surface-2);
  color: var(--hm-text);
  font: inherit;
  font-size: 18px;
}

.hm-wallet {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 16px;
  background: var(--hm-surface-2);
}

.hm-wallet-label {
  color: var(--hm-muted);
  font-weight: 700;
}

.hm-wallet-money {
  font-size: clamp(22px, 5vw, 30px);
  font-weight: 900;
}

/* 리그 카드는 보이는 리그의 수(--hm-league-count)만큼 한 줄에 나란히 놓는다. */
.hm-leagues {
  display: grid;
  grid-template-columns: repeat(var(--hm-league-count, 3), minmax(0, 1fr));
  gap: 14px;
}

.hm-league {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border: 2px solid var(--hm-league);
  border-radius: 18px;
  background: color-mix(in srgb, var(--hm-league) 9%, var(--hm-surface));
}

.hm-league .hm-row {
  padding: 3px 0;
}

.hm-league-name {
  margin: 0 0 4px;
  color: var(--hm-league);
  font-size: 21px;
  font-weight: 900;
}

.hm-league-rivals {
  flex: 1;
  margin: 4px 0 8px;
  color: var(--hm-muted);
  font-size: 13px;
}

.hm-note {
  margin: 0;
  color: var(--hm-muted);
  font-size: 14px;
}

.hm-lobby-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hm-lobby-buttons .hm-button {
  flex: 1 1 160px;
}

/* 대기실에서 장착한 색상과 모양(내 말), 보유 아이템 요약을 나란히 보여준다. */
.hm-lobby-status {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hm-lobby-status > * {
  flex: 1 1 240px;
}

/* 대기실에 보이는 보유 아이템 요약이다. 아이템이 늘어도 길어지지 않도록 종류 수와 개수만 적는다. */
.hm-look,
.hm-item-total {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  margin: 0;
  padding: 8px 14px;
  border: 1px solid var(--hm-line);
  border-radius: 12px;
  background: var(--hm-surface-2);
  color: var(--hm-muted);
  font-size: 14px;
  font-weight: 650;
}

.hm-look .hm-token {
  --hm-size: 28px;
}

/* 색상이나 모양을 장착하지 않아 리그에 참여할 수 없는 상태를 알린다. */
.hm-look-missing {
  border-color: #e03131;
  color: #e03131;
}

/* ---------- 아이템 창 (상점, 보유 아이템 목록) ---------- */

/*
 * 제목과 보유 현황, 탭과 분류 버튼, 닫기 버튼은 제자리에 두고 가운데의 아이템 목록만 스크롤한다.
 * 아이템이 많아져도 창은 화면을 넘지 않고, 목록은 창의 너비에 맞춰 여러 줄로 나열된다.
 */
.hm-modal.hm-items {
  gap: 0;
  width: min(100%, 880px);
  padding: 0;
  overflow: hidden;
}

.hm-items-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  padding: 18px 22px 8px;
}

.hm-items-head .hm-modal-title {
  flex: 1 1 auto;
}

.hm-items-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hm-items-stat {
  display: flex;
  flex-direction: column;
  padding: 6px 12px;
  border: 1px solid var(--hm-line);
  border-radius: 12px;
  background: var(--hm-surface-2);
  line-height: 1.25;
}

.hm-items-stat-label {
  color: var(--hm-muted);
  font-size: 11px;
  font-weight: 700;
}

.hm-items-stat-value {
  font-size: 15px;
  font-weight: 900;
}

.hm-items-money {
  color: var(--hm-accent);
}

.hm-items-x {
  appearance: none;
  flex: none;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--hm-line);
  border-radius: 50%;
  background: var(--hm-surface-2);
  color: var(--hm-text);
  font: inherit;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
}

.hm-items-x:hover {
  filter: brightness(1.06);
}

.hm-items-hint {
  padding: 0 22px 12px;
  font-size: 14px;
}

.hm-items-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  padding: 0 22px 14px;
  border-bottom: 1px solid var(--hm-line);
}

.hm-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 14px;
  background: var(--hm-surface-2);
}

.hm-tab {
  padding: 8px 24px;
}

.hm-tab:not(.hm-active) {
  border-color: transparent;
  background: transparent;
}

.hm-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hm-chip {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 14px;
}

/*
 * 줄의 높이는 그 줄에 놓인 카드의 내용에 맞춘다. (grid-auto-rows: max-content)
 * 기본값(auto)으로 두면, 목록의 높이가 모자랄 때 줄이 카드의 최소 높이까지 줄어들어 카드의 내용이 테두리 밖으로 넘친다.
 * 카드가 다 들어가지 않으면 줄이지 않고 목록을 스크롤한다.
 */
.hm-item-grid {
  display: grid;
  flex: 1 1 auto;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: max-content;
  align-content: start;
  gap: 10px;
  min-height: 196px;
  padding: 16px 22px;
  overflow-y: auto;
  background: color-mix(in srgb, var(--hm-surface-2) 55%, var(--hm-surface));
}

.hm-item-empty {
  grid-column: 1 / -1;
  margin: 0;
  padding: 52px 12px;
  color: var(--hm-muted);
  text-align: center;
}

/* 카드의 높이는 내용(이름, 두 줄까지의 설명, 가격과 꼬리표)에 맞춰지며, 설명이 더 길어지면 그만큼 늘어난다. */
.hm-item-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 2px solid var(--hm-line);
  border-radius: 14px;
  background: var(--hm-surface);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.08s ease;
}

.hm-item-card:hover {
  border-color: var(--hm-accent);
  transform: translateY(-1px);
}

/* 이번 게임에서 이미 쓴 아이템은 흐리게 보여준다. */
.hm-item-spent {
  border-style: dashed;
  background: transparent;
}

.hm-item-spent .hm-item-icon {
  filter: grayscale(1);
  opacity: 0.6;
}

.hm-item-icon {
  position: relative;
  display: grid;
  flex: none;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: var(--hm-surface-2);
  font-size: 28px;
  line-height: 1;
}

.hm-item-icon-support {
  background: color-mix(in srgb, #2f9e44 18%, var(--hm-surface));
}

.hm-item-icon-travel {
  background: color-mix(in srgb, #7c3aed 18%, var(--hm-surface));
}

.hm-item-icon-dice {
  background: color-mix(in srgb, #f08c00 20%, var(--hm-surface));
}

/* 그림 문자가 같은 아이템을 구분하는 표시이다. (예 : 주사위에서 나오는 눈) */
.hm-item-mark {
  position: absolute;
  right: -7px;
  bottom: -6px;
  padding: 1px 6px;
  border: 2px solid var(--hm-surface);
  border-radius: 999px;
  background: var(--hm-text);
  color: var(--hm-surface);
  font-size: 11px;
  font-weight: 900;
  line-height: 1.3;
  white-space: nowrap;
}

.hm-item-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.hm-item-name {
  font-weight: 800;
  line-height: 1.25;
}

/* 설명은 두 줄의 자리를 잡아 둔다. 한 줄짜리 설명의 카드도 같은 높이가 되어 가격의 줄이 나란히 놓인다. */
.hm-item-brief {
  min-height: 2.6em;
  color: var(--hm-muted);
  font-size: 13px;
  line-height: 1.3;
  overflow-wrap: break-word;
}

.hm-item-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  margin-top: 4px;
}

.hm-item-meta:empty {
  display: none;
}

.hm-item-price {
  color: var(--hm-accent);
  font-weight: 900;
}

.hm-item-stock,
.hm-item-flag,
.hm-item-tag {
  padding: 1px 9px;
  border: 1px solid var(--hm-line);
  border-radius: 999px;
  background: var(--hm-surface-2);
  font-size: 12px;
  font-weight: 800;
}

.hm-item-flag,
.hm-item-tag {
  color: var(--hm-muted);
}

/* 색상과 모양은 그것을 장착했을 때의 말을 그려 보여주고, 장착 중인 것은 테두리와 꼬리표로 알린다. */
.hm-item-icon .hm-token {
  --hm-size: 36px;
}

.hm-item-on {
  border-color: var(--hm-accent);
}

.hm-item-worn {
  border-color: var(--hm-accent);
  background: var(--hm-accent);
  color: var(--hm-accent-ink);
}

/* ---------- 부적 ---------- */

/* 부적과 부적 추첨권의 그림 바탕이다. 등급이 정해진 부적은 아래의 등급 색으로 바뀐다. */
.hm-item-icon-charm {
  --hm-grade: #e8590c;
  background: color-mix(in srgb, var(--hm-grade) 20%, var(--hm-surface));
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--hm-grade) 55%, transparent);
}

/* 부적의 등급마다 색을 정한다. 일반은 회색, 고급은 초록, 희귀는 보라, 전설은 금색이다. */
.hm-grade-common {
  --hm-grade: #868e96;
  --hm-grade-ink: #ffffff;
}

.hm-grade-uncommon {
  --hm-grade: #2f9e44;
  --hm-grade-ink: #ffffff;
}

.hm-grade-rare {
  --hm-grade: #7048e8;
  --hm-grade-ink: #ffffff;
}

.hm-grade-legend {
  --hm-grade: #f59f00;
  --hm-grade-ink: #2b2000;
}

.hm-grade-tag {
  border-color: var(--hm-grade);
  background: var(--hm-grade);
  color: var(--hm-grade-ink);
}

/*
 * 부적 추첨의 결과이다. 뽑힌 부적마다 봉투가 차례로 뒤집히며 등급과 이름이 드러난다.
 * 뒤집히는 차례는 --hm-order 로 정하며, 등급이 높을수록 빛과 움직임이 화려하다.
 */
.hm-modal.hm-item-detail.hm-draw {
  align-items: center;
  width: min(100%, 760px);
  overflow: hidden auto;
  text-align: center;
}

.hm-draw-stage {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  width: 100%;
  padding: 26px 8px;
}

.hm-draw-many {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.hm-draw-card {
  --hm-delay: calc(var(--hm-order) * 0.32s + 0.75s);
  position: relative;
  width: 168px;
  aspect-ratio: 3 / 4;
  isolation: isolate;
  perspective: 700px;
  animation: hm-draw-wobble 0.36s ease-in-out calc(var(--hm-delay) - 0.36s) both;
}

.hm-draw-many .hm-draw-card {
  width: auto;
}

.hm-draw-back,
.hm-draw-front {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px;
  overflow: hidden;
  border-radius: 14px;
  backface-visibility: hidden;
}

.hm-draw-back {
  border: 3px solid #ffd43b;
  background: linear-gradient(160deg, #e03131, #862e9c);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  font-size: clamp(30px, 6vw, 62px);
  animation: hm-draw-out 0.55s ease-in var(--hm-delay) both;
}

.hm-draw-front {
  border: 3px solid var(--hm-grade);
  background: linear-gradient(180deg, color-mix(in srgb, var(--hm-grade) 26%, var(--hm-surface)), var(--hm-surface) 62%);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  animation: hm-draw-in 0.55s ease-out var(--hm-delay) both;
}

.hm-draw-grade {
  padding: 1px 10px;
  border-radius: 999px;
  background: var(--hm-grade);
  color: var(--hm-grade-ink);
  font-size: 12px;
  font-weight: 900;
}

.hm-draw-icon {
  font-size: clamp(26px, 5.4vw, 58px);
  line-height: 1.15;
}

.hm-draw-name {
  font-size: clamp(11px, 1.5vw, 15px);
  font-weight: 800;
  line-height: 1.2;
  word-break: keep-all;
}

.hm-draw-one .hm-draw-name {
  font-size: 17px;
}

/* 고급 : 드러난 뒤 초록빛이 두 번 번진다. */
.hm-grade-uncommon .hm-draw-front {
  animation: hm-draw-in 0.55s ease-out var(--hm-delay) both, hm-draw-glow 1.3s ease-out calc(var(--hm-delay) + 0.5s) 2;
}

/* 희귀 : 뒤에서 빛줄기가 돌고, 보랏빛이 계속 번진다. */
.hm-grade-rare .hm-draw-front {
  animation: hm-draw-in 0.55s ease-out var(--hm-delay) both, hm-draw-glow 1.5s ease-in-out calc(var(--hm-delay) + 0.5s) infinite;
}

.hm-grade-rare.hm-draw-card::before,
.hm-grade-legend.hm-draw-card::before {
  content: "";
  position: absolute;
  inset: -34%;
  z-index: 0;
  border-radius: 50%;
  background: repeating-conic-gradient(from 0deg, color-mix(in srgb, var(--hm-grade) 70%, transparent) 0deg 9deg, transparent 9deg 30deg);
  -webkit-mask-image: radial-gradient(closest-side, #000 30%, transparent 100%);
  mask-image: radial-gradient(closest-side, #000 30%, transparent 100%);
  opacity: 0;
  animation: hm-draw-rays 7s linear infinite, hm-draw-show 0.6s ease-out calc(var(--hm-delay) + 0.3s) forwards;
  pointer-events: none;
}

/* 전설 : 금빛 빛줄기가 더 크고 빠르게 돌며, 드러나는 순간 번쩍이고 봉투가 튀어 오른 뒤 금빛이 훑고 지나간다. */
.hm-grade-legend.hm-draw-card {
  z-index: 2;
  animation: hm-draw-wobble 0.36s ease-in-out calc(var(--hm-delay) - 0.36s) both, hm-draw-leap 0.9s cubic-bezier(0.2, 1.6, 0.4, 1) calc(var(--hm-delay) + 0.35s) both;
}

.hm-grade-legend.hm-draw-card::before {
  inset: -62%;
  background: repeating-conic-gradient(from 0deg, #ffd43b 0deg 7deg, transparent 7deg 20deg);
  animation: hm-draw-rays 3.4s linear infinite, hm-draw-show 0.6s ease-out calc(var(--hm-delay) + 0.3s) forwards;
}

.hm-grade-legend .hm-draw-front {
  border-color: #ffd43b;
  background: linear-gradient(180deg, #fff3bf, var(--hm-surface) 70%);
  animation: hm-draw-in 0.55s ease-out var(--hm-delay) both, hm-draw-glow 1.1s ease-in-out calc(var(--hm-delay) + 0.5s) infinite;
}

.hm-root[data-theme="dark"] .hm-grade-legend .hm-draw-front {
  background: linear-gradient(180deg, #5c4500, var(--hm-surface) 70%);
}

.hm-grade-legend .hm-draw-front::before {
  content: "";
  position: absolute;
  inset: 0;
  background: #ffffff;
  opacity: 0;
  animation: hm-draw-burst 0.9s ease-out calc(var(--hm-delay) + 0.3s) both;
  pointer-events: none;
}

.hm-grade-legend .hm-draw-front::after {
  content: "";
  position: absolute;
  inset: -20% -60%;
  background: linear-gradient(115deg, transparent 42%, rgba(255, 255, 255, 0.85) 50%, transparent 58%);
  transform: translateX(-70%);
  animation: hm-draw-sweep 2.2s ease-in-out calc(var(--hm-delay) + 0.9s) infinite;
  pointer-events: none;
}

/* 모두 드러난 뒤에 가장 높은 등급과 등급별 개수를 알린다. */
.hm-draw-best,
.hm-draw-summary {
  margin: 0;
  animation: hm-fade 0.5s ease-out calc(var(--hm-count) * 0.32s + 1.1s) both;
}

.hm-draw-best {
  color: var(--hm-grade);
  font-size: 22px;
  font-weight: 900;
}

.hm-draw-best.hm-grade-legend {
  font-size: 28px;
  text-shadow: 0 0 14px rgba(255, 212, 59, 0.9);
  animation: hm-fade 0.5s ease-out calc(var(--hm-count) * 0.32s + 1.1s) both, hm-draw-beat 1s ease-in-out calc(var(--hm-count) * 0.32s + 1.6s) infinite;
}

/* 버튼 영역은 대화 상자의 안쪽 여백까지 차지하므로(아래 "대화 상자"의 .hm-modal-buttons 참고) 그만큼 넓게 잡는다. */
.hm-draw .hm-modal-buttons {
  width: calc(100% + var(--hm-modal-pad) * 2);
}

@media (max-width: 640px) {
  .hm-draw-many {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .hm-draw-card {
    width: 150px;
  }
}

.hm-items-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 22px 18px;
  border-top: 1px solid var(--hm-line);
}

.hm-items-foot .hm-button {
  flex: none;
  min-width: 120px;
}

/* 구매와 판매의 결과, 또는 지금 할 수 없는 이유를 알리는 줄이다. */
.hm-items-notice {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 1.45em;
  margin: 0;
  color: var(--hm-accent);
  font-size: 14px;
  font-weight: 700;
}

.hm-items-reason {
  color: var(--hm-muted);
  font-weight: 600;
}

/* 아이템 창 위에 겹쳐 뜨는 상세 정보 팝업이다. 아래의 창은 한 번 더 음영 처리한다. */
.hm-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(8, 10, 16, 0.5);
  animation: hm-fade 0.15s ease-out;
}

.hm-modal.hm-item-detail {
  width: min(100%, 470px);
}

.hm-item-detail-head {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hm-item-detail-head .hm-item-icon {
  width: 66px;
  height: 66px;
  border-radius: 18px;
  font-size: 34px;
}

.hm-item-detail-head .hm-item-icon .hm-token {
  --hm-size: 46px;
}

.hm-item-detail-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
}

.hm-item-detail .hm-modal-text {
  color: var(--hm-text);
  font-size: 15px;
}

.hm-item-facts {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 6px 12px;
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--hm-surface-2);
  font-size: 14px;
}

.hm-item-facts dt {
  color: var(--hm-muted);
  font-weight: 800;
  white-space: nowrap;
}

.hm-item-facts dd {
  margin: 0;
}

.hm-item-detail .hm-land-rows {
  border: 1px solid var(--hm-line);
  border-radius: 12px;
}

.hm-item-detail .hm-items-notice {
  flex: none;
}

.hm-item-detail .hm-items-notice:empty {
  display: none;
}

/* 상점의 상세 팝업에서 수량을 정하고 합계를 보는 영역이다. */
.hm-trade {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 16px;
  padding: 12px 14px;
  border: 1px solid var(--hm-line);
  border-radius: 12px;
}

.hm-trade-count,
.hm-trade-total {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hm-trade-label {
  margin-right: 4px;
  color: var(--hm-muted);
  font-size: 13px;
  font-weight: 800;
}

.hm-step {
  min-width: 40px;
  padding: 8px 10px;
  line-height: 1.1;
}

.hm-step-max {
  font-size: 13px;
}

.hm-trade-number {
  min-width: 2.2em;
  font-size: 19px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.hm-trade-money {
  font-size: 19px;
  font-weight: 900;
}

/* 좁은 화면에서는 닫기 버튼을 제목 옆에 두고 보유 현황을 다음 줄로 내리며, 여백을 줄인다. */
@media (max-width: 640px) {
  .hm-items-stats {
    order: 3;
    width: 100%;
  }

  .hm-items-head,
  .hm-items-hint,
  .hm-items-bar,
  .hm-item-grid,
  .hm-items-foot {
    padding-right: 16px;
    padding-left: 16px;
  }
}

/* 세로가 아주 짧은 화면에서는 목록만이 아니라 창 전체를 스크롤한다. */
@media (max-height: 560px) {
  .hm-modal.hm-items {
    overflow: auto;
  }

  .hm-item-grid {
    flex: none;
    min-height: 0;
    overflow: visible;
  }
}

/* 긴 글(JSON)을 입력하거나 보여주는 입력창이다. 일반 텍스트 입력창처럼 동작한다. */
.hm-textarea {
  min-height: 220px;
  overflow: auto;
  font-family: var(--hm-font-data);
  font-size: 14px;
  line-height: 1.45;
  white-space: pre;
  resize: vertical;
}

.hm-modal.hm-modal-wide {
  width: min(100%, 680px);
}

.hm-setting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--hm-line);
}

.hm-setting-label {
  font-weight: 700;
}

.hm-segment {
  display: flex;
  gap: 6px;
}

.hm-segment .hm-button {
  padding: 9px 16px;
}

/* ---------- 대화 상자 (화면 음영 처리) ---------- */

.hm-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(8, 10, 16, 0.62);
  animation: hm-fade 0.15s ease-out;
}

/*
 * 대화 상자는 화면보다 커지지 않으며, 내용이 다 들어가지 않으면 대화 상자 안을 스크롤한다.
 * 안의 요소는 줄어들지 않아야 한다. 줄어드는 요소가 있으면(넘치는 내용을 감추는 땅 정보 카드 등) 그 요소가 눌려 내용이 잘리고,
 * 대화 상자에는 넘치는 것이 없게 되어 스크롤도 생기지 않는다. 그런 요소에는 flex: none 을 준다.
 */
.hm-modal {
  --hm-modal-pad: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(100%, 460px);
  max-height: 100%;
  padding: var(--hm-modal-pad);
  overflow: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--hm-line);
  border-radius: 20px;
  background: var(--hm-surface);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  animation: hm-pop 0.18s ease-out;
}

.hm-modal-title {
  margin: 0;
  font-size: 21px;
  font-weight: 900;
}

.hm-modal-text {
  margin: 0;
  color: var(--hm-muted);
  white-space: pre-line;
}

.hm-modal-buttons {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.hm-modal-buttons .hm-button {
  flex: 1 1 auto;
}

.hm-modal-buttons.hm-stack {
  flex-direction: column;
}

/*
 * 나란히 놓인 선택지(구매 / 구매하지 않음, 예 / 아니오 등)는 대화 상자를 스크롤해도 아래쪽에 붙어 있어, 내용을 다 내려 보지 않고도 고를 수 있다.
 * 대화 상자의 안쪽 여백까지 차지하도록 넓혀서, 붙어 있을 때와 제자리에 있을 때의 모습이 같다. (스크롤이 없으면 달라 보이는 것이 없다.)
 * 붙는 기준선은 스크롤 영역의 안쪽 여백을 뺀 자리이므로, 여백만큼 더 내려(bottom 을 음수로) 대화 상자의 아래 끝에 맞춘다.
 * 세로로 쌓인 선택지는 화면을 다 가릴 수 있으므로 붙이지 않고 내용과 함께 스크롤한다.
 */
.hm-modal-buttons:not(.hm-stack) {
  position: sticky;
  bottom: calc(var(--hm-modal-pad) * -1);
  z-index: 1;
  margin: -8px calc(var(--hm-modal-pad) * -1) calc(var(--hm-modal-pad) * -1);
  padding: 12px var(--hm-modal-pad) var(--hm-modal-pad);
  background: linear-gradient(to bottom, transparent, var(--hm-surface) 12px);
}

.hm-modal-win .hm-modal-title {
  color: var(--hm-accent);
  font-size: 34px;
  text-align: center;
}

.hm-modal-lose .hm-modal-title {
  color: #e03131;
  font-size: 34px;
  text-align: center;
}

.hm-modal-win .hm-modal-text,
.hm-modal-lose .hm-modal-text {
  text-align: center;
}

.hm-modal-sell {
  border-color: #e03131;
}

.hm-cash-line {
  margin: 0;
  font-weight: 800;
  text-align: right;
}

/* 우대권 사용 창 : 지불할 금액을 글에서 떼어 한 줄로 강조한다. */
.hm-due {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 16px;
  margin: 0;
  padding: 12px 16px;
  border: 2px solid #e03131;
  border-radius: 12px;
  background: rgba(224, 49, 49, 0.1);
  font-weight: 800;
}

.hm-due .hm-num {
  color: #e03131;
  font-size: 26px;
  line-height: 1.1;
}

.hm-root[data-theme="dark"] .hm-due {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.14);
}

.hm-root[data-theme="dark"] .hm-due .hm-num {
  color: #ff8787;
}

.hm-order-row {
  display: grid;
  grid-template-columns: 22px 30px minmax(0, 1fr) auto 28px;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--hm-line);
}

.hm-order-rank {
  color: var(--hm-muted);
  font-weight: 900;
}

.hm-order-name {
  overflow: hidden;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hm-order-dice {
  display: flex;
  gap: 6px;
}

.hm-order-dice .hm-die {
  --hm-size: 28px;
}

.hm-order-sum {
  font-weight: 900;
  text-align: right;
}

/* ---------- 땅 정보 카드 (확대 창과 구매·건설 창이 함께 쓴다) ---------- */

/* 대화 상자나 확대 창 안에서 눌려 내용이 잘리지 않도록 줄어들지 않게 한다. (넘치면 그 창을 스크롤한다.) */
.hm-land {
  flex: none;
  overflow: hidden;
  border: 1px solid var(--hm-line);
  border-top: 14px solid var(--hm-land);
  border-radius: 14px;
  background: var(--hm-surface);
  text-align: left;
}

.hm-land-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px 0;
}

.hm-land-name {
  font-size: 19px;
  font-weight: 900;
}

.hm-land-type {
  flex: none;
  color: var(--hm-muted);
  font-size: 13px;
  font-weight: 700;
}

.hm-land-desc {
  margin: 0;
  padding: 4px 14px 8px;
  color: var(--hm-muted);
  font-size: 13px;
}

.hm-land-rows {
  padding: 6px 0;
  border-top: 1px solid var(--hm-line);
}

.hm-land-status {
  border-top-style: dashed;
  background: var(--hm-surface-2);
}

.hm-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 3px 14px;
  font-size: 14px;
}

.hm-row-label {
  color: var(--hm-muted);
}

.hm-row-value {
  font-weight: 700;
  text-align: right;
}

.hm-row-strong .hm-row-value {
  color: var(--hm-accent);
  font-size: 16px;
  font-weight: 900;
}

.hm-owner-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.hm-owner-label .hm-token {
  --hm-size: 20px;
}

.hm-popover {
  position: fixed;
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(320px, calc(100vw - 16px));
  max-height: calc(100vh - 16px);
  padding: 8px;
  overflow: auto;
  overscroll-behavior: contain;
  border-radius: 18px;
  background: var(--hm-surface);
  box-shadow: 0 0 0 2px var(--hm-accent), 0 22px 60px rgba(0, 0, 0, 0.45);
  cursor: pointer;
  animation: hm-zoom 0.16s ease-out;
}

/* 확대 창의 이동 버튼(목적지를 고르는 중일 때)은 창을 스크롤해도 아래쪽에 붙어 있어 언제든 누를 수 있다. */
.hm-popover > .hm-button {
  position: sticky;
  bottom: 0;
  z-index: 1;
  flex: none;
  box-shadow: 0 0 0 8px var(--hm-surface);
}

/* 땅의 현실 정보를 재미있게 소개하는 글이다. */
.hm-land-real {
  margin: 0;
  padding: 8px 14px 10px;
  border-top: 1px dashed var(--hm-line);
  font-size: 13px;
  line-height: 1.5;
}

.hm-land-real strong {
  display: block;
  margin-bottom: 2px;
  color: var(--hm-accent);
  font-size: 12px;
}

/* 플레이어 팝업 : 자산 요약과 소유한 땅 목록 */
.hm-player-assets {
  border: 1px solid var(--hm-line);
  border-left: 8px solid var(--hm-player);
  border-radius: 12px;
}

.hm-list-title {
  margin: 4px 0 0;
  font-size: 15px;
  font-weight: 900;
}

.hm-land-list {
  display: flex;
  flex-direction: column;
  flex: none;
  gap: 6px;
  max-height: 38vh;
  overflow: auto;
}

.hm-land-item {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  border: 1px solid var(--hm-line);
  border-left: 8px solid var(--hm-land);
  border-radius: 10px;
  background: var(--hm-surface-2);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.hm-land-item:hover {
  filter: brightness(1.05);
}

.hm-land-item-name {
  font-weight: 800;
}

.hm-land-item-toll {
  flex: none;
  color: var(--hm-muted);
  font-size: 13px;
}

.hm-popover-hint {
  margin: 0;
  color: var(--hm-muted);
  font-size: 12px;
  text-align: center;
}

/* ---------- 게임 화면 배치 ---------- */

/* 가로로 긴 화면에서는 보드를 화면 높이에 맞추고 옆에 플레이어와 기록을 둔다. */
.hm-game {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(250px, 340px);
  grid-template-rows: minmax(0, 1fr);
  gap: 14px;
  height: 100vh;
  height: 100dvh;
  padding: 12px;
}

.hm-board-wrap {
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 0;
  container-type: size;
}

.hm-board {
  display: grid;
  grid-template-columns: repeat(11, minmax(0, 1fr));
  grid-template-rows: repeat(11, minmax(0, 1fr));
  gap: 2px;
  width: min(100cqw, 100cqh);
  height: min(100cqw, 100cqh);
  padding: 3px;
  border-radius: 12px;
  background: var(--hm-line);
  box-shadow: var(--hm-shadow);
  container-type: inline-size;
}

/* ---------- 보드의 칸 ---------- */

.hm-tile {
  position: relative;
  display: block;
  min-width: 0;
  min-height: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 0.5cqw;
  background-color: var(--hm-tile);
  color: var(--hm-text);
  font: inherit;
  cursor: pointer;
}

.hm-tile:hover {
  filter: brightness(1.07);
}

.hm-side-corner {
  background-color: var(--hm-corner);
}

/* 땅의 색상은 보드 중앙을 바라보는 쪽 테두리에 표시한다. */
.hm-tile-color {
  position: absolute;
  background: var(--hm-land);
}

.hm-side-bottom .hm-tile-color {
  inset: 0 0 auto 0;
  height: 15%;
}

.hm-side-top .hm-tile-color {
  inset: auto 0 0 0;
  height: 15%;
}

.hm-side-left .hm-tile-color {
  inset: 0 0 0 auto;
  width: 15%;
}

.hm-side-right .hm-tile-color {
  inset: 0 auto 0 0;
  width: 15%;
}

.hm-tile-body {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15cqw;
  padding: 0.35cqw;
  text-align: center;
}

.hm-side-bottom .hm-tile-body {
  top: 15%;
  bottom: 19%;
}

.hm-side-top .hm-tile-body {
  top: 19%;
  bottom: 15%;
}

.hm-side-left .hm-tile-body {
  right: 15%;
  left: 15%;
}

.hm-side-right .hm-tile-body {
  right: 15%;
  left: 15%;
}

/* 옆줄 칸은 양쪽 가장자리를 띠가 차지하므로, 이름이 중간에서 끊기지 않도록 안쪽 여백과 글자 크기를 조금 줄인다. */
.hm-side-left .hm-tile-body,
.hm-side-right .hm-tile-body {
  padding-right: 0.15cqw;
  padding-left: 0.15cqw;
}

.hm-side-left .hm-tile-name,
.hm-side-right .hm-tile-name {
  font-size: clamp(6px, 1.15cqw, 15px);
}

.hm-tile-icon {
  font-size: clamp(9px, 1.7cqw, 26px);
  line-height: 1.1;
}

.hm-side-corner .hm-tile-icon {
  font-size: clamp(11px, 2.6cqw, 38px);
}

.hm-tile-name {
  font-size: clamp(6px, 1.32cqw, 17px);
  font-weight: 800;
  line-height: 1.12;
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.hm-tile-sub {
  color: var(--hm-muted);
  font-size: clamp(6px, 1.18cqw, 15px);
  font-weight: 700;
  line-height: 1.1;
}

/* 소유자는 칸의 바깥쪽 가장자리에 소유자의 색 띠와 문양, 건물로 표시한다. */
.hm-tile-owner {
  position: absolute;
  inset: auto 0 0 0;
  display: none;
  align-items: center;
  justify-content: center;
  height: 19%;
  overflow: hidden;
  background: var(--hm-owner-fill, var(--hm-owner));
  box-shadow: inset 0 0 0 0.08cqw rgba(255, 255, 255, 0.28);
  color: var(--hm-owner-ink, #ffffff);
  font-size: clamp(6px, 1.2cqw, 15px);
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.hm-owned .hm-tile-owner {
  display: flex;
}

/* 어두운 화면에서는 그라파이트처럼 어두운 색의 소유자 띠도 칸과 구분되도록 테두리를 더 밝게 두른다. */
.hm-root[data-theme="dark"] .hm-tile-owner {
  box-shadow: inset 0 0 0 0.1cqw rgba(255, 255, 255, 0.5);
}

.hm-root[data-theme="dark"] .hm-player-turn {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35), 0 0 0 4px color-mix(in srgb, var(--hm-player) 28%, transparent);
}

.hm-side-top .hm-tile-owner {
  inset: 0 0 auto 0;
}

/* 옆줄 칸의 소유자 띠는 아래쪽이 아니라, 보드 중앙에서 먼 바깥쪽 세로 가장자리에 둔다. */
.hm-side-left .hm-tile-owner {
  inset: 0 auto 0 0;
  width: 15%;
  height: auto;
}

.hm-side-right .hm-tile-owner {
  inset: 0 0 0 auto;
  width: 15%;
  height: auto;
}

/* 말이 서 있는 칸은 그 플레이어의 색으로 배경을 칠하고 굵은 테두리를 두른다. */
.hm-tile.hm-here {
  background-image: var(--hm-here);
}

.hm-tile.hm-here::after {
  content: "";
  position: absolute;
  inset: 0;
  border: 0.32cqw solid var(--hm-here-edge);
  border-radius: inherit;
  pointer-events: none;
}

/* 말이 놓일 자리를 비우기 위해 이름을 위쪽으로 올리고 가격과 그림 문자는 숨긴다. */
.hm-tile.hm-here .hm-tile-body {
  justify-content: flex-start;
}

.hm-tile.hm-here .hm-tile-sub,
.hm-tile.hm-here:not(.hm-side-corner) .hm-tile-icon {
  display: none;
}

.hm-tile-open {
  z-index: 2;
  outline: 0.35cqw solid var(--hm-accent);
}

.hm-tile-tokens {
  position: absolute;
  inset: auto 0 21% 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.hm-side-top .hm-tile-tokens {
  bottom: 17%;
}

.hm-side-left .hm-tile-tokens,
.hm-side-right .hm-tile-tokens {
  right: 15%;
  bottom: 6%;
  left: 15%;
}

.hm-side-corner .hm-tile-tokens {
  bottom: 5%;
}

.hm-tile-tokens .hm-token + .hm-token {
  margin-left: -0.45cqw;
}

/* ---------- 말과 주사위 ---------- */

.hm-token {
  --hm-size: 28px;
  display: inline-grid;
  flex: none;
  place-items: center;
  width: var(--hm-size);
  height: var(--hm-size);
  border: calc(var(--hm-size) * 0.09) solid #ffffff;
  border-radius: 50%;
  background: var(--hm-player-fill, var(--hm-player));
  background-clip: padding-box;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  color: var(--hm-player-ink, #ffffff);
  font-family: var(--hm-font-text);
  font-size: calc(var(--hm-size) * 0.52);
  font-weight: 900;
  line-height: 1;
}

.hm-board .hm-token {
  --hm-size: 2.5cqw;
}

.hm-board .hm-token-turn {
  animation: hm-pulse 1.1s ease-in-out infinite;
}

.hm-board .hm-token-hop {
  animation: hm-hop 0.22s ease-out;
}

.hm-die {
  --hm-size: 46px;
  display: inline-grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: var(--hm-size);
  height: var(--hm-size);
  padding: calc(var(--hm-size) * 0.15);
  border-radius: 20%;
  background: #ffffff;
  box-shadow: inset 0 calc(var(--hm-size) * -0.07) 0 rgba(0, 0, 0, 0.14), 0 3px 10px rgba(0, 0, 0, 0.3);
}

.hm-pip {
  margin: 10%;
  border-radius: 50%;
}

.hm-pip-on {
  background: #1f2430;
}

.hm-rolling .hm-die {
  animation: hm-shake 0.28s linear infinite;
}

/*
 * 우주선 : 우주여행에 탑승한 플레이어가 목적지를 고르는 차례에 주사위 자리에 놓는다. 크기는 주사위와 같은 --hm-size 를 따른다.
 * 불꽃, 양쪽 날개, 창문이 달린 몸통을 겹쳐 그리며, 제자리에서 떠 있는 것처럼 살짝 오르내린다.
 */
.hm-ship {
  --hm-size: 46px;
  position: relative;
  display: inline-block;
  width: calc(var(--hm-size) * 1.1);
  height: var(--hm-size);
  filter: drop-shadow(0 calc(var(--hm-size) * 0.06) calc(var(--hm-size) * 0.08) rgba(0, 0, 0, 0.35));
  animation: hm-ship-hover 1.6s ease-in-out infinite;
}

.hm-ship-body {
  position: absolute;
  top: 0;
  left: 50%;
  width: 40%;
  height: 76%;
  overflow: hidden;
  border-radius: 50% 50% 20% 20% / 64% 64% 12% 12%;
  background: linear-gradient(90deg, #ced4da, #ffffff 42%, #adb5bd);
  transform: translateX(-50%);
}

/* 몸통 꼭대기의 빨간 머리 부분 */
.hm-ship-body::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 30%;
  background: linear-gradient(90deg, #c92a2a, #ff6b6b 42%, #a51111);
}

.hm-ship-window {
  position: absolute;
  top: 40%;
  left: 50%;
  width: 46%;
  aspect-ratio: 1;
  border: calc(var(--hm-size) * 0.035) solid #495057;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #d0ebff, #1c7ed6 70%);
  transform: translateX(-50%);
}

.hm-ship-fin {
  position: absolute;
  bottom: 22%;
  width: 22%;
  height: 34%;
  background: #e03131;
}

.hm-ship-fin-left {
  left: 13%;
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
}

.hm-ship-fin-right {
  right: 13%;
  clip-path: polygon(0 0, 100% 100%, 0 100%);
}

.hm-ship-flame {
  position: absolute;
  top: 72%;
  left: 50%;
  width: 24%;
  height: 30%;
  background: linear-gradient(#ffe066, #ff922b 55%, rgba(224, 49, 49, 0.2));
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  transform: translateX(-50%);
  transform-origin: 50% 0;
  animation: hm-ship-flame 0.22s ease-in-out infinite alternate;
}

.hm-center .hm-ship {
  --hm-size: clamp(26px, 8cqw, 96px);
}

/* ---------- 보드 가운데 영역 ---------- */

.hm-center {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-row: 2 / 11;
  grid-column: 2 / 11;
  gap: 1.5cqw;
  padding: 3cqw;
  overflow: hidden;
  border-radius: 0.8cqw;
  background: radial-gradient(circle at 50% 35%, var(--hm-felt-a), var(--hm-felt-b));
  text-align: center;
}

.hm-brand {
  font-size: clamp(14px, 4.6cqw, 60px);
  font-weight: 900;
  letter-spacing: 0.24em;
  line-height: 1;
  text-indent: 0.24em;
  text-transform: uppercase;
  opacity: 0.85;
}

.hm-league-tag {
  padding: 0.4cqw 1.4cqw;
  border-radius: 99px;
  background: var(--hm-league);
  color: #ffffff;
  font-size: clamp(9px, 1.5cqw, 18px);
  font-weight: 800;
}

.hm-turn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1cqw;
  margin-top: 1cqw;
  font-size: clamp(11px, 2.4cqw, 30px);
  font-weight: 900;
}

.hm-center .hm-turn .hm-token {
  --hm-size: 3.4cqw;
  animation: none;
}

.hm-dice {
  display: flex;
  gap: 2cqw;
}

.hm-center .hm-die {
  --hm-size: clamp(26px, 8cqw, 96px);
}

.hm-status {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 88%;
  min-height: 3em;
  margin: 0;
  font-size: clamp(10px, 1.75cqw, 21px);
  font-weight: 600;
}

.hm-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.2cqw;
}

.hm-center .hm-button {
  padding: 0.7em 1.5em;
  font-size: clamp(11px, 1.9cqw, 22px);
}

.hm-center.hm-my-turn .hm-primary:not(:disabled) {
  animation: hm-glow 1.2s ease-in-out infinite;
}

.hm-fund {
  display: flex;
  align-items: baseline;
  gap: 1cqw;
  font-size: clamp(9px, 1.6cqw, 19px);
}

.hm-fund-money {
  font-size: 1.25em;
  font-weight: 900;
}

/* 비밀쿠폰은 보드 가운데에 정해진 시간 동안 표시되며, 아래쪽 띠가 남은 시간을 보여준다. */
.hm-coupon {
  position: absolute;
  inset: 13% 12%;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.4cqw;
  padding: 3cqw 4cqw;
  overflow: hidden;
  border: 0.45cqw solid var(--hm-player);
  border-radius: 2cqw;
  background: var(--hm-paper);
  box-shadow: 0 2cqw 5cqw rgba(0, 0, 0, 0.4);
  animation: hm-pop 0.22s ease-out;
}

.hm-coupon-head {
  color: var(--hm-muted);
  font-size: clamp(9px, 1.6cqw, 19px);
  font-weight: 800;
  letter-spacing: 0.12em;
}

.hm-coupon-title {
  font-size: clamp(14px, 3.6cqw, 44px);
  font-weight: 900;
  line-height: 1.15;
}

.hm-coupon-text {
  margin: 0;
  font-size: clamp(10px, 1.95cqw, 23px);
  font-weight: 600;
  line-height: 1.5;
  white-space: pre-line;
}

/* 쿠폰을 뽑은 플레이어는 말과 이름으로 알린다. 밝은 색상의 플레이어도 읽을 수 있도록 글자는 기본 글자색으로 쓴다. */
.hm-coupon-drawer {
  display: flex;
  align-items: center;
  gap: 0.8cqw;
  font-size: clamp(9px, 1.6cqw, 19px);
  font-weight: 800;
}

.hm-coupon-bar {
  position: absolute;
  inset: auto 0 0 0;
  height: 1cqw;
  background: var(--hm-player);
  transform-origin: left center;
  animation: hm-countdown var(--hm-coupon-time) linear forwards;
}

.hm-coupon-close {
  margin-top: 0.4cqw;
}

/* ---------- 보드 위의 건물 ---------- */

/*
 * 건물은 도시 칸에서 보드 중앙 쪽으로 바로 붙은 터에, 칸에 바닥을 대고 보드 중앙을 바라보며 서 있는 모습으로 그린다.
 * 터는 아랫줄(1면)의 것을 기준으로 그리고, 왼쪽 줄(2면)은 시계 방향으로 90도, 윗줄(3면)은 180도, 오른쪽 줄(4면)은 시계 반대 방향으로 90도 돌린다.
 * 터의 바닥선은 소유자의 색이다. 터는 그 칸의 가운데에 놓는다.
 * 보드 모서리 옆에서는 옆줄의 칸과 윗줄(아랫줄)의 칸이 같은 자리를 쓴다. 이 두 터는 키가 작은 별장을 모서리에 가까운 쪽에 두고(.hm-lot-flip),
 * 건물이 겹치게 되면 스크립트가 두 터를 자기 칸 안에서 모서리에서 먼 쪽으로 밀고(translate 속성. transform 과 따로 적용된다.),
 * 그래도 겹치면 별장만 줄여 그린다. (--hm-villa 는 별장의 크기 비율이다. 빌딩과 호텔의 크기는 바꾸지 않는다.)
 * --hm-shade-x / --hm-shade-y 는 돌린 뒤에도 그림자가 화면의 아래쪽으로 지도록 정하는 그림자의 방향이다.
 */
.hm-lot {
  --hm-villa: 1;
  --hm-shade-x: 0cqw;
  --hm-shade-y: 0.3cqw;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.2cqw;
  padding: 0 0.3cqw;
  border-bottom: 0.38cqw solid var(--hm-owner);
  border-radius: 0 0 0.3cqw 0.3cqw;
  filter: drop-shadow(var(--hm-shade-x) var(--hm-shade-y) 0.25cqw rgba(0, 0, 0, 0.45));
  pointer-events: none;
}

.hm-lot:empty {
  display: none;
}

/* 건물의 순서를 뒤집어 별장이 반대쪽 끝에 오게 한다. (모서리 옆의 터에서 별장을 모서리 쪽에 두는 데 쓴다.) */
.hm-lot-flip {
  flex-direction: row-reverse;
}

.hm-lot-bottom {
  align-self: end;
  justify-self: center;
}

/* 윗줄 : 뒤집어서 바닥이 위쪽의 칸에 닿고 지붕이 아래(보드 중앙)를 향한다. */
.hm-lot-top {
  --hm-shade-y: -0.3cqw;
  align-self: start;
  justify-self: center;
  margin-top: 0.2cqw;
  transform: rotate(180deg);
}

/*
 * 왼쪽 줄 : 시계 방향으로 90도 돌려 바닥이 왼쪽의 칸에 닿고 지붕이 오른쪽(보드 중앙)을 향한다.
 * 돌려도 배치에 쓰이는 크기는 눕히기 전의 것이므로, 돌린 뒤의 모습이 칸에 붙도록 터의 폭과 높이의 절반만큼 옮긴다.
 * (바깥쪽 translateX 는 화면의 방향으로 폭의 절반을, 안쪽 translateY 는 돌린 뒤의 방향으로 높이의 절반을 옮긴다.)
 */
.hm-lot-left {
  --hm-shade-x: 0.3cqw;
  --hm-shade-y: 0cqw;
  align-self: center;
  justify-self: start;
  margin-left: 0.2cqw;
  transform: translateX(-50%) rotate(90deg) translateY(-50%);
}

/* 오른쪽 줄 : 시계 반대 방향으로 90도 돌려 바닥이 오른쪽의 칸에 닿고 지붕이 왼쪽(보드 중앙)을 향한다. */
.hm-lot-right {
  --hm-shade-x: -0.3cqw;
  --hm-shade-y: 0cqw;
  align-self: center;
  justify-self: end;
  margin-right: 0.2cqw;
  transform: translateX(50%) rotate(-90deg) translateY(-50%);
}

.hm-house {
  position: relative;
  flex: none;
}

/* 방금 지은 건물은 땅에서 솟아오른다. (터를 돌려 놓은 면에서는 칸에서 보드 중앙 쪽으로 솟는다.) */
.hm-house-new {
  transform-origin: 50% 100%;
  animation: hm-build 0.7s cubic-bezier(0.2, 1.6, 0.4, 1) both;
}

/* 별장 : 주황 지붕의 작은 집. 자리가 모자란 터에서는 --hm-villa 의 비율로 줄여 그린다. */
.hm-house-villa {
  width: calc(1.7cqw * var(--hm-villa));
  height: calc(1.05cqw * var(--hm-villa));
  margin-top: calc(0.8cqw * var(--hm-villa));
  border: 0.12cqw solid #6b3f17;
  border-bottom: 0;
  background: linear-gradient(90deg, #ffe8bf 0 60%, #e6c284 60%);
}

.hm-house-villa::before {
  content: "";
  position: absolute;
  right: calc(-0.32cqw * var(--hm-villa));
  bottom: 100%;
  left: calc(-0.32cqw * var(--hm-villa));
  height: calc(0.8cqw * var(--hm-villa));
  background: linear-gradient(90deg, #f76707 0 55%, #c2410c 55%);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.hm-house-villa::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: calc(0.4cqw * var(--hm-villa));
  height: calc(0.58cqw * var(--hm-villa));
  background: #6b3f17;
  transform: translateX(-50%);
}

/* 빌딩 : 창문이 줄지어 있는 파란 건물 */
.hm-house-building {
  width: 1.9cqw;
  height: 2.8cqw;
  margin-top: 0.3cqw;
  border: 0.12cqw solid #173f86;
  border-bottom: 0;
  background-color: #2f6fe0;
  background-image: linear-gradient(90deg, #2f6fe0 0.22cqw, transparent 0.22cqw), linear-gradient(#2f6fe0 0.24cqw, #fff3b0 0.24cqw);
  background-size: 0.56cqw 0.62cqw;
}

.hm-house-building::before {
  content: "";
  position: absolute;
  right: 22%;
  bottom: 100%;
  left: 22%;
  height: 0.3cqw;
  background: #173f86;
}

/* 호텔 : 금색 간판을 올린 높은 빨간 건물 */
.hm-house-hotel {
  width: 2.1cqw;
  height: 3.2cqw;
  margin-top: 0.55cqw;
  border: 0.12cqw solid #7a1414;
  border-bottom: 0;
  background-color: #e03131;
  background-image: linear-gradient(90deg, #e03131 0.24cqw, transparent 0.24cqw), linear-gradient(#e03131 0.24cqw, #ffe066 0.24cqw);
  background-size: 0.6cqw 0.6cqw;
}

.hm-house-hotel::before {
  content: "H";
  position: absolute;
  bottom: 100%;
  left: 50%;
  padding: 0 0.32cqw;
  border-radius: 0.2cqw 0.2cqw 0 0;
  background: #f59f00;
  color: #5c1a00;
  font-size: 0.5cqw;
  font-weight: 900;
  line-height: 0.55cqw;
  transform: translateX(-50%);
}

.hm-house-hotel::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0.55cqw;
  height: 0.6cqw;
  background: #7a1414;
  transform: translateX(-50%);
}

/* ---------- 돈 이동 (플레이어 사이, 은행, 사회복지기금 본부) ---------- */

/* 누가 누구에게 얼마를 주는지 보드 가운데에 크게 띄운다. 테두리와 화살표의 색(--hm-flow)으로 돈이 오가는 상대를 구분한다. */
.hm-transfer {
  --hm-flow: #2f9e44;
  position: absolute;
  top: 12%;
  left: 50%;
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4cqw 1.2cqw;
  width: max-content;
  max-width: 78%;
  padding: 1.3cqw 2.4cqw;
  border: 0.4cqw solid var(--hm-flow);
  border-radius: 1.8cqw;
  background: var(--hm-paper);
  box-shadow: 0 1.5cqw 4cqw rgba(0, 0, 0, 0.4);
  font-size: clamp(11px, 2cqw, 24px);
  font-weight: 800;
  transform: translateX(-50%);
  animation: hm-drop 0.25s ease-out;
}

.hm-transfer-side {
  display: inline-flex;
  align-items: center;
  gap: 0.6cqw;
}

.hm-center .hm-transfer .hm-token {
  --hm-size: 3cqw;
  animation: none;
}

/* 은행과 오가는 돈은 파랑, 사회복지기금 본부와 오가는 돈은 주황으로 구분한다. */
.hm-transfer-bank,
.hm-tile-bank {
  --hm-flow: #1c7ed6;
}

.hm-transfer-fund,
.hm-tile-fund {
  --hm-flow: #e8590c;
}

/* 안내 띠에서 은행과 사회복지기금 본부를 나타내는 그림 문자이다. */
.hm-transfer-icon {
  font-size: 1.5em;
  line-height: 1;
}

.hm-transfer-arrow {
  color: var(--hm-flow);
  font-size: 1.4em;
  animation: hm-nudge 0.6s ease-in-out infinite;
}

/* 돈이 드나드는 동안 은행이 있는 출발지 칸 또는 사회복지기금 본부의 칸을 빛낸다. */
.hm-tile-bank,
.hm-tile-fund {
  z-index: 2;
  outline: 0.35cqw solid var(--hm-flow);
  animation: hm-office 0.6s ease-in-out infinite;
}

.hm-transfer-amount {
  flex-basis: 100%;
  color: #2b8a3e;
  font-size: 1.8em;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
}

/* 내는 쪽(플레이어의 말, 은행, 사회복지기금 본부)에서 받는 쪽으로 날아가는 지폐이다. 움직임은 스크립트가 정한다. */
.hm-bill {
  position: fixed;
  z-index: 45;
  display: grid;
  place-items: center;
  width: 2.3em;
  height: 1.25em;
  border: 0.09em solid #0b5d1e;
  border-radius: 0.18em;
  background: linear-gradient(135deg, #d3f9d8, #51cf66 45%, #2f9e44);
  box-shadow: 0 0.15em 0.45em rgba(0, 0, 0, 0.45), inset 0 0 0 0.13em rgba(255, 255, 255, 0.6);
  color: #0b5d1e;
  font-weight: 900;
  line-height: 1;
  opacity: 0;
  pointer-events: none;
}

/*
 * 큰 금액이 오갈 때의 돈 이동이다. 안내 띠를 금빛으로 강조하고 금액을 더 크게 보여주며, 지폐에 금빛 지폐를 섞는다.
 * 받는 쪽에서는 돈이 쏟아져 들어온 것을 터지는 빛(.hm-burst)으로 알린다.
 */
.hm-transfer-big {
  border-width: 0.55cqw;
  border-color: #f59f00;
  box-shadow: 0 0 0 0.5cqw rgba(245, 159, 0, 0.35), 0 0 5cqw 1.4cqw rgba(255, 212, 59, 0.7), 0 1.5cqw 4cqw rgba(0, 0, 0, 0.4);
  animation: hm-drop 0.25s ease-out, hm-transfer-big 0.7s ease-in-out 0.25s infinite;
}

.hm-transfer-big .hm-transfer-amount {
  color: #e67700;
  font-size: 2.3em;
  text-shadow: 0 0 1.2cqw rgba(255, 212, 59, 0.9);
  animation: hm-charm-beat 0.7s ease-in-out infinite;
}

.hm-bill-gold {
  border-color: #7a4b00;
  background: linear-gradient(135deg, #fff3bf, #ffd43b 45%, #f59f00);
  color: #7a4b00;
}

.hm-float-big {
  border-color: #ffe066;
  font-size: clamp(16px, 2vw, 30px);
  box-shadow: 0 0 0 3px rgba(255, 212, 59, 0.5), 0 4px 18px rgba(0, 0, 0, 0.5);
}

.hm-burst {
  position: fixed;
  z-index: 44;
  width: calc(var(--hm-size) * 1.9);
  height: calc(var(--hm-size) * 1.9);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 243, 191, 0.95) 0 18%, rgba(255, 212, 59, 0.75) 38%, rgba(245, 159, 0, 0) 70%);
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -50%);
  animation: hm-burst calc(var(--hm-time) * 0.3) ease-out calc(var(--hm-time) * 0.42) 2 both;
}

/* ---------- 우대권·무전기 사용 ---------- */

/*
 * 누군가 우대권이나 무전기를 사용했을 때 보드 가운데에 잠깐 띄우는 알림이다. 우대권은 초록, 무전기는 주황(--hm-use)으로 빛난다.
 * 보드 위에서는 사용한 플레이어의 말에서 빛의 고리(.hm-ring)가 퍼지고, 효과가 일어난 칸에 도장(.hm-stamp)이 찍힌다.
 */
.hm-use-pass {
  --hm-use: #0ca678;
}

.hm-use-radio {
  --hm-use: #f08c00;
}

.hm-use-flash {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5cqw;
  width: max-content;
  max-width: 82%;
  padding: 2cqw 3.2cqw;
  border: 0.45cqw solid var(--hm-use);
  border-radius: 2cqw;
  background: var(--hm-paper);
  box-shadow: 0 0 0 0.5cqw color-mix(in srgb, var(--hm-use) 35%, transparent), 0 0 5cqw 1.2cqw color-mix(in srgb, var(--hm-use) 65%, transparent), 0 1.5cqw 4cqw rgba(0, 0, 0, 0.45);
  font-size: clamp(11px, 2cqw, 24px);
  font-weight: 800;
  text-align: center;
  transform: translate(-50%, -50%);
  animation: hm-charm-pop 0.45s cubic-bezier(0.2, 1.5, 0.4, 1) both, hm-use-shine 1.1s ease-in-out 0.45s infinite;
  pointer-events: none;
}

.hm-use-flash-owner {
  display: flex;
  align-items: center;
  gap: 0.8cqw;
  color: var(--hm-muted);
  font-size: 0.85em;
}

.hm-center .hm-use-flash .hm-token {
  --hm-size: 3cqw;
  animation: none;
}

.hm-use-flash-icon {
  font-size: clamp(22px, 5cqw, 60px);
  line-height: 1.1;
  animation: hm-use-wave 0.5s ease-in-out 0.3s 3;
}

.hm-use-flash-title {
  color: var(--hm-use);
  font-size: 1.25em;
  font-weight: 900;
}

.hm-use-flash-source {
  padding: 0.1em 0.9em;
  border-radius: 99px;
  background: var(--hm-use);
  color: #ffffff;
  font-size: 0.75em;
}

.hm-use-flash-amount {
  display: flex;
  align-items: baseline;
  gap: 1cqw;
  font-size: 1.3em;
  font-weight: 900;
}

.hm-use-flash-amount s {
  color: var(--hm-muted);
  font-size: 0.75em;
  font-weight: 700;
}

.hm-use-flash-amount strong {
  color: var(--hm-use);
  animation: hm-charm-beat 0.6s ease-in-out 0.5s 2;
}

.hm-ring {
  position: fixed;
  z-index: 44;
  width: calc(var(--hm-size) * 0.5);
  height: calc(var(--hm-size) * 0.5);
  border: calc(var(--hm-size) * 0.06) solid var(--hm-use);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -50%);
  animation: hm-ring 0.9s ease-out calc(var(--hm-order) * 0.25s) 2 both;
}

.hm-stamp {
  position: fixed;
  z-index: 45;
  padding: 0.1em 0.5em;
  border: 0.14em solid var(--hm-use);
  border-radius: 0.35em;
  background: color-mix(in srgb, var(--hm-paper) 88%, transparent);
  box-shadow: 0 0.15em 0.5em rgba(0, 0, 0, 0.35);
  color: var(--hm-use);
  font-size: calc(var(--hm-size) * 0.3);
  font-weight: 900;
  letter-spacing: 0.08em;
  white-space: nowrap;
  pointer-events: none;
  transform: translate(-50%, -50%) rotate(-12deg);
  animation: hm-stamp 0.4s cubic-bezier(0.3, 1.6, 0.5, 1) 0.35s both;
}

/* ---------- 패배한 플레이어의 말 ---------- */

/*
 * 누군가 패배하면(파산, 포기) 그 플레이어의 말이 서 있던 자리에서 폭발이 일어나고 말이 보드 바깥으로 튕겨나간다.
 * 폭발은 불덩이(.hm-blast), 퍼져 나가는 충격파(.hm-blast-wave), 피어오르는 연기(.hm-blast-smoke), 사방으로 튀는 불티(.hm-spark)로 이루어진다.
 * 크기는 칸의 너비(--hm-size)를, 시간은 연출 전체의 시간(--hm-time)을 따른다. 튕겨나가는 말(.hm-token-out)의 움직임은 스크립트가 정한다.
 */
.hm-blast,
.hm-blast-wave,
.hm-blast-smoke,
.hm-spark {
  position: fixed;
  z-index: 45;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.hm-blast {
  width: calc(var(--hm-size) * 1.9);
  height: calc(var(--hm-size) * 1.9);
  background: radial-gradient(circle, #ffffff 0 14%, #fff3bf 26%, #ffd43b 40%, #ff922b 54%, rgba(224, 49, 49, 0.9) 66%, rgba(224, 49, 49, 0) 74%);
  animation: hm-blast calc(var(--hm-time) * 0.34) cubic-bezier(0.1, 0.8, 0.3, 1) both;
}

.hm-blast-wave {
  z-index: 44;
  width: calc(var(--hm-size) * 0.7);
  height: calc(var(--hm-size) * 0.7);
  border: calc(var(--hm-size) * 0.08) solid #ffd43b;
  box-shadow: 0 0 calc(var(--hm-size) * 0.2) #ff922b, inset 0 0 calc(var(--hm-size) * 0.2) #ff922b;
  animation: hm-blast-wave calc(var(--hm-time) * 0.42) ease-out both;
}

.hm-blast-smoke {
  z-index: 44;
  width: calc(var(--hm-size) * 1.5);
  height: calc(var(--hm-size) * 1.5);
  border-radius: 0;
  background:
    radial-gradient(circle at 34% 40%, rgba(73, 80, 87, 0.75) 0 16%, rgba(73, 80, 87, 0) 34%),
    radial-gradient(circle at 66% 44%, rgba(52, 58, 64, 0.7) 0 18%, rgba(52, 58, 64, 0) 38%),
    radial-gradient(circle at 50% 66%, rgba(73, 80, 87, 0.65) 0 20%, rgba(73, 80, 87, 0) 40%);
  animation: hm-blast-smoke calc(var(--hm-time) * 0.8) ease-out calc(var(--hm-time) * 0.1) both;
}

.hm-spark {
  width: calc(var(--hm-size) * 0.16);
  height: calc(var(--hm-size) * 0.16);
  border-radius: 30%;
  background: var(--hm-spark);
  box-shadow: 0 0 calc(var(--hm-size) * 0.14) var(--hm-spark);
  animation: hm-spark calc(var(--hm-time) * 0.5) cubic-bezier(0.1, 0.7, 0.3, 1) both;
}

/* 폭발에 휩쓸려 날아가는 말이다. 불에 그을린 듯 붉은빛을 두른다. */
.hm-token.hm-token-out {
  position: fixed;
  z-index: 46;
  box-shadow: 0 0 calc(var(--hm-size) * 0.35) calc(var(--hm-size) * 0.12) rgba(255, 146, 43, 0.85), 0 calc(var(--hm-size) * 0.2) calc(var(--hm-size) * 0.4) rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

/* 폭발이 일어난 칸은 잠깐 붉게 번쩍이고, 보드는 충격으로 짧게 흔들린다. */
.hm-tile-blast {
  z-index: 2;
  animation: hm-tile-blast 0.9s ease-out both;
}

.hm-board-quake {
  animation: hm-quake 0.45s linear;
}

/* 누가 어떻게 패배했는지를 보드 가운데에 잠깐 띄우는 알림이다. */
.hm-defeat-flash {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5cqw;
  width: max-content;
  max-width: 82%;
  padding: 2cqw 3.2cqw;
  border: 0.45cqw solid #e03131;
  border-radius: 2cqw;
  background: var(--hm-paper);
  box-shadow: 0 0 0 0.5cqw rgba(224, 49, 49, 0.35), 0 0 5cqw 1.2cqw rgba(255, 107, 0, 0.6), 0 1.5cqw 4cqw rgba(0, 0, 0, 0.45);
  font-size: clamp(11px, 2cqw, 24px);
  font-weight: 800;
  text-align: center;
  transform: translate(-50%, -50%);
  animation: hm-charm-pop 0.45s cubic-bezier(0.2, 1.5, 0.4, 1) both, hm-defeat-shine 1.1s ease-in-out 0.45s infinite;
  pointer-events: none;
}

.hm-defeat-flash-icon {
  font-size: clamp(22px, 5cqw, 60px);
  line-height: 1.1;
  animation: hm-charm-spin 0.6s ease-out both;
}

.hm-defeat-flash-title {
  color: #e03131;
  font-size: 1.25em;
  font-weight: 900;
}

/*
 * 사용자가 장착한 부적의 효과가 일어났을 때 보드 가운데에 잠깐 띄우는 알림이다. 등급의 색으로 빛난다.
 * 땅값 할인은 원래 가격에 줄을 긋고 깎인 가격을 크게 보여준다.
 */
.hm-charm-flash {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5cqw;
  width: max-content;
  max-width: 82%;
  padding: 2cqw 3.2cqw;
  border: 0.45cqw solid var(--hm-grade);
  border-radius: 2cqw;
  background: var(--hm-paper);
  box-shadow: 0 0 0 0.5cqw color-mix(in srgb, var(--hm-grade) 35%, transparent), 0 0 5cqw 1.2cqw color-mix(in srgb, var(--hm-grade) 65%, transparent), 0 1.5cqw 4cqw rgba(0, 0, 0, 0.45);
  font-size: clamp(11px, 2cqw, 24px);
  font-weight: 800;
  text-align: center;
  transform: translate(-50%, -50%);
  animation: hm-charm-pop 0.45s cubic-bezier(0.2, 1.5, 0.4, 1) both, hm-charm-shine 1.1s ease-in-out 0.45s infinite;
  pointer-events: none;
}

/* 누구의 부적인지 말과 이름으로 알린다. */
.hm-charm-flash-owner {
  display: flex;
  align-items: center;
  gap: 0.8cqw;
  color: var(--hm-muted);
  font-size: 0.85em;
}

.hm-charm-flash-icon {
  font-size: clamp(22px, 5cqw, 60px);
  line-height: 1.1;
  animation: hm-charm-spin 0.8s ease-out both;
}

.hm-charm-flash-title {
  color: var(--hm-grade);
  font-size: 1.25em;
  font-weight: 900;
}

.hm-grade-legend .hm-charm-flash-title {
  color: #e67700;
}

.hm-charm-flash-price {
  display: flex;
  align-items: baseline;
  gap: 1cqw;
  font-size: 1.3em;
  font-weight: 900;
}

.hm-charm-flash-price s {
  color: var(--hm-muted);
  font-size: 0.75em;
  font-weight: 700;
}

.hm-charm-flash-price .hm-num:last-child {
  color: #2f9e44;
  animation: hm-charm-beat 0.6s ease-in-out 0.5s 2;
}

/*
 * 내는 쪽에서 빠져나간 금액과 받는 쪽에 들어온 금액을 말(은행과 사회복지기금 본부는 그 칸) 위에 띄운다.
 * 떠오르는 방향과 거리는 --hm-rise 로 정하며, 화면 위쪽에 자리가 없으면 아래로 떠오른다.
 */
.hm-float {
  --hm-rise: -100%;
  position: fixed;
  z-index: 46;
  padding: 0.15em 0.65em;
  border: 2px solid #ffffff;
  border-radius: 99px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
  color: #ffffff;
  font-size: clamp(13px, 1.5vw, 22px);
  font-weight: 900;
  white-space: nowrap;
  pointer-events: none;
  animation: hm-float-pay var(--hm-time) ease-out both;
}

.hm-float-pay {
  background: #e03131;
}

.hm-float-get {
  background: #2f9e44;
  animation-name: hm-float-get;
}

.hm-float-down {
  --hm-rise: 100%;
}

.hm-player-pay {
  animation: hm-flash-pay 0.6s ease-in-out 3;
}

.hm-player-get {
  animation: hm-flash-get 0.6s ease-in-out 3;
}

/* ---------- 보드 옆 영역 (플레이어, 진행 기록) ---------- */

.hm-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  overflow: auto;
}

.hm-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--hm-line);
  border-radius: 16px;
  background: var(--hm-surface);
}

.hm-panel-log {
  flex: 1;
  min-height: 170px;
}

.hm-panel-title {
  margin: 0;
  color: var(--hm-muted);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hm-players {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 플레이어 카드는 누르면 자산과 소유한 땅 목록이 뜨는 버튼이다. */
.hm-player {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border: 2px solid transparent;
  border-radius: 14px;
  background: color-mix(in srgb, var(--hm-player) 11%, var(--hm-surface));
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.hm-player:hover {
  filter: brightness(1.04);
}

.hm-player-name,
.hm-player-cash,
.hm-player-meta {
  display: block;
}

.hm-player-turn {
  border-color: var(--hm-player);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--hm-player) 28%, transparent);
}

.hm-player-out {
  filter: grayscale(1);
  opacity: 0.45;
}

.hm-player-main {
  display: block;
  flex: 1;
  min-width: 0;
}

.hm-player-name {
  overflow: hidden;
  font-size: 14px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hm-player-cash {
  font-size: 19px;
  font-weight: 900;
  line-height: 1.2;
}

.hm-player-meta {
  color: var(--hm-muted);
  font-size: 12px;
}

.hm-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.hm-badges:empty {
  display: none;
}

.hm-badge {
  padding: 1px 7px;
  border-radius: 99px;
  background: var(--hm-player);
  color: var(--hm-player-ink, #ffffff);
  font-size: 11px;
  font-weight: 800;
}

.hm-log {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  overflow: auto;
  list-style: none;
  font-size: 13px;
}

.hm-log-item {
  padding: 6px 8px;
  border-bottom: 1px solid var(--hm-line);
  border-left: 4px solid var(--hm-player);
}

.hm-log-item:first-child {
  background: var(--hm-surface-2);
  font-weight: 700;
}

/* ---------- 코스 (세계여행 코스, 우주여행 코스) ---------- */

/* 대기실의 리그는 코스별로 묶어 보여준다. 묶음마다 코스의 이름을 적고 그 아래에 그 코스의 리그 카드를 나란히 놓는다. */
.hm-courses {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hm-course {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hm-course-name {
  margin: 0;
  color: var(--hm-muted);
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.hm-course-name::before {
  content: "🌍 ";
}

.hm-course[data-course="space"] .hm-course-name::before {
  content: "🚀 ";
}

/*
 * 우주여행 코스의 보드 가운데는 밤하늘처럼 보이도록 색을 바꾸고 별을 흩뿌린다.
 * 글자색은 화면의 밝기 설정을 그대로 따르므로, 밝은 화면에서는 옅은 보랏빛, 어두운 화면에서는 짙은 남빛을 깐다.
 */
.hm-course-space {
  --hm-felt-a: #ebe7fb;
  --hm-felt-b: #cbc4f0;
  --hm-sky-star: rgba(92, 70, 190, 0.55);
}

.hm-root[data-theme="dark"] .hm-course-space {
  --hm-felt-a: #1e2148;
  --hm-felt-b: #0e1026;
  --hm-sky-star: rgba(255, 255, 255, 0.8);
}

.hm-course-space .hm-center {
  background:
    radial-gradient(circle at 12% 18%, var(--hm-sky-star) 0 0.16cqw, transparent 0.2cqw),
    radial-gradient(circle at 83% 12%, var(--hm-sky-star) 0 0.22cqw, transparent 0.26cqw),
    radial-gradient(circle at 68% 30%, var(--hm-sky-star) 0 0.12cqw, transparent 0.16cqw),
    radial-gradient(circle at 24% 62%, var(--hm-sky-star) 0 0.2cqw, transparent 0.24cqw),
    radial-gradient(circle at 91% 58%, var(--hm-sky-star) 0 0.14cqw, transparent 0.18cqw),
    radial-gradient(circle at 8% 88%, var(--hm-sky-star) 0 0.18cqw, transparent 0.22cqw),
    radial-gradient(circle at 57% 91%, var(--hm-sky-star) 0 0.13cqw, transparent 0.17cqw),
    radial-gradient(circle at 78% 82%, var(--hm-sky-star) 0 0.2cqw, transparent 0.24cqw),
    radial-gradient(circle at 40% 9%, var(--hm-sky-star) 0 0.13cqw, transparent 0.17cqw),
    radial-gradient(circle at 50% 35%, var(--hm-felt-a), var(--hm-felt-b));
}

/* 우주여행 코스의 옆줄 칸에는 "Andromeda" 처럼 긴 이름이 있어, 이름이 낱말 중간에서 끊기지 않도록 글자를 조금 더 줄인다. */
.hm-course-space .hm-side-left .hm-tile-name,
.hm-course-space .hm-side-right .hm-tile-name {
  font-size: clamp(6px, 1cqw, 13px);
}

/* 기지 : 안테나를 세운 둥근 돔이다. 안테나와 그 끝의 등까지를 건물의 높이로 잡는다. (margin-top) */
.hm-house-base {
  width: 2.3cqw;
  height: 1.5cqw;
  margin-top: 1.3cqw;
  border: 0.12cqw solid #364fc7;
  border-bottom: 0;
  border-radius: 1.2cqw 1.2cqw 0 0;
  background: linear-gradient(#edf2ff, #91a7ff);
}

.hm-house-base::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  width: 0.16cqw;
  height: 0.8cqw;
  background: #364fc7;
  transform: translateX(-50%);
}

.hm-house-base::after {
  content: "";
  position: absolute;
  bottom: calc(100% + 0.7cqw);
  left: 50%;
  width: 0.5cqw;
  height: 0.5cqw;
  border-radius: 50%;
  background: #ff6b6b;
  transform: translateX(-50%);
}

/* 우주여행 코스의 터에서는 기지와 증축 시설이 한 건물로 보이도록 사이를 띄우지 않는다. (증축한 기지도 기지 하나이다.) */
.hm-course-space .hm-lot {
  gap: 0;
}

/*
 * 기지의 증축 : 돔 옆에 붙여 지은 시설이다. 첫 증축은 노란 창이 난 낮은 거주 모듈이고 지붕에 태양 전지판을 올렸다.
 * 둘째 증축은 창이 줄지어 난 높은 관제탑이고 꼭대기에 초록 등을 달았다. 지붕 위의 장식까지를 건물의 높이로 잡는다. (margin-top)
 */
.hm-house-annex {
  width: 1.1cqw;
  height: 0.95cqw;
  margin-top: 0.45cqw;
  border: 0.12cqw solid #364fc7;
  border-bottom: 0;
  border-radius: 0.3cqw 0.3cqw 0 0;
  background:
    radial-gradient(circle at 50% 48%, #ffe066 0 0.2cqw, transparent 0.24cqw),
    linear-gradient(#dbe4ff, #748ffc);
}

.hm-house-annex::before {
  content: "";
  position: absolute;
  bottom: calc(100% + 0.16cqw);
  left: 50%;
  width: 1cqw;
  height: 0.22cqw;
  border-radius: 0.06cqw;
  background: linear-gradient(90deg, #1c7ed6 0 30%, #a5d8ff 30% 36%, #1c7ed6 36% 64%, #a5d8ff 64% 70%, #1c7ed6 70%);
  transform: translateX(-50%);
}

.hm-house-annex::after {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  width: 0.14cqw;
  height: 0.2cqw;
  background: #364fc7;
  transform: translateX(-50%);
}

.hm-house-annex + .hm-house-annex {
  width: 0.85cqw;
  height: 1.95cqw;
  margin-top: 0.4cqw;
  border-radius: 0.2cqw 0.2cqw 0 0;
  background-color: #748ffc;
  background-image: linear-gradient(#748ffc 0.22cqw, #fff3bf 0.22cqw 0.44cqw, #748ffc 0.44cqw);
  background-size: 100% 0.6cqw;
}

.hm-house-annex + .hm-house-annex::before {
  bottom: calc(100% + 0.06cqw);
  width: 0.34cqw;
  height: 0.34cqw;
  border-radius: 50%;
  background: #51cf66;
}

.hm-house-annex + .hm-house-annex::after {
  display: none;
}

/* 셋째(마지막) 증축 : 끝까지 증축했음을 알리는 금빛 탑이다. 관제탑보다 높고, 꼭대기에 붉은 등을 달았다. */
.hm-house-annex + .hm-house-annex + .hm-house-annex {
  width: 0.75cqw;
  height: 2.3cqw;
  margin-top: 0.4cqw;
  border-color: #a8750f;
  border-radius: 0.3cqw 0.3cqw 0 0;
  background-color: #f5c211;
  background-image: linear-gradient(#f5c211 0.3cqw, #7c4a03 0.3cqw 0.42cqw, #f5c211 0.42cqw);
  background-size: 100% 0.72cqw;
}

.hm-house-annex + .hm-house-annex + .hm-house-annex::before {
  background: #ff6b6b;
}

/* 주인이 없는 별에 남아 있는 기지의 터는 바닥선을 회색으로 그린다. (카드의 효과로 별만 주인을 잃은 경우) */
.hm-lot.hm-lot-vacant {
  border-bottom-color: var(--hm-muted);
}

/* 텔레파시 카드는 보랏빛, 뉴런의 골짜기 카드는 초록빛으로 비밀쿠폰과 구분한다. */
.hm-coupon-telepathy {
  --hm-card: #7950f2;
}

.hm-coupon-neuron {
  --hm-card: #0ca678;
}

.hm-coupon-telepathy,
.hm-coupon-neuron {
  background: linear-gradient(160deg, color-mix(in srgb, var(--hm-card) 18%, var(--hm-paper)), var(--hm-paper) 60%);
}

.hm-coupon-telepathy .hm-coupon-head,
.hm-coupon-neuron .hm-coupon-head {
  color: color-mix(in srgb, var(--hm-card) 72%, var(--hm-text));
}

/* 천사의 빛은 금빛, 블랙홀 탈출포트는 보랏빛으로 빛나고, 사건 알림은 파란 테두리에 글을 본문 색으로 적는다. */
.hm-use-angel {
  --hm-use: #f08c00;
}

.hm-use-escape {
  --hm-use: #7950f2;
}

.hm-use-notice {
  --hm-use: #1c7ed6;
}

.hm-use-notice .hm-use-flash-title {
  color: var(--hm-text);
  font-size: 1.05em;
  line-height: 1.4;
}

/* 카드의 효과로 굴리는 주사위는 굴리는 플레이어의 색으로 테두리를 둘러, 이동하려고 굴리는 주사위와 구분한다. */
.hm-casting .hm-die {
  outline: 0.4cqw solid var(--hm-player);
  outline-offset: 0.35cqw;
}

/* ---------- 세로로 긴 화면 : 보드를 화면 너비에 맞추고 그 아래에 플레이어와 기록을 둔다. ---------- */

@media (orientation: portrait) {
  .hm-game {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto;
    height: auto;
    min-height: 100vh;
    min-height: 100dvh;
    padding: 6px;
  }

  .hm-side {
    overflow: visible;
  }

  .hm-board-wrap {
    container-type: inline-size;
  }

  .hm-board {
    gap: 1px;
    width: 100cqw;
    height: 100cqw;
    padding: 2px;
  }

  .hm-log {
    max-height: 260px;
  }
}

@media (max-width: 640px) {
  .hm-card {
    padding: 22px 18px;
  }

  .hm-slots,
  .hm-leagues {
    grid-template-columns: minmax(0, 1fr);
  }

  .hm-slot {
    min-height: 0;
  }
}

/* ---------- 움직임 ---------- */

@keyframes hm-fade {
  from { opacity: 0; }
}

@keyframes hm-pop {
  from { opacity: 0; transform: scale(0.92); }
}

@keyframes hm-zoom {
  from { opacity: 0; transform: scale(0.4); }
}

@keyframes hm-hop {
  from { transform: translateY(-45%) scale(1.25); }
}

@keyframes hm-pulse {
  50% { box-shadow: 0 0 0 0.5cqw color-mix(in srgb, var(--hm-player) 45%, transparent), 0 1px 4px rgba(0, 0, 0, 0.5); }
}

@keyframes hm-shake {
  25% { transform: rotate(-14deg) translateY(-6%); }
  75% { transform: rotate(14deg) translateY(4%); }
}

@keyframes hm-ship-hover {
  50% { transform: translateY(-7%); }
}

@keyframes hm-ship-flame {
  from { transform: translateX(-50%) scaleY(0.7); }
  to { transform: translateX(-50%) scaleY(1.15); }
}

@keyframes hm-glow {
  50% { box-shadow: 0 0 0 0.9cqw color-mix(in srgb, var(--hm-accent) 30%, transparent); }
}

@keyframes hm-countdown {
  to { transform: scaleX(0); }
}

@keyframes hm-build {
  from { opacity: 0.3; transform: scale(0.6, 0); }
}

@keyframes hm-drop {
  from { opacity: 0; transform: translate(-50%, -40%) scale(0.9); }
}

@keyframes hm-nudge {
  50% { transform: translateX(0.35em); }
}

@keyframes hm-office {
  50% { box-shadow: 0 0 0 0.7cqw color-mix(in srgb, var(--hm-flow) 35%, transparent), 0 0 2.6cqw 0.9cqw color-mix(in srgb, var(--hm-flow) 70%, transparent); }
}

@keyframes hm-float-pay {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
  12% { opacity: 1; transform: translate(-50%, calc(-50% + var(--hm-rise))) scale(1.15); }
  75% { opacity: 1; transform: translate(-50%, calc(-50% + var(--hm-rise) * 1.5)) scale(1); }
  100% { opacity: 0; transform: translate(-50%, calc(-50% + var(--hm-rise) * 2)) scale(1); }
}

@keyframes hm-float-get {
  0%, 45% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
  58% { opacity: 1; transform: translate(-50%, calc(-50% + var(--hm-rise))) scale(1.3); }
  90% { opacity: 1; transform: translate(-50%, calc(-50% + var(--hm-rise) * 1.5)) scale(1); }
  100% { opacity: 0; transform: translate(-50%, calc(-50% + var(--hm-rise) * 2)) scale(1); }
}

@keyframes hm-flash-pay {
  50% { background: color-mix(in srgb, #e03131 38%, var(--hm-surface)); }
}

@keyframes hm-flash-get {
  50% { background: color-mix(in srgb, #2f9e44 38%, var(--hm-surface)); }
}

@keyframes hm-draw-wobble {
  25% { transform: rotate(-7deg) scale(1.04); }
  60% { transform: rotate(7deg) scale(1.06); }
}

@keyframes hm-draw-out {
  to { transform: rotateY(180deg); }
}

@keyframes hm-draw-in {
  from { transform: rotateY(-180deg); }
}

@keyframes hm-draw-glow {
  50% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--hm-grade) 55%, transparent), 0 0 30px 10px color-mix(in srgb, var(--hm-grade) 75%, transparent); }
}

@keyframes hm-draw-rays {
  to { transform: rotate(360deg); }
}

@keyframes hm-draw-show {
  to { opacity: 0.85; }
}

@keyframes hm-draw-leap {
  0% { transform: scale(1); }
  40% { transform: scale(1.22) rotate(-3deg); }
  100% { transform: scale(1.06); }
}

@keyframes hm-draw-burst {
  0% { opacity: 0; }
  12% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes hm-draw-sweep {
  0% { transform: translateX(-70%); }
  45%, 100% { transform: translateX(70%); }
}

@keyframes hm-draw-beat {
  50% { transform: scale(1.08); }
}

@keyframes hm-transfer-big {
  50% { box-shadow: 0 0 0 0.9cqw rgba(245, 159, 0, 0.45), 0 0 8cqw 2.6cqw rgba(255, 212, 59, 0.85), 0 1.5cqw 4cqw rgba(0, 0, 0, 0.4); }
}

@keyframes hm-burst {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
  35% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.35); }
}

@keyframes hm-use-shine {
  50% { box-shadow: 0 0 0 0.9cqw color-mix(in srgb, var(--hm-use) 45%, transparent), 0 0 8cqw 2.4cqw color-mix(in srgb, var(--hm-use) 80%, transparent), 0 1.5cqw 4cqw rgba(0, 0, 0, 0.45); }
}

@keyframes hm-use-wave {
  25% { transform: rotate(-14deg) scale(1.15); }
  75% { transform: rotate(14deg) scale(1.15); }
}

@keyframes hm-ring {
  0% { opacity: 0.95; transform: translate(-50%, -50%) scale(0.4); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(5); }
}

@keyframes hm-stamp {
  from { opacity: 0; transform: translate(-50%, -50%) rotate(-12deg) scale(2.6); }
}

@keyframes hm-blast {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(0.12); }
  45% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.35); }
}

@keyframes hm-blast-wave {
  0% { opacity: 0.95; transform: translate(-50%, -50%) scale(0.3); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(5); }
}

@keyframes hm-blast-smoke {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  25% { opacity: 0.9; }
  100% { opacity: 0; transform: translate(-50%, -95%) scale(1.9); }
}

@keyframes hm-spark {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(1.5); }
  70% { opacity: 1; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--hm-dx)), calc(-50% + var(--hm-dy))) scale(0.3) rotate(240deg); }
}

@keyframes hm-tile-blast {
  0%, 25% { box-shadow: 0 0 0 0.5cqw #ff922b, 0 0 3.4cqw 1.4cqw rgba(224, 49, 49, 0.85); filter: brightness(1.5); }
  100% { box-shadow: 0 0 0 0 rgba(224, 49, 49, 0); filter: brightness(1); }
}

@keyframes hm-quake {
  10% { transform: translate(-5px, 3px) rotate(-0.4deg); }
  25% { transform: translate(5px, -4px) rotate(0.4deg); }
  40% { transform: translate(-4px, -2px) rotate(-0.3deg); }
  55% { transform: translate(3px, 3px) rotate(0.2deg); }
  70% { transform: translate(-2px, 1px); }
  85% { transform: translate(1px, -1px); }
}

@keyframes hm-defeat-shine {
  50% { box-shadow: 0 0 0 0.9cqw rgba(224, 49, 49, 0.45), 0 0 8cqw 2.4cqw rgba(255, 107, 0, 0.75), 0 1.5cqw 4cqw rgba(0, 0, 0, 0.45); }
}

@keyframes hm-charm-pop {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.5) rotate(-6deg); }
}

@keyframes hm-charm-shine {
  50% { box-shadow: 0 0 0 0.9cqw color-mix(in srgb, var(--hm-grade) 45%, transparent), 0 0 8cqw 2.4cqw color-mix(in srgb, var(--hm-grade) 80%, transparent), 0 1.5cqw 4cqw rgba(0, 0, 0, 0.45); }
}

@keyframes hm-charm-spin {
  from { transform: rotate(-200deg) scale(0.3); }
}

@keyframes hm-charm-beat {
  50% { transform: scale(1.25); }
}

@media (prefers-reduced-motion: reduce) {
  /* 움직임을 줄인 경우 추첨 결과는 기다리지 않고 바로 다 보여준다. */
  .hm-root .hm-draw-card,
  .hm-root .hm-draw-card *,
  .hm-root .hm-draw-card::before,
  .hm-root .hm-draw-best,
  .hm-root .hm-draw-summary {
    animation-delay: 0s !important;
  }

  .hm-root .hm-draw-back {
    display: none;
  }

  .hm-root *,
  .hm-root *::before,
  .hm-root *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .hm-coupon-bar {
    display: none;
  }

  /* 움직임을 줄인 경우에도 금액 표시는 연출 시간 동안 그대로 보여준다. */
  .hm-root .hm-float {
    opacity: 1;
    transform: translate(-50%, calc(-50% + var(--hm-rise) * 1.3));
    animation: none !important;
  }
}
`;

/**
 * 게임 화면의 스타일시트(STYLE_TEXT)를 게임을 그릴 요소가 속한 문서에 넣는다. 이미 넣었으면 다시 넣지 않고 넣어 둔 것을 돌려준다.
 * 페이지가 연결한 다른 스타일시트로 게임의 모양을 덮어쓸 수 있도록, 그것들보다 앞(head 의 맨 앞)에 넣는다.
 * 요소가 섀도 DOM 안에 있으면 바깥 문서의 스타일이 닿지 않으므로 그 섀도 루트에 넣는다.
 * @param {HTMLElement} root 게임 화면을 그릴 요소
 * @returns {HTMLStyleElement} 문서에 들어 있는 스타일 요소
 */
export function installStyle(root) {
  let scope = root.getRootNode();
  let home = typeof ShadowRoot === 'function' && scope instanceof ShadowRoot ? scope : root.ownerDocument.head;
  let found = home.querySelector('style[' + STYLE_MARK + ']');
  if (found) return found;
  let node = el('style', { text: STYLE_TEXT, attrs: { [STYLE_MARK]: '' } });
  home.prepend(node);
  return node;
}

/* ==========================================================================
 * 10. 초기화
 * ========================================================================== */

/**
 * Hellmarble 을 초기화하여 메인 메뉴를 보여준다. HTML 에서 이 함수를 호출해야 게임이 시작된다.
 * 게임 화면의 스타일시트도 이때 문서에 넣으므로, HTML 은 게임의 모양을 정하는 CSS 를 따로 연결하지 않아도 된다. (글꼴을 불러오는 css/fonts.css 는 HTML 이 연결한다.)
 * @param {HTMLElement|string} root 게임 화면을 그릴 요소 또는 그 요소의 CSS 선택자
 * @param {Object} [options] 선택 사항
 * @param {Object} [options.storage] 저장소 객체. read(key), write(key, value), remove(key) 를 구현하면 localStorage 대신 쓸 수 있다.
 * @param {Object} [options.timings] 연출 시간(밀리초). TIMINGS 의 일부 항목만 덮어쓸 수 있다.
 * @param {Function} [options.random] 부적 추첨에 쓸 난수 함수 (0 이상 1 미만). 생략하면 Math.random 을 쓴다.
 * @param {boolean} [options.style] false 를 주면 게임의 스타일시트(STYLE_TEXT)를 문서에 넣지 않는다. 페이지가 모양을 직접 정할 때 쓴다.
 * @returns {HellmarbleApp} 실행 중인 애플리케이션
 */
export function initHellmarble(root, options) {
  let target = typeof root === 'string' ? document.querySelector(root) : root;
  if (!target) throw new Error('Hellmarble 을 그릴 요소를 찾을 수 없습니다.');
  return new HellmarbleApp(target, options).start();
}
