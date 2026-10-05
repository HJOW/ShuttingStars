/**
 * @file Hellmarble : 웹으로 즐기는 보드게임의 주 구현 파일이다.
 * 게임 데이터, 규칙 엔진, 인공지능, 저장소 추상화, 화면 구성을 모두 이 파일에서 제공한다.
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
 * 도시 하나에 지을 수 있는 건물 종류별 최대 개수이다.
 * @type {Object<string, number>}
 */
export const BUILD_LIMIT = { villa: 2, building: 1, hotel: 1 };
/**
 * 구매할 수 있는 땅의 종류 목록이다. (일반 도시, 한국 도시, 특수 시설)
 * @type {string[]}
 */
export const PROPERTY_TYPES = ['city', 'korea', 'special'];
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
 * 저장 데이터의 형식 버전이다.
 * @type {number}
 */
const SAVE_VERSION = 5;
/**
 * 게임 진행을 강제로 중단시킬 때 던지는 신호 객체이다.
 * @type {{stop: boolean}}
 */
const STOP = { stop: true };
/**
 * 사용자 이름의 최대 글자 수이다.
 * @type {number}
 */
const NAME_LIMIT = 12;

/**
 * 화면 연출에 쓰이는 시간(밀리초) 기본값이다.
 * dice: 주사위 굴림, step: 일반 이동 1칸 (0.5초), fastStep: 비밀쿠폰/우주여행 이동 1칸 (0.25초),
 * coupon: 비밀쿠폰 표시 (6초), transfer: 플레이어 간 돈 이동, bank: 은행 또는 사회복지기금 본부와의 돈 이동 (자주 일어나므로 조금 짧다),
 * charm: 부적 효과 발동 표시, think: 인공지능 판단, pause: 연출 사이 간격, result: 패배 화면 표시
 * @type {Object<string, number>}
 */
export const TIMINGS = { dice: 900, step: 500, fastStep: 250, coupon: 6000, transfer: 1800, bank: 1200, charm: 1900, think: 700, pause: 500, result: 3500 };

/**
 * 리그별 설정이다. multiplier 는 금액 배율, weights 는 인공지능 플레이어가 1, 2, 3명일 확률의 가중치이다.
 * 참가비는 START_CASH 에 배율을 곱한 금액이다.
 * @type {Object<string, {multiplier: number, weights: number[], color: string}>}
 */
export const LEAGUES = {
  green: { multiplier: 1, weights: [1, 2, 1], color: '#2f9e44' },
  orange: { multiplier: 5, weights: [1, 1, 2], color: '#f08c00' },
  red: { multiplier: 30, weights: [1, 2, 4], color: '#e03131' },
};

/**
 * 땅 색상 이름에 대응하는 화면 표시 색이다.
 * @type {Object<string, string>}
 */
export const LAND_COLORS = { yellow: '#f5c211', blue: '#3b9dea', navy: '#3d4fd6', red: '#e03131', green: '#2f9e44', gold: '#d4a017' };

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
 * @property {string} effect 효과의 종류 ('double' : 더블 확률 증가, 'discount' : 땅 구매 할인, 'redraw' : 손해 보는 비밀쿠폰 다시 뽑기, 'build' : 건물 무료 건설)
 * @property {number} chance 효과가 일어날 확률 (%). double 에서는 더블이 나올 확률에 더해지는 값이다.
 * @property {number} [percent] 땅값을 깎아 주는 비율 (%) (discount 만)
 * @property {string} [building] 무료로 지어지는 건물의 종류 (build 만)
 * @property {boolean} [revisit] 땅을 살 때뿐 아니라 자기 땅에 다시 도착했을 때에도 적용되는지 여부 (build 만)
 */

/**
 * 부적의 구성이다. 상점에서 직접 살 수 없고 부적 추첨권으로만 얻는다.
 * @type {Object<string, HellmarbleCharm>}
 */
export const CHARMS = {
  brokendice: { grade: 'common', icon: '🎲', effect: 'double', chance: 10 },
  oldcoin: { grade: 'common', icon: '🪙', effect: 'discount', chance: 5, percent: 10 },
  tornlottery: { grade: 'uncommon', icon: '🎫', effect: 'redraw', chance: 10 },
  realtor: { grade: 'uncommon', icon: '📇', effect: 'build', chance: 20, building: 'villa', revisit: false },
  scratched: { grade: 'uncommon', icon: '🎟️', effect: 'redraw', chance: 20 },
  woodendice: { grade: 'uncommon', icon: '🪵', effect: 'double', chance: 15 },
  memorialcoin: { grade: 'uncommon', icon: '🏅', effect: 'discount', chance: 10, percent: 10 },
  fortunecookie: { grade: 'rare', icon: '🥠', effect: 'redraw', chance: 30 },
  lawfirm: { grade: 'rare', icon: '💼', effect: 'build', chance: 10, building: 'building', revisit: true },
  stock: { grade: 'rare', icon: '📈', effect: 'discount', chance: 10, percent: 25 },
  president: { grade: 'legend', icon: '🏛️', effect: 'build', chance: 10, building: 'hotel', revisit: true },
  pendant: { grade: 'legend', icon: '📿', effect: 'redraw', chance: 45 },
  etf: { grade: 'legend', icon: '📊', effect: 'discount', chance: 10, percent: 50 },
};

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
 * @property {string} limit 게임 한 판에 한 번이라는 사용 제한을 함께 쓰는 묶음의 이름. 같은 묶음의 아이템은 한 판에 하나만 쓸 수 있다.
 * @property {string} [effect] 직접 쓰는 아이템의 효과 ('space' : 우주여행 무료 탑승, 'dice' : 주사위 조작)
 * @property {number[]} [faces] 주사위 조작형 아이템을 썼을 때 주사위에서 나오는 눈
 */

/**
 * 대기실에서 사고팔 수 있는 아이템의 구성이다. 여기에 항목을 더하면 상점과 보유 목록에 자동으로 나타난다.
 * @type {Object<string, HellmarbleItem>}
 */
