/** 원 단위로 금액을 계산하기 위한 만원 환산 값이다. */
export const WON = 10000;
/** 각 리그의 배율과 인공지능 인원 추첨 가중치이다. */
export const LEAGUES = {
  green: { name: 'Green', multiplier: 1, weights: [1, 2, 1] },
  orange: { name: 'Orange', multiplier: 5, weights: [1, 1, 2] },
  red: { name: 'Red', multiplier: 30, weights: [1, 2, 4] }
};
/** 건물별 최대 개수이다. */
export const BUILD_LIMITS = [2, 1, 1];
/** 플레이어의 고유 색상과 색맹 사용자를 위한 문양이다. */
export const TOKENS = [ { color: '#d04f54', shape: '●' }, { color: '#357bd8', shape: '◆' }, { color: '#dfaa29', shape: '▲' }, { color: '#8e5fd1', shape: '■' } ];

/** 일반 도시의 가격과 건물 비용을 원 단위로 구성한다. */
function city(name, en, color, price, toll, villa, building, hotel) {
  let tier = { yellow: 5, blue: 10, navy: 15, red: 20 }[color];
  return { name, en, type: 'city', color, price: price * WON, toll: toll * WON, costs: [tier, tier * 3, tier * 5].map(toWon), rents: [villa, building, hotel].map(toWon) };
}
/** 만원으로 선언한 금액을 원 단위 정수로 변환한다. */
function toWon(value) { return Math.round(value * WON); }
/** 건물을 지을 수 없는 한국 도시 또는 특수 시설을 구성한다. */
function property(name, en, price, toll, color = 'green') { return { name, en, type: 'property', color, price: toWon(price), toll: toWon(toll), costs: [], rents: [] }; }
/** 구매할 수 없는 특수 칸을 구성한다. */
function special(name, en, type) { return { name, en, type, color: 'special', price: 0, toll: 0, costs: [], rents: [] }; }

/** 출발지부터 진행 방향으로 나열한 전체 40칸이다. */
export const BOARD = [
  special('출발지', 'Start', 'start'),
  city('타이페이', 'Taipei', 'yellow', 5, .2, 1, 9, 25),
  special('비밀쿠폰', 'Secret coupon', 'coupon'),
  city('홍콩', 'Hong Kong', 'yellow', 8, .4, 2, 18, 45),
  city('마닐라', 'Manila', 'yellow', 8, .4, 2, 18, 45),
  property('제주도', 'Jeju', 20, 30),
  city('싱가폴', 'Singapore', 'yellow', 10, .6, 3, 27, 55),
  special('비밀쿠폰', 'Secret coupon', 'coupon'),
  city('카이로', 'Cairo', 'yellow', 10, .6, 3, 27, 55),
  city('이스탄불', 'Istanbul', 'yellow', 12, .8, 4, 30, 60),
  special('우주여행', 'Space travel', 'space'),
  city('아테네', 'Athens', 'blue', 14, 1, 5, 45, 75),
  special('비밀쿠폰', 'Secret coupon', 'coupon'),
  city('코펜하겐', 'Copenhagen', 'blue', 16, 1.2, 6, 50, 90),
  city('스톡홀름', 'Stockholm', 'blue', 16, 1.2, 6, 50, 90),
  property('콩코드 여객기', 'Concorde', 20, 30),
  city('취리히', 'Zurich', 'blue', 18, 1.4, 7, 55, 95),
  special('비밀쿠폰', 'Secret coupon', 'coupon'),
  city('베를린', 'Berlin', 'blue', 18, 1.4, 7, 55, 95),
  city('몬트리올', 'Montreal', 'blue', 20, 1.6, 8, 60, 100),
  special('무인도', 'Desert island', 'island'),
  city('부에노스 아이레스', 'Buenos Aires', 'navy', 22, 1.8, 9, 70, 105),
  special('비밀쿠폰', 'Secret coupon', 'coupon'),
  city('상파울로', 'São Paulo', 'navy', 24, 2, 10, 75, 110),
  city('시드니', 'Sydney', 'navy', 24, 2, 10, 75, 110),
  property('부산', 'Busan', 50, 60),
  city('하와이', 'Hawaii', 'navy', 26, 2.2, 11, 80, 115),
  city('리스본', 'Lisbon', 'navy', 26, 2.2, 11, 80, 115),
  special('비밀쿠폰', 'Secret coupon', 'coupon'),
  city('마드리드', 'Madrid', 'navy', 28, 2.4, 12, 85, 120),
  special('사회복지기금 본부', 'Welfare fund HQ', 'fund'),
  city('도쿄', 'Tokyo', 'red', 30, 2.6, 13, 90, 130),
  property('콜롬비아 호', 'Columbia', 45, 40),
  city('파리', 'Paris', 'red', 32, 2.8, 15, 100, 140),
  city('로마', 'Rome', 'red', 32, 2.8, 15, 100, 140),
  special('비밀쿠폰', 'Secret coupon', 'coupon'),
  city('런던', 'London', 'red', 35, 3.5, 17, 110, 150),
  city('뉴욕', 'New York', 'red', 35, 3.5, 17, 110, 150),
  special('사회복지기금 접수처', 'Welfare reception', 'collection'),
  property('서울', 'Seoul', 100, 200, 'gold')
];

