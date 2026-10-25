/**
 * @license Apache-2.0
 * Copyright 2026 HJOW
 * Licensed under the Apache License, Version 2.0.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Undergrounds 게임 핵심 구현 스크립트
 *
 * 의존성
 *     three.js 필수
 */
import * as THREE from './three.module.min.js';

// ===== [01] 상수 =====
const GAME_VERSION = '0.0.1';
const SAVE_VERSION = 1;
const CELL_SIZE = 16;          // 던전 1칸 가로·세로 (m)
const CELL_HEIGHT = 10;        // 던전 1칸 높이 (m)
const UI_WIDTH = 1920;         // UI 논리 해상도. 모든 UI 좌표·크기는 이 크기 기준 px 로 작성
const UI_HEIGHT = 1080;
const RESOLUTIONS = { low: [1280, 720], normal: [1920, 1080] };
const SLOT_COUNT = 4;
const ACTION_SLOT_COUNT = 7;   // 행동 슬롯 칸 수
const STORAGE_KEY_SETTINGS = 'undergrounds.settings';
const STORAGE_KEY_SLOT_PREFIX = 'undergrounds.save.';   // 뒤에 0~3 을 붙임
const DEFAULT_SETTINGS = { lang: 'ko', quality: 'normal' };
const CAMERA_FAR_DEFAULT = 200;   // 메뉴 화면의 카메라 far (던전 view 는 테마별 cameraFar 를 쓴다)
// 주인공 (AGENTS.md "공통 요소가 많은 두 가지 다른 세계관", 2026-10-24): 마틴 = RPG, 에릭 = 공포 게임. 저장 데이터의 state.hero
const HEROES = {
    martin: { id: 'martin', nameKo: '마틴', nameEn: 'Martin', descKo: 'RPG — 싸우고 성장한다', descEn: 'RPG — fight and grow stronger' },
    eric: { id: 'eric', nameKo: '에릭', nameEn: 'Eric', descKo: '공포 — 숨고 도망친다', descEn: 'Horror — hide and run' },
};
const DEFAULT_HERO = 'martin';
function isHeroId(id) { return typeof id === 'string' && Object.hasOwn(HEROES, id); }

// ===== [02] 유틸리티 =====
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v); }
function lerp(a, b, t) { return a + (b - a) * t; }
// 정수 여러 개 → 32비트 해시 (시드 조합용)
function hashInts(...nums) {
    let h = 2166136261 >>> 0;
    for (const n of nums) { h ^= (n >>> 0); h = Math.imul(h, 16777619) >>> 0; }
    return h;
}
// 시드 고정 난수 (mulberry32). rng() 는 0 이상 1 미만
function createRng(seed) {
    let a = seed >>> 0;
    const rng = function () {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    rng.int = (min, max) => min + Math.floor(rng() * (max - min + 1));   // min 이상 max 이하 정수
    rng.pick = (arr) => arr[Math.floor(rng() * arr.length)];
    rng.shuffle = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
        return arr;
    };
    return rng;
}
function pad2(n) { return String(n).padStart(2, '0'); }
// 밀리초 시각 → "YYYY-MM-DD HH:mm" (현지 시각)
function formatDateTime(ms) {
    if (typeof ms !== 'number' || !Number.isFinite(ms) || ms <= 0) return '-';
    const d = new Date(ms);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// ===== [03] 다국어 =====
const I18N = {
    ko: {
        'game.title': 'Undergrounds',
        'title.clickToContinue': '계속하려면 클릭하세요',
        'menu.start': '게임 시작',
        'menu.settings': '설정',
        'common.yes': '예',
        'common.no': '아니오',
        'common.cancel': '취소',
        'common.back': '뒤로',
        'common.save': '저장',
        'common.delete': '삭제',
        'settings.title': '설정',
        'settings.language': '언어',
        'settings.quality': '그래픽 품질',
        'settings.quality.low': '낮음 (1280×720)',
        'settings.quality.normal': '보통 (1920×1080)',
        'settings.saved': '설정을 저장했습니다.',
        'slots.title': '저장 슬롯',
        'slots.slotName': '슬롯 {n}',
        'slots.empty': '비어 있음',
        'slots.corrupt': '읽을 수 없는 데이터',
        'slots.floorPre': '지하 ',
        'slots.floorPost': '층',
        'slots.level': 'Lv',
        'slots.savedAtLabel': '저장 시각',
        'slots.pickHero': '플레이할 주인공',
        'slots.confirmNew': '새로 던전에 입장하시겠습니까?',
        'slots.continue': '이어하기',
        'slots.corruptMessage': '슬롯 {n} 의 데이터를 읽을 수 없습니다.',
        'slots.confirmDelete': '슬롯 {n} 을(를) 정말 삭제하시겠습니까?\n삭제하면 되돌릴 수 없습니다.',
        'slots.deleted': '슬롯 {n} 을(를) 삭제했습니다.',
        'slots.loadFailed': '저장 데이터를 불러올 수 없습니다.',
        'intro.line1': '일과 운동을 모두 마치고, 집으로 돌아가던 길.',
        'intro.line2': '너무 무리했나… 열려 있는 맨홀을 보지 못하고 발을 헛디딘다.',
        'intro.line3': '눈을 뜨고 일어나 보니, 낯선 공간이다.',
        'intro.skip': '클릭하여 건너뛰기',
        'game.clickToResume': '클릭하여 계속',
        'game.controlsHint': 'W A S D 이동 · SPACE 점프 · SHIFT 달리기 · 마우스 시점 · ESC / TAB 시스템 메뉴',
        'game.controlsHint2': '마우스 왼쪽 버튼 행동 슬롯 사용 · 1~7 / 휠 행동 슬롯 선택 · F 상호작용',
        'hud.floor': '지하 층',
        'hud.sanctuary': '성소 — 저장 가능',
        'hud.elevator': '엘리베이터 — 저장 가능',
        'hud.hp': 'HP',
        'hud.mp': 'MP',
        'hud.stamina': '스태미너',
        'hud.flash': '플래시',
        'hud.battery': '배터리',
        'hud.exhausted': '탈진',
        'hud.level': 'Lv',
        'menu.tab.map': '지도',
        'menu.tab.status': '스테이터스',
        'menu.tab.inventory': '인벤토리',
        'menu.tab.skill': '스킬',
        'menu.tab.system': '시스템',
        'menu.close': '닫기',
        'menu.closeHint': 'ESC / TAB 으로 닫기',
        'menu.preparing': '준비 중입니다.',
        'map.legend.sanctuary': '성소',
        'map.legend.merchant': '방랑 상인',
        'map.legend.portal': '포탈',
        'map.legend.stairsUp': '위층 엘리베이터',
        'map.legend.stairsDown': '아래층 엘리베이터',
        'interact.key': 'F',
        'interact.elevatorDown': '아래층으로',
        'interact.elevatorUp': '위층으로',
        'interact.trade': '거래하기',
        'interact.hide': '숨기',
        'interact.unhide': '나오기',
        'interact.open': '열기',
        'interact.take': '가져가기',
        'interact.empty': '비어 있음',
        'interact.cardReader': '카드 찍기',
        'interact.unlocked': '엘리베이터가 활성화되었습니다',
        'shop.merchant': '방랑 상인',
        'shop.greeting0': '어서 오게, 길 잃은 손님. 이 아래에서 버티려면 준비가 필요하지.',
        'shop.greeting1': '흥미로운 물건들이 들어왔다네. 천천히 둘러보게.',
        'shop.greeting2': '골드만 있다면 무엇이든. 쓸모없는 물건은 내가 사 주지.',
        'shop.tab.buy': '구매',
        'shop.tab.sell': '판매',
        'shop.hintBuy': '클릭: 구매 · 우클릭 / 길게 누르기: 상세 정보',
        'shop.hintSell': '클릭: 판매 · 우클릭 / 길게 누르기: 상세 정보',
        'shop.consumables': '소모품',
        'shop.equipment': '장비',
        'shop.soldOut': '이미 팔린 물건입니다.',
        'shop.soldOutTag': '품절',
        'shop.buyPrice': '구매가',
        'shop.qty': '',
        'shop.qtyMax': '최대 ',
        'shop.qtyAll': '모두 ',
        'shop.unit': '개',
        'shop.buy': '구매',
        'shop.sell': '판매',
        'shop.noGold': '골드가 부족합니다.',
        'shop.invalid': '살 수 없는 물건입니다.',
        'shop.cannotSell': '이 아이템은 팔 수 없습니다.',
        'shop.bought': '‘{name}’ 을(를) 샀습니다.',
        'shop.sold': '‘{name}’ 을(를) 팔았습니다.',
        'shop.confirmSellRare': '희귀 장비 ‘{name}’ 을(를) 파시겠습니까?',
        'shop.sellNote': '장착하지 않은 장비·소모품을 팔 수 있습니다. 판매가는 소모품이 이 층 구매가의 25%, 장비가 구매가의 20% 입니다. 장착한 장비는 인벤토리에서 해제한 뒤 팔 수 있습니다.',
        'map.legend.boss': '보스',
        'map.legend.player': '현재 위치',
        'map.legend.unvisited': '방문하지 않은 칸',
        'system.slot': '저장 슬롯',
        'system.lastSaved': '마지막 저장',
        'system.mainMenu': '메인 메뉴',
        'system.inSanctuary': '성소 구역 안에 있습니다. 저장할 수 있습니다.',
        'system.inElevator': '엘리베이터 안에 있습니다. 저장할 수 있습니다.',
        'system.outSanctuary': '성소 구역이나 엘리베이터 안이 아니면 저장할 수 없습니다.',
        'system.saveOnlyInSanctuary': '성소 주변이나 엘리베이터 안에서만 저장할 수 있습니다.',
        'system.saved': '저장했습니다.',
        'system.saveFailed': '저장하지 못했습니다. 브라우저 저장 공간을 확인하세요.',
        'system.debugNoSave': '디버그 게임은 저장하지 않습니다.',
        'system.confirmLeave': '지금 나가면 저장되지 않습니다.\n그래도 메인 메뉴로 나가시겠습니까?',
        'hud.gold': '골드',
        'game.levelUp': '레벨 업!',
        'death.title': '쓰러졌습니다',
        'death.hint': '마지막으로 저장한 뒤의 진행은 사라집니다.',
        'death.retry': '마지막 저장에서 다시 시작',
        'death.retryDebug': '다시 시작',
        'monster.elite': '정예',
        'combat.block': '막기',
        'combat.stunned': '기절',
        'combat.counter': '반격',
        'combat.undying': '불굴',
        'game.bossDefeated': '처치!',
        'status.level': '레벨',
        'status.exp': '경험치',
        'status.statPoints': '남은 스탯 포인트',
        'status.skillPoints': '남은 스킬 포인트',
        'status.levelUpHint': '레벨이 오를 때마다 힘·민첩성·지능이 1씩 오르고, 스탯·스킬 포인트를 1씩 얻습니다.',
        'status.noPoints': '남은 스탯 포인트가 없습니다.',
        'status.addPoint': '스탯 포인트 1을 써서 올리기',
        'status.sec.stats': '능력치',
        'status.sec.vitals': '생명력·자원',
        'status.sec.offense': '공격',
        'status.sec.movement': '이동',
        'status.sec.defense': '방어',
        'status.sec.resist': '저항 (현재 / 상한)',
        'stat.str': '힘',
        'stat.dex': '민첩성',
        'stat.int': '지능',
        'stat.str.desc': '최대 HP · 물리 공격력 · HP 자연 회복',
        'stat.dex.desc': '최대 스태미너 · 공격 속도 · 치명타 확률 · 이동 속도',
        'stat.int.desc': '최대 MP · 마법 공격력 · MP 자연 회복',
        'status.hpRegen': 'HP 자연 회복',
        'status.mpRegen': 'MP 자연 회복',
        'status.staminaRegen': '스태미너 회복',
        'status.physAtk': '물리 공격력',
        'status.magicAtk': '마법 공격력',
        'status.attackInterval': '공격 간격',
        'status.atkSpeed': '공격 속도 보너스',
        'status.critChance': '치명타 확률',
        'status.critDamage': '치명타 피해',
        'status.walkSpeed': '걷기 속도',
        'status.runSpeed': '달리기 속도',
        'status.defense': '방어력',
        'status.reduction': '물리 피해 감소율',
        'status.reductionHint': '같은 레벨 몬스터의 공격 기준',
        'status.block': '막기 확률',
        'unit.perSec': '/초',
        'unit.sec': '초',
        'unit.mps': 'm/s',
        'res.fire': '화염',
        'res.cold': '냉기',
        'res.lightning': '전격',
        'res.poison': '독',
        'inv.equipment': '장비',
        'inv.bag': '소지품',
        'inv.actionSlots': '행동 슬롯',
        'inv.hint': '클릭: 장착·해제 / 소모품 메뉴 · 드래그: 옮기기 · 우클릭 / 길게 누르기: 상세 정보',
        'equipSlot.helmet': '투구',
        'equipSlot.armor': '갑옷',
        'equipSlot.weapon': '무기',
        'equipSlot.offhand': '보조장비',
        'equipSlot.ring1': '반지',
        'equipSlot.ring2': '반지',
        'equipSlot.boots': '부츠',
        'inv.notEquip': '장비가 아닙니다.',
        'inv.reqLevel': '요구 레벨이 부족해 장착할 수 없습니다.',
        'inv.wrongSlot': '그 칸에는 장착할 수 없습니다.',
        'inv.twoHandedOffhand': '양손 무기를 든 채로는 보조장비를 장착할 수 없습니다.',
        'inv.noSpaceTwoHanded': '보조장비를 옮길 빈칸이 없어 양손 무기를 장착할 수 없습니다.',
        'inv.emptySlot': '장착한 장비가 없습니다.',
        'inv.full': '인벤토리에 빈칸이 없습니다.',
        'inv.fullPickup': '인벤토리가 가득 차서 주울 수 없습니다.',
        'inv.equipToAction': '장비는 행동 슬롯에 등록할 수 없습니다.',
        'inv.use': '사용',
        'inv.assign': '행동 슬롯에 등록',
        'inv.unassign': '행동 슬롯에서 해제',
        'inv.pickedUp': '획득',
        'inv.discard': '버리기',
        'inv.confirmDiscard': '‘{name}’ 을(를) 버리시겠습니까?\n버린 아이템은 되찾을 수 없습니다.',
        'inv.cannotDiscard': '이 아이템은 버릴 수 없습니다.',
        'item.tier': '단계',
        'item.reqLv': '요구 레벨',
        'item.iLv': '아이템 레벨',
        'item.sell': '판매가',
        'item.sellEach': '판매가 (1개)',
        'item.count': '보유',
        'item.engraving': '각인',
        'item.atk': '공격력',
        'item.magic': '마력',
        'item.def': '방어력',
        'item.interval': '공격 간격',
        'item.reach': '공격 범위',
        'item.boltRange': '마력탄 사거리',
        'item.pierceTargets': '관통 (대상 수)',
        'item.hands': '쥐는 손',
        'item.hands.1': '한손',
        'item.hands.2': '양손',
        'item.block': '막기 확률',
        'item.moveSpeed': '이동 속도',
        'item.maxMp': '최대 MP',
        'item.critChance': '치명타 확률',
        'item.staminaRegen': '스태미너 회복',
        'item.throwBase': '투척 기준 피해',
        'item.starter': '시작 장비',
        'item.none': '가지고 있지 않습니다.',
        'item.disabled': '지금은 사용할 수 없습니다.',
        'item.cooldown': '아직 사용할 수 없습니다. (재사용 대기)',
        'item.casting': '이미 시전 중입니다.',
        'item.revealed': '지도를 밝혔습니다.',
        'item.recallDone': '성소로 돌아왔습니다.',
        'item.recallCancelled': '공격을 받아 귀환이 취소되었습니다.',
        'itemType.pipe': '둔기',
        'itemType.sword': '한손검',
        'itemType.gsword': '양손검',
        'itemType.dagger': '단검',
        'itemType.wand': '완드',
        'itemType.staff': '지팡이',
        'itemType.helmet': '투구',
        'itemType.armor': '갑옷',
        'itemType.boots': '부츠',
        'itemType.shield': '방패',
        'itemType.tome': '마도서',
        'itemType.ring': '반지',
        'itemCat.hp': '생명력 물약',
        'itemCat.mp': '마나 물약',
        'itemCat.sta': '활력 물약',
        'itemCat.cure': '치료제',
        'itemCat.throw': '투척물',
        'itemCat.elixir': '전투 영약',
        'itemCat.scroll': '주문서',
        'itemCat.battery': '배터리',
        'itemCat.glowstick': '야광봉',
        'itemCat.keycard': '카드키',
        'itemCat.fadedScroll': '주문서',
        'itemCat.tool': '도구',
        'item.ericOnly': '에릭 전용',
        'item.energy': '에너지',
        'item.noSellDiscard': '팔거나 버릴 수 없습니다',
        'item.batteryAuto': '배터리는 플래시 에너지가 다 되면 자동으로 쓰입니다.',
        'item.keycardUse': '카드키는 내려가는 엘리베이터 오른쪽의 카드 리더기에 찍어 씁니다.',
        'item.keycardOne': '카드키는 하나만 가질 수 있습니다.',
        'consTier.1': '하급',
        'consTier.2': '중급',
        'consTier.3': '상급',
        'affix.hpPct': '최대 HP',
        'affix.mpPct': '최대 MP',
        'affix.staminaPct': '최대 스태미너',
        'affix.defPct': '방어력',
        'affix.res1': '{el} 저항',
        'affix.resAll': '모든 저항',
        'affix.physPct': '물리 공격력',
        'affix.magicPct': '마력',
        'affix.elemDmg': '{el} 추가 피해 (물리 공격력의)',
        'affix.atkSpeedPct': '공격 속도',
        'affix.critChance': '치명타 확률',
        'affix.critDamage': '치명타 피해',
        'affix.lifeSteal': '생명력 흡수 (물리 피해의)',
        'affix.moveSpeedPct': '이동 속도',
        'affix.cdrPct': '스킬 재사용 대기',
        'affix.goldPct': '골드 획득',
        'skill.points': '남은 스킬 포인트',
        'skill.hint': '빈 곳을 끌거나 방향키·휠로 이동 · 스킬을 누르면 상세 정보',
        'skill.legend.learned': '활성',
        'skill.legend.learnable': '활성화 가능',
        'skill.legend.locked': '잠김',
        'skill.type.active': '액티브',
        'skill.type.passive': '패시브',
        'skill.branch.base': '기본',
        'skill.branch.magic': '마법형',
        'skill.branch.melee': '근거리 공격형',
        'skill.branch.defense': '방어형',
        'skill.branch.support': '보조형',
        'skill.branch.cross': '교차 스킬',
        'skill.level': '스킬 레벨',
        'skill.current': '현재 레벨',
        'skill.next': '다음 레벨',
        'skill.notLearnedYet': '아직 활성화하지 않은 스킬입니다.',
        'skill.maxed': '최대 레벨에 도달했습니다.',
        'skill.cost': '소모',
        'skill.noCost': '소모 없음',
        'skill.cooldown': '재사용 대기',
        'skill.cooldownAttack': '재사용 대기 (= 공격 간격)',
        'skill.learn': '활성화',
        'skill.levelUp': '레벨 업',
        'skill.noPoints': '스킬 포인트가 없습니다.',
        'skill.notConnected': '연결된 스킬을 먼저 활성화해야 합니다.',
        'skill.maxLevel': '최대 레벨입니다.',
        'skill.unknown': '알 수 없는 스킬입니다.',
        'skill.assign': '행동 슬롯에 등록 (이 스킬이 든 칸을 다시 누르면 해제)',
        'skill.notLearned': '먼저 스킬을 활성화해야 합니다.',
        'skill.passiveNote': '패시브 스킬은 활성화하면 바로 적용되며, 행동 슬롯에 등록하지 않습니다.',
    },
    en: {
        'game.title': 'Undergrounds',
        'title.clickToContinue': 'Click to continue',
        'menu.start': 'Start Game',
        'menu.settings': 'Settings',
        'common.yes': 'Yes',
        'common.no': 'No',
        'common.cancel': 'Cancel',
        'common.back': 'Back',
        'common.save': 'Save',
        'common.delete': 'Delete',
        'settings.title': 'Settings',
        'settings.language': 'Language',
        'settings.quality': 'Graphics Quality',
        'settings.quality.low': 'Low (1280×720)',
        'settings.quality.normal': 'Normal (1920×1080)',
        'settings.saved': 'Settings saved.',
        'slots.title': 'Save Slots',
        'slots.slotName': 'Slot {n}',
        'slots.empty': 'Empty',
        'slots.corrupt': 'Unreadable data',
        'slots.floorPre': 'B',
        'slots.floorPost': '',
        'slots.level': 'Lv',
        'slots.savedAtLabel': 'Saved',
        'slots.pickHero': 'Choose your character',
        'slots.confirmNew': 'Enter the dungeon as a new game?',
        'slots.continue': 'Continue',
        'slots.corruptMessage': 'The data in slot {n} cannot be read.',
        'slots.confirmDelete': 'Really delete slot {n}?\nThis cannot be undone.',
        'slots.deleted': 'Slot {n} deleted.',
        'slots.loadFailed': 'Could not load the save data.',
        'intro.line1': 'Work and the gym are finally done. He is on his way home.',
        'intro.line2': 'Did he push himself too hard? He misses the open manhole and falls.',
        'intro.line3': 'He opens his eyes and gets up. This place is unfamiliar.',
        'intro.skip': 'Click to skip',
        'game.clickToResume': 'Click to continue',
        'game.controlsHint': 'W A S D move · SPACE jump · SHIFT run · Mouse look · ESC / TAB system menu',
        'game.controlsHint2': 'Left mouse button use action slot · 1-7 / Wheel select action slot · F interact',
        'hud.floor': 'Basement',
        'hud.sanctuary': 'Sanctuary — you can save here',
        'hud.elevator': 'Elevator — you can save here',
        'hud.hp': 'HP',
        'hud.mp': 'MP',
        'hud.stamina': 'Stamina',
        'hud.flash': 'Flashlight',
        'hud.battery': 'Battery',
        'hud.exhausted': 'Exhausted',
        'hud.level': 'Lv',
        'menu.tab.map': 'Map',
        'menu.tab.status': 'Status',
        'menu.tab.inventory': 'Inventory',
        'menu.tab.skill': 'Skills',
        'menu.tab.system': 'System',
        'menu.close': 'Close',
        'menu.closeHint': 'ESC / TAB to close',
        'menu.preparing': 'Coming soon.',
        'map.legend.sanctuary': 'Sanctuary',
        'map.legend.merchant': 'Wandering Merchant',
        'map.legend.portal': 'Portal',
        'map.legend.stairsUp': 'Elevator up',
        'map.legend.stairsDown': 'Elevator down',
        'interact.key': 'F',
        'interact.elevatorDown': 'Go down',
        'interact.elevatorUp': 'Go up',
        'interact.trade': 'Trade',
        'interact.hide': 'Hide',
        'interact.unhide': 'Get out',
        'interact.open': 'Open',
        'interact.take': 'Take',
        'interact.empty': 'Empty',
        'interact.cardReader': 'Swipe card',
        'interact.unlocked': 'The elevator is now active',
        'shop.merchant': 'Wandering Merchant',
        'shop.greeting0': 'Welcome, lost traveler. You will need to be prepared to last down here.',
        'shop.greeting1': 'I have some interesting wares today. Take your time.',
        'shop.greeting2': 'Anything, for the right amount of gold. I will buy what you do not need.',
        'shop.tab.buy': 'Buy',
        'shop.tab.sell': 'Sell',
        'shop.hintBuy': 'Click: buy · Right-click / hold: details',
        'shop.hintSell': 'Click: sell · Right-click / hold: details',
        'shop.consumables': 'Consumables',
        'shop.equipment': 'Equipment',
        'shop.soldOut': 'That item is sold out.',
        'shop.soldOutTag': 'Sold out',
        'shop.buyPrice': 'Price',
        'shop.qty': '×',
        'shop.qtyMax': 'Max ×',
        'shop.qtyAll': 'All ×',
        'shop.unit': '',
        'shop.buy': 'Buy',
        'shop.sell': 'Sell',
        'shop.noGold': 'Not enough gold.',
        'shop.invalid': 'That item cannot be bought.',
        'shop.cannotSell': 'This item cannot be sold.',
        'shop.bought': 'Bought {name}.',
        'shop.sold': 'Sold {name}.',
        'shop.confirmSellRare': 'Sell the rare item “{name}”?',
        'shop.sellNote': 'You can sell any equipment or consumables you are not wearing. Consumables sell for 25% of their price on this floor, equipment for 20% of its price. Unequip gear in the inventory before selling it.',
        'map.legend.boss': 'Boss',
        'map.legend.player': 'You',
        'map.legend.unvisited': 'Unvisited',
        'system.slot': 'Save slot',
        'system.lastSaved': 'Last saved',
        'system.mainMenu': 'Main Menu',
        'system.inSanctuary': 'You are inside a sanctuary. You can save here.',
        'system.inElevator': 'You are inside an elevator. You can save here.',
        'system.outSanctuary': 'You can only save in a sanctuary or inside an elevator.',
        'system.saveOnlyInSanctuary': 'You can only save near a sanctuary or inside an elevator.',
        'system.saved': 'Game saved.',
        'system.saveFailed': 'Could not save. Please check your browser storage.',
        'system.debugNoSave': 'Debug games are not saved.',
        'system.confirmLeave': 'Your progress will not be saved if you leave now.\nReturn to the main menu anyway?',
        'hud.gold': 'Gold',
        'game.levelUp': 'Level up!',
        'death.title': 'You have fallen',
        'death.hint': 'Progress since your last save is lost.',
        'death.retry': 'Restart from last save',
        'death.retryDebug': 'Restart',
        'monster.elite': 'Elite',
        'combat.block': 'Block',
        'combat.stunned': 'Stunned',
        'combat.counter': 'Counter',
        'combat.undying': 'Undying',
        'game.bossDefeated': 'defeated!',
        'status.level': 'Level',
        'status.exp': 'Experience',
        'status.statPoints': 'Stat points',
        'status.skillPoints': 'Skill points',
        'status.levelUpHint': 'Each level raises STR, DEX and INT by 1 and grants 1 stat point and 1 skill point.',
        'status.noPoints': 'No stat points left.',
        'status.addPoint': 'Spend 1 stat point',
        'status.sec.stats': 'Attributes',
        'status.sec.vitals': 'Vitals',
        'status.sec.offense': 'Offense',
        'status.sec.movement': 'Movement',
        'status.sec.defense': 'Defense',
        'status.sec.resist': 'Resistances (current / cap)',
        'stat.str': 'Strength',
        'stat.dex': 'Dexterity',
        'stat.int': 'Intelligence',
        'stat.str.desc': 'Max HP · Physical attack · HP regen',
        'stat.dex.desc': 'Max stamina · Attack speed · Crit chance · Move speed',
        'stat.int.desc': 'Max MP · Magic attack · MP regen',
        'status.hpRegen': 'HP regen',
        'status.mpRegen': 'MP regen',
        'status.staminaRegen': 'Stamina regen',
        'status.physAtk': 'Physical attack',
        'status.magicAtk': 'Magic attack',
        'status.attackInterval': 'Attack interval',
        'status.atkSpeed': 'Attack speed bonus',
        'status.critChance': 'Critical chance',
        'status.critDamage': 'Critical damage',
        'status.walkSpeed': 'Walk speed',
        'status.runSpeed': 'Run speed',
        'status.defense': 'Defense',
        'status.reduction': 'Physical damage reduction',
        'status.reductionHint': 'Against attacks from monsters of your level',
        'status.block': 'Block chance',
        'unit.perSec': '/s',
        'unit.sec': 's',
        'unit.mps': 'm/s',
        'res.fire': 'Fire',
        'res.cold': 'Cold',
        'res.lightning': 'Lightning',
        'res.poison': 'Poison',
        'inv.equipment': 'Equipment',
        'inv.bag': 'Backpack',
        'inv.actionSlots': 'Action Slots',
        'inv.hint': 'Click: equip / unequip / item menu · Drag: move · Right-click / hold: details',
        'equipSlot.helmet': 'Helmet',
        'equipSlot.armor': 'Armor',
        'equipSlot.weapon': 'Weapon',
        'equipSlot.offhand': 'Off-hand',
        'equipSlot.ring1': 'Ring',
        'equipSlot.ring2': 'Ring',
        'equipSlot.boots': 'Boots',
        'inv.notEquip': 'That is not equipment.',
        'inv.reqLevel': 'Your level is too low to equip this.',
        'inv.wrongSlot': 'It cannot be equipped in that slot.',
        'inv.twoHandedOffhand': 'You cannot equip an off-hand item while wielding a two-handed weapon.',
        'inv.noSpaceTwoHanded': 'There is no free space for your off-hand item, so you cannot wield a two-handed weapon.',
        'inv.emptySlot': 'Nothing is equipped there.',
        'inv.full': 'Your inventory is full.',
        'inv.fullPickup': 'Your inventory is full. You cannot pick this up.',
        'inv.equipToAction': 'Equipment cannot be assigned to an action slot.',
        'inv.use': 'Use',
        'inv.assign': 'Assign to action slot',
        'inv.unassign': 'Remove from action slot',
        'inv.pickedUp': 'Obtained',
        'inv.discard': 'Discard',
        'inv.confirmDiscard': 'Discard “{name}”?\nDiscarded items cannot be recovered.',
        'inv.cannotDiscard': 'This item cannot be discarded.',
        'item.tier': 'Tier',
        'item.reqLv': 'Required level',
        'item.iLv': 'Item level',
        'item.sell': 'Sell price',
        'item.sellEach': 'Sell price (each)',
        'item.count': 'Owned',
        'item.engraving': 'Engraving',
        'item.atk': 'Attack',
        'item.magic': 'Magic power',
        'item.def': 'Defense',
        'item.interval': 'Attack interval',
        'item.reach': 'Reach',
        'item.boltRange': 'Bolt range',
        'item.pierceTargets': 'Pierce (targets)',
        'item.hands': 'Grip',
        'item.hands.1': 'One-handed',
        'item.hands.2': 'Two-handed',
        'item.block': 'Block chance',
        'item.moveSpeed': 'Move speed',
        'item.maxMp': 'Max MP',
        'item.critChance': 'Critical chance',
        'item.staminaRegen': 'Stamina regen',
        'item.throwBase': 'Throw damage',
        'item.starter': 'Starting gear',
        'item.none': 'You do not have any.',
        'item.disabled': 'You cannot use items right now.',
        'item.cooldown': 'Not ready yet (cooldown).',
        'item.casting': 'Already casting.',
        'item.revealed': 'The map has been revealed.',
        'item.recallDone': 'You returned to a sanctuary.',
        'item.recallCancelled': 'You were hit — the return was interrupted.',
        'itemType.pipe': 'Club',
        'itemType.sword': 'Sword',
        'itemType.gsword': 'Greatsword',
        'itemType.dagger': 'Dagger',
        'itemType.wand': 'Wand',
        'itemType.staff': 'Staff',
        'itemType.helmet': 'Helmet',
        'itemType.armor': 'Armor',
        'itemType.boots': 'Boots',
        'itemType.shield': 'Shield',
        'itemType.tome': 'Tome',
        'itemType.ring': 'Ring',
        'itemCat.hp': 'Health potion',
        'itemCat.mp': 'Mana potion',
        'itemCat.sta': 'Stamina potion',
        'itemCat.cure': 'Remedy',
        'itemCat.throw': 'Throwable',
        'itemCat.elixir': 'Battle elixir',
        'itemCat.scroll': 'Scroll',
        'itemCat.battery': 'Battery',
        'itemCat.glowstick': 'Glowstick',
        'itemCat.keycard': 'Keycard',
        'itemCat.fadedScroll': 'Scroll',
        'itemCat.tool': 'Tool',
        'item.ericOnly': 'Eric only',
        'item.energy': 'Energy',
        'item.noSellDiscard': 'Cannot be sold or discarded',
        'item.batteryAuto': 'Batteries are used automatically when the flashlight runs out.',
        'item.keycardUse': 'Swipe the keycard at the card reader to the right of the down elevator.',
        'item.keycardOne': 'You can only carry one keycard.',
        'consTier.1': 'Lesser',
        'consTier.2': 'Standard',
        'consTier.3': 'Greater',
        'affix.hpPct': 'Max HP',
        'affix.mpPct': 'Max MP',
        'affix.staminaPct': 'Max stamina',
        'affix.defPct': 'Defense',
        'affix.res1': '{el} resistance',
        'affix.resAll': 'All resistances',
        'affix.physPct': 'Physical attack',
        'affix.magicPct': 'Magic power',
        'affix.elemDmg': 'Added {el} damage (of physical attack)',
        'affix.atkSpeedPct': 'Attack speed',
        'affix.critChance': 'Critical chance',
        'affix.critDamage': 'Critical damage',
        'affix.lifeSteal': 'Life steal (of physical damage)',
        'affix.moveSpeedPct': 'Move speed',
        'affix.cdrPct': 'Skill cooldown',
        'affix.goldPct': 'Gold found',
        'skill.points': 'Skill points',
        'skill.hint': 'Drag empty space or use arrow keys / wheel to scroll · Click a skill for details',
        'skill.legend.learned': 'Learned',
        'skill.legend.learnable': 'Available',
        'skill.legend.locked': 'Locked',
        'skill.type.active': 'Active',
        'skill.type.passive': 'Passive',
        'skill.branch.base': 'Basic',
        'skill.branch.magic': 'Magic',
        'skill.branch.melee': 'Melee',
        'skill.branch.defense': 'Defense',
        'skill.branch.support': 'Support',
        'skill.branch.cross': 'Cross skill',
        'skill.level': 'Skill level',
        'skill.current': 'Current level',
        'skill.next': 'Next level',
        'skill.notLearnedYet': 'You have not learned this skill yet.',
        'skill.maxed': 'Maximum level reached.',
        'skill.cost': 'Cost',
        'skill.noCost': 'No cost',
        'skill.cooldown': 'Cooldown',
        'skill.cooldownAttack': 'Cooldown (= attack interval)',
        'skill.learn': 'Learn',
        'skill.levelUp': 'Level up',
        'skill.noPoints': 'No skill points left.',
        'skill.notConnected': 'Learn a connected skill first.',
        'skill.maxLevel': 'Already at maximum level.',
        'skill.unknown': 'Unknown skill.',
        'skill.assign': 'Assign to an action slot (click its slot again to remove)',
        'skill.notLearned': 'Learn this skill first.',
        'skill.passiveNote': 'Passive skills apply as soon as they are learned and are not assigned to action slots.',
    },
};
let currentLang = 'ko';
// 번역 문자열. params 의 {이름} 을 값으로 치환
function t(key, params) {
    let s = (I18N[currentLang] || I18N.ko)[key];
    if (s === undefined) s = I18N.ko[key];
    if (s === undefined) { console.warn('[i18n] 키 없음:', key); return key; }
    if (params) for (const k in params) s = s.split(`{${k}}`).join(String(params[k]));
    return s;
}
// 데이터 정의 (nameKo / nameEn 을 가진 객체) → 현재 언어의 이름
function localName(def) { return currentLang === 'en' ? def.nameEn : def.nameKo; }
// 테마 id → 현재 언어의 테마 이름 (모르는 id 는 그대로)
function themeLabel(id) {
    return THEMES[id] ? localName(THEMES[id]) : String(id || '?');
}

// ===== [04] 데이터 - 스킬 =====
// AGENTS.md "스킬 (트리형 구조)" 표를 옮긴 것 (PROGRESS.md 6.4 형식).
// - x, y: 스킬 트리 좌표 (y+ = 위). 화면에 그릴 때는 screenY = −y
// - cost: Lv1 소모량 (레벨당 +5% 는 costAtLevel), cooldown: 초 또는 (lv) => 초. 기본 공격의 null = 실제 공격 간격
// - values(lv): 레벨별 수치. 실행·상세 표시가 함께 쓰며, descKo / descEn 의 {이름} 자리에 같은 이름의 값이 들어간다
const SKILLS = [
    {
        id: 'BA', x: 0, y: 0, branch: 'base', type: 'active', maxLv: 10, nameKo: '기본 공격', nameEn: 'Basic Attack',
        resource: null, cost: 0, cooldown: null, element: null,
        values: (lv) => ({ coef: 95 + 5 * lv, magicCoef: 76 + 4 * lv }),
        descKo: '근접 무기: 전방 부채꼴 안 모든 적에게 물리 {coef}%. 완드·지팡이: 조준 방향으로 마력탄, 마법 {magicCoef}% 비전 피해',
        descEn: 'Melee weapon: physical {coef}% to all enemies in a frontal arc. Wand/staff: an arcane bolt toward the aim, magic {magicCoef}%',
    },
    // --- 1. 마법형 (북쪽)
    {
        id: 'M0', x: 0, y: 1, branch: 'magic', type: 'active', maxLv: 10, nameKo: '마력 화살', nameEn: 'Arcane Bolt',
        resource: 'mp', cost: 3, cooldown: 0.5, element: 'arcane',
        values: (lv) => ({ coef: 100 + 10 * lv }),
        descKo: '마력 화살 발사, 마법 {coef}% 비전 피해',
        descEn: 'Fires an arcane bolt dealing {coef}% magic arcane damage',
    },
    {
        id: 'M1', x: -1, y: 2, branch: 'magic', type: 'active', maxLv: 10, nameKo: '화염구', nameEn: 'Fireball',
        resource: 'mp', cost: 8, cooldown: 1.5, element: 'fire',
        values: (lv) => ({ coef: 135 + 15 * lv, radius: 3, speed: 22 }),
        descKo: '투사체 착탄 시 반경 {radius}m 폭발, 마법 {coef}% 화염 피해 + 화상',
        descEn: 'Explodes in a {radius}m radius on impact, dealing {coef}% magic fire damage and inflicting Burn',
    },
    {
        id: 'M2', x: -2, y: 3, branch: 'magic', type: 'passive', maxLv: 5, nameKo: '화염 숙련', nameEn: 'Fire Mastery',
        resource: null, cost: 0, cooldown: 0, element: null,
        values: (lv) => ({ firePct: 8 * lv, burnPct: 10 * lv }),
        descKo: '화염 피해 +{firePct}%, 화상 피해 +{burnPct}%',
        descEn: 'Fire damage +{firePct}%, Burn damage +{burnPct}%',
    },
    {
        id: 'M3', x: -3, y: 4, branch: 'magic', type: 'active', maxLv: 10, nameKo: '유성 낙하', nameEn: 'Meteor',
        resource: 'mp', cost: 30, cooldown: 12, element: 'fire',
        values: (lv) => ({ coef: 405 + 45 * lv, radius: 5, delay: 1, groundCoef: 30, groundTime: 3 }),
        descKo: '조준 지점에 {delay}초 후 운석 낙하, 반경 {radius}m 마법 {coef}% 화염 피해 + {groundTime}초간 불타는 지면 (초당 마법 {groundCoef}%)',
        descEn: 'A meteor strikes the aimed spot after {delay}s: {coef}% magic fire damage in {radius}m, then burning ground for {groundTime}s ({groundCoef}% magic per second)',
    },
    {
        id: 'M4', x: 0, y: 2, branch: 'magic', type: 'active', maxLv: 10, nameKo: '얼음 창', nameEn: 'Ice Lance',
        resource: 'mp', cost: 6, cooldown: 1, element: 'cold',
        values: (lv) => ({ coef: 108 + 12 * lv, maxTargets: 3 }),
        descKo: '최대 {maxTargets}명 관통, 마법 {coef}% 냉기 피해 + 둔화',
        descEn: 'Pierces up to {maxTargets} enemies, dealing {coef}% magic cold damage and Slow',
    },
    {
        id: 'M5', x: 0, y: 3, branch: 'magic', type: 'passive', maxLv: 5, nameKo: '냉기 숙련', nameEn: 'Frost Mastery',
        resource: null, cost: 0, cooldown: 0, element: null,
        values: (lv) => ({ coldPct: 8 * lv, slowBonus: 4 * lv, freezeChance: 2 * lv }),
        descKo: '냉기 피해 +{coldPct}%, 둔화 효과 +{slowBonus}%p, 냉기 피해 시 {freezeChance}% 확률로 빙결 1초',
        descEn: 'Cold damage +{coldPct}%, Slow +{slowBonus}%p, {freezeChance}% chance to Freeze for 1s on cold damage',
    },
    {
        id: 'M6', x: 0, y: 4, branch: 'magic', type: 'active', maxLv: 10, nameKo: '눈보라', nameEn: 'Blizzard',
        resource: 'mp', cost: 35, cooldown: 15, element: 'cold',
        values: (lv) => ({ coef: 36 + 4 * lv, radius: 7, duration: 5, tick: 0.5, slow: 40 }),
        descKo: '조준 지점 반경 {radius}m 에 {duration}초 지속, {tick}초마다 마법 {coef}% 냉기 피해, 범위 내 둔화 {slow}%',
        descEn: 'A blizzard on the aimed spot ({radius}m, {duration}s): {coef}% magic cold damage every {tick}s, {slow}% Slow inside',
    },
    {
        id: 'M7', x: 1, y: 2, branch: 'magic', type: 'active', maxLv: 10, nameKo: '연쇄 번개', nameEn: 'Chain Lightning',
        resource: 'mp', cost: 10, cooldown: 2, element: 'lightning',
        values: (lv) => ({ coef: 117 + 13 * lv, range: 20, bounceRange: 8, bounces: 2 + Math.floor(lv / 3), falloff: 10, shockChance: 20 }),
        descKo: '즉발 번개 (사거리 {range}m), 마법 {coef}% 전격 피해 후 {bounceRange}m 안의 다른 적에게 {bounces}회 튕김 (튕길 때마다 −{falloff}%), 감전 확률 {shockChance}%',
        descEn: 'Instant lightning (range {range}m): {coef}% magic lightning damage, then bounces {bounces} times to enemies within {bounceRange}m (−{falloff}% per bounce), {shockChance}% Shock chance',
    },
    {
        id: 'M8', x: 2, y: 3, branch: 'magic', type: 'passive', maxLv: 5, nameKo: '전격 숙련', nameEn: 'Lightning Mastery',
        resource: null, cost: 0, cooldown: 0, element: null,
        values: (lv) => ({ lightningPct: 8 * lv, shockChanceBonus: 4 * lv, shockBonus: 2 * lv }),
        descKo: '전격 피해 +{lightningPct}%, 감전 확률 +{shockChanceBonus}%p, 감전의 받는 피해 증가량 +{shockBonus}%p',
        descEn: 'Lightning damage +{lightningPct}%, Shock chance +{shockChanceBonus}%p, Shock damage taken +{shockBonus}%p',
    },
    {
        id: 'M9', x: 3, y: 4, branch: 'magic', type: 'active', maxLv: 10, nameKo: '번개 폭풍', nameEn: 'Thunderstorm',
        resource: 'mp', cost: 40, cooldown: 18, element: 'lightning',
        values: (lv) => ({ coef: 45 + 5 * lv, duration: 8, radius: 12, interval: 0.5, strikeRadius: 2 }),
        descKo: '{duration}초간 주위 {radius}m 안의 무작위 적에게 {interval}초마다 낙뢰 (반경 {strikeRadius}m), 마법 {coef}% 전격 피해',
        descEn: 'For {duration}s, lightning strikes a random enemy within {radius}m every {interval}s ({strikeRadius}m radius), {coef}% magic lightning damage',
    },
    // --- 2. 근거리 공격형 (동쪽) — 스태미너 소모
    {
        id: 'A0', x: 1, y: 0, branch: 'melee', type: 'active', maxLv: 10, nameKo: '강타', nameEn: 'Heavy Strike',
        resource: 'stamina', cost: 15, cooldown: 3, element: 'physical',
        values: (lv) => ({ coef: 165 + 15 * lv, knockback: 3 }),
        descKo: '전방 단일 대상 물리 {coef}%, 넉백 {knockback}m',
        descEn: 'Physical {coef}% to a single target in front, knockback {knockback}m',
    },
    {
        id: 'A1', x: 2, y: 1, branch: 'melee', type: 'active', maxLv: 10, nameKo: '연속 베기', nameEn: 'Flurry',
        resource: 'stamina', cost: 20, cooldown: 4, element: 'physical',
        values: (lv) => ({ coef: 54 + 6 * lv, hits: 3, duration: 0.6 }),
        descKo: '{duration}초간 {hits}회 연속 근접 공격 (무기 판정), 회당 물리 {coef}%',
        descEn: '{hits} rapid melee strikes over {duration}s (weapon hit area), physical {coef}% each',
    },
    {
        id: 'A2', x: 3, y: 2, branch: 'melee', type: 'passive', maxLv: 5, nameKo: '무기 숙련', nameEn: 'Weapon Mastery',
        resource: null, cost: 0, cooldown: 0, element: null,
        values: (lv) => ({ meleePct: 6 * lv, atkSpeedPct: 3 * lv }),
        descKo: '근접 물리 피해 +{meleePct}%, 공격 속도 +{atkSpeedPct}%',
        descEn: 'Melee physical damage +{meleePct}%, attack speed +{atkSpeedPct}%',
    },
    {
        id: 'A3', x: 4, y: 3, branch: 'melee', type: 'active', maxLv: 10, nameKo: '칼날 폭풍', nameEn: 'Bladestorm',
        resource: 'stamina', cost: 40, cooldown: 15, element: 'physical',
        values: (lv) => ({ coef: 36 + 4 * lv, duration: 3, radius: 4, interval: 0.25, moveSlow: 30 }),
        descKo: '{duration}초간 회전 (이동 가능, 이동 속도 −{moveSlow}%), 주위 {radius}m 에 {interval}초마다 물리 {coef}%, 지속 중 넉백·경직 면역',
        descEn: 'Spin for {duration}s (can move at −{moveSlow}% speed), physical {coef}% within {radius}m every {interval}s, immune to knockback and stagger',
    },
    {
        id: 'A4', x: 2, y: 0, branch: 'melee', type: 'active', maxLv: 10, nameKo: '돌진', nameEn: 'Charge',
        resource: 'stamina', cost: 20, cooldown: 6, element: 'physical',
        values: (lv) => ({ coef: 108 + 12 * lv, distance: 10, stun: 0.5 }),
        descKo: '조준 방향 최대 {distance}m 돌진 (벽에 막히면 정지), 경로상 적에게 물리 {coef}% + 기절 {stun}초',
        descEn: 'Charge up to {distance}m toward the aim (stops at walls), physical {coef}% and {stun}s Stun to enemies in the path',
    },
    {
        id: 'A5', x: 3, y: 0, branch: 'melee', type: 'passive', maxLv: 5, nameKo: '급소 노리기', nameEn: 'Precision',
        resource: null, cost: 0, cooldown: 0, element: null,
        values: (lv) => ({ critChance: 3 * lv, critDamage: 10 * lv }),
        descKo: '치명타 확률 +{critChance}%p, 치명타 피해 +{critDamage}%p',
        descEn: 'Critical chance +{critChance}%p, critical damage +{critDamage}%p',
    },
    {
        id: 'A6', x: 4, y: 0, branch: 'melee', type: 'active', maxLv: 10, nameKo: '처형', nameEn: 'Execute',
        resource: 'stamina', cost: 35, cooldown: 12, element: 'physical',
        values: (lv) => ({ coef: 270 + 30 * lv, executeHpPct: 30, executeMul: 2, refundPct: 50 }),
        descKo: '단일 대상 물리 {coef}%, 대상 HP {executeHpPct}% 이하면 피해 {executeMul}배, 처치 시 재사용 대기 {refundPct}% 반환',
        descEn: 'Physical {coef}% to a single target, ×{executeMul} damage at or below {executeHpPct}% HP, refunds {refundPct}% of the cooldown on kill',
    },
    {
        id: 'A7', x: 2, y: -1, branch: 'melee', type: 'active', maxLv: 10, nameKo: '깊은 상처', nameEn: 'Rend',
        resource: 'stamina', cost: 15, cooldown: 5, element: 'physical',
        values: (lv) => ({ coef: 90 + 10 * lv, bleedCoef: 90 + 10 * lv, bleedTime: 5 }),
        descKo: '물리 {coef}% + {bleedTime}초간 출혈 (총 물리 {bleedCoef}%)',
        descEn: 'Physical {coef}% plus Bleed for {bleedTime}s (total physical {bleedCoef}%)',
    },
    {
        id: 'A8', x: 3, y: -2, branch: 'melee', type: 'passive', maxLv: 5, nameKo: '피의 갈증', nameEn: 'Bloodlust',
        resource: null, cost: 0, cooldown: 0, element: null,
        values: (lv) => ({ lifeSteal: 1 * lv, lowHpPhysPct: 5 * lv }),
        descKo: '가한 물리 피해의 {lifeSteal}% 만큼 HP 흡수, HP 50% 이하일 때 물리 피해 +{lowHpPhysPct}%',
        descEn: 'Heal {lifeSteal}% of physical damage dealt; physical damage +{lowHpPhysPct}% at or below 50% HP',
    },
    {
        id: 'A9', x: 4, y: -3, branch: 'melee', type: 'active', maxLv: 10, nameKo: '대지 분쇄', nameEn: 'Earthshatter',
        resource: 'stamina', cost: 45, cooldown: 14, element: 'physical',
        values: (lv) => ({ coef: 288 + 32 * lv, range: 8, arcDeg: 90, stun: 1.5 }),
        descKo: '지면을 내리쳐 전방 {range}m · {arcDeg}° 부채꼴 충격파, 물리 {coef}% + 기절 {stun}초',
        descEn: 'Slam the ground: a shockwave in a {range}m, {arcDeg}° cone, physical {coef}% and {stun}s Stun',
    },
    // --- 3. 방어형 (남쪽)
    {
        id: 'D0', x: 0, y: -1, branch: 'defense', type: 'active', maxLv: 10, nameKo: '수호 태세', nameEn: 'Guard Stance',
        resource: 'mp', cost: 8, cooldown: 12, element: null,
        values: (lv) => ({ reduction: 18 + 2 * lv, duration: 5 }),
        descKo: '{duration}초간 받는 모든 피해 −{reduction}%, 넉백·경직 면역',
        descEn: 'For {duration}s, all damage taken −{reduction}%, immune to knockback and stagger',
    },
    {
        id: 'D1', x: 1, y: -2, branch: 'defense', type: 'active', maxLv: 10, nameKo: '방패 강타', nameEn: 'Shield Bash',
        resource: 'stamina', cost: 15, cooldown: 6, element: 'physical',
        values: (lv) => ({ coef: 90 + 10 * lv, defCoef: 50, stun: 0.9 + 0.1 * lv, shieldDmgPct: 30, shieldStunMul: 1.5 }),
        descKo: '전방 단일 대상 물리 {coef}% + 방어력 × {defCoef}% 추가 피해, 기절 {stun}초. 방패 장착 시 피해 +{shieldDmgPct}%, 기절 시간 {shieldStunMul}배',
        descEn: 'Physical {coef}% plus {defCoef}% of defense to a single target, {stun}s Stun. With a shield: damage +{shieldDmgPct}%, stun ×{shieldStunMul}',
    },
    {
        id: 'D2', x: 2, y: -3, branch: 'defense', type: 'passive', maxLv: 5, nameKo: '철갑 피부', nameEn: 'Iron Skin',
        resource: null, cost: 0, cooldown: 0, element: null,
        values: (lv) => ({ defPct: 6 * lv, projectileReduce: 2 * lv }),
        descKo: '방어력 +{defPct}%, 받는 투사체 피해 −{projectileReduce}%',
        descEn: 'Defense +{defPct}%, projectile damage taken −{projectileReduce}%',
    },
    {
        id: 'D3', x: 3, y: -4, branch: 'defense', type: 'active', maxLv: 10, nameKo: '가시 갑옷', nameEn: 'Thorns',
        resource: 'mp', cost: 20, cooldown: 20, element: null,
        values: (lv) => ({ reflectPct: 25 + 5 * lv, defPct: 20, duration: 10 }),
        descKo: '{duration}초간 방어력 +{defPct}%, 근접 공격을 받으면 공격자에게 받은 피해 (감소 전) 의 {reflectPct}% 반사',
        descEn: 'For {duration}s, defense +{defPct}% and reflect {reflectPct}% of melee damage taken (before reduction)',
    },
    {
        id: 'D4', x: 0, y: -2, branch: 'defense', type: 'passive', maxLv: 10, nameKo: '강인한 체력', nameEn: 'Vitality',
        resource: null, cost: 0, cooldown: 0, element: null,
        values: (lv) => ({ hpPct: 4 * lv, hpRegenPct: 10 * lv }),
        descKo: '최대 HP +{hpPct}%, HP 자연 회복 +{hpRegenPct}%',
        descEn: 'Max HP +{hpPct}%, HP regeneration +{hpRegenPct}%',
    },
    {
        id: 'D5', x: 0, y: -3, branch: 'defense', type: 'active', maxLv: 10, nameKo: '위협의 함성', nameEn: 'Intimidating Shout',
        resource: 'mp', cost: 15, cooldown: 20, element: null,
        values: (lv) => ({ atkDown: 13.5 + 1.5 * lv, radius: 10, duration: 6, fear: 2 }),
        descKo: '주위 {radius}m 적의 공격력 −{atkDown}% ({duration}초), 일반 몬스터는 추가로 공포 {fear}초',
        descEn: 'Enemies within {radius}m deal −{atkDown}% damage for {duration}s; non-boss monsters are also Feared for {fear}s',
    },
    {
        id: 'D6', x: 0, y: -4, branch: 'defense', type: 'passive', maxLv: 5, nameKo: '불굴', nameEn: 'Undying',
        resource: null, cost: 0, cooldown: (lv) => 150 - 20 * lv, element: null,
        values: (lv) => ({ invuln: 2, cooldown: 150 - 20 * lv }),
        descKo: 'HP 가 0 이 되는 피해를 받으면 HP 1 로 생존하고 {invuln}초간 무적 (발동 대기 {cooldown}초)',
        descEn: 'Survive a fatal blow with 1 HP and become invulnerable for {invuln}s (internal cooldown {cooldown}s)',
    },
    {
        id: 'D7', x: -1, y: -2, branch: 'defense', type: 'passive', maxLv: 10, nameKo: '원소 저항', nameEn: 'Elemental Resistance',
        resource: null, cost: 0, cooldown: 0, element: null,
        values: (lv) => ({ resAll: 3 * lv }),
        descKo: '화염·냉기·전격·독 저항 각 +{resAll}%p',
        descEn: 'Fire, cold, lightning and poison resistance +{resAll}%p each',
    },
    {
        id: 'D8', x: -2, y: -3, branch: 'defense', type: 'active', maxLv: 10, nameKo: '원소 보호막', nameEn: 'Elemental Ward',
        resource: 'mp', cost: 20, cooldown: 25, element: null,
        values: (lv) => ({ resAll: 18 + 2 * lv, duration: 8, resCap: 80 }),
        descKo: '{duration}초간 모든 저항 +{resAll}%p, 지속 중 저항 상한 {resCap}%',
        descEn: 'For {duration}s, all resistances +{resAll}%p and the resistance cap becomes {resCap}%',
    },
    {
        id: 'D9', x: -3, y: -4, branch: 'defense', type: 'active', maxLv: 10, nameKo: '마력 보호막', nameEn: 'Mana Shield',
        resource: 'mp', cost: 30, cooldown: 30, element: null,
        values: (lv) => ({ mpPct: 18 + 2 * lv, magicCoef: 200, duration: 10 }),
        descKo: '{duration}초간 [최대 MP × {mpPct}% + 마법 공격력 × {magicCoef}%] 만큼 피해를 흡수하는 보호막',
        descEn: 'For {duration}s, a shield that absorbs [max MP × {mpPct}% + magic attack × {magicCoef}%] damage',
    },
    // --- 4. 보조형 (서쪽)
    {
        id: 'S0', x: -1, y: 0, branch: 'support', type: 'active', maxLv: 10, nameKo: '응급 처치', nameEn: 'First Aid',
        resource: 'mp', cost: 12, cooldown: 15, element: null,
        values: (lv) => ({ healPct: 13 + 2 * lv }),
        descKo: '즉시 최대 HP 의 {healPct}% 회복',
        descEn: 'Instantly restore {healPct}% of max HP',
    },
    {
        id: 'S1', x: -2, y: -1, branch: 'support', type: 'passive', maxLv: 5, nameKo: '약초학', nameEn: 'Herbalism',
        resource: null, cost: 0, cooldown: 0, element: null,
        values: (lv) => ({ potionPct: 8 * lv, potionCdSec: 0.2 * lv }),
        descKo: '물약 회복량 +{potionPct}%, 물약 공용 재사용 대기 −{potionCdSec}초',
        descEn: 'Potion recovery +{potionPct}%, shared potion cooldown −{potionCdSec}s',
    },
    {
        id: 'S2', x: -3, y: -2, branch: 'support', type: 'active', maxLv: 10, nameKo: '정화', nameEn: 'Purify',
        resource: 'mp', cost: 15, cooldown: (lv) => 21 - lv, element: null,
        values: (lv) => ({ immune: 2 + 0.3 * lv }),
        descKo: '모든 상태이상 해제 + {immune}초간 상태이상 면역',
        descEn: 'Remove all status effects and become immune to them for {immune}s',
    },
    {
        id: 'S3', x: -4, y: -3, branch: 'support', type: 'active', maxLv: 10, nameKo: '재생의 기운', nameEn: 'Regeneration',
        resource: 'mp', cost: 30, cooldown: 40, element: null,
        values: (lv) => ({ healPct: 1.8 + 0.2 * lv, duration: 10 }),
        descKo: '{duration}초간 초당 최대 HP 의 {healPct}% 회복',
        descEn: 'Restore {healPct}% of max HP per second for {duration}s',
    },
    {
        id: 'S4', x: -2, y: 0, branch: 'support', type: 'active', maxLv: 10, nameKo: '가속', nameEn: 'Haste',
        resource: 'mp', cost: 15, cooldown: 25, element: null,
        values: (lv) => ({ atkSpeedPct: 8 + 2 * lv, moveSpeedPct: 20, duration: 8 }),
        descKo: '{duration}초간 이동 속도 +{moveSpeedPct}%, 공격 속도 +{atkSpeedPct}%',
        descEn: 'For {duration}s, movement speed +{moveSpeedPct}% and attack speed +{atkSpeedPct}%',
    },
    {
        id: 'S5', x: -3, y: 0, branch: 'support', type: 'passive', maxLv: 5, nameKo: '탐험가의 감각', nameEn: "Explorer's Instinct",
        resource: null, cost: 0, cooldown: 0, element: null,
        values: (lv) => ({ revealRadius: 1 + lv, goldPct: 5 * lv, showFacilities: lv >= 3, showStairs: lv >= 5 }),
        descKo: '현재 위치 주변 {revealRadius}칸을 방문하지 않아도 지도에 밝힘, 골드 획득 +{goldPct}%. Lv3 이상: 층 진입 시 포탈·방랑 상인 위치 표시, Lv5: 엘리베이터 위치도 표시',
        descEn: 'Reveal the map within {revealRadius} cells, gold +{goldPct}%. Lv3+: show the portal and merchant when entering a floor. Lv5: also show the elevators',
    },
    {
        id: 'S6', x: -4, y: 0, branch: 'support', type: 'active', maxLv: 10, nameKo: '순간이동', nameEn: 'Blink',
        resource: 'mp', cost: 20, cooldown: (lv) => 10.5 - 0.5 * lv, element: null,
        values: (lv) => ({ distance: 7.5 + 0.5 * lv, invuln: 0.3 }),
        descKo: '조준 방향 최대 {distance}m 순간이동 (벽 통과 불가, 벽 앞에서 멈춤), 이동 직후 {invuln}초 무적',
        descEn: 'Teleport up to {distance}m toward the aim (cannot pass walls), invulnerable for {invuln}s afterwards',
    },
    {
        id: 'S7', x: -2, y: 1, branch: 'support', type: 'passive', maxLv: 10, nameKo: '명상', nameEn: 'Meditation',
        resource: null, cost: 0, cooldown: 0, element: null,
        values: (lv) => ({ mpPct: 3 * lv, mpRegenPct: 10 * lv }),
        descKo: '최대 MP +{mpPct}%, MP 자연 회복 +{mpRegenPct}%',
        descEn: 'Max MP +{mpPct}%, MP regeneration +{mpRegenPct}%',
    },
    {
        id: 'S8', x: -3, y: 2, branch: 'support', type: 'passive', maxLv: 5, nameKo: '주문 가속', nameEn: 'Quickening',
        resource: null, cost: 0, cooldown: 0, element: null,
        values: (lv) => ({ cdrPct: 3 * lv }),
        descKo: '모든 스킬 재사용 대기 −{cdrPct}% (기본 공격 제외)',
        descEn: 'All skill cooldowns −{cdrPct}% (except Basic Attack)',
    },
    {
        id: 'S9', x: -4, y: 3, branch: 'support', type: 'active', maxLv: 10, nameKo: '마나 샘', nameEn: 'Mana Spring',
        resource: 'mp', cost: 0, cooldown: 60, element: null,
        values: (lv) => ({ restorePct: 22.5 + 2.5 * lv, duration: 8, mpCostReduce: 30 }),
        descKo: '즉시 최대 MP 의 {restorePct}% 회복, {duration}초간 스킬 MP 소모 −{mpCostReduce}%',
        descEn: 'Instantly restore {restorePct}% of max MP; skill MP costs −{mpCostReduce}% for {duration}s',
    },
    // --- 5. 교차 스킬 (갈래 사이 모서리)
    {
        id: 'X1', x: 4, y: 4, branch: 'cross', type: 'active', maxLv: 5, nameKo: '원소 부여', nameEn: 'Elemental Weapon',
        resource: 'mp', cost: 15, cooldown: 30, element: null,
        values: (lv) => ({ coef: 32 + 8 * lv, duration: 15, effectChance: 10 }),
        descKo: '{duration}초간 기본 공격·근거리 공격형 스킬 적중 시 마법 {coef}% 원소 추가 피해. 원소는 마지막으로 사용한 화염·냉기·전격 스킬의 속성 (없으면 비전), {effectChance}% 확률로 해당 상태이상',
        descEn: 'For {duration}s, basic attacks and melee skills deal an extra {coef}% magic elemental damage. The element follows the last fire/cold/lightning skill used (arcane if none), with a {effectChance}% chance to apply its status effect',
    },
    {
        id: 'X2', x: 4, y: -4, branch: 'cross', type: 'passive', maxLv: 5, nameKo: '반격', nameEn: 'Counterattack',
        resource: null, cost: 0, cooldown: 0, element: null,
        values: (lv) => ({ chance: 8 + 2 * lv, reducePct: 50, counterCoef: 150 }),
        descKo: '근접 공격을 받을 때 {chance}% 확률로 그 피해 {reducePct}% 감소 + 즉시 물리 {counterCoef}% 반격',
        descEn: 'When hit by a melee attack, {chance}% chance to reduce that damage by {reducePct}% and counter for physical {counterCoef}%',
    },
    {
        id: 'X3', x: -4, y: -4, branch: 'cross', type: 'active', maxLv: 5, nameKo: '임시 성역', nameEn: 'Field Sanctum',
        resource: 'mp', cost: 50, cooldown: (lv) => 126 - 6 * lv, element: null,
        values: (lv) => ({ regenPct: 1.5 + 0.5 * lv, radius: 4, duration: 8 }),
        descKo: '현재 위치 반경 {radius}m 에 {duration}초간 결계: 안으로 들어오는 적 투사체 소멸, HP·MP 초당 {regenPct}% 회복. 진짜 성소가 아니므로 저장 불가, 몬스터 진입은 막지 못함',
        descEn: 'A {radius}m ward for {duration}s: enemy projectiles entering it vanish and HP/MP regenerate {regenPct}% per second. Not a real sanctuary: you cannot save there and monsters can still enter',
    },
    {
        id: 'X4', x: -4, y: 4, branch: 'cross', type: 'active', maxLv: 5, nameKo: '시간 왜곡', nameEn: 'Time Warp',
        resource: 'mp', cost: 40, cooldown: 60, element: null,
        values: (lv) => ({ slowPct: 36 + 4 * lv, radius: 12, duration: 6 }),
        descKo: '주위 {radius}m 안의 적과 적 투사체의 속도 −{slowPct}% ({duration}초)',
        descEn: 'Enemies and enemy projectiles within {radius}m are slowed by {slowPct}% for {duration}s',
    },
];
// 연결선 48개: 기본 공격 – 뿌리 (4), 뿌리 – 줄기 첫 스킬 (12), 줄기 안 연속 (24), 교차 스킬 – 양쪽 끝 (8)
const SKILL_LINKS = (() => {
    const links = [['BA', 'M0'], ['BA', 'A0'], ['BA', 'D0'], ['BA', 'S0']];
    for (const b of ['M', 'A', 'D', 'S']) {
        for (const s of [1, 4, 7]) links.push([b + '0', b + s], [b + s, b + (s + 1)], [b + (s + 1), b + (s + 2)]);
    }
    links.push(['M9', 'X1'], ['A3', 'X1'], ['A9', 'X2'], ['D3', 'X2'], ['D9', 'X3'], ['S3', 'X3'], ['S9', 'X4'], ['M3', 'X4']);
    return links;
})();
const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
// 스킬 id → 연결된 (인접한) 스킬 id 목록
const SKILL_NEIGHBORS = (() => {
    const map = Object.fromEntries(SKILLS.map((s) => [s.id, []]));
    for (const [a, b] of SKILL_LINKS) { map[a].push(b); map[b].push(a); }
    return map;
})();
// 스킬의 재사용 대기 (초). 기본 공격은 null (= 실제 공격 간격)
function skillCooldown(skill, lv) {
    return typeof skill.cooldown === 'function' ? skill.cooldown(lv) : skill.cooldown;
}

// ===== [05] 데이터 - 아이템·장비 =====
// --- 소모품 (AGENTS.md "아이템 > 소모품 목록"). id = 분류 접두사 + 단계 (1 하급, 2 중급, 3 상급)
// effect 의 % 값은 퍼센트 숫자. duration = 초
const CONSUMABLES = {};
for (const [id, category, tier, nameKo, nameEn, price, effect] of [
    ['hp1', 'hp', 1, '하급 생명력 물약', 'Lesser Health Potion', 20, { hpPct: 30 }],
    ['hp2', 'hp', 2, '생명력 물약', 'Health Potion', 60, { hpPct: 50 }],
    ['hp3', 'hp', 3, '상급 생명력 물약', 'Greater Health Potion', 150, { hpPct: 80 }],
    ['mp1', 'mp', 1, '하급 마나 물약', 'Lesser Mana Potion', 20, { mpPct: 30 }],
    ['mp2', 'mp', 2, '마나 물약', 'Mana Potion', 60, { mpPct: 50 }],
    ['mp3', 'mp', 3, '상급 마나 물약', 'Greater Mana Potion', 150, { mpPct: 80 }],
    ['sta1', 'sta', 1, '하급 활력 물약', 'Lesser Stamina Potion', 15, { staminaPct: 100, clearExhaust: true }],
    ['sta2', 'sta', 2, '활력 물약', 'Stamina Potion', 45, { staminaPct: 100, clearExhaust: true, staminaRegenMul: 2, duration: 10 }],
    ['sta3', 'sta', 3, '상급 활력 물약', 'Greater Stamina Potion', 120, { staminaPct: 100, clearExhaust: true, noStaminaCost: true, duration: 10 }],
    ['cure1', 'cure', 1, '해독제', 'Antidote', 15, { cure: ['poison', 'burn'] }],
    ['cure2', 'cure', 2, '만능 치료제', 'Panacea', 50, { cure: 'all' }],
    ['cure3', 'cure', 3, '성수', 'Holy Water', 200, { cure: 'all', immuneTime: 10, hpPct: 20 }],
    // 투척물: coef 는 "투척 기준 피해" (8 + 주인공 레벨 × 4) 대비 %
    ['throw1', 'throw', 1, '화염병', 'Firebomb', 25, { radius: 3, coef: 100, element: 'fire', effect: 'burn', groundCoef: 20, groundTime: 3 }],
    ['throw2', 'throw', 2, '독 플라스크', 'Poison Flask', 70, { radius: 4, cloudTime: 6, tickCoef: 35, element: 'poison', effect: 'poison' }],
    ['throw3', 'throw', 3, '천둥 폭탄', 'Thunder Bomb', 180, { radius: 5, coef: 250, element: 'lightning', effect: 'shock', stun: 1 }],
    ['elixir1', 'elixir', 1, '하급 전투 영약', 'Lesser Battle Elixir', 40, { duration: 60, dmgPct: 10 }],
    ['elixir2', 'elixir', 2, '전투 영약', 'Battle Elixir', 120, { duration: 90, dmgPct: 20, atkSpeedPct: 10 }],
    ['elixir3', 'elixir', 3, '상급 전투 영약', 'Greater Battle Elixir', 300, { duration: 120, dmgPct: 30, atkSpeedPct: 15, damageTakenPct: -10 }],
    ['scroll1', 'scroll', 1, '탐색 주문서', 'Scroll of Scouting', 30, { revealRadius: 8 }],
    ['scroll2', 'scroll', 2, '전지의 주문서', 'Scroll of Omniscience', 100, { revealAll: true, showFacilities: true }],
    ['scroll3', 'scroll', 3, '귀환 주문서', 'Scroll of Return', 250, { returnToSanctuary: true, castTime: 3 }],
]) CONSUMABLES[id] = { id, category, tier, nameKo, nameEn, price, effect };
// --- "에릭" 전용 아이템 (AGENTS.md "아이템 > 에릭 전용 아이템", 18-1, U41).
// 플래시 = 도구 (kind 'tool', 인벤토리 1칸, 겹치지 않음, 새로 얻을 수 없고 팔거나 버릴 수 없다. 칸 이동·행동 슬롯 등록은 된다).
// 배터리 = 소모품 (분류 battery, hero 'eric' — 마틴의 드롭·상점·디버그 채우기에는 나오지 않음, 단계 없음, 직접 쓸 수 없고 플래시 에너지가 0 이 되면 자동 소모)
const FLASH_ENERGY_MAX = 300;   // 플래시 에너지 (초). 배터리 1개 = 300초
const TOOLS = { flashlight: { id: 'flashlight', nameKo: '플래시', nameEn: 'Flashlight' } };
// 2026-10-25 AGENTS.md (22-2, U53): 야광봉·카드키·빛 바랜 주문서도 에릭 전용 소모품 (단계 0, 장롱에서만 나온다).
//   stack     = 1칸 최대 개수 (없으면 STACK_MAX). 배터리·야광봉·빛 바랜 주문서는 "여러 개를 들고 다녀도 1칸" → ERIC_STACK_MAX
//   unique    = 1개만 가질 수 있음 (카드키), noDiscard = 버릴 수 없음 (카드키: 층마다 1개뿐이라 버리면 내려갈 수 없다)
//   useReason = 직접 쓸 수 없는 이유 (번역 키). 이런 아이템은 [사용] 이 회색이고 행동 슬롯에도 넣지 않는다
const ERIC_STACK_MAX = 999;
CONSUMABLES.battery = { id: 'battery', category: 'battery', tier: 0, nameKo: '배터리', nameEn: 'Battery', price: 0, effect: { energy: FLASH_ENERGY_MAX }, hero: 'eric', stack: ERIC_STACK_MAX, useReason: 'item.batteryAuto' };
CONSUMABLES.glowstick = { id: 'glowstick', category: 'glowstick', tier: 0, nameKo: '야광봉', nameEn: 'Glowstick', price: 0, effect: { glowstick: true }, hero: 'eric', stack: ERIC_STACK_MAX };
CONSUMABLES.keycard = { id: 'keycard', category: 'keycard', tier: 0, nameKo: '카드키', nameEn: 'Keycard', price: 0, effect: {}, hero: 'eric', stack: 1, unique: true, noDiscard: true, useReason: 'item.keycardUse' };
CONSUMABLES.fadedScroll = { id: 'fadedScroll', category: 'fadedScroll', tier: 0, nameKo: '빛 바랜 주문서', nameEn: 'Faded Scroll', price: 0, effect: { warp: true }, hero: 'eric', stack: ERIC_STACK_MAX, short: ['바랜', 'Fa'] };
function stackMaxOf(id) { return CONSUMABLES[id].stack || STACK_MAX; }
// 야광봉 (22-3, U54): 주인공 앞 0.6m 바닥에 놓는다 (벽이면 발밑). 빛 = 주위 2칸 (32m) — 에릭 층에 조명 4개를 늘 두고 주인공에게 가까운 야광봉에 배정
// (조명 개수를 바꾸지 않는 규칙, 8절 16번). 한 층 최대 64개 (넘으면 오래된 것부터), 주인공이 그 층에서 2층 이상 멀어지면 사라진다.
// 야광봉이 있는 층은 카메라 far 를 viewFar 로 넓혀 멀리서도 보이게 한다 (지형은 검은 안개에 묻혀 그대로 안 보이고, 가린 벽은 깊이로 가린다)
const GLOWSTICK = { drop: 0.6, lights: 4, lightDist: 32, lightIntensity: 10, lightY: 0.5, color: 0x7dff9a, max: 64, keepFloors: 2, viewFar: 1200 };
const CONSUMABLE_TIER_MIN_FLOOR = { 1: 1, 2: 8, 3: 18 };   // 단계별 등장 층
const CONSUMABLE_DROP_WEIGHTS = { 1: 5, 2: 3, 3: 2 };      // 드롭 단계 가중치 (하급 5 : 중급 3 : 상급 2)
const POTION_COOLDOWN = 3;                                  // 물약류 (생명력·마나·활력·치료제) 공용 재사용 대기 (초)
const THROW_COOLDOWN = 1;                                   // 투척물 재사용 대기 (초)
const STACK_MAX = 20;                                       // 소모품 1칸 최대 개수
const INVENTORY_SIZE = 40;

// --- 장비 단계 (AGENTS.md "장비 > 공통 규칙")
const TIER_INFO = {
    1: { reqLv: 1, minFloor: 1, basePrice: 40 },
    2: { reqLv: 10, minFloor: 10, basePrice: 180 },
    3: { reqLv: 25, minFloor: 25, basePrice: 600 },
};
// --- 등급: 출현 확률 (%), 색, 부가 옵션 개수 [최소, 최대], 가격 배수
const RARITIES = {
    normal: { weight: 65, color: '#ffffff', affixCount: [0, 0], priceMul: 1, nameKo: '일반', nameEn: 'Normal' },
    magic: { weight: 28, color: '#5c8cff', affixCount: [1, 2], priceMul: 2.5, nameKo: '마법', nameEn: 'Magic' },
    rare: { weight: 7, color: '#ffd24a', affixCount: [3, 4], priceMul: 6, nameKo: '희귀', nameEn: 'Rare' },
};
// --- 무기 종류별 공통 특성 (AGENTS.md "무기 종류별 특성"). fist = 무기 없음 (맨손)
const WEAPON_TYPES = {
    fist: { interval: 0.8, melee: true, range: 2.0, arcDeg: 60, pierce: 0 },
    pipe: { interval: 0.8, melee: true, range: 2.3, arcDeg: 80, pierce: 0 },
    sword: { interval: 0.7, melee: true, range: 2.5, arcDeg: 90, pierce: 0 },
    gsword: { interval: 1.2, melee: true, range: 3.0, arcDeg: 120, pierce: 0 },
    dagger: { interval: 0.45, melee: true, range: 2.0, arcDeg: 60, pierce: 0 },
    wand: { interval: 0.8, melee: false, range: 30, arcDeg: 0, pierce: 0 },
    staff: { interval: 1.2, melee: false, range: 30, arcDeg: 0, pierce: 1 },   // "2명 관통" = 첫 대상 뒤 1명 더
};
const UNARMED_ATK = 2;   // 무기 미장착 시 무기 공격력
// --- 장비 기본 아이템 36종 (6.5 형식). atk = 공격력, magic = 마력, def = 방어력.
// atk·magic·def 는 iLv 로 보정하고, 나머지 % 값 (mpPct, critChance, moveSpeedPct, staminaRegenPct, blockChance) 은 보정하지 않는다
const EQUIP_BASES = {};
function defineEquip(id, slot, tier, nameKo, nameEn, stats) {
    EQUIP_BASES[id] = { id, slot, tier, reqLv: tier === 0 ? 1 : TIER_INFO[tier].reqLv, nameKo, nameEn, ...stats };
}
// 시작 장비 (0단계, iLv 보정 없음, 판매가 1 G)
defineEquip('pipe0', 'weapon', 0, '녹슨 쇠파이프', 'Rusty Pipe', { weaponType: 'pipe', hands: 1, atk: 5, magic: 0 });
defineEquip('tracksuit0', 'armor', 0, '트레이닝복', 'Tracksuit', { def: 2, staminaRegenPct: 10 });
defineEquip('shoes0', 'boots', 0, '러닝화', 'Running Shoes', { def: 1, moveSpeedPct: 2 });
// 무기
defineEquip('sword1', 'weapon', 1, '철검', 'Iron Sword', { weaponType: 'sword', hands: 1, atk: 8, magic: 0 });
defineEquip('sword2', 'weapon', 2, '강철 장검', 'Steel Longsword', { weaponType: 'sword', hands: 1, atk: 18, magic: 0 });
defineEquip('sword3', 'weapon', 3, '미스릴 검', 'Mithril Sword', { weaponType: 'sword', hands: 1, atk: 40, magic: 0 });
defineEquip('gsword1', 'weapon', 1, '대검', 'Greatsword', { weaponType: 'gsword', hands: 2, atk: 14, magic: 0 });
defineEquip('gsword2', 'weapon', 2, '강철 대검', 'Steel Greatsword', { weaponType: 'gsword', hands: 2, atk: 32, magic: 0 });
defineEquip('gsword3', 'weapon', 3, '미스릴 클레이모어', 'Mithril Claymore', { weaponType: 'gsword', hands: 2, atk: 70, magic: 0 });
defineEquip('dagger1', 'weapon', 1, '단검', 'Dagger', { weaponType: 'dagger', hands: 1, atk: 5, magic: 0, critChance: 10 });
defineEquip('dagger2', 'weapon', 2, '강철 단검', 'Steel Dagger', { weaponType: 'dagger', hands: 1, atk: 12, magic: 0, critChance: 12 });
defineEquip('dagger3', 'weapon', 3, '미스릴 단검', 'Mithril Dagger', { weaponType: 'dagger', hands: 1, atk: 26, magic: 0, critChance: 15 });
defineEquip('wand1', 'weapon', 1, '참나무 완드', 'Oak Wand', { weaponType: 'wand', hands: 1, atk: 2, magic: 6 });
defineEquip('wand2', 'weapon', 2, '은 완드', 'Silver Wand', { weaponType: 'wand', hands: 1, atk: 4, magic: 14 });
defineEquip('wand3', 'weapon', 3, '미스릴 완드', 'Mithril Wand', { weaponType: 'wand', hands: 1, atk: 8, magic: 30 });
defineEquip('staff1', 'weapon', 1, '견습생 지팡이', 'Apprentice Staff', { weaponType: 'staff', hands: 2, atk: 4, magic: 12, mpPct: 10 });
defineEquip('staff2', 'weapon', 2, '마법사 지팡이', 'Wizard Staff', { weaponType: 'staff', hands: 2, atk: 8, magic: 28, mpPct: 20 });
defineEquip('staff3', 'weapon', 3, '대마법사 지팡이', 'Archmage Staff', { weaponType: 'staff', hands: 2, atk: 16, magic: 60, mpPct: 30 });
// 방어구
defineEquip('helm1', 'helmet', 1, '가죽 모자', 'Leather Cap', { def: 4 });
defineEquip('helm2', 'helmet', 2, '강철 투구', 'Steel Helm', { def: 10 });
defineEquip('helm3', 'helmet', 3, '미스릴 투구', 'Mithril Helm', { def: 22 });
defineEquip('armor1', 'armor', 1, '가죽 갑옷', 'Leather Armor', { def: 10 });
defineEquip('armor2', 'armor', 2, '사슬 갑옷', 'Chainmail', { def: 24 });
defineEquip('armor3', 'armor', 3, '미스릴 판금 갑옷', 'Mithril Plate', { def: 50 });
defineEquip('boots1', 'boots', 1, '가죽 장화', 'Leather Boots', { def: 3, moveSpeedPct: 3 });
defineEquip('boots2', 'boots', 2, '강철 각반', 'Steel Greaves', { def: 8, moveSpeedPct: 4 });
defineEquip('boots3', 'boots', 3, '미스릴 장화', 'Mithril Boots', { def: 18, moveSpeedPct: 6 });
// 보조장비 (방패·마도서)
defineEquip('shield1', 'offhand', 1, '나무 방패', 'Wooden Shield', { offhandType: 'shield', def: 6, blockChance: 10 });
defineEquip('shield2', 'offhand', 2, '강철 방패', 'Steel Shield', { offhandType: 'shield', def: 15, blockChance: 15 });
defineEquip('shield3', 'offhand', 3, '미스릴 방패', 'Mithril Shield', { offhandType: 'shield', def: 35, blockChance: 20 });
defineEquip('tome1', 'offhand', 1, '견습 마도서', 'Apprentice Tome', { offhandType: 'tome', magic: 4, mpPct: 10 });
defineEquip('tome2', 'offhand', 2, '마법 교본', 'Grimoire', { offhandType: 'tome', magic: 10, mpPct: 15 });
defineEquip('tome3', 'offhand', 3, '금단의 마도서', 'Forbidden Tome', { offhandType: 'tome', magic: 22, mpPct: 20 });
// 반지 (기본 수치 없이 각인 1개)
defineEquip('ring1', 'ring', 1, '구리 반지', 'Copper Ring', {});
defineEquip('ring2', 'ring', 2, '은 반지', 'Silver Ring', {});
defineEquip('ring3', 'ring', 3, '금 반지', 'Gold Ring', {});
const BLOCK_REDUCTION = 70;      // 막기 성공 시 피해 감소 %
const BLOCK_ARC_DEG = 120;       // 막기 가능한 정면 각도 (±60°)

// --- 부가 옵션·각인이 붙을 수 있는 "부위 표시". 장비 정의 → 부위 표시는 affixSlotOf
const AFFIX_SLOTS_ALL = ['helmet', 'armor', 'boots', 'shield', 'tome', 'ring', 'sword', 'gsword', 'dagger', 'wand', 'staff'];
const AFFIX_SLOTS_WEAPON = ['sword', 'gsword', 'dagger', 'wand', 'staff'];
const AFFIX_SLOTS_MELEE = ['sword', 'gsword', 'dagger'];
function affixSlotOf(base) {
    if (base.slot === 'weapon') return base.weaponType;
    if (base.slot === 'offhand') return base.offhandType;
    return base.slot;
}
// --- 반지 각인 5종 (AGENTS.md "반지"). values[단계] = 수치. sub 가 있으면 대상 중 하나를 무작위로 고른다
// scales: 고정 수치 (스탯 +N) 는 iLv 로 보정, % 값은 보정하지 않음
const RING_ENGRAVINGS = {
    stat: { sub: ['str', 'dex', 'int'], values: { 1: 2, 2: 4, 3: 7 }, scales: true },
    hpPct: { sub: null, values: { 1: 5, 2: 8, 3: 12 }, scales: false },
    mpPct: { sub: null, values: { 1: 8, 2: 12, 3: 18 }, scales: false },
    res1: { sub: ['fire', 'cold', 'lightning', 'poison'], values: { 1: 10, 2: 15, 3: 22 }, scales: false },
    critChance: { sub: null, values: { 1: 2, 2: 4, 3: 6 }, scales: false },
};
// --- 부가 옵션 17종 (AGENTS.md "부가 옵션"). ranges[단계] = [최소, 최대], slots = 붙을 수 있는 부위 표시
const AFFIXES = {
    stat: { sub: ['str', 'dex', 'int'], ranges: { 1: [1, 3], 2: [3, 6], 3: [6, 10] }, slots: AFFIX_SLOTS_ALL, scales: true },
    hpPct: { sub: null, ranges: { 1: [3, 5], 2: [5, 8], 3: [8, 12] }, slots: ['helmet', 'armor', 'shield', 'ring'], scales: false },
    mpPct: { sub: null, ranges: { 1: [3, 6], 2: [6, 10], 3: [10, 15] }, slots: ['helmet', 'wand', 'staff', 'tome', 'ring'], scales: false },
    staminaPct: { sub: null, ranges: { 1: [5, 10], 2: [10, 15], 3: [15, 20] }, slots: ['armor', 'boots'], scales: false },
    defPct: { sub: null, ranges: { 1: [5, 10], 2: [10, 20], 3: [20, 30] }, slots: ['helmet', 'armor', 'boots', 'shield'], scales: false },
    res1: { sub: ['fire', 'cold', 'lightning', 'poison'], ranges: { 1: [5, 10], 2: [10, 15], 3: [15, 20] }, slots: ['helmet', 'armor', 'boots', 'shield', 'ring'], scales: false },
    resAll: { sub: null, ranges: { 1: [2, 4], 2: [4, 7], 3: [7, 10] }, slots: ['armor', 'shield', 'ring'], scales: false },
    physPct: { sub: null, ranges: { 1: [5, 10], 2: [10, 20], 3: [20, 35] }, slots: [...AFFIX_SLOTS_MELEE, 'ring'], scales: false },
    magicPct: { sub: null, ranges: { 1: [5, 10], 2: [10, 20], 3: [20, 35] }, slots: ['wand', 'staff', 'tome', 'ring'], scales: false },
    elemDmg: { sub: ['fire', 'cold', 'lightning', 'poison'], ranges: { 1: [5, 10], 2: [10, 15], 3: [15, 25] }, slots: AFFIX_SLOTS_MELEE, scales: false },
    atkSpeedPct: { sub: null, ranges: { 1: [3, 6], 2: [6, 10], 3: [10, 15] }, slots: [...AFFIX_SLOTS_WEAPON, 'ring'], scales: false },
    critChance: { sub: null, ranges: { 1: [1, 3], 2: [3, 5], 3: [5, 8] }, slots: [...AFFIX_SLOTS_WEAPON, 'helmet', 'ring'], scales: false },
    critDamage: { sub: null, ranges: { 1: [5, 15], 2: [15, 25], 3: [25, 40] }, slots: [...AFFIX_SLOTS_WEAPON, 'ring'], scales: false },
    lifeSteal: { sub: null, ranges: { 1: [1, 2], 2: [2, 3], 3: [3, 4] }, slots: [...AFFIX_SLOTS_MELEE, 'ring'], scales: false },
    moveSpeedPct: { sub: null, ranges: { 1: [2, 4], 2: [4, 6], 3: [6, 8] }, slots: ['boots'], scales: false },
    cdrPct: { sub: null, ranges: { 1: [2, 3], 2: [3, 5], 3: [5, 8] }, slots: ['helmet', 'tome', 'ring'], scales: false },
    goldPct: { sub: null, ranges: { 1: [5, 10], 2: [10, 20], 3: [20, 30] }, slots: ['helmet', 'boots', 'ring'], scales: false },
};
// --- 마법 등급 이름의 수식어 (12-1): 첫 부가 옵션의 수식어 + 기본 이름 ("민첩한 강철 단검"). [한국어, 영어], sub 가 있는 옵션은 sub 별로
const AFFIX_PREFIX = {
    stat: { str: ['힘센', 'Strong'], dex: ['민첩한', 'Agile'], int: ['현명한', 'Wise'] },
    hpPct: ['튼튼한', 'Sturdy'],
    mpPct: ['마력 깃든', 'Mystic'],
    staminaPct: ['지치지 않는', 'Tireless'],
    defPct: ['단단한', 'Reinforced'],
    res1: { fire: ['불을 막는', 'Fireproof'], cold: ['추위를 막는', 'Insulated'], lightning: ['전기를 막는', 'Grounded'], poison: ['독을 막는', 'Antitoxic'] },
    resAll: ['수호의', 'Warding'],
    physPct: ['날카로운', 'Sharp'],
    magicPct: ['신비로운', 'Arcane'],
    elemDmg: { fire: ['불타는', 'Flaming'], cold: ['얼어붙은', 'Frozen'], lightning: ['번개 치는', 'Shocking'], poison: ['독 묻은', 'Venomous'] },
    atkSpeedPct: ['재빠른', 'Swift'],
    critChance: ['예리한', 'Keen'],
    critDamage: ['잔혹한', 'Brutal'],
    lifeSteal: ['흡혈의', 'Vampiric'],
    moveSpeedPct: ['가벼운', 'Fleet'],
    cdrPct: ['집중의', 'Focused'],
    goldPct: ['행운의', 'Lucky'],
};
// --- 희귀 등급의 무작위 고유 이름 (12-1): 앞말 + 뒷말 ("망각의 송곳니" / "Oblivion Fang"). [한국어, 영어]
const RARE_NAME_FIRST = [
    ['망각의', 'Oblivion'], ['심연의', 'Abyssal'], ['황혼의', 'Twilight'], ['잿빛', 'Ashen'], ['핏빛', 'Crimson'], ['서리 맺힌', 'Rimefrost'],
    ['폭풍의', 'Storm'], ['고대의', 'Ancient'], ['저주받은', 'Cursed'], ['잊힌', 'Forgotten'], ['별빛', 'Starlit'], ['광기의', 'Lunatic'],
    ['공허의', 'Hollow'], ['무덤의', 'Grave'],
];
const RARE_NAME_SECOND = [
    ['송곳니', 'Fang'], ['맹세', 'Oath'], ['속삭임', 'Whisper'], ['심장', 'Heart'], ['눈물', 'Tears'], ['그림자', 'Shadow'],
    ['파수꾼', 'Warden'], ['메아리', 'Echo'], ['유산', 'Legacy'], ['징표', 'Mark'], ['비명', 'Scream'], ['서약', 'Pact'],
    ['꿈', 'Dream'], ['낙인', 'Brand'],
];
// --- 소모품 설명 (AGENTS.md "소모품 목록" 의 효과). [한국어, 영어]. 투척 기준 피해 (레벨에 따라 바뀜) 는 상세 정보에 따로 표시
const CONSUMABLE_DESC = {
    hp1: ['HP 최대치의 30% 즉시 회복', 'Instantly restores 30% of max HP'],
    hp2: ['HP 최대치의 50% 즉시 회복', 'Instantly restores 50% of max HP'],
    hp3: ['HP 최대치의 80% 즉시 회복', 'Instantly restores 80% of max HP'],
    mp1: ['MP 최대치의 30% 즉시 회복', 'Instantly restores 30% of max MP'],
    mp2: ['MP 최대치의 50% 즉시 회복', 'Instantly restores 50% of max MP'],
    mp3: ['MP 최대치의 80% 즉시 회복', 'Instantly restores 80% of max MP'],
    sta1: ['스태미너 100% 회복, 탈진 해제', 'Fully restores stamina and removes Exhaustion'],
    sta2: ['스태미너 100% 회복, 탈진 해제 + 10초간 스태미너 회복 속도 2배', 'Fully restores stamina, removes Exhaustion, and doubles stamina regen for 10s'],
    sta3: ['스태미너 100% 회복, 탈진 해제 + 10초간 스태미너 소모 없음', 'Fully restores stamina, removes Exhaustion, and stamina is not consumed for 10s'],
    cure1: ['중독·화상 해제', 'Cures Poison and Burn'],
    cure2: ['모든 상태이상 해제', 'Cures all status effects'],
    cure3: ['모든 상태이상 해제 + 10초간 상태이상 면역 + HP 20% 회복', 'Cures all status effects, grants immunity for 10s and restores 20% HP'],
    throw1: ['반경 3m, 투척 기준 피해 100% 화염 + 화상, 3초간 불타는 지면 (초당 20%)', '3m radius: 100% of throw damage as fire + Burn, burning ground for 3s (20%/s)'],
    throw2: ['반경 4m 독 구름 6초, 초당 투척 기준 피해 35% 독 + 중독', '4m poison cloud for 6s: 35% of throw damage as poison per second + Poison'],
    throw3: ['반경 5m, 투척 기준 피해 250% 전격 + 감전 + 기절 1초', '5m radius: 250% of throw damage as lightning + Shock + Stun for 1s'],
    elixir1: ['60초간 가하는 피해 +10%', 'Damage dealt +10% for 60s'],
    elixir2: ['90초간 가하는 피해 +20%, 공격 속도 +10%', 'Damage dealt +20% and attack speed +10% for 90s'],
    elixir3: ['120초간 가하는 피해 +30%, 공격 속도 +15%, 받는 피해 −10%', 'Damage dealt +30%, attack speed +15% and damage taken −10% for 120s'],
    scroll1: ['현재 위치 주변 반경 8칸의 지도 공개', 'Reveals the map within 8 cells of you'],
    scroll2: ['현재 층 전체 지도 공개 + 엘리베이터·포탈·상인·성소 위치 표시', 'Reveals the whole floor map, including elevators, portal, merchant and sanctuaries'],
    battery: ['"플래시" 에너지를 모두 쓰면 1개가 자동으로 소모되어 300초를 충전합니다', 'When the flashlight runs out, one is used automatically to recharge 300 seconds'],
    glowstick: ['가운데를 분질러 발밑에 떨어뜨립니다. 주위 2칸을 밝히고, 멀리서도 (가리지 않으면) 보입니다. 다시 주울 수 없고, 몬스터는 이 빛을 보지 못합니다', 'Snap it and drop it at your feet. It lights up 2 cells around it and can be seen from afar unless blocked. It cannot be picked up again, and monsters cannot see its light'],
    keycard: ['내려가는 엘리베이터 오른쪽의 카드 리더기에 찍으면 엘리베이터가 움직입니다. 하나만 가질 수 있습니다', 'Swipe it at the card reader to the right of the down elevator to activate the elevator. You can only carry one'],
    fadedScroll: ['잠시 무적이 되어 같은 층의 먼 곳 (10칸 이상) 으로 순간이동합니다. 쫓던 몬스터는 추적을 멈추고, 도착한 곳 근처의 몬스터는 다른 곳으로 옮겨집니다', 'Become briefly invulnerable and teleport to a distant spot (10+ cells away) on this floor. Chasing monsters lose track of you, and monsters near where you land are moved elsewhere'],
    scroll3: ['3초 시전 후 가장 가까운 성소 구역으로 이동. 시전 중 공격을 받으면 취소 (소모되지 않음)', 'After a 3s cast, returns you to the nearest sanctuary. Interrupted (not consumed) if you are hit'],
};
// 소모품 분류별 색 (아이콘의 액체·바닥 상자). 투척물은 속성 색 (CONSUMABLE_ITEM_COLORS 가 우선)
const CONSUMABLE_COLORS = {
    hp: '#e0483a', mp: '#4a78e8', sta: '#5ac85a', cure: '#e8e2d0', throw: '#ff7a2a', elixir: '#c060e0', scroll: '#e8d8a8', battery: '#8fd04a',
    glowstick: '#7dff9a', keycard: '#5ab8e8', fadedScroll: '#c8b896',
};
// 도구 설명 (18-1). [한국어, 영어]
const TOOL_DESC = {
    flashlight: ['켜고 끄는 손전등. 켜면 정면 부채꼴로 앞 7칸까지 보입니다. 에너지 300초, 다 쓰면 배터리를 자동으로 씁니다. 몬스터도 불빛을 봅니다', 'A switchable light. When on, you can see up to 7 cells ahead in a cone. 300s of energy; a battery is used automatically when it runs out. Monsters can see the light too'],
};
const CONSUMABLE_ITEM_COLORS = { throw1: '#ff7a2a', throw2: '#7fdc6f', throw3: '#ffe24a' };

// ===== [06] 데이터 - 몬스터·상태이상 =====
// --- 상태이상 8종 (AGENTS.md "상태이상" 표)
//   element:   원인 속성 (null = 스킬)
//   duration:  기본 지속 (초). null = 스킬·공격마다 정함
//   stack:     다시 걸릴 때 'refresh' (지속 시간 갱신) | 'stack' (중첩 +1, 최대 maxStacks, 지속 시간 갱신) | 'longer' (남은 시간 중 긴 쪽)
//   elemental: true 면 주인공은 해당 속성 저항% 만큼 지속 시간이 줄어든다
//   bossToSlow: true 면 보스에게는 같은 시간 동안 둔화 BOSS_CC_SLOW_PCT% 로 바뀐다
//   disables:  true 면 이동·공격·스킬 불가
const STATUS_EFFECTS = {};
for (const [id, nameKo, nameEn, color, def] of [
    ['burn', '화상', 'Burn', '#ff7a2a', { element: 'fire', duration: 3, stack: 'refresh', elemental: true, dotPct: 10 }],
    ['slow', '둔화', 'Slow', '#7fd4ff', { element: 'cold', duration: 2, stack: 'longer', elemental: true, slowPct: 30 }],
    ['freeze', '빙결', 'Freeze', '#d8f6ff', { element: 'cold', duration: 1, stack: 'longer', elemental: true, playerMaxDuration: 1.5, disables: true, bossToSlow: true }],
    ['shock', '감전', 'Shock', '#ffe24a', { element: 'lightning', duration: 4, stack: 'longer', elemental: true, damageTakenPct: 15 }],
    ['poison', '중독', 'Poison', '#6fd86f', { element: 'poison', duration: 5, stack: 'stack', maxStacks: 5, elemental: true, dotPct: 8 }],
    ['bleed', '출혈', 'Bleed', '#d02a2a', { element: 'physical', duration: 5, stack: 'longer', ignoresDefense: true, movingMul: 1.5 }],
    ['stun', '기절', 'Stun', '#c8c8c8', { element: 'physical', duration: null, stack: 'longer', disables: true, bossToSlow: true }],
    ['fear', '공포', 'Fear', '#9a5cff', { element: null, duration: null, stack: 'longer', monsterOnly: true, bossToSlow: true }],
]) {
    STATUS_EFFECTS[id] = {
        id, nameKo, nameEn, color, maxStacks: 1, elemental: false, disables: false, bossToSlow: false, monsterOnly: false, ...def,
    };
}
const BOSS_CC_SLOW_PCT = 50;   // 보스에게 빙결·기절·공포 대신 거는 둔화 %
// HUD 아이콘 글자 (9-6) [한국어, 영어]. 영어는 Slow·Shock·Stun 처럼 첫 글자가 겹쳐서 두 글자
const STATUS_ICON = {
    burn: ['화', 'Bu'], slow: ['둔', 'Sl'], freeze: ['빙', 'Fr'], shock: ['감', 'Sh'],
    poison: ['중', 'Po'], bleed: ['출', 'Bl'], stun: ['기', 'St'], fear: ['공', 'Fe'],
};
const BLEED_DEFAULT_DOT_PCT = 10;   // 피해량을 정하지 않은 출혈 (몬스터 공격) 의 초당 피해 = 원래 피해의 10% (U27)

// --- 테마 5종 (AGENTS.md "던전 테마", "몬스터"). 겉모습은 THEME_VISUALS (4단계) 에 따로 둔다
const THEMES = {};
for (const [id, nameKo, nameEn, monsters] of [
    ['backrooms', '백룸', 'The Backrooms', ['br_shade', 'br_mannequin', 'br_lamp', 'br_mold']],
    ['brick', '판타지 벽돌벽', 'Brick Dungeon', ['bk_goblin', 'bk_archer', 'bk_orc', 'bk_shaman']],
    ['cave', '동굴', 'Cave', ['cv_bat', 'cv_spider', 'cv_golem', 'cv_spore']],
    ['lava', '용암 동굴', 'Lava Cave', ['lv_imp', 'lv_slime', 'lv_golem', 'lv_salamander']],
    ['void', '왜곡된 차원', 'Distorted Dimension', ['vd_watcher', 'vd_stalker', 'vd_jelly', 'vd_sentinel']],
]) THEMES[id] = { id, nameKo, nameEn, monsters, boss: monsters[0].slice(0, 3) + 'boss' };

// --- 몬스터 25종 (AGENTS.md "몬스터 > 테마별 몬스터" 표, PROGRESS.md 6.8 형식)
// 공격 정의. 6.8 에 없는 추가 필드:
//   knockback (m), stun (초), splashRadius (착탄 폭발 반경 m), shockwave { radius, coef, element } (근접 명중 시 주변 충격파),
//   aimTime (광선 조준선 표시 시간 초), radius (범위 공격 반경 m), cloudTime (범위 공격이 구름으로 남는 시간 초, 0 = 즉발 펄스)
function monsterAttack(type, range, interval, element, extra) {
    return {
        type, range, interval, projectileSpeed: 0, element, coef: 100, windup: 0.3, effect: null, keepDistance: null,
        knockback: 0, stun: 0, ...extra,
    };
}
const MONSTER_TYPES = {};
// mul = [HP, 공격, 방어] 배수, res = [화염, 냉기, 전격, 독], body = [충돌 반지름, 키, 시체 모양] (PROGRESS.md 8-1 표)
function defineMonster(id, theme, nameKo, nameEn, role, weight, mul, speed, attack, res, body, extra) {
    const boss = role === 'boss';
    MONSTER_TYPES[id] = {
        id, theme, boss, nameKo, nameEn, role, weight, group: null,
        hpMul: mul[0], atkMul: mul[1], defMul: mul[2], speed, hover: false, attack,
        res: { fire: res[0], cold: res[1], lightning: res[2], poison: res[3] },
        knockbackImmune: boss, radius: body[0], height: body[1], corpse: body[2],
        ...extra,
    };
}
const BOSS_ATTACK = monsterAttack('none', 0, 0, 'physical');   // 보스는 BOSS_PATTERNS (10단계) 로 공격한다
// 백룸
defineMonster('br_shade', 'backrooms', '깜빡이는 그림자', 'Flicker Shade', 'rusher', 35, [0.7, 1.0, 0.5], 6.0,
    monsterAttack('melee', 1.6, 1.0, 'physical'), [0, 0, -25, 50], [0.4, 1.8, 'lie']);
defineMonster('br_mannequin', 'backrooms', '사무용 마네킹', 'Office Mannequin', 'special', 15, [1.2, 1.3, 1.5], 7.0,
    monsterAttack('melee', 1.8, 1.4, 'physical'), [0, 0, 0, 75], [0.4, 1.9, 'lie'], { knockbackImmune: true });
defineMonster('br_lamp', 'backrooms', '윙윙대는 형광등', 'Buzzing Lamp', 'ranged', 25, [0.6, 0.9, 0.8], 2.5,
    monsterAttack('ranged', 16, 2.0, 'lightning', { projectileSpeed: 18, effect: { id: 'shock', chance: 20 }, keepDistance: [5, 10] }),
    [0, 0, 75, 75], [0.4, 1.2, 'fall'], { hover: true });
defineMonster('br_mold', 'backrooms', '젖은 카펫 덩어리', 'Damp Carpet Lump', 'tank', 25, [1.6, 0.8, 0.6], 1.8,
    monsterAttack('melee', 1.8, 1.5, 'poison', { effect: { id: 'poison', chance: 40 } }), [-25, 0, 0, 75], [0.7, 0.8, 'flatten']);
defineMonster('br_boss', 'backrooms', '끝나지 않는 야근', 'Endless Overtime', 'boss', 0, [12, 1.6, 1.5], 3.5,
    BOSS_ATTACK, [0, 0, 25, 50], [1.2, 4.0, 'lie']);
// 판타지 벽돌벽
defineMonster('bk_goblin', 'brick', '고블린', 'Goblin', 'rusher', 35, [0.6, 0.8, 0.8], 5.5,
    monsterAttack('melee', 1.6, 0.9, 'physical'), [0, 0, 0, 0], [0.35, 1.2, 'lie'], { group: [2, 3] });
defineMonster('bk_archer', 'brick', '해골 궁수', 'Skeleton Archer', 'ranged', 25, [0.7, 1.0, 0.6], 3.0,
    monsterAttack('ranged', 20, 2.0, 'physical', { projectileSpeed: 25, keepDistance: [8, 15] }), [0, 25, 0, 75], [0.4, 1.8, 'flatten']);
defineMonster('bk_orc', 'brick', '오크 전사', 'Orc Warrior', 'tank', 20, [1.8, 1.4, 1.5], 3.0,
    monsterAttack('melee', 2.2, 1.8, 'physical', { knockback: 2, windup: 0.6 }), [0, 0, 0, 0], [0.6, 2.2, 'lie']);
defineMonster('bk_shaman', 'brick', '고블린 주술사', 'Goblin Shaman', 'support', 20, [0.6, 0.9, 0.5], 3.5,
    monsterAttack('ranged', 16, 2.5, 'fire', { projectileSpeed: 18, splashRadius: 2, effect: { id: 'burn', chance: 30 }, keepDistance: [8, 12] }),
    [25, 0, 0, 0], [0.35, 1.3, 'lie']);
defineMonster('bk_boss', 'brick', '지하 감옥 간수장', 'Dungeon Warden', 'boss', 0, [12, 1.7, 2.5], 3.0,
    BOSS_ATTACK, [25, 25, 0, 50], [1.4, 4.5, 'lie']);
// 동굴
defineMonster('cv_bat', 'cave', '동굴 박쥐', 'Cave Bat', 'rusher', 25, [0.4, 0.6, 0.3], 7.0,
    monsterAttack('melee', 1.4, 0.8, 'physical'), [0, 0, 0, 0], [0.3, 0.5, 'fall'], { hover: true, group: [3, 4] });
defineMonster('cv_spider', 'cave', '동굴 거미', 'Cave Spider', 'rusher', 30, [0.8, 1.0, 0.8], 5.0,
    monsterAttack('melee', 1.6, 1.1, 'poison', { effect: { id: 'poison', chance: 30 } }), [0, 0, 0, 50], [0.6, 0.8, 'flatten']);
defineMonster('cv_golem', 'cave', '바위 골렘', 'Rock Golem', 'tank', 20, [2.0, 1.5, 2.5], 2.2,
    monsterAttack('melee', 2.4, 2.0, 'physical', { stun: 0.5, windup: 0.7 }), [25, 0, -25, 75], [0.9, 2.6, 'flatten'], { knockbackImmune: true });
defineMonster('cv_spore', 'cave', '포자 버섯', 'Sporecap', 'special', 25, [1.0, 0.9, 0.5], 0,
    monsterAttack('aura', 8, 3, 'poison', { coef: 25, radius: 4, cloudTime: 4, effect: { id: 'poison', chance: 100 } }),
    [-50, 0, 0, 75], [0.6, 1.6, 'flatten']);
defineMonster('cv_boss', 'cave', '거미 여왕', 'Broodmother', 'boss', 0, [12, 1.5, 1.5], 4.0,
    BOSS_ATTACK, [0, 0, 0, 75], [2.5, 2.5, 'flatten']);
// 용암 동굴
defineMonster('lv_imp', 'lava', '불꽃 임프', 'Fire Imp', 'ranged', 30, [0.6, 1.0, 0.6], 4.5,
    monsterAttack('ranged', 16, 1.8, 'fire', { projectileSpeed: 20, effect: { id: 'burn', chance: 25 }, keepDistance: [5, 10] }),
    [75, -25, 0, 0], [0.35, 1.1, 'fall'], { hover: true });
defineMonster('lv_slime', 'lava', '마그마 슬라임', 'Magma Slime', 'rusher', 25, [1.2, 0.9, 0.8], 3.0,
    monsterAttack('melee', 1.8, 1.4, 'fire', { effect: { id: 'burn', chance: 30 } }), [75, -50, 0, 25], [0.6, 1.0, 'flatten']);
defineMonster('lv_golem', 'lava', '흑요석 골렘', 'Obsidian Golem', 'tank', 15, [1.8, 1.5, 2.5], 2.5,
    monsterAttack('melee', 2.4, 2.0, 'physical', { windup: 0.7, shockwave: { radius: 2.5, coef: 40, element: 'fire' } }),
    [75, -25, 25, 75], [0.9, 2.8, 'flatten'], { knockbackImmune: true });
defineMonster('lv_salamander', 'lava', '화염 도롱뇽', 'Salamander', 'rusher', 30, [0.9, 1.2, 1.0], 6.0,
    monsterAttack('melee', 1.8, 1.0, 'physical'), [50, -25, 0, 0], [0.5, 0.7, 'lie']);
defineMonster('lv_boss', 'lava', '용암 군주', 'Magma Lord', 'boss', 0, [14, 1.6, 2.0], 0,
    BOSS_ATTACK, [75, -25, 25, 50], [2.5, 5.0, 'vanish']);
// 왜곡된 차원
defineMonster('vd_watcher', 'void', '공허의 눈', 'Void Watcher', 'ranged', 25, [0.7, 1.1, 0.7], 3.0,
    monsterAttack('beam', 18, 3.0, 'cold', { coef: 120, aimTime: 1, effect: { id: 'slow', chance: 100 }, keepDistance: [8, 14] }),
    [0, 50, 0, 50], [0.6, 1.2, 'fall'], { hover: true });
defineMonster('vd_stalker', 'void', '위상 추적자', 'Phase Stalker', 'rusher', 25, [0.8, 1.3, 0.8], 5.0,
    monsterAttack('melee', 1.8, 1.2, 'physical', { effect: { id: 'bleed', chance: 25 } }), [0, 25, 25, 25], [0.4, 2.0, 'vanish']);
defineMonster('vd_jelly', 'void', '별무리 해파리', 'Star Jelly', 'special', 25, [1.0, 1.0, 0.5], 2.0,
    monsterAttack('aura', 4, 2, 'lightning', { radius: 4, cloudTime: 0, windup: 0.5, effect: { id: 'shock', chance: 30 } }),
    [0, 0, 75, 0], [0.7, 1.2, 'fall'], { hover: true });
defineMonster('vd_sentinel', 'void', '대리석 수호상', 'Marble Sentinel', 'tank', 25, [1.8, 1.4, 2.5], 2.8,
    monsterAttack('melee', 2.4, 1.8, 'physical'), [25, 25, 25, 75], [0.7, 2.4, 'flatten'], { knockbackImmune: true });
defineMonster('vd_boss', 'void', '차원 포식자', 'Rift Devourer', 'boss', 0, [12, 1.7, 1.5], 2.5,
    BOSS_ATTACK, [25, 50, 25, 50], [2.0, 4.0, 'vanish'], { hover: true });

// ===== [07] 공식 (스탯·전투·경험치) =====
// --- 경험치 (AGENTS.md "레벨과 경험치")
function expToNext(level) { return Math.floor(80 * Math.pow(level, 1.5)); }
function killExp(monsterLv, playerLv) {
    return (10 + 5 * monsterLv) * clamp(1 + 0.1 * (monsterLv - playerLv), 0.2, 1.5);
}
// --- 전투 (AGENTS.md "전투 공식"). 반환은 비율 (0~1)
function physReduction(defense, attackerLv) {
    return Math.min(0.8, defense / (defense + 50 + 10 * attackerLv));
}
// resPct = 상한까지 적용된 저항 % (음수면 1 보다 커진다)
function elementMultiplier(resPct) { return 1 - resPct / 100; }
// --- 스킬 자원 소모량 (레벨당 +5%)
function costAtLevel(cost, lv) { return Math.round(cost * (1 + 0.05 * (lv - 1))); }
// --- 장비 iLv 보정 배수 (시작 장비는 호출하지 않고 1 을 쓴다)
function itemLevelScale(reqLv, iLv) { return 1 + 0.04 * (iLv - reqLv); }
// --- 소모품 가격 (AGENTS.md "아이템 > 공통 규칙")
function consumablePrice(id, floor) { return Math.round(CONSUMABLES[id].price * (1 + 0.1 * (floor - 1))); }
function consumableSellPrice(id, floor) { return Math.round(consumablePrice(id, floor) * 0.25); }
// --- 장비 가격 (12-3, AGENTS.md "장비 > 공통 규칙"): 단계 기준가 × (1 + 0.05 × (iLv − 요구 레벨)) × 등급 배수, 판매가 = 20%.
// 시작 장비 (0단계) 는 판매가 1 G (구매가는 그 5배로 둔다 — 상점에서 팔지 않는다)
const STARTER_SELL_PRICE = 1;
const EQUIP_SELL_RATE = 0.2;
function equipPrice(item) {
    const base = EQUIP_BASES[item.baseId];
    if (base.tier === 0) return STARTER_SELL_PRICE / EQUIP_SELL_RATE;
    return Math.round(TIER_INFO[base.tier].basePrice * (1 + 0.05 * (item.iLv - base.reqLv)) * RARITIES[item.rarity].priceMul);
}
function equipSellPrice(item) {
    if (EQUIP_BASES[item.baseId].tier === 0) return STARTER_SELL_PRICE;
    return Math.max(1, Math.round(equipPrice(item) * EQUIP_SELL_RATE));
}
// --- 몬스터 (AGENTS.md "몬스터 > 공통 규칙"). 종류별 배수는 호출하는 쪽에서 곱한다
function monsterBaseStats(level) {
    return { hp: 30 + 6 * level + 0.6 * level * level, atk: 6 + 2.5 * level, def: 3 * level };
}
function monsterRewardMultiplier(def) { return (def.hpMul + def.atkMul) / 2; }

// --- 수정자 (PROGRESS.md 6.6). 모든 키를 0 으로 채운 객체에 장비·패시브·버프를 더한다
const MOD_KEYS = [
    'str', 'dex', 'int', 'weaponAtk', 'magicPower', 'defFlat', 'defPct', 'hpPct', 'mpPct', 'staminaPct',
    'resFire', 'resCold', 'resLightning', 'resPoison', 'resAll', 'resCapBonus',
    'physPct', 'magicPct', 'meleePct', 'dmgPct', 'firePct', 'coldPct', 'lightningPct',
    'elemAddFire', 'elemAddCold', 'elemAddLightning', 'elemAddPoison',
    'atkSpeedPct', 'critChance', 'critDamage', 'lifeSteal', 'moveSpeedPct', 'cdrPct', 'goldPct',
    'hpRegenPct', 'mpRegenPct', 'staminaRegenPct', 'blockChance', 'damageTakenPct', 'projectileTakenPct',
    'burnDmgPct', 'slowBonusPct', 'freezeOnColdPct', 'shockChancePct', 'shockBonusPct',
    'potionPct', 'potionCdSec', 'revealRadius',
];
const RES_KEY = { fire: 'resFire', cold: 'resCold', lightning: 'resLightning', poison: 'resPoison' };
const ELEM_ADD_KEY = { fire: 'elemAddFire', cold: 'elemAddCold', lightning: 'elemAddLightning', poison: 'elemAddPoison' };
function emptyMods() {
    const mods = {};
    for (const k of MOD_KEYS) mods[k] = 0;
    return mods;
}
// src 의 값을 mods 에 더한다 (모르는 키도 그대로 더해 둔다)
function addMods(mods, src) {
    for (const k in src) mods[k] = (mods[k] || 0) + src[k];
}
// 부가 옵션·각인 { id, sub, value } 하나를 수정자로 더한다
function addAffixMods(mods, affix) {
    if (affix.id === 'stat') mods[affix.sub] += affix.value;
    else if (affix.id === 'res1') mods[RES_KEY[affix.sub]] += affix.value;
    else if (affix.id === 'elemDmg') mods[ELEM_ADD_KEY[affix.sub]] += affix.value;
    else mods[affix.id] = (mods[affix.id] || 0) + affix.value;
}
// 장비 인스턴스 (6.2) 하나의 수치 → 수정자 (기본 수치 iLv 보정 + 각인 + 부가 옵션). 상세 표시와 collectModifiers 가 함께 쓴다
function equipStats(item) {
    const base = EQUIP_BASES[item.baseId];
    const mods = emptyMods();
    const scale = base.tier === 0 ? 1 : itemLevelScale(base.reqLv, item.iLv);
    if (base.slot === 'weapon') mods.weaponAtk += (base.atk || 0) * scale;
    mods.magicPower += (base.magic || 0) * scale;
    mods.defFlat += (base.def || 0) * scale;
    for (const k of ['mpPct', 'critChance', 'moveSpeedPct', 'staminaRegenPct', 'blockChance']) mods[k] += base[k] || 0;
    if (item.engraving) addAffixMods(mods, item.engraving);
    for (const a of item.affixes || []) addAffixMods(mods, a);
    return mods;
}
// 패시브 스킬 → 수정자. (v = 스킬의 values(lv), state, game) => 수정자
// D6 불굴·X2 반격·M5 빙결 확률처럼 "일이 일어날 때" 동작하는 부분은 14단계의 개별 훅에서 values 를 직접 읽는다
const PASSIVE_MODS = {
    M2: (v) => ({ firePct: v.firePct, burnDmgPct: v.burnPct }),
    M5: (v) => ({ coldPct: v.coldPct, slowBonusPct: v.slowBonus, freezeOnColdPct: v.freezeChance }),
    M8: (v) => ({ lightningPct: v.lightningPct, shockChancePct: v.shockChanceBonus, shockBonusPct: v.shockBonus }),
    A2: (v) => ({ meleePct: v.meleePct, atkSpeedPct: v.atkSpeedPct }),
    A5: (v) => ({ critChance: v.critChance, critDamage: v.critDamage }),
    // HP 50% 이하 조건은 런타임 (game) 이 있을 때만. 최대 HP 는 직전 프레임의 game.derived 값을 쓴다
    A8: (v, state, game) => ({
        lifeSteal: v.lifeSteal,
        physPct: game && game.derived && state.player.hp <= game.derived.maxHp * 0.5 ? v.lowHpPhysPct : 0,
    }),
    D2: (v) => ({ defPct: v.defPct, projectileTakenPct: -v.projectileReduce }),
    D4: (v) => ({ hpPct: v.hpPct, hpRegenPct: v.hpRegenPct }),
    D7: (v) => ({ resAll: v.resAll }),
    S1: (v) => ({ potionPct: v.potionPct, potionCdSec: v.potionCdSec }),
    S5: (v) => ({ revealRadius: v.revealRadius, goldPct: v.goldPct }),
    S7: (v) => ({ mpPct: v.mpPct, mpRegenPct: v.mpRegenPct }),
    S8: (v) => ({ cdrPct: v.cdrPct }),
};
// 장비 + 패시브 스킬 + 버프 (game.buffs, 9단계) 의 수정자 합계
function collectModifiers(state, game) {
    const mods = emptyMods();
    const p = state.player;
    for (const slot in p.equipment) {
        const item = p.equipment[slot];
        if (item) addMods(mods, equipStats(item));
    }
    for (const id in p.skills) {
        const fn = PASSIVE_MODS[id];
        if (fn) addMods(mods, fn(SKILL_BY_ID[id].values(p.skills[id]), state, game));
    }
    if (game && game.buffs) for (const b of game.buffs) addMods(mods, b.mods);
    return mods;
}
// 파생 수치 (PROGRESS.md 6.7, AGENTS.md "파생 수치 공식"). game 이 없으면 버프·조건부 패시브·상태이상 없이 계산
// 둔화 (9-4) 는 이동 속도와 공격 속도 (= 공격 간격) 에 곱한다 (game.player.effects)
function calcDerivedStats(state, game) {
    const p = state.player;
    const mods = collectModifiers(state, game);
    const L = p.level;
    const str = p.baseStats.str + mods.str;
    const dex = p.baseStats.dex + mods.dex;
    const int = p.baseStats.int + mods.int;
    const weaponItem = p.equipment.weapon;
    const weaponType = weaponItem ? EQUIP_BASES[weaponItem.baseId].weaponType : 'fist';
    const weapon = WEAPON_TYPES[weaponType];
    const weaponAtk = weaponItem ? mods.weaponAtk : UNARMED_ATK;
    const atkSpeedBonus = Math.min(100, dex + mods.atkSpeedPct);
    const moveBonus = Math.min(50, dex * 0.4 + mods.moveSpeedPct);
    const slowMul = 1 - (game && game.player && game.player.effects ? effectMagnitude(game.player, 'slow') : 0) / 100;
    let moveMul = 1;   // 칼날 폭풍 (A3) "이동 속도 −30%" 는 % 합산이 아니라 배율 (버프의 moveMul, 14-3)
    if (game && game.buffs) for (const b of game.buffs) if (b.moveMul) moveMul *= b.moveMul;
    const walkSpeed = 5 * (1 + moveBonus / 100) * slowMul * moveMul;
    const resCap = 75 + mods.resCapBonus;
    const res = {};
    for (const el in RES_KEY) res[el] = Math.min(resCap, mods[RES_KEY[el]] + mods.resAll);
    // 활력 물약 (중급) "스태미너 회복 속도 2배" 는 % 합산이 아니라 배율이라 버프의 staminaRegenMul 을 곱한다 (12-7)
    let staminaRegenMul = 1;
    if (game && game.buffs) for (const b of game.buffs) if (b.staminaRegenMul) staminaRegenMul *= b.staminaRegenMul;
    return {
        str, dex, int,
        maxHp: (60 + L * 10 + str * 6) * (1 + mods.hpPct / 100),
        maxMp: (15 + L * 5 + int * 6) * (1 + mods.mpPct / 100),
        maxStamina: (80 + dex * 4) * (1 + mods.staminaPct / 100),
        physAtk: (L + weaponAtk) * (1 + str * 0.03),
        magicAtk: (3 + L + mods.magicPower) * (1 + int * 0.03),
        atkSpeedBonus,
        attackInterval: weapon.interval / (1 + atkSpeedBonus / 100) / slowMul,
        critChance: Math.min(60, 5 + dex * 0.3 + mods.critChance),
        critDamage: 150 + mods.critDamage,
        walkSpeed, runSpeed: walkSpeed * 1.6,
        hpRegen: (0.2 + str * 0.04) * (1 + mods.hpRegenPct / 100),
        mpRegen: (0.5 + int * 0.1) * (1 + mods.mpRegenPct / 100),
        staminaRegen: 25 * (1 + mods.staminaRegenPct / 100) * staminaRegenMul,
        defense: mods.defFlat * (1 + mods.defPct / 100),
        res, resCap,
        blockChance: mods.blockChance,
        weaponType, weapon,
        mods,
    };
}

// --- 피해 계산 (PROGRESS.md 8-7, AGENTS.md "전투 공식" 순서 그대로). 주인공·몬스터 공용
//   attacker: { physAtk, magicAtk, level, critChance, critDamage, mods }   (주인공 = calcDerivedStats 결과 + level)
//   defender: { defense, res: { fire, cold, lightning, poison }, damageTakenPct }   (저항은 % 숫자, 음수면 약점)
//   spec:     { kind: 'physical' | 'magic' | 'item', element: 'physical' | 'arcane' | 'fire' | 'cold' | 'lightning' | 'poison',
//               coef (공격력 대비 %), flat (더하는 고정 피해), canCrit, melee (근접 물리 → meleePct), ignoreDefense, bonusPct }
// 반환: { amount (소수점 유지, 최소 1), crit }
const ELEMENT_PCT_KEY = { fire: 'firePct', cold: 'coldPct', lightning: 'lightningPct' };
function computeDamage(attacker, defender, spec, rnd = Math.random) {
    const mods = attacker.mods || {};
    // ① 기본 피해
    let dmg = (spec.kind === 'magic' ? attacker.magicAtk : attacker.physAtk) * spec.coef / 100 + (spec.flat || 0);
    // ② 같은 종류의 % 보너스는 모두 더해 한 번에 곱한다
    //    kind 'item' (투척물, 12-7) 은 물리·마법 % 를 받지 않고 모든 피해·속성 % 만 받는다
    let pct = (mods.dmgPct || 0) + (spec.bonusPct || 0);
    if (spec.kind === 'magic') pct += mods.magicPct || 0;
    else if (spec.kind === 'physical') pct += (mods.physPct || 0) + (spec.melee ? mods.meleePct || 0 : 0);
    if (ELEMENT_PCT_KEY[spec.element]) pct += mods[ELEMENT_PCT_KEY[spec.element]] || 0;
    dmg *= 1 + pct / 100;
    // ③ 치명타 (물리·마법 공통)
    let crit = false;
    if (spec.canCrit && rnd() * 100 < (attacker.critChance || 0)) {
        crit = true;
        dmg *= (attacker.critDamage || 150) / 100;
    }
    // ④ 방어력 / 저항 (비전은 둘 다 무시), 받는 피해 % (감전·수호 태세 등)
    if (spec.element === 'physical') {
        if (!spec.ignoreDefense) dmg *= 1 - physReduction(defender.defense || 0, attacker.level || 1);
    } else if (spec.element !== 'arcane') {
        dmg *= elementMultiplier(defender.res ? defender.res[spec.element] || 0 : 0);
    }
    dmg *= 1 + (defender.damageTakenPct || 0) / 100;
    // ⑤ ±10% 무작위, 최소 1
    dmg *= 0.9 + rnd() * 0.2;
    return { amount: Math.max(1, dmg), crit };
}
// 몬스터 → computeDamage 의 attacker (몬스터는 치명타가 없고 공격력 하나로 물리·원소 피해를 준다, 8-7)
// 위협의 함성 (D5) 을 받은 동안 (custom.weakenT 초) 은 공격력 −weakenPct %
function monsterAttacker(m) {
    const atk = m.atk * (m.custom && m.custom.weakenT > 0 ? 1 - m.custom.weakenPct / 100 : 1);
    return { physAtk: atk, magicAtk: atk, level: m.level, critChance: 0, critDamage: 150, mods: {} };
}
const MONSTER_RES_MIN = -50, MONSTER_RES_MAX = 75;   // AGENTS.md "몬스터 > 공통 규칙" 저항 범위

// ===== [08] 던전 생성 =====
// 방향 (gx, gz 증가량). 북 = z 감소
const DIR_KEYS = ['N', 'E', 'S', 'W'];
const DIR_DELTA = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
const DIR_OPP = { N: 'S', E: 'W', S: 'N', W: 'E' };
const DIR_CW = { N: 'E', E: 'S', S: 'W', W: 'N' };                  // 시계 방향 90° 회전
const DIR_YAW = { N: 0, W: Math.PI / 2, S: Math.PI, E: -Math.PI / 2 };
function cellKey(gx, gz) { return `${gx},${gz}`; }

// --- 조각 템플릿 (기본 방향)
// cells:      [gx, gz, shape, role]  조각 기준 상대 좌표
// links:      [i, j, 변 값]          cells 의 i 번째와 j 번째 칸 사이 변 (두 칸은 붙어 있어야 함)
// connectors: [i, 방향]              i 번째 칸의 그 방향 변이 바깥과 연결될 수 있는 출입구
// rotations:  회전 변형 개수 (1 = 회전 없음, 2 = 0°·90°, 4 = 0°·90°·180°·270°)
// dir:        계단 진행 방향 (앞 통로 → 계단)
function roomBlock(role, centerRole) {
    // (0,0) 을 중심으로 한 3×3 방. 안쪽 변은 모두 'open'
    const cells = [];
    const links = [];
    for (let z = -1; z <= 1; z++) {
        for (let x = -1; x <= 1; x++) cells.push([x, z, 'room', (x === 0 && z === 0) ? centerRole : role]);
    }
    const idx = (x, z) => (z + 1) * 3 + (x + 1);
    for (let z = -1; z <= 1; z++) {
        for (let x = -1; x <= 1; x++) {
            if (x < 1) links.push([idx(x, z), idx(x + 1, z), 'open']);
            if (z < 1) links.push([idx(x, z), idx(x, z + 1), 'open']);
        }
    }
    return { cells, links, idx };
}
function roomWithPassages(role, centerRole) {
    // 3×3 방 + 4방향 통로 1칸씩 (공터·성소)
    const b = roomBlock(role, centerRole);
    const cells = b.cells.slice();
    const links = b.links.slice();
    const connectors = [];
    const passages = [[0, -2, 'N', 0, -1], [2, 0, 'E', 1, 0], [0, 2, 'S', 0, 1], [-2, 0, 'W', -1, 0]];
    for (const [x, z, dir, rx, rz] of passages) {
        cells.push([x, z, 'corridor', 'passage']);
        links.push([cells.length - 1, b.idx(rx, rz), 'door']);
        connectors.push([cells.length - 1, dir]);
    }
    return { rotations: 1, cells, links, connectors };
}
const PIECE_TEMPLATES = {
    straight: { rotations: 2, cells: [[0, 0, 'corridor', 'corridor'], [0, 1, 'corridor', 'corridor'], [0, 2, 'corridor', 'corridor']],
        links: [[0, 1, 'door'], [1, 2, 'door']], connectors: [[0, 'N'], [2, 'S']] },
    corner: { rotations: 4, cells: [[0, 0, 'corridor', 'corridor'], [0, 1, 'corridor', 'corridor'], [1, 1, 'corridor', 'corridor']],
        links: [[0, 1, 'door'], [1, 2, 'door']], connectors: [[0, 'N'], [2, 'E']] },
    cross: { rotations: 1, cells: [[0, 0, 'corridor', 'corridor'], [0, -1, 'corridor', 'corridor'], [1, 0, 'corridor', 'corridor'], [0, 1, 'corridor', 'corridor'], [-1, 0, 'corridor', 'corridor']],
        links: [[0, 1, 'door'], [0, 2, 'door'], [0, 3, 'door'], [0, 4, 'door']], connectors: [[1, 'N'], [2, 'E'], [3, 'S'], [4, 'W']] },
    tee: { rotations: 4, cells: [[0, -1, 'corridor', 'corridor'], [0, 0, 'corridor', 'corridor'], [0, 1, 'corridor', 'corridor'], [1, 0, 'corridor', 'corridor']],
        links: [[0, 1, 'door'], [1, 2, 'door'], [1, 3, 'door']], connectors: [[0, 'N'], [2, 'S'], [3, 'E']] },
    stairsUp: { rotations: 4, dir: 'S', cells: [[0, 0, 'corridor', 'stairsFront'], [0, 1, 'corridor', 'stairsStep1'], [0, 2, 'corridor', 'stairsStep2']],
        links: [[0, 1, 'door'], [1, 2, 'door']], connectors: [[0, 'N']] },
    stairsDown: { rotations: 4, dir: 'S', cells: [[0, 0, 'corridor', 'stairsFront'], [0, 1, 'corridor', 'stairsStep1'], [0, 2, 'corridor', 'stairsStep2']],
        links: [[0, 1, 'door'], [1, 2, 'door']], connectors: [[0, 'N']] },
    portal: { rotations: 4, cells: [[0, 0, 'corridor', 'portal']], links: [], connectors: [[0, 'N']] },
    deadEnd: { rotations: 4, cells: [[0, 0, 'corridor', 'deadEnd']], links: [], connectors: [[0, 'N']] },
    // 방랑 상인의 임시 상점: 1×1 방 (2026-10-25 AGENTS.md, 전에는 3×3), 입구는 한 방향
    merchant: { rotations: 4, cells: [[0, 0, 'room', 'merchantCenter']], links: [], connectors: [[0, 'N']] },
    clearing: roomWithPassages('clearingRoom', 'clearingCenter'),
    sanctuary: roomWithPassages('sanctuaryZone', 'sanctuaryCenter'),
};
const PIECE_SIZE = { straight: 3, corner: 3, cross: 5, tee: 4, stairsUp: 3, stairsDown: 3, portal: 1, deadEnd: 1, merchant: 1, clearing: 13, sanctuary: 13 };
const GROWTH_WEIGHTS = { straight: 30, corner: 25, tee: 20, cross: 10, clearing: 6, deadEnd: 3 };

// 템플릿을 시계 방향으로 90° 회전: (x, z) → (−z, x)
function rotateTemplateOnce(t) {
    return {
        cells: t.cells.map(([x, z, shape, role]) => [-z, x, shape, role]),
        links: t.links,
        connectors: t.connectors.map(([i, d]) => [i, DIR_CW[d]]),
        dir: t.dir ? DIR_CW[t.dir] : null,
    };
}
// 조각 종류 → 회전 변형 목록 (모듈 로드 시 한 번 계산)
const PIECE_VARIANTS = {};
for (const type in PIECE_TEMPLATES) {
    const base = PIECE_TEMPLATES[type];
    let cur = { cells: base.cells, links: base.links, connectors: base.connectors, dir: base.dir || null };
    PIECE_VARIANTS[type] = [];
    for (let r = 0; r < base.rotations; r++) {
        PIECE_VARIANTS[type].push(cur);
        cur = rotateTemplateOnce(cur);
    }
}
function dirBetween(ax, az, bx, bz) {
    for (const d of DIR_KEYS) if (ax + DIR_DELTA[d][0] === bx && az + DIR_DELTA[d][1] === bz) return d;
    throw new Error('붙어 있지 않은 칸 사이 링크');
}
// 조각을 (ox, oz) 위치에 확정 배치. fromEntry = 연결에 쓴 프런티어 항목, usedConnector = 그와 맞닿는 조각 출입구
function commitPiece(d, type, variant, ox, oz, usedConnector, fromEntry) {
    const id = d.pieces.length;
    const piece = { id, type, cells: [], center: null, dir: variant.dir || null };
    const placed = variant.cells.map(([x, z, shape, role]) => {
        const gx = x + ox, gz = z + oz, key = cellKey(gx, gz);
        const cell = {
            gx, gz, pieceId: id, pieceType: type, shape, role,
            edges: { N: 'wall', E: 'wall', S: 'wall', W: 'wall' },
            sanctuaryZone: type === 'sanctuary' && shape === 'room',
            merchantZone: false,   // 방랑 상인 상점 주변 3칸 (생성이 끝난 뒤 markMerchantZone 이 정한다)
        };
        d.cells.set(key, cell);
        piece.cells.push(key);
        if (role.endsWith('Center')) piece.center = key;
        return cell;
    });
    // 조각 안쪽 연결
    for (const [i, j, edge] of variant.links) {
        const a = placed[i], b = placed[j];
        const dir = dirBetween(a.gx, a.gz, b.gx, b.gz);
        a.edges[dir] = edge;
        b.edges[DIR_OPP[dir]] = edge;
    }
    // 기존 조각과 연결
    if (fromEntry) {
        d.cells.get(fromEntry.key).edges[fromEntry.dir] = 'door';
        placed[usedConnector[0]].edges[DIR_OPP[fromEntry.dir]] = 'door';
    }
    // 나머지 출입구: 이미 칸이 있으면 마주 보는 프런티어일 때만 연결 (고리), 비어 있으면 새 프런티어
    const frontierSet = new Set(d.frontier.map((f) => `${f.key}|${f.dir}`));
    const newEntries = [];
    for (const conn of variant.connectors) {
        if (conn === usedConnector) continue;
        const c = placed[conn[0]], dir = conn[1];
        const nk = cellKey(c.gx + DIR_DELTA[dir][0], c.gz + DIR_DELTA[dir][1]);
        const n = d.cells.get(nk);
        if (n) {
            if (n.pieceId !== id && frontierSet.has(`${nk}|${DIR_OPP[dir]}`)) {
                c.edges[dir] = 'door';
                n.edges[DIR_OPP[dir]] = 'door';
            }
        } else {
            newEntries.push({ key: cellKey(c.gx, c.gz), gx: c.gx, gz: c.gz, dir });
        }
    }
    // 이웃이 채워진 프런티어는 제거 (그 변은 벽으로 남음)
    d.frontier = d.frontier.filter((f) => !d.cells.has(cellKey(f.gx + DIR_DELTA[f.dir][0], f.gz + DIR_DELTA[f.dir][1])));
    d.frontier.push(...newEntries);
    d.pieces.push(piece);
    return piece;
}
// 새 성소 중심이 기존 성소들과 맨해튼 거리 20 이상인지 (U11)
function sanctuaryDistanceOk(d, centerGx, centerGz) {
    for (const p of d.pieces) {
        if (p.type !== 'sanctuary') continue;
        const c = d.cells.get(p.center);
        if (Math.abs(c.gx - centerGx) + Math.abs(c.gz - centerGz) < 20) return false;
    }
    return true;
}
// 방랑 상인 상점 주변 (AGENTS.md 2026-10-25 "몬스터는 상점 주변 3칸 이내로 접근하지 않음", U51): 상점 칸에서 가로·세로·대각선 3칸 (체비쇼프 거리)
const MERCHANT_SAFE_CELLS = 3;
function chebyshevCells(ax, az, bx, bz) { return Math.max(Math.abs(ax - bx), Math.abs(az - bz)); }
// 상점 칸과 공터의 3×3 방 칸 (보스·둥지 몬스터 자리) 이 그 범위에서 겹치지 않게 놓는다 (U51)
function merchantClearingOk(d, type, variant, ox, oz) {
    if (type !== 'merchant' && type !== 'clearing') return true;
    const other = type === 'merchant' ? 'clearing' : 'merchant';
    const mine = variant.cells.filter((c) => c[2] === 'room').map(([x, z]) => [x + ox, z + oz]);
    for (const p of d.pieces) {
        if (p.type !== other) continue;
        for (const k of p.cells) {
            const c = d.cells.get(k);
            if (c.shape === 'room' && mine.some(([x, z]) => chebyshevCells(x, z, c.gx, c.gz) <= MERCHANT_SAFE_CELLS)) return false;
        }
    }
    return true;
}
// 생성이 끝난 던전에 상점 주변 칸 표시 (cell.merchantZone). 난수를 쓰지 않으므로 생성 결과는 바뀌지 않는다
function markMerchantZone(d) {
    const p = d.pieces.find((q) => q.type === 'merchant');
    if (!p) return;
    const m = d.cells.get(p.center);
    for (const c of d.cells.values()) if (chebyshevCells(c.gx, c.gz, m.gx, m.gz) <= MERCHANT_SAFE_CELLS) c.merchantZone = true;
}
// 프런티어 항목 하나에 조각을 붙여 본다
function tryPlaceAt(d, type, entry, rng) {
    const tx = entry.gx + DIR_DELTA[entry.dir][0], tz = entry.gz + DIR_DELTA[entry.dir][1];
    const need = DIR_OPP[entry.dir];
    for (const v of rng.shuffle(PIECE_VARIANTS[type].slice())) {
        for (const conn of rng.shuffle(v.connectors.slice())) {
            if (conn[1] !== need) continue;
            const [cx, cz] = v.cells[conn[0]];
            const ox = tx - cx, oz = tz - cz;
            let free = true;
            for (const [x, z] of v.cells) {
                if (d.cells.has(cellKey(x + ox, z + oz))) { free = false; break; }
            }
            if (!free) continue;
            if (type === 'sanctuary' && !sanctuaryDistanceOk(d, ox, oz)) continue;   // 성소 템플릿의 중심은 (0,0) 이므로 (ox, oz) 가 중심
            if (!merchantClearingOk(d, type, v, ox, oz)) continue;
            commitPiece(d, type, v, ox, oz, conn, entry);
            return true;
        }
    }
    return false;
}
// 무작위 프런티어 tries 곳에 놓아 본다
function tryPlaceAnywhere(d, type, rng, tries) {
    const order = rng.shuffle(d.frontier.slice());
    const n = Math.min(tries, order.length);
    for (let i = 0; i < n; i++) if (tryPlaceAt(d, type, order[i], rng)) return true;
    return false;
}
// 남은 칸 수(room) 이하 크기의 조각 중 가중치로 선택
function pickGrowthType(d, rng, room) {
    const w = {};
    for (const k in GROWTH_WEIGHTS) if (PIECE_SIZE[k] <= room) w[k] = GROWTH_WEIGHTS[k];
    if (d.frontier.length < 4) {   // 출입구가 적으면 갈래가 많은 조각 우선
        if (w.tee) w.tee *= 3;
        if (w.cross) w.cross *= 3;
        if (w.deadEnd) w.deadEnd = 0.5;
    }
    let total = 0;
    for (const k in w) total += w[k];
    let r = rng() * total;
    for (const k in w) { r -= w[k]; if (r < 0) return k; }
    return 'deadEnd';
}
// hero (17-1, U39): 'martin' = 원래 규칙 그대로 (난수를 쓰는 순서까지 같아 기존 저장 데이터의 층이 바뀌지 않는다).
// 'eric' = 포탈·상인·보스 공터 없음, 성소는 지하 1층의 시작 성소 1곳뿐 (추가 성소 없음, 지하 2층부터 성소 없음)
function tryGenerateDungeon(rng, floor, hero) {
    const eric = hero === 'eric';
    const target = Math.min(512, 127 + floor);
    const d = { floor, targetCount: target, cells: new Map(), pieces: [], frontier: [], bossPieceId: null };
    const startType = floor === 1 ? 'sanctuary' : 'cross';
    commitPiece(d, startType, PIECE_VARIANTS[startType][0], 0, 0, null, null);
    const required = [];
    if (floor >= 2) required.push(...(eric ? ['stairsUp'] : ['stairsUp', 'sanctuary']));
    required.push(...(eric ? ['stairsDown'] : ['stairsDown', 'portal', 'merchant']));
    if (floor % 5 === 0 && !eric) required.push('clearing');   // 보스 층: 보스가 있을 공터 (에릭은 보스 공터 없음)
    rng.shuffle(required);
    let extraSanctuaries = rng.int(0, 3);
    if (eric) extraSanctuaries = 0;
    const step = (target * 0.8) / required.length;   // 필수 조각을 목표의 80% 안에 고르게 배치
    let nextCheckpoint = step;
    for (let guard = 0; guard < 20000; guard++) {
        if (d.cells.size >= target && required.length === 0) {
            delete d.frontier;   // 남은 프런티어는 벽 (막다른 길) 으로 둔다
            markMerchantZone(d);
            return d;
        }
        if (d.frontier.length === 0) return null;
        const reserve = required.reduce((n, t) => n + PIECE_SIZE[t], 0);
        const room = target - d.cells.size - reserve;
        if (required.length > 0 && (d.cells.size >= nextCheckpoint || room < 13)) {
            if (tryPlaceAnywhere(d, required[0], rng, Infinity)) {
                if (required[0] === 'clearing') d.bossPieceId = d.pieces.length - 1;   // 방금 놓은 조각
                required.shift();
                nextCheckpoint += step;
                continue;
            }
            if (room <= 0) return null;
        }
        if (extraSanctuaries > 0 && room >= 13 && rng() < 0.04) {
            if (tryPlaceAnywhere(d, 'sanctuary', rng, 8)) { extraSanctuaries--; continue; }
        }
        if (room > 0) tryPlaceAnywhere(d, pickGrowthType(d, rng, room), rng, 3);
    }
    return null;
}
// 같은 (seed, floor, hero) 는 항상 같은 던전. hero 를 빼면 마틴 (17-1)
function generateDungeon(seed, floor, hero = DEFAULT_HERO) {
    const h = isHeroId(hero) ? hero : DEFAULT_HERO;
    for (let attempt = 0; attempt < 50; attempt++) {
        const d = tryGenerateDungeon(createRng(hashInts(seed, floor, attempt)), floor, h);
        if (d) {
            d.seed = seed;
            d.attempt = attempt;
            d.hero = h;
            if (h === 'eric') for (const c of d.cells.values()) if (isElevatorInterior(c)) c.ericBarred = true;   // 에릭의 몬스터는 엘리베이터 안으로 들어오지 못한다 (AGENTS.md, 19-2)
            return d;
        }
    }
    throw new Error(`던전 생성 실패: seed=${seed}, floor=${floor}, hero=${h}`);
}

// --- 위치 관련 보조 함수
function cellAtWorld(d, x, z) { return d.cells.get(cellKey(Math.floor(x / CELL_SIZE), Math.floor(z / CELL_SIZE))) || null; }
function cellCenter(cell) { return { x: cell.gx * CELL_SIZE + CELL_SIZE / 2, z: cell.gz * CELL_SIZE + CELL_SIZE / 2 }; }
// 도착 방식별 시작 위치. arrival: 'newGame' | 'descend' (내려와서 도착) | 'ascend' (올라와서 도착) | 'portal'
function getSpawn(d, arrival) {
    let cell = null, face = 'N';
    if (arrival === 'newGame') {
        const p = d.pieces.find((q) => q.type === 'sanctuary');
        if (!p) return getSpawn(d, 'descend');            // 성소가 없는 층 (에릭 지하 2층부터, 17-1): 위층 엘리베이터 앞 통로
        const c = d.cells.get(p.center);
        cell = d.cells.get(cellKey(c.gx, c.gz + 1));   // 분수 바로 남쪽 칸 (성소 구역)
        face = 'N';                                     // 분수를 바라봄
    } else if (arrival === 'descend' || arrival === 'ascend') {
        const p = d.pieces.find((q) => q.type === (arrival === 'descend' ? 'stairsUp' : 'stairsDown'));
        cell = d.cells.get(p.cells[0]);                 // cells[0] = 계단 앞 통로
        face = DIR_OPP[p.dir];                          // 계단을 등지고 바깥을 바라봄
    } else if (arrival === 'portal') {
        const p = d.pieces.find((q) => q.type === 'portal');
        const pc = d.cells.get(p.cells[0]);
        for (const dir of DIR_KEYS) {
            if (pc.edges[dir] === 'door') {             // 포탈 칸과 연결된 이웃 칸
                face = dir;
                cell = d.cells.get(cellKey(pc.gx + DIR_DELTA[dir][0], pc.gz + DIR_DELTA[dir][1]));
            }
        }
    }
    if (!cell) throw new Error('시작 위치를 찾을 수 없음: ' + arrival);
    const c = cellCenter(cell);
    return { cellKey: cellKey(cell.gx, cell.gz), x: c.x, z: c.z, yaw: DIR_YAW[face], faceDir: face };
}

// --- 바닥 높이. 2026-10-24 AGENTS.md 에서 계단이 엘리베이터로 바뀌어 (U37) 경사가 없어졌으므로 어디나 0.
// 호출하는 곳 (주인공·몬스터·투사체·장식) 은 그대로 두고, 높이가 다른 바닥이 다시 생기면 여기서 (d, x, z) 로 정한다
function floorHeightAt() { return 0; }

// --- 칸별 벽 상자 (충돌·렌더링 공용). 칸을 5m | 6m | 5m 로 나누고 가운데 6m 가 통로
const WALL_T = 0.5;            // 방형 칸 벽 두께
const PASS_SIDE = 5;           // 통로 양옆 폭
const WALL_Y0 = -7, WALL_Y1 = CELL_HEIGHT;
function buildCellBoxes(cell) {
    const x0 = cell.gx * CELL_SIZE, z0 = cell.gz * CELL_SIZE, S = CELL_SIZE, P = PASS_SIDE;
    const boxes = [];
    const add = (ax, az, bx, bz) => boxes.push({ minX: x0 + ax, maxX: x0 + bx, minY: WALL_Y0, maxY: WALL_Y1, minZ: z0 + az, maxZ: z0 + bz });
    if (cell.shape === 'corridor') {
        // 네 모서리 기둥 + 막힌 변의 가운데 → 폭 6m 통로
        add(0, 0, P, P); add(S - P, 0, S, P); add(0, S - P, P, S); add(S - P, S - P, S, S);
        if (cell.edges.N === 'wall') add(P, 0, S - P, P);
        if (cell.edges.S === 'wall') add(P, S - P, S - P, S);
        if (cell.edges.W === 'wall') add(0, P, P, S - P);
        if (cell.edges.E === 'wall') add(S - P, P, S, S - P);
    } else {
        // 방: wall = 벽 전체, door = 양쪽 5m 만 벽, open = 벽 없음
        for (const dir of DIR_KEYS) {
            const e = cell.edges[dir];
            if (e === 'open') continue;
            const segs = e === 'wall' ? [[0, S]] : [[0, P], [S - P, S]];
            for (const [a, b] of segs) {
                if (dir === 'N') add(a, 0, b, WALL_T);
                else if (dir === 'S') add(a, S - WALL_T, b, S);
                else if (dir === 'W') add(0, a, WALL_T, b);
                else add(S - WALL_T, a, S, b);
            }
        }
    }
    return boxes;
}

// --- 엘리베이터 (2026-10-24 AGENTS.md "던전 구성요소 (공통)", U37). 조각 id·역할 이름은 계단 시절 그대로 (stairsUp / stairsDown,
// stairsFront = 앞 통로 / stairsStep1 = 복도형 통로 / stairsStep2 = 엘리베이터 1칸, 4.3. 2026-10-24 사용자 결정으로 2칸 → 1칸, 16-9).
// 내부는 step1·step2 경계 (문) 부터 step2 칸의 막힌 벽 면까지
const ELEVATOR_LEN = CELL_SIZE / 2 + (CELL_SIZE / 2 - PASS_SIDE);   // 내부 길이 11m (폭은 통로 폭 6m)
const ELEVATOR_DOOR_H = 4.4;      // 문·내부 천장 높이 (m)
const ELEVATOR_PANEL_Y = 1.3;     // 안쪽 끝 벽의 층 버튼 판 높이 (m)
const CARD_READER_Y = 1.2, CARD_READER_Z = 1.0;   // 에릭의 카드 리더기 (22-4, U55): 높이, 문에서 바깥쪽 (앞 통로) 으로 떨어진 거리 — 문 오른쪽 벽면
// 문 가운데 (step1 과 step2 칸의 경계), 버튼 판 (안쪽 끝 벽 면에서 0.05m 앞), 진행 방향 (앞 통로 → 안쪽). 순수 함수
function elevatorLayout(d, piece) {
    const c2 = cellCenter(d.cells.get(piece.cells[2]));
    const [dx, dz] = DIR_DELTA[piece.dir];
    const door = { x: c2.x - dx * (CELL_SIZE / 2), z: c2.z - dz * (CELL_SIZE / 2) };
    const depth = ELEVATOR_LEN - 0.05;
    return {
        door, dir: piece.dir, dx, dz, yaw: DIR_YAW[piece.dir],
        panel: { x: door.x + dx * depth, y: ELEVATOR_PANEL_Y, z: door.z + dz * depth },
    };
}
// 조준해 F 키로 쓰는 대상 (16-4·21-1, 마틴·에릭 공통. 상인·캐비닛·서랍은 15·17단계에서 더한다). 순수 함수
//   { kind: 'elevator', pieceId, change: 'descend' | 'ascend', x, y, z, labelKey }. furniture = planEricFurniture 결과 (에릭 층, 17-4) 면 캐비닛·서랍도
function collectInteractables(d, furniture = null) {
    const out = [];
    for (const piece of d.pieces) {
        if (piece.type !== 'stairsUp' && piece.type !== 'stairsDown') continue;
        const p = elevatorLayout(d, piece).panel, change = TRIGGER_FLOOR_CHANGE[piece.type];
        out.push({ kind: 'elevator', pieceId: piece.id, change, x: p.x, y: p.y, z: p.z, labelKey: change === 'descend' ? 'interact.elevatorDown' : 'interact.elevatorUp' });
        if (d.hero === 'eric' && piece.type === 'stairsDown') {   // 에릭: 문 바깥 오른쪽 벽면의 카드 리더기 (22-4, U55). 리더기 앞면 가운데, 2.5m · 30°
            const L = elevatorLayout(d, piece), r = localToWorldXZ(L.door.x, L.door.z, L.yaw, CELL_SIZE / 2 - PASS_SIDE - 0.07, CARD_READER_Z);
            out.push({ kind: 'cardReader', pieceId: piece.id, x: r.x, y: CARD_READER_Y, z: r.z, range: ERIC_INTERACT_RANGE, labelKey: 'interact.cardReader' });
        }
    }
    for (const piece of d.pieces) {   // 방랑 상인 (15-2): 상점 칸 안에서 4m · 30° — 카운터 뒤 상인 인형 (로컬 z +1.2) 의 가슴 높이
        if (piece.type !== 'merchant') continue;
        const L = merchantLayout(d, piece), p = localToWorldXZ(L.x, L.z, L.yaw, 0, MERCHANT_FIGURE_Z);
        out.push({ kind: 'merchant', pieceId: piece.id, x: p.x, y: MERCHANT_INTERACT_Y, z: p.z, range: MERCHANT_INTERACT_RANGE, insidePiece: true, labelKey: 'interact.trade' });
    }
    if (furniture) {   // 에릭 가구 (17-4, U40): 캐비닛 문 / 서랍 칸마다 앞면 가운데, 2.5m · 30°
        const front = (it, depth, y) => ({ x: it.x - Math.sin(it.yaw) * (depth / 2 + 0.03), y, z: it.z - Math.cos(it.yaw) * (depth / 2 + 0.03) });
        for (const it of furniture.cabinets) out.push({ kind: 'cabinet', id: it.id, ...front(it, ERIC_FURNITURE.cabinet.d, CABINET_TARGET_Y), range: ERIC_INTERACT_RANGE, labelKey: 'interact.hide' });
        for (const it of furniture.drawers) {
            DRAWER_SLOT_Y.forEach((y, slot) => out.push({ kind: 'drawer', id: it.id, slot, ...front(it, ERIC_FURNITURE.drawer.d, y), range: ERIC_INTERACT_RANGE, labelKey: 'interact.open' }));
        }
    }
    return out;
}
// 에릭 가구의 모양·상호작용 값 (17-3·17-4, U40). 서랍 칸 0 = 위, 1 = 아래 (칸 가운데 높이)
const ERIC_INTERACT_RANGE = 2.5, CABINET_TARGET_Y = 1.2, CABINET_SLIT_Y = 1.68;
const DRAWER_SLOT_Y = [0.85, 0.32], DRAWER_FRONT_H = 0.46, DRAWER_PULL = 0.4;
// 상점 칸 (1×1) 의 놓임: 칸 중심 + 출입구 쪽을 바라보는 yaw (로컬 −z = 입구 쪽). 그리기 (buildMerchantProps) 와 상호작용이 함께 쓴다
const MERCHANT_FIGURE_Z = 1.2, MERCHANT_INTERACT_Y = 1.5, MERCHANT_INTERACT_RANGE = 4;
function merchantLayout(d, piece) {
    const cell = d.cells.get(piece.center);
    const dir = DIR_KEYS.find((k) => cell.edges[k] === 'door') || 'N';
    const { x, z } = cellCenter(cell);
    return { x, z, dir, yaw: DIR_YAW[dir] };
}

// --- 에릭 던전의 가구 (17-2·22-1, AGENTS.md "던전 특징 (에릭)", U40·U52). 순수 함수 — 시드로 정하므로 저장하지 않는다 (가져간 서랍 칸만 world.drawersTaken)
// 캐비닛 = 일자형·ㄱ자형 조각마다 1/4 (층마다 최소 8개, 모자라면 남은 조각에서 더함),
// 서랍형 장롱 = ㅏ형·십자형 조각마다 1/2 + 일자형·ㄱ자형 조각마다 1/4 (캐비닛과 따로 굴림, 층마다 최소 16개).
// 조각의 가운데 칸 (십자형은 가운데 칸에 벽이 없어 팔 칸 중 하나) 의 벽면 가운데에 붙여 통로 쪽을 바라보게 놓는다 (통로 폭 6m → 5.2m 이상 남음).
// 한 조각에 캐비닛·장롱이 함께 오면 같은 칸의 서로 다른 벽 변에 (일자형은 마주 보는 양쪽 벽 → 4.6m 남음).
// 서랍은 위·아래 2칸, 칸마다 50% 빈칸, 나머지는 야광봉 40 / 배터리 20 / 하급 활력 물약 20 / 탐색 주문서 15 / 빛 바랜 주문서 5 (U52).
// 보장: 카드키 = 무작위 빈칸 1곳에 정확히 1개, 배터리 = 4개 이상 (모자라면 빈칸 → 활력 물약·탐색 주문서 칸을 바꿈)
const ERIC_FURNITURE = {
    cabinet: { types: ['straight', 'corner'], chance: 0.25, min: 8, w: 1.2, d: 0.8, h: 2.2 },
    drawer: {
        chance: { tee: 0.5, cross: 0.5, straight: 0.25, corner: 0.25 }, min: 16, w: 1.2, d: 0.6, h: 1.2, emptyChance: 0.5,
        items: [['glowstick', 40], ['battery', 20], ['sta1', 20], ['scroll1', 15], ['fadedScroll', 5]],
        minBattery: 4, batteryFallback: ['sta1', 'scroll1'],
    },
};
ERIC_FURNITURE.drawer.types = Object.keys(ERIC_FURNITURE.drawer.chance);
const ERIC_FURNITURE_SALT = 5005;
// 가구 하나의 놓임: 칸의 벽 변 dir 쪽 벽면 가운데에 붙임. 반환 { id, cellKey, dir, x, z, yaw (앞면이 바라보는 쪽), box (바닥 사각형) }
function furnitureSpot(id, cell, dir, size) {
    const f = cellWallFaces(cell).find((q) => q.len === CELL_SIZE - 2 * PASS_SIDE && DIR_DELTA[dir][0] === -q.nx && DIR_DELTA[dir][1] === -q.nz);
    const mx = f.x + f.tx * f.len / 2, mz = f.z + f.tz * f.len / 2;
    const x = mx + f.nx * size.d / 2, z = mz + f.nz * size.d / 2;
    const hx = Math.abs(f.tx) * size.w / 2 + Math.abs(f.nx) * size.d / 2, hz = Math.abs(f.tz) * size.w / 2 + Math.abs(f.nz) * size.d / 2;
    return { id, cellKey: cellKey(cell.gx, cell.gz), dir, x, z, yaw: Math.atan2(-f.nx, -f.nz), box: { minX: x - hx, maxX: x + hx, minZ: z - hz, maxZ: z + hz } };
}
// 조각에서 가구를 놓을 칸과 벽 변: 가운데 칸 (cells[1]) 에 빈 벽 변이 있으면 그 칸, 없으면 (십자형) 빈 벽 변이 있는 칸 중 무작위.
// used = 이미 가구가 붙은 "칸 키|벽 변" (같은 조각의 캐비닛·장롱이 겹치지 않게). 놓을 곳이 없으면 null
function furnitureCellOf(d, piece, rng, used) {
    const free = (key) => DIR_KEYS.filter((k) => d.cells.get(key).edges[k] === 'wall' && !used.has(`${key}|${k}`));
    let key = piece.cells[1];
    if (free(key).length === 0) {
        const keys = piece.cells.filter((k) => free(k).length > 0);
        if (keys.length === 0) return null;
        key = rng.pick(keys);
    }
    return { cell: d.cells.get(key), dir: rng.pick(free(key)) };
}
function planEricFurniture(d) {
    const rng = createRng(hashInts(d.seed, d.floor, ERIC_FURNITURE_SALT)), C = ERIC_FURNITURE.cabinet, D = ERIC_FURNITURE.drawer;
    const cabPieces = [], cabRest = [], drawerPieces = [], drawerRest = [];
    for (const piece of d.pieces) {   // 조각마다 굴림 (캐비닛·장롱 따로)
        if (C.types.includes(piece.type)) (rng() < C.chance ? cabPieces : cabRest).push(piece);
        if (D.chance[piece.type]) (rng() < D.chance[piece.type] ? drawerPieces : drawerRest).push(piece);
    }
    // 최소 개수 (AGENTS.md 캐비닛 8개·장롱 16개): 모자라면 남은 조각에서 무작위로 더한다 (조각이 모자라면 있는 만큼)
    for (const piece of rng.shuffle(cabRest)) { if (cabPieces.length >= C.min) break; cabPieces.push(piece); }
    for (const piece of rng.shuffle(drawerRest)) { if (drawerPieces.length >= D.min) break; drawerPieces.push(piece); }
    const used = new Set();
    const place = (pieces, size) => {
        const out = [];
        for (const piece of pieces.sort((a, b) => a.id - b.id)) {
            const s = furnitureCellOf(d, piece, rng, used);
            if (!s) continue;
            used.add(`${cellKey(s.cell.gx, s.cell.gz)}|${s.dir}`);
            out.push(furnitureSpot(piece.id, s.cell, s.dir, size));
        }
        return out;
    };
    const cabinets = place(cabPieces, C), drawers = place(drawerPieces, D);
    for (const dr of drawers) dr.items = [0, 1].map(() => (rng() < D.emptyChance ? null : pickWeighted(D.items.map((e) => e[0]), D.items.map((e) => e[1]), rng)));
    // 보장 (U52): 카드키 정확히 1개 (빈칸 → 없으면 배터리가 아닌 칸), 배터리 4개 이상 (빈칸 → 활력 물약·탐색 주문서 칸)
    const slots = drawers.flatMap((dr) => [0, 1].map((i) => ({ dr, i })));
    const get = (s) => s.dr.items[s.i], set = (s, id) => { s.dr.items[s.i] = id; };
    const empties = rng.shuffle(slots.filter((s) => get(s) === null));
    const kc = empties.pop() || rng.pick(slots.filter((s) => get(s) !== 'battery')) || slots[0];
    if (kc) set(kc, 'keycard');
    const fallback = rng.shuffle(slots.filter((s) => D.batteryFallback.includes(get(s))));
    for (let n = slots.filter((s) => get(s) === 'battery').length; n < D.minBattery; n++) {
        const s = empties.pop() || fallback.pop();
        if (!s) break;
        set(s, 'battery');
    }
    return { cabinets, drawers };
}

// --- 디버그용 글자 지도 (북쪽이 위). 칸 하나 = 가로 3글자 × 세로 2줄, 벽은 + - |
// 칸 글자: S 성소, M 상인, C 공터, B 보스 공터, U 위층 엘리베이터, D 아래층 엘리베이터, P 포탈, x 막다른 벽, . 복도
const ASCII_PIECE_CHAR = { sanctuary: 'S', merchant: 'M', clearing: 'C', stairsUp: 'U', stairsDown: 'D', portal: 'P', deadEnd: 'x' };
function dungeonToAscii(d) {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const c of d.cells.values()) {
        minX = Math.min(minX, c.gx); maxX = Math.max(maxX, c.gx);
        minZ = Math.min(minZ, c.gz); maxZ = Math.max(maxZ, c.gz);
    }
    const cols = (maxX - minX + 1) * 3 + 1, rows = (maxZ - minZ + 1) * 2 + 1;
    const grid = Array.from({ length: rows }, () => new Array(cols).fill(' '));
    for (const c of d.cells.values()) {
        const x = (c.gx - minX) * 3, z = (c.gz - minZ) * 2;
        grid[z][x] = grid[z][x + 3] = grid[z + 2][x] = grid[z + 2][x + 3] = '+';
        if (c.edges.N === 'wall') grid[z][x + 1] = grid[z][x + 2] = '-';
        if (c.edges.S === 'wall') grid[z + 2][x + 1] = grid[z + 2][x + 2] = '-';
        if (c.edges.W === 'wall') grid[z + 1][x] = '|';
        if (c.edges.E === 'wall') grid[z + 1][x + 3] = '|';
        const isBoss = d.bossPieceId !== null && c.pieceId === d.bossPieceId;
        grid[z + 1][x + 1] = isBoss ? 'B' : (ASCII_PIECE_CHAR[c.pieceType] || '.');
    }
    return grid.map((row) => row.join('').replace(/\s+$/, '')).join('\n');
}

// --- 걸어서 발동하는 층 이동 트리거 (PROGRESS.md 7-1). 2026-10-24 부터 포탈만 — 엘리베이터는 안의 버튼 판에 F 키로 상호작용한다 (collectInteractables, U37·U58).
// 순수 함수 (view.triggers 와 자체 테스트가 함께 쓴다)
const PORTAL_TRIGGER_RADIUS = 2;       // 포탈 칸 중심에서 수평 거리 (m)
// 던전 → 트리거 목록 [{ kind: 'portal', cellKey, pieceId, x, z (칸 중심) }]
function collectFloorTriggers(d) {
    const out = [];
    for (const piece of d.pieces) {
        if (piece.type !== 'portal') continue;
        const c = cellCenter(d.cells.get(piece.cells[0]));
        out.push({ kind: 'portal', cellKey: piece.cells[0], pieceId: piece.id, x: c.x, z: c.z });
    }
    return out;
}
// (x, z) 가 들어가 있는 트리거 (없으면 null)
function floorTriggerAt(d, triggers, x, z) {
    if (!cellAtWorld(d, x, z)) return null;
    for (const tr of triggers) if (Math.hypot(x - tr.x, z - tr.z) <= PORTAL_TRIGGER_RADIUS) return tr;
    return null;
}
// 트리거·엘리베이터 종류 → applyFloorChange·getSpawn 의 층 이동 종류
const TRIGGER_FLOOR_CHANGE = { stairsDown: 'descend', stairsUp: 'ascend', portal: 'portal' };

// ===== [09] 게임 상태·저장 =====
// localStorage 는 반드시 이 세 함수로만 접근한다 (용량 초과·비공개 모드 예외 처리)
function storageGet(key) { try { return window.localStorage.getItem(key); } catch { return null; } }
function storageSet(key, value) { try { window.localStorage.setItem(key, value); return true; } catch (e) { console.error('[저장 실패]', e); return false; } }
function storageRemove(key) { try { window.localStorage.removeItem(key); } catch { /* 무시 */ } }
function loadSettings() {
    const raw = storageGet(STORAGE_KEY_SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    try {
        const o = JSON.parse(raw);
        return {
            lang: (o.lang === 'ko' || o.lang === 'en') ? o.lang : DEFAULT_SETTINGS.lang,
            quality: (o.quality === 'low' || o.quality === 'normal') ? o.quality : DEFAULT_SETTINGS.quality,
        };
    } catch { return { ...DEFAULT_SETTINGS }; }
}
function saveSettings(settings) { return storageSet(STORAGE_KEY_SETTINGS, JSON.stringify(settings)); }

// --- 저장 슬롯 (0~3)
function slotKey(i) { return STORAGE_KEY_SLOT_PREFIX + i; }
// 반환: { status: 'empty' } | { status: 'ok', data } | { status: 'corrupt' }
function readSlot(i) {
    const raw = storageGet(slotKey(i));
    if (raw === null || raw === undefined) return { status: 'empty' };
    try {
        const data = JSON.parse(raw);
        const valid = data && typeof data === 'object' && data.version === SAVE_VERSION
            && data.player && typeof data.player === 'object' && typeof data.floor === 'number';
        return valid ? { status: 'ok', data } : { status: 'corrupt' };
    } catch {
        return { status: 'corrupt' };
    }
}
// 게임 상태를 슬롯에 저장. 저장 시각을 기록하고 성공 여부를 반환
// game (런타임) 을 주면 현재 위치·방문 칸도 함께 저장한다 (serializeState, 6-5)
function writeSlot(i, state, game) {
    state.savedAt = Date.now();
    return storageSet(slotKey(i), serializeState(state, game));
}
function deleteSlot(i) { storageRemove(slotKey(i)); }

// --- 새 게임 상태 (PROGRESS.md 6.1)
// 일반 등급·옵션 없는 장비 인스턴스 (6.2) 를 만들고 state.nextUid 로 uid 를 발급한다 (시작 장비용)
function makeEquipInstance(state, baseId, iLv) {
    const base = EQUIP_BASES[baseId];
    return {
        kind: 'equip', uid: state.nextUid++, baseId, tier: base.tier, iLv: iLv || 1, rarity: 'normal',
        name: { ko: base.nameKo, en: base.nameEn }, engraving: null, affixes: [],
    };
}
// dungeonSeed 는 0 으로 두고, 호출하는 쪽 (startNewGame, 5단계) 에서 무작위로 정한다. hero = 'martin' | 'eric' (16-1)
function createNewGameState(slotIndex, hero = DEFAULT_HERO) {
    const state = {
        version: SAVE_VERSION,
        slot: slotIndex,
        hero: isHeroId(hero) ? hero : DEFAULT_HERO,
        savedAt: 0,
        floor: 1,
        dungeonSeed: 0,
        theme: 'backrooms',
        nextUid: 1,
        player: {
            level: 1, exp: 0, gold: 0,
            baseStats: { str: 5, dex: 5, int: 5 },
            statPoints: 0, skillPoints: 0,
            hp: 0, mp: 0, stamina: 0,
            skills: { BA: 1 },
            equipment: { helmet: null, armor: null, weapon: null, offhand: null, ring1: null, ring2: null, boots: null },
            inventory: new Array(INVENTORY_SIZE).fill(null),
            actionSlots: [{ type: 'skill', id: 'BA' }, { type: 'item', id: 'hp1' }, null, null, null, null, null],
            activeSlot: 0,
        },
        world: { visited: [], merchantSoldOut: [], drawersTaken: [], glowsticks: [], elevatorUnlocked: false, bossDefeated: false, position: null, runtime: null, history: {} },
    };
    const p = state.player;
    p.equipment.weapon = makeEquipInstance(state, 'pipe0');
    p.equipment.armor = makeEquipInstance(state, 'tracksuit0');
    p.equipment.boots = makeEquipInstance(state, 'shoes0');
    p.inventory[0] = { kind: 'consumable', id: 'hp1', count: 3 };
    if (state.hero === 'eric') {   // 에릭 (18-1, U41·U46): 장비 없음, 소지품 = 플래시 + 배터리 1, 행동 슬롯 1번 = 플래시, 플래시 에너지 300초
        for (const slot of EQUIP_SLOT_KEYS) p.equipment[slot] = null;
        p.inventory[0] = { kind: 'tool', id: 'flashlight' };
        p.inventory[1] = { kind: 'consumable', id: 'battery', count: 1 };
        p.actionSlots = [{ type: 'item', id: 'flashlight' }, null, null, null, null, null, null];
        p.flashEnergy = FLASH_ENERGY_MAX;
    }
    const d = calcDerivedStats(state);
    p.hp = d.maxHp;
    p.mp = d.maxMp;
    p.stamina = d.maxStamina;
    return state;
}

// --- 테마·층 기록 (PROGRESS.md 6.9, 7-7. AGENTS.md "던전 구성요소" 의 층 정보 저장 규칙)
const THEME_IDS = ['backrooms', 'brick', 'cave', 'lava', 'void'];

// 현재 테마와 다른 테마를 무작위로 고른다 (U16). rnd: () => 0 이상 1 미만
function pickNextTheme(current, rnd) {
    const others = THEME_IDS.filter((id) => id !== current);
    return others[Math.floor(rnd() * others.length)];
}
// 새로 정하는 층의 기록. 이웃한 (먼저 정해진) 층의 테마를 뺀 4종 중 무작위 (U16). 새 층은 이 함수로만 만든다 (8절 30번)
function makeFloorRecord(floor, excludeTheme, rnd) {
    return {
        floor, seed: Math.floor(rnd() * 2147483647), theme: pickNextTheme(excludeTheme, rnd),
        visited: '', merchantSoldOut: [], drawersTaken: [], glowsticks: [], elevatorUnlocked: false, bossDefeated: false, runtime: null,
    };
}
// 다음 층 (현재 + 1) 이 아직 정해지지 않았으면 미리 정한다 (AGENTS.md: 다음 층 정보도 저장)
function ensureNextFloor(state, rnd) {
    const next = state.floor + 1;
    if (!state.world.history[next]) state.world.history[next] = makeFloorRecord(next, state.theme, rnd);
}

// 에릭의 서랍 기록 (가져간 칸) 은 현재 층과 바로 위·아래 층 (거리 1) 까지만 보관한다 — 거리 2 이상 (이 값 이상) 떨어진 층의 기록은 지운다.
// 그 층에 다시 가면 서랍이 새것으로 채워져 있다 (2026-10-25 사용자 결정, U61). 현재 층의 기록은 world.drawersTaken
const DRAWER_KEEP_FLOORS = 2;
// 층 기록 중 현재 층에서 멀리 (거리 ≥ 2) 떨어진 층의 서랍 기록·활성 야광봉을 비운다. 저장 데이터를 작게 유지한다 (20-4)
function pruneFarFloorRecords(history, floor) {
    for (const key of Object.keys(history)) {
        const dist = Math.abs(Number(key) - floor), r = history[key];
        if (dist >= DRAWER_KEEP_FLOORS && r.drawersTaken && r.drawersTaken.length > 0) r.drawersTaken = [];   // 에릭 서랍 (U61)
        if (dist >= GLOWSTICK.keepFloors && r.glowsticks && r.glowsticks.length > 0) r.glowsticks = [];       // 에릭 야광봉 (U54)
    }
}
// 층 이동 시 state 를 바꾼다 (6.9 의 규칙, U16~U19·U24)
//   kind:           'descend' (아래 계단) | 'ascend' (위 계단) | 'portal'
//   leavingRuntime: 떠나는 층의 몬스터·시체·바닥 아이템 스냅샷 (6.9, 없으면 null)
//   rnd:            () => 0 이상 1 미만 (새 시드·테마 결정, 게임에서는 Math.random)
// 계단: 떠나는 층은 기록되어 새 "이전 층" 이 되고 (runtime 유지), 들어갈 층은 기록이 있으면 그대로, 없으면 새로 정한다.
// 포탈: 맨 위층까지 모든 기록을 지우고 같은 층 번호의 새 층으로. 어느 경우든 다음 층을 미리 정한다
// 반환: { restored: 기록된 층에 들어갔으면 true, runtime: 복원할 스냅샷 (null 이면 몬스터를 새로 생성) }
function applyFloorChange(state, kind, leavingRuntime, rnd) {
    if (kind !== 'descend' && kind !== 'ascend' && kind !== 'portal') throw new Error('알 수 없는 층 이동: ' + kind);
    if (kind === 'ascend' && state.floor <= 1) throw new Error('지하 1층에서는 위로 갈 수 없음');
    const w = state.world, history = w.history;
    const leaving = {
        floor: state.floor, seed: state.dungeonSeed, theme: state.theme,
        visited: encodeVisited(w.visited), merchantSoldOut: w.merchantSoldOut.slice(), drawersTaken: (w.drawersTaken || []).slice(),
        glowsticks: (w.glowsticks || []).map((s) => ({ x: s.x, z: s.z })), elevatorUnlocked: w.elevatorUnlocked !== false,
        bossDefeated: w.bossDefeated, runtime: leavingRuntime || null,
    };
    let floor, rec = null, target;
    if (kind === 'portal') {
        for (const key of Object.keys(history)) delete history[key];      // 맨 위층까지 전부 초기화
        floor = leaving.floor;
        target = makeFloorRecord(floor, leaving.theme, rnd);
    } else {
        floor = leaving.floor + (kind === 'descend' ? 1 : -1);
        rec = history[floor] || null;
        delete history[floor];                                               // 들어갈 층은 현재 층이 되므로 기록에서 뺀다
        for (const key of Object.keys(history)) history[key].runtime = null; // "이전 층" 이 바뀐다 (U19)
        history[leaving.floor] = leaving;
        target = rec || makeFloorRecord(floor, leaving.theme, rnd);          // 포탈 뒤 처음 올라가는 위층 등
    }
    state.floor = floor;
    state.dungeonSeed = target.seed;
    state.theme = target.theme;
    w.visited = decodeVisited(target.visited);
    w.merchantSoldOut = target.merchantSoldOut.slice();
    w.drawersTaken = (target.drawersTaken || []).slice();   // 에릭 서랍에서 가져간 칸 (17-6). 이전 형식 기록에는 없다
    w.glowsticks = (target.glowsticks || []).map((s) => ({ x: s.x, z: s.z }));   // 에릭의 활성 야광봉 (22-3)
    // 에릭의 아래층 엘리베이터 (22-4, U55): 아래층에서 올라왔으면 그 엘리베이터로 내려갔던 것이므로 활성. 필드가 없는 이전 형식 기록도 활성 (갇히지 않게)
    w.elevatorUnlocked = kind === 'ascend' || target.elevatorUnlocked !== false;
    pruneFarFloorRecords(history, floor);   // 야광봉은 2층 이상 멀어지면 사라진다 (AGENTS.md "던전 특징 (에릭)", U54), 서랍 기록도 같은 범위만 보관 (U61)
    w.bossDefeated = target.bossDefeated;
    w.position = null;                                    // 시작 위치는 getSpawn(dungeon, kind) 로 정한다
    w.runtime = null;                                     // 현재 층 런타임은 런타임 객체가 가진다 (저장할 때 채움, 7-9)
    ensureNextFloor(state, rnd);
    return { restored: !!rec, runtime: rec ? rec.runtime : null };
}

// --- 층 기록의 방문 칸 압축 (7-8, U18). 기록 개수에 제한이 없으므로 저장 데이터를 작게 유지한다
// 키 배열 → '' (없음) 또는 "minGx,minGz,w,h:" + base64(비트열). 비트 i = 칸 (minGx + i % w, minGz + ⌊i / w⌋), 바이트 안에서는 낮은 비트부터
const VISITED_CODE_RE = /^(-?\d+),(-?\d+),(\d+),(\d+):([A-Za-z0-9+/]*={0,2})$/;
const VISITED_CODE_MAX_SIDE = 1024;   // 손상된 데이터로 큰 반복을 돌지 않도록
function encodeVisited(keys) {
    const pts = [];
    for (const k of keys || []) {
        const [x, z] = String(k).split(',').map(Number);
        if (Number.isInteger(x) && Number.isInteger(z)) pts.push([x, z]);
    }
    if (pts.length === 0) return '';
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const [x, z] of pts) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
    }
    const w = maxX - minX + 1, h = maxZ - minZ + 1;
    const bytes = new Uint8Array(Math.ceil((w * h) / 8));
    for (const [x, z] of pts) {
        const i = (z - minZ) * w + (x - minX);
        bytes[i >> 3] |= 1 << (i & 7);
    }
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return `${minX},${minZ},${w},${h}:` + btoa(bin);
}
// 압축 문자열 → 키 배열. 이전 형식 (키 배열) 은 복사해서 그대로, 빈 값·잘못된 값은 []
function decodeVisited(v) {
    if (Array.isArray(v)) return v.slice();
    const m = typeof v === 'string' ? VISITED_CODE_RE.exec(v) : null;
    if (!m) return [];
    const [minX, minZ, w, h] = m.slice(1, 5).map(Number);
    if (w > VISITED_CODE_MAX_SIDE || h > VISITED_CODE_MAX_SIDE) return [];
    let bin;
    try { bin = atob(m[5]); } catch { return []; }
    const out = [];
    for (let i = 0; i < w * h; i++) {
        if ((bin.charCodeAt(i >> 3) >> (i & 7)) & 1) out.push(cellKey(minX + (i % w), minZ + Math.floor(i / w)));
    }
    return out;
}
// 층 기록의 visited 형식 검사: '' / 압축 문자열 / 키 배열 (이전 형식)
function isValidVisitedField(v) {
    if (Array.isArray(v)) return v.every((k) => typeof k === 'string');
    if (v === '') return true;
    const m = typeof v === 'string' ? VISITED_CODE_RE.exec(v) : null;
    return !!m && Number(m[3]) <= VISITED_CODE_MAX_SIDE && Number(m[4]) <= VISITED_CODE_MAX_SIDE;
}

// --- 저장 데이터 직렬화·형식 검사 (PROGRESS.md 6-5)
const EQUIP_SLOT_KEYS = ['helmet', 'armor', 'weapon', 'offhand', 'ring1', 'ring2', 'boots'];
// 게임 상태 → JSON 문자열. game (런타임) 이 있으면 현재 위치·시선·방문 칸을 state.world 에 먼저 넣고,
// 현재 층 몬스터·시체·바닥 아이템 스냅샷 (7-9, U19) 은 저장 문자열의 world.runtime 에만 넣는다
// (state 에 남기면 플레이 중에 낡은 스냅샷이 남는다. 현재 층 상태는 런타임 객체가 가진다)
function serializeState(state, game) {
    if (!game) return JSON.stringify(state);
    const p = game.player;
    state.world.position = { x: p.pos.x, y: p.pos.y, z: p.pos.z, yaw: Math.atan2(Math.sin(p.yaw), Math.cos(p.yaw)) };
    state.world.visited = Array.from(game.visited);
    return JSON.stringify({ ...state, world: { ...state.world, runtime: snapshotFloorRuntime(game) } });
}
// JSON 문자열 → 게임 상태. 형식이 맞지 않으면 null (불러온 뒤 게임이 멈추지 않도록 게임이 읽는 값을 모두 검사)
// 이전 형식 (world.runtime 없음, 다음 층 기록 없음, 기록 방문 칸이 배열) 도 받아들인다 — 다음 층은 createGameRuntime 이 정한다
function deserializeState(json) {
    if (typeof json !== 'string') return null;
    let o;
    try { o = JSON.parse(json); } catch { return null; }
    if (!isValidState(o)) return null;
    if (o.world.runtime === undefined) o.world.runtime = null;
    if (o.world.drawersTaken === undefined) o.world.drawersTaken = [];   // 17-6 이전 저장 데이터
    if (o.world.glowsticks === undefined) o.world.glowsticks = [];       // 22-3 이전
    if (o.world.elevatorUnlocked === undefined) o.world.elevatorUnlocked = true;   // 22-4 이전: 잠금 없이 (카드키 위치가 바뀌어 갇히지 않게, U55)
    if (o.hero === undefined) o.hero = DEFAULT_HERO;   // 2026-10-24 이전 저장 데이터 = 마틴 (U38)
    pruneFarFloorRecords(o.world.history, o.floor);    // 이전에 저장한 먼 층의 서랍 기록 (U61 전에는 모든 층에 보관했다) 은 불러올 때 정리한다
    return o;
}
function isPlainObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function isFiniteNum(v) { return typeof v === 'number' && Number.isFinite(v); }
function isIntIn(v, min, max) { return Number.isInteger(v) && v >= min && v <= max; }
function isValidState(o) {
    if (!isPlainObject(o) || o.version !== SAVE_VERSION) return false;
    if (!isIntIn(o.slot, 0, SLOT_COUNT - 1) || !isFiniteNum(o.savedAt) || !isIntIn(o.floor, 1, Infinity)) return false;
    if (!Number.isInteger(o.dungeonSeed) || !THEMES[o.theme] || !isIntIn(o.nextUid, 1, Infinity)) return false;
    if (o.hero !== undefined && !isHeroId(o.hero)) return false;   // 없으면 이전 형식 (마틴)
    return isValidPlayer(o.player) && isValidWorld(o.world);
}
function isValidPlayer(p) {
    if (!isPlainObject(p) || !isIntIn(p.level, 1, Infinity)) return false;
    for (const k of ['exp', 'gold', 'statPoints', 'skillPoints', 'hp', 'mp', 'stamina']) if (!isFiniteNum(p[k]) || p[k] < 0) return false;
    if (!isPlainObject(p.baseStats) || !['str', 'dex', 'int'].every((k) => isFiniteNum(p.baseStats[k]))) return false;
    if (!isPlainObject(p.skills) || p.skills.BA === undefined) return false;
    for (const id in p.skills) if (!SKILL_BY_ID[id] || !isIntIn(p.skills[id], 1, SKILL_BY_ID[id].maxLv)) return false;
    if (!isPlainObject(p.equipment) || Object.keys(p.equipment).length !== EQUIP_SLOT_KEYS.length) return false;
    for (const slot of EQUIP_SLOT_KEYS) {
        const it = p.equipment[slot];
        if (it === undefined) return false;
        if (it !== null && (!isValidItem(it) || it.kind !== 'equip' || EQUIP_BASES[it.baseId].slot !== slot.replace(/[12]$/, ''))) return false;
    }
    if (!Array.isArray(p.inventory) || p.inventory.length !== INVENTORY_SIZE || !p.inventory.every(isValidItem)) return false;
    if (!Array.isArray(p.actionSlots) || p.actionSlots.length !== ACTION_SLOT_COUNT) return false;
    for (const s of p.actionSlots) {
        if (s === null) continue;
        if (!isPlainObject(s) || !((s.type === 'skill' && SKILL_BY_ID[s.id]) || (s.type === 'item' && (CONSUMABLES[s.id] || TOOLS[s.id])))) return false;
    }
    if (p.flashEnergy !== undefined && !(isFiniteNum(p.flashEnergy) && p.flashEnergy >= 0)) return false;   // 에릭의 플래시 에너지 (18-1)
    return isIntIn(p.activeSlot, 0, ACTION_SLOT_COUNT - 1);
}
// 인벤토리·장비 칸 하나 (6.2). null = 빈칸
function isValidItem(it) {
    if (it === null) return true;
    if (!isPlainObject(it)) return false;
    if (it.kind === 'consumable') return !!CONSUMABLES[it.id] && isIntIn(it.count, 1, stackMaxOf(it.id));
    if (it.kind === 'tool') return Object.hasOwn(TOOLS, it.id);   // 에릭의 플래시 (18-1)
    if (it.kind !== 'equip' || !EQUIP_BASES[it.baseId] || !isIntIn(it.iLv, 1, Infinity) || !Array.isArray(it.affixes)) return false;
    if (!RARITIES[it.rarity] || !isPlainObject(it.name) || typeof it.name.ko !== 'string' || typeof it.name.en !== 'string') return false;
    return (it.engraving === null || isValidAffix(it.engraving, RING_ENGRAVINGS)) && it.affixes.every((a) => isValidAffix(a, AFFIXES));
}
// 부가 옵션·각인 { id, sub?, value } (6.2). table = AFFIXES 또는 RING_ENGRAVINGS (12-1, 수정자 계산·상세 표시가 읽는 값)
function isValidAffix(a, table) {
    if (!isPlainObject(a) || !table[a.id] || !isFiniteNum(a.value)) return false;
    const subs = table[a.id].sub;
    return subs ? subs.includes(a.sub) : true;
}
function isValidWorld(w) {
    if (!isPlainObject(w) || typeof w.bossDefeated !== 'boolean' || !isPlainObject(w.history)) return false;
    if (!Array.isArray(w.visited) || !w.visited.every((k) => typeof k === 'string')) return false;
    if (!Array.isArray(w.merchantSoldOut) || !w.merchantSoldOut.every(Number.isInteger)) return false;
    if (w.drawersTaken !== undefined && !isValidDrawersTaken(w.drawersTaken)) return false;   // 없으면 이전 형식 (17-6)
    if (w.glowsticks !== undefined && !isValidGlowsticks(w.glowsticks)) return false;          // 22-3
    if (w.elevatorUnlocked !== undefined && typeof w.elevatorUnlocked !== 'boolean') return false;   // 22-4
    if (w.position !== null && !(isPlainObject(w.position) && ['x', 'y', 'z', 'yaw'].every((k) => isFiniteNum(w.position[k])))) return false;
    if (w.runtime !== undefined && !isValidRuntimeSnapshot(w.runtime)) return false;   // 없으면 이전 형식 (7-9)
    for (const key in w.history) {   // 층 기록 (6.9). 키는 JSON 을 거쳐 문자열이 된 층 번호
        const r = w.history[key];
        if (!isIntIn(Number(key), 1, Infinity) || !isPlainObject(r) || !Number.isInteger(r.seed) || !THEMES[r.theme]) return false;
        if (!isValidVisitedField(r.visited) || !Array.isArray(r.merchantSoldOut) || typeof r.bossDefeated !== 'boolean') return false;
        if (!isValidRuntimeSnapshot(r.runtime)) return false;
        if (r.drawersTaken !== undefined && !isValidDrawersTaken(r.drawersTaken)) return false;
        if (r.glowsticks !== undefined && !isValidGlowsticks(r.glowsticks)) return false;
        if (r.elevatorUnlocked !== undefined && typeof r.elevatorUnlocked !== 'boolean') return false;
    }
    return true;
}
// 에릭 서랍에서 가져간 칸 목록 (17-6): "가구 id:칸 (0 위 / 1 아래)" 문자열
function isValidDrawersTaken(a) { return Array.isArray(a) && a.every((k) => typeof k === 'string' && /^\d+:[01]$/.test(k)); }
// 활성 야광봉 목록 (22-3): [{ x, z }] (한 층 최대 GLOWSTICK.max 개)
function isValidGlowsticks(a) { return Array.isArray(a) && a.length <= GLOWSTICK.max && a.every((s) => isPlainObject(s) && isFiniteNum(s.x) && isFiniteNum(s.z)); }
// 런타임 스냅샷 (6.9 Runtime) 또는 null. 각 목록의 항목 검사는 그 목록을 복원하는 단계 (8·12단계) 에서 더한다
function isValidRuntimeSnapshot(r) {
    return r === null || (isPlainObject(r) && ['monsters', 'corpses', 'drops'].every((k) => r[k] === undefined || Array.isArray(r[k])));
}

// ===== [10] 렌더링 - 공용 (텍스처·재질) =====
// 2D canvas 에 그린 그림으로 반복 텍스처를 만든다 (이미지 파일 대신)
function makeCanvasTexture(size, draw) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    draw(canvas.getContext('2d'), size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

// 축 정렬 상자 목록 → BufferGeometry 1개 (PROGRESS.md 부록 C). box: { minX, maxX, minY, maxY, minZ, maxZ }
// tile: 텍스처 1장이 덮는 길이 (m). UV 가 월드 좌표 기준이라 상자 사이에서 무늬가 자연스럽게 이어진다
function buildBoxesGeometry(boxes, tile) {
    const pos = [], nor = [], uv = [], idx = [];
    function quad(a, b, c, d, n, uvOf) {
        const base = pos.length / 3;
        for (const p of [a, b, c, d]) {
            pos.push(p[0], p[1], p[2]);
            nor.push(n[0], n[1], n[2]);
            const [u, v] = uvOf(p);
            uv.push(u / tile, v / tile);
        }
        idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    for (const b of boxes) {
        const x0 = b.minX, x1 = b.maxX, y0 = b.minY, y1 = b.maxY, z0 = b.minZ, z1 = b.maxZ;
        quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], (p) => [-p[2], p[1]]);  // +X
        quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], (p) => [p[2], p[1]]);  // -X
        quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], (p) => [p[0], -p[2]]);  // +Y (윗면)
        quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], (p) => [p[0], p[2]]);  // -Y (아랫면)
        quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], (p) => [p[0], p[1]]);   // +Z
        quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], (p) => [-p[0], p[1]]); // -Z
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeBoundingSphere();
    return g;
}
// 위치·회전 (라디안, YXZ 순서 = 먼저 기울이고 나중에 방향을 돌림)·크기 → Matrix4 (InstancedMesh 배치용)
function matrixOf(x, y, z, rx, ry, rz, sx, sy = sx, sz = sx) {
    return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new THREE.Vector3(sx, sy, sz));
}

// --- 이음새 없이 반복되는 무늬 그리기 도우미 (텍스처 가장자리를 넘는 도형은 반대편에도 그린다)
function cssColor(r, g, b, a = 1) {
    return `rgba(${Math.round(clamp(r, 0, 255))}, ${Math.round(clamp(g, 0, 255))}, ${Math.round(clamp(b, 0, 255))}, ${a})`;
}
function drawWrapped(s, x, y, r, fn) {
    for (const ox of [-s, 0, s]) {
        if (x + ox + r < 0 || x + ox - r > s) continue;
        for (const oy of [-s, 0, s]) {
            if (y + oy + r < 0 || y + oy - r > s) continue;
            fn(x + ox, y + oy);
        }
    }
}
// 부드러운 얼룩: 가운데 rgb (불투명도 alpha) → 가장자리 투명
function texBlob(ctx, s, x, y, r, rgb, alpha) {
    drawWrapped(s, x, y, r, (px, py) => {
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, cssColor(rgb[0], rgb[1], rgb[2], alpha));
        g.addColorStop(1, cssColor(rgb[0], rgb[1], rgb[2], 0));
        ctx.fillStyle = g;
        ctx.fillRect(px - r, py - r, r * 2, r * 2);
    });
}
// 작은 점 count 개. colorOf(rng) → CSS 색
function texSpeckle(ctx, s, rng, count, minSize, maxSize, colorOf) {
    for (let i = 0; i < count; i++) {
        const w = minSize + rng() * (maxSize - minSize), x = rng() * s, y = rng() * s;
        ctx.fillStyle = colorOf(rng);
        drawWrapped(s, x, y, w, (px, py) => ctx.fillRect(px, py, w, w));
    }
}
// 꺾인 선 (균열·대리석 결). 같은 rng 상태와 같은 인자면 항상 같은 선이 나온다 (색 지도·발광 지도를 맞출 때 사용)
function texCracks(ctx, s, rng, count, segments, segLen, style, width) {
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < count; i++) {
        const pts = [[rng() * s, rng() * s]];
        let a = rng() * Math.PI * 2;
        for (let k = 0; k < segments; k++) {
            a += (rng() - 0.5) * 1.4;
            const [px, py] = pts[pts.length - 1], len = segLen * (0.5 + rng());
            pts.push([px + Math.cos(a) * len, py + Math.sin(a) * len]);
        }
        for (const ox of [-s, 0, s]) {
            for (const oy of [-s, 0, s]) {
                ctx.beginPath();
                ctx.moveTo(pts[0][0] + ox, pts[0][1] + oy);
                for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0] + ox, pts[k][1] + oy);
                ctx.stroke();
            }
        }
    }
}
// 거친 바위 (얼룩 + 잔점 + 균열). base = [r, g, b]
function drawRock(ctx, s, seed, base) {
    const rng = createRng(seed);
    const tone = (k, a) => cssColor(base[0] * k, base[1] * k, base[2] * k, a);
    ctx.fillStyle = tone(1, 1);
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 60; i++) {
        const k = rng() < 0.5 ? 0.7 : 1.3;
        texBlob(ctx, s, rng() * s, rng() * s, 8 + rng() * 30, [base[0] * k, base[1] * k, base[2] * k], 0.25 + rng() * 0.3);
    }
    texSpeckle(ctx, s, rng, 2500, 1, 2, (r) => tone(0.6 + r() * 0.8, 0.5));
    texCracks(ctx, s, rng, 10, 5, 9, tone(0.35, 0.7), 1.3);
}
// 대리석 (옅은 얼룩 + 결)
function drawMarble(ctx, s, seed, base) {
    const rng = createRng(seed);
    ctx.fillStyle = cssColor(base[0], base[1], base[2]);
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 30; i++) {
        texBlob(ctx, s, rng() * s, rng() * s, 20 + rng() * 50, [base[0] * 0.9, base[1] * 0.9, base[2] * 0.92], 0.18);
    }
    texCracks(ctx, s, rng, 7, 8, 18, 'rgba(150, 145, 140, 0.35)', 1.2);
    texCracks(ctx, s, rng, 6, 6, 12, 'rgba(120, 115, 110, 0.22)', 0.8);
}
// 가로 금색 띠 (가장자리 진한 금 → 가운데 밝은 금). 텍스처의 행 y 부터 h 픽셀
function drawGoldBand(ctx, s, y, h) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#8a6a24');
    g.addColorStop(0.5, '#f2d47c');
    g.addColorStop(1, '#94702a');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, s, h);
}

// --- 테마 텍스처 (256×256, 고정 시드 → 항상 같은 무늬). 벽·바닥·천장은 4m 마다 반복된다 (buildBoxesGeometry tile 4)
//     CanvasTexture 는 위아래가 뒤집혀 올라가므로 캔버스 맨 아래 행 = 텍스처 v 0 = 벽 높이 0m (그다음 4m 마다 반복)
function drawBackroomsWall(ctx, s) {   // 누런 노란색 시트지: 세로 줄무늬 + 옅은 얼룩 + 물 자국
    const rng = createRng(4101);
    ctx.fillStyle = '#c8b25e';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += 16) {
        ctx.fillStyle = 'rgba(255, 244, 180, 0.22)';
        ctx.fillRect(x, 0, 7, s);
        ctx.fillStyle = 'rgba(110, 90, 30, 0.18)';
        ctx.fillRect(x + 11, 0, 1, s);
    }
    texSpeckle(ctx, s, rng, 1600, 1, 2, (r) => (r() < 0.5 ? 'rgba(90, 74, 26, 0.12)' : 'rgba(255, 250, 215, 0.12)'));
    for (let i = 0; i < 8; i++) texBlob(ctx, s, rng() * s, rng() * s, 12 + rng() * 34, [112, 92, 38], 0.08 + rng() * 0.14);
    for (let i = 0; i < 5; i++) {
        const x = rng() * s, y = rng() * s, w = 2 + rng() * 5, h = 30 + rng() * 90;
        ctx.fillStyle = 'rgba(120, 98, 44, 0.12)';
        drawWrapped(s, x, y, h, (px, py) => ctx.fillRect(px, py, w, h));
    }
}
function drawBackroomsFloor(ctx, s) {   // 젖은 듯한 베이지 카펫
    const rng = createRng(4102);
    ctx.fillStyle = '#9a8656';
    ctx.fillRect(0, 0, s, s);
    texSpeckle(ctx, s, rng, 7000, 1, 2, (r) => (r() < 0.55
        ? cssColor(124 + r() * 30, 108 + r() * 24, 66 + r() * 20, 0.5)
        : cssColor(72 + r() * 20, 62 + r() * 16, 34, 0.35)));
    for (let i = 0; i < 7; i++) texBlob(ctx, s, rng() * s, rng() * s, 18 + rng() * 40, [64, 52, 26], 0.16 + rng() * 0.16);
}
function drawBackroomsCeiling(ctx, s) {   // 흰 천장 타일 (1m 격자)
    const rng = createRng(4103);
    ctx.fillStyle = '#dcd6c2';
    ctx.fillRect(0, 0, s, s);
    texSpeckle(ctx, s, rng, 2600, 1, 2, () => 'rgba(150, 140, 110, 0.2)');
    for (let i = 0; i < 4; i++) texBlob(ctx, s, rng() * s, rng() * s, 10 + rng() * 22, [150, 130, 80], 0.2);
    ctx.fillStyle = '#a69e86';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(i * 64, 0, 3, s);
        ctx.fillRect(0, i * 64, s, 3);
    }
}
function drawLightPanel(ctx, s) {   // 형광등 패널: 금속 틀 + 흰 확산판 격자
    ctx.fillStyle = '#bdb8a8';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 4, s - 8, s - 8);
    ctx.fillStyle = 'rgba(200, 200, 190, 0.5)';
    for (let i = 8; i < s - 4; i += 8) {
        ctx.fillRect(i, 4, 1, s - 8);
        ctx.fillRect(4, i, s - 8, 1);
    }
}
function drawBrickWall(ctx, s) {   // 회갈색 벽돌 (1m × 0.5m) + 줄눈 + 이끼
    const rng = createRng(4201);
    ctx.fillStyle = '#2b2622';
    ctx.fillRect(0, 0, s, s);
    const rows = 8, cols = 4, bh = s / rows, bw = s / cols;
    for (let r = 0; r < rows; r++) {
        const tones = Array.from({ length: cols }, () => rng());   // 이음새에서 같은 벽돌이 같은 색이 되도록 먼저 정한다
        const off = (r % 2) * bw / 2;
        for (let c = -1; c <= cols; c++) {
            const v = tones[(c + cols) % cols];
            ctx.fillStyle = cssColor(98 + v * 34, 88 + v * 28, 78 + v * 24);
            ctx.fillRect(c * bw + off + 2, r * bh + 2, bw - 4, bh - 4);
        }
    }
    texSpeckle(ctx, s, rng, 1800, 1, 2, (r) => (r() < 0.5 ? 'rgba(40, 34, 28, 0.35)' : 'rgba(170, 156, 136, 0.2)'));
    texCracks(ctx, s, rng, 8, 4, 7, 'rgba(24, 20, 16, 0.55)', 1);
    for (let i = 0; i < 18; i++) texBlob(ctx, s, rng() * s, rng() * s, 5 + rng() * 15, [58, 88, 36], 0.4);
}
function drawStoneSlabs(ctx, s) {   // 낡은 석판 (1m 타일)
    const rng = createRng(4202);
    ctx.fillStyle = '#26231f';
    ctx.fillRect(0, 0, s, s);
    const n = 4, w = s / n;
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            const v = rng();
            ctx.fillStyle = cssColor(78 + v * 26, 74 + v * 22, 66 + v * 20);
            ctx.fillRect(x * w + 2, y * w + 2, w - 4, w - 4);
        }
    }
    texSpeckle(ctx, s, rng, 2200, 1, 2, (r) => (r() < 0.5 ? 'rgba(30, 28, 24, 0.35)' : 'rgba(150, 144, 130, 0.18)'));
    for (let i = 0; i < 10; i++) texBlob(ctx, s, rng() * s, rng() * s, 10 + rng() * 26, [40, 36, 30], 0.3);
    texCracks(ctx, s, rng, 6, 4, 10, 'rgba(20, 18, 14, 0.6)', 1.2);
}
function drawCaveFloor(ctx, s) {   // 흙 + 자갈
    const rng = createRng(4302);
    ctx.fillStyle = '#4a3e32';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 40; i++) {
        const k = rng() < 0.5 ? 0.75 : 1.2;
        texBlob(ctx, s, rng() * s, rng() * s, 10 + rng() * 30, [74 * k, 62 * k, 50 * k], 0.35);
    }
    texSpeckle(ctx, s, rng, 3000, 1, 2, (r) => cssColor(40 + r() * 50, 34 + r() * 40, 28 + r() * 30, 0.6));
    for (let i = 0; i < 160; i++) {
        const r = 1.5 + rng() * 3.5, x = rng() * s, y = rng() * s, v = 52 + rng() * 40;
        drawWrapped(s, x, y, r, (px, py) => {
            ctx.fillStyle = cssColor(v, v * 0.92, v * 0.84);
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 245, 230, 0.08)';
            ctx.beginPath();
            ctx.arc(px - r * 0.3, py - r * 0.3, r * 0.45, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}
// 용암 균열: 색 지도 (어두운 주황 선) 와 발광 지도 (검정 바탕 + 빛나는 선) 를 같은 시드로 그려 선을 맞춘다
function drawLavaRock(ctx, s, seed, base, crackSeed, crackCount) {
    drawRock(ctx, s, seed, base);
    texCracks(ctx, s, createRng(crackSeed), crackCount, 6, 14, 'rgba(150, 46, 12, 0.95)', 3);
}
function drawLavaGlow(ctx, s, crackSeed, crackCount) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, s, s);
    texCracks(ctx, s, createRng(crackSeed), crackCount, 6, 14, 'rgba(255, 80, 10, 0.35)', 8);
    texCracks(ctx, s, createRng(crackSeed), crackCount, 6, 14, 'rgba(255, 140, 40, 0.9)', 3);
    texCracks(ctx, s, createRng(crackSeed), crackCount, 6, 14, 'rgba(255, 230, 150, 1)', 1);
}
function drawLavaFlow(ctx, s) {   // 벽 아래 용암 줄기 (흐르는 것처럼 오프셋을 움직인다)
    const rng = createRng(4521);
    ctx.fillStyle = '#c8460a';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 40; i++) texBlob(ctx, s, rng() * s, rng() * s, 6 + rng() * 16, [255, 196, 70], 0.55);
    for (let i = 0; i < 22; i++) texBlob(ctx, s, rng() * s, rng() * s, 4 + rng() * 10, [70, 18, 4], 0.6);
}
function drawVoidRail(ctx, s) {   // 흰 대리석 난간 + 금색 줄 (높이 약 1.0~1.15m 와 0.1m)
    drawMarble(ctx, s, 4601, [233, 229, 221]);
    drawGoldBand(ctx, s, 182, 8);
    drawGoldBand(ctx, s, 246, 4);
}
function drawVoidFloor(ctx, s) {   // 흰 대리석 + 금색 줄 (4m 격자 + 가운데 옅은 줄)
    drawMarble(ctx, s, 4602, [236, 232, 224]);
    ctx.fillStyle = 'rgba(214, 178, 92, 0.45)';
    ctx.fillRect(0, s / 2 - 1, s, 2);
    ctx.fillRect(s / 2 - 1, 0, 2, s);
    ctx.fillStyle = '#c9a54a';
    ctx.fillRect(0, 0, s, 4);
    ctx.fillRect(0, 0, 4, s);
}
function drawVoidCrack(ctx, s) {   // 계단 끝의 보라색 발광 균열 (가산 혼합용: 검정 = 투명)
    const rng = createRng(4611);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, s, s);
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(90, 40, 160, 0.6)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const pts = [];
    let x = s / 2;
    for (let y = 0; y <= s; y += 16) {
        pts.push([x, y]);
        x = clamp(x + (rng() - 0.5) * 40, s * 0.3, s * 0.7);
    }
    for (const [w, style] of [[22, 'rgba(120, 60, 220, 0.35)'], [9, 'rgba(180, 120, 255, 0.8)'], [3, 'rgba(250, 235, 255, 1)']]) {
        ctx.strokeStyle = style;
        ctx.lineWidth = w;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.stroke();
    }
}
function drawNebula(ctx, s) {   // 성운 (가산 혼합용: 검정 바탕 + 부드러운 색 얼룩)
    const rng = createRng(4621);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, s, s);
    const tones = [[120, 60, 200], [60, 70, 200], [190, 70, 170], [90, 40, 140]];
    for (let i = 0; i < 26; i++) texBlob(ctx, s, rng() * s, s * 0.2 + rng() * s * 0.6, 20 + rng() * 60, rng.pick(tones), 0.18 + rng() * 0.25);
}
// 공용 (모든 테마): 성소 대리석, 나무, 천막, 포탈 소용돌이
function drawSanctuaryMarble(ctx, s) {
    drawMarble(ctx, s, 4701, [216, 208, 190]);
    ctx.fillStyle = 'rgba(200, 170, 100, 0.55)';
    ctx.fillRect(0, 0, s, 3);
    ctx.fillRect(0, 0, 3, s);
}
function drawWood(ctx, s) {   // 판자 4장 + 나뭇결
    const rng = createRng(4801);
    const n = 4, h = s / n;
    for (let i = 0; i < n; i++) {
        const v = rng();
        ctx.fillStyle = cssColor(110 + v * 30, 72 + v * 20, 40 + v * 12);
        ctx.fillRect(0, i * h, s, h);
        for (let k = 0; k < 14; k++) {
            ctx.fillStyle = cssColor(70, 44, 24, 0.25 + rng() * 0.2);
            ctx.fillRect(0, i * h + rng() * h, s, 1 + rng());
        }
        ctx.fillStyle = 'rgba(30, 18, 10, 0.8)';
        ctx.fillRect(0, i * h, s, 2);
    }
}
function drawTentStripes(ctx, s) {   // 붉은색·크림색 세로 줄무늬
    const rng = createRng(4802);
    const n = 8, w = s / n;
    for (let i = 0; i < n; i++) {
        ctx.fillStyle = i % 2 ? '#d8c69a' : '#8e2b22';
        ctx.fillRect(i * w, 0, w, s);
    }
    texSpeckle(ctx, s, rng, 1500, 1, 2, () => 'rgba(40, 20, 10, 0.12)');
}
function drawPortalSwirl(ctx, s) {   // 포탈 안쪽 소용돌이 (가산 혼합용)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, s, s);
    const c = s / 2;
    const g = ctx.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, 'rgba(235, 215, 255, 1)');
    g.addColorStop(0.35, 'rgba(150, 90, 240, 0.8)');
    g.addColorStop(0.85, 'rgba(60, 20, 120, 0.5)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c, c, c, 0, Math.PI * 2);
    ctx.fill();
    for (let arm = 0; arm < 4; arm++) {
        for (let k = 0; k < 120; k++) {
            const t = k / 120, a = arm * Math.PI / 2 + t * Math.PI * 3, r = t * c * 0.95;
            ctx.fillStyle = `rgba(240, 220, 255, ${0.55 * (1 - t)})`;
            ctx.beginPath();
            ctx.arc(c + Math.cos(a) * r, c + Math.sin(a) * r, 2 + 7 * (1 - t), 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// --- 발광 재질: setLightLevel 로 밝기를 바꿀 수 있도록 원래 값 (밝기 1) 을 userData 에 기록한다
function markGlow(mat) {
    if (mat.isMeshBasicMaterial || mat.isPointsMaterial) mat.userData.glowColor = mat.color.clone();
    else mat.userData.glowEmissive = mat.emissiveIntensity;
    return mat;
}
function applyGlowLevel(mat, f) {
    if (mat.userData.glowColor) mat.color.copy(mat.userData.glowColor).multiplyScalar(f);
    else if (mat.userData.glowEmissive !== undefined) mat.emissiveIntensity = mat.userData.glowEmissive * f;
}
function texLambert(draw, extra) {
    return new THREE.MeshLambertMaterial({ map: makeCanvasTexture(256, draw), ...extra });
}

// --- 공용 도형·재질 (모든 테마의 성소·상인·포탈·장식). 처음 쓰일 때 한 번 만들고 게임이 끝날 때까지 공유한다 (4.6)
let commonAssets = null;
function getCommonAssets() {
    if (commonAssets) return commonAssets;
    const marbleTex = makeCanvasTexture(256, drawSanctuaryMarble);
    const lambert = (o) => new THREE.MeshLambertMaterial(o);
    const geo = {
        box: new THREE.BoxGeometry(1, 1, 1),
        sphere: new THREE.SphereGeometry(1, 14, 10),
        cone: new THREE.ConeGeometry(1, 1, 7),                // 종유석·석순 (각진 원뿔)
        coneSmooth: new THREE.ConeGeometry(1, 1, 16),
        pyramid: new THREE.ConeGeometry(1, 1, 4),             // 천막 지붕
        octa: new THREE.OctahedronGeometry(1, 0),             // 수정
        cyl: new THREE.CylinderGeometry(1, 1, 1, 14),
        link: new THREE.TorusGeometry(0.07, 0.018, 4, 8),    // 쇠사슬 고리
        plane: new THREE.PlaneGeometry(1, 1),
        // 성소 분수: 바깥 벽 → 테두리 → 안쪽 벽 → 물 아래 바닥 (단면을 Y 축으로 돌린 것)
        basin: new THREE.LatheGeometry([[0, 0.5], [4.12, 0.5], [4.12, 0.85], [4.6, 0.85], [4.75, 0.7], [4.75, 0]]
            .map(([r, y]) => new THREE.Vector2(r, y)), 48),
        water: new THREE.CircleGeometry(4.12, 48),
        pillar: new THREE.CylinderGeometry(0.55, 0.75, 2.4, 16),
        statueBody: new THREE.CylinderGeometry(0.32, 0.5, 1.7, 16),
        halo: new THREE.TorusGeometry(0.42, 0.045, 6, 32),
        ring: new THREE.TorusGeometry(2.5, 0.28, 12, 56),    // 포탈 고리
        swirl: new THREE.CircleGeometry(2.3, 48),
    };
    const mat = {
        marble: lambert({ map: marbleTex }),
        basin: lambert({ map: marbleTex, side: THREE.DoubleSide }),
        statue: markGlow(lambert({ map: marbleTex, emissive: 0x3a3020, emissiveIntensity: 1 })),
        gold: markGlow(lambert({ color: 0xd8b45a, emissive: 0x8a6a20, emissiveIntensity: 1 })),
        water: markGlow(lambert({ color: 0x3f8fc8, emissive: 0x0c3050, emissiveIntensity: 1, transparent: true, opacity: 0.78 })),
        wood: lambert({ map: makeCanvasTexture(256, drawWood) }),
        tent: lambert({ map: makeCanvasTexture(256, drawTentStripes), side: THREE.DoubleSide }),
        robe: lambert({ color: 0x4a3060 }),
        skin: lambert({ color: 0xd8b090 }),
        hat: lambert({ color: 0x3a2a1a }),
        cloth: lambert({ color: 0x6a4a2a }),
        rug: lambert({ color: 0x6a2420 }),
        iron: lambert({ color: 0x3a3836 }),
        black: new THREE.MeshBasicMaterial({ color: 0x000000 }),
        potions: [0xc03030, 0x3050d0, 0x30a040].map((c) => lambert({ color: c, emissive: c, emissiveIntensity: 0.25 })),
        lantern: markGlow(new THREE.MeshBasicMaterial({ color: 0xffc46a })),
        portalRing: markGlow(lambert({ color: 0x2c2440, emissive: 0x7a48e0, emissiveIntensity: 0.55 })),
        swirl: markGlow(new THREE.MeshBasicMaterial({
            map: makeCanvasTexture(256, drawPortalSwirl), transparent: true, blending: THREE.AdditiveBlending,
            depthWrite: false, side: THREE.DoubleSide,
        })),
    };
    commonAssets = { geo, mat, glow: [mat.statue, mat.gold, mat.water, mat.lantern, mat.portalRing, mat.swirl] };
    return commonAssets;
}

// --- 테마별 텍스처·재질 (처음 쓰일 때 한 번 만들고 공유). 반환 객체의 glow = setLightLevel 대상 발광 재질
const themeAssetCache = {};
function getThemeAssets(themeId) {
    if (!themeAssetCache[themeId]) themeAssetCache[themeId] = THEME_VISUALS[themeId].makeAssets();
    return themeAssetCache[themeId];
}
function makeBackroomsAssets() {
    const a = {
        wall: texLambert(drawBackroomsWall),
        floor: texLambert(drawBackroomsFloor),
        ceiling: texLambert(drawBackroomsCeiling),
        baseboard: new THREE.MeshLambertMaterial({ color: 0x8c7636 }),
        outlet: new THREE.MeshLambertMaterial({ color: 0xebe5cf }),
        panel: markGlow(new THREE.MeshBasicMaterial({ map: makeCanvasTexture(64, drawLightPanel) })),
    };
    a.glow = [a.panel];
    return a;
}
function makeBrickAssets() {
    const a = {
        wall: texLambert(drawBrickWall),
        floor: texLambert(drawStoneSlabs),
        ceiling: texLambert((c, s) => drawRock(c, s, 4203, [42, 38, 35])),
        iron: new THREE.MeshLambertMaterial({ color: 0x3c3a37 }),
        flame: markGlow(new THREE.MeshBasicMaterial({ color: 0xffc060 })),
        flameHalo: markGlow(new THREE.MeshBasicMaterial({
            color: 0xff6a18, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false,
        })),
    };
    a.glow = [a.flame, a.flameHalo];
    return a;
}
function makeCaveAssets() {
    const a = {
        wall: texLambert((c, s) => drawRock(c, s, 4301, [96, 84, 70])),
        floor: texLambert(drawCaveFloor),
        ceiling: texLambert((c, s) => drawRock(c, s, 4303, [72, 64, 56])),
        crystal: markGlow(new THREE.MeshLambertMaterial({ color: 0x5ff0e0, emissive: 0x1ac0b0, emissiveIntensity: 1 })),
    };
    a.glow = [a.crystal];
    return a;
}
function makeLavaAssets() {
    // 색 지도 + 발광 지도 (주황 균열). emissive 흰색 × emissiveMap = 균열만 빛난다
    const glowRock = (seed, base, crackSeed, n) => markGlow(new THREE.MeshLambertMaterial({
        map: makeCanvasTexture(256, (c, s) => drawLavaRock(c, s, seed, base, crackSeed, n)),
        emissive: 0xffffff, emissiveIntensity: 1,
        emissiveMap: makeCanvasTexture(256, (c, s) => drawLavaGlow(c, s, crackSeed, n)),
    }));
    const a = {
        wall: glowRock(4501, [48, 24, 19], 4511, 9),
        floor: glowRock(4502, [26, 20, 18], 4512, 4),
        ceiling: texLambert((c, s) => drawRock(c, s, 4503, [28, 22, 20])),
        lavaFlow: markGlow(new THREE.MeshBasicMaterial({ map: makeCanvasTexture(128, drawLavaFlow) })),
        ember: markGlow(new THREE.PointsMaterial({
            color: 0xffffff, size: 0.14, map: makeCanvasTexture(32, drawSoftDot), vertexColors: true,
            transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        })),
    };
    a.glow = [a.wall, a.floor, a.lavaFlow, a.ember];
    return a;
}
// 반지름 radius 구면 위의 별 count 개 (밝기·색을 조금씩 다르게)
function makeStarGeometry(count, radius, seed) {
    const rng = createRng(seed);
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const u = rng() * 2 - 1, a = rng() * Math.PI * 2, r = Math.sqrt(1 - u * u);
        pos.set([Math.cos(a) * r * radius, u * radius, Math.sin(a) * r * radius], i * 3);
        const b = 0.4 + rng() * 0.6, k = rng();
        col.set(k < 0.15 ? [b * 0.7, b * 0.8, b] : (k < 0.25 ? [b, b * 0.85, b * 0.7] : [b, b, b]), i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
}
function makeVoidAssets() {
    const nebulaTex = makeCanvasTexture(256, drawNebula);
    const railTex = makeCanvasTexture(256, drawVoidRail), floorTex = makeCanvasTexture(256, drawVoidFloor);
    const rockTex = makeCanvasTexture(256, (c, s) => drawRock(c, s, 4603, [64, 54, 84]));
    // 멀리 떠 있는 조각용: 안개를 받지 않는다 (안개 색이 거의 검정이라 실루엣만 남지 않도록)
    const far = (map) => new THREE.MeshLambertMaterial({ map, fog: false, emissive: 0x3a3450, emissiveIntensity: 1 });
    const a = {
        wall: new THREE.MeshLambertMaterial({ map: railTex }),
        floor: new THREE.MeshLambertMaterial({ map: floorTex }),
        farRail: far(railTex), farFloor: far(floorTex), farRock: far(rockTex),
        crack: markGlow(new THREE.MeshBasicMaterial({
            map: makeCanvasTexture(256, drawVoidCrack), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        })),
        starGeo: makeStarGeometry(2000, 400, 4631),
        starMat: new THREE.PointsMaterial({ size: 1.8, vertexColors: true, fog: false, depthWrite: false }),
        nebulaGeo: new THREE.SphereGeometry(330, 32, 16),
        nebulaMats: [0xffffff, 0x8090ff, 0xff80d0].map((c, i) => new THREE.MeshBasicMaterial({
            map: nebulaTex, color: c, transparent: true, opacity: 0.75 - i * 0.15, blending: THREE.AdditiveBlending,
            depthWrite: false, side: THREE.BackSide, fog: false,
        })),
        pieceGeo: {   // 공중에 떠 있는 조각
            column: new THREE.CylinderGeometry(0.9, 0.9, 7, 16),
            capital: new THREE.BoxGeometry(2.4, 0.6, 2.4),
            arch: new THREE.TorusGeometry(4.5, 0.55, 8, 24, Math.PI),
            stub: new THREE.CylinderGeometry(0.55, 0.55, 3, 12),
            rock: new THREE.DodecahedronGeometry(3.5, 0),
            slab: new THREE.BoxGeometry(7, 0.7, 7),
        },
    };
    a.glow = [a.crack];
    return a;
}

// ===== [11] 렌더링 - 던전 =====
// 테마별 겉모습 (PROGRESS.md 4-3 표). 조명·안개 값은 시작값이며 스크린샷을 보며 조정한다
//   ambient [색, 세기], hemi [하늘색, 땅색, 세기], fog [색, near, far], background (null = 안개 색)
//   wallHeight = 벽을 그리는 높이 (= view.wallVisualHeight), floorThickness = 바닥판 두께, flashlight = 손전등 세기
const THEME_VISUALS = {
    backrooms: {
        ambient: [0xfff4d6, 0.9], hemi: [0xfff8e0, 0x8a7a50, 0.5], fog: [0x6b6440, 12, 75], background: null,
        ceiling: true, wallHeight: CELL_HEIGHT, floorThickness: 0.5, cameraFar: 120, flashlight: 12,
        makeAssets: makeBackroomsAssets, decorate: decorateBackrooms,
    },
    brick: {
        ambient: [0x6a6a80, 0.5], hemi: [0x9aa0b0, 0x201810, 0.4], fog: [0x07080a, 10, 70], background: null,
        ceiling: true, wallHeight: CELL_HEIGHT, floorThickness: 0.5, cameraFar: 120, flashlight: 22,
        makeAssets: makeBrickAssets, decorate: decorateBrick,
    },
    cave: {
        ambient: [0x405060, 0.35], hemi: [0x6080a0, 0x101010, 0.3], fog: [0x05080a, 8, 60], background: null,
        ceiling: true, wallHeight: CELL_HEIGHT, floorThickness: 0.5, cameraFar: 120, flashlight: 24,
        makeAssets: makeCaveAssets, decorate: decorateCave,
    },
    lava: {
        ambient: [0x803020, 0.5], hemi: [0xff8040, 0x200500, 0.4], fog: [0x1a0805, 8, 60], background: null,
        ceiling: true, wallHeight: CELL_HEIGHT, floorThickness: 0.5, cameraFar: 120, flashlight: 18,
        makeAssets: makeLavaAssets, decorate: decorateLava,
    },
    void: {   // 천장 없음, 낮은 난간 (충돌은 다른 테마와 같은 벽 상자, U20)
        ambient: [0x8070c0, 0.6], hemi: [0xb0a0ff, 0x100020, 0.5], fog: [0x0a0618, 20, 110], background: 0x05030c,
        ceiling: false, wallHeight: 1.2, floorThickness: 1, cameraFar: 450, flashlight: 10,
        makeAssets: makeVoidAssets, decorate: decorateVoid,
    },
};
// 에릭 층의 어둠 (18-3, U42 — 2026-10-24 사용자 확정: 플래시 없이 2칸 / 10칸, 플래시 부채꼴 7칸 / 20칸, 범위 밖은 지형도 잘 안 보일 정도로). 1칸 = 16m
const ERIC_DARK = {
    ambient: 0.025,                                                                // 주변광 + 반구광 세기 합 (테마와 상관없이 같은 어둠, 윤곽만 겨우). 시설 조명·발광 장식도 같은 배율
    aura: { intensity: 12, distance: 32 },                                         // 주인공 둘레 빛 (2칸)
    flash: { intensity: 120, distance: 112, angle: 30 * Math.PI / 180, penumbra: 0.35 },   // 플래시 (정면 ±30°, 7칸)
    fogOff: [32, 160], fogOn: [112, 320],                                          // 검은 안개 (near, far)
};
// 조명 [색, 세기, 거리, 감쇠] (4-5). 한 층의 PointLight 는 항상 7개 (손전등 1 + 성소 4 + 상인 1 + 포탈 1) — 개수가 바뀌면 셰이더가 다시 컴파일된다
const SANCTUARY_LIGHT = [0xfff0c8, 30, 40, 1];
const MERCHANT_LIGHT = [0xffb060, 40, 30, 1];
const PORTAL_LIGHT = [0xa070ff, 30, 20, 1];
const MAX_SANCTUARY_LIGHTS = 4;
// 바닥·벽 장식을 두는 칸 (특수 시설 칸은 비워 둔다)
const DECOR_ROLES = new Set(['corridor', 'deadEnd', 'passage', 'clearingRoom', 'stairsFront', 'stairsStep1']);   // stairsStep1 = 엘리베이터 앞 복도 (16-9)

// 칸 안에서 통로 쪽을 향한 벽면 목록 (장식 배치용)
// 반환: [{ x, z (면 위의 시작점), tx, tz (면을 따라가는 방향), nx, nz (통로 쪽 법선), len (m) }]
function cellWallFaces(cell) {
    const x0 = cell.gx * CELL_SIZE, z0 = cell.gz * CELL_SIZE, S = CELL_SIZE, P = PASS_SIDE, M = S - 2 * P;
    const faces = [];
    const add = (ax, az, tx, tz, nx, nz, len) => faces.push({ x: x0 + ax, z: z0 + az, tx, tz, nx, nz, len });
    for (const dir of DIR_KEYS) {
        const e = cell.edges[dir];
        if (cell.shape === 'corridor') {
            if (e === 'wall') {   // 가운데 6m 정사각형의 그 방향 면
                if (dir === 'N') add(P, P, 1, 0, 0, 1, M);
                else if (dir === 'S') add(P, S - P, 1, 0, 0, -1, M);
                else if (dir === 'W') add(P, P, 0, 1, 1, 0, M);
                else add(S - P, P, 0, 1, -1, 0, M);
            } else {              // 그 방향 통로 (5m) 의 양쪽 면
                if (dir === 'N') { add(P, 0, 0, 1, 1, 0, P); add(S - P, 0, 0, 1, -1, 0, P); }
                else if (dir === 'S') { add(P, S - P, 0, 1, 1, 0, P); add(S - P, S - P, 0, 1, -1, 0, P); }
                else if (dir === 'W') { add(0, P, 1, 0, 0, 1, P); add(0, S - P, 1, 0, 0, -1, P); }
                else { add(S - P, P, 1, 0, 0, 1, P); add(S - P, S - P, 1, 0, 0, -1, P); }
            }
        } else if (e !== 'open') {   // 방: 벽 안쪽 면 (출입구 변은 양쪽 5m 만)
            for (const [a, b] of (e === 'wall' ? [[0, S]] : [[0, P], [S - P, S]])) {
                if (dir === 'N') add(a, WALL_T, 1, 0, 0, 1, b - a);
                else if (dir === 'S') add(a, S - WALL_T, 1, 0, 0, -1, b - a);
                else if (dir === 'W') add(WALL_T, a, 0, 1, 1, 0, b - a);
                else add(S - WALL_T, a, 0, 1, -1, 0, b - a);
            }
        }
    }
    return faces;
}
// 칸 안의 걸어다닐 수 있는 영역에서 무작위 점. margin = 벽에서 떨어질 거리
function randomWalkPoint(cell, rng, margin) {
    const S = CELL_SIZE, P = PASS_SIDE;
    let rects;
    if (cell.shape === 'room') rects = [[WALL_T, WALL_T, S - WALL_T, S - WALL_T]];
    else {
        rects = [[P, P, S - P, S - P]];
        if (cell.edges.N !== 'wall') rects.push([P, 0, S - P, P]);
        if (cell.edges.S !== 'wall') rects.push([P, S - P, S - P, S]);
        if (cell.edges.W !== 'wall') rects.push([0, P, P, S - P]);
        if (cell.edges.E !== 'wall') rects.push([S - P, P, S, S - P]);
    }
    const r = rects[Math.floor(rng() * rects.length)];
    return {
        x: cell.gx * S + lerp(r[0] + margin, r[2] - margin, rng()),
        z: cell.gz * S + lerp(r[1] + margin, r[3] - margin, rng()),
    };
}
function decorCells(d, includeMerchant) {
    const out = [];
    for (const c of d.cells.values()) if (DECOR_ROLES.has(c.role) || (includeMerchant && c.role === 'merchantCenter')) out.push(c);
    return out;
}
// 로컬 좌표 (lx, lz) 를 yaw 만큼 돌려 (cx, cz) 에 놓은 월드 좌표 (THREE 의 Y 축 회전과 같음)
function localToWorldXZ(cx, cz, yaw, lx, lz) {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return { x: cx + lx * c + lz * s, z: cz - lx * s + lz * c };
}
// 로컬 상자를 yaw (90° 배수) 만큼 돌린 월드 충돌 상자
function rotatedBox(cx, cz, yaw, lx0, lx1, lz0, lz1, y0, y1) {
    const pts = [[lx0, lz0], [lx1, lz0], [lx0, lz1], [lx1, lz1]].map(([a, b]) => localToWorldXZ(cx, cz, yaw, a, b));
    return {
        minX: Math.min(...pts.map((p) => p.x)), maxX: Math.max(...pts.map((p) => p.x)), minY: y0, maxY: y1,
        minZ: Math.min(...pts.map((p) => p.z)), maxZ: Math.max(...pts.map((p) => p.z)),
    };
}

// 던전 → 충돌 상자 (칸별 Map) + 그리기용 상자 목록 (벽 / 바닥 / 성소 대리석 바닥 / 천장). 순수 함수 (THREE 를 쓰지 않음)
// 엘리베이터 칸도 다른 칸과 같은 평평한 바닥 (U37). 엘리베이터의 벽·천장·문은 장식 (buildElevatorProps)
function collectDungeonBoxes(d, vis) {
    const collision = new Map();
    const wall = [], floor = [], marble = [], ceiling = [];
    const lowWalls = vis.wallHeight < CELL_HEIGHT;   // void: 낮은 난간
    for (const cell of d.cells.values()) {
        const x0 = cell.gx * CELL_SIZE, z0 = cell.gz * CELL_SIZE;
        const boxes = buildCellBoxes(cell);
        collision.set(cellKey(cell.gx, cell.gz), boxes);   // 충돌은 테마와 상관없이 이 상자 그대로 (4-2)
        // void 는 그리기용만 낮춘다 (난간, 바닥판 아래로는 그리지 않음)
        for (const b of boxes) wall.push(lowWalls ? { ...b, minY: -vis.floorThickness, maxY: vis.wallHeight } : b);
        (cell.sanctuaryZone ? marble : floor).push({
            minX: x0, maxX: x0 + CELL_SIZE, minY: -vis.floorThickness, maxY: 0, minZ: z0, maxZ: z0 + CELL_SIZE,
        });
        if (vis.ceiling) {
            ceiling.push({ minX: x0, maxX: x0 + CELL_SIZE, minY: CELL_HEIGHT, maxY: CELL_HEIGHT + 0.5, minZ: z0, maxZ: z0 + CELL_SIZE });
        }
    }
    return { collision, wall, floor, marble, ceiling };
}

// 던전 데이터 → 3D 장면 (PROGRESS.md 4-4)
// 반환: { group, collision, triggers, lights, wallVisualHeight, ceiling, fog, background, cameraFar,
//         update(dt, eyePos), setLightLevel(f), dispose() }
//   eyePos = 카메라 (눈) 위치. 손전등·별·불씨가 따라다닌다
function buildDungeonView(d, themeId) {
    const vis = THEME_VISUALS[themeId];
    if (!vis) throw new Error('알 수 없는 테마: ' + themeId);
    const A = getThemeAssets(themeId), C = getCommonAssets();
    const group = new THREE.Group();
    group.name = 'dungeon:' + themeId;
    const disposables = [], animators = [];
    const boxes = collectDungeonBoxes(d, vis);
    const furniture = d.hero === 'eric' ? planEricFurniture(d) : null;   // 에릭 층의 캐비닛·서랍형 장롱 (17-3)
    const furnitureFaces = new Set(furniture ? [...furniture.cabinets, ...furniture.drawers].map((it) => `${it.cellKey}|${it.dir}`) : []);
    const ctx = {
        d, themeId, A, C, group, collision: boxes.collision, level: 1, furniture,
        elevators: new Map(),   // 조각 id → 문 상태 { open (0~1), closing } (buildElevatorProps, view.closeElevator)
        cabinets: new Map(),    // 캐비닛 id → 그룹 (숨은 동안 그 캐비닛을 감춘다, 17-5)
        drawers: new Map(),     // 서랍형 장롱 id → { slots: [위, 아래 그룹], open: [0~1, 0~1], target: [0 | 1, 0 | 1] } (17-6)
        // 장식을 붙일 벽면 = cellWallFaces 에서 가구가 붙은 벽면 (가운데 6m 면) 을 뺀 것. 가구가 없으면 cellWallFaces 그대로 (마틴 층의 장식은 바뀌지 않음)
        wallFaces(cell) {
            const faces = cellWallFaces(cell);
            if (furnitureFaces.size === 0) return faces;
            const key = cellKey(cell.gx, cell.gz);
            return faces.filter((f) => !(f.len === CELL_SIZE - 2 * PASS_SIDE && DIR_KEYS.some((k) => furnitureFaces.has(`${key}|${k}`) && DIR_DELTA[k][0] === -f.nx && DIR_DELTA[k][1] === -f.nz)));
        },
        rng: createRng(hashInts(d.seed, d.floor, 4004)),   // 장식 배치용 (같은 층은 항상 같은 모습)
        track(o) { disposables.push(o); return o; },
        animate(fn) { animators.push(fn); },
        place(parent, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
            const m = new THREE.Mesh(geo, mat);
            m.position.set(x, y, z);
            m.rotation.set(rx, ry, rz, 'YXZ');
            m.scale.set(sx, sy, sz);
            parent.add(m);
            return m;
        },
        // 상자 목록 → 메시 1개 (지오메트리는 이 층 전용이라 dispose 대상)
        merged(list, tile, mat) {
            if (list.length === 0) return null;
            const m = new THREE.Mesh(this.track(buildBoxesGeometry(list, tile)), mat);
            group.add(m);
            return m;
        },
        // 같은 모양 여러 개 → InstancedMesh 1개 (draw call 1회)
        instanced(geo, mat, matrices) {
            if (matrices.length === 0) return null;
            const m = this.track(new THREE.InstancedMesh(geo, mat, matrices.length));
            matrices.forEach((mx, i) => m.setMatrixAt(i, mx));
            m.instanceMatrix.needsUpdate = true;
            m.computeBoundingSphere();
            group.add(m);
            return m;
        },
        addCollision(key, box) { this.collision.get(key).push(box); },
    };
    // 벽·바닥·천장: 각각 메시 1개
    ctx.merged(boxes.wall, 4, A.wall);
    ctx.merged(boxes.floor, 4, A.floor);
    ctx.merged(boxes.marble, 4, C.mat.marble);
    const ceiling = vis.ceiling ? ctx.merged(boxes.ceiling, 4, A.ceiling) : null;
    // 조명 (4-5)
    const point = (spec) => new THREE.PointLight(spec[0], 0, spec[2], spec[3]);   // 세기는 시설을 놓을 때 정한다
    const lights = {
        ambient: new THREE.AmbientLight(vis.ambient[0], vis.ambient[1]),
        hemi: new THREE.HemisphereLight(vis.hemi[0], vis.hemi[1], vis.hemi[2]),
        player: new THREE.PointLight(0xffe6c0, vis.flashlight, 30, 1),   // 주인공의 휴대폰 손전등
        sanctuaries: Array.from({ length: MAX_SANCTUARY_LIGHTS }, () => point(SANCTUARY_LIGHT)),
        merchant: point(MERCHANT_LIGHT),
        portal: point(PORTAL_LIGHT),
    };
    group.add(lights.ambient, lights.hemi, lights.player, ...lights.sanctuaries, lights.merchant, lights.portal);
    // 에릭 층 (18-3, U42): 플래시 = 정면 부채꼴 SpotLight. 층마다 늘 두고 세기만 바꾼다 (조명 개수가 바뀌면 셰이더를 다시 만든다, 8절 16번)
    const flashSpot = d.hero === 'eric' ? new THREE.SpotLight(0xfff0d8, 0, ERIC_DARK.flash.distance, ERIC_DARK.flash.angle, ERIC_DARK.flash.penumbra, 1) : null;
    if (flashSpot) group.add(flashSpot, flashSpot.target);
    // 에릭 층의 야광봉 (22-3, U54): 조명 4개를 늘 두고 (세기 0) 주인공에게 가까운 야광봉 4개에 배정한다. sticks = [{ x, z, obj }]
    const glow = d.hero === 'eric' ? { lights: Array.from({ length: GLOWSTICK.lights }, () => new THREE.PointLight(GLOWSTICK.color, 0, GLOWSTICK.lightDist, 1)), sticks: [] } : null;
    if (glow) group.add(...glow.lights);
    const aimDir = new THREE.Vector3();
    buildFacilities(ctx, lights);
    buildFurnitureProps(ctx);
    const triggers = collectFloorTriggers(d);   // 걸어서 발동하는 층 이동 트리거 = 포탈 (7-1)
    const interactables = collectInteractables(d, furniture);   // 조준해 F 키로 쓰는 대상 = 엘리베이터 버튼 판 (16-4)·상인 (15-2)·캐비닛·서랍 (17-4)
    vis.decorate(ctx);
    // 밝기 조절 대상 (값은 밝기 1 기준). 손전등은 제외
    const scaled = [lights.ambient, lights.hemi, ...lights.sanctuaries, lights.merchant, lights.portal]
        .map((light) => ({ light, base: light.intensity }));
    const glowMats = [...A.glow, ...C.glow, ...getElevatorAssets().glow];
    let time = 0;
    const view = {
        group, collision: boxes.collision, triggers, interactables, lights, ceiling, dungeon: d, themeId, furniture,
        // 층 이동 때 그 엘리베이터의 문을 닫는다 (16-4)
        closeElevator(pieceId) {
            const s = ctx.elevators.get(pieceId);
            if (s) s.closing = true;
        },
        // 에릭의 아래층 엘리베이터 잠금 (22-4): 잠기면 문이 열리지 않고 문 자리에 충돌, ▼ 표시등 꺼짐, 리더기 불 붉게. 마틴 층은 아무 일도 없다
        setElevatorLocked(locked) {
            for (const s of ctx.elevators.values()) if (s.setLocked) s.setLocked(locked);
        },
        isElevatorLocked() { return [...ctx.elevators.values()].some((s) => s.locked); },
        // 숨은 캐비닛은 감춘다 (안에서 문 안쪽 면이 시야를 막지 않게. 틈은 화면 막 (HUD) 으로 그린다, 17-5)
        setCabinetHidden(id, hidden) {
            const g = ctx.cabinets.get(id);
            if (g) g.visible = !hidden;
        },
        // 서랍 칸 열기 (17-6). 열림 상태는 저장하지 않는다 (층을 다시 만들면 닫혀 있음)
        openDrawer(id, slot) {
            const s = ctx.drawers.get(id);
            if (s) s.target[slot] = 1;
        },
        isDrawerOpen(id, slot) {
            const s = ctx.drawers.get(id);
            return !!s && s.target[slot] === 1;
        },
        ericDark: !!flashSpot,
        // 에릭의 어둠 (18-3, U42): 테마·시설 조명과 발광 장식을 아주 어둡게, 주인공 둘레 빛 2칸 (32m), 플래시 부채꼴 7칸 (112m),
        // 검은 안개 = 꺼짐 32m → 160m (10칸 이후 안 보임) / 켜짐 112m → 320m (20칸). camera.far 는 view.cameraFar 를 게임 화면이 적용한다
        setEricDarkness(flashOn) {
            if (!flashSpot) return;
            view.setLightLevel(Math.min(1, ERIC_DARK.ambient / (vis.ambient[1] + vis.hemi[2])));
            lights.player.intensity = ERIC_DARK.aura.intensity;
            lights.player.distance = ERIC_DARK.aura.distance;
            flashSpot.intensity = flashOn ? ERIC_DARK.flash.intensity : 0;
            const [near, far] = flashOn ? ERIC_DARK.fogOn : ERIC_DARK.fogOff;
            view.fog.color.setHex(0x000000);
            view.fog.near = near;
            view.fog.far = far;
            view.background.setHex(0x000000);
            if (ctx.sky) ctx.sky.visible = false;   // 왜곡된 차원의 별·성운: 플래시 켜짐 (안개 320m) 에서만 드러나지 않게 늘 감춘다
            view.cameraFar = far + 10;
        },
        // 활성 야광봉을 world.glowsticks 목록과 맞춘다 (22-3). 층을 만들 때·야광봉을 쓸 때
        setGlowsticks(list) {
            if (!glow) return;
            for (const s of glow.sticks) group.remove(s.obj);
            glow.sticks = list.map((s, i) => {
                const obj = makeGlowstickObject(s.x, s.z, i);
                group.add(obj);
                return { x: s.x, z: s.z, obj, halo: obj.getObjectByName('halo') };
            });
        },
        glowstickCount() { return glow ? glow.sticks.length : 0; },
        // 플래시를 카메라 위치·시선으로 (매 프레임)
        aimFlash(camera) {
            if (!flashSpot) return;
            camera.getWorldDirection(aimDir);
            flashSpot.position.copy(camera.position);
            flashSpot.target.position.copy(camera.position).add(aimDir);
            flashSpot.target.updateMatrixWorld();
        },
        wallVisualHeight: vis.wallHeight,
        fog: new THREE.Fog(vis.fog[0], vis.fog[1], vis.fog[2]),
        background: new THREE.Color(vis.background !== null ? vis.background : vis.fog[0]),
        cameraFar: vis.cameraFar,
        update(dt, eyePos) {
            time += dt;
            lights.player.position.copy(eyePos);
            for (const fn of animators) fn(dt, time, eyePos);
            if (glow) {   // 야광봉 조명: 가까운 순서로 4개 (나머지 야광봉은 발광 재질만)
                // 빛점은 멀수록 조금 띄운다 — 화면 크기가 일정한 Sprite 는 멀수록 실제 크기가 커져 아래 절반이 바닥에 가려지므로
                for (const s of glow.sticks) s.halo.position.y = GLOWSTICK_HALO_Y + Math.min(GLOWSTICK_HALO_LIFT_MAX, Math.hypot(s.x - eyePos.x, s.z - eyePos.z) * GLOWSTICK_HALO_LIFT);
                const near = glow.sticks.length <= GLOWSTICK.lights ? glow.sticks
                    : glow.sticks.slice().sort((a, b) => Math.hypot(a.x - eyePos.x, a.z - eyePos.z) - Math.hypot(b.x - eyePos.x, b.z - eyePos.z));
                glow.lights.forEach((l, i) => {
                    const s = near[i];
                    l.intensity = s ? GLOWSTICK.lightIntensity : 0;
                    if (s) l.position.set(s.x, GLOWSTICK.lightY, s.z);
                });
            }
        },
        // 0~1. 테마 조명·시설 조명·발광 장식에 곱한다 (백룸 보스 "정전"). 손전등은 그대로
        setLightLevel(f) {
            ctx.level = clamp(f, 0, 1);
            for (const s of scaled) s.light.intensity = s.base * ctx.level;
            for (const m of glowMats) applyGlowLevel(m, ctx.level);
        },
        // 장면에서 빼고 이 층 전용 자원을 해제한다. 공유 텍스처·재질·도형은 남긴다 (4.6)
        dispose() {
            if (group.parent) group.parent.remove(group);
            for (const o of disposables) o.dispose();
            disposables.length = 0;
            animators.length = 0;
            view.setLightLevel(1);   // 공유 발광 재질을 원래 밝기로
        },
    };
    return view;
}
// 성소·상인·포탈·공터·엘리베이터 (층 이동 트리거는 collectFloorTriggers, 엘리베이터 버튼 판은 collectInteractables, [08])
function buildFacilities(ctx, lights) {
    let sanctuaryIndex = 0;
    for (const piece of ctx.d.pieces) {
        if (piece.type === 'sanctuary') {
            buildSanctuaryProps(ctx, piece, lights.sanctuaries[sanctuaryIndex++] || null);
        } else if (piece.type === 'merchant') {
            buildMerchantProps(ctx, piece, lights.merchant);
        } else if (piece.type === 'portal') {
            buildPortalProps(ctx, piece, lights.portal);
        } else if (piece.type === 'clearing') {
            if (piece.id !== ctx.d.bossPieceId) buildClearingProps(ctx, piece);   // 보스 공터는 전투 공간으로 비워 둔다
        } else if (piece.type === 'stairsUp' || piece.type === 'stairsDown') {
            buildElevatorProps(ctx, piece);
        }
    }
}
// --- 엘리베이터 (16-3, U37): 엘리베이터 1칸 (step2, 폭 6m · 길이 11m, 16-9 전에는 2칸 27m) 을 금속 벽·바닥·낮은 천장 (4.4m) 으로 감싼 화물 엘리베이터.
// 앞 복도 (step1) 와의 경계에 양쪽으로 열리는 문 2짝 (주인공이 6m 안이면 열리고 층 이동 때 닫힘, 충돌 없음), 문 위 바깥쪽에 ▲/▼ 표시등,
// 안쪽 끝 벽에 층 버튼 판 (조준해 F 키 → 층 이동). 모든 테마 공용 재질 (getElevatorAssets). 충돌은 칸 벽 상자 그대로 (장식은 통로 안쪽에 붙임)
const ELEVATOR_DOOR_OPEN_DIST = 6;
let elevatorAssets = null;
function getElevatorAssets() {
    if (elevatorAssets) return elevatorAssets;
    const tex = (draw) => makeCanvasTexture(128, draw);
    const lambert = (o) => new THREE.MeshLambertMaterial(o);
    const sign = (up) => (c, s) => {   // 표시등·버튼: 어두운 판 + 호박색 삼각형
        c.fillStyle = '#1a1c20';
        c.fillRect(0, 0, s, s);
        c.fillStyle = '#ffb648';
        c.beginPath();
        if (up) { c.moveTo(s / 2, s * 0.2); c.lineTo(s * 0.8, s * 0.72); c.lineTo(s * 0.2, s * 0.72); }
        else { c.moveTo(s / 2, s * 0.8); c.lineTo(s * 0.8, s * 0.28); c.lineTo(s * 0.2, s * 0.28); }
        c.fill();
    };
    const metal = tex(drawBrushedMetal), upTex = tex(sign(true)), downTex = tex(sign(false));
    const mat = {
        wall: lambert({ map: metal, color: 0xb8bcc4 }),
        floor: lambert({ map: tex(drawCheckerPlate), color: 0x9aa0a8 }),
        ceiling: lambert({ color: 0x8a8e96 }),
        frame: lambert({ color: 0x3a3e46 }),
        door: lambert({ map: metal, color: 0xd0d4dc }),
        light: markGlow(lambert({ color: 0xfff6e0, emissive: 0xfff2d0, emissiveIntensity: 1 })),
        up: markGlow(lambert({ map: upTex, emissive: 0xffffff, emissiveMap: upTex, emissiveIntensity: 1 })),
        down: markGlow(lambert({ map: downTex, emissive: 0xffffff, emissiveMap: downTex, emissiveIntensity: 1 })),
        downOff: lambert({ map: downTex, color: 0x484848 }),   // 잠긴 아래층 엘리베이터의 꺼진 표시등 (22-4)
        reader: lambert({ color: 0x2a2d33 }),                  // 카드 리더기 몸체·카드 홈
        readerSlot: lambert({ color: 0x0c0d10 }),
        ledRed: new THREE.MeshBasicMaterial({ color: 0xff3a30 }),     // 리더기 불: 잠김 붉은색 / 활성 초록색 (빛을 받지 않는 재질 — 어둠 속에서도 보이게)
        ledGreen: new THREE.MeshBasicMaterial({ color: 0x40ff70 }),
    };
    elevatorAssets = { mat, glow: [mat.light, mat.up, mat.down] };
    return elevatorAssets;
}
// 붓질한 금속 (세로 줄무늬)
function drawBrushedMetal(c, s) {
    c.fillStyle = '#c8ccd2';
    c.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += 2) {
        c.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '40,44,52'}, ${0.04 + Math.random() * 0.08})`;
        c.fillRect(x, 0, 2, s);
    }
    c.fillStyle = 'rgba(30, 32, 38, 0.5)';
    c.fillRect(0, 0, s, 2);
}
// 미끄럼 방지 무늬 철판 (바닥)
function drawCheckerPlate(c, s) {
    c.fillStyle = '#8c9098';
    c.fillRect(0, 0, s, s);
    c.fillStyle = 'rgba(220, 224, 232, 0.55)';
    for (let y = 0; y < s; y += 16) {
        for (let x = 0; x < s; x += 16) {
            c.save();
            c.translate(x + 8, y + 8);
            c.rotate(((x + y) / 16) % 2 ? Math.PI / 4 : -Math.PI / 4);
            c.fillRect(-5, -1.5, 10, 3);
            c.restore();
        }
    }
}
function buildElevatorProps(ctx, piece) {
    const L = elevatorLayout(ctx.d, piece), E = getElevatorAssets().mat, G = ctx.C.geo;
    const H = ELEVATOR_DOOR_H, half = CELL_SIZE / 2 - PASS_SIDE, len = ELEVATOR_LEN, mid = -len / 2;
    const g = new THREE.Group();   // 로컬: 원점 = 문 가운데 바닥, −z = 안쪽 (진행 방향), +x = 안쪽을 볼 때 오른쪽
    g.position.set(L.door.x, 0, L.door.z);
    g.rotation.y = L.yaw;
    ctx.group.add(g);
    const p = (geo, mat, x, y, z, sx, sy, sz) => ctx.place(g, geo, mat, x, y, z, 0, 0, 0, sx, sy, sz);
    p(G.box, E.floor, 0, 0.015, mid, half * 2, 0.03, len);                              // 바닥 철판
    for (const s of [-1, 1]) p(G.box, E.wall, s * (half - 0.05), H / 2, mid, 0.1, H, len);   // 양옆 벽판
    p(G.box, E.wall, 0, H / 2, -len + 0.05, half * 2, H, 0.1);                          // 안쪽 끝 벽판
    p(G.box, E.ceiling, 0, H + 0.05, mid, half * 2 + 0.2, 0.1, len);                    // 천장
    for (const s of [-1, 1]) p(G.box, E.light, s * 1.3, H - 0.03, mid, 0.35, 0.04, len - 2);   // 천장 조명 띠
    p(G.box, E.frame, 0, H + 0.8, 0.15, half * 2 + 0.6, 1.6, 0.3);                      // 문 위 상인방
    for (const s of [-1, 1]) p(G.box, E.frame, s * (half + 0.1), H / 2, 0.15, 0.3, H, 0.3);   // 문틀 기둥
    const sign = piece.type === 'stairsDown' ? E.down : E.up;
    p(G.box, sign, 0, H + 0.8, 0.31, 0.7, 0.7, 0.02);                                   // 바깥 표시등 (▲ 위층 / ▼ 아래층)
    p(G.box, E.frame, 0, ELEVATOR_PANEL_Y, -len + 0.13, 0.9, 1.2, 0.06);                // 버튼 판
    p(G.box, sign, 0, ELEVATOR_PANEL_Y + 0.15, -len + 0.165, 0.42, 0.42, 0.02);         // 버튼 (빛남)
    const doors = [-1, 1].map((s) => p(G.box, E.door, s * half / 2, H / 2, 0, half, H, 0.08));
    const state = { open: 0, closing: false, locked: false };
    ctx.elevators.set(piece.id, state);
    if (ctx.d.hero === 'eric' && piece.type === 'stairsDown') {   // 에릭: 카드 리더기 + 잠금 (22-4, U55). 처음엔 잠김 → view.setElevatorLocked 가 world 에 맞춘다
        const rx = half - 0.03, z = CARD_READER_Z;   // 문 바깥 오른쪽 벽면 (안쪽을 볼 때 오른쪽 = +x)
        p(G.box, E.reader, rx, CARD_READER_Y, z, 0.06, 0.34, 0.22);              // 몸체
        p(G.box, E.readerSlot, rx - 0.031, CARD_READER_Y - 0.04, z, 0.005, 0.16, 0.03);   // 카드 홈
        const led = p(G.box, E.ledRed, rx - 0.031, CARD_READER_Y + 0.12, z, 0.006, 0.04, 0.08);
        const signMesh = g.children.find((m) => m.material === sign && Math.abs(m.position.z - 0.31) < 1e-6);
        // 잠긴 동안 문 자리에 충돌 상자 (앞 통로 칸 목록에 둔다 — nearbyBoxes 는 주변 8칸까지 본다)
        const lockBox = rotatedBox(L.door.x, L.door.z, L.yaw, -half, half, -0.15, 0.15, 0, H);
        const list = ctx.collision.get(piece.cells[1]);
        state.locked = true;
        list.push(lockBox);
        state.setLocked = (locked) => {
            state.locked = locked;
            led.material = locked ? E.ledRed : E.ledGreen;
            if (signMesh) signMesh.material = locked ? E.downOff : sign;
            const i = list.indexOf(lockBox);
            if (locked && i < 0) list.push(lockBox);
            else if (!locked && i >= 0) list.splice(i, 1);
        };
        state.setLocked(true);
    }
    ctx.animate((dt, time, eye) => {
        const near = Math.hypot(eye.x - L.door.x, eye.z - L.door.z) < ELEVATOR_DOOR_OPEN_DIST;
        const target = !state.closing && !state.locked && near ? 1 : 0;
        const speed = state.closing ? 3 : 1.6;   // 초당 (0 → 1)
        state.open = target > state.open ? Math.min(target, state.open + speed * dt) : Math.max(target, state.open - speed * dt);
        doors.forEach((m, i) => { m.position.x = (i === 0 ? -1 : 1) * (half / 2 + state.open * (half - 0.15)); });
    });
}
// --- 에릭 가구 (17-3, U40): 철제 사물함 (캐비닛) 과 나무 서랍형 장롱. 모든 테마 공용 재질 (게임 끝까지 유지, 4.6)
let furnitureAssets = null;
function getFurnitureAssets() {
    if (furnitureAssets) return furnitureAssets;
    const lambert = (o) => new THREE.MeshLambertMaterial(o);
    const metal = makeCanvasTexture(128, drawBrushedMetal);
    furnitureAssets = {
        locker: lambert({ map: metal, color: 0x5f6f66 }),
        lockerDoor: lambert({ map: metal, color: 0x7a8c80 }),
        slit: lambert({ color: 0x080a09 }),
        handle: lambert({ color: 0xb4b8bc }),
        wood: lambert({ color: 0x6e4a2c }),
        woodFront: lambert({ color: 0x86603a }),
        woodInner: lambert({ color: 0x3a2616 }),
        brass: lambert({ color: 0xc9a54a }),
    };
    return furnitureAssets;
}
// --- 활성 야광봉 (22-3, U54): 바닥에 누운 발광 막대 + 양 끝 마개 + 빛점 (화면 크기가 거리와 상관없이 일정한 Sprite — 멀리서도 보인다).
// 막대·빛점은 안개를 받지 않고 (fog: false), 깊이 판정은 하므로 벽·장애물에 가리면 안 보인다. 공용 도형·재질 (게임 끝까지 유지, 4.6)
let glowstickAssets = null;
function getGlowstickAssets() {
    if (glowstickAssets) return glowstickAssets;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const c = canvas.getContext('2d'), grad = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    c.fillStyle = grad;
    c.fillRect(0, 0, 64, 64);
    const haloTex = new THREE.CanvasTexture(canvas);
    haloTex.colorSpace = THREE.SRGBColorSpace;
    glowstickAssets = {
        stick: new THREE.CylinderGeometry(0.03, 0.03, 0.26, 8),
        cap: new THREE.CylinderGeometry(0.034, 0.034, 0.03, 8),
        stickMat: new THREE.MeshBasicMaterial({ color: GLOWSTICK.color, fog: false }),
        capMat: new THREE.MeshBasicMaterial({ color: 0x1e2a22, fog: false }),
        haloMat: new THREE.SpriteMaterial({ map: haloTex, color: GLOWSTICK.color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, sizeAttenuation: false }),
    };
    return glowstickAssets;
}
const GLOWSTICK_HALO_SCALE = 0.032;   // 빛점 크기 (sizeAttenuation 없음 → 화면 높이 1080 에서 약 22px, 밝은 가운데는 그 절반쯤)
const GLOWSTICK_HALO_Y = 0.08, GLOWSTICK_HALO_LIFT = 0.006, GLOWSTICK_HALO_LIFT_MAX = 1.2;   // 빛점 높이 = 0.08m + 거리 × 0.006 (최대 +1.2m)
function makeGlowstickObject(x, z, i) {
    const A = getGlowstickAssets(), g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = i * 2.39996;   // 야광봉마다 다른 방향 (황금각)
    const stick = new THREE.Mesh(A.stick, A.stickMat);
    stick.rotation.z = Math.PI / 2;
    stick.position.y = 0.035;
    g.add(stick);
    for (const s of [-1, 1]) {
        const cap = new THREE.Mesh(A.cap, A.capMat);
        cap.rotation.z = Math.PI / 2;
        cap.position.set(s * 0.145, 0.035, 0);
        g.add(cap);
    }
    const halo = new THREE.Sprite(A.haloMat);
    halo.name = 'halo';
    halo.position.y = GLOWSTICK_HALO_Y;
    halo.scale.setScalar(GLOWSTICK_HALO_SCALE);
    g.add(halo);
    return g;
}
// 가구 메시·충돌 상자. 그룹 로컬: 원점 = 바닥 가운데, −z = 앞 (통로 쪽). 충돌 = 바닥 사각형 (planEricFurniture 의 box) × 높이
function buildFurnitureProps(ctx) {
    if (!ctx.furniture) return;
    const M = getFurnitureAssets(), G = ctx.C.geo, CB = ERIC_FURNITURE.cabinet, DR = ERIC_FURNITURE.drawer;
    const groupOf = (it, parent = ctx.group) => {
        const g = new THREE.Group();
        g.position.set(it.x, 0, it.z);
        g.rotation.y = it.yaw;
        parent.add(g);
        return g;
    };
    const p = (parent, mat, x, y, z, sx, sy, sz) => ctx.place(parent, G.box, mat, x, y, z, 0, 0, 0, sx, sy, sz);
    for (const it of ctx.furniture.cabinets) {   // 몸체 + 문 + 눈높이의 가로 틈 (안에서 바깥을 보는 창) + 아래 환기구 + 손잡이
        const g = groupOf(it), fz = -CB.d / 2;
        p(g, M.locker, 0, CB.h / 2, 0, CB.w, CB.h, CB.d);
        p(g, M.lockerDoor, 0, CB.h / 2 - 0.02, fz - 0.012, CB.w - 0.1, CB.h - 0.12, 0.025);
        p(g, M.slit, 0, CABINET_SLIT_Y, fz - 0.028, 0.56, 0.035, 0.01);
        for (const y of [0.22, 0.3, 0.38]) p(g, M.slit, 0, y, fz - 0.028, 0.5, 0.02, 0.01);
        p(g, M.handle, CB.w / 2 - 0.16, 1.05, fz - 0.045, 0.04, 0.24, 0.04);
        ctx.cabinets.set(it.id, g);
        ctx.addCollision(it.cellKey, { ...it.box, minY: 0, maxY: CB.h });
    }
    for (const it of ctx.furniture.drawers) {   // 몸체 + 윗판 + 위·아래 서랍 (앞판·통·손잡이, 열면 앞으로 DRAWER_PULL 만큼 나온다)
        const g = groupOf(it), fz = -DR.d / 2;
        p(g, M.wood, 0, DR.h / 2, 0, DR.w, DR.h, DR.d);
        p(g, M.wood, 0, DR.h + 0.025, 0, DR.w + 0.06, 0.05, DR.d + 0.06);
        const slots = DRAWER_SLOT_Y.map((y) => {
            const s = new THREE.Group();
            s.position.set(0, y, 0);
            g.add(s);
            p(s, M.woodFront, 0, 0, fz - 0.015, DR.w - 0.08, DRAWER_FRONT_H, 0.03);
            p(s, M.woodInner, 0, -0.03, fz + DRAWER_PULL / 2, DR.w - 0.16, DRAWER_FRONT_H - 0.1, DRAWER_PULL);
            p(s, M.brass, 0, 0.03, fz - 0.05, 0.28, 0.04, 0.04);
            return s;
        });
        ctx.drawers.set(it.id, { slots, open: [0, 0], target: [0, 0] });
        ctx.addCollision(it.cellKey, { ...it.box, minY: 0, maxY: DR.h + 0.05 });
    }
    if (ctx.drawers.size > 0) {
        ctx.animate((dt) => {   // 서랍 열기: 0.25초에 걸쳐 앞으로
            for (const s of ctx.drawers.values()) {
                for (let i = 0; i < 2; i++) {
                    if (s.open[i] === s.target[i]) continue;
                    s.open[i] = Math.min(s.target[i], s.open[i] + dt * 4);
                    s.slots[i].position.z = -DRAWER_PULL * s.open[i];
                }
            }
        });
    }
}
// 성소 중심 칸: 원형 분수 + 가운데 기둥 위 석상. 충돌 = 칸 중심 ±4.5m
function buildSanctuaryProps(ctx, piece, light) {
    const G = ctx.C.geo, M = ctx.C.mat;
    const { x, z } = cellCenter(ctx.d.cells.get(piece.center));
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    ctx.group.add(g);
    ctx.place(g, G.basin, M.basin, 0, 0, 0);                              // 분수 (바깥 반지름 4.75m, 높이 0.85m)
    ctx.place(g, G.water, M.water, 0, 0.66, 0, -Math.PI / 2);             // 물
    ctx.place(g, G.pillar, M.marble, 0, 1.2, 0);                          // 가운데 기둥
    ctx.place(g, G.box, M.marble, 0, 2.6, 0, 0, 0, 0, 1.3, 0.4, 1.3);     // 석상 받침
    ctx.place(g, G.statueBody, M.statue, 0, 3.65, 0);                     // 몸 (로브)
    ctx.place(g, G.sphere, M.statue, 0, 4.78, 0, 0, 0, 0, 0.28);          // 머리
    for (const s of [-1, 1]) ctx.place(g, G.box, M.statue, s * 0.67, 4.64, 0, 0, 0, -s * 0.6, 0.16, 0.95, 0.16);   // 들어 올린 두 팔
    ctx.place(g, G.halo, M.gold, 0, 5.22, 0, Math.PI / 2);                // 머리 위 금빛 고리
    if (light) {
        light.position.set(x, 6, z);
        light.intensity = SANCTUARY_LIGHT[1];
    }
    ctx.addCollision(piece.center, { minX: x - 4.5, maxX: x + 4.5, minY: 0, maxY: 5.3, minZ: z - 4.5, maxZ: z + 4.5 });
}
// 상인 중심 칸: 천막 (기둥 + 줄무늬 지붕), 카운터, 상인 인형, 등불, 짐. 입구 쪽을 바라본다
function buildMerchantProps(ctx, piece, light) {
    const G = ctx.C.geo, M = ctx.C.mat;
    const { x, z, yaw } = merchantLayout(ctx.d, piece);
    const g = new THREE.Group();   // 로컬 좌표: −z = 입구 쪽 (앞), +x = 오른쪽
    g.position.set(x, 0, z);
    g.rotation.y = yaw;
    ctx.group.add(g);
    const p = (geo, mat, ...args) => ctx.place(g, geo, mat, ...args);
    for (const [px, pz] of [[-2.3, -1.2], [2.3, -1.2], [-2.3, 2.2], [2.3, 2.2]]) p(G.cyl, M.wood, px, 1.5, pz, 0, 0, 0, 0.07, 3, 0.07);
    p(G.pyramid, M.tent, 0, 3.7, 0.5, 0, Math.PI / 4, 0, 3.3, 1.4, 3.3);                       // 천막 지붕
    p(G.box, M.rug, 0, 0.01, -2.4, 0, 0, 0, 3.4, 0.02, 2);                                    // 깔개
    p(G.box, M.wood, 0, 0.525, -0.4, 0, 0, 0, 3.6, 1.05, 0.9);                                // 카운터
    [-1.25, -0.95, -0.65, 0.95, 1.25].forEach((px, i) => p(G.cyl, M.potions[i % 3], px, 1.16, -0.45, 0, 0, 0, 0.07, 0.22, 0.07));
    p(G.box, M.wood, 0.15, 1.2, -0.35, 0, 0.2, 0, 0.5, 0.3, 0.35);                            // 작은 상자
    p(G.coneSmooth, M.robe, 0, 0.75, MERCHANT_FIGURE_Z, 0, 0, 0, 0.55, 1.5, 0.55);            // 상인: 로브 (상호작용 위치와 같음)
    p(G.sphere, M.skin, 0, 1.72, 1.2, 0, 0, 0, 0.22);                                         // 머리
    for (const s of [-1, 1]) p(G.sphere, M.black, s * 0.08, 1.76, 0.99, 0, 0, 0, 0.03);      // 눈
    p(G.cyl, M.hat, 0, 1.9, 1.2, 0, 0, 0, 0.42, 0.04, 0.42);                                  // 모자 챙
    p(G.coneSmooth, M.hat, 0, 2.17, 1.2, 0, 0, 0, 0.24, 0.55, 0.24);                          // 모자
    p(G.box, M.cloth, 0, 1.1, 1.6, 0, 0, 0, 0.62, 0.8, 0.36);                                 // 등짐
    p(G.box, M.wood, -1.7, 0.45, 2.0, 0, 0, 0, 0.9, 0.9, 0.9);                                // 상자·통
    p(G.box, M.wood, -1.75, 1.25, 2.05, 0, 0.3, 0, 0.7, 0.7, 0.7);
    p(G.cyl, M.cloth, 1.75, 0.5, 2.2, 0, 0, 0, 0.4, 1, 0.4);
    p(G.cyl, M.cloth, 1.2, 0.45, 2.7, 0, 0, 0, 0.35, 0.9, 0.35);
    p(G.box, M.iron, 2.3, 2.62, -1.45, 0, 0, 0, 0.22, 0.06, 0.22);                            // 등불 (앞 오른쪽 기둥)
    p(G.box, M.iron, 2.3, 2.28, -1.45, 0, 0, 0, 0.22, 0.04, 0.22);
    p(G.sphere, M.lantern, 2.3, 2.45, -1.45, 0, 0, 0, 0.13);
    if (light) {
        const lp = localToWorldXZ(x, z, yaw, 1.8, -1.8);
        light.position.set(lp.x, 2.4, lp.z);
        light.intensity = MERCHANT_LIGHT[1];
    }
    // 충돌: 카운터 + 카운터 뒤 (상인·짐) + 앞 기둥 2개
    ctx.addCollision(piece.center, rotatedBox(x, z, yaw, -1.8, 1.8, -0.85, 0.05, 0, 1.1));
    ctx.addCollision(piece.center, rotatedBox(x, z, yaw, -2.45, 2.45, 0.05, 3.0, 0, 3));
    for (const s of [-1, 1]) ctx.addCollision(piece.center, rotatedBox(x, z, yaw, s * 2.3 - 0.12, s * 2.3 + 0.12, -1.32, -1.08, 0, 3));
}
// 포탈 칸: 세워진 고리 (반지름 2.5m) + 안쪽 소용돌이 (매 프레임 회전). 출입구 쪽을 바라본다
function buildPortalProps(ctx, piece, light) {
    const G = ctx.C.geo, M = ctx.C.mat;
    const cell = ctx.d.cells.get(piece.cells[0]);
    const dir = DIR_KEYS.find((k) => cell.edges[k] === 'door') || 'N';
    const { x, z } = cellCenter(cell);
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = DIR_YAW[dir];
    ctx.group.add(g);
    ctx.place(g, G.box, M.portalRing, 0, 0.2, 0, 0, 0, 0, 1.8, 0.4, 1.0);   // 받침
    ctx.place(g, G.ring, M.portalRing, 0, 2.98, 0);
    const swirl = ctx.place(g, G.swirl, M.swirl, 0, 2.98, 0);
    ctx.animate((dt) => { swirl.rotation.z -= dt * 1.6; });
    if (light) {
        light.position.set(x, 3, z);
        light.intensity = PORTAL_LIGHT[1];
    }
}
// 공터 중심 칸: 무너진 기둥·잔해 (칸 중심 ±3m 안, 충돌 있음). 재질은 테마 벽
function buildClearingProps(ctx, piece) {
    const G = ctx.C.geo, mat = ctx.A.wall, rng = ctx.rng;
    const { x, z } = cellCenter(ctx.d.cells.get(piece.center));
    const solid = (px, pz, hx, hz, h) => ctx.addCollision(piece.center, { minX: px - hx, maxX: px + hx, minY: 0, maxY: h, minZ: pz - hz, maxZ: pz + hz });
    const standing = rng.int(1, 2);
    for (let i = 0; i < standing; i++) {   // 서 있는 부러진 기둥
        const px = x + rng() * 4 - 2, pz = z + rng() * 4 - 2, h = 1.6 + rng() * 1.8;
        ctx.place(ctx.group, G.cyl, mat, px, h / 2, pz, 0, rng() * 6.28, 0, 0.6, h, 0.6);
        solid(px, pz, 0.6, 0.6, h);
    }
    const alongX = rng() < 0.5, fx = x + rng() * 2 - 1, fz = z + rng() * 2 - 1;   // 쓰러진 기둥
    ctx.place(ctx.group, G.cyl, mat, fx, 0.55, fz, alongX ? 0 : Math.PI / 2, 0, alongX ? Math.PI / 2 : 0, 0.55, 3, 0.55);
    solid(fx, fz, alongX ? 1.5 : 0.55, alongX ? 0.55 : 1.5, 1.1);
    const rubble = rng.int(3, 5);
    for (let i = 0; i < rubble; i++) {     // 잔해 상자 (돌려 놓아도 충돌 상자가 덮도록 반 변 × 0.71)
        const s = 0.4 + rng() * 0.5, px = x + rng() * 5 - 2.5, pz = z + rng() * 5 - 2.5;
        ctx.place(ctx.group, G.box, mat, px, s * 0.4, pz, (rng() - 0.5) * 0.3, rng() * 6.28, 0, s, s * 0.8, s);
        solid(px, pz, s * 0.71, s * 0.71, s * 0.8);
    }
}

// --- 테마별 장식 (ctx.rng 로 배치 → 같은 층은 항상 같은 모습)
// 백룸: 천장 형광등 패널 (칸마다 2개, 몇 개는 깜빡임), 걸레받이, 콘센트
function decorateBackrooms(ctx) {
    const { d, rng, A, C } = ctx;
    const panels = [];
    for (const cell of d.cells.values()) {
        const c = cellCenter(cell);
        const alongZ = cell.shape === 'corridor' && cell.edges.E === 'wall' && cell.edges.W === 'wall';   // 남북 방향 복도
        for (const sgn of [-1, 1]) {
            panels.push(matrixOf(c.x + (alongZ ? 0 : sgn * 2.4), CELL_HEIGHT - 0.03, c.z + (alongZ ? sgn * 2.4 : 0),
                0, alongZ ? 0 : Math.PI / 2, 0, 1.3, 0.06, 0.62));
        }
    }
    const lamps = ctx.instanced(C.geo.box, A.panel, panels);
    const color = new THREE.Color(1, 1, 1);
    for (let i = 0; i < panels.length; i++) lamps.setColorAt(i, color);
    const flicker = [];
    for (let i = 0; i < panels.length; i++) if (rng() < 0.05) flicker.push({ i, t: rng() * 4, on: true });
    ctx.animate((dt) => {   // 재질 색만 바꾼다 (실제 조명이 아니므로 셰이더 재컴파일 없음)
        let changed = false;
        for (const f of flicker) {
            f.t -= dt;
            if (f.t > 0) continue;
            f.on = !f.on;
            f.t = f.on ? 0.04 + Math.random() * (Math.random() < 0.25 ? 4 : 0.25) : 0.03 + Math.random() * 0.12;
            lamps.setColorAt(f.i, color.setScalar(f.on ? 1 : 0.15));
            changed = true;
        }
        if (changed) lamps.instanceColor.needsUpdate = true;
    });
    const strips = [], outlets = [];
    for (const cell of d.cells.values()) {   // 걸레받이: 벽 상자를 2.5cm 키운 높이 14cm 띠 (엘리베이터 칸 제외)
        if (isElevatorInterior(cell)) continue;
        for (const b of buildCellBoxes(cell)) {
            strips.push({ minX: b.minX - 0.025, maxX: b.maxX + 0.025, minY: 0, maxY: 0.14, minZ: b.minZ - 0.025, maxZ: b.maxZ + 0.025 });
        }
    }
    ctx.merged(strips, 1, A.baseboard);
    for (const cell of decorCells(d, true)) {
        const faces = ctx.wallFaces(cell).filter((f) => f.len >= 2);
        if (faces.length === 0 || rng() > 0.35) continue;
        const f = rng.pick(faces), u = 0.6 + rng() * (f.len - 1.2);
        outlets.push(matrixOf(f.x + f.tx * u + f.nx * 0.03, 0.38, f.z + f.tz * u + f.nz * 0.03, 0, Math.atan2(f.nx, f.nz), 0, 0.09, 0.13, 0.03));
    }
    ctx.instanced(C.geo.box, A.outlet, outlets);
}
// 판타지 벽돌벽: 칸마다 0~1개 횃불 (실제 조명 아님), 천장에서 늘어진 쇠사슬
function decorateBrick(ctx) {
    const { d, rng, A, C } = ctx;
    const iron = [], flames = [], halos = [], links = [];
    for (const cell of decorCells(d, true)) {
        const faces = ctx.wallFaces(cell).filter((f) => f.len >= 2);
        if (faces.length === 0) continue;
        if (rng() < 0.55) {
            const f = rng.pick(faces), u = 1 + rng() * (f.len - 2), ry = Math.atan2(f.nx, f.nz);
            const at = (off) => [f.x + f.tx * u + f.nx * off, f.z + f.tz * u + f.nz * off];
            let [px, pz] = at(0.02);
            iron.push(matrixOf(px, 2.35, pz, 0, ry, 0, 0.2, 0.32, 0.04));        // 벽판
            [px, pz] = at(0.13);
            iron.push(matrixOf(px, 2.45, pz, 0.35, ry, 0, 0.08, 0.5, 0.08));    // 손잡이 (벽 바깥으로 기울임)
            [px, pz] = at(0.22);
            flames.push(matrixOf(px, 2.78, pz, 0, 0, 0, 0.1, 0.17, 0.1));
            halos.push(matrixOf(px, 2.8, pz, 0, 0, 0, 0.36));
        }
        if (cell.role !== 'merchantCenter' && rng() < 0.2) {
            const f = rng.pick(faces), u = 0.8 + rng() * (f.len - 1.6), ry = rng() * Math.PI;
            const px = f.x + f.tx * u + f.nx * 0.4, pz = f.z + f.tz * u + f.nz * 0.4;
            const n = Math.floor((1.5 + rng() * 2.5) / 0.1);
            for (let k = 0; k < n; k++) links.push(matrixOf(px, CELL_HEIGHT - 0.06 - k * 0.1, pz, 0, ry + (k % 2) * Math.PI / 2, 0, 1));
        }
    }
    ctx.instanced(C.geo.box, A.iron, iron);
    ctx.instanced(C.geo.sphere, A.flame, flames);
    ctx.instanced(C.geo.sphere, A.flameHalo, halos);
    ctx.instanced(C.geo.link, A.iron, links);
    ctx.animate((dt, t) => {   // 불꽃 일렁임 (밝기 조절과 함께 적용)
        const k = ctx.level * (0.85 + 0.15 * Math.sin(t * 11.3) * Math.sin(t * 6.7 + 1.3));
        A.flame.color.copy(A.flame.userData.glowColor).multiplyScalar(k);
        A.flameHalo.color.copy(A.flameHalo.userData.glowColor).multiplyScalar(k);
    });
}
// 동굴: 종유석 (칸마다 0~3개), 석순, 청록 발광 수정
function decorateCave(ctx) {
    const { d, rng, A, C } = ctx;
    const tites = [], mites = [], crystals = [];
    for (const cell of decorCells(d)) {
        const n = rng.int(0, 3);
        for (let i = 0; i < n; i++) {
            const p = randomWalkPoint(cell, rng, 0.8), len = 1 + rng() * 2, r = 0.2 + rng() * 0.35;
            tites.push(matrixOf(p.x, CELL_HEIGHT - len / 2, p.z, Math.PI, rng() * 6.28, 0, r, len, r));   // 뒤집은 원뿔
        }
        const faces = ctx.wallFaces(cell).filter((f) => f.len >= 1.5);
        if (faces.length === 0) continue;
        const m = rng.int(0, 2);
        for (let i = 0; i < m; i++) {
            const f = rng.pick(faces), u = 0.5 + rng() * (f.len - 1), off = 0.3 + rng() * 0.6;
            const h = 0.4 + rng() * 1.2, r = 0.15 + rng() * 0.3;
            mites.push(matrixOf(f.x + f.tx * u + f.nx * off, h / 2, f.z + f.tz * u + f.nz * off, 0, rng() * 6.28, 0, r, h, r));
        }
        if (rng() < 0.3) {
            const f = rng.pick(faces), u = 0.5 + rng() * (f.len - 1);
            const bx = f.x + f.tx * u + f.nx * 0.45, bz = f.z + f.tz * u + f.nz * 0.45;
            const k = rng.int(2, 5);
            for (let i = 0; i < k; i++) {
                const r = 0.1 + rng() * 0.2;
                crystals.push(matrixOf(bx + (rng() - 0.5) * 0.7, r * 1.2, bz + (rng() - 0.5) * 0.7,
                    (rng() - 0.5) * 1.0, rng() * 6.28, (rng() - 0.5) * 1.0, r * 0.55, r * 1.8, r * 0.55));
            }
        }
    }
    ctx.instanced(C.geo.cone, A.wall, tites);
    ctx.instanced(C.geo.cone, A.wall, mites);
    ctx.instanced(C.geo.octa, A.crystal, crystals);
}
// 용암 동굴: 벽 아래 용암 줄기 (발광 평면, 피해 없음), 위로 떠오르다 사라지는 불씨
function decorateLava(ctx) {
    const { d, rng, A } = ctx;
    const strips = [];
    for (const cell of decorCells(d)) {
        for (const f of ctx.wallFaces(cell)) {
            if (f.len < 2 || rng() > 0.3) continue;
            const w = 0.5 + rng() * 0.5;
            const ax = f.x + f.tx * 0.3, az = f.z + f.tz * 0.3;
            const bx = f.x + f.tx * (f.len - 0.3) + f.nx * w, bz = f.z + f.tz * (f.len - 0.3) + f.nz * w;
            strips.push({ minX: Math.min(ax, bx), maxX: Math.max(ax, bx), minY: 0.005, maxY: 0.03, minZ: Math.min(az, bz), maxZ: Math.max(az, bz) });
        }
    }
    ctx.merged(strips, 2, A.lavaFlow);
    const N = 220;
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), speed = new Float32Array(N), life = new Float32Array(N);
    const geo = ctx.track(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const embers = new THREE.Points(geo, A.ember);
    embers.frustumCulled = false;
    ctx.group.add(embers);
    let started = false;
    const respawn = (i, eye, anyHeight) => {
        const a = Math.random() * Math.PI * 2, r = 1 + Math.random() * 13;
        pos[i * 3] = eye.x + Math.cos(a) * r;
        pos[i * 3 + 1] = eye.y - 1.7 + (anyHeight ? Math.random() * 7 : Math.random() * 0.6);
        pos[i * 3 + 2] = eye.z + Math.sin(a) * r;
        speed[i] = 0.4 + Math.random() * 0.9;
        life[i] = 4 + Math.random() * 5;
    };
    ctx.animate((dt, t, eye) => {
        const flow = A.lavaFlow.map.offset;
        flow.x = (flow.x + dt * 0.05) % 1;
        flow.y = (flow.y + dt * 0.02) % 1;
        for (let i = 0; i < N; i++) {
            if (!started) respawn(i, eye, true);
            life[i] -= dt;
            pos[i * 3 + 1] += speed[i] * dt;
            pos[i * 3] += Math.sin(t * 1.3 + i) * 0.3 * dt;
            const dx = pos[i * 3] - eye.x, dz = pos[i * 3 + 2] - eye.z;
            if (life[i] <= 0 || dx * dx + dz * dz > 256) respawn(i, eye, false);
            const b = Math.min(1, life[i] / 2) * (0.6 + 0.4 * Math.sin(t * 9 + i));   // 수명이 끝나 갈수록 어두워짐 (가산 혼합 → 사라짐)
            col.set([b, b * 0.45, b * 0.12], i * 3);
        }
        started = true;
        geo.attributes.position.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;
    });
}
// 왜곡된 차원: 별 (2000개, 반지름 400m) + 보라 성운 (카메라를 따라다님), 던전 위아래 공중에 떠서 천천히 도는 대리석 조각 10~20개
function decorateVoid(ctx) {
    const { d, rng, A } = ctx;
    const sky = new THREE.Group();
    const stars = new THREE.Points(A.starGeo, A.starMat);
    stars.frustumCulled = false;
    stars.renderOrder = -11;
    sky.add(stars);
    A.nebulaMats.forEach((mat, i) => {
        const neb = new THREE.Mesh(A.nebulaGeo, mat);
        neb.rotation.set(i * 0.9, i * 2.1, i * 0.4);
        neb.frustumCulled = false;
        neb.renderOrder = -10;
        sky.add(neb);
    });
    ctx.group.add(sky);
    ctx.sky = sky;   // 에릭 층의 어둠에서는 감춘다 (setEricDarkness)
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const c of d.cells.values()) {
        minX = Math.min(minX, c.gx * CELL_SIZE); maxX = Math.max(maxX, (c.gx + 1) * CELL_SIZE);
        minZ = Math.min(minZ, c.gz * CELL_SIZE); maxZ = Math.max(maxZ, (c.gz + 1) * CELL_SIZE);
    }
    const P = A.pieceGeo, place = ctx.place;
    const floating = [];
    const count = rng.int(10, 20);
    for (let i = 0; i < count; i++) {
        const g = new THREE.Group();
        const kind = i % 3;
        if (kind === 0) {          // 부러진 기둥
            place(g, P.column, A.farRail, 0, 0, 0);
            place(g, P.capital, A.farFloor, 0, 3.8, 0);
        } else if (kind === 1) {   // 아치
            place(g, P.arch, A.farRail, 0, 0, 0);
            for (const s of [-1, 1]) place(g, P.stub, A.farRail, s * 4.5, -1.5, 0);
        } else {                   // 바위섬 + 대리석 판
            place(g, P.rock, A.farRock, 0, 0, 0, 0, 0, 0, 1, 0.55, 1);
            place(g, P.slab, A.farFloor, 0, 1.75, 0);
        }
        const baseY = rng() < 0.6 ? -16 - rng() * 40 : 24 + rng() * 24;
        g.position.set(lerp(minX - 60, maxX + 60, rng()), baseY, lerp(minZ - 60, maxZ + 60, rng()));
        g.rotation.set((rng() - 0.5) * 0.6, rng() * 6.28, (rng() - 0.5) * 0.6);
        g.scale.setScalar(0.7 + rng() * 0.8);
        ctx.group.add(g);
        floating.push({ g, baseY, spin: (rng() - 0.5) * 0.12, phase: rng() * 6.28 });
    }
    ctx.animate((dt, t, eye) => {
        sky.position.copy(eye);
        for (const f of floating) {
            f.g.rotation.y += f.spin * dt;
            f.g.position.y = f.baseY + Math.sin(t * 0.25 + f.phase) * 1.5;
        }
    });
}
// view 를 장면에 붙인다 (안개·배경·카메라 far 포함) / 떼어 내고 해제한다
function mountDungeonView(view) {
    app.scene.add(view.group);
    app.scene.fog = view.fog;
    app.scene.background = view.background;
    app.camera.far = view.cameraFar;
    app.camera.updateProjectionMatrix();
}
function unmountDungeonView(view) {
    if (view) view.dispose();
    app.scene.fog = null;
    app.scene.background = new THREE.Color(0x000000);
    app.camera.far = CAMERA_FAR_DEFAULT;
    app.camera.updateProjectionMatrix();
}

// ===== [12] 입력 =====
// 키보드·마우스·포인터 락 (PROGRESS.md 부록 E). 키는 e.code 로 판별한다
const input = {
    keys: new Set(),          // 지금 눌려 있는 키 (e.code)
    pressed: new Set(),       // 이번 프레임에 새로 눌린 키 (endInputFrame 에서 비움)
    mouseLeft: false,         // 왼쪽 버튼을 누르고 있는 중 (락 중에 누른 것만 — 행동 슬롯 사용, 21-2)
    leftClicked: false,       // 이번 프레임에 왼쪽 버튼을 눌렀음 (락 중에만. 플래시 켜고 끄기는 누르는 순간에만, 18-2)
    dx: 0, dy: 0,             // 이번 프레임 마우스 이동량 (포인터 락 중에만 누적)
    wheel: 0,                 // 이번 프레임 휠 (+ 아래, − 위)
    locked: false,            // 포인터 락 상태
    lockLostAt: 0,            // 마지막으로 락이 풀린 시각 (ms)
    onLockChange: null,       // (locked) => {} 게임 화면이 설정
    onKeyDown: null,          // (e) => {} 게임 화면·메뉴가 설정
};
// initialize 에서 stage·canvas 를 만든 뒤 한 번만 호출
function setupInput() {
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Tab') e.preventDefault();
        if (app.screenName === 'game' && e.code.startsWith('Arrow')) e.preventDefault();
        if (!e.repeat) input.pressed.add(e.code);
        input.keys.add(e.code);
        if (input.onKeyDown) input.onKeyDown(e);
    });
    window.addEventListener('keyup', (e) => { input.keys.delete(e.code); });
    window.addEventListener('blur', () => { input.keys.clear(); input.mouseLeft = false; });
    app.stage.addEventListener('contextmenu', (e) => e.preventDefault());   // 오른쪽 버튼은 게임 중 아무 일도 하지 않는다 (2026-10-25 AGENTS.md "조작", U58)
    app.stage.addEventListener('mousedown', (e) => {
        // 왼쪽 버튼 (행동 슬롯) 은 락 중에 누른 것만. 메뉴·상점 버튼이나 "클릭하여 계속" 클릭이 락이 걸린 직후 프레임에 공격·사용으로 처리되지 않게 (8절 38번)
        if (e.button === 0 && input.locked) { input.mouseLeft = true; input.leftClicked = true; }
    });
    window.addEventListener('mouseup', (e) => { if (e.button === 0) input.mouseLeft = false; });
    document.addEventListener('mousemove', (e) => {
        if (!input.locked) return;
        input.dx += e.movementX;
        input.dy += e.movementY;
    });
    app.stage.addEventListener('wheel', (e) => {
        if (app.screenName === 'game') input.wheel += Math.sign(e.deltaY);
    }, { passive: true });
    document.addEventListener('pointerlockchange', () => {
        const locked = document.pointerLockElement === app.canvas;
        if (!locked && input.locked) input.lockLostAt = performance.now();
        input.locked = locked;
        if (!locked) input.mouseLeft = false;
        if (input.onLockChange) input.onLockChange(locked);
    });
}
// 반드시 클릭 이벤트 핸들러 안에서 호출한다 (키 입력·타이머에서 호출하면 브라우저가 거부)
function requestLock() {
    try {
        const p = app.canvas.requestPointerLock();
        if (p && typeof p.catch === 'function') p.catch(() => { /* 락 해제 직후 재요청 등: 무시, 오버레이 유지 */ });
    } catch { /* 무시 */ }
}
function releaseLock() {
    if (document.pointerLockElement) document.exitPointerLock();
}
// 매 프레임 끝 (렌더링 뒤) 에 호출
function endInputFrame() {
    input.pressed.clear();
    input.leftClicked = false;
    input.dx = 0;
    input.dy = 0;
    input.wheel = 0;
}

// ===== [13] 플레이어 =====
const PLAYER_RADIUS = 0.4;          // 주인공 충돌 반지름 (m)
const EYE_HEIGHT = 1.7;             // 발에서 눈 (카메라) 까지 (m)
const GRAVITY = 20;                 // m/s²
const JUMP_SPEED = 6.93;            // 점프 높이 약 1.2m
const MOUSE_SENSITIVITY = 0.0022;   // 라디안 / 픽셀
const PITCH_LIMIT = 1.48;           // 위아래 시선 한계 (라디안)
const STEP_DOWN_SNAP = 0.5;         // 땅에 있을 때 이만큼 낮아지는 바닥에는 바로 붙는다 (계단 내려가기)
// AGENTS.md "스태미너": 달리기 초당 15, 점프 1회 10, 마지막 소모 1초 후부터 회복, 0 이면 탈진 → 30 이상 회복되면 해제
const STAMINA_RUN_PER_SEC = 15;
const STAMINA_JUMP = 10;
const STAMINA_REGEN_DELAY = 1;
const EXHAUST_RECOVER_AT = 30;
const SANCTUARY_REGEN_PCT = 5;      // 성소: HP·MP 초당 최대치의 5% (AGENTS.md "파생 수치 공식")

// --- 원-상자 충돌 (PROGRESS.md 부록 F). 모든 벽 상자는 충분히 높으므로 XZ 평면에서 처리한다
// 원 (중심 pos, 반지름 radius) 이 상자와 겹치면 밖으로 밀어낸다. pos: { x, z } (Vector3 도 가능)
function resolveCircleVsBoxes(pos, radius, boxes) {
    for (let iter = 0; iter < 2; iter++) {
        for (const b of boxes) {
            const cx = clamp(pos.x, b.minX, b.maxX);
            const cz = clamp(pos.z, b.minZ, b.maxZ);
            const dx = pos.x - cx, dz = pos.z - cz;
            const d2 = dx * dx + dz * dz;
            if (d2 >= radius * radius) continue;
            if (d2 > 1e-10) {
                const d = Math.sqrt(d2);
                pos.x += (dx / d) * (radius - d);
                pos.z += (dz / d) * (radius - d);
            } else {
                // 중심이 상자 안에 있으면 가장 가까운 면 밖으로
                const l = pos.x - b.minX, r = b.maxX - pos.x, t = pos.z - b.minZ, bt = b.maxZ - pos.z;
                const m = Math.min(l, r, t, bt);
                if (m === l) pos.x = b.minX - radius;
                else if (m === r) pos.x = b.maxX + radius;
                else if (m === t) pos.z = b.minZ - radius;
                else pos.z = b.maxZ + radius;
            }
        }
    }
}
// (x, z) 가 속한 칸과 주변 8칸의 충돌 상자
function nearbyBoxes(collision, x, z) {
    const gx = Math.floor(x / CELL_SIZE), gz = Math.floor(z / CELL_SIZE);
    const out = [];
    for (let dz = -1; dz <= 1; dz++) {
        for (let dx = -1; dx <= 1; dx++) {
            const list = collision.get(cellKey(gx + dx, gz + dz));
            if (list) for (const b of list) out.push(b);
        }
    }
    return out;
}
// (mx, mz) 만큼 이동하면서 충돌 처리. 한 번에 0.3m 씩 나눠서 벽 뚫림을 막는다
function moveWithCollision(collision, pos, radius, mx, mz) {
    const dist = Math.hypot(mx, mz);
    const steps = Math.max(1, Math.ceil(dist / 0.3));
    for (let i = 0; i < steps; i++) {
        pos.x += mx / steps;
        pos.z += mz / steps;
        resolveCircleVsBoxes(pos, radius, nearbyBoxes(collision, pos.x, pos.z));
    }
}

// --- 게임 런타임 객체 (PROGRESS.md 5-1). 저장하지 않는 값은 모두 여기에 둔다 (6.1)
// arrival: 'newGame' | 'descend' | 'ascend' | 'portal' | 'load' (load 는 state.world.position 에서 시작)
// opts: { debug (디버그 해시 게임, 저장 안 함), noMonsters (몬스터를 만들지 않음, 층을 옮겨도) }
function createGameRuntime(state, arrival, opts = {}) {
    const debug = !!opts.debug;
    ensureNextFloor(state, Math.random);   // 새 게임 (지하 2층)·이전 형식 저장 데이터·디버그 게임의 다음 층을 미리 정한다 (7-7)
    const dungeon = generateDungeon(state.dungeonSeed, state.floor, state.hero);
    const view = buildDungeonView(dungeon, state.theme);
    const start = playerStartPosition(dungeon, state, arrival, view.collision);
    view.setGlowsticks(state.world.glowsticks || []);   // 에릭의 활성 야광봉 (22-3)
    view.setElevatorLocked(isElevatorLockedFor(state)); // 에릭의 아래층 엘리베이터 잠금 (22-4)
    const g = {
        state, dungeon, view, debug,
        player: {
            pos: new THREE.Vector3(start.x, floorHeightAt(dungeon, start.x, start.z), start.z),   // 발 위치
            vel: new THREE.Vector3(), yaw: start.yaw, pitch: 0, onGround: true,
            exhausted: false, lastStaminaUseAt: -Infinity, running: false,
            isPlayer: true, effects: [], statusImmune: false, moving: false,   // 상태이상 (9단계, 몬스터와 같은 구조)
            knock: null, pull: null,                                         // 넉백·중력 당김 (10단계, applyForcedMovement)
            dash: null, invulnUntil: -Infinity,                              // 돌진 (A4)·무적이 끝나는 시각 (불굴 D6·순간이동 S6, 14단계)
        },
        derived: null, cooldowns: {}, monsters: [], corpses: [], projectiles: [], drops: [], zones: [], buffs: [], effects: [],
        paused: false, menuOpen: null, time: 0,
        visited: new Set(state.world.visited),   // 저장·층 이동 때 state.world.visited 배열로 바꾼다 (5-9)
        currentCell: null, inSanctuary: false, inElevator: false,
        changingFloor: false, dead: false,       // 층 이동 중 (7단계)·사망 (8단계) 에는 시스템 메뉴를 열지 않는다 (6-1)
        transition: null,                        // 층 이동 연출 { kind, phase: 'out' | 'in', t } (7-3)
        wasInTrigger: false,                     // 이전 프레임에 층 이동 트리거 안에 있었는가 (7-1 재발동 방지)
        noMonsters: !!opts.noMonsters,
        flow: null,                              // 주인공 칸에서의 칸 거리 (몬스터 길찾기, 8-4)
        hurtAt: -Infinity,                       // 마지막으로 피해를 입은 게임 시각 (화면 가장자리 붉게, 8-13)
        uiEvents: [],                            // 화면에 알릴 일 (레벨 업 등). SCREENS.game 이 꺼내 토스트로 보여준다
        viewModel: null,                         // 화면 오른쪽 아래 무기 (8-8)
        swingT: 0,                               // 무기 휘두르기 남은 시간
        bossFight: null,                         // 전투 중인 보스 (화면 위쪽 HP 막대, 10-4)
        recall: null,                            // 귀환 주문서 시전 { t, dur } (12-7, HUD 진행 막대)
        warp: null,                              // 빛 바랜 주문서 순간이동 { t, moved } (22-5)
        interactTarget: null,                    // 조준 중인 상호작용 대상 (view.interactables 의 항목, HUD "F | …", 16-4·21-1)
        interactLabel: null,                     // 그 대상의 안내 문구 키 (상태에 따라: 숨기/나오기, 열기/가져가기/비어 있음, 17-4)
        hiding: null,                            // 숨은 캐비닛 (17-5, enterCabinet)
        flash: newFlashState(),                  // 에릭의 플래시 켜짐 (18-2, 저장하지 않음)
        skillTimeline: [],                       // 예약한 스킬 동작 [{ t (남은 초), fn }] (유성 낙하·연속 베기, 14단계)
        slotDenied: null,                        // 자원이 모자라 못 쓴 행동 슬롯 { slot, at } (HUD 붉게, 14-0)
        lastElement: null,                       // 마지막으로 쓴 화염·냉기·전격 스킬의 속성 (원소 부여 X1)
    };
    g.derived = calcDerivedStats(state, g);
    updateCellState(g);
    revealFacilities(g);   // 탐험가의 감각 Lv3·Lv5 (14-5)
    g.wasInTrigger = !!floorTriggerAt(dungeon, view.triggers, g.player.pos.x, g.player.pos.z);   // 트리거 안에서 시작해도 바로 발동하지 않게
    // 현재 층 몬스터·시체·바닥 아이템 (7-9, U19, 8-14): 불러오기면 저장한 스냅샷을 복원, 아니면 새로 생성 (8-2).
    // 이후 현재 층의 상태는 런타임 객체가 가지므로 state 쪽은 비운다 (저장할 때 serializeState 가 다시 채움)
    if (arrival === 'load' && state.world.runtime) restoreFloorRuntime(g, state.world.runtime);
    else if (!g.noMonsters) spawnFloorMonsters(g);
    state.world.runtime = null;
    return g;
}
// 저장된 위치가 던전 안 (벽·시설과 겹치지 않음) 이면 그곳, 아니면 도착 방식별 시작 위치 (불러오기인데 위치가 없으면 성소).
// 생성 규칙이 바뀌어 (2026-10-25 상점 1×1) 이전 저장 데이터의 지형이 달라졌을 때 벽 안에서 시작하지 않게 한다
function playerStartPosition(d, state, arrival, collision) {
    const p = state.world.position;
    if (p && Number.isFinite(p.x) && Number.isFinite(p.z) && cellAtWorld(d, p.x, p.z)
        && !(collision && nearbyBoxes(collision, p.x, p.z).some((b) => circleHitsBox(p.x, p.z, PLAYER_RADIUS / 2, b)))) {   // 벽에 붙어 저장한 위치는 허용 (반지름 절반만 검사)
        return { x: p.x, z: p.z, yaw: Number.isFinite(p.yaw) ? p.yaw : 0 };
    }
    return getSpawn(d, arrival === 'load' ? 'newGame' : arrival);
}
// 매 프레임 게임 갱신. 일시정지 중 (메뉴 열림, U6)·사망 후에는 아무것도 하지 않는다 (렌더링은 계속)
function updateGame(g, dt) {
    if (g.paused || g.dead) return;
    g.time += dt;
    g.derived = calcDerivedStats(g.state, g);
    clampVitals(g);
    updateActiveSlot(g);
    updatePlayerLook(g);
    updatePlayerMovement(g, dt);
    updateCellState(g);
    updateFloorTriggers(g);
    updateInteraction(g);         // 조준 + F 키 상호작용 (엘리베이터 버튼 판·상인·캐비닛·서랍, 16-4·21-1)
    updateRegen(g, dt);
    updatePlayerStatus(g, dt);    // [14] 상태이상 지속 피해·버프 시간 (성소 안이면 해제, 9단계)
    updatePlayerActions(g, dt);   // [15] 재사용 대기·행동 슬롯 사용 (왼쪽 버튼, 21-2)
    updateRecall(g, dt);          // [16] 귀환 주문서 시전 (12-7)
    updateFadedWarp(g, dt);       // [16] 빛 바랜 주문서 순간이동 (22-5)
    if (g.state.hero === 'eric') updateEricSenses(g, dt);   // [14] 에릭 몬스터의 발소리 듣기·캐비닛 8초 (23단계)
    updateMonsters(g, dt);        // [14]
    updateProjectiles(g, dt);
    updateZones(g, dt);
    updateDrops(g, dt);
    updateEffects(g, dt);
}
// 최대치가 줄면 현재값을 깎는다 (6.7)
function clampVitals(g) {
    const sp = g.state.player, d = g.derived;
    sp.hp = Math.min(sp.hp, d.maxHp);
    sp.mp = Math.min(sp.mp, d.maxMp);
    sp.stamina = Math.min(sp.stamina, d.maxStamina);
}
// 활성 행동 슬롯 (U3): 숫자키 1~7, 휠 (위 = 이전, 아래 = 다음)
function updateActiveSlot(g) {
    const sp = g.state.player;
    for (let i = 0; i < ACTION_SLOT_COUNT; i++) if (input.pressed.has('Digit' + (i + 1))) sp.activeSlot = i;
    if (input.wheel !== 0) sp.activeSlot = (sp.activeSlot + Math.sign(input.wheel) + ACTION_SLOT_COUNT) % ACTION_SLOT_COUNT;
}
// 시점 (5-4). 포인터 락 중에만
function updatePlayerLook(g) {
    if (!input.locked) return;
    const p = g.player;
    p.yaw -= input.dx * MOUSE_SENSITIVITY;
    p.pitch = clamp(p.pitch - input.dy * MOUSE_SENSITIVITY, -PITCH_LIMIT, PITCH_LIMIT);
    if (g.hiding) {   // 캐비닛 안: 정면에서 좌우 ±40°·위아래 ±15° 만 (17-5, U40)
        const h = g.hiding, dy = Math.atan2(Math.sin(p.yaw - h.yaw), Math.cos(p.yaw - h.yaw));
        p.yaw = h.yaw + clamp(dy, -HIDE_YAW_LIMIT, HIDE_YAW_LIMIT);
        p.pitch = clamp(p.pitch, -HIDE_PITCH_LIMIT, HIDE_PITCH_LIMIT);
    }
}
function spendStamina(g, amount) {
    const sp = g.state.player;
    if (g.buffs.some((b) => b.noStaminaCost)) return;   // 상급 활력 물약: 10초간 스태미너 소모 없음 (12-7)
    sp.stamina = Math.max(0, sp.stamina - amount);
    g.player.lastStaminaUseAt = g.time;
    if (sp.stamina <= 0) g.player.exhausted = true;
}
// 경험치 획득 (PROGRESS.md 8-12, AGENTS.md "레벨과 경험치"). 필요 경험치를 넘는 동안 레벨 +1 (초과분 이월, 상한 없음).
// 레벨마다 힘·민첩성·지능 +1 (자동), 스탯·스킬 포인트 +1. 한 번이라도 오르면 HP·MP·스태미너 전부 회복. 반환: 오른 레벨 수
function grantExp(state, amount, game) {
    if (state.hero === 'eric') return 0;   // 에릭은 레벨업을 할 수 없다 (AGENTS.md "에릭 특별 규칙", 18-1)
    const p = state.player;
    p.exp += amount;
    let gained = 0;
    while (p.exp >= expToNext(p.level)) {
        p.exp -= expToNext(p.level);
        p.level++;
        gained++;
        for (const k of ['str', 'dex', 'int']) p.baseStats[k]++;
        p.statPoints++;
        p.skillPoints++;
    }
    if (gained > 0) {
        const d = calcDerivedStats(state, game);
        p.hp = d.maxHp;
        p.mp = d.maxMp;
        p.stamina = d.maxStamina;
        if (game) game.player.exhausted = false;
    }
    return gained;
}
// 스탯 포인트 1 을 써서 힘·민첩성·지능 중 하나를 1 올린다 (AGENTS.md "스테이터스", 11-2). 순수 함수. 반환: 올렸는가
const STAT_IDS = ['str', 'dex', 'int'];
function spendStatPoint(state, id) {
    const p = state.player;
    if (!STAT_IDS.includes(id) || !(p.statPoints > 0)) return false;
    p.baseStats[id] += 1;
    p.statPoints -= 1;
    return true;
}
// 스킬 활성화·레벨 업 판정 (AGENTS.md "스킬 > 기본 규칙", 13-6). 순수 함수. 반환: { ok, mode: 'learn' | 'levelUp', reason (번역 키) }
// 미활성: 연결된 스킬 (SKILL_NEIGHBORS, 교차 스킬은 둘 중 하나) 이 활성 + 스킬 포인트 ≥ 1 → 활성화 (Lv1)
// 활성: Lv < 최대 Lv + 스킬 포인트 ≥ 1 → 레벨 업. 이유는 최대 레벨 → 연결 → 포인트 순으로 본다
function canLearnSkill(state, id) {
    const p = state.player, def = Object.hasOwn(SKILL_BY_ID, id) ? SKILL_BY_ID[id] : null;
    if (!def) return { ok: false, mode: null, reason: 'skill.unknown' };
    const lv = p.skills[id] || 0, mode = lv > 0 ? 'levelUp' : 'learn';
    if (lv >= def.maxLv) return { ok: false, mode, reason: 'skill.maxLevel' };
    if (lv === 0 && !SKILL_NEIGHBORS[id].some((n) => (p.skills[n] || 0) > 0)) return { ok: false, mode, reason: 'skill.notConnected' };
    if (!(p.skillPoints > 0)) return { ok: false, mode, reason: 'skill.noPoints' };
    return { ok: true, mode, reason: null };
}
// 스킬 포인트 1 을 써서 활성화 (Lv1) 또는 레벨 +1. 반환: canLearnSkill 결과 + level (바뀐 레벨)
function learnSkill(state, id) {
    const r = canLearnSkill(state, id);
    if (!r.ok) return r;
    const p = state.player;
    p.skills[id] = (p.skills[id] || 0) + 1;
    p.skillPoints -= 1;
    return { ...r, level: p.skills[id] };
}
// 이동 (5-5): WASD (yaw 기준 앞·오른쪽), 달리기, 점프, 중력, 계단 높이 (floorHeightAt), 벽 충돌 (5-6)
function updatePlayerMovement(g, dt) {
    const p = g.player, sp = g.state.player, d = g.derived, k = input.keys;
    if (g.hiding) { p.moving = false; p.running = false; return; }   // 캐비닛 안: 움직이지 않는다 (17-5)
    const canAct = input.locked && !isDisabled(p);   // 빙결·기절: 이동·점프 불가 (시점은 돌릴 수 있다, 9-4)
    let f = 0, r = 0;
    if (canAct && !p.dash) {
        if (k.has('KeyW')) f += 1;
        if (k.has('KeyS')) f -= 1;
        if (k.has('KeyD')) r += 1;
        if (k.has('KeyA')) r -= 1;
    }
    const sin = Math.sin(p.yaw), cos = Math.cos(p.yaw);
    let mx = -sin * f + cos * r, mz = -cos * f - sin * r;   // 앞 (−sin, −cos) · 오른쪽 (cos, −sin) (4.4)
    const len = Math.hypot(mx, mz);
    if (len > 0) { mx /= len; mz /= len; }
    p.moving = len > 0;   // 출혈은 이동 중이면 1.5배 (9-3)
    p.running = len > 0 && (k.has('ShiftLeft') || k.has('ShiftRight')) && !p.exhausted && sp.stamina > 0;
    if (p.running) spendStamina(g, STAMINA_RUN_PER_SEC * dt);
    const speed = p.running ? d.runSpeed : d.walkSpeed;   // 둔화는 calcDerivedStats 가 이미 곱했다
    if (canAct && input.pressed.has('Space') && p.onGround && !p.exhausted && sp.stamina >= STAMINA_JUMP) {
        spendStamina(g, STAMINA_JUMP);
        p.vel.y = JUMP_SPEED;
        p.onGround = false;
    }
    if (len > 0) moveWithCollision(g.view.collision, p.pos, PLAYER_RADIUS, mx * speed * dt, mz * speed * dt);
    applyForcedMovement(g, dt);
    const ground = floorHeightAt(g.dungeon, p.pos.x, p.pos.z);
    if (p.onGround) {
        if (ground >= p.pos.y - STEP_DOWN_SNAP) p.pos.y = ground;   // 계단을 오르내릴 때 바닥에 붙는다
        else p.onGround = false;
    }
    if (!p.onGround) {
        p.vel.y -= GRAVITY * dt;
        p.pos.y += p.vel.y * dt;
        if (p.pos.y <= ground + 0.001) {
            p.pos.y = ground;
            p.vel.y = 0;
            p.onGround = true;
        }
    }
}
// 입력과 상관없이 밀려나는 이동 (10단계, 벽 충돌 적용): 넉백 (knockPlayer) 과 차원 포식자의 중력 당김
//   p.dash (돌진, updateDash), p.knock = { vx, vz, t }, p.pull = { x, z, speed (m/s), t (남은 초), owner (보스, 있으면 그 위치로) }. 당기는 쪽에 거의 닿으면 더 당기지 않는다
function applyForcedMovement(g, dt) {
    const p = g.player;
    if (p.dash) updateDash(g, dt);   // 돌진 (A4, 14-3)
    if (p.knock) {
        const k = Math.min(dt, p.knock.t);
        moveWithCollision(g.view.collision, p.pos, PLAYER_RADIUS, p.knock.vx * k, p.knock.vz * k);
        p.knock.t -= dt;
        if (p.knock.t <= 0) p.knock = null;
    }
    if (p.pull) {
        const pl = p.pull, src = pl.owner ? pl.owner.pos : pl;   // 보스가 움직이면 그쪽으로
        const dx = src.x - p.pos.x, dz = src.z - p.pos.z, d = Math.hypot(dx, dz), stop = pl.owner ? pl.owner.radius + 1 : 1;
        if (d > stop) {
            const s = Math.min(d - stop, pl.speed * dt);
            moveWithCollision(g.view.collision, p.pos, PLAYER_RADIUS, (dx / d) * s, (dz / d) * s);
        }
        pl.t -= dt;
        if (pl.t <= 0 || (pl.owner && pl.owner.dead) || g.inSanctuary) p.pull = null;
    }
}
// 현재 칸: 방문 기록 (5-9) + 탐험가의 감각 (S5) 주변 공개, 성소 구역 여부 (5-10), 엘리베이터 내부 여부 (16-5)
function updateCellState(g) {
    const cell = cellAtWorld(g.dungeon, g.player.pos.x, g.player.pos.z);
    if (cell && cell !== g.currentCell) {
        g.visited.add(cellKey(cell.gx, cell.gz));
        if (g.derived && g.derived.mods.revealRadius > 0) revealCellsAround(g, cell, g.derived.mods.revealRadius);   // 탐험가의 감각 (S5)
    }
    g.currentCell = cell;
    g.inSanctuary = !!(cell && cell.sanctuaryZone);
    g.inElevator = isElevatorInterior(cell);
}
// 엘리베이터 내부 = 엘리베이터 조각의 앞 통로를 뺀 2칸 (U37). 저장 가능 영역, 에릭의 몬스터가 들어오지 못하는 곳
function isElevatorInterior(cell) { return !!cell && cell.role === 'stairsStep2'; }   // 엘리베이터 1칸 (16-9, U37)
// 탐험가의 감각 (S5, 14-5): 지금 칸에서 맨해튼 거리 radius 칸 안을 방문한 칸처럼 지도에 밝힌다 (탐색 주문서와 같은 거리 기준, U49)
function revealCellsAround(g, cell, radius) {
    for (const [key, c] of g.dungeon.cells) if (Math.abs(c.gx - cell.gx) + Math.abs(c.gz - cell.gz) <= radius) g.visited.add(key);
}
// 층에 들어올 때 탐험가의 감각 Lv3 이상이면 포탈·방랑 상인, Lv5 면 엘리베이터도 지도 아이콘 칸을 밝힌다 (AGENTS.md "S5")
function revealFacilities(g) {
    const lv = g.state.player.skills.S5 || 0;
    if (lv <= 0) return;
    const v = SKILL_BY_ID.S5.values(lv), d = g.dungeon;
    for (const piece of d.pieces) {
        const show = (v.showFacilities && (piece.type === 'portal' || piece.type === 'merchant')) || (v.showStairs && (piece.type === 'stairsUp' || piece.type === 'stairsDown'));
        const ic = show ? mapIconOf(d, piece) : null;
        if (ic) g.visited.add(ic.key);
    }
}
// 저장 가능 영역 (AGENTS.md "시스템", U47): 성소 구역 또는 엘리베이터 내부. 성소의 회복·몬스터 차단 (g.inSanctuary) 과는 따로 쓴다
function canSaveHere(g) { return g.inSanctuary || g.inElevator; }
// 자연 회복 (HP·MP·스태미너) + 성소 회복 (5-10, 상태이상 해제는 9단계)
function updateRegen(g, dt) {
    const p = g.player, sp = g.state.player, d = g.derived;
    if (g.time - p.lastStaminaUseAt >= STAMINA_REGEN_DELAY) sp.stamina = Math.min(d.maxStamina, sp.stamina + d.staminaRegen * dt);
    if (p.exhausted && sp.stamina >= EXHAUST_RECOVER_AT) p.exhausted = false;
    if (sp.hp <= 0) return;   // 사망 처리는 8단계
    const bonus = g.inSanctuary ? SANCTUARY_REGEN_PCT / 100 : 0;
    let hpBonus = bonus;
    for (const b of g.buffs) if (b.healPctPerSec) hpBonus += b.healPctPerSec / 100;   // 재생의 기운 (S3): 초당 최대 HP 의 N%
    sp.hp = Math.min(d.maxHp, sp.hp + (d.hpRegen + d.maxHp * hpBonus) * dt);
    sp.mp = Math.min(d.maxMp, sp.mp + (d.mpRegen + d.maxMp * bonus) * dt);
}
// --- 층 이동 (PROGRESS.md 7단계)
const FLOOR_FADE_TIME = 0.4;   // 층 이동 때 화면이 어두워지는 / 밝아지는 시간 (초)
// 트리거 판정 (7-1): 트리거 밖에 있다가 안으로 들어오는 순간에만 발동한다
function updateFloorTriggers(g) {
    const p = g.player.pos;
    const tr = floorTriggerAt(g.dungeon, g.view.triggers, p.x, p.z);
    const entered = !!tr && !g.wasInTrigger;
    g.wasInTrigger = !!tr;
    if (!entered) return;
    const kind = TRIGGER_FLOOR_CHANGE[tr.kind];
    if (kind === 'ascend' && g.state.floor <= 1) return;   // 지하 1층에는 위 계단이 없다 (안전장치)
    changeFloor(g, kind);
}
// --- 조준 + F 키 상호작용 (16-4, 21-1, AGENTS.md "대상에 정면 시야를 둔 채 F키로 상호작용"). 마틴·에릭 공통.
// 눈에서 대상까지 2.6m 안이고 조준 방향 (위아래 포함) 과 30° 안인 것 중 가장 조준에 가까운 것. 엘리베이터 버튼 판 (15·17단계에서 상인·캐비닛·서랍을 더한다)
const INTERACT_RANGE = 2.6, INTERACT_ANGLE_DEG = 30;
function findInteractable(g) {
    const p = g.player, cp = Math.cos(p.pitch);
    const fx = -Math.sin(p.yaw) * cp, fy = Math.sin(p.pitch), fz = -Math.cos(p.yaw) * cp;
    const ex = p.pos.x, ey = p.pos.y + EYE_HEIGHT, ez = p.pos.z, minCos = Math.cos(INTERACT_ANGLE_DEG * Math.PI / 180);
    let best = null, bestCos = minCos;
    for (const it of g.view.interactables || []) {
        const vx = it.x - ex, vy = it.y - ey, vz = it.z - ez, dist = Math.hypot(vx, vy, vz);
        if (dist > (it.range || INTERACT_RANGE) || dist < 1e-6) continue;
        if (it.insidePiece && (!g.currentCell || g.currentCell.pieceId !== it.pieceId)) continue;   // 상인: 상인 방 안에서만 (15-2)
        if (it.kind === 'merchant' && g.state.hero === 'eric') continue;                          // 방랑 상인은 마틴만 (AGENTS.md)
        if (it.kind === 'cardReader' && g.state.world.elevatorUnlocked) continue;                 // 활성화된 엘리베이터의 리더기는 더 쓸 일이 없다 (22-4)
        const c = (vx * fx + vy * fy + vz * fz) / dist;
        if (c >= bestCos) { best = it; bestCos = c; }
    }
    return best;
}
// 캐비닛 안에서는 조준과 상관없이 그 캐비닛 (F = 나오기, 17-5). 안내 문구는 대상의 상태에 따라 (interactLabelKey).
// F 는 누른 순간만 (input.pressed 는 반복 입력을 넣지 않는다), 포인터 락 중에만 (8절 23번)
const INTERACT_KEY = 'KeyF';
function updateInteraction(g) {
    const it = input.locked && !isDisabled(g.player) && !g.transition
        ? (g.hiding ? g.view.interactables.find((t) => t.kind === 'cabinet' && t.id === g.hiding.id) || null : findInteractable(g)) : null;
    g.interactTarget = it;
    g.interactLabel = it ? interactLabelKey(g, it) : null;
    if (it && input.pressed.has(INTERACT_KEY)) useInteractable(g, it);
}
function interactLabelKey(g, it) {
    if (it.kind === 'cabinet') return g.hiding ? 'interact.unhide' : 'interact.hide';
    if (it.kind === 'drawer') return !g.view.isDrawerOpen(it.id, it.slot) ? 'interact.open' : (drawerItem(g, it.id, it.slot) ? 'interact.take' : 'interact.empty');
    return it.labelKey;
}
function useInteractable(g, it) {
    if (it.kind === 'merchant') { g.uiEvents.push({ type: 'openShop' }); return; }   // 상점 화면 (SCREENS.game.openShop, 15-3)
    if (it.kind === 'cabinet') { if (g.hiding) exitCabinet(g); else enterCabinet(g, it.id); return; }   // 17-5
    if (it.kind === 'drawer') { useDrawer(g, it.id, it.slot); return; }                                 // 17-6
    if (it.kind === 'cardReader') { useCardReader(g); return; }                                         // 22-4
    if (it.kind === 'elevator') {   // 버튼 판 → 문이 닫히며 층 이동 (U37). 지하 1층에는 위층 엘리베이터가 없다 (안전장치)
        if (it.change === 'ascend' && g.state.floor <= 1) return;
        if (it.change === 'descend' && isElevatorLockedFor(g.state)) return;   // (안전장치) 잠긴 문 안으로는 들어갈 수 없다 (22-4)
        g.view.closeElevator(it.pieceId);
        changeFloor(g, it.change);
    }
}
// --- 캐비닛에 숨기 (17-5, AGENTS.md "던전 특징 (에릭)", U40). 런타임 g.hiding = { id, yaw (캐비닛 앞쪽), eyeX, eyeZ (눈 = 틈 바로 뒤), exitX, exitZ }.
// 숨은 동안: 이동·점프·행동 슬롯 불가, 시점은 정면 ±40°·위아래 ±15°, 피해 없음 (playerTargetable), 화면은 검은 막 + 가는 틈 (HUD .ug-hide-mask),
// 그 캐비닛 메시는 감춘다 (안에서 문 안쪽 면이 틈을 가리지 않게). 발 위치는 캐비닛 가운데 (충돌 상자 안 — 이동 처리를 하지 않는다), 나오면 캐비닛 앞에 선다
const HIDE_YAW_LIMIT = 40 * Math.PI / 180, HIDE_PITCH_LIMIT = 15 * Math.PI / 180, HIDE_EXIT_DIST = 1.1;
function enterCabinet(g, id) {
    const cab = g.view.furniture && g.view.furniture.cabinets.find((c) => c.id === id);
    if (!cab || g.hiding) return;
    const fx = -Math.sin(cab.yaw), fz = -Math.cos(cab.yaw), eye = ERIC_FURNITURE.cabinet.d / 2 - 0.12;
    g.hiding = { id, yaw: cab.yaw, eyeX: cab.x + fx * eye, eyeZ: cab.z + fz * eye, exitX: cab.x + fx * HIDE_EXIT_DIST, exitZ: cab.z + fz * HIDE_EXIT_DIST };
    placePlayer(g, cab.x, cab.z, cab.yaw);
    g.view.setCabinetHidden(id, true);
    g.flash.on = false;   // 들어가면 플래시는 자동으로 꺼진다 (AGENTS.md)
    g.flash.dieT = null;
}
function exitCabinet(g) {
    const h = g.hiding;
    if (!h) return;
    g.hiding = null;
    g.view.setCabinetHidden(h.id, false);
    const { yaw, pitch } = g.player;
    placePlayer(g, h.exitX, h.exitZ, yaw);
    g.player.pitch = pitch;
}
// --- 서랍형 장롱 (17-6, U40): 칸마다 첫 클릭 = 열기, 열린 칸 클릭 = 안의 아이템 가져가기 (없으면 "비어 있음").
// 가져간 칸은 world.drawersTaken ("가구 id:칸") 에 기록 → 층 기록에 보관되어 (현재 층과 위·아래 1층까지만, U61) 다시 와도 빈 칸. 열림 상태는 저장하지 않는다
function drawerItem(g, id, slot) {
    const dr = g.view.furniture && g.view.furniture.drawers.find((x) => x.id === id);
    if (!dr || !dr.items[slot] || g.state.world.drawersTaken.includes(`${id}:${slot}`)) return null;
    return dr.items[slot];
}
function useDrawer(g, id, slot) {
    if (!g.view.isDrawerOpen(id, slot)) { g.view.openDrawer(id, slot); return; }
    const itemId = drawerItem(g, id, slot);
    if (!itemId) { g.uiEvents.push({ type: 'toast', key: 'interact.empty' }); return; }
    const item = { kind: 'consumable', id: itemId, count: 1 };
    if (!addItem(g.state, item)) {   // 카드키를 이미 가졌으면 그 칸은 그대로 남는다 (U53)
        const one = CONSUMABLES[itemId].unique && countConsumable(g.state.player, itemId) > 0;
        g.uiEvents.push({ type: 'toast', key: one ? 'item.keycardOne' : 'inv.full' });
        return;
    }
    g.state.world.drawersTaken.push(`${id}:${slot}`);
    g.uiEvents.push({ type: 'pickup', item });
}
// --- 카드키·아래층 엘리베이터 잠금 (22-4, AGENTS.md "던전 특징 (에릭)", U55). 에릭 층의 아래층 엘리베이터는 처음에 잠겨 있고,
// 문 오른쪽의 카드 리더기에 F: 카드키가 없으면 아무 일도 일어나지 않고 (안내도 없음), 있으면 1개 소모 → 활성화 (world.elevatorUnlocked, 층 기록에 보관)
function isElevatorLockedFor(state) { return state.hero === 'eric' && !state.world.elevatorUnlocked; }
function useCardReader(g) {
    const w = g.state.world;
    if (!isElevatorLockedFor(g.state) || !consumeConsumable(g.state, 'keycard')) return;
    w.elevatorUnlocked = true;
    g.view.setElevatorLocked(false);
    g.uiEvents.push({ type: 'toast', key: 'interact.unlocked' });
}
// 층 이동 시작 (7-3 의 1): 입력 잠금 (게임 갱신 중지) + 시스템 메뉴 금지 → 0.4초 동안 검게.
// 실제 교체 (2~7) 는 화면이 완전히 검어졌을 때 swapFloor, 밝아지면 토스트 (8) — 진행은 SCREENS.game.updateTransition
function changeFloor(g, kind) {
    if (g.transition) return;
    g.interactTarget = null;
    g.changingFloor = true;
    g.transition = { kind, phase: 'out', t: 0 };
}
// 층 교체 (7-3 의 2~7). 런타임 객체 g 는 그대로 두고 던전·view·위치·방문 칸·층 런타임만 바꾼다 (재사용 대기·버프는 유지)
function swapFloor(g, kind) {
    const state = g.state;
    state.world.visited = Array.from(g.visited);                                        // 2
    const r = applyFloorChange(state, kind, snapshotFloorRuntime(g), Math.random);       // 3 (층·시드·테마·방문·상인·보스·층 기록·다음 층)
    clearFloorRuntime(g);                                                               // 4
    g.recall = null;                                                                    //   귀환 시전은 층이 바뀌면 취소 (소모되지 않음)
    g.warp = null;                                                                      //   (안전장치) 빛 바랜 주문서 순간이동
    g.hiding = null;                                                                    //   (안전장치) 캐비닛 안에서는 층을 옮길 수 없다
    g.skillTimeline = [];                                                               //   예약한 스킬 동작 (유성 낙하 등) 도 취소
    unmountDungeonView(g.view);
    g.dungeon = generateDungeon(state.dungeonSeed, state.floor, state.hero);            // 5
    g.view = buildDungeonView(g.dungeon, state.theme);
    g.view.setGlowsticks(state.world.glowsticks || []);                                //   그 층의 활성 야광봉 (22-3)
    g.view.setElevatorLocked(isElevatorLockedFor(state));                              //   아래층 엘리베이터 잠금 (22-4)
    mountDungeonView(g.view);
    const s = getSpawn(g.dungeon, kind);   // 내려왔으면 위 계단 앞, 올라왔으면 아래 계단 앞, 포탈이면 포탈 옆 칸
    placePlayer(g, s.x, s.z, s.yaw);
    g.visited = new Set(state.world.visited);                                           // 6 (복원된 층이면 이전 방문 기록)
    g.currentCell = null;
    updateCellState(g);
    revealFacilities(g);                                                                //   탐험가의 감각 Lv3·Lv5 (14-5)
    if (r.runtime) restoreFloorRuntime(g, r.runtime);                                   // 7 바로 이전 층으로 돌아옴 (U19)
    else if (!g.noMonsters) spawnFloorMonsters(g);                                      //   그 밖: 몬스터 새로 생성 (8-2)
    g.flow = null;
    g.wasInTrigger = !!floorTriggerAt(g.dungeon, g.view.triggers, g.player.pos.x, g.player.pos.z);
    return r;
}
// 발 위치 (x, 바닥 높이, z) 에 세우고 시선을 정면으로
function placePlayer(g, x, z, yaw) {
    const p = g.player;
    p.pos.set(x, floorHeightAt(g.dungeon, x, z), z);
    p.vel.set(0, 0, 0);
    p.yaw = yaw;
    p.pitch = 0;
    p.onGround = true;
    p.knock = null;
    p.pull = null;
    p.dash = null;
}
// 층 런타임 → 스냅샷 (6.9 Runtime). 층을 떠날 때는 그 층 기록 (= 새 "이전 층") 에, 저장할 때는 world.runtime 에 들어간다 (U19).
// 살아 있는 몬스터만 기록
// 몬스터 필드는 6.8 의 런타임 몬스터 객체, 시체 { typeId, elite, x, z, yaw }, 바닥 아이템 { item, x, z } (8·12단계에서 만든다)
function snapshotFloorRuntime(g) {
    return {
        monsters: g.monsters.filter((m) => m.hp > 0).map((m) => ({
            typeId: m.typeId, level: m.level, elite: m.elite, isMinion: m.isMinion, x: m.pos.x, z: m.pos.z, yaw: m.yaw,
            hp: m.hp, spawnX: m.spawn.x, spawnZ: m.spawn.z, groupId: m.groupId,
            ...(m.small ? { small: true } : {}), ...(m.nest ? { nest: true } : {}),   // small 은 작은 개체만 (10-6), nest 는 공터 둥지만 (U33)
            ...(m.eric ? { eric: true } : {}),                                        // 에릭의 몬스터 (19-1): 위치·HP 만, 배회 목표·추적은 저장하지 않음
        })),
        corpses: g.corpses.map((c) => ({ typeId: c.typeId, elite: c.elite, x: c.x, z: c.z, yaw: c.yaw, ...(c.small ? { small: true } : {}) })),
        drops: g.drops.map((dr) => ({ item: dr.item, x: dr.x, z: dr.z })),
    };
}
// 스냅샷 → 층 런타임 (8-14). 복원한 몬스터는 대기 (idle) 상태로 시작하고, 3D 는 보일 때 만든다 (그래서 Node 에서도 실행된다).
// 형식이 맞지 않는 기록은 건너뛴다 (바닥 아이템은 isValidDropItem, 12-5). 반환: 종류별 복원 개수
function restoreFloorRuntime(g, runtime) {
    const counts = { monsters: 0, corpses: 0, drops: 0 };
    const list = (key) => (Array.isArray(runtime[key]) ? runtime[key] : []).filter((r) => isPlainObject(r) && isFiniteNum(r.x) && isFiniteNum(r.z));
    for (const rec of list('monsters')) {
        if (!MONSTER_TYPES[rec.typeId] || !isIntIn(rec.level, 1, Infinity)) continue;
        const m = createMonsterState(rec.typeId, rec.level, rec);   // 정예·소환수·작은 개체 (small) 도 기록대로 (10-6)
        if (rec.eric) setupEricMonster(m);   // 에릭의 몬스터 (19-1): 보스 공터·처치 기록과 상관없다
        else if (m.isBoss) {   // 살아 있는 보스는 HP 그대로 보스 공터에 (처치 기록이 있으면 건너뜀)
            if (g.state && g.state.world.bossDefeated) continue;
            if (g.dungeon) attachBossZone(g, m);
        }
        if (isFiniteNum(rec.hp)) m.hp = clamp(rec.hp, 1, m.maxHp);
        placeMonsterOnFloor(g, m);
        g.monsters.push(m);
        counts.monsters++;
    }
    for (const rec of list('corpses')) {
        if (!MONSTER_TYPES[rec.typeId]) continue;
        g.corpses.push(corpseFromRecord(rec));
        counts.corpses++;
    }
    for (const rec of list('drops')) {
        if (!isValidDropItem(rec.item)) continue;
        g.drops.push(makeDrop(rec.item, rec.x, rec.z));
        counts.drops++;
    }
    return counts;
}
// 바닥 아이템 기록 (6.9 drops 의 item): 골드 { kind: 'gold', amount } 또는 아이템 인스턴스 (6.2)
function isValidDropItem(item) {
    if (!isPlainObject(item)) return false;
    if (item.kind === 'gold') return isFiniteNum(item.amount) && item.amount > 0;
    return isValidItem(item);
}
// 층을 떠날 때·게임을 나갈 때 몬스터·시체·투사체·바닥 아이템·범위 효과·연출을 장면에서 빼고 비운다 (7-3 의 4).
// 종류별 공유 지오메트리·재질은 dispose 하지 않는다 (4.6). 개체 전용 자원 (복제 재질·HP 막대·글자 텍스처) 은 해제한다
function clearFloorRuntime(g) {
    for (const o of g.monsters.concat(g.corpses)) disposeMonsterVisual(o);
    for (const o of g.projectiles.concat(g.drops, g.zones, g.effects)) if (o.dispose) o.dispose();
    g.monsters = []; g.corpses = []; g.projectiles = []; g.drops = []; g.zones = []; g.effects = [];
    g.bossFight = null;
}
// 에릭 층의 어둠·플래시 (18-3, U42): 플래시 켜짐이 바뀌거나 층 (view) 이 바뀌면 적용, 플래시 방향은 매 프레임 카메라를 따른다
function updateEricDarkness(g) {
    if (!g.view.ericDark) return;
    const on = g.flash.on, glow = g.view.glowstickCount() > 0;
    if (g.darkView !== g.view || g.darkOn !== on || g.darkGlow !== glow) {
        g.view.setEricDarkness(on);
        app.camera.far = glow ? Math.max(g.view.cameraFar, GLOWSTICK.viewFar) : g.view.cameraFar;   // 야광봉은 멀리서도 보인다 (22-3)
        app.camera.updateProjectionMatrix();
        g.darkView = g.view;
        g.darkOn = on;
        g.darkGlow = glow;
    }
    g.view.aimFlash(app.camera);
}
// 카메라 = 눈 위치 + 시선 (4.4)
function syncCamera(g) {
    const p = g.player;
    if (g.hiding) app.camera.position.set(g.hiding.eyeX, CABINET_SLIT_Y, g.hiding.eyeZ);   // 캐비닛 안: 틈 바로 뒤 (17-5)
    else app.camera.position.set(p.pos.x, p.pos.y + EYE_HEIGHT, p.pos.z);
    app.camera.rotation.set(p.pitch, p.yaw, 0, 'YXZ');
}

// ===== [14] 몬스터·전투·투사체 =====
// --- 생성 계획 (PROGRESS.md 8-2, AGENTS.md "몬스터 > 생성 규칙"). 몬스터 배치는 Math.random 을 써도 된다 (4.3)
const MONSTER_DENSITY = 0.3;              // 일반 몬스터 수 = 칸 수 × 0.3 (반올림)
const MONSTER_NO_SPAWN_DIST = 3;          // 주인공 도착 칸에서 맨해튼 거리 3칸 이내 금지
const MONSTER_CELL_CAP = 2;               // 한 칸에 최대 2마리
const MONSTER_GROUP_CELL_CAP = 4;         // 무리는 최대 4마리
const MONSTER_MIN_GAP = 1.5;              // 생성 위치끼리 최소 거리 (m)
const ELITE_MUL = { hp: 3, atk: 1.5, def: 1.5, size: 1.3, reward: 3 };   // 정예 (AGENTS.md "생성 규칙", 생성은 10단계·복원은 지금부터)
const MINION_REWARD_MUL = 0.2;            // 소환된 몬스터의 경험치·골드
const BOSS_REWARD_MUL = { exp: 20, gold: 10 };
const SMALL_MUL = { size: 0.6, hp: 0.4 }; // 분열한 마그마 슬라임·새끼 거미 (AGENTS.md "용암 동굴"·"거미 여왕")
const SPLIT_CHILD_REWARD_MUL = 0.3;       // 분열한 마그마 슬라임의 경험치·골드
const ELITE_CHANCE = { base: 5, perFloor: 0.1, max: 15 };   // 정예 확률 % = 5 + 층 × 0.1 (최대 15)
const NEST_COUNT = [3, 5];                // 공터 둥지: 일반 몬스터 3~5마리 + 정예 1마리 (AGENTS.md "생성 규칙")
function randInt(rnd, min, max) { return min + Math.floor(rnd() * (max - min + 1)); }
function pickWeighted(ids, weights, rnd) {
    let r = rnd() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < ids.length; i++) { r -= weights[i]; if (r < 0) return ids[i]; }
    return ids[ids.length - 1];
}
// 몬스터가 들어갈 수 없는 칸: 성소 구역 (AGENTS.md "성소") + 방랑 상인 상점 주변 3칸 (상점 칸 포함, 2026-10-25 AGENTS.md, U51).
// 생성·이동·길찾기·배회·순간이동이 모두 이 함수를 쓴다. 투사체 소멸·상태이상 해제는 성소 구역만 (g.inSanctuary)
function monsterBarred(cell) { return !!(cell.sanctuaryZone || cell.merchantZone || cell.ericBarred); }   // ericBarred = 에릭 층의 엘리베이터 내부 (19-2)
// 몬스터가 생성될 수 있는 칸: 들어갈 수 없는 칸·엘리베이터 조각 3칸·포탈 칸 제외
function canSpawnMonsterIn(cell) {
    return !monsterBarred(cell) && cell.pieceType !== 'merchant' && cell.pieceType !== 'stairsUp'
        && cell.pieceType !== 'stairsDown' && cell.role !== 'portal';
}
// 칸 중심에서 생성 위치를 고르는 범위 (복도형 ±2.5m, 방형 ±6m. 몸이 벽에 닿지 않게 반지름만큼 줄인다)
function monsterSpawnHalf(cell, radius) {
    return cell.shape === 'room' ? Math.min(6, CELL_SIZE / 2 - WALL_T - radius) : Math.min(2.5, CELL_SIZE / 2 - PASS_SIDE - radius);
}
function circleHitsBox(x, z, r, b) {
    const dx = x - clamp(x, b.minX, b.maxX), dz = z - clamp(z, b.minZ, b.maxZ);
    return dx * dx + dz * dz < r * r;
}
function pickMonsterSpot(cell, radius, others, rnd, boxes) {
    const c = cellCenter(cell), half = monsterSpawnHalf(cell, radius);
    for (let t = 0; t < 12; t++) {
        const x = c.x + (rnd() * 2 - 1) * half, z = c.z + (rnd() * 2 - 1) * half;
        const near = others.some((o) => Math.hypot(o.x - x, o.z - z) < Math.max(MONSTER_MIN_GAP, radius + MONSTER_TYPES[o.typeId].radius + 0.1));
        if (near || (boxes && boxes.some((b) => circleHitsBox(x, z, radius, b)))) continue;
        return { x, z };
    }
    return null;
}
// 정예가 될 확률 % (AGENTS.md "정예": 5 + 층 × 0.1, 최대 15)
function eliteChance(floor) { return Math.min(ELITE_CHANCE.max, ELITE_CHANCE.base + floor * ELITE_CHANCE.perFloor); }
// 층의 일반 몬스터 배치 계획 (순수 함수, 자체 테스트 대상). 무리는 같은 칸에 그 마릿수만큼 (총 수에 포함).
// 한 마리씩 eliteChance(층)% 확률로 정예 (10-2).
// collision 을 주면 시설 충돌 상자 (공터 잔해 등) 와 겹치는 위치를 피한다. 반환: [{ typeId, level, x, z, yaw, groupId, cellKey, elite }]
function planFloorMonsters(d, themeId, floor, arrivalKey, rnd, collision) {
    const types = THEMES[themeId].monsters, weights = types.map((id) => MONSTER_TYPES[id].weight);
    const total = Math.round(d.cells.size * MONSTER_DENSITY);
    const [ax, az] = arrivalKey ? arrivalKey.split(',').map(Number) : [NaN, NaN];
    const cells = [...d.cells.values()].filter((c) => canSpawnMonsterIn(c) && !(Math.abs(c.gx - ax) + Math.abs(c.gz - az) <= MONSTER_NO_SPAWN_DIST));
    const count = new Map(), out = [];
    let groupId = 0;
    for (let guard = 0; out.length < total && cells.length > 0 && guard < total * 30; guard++) {
        const def = MONSTER_TYPES[pickWeighted(types, weights, rnd)];
        const want = def.group ? Math.min(total - out.length, randInt(rnd, def.group[0], def.group[1])) : 1;
        const ci = Math.floor(rnd() * cells.length), cell = cells[ci], key = cellKey(cell.gx, cell.gz);
        const n = count.get(key) || 0;
        if (n + want > (def.group ? MONSTER_GROUP_CELL_CAP : MONSTER_CELL_CAP)) continue;
        groupId++;
        let placed = 0;
        for (let i = 0; i < want; i++) {
            const pos = pickMonsterSpot(cell, def.radius, out, rnd, collision ? collision.get(key) : null);
            if (!pos) break;
            out.push({
                typeId: def.id, level: Math.max(1, floor + randInt(rnd, -1, 1)), x: pos.x, z: pos.z, yaw: rnd() * Math.PI * 2 - Math.PI, groupId, cellKey: key,
                elite: rnd() * 100 < eliteChance(floor),
            });
            placed++;
        }
        count.set(key, n + placed);
        if (placed === 0 || n + placed >= MONSTER_GROUP_CELL_CAP) cells.splice(ci, 1);
    }
    return out;
}
// 공터 둥지 (10-3, AGENTS.md "공터의 몬스터 둥지"): 보스 공터가 아닌 공터마다 3×3 구역에 그 테마 일반 몬스터 3~5마리 + 정예 1마리.
// 일반 몬스터 수와 별도. 둥지 하나는 한 무리 (같은 groupId) 라 함께 반응한다. 도착 칸 3칸 이내 금지는 그대로 지킨다.
// others = 이미 배치한 몬스터 (planFloorMonsters 결과, 거리·칸 수 계산에 씀). 반환 형식은 planFloorMonsters 와 같다 (+ nest: true)
function planNestMonsters(d, themeId, floor, arrivalKey, rnd, collision, others = []) {
    const types = THEMES[themeId].monsters, weights = types.map((id) => MONSTER_TYPES[id].weight);
    const [ax, az] = arrivalKey ? arrivalKey.split(',').map(Number) : [NaN, NaN];
    const placedAll = others.slice(), out = [];
    const count = new Map();
    for (const o of others) count.set(o.cellKey, (count.get(o.cellKey) || 0) + 1);
    let groupId = others.reduce((a, o) => Math.max(a, o.groupId || 0), 0);
    for (const piece of d.pieces) {
        if (piece.type !== 'clearing' || piece.id === d.bossPieceId) continue;
        const room = piece.cells.map((k) => d.cells.get(k)).filter((c) => c.shape === 'room' && !(Math.abs(c.gx - ax) + Math.abs(c.gz - az) <= MONSTER_NO_SPAWN_DIST));
        if (room.length === 0) continue;
        const total = randInt(rnd, NEST_COUNT[0], NEST_COUNT[1]) + 1;   // + 정예 1마리 (처음으로 자리를 찾은 한 마리)
        let eliteDone = false;
        groupId++;
        for (let i = 0; i < total; i++) {
            const def = MONSTER_TYPES[pickWeighted(types, weights, rnd)];
            const start = Math.floor(rnd() * room.length);
            for (let j = 0; j < room.length; j++) {
                const cell = room[(start + j) % room.length], key = cellKey(cell.gx, cell.gz);
                if ((count.get(key) || 0) >= MONSTER_GROUP_CELL_CAP) continue;
                const pos = pickMonsterSpot(cell, def.radius, placedAll, rnd, collision ? collision.get(key) : null);
                if (!pos) continue;
                const rec = {
                    typeId: def.id, level: Math.max(1, floor + randInt(rnd, -1, 1)), x: pos.x, z: pos.z, yaw: rnd() * Math.PI * 2 - Math.PI,
                    groupId, cellKey: key, elite: !eliteDone, nest: true,
                };
                eliteDone = true;
                out.push(rec);
                placedAll.push(rec);
                count.set(key, (count.get(key) || 0) + 1);
                break;
            }
        }
    }
    return out;
}
// 보스 배치 (10-4, 순수 함수): 5의 배수 층이고 그 층의 보스를 처치하지 않았으면 보스 공터 중심 칸에 테마 보스 1마리 (레벨 = 층 + 1)
function planBoss(d, themeId, floor, bossDefeated) {
    if (floor % 5 !== 0 || bossDefeated || d.bossPieceId === null || d.bossPieceId === undefined) return null;
    const piece = d.pieces[d.bossPieceId], c = cellCenter(d.cells.get(piece.center));
    return { typeId: THEMES[themeId].boss, level: floor + 1, x: c.x, z: c.z, yaw: Math.PI, cellKey: piece.center };
}
// 런타임 몬스터 (PROGRESS.md 6.8). 3D 메시는 처음 보일 때 만든다 (ensureMonsterMesh) — 그래서 Node 자체 테스트에서도 만들 수 있다
// opts: { x, z, yaw, groupId, elite, isMinion, small, nest, spawnX, spawnZ }
//   small = 작은 개체 (분열한 마그마 슬라임·거미 여왕의 새끼 거미): 크기 ×0.6, HP ×0.4 (SMALL_MUL, AGENTS.md)
//   nest  = 공터 둥지 몬스터 (그 공터 3×3 안에서만 배회, U33)
let monsterUidSeq = 1;
function createMonsterState(typeId, level, opts = {}) {
    const def = MONSTER_TYPES[typeId], base = monsterBaseStats(level), e = opts.elite ? ELITE_MUL : null, sm = opts.small ? SMALL_MUL : null;
    const maxHp = base.hp * def.hpMul * (e ? e.hp : 1) * (sm ? sm.hp : 1);
    const res = {};
    for (const k in def.res) res[k] = clamp(def.res[k], MONSTER_RES_MIN, MONSTER_RES_MAX);
    const size = (e ? e.size : 1) * (sm ? sm.size : 1), x = opts.x || 0, z = opts.z || 0;
    return {
        uid: monsterUidSeq++, typeId, def, level, elite: !!opts.elite, isMinion: !!opts.isMinion, small: !!opts.small, nest: !!opts.nest, isBoss: def.boss,
        maxHp, hp: maxHp, atk: base.atk * def.atkMul * (e ? e.atk : 1), defense: base.def * def.defMul * (e ? e.def : 1), res,
        radius: def.radius * size, height: def.height * size, size,
        pos: new THREE.Vector3(x, 0, z), yaw: opts.yaw || 0,
        spawn: { x: Number.isFinite(opts.spawnX) ? opts.spawnX : x, z: Number.isFinite(opts.spawnZ) ? opts.spawnZ : z },
        groupId: opts.groupId || 0, state: 'idle', dead: false,
        timers: { attack: 0, windup: 0, stagger: 0, knock: 0, flash: 0, wander: 0, path: 0 },
        knockVel: { x: 0, z: 0 }, lastSeenAt: -Infinity, wanderTo: null, path: null, home: null,
        effects: [], mesh: null, hpBar: null, ownedMats: [], custom: {},
    };
}
// 몬스터 보상 배수 (AGENTS.md "공통 규칙"·"생성 규칙": 정예 ×3, 소환수 ×0.2, 보스는 경험치 ×20·골드 ×10 대신,
// 분열한 작은 마그마 슬라임 ×0.3 — 작은 개체 중 소환수가 아닌 것. 새끼 거미는 소환수 ×0.2)
function monsterRewardMuls(m) {
    if (m.isBoss) return { exp: BOSS_REWARD_MUL.exp, gold: BOSS_REWARD_MUL.gold };
    const k = monsterRewardMultiplier(m.def) * (m.elite ? ELITE_MUL.reward : 1)
        * (m.isMinion ? MINION_REWARD_MUL : m.small ? SPLIT_CHILD_REWARD_MUL : 1);
    return { exp: k, gold: k };
}
// 층에 처음 들어갈 때의 몬스터 생성: 일반 몬스터 (8-2, 정예 10-2) + 공터 둥지 (10-3) + 보스 (10-4)
function spawnFloorMonsters(g) {
    if (g.state.hero === 'eric') { spawnEricMonsters(g); return; }   // 에릭: 테마 보스 외형 1~2기만 (19-1)
    const c = g.currentCell, key = c ? cellKey(c.gx, c.gz) : null, st = g.state;
    const normal = planFloorMonsters(g.dungeon, st.theme, st.floor, key, Math.random, g.view.collision);
    const nest = planNestMonsters(g.dungeon, st.theme, st.floor, key, Math.random, g.view.collision, normal);
    for (const rec of normal.concat(nest)) {
        const m = createMonsterState(rec.typeId, rec.level, rec);
        placeMonsterOnFloor(g, m);
        g.monsters.push(m);
    }
    const boss = planBoss(g.dungeon, st.theme, st.floor, st.world.bossDefeated);
    if (boss) {
        const m = createMonsterState(boss.typeId, boss.level, boss);
        attachBossZone(g, m);
        placeMonsterOnFloor(g, m);
        g.monsters.push(m);
    }
}

// --- 외형 (8-3). 같은 종류는 지오메트리·재질을 공유한다 (getMonsterModel 캐시, 게임이 끝날 때까지 유지, 4.6).
// 개체마다 다른 값이 필요한 재질 (그림자의 불투명도) 만 복제해 ownedMats 에 넣고, 몬스터·시체를 지울 때 dispose 한다
const MONSTER_DRAW_DIST = 80;     // 이보다 멀면 그리지 않는다 (메시도 이 안에 처음 들어올 때 만든다)
const MONSTER_FLASH_TIME = 0.1;   // 피격 시 빨갛게 (8-3)
let monsterCommon = null;
// 세 점으로 된 삼각형 하나 (날개). 양면 재질과 함께 쓴다
function triangleGeometry(points) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
    geo.computeVertexNormals();
    return geo;
}
function getMonsterCommon() {
    if (monsterCommon) return monsterCommon;
    const basic = (c) => new THREE.MeshBasicMaterial({ color: c });
    const glass = (c, opacity) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity, depthWrite: false });
    monsterCommon = {
        capsule: new THREE.CapsuleGeometry(0.5, 1, 6, 14),   // 반지름 0.5, 전체 높이 2
        halfSphere: new THREE.SphereGeometry(1, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2),   // 위쪽 반구 (버섯 갓·해파리)
        torus: new THREE.TorusGeometry(1, 0.06, 6, 40),     // 고리 (차원 포식자)
        arc: new THREE.TorusGeometry(1, 0.05, 5, 18, Math.PI),   // 반원 (활)
        wing: triangleGeometry([[0, 0, -0.14], [1, 0, 0.05], [0, 0, 0.2]]),   // XZ 평면의 삼각 날개 (+X 쪽으로 뻗음)
        hit: basic(0xff3a2a),
        corpse: new THREE.MeshLambertMaterial({ color: 0x26221e }),
        eliteOutline: new THREE.MeshBasicMaterial({ color: 0xf3c84a, side: THREE.BackSide }),   // 정예 금색 테두리 (10-2)
        coin: new THREE.CylinderGeometry(0.17, 0.17, 0.05, 16),
        shot: new THREE.SphereGeometry(1, 10, 8),
        shotMats: {
            physical: basic(0xe8e0c8), arcane: basic(0xa890ff), fire: basic(0xff8a3a),
            cold: basic(0xa8e8ff), lightning: basic(0xfff27a), poison: basic(0x8ae05a),
            web: basic(0xf2f0e6), void: basic(0x6a2ad0), paper: new THREE.MeshLambertMaterial({ color: 0xf4f2ea }),
        },
        cloud: new THREE.MeshBasicMaterial({ color: 0x7ac85a, transparent: true, opacity: 0.3, depthWrite: false }),
        sporeCloud: glass(0xa070c8, 0.3),
        webZone: glass(0xeeeeee, 0.22),
        lavaZone: new THREE.MeshBasicMaterial({ color: 0xff5a14, transparent: true, opacity: 0.55, depthWrite: false }),
        flame: new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }),
        aimLine: new THREE.LineBasicMaterial({ color: 0xff3a9a, transparent: true, opacity: 0.85 }),
        aimLineGeo: new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]),   // 길이 1 (−Z)
    };
    return monsterCommon;
}
// 부품 메시 하나 (원래 재질을 userData.baseMat 에 기록 → 피격 색·시체 재질 교체 후 되돌릴 때 사용)
function partMesh(parent, geo, mat, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    mesh.rotation.set(rx, ry, rz);
    mesh.userData.baseMat = mat;
    parent.add(mesh);
    return mesh;
}
// 두 점 a → b 를 잇는 원통 (다리·촉수 마디). geo 는 높이 1 의 원통 (G.cyl), r = 반지름
const limbUp = new THREE.Vector3(0, 1, 0), limbDir = new THREE.Vector3();
function limbMesh(parent, geo, mat, a, b, r) {
    limbDir.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const len = limbDir.length();
    const mesh = partMesh(parent, geo, mat, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, r, len, r);
    mesh.quaternion.setFromUnitVectors(limbUp, limbDir.divideScalar(len || 1));
    return mesh;
}
// 걷는 동안 팔다리를 앞뒤로 흔든다. limbs = [{ arm, leg, s (−1 / 1) }]
function swingLimbs(m, limbs, t, amp = 0.6, speed = 9) {
    const swing = m.custom.moving ? Math.sin(t * speed) * amp : 0;
    for (const l of limbs) {
        if (l.arm) l.arm.rotation.x = swing * l.s;
        if (l.leg) l.leg.rotation.x = -swing * l.s;
    }
}
// 젖은 카펫 덩어리의 누런 카펫 무늬
function drawDampCarpet(ctx, s) {
    const rng = createRng(31);
    ctx.fillStyle = '#a99248';
    ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 4) {
        ctx.fillStyle = (y / 4) % 2 ? 'rgba(80, 60, 20, 0.22)' : 'rgba(255, 236, 170, 0.1)';
        ctx.fillRect(0, y, s, 2);
    }
    for (let i = 0; i < 10; i++) {
        const x = rng() * s, y = rng() * s, r = 6 + rng() * 16;
        const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, 'rgba(60, 46, 16, 0.45)');
        gr.addColorStop(1, 'rgba(60, 46, 16, 0)');
        ctx.fillStyle = gr;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
}
// 젖은 카펫 덩어리 몸 (타원체 반지름 0.7, 0.36, 0.6, 중심 y 0.3) 표면의 곰팡이 점 [x, z, 크기]
const MOLD_SPOTS = [[0.2, -0.1, 0.09], [-0.25, 0.15, 0.11], [0.42, -0.25, 0.08], [-0.48, -0.08, 0.1], [0.05, 0.35, 0.07], [0.32, 0.3, 0.08], [-0.12, -0.42, 0.09]];
// 종류별 모양 (AGENTS.md "외형"). make() = 공유 재질, build(A, m, G, C) = 몬스터 1마리의 Group (원점 = 발, 부유형은 몸 중심),
// animate(m, group, t) = 매 프레임 움직임 (t = 그 몬스터의 애니메이션 시간)
const MONSTER_MODELS = {
    br_shade: {
        make: () => ({
            body: new THREE.MeshLambertMaterial({ color: 0x0b0b10, transparent: true, opacity: 0.25, depthWrite: false }),
            eye: new THREE.MeshBasicMaterial({ color: 0xffffff }),
        }),
        build(A, m, G) {
            const g = new THREE.Group(), body = A.body.clone();   // 거리에 따라 개체마다 불투명도가 다르다 (8-6)
            m.ownedMats.push(body);
            m.custom.bodyMat = body;
            partMesh(g, G.cyl, body, 0, 0.7, 0, 0.24, 1.3, 0.2);
            partMesh(g, G.sphere, body, 0, 1.55, 0, 0.2, 0.24, 0.2);
            for (const s of [-1, 1]) {
                partMesh(g, G.cyl, body, s * 0.31, 0.95, 0, 0.055, 0.8, 0.055, 0, 0, s * 0.12);
                partMesh(g, G.sphere, A.eye, s * 0.075, 1.6, -0.17, 0.035, 0.028, 0.02);
            }
            return g;
        },
        animate(m, g, t) { g.position.y += Math.sin(t * 2.4 + m.uid) * 0.05; },
    },
    br_mannequin: {
        make: () => ({ skin: new THREE.MeshLambertMaterial({ color: 0xebe6dc }), joint: new THREE.MeshLambertMaterial({ color: 0xc9c2b4 }) }),
        build(A, m, G, C) {
            const g = new THREE.Group(), limbs = [];
            partMesh(g, C.capsule, A.skin, 0, 1.2, 0, 0.42, 0.33, 0.3);   // 몸통
            partMesh(g, G.sphere, A.joint, 0, 0.86, 0, 0.17, 0.1, 0.13);  // 골반
            partMesh(g, G.cyl, A.joint, 0, 1.58, 0, 0.05, 0.14, 0.05);    // 목
            partMesh(g, G.sphere, A.skin, 0, 1.74, 0, 0.15, 0.18, 0.16);  // 머리 (얼굴 없음)
            for (const s of [-1, 1]) {
                const arm = new THREE.Group(), leg = new THREE.Group();
                arm.position.set(s * 0.27, 1.45, 0);
                leg.position.set(s * 0.1, 0.86, 0);
                g.add(arm, leg);
                partMesh(arm, G.cyl, A.skin, 0, -0.32, 0, 0.045, 0.62, 0.045);
                partMesh(leg, G.cyl, A.skin, 0, -0.43, 0, 0.065, 0.86, 0.065);
                limbs.push({ arm, leg, s });
            }
            m.custom.limbs = limbs;
            return g;
        },
        animate(m, g, t) {
            const swing = m.custom.moving ? Math.sin(t * 9) * 0.6 : 0;
            for (const l of m.custom.limbs) { l.arm.rotation.x = swing * l.s; l.leg.rotation.x = -swing * l.s; }
        },
    },
    br_lamp: {
        make: () => ({
            frame: new THREE.MeshLambertMaterial({ color: 0x8c8f94 }), wire: new THREE.MeshLambertMaterial({ color: 0x2a2a2a }),
            tube: new THREE.MeshBasicMaterial({ color: 0xeef6ff }), dim: new THREE.MeshBasicMaterial({ color: 0x59606a }),
        }),
        build(A, m, G) {
            const g = new THREE.Group(), tubes = [];
            partMesh(g, G.box, A.frame, 0, 0.1, 0, 1.25, 0.06, 0.42);
            for (const s of [-1, 1]) {
                tubes.push(partMesh(g, G.cyl, A.tube, 0, 0, s * 0.1, 0.05, 1.1, 0.05, 0, 0, Math.PI / 2));
                partMesh(g, G.box, A.frame, s * 0.58, 0, 0, 0.06, 0.12, 0.34);
                partMesh(g, G.cyl, A.wire, s * 0.45, 0.42, 0, 0.012, 0.6, 0.012);
            }
            m.custom.tubes = tubes;
            return g;
        },
        animate(m, g, t) {
            g.position.y += Math.sin(t * 1.7 + m.uid) * 0.08;
            g.rotation.z = Math.sin(t * 1.3 + m.uid) * 0.05;
            const flick = Math.sin(t * 23 + m.uid * 3) > 0.93;   // 윙윙대며 깜빡임 (개체마다 재질만 바꿔 낀다)
            for (const tube of m.custom.tubes) tube.userData.baseMat = flick ? m.model.A.dim : m.model.A.tube;
        },
    },
    br_mold: {
        make: () => ({
            carpet: new THREE.MeshLambertMaterial({ map: makeCanvasTexture(128, drawDampCarpet) }),
            mold: new THREE.MeshLambertMaterial({ color: 0x5aa03a, emissive: 0x16300e }),
        }),
        build(A, m, G) {
            const g = new THREE.Group(), body = new THREE.Group();
            g.add(body);
            partMesh(body, G.sphere, A.carpet, 0, 0.3, 0, 0.7, 0.36, 0.6);
            partMesh(body, G.sphere, A.carpet, 0.32, 0.22, 0.22, 0.34, 0.24, 0.3);
            partMesh(body, G.sphere, A.carpet, -0.3, 0.2, -0.2, 0.3, 0.2, 0.32);
            for (const [x, z, s] of MOLD_SPOTS) {
                const y = 0.3 + 0.36 * Math.sqrt(Math.max(0, 1 - (x / 0.7) ** 2 - (z / 0.6) ** 2));
                partMesh(body, G.sphere, A.mold, x, y, z, s, s * 0.6, s);
            }
            m.custom.body = body;
            return g;
        },
        animate(m, g, t) {
            const k = Math.sin(t * 2.2 + m.uid) * 0.06;
            m.custom.body.scale.set(1 - k * 0.5, 1 + k, 1 - k * 0.5);
        },
    },
    // --- 판타지 벽돌벽 (10-1)
    bk_goblin: {
        make: () => ({ skin: lambertMat(0x5f8a3a), cloth: lambertMat(0x5a3f28), eye: basicMat(0xffe060), metal: lambertMat(0xb8bcc4) }),
        build(A, m, G) {
            const g = new THREE.Group();
            m.custom.limbs = buildGoblinBody(g, A, G);
            partMesh(m.custom.limbs[1].arm, G.box, A.metal, 0, -0.36, -0.13, 0.03, 0.02, 0.28);   // 오른손 단검 (앞으로)
            return g;
        },
        animate(m, g, t) { swingLimbs(m, m.custom.limbs, t, 0.7, 12); },
    },
    bk_archer: {
        make: () => ({
            bone: lambertMat(0xe8e2cc), hole: basicMat(0x1a1612), eye: basicMat(0xff5a3a), wood: lambertMat(0x6a4a2a),
            string: basicMat(0xd8d0b8), quiver: lambertMat(0x5a3a22),
        }),
        build(A, m, G, C) {
            const g = new THREE.Group(), limbs = [];
            partMesh(g, G.box, A.bone, 0, 0.9, 0, 0.28, 0.07, 0.13);           // 골반
            partMesh(g, G.cyl, A.bone, 0, 1.15, 0, 0.035, 0.5, 0.035);         // 척추
            for (const [y, w] of [[1.1, 0.26], [1.2, 0.3], [1.3, 0.32]]) partMesh(g, G.box, A.bone, 0, y, 0, w, 0.035, 0.17);   // 갈비뼈
            partMesh(g, G.box, A.bone, 0, 1.42, 0, 0.42, 0.05, 0.08);          // 어깨
            partMesh(g, G.cyl, A.bone, 0, 1.5, 0, 0.03, 0.12, 0.03);           // 목
            partMesh(g, G.sphere, A.bone, 0, 1.64, 0, 0.13, 0.14, 0.14);       // 해골
            partMesh(g, G.box, A.bone, 0, 1.53, -0.04, 0.12, 0.05, 0.1);       // 턱
            for (const s of [-1, 1]) {
                partMesh(g, G.sphere, A.hole, s * 0.05, 1.65, -0.115, 0.035, 0.04, 0.02);   // 눈구멍
                partMesh(g, G.sphere, A.eye, s * 0.05, 1.65, -0.126, 0.012, 0.012, 0.01);
                const leg = new THREE.Group();
                leg.position.set(s * 0.1, 0.88, 0);
                g.add(leg);
                partMesh(leg, G.cyl, A.bone, 0, -0.44, 0, 0.035, 0.86, 0.035);
                limbs.push({ leg, s });
            }
            // 왼팔은 앞으로 뻗어 활 가운데를 쥐고, 오른팔은 시위를 당긴다. 활은 세로로 세운 반원 (앞으로 휨)
            limbMesh(g, G.cyl, A.bone, [-0.2, 1.42, 0], [-0.1, 1.36, -0.58], 0.03);
            limbMesh(g, G.cyl, A.bone, [0.2, 1.42, 0], [-0.04, 1.38, -0.16], 0.03);
            partMesh(g, C.arc, A.wood, -0.1, 1.36, -0.15, 0.45, 0.45, 0.45, 0, Math.PI / 2, -Math.PI / 2);
            partMesh(g, G.cyl, A.string, -0.1, 1.36, -0.15, 0.006, 0.9, 0.006);
            partMesh(g, G.cyl, A.quiver, 0.1, 1.25, 0.14, 0.07, 0.5, 0.07, 0.3, 0, 0.2);   // 등의 화살통
            m.custom.limbs = limbs;
            return g;
        },
        animate(m, g, t) { swingLimbs(m, m.custom.limbs, t, 0.5, 8); },
    },
    bk_orc: {
        make: () => ({
            skin: lambertMat(0x6a7a5a), leather: lambertMat(0x4a3426), metal: lambertMat(0x9a9ca0), wood: lambertMat(0x5a3a1e),
            eye: basicMat(0xffb040), tusk: lambertMat(0xe8e0c8),
        }),
        build(A, m, G) {
            const g = new THREE.Group(), limbs = [];
            partMesh(g, G.sphere, A.skin, 0, 1.35, 0, 0.45, 0.5, 0.32);        // 몸통
            partMesh(g, G.box, A.leather, 0, 1.0, 0, 0.8, 0.22, 0.55);         // 허리 가죽
            partMesh(g, G.sphere, A.skin, 0, 1.92, -0.04, 0.22, 0.22, 0.22);   // 머리
            partMesh(g, G.box, A.skin, 0, 1.83, -0.18, 0.22, 0.1, 0.1);        // 턱
            for (const s of [-1, 1]) {
                partMesh(g, G.cone, A.tusk, s * 0.07, 1.93, -0.24, 0.025, 0.1, 0.025);   // 엄니
                partMesh(g, G.sphere, A.eye, s * 0.08, 1.98, -0.2, 0.03, 0.022, 0.02);
                const arm = new THREE.Group(), leg = new THREE.Group();
                arm.position.set(s * 0.52, 1.68, 0);
                leg.position.set(s * 0.2, 0.92, 0);
                g.add(arm, leg);
                partMesh(arm, G.sphere, A.skin, 0, 0, 0, 0.17, 0.17, 0.17);
                partMesh(arm, G.cyl, A.skin, 0, -0.38, 0, 0.1, 0.72, 0.1);
                partMesh(leg, G.cyl, A.leather, 0, -0.46, 0, 0.13, 0.92, 0.13);
                limbs.push({ arm, leg, s });
            }
            // 오른손 양날 도끼: 손에서 앞으로 뻗은 자루 + 끝의 위아래 양날
            const arm = limbs[1].arm;
            partMesh(arm, G.cyl, A.wood, 0, -0.74, -0.4, 0.035, 0.9, 0.035, -Math.PI / 2);
            partMesh(arm, G.box, A.metal, 0, -0.74, -0.84, 0.08, 0.12, 0.12);
            for (const s of [-1, 1]) partMesh(arm, G.box, A.metal, 0, -0.74 + s * 0.2, -0.86, 0.04, 0.3, 0.26);
            m.custom.limbs = limbs;
            return g;
        },
        animate(m, g, t) {
            swingLimbs(m, m.custom.limbs, t, 0.5, 7);
            const arm = m.custom.limbs[1].arm;
            if (m.timers.windup > 0) arm.rotation.x = -2.5;   // 예비 동작 0.6초: 도끼를 치켜든다 (AGENTS.md)
            else if (m.custom.lunge > 0) arm.rotation.x = 0.8;
        },
    },
    bk_shaman: {
        make: () => ({
            skin: lambertMat(0x6a9440), cloth: lambertMat(0x6a2a4a), eye: basicMat(0xffe060), hat: lambertMat(0x4a2e1a),
            feather: lambertMat(0xd84a3a), feather2: lambertMat(0x3a8ad8), wood: lambertMat(0x5a3a1e), tip: basicMat(0xff8a2a),
        }),
        build(A, m, G) {
            const g = new THREE.Group();
            m.custom.limbs = buildGoblinBody(g, A, G);
            partMesh(g, G.cyl, A.hat, 0, 1.1, 0, 0.2, 0.04, 0.2);              // 모자 챙
            partMesh(g, G.cone, A.hat, 0, 1.24, 0, 0.13, 0.26, 0.13);          // 깃털 모자
            partMesh(g, G.box, A.feather, 0.06, 1.38, 0.06, 0.03, 0.3, 0.015, 0, 0, -0.35);
            partMesh(g, G.box, A.feather2, -0.04, 1.36, 0.08, 0.03, 0.26, 0.015, 0, 0, 0.3);
            const arm = m.custom.limbs[1].arm;
            partMesh(arm, G.cyl, A.wood, 0, -0.22, -0.08, 0.025, 1.25, 0.025);  // 손에 세워 든 지팡이
            partMesh(arm, G.sphere, A.tip, 0, 0.43, -0.08, 0.07, 0.07, 0.07);   // 주황색으로 빛나는 끝
            return g;
        },
        animate(m, g, t) { swingLimbs(m, m.custom.limbs, t, 0.5, 10); },
    },
    // --- 동굴 (10-1)
    cv_bat: {
        make: () => ({ body: lambertMat(0x1c1618), wing: lambertMat(0x2a2024, { side: THREE.DoubleSide, emissive: 0x1a1014 }), eye: basicMat(0xff3a2a) }),
        build(A, m, G, C) {
            const g = new THREE.Group(), wings = [];
            partMesh(g, G.sphere, A.body, 0, 0, 0, 0.15, 0.13, 0.17);
            partMesh(g, G.sphere, A.body, 0, 0.06, -0.15, 0.09, 0.08, 0.08);   // 머리
            for (const s of [-1, 1]) {
                partMesh(g, G.cone, A.body, s * 0.045, 0.15, -0.15, 0.03, 0.08, 0.02);   // 귀
                partMesh(g, G.sphere, A.eye, s * 0.035, 0.08, -0.225, 0.016, 0.016, 0.01);
                const pivot = new THREE.Group();
                pivot.position.set(s * 0.1, 0.02, 0);
                g.add(pivot);
                partMesh(pivot, C.wing, A.wing, 0, 0, 0, s * 0.5, 1, 0.9);   // 펄럭이는 삼각 날개
                wings.push({ pivot, s });
            }
            m.custom.wings = wings;
            return g;
        },
        animate(m, g, t) {
            const f = Math.sin(t * 16 + m.uid) * 0.75;
            for (const w of m.custom.wings) w.pivot.rotation.z = w.s * f;
        },
    },
    cv_spider: {
        make: () => ({
            body: lambertMat(0x5a3a22), abdomen: lambertMat(0x3e2818), mark: lambertMat(0x8a6a3a), leg: lambertMat(0x4a3020),
            eye: basicMat(0xff3a2a), fang: lambertMat(0x1a1210),
        }),
        build(A, m, G) {
            const g = new THREE.Group();
            partMesh(g, G.sphere, A.abdomen, 0, 0.45, 0.3, 0.36, 0.3, 0.44);   // 갈색 타원체 몸
            partMesh(g, G.sphere, A.mark, 0, 0.72, 0.3, 0.12, 0.04, 0.2);
            partMesh(g, G.sphere, A.body, 0, 0.4, -0.22, 0.24, 0.19, 0.26);
            for (const s of [-1, 1]) {
                for (const [ex, ey] of [[0.05, 0.5], [0.11, 0.46]]) partMesh(g, G.sphere, A.eye, s * ex, ey, -0.44, 0.03, 0.03, 0.02);
                partMesh(g, G.cone, A.fang, s * 0.06, 0.28, -0.44, 0.025, 0.12, 0.025, Math.PI);   // 송곳니 (아래로)
            }
            m.custom.legs = buildSpiderLegs(g, A.leg, G, { x0: 0.18, y0: 0.42, zFrom: -0.36, zStep: 0.13, knee: [0.45, 0.25], foot: 0.85, spread: 0.28, r: 0.025 });
            return g;
        },
        animate(m, g, t) { animateSpiderLegs(m, t, 14); },
    },
    cv_golem: {
        make: () => ({ rock: lambertMat(0x77746e), dark: lambertMat(0x5a5853), moss: lambertMat(0x5a6a3a), eye: basicMat(0xffc060) }),
        build(A, m, G) {
            const g = new THREE.Group(), limbs = [];
            partMesh(g, G.box, A.rock, 0, 1.4, 0, 1.1, 1.0, 0.75, 0.05, 0.1, 0);   // 몸통 바위
            partMesh(g, G.sphere, A.dark, 0.25, 1.75, 0.2, 0.42, 0.35, 0.38);       // 울퉁불퉁한 혹
            partMesh(g, G.sphere, A.rock, -0.3, 1.1, -0.25, 0.35, 0.3, 0.3);
            partMesh(g, G.box, A.dark, 0, 2.1, -0.1, 0.48, 0.42, 0.45, 0, 0.2, 0);  // 머리
            partMesh(g, G.sphere, A.moss, -0.2, 1.95, 0.15, 0.25, 0.12, 0.25);
            for (const s of [-1, 1]) {
                partMesh(g, G.sphere, A.eye, s * 0.11, 2.12, -0.34, 0.05, 0.035, 0.02);
                const arm = new THREE.Group(), leg = new THREE.Group();
                arm.position.set(s * 0.75, 1.75, 0);
                leg.position.set(s * 0.3, 0.85, 0);
                g.add(arm, leg);
                partMesh(arm, G.sphere, A.rock, 0, 0.05, 0, 0.36, 0.32, 0.34);
                partMesh(arm, G.box, A.dark, 0, -0.45, 0, 0.32, 0.7, 0.32, 0, 0, s * 0.1);
                partMesh(arm, G.sphere, A.rock, 0, -0.95, 0, 0.3, 0.28, 0.3);         // 주먹
                partMesh(leg, G.box, A.rock, 0, -0.42, 0, 0.38, 0.85, 0.42);
                limbs.push({ arm, leg, s });
            }
            m.custom.limbs = limbs;
            return g;
        },
        animate(m, g, t) { animateGolemArms(m, t); },
    },
    cv_spore: {
        make: () => ({ stem: lambertMat(0xd8cfbe), cap: lambertMat(0x7a4a8a, { emissive: 0x2a0e3a }), gill: lambertMat(0x4a3048), spot: basicMat(0xd890ff) }),
        build(A, m, G, C) {
            const g = new THREE.Group(), cap = new THREE.Group();
            partMesh(g, G.cyl, A.stem, 0, 0.45, 0, 0.17, 0.9, 0.17);
            partMesh(g, G.sphere, A.stem, 0, 0.06, 0, 0.26, 0.1, 0.26);
            cap.position.y = 0.85;
            g.add(cap);
            partMesh(cap, C.halfSphere, A.cap, 0, 0, 0, 0.62, 0.62, 0.62);       // 반구 갓 (약하게 발광)
            partMesh(cap, G.cyl, A.gill, 0, 0.005, 0, 0.6, 0.02, 0.6);
            const rng = createRng(77);
            for (let i = 0; i < 9; i++) {   // 보라색 점
                const a = rng() * Math.PI * 2, el = 0.25 + rng(), r = 0.62;
                partMesh(cap, G.sphere, A.spot, Math.sin(el) * Math.cos(a) * r, Math.cos(el) * r, Math.sin(el) * Math.sin(a) * r, 0.06, 0.035, 0.06);
            }
            m.custom.cap = cap;
            return g;
        },
        animate(m, g, t) {   // 숨 쉬듯 부풀고, 포자를 뿜기 직전 (예비 동작) 에는 크게 부푼다
            const k = m.timers.windup > 0 ? 1.2 : 1 + Math.sin(t * 2 + m.uid) * 0.04;
            m.custom.cap.scale.set(k, 1 / Math.sqrt(k), k);
        },
    },
    // --- 용암 동굴 (10-1)
    lv_imp: {
        make: () => ({
            skin: lambertMat(0xc0301c, { emissive: 0x6a1a06 }), horn: lambertMat(0x2a1a14), eye: basicMat(0xffe040),
            wing: lambertMat(0x6a1610, { side: THREE.DoubleSide, emissive: 0x2a0602 }),
            glow: basicMat(0xff9a3a, { transparent: true, opacity: 0.22, depthWrite: false }),
        }),
        build(A, m, G, C) {
            const g = new THREE.Group(), wings = [];
            partMesh(g, G.sphere, A.skin, 0, -0.05, 0, 0.17, 0.22, 0.14);       // 작은 붉은 몸
            partMesh(g, G.sphere, A.skin, 0, 0.27, -0.02, 0.14, 0.13, 0.13);    // 머리
            partMesh(g, G.sphere, A.glow, 0, 0.05, 0, 0.42, 0.5, 0.4);          // 주황색 발광
            for (const s of [-1, 1]) {
                partMesh(g, G.cone, A.horn, s * 0.08, 0.42, -0.02, 0.035, 0.16, 0.035, 0, 0, -s * 0.5);   // 뿔
                partMesh(g, G.sphere, A.eye, s * 0.05, 0.29, -0.13, 0.025, 0.02, 0.015);
                limbMesh(g, G.cyl, A.skin, [s * 0.08, -0.2, 0], [s * 0.1, -0.5, 0.03], 0.04);
                limbMesh(g, G.cyl, A.skin, [s * 0.15, 0.07, 0], [s * 0.26, -0.18, -0.08], 0.035);
                const pivot = new THREE.Group();
                pivot.position.set(s * 0.08, 0.08, 0.1);
                g.add(pivot);
                partMesh(pivot, C.wing, A.wing, 0, 0, 0, s * 0.55, 1, 1.0, 0.4, 0, 0);   // 박쥐 날개
                wings.push({ pivot, s });
            }
            m.custom.wings = wings;
            return g;
        },
        animate(m, g, t) {
            g.position.y += Math.sin(t * 2.2 + m.uid) * 0.08;
            const f = Math.sin(t * 9 + m.uid) * 0.6;
            for (const w of m.custom.wings) w.pivot.rotation.z = w.s * (0.3 + f);
        },
    },
    lv_slime: {
        make: () => ({ shell: lambertMat(0x3a1608, { emissive: 0x7a2a06, transparent: true, opacity: 0.82 }), core: basicMat(0xff8a2a), crack: basicMat(0xffb04a) }),
        build(A, m, G) {
            const g = new THREE.Group(), body = new THREE.Group();
            g.add(body);
            partMesh(body, G.sphere, A.core, 0, 0.45, 0, 0.3, 0.26, 0.3);      // 안쪽 마그마
            partMesh(body, G.sphere, A.shell, 0, 0.48, 0, 0.6, 0.48, 0.6);     // 주황·검정 반투명 겉
            const rng = createRng(91);
            for (let i = 0; i < 8; i++) {   // 표면의 빛나는 균열
                const a = rng() * Math.PI * 2, v = rng() * 1.0 - 0.3, c = Math.sqrt(1 - v * v) * 1.01;
                partMesh(body, G.sphere, A.crack, Math.cos(a) * 0.6 * c, 0.48 + v * 0.48, Math.sin(a) * 0.6 * c, 0.03, 0.12, 0.03, rng() * 3, rng() * 3, 0);
            }
            m.custom.body = body;
            return g;
        },
        animate(m, g, t) {   // 튀어 오르며 이동 (닿을 때 납작해짐)
            const hop = m.custom.moving ? Math.abs(Math.sin(t * 5 + m.uid)) : 0;
            const sq = m.custom.moving ? 1 - (1 - hop) * 0.2 : 1 + Math.sin(t * 2 + m.uid) * 0.04;
            m.custom.body.position.y = hop * 0.35;
            m.custom.body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
        },
    },
    lv_golem: {
        make: () => ({ rock: lambertMat(0x1c1a1e), rock2: lambertMat(0x2c2628), crack: basicMat(0xff7a20), eye: basicMat(0xffd060) }),
        build(A, m, G) {
            const g = new THREE.Group(), limbs = [];
            partMesh(g, G.box, A.rock, 0, 1.5, 0, 1.2, 1.1, 0.8);                    // 검은 각진 몸
            partMesh(g, G.box, A.rock2, 0, 2.05, 0.05, 1.45, 0.35, 0.85);            // 어깨
            partMesh(g, G.box, A.rock, 0, 2.38, -0.08, 0.5, 0.42, 0.48, 0, Math.PI / 4, 0);   // 각진 머리
            for (const [x, y, w, h, rz] of [[0.1, 1.5, 0.06, 0.7, 0.3], [-0.25, 1.3, 0.05, 0.45, -0.5], [0.3, 1.75, 0.3, 0.05, 0.2], [-0.15, 2.0, 0.4, 0.04, -0.1]]) {
                partMesh(g, G.box, A.crack, x, y, -0.405, w, h, 0.02, 0, 0, rz);    // 주황색으로 빛나는 균열
            }
            for (const s of [-1, 1]) {
                partMesh(g, G.box, A.eye, s * 0.1, 2.4, -0.33, 0.08, 0.04, 0.02);
                const arm = new THREE.Group(), leg = new THREE.Group();
                arm.position.set(s * 0.85, 1.95, 0);
                leg.position.set(s * 0.32, 0.95, 0);
                g.add(arm, leg);
                partMesh(arm, G.box, A.rock2, 0, -0.5, 0, 0.38, 0.9, 0.38);
                partMesh(arm, G.box, A.rock, 0, -1.05, 0, 0.45, 0.4, 0.45);
                partMesh(arm, G.box, A.crack, s * 0.195, -0.5, 0, 0.02, 0.6, 0.06);
                partMesh(leg, G.box, A.rock, 0, -0.47, 0, 0.42, 0.95, 0.46);
                limbs.push({ arm, leg, s });
            }
            m.custom.limbs = limbs;
            return g;
        },
        animate(m, g, t) { animateGolemArms(m, t); },
    },
    lv_salamander: {
        make: () => ({ skin: lambertMat(0xb02818, { emissive: 0x3a0804 }), back: lambertMat(0x5a1008), eye: basicMat(0xffe040) }),
        build(A, m, G, C) {
            const g = new THREE.Group(), legs = [], tail = new THREE.Group();
            partMesh(g, C.capsule, A.skin, 0, 0.32, 0, 0.32, 0.42, 0.28, Math.PI / 2);   // 길쭉한 캡슐 몸 (앞뒤로 누움)
            partMesh(g, G.box, A.back, 0, 0.465, 0, 0.12, 0.04, 0.7);
            partMesh(g, G.sphere, A.skin, 0, 0.33, -0.58, 0.19, 0.14, 0.25);           // 머리
            for (const s of [-1, 1]) partMesh(g, G.sphere, A.eye, s * 0.12, 0.4, -0.66, 0.035, 0.035, 0.03);
            tail.position.set(0, 0.3, 0.38);
            g.add(tail);
            partMesh(tail, G.coneSmooth, A.skin, 0, 0, 0.45, 0.15, 0.9, 0.12, Math.PI / 2);   // 원뿔 꼬리 (뒤로)
            for (const [sx, sz, ph] of [[-1, -0.28, 0], [1, -0.28, 1], [-1, 0.25, 1], [1, 0.25, 0]]) {
                const leg = new THREE.Group();
                leg.position.set(sx * 0.22, 0.22, sz);
                g.add(leg);
                limbMesh(leg, G.cyl, A.skin, [0, 0, 0], [sx * 0.2, -0.22, 0], 0.05);
                legs.push({ leg, ph });
            }
            m.custom.legs = legs;
            m.custom.tail = tail;
            return g;
        },
        animate(m, g, t) {
            const mv = m.custom.moving, sp = mv ? 14 : 2;
            m.custom.tail.rotation.y = Math.sin(t * sp * 0.5) * (mv ? 0.4 : 0.12);
            for (const l of m.custom.legs) l.leg.rotation.y = Math.sin(t * sp + l.ph * Math.PI) * (mv ? 0.5 : 0.05);
        },
    },
    // --- 왜곡된 차원 (10-1)
    vd_watcher: {
        make: () => ({ eye: lambertMat(0xf0eee8), iris: lambertMat(0x7a3ad0, { emissive: 0x2a0a50 }), pupil: basicMat(0x050308), tentacle: lambertMat(0x3a2050) }),
        build(A, m, G) {
            const g = new THREE.Group(), tentacles = [];
            partMesh(g, G.sphere, A.eye, 0, 0, 0, 0.5, 0.5, 0.5);              // 큰 흰 눈알
            partMesh(g, G.sphere, A.iris, 0, 0, -0.44, 0.24, 0.24, 0.1);       // 보라색 홍채
            partMesh(g, G.sphere, A.pupil, 0, 0, -0.52, 0.1, 0.1, 0.04);
            for (let i = 0; i < 3; i++) {   // 아래로 늘어진 촉수 3개
                const a = (i * Math.PI * 2) / 3 + 0.5, c = Math.cos(a), s = Math.sin(a), pivot = new THREE.Group();
                pivot.position.set(c * 0.22, -0.4, s * 0.22);
                g.add(pivot);
                limbMesh(pivot, G.cyl, A.tentacle, [0, 0, 0], [c * 0.1, -0.35, s * 0.1], 0.045);
                limbMesh(pivot, G.cyl, A.tentacle, [c * 0.1, -0.35, s * 0.1], [c * 0.05, -0.7, s * 0.05], 0.03);
                tentacles.push({ pivot, ph: i * 2.1 });
            }
            m.custom.tentacles = tentacles;
            return g;
        },
        animate(m, g, t) {
            g.position.y += Math.sin(t * 1.6 + m.uid) * 0.1;
            for (const k of m.custom.tentacles) {
                k.pivot.rotation.x = Math.sin(t * 2.5 + k.ph) * 0.3;
                k.pivot.rotation.z = Math.cos(t * 2 + k.ph) * 0.25;
            }
        },
    },
    vd_stalker: {
        make: () => ({
            body: lambertMat(0x8a50e0, { emissive: 0x2a0a4a, transparent: true, opacity: 0.6, depthWrite: false }),
            blade: lambertMat(0xd8c8ff, { emissive: 0x3a2a6a }), eye: basicMat(0xffffff),
        }),
        build(A, m, G, C) {
            const g = new THREE.Group(), limbs = [];
            partMesh(g, C.capsule, A.body, 0, 1.25, 0, 0.36, 0.45, 0.24);      // 보랏빛 반투명의 길쭉한 몸
            partMesh(g, G.sphere, A.body, 0, 1.86, 0, 0.12, 0.2, 0.13);        // 길쭉한 머리
            for (const s of [-1, 1]) {
                partMesh(g, G.box, A.eye, s * 0.045, 1.9, -0.12, 0.05, 0.012, 0.01);   // 가는 눈
                const arm = new THREE.Group(), leg = new THREE.Group();
                arm.position.set(s * 0.24, 1.58, 0);
                leg.position.set(s * 0.1, 0.85, 0);
                g.add(arm, leg);
                partMesh(arm, G.cyl, A.body, 0, -0.25, 0, 0.045, 0.5, 0.045);
                partMesh(arm, G.cone, A.blade, 0, -0.88, -0.04, 0.08, 0.8, 0.02, Math.PI);   // 칼날 팔 (아래로 뾰족)
                partMesh(leg, G.cyl, A.body, 0, -0.43, 0, 0.06, 0.86, 0.06);
                limbs.push({ arm, leg, s });
            }
            m.custom.limbs = limbs;
            return g;
        },
        animate(m, g, t) {
            swingLimbs(m, m.custom.limbs, t, 0.55, 9);
            const pose = m.timers.windup > 0 ? -1.6 : m.custom.lunge > 0 ? 0.6 : null;
            if (pose !== null) for (const l of m.custom.limbs) l.arm.rotation.x = pose;
        },
    },
    vd_jelly: {
        make: () => {
            const glass = { transparent: true, depthWrite: false, side: THREE.DoubleSide };
            return {
                bell: lambertMat(0x8ad8ff, { emissive: 0x1a4a6a, opacity: 0.45, ...glass }), bright: basicMat(0xe0f8ff, { opacity: 0.85, ...glass }),
                line: basicMat(0x9ae4ff, { transparent: true, opacity: 0.7 }), spark: basicMat(0xffffff),
            };
        },
        build(A, m, G, C) {
            const g = new THREE.Group(), bell = new THREE.Group(), lines = [];
            bell.position.y = -0.1;
            g.add(bell);
            m.custom.bellMesh = partMesh(bell, C.halfSphere, A.bell, 0, 0, 0, 0.7, 0.6, 0.7);   // 반투명 하늘색 반구
            const rng = createRng(53);
            for (let i = 0; i < 12; i++) {   // 반짝이는 점
                const a = rng() * Math.PI * 2, el = rng() * 1.3, r = 0.62;
                partMesh(bell, G.sphere, A.spark, Math.sin(el) * Math.cos(a) * r, Math.cos(el) * r * 0.86, Math.sin(el) * Math.sin(a) * r, 0.022, 0.022, 0.022);
            }
            for (let i = 0; i < 8; i++) {   // 아래로 늘어진 선
                const a = (i / 8) * Math.PI * 2, pivot = new THREE.Group();
                pivot.position.set(Math.cos(a) * 0.48, -0.1, Math.sin(a) * 0.48);
                g.add(pivot);
                const len = 0.6 + (i % 3) * 0.12;
                partMesh(pivot, G.cyl, A.line, 0, -len / 2, 0, 0.012, len, 0.012);
                lines.push({ pivot, ph: i * 0.8 });
            }
            m.custom.bell = bell;
            m.custom.lines = lines;
            return g;
        },
        animate(m, g, t) {   // 펄스 0.5초 전 (예비 동작) 에는 몸이 밝아진다
            g.position.y += Math.sin(t * 1.3 + m.uid) * 0.1;
            const k = 1 + Math.sin(t * 3 + m.uid) * 0.06;
            m.custom.bell.scale.set(k, 1 / k, k);
            m.custom.bellMesh.userData.baseMat = m.timers.windup > 0 ? m.model.A.bright : m.model.A.bell;
            for (const l of m.custom.lines) l.pivot.rotation.x = Math.sin(t * 2.2 + l.ph) * 0.25;
        },
    },
    vd_sentinel: {
        make: () => ({ marble: lambertMat(0xe6e2da), vein: lambertMat(0xb8b4ac), metal: lambertMat(0xc8c4bc), flash: basicMat(0xffffff), slit: basicMat(0x1a1820) }),
        build(A, m, G) {
            const g = new THREE.Group(), limbs = [];
            partMesh(g, G.box, A.marble, 0, 1.45, 0, 0.72, 0.85, 0.45);       // 흰 대리석 기사
            partMesh(g, G.box, A.vein, 0, 1.0, 0, 0.6, 0.18, 0.42);
            partMesh(g, G.cyl, A.marble, 0, 2.08, 0, 0.2, 0.36, 0.2);         // 투구
            partMesh(g, G.sphere, A.marble, 0, 2.26, 0, 0.2, 0.1, 0.2);
            partMesh(g, G.box, A.slit, 0, 2.1, -0.19, 0.24, 0.04, 0.03);
            partMesh(g, G.box, A.vein, 0, 2.34, 0, 0.04, 0.12, 0.3);
            for (const s of [-1, 1]) {
                partMesh(g, G.box, A.marble, s * 0.46, 1.8, 0, 0.28, 0.18, 0.4);   // 어깨
                const leg = new THREE.Group();
                leg.position.set(s * 0.18, 0.92, 0);
                g.add(leg);
                partMesh(leg, G.box, A.marble, 0, -0.46, 0, 0.24, 0.92, 0.28);
                limbs.push({ leg, s });
            }
            limbMesh(g, G.cyl, A.marble, [-0.5, 1.75, 0], [-0.47, 1.3, -0.22], 0.08);   // 왼팔: 앞쪽 방패
            m.custom.shield = partMesh(g, G.box, A.metal, -0.5, 1.3, -0.32, 0.65, 1.0, 0.08);
            partMesh(g, G.box, A.vein, -0.5, 1.3, -0.37, 0.08, 0.7, 0.02);
            partMesh(g, G.box, A.vein, -0.5, 1.45, -0.37, 0.45, 0.08, 0.02);
            limbMesh(g, G.cyl, A.marble, [0.5, 1.75, 0], [0.55, 1.25, -0.15], 0.08);    // 오른팔: 창
            partMesh(g, G.cyl, A.vein, 0.55, 1.35, -0.18, 0.03, 2.6, 0.03);
            partMesh(g, G.cone, A.metal, 0.55, 2.8, -0.18, 0.07, 0.32, 0.07);
            m.custom.limbs = limbs;
            return g;
        },
        animate(m, g, t) {   // 막으면 방패가 번쩍인다
            swingLimbs(m, m.custom.limbs, t, 0.3, 6);
            m.custom.shield.userData.baseMat = m.custom.blockT > 0 ? m.model.A.flash : m.model.A.metal;
        },
    },
    // --- 보스 5종 (10-5). m.custom.pose = 패턴 자세 ('raise' 예고 중 / 'slam'·'swing'·'sweep' 공격 순간 / 'charge' 돌진)
    br_boss: {   // 키 4m 의 얼굴 없는 정장 차림 인간형 (긴 팔다리, 넥타이), 손에 결재판
        make: () => ({
            suit: lambertMat(0x1e2230), shirt: lambertMat(0xe8e8e0), tie: lambertMat(0x8a1a1a), skin: lambertMat(0xd8d0c4),
            board: lambertMat(0x8a6a40), paper: lambertMat(0xf4f2ea), shoe: lambertMat(0x101012),
        }),
        build(A, m, G) {
            const g = new THREE.Group(), limbs = [];
            partMesh(g, G.box, A.suit, 0, 2.55, 0, 0.95, 1.3, 0.45);           // 정장 상의
            partMesh(g, G.box, A.shirt, 0, 2.75, -0.226, 0.32, 0.9, 0.02);
            partMesh(g, G.box, A.tie, 0, 2.7, -0.24, 0.11, 0.8, 0.02);          // 넥타이
            partMesh(g, G.box, A.tie, 0, 3.12, -0.245, 0.14, 0.1, 0.03);
            partMesh(g, G.box, A.suit, 0, 1.85, 0, 0.8, 0.25, 0.42);
            partMesh(g, G.cyl, A.skin, 0, 3.3, 0, 0.1, 0.25, 0.1);
            partMesh(g, G.sphere, A.skin, 0, 3.62, 0, 0.27, 0.36, 0.29);        // 얼굴 없는 머리
            for (const s of [-1, 1]) {
                const arm = new THREE.Group(), leg = new THREE.Group();
                arm.position.set(s * 0.58, 3.1, 0);
                leg.position.set(s * 0.24, 1.8, 0);
                g.add(arm, leg);
                partMesh(arm, G.cyl, A.suit, 0, -0.85, 0, 0.1, 1.7, 0.1);       // 긴 팔
                partMesh(arm, G.sphere, A.skin, 0, -1.75, 0, 0.1, 0.13, 0.1);
                partMesh(leg, G.cyl, A.suit, 0, -0.9, 0, 0.13, 1.8, 0.13);      // 긴 다리
                partMesh(leg, G.box, A.shoe, 0, -1.76, -0.08, 0.2, 0.1, 0.38);
                limbs.push({ arm, leg, s });
            }
            const right = limbs[1].arm;   // 오른손 결재판
            partMesh(right, G.box, A.board, 0, -1.8, -0.25, 0.04, 0.6, 0.45);
            partMesh(right, G.box, A.paper, -0.025, -1.78, -0.25, 0.01, 0.52, 0.4);
            m.custom.limbs = limbs;
            return g;
        },
        animate(m, g, t) {
            swingLimbs(m, m.custom.limbs, t, 0.45, 5);
            const arm = m.custom.limbs[1].arm, pose = m.custom.pose;
            if (pose === 'raise') arm.rotation.x = -2.8;   // 결재 도장: 결재판을 치켜들었다가 내려찍는다
            else if (pose === 'slam') arm.rotation.x = 0.9;
        },
    },
    bk_boss: {   // 키 4.5m 의 녹슨 판금 갑옷 거인, 쇠사슬 철퇴, 투구 틈의 붉은 눈
        make: () => ({ rust: lambertMat(0x6e4a34), dark: lambertMat(0x4a3224), iron: lambertMat(0x55524c), eye: basicMat(0xff2a1a), slit: basicMat(0x080606) }),
        build(A, m, G) {
            const g = new THREE.Group(), limbs = [];
            partMesh(g, G.box, A.rust, 0, 2.65, 0, 1.6, 1.6, 0.95);             // 흉갑
            partMesh(g, G.box, A.dark, 0, 1.75, 0, 1.3, 0.45, 0.85);
            partMesh(g, G.cyl, A.rust, 0, 3.78, 0, 0.42, 0.62, 0.42);           // 투구
            partMesh(g, G.sphere, A.rust, 0, 4.08, 0, 0.42, 0.24, 0.42);
            partMesh(g, G.box, A.slit, 0, 3.8, -0.41, 0.5, 0.08, 0.04);         // 투구 틈
            for (const s of [-1, 1]) {
                partMesh(g, G.sphere, A.eye, s * 0.12, 3.8, -0.43, 0.05, 0.035, 0.02);   // 붉은 눈
                partMesh(g, G.sphere, A.rust, s * 0.98, 3.3, 0, 0.48, 0.38, 0.5);         // 어깨 갑옷
                const arm = new THREE.Group(), leg = new THREE.Group();
                arm.position.set(s * 1.0, 3.15, 0);
                leg.position.set(s * 0.38, 1.6, 0);
                g.add(arm, leg);
                partMesh(arm, G.cyl, A.dark, 0, -0.75, 0, 0.22, 1.5, 0.22);
                partMesh(arm, G.box, A.rust, 0, -1.55, 0, 0.36, 0.3, 0.36);     // 건틀릿
                partMesh(leg, G.box, A.rust, 0, -0.8, 0, 0.5, 1.6, 0.55);
                limbs.push({ arm, leg, s });
            }
            // 오른손 쇠사슬 철퇴: 손잡이 → 사슬 → 가시 달린 쇠공
            const flail = new THREE.Group();
            flail.position.set(0, -1.6, 0);
            limbs[1].arm.add(flail);
            partMesh(flail, G.cyl, A.iron, 0, 0, -0.3, 0.05, 0.6, 0.05, -Math.PI / 2);
            limbMesh(flail, G.cyl, A.iron, [0, 0, -0.6], [0, -0.7, -0.9], 0.03);
            partMesh(flail, G.sphere, A.iron, 0, -0.85, -0.95, 0.4, 0.4, 0.4);
            for (const [dx, dy, dz, rx, rz] of [[0, 1, 0, 0, 0], [0, -1, 0, Math.PI, 0], [1, 0, 0, 0, -Math.PI / 2], [-1, 0, 0, 0, Math.PI / 2], [0, 0, 1, Math.PI / 2, 0], [0, 0, -1, -Math.PI / 2, 0]]) {
                partMesh(flail, G.cone, A.iron, dx * 0.45, -0.85 + dy * 0.45, -0.95 + dz * 0.45, 0.09, 0.24, 0.09, rx, 0, rz);
            }
            m.custom.limbs = limbs;
            return g;
        },
        animate(m, g, t) {
            swingLimbs(m, m.custom.limbs, t, 0.35, 4);
            const arm = m.custom.limbs[1].arm, pose = m.custom.pose;
            if (pose === 'raise') arm.rotation.set(-2.3, 0, 0);
            else if (pose === 'swing') arm.rotation.set(0.6, 0, 1.2);
            else if (pose === 'charge') { for (const l of m.custom.limbs) l.arm.rotation.x = -0.9; }
            else arm.rotation.y = arm.rotation.z = 0;
        },
    },
    cv_boss: {   // 몸길이 5m 의 거미, 등에 붉은 무늬, 배 끝에 알주머니
        make: () => ({
            body: lambertMat(0x3a2418), abdomen: lambertMat(0x2a1a12), mark: basicMat(0xc81a1a), leg: lambertMat(0x2e1e14),
            eye: basicMat(0xff3a2a), sac: lambertMat(0xe8e0c8, { emissive: 0x2a2418 }), fang: lambertMat(0x120c08),
        }),
        build(A, m, G) {
            const g = new THREE.Group();
            partMesh(g, G.sphere, A.abdomen, 0, 1.55, 1.2, 1.45, 1.1, 1.75);     // 배
            partMesh(g, G.sphere, A.mark, 0, 2.6, 0.85, 0.35, 0.1, 0.5);           // 등의 붉은 무늬 (모래시계)
            partMesh(g, G.sphere, A.mark, 0, 2.55, 1.65, 0.28, 0.1, 0.4);
            partMesh(g, G.sphere, A.sac, 0, 1.1, 3.05, 0.6, 0.55, 0.55);           // 알주머니
            partMesh(g, G.sphere, A.body, 0, 1.35, -1.0, 0.95, 0.75, 1.05);        // 머리가슴
            for (const s of [-1, 1]) {
                for (const [ex, ey] of [[0.12, 1.75], [0.3, 1.68], [0.2, 1.55], [0.42, 1.5]]) partMesh(g, G.sphere, A.eye, s * ex, ey, -1.9, 0.08, 0.08, 0.05);
                partMesh(g, G.cone, A.fang, s * 0.22, 0.85, -1.95, 0.1, 0.45, 0.1, Math.PI);   // 송곳니
            }
            m.custom.legs = buildSpiderLegs(g, A.leg, G, { x0: 0.8, y0: 1.4, zFrom: -1.6, zStep: 0.55, knee: [2.0, 1.2], foot: 3.1, spread: 1.0, r: 0.12 });
            return g;
        },
        animate(m, g, t) { animateSpiderLegs(m, t, 8); },
    },
    lv_boss: {   // 하반신이 용암 웅덩이에 잠긴 키 5m 의 거대한 상반신, 검은 바위 피부와 주황 균열, 불타는 왕관
        make: () => ({
            rock: lambertMat(0x1a1618), rock2: lambertMat(0x2a2422), crack: basicMat(0xff7020), lava: basicMat(0xff5a14),
            pool: lambertMat(0x6a1a06, { emissive: 0x8a2a06 }), crown: basicMat(0xffc040), eye: basicMat(0xffe080),
            flame: basicMat(0xff8a2a, { transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }),
        }),
        build(A, m, G) {
            const g = new THREE.Group(), arms = [], flames = new THREE.Group();
            partMesh(g, G.cyl, A.pool, 0, 0.08, 0, 3.2, 0.16, 3.2);              // 용암 웅덩이
            partMesh(g, G.cyl, A.lava, 0, 0.17, 0, 2.6, 0.04, 2.6);
            partMesh(g, G.cyl, A.rock, 0, 0.9, 0, 1.2, 1.6, 1.0);                // 잠긴 허리
            partMesh(g, G.box, A.rock, 0, 2.5, 0, 2.2, 1.7, 1.3);                // 상반신
            partMesh(g, G.box, A.rock2, 0, 3.4, 0.05, 2.6, 0.5, 1.4);            // 어깨
            for (const [x, y, w, h, rz] of [[0.3, 2.5, 0.08, 1.2, 0.25], [-0.5, 2.3, 0.07, 0.8, -0.4], [0.7, 2.9, 0.5, 0.07, 0.1], [-0.2, 1.9, 0.9, 0.06, -0.15], [0, 1.0, 0.07, 0.9, 0.1]]) {
                partMesh(g, G.box, A.crack, x, y, y < 1.7 ? -0.51 : -0.66, w, h, 0.02, 0, 0, rz);   // 주황 균열
            }
            partMesh(g, G.box, A.rock, 0, 4.1, 0, 0.95, 0.95, 0.9);              // 머리
            for (const s of [-1, 1]) partMesh(g, G.box, A.eye, s * 0.2, 4.15, -0.46, 0.18, 0.07, 0.02);
            flames.position.y = 4.6;
            g.add(flames);
            for (let i = 0; i < 6; i++) {   // 불타는 왕관: 금빛 뾰족 + 위로 일렁이는 불꽃
                const a = (i / 6) * Math.PI * 2, x = Math.cos(a) * 0.42, z = Math.sin(a) * 0.4;
                partMesh(g, G.cone, A.crown, x, 4.72, z, 0.1, 0.3, 0.1);
                partMesh(flames, G.cone, A.flame, x, 0.45, z, 0.13, 0.55, 0.13);
            }
            for (const s of [-1, 1]) {
                const arm = new THREE.Group();
                arm.position.set(s * 1.5, 3.35, 0);
                g.add(arm);
                partMesh(arm, G.box, A.rock2, 0, -0.75, 0, 0.62, 1.5, 0.62, 0, 0, s * 0.15);
                partMesh(arm, G.box, A.rock, s * -0.12, -1.75, -0.1, 0.85, 0.75, 0.85);   // 거대한 주먹
                partMesh(arm, G.box, A.crack, s * 0.32, -0.75, 0, 0.02, 0.9, 0.08);
                arms.push({ arm, s });
            }
            m.custom.arms = arms;
            m.custom.flames = flames;
            return g;
        },
        animate(m, g, t) {
            const f = 1 + Math.sin(t * 9) * 0.12;
            m.custom.flames.scale.set(1, f, 1);
            const pose = m.custom.pose;
            for (const a of m.custom.arms) {
                a.arm.rotation.z = pose === 'raise' ? a.s * 1.3 : pose === 'sweep' ? a.s * 0.4 : a.s * (0.08 + Math.sin(t * 1.5) * 0.04);
                a.arm.rotation.y = pose === 'sweep' ? a.s * 1.2 : 0;
            }
        },
    },
    vd_boss: {   // 지름 4m 의 검은 구 + 주위를 도는 보라색 고리 3개 + 촉수
        make: () => ({
            core: lambertMat(0x08080c, { emissive: 0x12061e }), ring: basicMat(0x9a5cff), ring2: basicMat(0x6a3ad0),
            tentacle: lambertMat(0x1a0e26, { emissive: 0x0e0418 }), eye: basicMat(0xd8a0ff),
        }),
        build(A, m, G, C) {
            const g = new THREE.Group(), rings = [], tentacles = [];
            partMesh(g, G.sphere, A.core, 0, 0, 0, 2.0, 2.0, 2.0);
            partMesh(g, G.sphere, A.eye, 0, 0.2, -1.93, 0.45, 0.16, 0.12);   // 빛나는 틈
            for (const [r, tilt, mat] of [[2.6, 0.3, A.ring], [2.95, 1.2, A.ring2], [3.3, -0.7, A.ring]]) {
                const holder = new THREE.Group();
                holder.rotation.x = tilt;
                g.add(holder);
                partMesh(holder, C.torus, mat, 0, 0, 0, r, r, r, Math.PI / 2, 0, 0);
                rings.push(holder);
            }
            for (let i = 0; i < 6; i++) {   // 아래로 늘어진 촉수 (마디 3개)
                const a = (i / 6) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), pivot = new THREE.Group();
                pivot.position.set(c * 1.4, -1.3, s * 1.4);
                g.add(pivot);
                let prev = [0, 0, 0];
                for (let k = 1; k <= 3; k++) {
                    const next = [c * 0.35 * k, -0.75 * k, s * 0.35 * k];
                    limbMesh(pivot, G.cyl, A.tentacle, prev, next, 0.16 - k * 0.035);
                    prev = next;
                }
                tentacles.push({ pivot, ph: i * 1.1 });
            }
            m.custom.rings = rings;
            m.custom.tentacles = tentacles;
            return g;
        },
        animate(m, g, t) {
            g.position.y += Math.sin(t * 1.1) * 0.15;
            m.custom.rings.forEach((h, i) => { h.rotation.y = t * (0.6 + i * 0.35) * (i % 2 ? -1 : 1); });
            for (const k of m.custom.tentacles) {
                k.pivot.rotation.x = Math.sin(t * 1.8 + k.ph) * 0.35;
                k.pivot.rotation.z = Math.cos(t * 1.5 + k.ph) * 0.3;
            }
        },
    },
};
// 몬스터 외형 재질 (종류별로 한 번 만들어 공유)
function lambertMat(color, extra) { return new THREE.MeshLambertMaterial({ color, ...extra }); }
function basicMat(color, extra) { return new THREE.MeshBasicMaterial({ color, ...extra }); }
// 고블린 몸 (고블린·고블린 주술사 공용): 작은 녹색 인간형 + 원뿔 모양 큰 귀. 반환: 걷기용 팔다리 [왼쪽, 오른쪽]
function buildGoblinBody(g, A, G) {
    const limbs = [];
    partMesh(g, G.sphere, A.cloth, 0, 0.6, 0, 0.22, 0.27, 0.17);
    partMesh(g, G.sphere, A.skin, 0, 0.98, 0, 0.17, 0.16, 0.16);
    partMesh(g, G.cone, A.skin, 0, 0.95, -0.17, 0.035, 0.1, 0.035, -Math.PI / 2);   // 코 (앞으로)
    for (const s of [-1, 1]) {
        partMesh(g, G.cone, A.skin, s * 0.2, 1.03, 0, 0.06, 0.3, 0.035, 0, 0, -s * 1.25);   // 큰 귀 (바깥쪽 위로)
        partMesh(g, G.sphere, A.eye, s * 0.065, 1.01, -0.145, 0.03, 0.025, 0.02);
        const arm = new THREE.Group(), leg = new THREE.Group();
        arm.position.set(s * 0.24, 0.78, 0);
        leg.position.set(s * 0.1, 0.4, 0);
        g.add(arm, leg);
        partMesh(arm, G.cyl, A.skin, 0, -0.17, 0, 0.045, 0.34, 0.045);
        partMesh(leg, G.cyl, A.skin, 0, -0.2, 0, 0.06, 0.4, 0.06);
        limbs.push({ arm, leg, s });
    }
    return limbs;
}
// 거미 다리 8개 (동굴 거미·거미 여왕): 몸 옆 관절 → 무릎 (위) → 발 (바닥). o = { x0, y0, zFrom, zStep, knee: [옆, 위], foot (옆), spread (앞뒤 벌어짐), r }
function buildSpiderLegs(g, mat, G, o) {
    const legs = [];
    for (const s of [-1, 1]) {
        for (let i = 0; i < 4; i++) {
            const pivot = new THREE.Group(), spread = (i - 1.5) * o.spread;
            pivot.position.set(s * o.x0, o.y0, o.zFrom + i * o.zStep);
            g.add(pivot);
            const knee = [s * o.knee[0], o.knee[1], spread * 0.6], foot = [s * o.foot, -o.y0, spread * 1.3];
            limbMesh(pivot, G.cyl, mat, [0, 0, 0], knee, o.r);
            limbMesh(pivot, G.cyl, mat, knee, foot, o.r * 0.85);
            legs.push({ pivot, phase: i * 1.6 + (s > 0 ? 0 : Math.PI) });
        }
    }
    return legs;
}
function animateSpiderLegs(m, t, speed) {
    const a = m.custom.moving ? 0.22 : 0.03;
    for (const l of m.custom.legs) l.pivot.rotation.y = Math.sin(t * speed + l.phase) * a;
}
// 골렘 (바위·흑요석): 걸을 때 팔다리, 예비 동작에는 두 팔을 치켜들고 공격하는 순간 내려친다
function animateGolemArms(m, t) {
    swingLimbs(m, m.custom.limbs, t, 0.35, 5);
    const pose = m.timers.windup > 0 ? -2.6 : m.custom.lunge > 0 ? 0.5 : null;
    if (pose !== null) for (const l of m.custom.limbs) l.arm.rotation.x = pose;
}
// MONSTER_MODELS 에 외형이 없는 종류의 대체 모양: 테마 색 캡슐 + 머리 + 눈 (10단계에서 25종을 모두 만들었으므로 새 몬스터를 추가할 때만 쓰인다)
const THEME_MONSTER_COLORS = { backrooms: 0x9a9a9a, brick: 0x7a5a40, cave: 0x6a6660, lava: 0xb04a1c, void: 0x8a70d8 };
function genericMonsterModel(typeId) {
    const def = MONSTER_TYPES[typeId];
    return {
        make: () => ({ body: new THREE.MeshLambertMaterial({ color: THEME_MONSTER_COLORS[def.theme] }), eye: new THREE.MeshBasicMaterial({ color: 0xffe08a }) }),
        build(A, m, G, C) {
            const g = new THREE.Group(), h = def.height, r = def.radius, base = def.hover ? -h / 2 : 0;
            const head = Math.min(r * 0.7, h * 0.16);
            partMesh(g, C.capsule, A.body, 0, base + h * 0.37, 0, r * 1.6, h * 0.37, r * 1.6);
            partMesh(g, G.sphere, A.body, 0, base + h - head, 0, head, head, head);
            for (const s of [-1, 1]) partMesh(g, G.sphere, A.eye, s * head * 0.4, base + h - head, -head * 0.9, head * 0.18, head * 0.18, head * 0.12);
            return g;
        },
        animate(m, g, t) { if (def.hover) g.position.y += Math.sin(t * 2 + m.uid) * 0.08; },
    };
}
const monsterModelCache = {};
function getMonsterModel(typeId) {
    if (!monsterModelCache[typeId]) {
        const spec = MONSTER_MODELS[typeId] || genericMonsterModel(typeId);
        monsterModelCache[typeId] = { ...spec, A: spec.make() };
    }
    return monsterModelCache[typeId];
}
// 몬스터·시체의 Group 을 만들어 층 view 에 붙인다 (처음 그려질 때 한 번)
function ensureMonsterMesh(g, o) {
    if (o.mesh) return o.mesh;
    const model = getMonsterModel(o.typeId), C = getMonsterCommon(), G = getCommonAssets().geo;
    if (!o.custom) o.custom = {};
    if (!o.ownedMats) o.ownedMats = [];
    o.model = model;
    o.mesh = model.build(model.A, o, G, C);
    o.mesh.scale.setScalar(o.size || 1);
    o.meshes = [];
    o.mesh.traverse((n) => { if (n.isMesh) o.meshes.push(n); });
    g.view.group.add(o.mesh);
    return o.mesh;
}
// 몬스터 이름 (정예는 앞에 "정예", AGENTS.md "생성 규칙")
function monsterDisplayName(m) {
    return (m.elite ? t('monster.elite') + ' ' : '') + localName(m.def);
}
// 몬스터 머리 위 HP 막대 (피해를 입었을 때만 보임). 개체마다 CanvasTexture 를 가지므로 지울 때 dispose.
// 정예는 이름 + 막대를 늘 보여준다 (10-2). 보스는 화면 위쪽 HUD 막대를 쓴다 (10-4)
function updateMonsterHpBar(m) {
    const named = m.elite;
    if (m.dead || m.isBoss || (!named && m.hp >= m.maxHp)) {
        if (m.hpBar) m.hpBar.visible = false;
        return;
    }
    const W = named ? 256 : 64, H = named ? 44 : 8;
    if (!m.hpBar) {
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        m.hpBar = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
        m.hpBar.scale.set(named ? 1.5 : 1.1, named ? 0.26 : 0.14, 1);
        m.hpBar.position.y = (m.def.hover ? m.def.height / 2 : m.def.height) + (named ? 0.5 : 0.35);
        m.hpBar.userData = { canvas, ratio: -1 };
        m.mesh.add(m.hpBar);
    }
    m.hpBar.visible = true;
    const ratio = Math.round((m.hp / m.maxHp) * 62) / 62;
    if (m.hpBar.userData.ratio === ratio) return;
    m.hpBar.userData.ratio = ratio;
    const ctx = m.hpBar.userData.canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    const by = named ? 32 : 0, bh = 8, bw = named ? 160 : 64, bx = (W - bw) / 2;
    if (named) {
        ctx.font = "700 24px 'Pretendard', 'Noto Sans KR', 'Noto Sans', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.strokeText(monsterDisplayName(m), W / 2, 15);
        ctx.fillStyle = '#f3c84a';
        ctx.fillText(monsterDisplayName(m), W / 2, 15);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = m.elite ? '#f3c84a' : '#e0483a';
    ctx.fillRect(bx + 1, by + 1, (bw - 2) * ratio, bh - 2);
    m.hpBar.material.map.needsUpdate = true;
}
// 정예 금색 테두리 (10-2): 부품마다 같은 도형을 조금 크게 뒤집어 (BackSide) 그린 껍데기. 납작한 부품 (날개)·반투명 부품은 제외.
// 공유 도형·재질이라 dispose 할 것이 없다. 시체가 될 때 뺀다
function addEliteOutline(m) {
    const C = getMonsterCommon(), grow = (s) => s * 1.06 + Math.sign(s) * 0.035;
    m.custom.outlines = [];
    for (const n of m.meshes) {
        if (n.geometry === C.wing || n.userData.baseMat.transparent) continue;
        if (Math.max(Math.abs(n.scale.x), Math.abs(n.scale.y), Math.abs(n.scale.z)) < 0.06) continue;   // 눈·이빨 같은 작은 부품은 테두리가 부품보다 커진다
        const o = new THREE.Mesh(n.geometry, C.eliteOutline);
        o.position.copy(n.position);
        o.quaternion.copy(n.quaternion);
        o.scale.set(grow(n.scale.x), grow(n.scale.y), grow(n.scale.z));
        n.parent.add(o);
        m.custom.outlines.push(o);
    }
}
function removeEliteOutline(o) {
    if (!o.custom || !o.custom.outlines) return;
    for (const x of o.custom.outlines) x.removeFromParent();
    o.custom.outlines = null;
}
function disposeHpBar(m) {
    if (!m.hpBar) return;
    m.hpBar.removeFromParent();
    m.hpBar.material.map.dispose();
    m.hpBar.material.dispose();
    m.hpBar = null;
}
// 몬스터·시체의 3D 를 장면에서 빼고 개체 전용 자원 (복제한 재질·HP 막대) 을 해제한다. 공유 지오메트리·재질은 남긴다 (4.6)
function disposeMonsterVisual(o) {
    disposeHpBar(o);
    removeMonsterExtras(o);
    if (o.mesh) o.mesh.removeFromParent();
    for (const mat of o.ownedMats || []) mat.dispose();
    o.ownedMats = [];
    o.mesh = null;
}
// 매 프레임 (일시정지 중에도) 몬스터·시체·바닥 아이템의 3D 를 런타임 상태에 맞춘다
function syncWorldVisuals(g) {
    const p = g.player.pos, C = getMonsterCommon();
    for (const m of g.monsters) {
        const far = Math.hypot(p.x - m.pos.x, p.z - m.pos.z) > (m.eric ? ERIC_MONSTER.drawDist : MONSTER_DRAW_DIST);
        if (far) { if (m.mesh) m.mesh.visible = false; continue; }
        const mesh = ensureMonsterMesh(g, m);
        if (m.elite && !m.custom.outlines) addEliteOutline(m);
        mesh.visible = true;
        mesh.position.copy(m.pos);
        mesh.rotation.set(monsterLean(m), m.yaw, 0, 'YXZ');
        if (m.model.animate && !m.custom.frozen) m.model.animate(m, mesh, m.custom.animT || 0);
        if (m.custom.bodyMat) m.custom.bodyMat.opacity = m.custom.opacity === undefined ? 0.25 : m.custom.opacity;
        const flash = m.timers.flash > 0;
        for (const n of m.meshes) n.material = flash ? C.hit : n.userData.baseMat;
        if (m.def.attack.type === 'beam') syncAimLine(g, m);
        updateMonsterHpBar(m);
    }
    for (const c of g.corpses) {
        if (c.mesh || Math.hypot(p.x - c.x, p.z - c.z) > MONSTER_DRAW_DIST) continue;
        ensureMonsterMesh(g, c);
        applyCorpsePose(g, c);
    }
    for (const dr of g.drops) syncDropVisual(g, dr);
}
// 근접 예비 동작 중에는 몸을 뒤로 젖히고, 공격하는 순간 앞으로 숙인다 (8-5). 범위·광선 공격의 예비 동작은 모델이 따로 표현한다
function monsterLean(m) {
    if (m.isBoss) return 0;
    if (m.timers.windup > 0 && m.def.attack.type === 'melee') return 0.35;
    if (m.custom.lunge > 0) return -0.4 * (m.custom.lunge / 0.15);
    return 0;
}

// --- AI (8-4, AGENTS.md "행동 공통")
const MONSTER_SIGHT = 14;              // 감지 거리
const MONSTER_LEASH = 28;              // 이보다 멀어지면 추적 포기
const MONSTER_LOST_TIME = 4;           // 이 시간 넘게 안 보이면 추적 포기
const MONSTER_RETURN_HEAL_PCT = 5;     // 돌아가는 동안 초당 최대 HP %
const MONSTER_RETURN_TIMEOUT = 20;     // 돌아가다 길이 막히면 이 시간 뒤 생성 위치로 옮긴다 (안전장치)
const MONSTER_STAGGER_TIME = 0.2;      // 맞으면 경직
const MONSTER_KNOCK_TIME = 0.2;        // 넉백으로 밀려나는 시간
const MONSTER_ACTIVE_DIST = 48;        // 이보다 먼 대기 몬스터는 배회만 FAR_WANDER_STEP 초마다 몰아서 갱신한다 (성능)
const FAR_WANDER_STEP = 0.25;
const WANDER_RANGE_CELLS = 10;         // 대기 중 배회 범위: 생성 칸에서 칸 길 거리 10칸 안 (2026-10-22 사용자 지시, U33)
const MELEE_LAND_EXTRA = 0.5;          // 예비 동작이 끝날 때 사거리 + 0.5m 안이면 명중 (8-5)
const LOS_STEP = 1;                    // 시야 판정 간격 (m)
function monsterCenterY(m) { return m.def.hover ? m.pos.y : m.pos.y + m.height * 0.5; }
function monsterEyeY(m) { return m.def.hover ? m.pos.y : m.pos.y + m.height * 0.85; }
// 바닥 높이 (계단) 에 맞춘다. 부유형은 바닥에서 키 × 0.5 + 1m 위가 몸 중심 (custom.hoverY 가 있으면 그 높이, 동굴 박쥐)
function placeMonsterOnFloor(g, m) {
    if (!g.dungeon) return;
    const f = floorHeightAt(g.dungeon, m.pos.x, m.pos.z);
    m.pos.y = m.def.hover ? f + (m.custom.hoverY !== undefined ? m.custom.hoverY : m.height * 0.5 + 1) : f;
}
// a → b 선분 위의 점을 1m 간격으로 찍어 벽 상자 안 (높이 < min(상자 높이, 그리기 벽 높이)) 이면 막힘 (8-4). 던전 밖도 막힘
function hasLineOfSight(g, ax, ay, az, bx, by, bz) {
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay, bz - az) / LOS_STEP)), wallH = g.view.wallVisualHeight;
    for (let i = 1; i < n; i++) {
        const t = i / n, x = ax + (bx - ax) * t, y = ay + (by - ay) * t, z = az + (bz - az) * t;
        const boxes = g.view.collision.get(cellKey(Math.floor(x / CELL_SIZE), Math.floor(z / CELL_SIZE)));
        if (!boxes) return false;
        for (const b of boxes) {
            if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ && y < Math.min(b.maxY, wallH)) return false;
        }
    }
    return true;
}
// 성소 구역 안의 주인공은 몬스터가 노리지 않는다 (U25: 감지·공격 모두 안 함, 투사체는 성소에서 사라짐)
// 캐비닛 안 (17-5) 도 공격받지 않는다. 에릭의 몬스터는 엘리베이터 내부의 주인공도 노리지 않는다 (AGENTS.md "에릭 특별 규칙", U43)
function playerTargetable(g) { return !g.dead && !g.inSanctuary && !g.hiding && !g.warp && !(g.inElevator && g.state && g.state.hero === 'eric'); }   // warp = 빛 바랜 주문서 순간이동 중 (22-5)
function faceTo(m, x, z) {
    const vx = x - m.pos.x, vz = z - m.pos.z;
    if (vx * vx + vz * vz > 1e-6) m.yaw = Math.atan2(-vx, -vz);   // 앞 = (−sin yaw, −cos yaw) (4.4)
}
function updateMonsters(g, dt) {
    const p = g.player.pos;
    updateFlowField(g);
    g.wanderLeaders = wanderLeaders(g.monsters);
    for (const m of g.monsters) {
        if (m.dead) continue;
        if (m.eric) { updateEricMonster(g, m, dt); continue; }   // 에릭의 몬스터 (19-2)
        if (m.effects.length > 0) tickMonsterStatus(g, m, dt);   // 지속 피해는 멀리 있어도 계속 (9-3)
        if (m.custom.weakenT > 0) m.custom.weakenT -= dt;        // 위협의 함성 (D5) 남은 시간
        if (m.dead) continue;
        const dist = Math.hypot(p.x - m.pos.x, p.z - m.pos.z);
        if (m.state === 'idle' && dist > MONSTER_ACTIVE_DIST) {   // 멀리 있는 대기 몬스터: 배회만 띄엄띄엄 (감지·특수 행동 없음)
            m.custom.farT = (m.custom.farT || 0) + dt;
            if (m.custom.farT >= FAR_WANDER_STEP) {
                if (!isDisabled(m) && !m.isBoss) monsterWander(g, m, m.custom.farT);
                m.custom.farT = 0;
            }
            continue;
        }
        updateMonster(g, m, dt, dist);
    }
    separateMonsters(g);
    if (g.monsters.some((m) => m.dead)) g.monsters = g.monsters.filter((m) => !m.dead);
}
// 몬스터 지속 피해 (감전이면 +15%) → 1초마다 모아서 숫자 표시, HP 0 이면 처치 (경험치는 주인공에게)
function tickMonsterStatus(g, m, dt) {
    const dot = tickEffects(m, dt, m.custom.moving) * (1 + effectMagnitude(m, 'shock') / 100);
    if (dot <= 0) return;
    m.hp -= dot;
    m.custom.dotSum = (m.custom.dotSum || 0) + dot;
    m.custom.dotT = (m.custom.dotT || 0) + dt;
    if (m.custom.dotT >= 1 || m.hp <= 0) {
        spawnFloatingText(g, m.pos.x, monsterCenterY(m) + m.height * 0.5 + 0.2, m.pos.z, String(Math.round(m.custom.dotSum)), '#c8a0ff', 0.8);
        m.custom.dotSum = 0;
        m.custom.dotT = 0;
    }
    if (m.hp <= 0) killMonster(g, m);
}
// 이동 속도 = 표의 속도 × (1 − 둔화%) (9-4)
function monsterSpeed(m) { return m.def.speed * (1 - effectMagnitude(m, 'slow') / 100); }
function updateMonster(g, m, dt, dist) {
    const beh = MONSTER_BEHAVIORS[m.typeId];
    if (beh && beh.onUpdate && beh.onUpdate(g, m, dt, dist) === false) return;   // 마네킹: 보고 있으면 모두 멈춤
    const slowMul = 1 - effectMagnitude(m, 'slow') / 100;   // 둔화: 공격 간격도 그만큼 느리게 돈다
    m.custom.animT = (m.custom.animT || 0) + dt * slowMul;
    m.custom.moving = false;
    for (const k of ['attack', 'stagger', 'knock', 'flash']) {
        if (m.timers[k] > 0) m.timers[k] = Math.max(0, m.timers[k] - (k === 'attack' ? dt * slowMul : dt));
    }
    if (m.custom.lunge > 0) m.custom.lunge = Math.max(0, m.custom.lunge - dt);
    if (m.custom.timeline) runMonsterTimeline(g, m, dt * slowMul);   // 예약한 행동 (예고 뒤 공격·순간이동, 10단계)
    if (m.timers.knock > 0) { moveMonsterBy(g, m, m.knockVel.x * dt, m.knockVel.z * dt); return; }
    if (m.timers.stagger > 0) return;
    if (isDisabled(m)) { m.timers.windup = 0; return; }   // 빙결·기절: 행동 불가
    if (m.isBoss) { updateBoss(g, m, dt, dist, slowMul); return; }   // 보스는 공터 전투·패턴 (10-4)
    const fear = m.effects.find((e) => e.id === 'fear');
    if (fear) {   // 공포: 시전자 반대 방향으로 도망 (공격하지 않음)
        const from = fear.from || g.player.pos;
        m.timers.windup = 0;
        stepMonster(g, m, m.pos.x - from.x, m.pos.z - from.z, monsterSpeed(m) * dt);
        return;
    }
    const p = g.player.pos;
    const canSee = playerTargetable(g) && dist <= MONSTER_LEASH && (m.state !== 'idle' || dist <= MONSTER_SIGHT)
        && hasLineOfSight(g, m.pos.x, monsterEyeY(m), m.pos.z, p.x, p.y + EYE_HEIGHT, p.z);
    if (canSee) m.lastSeenAt = g.time;
    if (m.state === 'idle') {
        if (canSee) alertGroup(g, m);
        else monsterWander(g, m, dt);
    }
    if (m.state === 'chase') {
        if (dist > MONSTER_LEASH || g.time - m.lastSeenAt > MONSTER_LOST_TIME) startReturn(g, m);
        else monsterChase(g, m, dt, dist, canSee);
    }
    if (m.state === 'return') monsterReturn(g, m, dt);
}
// --- 에릭의 몬스터 (19단계, AGENTS.md "에릭 특별 규칙", U43·U44·U45). 층마다 그 층 테마의 보스 외형 1~2기 (보스 패턴·HP 막대·보상 없음, 처치 불가).
// 층 전체를 느리게 배회 → 주인공 (또는 플래시 불빛) 을 발견하면 주인공의 달리기 속도로 추적 → 8초 동안 안 보이면 해제하고 그 자리에서 다시 배회.
// 발소리 (걷기 5칸·달리기 20칸) 를 들으면 가장 최신 소리 위치로 배회 속도로 다가간다 (의심 모드 'suspect', 도착·막힘·발견하면 끝, 23단계).
// 캐비닛에 숨은 채로 8초가 지나면 모든 몬스터의 의심·추적이 풀린다.
// 엘리베이터 내부·성소 구역에 들어가지 못하고 (cell.ericBarred·sanctuaryZone → monsterBarred), 그 안·캐비닛 안의 주인공은 노리지 않는다 (playerTargetable).
// 공격 = 근접 1가지 (몸 반지름 + 1.5m, 예비 동작 0.5초), 명중하면 그때의 HP 전부만큼 피해 (한 방에 사망, 2026-10-24 사용자 확정)
const ERIC_MONSTER = {
    wanderSpeed: 2.5,        // 배회 속도 (m/s, 주인공 걷기의 약 절반)
    lostTime: 8,             // 이 시간 동안 안 보이면 추적 해제 (AGENTS.md, 2026-10-25 4초 → 8초)
    hideCalmTime: 8,         // 캐비닛에 숨은 채로 이 시간이 지나면 모든 몬스터의 의심·추적 해제 (AGENTS.md, 23-3)
    arriveDist: 1.5,         // 의심 모드: 소리 위치에 이만큼 다가가면 도착
    reach: 1.5,              // 공격 사거리 = 몸 반지름 + 1.5m
    windup: 0.5,             // 예비 동작 (피할 틈)
    cooldown: 1.2,           // 공격 뒤 다음 예비 동작까지
    radius: 1.5,             // 충돌 반지름 상한 (보스 몸은 크지만 6m 통로를 지나가도록)
    minSpawnCells: 8,        // 주인공 도착 칸에서 칸 길 거리 8칸 이상에 생성
    sightTick: 0.1,          // 시야 판정 간격 (초)
    drawDist: 330,           // 그리는 거리 (플래시로 20칸까지 보이므로)
    stuckTime: 5,            // 배회 중 이 시간 동안 1m 도 못 가면 목표를 바꾼다 (의심 모드는 해제)
};
// 발소리 (23-1, AGENTS.md "에릭 특별 규칙", U57): 걷기 = 주인공 주위 5칸 (80m), 달리기 = 20칸 (320m), 멈춰 있거나 캐비닛 안이면 소리 없음.
// 벽에 막히지 않는다. 0.5초마다 범위 안의 몬스터에게 "가장 최신 소리 위치" 를 알린다
const ERIC_FOOTSTEP = { walk: 5 * CELL_SIZE, run: 20 * CELL_SIZE, tick: 0.5 };
function footstepRange(moving, running, hiding) {   // 순수 함수
    if (hiding || !moving) return 0;
    return running ? ERIC_FOOTSTEP.run : ERIC_FOOTSTEP.walk;
}
// 에릭 몬스터의 귀 (23-1·23-3): 캐비닛에 숨은 시간 (8초면 모두 진정) + 0.5초마다 발소리. 빛 바랜 주문서 순간이동 중에는 소리를 내지 않는다
function updateEricSenses(g, dt) {
    if (g.hiding) {
        g.hideT = (g.hideT || 0) + dt;
        if (g.hideT >= ERIC_MONSTER.hideCalmTime && !g.hideCalmed) {
            g.hideCalmed = true;
            for (const m of g.monsters) if (m.eric) calmEricMonster(m);
        }
    } else {
        g.hideT = 0;
        g.hideCalmed = false;
    }
    g.footstepT = (g.footstepT || 0) - dt;
    if (g.footstepT > 0) return;
    g.footstepT = ERIC_FOOTSTEP.tick;
    const p = g.player, range = g.warp ? 0 : footstepRange(p.moving, p.running, !!g.hiding);
    if (range <= 0) return;
    for (const m of g.monsters) if (m.eric && Math.hypot(m.pos.x - p.pos.x, m.pos.z - p.pos.z) <= range) hearFootstep(m, p.pos.x, p.pos.z);
}
// 발소리를 들음 → 의심 모드 (추적 중이면 그대로). 이미 의심 중이면 소리 위치만 가장 최신 것으로
function hearFootstep(m, x, z) {
    if (m.state === 'chase') return;
    if (m.state !== 'suspect') { m.state = 'suspect'; m.custom.stuckPos = null; }
    m.custom.sound = { x, z };
    m.path = null;
}
// 시야 (U44): 정면 120° 안 2칸 (32m) + 벽에 가리지 않음. 플래시가 켜져 있으면 ① 정면 120° 안 20칸 (불빛이 보임) ② 몬스터가 플래시 부채꼴 (±30°, 20칸) 안 (불빛에 비침) 도 발견
const ERIC_SIGHT = { fovDeg: 120, base: 2 * CELL_SIZE, flash: 20 * CELL_SIZE, flashHalfDeg: 30 };
// 순수 함수 (19-3). m = { x, z, yaw }, p = { x, z, yaw (주인공 시선), hiding, flashOn }, los() = 벽에 가리지 않는가 (필요할 때만 부른다)
function ericMonsterSees(m, p, los) {
    if (p.hiding) return false;   // 캐비닛 안의 주인공은 어떤 경우에도 보지 못한다 (AGENTS.md)
    const dx = p.x - m.x, dz = p.z - m.z, dist = Math.hypot(dx, dz);
    const front = dist < 1e-6 || (dx * -Math.sin(m.yaw) + dz * -Math.cos(m.yaw)) / dist >= Math.cos(ERIC_SIGHT.fovDeg / 2 * Math.PI / 180);
    if (front && dist <= ERIC_SIGHT.base) return los();
    if (!p.flashOn || dist > ERIC_SIGHT.flash) return false;
    if (front) return los();                                                   // 불빛이 보임
    const lit = dist < 1e-6 || (-dx * -Math.sin(p.yaw) + -dz * -Math.cos(p.yaw)) / dist >= Math.cos(ERIC_SIGHT.flashHalfDeg * Math.PI / 180);
    return lit && los();                                                       // 불빛에 비침
}
// 노이즈 단계 (19-4·23-4, U45): 3 = 추적 당하는 중, 2 = 가장 가까운 몬스터가 10칸 안, 1 = 20칸 안, 0 = 없음. 순수 함수
// (2026-10-25 AGENTS.md: 1단계 "주위 20칸", 2단계 "주위 10칸". 그 전에는 10칸 / 5칸)
const ERIC_NOISE = { near1: 20 * CELL_SIZE, near2: 10 * CELL_SIZE, opacity: [0, 0.06, 0.12, 0.2] };
function ericNoiseLevel(nearestDist, chased) {
    if (chased) return 3;
    if (nearestDist <= ERIC_NOISE.near2) return 2;
    if (nearestDist <= ERIC_NOISE.near1) return 1;
    return 0;
}
// 생성 계획 (19-1, 순수 함수): 1 또는 2기 (각 50%), 종류 = 그 층 테마의 보스, 도착 칸에서 칸 길 거리 8칸 이상인 생성 가능 칸의 가운데 (2기는 서로 다른 칸)
function planEricMonsters(d, themeId, floor, arrivalKey, rnd) {
    const count = rnd() < 0.5 ? 1 : 2, dist = arrivalKey && d.cells.has(arrivalKey) ? cellBfs(d, arrivalKey).dist : new Map();
    let cells = [...d.cells.values()].filter((c) => canSpawnMonsterIn(c) && (dist.get(cellKey(c.gx, c.gz)) || 0) >= ERIC_MONSTER.minSpawnCells);
    if (cells.length === 0) cells = [...d.cells.values()].filter((c) => canSpawnMonsterIn(c));   // (안전장치) 아주 작은 층
    const out = [];
    for (let i = 0; i < count && cells.length > 0; i++) {
        const c = cells.splice(Math.floor(rnd() * cells.length), 1)[0], p = cellCenter(c);
        out.push({ typeId: THEMES[themeId].boss, level: floor, x: p.x, z: p.z, yaw: rnd() * Math.PI * 2 - Math.PI, cellKey: cellKey(c.gx, c.gz) });
    }
    return out;
}
// 런타임 몬스터를 에릭 모드로 (생성·복원·디버그 공용)
function setupEricMonster(m) {
    m.eric = true;
    m.radius = Math.min(m.radius, ERIC_MONSTER.radius);
    m.zone = null;
    return m;
}
function spawnEricMonsters(g) {
    const c = g.currentCell, st = g.state;
    for (const rec of planEricMonsters(g.dungeon, st.theme, st.floor, c ? cellKey(c.gx, c.gz) : null, Math.random)) {
        const m = setupEricMonster(createMonsterState(rec.typeId, rec.level, rec));
        placeMonsterOnFloor(g, m);
        g.monsters.push(m);
    }
}
function ericReach(m) { return m.def.radius * (m.size || 1) + ERIC_MONSTER.reach; }
// 매 프레임 (19-2)
function updateEricMonster(g, m, dt) {
    const p = g.player.pos, tm = m.timers;
    m.custom.animT = (m.custom.animT || 0) + dt;
    m.custom.moving = false;
    tm.attack = Math.max(0, tm.attack - dt);
    tm.path = Math.max(0, (tm.path || 0) - dt);
    if (m.custom.lunge > 0) m.custom.lunge = Math.max(0, m.custom.lunge - dt);
    m.custom.sightT = (m.custom.sightT || 0) - dt;
    if (m.custom.sightT <= 0) {   // 시야는 0.1초마다
        m.custom.sightT = ERIC_MONSTER.sightTick;
        m.custom.sees = playerTargetable(g) && ericMonsterSees({ x: m.pos.x, z: m.pos.z, yaw: m.yaw },
            { x: p.x, z: p.z, yaw: g.player.yaw, hiding: !!g.hiding, flashOn: !!(g.flash && g.flash.on) },
            () => hasLineOfSight(g, m.pos.x, monsterEyeY(m), m.pos.z, p.x, p.y + EYE_HEIGHT, p.z));
    }
    if (m.custom.sees && playerTargetable(g)) {
        m.lastSeenAt = g.time;
        m.custom.lastSeen = { x: p.x, z: p.z };
        if (m.state !== 'chase') { m.state = 'chase'; m.path = null; m.custom.sound = null; }   // 의심 모드 중 발견해도 추적 (23-2)
    }
    if (tm.windup > 0) {   // 예비 동작: 제자리에서 주인공을 바라본다
        if (playerTargetable(g)) faceTo(m, p.x, p.z);
        tm.windup = Math.max(0, tm.windup - dt);
        if (tm.windup === 0) resolveEricAttack(g, m);
        return;
    }
    if (m.state === 'chase') {
        if (g.time - m.lastSeenAt > ERIC_MONSTER.lostTime) {   // 8초 동안 안 보임 → 그 자리에서 다시 배회
            m.state = 'idle';
            m.wanderTo = null;
            m.path = null;
        } else {
            const dist = Math.hypot(p.x - m.pos.x, p.z - m.pos.z);
            if (m.custom.sees && playerTargetable(g) && dist <= ericReach(m)) {
                faceTo(m, p.x, p.z);
                if (tm.attack === 0) { tm.windup = ERIC_MONSTER.windup; tm.attack = ERIC_MONSTER.windup + ERIC_MONSTER.cooldown; }
                return;
            }
            const to = m.custom.sees ? p : m.custom.lastSeen;   // 안 보이면 마지막으로 본 자리로 (주인공 위치를 알지 못한다)
            if (to && Math.hypot(to.x - m.pos.x, to.z - m.pos.z) > 0.6) ericMoveTo(g, m, to.x, to.z, g.derived.runSpeed, dt);
            return;
        }
    }
    if (m.state === 'suspect') {   // 의심 모드 (23-2): 소리 위치로 배회 속도 → 도착하거나 막히면 (예: 엘리베이터 안) 다시 배회
        const snd = m.custom.sound;
        if (snd && Math.hypot(snd.x - m.pos.x, snd.z - m.pos.z) > ERIC_MONSTER.arriveDist && ericStuckTime(m, dt) <= ERIC_MONSTER.stuckTime) {
            ericMoveTo(g, m, snd.x, snd.z, ERIC_MONSTER.wanderSpeed, dt);
            return;
        }
        calmEricMonster(m);
    }
    ericWander(g, m, dt);
}
// 1m 도 못 간 시간 (배회·의심 모드의 막힘 판정)
function ericStuckTime(m, dt) {
    const c = m.custom;
    if (!c.stuckPos || Math.hypot(m.pos.x - c.stuckPos.x, m.pos.z - c.stuckPos.z) > 1) { c.stuckPos = { x: m.pos.x, z: m.pos.z }; c.stuckT = 0; }
    c.stuckT = (c.stuckT || 0) + dt;
    return c.stuckT;
}
// 칸 길찾기로 목표까지 (들어갈 수 없는 칸은 지나가지 않음). 경로는 1초마다 다시 찾는다
function ericMoveTo(g, m, tx, tz, speed, dt) {
    const here = cellKeyAtWorld(m.pos.x, m.pos.z), goal = cellKeyAtWorld(tx, tz);
    let wx = tx, wz = tz;
    if (here !== goal) {
        if (!m.path || m.path[m.path.length - 1] !== goal || m.timers.path === 0) {
            m.path = findCellPath(g.dungeon, here, goal);
            m.timers.path = 1;
        }
        const wp = pathWaypoint(g, m, tx, tz);
        wx = wp.x;
        wz = wp.z;
    }
    stepMonster(g, m, wx - m.pos.x, wz - m.pos.z, speed * dt);
}
// 층 전체 배회: 들어갈 수 있는 칸 중 무작위 칸의 가운데로 → 도착하거나 막히면 다음 칸
function ericWander(g, m, dt) {
    const c = m.custom;
    if (!m.wanderTo || Math.hypot(m.wanderTo.x - m.pos.x, m.wanderTo.z - m.pos.z) < 1.5 || ericStuckTime(m, dt) > ERIC_MONSTER.stuckTime) {
        const cells = [...g.dungeon.cells.values()].filter((x) => canSpawnMonsterIn(x));
        m.wanderTo = cellCenter(cells[Math.floor(Math.random() * cells.length)]);
        m.path = null;
        c.stuckT = 0;
    }
    ericMoveTo(g, m, m.wanderTo.x, m.wanderTo.z, ERIC_MONSTER.wanderSpeed, dt);
}
// 추적·의심·예비 동작을 풀고 그 자리에서 다시 배회 (빛 바랜 주문서 22-5, 의심 모드 끝 23-2, 캐비닛 8초 23-3)
function calmEricMonster(m) {
    m.state = 'idle';
    m.path = null;
    m.wanderTo = null;
    m.timers.windup = 0;
    m.custom.sees = false;
    m.custom.lastSeen = null;
    m.custom.sound = null;      // 의심 모드의 소리 위치 (23-2)
    m.custom.stuckPos = null;
}
// 예비 동작이 끝나는 순간: 그때도 사거리 안이고 노릴 수 있으면 (캐비닛·엘리베이터·성소 밖) 한 방에 사망. 아니면 빗나감
function resolveEricAttack(g, m) {
    m.custom.lunge = 0.15;
    const p = g.player.pos;
    if (!playerTargetable(g) || Math.hypot(p.x - m.pos.x, p.z - m.pos.z) > ericReach(m)) return;
    damagePlayer(g, g.state.player.hp);   // 방어·저항·받는 피해 % 와 상관없이 그때의 HP 전부 (U43)
}
// 무리 중 하나가 감지하면 같은 무리 전체가 추적한다. 배회하던 몬스터는 추적을 시작한 자리 (home) 를 기억했다가 그리로 돌아간다
function alertGroup(g, m) {
    for (const o of g.monsters) {
        if (o === m || (m.groupId && o.groupId === m.groupId && !o.dead)) {
            if (o.state === 'idle') o.home = { x: o.pos.x, z: o.pos.z };
            o.state = 'chase';
            o.lastSeenAt = g.time;
            o.wanderTo = null;
            o.path = null;
        }
    }
}
// 추적 중 공격·이동. 예비 동작 (근접·범위 공격 직전, 광선 조준) 이 끝나면 resolveWindup.
// 특수 행동 훅 onChase 가 true 를 돌려주면 그 프레임의 기본 행동을 건너뛴다 (화염 숨결·박쥐 물러나기 등, 10-1)
function monsterChase(g, m, dt, dist, canSee) {
    const a = m.def.attack, p = g.player.pos, speed = monsterSpeed(m);
    if (m.timers.windup > 0) {   // 예비 동작 중: 제자리에서 주인공을 바라본다 (둔화면 느리게). 광선은 발사 직전 BEAM_LOCK_TIME 동안 조준 고정
        if (a.type !== 'beam' || m.timers.windup > BEAM_LOCK_TIME) {
            faceTo(m, p.x, p.z);
            if (a.type === 'beam') aimBeamAtPlayer(g, m);
        }
        m.timers.windup = Math.max(0, m.timers.windup - dt * (1 - effectMagnitude(m, 'slow') / 100));
        if (m.timers.windup === 0) resolveWindup(g, m);
        return;
    }
    const beh = MONSTER_BEHAVIORS[m.typeId];
    if (beh && beh.onChase && beh.onChase(g, m, dt, dist, canSee)) return;
    if (a.type === 'melee') {
        if (canSee && dist <= a.range + PLAYER_RADIUS) {
            faceTo(m, p.x, p.z);
            if (m.timers.attack === 0) { m.timers.windup = a.windup; m.timers.attack = a.interval; }
            return;
        }
        monsterMoveTo(g, m, p.x, p.z, dt, canSee, speed);
    } else if (a.type === 'ranged' || a.type === 'beam') {
        if (canSee && dist <= a.range && m.timers.attack === 0) {
            m.timers.attack = a.interval;
            if (a.type === 'ranged') fireMonsterProjectile(g, m);
            else { m.timers.windup = a.aimTime; aimBeamAtPlayer(g, m); return; }   // 공허의 눈: 조준선 → 광선
        }
        keepRangedDistance(g, m, dt, dist, canSee, speed);
    } else if (a.type === 'aura') {   // 포자 버섯·별무리 해파리: 범위 안이면 예비 동작 뒤 범위 공격
        if (canSee && dist <= a.range + PLAYER_RADIUS && m.timers.attack === 0) { m.timers.windup = a.windup; m.timers.attack = a.interval; return; }
        if (speed > 0 && dist > a.radius * 0.6) monsterMoveTo(g, m, p.x, p.z, dt, canSee, speed);
        else faceTo(m, p.x, p.z);
    }
}
// 원거리형 거리 유지 (8-4): 범위보다 가까우면 물러나고, 멀거나 안 보이면 다가간다
function keepRangedDistance(g, m, dt, dist, canSee, speed) {
    const a = m.def.attack, p = g.player.pos;
    const [near, far] = a.keepDistance || [0, a.range * 0.8];
    if (!canSee || dist > far) monsterMoveTo(g, m, p.x, p.z, dt, canSee, speed);
    else if (dist < near) { stepMonster(g, m, m.pos.x - p.x, m.pos.z - p.z, speed * dt); faceTo(m, p.x, p.z); }
    else faceTo(m, p.x, p.z);
}
function resolveWindup(g, m) {
    const type = m.def.attack.type;
    if (type === 'aura') resolveAura(g, m);
    else if (type === 'beam') fireBeam(g, m);
    else resolveMeleeHit(g, m);
}
// 근접 예비 동작이 끝나는 순간: 그때도 사거리 + 0.5m 안이면 명중 (8-5).
// 넉백 (오크 전사), 기절 (바위 골렘), 충격파 (흑요석 골렘) 는 데이터 (monsterAttack 의 추가 필드) 대로 (10-1)
function resolveMeleeHit(g, m) {
    const a = m.def.attack, p = g.player.pos;
    m.custom.lunge = 0.15;
    let dealt = 0;
    if (Math.hypot(p.x - m.pos.x, p.z - m.pos.z) <= a.range + PLAYER_RADIUS + MELEE_LAND_EXTRA) {
        dealt = hitPlayer(g, monsterAttacker(m), { kind: 'physical', element: a.element, coef: a.coef, canCrit: false, melee: true }, a.effect, { x: m.pos.x, z: m.pos.z, monster: m });
        if (dealt > 0 && a.stun > 0) applyStatusToPlayer(g, 'stun', { duration: a.stun });   // 바위 골렘 등 (AGENTS.md "물리 + 기절")
        if (dealt > 0 && a.knockback > 0) knockPlayer(g, m.pos.x, m.pos.z, a.knockback);   // 오크 전사 (AGENTS.md "물리 + 넉백 2m")
    }
    if (a.shockwave) monsterShockwave(g, m, a.shockwave);
    const beh = MONSTER_BEHAVIORS[m.typeId];
    if (beh && beh.onAttack) beh.onAttack(g, m, dealt > 0);
}
// 근접 명중 지점 (몬스터 앞 SHOCKWAVE_FORWARD m) 중심의 충격파: 반경 안의 주인공에게 공격력 N% 원소 피해 (흑요석 골렘)
const SHOCKWAVE_FORWARD = 1.6;
function monsterShockwave(g, m, sw) {
    const x = m.pos.x - Math.sin(m.yaw) * SHOCKWAVE_FORWARD, z = m.pos.z - Math.cos(m.yaw) * SHOCKWAVE_FORWARD;
    spawnRing(g, x, z, sw.radius, 0xff7a2a, 0.45);
    const p = g.player.pos;
    if (Math.hypot(p.x - x, p.z - z) <= sw.radius + PLAYER_RADIUS) {
        hitPlayer(g, monsterAttacker(m), { kind: 'physical', element: sw.element, coef: sw.coef, canCrit: false }, null);
    }
}
// 범위 공격 (AGENTS.md "공격 방식" 의 범위). cloudTime > 0 이면 몬스터 자리에 구름 (포자 버섯, U28), 0 이면 즉발 펄스 (별무리 해파리)
function resolveAura(g, m) {
    const a = m.def.attack, attacker = monsterAttacker(m), spec = { kind: 'physical', element: a.element, coef: a.coef, canCrit: false };
    if (a.cloudTime > 0) {
        const tick = 0.5;
        spawnPuff(g, m.pos.x, m.pos.y + m.height * 0.6, m.pos.z, 0xb080e0, a.radius * 0.6, 0.5);
        createGroundZone(g, {
            x: m.pos.x, z: m.pos.z, radius: a.radius, duration: a.cloudTime, tick, mat: getMonsterCommon().sporeCloud,
            onTick: (gg, zone) => {   // 초당 공격력 coef% → 틱마다 coef × tick %, 맞을 때마다 상태이상 (확률)
                const p = gg.player.pos;
                if (Math.hypot(p.x - zone.x, p.z - zone.z) > zone.radius + PLAYER_RADIUS) return;
                hitPlayer(gg, attacker, { ...spec, coef: a.coef * tick }, a.effect);
            },
        });
        return;
    }
    spawnPuff(g, m.pos.x, monsterCenterY(m), m.pos.z, 0x9ad8ff, a.radius, 0.35);
    const p = g.player.pos;
    if (Math.hypot(p.x - m.pos.x, p.z - m.pos.z) <= a.radius + PLAYER_RADIUS) hitPlayer(g, attacker, spec, a.effect);
}

// --- 광선 (공허의 눈, 10-1): 조준선 (aimTime 초, 마지막 BEAM_LOCK_TIME 초는 방향 고정) → 그 방향으로 즉발 광선. 벽·성소 구역에서 끊긴다
const BEAM_LOCK_TIME = 0.3, BEAM_STEP = 0.4, BEAM_HIT_RADIUS = 0.2;
function monsterBeamOrigin(m) { return new THREE.Vector3(m.pos.x, monsterEyeY(m), m.pos.z); }
function aimBeamAtPlayer(g, m) {
    const p = g.player.pos, o = monsterBeamOrigin(m);
    m.custom.aimDir = new THREE.Vector3(p.x, p.y + 1.2, p.z).sub(o).normalize();
}
// from 에서 dir (단위 벡터) 으로 최대 range m: 벽·바닥·천장·던전 밖·성소 구역에 닿기 전까지의 길이
function beamLength(g, from, dir, range) {
    const pt = new THREE.Vector3();
    for (let d = BEAM_STEP; d <= range; d += BEAM_STEP) {
        pt.copy(from).addScaledVector(dir, d);
        const c = cellAtWorld(g.dungeon, pt.x, pt.z);
        if (!c || c.sanctuaryZone || projectileBlocked(g, pt)) return Math.max(0, d - BEAM_STEP);
    }
    return range;
}
// 선분 a → b 가 주인공 (발 위치 p, 반지름 r 의 원기둥, 높이 0 ~ 눈 + 0.2) 에 닿는가 (순수 함수, 자체 테스트 대상)
function segmentHitsPlayer(a, b, p, r) {
    const vx = b.x - a.x, vz = b.z - a.z, l2 = vx * vx + vz * vz;
    const t = l2 > 1e-9 ? clamp(((p.x - a.x) * vx + (p.z - a.z) * vz) / l2, 0, 1) : 0;
    const x = a.x + vx * t, y = a.y + (b.y - a.y) * t, z = a.z + vz * t;
    return Math.hypot(p.x - x, p.z - z) <= r && y >= p.y - 0.2 && y <= p.y + EYE_HEIGHT + 0.2;
}
function fireBeam(g, m) {
    const a = m.def.attack, from = monsterBeamOrigin(m), dir = m.custom.aimDir;
    if (!dir) return;
    const len = beamLength(g, from, dir, a.range), to = from.clone().addScaledVector(dir, len);
    spawnBeamFlash(g, from, to, 0xd8b0ff);
    if (segmentHitsPlayer(from, to, g.player.pos, PLAYER_RADIUS + BEAM_HIT_RADIUS)) {
        hitPlayer(g, monsterAttacker(m), { kind: 'physical', element: a.element, coef: a.coef, canCrit: false }, a.effect);
    }
}
// 조준선 (가는 선, 공유 도형을 늘려 쓴다). 몬스터마다 하나, 죽거나 지울 때 removeMonsterExtras 가 뺀다
function syncAimLine(g, m) {
    const aiming = m.def.attack.type === 'beam' && m.timers.windup > 0 && m.custom.aimDir && !m.dead;
    if (!aiming) { if (m.custom.aimLine) m.custom.aimLine.visible = false; return; }
    const C = getMonsterCommon();
    if (!m.custom.aimLine) {
        m.custom.aimLine = new THREE.Line(C.aimLineGeo, C.aimLine);
        g.view.group.add(m.custom.aimLine);
    }
    const from = monsterBeamOrigin(m), dir = m.custom.aimDir, line = m.custom.aimLine;
    line.visible = true;
    line.position.copy(from);
    line.quaternion.setFromUnitVectors(AIM_FORWARD, dir);
    line.scale.set(1, 1, Math.max(0.01, beamLength(g, from, dir, m.def.attack.range)));
}
const AIM_FORWARD = new THREE.Vector3(0, 0, -1);
// 몬스터에 붙어 따로 장면에 넣은 물체 (조준선 등) 를 뺀다 (공유 도형·재질이라 dispose 하지 않음)
function removeMonsterExtras(m) {
    if (m.custom && m.custom.aimLine) { m.custom.aimLine.removeFromParent(); m.custom.aimLine = null; }
}

// --- 예약 행동 (10단계): 예고 표시 뒤의 공격, 순간이동 등. 둔화면 그만큼 늦게 흐른다. 몬스터가 죽으면 실행하지 않는다
function monsterSchedule(m, delay, fn) {
    if (!m.custom.timeline) m.custom.timeline = [];
    m.custom.timeline.push({ t: delay, fn });
}
function runMonsterTimeline(g, m, dt) {
    const list = m.custom.timeline;
    for (const it of list) it.t -= dt;
    for (let i = 0; i < list.length; i++) {
        if (list[i].t > 0 || m.dead) continue;
        const it = list.splice(i--, 1)[0];
        it.fn(g, m);
    }
    if (list.length === 0) m.custom.timeline = null;
}
// 몬스터가 설 수 있는 자리: 던전 칸 안, 들어갈 수 없는 칸 (성소 구역·상점 주변) 아님, 벽·시설 상자와 겹치지 않음
function validMonsterSpot(g, x, z, radius) {
    const c = cellAtWorld(g.dungeon, x, z);
    if (!c || monsterBarred(c)) return false;
    return !nearbyBoxes(g.view.collision, x, z).some((b) => circleHitsBox(x, z, radius, b));
}
// 부채꼴 판정: (x, z) 에서 yaw 방향 반각 halfDeg 안, 거리 range (+ 대상 반지름) 안에 점 (px, pz) 가 있는가 (순수 함수)
function inCone(x, z, yaw, range, halfDeg, px, pz, targetRadius = 0) {
    const dx = px - x, dz = pz - z, d = Math.hypot(dx, dz);
    if (d > range + targetRadius) return false;
    if (d < 1e-3) return true;
    return (dx * -Math.sin(yaw) + dz * -Math.cos(yaw)) / d >= Math.cos(halfDeg * Math.PI / 180);
}
// 목표 쪽으로 이동. 시야가 있으면 곧장, 없으면 칸 단위 길찾기 (흐름장) 의 다음 칸 출입구 쪽으로
function monsterMoveTo(g, m, tx, tz, dt, direct, speed) {
    let wx = tx, wz = tz;
    if (!direct) {
        const wp = flowWaypoint(g, m);
        if (wp) { wx = wp.x; wz = wp.z; }
    }
    stepMonster(g, m, wx - m.pos.x, wz - m.pos.z, speed * dt);
}
function stepMonster(g, m, vx, vz, maxStep) {
    const l = Math.hypot(vx, vz);
    if (l < 1e-3 || maxStep <= 0) return;
    const s = Math.min(l, maxStep);
    moveMonsterBy(g, m, (vx / l) * s, (vz / l) * s);
    m.yaw = Math.atan2(-vx, -vz);
    m.custom.moving = true;
}
// 벽 충돌 (주인공과 같은 원-상자) + 들어갈 수 없는 칸 (성소 구역·상점 주변) 에 새로 들어가면 되돌림 + 바닥 높이.
// 보스는 공터 3×3 구역 (m.zone) 밖으로 나가지 않는다 (AGENTS.md "보스", 10-4)
function moveMonsterBy(g, m, mx, mz) {
    const px = m.pos.x, pz = m.pos.z, before = cellAtWorld(g.dungeon, px, pz);
    moveWithCollision(g.view.collision, m.pos, m.radius, mx, mz);
    if (m.zone) {
        const zn = m.zone, r = Math.min(m.radius, (zn.maxX - zn.minX) / 2 - 0.1);
        m.pos.x = clamp(m.pos.x, zn.minX + r, zn.maxX - r);
        m.pos.z = clamp(m.pos.z, zn.minZ + r, zn.maxZ - r);
    }
    const after = cellAtWorld(g.dungeon, m.pos.x, m.pos.z);
    if (!after || (monsterBarred(after) && !(before && monsterBarred(before)))) { m.pos.x = px; m.pos.z = pz; }
    placeMonsterOnFloor(g, m);
}
// 주인공 칸에서 시작하는 칸 단위 BFS 거리 (흐름장). 들어갈 수 없는 칸은 지나가지 않는다 (시작 칸은 예외). 주인공 칸이 바뀔 때만 다시 계산
function updateFlowField(g) {
    const c = g.currentCell;
    if (!c) return;
    const key = cellKey(c.gx, c.gz);
    if (g.flow && g.flow.key === key && g.flow.dungeon === g.dungeon) return;
    g.flow = { key, dungeon: g.dungeon, dist: cellDistances(g.dungeon, key) };
}
function cellDistances(d, startKey) { return cellBfs(d, startKey).dist; }
// 칸 단위 BFS (wall 이 아닌 변으로 이어진 칸, 몬스터가 들어갈 수 없는 칸 (성소 구역·상점 주변) 은 지나가지 않음 — 시작 칸은 예외).
// maxSteps 칸까지만, pass(cell, key) 가 있으면 그 함수가 true 인 칸만 지나간다. 반환: { dist: Map<키, 칸 수>, prev: Map<키, 이전 칸 키 | null> }
function cellBfs(d, startKey, maxSteps = Infinity, pass = null) {
    const dist = new Map([[startKey, 0]]), prev = new Map([[startKey, null]]), queue = [startKey];
    for (let i = 0; i < queue.length; i++) {
        const c = d.cells.get(queue[i]), dk = dist.get(queue[i]);
        if (!c || dk >= maxSteps) continue;
        for (const dir of DIR_KEYS) {
            if (c.edges[dir] === 'wall') continue;
            const nk = cellKey(c.gx + DIR_DELTA[dir][0], c.gz + DIR_DELTA[dir][1]), n = d.cells.get(nk);
            if (!n || dist.has(nk) || monsterBarred(n) || (pass && !pass(n, nk))) continue;
            dist.set(nk, dk + 1);
            prev.set(nk, queue[i]);
            queue.push(nk);
        }
    }
    return { dist, prev };
}
// BFS 의 prev 로 시작 칸 → toKey 칸 키 배열
function pathFromPrev(prev, toKey) {
    const path = [];
    for (let k = toKey; k !== null && k !== undefined; k = prev.get(k)) path.push(k);
    return path.reverse();
}
// 칸 경계 가운데 (출입구) 를 0.6m 넘은 점. 경계에 정확히 멈춰 칸이 바뀌지 않는 일을 막는다
function edgeWaypoint(c, dir) {
    const ctr = cellCenter(c), [dx, dz] = DIR_DELTA[dir], k = CELL_SIZE / 2 + 0.6;
    return { x: ctr.x + dx * k, z: ctr.z + dz * k };
}
function flowWaypoint(g, m) {
    const c = cellAtWorld(g.dungeon, m.pos.x, m.pos.z);
    if (!c || !g.flow) return null;
    const dk = g.flow.dist.get(cellKey(c.gx, c.gz));
    if (dk === undefined || dk === 0) return null;   // 같은 칸이거나 길이 없음 → 곧장
    for (const dir of DIR_KEYS) {
        if (c.edges[dir] === 'wall') continue;
        if (g.flow.dist.get(cellKey(c.gx + DIR_DELTA[dir][0], c.gz + DIR_DELTA[dir][1])) === dk - 1) return edgeWaypoint(c, dir);
    }
    return null;
}
// 칸 경로 (BFS, 들어갈 수 없는 칸 (성소 구역·상점 주변) 은 끝 칸만 허용). 반환: 칸 키 배열 (시작 → 끝) 또는 null
function findCellPath(d, fromKey, toKey) {
    if (!d.cells.has(fromKey)) return null;   // (안전장치) 시작점이 던전 칸 밖
    const prev = new Map([[fromKey, null]]), queue = [fromKey];
    for (let i = 0; i < queue.length && !prev.has(toKey); i++) {
        const c = d.cells.get(queue[i]);
        for (const dir of DIR_KEYS) {
            if (c.edges[dir] === 'wall') continue;
            const nk = cellKey(c.gx + DIR_DELTA[dir][0], c.gz + DIR_DELTA[dir][1]), n = d.cells.get(nk);
            if (!n || prev.has(nk) || (monsterBarred(n) && nk !== toKey)) continue;
            prev.set(nk, queue[i]);
            queue.push(nk);
        }
    }
    return prev.has(toKey) ? pathFromPrev(prev, toKey) : null;
}
function cellKeyAtWorld(x, z) { return cellKey(Math.floor(x / CELL_SIZE), Math.floor(z / CELL_SIZE)); }
// 추적 포기 → 추적을 시작한 자리 (home, 없으면 생성 위치) 로 돌아간다 (AGENTS.md "원래 위치", U33).
// 돌아가는 동안 초당 최대 HP 5% 회복, 도착하면 다시 대기 (배회)
function returnTarget(m) { return m.home || m.spawn; }
function startReturn(g, m) {
    const to = returnTarget(m);
    m.state = 'return';
    m.timers.windup = 0;
    m.custom.returnT = 0;
    m.path = findCellPath(g.dungeon, cellKeyAtWorld(m.pos.x, m.pos.z), cellKeyAtWorld(to.x, to.z));
}
function monsterReturn(g, m, dt) {
    const to = returnTarget(m);
    m.hp = Math.min(m.maxHp, m.hp + (m.maxHp * MONSTER_RETURN_HEAL_PCT / 100) * dt);
    m.custom.returnT += dt;
    const wp = pathWaypoint(g, m, to.x, to.z);
    stepMonster(g, m, wp.x - m.pos.x, wp.z - m.pos.z, monsterSpeed(m) * dt);
    const home = Math.hypot(to.x - m.pos.x, to.z - m.pos.z) < 0.6;
    if (home || m.custom.returnT > MONSTER_RETURN_TIMEOUT || m.def.speed <= 0) {
        if (!home) { m.pos.x = to.x; m.pos.z = to.z; placeMonsterOnFloor(g, m); }
        m.state = 'idle';
        m.path = null;
        m.home = null;
        m.timers.wander = 1 + Math.random() * 2;
    }
}
// 칸 경로 m.path 를 따라 (tx, tz) 로 갈 때의 다음 지점: 끝 칸이 아니면 다음 칸 쪽 출입구, 끝 칸이면 목표 그 자체.
// 경로를 벗어났으면 (밀려남 등) 지금 칸에서 경로를 다시 찾는다
function pathWaypoint(g, m, tx, tz) {
    const here = cellKeyAtWorld(m.pos.x, m.pos.z);
    if (!m.path || !g.dungeon.cells.has(here)) return { x: tx, z: tz };
    let i = m.path.indexOf(here);
    if (i < 0) {
        m.path = findCellPath(g.dungeon, here, m.path[m.path.length - 1]);
        if (!m.path) return { x: tx, z: tz };
        i = 0;
    }
    if (i >= m.path.length - 1) return { x: tx, z: tz };
    const c = g.dungeon.cells.get(here), next = m.path[i + 1];
    const dir = DIR_KEYS.find((k) => cellKey(c.gx + DIR_DELTA[k][0], c.gz + DIR_DELTA[k][1]) === next);
    return dir ? edgeWaypoint(c, dir) : { x: tx, z: tz };
}

// --- 배회 (대기 상태, 2026-10-22 사용자 지시 U33): 생성 칸에서 WANDER_RANGE_CELLS 칸 안 (공터 둥지는 그 공터 3×3 안) 을 칸 단위로 옮겨 다닌다.
// 주인공이 보이면 (감지 14m + 시야) 다가가 공격한다 (updateMonster). 배회 방식은 몬스터마다 다르다 (MONSTER_WANDER):
//   speed = 이동 속도 대비 배회 속도, pause = 한 구간을 간 뒤 쉬는 시간 [최소, 최대] 초, leg = 한 번에 옮겨 가는 칸 수 [최소, 최대] (0 = 지금 칸 안)
//   표에 없으면 배회하지 않는다 (포자 버섯: 움직이지 않음, 보스). 무리 (고블린·박쥐) 는 우두머리가 정한 칸으로 함께 간다
const MONSTER_WANDER = {
    br_shade: { speed: 0.45, pause: [1, 3], leg: [2, 5] },        // 소리 없이 넓게 떠돈다
    br_mannequin: { speed: 0.3, pause: [5, 10], leg: [1, 3] },    // 오래 서 있다가 자리를 옮긴다 (보고 있으면 멈춤은 MONSTER_BEHAVIORS)
    br_lamp: { speed: 0.6, pause: [2, 4], leg: [1, 2] },          // 천천히 떠다닌다
    br_mold: { speed: 0.5, pause: [3, 6], leg: [0, 1] },          // 느릿느릿 기어 다닌다
    bk_goblin: { speed: 0.4, pause: [2, 4], leg: [2, 4] },        // 무리 지어 돌아다닌다
    bk_archer: { speed: 0.5, pause: [3, 6], leg: [2, 4] },        // 순찰
    bk_orc: { speed: 0.45, pause: [4, 7], leg: [1, 3] },
    bk_shaman: { speed: 0.4, pause: [3, 6], leg: [1, 3] },
    cv_bat: { speed: 0.45, pause: [0.5, 1.5], leg: [1, 3] },      // 쉬지 않고 날아다닌다 (무리)
    cv_spider: { speed: 0.7, pause: [2, 5], leg: [1, 2] },        // 재빨리 움직였다가 멈춘다
    cv_golem: { speed: 0.5, pause: [6, 10], leg: [0, 2] },        // 거의 움직이지 않는다
    lv_imp: { speed: 0.45, pause: [1, 2.5], leg: [1, 3] },        // 이리저리 날아다닌다
    lv_slime: { speed: 0.5, pause: [2, 4], leg: [1, 2] },
    lv_golem: { speed: 0.45, pause: [6, 10], leg: [0, 2] },
    lv_salamander: { speed: 0.5, pause: [1.5, 4], leg: [2, 4] },  // 짧게 뛰어다닌다
    vd_watcher: { speed: 0.4, pause: [2, 5], leg: [1, 3] },
    vd_stalker: { speed: 0.45, pause: [1, 3], leg: [3, 6] },      // 사냥감을 찾아 넓게 돌아다닌다
    vd_jelly: { speed: 0.5, pause: [0, 1], leg: [1, 2] },         // 쉬지 않고 천천히 떠다닌다
    vd_sentinel: { speed: 0.4, pause: [5, 9], leg: [1, 3] },      // 순찰하다 오래 멈춰 선다
};
function randomPause(style) { return lerp(style.pause[0], style.pause[1], Math.random()); }
function monsterWander(g, m, dt) {
    const style = MONSTER_WANDER[m.typeId];
    if (!style || m.def.speed <= 0 || !g.dungeon) return;
    if (m.custom.wanderInit === undefined) {   // 처음 쉬는 시간은 무작위 (모두 한꺼번에 움직이지 않게)
        m.custom.wanderInit = true;
        m.timers.wander = Math.random() * style.pause[1];
    }
    if (!m.wanderTo) {
        if (wanderLeaderOf(g, m) !== m) return;   // 무리를 따르는 몬스터는 우두머리가 칸을 정해 줄 때까지 기다린다
        m.timers.wander -= dt;
        if (m.timers.wander > 0) return;
        if (!planWanderLeg(g, m)) { m.timers.wander = randomPause(style); return; }
    }
    m.custom.wanderT += dt;
    const to = m.wanderTo;
    if (Math.hypot(to.x - m.pos.x, to.z - m.pos.z) < 0.4 || m.custom.wanderT > m.custom.wanderLimit) {
        m.wanderTo = null;
        m.path = null;
        m.timers.wander = randomPause(style);
        return;
    }
    const wp = pathWaypoint(g, m, to.x, to.z);
    stepMonster(g, m, wp.x - m.pos.x, wp.z - m.pos.z, monsterSpeed(m) * style.speed * dt);
}
// 무리 지어 배회하는가 (무리 종류로 함께 생성된 몬스터. 공터 둥지는 같은 무리여도 따로 배회)
function wandersAsPack(m) { return !!m.groupId && !!m.def.group && !m.nest; }
// 무리별 우두머리 = 대기 중인 같은 무리 중 uid 가 가장 작은 몬스터 (updateMonsters 가 프레임마다 g.wanderLeaders 로)
function wanderLeaders(monsters) {
    const out = new Map();
    for (const m of monsters) {
        if (m.dead || m.state !== 'idle' || !wandersAsPack(m)) continue;
        const cur = out.get(m.groupId);
        if (!cur || m.uid < cur.uid) out.set(m.groupId, m);
    }
    return out;
}
function wanderLeaderOf(g, m) {
    const leader = wandersAsPack(m) && g.wanderLeaders ? g.wanderLeaders.get(m.groupId) : null;
    return leader || m;
}
// 다음 배회 구간: 지금 칸에서 leg 칸 수만큼 떨어진 배회 범위 안의 칸 중 무작위 (범위 안의 칸만 지나감).
// 범위 밖에 있으면 (넉백·공포 등) 생성 칸으로 돌아간다. 무리의 우두머리면 같은 무리의 대기 몬스터도 같은 칸으로. 반환: 정했는가
function planWanderLeg(g, m) {
    const d = g.dungeon, here = cellKeyAtWorld(m.pos.x, m.pos.z), style = MONSTER_WANDER[m.typeId];
    if (!d.cells.has(here)) return false;
    const area = wanderArea(g, m);
    let key, path;
    if (area.has(here)) {
        const bfs = cellBfs(d, here, style.leg[1], (c, k) => area.has(k));
        const all = [...bfs.dist];
        const far = all.filter(([, n]) => n >= style.leg[0]), picks = far.length > 0 ? far : all;
        [key] = picks[Math.floor(Math.random() * picks.length)];
        path = pathFromPrev(bfs.prev, key);
    } else {
        key = cellKeyAtWorld(m.spawn.x, m.spawn.z);
        path = findCellPath(d, here, key);
        if (!path) return false;
    }
    setWanderGoal(g, m, key, path);
    if (wandersAsPack(m)) {
        for (const o of g.monsters) {
            if (o === m || o.dead || o.groupId !== m.groupId || o.state !== 'idle' || !wandersAsPack(o)) continue;
            const ok = cellKeyAtWorld(o.pos.x, o.pos.z);
            const bfs = d.cells.has(ok) ? cellBfs(d, ok, Infinity, (c, k) => area.has(k) || k === key) : null;
            if (bfs && bfs.prev.has(key)) setWanderGoal(g, o, key, pathFromPrev(bfs.prev, key));
        }
    }
    return true;
}
// 배회 목표 = 그 칸 안의 무작위 지점. 시간 제한 = 경로 길이를 배회 속도로 걷는 시간 × 1.5 + 4초 (막히면 쉬고 다시 정함)
function setWanderGoal(g, m, key, path) {
    const style = MONSTER_WANDER[m.typeId], speed = Math.max(0.3, m.def.speed * (style ? style.speed : 0.5));
    m.wanderTo = wanderSpot(g, g.dungeon.cells.get(key), m.radius);
    m.path = path.length > 1 ? path : null;
    m.custom.wanderT = 0;
    m.custom.wanderLimit = 4 + (path.length * CELL_SIZE / speed) * 1.5;
}
// 칸 안에서 몬스터가 설 수 있는 무작위 지점 (벽·시설 상자를 피한다. 못 찾으면 마지막 후보)
function wanderSpot(g, cell, radius) {
    let p = null;
    for (let i = 0; i < 6; i++) {
        p = randomWalkPoint(cell, Math.random, radius + 0.4);
        if (validMonsterSpot(g, p.x, p.z, radius)) return p;
    }
    return p;
}
// 배회 범위 (칸 키 Set). 생성 칸마다 한 번 계산해 층이 바뀔 때까지 둔다
function wanderArea(g, m) {
    if (!g.wanderAreas || g.wanderAreas.dungeon !== g.dungeon) g.wanderAreas = { dungeon: g.dungeon, byKey: new Map() };
    const spawnKey = cellKeyAtWorld(m.spawn.x, m.spawn.z), id = (m.nest ? 'nest:' : '') + spawnKey;
    let area = g.wanderAreas.byKey.get(id);
    if (!area) g.wanderAreas.byKey.set(id, area = wanderAreaCells(g.dungeon, spawnKey, m.nest));
    return area;
}
// 배회 범위 (순수 함수, 자체 테스트 대상): 생성 칸에서 몬스터가 생성될 수 있는 칸 (canSpawnMonsterIn: 성소 구역·상인 방·계단·포탈 제외) 만
// 지나 WANDER_RANGE_CELLS 칸 안에 닿는 칸. 공터 둥지 (nest) 는 그 공터의 3×3 구역 칸. 생성 칸이 생성 금지 칸이면 (디버그 몬스터) 그 칸은 뺀다
function wanderAreaCells(d, spawnKey, nest) {
    const start = d.cells.get(spawnKey);
    if (!start) return new Set();
    if (nest && start.pieceType === 'clearing' && start.shape === 'room') {
        return new Set(d.pieces[start.pieceId].cells.filter((k) => d.cells.get(k).shape === 'room'));
    }
    const area = new Set(cellBfs(d, spawnKey, WANDER_RANGE_CELLS, (c) => canSpawnMonsterIn(c)).dist.keys());
    if (!canSpawnMonsterIn(start)) area.delete(spawnKey);
    return area;
}
// 몬스터끼리 겹치면 서로 밀어내고, 주인공과 겹치면 몬스터만 밀어낸다 (8-4)
function separateMonsters(g) {
    const p = g.player.pos, list = g.monsters.filter((m) => !m.dead && (m.state !== 'idle' || Math.hypot(p.x - m.pos.x, p.z - m.pos.z) < MONSTER_ACTIVE_DIST));
    for (let i = 0; i < list.length; i++) {
        const a = list[i];
        for (let j = i + 1; j < list.length; j++) {
            const b = list[j], dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z, d = Math.hypot(dx, dz), min = a.radius + b.radius;
            if (d >= min) continue;
            const nx = d > 1e-4 ? dx / d : 1, nz = d > 1e-4 ? dz / d : 0;
            const wa = a.isBoss ? 0 : b.isBoss ? 1 : 0.5;   // 보스는 밀리지 않는다 (용암 군주는 제자리 고정)
            if (wa > 0) moveMonsterBy(g, a, -nx * (min - d) * wa, -nz * (min - d) * wa);
            if (wa < 1) moveMonsterBy(g, b, nx * (min - d) * (1 - wa), nz * (min - d) * (1 - wa));
        }
        const dx = a.pos.x - p.x, dz = a.pos.z - p.z, d = Math.hypot(dx, dz), min = a.radius + PLAYER_RADIUS;
        if (d >= min) continue;
        const nx = d > 1e-4 ? dx / d : 1, nz = d > 1e-4 ? dz / d : 0;
        if (a.isBoss) moveWithCollision(g.view.collision, p, PLAYER_RADIUS, -nx * (min - d), -nz * (min - d));   // 보스는 밀리지 않고 주인공을 밀어낸다
        else moveMonsterBy(g, a, nx * (min - d), nz * (min - d));
    }
}
// 넉백 (8-10): 0.2초 동안 dist 만큼 밀려남 (벽 충돌 적용). 넉백 면역이면 무시. 14단계 스킬이 쓴다
function knockMonster(m, fromX, fromZ, dist) {
    if (m.def.knockbackImmune || dist <= 0) return;
    const dx = m.pos.x - fromX, dz = m.pos.z - fromZ, l = Math.hypot(dx, dz) || 1;
    m.knockVel.x = (dx / l) * dist / MONSTER_KNOCK_TIME;
    m.knockVel.z = (dz / l) * dist / MONSTER_KNOCK_TIME;
    m.timers.knock = MONSTER_KNOCK_TIME;
    m.timers.windup = 0;
}

// --- 백룸 특수 행동 (8-6, AGENTS.md "특징" 열). onUpdate 가 false 를 돌려주면 그 프레임의 행동을 모두 건너뛴다
const SHADE_FADE_DIST = 6, SHADE_MIN_OPACITY = 0.25;
const MANNEQUIN_GAZE_DEG = 50;
const MOLD_SPORE = { radius: 3, duration: 4, tick: 0.5, coefPerSec: 20 };
// 주인공이 몬스터를 보고 있는가: 카메라 앞 (수평) 과 몬스터 방향 사이 ≤ 50° + 시야 확보
function playerLooksAt(g, m, dist) {
    const p = g.player, fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw), dx = m.pos.x - p.pos.x, dz = m.pos.z - p.pos.z;
    if (dist > 0.01 && (dx * fx + dz * fz) / dist < Math.cos(MANNEQUIN_GAZE_DEG * Math.PI / 180)) return false;
    return hasLineOfSight(g, p.pos.x, p.pos.y + EYE_HEIGHT, p.pos.z, m.pos.x, monsterCenterY(m), m.pos.z);
}
const MONSTER_BEHAVIORS = {
    br_shade: {
        onUpdate(g, m, dt, dist) {
            m.custom.opacity = dist >= SHADE_FADE_DIST ? SHADE_MIN_OPACITY
                : SHADE_MIN_OPACITY + (1 - SHADE_MIN_OPACITY) * (SHADE_FADE_DIST - dist) / SHADE_FADE_DIST;
        },
    },
    br_mannequin: {
        onUpdate(g, m, dt, dist) {
            m.custom.frozen = playerLooksAt(g, m, dist);   // 보고 있으면 이동·공격·애니메이션·공격 타이머 모두 멈춘다
            return !m.custom.frozen;
        },
    },
    br_mold: {
        onDeath(g, m) {   // 반경 3m 포자 구름 4초, 주인공에게만 초당 공격력 20% 독
            const attacker = monsterAttacker(m);
            createGroundZone(g, {
                x: m.pos.x, z: m.pos.z, radius: MOLD_SPORE.radius, duration: MOLD_SPORE.duration, tick: MOLD_SPORE.tick,
                onTick: (gg, zone) => {
                    const p = gg.player.pos;
                    if (Math.hypot(p.x - zone.x, p.z - zone.z) > zone.radius) return;
                    hitPlayer(gg, attacker, { kind: 'physical', element: 'poison', coef: MOLD_SPORE.coefPerSec * MOLD_SPORE.tick, canCrit: false }, null);
                },
            });
        },
    },
    // --- 판타지 벽돌벽 (10-1). 고블린 (무리)·해골 궁수 (거리 유지)·오크 전사 (예비 동작 0.6초 + 넉백) 는 데이터와 공통 행동만으로 동작
    bk_shaman: {
        onChase(g, m, dt) {   // 8초마다 주위 10m 의 아군 (자신 포함) HP 15% 회복. 다친 아군이 없으면 기다렸다가 바로 쓴다
            m.custom.healT = (m.custom.healT || 0) - dt;
            if (m.custom.healT > 0) return false;
            const allies = g.monsters.filter((o) => !o.dead && o.hp < o.maxHp && Math.hypot(o.pos.x - m.pos.x, o.pos.z - m.pos.z) <= SHAMAN_HEAL.radius);
            if (allies.length === 0) return false;
            m.custom.healT = SHAMAN_HEAL.interval;
            spawnRing(g, m.pos.x, m.pos.z, SHAMAN_HEAL.radius, 0x5aff6a, 0.6);
            for (const o of allies) {
                const n = (o.maxHp * SHAMAN_HEAL.pct) / 100;
                o.hp = Math.min(o.maxHp, o.hp + n);
                spawnPuff(g, o.pos.x, monsterCenterY(o), o.pos.z, 0x5aff6a, o.radius + 0.5, 0.6);   // 초록 빛
                spawnFloatingText(g, o.pos.x, monsterCenterY(o) + o.height * 0.5 + 0.2, o.pos.z, '+' + Math.round(n), '#7aff8a', 0.8);
            }
            return false;
        },
    },
    // --- 동굴 (10-1). 바위 골렘 (예비 동작 0.7초 + 기절 0.5초, 넉백 면역) 은 데이터대로
    cv_bat: {
        onUpdate(g, m, dt, dist) {   // 높이 1.5~3m 에서 출렁이며 난다. 주인공에게 붙어 공격할 때는 낮게 내려온다
            const low = m.state === 'chase' && (m.timers.windup > 0 || dist < 4);
            const wave = 0.5 + 0.5 * Math.sin((m.custom.animT || 0) * 1.4 + m.uid);
            const target = low ? BAT_FLY.min : BAT_FLY.min + (BAT_FLY.max - BAT_FLY.min) * wave;
            const cur = m.custom.hoverY === undefined ? target : m.custom.hoverY;
            m.custom.hoverY = cur + (target - cur) * Math.min(1, dt * 3);
            placeMonsterOnFloor(g, m);
        },
        onAttack(g, m) { m.custom.retreatT = BAT_FLY.retreat; },
        onChase(g, m, dt) {   // 공격 후 1초 동안 주인공 반대쪽으로 물러났다가 다시 접근
            if (!(m.custom.retreatT > 0)) return false;
            m.custom.retreatT -= dt;
            const p = g.player.pos;
            stepMonster(g, m, m.pos.x - p.x, m.pos.z - p.z, monsterSpeed(m) * dt);
            return true;
        },
    },
    cv_spider: {
        onChase(g, m, dt, dist, canSee) {   // 6초마다 거미줄 (12m, 피해 없음, 맞으면 둔화 50% 2초 — 냉기가 아니므로 저항으로 줄지 않음)
            m.custom.webT = (m.custom.webT === undefined ? Math.random() * SPIDER_WEB.interval : m.custom.webT) - dt;
            if (m.custom.webT > 0 || !canSee || dist > SPIDER_WEB.range) return false;
            m.custom.webT = SPIDER_WEB.interval;
            const from = monsterShotOrigin(m);
            launchMonsterShot(g, m, from, aimAtPlayer(g, from), {
                speed: SPIDER_WEB.speed, range: SPIDER_WEB.range, element: 'physical', look: 'web', radius: 0.25,
                onPlayerHit: (gg) => applyStatusToPlayer(gg, 'slow', { duration: SPIDER_WEB.duration, magnitude: SPIDER_WEB.slowPct, resPct: 0 }),
            });
            return false;
        },
    },
    cv_spore: {
        onDeath(g, m) {   // 죽을 때 반경 4m 포자 폭발 (공격력 100% 독). 살아 있을 때의 포자 구름은 범위 공격 (resolveAura)
            spawnPuff(g, m.pos.x, m.pos.y + 0.8, m.pos.z, 0xb080e0, SPORE_BURST.radius, 0.6);
            const p = g.player.pos;
            if (Math.hypot(p.x - m.pos.x, p.z - m.pos.z) > SPORE_BURST.radius + PLAYER_RADIUS) return;
            hitPlayer(g, monsterAttacker(m), { kind: 'physical', element: 'poison', coef: SPORE_BURST.coef, canCrit: false }, null);
        },
    },
    // --- 용암 동굴 (10-1). 흑요석 골렘의 충격파는 데이터 (attack.shockwave) → monsterShockwave
    lv_imp: {
        onHit(g, m) {   // 맞으면 4m 순간이동 (10초에 한 번). 벽 너머·성소·벽 안으로는 가지 않는다
            if (g.time < (m.custom.blinkAt || 0)) return;
            const start = Math.random() * Math.PI * 2, y = monsterCenterY(m);
            for (let i = 0; i < 8; i++) {
                const a = start + (i * Math.PI) / 4, x = m.pos.x + Math.cos(a) * IMP_BLINK.dist, z = m.pos.z + Math.sin(a) * IMP_BLINK.dist;
                if (!validMonsterSpot(g, x, z, m.radius) || !hasLineOfSight(g, m.pos.x, y, m.pos.z, x, y, z)) continue;
                spawnPuff(g, m.pos.x, y, m.pos.z, 0xff8a3a, 0.9, 0.4);
                m.pos.x = x;
                m.pos.z = z;
                placeMonsterOnFloor(g, m);
                spawnPuff(g, x, monsterCenterY(m), z, 0xff8a3a, 0.9, 0.4);
                m.custom.blinkAt = g.time + IMP_BLINK.cooldown;
                return;
            }
        },
    },
    lv_slime: {
        onDeath(g, m) {   // 작은 마그마 슬라임 2마리로 분열 (크기 ×0.6, HP ×0.4, 경험치·골드 ×0.3). 작은 것은 다시 분열하지 않는다
            if (m.small) return;
            for (let i = 0; i < SLIME_SPLIT_COUNT; i++) {
                const a = m.yaw + Math.PI / 2 + i * Math.PI;
                const c = createMonsterState('lv_slime', m.level, {
                    x: m.pos.x + Math.cos(a) * 0.7, z: m.pos.z + Math.sin(a) * 0.7, yaw: m.yaw, small: true,
                    groupId: m.groupId, nest: m.nest, spawnX: m.spawn.x, spawnZ: m.spawn.z,
                });
                resolveCircleVsBoxes(c.pos, c.radius, nearbyBoxes(g.view.collision, c.pos.x, c.pos.z));
                if (!validMonsterSpot(g, c.pos.x, c.pos.z, 0)) { c.pos.x = m.pos.x; c.pos.z = m.pos.z; }
                placeMonsterOnFloor(g, c);
                c.state = 'chase';
                c.lastSeenAt = g.time;
                g.monsters.push(c);
            }
        },
    },
    lv_salamander: {
        onChase(g, m, dt, dist, canSee) {   // 6초마다 화염 숨결: 전방 5m · 60°, 1.5초 동안 0.3초마다 공격력 30% 화염 + 화상 (그동안 멈춰서 천천히 돈다)
            const b = SALAMANDER_BREATH, p = g.player.pos;
            if (m.custom.breathT > 0) {
                turnToward(m, p.x, p.z, b.turnRate * dt);
                m.custom.breathTick -= dt;
                if (m.custom.breathTick <= 0 && m.custom.breathLeft > 0) {
                    m.custom.breathTick += b.tick;
                    m.custom.breathLeft--;
                    salamanderBreathTick(g, m);
                }
                m.custom.breathT -= dt;
                return true;
            }
            m.custom.breathCd = (m.custom.breathCd === undefined ? 1 + Math.random() * 3 : m.custom.breathCd) - dt;
            if (m.custom.breathCd > 0 || !canSee || dist > b.range + PLAYER_RADIUS) return false;
            m.custom.breathCd = b.interval;
            m.custom.breathT = b.duration;
            m.custom.breathTick = 0;
            m.custom.breathLeft = Math.round(b.duration / b.tick);
            faceTo(m, p.x, p.z);
            spawnFlameBreath(g, m, b.duration);
            return true;
        },
    },
    // --- 왜곡된 차원 (10-1). 공허의 눈 (광선) 과 별무리 해파리 (펄스) 는 공격 종류 'beam'·'aura' 의 공통 처리
    vd_stalker: {
        onChase(g, m, dt) {   // 추적 중 8초마다 주인공 뒤 3m 로 순간이동 (0.5초 전 그 자리에 보라색 연기, 벽 안이면 취소)
            if (m.custom.blinkPending) return false;
            m.custom.tpT = (m.custom.tpT === undefined ? STALKER_BLINK.interval : m.custom.tpT) - dt;
            if (m.custom.tpT > 0) return false;
            const p = g.player, x = p.pos.x + Math.sin(p.yaw) * STALKER_BLINK.behind, z = p.pos.z + Math.cos(p.yaw) * STALKER_BLINK.behind;
            const ok = (gg) => validMonsterSpot(gg, x, z, m.radius) && hasLineOfSight(gg, gg.player.pos.x, gg.player.pos.y + 1, gg.player.pos.z, x, gg.player.pos.y + 1, z);
            if (!ok(g)) { m.custom.tpT = 1; return false; }   // 그 자리가 벽 안·벽 너머면 이번에는 취소하고 1초 뒤 다시
            m.custom.tpT = STALKER_BLINK.interval;
            m.custom.blinkPending = true;
            spawnPuff(g, x, p.pos.y + 1, z, 0x8a40e0, 0.9, STALKER_BLINK.warn + 0.3);
            monsterSchedule(m, STALKER_BLINK.warn, (gg, mm) => {
                mm.custom.blinkPending = false;
                if (mm.state !== 'chase' || !ok(gg)) return;
                spawnPuff(gg, mm.pos.x, mm.pos.y + 1, mm.pos.z, 0x8a40e0, 0.8, 0.4);
                mm.pos.x = x;
                mm.pos.z = z;
                placeMonsterOnFloor(gg, mm);
                faceTo(mm, gg.player.pos.x, gg.player.pos.z);
            });
            return false;
        },
    },
    vd_sentinel: {
        onUpdate(g, m, dt) { if (m.custom.blockT > 0) m.custom.blockT -= dt; },
        modifyDamage(g, m) {   // 정면 ±60° 에서 오는 공격을 25% 확률로 방패로 막아 피해 70% 감소 (방패 번쩍)
            const p = g.player.pos;
            if (!inCone(m.pos.x, m.pos.z, m.yaw, Infinity, SENTINEL_BLOCK.arcDeg / 2, p.x, p.z)) return 1;
            if (Math.random() * 100 >= SENTINEL_BLOCK.chance) return 1;
            m.custom.blockT = 0.25;
            spawnFloatingText(g, m.pos.x, m.pos.y + m.height + 0.6, m.pos.z, t('combat.block'), '#d8e4ff', 0.8, true);
            return 1 - SENTINEL_BLOCK.reductionPct / 100;
        },
    },
};
// 특수 행동 수치 (AGENTS.md "테마별 몬스터" 의 특징 열). AGENTS.md 에 없는 값: 거미줄 속도 16 m/s, 숨결 중 회전 속도 (U28)
const SHAMAN_HEAL = { interval: 8, radius: 10, pct: 15 };
const BAT_FLY = { min: 1.5, max: 3, retreat: 1 };
const SPIDER_WEB = { interval: 6, range: 12, speed: 16, slowPct: 50, duration: 2 };
const SPORE_BURST = { radius: 4, coef: 100 };
const IMP_BLINK = { dist: 4, cooldown: 10 };
const SLIME_SPLIT_COUNT = 2;
const SALAMANDER_BREATH = { interval: 6, range: 5, angleDeg: 60, duration: 1.5, tick: 0.3, coef: 30, turnRate: 1.2 };
const STALKER_BLINK = { interval: 8, behind: 3, warn: 0.5 };
const SENTINEL_BLOCK = { chance: 25, arcDeg: 120, reductionPct: 70 };
// --- 보스 (10-4·10-5, AGENTS.md "보스"). 상태: 'idle' (자리에서 대기) → 'chase' (전투: 패턴 실행) → 'return' (자리로 돌아감).
// 대기·돌아가는 동안 초당 최대 HP 2% 회복. 보스 공터 3×3 구역 (m.zone) 에 주인공이 들어오면 전투 시작, 구역 밖으로는 나가지 않는다 (moveMonsterBy).
// 구역이 없는 보스 (디버그 &monster=br_boss 등) 는 감지 거리 + 시야로 전투한다
const BOSS_LEASH_TIME = 10;     // 주인공이 구역을 벗어난 뒤 이 시간이 지나면 돌아간다
const BOSS_HEAL_PCT = 2;        // 돌아가는 동안 초당 최대 HP %
const BOSS_APPROACH = 3.5;      // 주인공과 이 거리 (중심끼리, 몸이 겹치지 않는 한) 까지 다가간다. "4m 안이면" 패턴이 나오도록. 공격은 패턴으로만
const BOSS_DASH_SPEED = 24;     // 간수장 돌진 속도 (m/s)
const BOSS_SHOT_RANGE = 40;     // 보스 투사체 최대 거리
// 보스 공터 3×3 구역의 월드 범위 (벽 두께만큼 안쪽). 보스 층이 아니면 null
function bossZoneOf(d) {
    if (d.bossPieceId === null || d.bossPieceId === undefined) return null;
    const piece = d.pieces[d.bossPieceId];
    let minGx = Infinity, maxGx = -Infinity, minGz = Infinity, maxGz = -Infinity;
    for (const k of piece.cells) {
        const c = d.cells.get(k);
        if (c.shape !== 'room') continue;
        minGx = Math.min(minGx, c.gx); maxGx = Math.max(maxGx, c.gx);
        minGz = Math.min(minGz, c.gz); maxGz = Math.max(maxGz, c.gz);
    }
    return {
        pieceId: piece.id, minX: minGx * CELL_SIZE + WALL_T, maxX: (maxGx + 1) * CELL_SIZE - WALL_T,
        minZ: minGz * CELL_SIZE + WALL_T, maxZ: (maxGz + 1) * CELL_SIZE - WALL_T,
    };
}
function inBossZone(d, zone, x, z) {
    const c = cellAtWorld(d, x, z);
    return !!c && c.pieceId === zone.pieceId && c.shape === 'room';
}
// 보스가 보스 공터 안에서 생성 (또는 복원) 되었으면 그 구역에 묶는다
function attachBossZone(g, m) {
    const zone = bossZoneOf(g.dungeon);
    m.zone = zone && inBossZone(g.dungeon, zone, m.spawn.x, m.spawn.z) ? zone : null;
}
// 전투 조건: 주인공이 구역 (3×3) 안. 구역이 없으면 감지 거리 안 + 시야
function bossEngaged(g, m, dist) {
    if (!playerTargetable(g)) return false;
    if (m.zone) return !!g.currentCell && g.currentCell.pieceId === m.zone.pieceId && g.currentCell.shape === 'room';
    const p = g.player.pos;
    return dist <= MONSTER_SIGHT && hasLineOfSight(g, m.pos.x, monsterEyeY(m), m.pos.z, p.x, p.y + EYE_HEIGHT, p.z);
}
// 전투 시작: 패턴 재사용 시간 (처음은 first, 없으면 재사용 시간의 절반) + 화면 위쪽 HP 막대 (g.bossFight)
function startBossFight(g, m) {
    m.state = 'chase';
    m.lastSeenAt = g.time;
    m.custom.outT = 0;
    if (!m.custom.cd) {
        m.custom.cd = {};
        for (const pt of BOSS_PATTERNS[m.typeId] || []) m.custom.cd[pt.name] = pt.first !== undefined ? pt.first : pt.cooldown / 2;
        m.custom.busy = 0;
    }
    g.bossFight = m;
}
// 패턴 실행기 (10-4): 패턴마다 남은 재사용 시간, 조건이 맞고 0 이면 실행. 한 번에 하나만 (run 이 돌려준 시간 동안 다른 패턴 대기, 제자리)
function updateBoss(g, m, dt, dist, slowMul) {
    const p = g.player.pos, sdt = dt * slowMul;
    if (m.custom.selfStun > 0) { m.custom.selfStun -= dt; return; }   // 간수장: 돌진하다 벽에 부딪혀 스스로 기절
    if (m.custom.dash) { updateBossDash(g, m, dt * slowMul); return; }
    const engaged = bossEngaged(g, m, dist);
    if (m.state !== 'chase') {
        m.hp = Math.min(m.maxHp, m.hp + (m.maxHp * BOSS_HEAL_PCT / 100) * dt);
        if (!engaged) { if (m.state === 'return') bossWalkHome(g, m, dt); return; }
    }
    if (g.bossFight !== m) startBossFight(g, m);   // 맞아서 추적 상태가 된 경우도 여기서 시작
    if (engaged) m.custom.outT = 0;
    else if ((m.custom.outT += dt) >= BOSS_LEASH_TIME) {   // 구역을 벗어난 지 10초 → 돌아간다, HP 막대 숨김
        m.state = 'return';
        m.custom.returnT = 0;
        if (g.bossFight === m) g.bossFight = null;
        return;
    }
    const pats = BOSS_PATTERNS[m.typeId] || [];
    for (const pt of pats) m.custom.cd[pt.name] = Math.max(0, m.custom.cd[pt.name] - sdt);
    if (m.custom.busy > 0) { m.custom.busy -= sdt; return; }
    m.custom.pose = null;
    if (playerTargetable(g)) {
        const canSee = hasLineOfSight(g, m.pos.x, monsterEyeY(m), m.pos.z, p.x, p.y + EYE_HEIGHT, p.z);
        for (const pt of pats) {
            if (m.custom.cd[pt.name] > 0 || (pt.condition && !pt.condition(g, m, dist, canSee))) continue;
            m.custom.cd[pt.name] = pt.cooldown;
            m.custom.busy = pt.run(g, m, dist) || 0;
            return;
        }
    }
    if (m.def.speed > 0 && dist > Math.max(BOSS_APPROACH, m.radius + PLAYER_RADIUS + 0.5)) stepMonster(g, m, p.x - m.pos.x, p.z - m.pos.z, monsterSpeed(m) * dt);
    faceTo(m, p.x, p.z);
}
function bossWalkHome(g, m, dt) {
    const dx = m.spawn.x - m.pos.x, dz = m.spawn.z - m.pos.z;
    m.custom.returnT = (m.custom.returnT || 0) + dt;
    if (Math.hypot(dx, dz) < 0.6 || m.def.speed <= 0 || m.custom.returnT > MONSTER_RETURN_TIMEOUT) {
        m.pos.x = m.spawn.x;
        m.pos.z = m.spawn.z;
        placeMonsterOnFloor(g, m);
        m.state = 'idle';
        return;
    }
    stepMonster(g, m, dx, dz, monsterSpeed(m) * dt);
}
// 간수장 돌진: 정한 방향으로 12m. 경로에서 주인공에게 한 번 공격력 200% 물리 + 기절 1초. 벽 (구역 경계 포함) 에 막히면 스스로 2초 기절
function updateBossDash(g, m, dt) {
    const d = m.custom.dash, step = Math.min(d.left, BOSS_DASH_SPEED * dt), p = g.player.pos;
    const x0 = m.pos.x, z0 = m.pos.z;
    moveMonsterBy(g, m, -Math.sin(d.yaw) * step, -Math.cos(d.yaw) * step);
    m.custom.moving = true;
    d.left -= step;
    if (!d.hit && Math.hypot(p.x - m.pos.x, p.z - m.pos.z) <= m.radius + PLAYER_RADIUS + 0.3) {
        d.hit = true;
        if (bossHit(g, m, 'physical', 200) > 0) applyStatusToPlayer(g, 'stun', { duration: 1 });
    }
    if (step > 0.01 && Math.hypot(m.pos.x - x0, m.pos.z - z0) < step * 0.5) {
        m.custom.dash = null;
        m.custom.selfStun = 2;
        m.custom.pose = null;
        spawnRing(g, m.pos.x, m.pos.z, m.radius + 1.2, 0xd8d8d8, 0.4);
        spawnFloatingText(g, m.pos.x, m.pos.y + m.height + 0.4, m.pos.z, t('combat.stunned'), '#e0e0e0', 1.2, true);
        return;
    }
    if (d.left <= 0) { m.custom.dash = null; m.custom.pose = null; }
}
// 처치 (10-4): 처치 기록 (그 층을 다시 와도 나오지 않음), HP 막대 제거, 토스트. 보상 배수는 monsterRewardMuls, 드롭은 12단계
function onBossDefeated(g, m) {
    if (m.zone) g.state.world.bossDefeated = true;
    if (g.bossFight === m) g.bossFight = null;
    if (g.player.pull && g.player.pull.owner === m) g.player.pull = null;
    g.uiEvents.push({ type: 'bossDefeated', name: localName(m.def) });
}
// --- 보스 패턴 도우미
function yawToPlayer(g, m) { const p = g.player.pos; return Math.atan2(-(p.x - m.pos.x), -(p.z - m.pos.z)); }
// 보스 공격 → 주인공 (공격력 coef% 의 element 피해). 반환: 입힌 피해
function bossHit(g, m, element, coef, effect = null, projectile = false) {
    return hitPlayer(g, monsterAttacker(m), { kind: 'physical', element, coef, canCrit: false, projectile }, effect);
}
// 보스의 근접 패턴 (결재 도장·철퇴 휘두르기·휩쓸기): 근접 공격으로 취급 → 막기·반격 (X2)·가시 갑옷 (D3) 대상 (14단계)
function bossMeleeHit(g, m, coef) {
    return hitPlayer(g, monsterAttacker(m), { kind: 'physical', element: 'physical', coef, canCrit: false, melee: true }, null, { x: m.pos.x, z: m.pos.z, monster: m });
}
function playerInCircle(g, x, z, r) { const p = g.player.pos; return Math.hypot(p.x - x, p.z - z) <= r + PLAYER_RADIUS; }
// 구역 안의 무작위 지점 (구역이 없으면 보스 주위 12m). 벽·시설과 겹치지 않는 곳
function randomBossPoint(g, m, margin) {
    for (let i = 0; i < 20; i++) {
        const zn = m.zone;
        const x = zn ? lerp(zn.minX + margin, zn.maxX - margin, Math.random()) : m.pos.x + (Math.random() * 2 - 1) * 12;
        const z = zn ? lerp(zn.minZ + margin, zn.maxZ - margin, Math.random()) : m.pos.z + (Math.random() * 2 - 1) * 12;
        if (validMonsterSpot(g, x, z, 0.5)) return { x, z };
    }
    return { x: m.pos.x, z: m.pos.z };
}
// 소환 (소환수: 경험치·골드 ×0.2, 아이템 없음). 보스 주위 (구역 안) 에 놓고 곧바로 추적. 반환: 소환한 수
function summonMinions(g, boss, typeId, count, opts = {}) {
    const r0 = MONSTER_TYPES[typeId].radius * (opts.small ? SMALL_MUL.size : 1);
    let made = 0;
    for (let i = 0; i < count * 8 && made < count; i++) {
        const a = Math.random() * Math.PI * 2, r = boss.radius + 1.5 + Math.random() * 3;
        const x = boss.pos.x + Math.cos(a) * r, z = boss.pos.z + Math.sin(a) * r;
        if (!validMonsterSpot(g, x, z, r0) || (boss.zone && !inBossZone(g.dungeon, boss.zone, x, z))) continue;
        const m = createMonsterState(typeId, Math.max(1, boss.level - 1), { x, z, yaw: boss.yaw, isMinion: true, small: !!opts.small, groupId: 900000 + boss.uid });
        placeMonsterOnFloor(g, m);
        m.state = 'chase';
        m.lastSeenAt = g.time;
        g.monsters.push(m);
        spawnPuff(g, x, monsterCenterY(m), z, opts.color || 0x9a9a9a, 1.2, 0.5);
        made++;
    }
    return made;
}
function countMinions(g, typeId) { return g.monsters.filter((o) => !o.dead && o.isMinion && o.typeId === typeId).length; }
// HP 비율이 marks (%) 중 아직 쓰지 않은 값 이하로 떨어졌는가. 맞으면 그 값을 쓴 것으로 표시 (간수장 66%·33% 소환).
// 한 번에 여러 단계를 넘으면 단계마다 한 번씩 (패턴 실행 시간을 사이에 두고) 참이 된다
function bossHpMarkReached(m, marks) {
    if (!m.custom.marksDone) m.custom.marksDone = [];
    const pct = (m.hp / m.maxHp) * 100;
    const mark = marks.find((k) => pct <= k && !m.custom.marksDone.includes(k));
    if (mark === undefined) return false;
    m.custom.marksDone.push(mark);
    return true;
}
// 부채꼴로 여러 발 (서류 폭풍·독침 세례). spreadDeg = 이웃한 두 발 사이 각도
function bossFan(g, m, count, spreadDeg, o) {
    const from = new THREE.Vector3(m.pos.x, monsterCenterY(m) + m.height * 0.2, m.pos.z);
    for (let i = 0; i < count; i++) {
        const off = ((i - (count - 1) / 2) * spreadDeg * Math.PI) / 180;
        launchMonsterShot(g, m, from, aimAtPlayer(g, from, off), { range: BOSS_SHOT_RANGE, ...o });
    }
}
// 화산탄 연출: 예고 끝 0.45초 동안 하늘에서 떨어지는 불덩이 (공유 도형·재질)
function spawnFallingRock(g, x, z, dur) {
    const mesh = new THREE.Mesh(getCommonAssets().geo.sphere, getMonsterCommon().shotMats.fire);
    const floor = floorHeightAt(g.dungeon, x, z), fall = 0.45;
    mesh.scale.setScalar(0.7);
    mesh.visible = false;
    g.view.group.add(mesh);
    g.effects.push({
        t: 0, dur,
        update(e) {
            const k = (e.t - (e.dur - fall)) / fall;
            mesh.visible = k > 0;
            if (k > 0) mesh.position.set(x, floor + 0.5 + 14 * (1 - Math.min(1, k)), z);
        },
        dispose() { mesh.removeFromParent(); },
    });
}
// 보스 5종 패턴 (10-5, AGENTS.md 각 보스 설명). AGENTS.md 에 재사용 시간이 없는 "주인공이 Nm 안이면" 패턴은 내부 재사용 시간을 둔다 (U29)
//   { name, cooldown (초), first (전투 시작 후 첫 사용까지, 없으면 cooldown / 2), condition(g, m, dist, canSee), run(g, m, dist) → 패턴 실행 시간 (초) }
const BOSS_PATTERNS = {
    br_boss: [   // 끝나지 않는 야근
        {
            name: 'stamp', cooldown: 2.5, first: 0, condition: (g, m, dist) => dist <= 4 + PLAYER_RADIUS,
            run(g, m) {   // 결재 도장: 0.8초 예고 (원) 후 내려찍기, 반경 3m 공격력 180% 물리 + 기절 1초
                const yaw = yawToPlayer(g, m), x = m.pos.x - Math.sin(yaw) * 2, z = m.pos.z - Math.cos(yaw) * 2;
                m.yaw = yaw;
                m.custom.pose = 'raise';
                showTelegraph(g, 'circle', { x, z, radius: 3 }, 0.8, m);
                monsterSchedule(m, 0.8, (gg, mm) => {
                    mm.custom.pose = 'slam';
                    spawnRing(gg, x, z, 3, 0xffe8c8, 0.35);
                    if (playerInCircle(gg, x, z, 3) && bossMeleeHit(gg, mm, 180) > 0) applyStatusToPlayer(gg, 'stun', { duration: 1 });
                });
                return 1.2;
            },
        },
        {
            name: 'blackout', cooldown: 15, first: 15,
            run(g, m) {   // 정전: 3초 동안 층의 조명이 모두 꺼지고 (손전등만 남음) 깜빡이는 그림자 2마리 소환
                const view = g.view;
                view.setLightLevel(BLACKOUT_LIGHT);
                g.effects.push({ t: 0, dur: 3, update() { view.setLightLevel(BLACKOUT_LIGHT); }, dispose() { if (g.view === view) view.setLightLevel(1); } });
                summonMinions(g, m, 'br_shade', 2, { color: 0x101018 });
                return 0.6;
            },
        },
        {
            name: 'paperStorm', cooldown: 3, first: 1.5, condition: (g, m, dist, canSee) => canSee,
            run(g, m) {   // 서류 폭풍: 주인공 쪽으로 부채꼴 5갈래 종이 (20 m/s, 각 공격력 60% 물리)
                m.yaw = yawToPlayer(g, m);
                bossFan(g, m, 5, 15, { speed: 20, element: 'physical', coef: 60, look: 'paper', geo: getCommonAssets().geo.box, size: [0.42, 0.03, 0.3], spin: 14, radius: 0.25 });
                return 0.4;
            },
        },
    ],
    bk_boss: [   // 지하 감옥 간수장
        {
            name: 'summon', cooldown: 0, condition: (g, m) => bossHpMarkReached(m, [66, 33]),
            run(g, m) { summonMinions(g, m, 'bk_archer', 2, { color: 0xe8e2cc }); return 0.8; },   // HP 66%·33% 에서 해골 궁수 2마리씩
        },
        {
            name: 'swing', cooldown: 2, first: 0, condition: (g, m, dist) => dist <= 4 + PLAYER_RADIUS,
            run(g, m) {   // 철퇴 휘두르기: 0.6초 예고 (부채꼴) 후 전방 4m · 120° 공격력 150% 물리 + 넉백 3m
                const yaw = yawToPlayer(g, m);
                m.yaw = yaw;
                m.custom.pose = 'raise';
                showTelegraph(g, 'cone', { x: m.pos.x, z: m.pos.z, yaw, radius: 4, angleDeg: 120 }, 0.6, m);
                monsterSchedule(m, 0.6, (gg, mm) => {
                    mm.custom.pose = 'swing';
                    const p = gg.player.pos;
                    if (inCone(mm.pos.x, mm.pos.z, yaw, 4, 60, p.x, p.z, PLAYER_RADIUS) && bossMeleeHit(gg, mm, 150) > 0) knockPlayer(gg, mm.pos.x, mm.pos.z, 3);
                });
                return 1.0;
            },
        },
        {
            name: 'charge', cooldown: 8, first: 4, condition: (g, m, dist, canSee) => canSee,
            run(g, m) {   // 돌진: 1초 예고 (선) 후 주인공 방향으로 12m (updateBossDash)
                const yaw = yawToPlayer(g, m);
                m.yaw = yaw;
                m.custom.pose = 'charge';
                showTelegraph(g, 'line', { x: m.pos.x, z: m.pos.z, yaw, length: 12 + m.radius, width: m.radius * 2 }, 1, m);
                monsterSchedule(m, 1, (gg, mm) => { mm.custom.dash = { yaw, left: 12, hit: false }; });
                return 1.1;
            },
        },
    ],
    cv_boss: [   // 거미 여왕
        {
            name: 'brood', cooldown: 10, first: 3, condition: (g) => countMinions(g, 'cv_spider') < BROOD_MAX,
            run(g, m) {   // 산란: 새끼 거미 3마리 (동굴 거미, 크기 ×0.6, HP ×0.4, 동시에 최대 6마리)
                summonMinions(g, m, 'cv_spider', Math.min(3, BROOD_MAX - countMinions(g, 'cv_spider')), { small: true, color: 0xe8e0c8 });
                return 0.8;
            },
        },
        {
            name: 'webBomb', cooldown: 8, first: 5,
            run(g, m) {   // 거미줄 폭탄: 주인공 위치에 1초 예고 (원) 후 반경 5m 거미줄 지대 5초 (안에서 둔화 50%)
                const p = g.player.pos, x = p.x, z = p.z;
                showTelegraph(g, 'circle', { x, z, radius: 5 }, 1, m);
                monsterSchedule(m, 1, (gg) => {
                    spawnPuff(gg, x, floorHeightAt(gg.dungeon, x, z) + 0.5, z, 0xf2f0e6, 5, 0.4);
                    createGroundZone(gg, {
                        x, z, radius: 5, duration: 5, tick: 0.2, disc: true, mat: getMonsterCommon().webZone,
                        onTick: (g2, zone) => {
                            if (playerInCircle(g2, zone.x, zone.z, zone.radius - PLAYER_RADIUS)) applyStatusToPlayer(g2, 'slow', { duration: 0.4, magnitude: 50, resPct: 0 });
                        },
                    });
                });
                return 0.5;
            },
        },
        {
            name: 'stingers', cooldown: 3, first: 1.5, condition: (g, m, dist, canSee) => canSee,
            run(g, m) {   // 독침 세례: 부채꼴 3갈래 독 투사체 (16 m/s, 각 공격력 80% 독 + 중독)
                m.yaw = yawToPlayer(g, m);
                bossFan(g, m, 3, 20, { speed: 16, element: 'poison', coef: 80, effect: { id: 'poison', chance: 100 }, radius: 0.3 });
                return 0.4;
            },
        },
    ],
    lv_boss: [   // 용암 군주 (이동하지 않음)
        {
            name: 'imps', cooldown: 20, first: 0, condition: (g, m) => m.hp <= m.maxHp * 0.5,
            run(g, m) { summonMinions(g, m, 'lv_imp', 2, { color: 0xff8a3a }); return 0.8; },   // HP 50% 이하: 20초마다 불꽃 임프 2마리
        },
        {
            name: 'sweep', cooldown: 3, first: 0, condition: (g, m, dist) => dist <= 6 + PLAYER_RADIUS,
            run(g, m) {   // 휩쓸기: 0.8초 예고 (원) 후 360° 공격력 120% 물리 + 넉백 4m
                m.custom.pose = 'raise';
                showTelegraph(g, 'circle', { x: m.pos.x, z: m.pos.z, radius: 6 }, 0.8, m);
                monsterSchedule(m, 0.8, (gg, mm) => {
                    mm.custom.pose = 'sweep';
                    spawnRing(gg, mm.pos.x, mm.pos.z, 6, 0xffa050, 0.4);
                    if (playerInCircle(gg, mm.pos.x, mm.pos.z, 6) && bossMeleeHit(gg, mm, 120) > 0) knockPlayer(gg, mm.pos.x, mm.pos.z, 4);
                });
                return 1.2;
            },
        },
        {
            name: 'volcano', cooldown: 4, first: 2,
            run(g, m) {   // 화산탄: 주인공 위치와 무작위 2곳에 1.2초 예고 (원) 후 낙하, 반경 3m 공격력 150% 화염
                const p = g.player.pos, spots = [{ x: p.x, z: p.z }, randomBossPoint(g, m, 3), randomBossPoint(g, m, 3)];
                for (const s of spots) {
                    showTelegraph(g, 'circle', { x: s.x, z: s.z, radius: 3 }, 1.2, m);
                    spawnFallingRock(g, s.x, s.z, 1.2);
                }
                monsterSchedule(m, 1.2, (gg, mm) => {
                    let hit = false;
                    for (const s of spots) {
                        spawnPuff(gg, s.x, floorHeightAt(gg.dungeon, s.x, s.z) + 0.5, s.z, 0xff7a2a, 3, 0.4);
                        if (!hit && playerInCircle(gg, s.x, s.z, 3)) { hit = true; bossHit(gg, mm, 'fire', 150); }   // 겹친 곳에 서 있어도 한 번만
                    }
                });
                return 0.5;
            },
        },
        {
            name: 'lavaPool', cooldown: 8, first: 5,
            run(g, m) {   // 용암 웅덩이: 무작위 위치에 반경 4m 용암 지대 8초 (초당 공격력 30% 화염 + 화상). 범위 패턴이라 1초 예고
                const s = randomBossPoint(g, m, 4), tick = 0.5;
                showTelegraph(g, 'circle', { x: s.x, z: s.z, radius: 4 }, 1, m);
                monsterSchedule(m, 1, (gg, mm) => {
                    const attacker = monsterAttacker(mm);
                    createGroundZone(gg, {
                        x: s.x, z: s.z, radius: 4, duration: 8, tick, disc: true, mat: getMonsterCommon().lavaZone,
                        onTick: (g2, zone) => {
                            if (!playerInCircle(g2, zone.x, zone.z, zone.radius)) return;
                            hitPlayer(g2, attacker, { kind: 'physical', element: 'fire', coef: 30 * tick, canCrit: false }, { id: 'burn', chance: 100 });
                        },
                    });
                });
                return 0.5;
            },
        },
    ],
    vd_boss: [   // 차원 포식자
        {
            name: 'rift', cooldown: 12, first: 0, condition: (g, m) => m.hp <= m.maxHp * 0.5,
            run(g, m) {   // 차원 균열 (HP 50% 이하): 주인공 근처로 순간이동 → 1초 예고 (원) 후 반경 5m 공격력 150% 전격 + 감전
                const p = g.player.pos, start = Math.random() * Math.PI * 2, r = m.radius + PLAYER_RADIUS + 1.5;
                for (let i = 0; i < 8; i++) {
                    const a = start + (i * Math.PI) / 4, x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r;
                    if (!validMonsterSpot(g, x, z, m.radius) || (m.zone && !inBossZone(g.dungeon, m.zone, x, z))) continue;
                    spawnPuff(g, m.pos.x, m.pos.y, m.pos.z, 0x6a2ad0, m.radius * 1.5, 0.5);
                    m.pos.x = x;
                    m.pos.z = z;
                    placeMonsterOnFloor(g, m);
                    spawnPuff(g, x, m.pos.y, z, 0x6a2ad0, m.radius * 1.5, 0.5);
                    break;
                }
                const x = m.pos.x, z = m.pos.z;
                showTelegraph(g, 'circle', { x, z, radius: 5 }, 1, m);
                monsterSchedule(m, 1, (gg, mm) => {
                    spawnPuff(gg, x, mm.pos.y, z, 0xfff27a, 5, 0.35);
                    if (playerInCircle(gg, x, z, 5)) bossHit(gg, mm, 'lightning', 150, { id: 'shock', chance: 100 });
                });
                return 1.3;
            },
        },
        {
            name: 'gravity', cooldown: 10, first: 6,
            run(g, m) {   // 중력 당김: 3초 동안 주인공을 보스 쪽으로 초당 3m (달리면 버틸 수 있음). 화면 가장자리 보라색 (SCREENS.game)
                g.player.pull = { x: m.pos.x, z: m.pos.z, speed: 3, t: 3, owner: m };
                spawnRing(g, m.pos.x, m.pos.z, 10, 0x9a5cff, 0.8);
                return 0.3;
            },
        },
        {
            name: 'orb', cooldown: 3, first: 1.5,
            run(g, m) {   // 공허 구체: 주인공을 천천히 따라가는 구체 (8 m/s, 6초 뒤 소멸, 공격력 120% 냉기 + 둔화)
                const from = new THREE.Vector3(m.pos.x, m.pos.y, m.pos.z), dir = aimAtPlayer(g, from);
                from.addScaledVector(dir, m.radius + 0.4);
                launchMonsterShot(g, m, from, dir, {
                    speed: 8, range: 8 * 6 + 1, life: 6, homing: 1.4, element: 'cold', coef: 120, effect: { id: 'slow', chance: 100 }, look: 'void', radius: 0.45,
                });
                return 0.3;
            },
        },
    ],
};
const BLACKOUT_LIGHT = 0.05;   // 정전 중 조명 밝기 (setLightLevel)
const BROOD_MAX = 6;           // 새끼 거미 동시 최대 수
// 최대 maxStep 라디안만큼 (x, z) 쪽으로 돈다
function turnToward(m, x, z, maxStep) {
    const want = Math.atan2(-(x - m.pos.x), -(z - m.pos.z));
    let d = want - m.yaw;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    m.yaw += clamp(d, -maxStep, maxStep);
}
// 화염 도롱뇽 숨결 한 번: 입 (몸 앞) 에서 바라보는 방향 5m · 60° 부채꼴 안이고 벽에 가리지 않으면 화염 + 화상
function salamanderBreathTick(g, m) {
    const b = SALAMANDER_BREATH, p = g.player.pos;
    const mx = m.pos.x - Math.sin(m.yaw) * 0.5, mz = m.pos.z - Math.cos(m.yaw) * 0.5;
    if (!inCone(mx, mz, m.yaw, b.range, b.angleDeg / 2, p.x, p.z, PLAYER_RADIUS)) return;
    if (!hasLineOfSight(g, mx, m.pos.y + 0.4, mz, p.x, p.y + 1, p.z)) return;
    hitPlayer(g, monsterAttacker(m), { kind: 'physical', element: 'fire', coef: b.coef, canCrit: false }, { id: 'burn', chance: 100 });
}
// 숨결 연출: 입에서 앞으로 퍼지는 주황색 원뿔 (공유 재질, 도롱뇽을 따라다님). 도롱뇽이 죽으면 바로 끝
function spawnFlameBreath(g, m, dur) {
    const b = SALAMANDER_BREATH, pivot = new THREE.Group();
    const r = b.range * Math.tan((b.angleDeg / 2) * Math.PI / 180);
    const cone = new THREE.Mesh(getCommonAssets().geo.coneSmooth, getMonsterCommon().flame);
    cone.rotation.x = Math.PI / 2;   // 꼭짓점 (+Y) 을 뒤 (+Z) 로 → 입에서 앞으로 퍼짐
    cone.position.z = -b.range / 2;
    cone.scale.set(r, b.range, r * 0.5);
    pivot.add(cone);
    g.view.group.add(pivot);
    g.effects.push({
        t: 0, dur,
        update(e) {
            if (m.dead) { e.t = e.dur; return; }
            pivot.position.set(m.pos.x - Math.sin(m.yaw) * 0.5, m.pos.y + 0.35, m.pos.z - Math.cos(m.yaw) * 0.5);
            pivot.rotation.y = m.yaw;
            const k = 0.85 + Math.random() * 0.2, len = b.range * Math.max(0.05, Math.min(1, e.t / 0.15));
            cone.position.z = -len / 2;
            cone.scale.set(r * k, len, r * 0.5 * k);
        },
        dispose() { pivot.removeFromParent(); },
    });
}
// --- 상태이상 (PROGRESS.md 9단계, AGENTS.md "상태이상"). 주인공 (g.player) 과 몬스터가 같은 구조를 쓴다:
//   target.effects = [{ id, remaining (초), stacks, dps (초당 지속 피해, 중독은 1중첩당), magnitude (둔화 % / 감전 받는 피해 %), from: { x, z } (공포) }]
// applyEffect 는 순수 함수 (target 객체만 다룸, 자체 테스트 대상)
//   target: { effects, isPlayer, isBoss, statusImmune }
//   opts:   { duration (없으면 표의 기본 지속), dps, sourceDamage (dps 가 없을 때 원래 피해 × 표의 %), magnitude, resPct (주인공 원소 저항 %), from }
// 반환: 걸린 효과 항목 (걸리지 않으면 null)
function applyEffect(target, id, opts = {}) {
    const def = STATUS_EFFECTS[id];
    if (!def || !target || !target.effects || target.statusImmune) return null;
    if (def.monsterOnly && target.isPlayer) return null;
    let duration = Number.isFinite(opts.duration) ? opts.duration : def.duration;
    if (!(duration > 0)) return null;
    if (target.isBoss && def.bossToSlow) return applyEffect(target, 'slow', { duration, magnitude: BOSS_CC_SLOW_PCT });   // 보스: 같은 시간 둔화 50%
    if (target.isPlayer && def.elemental) duration *= 1 - clamp(opts.resPct || 0, 0, 100) / 100;   // 저항% 만큼 짧아진다
    if (target.isPlayer && def.playerMaxDuration) duration = Math.min(duration, def.playerMaxDuration);   // 빙결은 최대 1.5초
    if (duration <= 0) return null;
    const magnitude = Number.isFinite(opts.magnitude) ? opts.magnitude : (def.slowPct || def.damageTakenPct || 0);
    const dotPct = def.dotPct || (id === 'bleed' ? BLEED_DEFAULT_DOT_PCT : 0);
    const dps = Number.isFinite(opts.dps) ? opts.dps : (dotPct && opts.sourceDamage > 0 ? opts.sourceDamage * dotPct / 100 : 0);
    let e = target.effects.find((x) => x.id === id);
    if (!e) {
        e = { id, remaining: duration, stacks: 1, dps, magnitude, from: opts.from || null };
        target.effects.push(e);
        return e;
    }
    if (def.stack === 'stack') e.stacks = Math.min(def.maxStacks, e.stacks + 1);   // 중독: 중첩 +1 (최대 5) + 지속 시간 갱신
    e.remaining = def.stack === 'longer' ? Math.max(e.remaining, duration) : duration;   // 화상·중독: 갱신, 그 외: 긴 쪽
    e.dps = Math.max(e.dps, dps);
    e.magnitude = Math.max(e.magnitude, magnitude);
    if (opts.from) e.from = opts.from;
    return e;
}
// 지속 피해와 시간 감소 (9-3). 반환: 이번 틱의 지속 피해 합 (화상 + 중독 × 중첩 + 출혈, 이동 중이면 출혈 1.5배).
// 지속 피해는 원래 피해에서 이미 방어·저항을 거친 값이라 다시 깎지 않는다 (받는 피해 % 는 호출하는 쪽이 곱한다)
function tickEffects(target, dt, moving) {
    let damage = 0;
    for (const e of target.effects) {
        const t = Math.min(dt, Math.max(0, e.remaining));
        if (e.id === 'poison') damage += e.dps * e.stacks * t;
        else if (e.id === 'bleed') damage += e.dps * t * (moving ? STATUS_EFFECTS.bleed.movingMul : 1);
        else if (e.id === 'burn') damage += e.dps * t;
        e.remaining -= dt;
    }
    for (let i = target.effects.length - 1; i >= 0; i--) if (target.effects[i].remaining <= 0) target.effects.splice(i, 1);
    return damage;
}
function effectMagnitude(target, id) {
    const e = target.effects.find((x) => x.id === id);
    return e ? e.magnitude : 0;
}
// 빙결·기절: 이동·공격·스킬 불가 (9-4)
function isDisabled(target) { return target.effects.some((e) => STATUS_EFFECTS[e.id].disables); }
// 주인공에게 상태이상: 성소 안이면 걸리지 않고 (들어오는 순간 해제, AGENTS.md), 원소 상태이상은 그 속성 저항으로 지속 시간을 줄인다.
// opts.resPct 를 주면 그 값을 쓴다 (거미줄의 둔화처럼 냉기가 아닌 원인은 0)
function applyStatusToPlayer(g, id, opts = {}) {
    if (g.inSanctuary || g.dead || !STATUS_EFFECTS[id]) return null;
    const el = STATUS_EFFECTS[id].element;
    return applyEffect(g.player, id, { resPct: g.derived.res[el] || 0, ...opts });
}
// 몬스터에게 상태이상 (주인공의 스킬·투척물·장비 옵션이 쓴다, 12·14단계). 공포는 주인공 반대쪽으로 도망치게 from 을 기록
function applyStatusToMonster(g, m, id, opts = {}) {
    if (m.dead) return null;
    const e = applyEffect(m, id, { from: { x: g.player.pos.x, z: g.player.pos.z }, ...opts });
    if (e && isDisabled(m)) m.timers.windup = 0;   // 빙결·기절은 예비 동작을 끊는다
    return e;
}
// 주인공 상태이상·버프 갱신: 지속 피해 (감전·받는 피해 % 적용) → 시간 감소. 성소 안에서는 매 프레임 모두 해제 (9-7)
function updatePlayerStatus(g, dt) {
    tickBuffs(g, dt);
    if (g.inSanctuary) { g.player.effects.length = 0; return; }
    const dot = tickEffects(g.player, dt, g.player.moving);
    if (dot > 0) damagePlayer(g, dot * (1 + (g.derived.mods.damageTakenPct + effectMagnitude(g.player, 'shock')) / 100), true);
}

// --- 버프 (9-5): game.buffs = [{ id, remaining, mods, statusImmune, label: { ko, en }, color }] → collectModifiers 가 mods 를 더한다.
// 같은 id 를 다시 받으면 효과·시간을 갱신한다 (AGENTS.md "전투 영약 중복 사용 시 효과·시간 갱신"). 영약 (12단계)·스킬 (14단계) 이 쓴다
function addBuff(game, buff) {
    const entry = { mods: {}, statusImmune: false, label: { ko: '버', en: 'Bf' }, color: '#7ab8ff', ...buff };
    const i = game.buffs.findIndex((b) => b.id === buff.id);
    if (i >= 0) game.buffs[i] = entry;
    else game.buffs.push(entry);
    return entry;
}
function tickBuffs(game, dt) {
    for (const b of game.buffs) b.remaining -= dt;
    for (let i = game.buffs.length - 1; i >= 0; i--) if (game.buffs[i].remaining <= 0) game.buffs.splice(i, 1);
    game.player.statusImmune = game.buffs.some((b) => b.statusImmune);   // 정화·성수: 상태이상 면역
}

// --- 주인공 피격 (8-13)
// 몬스터 공격 → 주인공. attacker = monsterAttacker(m). effect = { id, chance } (확률로 상태이상, 9단계). 반환: 입힌 피해
// 받는 피해 % = 장비·스킬 (damageTakenPct) + 감전 (9-4) + 투사체면 projectileTakenPct.
// src = { x, z (공격이 온 곳), monster (근접 공격한 몬스터) } (14단계): 무적 중이면 피해 없음, 막기 (방패: 정면 ±60° 의 근접·투사체를
// 막기 확률로 막아 피해 −70%, AGENTS.md "보조장비"), 근접이면 반격 (X2)·가시 갑옷 (D3)
function hitPlayer(g, attacker, spec, effect, src) {
    if (!playerTargetable(g) || g.time < g.player.invulnUntil) return 0;
    const d = g.derived, p = g.player.pos;
    const taken = d.mods.damageTakenPct + effectMagnitude(g.player, 'shock') + (spec.projectile ? d.mods.projectileTakenPct : 0);
    let amount = computeDamage(attacker, { defense: d.defense, res: d.res, damageTakenPct: taken }, spec).amount;
    if (src && (spec.melee || spec.projectile) && d.blockChance > 0 && playerFaces(g, src.x, src.z, BLOCK_ARC_DEG / 2) && Math.random() * 100 < d.blockChance) {
        amount *= 1 - BLOCK_REDUCTION / 100;
        if (g.view) spawnFloatingText(g, p.x, p.y + 2.1, p.z, t('combat.block'), '#d8e4ff', 0.8, true);
    }
    if (spec.melee && src && src.monster && !src.monster.dead) amount = meleeRetaliation(g, src.monster, attacker, spec, amount);
    damagePlayer(g, amount);
    if (effect && Math.random() * 100 < effect.chance) applyStatusToPlayer(g, effect.id, { sourceDamage: amount });   // 9-8
    return amount;
}
// 주인공이 (x, z) 쪽을 수평으로 halfDeg 안에서 바라보는가 (막기 방향)
function playerFaces(g, x, z, halfDeg) {
    const p = g.player, dx = x - p.pos.x, dz = z - p.pos.z, l = Math.hypot(dx, dz);
    return l < 1e-6 || (dx * -Math.sin(p.yaw) + dz * -Math.cos(p.yaw)) / l >= Math.cos((halfDeg * Math.PI) / 180);
}
// 근접 공격을 받을 때 (14-4·14-6): 반격 (X2 — 확률로 그 피해 −50% + 즉시 물리 150%), 가시 갑옷 (D3 — 감소 전 피해의 N% 를 공격자에게,
// 방어·저항 무시). 반환: 받을 피해
function meleeRetaliation(g, m, attacker, spec, amount) {
    const lv = g.state.player.skills.X2 || 0, p = g.player.pos;
    if (lv > 0) {
        const v = SKILL_BY_ID.X2.values(lv);
        if (Math.random() * 100 < v.chance) {
            amount *= 1 - v.reducePct / 100;
            if (g.view) spawnFloatingText(g, p.x, p.y + 2.3, p.z, t('combat.counter'), '#ffb08a', 0.9, true);
            damageMonster(g, m, meleeSpec(v.counterCoef));
        }
    }
    const thorns = skillBuff(g, 'D3');
    if (thorns && !m.dead) {
        const raw = (spec.kind === 'magic' ? attacker.magicAtk : attacker.physAtk) * spec.coef / 100;
        damageMonster(g, m, { kind: 'item', element: 'arcane', coef: 0, flat: raw * thorns.reflectPct / 100, canCrit: false });
    }
    return amount;
}
// 주인공 넉백 (오크 전사·보스 패턴, 10단계): 0.2초 동안 dist m 밀려난다 (벽 충돌 적용, updatePlayerMovement).
// 넉백 면역 버프 (수호 태세 D0·칼날 폭풍 A3) 중이면 밀리지 않는다
const PLAYER_KNOCK_TIME = 0.2;
function knockPlayer(g, fromX, fromZ, dist) {
    if (g.dead || dist <= 0 || (g.buffs && g.buffs.some((b) => b.knockImmune))) return;
    const p = g.player, dx = p.pos.x - fromX, dz = p.pos.z - fromZ, l = Math.hypot(dx, dz) || 1;
    p.knock = { vx: (dx / l) * dist / PLAYER_KNOCK_TIME, vz: (dz / l) * dist / PLAYER_KNOCK_TIME, t: PLAYER_KNOCK_TIME };
}
// quiet = 지속 피해 (화면 가장자리를 붉게 하지 않는다).
// 14단계: 무적 (불굴·순간이동 직후) 이면 피해 없음 → 마력 보호막 (D9) 이 먼저 흡수 → HP 가 0 이 되면 불굴 (D6)
function damagePlayer(g, amount, quiet) {
    const sp = g.state.player;
    if (g.dead || amount <= 0 || g.time < g.player.invulnUntil) return;
    if (!quiet) g.hurtAt = g.time;   // 화면 가장자리를 붉게 (SCREENS.game)
    if (!quiet && g.recall) cancelRecall(g);   // 귀환 주문서: 시전 중 피격 시 취소 (지속 피해는 피격이 아님, 12-7)
    const shield = skillBuff(g, 'D9');
    if (shield) {
        const a = Math.min(shield.shieldHp, amount);
        shield.shieldHp -= a;
        amount -= a;
        if (shield.shieldHp <= 0) shield.remaining = 0;   // 다 깎이면 다음 프레임에 사라진다 (tickBuffs)
        if (amount <= 0) return;
    }
    if (sp.hp - amount <= 0 && tryUndying(g)) return;
    sp.hp = Math.max(0, sp.hp - amount);
    if (sp.hp <= 0) g.dead = true;   // 사망 화면은 SCREENS.game 이 띄운다 (U2)
}
// 불굴 (D6): HP 가 0 이 되는 피해를 받으면 발동 대기 (150 − 20 × Lv 초) 가 아닐 때 HP 1 로 살고 2초 무적. 반환: 발동했는가
function tryUndying(g) {
    const lv = g.state.player.skills.D6 || 0;
    if (lv <= 0 || g.cooldowns.D6 > 0) return false;
    const v = SKILL_BY_ID.D6.values(lv), p = g.player;
    g.state.player.hp = 1;
    p.invulnUntil = g.time + v.invuln;
    g.cooldowns.D6 = v.cooldown;
    if (g.view) {
        spawnFloatingText(g, p.pos.x, p.pos.y + 2.2, p.pos.z, t('combat.undying'), '#ffe9a0', 1.1, true);
        spawnPuff(g, p.pos.x, p.pos.y + 1, p.pos.z, SKILL_COLORS.holy, 1.6, 0.5);
    }
    return true;
}

// --- 몬스터 피격·처치 (8-10, 8-11)
function playerAttacker(g) { return { ...g.derived, level: g.state.player.level }; }
// 주인공 공격 → 몬스터. 반환: computeDamage 결과 (이미 죽은 몬스터면 null)
function damageMonster(g, m, spec) {
    if (m.dead || m.eric) return null;   // 에릭의 몬스터는 처치할 수 없다 (U43)
    const r = computeDamage(playerAttacker(g), { defense: m.defense, res: m.res, damageTakenPct: effectMagnitude(m, 'shock') }, spec);
    const beh = MONSTER_BEHAVIORS[m.typeId];
    if (beh && beh.modifyDamage) r.amount = Math.max(1, r.amount * beh.modifyDamage(g, m, r));   // 대리석 수호상의 방패 막기
    m.hp -= r.amount;
    m.timers.flash = MONSTER_FLASH_TIME;
    if (!m.def.knockbackImmune) { m.timers.stagger = MONSTER_STAGGER_TIME; m.timers.windup = 0; }   // 예비 동작 중 경직되면 공격 취소
    if (m.state !== 'chase') alertGroup(g, m);
    else m.lastSeenAt = g.time;
    const ls = g.derived.mods.lifeSteal;
    if (ls > 0 && spec.kind === 'physical') g.state.player.hp = Math.min(g.derived.maxHp, g.state.player.hp + r.amount * ls / 100);
    spawnFloatingText(g, m.pos.x, monsterCenterY(m) + m.height * 0.5 + 0.2, m.pos.z, String(Math.round(r.amount)), r.crit ? '#ffe04a' : '#ffffff', r.crit ? 1.35 : 1);
    if (beh && beh.onHit && m.hp > 0) beh.onHit(g, m, r);
    if (m.hp <= 0) killMonster(g, m);
    else if (spec.element === 'cold' && Math.random() * 100 < g.derived.mods.freezeOnColdPct) applyStatusToMonster(g, m, 'freeze', { duration: 1 });   // 냉기 숙련 (M5)
    return r;
}
const GOLD_DROP_CHANCE = 60;   // AGENTS.md "밸런스 기준치": 처치 시 60% 확률로 (3 + 레벨) × 0.5 ~ 1.5 G
function killMonster(g, m) {
    m.dead = true;
    m.hp = 0;
    const sp = g.state.player, mul = monsterRewardMuls(m);
    const levels = grantExp(g.state, killExp(m.level, sp.level) * mul.exp, g);
    if (levels > 0) g.uiEvents.push({ type: 'levelUp', level: sp.level });
    if (Math.random() * 100 < GOLD_DROP_CHANCE) {
        const amount = (3 + m.level) * lerp(0.5, 1.5, Math.random()) * mul.gold * (1 + g.derived.mods.goldPct / 100);
        dropGold(g, m.pos.x, m.pos.z, Math.max(1, Math.round(amount)));
    }
    rollMonsterDrops(g, m);
    removeMonsterExtras(m);
    const beh = MONSTER_BEHAVIORS[m.typeId];
    if (beh && beh.onDeath) beh.onDeath(g, m);
    if (m.isBoss) onBossDefeated(g, m);
    makeCorpse(g, m);
}
// 아이템 드롭 (12-5): planMonsterDrops 로 정한 아이템을 몬스터 주위 바닥에 흩어 놓는다 (벽 안이면 밖으로 밀어냄). 반환: 놓은 바닥 아이템
function rollMonsterDrops(g, m) {
    const items = planMonsterDrops(Math.random, g.state.floor, m), out = [];
    const start = Math.random() * Math.PI * 2, spread = m.isBoss ? 2 : 0.9;
    items.forEach((item, i) => {
        const a = start + (i * Math.PI * 2) / Math.max(1, items.length), r = spread * (0.6 + Math.random() * 0.4);
        const pos = { x: m.pos.x + Math.cos(a) * r, z: m.pos.z + Math.sin(a) * r };
        if (!cellAtWorld(g.dungeon, pos.x, pos.z)) { pos.x = m.pos.x; pos.z = m.pos.z; }
        else resolveCircleVsBoxes(pos, DROP_WALL_MARGIN, nearbyBoxes(g.view.collision, pos.x, pos.z));
        const dr = makeDrop(item, pos.x, pos.z);
        g.drops.push(dr);
        out.push(dr);
    });
    return out;
}

// --- 시체 (8-11): 몬스터 메시를 그대로 두고 corpse 값대로 변형 + 어두운 시체 재질. 한 층에 최대 60구
const CORPSE_MAX = 60;
const CORPSE_FALL_TIME = 0.3, CORPSE_VANISH_TIME = 0.5;
function makeCorpse(g, m) {
    disposeHpBar(m);
    removeEliteOutline(m);
    if (m.def.corpse === 'vanish') {   // 남기지 않음: 0.5초 동안 작아지며 사라진다
        if (m.mesh) {
            const mesh = m.mesh, owned = m.ownedMats, s0 = mesh.scale.x;
            g.effects.push({
                t: 0, dur: CORPSE_VANISH_TIME,
                update(e) { mesh.scale.setScalar(s0 * Math.max(0.01, 1 - e.t / e.dur)); },
                dispose() { mesh.removeFromParent(); for (const mat of owned) mat.dispose(); },
            });
        }
        m.mesh = null;
        m.ownedMats = [];
        return;
    }
    const c = {
        typeId: m.typeId, elite: m.elite, small: m.small, x: m.pos.x, z: m.pos.z, yaw: m.yaw, size: m.size, def: m.def,
        mesh: m.mesh, meshes: m.meshes, ownedMats: m.ownedMats, custom: m.custom, fallFrom: m.def.hover ? m.pos.y : null,
    };
    m.mesh = null;
    m.ownedMats = [];
    if (c.mesh) applyCorpsePose(g, c);
    g.corpses.push(c);
    while (g.corpses.length > CORPSE_MAX) disposeMonsterVisual(g.corpses.shift());
}
// 시체 기록 { typeId, elite, x, z, yaw, small? } (스냅샷 6.9) → 런타임 시체 (메시는 보일 때 만든다)
function corpseFromRecord(rec) {
    const def = MONSTER_TYPES[rec.typeId], size = (rec.elite ? ELITE_MUL.size : 1) * (rec.small ? SMALL_MUL.size : 1);
    return { typeId: rec.typeId, elite: !!rec.elite, small: !!rec.small, x: rec.x, z: rec.z, yaw: rec.yaw || 0, size, def, mesh: null, ownedMats: [], custom: {} };
}
function applyCorpsePose(g, c) {
    const mesh = c.mesh, C = getMonsterCommon(), def = c.def, size = c.size || 1;
    for (const n of c.meshes || []) { n.material = C.corpse; n.userData.baseMat = C.corpse; }
    for (const mat of c.ownedMats) mat.dispose();
    c.ownedMats = [];
    const floor = floorHeightAt(g.dungeon, c.x, c.z);
    mesh.position.set(c.x, floor, c.z);
    mesh.rotation.set(0, c.yaw, 0, 'YXZ');
    mesh.scale.setScalar(size);
    if (def.corpse === 'flatten') {
        mesh.scale.y = size * 0.3;
    } else if (def.corpse === 'lie') {
        mesh.rotation.set(0, c.yaw, Math.PI / 2, 'YXZ');   // 옆으로 눕힘
        mesh.position.y = floor + def.radius * 0.6 * size;
    } else if (def.corpse === 'fall') {
        const restY = floor + Math.min(def.height * 0.5, 0.3) * size;
        mesh.rotation.set(0, c.yaw, 0.35, 'YXZ');
        if (c.fallFrom !== null && c.fallFrom > restY) {   // 바닥으로 떨어뜨린 뒤 눕힘
            const from = c.fallFrom;
            c.fallFrom = null;
            mesh.position.y = from;
            g.effects.push({ t: 0, dur: CORPSE_FALL_TIME, update(e) { mesh.position.y = lerp(from, restY, Math.min(1, (e.t / e.dur) ** 2)); }, dispose() { } });
        } else {
            mesh.position.y = restY;
        }
    }
}

// --- 몬스터 투사체·주인공 투사체 (8-5, 8-9). { owner, pos, vel, radius, maxDist, traveled, pierce, hitIds, attacker, spec, effect, splash, mesh }
const PROJECTILE_STEP = 0.4;   // 한 번에 이만큼씩 나눠 이동하며 벽·대상 판정
// o 의 추가 필드 (10단계): look (shotMats 키, 없으면 element), geo·size (모양 바꾸기, 서류 폭풍의 종이), spin (초당 회전),
//   homing (초당 최대 방향 전환 라디안, 공허 구체), life (초, 지나면 사라짐), onPlayerHit(g, pr) (피해 대신 다른 효과, 거미줄)
function spawnProjectile(g, o) {
    const C = getMonsterCommon();
    const mesh = new THREE.Mesh(o.geo || C.shot, C.shotMats[o.look || o.element] || C.shotMats.physical);
    if (o.size) mesh.scale.set(o.size[0], o.size[1], o.size[2]);
    else mesh.scale.setScalar(o.radius);
    mesh.position.copy(o.pos);
    g.view.group.add(mesh);
    g.projectiles.push({ traveled: 0, pierce: 0, splash: 0, effect: null, ...o, hitIds: new Set(), mesh, dispose() { mesh.removeFromParent(); } });
}
// 몬스터 투사체 하나: from (Vector3) 에서 dir (단위 벡터) 방향. o = { speed, range, element, coef, effect, splash, radius, + spawnProjectile 의 추가 필드 }
function launchMonsterShot(g, m, from, dir, o) {
    spawnProjectile(g, {
        owner: 'monster', pos: from.clone(), vel: dir.clone().multiplyScalar(o.speed), radius: o.radius || 0.2, maxDist: o.range,
        element: o.element, look: o.look, geo: o.geo, size: o.size, spin: o.spin, homing: o.homing, life: o.life, onPlayerHit: o.onPlayerHit,
        attacker: monsterAttacker(m), spec: { kind: 'physical', element: o.element, coef: o.coef === undefined ? 100 : o.coef, canCrit: false, projectile: true },
        effect: o.effect || null, splash: o.splash || 0,
    });
}
// 몬스터 눈 높이에서 주인공 가슴 높이를 향하는 단위 벡터 (yawOffset 라디안만큼 수평으로 돌린 방향, 부채꼴 발사)
function monsterShotOrigin(m) { return new THREE.Vector3(m.pos.x, monsterEyeY(m) - 0.1, m.pos.z); }
function aimAtPlayer(g, from, yawOffset = 0) {
    const p = g.player.pos, dir = new THREE.Vector3(p.x, p.y + 1.2, p.z).sub(from).normalize();
    if (yawOffset) dir.applyAxisAngle(limbUp, yawOffset);
    return dir;
}
// 원거리 몬스터: 주인공의 현재 위치 (가슴 높이) 를 조준해 발사
function fireMonsterProjectile(g, m) {
    const a = m.def.attack, from = monsterShotOrigin(m);
    launchMonsterShot(g, m, from, aimAtPlayer(g, from), {
        speed: a.projectileSpeed, range: a.range * 1.5, element: a.element, coef: a.coef, effect: a.effect, splash: a.splashRadius || 0,
    });
}
// 유도 투사체: 주인공 가슴 쪽으로 초당 homing 라디안까지 방향을 튼다 (속도는 그대로)
const steerWant = new THREE.Vector3(), steerCur = new THREE.Vector3();
function steerProjectile(g, pr, dt) {
    const p = g.player.pos, speed = pr.vel.length();
    steerWant.set(p.x - pr.pos.x, p.y + 1.2 - pr.pos.y, p.z - pr.pos.z).normalize();
    steerCur.copy(pr.vel).normalize();
    const angle = steerCur.angleTo(steerWant);
    if (angle > 1e-4) steerCur.lerp(steerWant, Math.min(1, (pr.homing * dt) / angle)).normalize();
    pr.vel.copy(steerCur).multiplyScalar(speed);
}
// 투사체가 벽·바닥·천장·던전 밖에 닿았는가
function projectileBlocked(g, pos) {
    const boxes = g.view.collision.get(cellKeyAtWorld(pos.x, pos.z));
    if (!boxes) return true;
    if (pos.y < floorHeightAt(g.dungeon, pos.x, pos.z) || (g.view.ceiling && pos.y > CELL_HEIGHT)) return true;
    return boxes.some((b) => pos.x >= b.minX && pos.x <= b.maxX && pos.z >= b.minZ && pos.z <= b.maxZ && pos.y >= b.minY && pos.y <= b.maxY);
}
function updateProjectiles(g, dt) {
    for (const pr of g.projectiles) {
        if (pr.life !== undefined && (pr.life -= dt) <= 0) { pr.done = true; continue; }
        if (pr.homing && pr.owner === 'monster' && playerTargetable(g)) steerProjectile(g, pr, dt);
        if (pr.spin) pr.mesh.rotation.y += pr.spin * dt;
        const total = pr.vel.length() * dt, steps = Math.max(1, Math.ceil(total / PROJECTILE_STEP));
        for (let s = 0; s < steps && !pr.done; s++) {
            if (pr.gravity) pr.vel.y -= pr.gravity * dt / steps;   // 투척물 포물선 (12-7)
            pr.pos.addScaledVector(pr.vel, dt / steps);
            pr.traveled += total / steps;
            if (projectileBlocked(g, pr.pos)) { projectileImpact(g, pr, false); break; }
            if (pr.owner === 'monster') stepMonsterProjectile(g, pr);
            else stepPlayerProjectile(g, pr);
            if (!pr.done && pr.maxHoriz && Math.hypot(pr.pos.x - pr.origin.x, pr.pos.z - pr.origin.z) >= pr.maxHoriz) projectileImpact(g, pr, false);
            if (pr.traveled >= pr.maxDist) pr.done = true;
        }
        pr.mesh.position.copy(pr.pos);
    }
    if (g.projectiles.some((pr) => pr.done)) {
        for (const pr of g.projectiles) if (pr.done) pr.dispose();
        g.projectiles = g.projectiles.filter((pr) => !pr.done);
    }
}
function stepMonsterProjectile(g, pr) {
    const c = cellAtWorld(g.dungeon, pr.pos.x, pr.pos.z);
    if (c && c.sanctuaryZone) { pr.done = true; return; }   // 몬스터 투사체는 성소 구역에 닿으면 사라진다
    if (g.zones.some((z) => z.ward && Math.hypot(pr.pos.x - z.x, pr.pos.z - z.z) <= z.radius)) { pr.done = true; return; }   // 임시 성역 (X3) 결계
    const p = g.player.pos;
    const hit = Math.hypot(pr.pos.x - p.x, pr.pos.z - p.z) <= PLAYER_RADIUS + pr.radius && pr.pos.y >= p.y - pr.radius && pr.pos.y <= p.y + EYE_HEIGHT + 0.2;
    if (hit) projectileImpact(g, pr, true);
}
function stepPlayerProjectile(g, pr) {
    for (const m of g.monsters.slice()) {
        if (m.dead || pr.hitIds.has(m.uid)) continue;
        const bottom = m.def.hover ? m.pos.y - m.height / 2 : m.pos.y;
        if (Math.hypot(pr.pos.x - m.pos.x, pr.pos.z - m.pos.z) > m.radius + pr.radius) continue;
        if (pr.pos.y < bottom - pr.radius || pr.pos.y > bottom + m.height + pr.radius) continue;
        if (pr.onImpact) { projectileImpact(g, pr, false); return; }   // 투척물·화염구는 몬스터에 닿으면 그 자리에서 터진다 (12-7, 14-2)
        pr.hitIds.add(m.uid);
        const r = damageMonster(g, m, pr.spec);
        if (r && pr.onHit) pr.onHit(g, m, r);   // 얼음 창 둔화·원소 부여 등 (14단계)
        if (pr.pierce > 0) pr.pierce--;
        else { pr.done = true; return; }
    }
}
// 착탄: 몬스터 투사체가 주인공에게 맞으면 피해, 폭발 반경이 있으면 반경 안의 주인공에게 (한 번만)
// 주인공 투사체는 onImpact 가 있으면 (투척물) 그 자리에서 부른다
function projectileImpact(g, pr, hitPlayerDirect) {
    if (pr.done) return;
    pr.done = true;
    if (pr.owner !== 'monster') {
        if (pr.onImpact) pr.onImpact(g, pr);
        return;
    }
    const p = g.player.pos;
    if (pr.splash > 0) spawnPuff(g, pr.pos.x, pr.pos.y, pr.pos.z, 0xff8a3a, pr.splash, 0.35);   // 착탄 폭발 (고블린 주술사)
    const inSplash = pr.splash > 0 && Math.hypot(pr.pos.x - p.x, pr.pos.z - p.z) <= pr.splash + PLAYER_RADIUS;
    if (!hitPlayerDirect && !inSplash) return;
    if (pr.onPlayerHit) { if (playerTargetable(g)) pr.onPlayerHit(g, pr); }
    else hitPlayer(g, pr.attacker, pr.spec, pr.effect, { x: pr.pos.x - pr.vel.x, z: pr.pos.z - pr.vel.z });   // 날아온 쪽 (막기 방향)
}

// --- 바닥 범위 효과 (포자 구름 등). { x, z, radius, duration, tick, onTick(g, zone), t, nextTick, mesh }
// o.disc = true 면 바닥에 붙은 납작한 원 (거미줄 지대·용암 웅덩이), 아니면 낮은 반구 모양 구름
function createGroundZone(g, o) {
    const mesh = new THREE.Mesh(o.disc ? getTelegraphAssets().circle : getCommonAssets().geo.sphere, o.mat || getMonsterCommon().cloud);
    mesh.scale.set(o.radius, o.disc ? 1 : o.radius * 0.35, o.radius);
    mesh.position.set(o.x, floorHeightAt(g.dungeon, o.x, o.z) + (o.disc ? 0.04 : 0.25), o.z);
    if (o.disc) mesh.renderOrder = 1;
    g.view.group.add(mesh);
    g.zones.push({ ...o, t: 0, nextTick: 0, mesh, dispose() { mesh.removeFromParent(); } });
}
// --- 짧은 연출 (10단계). 개체마다 재질을 복제해 투명도를 줄이고, 끝나면 dispose 한다 (4.6)
// 퍼지며 사라지는 구 (연기·폭발·펄스·순간이동)
function spawnPuff(g, x, y, z, color, radius, dur = 0.5) {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, depthWrite: false });
    const mesh = new THREE.Mesh(getCommonAssets().geo.sphere, mat);
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(radius * 0.3);
    g.view.group.add(mesh);
    g.effects.push({
        t: 0, dur,
        update(e) { const k = Math.min(1, e.t / e.dur); mesh.scale.setScalar(radius * (0.3 + 0.7 * k)); mat.opacity = 0.55 * (1 - k); },
        dispose() { mesh.removeFromParent(); mat.dispose(); },
    });
}
// 바닥에서 퍼지는 고리 (충격파·휩쓸기·펄스)
function spawnRing(g, x, z, radius, color, dur = 0.4) {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(getTelegraphAssets().ring, mat);
    mesh.position.set(x, floorHeightAt(g.dungeon, x, z) + 0.08, z);
    mesh.renderOrder = 2;
    g.view.group.add(mesh);
    g.effects.push({
        t: 0, dur,
        update(e) { const k = Math.min(1, e.t / e.dur); mesh.scale.setScalar(radius * (0.2 + 0.8 * k)); mat.opacity = 0.8 * (1 - k); },
        dispose() { mesh.removeFromParent(); mat.dispose(); },
    });
}
// 광선 (공허의 눈): from → to 를 잇는 밝은 원통이 0.25초 동안 가늘어지며 사라진다
function spawnBeamFlash(g, from, to, color) {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
    const dir = to.clone().sub(from), len = dir.length();
    const mesh = new THREE.Mesh(getCommonAssets().geo.cyl, mat);
    mesh.position.copy(from).addScaledVector(dir, 0.5);
    mesh.quaternion.setFromUnitVectors(limbUp, dir.normalize());
    mesh.scale.set(0.09, Math.max(0.01, len), 0.09);
    g.view.group.add(mesh);
    g.effects.push({
        t: 0, dur: 0.25,
        update(e) { const k = 1 - Math.min(1, e.t / e.dur); mesh.scale.x = mesh.scale.z = 0.09 * k + 0.01; mat.opacity = 0.9 * k; },
        dispose() { mesh.removeFromParent(); mat.dispose(); },
    });
}
// --- 보스 범위 패턴의 예고 표시 (AGENTS.md "범위 패턴 공격은 시작 전에 바닥에 붉은 예고 표시", 10-4)
// 바닥 위 0.05m 에 붉은 반투명 도형 + 안쪽에서 커지는 도형 (남은 시간). 도형·재질은 공유 (부채꼴은 각도별로 한 번 만든다)
let telegraphAssets = null;
function getTelegraphAssets() {
    if (telegraphAssets) return telegraphAssets;
    const mat = (opacity) => new THREE.MeshBasicMaterial({
        color: 0xff2a1a, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2,
    });
    telegraphAssets = {
        outer: mat(0.22), inner: mat(0.32),
        circle: new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2),                               // 반지름 1
        line: new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, -0.5),             // 폭 1, 원점에서 −Z 로 길이 1
        ring: new THREE.RingGeometry(0.86, 1, 40).rotateX(-Math.PI / 2),
        cones: {},
    };
    return telegraphAssets;
}
// 반지름 1, 가운데가 −Z (yaw 0 의 앞) 인 부채꼴. CircleGeometry 의 +Y 가 rotateX(−90°) 뒤 −Z 가 된다
function telegraphCone(deg) {
    const A = getTelegraphAssets();
    if (!A.cones[deg]) {
        const len = deg * Math.PI / 180;
        A.cones[deg] = new THREE.CircleGeometry(1, 32, Math.PI / 2 - len / 2, len).rotateX(-Math.PI / 2);
    }
    return A.cones[deg];
}
// shape = 'circle' { x, z, radius } | 'line' { x, z, yaw, length, width } | 'cone' { x, z, yaw, radius, angleDeg }.
// owner (몬스터) 가 죽으면 바로 사라진다. 반환: 연출 항목
function showTelegraph(g, shape, p, seconds, owner) {
    const A = getTelegraphAssets();
    const geo = shape === 'circle' ? A.circle : shape === 'cone' ? telegraphCone(p.angleDeg) : A.line;
    const group = new THREE.Group();
    group.position.set(p.x, floorHeightAt(g.dungeon, p.x, p.z) + 0.05, p.z);
    group.rotation.y = p.yaw || 0;
    const sx = shape === 'line' ? p.width : p.radius, sz = shape === 'line' ? p.length : p.radius;
    const outer = new THREE.Mesh(geo, A.outer), inner = new THREE.Mesh(geo, A.inner);
    outer.scale.set(sx, 1, sz);
    inner.position.y = 0.01;
    outer.renderOrder = inner.renderOrder = 1;
    group.add(outer, inner);
    g.view.group.add(group);
    const e = {
        t: 0, dur: seconds,
        update(ee) {
            if (owner && owner.dead) ee.t = ee.dur;
            const k = Math.max(0.02, Math.min(1, ee.t / ee.dur));
            inner.scale.set(shape === 'line' ? sx : sx * k, 1, sz * k);
        },
        dispose() { group.removeFromParent(); },
    };
    g.effects.push(e);
    return e;
}
function updateZones(g, dt) {
    for (const z of g.zones) {
        z.t += dt;
        while (z.t >= z.nextTick && z.nextTick < z.duration) {
            z.onTick(g, z);
            z.nextTick += z.tick;
        }
        z.mesh.rotation.y += dt * 0.4;
        z.mesh.scale.y = z.radius * (0.35 + Math.sin(z.t * 3) * 0.04);
    }
    if (g.zones.some((z) => z.t >= z.duration)) {
        for (const z of g.zones) if (z.t >= z.duration) z.dispose();
        g.zones = g.zones.filter((z) => z.t < z.duration);
    }
}

// --- 바닥 아이템: 골드 (8-11)·장비·소모품 (12-5). 1.5m 안에 들어가면 자동으로 줍는다 (U7).
// 인벤토리가 가득 차면 줍지 않고 안내 (그 아이템 범위에 들어올 때마다 한 번)
const PICKUP_RADIUS = 1.5;
const DROP_WALL_MARGIN = 0.35;   // 드롭 위치를 벽에서 이만큼 띄운다
function dropGold(g, x, z, amount) {
    g.drops.push(makeDrop({ kind: 'gold', amount }, x, z));
}
function makeDrop(item, x, z) {
    return { item, x, z, mesh: null, spin: Math.random() * 6, dispose() { if (this.mesh) this.mesh.removeFromParent(); this.mesh = null; } };
}
// 바닥 아이템 색: 장비 = 등급 색, 소모품 = 분류 색 (투척물은 속성 색)
function itemColor(item) {
    if (item.kind === 'equip') return RARITIES[item.rarity].color;
    return CONSUMABLE_ITEM_COLORS[item.id] || CONSUMABLE_COLORS[CONSUMABLES[item.id].category];
}
// 바닥 아이템 상자 재질 (색마다 한 번 만들어 공유, 4.6). 어두운 곳에서도 보이게 약하게 자체 발광
const dropMats = {};
function dropMat(color) {
    if (!dropMats[color]) dropMats[color] = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.45 });
    return dropMats[color];
}
// 작은 상자 (장비는 납작한 상자, 소모품은 세운 상자) 가 천천히 돌며 위아래로 흔들린다
function syncDropVisual(g, dr) {
    const gold = dr.item.kind === 'gold';
    if (!dr.mesh) {
        dr.mesh = gold ? new THREE.Mesh(getMonsterCommon().coin, getCommonAssets().mat.gold) : new THREE.Mesh(getCommonAssets().geo.box, dropMat(itemColor(dr.item)));
        if (!gold) dr.mesh.scale.set(...(dr.item.kind === 'equip' ? [0.34, 0.22, 0.34] : [0.2, 0.3, 0.2]));
        g.view.group.add(dr.mesh);
    }
    dr.mesh.position.set(dr.x, floorHeightAt(g.dungeon, dr.x, dr.z) + 0.35 + Math.sin(dr.spin * 1.5) * 0.08, dr.z);
    if (gold) dr.mesh.rotation.set(Math.PI / 2, 0, dr.spin * 2, 'YXZ');
    else dr.mesh.rotation.set(0, dr.spin * 1.2, 0);
}
function updateDrops(g, dt) {
    const p = g.player.pos;
    for (const dr of g.drops) {
        dr.spin += dt;
        if (dr.picked) continue;
        if (Math.hypot(dr.x - p.x, dr.z - p.z) > PICKUP_RADIUS || Math.abs(floorHeightAt(g.dungeon, dr.x, dr.z) - p.y) > 2) {
            dr.fullWarned = false;
            continue;
        }
        if (dr.item.kind === 'gold') {
            dr.picked = true;
            g.state.player.gold += dr.item.amount;
            spawnFloatingText(g, dr.x, p.y + 1.4, dr.z, `+${dr.item.amount} G`, '#f3d898', 0.9);
        } else if (addItem(g.state, dr.item)) {
            dr.picked = true;
            g.uiEvents.push({ type: 'pickup', item: dr.item });
        } else if (!dr.fullWarned) {
            dr.fullWarned = true;
            g.uiEvents.push({ type: 'toast', key: 'inv.fullPickup' });
        }
    }
    if (g.drops.some((dr) => dr.picked)) {
        for (const dr of g.drops) if (dr.picked) dr.dispose();
        g.drops = g.drops.filter((dr) => !dr.picked);
    }
}

// --- 떠오르는 글자 (피해 숫자 8-15, 골드). 개체마다 CanvasTexture → 끝나면 dispose.
// isText = 숫자가 아닌 글자 ("막기", "기절") → 메시지 글꼴 (AGENTS.md 글꼴 규칙)
function spawnFloatingText(g, x, y, z, text, color, scale = 1, isText = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 56;
    const ctx = canvas.getContext('2d');
    ctx.font = isText ? "700 34px 'Pretendard', 'Noto Sans KR', 'Noto Sans', sans-serif" : "700 38px 'D2Coding', 'Nanum Gothic Coding', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.strokeText(text, 80, 28);
    ctx.fillStyle = color;
    ctx.fillText(text, 80, 28);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sprite.renderOrder = 20;
    sprite.scale.set(1.2 * scale, 0.42 * scale, 1);
    sprite.position.set(x + (Math.random() - 0.5) * 0.4, y, z + (Math.random() - 0.5) * 0.4);
    g.view.group.add(sprite);
    g.effects.push({
        t: 0, dur: 0.8,
        update(e, dt) { sprite.position.y += dt * 1.1; sprite.material.opacity = 1 - (e.t / e.dur) ** 2; },
        dispose() { sprite.removeFromParent(); tex.dispose(); sprite.material.dispose(); },
    });
}
// 잠깐 보이는 연출 (떠오르는 글자·사라지는 시체·떨어지는 시체)
function updateEffects(g, dt) {
    for (const e of g.effects) {
        e.t += dt;
        if (e.update) e.update(e, dt);
    }
    if (g.effects.some((e) => e.t >= e.dur)) {
        for (const e of g.effects) if (e.t >= e.dur) e.dispose();
        g.effects = g.effects.filter((e) => e.t < e.dur);
    }
}
// 디버그 해시 &monster=br_mannequin (8-16): 주인공 앞 8m 에 1마리 (그 자리가 던전 밖이면 4m)
function spawnDebugMonster(g, typeId, elite) {
    if (!MONSTER_TYPES[typeId]) { console.warn('[debug] 없는 몬스터:', typeId); return null; }
    const p = g.player;
    let x = p.pos.x, z = p.pos.z;
    for (const dist of [8, 4, 2]) {
        x = p.pos.x - Math.sin(p.yaw) * dist;
        z = p.pos.z - Math.cos(p.yaw) * dist;
        if (cellAtWorld(g.dungeon, x, z)) break;
    }
    const m = createMonsterState(typeId, g.state.floor, { x, z, yaw: p.yaw + Math.PI, groupId: 999999, elite });
    if (g.state.hero === 'eric') setupEricMonster(m);   // 에릭 게임에서는 에릭 모드 (19단계 확인용)
    placeMonsterOnFloor(g, m);
    g.monsters.push(m);
    return m;
}
// ===== [15] 스킬 실행 =====
// --- 행동 슬롯 사용 (PROGRESS.md 8-8, 21-2). 마우스 왼쪽 버튼을 누르고 있는 동안 매 프레임 시도 → 쓸 수 있게 되면 바로 사용 (AGENTS.md)
const BOLT_SPEED = 30, BOLT_RANGE = 30, BOLT_RADIUS = 0.18;   // 완드·지팡이 마력탄 (AGENTS.md "투사체": 30 m/s, 30m)
const SWING_TIME = 0.2;                                         // 근접 무기 휘두르기 연출
const SKILL_MIN_COOLDOWN = 0.1;                                 // 재사용 대기 최소 (14-0)
const SKILL_DENY_FLASH = 0.35;                                  // 자원이 모자라면 HUD 슬롯이 이 시간 동안 붉게 (14-0)
const DASH_SPEED = 36;                                          // 돌진 (A4) 속도 m/s — 10m 를 약 0.28초에
const DASH_HIT_EXTRA = 0.3;                                     // 돌진 경로에서 몸 반지름 + 이만큼 안의 적이 맞는다
const BLINK_STEP = 0.2;                                         // 순간이동 (S6) 경로 검사 간격 (14-5)
const AIM_STEP = 0.25;                                          // 조준선·광선 판정 간격
const ELEMENT_SKILLS = ['fire', 'cold', 'lightning'];           // 원소 부여 (X1) 가 기억하는 원소 (game.lastElement)
const SKILL_COLORS = { arcane: 0xa890ff, fire: 0xff8a3a, cold: 0xa8e8ff, lightning: 0xfff27a, physical: 0xffd8a0, holy: 0xffe9a0, shout: 0xff7a5a };
// 스킬 버프의 HUD 아이콘 (한국어 1자 / 영어 2자, 갈래 색). 버프 id = 'skill:' + 스킬 id
const SKILL_BUFF_STYLE = {
    M9: ['뇌', 'TS', '#fff27a'], A3: ['칼', 'Bs', '#ffb08a'], D0: ['수', 'Gd', '#b8d8a8'], D3: ['가', 'Th', '#b8d8a8'], D8: ['보', 'Wd', '#b8d8a8'],
    D9: ['막', 'MS', '#d8e4ff'], S2: ['정', 'Pu', '#f0e08a'], S3: ['재', 'Rg', '#8ae07a'], S4: ['속', 'Hs', '#f0e08a'], S9: ['샘', 'Sp', '#7aa8ff'],
    X1: ['부', 'EW', '#e8a8ff'], X4: ['왜', 'TW', '#e8a8ff'],
};
function updatePlayerActions(g, dt) {
    for (const k of Object.keys(g.cooldowns)) {
        g.cooldowns[k] -= dt;
        if (g.cooldowns[k] <= 0) delete g.cooldowns[k];
    }
    g.swingT = Math.max(0, g.swingT - dt);
    updateSkillTimeline(g, dt);
    updateSkillBuffTicks(g, dt);
    tickFlashlight(g.state, g.flash, dt);   // 플래시 에너지·배터리 (18-2)
    const sp = g.state.player, active = sp.actionSlots[sp.activeSlot];
    if (active && active.type === 'item' && TOOLS[active.id]) {   // 플래시: 누르는 순간에만 켜고 끈다 (누르고 있어도 한 번, U41)
        if (input.locked && input.leftClicked && !g.hiding && !isDisabled(g.player)) toggleFlashlight(g.state, g.flash);
    } else if (input.locked && (input.mouseLeft || input.leftClicked) && !g.hiding) tryUseActiveSlot(g);   // 캐비닛 안에서는 행동 슬롯을 쓸 수 없다 (17-5).
    // leftClicked: 프레임 사이에 눌렀다 뗀 짧은 클릭도 한 번은 시도한다
}
// 활성 슬롯 사용. 반환: 사용했으면 true. 스킬은 castSkill (14-0), 소모품 (12-8) 은 인벤토리에서 같은 id 를 찾아 쓴다 (없으면 아무 일도 없음)
function tryUseActiveSlot(g) {
    const sp = g.state.player, slot = sp.actionSlots[sp.activeSlot];
    if (!slot || isDisabled(g.player)) return false;   // 빙결·기절: 공격·스킬 불가 (9-4)
    if (slot.type === 'skill') return castSkill(g, slot.id, sp.activeSlot);
    if (slot.type === 'item' && CONSUMABLES[slot.id]) return useConsumable(g, slot.id).ok;
    return false;
}
// --- 스킬 실행 공통 (14-0, AGENTS.md "스킬 > 기본 규칙"). 반환: 썼으면 true
// ① 빙결·기절이면 실패 ② 재사용 대기 중이면 조용히 실패 ③ 자원 (costAtLevel, 마나 샘이면 MP −30%, 스태미너 스킬은 탈진 중 불가) 이 모자라면
// 실패 + HUD 슬롯 붉게 ④ 소모 → 재사용 대기 = 표의 값 × (1 − 재사용 대기 감소%) (최소 0.1초, 기본 공격은 실제 공격 간격) ⑤ SKILL_HANDLERS 실행
function castSkill(g, id, slotIndex = -1) {
    const sp = g.state.player, def = Object.hasOwn(SKILL_BY_ID, id) ? SKILL_BY_ID[id] : null, lv = def ? sp.skills[id] || 0 : 0;
    if (!def || lv <= 0 || def.type !== 'active' || g.dead || isDisabled(g.player)) return false;
    if (g.cooldowns[id] > 0) return false;
    const cost = skillCost(g, def, lv);
    if (!canPaySkill(g, def, cost)) {
        g.slotDenied = { slot: slotIndex, at: g.time };
        return false;
    }
    if (def.resource === 'mp') sp.mp = Math.max(0, sp.mp - cost);
    else if (def.resource === 'stamina') spendStamina(g, cost);
    g.cooldowns[id] = skillCooldownFor(g, def, lv);
    if (ELEMENT_SKILLS.includes(def.element)) g.lastElement = def.element;
    SKILL_HANDLERS[id](g, skillContext(g, def, lv));
    return true;
}
// 소모량 (내부 계산은 소수점 유지): Lv1 소모량 × (1 + 0.05 × (Lv − 1)) 반올림, 마나 샘 (S9) 버프 중 MP −30%
function skillCost(g, def, lv) {
    if (!def.resource) return 0;
    let cost = costAtLevel(def.cost, lv);
    if (def.resource === 'mp') for (const b of g.buffs) if (b.mpCostReduce) cost *= 1 - b.mpCostReduce / 100;
    return cost;
}
function canPaySkill(g, def, cost) {
    const sp = g.state.player;
    if (def.resource === 'mp') return sp.mp >= cost;
    if (def.resource === 'stamina') return !g.player.exhausted && (sp.stamina >= cost || g.buffs.some((b) => b.noStaminaCost));
    return true;
}
function skillCooldownFor(g, def, lv) {
    if (def.cooldown === null) return g.derived.attackInterval;   // 기본 공격 (재사용 대기 감소 제외)
    return Math.max(SKILL_MIN_COOLDOWN, skillCooldown(def, lv) * (1 - g.derived.mods.cdrPct / 100));
}
// 조준 방향 (카메라 앞, 위아래 포함) 단위 벡터
function aimDir(p) {
    const cp = Math.cos(p.pitch);
    return new THREE.Vector3(-Math.sin(p.yaw) * cp, Math.sin(p.pitch), -Math.cos(p.yaw) * cp);
}
// 핸들러에 넘기는 것: { def, lv, v (values(lv)), dir (조준 방향), forward (수평 앞 { x, z }), eye (눈 위치) }
function skillContext(g, def, lv) {
    const p = g.player;
    return { def, lv, v: def.values(lv), dir: aimDir(p), forward: { x: -Math.sin(p.yaw), z: -Math.cos(p.yaw) }, eye: new THREE.Vector3(p.pos.x, p.pos.y + EYE_HEIGHT, p.pos.z) };
}
// 피해 종류 (computeDamage 의 spec)
function magicSpec(element, coef, canCrit = true) { return { kind: 'magic', element, coef, canCrit }; }
function meleeSpec(coef, extra) { return { kind: 'physical', element: 'physical', coef, canCrit: true, melee: true, ...extra }; }
// 근접 스킬의 판정 범위 = 근접 무기의 사거리·각도. 완드·지팡이를 들었으면 맨손 판정 (AGENTS.md "무기 종류 제한은 없다")
function meleeReach(g) { return g.derived.weapon.melee ? g.derived.weapon : WEAPON_TYPES.fist; }
// 예약 실행 (유성 낙하 1초 뒤, 연속 베기 0.2초 간격). 층이 바뀌면 지운다 (swapFloor)
function skillLater(g, delay, fn) { g.skillTimeline.push({ t: delay, fn }); }
function updateSkillTimeline(g, dt) {
    if (g.skillTimeline.length === 0) return;
    const due = [];
    for (const e of g.skillTimeline) if ((e.t -= dt) <= 0) due.push(e);
    if (due.length === 0) return;
    g.skillTimeline = g.skillTimeline.filter((e) => e.t > 0);
    for (const e of due) e.fn();
}
// 스킬 버프 (9-5 의 addBuff). extra = { mods, tick + onTick(g, buff) (지속 중 주기적으로: 번개 폭풍·칼날 폭풍·시간 왜곡), moveMul, knockImmune,
//   reflectPct, healPctPerSec, mpCostReduce, shieldHp·shieldMax, elemWeapon, statusImmune }. 다시 쓰면 효과·시간 갱신. 첫 tick 은 바로
function addSkillBuff(g, id, duration, extra = {}) {
    const [ko, en, color] = SKILL_BUFF_STYLE[id];
    return addBuff(g, { id: 'skill:' + id, remaining: duration, label: { ko, en }, color, ...extra, tickT: extra.tick || 0 });
}
function skillBuff(g, id) { return g.buffs.find((b) => b.id === 'skill:' + id) || null; }
function updateSkillBuffTicks(g, dt) {
    for (const b of g.buffs.slice()) {
        if (!b.onTick) continue;
        b.tickT += dt;
        while (b.tickT >= b.tick && b.remaining > 0 && !g.dead) {
            b.tickT -= b.tick;
            b.onTick(g, b);
        }
    }
}
// --- 피격 판정 도우미
// 주인공 앞 (수평) 부채꼴: 각도 ≤ halfDeg, 거리 ≤ range + 몸 반지름, 높이가 겹치고 벽에 가리지 않으면 그 각의 cos, 아니면 null
function meleeCos(g, m, range, halfDeg) {
    const p = g.player, dx = m.pos.x - p.pos.x, dz = m.pos.z - p.pos.z, dist = Math.hypot(dx, dz);
    if (m.dead || dist > range + m.radius) return null;
    const c = dist > 0.01 ? (dx * -Math.sin(p.yaw) + dz * -Math.cos(p.yaw)) / dist : 1;
    if (c < Math.cos((halfDeg * Math.PI) / 180)) return null;
    const bottom = m.def.hover ? m.pos.y - m.height / 2 : m.pos.y;
    if (bottom + m.height < p.pos.y - 0.3 || bottom > p.pos.y + EYE_HEIGHT + 0.7) return null;
    if (!hasLineOfSight(g, p.pos.x, p.pos.y + 1.2, p.pos.z, m.pos.x, monsterCenterY(m), m.pos.z)) return null;
    return c;
}
// 근접 판정 (기본 공격·연속 베기): 무기의 사거리·각도 안의 모든 적. 원소 부여 (X1) 추가 피해 포함. 반환: 맞힌 수
function meleeSweep(g, weapon, spec) {
    let hits = 0;
    for (const m of g.monsters.slice()) {   // 사본: 이 휘두르기로 분열한 슬라임 (새로 생긴 몬스터) 은 맞지 않는다
        if (meleeCos(g, m, weapon.range, weapon.arcDeg / 2) === null) continue;
        playerMeleeHit(g, m, spec);
        hits++;
    }
    return hits;
}
// 단일 대상 (강타·처형·깊은 상처·방패 강타): 범위 안에서 크로스헤어 방향에 가장 가까운 1마리 (같으면 가까운 쪽)
function pickTargetInFront(g, range, halfDeg) {
    let best = null, bestScore = Infinity;
    for (const m of g.monsters) {
        const c = meleeCos(g, m, range, halfDeg);
        if (c === null) continue;
        const score = (1 - c) * 10 + Math.hypot(m.pos.x - g.player.pos.x, m.pos.z - g.player.pos.z) * 0.05;
        if (score < bestScore) { best = m; bestScore = score; }
    }
    return best;
}
// 기본 공격·근거리 공격형 스킬의 한 대상 피해 + 원소 부여 (X1)
function playerMeleeHit(g, m, spec) {
    const r = damageMonster(g, m, spec);
    if (r) elementalWeaponHit(g, m);
    return r;
}
// 원소 부여 (X1): 버프 중 적중하면 마법 N% 를 마지막으로 쓴 화염·냉기·전격 스킬의 속성 (없으면 비전) 으로 추가, 10% 확률로 그 상태이상
function elementalWeaponHit(g, m) {
    const b = skillBuff(g, 'X1');
    if (!b || m.dead) return;
    const el = g.lastElement || 'arcane';
    const r = damageMonster(g, m, magicSpec(el, b.elemWeapon.coef));
    if (!r || m.dead || el === 'arcane' || Math.random() * 100 >= b.elemWeapon.chance) return;
    if (el === 'fire') applyPlayerStatus(g, m, 'burn', { sourceDamage: r.amount });
    else if (el === 'cold') applyPlayerStatus(g, m, 'slow', { cold: true });
    else applyPlayerStatus(g, m, 'shock');
}
// 주인공이 몬스터에게 거는 상태이상 + 패시브 보정: 화상 피해 +% (M2), 냉기 둔화 +%p (M5, opts.cold), 감전의 받는 피해 +%p (M8)
function applyPlayerStatus(g, m, id, opts = {}) {
    const mods = g.derived.mods, o = { ...opts };
    if (id === 'burn' && !Number.isFinite(o.dps) && o.sourceDamage > 0) o.dps = o.sourceDamage * STATUS_EFFECTS.burn.dotPct / 100 * (1 + mods.burnDmgPct / 100);
    if (id === 'slow' && o.cold) o.magnitude = (Number.isFinite(o.magnitude) ? o.magnitude : STATUS_EFFECTS.slow.slowPct) + mods.slowBonusPct;
    if (id === 'shock') o.magnitude = (Number.isFinite(o.magnitude) ? o.magnitude : STATUS_EFFECTS.shock.damageTakenPct) + mods.shockBonusPct;
    return applyStatusToMonster(g, m, id, o);
}
// 전격 피해 뒤 감전 확률 = 스킬의 확률 + 전격 숙련 (M8) 의 +%p
function lightningShock(g, m, baseChance) {
    if (!m.dead && Math.random() * 100 < baseChance + g.derived.mods.shockChancePct) applyPlayerStatus(g, m, 'shock');
}
// 폭발 (화염구·유성 낙하·낙뢰): 연출 + 반경 안 (벽에 가리지 않은) 모든 적에게 피해, onHit(m, r) 은 살아 있을 때
function skillBlast(g, pos, radius, spec, color, onHit) {
    const cy = Math.max(pos.y, floorHeightAt(g.dungeon, pos.x, pos.z) + 0.6);
    spawnPuff(g, pos.x, cy, pos.z, color, radius, 0.45);
    spawnRing(g, pos.x, pos.z, radius, color, 0.45);
    for (const m of monstersInBlast(g, pos.x, cy, pos.z, radius)) {
        const r = damageMonster(g, m, spec);
        if (r && !m.dead && onHit) onHit(m, r);
    }
}
// 조준선이 바닥에 닿는 점 (최대 maxDist m). 벽·천장에 먼저 닿거나 바닥에 닿지 않으면 그 앞의 마지막 빈 지점 아래 (14-0)
function aimGroundPoint(g, maxDist) {
    const p = g.player, dir = aimDir(p), pos = new THREE.Vector3(p.pos.x, p.pos.y + EYE_HEIGHT, p.pos.z);
    let last = { x: pos.x, z: pos.z };
    for (let s = 0; s < maxDist; s += AIM_STEP) {
        pos.addScaledVector(dir, AIM_STEP);
        if (cellAtWorld(g.dungeon, pos.x, pos.z) && pos.y <= floorHeightAt(g.dungeon, pos.x, pos.z)) return { x: pos.x, z: pos.z };
        if (projectileBlocked(g, pos)) break;
        last = { x: pos.x, z: pos.z };
    }
    return last;
}
// 조준선 (광선) 이 처음 닿는 적 (벽에서 끊김). 반환: { m (없으면 null), point (닿은 곳) }
function aimRayHit(g, origin, dir, range) {
    const pos = origin.clone(), near = g.monsters.filter((m) => !m.dead && Math.hypot(m.pos.x - origin.x, m.pos.z - origin.z) <= range + m.radius + 1);
    for (let s = 0; s < range; s += AIM_STEP) {
        pos.addScaledVector(dir, AIM_STEP);
        if (projectileBlocked(g, pos)) return { m: null, point: pos.addScaledVector(dir, -AIM_STEP) };
        for (const m of near) {
            const bottom = m.def.hover ? m.pos.y - m.height / 2 : m.pos.y;
            if (Math.hypot(pos.x - m.pos.x, pos.z - m.pos.z) <= m.radius + 0.25 && pos.y >= bottom - 0.2 && pos.y <= bottom + m.height + 0.2) return { m, point: pos };
        }
    }
    return { m: null, point: pos };
}
function monsterCenter(m) { return new THREE.Vector3(m.pos.x, monsterCenterY(m), m.pos.z); }
// 조준 방향 (카메라 앞, 위아래 포함) 으로 투사체. pierce = 첫 대상 뒤 더 관통할 수.
// o = { speed, radius, range, look (모양 재질), onHit(g, m, r) (적중 후, 살아 있든 아니든), onImpact(g, pr) (닿으면 그 자리에서 — 화염구) }
function firePlayerBolt(g, spec, pierce, o = {}) {
    const p = g.player, dir = aimDir(p);
    const from = new THREE.Vector3(p.pos.x, p.pos.y + EYE_HEIGHT - 0.15, p.pos.z).addScaledVector(dir, 0.5);
    spawnProjectile(g, {
        owner: 'player', pos: from, vel: dir.multiplyScalar(o.speed || BOLT_SPEED), radius: o.radius || BOLT_RADIUS, maxDist: o.range || BOLT_RANGE,
        element: spec.element, look: o.look, spec, pierce, onHit: o.onHit, onImpact: o.onImpact,
    });
}
// 돌진 (A4): 수평 앞 방향으로 dist m, 벽에 막히면 멈춘다. 지나간 자리의 적에게 한 번씩 피해 + 기절 (applyForcedMovement 가 움직인다)
function startDash(g, fwd, dist, spec, stun) {
    g.player.dash = { dx: fwd.x, dz: fwd.z, left: dist, hit: new Set(), spec, stun };
}
function updateDash(g, dt) {
    const p = g.player, ds = p.dash, step = Math.min(ds.left, DASH_SPEED * dt), x0 = p.pos.x, z0 = p.pos.z;
    moveWithCollision(g.view.collision, p.pos, PLAYER_RADIUS, ds.dx * step, ds.dz * step);
    const moved = Math.hypot(p.pos.x - x0, p.pos.z - z0);
    for (const m of g.monsters.slice()) {
        if (m.dead || ds.hit.has(m.uid) || segmentPointDist(x0, z0, p.pos.x, p.pos.z, m.pos.x, m.pos.z) > m.radius + PLAYER_RADIUS + DASH_HIT_EXTRA) continue;
        ds.hit.add(m.uid);
        const r = playerMeleeHit(g, m, ds.spec);
        if (r && !m.dead) applyStatusToMonster(g, m, 'stun', { duration: ds.stun });
    }
    ds.left -= step;
    g.swingT = SWING_TIME;
    if (ds.left <= 0.01 || moved < step * 0.5) p.dash = null;   // 다 갔거나 벽에 막힘
}
function segmentPointDist(ax, az, bx, bz, px, pz) {
    const vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz;
    const k = l2 > 1e-9 ? clamp(((px - ax) * vx + (pz - az) * vz) / l2, 0, 1) : 0;
    return Math.hypot(px - (ax + vx * k), pz - (az + vz * k));
}
// 순간이동 (S6): 수평 앞 방향으로 BLINK_STEP 간격으로 검사해 벽 (충돌 상자)·던전 밖에 닿기 직전 위치까지. 반환: 옮긴 거리
function blinkTarget(g, fwd, dist) {
    const p = g.player;
    let ok = { x: p.pos.x, z: p.pos.z };
    for (let s = BLINK_STEP; s <= dist + 1e-6; s += BLINK_STEP) {
        const q = { x: p.pos.x + fwd.x * s, z: p.pos.z + fwd.z * s };
        if (!cellAtWorld(g.dungeon, q.x, q.z)) break;
        const t = { x: q.x, z: q.z };
        resolveCircleVsBoxes(t, PLAYER_RADIUS, nearbyBoxes(g.view.collision, q.x, q.z));
        if (Math.hypot(t.x - q.x, t.z - q.z) > 1e-3) break;
        ok = q;
    }
    return ok;
}
// 지그재그 번개 (연쇄 번개·낙뢰): 0.15초 동안 보이는 선 + 가운데의 밝은 원통
function spawnLightning(g, from, to) {
    const pts = [from.clone()], n = 8, dir = to.clone().sub(from);
    for (let i = 1; i < n; i++) {
        const q = from.clone().addScaledVector(dir, i / n);
        q.x += (Math.random() - 0.5) * 0.6;
        q.y += (Math.random() - 0.5) * 0.6;
        q.z += (Math.random() - 0.5) * 0.6;
        pts.push(q);
    }
    pts.push(to.clone());
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: SKILL_COLORS.lightning, transparent: true, opacity: 1 });
    const line = new THREE.Line(geo, mat);
    g.view.group.add(line);
    g.effects.push({
        t: 0, dur: 0.15,
        update(e) { mat.opacity = 1 - e.t / e.dur; },
        dispose() { line.removeFromParent(); geo.dispose(); mat.dispose(); },
    });
    spawnBeamFlash(g, from, to, SKILL_COLORS.lightning);
}
// 바닥 표시 (유성 낙하 지점): dur 동안 깜빡이는 원
function spawnGroundMarker(g, x, z, radius, color, dur) {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
    const mesh = new THREE.Mesh(getTelegraphAssets().circle, mat);
    mesh.position.set(x, floorHeightAt(g.dungeon, x, z) + 0.05, z);
    mesh.scale.set(radius, 1, radius);
    mesh.renderOrder = 1;
    g.view.group.add(mesh);
    g.effects.push({
        t: 0, dur,
        update(e) { mat.opacity = 0.2 + 0.2 * Math.abs(Math.sin(e.t * 10)); },
        dispose() { mesh.removeFromParent(); mat.dispose(); },
    });
}
// 부채꼴 충격파 연출 (대지 분쇄): 바닥의 부채꼴이 0.4초 동안 사라진다
function spawnConeFlash(g, x, z, yaw, radius, deg, color) {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
    const mesh = new THREE.Mesh(telegraphCone(deg), mat);
    mesh.position.set(x, floorHeightAt(g.dungeon, x, z) + 0.06, z);
    mesh.rotation.y = yaw;
    mesh.scale.set(radius * 0.4, 1, radius * 0.4);
    mesh.renderOrder = 2;
    g.view.group.add(mesh);
    g.effects.push({
        t: 0, dur: 0.4,
        update(e) { const k = Math.min(1, e.t / e.dur); mesh.scale.set(radius * (0.4 + 0.6 * k), 1, radius * (0.4 + 0.6 * k)); mat.opacity = 0.6 * (1 - k); },
        dispose() { mesh.removeFromParent(); mat.dispose(); },
    });
}
// 스킬 전용 공유 재질 (게임 끝까지 유지, 4.6)
let skillAssets = null;
function getSkillAssets() {
    if (skillAssets) return skillAssets;
    const glass = (c, opacity) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity, depthWrite: false });
    skillAssets = { blizzard: glass(0xc8ecff, 0.28), ward: glass(0xffe08a, 0.32) };
    return skillAssets;
}
// HP·MP 를 그만큼 회복하고 떠오르는 글자 (quiet 면 글자 없음 — 초마다 회복하는 결계)
function restorePlayer(g, hp, mp, quiet) {
    const sp = g.state.player, d = g.derived, p = g.player.pos;
    const h = Math.max(0, Math.min(d.maxHp - sp.hp, hp)), m = Math.max(0, Math.min(d.maxMp - sp.mp, mp));
    sp.hp += h;
    sp.mp += m;
    if (quiet || !g.view) return;
    if (h >= 0.5) spawnFloatingText(g, p.x, p.y + 1.9, p.z, '+' + Math.round(h), '#8ae07a', 0.9);
    if (m >= 0.5) spawnFloatingText(g, p.x, p.y + 1.7, p.z, '+' + Math.round(m), '#7aa8ff', 0.9);
}
function hasShield(state) {
    const it = state.player.equipment.offhand;
    return !!it && EQUIP_BASES[it.baseId].offhandType === 'shield';
}
// --- 액티브 스킬 30개 (14-1 ~ 14-6, AGENTS.md 표의 수치는 각 스킬의 values(lv)). c = skillContext 결과.
// 패시브 15개는 핸들러 없이 PASSIVE_MODS (6.6) 와 훅 (M2·M5·M8 applyPlayerStatus·damageMonster, A8 흡혈, D6 불굴 damagePlayer, X2 반격 hitPlayer, S5 updateCellState)
const SKILL_HANDLERS = {
    // 기본 공격: 근접 무기 = 앞 부채꼴 (무기별 사거리·각도) 안의 모든 적에게 물리 / 완드·지팡이 = 조준 방향 마력탄 (지팡이 2명 관통)
    BA(g, c) {
        const d = g.derived;
        if (d.weapon.melee) {
            meleeSweep(g, d.weapon, meleeSpec(c.v.coef));
            g.swingT = SWING_TIME;
        } else {
            firePlayerBolt(g, magicSpec('arcane', c.v.magicCoef), d.weapon.pierce || 0, { look: 'arcane', onHit: (gg, m) => elementalWeaponHit(gg, m) });
            g.swingT = SWING_TIME * 0.6;
        }
    },
    // --- 마법형
    M0(g, c) { firePlayerBolt(g, magicSpec('arcane', c.v.coef), 0, { look: 'arcane', radius: 0.2 }); g.swingT = SWING_TIME * 0.6; },
    M1(g, c) {   // 화염구: 22 m/s, 닿은 자리에서 반경 3m 폭발 + 화상
        firePlayerBolt(g, magicSpec('fire', c.v.coef), 0, {
            speed: c.v.speed, radius: 0.32, look: 'fire',
            onImpact: (gg, pr) => skillBlast(gg, pr.pos, c.v.radius, magicSpec('fire', c.v.coef), SKILL_COLORS.fire,
                (m, r) => applyPlayerStatus(gg, m, 'burn', { sourceDamage: r.amount })),
        });
        g.swingT = SWING_TIME * 0.6;
    },
    M3(g, c) {   // 유성 낙하: 조준 지점에 1초 뒤 반경 5m + 3초간 불타는 지면 (0.5초마다 그 몫)
        const v = c.v, pt = aimGroundPoint(g, BOLT_RANGE);
        spawnGroundMarker(g, pt.x, pt.z, v.radius, SKILL_COLORS.fire, v.delay);
        spawnFallingRock(g, pt.x, pt.z, v.delay);
        skillLater(g, v.delay, () => {
            const y = floorHeightAt(g.dungeon, pt.x, pt.z);
            skillBlast(g, new THREE.Vector3(pt.x, y + 0.6, pt.z), v.radius, magicSpec('fire', v.coef), SKILL_COLORS.fire);
            createGroundZone(g, {
                x: pt.x, z: pt.z, radius: v.radius, duration: v.groundTime, tick: 0.5, disc: true, mat: getMonsterCommon().lavaZone,
                onTick: (gg, zone) => {
                    for (const m of monstersInBlast(gg, zone.x, y + 0.6, zone.z, zone.radius)) damageMonster(gg, m, magicSpec('fire', v.groundCoef * zone.tick, false));
                },
            });
        });
        g.swingT = SWING_TIME * 0.6;
    },
    M4(g, c) {   // 얼음 창: 최대 3명 관통 + 둔화
        firePlayerBolt(g, magicSpec('cold', c.v.coef), c.v.maxTargets - 1, {
            look: 'cold', radius: 0.22, onHit: (gg, m) => { if (!m.dead) applyPlayerStatus(gg, m, 'slow', { cold: true }); },
        });
        g.swingT = SWING_TIME * 0.6;
    },
    M6(g, c) {   // 눈보라: 조준 지점 반경 7m, 5초, 0.5초마다 냉기 피해 + 범위 안 둔화 40%
        const v = c.v, pt = aimGroundPoint(g, BOLT_RANGE);
        createGroundZone(g, {
            x: pt.x, z: pt.z, radius: v.radius, duration: v.duration, tick: v.tick, mat: getSkillAssets().blizzard,
            onTick: (gg, zone) => {
                const y = floorHeightAt(gg.dungeon, zone.x, zone.z) + 0.6;
                for (let i = 0; i < 3; i++) {
                    const a = Math.random() * Math.PI * 2, r = Math.random() * zone.radius;
                    spawnPuff(gg, zone.x + Math.cos(a) * r, y + 1.5 + Math.random() * 2, zone.z + Math.sin(a) * r, 0xeaf6ff, 0.6, 0.5);
                }
                for (const m of monstersInBlast(gg, zone.x, y, zone.z, zone.radius)) {
                    const r = damageMonster(gg, m, magicSpec('cold', v.coef));
                    if (r && !m.dead) applyPlayerStatus(gg, m, 'slow', { cold: true, magnitude: v.slow, duration: zone.tick + 0.3 });
                }
            },
        });
        g.swingT = SWING_TIME * 0.6;
    },
    M7(g, c) {   // 연쇄 번개: 즉발 (20m) → 8m 안의 다른 적에게 튕김 (튕길 때마다 −10%), 감전 20%
        const v = c.v, hand = c.eye.clone().addScaledVector(c.dir, 2.5).add(new THREE.Vector3(c.forward.z * -0.3, -0.3, c.forward.x * 0.3));   // 카메라 바로 옆에서 시작하면 화면을 덮는다
        const first = aimRayHit(g, c.eye, c.dir, v.range);
        spawnLightning(g, hand, first.point);
        g.swingT = SWING_TIME * 0.6;
        const done = new Set();
        let target = first.m, coef = v.coef;
        for (let i = 0; i <= v.bounces && target; i++) {
            done.add(target.uid);
            const at = monsterCenter(target);
            const r = damageMonster(g, target, magicSpec('lightning', coef));
            if (r) lightningShock(g, target, v.shockChance);
            let next = null, best = Infinity;
            for (const m of g.monsters) {
                if (m.dead || done.has(m.uid)) continue;
                const dd = Math.hypot(m.pos.x - at.x, m.pos.z - at.z);
                if (dd <= v.bounceRange + m.radius && dd < best && hasLineOfSight(g, at.x, at.y, at.z, m.pos.x, monsterCenterY(m), m.pos.z)) { next = m; best = dd; }
            }
            if (next) spawnLightning(g, at, monsterCenter(next));
            coef *= 1 - v.falloff / 100;
            target = next;
        }
    },
    M9(g, c) {   // 번개 폭풍: 8초간 0.5초마다 주위 12m 안 (벽에 가리지 않은) 무작위 적 자리에 낙뢰 (반경 2m)
        const v = c.v;
        addSkillBuff(g, 'M9', v.duration, {
            tick: v.interval,
            onTick: (gg) => {
                const p = gg.player.pos, list = gg.monsters.filter((m) => !m.dead && Math.hypot(m.pos.x - p.x, m.pos.z - p.z) <= v.radius + m.radius
                    && hasLineOfSight(gg, p.x, p.y + EYE_HEIGHT, p.z, m.pos.x, monsterCenterY(m), m.pos.z));
                if (list.length === 0) return;
                const t0 = list[Math.floor(Math.random() * list.length)], y = floorHeightAt(gg.dungeon, t0.pos.x, t0.pos.z);
                spawnLightning(gg, new THREE.Vector3(t0.pos.x, y + 9, t0.pos.z), new THREE.Vector3(t0.pos.x, y, t0.pos.z));
                skillBlast(gg, new THREE.Vector3(t0.pos.x, y + 0.6, t0.pos.z), v.strikeRadius, magicSpec('lightning', v.coef), SKILL_COLORS.lightning,
                    (m) => lightningShock(gg, m, 0));
            },
        });
    },
    // --- 근거리 공격형 (스태미너). 무기 판정 (meleeReach), 적중 시 원소 부여 (X1)
    A0(g, c) {   // 강타: 앞 1마리 + 넉백 3m
        const w = meleeReach(g), m = pickTargetInFront(g, w.range, w.arcDeg / 2);
        g.swingT = SWING_TIME;
        if (!m) return;
        const r = playerMeleeHit(g, m, meleeSpec(c.v.coef));
        if (r && !m.dead) knockMonster(m, g.player.pos.x, g.player.pos.z, c.v.knockback);
    },
    A1(g, c) {   // 연속 베기: 0.6초간 3회 (0, 0.2, 0.4초) 무기 판정
        const step = c.v.duration / c.v.hits;
        for (let i = 0; i < c.v.hits; i++) {
            skillLater(g, i * step, () => {
                meleeSweep(g, meleeReach(g), meleeSpec(c.v.coef));
                g.swingT = SWING_TIME;
            });
        }
    },
    A3(g, c) {   // 칼날 폭풍: 3초간 0.25초마다 주위 4m, 이동 속도 −30%, 넉백 면역 (주인공은 경직이 없다)
        const v = c.v;
        addSkillBuff(g, 'A3', v.duration, {
            moveMul: 1 - v.moveSlow / 100, knockImmune: true, tick: v.interval,
            onTick: (gg) => {
                const p = gg.player.pos;
                spawnRing(gg, p.x, p.z, v.radius, SKILL_COLORS.physical, 0.25);
                gg.swingT = SWING_TIME;
                for (const m of gg.monsters.slice()) {
                    if (m.dead || meleeCos(gg, m, v.radius, 180) === null) continue;
                    playerMeleeHit(gg, m, meleeSpec(v.coef));
                }
            },
        });
    },
    A4(g, c) { startDash(g, c.forward, c.v.distance, meleeSpec(c.v.coef), c.v.stun); },   // 돌진: 최대 10m, 지나간 적에게 피해 + 기절 0.5초
    A6(g, c) {   // 처형: 앞 1마리, HP 30% 이하면 피해 2배, 처치하면 재사용 대기 50% 반환
        const v = c.v, w = meleeReach(g), m = pickTargetInFront(g, w.range, w.arcDeg / 2);
        g.swingT = SWING_TIME;
        if (!m) return;
        const low = m.hp <= m.maxHp * v.executeHpPct / 100;
        if (low) spawnPuff(g, m.pos.x, monsterCenterY(m), m.pos.z, 0xff3a2a, m.radius + 0.6, 0.3);
        const r = playerMeleeHit(g, m, meleeSpec(v.coef * (low ? v.executeMul : 1)));
        if (r && m.dead && g.cooldowns.A6 > 0) g.cooldowns.A6 *= 1 - v.refundPct / 100;
    },
    A7(g, c) {   // 깊은 상처: 앞 1마리 + 5초간 출혈 (총 물리 N%, 방어력 무시 → 초당 그 1/5, U49)
        const v = c.v, w = meleeReach(g), m = pickTargetInFront(g, w.range, w.arcDeg / 2);
        g.swingT = SWING_TIME;
        if (!m) return;
        const r = playerMeleeHit(g, m, meleeSpec(v.coef));
        if (!r || m.dead) return;
        const total = computeDamage(playerAttacker(g), { defense: 0, res: {}, damageTakenPct: 0 }, meleeSpec(v.bleedCoef, { canCrit: false, ignoreDefense: true })).amount;
        applyStatusToMonster(g, m, 'bleed', { duration: v.bleedTime, dps: total / v.bleedTime });
    },
    A9(g, c) {   // 대지 분쇄: 앞 8m · 90° 부채꼴 충격파 + 기절 1.5초
        const v = c.v, p = g.player;
        spawnConeFlash(g, p.pos.x, p.pos.z, p.yaw, v.range, v.arcDeg, 0xffb060);
        g.swingT = SWING_TIME;
        for (const m of g.monsters.slice()) {
            if (meleeCos(g, m, v.range, v.arcDeg / 2) === null) continue;
            const r = playerMeleeHit(g, m, meleeSpec(v.coef));
            if (r && !m.dead) applyStatusToMonster(g, m, 'stun', { duration: v.stun });
        }
    },
    // --- 방어형
    D0(g, c) { addSkillBuff(g, 'D0', c.v.duration, { mods: { damageTakenPct: -c.v.reduction }, knockImmune: true }); },
    D1(g, c) {   // 방패 강타: 앞 1마리 물리 N% + 방어력 × 50%, 기절. 방패면 피해 +30%·기절 1.5배
        const v = c.v, w = meleeReach(g), m = pickTargetInFront(g, w.range, w.arcDeg / 2), shield = hasShield(g.state);
        g.swingT = SWING_TIME;
        if (!m) return;
        const r = damageMonster(g, m, meleeSpec(v.coef, { flat: g.derived.defense * v.defCoef / 100, bonusPct: shield ? v.shieldDmgPct : 0 }));
        if (r && !m.dead) applyStatusToMonster(g, m, 'stun', { duration: v.stun * (shield ? v.shieldStunMul : 1) });
    },
    D3(g, c) { addSkillBuff(g, 'D3', c.v.duration, { mods: { defPct: c.v.defPct }, reflectPct: c.v.reflectPct }); },
    D5(g, c) {   // 위협의 함성: 주위 10m 적의 공격력 −N% 6초, 보스가 아니면 공포 2초
        const v = c.v, p = g.player.pos;
        spawnRing(g, p.x, p.z, v.radius, SKILL_COLORS.shout, 0.5);
        for (const m of g.monsters) {
            if (m.dead || Math.hypot(m.pos.x - p.x, m.pos.z - p.z) > v.radius + m.radius) continue;
            m.custom.weakenT = v.duration;
            m.custom.weakenPct = v.atkDown;
            if (!m.isBoss) applyStatusToMonster(g, m, 'fear', { duration: v.fear });
        }
    },
    D8(g, c) { addSkillBuff(g, 'D8', c.v.duration, { mods: { resAll: c.v.resAll, resCapBonus: c.v.resCap - 75 } }); },
    D9(g, c) {   // 마력 보호막: [최대 MP × N% + 마법 공격력 × 200%] 흡수 (damagePlayer 에서 HP 보다 먼저 깎임)
        const d = g.derived, hp = d.maxMp * c.v.mpPct / 100 + d.magicAtk * c.v.magicCoef / 100;
        addSkillBuff(g, 'D9', c.v.duration, { shieldHp: hp, shieldMax: hp });
    },
    // --- 보조형
    S0(g, c) { restorePlayer(g, g.derived.maxHp * c.v.healPct / 100, 0); },
    S2(g, c) {   // 정화: 모든 상태이상 해제 + 면역
        g.player.effects.length = 0;
        addSkillBuff(g, 'S2', c.v.immune, { statusImmune: true });
        g.player.statusImmune = true;
    },
    S3(g, c) { addSkillBuff(g, 'S3', c.v.duration, { healPctPerSec: c.v.healPct }); },
    S4(g, c) { addSkillBuff(g, 'S4', c.v.duration, { mods: { moveSpeedPct: c.v.moveSpeedPct, atkSpeedPct: c.v.atkSpeedPct } }); },
    S6(g, c) {   // 순간이동: 수평 조준 방향 최대 N m (벽 앞에서 멈춤) + 0.3초 무적
        const p = g.player, to = blinkTarget(g, c.forward, c.v.distance);
        spawnPuff(g, p.pos.x, p.pos.y + 1, p.pos.z, SKILL_COLORS.arcane, 1, 0.35);
        p.pos.x = to.x;
        p.pos.z = to.z;
        p.dash = null;
        p.invulnUntil = g.time + c.v.invuln;
        spawnPuff(g, to.x, p.pos.y + 1, to.z, SKILL_COLORS.arcane, 1.2, 0.4);
        updateCellState(g);
    },
    S9(g, c) {   // 마나 샘: 최대 MP 의 N% 회복 + 8초간 스킬 MP 소모 −30%
        restorePlayer(g, 0, g.derived.maxMp * c.v.restorePct / 100);
        addSkillBuff(g, 'S9', c.v.duration, { mpCostReduce: c.v.mpCostReduce });
    },
    // --- 교차 스킬
    X1(g, c) { addSkillBuff(g, 'X1', c.v.duration, { elemWeapon: { coef: c.v.coef, chance: c.v.effectChance } }); },
    X3(g, c) {   // 임시 성역: 지금 위치 반경 4m 결계 8초 — 적 투사체 소멸 (stepMonsterProjectile), 안에 있으면 HP·MP 초당 N%. 저장·몬스터 차단은 없음
        const v = c.v, p = g.player.pos;
        createGroundZone(g, {
            x: p.x, z: p.z, radius: v.radius, duration: v.duration, tick: 0.5, ward: true, disc: true, mat: getSkillAssets().ward,
            onTick: (gg, zone) => {
                const q = gg.player.pos, d = gg.derived;
                if (Math.hypot(q.x - zone.x, q.z - zone.z) > zone.radius) return;
                restorePlayer(gg, d.maxHp * v.regenPct / 100 * zone.tick, d.maxMp * v.regenPct / 100 * zone.tick, true);
            },
        });
        spawnRing(g, p.x, p.z, v.radius, SKILL_COLORS.holy, 0.5);
    },
    X4(g, c) {   // 시간 왜곡: 6초간 주위 12m 의 적 (둔화, 끝날 때까지) 과 적 투사체 (한 번 느려지면 그대로) 속도 −N%
        const v = c.v;
        spawnRing(g, g.player.pos.x, g.player.pos.z, v.radius, SKILL_COLORS.arcane, 0.6);
        addSkillBuff(g, 'X4', v.duration, {
            tick: 0.25,
            onTick: (gg, b) => {
                const p = gg.player.pos;
                for (const m of gg.monsters) {
                    if (!m.dead && Math.hypot(m.pos.x - p.x, m.pos.z - p.z) <= v.radius + m.radius) applyStatusToMonster(gg, m, 'slow', { magnitude: v.slowPct, duration: b.remaining });
                }
                for (const pr of gg.projectiles) {
                    if (pr.owner !== 'monster' || pr.warped || Math.hypot(pr.pos.x - p.x, pr.pos.z - p.z) > v.radius) continue;
                    pr.vel.multiplyScalar(1 - v.slowPct / 100);
                    pr.warped = true;
                }
            },
        });
    },
};
// --- 화면 오른쪽 아래 무기 모양 (8-8). 카메라의 자식으로 붙이고, 벽에 묻히지 않게 깊이 검사 없이 맨 위에 그린다.
// 재질은 무기 종류별로 한 번 만들어 공유 (게임이 끝날 때까지 유지).
// transparent (불투명도 1) 로 두어 반투명 물체 (보스 예고 표시·구름) 보다 나중에 그린다 — 불투명 재질이면 그 위에 덧칠된다 (10단계)
const viewModelMats = {};
function viewModelMat(color) {
    if (!viewModelMats[color]) viewModelMats[color] = new THREE.MeshLambertMaterial({ color, depthTest: false, depthWrite: false, transparent: true });
    return viewModelMats[color];
}
// 무기 종류 → 부품 [도형 (cyl 원통 / box 상자 / sphere 구), 색, 크기 x, y (길이), z, 손잡이에서 부품 중심까지 거리, 발광].
// 원통은 (반지름, 길이, 반지름), 상자는 (폭, 길이, 두께), 구는 (반지름 ×3). 검 = 납작한 날 + 코등이 + 손잡이, 지팡이 = 긴 원통 + 발광 구 (12-9)
const VIEW_MODEL_SHAPES = {
    pipe: [['cyl', 0x55524e, 0.03, 0.85, 0.03, 0.32], ['cyl', 0x22201e, 0.034, 0.22, 0.034, 0]],   // 쇠파이프 + 손잡이 테이프
    sword: [['box', 0xc4c8d0, 0.07, 0.86, 0.014, 0.58], ['box', 0x8a7a5a, 0.2, 0.035, 0.05, 0.13], ['cyl', 0x4a3a2a, 0.024, 0.22, 0.024, 0],
        ['sphere', 0x8a7a5a, 0.035, 0.035, 0.035, -0.13]],
    gsword: [['box', 0xc4c8d0, 0.1, 1.15, 0.018, 0.78], ['box', 0x8a7a5a, 0.3, 0.045, 0.06, 0.18], ['cyl', 0x4a3a2a, 0.03, 0.32, 0.03, 0],
        ['sphere', 0x8a7a5a, 0.045, 0.045, 0.045, -0.18]],
    dagger: [['box', 0xd0d4dc, 0.05, 0.4, 0.012, 0.3], ['box', 0x6a5a40, 0.11, 0.025, 0.04, 0.09], ['cyl', 0x4a3a2a, 0.022, 0.16, 0.022, 0]],
    wand: [['cyl', 0x6a4a2a, 0.018, 0.5, 0.018, 0.2], ['sphere', 0xc0a0ff, 0.04, 0.04, 0.04, 0.47, true]],
    staff: [['cyl', 0x5a3a20, 0.028, 1.35, 0.028, 0.45], ['cyl', 0x8a7a5a, 0.04, 0.06, 0.04, 1.08], ['sphere', 0xc0a0ff, 0.075, 0.075, 0.075, 1.18, true]],
};
// 발광 부품 (완드·지팡이 끝의 구): 조명과 상관없이 밝게
const viewModelGlowMats = {};
function viewModelGlowMat(color) {
    if (!viewModelGlowMats[color]) viewModelGlowMats[color] = new THREE.MeshBasicMaterial({ color, depthTest: false, depthWrite: false, transparent: true });
    return viewModelGlowMats[color];
}
const VIEW_GRIP = new THREE.Vector3(0.36, -0.36, -0.5);                                  // 카메라 기준 손잡이 위치
const VIEW_BASE_QUAT = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), // 무기가 앞쪽 약간 왼쪽 위를 가리킨다
    new THREE.Vector3(-0.12, 0.5, -0.86).normalize());
const viewSwingEuler = new THREE.Euler(), viewSwingQuat = new THREE.Quaternion();
function syncViewModel(g) {
    const type = g.derived ? g.derived.weaponType : 'fist';
    if (!g.viewModel || g.viewModel.type !== type) {
        if (g.viewModel) g.viewModel.group.removeFromParent();
        const group = new THREE.Group(), G = getCommonAssets().geo;   // group 원점 = 손잡이 (휘두를 때 회전 중심)
        for (const [shape, color, sx, sy, sz, center, glow] of VIEW_MODEL_SHAPES[type] || []) {
            partMesh(group, G[shape], glow ? viewModelGlowMat(color) : viewModelMat(color), 0, center, 0, sx, sy, sz).renderOrder = 10;
        }
        app.camera.add(group);
        g.viewModel = { type, group };
    }
    // 휘두르기: 오른쪽 위에서 왼쪽 아래로 크게 돈다 (0 → 1 → 0). 달릴 때는 살짝 흔들린다
    const s = g.swingT > 0 ? Math.sin((1 - g.swingT / SWING_TIME) * Math.PI) : 0;
    const bob = g.player.running ? Math.sin(g.time * 14) * 0.015 : 0;
    const vm = g.viewModel.group;
    vm.position.set(VIEW_GRIP.x - s * 0.12, VIEW_GRIP.y + bob - s * 0.04, VIEW_GRIP.z);
    viewSwingEuler.set(-s * 1.1, s * 0.5, s * 0.9);
    vm.quaternion.setFromEuler(viewSwingEuler).multiply(viewSwingQuat.copy(VIEW_BASE_QUAT));
}
// ===== [16] 아이템 사용·드롭·상점 =====
// 인벤토리에 있는 소모품 개수 (여러 칸 합계)
function countConsumable(player, id) {
    let n = 0;
    for (const it of player.inventory) if (it && it.kind === 'consumable' && it.id === id) n += it.count;
    return n;
}
// 소모품 재사용 대기 키 (AGENTS.md: 물약류 공용, 투척물 공용, 영약·주문서는 각자). game.cooldowns 의 키
function itemCooldownKey(id) {
    const c = CONSUMABLES[id].category;
    if (c === 'hp' || c === 'mp' || c === 'sta' || c === 'cure') return 'item:potion';
    if (c === 'throw') return 'item:throw';
    return 'item:' + id;
}

// --- 장비 생성 (12-1, AGENTS.md "장비 > 공통 규칙"·"부가 옵션"·"반지"). rng: () => 0 이상 1 미만 (드롭은 Math.random, 상인 재고는 createRng)
//   opts: { tier (단계 지정), baseId (기본 아이템 지정), rarity (등급 지정), rarityWeights ({ normal, magic, rare } %, 상인용),
//           rareBonus (희귀 확률 +%p: 정예 10, 보스 30) }
// 반환: 장비 인스턴스 (6.2). uid 는 붙이지 않는다 (인벤토리에 들어올 때 addItem 이 붙인다). iLv = 획득한 층
const EQUIP_TIER_WEIGHTS = [60, 30, 10];                  // 등장 가능한 가장 높은 단계 / 한 단계 아래 / 두 단계 아래 (%)
const RARE_CHANCE = { perFloor: 0.2, max: 20 };           // 희귀 확률 = min(20, 7 + 0.2 × 층) (7 = RARITIES.rare.weight)
function rollEquipTier(rng, floor) {
    const avail = [1, 2, 3].filter((t) => floor >= TIER_INFO[t].minFloor);
    const top = avail.length > 0 ? avail[avail.length - 1] : 1;
    const tiers = [top, top - 1, top - 2];
    const weights = EQUIP_TIER_WEIGHTS.map((w, i) => (tiers[i] >= 1 ? w : 0));
    weights[0] += 100 - weights.reduce((a, b) => a + b, 0);   // 없는 단계의 확률은 가장 높은 단계에 더한다
    return pickWeighted(tiers, weights, rng);
}
// 등급 확률 (%): 희귀가 늘어난 만큼 일반이 줄어든다 (AGENTS.md "등급")
function equipRarityWeights(floor, rareBonus = 0) {
    const rare = Math.min(RARE_CHANCE.max, RARITIES.rare.weight + RARE_CHANCE.perFloor * floor) + rareBonus;
    const magic = RARITIES.magic.weight;
    return { normal: Math.max(0, 100 - magic - rare), magic, rare };
}
// 부가 옵션 하나: 값은 단계 범위 안에서 균등 무작위. 고정 수치 (스탯 +N) 는 정수로 뽑아 iLv 보정 후 반올림, % 값은 소수 1자리
function rollAffix(rng, id, tier, scale) {
    const a = AFFIXES[id], [min, max] = a.ranges[tier];
    const value = a.scales ? Math.max(1, Math.round(randInt(rng, min, max) * scale)) : Math.round(lerp(min, max, rng()) * 10) / 10;
    return a.sub ? { id, sub: a.sub[Math.floor(rng() * a.sub.length)], value } : { id, value };
}
function rollEngraving(rng, tier, scale) {
    const ids = Object.keys(RING_ENGRAVINGS), id = ids[Math.floor(rng() * ids.length)], e = RING_ENGRAVINGS[id];
    const value = e.scales ? Math.max(1, Math.round(e.values[tier] * scale)) : e.values[tier];
    return e.sub ? { id, sub: e.sub[Math.floor(rng() * e.sub.length)], value } : { id, value };
}
// 부가 옵션의 이름 수식어 [한국어, 영어]
function affixPrefix(a) {
    const p = AFFIX_PREFIX[a.id];
    return Array.isArray(p) ? p : p[a.sub];
}
function generateEquipment(rng, floor, opts = {}) {
    const iLv = Math.max(1, Math.floor(floor));
    const base = opts.baseId && EQUIP_BASES[opts.baseId] && EQUIP_BASES[opts.baseId].tier > 0 ? EQUIP_BASES[opts.baseId] : null;
    const tier = base ? base.tier : (TIER_INFO[opts.tier] ? opts.tier : rollEquipTier(rng, iLv));
    const pickBase = base || (() => {
        const list = Object.values(EQUIP_BASES).filter((b) => b.tier === tier);
        return list[Math.floor(rng() * list.length)];
    })();
    let rarity = opts.rarity;
    if (!RARITIES[rarity]) {
        const w = opts.rarityWeights || equipRarityWeights(iLv, opts.rareBonus || 0);
        rarity = pickWeighted(['normal', 'magic', 'rare'], [w.normal || 0, w.magic || 0, w.rare || 0], rng);
    }
    const scale = itemLevelScale(pickBase.reqLv, iLv);
    const slotTag = affixSlotOf(pickBase);
    const pool = Object.keys(AFFIXES).filter((id) => AFFIXES[id].slots.includes(slotTag));
    const [cMin, cMax] = RARITIES[rarity].affixCount;
    const count = Math.min(pool.length, randInt(rng, cMin, cMax));
    const affixes = [];
    for (let i = 0; i < count; i++) {   // 한 장비에 같은 옵션은 중복되지 않는다
        const id = pool.splice(Math.floor(rng() * pool.length), 1)[0];
        affixes.push(rollAffix(rng, id, tier, scale));
    }
    const engraving = pickBase.slot === 'ring' ? rollEngraving(rng, tier, scale) : null;
    let name = { ko: pickBase.nameKo, en: pickBase.nameEn };
    if (rarity === 'magic' && affixes.length > 0) {
        const [ko, en] = affixPrefix(affixes[0]);
        name = { ko: `${ko} ${pickBase.nameKo}`, en: `${en} ${pickBase.nameEn}` };
    } else if (rarity === 'rare') {
        const a = RARE_NAME_FIRST[Math.floor(rng() * RARE_NAME_FIRST.length)], b = RARE_NAME_SECOND[Math.floor(rng() * RARE_NAME_SECOND.length)];
        name = { ko: `${a[0]} ${b[0]}`, en: `${a[1]} ${b[1]}` };
    }
    return { kind: 'equip', baseId: pickBase.id, tier, iLv, rarity, name, engraving, affixes };
}

// --- 인벤토리 조작 (12-4). 순수 함수 (state 만 바꾼다). 실패 이유 (reason) 는 번역 키
// 아이템 하나를 넣는다. 소모품은 같은 id 칸에 20개까지 합치고 남으면 빈칸에, 장비는 빈칸에 (uid 가 없으면 state.nextUid 로 발급).
// 공간이 모자라면 아무것도 바꾸지 않고 false
function addItem(state, item) {
    const inv = state.player.inventory;
    if (!isPlainObject(item)) return false;
    if (item.kind === 'consumable') {
        if (!CONSUMABLES[item.id]) return false;
        const max = stackMaxOf(item.id);   // 1칸 최대 개수 (에릭 전용 아이템은 아이템별, 22-2)
        let left = Math.max(1, Math.floor(item.count || 1)), room = 0;
        for (const it of inv) {
            if (it === null) room += max;
            else if (it.kind === 'consumable' && it.id === item.id) room += max - it.count;
        }
        if (CONSUMABLES[item.id].unique) room = Math.min(room, Math.max(0, max - countConsumable(state.player, item.id)));   // 카드키: 1개만 (U53)
        if (room < left) return false;
        for (const it of inv) {
            if (left <= 0) break;
            if (it && it.kind === 'consumable' && it.id === item.id && it.count < max) {
                const n = Math.min(left, max - it.count);
                it.count += n;
                left -= n;
            }
        }
        for (let i = 0; i < inv.length && left > 0; i++) {
            if (inv[i] !== null) continue;
            const n = Math.min(left, max);
            inv[i] = { kind: 'consumable', id: item.id, count: n };
            left -= n;
        }
        return true;
    }
    if (item.kind !== 'equip' || !EQUIP_BASES[item.baseId]) return false;
    const i = inv.indexOf(null);
    if (i < 0) return false;
    if (!Number.isInteger(item.uid)) item.uid = state.nextUid++;
    inv[i] = item;
    return true;
}
// index 칸에서 count 개 (소모품) 또는 통째로 (장비·count 없음) 뺀다. 반환: 뺀 아이템 (없으면 null)
function removeItemAt(state, index, count) {
    const inv = state.player.inventory, it = inv[index];
    if (!it) return null;
    if (it.kind === 'consumable' && Number.isFinite(count) && count < it.count) {
        it.count -= count;
        return { kind: 'consumable', id: it.id, count };
    }
    inv[index] = null;
    return it;
}
// 인벤토리 index 칸의 아이템을 버린다 (16-7, U48: 바닥에 떨어뜨리지 않고 없앰, 소모품은 묶음 전체). 장착 중인 장비는 인벤토리에 없으므로 대상이 아니다.
// 에릭의 플래시 (kind 'tool') 는 버릴 수 없다 (AGENTS.md). 반환: { ok, reason, item }
function discardItemAt(state, index) {
    const inv = state.player.inventory, it = inv[index];
    if (!it) return { ok: false, reason: 'item.none' };
    if (it.kind === 'tool' || (it.kind === 'consumable' && CONSUMABLES[it.id].noDiscard)) return { ok: false, reason: 'inv.cannotDiscard' };   // 플래시·카드키 (U53)
    inv[index] = null;
    return { ok: true, item: it };
}
// 소모품 1개를 쓴다 (같은 id 의 마지막 칸부터 — 앞쪽 묶음이 유지되도록). 0 이 되면 그 칸을 비운다 (행동 슬롯 등록은 유지, 12-7)
function consumeConsumable(state, id) {
    const inv = state.player.inventory;
    for (let i = inv.length - 1; i >= 0; i--) {
        if (inv[i] && inv[i].kind === 'consumable' && inv[i].id === id) { removeItemAt(state, i, 1); return true; }
    }
    return false;
}
function isTwoHanded(item) { return !!item && EQUIP_BASES[item.baseId].hands === 2; }
// 장착할 칸: 반지는 targetSlot (ring1 / ring2) → 빈 ring1 → 빈 ring2 → ring1 과 교체
function equipSlotFor(base, equipment, targetSlot) {
    if (base.slot !== 'ring') return base.slot;
    if (targetSlot === 'ring1' || targetSlot === 'ring2') return targetSlot;
    if (!equipment.ring1) return 'ring1';
    if (!equipment.ring2) return 'ring2';
    return 'ring1';
}
// 인벤토리 invIndex 칸의 장비를 장착 (원래 끼던 장비는 그 칸으로 = 교체). targetSlot 을 주면 그 장착 칸에만 (드래그).
// 요구 레벨 미달·양손 무기를 든 채 보조장비·양손 무기 장착 시 보조장비를 옮길 빈칸이 없음 → 실패 (AGENTS.md "장비 > 공통 규칙")
function equipItem(state, invIndex, targetSlot) {
    const p = state.player, inv = p.inventory, item = inv[invIndex];
    if (!item || item.kind !== 'equip') return { ok: false, reason: 'inv.notEquip' };
    const base = EQUIP_BASES[item.baseId];
    const slot = equipSlotFor(base, p.equipment, targetSlot);
    if (targetSlot && targetSlot !== slot) return { ok: false, reason: 'inv.wrongSlot' };
    if (p.level < base.reqLv) return { ok: false, reason: 'inv.reqLevel' };
    if (slot === 'offhand' && isTwoHanded(p.equipment.weapon)) return { ok: false, reason: 'inv.twoHandedOffhand' };
    const old = p.equipment[slot];
    const off = slot === 'weapon' && base.hands === 2 ? p.equipment.offhand : null;
    // 양손 무기: 보조장비는 인벤토리로. 원래 무기가 없으면 이 칸이 비므로 그 칸에, 있으면 다른 빈칸이 필요하다
    if (off && old && inv.findIndex((it, i) => it === null && i !== invIndex) < 0) return { ok: false, reason: 'inv.noSpaceTwoHanded' };
    p.equipment[slot] = item;
    inv[invIndex] = old || null;
    if (off) {
        inv[inv.indexOf(null)] = off;
        p.equipment.offhand = null;
    }
    return { ok: true, slot };
}
// 장착 칸의 장비를 인벤토리로 (toIndex 가 빈칸이면 그 칸, 아니면 첫 빈칸). 빈칸이 없으면 실패
function unequipItem(state, slotName, toIndex) {
    const p = state.player, item = p.equipment[slotName], inv = p.inventory;
    if (!item) return { ok: false, reason: 'inv.emptySlot' };
    const i = Number.isInteger(toIndex) && inv[toIndex] === null ? toIndex : inv.indexOf(null);
    if (i < 0) return { ok: false, reason: 'inv.full' };
    inv[i] = item;
    p.equipment[slotName] = null;
    return { ok: true };
}
// 인벤토리 칸끼리 옮기기 (드래그): 같은 소모품이면 합치고 (20개까지), 아니면 위치 교환
function moveInventoryItem(state, from, to) {
    const inv = state.player.inventory;
    if (from === to || !isIntIn(from, 0, inv.length - 1) || !isIntIn(to, 0, inv.length - 1) || !inv[from]) return false;
    const a = inv[from], b = inv[to];
    if (b && a.kind === 'consumable' && b.kind === 'consumable' && a.id === b.id && b.count < stackMaxOf(b.id)) {
        const n = Math.min(a.count, stackMaxOf(b.id) - b.count);
        b.count += n;
        a.count -= n;
        if (a.count <= 0) inv[from] = null;
        return true;
    }
    inv[from] = b;
    inv[to] = a;
    return true;
}
// 행동 슬롯 등록 (ref = { type: 'skill' | 'item', id }) / 해제 (ref = null). 같은 내용이 다른 슬롯에 있으면 그 슬롯은 비운다.
// 아이템 = 소모품 또는 도구 (플래시). 직접 쓰지 않는 것 (배터리·카드키, useReason) 은 등록하지 않고, 에릭은 스킬이 없다 (18-1, 22-2)
function setActionSlot(state, slotIndex, ref) {
    const slots = state.player.actionSlots;
    if (!isIntIn(slotIndex, 0, ACTION_SLOT_COUNT - 1)) return false;
    if (ref && !((ref.type === 'skill' && SKILL_BY_ID[ref.id] && state.hero !== 'eric')
        || (ref.type === 'item' && ((CONSUMABLES[ref.id] && !CONSUMABLES[ref.id].useReason) || TOOLS[ref.id])))) return false;
    if (ref) for (let i = 0; i < slots.length; i++) if (i !== slotIndex && slots[i] && slots[i].type === ref.type && slots[i].id === ref.id) slots[i] = null;
    slots[slotIndex] = ref ? { type: ref.type, id: ref.id } : null;
    return true;
}
// 행동 슬롯끼리 위치 교환 (드래그)
function swapActionSlots(state, a, b) {
    const slots = state.player.actionSlots;
    if (a === b || !isIntIn(a, 0, ACTION_SLOT_COUNT - 1) || !isIntIn(b, 0, ACTION_SLOT_COUNT - 1)) return false;
    [slots[a], slots[b]] = [slots[b], slots[a]];
    return true;
}

// --- 몬스터 드롭 계획 (12-5, AGENTS.md "아이템 > 공통 규칙"·"장비 > 공통 규칙"·"몬스터 > 생성 규칙"). 순수 함수 (rnd 만 씀)
//   일반: 소모품 15%·장비 8% / 정예: 소모품 50%·장비 30% (희귀 +10%p) / 보스: 장비 2개 (희귀 +30%p) + 소모품 3개 확정 / 소환수: 없음
const ITEM_DROP = {
    normal: { consumable: 15, equip: 8, rareBonus: 0 },
    elite: { consumable: 50, equip: 30, rareBonus: 10 },
};
const BOSS_DROP = { equip: 2, consumable: 3, rareBonus: 30 };
// 소모품 1개: 등장 가능한 단계 중 가중치 (하급 5 : 중급 3 : 상급 2) 로 단계, 그 단계의 7종 중 무작위
function rollConsumableId(rnd, floor) {
    const tiers = [1, 2, 3].filter((t) => floor >= CONSUMABLE_TIER_MIN_FLOOR[t]);
    const tier = pickWeighted(tiers, tiers.map((t) => CONSUMABLE_DROP_WEIGHTS[t]), rnd);
    const ids = Object.keys(CONSUMABLES).filter((id) => CONSUMABLES[id].tier === tier);
    return ids[Math.floor(rnd() * ids.length)];
}
// m = { isBoss, elite, isMinion } (런타임 몬스터). 반환: 아이템 인스턴스 배열 (골드는 killMonster 가 따로)
function planMonsterDrops(rnd, floor, m) {
    const out = [];
    if (m.isMinion) return out;
    const consumable = () => out.push({ kind: 'consumable', id: rollConsumableId(rnd, floor), count: 1 });
    const equip = (rareBonus) => out.push(generateEquipment(rnd, floor, { rareBonus }));
    if (m.isBoss) {
        for (let i = 0; i < BOSS_DROP.equip; i++) equip(BOSS_DROP.rareBonus);
        for (let i = 0; i < BOSS_DROP.consumable; i++) consumable();
        return out;
    }
    const r = m.elite ? ITEM_DROP.elite : ITEM_DROP.normal;
    if (rnd() * 100 < r.consumable) consumable();
    if (rnd() * 100 < r.equip) equip(r.rareBonus);
    return out;
}

// --- 소모품 사용 (12-7, AGENTS.md "소모품 목록"). 행동 슬롯 (왼쪽 버튼, 12-8·21-2) 과 인벤토리 [사용] 이 함께 쓴다.
// 반환: { ok, reason (실패 이유 번역 키) }. 쓰면 개수 −1 (귀환 주문서는 시전이 끝날 때)
const ITEM_MISC_COOLDOWN = 1;   // 영약·주문서의 재사용 대기 (AGENTS.md 에 값 없음, 누르고 있을 때 연달아 쓰지 않도록, U35)
const THROW_SPEED = 14, THROW_GRAVITY = 10, THROW_RANGE = 15, THROW_RADIUS = 0.14;   // 투척물 포물선 (12-7)
const RECALL_TIME = 3;          // 귀환 주문서 시전 시간 (초)
function itemCooldownSec(g, def) {
    const c = def.category;
    if (c === 'hp' || c === 'mp' || c === 'sta' || c === 'cure') return Math.max(0.1, POTION_COOLDOWN - g.derived.mods.potionCdSec);   // 약초학 S1
    if (c === 'throw') return THROW_COOLDOWN;
    return ITEM_MISC_COOLDOWN;
}
function useConsumable(g, id) {
    const def = CONSUMABLES[id], sp = g.state.player;
    if (!def || countConsumable(sp, id) <= 0) return { ok: false, reason: 'item.none' };
    if (def.useReason) return { ok: false, reason: def.useReason };   // 배터리 = 플래시 에너지가 0 이 되면 자동 (18-1, U41), 카드키 = 카드 리더기에서 (22-4)
    if (g.dead || isDisabled(g.player)) return { ok: false, reason: 'item.disabled' };   // 빙결·기절: 행동 불가
    const key = itemCooldownKey(id);
    if (g.cooldowns[key] > 0) return { ok: false, reason: 'item.cooldown' };
    if (def.effect.returnToSanctuary) {
        if (g.recall) return { ok: false, reason: 'item.casting' };
        g.recall = { t: 0, dur: def.effect.castTime || RECALL_TIME };   // 소모는 시전이 끝날 때 (피격 시 취소되면 소모되지 않음)
    } else {
        CONSUMABLE_HANDLERS[def.category](g, def);
        consumeConsumable(g.state, id);
    }
    g.cooldowns[key] = itemCooldownSec(g, def);
    return { ok: true };
}
// --- 플래시 (18-2, AGENTS.md "던전 특징 (에릭)", U41). 순수 함수: state (에너지·배터리) 와 런타임 flash = { on, dieT } 만 바꾼다.
// 켜진 동안 에너지 초당 1 감소 → 0 이 되면 배터리 1개를 즉시 소모해 300초 충전, 배터리도 없으면 즉시 꺼짐.
// 에너지 0·배터리 0 에서 켜면 0.5초 뒤 다시 꺼짐 (dieT). 켜짐 상태는 저장하지 않는다 (불러오면 꺼짐)
const FLASH_DEAD_ON_TIME = 0.5;
function newFlashState() { return { on: false, dieT: null }; }
function toggleFlashlight(state, flash) {
    flash.dieT = null;
    if (flash.on) { flash.on = false; return false; }
    flash.on = true;
    const p = state.player;
    if (!(p.flashEnergy > 0)) {
        if (consumeConsumable(state, 'battery')) p.flashEnergy = FLASH_ENERGY_MAX;
        else flash.dieT = FLASH_DEAD_ON_TIME;
    }
    return true;
}
function tickFlashlight(state, flash, dt) {
    if (!flash.on) return;
    if (flash.dieT !== null) {
        flash.dieT -= dt;
        if (flash.dieT <= 0) { flash.on = false; flash.dieT = null; }
        return;
    }
    const p = state.player;
    p.flashEnergy = Math.max(0, (p.flashEnergy || 0) - dt);
    if (p.flashEnergy > 0) return;
    if (consumeConsumable(state, 'battery')) p.flashEnergy = FLASH_ENERGY_MAX;
    else flash.on = false;
}
// 물약 회복량 (약초학 S1 의 potionPct 보정). 회복량을 떠오르는 글자로
function healPlayer(g, hp, mp) {
    const sp = g.state.player, d = g.derived, k = 1 + d.mods.potionPct / 100, p = g.player.pos;
    if (hp > 0) {
        const n = Math.min(d.maxHp - sp.hp, d.maxHp * hp / 100 * k);
        sp.hp += Math.max(0, n);
        if (n >= 0.5 && g.view) spawnFloatingText(g, p.x, p.y + 1.9, p.z, '+' + Math.round(n), '#8ae07a', 0.9);
    }
    if (mp > 0) {
        const n = Math.min(d.maxMp - sp.mp, d.maxMp * mp / 100 * k);
        sp.mp += Math.max(0, n);
        if (n >= 0.5 && g.view) spawnFloatingText(g, p.x, p.y + 1.7, p.z, '+' + Math.round(n), '#7aa8ff', 0.9);
    }
}
const CONSUMABLE_HANDLERS = {
    hp: (g, def) => healPlayer(g, def.effect.hpPct, 0),
    mp: (g, def) => healPlayer(g, 0, def.effect.mpPct),
    sta(g, def) {   // 스태미너 100% + 탈진 해제, 중급은 10초 회복 2배, 상급은 10초 소모 없음
        const e = def.effect;
        g.state.player.stamina = g.derived.maxStamina * e.staminaPct / 100;
        g.player.exhausted = false;
        if (e.duration) {
            addBuff(g, {
                id: 'item:stamina', remaining: e.duration, label: { ko: '활', en: 'St' }, color: '#7ae07a',
                staminaRegenMul: e.staminaRegenMul || 1, noStaminaCost: !!e.noStaminaCost,
            });
        }
    },
    cure(g, def) {   // 해독제: 중독·화상 / 만능 치료제·성수: 모두. 성수는 + 10초 면역 + HP 20%
        const e = def.effect, fx = g.player.effects;
        for (let i = fx.length - 1; i >= 0; i--) if (e.cure === 'all' || e.cure.includes(fx[i].id)) fx.splice(i, 1);
        if (e.immuneTime) addBuff(g, { id: 'item:holy', remaining: e.immuneTime, statusImmune: true, label: { ko: '성', en: 'HW' }, color: '#fff0a0' });
        if (e.hpPct) healPlayer(g, e.hpPct, 0);
        g.player.statusImmune = g.buffs.some((b) => b.statusImmune);
    },
    throw: (g, def) => throwItem(g, def),
    elixir(g, def) {   // 전투 영약: 단계와 상관없이 하나의 버프 (다시 쓰면 효과·시간 갱신, U35)
        const e = def.effect;
        addBuff(g, {
            id: 'item:elixir', remaining: e.duration, label: { ko: '영', en: 'El' }, color: '#e08aff',
            mods: { dmgPct: e.dmgPct || 0, atkSpeedPct: e.atkSpeedPct || 0, damageTakenPct: e.damageTakenPct || 0 },
        });
    },
    glowstick: (g) => dropGlowstick(g),   // 야광봉 (22-3)
    fadedScroll: (g) => startFadedWarp(g),   // 빛 바랜 주문서 (22-5)
    scroll(g, def) {   // 탐색: 현재 칸에서 맨해튼 거리 8칸 / 전지: 모든 칸 (방문한 칸과 같이 취급 → 지도의 시설 아이콘도 보인다)
        const e = def.effect, p = g.player.pos, gx = Math.floor(p.x / CELL_SIZE), gz = Math.floor(p.z / CELL_SIZE);
        for (const [key, c] of g.dungeon.cells) {
            if (e.revealAll || Math.abs(c.gx - gx) + Math.abs(c.gz - gz) <= e.revealRadius) g.visited.add(key);
        }
        g.uiEvents.push({ type: 'toast', key: 'item.revealed' });
    },
};
// 야광봉 사용 (22-3, U54): 주인공 앞 0.6m 바닥 (던전 밖·벽 안이면 발밑) 에 활성 야광봉. world.glowsticks 에 기록 (층 기록·저장), 한 층 최대 64개 (오래된 것부터 지움)
function dropGlowstick(g) {
    const p = g.player, list = g.state.world.glowsticks;
    let x = p.pos.x - Math.sin(p.yaw) * GLOWSTICK.drop, z = p.pos.z - Math.cos(p.yaw) * GLOWSTICK.drop;
    if (!cellAtWorld(g.dungeon, x, z) || nearbyBoxes(g.view.collision, x, z).some((b) => circleHitsBox(x, z, 0.15, b))) { x = p.pos.x; z = p.pos.z; }
    list.push({ x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100 });
    if (list.length > GLOWSTICK.max) list.splice(0, list.length - GLOWSTICK.max);
    if (g.view.setGlowsticks) g.view.setGlowsticks(list);
}
// 빛 바랜 주문서 (22-5, AGENTS.md "던전 특징 (에릭)", U56): 사용 즉시 무적 + 모든 몬스터의 추적·의심 해제 → 0.4초 어두워짐 →
// 같은 층의 직선 10칸 (160m) 이상 떨어진 칸으로 순간이동 + 도착 위치 5칸 (80m) 안의 몬스터는 도착 위치에서 10칸 이상 떨어진 칸으로 → 0.4초 밝아짐 → 무적 끝.
// 런타임 g.warp = { t, moved } (저장하지 않음). 그동안 몬스터는 주인공을 보거나 노리지 못한다 (playerTargetable)
const FADED_WARP = { fade: 0.4, minDist: 160, clearDist: 80 };
// 도착 칸 가운데: 생성 가능 칸 (canSpawnMonsterIn — 엘리베이터 조각·성소 구역·포탈 제외) 중 from 에서 직선 minDist 이상인 칸에서 무작위, 없으면 가장 먼 칸. 순수 함수
function pickWarpDestination(d, from, minDist, rnd) {
    const cells = [...d.cells.values()].filter(canSpawnMonsterIn).map(cellCenter);
    const dist = (c) => Math.hypot(c.x - from.x, c.z - from.z);
    const far = cells.filter((c) => dist(c) >= minDist);
    if (far.length > 0) return far[Math.floor(rnd() * far.length)];
    return cells.reduce((best, c) => (!best || dist(c) > dist(best) ? c : best), null);
}
function startFadedWarp(g) {
    g.warp = { t: 0, moved: false };
    g.player.invulnUntil = Math.max(g.player.invulnUntil, g.time + FADED_WARP.fade * 2);
    for (const m of g.monsters) if (m.eric) calmEricMonster(m);
}
function updateFadedWarp(g, dt) {
    const w = g.warp;
    if (!w) return;
    w.t += dt;
    if (!w.moved && w.t >= FADED_WARP.fade) {   // 화면이 완전히 어두워졌을 때 순간이동
        w.moved = true;
        const p = g.player, to = pickWarpDestination(g.dungeon, p.pos, FADED_WARP.minDist, Math.random);
        if (to) {
            if (g.hiding) exitCabinet(g);   // (안전장치) 캐비닛 안에서는 쓸 수 없다
            placePlayer(g, to.x, to.z, p.yaw);
            updateCellState(g);
            for (const m of g.monsters) {
                if (!m.eric) continue;
                calmEricMonster(m);
                if (Math.hypot(m.pos.x - to.x, m.pos.z - to.z) > FADED_WARP.clearDist) continue;
                const away = pickWarpDestination(g.dungeon, to, FADED_WARP.minDist, Math.random);
                if (away) { m.pos.x = away.x; m.pos.z = away.z; placeMonsterOnFloor(g, m); }
            }
        }
    }
    if (w.t >= FADED_WARP.fade * 2) g.warp = null;
}
// 화면 어두워짐 정도 (0~1): 0.4초 동안 어두워졌다가 0.4초 동안 밝아짐
function fadedWarpFade(g) {
    const w = g.warp;
    if (!w) return 0;
    return w.t < FADED_WARP.fade ? w.t / FADED_WARP.fade : Math.max(0, 1 - (w.t - FADED_WARP.fade) / FADED_WARP.fade);
}
// 투척 기준 피해 = 8 + 주인공 레벨 × 4 (AGENTS.md "소모품 목록")
function throwBaseDamage(level) { return 8 + level * 4; }
// 투척물: 크로스헤어 방향 (위아래 포함) 으로 14 m/s 포물선 (중력 10 m/s², 수평 최대 15m). 지면·벽·몬스터에 닿거나 15m 에서 터진다
function throwItem(g, def) {
    const p = g.player, cp = Math.cos(p.pitch);
    const dir = new THREE.Vector3(-Math.sin(p.yaw) * cp, Math.sin(p.pitch), -Math.cos(p.yaw) * cp);
    const from = new THREE.Vector3(p.pos.x, p.pos.y + EYE_HEIGHT - 0.2, p.pos.z).addScaledVector(dir, 0.5);
    spawnProjectile(g, {
        owner: 'player', pos: from, vel: dir.multiplyScalar(THROW_SPEED), radius: THROW_RADIUS, maxDist: 80, element: def.effect.element,
        gravity: THROW_GRAVITY, maxHoriz: THROW_RANGE, origin: { x: from.x, z: from.z }, spec: null, spin: 9,
        onImpact: (gg, pr) => throwImpact(gg, def, pr.pos),
    });
    g.swingT = SWING_TIME * 0.6;
}
// 반경 안 (수평 거리 ≤ 반경 + 몸 반지름, 폭발 지점에서 보임) 의 살아 있는 몬스터
function monstersInBlast(g, x, y, z, radius) {
    return g.monsters.slice().filter((m) => !m.dead && Math.hypot(m.pos.x - x, m.pos.z - z) <= radius + m.radius
        && Math.abs(monsterCenterY(m) - y) <= radius + m.height && hasLineOfSight(g, x, y, z, m.pos.x, monsterCenterY(m), m.pos.z));
}
const THROW_ZONE_TICK = 0.5;
function throwImpact(g, def, pos) {
    const e = def.effect, base = throwBaseDamage(g.state.player.level), color = CONSUMABLE_ITEM_COLORS[def.id] || 0xff8a3a;
    const floor = floorHeightAt(g.dungeon, pos.x, pos.z), cy = Math.max(pos.y, floor + 0.6);
    const spec = (coef) => ({ kind: 'item', element: e.element, coef: 0, flat: base * coef / 100, canCrit: false });
    spawnPuff(g, pos.x, cy, pos.z, color, e.radius, 0.45);
    spawnRing(g, pos.x, pos.z, e.radius, color, 0.45);
    if (e.coef) {   // 화염병·천둥 폭탄: 즉시 피해 + 상태이상 (기절)
        for (const m of monstersInBlast(g, pos.x, cy, pos.z, e.radius)) {
            const r = damageMonster(g, m, spec(e.coef));
            if (!r || m.dead) continue;
            if (e.effect) applyPlayerStatus(g, m, e.effect, { sourceDamage: r.amount });   // 화상 피해 % (M2)·감전 받는 피해 % (M8) 보정 (14단계)
            if (e.stun) applyStatusToMonster(g, m, 'stun', { duration: e.stun });
        }
    }
    const zoneCoef = e.groundCoef || e.tickCoef, zoneTime = e.groundTime || e.cloudTime;
    if (!zoneCoef || !zoneTime) return;
    // 불타는 지면 (초당 20%, 바닥 원) / 독 구름 (초당 35% + 중독, 낮은 반구). 0.5초마다 그 몫만큼
    const C = getMonsterCommon();
    createGroundZone(g, {
        x: pos.x, z: pos.z, radius: e.radius, duration: zoneTime, tick: THROW_ZONE_TICK, disc: !!e.groundCoef,
        mat: e.groundCoef ? C.lavaZone : C.cloud,
        onTick: (gg, zone) => {
            const y = floorHeightAt(gg.dungeon, zone.x, zone.z) + 0.6;
            for (const m of monstersInBlast(gg, zone.x, y, zone.z, zone.radius)) {
                const r = damageMonster(gg, m, spec(zoneCoef * THROW_ZONE_TICK));
                if (r && !m.dead && e.cloudTime && e.effect) applyPlayerStatus(gg, m, e.effect, { sourceDamage: base * zoneCoef / 100 });
            }
        },
    });
}
// --- 귀환 주문서 (12-7): 3초 시전 (이동 가능, HUD 진행 막대) → 가장 가까운 (맨해튼) 성소 중심의 남쪽 칸으로 이동, 그때 소모.
// 시전 중 피격 (damagePlayer 의 quiet 가 아닌 피해) 이면 취소되고 소모되지 않는다
function updateRecall(g, dt) {
    if (!g.recall) return;
    g.recall.t += dt;
    if (g.recall.t < g.recall.dur) return;
    g.recall = null;
    if (!consumeConsumable(g.state, 'scroll3')) return;   // 시전 중에 다 써 버렸으면 (인벤토리에서 팔기 등) 아무 일도 없음
    const spot = recallDestination(g.dungeon, g.player.pos);
    if (!spot) return;
    placePlayer(g, spot.x, spot.z, spot.yaw);
    g.currentCell = null;
    updateCellState(g);
    g.flow = null;
    g.wasInTrigger = !!floorTriggerAt(g.dungeon, g.view.triggers, g.player.pos.x, g.player.pos.z);
    g.uiEvents.push({ type: 'toast', key: 'item.recallDone' });
}
function cancelRecall(g) {
    g.recall = null;
    g.uiEvents.push({ type: 'toast', key: 'item.recallCancelled' });
}
// 가장 가까운 (칸 맨해튼 거리) 성소 중심의 남쪽 칸 중심, 분수를 바라봄 (북). 성소가 없으면 null. 순수 함수
function recallDestination(d, pos) {
    const gx = Math.floor(pos.x / CELL_SIZE), gz = Math.floor(pos.z / CELL_SIZE);
    let best = null, bestDist = Infinity;
    for (const piece of d.pieces) {
        if (piece.type !== 'sanctuary') continue;
        const c = d.cells.get(piece.center), dist = Math.abs(c.gx - gx) + Math.abs(c.gz - gz);
        if (dist < bestDist) { bestDist = dist; best = c; }
    }
    if (!best) return null;
    const south = d.cells.get(cellKey(best.gx, best.gz + 1)) || best;
    const c = cellCenter(south);
    return { x: c.x, z: c.z, yaw: 0 };
}

// --- 방랑 상인 (15단계, AGENTS.md "방랑 상인 판매 규칙"). 마틴 전용
// 재고 (15-1, 순수 함수 — rng 만 씀): 소모품 = 생명력·마나 물약의 등장 가능한 모든 단계 + 그 외 분류 (활력·치료제·투척물·영약·주문서) 중
// 무작위 4종 (분류마다 등장 가능한 단계 중 무작위 1개), 재고 무제한. 장비 = 4~6개, 등장 가능한 단계 중 무작위 (균등), 등급 일반 40 / 마법 45 / 희귀 15,
// 각 1개 (배열 위치 = 품절 기록 번호). 저장하지 않고 merchantStockOf 가 같은 시드로 다시 만든다
const MERCHANT_STOCK = { always: ['hp', 'mp'], others: ['sta', 'cure', 'throw', 'elixir', 'scroll'], otherCount: 4, equipCount: [4, 6], rarityWeights: { normal: 40, magic: 45, rare: 15 } };
const MERCHANT_SEED_SALT = 777;
function generateMerchantStock(rng, floor) {
    const S = MERCHANT_STOCK, consTiers = [1, 2, 3].filter((t) => floor >= CONSUMABLE_TIER_MIN_FLOOR[t]);
    const consumables = [];
    for (const cat of S.always) for (const t of consTiers) consumables.push(cat + t);
    const pool = S.others.slice(), picked = new Set();
    for (let i = 0; i < S.otherCount && pool.length > 0; i++) picked.add(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
    for (const cat of S.others) if (picked.has(cat)) consumables.push(cat + consTiers[Math.floor(rng() * consTiers.length)]);   // 표시 순서는 분류 순서
    const equipTiers = [1, 2, 3].filter((t) => floor >= TIER_INFO[t].minFloor);
    const count = randInt(rng, S.equipCount[0], S.equipCount[1]), equips = [];
    for (let i = 0; i < count; i++) equips.push(generateEquipment(rng, floor, { tier: equipTiers[Math.floor(rng() * equipTiers.length)], rarityWeights: S.rarityWeights }));
    return { consumables, equips };
}
// 지금 층 상인의 재고 (층 시드로 결정 → 같은 층은 언제나 같은 재고, 포탈로 초기화된 층은 새 시드라 새 재고)
function merchantStockOf(state) {
    return generateMerchantStock(createRng(hashInts(state.dungeonSeed, MERCHANT_SEED_SALT)), state.floor);
}
// 소모품 id 를 몇 개까지 더 넣을 수 있나 (같은 id 칸의 남은 자리 + 빈칸 × 20)
function consumableRoom(state, id) {
    let n = 0;
    for (const it of state.player.inventory) {
        if (!it) n += stackMaxOf(id);
        else if (it.kind === 'consumable' && it.id === id) n += stackMaxOf(id) - it.count;
    }
    return n;
}
// 살 수 있는 최대 개수 (골드·인벤토리 공간)
function maxBuyCount(state, id) {
    return Math.max(0, Math.min(Math.floor(state.player.gold / consumablePrice(id, state.floor)), consumableRoom(state, id)));
}
// 구매·판매 (15-3). 반환 { ok, reason (번역 키), gold (오간 골드) }. 실패하면 아무것도 바꾸지 않는다
function buyConsumable(state, id, count) {
    if (!CONSUMABLES[id] || !isIntIn(count, 1, INVENTORY_SIZE * STACK_MAX)) return { ok: false, reason: 'shop.invalid' };
    const price = consumablePrice(id, state.floor) * count;
    if (state.player.gold < price) return { ok: false, reason: 'shop.noGold' };
    if (!addItem(state, { kind: 'consumable', id, count })) return { ok: false, reason: 'inv.full' };
    state.player.gold -= price;
    return { ok: true, gold: price };
}
function buyEquipment(state, stock, index) {
    const item = stock.equips[index];
    if (!item) return { ok: false, reason: 'shop.invalid' };
    if (state.world.merchantSoldOut.includes(index)) return { ok: false, reason: 'shop.soldOut' };
    const price = equipPrice(item);
    if (state.player.gold < price) return { ok: false, reason: 'shop.noGold' };
    if (!addItem(state, JSON.parse(JSON.stringify(item)))) return { ok: false, reason: 'inv.full' };   // 재고는 다시 만들어지므로 복사본을 넣는다 (uid 는 addItem)
    state.player.gold -= price;
    state.world.merchantSoldOut.push(index);
    return { ok: true, gold: price };
}
// 판매가 (1개): 소모품 = 그 층 구매가의 25%, 장비 = 구매가의 20%. 플래시 (에릭) 는 팔 수 없음 (null)
function sellPriceOf(state, item) {
    if (!item || item.kind === 'tool') return null;
    return item.kind === 'equip' ? equipSellPrice(item) : consumableSellPrice(item.id, state.floor);
}
// 인벤토리 index 칸에서 count 개 판매 (장비는 1개). 장착 중인 장비는 인벤토리에 없으므로 팔 수 없다 (AGENTS.md "장착하지 않은 모든 장비·소모품")
function sellItem(state, index, count = 1) {
    const item = state.player.inventory[index], each = sellPriceOf(state, item);
    if (!item) return { ok: false, reason: 'item.none' };
    if (each === null) return { ok: false, reason: 'shop.cannotSell' };
    const n = item.kind === 'consumable' ? clamp(Math.floor(count), 1, item.count) : 1;
    removeItemAt(state, index, n);
    state.player.gold += each * n;
    return { ok: true, gold: each * n, count: n };
}

// ===== [17] UI - 공용 =====
function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
}
const STYLE_TEXT = `
html, body.underground_root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
.underground_gamefield { position: fixed; left: 0; top: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
.ug-stage { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; overflow: hidden;
    color: #e8e2d0; font-family: 'Pretendard', 'Noto Sans KR', 'Noto Sans', 'D2Coding', sans-serif; font-size: 28px; user-select: none; }
/* 수치·숫자·코드 글꼴 (AGENTS.md "개발 시 준수사항"). 동적으로 바뀌는 숫자는 별도 행으로 분리해 이 클래스를 붙인다 */
.ug-num { font-family: 'D2Coding', 'Nanum Gothic Coding', monospace; }
.ug-canvas { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; display: block; }
.ug-ui { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; pointer-events: none; }
.ug-ui * { pointer-events: auto; box-sizing: border-box; }
.ug-ui .ug-hud, .ug-ui .ug-hud * { pointer-events: none; }
.ug-fill { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.ug-center { display: flex; flex-direction: column; align-items: center; justify-content: center; }

/* 버튼 */
.ug-btn { min-width: 280px; height: 64px; padding: 0 32px; font: inherit; font-size: 28px; color: #e8e2d0;
    background: rgba(12, 13, 16, 0.85); border: 2px solid rgba(232, 226, 208, 0.45); border-radius: 6px; cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s; }
.ug-btn:hover { background: rgba(48, 44, 36, 0.92); border-color: #d8b26a; color: #fff6dc; }
.ug-btn:focus { outline: none; }
.ug-btn:focus-visible { outline: 2px solid #d8b26a; outline-offset: 2px; }
.ug-btn.is-primary { border-color: #d8b26a; color: #f3d898; }
.ug-btn.is-danger { border-color: #c0584a; color: #f0a090; }
.ug-btn.is-danger:hover { background: rgba(80, 30, 24, 0.92); border-color: #e07060; color: #ffd0c4; }
.ug-btn.is-selected { background: rgba(216, 178, 106, 0.24); border-color: #d8b26a; color: #fff1cc; }
.ug-btn.is-disabled, .ug-btn.is-disabled:hover { opacity: 0.45; cursor: not-allowed;
    background: rgba(12, 13, 16, 0.85); border-color: rgba(232, 226, 208, 0.45); color: #e8e2d0; }

/* 타이틀·메뉴 */
.ug-title { font-size: 128px; font-weight: 700; letter-spacing: 0.12em; color: #efe6cf;
    text-shadow: 0 0 28px rgba(255, 200, 120, 0.35), 0 6px 18px rgba(0, 0, 0, 0.9); }
.ug-title-small { font-size: 96px; margin-bottom: 72px; }
.ug-subtitle { margin-top: 96px; font-size: 34px; letter-spacing: 0.08em; color: #d9cfb5; text-shadow: 0 2px 8px #000; }
.ug-blink { animation: ug-blink 1.2s ease-in-out infinite; }
@keyframes ug-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
.ug-version { position: absolute; right: 32px; bottom: 24px; font-size: 20px; color: rgba(232, 226, 208, 0.5); }
.ug-title-screen { cursor: pointer; background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0.6) 100%); }
.ug-menu-screen { background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.25) 30%, rgba(0, 0, 0, 0.75) 100%); }
.ug-menu { display: flex; flex-direction: column; gap: 24px; align-items: stretch; }
.ug-menu .ug-btn { min-width: 400px; height: 76px; font-size: 32px; }

/* 패널 (설정·슬롯) */
.ug-panel { min-width: 960px; padding: 48px 56px; background: rgba(10, 11, 14, 0.9); border: 2px solid rgba(216, 178, 106, 0.4);
    border-radius: 10px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7); }
.ug-panel-title { font-size: 48px; font-weight: 700; color: #f0e4c4; margin-bottom: 36px; text-align: center; letter-spacing: 0.06em; }
.ug-panel-footer { display: flex; justify-content: center; gap: 24px; margin-top: 44px; }
.ug-option-row { display: flex; align-items: center; gap: 24px; margin: 24px 0; }
.ug-option-label { width: 260px; font-size: 30px; color: #d9cfb5; }
.ug-option-buttons { display: flex; gap: 16px; }
.ug-option-buttons .ug-btn { min-width: 300px; }

/* 저장 슬롯 */
.ug-slot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.ug-slot-card { width: 460px; height: 176px; padding: 24px 28px; text-align: left; font: inherit; color: #e8e2d0;
    background: rgba(20, 21, 26, 0.92); border: 2px solid rgba(232, 226, 208, 0.3); border-radius: 8px; cursor: pointer;
    display: flex; flex-direction: column; justify-content: center; gap: 10px; transition: background 0.15s, border-color 0.15s; }
.ug-slot-card:hover { border-color: #d8b26a; background: rgba(48, 44, 36, 0.92); }
.ug-slot-card:focus { outline: none; }
.ug-slot-name { font-size: 32px; font-weight: 700; color: #f3d898; }
.ug-slot-info { font-size: 26px; }
.ug-slot-time { font-size: 22px; color: rgba(232, 226, 208, 0.6); }
.ug-slot-card.is-empty .ug-slot-info { color: rgba(232, 226, 208, 0.5); }
.ug-slot-card.is-corrupt .ug-slot-info { color: #f0a090; }

/* 대화상자 */
.ug-dialog-overlay { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6);
    display: flex; align-items: center; justify-content: center; z-index: 100; }
.ug-dialog { min-width: 720px; max-width: 1100px; padding: 44px 52px; background: #0c0d10; border: 2px solid #d8b26a;
    border-radius: 10px; box-shadow: 0 24px 80px rgba(0, 0, 0, 0.8); }
.ug-dialog-message { font-size: 32px; line-height: 1.5; text-align: center; white-space: pre-line; margin-bottom: 40px; }
.ug-dialog-buttons { display: flex; justify-content: center; gap: 20px; }
.ug-dialog-buttons .ug-btn { min-width: 200px; }
/* 빈 슬롯 확인의 주인공 선택 (16-2), 저장 슬롯 대화상자의 요약 */
.ug-hero-picker { margin: -12px 0 40px; text-align: center; }
.ug-hero-picker-caption { font-size: 22px; letter-spacing: 0.08em; color: rgba(232, 226, 208, 0.7); margin-bottom: 14px; }
.ug-hero-picker-row { display: flex; justify-content: center; gap: 20px; }
.ug-hero-picker .ug-btn.ug-hero-btn { min-width: 300px; height: 104px; display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 6px; font-size: 34px; font-weight: 700; }
.ug-hero-desc { font-size: 19px; font-weight: 400; color: rgba(232, 226, 208, 0.7); }
.ug-dialog-slot { text-align: center; margin: -20px 0 36px; display: flex; flex-direction: column; gap: 8px; }
.ug-dialog-slot .ug-slot-info { font-size: 28px; }
.ug-dialog-slot .ug-slot-time { font-size: 22px; color: rgba(232, 226, 208, 0.6); }

/* 툴팁·토스트 (마우스 이벤트 통과) */
.ug-ui .ug-tooltip { position: absolute; z-index: 200; max-width: 600px; padding: 12px 18px; font-size: 22px; color: #fff6dc;
    background: rgba(30, 26, 20, 0.96); border: 1px solid #d8b26a; border-radius: 6px; pointer-events: none; }
.ug-ui .ug-toast-area { position: absolute; left: 0; right: 0; top: 48px; display: flex; flex-direction: column; align-items: center;
    gap: 12px; z-index: 150; pointer-events: none; }
.ug-ui .ug-toast { padding: 14px 28px; font-size: 26px; background: rgba(12, 13, 16, 0.92); border: 1px solid rgba(216, 178, 106, 0.6);
    border-radius: 6px; pointer-events: none; animation: ug-toast-in 0.2s ease-out; transition: opacity 0.3s; }
.ug-ui .ug-toast.is-leaving { opacity: 0; }
.ug-ui .ug-toast.is-floor { display: flex; align-items: baseline; gap: 14px; padding: 16px 40px; }
.ug-toast-floor-caption { font-size: 20px; letter-spacing: 0.1em; color: rgba(232, 226, 208, 0.7); }
.ug-toast-floor-num { font-size: 36px; color: #f3d898; }
.ug-toast-floor-theme { font-size: 30px; }

/* 층 이동 때 화면을 덮는 검은 막 (7-3). HUD 위, 시스템 메뉴·"클릭하여 계속" 아래 */
.ug-ui .ug-fade { background: #000; opacity: 0; z-index: 30; pointer-events: none; }
/* 피격 시 화면 가장자리 붉게 (8-13), 레벨 업 토스트 (8-12) */
.ug-ui .ug-hurt { opacity: 0; z-index: 25; pointer-events: none; box-shadow: inset 0 0 180px 40px rgba(210, 20, 10, 0.75); }
.ug-ui .ug-toast.is-level { display: flex; align-items: baseline; gap: 12px; padding: 16px 40px; border-color: #f3d898; }
.ug-toast-level-title { font-size: 30px; font-weight: 700; color: #ffe9a8; }
.ug-toast-level-caption { font-size: 22px; color: rgba(232, 226, 208, 0.75); }
.ug-toast-level-num { font-size: 36px; color: #f3d898; }
/* 보스 처치 토스트 (10-4), 차원 포식자 중력 당김 중 화면 가장자리 보라색 일렁임 (10-5) */
.ug-ui .ug-toast.is-boss { display: flex; align-items: baseline; gap: 12px; padding: 16px 40px; border-color: #ff8a6a; }
.ug-toast-boss-name { font-size: 32px; font-weight: 700; color: #ffd0c0; }
.ug-toast-boss-done { font-size: 28px; color: #ffe9a8; }
.ug-ui .ug-pull { opacity: 0; z-index: 24; pointer-events: none; box-shadow: inset 0 0 220px 60px rgba(120, 50, 220, 0.8);
    animation: ug-pull-wave 0.9s ease-in-out infinite alternate; }
@keyframes ug-pull-wave { from { box-shadow: inset 0 0 160px 30px rgba(120, 50, 220, 0.7); } to { box-shadow: inset 0 0 260px 80px rgba(150, 70, 255, 0.85); } }
/* 사망 화면 (U2). 시스템 메뉴·"클릭하여 계속" 보다 위, 대화상자보다 아래 */
.ug-death { z-index: 60; gap: 28px; background: radial-gradient(ellipse at center, rgba(40, 0, 0, 0.55) 20%, rgba(0, 0, 0, 0.9) 100%);
    animation: ug-death-in 0.8s ease-out; }
@keyframes ug-death-in { from { opacity: 0; } to { opacity: 1; } }
.ug-death-title { font-size: 96px; font-weight: 700; letter-spacing: 0.08em; color: #e05a48; text-shadow: 0 4px 24px #000; }
.ug-death-hint { font-size: 26px; color: rgba(232, 226, 208, 0.75); margin-bottom: 24px; }
.ug-death-buttons { display: flex; flex-direction: column; gap: 20px; }
.ug-death-buttons .ug-btn { min-width: 480px; height: 76px; font-size: 32px; }
@keyframes ug-toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }

/* 게임 화면: "클릭하여 계속" (포인터 락) */
.ug-lock-overlay { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px;
    background: rgba(0, 0, 0, 0.45); cursor: pointer; z-index: 50; }
.ug-lock-overlay.is-hidden { display: none; }
.ug-lock-title { font-size: 52px; font-weight: 700; letter-spacing: 0.08em; text-shadow: 0 2px 12px #000; }
.ug-lock-hint { font-size: 24px; color: rgba(232, 226, 208, 0.75); text-shadow: 0 2px 6px #000; }

/* HUD (마우스 이벤트 통과) */
.ug-hud { text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 0.9); }
.ug-noise { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; display: none; opacity: 0; image-rendering: pixelated; }
.ug-noise-vignette { position: absolute; inset: 0; display: none; background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 55%, rgba(0, 0, 0, 0.45) 100%); }
.ug-noise-vignette.is-on { display: block; }
.ug-hide-mask { position: absolute; inset: 0; display: none; overflow: hidden; }
.ug-hide-mask.is-on { display: block; }
.ug-hide-slit { position: absolute; left: 600px; top: 520px; width: 720px; height: 40px; border-radius: 10px; box-shadow: 0 0 0 2000px #000, inset 0 0 16px 6px #000; }
.ug-crosshair { position: absolute; left: 948px; top: 528px; width: 24px; height: 24px; }
.ug-crosshair::before, .ug-crosshair::after { content: ''; position: absolute; background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.9); }
.ug-crosshair::before { left: 11px; top: 0; width: 2px; height: 24px; }
.ug-crosshair::after { left: 0; top: 11px; width: 24px; height: 2px; }
.ug-hud-floor { position: absolute; left: 32px; top: 24px; }
.ug-hud-caption { font-size: 18px; letter-spacing: 0.1em; color: rgba(232, 226, 208, 0.7); }
.ug-hud-floor-num { font-size: 46px; line-height: 1.1; color: #f3d898; }
.ug-hud-theme { font-size: 24px; }
.ug-hud-sanctuary { display: none; margin-top: 6px; font-size: 22px; color: #ffe9a8; }
.ug-hud-sanctuary.is-visible { display: block; }
.ug-hud-effects { position: absolute; right: 32px; top: 24px; display: flex; gap: 8px; }
.ug-hud-effect { position: relative; width: 58px; height: 58px; display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 2px; background: rgba(10, 11, 14, 0.78); border: 2px solid; border-radius: 6px; }
.ug-hud-effect.is-buff { border-radius: 50%; }
.ug-hud-effect-text { font-size: 20px; font-weight: 700; line-height: 1; }
.ug-hud-effect-sec { font-size: 15px; line-height: 1; color: #e8e2d0; }
.ug-hud-effect-stacks { position: absolute; right: 3px; top: 1px; font-size: 12px; color: #e8e2d0; }
.ug-hud-boss { position: absolute; left: 580px; top: 24px; width: 760px; display: none; }
.ug-hud-boss-name { text-align: center; font-size: 26px; font-weight: 700; letter-spacing: 0.05em; color: #ffd0c0; }
.ug-hud-boss-bar { position: relative; height: 18px; margin-top: 6px; background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 200, 180, 0.55); }
.ug-hud-boss-fill { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; background: linear-gradient(#e0483a, #7a1a12); }
.ug-hud-boss-nums { text-align: center; font-size: 16px; margin-top: 2px; color: rgba(255, 220, 210, 0.85); }
.ug-hud-bars { position: absolute; left: 32px; bottom: 40px; width: 420px; display: flex; flex-direction: column; gap: 6px; }
.ug-hud-bar-nums { font-size: 18px; text-align: right; line-height: 1.2; }
.ug-hud-bar { position: relative; height: 22px; background: rgba(0, 0, 0, 0.55); border: 1px solid rgba(232, 226, 208, 0.35);
    border-radius: 4px; overflow: hidden; }
.ug-hud-bar-fill { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; }
.ug-hud-bar-label { position: absolute; left: 8px; top: 0; line-height: 20px; font-size: 15px; font-weight: 700; }
.ug-hud-bar-shield { position: absolute; left: 0; top: 0; bottom: 0; width: 0; background: linear-gradient(rgba(255, 255, 255, 0.8), rgba(196, 214, 255, 0.55)); }
.ug-hud-bar-wrap.is-hp .ug-hud-bar-fill { background: linear-gradient(#e0584a, #8e2418); }
.ug-hud-bar-wrap.is-mp .ug-hud-bar-fill { background: linear-gradient(#5a86e8, #1c3a8e); }
.ug-hud-bar-wrap.is-stamina .ug-hud-bar-fill { background: linear-gradient(#62c862, #1e7a2a); }
.ug-hud-bar-wrap.is-flash { position: relative; }
.ug-hud-bar-wrap.is-flash .ug-hud-bar-fill { background: linear-gradient(#b8a860, #6a5e2a); }
.ug-hud-bar-wrap.is-flash.is-on .ug-hud-bar-fill { background: linear-gradient(#fff0a0, #c8a840); }
.ug-hud-battery { position: absolute; left: 0; top: 0; display: flex; gap: 6px; align-items: baseline; font-size: 17px; color: #d8e8c0; }
.ug-hud-battery-num { font-size: 18px; }
.ug-hud:not(.is-eric) .ug-hud-bar-wrap.is-flash { display: none; }
.ug-hud.is-eric .ug-hud-bar-wrap.is-hp, .ug-hud.is-eric .ug-hud-bar-wrap.is-mp, .ug-hud.is-eric .ug-hud-level, .ug-hud.is-eric .ug-hud-exp, .ug-hud.is-eric .ug-hud-gold { display: none; }
.ug-hud-bar-wrap.is-stamina.is-exhausted .ug-hud-bar-fill { background: linear-gradient(#8a8a8a, #4a4a4a); }
.ug-hud-bar-wrap.is-exhausted .ug-hud-bar-label { color: #ffb0a0; }
.ug-hud-slots { position: absolute; left: 656px; bottom: 36px; width: 608px; display: flex; gap: 8px; }
.ug-hud-slot { position: relative; width: 80px; height: 80px; background: rgba(10, 11, 14, 0.7);
    border: 2px solid rgba(232, 226, 208, 0.35); border-radius: 6px; overflow: hidden; }
.ug-hud-slot.is-active { border-color: #d8b26a; box-shadow: 0 0 12px rgba(216, 178, 106, 0.7); }
.ug-hud-slot-key { position: absolute; left: 5px; top: 1px; font-size: 16px; color: rgba(232, 226, 208, 0.75); }
.ug-hud-slot-tier { position: absolute; right: 5px; top: 1px; font-size: 14px; color: rgba(232, 226, 208, 0.75); }
.ug-hud-slot-name { position: absolute; left: 0; right: 0; top: 24px; text-align: center; font-size: 22px; font-weight: 700; }
.ug-hud-slot-count { position: absolute; right: 6px; bottom: 2px; font-size: 18px; }
.ug-hud-slot-cd { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: none; align-items: center;
    justify-content: center; font-size: 24px; background: rgba(0, 0, 0, 0.62); }
.ug-hud-slot.is-cooldown .ug-hud-slot-cd { display: flex; }
.ug-hud-slot.is-out .ug-hud-slot-name, .ug-hud-slot.is-out .ug-hud-slot-count { opacity: 0.35; }
.ug-hud-slot.is-denied { border-color: #ff5a48; box-shadow: 0 0 14px rgba(255, 70, 50, 0.85); }
.ug-hud-slot.is-skill-base .ug-hud-slot-name { color: #f3d898; }
.ug-hud-slot.is-skill-magic .ug-hud-slot-name { color: #a8b8ff; }
.ug-hud-slot.is-skill-melee .ug-hud-slot-name { color: #ffb08a; }
.ug-hud-slot.is-skill-defense .ug-hud-slot-name { color: #b8d8a8; }
.ug-hud-slot.is-skill-support .ug-hud-slot-name { color: #f0e08a; }
.ug-hud-slot.is-skill-cross .ug-hud-slot-name { color: #e8a8ff; }
.ug-hud-slot.is-item-hp { background: rgba(90, 16, 14, 0.7); }
.ug-hud-slot.is-item-mp { background: rgba(16, 30, 90, 0.7); }
.ug-hud-slot.is-item-sta { background: rgba(16, 70, 24, 0.7); }
.ug-hud-slot.is-item-cure { background: rgba(70, 70, 76, 0.7); }
.ug-hud-slot.is-item-throw { background: rgba(100, 50, 10, 0.7); }
.ug-hud-slot.is-item-elixir { background: rgba(70, 20, 80, 0.7); }
.ug-hud-slot.is-item-scroll { background: rgba(80, 66, 36, 0.7); }
.ug-hud-slot.is-item-glowstick { background: rgba(20, 80, 40, 0.7); }
.ug-hud-slot.is-item-fadedScroll { background: rgba(70, 60, 50, 0.7); }
.ug-hud-level { position: absolute; right: 32px; bottom: 16px; display: flex; align-items: baseline; gap: 8px; }
.ug-hud-level-label { font-size: 20px; color: rgba(232, 226, 208, 0.8); }
.ug-hud-level-num { font-size: 34px; color: #f3d898; }
.ug-hud-exp-nums { font-size: 16px; color: rgba(232, 226, 208, 0.7); margin-left: 6px; }
.ug-hud-exp { position: absolute; left: 0; right: 0; bottom: 0; height: 8px; background: rgba(0, 0, 0, 0.6); }
.ug-hud-exp-fill { height: 100%; width: 0; background: linear-gradient(90deg, #b08a3a, #f3d898); }
.ug-hud-gold { position: absolute; right: 32px; bottom: 62px; display: flex; align-items: baseline; gap: 8px; }
.ug-hud-gold-label { font-size: 18px; color: rgba(232, 226, 208, 0.75); }
.ug-hud-gold-num { font-size: 24px; color: #f3d898; }

/* 시스템 메뉴 (6단계). 게임 화면 위, 대화상자·토스트·툴팁 아래 */
.ug-sysmenu { background: rgba(4, 5, 8, 0.8); z-index: 40; }
.ug-sysmenu-bar { position: absolute; left: 64px; right: 64px; top: 22px; height: 72px; display: flex; align-items: flex-end; gap: 10px; }
.ug-sysmenu-tab { min-width: 220px; height: 64px; padding: 0 28px; font: inherit; font-size: 28px; color: rgba(232, 226, 208, 0.7);
    background: rgba(20, 21, 26, 0.92); border: 2px solid rgba(232, 226, 208, 0.25); border-bottom: none; border-radius: 8px 8px 0 0;
    cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s; }
.ug-sysmenu-tab:hover { color: #fff6dc; border-color: rgba(216, 178, 106, 0.7); }
.ug-sysmenu-tab:focus { outline: none; }
.ug-sysmenu-tab.is-active { height: 72px; color: #f3d898; background: rgba(48, 44, 36, 0.96); border-color: #d8b26a; }
.ug-sysmenu-spacer { flex: 1; }
.ug-sysmenu-hint { align-self: center; font-size: 20px; color: rgba(232, 226, 208, 0.55); }
.ug-sysmenu-bar .ug-btn.ug-sysmenu-close { align-self: center; min-width: 160px; height: 56px; }
.ug-sysmenu-body { position: absolute; left: 64px; right: 64px; top: 94px; bottom: 18px; background: rgba(12, 13, 16, 0.94);
    border: 2px solid rgba(216, 178, 106, 0.5); border-radius: 0 8px 8px 8px; overflow: hidden; }
.ug-sysmenu-empty { font-size: 32px; color: rgba(232, 226, 208, 0.55); }
.ug-map { display: flex; flex-direction: column; align-items: center; gap: 4px; padding-top: 6px; }
.ug-map-head { height: 46px; display: flex; align-items: baseline; gap: 14px; }
.ug-map-caption { font-size: 20px; letter-spacing: 0.1em; color: rgba(232, 226, 208, 0.7); }
.ug-map-num { font-size: 36px; color: #f3d898; }
.ug-map-theme { font-size: 28px; }
.ug-ui .ug-map-canvas { width: 1600px; height: 860px; display: block; box-sizing: content-box; border: 1px solid rgba(232, 226, 208, 0.15); }
.ug-map-legend { height: 36px; display: flex; align-items: center; gap: 30px; font-size: 20px; color: rgba(232, 226, 208, 0.85); }
.ug-map-legend-item { display: flex; align-items: center; gap: 8px; }
.ug-map-legend-icon { font-size: 22px; font-weight: 700; font-family: 'Segoe UI Symbol', 'Noto Sans Symbols 2', 'Pretendard', 'Noto Sans KR', sans-serif; }
.ug-map-legend-player { width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent;
    border-bottom: 16px solid #ff5a48; }
.ug-map-legend-unvisited { width: 18px; height: 18px; border: 1px solid rgba(232, 226, 208, 0.35); }
.ug-sys { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 36px; }
.ug-sys-info { display: grid; grid-template-columns: auto auto; gap: 14px 36px; align-items: baseline; }
.ug-sys-label { font-size: 26px; text-align: right; color: rgba(232, 226, 208, 0.7); }
.ug-sys-value { font-size: 30px; color: #f3d898; }
.ug-sys-status { font-size: 26px; }
.ug-sys-status.is-ok { color: #ffe9a8; }
.ug-sys-status.is-warn { color: #f0a090; }
.ug-sys-buttons { display: flex; flex-direction: column; gap: 24px; margin-top: 40px; }   /* 위 여백 = 비활성 이유 툴팁 자리 */
.ug-sys-buttons .ug-btn { min-width: 420px; height: 76px; font-size: 32px; }
/* 스테이터스 탭 (11단계) */
.ug-status { height: 100%; box-sizing: border-box; padding: 26px 56px 24px; display: flex; flex-direction: column; gap: 18px; }
.ug-status-head { display: flex; align-items: center; gap: 40px; padding-bottom: 20px; border-bottom: 1px solid rgba(216, 178, 106, 0.3); }
.ug-status-lv { display: flex; align-items: baseline; gap: 12px; min-width: 200px; }
.ug-status-lv-label { font-size: 26px; color: rgba(232, 226, 208, 0.75); }
.ug-status-lv-num { font-size: 64px; line-height: 1; color: #f3d898; }
.ug-status-exp { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.ug-status-exp-top { display: flex; align-items: baseline; justify-content: space-between; }
.ug-status-exp-bar { height: 14px; background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(232, 226, 208, 0.2); }
.ug-status-exp-fill { height: 100%; background: linear-gradient(90deg, #b08a3a, #f3d898); }
.ug-status-point { display: flex; align-items: baseline; gap: 12px; padding: 10px 22px; border: 1px solid rgba(232, 226, 208, 0.2); border-radius: 8px; }
.ug-status-point.is-available { border-color: #d8b26a; background: rgba(216, 178, 106, 0.12); }
.ug-status-point-label { font-size: 22px; color: rgba(232, 226, 208, 0.8); }
.ug-status-point-num { font-size: 34px; color: #f3d898; }
.ug-status-cols { flex: 1; min-height: 0; display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 64px; }
.ug-status-col { display: flex; flex-direction: column; gap: 4px; }
.ug-status-sec { margin: 14px 0 6px; padding-bottom: 6px; font-size: 22px; letter-spacing: 0.12em; color: #d8b26a;
    border-bottom: 1px solid rgba(216, 178, 106, 0.25); }
.ug-status-sec:first-child { margin-top: 0; }
.ug-status-row { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; min-height: 42px; font-size: 24px; }
.ug-status-label { color: rgba(232, 226, 208, 0.85); }
.ug-status-value { display: flex; align-items: baseline; gap: 6px; }
.ug-status-num { font-size: 28px; color: #fff3d0; }
.ug-status-unit { font-size: 20px; color: rgba(232, 226, 208, 0.6); }
.ug-status-hint { font-size: 18px; line-height: 1.4; color: rgba(232, 226, 208, 0.5); margin: 2px 0 4px; }
.ug-status-row-hint { margin: -8px 0 4px; }
.ug-status-res-dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 10px; vertical-align: 2px; }
.ug-status-stat { display: grid; grid-template-columns: 1fr auto 56px; align-items: center; gap: 20px; padding: 8px 0; }
.ug-status-stat-label { font-size: 30px; color: #f3e8cc; }
.ug-status-stat-desc { font-size: 17px; color: rgba(232, 226, 208, 0.55); margin-top: 2px; }
.ug-status-stat-value { display: flex; align-items: baseline; gap: 10px; }
.ug-status-stat-num { font-size: 40px; color: #f3d898; }
.ug-status-stat-bonus { font-size: 24px; color: #9fe08a; }
.ug-status-stat .ug-btn.ug-status-plus { min-width: 0; width: 56px; height: 56px; padding: 0; font-size: 34px; line-height: 1; }
/* 인벤토리 탭 (12-6). 칸 = 아이템을 놓는 자리 (data-zone), 그 안의 .ug-item = 아이템 */
.ug-inv { position: relative; height: 100%; }
.ug-inv-title { display: flex; align-items: baseline; justify-content: space-between; height: 40px; font-size: 22px; letter-spacing: 0.12em;
    color: #d8b26a; border-bottom: 1px solid rgba(216, 178, 106, 0.25); margin-bottom: 18px; }
.ug-inv-count { font-size: 22px; letter-spacing: 0; color: rgba(232, 226, 208, 0.75); }
.ug-inv-equip { position: absolute; left: 56px; top: 28px; width: 500px; }
.ug-inv.is-eric .ug-inv-equip, .ug-inv.is-eric .ug-inv-gold { display: none; }
.ug-inv.is-eric .ug-inv-bag { left: 380px; }
.ug-inv.is-eric .ug-inv-actions { left: 380px; }
.ug-inv-doll { position: relative; height: 630px; }
.ug-inv-doll::before { content: ''; position: absolute; left: 248px; top: 60px; width: 4px; height: 480px; background: rgba(216, 178, 106, 0.12); }
.ug-inv-doll::after { content: ''; position: absolute; left: 90px; top: 218px; width: 320px; height: 4px; background: rgba(216, 178, 106, 0.12); }
.ug-inv-equip-wrap { position: absolute; width: 120px; display: flex; flex-direction: column; align-items: center; gap: 4px; z-index: 1; }
.ug-inv-slot-label { font-size: 18px; color: rgba(232, 226, 208, 0.6); }
.ug-inv-bag { position: absolute; left: 640px; top: 28px; width: 902px; }
.ug-inv-grid { display: grid; grid-template-columns: repeat(8, 104px); grid-auto-rows: 104px; gap: 10px; }
.ug-inv-hint { margin-top: 18px; font-size: 19px; color: rgba(232, 226, 208, 0.5); }
.ug-inv-actions { position: absolute; left: 56px; top: 744px; width: 1300px; }
.ug-inv-action-row { display: flex; gap: 10px; }
.ug-inv-gold { position: absolute; right: 64px; top: 812px; display: flex; align-items: baseline; gap: 14px; }
.ug-inv-gold-label { font-size: 24px; color: rgba(232, 226, 208, 0.75); }
.ug-inv-gold-num { font-size: 40px; color: #f3d898; }
.ug-inv-cell { position: relative; width: 104px; height: 104px; background: rgba(20, 21, 26, 0.92); border: 2px solid rgba(232, 226, 208, 0.16);
    border-radius: 8px; }
.ug-inv-cell.is-equip { width: 120px; height: 120px; background: rgba(30, 28, 24, 0.95); border-color: rgba(216, 178, 106, 0.35); }
.ug-inv-cell.is-action { width: 96px; height: 96px; }
.ug-inv-cell.is-action.is-active { border-color: #d8b26a; }
.ug-inv-cell.is-over { border-color: #9ae0ff; box-shadow: 0 0 14px rgba(120, 200, 255, 0.6); }
.ug-inv-cell.is-dragging .ug-item { opacity: 0.3; }
.ug-inv-placeholder { position: absolute; left: 22px; top: 22px; width: 72px; height: 72px; filter: grayscale(1); opacity: 0.16; }
.ug-inv-action-key { position: absolute; left: 6px; top: 2px; font-size: 16px; color: rgba(232, 226, 208, 0.7); z-index: 2; }
.ug-item { position: absolute; left: -2px; top: -2px; right: -2px; bottom: -2px; border: 2px solid rgba(232, 226, 208, 0.35); border-radius: 8px;
    background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.07) 0%, rgba(0, 0, 0, 0) 70%); cursor: pointer; }
.ug-item.is-magic { box-shadow: inset 0 0 18px rgba(92, 140, 255, 0.35); }
.ug-item.is-rare { box-shadow: inset 0 0 20px rgba(255, 210, 74, 0.35); }
.ug-item.is-locked { background: rgba(120, 20, 16, 0.35); }
.ug-item.is-out .ug-item-icon { opacity: 0.3; filter: grayscale(1); }
.ug-item-icon { position: absolute; left: 50%; top: 50%; width: 72%; height: 72%; transform: translate(-50%, -50%); pointer-events: none; }
.ug-item-tier { position: absolute; right: 6px; top: 2px; font-size: 16px; color: rgba(232, 226, 208, 0.8); }
.ug-item-count { position: absolute; right: 7px; bottom: 3px; font-size: 20px; color: #fff3d0; text-shadow: 0 1px 3px #000; }
.ug-item-req { position: absolute; left: 6px; bottom: 3px; font-size: 16px; color: #ff8a7a; text-shadow: 0 1px 3px #000; }
.ug-item.is-skill { display: flex; align-items: center; justify-content: center; text-align: center; padding: 18px 6px 6px; font-size: 18px;
    font-weight: 700; line-height: 1.15; }
.ug-item.is-skill-base { color: #f3d898; } .ug-item.is-skill-magic { color: #a8b8ff; } .ug-item.is-skill-melee { color: #ffb08a; }
.ug-item.is-skill-defense { color: #b8d8a8; } .ug-item.is-skill-support { color: #f0e08a; } .ug-item.is-skill-cross { color: #e8a8ff; }
.ug-ui .ug-inv-ghost { position: absolute; z-index: 210; opacity: 0.75; pointer-events: none; background-color: rgba(20, 21, 26, 0.9); }
.ug-ui .ug-inv-ghost * { pointer-events: none; }
/* 아이템 상세 정보·소모품 메뉴 팝업 (시스템 메뉴 위, 대화상자 아래) */
.ug-item-pop { position: absolute; z-index: 90; min-width: 360px; max-width: 520px; padding: 22px 26px; background: rgba(14, 14, 18, 0.97);
    border: 2px solid rgba(216, 178, 106, 0.6); border-radius: 10px; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8); }
.ug-item-pop-name { font-size: 30px; font-weight: 700; line-height: 1.25; }
.ug-item-pop-sub { margin-top: 4px; font-size: 20px; color: rgba(232, 226, 208, 0.7); }
.ug-item-pop-info { display: flex; flex-wrap: wrap; gap: 6px 22px; margin-top: 12px; font-size: 19px; color: rgba(232, 226, 208, 0.65); }
.ug-item-pop-info .ug-num { margin-left: 6px; color: #fff3d0; }
.ug-item-pop-info .is-bad .ug-num { color: #ff7a6a; }
.ug-item-pop-lines { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(232, 226, 208, 0.15); display: flex; flex-direction: column; gap: 6px; }
.ug-item-pop-line { display: flex; justify-content: space-between; align-items: baseline; gap: 24px; font-size: 22px; }
.ug-item-pop-line .ug-num { color: #fff3d0; }
.ug-item-pop-line.is-engraving, .ug-item-pop-line.is-engraving .ug-num { color: #f3d898; }
.ug-item-pop-line.is-affix, .ug-item-pop-line.is-affix .ug-num { color: #8fb0ff; }
.ug-item-pop-caption { margin-top: 12px; font-size: 18px; letter-spacing: 0.08em; color: #d8b26a; }
.ug-item-pop-desc { margin-top: 12px; font-size: 21px; line-height: 1.45; color: #e8e2d0; }
.ug-item-pop-note { margin-top: 12px; font-size: 19px; color: #d8a070; }
.ug-item-pop-price { margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(232, 226, 208, 0.15); display: flex; align-items: baseline;
    gap: 8px; font-size: 20px; color: rgba(232, 226, 208, 0.7); }
.ug-item-pop-price .ug-num { font-size: 24px; color: #f3d898; }
.ug-item-pop .ug-btn.ug-item-pop-discard { min-width: 0; width: 100%; height: 48px; margin-top: 14px; font-size: 22px; }
.ug-item-menu { min-width: 300px; display: flex; flex-direction: column; gap: 12px; }
.ug-item-menu-title { font-size: 24px; font-weight: 700; color: #f3e8cc; }
.ug-item-menu .ug-btn.ug-item-menu-btn { min-width: 0; height: 52px; font-size: 24px; }
.ug-item-menu-caption { font-size: 18px; color: rgba(232, 226, 208, 0.65); }
.ug-item-menu-slots { display: flex; gap: 6px; }
.ug-item-menu-slots .ug-btn.ug-item-menu-slot { min-width: 0; width: 44px; height: 44px; padding: 0; font-size: 22px; }
/* 방랑 상인 상점 (15-3). 시스템 메뉴와 같은 층 (팝업·대화상자·토스트 아래) */
.ug-shop { background: rgba(4, 5, 8, 0.78); z-index: 40; }
.ug-shop-panel { position: absolute; left: 160px; top: 60px; width: 1600px; height: 960px; background: rgba(12, 13, 16, 0.95);
    border: 2px solid rgba(216, 178, 106, 0.55); border-radius: 10px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7); }
.ug-shop-head { position: absolute; left: 40px; right: 40px; top: 24px; height: 96px; display: flex; align-items: center; gap: 36px;
    padding-bottom: 18px; border-bottom: 1px solid rgba(216, 178, 106, 0.3); }
.ug-shop-who { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.ug-shop-name { font-size: 36px; font-weight: 700; color: #f3d898; letter-spacing: 0.04em; }
.ug-shop-greeting { align-self: flex-start; max-width: 1000px; padding: 8px 18px; font-size: 21px; line-height: 1.4; color: #f3e8cc;
    background: rgba(48, 44, 36, 0.85); border: 1px solid rgba(216, 178, 106, 0.4); border-radius: 4px 14px 14px 14px; }
.ug-shop-gold { display: flex; align-items: baseline; gap: 10px; }
.ug-shop-gold-label { font-size: 22px; color: rgba(232, 226, 208, 0.75); }
.ug-shop-gold-num { font-size: 44px; color: #f3d898; }
.ug-shop-gold-unit { font-size: 24px; color: #f3d898; }
.ug-shop-head .ug-btn.ug-shop-close { min-width: 160px; height: 56px; }
.ug-shop-tabs { position: absolute; left: 40px; right: 40px; top: 136px; height: 60px; display: flex; align-items: center; gap: 14px; }
.ug-shop-tabs .ug-btn.ug-shop-tab { min-width: 200px; height: 56px; }
.ug-shop-hint { margin-left: auto; font-size: 19px; color: rgba(232, 226, 208, 0.5); }
.ug-shop-body { position: absolute; left: 40px; right: 40px; top: 214px; bottom: 28px; display: flex; gap: 56px; }
.ug-shop-col { display: flex; flex-direction: column; gap: 6px; }
.ug-shop-col.is-cons { width: 640px; }
.ug-shop-col.is-equip { flex: 1; min-width: 0; }
.ug-shop-col .ug-inv-title { margin-bottom: 6px; }
.ug-shop-row { display: flex; align-items: center; gap: 16px; padding: 4px 14px 4px 6px; border-radius: 8px; border: 1px solid transparent; cursor: pointer;
    background: rgba(24, 25, 30, 0.85); transition: background 0.12s, border-color 0.12s; }
.ug-shop-row:hover { background: rgba(48, 44, 36, 0.92); border-color: rgba(216, 178, 106, 0.6); }
.ug-shop-col.is-cons .ug-shop-row { height: 60px; }
.ug-shop-col.is-equip .ug-shop-row { height: 92px; }
.ug-shop-icon { position: relative; flex: none; width: 52px; height: 52px; }
.ug-shop-col.is-equip .ug-shop-icon { width: 80px; height: 80px; }
.ug-shop-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ug-shop-item-name { font-size: 23px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ug-shop-item-sub { font-size: 17px; color: rgba(232, 226, 208, 0.6); white-space: nowrap; }
.ug-shop-price { flex: none; display: flex; align-items: baseline; gap: 6px; }
.ug-shop-price-num { font-size: 26px; color: #f3d898; }
.ug-shop-price-unit { font-size: 18px; color: rgba(243, 216, 152, 0.8); }
.ug-shop-price.is-short .ug-shop-price-num, .ug-shop-price.is-short .ug-shop-price-unit { color: #ff8a7a; }
.ug-shop-row.is-soldout { cursor: default; opacity: 0.45; }
.ug-shop-row.is-soldout:hover { background: rgba(24, 25, 30, 0.85); border-color: transparent; }
.ug-shop-soldout { padding: 2px 12px; font-size: 19px; font-weight: 700; color: #ff9a8a; border: 1px solid #c0584a; border-radius: 4px; }
.ug-shop-sell { width: 880px; }
.ug-shop-grid { display: grid; grid-template-columns: repeat(8, 96px); gap: 6px 14px; }
.ug-shop-cell { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.ug-shop-cell .ug-inv-cell { width: 96px; height: 96px; cursor: pointer; }
.ug-shop-cell-price { height: 22px; display: flex; align-items: baseline; gap: 3px; font-size: 15px; color: rgba(243, 216, 152, 0.85); }
.ug-shop-cell-price .ug-num { font-size: 18px; color: #f3d898; }
.ug-shop-sell-note { flex: 1; align-self: flex-start; margin-top: 58px; padding: 18px 22px; font-size: 20px; line-height: 1.55; color: rgba(232, 226, 208, 0.7);
    background: rgba(24, 25, 30, 0.85); border-left: 3px solid rgba(216, 178, 106, 0.6); border-radius: 4px; word-break: keep-all; }
.ug-shop-menu { min-width: 340px; }
.ug-shop-menu .ug-btn.ug-shop-qty { display: flex; align-items: baseline; justify-content: center; gap: 4px; padding: 0 18px; }
.ug-shop-qty .ug-num { font-size: 24px; }
.ug-shop-qty-sep { margin: 0 8px; opacity: 0.6; }
/* 스킬 탭 (13단계). 왼쪽 보기 영역 (.ug-skill-view, 크기 = SKILL_VIEW_W·H) 안에서 1700px 트리를 끌어 스크롤, 오른쪽 상세 패널 */
.ug-skill { position: relative; height: 100%; }
.ug-skill-head { position: absolute; left: 24px; right: 24px; top: 10px; height: 58px; display: flex; align-items: center; gap: 30px; }
.ug-skill-head .ug-status-point { padding: 6px 20px; }
.ug-skill-legend { display: flex; align-items: center; gap: 22px; font-size: 18px; color: rgba(232, 226, 208, 0.75); }
.ug-skill-legend-item { display: flex; align-items: center; gap: 8px; }
.ug-skill-legend-mark { width: 18px; height: 18px; border-radius: 50%; border: 3px solid; background: rgba(40, 40, 46, 0.9); }
.ug-skill-legend-mark.is-learned { border-color: #d8b26a; }
.ug-skill-legend-mark.is-learnable { border-color: #5fe3e3; }
.ug-skill-legend-mark.is-locked { border-color: #44454c; }
.ug-skill-legend-shape { width: 18px; height: 18px; border: 2px solid rgba(232, 226, 208, 0.7); }
.ug-skill-legend-shape.is-active { border-radius: 50%; }
.ug-skill-legend-shape.is-passive { border-radius: 5px; }
.ug-skill-hint { margin-left: auto; font-size: 18px; color: rgba(232, 226, 208, 0.5); }
.ug-skill-view { position: absolute; left: 24px; top: 76px; width: 1184px; height: 864px; overflow: hidden; cursor: grab; touch-action: none;
    background: radial-gradient(ellipse at center, rgba(44, 40, 30, 0.6) 0%, rgba(8, 9, 12, 0.92) 78%);
    border: 1px solid rgba(232, 226, 208, 0.15); border-radius: 8px; }
.ug-skill-view.is-dragging, .ug-skill-view.is-dragging * { cursor: grabbing; }
.ug-skill-tree { position: absolute; left: 0; top: 0; width: 1700px; height: 1700px; }
.ug-ui .ug-skill-links, .ug-ui .ug-skill-links * { position: absolute; left: 0; top: 0; pointer-events: none; }
.ug-skill-link { stroke-linecap: round; }
.ug-skill-link.is-both { stroke: #d8b26a; stroke-width: 5; }
.ug-skill-link.is-one { stroke: rgba(255, 255, 255, 0.45); stroke-width: 3; }
.ug-skill-link.is-none { stroke: #34353c; stroke-width: 3; }
.ug-ui .ug-skill-branch { position: absolute; width: 260px; margin-left: -130px; text-align: center; font-size: 22px; font-weight: 700;
    letter-spacing: 0.16em; opacity: 0.8; pointer-events: none; }
.ug-skill-item { position: absolute; width: 160px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; }
.ug-skill-node { position: relative; width: 96px; height: 96px; border-radius: 50%; border: 3px solid #44454c; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 4px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6); }
.ug-skill-item.is-passive .ug-skill-node { border-radius: 24px; }
.ug-skill-item.is-base .ug-skill-node { background: radial-gradient(circle at 35% 30%, #8a6a2a, #3a2a0e); }
.ug-skill-item.is-magic .ug-skill-node { background: radial-gradient(circle at 35% 30%, #3e56a8, #111a42); }
.ug-skill-item.is-melee .ug-skill-node { background: radial-gradient(circle at 35% 30%, #a83e32, #3e100c); }
.ug-skill-item.is-defense .ug-skill-node { background: radial-gradient(circle at 35% 30%, #3e8a4a, #10321a); }
.ug-skill-item.is-support .ug-skill-node { background: radial-gradient(circle at 35% 30%, #a8942a, #3e340c); }
.ug-skill-item.is-cross .ug-skill-node { background: radial-gradient(circle at 35% 30%, #8a3ea8, #2c103c); }
.ug-skill-item.is-learned .ug-skill-node { border-color: #d8b26a; box-shadow: 0 0 16px rgba(216, 178, 106, 0.55), 0 4px 12px rgba(0, 0, 0, 0.6); }
.ug-skill-item.is-learnable .ug-skill-node { border-color: #5fe3e3; animation: ug-skill-blink 1.1s ease-in-out infinite; }
@keyframes ug-skill-blink { 0%, 100% { border-color: #5fe3e3; box-shadow: 0 0 18px rgba(95, 227, 227, 0.75); }
    50% { border-color: rgba(95, 227, 227, 0.3); box-shadow: 0 0 4px rgba(95, 227, 227, 0.2); } }
.ug-skill-item.is-locked .ug-skill-node { filter: brightness(0.42) saturate(0.45); }
.ug-skill-item.is-locked .ug-skill-name { color: rgba(232, 226, 208, 0.42); }
.ug-skill-item.is-selected .ug-skill-node { outline: 3px solid #fff6dc; outline-offset: 5px; }
.ug-skill-item.is-upgradable .ug-skill-node::after { content: '+'; position: absolute; right: -6px; top: -6px; width: 26px; height: 26px; border-radius: 50%;
    background: #d8b26a; color: #1a1408; font-size: 22px; font-weight: 700; line-height: 26px; text-align: center; }
.ug-skill-code { font-size: 18px; line-height: 1; color: rgba(255, 255, 255, 0.78); }
.ug-skill-lv { display: flex; align-items: baseline; gap: 3px; line-height: 1; }
.ug-skill-lv-label { font-size: 13px; color: rgba(255, 255, 255, 0.6); }
.ug-skill-lv-num { font-size: 22px; color: #fff3d0; }
.ug-skill-name { max-width: 160px; padding: 1px 7px; text-align: center; font-size: 17px; line-height: 1.15; color: #f3e8cc;
    background: rgba(8, 9, 12, 0.72); border-radius: 4px; text-shadow: 0 1px 3px #000; }   /* 연결선이 글자 뒤로 가리도록 */
.ug-skill-panel { position: absolute; left: 1228px; top: 76px; width: 536px; height: 864px; padding: 24px 28px; display: flex; flex-direction: column;
    gap: 14px; background: rgba(20, 21, 26, 0.92); border: 1px solid rgba(216, 178, 106, 0.35); border-radius: 8px; overflow: hidden;
    word-break: keep-all; overflow-wrap: anywhere; }
.ug-skill-panel-title { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.ug-skill-panel-name { font-size: 34px; font-weight: 700; line-height: 1.2; }
.ug-skill-panel-code { font-size: 22px; color: rgba(232, 226, 208, 0.55); }
.ug-skill-panel-sub { margin-top: -8px; font-size: 20px; color: rgba(232, 226, 208, 0.7); }
.ug-skill-panel-lv { display: flex; align-items: baseline; gap: 12px; }
.ug-skill-panel-lv-label { font-size: 22px; color: rgba(232, 226, 208, 0.75); }
.ug-skill-panel-lv-num { font-size: 34px; color: #f3d898; }
.ug-skill-block { flex: none; padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; background: rgba(0, 0, 0, 0.28);
    border-left: 3px solid rgba(216, 178, 106, 0.6); border-radius: 4px; }
.ug-skill-block.is-next { border-left-color: #5fe3e3; }
.ug-skill-block-caption { display: flex; align-items: baseline; gap: 8px; font-size: 18px; letter-spacing: 0.06em; color: #d8b26a; }
.ug-skill-block.is-next .ug-skill-block-caption { color: #8feaea; }
.ug-skill-block-caption .ug-num { font-size: 20px; }
.ug-skill-block-lv { margin-left: 4px; }
.ug-skill-block-info { display: flex; flex-wrap: wrap; gap: 4px 24px; font-size: 19px; color: rgba(232, 226, 208, 0.7); }
.ug-skill-block-info .ug-num { margin: 0 2px 0 6px; color: #fff3d0; }
.ug-skill-desc { font-size: 20px; line-height: 1.45; color: #e8e2d0; }
.ug-skill-desc .ug-num { color: #fff3d0; }
.ug-skill-block .ug-num.is-up { color: #8ff0a0; }
.ug-skill-note { font-size: 18px; line-height: 1.45; color: rgba(232, 226, 208, 0.6); }
.ug-skill-actions { margin-top: auto; display: flex; flex-direction: column; gap: 14px; }
.ug-skill-panel .ug-btn.ug-skill-learn { min-width: 0; width: 100%; height: 60px; }
.ug-skill-assign { display: flex; flex-direction: column; gap: 10px; }
.ug-skill-assign-caption { font-size: 18px; color: rgba(232, 226, 208, 0.65); }
.ug-skill-assign-row { display: flex; gap: 5px; }
.ug-skill-panel .ug-btn.ug-skill-slot { position: relative; min-width: 0; width: 62px; height: 62px; padding: 0; }
.ug-skill-slot-key { position: absolute; left: 5px; top: 1px; font-size: 14px; color: rgba(232, 226, 208, 0.7); }
.ug-skill-slot-code { font-size: 19px; font-weight: 700; }
.ug-skill-slot-icon { position: absolute; left: 13px; top: 13px; width: 36px; height: 36px; pointer-events: none; }
.ug-skill-branch.is-magic, .ug-skill-panel.is-magic .ug-skill-panel-name, .ug-skill-slot-code.is-magic { color: #a8b8ff; }
.ug-skill-branch.is-melee, .ug-skill-panel.is-melee .ug-skill-panel-name, .ug-skill-slot-code.is-melee { color: #ffb08a; }
.ug-skill-branch.is-defense, .ug-skill-panel.is-defense .ug-skill-panel-name, .ug-skill-slot-code.is-defense { color: #b8d8a8; }
.ug-skill-branch.is-support, .ug-skill-panel.is-support .ug-skill-panel-name, .ug-skill-slot-code.is-support { color: #f0e08a; }
.ug-skill-panel.is-cross .ug-skill-panel-name, .ug-skill-slot-code.is-cross { color: #e8a8ff; }
.ug-skill-panel.is-base .ug-skill-panel-name, .ug-skill-slot-code.is-base { color: #f3d898; }
/* 줍기 토스트 (12-5), 귀환 주문서 시전 막대 (12-7) */
.ug-ui .ug-toast.is-pickup { display: flex; align-items: baseline; gap: 12px; padding: 12px 30px; }
.ug-toast-pickup-caption { font-size: 20px; color: rgba(232, 226, 208, 0.7); }
.ug-toast-pickup-name { font-size: 26px; font-weight: 700; }
.ug-toast-pickup-count { font-size: 24px; color: #fff3d0; }
.ug-hud-prompt { position: absolute; left: 0; right: 0; top: 600px; display: none; justify-content: center; align-items: center; gap: 12px; }
.ug-hud-prompt-key { padding: 2px 12px; font-size: 18px; font-weight: 700; color: #1a1814; background: rgba(243, 216, 152, 0.92); border-radius: 4px; text-shadow: none; }
.ug-hud-prompt-label { font-size: 26px; color: #fff6dc; }
.ug-hud-cast { position: absolute; left: 760px; bottom: 150px; width: 400px; display: none; text-align: center; }
.ug-hud-cast-label { font-size: 20px; color: #f3e8cc; margin-bottom: 6px; }
.ug-hud-cast-bar { height: 12px; background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(243, 216, 152, 0.6); }
.ug-hud-cast-fill { height: 100%; width: 0; background: linear-gradient(90deg, #b08a3a, #fff0b0); }

/* 디버그 화면 */
.ug-debug-ascii { background: #000; padding: 20px; overflow: hidden; }
.ug-debug-ascii-info { font-size: 20px; color: #d8b26a; margin-bottom: 8px; }
.ug-debug-ascii-map { margin: 0; font-family: 'D2Coding', 'Nanum Gothic Coding', monospace; line-height: 1; color: #cfc7b0; }
.ug-debug-view-info { position: absolute; left: 16px; top: 12px; font-size: 20px; line-height: 1.4; white-space: pre; color: #fff3c8;
    text-shadow: 0 0 4px #000, 0 0 2px #000; font-family: 'D2Coding', 'Nanum Gothic Coding', monospace; }
.ug-intro { background: #000; cursor: pointer; }
.ug-intro-line { max-width: 1500px; padding: 0 90px; text-align: center; font-size: 46px; line-height: 1.6; letter-spacing: 0.04em; color: #e8e0cc;
    text-shadow: 0 2px 14px #000; opacity: 0; }
.ug-intro-skip { position: absolute; right: 48px; bottom: 36px; font-size: 22px; color: rgba(232, 226, 208, 0.5); }
.ug-fps { position: absolute; right: 16px; top: 12px; z-index: 9999; padding: 4px 10px; font-size: 18px; line-height: 1.35; white-space: pre; text-align: right;
    color: #b8ffb0; background: rgba(0, 0, 0, 0.55); border-radius: 4px; pointer-events: none; font-family: 'D2Coding', 'Nanum Gothic Coding', monospace; }
`;
function injectStyle() {
    if (document.getElementById('ug-style')) return;
    const style = document.createElement('style');
    style.id = 'ug-style';
    style.textContent = STYLE_TEXT;
    document.head.appendChild(style);
}
// 요소의 위치를 UI 좌표 (1920×1080 기준) 로 구한다
function uiRectOf(node) {
    const r = node.getBoundingClientRect();
    const s = app.stage.getBoundingClientRect();
    const k = app.stageScale || 1;
    return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, width: r.width / k, height: r.height / k };
}
// 버튼. opts: { primary, danger, selected, className, disabledReason }
// disabledReason 이 있으면 회색으로 보이고, 클릭하면 onClick 대신 이유를 툴팁으로 보여준다 (disabled 속성은 쓰지 않음)
function makeButton(label, onClick, opts = {}) {
    let cls = 'ug-btn';
    if (opts.primary) cls += ' is-primary';
    if (opts.danger) cls += ' is-danger';
    if (opts.selected) cls += ' is-selected';
    if (opts.disabledReason) cls += ' is-disabled';
    if (opts.className) cls += ' ' + opts.className;
    const b = el('button', cls, label);
    b.type = 'button';
    b.addEventListener('click', (e) => {
        e.stopPropagation();
        if (opts.disabledReason) { showTooltip(b, opts.disabledReason); return; }
        if (onClick) onClick(e);
    });
    return b;
}
// 대화상자. buttons: [{ label, onClick, primary, danger }], content = 문구 아래에 넣을 노드 (주인공 선택 등, 선택)
// 버튼을 누르면 대화상자를 닫은 뒤 onClick 을 부른다. 배경 클릭은 무시, ESC 는 마지막 버튼과 같다. 반환값 = 닫기 함수
const dialogStack = [];
function showDialog({ message, content, buttons }) {
    const overlay = el('div', 'ug-dialog-overlay');
    const box = el('div', 'ug-dialog');
    box.appendChild(el('div', 'ug-dialog-message', message));
    if (content) box.appendChild(content);
    const row = el('div', 'ug-dialog-buttons');
    const entry = { closed: false, close: null, onEscape: null };
    entry.close = () => {
        if (entry.closed) return;
        entry.closed = true;
        overlay.remove();
        const i = dialogStack.indexOf(entry);
        if (i >= 0) dialogStack.splice(i, 1);
    };
    for (const spec of buttons) {
        row.appendChild(makeButton(spec.label, () => {
            entry.close();
            if (spec.onClick) spec.onClick();
        }, { primary: spec.primary, danger: spec.danger }));
    }
    box.appendChild(row);
    overlay.appendChild(box);
    overlay.addEventListener('click', (e) => e.stopPropagation());   // 배경 클릭 무시 (아래 화면으로 전달하지 않음)
    app.uiRoot.appendChild(overlay);
    const last = buttons[buttons.length - 1];
    entry.onEscape = () => {
        entry.close();
        if (last && last.onClick) last.onClick();
    };
    dialogStack.push(entry);
    return entry.close;
}
function closeAllDialogs() {
    while (dialogStack.length > 0) dialogStack[dialogStack.length - 1].close();
}
// 요소 위쪽에 말풍선을 ms 동안 보여준다. 같은 요소에 다시 띄우면 이전 것을 지운다
const tooltipByAnchor = new WeakMap();
function showTooltip(anchor, text, ms = 4000) {
    const prev = tooltipByAnchor.get(anchor);
    if (prev) { clearTimeout(prev.timer); prev.node.remove(); }
    const tip = el('div', 'ug-tooltip', text);
    app.uiRoot.appendChild(tip);
    const r = uiRectOf(anchor);
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let y = r.y - th - 12;
    if (y < 8) y = r.y + r.height + 12;
    const x = clamp(r.x + r.width / 2 - tw / 2, 8, UI_WIDTH - tw - 8);
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
    const entry = { node: tip, timer: 0 };
    entry.timer = setTimeout(() => {
        tip.remove();
        if (tooltipByAnchor.get(anchor) === entry) tooltipByAnchor.delete(anchor);
    }, ms);
    tooltipByAnchor.set(anchor, entry);
}
// 화면 위쪽 가운데에 잠깐 나타나는 안내. 여러 개면 아래로 쌓인다
// content: 문자열 또는 DOM 노드 (숫자를 별도 요소 + .ug-num 으로 나눌 때, 4.5). className: 토스트에 더할 클래스
function showToast(content, ms = 2500, className) {
    let area = app.uiRoot.querySelector('.ug-toast-area');
    if (!area) {
        area = el('div', 'ug-toast-area');
        app.uiRoot.appendChild(area);
    }
    const toast = el('div', 'ug-toast' + (className ? ' ' + className : ''));
    if (typeof content === 'string') toast.textContent = content;
    else toast.appendChild(content);
    area.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('is-leaving');
        setTimeout(() => toast.remove(), 300);
    }, ms);
}

// ===== [18] UI - 메뉴 화면 =====
// --- 메뉴 배경 (3D): 맨홀 아래 수직 하수도에서 위를 올려다본 모습. 타이틀·메인 메뉴·설정·슬롯 화면이 함께 쓴다
const menuBackdrop = { group: null, lights: [], disposables: [], dust: null, topLight: null, time: 0 };
const DUST_MIN_Y = -9, DUST_SPAN = 47;   // 먼지가 떠다니는 높이 범위 (카메라 y −14 에서 5m 이상 떨어지게)
// 하수도 벽: 어두운 벽돌 + 줄눈 + 물 얼룩 + 이끼 (고정 시드라 항상 같은 무늬)
function drawShaftWall(ctx, s) {
    const rng = createRng(20261017);
    ctx.fillStyle = '#24211e';
    ctx.fillRect(0, 0, s, s);
    const rows = 8, bh = s / rows, bw = s / 4;
    for (let r = 0; r < rows; r++) {
        const off = (r % 2) * bw / 2;
        for (let c = -1; c < 5; c++) {
            const v = 46 + Math.floor(rng() * 24);
            ctx.fillStyle = `rgb(${v + 8}, ${v + 2}, ${v - 6})`;
            ctx.fillRect(c * bw + off + 2, r * bh + 2, bw - 4, bh - 4);
        }
    }
    for (let i = 0; i < 14; i++) {        // 위에서 흘러내린 물 얼룩
        ctx.fillStyle = `rgba(8, 10, 8, ${0.15 + rng() * 0.25})`;
        ctx.fillRect(rng() * s, 0, 2 + rng() * 6, s * (0.3 + rng() * 0.7));
    }
    for (let i = 0; i < 40; i++) {        // 이끼
        ctx.fillStyle = `rgba(60, 82, 40, ${0.15 + rng() * 0.25})`;
        ctx.beginPath();
        ctx.arc(rng() * s, rng() * s, 2 + rng() * 6, 0, Math.PI * 2);
        ctx.fill();
    }
}
// 먼지 입자용 부드러운 원 (가운데 불투명 → 가장자리 투명)
function drawSoftDot(ctx, s) {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255, 255, 255, 1)');
    g.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
}
// 빛줄기용 세로 그라데이션 (위 = 밝음, 아래 = 검정 → 가산 혼합에서 투명처럼 보임)
function drawBeamGradient(ctx, s) {
    const g = ctx.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.45, '#6a6a6a');
    g.addColorStop(1, '#000000');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
}
function showMenuBackdrop() {
    if (menuBackdrop.group) return;
    const disp = menuBackdrop.disposables;
    const track = (o) => { disp.push(o); return o; };
    const g = new THREE.Group();
    // 수직 통로 벽 (y −20 ~ 40, 안쪽 면이 보이게)
    const wallTex = track(makeCanvasTexture(256, drawShaftWall));
    wallTex.repeat.set(3, 10);
    const shaft = new THREE.Mesh(
        track(new THREE.CylinderGeometry(3, 3, 60, 40, 1, true)),
        track(new THREE.MeshLambertMaterial({ map: wallTex, side: THREE.BackSide })));
    shaft.position.y = 10;
    g.add(shaft);
    // 관 이음새 고리
    const ringGeo = track(new THREE.TorusGeometry(2.96, 0.07, 6, 48));
    const ironMat = track(new THREE.MeshLambertMaterial({ color: 0x3a3632 }));
    for (let y = -18; y <= 36; y += 6) {
        const ring = new THREE.Mesh(ringGeo, ironMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = y;
        g.add(ring);
    }
    // 벽에 박힌 사다리 발판
    const rungGeo = track(new THREE.BoxGeometry(0.9, 0.07, 0.07));
    const rungMat = track(new THREE.MeshLambertMaterial({ color: 0x6b5a48 }));
    for (let y = -18; y <= 39; y += 0.9) {
        const rung = new THREE.Mesh(rungGeo, rungMat);
        rung.position.set(0, y, -2.78);
        g.add(rung);
    }
    // 맨홀 입구: 가로등 빛이 비치는 밝은 원 + 반쯤 비켜 놓인 뚜껑
    const opening = new THREE.Mesh(
        track(new THREE.CircleGeometry(2.95, 40)),
        track(new THREE.MeshBasicMaterial({ color: 0xffe2a8, side: THREE.DoubleSide, fog: false })));
    opening.rotation.x = Math.PI / 2;
    opening.position.y = 40;
    g.add(opening);
    const lid = new THREE.Mesh(
        track(new THREE.CylinderGeometry(2.6, 2.6, 0.12, 40)),
        track(new THREE.MeshLambertMaterial({ color: 0x16151a })));
    lid.position.set(2.5, 40.3, 0.8);
    g.add(lid);
    // 위에서 내려오는 빛줄기 (가산 혼합)
    const beam = new THREE.Mesh(
        track(new THREE.CylinderGeometry(2.4, 2.9, 56, 32, 1, true)),
        track(new THREE.MeshBasicMaterial({
            color: 0xffd9a0, map: track(makeCanvasTexture(64, drawBeamGradient)), transparent: true, opacity: 0.28,
            blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false,
        })));
    beam.position.y = 12;
    g.add(beam);
    // 떠다니는 먼지
    const dustCount = 360;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
        const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 2.6;
        dustPos[i * 3] = Math.cos(a) * r;
        dustPos[i * 3 + 1] = DUST_MIN_Y + Math.random() * DUST_SPAN;
        dustPos[i * 3 + 2] = Math.sin(a) * r;
    }
    const dustGeo = track(new THREE.BufferGeometry());
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo, track(new THREE.PointsMaterial({
        color: 0xffe8c0, size: 0.12, map: track(makeCanvasTexture(32, drawSoftDot)),
        transparent: true, opacity: 0.8, depthWrite: false,
    })));
    g.add(dust);
    // 조명
    const ambient = new THREE.AmbientLight(0x4a4038, 0.6);
    const topLight = new THREE.PointLight(0xffd8a0, 140, 90, 1);
    topLight.position.set(0, 36, 0);
    const lowLight = new THREE.PointLight(0x7f90a8, 8, 24, 1);
    lowLight.position.set(0, -12, 0);
    app.scene.add(g, ambient, topLight, lowLight);
    app.scene.fog = new THREE.Fog(0x070605, 6, 70);
    menuBackdrop.group = g;
    menuBackdrop.dust = dust;
    menuBackdrop.topLight = topLight;
    menuBackdrop.lights = [ambient, topLight, lowLight];
    menuBackdrop.time = 0;
    // 통로 바닥 근처에서 맨홀 쪽을 올려다본다 (거의 수직이므로 up 을 −Z 로 바꿔 둔다)
    app.camera.up.set(0, 0, -1);
    app.camera.position.set(0, -14, 0.9);
    app.camera.lookAt(0.3, 40, -2.5);
}
function updateMenuBackdrop(dt) {
    if (!menuBackdrop.group) return;
    menuBackdrop.time += dt;
    const tm = menuBackdrop.time;
    menuBackdrop.group.rotation.y += dt * 0.04;
    menuBackdrop.topLight.intensity = 140 * (0.93 + 0.07 * Math.sin(tm * 1.7) * Math.sin(tm * 3.1));
    const attr = menuBackdrop.dust.geometry.getAttribute('position');
    for (let i = 0; i < attr.count; i++) {
        let y = attr.getY(i) - dt * 0.35;
        if (y < DUST_MIN_Y) y += DUST_SPAN;
        attr.setY(i, y);
    }
    attr.needsUpdate = true;
}
function hideMenuBackdrop() {
    if (!menuBackdrop.group) return;
    app.scene.remove(menuBackdrop.group, ...menuBackdrop.lights);
    for (const o of menuBackdrop.disposables) o.dispose();
    menuBackdrop.group = null;
    menuBackdrop.dust = null;
    menuBackdrop.topLight = null;
    menuBackdrop.lights = [];
    menuBackdrop.disposables = [];
    app.scene.fog = null;
    app.camera.up.set(0, 1, 0);
}

const SCREENS = {};   // 화면 이름 → { enter(params), exit(), update(dt), onKeyDown(e)? }

// 초기 화면: 아무 곳이나 클릭하면 메인 메뉴 (키 입력으로는 넘어가지 않는다)
SCREENS.title = {
    enter() {
        showMenuBackdrop();
        const root = el('div', 'ug-fill ug-center ug-title-screen');
        root.appendChild(el('div', 'ug-title', t('game.title')));
        root.appendChild(el('div', 'ug-subtitle ug-blink', t('title.clickToContinue')));
        root.appendChild(el('div', 'ug-version', 'v' + GAME_VERSION));
        root.addEventListener('click', () => showScreen('mainMenu'));
        app.uiRoot.appendChild(root);
    },
    exit() { },
    update(dt) { updateMenuBackdrop(dt); },
};

SCREENS.mainMenu = {
    enter() {
        showMenuBackdrop();
        const root = el('div', 'ug-fill ug-center ug-menu-screen');
        root.appendChild(el('div', 'ug-title ug-title-small', t('game.title')));
        const menu = el('div', 'ug-menu');
        menu.appendChild(makeButton(t('menu.start'), () => showScreen('slots'), { primary: true }));
        menu.appendChild(makeButton(t('menu.settings'), () => showScreen('settings')));
        root.appendChild(menu);
        root.appendChild(el('div', 'ug-version', 'v' + GAME_VERSION));
        app.uiRoot.appendChild(root);
    },
    exit() { },
    update(dt) { updateMenuBackdrop(dt); },
};

// 설정: 고른 값은 draft 에만 두고, [저장] 을 눌러야 적용·저장한다
SCREENS.settings = {
    draft: null,
    enter() {
        showMenuBackdrop();
        this.draft = { ...app.settings };
        const root = el('div', 'ug-fill ug-center ug-menu-screen');
        const panel = el('div', 'ug-panel ug-settings');
        panel.appendChild(el('div', 'ug-panel-title', t('settings.title')));
        // 언어 이름은 어느 언어에서든 그 언어 자체의 이름으로 보여준다
        panel.appendChild(this.optionRow(t('settings.language'), 'lang', [['ko', '한국어'], ['en', 'English']]));
        panel.appendChild(this.optionRow(t('settings.quality'), 'quality',
            [['low', t('settings.quality.low')], ['normal', t('settings.quality.normal')]]));
        const footer = el('div', 'ug-panel-footer');
        footer.appendChild(makeButton(t('common.save'), () => this.save(), { primary: true }));
        footer.appendChild(makeButton(t('common.cancel'), () => showScreen('mainMenu')));
        panel.appendChild(footer);
        root.appendChild(panel);
        app.uiRoot.appendChild(root);
    },
    // 항목 한 줄: 이름 + 선택 버튼들 (고른 버튼만 강조)
    optionRow(label, field, choices) {
        const row = el('div', 'ug-option-row');
        row.appendChild(el('div', 'ug-option-label', label));
        const group = el('div', 'ug-option-buttons');
        const buttons = [];
        for (const [value, text] of choices) {
            const b = makeButton(text, () => {
                this.draft[field] = value;
                for (const other of buttons) other.classList.toggle('is-selected', other === b);
            }, { selected: this.draft[field] === value });
            b.dataset.value = value;
            buttons.push(b);
            group.appendChild(b);
        }
        row.appendChild(group);
        return row;
    },
    save() {
        app.settings = { ...this.draft };
        saveSettings(app.settings);
        currentLang = app.settings.lang;
        applyGraphicsQuality();
        showScreen('mainMenu');
        showToast(t('settings.saved'));
    },
    exit() { },
    update(dt) { updateMenuBackdrop(dt); },
    onKeyDown(e) { if (e.code === 'Escape') showScreen('mainMenu'); },   // ESC = 취소
};

// 저장 슬롯 데이터 → 한 줄 요약 노드 "마틴 · 지하 7층 · 동굴 · Lv 12" (에릭은 Lv 없음). 숫자는 별도 요소 + .ug-num (4.5)
function slotSummaryNode(data) {
    const hero = isHeroId(data.hero) ? data.hero : DEFAULT_HERO;
    const frag = document.createDocumentFragment(), sep = () => el('span', 'ug-slot-sep', ' · ');
    frag.append(el('span', 'ug-slot-hero', localName(HEROES[hero])), sep(),
        el('span', null, t('slots.floorPre')), el('span', 'ug-num', String(data.floor)), el('span', null, t('slots.floorPost')), sep(),
        el('span', null, themeLabel(data.theme)));
    if (hero === 'martin') {
        const level = data.player && typeof data.player.level === 'number' ? data.player.level : 1;
        frag.append(sep(), el('span', null, t('slots.level') + ' '), el('span', 'ug-num', String(level)));
    }
    return frag;
}
// "저장 시각" + 시각 (.ug-num)
function slotTimeNode(data) {
    const frag = document.createDocumentFragment();
    frag.append(el('span', null, t('slots.savedAtLabel') + ' '), el('span', 'ug-num', formatDateTime(data.savedAt)));
    return frag;
}
// 빈 슬롯 확인 대화상자의 주인공 선택 (16-2, U38): [마틴] [에릭] 중 하나 (처음엔 마틴). 반환: { node, get() }
function heroPickerNode() {
    let picked = DEFAULT_HERO;
    const node = el('div', 'ug-hero-picker');
    node.appendChild(el('div', 'ug-hero-picker-caption', t('slots.pickHero')));
    const row = node.appendChild(el('div', 'ug-hero-picker-row'));
    const buttons = {};
    for (const id of Object.keys(HEROES)) {
        const b = makeButton(localName(HEROES[id]), () => {
            picked = id;
            for (const k in buttons) buttons[k].classList.toggle('is-selected', k === id);
        }, { className: 'ug-hero-btn', selected: id === picked });
        b.dataset.hero = id;
        b.appendChild(el('span', 'ug-hero-desc', currentLang === 'en' ? HEROES[id].descEn : HEROES[id].descKo));
        buttons[id] = b;
        row.appendChild(b);
    }
    return { node, get: () => picked };
}

SCREENS.slots = {
    enter() {
        showMenuBackdrop();
        this.render();
    },
    render() {
        app.uiRoot.innerHTML = '';
        const root = el('div', 'ug-fill ug-center ug-menu-screen');
        const panel = el('div', 'ug-panel ug-slots');
        panel.appendChild(el('div', 'ug-panel-title', t('slots.title')));
        const grid = el('div', 'ug-slot-grid');
        for (let i = 0; i < SLOT_COUNT; i++) grid.appendChild(this.card(i));
        panel.appendChild(grid);
        const footer = el('div', 'ug-panel-footer');
        footer.appendChild(makeButton(t('common.back'), () => showScreen('mainMenu')));
        panel.appendChild(footer);
        root.appendChild(panel);
        app.uiRoot.appendChild(root);
    },
    card(i) {
        const info = readSlot(i);
        const card = el('button', 'ug-slot-card is-' + info.status);
        card.type = 'button';
        card.dataset.slot = String(i);
        card.appendChild(el('div', 'ug-slot-name', t('slots.slotName', { n: i + 1 })));
        if (info.status === 'ok') {
            card.appendChild(el('div', 'ug-slot-info')).appendChild(slotSummaryNode(info.data));
            card.appendChild(el('div', 'ug-slot-time')).appendChild(slotTimeNode(info.data));
        } else {
            card.appendChild(el('div', 'ug-slot-info', t(info.status === 'empty' ? 'slots.empty' : 'slots.corrupt')));
        }
        card.addEventListener('click', () => this.onSlotClick(i, info));
        return card;
    },
    onSlotClick(i, info) {
        if (info.status === 'empty') {
            const picker = heroPickerNode();   // 이 때 플레이할 주인공도 고른다 (AGENTS.md "게임 슬롯", 기본 마틴)
            showDialog({
                message: t('slots.confirmNew'),
                content: picker.node,
                buttons: [
                    { label: t('common.yes'), primary: true, onClick: () => startNewGame(i, picker.get()) },
                    { label: t('common.no') },
                ],
            });
        } else if (info.status === 'ok') {
            const content = el('div', 'ug-dialog-slot');
            content.appendChild(el('div', 'ug-slot-info')).appendChild(slotSummaryNode(info.data));
            content.appendChild(el('div', 'ug-slot-time')).appendChild(slotTimeNode(info.data));
            showDialog({
                message: t('slots.slotName', { n: i + 1 }),
                content,
                buttons: [
                    { label: t('slots.continue'), primary: true, onClick: () => continueGame(i) },
                    { label: t('common.delete'), danger: true, onClick: () => this.confirmDelete(i) },
                    { label: t('common.cancel') },
                ],
            });
        } else {
            showDialog({
                message: t('slots.corruptMessage', { n: i + 1 }),
                buttons: [
                    { label: t('common.delete'), danger: true, onClick: () => this.confirmDelete(i) },
                    { label: t('common.cancel') },
                ],
            });
        }
    },
    // 삭제는 한 번 더 확인받는다 (AGENTS.md)
    confirmDelete(i) {
        showDialog({
            message: t('slots.confirmDelete', { n: i + 1 }),
            buttons: [
                {
                    label: t('common.yes'), danger: true, onClick: () => {
                        deleteSlot(i);
                        this.render();
                        showToast(t('slots.deleted', { n: i + 1 }));
                    },
                },
                { label: t('common.no') },
            ],
        });
    },
    exit() { },
    update(dt) { updateMenuBackdrop(dt); },
    onKeyDown(e) { if (e.code === 'Escape') showScreen('mainMenu'); },   // ESC = 뒤로
};

// 이야기 장면 (20-6, AGENTS.md "스토리" 두 문장): 검은 화면에 세 줄이 차례로 나타났다 사라진 뒤 게임을 시작한다. 클릭·Space·Enter·ESC 로 건너뛴다.
// 시간은 실제 시간 (performance.now) 으로 잰다 — 프레임이 느려도 같은 길이
const INTRO_LINE_KEYS = ['intro.line1', 'intro.line2', 'intro.line3'];
const INTRO_TIMING = { fadeIn: 0.9, hold: 1.7, fadeOut: 0.7, gap: 0.3 };   // 한 줄이 나타나는 / 머무는 / 사라지는 시간, 줄 사이 (초)
// 순수 함수: 시작 뒤 elapsed 초일 때 { line (보이는 줄 번호, 사이 간격이면 −1), opacity (0~1), done (모두 끝남) }
function introFrame(elapsed) {
    const { fadeIn, hold, fadeOut, gap } = INTRO_TIMING, span = fadeIn + hold + fadeOut + gap;
    const line = Math.floor(elapsed / span);
    if (elapsed < 0) return { line: -1, opacity: 0, done: false };
    if (line >= INTRO_LINE_KEYS.length) return { line: -1, opacity: 0, done: true };
    const x = elapsed - line * span;
    if (x < fadeIn) return { line, opacity: x / fadeIn, done: false };
    if (x < fadeIn + hold) return { line, opacity: 1, done: false };
    if (x < fadeIn + hold + fadeOut) return { line, opacity: 1 - (x - fadeIn - hold) / fadeOut, done: false };
    return { line: -1, opacity: 0, done: false };
}
SCREENS.intro = {
    root: null, text: null, onDone: null, start: 0, shown: -2,
    enter(params) {
        hideMenuBackdrop();
        this.onDone = params.onDone || null;
        this.start = performance.now();
        this.shown = -2;
        this.root = el('div', 'ug-fill ug-center ug-intro');
        this.text = this.root.appendChild(el('div', 'ug-intro-line'));
        this.root.appendChild(el('div', 'ug-intro-skip', t('intro.skip')));
        this.root.addEventListener('click', () => this.finish());
        app.uiRoot.appendChild(this.root);
    },
    exit() { this.root = null; this.text = null; this.onDone = null; },
    update() {
        if (!this.root) return;
        const fr = introFrame((performance.now() - this.start) / 1000);
        if (fr.done) { this.finish(); return; }
        if (fr.line !== this.shown && fr.line >= 0) this.text.textContent = t(INTRO_LINE_KEYS[fr.line]);
        this.shown = fr.line >= 0 ? fr.line : this.shown;
        this.text.style.opacity = fr.opacity.toFixed(3);
    },
    onKeyDown(e) {
        if (!e.repeat && ['Space', 'Enter', 'Escape'].includes(e.code)) this.finish();
    },
    finish() {
        const done = this.onDone;
        if (!done) return;   // 한 번만
        this.onDone = null;
        done();
    },
};

// 게임 화면 (PROGRESS.md 5-1). params: { state, arrival, debug, noOverlay, fakeLock, menu, reveal }
//   debug     = 디버그 해시로 들어온 게임 (저장하지 않음, 6단계)
//   noOverlay = "클릭하여 계속" 을 숨김 (헤드리스 스크린샷용), fakeLock = 포인터 락 없이 잠긴 것으로 취급 (자동 확인용)
//   menu      = 시작하자마자 시스템 메뉴의 그 탭을 연다, reveal = 모든 칸을 방문한 것으로 취급 (디버그 해시 6-9)
//   noMonsters = 몬스터를 만들지 않음, monster / elite = 그 몬스터 1마리만 주인공 앞에 (디버그 해시 8-16)
//   debugOpts = 디버그 해시 값 (사망 화면의 [다시 시작] 이 같은 디버그 게임을 다시 연다)
SCREENS.game = {
    game: null, hud: null, overlay: null, fade: null, hurt: null, pull: null, death: null, noOverlay: false, fakeLock: false,
    menu: null,            // 열려 있는 시스템 메뉴 (createSystemMenu 결과) 또는 null
    shop: null,            // 열려 있는 상점 (createShopUi 결과) 또는 null (15-3)
    menuEscGuardUntil: 0,  // 락 해제로 메뉴가 열렸을 때 이 시각 (performance.now) 전의 ESC 는 무시 (6-1)
    debugOpts: null,
    enter(params) {
        hideMenuBackdrop();
        const g = createGameRuntime(params.state, params.arrival || 'newGame', {
            debug: !!params.debug, noMonsters: !!params.noMonsters || !!params.monster,
        });
        g.noMonsters = !!params.noMonsters;   // &monster= 는 시작한 층만 그 1마리. 층을 옮기면 평소대로 생성
        if (params.monster) spawnDebugMonster(g, params.monster, !!params.elite);
        if (params.drops) spawnDebugDrops(g);
        this.game = g;
        this.debugOpts = params.debugOpts || null;
        if (params.reveal) for (const key of g.dungeon.cells.keys()) g.visited.add(key);
        if (Number.isFinite(params.pitch)) g.player.pitch = params.pitch;
        mountDungeonView(g.view);
        app.scene.add(app.camera);   // 화면의 무기 모양 (카메라의 자식) 을 그리려면 카메라가 장면 안에 있어야 한다 (8-8)
        this.hud = createHud();
        app.uiRoot.appendChild(this.hud.root);
        this.hurt = el('div', 'ug-fill ug-hurt');   // 피격 시 화면 가장자리 붉게 (8-13)
        app.uiRoot.appendChild(this.hurt);
        this.pull = el('div', 'ug-fill ug-pull');   // 중력 당김 중 화면 가장자리 보라색 (10-5)
        app.uiRoot.appendChild(this.pull);
        this.fade = el('div', 'ug-fill ug-fade');   // 층 이동 연출 (7-3)
        app.uiRoot.appendChild(this.fade);
        this.overlay = createLockOverlay();
        app.uiRoot.appendChild(this.overlay);
        this.noOverlay = !!params.noOverlay;
        this.fakeLock = !!params.fakeLock;
        if (this.fakeLock) input.locked = true;
        // 포인터 락 상태에서 ESC 를 누르면 브라우저가 먼저 락을 풀고 keydown 이 오지 않을 수 있으므로 락 해제로 메뉴를 연다 (6-1)
        input.onLockChange = (locked) => {
            if (!locked && this.canOpenMenu()) this.openMenu(null, true);
            this.refreshOverlay();
        };
        this.refreshOverlay();
        syncCamera(g);
        if (MENU_TABS.includes(params.menu)) this.openMenu(params.menu);
        else if (params.shop) this.openShop();   // 디버그 &shop=1 (15단계)
    },
    // 잠기지 않았으면 "클릭하여 계속" (5-3). 시스템 메뉴가 열려 있으면 숨긴다. 클릭 핸들러 안에서만 포인터 락을 요청할 수 있다
    refreshOverlay() {
        this.overlay.classList.toggle('is-hidden', input.locked || this.noOverlay || !!this.menu || !!this.shop || !!this.death);
    },
    // 게임 중 + 메뉴 닫힘 + 대화상자 없음 + 층 이동 중 아님 + 사망 아님
    canOpenMenu() {
        const g = this.game;
        return !!g && !this.menu && !this.shop && dialogStack.length === 0 && !g.changingFloor && !g.dead;
    },
    // 시스템 메뉴 열기 (일시정지 U6). tab 이 없으면 마지막으로 연 탭. byLockLoss = 포인터 락 해제로 열림
    openMenu(tab, byLockLoss) {
        const g = this.game;
        if (!g || this.menu) return;
        g.paused = true;
        this.menu = createSystemMenu(g, tab || systemMenu.lastTab, () => this.closeMenu());
        app.uiRoot.appendChild(this.menu.root);
        this.menuEscGuardUntil = byLockLoss ? performance.now() + MENU_ESC_GUARD_MS : 0;
        if (this.fakeLock) input.locked = false;
        else releaseLock();   // 메뉴는 마우스 커서로 조작한다
        this.refreshOverlay();
    },
    // 닫으면 "클릭하여 계속" 이 보이고, 클릭하면 다시 락 (키 입력으로는 락을 걸 수 없다)
    closeMenu() {
        const g = this.game;
        if (!this.menu) return;
        this.menu.destroy();
        this.menu = null;
        if (g) { g.paused = false; g.menuOpen = null; }
        if (this.fakeLock) input.locked = true;
        this.refreshOverlay();
    },
    // 방랑 상인 상점 (15-3): 시스템 메뉴처럼 일시정지 + 포인터 락 해제. 닫으면 "클릭하여 계속"
    openShop() {
        const g = this.game;
        if (!this.canOpenMenu() || g.state.hero === 'eric') return;
        g.paused = true;
        this.shop = createShopUi(g, () => this.closeShop());
        app.uiRoot.appendChild(this.shop.root);
        if (this.fakeLock) input.locked = false;
        else releaseLock();
        this.refreshOverlay();
    },
    closeShop() {
        if (!this.shop) return;
        this.shop.destroy();
        this.shop = null;
        if (this.game) this.game.paused = false;
        if (this.fakeLock) input.locked = true;
        this.refreshOverlay();
    },
    // TAB / ESC: 메뉴 열기·닫기 (대화상자가 열려 있으면 onGlobalKeyDown 이 먼저 처리하므로 여기로 오지 않는다). 상점이 열려 있으면 ESC 로 닫기
    // 스킬 탭이 열려 있으면 방향키로 스크롤 (13-4, 누르고 있으면 반복. 기본 동작은 setupInput 이 막는다)
    onKeyDown(e) {
        if (this.shop) { if (e.code === 'Escape' && !e.repeat) this.closeShop(); return; }
        if (this.menu && this.menu.tab === 'skill' && scrollSkillTreeByKey(e.code)) return;
        if ((e.code !== 'Tab' && e.code !== 'Escape') || e.repeat) return;
        if (this.menu) {
            if (e.code === 'Escape' && performance.now() < this.menuEscGuardUntil) return;   // 열리자마자 닫히는 것 방지
            this.closeMenu();
        } else if (this.canOpenMenu()) {
            this.openMenu();
        }
    },
    exit() {
        input.onLockChange = null;
        if (this.menu) this.menu.destroy();
        this.menu = null;
        if (this.shop) this.shop.destroy();
        this.shop = null;
        releaseLock();
        input.locked = false;
        clearFloorRuntime(this.game);   // 몬스터·시체 등의 개체 전용 자원 해제 (4.6)
        if (this.game.viewModel) this.game.viewModel.group.removeFromParent();
        app.scene.remove(app.camera);
        unmountDungeonView(this.game.view);
        app.camera.rotation.set(0, 0, 0);
        this.game = null;
        this.hud = null;
        this.overlay = null;
        this.fade = null;
        this.hurt = null;
        this.pull = null;
        this.death = null;
    },
    update(dt) {
        const g = this.game;
        if (!g) return;
        // 층 이동 중에는 게임을 갱신하지 않는다 (입력 잠금, 7-3). 락이 풀려도 연출은 끝까지 진행한다
        // "클릭하여 계속" 이 떠 있는 동안은 게임 시간을 멈춘다 (메뉴 일시정지 U6 와 같은 취급, 렌더링은 계속)
        if (g.transition) this.updateTransition(dt);
        else {
            if (input.locked || this.noOverlay) updateGame(g, dt);
            const wf = fadedWarpFade(g).toFixed(3);   // 빛 바랜 주문서: 어두워졌다 밝아짐 (22-5). 층 이동 연출과 같은 검은 막
            if (this.fade.dataset.warp !== wf) { this.fade.dataset.warp = wf; this.fade.style.opacity = wf; }
        }
        syncCamera(g);
        updateEricDarkness(g);   // 에릭 층의 어둠·플래시 (18-3)
        syncWorldVisuals(g);
        syncViewModel(g);
        g.view.update(dt, app.camera.position);
        updateHud(this.hud, g);
        this.updateFeedback(g);
    },
    // 레벨 업 토스트, 피격 시 화면 가장자리 붉게 (0.3초), 사망 화면 (8-12, 8-13)
    updateFeedback(g) {
        while (g.uiEvents.length > 0) {
            const ev = g.uiEvents.shift();
            if (ev.type === 'levelUp') showToast(levelUpNode(ev.level), 3000, 'is-level');
            else if (ev.type === 'bossDefeated') showToast(bossDefeatedNode(ev.name), 4000, 'is-boss');
            else if (ev.type === 'pickup') showToast(pickupNode(ev.item), 2500, 'is-pickup');   // 아이템 줍기 (12-5)
            else if (ev.type === 'toast') showToast(t(ev.key));
            else if (ev.type === 'openShop') this.openShop();   // 상인 클릭 (15-2)
        }
        const hurt = Math.max(0, 1 - (g.time - g.hurtAt) / HURT_FLASH_TIME).toFixed(2);
        if (this.hurt.dataset.v !== hurt) { this.hurt.dataset.v = hurt; this.hurt.style.opacity = hurt; }
        const pull = g.player.pull ? '1' : '0';   // 중력 당김 중 보라색 일렁임 (10-5)
        if (this.pull.dataset.v !== pull) { this.pull.dataset.v = pull; this.pull.style.opacity = pull; }
        if (g.dead && !this.death) this.showDeath();
    },
    // 사망 (U2): 게임 정지 → "쓰러졌습니다" → [마지막 저장에서 다시 시작] / [메인 메뉴]. 저장 이후의 진행은 사라진다
    showDeath() {
        const g = this.game;
        if (this.menu) this.closeMenu();
        if (this.shop) this.closeShop();
        const root = el('div', 'ug-fill ug-center ug-death');
        root.appendChild(el('div', 'ug-death-title', t('death.title')));
        root.appendChild(el('div', 'ug-death-hint', t(g.debug ? 'system.debugNoSave' : 'death.hint')));
        const buttons = el('div', 'ug-death-buttons');
        const debugOpts = this.debugOpts, slot = g.state.slot;
        buttons.appendChild(makeButton(t(g.debug ? 'death.retryDebug' : 'death.retry'), () => {
            if (g.debug) startDebugGame(debugOpts || {});
            else continueGame(slot);
        }, { primary: true }));
        buttons.appendChild(makeButton(t('system.mainMenu'), () => showScreen('mainMenu')));
        root.appendChild(buttons);
        this.death = root;
        app.uiRoot.appendChild(root);
        if (this.fakeLock) input.locked = false;
        else releaseLock();
        this.refreshOverlay();
    },
    // 층 이동 연출 (7-3): 0.4초 동안 검게 → swapFloor → 0.4초 동안 밝게 → 토스트 "지하 N층 · 테마"
    updateTransition(dt) {
        const g = this.game, tr = g.transition;
        tr.t += dt;
        let fade;
        if (tr.phase === 'out') {
            fade = Math.min(1, tr.t / FLOOR_FADE_TIME);
            if (tr.t >= FLOOR_FADE_TIME) {
                swapFloor(g, tr.kind);
                tr.phase = 'in';
                tr.t = 0;
            }
        } else {
            fade = Math.max(0, 1 - tr.t / FLOOR_FADE_TIME);
            if (tr.t >= FLOOR_FADE_TIME) {
                g.transition = null;
                g.changingFloor = false;
                showToast(floorLabelNode(g.state, 'ug-toast-floor'), 3000, 'is-floor');
                this.refreshOverlay();
            }
        }
        this.fade.style.opacity = fade.toFixed(3);
    },
};
const HURT_FLASH_TIME = 0.3;   // 피격 시 화면 가장자리가 붉게 보이는 시간 (8-13)
// "레벨 업!" / "Lv" / 숫자 (.ug-num) — 숫자를 별도 요소로 나눈 토스트 (4.5)
function levelUpNode(level) {
    const frag = document.createDocumentFragment();
    frag.append(el('span', 'ug-toast-level-title', t('game.levelUp')), el('span', 'ug-toast-level-caption', t('hud.level')),
        el('span', 'ug-num ug-toast-level-num', String(level)));
    return frag;
}
// "획득" / 아이템 이름 (등급·분류 색) / ×개수 (.ug-num, 2개 이상일 때) 토스트 (12-5)
function pickupNode(item) {
    const frag = document.createDocumentFragment();
    const name = el('span', 'ug-toast-pickup-name', itemDisplayName(item));
    name.style.color = itemColor(item);
    frag.append(el('span', 'ug-toast-pickup-caption', t('inv.pickedUp')), name);
    if (item.kind === 'consumable' && item.count > 1) frag.append(el('span', 'ug-num ug-toast-pickup-count', '×' + item.count));
    return frag;
}
// "{보스 이름}" / "처치!" 토스트 (10-4)
function bossDefeatedNode(name) {
    const frag = document.createDocumentFragment();
    frag.append(el('span', 'ug-toast-boss-name', name), el('span', 'ug-toast-boss-done', t('game.bossDefeated')));
    return frag;
}
// "지하 층" / B3 (.ug-num) / 테마 이름 — 숫자를 별도 요소로 나눈 층 표시 (4.5). prefix = 각 요소 클래스 앞부분
function floorLabelNode(state, prefix) {
    const frag = document.createDocumentFragment();
    frag.append(el('span', prefix + '-caption', t('hud.floor')), el('span', 'ug-num ' + prefix + '-num', 'B' + state.floor),
        el('span', prefix + '-theme', themeLabel(state.theme)));
    return frag;
}
// "클릭하여 계속" 오버레이
function createLockOverlay() {
    const o = el('div', 'ug-fill ug-lock-overlay');
    o.appendChild(el('div', 'ug-lock-title ug-blink', t('game.clickToResume')));
    o.appendChild(el('div', 'ug-lock-hint', t('game.controlsHint')));
    o.appendChild(el('div', 'ug-lock-hint', t('game.controlsHint2')));   // 행동 슬롯·상호작용 (21-3)
    o.addEventListener('click', (e) => {
        e.stopPropagation();
        requestLock();
    });
    return o;
}
// 빈 슬롯에서 새 게임 시작 (hero = 고른 주인공, 16-2). 성소에서 시작하므로 즉시 저장한다 (U9, 6-7) → 사망 시 돌아갈 지점
// 새 게임 (AGENTS.md "스토리", 20-6): 이야기 장면 (클릭·키로 건너뛰기) → 던전 지하 1층. 슬롯에는 게임이 시작될 때 저장한다
function startNewGame(slot, hero = DEFAULT_HERO) {
    const state = createNewGameState(slot, hero);
    state.dungeonSeed = Math.floor(Math.random() * 2 ** 31);
    showScreen('intro', {
        onDone: () => {
            showScreen('game', { state, arrival: 'newGame' });
            if (!saveGame(SCREENS.game.game)) showToast(t('system.saveFailed'));
        },
    });
}
// 저장된 슬롯 이어하기 (6-6): 형식 검사 → 같은 시드·층·테마로 던전 재생성, 방문 칸 복원, 저장한 위치에서 시작
// (현재 층 몬스터는 저장 데이터의 world.runtime 으로 복원한다, 7-9·8-14)
function continueGame(slot) {
    const state = deserializeState(storageGet(slotKey(slot)));
    if (!state) {
        showToast(t('slots.loadFailed'));
        return;
    }
    state.slot = slot;   // 불러온 슬롯에 다시 저장한다
    showScreen('game', { state, arrival: 'load' });
}
// 현재 게임을 그 슬롯에 저장 (6-5). 성소 구역 확인은 호출하는 쪽이 한다. 반환: 저장했으면 true
// 디버그 해시로 시작한 게임 (g.debug) 은 저장하지 않는다 (사용자의 슬롯 데이터 보호)
function saveGame(g) {
    if (!g || g.debug) return false;
    return writeSlot(g.state.slot, g.state, g);
}

// ===== [19] UI - HUD =====
// HUD (PROGRESS.md 5-7). 전부 .ug-hud 안 (마우스 이벤트 통과). 숫자는 글자와 다른 요소 + .ug-num 글꼴 (4.5)
const TIER_MARKS = { 1: 'Ⅰ', 2: 'Ⅱ', 3: 'Ⅲ' };
function createHud() {
    const root = el('div', 'ug-fill ug-hud');
    const refs = {};
    const add = (parent, cls, text) => parent.appendChild(el('div', cls, text));
    refs.hide = add(root, 'ug-hide-mask');   // 캐비닛 안 (17-5): 검은 막 + 가운데 가는 틈. 다른 HUD 보다 먼저 넣어 아래에 깔린다
    add(refs.hide, 'ug-hide-slit');
    refs.noise = root.appendChild(el('canvas', 'ug-noise'));   // 에릭: 몬스터가 가까우면 흑백 노이즈 3단계 (19-4). 작은 해상도로 그려 늘린다
    refs.noise.width = NOISE_W;
    refs.noise.height = NOISE_H;
    refs.vignette = add(root, 'ug-noise-vignette');
    add(root, 'ug-crosshair');
    // 왼쪽 위: 층 · 테마 · 성소 안내
    const floor = add(root, 'ug-hud-floor');
    add(floor, 'ug-hud-caption', t('hud.floor'));
    refs.floorNum = add(floor, 'ug-num ug-hud-floor-num');
    refs.theme = add(floor, 'ug-hud-theme');
    refs.sanctuary = add(floor, 'ug-hud-sanctuary', t('hud.sanctuary'));
    // 오른쪽 위: 상태이상·버프 아이콘 자리 (9단계) / 위쪽 가운데: 보스 HP 막대 자리 (10단계)
    refs.effects = add(root, 'ug-hud-effects');
    refs.boss = add(root, 'ug-hud-boss');
    // 왼쪽 아래: HP · MP · 스태미너 막대 (막대 위 줄에 현재 / 최대)
    const bars = add(root, 'ug-hud-bars');
    refs.bars = {};
    for (const key of ['hp', 'mp', 'stamina', 'flash']) {   // flash = 에릭의 플래시 에너지 (18-4)
        const wrap = add(bars, 'ug-hud-bar-wrap is-' + key);
        const nums = add(wrap, 'ug-num ug-hud-bar-nums');
        const bar = add(wrap, 'ug-hud-bar');
        const fill = add(bar, 'ug-hud-bar-fill'), shield = key === 'hp' ? add(bar, 'ug-hud-bar-shield') : null;   // HP 막대 위 흰색 = 마력 보호막 (D9)
        refs.bars[key] = { wrap, nums, fill, shield, label: add(bar, 'ug-hud-bar-label', t('hud.' + key)) };
    }
    const battery = add(refs.bars.flash.wrap, 'ug-hud-battery');   // 에릭: 배터리 개수 (숫자는 별도 요소)
    add(battery, 'ug-hud-battery-label', t('hud.battery'));
    refs.battery = add(battery, 'ug-num ug-hud-battery-num');
    // 아래 가운데: 행동 슬롯 7칸
    const slots = add(root, 'ug-hud-slots');
    refs.slots = [];
    for (let i = 0; i < ACTION_SLOT_COUNT; i++) {
        const s = add(slots, 'ug-hud-slot');
        add(s, 'ug-num ug-hud-slot-key', String(i + 1));
        refs.slots.push({
            root: s, tier: add(s, 'ug-hud-slot-tier'), name: add(s, 'ug-hud-slot-name'),
            count: add(s, 'ug-num ug-hud-slot-count'), cd: add(s, 'ug-num ug-hud-slot-cd'),
        });
    }
    // 오른쪽 아래: 레벨 · 경험치, 맨 아래: 경험치 막대
    const lv = add(root, 'ug-hud-level');
    add(lv, 'ug-hud-level-label', t('hud.level'));
    refs.level = add(lv, 'ug-num ug-hud-level-num');
    refs.exp = add(lv, 'ug-num ug-hud-exp-nums');
    refs.expFill = add(add(root, 'ug-hud-exp'), 'ug-hud-exp-fill');
    // 오른쪽 아래 (레벨 위): 골드 (8-11)
    const gold = add(root, 'ug-hud-gold');
    add(gold, 'ug-hud-gold-label', t('hud.gold'));
    refs.gold = add(gold, 'ug-num ug-hud-gold-num');
    // 크로스헤어 아래: 상호작용 안내 "F | 아래층으로" (16-4·21-1)
    refs.prompt = add(root, 'ug-hud-prompt');
    add(refs.prompt, 'ug-hud-prompt-key', t('interact.key'));
    refs.promptLabel = add(refs.prompt, 'ug-hud-prompt-label');
    // 행동 슬롯 위: 귀환 주문서 시전 진행 막대 (12-7)
    refs.cast = add(root, 'ug-hud-cast');
    add(refs.cast, 'ug-hud-cast-label', localName(CONSUMABLES.scroll3));
    refs.castFill = add(add(refs.cast, 'ug-hud-cast-bar'), 'ug-hud-cast-fill');
    return { root, refs, cache: {} };
}
// 값이 바뀌었을 때만 DOM 을 고친다 (8절 18번)
function hudSet(cache, key, value, apply) {
    if (cache[key] === value) return;
    cache[key] = value;
    apply(value);
}
function updateHud(hud, g) {
    const r = hud.refs, c = hud.cache, sp = g.state.player, d = g.derived;
    hudSet(c, 'hero', g.state.hero, (v) => hud.root.classList.toggle('is-eric', v === 'eric'));   // 에릭: HP·MP·레벨·경험치·골드 숨김, 플래시 에너지·배터리 (18-4, U46)
    if (g.state.hero === 'eric') {
        const e = sp.flashEnergy || 0, b = r.bars.flash;
        hudSet(c, 'flash:n', `${Math.ceil(e)} / ${FLASH_ENERGY_MAX}`, (v) => { b.nums.textContent = v; });
        hudSet(c, 'flash:w', (clamp(e / FLASH_ENERGY_MAX, 0, 1) * 100).toFixed(1), (v) => { b.fill.style.width = v + '%'; });
        hudSet(c, 'flash:on', g.flash.on, (v) => b.wrap.classList.toggle('is-on', v));
        hudSet(c, 'battery', countConsumable(sp, 'battery'), (v) => { r.battery.textContent = '×' + v; });
    }
    hudSet(c, 'floor', g.state.floor, (v) => { r.floorNum.textContent = 'B' + v; });
    hudSet(c, 'theme', themeLabel(g.state.theme), (v) => { r.theme.textContent = v; });
    hudSet(c, 'sanctuary', g.inSanctuary ? 'hud.sanctuary' : (g.inElevator ? 'hud.elevator' : ''), (v) => {   // 저장 가능 영역 안내 (16-5)
        r.sanctuary.classList.toggle('is-visible', !!v);
        if (v) r.sanctuary.textContent = t(v);
    });
    const shield = skillBuff(g, 'D9'), shieldHp = shield ? Math.max(0, shield.shieldHp) : 0;
    for (const [key, cur, max] of [['hp', sp.hp, d.maxHp], ['mp', sp.mp, d.maxMp], ['stamina', sp.stamina, d.maxStamina]]) {
        const b = r.bars[key], extra = key === 'hp' && shieldHp >= 0.5 ? ` (+${Math.round(shieldHp)})` : '';
        hudSet(c, key + ':n', `${Math.round(cur)} / ${Math.round(max)}${extra}`, (v) => { b.nums.textContent = v; });
        hudSet(c, key + ':w', (max > 0 ? clamp(cur / max, 0, 1) * 100 : 0).toFixed(1), (v) => { b.fill.style.width = v + '%'; });
    }
    hudSet(c, 'shield', (d.maxHp > 0 ? clamp(shieldHp / d.maxHp, 0, 1) * 100 : 0).toFixed(1), (v) => { r.bars.hp.shield.style.width = v + '%'; });
    hudSet(c, 'exhausted', g.player.exhausted, (v) => {
        r.bars.stamina.wrap.classList.toggle('is-exhausted', v);
        r.bars.stamina.label.textContent = t(v ? 'hud.exhausted' : 'hud.stamina');
    });
    for (let i = 0; i < ACTION_SLOT_COUNT; i++) updateHudSlot(r.slots[i], c, i, g);
    const need = expToNext(sp.level);
    hudSet(c, 'level', sp.level, (v) => { r.level.textContent = String(v); });
    hudSet(c, 'exp', `${Math.floor(sp.exp)} / ${need}`, (v) => { r.exp.textContent = v; });
    hudSet(c, 'exp:w', (clamp(sp.exp / need, 0, 1) * 100).toFixed(1), (v) => { r.expFill.style.width = v + '%'; });
    hudSet(c, 'gold', sp.gold, (v) => { r.gold.textContent = String(v); });
    hudSet(c, 'hide', g.hiding ? 1 : 0, (v) => r.hide.classList.toggle('is-on', !!v));
    updateHudNoise(r, c, g);
    hudSet(c, 'prompt', g.interactTarget && !g.paused ? (g.interactLabel || g.interactTarget.labelKey) : '', (v) => {
        r.prompt.style.display = v ? 'flex' : 'none';
        if (v) r.promptLabel.textContent = t(v);
    });
    hudSet(c, 'cast', g.recall ? (clamp(g.recall.t / g.recall.dur, 0, 1) * 100).toFixed(1) : '', (v) => {
        r.cast.style.display = v ? 'block' : 'none';
        if (v) r.castFill.style.width = v + '%';
    });
    updateHudEffects(r, c, g);
    updateHudBoss(r, c, g);
}
// 에릭의 노이즈 (19-4, U45): 가장 가까운 몬스터 10칸 / 5칸 / 추적 당하는 중 → 불투명도 0.06 / 0.12 / 0.2 (+ 3단계는 가장자리 어둡게).
// 노이즈가 아무리 심해도 화면이 잘 보이도록 불투명도 상한 0.2. 일시정지 중에는 그림을 멈춘다. 심장 두근거림 소리는 사운드 구현 때 (20-8)
const NOISE_W = 320, NOISE_H = 180;
let noiseImage = null;
function updateHudNoise(r, c, g) {
    let level = 0;
    if (g.state.hero === 'eric') {
        const p = g.player.pos, list = g.monsters.filter((m) => m.eric && !m.dead);
        const nearest = Math.min(Infinity, ...list.map((m) => Math.hypot(m.pos.x - p.x, m.pos.z - p.z)));
        level = ericNoiseLevel(nearest, list.some((m) => m.state === 'chase'));
    }
    hudSet(c, 'noise', level, (v) => {
        r.noise.style.opacity = String(ERIC_NOISE.opacity[v]);
        r.noise.style.display = v > 0 ? 'block' : 'none';
        r.vignette.classList.toggle('is-on', v === 3);
    });
    if (level === 0 || g.paused) return;
    const ctx = r.noise.getContext('2d');
    if (!noiseImage) noiseImage = ctx.createImageData(NOISE_W, NOISE_H);
    const px = noiseImage.data;
    for (let i = 0; i < px.length; i += 4) {
        const v = (Math.random() * 256) | 0;
        px[i] = v; px[i + 1] = v; px[i + 2] = v; px[i + 3] = 255;
    }
    ctx.putImageData(noiseImage, 0, 0);
}
// 위쪽 가운데: 전투 중인 보스의 이름 + 큰 HP 막대 + 수치 (10-4). 숫자는 별도 요소 + .ug-num (4.5)
function updateHudBoss(r, c, g) {
    const b = g.bossFight && !g.bossFight.dead ? g.bossFight : null;
    hudSet(c, 'boss', b ? b.uid : 0, () => {
        r.boss.textContent = '';
        r.boss.style.display = b ? 'block' : 'none';
        delete c['boss:hp'];
        if (!b) return;
        r.boss.appendChild(el('div', 'ug-hud-boss-name', localName(b.def)));
        r.bossFill = r.boss.appendChild(el('div', 'ug-hud-boss-bar')).appendChild(el('div', 'ug-hud-boss-fill'));
        r.bossNums = r.boss.appendChild(el('div', 'ug-num ug-hud-boss-nums'));
    });
    if (!b) return;
    hudSet(c, 'boss:hp', `${Math.max(1, Math.round(b.hp))} / ${Math.round(b.maxHp)}`, (v) => {
        r.bossNums.textContent = v;
        r.bossFill.style.width = (clamp(b.hp / b.maxHp, 0, 1) * 100).toFixed(1) + '%';
    });
}
// 오른쪽 위: 상태이상·버프 아이콘 (9-6). 테두리·글자 = 효과 색, 글자 (한국어 1자 / 영어 2자) + 남은 초 (별도 요소 + .ug-num, 4.5), 중독은 중첩 수.
// 남은 초는 올림한 정수라 1초에 한 번만 다시 그린다
function updateHudEffects(r, c, g) {
    const en = currentLang === 'en';
    const items = g.player.effects.map((e) => ({ color: STATUS_EFFECTS[e.id].color, text: STATUS_ICON[e.id][en ? 1 : 0], sec: Math.ceil(e.remaining), stacks: e.stacks }))
        .concat(g.buffs.map((b) => ({ color: b.color, text: en ? b.label.en : b.label.ko, sec: Math.ceil(b.remaining), stacks: 1, buff: true })));
    hudSet(c, 'effects', JSON.stringify(items), () => {
        r.effects.textContent = '';
        for (const it of items) {
            const icon = el('div', 'ug-hud-effect' + (it.buff ? ' is-buff' : ''));
            icon.style.borderColor = it.color;
            icon.style.color = it.color;
            icon.appendChild(el('div', 'ug-hud-effect-text', it.text));
            icon.appendChild(el('div', 'ug-num ug-hud-effect-sec', String(it.sec)));
            if (it.stacks > 1) icon.appendChild(el('div', 'ug-num ug-hud-effect-stacks', '×' + it.stacks));
            r.effects.appendChild(icon);
        }
    });
}
// 소모품 약자: 단계 수식어 (하급·상급) 를 뺀 이름 앞 2글자 (하급·중급·상급이 같은 약자가 되므로 단계는 Ⅰ·Ⅱ·Ⅲ 로 따로 표시). short = [한국어, 영어] 따로 정한 약자
function shortItemName(def) {
    if (def.short) return def.short[currentLang === 'en' ? 1 : 0];
    return localName(def).replace(/^(하급|상급|Lesser|Greater)\s+/, '').slice(0, 2).trim();
}
// 행동 슬롯 한 칸: 약자, 개수 (0 개면 회색), 재사용 대기 (어둡게 + 남은 초), 활성 슬롯 금색 테두리
function updateHudSlot(s, cache, i, g) {
    const sp = g.state.player, slot = sp.actionSlots[i];
    let name = '', count = '', tier = '', kind = 'empty', out = false, cd = 0;
    if (slot && slot.type === 'skill' && SKILL_BY_ID[slot.id]) {
        const def = SKILL_BY_ID[slot.id];
        name = localName(def).slice(0, 2);
        kind = 'skill-' + def.branch;
        cd = g.cooldowns[slot.id] || 0;
        const lv = sp.skills[slot.id] || 0;
        out = lv <= 0 || def.type !== 'active' || !canPaySkill(g, def, skillCost(g, def, lv));   // 자원이 모자라면 흐리게 (14-0)
    } else if (slot && slot.type === 'item' && TOOLS[slot.id]) {   // 플래시 (18-2): 켜져 있으면 ON, 에너지·배터리가 모두 없으면 흐리게
        name = shortItemName(TOOLS[slot.id]);
        count = g.flash && g.flash.on ? 'ON' : '';
        kind = 'item-tool';
        out = !(sp.flashEnergy > 0) && countConsumable(sp, 'battery') === 0;
    } else if (slot && slot.type === 'item' && CONSUMABLES[slot.id]) {
        const def = CONSUMABLES[slot.id], n = countConsumable(sp, slot.id);
        name = shortItemName(def);
        tier = TIER_MARKS[def.tier];
        count = String(n);
        out = n === 0;
        kind = 'item-' + def.category;
        cd = g.cooldowns[itemCooldownKey(slot.id)] || 0;
    }
    const active = sp.activeSlot === i;
    const denied = !!g.slotDenied && g.slotDenied.slot === i && g.time - g.slotDenied.at < SKILL_DENY_FLASH;   // 자원 부족으로 못 씀 (14-0)
    const cdText = cd > 0 ? (cd >= 10 ? String(Math.ceil(cd)) : cd.toFixed(1)) : '';
    hudSet(cache, 'slot' + i, [name, count, tier, kind, out, active, cdText, denied].join('|'), () => {
        s.name.textContent = name;
        s.count.textContent = count;
        s.tier.textContent = tier;
        s.cd.textContent = cdText;
        s.root.className = 'ug-hud-slot is-' + kind + (active ? ' is-active' : '') + (out ? ' is-out' : '') + (cdText ? ' is-cooldown' : '') + (denied ? ' is-denied' : '');
    });
}
// ===== [20] UI - 시스템 메뉴 =====
// 시스템 메뉴 (PROGRESS.md 6단계). 게임 화면 위에 겹치고, 열려 있는 동안 게임은 일시정지한다 (U6)
const MENU_TABS = ['map', 'status', 'inventory', 'skill', 'system'];
const ERIC_MENU_TABS = ['map', 'inventory', 'system'];   // 에릭은 스테이터스·스킬 탭이 없다 (AGENTS.md "시스템 메뉴", 18-4)
function menuTabsOf(state) { return state.hero === 'eric' ? ERIC_MENU_TABS : MENU_TABS; }
const MENU_ESC_GUARD_MS = 300;             // 락 해제로 메뉴가 열린 직후 이 시간 안에 오는 ESC keydown 은 무시 (6-1)
const systemMenu = { lastTab: 'map' };     // 마지막으로 연 탭 (6-2)
// 탭 내용 그리기 (g, body). 없는 탭은 "준비 중"
const MENU_TAB_RENDERERS = {
    map: (g, body) => renderMapTab(g, body),
    status: (g, body) => renderStatusTab(g, body),
    inventory: (g, body) => renderInventoryTab(g, body),
    skill: (g, body) => renderSkillTab(g, body),
    system: (g, body) => renderSystemTab(g, body),
};
// 메뉴 DOM 을 만든다. 반환: { root, tab, select(tab), destroy() }
function createSystemMenu(g, initialTab, onClose) {
    const root = el('div', 'ug-fill ug-sysmenu');
    const bar = el('div', 'ug-sysmenu-bar');
    const body = el('div', 'ug-sysmenu-body');
    const tabButtons = {};
    const menu = { root, tab: null, select, destroy };
    const tabs = menuTabsOf(g.state);   // 에릭은 지도·인벤토리·시스템 (18-4)
    for (const id of tabs) {
        const b = el('button', 'ug-sysmenu-tab', t('menu.tab.' + id));
        b.type = 'button';
        b.dataset.tab = id;
        b.addEventListener('click', (e) => { e.stopPropagation(); select(id); });
        tabButtons[id] = b;
        bar.appendChild(b);
    }
    bar.appendChild(el('div', 'ug-sysmenu-spacer'));
    bar.appendChild(el('div', 'ug-sysmenu-hint', t('menu.closeHint')));
    bar.appendChild(makeButton(t('menu.close'), onClose, { className: 'ug-sysmenu-close' }));
    root.append(bar, body);
    function select(id) {
        if (!tabs.includes(id)) id = tabs[0];   // 없는 탭 (에릭의 스테이터스·스킬, 디버그 &menu=) 이면 지도
        menu.tab = id;
        g.menuOpen = id;
        systemMenu.lastTab = id;
        for (const k in tabButtons) tabButtons[k].classList.toggle('is-active', k === id);
        clearTooltips();
        resetInventoryUi();
        resetSkillTreeUi();
        body.innerHTML = '';
        const render = MENU_TAB_RENDERERS[id];
        if (render) render(g, body);
        else body.appendChild(el('div', 'ug-fill ug-center ug-sysmenu-empty', t('menu.preparing')));
    }
    function destroy() {
        clearTooltips();
        resetInventoryUi();
        resetSkillTreeUi();
        root.remove();
    }
    select(initialTab);
    return menu;
}
// 떠 있는 툴팁을 모두 지운다 (탭을 바꾸거나 메뉴를 닫을 때 버튼과 함께 사라지도록)
function clearTooltips() {
    for (const n of app.uiRoot.querySelectorAll('.ug-tooltip')) n.remove();
}

// --- 지도 탭 (6-3)
const MAP_W = 1600, MAP_H = 860;           // 지도 canvas 크기 (UI px)
const MAP_CELL_MIN = 6, MAP_CELL_MAX = 40; // 칸 크기 범위 (px)
const MAP_PADDING = 16;                    // 가장자리 여백 (벽 선·아이콘이 잘리지 않도록)
// 조각 아이콘 (지도·범례 공용). 보스를 처치했으면 bossDefeatedColor
const MAP_ICONS = {
    sanctuary: { glyph: '✚', color: '#f3d898', label: 'map.legend.sanctuary' },
    merchant: { glyph: '$', color: '#9fe08a', label: 'map.legend.merchant' },
    portal: { glyph: '◎', color: '#c89cff', label: 'map.legend.portal' },
    stairsUp: { glyph: '▲', color: '#9ac8ff', label: 'map.legend.stairsUp' },
    stairsDown: { glyph: '▼', color: '#9ac8ff', label: 'map.legend.stairsDown' },
    boss: { glyph: '☠', color: '#ff7a6a', label: 'map.legend.boss' },
};
// 아이콘 글꼴: 기호 (☠ 등) 가 본문 글꼴에 없어 작은 그림 문자로 대체되지 않도록 기호 글꼴을 먼저 쓴다 (CSS .ug-map-legend-icon 과 같음)
const MAP_ICON_FONT = `'Segoe UI Symbol', 'Noto Sans Symbols 2', 'Pretendard', 'Noto Sans KR', sans-serif`;
const MAP_BOSS_DEFEATED_COLOR = '#8a8a8a';
const MAP_PLAYER_COLOR = '#ff5a48';
// 지도 배치: 던전 전체가 들어가는 가장 큰 칸 크기 (MAP_CELL_MIN~MAX px) + 칸 좌표 범위를 가운데 정렬.
// 최소 크기로도 넘치는 방향은 focus (칸 좌표, 보통 플레이어 위치) 를 가운데에 둔다.
// 반환: { size, ox, oy, cols, rows } — 칸 (gx, gz) 의 왼쪽 위 = (ox + gx × size, oy + gz × size), 화면 위쪽 = 북
function mapLayout(d, w, h, focus) {
    let minGx = Infinity, maxGx = -Infinity, minGz = Infinity, maxGz = -Infinity;
    for (const c of d.cells.values()) {
        minGx = Math.min(minGx, c.gx); maxGx = Math.max(maxGx, c.gx);
        minGz = Math.min(minGz, c.gz); maxGz = Math.max(maxGz, c.gz);
    }
    const cols = maxGx - minGx + 1, rows = maxGz - minGz + 1;
    const size = clamp(Math.floor(Math.min((w - MAP_PADDING * 2) / cols, (h - MAP_PADDING * 2) / rows)), MAP_CELL_MIN, MAP_CELL_MAX);
    let ox = Math.round((w - cols * size) / 2 - minGx * size);
    let oy = Math.round((h - rows * size) / 2 - minGz * size);
    if (focus && cols * size > w - MAP_PADDING * 2) ox = Math.round(w / 2 - focus.gx * size);
    if (focus && rows * size > h - MAP_PADDING * 2) oy = Math.round(h / 2 - focus.gz * size);
    return { size, ox, oy, cols, rows };
}
// 방문한 칸의 바닥색 (시설별로 조금씩 다르게)
function mapCellFill(d, cell) {
    const piece = d.pieces[cell.pieceId];
    if (cell.sanctuaryZone) return '#7d6a34';
    if (piece.type === 'merchant') return '#3f5a36';
    if (cell.role === 'clearingRoom' || cell.role === 'clearingCenter') return piece.id === d.bossPieceId ? '#6e3530' : '#56463a';
    if (isElevatorInterior(cell)) return '#34465e';
    if (cell.role === 'portal') return '#56386e';
    return '#4a4538';
}
// 조각 → 아이콘과 그 아이콘을 그릴 칸 키. 아이콘이 없는 조각은 null
function mapIconOf(d, piece) {
    if (piece.type === 'sanctuary' || piece.type === 'merchant') return { icon: MAP_ICONS[piece.type], key: piece.center };
    if (piece.type === 'portal') return { icon: MAP_ICONS.portal, key: piece.cells[0] };
    if (piece.type === 'stairsUp' || piece.type === 'stairsDown') return { icon: MAP_ICONS[piece.type], key: piece.cells[2] };   // 엘리베이터 칸 (16-9)
    if (piece.type === 'clearing' && piece.id === d.bossPieceId) return { icon: MAP_ICONS.boss, key: piece.center };
    return null;
}
// 지도 그리기: 방문한 칸 = 바닥색 + wall 변 굵은 선 + 아이콘, 방문하지 않은 칸 = 윤곽만 불투명도 0.25 (U10), 플레이어 = 시선 방향 삼각형
function drawDungeonMap(canvas, g) {
    const d = g.dungeon, p = g.player;
    const ratio = clamp(app.stageScale * (window.devicePixelRatio || 1), 1, 2);   // 큰 화면에서 흐려지지 않도록
    canvas.width = Math.round(MAP_W * ratio);
    canvas.height = Math.round(MAP_H * ratio);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = '#08090b';
    ctx.fillRect(0, 0, MAP_W, MAP_H);
    const L = mapLayout(d, MAP_W, MAP_H, { gx: p.pos.x / CELL_SIZE, gz: p.pos.z / CELL_SIZE });
    const s = L.size, X = (gx) => L.ox + gx * s, Y = (gz) => L.oy + gz * s;
    const visited = [];
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = '#e8e2d0';
    ctx.lineWidth = 1;
    for (const [key, c] of d.cells) {
        if (g.visited.has(key)) visited.push(c);
        else ctx.strokeRect(X(c.gx) + 0.5, Y(c.gz) + 0.5, s - 1, s - 1);
    }
    ctx.globalAlpha = 1;
    for (const c of visited) {
        ctx.fillStyle = mapCellFill(d, c);
        ctx.fillRect(X(c.gx), Y(c.gz), s, s);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';   // 격자가 보이도록 칸 안쪽에 옅은 테두리
        ctx.strokeRect(X(c.gx) + 0.5, Y(c.gz) + 0.5, s - 1, s - 1);
    }
    ctx.strokeStyle = '#e8e2d0';
    ctx.lineWidth = Math.max(2, Math.round(s * 0.12));
    ctx.lineCap = 'square';
    ctx.beginPath();
    for (const c of visited) {
        const x0 = X(c.gx), y0 = Y(c.gz), x1 = x0 + s, y1 = y0 + s;
        if (c.edges.N === 'wall') { ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); }
        if (c.edges.S === 'wall') { ctx.moveTo(x0, y1); ctx.lineTo(x1, y1); }
        if (c.edges.W === 'wall') { ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); }
        if (c.edges.E === 'wall') { ctx.moveTo(x1, y0); ctx.lineTo(x1, y1); }
    }
    ctx.stroke();
    drawMapIcons(ctx, g, X, Y, s);
    drawMapPlayer(ctx, L.ox + (p.pos.x / CELL_SIZE) * s, L.oy + (p.pos.z / CELL_SIZE) * s, p.yaw, s);
}
function drawMapIcons(ctx, g, X, Y, s) {
    const d = g.dungeon;
    ctx.font = `700 ${Math.max(12, Math.round(s * 0.75))}px ${MAP_ICON_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    for (const piece of d.pieces) {
        const ic = mapIconOf(d, piece);
        if (!ic || !g.visited.has(ic.key)) continue;
        const c = d.cells.get(ic.key), cx = X(c.gx) + s / 2, cy = Y(c.gz) + s / 2;
        ctx.strokeText(ic.icon.glyph, cx, cy);
        ctx.fillStyle = ic.icon === MAP_ICONS.boss && g.state.world.bossDefeated ? MAP_BOSS_DEFEATED_COLOR : ic.icon.color;
        ctx.fillText(ic.icon.glyph, cx, cy);
    }
}
// 플레이어 삼각형: 앞 = (−sin yaw, −cos yaw) (지도 위쪽 = 북 = −Z, 4.4)
function drawMapPlayer(ctx, px, py, yaw, s) {
    const fx = -Math.sin(yaw), fy = -Math.cos(yaw), rx = -fy, ry = fx;
    const len = Math.max(9, s * 0.45), wid = len * 0.62, back = len * 0.6;
    ctx.beginPath();
    ctx.moveTo(px + fx * len, py + fy * len);
    ctx.lineTo(px - fx * back - rx * wid, py - fy * back - ry * wid);
    ctx.lineTo(px - fx * back + rx * wid, py - fy * back + ry * wid);
    ctx.closePath();
    ctx.fillStyle = MAP_PLAYER_COLOR;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
}
// 지도 탭: 위 "지하 층 / B3 / 테마" (숫자는 별도 요소 + .ug-num, 4.5), 가운데 canvas, 아래 범례
function renderMapTab(g, body) {
    const wrap = el('div', 'ug-map');
    const head = el('div', 'ug-map-head');
    head.appendChild(floorLabelNode(g.state, 'ug-map'));
    const canvas = el('canvas', 'ug-map-canvas');
    drawDungeonMap(canvas, g);
    const legend = el('div', 'ug-map-legend');
    for (const icon of Object.values(MAP_ICONS)) {
        const glyph = el('span', 'ug-map-legend-icon', icon.glyph);
        glyph.style.color = icon.color;
        legend.appendChild(el('span', 'ug-map-legend-item')).append(glyph, t(icon.label));
    }
    legend.appendChild(el('span', 'ug-map-legend-item')).append(el('span', 'ug-map-legend-player'), t('map.legend.player'));
    legend.appendChild(el('span', 'ug-map-legend-item')).append(el('span', 'ug-map-legend-unvisited'), t('map.legend.unvisited'));
    wrap.append(head, canvas, legend);
    body.appendChild(wrap);
}

// --- 스테이터스 탭 (11단계, AGENTS.md "스테이터스"). 수치는 calcDerivedStats 그대로 (게임이 멈춘 동안이라 열 때 한 번 그린다).
// 표시는 정수, 확률·% 는 소수 1자리 (AGENTS.md). 공격 간격 (소수 2자리)·속도·회복량 (소수 1자리) 은 정수로 하면 차이가 안 보여 예외 (U34)
const RES_COLORS = { fire: '#ff8a4a', cold: '#8fd8ff', lightning: '#ffe24a', poison: '#7fdc6f' };
function fmtInt(v) { return String(Math.round(v)); }
function fmtPct(v) { return v.toFixed(1) + '%'; }
// 탭에 보여줄 값 (순수 함수, 자체 테스트 대상). d = calcDerivedStats 결과.
// 행 = { label (번역 키), value (화면 문자열), unit (번역 키 | null), hint (행 아래 작은 설명 번역 키 | null) }
function statusTabModel(state, d) {
    const p = state.player, row = (label, value, unit = null, hint = null) => ({ label, value, unit, hint });
    return {
        level: p.level, exp: Math.floor(p.exp), expNeed: expToNext(p.level), statPoints: p.statPoints, skillPoints: p.skillPoints,
        stats: STAT_IDS.map((id) => ({ id, value: fmtInt(d[id]), bonus: Math.round(d[id] - p.baseStats[id]) })),   // bonus = 장비 등 (12 (+3))
        vitals: [
            row('hud.hp', `${fmtInt(p.hp)} / ${fmtInt(d.maxHp)}`),
            row('hud.mp', `${fmtInt(p.mp)} / ${fmtInt(d.maxMp)}`),
            row('hud.stamina', `${fmtInt(p.stamina)} / ${fmtInt(d.maxStamina)}`),
            row('status.hpRegen', d.hpRegen.toFixed(1), 'unit.perSec'),
            row('status.mpRegen', d.mpRegen.toFixed(1), 'unit.perSec'),
            row('status.staminaRegen', d.staminaRegen.toFixed(1), 'unit.perSec'),
        ],
        offense: [
            row('status.physAtk', fmtInt(d.physAtk)),
            row('status.magicAtk', fmtInt(d.magicAtk)),
            row('status.attackInterval', d.attackInterval.toFixed(2), 'unit.sec'),
            row('status.atkSpeed', '+' + fmtPct(d.atkSpeedBonus)),
            row('status.critChance', fmtPct(d.critChance)),
            row('status.critDamage', fmtPct(d.critDamage)),
        ],
        movement: [
            row('status.walkSpeed', d.walkSpeed.toFixed(1), 'unit.mps'),
            row('status.runSpeed', d.runSpeed.toFixed(1), 'unit.mps'),
        ],
        defense: [
            row('status.defense', fmtInt(d.defense)),
            row('status.reduction', fmtPct(physReduction(d.defense, p.level) * 100), null, 'status.reductionHint'),   // 같은 레벨 몬스터 기준
            row('status.block', fmtPct(d.blockChance)),
        ],
        resist: Object.keys(RES_KEY).map((id) => ({ id, value: fmtPct(d.res[id]), cap: fmtPct(d.resCap) })),
    };
}
function renderStatusTab(g, body) {
    const M = statusTabModel(g.state, calcDerivedStats(g.state, g));
    const rerender = () => { clearTooltips(); body.innerHTML = ''; renderStatusTab(g, body); };
    const root = el('div', 'ug-status');
    const cols = el('div', 'ug-status-cols');
    const [c1, c2, c3] = [0, 1, 2].map(() => cols.appendChild(el('div', 'ug-status-col')));
    c1.appendChild(el('div', 'ug-status-sec', t('status.sec.stats')));
    for (const s of M.stats) c1.appendChild(statusStatRow(g, s, M.statPoints, rerender));
    c1.appendChild(el('div', 'ug-status-hint', t('status.levelUpHint')));
    statusSection(c1, 'status.sec.vitals', M.vitals);
    statusSection(c2, 'status.sec.offense', M.offense);
    statusSection(c2, 'status.sec.movement', M.movement);
    statusSection(c3, 'status.sec.defense', M.defense);
    c3.appendChild(el('div', 'ug-status-sec', t('status.sec.resist')));
    for (const r of M.resist) {
        const row = c3.appendChild(el('div', 'ug-status-row'));
        const label = row.appendChild(el('span', 'ug-status-label'));
        label.appendChild(el('span', 'ug-status-res-dot')).style.background = RES_COLORS[r.id];
        label.append(t('res.' + r.id));
        row.appendChild(el('span', 'ug-num ug-status-num', `${r.value} / ${r.cap}`));
    }
    root.append(statusHead(M), cols);
    body.appendChild(root);
}
// 위 줄: 레벨 (큰 숫자) · 경험치 현재 / 필요 + 막대 · 남은 스탯·스킬 포인트 (숫자는 별도 요소 + .ug-num, 4.5)
function statusHead(M) {
    const head = el('div', 'ug-status-head');
    const lv = head.appendChild(el('div', 'ug-status-lv'));
    lv.append(el('span', 'ug-status-lv-label', t('status.level')), el('span', 'ug-num ug-status-lv-num', String(M.level)));
    const exp = head.appendChild(el('div', 'ug-status-exp'));
    exp.appendChild(el('div', 'ug-status-exp-top')).append(el('span', 'ug-status-label', t('status.exp')), el('span', 'ug-num ug-status-num', `${M.exp} / ${M.expNeed}`));
    exp.appendChild(el('div', 'ug-status-exp-bar')).appendChild(el('div', 'ug-status-exp-fill')).style.width = (clamp(M.exp / M.expNeed, 0, 1) * 100).toFixed(1) + '%';
    for (const [key, n] of [['status.statPoints', M.statPoints], ['status.skillPoints', M.skillPoints]]) {
        const item = head.appendChild(el('div', 'ug-status-point' + (n > 0 ? ' is-available' : '')));
        item.append(el('span', 'ug-status-point-label', t(key)), el('span', 'ug-num ug-status-point-num', String(n)));
    }
    return head;
}
function statusSection(col, titleKey, rows) {
    col.appendChild(el('div', 'ug-status-sec', t(titleKey)));
    for (const r of rows) {
        const row = col.appendChild(el('div', 'ug-status-row'));
        row.appendChild(el('span', 'ug-status-label', t(r.label)));
        const v = row.appendChild(el('span', 'ug-status-value'));
        v.appendChild(el('span', 'ug-num ug-status-num', r.value));
        if (r.unit) v.appendChild(el('span', 'ug-status-unit', t(r.unit)));
        if (r.hint) col.appendChild(el('div', 'ug-status-hint ug-status-row-hint', t(r.hint)));
    }
}
// 힘·민첩성·지능 한 줄: 이름 + 역할, 최종값 (+ 장비 보너스), [+] (남은 스탯 포인트가 없으면 회색, 누르면 이유 툴팁 — 11-2)
function statusStatRow(g, s, points, rerender) {
    const row = el('div', 'ug-status-stat');
    row.appendChild(el('div', 'ug-status-stat-name')).append(el('div', 'ug-status-stat-label', t('stat.' + s.id)), el('div', 'ug-status-stat-desc', t('stat.' + s.id + '.desc')));
    const val = row.appendChild(el('div', 'ug-status-stat-value'));
    val.appendChild(el('span', 'ug-num ug-status-stat-num', s.value));
    if (s.bonus !== 0) val.appendChild(el('span', 'ug-num ug-status-stat-bonus', `(${s.bonus > 0 ? '+' : ''}${s.bonus})`));
    const plus = makeButton('+', () => {
        if (!spendStatPoint(g.state, s.id)) return;
        g.derived = calcDerivedStats(g.state, g);   // 멈춘 동안에도 HUD 의 최대치가 바로 바뀌도록
        rerender();
    }, { className: 'ug-status-plus', disabledReason: points > 0 ? null : t('status.noPoints') });
    plus.dataset.stat = s.id;
    plus.setAttribute('aria-label', t('stat.' + s.id) + ' — ' + t('status.addPoint'));
    row.appendChild(plus);
    return row;
}

// --- 아이템 아이콘 (12-6): 2D canvas 에 간단한 도형으로 그려 dataURL 로 캐시 (이미지 파일 없음). 좌표는 64×64 기준, 2배로 그린다
const ICON = { metal: '#c4c8d0', metalDark: '#7a7e88', dark: '#3e3026', gold: '#d8b45a', wood: '#7a5230', leather: '#8a5a32', orb: '#c8a8ff' };
const ICON_GLASS = 'rgba(210, 228, 255, 0.28)', ICON_GLASS_EDGE = 'rgba(230, 240, 255, 0.85)';
function iconPoly(c, pts, fill, stroke) {
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fillStyle = fill;
    c.fill();
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.5; c.stroke(); }
}
// 검·단검: 45° 로 기울인 날 (len·폭 w) + 코등이 (폭 guard) + 손잡이 + 끝 장식
function iconBlade(c, len, w, guard) {
    c.translate(32, 32);
    c.rotate(Math.PI / 4);
    iconPoly(c, [[-w / 2, 6], [-w / 2, 6 - len + w], [0, 6 - len], [w / 2, 6 - len + w], [w / 2, 6]], ICON.metal, ICON.metalDark);
    c.fillStyle = 'rgba(255, 255, 255, 0.5)';
    c.fillRect(-0.6, 4 - len + w, 1.2, len - w - 2);
    c.fillStyle = ICON.gold;
    c.fillRect(-guard / 2, 6, guard, 4);
    c.fillStyle = ICON.dark;
    c.fillRect(-2.5, 10, 5, 12);
    c.beginPath();
    c.arc(0, 24, 3.5, 0, Math.PI * 2);
    c.fillStyle = ICON.gold;
    c.fill();
}
// 막대 + 발광 구 (완드·지팡이)
function iconRod(c, top, bottom, w, orbR) {
    c.translate(32, 32);
    c.rotate(Math.PI / 4);
    c.fillStyle = ICON.wood;
    c.fillRect(-w / 2, top, w, bottom - top);
    const grad = c.createRadialGradient(0, top - orbR * 0.4, 1, 0, top - orbR * 0.4, orbR * 1.8);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, ICON.orb);
    grad.addColorStop(1, 'rgba(160, 120, 255, 0)');
    c.fillStyle = grad;
    c.beginPath();
    c.arc(0, top - orbR * 0.4, orbR * 1.8, 0, Math.PI * 2);
    c.fill();
}
// 둥근 병 (물약): 몸통 원 + 목 + 마개, 아래쪽에 액체
function iconFlask(c, color) {
    c.fillStyle = ICON.wood;
    c.fillRect(25, 5, 14, 7);
    c.fillStyle = ICON_GLASS;
    c.fillRect(27, 11, 10, 14);
    c.save();
    c.beginPath();
    c.arc(32, 40, 17, 0, Math.PI * 2);
    c.clip();
    c.fillStyle = ICON_GLASS;
    c.fillRect(0, 0, 64, 64);
    c.fillStyle = color;
    c.fillRect(0, 34, 64, 30);
    c.restore();
    c.strokeStyle = ICON_GLASS_EDGE;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(32, 40, 17, 0, Math.PI * 2);
    c.stroke();
    c.strokeRect(27, 11, 10, 14);
    c.fillStyle = 'rgba(255, 255, 255, 0.55)';
    c.beginPath();
    c.ellipse(25, 33, 3, 6, -0.5, 0, Math.PI * 2);
    c.fill();
}
const ITEM_ICON_DRAW = {
    sword: (c) => iconBlade(c, 34, 7, 20),
    gsword: (c) => iconBlade(c, 40, 10, 26),
    dagger: (c) => iconBlade(c, 21, 7, 14),
    pipe(c) {
        c.translate(32, 32);
        c.rotate(Math.PI / 4);
        c.fillStyle = '#7a766e';
        c.fillRect(-4, -28, 8, 52);
        c.fillStyle = 'rgba(255, 255, 255, 0.25)';
        c.fillRect(-2, -28, 1.5, 52);
        c.fillStyle = '#26221e';
        c.fillRect(-4.5, 10, 9, 14);
    },
    wand: (c) => iconRod(c, -16, 24, 4, 6),
    staff: (c) => iconRod(c, -20, 28, 5, 8),
    helmet(c) {
        c.beginPath();
        c.moveTo(12, 42);
        c.quadraticCurveTo(12, 10, 32, 10);
        c.quadraticCurveTo(52, 10, 52, 42);
        c.closePath();
        c.fillStyle = ICON.metal;
        c.fill();
        c.strokeStyle = ICON.metalDark;
        c.lineWidth = 1.5;
        c.stroke();
        c.fillStyle = ICON.metalDark;
        c.fillRect(8, 40, 48, 7);
        c.fillStyle = '#1a1816';
        c.fillRect(17, 27, 30, 5);
        c.fillStyle = ICON.metal;
        c.fillRect(30, 26, 4, 13);
    },
    armor(c) {
        iconPoly(c, [[20, 9], [26, 14], [38, 14], [44, 9], [57, 18], [51, 31], [46, 28], [46, 55], [18, 55], [18, 28], [13, 31], [7, 18]], '#9a8a70', '#5a4a38');
        c.fillStyle = '#5a4a38';
        c.fillRect(31, 16, 2, 38);
        c.fillRect(19, 44, 26, 3);
    },
    boots(c) {
        iconPoly(c, [[18, 8], [36, 8], [36, 37], [53, 41], [56, 50], [56, 55], [18, 55]], ICON.leather, '#4a2e18');
        c.fillStyle = '#2a1a10';
        c.fillRect(18, 50, 38, 5);
        c.fillStyle = 'rgba(255, 255, 255, 0.15)';
        c.fillRect(20, 12, 4, 30);
    },
    shield(c) {
        c.beginPath();
        c.moveTo(32, 6);
        c.lineTo(53, 12);
        c.lineTo(51, 33);
        c.quadraticCurveTo(46, 48, 32, 58);
        c.quadraticCurveTo(18, 48, 13, 33);
        c.lineTo(11, 12);
        c.closePath();
        c.fillStyle = '#8a6a40';
        c.fill();
        c.strokeStyle = ICON.metal;
        c.lineWidth = 3;
        c.stroke();
        c.fillStyle = ICON.metal;
        c.beginPath();
        c.arc(32, 30, 6, 0, Math.PI * 2);
        c.fill();
    },
    tome(c) {
        c.fillStyle = '#e8e0c8';
        c.fillRect(20, 12, 31, 42);
        c.fillStyle = '#5a2e7a';
        c.fillRect(14, 9, 34, 46);
        c.fillStyle = '#3a1a52';
        c.fillRect(14, 9, 6, 46);
        c.strokeStyle = ICON.gold;
        c.lineWidth = 2;
        c.beginPath();
        c.arc(34, 32, 8, 0, Math.PI * 2);
        c.stroke();
        c.beginPath();
        c.moveTo(34, 24);
        c.lineTo(34, 40);
        c.moveTo(26, 32);
        c.lineTo(42, 32);
        c.stroke();
    },
    ring(c) {
        c.strokeStyle = ICON.gold;
        c.lineWidth = 6;
        c.beginPath();
        c.arc(32, 39, 14, 0, Math.PI * 2);
        c.stroke();
        iconPoly(c, [[32, 13], [40, 21], [32, 29], [24, 21]], '#7ad8ff', '#e8faff');
    },
    hp: iconFlask, mp: iconFlask, sta: iconFlask, cure: iconFlask,
    throw(c, color) {
        c.strokeStyle = '#c8b080';
        c.lineWidth = 2.5;
        c.beginPath();
        c.moveTo(38, 26);
        c.quadraticCurveTo(46, 18, 48, 10);
        c.stroke();
        c.beginPath();
        c.arc(30, 40, 17, 0, Math.PI * 2);
        c.fillStyle = '#34322e';
        c.fill();
        c.strokeStyle = color;
        c.lineWidth = 4;
        c.beginPath();
        c.arc(30, 40, 12, Math.PI * 0.9, Math.PI * 2.1);
        c.stroke();
        c.fillStyle = color;
        c.beginPath();
        c.arc(49, 9, 4, 0, Math.PI * 2);
        c.fill();
    },
    elixir(c, color) {
        c.fillStyle = ICON.wood;
        c.fillRect(25, 4, 14, 6);
        const body = [[27, 9], [37, 9], [37, 22], [52, 55], [12, 55], [27, 22]];
        iconPoly(c, body, ICON_GLASS, ICON_GLASS_EDGE);
        iconPoly(c, [[21, 36], [43, 36], [52, 55], [12, 55]], color);
        c.strokeStyle = ICON_GLASS_EDGE;
        c.lineWidth = 2;
        c.beginPath();
        body.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
        c.closePath();
        c.stroke();
    },
    scroll(c, color) {
        c.fillStyle = color;
        c.fillRect(16, 14, 32, 36);
        c.fillStyle = '#b89c64';
        for (const y of [10, 46]) {
            c.beginPath();
            c.roundRect(11, y, 42, 9, 4);
            c.fill();
        }
        c.strokeStyle = 'rgba(90, 60, 30, 0.6)';
        c.lineWidth = 1.5;
        for (let y = 24; y <= 40; y += 5) { c.beginPath(); c.moveTo(21, y); c.lineTo(43, y); c.stroke(); }
    },
    battery(c, color) {   // 에릭 (18-1): 원통 건전지 — 몸통 + 색 띠 + 양극 꼭지
        c.fillStyle = '#c8ccd2';
        c.fillRect(27, 6, 10, 6);
        c.fillStyle = '#2a2c30';
        c.beginPath();
        c.roundRect(19, 11, 26, 46, 4);
        c.fill();
        c.fillStyle = color;
        c.fillRect(19, 15, 26, 14);
        c.fillStyle = '#f4f4f0';
        c.fillRect(30, 18, 4, 8);
        c.fillRect(28, 20, 8, 4);
    },
    flashlight(c) {   // 에릭 (18-1): 손전등 — 몸통 + 머리 + 빛
        iconPoly(c, [[39, 14], [50, 25], [64, 14], [50, 0]], 'rgba(255, 236, 160, 0.35)');   // 오른쪽 위로 뻗는 빛
        c.save();
        c.translate(32, 32);
        c.rotate(Math.PI / 4);   // 머리가 오른쪽 위
        c.fillStyle = '#3a3e46';
        c.beginPath();
        c.roundRect(-6, -4, 12, 30, 3);
        c.fill();
        c.fillStyle = '#5a606a';
        c.beginPath();
        c.roundRect(-10, -16, 20, 14, 3);
        c.fill();
        c.fillStyle = '#fff2b8';
        c.fillRect(-8, -18, 16, 3);
        c.fillStyle = '#d8dce2';
        c.fillRect(-3, 6, 6, 5);
        c.restore();
    },
    glowstick(c, color) {   // 에릭 (22-2): 비스듬한 발광 막대 + 빛 번짐 + 끝 마개
        c.save();
        c.translate(32, 32);
        c.rotate(-Math.PI / 4);
        const glow = c.createRadialGradient(0, 0, 4, 0, 0, 28);
        glow.addColorStop(0, 'rgba(125, 255, 154, 0.45)');
        glow.addColorStop(1, 'rgba(125, 255, 154, 0)');
        c.fillStyle = glow;
        c.fillRect(-28, -28, 56, 56);
        c.fillStyle = color;
        c.beginPath();
        c.roundRect(-5, -24, 10, 48, 5);
        c.fill();
        c.fillStyle = 'rgba(255, 255, 255, 0.55)';
        c.fillRect(-2, -20, 2.5, 40);
        c.fillStyle = '#3a4a3e';
        c.fillRect(-5.5, -26, 11, 6);
        c.fillRect(-1.5, -30, 3, 5);
        c.restore();
    },
    keycard(c, color) {   // 에릭 (22-2): 카드 + 자기 띠 + 칩
        c.save();
        c.translate(32, 32);
        c.rotate(-0.25);
        c.fillStyle = '#e8eef4';
        c.beginPath();
        c.roundRect(-24, -16, 48, 32, 4);
        c.fill();
        c.fillStyle = color;
        c.fillRect(-24, -10, 48, 8);
        c.fillStyle = '#d8b04a';
        c.beginPath();
        c.roundRect(-18, 3, 11, 8, 1.5);
        c.fill();
        c.fillStyle = '#8a96a4';
        c.fillRect(-2, 5, 20, 2.5);
        c.fillRect(-2, 9.5, 14, 2.5);
        c.restore();
    },
    fadedScroll(c, color) {   // 에릭 (22-2): 빛 바랜 두루마리 — 누렇게 바랜 종이 + 흐린 글자 + 찢긴 아래 끝
        c.fillStyle = color;
        iconPoly(c, [[16, 14], [48, 14], [48, 44], [44, 47], [40, 44], [35, 48], [30, 44], [25, 47], [20, 44], [16, 46]], color);
        c.fillStyle = '#9a8a68';
        c.beginPath();
        c.roundRect(11, 9, 42, 9, 4);
        c.fill();
        c.strokeStyle = 'rgba(110, 90, 60, 0.35)';
        c.lineWidth = 1.5;
        for (let y = 24; y <= 38; y += 5) { c.beginPath(); c.moveTo(21, y); c.lineTo(41 - (y % 3) * 3, y); c.stroke(); }
        c.fillStyle = 'rgba(150, 120, 200, 0.45)';   // 흐릿한 마법진 자국
        c.beginPath();
        c.arc(32, 31, 6, 0, Math.PI * 2);
        c.fill();
    },
};
// 아이템 → 아이콘 종류: 장비 = 무기 종류·보조장비 종류·부위 (쇠파이프는 pipe), 소모품 = 분류
function itemTypeKey(base) {
    if (base.slot === 'weapon') return base.weaponType;
    if (base.slot === 'offhand') return base.offhandType;
    return base.slot;
}
const itemIconCache = new Map();
function itemIconUrl(item) {
    const kind = item.kind === 'equip' ? itemTypeKey(EQUIP_BASES[item.baseId]) : item.kind === 'tool' ? item.id : CONSUMABLES[item.id].category;
    const color = item.kind === 'consumable' ? itemColor(item) : '';
    const key = kind + color;
    if (!itemIconCache.has(key)) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 128;
        const c = canvas.getContext('2d');
        c.scale(2, 2);
        c.lineJoin = 'round';
        ITEM_ICON_DRAW[kind](c, color);
        itemIconCache.set(key, canvas.toDataURL());
    }
    return itemIconCache.get(key);
}
// 장착 칸이 비었을 때의 흐린 그림
const EQUIP_PLACEHOLDER = {
    helmet: { kind: 'equip', baseId: 'helm1' }, armor: { kind: 'equip', baseId: 'armor1' }, weapon: { kind: 'equip', baseId: 'sword1' },
    offhand: { kind: 'equip', baseId: 'shield1' }, ring1: { kind: 'equip', baseId: 'ring1' }, ring2: { kind: 'equip', baseId: 'ring1' },
    boots: { kind: 'equip', baseId: 'boots1' },
};
function itemDisplayName(item) {
    if (item.kind === 'equip') return currentLang === 'en' ? item.name.en : item.name.ko;
    if (item.kind === 'tool') return localName(TOOLS[item.id]);   // 플래시 (18-1)
    return localName(CONSUMABLES[item.id]);
}

// --- 인벤토리 탭 (12-6, AGENTS.md "시스템 메뉴 > 인벤토리").
// 왼쪽: 장착 칸 7개 (사람 모양), 오른쪽: 8×5 = 40칸, 아래: 행동 슬롯 7칸 + 골드. 메뉴가 열린 동안 게임이 멈추므로 바뀔 때마다 다시 그린다.
// 클릭: 장비 → 장착 / 장착 칸 → 해제 / 소모품 → 작은 메뉴 ([사용] [행동 슬롯 1~7] [취소]) / 행동 슬롯 → [해제] 메뉴
// 드래그 (6px 이상): 장비 → 장착 칸 / 장착 칸 → 인벤토리 / 소모품 → 행동 슬롯 / 행동 슬롯 → 바깥 = 해제 / 인벤토리 칸끼리 = 교환
// 상세 정보: 마우스 오른쪽 버튼 또는 500ms 이상 누르기 → 팝업 (밖을 누르면 닫힘). 실패 이유는 토스트
const INV_DRAG_PX = 6, INV_LONG_PRESS_MS = 500;
const EQUIP_LAYOUT = { helmet: [190, 0], weapon: [30, 160], armor: [190, 160], offhand: [350, 160], ring1: [30, 320], ring2: [350, 320], boots: [190, 480] };
const invUi = { press: null, drag: null, popup: null };   // 누르는 중·드래그 중·떠 있는 팝업
function renderInventoryTab(g, body) {
    resetInventoryUi();
    const sp = g.state.player;
    const rerender = () => { clearTooltips(); body.innerHTML = ''; renderInventoryTab(g, body); };
    const root = el('div', 'ug-inv' + (g.state.hero === 'eric' ? ' is-eric' : ''));   // 에릭: 장착 칸·골드 없음 (18-4, U46)
    const equip = root.appendChild(el('div', 'ug-inv-equip'));
    equip.appendChild(el('div', 'ug-inv-title', t('inv.equipment')));
    const doll = equip.appendChild(el('div', 'ug-inv-doll'));
    for (const slot of EQUIP_SLOT_KEYS) {
        const wrap = doll.appendChild(el('div', 'ug-inv-equip-wrap'));
        wrap.style.left = EQUIP_LAYOUT[slot][0] + 'px';
        wrap.style.top = EQUIP_LAYOUT[slot][1] + 'px';
        wrap.append(invCell(g, 'equip', slot, sp.equipment[slot]), el('div', 'ug-inv-slot-label', t('equipSlot.' + slot)));
    }
    const bag = root.appendChild(el('div', 'ug-inv-bag'));
    const used = sp.inventory.filter((it) => it !== null).length;
    bag.appendChild(el('div', 'ug-inv-title')).append(el('span', null, t('inv.bag')), el('span', 'ug-num ug-inv-count', `${used} / ${INVENTORY_SIZE}`));
    const grid = bag.appendChild(el('div', 'ug-inv-grid'));
    sp.inventory.forEach((it, i) => grid.appendChild(invCell(g, 'inv', i, it)));
    bag.appendChild(el('div', 'ug-inv-hint', t('inv.hint')));
    const actions = root.appendChild(el('div', 'ug-inv-actions'));
    actions.appendChild(el('div', 'ug-inv-title', t('inv.actionSlots')));
    const row = actions.appendChild(el('div', 'ug-inv-action-row'));
    for (let i = 0; i < ACTION_SLOT_COUNT; i++) row.appendChild(actionCell(g, i));
    root.appendChild(el('div', 'ug-inv-gold')).append(el('span', 'ug-inv-gold-label', t('hud.gold')), el('span', 'ug-num ug-inv-gold-num', String(sp.gold)));
    attachInventoryPointer(g, root, rerender);
    body.appendChild(root);
}
// 칸 하나 (zone = 'inv' | 'equip', key = 인벤토리 번호 | 장착 칸 이름)
function invCell(g, zone, key, item) {
    const cell = el('div', 'ug-inv-cell is-' + zone);
    cell.dataset.zone = zone;
    cell.dataset.key = String(key);
    if (item) cell.appendChild(itemNode(item, g.state.player.level));
    else if (zone === 'equip') {
        const ph = cell.appendChild(el('img', 'ug-inv-placeholder'));
        ph.src = itemIconUrl(EQUIP_PLACEHOLDER[key]);
        ph.alt = '';
        ph.draggable = false;
    }
    return cell;
}
// 아이템 그림: 아이콘 + 단계 (Ⅰ·Ⅱ·Ⅲ) + 개수 (소모품) / 요구 레벨 미달이면 붉게 + "Lv10". 장비 테두리 = 등급 색
function itemNode(item, level) {
    const n = el('div', 'ug-item');
    const img = n.appendChild(el('img', 'ug-item-icon'));
    img.src = itemIconUrl(item);
    img.alt = '';
    img.draggable = false;
    const tier = item.kind === 'equip' ? item.tier : item.kind === 'consumable' ? CONSUMABLES[item.id].tier : 0;   // 도구·배터리는 단계 없음
    if (TIER_MARKS[tier]) n.appendChild(el('span', 'ug-item-tier', TIER_MARKS[tier]));
    if (item.kind === 'consumable') {
        n.appendChild(el('span', 'ug-num ug-item-count', String(item.count)));
    } else if (item.kind === 'tool') {
        n.classList.add('is-tool');
    } else {
        n.style.borderColor = RARITIES[item.rarity].color;
        if (item.rarity !== 'normal') n.classList.add('is-' + item.rarity);
        const req = EQUIP_BASES[item.baseId].reqLv;
        if (req > level) {
            n.classList.add('is-locked');
            n.appendChild(el('span', 'ug-num ug-item-req', 'Lv' + req));
        }
    }
    return n;
}
// 행동 슬롯 한 칸: 스킬은 이름 (갈래 색), 소모품은 아이콘 + 인벤토리 안의 개수 (0 이면 회색)
function actionCell(g, i) {
    const sp = g.state.player, slot = sp.actionSlots[i];
    const cell = el('div', 'ug-inv-cell is-action' + (sp.activeSlot === i ? ' is-active' : ''));
    cell.dataset.zone = 'action';
    cell.dataset.key = String(i);
    if (slot && slot.type === 'skill' && SKILL_BY_ID[slot.id]) {
        const def = SKILL_BY_ID[slot.id];
        cell.appendChild(el('div', 'ug-item is-skill is-skill-' + def.branch, localName(def)));
    } else if (slot && slot.type === 'item' && TOOLS[slot.id]) {   // 플래시 (18-1)
        cell.appendChild(itemNode({ kind: 'tool', id: slot.id }, sp.level));
    } else if (slot && slot.type === 'item' && CONSUMABLES[slot.id]) {
        const node = cell.appendChild(itemNode({ kind: 'consumable', id: slot.id, count: countConsumable(sp, slot.id) }, sp.level));
        if (countConsumable(sp, slot.id) === 0) node.classList.add('is-out');
    }
    cell.appendChild(el('span', 'ug-num ug-inv-action-key', String(i + 1)));
    return cell;
}
// 칸 → { zone, index | slot, item | action } (비었으면 null)
function invRef(g, cell) {
    const sp = g.state.player, zone = cell.dataset.zone, key = cell.dataset.key;
    if (zone === 'inv') return sp.inventory[Number(key)] ? { zone, index: Number(key), item: sp.inventory[Number(key)] } : null;
    if (zone === 'equip') return sp.equipment[key] ? { zone, slot: key, item: sp.equipment[key] } : null;
    if (zone === 'action') return sp.actionSlots[Number(key)] ? { zone, index: Number(key), action: sp.actionSlots[Number(key)] } : null;
    return null;
}
// 마우스 위치 → UI 좌표 (1920×1080 기준)
function uiPointOf(e) {
    const s = app.stage.getBoundingClientRect(), k = app.stageScale || 1;
    return { x: (e.clientX - s.left) / k, y: (e.clientY - s.top) / k };
}
function invCellAt(e) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    return target && target.closest ? target.closest('[data-zone]') : null;
}
function attachInventoryPointer(g, root, rerender) {
    root.addEventListener('pointerdown', (e) => {
        const cell = e.target.closest ? e.target.closest('[data-zone]') : null;
        if (!cell || !invRef(g, cell) || invUi.press) return;
        if (e.button === 2) { showInvDetail(g, cell); return; }
        if (e.button !== 0) return;
        const p = uiPointOf(e);
        const press = { cell, x: p.x, y: p.y, id: e.pointerId, long: false, timer: 0 };
        press.timer = setTimeout(() => {   // 길게 누르기 → 상세 정보 (움직이지 않았을 때)
            if (invUi.press !== press || invUi.drag) return;
            press.long = true;
            showInvDetail(g, cell);
        }, INV_LONG_PRESS_MS);
        invUi.press = press;
        try { root.setPointerCapture(e.pointerId); } catch { /* 무시 */ }
    });
    root.addEventListener('pointermove', (e) => {
        const pr = invUi.press;
        if (!pr || e.pointerId !== pr.id) return;
        const p = uiPointOf(e);
        if (!invUi.drag && !pr.long && Math.hypot(p.x - pr.x, p.y - pr.y) >= INV_DRAG_PX) startInvDrag(pr);
        if (invUi.drag) moveInvDrag(p, e);
    });
    const end = (e, cancel) => {
        const pr = invUi.press;
        if (!pr || e.pointerId !== pr.id) return;
        clearTimeout(pr.timer);
        invUi.press = null;
        if (invUi.drag) {
            const target = cancel ? null : invCellAt(e);
            endInvDrag();
            if (!cancel) handleInvDrop(g, pr.cell, target, rerender);
        } else if (!cancel && !pr.long) {
            handleInvClick(g, pr.cell, rerender);
        }
    };
    root.addEventListener('pointerup', (e) => end(e, false));
    root.addEventListener('pointercancel', (e) => end(e, true));
}
// 드래그: 반투명 복사본이 커서를 따라가고, 놓을 칸을 밝게
function startInvDrag(pr) {
    const src = pr.cell.querySelector('.ug-item');
    if (!src) return;
    closeItemPopup();
    const r = uiRectOf(src), ghost = src.cloneNode(true);
    ghost.classList.add('ug-inv-ghost');
    ghost.style.width = r.width + 'px';
    ghost.style.height = r.height + 'px';
    app.uiRoot.appendChild(ghost);
    pr.cell.classList.add('is-dragging');
    invUi.drag = { ghost, cell: pr.cell, w: r.width, h: r.height, over: null };
}
function moveInvDrag(p, e) {
    const d = invUi.drag;
    d.ghost.style.left = (p.x - d.w / 2) + 'px';
    d.ghost.style.top = (p.y - d.h / 2) + 'px';
    const over = invCellAt(e);
    if (over === d.over) return;
    if (d.over) d.over.classList.remove('is-over');
    if (over && over !== d.cell) over.classList.add('is-over');
    d.over = over;
}
function endInvDrag() {
    const d = invUi.drag;
    if (!d) return;
    d.ghost.remove();
    d.cell.classList.remove('is-dragging');
    if (d.over) d.over.classList.remove('is-over');
    invUi.drag = null;
}
// 탭을 바꾸거나 메뉴를 닫을 때: 팝업·드래그·누르기 정리
function resetInventoryUi() {
    closeItemPopup();
    endInvDrag();
    if (invUi.press) clearTimeout(invUi.press.timer);
    invUi.press = null;
}
// 장비가 바뀌면 파생 수치를 바로 다시 계산 (멈춘 동안에도 HUD 최대치가 바뀌도록, 최대치가 줄면 현재값을 깎음)
function applyInvResult(g, r, rerender) {
    if (r && r.ok === false) { showToast(t(r.reason)); return; }
    g.derived = calcDerivedStats(g.state, g);
    clampVitals(g);
    rerender();
}
function handleInvClick(g, cell, rerender) {
    const ref = invRef(g, cell);
    if (!ref) return;
    if (ref.zone === 'inv' && ref.item.kind === 'equip') applyInvResult(g, equipItem(g.state, ref.index), rerender);
    else if (ref.zone === 'equip') applyInvResult(g, unequipItem(g.state, ref.slot), rerender);
    else if (ref.zone === 'inv' && ref.item.kind === 'tool') showToolMenu(g, cell, ref.item.id, rerender);
    else if (ref.zone === 'inv') showConsumableMenu(g, cell, ref.item.id, rerender);
    else if (ref.zone === 'action') showActionMenu(g, cell, ref.index, rerender);
}
function handleInvDrop(g, srcCell, dstCell, rerender) {
    const st = g.state, src = invRef(g, srcCell);
    if (!src || dstCell === srcCell) return;
    const dz = dstCell ? dstCell.dataset.zone : null, dk = dstCell ? dstCell.dataset.key : null;
    if (src.zone === 'action') {   // 행동 슬롯끼리 = 교환, 그 밖 (바깥) = 해제
        if (dz === 'action') swapActionSlots(st, src.index, Number(dk));
        else setActionSlot(st, src.index, null);
        rerender();
    } else if (src.zone === 'inv') {
        if (dz === 'inv') { moveInventoryItem(st, src.index, Number(dk)); rerender(); }
        else if (dz === 'equip') applyInvResult(g, src.item.kind === 'equip' ? equipItem(st, src.index, dk) : { ok: false, reason: 'inv.wrongSlot' }, rerender);
        else if (dz === 'action') {
            if (src.item.kind === 'equip') showToast(t('inv.equipToAction'));
            else if (!setActionSlot(st, Number(dk), { type: 'item', id: src.item.id })) showToast(t(CONSUMABLES[src.item.id].useReason || 'item.none'));   // 소모품·도구, 배터리·카드키는 등록하지 않음
            else rerender();
        }
    } else if (dz === 'inv') {   // 장착 칸 → 인벤토리: 그 칸의 장비가 같은 부위면 교체, 아니면 해제
        const target = st.player.inventory[Number(dk)];
        if (target && target.kind === 'equip') {
            const r = equipItem(st, Number(dk), src.slot);
            if (r.ok || r.reason !== 'inv.wrongSlot') { applyInvResult(g, r, rerender); return; }
        }
        applyInvResult(g, unequipItem(st, src.slot, Number(dk)), rerender);
    } else if (dz === 'equip' && /^ring[12]$/.test(src.slot) && /^ring[12]$/.test(dk)) {   // 반지 두 칸끼리 교환
        const eq = st.player.equipment;
        [eq.ring1, eq.ring2] = [eq.ring2, eq.ring1];
        rerender();
    }
}
// --- 팝업 (상세 정보·소모품 메뉴): build(pop) 으로 내용을 채운 뒤 칸 오른쪽 (넘치면 왼쪽) 에 띄운다. 팝업 밖을 누르면 닫힌다
function openItemPopup(anchor, className, build) {
    closeItemPopup();
    const pop = el('div', 'ug-item-pop ' + className);
    build(pop);
    app.uiRoot.appendChild(pop);
    const r = uiRectOf(anchor), w = pop.offsetWidth, h = pop.offsetHeight;
    let x = r.x + r.width + 12;
    if (x + w > UI_WIDTH - 8) x = r.x - w - 12;
    pop.style.left = clamp(x, 8, UI_WIDTH - w - 8) + 'px';
    pop.style.top = clamp(r.y, 8, UI_HEIGHT - h - 8) + 'px';
    const entry = { node: pop, onDown: (e) => { if (!pop.contains(e.target)) closeItemPopup(); } };
    invUi.popup = entry;
    setTimeout(() => { if (invUi.popup === entry) app.uiRoot.addEventListener('pointerdown', entry.onDown, true); }, 0);   // 지금 누른 것으로 닫히지 않게
    return pop;
}
function closeItemPopup() {
    const p = invUi.popup;
    if (!p) return;
    invUi.popup = null;
    p.node.remove();
    app.uiRoot.removeEventListener('pointerdown', p.onDown, true);
}
// 소모품 메뉴: [사용] / 행동 슬롯에 등록 [1]~[7] (이미 등록된 칸은 강조) / [취소]
function showConsumableMenu(g, cell, id, rerender) {
    openItemPopup(cell, 'ug-item-menu', (pop) => {
        pop.appendChild(el('div', 'ug-item-menu-title', localName(CONSUMABLES[id])));
        const def = CONSUMABLES[id], noUse = def.useReason;   // 배터리·카드키: 직접 쓰지 않고 행동 슬롯에도 넣지 않는다 (18-1, 22-2)
        pop.appendChild(makeButton(t('inv.use'), () => {
            const r = useConsumable(g, id);
            applyInvResult(g, r, rerender);
        }, { primary: !noUse, className: 'ug-item-menu-btn', disabledReason: noUse ? t(noUse) : null }));
        if (!noUse) appendSlotAssign(g, pop, id, rerender);
        const index = Number(cell.dataset.key);
        pop.appendChild(makeButton(t('inv.discard'), () => confirmDiscard(g, index, rerender),
            { danger: !def.noDiscard, className: 'ug-item-menu-btn', disabledReason: def.noDiscard ? t('inv.cannotDiscard') : null }));   // 카드키는 버릴 수 없음 (U53)
        pop.appendChild(makeButton(t('common.cancel'), () => closeItemPopup(), { className: 'ug-item-menu-btn' }));
    });
}
// 행동 슬롯 등록 버튼 [1]~[7] (이미 등록된 칸은 강조). 소모품·도구 공용
function appendSlotAssign(g, pop, id, rerender) {
    pop.appendChild(el('div', 'ug-item-menu-caption', t('inv.assign')));
    const row = pop.appendChild(el('div', 'ug-item-menu-slots'));
    const slots = g.state.player.actionSlots;
    for (let i = 0; i < ACTION_SLOT_COUNT; i++) {
        const same = !!slots[i] && slots[i].type === 'item' && slots[i].id === id;
        row.appendChild(makeButton(String(i + 1), () => { setActionSlot(g.state, i, { type: 'item', id }); rerender(); },
            { className: 'ug-num ug-item-menu-slot', selected: same }));
    }
}
// 도구 (플래시) 메뉴 (18-1): 행동 슬롯 등록 [1]~[7] / [버리기] 회색 (팔거나 버릴 수 없음) / [취소]. 켜고 끄기는 행동 슬롯에서 (AGENTS.md)
function showToolMenu(g, cell, id, rerender) {
    openItemPopup(cell, 'ug-item-menu', (pop) => {
        pop.appendChild(el('div', 'ug-item-menu-title', localName(TOOLS[id])));
        appendSlotAssign(g, pop, id, rerender);
        pop.appendChild(makeButton(t('inv.discard'), () => {}, { className: 'ug-item-menu-btn', disabledReason: t('item.noSellDiscard') }));
        pop.appendChild(makeButton(t('common.cancel'), () => closeItemPopup(), { className: 'ug-item-menu-btn' }));
    });
}
// [버리기] → 확인 대화상자 (이름, 소모품은 개수를 별도 요소로) → 없앰 (16-7, U48)
function confirmDiscard(g, index, rerender) {
    const item = g.state.player.inventory[index];
    if (!item) return;
    closeItemPopup();
    let content = null;
    if (item.kind === 'consumable') {
        content = el('div', 'ug-dialog-slot');
        content.appendChild(el('div', 'ug-slot-info')).append(el('span', null, t('item.count') + ' '), el('span', 'ug-num', String(item.count)));
    }
    showDialog({
        message: t('inv.confirmDiscard', { name: itemDisplayName(item) }),
        content,
        buttons: [
            { label: t('inv.discard'), danger: true, onClick: () => applyInvResult(g, discardItemAt(g.state, index), rerender) },
            { label: t('common.cancel') },
        ],
    });
}
function showActionMenu(g, cell, index, rerender) {
    const s = g.state.player.actionSlots[index];
    const name = s.type === 'skill' ? localName(SKILL_BY_ID[s.id]) : localName(TOOLS[s.id] || CONSUMABLES[s.id]);
    openItemPopup(cell, 'ug-item-menu', (pop) => {
        pop.appendChild(el('div', 'ug-item-menu-title', name));
        pop.appendChild(makeButton(t('inv.unassign'), () => { setActionSlot(g.state, index, null); rerender(); }, { danger: true, className: 'ug-item-menu-btn' }));
        pop.appendChild(makeButton(t('common.cancel'), () => closeItemPopup(), { className: 'ug-item-menu-btn' }));
    });
}
// 상세 정보 팝업 (칸의 아이템, 행동 슬롯이면 그 소모품·스킬)
function showInvDetail(g, cell) {
    const ref = invRef(g, cell);
    if (!ref) return;
    const sp = g.state.player;
    let item = ref.item;
    if (ref.zone === 'action') {
        if (ref.action.type === 'skill') {
            const def = SKILL_BY_ID[ref.action.id];
            openItemPopup(cell, 'ug-item-detail', (pop) => {
                pop.appendChild(el('div', 'ug-item-pop-name', localName(def)));
                const info = pop.appendChild(el('div', 'ug-item-pop-info'));
                infoPair(info, 'hud.level', String(sp.skills[def.id] || 0));
            });
            return;
        }
        item = TOOLS[ref.action.id] ? { kind: 'tool', id: ref.action.id } : { kind: 'consumable', id: ref.action.id, count: countConsumable(sp, ref.action.id) };
    }
    openItemPopup(cell, 'ug-item-detail', (pop) => {
        buildItemDetail(pop, g, item);
        if (ref.zone === 'inv' && item.kind === 'equip') {   // 인벤토리의 장비는 상세 정보에서 버린다 (클릭은 장착, 16-7)
            const rerender = () => { const body = cell.closest('.ug-sysmenu-body'); if (body) { clearTooltips(); body.innerHTML = ''; renderInventoryTab(g, body); } };
            pop.appendChild(makeButton(t('inv.discard'), () => confirmDiscard(g, ref.index, rerender), { danger: true, className: 'ug-item-pop-discard' }));
        }
    });
}
// "라벨 숫자" 한 쌍 (숫자는 별도 요소 + .ug-num, 4.5)
function infoPair(parent, labelKey, value) {
    const s = parent.appendChild(el('span', null, t(labelKey)));
    s.appendChild(el('span', 'ug-num', value));
    return s;
}
function detailLine(parent, label, value, cls) {
    const row = parent.appendChild(el('div', 'ug-item-pop-line' + (cls ? ' ' + cls : '')));
    row.append(el('span', null, label), el('span', 'ug-num', value));
    return row;
}
function fmtNum1(v) { return Number.isInteger(v) ? String(v) : v.toFixed(1); }
// 부가 옵션·각인 → [라벨, 값] (값은 숫자 글꼴)
function affixLabel(a) {
    if (a.id === 'stat') return t('stat.' + a.sub);
    if (a.id === 'res1' || a.id === 'elemDmg') return t('affix.' + a.id, { el: t('res.' + a.sub) });
    return t('affix.' + a.id);
}
function affixValueText(a) {
    const v = fmtNum1(a.value);
    if (a.id === 'stat') return '+' + v;
    if (a.id === 'cdrPct') return '−' + v + '%';
    if (a.id === 'elemDmg' || a.id === 'lifeSteal') return v + '%';
    return '+' + v + '%';
}
// 장비 기본 수치 줄 [라벨, 값]: 공격력·마력·방어력 (iLv 보정 후, 정수 표시), 무기 종류 특성, 고정 % 값
function equipBaseLines(item) {
    const base = EQUIP_BASES[item.baseId], s = equipStats(item), lines = [];
    if (base.slot === 'weapon') {
        const w = WEAPON_TYPES[base.weaponType];
        lines.push([t('item.atk'), fmtInt(s.weaponAtk)]);
        if (s.magicPower > 0) lines.push([t('item.magic'), fmtInt(s.magicPower)]);
        lines.push([t('item.interval'), w.interval.toFixed(2) + t('unit.sec')]);
        if (w.melee) lines.push([t('item.reach'), `${w.range}m / ${w.arcDeg}°`]);
        else lines.push([t('item.boltRange'), w.range + 'm']);
        if (w.pierce > 0) lines.push([t('item.pierceTargets'), String(w.pierce + 1)]);
        lines.push([t('item.hands'), t('item.hands.' + base.hands)]);
    } else {
        if (s.magicPower > 0) lines.push([t('item.magic'), fmtInt(s.magicPower)]);
        if (s.defFlat > 0) lines.push([t('item.def'), fmtInt(s.defFlat)]);
    }
    if (base.critChance) lines.push([t('item.critChance'), '+' + base.critChance + '%']);
    if (base.mpPct) lines.push([t('item.maxMp'), '+' + base.mpPct + '%']);
    if (base.blockChance) lines.push([t('item.block'), base.blockChance + '%']);
    if (base.moveSpeedPct) lines.push([t('item.moveSpeed'), '+' + base.moveSpeedPct + '%']);
    if (base.staminaRegenPct) lines.push([t('item.staminaRegen'), '+' + base.staminaRegenPct + '%']);
    return lines;
}
function buildItemDetail(pop, g, item) {
    const sp = g.state.player, priceRow = (labelKey, n) => {
        const row = pop.appendChild(el('div', 'ug-item-pop-price'));
        row.append(el('span', null, t(labelKey)), el('span', 'ug-num', String(n)), el('span', null, 'G'));
    };
    const name = pop.appendChild(el('div', 'ug-item-pop-name', itemDisplayName(item)));
    if (item.kind === 'tool') {   // 플래시 (18-1): 설명·에너지 (별도 요소)·팔거나 버릴 수 없음
        name.style.color = '#f3e8cc';
        pop.appendChild(el('div', 'ug-item-pop-sub', `${t('item.ericOnly')} · ${t('itemCat.tool')}`));
        pop.appendChild(el('div', 'ug-item-pop-desc', TOOL_DESC[item.id][currentLang === 'en' ? 1 : 0]));
        const lines = pop.appendChild(el('div', 'ug-item-pop-lines'));
        detailLine(lines, t('item.energy'), `${Math.ceil(sp.flashEnergy || 0)} / ${FLASH_ENERGY_MAX}`);
        pop.appendChild(el('div', 'ug-item-pop-note', t('item.noSellDiscard')));
        return;
    }
    if (item.kind === 'consumable') {
        const def = CONSUMABLES[item.id];
        name.style.color = '#f3e8cc';
        pop.appendChild(el('div', 'ug-item-pop-sub', def.tier > 0 ? `${t('consTier.' + def.tier)} · ${t('itemCat.' + def.category)}` : `${t('item.ericOnly')} · ${t('itemCat.' + def.category)}`));
        pop.appendChild(el('div', 'ug-item-pop-desc', CONSUMABLE_DESC[item.id][currentLang === 'en' ? 1 : 0]));
        const lines = pop.appendChild(el('div', 'ug-item-pop-lines'));
        if (def.category === 'throw') detailLine(lines, t('item.throwBase'), String(throwBaseDamage(sp.level)));
        detailLine(lines, t('item.count'), String(item.count));
        if (!def.hero) priceRow('item.sellEach', consumableSellPrice(item.id, g.state.floor));   // 에릭 전용 (배터리 등) 은 팔 곳이 없다
        if (def.noDiscard) pop.appendChild(el('div', 'ug-item-pop-note', t('item.noSellDiscard')));   // 카드키 (U53)
        return;
    }
    const base = EQUIP_BASES[item.baseId];
    name.style.color = RARITIES[item.rarity].color;
    const sub = [base.tier === 0 ? t('item.starter') : localName(RARITIES[item.rarity]), t('itemType.' + itemTypeKey(base))];
    if (item.rarity === 'rare') sub.push(localName(base));   // 희귀는 고유 이름이라 기본 아이템 이름도
    pop.appendChild(el('div', 'ug-item-pop-sub', sub.join(' · ')));
    if (base.tier > 0) {
        const info = pop.appendChild(el('div', 'ug-item-pop-info'));
        infoPair(info, 'item.tier', TIER_MARKS[base.tier]);
        if (base.reqLv > sp.level) infoPair(info, 'item.reqLv', String(base.reqLv)).classList.add('is-bad');
        else infoPair(info, 'item.reqLv', String(base.reqLv));
        infoPair(info, 'item.iLv', String(item.iLv));
    }
    const lines = pop.appendChild(el('div', 'ug-item-pop-lines'));
    for (const [label, value] of equipBaseLines(item)) detailLine(lines, label, value);
    if (item.engraving) {
        pop.appendChild(el('div', 'ug-item-pop-caption', t('item.engraving')));
        detailLine(pop, affixLabel(item.engraving), affixValueText(item.engraving), 'is-engraving');
    }
    if (item.affixes.length > 0) {
        const box = pop.appendChild(el('div', 'ug-item-pop-lines'));
        for (const a of item.affixes) detailLine(box, affixLabel(a), affixValueText(a), 'is-affix');
    }
    priceRow('item.sell', equipSellPrice(item));
}

// --- 스킬 탭 (13단계, AGENTS.md "시스템 메뉴 > 스킬"). 기본 공격 (0, 0) 을 가운데로 45개 노드를 격자에 놓는다.
// 왼쪽 보기 영역: 빈 곳 (또는 노드 위에서 6px 이상) 을 끌거나 방향키·휠로 스크롤 / 노드 클릭 = 선택 → 오른쪽 상세 패널
// (현재·다음 레벨 수치, [활성화]·[레벨 업], 액티브 스킬은 행동 슬롯 등록). 메뉴가 열린 동안 게임이 멈추므로 바뀔 때마다 다시 그리고,
// 스크롤 위치·선택한 스킬은 skillUi 에 남긴다 (탭을 새로 열면 기본 공격이 가운데)
const SKILL_NODE_GAP = 170, SKILL_NODE_SIZE = 96;          // 노드 간격·지름 (px)
const SKILL_TREE_SIZE = 10 * SKILL_NODE_GAP;               // 콘텐츠 한 변 1700px = 좌표 −4 ~ 4 + 가장자리 여백 한 칸씩
const SKILL_TREE_ORIGIN = SKILL_TREE_SIZE / 2;             // 기본 공격 (0, 0) 의 위치
const SKILL_VIEW_W = 1182, SKILL_VIEW_H = 862;             // 보기 영역 안쪽 크기 (CSS .ug-skill-view 1184×864 − 테두리. 아직 화면에 붙기 전에 쓴다)
const SKILL_SCROLL_STEP = 60, SKILL_DRAG_PX = 6;           // 방향키 한 번 이동량, 끌기로 보는 최소 이동 (px)
const SKILL_SCROLL_KEYS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
const SKILL_BRANCH_LABELS = [['magic', 0, 4.8], ['melee', 4, 0.8], ['defense', 0, -4.85], ['support', -4, 0.8]];   // 갈래 이름 위치 (트리 좌표)
const SVG_NS = 'http://www.w3.org/2000/svg';
const skillUi = { scrollX: 0, scrollY: 0, selected: 'BA', fresh: true, viewport: null, content: null, press: null };
// 트리 좌표 → 콘텐츠 안의 노드 중심 (px). 화면 y 는 트리 y 의 반대 (4.4, 8절 7번)
function skillNodePos(def) {
    return { x: SKILL_TREE_ORIGIN + def.x * SKILL_NODE_GAP, y: SKILL_TREE_ORIGIN - def.y * SKILL_NODE_GAP };
}
// 노드 상태: 'learned' 활성 (금색) / 'learnable' 활성화 가능 (청록 깜빡임) / 'locked' 잠김 (어둡게)
function skillNodeState(state, id) {
    if ((state.player.skills[id] || 0) > 0) return 'learned';
    return canLearnSkill(state, id).ok ? 'learnable' : 'locked';
}
// 연결선 상태: 'both' 양 끝 활성 (금색) / 'one' 한쪽만 (흰색 반투명) / 'none' (어두운 회색)
function skillLinkState(state, a, b) {
    const n = Number((state.player.skills[a] || 0) > 0) + Number((state.player.skills[b] || 0) > 0);
    return n === 2 ? 'both' : (n === 1 ? 'one' : 'none');
}
// 스크롤 범위 제한 (콘텐츠 밖이 보이지 않게)
function clampSkillScroll(x, y, viewW, viewH) {
    return { x: clamp(x, 0, Math.max(0, SKILL_TREE_SIZE - viewW)), y: clamp(y, 0, Math.max(0, SKILL_TREE_SIZE - viewH)) };
}
// 스킬 수치 표시: 소수 오차를 없앤다 (0.9 + 0.1 × 3 → 1.2, 정수는 정수)
function fmtSkillValue(v) { return String(Math.round(v * 100) / 100); }
// 설명문 → 조각 [{ text } | { key, value }]. {이름} 자리 = values 의 값 (숫자는 별도 요소 + .ug-num 으로 그린다, 4.5)
function skillDescParts(template, values) {
    return template.split(/\{(\w+)\}/).map((s, i) => (i % 2 === 0 ? { text: s } : { key: s, value: fmtSkillValue(values[s]) }))
        .filter((part) => part.key || part.text);
}
function renderSkillTab(g, body) {
    const st = g.state;
    const rerender = () => { clearTooltips(); body.innerHTML = ''; renderSkillTab(g, body); };
    const root = el('div', 'ug-skill');
    root.appendChild(skillTabHead(st.player));
    const viewport = root.appendChild(el('div', 'ug-skill-view'));
    const content = viewport.appendChild(el('div', 'ug-skill-tree'));
    content.appendChild(skillTreeLinks(st));
    for (const [branch, x, y] of SKILL_BRANCH_LABELS) {
        const p = skillNodePos({ x, y }), label = content.appendChild(el('div', 'ug-skill-branch is-' + branch, t('skill.branch.' + branch)));
        label.style.left = p.x + 'px';
        label.style.top = (p.y - 14) + 'px';
    }
    for (const def of SKILLS) content.appendChild(skillTreeNode(st, def));
    if (!Object.hasOwn(SKILL_BY_ID, skillUi.selected)) skillUi.selected = 'BA';
    root.appendChild(skillDetailPanel(g, SKILL_BY_ID[skillUi.selected], rerender));
    body.appendChild(root);
    skillUi.viewport = viewport;
    skillUi.content = content;
    if (skillUi.fresh) {   // 처음 열 때 기본 공격이 가운데 (13-4)
        skillUi.fresh = false;
        skillUi.scrollX = SKILL_TREE_ORIGIN - (viewport.clientWidth || SKILL_VIEW_W) / 2;
        skillUi.scrollY = SKILL_TREE_ORIGIN - (viewport.clientHeight || SKILL_VIEW_H) / 2;
    }
    setSkillScroll(skillUi.scrollX, skillUi.scrollY);
    attachSkillTreePointer(viewport, rerender);
}
// 위 줄: 남은 스킬 포인트 (13-7, 숫자는 별도 요소) · 범례 (상태 색, 액티브 ○ / 패시브 □) · 조작 안내
function skillTabHead(sp) {
    const head = el('div', 'ug-skill-head');
    head.appendChild(el('div', 'ug-status-point' + (sp.skillPoints > 0 ? ' is-available' : '')))
        .append(el('span', 'ug-status-point-label', t('skill.points')), el('span', 'ug-num ug-status-point-num', String(sp.skillPoints)));
    const legend = head.appendChild(el('div', 'ug-skill-legend'));
    for (const s of ['learned', 'learnable', 'locked']) legend.appendChild(el('span', 'ug-skill-legend-item')).append(el('span', 'ug-skill-legend-mark is-' + s), t('skill.legend.' + s));
    for (const s of ['active', 'passive']) legend.appendChild(el('span', 'ug-skill-legend-item')).append(el('span', 'ug-skill-legend-shape is-' + s), t('skill.type.' + s));
    head.appendChild(el('div', 'ug-skill-hint', t('skill.hint')));
    return head;
}
// 연결선 48개 (13-2): <svg> 의 <line>, 색은 양 끝의 활성 여부
function skillTreeLinks(state) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'ug-skill-links');
    svg.setAttribute('width', String(SKILL_TREE_SIZE));
    svg.setAttribute('height', String(SKILL_TREE_SIZE));
    for (const [a, b] of SKILL_LINKS) {
        const pa = skillNodePos(SKILL_BY_ID[a]), pb = skillNodePos(SKILL_BY_ID[b]), line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', String(pa.x));
        line.setAttribute('y1', String(pa.y));
        line.setAttribute('x2', String(pb.x));
        line.setAttribute('y2', String(pb.y));
        line.setAttribute('class', 'ug-skill-link is-' + skillLinkState(state, a, b));
        svg.appendChild(line);
    }
    return svg;
}
// 노드 (13-3): 원 (액티브) / 둥근 사각형 (패시브) 안에 코드 + "Lv a/b", 아래에 이름. 배경 = 갈래 색, 테두리 = 상태.
// 활성 + 포인트가 남아 레벨 업할 수 있으면 오른쪽 위에 "+" 표시
function skillTreeNode(state, def) {
    const p = skillNodePos(def), lv = state.player.skills[def.id] || 0, status = skillNodeState(state, def.id);
    const item = el('div', `ug-skill-item is-${def.branch} is-${def.type} is-${status}`);
    item.dataset.skill = def.id;
    if (def.id === skillUi.selected) item.classList.add('is-selected');
    if (status === 'learned' && lv < def.maxLv && state.player.skillPoints > 0) item.classList.add('is-upgradable');
    item.style.left = (p.x - 80) + 'px';
    item.style.top = (p.y - SKILL_NODE_SIZE / 2) + 'px';
    const node = item.appendChild(el('div', 'ug-skill-node'));
    node.appendChild(el('span', 'ug-num ug-skill-code', def.id));
    node.appendChild(el('span', 'ug-skill-lv')).append(el('span', 'ug-skill-lv-label', t('hud.level')), el('span', 'ug-num ug-skill-lv-num', `${lv}/${def.maxLv}`));
    item.appendChild(el('div', 'ug-skill-name', localName(def)));
    return item;
}
// 오른쪽 상세 패널 (13-5): 이름·코드·갈래·종류, 레벨, 현재·다음 레벨 블록, [활성화]/[레벨 업], 행동 슬롯 등록 (액티브만)
function skillDetailPanel(g, def, rerender) {
    const sp = g.state.player, lv = sp.skills[def.id] || 0;
    const panel = el('div', 'ug-skill-panel is-' + def.branch);
    panel.appendChild(el('div', 'ug-skill-panel-title')).append(el('span', 'ug-skill-panel-name', localName(def)), el('span', 'ug-num ug-skill-panel-code', def.id));
    panel.appendChild(el('div', 'ug-skill-panel-sub', `${t('skill.branch.' + def.branch)} · ${t('skill.type.' + def.type)}`));
    panel.appendChild(el('div', 'ug-skill-panel-lv')).append(el('span', 'ug-skill-panel-lv-label', t('skill.level')), el('span', 'ug-num ug-skill-panel-lv-num', `${lv} / ${def.maxLv}`));
    if (lv > 0) panel.appendChild(skillLevelBlock(g, def, lv, false, 0));
    else panel.appendChild(el('div', 'ug-skill-block')).appendChild(el('div', 'ug-skill-note', t('skill.notLearnedYet')));
    if (lv < def.maxLv) panel.appendChild(skillLevelBlock(g, def, lv + 1, true, lv));
    else panel.appendChild(el('div', 'ug-skill-note', t('skill.maxed')));
    const actions = panel.appendChild(el('div', 'ug-skill-actions'));
    const can = canLearnSkill(g.state, def.id);
    actions.appendChild(makeButton(t(lv > 0 ? 'skill.levelUp' : 'skill.learn'), () => {
        const r = learnSkill(g.state, def.id);
        if (!r.ok) { showToast(t(r.reason)); return; }
        g.derived = calcDerivedStats(g.state, g);   // 패시브 (최대 HP 등) 가 바로 반영되도록
        clampVitals(g);
        rerender();
    }, { primary: true, className: 'ug-skill-learn', disabledReason: can.ok ? null : t(can.reason) }));
    if (def.type === 'passive') actions.appendChild(el('div', 'ug-skill-note', t('skill.passiveNote')));
    else actions.appendChild(skillAssignRow(g, def, lv, rerender));
    return panel;
}
// 레벨 블록: 제목 ("현재 레벨 Lv 3" / "다음 레벨 Lv 4"), 소모·재사용 대기 (액티브), 설명 (수치는 별도 요소).
// compareLv > 0 (다음 레벨 블록의 현재 레벨) 이면 그 레벨과 달라진 수치를 강조한다
function skillLevelBlock(g, def, lv, next, compareLv) {
    const block = el('div', 'ug-skill-block' + (next ? ' is-next' : ''));
    block.appendChild(el('div', 'ug-skill-block-caption'))
        .append(el('span', null, t(next ? 'skill.next' : 'skill.current')), el('span', 'ug-skill-block-lv', t('hud.level')), el('span', 'ug-num', String(lv)));
    const num = (parent, value, before) => parent.appendChild(el('span', 'ug-num' + (before !== undefined && before !== value ? ' is-up' : ''), value));
    if (def.type === 'active') {
        const info = block.appendChild(el('div', 'ug-skill-block-info'));
        const cost = info.appendChild(el('span'));
        if (def.resource) {
            cost.append(`${t('skill.cost')} ${t('hud.' + def.resource)}`);
            num(cost, String(costAtLevel(def.cost, lv)), compareLv > 0 ? String(costAtLevel(def.cost, compareLv)) : undefined);
        } else cost.append(t('skill.noCost'));
        const cd = info.appendChild(el('span'));
        if (def.cooldown === null) {   // 기본 공격: 재사용 대기 = 실제 공격 간격
            cd.append(t('skill.cooldownAttack'));
            num(cd, g.derived.attackInterval.toFixed(2));
        } else {
            cd.append(t('skill.cooldown'));
            num(cd, fmtSkillValue(skillCooldown(def, lv)), compareLv > 0 ? fmtSkillValue(skillCooldown(def, compareLv)) : undefined);
        }
        cd.append(t('unit.sec'));
    }
    const desc = block.appendChild(el('div', 'ug-skill-desc'));
    const before = compareLv > 0 ? def.values(compareLv) : null;
    for (const part of skillDescParts(currentLang === 'en' ? def.descEn : def.descKo, def.values(lv))) {
        if (part.key) num(desc, part.value, before ? fmtSkillValue(before[part.key]) : undefined).classList.add('ug-skill-val');
        else desc.append(part.text);
    }
    return block;
}
// 행동 슬롯 등록 (13-5, AGENTS.md "이 화면에서 행동 슬롯에 스킬을 장착"): [1]~[7] 에 지금 든 것 (스킬 코드·소모품 아이콘) 을 작게 보여주고,
// 누르면 그 칸에 등록 (같은 스킬이 있던 칸은 비움, setActionSlot), 이 스킬이 든 칸을 다시 누르면 해제. 활성화 전에는 회색 + 이유 툴팁
function skillAssignRow(g, def, lv, rerender) {
    const wrap = el('div', 'ug-skill-assign');
    wrap.appendChild(el('div', 'ug-skill-assign-caption', t('skill.assign')));
    const row = wrap.appendChild(el('div', 'ug-skill-assign-row'));
    const slots = g.state.player.actionSlots;
    for (let i = 0; i < ACTION_SLOT_COUNT; i++) {
        const s = slots[i], same = !!s && s.type === 'skill' && s.id === def.id;
        const b = row.appendChild(makeButton('', () => {
            setActionSlot(g.state, i, same ? null : { type: 'skill', id: def.id });
            rerender();
        }, { className: 'ug-skill-slot', selected: same, disabledReason: lv > 0 ? null : t('skill.notLearned') }));
        b.appendChild(el('span', 'ug-num ug-skill-slot-key', String(i + 1)));
        if (s && s.type === 'skill' && Object.hasOwn(SKILL_BY_ID, s.id)) {
            b.appendChild(el('span', 'ug-num ug-skill-slot-code is-' + SKILL_BY_ID[s.id].branch, s.id));
        } else if (s && s.type === 'item' && CONSUMABLES[s.id]) {
            const img = b.appendChild(el('img', 'ug-skill-slot-icon'));
            img.src = itemIconUrl({ kind: 'consumable', id: s.id });
            img.alt = '';
            img.draggable = false;
        }
    }
    return wrap;
}
// 보기 영역 누르기·끌기 (13-4): 6px 이상 움직이면 스크롤, 아니면 누른 노드를 선택. 휠 = 위아래 (Shift + 휠 = 좌우)
function attachSkillTreePointer(viewport, rerender) {
    viewport.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || skillUi.press) return;
        const p = uiPointOf(e), item = e.target.closest ? e.target.closest('[data-skill]') : null;
        skillUi.press = { id: e.pointerId, x: p.x, y: p.y, sx: skillUi.scrollX, sy: skillUi.scrollY, skill: item ? item.dataset.skill : null, drag: false };
        try { viewport.setPointerCapture(e.pointerId); } catch { /* 무시 */ }
    });
    viewport.addEventListener('pointermove', (e) => {
        const pr = skillUi.press;
        if (!pr || e.pointerId !== pr.id) return;
        const p = uiPointOf(e), dx = p.x - pr.x, dy = p.y - pr.y;
        if (!pr.drag && Math.hypot(dx, dy) >= SKILL_DRAG_PX) {
            pr.drag = true;
            viewport.classList.add('is-dragging');
        }
        if (pr.drag) setSkillScroll(pr.sx - dx, pr.sy - dy);
    });
    const end = (e, cancel) => {
        const pr = skillUi.press;
        if (!pr || e.pointerId !== pr.id) return;
        skillUi.press = null;
        viewport.classList.remove('is-dragging');
        if (!cancel && !pr.drag && pr.skill) {
            skillUi.selected = pr.skill;
            rerender();
        }
    };
    viewport.addEventListener('pointerup', (e) => end(e, false));
    viewport.addEventListener('pointercancel', (e) => end(e, true));
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const step = Math.sign(e.deltaY || e.deltaX) * SKILL_SCROLL_STEP * 1.5;
        if (e.shiftKey || (e.deltaY === 0 && e.deltaX !== 0)) setSkillScroll(skillUi.scrollX + step, skillUi.scrollY);
        else setSkillScroll(skillUi.scrollX, skillUi.scrollY + step);
    }, { passive: false });
}
function setSkillScroll(x, y) {
    const v = skillUi.viewport;
    if (!v || !skillUi.content) return;
    const s = clampSkillScroll(x, y, v.clientWidth || SKILL_VIEW_W, v.clientHeight || SKILL_VIEW_H);
    skillUi.scrollX = s.x;
    skillUi.scrollY = s.y;
    skillUi.content.style.transform = `translate(${-s.x}px, ${-s.y}px)`;
}
// 스킬 탭이 열려 있을 때 방향키 (←↑→↓) 로 SKILL_SCROLL_STEP 씩 (13-4). 반환: 처리했는가 (누르고 있으면 반복)
function scrollSkillTreeByKey(code) {
    if (!Object.hasOwn(SKILL_SCROLL_KEYS, code) || !skillUi.content || !skillUi.content.isConnected) return false;
    const [dx, dy] = SKILL_SCROLL_KEYS[code];
    setSkillScroll(skillUi.scrollX + dx * SKILL_SCROLL_STEP, skillUi.scrollY + dy * SKILL_SCROLL_STEP);
    return true;
}
// 탭을 새로 열거나 메뉴를 닫을 때: 다음에 그리면 기본 공격을 선택하고 가운데에
function resetSkillTreeUi() {
    skillUi.fresh = true;
    skillUi.selected = 'BA';
    skillUi.press = null;
    skillUi.viewport = null;
    skillUi.content = null;
}

// --- 방랑 상인 상점 (15-3, AGENTS.md "방랑 상인 판매 규칙"). 게임 화면 위에 겹치고 (시스템 메뉴와 같은 층), 열려 있는 동안 게임은 일시정지 (U6).
// 위: 상인 이름·인사말 (무작위 3종)·소지 골드·[닫기] (ESC 도) / [구매] [판매] / 구매 = 소모품 목록 + 장비 목록 (품절 표시),
// 판매 = 인벤토리 40칸 (칸 아래 1개 판매가). 클릭 = 수량·확인 팝업, 우클릭·길게 누르기 = 상세 정보 (인벤토리와 같은 팝업)
const SHOP_GREETINGS = 3;
const shopUi = { tab: 'buy', greeting: 0 };
function createShopUi(g, onClose) {
    const root = el('div', 'ug-fill ug-shop');
    const panel = root.appendChild(el('div', 'ug-shop-panel'));
    const stock = merchantStockOf(g.state);
    shopUi.tab = 'buy';
    shopUi.greeting = Math.floor(Math.random() * SHOP_GREETINGS);
    const render = () => { closeItemPopup(); clearTooltips(); panel.innerHTML = ''; renderShop(g, panel, stock, render, onClose); };
    render();
    return { root, stock, rerender: render, destroy() { closeItemPopup(); clearTooltips(); root.remove(); } };
}
function renderShop(g, panel, stock, rerender, onClose) {
    const head = panel.appendChild(el('div', 'ug-shop-head'));
    head.appendChild(el('div', 'ug-shop-who')).append(el('div', 'ug-shop-name', t('shop.merchant')), el('div', 'ug-shop-greeting', t('shop.greeting' + shopUi.greeting)));
    head.appendChild(el('div', 'ug-shop-gold')).append(el('span', 'ug-shop-gold-label', t('hud.gold')), el('span', 'ug-num ug-shop-gold-num', String(g.state.player.gold)), el('span', 'ug-shop-gold-unit', 'G'));
    head.appendChild(makeButton(t('menu.close'), onClose, { className: 'ug-shop-close' }));
    const tabs = panel.appendChild(el('div', 'ug-shop-tabs'));
    for (const id of ['buy', 'sell']) {
        tabs.appendChild(makeButton(t('shop.tab.' + id), () => { shopUi.tab = id; rerender(); }, { className: 'ug-shop-tab', selected: shopUi.tab === id })).dataset.tab = id;
    }
    tabs.appendChild(el('div', 'ug-shop-hint', t(shopUi.tab === 'buy' ? 'shop.hintBuy' : 'shop.hintSell')));
    const body = panel.appendChild(el('div', 'ug-shop-body'));
    if (shopUi.tab === 'buy') renderShopBuy(g, body, stock, rerender);
    else renderShopSell(g, body, rerender);
}
// 구매: 왼쪽 소모품 (재고 무제한), 오른쪽 장비 (각 1개, 산 것은 품절)
function renderShopBuy(g, body, stock, rerender) {
    const st = g.state, sp = st.player;
    const left = body.appendChild(el('div', 'ug-shop-col is-cons'));
    left.appendChild(el('div', 'ug-inv-title', t('shop.consumables')));
    for (const id of stock.consumables) {
        const price = consumablePrice(id, st.floor), row = left.appendChild(shopRow(g, { kind: 'consumable', id, count: 1 }, price, false));
        row.dataset.buy = id;
        attachShopPointer(row, () => showBuyConsumable(g, row, id, rerender),
            () => showShopDetail(g, row, { kind: 'consumable', id, count: countConsumable(sp, id) }, price));
    }
    const right = body.appendChild(el('div', 'ug-shop-col is-equip'));
    right.appendChild(el('div', 'ug-inv-title', t('shop.equipment')));
    stock.equips.forEach((item, i) => {
        const sold = st.world.merchantSoldOut.includes(i), row = right.appendChild(shopRow(g, item, equipPrice(item), sold));
        row.dataset.equip = String(i);
        attachShopPointer(row, () => { if (sold) showToast(t('shop.soldOut')); else showBuyEquipment(g, row, stock, i, rerender); },
            () => showShopDetail(g, row, item, sold ? null : equipPrice(item)));
    });
}
// 상품 한 줄: 아이콘 (등급 테두리·요구 레벨 미달 표시) · 이름 (등급 색) · 단계·분류 · 가격 (골드가 모자라면 붉게) 또는 품절
function shopRow(g, item, price, soldOut) {
    const row = el('div', 'ug-shop-row' + (soldOut ? ' is-soldout' : ''));
    const icon = row.appendChild(el('div', 'ug-shop-icon')).appendChild(itemNode(item, g.state.player.level));
    const count = icon.querySelector('.ug-item-count');
    if (count) count.remove();
    const info = row.appendChild(el('div', 'ug-shop-info'));
    info.appendChild(el('div', 'ug-shop-item-name', itemDisplayName(item))).style.color = item.kind === 'equip' ? RARITIES[item.rarity].color : '#f3e8cc';
    info.appendChild(el('div', 'ug-shop-item-sub', shopItemSub(item)));
    const p = row.appendChild(el('div', 'ug-shop-price'));
    if (soldOut) p.appendChild(el('span', 'ug-shop-soldout', t('shop.soldOutTag')));
    else {
        p.append(el('span', 'ug-num ug-shop-price-num', String(price)), el('span', 'ug-shop-price-unit', 'G'));
        if (price > g.state.player.gold) p.classList.add('is-short');
    }
    return row;
}
function shopItemSub(item) {
    if (item.kind === 'consumable') {
        const d = CONSUMABLES[item.id];
        return `${t('consTier.' + d.tier)} · ${t('itemCat.' + d.category)}`;
    }
    return `${localName(RARITIES[item.rarity])} · ${t('itemType.' + itemTypeKey(EQUIP_BASES[item.baseId]))}`;
}
// 클릭 (6px 안에서 떼기) / 우클릭·0.5초 누르기 = 상세 정보
function attachShopPointer(node, onClick, onDetail) {
    let timer = 0, down = false, long = false;
    node.addEventListener('pointerdown', (e) => {
        if (e.button === 2) { onDetail(); return; }
        if (e.button !== 0) return;
        down = true;
        long = false;
        timer = setTimeout(() => { if (down) { long = true; onDetail(); } }, INV_LONG_PRESS_MS);
    });
    node.addEventListener('pointerup', (e) => {
        if (e.button !== 0 || !down) return;
        down = false;
        clearTimeout(timer);
        if (!long) onClick();
    });
    node.addEventListener('pointerleave', () => { down = false; clearTimeout(timer); });
}
// 상세 정보: 인벤토리와 같은 내용 + 구매가 (판매 탭은 null)
function showShopDetail(g, anchor, item, buyPrice) {
    openItemPopup(anchor, 'ug-item-detail', (pop) => {
        buildItemDetail(pop, g, item);
        if (buyPrice === null) return;
        pop.appendChild(el('div', 'ug-item-pop-price')).append(el('span', null, t('shop.buyPrice')), el('span', 'ug-num', String(buyPrice)), el('span', null, 'G'));
    });
}
// 수량 버튼 글자: "[앞말] n개 · 합계 G" (숫자는 별도 요소 + .ug-num, 4.5)
function shopQtyButton(pop, prefixKey, n, total, onClick, reasonKey) {
    const b = pop.appendChild(makeButton('', onClick, { className: 'ug-item-menu-btn ug-shop-qty', primary: !reasonKey, disabledReason: reasonKey ? t(reasonKey) : null }));
    b.append(el('span', null, t(prefixKey)), el('span', 'ug-num', String(n)), el('span', null, t('shop.unit')), el('span', 'ug-shop-qty-sep', '·'),
        el('span', 'ug-num', String(total)), el('span', null, 'G'));
    return b;
}
function showBuyConsumable(g, anchor, id, rerender) {
    const st = g.state, price = consumablePrice(id, st.floor), max = maxBuyCount(st, id);
    const buy = (n) => {
        const r = buyConsumable(st, id, n);
        if (!r.ok) { showToast(t(r.reason)); return; }
        showToast(t('shop.bought', { name: localName(CONSUMABLES[id]) }));
        rerender();
    };
    openItemPopup(anchor, 'ug-item-menu ug-shop-menu', (pop) => {
        pop.appendChild(el('div', 'ug-item-menu-title', localName(CONSUMABLES[id])));
        for (const [n, key] of [[1, 'shop.qty'], [5, 'shop.qty'], [Math.max(1, max), 'shop.qtyMax']]) {
            const reason = n > max ? (st.player.gold < price * n ? 'shop.noGold' : 'inv.full') : null;
            shopQtyButton(pop, key, n, price * n, () => buy(n), reason);
        }
        pop.appendChild(makeButton(t('common.cancel'), () => closeItemPopup(), { className: 'ug-item-menu-btn' }));
    });
}
function showBuyEquipment(g, anchor, stock, index, rerender) {
    const st = g.state, item = stock.equips[index], price = equipPrice(item);
    const reason = st.player.gold < price ? 'shop.noGold' : (st.player.inventory.includes(null) ? null : 'inv.full');
    openItemPopup(anchor, 'ug-item-menu ug-shop-menu', (pop) => {
        pop.appendChild(el('div', 'ug-item-menu-title', itemDisplayName(item))).style.color = RARITIES[item.rarity].color;
        const b = pop.appendChild(makeButton('', () => {
            const r = buyEquipment(st, stock, index);
            if (!r.ok) { showToast(t(r.reason)); return; }
            showToast(t('shop.bought', { name: itemDisplayName(item) }));
            rerender();
        }, { className: 'ug-item-menu-btn ug-shop-qty', primary: !reason, disabledReason: reason ? t(reason) : null }));
        b.append(el('span', null, t('shop.buy')), el('span', 'ug-shop-qty-sep', '·'), el('span', 'ug-num', String(price)), el('span', null, 'G'));
        pop.appendChild(makeButton(t('common.cancel'), () => closeItemPopup(), { className: 'ug-item-menu-btn' }));
    });
}
// 판매: 인벤토리 40칸 (칸 아래 1개 판매가). 클릭 → 소모품 [1개] [5개] [모두] / 장비 [판매] (희귀는 확인 대화상자)
function renderShopSell(g, body, rerender) {
    const sp = g.state.player, wrap = body.appendChild(el('div', 'ug-shop-sell'));
    const used = sp.inventory.filter((it) => it !== null).length;
    wrap.appendChild(el('div', 'ug-inv-title')).append(el('span', null, t('inv.bag')), el('span', 'ug-num ug-inv-count', `${used} / ${INVENTORY_SIZE}`));
    const grid = wrap.appendChild(el('div', 'ug-shop-grid'));
    sp.inventory.forEach((it, i) => {
        const cell = grid.appendChild(el('div', 'ug-shop-cell')), box = cell.appendChild(el('div', 'ug-inv-cell'));
        box.dataset.sell = String(i);
        const lab = cell.appendChild(el('div', 'ug-shop-cell-price')), price = sellPriceOf(g.state, it);
        if (!it) return;
        box.appendChild(itemNode(it, sp.level));
        if (price !== null) lab.append(el('span', 'ug-num', String(price)), el('span', null, 'G'));
        attachShopPointer(box, () => showSellMenu(g, box, i, rerender), () => showShopDetail(g, box, it, null));
    });
    body.appendChild(el('div', 'ug-shop-sell-note', t('shop.sellNote')));
}
function showSellMenu(g, anchor, index, rerender) {
    const st = g.state, item = st.player.inventory[index], each = sellPriceOf(st, item);
    if (each === null) { showToast(t('shop.cannotSell')); return; }
    const name = itemDisplayName(item);
    const sell = (n) => {
        const r = sellItem(st, index, n);
        if (!r.ok) { showToast(t(r.reason)); return; }
        showToast(t('shop.sold', { name }));
        rerender();
    };
    openItemPopup(anchor, 'ug-item-menu ug-shop-menu', (pop) => {
        const title = pop.appendChild(el('div', 'ug-item-menu-title', name));
        if (item.kind === 'equip') {
            title.style.color = RARITIES[item.rarity].color;
            const b = pop.appendChild(makeButton('', () => (item.rarity === 'rare' ? confirmSellRare(g, index, each, () => sell(1)) : sell(1)), { className: 'ug-item-menu-btn ug-shop-qty', primary: true }));
            b.append(el('span', null, t('shop.sell')), el('span', 'ug-shop-qty-sep', '·'), el('span', 'ug-num', String(each)), el('span', null, 'G'));
        } else {
            const counts = [[1, 'shop.qty']];
            if (item.count > 5) counts.push([5, 'shop.qty']);
            if (item.count > 1) counts.push([item.count, 'shop.qtyAll']);
            for (const [n, key] of counts) shopQtyButton(pop, key, n, each * n, () => sell(n), null);
        }
        pop.appendChild(makeButton(t('common.cancel'), () => closeItemPopup(), { className: 'ug-item-menu-btn' }));
    });
}
// 희귀 장비를 팔 때는 한 번 더 확인 (15-3). 판매가는 별도 요소
function confirmSellRare(g, index, price, onYes) {
    const item = g.state.player.inventory[index];
    if (!item) return;
    closeItemPopup();
    const content = el('div', 'ug-dialog-slot');
    content.appendChild(el('div', 'ug-slot-info')).append(el('span', null, t('item.sell') + ' '), el('span', 'ug-num', String(price)), el('span', null, ' G'));
    showDialog({
        message: t('shop.confirmSellRare', { name: itemDisplayName(item) }),
        content,
        buttons: [{ label: t('shop.sell'), danger: true, onClick: onYes }, { label: t('common.cancel') }],
    });
}

// --- 시스템 탭 (6-4)
// [저장] 은 저장 가능 영역 (성소 구역·엘리베이터 내부, canSaveHere, U47) 안에서만 활성 (밖이면 클릭 시 이유 툴팁 4초), [메인 메뉴] 는 그 안이면 저장 후 바로, 밖이면 확인 후 저장 없이
function renderSystemTab(g, body) {
    const root = el('div', 'ug-sys');
    const info = el('div', 'ug-sys-info');
    const savedAt = el('div', 'ug-num ug-sys-value', formatDateTime(g.state.savedAt));
    info.append(el('div', 'ug-sys-label', t('system.slot')), el('div', 'ug-num ug-sys-value', String(g.state.slot + 1)),
        el('div', 'ug-sys-label', t('system.lastSaved')), savedAt);
    root.appendChild(info);
    const statusKey = g.inSanctuary ? 'system.inSanctuary' : (g.inElevator ? 'system.inElevator' : 'system.outSanctuary');
    root.appendChild(el('div', 'ug-sys-status ' + (canSaveHere(g) ? 'is-ok' : 'is-warn'), t(statusKey)));
    if (g.debug) root.appendChild(el('div', 'ug-sys-status is-warn', t('system.debugNoSave')));
    const buttons = el('div', 'ug-sys-buttons');
    buttons.appendChild(makeButton(t('common.save'), () => {
        if (g.debug) showToast(t('system.debugNoSave'));
        else if (saveGame(g)) {
            savedAt.textContent = formatDateTime(g.state.savedAt);
            showToast(t('system.saved'));
        } else showToast(t('system.saveFailed'));
    }, { primary: true, className: 'ug-sys-save', disabledReason: canSaveHere(g) ? null : t('system.saveOnlyInSanctuary') }));
    buttons.appendChild(makeButton(t('system.mainMenu'), () => leaveToMainMenu(g), { className: 'ug-sys-main' }));
    root.appendChild(buttons);
    body.appendChild(root);
}
// [메인 메뉴]: 저장 가능 영역 안 → 저장 후 확인 없이 메인 메뉴 (저장에 실패하면 나가지 않음, U22) / 밖 → 확인 후 저장 없이
function leaveToMainMenu(g) {
    if (!canSaveHere(g)) {
        showDialog({
            message: t('system.confirmLeave'),
            buttons: [
                { label: t('common.yes'), danger: true, onClick: () => showScreen('mainMenu') },
                { label: t('common.no') },
            ],
        });
        return;
    }
    if (g.debug) {
        showScreen('mainMenu');
        showToast(t('system.debugNoSave'));
    } else if (saveGame(g)) {
        showScreen('mainMenu');
        showToast(t('system.saved'));
    } else {
        showToast(t('system.saveFailed'));
    }
}

// ===== [21] 메인 (initialize·루프) =====
const app = {
    container: null, stage: null, stageScale: 1, canvas: null, uiRoot: null,
    renderer: null, scene: null, camera: null,
    settings: null, screen: null, screenName: '', lastTime: 0,
    fps: null,    // 디버그 &fps=1: { node, frames, since, updateMs, renderMs } (20-3)
    perf: null,   // 마지막으로 계산한 성능 값 { fps, updateMs, renderMs, calls, triangles, monsters } (자동 확인이 읽는다)
};
function showScreen(name, params) {
    const next = SCREENS[name];
    if (!next) throw new Error('없는 화면: ' + name);
    if (app.screen && app.screen.exit) app.screen.exit();
    closeAllDialogs();
    app.uiRoot.innerHTML = '';
    app.screen = next;
    app.screenName = name;
    next.enter(params || {});
}
function fitStage() {
    const w = window.innerWidth, h = window.innerHeight;
    const s = Math.min(w / UI_WIDTH, h / UI_HEIGHT);
    app.stageScale = s;
    const left = Math.floor((w - UI_WIDTH * s) / 2), top = Math.floor((h - UI_HEIGHT * s) / 2);
    app.stage.style.transform = `translate(${left}px, ${top}px) scale(${s})`;
}
function applyGraphicsQuality() {
    const [w, h] = RESOLUTIONS[app.settings.quality] || RESOLUTIONS.normal;
    app.renderer.setPixelRatio(1);
    app.renderer.setSize(w, h, false);   // false = CSS 크기는 그대로 (CSS 는 항상 1920x1080)
}
function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (now - app.lastTime) / 1000));
    app.lastTime = now;
    const fp = app.fps, t0 = fp ? performance.now() : 0;
    if (app.screen && app.screen.update) app.screen.update(dt);
    const t1 = fp ? performance.now() : 0;
    app.renderer.render(app.scene, app.camera);
    endInputFrame();
    if (fp) updateFpsOverlay(fp, now, t1 - t0, performance.now() - t1);
}
// 디버그 &fps=1 (20-3): 화면 오른쪽 위에 FPS·프레임당 갱신 시간·그리기 시간 (CPU 가 GL 명령을 보내는 시간, GPU 시간 아님)·draw call·삼각형·몬스터 수.
// 0.5초마다 평균을 낸다. 값은 app.perf 로도 남긴다
function updateFpsOverlay(fp, now, updateMs, renderMs) {
    fp.frames++;
    fp.updateMs += updateMs;
    fp.renderMs += renderMs;
    if (now - fp.since < 500) return;
    const info = app.renderer.info.render, g = SCREENS.game.game;
    app.perf = {
        fps: fp.frames * 1000 / (now - fp.since), updateMs: fp.updateMs / fp.frames, renderMs: fp.renderMs / fp.frames,
        calls: info.calls, triangles: info.triangles, monsters: g ? g.monsters.filter((m) => m.hp > 0).length : 0,
    };
    const p = app.perf;
    fp.node.textContent = `FPS ${p.fps.toFixed(1)}
갱신 ${p.updateMs.toFixed(2)}ms · 그리기 ${p.renderMs.toFixed(2)}ms
calls ${p.calls} · tris ${p.triangles}
몬스터 ${p.monsters}`;
    fp.frames = 0; fp.updateMs = 0; fp.renderMs = 0; fp.since = now;
}
// 키 입력: 대화상자가 열려 있으면 ESC 로 닫고, 아니면 현재 화면에 넘긴다
function onGlobalKeyDown(e) {
    if (dialogStack.length > 0) {
        if (e.code === 'Escape') {
            e.preventDefault();
            dialogStack[dialogStack.length - 1].onEscape();
        }
        return;
    }
    if (app.screen && app.screen.onKeyDown) app.screen.onKeyDown(e);
}
// "#debug=game&floor=3&seed=7" → { debug: 'game', floor: '3', seed: '7' }. debug 키가 없으면 null
function parseDebugHash(hash) {
    if (typeof hash !== 'string' || hash.length < 2) return null;
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    if (!params.has('debug')) return null;
    const out = {};
    for (const [k, v] of params) out[k] = v;
    return out;
}
// 디버그 해시 진입 함수 (PROGRESS.md 3.5). 저장 데이터는 건드리지 않는다
const DEBUG_ENTRIES = {
    title: () => showScreen('title'),
    menu: () => showScreen('mainMenu'),
    slots: () => showScreen('slots'),
    settings: () => showScreen('settings'),
    ascii: (opts) => showScreen('debugAscii', opts),
    view: (opts) => showScreen('debugView', opts),
    viewDispose: (opts) => showScreen('debugViewDispose', opts),
    game: (opts) => startDebugGame(opts),
};
// 디버그 게임 (#debug=game&floor=1&seed=3&theme=cave): 저장하지 않는 새 게임 상태로 바로 1인칭 진입 (5-11)
//   &noOverlay=1 "클릭하여 계속" 숨김, &fakeLock=1 포인터 락 없이 조작 가능 (헤드리스 자동 확인용)
//   &menu=map|status|inventory|skill|system 시스템 메뉴의 그 탭을 연 상태, &reveal=1 모든 칸을 방문한 것으로 취급 (6-9)
//   &at=stairsDown|stairsUp|portal|merchant|clearing|boss 그 장소 앞에서 시작 (7-5, debugViewpoint 와 같은 위치·시선)
//   &noMonsters=1 몬스터를 만들지 않음, &monster=br_mannequin 그 몬스터 1마리만 주인공 앞 8m 에 (&elite=1 정예) (8-16)
//   &level=20 레벨·스탯·포인트를 그 레벨 기준으로 (11-3), &skills=all 모든 스킬 Lv1 활성 (14단계 확인용)
//   &hero=eric 에릭으로 시작 (16-2), &items=1 인벤토리에 소모품 21종 (각 5개) + 단계·등급별 장비 12개 (12-6), &drops=1 주인공 앞 3m 에 바닥 아이템 6개 (12-5)
function startDebugGame(opts) {
    const { floor, seed } = debugFloorSeed(opts);
    const state = createNewGameState(0, isHeroId(opts.hero) ? opts.hero : DEFAULT_HERO);   // &hero=eric (16-2)
    state.floor = floor;
    state.dungeonSeed = seed;
    state.theme = THEME_VISUALS[opts.theme] ? opts.theme : 'backrooms';
    if (opts.skills === 'all') for (const s of SKILLS) if (!state.player.skills[s.id]) state.player.skills[s.id] = 1;
    if (opts.level) debugSetLevel(state, parseInt(opts.level, 10));
    if (opts.items) debugFillInventory(state, seed);
    let pitch;
    if (opts.at) {   // 저장 위치처럼 넣으면 playerStartPosition 이 그곳에서 시작시킨다 (던전은 시드로 같게 생성됨)
        const vp = debugViewpoint(generateDungeon(seed, floor, state.hero), opts.at);
        state.world.position = { x: vp.x, y: 0, z: vp.z, yaw: vp.yaw };
        pitch = vp.pitch;
    }
    showScreen('game', {
        state, arrival: 'newGame', debug: true, noOverlay: !!opts.noOverlay, fakeLock: !!opts.fakeLock,
        menu: opts.menu, reveal: !!opts.reveal, pitch,
        noMonsters: !!opts.noMonsters, monster: opts.monster || null, elite: !!opts.elite, debugOpts: opts, drops: !!opts.drops, shop: !!opts.shop,
    });
}
// 디버그 (&items=1): 소모품 21종 각 5개 + 장비 12개 (1~3단계 × 일반·마법·희귀, 반지·양손검·방패·지팡이). 같은 시드면 같은 장비
function debugFillInventory(state, seed) {
    const rng = createRng(hashInts(seed, 1212));
    for (const id of Object.keys(CONSUMABLES)) if (!CONSUMABLES[id].hero || CONSUMABLES[id].hero === state.hero) addItem(state, { kind: 'consumable', id, count: Math.min(5, stackMaxOf(id)) });   // 배터리 등은 에릭만, 카드키는 1개
    for (const [tier, rarity] of [[1, 'normal'], [1, 'magic'], [1, 'rare'], [2, 'normal'], [2, 'magic'], [2, 'rare'], [3, 'magic'], [3, 'rare']]) {
        addItem(state, generateEquipment(rng, Math.max(state.floor, TIER_INFO[tier].minFloor), { tier, rarity }));
    }
    for (const baseId of ['ring1', 'gsword1', 'shield1', 'staff1']) addItem(state, generateEquipment(rng, state.floor, { baseId, rarity: 'magic' }));
}
// 디버그 (&drops=1): 주인공 앞 3m 에 부채꼴로 골드·장비 (일반·마법·희귀)·소모품 2개 (던전 밖이면 건너뜀)
function spawnDebugDrops(g) {
    const p = g.player, f = g.state.floor;
    const items = [{ kind: 'gold', amount: 25 }, generateEquipment(Math.random, f, { rarity: 'normal' }), generateEquipment(Math.random, f, { rarity: 'magic' }),
        generateEquipment(Math.random, f, { rarity: 'rare' }), { kind: 'consumable', id: 'hp1', count: 1 }, { kind: 'consumable', id: 'throw1', count: 1 }];
    items.forEach((item, i) => {
        const a = p.yaw + (i - (items.length - 1) / 2) * 0.32, x = p.pos.x - Math.sin(a) * 3, z = p.pos.z - Math.cos(a) * 3;
        if (cellAtWorld(g.dungeon, x, z)) g.drops.push(makeDrop(item, x, z));
    });
}
// 디버그: 지금 레벨에서 level 까지 오른 것처럼 (AGENTS.md "레벨업 시": 힘·민첩성·지능 각 +1, 스탯·스킬 포인트 각 +1) 채우고
// HP·MP·스태미너를 가득 채운다. 경험치는 0, 포인트는 쓰지 않은 상태. 순수 함수 (자체 테스트 대상)
function debugSetLevel(state, level) {
    const p = state.player, L = clamp(Number.isFinite(level) ? Math.floor(level) : 1, p.level, 999), up = L - p.level;
    p.level = L;
    p.exp = 0;
    for (const k of STAT_IDS) p.baseStats[k] += up;
    p.statPoints += up;
    p.skillPoints += up;
    const d = calcDerivedStats(state);
    p.hp = d.maxHp;
    p.mp = d.maxMp;
    p.stamina = d.maxStamina;
    return state;
}
// 브라우저 자동 확인용: 현재 게임 런타임·입력 상태 (Playwright 에서 모듈을 import 해 읽는다)
function debugRuntime() {
    return { game: SCREENS.game.game, input, camera: app.camera, renderer: app.renderer, screenName: app.screenName, perf: app.perf, settings: app.settings };
}
// 디버그 전용 화면: 던전 글자 지도 (#debug=ascii&floor=5&seed=3). 3D 렌더링 전에 생성 결과를 눈으로 확인하는 용도
SCREENS.debugAscii = {
    enter(params) {
        hideMenuBackdrop();
        const floor = Math.max(1, parseInt(params.floor, 10) || 1);
        const seed = parseInt(params.seed, 10) || 1;
        const d = generateDungeon(seed, floor, params.hero);   // &hero=eric (17-1)
        const text = dungeonToAscii(d);
        const lines = text.split('\n');
        const cols = Math.max(...lines.map((l) => l.length));
        // 화면 (1880×1000) 에 다 들어가는 글자 크기. 고정폭 글자 폭 ≈ 0.6em, 줄 높이 = 1em
        const fontSize = Math.max(4, Math.min(20, Math.floor(Math.min(1880 / (cols * 0.6), 1000 / lines.length))));
        const root = el('div', 'ug-fill ug-debug-ascii');
        root.appendChild(el('div', 'ug-debug-ascii-info',
            `hero ${d.hero} · floor ${floor} · seed ${seed} · cells ${d.cells.size}/${d.targetCount} · attempt ${d.attempt} · bossPieceId ${d.bossPieceId}`));
        const pre = el('pre', 'ug-debug-ascii-map', text);
        pre.style.fontSize = fontSize + 'px';
        root.appendChild(pre);
        app.uiRoot.appendChild(root);
        console.log(`[debug ascii] floor=${floor} seed=${seed}\n${text}`);
    },
    exit() { },
    update() { },
};
// 디버그 해시의 floor / seed 값
function debugFloorSeed(params) {
    return { floor: Math.max(1, parseInt(params.floor, 10) || 1), seed: parseInt(params.seed, 10) || 1 };
}
// 던전 전체가 화면에 들어오도록 위에서 내려다보는 카메라 (북쪽이 화면 위). 반환: 던전 중심의 눈 위치
function debugTopCamera(d) {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const c of d.cells.values()) {
        minX = Math.min(minX, c.gx * CELL_SIZE); maxX = Math.max(maxX, (c.gx + 1) * CELL_SIZE);
        minZ = Math.min(minZ, c.gz * CELL_SIZE); maxZ = Math.max(maxZ, (c.gz + 1) * CELL_SIZE);
    }
    const cam = app.camera, cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
    const tanHalf = Math.tan(cam.fov * Math.PI / 360);
    const h = Math.max((maxZ - minZ) / 2 / tanHalf, (maxX - minX) / 2 / (tanHalf * cam.aspect)) * 1.06 + CELL_HEIGHT;
    cam.up.set(0, 0, -1);   // 똑바로 내려다볼 때 북쪽 (−Z) 이 화면 위
    cam.position.set(cx, h, cz);
    cam.lookAt(cx, 0, cz);
    cam.far = h + 500;   // void 의 별·성운 구 (반지름 330~400m, 눈 위치 중심) 까지 보이도록
    cam.updateProjectionMatrix();
    return new THREE.Vector3(cx, 1.7, cz);
}
// 1인칭 디버그 시점. at = sanctuary (기본: 새 게임 시작 위치) | merchant | portal | stairsDown | stairsUp | clearing | boss
function debugViewpoint(d, at) {
    const look = (from, to, pitch) => ({ x: from.x, z: from.z, yaw: Math.atan2(-(to.x - from.x), -(to.z - from.z)), pitch });
    const find = (type, pred) => d.pieces.find((p) => p.type === type && (!pred || pred(p)));
    if (at === 'merchant') {   // 카운터 앞 (칸 중심에서 입구 쪽 2.4m — 상인까지 3.6m 라 "클릭: 거래하기" 범위 안) 에서 상인을 본다
        const L = merchantLayout(d, find('merchant')), [dx, dz] = DIR_DELTA[L.dir];
        return look({ x: L.x + dx * 2.4, z: L.z + dz * 2.4 }, L, -0.12);
    }
    if (at === 'portal') return look(getSpawn(d, 'portal'), cellCenter(d.cells.get(find('portal').cells[0])), 0);
    if (at === 'stairsDown' || at === 'stairsUp') {
        const p = find(at);
        if (p) {
            const c = cellCenter(d.cells.get(p.cells[0]));
            return { x: c.x, z: c.z, yaw: DIR_YAW[p.dir], pitch: 0 };   // 앞 통로 가운데에서 엘리베이터 안쪽을 본다
        }
    }
    if (at === 'clearing' || at === 'boss') {
        const p = find('clearing', (q) => (at === 'boss') === (q.id === d.bossPieceId));
        if (p) {
            const c = cellCenter(d.cells.get(p.center));
            return look({ x: c.x, z: c.z + 21 }, c, -0.1);   // 남쪽 방 칸 끝에서 중심을 본다
        }
    }
    if (at && at !== 'sanctuary') console.warn('[debug view] 이 층에 없는 장소:', at);
    const s = getSpawn(d, 'newGame');
    return { x: s.x, z: s.z, yaw: s.yaw, pitch: 0 };
}
// 디버그 전용 화면: 던전 3D (#debug=view&floor=1&seed=3&theme=lava). 기본은 위에서 내려다본 모습 (안개·천장 숨김),
// &eye=1 이면 1인칭 (&at=merchant 등으로 장소, &yaw= &pitch= 로 시선 각도 (도) 지정), &light=0~1 이면 setLightLevel
SCREENS.debugView = {
    view: null, eye: null, info: null, label: '', frames: 0,
    enter(params) {
        hideMenuBackdrop();
        const { floor, seed } = debugFloorSeed(params);
        const theme = THEME_VISUALS[params.theme] ? params.theme : 'backrooms';
        const d = generateDungeon(seed, floor, params.hero);   // &hero=eric (17-1)
        this.view = buildDungeonView(d, theme);
        mountDungeonView(this.view);
        let mode = 'top';
        if (params.eye) {
            const vp = debugViewpoint(d, params.at);
            const deg = (v, fallback) => (v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) * Math.PI / 180 : fallback);
            this.eye = new THREE.Vector3(vp.x, floorHeightAt(d, vp.x, vp.z) + 1.7, vp.z);
            app.camera.position.copy(this.eye);
            app.camera.rotation.order = 'YXZ';
            app.camera.rotation.set(deg(params.pitch, vp.pitch), deg(params.yaw, vp.yaw), 0);
            mode = 'eye ' + (params.at || 'sanctuary');
        } else {
            this.eye = debugTopCamera(d);
            app.scene.fog = null;   // 높은 곳에서는 안개 때문에 보이지 않으므로 끈다
            if (this.view.ceiling) this.view.ceiling.visible = false;
        }
        if (params.light !== undefined) {   // &light=0.1 → setLightLevel (백룸 보스 "정전" 확인용)
            this.view.setLightLevel(Number(params.light) || 0);
            mode += ' · light ' + params.light;
        }
        this.frames = 0;
        this.label = `view ${mode} · theme ${theme} · floor ${floor} · seed ${seed} · cells ${d.cells.size}`;
        this.info = el('div', 'ug-debug-view-info', this.label);
        app.uiRoot.appendChild(this.info);
    },
    exit() {
        unmountDungeonView(this.view);
        this.view = null;
        app.camera.up.set(0, 1, 0);
        app.camera.rotation.set(0, 0, 0);
    },
    update(dt) {
        if (!this.view) return;
        this.view.update(dt, this.eye);
        if (++this.frames === 3) {   // 2프레임을 그린 뒤의 렌더러 통계
            const r = app.renderer.info;
            const stats = `draw calls ${r.render.calls} · triangles ${r.render.triangles} · geometries ${r.memory.geometries}`
                + ` · textures ${r.memory.textures} · programs ${r.programs.length}`;
            this.info.textContent = this.label + '\n' + stats;
            console.log(`[debug view] ${this.label} · ${stats}`);
        }
    },
};
// 디버그 전용: view dispose 확인 (#debug=viewDispose&floor=1&seed=3, 4-9)
// 테마 5종을 한 번씩 만들어 공유 자원을 만든 뒤, 테마를 바꿔 가며 10번 더 만들고·그리고·지운다.
// 이후 renderer.info.memory 가 공유 자원만 남은 값과 같으면 OK
SCREENS.debugViewDispose = {
    enter(params) {
        hideMenuBackdrop();
        const { floor, seed } = debugFloorSeed(params);
        const d = generateDungeon(seed, floor);
        const mem = () => ({ geometries: app.renderer.info.memory.geometries, textures: app.renderer.info.memory.textures });
        const cycle = () => {
            let peak = 0;
            for (const theme of THEME_IDS) {
                const v = buildDungeonView(d, theme);
                mountDungeonView(v);
                v.update(0.016, debugTopCamera(d));
                app.renderer.render(app.scene, app.camera);
                peak = Math.max(peak, app.renderer.info.memory.geometries);
                unmountDungeonView(v);
            }
            return peak;
        };
        const start = mem();
        cycle();
        const shared = mem();
        let peak = 0;
        for (let k = 0; k < 2; k++) peak = Math.max(peak, cycle());
        const after = mem();
        app.camera.up.set(0, 1, 0);
        const ok = after.geometries === shared.geometries && after.textures === shared.textures;
        const text = `[debug dispose] floor ${floor} · seed ${seed}\n`
            + `시작: geometries ${start.geometries}, textures ${start.textures}\n`
            + `테마 5종 1회 (공유 자원 생성 후): geometries ${shared.geometries}, textures ${shared.textures}\n`
            + `10회 더 만들고 지운 뒤: geometries ${after.geometries}, textures ${after.textures} (생성 중 최대 geometries ${peak})\n`
            + `결과: ${ok ? 'OK' : 'NG'}`;
        console.log(text);
        app.uiRoot.appendChild(el('div', 'ug-debug-view-info', text));
    },
    exit() { },
    update() { },
};
const Undergrounds = {
    initialize(container) {
        if (app.container) return;   // 중복 호출 방지
        app.container = container;
        app.settings = loadSettings();
        currentLang = app.settings.lang;
        injectStyle();
        app.stage = el('div', 'ug-stage');
        app.canvas = el('canvas', 'ug-canvas');
        app.uiRoot = el('div', 'ug-ui');
        app.stage.appendChild(app.canvas);
        app.stage.appendChild(app.uiRoot);
        container.appendChild(app.stage);
        app.renderer = new THREE.WebGLRenderer({ canvas: app.canvas, antialias: true });
        applyGraphicsQuality();
        app.scene = new THREE.Scene();
        app.scene.background = new THREE.Color(0x000000);
        app.camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, CAMERA_FAR_DEFAULT);
        fitStage();
        window.addEventListener('resize', fitStage);
        window.addEventListener('keydown', onGlobalKeyDown);
        setupInput();
        app.lastTime = performance.now();
        requestAnimationFrame(frame);
        const dbg = parseDebugHash(window.location.hash);
        if (dbg && dbg.fps) {   // &fps=1: 모든 화면에 FPS 표시 (showScreen 이 uiRoot 를 비우므로 stage 에 붙인다, 20-3)
            const node = el('div', 'ug-fps');
            app.stage.appendChild(node);
            app.fps = { node, frames: 0, since: performance.now(), updateMs: 0, renderMs: 0 };
        }
        const entry = dbg ? DEBUG_ENTRIES[dbg.debug] : null;
        if (entry) entry(dbg);
        else showScreen('title');
    },
};

// ===== [22] 내보내기 =====
export const __TEST__ = {
    clamp, lerp, hashInts, createRng,
    readSlot, writeSlot, deleteSlot, loadSettings, saveSettings, parseDebugHash,
    generateDungeon, getSpawn, floorHeightAt, buildCellBoxes, dungeonToAscii,
    // 3단계: 데이터 테이블
    SKILLS, SKILL_LINKS, SKILL_BY_ID, SKILL_NEIGHBORS, skillCooldown,
    CONSUMABLES, CONSUMABLE_TIER_MIN_FLOOR, CONSUMABLE_DROP_WEIGHTS, POTION_COOLDOWN, THROW_COOLDOWN, STACK_MAX, stackMaxOf, ERIC_STACK_MAX,
    TIER_INFO, RARITIES, WEAPON_TYPES, EQUIP_BASES, BLOCK_REDUCTION, BLOCK_ARC_DEG, affixSlotOf, RING_ENGRAVINGS, AFFIXES,
    STATUS_EFFECTS, BOSS_CC_SLOW_PCT, THEMES, MONSTER_TYPES,
    // 3단계: 공식·상태
    expToNext, killExp, physReduction, elementMultiplier, costAtLevel, itemLevelScale, consumablePrice, consumableSellPrice,
    monsterBaseStats, monsterRewardMultiplier, equipStats, collectModifiers, calcDerivedStats,
    createNewGameState, makeEquipInstance, pickNextTheme, applyFloorChange,
    // 4단계: 던전 그리기용 상자 (순수 함수)
    THEME_VISUALS, collectDungeonBoxes, cellWallFaces, WALL_Y0,
    // 5단계: 충돌·소모품 도우미, 브라우저 자동 확인용 런타임 조회
    moveWithCollision, countConsumable, itemCooldownKey, debugRuntime,
    // 6단계: 저장 데이터 직렬화·형식 검사, 지도 배치
    serializeState, deserializeState, mapLayout, MAP_W, MAP_H, MAP_CELL_MIN, MAP_CELL_MAX,
    // 7단계: 층 이동 트리거·런타임 스냅샷
    collectFloorTriggers, floorTriggerAt, TRIGGER_FLOOR_CHANGE, PORTAL_TRIGGER_RADIUS,
    snapshotFloorRuntime, restoreFloorRuntime,
    // 7단계 보완 (2026-10-18 층 정보 저장 규칙): 층 기록·방문 칸 압축
    makeFloorRecord, ensureNextFloor, encodeVisited, decodeVisited,
    // 8단계: 피해 계산·경험치·몬스터 생성 계획·상태
    computeDamage, monsterAttacker, grantExp, planFloorMonsters, createMonsterState, monsterRewardMuls, canSpawnMonsterIn,
    MONSTER_DENSITY, MONSTER_NO_SPAWN_DIST, ELITE_MUL,
    // 8단계: 길찾기 (순수 함수), 넉백 (14단계 스킬이 쓴다), 투사체 갱신 (가짜 런타임으로 시험), 브라우저 자동 확인용 몬스터 생성
    cellDistances, findCellPath, knockMonster, updateProjectiles, spawnDebugMonster,
    // 9단계: 상태이상·버프 (applyEffect·tickEffects 는 순수 함수), 몬스터에게 걸기 (12·14단계가 쓴다)
    applyEffect, tickEffects, effectMagnitude, isDisabled, addBuff, tickBuffs, applyStatusToPlayer, applyStatusToMonster, STATUS_ICON,
    BLEED_DEFAULT_DOT_PCT,
    // 10단계: 정예·둥지·보스 배치 (순수 함수), 광선·부채꼴 판정, 작은 개체, 외형·행동·보스 패턴 표
    eliteChance, planNestMonsters, planBoss, bossZoneOf, inBossZone, segmentHitsPlayer, inCone, bossHpMarkReached, monsterDisplayName,
    MONSTER_MODELS, MONSTER_BEHAVIORS, BOSS_PATTERNS, ELITE_CHANCE, NEST_COUNT, SMALL_MUL, SPLIT_CHILD_REWARD_MUL,
    // 2026-10-22 사용자 지시: 몬스터별 배회 (생성 칸 10칸 안, 둥지는 공터 안), 무리 우두머리, 범위 BFS
    MONSTER_WANDER, WANDER_RANGE_CELLS, wanderAreaCells, cellBfs, monsterWander, wanderLeaders, updateMonsters,
    // 11단계: 스테이터스 탭 (표시 값 모델·스탯 포인트), 디버그 레벨
    statusTabModel, spendStatPoint, STAT_IDS, debugSetLevel, I18N,
    // 12단계: 장비 생성·가격, 인벤토리 조작, 드롭 계획, 소모품 사용, 귀환 위치, 상세 정보 문구, 디버그 인벤토리
    generateEquipment, rollEquipTier, equipRarityWeights, equipPrice, equipSellPrice, AFFIX_PREFIX, RARE_NAME_FIRST, RARE_NAME_SECOND,
    CONSUMABLE_DESC, addItem, removeItemAt, consumeConsumable, equipItem, unequipItem, moveInventoryItem, setActionSlot, swapActionSlots,
    planMonsterDrops, rollConsumableId, ITEM_DROP, BOSS_DROP, useConsumable, throwBaseDamage, recallDestination, isValidItem,
    isValidDropItem, affixLabel, affixValueText, equipBaseLines, debugFillInventory,
    // 16단계 (2026-10-24 두 주인공): 주인공, 엘리베이터 (배치·버튼 판·내부), 조준 상호작용, 저장 가능 영역
    HEROES, DEFAULT_HERO, isHeroId, elevatorLayout, collectInteractables, isElevatorInterior, ELEVATOR_LEN, ELEVATOR_PANEL_Y,
    findInteractable, INTERACT_RANGE, INTERACT_ANGLE_DEG, canSaveHere, discardItemAt,
    // 13단계: 스킬 활성화·레벨 업 규칙, 스킬 트리 배치·상태·스크롤 범위·설명문 조각
    canLearnSkill, learnSkill, skillNodePos, skillNodeState, skillLinkState, clampSkillScroll, skillDescParts, fmtSkillValue,
    SKILL_TREE_SIZE, SKILL_TREE_ORIGIN, SKILL_NODE_GAP,
    // 14단계: 스킬 실행 공통·핸들러, 자원·재사용 대기, 상태이상 패시브 보정, 피격 훅 (막기·보호막·불굴·넉백 면역), 순간이동·조준 지점, 지도 공개
    updateGame,   // 브라우저 자동 확인에서 시간을 고정 간격으로 흘리는 용도 (g.paused = true 로 실제 루프를 멈추고 직접 부른다)
    castSkill, SKILL_HANDLERS, skillCost, canPaySkill, skillCooldownFor, applyPlayerStatus, hitPlayer, damagePlayer, knockPlayer,
    blinkTarget, aimGroundPoint, segmentPointDist, revealCellsAround, revealFacilities, SKILL_BUFF_STYLE, SKILL_MIN_COOLDOWN,
    // 15단계: 방랑 상인 재고·구매·판매, 상인 상호작용 위치
    generateMerchantStock, merchantStockOf, MERCHANT_STOCK, consumableRoom, maxBuyCount, buyConsumable, buyEquipment, sellPriceOf, sellItem,
    merchantLayout, MERCHANT_INTERACT_RANGE,
    // 2026-10-25 AGENTS.md: 상점 1×1·상점 주변 3칸에 몬스터가 들어갈 수 없음 (U51)
    monsterBarred, MERCHANT_SAFE_CELLS, playerStartPosition,
    // 17단계: 에릭 던전의 가구 배치 (순수 함수), 캐비닛 숨기·서랍 (가짜 런타임으로 시험), 가져간 서랍 기록 검사
    planEricFurniture, ERIC_FURNITURE, ERIC_INTERACT_RANGE, DRAWER_SLOT_Y, enterCabinet, exitCabinet, useDrawer, drawerItem, interactLabelKey,
    playerTargetable, isValidDrawersTaken, HIDE_YAW_LIMIT,
    // 18단계: 플래시·배터리 (데이터·켜고 끄기·에너지), 주인공별 메뉴 탭
    TOOLS, FLASH_ENERGY_MAX, FLASH_DEAD_ON_TIME, newFlashState, toggleFlashlight, tickFlashlight, menuTabsOf, ERIC_MENU_TABS, ERIC_DARK,
    // 22단계: 에릭 장롱 확장·야광봉·카드키 잠금·빛 바랜 주문서
    GLOWSTICK, isValidGlowsticks, dropGlowstick, isElevatorLockedFor, useCardReader, useInteractable, CARD_READER_Y,
    pickWarpDestination, startFadedWarp, updateFadedWarp, fadedWarpFade, FADED_WARP, calmEricMonster, hasLineOfSight,
    // 20단계: 번역 누락 검사 (동적 키의 정의역), 이야기 장면
    TOOL_DESC, MENU_TABS, EQUIP_SLOT_KEYS, itemTypeKey, introFrame, INTRO_TIMING, INTRO_LINE_KEYS,
    DRAWER_KEEP_FLOORS, pruneFarFloorRecords,
    // 23단계: 에릭 몬스터 발소리·의심 모드
    footstepRange, ERIC_FOOTSTEP, updateEricSenses, hearFootstep,
    // 19단계: 에릭의 몬스터 (생성 계획·시야·노이즈 단계는 순수 함수, 행동은 가짜 런타임으로 시험)
    planEricMonsters, ericMonsterSees, ericNoiseLevel, setupEricMonster, updateEricMonster, ericReach, ERIC_MONSTER, ERIC_SIGHT, ERIC_NOISE,
};
export default Undergrounds;
if (typeof window !== 'undefined') window.Undergrounds = Undergrounds;