export const ITEMS = {
  pass: { price: 300000, icon: '🎟️', category: 'support', use: 'ask', limit: 'pass' },
  radio: { price: 200000, icon: '📻', category: 'support', use: 'ask', limit: 'radio' },
  invitation: { price: 200000, icon: '💌', category: 'travel', use: 'turn', limit: 'invitation', effect: 'space' },
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
  villa: '🏠', building: '🏢', hotel: '🏨', pass: '🎟️', radio: '📻', bank: '🏦',
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
 * @property {string} type 칸 종류 (city, korea, special, start, coupon, space, island, fund, desk)
 * @property {string} [color] 땅 색상 이름 (규칙상의 색)
 * @property {string} [show] 화면에 보일 색상 이름
 * @property {number} [price] 땅 구매가 (원)
 * @property {number} [toll] 기본 통행료 (원)
 * @property {Object<string, number>} [cost] 건물 종류별 건설비 (원). 일반 도시에만 있다.
 * @property {Object<string, number>} [fee] 건물 종류별 이용료 (원). 일반 도시에만 있다.
 */

/**
 * 비밀쿠폰 한 종류의 정보이다.
 * @typedef {Object} HellmarbleCoupon
 * @property {number} count 덱에 들어가는 장수
 * @property {string} effect 효과의 종류 (gain, pay, tax, move, back, island, space, air, halfsale, keep)
 * @property {number} [amount] 받거나 내는 기본 금액 (원)
 * @property {string} [target] 이동할 칸의 식별자
 * @property {number} [steps] 뒤로 이동할 칸 수
 * @property {Object<string, number>} [rates] 건물 종류별 1개당 내는 금액 (원)
 * @property {boolean} [harm] 뽑은 플레이어에게 바로 손해가 되는 쿠폰인지 여부 (돈을 내거나 땅을 잃거나 무인도로 감). 부적의 다시 뽑기 효과가 본다.
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
 * 구매할 수 없는 기능 칸(출발지, 비밀쿠폰 등)의 정보를 만든다.
 * @param {string} id 칸 식별자이자 종류
 * @returns {Object} 칸 정보
 */
function spot(id) {
  return { id, type: id };
}

/**
 * 보드의 구성이다. 출발지(0번)부터 진행 방향 순서대로 40칸을 나열한다.
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
 * 칸 식별자로 칸 번호를 찾을 수 있는 표를 만든다. (같은 식별자가 여럿이면 첫 칸을 쓴다.)
 * @returns {Object<string, number>} 식별자별 칸 번호
 */
function indexTiles() {
  let table = {};
  // 보드의 모든 칸을 순회하며 식별자별 첫 칸 번호를 기록한다.
  for (let index = 0; index < BOARD.length; index++) {
    if (table[BOARD[index].id] === undefined) table[BOARD[index].id] = index;
  }
  return table;
}

/**
 * 칸 식별자별 칸 번호이다. (예: TILES.island 는 무인도의 칸 번호)
 * @type {Object<string, number>}
 */
export const TILES = indexTiles();

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
  'slot.overwrite': '슬롯 {n}에 이미 저장된 데이터가 있습니다.\n덮어쓰시겠습니까?',
  'name.title': '이름 / 닉네임 입력',
  'name.hint': '게임에서 사용할 이름을 입력하세요. (최대 {n}자)',
  'name.default': '플레이어',
  'name.submit': '대기실로 이동',
  'lobby.title': '대기실',
  'lobby.welcome': '{name} 님, 참여할 리그를 선택하세요.',
  'lobby.money': '보유 금액',
  'lobby.fee': '참가비',
  'lobby.multiplier': '금액 배율',
  'lobby.times': '{n}배',
  'lobby.rivals': '상대',
  'lobby.join': '참여하기',
  'lobby.shortTitle': '참여 불가',
  'lobby.short': '돈이 부족하여 {league}에 참여할 수 없습니다.\n필요 금액 : {fee}\n보유 금액 : {money}',
  'lobby.confirmTitle': '참여 확인',
  'lobby.confirm': '{league}에 참여하시겠습니까?\n참가비 {fee}이 보유 금액에서 차감됩니다.',
  'lobby.note': '승리하면 게임에서 가진 돈과 땅, 건물의 가치를 돌려받습니다. 게임에 가져간 소모형 아이템은 승리·패배와 관계없이 쓰지 않고 남은 것이 대기실로 돌아오며, 게임에서 사용한 것만 사라집니다. 색상과 모양은 사라지지 않습니다. 패배하면 참가비를 잃습니다.',
  'mcp.items.rules': '[아이템 규칙]\n- 대기실 상점에서 아이템을 사서 보관하거나, 구매 가격의 {itemSell}%에 되팔 수 있다.\n- 게임에 들어갈 때 가진 소모형 아이템을 모두 가져가며, 게임이 끝나면 이기든 지든 쓰지 않고 남은 아이템은 대기실로 돌아온다. 게임에서 사용한 아이템만 사라진다.\n- 아이템은 종류마다 게임 한 판에 한 번만 쓸 수 있다. 주사위 조작형 아이템(빅 다이즈, 스몰 다이즈)은 둘을 합쳐 한 번이다. 비밀쿠폰으로 얻은 우대권·무전기와는 따로 센다.\n- 쓸 상황이 되면 게임이 사용 여부를 묻는 아이템과, 주사위를 굴릴 차례에 아이템 목록에서 직접 쓰는 아이템이 있다.\n[아이템 목록]',
  'mcp.items.entry': '- {item} ({price}) : {description} [사용 시점] {when}',
  'mcp.items.guide': '- 대기실의 "상점"(lobby.shop)은 구매 / 판매 탭(items.tab), 분류 버튼(items.filter), 아이템 카드 목록으로 되어 있다. 카드를 누르면(items.pick) 상세 팝업이 뜨고, 수량을 정한 뒤(items.less / items.more / items.max) 구매 또는 판매(items.trade)한다. 상세 팝업은 items.back, 상점은 items.close 로 닫는다.\n- "아이템 확인"(lobby.items)과 게임 중 자기 차례의 "아이템"(game.items)은 보유 아이템 목록을 연다. 게임 중 주사위를 굴릴 차례에는 상세 팝업의 "사용"(items.use)으로 우주여행 초청장과 주사위 조작형 아이템을 쓸 수 있으며, 한 번 더 확인받는다.\n- 설정의 "설정 초기화"는 확인 후 언어와 화면을 기본값으로 되돌리고 저장 슬롯 세 개를 비운 뒤 메인 메뉴로 간다.',
  'lobby.shop': '상점',
  'lobby.items': '아이템 확인',
  'item.owned': '보유 아이템',
  'item.none': '보유한 아이템이 없습니다.',
  'item.noneLobby': '보유한 아이템이 없습니다. 대기실의 상점에서 구매할 수 있습니다.',
  'item.noneIn': '이 분류에는 아이템이 없습니다.',
  'item.total': '{kinds}종 · {count}개',
  'item.count': '보유 수량',
  'item.hint.lobby': '아이템을 누르면 자세한 설명을 볼 수 있고, 색상과 모양, 부적은 그 자리에서 장착할 수 있습니다. 게임에 참여하면 소모형 아이템은 모두 가져가며, 게임이 끝나면 쓰지 않고 남은 것은 대기실로 돌아옵니다. 게임에서 사용한 아이템만 사라집니다. 색상과 모양, 부적은 사라지지 않습니다.',
  'item.hint.game': '이번 게임에 가져온 아이템입니다. 아이템을 누르면 자세한 설명을 볼 수 있고, 주사위를 굴릴 차례에 쓰는 아이템은 그 자리에서 사용할 수 있습니다. 쓰지 않은 아이템은 게임이 끝나면 대기실로 돌아갑니다.',
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
  'charm.redraw.brief': '손해 보는 비밀쿠폰을 {chance}% 확률로 다시 뽑기',
  'charm.redraw.description': '게임에서 비밀쿠폰을 뽑을 때, 벌금이나 세금을 내거나 땅을 잃거나 무인도로 가는 것처럼 나에게 바로 손해가 되는 쿠폰이 나올 차례이면 {chance}% 확률로 그 쿠폰을 덱 맨 뒤로 보내고 다시 뽑습니다.',
  'charm.build.brief': '땅을 살 때 {chance}% 확률로 {building} 무료 건설',
  'charm.build.description': '게임에서 땅을 살 때 {chance}% 확률로 {building} 한 채가 그 자리에서 무료로 지어집니다. 땅을 막 샀을 때에만 적용되고, 건물을 지을 수 없는 땅에는 적용되지 않습니다.',
  'charm.build.revisit': '게임에서 땅을 살 때, 그리고 내 땅에 다시 도착했을 때 그 땅에 {building}이(가) 없으면 {chance}% 확률로 {building} 한 채가 무료로 지어집니다. 건물을 지을 수 없는 땅에는 적용되지 않습니다.',
  'charm.when': '대기실의 아이템 확인 창에서 장착합니다. 한 번에 하나만 장착할 수 있고, 장착하지 않아도 리그에 참여할 수 있습니다. 장착한 부적의 효과는 그 게임 내내 적용됩니다.',
  'charm.limit': '소모되지 않습니다. 같은 부적을 여러 개 가질 수 있고, 상점에 판매하면 사라집니다.',
  'charm.unequip': '장착 해제',
  'charm.undone': '{item}의 장착을 해제했습니다.',
  'charm.sold': '장착하고 있던 부적을 모두 판매하여 장착이 해제되었습니다.',
  'charm.shopOnly': '부적은 대기실의 아이템 확인 창에서 장착합니다.',
  'charm.flash': '{item} 발동!',
  'charm.flash.double': '더블이 나왔습니다!',
  'charm.flash.discount': '{tile} 땅값 {percent}% 할인',
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
  'item.tornlottery.title': '찢어진 복권',
  'item.realtor.title': '동네 공인중개사 명함',
  'item.scratched.title': '이미 긁은 복권',
  'item.woodendice.title': '나무 주사위',
  'item.memorialcoin.title': '기념 주화',
  'item.fortunecookie.title': '포춘 쿠키',
  'item.lawfirm.title': '대형 로펌 명함',
  'item.stock.title': '주식 증서',
  'item.president.title': '대통령 명함',
  'item.pendant.title': '행운의 펜던트',
  'item.etf.title': '레버리지 ETF 증서',
  'mcp.charms.rules': '[부적]\n- 부적은 장착형 아이템이다. 하나만 장착할 수 있고 장착하지 않아도 리그에 참여할 수 있다. 장착한 부적의 효과는 그 게임 내내 적용된다. 인공지능 플레이어는 부적을 쓰지 않는다.\n- 상점에서 직접 살 수 없고, 부적 추첨권({ticket})이나 부적 10개 추첨권({ticket10})을 사면 그 자리에서 무작위로 얻는다. 같은 부적이 또 나올 수 있다.\n- 등급은 일반, 고급, 희귀, 전설이 있다. 추첨에서 고급은 일반의 5분의 1, 희귀는 100분의 1, 전설은 2000분의 1의 확률로 나온다. ({odds})\n- 가진 부적은 상점에서 팔 수 있다. 판매 가격은 등급으로 정해진다. ({sells})\n- 부적은 아이템 확인 창에서만 보이고 장착한다. 게임 화면에는 효과가 일어났을 때에만 알림이 뜬다.\n[부적 목록]',
  'mcp.charms.entry': '- [{grade}] {item} : {brief}',
  'mcp.charms.guide': '- 부적 추첨 : 상점의 분류 "부적"에서 추첨권 카드를 누르고(items.pick) 상세 팝업의 "추첨하기"(items.trade)를 누르면 돈이 빠지고 추첨 결과가 뜬다. "확인"(items.done)으로 닫는다. 가진 부적은 판매 탭에서 판다.\n- 부적 장착 : "아이템 확인"의 분류 "부적"에서 카드를 누르고 "장착"(items.equip) 또는 "장착 해제"(items.unequip)를 누른다.',
  'item.pass.title': '우대권',
  'item.pass.brief': '통행료·이용료 한 번 면제',
  'item.pass.description': '다른 플레이어의 땅에 도착했을 때 내야 하는 통행료와 이용료를 한 번 면제받습니다. 다른 플레이어가 콜롬비아 호를 가지고 있을 때 내는 우주여행 이용료에도 쓸 수 있습니다. 비밀쿠폰으로 얻은 우대권과는 따로 보관되고 따로 쓰입니다. 쓰면 한 개가 사라집니다.',
  'item.pass.when': '통행료나 이용료를 내야 할 때 게임이 사용할지 물어봅니다.',
  'item.radio.title': '무전기',
  'item.radio.brief': '무인도에서 바로 탈출',
  'item.radio.description': '무인도에 갇혔을 때 더블을 기다리지 않고 바로 탈출한 뒤 주사위를 굴려 이동합니다. 비밀쿠폰으로 얻은 무전기와는 따로 보관되고 따로 쓰입니다. 쓰면 한 개가 사라집니다.',
  'item.radio.when': '무인도에 도착했을 때와, 갇혀 있는 동안 주사위를 굴리기 직전에 게임이 사용할지 물어봅니다.',
  'item.invitation.title': '우주여행 초청장',
  'item.invitation.brief': '우주여행 무료 탑승',
  'item.invitation.description': '주사위를 굴리는 대신 우주여행 칸으로 곧바로 이동해 탑승하고 차례를 마칩니다. 콜롬비아 호의 주인이 있어도 이용료를 내지 않으며, 가는 길에 출발지를 지나면 월급도 받습니다. 다음 차례에는 보드의 원하는 칸으로 이동할 수 있습니다. 쓰면 한 개가 사라집니다.',
  'item.invitation.when': '내가 주사위를 굴릴 차례에 아이템 목록에서 직접 사용합니다.',
  'item.bigdice.title': '빅 다이즈',
  'item.bigdice.brief': '4·5·6만 나오는 주사위',
  'item.bigdice.description': '이번에 굴리는 주사위 두 개를 4, 5, 6 눈만 나오는 주사위로 바꿉니다. (1, 2, 3 눈이 각각 4, 5, 6 으로 바뀝니다.) 멀리 가고 싶을 때 좋습니다. 효과는 사용한 차례의 주사위 한 번에만 적용되어, 더블이 나와 다시 굴릴 때에는 보통 주사위로 돌아갑니다. 사용하는 즉시 한 개가 사라지며, 그 차례에 주사위를 굴리지 않아도 돌려받지 못합니다.',
  'item.bigdice.when': '내가 주사위를 굴릴 차례에 아이템 목록에서 직접 사용한 뒤 주사위를 굴립니다.',
  'item.smalldice.title': '스몰 다이즈',
  'item.smalldice.brief': '1·2·3만 나오는 주사위',
  'item.smalldice.description': '이번에 굴리는 주사위 두 개를 1, 2, 3 눈만 나오는 주사위로 바꿉니다. (4, 5, 6 눈이 각각 1, 2, 3 으로 바뀝니다.) 가까운 칸에 멈추고 싶을 때 좋습니다. 효과는 사용한 차례의 주사위 한 번에만 적용되어, 더블이 나와 다시 굴릴 때에는 보통 주사위로 돌아갑니다. 사용하는 즉시 한 개가 사라지며, 그 차례에 주사위를 굴리지 않아도 돌려받지 못합니다.',
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
  'item.use.pass.title': '🎟️ 아이템 우대권 사용',
  'item.use.pass.text': '{tile}에 낼 {amount}을(를) 한 번 면제받습니다.\n게임에서 이미 아이템 우대권을 사용했다면 추가로 사용할 수 없습니다.',
  'item.use.radio.title': '📻 아이템 무전기 사용',
  'item.use.radio.text': '무인도를 탈출하고 주사위를 굴려 이동합니다.\n게임에서 이미 아이템 무전기를 사용했다면 추가로 사용할 수 없습니다.',
  'league.green': 'Green 리그',
  'league.orange': 'Orange 리그',
  'league.red': 'Red 리그',
  'league.green.rivals': '인공지능 1~3명 (2명일 확률이 높음)',
  'league.orange.rivals': '인공지능 1~3명 (3명일 확률이 높음)',
  'league.red.rivals': '인공지능 1~3명 (3명일 확률이 높고 1명은 드묾)',
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
  'ask.pass.text': '{tile}의 통행료·이용료는 {amount}입니다.\n우대권을 사용하여 면제받으시겠습니까? (보유 {n}장)',
  'ask.radio.title': '무전기 사용',
  'ask.radio.text': '무전기를 사용하여 무인도에서 즉시 탈출하시겠습니까? (보유 {n}장)',
  'ask.use': '사용',
  'ask.keep': '사용하지 않음',
  'result.win.title': '승리!',
  'result.win.text': '다른 플레이어가 모두 파산했습니다.\n게임에서 가진 돈과 땅, 건물의 가치를 모두 얻습니다.',
  'result.cash': '보유 현금',
  'result.property': '땅과 건물의 가치',
  'result.reward': '획득 금액',
  'result.lose.title': '패배',
  'result.lose.text': '이번 게임에서 패배했습니다.\n잠시 후 대기실로 돌아갑니다.',
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
  'playerinfo.assets': '총 자산',
  'playerinfo.coupons': '보관 쿠폰',
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
  'mcp.rules': '[Hellmarble 플레이 방법]\n- 2~4명이 하는 턴제 보드게임이다. 사용자 1명과 인공지능 1~3명이 참여한다.\n- 모두 같은 돈({start} x 리그 배율)을 가지고 출발지에서 시작한다. 다른 플레이어가 모두 파산하면 승리하고, 사용자가 파산하면 즉시 패배한다.\n- 시작할 때 각자 주사위 2개를 굴려 합이 큰 순서로 차례를 정한다. (동점이면 플레이어 번호가 낮은 쪽이 먼저)\n- 차례가 되면 주사위 2개를 굴려 나온 수만큼 앞으로 이동한다. 출발지를 지나거나 출발지에 멈추면 월급({salary})을 받는다.\n- 더블(두 눈이 같음)이면 도착한 칸의 처리를 마친 뒤 한 번 더 굴린다. 더블이 이어지면 계속 굴린다. 단, 무인도에 갇히거나 우주여행에 탑승하면 차례가 끝난다.\n- 빈 땅(일반 도시, 한국 도시, 특수 시설)에 도착하면 돈이 충분할 때 살 수 있다.\n- 자기 일반 도시에 다시 도착하면 별장(최대 2개), 빌딩(1개), 호텔(1개) 가운데 하나를 지을 수 있다. 한국 도시와 특수 시설에는 지을 수 없다.\n- 남의 땅에 도착하면 통행료와 건물 이용료의 합을 소유자에게 낸다. 우대권이 있으면 써서 면제받을 수 있다.\n- 낼 돈이 모자라면 자기 땅을 은행에 팔아(구매·건설 가격의 {sell}%) 마련해야 하고, 모두 팔아도 모자라면 파산한다.\n- 비밀쿠폰 칸 : 쿠폰 한 장을 뽑아 적힌 대로 한다. 우대권과 무전기는 보관했다가 쓸 수 있다.\n- 우주여행 칸 : 탑승하여 다음 차례에 원하는 칸으로 이동한다. 콜롬비아 호를 다른 플레이어가 가지고 있으면 이용료({space})를 낸다.\n- 무인도 칸 : 갇힌다. 더블이 나오면 탈출하여 그 눈만큼 이동하고(이 더블로는 다시 굴리지 않는다), 아니면 2턴을 쉬고 3턴 째에 이동한다. 무전기를 쓰면 바로 풀려난다.\n- 사회복지기금 접수처 : {welfare}을 낸다. (모자라면 가진 만큼만 내고 파산하지 않는다.) 사회복지기금 본부 : 쌓인 돈을 모두 가져간다.\n- 리그 : Green(배율 1배), Orange(5배), Red(30배). 참가비는 시작 금액과 같고, 배율은 게임 안의 모든 금액에 곱해진다.\n- 승리하면 게임에서 가진 현금과 땅, 건물의 가치(100%)를 대기실 금액으로 받는다. 패배하면 참가비를 잃는다.',
  'mcp.guide': '[화면 사용 방법]\n- 메인 메뉴 : 게임 시작(저장 슬롯 선택 → 이름 입력 → 대기실), 불러오기, 설정.\n- 불러오기 : 데이터가 있는 슬롯을 누르면 불러오기 / 삭제 / 취소, 빈 슬롯을 누르면 JSON 불러오기 / 취소를 고른다.\n- 대기실 : 리그를 골라 참여한다. (한 번 더 확인받는다.) "JSON 내보내기"는 저장 데이터를 클립보드에 복사한다.\n- 게임 : 자기 차례에는 "주사위 굴리기", "아이템", "메인 메뉴"(저장하고 나감), "포기"를 사용할 수 있다. 구매, 건설, 매각, 쿠폰 사용은 화면에 뜨는 창에서 고른다.\n  칸을 누르면 땅 정보가 뜨고 다시 누르면 닫힌다. 플레이어를 누르면 자산과 소유한 땅 목록이 뜬다.\n  우주여행에 탑승한 차례에는 칸을 누른 뒤 "이곳으로 이동"을 누른다.\n  비밀쿠폰은 6초 동안 표시되며 "닫기"(coupon.close)를 누르면 바로 닫고 진행한다.\n  주사위·말 이동·돈 이동 연출 중에는 조작할 수 없으므로 hellmarble_wait 로 다음 입력 시점까지 기다린다. 돈은 플레이어 사이뿐 아니라 은행(출발지 칸)·사회복지기금 본부와 오갈 때도 지폐 이동으로 표시된다.\n- 설정 : 언어(한국어 / English)와 다크 모드를 고른다.\n\n[WebMCP 도구 사용 순서]\n1. hellmarble_get_state 로 현재 화면과 지금 누를 수 있는 동작(actions) 목록을 본다.\n2. hellmarble_act 에 그 목록의 action 과 value 를 그대로 넘겨서 누른다. 창(dialog)이 떠 있으면 창 안의 동작만 누를 수 있다.\n3. 글자를 입력해야 하면(이름, JSON) hellmarble_set_text 로 입력한 뒤 해당 동작을 누른다.\n4. 주사위를 굴리거나 선택을 한 뒤에는 hellmarble_wait 로 다음 입력 차례가 될 때까지 기다린다.\n5. 칸의 자세한 정보는 hellmarble_get_land 로 본다. (index 0 = 출발지, 진행 방향으로 39까지)\n- 금액은 모두 원 단위 정수이다.',
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
  'slot.overwrite': 'Slot {n} already has saved data.\nDo you want to overwrite it?',
  'name.title': 'Enter Your Name',
  'name.hint': 'Enter the name to use in the game. (up to {n} characters)',
  'name.default': 'Player',
  'name.submit': 'Go to Lobby',
  'lobby.title': 'Lobby',
  'lobby.welcome': '{name}, choose a league to join.',
  'lobby.money': 'Your money',
  'lobby.fee': 'Entry fee',
  'lobby.multiplier': 'Money multiplier',
  'lobby.times': 'x{n}',
  'lobby.rivals': 'Opponents',
  'lobby.join': 'Join',
  'lobby.shortTitle': 'Cannot Join',
  'lobby.short': 'You do not have enough money to join the {league}.\nRequired : {fee}\nYou have : {money}',
  'lobby.confirmTitle': 'Confirm',
  'lobby.confirm': 'Join the {league}?\nThe entry fee of {fee} will be deducted from your money.',
  'lobby.note': 'If you win, you get back your in-game cash plus the full value of your lands and buildings. Consumable items you take into a game come back to the lobby whether you win or lose, apart from the ones you actually used in it. Colors and shapes are never lost. If you lose, the entry fee is gone.',
  'mcp.items.rules': '[Item rules]\n- Buy items in the lobby shop and keep them, or sell them back for {itemSell}% of the purchase price.\n- All your consumable items go into a game with you. When it ends, whether you win or lose, the items you did not use come back to the lobby; only the items you used are gone.\n- Each kind of item can be used only once per game. The dice items (Big Dice, Small Dice) share a single use between them. Secret Coupon passes and radios are counted separately.\n- Some items are offered by the game when the situation arises; others are used from the item list on your turn to roll.\n[Items]',
  'mcp.items.entry': '- {item} ({price}) : {description} [When] {when}',
  'mcp.items.guide': '- The lobby "Item Shop" (lobby.shop) has Buy / Sell tabs (items.tab), category buttons (items.filter) and a list of item cards. Press a card (items.pick) to open its detail popup, set the quantity (items.less / items.more / items.max), then buy or sell (items.trade). Close the popup with items.back and the shop with items.close.\n- "My Items" (lobby.items) and the "Items" button on your turn (game.items) open your inventory. In a game, on your turn to roll, "Use" (items.use) in the detail popup uses a Space Travel Invitation or a dice item after one more confirmation.\n- "Reset Settings" on the settings screen asks first, restores the default language and theme, clears all three save slots, and returns to the main menu.',
  'lobby.shop': 'Item Shop',
  'lobby.items': 'My Items',
  'item.owned': 'My Items',
  'item.none': 'You do not have any items.',
  'item.noneLobby': 'You do not have any items. You can buy some in the lobby shop.',
  'item.noneIn': 'There are no items in this category.',
  'item.total': '{kinds} kind(s) · {count} item(s)',
  'item.count': 'In stock',
  'item.hint.lobby': 'Click an item to read its details. Colors, shapes and charms can be equipped right there. Consumable items all go into a game with you; the ones you do not use come back to the lobby when it ends, and only the items you use are gone. Colors, shapes and charms are never lost.',
  'item.hint.game': 'These are the items you brought into this game. Click an item to read its details. Items used on your turn to roll can be used right there. Items you do not use come back to the lobby when the game ends.',
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
  'charm.redraw.brief': '{chance}% chance to redraw a bad Secret Coupon',
  'charm.redraw.description': 'When you draw a Secret Coupon in a game and the next one would hurt you right away, such as a fine, a tax, losing a land or being sent to the Desert Island, there is a {chance}% chance that it goes to the back of the deck and you draw again.',
  'charm.build.brief': '{chance}% chance of a free {building} on a new land',
  'charm.build.description': 'When you buy a land in a game, there is a {chance}% chance that one {building} is built on it for free right away. It applies only when you have just bought the land, and not to lands where nothing can be built.',
  'charm.build.revisit': 'When you buy a land in a game, and whenever you arrive at your own land that has no {building}, there is a {chance}% chance that one {building} is built on it for free. It does not apply to lands where nothing can be built.',
  'charm.when': 'Equip it in the lobby item window. You can equip only one at a time, and you can join a league without one. The effect of the equipped charm lasts for the whole game.',
  'charm.limit': 'It is never consumed. You can own several of the same charm, and selling it to the shop removes it.',
  'charm.unequip': 'Unequip',
  'charm.undone': 'Unequipped {item}.',
  'charm.sold': 'You sold every copy of the charm you had equipped, so it is no longer equipped.',
  'charm.shopOnly': 'Charms are equipped in "My Items" in the lobby.',
  'charm.flash': '{item} activated!',
  'charm.flash.double': 'You rolled doubles!',
  'charm.flash.discount': '{percent}% off {tile}',
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
  'item.tornlottery.title': 'Torn Lottery Ticket',
  'item.realtor.title': "Local Realtor's Card",
  'item.scratched.title': 'Scratched Lottery Ticket',
  'item.woodendice.title': 'Wooden Dice',
  'item.memorialcoin.title': 'Commemorative Coin',
  'item.fortunecookie.title': 'Fortune Cookie',
  'item.lawfirm.title': 'Big Law Firm Card',
  'item.stock.title': 'Stock Certificate',
  'item.president.title': "President's Card",
  'item.pendant.title': 'Lucky Pendant',
  'item.etf.title': 'Leveraged ETF Certificate',
  'mcp.charms.rules': '[Charms]\n- A charm is an equippable item. You can equip only one, and you can join a league without one. The equipped charm works for the whole game. AI players do not use charms.\n- Charms cannot be bought directly. Buying a Charm Ticket ({ticket}) or a 10-Charm Ticket ({ticket10}) in the shop draws random charms on the spot. You may get the same charm again.\n- The grades are Common, Uncommon, Rare and Legendary. In a draw, Uncommon is 1/5 as likely as Common, Rare 1/100 and Legendary 1/2000. ({odds})\n- Charms you own can be sold in the shop for a price set by grade. ({sells})\n- Charms are shown and equipped only in the item window. In the game screen a notice appears only when an effect happens.\n[Charm list]',
  'mcp.charms.entry': '- [{grade}] {item} : {brief}',
  'mcp.charms.guide': '- Drawing charms : under the "Charms" category of the shop, press a ticket card (items.pick) and then "Draw" (items.trade) in its detail popup. The money is deducted and the results appear; close them with "OK" (items.done). Sell charms you own on the Sell tab.\n- Equipping a charm : under the "Charms" category of "My Items", press a card and then "Equip" (items.equip) or "Unequip" (items.unequip).',
  'item.pass.title': 'Free Pass',
  'item.pass.brief': 'Skip one toll and fee',
  'item.pass.description': "Skip the toll and building fees you owe when you land on another player's land, one time. It also covers the space travel fee charged when another player owns the Columbia. It is kept and used separately from Secret Coupon passes. Using it removes one from your stock.",
  'item.pass.when': 'The game asks whether to use it when you have to pay a toll or fee.',
  'item.radio.title': 'Radio',
  'item.radio.brief': 'Escape the island at once',
  'item.radio.description': 'When you are stuck on the Desert Island, escape at once without waiting for doubles, then roll the dice and move. It is kept and used separately from Secret Coupon radios. Using it removes one from your stock.',
  'item.radio.when': 'The game asks whether to use it when you land on the island, and before each roll while you are stuck there.',
  'item.invitation.title': 'Space Travel Invitation',
  'item.invitation.brief': 'Board space travel for free',
  'item.invitation.description': 'Instead of rolling the dice, move straight to Space Travel, board, and end your turn. You pay no fee even if someone owns the Columbia, and you collect your salary if you pass Start on the way. On your next turn you can move to any tile on the board. Using it removes one from your stock.',
  'item.invitation.when': 'Use it yourself from the item list on your turn to roll the dice.',
  'item.bigdice.title': 'Big Dice',
  'item.bigdice.brief': 'Dice that roll only 4, 5, 6',
  'item.bigdice.description': 'Swap both dice for this roll with dice that only show 4, 5 and 6. (Faces 1, 2, 3 become 4, 5, 6.) Handy when you want to go far. The effect covers a single roll on the turn you use it, so if you roll doubles the extra roll uses normal dice again. One is removed from your stock the moment you use it, and it is not returned even if you do not roll that turn.',
  'item.bigdice.when': 'Use it yourself from the item list on your turn to roll, then roll the dice.',
  'item.smalldice.title': 'Small Dice',
  'item.smalldice.brief': 'Dice that roll only 1, 2, 3',
  'item.smalldice.description': 'Swap both dice for this roll with dice that only show 1, 2 and 3. (Faces 4, 5, 6 become 1, 2, 3.) Handy when you want to stop close by. The effect covers a single roll on the turn you use it, so if you roll doubles the extra roll uses normal dice again. One is removed from your stock the moment you use it, and it is not returned even if you do not roll that turn.',
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
  'item.use.pass.title': '🎟️ Use Item Free Pass',
  'item.use.pass.text': 'Skip the {amount} owed at {tile}.\nAn item free pass cannot be used again in this game once spent.',
  'item.use.radio.title': '📻 Use Item Radio',
  'item.use.radio.text': 'Escape the island and roll the dice to move.\nAn item radio cannot be used again in this game once spent.',
  'league.green': 'Green League',
  'league.orange': 'Orange League',
  'league.red': 'Red League',
  'league.green.rivals': '1-3 AI players (2 is most likely)',
  'league.orange.rivals': '1-3 AI players (3 is most likely)',
  'league.red.rivals': '1-3 AI players (3 is most likely, 1 is rare)',
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
  'ask.pass.text': 'The toll and fees for {tile} are {amount}.\nUse a free pass to skip the payment? (You have {n})',
  'ask.radio.title': 'Use Radio',
  'ask.radio.text': 'Use a radio to escape the island right now? (You have {n})',
  'ask.use': 'Use',
  'ask.keep': 'Do not use',
  'result.win.title': 'Victory!',
  'result.win.text': 'All the other players went bankrupt.\nYou get your in-game cash plus the full value of your lands and buildings.',
  'result.cash': 'Cash',
  'result.property': 'Lands and buildings',
  'result.reward': 'Reward',
  'result.lose.title': 'Defeat',
  'result.lose.text': 'You lost this game.\nReturning to the lobby shortly.',
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
  'playerinfo.assets': 'Total assets',
  'playerinfo.coupons': 'Coupons held',
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
  'mcp.rules': '[How to play Hellmarble]\n- A turn-based board game for 2 to 4 players: one human and 1 to 3 AI players.\n- Everyone starts on Start with the same cash ({start} x the league multiplier). You win when every other player is bankrupt, and you lose at once if you go bankrupt.\n- At the beginning everyone rolls two dice; turns go from the highest total. (Ties go to the lower player number.)\n- On your turn, roll two dice and move forward by the total. You receive a salary ({salary}) whenever you pass or stop on Start.\n- On doubles you roll again after the tile you landed on is resolved, and keep going while doubles continue. The turn ends, however, if you get stuck on the island or board the space shuttle.\n- If you land on an unowned land (city, Korean city or special facility) and have enough cash, you may buy it.\n- When you land on your own city again, you may build one building: villas (up to 2), a building (1) or a hotel (1). Nothing can be built on Korean cities or special facilities.\n- If you land on a land owned by another player, you pay its toll plus the fees of its buildings. A free pass, if you hold one, lets you skip the payment.\n- If you are short of cash, you must sell your lands to the bank ({sell}% of the purchase and building prices). If that is still not enough, you go bankrupt.\n- Secret Coupon : draw a coupon and do what it says. Free passes and radios can be kept for later.\n- Space Travel : you board and move to any tile on your next turn. If another player owns the Columbia, you pay a fee ({space}).\n- Desert Island : you are stuck. Doubles free you and you move by that roll (those doubles do not give another roll); otherwise you rest for 2 turns and move on the 3rd. A radio frees you at once.\n- Welfare Fund Desk : pay {welfare}. (If short, pay what you have; you do not go bankrupt.) Welfare Fund HQ : take all the money piled up.\n- Leagues : Green (x1), Orange (x5), Red (x30). The entry fee equals the starting cash, and the multiplier applies to every amount in the game.\n- If you win, your in-game cash plus the full value of your lands and buildings is added to your lobby money. If you lose, the entry fee is gone.',
  'mcp.guide': '[How to use the screens]\n- Main menu : New Game (choose a save slot → enter a name → lobby), Load, Settings.\n- Load : clicking a slot with data offers Load / Delete / Cancel; clicking an empty slot offers Import JSON / Cancel.\n- Lobby : choose a league to join. (You are asked to confirm.) "Export JSON" copies the save data to the clipboard.\n- Game : on your turn choose "Roll Dice", "Items", "Main Menu" (saves and leaves), or "Forfeit". Buying, building, selling and coupon use are chosen in the window that appears.\n  Click a tile to see its land info and click again to close it. Click a player to see their assets and lands.\n  On a space travel turn, click a tile and then press "Travel Here".\n  A secret coupon stays on screen for 6 seconds; press "Close" (coupon.close) to dismiss it at once.\n  Controls are unavailable during dice, movement, and money transfer animations; call hellmarble_wait until the next input is needed. Money visibly moves between players and also to or from the bank (shown at Start) and Welfare Fund HQ.\n- Settings : choose the language (한국어 / English) and dark mode.\n\n[How to use the WebMCP tools]\n1. Call hellmarble_get_state to see the current screen and the list of actions you can press now.\n2. Call hellmarble_act with the action and value taken from that list. While a dialog is open, only the actions inside it can be pressed.\n3. When text is needed (a name or JSON), call hellmarble_set_text first and then press the matching action.\n4. After rolling the dice or making a choice, call hellmarble_wait until the game needs your input again.\n5. Call hellmarble_get_land for the details of a tile. (index 0 = Start, up to 39 in the direction of travel)\n- All amounts are integers in Korean won.',
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
 * 게임 한 판의 아이템 사용 기록을 만든다. 사용 제한 묶음마다 아직 쓰지 않은 상태로 시작한다.
 * @returns {Object<string, boolean>} 사용 제한 묶음별 사용 여부
 */
function freshUsage() {
  let used = {};
  // 아이템마다 그 아이템이 속한 사용 제한 묶음을 쓰지 않은 상태로 넣는다.
  for (let id in ITEMS) used[ITEMS[id].limit] = false;
  return used;
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
 * 아이템은 사용자만 가질 수 있으므로 인공지능 플레이어는 모두 비어 있어야 한다.
 * @param {Object} player 확인할 플레이어
 * @returns {boolean} 올바르면 true
 */
function isValidItemState(player) {
  let used = player.usedItems;
  let loaded = player.loaded;
  if (!isValidItemBag(player.items) || !used || typeof used !== 'object') return false;
  if (loaded !== null && !(typeof loaded === 'string' && Object.hasOwn(ITEMS, loaded) && ITEMS[loaded].effect === 'dice')) return false;
  if (loaded !== null && (player.ai || !used[ITEMS[loaded].limit])) return false;
  // 아이템마다 사용 기록의 형식을 확인하고, 인공지능이 아이템을 가졌거나 쓴 기록이 없는지 확인한다.
  for (let id in ITEMS) {
    if (typeof used[ITEMS[id].limit] !== 'boolean') return false;
    if (player.ai && (player.items[id] !== 0 || used[ITEMS[id].limit])) return false;
  }
  return true;
}

/**
 * 게임 진행 상태의 플레이어 목록, 턴 순서, 순서를 정한 주사위가 올바른지 확인한다.
 * @param {Object} game 게임 진행 상태
 * @returns {boolean} 올바르면 true
 */
function isValidPlayers(game) {
  let count = game.players.length;
  let alive = 0;
  if (count < 2 || count > MAX_PLAYERS || game.order.length !== count || game.rolls.length !== count) return false;
  // 플레이어마다 번호, 돈, 위치, 상태 값의 형식과 범위를 확인한다.
  for (let id = 0; id < count; id++) {
    let player = game.players[id];
    let roll = game.rolls[id];
    if (!player || typeof player !== 'object' || player.id !== id || player.ai !== (id !== 0)) return false;
    if (!isCount(player.cash, Number.MAX_SAFE_INTEGER) || !isCount(player.position, BOARD_SIZE - 1) || !isCount(player.island, ISLAND_TURNS)) return false;
    if (typeof player.alive !== 'boolean' || typeof player.boarded !== 'boolean' || !player.coupons || typeof player.coupons !== 'object') return false;
    if (!isValidItemState(player) || !isValidLook(player.look)) return false;
    if (player.charm !== null && (player.ai || !isCharm(player.charm))) return false;
    if (!game.order.includes(id) || !Array.isArray(roll) || !isCount(roll[0] - 1, 5) || !isCount(roll[1] - 1, 5)) return false;
    if (id === 0 && typeof player.name !== 'string') return false;
    alive += player.alive ? 1 : 0;
  }
  let current = game.players[game.order[game.turn]];
  return alive >= 2 && game.players[0].alive && isCount(game.turn, count - 1) && Boolean(current) && current.alive;
}

/**
 * 게임 진행 상태의 땅 소유 정보가 올바른지 확인한다.
 * @param {Object} game 게임 진행 상태
 * @returns {boolean} 올바르면 true
 */
function isValidLands(game) {
  if (game.lands.length !== BOARD_SIZE) return false;
  // 칸마다 소유자와 건물 개수의 형식과 범위를 확인한다.
  for (let index = 0; index < BOARD_SIZE; index++) {
    let tile = BOARD[index];
    let land = game.lands[index];
    if (!PROPERTY_TYPES.includes(tile.type)) {
      if (land !== null) return false;
      continue;
    }
    if (!land || typeof land !== 'object') return false;
    if (land.owner !== null && (!isCount(land.owner, game.players.length - 1) || !game.players[land.owner].alive)) return false;
    // 건물 종류별 개수가 한도를 넘지 않는지 확인한다.
    for (let kind of BUILDINGS) {
      if (!isCount(land[kind], BUILD_LIMIT[kind])) return false;
    }
    if (land.villa + land.building + land.hotel > 0 && (land.owner === null || tile.type !== 'city')) return false;
  }
  return true;
}

/**
 * 게임 진행 상태의 비밀쿠폰이 정해진 구성(덱과 보관 중인 쿠폰을 합쳐 종류별 장수)과 같은지 확인한다.
 * @param {Object} game 게임 진행 상태
 * @returns {boolean} 올바르면 true
 */
function isValidDeck(game) {
  let counts = {};
  // 덱에 든 쿠폰을 종류별로 센다.
  for (let id of game.deck) {
    if (!Object.keys(COUPONS).includes(id)) return false;
    counts[id] = (counts[id] || 0) + 1;
  }
  // 플레이어가 보관 중인 쿠폰을 더한다.
  for (let player of game.players) {
    // 보관할 수 있는 쿠폰 종류별로 장수를 확인하고 더한다.
    for (let id in player.coupons) {
      if (!Object.keys(COUPONS).includes(id) || COUPONS[id].effect !== 'keep' || !isCount(player.coupons[id], COUPONS[id].count)) return false;
      counts[id] = (counts[id] || 0) + player.coupons[id];
    }
    if (player.coupons.pass === undefined || player.coupons.radio === undefined) return false;
  }
  // 종류별 장수가 정해진 구성과 같은지 확인한다.
  for (let id in COUPONS) {
    if (counts[id] !== COUPONS[id].count) return false;
  }
  return true;
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
    if (name === 'tile' && !isCount(value, BOARD_SIZE - 1)) return false;
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
  for (let key of ['players', 'order', 'rolls', 'lands', 'deck', 'dice', 'logs']) {
    if (!Array.isArray(game[key])) return false;
  }
  let league = Object.keys(LEAGUES).includes(game.league) ? LEAGUES[game.league] : null;
  if (!league || game.multiplier !== league.multiplier || !isCount(game.seed, 4294967295)) return false;
  if (!isCount(game.fund, Number.MAX_SAFE_INTEGER) || !isCount(game.turns, Number.MAX_SAFE_INTEGER)) return false;
  if (!isCount(game.dice[0] - 1, 5) || !isCount(game.dice[1] - 1, 5)) return false;
  return isValidPlayers(game) && isValidLands(game) && isValidDeck(game);
}

/**
 * 해석된 저장 데이터를 검사하여 슬롯 데이터로 다듬는다. 형식이 올바르지 않으면 오류를 던진다.
 * @param {*} data 해석된 저장 데이터
 * @param {string} fallback 이름이 비어 있을 때 쓸 이름
 * @param {boolean} strict 아이템이나 진행 중인 게임이 올바르지 않을 때 오류로 처리할지 여부 (false 이면 올바르지 않은 부분만 기본값으로 바꾸거나 버린다.)
 * @returns {Object} 슬롯 데이터 { name, money, items, equips, charms, equipped, game, updated }
 */
export function normalizeSave(data, fallback, strict) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || !isCount(data.money, Number.MAX_SAFE_INTEGER)) throw new Error('data');
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
  return { name: name || fallback, money: data.money, items, equips, charms, equipped, game, updated: isCount(data.updated, Number.MAX_SAFE_INTEGER) ? data.updated : 0 };
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
   * @param {Object} request 선택할 내용 (type : roll, travel, radio, buy, build, pass, sell, itemPass, itemRadio / roll 의 again 은 더블로 다시 굴리는 것인지 여부)
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
 * 인공지능 플레이어의 판단을 담당한다.
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
   * 요청의 종류에 맞는 판단을 내린다.
   * @param {Object} player 판단할 플레이어
   * @param {Object} request 판단할 내용
   * @returns {*} 판단 결과
   */
  decide(player, request) {
    switch (request.type) {
      case 'buy': return this.wantBuy(player, request);
      case 'build': return this.chooseBuild(player, request);
      case 'sell': return this.chooseSale(player, request);
      case 'pass': return this.wantPass(player, request);
      case 'radio': return this.wantRadio(player);
      case 'itemPass':
      case 'itemRadio': return false;
      case 'travel': return this.chooseTravel(player);
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
    let wanted = Math.max(this.game.money(SALARY) * 1.5, this.threat(player) * 0.6) * (player.caution || 1);
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
    // 이용료가 높은 건물(호텔 → 빌딩 → 별장)부터 지을 수 있는지 살펴본다.
    for (let position = BUILDINGS.length - 1; position >= 0; position--) {
      let kind = BUILDINGS[position];
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
   * 우대권을 쓸지 결정한다. 월급 이상의 큰 금액이거나 현금으로 낼 수 없을 때 쓴다.
   * @param {Object} player 판단할 플레이어
   * @param {Object} request 우대권 요청 { index, amount }
   * @returns {boolean} 사용 여부
   */
  wantPass(player, request) {
    return request.amount >= this.game.money(SALARY) || request.amount > player.cash;
  }

  /**
   * 무전기를 쓸지 결정한다. 보드가 아직 위험하지 않을 때에만 써서 탈출한다.
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
      let score = this.travelScore(player, index);
      if (score > bestScore) {
        best = index;
        bestScore = score;
      }
    }
    return best;
  }

  /**
   * 우주여행의 목적지로서 어떤 칸이 갖는 기대 가치를 계산한다.
   * @param {Object} player 판단할 플레이어
   * @param {number} index 살펴볼 칸 번호
   * @returns {number} 기대 가치 (원 단위의 어림값)
   */
  travelScore(player, index) {
    let game = this.game;
    let tile = BOARD[index];
    let land = game.state.lands[index];
    let bonus = index < player.position ? game.money(SALARY) : 0;
    if (land) {
      if (land.owner === null) {
        if (player.cash - game.price(index) < this.reserve(player)) return bonus;
        let potential = tile.type === 'city' ? game.money(tile.fee.building) * 0.3 : 0;
        return bonus + game.money(tile.toll) * 3 + game.price(index) * 0.2 + potential;
      }
      if (land.owner !== player.id) return bonus - game.toll(index);
      let choice = this.chooseBuild(player, { index, options: game.buildOptions(player, index) });
      return bonus + (choice ? game.money(tile.fee[choice]) : 0);
    }
    switch (tile.type) {
      case 'coupon': return bonus + game.money(won(3));
      case 'fund': return bonus + game.state.fund;
      case 'desk': return bonus - Math.min(player.cash, game.money(WELFARE_FEE));
      case 'island': return bonus - game.money(SALARY) * 2;
      default: return bonus;
    }
  }
}

/* ==========================================================================
 * 8. 규칙 엔진
 * ========================================================================== */

/**
 * Hellmarble 의 규칙을 진행하는 엔진이다.
 * 진행 상태(state)는 그대로 저장할 수 있는 단순한 객체이며, 화면과 입력은 호스트에게 맡긴다.
 */
export class HellmarbleGame {
  /**
   * 게임 엔진을 만든다.
   * @param {Object} state 게임 진행 상태 (HellmarbleGame.create 로 만들거나 저장된 것을 불러온다.)
   * @param {HellmarbleHost} [host] 화면 연출과 사용자 입력 담당 (생략 시 연출 없이 진행)
   */
  constructor(state, host) {
    this.state = state;
    this.host = host || new HellmarbleHost();
    this.ai = new HellmarbleAI(this);
    this.stopped = false;
    this.exempt = false;
  }

  /**
   * 새 게임의 진행 상태를 만든다. 플레이어 구성, 턴 순서, 비밀쿠폰 덱을 정한다.
   * 사용자는 장착한 색상과 모양을 쓰고, 인공지능 플레이어는 그와 겹치지 않는 기본 색상과 모양을 쓴다.
   * @param {Object} options 설정 { league : 리그 식별자, name : 사용자 이름, items : 사용자가 가져갈 아이템 주머니(선택), look : 사용자가 장착한 색상과 모양(선택, 생략 시 기본 장착), charm : 사용자가 장착한 부적(선택), seed : 난수 씨앗(선택), rivals : 인공지능 수(선택) }
   * @returns {Object} 새 게임의 진행 상태
   */
  static create(options) {
    let league = LEAGUES[options.league];
    let seed = options.seed === undefined ? Math.floor(Math.random() * 4294967296) : options.seed;
    let humanItems = fillItems(options.items) || emptyItems();
    let look = isValidLook(options.look) ? { color: options.look.color, shape: options.look.shape } : { ...DEFAULT_LOOK };
    let looks = [look, ...rivalLooks(look, MAX_PLAYERS - 1)];
    let state = {
      version: SAVE_VERSION, league: options.league, multiplier: league.multiplier, seed: seed >>> 0,
      players: [], order: [], rolls: [], turn: 0, turns: 0, lands: [], deck: [], fund: 0,
      dice: [1, 1], logs: [], finished: false, winner: null,
    };
    let game = new HellmarbleGame(state);
    let rivals = options.rivals || game.pickWeighted(league.weights) + 1;
    // 사용자(0번)와 인공지능 플레이어를 만들고 턴 순서를 정할 주사위를 굴린다.
    for (let id = 0; id <= rivals; id++) {
      state.players.push({
        id, name: id === 0 ? options.name : null, ai: id !== 0, cash: START_CASH * league.multiplier, position: TILES.start,
        alive: true, island: 0, boarded: false, coupons: { pass: 0, radio: 0 },
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
    // 구매할 수 있는 칸마다 소유 정보를 만든다.
    for (let tile of BOARD) state.lands.push(PROPERTY_TYPES.includes(tile.type) ? { owner: null, villa: 0, building: 0, hotel: 0 } : null);
    // 비밀쿠폰을 종류별 장수만큼 덱에 넣는다.
    for (let id in COUPONS) {
      // 같은 쿠폰을 정해진 장수만큼 반복해서 넣는다.
      for (let count = 0; count < COUPONS[id].count; count++) state.deck.push(id);
    }
    game.shuffle(state.deck);
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
    return this.money(BOARD[index].price);
  }

  /**
   * 건물의 건설비를 구한다.
   * @param {number} index 칸 번호
   * @param {string} kind 건물 종류
   * @returns {number} 건설비 (원)
   */
  buildCost(index, kind) {
    return this.money(BOARD[index].cost[kind]);
  }

  /**
   * 땅의 통행료와 지어진 모든 건물의 이용료를 합산한다.
   * @param {number} index 칸 번호
   * @returns {number} 통행료와 이용료의 합 (원)
   */
  toll(index) {
    let tile = BOARD[index];
    let land = this.state.lands[index];
    let total = tile.toll;
    if (tile.type === 'city') {
      // 지어진 건물의 이용료를 종류별로 더한다.
      for (let kind of BUILDINGS) total += tile.fee[kind] * land[kind];
    }
    return this.money(total);
  }

  /**
   * 땅과 그 위 건물의 가치(구매 및 건설 가격의 100%)를 구한다.
   * @param {number} index 칸 번호
   * @returns {number} 가치 (원)
   */
  value(index) {
    let tile = BOARD[index];
    let land = this.state.lands[index];
    let total = tile.price;
    if (tile.type === 'city') {
      // 지어진 건물의 건설비를 종류별로 더한다.
      for (let kind of BUILDINGS) total += tile.cost[kind] * land[kind];
    }
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
   * 아이템을 가지고 있어야 하고, 같은 사용 제한 묶음의 아이템을 이번 게임에서 아직 쓰지 않았어야 한다.
   * @param {Object} player 쓰려는 플레이어
   * @param {string} id 아이템 식별자
   * @returns {boolean} 쓸 수 있으면 true
   */
  canUseItem(player, id) {
    return !player.ai && player.alive && Object.hasOwn(ITEMS, id) && player.items[id] > 0 && !player.usedItems[ITEMS[id].limit];
  }

  /**
   * 아이템 한 개를 소모한다. 같은 사용 제한 묶음의 아이템은 게임 한 판에 한 번만 쓸 수 있다.
   * @param {Object} player 사용한 플레이어
   * @param {string} id 아이템 식별자
   * @returns {boolean} 이번 게임에 처음 사용했고 아이템 한 개를 소비했으면 true
   */
  consumeItem(player, id) {
    if (!this.canUseItem(player, id)) return false;
    player.items[id]--;
    player.usedItems[ITEMS[id].limit] = true;
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
   * @param {string} effect 효과의 종류 ('double', 'discount', 'redraw', 'build')
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
   * 건물 부적을 장착했으면 그 확률로 건물 한 채를 무료로 짓는다. 건물을 지을 수 있는 일반 도시에서, 그 건물이 아직 없을 때에만 적용된다.
   * 땅을 막 샀을 때 적용되며, 부적에 따라서는 자기 땅에 다시 도착했을 때에도 적용된다.
   * @param {Object} player 땅의 주인인 플레이어
   * @param {number} index 땅의 칸 번호
   * @param {boolean} revisit 막 산 것이 아니라 자기 땅에 다시 도착한 것인지 여부
   * @returns {Promise<void>}
   */
  async grantBuilding(player, index, revisit) {
    let charm = this.charmOf(player, 'build');
    let land = this.state.lands[index];
    if (!charm || BOARD[index].type !== 'city' || (revisit && !charm.revisit) || land[charm.building] > 0) return;
    if (!this.luck(charm.chance)) return;
    land[charm.building]++;
    await this.charmed(player, 'log.charmBuild', { effect: 'build', tile: index, index, building: charm.building });
  }

  /**
   * 비밀쿠폰이 뽑은 플레이어에게 바로 손해가 되는지 확인한다.
   * 돈을 내거나 땅을 잃거나 무인도로 가는 쿠폰이 해당하며, 건물이 없어 낼 돈이 없거나 팔 땅이 없으면 손해가 아니다.
   * @param {Object} player 쿠폰을 뽑는 플레이어
   * @param {string} id 쿠폰 식별자
   * @returns {boolean} 손해가 되면 true
   */
  harms(player, id) {
    let coupon = COUPONS[id];
    if (!coupon || !coupon.harm) return false;
    if (coupon.effect === 'tax') return this.taxAmount(player, coupon.rates) > 0;
    if (coupon.effect === 'halfsale') return this.owned(player).length > 0;
    return true;
  }

  /**
   * 주사위 두 개를 굴린다. 주사위 조작형 아이템을 쓴 상태이면 그 아이템의 눈만 나오도록 바꾼다.
   * 굴려 나온 눈을 아이템의 눈 세 가지에 차례로 대응시키므로, 빅 다이즈는 1, 2, 3 이 4, 5, 6 으로, 스몰 다이즈는 4, 5, 6 이 1, 2, 3 으로 바뀐다.
   * 아이템의 효과는 이 한 번의 굴림으로 끝난다.
   * 더블 부적을 장착했으면 더블이 나올 확률이 부적의 값만큼 높아진다. 더블이 아닌 눈이 나왔을 때 일정한 확률로 둘째 주사위를 첫째와 같게 맞추며,
   * 그 확률은 원래 더블이 아닐 확률로 나눈 값이어서 전체 더블 확률이 정확히 부적의 값만큼 늘어난다.
   * @param {Object} player 굴리는 플레이어
   * @returns {{dice: number[], faces: number[]|null, lucky: boolean}} 두 주사위의 눈, 아이템이 적용되었으면 그 주사위의 눈 목록, 부적 때문에 더블이 되었는지 여부
   */
  throwDice(player) {
    let faces = player.loaded && ITEMS[player.loaded] ? ITEMS[player.loaded].faces : null;
    let charm = this.charmOf(player, 'double');
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
   * 플레이어가 지금 이 도시에 지을 수 있는 건물의 종류를 구한다. (최대 개수 미만이고 돈이 충분한 것)
   * @param {Object} player 플레이어
   * @param {number} index 칸 번호
   * @returns {string[]} 지을 수 있는 건물 종류 목록
   */
  buildOptions(player, index) {
    let options = [];
    let land = this.state.lands[index];
    if (BOARD[index].type !== 'city' || !land || land.owner !== player.id) return options;
    // 건물 종류별로 지을 수 있는지 확인한다.
    for (let kind of BUILDINGS) {
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
   * 땅을 건물과 함께 은행에 매각한다. 매각 후에는 아무도 소유하지 않은 땅이 된다.
   * 은행에서 매각 대금이 들어오는 연출은 부르는 쪽에서 요청한다.
   * @param {Object} player 매각하는 플레이어
   * @param {number} index 매각할 땅의 칸 번호
   * @param {number} percent 돌려받는 비율 (%)
   * @returns {number} 돌려받은 금액 (원)
   */
  sell(player, index, percent) {
    let land = this.state.lands[index];
    let amount = Math.floor((this.value(index) * percent) / 100);
    land.owner = null;
    // 지어진 건물을 모두 없앤다.
    for (let kind of BUILDINGS) land[kind] = 0;
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
        this.bankrupt(player, true);
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
    this.bankrupt(player);
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
   * 다른 플레이어의 땅에 대한 통행료·이용료를 지불한다. 우대권이 있으면 먼저 사용 여부를 확인한다.
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
    if (player.coupons.pass > 0 && (await this.decide(player, { type: 'pass', index, amount }))) {
      player.coupons.pass--;
      this.state.deck.push('pass');
      this.exempt = true;
      this.log('log.pass', { player: player.id, tile: index, amount });
      return true;
    }
    if (this.canUseItem(player, 'pass') && (await this.decide(player, { type: 'itemPass', index, amount, travel: false }))) {
      this.consumeItem(player, 'pass');
      this.exempt = true;
      this.log('log.itemPass', { player: player.id, tile: index, amount });
      return true;
    }
    let paid = await this.pay(player, amount, owner);
    if (paid) this.log('log.toll', { player: player.id, target: owner.id, tile: index, amount });
    return paid;
  }

  /**
   * 플레이어를 파산 또는 포기 처리한다. 남은 땅은 은행으로, 보관하던 쿠폰은 덱 맨 뒤로 돌아간다.
   * @param {Object} player 파산한 플레이어
   * @param {boolean} [voluntary=false] 포기로 인한 패배인지 여부
   */
  bankrupt(player, voluntary = false) {
    player.alive = false;
    player.boarded = false;
    player.island = 0;
    // 남아 있는 땅과 건물을 모두 은행으로 돌려보낸다.
    for (let index of this.owned(player)) {
      let land = this.state.lands[index];
      land.owner = null;
      // 지어진 건물을 모두 없앤다.
      for (let kind of BUILDINGS) land[kind] = 0;
    }
    // 보관하던 쿠폰을 종류별로 덱 맨 뒤로 돌려보낸다.
    for (let id in player.coupons) {
      // 같은 종류의 쿠폰을 한 장씩 덱으로 옮긴다.
      while (player.coupons[id] > 0) {
        player.coupons[id]--;
        this.state.deck.push(id);
      }
    }
    this.log(voluntary ? 'log.forfeit' : 'log.bankrupt', { player: player.id });
  }

  /**
   * 출발지에 닿은 플레이어가 은행에서 월급을 받는다.
   * @param {Object} player 플레이어
   * @returns {Promise<void>}
   */
  async paySalary(player) {
    let amount = this.money(SALARY);
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
      if (player.position === TILES.start && salary) await this.paySalary(player);
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
   * 도착한 칸의 효과를 적용한다.
   * @param {Object} player 도착한 플레이어
   * @returns {Promise<void>}
   */
  async arrive(player) {
    if (!player.alive) return;
    switch (BOARD[player.position].type) {
      case 'city':
      case 'korea':
      case 'special':
        await this.arriveProperty(player, player.position);
        break;
      case 'coupon':
        await this.drawCoupon(player);
        break;
      case 'space':
        await this.arriveSpace(player);
        break;
      case 'island':
        player.island = ISLAND_TURNS;
        this.log('log.island', { player: player.id });
        if (this.canUseItem(player, 'radio') && (await this.decide(player, { type: 'itemRadio' }))) {
          this.consumeItem(player, 'radio');
          player.island = 0;
          this.log('log.itemRadio', { player: player.id });
        }
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
   * 도시 또는 특수 시설에 도착했을 때의 처리(구매, 건설, 통행료 지불)를 한다.
   * 사용자가 부적을 장착했으면 땅을 살 때 할인이나 무료 건물이, 자기 땅에 다시 도착했을 때 무료 건물이 주어질 수 있다.
   * @param {Object} player 도착한 플레이어
   * @param {number} index 도착한 칸 번호
   * @returns {Promise<void>}
   */
  async arriveProperty(player, index) {
    let land = this.state.lands[index];
    if (land.owner === null) {
      let price = this.price(index);
      if (player.cash >= price && (await this.decide(player, { type: 'buy', index, price }))) {
        let paid = await this.discounted(player, index, price);
        player.cash -= paid;
        land.owner = player.id;
        await this.handover(player, BANK, paid);
        this.log('log.buy', { player: player.id, tile: index, amount: paid });
        await this.grantBuilding(player, index, false);
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
    player.cash -= cost;
    land[kind]++;
    await this.handover(player, BANK, cost);
    this.log('log.build', { player: player.id, tile: index, building: kind, amount: cost });
  }

  /**
   * 우주여행 칸에 도착했을 때의 처리를 한다. 콜롬비아 호의 소유자가 남이면 이용료를 내고 탑승한다.
   * @param {Object} player 도착한 플레이어
   * @returns {Promise<void>}
   */
  async arriveSpace(player) {
    let owner = this.state.lands[TILES.columbia].owner;
    if (owner !== null && owner !== player.id) {
      let amount = this.money(SPACE_FEE);
      if (this.canUseItem(player, 'pass') && (await this.decide(player, { type: 'itemPass', index: TILES.space, amount, travel: true }))) {
        this.consumeItem(player, 'pass');
        this.log('log.itemPass', { player: player.id, tile: TILES.space, amount });
        this.board(player);
        return;
      }
      if (!(await this.pay(player, amount, this.state.players[owner]))) return;
      this.log('log.spaceFee', { player: player.id, target: owner, amount });
    }
    this.board(player);
  }

  /**
   * 플레이어를 우주여행 탑승 상태로 만든다.
   * @param {Object} player 탑승할 플레이어
   */
  board(player) {
    player.boarded = true;
    this.log('log.board', { player: player.id });
  }

  /**
   * 사회복지기금 본부에 쌓인 돈을 모두 받는다.
   * @param {Object} player 도착한 플레이어
   * @returns {Promise<void>}
   */
  async collectFund(player) {
    let amount = this.state.fund;
    if (amount <= 0) return;
    this.state.fund = 0;
    player.cash += amount;
    await this.handover(FUND, player, amount);
    this.log('log.fundGet', { player: player.id, amount });
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
   * 비밀쿠폰을 한 장 뽑아 보여준 뒤 내용을 이행한다. (다시 뽑기 부적을 장착했으면 손해가 되는 쿠폰을 건너뛸 수 있다.)
   * 보관하는 쿠폰은 플레이어가 갖고, 그 밖의 쿠폰은 이행 후 덱 맨 뒤로 돌아간다.
   * @param {Object} player 쿠폰을 뽑는 플레이어
   * @returns {Promise<void>}
   */
  async drawCoupon(player) {
    let deck = this.state.deck;
    let charm = this.charmOf(player, 'redraw');
    // 다시 뽑기 부적을 장착했으면, 손해가 되는 쿠폰이 나올 차례일 때마다 그 확률로 쿠폰을 덱 맨 뒤로 보내고 다음 것을 뽑는다.
    for (let tries = 0; charm && tries < deck.length && this.harms(player, deck[0]) && this.luck(charm.chance); tries++) {
      let skipped = deck.shift();
      deck.push(skipped);
      await this.charmed(player, 'log.charmRedraw', { effect: 'redraw', coupon: skipped });
    }
    let id = deck.shift();
    let coupon = COUPONS[id];
    this.log('log.coupon', { player: player.id, coupon: id });
    if (coupon.effect === 'keep') {
      player.coupons[id]++;
      await this.call('coupon', player, id);
      this.log('log.keep', { player: player.id, coupon: id });
      return;
    }
    try {
      await this.call('coupon', player, id);
      await this.applyCoupon(player, coupon);
    } finally {
      this.state.deck.push(id);
    }
  }

  /**
   * 비밀쿠폰의 효과를 이행한다.
   * @param {Object} player 쿠폰을 뽑은 플레이어
   * @param {Object} coupon 쿠폰 정보
   * @returns {Promise<void>}
   */
  async applyCoupon(player, coupon) {
    switch (coupon.effect) {
      case 'gain':
        await this.gain(player, this.money(coupon.amount));
        break;
      case 'pay':
        await this.payBank(player, this.money(coupon.amount));
        break;
      case 'tax':
        await this.payBank(player, this.taxAmount(player, coupon.rates));
        break;
      case 'move':
        await this.moveTo(player, TILES[coupon.target], true);
        await this.arrive(player);
        break;
      case 'back':
        await this.moveBack(player, coupon.steps);
        await this.arrive(player);
        break;
      case 'island':
        await this.moveTo(player, TILES.island, false);
        await this.arrive(player);
        break;
      case 'space':
        await this.moveTo(player, TILES.space, true);
        this.board(player);
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
    let owner = this.state.lands[TILES.concorde].owner;
    if (owner !== null && owner !== player.id && !(await this.payToll(player, TILES.concorde))) return;
    await this.moveTo(player, TILES.taipei, true);
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
   * 무인도에 갇힌 플레이어가 주사위를 굴리기 전에 풀려나는 경우를 처리한다.
   * 무전기가 있으면 사용 여부를 확인하여 즉시 탈출시키고, 3턴 째이면 갇힘을 푼다.
   * 이렇게 먼저 풀려난 뒤에 굴리는 주사위는 일반 주사위와 같다.
   * @param {Object} player 플레이어
   * @returns {Promise<void>}
   */
  async release(player) {
    if (player.island > 1 && player.coupons.radio > 0 && (await this.decide(player, { type: 'radio' }))) {
      player.coupons.radio--;
      this.state.deck.push('radio');
      player.island = 0;
      this.log('log.radio', { player: player.id });
    }
    if (player.island > 1 && this.canUseItem(player, 'radio') && (await this.decide(player, { type: 'itemRadio' }))) {
      this.consumeItem(player, 'radio');
      player.island = 0;
      this.log('log.itemRadio', { player: player.id });
    }
    if (player.island === 1) {
      player.island = 0;
      this.log('log.islandFree', { player: player.id });
    }
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
      this.bankrupt(player, true);
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
   * 한 플레이어의 차례를 진행한다. (주사위 → 이동 → 도착한 칸의 효과)
   * 더블이 나오면 도착한 칸의 처리를 마친 뒤 주사위를 다시 굴리며, 더블이 이어지는 동안 계속 반복한다.
   * 주사위 조작형 아이템의 효과는 그 차례에만 유효하므로, 쓰고도 굴리지 않은 채 차례가 끝나면 사라진다.
   * @param {Object} player 차례인 플레이어
   * @returns {Promise<boolean>} 차례를 마쳤으면 true, 메인 메뉴로 나가면 false
   */
  async playTurn(player) {
    let again = false;
    this.exempt = false;
    if (player.boarded) return this.playTravel(player);
    // 더블이 나오는 동안 주사위를 다시 굴린다.
    do {
      let step = await this.beforeRoll(player, again);
      if (step === QUIT) return false;
      again = step === 'roll' && (await this.playRoll(player));
    } while (again);
    player.loaded = null;
    return true;
  }

  /**
   * 주사위를 굴릴 차례인 플레이어의 답을 받는다. 굴리기 전에 쓰겠다고 한 아이템이 있으면 그 효과를 먼저 적용한다.
   * 주사위 조작형 아이템은 쓴 뒤에 다시 묻고, 우주여행 초청장은 우주여행 칸으로 보내 탑승시킨 뒤 차례를 끝낸다.
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
        this.bankrupt(player, true);
        return 'end';
      }
      let id = typeof answer === 'string' && answer.startsWith(ITEM_PREFIX) ? answer.slice(ITEM_PREFIX.length) : '';
      if (!this.useItem(player, id)) return 'roll';
      if (ITEMS[id].effect !== 'space') continue;
      await this.invite(player);
      return 'end';
    }
  }

  /**
   * 우주여행 초청장 아이템의 효과를 이행한다. 주사위를 굴리지 않고 우주여행 칸으로 이동하여 이용료 없이 탑승한다.
   * 가는 길에 출발지를 지나면 월급을 받으며, 무인도에 갇혀 있었다면 풀려난다.
   * @param {Object} player 초청장을 쓴 플레이어
   * @returns {Promise<void>}
   */
  async invite(player) {
    player.island = 0;
    await this.moveTo(player, TILES.space, true);
    this.board(player);
  }

  /**
   * 주사위를 한 번 굴려 이동하고 도착한 칸의 효과를 적용한다.
   * 무인도에 갇힌 채로 굴린 주사위는 더블이어야만 탈출하여 그 눈대로 이동하며, 이 더블로는 다시 굴리지 않는다.
   * 그 밖의 더블은 다시 굴리되, 파산했거나 무인도에 갇혔거나 우주여행에 탑승한 경우에는 차례가 끝난다.
   * 우대권의 면제 효과는 주사위를 한 번 굴려 진행하는 동안에만 이어진다.
   * @param {Object} player 차례인 플레이어
   * @returns {Promise<boolean>} 더블이 나와 주사위를 한 번 더 굴려야 하면 true
   */
  async playRoll(player) {
    this.exempt = false;
    await this.release(player);
    let trapped = player.island > 0;
    let thrown = this.throwDice(player);
    let dice = thrown.dice;
    let double = dice[0] === dice[1];
    this.state.dice = dice;
    await this.call('dice', player, dice, thrown.faces);
    this.log('log.dice', { player: player.id, a: dice[0], b: dice[1], sum: dice[0] + dice[1] });
    if (thrown.lucky) await this.charmed(player, 'log.charmDouble', { effect: 'double' });
    if (trapped && !double) {
      player.island--;
      this.log('log.islandStay', { player: player.id });
      return false;
    }
    if (trapped) {
      player.island = 0;
      this.log('log.islandDouble', { player: player.id });
    }
    await this.moveBy(player, dice[0] + dice[1], false, true);
    await this.arrive(player);
    if (!double || trapped || !player.alive || player.island > 0 || player.boarded) return false;
    this.log('log.double', { player: player.id });
    return true;
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
   * @param {Object} [options] 선택 사항 { storage : 저장소 객체, timings : 연출 시간(밀리초) 덮어쓰기, random : 부적 추첨에 쓸 난수 함수 }
   */
  constructor(root, options) {
    super();
    let config = options || {};
    this.root = root;
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
    this.again = false;
    this.intro = false;
    this.cards = [];
    this.cardOrder = '';
    this.lots = [];
    this.lotState = [];
    this.couponGate = null;
    this.request = null;
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
   * 저장된 설정을 불러오고(없으면 시스템 설정을 탐지하고) 입력 처리를 연결한 뒤 메인 메뉴를 보여준다.
   * @returns {HellmarbleApp} 자기 자신
   */
  start() {
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
      case 'game.travel': this.answer('travel', Number(value)); break;
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
   * 칸의 표시 이름을 구한다.
   * @param {number} index 칸 번호
   * @returns {string} 칸 이름
   */
  tileName(index) {
    return this.t('tile.' + BOARD[index].id);
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
    if (saved && !(await this.confirm(this.t('slot.overwriteTitle'), this.t('slot.overwrite', { n: index + 1 })))) return;
    if (this.screen === 'slots') this.showName(index);
  }

  /**
   * 불러오기 화면에서 슬롯을 눌렀을 때의 선택지를 제공한다.
   * 데이터가 있는 슬롯은 불러오기 / 삭제 / 취소, 빈 슬롯은 JSON 불러오기 / 취소 가운데 고른다.
   * 취소하면 불러오기 화면에 그대로 남고, 삭제는 한 번 더 확인받은 뒤 슬롯을 비운다.
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
      buttons: [{ label: this.t('load.load'), value: 'load', primary: true }, { label: this.t('load.delete'), value: 'delete' }, { label: this.t('load.cancel'), value: 'cancel' }],
    });
    if (this.screen !== 'slots') return;
    if (answer === 'load') {
      this.slotIndex = index;
      this.slot = saved;
      if (saved.game) this.showGame(false);
      else this.showLobby();
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
      failure = this.t(error && error.message === 'parse' ? 'import.failParse' : 'import.failData');
    }
    if (failure !== '') await this.dialog({ title: this.t('import.failTitle'), text: failure, buttons: [{ label: this.t('common.ok'), value: 'ok', primary: true }] });
    if (this.screen === 'slots') this.showSlots('load');
  }

  /**
   * 현재 슬롯의 저장 데이터를 JSON 텍스트로 바꿔 클립보드에 복사한다.
   * 복사할 수 없는 브라우저에서는 직접 복사할 수 있도록 내용을 창에 보여준다.
   * @returns {Promise<void>}
   */
  async exportSlot() {
    if (this.screen !== 'lobby' || !this.slot) return;
    let text = JSON.stringify(this.slot, null, 2);
    let copied = await copyText(text);
    if (this.screen !== 'lobby') return;
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
   * 새 슬롯은 기본 색상 5종과 기본 모양 4종을 가지며, 빨강과 별을 장착한 채로 시작한다. 부적은 가지고 있지 않다.
   */
  submitName() {
    if (this.screen !== 'name') return;
    let input = this.root.querySelector('.hm-input');
    let name = (input ? input.value : '').trim().slice(0, NAME_LIMIT) || this.t('name.default');
    this.slotIndex = this.pendingSlot;
    this.slot = { name, money: LOBBY_MONEY, items: emptyItems(), equips: starterEquips(), charms: fillCharms(undefined), equipped: { ...DEFAULT_LOOK, charm: null }, game: null, updated: 0 };
    this.saveSlot();
    this.showLobby();
  }

  /**
   * 대기실을 보여준다. 보유 금액, 장착한 색상과 모양(내 말), 보유 아이템 수, 세 가지 리그, 상점과 아이템 확인, 메인 메뉴 버튼이 있다.
   */
  showLobby() {
    this.leaveGame();
    this.screen = 'lobby';
    let totals = this.itemTotals('lobby');
    let look = this.slot.equipped;
    let cards = [];
    // 리그마다 참여 카드를 만든다.
    for (let id in LEAGUES) cards.push(this.buildLeagueCard(id));
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
        el('div', { class: 'hm-leagues' }, cards),
        el('p', { class: 'hm-note', text: this.t('lobby.note') }),
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
   * 리그 하나의 참여 카드를 만든다.
   * @param {string} id 리그 식별자
   * @returns {HTMLElement} 리그 카드
   */
  buildLeagueCard(id) {
    let league = LEAGUES[id];
    return el('div', { class: 'hm-league', style: { '--hm-league': league.color } }, [
      el('h2', { class: 'hm-league-name', text: this.t('league.' + id) }),
      this.infoRow(this.t('lobby.fee'), this.figure(START_CASH * league.multiplier)),
      this.infoRow(this.t('lobby.multiplier'), this.t('lobby.times', { n: league.multiplier })),
      el('p', { class: 'hm-league-rivals', text: this.t('league.' + id + '.rivals') }),
      button(this.t('lobby.join'), 'lobby.join', id, 'hm-primary hm-wide'),
    ]);
  }

  /**
   * 리그 참여를 처리한다. 색상과 모양을 하나씩 장착했는지, 돈이 충분한지 확인하고, 한 번 더 확인받은 뒤 참가비를 차감하고 게임을 시작한다.
   * 장착한 색상과 모양이 게임에서 사용자의 생김새가 되고, 부적을 장착했으면 그 효과가 게임 내내 적용된다.
   * 대기실의 소모형 아이템은 모두 게임으로 옮겨지며, 게임이 끝나면 쓰지 않고 남은 것이 돌아온다. (`finishGame`)
   * @param {string} id 리그 식별자
   * @returns {Promise<void>}
   */
  async joinLeague(id) {
    if (this.screen !== 'lobby' || !LEAGUES[id]) return;
    let fee = START_CASH * LEAGUES[id].multiplier;
    let params = { league: this.t('league.' + id), fee: this.money(fee), money: this.money(this.slot.money) };
    if (!this.slot.equipped.color || !this.slot.equipped.shape) {
      await this.dialog({ title: this.t('lobby.shortTitle'), text: this.t('lobby.needLook'), buttons: [{ label: this.t('common.ok'), value: 'ok', primary: true }] });
      return;
    }
    if (this.slot.money < fee) {
      await this.dialog({ title: this.t('lobby.shortTitle'), text: this.t('lobby.short', params), buttons: [{ label: this.t('common.ok'), value: 'ok', primary: true }] });
      return;
    }
    if (!(await this.confirm(this.t('lobby.confirmTitle'), this.t('lobby.confirm', params)))) return;
    if (this.screen !== 'lobby') return;
    this.slot.money -= fee;
    this.slot.game = HellmarbleGame.create({ league: id, name: this.slot.name, items: this.slot.items, look: this.slot.equipped, charm: this.slot.equipped.charm });
    this.slot.items = emptyItems();
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
   * @param {string} id 부적 식별자
   * @param {string} part 문구의 종류 ('brief', 'description', 'when')
   * @returns {string} 문구
   */
  charmText(id, part) {
    let charm = CHARMS[id];
    let params = { chance: charm.chance, percent: charm.percent, total: Math.round((100 / 6 + charm.chance) * 10) / 10, building: charm.building ? this.t('building.' + charm.building) : '' };
    if (part === 'when') return this.t('charm.when');
    return this.t('charm.' + charm.effect + '.' + (part === 'description' && charm.revisit ? 'revisit' : part), params);
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
   * 게임 중에는 소모형 아이템만 다룬다. (게임 중에는 생김새와 부적을 바꿀 수 없다.)
   * @param {string} source 창의 종류 ('shop', 'lobby', 'game')
   * @returns {string[]} 아이템 식별자 목록
   */
  itemIds(source) {
    return source === 'game' ? Object.keys(ITEMS) : [...Object.keys(ITEMS), ...Object.keys(EQUIPS), ...Object.keys(CHARM_TICKETS), ...Object.keys(CHARMS)];
  }

  /**
   * 아이템을 몇 개 가지고 있는지 구한다. 게임 중에는 게임에 가져간 것을, 대기실에서는 슬롯에 보관한 것을 센다.
   * 색상과 모양은 가지고 있으면 1 이고, 부적 추첨권은 사는 즉시 쓰이므로 언제나 0 이다.
   * @param {string} source 창의 종류 ('shop', 'lobby', 'game')
   * @param {string} id 아이템 식별자
   * @returns {number} 가진 개수
   */
  itemStock(source, id) {
    switch (this.itemKind(id)) {
      case 'charm': return source === 'game' ? 0 : this.slot.charms[id];
      case 'ticket': return 0;
      case 'look': return source === 'game' ? 0 : this.slot.equips[id];
      default: return source === 'game' ? this.game.state.players[0].items[id] : this.slot.items[id];
    }
  }

  /**
   * 가진 아이템의 종류 수와 전체 개수를 센다. 대기실에서는 색상과 모양, 부적도 함께 센다.
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
      default: return itemsOfLimit(ITEMS[id].limit).length > 1 ? this.t('item.limit.shared', { items: this.itemGroupText(ITEMS[id].limit) }) : this.t('item.limit.single');
    }
  }

  /**
   * 아이템을 지금 장착하고 있는지 확인한다. 부적의 장착 여부는 아이템 확인 창에서만 알려준다.
   * @param {string} source 창의 종류 ('shop', 'lobby', 'game')
   * @param {string} id 아이템 식별자
   * @returns {boolean} 장착하고 있으면 true
   */
  itemWorn(source, id) {
    if (source === 'game') return false;
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
    let player = this.game.state.players[0];
    let item = ITEMS[id];
    if (player.usedItems[item.limit]) return itemsOfLimit(item.limit).length > 1 ? this.t('item.block.shared', { items: this.itemGroupText(item.limit) }) : this.t('item.block.spent');
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
    // 이 창이 다루는 아이템의 분류마다 아이템의 수를 0부터 센다. (게임 중에는 색상, 모양, 부적 분류가 없다.)
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
      el('p', { class: 'hm-modal-text hm-items-hint', text: shop ? this.t('store.hint', { n: ITEM_SELL_PERCENT }) : this.t('item.hint.' + view.source) }),
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
    let spent = kind === 'item' && view.source === 'game' && this.game.state.players[0].usedItems[ITEMS[id].limit];
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
    if (kind === 'look' || (kind === 'charm' && view.source === 'lobby')) rows.push(this.infoRow(this.t('equip.info.state'), this.t(worn ? 'equip.on' : 'equip.off'), worn));
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
    if (game) {
      let spent = this.game.state.players[0].usedItems[ITEMS[id].limit];
      reason = this.itemBlock(id);
      rows.push(this.infoRow(this.t('item.info.state'), this.t(spent ? 'item.state.spent' : 'item.state.ready'), true));
    }
    if (game && ITEMS[id].use === 'turn') {
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
    this.cards = [];
    this.cardOrder = '';
    this.game = new HellmarbleGame(this.slot.game, this);
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
    // 건물을 지을 수 있는 일반 도시마다, 건물이 세워질 터를 칸의 보드 안쪽에 만든다.
    for (let index = 0; index < BOARD_SIZE; index++) {
      this.lots.push(BOARD[index].type === 'city' ? this.buildLot(index) : null);
      if (this.lots[index]) board.append(this.lots[index]);
    }
    this.mount(el('div', { class: 'hm-game' }, [el('div', { class: 'hm-board-wrap' }, [board]), this.buildSide()]));
    this.refresh();
    this.runGame(intro);
  }

  /**
   * 도시 한 칸의 건물이 세워질 터를 만든다.
   * 터는 칸에서 보드 중앙 쪽으로 바로 붙은 격자 자리에 놓이며, 건물은 그 위에 똑바로 서 있는 모습으로 그려진다.
   * 모서리 옆의 옆줄 칸(위에서 둘째 줄, 아래에서 둘째 줄)은 윗줄, 아랫줄 칸의 터와 같은 자리를 쓰므로 위아래로 비켜 놓는다.
   * @param {number} index 칸 번호
   * @returns {HTMLElement} 건물 터 요소
   */
  buildLot(index) {
    let place = placeTile(index);
    let flank = place.side === 'left' || place.side === 'right';
    let row = place.side === 'bottom' ? 10 : place.side === 'top' ? 2 : place.row;
    let column = place.side === 'left' ? 2 : place.side === 'right' ? 10 : place.column;
    let shift = flank && place.row === 2 ? ' hm-lot-low' : flank && place.row === 10 ? ' hm-lot-high' : '';
    return el('div', { class: 'hm-lot hm-lot-' + place.side + shift, data: { tile: index }, style: { 'grid-row': row, 'grid-column': column }, attrs: { 'aria-hidden': 'true' } });
  }

  /**
   * 도시 한 칸의 터에 지어진 건물을 그린다. 건물 구성이 바뀌었을 때에만 다시 그리며, 방금 새로 지은 건물은 솟아오르는 움직임을 준다.
   * @param {number} index 칸 번호
   */
  refreshLot(index) {
    let lot = this.lots[index];
    let before = this.lotState[index];
    if (!lot) return;
    let land = this.game.state.lands[index];
    let key = land.owner === null ? '' : [land.owner, land.villa, land.building, land.hotel].join(':');
    if (before && before.key === key) return;
    let houses = [];
    // 건물 종류별로 지어진 개수만큼 건물을 세운다.
    for (let kind of BUILDINGS) {
      // 같은 종류의 건물을 한 채씩 만든다.
      for (let count = 0; count < land[kind]; count++) {
        let fresh = Boolean(before) && before.owner === land.owner && count >= before[kind];
        houses.push(el('span', { class: 'hm-house hm-house-' + kind + (fresh ? ' hm-house-new' : '') }));
      }
    }
    lot.replaceChildren(...houses);
    if (land.owner !== null) lot.style.setProperty('--hm-owner', this.styleOf(this.game.state.players[land.owner]).color);
    this.lotState[index] = { key, owner: land.owner, villa: land.villa, building: land.building, hotel: land.hotel };
  }

  /**
   * 보드의 칸 하나를 만든다. 땅의 색상은 보드 중앙을 바라보는 쪽 테두리에 표시된다.
   * @param {number} index 칸 번호
   * @returns {Object} 칸을 이루는 요소 묶음 { node, sub, owner, tokens }
   */
  buildTile(index) {
    let tile = BOARD[index];
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
      el('div', { class: 'hm-fund' }, [el('span', { text: ICONS.fund + ' ' + this.t('game.fund') }), parts.fund]),
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
   * 승패와 관계없이 게임에서 쓰지 않고 남은 소모형 아이템은 대기실의 주머니로 돌려준다. (사용한 아이템만 사라진다.)
   * 정산을 저장한 뒤, 결과 화면을 거쳐 대기실로 돌아간다.
   * @param {HellmarbleGame} game 끝난 게임
   * @returns {Promise<void>}
   */
  async finishGame(game) {
    let human = game.state.players[0];
    let won = game.state.winner === human.id;
    let cash = human.cash;
    let property = game.propertyValue(human);
    this.slot.money += won ? cash + property : 0;
    this.slot.items = addItems(this.slot.items, human.items);
    this.slot.game = null;
    this.saveSlot();
    this.refresh();
    let leave = [{ label: this.t('result.lobby'), value: 'ok', primary: true }];
    if (won) {
      let rows = [
        this.infoRow(this.t('result.cash'), this.figure(cash)),
        this.infoRow(this.t('result.property'), this.figure(property)),
        this.infoRow(this.t('result.reward'), this.figure(cash + property, '+'), true),
      ];
      await this.dialog({ kind: 'win', title: this.t('result.win.title'), text: this.t('result.win.text'), body: [el('div', { class: 'hm-land-rows' }, rows)], buttons: leave });
    } else {
      await Promise.race([this.dialog({ kind: 'lose', title: this.t('result.lose.title'), text: this.t('result.lose.text'), buttons: leave }), wait(this.timings.result)]);
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
   * 가운데 영역의 주사위 두 개를 지정한 눈으로 그린다.
   * @param {number} first 첫째 주사위의 눈
   * @param {number} second 둘째 주사위의 눈
   */
  renderDice(first, second) {
    this.parts.dice.replaceChildren(this.buildDie(first), this.buildDie(second));
  }

  /**
   * 가운데 영역(차례, 주사위, 안내 문구, 버튼, 사회복지기금)을 갱신한다.
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
    this.parts.menu.disabled = this.mode === 'busy';
    this.parts.forfeit.disabled = this.mode === 'busy';
    this.parts.fund.textContent = this.money(state.fund);
    this.parts.center.classList.toggle('hm-my-turn', this.mode !== 'busy');
    if (!this.rolling) this.renderDice(state.dice[0], state.dice[1]);
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
    if (this.mode === 'travel') return this.t('hint.travel');
    if (this.mode === 'roll' && player.island > 1) return this.t('hint.island', { n: player.island - 1 }) + loaded;
    if (this.mode === 'roll' && player.island === 1) return this.t('hint.release') + loaded;
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
      if (player.island > 0) badges.push(this.t('player.island', { n: player.island - 1 }));
      if (player.boarded) badges.push(this.t('player.boarded'));
      if (player.loaded) badges.push(ITEMS[player.loaded].icon + ' ' + this.itemName(player.loaded));
      // 보관 중인 쿠폰을 종류별로 표시한다.
      for (let coupon in player.coupons) {
        if (player.coupons[coupon] > 0) badges.push(ICONS[coupon] + ' ' + this.t('coupon.' + coupon + '.title') + ' ×' + player.coupons[coupon]);
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
    // 보관 중인 쿠폰을 종류별로 모은다.
    for (let coupon in player.coupons) {
      if (player.coupons[coupon] > 0) coupons.push(ICONS[coupon] + ' ' + this.t('coupon.' + coupon + '.title') + ' ×' + player.coupons[coupon]);
    }
    // 소유한 땅마다 상세 화면으로 가는 버튼을 만든다.
    for (let index of owned) {
      let land = game.state.lands[index];
      let name = this.tileName(index);
      // 지어진 건물을 종류별 개수만큼 이름 뒤에 덧붙인다.
      for (let kind of BUILDINGS) name += ICONS[kind].repeat(land[kind]);
      lands.push(el('button', { class: 'hm-land-item', data: { action: 'dialog.answer', value: 'land:' + index }, attrs: { type: 'button' }, style: { '--hm-land': LAND_COLORS[BOARD[index].show] } }, [
        el('span', { class: 'hm-land-item-name', text: name }),
        el('span', { class: 'hm-land-item-toll' }, [this.t('info.toll') + ' ', this.figure(game.toll(index))]),
      ]));
    }
    let status = !player.alive ? this.t('player.bankrupt') : player.island > 0 ? this.t('player.island', { n: player.island - 1 }) : player.boarded ? this.t('player.boarded') : this.t('playerinfo.playing');
    return {
      kind: 'player', title: this.styleOf(player).symbol + ' ' + this.playerName(player),
      body: [
        el('div', { class: 'hm-land-rows hm-player-assets', style: { '--hm-player': this.styleOf(player).color } }, [
          this.infoRow(this.t('result.cash'), this.figure(player.cash)),
          this.infoRow(this.t('result.property'), this.figure(game.propertyValue(player))),
          this.infoRow(this.t('playerinfo.assets'), this.figure(game.assets(player)), true),
          this.infoRow(this.t('playerinfo.coupons'), coupons.length > 0 ? coupons.join('  ') : this.t('common.none')),
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
      else if (name === 'tile') params[name] = this.tileName(value);
      else if (name === 'amount') params[name] = this.money(value);
      else if (name === 'coupon') params[name] = this.t('coupon.' + value + '.title');
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
    let tile = BOARD[index];
    let land = game.state.lands[index];
    let prices = [];
    let status = [];
    if (land) {
      prices.push(this.infoRow(this.t('info.price'), this.figure(game.price(index))));
      // 일반 도시이면 건물 종류별 건설비를 넣는다.
      for (let kind of tile.cost ? BUILDINGS : []) {
        prices.push(this.infoRow(ICONS[kind] + ' ' + this.t('info.cost', { building: this.t('building.' + kind) }), this.figure(game.buildCost(index, kind))));
      }
      prices.push(this.infoRow(this.t('info.toll'), this.figure(game.money(tile.toll))));
      // 일반 도시이면 건물 종류별 이용료를 넣는다.
      for (let kind of tile.fee ? BUILDINGS : []) {
        prices.push(this.infoRow(ICONS[kind] + ' ' + this.t(kind === 'villa' ? 'info.feeEach' : 'info.fee', { building: this.t('building.' + kind) }), this.figure(game.money(tile.fee[kind]))));
      }
      if (index === TILES.columbia) prices.push(this.infoRow(this.t('info.spaceFee'), this.figure(game.money(SPACE_FEE))));
      status.push(this.infoRow(this.t('info.owner'), this.ownerLabel(land.owner)));
      if (tile.cost) status.push(this.infoRow(this.t('info.buildings'), this.buildingText(land)));
      status.push(this.infoRow(this.t('info.total'), this.figure(game.toll(index)), true));
      if (land.owner !== null) status.push(this.infoRow(this.t('info.sale', { n: SELL_PERCENT }), this.figure(game.saleValue(index))));
    }
    if (tile.type === 'start') prices.push(this.infoRow(this.t('info.salary'), this.figure(game.money(SALARY))));
    if (tile.type === 'space') {
      prices.push(this.infoRow(this.t('info.spaceFee'), this.figure(game.money(SPACE_FEE))));
      status.push(this.infoRow(this.tileName(TILES.columbia) + ' ' + this.t('info.owner'), this.ownerLabel(game.state.lands[TILES.columbia].owner)));
    }
    if (tile.type === 'desk') prices.push(this.infoRow(this.t('info.welfare'), this.figure(game.money(WELFARE_FEE))));
    if (tile.type === 'desk' || tile.type === 'fund') status.push(this.infoRow(this.t('info.fund'), this.figure(game.state.fund), true));
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
   * 칸 위에 확대된 땅 정보 창을 연다. 우주여행의 목적지를 고르는 중이면 이동 버튼도 함께 보여준다.
   * @param {number} index 칸 번호
   */
  openPopover(index) {
    this.closePopover();
    let travel = this.mode === 'travel' && index !== this.game.current.position;
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
    let result = null;
    try {
      switch (key) {
        case 'get_rules': result = this.t('mcp.rules', amounts) + '\n' + this.t('mcp.items.rules', amounts) + '\n' + this.itemRules() + '\n' + this.t('mcp.equips.rules', amounts) + '\n' + this.equipRules() + '\n' + this.charmRules(); break;
        case 'get_guide': result = this.t('mcp.guide') + '\n' + this.t('mcp.items.guide') + '\n' + this.t('mcp.equips.guide') + '\n' + this.t('mcp.charms.guide'); break;
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
   * 아이템마다 이름, 가격, 설명, 사용 시점을 한 줄씩 정리한다. (WebMCP 의 플레이 방법 설명에 덧붙인다.)
   * @returns {string} 아이템 목록 설명
   */
  itemRules() {
    let lines = [];
    // 아이템마다 설명 한 줄을 만든다.
    for (let id in ITEMS) {
      lines.push(this.t('mcp.items.entry', { item: this.itemName(id), price: this.money(ITEMS[id].price), description: this.t('item.' + id + '.description'), when: this.t('item.' + id + '.when') }));
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
    let params = { ticket: this.money(CHARM_TICKETS.charmticket.price), ticket10: this.money(CHARM_TICKETS.charmticket10.price), odds: this.drawOdds(), sells: sells.join(', ') };
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
    let field = scope.querySelector('.hm-input');
    let state = { screen: this.screen, language: this.settings.language, dark: this.settings.dark, busy: this.isBusy(), title: heading ? heading.textContent : '' };
    if (this.modal) state.dialog = { title: state.title, text: text ? text.textContent : '' };
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
        position: player.position, tile: this.tileName(player.position), island: player.island, boarded: player.boarded, coupons: player.coupons,
        items: player.items, usedItems: player.usedItems, loaded: player.loaded, look: player.look, color: this.styleOf(player).color, symbol: this.styleOf(player).symbol, charm: player.charm,
      });
    }
    // 소유자가 있는 땅을 정리한다.
    for (let index = 0; index < BOARD_SIZE; index++) {
      let land = state.lands[index];
      if (land && land.owner !== null) lands.push({ index, name: this.tileName(index), owner: land.owner, villa: land.villa, building: land.building, hotel: land.hotel, toll: game.toll(index) });
    }
    // 최근 진행 기록을 문장으로 바꾼다.
    for (let entry of this.intro ? [] : state.logs.slice(-8)) logs.push(this.describe(entry));
    return {
      league: state.league, multiplier: state.multiplier, mode: this.mode, ordering: this.intro, turnOf: game.current.id, again: this.mode === 'roll' && this.again,
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
    let tile = BOARD[index];
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
    // 일반 도시이면 건물 종류별 건설비와 이용료를 넣는다.
    for (let kind of tile.cost ? BUILDINGS : []) {
      info[kind] = { cost: tile.cost[kind] * multiplier, fee: tile.fee[kind] * multiplier, limit: BUILD_LIMIT[kind], built: land ? land[kind] : 0 };
    }
    if (index === TILES.columbia || index === TILES.space) info.spaceFee = SPACE_FEE * multiplier;
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
   * @param {Object} player 차례가 된 플레이어
   * @returns {Promise<void>}
   */
  async turnStart(player) {
    this.moving = -1;
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
    await this.rollDice(dice, faces);
    await wait(this.timings.pause);
  }

  /**
   * 가운데 영역의 주사위가 구르는 모습을 정해진 시간 동안 보여준 뒤 지정한 눈에서 멈춘다.
   * @param {number[]} dice 멈췄을 때 보일 두 주사위의 눈
   * @param {number[]|null} [faces] 구르는 동안 보여줄 눈의 목록 (생략하면 1~6)
   * @returns {Promise<void>}
   */
  async rollDice(dice, faces) {
    let until = Date.now() + this.timings.dice;
    let shown = faces && faces.length > 0 ? faces : [1, 2, 3, 4, 5, 6];
    this.rolling = true;
    this.parts.dice.classList.add('hm-rolling');
    // 정해진 시간 동안 임의의 눈을 번갈아 보여준다.
    while (Date.now() < until) {
      this.renderDice(shown[Math.floor(Math.random() * shown.length)], shown[Math.floor(Math.random() * shown.length)]);
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
    let coupon = COUPONS[id];
    let gate = defer();
    let params = {};
    if (coupon.amount) params.amount = this.money(this.game.money(coupon.amount));
    // 건물별 금액이 있는 쿠폰은 종류별 금액을 문구에 넣는다.
    for (let kind in coupon.rates || {}) params[kind] = this.money(this.game.money(coupon.rates[kind]));
    let card = el('div', { class: 'hm-coupon', style: { '--hm-coupon-time': this.timings.coupon + 'ms', '--hm-player': this.styleOf(player).color } }, [
      el('div', { class: 'hm-coupon-head', text: ICONS.coupon + ' ' + this.t('coupon.header') }),
      el('div', { class: 'hm-coupon-title', text: this.t('coupon.' + id + '.title') }),
      el('p', { class: 'hm-coupon-text', text: this.t(coupon.effect === 'tax' ? 'coupon.tax.text' : 'coupon.' + id + '.text', params) }),
      el('div', { class: 'hm-coupon-drawer' }, [this.buildLookToken(player.look), this.t('coupon.drawer', { player: this.playerName(player) })]),
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
   * @param {Object|string} payer 돈을 내는 쪽 (플레이어, 은행이면 BANK, 사회복지기금 본부이면 FUND)
   * @param {Object|string} receiver 돈을 받는 쪽 (플레이어, 은행이면 BANK, 사회복지기금 본부이면 FUND)
   * @param {number} amount 건넨 금액 (원)
   * @returns {Promise<void>}
   */
  async transfer(payer, receiver, amount) {
    let offices = [this.officeTile(payer), this.officeTile(receiver)];
    let office = offices[0] >= 0 ? payer : offices[1] >= 0 ? receiver : null;
    let duration = office ? this.timings.bank : this.timings.transfer;
    if (!(duration > 0) || !this.game || !this.parts.center) return;
    let banner = el('div', { class: 'hm-transfer' + (office ? ' hm-transfer-' + office : ''), style: { '--hm-time': duration + 'ms' }, attrs: { role: 'status' } }, [
      this.transferSide(payer),
      el('span', { class: 'hm-transfer-arrow', text: '➜' }),
      this.transferSide(receiver),
      el('strong', { class: 'hm-transfer-amount', text: this.money(amount) }),
    ]);
    let flying = this.flyBills(payer, receiver, amount, duration);
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
    if (party === BANK) return TILES.start;
    if (party === FUND) return TILES.fund;
    return -1;
  }

  /**
   * 돈 이동 안내 띠에 넣을, 돈을 내거나 받는 쪽의 표시를 만든다. 플레이어는 말과 이름, 은행과 사회복지기금 본부는 그림 문자와 이름이다.
   * @param {Object|string} party 플레이어, 또는 은행(BANK)·사회복지기금 본부(FUND)
   * @returns {HTMLElement} 만들어진 요소
   */
  transferSide(party) {
    if (this.officeTile(party) < 0) return el('span', { class: 'hm-transfer-side' }, [this.buildToken(party), this.playerName(party)]);
    return el('span', { class: 'hm-transfer-side' }, [
      el('span', { class: 'hm-transfer-icon', text: party === BANK ? ICONS.bank : ICONS.fund, attrs: { 'aria-hidden': 'true' } }),
      this.t(party === BANK ? 'game.bank' : 'tile.fund'),
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
   * 내는 플레이어에게는 빠져나간 금액을, 받는 쪽에는 들어온 금액을 띄운다.
   * 은행이나 사회복지기금 본부가 내는 쪽일 때에는 그 칸에 금액을 띄우지 않는다. (월급처럼 받는 플레이어가 같은 칸에 서 있는 경우가 많아 겹치기 때문이다.)
   * 움직임을 줄이도록 설정한 사용자에게는 금액 표시만 보여주며, 움직임 기능이 없는 브라우저에서는 건너뛴다.
   * @param {Object|string} payer 돈을 내는 쪽 (플레이어, 은행이면 BANK, 사회복지기금 본부이면 FUND)
   * @param {Object|string} receiver 돈을 받는 쪽 (플레이어, 은행이면 BANK, 사회복지기금 본부이면 FUND)
   * @param {number} amount 건넨 금액 (원)
   * @param {number} duration 연출 전체의 시간 (밀리초)
   * @returns {HTMLElement[]} 화면에 띄운 요소 목록 (연출이 끝나면 치워야 한다.)
   */
  flyBills(payer, receiver, amount, duration) {
    let nodes = [];
    try {
      let from = this.partyPoint(payer);
      let to = this.partyPoint(receiver);
      let distance = Math.hypot(to.x - from.x, to.y - from.y);
      let count = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 6 + Math.min(10, Math.round((amount / this.game.money(START_CASH)) * 40));
      if (this.officeTile(payer) < 0) nodes.push(el('span', { class: 'hm-float hm-float-pay', text: '-' + this.money(amount), style: { left: from.x + 'px', top: from.y + 'px', '--hm-time': duration + 'ms' } }));
      nodes.push(el('span', { class: 'hm-float hm-float-get', text: '+' + this.money(amount), style: { left: to.x + 'px', top: to.y + 'px', '--hm-time': duration + 'ms' } }));
      // 지폐를 한 장씩 만들어 조금씩 다른 길로, 시차를 두고 날린다.
      for (let index = 0; index < count; index++) {
        let bill = el('span', { class: 'hm-bill', text: '₩', style: { left: from.x + 'px', top: from.y + 'px', 'font-size': Math.max(11, from.size * 0.2) + 'px' } });
        let sway = (index % 2 === 0 ? 1 : -1) * (10 + ((index * 17) % 40));
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
   * 사용자가 장착한 부적의 효과가 일어난 것을 보드 가운데에 잠깐 크게 보여준다. 부적의 등급에 따라 빛의 색이 다르다.
   * 땅값 할인은 원래 가격에 줄을 긋고 깎인 가격을 함께 보여주며, 이 연출이 끝난 뒤에 깎인 금액만 빠져나간다.
   * 부적은 아이템 확인 창에서만 보이므로, 게임 화면에는 효과가 일어난 이 순간과 진행 기록에만 나타난다.
   * @param {Object} player 부적을 장착한 플레이어
   * @param {Object} info 일어난 효과 { effect, charm } 와 효과별 값 (discount : index, price, paid / build : index, building / redraw : coupon)
   * @returns {Promise<void>}
   */
  async charm(player, info) {
    let duration = this.timings.charm;
    let charm = CHARMS[info.charm];
    void player;
    if (!(duration > 0) || !charm || !this.game || !this.parts.center) return;
    let params = {
      tile: info.index === undefined ? '' : this.tileName(info.index), percent: charm.percent,
      building: info.building ? this.t('building.' + info.building) : '', coupon: info.coupon ? this.t('coupon.' + info.coupon + '.title') : '',
    };
    let banner = el('div', { class: 'hm-charm-flash hm-grade-' + charm.grade, style: { '--hm-time': duration + 'ms' }, attrs: { role: 'status' } }, [
      el('span', { class: 'hm-charm-flash-icon', text: charm.icon, attrs: { 'aria-hidden': 'true' } }),
      el('strong', { class: 'hm-charm-flash-title', text: this.t('charm.flash', { item: this.itemName(info.charm) }) }),
      el('span', { class: 'hm-charm-flash-text', text: this.t('charm.flash.' + info.effect, params) }),
      info.effect === 'discount' ? el('span', { class: 'hm-charm-flash-price' }, [el('s', { class: 'hm-num', text: this.money(info.price) }), el('span', { text: '➜' }), this.figure(info.paid)]) : null,
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
      case 'pass': return this.askCoupon('pass', { tile: this.tileName(request.index), amount: this.money(request.amount), n: player.coupons.pass });
      case 'radio': return this.askCoupon('radio', { n: player.coupons.radio });
      case 'itemPass': return this.askGameItem('pass', request);
      case 'itemRadio': return this.askGameItem('radio', request);
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
   * @param {string} mode 기다릴 입력의 종류 ('roll' 또는 'travel')
   * @param {boolean} [again] 더블이 나와 주사위를 한 번 더 굴리는 것인지 여부
   * @returns {Promise<*>} 입력 결과 (메인 메뉴로 나가면 QUIT)
   */
  awaitInput(mode, again) {
    this.closePopover();
    this.waiting = defer();
    this.mode = mode;
    this.again = Boolean(again);
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
   * 자기 도시에 지을 건물을 묻는다. 건설하지 않고 넘어가는 선택지도 제공한다.
   * @param {Object} player 사용자 플레이어
   * @param {Object} request 건설 요청 { index, options }
   * @returns {Promise<string|null>} 지을 건물의 종류 (짓지 않으면 null)
   */
  async askBuild(player, request) {
    let land = this.game.state.lands[request.index];
    let buttons = [];
    // 건물 종류별로 선택지를 만든다. 지을 수 없는 건물은 이유와 함께 비활성화한다.
    for (let kind of BUILDINGS) {
      let params = { building: ICONS[kind] + ' ' + this.t('building.' + kind), amount: this.money(this.game.buildCost(request.index, kind)) };
      let key = land[kind] >= BUILD_LIMIT[kind] ? 'ask.build.max' : request.options.includes(kind) ? 'ask.build.option' : 'ask.build.short';
      buttons.push({ label: this.t(key, params), value: kind, primary: true, disabled: !request.options.includes(kind) });
    }
    buttons.push({ label: this.t('ask.build.no'), value: 'skip' });
    let answer = await this.dialog({ title: this.t('ask.build.title'), text: this.t('ask.build.text'), body: [this.buildLandInfo(request.index), this.cashLine(player)], buttons, stack: true });
    return BUILDINGS.includes(answer) ? answer : null;
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
        let land = game.state.lands[index];
        let name = this.tileName(index);
        // 지어진 건물을 종류별 개수만큼 이름 뒤에 덧붙인다.
        for (let kind of BUILDINGS) name += ICONS[kind].repeat(land[kind]);
        buttons.push({ label: this.t('ask.sell.option', { tile: name, amount: this.money(game.saleValue(index)) }), value: index });
      }
      buttons.push({ label: this.t('game.forfeit'), value: FORFEIT, danger: true });
      let params = { amount: this.money(request.amount), cash: this.money(player.cash), short: this.money(request.amount - player.cash), n: SELL_PERCENT };
      let answer = await this.dialog({ kind: 'sell', title: this.t('ask.sell.title'), text: this.t('ask.sell.text', params), buttons, stack: true });
      if (answer !== FORFEIT) return Number(answer);
      if (await this.confirm(this.t('confirm.forfeit.title'), this.t('confirm.forfeit.text'), this.t('confirm.forfeit.yes'), this.t('common.no'))) return FORFEIT;
    }
  }

  /**
   * 보관 중인 쿠폰(우대권 또는 무전기)의 사용 여부를 묻는다.
   * @param {string} id 쿠폰 식별자 ('pass' 또는 'radio')
   * @param {Object} params 문구에 끼워 넣을 값
   * @returns {Promise<boolean>} 사용 여부
   */
  askCoupon(id, params) {
    return this.confirm(ICONS[id] + ' ' + this.t('ask.' + id + '.title'), this.t('ask.' + id + '.text', params), this.t('ask.use'), this.t('ask.keep'));
  }

  /**
   * 비밀쿠폰과 따로 보유한 아이템으로 통행료를 면제하거나 무인도에서 탈출할지 묻는다.
   * @param {string} id 아이템 식별자
   * @param {Object} request 통행료 요청 정보 (무전기이면 빈 객체)
   * @returns {Promise<boolean>} 아이템을 사용하면 true
   */
  askGameItem(id, request) {
    let params = request.travel ? { amount: this.money(request.amount), tile: this.t('tile.space') } : { amount: this.money(request.amount || 0), tile: this.tileName(request.index || 0) };
    return this.confirm(this.t('item.use.' + id + '.title'), this.t('item.use.' + id + '.text', params), this.t('ask.use'), this.t('ask.keep'));
  }
}

/* ==========================================================================
 * 10. 초기화
 * ========================================================================== */

/**
 * Hellmarble 을 초기화하여 메인 메뉴를 보여준다. HTML 에서 이 함수를 호출해야 게임이 시작된다.
 * @param {HTMLElement|string} root 게임 화면을 그릴 요소 또는 그 요소의 CSS 선택자
 * @param {Object} [options] 선택 사항
 * @param {Object} [options.storage] 저장소 객체. read(key), write(key, value), remove(key) 를 구현하면 localStorage 대신 쓸 수 있다.
 * @param {Object} [options.timings] 연출 시간(밀리초). TIMINGS 의 일부 항목만 덮어쓸 수 있다.
 * @param {Function} [options.random] 부적 추첨에 쓸 난수 함수 (0 이상 1 미만). 생략하면 Math.random 을 쓴다.
 * @returns {HellmarbleApp} 실행 중인 애플리케이션
 */
export function initHellmarble(root, options) {
  let target = typeof root === 'string' ? document.querySelector(root) : root;
  if (!target) throw new Error('Hellmarble 을 그릴 요소를 찾을 수 없습니다.');
  return new HellmarbleApp(target, options).start();
}