/** 이름, 장수, 효과 및 두 언어의 안내문으로 구성한 쿠폰 종류이다. */
export const COUPONS = [
  { id: 'welfare', count: 4, name: '사회복지기금 배당', en: 'Welfare contribution', text: '사회복지기금 접수처로 가시오. 출발지를 거치면 월급을 받습니다.', english: 'Go to Welfare reception. Collect salary if you pass Start.', effect: 'move', target: 38 },
  { id: 'fine', count: 4, name: '과속 운전 벌금', en: 'Speeding fine', text: '과속 운전 벌금 5만원을 은행에 내시오.', english: 'Pay a ₩50,000 speeding fine to the bank.', effect: 'pay', amount: 5 },
  { id: 'jeju', count: 2, name: '관광 여행', en: 'Sightseeing', text: '제주도로 가시오. 출발지를 거치면 월급을 받고, 다른 소유자가 있으면 통행료를 냅니다.', english: 'Go to Jeju. Collect salary if you pass Start and pay any toll.', effect: 'move', target: 5 },
  { id: 'busan', count: 1, name: '관광 여행', en: 'Sightseeing', text: '부산으로 가시오. 출발지를 거치면 월급을 받고, 다른 소유자가 있으면 통행료를 냅니다.', english: 'Go to Busan. Collect salary if you pass Start and pay any toll.', effect: 'move', target: 25 },
  { id: 'seoul', count: 1, name: '관광 여행', en: 'Sightseeing', text: '서울로 가시오. 다른 소유자가 있으면 통행료를 냅니다.', english: 'Go to Seoul and pay any toll.', effect: 'move', target: 39 },
  { id: 'pass', count: 2, name: '우대권', en: 'Free pass', text: '상대방의 통행료와 이용료를 한 턴 동안 면제합니다. 보관 후 1회 사용할 수 있습니다.', english: 'Keep this card to waive tolls and usage fees for one turn. Single use.', effect: 'hold' },
  { id: 'radio', count: 2, name: '무전기', en: 'Radio', text: '무인도에서 주사위를 굴리기 전에 즉시 탈출합니다. 보관 후 1회 사용할 수 있습니다.', english: 'Keep this card to escape the island before rolling. Single use.', effect: 'hold' },
  { id: 'sale', count: 1, name: '반액대매출', en: 'Half-price sale', text: '구매가가 가장 높은 소유 토지를 건물과 함께 전체 가치의 50%로 은행에 매각합니다.', english: 'Sell your land with the highest purchase price, including its buildings, for 50% of total cost.', effect: 'sale' },
  { id: 'lottery', count: 3, name: '복권 당첨', en: 'Lottery win', text: '축하합니다! 당첨금 50만원을 받으시오.', english: 'Congratulations! Collect ₩500,000.', effect: 'gain', amount: 50 },
  { id: 'school', count: 4, name: '해외 유학', en: 'Study abroad', text: '학교 등록금 10만원을 은행에 내시오.', english: 'Pay ₩100,000 tuition to the bank.', effect: 'pay', amount: 10 },
  { id: 'invitation', count: 1, name: '우주여행 초청장', en: 'Space invitation', text: '우주여행 칸으로 즉시 이동해 무료로 탑승합니다.', english: 'Go to Space travel and board for free.', effect: 'invite', target: 10 },
  { id: 'security', count: 2, name: '방범비', en: 'Security fee', text: '호텔 5만원, 빌딩 3만원, 별장 1만원을 개수만큼 은행에 냅니다.', english: 'Pay ₩50,000 per hotel, ₩30,000 per building, and ₩10,000 per villa.', effect: 'tax', rates: [1, 3, 5] },
  { id: 'repair', count: 1, name: '건물수리비', en: 'Repairs', text: '호텔 10만원, 빌딩 6만원, 별장 3만원을 개수만큼 은행에 냅니다.', english: 'Pay ₩100,000 per hotel, ₩60,000 per building, and ₩30,000 per villa.', effect: 'tax', rates: [3, 6, 10] },
  { id: 'income', count: 1, name: '정기종합소득세', en: 'Income tax', text: '호텔 15만원, 빌딩 10만원, 별장 3만원을 개수만큼 은행에 냅니다.', english: 'Pay ₩150,000 per hotel, ₩100,000 per building, and ₩30,000 per villa.', effect: 'tax', rates: [3, 10, 15] },
  { id: 'flight', count: 2, name: '항공 여행', en: 'Air travel', text: '콩코드 여객기 이용료를 내고 타이페이로 이동합니다. 출발지를 거치면 월급을 받고, 타이페이 통행료와 이용료도 냅니다.', english: 'Pay the Concorde owner and fly to Taipei. Collect salary if you pass Start and pay any Taipei toll.', effect: 'flight', target: 1 },
  { id: 'hospital', count: 4, name: '병원비 지불', en: 'Medical bill', text: '건강검진 병원비 10만원을 은행에 내시오.', english: 'Pay a ₩100,000 medical bill to the bank.', effect: 'pay', amount: 10 },
  { id: 'back', count: 2, name: '이사', en: 'Moving house', text: '뒤로 세 칸 이동하고, 도착한 땅의 효과를 적용합니다.', english: 'Move back three spaces and resolve the destination.', effect: 'back' },
  { id: 'scholarship', count: 4, name: '장학금 혜택', en: 'Scholarship', text: '은행에서 장학금 10만원을 받으시오.', english: 'Collect a ₩100,000 scholarship.', effect: 'gain', amount: 10 },
  { id: 'highway', count: 4, name: '고속도로', en: 'Highway', text: '출발지로 가서 월급을 받으시오.', english: 'Go to Start and collect salary.', effect: 'move', target: 0 },
  { id: 'prize', count: 4, name: '아마추어 대회 우승', en: 'Tournament prize', text: '은행에서 우승 상금 20만원을 받으시오.', english: 'Collect a ₩200,000 tournament prize.', effect: 'gain', amount: 20 },
  { id: 'pension', count: 4, name: '연금 혜택', en: 'Pension', text: '은행에서 노후연금 5만원을 받으시오.', english: 'Collect a ₩50,000 pension.', effect: 'gain', amount: 5 },
  { id: 'island', count: 2, name: '무인도 표류', en: 'Marooned', text: '즉시 무인도로 가시오. 출발지를 거쳐도 월급을 받지 못합니다.', english: 'Go to the desert island without collecting salary.', effect: 'move', target: 20, salary: false }
];

/** 식별자로 쿠폰 정의를 찾는다. */
export function couponById(id) { return COUPONS.find(/** 쿠폰 식별자를 비교한다. */ function matches(card) { return card.id === id; }); }
