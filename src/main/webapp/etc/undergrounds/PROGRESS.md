# Undergrounds 개발 진행 문서 (PROGRESS.md)

> 이 문서는 개발을 맡은 AI 가 **작업을 시작하기 전에 읽고, 작업이 끝나거나 중단될 때 갱신**하는 문서다. (AGENTS.md > 개발 시 준수사항)
>
> - 무엇을 만드는가 (기획·수치) → **AGENTS.md**
> - 어떤 순서로·어떻게 만드는가 (절차), 지금 어디까지 했는가 (진행 상황) → **이 문서**
> - 두 문서가 충돌하면 **AGENTS.md 가 우선**이다. 이 문서의 "임시 결정"(5절)은 AGENTS.md 에 없는 빈칸을 메운 것이다.

## 읽는 순서 (매 작업마다)

1. AGENTS.md 전체
2. 이 문서의 0절 (현재 상태) → 1절 (작업 규칙) → 9절 작업 기록의 마지막 3개
3. 이번에 할 단계 (7절의 해당 단계) 를 처음부터 끝까지
4. 2~6절, 8절, 부록은 처음에 한 번 정독하고, 이후에는 필요할 때 찾아본다.

---

## 0. 현재 상태  ← 작업할 때마다 갱신

| 항목 | 내용 |
|---|---|
| 현재 단계 | **2026-10-25 20단계 (마무리) 완료 — 20-5 (3인칭) 만 보류** (사용자가 조건은 알려 줌: 특정 스킬 사용 시 유효시간 동안 3인칭, U4. 어떤 스킬인지는 미정이라 보류). 0~23단계 구현 완료, 사용자 확인 항목만 남음 (20-9·21-5·22-7·23-5·13-8·14-7·15-5·16-8·17-7·18-5·19-5·8-17·10-8·12-10 은 자동 확인 완료, 실제 느낌은 사용자 확인 대기. 11-4 는 2026-10-22 사용자 확인 완료. 사용자 확인은 나중에 종합 플레이 때 몰아서 한다). 20-7 최종 점검 결과는 7절 20단계와 9절 마지막 기록 |
| 마지막으로 완료한 작업 | 20-1 ~ 20-4, 20-6 ~ 20-8 (번역 누락 검사·해상도·`&fps=1` 성능 측정·저장 데이터 크기·새 게임 이야기 장면·AGENTS.md 최종 점검) (2026-10-25, 9절 마지막 기록). 그 전: 23-4 (에릭 노이즈 20칸 / 10칸), 21 ~ 23단계 |
| 다음 작업 | **없음 (사용자 종합 플레이의 피드백을 받아 고친다).** 20-5 (3인칭) 는 사용자 답 (특정 스킬을 쓰는 동안 3인칭, U4) 은 받았으나 **보류** — 어떤 스킬인지가 정해지면 구현. 정예·보스는 사용자가 나중에 다시 구상한다 (2026-10-22) — 그때까지 지금 동작 그대로 둔다 |
| 사용자 확인 대기 | (2026-10-18 사용자: 확인은 나중에 몰아서 한다. 아래 목록을 그대로 두고 단계를 계속 진행) / **20-9 마무리** (`npm start` → http://127.0.0.1:9806/ → 게임 시작 → 빈 슬롯 → 예 → 검은 화면에 이야기 세 줄이 차례로 나타남 (약 11초, 클릭·Space·Enter·ESC 로 건너뜀) → 지하 1층 시작 — 글자 크기·속도가 괜찮은지 (U59) / 실제 FPS: `http://127.0.0.1:9806/#debug=game&floor=400&seed=3&theme=brick&at=clearing&fps=1` (또는 `theme=void`, 설정에서 보통 품질) → 오른쪽 위에 FPS·갱신 시간·그리기 시간·draw call·삼각형·몬스터 수. 큰 층 (지하 400층, 몬스터 약 180마리) 에서도 60fps 근처인지. 이 PC 의 헤드리스 검증은 CPU 렌더링이라 FPS 를 알 수 없고, 갱신 0.4~0.7ms·그리기 CPU 0.4~0.6ms (최악 2~3ms)·draw call ≤ 약 1050 으로 여유가 있었다 / 에릭 서랍 기록: 서랍을 비운 층에서 2층 이상 멀어졌다 돌아오면 서랍이 새것으로 채워져 있고, 1층 거리 (바로 위·아래) 에서 돌아오면 비어 있는지 (U61). Playwright 자동 확인 51건 통과) / **21-5 조작 (F·왼쪽 버튼)** (`npm start` → 일반 게임 또는 `http://127.0.0.1:9806/#debug=game&floor=2&seed=5&at=stairsDown` → 화면 클릭 → 마우스 왼쪽 버튼을 누르고 있으면 기본 공격이 연속으로 나감 (짧게 누르면 1번), 오른쪽 버튼은 아무 일도 없음, 엘리베이터 버튼 판·상인·캐비닛·서랍은 조준하고 F (HUD "F | …"), "클릭하여 계속" 아래 조작 안내 2줄. 메뉴·인벤토리·상점의 우클릭 상세 정보는 그대로. Playwright 자동 확인 21건 통과) / **22-7 에릭 장롱·아이템·카드키** (`http://127.0.0.1:9806/#debug=game&floor=3&seed=4&hero=eric&noMonsters=1` → 화면 클릭 → 일자·ㄱ자 복도에도 서랍장이 있고 (층마다 16개 이상) 위·아래 칸에 야광봉·배터리·하급 활력 물약·탐색 주문서·빛 바랜 주문서·카드키 (층마다 1개) 가 들어 있음 — 내용물 확률이 원하는 수준인지 (5절 U52) / 카드키를 이미 가졌으면 "카드키는 하나만 가질 수 있습니다" / TAB → 인벤토리: 배터리·야광봉·빛 바랜 주문서는 여러 개여도 1칸, 카드키는 [사용]·[버리기] 회색 / **야광봉**: 인벤토리에서 행동 슬롯에 등록 → 마우스 왼쪽 버튼 → 앞 바닥에 초록 막대가 놓이고 주위 2칸이 초록빛, 멀리 떨어져도 (벽에 가리지 않으면) 초록 빛점이 보임, 2층 이상 떨어진 층에 갔다 오면 사라짐, 밝기·빛점 크기가 괜찮은지 (U54) / **카드키**: `&at=stairsDown` → 아래층 엘리베이터 문이 닫혀 있고 (▼ 표시등 꺼짐) 걸어도 들어갈 수 없음 → 문 바깥 오른쪽 벽의 리더기 (붉은 불) 를 조준해 F → 카드키가 없으면 아무 일도 없음 → `&items=1` 을 붙여 카드키를 가진 채로 F → 불이 초록·문이 열림·"엘리베이터가 활성화되었습니다" (U55) / **빛 바랜 주문서**: 행동 슬롯에 등록 → 왼쪽 버튼 → 화면이 0.4초 어두워졌다 밝아지며 같은 층의 10칸 이상 떨어진 곳으로, 쫓던 몬스터는 추적을 멈춤 (U56). Playwright 자동 확인 25건 통과) / **23-5 에릭 몬스터 발소리·의심 모드** (`http://127.0.0.1:9806/#debug=game&floor=3&seed=4&hero=eric` → 몬스터 근처 (노이즈가 보일 때) 에서 걸으면 5칸, SHIFT 로 달리면 20칸 안의 몬스터가 마지막 발소리가 난 곳으로 천천히 옴 (의심 모드, 노이즈는 거리 단계 그대로) → 그 자리에 도착하면 다시 배회, 오다가 주인공을 보면 달리기 속도로 추적 / 추적은 8초 동안 안 보이면 해제 / 캐비닛에 8초 숨으면 의심·추적 모두 해제 (값은 U57). Playwright 자동 확인 10건 통과) / **2026-10-25 AGENTS.md 두 번째 변경 확인 요청** (임시 결정으로 21~23단계를 구현함. ① 은 2026-10-25 사용자가 AGENTS.md 를 고쳐 확정 — 1단계 20칸): ① ~~노이즈 거리 (U45)~~ 확정 (20칸 / 10칸) / ② U52 장롱 내용물 확률 ("낮은"·"매우 낮은" 의 해석: 야광봉 40 / 배터리 20 / 하급 활력 물약 20 / 탐색 주문서 15 / 빛 바랜 주문서 5, 빈칸 50%) — 하급 활력 물약·탐색 주문서를 계속 넣을지 / ③ U53 카드키는 버릴 수 없게 / ④ U54 야광봉 빛 4개만 진짜 조명 / ⑤ U55 카드 리더기는 문 오른쪽 벽, 카드키 없이 찍으면 아무 일도 없음 (안내도 없음) / ⑥ U56 빛 바랜 주문서 "10칸 이상" = 직선 거리, 의심 모드도 함께 해제 / ⑦ U57 발소리는 벽에 막히지 않음, 의심 모드 이동 속도 = 배회 속도 / ⑧ U58 메뉴 안의 우클릭 상세 정보는 그대로 / **19-5 에릭의 몬스터·노이즈** (`npm start` → 일반 게임에서 에릭으로 새 게임, 또는 `http://127.0.0.1:9806/#debug=game&floor=3&seed=4&hero=eric` → 층마다 그 테마의 보스 모습 1~2기가 층 전체를 천천히 (2.5 m/s) 돌아다님 / 가까워지면 화면에 흑백 노이즈 (20칸 안 약하게 → 10칸 안 조금 더 → 쫓기면 가장 강하게 + 가장자리 어둡게, 2026-10-25 거리 변경) — 3단계에서도 화면이 잘 보이는지 / 정면 2칸 안에 들어가거나 플래시 불빛이 보이면 (정면 20칸, 또는 몬스터를 플래시로 비추면) 주인공의 달리기 속도로 쫓아옴 / 0.5초 예비 동작 뒤 공격에 맞으면 한 방에 "쓰러졌습니다" (그 사이에 벗어나거나 캐비닛에 들어가면 빗나감) / 캐비닛에 숨으면 마지막으로 본 자리까지 와서 머물다 8초 뒤 다시 돌아다님 (2026-10-25 4초 → 8초) / 엘리베이터 안으로는 들어오지 못하고 안의 주인공을 노리지 않음 (안에서 저장 가능) / 처치할 수 없음. 바로 앞에서 보려면 `&monster=br_boss` (테마에 맞는 보스 id, 예: `&theme=cave&monster=cv_boss`). 값은 5절 U43 ~ U45. Playwright 자동 확인 16건 통과) / **17-7 에릭 던전·가구** (`npm start` → `http://127.0.0.1:9806/#debug=game&floor=3&seed=4&hero=eric&noMonsters=1` → 화면 클릭 → 지도 (TAB) 에 포탈·상인이 없고 지하 2층부터 성소가 없음 / 일자·ㄱ자 복도 벽의 철제 사물함 (캐비닛) 을 조준하면 "F | 숨기" → F → 화면이 검게 막히고 가운데 가는 틈으로 바깥이 보임, 시점은 좌우 ±40°·위아래 ±15° 만, 움직이거나 플래시를 켤 수 없음, 다시 F 를 누르면 "나오기" / 나무 서랍장 (2026-10-25 부터 일자·ㄱ자 복도에도): 위·아래 칸을 각각 조준해 F "열기" → 서랍이 나옴 → F "가져가기" (내용물은 22-7) 또는 "비어 있음" → 엘리베이터로 다른 층에 다녀와도 가져간 칸은 빔. Playwright 자동 확인 통과) / **18-5 에릭 플래시·어둠·화면** (같은 주소, 테마는 `&theme=brick` 등으로 5종 → 플래시를 끄면 앞 2칸까지만 보이고 그 너머는 지형이 잘 안 보이게 어두움, 마우스 왼쪽 버튼 (누르는 순간만) 으로 켜면 정면 부채꼴로 7칸까지 밝아짐 — 이 어둠의 정도가 원하는 수준인지 (값은 5절 U42) / 켜진 동안 왼쪽 아래 플래시 막대·"N / 300" 이 줄어듦, 0 이 되면 배터리 ×1 이 자동으로 쓰여 다시 300, 배터리가 없으면 꺼지고 다시 켜도 0.5초 뒤 꺼짐 (기다리기 어려우면 개발자 도구 콘솔에서 `(await import('/js/undergrounds.js')).__TEST__.debugRuntime().game.state.player.flashEnergy = 3`) / 캐비닛에 들어가면 꺼짐 / HUD 에 HP·MP·레벨·골드가 없고 스태미너·플래시·배터리만 / TAB 메뉴는 지도·인벤토리·시스템 3탭, 인벤토리는 장착 칸 없음·플래시 클릭 = 행동 슬롯 등록 ([버리기] 회색)·우클릭 상세 정보 (에너지)·배터리 [사용] 회색. Playwright 자동 확인 통과) / **15-5 방랑 상인** (`npm start` → `http://127.0.0.1:9806/#debug=game&floor=3&seed=3&at=merchant` → 화면 클릭 → 카운터 뒤 상인을 조준하면 "F | 거래하기" → F → 상점 (게임 멈춤) / 구매: 소모품 클릭 → [1개] [5개] [최대 N개] (골드·공간 한도, 모자라면 회색 + 이유 툴팁), 장비 클릭 → [구매] → "품절", 우클릭·길게 누르기 = 상세 정보 (판매가·구매가) / 판매 탭: 칸 아래 판매가, 소모품 [1개] [5개] [모두], 희귀 장비는 확인 대화상자 / ESC·[닫기] → "클릭하여 계속" (다시 클릭해도 상점이 또 열리지 않음 — 이제 상점은 F 로만 열림). 디버그 게임은 골드 0 으로 시작하므로 `&items=1` 을 붙여 받은 장비를 판매 탭에서 팔아 골드를 모은 뒤 구매해 본다. 일반 게임에서: 장비를 산 뒤 성소·엘리베이터에서 저장 → 메인 메뉴 → 이어하기 → 상인에게 가면 품절 그대로, 아래층에 갔다가 올라와도 그대로. **상점 1×1·주변 3칸 (2026-10-25 AGENTS.md, U51)**: 상점이 1칸 방 가운데의 천막인지 (테마 5종: `&theme=brick` 등), 지도에서 초록 1칸, 일반 게임에서 몬스터를 끌고 상점 쪽 (가로·세로·대각선 3칸 안) 으로 들어가면 몬스터가 경계에서 멈추고 따라오지 못하는지. U51 의 "주변 3칸 = 체비쇼프 거리 (대각선 포함, 벽 너머 칸도 포함)"·"몬스터는 범위 밖에서 계속 노림 (성소와 달리)"·"공터와 4칸 이상 띄움" 은 임시 결정. Playwright 자동 확인 39건 통과) / **13-8 스킬 트리 화면** (`npm start` → `http://127.0.0.1:9806/#debug=game&floor=1&seed=3&level=20&menu=skill` → 처음에 기본 공격이 가운데·선택됨 / 빈 곳 끌기·방향키 (←↑→↓, 누르고 있으면 계속)·휠 (Shift + 휠 = 좌우) 로 스크롤, 끝에서 멈춤 / 청록으로 깜빡이는 노드 (M0·A0·D0·S0) 클릭 → 오른쪽 패널 [활성화] → 금색 테두리·금색 연결선·이웃 노드가 깜빡임 / [레벨 업] → 다음 레벨의 달라진 수치 초록 / 잠긴 노드의 [활성화]·포인트 0·최대 레벨 → 이유 툴팁 4초 / 액티브 스킬은 패널 아래 [1]~[7] 로 행동 슬롯 등록 (강조된 칸을 다시 누르면 해제), 패시브는 안내 문구 / 영어 설정에서 글자 넘침. Playwright 자동 확인 52건 통과) / **14-7 스킬 효과** (`#debug=game&floor=3&seed=3&at=clearing&level=40&skills=all&monster=bk_orc` → 화면 클릭 → TAB 스킬 탭에서 써 볼 스킬을 행동 슬롯에 등록 → ESC → 숫자키로 고르고 마우스 왼쪽 버튼. 마법: 마력 화살·화염구 폭발·유성 낙하 (1초 뒤)·얼음 창 관통·눈보라·연쇄 번개 튕김·번개 폭풍 / 근접: 강타 넉백·연속 베기 3회·칼날 폭풍 (회전 중 느려짐)·돌진 10m·처형·깊은 상처 출혈·대지 분쇄 부채꼴 기절 / 방어: 수호 태세·방패 강타 기절·가시 갑옷 반사·위협의 함성 공포·원소 보호막·마력 보호막 (HP 막대 위 흰색 + "(+N)") / 보조: 응급 처치·정화·재생·가속·순간이동·마나 샘 / 교차: 원소 부여·반격·임시 성역 (바닥 금색 원)·시간 왜곡. MP 가 모자라면 슬롯이 붉게 깜빡임, 오른쪽 위 버프 아이콘 (뇌·칼·수·가·보·막·정·재·속·샘·부·왜), 방패를 끼면 정면 공격을 가끔 "막기". 수치·해석은 5절 U49. Playwright 자동 확인 44건 통과) / **16-8 주인공 선택·엘리베이터** (`npm start` → http://127.0.0.1:9806/ → 게임 시작 → 빈 슬롯 → [마틴] [에릭] 중 고르고 예 → 슬롯 화면에 "에릭 · 지하 1층 · 백룸" / 엘리베이터: `#debug=game&floor=2&seed=5&at=stairsDown` → 화면 클릭 → 앞으로 걸어가면 복도 1칸을 지나 엘리베이터 1칸의 문이 열림 (걸어 들어가도 층이 바뀌지 않음. 복도 칸에서는 저장 안내가 없고 엘리베이터 칸에 들어가야 "엘리베이터 — 저장 가능") → 안쪽 끝의 버튼 판을 조준하면 "F | 아래층으로" → F → 문이 닫히며 지하 3층 / 엘리베이터 안에서 TAB → 시스템 탭 [저장] 활성, HUD "엘리베이터 — 저장 가능" / 인벤토리의 소모품 메뉴·장비 상세 정보 (우클릭) 의 [버리기]. 테마 5종 엘리베이터 겉모습 (`&theme=brick` 등). Playwright 자동 확인 27건 통과) / **2026-10-24 AGENTS.md 변경에서 정해야 할 것** (임시 결정으로 문서만 만들어 둠, 16~19단계 시작 전에 확인. 같은 날 두 번째 수정으로 U42 어둠·U47 저장·71행·U43 의 "잡혔을 때" 는 사용자가 정함): 5절 U37 (엘리베이터: 안에서 저장할 수 있게 되어 "들어가면 바로 이동" 대신 안의 버튼을 클릭해 이동하도록 바꿈), U43 (에릭 몬스터의 종류 = 테마 보스), U46 (에릭의 장비 없음·HUD 에서 HP 막대도 숨김), U48 (아이템 버리기), AGENTS.md "시스템" 탭의 **[저장] 버튼 줄은 아직 "성소 영역에서만 활성화"** — 사용자 말씀 ("엘리베이터 내부도 저장 가능 영역에 추가") 대로 [저장] 도 엘리베이터 내부에서 활성으로 읽음 (U47) / **12-10 아이템·인벤토리** (`npm start` → `http://127.0.0.1:9806/#debug=game&floor=12&seed=3&level=12&items=1&menu=inventory` → ① 장비 클릭 = 장착 (원래 장비는 그 칸으로), 장착 칸 클릭 = 해제, 붉은 "Lv25" 장비는 "요구 레벨" 토스트 ② 드래그 (반투명 복사본이 따라옴): 장비 → 장착 칸, 장착 칸 → 빈칸, 소모품 → 아래 행동 슬롯, 행동 슬롯 → 바깥 (해제)·다른 행동 슬롯 (교환), 칸끼리 교환 ③ 우클릭 또는 0.5초 누르고 있기 = 상세 정보 (이름 등급 색·단계·요구 레벨·아이템 레벨·수치·각인·옵션·판매가), 밖을 누르면 닫힘 ④ 소모품 클릭 = [사용] / 행동 슬롯 1~7 / [취소] ⑤ 장착 후 스테이터스 탭 수치 변화 ⑥ ESC 로 닫고 화면 클릭 → 행동 슬롯에 등록한 물약·화염병·영약·주문서를 휠/숫자로 고르고 마우스 왼쪽 버튼 (화염병은 조준 방향 포물선, 귀환 주문서는 3초 막대 후 성소로, 맞으면 취소) ⑦ 바닥 아이템: `#debug=game&floor=3&seed=3&drops=1&at=clearing` 에서 앞의 상자·동전에 다가가면 자동으로 줍고 "획득" 토스트 ⑧ 정예·보스 드롭: 일반 게임 또는 `#debug=game&floor=5&seed=3&at=boss` 에서 보스 처치 → 상자 5개 (장비 2·소모품 3) ⑨ 화면 오른쪽 아래 무기 모양이 장착 무기 (검·대검·단검·완드·지팡이) 에 따라 바뀜. Playwright 자동 확인 35건 통과) / **10-8 테마별 몬스터·보스** (`npm start` → 한 마리씩: `http://127.0.0.1:9806/#debug=game&floor=3&seed=3&theme=lava&at=clearing&monster=lv_slime` 처럼 `theme` 과 `monster` 를 바꿔 본다 (`&elite=1` 정예: 금색 테두리·"정예 …" 이름표). 확인할 것: 오크에 맞으면 밀려남, 주술사가 다친 아군을 초록 빛으로 회복, 박쥐가 출렁이며 날다 공격 후 물러남, 거미줄에 맞으면 둔화, 포자 버섯 주위 보라색 구름·죽을 때 폭발, 임프는 맞으면 순간이동, 슬라임은 죽으면 작은 2마리, 흑요석 골렘 충격파 고리, 도롱뇽 화염 숨결, 공허의 눈 붉은 조준선 → 광선, 위상 추적자가 보라 연기 뒤 등 뒤로, 해파리가 밝아진 뒤 펄스, 수호상 정면 공격 "막기". 보스: `#debug=game&floor=5&seed=3&theme=backrooms&at=boss` (theme 을 brick·cave·lava·void 로 바꿔 5종) → 위쪽 보스 이름·HP 막대, 바닥 붉은 예고 (원·부채꼴·선) 뒤 공격, 정전·소환·돌진 (벽에 부딪히면 "기절")·거미줄 지대·용암 웅덩이·중력 당김 (화면 가장자리 보라색)·차원 균열. 공터 3×3 밖으로 나가 10초 → 보스가 돌아가며 HP 막대 사라짐. 처치 → "… 처치!" 토스트, 일반 게임에서는 다시 와도 나오지 않음. 공터 둥지는 일반 게임 공터에서. Playwright 자동 확인 100건 통과) / **9단계 상태이상** (별도 체크 항목은 없음. 8-17 을 할 때 함께: 형광등에 맞으면 가끔 감전, 카펫 덩어리에 맞으면 가끔 중독 → 오른쪽 위 아이콘과 남은 초, 성소에 들어가면 아이콘이 사라짐. `#debug=game&floor=1&seed=3&theme=cave&at=stairsDown&monster=cv_golem` 의 바위 골렘에 맞으면 잠깐 움직일 수 없음 (기절)) / **8-17 전투** (`npm start` → http://127.0.0.1:9806/#debug=game&floor=1&seed=3&at=stairsDown → 화면 클릭 → 백룸 몬스터가 다가와 공격 / 마우스 왼쪽 버튼을 누르고 있으면 쇠파이프로 연속 공격 / 마네킹은 쳐다보면 멈춤 / 형광등은 떠서 전기 공을 쏨 / 카펫 덩어리를 죽이면 녹색 포자 구름 / 처치하면 시체·동전·경험치, 레벨 업 토스트 / 성소 안으로 들어가면 몬스터가 못 들어오고 공격하지 않음 / HP 가 0 이면 "쓰러졌습니다". 한 마리만 보려면 `&monster=br_mannequin` 처럼 붙인다. 저장·이어하기와 계단 오가기 확인은 일반 게임에서. Playwright 자동 확인 46건 통과) / 1-8 실제 브라우저에서 메뉴 흐름 확인 (`npm start` → http://127.0.0.1:9806/ , Playwright 자동 확인은 통과) / **5-12 조작감** (`npm start` → http://127.0.0.1:9806/ → 게임 시작 → 빈 슬롯 → 예 → 화면 클릭 → WASD·마우스·SPACE·SHIFT·1~7·휠. 계단은 http://127.0.0.1:9806/#debug=game&floor=5&seed=7&theme=void 에서 시작해 걸어서 찾는다. Playwright 자동 확인은 5-1~5-11 때 37건, 5단계 마무리 때 33건 재실행 모두 통과) / 4단계 던전 모습 확인 (선택, 3.5) / 5절의 "미확인" 항목 (임시 결정으로 진행 가능. 확정되면 5절 갱신) |
| 알려진 문제 | **20-5 (3인칭) 보류** — 3인칭으로 바꾸는 스킬이 정해지지 않았다 (U4). / **"지하 N층" 표기 (20-7)**: HUD·지도·토스트는 "지하 층" 라벨 + 큰 숫자 "B3" (숫자를 별도 행·글꼴로 분리하는 규칙), "지하 3층" 꼴은 슬롯 요약에서만 — 바꿀지 사용자 판단. / 2026-10-25 AGENTS.md 두 번째 변경 (와 같은 날 노이즈 1단계 20칸 수정) 은 21 ~ 23단계에서 모두 반영했다. / **22-1 로 같은 시드라도 에릭 층의 장롱 위치·내용이 바뀌었다** (기존 에릭 저장 데이터의 가져간 서랍 기록이 다른 장롱을 가리킬 수 있음. 카드키가 그 칸에 놓여 갇히지 않도록 `elevatorUnlocked` 가 없는 이전 저장 데이터는 아래층 엘리베이터를 활성으로 읽는다, U55). / **벽에 바짝 붙어 벽을 보면 화면이 하얗게 날아간다** (2026-10-25 22단계 확인 중 발견, 마틴·에릭 공통 — 주인공의 손전등 (마틴)·둘레 빛 (에릭) 이 눈 위치의 PointLight 라 0.4~0.5m 앞 벽이 과노출. 4·18단계부터 있던 것. 에릭의 잠긴 엘리베이터 문 앞에서 잘 보인다. 고칠지 (예: 빛을 눈 뒤로 옮기거나 가까운 거리 밝기 제한) 사용자 확인 후). / **2026-10-25 상점 1×1 로 던전 생성 결과가 바뀌었다** (같은 시드라도 지형이 다름, U51 ⑤) — 그 전에 만든 저장 데이터를 이어하면 층 지형·지도 (방문 칸)·몬스터 스냅샷 위치가 맞지 않을 수 있다. 저장 위치가 벽 안·던전 밖이면 성소에서 시작한다. 새 게임으로 확인하는 것을 권장. / AGENTS.md 아래쪽 "생성 금지 칸" 의 "상인 방" 은 1×1 상점 칸으로 읽는다 (사용자 요청 범위 밖이라 AGENTS.md 는 고치지 않음). / 부록 G 의 코드는 옛 층 기록 규칙이다 (기록용, 기준은 실제 파일). / `npm test` (ESLint + Playwright) 통과 상태를 유지할 것 — 쓰지 않는 변수·`catch (e)` 의 안 쓰는 `e` 는 lint 오류 (9절 2026-10-17 0·1단계 기록 참고). |

---

## 1. 작업 규칙

1. 7절의 단계를 **번호 순서대로** 진행한다. 단계 안에서도 체크박스 순서대로 한다. 위에 미완료 항목이 있으면 아래 항목으로 넘어가지 않는다. (사용자가 다른 작업을 직접 지시하면 그 지시가 우선이며, 9절에 기록한다.)
2. 한 번에 작업 ID 1~3개 정도만 진행하고 그때마다 검증한다. 한꺼번에 많이 쓰고 나중에 몰아서 검증하지 않는다.
3. 구현하기 전에 해당 작업의 설명과 AGENTS.md 의 관련 절을 다시 읽는다. **수치는 반드시 AGENTS.md 의 표에서 복사**한다. 기억이나 추측으로 쓰지 않는다.
4. 검증 순서 (자세한 방법은 3절):
   1. `node --check www/js/undergrounds.js` — 문법 오류 0
   2. `node tools/selftest.mjs` — FAIL 0
   3. 화면이 바뀌는 작업이면 헤드리스 Edge 로 콘솔 오류 0 확인 + 스크린샷을 직접 열어서 확인
   4. 키보드·마우스 조작처럼 직접 확인할 수 없는 것은 체크박스 옆에 `(사용자 확인 필요)` 를 적고, 0절 "사용자 확인 대기" 에 추가
5. 체크박스는 그 작업의 완료 조건을 **모두** 확인했을 때만 `[x]` 로 바꾼다. 일부만 했으면 `[ ]` 로 두고 9절에 "부분 완료: 남은 것 …" 을 적는다.
6. 작업이 끝나거나 중단될 때 **반드시** 0절과 9절을 갱신한다.
7. 같은 오류를 3번 고쳐도 해결되지 않으면 멈춘다. 9절에 증상·시도한 방법·오류 메시지 원문을 적고 사용자에게 보고한다.
8. AGENTS.md 와 이 문서 어디에도 답이 없는 설계 판단은 크게 정하지 않는다. 5절 표에 새 U 항목을 추가하고, 가장 단순한 임시안으로 진행하며, 그렇게 했다고 기록한다.
9. 파일 규칙
   - 주로 수정: `www/js/undergrounds.js`
   - 수정 가능: `PROGRESS.md`, `tools/selftest.mjs` (0-1 에서 만들고, 이후 테스트를 추가)
   - 수정 금지: `www/js/three.*.min.js`, `www/js/json5.js`, `www/se/candidates/*`
   - 사용자 요청 없이는 수정하지 않음: `www/undergrounds.html`, `package.json`, `AGENTS.md`, `server.js`
   - 위 목록 외의 새 파일을 저장소에 만들지 않는다. 임시 파일은 저장소 밖 (임시 폴더) 에 만든다.
10. git 커밋은 사용자가 요청할 때만 한다. (2026-10-17 에는 이 저장소에서 git 명령이 `dubious ownership` 오류가 났으나, 2026-10-22 에는 `git status`·`git diff` 가 정상 동작했다. 전역 git 설정 변경은 사용자 승인 후에만 한다.)
11. 응답·주석·기록은 한국어로 쓴다. 파일은 UTF-8, 기존 파일의 줄바꿈 (CRLF) 을 유지한다.

---

## 2. 프로젝트 환경 (2026-10-17 확인)

```
Undergrounds/
├─ AGENTS.md              기획서 (요구사항·수치)
├─ PROGRESS.md            이 문서
├─ package.json           "type": "module" → Node 가 .js 를 ES 모듈로 해석. `npm start` = `node server.js`
├─ server.js              로컬 웹 서버 (사용자가 만든 구동·테스트용 정적 서버, 의존성 없음, 3.3)
├─ tools/selftest.mjs     (0-1 에서 생성) Node 자체 테스트
└─ www/                   웹 루트 (server.js 가 이 디렉토리를 서비스)
   ├─ undergrounds.html   진입 페이지 (수정하지 않음)
   ├─ js/
   │  ├─ undergrounds.js       게임 전체 구현
   │  ├─ three.module.min.js   three.js r186 (WebGLRenderer 포함)
   │  ├─ three.core.min.js     three.js r186 코어 (직접 import 하지 않음)
   │  ├─ three.webgpu.min.js   사용하지 않음
   │  └─ json5.js              JSON5 (ES 모듈, export default). 현재 사용 계획 없음
   └─ se/candidates/          효과음 후보 .wav 218개 (사운드는 아직 구현하지 않음)
```

### 2.1 undergrounds.html 이 하는 일 (중요)

- importmap 으로 `./js/three.core.js` 를 `./js/three.core.min.js` 로 연결한다. (three.module.min.js 가 내부에서 `./three.core.js` 를 import 하기 때문)
- `<script type="module" src="./js/undergrounds.js">` 로 게임을 불러온다.
- `DOMContentLoaded` 때 `window.Undergrounds.initialize(div.underground_gamefield)` 를 호출한다.
  - 그러므로 undergrounds.js 는 **모듈이 평가될 때 동기적으로** `window.Undergrounds` 를 만들어야 한다.
  - undergrounds.js 에서 **최상위 await 를 쓰면 안 된다.** (DOMContentLoaded 가 먼저 와서 `window.Undergrounds` 가 undefined 일 수 있음)
- body 에는 스타일이 없다. 필요한 CSS 는 undergrounds.js 가 `<style>` 을 만들어 넣는다 (부록 D 의 `injectStyle`).

### 2.2 three.js 사용법

- import 는 이 한 줄만 쓴다: `import * as THREE from './three.module.min.js';` (`'three'` 같은 이름으로 import 하면 동작하지 않음)
- `three.core.min.js` 를 직접 import 하지 않는다. `three.webgpu.min.js` 는 쓰지 않는다. 렌더러는 `THREE.WebGLRenderer`.
- **애드온 (examples/jsm) 은 하나도 없다.** PointerLockControls, OrbitControls, BufferGeometryUtils (mergeGeometries), GLTFLoader, CSS2DRenderer, TextGeometry/FontLoader 모두 없다. 필요하면 직접 구현한다.
  - 포인터 락·입력: 부록 E
  - 상자 여러 개를 지오메트리 하나로 합치기: 부록 C
  - 3D 공간의 글자 (이름표·피해 숫자): 2D canvas 에 글자를 그려 `THREE.CanvasTexture` + `THREE.Sprite` 로 표시
- 이미지 파일을 쓰지 않는다. 텍스처는 2D canvas 에 그려 `CanvasTexture` 로 만든다.

### 2.3 이 PC 에서 쓸 수 있는 도구

- Node v24.21.0 (`node --check`, 자체 테스트, 로컬 웹 서버 `server.js`), Microsoft Edge (헤드리스 화면 검증). Chrome 은 없다.
- Python 3.13 도 설치되어 있지만 이 문서의 절차에서는 쓰지 않는다 (웹 서버는 `server.js`).

---

## 3. 실행·검증 방법 (모두 실제로 동작을 확인한 명령)

### 3.1 문법 검사

```
node --check www/js/undergrounds.js
```

출력이 없으면 정상이다.

### 3.2 자체 테스트 (Node)

```
node tools/selftest.mjs
```

- undergrounds.js 를 Node 에서 import 한 뒤, `__TEST__` 로 내보낸 함수·데이터를 검사한다.
- 결과 줄: `PASS` 통과 / `FAIL` 실패 (반드시 고친다) / `SKIP` 그 이름이 아직 `__TEST__` 에 없음 (그 단계 전이면 정상).
- 마지막 줄 `결과: PASS n, FAIL 0, SKIP m` 에서 **FAIL 은 항상 0** 이어야 한다.
- 이 테스트가 동작하려면 undergrounds.js 의 **최상위 코드가 `window`, `document`, `localStorage`, `requestAnimationFrame` 같은 브라우저 객체를 바로 사용하면 안 된다.** 브라우저 객체는 함수 안 (initialize 이후 호출되는 곳) 에서만 쓴다. (`performance`, `Math`, `JSON` 은 Node 에도 있다.)
- 테스트가 찾는 함수·데이터 이름과 반환 형식은 6절과 부록 A 에 있다. 이름을 바꾸지 않는다.

### 3.3 로컬 웹 서버 (`server.js`)

ES 모듈은 `file://` 로 열면 막히므로 반드시 http 서버로 연다. 저장소 루트의 `server.js` (사용자가 만든 Node.js / Bun 용 정적 웹 서버, 의존성 없음) 를 쓴다.

```
npm start            # = node server.js  (사용자가 직접 띄울 때)
node server.js       # AI 가 검증용으로 백그라운드 실행할 때 (프로세스가 하나뿐이라 종료하기 쉽다)
bun server.js        # Bun 으로도 실행된다 (이 PC 에 Bun 1.3.14 설치됨)
```

- `www` 디렉토리를 루트로 정적 파일만 서비스한다. 주소는 **`http://127.0.0.1:9806/`** (`/` 는 `/undergrounds.html` 로 연결). 디버그 해시는 `http://127.0.0.1:9806/#debug=menu` 처럼 붙인다.
- `127.0.0.1` 에서만 대기하므로 같은 PC 에서만 접속된다.
- 포트 바꾸기: 환경 변수 `PORT` (1~65535 정수). PowerShell `$env:PORT = '9807'; node server.js` / bash `PORT=9807 node server.js`. 값이 잘못되면 `RangeError` 로 바로 멈추고, 이미 쓰고 있는 포트면 `EADDRINUSE` 오류가 나므로 다른 포트를 쓴다.
- `Cache-Control: no-cache` 로 응답하므로 파일을 고친 뒤 새로고침하면 바로 반영된다.
- 응답 규칙: GET·HEAD 만 허용 (그 외 405), 없는 파일 404, `www` 밖으로 나가는 경로 403 (또는 404).
- AI 는 검증할 때 백그라운드로 실행하고, 검증이 끝나면 반드시 종료한다.
- `server.js` 는 사용자가 관리하는 파일이다. 사용자 요청 없이 고치지 않는다 (1절 9번).

### 3.4 헤드리스 Edge 로 화면 검증 (PowerShell)

서버가 켜져 있는 상태에서 실행한다. WebGL2 렌더링·스크린샷·콘솔 출력이 모두 동작하는 것을 확인했다.

```powershell
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$prof = "$env:TEMP\ug-edge-profile"
$url  = 'http://127.0.0.1:9806/undergrounds.html'   # 뒤에 디버그 해시를 붙일 수 있음 (3.5)

# (1) 콘솔 로그·오류 확인
Start-Process -FilePath $edge -ArgumentList @('--headless=new', "--user-data-dir=$prof", '--no-first-run', '--enable-logging=stderr', '--v=0', '--virtual-time-budget=5000', '--dump-dom', $url) -RedirectStandardOutput "$env:TEMP\ug-dom.html" -RedirectStandardError "$env:TEMP\ug-console.txt" -Wait -NoNewWindow
Select-String -Path "$env:TEMP\ug-console.txt" -Pattern 'CONSOLE.*127\.0\.0\.1' | ForEach-Object { $_.Line }

# (2) 스크린샷 (1920x1080)
Start-Process -FilePath $edge -ArgumentList @('--headless=new', "--user-data-dir=$prof", '--no-first-run', '--window-size=1920,1080', '--virtual-time-budget=5000', "--screenshot=$env:TEMP\ug-shot.png", $url) -RedirectStandardError "$env:TEMP\ug-shot-log.txt" -Wait -NoNewWindow
```

- (1) 에 `Uncaught`, `Error`, `TypeError` 가 보이면 고친다. `127.0.0.1` 이 없는 줄 (Edge 확장 프로그램 로그) 은 무시한다.
- (2) 의 `$env:TEMP\ug-shot.png` 를 이미지 보기 도구 (Read 등) 로 **직접 열어서** 의도한 화면인지 확인한다.
- `--virtual-time-budget=5000` 은 페이지 시간을 5초 흘려보낸 뒤 결과를 낸다. 생성·애니메이션이 더 걸리면 숫자를 늘린다.
- 헤드리스에서는 클릭·키 입력을 할 수 없다. 특정 화면을 보려면 3.5 의 디버그 해시를 쓴다.
- URL 에 `#`, `&` 가 들어가므로 PowerShell 에서는 작은따옴표로 감싼다.

### 3.5 디버그 해시 (0-4 에서 만들고 단계마다 늘린다)

URL 뒤에 `#debug=...` 를 붙이면 initialize 직후 해당 화면으로 바로 들어간다. 저장 데이터는 건드리지 않는다. 해시가 없으면 평소처럼 타이틀부터 시작한다.

| 해시 | 동작 | 만드는 단계 |
|---|---|---|
| `#debug=menu` | 메인 메뉴 | 1단계 |
| `#debug=slots` | 저장 슬롯 화면 | 1단계 |
| `#debug=settings` | 설정 화면 | 1단계 |
| `#debug=ascii&floor=5&seed=3` | 던전 글자 지도 (`dungeonToAscii`) 와 칸 수·재시도·보스 공터 id. 콘솔에도 출력 | 2단계 |
| `#debug=view&floor=1&seed=3&theme=lava` | 던전 전체를 위에서 내려다보는 카메라 (안개·천장 숨김, 던전이 화면에 꽉 차는 높이). `theme` 를 빼면 backrooms. 화면 왼쪽 위와 콘솔에 draw calls·삼각형·geometries·textures·programs 수 표시 | 4단계 |
| `#debug=view&...&eye=1` | 1인칭 시점 (눈높이 1.7m). `&at=` sanctuary (기본, 새 게임 시작 위치) / merchant / portal / stairsDown / stairsUp / clearing / boss 로 장소를 고르고, `&yaw=` `&pitch=` (도) 로 시선을 바꾼다 | 4단계 |
| `#debug=view&...&light=0.05` | `view.setLightLevel(0.05)` 적용 (백룸 보스 "정전" 모습 확인) | 4단계 |
| `#debug=viewDispose&floor=5&seed=7` | 4-9 dispose 확인: 테마 5종 view 를 만들고·그리고·지운 뒤 10번 더 반복하고 `renderer.info.memory` 비교 → 화면·콘솔에 `결과: OK / NG` | 4단계 |
| `#debug=game&floor=1&seed=3&theme=cave` | 저장하지 않는 새 게임 상태로 바로 1인칭 진입 (`&noOverlay=1` 이면 "클릭하여 계속" 숨김 + 게임 시간 진행, `&fakeLock=1` 이면 포인터 락 없이 잠긴 것으로 취급해 키보드·마우스 조작 가능 — 자동 확인용) | 5단계 |
| `#debug=game&...&menu=map` | 시스템 메뉴의 해당 탭 (map / status / inventory / skill / system) 을 연 상태 | 6단계~ |
| `#debug=game&...&reveal=1` | 현재 층의 모든 칸을 방문한 것으로 취급 (지도 탭의 아이콘·벽 확인용) | 6단계 |
| `#debug=game&...&at=stairsDown` | 해당 장소 (stairsDown / stairsUp / portal / merchant / clearing / boss / sanctuary) 앞에서 시작. 위치·시선은 `#debug=view&eye=1&at=` 과 같다 (`debugViewpoint`). 그 층에 없는 장소면 성소 | 7단계 |
| `#debug=game&...&noMonsters=1` | 몬스터를 만들지 않음 (풍경 확인용, 층을 옮겨도 계속) | 8단계 |
| `#debug=game&...&monster=br_lamp` | 주인공 앞 8m 에 해당 몬스터 1마리만 생성 (`&elite=1` 이면 정예). 시작한 층만 해당, 층을 옮기면 평소대로 생성. 기본 시작 위치 (성소) 에서는 몬스터가 성소 안에 놓이므로 공격받으려면 `&at=stairsDown` 등을 함께 쓴다 | 8단계 |
| `#debug=game&floor=5&...&at=boss` | 보스 층 (5의 배수) 의 보스 공터 남쪽 방 칸에서 시작 (공터 3×3 구역 안이라 바로 보스 전투). 정예·둥지·보스는 `&monster=` 없이 열 때만 생성된다 | 10단계 |
| `#debug=game&...&monster=br_boss` | 보스도 1마리만 주인공 앞에 놓을 수 있다. 보스 공터 밖이면 구역 없이 감지 거리 (14m) + 시야로 전투하고, 안 보인 지 10초면 돌아간다 (외형·패턴 확인용) | 10단계 |
| `#debug=game&...&level=20` | 레벨·스탯 포인트·스킬 포인트를 해당 레벨 기준으로 채움 (`&skills=all` 이면 모든 스킬 Lv1 활성) — 둘 다 11단계에서 구현 (`debugSetLevel`) | 11·14단계 |
| `#debug=game&...&items=1` | 인벤토리에 소모품 21종 각 5개 + 장비 12개 (1~3단계 × 일반·마법·희귀 8개 + 마법 반지·대검·방패·지팡이, 같은 시드면 같은 장비, `debugFillInventory`). `&menu=inventory` 와 함께 쓴다 | 12단계 |
| `#debug=game&...&drops=1` | 주인공 앞 3m 에 바닥 아이템 6개 (골드·장비 일반/마법/희귀·하급 생명력 물약·화염병, `spawnDebugDrops`). 넓은 곳 (`&at=clearing`) 에서 쓴다 | 12단계 |
| `#debug=game&...&shop=1` | 상점 화면을 연 상태 (`&at=merchant` 와 함께. 에릭이면 열리지 않음). `&at=merchant` 는 상점 칸 카운터 앞 (칸 중심에서 입구 쪽 2.4m, 상인까지 3.6m 라 "클릭: 거래하기" 범위 안) 에서 상인을 본다 | 15단계 |
| `#debug=game&...&hero=eric` | 에릭으로 시작 (없으면 마틴). 에릭 던전·화면·몬스터 확인용. `#debug=ascii`·`#debug=view` 에도 붙이면 에릭 던전 (17-1). 에릭 층은 어둠·캐비닛·서랍장이 있고, `&monster=br_boss` 처럼 테마 보스를 붙이면 에릭 모드로 주인공 앞 8m 에 놓인다 (19단계) | 16·17·19단계 |
| `#debug=...&fps=1` | (어느 디버그 화면에나 붙인다) 오른쪽 위에 FPS·프레임당 갱신 시간·그리기 시간 (GL 명령을 보내는 CPU 시간, GPU 시간 아님)·draw call·삼각형·몬스터 수. 0.5초마다 평균, 값은 `debugRuntime().perf` 로도 읽는다 | 20단계 |

### 3.6 사용자 확인

헤드리스로 확인할 수 없는 항목 (조작감, 드래그, 포인터 락 등) 은 0절 "사용자 확인 대기" 에 적고, 작업 보고 때 사용자에게 **무엇을 어떻게 확인하면 되는지** 구체적으로 알려준다.
예: "저장소 폴더에서 `npm start` 실행 → 브라우저로 http://127.0.0.1:9806/ 접속 → 게임 시작 → 빈 슬롯 클릭 → 예 → 화면 클릭 후 W 키로 전진되는지 확인 (끝나면 터미널에서 Ctrl+C 로 서버 종료)"

---

## 4. 코드 작성 규칙 (undergrounds.js)

### 4.1 섹션 구조

파일은 아래 배너로 나눈다 (부록 D 골격에 이미 있다). 새 코드는 알맞은 섹션의 **끝**에 추가한다. 배너 문자열은 바꾸지 않는다 (검색에 쓴다).

```
// ===== [01] 상수 =====
// ===== [02] 유틸리티 =====
// ===== [03] 다국어 =====
// ===== [04] 데이터 - 스킬 =====
// ===== [05] 데이터 - 아이템·장비 =====
// ===== [06] 데이터 - 몬스터·상태이상 =====
// ===== [07] 공식 (스탯·전투·경험치) =====
// ===== [08] 던전 생성 =====
// ===== [09] 게임 상태·저장 =====
// ===== [10] 렌더링 - 공용 (텍스처·재질) =====
// ===== [11] 렌더링 - 던전 =====
// ===== [12] 입력 =====
// ===== [13] 플레이어 =====
// ===== [14] 몬스터·전투·투사체 =====
// ===== [15] 스킬 실행 =====
// ===== [16] 아이템 사용·드롭·상점 =====
// ===== [17] UI - 공용 =====
// ===== [18] UI - 메뉴 화면 =====
// ===== [19] UI - HUD =====
// ===== [20] UI - 시스템 메뉴 =====
// ===== [21] 메인 (initialize·루프) =====
// ===== [22] 내보내기 =====
```

- 최상위에서 **바로 실행되는 코드** (`const` 데이터 정의 등) 는 자기보다 위에 정의된 것만 쓸 수 있다. 함수 선언 (`function f() {}`) 은 어디서든 호출할 수 있지만, 그 함수가 쓰는 `const` 값은 호출되는 시점에 이미 정의되어 있어야 한다.
- [22] 내보내기 섹션은 항상 파일 맨 끝에 둔다.

### 4.2 큰 파일 편집 요령

- 파일 전체를 새로 쓰지 않는다 (0-2 의 골격 교체 1회만 예외). 검색 (Grep) 으로 위치를 찾아 부분 수정 (Edit) 한다.
- 수정할 때마다 `node --check` 를 실행한다.
- 함수 하나는 100줄 이하를 권장한다. 길어지면 나눈다.
- 같은 기능의 함수를 두 번 만들지 않는다. 추가하기 전에 비슷한 이름이 이미 있는지 검색한다.

### 4.3 이름·단위 규칙

- 함수·변수는 camelCase, 상수는 UPPER_SNAKE_CASE, 주석은 한국어.
- 데이터 id: 스킬은 AGENTS.md 코드 그대로 (`BA`, `M0`~`M9`, `A0`~`A9`, `D0`~`D9`, `S0`~`S9`, `X1`~`X4`). 몬스터는 AGENTS.md 의 id 그대로 (`br_shade` 등). 테마는 `backrooms, brick, cave, lava, void`. 아이템은 영문 소문자 + 숫자 (6.5). 주인공은 `martin` (마틴), `eric` (에릭) (2026-10-24, 16-1).
- 용어 (2026-10-24 AGENTS.md): "계단" 은 "엘리베이터" 로 바뀌었다. 코드의 조각 종류·역할·함수 이름 (`stairsUp`, `stairsDown`, `stairsFront`, `stairsStep1`, `stairsStep2`, `stairsProgress`, `STAIRS_*` 등) 과 디버그 해시 `&at=stairsDown` 은 **그대로 쓴다** (저장 데이터·테스트·기록과 맞추기 위해, U37). 화면에 보이는 글자만 "엘리베이터" 로. 이 문서의 지나간 작업 기록에 나오는 "계단" 은 당시 구현을 가리키므로 고치지 않는다.
- **퍼센트 규칙**: 데이터 표·게임 상태·화면 표시의 % 값은 "퍼센트 숫자" 로 저장한다 (8% → `8`). 계산할 때 `/ 100` 한다.
  예외: 이름이 `Reduction`, `Multiplier`, `Scale` 로 끝나는 함수의 반환값은 0~1 비율 또는 배율이다 (`physReduction(23, 1)` → `0.277`). 몬스터 표의 HP·공격·방어 "배수" 는 배율 (`hpMul: 0.7`) 이다.
- 시간은 초, 거리는 m (Three.js 1 = 1m), 각도는 라디안. AGENTS.md 의 각도 (°) 는 `deg * Math.PI / 180` 로 바꾼다.
- 난수: 저장·재현이 필요한 생성 (던전, 상인 재고) 은 `createRng(seed)` 를 쓴다. 전투 판정·연출·드롭·몬스터 배치는 `Math.random()` 을 써도 된다. **던전 생성 코드 안에서는 `Math.random()` 금지.**

### 4.4 좌표계 (헷갈리기 쉬움)

- 월드: X+ = 동, X− = 서, Z+ = 남, **Z− = 북**, Y+ = 위. Three.js 카메라는 회전이 0 일 때 Z− (북) 를 바라본다.
- 던전 칸 (gx, gz) 은 월드 `x ∈ [gx×16, gx×16+16)`, `z ∈ [gz×16, gz×16+16)` 를 차지한다. 칸 중심 = `(gx×16+8, gz×16+8)`. 바닥 y = 0, 천장 y = 10.
- 방향: `N = (0, −1)`, `E = (1, 0)`, `S = (0, 1)`, `W = (−1, 0)` (gx, gz 증가량).
- 시선 각 yaw: `yaw = 0` 이 북쪽. 앞 벡터 = `(−sin(yaw), 0, −cos(yaw))`, 오른쪽 벡터 = `(cos(yaw), 0, −sin(yaw))`. 방향 → yaw: `N: 0, W: π/2, S: π, E: −π/2`.
  카메라: `camera.rotation.order = 'YXZ'; camera.rotation.set(pitch, yaw, 0);`
- 지도 (2D): 화면 위쪽 = 북 (gz 가 작을수록 위).
- **스킬 트리 좌표는 반대로 y+ 가 위쪽**이다 (AGENTS.md). 화면에 그릴 때 `screenY = −y`.

### 4.5 UI 규칙

- UI 는 DOM 으로 만들어 `app.uiRoot` 안에 넣는다. 모든 UI 좌표·크기는 **1920×1080 기준 px** 로 쓴다. (창 크기에 맞춘 확대·축소는 `fitStage` 가 처리)
- 화면에 나오는 모든 글자는 `t('키')` 로 가져온다. 키를 추가할 때 `I18N.ko` 와 `I18N.en` 양쪽에 넣는다. (몬스터·테마·스킬·아이템 이름은 데이터의 `nameKo` / `nameEn` 을 현재 언어에 맞게 고른다)
- 게임 중 HUD 는 `ug-hud` 클래스 요소 안에 둔다 (마우스 이벤트가 통과된다). 메뉴·대화상자는 그 위에 겹친다.
- HUD 처럼 매 프레임 바뀌는 DOM 은 **값이 달라졌을 때만** `textContent` / `style` 을 바꾼다 (이전 값을 저장해 비교).
- 비활성 이유를 툴팁으로 보여줘야 하는 버튼에는 `disabled` 속성을 쓰지 않는다 (disabled 버튼은 클릭 이벤트가 오지 않는다). `is-disabled` 클래스로 회색 처리하고 클릭 핸들러에서 분기한다.
- 글꼴 (AGENTS.md "개발 시 준수사항", 2026-10-17 추가): 기본 글꼴은 `.ug-stage` 에 `'Pretendard', 'Noto Sans KR', 'Noto Sans', 'D2Coding', sans-serif` 로 지정되어 있다. 수치·숫자·코드는 `.ug-num` 클래스 (`'D2Coding', 'Nanum Gothic Coding', monospace`) 를 붙인다. **문장 안에서 동적으로 바뀌는 숫자는 별도 행 (요소) 으로 분리**해 `.ug-num` 을 적용한다 (예: "HP" 글자와 `87 / 100` 숫자는 다른 요소). 글꼴 파일은 `www/css/fonts.css` (HTML 이 불러옴) 에서 온다.

### 4.6 자원 해제

층 이동·메인 메뉴 복귀 때 장면에서 뺀 객체의 `geometry.dispose()`, `material.dispose()`, `texture.dispose()` 를 호출한다. 여러 메시가 함께 쓰는 공용 재질·텍스처 (테마 텍스처, 몬스터 종류별 공유 재질) 는 게임이 끝날 때까지 유지한다.
확인 방법: 층을 여러 번 이동해도 `app.renderer.info.memory.geometries` 가 계속 늘지 않아야 한다.

### 4.7 `__TEST__` 내보내기

순수 함수·데이터 테이블을 만들면 [22] 섹션의 `__TEST__` 객체에 추가한다. 자체 테스트가 찾는 이름 (부록 A) 은 정확히 아래 이름이어야 한다.

`createRng, expToNext, killExp, physReduction, createNewGameState, calcDerivedStats, SKILLS, SKILL_LINKS, CONSUMABLES, EQUIP_BASES, THEMES, MONSTER_TYPES, pickNextTheme, applyFloorChange, generateDungeon, getSpawn, floorHeightAt, buildCellBoxes, readSlot, writeSlot, deleteSlot, loadSettings, saveSettings, parseDebugHash, dungeonToAscii`

3단계에서 테스트 "데이터 세부·공식" 과 함께 추가한 이름: `AFFIXES, RING_ENGRAVINGS, STATUS_EFFECTS, RARITIES, WEAPON_TYPES, affixSlotOf, SKILL_NEIGHBORS, costAtLevel, itemLevelScale, consumablePrice, consumableSellPrice, monsterBaseStats, monsterRewardMultiplier, elementMultiplier, equipStats, makeEquipInstance`

- **아직 게임 코드에서 쓰지 않는 상수·함수도 `__TEST__` 에 넣는다.** 그렇지 않으면 ESLint `no-unused-vars` 오류로 `npm test` 가 실패한다. (3단계의 `POTION_COOLDOWN`, `BLOCK_REDUCTION`, `BOSS_CC_SLOW_PCT` 등이 이 이유로 들어 있다. 나중 단계에서 실제로 쓰게 되어도 지우지 않아도 된다)

4단계에서 테스트 "계단 디딤판 높이", "그리기용 상자" 와 함께 추가한 이름: `THEME_VISUALS, stairStepBoxes, collectDungeonBoxes, cellWallFaces, STAIRS_DEPTH, WALL_Y0` (THREE·document 를 쓰는 `buildDungeonView` 는 Node 에서 실행할 수 없으므로 디버그 해시 3.5 로 확인한다)

5단계에서 테스트 "이동 충돌", "소모품 개수·재사용 대기 키" 와 함께 추가한 이름: `moveWithCollision, countConsumable, itemCooldownKey`. 그리고 브라우저 자동 확인용 `debugRuntime()` (현재 `{ game, input, camera, screenName }`. Playwright 에서 `await import('/js/undergrounds.js')` 로 같은 모듈을 불러 읽는다 — 페이지가 불러온 모듈과 같은 인스턴스다)

6단계에서 테스트 "저장·불러오기 왕복", "지도 배치" 와 함께 추가한 이름: `serializeState, deserializeState, mapLayout, MAP_W, MAP_H, MAP_CELL_MIN, MAP_CELL_MAX`

7단계에서 테스트 "층 이동 트리거", "층 런타임 스냅샷" 과 함께 추가한 이름: `stairsProgress, collectFloorTriggers, floorTriggerAt, TRIGGER_FLOOR_CHANGE, STAIRS_TRIGGER_PROGRESS, PORTAL_TRIGGER_RADIUS, snapshotFloorRuntime, restoreFloorRuntime`. `debugRuntime()` 에 `renderer` 추가 (`renderer.info.memory` 로 4.6 확인)

7단계 보완 (2026-10-18 층 정보 저장 규칙) 에서 테스트 "층 이동 기록 (층 정보 저장 규칙)", "층 기록 불변 조건", "기록의 방문 칸 압축", "이전 형식 저장 데이터" 와 함께 추가한 이름: `makeFloorRecord, ensureNextFloor, encodeVisited, decodeVisited` (`HISTORY_LIMIT` 는 삭제)

8단계에서 테스트 "피해 계산", "경험치·레벨업", "몬스터 배치 계획", "몬스터 상태·보상 배수", "몬스터 길찾기", "몬스터 투사체" 와 함께 추가한 이름: `computeDamage, monsterAttacker, grantExp, planFloorMonsters, createMonsterState, monsterRewardMuls, canSpawnMonsterIn, MONSTER_DENSITY, MONSTER_NO_SPAWN_DIST, ELITE_MUL, cellDistances, findCellPath, knockMonster, updateProjectiles, spawnDebugMonster` (`knockMonster` 는 14단계까지 게임 코드에서 쓰지 않음, `spawnDebugMonster` 는 브라우저 자동 확인용). "몬스터 투사체" 테스트는 3D 없이 가짜 런타임 (`{ dungeon, view: { collision, ceiling }, player, derived, … }`) 으로 `updateProjectiles` 를 돌린다 — 다른 런타임 함수도 이렇게 시험할 수 있다.

9단계에서 테스트 "상태이상 적용", "지속 피해·시간 감소", "버프·둔화와 파생 수치" 와 함께 추가한 이름: `applyEffect, tickEffects, effectMagnitude, isDisabled, addBuff, tickBuffs, applyStatusToPlayer, applyStatusToMonster, STATUS_ICON, BLEED_DEFAULT_DOT_PCT` (`applyStatusToMonster` 는 12·14단계까지 게임 코드에서 쓰지 않음). 가짜 런타임을 쓰는 테스트는 주인공에 `effects: []` 가 있어야 한다 (8단계 "몬스터 투사체" 테스트의 준비물에 추가함).

10단계에서 테스트 "정예 확률·공터 둥지 배치", "보스 배치·공터 구역", "작은 개체·런타임 스냅샷", "광선·부채꼴·보스 HP 단계 판정", "외형·특수 행동·보스 패턴 표", "유도 투사체" 와 함께 추가한 이름: `eliteChance, planNestMonsters, planBoss, bossZoneOf, inBossZone, segmentHitsPlayer, inCone, bossHpMarkReached, monsterDisplayName, MONSTER_MODELS, MONSTER_BEHAVIORS, BOSS_PATTERNS, ELITE_CHANCE, NEST_COUNT, SMALL_MUL, SPLIT_CHILD_REWARD_MUL`. 자체 테스트는 "유도 투사체" 용으로 `three.module.min.js` 도 직접 import 한다 (가짜 런타임에 진짜 `Vector3`).

2026-10-22 사용자 지시 (몬스터 배회, U33) 에서 테스트 "몬스터별 배회 방식 표", "배회 범위", "배회" 와 함께 추가한 이름: `MONSTER_WANDER, WANDER_RANGE_CELLS, wanderAreaCells, cellBfs, monsterWander, wanderLeaders, updateMonsters` (`updateMonsters` 는 브라우저 자동 확인에서 시간을 빨리 흘리는 용도: `g.paused = true` 로 실제 루프를 멈추고 `g.time += dt; updateMonsters(g, dt)` 반복)

11단계에서 테스트 "스테이터스 탭 표시 값", "스탯 포인트 사용·디버그 레벨", "다국어 키 (한국어·영어 같은 키)" 와 함께 추가한 이름: `statusTabModel, spendStatPoint, STAT_IDS, debugSetLevel, I18N`

12단계에서 테스트 "장비 생성", "장비 가격", "인벤토리 조작", "드롭 계획·바닥 아이템 기록", "소모품 효과", "상세 정보 문구·디버그 인벤토리" 와 함께 추가한 이름: `generateEquipment, rollEquipTier, equipRarityWeights, equipPrice, equipSellPrice, AFFIX_PREFIX, RARE_NAME_FIRST, RARE_NAME_SECOND, CONSUMABLE_DESC, addItem, removeItemAt, consumeConsumable, equipItem, unequipItem, moveInventoryItem, setActionSlot, swapActionSlots, planMonsterDrops, rollConsumableId, ITEM_DROP, BOSS_DROP, useConsumable, throwBaseDamage, recallDestination, isValidItem, isValidDropItem, affixLabel, affixValueText, equipBaseLines, debugFillInventory`. "소모품 효과" 테스트는 가짜 런타임 (`{ state, dungeon, derived, cooldowns, buffs, visited, uiEvents, recall, dead, player: { effects, statusImmune, exhausted, isPlayer, pos, yaw, pitch } }`, `view` 없음 → 떠오르는 글자 생략) 으로 `useConsumable` 을 돌린다 (투척물은 3D 가 필요해 브라우저 자동 확인).

16단계에서 테스트 "주인공 (hero) 상태·저장 형식", "저장 가능 영역", "아이템 버리기", "조준 상호작용" 과 함께 추가한 이름: `HEROES, DEFAULT_HERO, isHeroId, elevatorLayout, collectInteractables, isElevatorInterior, ELEVATOR_LEN, ELEVATOR_PANEL_Y, findInteractable, INTERACT_RANGE, INTERACT_ANGLE_DEG, canSaveHere, discardItemAt`. 계단과 함께 `stairStepBoxes, STAIRS_DEPTH, stairsProgress, STAIRS_TRIGGER_PROGRESS` 는 삭제했다 (테스트 "던전 - 계단 바닥 높이"·"계단 디딤판 높이" 는 "던전 - 엘리베이터"·"조준 상호작용" 으로 바뀜).

13단계에서 테스트 "스킬 활성화·레벨 업 규칙", "스킬 트리 배치·상태·스크롤·설명문" 과 함께 추가한 이름: `canLearnSkill, learnSkill, skillNodePos, skillNodeState, skillLinkState, clampSkillScroll, skillDescParts, fmtSkillValue, SKILL_TREE_SIZE, SKILL_TREE_ORIGIN, SKILL_NODE_GAP`

14단계에서 테스트 "스킬 실행 공통", "피격 훅", "순간이동·조준 지점·돌진 경로·탐험가의 감각" 과 함께 추가한 이름: `castSkill, SKILL_HANDLERS, skillCost, canPaySkill, skillCooldownFor, applyPlayerStatus, hitPlayer, damagePlayer, knockPlayer, blinkTarget, aimGroundPoint, segmentPointDist, revealCellsAround, revealFacilities, SKILL_BUFF_STYLE, SKILL_MIN_COOLDOWN`, 그리고 브라우저 자동 확인용 `updateGame` (`g.paused = true` 로 실제 루프를 멈추고 `g.paused = false; updateGame(g, 0.05); g.paused = true` 를 반복하면 느린 SwiftShader 에서도 시간이 고정 간격으로 흐른다). 가짜 런타임으로 `castSkill` 을 시험할 때는 `skillTimeline, buffs, cooldowns, zones, effects, monsters` 와 주인공의 `invulnUntil, dash` 가 있어야 한다 (몬스터가 없으면 피해 숫자 (canvas) 를 만들지 않아 Node 에서 돈다). 8·10단계 "몬스터 투사체"·"유도 투사체" 테스트의 가짜 런타임에 `zones, buffs, cooldowns` 를 더했다 (기대값은 그대로).

15단계에서 테스트 "방랑 상인 재고", "방랑 상인 구매·판매·품절 유지", "상인 상호작용" 과 함께 추가한 이름: `generateMerchantStock, merchantStockOf, MERCHANT_STOCK, consumableRoom, maxBuyCount, buyConsumable, buyEquipment, sellPriceOf, sellItem, merchantLayout, MERCHANT_INTERACT_RANGE`. 상인 상호작용 테스트의 가짜 런타임은 `{ state: { hero }, currentCell, view: { interactables }, player: { pos, yaw, pitch } }` (상인 카운터의 충돌 상자는 3D 를 만들 때 생기므로 Node 에서는 위치를 직접 정한다).

2026-10-25 AGENTS.md (상점 1×1·주변 3칸) 에서 테스트 "상점 주변 3칸 = 몬스터가 들어갈 수 없는 칸", "불러오기 시작 위치" 와 함께 추가한 이름: `monsterBarred, MERCHANT_SAFE_CELLS, playerStartPosition`

17단계에서 테스트 "던전 생성 - 마틴 결과 고정", "던전 생성 - 에릭", "에릭 가구 배치", "에릭 가구 상호작용 대상", "캐비닛 숨기·나오기", "서랍형 장롱" 과 함께 추가한 이름: `planEricFurniture, ERIC_FURNITURE, ERIC_INTERACT_RANGE, DRAWER_SLOT_Y, enterCabinet, exitCabinet, useDrawer, drawerItem, interactLabelKey, playerTargetable, isValidDrawersTaken, HIDE_YAW_LIMIT`. 에릭 가짜 런타임 (테스트의 `ericRuntime`) = 진짜 던전·가구 계획·상호작용 목록 + 상태만 기록하는 view (`openDrawer`·`isDrawerOpen`·`setCabinetHidden`), 주인공의 `pos`·`vel` 은 THREE.Vector3 (`placePlayer` 가 쓴다).

18단계에서 테스트 "에릭 새 게임·플래시·배터리 데이터", "플래시 켜고 끄기·에너지·배터리 자동 교체·0.5초 뒤 꺼짐", "주인공별 메뉴 탭·에릭 어둠 값" 과 함께 추가한 이름: `TOOLS, FLASH_ENERGY_MAX, FLASH_DEAD_ON_TIME, newFlashState, toggleFlashlight, tickFlashlight, menuTabsOf, ERIC_MENU_TABS, ERIC_DARK`

22단계 (2026-10-25 AGENTS.md 변경) 에서 테스트와 함께 추가한 이름: `stackMaxOf, ERIC_STACK_MAX, GLOWSTICK, isValidGlowsticks, dropGlowstick, isElevatorLockedFor, useCardReader, useInteractable, CARD_READER_Y, pickWarpDestination, startFadedWarp, updateFadedWarp, fadedWarpFade, FADED_WARP, calmEricMonster, hasLineOfSight`. 23단계에서 추가한 이름: `footstepRange, ERIC_FOOTSTEP, updateEricSenses, hearFootstep`. 20단계에서 추가한 이름: `TOOL_DESC, MENU_TABS, EQUIP_SLOT_KEYS, itemTypeKey` (번역 누락 검사의 동적 키 정의역), `introFrame, INTRO_TIMING, INTRO_LINE_KEYS` (이야기 장면).

19단계에서 테스트 "에릭 몬스터 생성 계획", "에릭 몬스터 시야", "에릭 노이즈 단계", "에릭 몬스터 행동" 과 함께 추가한 이름: `planEricMonsters, ericMonsterSees, ericNoiseLevel, setupEricMonster, updateEricMonster, ericReach, ERIC_MONSTER, ERIC_SIGHT, ERIC_NOISE`. "에릭 몬스터 행동" 의 가짜 런타임 = `{ state (에릭), dungeon, view: { collision, wallVisualHeight }, monsters, time, dead, inSanctuary, inElevator, hiding, flash, derived: { runSpeed }, buffs, cooldowns, recall, hurtAt, player: { pos (Vector3), yaw, pitch, invulnUntil, effects } }` 로 `updateEricMonster` 를 0.05초씩 돌린다 (`damagePlayer` 가 `buffs`·`cooldowns`·`recall` 을 읽는다)

---

## 5. 미정 사항과 임시 결정

AGENTS.md 에 없거나 해석이 갈리는 부분이다. 사용자가 확정하면 "상태" 를 `확정` 으로 바꾸고 내용을 고친다. 확정 전에는 임시 결정대로 구현하되, 나중에 바꾸기 쉽게 상수나 함수 하나에 모아 둔다.

| ID | 내용 | 임시 결정 | 상태 |
|---|---|---|---|
| U1 | 몬스터 설계 | AGENTS.md "몬스터" 단락 (2026-10-17 작성) 을 따른다 | 확정 |
| U2 | 주인공 사망 처리 | "쓰러졌습니다" 화면 → [마지막 저장에서 다시 시작] / [메인 메뉴]. 저장 이후의 진행은 사라짐 | 미확인 |
| U3 | 행동 슬롯 중 "활성화된 슬롯" 을 고르는 방법 | 숫자키 1~7, 마우스 휠 (위 = 이전, 아래 = 다음). 시작 시 1번 활성 | 미확인 |
| U4 | "조건부 3인칭" 의 조건 | **조건 (2026-10-25 사용자 답)**: 특정 스킬을 사용하면 그 스킬의 유효시간 동안 3인칭으로 전환된다 (끝나면 1인칭으로 돌아옴). **아직 구현하지 않는다 (보류)** — 어떤 스킬이 3인칭으로 바꾸는지, 카메라 거리·벽 처리·주인공 모델 표시는 정해지지 않았다. 구현할 때의 기존 초안 (20-5): 카메라를 주인공 뒤 4m · 위 1.5m, 벽에 가리면 앞으로 당김, 주인공 모델 (남성, 트레이닝복 차림을 도형으로) 표시. 스킬 효과 표 (AGENTS.md) 에는 3인칭 전환 스킬이 없으므로 그 스킬이 정해질 때 AGENTS.md 에도 들어가야 한다 | 조건 확정·구현 보류 |
| U5 | 성소 "주위 1칸 범위" | 성소 중심 (분수) 칸에서 가로·세로·대각선 1칸 = 3×3 성소 구역 9칸 (`cell.sanctuaryZone === true`). 4방향 통로 칸은 포함하지 않음 | 미확인 |
| U6 | 시스템 메뉴·상점이 열려 있을 때 게임 시간 | 일시정지 (몬스터·투사체·재사용 대기·버프 시간 모두 멈춤) | 미확인 |
| U7 | 바닥에 떨어진 아이템·골드 줍는 방식 | 1.5m 안에 들어가면 자동으로 줍기. 인벤토리가 가득 차면 줍지 않고 안내 문구 | 미확인 |
| U8 | 지나온 층으로 돌아갈 때 지형 | AGENTS.md "던전 구성요소" 의 층 정보 저장 규칙 (2026-10-18 변경): 지나온 층·미리 정한 다음 층은 테마·지형·지도 유지 (위·아래 모두), 포탈은 전부 초기화, 몬스터·시체는 현재 층·이전 층만 유지 → U16~U19·U24 참고 | 확정 |
| U9 | 새 게임 시작 직후 저장 | 즉시 해당 슬롯에 저장 (성소에서 시작하므로 저장 규칙에 맞음). 사망 시 돌아갈 지점이 됨 | 미확인 |
| U10 | 지도에서 "방문하지 않은 칸은 흐림 처리" | 칸 윤곽만 불투명도 0.25 로 표시, 벽·아이콘은 숨김 | 미확인 |
| U11 | 성소끼리 "20칸 이상 거리" 를 재는 방법 | 성소 중심 칸끼리의 맨해튼 거리 `|Δgx| + |Δgz| ≥ 20` | 미확인 |
| U12 | 장비 옵션 "물리 공격력 +%", "마력 +%" 의 적용 위치 | 각각 물리 피해 % 보너스, 마법 피해 % 보너스에 더한다 (AGENTS.md 전투 공식 2번의 합산 대상) | 미확인 |
| U13 | "막다른 벽" 구성 요소 | 1칸짜리 막다른 통로 조각 `deadEnd` + 연결되지 않은 출입구는 벽으로 막음. 블록 수를 목표에 정확히 맞출 때도 사용 | 미확인 |
| U14 | 층의 블록 수 | 정확히 `min(512, 127 + 층 번호)` 칸 | 미확인 |
| U15 | 새 게임 (지하 1층) 의 테마 | 백룸 고정 ("맨홀에 빠져 눈을 뜨니 낯선 공간" 스토리와 연결). 2026-10-24 부터 마틴·에릭 공통 (U38) | 미확인 |
| U16 | 새로 정하는 층의 테마를 고르는 방법 | 이웃한 (먼저 정해진) 층의 테마를 뺀 4종 중 무작위: 미리 정하는 다음 층 = 현재 층의 테마를 뺌, 기록이 없는 위층으로 올라갈 때 = 떠나는 층의 테마를 뺌, 포탈 = 떠나는 층의 테마를 뺌. 이렇게 하면 이웃한 두 층은 항상 테마가 다르다 (AGENTS.md "던전 테마" 2026-10-18 문구) | 미확인 |
| U17 | 위층으로 올라갔다가 **다시 아래층으로 내려갈 때** | (2026-10-18 AGENTS.md 로 확정) 이미 갔던 층이므로 그대로 (시드·테마·방문 칸·상인 품절·보스 처치). 다음 층은 미리 정해 저장한다 (내려가면 그 아래층까지). 포탈은 맨 위층까지 모든 층 기록을 지우고 현재 층·다음 층을 새로 정한다. (옛 결정: 다시 내려가면 새 층, 포탈로 떠난 층은 기록 안 함) | 확정 |
| U18 | 층 기록을 몇 층까지 보관하나 | (2026-10-18 AGENTS.md "모두 저장" 으로 확정) 개수 제한 없음 (`HISTORY_LIMIT` 삭제). 무한 던전이라 저장 데이터가 커지므로 기록의 방문 칸은 압축 문자열로 저장한다 (7-8, 방법은 임시 결정). 목표: 1000층 기록에 슬롯당 1MB 이하. (옛 결정: 위로 50층까지) | 확정 (압축 방법은 미확인) |
| U19 | "몬스터나 시체 등" 의 범위와 유지 | (2026-10-18 사용자 확정) 몬스터·시체·바닥에 떨어진 아이템을 **현재 층과 바로 이전 층** (현재 층으로 오기 직전에 있던 층, 위·아래 어느 쪽이든) 만 유지하고 저장 데이터에도 넣는다 — 계단을 오가며 몬스터를 피하는 것 방지. 현재 층은 저장할 때 `world.runtime`, 이전 층은 그 층 기록의 `runtime`. 그 밖의 지나온 층에 다시 들어가면 몬스터를 새로 생성. 처치한 보스는 다시 나오지 않음. 포탈 직후에는 이전 층이 없다. (옛 결정: 바로 위층만, 현재 층은 저장 안 함) | 확정 |
| U20 | 왜곡된 차원 테마에서 "공중에 떠 있는 바닥" 의 가장자리 | 떨어지지 않는다. 벽 대신 높이 1.2m 대리석 난간을 그리고, 충돌은 다른 테마와 같은 벽 상자 (보이지 않는 벽) 를 쓴다 | 미확인 |
| U21 | (2026-10-24 엘리베이터로 바뀌며 해결: 모든 칸의 그리기용 난간 1.2m, 엘리베이터는 자체 벽·천장 (4.4m) 이 있다, 16-3) 왜곡된 차원 테마의 계단 칸 난간 높이 (U20 의 1.2m 난간만으로는 위 계단을 오를 때 (최대 +5m) 난간이 발밑으로 내려가 보이지 않는 벽만 남음) | 위 계단 칸 (step1·step2) 의 그리기용 벽은 1.2 + 6 = 7.2m 까지 그린다. 아래 계단 칸은 난간 1.2m 그대로 두고 바닥판 아래 (y −7) 까지 그려 공중에 매달린 홈처럼 보이게 한다. 그 외 칸의 그리기용 벽은 바닥판 아래 (y −1) 로는 그리지 않는다 | 미확인 |
| U22 | 저장 실패 (localStorage 용량 초과·비공개 모드 등) 시 처리 | 토스트 "저장하지 못했습니다. 브라우저 저장 공간을 확인하세요." 성소 안에서 [메인 메뉴] 를 눌렀는데 저장에 실패하면 메인 메뉴로 나가지 않는다 (진행이 사라지지 않도록). 새 게임 즉시 저장 (U9) 이 실패하면 안내만 하고 게임은 계속 | 미확인 |
| U23 | 포인터 락이 ESC 가 아닌 이유 (Alt+Tab, 창 전환 등) 로 풀릴 때 | 6-1 의 규칙대로 ESC 와 똑같이 시스템 메뉴를 연다 (일시정지). 브라우저가 이유를 알려주지 않으므로 구별하지 않는다 | 미확인 |
| U24 | 보스를 처치한 보스 층 (5의 배수) 에서 포탈을 타면 | 포탈은 그 층을 초기화하므로 새 층으로 취급한다 → 보스 처치 기록도 사라지고 새 보스 공터에 보스가 있다 (그 층의 테마 보스). AGENTS.md "처치한 보스는 다시 나타나지 않는다" 는 같은 층 (초기화되지 않은 층) 에 다시 들어갈 때의 규칙으로 해석 | 확정 (2026-10-18 사용자) |
| U25 | 성소 구역 안에 있는 주인공을 몬스터가 어떻게 대하나 (AGENTS.md 는 "몬스터가 들어올 수 없고 투사체가 사라진다" 만 정함) | 감지하지 않고 공격도 하지 않는다 (경계 밖에서 휘두르는 근접 공격도 없음). 추적 중이던 몬스터는 "안 보이는 것" 으로 취급해 4초 뒤 돌아간다. 성소에서 쉬는 동안 경계에 몬스터가 붙어 기다리지 않게 하기 위함 (`playerTargetable`) | 미확인 |
| U27 | 피해량이 정해지지 않은 출혈 (몬스터 위상 추적자의 "물리 + 출혈 25%") 의 초당 피해 | 원래 피해의 10% (화상과 같은 비율, `BLEED_DEFAULT_DOT_PCT`). 스킬 출혈 (A7 깊은 상처) 은 스킬 수치대로 | 미확인 |
| U32 | 거미줄 (동굴 거미·거미 여왕) 의 둔화 지속 시간을 냉기 저항으로 줄이나 | 줄이지 않는다 (냉기가 아닌 원인. `applyStatusToPlayer(g, 'slow', { resPct: 0 })`) | 미확인 |
| U33 | 몬스터 대기 상태의 배회 (2026-10-22 사용자 지시: "몬스터의 행동은 테마가 아닌 몬스터마다 달라야 하고, 기본 몬스터들은 주변 10칸 내에서 배회하다 플레이어가 보이면 접근해 공격. 정예와 보스는 나중에 구상") | **확정 부분**: 일반 몬스터는 생성 칸에서 칸 길 거리 10칸 안을 배회하다 주인공이 보이면 (감지 14m + 시야, 기존 규칙) 다가가 공격. **임시 결정 (미확인)**: ① 배회 범위 = 생성 칸에서 몬스터 생성 금지 칸 (성소 구역·상인 방·계단·포탈) 을 지나지 않고 10칸 안에 닿는 칸 (`wanderAreaCells`). ② 배회 방식은 몬스터마다 `MONSTER_WANDER[id] = { speed (이동 속도 대비), pause [초], leg [한 번에 가는 칸 수] }` (예: 박쥐는 쉬지 않고, 골렘은 6~10초 쉬고, 위상 추적자는 3~6칸씩 넓게) — 같은 테마 안에서도 모두 다르다. 포자 버섯 (이동 0)·보스는 배회하지 않음. ③ 무리 (고블린·박쥐) 는 우두머리 (uid 가 가장 작은 대기 몬스터) 가 정한 칸으로 함께 간다. ④ 공터 둥지 몬스터 (`nest`) 는 그 공터 3×3 안에서만 따로 배회 (둥지를 지킨다). ⑤ 추적 포기 후 "원래 위치" = 추적을 시작한 자리 (`home`, 없으면 생성 위치). 배회 때문에 생성 위치까지 멀 수 있어서. ⑥ 48m 밖 대기 몬스터도 0.25초마다 몰아서 배회만 갱신 (감지·특수 행동 없음). ⑦ 정예는 일반 몬스터와 같은 AI 라 그대로 배회 (정예·보스 동작은 사용자가 나중에 구상, 그때까지 손대지 않음). 2026-10-22 사용자가 실제 게임에서 배회·조우 동작을 확인함 (①~⑦ 세부를 하나씩 확정한 것은 아님) | 일부 확정 |
| U34 | 스테이터스 탭의 표시 자릿수 (AGENTS.md: "화면 표시는 정수, 확률·% 는 소수 1자리") | 그대로 따르되, 공격 간격은 소수 2자리 (0.76초), 이동 속도·자연 회복량은 소수 1자리 (5.2 m/s, 0.4 /초) — 정수로 하면 1초·5 m/s·0 /초처럼 차이가 보이지 않아서. 물리 공격력 6.9 는 규칙대로 7 | 미확인 |
| U35 | 소모품 사용 세부 (12-7, AGENTS.md 에 없는 값) | ① 전투 영약·주문서의 재사용 대기 = 1초 (`ITEM_MISC_COOLDOWN`, AGENTS.md 는 "각자 독립" 만 정함. 우클릭을 누르고 있으면 계속 쓰이므로 한 번에 여러 개가 사라지지 않게). ② 전투 영약 3종은 하나의 버프 (`item:elixir`) — 다른 단계를 써도 겹치지 않고 마지막 것으로 갱신. 활력 물약 중급·상급도 하나의 버프 (`item:stamina`). ③ 빙결·기절 중에는 소모품도 쓸 수 없다 (인벤토리 [사용] 포함). ④ HP·MP 가 가득해도 물약을 쓸 수 있다 (소모됨). ⑤ 약초학 (S1) 의 회복량 % 는 생명력·마나 물약과 성수의 HP 회복에 적용 (활력 물약은 100% 라 의미 없음). ⑥ 귀환 주문서: "피격" = 몬스터 공격·범위 피해 (`damagePlayer` 의 quiet 가 아닌 피해). 화상·중독 같은 지속 피해로는 취소되지 않음. 층을 옮기면 취소 (소모 안 됨). 도착 = 가장 가까운 (칸 맨해튼 거리) 성소 중심의 남쪽 칸 중심, 분수 (북) 를 바라봄. ⑦ 투척물: 시작 속도 14 m/s (위아래 조준 포함), 중력 10 m/s², 수평 15m 에 닿으면 그 자리 (공중이어도) 에서 터진다. 폭발·지대 피해는 벽 너머 몬스터에게 닿지 않음 (시야 판정). 피해는 물리·마법 % 를 받지 않고 모든 피해 % (영약)·속성 % (숙련 패시브) 만 받음, 치명타 없음 (`computeDamage` 의 kind `'item'`). 불타는 지면·독 구름은 0.5초마다 그 몫 (초당 20%·35%) 의 피해, 독 구름은 틱마다 중독 1중첩 (최대 5). 불타는 지면은 용암 웅덩이와 같은 바닥 원 재질 | 미확인 |
| U36 | 드롭·줍기·인벤토리 세부 (12-4·12-5·12-6) | ① 분열한 작은 마그마 슬라임도 일반 몬스터 드롭 규칙 (AGENTS.md 는 경험치·골드만 ×0.3), 보스 소환수·새끼 거미 (소환수) 는 없음. ② 드롭 위치: 몬스터 주위 0.5~0.9m (보스 1.2~2m) 에 고르게 흩고, 벽에 닿으면 0.35m 밖으로 민다. ③ 바닥 상자 색: 장비 = 등급 색 (납작한 상자), 소모품 = 분류 색 (세운 상자, 투척물은 속성 색). ④ 가득 차서 못 주우면 "인벤토리가 가득 차서…" 안내를 그 아이템 1.5m 안에 들어갈 때마다 한 번. ⑤ 인벤토리 칸끼리 드래그할 때 같은 소모품이면 합친다 (20개까지), 아니면 교환. 장착 칸 → 다른 장비가 든 칸 = 같은 부위면 교체, 아니면 빈칸으로 해제. 반지 칸끼리 = 교환. ⑥ 행동 슬롯 클릭 = [행동 슬롯에서 해제] [취소] 메뉴. 행동 슬롯의 스킬 상세 정보는 이름·레벨만 (자세한 것은 13단계 스킬 탭). ⑦ 소모품은 1개씩 쓸 때 같은 id 의 마지막 칸부터 줄인다. ⑧ 장비를 버리는 기능은 없다 (AGENTS.md 에 없음) | 미확인 |
| U37 | 계단 → 엘리베이터 (2026-10-24 AGENTS.md "던전 구성요소 (공통)") 의 구현 방식 | **확정 (2026-10-24 사용자): 엘리베이터는 1칸 크기, 남은 공간은 복도형 통로.** 조각 구조는 그대로 3칸 = 앞 통로 (`stairsFront`) + 복도형 통로 (`stairsStep1`, 다른 복도와 같은 모습·장식) + **엘리베이터 1칸 (`stairsStep2`)**. 엘리베이터 문 = step1 과 step2 의 경계, 내부 = 폭 6m (통로 폭) · 깊이 11m (경계 8m + 막힌 끝 벽까지 3m), 안쪽 끝 벽에 층 버튼 판, 문 위 바깥쪽에 층 표시등 (위층 ▲ / 아래층 ▼). 바닥은 평평 (높이 0 — 옛 ±6m 경사·디딤판·끝 평면은 16-3 에서 없앰). **"엘리베이터 내부" = step2 1칸**: 저장 가능 영역 (U47), 에릭의 몬스터는 들어오지 못함. (16-3 ~ 16-5 의 첫 구현은 step1·step2 2칸 (27m) 이었고 16-9 (2026-10-25) 에서 1칸으로 고쳤다. AGENTS.md 의 "3칸으로 구성 (엘리베이터 바로 앞 1칸 크기의 통로 포함)" 과도 맞다) 안에서 저장할 수 있어야 하므로 "들어가면 바로 이동" 하지 않고, 안쪽 버튼 판을 조준해 클릭 ("클릭: 아래층으로 / 위층으로", 17-4 의 상호작용) 하면 문이 닫히는 연출 + 어두워짐 (0.4초) 뒤 층 이동. 도착은 AGENTS.md 문구대로 그 층의 반대 엘리베이터 조각의 앞 통로 (지금의 `getSpawn` 과 같음). 마틴의 몬스터가 엘리베이터에 들어오는지는 AGENTS.md 에 없어 지금 그대로 (조각 3칸 모두 생성만 금지). 코드 id 는 그대로 (4.3). U21 (void 계단 난간) 은 16-3 에서 해결 | 일부 확정 (1칸 크기는 확정, 문·버튼 판 클릭 이동 등 세부는 미확인) |
| U38 | 주인공 선택 (2026-10-24 AGENTS.md "게임 슬롯") | 빈 슬롯 확인 대화상자의 문구 아래에 [마틴] [에릭] 선택 버튼 (처음엔 마틴 선택), 그 아래 [예] [아니오]. 저장 데이터 최상위에 `hero` ('martin' \| 'eric'). `hero` 가 없는 이전 저장 데이터 = 마틴. 슬롯 카드 요약 줄에 주인공 이름 (예: "마틴 · 지하 7층 · 동굴 · Lv 12", 에릭은 Lv 없이). 스토리 (맨홀에 빠짐) 와 지하 1층 테마 (U15 백룸) 는 둘 다 같음. 영어 이름 Martin / Eric | 미확인 |
| U39 | 에릭 던전 생성 (2026-10-24 AGENTS.md "던전 구성요소 (공통)") | `generateDungeon(seed, floor, hero)` — 마틴은 지금과 완전히 같은 결과 (기존 저장 데이터의 층이 바뀌지 않게). 에릭: 포탈·상인 없음, 지하 1층 = 시작 성소 1곳만 (추가 성소 없음), 지하 2층부터 성소 없음 (시작 조각 십자형), 5의 배수 층의 보스 공터 없음 (공터는 일반 구성요소로만 생김). 블록 수·복도·엘리베이터·막다른 벽 규칙은 같음. "각 구성요소의 갯수는 제한이 따로 없음" (복도) 은 지금 생성기 (개수 제한 없이 가중치로만 고름) 와 같다. 가구 (캐비닛·서랍형 장롱) 는 던전 구조와 따로 `planEricFurniture` 가 시드로 정한다 (U40) | 미확인 |
| U40 | 캐비닛·서랍형 장롱 세부 (AGENTS.md "던전 특징 (에릭)") | 캐비닛: 일자형·ㄱ자형 조각마다 1/4 확률로 1개, 조각의 가운데 칸 벽면에 통로를 향해 놓는다. 8개 미만이면 남은 일자형·ㄱ자형 조각에서 무작위로 더 놓아 8개 (조각이 모자라면 있는 만큼). 약 1.2 × 0.8 × 2.2m, 충돌 상자. 상호작용 = 왼쪽 클릭 (조준 30°·2.5m). 안: 카메라는 캐비닛 안에서 문 쪽을 보고, 화면은 검은 막 + 가운데의 작고 얇은 가로 틈 (CSS), 이동·점프·행동 슬롯 불가, 시점은 좌우 ±40°·위아래 ±15° 만, 피해 없음, 플래시는 꺼지고 안에서는 켤 수 없음. 서랍형 장롱: ㅏ형·십자형 조각마다 1/2 확률로 1개, 가운데 칸 벽면, 위·아래 서랍 2칸. 첫 클릭 = 그 칸 열림, 열린 칸 클릭 = 안의 아이템 가져가기 (없으면 "비어 있음"). 내용물 (시드 고정): 칸마다 50% 빈칸, 나머지는 배터리 45% / 하급 활력 물약 35% / 탐색 주문서 20% (에릭은 몬스터에게 한 번에 쓰러지므로 생명력 물약은 넣지 않는다, U43). 가져간 칸은 층 기록 `drawersTaken` 에 저장 (층 이동·저장 후에도 빈 칸), 열림 상태는 저장하지 않음. (17단계 구현 세부: 서랍형 장롱 1.2 × 0.6 × 1.2m, 서랍 칸 높이 위 0.85m·아래 0.32m, 열면 0.4m 나옴, 상호작용 2.5m·30°. 십자형은 가운데 칸에 벽이 없어 벽이 있는 팔 칸 중 하나에 놓는다. 가구 id = 조각 id. 숨은 동안 그 캐비닛 메시를 감추고 HUD 막의 틈 = 720 × 40px (1920×1080 기준). 나오면 캐비닛 앞 1.1m. 가구가 붙은 벽면에는 테마 장식을 놓지 않음) **(2026-10-25 AGENTS.md 변경 → 장롱 배치·내용물은 U52 로 바뀜: 일자형·ㄱ자형 조각에도 1/4, 층마다 16개 이상, 내용물 새 표 — 22-1. 캐비닛 규칙은 그대로)** | 미확인 |
| U41 | 플래시·배터리 데이터와 토글 (AGENTS.md "던전 특징 (에릭)", "아이템 > 에릭 전용 아이템") | 플래시 = 인벤토리 아이템 `{ kind: 'tool', id: 'flashlight' }` (1칸, 겹치지 않음, 신규 획득·판매·버리기 불가, 인벤토리 칸 이동·행동 슬롯 등록/해제는 가능). 배터리 = 소모품 `battery` (`CONSUMABLES` 에 분류 `battery`, 1칸 20개, 직접 [사용] 불가 — 에너지가 0 이 될 때 자동). 에너지 `state.player.flashEnergy` (초, 시작 300, 저장), 켜짐 상태는 런타임 (불러오면 꺼짐). 행동 슬롯 `{ type: 'item', id: 'flashlight' }` 로 시작 (1번). 우클릭은 **누르는 순간에만** 토글 (AGENTS.md "누르고 있으면 계속 사용" 을 토글에 적용하면 깜빡이므로). 에너지는 켜진 동안 초당 1 감소. 플래시가 행동 슬롯에서 해제되어도 아이템은 인벤토리에 남는다. (18단계 구현 세부: 배터리는 단계 0·`hero: 'eric'` — 마틴의 드롭 (단계 1~3 에서만 고름)·상점 (분류 목록 고정)·디버그 채우기에 나오지 않음. 배터리는 행동 슬롯에 등록하지 않는다. 숨은 동안·빙결·기절 중에는 켜지 않음. 행동 슬롯 칸에는 "플래" + 켜지면 ON) **(2026-10-25 AGENTS.md 변경: 행동 슬롯 사용이 우클릭 → 왼쪽 버튼 (U58, 21-2), 배터리는 장롱에서 낮은 확률·층마다 4개 이상·여러 개여도 1칸 (U52·U53, 22단계))** | 미확인 |
| U42 | 에릭의 어둠·보이는 거리 (AGENTS.md "던전이 어둡다 … 앞 2칸 … 10칸 … 플래시 7칸 (부채꼴) … 20칸") | **확정 (2026-10-24 사용자)**: 플래시 없이 앞 2칸 (32m) 까지 보이고, 그 밖은 **지형까지 잘 안 보일 정도로 어둡게**, 10칸 (160m) 이후는 보이지 않음 / 플래시는 정면 부채꼴로 7칸 (112m) 까지 보이고 그 밖은 같은 정도로 어둡게, 20칸 (320m) 이후는 보이지 않음 (1칸 = 16m 그대로). **구현 임시안 (미확인)**: 보이는 범위를 조명으로 만든다 — 테마 주변광·반구광·시설 조명을 아주 낮게 (어둠 영역은 윤곽만 겨우 보이는 밝기), 주인공 둘레 점광원 = 반경 32m 에서 꺼지는 빛, 플래시 = 정면 ±30° SpotLight (112m 에서 꺼짐), 안개 = 검은색 (플래시 꺼짐: 32m 부터 160m 까지 / 켜짐: 112m 부터 320m 까지, 카메라 far 도 그만큼). 지금 마틴의 손전등은 에릭에게 쓰지 않는다. 정확한 밝기는 스크린샷을 보고 정하고 사용자 확인 (18-5). (18-3 구현값: 주변광 + 반구광 세기 합 0.025 — 테마마다 배율을 달리해 같은 어둠, 시설 조명·발광 장식도 같은 배율 / 둘레 빛 세기 12·32m / 플래시 SpotLight 세기 120·112m·±30°·반그림자 0.35 / 카메라 far = 안개 끝 + 10m) | 일부 확정 |
| U43 | 에릭의 몬스터 (AGENTS.md "에릭 특별 규칙": 보스급 1~2기, 느린 배회, 발견 시 달리기 속도로 추적) | **확정 (2026-10-24 사용자)**: 공격은 한 방에 주인공을 사망시키는 위력 → 명중하면 방어·저항·받는 피해 % 와 상관없이 그때의 HP 전부만큼 피해 (`damagePlayer`, 화면 붉게 → 사망 화면). **임시 결정 (미확인)**: 종류 = 그 층 테마의 보스 외형 (2기면 둘 다 같은 종류), 수 = 1 또는 2 (각 50%). 처치할 수 없고 (공격 수단 없음) 피해가 한 방이라 레벨·HP·공격력 수치는 쓰지 않는다 (레벨은 층 번호로 기록만). 보스 패턴은 쓰지 않는다. 배회 = 층 전체에서 무작위 칸을 골라 길찾기로 이동, 속도 2.5 m/s (주인공 걷기 5.1 m/s 의 약 절반). 추적 = 주인공의 그때 달리기 속도. 4초 동안 안 보이면 추적 해제 → 그 자리에서 다시 배회 (돌아가기 없음). 엘리베이터 내부 (1칸)·성소 구역에 들어가지 못하고, 그 안의 주인공은 노리지 않는다 (U25 의 성소와 같이 문 밖에서 휘두르지도 않음 → 4초 뒤 추적 해제). 공격 = 근접 1가지 (사거리 몸 반지름 + 1.5m, 예비 동작 0.5초 — 피할 틈, 예비 동작 중 캐비닛에 들어가거나 사거리를 벗어나면 빗나감). 시체·드롭·경험치 없음. 생성 위치 = 주인공 도착 칸에서 칸 길 거리 8칸 이상. (19단계 구현 세부: 충돌 반지름 상한 1.5m (몸은 보스 크기 그대로 — 6m 통로·모퉁이를 지나가도록), 사거리는 그려진 몸 반지름 + 1.5m. 공격 뒤 1.2초 쉼. 추적 중 안 보이면 마지막으로 본 자리로 간다 (주인공 위치를 몰래 알지 않음 — 시야를 끊고 숨을 수 있게). 배회 목표 = 층 전체의 생성 가능 칸 (엘리베이터 조각·성소·포탈 칸 제외) 중 무작위, 5초 동안 1m 도 못 가면 다른 칸. 용암 군주처럼 원래 움직이지 않는 보스도 같은 속도로 움직인다. 몬스터는 2기여도 함께 다니지 않는다) **(2026-10-25 AGENTS.md 변경: 발소리를 듣고 다가가는 의심 모드 추가, 추적 해제 4초 → 8초, 캐비닛에 8초 숨으면 의심·추적 모두 해제 → U57, 23단계에서 반영함 (2026-10-25))** | 일부 확정 |
| U44 | 에릭의 몬스터 시야 (AGENTS.md "시야 계산이 필요", "플래시 불빛 발견 시 추적") | 몬스터 정면 120° 안, 거리 = U42 의 "플래시 없이 보이는 거리" (2칸 = 32m) 안, 벽에 가리지 않으면 주인공을 본다. 플래시가 켜져 있으면 ① 주인공이 몬스터 정면 120° 안 20칸 안에서 벽에 가리지 않거나 (불빛이 보임) ② 몬스터가 플래시 부채꼴 (±30°, 20칸) 안에 있고 주인공에게서 벽에 가리지 않으면 (불빛에 비침) 발견. 캐비닛 안의 주인공은 어떤 경우에도 보지 못한다. 마틴의 감지 (14m, 무리 전체) 는 그대로. (19-3 구현: 시야 판정은 0.1초마다, 벽은 눈높이끼리의 선분 (`hasLineOfSight`). 주인공이 엘리베이터 내부·성소 구역·캐비닛 안이면 판정하지 않음 (`playerTargetable`)) | 미확인 |
| U45 | 에릭의 노이즈 3단계 (AGENTS.md "주위 20칸 / 10칸 / 추적 모드", 2026-10-25) | **확정 (2026-10-25 사용자, AGENTS.md 수정)**: 1단계 ≤ 20칸, 2단계 ≤ 10칸, 3단계 = 추적 당하는 중. 거리 = 주인공과 가장 가까운 몬스터의 직선 거리 ÷ 16m (칸). (19-4 때 값: 1단계 ≤ 10칸, 2단계 ≤ 5칸) 3단계 = 추적 당하는 중 (거리와 상관없이). 화면 전체에 흑백 노이즈 (canvas, 작은 해상도로 그려 늘림, 매 프레임 갱신) 를 겹친다. 불투명도 1단계 0.06 / 2단계 0.12 / 3단계 0.2 (+ 3단계는 가장자리 살짝 어둡게) — 3단계도 화면이 잘 보이게 상한 0.2. 심장 두근거림 소리는 사운드 구현 때 (20-8). (19-4 구현: 노이즈 캔버스 320×180 을 화면 크기로 늘림 (네모난 입자), 매 프레임 새로 그림, 일시정지 중에는 멈춤, 가장자리 어둡게는 반지름 55% 바깥부터 최대 45% 검게. 노이즈는 다른 HUD 아래·캐비닛 막 위) **(2026-10-25 AGENTS.md 변경: 2단계 문구가 "주위 5칸" → "주위 10칸" 으로 바뀌어 1단계 ("주위 10칸", 노이즈 약함) 와 거리가 같아졌다. 같은 날 사용자가 1단계를 "주위 20칸" 으로 고쳐 확정 → 23-4 에서 20칸 / 10칸으로 바꿈)** | 확정 |
| U46 | 에릭의 상태·화면 (AGENTS.md "레벨업 불가·공격 수단 없음", 스테이터스·스킬 탭 없음) | 레벨 1 고정 (경험치 없음), 기본 스탯 5/5/5 와 마틴의 파생 수치 공식을 그대로 써서 최대 HP 100·스태미너 100 (자연 회복 있음). 장비 없음 (장착 칸 숨김, 시작 장비도 없음 → 걷기 5.1 m/s). 몬스터에게는 한 방에 쓰러지고 (U43) MP 는 쓰지 않으므로 HUD 에서 HP·MP 막대·레벨·경험치·골드를 숨기고, 스태미너 막대·플래시 에너지 (막대 + 남은 초)·배터리 개수를 보여준다. 시작 소지품 = 플래시 + 배터리 1 (하급 생명력 물약 없음), 행동 슬롯 1번 = 플래시. 소모품 (서랍에서 얻은 물약·주문서) 은 마틴과 같이 쓴다. 시스템 메뉴 탭 = 지도·인벤토리·시스템. 인벤토리 탭은 소지품 + 행동 슬롯만. 사망 = 마틴과 같음 (U2). (18-4 구현: HUD 왼쪽 아래 = 스태미너 + 플래시 에너지 막대 (켜지면 밝게, N / 300) + 배터리 ×N. 인벤토리 탭은 장착 칸 자리만큼 소지품·행동 슬롯을 왼쪽으로. 에릭도 스킬 데이터 `{ BA: 1 }` 는 저장 형식 때문에 남지만 쓰지 않는다) | 미확인 |
| U47 | 저장 가능 영역 (AGENTS.md "시스템" 탭, 2026-10-24 두 번째 수정) | **확정 (2026-10-24 사용자)**: 저장 가능 영역 = 성소 구역 (주위 1칸) **또는 엘리베이터 내부** (엘리베이터 1칸 = `stairsStep2`, U37. 16-9 에서 1칸으로 고침). 마틴·에릭 공통. [메인 메뉴]: 이 영역 안 = 저장 후 바로 메인 메뉴, 밖 = 저장 없이 나가기 확인 (AGENTS.md 문구). [저장] 버튼: AGENTS.md 의 그 줄은 아직 "성소 영역에서만" 이지만 사용자 말씀대로 같은 영역 (성소 또는 엘리베이터 내부) 에서 활성으로 한다. 비활성 이유 툴팁 = "성소 주변이나 엘리베이터 안에서만 저장할 수 있습니다." HUD 안내도 엘리베이터 안이면 "엘리베이터 — 저장 가능". 엘리베이터 내부는 저장만 되고 성소의 회복·상태이상 해제·몬스터 차단 (마틴) 은 없다. 에릭은 지하 2층부터 성소가 없으므로 엘리베이터에서 저장한다 | 일부 확정 |
| U48 | 아이템 버리기 (AGENTS.md "플래시는 … 판매하거나 삭제할 수 없다" 로 미루어 다른 아이템은 삭제 가능하다고 해석) | 인벤토리의 소모품 메뉴와 장비 상세 정보에 [버리기] → 확인 대화상자 ("…을(를) 버리시겠습니까? 되돌릴 수 없습니다", 소모품은 묶음 전체) → 없앰 (바닥에 떨어뜨리지 않음). 장착 중인 장비는 해제한 뒤에만, 플래시는 버릴 수 없음 (회색 + 이유 툴팁). 마틴·에릭 공통 | 미확인 |
| U49 | 스킬 효과 세부 (14단계, AGENTS.md 표에 없는 값·해석) | ① 깊은 상처 (A7) = 앞 1마리 (강타·처형처럼 한 대상의 상처로 해석), 출혈 총 피해 = 물리 N% (방어 무시·치명타 없음) 를 5초에 나눔. ② 근거리 공격형 (A0~A9) 과 방패 강타 (D1) 는 근접 물리 (무기 숙련 A2 의 근접 % 적용), 판정 = 근접 무기의 사거리·각도 (완드·지팡이면 맨손 2.0m / 60°). 단일 대상은 범위 안에서 크로스헤어에 가장 가까운 1마리, 없으면 헛스윙 (자원·재사용 대기는 소모). ③ 원소 부여 (X1) 추가 피해 = 기본 공격 (근접·마력탄)·근거리 공격형 스킬 적중 때 (방패 강타·반격 제외). ④ 숙련 패시브의 범위: M5 빙결 확률 = 모든 냉기 피해, M5 둔화 +%p = 냉기로 거는 둔화 (얼음 창·눈보라·원소 부여), M2 화상 피해 % = 주인공이 거는 모든 화상 (화염병 포함), M8 감전 확률 +%p = 모든 전격 피해 (기본 확률이 없는 번개 폭풍·원소 부여도 그 확률로), M8 감전 받는 피해 +%p = 주인공이 거는 모든 감전 (천둥 폭탄 포함). ⑤ 연쇄 번개: 튕길 때마다 ×0.9 (곱), 다음 대상 = 지금 대상에서 8m 안 (벽에 가리지 않은) 가장 가까운 적, 처음 대상이 없으면 번개만. ⑥ 화염구는 30m 안에 닿지 않으면 폭발 없이 사라짐. "조준 지점" = 조준선이 바닥에 닿는 점 (최대 30m), 벽·천장에 먼저 닿으면 그 앞 바닥. ⑦ 유성 낙하는 화상 없음 (표에 "+ 화상" 없음). 불타는 지면·눈보라는 0.5초마다 그 몫 (불타는 지면은 치명타 없음). ⑧ 번개 폭풍: 0.5초마다 주인공 주위 12m 안 (벽에 가리지 않은) 무작위 적 1마리 자리에 낙뢰, 그 반경 2m 의 적 모두. ⑨ "넉백·경직 면역" (칼날 폭풍·수호 태세): 주인공은 경직이 없어 넉백 면역만. 칼날 폭풍 이동 속도 −30% = 배율 ×0.7. ⑩ 돌진: 36 m/s, 지나간 자리 (몸 반지름 + 0.3m) 의 적에게 한 번씩, 벽에 막히면 정지, 돌진 중 WASD 없음. ⑪ 처형 "피해 2배" = 맞기 전 HP 기준 계수 2배, 반환 = 그때 남은 재사용 대기의 50%. ⑫ 위협의 함성: 벽과 상관없이 10m, 공격력 감소는 보스 포함·공포는 보스 제외 (정예는 공포). ⑬ 가시 갑옷 반사 = 몬스터 공격력 × 공격 계수 (방어·저항 전) × N%, 방어·저항 무시. "근접 공격" = 몬스터 근접 공격 + 보스 근접 패턴 (결재 도장·철퇴 휘두르기·휩쓸기), 반격 (X2) 도 같음. ⑭ 마력 보호막은 지속 피해도 흡수, 다 깎이면 사라짐. ⑮ 불굴의 발동 대기는 재사용 대기 감소를 받지 않음. 무적 중에는 피해·몬스터 공격의 상태이상 없음. ⑯ 응급 처치·마나 샘은 약초학 (물약 회복량) 을 받지 않음. 재생의 기운은 자연 회복과 별도로 초당 최대 HP N%. ⑰ 순간이동: 수평 조준 방향, 0.2m 간격으로 벽·시설 충돌 상자·던전 밖 직전까지. ⑱ 임시 성역: 바닥의 금색 원 (반경 4m), 적 투사체는 원에 들어오면 사라짐 (광선은 못 막음), 원 안에 있을 때만 0.5초마다 회복. ⑲ 시간 왜곡: 6초 동안 주인공을 따라다니는 12m 범위 — 범위 안에 든 적은 끝날 때까지 둔화 N% (보스 포함), 적 투사체는 한 번 느려지면 그대로. ⑳ 탐험가의 감각 "주변 (1 + Lv)칸" = 맨해튼 거리 (탐색 주문서와 같음), 칸이 바뀔 때마다. Lv3·Lv5 "위치 표시" = 층에 들어올 때 그 시설의 지도 아이콘 칸을 방문 처리. ㉑ 자원이 모자라면 실패 + HUD 슬롯 0.35초 붉게, 모자란 동안 슬롯 글자 흐리게. 마나 샘 중 MP 소모 −30% 는 소수점 유지. ㉒ 스킬 버프 HUD 아이콘 글자 (`SKILL_BUFF_STYLE`: 뇌·칼·수·가·보·막·정·재·속·샘·부·왜). ㉓ 방패 막기 (AGENTS.md "보조장비 > 막기", 지금까지 없었음) 를 함께 구현: 정면 ±60° 에서 오는 근접 (몬스터 위치)·투사체 (날아온 방향) 공격을 막기 확률로 막아 피해 −70%, "막기" 글자. 주인공에게 경직이 없으므로 막은 공격의 넉백·기절은 그대로 | 미확인 |
| U50 | 방랑 상인·상점 세부 (15단계, AGENTS.md 에 없는 값) | ① 상호작용: 상점 칸 (2026-10-25 부터 1×1) 안에서 상인 인형 (가슴 높이 1.5m, 칸 중심에서 입구 반대쪽 1.2m) 과 4m · 조준 30° 안 → HUD "클릭: 거래하기", 왼쪽 클릭으로 상점. 에릭이면 상인이 없는 것으로 (17-1 에서 상인 조각 자체가 없어짐). ② 상점은 시스템 메뉴처럼 일시정지·포인터 락 해제, 닫으면 "클릭하여 계속". ESC·[닫기] 로 닫고 TAB 은 무시. ③ 재고의 장비 단계 = 등장 가능한 단계 중 균등 무작위 (드롭의 60/30/10 이 아님 — AGENTS.md "등장 가능한 단계 중 무작위"). 그 외 소모품 4종의 단계 = 그 분류의 등장 가능한 단계 중 무작위 1개. 소모품 표시 순서 = 생명력 → 마나 → 활력·치료제·투척물·영약·주문서 순. ④ 수량: 구매 [1] [5] [최대 (골드·공간 중 작은 쪽)], 판매 [1] [5 (6개 이상일 때)] [모두]. 장비는 [구매] / [판매] 한 번 더 누름, 희귀 장비 판매만 확인 대화상자. ⑤ 판매 탭은 인벤토리 40칸 그대로 (장착 칸은 없음 — 장착한 장비는 해제한 뒤 판다). 플래시 (에릭) 는 팔 수 없음. ⑥ 인사말은 상점을 열 때마다 3종 중 무작위. ⑦ (15단계 확인 때 정함) 상점에서 ESC 는 팝업이 열려 있어도 상점 전체를 닫는다 (시스템 메뉴와 같음). 팝업은 바깥 클릭으로 닫힘. 구매 탭의 상세 정보는 인벤토리와 같은 내용 (판매가 줄 포함) + 구매가 줄 | 미확인 |
| U51 | 방랑 상인 상점 1×1·"몬스터는 상점 주변 3칸 이내로 접근하지 않음" (2026-10-25 AGENTS.md "던전 구성요소 (공통)") | **AGENTS.md 문구 (확정)**: 상점은 1×1, 입구 한 방향. **임시 결정 (미확인)**: ① 상점 칸 = 방형 (16×16m 방, 출입구 쪽 변만 6m 문), 그 안 가운데에 지금의 천막·카운터·상인 (입구를 바라봄). ② "주변 3칸 이내" = 상점 칸에서 가로·세로·대각선 3칸 (체비쇼프 거리 ≤ 3, 7×7 = 상점 칸 포함 최대 49칸, 실제 던전에서는 평균 14칸) — 성소 "주위 1칸" (U5, 3×3) 과 같은 재는 법. 벽으로 막혀 있어도 그 범위 안의 칸은 모두 포함 (`cell.merchantZone`). ③ 몬스터는 이 칸들에 생성되지 않고, 들어가지 못하며 (이동·순간이동·밀려남·넉백 모두), 길찾기·배회도 지나가지 않는다 — 성소 구역과 같은 처리 (`monsterBarred`). 단 성소와 달리 주인공을 노리는 것은 그대로 (범위 밖에서 보이면 추적·원거리 공격, 범위 경계에서 멈춤, 4초 안 보이거나 28m 멀어지면 돌아감). 몬스터 투사체도 사라지지 않는다 (AGENTS.md 에 없음). ④ 보스 (공터 중앙)·둥지 (공터 3×3) 자리가 이 범위와 겹치지 않도록 생성할 때 상점 칸과 공터 3×3 방 칸 사이를 체비쇼프 거리 4 이상 띄운다 (`merchantClearingOk`, 생성 재시도는 늘지 않음 — 360개 표본에서 4 → 6회). ⑤ 이 변경으로 같은 시드라도 던전 지형이 바뀐다 (상점 크기가 생성 순서에 영향) → 이전 저장 데이터를 불러오면 지형·방문 칸이 달라질 수 있고, 저장 위치가 벽 안·던전 밖이면 성소에서 시작한다 (`playerStartPosition`) | 일부 확정 |
| U52 | 서랍형 장롱 배치·내용물 (2026-10-25 AGENTS.md "던전 특징 (에릭)": 일자형·ㄱ자형에도 1/4, 한 층에 16개 이상, 배터리 낮은 확률 (층마다 4개 이상 반드시), 야광봉, 카드키 매우 낮은 확률 (층마다 반드시 1개), 빛 바랜 주문서 매우 낮은 확률) | **배치**: ㅏ형·십자형 조각 1/2 + 일자형·ㄱ자형 조각 1/4 (캐비닛과 따로 굴림 — 같은 조각에 둘 다 오면 가운데 칸의 서로 다른 벽 변에), 16개 미만이면 남은 4종 조각에서 무작위로 보충 (조각이 모자라면 있는 만큼). 캐비닛 (8개 이상) 은 그대로. **내용물**: 칸마다 50% 빈칸, 나머지는 야광봉 40 / 배터리 20 / 하급 활력 물약 20 / 탐색 주문서 15 / 빛 바랜 주문서 5 ("낮은"·"매우 낮은" 확률의 해석. 하급 활력 물약·탐색 주문서는 U40 의 임시 결정을 이어 둠). **보장**: 배터리가 4개 미만이면 빈칸 (없으면 활력 물약·탐색 주문서 칸) 을 무작위로 배터리로 바꿔 4개, 카드키는 무작위 장롱의 빈칸 1곳 (없으면 아무 칸) 에 정확히 1개. 모두 층 시드로 정함 (`planEricFurniture`, 저장 안 함, 가져간 칸만 `drawersTaken`) — 이 변경으로 기존 에릭 저장 데이터의 장롱 내용·위치가 바뀐다 (22-1 구현: 확인해 보니 지하 1~30층은 굴림 기대값이 9~12개라 거의 항상 16개로 보충된다. 장롱은 캐비닛과 같은 조각이면 같은 칸의 다른 벽 변) | 미확인 |
| U53 | 에릭 전용 아이템의 겹치기·버리기 (AGENTS.md "여러 개를 들고 다녀도 인벤토리 1칸만", "카드키는 여러 개를 들고 다닐 수 없다") | 배터리·야광봉·빛 바랜 주문서 = 같은 아이템끼리 1칸에 개수 제한 없이 (소모품 20개 상한의 예외, `STACK_MAX` 대신 아이템별 상한). 카드키 = 1개만 — 이미 있으면 장롱에서 가져가지 않고 안내 ("카드키는 하나만 가질 수 있습니다"), 칸은 그대로 남음. 카드키는 버릴 수 없음 (층마다 1개뿐이라 버리면 그 층에서 내려갈 수 없게 됨, 회색 + 이유). 배터리·야광봉·빛 바랜 주문서는 버릴 수 있음 (U48 그대로). 에릭은 상점이 없어 판매 없음. 행동 슬롯 등록: 야광봉·빛 바랜 주문서 가능, 배터리·카드키 불가 (22-2 구현: "개수 제한 없이" = 1칸 최대 999개 (`ERIC_STACK_MAX`). 카드키·배터리는 [사용] 회색 + 이유 툴팁 (카드키: "내려가는 엘리베이터 오른쪽의 카드 리더기에 찍어 씁니다"), 카드키 [버리기] 회색) | 미확인 |
| U54 | 야광봉 (AGENTS.md "던전 특징 (에릭)") | 사용 = 행동 슬롯 (21단계 뒤 왼쪽 버튼) → 1개 소모, 발밑 (주인공 앞 0.6m 바닥) 에 활성 야광봉, 재사용 대기 1초. **빛**: 주위 2칸 (32m) 을 밝힘 — 조명 개수를 바꾸지 않는 규칙 (8절 16번) 때문에 에릭 층에 야광봉용 PointLight 4개를 늘 두고 주인공에게 가까운 야광봉 4개에 배정, 나머지는 발광 재질만 (가까이 가면 빛이 옮겨 감). **멀리서도 보임**: 야광봉 메시는 안개를 받지 않는 발광 재질 + 카메라 far 를 넉넉히 (지형은 검은 안개에 묻혀 그대로 안 보임), 벽·장애물에 가리면 깊이 판정으로 안 보임. **유지**: 현재 층 `world.glowsticks: [{ x, z }]`, 층 기록에도 같은 필드 — 층을 옮길 때 현재 층과 2층 이상 떨어진 층 기록의 야광봉은 지운다 (AGENTS.md "2층 이상 멀어질 때까지"). 한 층 최대 64개 (넘으면 오래된 것부터). **몬스터**: 야광봉 빛은 몬스터 시야와 무관 (빛 안의 주인공이 더 잘 보이지 않음) (22-3 구현: 빛 세기 10 (주인공 둘레 빛 12 와 비슷)·조명 높이 0.5m, 야광봉이 있는 층의 카메라 far = 1200m. 멀리서 보이는 것은 화면 크기가 일정한 빛점 (1080p 에서 약 22px) — 멀수록 바닥에 가려지지 않게 거리 × 0.006m (최대 1.2m) 띄운다) | 미확인 |
| U55 | 카드키·내려가는 엘리베이터 잠금 (AGENTS.md "던전 특징 (에릭)") | 에릭 층의 아래층 엘리베이터는 처음에 잠김: 문이 열리지 않고 (문에 충돌 상자), 문 위 ▼ 표시등이 꺼져 있음 (안의 버튼 판은 들어갈 수 없어 쓸 수 없음). **카드 리더기** = 엘리베이터 문의 오른쪽 (밖에서 엘리베이터를 볼 때) 벽면, 높이 1.2m 의 작은 판 + 붉은 불 (활성화되면 초록). F 상호작용 (2.5m·30°, 안내 "카드 찍기"): 카드키가 없으면 아무 일도 일어나지 않음 (AGENTS.md — 토스트도 없음), 있으면 1개 소모 → 활성화 (불 초록·표시등 켜짐·문이 열림). 활성 여부 = `world.elevatorUnlocked` + 층 기록 (지나온 층에 다시 와도 그대로). 아래층에서 올라와 도착한 층은 그 엘리베이터로 내려갔던 것이므로 활성으로 둔다 (기록이 없던 이전 저장 데이터 대비). 위층 엘리베이터·마틴은 잠금 없음 (22-4 구현: 리더기 = 문 바깥 1m · 안쪽을 볼 때 오른쪽 벽면. 활성화하면 토스트 "엘리베이터가 활성화되었습니다" (카드키가 없을 때만 아무 일도 없음). 활성화된 뒤에는 리더기를 조준해도 안내가 없다. **이전 저장 데이터 (필드 없음) 는 활성으로 읽는다** — 장롱 배치가 바뀌어 카드키 칸이 이미 가져간 칸과 겹치면 갇히므로) | 미확인 |
| U56 | 빛 바랜 주문서 (AGENTS.md "던전 특징 (에릭)") | 사용 = 행동 슬롯 → 1개 소모, 무적 시작 → 0.4초 어두워짐 → 순간이동 → 0.4초 밝아짐 → 무적 끝 (무적 약 1초, 그동안 피해·몬스터 공격 없음). **도착 위치**: 같은 층의 생성 가능 칸 (엘리베이터 조각·성소 구역 제외) 가운데 중 지금 위치와 직선 거리 10칸 (160m) 이상인 곳에서 무작위 (없으면 가장 먼 칸). **몬스터**: 사용 즉시 모든 몬스터의 추적 모드 해제 (의심 모드도 함께 해제 — 해석), 도착 칸에서 직선 5칸 (80m) 안에 있던 몬스터는 도착 위치에서 10칸 이상 떨어진 생성 가능 칸으로 순간이동. 캐비닛 안에서는 쓸 수 없음 (행동 슬롯 불가). 재사용 대기 1초 (22-5 구현: 순간이동 연출 0.8초 동안 몬스터는 주인공을 보거나 노리지 못한다 (`playerTargetable`), 도착 칸은 칸 가운데) | 미확인 |
| U57 | 발소리·의심 모드·추적 해제 8초 (AGENTS.md "에릭 특별 규칙" 2026-10-25) | **발소리**: 주인공이 실제로 움직이는 동안 걷기 = 직선 5칸 (80m), 달리기 = 20칸 (320m) 안의 몬스터에게 들림. 벽에 막히지 않음 (AGENTS.md 에 없음). 점프·착지 소리 없음, 멈춰 있거나 캐비닛 안이면 소리 없음. 0.5초마다 판정해 "가장 최신의 소리 위치" 를 갱신. **의심 모드** (`suspect`): 그 위치로 배회 속도 (2.5 m/s) 로 칸 길찾기 이동, 도착 (1.5m 안) 하거나 막히면 (5초 동안 1m 도 못 감, 예: 엘리베이터 안) 해제 → 배회. 의심 중에 발견하면 추적. 노이즈 3단계는 추적 모드만 (의심은 거리 단계). **추적 해제** 4초 → 8초. **캐비닛**: 숨은 채로 8초가 지나면 모든 몬스터의 의심·추적을 해제 (추적은 원래 8초 규칙으로도 풀림) (23단계 구현: "움직이는 중" = 이동 키를 누르고 있는 중 (벽에 막혀 있어도 소리), 빛 바랜 주문서 순간이동 0.8초 동안은 소리 없음, 추적 중인 몬스터는 발소리를 무시 (마지막으로 본 자리로 계속), 의심 모드에서 도착 = 소리 위치 1.5m 안, 캐비닛 8초 = 숨는 순간부터 잰다) | 미확인 |
| U58 | 조작 변경 (AGENTS.md "조작" 2026-10-25, 마틴·에릭 공통) | 상호작용 = **F 키** (대상을 정면으로 볼 때 — 지금의 거리·30° 판정 그대로), 왼쪽 클릭 상호작용은 없앤다. HUD 안내 = "F \| 숨기". 캐비닛에서 나오기도 F. **행동 슬롯 사용 = 마우스 왼쪽 버튼** (누르고 있으면 계속 사용, 플래시는 누르는 순간만). 오른쪽 버튼은 게임 중 아무 일도 하지 않음. 메뉴·인벤토리·상점·스킬 탭 안의 우클릭 상세 정보는 그대로 (AGENTS.md "시스템 메뉴 > 인벤토리" 문구가 그대로). "클릭하여 계속" 의 클릭은 행동 슬롯 사용으로 처리하지 않음 (포인터 락 중에 누른 클릭만, 8절 38번) | 미확인 |
| U59 | 새 게임 시작 이야기 장면 (AGENTS.md "스토리", 20단계 (선택) 20-6) | 새 게임을 시작하면 (이어하기·디버그 게임 제외) 검은 화면에 세 줄이 차례로 나타났다 사라진 뒤 지하 1층이 시작된다: "일과 운동을 모두 마치고, 집으로 돌아가던 길." / "너무 무리했나… 열려 있는 맨홀을 보지 못하고 발을 헛디딘다." / "눈을 뜨고 일어나 보니, 낯선 공간이다." (영어도). 줄마다 나타남 0.9 + 머묾 1.7 + 사라짐 0.7 + 간격 0.3 = 3.6초, 전체 10.8초 (`INTRO_TIMING`, 실제 시간으로 잼 — 프레임이 느려도 같은 길이). 클릭·Space·Enter·ESC 로 건너뜀 (오른쪽 아래 "클릭하여 건너뛰기"). 마틴·에릭 공통. 슬롯 저장은 이야기가 끝나거나 건너뛴 뒤 게임이 시작될 때 (그 전에 창을 닫으면 슬롯은 비어 있음). AGENTS.md 문구는 장면용 문장으로 다듬었다 (주인공이 남성이라는 설정은 대사에 넣지 않음). 글자 크기 46px · 길이가 괜찮은지 사용자 확인 | 미확인 |
| U60 | 저장 데이터 크기 (20-4, 목표 슬롯당 1MB) | 자체 테스트 "저장 데이터 크기" 로 측정: 지하 1000층까지 내려오며 모든 층의 512칸 (가장 큰 층) 을 전부 방문한 극단에서 **마틴 약 789KB** (층 기록 1001개 = 방문 칸 압축 484KB + 그 밖의 필드 175KB + 이전 층 몬스터 스냅샷 1개 58KB, 현재 층 스냅샷 54KB), **에릭은 처음에 약 1.02MB** (서랍 32칸을 매 층 모두 가져갔다고 가정 — 서랍 기록만 257KB) 로 목표를 약간 넘었다 → **2026-10-25 사용자 지시로 서랍 기록을 현재 층과 위·아래 1층까지만 보관하도록 바꿔 (U61) 약 765KB 로 줄었다.** localStorage 는 origin 당 약 5M 글자라 슬롯 4개를 모두 1MB 급으로 채워도 들어간다. 테스트의 한도: 마틴·에릭 모두 1,000,000 (목표 그대로) | 해소 (U61) |
| U61 | 에릭 서랍 기록 (가져간 칸) 의 보관 범위 (2026-10-25 사용자 지시) | **현재 층과 바로 위·아래 1층까지만 보관한다.** 2층 이상 (거리 ≥ 2, `DRAWER_KEEP_FLOORS`) 멀어진 층의 기록은 층 이동 때 지운다 (`pruneFarFloorRecords`, 야광봉 U54 와 같은 범위). 그 층에 다시 가면 서랍이 새것으로 채워져 있다 (한 번 지워진 뒤에는 다시 가까워져도 새것 — 몬스터를 새로 만드는 것과 같은 취급). 포탈은 모든 기록 초기화 (그대로). 이전에 저장한 데이터 (모든 층에 보관하던 형식) 는 불러올 때 같은 규칙으로 정리한다. 이전 동작 (모든 층 보관) 을 확인해 보니 야광봉만 지우고 서랍은 모든 층에 남아 있었다. 지형·방문 칸·상점 품절 (마틴) 기록은 AGENTS.md 대로 모든 층에 그대로 보관 | 확정 (사용자) |
| U26 | 백룸 외 테마 몬스터 16종 (10단계 전) | 테마 색 캡슐 임시 외형 + 공통 근접·원거리 행동으로 생성한다 (층마다 몬스터가 있도록). 광선 (공허의 눈)·범위 (포자 버섯·해파리) 공격과 특수 행동은 10단계까지 없음 (다가가기만) | 해결 (10단계에서 25종 외형·행동 완성. `genericMonsterModel` 은 외형이 없는 종류의 대체용으로만 남김) |
| U28 | 몬스터 특수 행동에서 AGENTS.md 에 없는 값 (10-1) | 포자 버섯: 8m 는 발동 거리, 구름 (반경 4m) 은 **버섯 자리** 중심 (가까이 붙는 상대를 막는 방어용으로 해석). 거미줄 속도 16 m/s. 화염 숨결 중 도롱뇽은 멈춰서 초당 1.2 rad 로만 돈다 (피할 수 있게). 공허의 눈은 조준선 1초 중 마지막 0.3초는 방향 고정. 위상 추적자: 주인공 뒤 자리가 벽 안·벽 너머면 1초 뒤 다시 시도. 고블린 주술사 회복은 자신 포함, 다친 아군이 없으면 기다렸다가 바로 쓴다. 분열한 슬라임은 부모 좌우 0.7m 에 바로 추적 상태로. 근접·원거리 예비 동작 중 맞으면 (경직) 범위·광선 공격도 취소 | 미확인 |
| U29 | 보스 패턴에서 AGENTS.md 에 없는 값 (10-4·10-5) | "주인공이 Nm 안이면" 패턴의 내부 재사용 시간: 결재 도장 2.5초, 철퇴 휘두르기 2초, 휩쓸기 3초. 거리는 보스 중심 기준 (+ 주인공 반지름). 보스는 중심 거리 3.5m 까지 다가간다 (`BOSS_APPROACH`). 패턴마다 처음 쓰는 시각 `first` (정전 15초, 돌진 4초 등) 와 실행 시간 (예고 + 0.2~0.4초, 그동안 제자리). 결재 도장 원의 중심 = 보스 앞 2m. 돌진 속도 24 m/s, 폭 = 보스 지름. 범위 패턴이라 용암 웅덩이·거미줄 폭탄·화산탄 모두 예고 표시 (웅덩이·거미줄 1초). 화산탄 3곳이 겹쳐도 피해는 한 번. 소환수 레벨 = 보스 레벨 − 1, 보스 주위 (구역 안). 정전 밝기 0.05. 중력 당김은 보스 몸 + 1m 까지만. 공허 구체 유도 초당 1.4 rad. 간수장 HP 단계를 한 번에 여러 개 넘으면 단계마다 2마리씩 | 미확인 |
| U30 | 정예 "금색 테두리"·"이름 앞에 정예" 표시 방법 (10-2) | 부품마다 같은 도형을 6% + 3.5cm 크게 뒤집어 (BackSide) 그린 금색 껍데기 (반투명·납작·아주 작은 부품 제외). 머리 위에 "정예 ○○" 이름표 + 금색 HP 막대를 늘 보여준다 (보통 몬스터는 다쳤을 때만 막대) | 미확인 |
| U31 | 공터 둥지 세부 (10-3) | 정예는 둥지에서 처음 자리를 찾은 한 마리. 둥지 전체가 한 무리 (하나가 감지하면 함께 추적). 도착 칸 3칸 이내 금지는 둥지에도 적용, 한 칸 최대 4마리 (무리 기준, 일반 몬스터와 합산) | 미확인 |

---

## 6. 공통 데이터 구조

모든 단계가 이 구조를 함께 쓴다. **필드 이름을 임의로 바꾸지 않는다.** 필드를 추가하는 것은 괜찮다 (추가하면 여기에도 적는다).

### 6.1 게임 상태 (저장 데이터 = 이 객체의 JSON)

```js
// createNewGameState(slotIndex) 가 만드는 초기값
{
    version: 1,                 // SAVE_VERSION. 다르면 읽을 수 없는 데이터로 취급
    slot: 0,                    // 0~3
    savedAt: 0,                 // 저장 시각 Date.now(). 저장할 때 갱신
    floor: 1,                   // 지하 층 번호 = 몬스터 평균 레벨
    dungeonSeed: 0,             // 현재 층 던전 시드 (startNewGame 에서 무작위로 정함)
    theme: 'backrooms',         // 현재 층 테마 (U15)
    nextUid: 1,                 // 장비 인스턴스 고유번호 발급용
    player: {
        level: 1, exp: 0, gold: 0,
        baseStats: { str: 5, dex: 5, int: 5 },   // 레벨업 자동 +1 과 스탯 포인트 분배 결과 (장비 보너스 제외)
        statPoints: 0, skillPoints: 0,
        hp: 100, mp: 50, stamina: 100,           // 현재값 (최대값은 calcDerivedStats 로 계산)
        skills: { BA: 1 },                       // 활성화한 스킬 id → 스킬 레벨
        equipment: {                             // 장비 인스턴스 (6.2) 또는 null
            helmet: null, armor: { /* 트레이닝복 */ }, weapon: { /* 녹슨 쇠파이프 */ },
            offhand: null, ring1: null, ring2: null, boots: { /* 러닝화 */ },
        },
        inventory: [ { kind: 'consumable', id: 'hp1', count: 3 }, null, null /* … 길이 40 고정 */ ],
        actionSlots: [ { type: 'skill', id: 'BA' }, { type: 'item', id: 'hp1' }, null, null, null, null, null ],   // 길이 7 고정
        activeSlot: 0,                           // 0~6
        flashEnergy: 300,                        // 에릭만: 플래시 에너지 (초, 18-1). 마틴에게는 없다. 플래시 켜짐은 런타임 (저장 안 함)
    },
    world: {
        visited: [],            // 현재 층에서 방문 (또는 공개) 한 칸 키 "gx,gz" 목록
        merchantSoldOut: [],    // 현재 층 상인 재고 중 팔린 장비의 번호 목록 (재고 자체는 시드로 다시 만든다, 15단계)
        drawersTaken: [],       // 에릭: 현재 층 서랍형 장롱에서 가져간 칸 "가구 id:칸 (0 위 / 1 아래)" (17-6). 층 기록에도 같은 필드 (현재 층과 위·아래 1층의 기록에만 값이 있고 그보다 먼 층은 [], U61), 없는 이전 데이터 = []
        bossDefeated: false,    // 현재 층의 보스를 처치했는가
        position: null,         // 저장 시점 { x, y, z, yaw }. 새 층·새 게임은 null (getSpawn 사용)
        runtime: null,          // (7-9) 현재 층 몬스터·시체·바닥 아이템 스냅샷 (6.9 Runtime). 저장 JSON 에만 들어가고, 플레이 중 state 에서는 항상 null
        history: {},            // 층 기록 (6.9): 현재 층을 뺀 "정해진 모든 층". 키 = 층 번호 (JSON 이라 문자열), 값 = FloorRecord
    },
}
```

- 2026-10-18 규칙 변경 (AGENTS.md "던전 구성요소" 의 층 정보 저장, U17~U19): `history` 는 위층 기록만이 아니라 미리 정한 다음 층·지나온 아래층까지 담는다. 이름은 이전 저장 데이터와 맞추려고 그대로 둔다. `createNewGameState` 는 `history: {}` 그대로이고, 다음 층 (지하 2층) 은 런타임을 만들 때 `ensureNextFloor` 가 채운다 (7-7).

- (2026-10-24 AGENTS.md 두 주인공, 16~18단계에서 추가함 — 2026-10-25 17·18단계 완료) 최상위 `hero: 'martin' | 'eric'` (없으면 마틴, U38). 에릭: `player.flashEnergy` (플래시 에너지 초, U41), 인벤토리의 `{ kind: 'tool', id: 'flashlight' }`, 행동 슬롯의 `{ type: 'item', id: 'flashlight' }`. `world.drawersTaken` 과 층 기록 (6.9) 의 `drawersTaken` (가져간 서랍 칸 id 목록, U40). 플래시 켜짐·캐비닛에 숨은 상태는 런타임 전용.
- (2026-10-25 AGENTS.md 변경, 22단계에서 추가함) `world.glowsticks` (현재 층의 활성 야광봉 `[{ x, z }]`, U54) 와 층 기록의 `glowsticks` (현재 층과 2층 이상 떨어지면 지움), `world.elevatorUnlocked` (아래층 엘리베이터를 카드키로 열었는가, U55) 와 층 기록의 같은 필드. 인벤토리의 `glowstick`·`keycard`·`fadedScroll` 소모품 (배터리·야광봉·빛 바랜 주문서는 1칸 개수 제한 없음, 카드키 1개, U53). 이전 저장 데이터에 없으면 `glowsticks` 는 빈 목록, `elevatorUnlocked` 는 **true** (카드키 위치가 바뀐 이전 에릭 저장 데이터가 갇히지 않게, U55) 로 읽는다. 새 게임·새 층 기록은 `elevatorUnlocked: false`, 올라와 도착한 층은 true.
- 저장하지 않는 것 (런타임 전용): 투사체, 범위 효과, 재사용 대기, 버프·상태이상, 3D 객체. 이것들은 `game` 런타임 객체 (5-1) 에 둔다.
- 몬스터·시체·바닥 아이템은 런타임 객체에 있다가, 저장할 때 현재 층의 것은 `world.runtime` 스냅샷으로, 바로 이전 층의 것은 그 층 기록 (`world.history[층].runtime`) 으로 함께 저장된다 (U19, 2026-10-18 변경. 옛 규칙에서는 현재 층의 것은 저장하지 않았다).
- 저장은 성소에서만 할 수 있으므로 저장 시점에는 상태이상이 없다. 버프 (영약 등) 는 불러오면 사라진다.

### 6.2 아이템 인스턴스

```js
// 소모품 묶음 (인벤토리 1칸)
{ kind: 'consumable', id: 'hp1', count: 3 }          // count 1~20

// 장비 (항상 1칸, 겹치지 않음)
{
    kind: 'equip', uid: 12,          // 인벤토리에 처음 들어올 때 addItem 이 state.nextUid 로 발급 (상점 재고·바닥 아이템은 uid 없음)
    baseId: 'sword2',                // EQUIP_BASES 의 키
    tier: 2,                         // 0 (시작 장비) ~ 3
    iLv: 14,                         // 획득한 층 번호 (시작 장비는 1)
    rarity: 'magic',                 // 'normal' | 'magic' | 'rare'
    name: { ko: '민첩한 강철 장검', en: 'Agile Steel Longsword' },
    engraving: null,                 // 반지만: { id: 'stat', sub: 'str', value: 4 }
    affixes: [ { id: 'stat', sub: 'dex', value: 4 }, { id: 'critChance', value: 3.2 } ],
}
```

- 장비의 기본 수치 (공격력·마력·방어력) 는 저장하지 않고 `baseId` + `iLv` 로 매번 계산한다 (`itemLevelScale`).
- 부가 옵션·각인의 `value` 는 생성할 때 정한 최종값 (고정 수치는 iLv 보정까지 반영한 값) 을 저장한다.

### 6.3 던전

`generateDungeon(seed, floor)` 의 반환값. 부록 B 의 코드가 이 구조를 만든다. 테마는 던전 구조에 영향을 주지 않는다 (같은 시드 = 같은 구조, 테마는 겉모습과 몬스터만 바꾼다).
(2026-10-24, 17-1 예정) 셋째 인자 `hero` 가 생긴다: 마틴은 지금과 같은 결과, 에릭은 포탈·상인·추가 성소·보스 공터가 없다 (U39). 같은 시드·층·주인공 = 같은 구조. 에릭의 캐비닛·서랍형 장롱은 `planEricFurniture(d)` 가 따로 정한다 (U40).

```js
{
    seed, floor, attempt,           // attempt = 생성 재시도 횟수 (디버그용)
    targetCount: 128,               // min(512, 127 + floor) = 실제 칸 수
    cells: Map<"gx,gz", Cell>,      // 반드시 Map
    pieces: [Piece, ...],           // 배열 위치 = piece.id
    bossPieceId: null,              // 보스 층 (5의 배수) 이면 보스가 있는 공터 조각의 id, 아니면 null
}
Cell = {
    gx, gz,                         // 정수 칸 좌표
    pieceId, pieceType,             // 소속 조각
    shape: 'corridor' | 'room',     // 벽 모양 규칙 (4-2)
    role,                           // 아래 표
    edges: { N, E, S, W },          // 각각 'wall' | 'door' | 'open'
    sanctuaryZone: false,           // 성소 3×3 구역이면 true (U5)
    merchantZone: false,            // 방랑 상인 상점 칸에서 가로·세로·대각선 3칸 안이면 true (2026-10-25 AGENTS.md, U51). 생성이 끝난 뒤 markMerchantZone 이 정한다
}
Piece = { id, type, cells: ["gx,gz", ...], center: "gx,gz" | null, dir: 'N' | 'E' | 'S' | 'W' | null }
```

- 변 (edge) 값: `wall` 벽 / `door` 폭 6m 출입구 / `open` 벽 없이 완전히 열림 (같은 방 조각 안의 방형 칸끼리만).
- **대칭 규칙**: 칸 A 의 E 변과 동쪽 이웃 B 의 W 변은 항상 같은 값이다. 이웃이 없는 쪽 변은 항상 `wall`.

| pieceType | 칸 수 | role 값 | 비고 |
|---|---|---|---|
| straight | 3 | corridor | 일자형 (가로 / 세로) |
| corner | 3 | corridor | ㄱ자형 (회전 4가지) |
| cross | 5 | corridor | 십자형 |
| tee | 4 | corridor | ㅏ형 (회전 4가지) |
| stairsUp / stairsDown | 3 | stairsFront, stairsStep1, stairsStep2 | `cells[0]` 이 stairsFront. `dir` = 앞 통로 → 계단 진행 방향 |
| portal | 1 | portal | 출입구 1개 |
| deadEnd | 1 | deadEnd | 막다른 벽 (U13) |
| merchant | 1 | merchantCenter | 1×1 방형 칸 (2026-10-25 AGENTS.md, 전에는 3×3 = 9칸·merchantRoom), 출입구 1개. `center` = 그 칸. 공터의 3×3 방 칸과 체비쇼프 거리 4 이상 떨어지게 놓는다 (`merchantClearingOk`, U51) |
| clearing | 13 | clearingRoom, clearingCenter, passage | 3×3 공터 + 4방향 통로. 몬스터 둥지 또는 보스 자리 |
| sanctuary | 13 | sanctuaryZone, sanctuaryCenter, passage | 3×3 성소 + 4방향 통로. `center` = 분수 위치 |

### 6.4 스킬 정의 (`SKILLS` 배열, 45개)

```js
{
    id: 'M1', x: -1, y: 2,                 // AGENTS.md 좌표 그대로 (y+ = 위)
    branch: 'magic',                       // 'base' | 'magic' | 'melee' | 'defense' | 'support' | 'cross'
    type: 'active',                        // 'active' | 'passive'
    maxLv: 10,
    nameKo: '화염구', nameEn: 'Fireball',
    resource: 'mp',                        // 'mp' | 'stamina' | null (패시브·기본 공격)
    cost: 8,                               // Lv1 소모량 (레벨당 +5% 는 costAtLevel 로 계산)
    cooldown: 1.5,                         // 초. 레벨에 따라 바뀌면 함수: (lv) => 21 - lv
    element: 'fire',                       // 'physical' | 'arcane' | 'fire' | 'cold' | 'lightning' | null
    values: (lv) => ({ coef: 135 + 15 * lv, radius: 3 }),   // 레벨별 수치. 실행과 상세 표시가 함께 사용
    descKo: '투사체 착탄 시 반경 3m 폭발, 마법 {coef}% 화염 피해 + 화상',
    descEn: 'Explodes in a 3m radius on impact, dealing {coef}% magic fire damage and inflicting Burn',
}
```

- `SKILL_LINKS`: `[['BA', 'M0'], ['M0', 'M1'], ...]` 48개. AGENTS.md 배치도 규칙대로: 기본 공격 – 각 뿌리 (4), 뿌리 – 각 줄기 첫 스킬 (12), 줄기 안에서 연속 (24), 교차 스킬 – 양쪽 끝 (8).
- 설명문의 `{coef}` 같은 자리는 `values(lv)` 의 같은 이름 값으로 바꿔 표시한다.

### 6.5 소모품·장비 정의

```js
// CONSUMABLES: id → 정의 (21개). id = 분류 접두사 + 단계 (1~3)
//   hp (생명력 물약), mp (마나 물약), sta (활력 물약), cure (치료제), throw (투척물), elixir (전투 영약), scroll (주문서)
CONSUMABLES.hp1 = { id: 'hp1', category: 'hp', tier: 1, nameKo: '하급 생명력 물약', nameEn: 'Lesser Health Potion', price: 20, effect: { hpPct: 30 } };

// EQUIP_BASES: id → 정의 (36개)
//   시작 장비: pipe0, tracksuit0, shoes0
//   무기: sword1~3 (한손검), gsword1~3 (양손검), dagger1~3 (단검), wand1~3 (완드), staff1~3 (지팡이)
//   방어구: helm1~3, armor1~3, boots1~3   보조장비: shield1~3, tome1~3   반지: ring1~3
EQUIP_BASES.sword2 = { id: 'sword2', slot: 'weapon', weaponType: 'sword', hands: 1, tier: 2, reqLv: 10,
                       nameKo: '강철 장검', nameEn: 'Steel Longsword', atk: 18, magic: 0 };
EQUIP_BASES.staff2 = { id: 'staff2', slot: 'weapon', weaponType: 'staff', hands: 2, tier: 2, reqLv: 10,
                       nameKo: '마법사 지팡이', nameEn: 'Wizard Staff', atk: 8, magic: 28, mpPct: 20 };
EQUIP_BASES.boots1 = { id: 'boots1', slot: 'boots', tier: 1, reqLv: 1,
                       nameKo: '가죽 장화', nameEn: 'Leather Boots', def: 3, moveSpeedPct: 3 };

// WEAPON_TYPES: 무기 종류별 공통 특성 (AGENTS.md "무기 종류별 특성" 표)
WEAPON_TYPES.sword = { interval: 0.7, melee: true, range: 2.5, arcDeg: 90 };
WEAPON_TYPES.wand  = { interval: 0.8, melee: false, range: 30, pierce: 0 };
WEAPON_TYPES.staff = { interval: 1.2, melee: false, range: 30, pierce: 1 };   // "2명 관통" = 첫 대상 뒤 1명 더
// 녹슨 쇠파이프는 weaponType: 'pipe' (interval 0.8, melee, range 2.3, arcDeg 80)
```

- 장착 칸 이름: `helmet, armor, weapon, offhand, ring1, ring2, boots`. 정의의 `slot` 값은 `helmet, armor, weapon, offhand, ring, boots` (반지는 `ring` 하나로 쓰고, 장착할 때 ring1 / ring2 를 고른다).
- 무기·마도서의 `atk` = 공격력, `magic` = 마력, 방어구·방패의 `def` = 방어력, 방패의 `blockChance` = 막기 확률.
- `AFFIXES` (부가 옵션 17종) 와 `RING_ENGRAVINGS` (각인 5종) 은 AGENTS.md 표를 옮긴다. id 는 6.6 의 수정자 키를 쓴다:
  `stat, hpPct, mpPct, staminaPct, defPct, res1, resAll, physPct, magicPct, elemDmg, atkSpeedPct, critChance, critDamage, lifeSteal, moveSpeedPct, cdrPct, goldPct`.
  `stat`, `res1`, `elemDmg` 는 `sub` 로 대상을 정한다 (str / dex / int, fire / cold / lightning / poison).
- AGENTS.md 부가 옵션 표의 부위 표기: "무기" = 무기 5종 전부, "한손검, 양손검, 단검" = 근접 무기만.
- 3단계에서 만든 실제 구조:
  - `AFFIXES[id] = { sub: [...] | null, ranges: { 1: [최소, 최대], 2: [...], 3: [...] }, slots: [부위 표시...], scales }`
  - `RING_ENGRAVINGS[id] = { sub: [...] | null, values: { 1: n, 2: n, 3: n }, scales }`
  - `scales: true` 는 고정 수치 (`stat`) 라서 생성할 때 `itemLevelScale` 을 곱한다. % 값은 `false`.
  - 부위 표시 (`slots` 의 값) = `helmet, armor, boots, shield, tome, ring, sword, gsword, dagger, wand, staff`. 장비 정의 → 부위 표시는 `affixSlotOf(base)` (무기는 `weaponType`, 보조장비는 `offhandType`, 나머지는 `slot`).
  - 보조장비 정의에는 `offhandType: 'shield' | 'tome'` 가 있다. 단검의 치명타 확률, 지팡이·마도서의 최대 MP %, 방패의 막기 확률은 정의에 `critChance`, `mpPct`, `blockChance` 로 들어 있고 iLv 보정하지 않는다.
  - 기타 상수 ([05]): `CONSUMABLE_TIER_MIN_FLOOR = { 1: 1, 2: 8, 3: 18 }`, `CONSUMABLE_DROP_WEIGHTS = { 1: 5, 2: 3, 3: 2 }`, `POTION_COOLDOWN = 3`, `THROW_COOLDOWN = 1`, `STACK_MAX = 20`, `INVENTORY_SIZE = 40`, `UNARMED_ATK = 2` (`WEAPON_TYPES.fist` = 맨손), `BLOCK_REDUCTION = 70`, `BLOCK_ARC_DEG = 120`.
  - 소모품 `effect` 의 키: `hpPct, mpPct, staminaPct, clearExhaust, staminaRegenMul, noStaminaCost, duration, cure ('all' 또는 id 배열), immuneTime, radius, coef, element, effect, groundCoef, groundTime, cloudTime, tickCoef, stun, dmgPct, atkSpeedPct, damageTakenPct, revealRadius, revealAll, showFacilities, returnToSanctuary, castTime`. 투척물의 `coef` / `groundCoef` / `tickCoef` 는 "투척 기준 피해 (8 + 레벨 × 4)" 대비 %.

### 6.6 수정자 (modifier) 키

장비 기본 수치·각인·부가 옵션·패시브 스킬·버프를 `collectModifiers(state, game)` 가 아래 키의 합계로 모은다. 없는 키는 0.

| 키 | 의미 | 키 | 의미 |
|---|---|---|---|
| `str`, `dex`, `int` | 스탯 + (정수) | `weaponAtk` | 무기 공격력 (iLv 보정 후) |
| `magicPower` | 장비 마력 합 (iLv 보정 후) | `defFlat` | 장비 방어력 합 (iLv 보정 후) |
| `defPct` | 방어력 +% | `hpPct`, `mpPct`, `staminaPct` | 최대치 +% |
| `resFire`, `resCold`, `resLightning`, `resPoison` | 저항 +%p | `resAll` | 모든 저항 +%p |
| `resCapBonus` | 저항 상한 +%p | `physPct`, `magicPct` | 물리·마법 피해 +% (U12) |
| `dmgPct` | 모든 피해 +% (영약) | `firePct`, `coldPct`, `lightningPct` | 속성 피해 +% (숙련 패시브) |
| `atkSpeedPct` | 공격 속도 +% | `critChance`, `critDamage` | 치명타 확률·피해 +%p |
| `lifeSteal` | 물리 피해 흡수 % | `moveSpeedPct` | 이동 속도 +% |
| `cdrPct` | 스킬 재사용 대기 −% | `goldPct` | 골드 획득 +% |
| `hpRegenPct`, `mpRegenPct`, `staminaRegenPct` | 자연 회복 +% | `blockChance` | 막기 확률 % |
| `damageTakenPct` | 받는 피해 +% (음수 = 감소) | `projectileTakenPct` | 받는 투사체 피해 +% (음수 = 감소) |
| `meleePct` | 근접 물리 피해 +% (A2, 근접 공격에만 `physPct` 와 함께 더함) | `elemAddFire`, `elemAddCold`, `elemAddLightning`, `elemAddPoison` | 원소 추가 피해: 근접 물리 공격 적중 시 물리 공격력의 N% 를 해당 속성 피해로 추가 (부가 옵션 `elemDmg`) |
| `burnDmgPct` | 화상 지속 피해 +% (M2) | `slowBonusPct` | 둔화 효과 +%p (M5) |
| `freezeOnColdPct` | 냉기 피해 시 빙결 1초 확률 % (M5) | `shockChancePct`, `shockBonusPct` | 감전 확률 +%p, 감전의 받는 피해 증가량 +%p (M8) |
| `potionPct` | 물약 회복량 +% (S1) | `potionCdSec` | 물약 공용 재사용 대기 −초 (S1) |
| `revealRadius` | 주변 지도 공개 반경 (칸, S5) | | |

- 키 목록은 [07] 의 `MOD_KEYS` 배열이다. 새 키가 필요하면 `MOD_KEYS` 와 이 표에 함께 추가한다. (`emptyMods()` 가 모든 키를 0 으로 채운다)
- 부가 옵션·각인 `{ id, sub, value }` → 수정자 변환은 `addAffixMods`: `stat` → `str`/`dex`/`int`, `res1` → `resFire` 등, `elemDmg` → `elemAddFire` 등, 나머지는 id 와 같은 키.
- 패시브 스킬 → 수정자 변환은 `PASSIVE_MODS[id](values, state, game)` (`values` = 스킬의 `values(lv)`). 공식을 두 번 쓰지 않도록 `values` 의 값을 키 이름만 바꿔 돌려준다. D6 불굴·X2 반격처럼 일이 일어날 때 동작하는 패시브는 `PASSIVE_MODS` 에 없고 14단계 훅에서 `values` 를 직접 읽는다.

### 6.7 파생 수치 (`calcDerivedStats(state, game)` 의 반환값)

```js
{
    str, dex, int,                       // 최종 스탯 (기본 + 장비)
    maxHp, maxMp, maxStamina,
    physAtk, magicAtk,                   // AGENTS.md 공식 그대로 (% 보너스는 피해 계산 때 따로 곱함)
    atkSpeedBonus,                       // 퍼센트 숫자, 최대 100
    attackInterval,                      // 초 = 무기 공격 간격 / (1 + atkSpeedBonus / 100)
    critChance, critDamage,              // 퍼센트 숫자 (6.5, 150)
    walkSpeed, runSpeed,                 // m/s
    hpRegen, mpRegen, staminaRegen,      // 초당 회복량
    defense,
    res: { fire, cold, lightning, poison },   // 퍼센트 숫자 (상한 적용 후)
    resCap,                              // 75 + resCapBonus
    blockChance,
    weaponType,                          // 'pipe' | 'sword' | … | 'fist' (무기 없음)
    weapon,                              // WEAPON_TYPES[weaponType] (interval, melee, range, arcDeg, pierce)
    mods,                                // collectModifiers 결과 (피해 계산에서 사용)
}
```

- `game` 인자 (런타임: `game.buffs`, `game.derived`) 가 없으면 버프·조건부 패시브 없이 계산한다. 자체 테스트는 대부분 인자 1개로 호출한다.
- 조건부 패시브 A8 (HP 50% 이하) 은 `state.player.hp <= game.derived.maxHp × 0.5` 로 판단한다 (`game.derived` = 직전 프레임의 계산 결과. 순환 계산을 피하기 위함).
- 시작 상태 기대값 (자체 테스트가 확인): maxHp 100, maxMp 50, maxStamina 100, physAtk 6.9, magicAtk 4.6, critChance 6.5, critDamage 150, walkSpeed 5.2, runSpeed 8.32, attackInterval 0.7619, hpRegen 0.4, mpRegen 1.0, staminaRegen 27.5, defense 3, 저항 모두 0.
- 계산은 매 프레임 해도 된다 (가볍다). 최대 HP 가 줄면 현재 HP 를 최대치로 깎는다.

### 6.8 테마·몬스터 정의

```js
// THEMES: 테마 id → 정의 (5개)
THEMES.backrooms = {
    id: 'backrooms', nameKo: '백룸', nameEn: 'The Backrooms',
    monsters: ['br_shade', 'br_mannequin', 'br_lamp', 'br_mold'],   // 일반 몬스터 4종
    boss: 'br_boss',
};
// 이름: backrooms 백룸 / The Backrooms, brick 판타지 벽돌벽 / Brick Dungeon, cave 동굴 / Cave,
//       lava 용암 동굴 / Lava Cave, void 왜곡된 차원 / Distorted Dimension
// 겉모습 (텍스처·조명·장식) 은 THEME_VISUALS (4단계) 에 따로 둔다.

// MONSTER_TYPES: 몬스터 id → 정의 (25개 = 테마 5 × (일반 4 + 보스 1)). 수치는 AGENTS.md "몬스터" 표 그대로
MONSTER_TYPES.br_lamp = {
    id: 'br_lamp', theme: 'backrooms', boss: false,
    nameKo: '윙윙대는 형광등', nameEn: 'Buzzing Lamp',
    role: 'ranged',                        // 'rusher' (돌격) | 'ranged' (원거리) | 'tank' (탱커) | 'special' (특수) | 'support' (지원) | 'boss'
    weight: 25,                            // 출현 가중치 (보스는 0)
    group: null,                           // 무리면 [최소, 최대] 예: [2, 3]
    hpMul: 0.6, atkMul: 0.9, defMul: 0.8,
    speed: 2.5, hover: true,               // hover = AGENTS.md 의 "부유"
    attack: {
        type: 'ranged',                    // 'melee' | 'ranged' | 'beam' (즉발 광선) | 'aura' (주변 범위) | 'none'
        range: 16, interval: 2.0, projectileSpeed: 18,
        element: 'lightning',              // 'physical' | 'fire' | 'cold' | 'lightning' | 'poison'
        coef: 100,                         // 공격력 대비 % (기본 100)
        windup: 0.3,                       // 근접 예비 동작 (초)
        effect: { id: 'shock', chance: 20 },   // 부여 상태이상 (없으면 null). id 는 STATUS_EFFECTS 키
        keepDistance: [5, 10],             // 원거리형 거리 유지 범위 (없으면 null)
    },
    res: { fire: 0, cold: 0, lightning: 75, poison: 75 },
    knockbackImmune: false,
    radius: 0.4, height: 1.2,              // 충돌 반지름·키 (m). AGENTS.md 에 없는 값 → 7절 8-1 의 표 사용
    corpse: 'fall',                        // 시체 모양: 'lie' (옆으로 눕힘) | 'flatten' (납작하게) | 'fall' (바닥으로 떨어져 눕힘) | 'vanish' (남기지 않음)
};
```

- `attack` 에 3단계에서 추가한 필드 (`monsterAttack()` 이 기본값을 채운다): `knockback` (m, 기본 0 — 오크 전사 2), `stun` (초, 기본 0 — 바위 골렘 0.5), `splashRadius` (착탄 폭발 반경 — 고블린 주술사 2), `shockwave: { radius, coef, element }` (근접 명중 시 주변 충격파 — 흑요석 골렘), `aimTime` (광선 조준선 표시 초 — 공허의 눈 1), `radius` + `cloudTime` (`aura` 범위 반경과 구름 유지 시간, 0 = 즉발 펄스 — 포자 버섯 4m·4초, 별무리 해파리 4m·0). `aura` 의 `range` = 발동 거리, `windup` = 발동 전 예고 시간 (해파리 0.5초).
- 보스의 `attack` 은 공용 객체 `BOSS_ATTACK` (`type: 'none'`). 실제 공격은 `BOSS_PATTERNS` (10단계).
- `STATUS_EFFECTS[id]` (3-4): `{ id, nameKo, nameEn, color, element, duration (null = 스킬·공격마다), stack: 'refresh' | 'stack' | 'longer', maxStacks, elemental (주인공 지속 시간이 저항%만큼 줄어듦), disables (행동 불가), bossToSlow (보스는 둔화 BOSS_CC_SLOW_PCT=50% 로 대체), monsterOnly }` + 효과 수치 (`dotPct`, `slowPct`, `damageTakenPct`, `playerMaxDuration`, `ignoresDefense`, `movingMul`).
- 이름 표시: `localName(def)` ([03]) 가 현재 언어의 `nameKo` / `nameEn` 을 돌려준다. 테마 이름은 `themeLabel(id)` (`THEMES` 사용. I18N 에는 테마 키가 없다).
- 특수 행동 (마네킹의 "보이면 멈춤", 슬라임 분열 등) 은 데이터가 아니라 `MONSTER_BEHAVIORS[id] = { onUpdate(m, dt), onDeath(m), onHit(m, dmg) }` 훅으로 구현한다.
- 보스 패턴은 `BOSS_PATTERNS[id] = [{ name, cooldown, first, condition(g, m, dist, canSee), run(g, m, dist) }, …]` 로 구현했다 (10단계, 아래 "10단계 구현" 참고).
- 런타임 몬스터 객체 (8단계): `{ uid, typeId, def, level, elite, isMinion, isBoss, maxHp, hp, atk, defense, res, pos (Vector3), yaw, radius, spawn: { x, z }, groupId, state, timers: {}, effects: [], mesh, hpBar, path, custom: {} }`
  - (8단계 구현) 더한 필드: `height`, `size` (정예 1.3), `dead`, `knockVel`, `lastSeenAt`, `wanderTo`, `ownedMats` (개체 전용 재질), `meshes` (Group 안의 메시 목록), `model`. `timers = { attack, windup, stagger, knock, flash, wander, path }` (남은 초). `custom` 에는 `animT, moving, frozen (마네킹), opacity·bodyMat (그림자), lunge, returnT, wanderT` 등. `pos.y` 는 발 높이, 부유형은 몸 중심 (`placeMonsterOnFloor`). 상태 `state = 'idle' | 'chase' | 'return'`.
  - 런타임 시체: `{ typeId, elite, x, z, yaw, size, def, mesh, meshes, ownedMats, custom }`. 바닥 아이템: `{ item, x, z, mesh, spin, dispose() }`. 투사체: 8-9. 구름: `{ x, z, radius, duration, tick, onTick, t, nextTick, mesh, dispose() }`. 연출 (`g.effects`): `{ t, dur, update(e, dt), dispose() }`.
  - 게임 런타임 (5-1) 에 더한 필드: `noMonsters, flow, hurtAt, uiEvents, viewModel, swingT`. `createGameRuntime(state, arrival, opts)` 의 셋째 인자는 `{ debug, noMonsters }` 객체로 바뀌었다.
- (10단계 구현) 더한 것:
  - 런타임 몬스터: `small` (분열한 슬라임·새끼 거미: 크기 ×0.6·HP ×0.4, `SMALL_MUL`), `zone` (보스 공터 3×3 구역의 월드 범위 `{ pieceId, minX, maxX, minZ, maxZ }`, 보스만), `custom.timeline` (예약 행동 `monsterSchedule(m, 초, fn)`, 둔화만큼 늦게 흐르고 죽으면 실행 안 함), `custom.outlines` (정예 금색 테두리), `custom.aimLine` (공허의 눈 조준선, `removeMonsterExtras` 가 뺌). 보스는 `custom.cd` (패턴별 남은 재사용 시간), `custom.busy` (패턴 실행 중), `custom.pose` (모델 자세), `custom.dash` / `custom.selfStun` (간수장), `custom.marksDone` (HP 단계).
  - `MONSTER_BEHAVIORS[id]` 훅: `onUpdate(g, m, dt, dist)` (false 면 그 프레임 전부 건너뜀), `onChase(g, m, dt, dist, canSee)` (true 면 그 프레임의 기본 추적·공격을 건너뜀), `onAttack(g, m, landed)` (근접 공격 뒤), `modifyDamage(g, m, r)` (받는 피해 배율, 수호상 막기), `onHit(g, m, r)` (맞고 살아 있을 때), `onDeath(g, m)`.
  - 공격 종류별 처리: 근접 = `resolveMeleeHit` (넉백 `knockPlayer`·기절·충격파 `monsterShockwave`), 범위 = `resolveAura` (cloudTime > 0 구름 / 0 즉발 펄스), 광선 = `aimBeamAtPlayer` → `fireBeam` (`beamLength` 로 벽·성소에서 끊김, `segmentHitsPlayer`). 셋 다 예비 동작 (`timers.windup`) 이 끝날 때 `resolveWindup`.
  - 투사체 추가 필드: `look` (shotMats 키: web·void·paper), `geo`·`size`·`spin` (종이), `homing` (초당 방향 전환), `life` (수명), `onPlayerHit` (피해 대신, 거미줄). 몬스터 투사체는 `launchMonsterShot(g, m, from, dir, o)`.
  - `BOSS_PATTERNS[보스 id] = [{ name, cooldown, first, condition(g, m, dist, canSee), run(g, m, dist) → 실행 시간 }]`, 실행기 `updateBoss` (상태 idle → chase → return). 예고 `showTelegraph(g, 'circle' | 'line' | 'cone', p, 초, owner)`.
  - 게임 런타임: `bossFight` (전투 중인 보스 → HUD 위쪽 HP 막대), `player.knock` / `player.pull` (`applyForcedMovement`). 화면: `.ug-pull` (중력 당김 보라색), 토스트 `is-boss`.
- (2026-10-22 몬스터 배회, U33) 더한 것:
  - 런타임 몬스터: `nest` (공터 둥지, 스냅샷에도 둥지만 `nest: true`), `home` (추적을 시작한 자리 `{ x, z }`, 돌아가기 목표. 저장 안 함), `path` 는 돌아가기·배회가 함께 쓰는 칸 경로, `wanderTo` = 배회 목표 지점. `custom.wanderT`·`wanderLimit` (구간 시간 제한)·`wanderInit`·`farT` (멀리 있을 때 몰아서 갱신).
  - 게임 런타임: `wanderLeaders` (무리 번호 → 우두머리, 프레임마다), `wanderAreas` (생성 칸별 배회 범위 캐시, 던전이 바뀌면 새로 만듦).
  - 함수: `monsterWander` (배회), `planWanderLeg` (다음 구간), `setWanderGoal`·`wanderSpot`, `wanderArea` (캐시) / `wanderAreaCells` (순수), `wandersAsPack`·`wanderLeaders`·`wanderLeaderOf`, 길찾기 공용 `cellBfs` (깊이 제한·지나갈 칸 조건, `cellDistances` 는 이것을 씀)·`pathFromPrev`·`pathWaypoint` (경로를 따라가는 다음 지점, 벗어나면 다시 찾음), `returnTarget`.
- (12단계 구현) 더한 것:
  - 게임 런타임: `recall` (귀환 주문서 시전 `{ t, dur }`, HUD 진행 막대). `g.uiEvents` 종류 `{ type: 'pickup', item }` (줍기 토스트), `{ type: 'toast', key }` (번역 키 토스트).
  - 버프 항목 (`addBuff`) 의 추가 필드: `staminaRegenMul` (활력 물약 중급, `calcDerivedStats` 가 곱함), `noStaminaCost` (상급, `spendStamina` 가 건너뜀). 버프 id: `item:elixir`, `item:stamina`, `item:holy` (성수 면역).
  - 바닥 아이템: `fullWarned` (가득 참 안내를 이미 했는가). 모양은 `syncDropVisual` (공유 상자 도형 + 색별 공유 재질 `dropMat`).
  - 투사체 추가 필드 (투척물): `gravity` (m/s²), `maxHoriz` + `origin` (수평 거리 제한), `onImpact(g, pr)` (벽·바닥·몬스터·15m 에서 부름, 주인공 투사체만). `projectileImpact` 는 이미 끝난 투사체면 아무것도 하지 않는다.
  - `computeDamage` 의 spec.kind `'item'` (투척물): 물리·마법 % 를 더하지 않는다.
  - 장비 생성 (`generateEquipment`, [16]): `opts = { tier, baseId, rarity, rarityWeights, rareBonus }`. 수식어 `AFFIX_PREFIX`·희귀 이름 `RARE_NAME_FIRST`/`RARE_NAME_SECOND`·소모품 설명 `CONSUMABLE_DESC`·색 `CONSUMABLE_COLORS`/`CONSUMABLE_ITEM_COLORS` 는 [05]. 가격 `equipPrice`/`equipSellPrice` 는 [07].
  - 저장 형식 검사: `isValidItem` 이 장비의 `rarity`·`name.ko/en`·부가 옵션·각인 (`isValidAffix`: id·sub·value) 까지 본다. 바닥 아이템 복원은 `isValidDropItem` (골드 또는 `isValidItem`).
- (14단계 구현) 더한 것: 게임 런타임 `skillTimeline` (예약한 스킬 동작 `[{ t, fn }]`, 층 이동 때 비움), `slotDenied` (`{ slot, at }`), `lastElement` (원소 부여). 주인공 런타임 `dash` (`{ dx, dz, left, hit, spec, stun }`), `invulnUntil` (무적이 끝나는 게임 시각). 버프 항목의 추가 필드: `moveMul`, `knockImmune`, `reflectPct`, `healPctPerSec`, `mpCostReduce`, `shieldHp`·`shieldMax`, `elemWeapon: { coef, chance }`, `tick`·`tickT`·`onTick(g, buff)`. 스킬 버프 id = `'skill:' + 스킬 id`. 몬스터 `custom.weakenT`·`weakenPct` (위협의 함성). 투사체 `onHit(g, m, r)` (주인공 투사체가 맞힌 뒤), `warped` (시간 왜곡으로 느려짐). 바닥 범위 `ward: true` (임시 성역 결계). `hitPlayer` 의 다섯째 인자 `src = { x, z, monster }`, 피해 spec 의 `melee` 는 몬스터 쪽 근접 공격에도 쓴다.
- (15단계 구현) 더한 것: 화면 `SCREENS.game.shop` (상점 UI `{ root, stock, rerender, destroy }`, 열려 있으면 일시정지·포인터 락 해제, `canOpenMenu` 거짓), `openShop()`·`closeShop()`. 상호작용 대상 (`collectInteractables`) 의 추가 필드 `range` (대상별 거리, 상인 4m) 와 `insidePiece` (지금 칸이 그 조각일 때만), 상인 항목 `{ kind: 'merchant', pieceId, x, y: 1.5, z, range: 4, insidePiece: true, labelKey: 'interact.trade' }`. `g.uiEvents` 종류 `{ type: 'openShop' }`. 상점 재고는 저장하지 않고 `merchantStockOf(state)` 가 층 시드로 다시 만든다 (팔린 장비 = `world.merchantSoldOut` 의 번호). 입력 `input.leftClicked` 는 포인터 락 중에 누른 클릭만 (15단계에서 고침, 8절 38번).
- (2026-10-25 AGENTS.md: 상점 1×1·주변 3칸, U51) 더한 것: 칸 `merchantZone`, `monsterBarred(cell)` (= 성소 구역 또는 상점 주변 — 몬스터의 생성 `canSpawnMonsterIn`·이동 `moveMonsterBy`·자리 `validMonsterSpot`·길찾기 `cellBfs`/`findCellPath`·배회가 모두 이것을 쓴다. 투사체 소멸·광선 끊김·회복·상태이상 해제는 성소 구역만), `MERCHANT_SAFE_CELLS` (3), `chebyshevCells`, `merchantClearingOk`, `markMerchantZone`. `merchantLayout` 의 반환값에 `dir` (출입구 방향). `playerStartPosition(d, state, arrival, collision)` 은 저장 위치가 벽 안 (반지름의 절반으로 검사) 이면 도착 방식별 시작 위치를 쓴다 (생성 규칙이 바뀐 이전 저장 데이터).
- (17·18단계 구현, 에릭) 더한 것: 던전 `d.hero`. 칸 `merchantZone` 은 에릭 층에서 늘 false. view 의 `furniture` (`planEricFurniture` 결과, 마틴 층은 null)·`setCabinetHidden`·`openDrawer`·`isDrawerOpen`·`ericDark`·`setEricDarkness(on)`·`aimFlash(camera)`, 상호작용 대상 `{ kind: 'cabinet', id, x, y, z, range: 2.5 }`·`{ kind: 'drawer', id, slot, … }`. 게임 런타임 `interactLabel` (안내 문구 키), `hiding` (숨은 캐비닛), `flash = { on, dieT }`, `darkView`·`darkOn` (어둠을 적용한 view·플래시 상태). 입력 `input.rightClicked`. HUD 의 `hide`·`battery`·`bars.flash`, 루트 `is-eric` 클래스.
- (19단계 구현, 에릭의 몬스터) 더한 것: 칸 `ericBarred` (에릭 층의 엘리베이터 내부, `monsterBarred` 가 막음). 런타임 몬스터 `eric` (true 면 `updateEricMonster` 만), `custom.sees`·`sightT` (0.1초마다의 시야)·`lastSeen` (마지막으로 본 자리)·`stuckPos`·`stuckT` (배회 막힘), `wanderTo` (배회 목표 칸 가운데), `path` (칸 경로), `timers.path`. 스냅샷 몬스터의 `eric: true`. HUD 의 `noise` (canvas)·`vignette`. view 쪽 `ctx.sky` (왜곡된 차원 하늘, 에릭 어둠에서 감춤).
- (16단계 구현) 더한 것: 게임 상태 `hero`. 게임 런타임 `inElevator` (엘리베이터 내부. 16-9 부터 step2 1칸), `interactTarget` (조준 중인 상호작용 대상). 던전 view `interactables` (`collectInteractables`), `closeElevator(pieceId)`, 장면 준비용 `ctx.elevators` (문 상태). `view.triggers` 는 포탈만. 공용 재질 `getElevatorAssets()` (발광 재질은 `setLightLevel` 대상).

### 6.9 층 기록과 런타임 스냅샷

> 2026-10-18 AGENTS.md 의 층 정보 저장 규칙이 바뀌었다. 아래는 **새 규칙** 이며, 같은 날 7-7 ~ 7-9 에서 코드에 반영했다 (옛 규칙: 위층만 기록·50층 제한·몬스터는 바로 위층만).

```js
// state.world.history[층 번호] = FloorRecord   (applyFloorChange 가 관리, 7-7)
//   현재 층을 뺀 "정해진 모든 층" = 지나온 위층 전부 + 위로 올라왔다면 지나온 아래층 + 미리 정한 다음 층 (현재 층 + 1, 항상 있음)
//   정해진 층은 언제나 이어진 범위다 (맨 위 기록 층 ~ 현재 층 + 1 이상)
FloorRecord = {
    floor: 1, seed: 111, theme: 'backrooms',
    visited: '…',                       // 그 층의 방문 칸. 7-8 부터 압축 문자열 (encodeVisited), 이전 형식은 키 배열. 아직 가 보지 않은 층은 빈 값
    merchantSoldOut: [2],               // 그 층 상인의 팔린 장비 번호
    bossDefeated: false,
    runtime: null,                      // 몬스터·시체·바닥 아이템 스냅샷. "바로 이전 층" (현재 층으로 오기 직전에 있던 층) 기록에만 있고 나머지는 null
}
// 런타임 스냅샷 (snapshotFloorRuntime 결과 = restoreFloorRuntime 입력)
Runtime = {
    monsters: [ { typeId, level, elite, isMinion, x, z, yaw, hp, spawnX, spawnZ, groupId, small?, nest? } ],   // small 은 작은 개체만 true (10-6), nest 는 공터 둥지만 true (U33). 보스도 이 형식 (HP 그대로)
    corpses:  [ { typeId, elite, x, z, yaw, small? } ],
    drops:    [ { item, x, z } ],       // item = 6.2 아이템 인스턴스 또는 { kind: 'gold', amount }
}
```

- 규칙 (AGENTS.md "던전 구성요소" 의 층 정보 저장·"던전 테마"·"몬스터 > 생성 규칙" + U16~U19·U24):
  - 계단 (내려가기·올라가기): 떠나는 층을 기록 (runtime 포함, 이것이 새 "이전 층") → 들어갈 층의 기록이 있으면 시드·테마·방문 칸·상인 품절·보스 처치·runtime 을 그대로 복원, 없으면 새로 정함 → 떠나는 층 말고 다른 기록의 runtime 은 null → 다음 층 (현재 + 1) 기록이 없으면 미리 정함.
  - 포탈: 맨 위층까지 모든 기록 삭제 → 같은 층 번호로 새로 정함 (떠나는 층과 다른 테마) → 다음 층 미리 정함. 이전 층 runtime 은 없다.
  - 새로 정하는 층은 `makeFloorRecord` 한 곳에서만 만든다 (시드 = `Math.floor(rnd() × 2147483647)`, 테마 = U16).
  - 기록 개수 제한 없음 (U18). 저장 크기는 방문 칸 압축 (7-8) 으로 줄인다.
  - 현재 층의 runtime 은 런타임 객체에 있고, 저장할 때 저장 JSON 의 `world.runtime` 에만 넣는다 (7-9, state 에는 남기지 않음). 불러오면 `createGameRuntime` 이 복원한다.
- 몬스터를 새로 생성하는 경우 (8단계): 처음 들어가는 층, 기록은 있지만 runtime 이 없는 지나온 층, 이전 형식 저장 데이터를 불러와 `world.runtime` 이 없을 때. 어느 경우든 그 층 기록의 `bossDefeated` 가 true 면 보스는 만들지 않는다.

### 6.10 던전 view (4단계, [10]·[11] 섹션)

```js
const view = buildDungeonView(dungeon, themeId);   // 장면에 붙이기 전의 3D 던전
mountDungeonView(view);     // app.scene 에 group 추가 + scene.fog / background + camera.far = view.cameraFar
view.update(dt, eyePos);    // 매 프레임. eyePos = 카메라 (눈) 위치 Vector3 → 손전등·별·성운·불씨가 따라다닌다. 깜빡임·소용돌이·용암 흐름 애니메이션
view.setLightLevel(0.1);    // 0~1. 테마 조명·시설 조명·발광 장식 밝기 (손전등 제외). 백룸 보스 "정전"
unmountDungeonView(view);   // view.dispose() + 안개·배경·camera.far 원상복구. 층 이동·메인 메뉴 복귀 때 반드시 호출 (4.6)
```

| 필드 | 내용 |
|---|---|
| `group` | 이 층의 모든 메시·조명 (`THREE.Group`) |
| `collision` | `Map<cellKey, box[]>` = `buildCellBoxes(cell)` + 시설 충돌 상자 (분수 ±4.5m, 상인 카운터·뒤쪽·앞 기둥, 공터 잔해). 상자의 `maxY` 는 실제 높이 (벽 10, 분수 5.3, 카운터 1.1, 잔해 0.3~3.4) |
| `triggers` | `[{ kind: 'stairsDown' \| 'stairsUp', cellKey (= step2 칸), pieceId }, { kind: 'portal', cellKey, pieceId, x, z (포탈 칸 중심) }]` = `collectFloorTriggers(d)` ([08], 7단계에서 순수 함수로 분리) |
| `lights` | `{ ambient, hemi, player (손전등), sanctuaries[4], merchant, portal }`. PointLight 는 항상 7개 (안 쓰는 것은 세기 0) — 개수가 같으면 층이 바뀌어도 셰이더를 다시 만들지 않는다 |
| `wallVisualHeight` | 벽을 그리는 높이: void 1.2, 그 외 10 (8-4 시야 판정) |
| `ceiling` | 천장 메시 (void 는 `null`). 디버그 위에서 보기에서 숨긴다 |
| `fog`, `background`, `cameraFar` | `mountDungeonView` 가 장면·카메라에 적용 |
| `dungeon`, `themeId` | 만든 재료 |

- 겉모습 표: `THEME_VISUALS[테마 id] = { ambient: [색, 세기], hemi: [하늘, 땅, 세기], fog: [색, near, far], background, ceiling, wallHeight, floorThickness, cameraFar, flashlight, makeAssets(), decorate(ctx) }` (4-3, 4-5).
- 공유 자원 (게임 끝까지 유지, dispose 하지 않음): `getThemeAssets(themeId)` (테마별 텍스처·재질, 처음 쓰일 때 생성), `getCommonAssets()` (모든 테마 공용 도형·재질: 단위 상자·구·원뿔·원통, 성소 분수·석상, 상인·천막, 포탈). 몬스터처럼 다른 단계에서 재질을 새로 만들 때도 같은 방식 (캐시) 으로 만든다.
- 층 전용 자원 (dispose 대상): 벽·바닥·성소 바닥·천장·걸레받이·용암 줄기의 병합 지오메트리, `InstancedMesh` (형광등·콘센트·횃불·쇠사슬·종유석·석순·수정), 불씨 `Points` 지오메트리. `ctx.track()` 으로 등록되어 `view.dispose()` 가 해제한다.
- 발광 재질은 `markGlow(mat)` 로 원래 밝기를 `userData` 에 기록하고 `applyGlowLevel(mat, f)` 로 바꾼다. 공유 재질을 바꾸므로 `dispose()` 가 밝기를 1 로 되돌린다.
- 장식 배치는 `createRng(hashInts(seed, floor, 4004))` 로 정하므로 같은 층은 항상 같은 모습이다 (위층 복귀 시 그대로). 깜빡임·불씨 같은 연출만 `Math.random()`.
- 장식 위치 도우미: `cellWallFaces(cell)` (칸 안에서 통로 쪽을 향한 벽면 목록 `{ x, z, tx, tz, nx, nz, len }`), `randomWalkPoint(cell, rng, margin)`, `decorCells(d, includeMerchant)` (특수 시설 칸 제외). 몬스터 배치 (8-2) 등에서 재사용할 수 있다.

---

## 7. 개발 단계

각 단계는 목표 → 작업 체크리스트 → 완료 조건으로 되어 있다. 앞 단계에서 만든 것을 뒤 단계가 쓰도록 순서를 정했다.

| 단계 | 내용 |
|---|---|
| 0 | 개발 기반 |
| 1 | 초기 화면·메인 메뉴·설정·저장 슬롯 |
| 2 | 던전 생성 (순수 로직) |
| 3 | 데이터 테이블·공식·새 게임 상태·층 기록 (순수 로직) |
| 4 | 던전 3D 렌더링 (테마 5종) |
| 5 | 1인칭 조작과 HUD |
| 6 | 시스템 메뉴 골격·지도·시스템 탭·저장/불러오기 |
| 7 | 층 이동·테마 전환·층 기록 (2026-10-18 규칙 변경 보완 7-7 ~ 7-12 포함) |
| 8 | 몬스터 공통 시스템·기본 공격·성장·사망 (백룸 몬스터 4종) |
| 9 | 상태이상·버프 |
| 10 | 테마별 몬스터 완성 (나머지 16종·정예·둥지·보스 5종) |
| 11 | 스테이터스 탭 |
| 12 | 아이템·인벤토리·장비·소모품 |
| 13 | 스킬 트리 화면 (마틴 전용) |
| 14 | 스킬 효과 구현 (45개, 마틴 전용) |
| 15 | 방랑 상인 (마틴 전용) |
| 16 | 두 주인공 공통 기반 (주인공 선택·엘리베이터·아이템 버리기) — 2026-10-24 AGENTS.md 변경 |
| 17 | 에릭: 던전 생성 차이·캐비닛·서랍형 장롱 |
| 18 | 에릭: 플래시·배터리·어둠·화면 차이 |
| 19 | 에릭: 몬스터 (배회·추적·시야·노이즈) |
| 20 | 마무리 (2026-10-24 전에는 16단계) |
| 21 | 조작 변경 (F 키 상호작용·왼쪽 버튼 행동 슬롯, 마틴·에릭 공통) — 2026-10-25 AGENTS.md 변경 |
| 22 | 에릭: 장롱 확장·배터리·야광봉·카드키 (내려가는 엘리베이터 잠금)·빛 바랜 주문서 — 2026-10-25 AGENTS.md 변경 |
| 23 | 에릭: 몬스터 의심 모드 (발소리)·추적 해제 8초·노이즈 기준 — 2026-10-25 AGENTS.md 변경 |

- 2026-10-24 사용자 지시로 진행 순서는 **16 → 17 → 18 → 19 → 13 → 14 → 15 → 20** 이다 (번호는 그대로 두고 순서만 바꾼다. 1절 1번의 "번호 순서대로" 보다 이 지시가 우선).
- 같은 날 사용자 지시 ("13단계부터 이어서 작업해 줘") 로 13 → 14 → 15 를 먼저 진행했다 (16-9·17~19 보다 앞). 15단계 도중 사용자 지시로 중단 → 남은 순서: **15 (마무리) → 16-9 → 17 → 18 → 19 → 20**.
- 2026-10-25: 15단계 마무리 (15-1 ~ 15-4, 15-6 = AGENTS.md 상점 1×1·주변 3칸 반영) 완료 → 남은 순서: **16-9 → 17 → 18 → 19 → 20**.
- 2026-10-25: 16-9 완료 → 남은 순서: **17 → 18 → 19 → 20**.
- 2026-10-25: 17-6 (서랍에서 꺼내기) 이 배터리 데이터를 쓰므로 17-1 ~ 17-5 → 18-1 → 17-6 → 18-2 ~ 18-4 순서로 했다. 사용자 지시 ("18-5 까지만 진행하고 문서에 진행상황 반영 후 중지") 로 18-4 까지 하고 중지 (17-7·18-5 는 사용자 확인 항목) → 남은 순서: **19 → 20**.
- 2026-10-25: 사용자 지시 ("19-4 단계까지 진행해 줘") 로 19-1 ~ 19-4 완료 (19-5 는 사용자 확인 항목) → 남은 순서: **20**.
- 2026-10-25: AGENTS.md 변경 (에릭 아이템·장롱·카드키·의심 모드·조작) 으로 21 ~ 23단계를 더했다. 마무리 (20) 는 맨 끝에 둔다 → 남은 순서: **21 → 22 → 23 → 20** (번호는 그대로, 순서만).

### 0단계: 개발 기반

목표: 자체 테스트가 돌아가고, 브라우저에서 모듈이 로드되어 타이틀 문구가 보인다.

- [x] 0-1 `tools/selftest.mjs` 를 부록 A 의 내용 그대로 만든다. 실행하면 `결과: PASS 0, FAIL 0, SKIP 18` 이 나와야 한다 (아직 `__TEST__` 가 없으므로 전부 SKIP).
- [x] 0-2 `www/js/undergrounds.js` 를 부록 D 의 골격으로 교체한다 (맨 위 라이선스 주석은 기존과 같다). 교체 후 `node --check` 통과, 자체 테스트 `PASS 1, FAIL 0, SKIP 17`.
- [x] 0-3 서버를 켜고 3.4 로 확인한다: 콘솔 오류 없음, 스크린샷 가운데에 "Undergrounds / 계속하려면 클릭하세요".
- [x] 0-4 디버그 해시: [21] 섹션에 `parseDebugHash()` 를 만든다. `location.hash` 가 `#debug=game&floor=3&seed=7` 이면 `{ debug: 'game', floor: '3', seed: '7' }` 를 반환 (값은 문자열, 해시가 없으면 `null`). 진입 함수 표 `const DEBUG_ENTRIES = { menu: (opts) => showScreen('mainMenu'), ... }` 를 두고, `initialize` 마지막에서 해시가 있고 표에 그 이름이 있으면 그 함수를, 아니면 `showScreen('title')` 을 호출한다. 표는 단계마다 늘린다 (3.5).
- [x] 0-5 [17] 공용 UI 함수와 CSS:
  - `makeButton(label, onClick, opts)` → `<button class="ug-btn">`. `opts.disabledReason` 이 있으면 `is-disabled` 클래스를 붙이고, 클릭 시 `showTooltip(버튼, 이유)` 만 하고 onClick 은 부르지 않는다.
  - `showDialog({ message, buttons: [{ label, onClick, primary }] })` → 화면 전체를 덮는 반투명 배경 + 가운데 상자. 버튼을 누르면 대화상자를 닫은 **뒤** onClick 을 부른다. 배경 클릭은 무시한다. 열려 있는 동안 ESC 는 마지막 버튼 (취소 / 아니오) 과 같게 처리한다. 반환값은 닫기 함수.
  - `showTooltip(anchorEl, text, ms = 4000)` → 요소 위쪽에 작은 말풍선, ms 후 자동 제거. 같은 요소에 다시 띄우면 이전 것을 먼저 지운다.
  - `showToast(text, ms = 2500)` → 화면 위쪽 가운데에 잠깐 나타나는 안내. 여러 개면 아래로 쌓인다.
  - CSS: 버튼 (최소 너비 280px, 높이 64px, 어두운 배경 + 밝은 테두리, hover 시 밝게), 대화상자, 툴팁, 토스트. 색: 배경 `#0c0d10`, 글자 `#e8e2d0`, 강조 `#d8b26a`.
- [x] 0-6 0절·9절 갱신.

완료 조건: `node --check` 통과 / 자체 테스트 FAIL 0 / 스크린샷에 타이틀 문구 / 콘솔 오류 없음.

### 1단계: 초기 화면·메인 메뉴·설정·저장 슬롯

목표: AGENTS.md "초기 화면", "메인 메뉴" 절의 동작 전부.

- [x] 1-1 타이틀 화면 (`SCREENS.title`)
  - 가운데 큰 제목 "Undergrounds" (96px), 그 아래 "계속하려면 클릭하세요" (CSS 애니메이션으로 1.2초 주기로 깜빡임).
  - 3D 배경 (권장): 아래에서 위를 올려다보는 어두운 원통형 수직 하수도 (`CylinderGeometry`, 안쪽 면이 보이게 `side: THREE.BackSide`), 맨 위의 열린 맨홀 구멍에서 들어오는 희미한 빛 (밝은 원판 + `PointLight`), 천천히 회전. 이미지 없이 도형과 CanvasTexture 만 쓴다.
  - 화면 아무 곳이나 `pointerdown` → `showScreen('mainMenu')`. (클릭은 브라우저 창을 활성화하기 위한 것이므로 키 입력으로는 넘어가지 않는다.)
  - `exit()` 에서 3D 배경 객체를 장면에서 빼고 dispose 한다.
- [x] 1-2 메인 메뉴 (`SCREENS.mainMenu`): 제목 + 버튼 2개를 세로로 [게임 시작] → `showScreen('slots')`, [설정] → `showScreen('settings')`. 배경은 타이틀의 3D 배경을 재사용해도 된다 (구현: `showMenuBackdrop()` / `updateMenuBackdrop(dt)` / `hideMenuBackdrop()` — 메뉴 화면들이 함께 쓰고, 게임 화면이 `hideMenuBackdrop()` 으로 해제).
- [x] 1-3 설정 (`SCREENS.settings`)
  - 항목 1 "언어": [한국어] [English] 두 버튼, 선택된 쪽을 강조.
  - 항목 2 "그래픽 품질": [낮음 (1280×720)] [보통 (1920×1080)].
  - 화면 하단에 [저장] [취소].
  - 화면 안에서 고른 값은 임시 변수 `draft` 에만 넣는다.
    [저장] → `app.settings = draft` → `saveSettings(draft)` → `currentLang = draft.lang` → `applyGraphicsQuality()` → `showScreen('mainMenu')`.
    [취소] → 아무것도 바꾸지 않고 `showScreen('mainMenu')`.
  - 확인: English 로 저장하면 메인 메뉴 문구가 영어로 바뀌어야 한다. 새로고침해도 유지되어야 한다.
- [x] 1-4 [09] 저장 슬롯 저장소 함수
  - `slotKey(i)` → `STORAGE_KEY_SLOT_PREFIX + i`
  - `readSlot(i)` → `{ status: 'empty' }` | `{ status: 'ok', data }` | `{ status: 'corrupt' }` (JSON 파싱 실패, `version` 불일치, `player`·`floor` 없음 → corrupt)
  - `writeSlot(i, state)` → `state.savedAt = Date.now()` 후 `JSON.stringify` 로 저장. 성공 여부 반환.
  - `deleteSlot(i)`
  - localStorage 는 반드시 `storageGet` / `storageSet` / `storageRemove` (부록 D) 를 통해서만 쓴다.
- [x] 1-5 저장 슬롯 화면 (`SCREENS.slots`)
  - 슬롯 4개를 카드로 표시: "슬롯 1" + 상태 문구. 빈 슬롯 "비어 있음" / 데이터 "지하 {floor}층 · {테마 이름} · Lv {level} · {저장 시각 YYYY-MM-DD HH:mm}" / 손상 "읽을 수 없는 데이터".
  - 하단 [뒤로] → 메인 메뉴.
  - 빈 슬롯 클릭 → 대화상자 "새로 던전에 입장하시겠습니까?" [예] [아니오]. [예] → `startNewGame(i)`.
  - 데이터 슬롯 클릭 → 대화상자 [이어하기] [삭제] [취소].
    [이어하기] → `continueGame(i)`.
    [삭제] → 대화상자 "정말 삭제하시겠습니까? 되돌릴 수 없습니다." [예] [아니오] → [예] 이면 `deleteSlot(i)` 후 목록을 다시 그린다.
  - 손상 슬롯 클릭 → [삭제] [취소] (삭제는 위와 같은 2차 확인).
  - 이 단계의 `startNewGame` / `continueGame` 은 임시로 `SCREENS.game` 빈 화면 ("준비 중" 문구, 아무 곳이나 클릭하면 메인 메뉴) 으로 이동만 한다. 실제 구현은 5·6단계.
- [x] 1-6 이 단계의 모든 문구를 `I18N.ko` / `I18N.en` 에 추가.
- [x] 1-7 디버그 해시 `menu`, `slots`, `settings` 추가 → 3.4 로 각 화면 스크린샷 확인.
- [x] 1-8 (사용자 확인 필요) 타이틀 클릭 → 메인 메뉴 → 슬롯 → 대화상자 흐름, 설정 저장/취소, 영어 전환. — Playwright Chromium 으로 클릭·키 입력 39건 자동 확인 완료 (2026-10-17). 실제 브라우저에서의 사용자 확인은 권장.

완료 조건: 화면 4종 (타이틀 / 메인 / 슬롯 / 설정) 스크린샷 확인, 콘솔 오류 없음.

### 2단계: 던전 생성 (순수 로직)

목표: AGENTS.md "던전 구성요소" 규칙과 "보스 층에는 공터가 반드시 있음" (몬스터 > 생성 규칙) 을 만족하는 칸 지도를 만든다. 화면 없음.

- [x] 2-1 [01] 섹션에 `const CELL_SIZE = 16;` 와 `const CELL_HEIGHT = 10;` 을 추가하고 (0단계에서는 lint 의 "쓰지 않는 변수" 오류를 피하려고 넣지 않았다), [08] 섹션에 부록 B 코드를 옮긴다. (부록 B 는 미리 대량 검증한 참조 구현이다: 지하 1~520층 · 6,960회 생성에서 실패 0, 재시도 최대 1회, 블록 수 항상 정확, 보스 층 공터 항상 있음)
- [x] 2-2 부록 B 앞의 알고리즘 설명을 읽고 이해한다 (나중에 고칠 때 필요).
- [x] 2-3 `__TEST__` 에 `generateDungeon, getSpawn, floorHeightAt, buildCellBoxes` 를 추가한다 → 자체 테스트 `PASS 9, FAIL 0, SKIP 11` (RNG 1개 + 1단계에서 추가한 저장소·디버그 해시 2개 + 던전 6개).
- [x] 2-4 (선택) 디버그용 `dungeonToAscii(d)`: 칸마다 `+-` / `|` 로 벽을, 글자로 조각 종류 (S 성소, M 상인, C 공터, B 보스 공터, U 위 계단, D 아래 계단, P 포탈, . 복도) 를 찍어 문자열로 반환.

완료 조건: 자체 테스트 FAIL 0, 던전 테스트 6개 PASS.

### 3단계: 데이터 테이블·공식·새 게임 상태·층 기록 (순수 로직)

목표: AGENTS.md 의 스탯·스킬·아이템·장비·몬스터 표를 코드 데이터로 옮기고 공식을 구현한다. 화면 없음.

- [x] 3-1 [04] `SKILLS` 45개, `SKILL_LINKS` 48개 (6.4 형식). AGENTS.md "스킬" 절의 표를 한 줄씩 옮긴다. `values(lv)` 는 표의 "효과" 열 공식 그대로. 영어 설명은 한국어 설명을 번역해 쓴다.
  - 보조 맵도 만든다: `SKILL_BY_ID` (id → 정의), `SKILL_NEIGHBORS` (id → 연결된 id 배열, `SKILL_LINKS` 에서 생성).
  - (구현됨) 재사용 대기는 `skillCooldown(skill, lv)` 로 읽는다 (숫자 또는 `(lv) => 초` 를 모두 처리. 기본 공격은 `null` = 실제 공격 간격).
- [x] 3-2 [05] `CONSUMABLES` 21개 (6.5 형식). 효과 수치는 AGENTS.md "소모품 목록" 그대로.
- [x] 3-3 [05] `WEAPON_TYPES`, `EQUIP_BASES` 36개, `RING_ENGRAVINGS` 5종, `AFFIXES` 17종 (부위 제한·단계별 범위 포함), `RARITIES` (`normal` 65 흰색 / `magic` 28 파란색 `#5c8cff` / `rare` 7 노란색 `#ffd24a`), `TIER_INFO` (`{ 1: { reqLv: 1, minFloor: 1, basePrice: 40 }, 2: { reqLv: 10, minFloor: 10, basePrice: 180 }, 3: { reqLv: 25, minFloor: 25, basePrice: 600 } }`).
- [x] 3-4 [06] `STATUS_EFFECTS` 8종 (`burn, slow, freeze, shock, poison, bleed, stun, fear`): 기본 지속 시간, 원인 속성, 중첩 여부 (AGENTS.md "상태이상" 표).
- [x] 3-5 [06] `THEMES` 5개와 `MONSTER_TYPES` 25개 (6.8 형식). AGENTS.md "몬스터 > 테마별 몬스터" 표를 한 줄씩 옮긴다.
  - 표의 "공격 방식" → `attack` (근접 = `type: 'melee'`, 원거리 = `'ranged'`, 공허의 눈 광선 = `'beam'`, 포자 버섯·별무리 해파리 = `'aura'`, 보스는 패턴으로 공격하므로 `type: 'none'`).
  - 표의 "부유" → `hover: true`, "넉백 면역" → `knockbackImmune: true`, "무리 2~3마리" → `group: [2, 3]`, "거리 유지 5~10m" → `keepDistance: [5, 10]`, "예비 동작 0.6초" → `windup: 0.6` (없으면 0.3).
  - 보스는 `boss: true, weight: 0, role: 'boss', knockbackImmune: true`.
  - `radius`, `height`, `corpse` 는 8-1 의 표 값을 쓴다.
- [x] 3-6 [07] 공식 함수
  - `expToNext(level)` = `Math.floor(80 * Math.pow(level, 1.5))`
  - `killExp(monsterLv, playerLv)` = `(10 + 5 × monsterLv) × clamp(1 + 0.1 × (monsterLv − playerLv), 0.2, 1.5)`
  - `physReduction(defense, attackerLv)` = `Math.min(0.8, def / (def + 50 + 10 × attackerLv))`
  - `elementMultiplier(resPct)` = `1 − resPct / 100` (resPct 는 상한까지 적용된 값. 음수 저항이면 1 보다 커진다)
  - `costAtLevel(cost, lv)` = `Math.round(cost × (1 + 0.05 × (lv − 1)))`
  - `itemLevelScale(reqLv, iLv)` = `1 + 0.04 × (iLv − reqLv)` (시작 장비는 항상 1)
  - `consumablePrice(id, floor)` = `Math.round(price × (1 + 0.1 × (floor − 1)))`, 판매가 = 그 값의 25% 반올림
  - `monsterBaseStats(level)` = `{ hp: 30 + 6L + 0.6L², atk: 6 + 2.5L, def: 3L }` (AGENTS.md "몬스터 > 공통 규칙")
  - `monsterRewardMultiplier(def)` = `(def.hpMul + def.atkMul) / 2` (경험치·골드 배수)
  - (구현됨) 판매가는 `consumableSellPrice(id, floor)` 로 따로 만들었다.
- [x] 3-7 [09] `createNewGameState(slotIndex)` (6.1). 시작 장비 3개를 장비 인스턴스 (6.2, `tier: 0`, `iLv: 1`, `rarity: 'normal'`, `uid` 는 `nextUid` 로 발급) 로 만들어 장착한다. 하급 생명력 물약 3개를 인벤토리 0번 칸에 넣는다. HP·MP·스태미너는 최대치. `theme: 'backrooms'`, `world` 는 6.1 그대로 (`history: {}`).
  - (구현됨) 시작 장비는 `makeEquipInstance(state, baseId, iLv)` 로 만든다 (일반 등급·옵션 없음, uid 발급). HP·MP·스태미너는 `calcDerivedStats` 로 최대치를 구해 넣는다.
- [x] 3-8 [09] 부록 G 코드 (`THEME_IDS`, `HISTORY_LIMIT`, `pickNextTheme`, `applyFloorChange`) 를 옮긴다.
- [x] 3-9 [07] `collectModifiers(state, game)` 와 `calcDerivedStats(state, game)` (6.6, 6.7). AGENTS.md "파생 수치 공식" 표 순서대로 구현한다.
  - 상한: 공격 속도 보너스 100, 치명타 확률 60, 이동 속도 보너스 50, 저항 75 (+ `resCapBonus`), 물리 피해 감소 80%.
  - 무기가 없으면 무기 공격력 2, 공격 간격 0.8초, 근접 판정 2.0m / 60°.
  - 패시브 스킬은 `PASSIVE_MODS = { M2: (v) => ({ firePct: v.firePct, burnDmgPct: v.burnPct }), D4: (v) => ({ hpPct: v.hpPct, hpRegenPct: v.hpRegenPct }), ... }` (`v` = 스킬의 `values(lv)`) 로 수정자에 더한다. 조건이 붙은 패시브 (A8 "HP 50% 이하일 때") 는 `game` 이 있을 때만 적용한다 (6.7).
  - (구현됨) 장비 1개의 수정자는 `equipStats(item)` (원래 12-2 항목이지만 여기서 필요해 먼저 만들었다). 버프는 `game.buffs[].mods` 를 더한다 (9-5 가 그대로 사용).
- [x] 3-10 `__TEST__` 에 `expToNext, killExp, physReduction, createNewGameState, calcDerivedStats, SKILLS, SKILL_LINKS, CONSUMABLES, EQUIP_BASES, THEMES, MONSTER_TYPES, pickNextTheme, applyFloorChange` 를 추가 → **자체 테스트 `PASS 22, FAIL 0, SKIP 0`** (부록 A 의 18개 + 1단계에서 추가한 2개 + 2단계에서 추가한 1개 + 3단계에서 추가한 "데이터 세부·공식" 1개).

완료 조건: 자체 테스트 `PASS 22, FAIL 0, SKIP 0`.

### 4단계: 던전 3D 렌더링 (테마 5종)

목표: 던전 데이터를 테마에 맞는 3D 장면으로 만든다. 조작은 아직 없다 (디버그 카메라로 확인).

- [x] 4-1 [10] 절차적 텍스처 `makeCanvasTexture(size, draw)`: `document.createElement('canvas')` → `draw(ctx, size)` → `new THREE.CanvasTexture(canvas)`, `wrapS = wrapT = THREE.RepeatWrapping`, `colorSpace = THREE.SRGBColorSpace`. 무늬는 `createRng(고정 시드)` 로 그려 항상 같게 한다 (256×256).
  - 테마마다 벽·바닥·천장 텍스처 3장 (아래 표) + 공용 성소 대리석 1장.
  - 재질은 `MeshLambertMaterial({ map })`. 발광 부분 (형광등·용암 균열 등) 은 `emissive` / `emissiveMap` 또는 `MeshBasicMaterial`. 텍스처·재질은 테마별로 한 번만 만들어 공유한다 (4.6). 처음 쓰일 때 만든다 (지연 생성).
  - (구현됨) 그리기 도우미 `drawWrapped` / `texBlob` / `texSpeckle` / `texCracks` (가장자리를 넘는 무늬를 반대편에도 그려 이음새 없이 반복), `drawRock` / `drawMarble` / `drawGoldBand`. 텍스처는 `drawBackroomsWall` 등 테마별 함수 (시드 41xx~48xx). 용암은 색 지도와 발광 지도를 같은 시드의 균열로 그려 선을 맞춘다. 캐시: `getThemeAssets(id)` / `getCommonAssets()` (6.10).
- [x] 4-2 칸별 벽 상자 `buildCellBoxes(cell)` — 부록 B 에 들어 있다 (2단계에서 이미 옮김). 규칙 요약:
  - 칸을 가로·세로 각각 5m | 6m | 5m 로 나눈다. 가운데 6m 가 통로 폭이다.
  - 복도형 (`shape: 'corridor'`): 네 모서리 5×5m 기둥은 항상 막힘. `wall` 인 변의 가운데 6×5m 도 막힘. `door` 인 변은 뚫림.
  - 방형 (`shape: 'room'`): `wall` 변 → 두께 0.5m 벽 전체, `door` 변 → 양쪽 5m 만 벽 (가운데 6m 출입구), `open` 변 → 벽 없음.
  - 모든 상자의 높이는 y −7 ~ 10 (계단이 −6m 까지 내려가므로). **충돌은 테마와 상관없이 이 상자를 그대로 쓴다.**
- [x] 4-3 [11] `THEME_VISUALS[테마 id]` — 테마별 겉모습 (시작값. 스크린샷을 보며 조정한다)

  | 테마 | 벽 | 바닥 | 천장·하늘 | 조명·안개 | 장식 |
  |---|---|---|---|---|---|
  | backrooms | 누런 노란색 시트지 (세로 줄무늬, 옅은 얼룩, 아래쪽 걸레받이) | 젖은 듯한 베이지 카펫 (얼룩) | 흰 천장 타일 격자 + 칸마다 형광등 패널 2개 (`MeshBasicMaterial` 흰색, 실제 조명 아님) | Ambient `0xfff4d6` 0.9, Hemisphere `0xfff8e0`/`0x8a7a50` 0.5, Fog `0x6b6440` 12~75. 형광등 패널 몇 개가 무작위로 깜빡임 (재질 색만 바꿈) | 벽 콘센트·얼룩 |
  | brick | 회갈색 벽돌 + 줄눈 + 이끼 | 낡은 석판 타일 | 어두운 거친 돌 | Ambient `0x6a6a80` 0.5, Hemisphere `0x9aa0b0`/`0x201810` 0.4, Fog `0x07080a` 10~70 | 칸마다 0~1개 횃불 (작은 상자 + 주황 발광 구, 실제 조명 아님), 쇠사슬 |
  | cave | 거친 회갈색 바위 (불규칙 얼룩·균열) | 흙·자갈 | 거친 바위 + 종유석 (원뿔, 칸마다 0~3개) | Ambient `0x405060` 0.35, Hemisphere `0x6080a0`/`0x101010` 0.3, Fog `0x05080a` 8~60 | 청록 발광 수정 (`OctahedronGeometry`, 발광), 석순 |
  | lava | 검붉은 현무암 + 주황 발광 균열 (`emissiveMap`) | 검은 바위 + 군데군데 발광 균열 | 검은 바위 | Ambient `0x803020` 0.5, Hemisphere `0xff8040`/`0x200500` 0.4, Fog `0x1a0805` 8~60 | 벽 아래 용암 줄기 (발광 평면, 장식만이며 피해 없음), 위로 떠오르다 사라지는 작은 불씨 |
  | void | **높이 1.2m** 흰 대리석 난간 (금색 줄) — 충돌은 그대로 (U20) | 흰 대리석 + 금색 줄, 바닥판 두께 1m (떠 있는 느낌) | **천장 없음**. `scene.background = 0x05030c` + 별 (`THREE.Points` 2000개, 반지름 400 구면) + 보라 성운 (큰 반투명 구 2~3개, `BackSide`) | Ambient `0x8070c0` 0.6, Hemisphere `0xb0a0ff`/`0x100020` 0.5, Fog `0x0a0618` 20~110 | 던전 둘레 공중에 떠서 천천히 도는 대리석 기둥 조각·아치·바위섬 10~20개 |

  - 성소 (분수·석상·대리석 바닥), 상인 천막, 포탈은 모든 테마에서 같은 모양을 쓴다.
  - `view.setLightLevel(f)` (0~1): 테마의 Ambient·Hemisphere·발광 장식 밝기에 f 를 곱한다. 플레이어 손전등은 그대로. (백룸 보스 "정전" 패턴에서 사용)
  - (구현됨) 표의 조명·안개 값은 그대로 쓴다. 장식: 백룸 = 형광등 패널 (InstancedMesh + 패널별 색으로 5% 깜빡임) · 걸레받이 (벽 상자를 2.5cm 키운 높이 14cm 띠) · 콘센트 / 벽돌 = 횃불 55% (벽판·손잡이·불꽃·가산 혼합 빛무리, 불꽃 일렁임) · 쇠사슬 20% (천장에서 1.5~4m) / 동굴 = 종유석 0~3 · 석순 0~2 · 수정 무리 30% / 용암 = 벽면의 30% 에 용암 줄기 (흐르는 텍스처) · 불씨 220개 (눈 주위 16m, 수명이 끝나면 어두워지며 사라짐) / void = 별 2000 + 성운 구 3개 (눈을 따라다님, `renderOrder` 음수) · 공중 조각 10~20개 (기둥·아치·바위섬, 던전 위아래 y −56~−16 / 24~48, 안개를 받지 않는 별도 재질 + 약한 발광). 장식은 `DECOR_ROLES` 칸 (복도·막다른 길·통로·공터 방·계단 앞) 에만 둔다 (벽 장식은 상인 방 포함).
  - (구현됨) 성소·상인·포탈 조명이 있는 시설도 `setLightLevel` 대상이다 ("층의 조명이 모두 꺼지고 손전등만 남음"). `&light=0.05` 로 확인 (3.5).
- [x] 4-4 [11] `buildDungeonView(dungeon, theme)` → `{ group, collision, triggers, lights, wallVisualHeight, update(dt, playerPos), setLightLevel(f), dispose() }`
  - 모든 칸의 벽 상자를 모아 부록 C 의 `buildBoxesGeometry(boxes, 4)` 로 **메시 1개** 를 만든다 (테마 벽 재질). void 테마는 그리기용 상자만 `maxY = 1.2` 로 바꿔서 만든다 (충돌 상자는 그대로). `wallVisualHeight` = void 1.2, 그 외 10.
  - 바닥: 계단이 아닌 칸마다 상자 `y −0.5 ~ 0` (void 는 `−1 ~ 0`) 을 모아 메시 1개 (성소 3×3 구역은 대리석 재질로 따로 메시 1개). 천장: void 를 뺀 테마에서 칸마다 `y 10 ~ 10.5` 를 모아 메시 1개.
  - 계단 칸 (step1, step2): 바닥 대신 디딤판 상자. 칸당 8단, 총 16단. 디딤판 i (0~15) 의 윗면 높이 = `±6 × (i + 0.5) / 16` (아래 계단은 −, 위 계단은 +), 아랫면은 y −7, 진행 방향 (`piece.dir`) 으로 깊이 2m, 폭은 가운데 6m.
  - 계단 끝 (step2 칸의 `dir` 쪽 벽) 바로 앞에 폭 6m · 높이 5m 의 평면을 세운다: void 는 보라색 발광 균열, 나머지는 검은색 (`MeshBasicMaterial`) → 더 깊은 통로처럼 보이게.
  - `collision`: `Map<cellKey, box[]>` = `buildCellBoxes` 결과 + 구조물 (분수·카운터 등) 충돌 상자.
  - `triggers`: `[{ kind: 'stairsDown' | 'stairsUp' | 'portal', cellKey }]` (7단계에서 사용).
  - (구현됨) 반환 객체와 사용법은 6.10. 추가 필드 `ceiling, fog, background, cameraFar, dungeon, themeId`, 장면에 붙이기·떼기는 `mountDungeonView` / `unmountDungeonView`. 순수 함수 `collectDungeonBoxes(d, vis)` (충돌 Map + 그리기용 상자) 와 `stairStepBoxes(d, cell)` 로 나눠 자체 테스트로 검사한다. void 계단 칸의 그리기용 벽 높이는 U21.
  - (구현됨) 계단 끝 평면은 끝 벽 면 (step2 칸 시작 변에서 11m) 0.02m 앞, 아래 끝 = 그 자리 디딤판 윗면 − 0.5m.
- [x] 4-5 조명·안개: 4-3 표의 값 + 공통 조명
  - 플레이어 손전등: `PointLight(0xffe6c0, 40, 30, 1)` 을 매 프레임 카메라 위치로 옮긴다 (주인공이 휴대폰 손전등을 켠 것으로 설정. 헤드리스에서 이 값이 4m 앞 물체를 적당히 밝히는 것을 확인함)
  - 성소 `PointLight(0xfff0c8, 80, 40, 1)` (분수 위 6m), 상인 `PointLight(0xffb060, 40, 30, 1)`, 포탈 `PointLight(0xa070ff, 30, 20, 1)`
  - `scene.fog = new THREE.Fog(색, near, far)`, 카메라 far = 120 (void 는 450, 별이 보이도록 별·성운 재질은 `fog: false`)
  - **주의**: 조명의 `visible` 이나 개수를 바꾸면 셰이더가 다시 컴파일되어 화면이 멈칫한다. 멀리 있는 조명은 `intensity = 0` 으로 끄고, 조명 개수는 층을 만들 때 고정한다. 한 층의 PointLight 는 최대 8개 (플레이어 1 + 성소 최대 4 + 상인 1 + 포탈 1 = 7).
  - (조정됨, 2026-10-17 스크린샷 확인) 손전등 40 · 성소 80 은 눈앞 바닥과 성소 대리석이 하얗게 날아가서 낮췄다: 손전등은 테마별 `THEME_VISUALS[id].flashlight` (backrooms 12, brick 22, cave 24, lava 18, void 10), 성소 `SANCTUARY_LIGHT` 30. 성소 대리석 텍스처도 조금 어둡게 했다. 상인·포탈은 표 값 그대로.
  - (구현됨) PointLight 는 시설 유무와 상관없이 항상 7개를 만들고, 없는 시설의 조명은 세기 0 으로 둔다 (층마다 셰이더 재사용).
- [x] 4-6 특수 구조물 (모두 도형 조합, 크기는 대략값)
  - 성소 중심 칸: 원형 분수 (바깥 원통 반지름 4.5m · 높이 0.8m, 안쪽 물 원판 = 파란 반투명, 가운데 기둥) + 기둥 위 석상 (받침 상자 + 원통 몸 + 구 머리 + 팔 상자 2개, 대리석 재질, 약한 `emissive`). 성소 3×3 바닥은 대리석. 충돌: 칸 중심 ±4.5m 상자.
  - 상인 중심 칸: 천막 (`ConeGeometry`), 카운터 상자 (충돌 있음), 상인 인형 (원뿔 로브 + 구 머리 + 모자), 등불 (작은 발광 구).
  - 포탈 칸: 세워진 고리 (`TorusGeometry` 반지름 2.5m), 안쪽 소용돌이 원판 (보라 반투명, 매 프레임 회전).
  - 공터 중심 칸: 무너진 기둥·잔해 상자 몇 개 (충돌 있음, 칸 중심 ±3m 안에만). 보스 공터 (`bossPieceId`) 는 잔해 없이 비워 둔다 (보스 전투 공간).
  - (구현됨) 분수는 `LatheGeometry` (바깥 반지름 4.75m, 테두리 높이 0.85m, 물 높이 0.66m), 석상은 두 팔을 들고 머리 위에 금빛 고리. 상인은 입구 (출입구 칸) 쪽을 바라보는 노점: 기둥 4개 + 줄무늬 사각뿔 지붕 + 카운터 (물약 5병) + 상인 (로브·머리·눈·모자·등짐) + 상자·통 + 깔개 + 등불. 상인 충돌은 카운터, 카운터 뒤 (상인·짐), 앞 기둥 2개. 포탈은 출입구 쪽을 바라보고 받침 위에 고리, 소용돌이는 가산 혼합. 공터 잔해 재질 = 테마 벽 재질.
- [x] 4-7 `floorHeightAt` (부록 B) 로 계산한 계단 높이와 디딤판 모양이 대략 맞는지 확인. — 자체 테스트 "계단 디딤판 높이 = floorHeightAt (4-7)": 디딤판 가운데에서 정확히 같고, 디딤판 위 어디서든 차이 ≤ 0.1875m (반 단). **참고**: step2 칸의 끝 벽 (복도형 칸의 막힌 변 = 가운데 5m 상자) 때문에 실제로 걸어갈 수 있는 최대 진행도는 (16 + 11 − 0.4) / 32 ≈ 0.83 이다 → 7-1 의 트리거 기준을 0.8 로 고쳤다.
- [x] 4-8 디버그 해시 `#debug=view&floor=1&seed=3&theme=…`: 던전 생성 → view 생성 → 카메라를 던전 중심 위 400m 에 두고 아래를 보게 한다 (`camera.position.set(cx, 400, cz); camera.lookAt(cx, 0, cz);` far 를 1000 으로), 천장 메시는 숨긴다. `&eye=1` 이면 `getSpawn(d, 'newGame')` 위치에서 눈높이 1.7m 1인칭 시점. **5개 테마 모두** 1인칭 스크린샷을 찍어 확인한다.
  - (구현됨) 위에서 보기의 카메라 높이는 400m 고정 대신 던전 범위가 화면에 꽉 차는 높이로 계산한다 (`debugTopCamera`, 안개도 끔). `&at=` `&yaw=` `&pitch=` `&light=` 추가 (3.5).
- [x] 4-9 dispose 확인: 디버그 화면에서 view 를 테마를 바꿔 가며 5번 만들고 지운 뒤 `renderer.info.memory.geometries` 가 (공유 자원 제외) 처음과 같은지 콘솔에 출력해 3.4 로 확인.
  - (구현됨) `#debug=viewDispose` (3.5). 결과 (floor 5, seed 7): 테마 5종 1회 후 geometries 24 / textures 26 → 10회 더 만들고 지운 뒤 24 / 26 → OK (생성 중 최대 geometries 30).

완료 조건: 위에서 본 스크린샷에 미로 모양·성소·상점이 보임 / 테마 5종 1인칭 스크린샷이 표의 분위기와 맞음 / 콘솔 오류 없음 / dispose 확인.

### 5단계: 1인칭 조작과 HUD

목표: 던전 안을 걸어다닐 수 있다.

- [x] 5-1 게임 화면 (`SCREENS.game`)
  - 런타임 객체 `game`: `{ state, dungeon, view, player: { pos (THREE.Vector3, 발 위치), vel, yaw, pitch, onGround, exhausted, lastStaminaUseAt }, derived, cooldowns: {}, monsters: [], corpses: [], projectiles: [], drops: [], zones: [], buffs: [], effects: [], paused: false, menuOpen: null, time: 0 }`
  - `startNewGame(slot)`: `createNewGameState(slot)` → `state.dungeonSeed = Math.floor(Math.random() * 2 ** 31)` → `showScreen('game', { state, arrival: 'newGame' })` → 즉시 저장 (U9, 6단계에서 연결).
  - `enter({ state, arrival })`: `generateDungeon(state.dungeonSeed, state.floor)` → `buildDungeonView(d, state.theme)` → 시작 위치 (`state.world.position` 이 있으면 그것, 없으면 `getSpawn(d, arrival)`) → HUD 생성.
  - `exit()`: view dispose, HUD 제거, 입력 콜백 해제, 포인터 락 해제.
  - (4단계에서 준비됨) view 는 `buildDungeonView` → `mountDungeonView(view)` 로 붙이고, 매 프레임 `view.update(dt, camera.position)` 을 부르고, `exit()` 에서 `unmountDungeonView(view)` 로 해제한다 (6.10). 메뉴 배경이 남아 있으면 먼저 `hideMenuBackdrop()`.
  - (구현됨) 런타임 생성은 [13] `createGameRuntime(state, arrival, debug)`. 위 목록에 더한 필드: `debug` (디버그 해시로 시작 → 6단계에서 저장 금지), `player.running`, `visited` (Set, 5-9), `currentCell`, `inSanctuary`. 시작 위치는 `playerStartPosition` (저장 위치가 던전 안이면 그곳, 아니면 `getSpawn`. `arrival: 'load'` 인데 위치가 없으면 성소). 매 프레임 순서: `updateGame` (일시정지면 바로 반환 → 파생 수치 → 슬롯 선택 → 시점 → 이동 → 현재 칸 → 회복) → `syncCamera` → `view.update` → `updateHud`.
  - (구현됨) `startNewGame` 은 상태 생성·시드 결정·화면 이동까지 (저장은 6-7). `continueGame` 은 `readSlot` 데이터를 `arrival: 'load'` 로 넘긴다 (형식 검사는 6-5·6-6). 1단계 임시 화면과 그 문구 (`game.preparing` 등) 는 삭제했다.
- [x] 5-2 [12] 부록 E 의 입력 코드를 넣고, `initialize` 에서 stage 를 만든 뒤 `setupInput()` 을 한 번 호출한다. `frame()` 끝 (렌더링 뒤) 에서 `endInputFrame()` 을 호출한다. 키는 `e.code` 로 판별한다 (`KeyW`, `ShiftLeft`/`ShiftRight`, `Space`, `Tab`, `Escape`, `Digit1` …).
- [x] 5-3 포인터 락: 게임 화면에서 잠기지 않은 상태면 화면 가운데에 "클릭하여 계속" 반투명 오버레이를 보여준다. 오버레이의 `click` 핸들러에서 `requestLock()`. 잠기면 오버레이를 숨긴다 (`input.onLockChange`). 게임 조작 (시점, 우클릭 사용, 좌클릭 상호작용) 은 `input.locked` 일 때만 처리한다.
  - (구현됨) 오버레이에는 조작 안내 한 줄도 표시한다. **오버레이가 보이는 동안은 `updateGame` 을 부르지 않는다** (게임 시간 정지, 렌더링·장식 애니메이션은 계속). 헤드리스 Chromium 에서도 오버레이 클릭 → `requestPointerLock` 이 성공해 오버레이가 사라지고 게임이 진행되는 것을 확인했다.
- [x] 5-4 시점: 잠긴 상태에서 `yaw −= input.dx × 0.0022`, `pitch −= input.dy × 0.0022`, `pitch` 는 ±1.48 로 제한.
- [x] 5-5 [13] 이동
  - 입력 방향 = 앞 (W) · 뒤 (S) · 왼쪽 (A) · 오른쪽 (D) 을 합친 뒤 길이 1 로 정규화 (4.4 의 앞·오른쪽 벡터).
  - 달리기: Shift 를 누르고 있고 + 움직이는 중 + 탈진 아님 + 스태미너 > 0 → 속도 `runSpeed`, 스태미너 초당 15 소모. 아니면 `walkSpeed`.
  - 점프: Space, 땅에 있을 때 + 탈진 아님 + 스태미너 ≥ 10 → 스태미너 10 소모, `vel.y = 6.93` (높이 약 1.2m). 중력 −20 m/s².
  - 땅 판정: `pos.y ≤ floorHeightAt(d, x, z) + 0.001` 이면 `pos.y = 바닥 높이`, `vel.y = 0`, `onGround = true`. 계단을 내려갈 때 붕 뜨지 않도록, 땅에 있던 상태에서 바닥이 0.5m 이내로 낮아지면 바로 바닥에 붙인다.
  - 스태미너 회복: 마지막 소모 후 1초가 지나면 초당 `staminaRegen`. 0 이 되면 탈진, 30 이상 회복되면 탈진 해제 (AGENTS.md "스태미너").
  - 카메라 위치 = `(pos.x, pos.y + 1.7, pos.z)`.
  - (구현됨) 상수 [13]: `PLAYER_RADIUS 0.4, EYE_HEIGHT 1.7, GRAVITY 20, JUMP_SPEED 6.93, MOUSE_SENSITIVITY 0.0022, PITCH_LIMIT 1.48, STEP_DOWN_SNAP 0.5, STAMINA_RUN_PER_SEC 15, STAMINA_JUMP 10, STAMINA_REGEN_DELAY 1, EXHAUST_RECOVER_AT 30`. 스태미너 소모는 `spendStamina(g, n)` 하나로 한다 (근접 스킬 14단계도 이것을 쓴다).
  - (구현됨, 문서에 없던 것) **HP·MP 자연 회복** (`derived.hpRegen` / `mpRegen`, AGENTS.md "파생 수치 공식") 이 어느 단계에도 없어서 `updateRegen` 에서 스태미너 회복과 함께 처리한다. HP 가 0 이하면 회복하지 않는다 (사망 8단계).
- [x] 5-6 충돌: 부록 F 의 `moveWithCollision(view.collision, pos, 0.4, 이동x, 이동z)`. 한 프레임 이동을 0.3m 단위로 나눠 처리한다 (부록 F 에 포함).
- [x] 5-7 [19] HUD (전부 `ug-hud` 안)
  - 크로스헤어: 화면 정중앙 십자 (24px, 흰색 반투명 + 그림자).
  - 왼쪽 아래: HP (빨강) · MP (파랑) · 스태미너 (초록, 탈진 시 회색) 막대, 막대 위에 `현재 / 최대` 숫자. (숫자는 글자와 다른 요소로 나누고 `.ug-num` 글꼴, 4.5)
  - 아래 가운데: 행동 슬롯 7칸 (칸 80×80px). 칸마다 번호 (1~7), 내용 약자 (스킬은 이름 앞 2글자, 소모품은 이름 앞 2글자 + 개수), 재사용 대기 중이면 어둡게 + 남은 초. 활성 슬롯은 금색 테두리.
  - 화면 맨 아래 전체 너비의 얇은 경험치 막대 + "Lv n".
  - 왼쪽 위: "지하 N층 · {테마 이름}". 성소 구역 안이면 그 아래 "성소 — 저장 가능".
  - 오른쪽 위: 상태이상·버프 아이콘 자리 (9단계). 위쪽 가운데: 보스 HP 막대 자리 (10단계).
  - (구현됨) `createHud()` → `{ root, refs, cache }`, `updateHud(hud, g)` 는 `hudSet(cache, key, value, apply)` 로 값이 바뀐 요소만 고친다. 자리: `refs.effects` (9단계), `refs.boss` (10단계, 지금은 `display: none`).
  - (구현됨, 글꼴 규칙 4.5) 숫자는 모두 글자와 다른 요소 + `.ug-num`: 왼쪽 위는 3줄 "지하 층" (설명) / `B3` (숫자) / 테마 이름 (+ 성소 안내). 막대는 숫자 줄 (`87 / 100`) 이 막대 위에 따로 있고 막대 안에 이름 (HP·MP·스태미너, 탈진이면 "탈진"). 오른쪽 아래 "Lv" + 레벨 숫자 + 경험치 `현재 / 필요`.
  - (구현됨) 행동 슬롯: 스킬은 이름 앞 2글자 (갈래별 글자색), 소모품은 **단계 수식어 (하급·상급 / Lesser·Greater) 를 뺀** 이름 앞 2글자 + 오른쪽 위 단계 표시 Ⅰ·Ⅱ·Ⅲ + 개수 (분류별 배경색). 그냥 앞 2글자로 하면 하급 물약이 모두 "하급" 이 되어 구별할 수 없기 때문이다. 개수 0 이면 흐리게 (AGENTS.md "회색 처리"). 재사용 대기는 `game.cooldowns[스킬 id]` / `game.cooldowns[itemCooldownKey(소모품 id)]` (남은 초) 를 읽어 10초 미만은 소수 1자리로 표시한다 — 8·12·14단계는 이 키로 재사용 대기를 넣으면 된다.
- [x] 5-8 활성 슬롯 선택 (U3): `Digit1`~`Digit7`, 휠. — 휠은 끝에서 반대쪽 끝으로 순환하고 빈 슬롯도 고를 수 있다. `state.player.activeSlot` 에 저장.
- [x] 5-9 방문 칸 기록: 현재 칸 키를 방문 목록에 추가 (게임 중에는 `Set` 으로 관리하고, 저장·층 이동 때 `state.world.visited` 배열로 바꾼다).
- [x] 5-10 성소: 현재 칸이 `sanctuaryZone` 이면 HP·MP 를 초당 최대치의 5% 회복 (상태이상 해제는 9단계에서 연결).
- [x] 5-11 디버그 해시 `#debug=game&floor=1&seed=3&theme=…` → 저장하지 않는 새 게임으로 진입. 헤드리스에서는 포인터 락이 안 되므로 오버레이가 보이는 것이 정상이다. `&noOverlay=1` 이면 오버레이를 숨긴다.
  - (구현됨) `startDebugGame(opts)`. `&fakeLock=1` 추가 (3.5). 자동 확인 결과는 9절.
- [x] 5-12 (사용자 확인 필요) WASD 이동, 마우스 시점, 점프, 달리기·탈진, 벽에 막힘 (void 테마의 낮은 난간도 넘어가지 못함), 계단 오르내리기, 성소에서 HP 회복. — Playwright Chromium 으로 키 입력·휠·마우스 이동량·실제 포인터 락 33건 자동 확인 완료 (2026-10-17, 5-1~5-11 때 37건 + 마무리 때 33건 재실행). 실제 마우스·키보드로 느끼는 조작감 확인은 권장 (0절).

완료 조건: 스크린샷에 1인칭 던전 + HUD / 콘솔 오류 없음 / 사용자 확인 항목 등록.

### 6단계: 시스템 메뉴 골격·지도·시스템 탭·저장/불러오기

목표: AGENTS.md "시스템 메뉴" 중 지도·시스템 탭과 저장 규칙.

- [x] 6-1 [20] 메뉴 열기 / 닫기
  - 열기: 게임 중 `Tab` (반드시 `preventDefault`) 또는 `Escape`.
    **포인터 락 상태에서 ESC 를 누르면 브라우저가 먼저 락을 풀고, keydown 이 오지 않을 수 있다.** 그래서 `input.onLockChange(false)` 에서 "게임 중 + 메뉴 닫힘 + 대화상자 없음 + 층 이동 중 아님 + 사망 아님" 이면 메뉴를 연다. 이렇게 열렸을 때는 직후 300ms 안에 오는 `Escape` keydown 을 무시한다 (열리자마자 닫히는 것 방지).
  - 닫기: 메뉴가 열린 상태에서 `Tab` / `Escape`, 또는 메뉴의 [닫기] 버튼. 닫은 뒤에는 "클릭하여 계속" 오버레이가 보이고, 클릭하면 다시 락. (키 입력으로는 락을 걸 수 없다)
  - 메뉴가 열려 있으면 일시정지 (U6): 게임 업데이트 함수 첫 줄에서 `if (game.paused) return;` (렌더링은 계속).
  - (5단계에서 준비됨) `updateGame` 첫 줄에 이미 `if (g.paused) return;` 이 있다. 오버레이 ("클릭하여 계속") 는 `SCREENS.game.refreshOverlay()` 가 `input.locked` 로 보이고 숨긴다 → 메뉴가 열려 있으면 오버레이를 숨기도록 조건을 더한다. 락 변경 콜백은 `input.onLockChange` (지금은 `refreshOverlay` 만 부름).
  - (구현됨) `SCREENS.game` 에 `menu` (열린 메뉴), `menuEscGuardUntil`, `canOpenMenu()`, `openMenu(tab, byLockLoss)`, `closeMenu()`, `onKeyDown(e)` (TAB / ESC, `e.repeat` 무시). 키보드로 열 때도 `releaseLock()` 으로 락을 풀어 커서를 보여준다. 대화상자가 열려 있으면 `onGlobalKeyDown` 이 ESC 를 먼저 처리하고 화면에 넘기지 않으므로 ESC 는 대화상자만 닫는다. 런타임에 `changingFloor`, `dead` (기본 false) 를 추가했다 → **7단계 `changeFloor` 는 진행 중 `g.changingFloor = true`, 8단계 사망 처리는 `g.dead = true`** 로 메뉴가 열리지 않게 한다. `g.menuOpen` = 열린 탭 이름 (닫히면 null). `&fakeLock=1` 에서는 메뉴를 열면 `input.locked = false`, 닫으면 다시 true (자동 확인용). 상수 `MENU_ESC_GUARD_MS = 300`.
- [x] 6-2 탭 5개: [지도] [스테이터스] [인벤토리] [스킬] [시스템]. 마지막으로 연 탭을 기억한다. 이 단계에서 스테이터스·인벤토리·스킬은 "준비 중" 문구만.
  - (구현됨) `createSystemMenu(g, tab, onClose)` → `{ root, tab, select(tab), destroy() }`. 탭 내용은 `MENU_TAB_RENDERERS[탭] = (g, body) => …` — **11·12·13단계는 이 표에 `status`·`inventory`·`skill` 을 추가하면 된다** (없는 탭은 "준비 중"). 마지막 탭은 `systemMenu.lastTab` (모듈 변수, 게임을 다시 시작해도 유지). 위쪽 막대: 탭 5개 + "ESC / TAB 으로 닫기" + [닫기]. 탭을 바꾸거나 닫으면 떠 있는 툴팁을 지운다 (`clearTooltips`). CSS `.ug-sysmenu` (z-index 40: 게임 위, 대화상자 100·토스트 150·툴팁 200 아래).
- [x] 6-3 지도 탭: 2D `<canvas>` (1600×860).
  - 칸 크기 = 던전 전체가 들어가는 가장 큰 크기 (최소 6px, 최대 40px). 칸 좌표의 최소·최대로 범위를 구해 가운데 정렬.
  - 방문한 칸: 바닥색 채움 + `wall` 변은 굵은 선, `door`·`open` 변은 선 없음. 조각 표시: 성소 "✚" (금색), 상인 "$", 포탈 "◎" (보라), 위 계단 "▲", 아래 계단 "▼", 보스 공터 "☠" (보스를 처치했으면 회색).
  - 방문하지 않은 칸: 칸 윤곽만 불투명도 0.25 (U10). 아이콘·벽은 숨김.
  - 플레이어: 현재 위치에 yaw 방향을 가리키는 삼각형.
  - 위쪽에 "지하 N층 · {테마 이름}", 아래에 범례 한 줄.
  - (구현됨) `mapLayout(d, w, h, focus)` (순수 함수: 칸 크기 + 가운데 정렬 오프셋, 최소 크기로도 넘치는 방향은 플레이어 칸을 가운데), `drawDungeonMap(canvas, g)`, `drawMapIcons`, `drawMapPlayer`, `renderMapTab`. 방문한 칸은 시설별 바닥색 (`mapCellFill`: 성소 구역 금색, 상인 녹색, 공터 갈색, 보스 공터 붉은색, 계단 디딤 칸 푸른색, 포탈 보라) + 칸 안쪽 옅은 격자선. 아이콘 위치 (`mapIconOf`): 성소·상인·보스 공터 = 중심 칸, 포탈 = 그 칸, 계단 = 첫 디딤 칸 (`cells[1]`). 아이콘은 그 칸을 방문했을 때만 보인다. 제목은 "지하 층" / `B3` (`.ug-num`) / 테마 이름을 별도 요소로 (4.5). 범례 8개 (아이콘 6 + 현재 위치 + 방문하지 않은 칸). 아이콘 글꼴은 `MAP_ICON_FONT` (`'Segoe UI Symbol'` 우선 — 본문 글꼴에 ☠ 가 없어 작은 그림 문자로 대체되던 문제). canvas 는 `box-sizing: content-box` (`.ug-ui *` 의 border-box 때문에 테두리만큼 줄어들어 흐려지던 것 방지), 내부 해상도는 `stageScale × devicePixelRatio` (1~2배). 지도는 메뉴를 열 때·탭을 고를 때 한 번 그린다 (열려 있는 동안은 일시정지라 바뀌지 않음). **S5 탐험가의 감각·주문서의 "지도 공개" (12·14단계) 는 칸 키를 `g.visited` 에 넣으면 그대로 표시된다.**
- [x] 6-4 시스템 탭: [저장] [메인 메뉴] 버튼 두 개.
  - [저장]: 성소 구역 안일 때만 활성. 밖이면 `is-disabled` + 클릭 시 툴팁 "성소 주변에서만 저장할 수 있습니다." 를 4초 동안 표시 (AGENTS.md).
  - 활성 상태에서 클릭 → `saveGame()` → 토스트 "저장했습니다".
  - [메인 메뉴]: 성소 구역 안 → `saveGame()` 후 확인 없이 `showScreen('mainMenu')`. 밖 → 대화상자 "지금 나가면 저장되지 않습니다. 그래도 메인 메뉴로 나가시겠습니까?" [예] [아니오] → [예] 이면 저장 없이 메인 메뉴.
  - (구현됨) `renderSystemTab`, `leaveToMainMenu`. 버튼 위에 "저장 슬롯 / 1", "마지막 저장 / 2026-10-17 12:00" (숫자는 별도 요소 + `.ug-num`) 과 성소 안·밖 안내 한 줄. 성소 판정은 `g.inSanctuary` (U5, 메뉴를 열 때의 값). 성소 안에서 [메인 메뉴] 로 나가면 메인 메뉴에서 "저장했습니다." 토스트. 저장 실패 처리는 U22. 디버그 게임은 저장하지 않고 "디버그 게임은 저장하지 않습니다." 안내 (5-1 의 `debug`).
- [x] 6-5 [09] `serializeState(state, game)` (현재 위치·yaw·방문 칸을 `state.world` 에 넣고 JSON 문자열 반환. `world.history` 도 그대로 들어간다), `deserializeState(json)` (객체로 바꾸고 형식 검사, 실패하면 `null`). `saveGame()` = `writeSlot(state.slot, …)`.
  - (구현됨) `writeSlot(i, state, game)` 이 `serializeState` 를 거친다 (game 이 없으면 그냥 JSON). `saveGame(g)` ([18]) = 디버그 게임이면 false, 아니면 `writeSlot(g.state.slot, g.state, g)`. 저장 위치 `{ x, y, z, yaw }` 의 yaw 는 −π~π 로 정규화. `deserializeState` 는 `isValidState` → `isValidPlayer` (레벨·수치·스탯·스킬 id/레벨·장비 7칸과 부위·인벤토리 40칸·행동 슬롯 7칸·활성 슬롯) / `isValidItem` / `isValidWorld` (방문 칸·상인 품절·보스·위치·위층 기록) 로 **게임이 읽는 값을 모두 검사**한다. `readSlot` 은 1단계 그대로 가벼운 검사 (슬롯 화면 요약용, 기존 테스트가 최소 객체를 'ok' 로 기대함) 이고, 이어하기는 `deserializeState` 로 다시 검사한다. [09] 에 `EQUIP_SLOT_KEYS` 추가.
- [x] 6-6 `continueGame(slot)`: `readSlot` → `showScreen('game', { state, arrival: 'load' })` → 같은 시드·층·테마로 던전 재생성 → 방문 칸 복원 → 저장한 위치에서 시작. 현재 층 몬스터는 새로 생성한다 (U19, 8단계 이후). — **2026-10-18 규칙 변경: 현재 층 몬스터도 `world.runtime` 으로 저장·복원한다 (7-9)**
  - (구현됨) `storageGet(slotKey(slot))` → `deserializeState` (실패하면 토스트 "저장 데이터를 불러올 수 없습니다." 후 슬롯 화면 유지) → `state.slot = slot` → `showScreen('game', { state, arrival: 'load' })`. 재생성·방문 칸·위치 복원은 5단계의 `createGameRuntime` / `playerStartPosition` 이 이미 처리한다.
- [x] 6-7 `startNewGame` 끝에서 즉시 저장 (U9).
  - (구현됨) `showScreen('game')` 직후 `saveGame(SCREENS.game.game)` (런타임이 정한 시작 위치까지 저장). 실패하면 U22 토스트.
- [x] 6-8 자체 테스트 추가: `createNewGameState` → `serializeState` → `deserializeState` 왕복 후 `player`, `floor`, `dungeonSeed`, `theme`, `world.history` 가 같은지 (`JSON.stringify` 비교). `__TEST__` 에 두 함수 추가.
  - (구현됨) 테스트 2개: "저장·불러오기 왕복" (위층 기록 2개를 만든 상태 왕복, 런타임 위치·시선 정규화·방문 칸, 형식 오류 28가지 → null, 새 게임 상태), "지도 배치" (지하 1·5·100·385층: 칸 크기 6~40, canvas 안, 가운데 정렬, 가장 큰 크기). `__TEST__` 에 `mapLayout, MAP_W, MAP_H, MAP_CELL_MIN, MAP_CELL_MAX` 도 추가.
- [x] 6-9 디버그 해시 `&menu=map`, `&menu=system` 으로 스크린샷 확인.
  - (구현됨) `&reveal=1` (모든 칸 방문 처리) 도 추가 (3.5). 스크린샷은 9절.
- [x] 6-10 (사용자 확인 필요) ESC / TAB 로 열고 닫기, 성소 밖에서 저장 버튼 툴팁, 성소 안에서 저장 → 메인 메뉴 → 이어하기 시 같은 위치. — Playwright Chromium 으로 실제 포인터 락 해제·ESC·TAB·툴팁 시간·저장/이어하기 위치까지 66건 자동 확인 완료 (9절). **2026-10-18 사용자가 실제 브라우저에서 4가지 모두 정상 동작 확인.**

완료 조건: 저장·불러오기 왕복 테스트 PASS, 지도·시스템 탭 스크린샷 확인.

### 7단계: 층 이동·테마 전환·층 기록

목표: AGENTS.md "던전 구성요소" 의 계단·포탈과 "던전 테마" 의 테마 전환·위층 유지 규칙.

- [x] 7-1 트리거 판정 (매 프레임)
  - 아래 계단: 플레이어가 `stairsDown` 조각의 step2 칸에 있고 `stairsProgress` (부록 B) ≥ 0.8 → `changeFloor('descend')`
  - 위 계단: `stairsUp` 조각의 step2 칸에서 진행도 ≥ 0.8 → `changeFloor('ascend')` (지하 1층에는 위 계단이 없다)
  - (4단계에서 보정) 처음 문서의 기준 0.92 는 끝 벽 때문에 도달할 수 없다 (최대 ≈ 0.83, 4-7). 0.8 = 끝 벽 약 1m 앞. 트리거 칸은 `view.triggers` (6.10)
  - 포탈: 포탈 칸 중심에서 수평 거리 2m 이내 → `changeFloor('portal')`
  - 재발동 방지: 트리거 밖에 있다가 안으로 **들어오는 순간** 에만 발동한다 (이전 프레임 상태 `wasInTrigger` 를 저장).
  - (구현됨) [08] 순수 함수 `collectFloorTriggers(d)` (`buildFacilities` 에 있던 트리거 목록 만들기를 옮김 → `view.triggers`), `floorTriggerAt(d, triggers, x, z)`, 상수 `STAIRS_TRIGGER_PROGRESS = 0.8`, `PORTAL_TRIGGER_RADIUS = 2`, `TRIGGER_FLOOR_CHANGE` (트리거 → descend / ascend / portal). [13] `updateFloorTriggers(g)` 를 `updateGame` 의 `updateCellState` 다음에 호출. 런타임 `g.wasInTrigger` 는 시작·층 교체 직후에도 현재 위치로 계산한다 (트리거 안에서 시작해도 바로 발동하지 않음).
- [x] 7-2 런타임 스냅샷 함수 (6.9 형식): `snapshotFloorRuntime(game)` → `{ monsters, corpses, drops }`, `restoreFloorRuntime(game, runtime)`. 이 단계에서는 몬스터가 없으므로 빈 배열을 다루는 뼈대만 만들고, 8·10·12단계에서 채운다.
  - (구현됨) [13] `snapshotFloorRuntime(g)`: 살아 있는 (`hp > 0`) 몬스터만 6.9 필드로 (6.8 런타임 몬스터의 `pos.x/z`, `spawn.x/z` 를 읽음), 시체 `{ typeId, elite, x, z, yaw }`, 바닥 아이템 `{ item, x, z }` — **8·12단계는 런타임 시체·바닥 아이템 객체를 이 필드 이름으로 만들면 된다**. `restoreFloorRuntime(g, runtime)` 은 지금은 종류별 개수만 돌려준다 → 8단계 (몬스터·시체)·12단계 (바닥 아이템) 에서 실제 객체를 만들도록 채운다. `clearFloorRuntime(g)`: 6개 목록 (`monsters, corpses, projectiles, drops, zones, effects`) 의 `mesh` 를 장면에서 빼고 비운다 (공유 지오메트리·재질은 dispose 하지 않음, 개체 전용 자원이 생기면 여기서 해제).
- [x] 7-3 `changeFloor(kind)`:
  1. 입력 잠금 → 화면을 0.4초 동안 검게
  2. `state.world.visited` 갱신 (현재 방문 Set → 배열)
  3. `const r = applyFloorChange(state, kind, snapshotFloorRuntime(game), Math.random)` (부록 G) — 층 번호·시드·테마·방문 칸·상인 품절·보스 처치·층 기록이 모두 여기서 바뀐다
  4. 이전 view·몬스터·시체·투사체·바닥 아이템 dispose
  5. `generateDungeon(state.dungeonSeed, state.floor)` → `buildDungeonView(d, state.theme)` → `getSpawn(d, kind)` (kind 를 그대로 넘긴다: 내려왔으면 새 층의 위 계단 앞, 올라왔으면 그 층의 아래 계단 앞)
  6. 방문 Set 을 `state.world.visited` 로 다시 만들기 (복원된 층이면 이전 방문 기록이 살아 있음)
  7. `r.runtime` 이 있으면 `restoreFloorRuntime`, 없으면 몬스터 새로 생성 (8단계부터)
  8. 0.4초 동안 밝게 → 토스트 "지하 N층 · {테마 이름}"
  - (구현됨) 세 부분으로 나눴다. [13] `changeFloor(g, kind)` = 1 (`g.changingFloor = true`, `g.transition = { kind, phase: 'out', t }`), [13] `swapFloor(g, kind)` = 2~7 (같은 런타임 객체 `g` 에서 `dungeon`·`view`·위치·방문 Set·층 런타임만 바꾸고 재사용 대기·버프·`time` 은 유지. 시작 위치는 `placePlayer` — 시선 수평 (pitch 0)), [18] `SCREENS.game.updateTransition(dt)` = 진행 (검은 막 `.ug-fade` 불투명도 0 → 1 → `swapFloor` → 1 → 0) + 8 (토스트). 상수 `FLOOR_FADE_TIME = 0.4`. 연출 중에는 `updateGame` 을 부르지 않고 (입력 잠금), 시스템 메뉴도 열리지 않는다 (`changingFloor`). 포인터 락이 풀려도 연출은 끝까지 진행하고, 끝난 뒤 "클릭하여 계속" 이 보인다.
  - (구현됨) 토스트·지도 제목은 `floorLabelNode(state, prefix)` 공용 ("지하 층" / `B3` (`.ug-num`) / 테마 이름, 4.5). `showToast(content, ms, className)` 이 문자열 대신 DOM 노드도 받도록 바꿨다.
- [x] 7-4 HUD 층·테마 표시 갱신. 지도 탭도 새 층 기준으로.
  - (구현됨) 따로 고칠 것 없음: HUD 는 `hudSet` 이 층·테마 값이 바뀌면 다시 그리고, 지도는 메뉴를 열 때 `g.dungeon`·`g.visited` 로 그린다. 자동 확인으로 HUD `B2`·테마 이름, 지도 제목·방문 칸을 확인했다.
- [x] 7-5 디버그 해시 `&at=stairsDown` 등으로 계단·포탈 앞에서 시작해 스크린샷 확인.
  - (구현됨) `startDebugGame` 이 `debugViewpoint` (4단계 `#debug=view&eye=1&at=` 과 같은 위치·시선) 의 위치를 `state.world.position` 에 넣고 시작한다 (시선 위아래는 `params.pitch`).
- [x] 7-6 (사용자 확인 필요) 내려가기 → 테마가 바뀜 / 다시 올라오기 → 이전 테마·지도·방문 칸 그대로, 아래 계단 앞에서 시작 / 포탈 → 같은 층 번호, 다른 테마. — Playwright 로 44건 자동 확인 완료 (9절). **2026-10-18 사용자가 3가지 모두 동작 확인.**

#### 7단계 보완: 층 정보 저장 규칙 변경 (2026-10-18)

사용자가 AGENTS.md "던전 구성요소" 끝에 층 정보 저장 규칙을 추가했다 (같은 날 "포탈"·"방랑 상인"·"던전 테마"·"몬스터 > 생성 규칙"·"보스" 문구도 이에 맞춰 고침). 요약:
- 이미 지나간 층의 지형 배치 (시드·테마) 와 지도는 **모두** 저장한다. 다음 층도 미리 정해 저장한다 (내려가면 그 아래층까지).
- 위로 올라갔다 다시 내려와도 두 층 모두 그대로다 (옛 U17 "다시 내려가면 새 층" 폐기).
- 포탈을 타면 맨 위층까지 **모든 층** 이 초기화된다 (테마·지형을 다시 무작위로).
- 몬스터·시체 등은 **현재 층과 바로 이전 층** 만 유지하고 저장 데이터에도 넣는다 (계단을 오가며 몬스터를 피하는 것 방지). 그 밖의 지나온 층은 다시 들어가면 몬스터를 새로 생성.

- [x] 7-7 [09] `applyFloorChange(state, kind, leavingRuntime, rnd)` 를 새 규칙으로 바꾼다. 이름·인자·반환 형식 (`{ restored, runtime }`) 은 그대로 둔다 (`swapFloor` 는 고치지 않아도 됨).
  ```js
  // 새로 정하는 층은 이 함수 하나로만 만든다 (U16: 이웃한 층의 테마를 뺀 4종 중 무작위)
  function makeFloorRecord(floor, excludeTheme, rnd) {
      return { floor, seed: Math.floor(rnd() * 2147483647), theme: pickNextTheme(excludeTheme, rnd),
               visited: [], merchantSoldOut: [], bossDefeated: false, runtime: null };
  }
  // 다음 층 (현재 + 1) 이 정해져 있지 않으면 미리 정한다
  function ensureNextFloor(state, rnd) {
      const next = state.floor + 1;
      if (!state.world.history[next]) state.world.history[next] = makeFloorRecord(next, state.theme, rnd);
  }
  function applyFloorChange(state, kind, leavingRuntime, rnd) {
      const w = state.world, history = w.history;
      const leaving = { 떠나는 층의 floor·seed·theme·visited·merchantSoldOut·bossDefeated, runtime: leavingRuntime || null };
      let target, rec = null;
      if (kind === 'portal') {
          for (const key of Object.keys(history)) delete history[key];      // 맨 위층까지 전부 초기화
          target = makeFloorRecord(state.floor, leaving.theme, rnd);         // 같은 층 번호의 새 층
      } else {
          const floor = kind === 'descend' ? state.floor + 1 : state.floor - 1;   // ascend 는 floor ≥ 2 일 때만 (아니면 throw)
          rec = history[floor] || null;
          delete history[floor];                                               // 들어갈 층은 현재 층이 되므로 기록에서 뺀다
          for (const key of Object.keys(history)) history[key].runtime = null; // 이전 층이 바뀐다
          history[leaving.floor] = leaving;                                    // 떠나는 층 = 새 "이전 층" (runtime 유지)
          target = rec || makeFloorRecord(floor, leaving.theme, rnd);          // 기록이 없으면 (포탈 뒤 올라가기 등) 새로 정함
      }
      state.floor, dungeonSeed, theme ← target. w.visited ← decodeVisited(target.visited) (7-8 전에는 배열 복사),
      w.merchantSoldOut, w.bossDefeated ← target. w.position = null, w.runtime = null.
      ensureNextFloor(state, rnd);
      return { restored: !!rec, runtime: rec ? rec.runtime : null };
  }
  ```
  - `HISTORY_LIMIT` 와 "현재 층 이하 기록 삭제" 코드는 지운다 (U18).
  - `ensureNextFloor(state, Math.random)` 를 `createGameRuntime` 에서도 호출한다 → 새 게임 (지하 2층을 미리 정함)·이어하기 (이전 형식 저장 데이터에 다음 층이 없을 때)·디버그 게임이 모두 한 곳에서 처리된다. `startNewGame` 의 즉시 저장은 화면 진입 뒤이므로 지하 2층 기록까지 저장된다.
  - [09] `isValidWorld` 는 그대로 통과한다 (기록 형식이 같음). `__TEST__` 에 `makeFloorRecord, ensureNextFloor` 추가.
  - (구현됨) 위 의사 코드 그대로. 알 수 없는 종류·지하 1층에서 올라가기는 처음에 오류. 새 층 기록의 `visited` 는 `''` (7-8 압축 형식의 "없음"). `createNewGameState` 의 `world` 에 `runtime: null` 추가 (`history` 는 빈 객체 그대로 — 기존 테스트 "새 게임 시작 시 파생 수치" 유지).
- [x] 7-8 기록의 방문 칸 압축 (U18 의 크기 대책). 무한 던전이라 기록이 계속 늘어나는데, 512칸 층의 방문 칸 배열은 JSON 으로 약 4KB 라 수백 층이면 localStorage (보통 5MB, 4개 슬롯 공용) 를 넘을 수 있다.
  - [09] 순수 함수 `encodeVisited(keys)` → 문자열 (`''` = 없음, 아니면 `"minGx,minGz,w,h:" + base64(방문 여부 비트열, 행 우선)`), `decodeVisited(v)` → 키 배열 (배열이 들어오면 그대로 = 이전 형식, 빈 값이면 `[]`). 던전 데이터 없이 동작해야 한다 (`applyFloorChange` 가 순수 함수이므로).
  - `applyFloorChange` 가 떠나는 층의 `visited` 를 `encodeVisited` 로 넣고, 들어갈 층은 `decodeVisited` 로 푼다. 현재 층 `world.visited` 는 배열 그대로 (6-5).
  - `isValidWorld`: 기록의 `visited` 는 문자열 또는 문자열 배열.
  - 자체 테스트: 빈 목록·음수 좌표·한 칸·512칸 왕복이 같음 (순서 무관), 실제 512칸 층 (예: `generateDungeon(9, 385)`) 의 모든 칸을 방문한 기록 1000개를 넣은 상태의 `JSON.stringify(state)` 길이 < 1MB.
  - (구현됨) [09] `encodeVisited`, `decodeVisited`, `isValidVisitedField`, `VISITED_CODE_RE`, `VISITED_CODE_MAX_SIDE = 1024` (손상된 값으로 큰 반복을 돌지 않도록 가로·세로 제한). 비트 i = 칸 (minGx + i % w, minGz + ⌊i / w⌋), 바이트 안에서는 낮은 비트부터, base64 는 `btoa` / `atob` (브라우저·Node 모두 있음). 측정: 128칸 층 배열 969자 → 125자, 227칸 1669 → 218, 512칸 3882 → 373. 512칸을 모두 방문한 기록 1000개 = 저장 JSON 약 500KB (U18 목표 1MB 이하).
- [x] 7-9 현재 층 몬스터 저장 (U19): `serializeState(state, game)` 이 `state.world.runtime = snapshotFloorRuntime(game)` 을 넣는다. `createGameRuntime` 은 `arrival === 'load'` 이고 `world.runtime` 이 있으면 `restoreFloorRuntime` (8단계 전에는 개수만), 없으면 몬스터 새로 생성 (8단계). 런타임을 만든 뒤 `world.runtime = null` (이후 현재 상태는 런타임 객체가 가짐). `isValidWorld` 에 `runtime` (없음·null·객체 허용 — 없으면 이전 형식) 추가. 층 이동 때는 `applyFloorChange` 가 `null` 로 둔다.
  - (구현됨, 위 설명과 다른 점) `serializeState` 는 스냅샷을 **저장 문자열에만** 넣고 `state.world.runtime` 은 건드리지 않는다 (`{ ...state, world: { ...state.world, runtime } }` 를 JSON 으로). 처음에는 설명대로 state 에 넣었는데, 그러면 저장한 뒤 플레이하는 동안 낡은 스냅샷이 state 에 남는 것을 브라우저 확인 (7-11) 에서 발견해 고쳤다. 그래서 플레이 중 `state.world.runtime` 은 항상 null 이다. [09] `isValidRuntimeSnapshot` (null 또는 `monsters`·`corpses`·`drops` 가 없거나 배열인 객체 — 항목 검사는 8·12단계에서 더함) 을 `world.runtime` 과 기록의 `runtime` 에 쓴다. `deserializeState` 는 `world.runtime` 이 없으면 null 로 채운다.
- [x] 7-10 자체 테스트를 새 규칙으로 고친다. **AGENTS.md 가 바뀌었으므로 기존 테스트의 기대값을 바꾸는 것이 허용된다 (8절 21번의 예외, 9절에 바꾼 이유를 적는다).**
  - "층 이동 기록 (위층 복귀 시 지도·테마 유지, 몬스터는 바로 위층만)" → 이름을 "층 이동 기록 (층 정보 저장 규칙)" 으로 바꾸고 다시 쓴다: ① 내려가면 미리 정해 둔 다음 층 기록 (시드·테마) 그대로 들어가고 그 아래층이 새로 정해짐 ② 올라갔다 다시 내려오면 두 층 모두 시드·테마·방문 칸·상인 품절·보스 처치가 같음 ③ runtime 은 바로 이전 층 기록에만 (위·아래 모두), 계단을 한 번 오가면 복원, 두 번 떨어진 층은 null ④ 포탈: 기록 전부 삭제 후 다음 층 기록 하나만, 같은 층 번호·다른 테마, runtime 없음, 그 뒤 위로 올라가면 새로 정한 층 ⑤ 무작위 이동 (내려가기·올라가기·포탈) 2000번 동안 이웃한 정해진 층끼리 테마가 다르고, 정해진 층이 이어진 범위이며, 다음 층 기록이 항상 있음 ⑥ 지하 1층에서 지하 100층까지 내려가면 기록 100개 (지하 1~99층 + 다음 층 101층), 개수 제한 없음 ⑦ 지하 1층에서 올라가기는 오류.
  - "저장·불러오기 왕복" 의 `'위층 기록 2개'` → 내려가기 2번 뒤 기록 3개 (지하 1·2층 + 다음 층 4층). `world.runtime` 왕복도 확인.
  - "층 런타임 스냅샷" 의 위층 기록 확인은 새 규칙에서도 맞으므로 그대로 둔다.
  - 새 테스트: 7-8 압축, 7-9 이전 형식 저장 데이터 (다음 층 기록 없음·`world.runtime` 없음·기록 방문 칸이 배열) 를 `deserializeState` 가 받아들임.
  - (구현됨) 테스트 총 33개. "층 이동 기록 (층 정보 저장 규칙, 7-7)" (①②③④⑥⑦ + 포탈 뒤 보스 처치 초기화 U24, JSON 왕복 뒤 같은 규칙), "층 기록 불변 조건 (무작위 이동 2000번)" (⑤: 정해진 층이 이어진 범위·다음 층 항상 있음·현재 층은 기록에 없음·이웃 층 테마 다름·runtime 은 바로 이전 층 하나 (포탈 뒤에는 없음)), "기록의 방문 칸 압축 (7-8)", "이전 형식 저장 데이터 (7-9)". "저장·불러오기 왕복" 은 기록 개수 (`1,2,4`) 와 가짜 런타임 (몬스터·시체 목록, `world.runtime` 왕복) 만 고치고 형식 오류 4가지 (기록 방문 칸 형식·크기, `world.runtime` 형식·목록) 를 더했다. 옛 "층 이동 기록" 테스트는 지웠다 (테스트 파일 안 주석에 옛 이름과 바꾼 이유).
- [x] 7-11 브라우저 자동 확인 (Playwright, 저장소 밖 임시 스크립트): 내려가기 → 올라가기 → 다시 내려가기 = 처음 지하 2층과 같은 시드·테마·방문 칸 / 지하 2층에서 미리 정한 지하 3층으로 내려가면 그 기록 그대로 / 포탈 → 같은 층 번호·새 테마 → 위 계단으로 올라가면 처음과 다른 새 위층 / 일반 게임에서 저장·이어하기 뒤에도 같은 규칙, 저장 데이터에 다음 층 기록·`world.runtime` 이 있음. (확인 스크립트는 8절 29번 참고: 낮음 품질, 넉넉한 대기)
  - (구현됨) `verify7c.mjs` 25건 통과 (9절).
- [x] 7-12 (사용자 확인 필요) 내려가기 → 올라가기 → 다시 내려가기에서 같은 층 (테마·지도) / 포탈 뒤 위층으로 올라가면 처음 보는 층. — **2026-10-18 사용자가 2가지 모두 확인.**

### 8단계: 몬스터 공통 시스템·기본 공격·성장·사망 (백룸 몬스터 4종)

목표: AGENTS.md "몬스터 > 공통 규칙·생성 규칙" 의 기본 동작을, 지하 1층 테마인 백룸의 일반 몬스터 4종으로 먼저 완성한다. (정예·둥지·보스와 나머지 테마는 10단계)

- [x] 8-1 [06] AGENTS.md 에 없는 몬스터 크기·시체 값 (3-5 에서 `MONSTER_TYPES` 에 넣는다): — 3단계에서 이미 넣었다 (`defineMonster` 의 `body` 인자). 8단계에서 아래 표와 다시 대조함.

  | id | radius | height | corpse | | id | radius | height | corpse |
  |---|---|---|---|---|---|---|---|---|
  | br_shade | 0.4 | 1.8 | lie | | cv_bat | 0.3 | 0.5 | fall |
  | br_mannequin | 0.4 | 1.9 | lie | | cv_spider | 0.6 | 0.8 | flatten |
  | br_lamp | 0.4 | 1.2 | fall | | cv_golem | 0.9 | 2.6 | flatten |
  | br_mold | 0.7 | 0.8 | flatten | | cv_spore | 0.6 | 1.6 | flatten |
  | br_boss | 1.2 | 4.0 | lie | | cv_boss | 2.5 | 2.5 | flatten |
  | bk_goblin | 0.35 | 1.2 | lie | | lv_imp | 0.35 | 1.1 | fall |
  | bk_archer | 0.4 | 1.8 | flatten | | lv_slime | 0.6 | 1.0 | flatten |
  | bk_orc | 0.6 | 2.2 | lie | | lv_golem | 0.9 | 2.8 | flatten |
  | bk_shaman | 0.35 | 1.3 | lie | | lv_salamander | 0.5 | 0.7 | lie |
  | bk_boss | 1.4 | 4.5 | lie | | lv_boss | 2.5 | 5.0 | vanish |
  | vd_watcher | 0.6 | 1.2 | fall | | vd_jelly | 0.7 | 1.2 | fall |
  | vd_stalker | 0.4 | 2.0 | vanish | | vd_sentinel | 0.7 | 2.4 | flatten |
  | vd_boss | 2.0 | 4.0 | vanish | | | | | |

- [x] 8-2 [14] 몬스터 생성 `spawnFloorMonsters(game)` (AGENTS.md "몬스터 > 생성 규칙"):
  - 수 = `Math.round(칸 수 × 0.3)`. 종류 = 테마의 일반 4종 중 `weight` 가중치. 무리 (`group`) 는 같은 칸에 그 마릿수를 함께 생성 (총 수에 포함).
  - 레벨 = `Math.max(1, 층 + (−1 ~ +1 무작위))`. 수치 = `monsterBaseStats(level)` × 배수.
  - 생성 금지 칸: 성소 구역, 상인 방, 계단 3칸, 포탈 칸, 주인공 도착 칸에서 맨해튼 거리 3 이내. 한 칸에 최대 2마리 (무리는 4마리). 위치는 칸 안의 통로 영역 (복도형: 중심 ±2.5m, 방형: 중심 ±6m) 에서 무작위, 다른 몬스터와 1.5m 이상 떨어지게.
  - 이 단계에서는 정예·둥지·보스는 만들지 않는다 (10단계).
  - (구현됨) 배치는 순수 함수 `planFloorMonsters(d, themeId, floor, arrivalKey, rnd, collision)` → `[{ typeId, level, x, z, yaw, groupId, cellKey }]` (자체 테스트 대상), 런타임 생성은 `spawnFloorMonsters(g)` (도착 칸 = 그때의 `g.currentCell`, 시설 충돌 상자와 겹치는 위치 제외). 레벨은 마리마다 따로 굴린다. 생성 범위는 몸이 벽에 닿지 않게 반지름만큼 줄임 (`monsterSpawnHalf`). 한 칸 제한: 무리가 없는 칸 2마리, 무리가 있는 칸 4마리 (무리 + 단독이 섞이면 합 4). 몬스터 상태는 `createMonsterState(typeId, level, opts)` (6.8 + `height, size, timers, knockVel, lastSeenAt, wanderTo, ownedMats`. 정예 배수 `ELITE_MUL` 은 복원 때문에 지금부터 적용). 생성 시점: `createGameRuntime` (불러오기에 `world.runtime` 이 없을 때·새 게임·디버그), `swapFloor` 7번 (runtime 없음). `g.noMonsters` 면 만들지 않음.
- [x] 8-3 외형 [14]: AGENTS.md "외형" 설명대로 도형을 조합한 `THREE.Group`. 같은 종류 몬스터는 geometry·material 을 공유한다 (`getMonsterAssets(typeId)` 에서 한 번 만들어 캐시). 머리 위 HP 막대 (CanvasTexture Sprite, 피해를 입었을 때만 보임). 피격 시 0.1초 빨갛게 (공유 재질을 바꾸지 말고, 피격 중인 몬스터만 빨간 재질로 잠깐 교체).
  - (구현됨) `MONSTER_MODELS[id] = { make() (공유 재질), build(A, m, G, C) (Group, 원점 = 발 / 부유형은 몸 중심), animate(m, group, t) }` + 공용 `getMonsterCommon()` (캡슐·피격 빨강·시체 재질·동전·투사체·구름). `getMonsterModel(typeId)` 가 종류별로 한 번 만들어 캐시. **메시는 처음 80m 안에 들어올 때 만든다** (`ensureMonsterMesh`, `MONSTER_DRAW_DIST = 80`, 멀면 숨김) — 그래서 몬스터 상태 생성·복원은 Node 에서도 돈다. 그림자는 개체마다 재질 복제 (`ownedMats`, 지울 때 dispose). 형광등 깜빡임은 개체마다 튜브 재질만 바꿔 낌. 피격 빨강은 `m.meshes` 의 재질을 매 프레임 `flash ? 빨강 : userData.baseMat` 로. HP 막대는 개체 전용 CanvasTexture Sprite (죽을 때 dispose). 매 프레임 동기화는 `syncWorldVisuals(g)` (일시정지 중에도 `SCREENS.game.update` 가 부름). **백룸 외 16종은 10단계까지 임시 외형** (`genericMonsterModel`: 테마 색 캡슐 + 머리 + 눈).
- [x] 8-4 AI 공통 상태 (AGENTS.md "행동 공통"): `idle` (칸 안을 천천히 배회) → `chase` (14m 이내 + 시야 확보) → `attack` (사거리 안) → `return` (28m 넘게 멀어지거나 4초 넘게 안 보이면 생성 위치로, 돌아가는 동안 초당 최대 HP 5% 회복).
  - 시야 확보: 몬스터 눈 → 주인공 눈 선분 위의 점을 1m 간격으로 찍어, 그 점이 들어 있는 칸의 `collision` 상자 안에 있고 높이가 `min(상자 maxY, view.wallVisualHeight)` 보다 낮으면 막힌 것 (void 테마는 난간이 낮아 거의 막히지 않는다. 분수·카운터 같은 시설 상자는 maxY 가 실제 높이다, 6.10).
  - 무리: 같은 `groupId` 중 하나가 감지하면 모두 `chase`.
  - 이동: 시야가 있으면 주인공 쪽으로 곧장 이동. 없으면 칸 단위 BFS (`wall` 이 아닌 변으로 이어진 칸끼리, **성소 구역 칸은 지나갈 수 없음**) 로 다음 칸을 정하고 그 칸 쪽 출입구 중점 → 칸 중심 순서로 이동. 경로는 0.5초마다 다시 계산.
  - 충돌: 벽은 주인공과 같은 `moveWithCollision` (반지름 = `def.radius`). 몬스터끼리 겹치면 서로 밀어낸다. 주인공과도 겹치지 않게 밀어낸다.
  - 성소: 이동 뒤 위치가 성소 구역 칸이면 이동 전 위치로 되돌린다.
  - 부유 (`hover`): 바닥에서 `height × 0.5 + 1m` 높이에 떠서 위아래로 천천히 출렁인다. 충돌은 똑같이 원-상자.
  - 원거리형 (`keepDistance`): 범위보다 가까우면 주인공 반대쪽으로 물러나고, 멀면 다가간다.
  - (구현됨) `updateMonsters` → `updateMonster` (상태 `idle` / `chase` / `return`). 시야 `hasLineOfSight` (위 규칙 그대로, `LOS_STEP = 1`). 감지는 대기일 때 14m, 추적 중에는 28m 안이면 "보임". 길찾기는 몬스터마다 BFS 를 돌리지 않고 **주인공 칸에서 한 번 BFS 한 칸 거리 (흐름장, `cellDistances` / `updateFlowField`)** 를 주인공 칸이 바뀔 때만 다시 계산하고, 몬스터는 거리가 1 작은 이웃 칸 쪽 출입구를 0.6m 넘은 점 (`edgeWaypoint`) 으로 간다 (경로 0.5초 재계산 대신). 돌아가기는 `findCellPath` (성소 구역은 끝 칸만) 를 따라가고, 20초 안에 못 돌아가면 생성 위치로 옮김 (안전장치). 성소 되돌림은 "이동 전 칸이 성소 구역이 아닌데 이동 후 칸이 성소 구역" 일 때만 (디버그로 성소 안에 놓인 몬스터가 갇히지 않게). 48m 밖의 대기 몬스터는 갱신하지 않음 (`MONSTER_ACTIVE_DIST`). 돌아가는 중에는 다시 감지하지 않는다 (맞으면 다시 추적). **U25: 성소 구역 안의 주인공은 감지·공격하지 않는다** (`playerTargetable`).
  - **(2026-10-22 변경, 사용자 지시 U33)** 대기 (`idle`) 의 "칸 안을 천천히 배회" → 생성 칸에서 10칸 안을 몬스터마다 다른 방식으로 칸 단위 배회 (`MONSTER_WANDER`, 둥지는 공터 안, 무리는 함께). 돌아가기 목표는 생성 위치 → 추적을 시작한 자리 (`home`). 48m 밖 대기 몬스터도 0.25초마다 배회만 갱신. `MONSTER_WANDER_SPEED` 는 삭제.
- [x] 8-5 몬스터 공격:
  - 근접: 사거리 안 + 간격마다 → 예비 동작 (`windup` 초, 몸을 뒤로 젖힘) → 그때도 사거리 + 0.5m 안이면 피해. 예비 동작 중 경직되면 취소.
  - 원거리: 투사체 생성 (주인공의 현재 위치를 조준, `projectileSpeed`). **몬스터 투사체가 성소 구역 칸에 들어가면 즉시 제거.**
  - 효과 (`effect`) 는 확률로 상태이상 부여 (9단계 전까지는 `applyEffect` 를 빈 함수로 두고 호출만).
  - (구현됨) 근접 사거리 판정은 중심 거리 ≤ `range + PLAYER_RADIUS`, 명중은 `+ 0.5` (`MELEE_LAND_EXTRA`). 공격 간격 타이머는 예비 동작 시작 때 건다. 원거리는 예비 동작 없음, 투사체 사거리 = `range × 1.5`, `splashRadius` 가 있으면 착탄 반경 안의 주인공에게도 (`projectileImpact`). 주인공 피해는 `hitPlayer(g, attacker, spec, effect)` → `computeDamage` → `damagePlayer` (투사체면 `projectileTakenPct` 도 더함). `applyEffect()` 는 9단계까지 인자 없이 선언한 빈 함수 (ESLint 의 안 쓰는 인자 오류를 피하려고, 호출하는 쪽은 `(g, target, id, opts)` 로 부른다). **광선 (`beam`)·범위 (`aura`) 공격 (공허의 눈·포자 버섯·해파리) 은 10단계** — 지금은 다가가기만 한다. 넉백·기절을 주는 몬스터 공격 (오크·골렘) 의 주인공 쪽 효과도 10단계 (9단계 상태이상과 함께).
- [x] 8-6 백룸 특수 행동 `MONSTER_BEHAVIORS` (AGENTS.md "특징" 열):
  - `br_shade`: 투명 재질 (`transparent: true`). 불투명도 = 주인공과 거리 6m 이상이면 0.25, 그 안에서는 `0.25 + 0.75 × (6 − 거리) / 6`. (공유 재질이면 개체별 불투명도를 줄 수 없으므로 이 종류는 개체마다 재질을 복제한다)
  - `br_mannequin`: "주인공이 보고 있음" = 카메라 앞 방향 (수평) 과 몬스터 방향 사이 각도 ≤ 50° + 시야 확보. 보고 있으면 이동·공격·애니메이션·공격 타이머 모두 멈춘다. 넉백 면역.
  - `br_lamp`: 부유 원거리, 감전 20%.
  - `br_mold`: `onDeath` 에서 반경 3m 포자 구름 4초 (`createGroundZone`, 주인공에게만 초당 공격력 20% 독 피해).
  - (구현됨) `MONSTER_BEHAVIORS[id] = { onUpdate(g, m, dt, dist) (false 면 그 프레임 행동 전부 건너뜀), onDeath(g, m), onHit(g, m, r) }`. 마네킹은 `onUpdate` 가 타이머·애니메이션보다 먼저 불려 모두 멈춘다 (`playerLooksAt`). 포자 구름은 0.5초마다 공격력 10% 독 (= 초당 20%), 성소 안이면 피해 없음.
- [x] 8-7 [07] 피해 계산 `computeDamage(attacker, defender, spec)` — AGENTS.md "전투 공식" 순서 그대로
  - `spec = { kind: 'physical' | 'magic', element: 'physical' | 'arcane' | 'fire' | 'cold' | 'lightning' | 'poison', coef: 135, flat: 0, canCrit: true }`
  - ① `base = (kind === 'physical' ? physAtk : magicAtk) × coef / 100 + flat`
  - ② % 보너스 합 (`physPct` 또는 `magicPct` + 해당 속성 % + `dmgPct`) 을 한 번에 곱한다
  - ③ 치명타 판정 (`canCrit` 일 때) → `× critDamage / 100`
  - ④ 방어: `physical` → `× (1 − physReduction(def, attackerLv))`, `arcane` → 그대로, 원소 → `× elementMultiplier(res)` (몬스터 저항이 음수면 피해 증가). 감전이면 × 1.15, 받는 피해 % 적용
  - ⑤ `× (0.9 ~ 1.1 무작위)`, `Math.max(1, …)`
  - 반환 `{ amount, crit }`. 몬스터 공격도 attacker 를 `{ physAtk: 공격력, magicAtk: 공격력, level, mods: {} }`, spec 을 `{ kind: 'physical', element: attack.element, coef: attack.coef, canCrit: false }` 로 만들어 같은 함수를 쓴다.
  - (구현됨) `computeDamage(attacker, defender, spec, rnd = Math.random)`, `monsterAttacker(m)`, `ELEMENT_PCT_KEY`. spec 추가 필드: `melee` (근접 물리면 `meleePct` 도 더함), `ignoreDefense` (출혈 등), `bonusPct` (스킬 자체 %), `projectile`. defender = `{ defense, res, damageTakenPct }` (감전 +15% 는 9단계에서 `damageTakenPct` 로). 몬스터 저항은 `createMonsterState` 에서 −50~75 로 자른다 (`MONSTER_RES_MIN/MAX`). 자체 테스트로 AGENTS.md 목표 확인: 그림자 Lv1 은 기본 공격 4~6회 (실제 4회), 주인공은 10~15회 버팀 (실제 13회).
- [x] 8-8 [15] 행동 슬롯 사용 공통 처리 + 기본 공격 (BA)
  - 마우스 오른쪽 버튼이 **눌려 있는 동안** 매 프레임 `tryUseActiveSlot()` 를 호출 → 활성 슬롯의 내용이 사용 가능 (재사용 대기 끝, 자원 충분) 하면 바로 사용. (AGENTS.md: 누르고 있으면 계속 사용)
  - 근접 무기: 주인공 앞 방향 (수평) 과 몬스터 방향 사이 각도 ≤ `arcDeg / 2`, 거리 ≤ `range + 몬스터 반지름` 인 모든 몬스터에게 물리 `(95 + 5 × Lv)%`. 화면 오른쪽 아래에 무기 모양 (쇠파이프 = 회색 원통) 을 두고 0.2초 휘두르는 애니메이션.
  - 완드·지팡이: 카메라 위치에서 조준 방향 (카메라 앞 벡터, 위아래 포함) 으로 마력탄 투사체 30m/s, 사거리 30m, 마법 `(76 + 4 × Lv)%` 비전. 지팡이는 1명 관통.
  - 재사용 대기 = `attackInterval`.
  - (구현됨) `updatePlayerActions(g, dt)` (재사용 대기 감소 → `input.locked && input.mouseRight` 면 `tryUseActiveSlot`), `useBasicAttack`, `meleeSweep` (높이가 겹치고 벽에 가리지 않는 몬스터만), `firePlayerBolt` (카메라 앞 방향, 지팡이 `pierce` 1). 소모품 슬롯 사용은 12단계, 다른 스킬은 14단계 (지금은 false). 화면의 무기는 `syncViewModel` — 카메라의 자식 Group (원점 = 손잡이), 깊이 검사 없이 그림 (`renderOrder 10`), 무기 종류별 모양 `VIEW_MODEL_SHAPES` (원통 조합, 12단계에서 다듬기), 휘두르기 0.2초. **카메라를 장면에 추가했다** (`SCREENS.game.enter` 에서 `app.scene.add(app.camera)`, `exit` 에서 제거) — 카메라의 자식은 카메라가 장면 안에 있어야 그려진다.
- [x] 8-9 [14] 투사체 공통: `{ pos, vel, radius, owner: 'player' | 'monster', maxDist, traveled, pierce, hitIds: Set, spec, onHit }`. 매 프레임 이동 → 벽 상자 안이면 제거 → 대상과 거리 < 반지름 합이면 명중 → 관통 수가 남으면 계속, 아니면 제거.
  - (구현됨) `spawnProjectile(g, o)`, `updateProjectiles` (0.4m 단위로 나눠 이동), `projectileBlocked` (칸 밖·바닥 아래·천장 위·충돌 상자 안), `stepMonsterProjectile` (성소 구역 칸이면 피해 없이 제거, 주인공 원기둥에 닿으면 명중), `stepPlayerProjectile`. 투사체 모양은 공유 구 + 속성별 공유 재질.
- [x] 8-10 몬스터 넉백·경직: 맞으면 0.2초 경직 (예비 동작 취소), 넉백은 0.2초 동안 밀려남 (벽 충돌 적용). `knockbackImmune` 이면 둘 다 무시.
  - (구현됨) 경직은 `damageMonster`, 넉백은 `knockMonster(m, fromX, fromZ, dist)` (14단계 강타 등이 쓴다, 지금은 `__TEST__` 에만). 맞은 몬스터는 추적 상태가 되고 무리에도 알린다.
- [x] 8-11 처치:
  - 경험치 = `killExp(level, 주인공 레벨) × monsterRewardMultiplier(def)`. 골드 = 60% 확률로 `(3 + level) × (0.5 ~ 1.5) × 같은 배수` (`goldPct` 적용) → 바닥에 동전 (U7 자동 줍기).
  - 아이템 드롭 판정 함수 `rollMonsterDrops(m)` 자리만 만들어 둔다 (12단계에서 연결).
  - **시체**: 몬스터 메시를 그대로 두고 `corpse` 값대로 변형 (`lie` = 옆으로 90° 눕힘, `flatten` = 세로 크기 0.3 배, `fall` = 바닥으로 떨어뜨린 뒤 눕힘, `vanish` = 0.5초 동안 작아지며 사라짐) + 재질을 어두운 시체용 공유 재질로 교체. HP 막대 제거. `game.corpses` 에 넣고, 60구를 넘으면 가장 오래된 것부터 제거·dispose.
  - (구현됨) `killMonster` (보상 배수 `monsterRewardMuls`: 정예 ×3·소환수 ×0.2·보스는 경험치 ×20·골드 ×10), `rollMonsterDrops()` (빈 함수, 12단계), `makeCorpse` / `applyCorpsePose` / `corpseFromRecord` (`CORPSE_MAX = 60`, 떨어짐 0.3초·사라짐 0.5초 연출은 `g.effects`). 골드는 바닥 동전 `dropGold` → 1.5m 안에서 자동 줍기 (`updateDrops`, U7) + 떠오르는 "+N G". **HUD 오른쪽 아래 (레벨 위) 에 골드 표시 추가** ("골드" / 숫자 `.ug-num`).
- [x] 8-12 레벨업 (AGENTS.md "레벨과 경험치"): 경험치 ≥ `expToNext(level)` 인 동안 반복해서 레벨 +1, 초과분 이월, `baseStats` 각 +1, 스탯 포인트 +1, 스킬 포인트 +1, HP·MP·스태미너 최대치로. 토스트 "레벨 업! Lv n".
  - (구현됨) `grantExp(state, amount, game)` ([13], 순수 로직 — 자체 테스트). 토스트는 `g.uiEvents` 에 넣고 `SCREENS.game.updateFeedback` 이 "레벨 업!" / "Lv" / 숫자 (`.ug-num`, 4.5) 로 보여준다 (`levelUpNode`).
- [x] 8-13 주인공 피격: 화면 가장자리를 0.3초 붉게. HP 0 → 사망 (U2): 게임 정지 → "쓰러졌습니다" 화면 → [마지막 저장에서 다시 시작] (`continueGame(slot)`) / [메인 메뉴].
  - (구현됨) `damagePlayer` 가 `g.hurtAt`·`g.dead` 를 정하고, 화면은 `SCREENS.game` 이 처리 (`.ug-hurt` 가장자리 붉게 0.3초 `HURT_FLASH_TIME`, `showDeath`). 사망하면 `updateGame` 이 멈추고 포인터 락을 풀며, 시스템 메뉴·"클릭하여 계속" 은 뜨지 않는다. 디버그 게임은 [다시 시작] (같은 디버그 해시로 `startDebugGame`) + "디버그 게임은 저장하지 않습니다".
- [x] 8-14 7-2 의 `snapshotFloorRuntime` / `restoreFloorRuntime` 에 몬스터·시체를 채운다 (6.9 형식). 복원한 몬스터는 `idle` 상태로 시작. 복원하는 곳은 두 군데다: 층 이동 (`swapFloor` 7번, 바로 이전 층으로 돌아갈 때) 과 불러오기 (`createGameRuntime`, `world.runtime`, 7-9). 그 밖의 경우 (처음 가는 층, runtime 이 없는 지나온 층, 이전 형식 저장 데이터) 는 몬스터를 새로 생성한다 (6.9 의 마지막 항목, `bossDefeated` 확인).
  - (구현됨) `restoreFloorRuntime` 이 형식이 맞지 않는 기록은 건너뛰고 종류별 개수를 돌려준다. 몬스터는 HP 를 1~최대로 잘라 복원. 장비·소모품 바닥 아이템은 기록만 그대로 들고 있다가 다시 스냅샷에 들어간다 (모양·줍기 12단계). `clearFloorRuntime` 은 몬스터·시체의 개체 전용 자원과 투사체·바닥 아이템·구름·연출의 `dispose()` 를 부른다 (층 이동·게임 나가기). `bossDefeated` 확인은 보스를 만드는 10단계에서.
- [x] 8-15 (선택) 피해 숫자: 맞은 위치 위로 0.8초 떠오르는 Sprite 글자 (치명타는 노란색·크게).
  - (구현됨) `spawnFloatingText(g, x, y, z, text, color, scale)` (D2Coding, 개체 전용 CanvasTexture → 0.8초 뒤 dispose, 깊이 검사 없음), `updateEffects`. 골드 줍기 "+N G" 에도 쓴다.
- [x] 8-16 디버그 해시 `&monster=br_mannequin` (주인공 앞 8m 에 1마리), `&noMonsters=1` 추가. 몬스터 4종 스크린샷 확인.
  - (구현됨) `&monster=` 는 시작한 층만 그 1마리 (층을 옮기면 평소대로 생성), `&elite=1` 정예, `&noMonsters=1` 은 층을 옮겨도 계속. `spawnDebugMonster` (`__TEST__` 에도 — 브라우저 자동 확인용).
- [ ] 8-17 (사용자 확인 필요) 몬스터 추적·공격, 마네킹은 쳐다보면 멈춤, 성소에 못 들어옴, 성소 안에서 투사체 사라짐, 우클릭을 누르고 있으면 연속 공격, 레벨업, 시체가 남음, 계단으로 바로 이전 층에 돌아가면 (위·아래 모두) 그 층의 몬스터·시체가 그대로 있음, 두 층 이상 떨어진 지나온 층에는 몬스터가 새로 생김, 저장 후 이어하기하면 현재 층 몬스터가 그대로 있음, 사망 후 재시작. — Playwright 로 46건 자동 확인 완료 (9절). 실제 전투 느낌 (몬스터 속도·공격 빈도·피해량·무기 모양) 은 사용자 확인 대기 (0절).

### 9단계: 상태이상·버프

- [x] 9-1 효과 목록 구조: 대상 (주인공·몬스터 공통) 의 `effects = [{ id, remaining, stacks, dps, magnitude }]`.
  - (구현됨) 주인공 쪽 대상은 런타임 `g.player` (`isPlayer: true, effects, statusImmune, moving` 추가. `g.effects` 는 8단계부터 화면 연출 목록이라 이름이 겹치지 않게 주인공 것은 `g.player.effects`). 몬스터는 `m.effects` (6.8). 항목에 `from: { x, z }` (공포의 도망 기준) 추가.
- [x] 9-2 [14] `applyEffect(target, id, opts)` (AGENTS.md "상태이상" 표):
  - 화상: 다시 걸리면 지속 시간 갱신, `dps` = 원래 화염 피해의 10% (기존 값과 큰 쪽).
  - 중독: 최대 5중첩. 피해 = `중첩 수 × dps`, 새로 걸리면 중첩 +1 (최대 5) 과 지속 시간 갱신.
  - 둔화·빙결·감전·출혈·기절·공포: 다시 걸리면 남은 시간 중 긴 쪽.
  - 주인공: 원소 상태이상 (화상·둔화·빙결·감전·중독) 지속 시간 × `(1 − 해당 저항 / 100)`. 빙결은 최대 1.5초.
  - 보스 (`isBoss`) 는 빙결·기절·공포 대신 같은 시간 동안 둔화 50%.
  - 상태이상 면역 버프 (정화·성수) 가 있으면 걸리지 않는다.
  - (구현됨) `applyEffect(target, id, opts)` — target `{ effects, isPlayer, isBoss, statusImmune }`, opts `{ duration, dps, sourceDamage, magnitude, resPct, from }`, 반환 = 걸린 항목 또는 null. dps 가 없으면 `sourceDamage × 표의 %` (화상 10%, 중독 8%, 출혈은 표에 없어 10% = U27). 기본 크기: 둔화 30%, 감전 15% (M5·M8 의 증가분은 14단계에서 `magnitude` 로 넘긴다, 화상 증가 M2 는 `dps` 로). 둔화가 겹치면 남은 시간·크기 모두 큰 쪽 (보스 둔화 50% 1초 + 일반 둔화 30% 2초 → 50% 2초가 되는 단순화). 기절·공포처럼 표의 기본 지속이 없는 것은 `duration` 을 주지 않으면 걸리지 않는다. 호출 도우미: `applyStatusToPlayer(g, id, opts)` (성소 안·사망이면 null, 그 속성 저항을 `resPct` 로), `applyStatusToMonster(g, m, id, opts)` (공포 기준 = 주인공 위치, 빙결·기절이면 예비 동작 취소).
- [x] 9-3 `tickEffects(target, dt)`: 지속 피해 (출혈은 이동 중 1.5배, 방어력 무시), 시간 감소, 끝난 효과 제거.
  - (구현됨) `tickEffects(target, dt, moving)` → 지속 피해 합을 돌려주고 호출하는 쪽이 적용. 지속 피해는 원래 피해에서 이미 방어·저항을 거친 값이라 다시 깎지 않고, 받는 피해 % (감전·장비·스킬) 만 곱한다. 주인공: `updatePlayerStatus` (`updateGame` 에서 회복 다음, 화면 가장자리를 붉게 하지 않음 = `damagePlayer(g, n, quiet)`). 몬스터: `tickMonsterStatus` (48m 밖의 쉬는 몬스터도 계속, 1초마다 모은 피해를 보라색 숫자로, HP 0 이면 `killMonster` → 경험치는 주인공에게).
- [x] 9-4 행동 제약: 빙결·기절 → 이동·공격·스킬 불가. 둔화 → 이동·공격 속도 × `(1 − 둔화% / 100)` (냉기 숙련 M5 로 증가). 공포 (몬스터) → 주인공 반대 방향으로 이동. 감전 → 받는 피해 × 1.15 (전격 숙련 M8 로 증가).
  - (구현됨) `isDisabled`, `effectMagnitude`. 주인공: 빙결·기절이면 이동·점프·행동 슬롯 불가 (시점은 돌릴 수 있음), 둔화는 `calcDerivedStats(state, game)` 가 걷기·달리기 속도와 `attackInterval` (÷ (1 − 둔화%)) 에 반영 (`game.player.effects`, game 이 없으면 무시). 몬스터: `monsterSpeed(m)` (이동), 공격 간격 타이머·예비 동작·애니메이션이 (1 − 둔화%) 배로 흐름, 빙결·기절이면 아무것도 안 함, 공포면 `from` 반대쪽으로 도망 (공격 안 함). 감전은 `hitPlayer` / `damageMonster` 의 defender `damageTakenPct` 에 더함.
- [x] 9-5 버프: `game.buffs = [{ id, remaining, mods }]` → `collectModifiers` 에 더한다. 영약·스킬 버프가 함께 쓴다.
  - (구현됨) `addBuff(game, { id, remaining, mods, statusImmune, label: { ko, en }, color })` (같은 id 면 효과·시간 갱신), `tickBuffs(game, dt)` (끝난 것 제거, 면역 버프가 있으면 `game.player.statusImmune = true`). `collectModifiers` 는 3단계부터 `game.buffs` 의 `mods` 를 더하고 있었다. 버프는 저장하지 않는다 (6.1), 층을 옮겨도 유지. 성소에 들어가도 버프는 유지 (상태이상만 해제).
- [x] 9-6 HUD 오른쪽 위에 상태이상·버프 아이콘 (색 사각형 + 글자 1자 + 남은 초).
  - (구현됨) `updateHudEffects` — 테두리·글자 = 효과 색, 글자는 `STATUS_ICON` ([06], 한국어 이름 첫 글자 / 영어 두 글자 — Slow·Shock·Stun 의 첫 글자가 겹쳐서) 와 버프의 `label`, 남은 초 (올림 정수, 별도 요소 + `.ug-num`), 중독 중첩 "×3". 버프는 둥근 아이콘. 내용이 바뀔 때만 다시 그림 (남은 초가 정수라 1초에 한 번).
- [x] 9-7 성소 구역에 들어오는 순간 주인공 상태이상을 모두 해제 (AGENTS.md).
  - (구현됨) `updatePlayerStatus` 가 성소 안이면 매 프레임 `g.player.effects` 를 비우고, `applyStatusToPlayer` 는 성소 안에서는 걸지 않는다 (AGENTS.md "이 영역에 있으면 … 상태이상은 즉시 해제").
- [x] 9-8 8단계 몬스터의 상태이상 부여 (`br_lamp` 감전, `br_mold` 중독) 를 실제로 연결.
  - (구현됨) `hitPlayer` 의 `effect` → `applyStatusToPlayer(g, id, { sourceDamage })`. 공통 코드라 다른 테마 몬스터의 데이터 (`effect`) 도 함께 동작한다 (거미·슬라임 등 — 10단계 전 임시 외형이어도). 근접 공격의 `attack.stun` (바위 골렘 0.5초) 도 `resolveMeleeHit` 에서 주인공 기절로 연결했다. 오크의 넉백은 아직 (10단계).
- [x] 9-9 자체 테스트 추가: 중독 5중첩 상한, 저항 50% 일 때 화상 지속 시간 1.5초, 보스에게 기절 → 둔화 50%. `__TEST__` 에 `applyEffect` 추가 (Node 에서 쓸 수 있게 순수 객체만 다룰 것).
  - (구현됨) 테스트 3개: "상태이상 적용 (중첩·갱신·저항·보스·면역)", "지속 피해·시간 감소", "버프·둔화와 파생 수치". `__TEST__` 에 `applyEffect, tickEffects, effectMagnitude, isDisabled, addBuff, tickBuffs, applyStatusToPlayer, applyStatusToMonster, STATUS_ICON, BLEED_DEFAULT_DOT_PCT`.

### 10단계: 테마별 몬스터 완성 (나머지 16종·정예·둥지·보스 5종)

목표: AGENTS.md "몬스터" 단락 전체.

- [x] 10-1 나머지 테마 일반 몬스터 16종의 외형과 `MONSTER_BEHAVIORS` (AGENTS.md "특징" 열):
  - `bk_goblin` 무리 / `bk_archer` 원거리·거리 유지 / `bk_orc` 예비 동작 0.6초 + 넉백 2m / `bk_shaman` 화염구 착탄 반경 2m + 8초마다 주위 10m 아군 HP 15% 회복 (초록 빛 연출)
  - `cv_bat` 무리·부유, 공격 후 1초 동안 반대 방향으로 물러났다가 다시 접근 / `cv_spider` 6초마다 거미줄 투사체 (피해 0, 둔화 50% 2초) / `cv_golem` 예비 동작 0.7초 + 기절 0.5초, 넉백 면역 / `cv_spore` 이동 0, 8m 안이면 3초마다 포자 구름, 죽을 때 포자 폭발
  - `lv_imp` 맞으면 4m 순간이동 (내부 재사용 10초) / `lv_slime` 죽으면 작은 슬라임 2마리 (`isMinion` 아님, 크기 ×0.6, HP ×0.4, 보상 ×0.3, `splitChild: true` 면 다시 분열 안 함) / `lv_golem` 근접 명중 시 반경 2.5m 화염 충격파 / `lv_salamander` 6초마다 화염 숨결 (전방 5m · 60°, 1.5초 동안 0.3초마다)
  - `vd_watcher` 1초 조준선 (`THREE.Line`, 붉은 보라) → 그 방향 즉발 광선 (선분과 주인공 원 충돌, 벽에 막힘) / `vd_stalker` 8초마다 주인공 뒤 3m 로 순간이동 (0.5초 전 보라 연기, 벽 안이면 취소) / `vd_jelly` 4m 안이면 2초마다 펄스 (0.5초 전 밝아짐) / `vd_sentinel` 정면 ±60° 공격을 25% 확률로 막음 (피해 70% 감소, 방패 번쩍)
  - 몬스터를 하나 끝낼 때마다 `&monster=id` 로 스크린샷 확인.
  - (구현됨) 외형 `MONSTER_MODELS` 16종 (도형 조합, 공유 재질 `lambertMat`/`basicMat`, 도우미 `buildGoblinBody`·`buildSpiderLegs`·`animateGolemArms`·`limbMesh`·`swingLimbs`, 공용 도형에 반구·고리·반원·삼각 날개 추가). 특수 행동 `MONSTER_BEHAVIORS` (6.8 의 훅): 주술사 회복 (`SHAMAN_HEAL`), 박쥐 높이 1.5~3m·공격 후 1초 물러남 (`custom.hoverY` → `placeMonsterOnFloor`), 거미줄 (`SPIDER_WEB`, `onPlayerHit`), 포자 폭발 (`SPORE_BURST`), 임프 순간이동 (`IMP_BLINK`), 슬라임 분열 (`small`), 화염 숨결 (`SALAMANDER_BREATH`, `spawnFlameBreath`), 추적자 순간이동 (`STALKER_BLINK`, `monsterSchedule`), 수호상 막기 (`SENTINEL_BLOCK`, `modifyDamage`). 공통 처리: 오크 넉백 (`knockPlayer` → `applyForcedMovement`), 흑요석 골렘 충격파 (`monsterShockwave`), 포자 버섯·해파리 범위 공격 (`resolveAura`, 구름 위치는 U28), 공허의 눈 광선 (`aimBeamAtPlayer`·`fireBeam`·조준선 `syncAimLine`). 연출 `spawnPuff`·`spawnRing`·`spawnBeamFlash`. 백룸 4종 포함 25종 스크린샷 확인.
  - (구현 중 고친 것) 근접 휘두르기·플레이어 투사체 판정이 `g.monsters` 를 그대로 돌아 같은 휘두르기에 분열한 새끼 슬라임까지 맞던 문제 → 사본을 돈다 (8절 31번).
- [x] 10-2 정예 (AGENTS.md "정예"): 생성 시 `(5 + 층 × 0.1)%` (최대 15%) 확률. HP ×3, 공격력 ×1.5, 방어력 ×1.5, 크기 ×1.3, 금색 테두리 (외형 그룹에 살짝 큰 금색 와이어프레임 또는 발광 테두리), 이름 앞 "정예". 경험치·골드 ×3, 드롭 규칙은 12단계에서 연결 (소모품 50%, 장비 30%, 희귀 +10%p).
  - (구현됨) `eliteChance(층)`, `planFloorMonsters` 가 마리마다 굴려 `elite` 를 정한다. 표시는 U30 (`addEliteOutline`, 이름표 `monsterDisplayName` + `updateMonsterHpBar`). 수치·보상은 8단계의 `ELITE_MUL` 그대로.
- [x] 10-3 공터 둥지: 보스 공터가 아닌 모든 공터의 3×3 구역에 그 테마 일반 몬스터 3~5마리 + 정예 1마리 (일반 몬스터 수와 별도). 같은 `groupId` 로 묶어 함께 반응.
  - (구현됨) 순수 함수 `planNestMonsters(d, themeId, floor, arrivalKey, rnd, collision, others)` (세부는 U31). `spawnFloorMonsters` 가 일반 → 둥지 → 보스 순으로 만든다.
- [x] 10-4 보스 공통 ([14]):
  - 생성: `floor % 5 === 0` 이고 `state.world.bossDefeated === false` 이면 `dungeon.bossPieceId` 공터의 중심 칸에 그 테마 보스 1마리. 레벨 = 층 + 1.
  - 활성화: 주인공이 보스 공터의 3×3 구역 (`cell.pieceId === bossPieceId && cell.shape === 'room'`) 에 들어오면 전투 시작 → 화면 위쪽 가운데 보스 이름 + 큰 HP 막대 (HUD).
  - 행동 범위: 공터 3×3 구역 밖으로 나가지 않는다. 주인공이 구역을 벗어나 10초가 지나면 원래 자리로 돌아가 초당 최대 HP 2% 회복, HP 막대 숨김.
  - 넉백 면역. 빙결·기절·공포 → 둔화 50% (9-2).
  - 패턴 실행기: `BOSS_PATTERNS[id]` 의 각 패턴마다 남은 재사용 시간을 두고, 조건이 맞고 시간이 0 이면 실행. 한 번에 패턴 하나만 실행 (실행 중이면 다른 패턴 대기).
  - 예고 표시 `showTelegraph(shape, params, seconds)`: 바닥 위 0.05m 에 붉은 반투명 도형 (`circle` = `CircleGeometry`, `line` = 길쭉한 `PlaneGeometry`, `cone` = `CircleGeometry` 의 `thetaLength` 로 부채꼴). 시간이 지나면 제거.
  - 처치: 경험치 ×20, 골드 ×10 (`monsterRewardMultiplier` 대신 이 값), 장비 2개·소모품 3개 확정 드롭 (12단계에서 연결), `state.world.bossDefeated = true`, 토스트 "{보스 이름} 처치!", HP 막대 제거.
  - 소환수 (`isMinion`): 경험치·골드 ×0.2, 드롭 없음.
  - (구현됨) 생성 `planBoss` (순수 함수, 보스는 남쪽을 보고 선다) + `attachBossZone` (`bossZoneOf`·`inBossZone`). 실행기 `updateBoss` / `startBossFight` / `bossWalkHome` (`updateMonster` 에서 경직·행동 불가 확인 다음에 분기). 구역 밖으로 못 나감은 `moveMonsterBy` 의 구역 범위 제한, 보스는 주인공·다른 몬스터에게 밀리지 않고 주인공을 밀어낸다 (`separateMonsters`). 예고 `showTelegraph` (공유 도형·재질, 부채꼴은 각도별 캐시, 안쪽 도형이 커지며 남은 시간 표시, 보스가 죽으면 바로 사라짐). 처치 `onBossDefeated` (구역에 묶인 보스만 처치 기록, 중력 당김 해제, 토스트 "{이름} / 처치!"). HUD `updateHudBoss` (이름 + 막대 + 수치 `.ug-num`). 재사용 시간이 없는 패턴 등 세부는 U29.
- [x] 10-5 보스 5종 패턴 (AGENTS.md 각 보스 설명 그대로):
  - [x] `br_boss` 끝나지 않는 야근: 서류 폭풍 (부채꼴 5갈래) / 결재 도장 (4m 안, 0.8초 예고 원) / 정전 (15초마다 3초 `view.setLightLevel(0.05)` + 깜빡이는 그림자 2마리 소환)
  - [x] `bk_boss` 지하 감옥 간수장: 철퇴 휘두르기 (예고 부채꼴) / 돌진 (1초 예고 선 → 12m, 벽에 부딪히면 스스로 2초 기절) / HP 66%·33% 에서 해골 궁수 2마리 소환
  - [x] `cv_boss` 거미 여왕: 독침 세례 (3갈래) / 산란 (새끼 거미 = 동굴 거미 크기 ×0.6 · HP ×0.4, 동시에 최대 6마리) / 거미줄 폭탄 (예고 원 → 반경 5m 둔화 지대 5초)
  - [x] `lv_boss` 용암 군주: 이동하지 않음. 화산탄 (주인공 + 무작위 2곳, 1.2초 예고 원) / 용암 웅덩이 (반경 4m 지대 8초) / 휩쓸기 (6m 안, 0.8초 예고 원) / HP 50% 이하 20초마다 불꽃 임프 2마리
  - [x] `vd_boss` 차원 포식자: 중력 당김 (3초 동안 주인공 이동에 보스 방향 초당 3m 를 더함, 화면 가장자리 보라색 일렁임) / 공허 구체 (주인공을 천천히 따라가는 투사체) / HP 50% 이하 차원 균열 (주인공 근처로 순간이동 → 1초 예고 원 → 반경 5m 폭발)
  - (구현됨) `BOSS_PATTERNS` (6.8). 정전은 `g.effects` 항목이 3초 동안 밝기를 유지하고 끝나면 (층을 떠나도) 1 로 되돌린다. 돌진은 `updateBossDash` (구역 경계도 벽으로 취급), 소환 `summonMinions`, 부채꼴 발사 `bossFan`, 화산탄 낙하 연출 `spawnFallingRock`, 지대는 `createGroundZone({ disc: true })`. 보스 5종 외형 (`MONSTER_MODELS`, `custom.pose` 로 패턴 자세).
- [x] 10-6 `snapshotFloorRuntime` 에 정예 여부·보스 (살아 있으면 HP 포함) 를 포함하고, `restoreFloorRuntime` 이 그대로 되살리는지 확인.
  - (구현됨) 정예·소환수는 8단계부터 기록, `small` 을 더했다 (작은 개체만, 이전 형식과 같게). 보스는 보통 몬스터와 같은 형식이고 복원 때 구역에 다시 묶는다. 처치 기록 (`bossDefeated`) 이 있으면 스냅샷의 보스는 건너뛴다. 자체 테스트 + 브라우저 (계단으로 내려갔다 돌아오면 보스 HP·정예 수 그대로, 보스를 처치하고 두 층 아래까지 갔다 돌아와 몬스터를 새로 만들어도 보스 없음) 로 확인.
- [x] 10-7 디버그 해시 `&monster=id&elite=1`, `#debug=game&floor=5&seed=…&theme=…&at=boss` 로 테마별 보스 스크린샷 확인.
  - (구현됨) 해시는 그대로 동작 (보스도 `&monster=` 가능, 3.5). 25종·정예 3종·보스 5종·예고 표시 6종 스크린샷을 직접 확인 (9절).
- [ ] 10-8 (사용자 확인 필요) 테마별 몬스터 행동, 정예, 둥지, 보스 5종 패턴과 예고 표시, 보스 처치 후 다시 와도 나오지 않음. — Playwright 로 100건 자동 확인 완료 (9절). 실제 전투 느낌은 사용자 확인 대기 (0절).

### 11단계: 스테이터스 탭

- [x] 11-1 표시 (AGENTS.md "스테이터스"): 레벨, 경험치 `현재 / 필요`, 힘·민첩성·지능 (최종값 + 괄호에 장비 보너스, 예 `12 (+3)`), 남은 스탯 포인트, 최대 HP·MP·스태미너, 물리·마법 공격력, 공격 간격, 치명타 확률·피해, 이동 속도, 자연 회복량, 방어력 (+ 같은 레벨 몬스터 기준 피해 감소율), 저항 4종 (`현재% / 상한%`).
  - (구현됨) 값은 순수 함수 `statusTabModel(state, derived)` ([20], 자체 테스트로 AGENTS.md 시작 수치 확인), 그리기는 `renderStatusTab` (`MENU_TAB_RENDERERS.status`). 배치: 위 줄 = 레벨 (큰 숫자)·경험치 `현재 / 필요` + 막대·남은 스탯 포인트·남은 스킬 포인트 (남아 있으면 금색 테두리). 아래 3단 = ① 능력치 (이름 + 역할 설명 + 최종값 + `(+N)` 보너스 + [+]) 와 레벨 업 안내, 생명력·자원 (HP·MP·스태미너 `현재 / 최대`, 자연 회복 /초) ② 공격 (물리·마법 공격력, 공격 간격 초, 공격 속도 보너스, 치명타 확률·피해), 이동 (걷기·달리기 m/s) ③ 방어 (방어력, 물리 피해 감소율 + "같은 레벨 몬스터의 공격 기준", 막기 확률), 저항 4종 (색 점 + `현재% / 상한%`). 숫자는 모두 별도 요소 + `.ug-num`, 단위 (초·m/s·/초) 는 본문 글꼴 (4.5). 자릿수는 U34. 메뉴가 열린 동안 게임이 멈추므로 열 때 한 번 그린다. 한국어·영어 모두 넘침 없음 확인.
- [x] 11-2 각 스탯 옆 [+] 버튼: 스탯 포인트가 있을 때만 활성 → `baseStats[x] += 1`, `statPoints −= 1` → 바로 다시 그린다.
  - (구현됨) 순수 함수 `spendStatPoint(state, id)` ([13], `STAT_IDS`). 누르면 `g.derived` 도 바로 다시 계산 (멈춘 동안에도 HUD 최대치가 바뀜) 후 탭을 다시 그린다. 포인트가 없으면 `disabledReason` (회색, 누르면 "남은 스탯 포인트가 없습니다." 툴팁 4초, 4.5).
- [x] 11-3 디버그 해시 `&level=20` 을 만들어 (레벨·포인트를 그 레벨 기준으로 채움) 스크린샷 확인.
  - (구현됨) `debugSetLevel(state, level)` ([21], 지금 레벨에서 레벨업한 것처럼: 스탯 각 +1·스탯/스킬 포인트 +1 씩, HP·MP·스태미너 가득). `&skills=all` (모든 스킬 Lv1) 도 함께 만들었다. 스크린샷 3장 (한국어 Lv1, 한국어 Lv20 에서 [+] 3번, 영어 Lv20 + 모든 스킬) 을 직접 확인.
- [x] 11-4 (사용자 확인 필요) 실제 브라우저에서 [+] 클릭·툴팁·글자 넘침. Playwright 자동 확인 완료 (9절). — **2026-10-22 사용자 확인: 스탯 포인트를 찍으면 스탯이 바뀜.** 같은 날 몬스터 배회 (U33) 도 확인 (게임에서 몬스터와 조우).

### 12단계: 아이템·인벤토리·장비·소모품

- [x] 12-1 [16] 장비 생성 `generateEquipment(rng, floor, opts)`:
  1. 단계: 등장 가능한 단계 (`floor ≥ minFloor`) 중 가장 높은 단계 60%, 한 단계 아래 30%, 두 단계 아래 10% (없는 단계의 확률은 가장 높은 단계에 더함). `opts.tier` 로 지정 가능.
  2. 기본 아이템: 그 단계의 `EQUIP_BASES` 중 무작위 (반지 포함, 시작 장비 제외).
  3. 등급: 희귀 `Math.min(20, 7 + 0.2 × floor) + (opts.rareBonus || 0)`%, 마법 28%, 나머지 일반. `opts.rarityWeights` 로 다른 확률 지정 가능 (상인용). `opts.rareBonus` 는 정예 +10, 보스 +30.
  4. 부가 옵션 개수: 마법 1~2, 희귀 3~4. 그 부위에 붙을 수 있는 `AFFIXES` 중에서 중복 없이 고른다. 값은 단계 범위 안에서 균등 무작위. 고정 수치 (스탯 +N) 는 `× itemLevelScale` 후 반올림, % 값은 소수 1자리.
  5. 반지: 각인 1개 (`RING_ENGRAVINGS` 중 무작위, `sub` 도 무작위).
  6. 이름: 일반 = 기본 이름. 마법 = 첫 옵션의 수식어 + 기본 이름 (수식어 표 `AFFIX_PREFIX = { stat: { str: ['힘센', 'Strong'], dex: ['민첩한', 'Agile'], int: ['현명한', 'Wise'] }, hpPct: ['튼튼한', 'Sturdy'], … }` 를 17종 모두 만든다). 희귀 = 무작위 고유 이름 (앞말 목록 × 뒷말 목록, 예: "망각의" + "송곳니" / "Oblivion" + "Fang", 각각 12개 이상).
  7. `uid` 는 붙이지 않는다 (인벤토리에 들어올 때 `addItem` 이 붙인다, 6.2).
  - (구현됨) `rollEquipTier` (없는 단계 확률은 가장 높은 단계에: 지하 10~24층 = 2단계 70% · 1단계 30%), `equipRarityWeights(floor, rareBonus)`, `rollAffix` (고정 수치는 정수로 뽑아 iLv 보정 후 반올림·최소 1), `rollEngraving`, `affixPrefix`. `opts` 에 `baseId`·`rarity` (디버그·테스트용) 를 더했다. 자체 테스트로 단계·등급 비율, 옵션 개수·중복·부위·범위, 각인, 이름, 33종 모두 나옴을 확인.
- [x] 12-2 장비 수치 `equipStats(item)`: 기본 수치 × `itemLevelScale(reqLv, iLv)` (공격력·마력·방어력), 무기 종류 특성, 각인, 부가 옵션 → 6.6 수정자 형태로 반환. 상세 표시와 `collectModifiers` 가 함께 쓴다. **(3단계에서 이미 구현됨 — 상세 표시에서 사용하고, `generateEquipment` 로 만든 장비로 값이 맞는지만 확인)**
  - (확인됨) 생성한 무기 공격력 = 표 값 × iLv 보정 (자체 테스트), 상세 정보 `equipBaseLines` 가 `equipStats` 를 쓴다.
- [x] 12-3 가격 `equipPrice(item)` = 단계 기준가 × `(1 + 0.05 × (iLv − reqLv))` × 등급 배수 (일반 1 / 마법 2.5 / 희귀 6), 반올림. 판매가 = 20%.
  - (구현됨) [07] `equipPrice`, `equipSellPrice` (최소 1 G, 시작 장비 = 1 G).
- [x] 12-4 인벤토리 조작 (순수 함수, [16])
  - `addItem(state, item)` → 소모품은 같은 id 칸에 20개까지 합치고 남으면 빈칸에. 장비는 `uid` 가 없으면 `state.nextUid++` 로 붙인다. 공간이 부족하면 아무것도 바꾸지 않고 `false`.
  - `removeItemAt(state, index, count)`
  - `equipItem(state, invIndex)` → `{ ok, reason }`. 요구 레벨 확인. 반지는 ring1 이 비었으면 ring1, 아니면 ring2, 둘 다 차 있으면 ring1 과 교체. 양손 무기는 보조장비를 인벤토리로 옮긴다 (빈칸이 없으면 실패). 양손 무기를 든 채 보조장비를 끼려 하면 실패. 원래 끼던 장비는 인벤토리의 그 칸으로 옮긴다 (교체).
  - `unequipItem(state, slotName)` → 빈칸이 없으면 실패.
  - `setActionSlot(state, slotIndex, ref)` → 같은 내용이 다른 슬롯에 있으면 그 슬롯은 비운다. `ref = null` 이면 해제.
  - 자체 테스트 추가: 물약 합치기 (15개 + 10개 → 20개 + 5개), 가득 찬 인벤토리에 추가 실패, 요구 레벨 미달 장착 실패, 양손 무기 장착 시 방패가 인벤토리로 이동, uid 자동 발급. `__TEST__` 에 `addItem, equipItem, unequipItem, generateEquipment` 추가.
  - (구현됨) 위 함수 + `consumeConsumable` (마지막 칸부터 1개), `moveInventoryItem` (같은 소모품은 합침, U36), `swapActionSlots`. `equipItem(state, invIndex, targetSlot)` 의 셋째 인자는 드래그로 놓은 장착 칸 (다른 부위면 `inv.wrongSlot`), `unequipItem(state, slot, toIndex)` 의 셋째 인자는 놓은 인벤토리 칸. 반환 `{ ok, reason }` 의 reason 은 번역 키 (`inv.reqLevel` 등).
- [x] 12-5 드롭·줍기 (`rollMonsterDrops`, 8-11 에서 만든 자리):
  - 일반 몬스터: 소모품 15% (단계 가중치 하급 5 : 중급 3 : 상급 2, 등장 층 조건 적용), 장비 8%.
  - 정예: 소모품 50%, 장비 30% (`rareBonus: 10`). 보스: 장비 2개 (`rareBonus: 30`) + 소모품 3개 확정. 소환수: 없음.
  - 바닥에 작은 상자 (등급 색, 천천히 회전·위아래로 흔들림) → 1.5m 안에 들어오면 자동으로 줍기 (U7). `game.drops` 에 넣고 `snapshotFloorRuntime` 에도 포함 (U19).
  - (구현됨) 순수 함수 `planMonsterDrops(rnd, floor, m)` (`ITEM_DROP`, `BOSS_DROP`, `rollConsumableId`) → `rollMonsterDrops` 가 주위에 흩어 놓음 (U36). `updateDrops` 가 장비·소모품도 `addItem` 으로 줍고 "획득 + 이름 (등급 색)" 토스트, 가득 차면 안내. 복원은 `isValidDropItem` 으로 검사.
- [x] 12-6 [20] 인벤토리 탭 UI
  - 왼쪽: 장착 칸 7개를 사람 모양으로 배치 (투구 위, 갑옷 가운데, 무기 왼쪽, 보조장비 오른쪽, 반지 2개 아래 좌우, 부츠 맨 아래). 오른쪽: 8×5 = 40칸 격자. 아래: 행동 슬롯 7칸 + 골드.
  - 아이템 칸: 등급 색 테두리, 종류 약자 또는 간단한 도형 아이콘 (2D canvas 로 그려 `toDataURL` 로 캐시해도 됨), 소모품 개수.
  - **클릭**: 인벤토리의 장비 → `equipItem`, 장착 칸 → `unequipItem`, 소모품 → 작은 메뉴 [사용] [행동 슬롯에 등록 → 1~7] [취소].
  - **드래그** (pointerdown 후 6px 이상 움직이면 드래그 시작, 반투명 복사본이 커서를 따라감): 장비 → 장착 칸 = 장착 / 장착 칸 → 인벤토리 = 해제 / 소모품 → 행동 슬롯 = 등록 / 행동 슬롯 → 바깥 = 해제 / 인벤토리 칸끼리 = 위치 교환.
  - **상세 정보**: 마우스 오른쪽 클릭 또는 500ms 이상 누르고 있기 → 팝업 (이름 (등급 색), 단계·요구 레벨·iLv, 기본 수치, 각인·부가 옵션, 판매가, 설명). 팝업 밖을 클릭하면 닫힌다.
  - 실패 이유 (요구 레벨 등) 는 토스트로 보여준다.
  - (구현됨) `renderInventoryTab` (`MENU_TAB_RENDERERS.inventory`). 칸 = `[data-zone="inv"|"equip"|"action"][data-key]`, 아이템 = `.ug-item`. 아이콘은 `ITEM_ICON_DRAW` (무기 6·방어구 3·방패·마도서·반지·물약·투척물·영약·주문서) 를 canvas 에 그려 dataURL 캐시 (`itemIconUrl`). 빈 장착 칸은 흐린 회색 그림. 요구 레벨 미달 = 붉은 바탕 + "Lv25". 누르기·드래그·길게 누르기는 `attachInventoryPointer` (포인터 캡처, `invUi`), 팝업은 `openItemPopup`/`closeItemPopup` (`app.uiRoot` 에 붙임, 탭 전환·메뉴 닫기 때 `resetInventoryUi`). 장착이 바뀌면 `g.derived` 다시 계산 + `clampVitals`. 상세 정보 숫자는 별도 요소 + `.ug-num` (4.5). 한국어·영어 넘침 없음 확인.
- [x] 12-7 소모품 효과 `useConsumable(id)` 21종 (AGENTS.md "소모품 목록"):
  - 물약류: 공용 재사용 대기 3초 (약초학 S1 로 감소), 회복량에 약초학 보정.
  - 투척물: 크로스헤어 방향으로 포물선 (초속 14m/s, 중력 10m/s², 최대 15m). 지면·벽·몬스터에 닿으면 범위 효과. 투척 기준 피해 = `8 + 레벨 × 4`. 재사용 대기 1초.
  - 전투 영약: 버프 (같은 영약을 다시 쓰면 시간 갱신).
  - 주문서: 탐색 = 현재 칸에서 맨해튼 거리 8칸 이내 방문 처리 / 전지 = 모든 칸 방문 처리 + 시설 표시 / 귀환 = 3초 시전 (HUD 진행 막대, 이동 가능, 피격 시 취소되고 소모되지 않음) 후 가장 가까운 (맨해튼) 성소 중심의 남쪽 칸으로 이동.
  - 쓰면 개수 −1, 0 이 되면 인벤토리 칸을 비운다 (행동 슬롯 등록은 유지, 회색).
  - (구현됨) `useConsumable(g, id)` → `{ ok, reason }` + `CONSUMABLE_HANDLERS[분류]` (물약 `healPlayer`, 활력·치료제·영약 버프, 주문서 지도 공개), 투척물 `throwItem` → `throwImpact` (`monstersInBlast`, 지대 `createGroundZone`), 귀환 `updateRecall`/`cancelRecall`/`recallDestination`, 재사용 대기 `itemCooldownSec`. 세부는 U35. HUD 에 귀환 시전 막대 (`.ug-hud-cast`).
- [x] 12-8 행동 슬롯의 소모품 사용 (우클릭): 인벤토리에서 같은 id 를 찾아 사용. 없으면 슬롯이 회색이고 아무 일도 없다.
  - (구현됨) `tryUseActiveSlot` → `useConsumable(g, slot.id).ok`. 누르고 있으면 재사용 대기가 끝날 때마다 다시 쓴다 (물약 3초, 투척물 1초, 영약·주문서 1초).
- [x] 12-9 (권장) 장착 무기에 따라 1인칭 무기 모양 변경 (검 = 납작한 날 + 손잡이, 지팡이 = 긴 원통 + 발광 구 등).
  - (구현됨) `VIEW_MODEL_SHAPES` 부품에 도형 (cyl / box / sphere) 과 발광 (`viewModelGlowMat`) 을 더함: 검·대검·단검 = 납작한 날 + 코등이 + 손잡이 (+ 끝 장식), 완드·지팡이 = 막대 + 발광 구. 스크린샷 확인.
- [ ] 12-10 (사용자 확인 필요) 드래그, 우클릭·길게 누르기 상세 정보, 소모품 사용, 장착 시 스테이터스 변화, 정예·보스 드롭. — Playwright 자동 확인 35건 통과 (9절), 확인 방법은 0절

### 13단계: 스킬 트리 화면

"마틴" 전용 (AGENTS.md 2026-10-24: 에릭은 "스킬" 탭 자체가 없다 → 18-4).

- [x] 13-1 레이아웃: 노드 간격 170px, 노드 지름 96px. 콘텐츠 원점 = 기본 공격. 노드 화면 위치 = `(원점X + x × 170, 원점Y − y × 170)` (**y 부호 반전**, 4.4). 콘텐츠 크기 약 1700×1700px, 탭 영역 (약 1600×860) 안에서 스크롤.
- [x] 13-2 연결선: `<svg>` 의 `<line>`. 양 끝 모두 활성 = 금색, 한쪽만 활성 = 흰색 반투명, 둘 다 미활성 = 어두운 회색.
- [x] 13-3 노드: 코드 (M1 등) + 이름 + `Lv a/b`. 상태별로 활성 = 금색 테두리 / 활성화 가능 (연결된 스킬이 활성 + 포인트 ≥ 1) = 청록 테두리 깜빡임 / 잠김 = 어둡게. 갈래별 배경색 (마법 파랑, 근접 빨강, 방어 초록, 보조 노랑, 교차 보라).
- [x] 13-4 스크롤 (AGENTS.md): 노드가 아닌 빈 곳을 누르고 끌면 가로·세로 스크롤. 노드 위에서 누른 경우 6px 이상 움직이면 스크롤, 아니면 클릭으로 처리. 방향키 (←↑→↓) 로 스크롤 (스킬 탭이 열려 있을 때만, 한 번에 60px, `preventDefault`). 콘텐츠 밖으로 넘어가지 않게 범위 제한. 처음 열 때 기본 공격이 가운데.
- [x] 13-5 노드 클릭 → 오른쪽 상세 패널: 이름, 종류, 현재 Lv 수치와 다음 Lv 수치 (`values(lv)`, `values(lv + 1)`), 소모·재사용 대기, 설명. 버튼 [활성화] 또는 [레벨 업] (불가하면 `is-disabled` + 이유 툴팁: "스킬 포인트가 없습니다" / "연결된 스킬을 먼저 활성화해야 합니다" / "최대 레벨입니다"). 액티브 스킬이면 [행동 슬롯에 등록] (1~7 선택). — AGENTS.md (2026-10-24) "이 화면에서 행동 슬롯에 스킬을 장착할 수 있어야 한다" 가 이것이다. 등록은 12-4 의 `setActionSlot(state, i, { type: 'skill', id })` 를 쓴다 (패시브는 등록 불가).
- [x] 13-6 규칙 함수 (순수): `canLearnSkill(state, id)` → `{ ok, reason }`, `learnSkill(state, id)` (활성화 = Lv1 로, 레벨 업 = +1, 포인트 −1).
  - 활성화 조건: 아직 미활성 + 포인트 ≥ 1 + `SKILL_NEIGHBORS[id]` 중 하나라도 활성.
  - 레벨 업 조건: 활성 + `Lv < maxLv` + 포인트 ≥ 1.
  - 자체 테스트 추가: 포인트 1 을 준 시작 상태에서 M0 활성화 가능, M1 불가, BA 레벨 업 가능, X1 은 M9 또는 A3 가 활성일 때만 가능. `__TEST__` 에 `canLearnSkill, learnSkill` 추가.
- [x] 13-7 상단에 "스킬 포인트 n".
  - (구현됨, 13-1 ~ 13-7) [13] `canLearnSkill` (반환 `{ ok, mode: 'learn' | 'levelUp', reason }`, 이유는 최대 레벨 → 연결 → 포인트 순, 없는 id 는 `skill.unknown`)·`learnSkill`. [20] `renderSkillTab` (`MENU_TAB_RENDERERS.skill`): 위 줄 = 남은 스킬 포인트 (스테이터스 탭과 같은 상자, 숫자 `.ug-num`)·범례 (활성·활성화 가능·잠김, 액티브 ○ / 패시브 □)·조작 안내 / 왼쪽 보기 영역 `.ug-skill-view` (1184×864, 안쪽 1182×862 = `SKILL_VIEW_W·H`) 안의 1700px 콘텐츠 (`SKILL_TREE_SIZE`, 원점 850 = `SKILL_TREE_ORIGIN`) 를 `transform` 으로 스크롤 (`setSkillScroll`·`clampSkillScroll`) / 오른쪽 상세 패널 `skillDetailPanel` (536×864). 노드 `skillTreeNode` = 원 (액티브)·둥근 사각형 (패시브) 안에 코드 + `Lv a/b`, 아래 이름표 (어두운 바탕 — 연결선이 글자를 가로지르지 않게), 갈래별 배경색, 상태 `skillNodeState`, 선택 = 흰 테두리, 활성 + 포인트 있음 + 최대 아님 = 오른쪽 위 금색 "+". 연결선 `skillTreeLinks` (`skillLinkState`). 갈래 이름 (마법형·근거리 공격형·방어형·보조형) 을 각 갈래 끝 바깥에. 상세 패널: 이름 (갈래 색)·코드·갈래·종류·스킬 레벨, "현재 레벨" 블록 (소모 `costAtLevel`·재사용 대기 `skillCooldown`, 기본 공격은 "= 공격 간격" + 실제 공격 간격, 설명 `skillDescParts` → 수치는 별도 `.ug-num` 요소, `fmtSkillValue` 로 소수 오차 제거) 과 "다음 레벨" 블록 (달라진 수치 초록), [활성화]/[레벨 업] (`disabledReason` = 이유 툴팁), 액티브 = 행동 슬롯 [1]~[7] (`skillAssignRow`: 지금 든 스킬 코드·소모품 아이콘을 작게, 이 스킬이 든 칸은 강조, 누르면 `setActionSlot`, 강조된 칸을 다시 누르면 해제, 활성화 전에는 회색 + "먼저 스킬을 활성화해야 합니다."), 패시브 = 안내 문구. 배우면 `g.derived` 다시 계산 + `clampVitals` (D4 등 바로 반영). 조작 `attachSkillTreePointer` (포인터 캡처, 6px = `SKILL_DRAG_PX`, 휠 = 위아래·Shift+휠 = 좌우 90px), 방향키 `scrollSkillTreeByKey` (`SCREENS.game.onKeyDown` 이 스킬 탭일 때 먼저 넘김, 누르고 있으면 반복). 탭을 새로 열거나 메뉴를 닫으면 `resetSkillTreeUi` (다음에 그릴 때 기본 공격 선택·가운데). 문구 `skill.*` (한국어·영어). 보조형 글자색을 HUD·인벤토리 행동 슬롯도 노랑 (`#f0e08a`) 으로 맞춤 (13-3 배경색과 같은 계열).
- [ ] 13-8 (사용자 확인 필요) 드래그·방향키 스크롤, 활성화·레벨 업, 행동 슬롯 등록.

### 14단계: 스킬 효과 구현 (45개)

"마틴" 전용.

- [x] 14-0 [15] 실행 공통 `castSkill(id)`:
  1. 빙결·기절 중이면 실패
  2. 재사용 대기 중이면 실패 (조용히)
  3. 자원: `costAtLevel(cost, lv)`. 스태미너 스킬은 탈진 중 불가. 부족하면 실패 + HUD 슬롯 깜빡임
  4. 자원 소모 → 재사용 대기 시작 = `cooldown(lv) × (1 − cdrPct / 100)` (최소 0.1초)
  5. `SKILL_HANDLERS[id](ctx, lv, skill.values(lv))` 실행. `ctx = { game, origin: 카메라 위치, dir: 조준 방향 (위아래 포함), forward: 수평 앞 방향, derived }`
  - 공용 효과 함수 (한 번만 만들고 모든 스킬·몬스터·보스가 재사용): `spawnProjectile(opts)`, `damageInRadius(center, radius, spec, onHit)`, `damageInCone(origin, forward, range, arcDeg, spec)`, `pickTargetInFront(range, maxAngleDeg)` (조준 방향에 가장 가까운 1마리), `aimGroundPoint(maxDist)` (조준선이 바닥에 닿는 점, 없으면 최대 거리 지점), `createGroundZone(opts)` (불타는 지면·눈보라·독 구름 같은 지속 범위, 몬스터용과 공용), `addBuff(id, seconds, mods)`, `dashTo(dir, dist, onPass)`, `blinkTo(dir, dist)`, `knockback(monster, dir, dist)`, `spawnEffectMesh(kind, pos, seconds)` (발광 구·고리 같은 짧은 연출).
  - 패시브는 핸들러 없이 `PASSIVE_MODS` (3-9) 와 개별 훅 (A8 흡혈, D6 불굴, X2 반격, M5 빙결 확률 등) 으로 처리한다.
- [x] 14-1 기본 공격 BA — 8단계 구현을 `castSkill('BA')` 경로로 합친다.
- [x] 14-2 마법형 (수치는 AGENTS.md 표 그대로. 연출 색: 비전 보라, 화염 주황, 냉기 하늘색, 전격 노랑)
  - [x] M0 마력 화살: 투사체
  - [x] M1 화염구: 착탄 폭발 + 화상
  - [x] M2 화염 숙련: 패시브
  - [x] M3 유성 낙하: `aimGroundPoint` 에 1초 뒤 낙하 + 불타는 지면 3초
  - [x] M4 얼음 창: 3명 관통 + 둔화
  - [x] M5 냉기 숙련: 패시브 + 빙결 확률 훅
  - [x] M6 눈보라: 지속 범위 5초
  - [x] M7 연쇄 번개: 즉발 (레이 판정) + 8m 안에서 튕김. 번개는 지그재그 `THREE.Line` 0.15초
  - [x] M8 전격 숙련: 패시브
  - [x] M9 번개 폭풍: 8초 동안 0.5초마다 12m 안 무작위 적에게 낙뢰
- [x] 14-3 근거리 공격형 (스태미너 소모)
  - [x] A0 강타: 단일 대상 + 넉백 3m
  - [x] A1 연속 베기: 0.2초 간격 3회 부채꼴 판정
  - [x] A2 무기 숙련: 패시브
  - [x] A3 칼날 폭풍: 3초 동안 0.25초마다 주위 4m, 이동 속도 −30%, 넉백·경직 면역
  - [x] A4 돌진: 최대 10m 대시 (벽에서 멈춤), 지나간 적에게 피해 + 기절
  - [x] A5 급소 노리기: 패시브
  - [x] A6 처형: HP 30% 이하면 2배, 처치 시 재사용 대기 50% 반환
  - [x] A7 깊은 상처: 즉시 피해 + 출혈 5초
  - [x] A8 피의 갈증: 흡혈 + HP 50% 이하일 때 피해 증가
  - [x] A9 대지 분쇄: 8m · 90° 부채꼴 + 기절 1.5초
- [x] 14-4 방어형
  - [x] D0 수호 태세: 버프 (`damageTakenPct` 음수) + 넉백·경직 면역
  - [x] D1 방패 강타: 방어력 50% 추가 피해, 방패 장착 시 피해 +30%·기절 1.5배
  - [x] D2 철갑 피부: 패시브
  - [x] D3 가시 갑옷: 버프 + 근접 피격 시 반사 훅
  - [x] D4 강인한 체력: 패시브
  - [x] D5 위협의 함성: 10m 안 적 공격력 감소 + 보스가 아닌 몬스터 공포 2초
  - [x] D6 불굴: 죽을 피해를 받으면 HP 1 + 2초 무적, 내부 재발동 대기
  - [x] D7 원소 저항: 패시브
  - [x] D8 원소 보호막: 버프 (저항 + 상한 80%)
  - [x] D9 마력 보호막: 흡수 보호막 (HP 보다 먼저 깎임, HP 막대 위에 흰색으로 겹쳐 표시)
- [x] 14-5 보조형
  - [x] S0 응급 처치
  - [x] S1 약초학: 패시브 (물약 회복량·재사용 대기)
  - [x] S2 정화: 해제 + 면역
  - [x] S3 재생의 기운: 10초 지속 회복
  - [x] S4 가속: 버프
  - [x] S5 탐험가의 감각: 주변 (1 + Lv) 칸 공개, 골드 %, Lv3 포탈·상인 표시, Lv5 엘리베이터 표시 (지도 탭에 반영)
  - [x] S6 순간이동: 이동 경로를 0.2m 간격으로 검사해 막히기 직전 위치까지, 이동 후 0.3초 무적
  - [x] S7 명상: 패시브
  - [x] S8 주문 가속: 패시브
  - [x] S9 마나 샘: 즉시 MP 회복 + MP 소모 감소 버프
- [x] 14-6 교차 스킬
  - [x] X1 원소 부여: 15초 버프, 기본 공격·근거리 스킬 적중 시 추가 피해 (마지막으로 쓴 원소 스킬 속성을 `game.lastElement` 에 기억)
  - [x] X2 반격: 패시브 훅
  - [x] X3 임시 성역: 반경 4m 결계 8초 — 적 투사체 소멸 + 회복. **저장 불가·몬스터 진입 허용**. 진짜 성소 판정 함수 (`isInSanctuary`) 와 섞지 않는다.
  - [x] X4 시간 왜곡: 12m 안 적과 적 투사체 속도 감소 6초
  - (구현됨, 14-0 ~ 14-6) [15] `castSkill(g, id, slotIndex)` (`tryUseActiveSlot` 이 스킬이면 부름. 실패 순서 = 미습득·패시브·빙결·기절 → 재사용 대기 (조용히) → 자원 (`skillCost`·`canPaySkill`, 모자라면 `g.slotDenied` → HUD 슬롯 붉게 0.35초) → 소모 → `skillCooldownFor` (기본 공격 = 공격 간격, 그 외 × (1 − cdrPct%), 최소 0.1초) → `SKILL_HANDLERS[id](g, skillContext)`), 화염·냉기·전격 스킬은 `g.lastElement`. 핸들러 30개 (액티브 = 핸들러, 자체 테스트). 공용 도우미: `magicSpec`·`meleeSpec`, `meleeReach` (완드·지팡이면 맨손 판정), `meleeCos` (부채꼴·높이·시야), `meleeSweep`·`pickTargetInFront`·`playerMeleeHit` (+ 원소 부여 `elementalWeaponHit`), `applyPlayerStatus` (M2·M5·M8 보정), `lightningShock`, `skillBlast`, `aimGroundPoint`, `aimRayHit`, `firePlayerBolt(g, spec, pierce, o)` (o = speed·radius·look·onHit·onImpact), 돌진 `startDash`/`updateDash` (`player.dash`, `applyForcedMovement` 가 부름), 순간이동 `blinkTarget`, 예약 `skillLater`/`updateSkillTimeline` (`g.skillTimeline`, 층 이동 때 비움), 스킬 버프 `addSkillBuff`/`skillBuff`/`updateSkillBuffTicks` (버프의 `tick`·`onTick` — 번개 폭풍·칼날 폭풍·시간 왜곡), 연출 `spawnLightning`·`spawnGroundMarker`·`spawnConeFlash`, 재질 `getSkillAssets`, `restorePlayer`. 피격 쪽 ([14]): `hitPlayer(g, attacker, spec, effect, src)` — 무적, 방패 막기 (아래 U49 ㉓), 근접이면 `meleeRetaliation` (X2 반격·D3 가시 갑옷), `damagePlayer` — 무적·마력 보호막 흡수·불굴 `tryUndying`, `knockPlayer` 넉백 면역, `damageMonster` 의 M5 빙결 확률, `monsterAttacker` 의 위협의 함성 (`custom.weakenT`·`weakenPct`), 보스 근접 패턴 `bossMeleeHit`, 적 투사체 결계 소멸 (`zone.ward`). [07] `calcDerivedStats` 가 버프의 `moveMul` 을 곱함 (칼날 폭풍). [13] `updateRegen` 재생의 기운 (`healPctPerSec`), S5 `revealCellsAround` (칸이 바뀔 때)·`revealFacilities` (층에 들어올 때). [19] HUD: 스킬 슬롯 자원 부족 흐리게·`is-denied`, HP 막대 위 마력 보호막 (`.ug-hud-bar-shield`, 숫자 `(+N)`). 세부 결정은 5절 U49. 버프 HUD 아이콘 글자 `SKILL_BUFF_STYLE`.
- [ ] 14-7 (사용자 확인 필요) 갈래 하나를 끝낼 때마다 사용자 확인 요청 (2026-10-18 사용자: 확인은 나중에 몰아서 → 0절에 방법). 디버그 해시 `&level=40&skills=all` (모든 스킬 Lv1 활성) 을 테스트에 쓴다.

### 15단계: 방랑 상인

"마틴" 전용 (AGENTS.md 2026-10-24: 에릭 층에는 상인이 없다 → 17-1). 15-2 의 "조준한 대상과 클릭으로 상호작용" 은 17-4 (캐비닛·서랍) 와 같은 함수로 만든다.

- [x] 15-1 [16] 재고 생성 `generateMerchantStock(rng, floor)` (AGENTS.md "방랑 상인 판매 규칙"):
  - 소모품 = 생명력·마나 물약의 등장 가능한 모든 단계 + 그 외 분류 중 무작위 4종 (분류마다 등장 가능한 단계 중 무작위 1개). 재고 무제한.
  - 장비 = 4~6개 (`generateEquipment`, 등급 확률 일반 40 / 마법 45 / 희귀 15), 각 1개. 장비 목록의 번호 (0부터) 가 품절 기록에 쓰인다.
  - **재고는 저장하지 않고 매번 같은 시드로 다시 만든다**: `generateMerchantStock(createRng(hashInts(state.dungeonSeed, 777)), state.floor)`. 팔린 장비는 `state.world.merchantSoldOut` 에 번호를 넣어 품절 처리 (층 기록에도 함께 보관되므로 지나온 층에 다시 가도 품절 그대로, 포탈로 초기화된 층은 새 시드라 새 재고 — AGENTS.md "방랑 상인 판매 규칙" 2026-10-18 문구).
  - (구현됨) [16] `MERCHANT_STOCK`·`generateMerchantStock`·`merchantStockOf` (`MERCHANT_SEED_SALT` 777). 소모품 표시 순서 = 생명력 → 마나 → 활력·치료제·투척물·영약·주문서 (U50 ③).
- [x] 15-2 상호작용: 주인공이 상인 방 (2026-10-25 부터 1×1 상점 칸) 안에 있고, 상인 인형과 거리 4m 이내, 조준 방향과 상인 방향 사이 각도 30° 이내 → HUD 가운데 아래에 "클릭: 거래하기". 이때 왼쪽 클릭 → 상점 열기 (포인터 락 해제, 일시정지 U6).
  - (구현됨) [08] `merchantLayout(d, piece)` (상점 칸 중심·출입구 방향 `dir`·입구를 바라보는 yaw. `buildMerchantProps` 도 이것을 씀, 상인 인형 = 칸 중심에서 입구 반대쪽 `MERCHANT_FIGURE_Z` 1.2m), `collectInteractables` 의 상인 `{ kind: 'merchant', pieceId, x, y: 1.5, z, range: 4 (MERCHANT_INTERACT_RANGE), insidePiece: true, labelKey: 'interact.trade' }`. [13] `findInteractable` 이 대상별 `range`·`insidePiece` (지금 칸이 그 조각일 때만)·에릭이면 상인 제외, `useInteractable` 이 상인이면 `g.uiEvents` 에 `{ type: 'openShop' }`. [12] 상호작용 클릭 (`input.leftClicked`) 은 포인터 락 중에 누른 것만 (8절 38번, 15단계 확인 때 고침).
- [x] 15-3 상점 UI: 위쪽에 상인 인사말 (무작위 3종, ko/en), [구매] [판매] 탭, 오른쪽 위에 소지 골드, [닫기] (ESC 도 닫기).
  - 구매: 소모품 목록 (가격 = `consumablePrice(id, floor)`), 장비 목록 (가격 = `equipPrice`, 품절 표시). 클릭 → 수량 선택 (소모품: 1 / 5 / 최대) → 골드·인벤토리 공간 확인 → 구매 (`addItem` 이 uid 를 붙임). 상세 정보는 인벤토리와 같은 방식 (우클릭 / 길게 누르기).
  - 판매: 장착하지 않은 인벤토리 아이템 목록과 판매가. 소모품은 수량 선택. 희귀 장비를 팔 때는 확인 대화상자.
  - (구현됨) [16] `consumableRoom`·`maxBuyCount`·`buyConsumable`·`buyEquipment` (복사본을 `addItem`, `world.merchantSoldOut` 에 번호)·`sellPriceOf` (플래시는 null)·`sellItem`. [18] `SCREENS.game` 의 `shop`·`openShop()` (에릭이면 열지 않음, 일시정지·포인터 락 해제)·`closeShop()`·ESC 로 닫기·`canOpenMenu`/`refreshOverlay`/`exit`/`showDeath` 가 상점을 고려, `updateFeedback` 의 `openShop` 이벤트, 디버그 `&shop=1`. [20] `createShopUi`·`renderShop`·`renderShopBuy`·`shopRow`·`attachShopPointer` (클릭 / 우클릭·0.5초 = 상세)·`showShopDetail` (`buildItemDetail` + 구매가)·`shopQtyButton`·`showBuyConsumable` ([1] [5] [최대])·`showBuyEquipment`·`renderShopSell` (40칸 + 칸 아래 1개 판매가)·`showSellMenu` ([1] [5] [모두] / 장비 [판매])·`confirmSellRare`. [17] CSS `.ug-shop*`. [03] 문구 `interact.trade`, `shop.*` (한국어·영어, 인사말 3종).
- [x] 15-4 자체 테스트: 재고 규칙 (생명력·마나 물약 포함, 장비 4~6개, 같은 시드 = 같은 재고). `__TEST__` 에 `generateMerchantStock` 추가.
  - (구현됨) "방랑 상인 재고 (…15-1)" (지하 1·8·12·18·30층 × 시드 150개: 물약 전 단계·그 외 4종 (서로 다름·등장 가능한 단계·분류 순서)·장비 4~6개·등장 가능한 단계가 모두 나옴·iLv = 층·uid 없음·등급 비율 40/45/15 ±4%p·결정성), "방랑 상인 구매·판매·품절 유지 (15-3)" (지하 4층 가격·합치기·실패 4종 (골드 부족·0개·소수·없는 id) 은 아무것도 바꾸지 않음·공간/골드 최대·장비 복사본·품절·내려갔다 올라오면 품절·재고 그대로·판매가 25%/20%·남은 만큼·행동 슬롯 유지·플래시·빈칸), "상인 상호작용 (…15-2)" (5개 층: 상인 1명·1×1 방·입구를 바라봄·위치·1.6m/2.6m 대상·3.2m 없음·등 돌림·칸 밖·에릭). 규칙을 일부러 깨뜨린 사본 6개로 각 테스트가 실패하는 것을 확인.
- [ ] 15-5 (사용자 확인 필요) 상인 클릭 → 구매·판매, 저장 후 불러오기 시 품절 유지, 위층으로 돌아갔을 때 그 층 상인의 품절 유지. — Playwright 자동 확인 39건 통과 (9절), 확인 방법은 0절.
- [x] 15-6 (2026-10-25 AGENTS.md 변경, 사용자 지시) 방랑 상인 상점 1×1, "몬스터는 상점 주변 3칸 이내로 접근하지 않음" (U51).
  - (구현됨) [08] 조각 템플릿 `merchant` = 1칸 방형 (`merchantCenter`), `PIECE_SIZE.merchant` = 1, `merchantClearingOk` (상점 칸과 공터 3×3 방 칸 사이 체비쇼프 거리 4 이상), `markMerchantZone` (`cell.merchantZone`, `MERCHANT_SAFE_CELLS` 3), `merchantLayout` (출입구 = 그 칸의 door 변). [11] 장식 `decorCells(d, true)`·쇠사슬 예외가 `merchantCenter` 칸. [14] `monsterBarred` (성소 구역 + 상점 주변) 를 `canSpawnMonsterIn`·`validMonsterSpot`·`moveMonsterBy`·`cellBfs`·`findCellPath` 가 씀. [13] `playerStartPosition` 이 벽 안 저장 위치를 거름. [21] 디버그 `&at=merchant` 시점 (카운터 앞 2.4m).
  - 자체 테스트: "던전 생성 - 구조 검사" 의 상점 칸 수 9 → 1 (AGENTS.md 변경이 근거, 8절 21번의 예외) + 상점 주변 칸 표시·공터 3×3 이 범위 밖인지 검사 추가. "배회" 테스트는 고정 시드 (4, 12층) 던전에 해골 궁수·고블린 무리가 있다는 준비 조건이 깨져 조건을 만족하는 시드를 찾도록 준비부만 고침 (기대값 그대로). 새 테스트 "상점 주변 3칸 = 몬스터가 들어갈 수 없는 칸", "불러오기 시작 위치".

### 앞 단계 점검 (2026-10-24, 에릭·엘리베이터가 끼치는 영향)

사용자 지시 ("앞 단계부터 다시 점검") 로 0~12단계의 결과물을 AGENTS.md (2026-10-24) 에 비춰 본 결과. 바꿀 것은 모두 16~19단계 작업에 넣었다.

| 단계 | 바뀌는 것 | 작업 |
|---|---|---|
| 1 (슬롯·메뉴) | 빈 슬롯 확인 대화상자에서 주인공 선택, 슬롯 요약에 주인공. 요약 줄의 숫자 글꼴 규칙 (0절 알려진 문제) 도 이때 고친다 | 16-2 |
| 2 (던전 생성) | 에릭: 포탈·상인·추가 성소·보스 공터 없음. 마틴은 결과가 바뀌면 안 됨 | 17-1 |
| 3 (상태·층 기록) | `hero`, 에릭 새 게임 상태, 층 기록의 `drawersTaken` | 16-1, 18-1, 17-6 |
| 4 (3D) | 계단 경사·디딤판·끝 평면 → 엘리베이터 (문·버튼 판), void 난간 (U21), 에릭 어둠·가구 | 16-3, 18-3, 17-3 |
| 5 (조작·HUD) | 에릭 HUD (HP·MP·레벨·골드 숨김, 플래시 에너지), 캐비닛 안에서 이동 불가 | 18-4, 17-5 |
| 6 (메뉴·지도·저장) | 저장 가능 영역에 엘리베이터 내부, 지도 범례 "계단" → "엘리베이터", 에릭은 탭 3개 | 16-5, 16-6, 18-4 |
| 7 (층 이동) | 걸어서 발동하는 계단 트리거 → 엘리베이터 버튼 판 클릭 (포탈은 그대로), 디버그 `&at=stairsDown` 시점, 층 이동 때 `hero` 전달 | 16-4, 16-3, 17-1 |
| 8 (몬스터·전투·성장) | 에릭은 기본 공격·경험치·골드 없음 (행동 슬롯에 스킬 등록 불가), 에릭 몬스터 생성·AI 따로, 노릴 수 없는 곳 (`playerTargetable`) 에 엘리베이터 내부·캐비닛 | 18-1, 19-1, 19-2 |
| 9 (상태이상) | 바뀌는 것 없음 (에릭 몬스터는 상태이상을 걸지 않고 한 방 공격) | - |
| 10 (테마 몬스터·보스) | 에릭 몬스터는 보스 외형만 쓰고 패턴·보스 HP 막대 (`bossFight`) 없음 | 19-1, 19-2 |
| 11 (스테이터스) | 에릭은 탭 없음 | 18-4 |
| 12 (아이템·인벤토리) | 에릭: 장착 칸 숨김, 플래시·배터리, 드롭 없음 (처치 불가), 서랍에서 획득. 공통: 버리기 | 18-1, 18-4, 17-6, 16-7 |

### 16단계: 두 주인공 공통 기반 (주인공 선택·엘리베이터·아이템 버리기)

목표: AGENTS.md (2026-10-24) "공통 요소가 많은 두 가지 다른 세계관"·"메인 메뉴 > 게임 슬롯"·"던전 구성요소 (공통)" 의 변경을 마틴·에릭 공통으로 반영한다. 마틴의 게임 진행·기존 저장 데이터는 그대로 이어져야 한다.

- [x] 16-1 [01]·[09] 주인공 데이터 `HEROES = { martin: { id, nameKo: '마틴', nameEn: 'Martin' }, eric: { id, nameKo: '에릭', nameEn: 'Eric' } }`, 게임 상태 최상위 `hero` (6.1). `createNewGameState(slotIndex, hero = 'martin')`. `isValidState` 가 `hero` 를 검사하고, `hero` 가 없는 이전 저장 데이터는 `'martin'` 으로 읽는다 (`deserializeState`). 자체 테스트: 기본값·이전 형식·잘못된 값. (에릭의 시작 소지품·장비 차이는 18-1)
  - (구현됨) [01] `HEROES` (이름·한 줄 설명), `DEFAULT_HERO`, `isHeroId` (`Object.hasOwn` — `constructor` 같은 이름 막기). `createNewGameState(slot, hero)`, `isValidState`·`deserializeState` (없으면 마틴). 자체 테스트 "주인공 (hero) 상태·저장 형식".
- [x] 16-2 [17]·[18] 빈 슬롯 확인 대화상자 (U38): "새로 던전에 입장하시겠습니까?" 아래에 [마틴] [에릭] (처음엔 마틴 `is-selected`, 누르면 바뀌고 대화상자는 닫히지 않음) + [예] [아니오]. `showDialog` 가 문구 아래에 노드를 넣을 수 있게 확장. [예] → `startNewGame(slot, hero)`. 슬롯 카드 요약 줄에 주인공 이름 (숫자는 별도 요소 + `.ug-num`, 0절 알려진 문제의 글꼴 규칙도 함께 고친다). 디버그 해시 `&hero=eric` (3.5).
  - (구현됨) `showDialog({ message, content, buttons })` 의 `content`, `heroPickerNode` (버튼 2개 + 한 줄 설명, `is-selected` 토글), `startNewGame(slot, hero)`, 슬롯 요약 `slotSummaryNode`·`slotTimeNode` (숫자 `.ug-num`, 에릭은 Lv 없음 — 0절 알려진 문제였던 글꼴 규칙 해결), 저장 슬롯 대화상자도 같은 노드. `&hero=eric`. 문구 `slots.floorPre/floorPost/level/savedAtLabel/pickHero` (옛 `slots.summary`·`slots.savedAt` 삭제).
- [x] 16-3 [08]·[11] 계단 → 엘리베이터 겉모습 (U37): 경사·디딤판·계단 끝 평면 (`stairStepBoxes`, `STAIRS_DEPTH` 의 높이) 을 없애고 바닥을 평평하게 (`floorHeightAt` 이 엘리베이터 칸에서도 0). 엘리베이터 내부 2칸 (step1·step2) = 앞 통로와의 경계에 양쪽으로 열리는 문 2짝, 안쪽 벽·천장 조명, 안쪽 끝 벽의 층 버튼 판·층 표시등 (위층 ▲ / 아래층 ▼) (테마별 색, 이미지 없이 도형·canvas 텍스처). 문은 주인공이 가까이 오면 열리고 층 이동 때 닫힌다. void 의 난간 높이 (U21) 를 엘리베이터에 맞게 다시 정한다.
  - (구현됨) `floorHeightAt` = 항상 0, `stairsProgress`·`STAIRS_DEPTH`·`stairStepBoxes`·`STAIR_STEPS_PER_CELL`·`buildStairEnd` 삭제, `collectDungeonBoxes` 의 계단 예외 삭제 (void 난간도 모든 칸 1.2m). [08] `elevatorLayout` (문 = 앞 통로와 step1 의 경계, 버튼 판 = 끝 벽 면 0.05m 앞, `ELEVATOR_LEN` 27m), [11] `buildElevatorProps` + `getElevatorAssets` (붓질 금속·무늬 철판 canvas 텍스처, ▲/▼ 발광 판, 모든 테마 공용) — 바닥 철판·양옆 벽판·끝 벽판·천장 (4.4m)·조명 띠·문틀·상인방·바깥 표시등·버튼 판, 양쪽 문은 눈이 문에서 6m 안이면 열리고 `view.closeElevator` 로 닫힘. 테마 5종 스크린샷 확인.
- [x] 16-4 [13] 엘리베이터로 층 이동 (U37): 버튼 판을 조준해 클릭 → 문 닫힘 연출 + 지금의 어두워지기 (0.4초) → `changeFloor`. 걸어 들어가는 것만으로는 이동하지 않는다 (안에서 저장할 수 있도록). 조준·클릭 상호작용은 17-4 의 공용 함수를 여기서 먼저 만든다 (마틴·에릭 공통, 15-2 상인도 사용). 도착은 앞 통로 (`getSpawn`, 지금과 같음). 지금의 걸어서 발동하는 트리거 (`collectFloorTriggers` 의 계단, `stairsProgress`, `STAIRS_TRIGGER_PROGRESS`) 는 버튼 판 위치로 바꾸고 (포탈은 그대로 걸어서 발동), 자체 테스트 "던전 - 계단 바닥 높이", "계단 디딤판 높이 = floorHeightAt (4-7)", "그리기용 상자", "층 이동 트리거" 의 기대값을 엘리베이터 규칙 (바닥 0, 버튼 판 상호작용) 으로 바꾼다 — 기대값의 근거인 AGENTS.md 가 바뀌었으므로 8절 21번의 예외이며, 바꾼 내용을 9절에 적는다.
  - (구현됨) [08] `collectInteractables(d)` (엘리베이터 버튼 판, `view.interactables`), [13] `findInteractable` (2.6m·30°, `INTERACT_RANGE`·`INTERACT_ANGLE_DEG`)·`updateInteraction`·`useInteractable` (문 닫기 + `changeFloor`), 런타임 `interactTarget`, HUD `.ug-hud-prompt` ("클릭 | 아래층으로"). `collectFloorTriggers`·`floorTriggerAt` 은 포탈만. 자체 테스트 4개를 엘리베이터 규칙으로 바꿈 (9절).
- [x] 16-5 [13]·[20] 저장 가능 영역 (U47): 판정 함수 하나 `canSaveHere(g)` = 성소 구역 또는 엘리베이터 내부 (`cell.role` 이 `stairsStep1`·`stairsStep2`). 시스템 탭 [저장]·[메인 메뉴] (6-4), HUD 안내 ("성소 — 저장 가능" / "엘리베이터 — 저장 가능") 가 이 함수를 쓴다. 성소의 회복·상태이상 해제·몬스터 차단 (`g.inSanctuary`) 과는 섞지 않는다. 비활성 이유 툴팁 문구 변경. 자체 테스트.
  - (구현됨) [13] `isElevatorInterior(cell)`, `canSaveHere(g)`, 런타임 `inElevator` (`updateCellState`). 시스템 탭 [저장]·상태 문구 (`system.inElevator`)·[메인 메뉴], HUD 안내 (`hud.elevator`). 비활성 이유 문구 변경. 자체 테스트 "저장 가능 영역".
- [x] 16-6 [03]·[20] 화면 문구: 지도 범례 "위 계단 / 아래 계단" → "위층 엘리베이터 / 아래층 엘리베이터" (영어 Elevator up / Elevator down) 등 화면에 보이는 "계단" 을 모두 바꾼다 (코드 id 는 그대로, 4.3).
  - (구현됨) 지도 범례 "위층 엘리베이터 / 아래층 엘리베이터", S5 설명, 전지의 주문서 설명, 글자 지도 주석. 디버그 `&at=stairsDown` 은 앞 통로에서 안쪽을 수평으로 본다.
- [x] 16-7 [16]·[20] 아이템 버리기 (U48): 소모품 메뉴·장비 상세 정보에 [버리기] → 확인 대화상자 → 없앰. 장착 중인 장비·플래시는 버릴 수 없음 (회색 + 이유 툴팁). 순수 함수 `discardItemAt(state, index)` + 자체 테스트.
  - (구현됨) [16] `discardItemAt(state, index)` (플래시 `kind: 'tool'` 은 `inv.cannotDiscard`), [20] 소모품 메뉴 [버리기]·장비 상세 정보 (인벤토리 칸) [버리기] → `confirmDiscard` (이름 + 개수 별도 요소). 자체 테스트 "아이템 버리기".
- [ ] 16-8 (사용자 확인 필요) 주인공 선택 대화상자, 엘리베이터 겉모습·문·버튼 판 클릭으로 이동하기, 엘리베이터 안에서 저장·[메인 메뉴], 이전 저장 데이터 이어하기 (마틴으로), 버리기. — Playwright 자동 확인 27건 통과 (9절), 확인 방법은 0절. 16-9 (1칸 엘리베이터, 2026-10-25) 뒤의 모습으로 확인
- [x] 16-9 [08]·[11]·[13] 엘리베이터를 1칸으로 (2026-10-24 사용자 결정, U37): 엘리베이터 = `stairsStep2` 1칸, `stairsStep1` = 복도형 통로. 고칠 곳 — `isElevatorInterior` (step2 만), `elevatorLayout` (문 = step1·step2 경계, `ELEVATOR_LEN` = 11m), `buildElevatorProps` (벽판·천장·조명 띠 길이), `DECOR_ROLES` 에 `stairsStep1` 추가 (테마 장식이 놓이게), 백룸 걸레받이 등 계단 칸을 건너뛰던 곳은 step2 만 건너뜀, 지도 (`mapCellFill` 은 step2 만 엘리베이터 색, 아이콘은 `piece.cells[2]` 에), 디버그 `&at=stairsDown` 시점 (앞 통로 → 통로 너머 엘리베이터가 보이게). 문이 열리는 거리 (6m) 는 그대로. 자체 테스트 "던전 - 엘리베이터" (내부 1칸·문 위치·거리 11m), "저장 가능 영역" (내부 칸 수 4 → 2), "조준 상호작용" 의 기대값을 바꾼다 (사용자 결정이 근거, 9절에 기록). 던전 조각 구조·생성 결과는 바뀌지 않는다 (기존 저장 데이터 그대로).
  - (구현됨, 2026-10-25) [08] `ELEVATOR_LEN` 11m, `elevatorLayout` 의 문 = `cells[2]` 칸의 앞 경계. [11] `buildElevatorProps` 는 `ELEVATOR_LEN` 을 따라 바닥·벽판·천장·조명 띠가 짧아짐 (코드 변경은 주석만), `DECOR_ROLES` 에 `stairsStep1`, 백룸 걸레받이는 `isElevatorInterior` 칸만 건너뜀. [13] `isElevatorInterior` = `stairsStep2` 만. [20] 지도 `mapCellFill`·`mapIconOf` (아이콘 `cells[2]`). 디버그 `&at=stairsDown` 시점은 그대로 (앞 통로 가운데에서 안쪽 → 복도 끝의 닫힌 문·표시등이 보임). 도착 위치 (`getSpawn`) 는 U37 대로 앞 통로 그대로. 자체 테스트 "던전 - 엘리베이터" (내부 1칸·문 = step1/step2 경계·`ELEVATOR_LEN` 11), "저장 가능 영역" (4 → 2) 의 기대값을 바꿈 (사용자 결정이 근거, 옛 값은 주석). "조준 상호작용" 은 앞 통로에서 끝까지 걸어가 버튼 판을 보는 테스트라 바꾸지 않고 통과.

### 17단계: 에릭 — 던전 생성 차이·캐비닛·서랍형 장롱

목표: AGENTS.md "던전 구성요소 (공통)" 의 에릭 예외와 "던전 특징 ("에릭" 플레이 시에만 해당)" 의 캐비닛·서랍형 장롱.
- (2026-10-25 AGENTS.md 변경) 장롱은 일자형·ㄱ자형에도 1/4·층마다 16개 이상·내용물이 바뀌었다 → 22-1 에서 고친다. 상호작용은 왼쪽 클릭 → F 키 (21-1).

- [x] 17-1 [08] `generateDungeon(seed, floor, hero = 'martin')` (U39): 마틴은 지금과 **완전히 같은 결과** (같은 시드 몇 개의 결과를 비교하는 자체 테스트 추가 — 기존 저장 데이터의 층이 바뀌면 안 된다). 에릭: 포탈·상인 없음, 지하 1층 = 시작 성소 1곳만, 지하 2층부터 성소 없음 (시작 조각 십자형), 보스 공터 없음. 던전을 만드는 모든 곳 (`createGameRuntime`, `swapFloor`, `startDebugGame`·`debugViewpoint`, 디버그 화면) 에 `state.hero` 를 넘긴다. 자체 테스트 "던전 생성 - 구조 검사" 를 에릭 던전에도 (조각 개수·모든 칸 도달 가능). 에릭 층의 몬스터 생성 금지 칸·도착 위치 (`getSpawn`) 도 확인.
  - (구현됨, 2026-10-25) [08] `tryGenerateDungeon(rng, floor, hero)`·`generateDungeon(seed, floor, hero = 'martin')` (`d.hero`). 마틴은 필수 조각 목록·`rng.int(0, 3)` (추가 성소) 까지 같은 순서로 난수를 써서 결과가 같다 — 작업 전 지문 7개와 비교하는 자체 테스트 "던전 생성 - 마틴 결과 고정". 에릭: 필수 조각 = 아래층 (+ 2층부터 위층) 엘리베이터뿐, 추가 성소 0, 보스 공터 없음. `getSpawn(d, 'newGame')` 은 성소가 없으면 위층 엘리베이터 앞 통로 (에릭 지하 2층부터 불러오기 대체 위치·디버그 시점). `createGameRuntime`·`swapFloor`·`startDebugGame` 과 디버그 화면 (`#debug=ascii`·`#debug=view` 에 `&hero=eric`) 이 주인공을 넘긴다. 자체 테스트 "던전 생성 - 에릭" (7개 층 × 시드 15: 구조 검사 (`checkDungeon(d, floor, 'eric')`)·상점 주변 칸 없음·보스 없음·시작 위치). 몬스터 생성 금지 칸은 마틴과 같은 규칙 (에릭 몬스터는 19단계).
- [x] 17-2 [08] 가구 배치 순수 함수 `planEricFurniture(d)` (U40) → `{ cabinets: [{ id, cellKey, x, z, yaw }], drawers: [{ id, cellKey, x, z, yaw, items: [id | null, id | null] }] }`. 시드 고정 난수 `createRng(hashInts(d.seed, d.floor, 5005))` (같은 층 = 같은 배치, 저장하지 않음). 캐비닛 = 일자형·ㄱ자형 조각마다 1/4 (최소 8개), 서랍형 장롱 = ㅏ형·십자형 조각마다 1/2. 통로를 막지 않게 벽에 붙인다. 자체 테스트: 개수 (8개 이상)·조각 종류·결정성·벽과 겹치지 않음·모든 칸 도달 가능 유지.
  - (구현됨) [08] `ERIC_FURNITURE` (캐비닛 1.2 × 0.8 × 2.2m, 서랍형 장롱 1.2 × 0.6 × 1.2m, 확률·내용물 가중치), `furnitureSpot` (가운데 6m 벽면 가운데에 붙인 바닥 사각형 `box`·앞면 방향 `yaw`·벽 변 `dir`), `furnitureCellOf` (가운데 칸 `cells[1]`, 십자형은 가운데 칸에 벽이 없어 벽이 있는 팔 칸 중 무작위), `planEricFurniture(d)` → `{ cabinets: [{ id (= 조각 id), cellKey, dir, x, z, yaw, box }], drawers: [{ …, items: [위, 아래] }] }`. 자체 테스트 "에릭 가구 배치" (6개 층 × 시드 20: 8개 이상·조각 종류·조각마다 1개·벽 변·가운데 칸·칸 안·벽과 겹치지 않음·벽면에 붙음·앞면 방향·칸 중심에서 2m 이상 (통로 5.2m 이상)·비율 1/4 (+ 최소 보충)·1/2·빈 칸 50%·내용물 45/35/20%·결정성).
- [x] 17-3 [11] 그리기·충돌: 캐비닛 (철제 사물함: 상자 + 문 + 가로 틈), 서랍형 장롱 (나무 상자 + 위·아래 서랍 + 손잡이). 공유 도형·재질 (4.6), 충돌 상자를 `view.collision` 에 더한다 (주인공·몬스터 모두 막힘).
  - (구현됨) [11] `getFurnitureAssets()` (공용 재질), `buildFurnitureProps(ctx)` (캐비닛: 몸체·문·눈높이 가로 틈 `CABINET_SLIT_Y` 1.68m·환기구·손잡이 / 서랍형 장롱: 몸체·윗판·위아래 서랍 그룹 (앞판·통·손잡이) — 열면 0.25초에 0.4m 나옴), 충돌 상자 = 바닥 사각형 × 높이. `buildDungeonView` 의 `ctx.furniture`·`ctx.cabinets`·`ctx.drawers`, `ctx.wallFaces(cell)` (가구가 붙은 벽면을 뺀 `cellWallFaces` — 백룸 콘센트·벽돌 횃불·동굴 석순·용암 줄기가 가구와 겹치지 않게. 가구가 없는 마틴 층은 그대로), view 의 `furniture`·`setCabinetHidden`·`openDrawer`·`isDrawerOpen`.
- [x] 17-4 [13] 상호작용 (AGENTS.md "마우스 클릭으로 상호작용"): 16-4 에서 만든 공용 함수 (조준 방향 30°·거리 2.5m 안의 가장 가까운 대상 → HUD 가운데 아래 "클릭: …", 포인터 락 중 왼쪽 클릭) 에 캐비닛·서랍 대상을 더한다 ("클릭: 숨기 / 나오기 / 열기 / 가져가기").
  - (구현됨) [08] `collectInteractables(d, furniture)` — 캐비닛 문 (높이 1.2m)·서랍 칸 (위 0.85m / 아래 0.32m, `DRAWER_SLOT_Y`) 앞면 가운데, `range` 2.5m (`ERIC_INTERACT_RANGE`). [13] `updateInteraction` 이 숨은 동안에는 그 캐비닛을 대상으로, 안내 문구는 `interactLabelKey` (숨기 / 나오기, 열기 / 가져가기 / 비어 있음) → 런타임 `interactLabel`, HUD 가 이것을 쓴다. 문구 `interact.hide/unhide/open/take/empty`.
- [x] 17-5 캐비닛에 숨기 (AGENTS.md, U40): 들어가면 카메라는 캐비닛 안 (문 쪽), 화면은 검은 막 + 작고 얇은 가로 틈, 이동·점프·행동 슬롯 불가, 시점 제한, 피해 없음, 플래시 자동 꺼짐. 다시 클릭 = 캐비닛 앞으로 나옴. 런타임 `g.hiding = { cabinetId }`.
  - (구현됨) [13] `enterCabinet`·`exitCabinet`, 런타임 `hiding = { id, yaw, eyeX, eyeZ, exitX, exitZ }`: 발 위치 = 캐비닛 가운데, 카메라 = 틈 바로 뒤 (`syncCamera`), 이동·점프 없음 (`updatePlayerMovement`), 행동 슬롯 없음, 시점 정면 ±40°·위아래 ±15° (`HIDE_YAW_LIMIT`·`HIDE_PITCH_LIMIT`, `updatePlayerLook`), `playerTargetable` 거짓 (피해 없음), 플래시 꺼짐, 그 캐비닛 메시는 감춤 (안에서 문 안쪽 면이 시야를 막지 않게). 나오면 캐비닛 앞 1.1m. [19] HUD `.ug-hide-mask` (검은 막 + 가운데 720 × 40px 틈, 다른 HUD 아래). `swapFloor` 가 `hiding` 을 비움 (안전장치).
- [x] 17-6 서랍형 장롱 (U40): 칸마다 첫 클릭 = 열림 (서랍이 앞으로 나옴), 열린 칸 클릭 = 아이템을 `addItem` (가득 차면 안내, 비었으면 "비어 있음"). 가져간 칸은 `world.drawersTaken` → 층 기록 (`applyFloorChange`·`makeFloorRecord`·`isValidWorld` 에 추가, 6.9) 에 저장. 자체 테스트: 층 이동·저장 왕복 후 유지, 포탈이 없으므로 초기화되는 경우 없음. **(2026-10-25 사용자 지시: 층 기록의 서랍 기록은 현재 층과 위·아래 1층까지만 보관 — U61, 아래 "2026-10-25 서랍 기록 보관 범위" 작업 기록)**
  - (구현됨, 18-1 의 배터리 데이터를 먼저 만든 뒤) [13] `drawerItem`·`useDrawer` (닫힘 → 열기 / 열림 → `addItem` + `world.drawersTaken` 에 "id:칸" + 획득 토스트, 비었으면 "비어 있음", 가득 차면 `inv.full`). [09] `world.drawersTaken` (`createNewGameState`·`makeFloorRecord`·`applyFloorChange` 의 떠나는 층·들어갈 층, `isValidWorld`·층 기록 검사 `isValidDrawersTaken`, 이전 저장 데이터는 `deserializeState` 가 `[]`). 서랍 열림 상태는 view 에만 (저장 안 함). 자체 테스트 "서랍형 장롱" (열기 → 가져가기 → 비어 있음·층 이동 왕복·저장 왕복·이전 형식·잘못된 값·가득 참).
- [ ] 17-7 (사용자 확인 필요) 에릭 던전에 포탈·상인이 없고 지하 2층부터 성소가 없음, 캐비닛 숨기·나오기 (틈으로 보기), 서랍 열기·아이템 얻기, 다시 왔을 때 가져간 서랍은 빔. — Playwright 자동 확인 (9절 2026-10-25 17·18단계 기록) 통과, 확인 방법은 0절

### 18단계: 에릭 — 플래시·배터리·어둠·화면 차이

목표: AGENTS.md "던전 특징 ("에릭" 플레이 시에만 해당)" 의 플래시·배터리·어둠, "아이템 > "에릭" 전용 아이템", "시스템 메뉴" 의 탭 숨김, "에릭 특별 규칙" 의 레벨업·공격 없음.
- (2026-10-25 AGENTS.md 변경) 플래시 켜고 끄기는 우클릭 → 왼쪽 버튼 (21-2). 배터리는 장롱에서 층마다 4개 이상·여러 개여도 1칸 (22-1·22-2). 야광봉·카드키·빛 바랜 주문서는 22단계.

- [x] 18-1 [05]·[09] 데이터 (U41·U46): 플래시 `{ kind: 'tool', id: 'flashlight' }`, 배터리 = 소모품 `battery` (분류 `battery`). 에너지 `state.player.flashEnergy` (300). 에릭 새 게임 = 레벨 1·장비 없음·인벤토리 플래시 + 배터리 1·행동 슬롯 1번 플래시. `isValidItem`·`isValidPlayer`·`setActionSlot`·`addItem` 이 플래시를 다룬다 (플래시는 `addItem` 으로 새로 얻을 수 없음, 판매·버리기 불가). 에릭은 경험치·레벨업이 없다 (`grantExp` 를 부르지 않음). 자체 테스트.
  - (구현됨) [05] `FLASH_ENERGY_MAX` 300, `TOOLS.flashlight`, `TOOL_DESC`, `CONSUMABLES.battery` (분류 `battery`, 단계 0, `hero: 'eric'`, `CONSUMABLE_DESC`·색). [09] 에릭 새 게임 (장비 없음·플래시 + 배터리 1·행동 슬롯 1번 플래시·`player.flashEnergy` 300), `isValidItem` (`kind: 'tool'`), `isValidPlayer` (행동 슬롯의 도구·`flashEnergy`). [16] `setActionSlot` (도구 가능, 배터리 불가, 에릭은 스킬 불가), `addItem` 은 도구를 받지 않음 (새로 얻을 수 없음), `useConsumable` 이 배터리를 거절 (`item.batteryAuto`), `debugFillInventory` 는 그 주인공의 것만. [07] `grantExp` 는 에릭이면 0. [20] 아이콘 (`ITEM_ICON_DRAW.battery`·`flashlight`), `itemNode`·`itemDisplayName`·`buildItemDetail` (플래시: 에릭 전용 · 도구, 설명, 에너지, "팔거나 버릴 수 없습니다" / 배터리: 단계 대신 에릭 전용, 판매가 없음), 도구 메뉴 `showToolMenu` (행동 슬롯 등록·[버리기] 회색), 배터리 메뉴 ([사용] 회색·등록 없음), 행동 슬롯 칸 (`actionCell`)·드래그. 자체 테스트 "에릭 새 게임·플래시·배터리 데이터". 기존 테스트 "소모품 21종"·"소모품 개수·재사용 대기 키" 는 기대값 21 그대로, 세는 대상에서 에릭 전용 (`hero`) 을 뺐다 (AGENTS.md 의 별도 표 "에릭 전용 아이템").
- [x] 18-2 [16] 플래시 동작 (U41, 순수 함수 `tickFlashlight(state, flash, dt)` + 자체 테스트): 행동 슬롯 우클릭을 누르는 순간 켜기/끄기. 켜진 동안 초당 에너지 1 → 0 이 되면 배터리 1개를 즉시 소모해 300 충전, 배터리가 없으면 즉시 꺼짐. 에너지 0·배터리 0 에서 켜면 0.5초 뒤 다시 꺼짐. 캐비닛에 들어가면 꺼짐 (17-5). 켜짐 상태는 런타임 (불러오면 꺼짐).
  - (구현됨) [16] `newFlashState`·`toggleFlashlight(state, flash)`·`tickFlashlight(state, flash, dt)` (`FLASH_DEAD_ON_TIME` 0.5초), 런타임 `flash = { on, dieT }`. [12] `input.rightClicked` (락 중에 누른 순간). [15] `updatePlayerActions` 가 활성 슬롯이 도구면 누르는 순간에만 켜고 끔 (숨은 동안·빙결·기절 불가), 그 밖은 지금처럼 누르고 있는 동안 사용. 캐비닛에 들어가면 꺼짐. 자체 테스트 "플래시 켜고 끄기·에너지·배터리 자동 교체·0.5초 뒤 꺼짐".
- [x] 18-3 [10]·[11] 어둠 (U42, 2026-10-24 사용자 확정: 플래시 없이 2칸 / 10칸, 플래시 부채꼴 7칸 / 20칸, 범위 밖은 지형도 잘 안 보일 정도로 어둡게): 에릭 층은 테마 조명을 아주 낮추고, 주인공 둘레 점광원 (32m) 과 플래시 `SpotLight` (정면 ±30°, 112m) 로 보이는 범위를 만들고, 안개는 검은색 (U42 의 거리). 지금의 손전등은 에릭에게 쓰지 않는다. PointLight 개수를 바꾸지 않는 규칙 (4-5, 8절 16번) 처럼 SpotLight 도 늘 두고 세기만 바꾼다. `view` 에 `setEricDarkness(flashOn)` 같은 함수 하나로. 테마 5종 × 플래시 켜짐/꺼짐 스크린샷으로 "2칸 밖은 지형이 잘 안 보임" 을 확인한다.
  - (구현됨) [11] `ERIC_DARK` (주변광 + 반구광 합 0.025 — 테마마다 배율을 달리해 같은 어둠 (`vis.ambient + vis.hemi`), 시설 조명·발광 장식도 같은 배율 / 둘레 빛 세기 12·32m / 플래시 SpotLight 세기 120·112m·±30°·반그림자 0.35 / 안개 꺼짐 32 → 160m, 켜짐 112 → 320m), 에릭 층에만 SpotLight 를 늘 두고 세기만 바꾼다, view `ericDark`·`setEricDarkness(on)`·`aimFlash(camera)`. [13] `updateEricDarkness(g)` (켜짐·층이 바뀌면 적용 + `camera.far` = 안개 끝 + 10m, 매 프레임 플래시 방향). 테마 5종 × 꺼짐/켜짐 스크린샷 확인 (처음 값은 백룸이 너무 밝아 주변광을 테마별 배율 → 같은 세기 합으로 바꿈). 밝기는 사용자 확인 (18-5).
- [x] 18-4 [19]·[20] 화면 차이 (AGENTS.md "시스템 메뉴", U46): 시스템 메뉴 탭 = 지도·인벤토리·시스템 (스테이터스·스킬 탭 없음 — `MENU_TABS` 를 주인공별로, 디버그 해시 `&menu=status` 등은 에릭이면 지도로). HUD: HP·MP 막대·레벨·경험치·골드 숨김, 스태미너 막대·플래시 에너지 (막대 + 남은 초)·배터리 개수 표시. 인벤토리 탭: 장착 칸·골드 숨김. 플래시·배터리 아이콘·상세 정보 (설명, "판매·버리기 불가").
  - (구현됨) [20] `menuTabsOf(state)`·`ERIC_MENU_TABS` (에릭 = 지도·인벤토리·시스템, `&menu=status` 등 없는 탭은 지도). [19] HUD `.ug-hud.is-eric`: HP·MP 막대·레벨·경험치·골드 숨김, 플래시 에너지 막대 (켜지면 밝게) + "N / 300" + 배터리 "×N" (`hud.flash`·`hud.battery`), 행동 슬롯의 플래시 칸 ("플래" + 켜지면 ON, 에너지·배터리가 모두 없으면 흐림). 인벤토리 탭 `.ug-inv.is-eric`: 장착 칸·골드 숨김, 소지품·행동 슬롯을 왼쪽으로.
- [ ] 18-5 (사용자 확인 필요) 어둠의 정도, 플래시 켜고 끄기·에너지 소모·배터리 자동 교체·배터리 없을 때 0.5초 뒤 꺼짐, 캐비닛에서 꺼짐, 탭 3개·HUD. — Playwright 자동 확인 통과 (테마 5종 × 켜짐/꺼짐 스크린샷 포함), 확인 방법은 0절

### 19단계: 에릭 — 몬스터 (배회·추적·시야·노이즈)

목표: AGENTS.md "에릭 특별 규칙" 의 몬스터·노이즈와 "몬스터" 단락의 에릭 문구. 마틴의 몬스터 AI (8·10단계, U33) 는 바꾸지 않는다.
- (2026-10-25 AGENTS.md 변경) 발소리 → 의심 모드, 추적 해제 4초 → 8초, 캐비닛 8초면 의심·추적 모두 해제, 노이즈 2단계 거리 문구 변경 (확인 필요) → 23단계.

- [x] 19-1 [14] 생성 (U43): 층마다 그 층 테마의 보스 1~2기, 일반 몬스터·정예·둥지 없음, 위치 = 도착 칸에서 칸 길 거리 8칸 이상. 스냅샷·복원은 지금 규칙 그대로 (현재 층·이전 층 유지, U19) — 스냅샷에 에릭 몬스터 상태 (배회 목표 등) 는 넣지 않고 위치·HP 만.
  - (구현됨, 2026-10-25) [14] `planEricMonsters(d, themeId, floor, arrivalKey, rnd)` (순수: 1·2기 각 50%, 그 테마 보스, 레벨 = 층, 도착 칸에서 칸 길 거리 8칸 이상 (`cellBfs`) 의 생성 가능 칸 가운데, 서로 다른 칸), `setupEricMonster(m)` (`m.eric = true`, 충돌 반지름 상한 1.5m — 보스 몸은 크지만 6m 통로를 지나가도록, 보스 공터 없음), `spawnEricMonsters(g)`, `spawnFloorMonsters` 가 에릭이면 이것만 (일반 몬스터·정예·둥지·보스 없음). [08] 에릭 던전의 엘리베이터 내부 칸에 `ericBarred` → `monsterBarred` 가 막음. 스냅샷은 `eric: true` 만 더함 (위치·HP, 배회 목표·추적은 저장 안 함), `restoreFloorRuntime` 이 `setupEricMonster` (보스 공터·처치 기록과 상관없음). `spawnDebugMonster` 는 에릭 게임이면 에릭 모드 (`&hero=eric&monster=br_boss`). 자체 테스트 "에릭 몬스터 생성 계획".
- [x] 19-2 [14] 행동 (U43): 층 전체 느린 배회 (무작위 칸 → 길찾기 `cellBfs`/`findCellPath`) → 발견 → 추적 (주인공의 현재 달리기 속도) → 4초 동안 안 보이면 해제 → 그 자리에서 다시 배회. 엘리베이터 내부 (1칸)·성소 구역은 길찾기·이동에서 제외. 근접 공격만 (보스 패턴 없음) — **명중하면 한 방에 사망** (2026-10-24 사용자 확정, 방어·저항 무시, U43). 예비 동작 0.5초 동안 피할 수 있다. 캐비닛 안 주인공은 보지도 공격하지도 않음. 처치할 수 없으므로 시체·드롭·경험치 없음. 런타임 몬스터에 `ericMode` (또는 행동 함수를 `MONSTER_BEHAVIORS` 와 따로 `ERIC_MONSTER_AI`).
  - (구현됨) [14] `ERIC_MONSTER` (배회 2.5 m/s, 4초, 사거리 몸 반지름 + 1.5m, 예비 동작 0.5초, 공격 뒤 1.2초, 그리는 거리 330m, 막힘 5초), `updateEricMonster` (`updateMonsters` 가 `m.eric` 이면 이것만 — 상태이상·보스 패턴·HP 막대·`bossFight` 없음): 시야 0.1초마다 → 발견하면 `chase` (속도 = `g.derived.runSpeed`, 안 보이면 마지막으로 본 자리로 — 주인공 위치를 몰래 알지 않음), 4초 동안 안 보이면 `idle` (그 자리에서 다시 배회), 사거리 안이면 예비 동작 → `resolveEricAttack` (그때도 사거리 안·노릴 수 있으면 `damagePlayer(g, HP 전부)` = 한 방에 사망, 아니면 빗나감). `ericMoveTo` (칸 길찾기, 1초마다 다시 찾음), `ericWander` (층 전체의 생성 가능 칸 중 무작위 → 도착·막힘이면 다음). `playerTargetable` 에 에릭의 엘리베이터 내부 (`g.inElevator`) 추가 (캐비닛·성소는 그 전부터). `damageMonster` 는 에릭의 몬스터를 무시 (처치 불가). 시체·드롭·경험치 없음 (처치되지 않으므로). `findCellPath` 의 시작점이 칸 밖이면 null (확인 중 찾은 안전장치). 자체 테스트 "에릭 몬스터 행동" (가짜 런타임: 120초 배회 6칸 이상·들어갈 수 없는 칸 0, 정면 발견 → 추적 속도, HP 99999 여도 한 방, 예비 동작 중 숨으면 빗나감·4초 뒤 해제, 엘리베이터 안은 발견 안 함, 등 뒤는 못 보지만 플래시로 비추면 발견).
- [x] 19-3 [14] 시야 (U44, 순수 함수 `ericMonsterSees(...)` + 자체 테스트): 시야각·거리·벽, 플래시 불빛 (불빛이 보임 / 불빛에 비침), 캐비닛 안이면 항상 못 봄.
  - (구현됨) [14] `ERIC_SIGHT` (120° · 32m / 플래시 320m · ±30°), 순수 함수 `ericMonsterSees(m, p, los)` (캐비닛 안이면 항상 false → 정면 120°·2칸 → 플래시가 켜져 있으면 정면 120°·20칸 (불빛이 보임) 또는 몬스터가 플래시 부채꼴 ±30°·20칸 안 (불빛에 비침), 벽은 `los()` 를 필요할 때만 부름). 자체 테스트 "에릭 몬스터 시야" (경계값 31/33m·59.5/61°·320m·29/31°·벽·캐비닛).
- [x] 19-4 [19] 노이즈 3단계 (U45): 10칸 / 5칸 / 추적 중. 화면 전체 흑백 노이즈, 3단계에서도 잘 보이게 불투명도 상한. 심장 두근거림 소리는 사운드 구현 때 (20-8).
  - (구현됨) [14] 순수 함수 `ericNoiseLevel(가장 가까운 거리, 추적 중)` (`ERIC_NOISE`: 10칸 / 5칸 / 추적 중, 불투명도 0.06 / 0.12 / 0.2). [19] HUD `canvas.ug-noise` (320×180 흑백 무작위를 늘려 그림, 매 프레임, 일시정지 중에는 멈춤) + 3단계에서 `.ug-noise-vignette` (가장자리 어둡게), `updateHudNoise`. 다른 HUD 아래·캐비닛 막 위. 심장 두근거림 소리는 사운드 구현 때 (20-8). 자체 테스트 "에릭 노이즈 단계". 함께 고친 것: 에릭 어둠에서 왜곡된 차원의 하늘 (별·성운) 을 감춘다 (`ctx.sky`) — 플래시를 켜면 안개 끝 (320m) 이 멀어져 성운이 보랏빛으로 드러나 꺼짐 상태 (검은 하늘) 와 달랐다.
- [ ] 19-5 (사용자 확인 필요) 배회·발견·추적 속도·4초 뒤 해제, 캐비닛에 숨으면 그냥 지나감, 엘리베이터로 도망 (안에서 저장), 노이즈 3단계, 잡히면 한 방에 사망 → 마지막 저장에서 다시 시작. — Playwright 자동 확인 통과 (9절 2026-10-25 19단계 기록), 확인 방법은 0절

### 21단계: 조작 변경 (마틴·에릭 공통)

목표: 2026-10-25 AGENTS.md "조작" — "대상에 정면 시야를 둔 채 F키로 상호작용", "마우스 왼쪽 버튼 클릭으로 행동 슬롯 중 활성화된 슬롯 사용 (계속 누르고 있으면 계속 사용)", "아이템 > 공통 규칙" 의 "마우스 왼쪽 버튼으로 사용" (U58). 지금 코드 (16-4·15-2·17-4 의 왼쪽 클릭 상호작용, 8-8·12-8·14-0·18-2 의 오른쪽 버튼 행동 슬롯) 를 바꾼다.

- [x] 21-1 [12]·[13] 상호작용 = F 키: `updateInteraction` 이 `input.leftClicked` 대신 `input.pressed.has('KeyF')` (포인터 락 중, 반복 입력 무시). 엘리베이터 버튼 판·상인·캐비닛 (숨기·나오기)·서랍·(22단계의 카드 리더기) 모두. HUD 안내의 키 글자 `interact.click` → "F" (한국어·영어). 조준 판정 (거리·30°) 은 그대로.
  - (구현됨, 2026-10-25) [13] `INTERACT_KEY` = 'KeyF', `updateInteraction` 이 `input.pressed` (keydown 의 `e.repeat` 는 넣지 않음 → 누르고 있어도 한 번). 문구 키 `interact.click` → `interact.key` ("F"). 주석의 "클릭" 안내도 F 로.
- [x] 21-2 [12]·[15] 행동 슬롯 = 왼쪽 버튼: 입력에 `mouseLeft` (누르고 있는 중, 락 중에 누른 것만) 를 두고 `updatePlayerActions` 가 오른쪽 대신 왼쪽으로 (누르고 있으면 계속 사용), 플래시 토글은 왼쪽 버튼을 누르는 순간 (`leftClicked`). 오른쪽 버튼은 게임 중 아무 일도 하지 않음 (브라우저 메뉴 막기는 그대로). "클릭하여 계속" 을 누른 클릭이 공격으로 나가지 않는지 (8절 38번).
  - (구현됨) [12] `input.mouseLeft` (락 중에 누른 왼쪽 버튼만, 떼거나 락이 풀리거나 창이 포커스를 잃으면 false) + `leftClicked` (누른 순간). `mouseRight`·`rightClicked` 삭제 (오른쪽 버튼은 `contextmenu` 막기만). [15] `updatePlayerActions`: 플래시 = `leftClicked`, 그 밖 = `mouseLeft || leftClicked` (프레임 사이에 눌렀다 뗀 아주 짧은 클릭도 한 번은 시도 — 확인 중 찾음).
- [x] 21-3 [03]·[20] 화면 문구·안내 점검: 게임 중 조작을 설명하는 문구가 있으면 바꾼다. 메뉴·인벤토리·상점·스킬 탭 안의 "우클릭 / 길게 누르기: 상세 정보" 는 그대로 (AGENTS.md "시스템 메뉴" 문구가 그대로).
  - (구현됨) "클릭하여 계속" 아래 조작 안내를 2줄로: `game.controlsHint` (이동·점프·달리기·시점·메뉴) + 새 `game.controlsHint2` ("마우스 왼쪽 버튼 행동 슬롯 사용 · 1~7 / 휠 행동 슬롯 선택 · F 상호작용", 영어도). 그 밖에 게임 중 조작을 설명하는 문구는 없었다.
- [x] 21-4 자체 테스트 (바뀌는 순수 부분이 있으면) + 브라우저 자동 확인: F 로 엘리베이터·상점·캐비닛·서랍, 왼쪽 버튼으로 기본 공격 (누르고 있으면 연속)·소모품·스킬·플래시 (누르는 순간만), 오른쪽 버튼은 아무 일 없음. 앞 단계 확인 스크립트들 (15·16-9·17·18·19) 의 클릭을 F·왼쪽 버튼으로 바꿔 다시 통과. 0절 사용자 확인 방법의 "클릭"·"우클릭" 문구도 고친다.
  - (확인됨) 바뀐 순수 함수 없음 (selftest 86 그대로 통과). Playwright `verify21.mjs` 21건 + 앞 단계 스크립트를 F·왼쪽 버튼으로 바꿔 `verify169` 7·`verify15` 39·`verify1718` 29·`verify19` 16건 통과 (9절). 0절 문구 수정.
- [ ] 21-5 (사용자 확인 필요) 조작감 (F 상호작용, 왼쪽 버튼 공격·사용).

### 22단계: 에릭 — 장롱 확장·배터리·야광봉·카드키·빛 바랜 주문서

목표: 2026-10-25 AGENTS.md "던전 특징 (에릭)" 의 추가·변경 (U52 ~ U56). 17·18단계에서 만든 가구·아이템 위에 더한다.

- [x] 22-1 [08] 장롱 배치·내용물 (U52): `planEricFurniture` — 장롱 = ㅏ형·십자형 1/2 + 일자형·ㄱ자형 1/4 (캐비닛과 같은 조각이면 다른 벽 변), 층마다 16개 이상, 내용물 새 표 + 보장 (배터리 4개 이상, 카드키 정확히 1개). 자체 테스트 "에릭 가구 배치" 의 기대값을 새 규칙으로 바꾼다 (근거: 2026-10-25 AGENTS.md, 9절에 기록) — 장롱 조각 종류·16개 이상·배터리 ≥ 4·카드키 = 1·같은 칸 벽 변 겹침 없음.
  - (구현됨, 2026-10-25) [08] `ERIC_FURNITURE.drawer` = 조각 종류별 확률 `chance` (ㅏ·십자 0.5, 일자·ㄱ자 0.25)·`min` 16·새 내용물 표·`minBattery` 4·`batteryFallback`. `planEricFurniture`: 조각마다 캐비닛·장롱을 따로 굴림 → 최소 개수 보충 (캐비닛 8·장롱 16) → 조각 id 순서로 놓기 (`furnitureCellOf(d, piece, rng, used)` 가 이미 가구가 붙은 "칸|벽 변" 을 피함 — 일자형은 마주 보는 양쪽 벽, 통로 4.6m) → 칸마다 내용물 → 보장 (카드키: 무작위 빈칸 1곳, 배터리 4개 이상: 빈칸 → 활력 물약·탐색 주문서 칸). 확인 결과 작은 층 (지하 1~30층) 은 기대값 9~12개라 거의 항상 16개로 보충된다. 자체 테스트 "에릭 가구 배치" 기대값 변경 (9절).
- [x] 22-2 [05]·[16]·[20] 데이터 (U53): `CONSUMABLES.glowstick`·`keycard`·`fadedScroll` (`hero: 'eric'`, 단계 0) + 설명·색·아이콘 (야광봉·카드키·빛 바랜 두루마리). 겹치기: 배터리·야광봉·빛 바랜 주문서는 1칸 개수 제한 없음 (`addItem`·`consumableRoom`·`isValidItem` 의 20개 상한을 아이템별로), 카드키 1개만·버리기 불가. 행동 슬롯 등록 가능 = 야광봉·빛 바랜 주문서. 자체 테스트.
  - (구현됨) [05] `CONSUMABLES.glowstick`·`keycard`·`fadedScroll` (+ 배터리) 에 `stack` (1칸 최대 개수, `ERIC_STACK_MAX` 999 = 사실상 제한 없음 / 카드키 1)·`unique` (카드키)·`noDiscard` (카드키)·`useReason` (직접 못 씀: 배터리 `item.batteryAuto`·카드키 `item.keycardUse`)·`short` (빛 바랜 주문서 HUD 약자 "바랜"), `stackMaxOf(id)`, 설명·색. [16] `addItem`·`moveInventoryItem`·`consumableRoom`·`isValidItem` 이 `stackMaxOf`, 카드키는 이미 있으면 `addItem` 실패 → 서랍에서 "카드키는 하나만 가질 수 있습니다" (칸은 그대로), `discardItemAt` (카드키 불가), `setActionSlot`·`useConsumable` 은 `useReason` 으로. [20] 아이콘 3종 (발광 막대·카드·바랜 두루마리), 소모품 메뉴 ([사용]·[버리기] 회색 + 이유), 상세 정보 (카드키 "팔거나 버릴 수 없습니다"), HUD 행동 슬롯 색. 디버그 `&items=1` 은 에릭에게 카드키 1·나머지 5개. 자체 테스트 "에릭 전용 아이템 겹치기·버리기·등록".
- [x] 22-3 [11]·[13]·[16]·[09] 야광봉 (U54): 사용 → `world.glowsticks` 에 추가·발밑에 활성 야광봉 (발광, 안개 무시, 멀리서도 보임), 에릭 층의 야광봉 조명 4개 (가까운 순서로 배정, 개수 고정), 층 기록 `glowsticks` (현재 층과 2층 이상 떨어지면 지움, `applyFloorChange`·`isValidWorld`·`makeFloorRecord`), 몬스터 시야와 무관. 자체 테스트 (유지 규칙·저장 왕복).
  - (구현됨) [05] `GLOWSTICK` (앞 0.6m·조명 4개·32m·세기 10·최대 64·2층·카메라 far 1200m). [16] `dropGlowstick` (소모품 처리 `CONSUMABLE_HANDLERS.glowstick`, 던전 밖·벽 안이면 발밑, 재사용 대기 1초). [09] `world.glowsticks` (새 게임·`makeFloorRecord`·`applyFloorChange` 의 떠나는 층·들어갈 층, 이동 뒤 현재 층과 2층 이상 떨어진 기록은 비움), `isValidGlowsticks`, 이전 저장 데이터 `[]`. [11] 에릭 층 view 의 야광봉 조명 4개 (가까운 순서 배정)·`setGlowsticks`·`glowstickCount`, `makeGlowstickObject` (막대·마개 = 빛을 받지 않고 안개도 받지 않는 재질, 빛점 = 화면 크기 일정한 Sprite (`sizeAttenuation: false`, 가산 혼합) — 멀수록 실제 크기가 커져 아래 절반이 바닥에 가려지므로 거리 × 0.006m 띄움). [13] 야광봉이 있는 층은 카메라 far 1200m (`updateEricDarkness`). 몬스터 시야 (`ericMonsterSees`) 는 그대로 (야광봉 빛과 무관). 자체 테스트 "야광봉".
- [x] 22-4 [08]·[11]·[13]·[09] 카드키·내려가는 엘리베이터 잠금 (U55): 잠긴 아래층 엘리베이터 (문 닫힘 + 충돌, 표시등 꺼짐), 문 오른쪽 카드 리더기 (상호작용 대상, 카드키 소모 → 활성화), `world.elevatorUnlocked` + 층 기록, 올라와서 도착한 층은 활성. 마틴은 그대로. 자체 테스트 (카드키 없으면 그대로·있으면 소모·층 이동 뒤 유지).
  - (구현됨) [08] `CARD_READER_Y` 1.2·`CARD_READER_Z` 1.0, `collectInteractables` 가 에릭 층의 아래층 엘리베이터에 `cardReader` (문 바깥 1m, 안쪽을 볼 때 오른쪽 벽면, 2.5m·30°, "카드 찍기"). [11] `buildElevatorProps`: 리더기 (몸체·카드 홈·불 — 빛을 받지 않는 붉은/초록 재질), 잠금 상태 `state.setLocked` (문이 열리지 않음·문 자리 충돌 상자를 앞 복도 칸 목록에 넣고 뺌·▼ 표시등 꺼짐 재질 `downOff`·불 색), view `setElevatorLocked`·`isElevatorLocked`. [13] `isElevatorLockedFor(state)`, `useCardReader` (카드키 없으면 아무 일도 없음, 있으면 1개 소모 → 활성 + 토스트 "엘리베이터가 활성화되었습니다"), 활성화된 리더기는 조준 대상에서 뺌, 잠긴 엘리베이터 버튼 판은 무시 (안전장치), 층을 만들 때 잠금 적용. [09] `world.elevatorUnlocked` + 층 기록 (`applyFloorChange`: 올라와 도착한 층은 활성, 필드가 없는 이전 형식 기록·저장 데이터는 활성 — 갇히지 않게). 자체 테스트 "카드키·아래층 엘리베이터 잠금".
- [x] 22-5 [16]·[14] 빛 바랜 주문서 (U56): 무적 → 어두워짐 → 순간이동 → 밝아짐 → 무적 끝, 도착 위치 (직선 10칸 이상) 순수 함수, 사용 즉시 몬스터 추적·의심 해제, 도착 5칸 안의 몬스터 옮기기. 자체 테스트 (도착 위치 거리·몬스터 옮기기).
  - (구현됨) [16] `FADED_WARP` (0.4초·160m·80m), 순수 함수 `pickWarpDestination(d, from, minDist, rnd)` (생성 가능 칸 가운데 중 10칸 이상 무작위, 없으면 가장 먼 칸), `startFadedWarp` (무적 0.8초·에릭 몬스터 `calmEricMonster`), `updateFadedWarp` (0.4초에 순간이동 + 도착 5칸 안 몬스터를 도착 위치에서 10칸 이상 떨어진 칸으로), `fadedWarpFade` (게임 화면의 검은 막 `.ug-fade`). 런타임 `g.warp` 동안 `playerTargetable` 거짓 (어두운 동안 다시 발견되지 않게). [14] `calmEricMonster` (추적·예비 동작·마지막으로 본 자리 해제 → 배회). 자체 테스트 "빛 바랜 주문서".
- [x] 22-6 브라우저 자동 확인 + 스크린샷 (야광봉 빛·멀리서 보임, 카드 리더기·잠긴 문, 빛 바랜 주문서 연출, 새 아이콘).
  - (확인됨) Playwright `verify22.mjs` 25건 통과 (9절), 스크린샷 직접 확인.
- [ ] 22-7 (사용자 확인 필요) 장롱이 충분히 많은지·내용물 확률, 야광봉 밝기·유지, 카드키로 엘리베이터 열기, 빛 바랜 주문서.

### 23단계: 에릭 — 몬스터 의심 모드·추적 해제 8초·노이즈 기준

목표: 2026-10-25 AGENTS.md "에릭 특별 규칙" 의 변경 (U57, U45). 19단계의 `updateEricMonster` 를 고친다.

- [x] 23-1 [14] 발소리 (U57): 순수 함수 (예: `footstepRange(moving, running, hiding)` → 걷기 80m / 달리기 320m / 0) + 0.5초마다 범위 안 몬스터에게 "가장 최신 소리 위치" 전달. 자체 테스트.
  - (구현됨, 2026-10-25) [14] `ERIC_FOOTSTEP` (80m·320m·0.5초), 순수 함수 `footstepRange(moving, running, hiding)`, `updateEricSenses(g, dt)` (에릭 게임의 `updateGame` 에서 `updateMonsters` 앞: 캐비닛 시간 + 0.5초마다 발소리, 빛 바랜 주문서 순간이동 중에는 소리 없음), `hearFootstep(m, x, z)` (추적 중이면 무시, 아니면 의심 모드 + 소리 위치 갱신). "움직이는 중" = 이동 키를 누르고 있는 중 (`player.moving`, 벽에 막혀 있어도 소리).
- [x] 23-2 [14] 의심 모드: 상태 `suspect` — 소리 위치로 배회 속도 이동, 도착·막힘이면 해제, 도중 발견하면 추적. 스냅샷에는 넣지 않음 (불러오면 배회). 노이즈 3단계는 추적만.
  - (구현됨) [14] `updateEricMonster` 의 `suspect`: 소리 위치까지 `ericMoveTo` (배회 속도 2.5 m/s, 칸 길찾기), 1.5m (`arriveDist`) 안에 오거나 5초 동안 1m 도 못 가면 (`ericStuckTime` — 배회와 같은 판정으로 묶음) `calmEricMonster` → 배회. 발견하면 추적 (소리 위치는 잊음). 노이즈 3단계는 그대로 `chase` 만.
- [x] 23-3 [14] 추적 해제 4초 → 8초 (`ERIC_MONSTER.lostTime`), 캐비닛 안에서 8초가 지나면 모든 몬스터의 의심·추적 해제. 자체 테스트 "에릭 몬스터 행동" 의 4초 기대값을 8초로 (근거: 2026-10-25 AGENTS.md, 9절에 기록) + 의심 모드 테스트 (걷기 5칸 밖은 못 들음·달리면 20칸까지·도착하면 배회·도중 발견하면 추적·숨은 채 8초면 해제).
  - (구현됨) `ERIC_MONSTER.lostTime` 8, `hideCalmTime` 8 (`updateEricSenses` 가 숨은 시간을 재서 8초가 되는 순간 모든 에릭 몬스터 `calmEricMonster`). 자체 테스트 "에릭 몬스터 행동" 의 4초 → 8초 (9절), 새 테스트 "에릭 발소리·의심 모드·캐비닛 8초".
- [x] 23-4 [14]·[19] 노이즈 거리 기준 (U45): **사용자 확인 뒤** `ERIC_NOISE` 를 고친다 (AGENTS.md 의 1단계·2단계가 모두 "주위 10칸"). 자체 테스트 "에릭 노이즈 단계" 의 기대값도 그에 맞게.
  - (구현됨, 2026-10-25) 사용자가 AGENTS.md 의 1단계를 "주위 20칸" 으로 고침 → [14] `ERIC_NOISE` = 1단계 20칸 (320m) / 2단계 10칸 (160m) / 3단계 추적 중 (불투명도 그대로). 자체 테스트 "에릭 노이즈 단계" 기대값 변경 (근거: 2026-10-25 AGENTS.md, 9절), Playwright `verify19.mjs` 의 노이즈 확인 거리를 240m (1단계)·120m (2단계) 로 바꿔 통과.
- [ ] 23-5 (사용자 확인 필요) 걷기·달리기 발소리로 몬스터가 다가오는지, 8초 해제, 캐비닛에 8초 숨으면 지나감, 노이즈 단계.

### 20단계: 마무리

- [x] 20-1 번역 누락 검사: 자체 테스트에 "`I18N.ko` 의 모든 키가 `I18N.en` 에 있고, 그 반대도 성립" 을 추가 (`I18N` 을 `__TEST__` 에). 영어·한국어 스크린샷에서 키 이름 (`menu.start` 같은 글자) 이 그대로 보이는 곳이 없는지 확인.
  - (구현됨, 2026-10-25) 자체 테스트 "번역 누락 검사" (`I18N` 은 이미 내보내져 있었다): 한국어·영어 키가 서로 같음 (299개씩)·빈 문자열은 접미어가 없는 3곳만·`{자리표시자}` 가 두 언어에서 같음·소스의 `t('…')` 와 `labelKey`·`reason` 등 문자열 키가 모두 번역표에 있음·동적 키 (`hud.`·`menu.tab.`·`res.`·`stat.`·`equipSlot.`·`affix.`·`itemType.`·`itemCat.`·`consTier.`·`item.hands.`·`skill.branch/type/legend.`·`shop.tab/greeting`) 의 정의역 (스킬·장비·소모품·옵션 표의 모든 값) 이 번역표에 있음·모든 데이터의 `nameKo`/`nameEn`·설명 쌍이 비어 있지 않음. 키를 하나씩 지운 변이 3건·자리표시자 변이 1건 모두 실패로 잡힘. 브라우저 확인 (verify20 B): 화면 16종 × 한국어·영어에서 번역 키 모양·`undefined`·`NaN` 이 그대로 보이는 글자 0 (글자 1372개 검사), 콘솔 "[i18n] 키 없음" 경고 0. 영어 화면 스크린샷 확인 (글자 넘침 없음).
- [x] 20-2 그래픽 품질 "낮음" 일 때 캔버스 내부 해상도가 1280×720 인지 확인 (`app.renderer.getSize(new THREE.Vector2())`).
  - (확인됨) `applyGraphicsQuality`: 낮음 = 캔버스 내부 1280×720·보통 = 1920×1080 (`renderer.getSize`·캔버스 width / height), 창이 1600×900 이어도 낮음은 1280×720 (픽셀 비율 1). 설정 [저장] 을 누르면 바로 적용, [취소] 는 버림 (verify20).
- [x] 20-3 성능: `&fps=1` 로 FPS·`renderer.info.render.calls` 표시. 목표는 보통 품질에서 큰 층 (몬스터 150마리 + 둥지) 도 60fps 근처. 느리면: 주인공에서 60m 넘게 떨어진 몬스터는 숨기고 0.25초마다만 갱신, 투사체 수 제한, 같은 모양은 geometry·material 공유, 시체 수 줄이기. void 테마는 벽이 낮아 멀리까지 보이므로 따로 확인.
  - (구현됨·측정함) `&fps=1` ([21] `updateFpsOverlay`, 3.5): 오른쪽 위에 FPS·갱신 시간·그리기 시간·draw call·삼각형·몬스터 수. 지하 400층 (512칸·몬스터 178~183마리) 에서 테마 5종·정상 플레이 위치: 갱신 0.4~0.7ms / 프레임, 그리기 CPU 0.4~0.6ms, draw call 15~122, 삼각형 4.6만~33.7만 (벽돌벽이 가장 큼). 최악 (180마리를 모두 주인공 근처 40칸에 모아 추적시킴): 순수 갱신 0.6~0.7ms (실제 루프 평균 1.6~2.0ms), 그리기 CPU 2.0~2.7ms, draw call 803~1051, 삼각형 12.8만~43.7만 → 프레임 예산 16.7ms 의 약 1/4. 계획서의 최적화 (멀리 있는 몬스터 갱신 줄이기 등) 는 8단계에서 이미 들어 있고 (`MONSTER_ACTIVE_DIST`·`FAR_WANDER_STEP`, 먼 대기 몬스터는 띄엄띄엄 배회만) 더 필요하지 않아 적용하지 않았다. **한계**: 이 PC 의 헤드리스 검증은 CPU 렌더링 (SwiftShader) 이라 GPU 시간·실제 FPS (8~10fps 로 나옴) 는 알 수 없다 → 실제 FPS 는 사용자 PC 에서 `&fps=1` 로 확인 (20-9).
- [x] 20-4 저장 데이터 크기 확인: 층 기록 1000층 (7-8 의 방문 칸 압축 적용, 현재 층·이전 층 몬스터 스냅샷 포함) 을 채운 상태의 JSON 길이를 콘솔에 출력 (목표: 슬롯당 1MB 이하). 넘으면 사용자에게 보고.
  - (측정함·해소) 자체 테스트 "저장 데이터 크기" (5절 U60): 마틴 1000층 (모든 층 512칸 전부 방문) 약 789KB — 목표 안. 에릭은 서랍 32칸을 1000층 내내 모두 비우는 극단에서 처음 측정값이 약 1.02MB (서랍 기록 257KB) 로 목표를 약간 넘었다 → 사용자 지시로 서랍 기록을 현재 층과 위·아래 1층까지만 보관하게 바꿔 (U61) **약 765KB (목표 안)**.
- [ ] 20-5 3인칭 (U4 가 확정되면): 카메라를 주인공 뒤 4m · 위 1.5m 에 두고, 벽에 가리면 앞으로 당긴다. 주인공 모델 (AGENTS.md: 남성, 트레이닝복 차림을 도형으로) 표시.
  - (보류, 2026-10-25) **사용자 답: "특정 스킬을 사용하면 그 스킬의 유효시간 동안 3인칭으로 전환" — 아직 구현하지 않고 보류** (어떤 스킬인지·카메라 세부 미정, 5절 U4). AGENTS.md 에는 "1인칭 (조건부 3인칭)" 이라고만 있고 이 조건은 아직 적혀 있지 않다 (AGENTS.md 는 사용자가 관리하므로 고치지 않음). 그 스킬이 정해지면 구현한다.
- [x] 20-6 (선택) 새 게임 시작 시 AGENTS.md "스토리" 두 문장을 검은 화면에 차례로 페이드 표시한 뒤 시작 (클릭하면 건너뛰기).
  - (구현됨, 2026-10-25) [18] `SCREENS.intro` (검은 화면에 세 줄 페이드, 클릭·Space·Enter·ESC 로 건너뜀)·순수 함수 `introFrame(elapsed)`·`startNewGame` 이 이야기 장면 → 게임 시작·저장 순서로. 문구·길이는 5절 U59. 자체 테스트 "새 게임 이야기 장면". verify20 A: 새 게임 → 첫 줄 → 둘째 줄 (맨홀) → 클릭 / Space 로 건너뛰면 게임 시작·저장 (이야기 동안엔 저장 안 함). 스크린샷 확인.
- [x] 20-7 **AGENTS.md 요구사항 최종 점검** — 하나씩 확인하고 결과를 9절에 기록한다.
  - [x] 접속 시 타이틀 + "계속하려면 클릭하세요", 아무 곳 클릭 → 메인 메뉴
    - 확인: verify20 A (타이틀 문구·아무 곳 클릭 → 메인 메뉴)
  - [x] 메인 메뉴: 게임 시작 / 설정
    - 확인: verify20 A (버튼 2개: 게임 시작 / 설정)
  - [x] 슬롯 4개 (localStorage, JSON), 빈 슬롯 확인 문구 + 주인공 선택 (마틴 / 에릭, 기본 마틴), 데이터 슬롯 이어하기 / 삭제 / 취소, 삭제 2차 확인
    - 확인: verify20 A (슬롯 4개·빈 슬롯 문구·주인공 선택 기본 마틴·이어하기 / 삭제 / 취소·삭제 2차 확인·게임 시작 시 JSON 저장)
  - [x] 설정: 언어 ko/en, 그래픽 품질 낮음 1280×720 / 보통 1920×1080, 하단 저장·취소, 저장해야 적용, localStorage 저장
    - 확인: verify20 A·C (언어·품질 선택지·하단 저장 / 취소·저장해야 적용·localStorage JSON, 낮음 1280×720 (창이 1600×900 이어도)·보통 1920×1080)
  - [x] 던전 블록 수 `min(512, 127 + 층)`, 칸 16×16m · 높이 10m, "지하 N층" 표기
    - 확인: selftest "던전 생성 - 구조 검사" (층 1·2·5·10·50·200·385·400 × 시드 25 에서 칸 수가 정확히 min(512, 127 + 층)) + `CELL_SIZE` 16·`CELL_HEIGHT` 10. 표기: 슬롯 요약은 "지하 1층", HUD·지도·층 이동 토스트는 "지하 층" 라벨 + 큰 숫자 "B3" (숫자를 별도 행·글꼴로 분리하는 규칙에 따른 표기 — "지하 3층" 꼴로 바꿀지는 사용자 판단)
  - [x] 복도 종류 (일자 2, ㄱ자 4, 십자 1, ㅏ자 4) 와 칸 수 (개수 제한 없음), 위·아래 엘리베이터 각 1개 (조각 3칸 = 통로 2칸 + 엘리베이터 1칸, 지하 1층은 위 엘리베이터 없음), 포탈 1개·상점 1개 (1×1, 입구 한 방향, 주변 3칸에 몬스터가 들어오지 않음) 는 마틴만, 공터, 성소 1~4개 (서로 20칸 이상, 에릭은 지하 1층에 1곳만), 모든 칸 도달 가능
    - 확인: selftest "던전 생성 - 구조 검사" (조각 칸 수·위 엘리베이터 1 (지하 1층은 0)·아래 1·마틴 포탈 1·상점 1·성소 1~4 (서로 20칸 이상)·에릭 규칙·모든 칸 도달 가능) + 조사: 시드 12 × 층 5종에서 복도 모양 11가지 (일자 2·ㄱ자 4·ㅏ자 4·십자 1) 가 모두 생성됨
  - [x] 내려온 직후 위층 엘리베이터 앞 통로에서 시작 / 지하 1층 새 게임은 성소 구역에서 시작 (마틴·에릭)
    - 확인: selftest "도착 방식별 시작 위치"·"지하 1층 새 게임 시작 위치는 성소 영역", verify16·verify20 (새 게임이 성소에서 시작)
  - [x] 위층으로 가면 평균 레벨 −1, 아래층 +1 (마틴), 포탈은 유지
    - 확인: selftest "몬스터 배치 계획" (레벨 = 층 ± 1)·"층 이동 기록" (엘리베이터는 층 ± 1, 포탈은 같은 층·모든 기록 초기화)
  - [x] 에릭 던전 특징: 캐비닛 (일자형·ㄱ자형 1/4, 층마다 8개 이상, 숨기·나오기, 틈으로 보기, 공격받지 않음, 들어가면 플래시 꺼짐), 서랍형 장롱 (ㅏ형·십자형 1/2 + 일자형·ㄱ자형 1/4, 층마다 16개 이상, 수직 2칸, 열기·가져가기), 플래시 (시작 시 보유·행동 슬롯에 장착된 채, 토글, 300초, 배터리 자동 소모, 배터리 없으면 꺼짐·다시 켜면 0.5초 뒤 꺼짐, 신규 획득·판매·삭제 불가)·배터리 (시작 1개, 장롱에서 낮은 확률·층마다 4개 이상, 여러 개여도 1칸), 야광봉 (장롱, 1칸, 사용하면 발밑에 활성화·주울 수 없음·주위 2칸 밝힘·2층 이상 멀어질 때까지 유지·멀리서도 (가리지 않으면) 보임·몬스터는 못 봄), 카드키 (장롱에서 매우 낮은 확률·층마다 정확히 1개, 1개만) + 내려가는 엘리베이터 잠금 (오른쪽 카드 리더, 카드키 소모로 활성화), 빛 바랜 주문서 (장롱에서 매우 낮은 확률, 1칸, 잠시 무적·같은 층 10칸 이상 떨어진 곳으로 순간이동·추적 해제·도착 5칸 안 몬스터 옮김), 어둠 (2칸 / 10칸, 플래시 부채꼴 7칸 / 20칸, 범위 밖은 지형도 잘 안 보일 정도로 어두움)
    - 확인: selftest (에릭 가구 배치·가구 상호작용·캐비닛·서랍형 장롱·플래시·배터리·야광봉·카드키·빛 바랜 주문서·어둠 값) + verify17·18·22
  - [x] 에릭 특별 규칙: 레벨업·공격 수단 없음, 몬스터는 보스급 1~2기 (공격 한 방에 사망, 층 전체를 느리게 배회, 발소리 (걷기 5칸 / 달리기 20칸) 를 들으면 가장 최신 소리 위치로 배회 속도로 다가감 (의심 모드, 도착하거나 추적이 되면 해제), 발견하면 주인공 달리기 속도로 추적, 8초 안 보이면 해제, 캐비닛 안을 못 봄 (8초 숨으면 의심·추적 모두 해제), 엘리베이터에 못 들어옴, 플래시 불빛도 발견, 야광봉 불빛은 못 봄), 노이즈 3단계 (20칸 / 10칸 / 추적 중, 3단계도 잘 보임), 스테이터스·스킬 탭 없음
    - 확인: selftest (에릭 새 게임·몬스터 생성 / 시야 / 행동 / 노이즈 20칸·10칸 / 발소리·의심 모드·캐비닛 8초) + verify19·23
  - [x] 성소: 몬스터 진입 불가, 몬스터 투사체 소멸, HP·MP 천천히 회복, 상태이상 즉시 해제, 저장 가능 / 엘리베이터 내부: 저장 가능 (마틴·에릭), 에릭의 몬스터 진입 불가
    - 확인: selftest ("몬스터 길찾기" 성소 구역 제외·"몬스터 투사체" 성소에서 소멸·"저장 가능 영역"·상태이상 해제) + 8·9단계 자동 확인 기록 (8-17)
  - [x] 던전 테마 5종 (백룸·판타지 벽돌벽·동굴·용암 동굴·왜곡된 차원), 층 이동마다 테마 변경, 지나온 층 (위·아래 모두)·미리 정한 다음 층은 테마·지형·지도 유지, 포탈은 모든 층 초기화, 몬스터·시체는 현재 층·이전 층만 유지·저장, 테마마다 다른 몬스터
    - 확인: selftest (테마 5종·몬스터 25종·"다음 테마 고르기"·"층 이동 기록"·"층 기록 불변 조건" 무작위 이동 2000번) + verify10·11 (테마 5종 화면)
  - [x] 몬스터 (마틴): 테마별 일반 4종 + 보스, 정예, 공터 둥지, 5층마다 보스, 시체, 수치가 AGENTS.md 표와 같음
    - 확인: AGENTS.md 표 대조 감사 (몬스터 20종 + 보스 5종의 이름·가중치·HP / 공격 / 방어 배수·이동·저항·공격 사거리 / 간격 / 투사체 속도가 모두 일치) + selftest + verify10 (테마별 몬스터·정예·둥지·보스 100건)
  - [x] WASD · Space · Shift (스태미너) · ESC / TAB · 마우스 시점 · 대상을 정면으로 보고 F 키 상호작용 · 마우스 왼쪽 버튼 행동 슬롯 (누르고 있으면 계속 사용) (2026-10-25 AGENTS.md)
    - 확인: verify21 (F·왼쪽 버튼)·verify5b (WASD 걷기·SHIFT 달리기 8.32 m/s·스태미너 초당 15·탈진·SPACE 점프 약 1.1m / 스태미너 10·마우스 시점·1~7·휠·TAB / ESC 일시정지 메뉴·벽 충돌) 통과. 조작감은 사용자 확인 (5-12·21-5)
  - [x] 행동 슬롯 7개, 1번에 기본 공격 (마틴) / 플래시 (에릭) 로 시작, 시스템 메뉴에서 등록 / 해제
    - 확인: selftest "새 게임 시작 시 파생 수치"·"에릭 새 게임" (1번 슬롯 = 기본 공격 / 플래시) + verify12 (등록 / 해제·드래그)
  - [x] 1인칭 크로스헤어, 원거리 공격은 조준점 방향
    - 확인: 화면 스크린샷 (가운데 + 크로스헤어) + selftest "몬스터 투사체"·verify14 (원거리 스킬이 조준점 방향)
  - [x] 시스템 메뉴 5탭 (에릭은 지도·인벤토리·시스템 3탭): 지도 (격자, 미방문 흐림) / 스테이터스 (스탯 분배, 레벨업 시 각 +1, 방어력·저항 4종) / 인벤토리 (장비 7부위, 클릭·드래그 장착, 우클릭·길게 누르기 상세, 소모품 직접 사용) / 스킬 (중앙 기본 공격, 인접 활성화, 레벨 업, 드래그·방향키 스크롤, 행동 슬롯에 스킬 등록) / 시스템 (저장은 성소 구역·엘리베이터 내부에서만 + 비활성 이유 툴팁 4초, 메인 메뉴 규칙 (그 영역 안이면 저장 후 바로, 밖이면 확인))
    - 확인: verify20 (마틴 5탭·에릭 3탭·[저장] 성소 안에서만 + 비활성 이유 툴팁 4초·[메인 메뉴] 성소 안 = 저장 후 바로 / 밖 = 확인 후 저장 없이) + verify11 (스테이터스)·verify12 (인벤토리)·verify13 (스킬)·selftest "지도 배치"
  - [x] 스탯·스킬·아이템·장비 수치가 AGENTS.md 표와 같음 (자체 테스트 + 상세 정보 화면 대조)
    - 확인: **AGENTS.md 표 대조 883건 일치 (불일치 0)** — 스킬 44개 (좌표·이름·종류·최대 Lv·소모·재사용 전 레벨·효과 문장의 `(a ± b × Lv)` 수식), 소모품 21종 (이름·가격·분류·단계), 무기 15종·방어구 9종·보조 6종·반지·시작 장비 (이름·수치), 무기 종류 5종 (간격·판정), 부가 옵션 17종·반지 각인 5종의 단계별 범위, 몬스터 20종·보스 5종, 상태이상 기본 지속. 이 대조를 자체 테스트 "AGENTS.md 표 ↔ 코드 데이터 대조" 로 남겼다 (이후 AGENTS.md 수치를 고치면 어긋난 곳이 바로 드러남). 그 밖의 공식 (파생 수치·경험치·피해·가격) 은 기존 selftest
  - [x] 이미지 에셋 없음, 사운드 없음, 주석 한국어
    - 확인: 이미지 파일 0 (git 에 .png·.jpg·.svg 없음, 코드에 이미지 로더·Audio 사용 없음)·사운드 구현 없음 (`www/se/candidates` 는 그대로)·// 주석은 한글 (한글이 없는 6줄은 매개변수 형태 설명·섹션 제목)·글꼴 규칙 (본문 Pretendard 계열, 숫자 D2Coding 계열) 확인
- [x] 20-8 사운드는 AGENTS.md 에 따라 아직 구현하지 않는다. 사용자가 요청하면 `www/se/candidates` 에서 골라 `www/se/` 로 이름을 바꿔 옮긴 뒤 구현한다.
  - (확인됨) 사운드 코드·파일 사용 없음 (20-7 마지막 항목). 사용자가 요청하면 구현한다.
- [ ] 20-9 (사용자 확인 필요) 새 게임의 이야기 장면 (글자 크기·속도·건너뛰기), 큰 층에서 실제 FPS (`&fps=1`), 에릭 저장 데이터 크기 (U60·U61, 약 765KB 로 해소) 확인. 확인 방법은 0절.

---

## 8. 자주 하는 실수 (구현 전에 한 번 읽을 것)

1. `file://` 로 열어서 "모듈을 불러올 수 없음" → 3.3 의 서버로 연다.
2. `import * as THREE from 'three'` → 동작하지 않는다. `'./three.module.min.js'` 만 쓴다.
3. 애드온 (PointerLockControls 등) 을 import → 파일이 없다. 직접 구현한다 (부록 C · E · F).
4. 최상위 `await` 사용 → `window.Undergrounds` 가 늦게 만들어져 HTML 의 initialize 호출이 실패한다.
5. 최상위에서 `document`·`localStorage` 사용 → 자체 테스트 (Node) 가 import 단계에서 실패한다. 함수 안으로 옮긴다.
6. 퍼센트를 `0.08` 과 `8` 로 섞어 씀 → 4.3 규칙 (데이터·상태는 `8`).
7. 스킬 트리 y 를 화면 y 와 같은 방향으로 그림 → 위아래가 뒤집힌다. `screenY = −y`.
8. 북쪽을 Z+ 로 착각 → 북은 Z−. yaw 0 이 북.
9. 던전 생성에 `Math.random()` 사용 → 불러오면 다른 지형이 나온다. `createRng` 를 쓴다.
10. 포인터 락 상태에서 ESC keydown 만 기다림 → 오지 않을 수 있다. 락 해제 이벤트로 처리한다 (6-1).
11. `requestPointerLock()` 을 키 입력·타이머에서 호출 → 실패한다. 클릭 핸들러 안에서만 호출한다. 락이 풀린 직후 1초 안에 다시 요청하면 거부될 수 있으니 실패를 잡아서 무시하고 오버레이를 유지한다 (부록 E `requestLock`).
12. Tab 키에 `preventDefault` 를 빼먹음 → 포커스가 다른 곳으로 이동한다.
13. 마우스 오른쪽 클릭 → 브라우저 메뉴가 뜬다. `contextmenu` 에 `preventDefault` (부록 E).
14. `disabled` 버튼에 툴팁을 달려고 함 → 클릭 이벤트가 오지 않는다 (4.5).
15. 층을 이동할 때 dispose 를 안 함 → 메모리가 늘고 점점 느려진다 (4.6).
16. 조명을 켜고 끄려고 `visible` 이나 개수를 바꿈 → 셰이더 재컴파일로 멈칫한다 (4-5). 정전 패턴도 `setLightLevel` 로 밝기만 바꾼다.
17. `dt` 를 제한하지 않음 → 탭을 다시 열었을 때 한 프레임에 크게 움직여 벽을 뚫는다. `dt ≤ 0.05` (부록 D), 이동은 0.3m 단위로 나눈다 (부록 F).
18. HUD 를 매 프레임 `innerHTML` 로 다시 그림 → 느려진다. 값이 바뀔 때만 고친다.
19. 수치를 기억으로 씀 → AGENTS.md 표와 달라진다. 항상 복사한다.
20. 같은 기능을 새 이름으로 또 만듦 → 먼저 검색한다.
21. 자체 테스트가 FAIL 인데 테스트의 기대값을 고쳐서 통과시킴 → **금지**. 기대값은 AGENTS.md 에서 온 것이다. 코드를 고친다. 기대값이 AGENTS.md 와 다르다고 판단되면 사용자에게 보고한다.
22. `localStorage` 를 직접 호출 → 용량 초과·비공개 모드에서 예외로 멈춘다. `storageGet` / `storageSet` / `storageRemove` (부록 D) 만 쓴다.
23. 게임 조작을 포인터 락 여부와 상관없이 처리 → 메뉴 버튼을 누를 때 공격이 나간다. 조작은 `input.locked` 일 때만 처리한다.
24. 테마마다 던전 구조를 바꿈 → 위층 복귀 시 지도가 달라진다. 테마는 겉모습과 몬스터만 바꾸고, 구조는 시드로만 정해진다 (6.3).
25. void 테마에서 난간 높이 (1.2m) 에 맞춰 충돌 상자까지 낮춤 → 점프로 넘어가 던전 밖으로 떨어진다. 충돌 상자는 그대로 둔다 (U20).
26. 공유 재질의 색·불투명도를 몬스터 하나 때문에 바꿈 → 같은 종류 전체가 바뀐다. 개체별로 바꿔야 하면 재질을 복제하거나 다른 공유 재질로 교체한다 (8-3, 8-6).
27. `world.history` 의 키를 숫자로 비교하지 않음 → JSON 을 거치면 키가 문자열이 된다. `Number(key)` 로 바꿔 비교한다 (부록 G 참고).
28. 몬스터 스냅샷을 여러 층 기록에 남김 → AGENTS.md 는 현재 층과 바로 이전 층만 유지하도록 정했고 저장 데이터가 커진다. 기록 중 runtime 이 있는 것은 "바로 이전 층" 하나뿐이어야 한다 (현재 층은 저장할 때 `world.runtime`). 반드시 `applyFloorChange` 를 통해서만 기록을 바꾼다. (2026-10-18 규칙 변경으로 "바로 위층" → "바로 이전 층")
29. 헤드리스 Chromium (SwiftShader, CPU 렌더링) 자동 확인에서 시간 제한을 짧게 잡음 → 용암·왜곡된 차원 테마는 1920×1080 에서 초당 2~3프레임까지 떨어지고, `dt ≤ 0.05` 제한 때문에 게임 시간이 실제 시간보다 몇 배 느리게 흐른다. 걸어서 확인하는 스크립트는 설정을 낮음 품질 (1280×720) 로 두고, 고정 대기 대신 `game.time`·상태를 조건으로 넉넉히 (60~90초) 기다린다. (게임 코드의 문제가 아니다)
30. 새 층의 시드·테마를 정하는 코드를 여러 곳에 씀 → 미리 정한 다음 층 기록과 어긋나거나 이웃한 층의 테마가 같아진다. 새 층은 `makeFloorRecord`, 다음 층 미리 정하기는 `ensureNextFloor` 로만 한다 (7-7).
31. 공격 판정이 `g.monsters` 를 그대로 돌다가 그 사이 몬스터가 추가됨 (슬라임 분열·소환) → `for…of` 가 새 몬스터까지 돌아 같은 공격에 맞는다. 공격 판정은 `g.monsters.slice()` 사본을 돈다 (10-1). (`updateMonsters` 는 새로 생긴 몬스터를 같은 프레임에 갱신해도 괜찮아서 그대로)
32. 반투명 물체 (예고 표시·구름) 를 추가했더니 화면 무기가 그 색으로 덧칠됨 → 불투명 재질은 반투명 물체보다 먼저 그려진다 (`renderOrder` 는 같은 목록 안에서만 순서를 정함). 맨 위에 그릴 것은 `transparent: true` (불투명도 1) 로 반투명 목록에 넣는다 (10-5, `viewModelMat`).
33. 보스가 멈추는 거리와 "주인공이 Nm 안이면" 패턴 거리를 따로 정함 → 보스가 패턴 거리 밖에서 멈춰 그 패턴이 나오지 않는다. 다가가는 거리 (`BOSS_APPROACH` 3.5m, 중심 기준) 는 가장 짧은 패턴 거리보다 짧게 (10-5).
34. 검증 스크립트에서 주인공 레벨을 올린 뒤 HP 를 채우지 않음 → "HP < 최대" 가 처음부터 참이라 피격 확인이 거짓으로 통과한다. 레벨을 바꾸면 `calcDerivedStats` 로 최대치를 다시 구해 HP 를 채운다. 반대로 강해진 주인공은 몬스터를 한 번에 죽여 맞았을 때의 행동 (임프 순간이동) 을 못 보므로 그 몬스터의 HP 를 크게 둔다.
35. Git Bash 의 `sed -i` 로 파일을 고침 → 줄바꿈이 CRLF 에서 LF 로 바뀐다 (2026-10-24 확인). 한 줄 치환도 Edit 도구나 `node -e` (readFileSync → replace → writeFileSync) 로 하고, 고친 뒤 `file 파일` 이 "with CRLF line terminators" 인지 본다. 바뀌었으면 node 로 `\r\n` 을 되돌린다.
36. Playwright `page.waitForFunction` 에 async 함수 (안에서 `await import(...)`) 를 넘김 → Promise 가 바로 참으로 취급되어 기다리지 않고 통과하고, 예외는 페이지 오류 (pageerror) 로만 보인다. 먼저 `page.evaluate(async () => { window.__T = (await import('/js/undergrounds.js')).__TEST__; })` 로 모듈을 잡아 두고, 조건은 동기 함수 `() => window.__T.debugRuntime().game…` 로 쓴다. 또 마우스를 아주 짧게 (100ms) 눌렀다 떼면 느린 SwiftShader 에서 그 사이에 프레임이 없어 우클릭 사용이 안 될 수 있다 — 결과가 나올 때까지 누르고 있다가 뗀다.
37. `&fakeLock=1` 자동 확인에서 `page.mouse.click(x, y)` 를 부르면 Playwright 가 먼저 마우스를 (x, y) 로 옮기고, 그 이동량이 포인터 락 중의 시점 회전으로 들어가 조준이 틀어진다 (2026-10-24, 16-4 확인 때 버튼 판 조준이 풀림). 클릭할 자리로는 메뉴가 열려 있을 때 (락이 풀렸을 때) 미리 옮기거나, 같은 자리에서만 클릭한다.
38. 포인터 락이 아닐 때 누른 클릭을 게임 입력으로 기록 → 메뉴·상점 [닫기] 버튼이나 "클릭하여 계속" 클릭이, 락이 걸린 직후 프레임에 상호작용 클릭 (상점 다시 열기·엘리베이터 이동) 으로 처리된다 (2026-10-25, 15단계 확인 때 상점 [닫기] 뒤 상점이 바로 다시 열림). 게임 입력용 클릭 (`input.leftClicked`) 은 락 중에 누른 것만 기록한다 (23번과 같은 취지).
39. 던전 생성 규칙 (조각 크기·배치 조건) 을 바꿈 → 같은 시드라도 지형이 모두 바뀐다. 특정 시드 던전에 무엇이 있다고 가정한 테스트 준비부 (몬스터 종류·무리 등) 가 깨지고, 이전 저장 데이터의 지형·방문 칸·위치가 어긋난다. 테스트는 시드 고정 대신 조건으로 고르고, 불러오기는 `playerStartPosition` 이 벽 안·던전 밖 위치를 거른다 (2026-10-25 상점 1×1).

---

## 9. 작업 기록

새 기록은 **맨 아래에 추가**한다. 형식:

```
### YYYY-MM-DD — 작업 ID (작업자: 모델 이름)
- 한 일:
- 검증: node --check (통과 / 실패), selftest (PASS n / FAIL n / SKIP n), 스크린샷 (무엇을 확인), 콘솔 오류 (있음 / 없음)
- 사용자 확인 필요:
- 남은 문제 / 다음 작업:
```

### 2026-10-17 — PROGRESS.md 최초 작성 (작업자: Claude Opus 5.5)

- 한 일: AGENTS.md 를 바탕으로 개발 절차·데이터 구조·검증 방법을 정리했다. 구현 코드는 아직 없다 (undergrounds.js 는 라이선스 주석뿐).
- 검증 (저장소 밖 임시 폴더에서 수행, 저장소의 다른 파일은 바꾸지 않음):
  - 부록 A 자체 테스트, 부록 B 던전 생성 (지하 1~520층 · 6,960회 생성 실패 0), 부록 B 시작 위치·계단 높이·벽 상자 (17,100건 오류 0), 부록 C 지오메트리, 부록 D 골격 + 부록 E 입력 (헤드리스 Edge 표시·WebGL2 확인), 부록 F 충돌 (무작위 이동 40만 회 벽 관통 0)
- 다음 작업: 0-1

### 2026-10-17 — 던전 테마·몬스터 반영 (작업자: Claude Opus 5.5)

- 한 일: AGENTS.md 에 "몬스터" 단락을 작성하고 (테마 5종 × 일반 4종 + 보스 1종, 정예, 공터 둥지, 5층마다 보스, 시체), AGENTS.md "던전 테마" 단락과 함께 이 문서에 반영했다.
  - 단계 추가: 10단계 (테마별 몬스터 완성). 기존 10~15단계는 11~16단계로 번호가 밀렸다.
  - 5절: U1·U8 확정, U15~U20 추가. 6절: `theme`, `world.history`, `merchantSoldOut`, `bossPieceId`, 6.8 테마·몬스터 정의, 6.9 층 기록 추가.
  - 부록 A (테스트 18개), 부록 B (보스 층 공터), 부록 G (층 기록) 갱신·추가.
- 검증 (저장소 밖 임시 폴더): 부록을 문서에서 그대로 추출해 조립 — 빈 파일 SKIP 18 / 골격 PASS 1 / 2단계 PASS 7 / 부록 G + AGENTS.md 몬스터 표를 옮긴 데이터로 테마·몬스터·다음 테마·층 기록 테스트 PASS, FAIL 0. 보스 공터를 넣은 생성기 6,960회 생성 실패 0.
- 사용자 확인 필요: 5절의 미확인 항목 (특히 U15~U20)
- 다음 작업: 0-1

### 2026-10-17 — 0-1 ~ 1-8 (0·1단계) (작업자: Claude Opus 5.5)

- 한 일:
  - 0단계: `tools/selftest.mjs` 생성 (부록 A), `www/js/undergrounds.js` 골격 (부록 D), 디버그 해시 (`parseDebugHash`, `DEBUG_ENTRIES` = title·menu·slots·settings), 공용 UI (`makeButton`, `showDialog`, `closeAllDialogs`, `showTooltip`, `showToast`, `uiRectOf`) 와 CSS, `makeCanvasTexture` ([10]).
  - 1단계: 타이틀 (맨홀 아래 수직 하수도에서 위를 올려다보는 3D 배경 — 벽돌 벽·이음새 고리·사다리·맨홀 빛·빛줄기·먼지), 메인 메뉴, 설정 (draft → 저장해야 적용, 언어 즉시 전환, 품질 = 캔버스 내부 해상도), 저장 슬롯 저장소 (`slotKey`, `readSlot`, `writeSlot`, `deleteSlot`), 슬롯 화면 (빈 슬롯 확인 / 이어하기·삭제·취소 / 삭제 2차 확인 / 손상 슬롯 삭제), 게임 화면 자리 (`SCREENS.game` 임시), ko/en 문구.
- 부록과 다르게 한 점 (모두 `npm run lint` 통과를 위한 것이거나 작은 구현 선택):
  - `tools/selftest.mjs`: 맨 위에 `/* global console, process, URL */` 추가 (ESLint 설정이 `.mjs` 에 Node 전역 변수를 주지 않음), 층 이동 기록 테스트의 `catch (e)` → `catch`, 쓰지 않는 `r =` 대입 제거. 1단계 테스트 2개 추가 ("저장 슬롯·설정 저장소 (가짜 localStorage)", "디버그 해시 파싱") → 테스트 총 20개.
  - 골격: 아직 쓰지 않는 상수 (`CELL_SIZE`, `CELL_HEIGHT`) 는 넣지 않았다 → 2-1 에서 추가. 안 쓰는 `catch (e)` 는 `catch` 로 씀. 화면 객체에 선택 메서드 `onKeyDown(e)` 를 두고, `initialize` 의 `onGlobalKeyDown` 이 대화상자 ESC 를 먼저 처리한 뒤 화면에 넘긴다 (설정·슬롯 화면에서 ESC = 취소·뒤로).
  - 타이틀은 `pointerdown` 대신 `click` 으로 넘어간다 (AGENTS.md "클릭한 경우"). 메뉴 3D 배경은 화면마다 만들고 지우지 않고 메뉴 화면들이 공유하며, 게임 화면 진입 시 해제한다.
  - `startNewGame` / `continueGame` 은 1-5 대로 임시 게임 화면으로만 이동한다 (저장하지 않음). 실제 연결은 5·6단계.
- 검증:
  - `node --check` 통과, selftest `PASS 3, FAIL 0, SKIP 17` (RNG·저장소·디버그 해시), `npm test` (ESLint + 기존 Playwright e2e) 통과.
  - 브라우저: 저장소에 설치된 Playwright Chromium 을 저장소 밖 임시 스크립트로 실행해 39건 확인, 실패 0 — 타이틀 문구·키 입력으로는 안 넘어감·클릭 시 메인 메뉴 / 설정 취소는 반영 안 됨·ESC = 취소·English+낮음 저장 시 영어 메뉴와 캔버스 1280 폭·새로고침 후 유지·보통 = 1920 폭 / 빈 슬롯 확인 문구·아니오·ESC·예 → 임시 게임 화면 / 데이터 슬롯 요약 ("지하 7층 · 동굴 · Lv 12", 저장 시각)·선택지 3개·삭제 2차 확인 (아니오면 유지, 예면 localStorage 에서 제거)·손상 슬롯 삭제·이어하기 / 디버그 해시 3종 / 1280×1024 창에서 16:9 가운데 정렬. 스크린샷 14장을 직접 열어 확인.
  - 콘솔 오류 없음 (스크린샷 촬영 때 GPU 드라이버 성능 경고만 나옴, 게임 코드와 무관).
- 사용자 확인 필요: 1-8 (실제 브라우저에서 메뉴 흐름)
- 다음 작업: 2-1

### 2026-10-17 — 2-1 ~ 2-4 (2단계) (작업자: Claude Opus 5.5)

- 한 일:
  - [01] 에 `CELL_SIZE = 16`, `CELL_HEIGHT = 10` 추가. [08] 에 부록 B 코드를 문서에서 그대로 추출해 옮김 (331줄, 수정 없음).
  - 2-4: [08] 끝에 `dungeonToAscii(d)` 추가 — 칸 하나를 가로 3글자 × 세로 2줄로 그리고 네 변의 벽을 모두 표시 (북쪽이 위). 글자: S 성소, M 상인, C 공터, B 보스 공터, U 위 계단, D 아래 계단, P 포탈, x 막다른 벽, . 복도.
  - 디버그 해시 `#debug=ascii&floor=…&seed=…` → 디버그 전용 화면 `SCREENS.debugAscii` ([21], 화면에 맞게 글자 크기 자동 조절, 콘솔에도 출력). 개발자용 화면이라 문구는 `t()` 를 거치지 않는다.
  - `__TEST__` 에 `generateDungeon, getSpawn, floorHeightAt, buildCellBoxes, dungeonToAscii` 추가. 자체 테스트 "던전 글자 지도 (dungeonToAscii)" 추가 (줄 수, 칸 글자 수 = 칸 수, 시설 글자, 지하 1층에 U 없음, 5의 배수 층에만 B) → 테스트 총 21개.
- 검증:
  - `node --check` 통과, selftest `PASS 10, FAIL 0, SKIP 11` (2-3 의 예상 PASS 9 + 이번에 추가한 1개), `npm run lint` 통과, `npm test` 통과.
  - 실제 파일로 스트레스 검사 (저장소 밖 임시 스크립트): 지하 1~520층 · 2,088회 생성 — 블록 수·보스 공터 규칙 위반 0, 재시도 최대 1회, 1회 생성 20ms 초과 0회, 모든 도착 방식 getSpawn 성공.
  - 브라우저 (Playwright Chromium, 임시 스크립트) 17건 확인, 실패 0: 지하 1·5·100·385층 글자 지도의 칸 수 (128·132·227·512), 시설 표시, 보스 공터는 5의 배수 층에만, 지도가 1920×1080 안에 들어감, 회귀 (타이틀 → 메인 메뉴). 스크린샷으로 상점 출입구 1개·계단 3칸·성소 십자 모양 확인. 콘솔 오류 없음.
- 다음 작업: 3-1

### 2026-10-17 — Node/Bun 정적 서버 (작업자: Copilot)

- 한 일: `server.js` 에 Node 내장 모듈 기반의 정적 서버를 구현했다. `www` 를 서비스하고 `/` 는 게임 페이지로 연결하며, GET/HEAD, MIME 유형, 경로 이탈 및 심볼릭 링크 검사를 지원한다. `npm start` 실행 명령을 추가했다. Bun에서는 `bun server.js` 로 실행할 수 있다.
- 검증: `npm start` (Node) 와 `bun server.js` 모두 실행. 두 서버에서 루트 페이지·모듈 MIME 유형·HEAD·404·경로 이탈 차단·지원하지 않는 메서드 응답 확인. `npm test` 통과 (ESLint 및 Playwright 1개).
- 사용자 확인 필요: 없음.
- 남은 문제 / 다음 작업: 없음. 게임 구현의 다음 단계는 3-1이다.

### 2026-10-17 — server.js 주석 추가·문서 반영 (작업자: Claude Opus 5.5)

- 한 일:
  - `server.js` 의 함수에 한국어 JSDoc 주석 추가 (`sendError`, `isWithinRoot`, `serveStatic`, 요청 처리 콜백, 대기 시작 콜백). 코드 동작은 바꾸지 않았다 (`server.listen(...)` 콜백에 주석을 붙이려고 줄바꿈만 바꿈).
  - 이 문서: 1절 9번 (`server.js` 는 사용자 요청 없이 수정하지 않음), 2절 파일 구조·도구, 3.3 (Python `http.server` 8080 → `server.js` 9806, `PORT` 로 포트 변경, Bun 실행), 3.4 의 URL, 3.6 의 사용자 확인 예시, 0절 사용자 확인 방법을 고쳤다. 9절 이전 기록에 나오는 8080 은 그때 상황이므로 그대로 둔다.
- 검증:
  - `node --check server.js`, `npm run lint` 통과.
  - `node server.js` 실행 후 응답 확인: `/` 200 (text/html), `/js/undergrounds.js` 200 (text/javascript), 없는 파일 404, `/..%2fserver.js` 403, `%2e%2e` 경로 404 (www 밖 파일 노출 없음), HEAD 200, POST 405. `PORT=9811` 로 다른 포트 동작, `PORT=abc` 는 RangeError.
  - Playwright Chromium 으로 `http://127.0.0.1:9806/` 접속: 타이틀 표시 → 클릭 → 메인 메뉴, `#debug=ascii&floor=5&seed=3` 정상, 콘솔 오류 없음.
- 다음 작업: 3-1

### 2026-10-17 — 3-1 ~ 3-10 (3단계) (작업자: Claude Opus 5.5)

- 한 일 (`www/js/undergrounds.js`):
  - [04] `SKILLS` 45개 (AGENTS.md 표 그대로, 영어 설명 포함), `SKILL_LINKS` 48개 (규칙으로 생성), `SKILL_BY_ID`, `SKILL_NEIGHBORS`, `skillCooldown(skill, lv)`.
  - [05] `CONSUMABLES` 21개, `TIER_INFO`, `RARITIES`, `WEAPON_TYPES` (맨손 `fist` 포함), `EQUIP_BASES` 36개 (`defineEquip`), `RING_ENGRAVINGS` 5종, `AFFIXES` 17종, `affixSlotOf`, 기타 상수 (6.5).
  - [06] `STATUS_EFFECTS` 8종, `THEMES` 5개, `MONSTER_TYPES` 25개 (`monsterAttack` / `defineMonster` 도우미, 크기·시체는 8-1 표). `attack` 에 추가 필드 (`knockback, stun, splashRadius, shockwave, aimTime, radius, cloudTime`) — 6.8 에 기록.
  - [07] 3-6 공식 함수 + `consumableSellPrice`, `MOD_KEYS` / `emptyMods` / `addMods` / `addAffixMods`, `equipStats` (12-2 를 먼저 구현), `PASSIVE_MODS`, `collectModifiers`, `calcDerivedStats` (6.7 에 `weaponType`, `weapon` 필드 추가).
  - [09] `makeEquipInstance`, `createNewGameState`, 부록 G (`THEME_IDS`, `HISTORY_LIMIT`, `pickNextTheme`, `applyFloorChange`).
  - [03] `localName(def)` 추가, `themeLabel` 이 `THEMES` 를 쓰도록 바꾸고 I18N 의 `theme.*` 키 10개 삭제 (이름이 두 곳에 있지 않게).
  - [22] `__TEST__` 에 3단계 이름 추가 (4.7). `startNewGame` / `continueGame` 은 아직 임시 화면 그대로 (5·6단계에서 연결).
- `tools/selftest.mjs`: 테스트 "데이터 세부·공식 (옵션·각인·상태이상·가격·장비 수치·패시브·버프)" 추가 → 테스트 총 22개. 부가 옵션 17·각인 5·상태이상 8, 등급 확률 합 100, 옵션 범위·부위, 모든 무기의 `WEAPON_TYPES`, 몬스터 상태이상 id, **모든 스킬·모든 레벨에서 설명의 `{이름}` 자리가 `values` 에 있는지**, 연결 양방향, 가격·iLv·몬스터 수치 공식, 30층 강철 장검 (공격력 32.4, 물리 공격력 38.41), 맨손, 반지 각인·옵션·D4·D7 (저항 상한 75), A8 조건부와 버프.
- 결정 (문서에 없던 것):
  - 패시브 → 수정자는 `values(lv)` 를 받아 키만 바꾼다 (공식 중복 방지). 3-9 의 예시 형식을 이에 맞게 고쳤다.
  - A8 의 "HP 50% 이하" 는 `game.derived.maxHp` (직전 프레임 값) 로 판단 (6.7).
  - 반지 각인 `stat` 은 고정 수치이므로 iLv 보정 대상 (`scales: true`), 나머지 각인·옵션의 % 값은 보정하지 않음 (AGENTS.md "공통 규칙").
- 검증:
  - `node --check` 통과, selftest `PASS 22, FAIL 0, SKIP 0`, `npm run lint` 통과, `npm test` (ESLint + Playwright e2e) 통과.
  - AGENTS.md 장비 표와 `EQUIP_BASES` 수치를 다시 대조함.
  - Playwright Chromium + `server.js` (9806): 브라우저에서 모듈을 불러 `createNewGameState`·`calcDerivedStats` 동작 (maxHp 100, physAtk 6.9), 슬롯 화면에 테마 이름 표시 (한국어 "용암 동굴"·"왜곡된 차원", 영어 "Lava Cave"·"Distorted Dimension"), 타이틀 → 메인 메뉴 회귀, 콘솔 오류 없음 — 7건 모두 OK.
  - 줄바꿈 CRLF 유지 확인 (`undergrounds.js`, `selftest.mjs`).
- 다음 작업: 4-1

### 2026-10-17 — 4-1 ~ 4-9 (4단계) (작업자: Claude Opus 5.5)

- 한 일 (`www/js/undergrounds.js`):
  - [10] 부록 C `buildBoxesGeometry`, `matrixOf`, 이음새 없는 텍스처 그리기 도우미, 테마 텍스처 15종 + 공용 텍스처 (성소 대리석·나무·천막·포탈 소용돌이·성운·균열·용암 흐름·형광등 패널), 발광 재질 `markGlow` / `applyGlowLevel`, 공유 자원 캐시 `getCommonAssets` / `getThemeAssets` + 테마별 `make*Assets`.
  - [11] `THEME_VISUALS` (4-3 표), 조명 상수, `cellWallFaces` / `randomWalkPoint` / `decorCells` / `localToWorldXZ` / `rotatedBox`, `stairStepBoxes`, `collectDungeonBoxes`, `buildDungeonView`, 시설 (`buildFacilities`, 성소·상인·포탈·공터·계단 끝), 테마 장식 5종 (`decorate*`), `mountDungeonView` / `unmountDungeonView`. 반환 구조와 규칙은 6.10.
  - [21] 디버그 화면 `SCREENS.debugView` (`#debug=view`, `&eye` `&at` `&yaw` `&pitch` `&light`), `SCREENS.debugViewDispose` (`#debug=viewDispose`), `debugTopCamera`, `debugViewpoint`, `debugFloorSeed`. [01] `CAMERA_FAR_DEFAULT`.
  - [17] AGENTS.md 글꼴 규칙 (2026-10-17 사용자 추가) 반영: 기본 글꼴 `Pretendard, Noto Sans KR, Noto Sans, D2Coding, sans-serif`, 숫자·코드용 `.ug-num` 클래스, 디버그 글자 지도·디버그 정보는 D2Coding. 기존 슬롯 화면 요약 줄의 "숫자 별도 행" 분리는 하지 않았다 (0절 알려진 문제, 4.5).
  - [22] `__TEST__` 에 `THEME_VISUALS, stairStepBoxes, collectDungeonBoxes, cellWallFaces, STAIRS_DEPTH, WALL_Y0` 추가.
- `tools/selftest.mjs`: 테스트 2개 추가 → 총 24개. "계단 디딤판 높이 = floorHeightAt (4-7)" (층 2·5·12·40, 디딤판 가운데 높이 일치, 반 단 이내, 깊이 2m × 폭 6m, 16단 높이 공식), "그리기용 상자" (충돌 상자 = `buildCellBoxes` 테마 무관·높이 10, void 난간 1.2 / 위 계단 7.2 / 아래 끝, 바닥·성소 대리석·천장 상자 수, 바닥판 두께).
- 결정 (문서에 없던 것): U21 (void 계단 칸 난간 높이). 손전등·성소 조명 세기를 스크린샷을 보고 낮춤 (4-5). 7-1 계단 트리거 기준 0.92 → 0.8 (끝 벽 때문에 0.92 에 도달할 수 없음, 4-7). 8-4 시야 판정에 시설 상자 높이 반영. 위에서 보기 카메라 높이는 던전 크기에 맞춰 계산 (4-8).
- 검증:
  - `node --check` 통과, selftest `PASS 24, FAIL 0, SKIP 0`, `npm run lint` 통과, `npm test` (ESLint + Playwright e2e) 통과. 줄바꿈 CRLF 유지 확인 (`undergrounds.js`, `selftest.mjs`, `PROGRESS.md`).
  - 브라우저: 3.4 의 헤드리스 Edge 대신 이전 단계처럼 저장소의 Playwright Chromium (SwiftShader) + `server.js` (9806) 를 저장소 밖 임시 스크립트로 실행해 스크린샷 약 30장을 직접 열어 확인. 콘솔 오류 없음.
    - 위에서 보기: backrooms 1층 (미로·성소·상점·포탈·형광등 점), brick 5층·void 5층 (보스 공터 비어 있음, void 는 우주에 떠 있는 던전·공중 조각), cave 385층 (512칸, draw calls 108, 삼각형 6.5만).
    - 1인칭: 5개 테마 모두 성소·아래 계단 앞에서 확인 + 상점 (brick·lava), 포탈 (lava·cave), 공터 잔해 (cave·brick), 보스 공터 (lava), 위 계단 (backrooms·void), 정전 `light=0.05` (backrooms: 패널·환경광 꺼지고 손전등만). 1인칭 draw calls 6~42.
    - 4-9 dispose: `#debug=viewDispose&floor=5&seed=7` → 공유 자원 생성 후 geometries 24 / textures 26, 10회 더 만들고 지운 뒤 24 / 26 → OK.
    - 회귀: 타이틀 클릭 → 메인 메뉴, 슬롯·설정·글자 지도 화면 표시, Pretendard·D2Coding 글꼴 로드 확인.
- 사용자 확인 필요: 없음 (선택: 3.5 의 `#debug=view` 해시로 던전 모습 확인. 형광등 깜빡임·소용돌이 회전·불씨는 정지 스크린샷으로는 움직임을 확인할 수 없었다).
- 다음 작업: 5-1

### 2026-10-17 — 5-1 ~ 5-11 (5단계) (작업자: Claude Opus 5.5)

- 한 일 (`www/js/undergrounds.js`):
  - [12] 부록 E 입력 그대로 (`catch (e)` → `catch` 만 바꿈). `initialize` 에서 `setupInput()`, `frame()` 렌더링 뒤에 `endInputFrame()`.
  - [13] 부록 F 충돌 그대로 + 플레이어 상수, `createGameRuntime`, `playerStartPosition`, `updateGame` (`clampVitals`, `updateActiveSlot`, `updatePlayerLook`, `updatePlayerMovement`, `updateCellState`, `updateRegen`), `spendStamina`, `syncCamera`.
  - [16] `countConsumable(player, id)`, `itemCooldownKey(id)` (물약류 `item:potion` / 투척물 `item:throw` / 그 외 `item:<id>`).
  - [17] HUD·오버레이 CSS (1단계 임시 게임 화면 CSS 삭제). [03] 문구 추가 (`game.clickToResume`, `game.controlsHint`, `hud.*`), 임시 화면 문구 4개 삭제. [01] `ACTION_SLOT_COUNT = 7`.
  - [18] `SCREENS.game` (실제 게임 화면), `createLockOverlay`, `startNewGame`, `continueGame`. [19] `createHud`, `updateHud`, `hudSet`, `updateHudSlot`, `shortItemName`, `TIER_MARKS`.
  - [21] `DEBUG_ENTRIES.game` → `startDebugGame` (`&noOverlay`, `&fakeLock`), `debugRuntime()`. [22] `__TEST__` 에 `moveWithCollision, countConsumable, itemCooldownKey, debugRuntime`.
- `tools/selftest.mjs`: 테스트 2개 추가 → 총 26개. "이동 충돌" (층 1·5·40 에서 무작위 이동 2만 번 × 3, 한 번에 최대 0.65m: 던전 밖으로 나가지 않고 벽과 겹치지 않음), "소모품 개수·재사용 대기 키".
- 결정 (문서에 없던 것): HP·MP 자연 회복을 5단계에서 구현 (5-5). "클릭하여 계속" 이 보이는 동안 게임 시간 정지 (5-3). 행동 슬롯 소모품 약자는 단계 수식어를 빼고 단계는 Ⅰ·Ⅱ·Ⅲ 로 따로 표시 (5-7). 글꼴 규칙의 "동적 숫자는 별도 행" 은 "글자와 다른 요소 (+ `.ug-num`)" 로 해석해 HUD 에 적용 (막대 숫자·층 숫자는 실제로도 별도 줄).
- 검증:
  - `node --check` 통과, selftest `PASS 26, FAIL 0, SKIP 0`, `npm run lint` 통과, `npm test` 통과, 줄바꿈 CRLF 유지.
  - Playwright Chromium (SwiftShader) + `server.js`, 저장소 밖 임시 스크립트로 37건 자동 확인, 실패 0, 콘솔 오류 없음. 게임 시간 (`game.time`) 기준으로 측정:
    - HUD 문구 (B1 · 백룸 · 성소 안내 · 100 / 100 · 50 / 50 · 슬롯 "기본" / "생명" Ⅰ 3 · 0 / 80 · 활성 슬롯 테두리).
    - 걷기 4.98 m/s (기대 5.20, 첫 프레임 오차), 달리기 8.32 m/s, 달리기 스태미너 초당 15, 마지막 소모 후 1초 전 회복 없음 → 이후 회복, 점프 최고 1.04m (프레임 간격 0.05초 샘플링, 이론값 1.2m) · 착지 · 스태미너 10, 탈진 (0 → 달리기·점프 불가, 걷기 속도) → 30.7 에서 해제, 벽에 막힘 (벽까지 0.40m), 성소 회복 HP 5.40/초 · MP 3.50/초 (자연 + 최대치 5%), 숫자키 3 · 휠 아래 · 위 · 7 → 1 순환, 마우스 이동량 → yaw −0.220 · pitch +0.088 (기대값과 같음), 아래 계단 끝까지 (y −4.99) 내려갔다가 뒤로 걸어 다시 0, 방문 칸 6칸, void 위 계단 끝 (y +4.99), void 난간 쪽으로 계속 점프해도 던전 밖으로 못 나감.
    - 오버레이: 락이 없으면 보이고 게임 시간 정지 → 클릭 → 실제 포인터 락 성공 (헤드리스 Chromium) → 오버레이 사라지고 진행. 메인 메뉴 → 게임 시작 → 빈 슬롯 → 예 → 지하 1층 · 백룸 · 성소에서 시작.
    - 영어 + 낮음 품질 (캔버스 1280): HUD·오버레이 영어 문구. 메뉴 회귀 (타이틀·슬롯·설정·글자 지도, 글꼴 로드) 정상.
  - 스크린샷 직접 확인: 백룸·용암·동굴 (오버레이)·void HUD, 성소 회복 중 막대.
- 사용자 확인 필요: 5-12 (조작감. 0절에 방법)
- 다음 작업: 6-1

### 2026-10-17 — 5-12 (5단계 마무리) (작업자: Claude Sonnet 5.5)

- 한 일: 코드는 바꾸지 않았다. 5단계의 남은 항목 5-12 를 처음부터 다시 확인하고 체크박스·0절을 정리했다.
  - 저장소 밖 임시 스크립트로 Playwright Chromium (SwiftShader) + `server.js` (9806) 를 띄워 5-12 의 항목을 하나씩 확인했다. 게임 시간 (`game.time`) 기준으로 측정.
- 검증:
  - `node --check` 통과, selftest `PASS 26, FAIL 0, SKIP 0`, `npm test` (ESLint + Playwright e2e) 통과.
  - 브라우저 자동 확인 33건, 실패 0, 콘솔 오류 없음:
    - HUD: B1 · 백룸 · 성소 안내 · 100 / 100 · 50 / 50 · 슬롯 "기본" / "생명" Ⅰ 3.
    - 걷기 5.20 m/s (기대 5.20), 달리기 8.32 m/s (기대 8.32), 달리기 스태미너 초당 15.00, 점프 최고 1.04m (프레임 간격 샘플링, 이론값 1.2m) · 착지 · 스태미너 100 → 90, 탈진 (0 → 걷기 속도만, 점프 불가) → 30.7 에서 해제.
    - 숫자키 3, 휠 아래·위, 7 → 1 순환, HUD 활성 슬롯 표시 일치. 마우스 이동량 → yaw −0.220 · pitch −0.088.
    - 벽: 4방향으로 달려도 벽까지 최소 거리 0.400m (충돌 상자 697개). 계단: cave · void 모두 아래 계단 끝 y −4.99 → 뒤로 걸어 y 0.000 복귀 → 위 계단 끝 y +4.99.
    - 성소: HP 초당 5.40 · MP 초당 3.50 (기대 5.4 · 3.5), 성소 밖은 HP 초당 0.40 (자연 회복만) 이고 HUD 성소 안내가 사라짐.
    - 포인터 락: 락 전에는 "클릭하여 계속" 이 보이고 게임 시간이 멈춤 → 클릭하면 실제 포인터 락 성공 → 오버레이 숨김 · 게임 시간 진행 · S 키로 이동.
  - 스크린샷 직접 확인: 백룸 성소 HUD, "클릭하여 계속" 오버레이, void 위·아래 계단 중간 (디딤판·난간·끝의 보라색 균열), cave 아래 계단 중간. cave 아래 계단 끝의 검은 사각형은 `buildStairEnd` 가 계단 끝 벽 앞에 두는 평면 (void 는 보라색 균열, 그 외 테마는 검은 면) 으로 의도된 모습이다.
  - 이번 확인 스크립트 (`verify5.mjs`) 는 `view.collision` 이 배열이 아니라 칸 키별 상자 목록의 `Map` 임을 모르고 처음 틀리게 썼다. 게임 코드가 아니라 스크립트의 문제였고 고쳐서 다시 돌렸다. (나중 단계에서 충돌 상자를 훑는 코드를 쓸 때 참고)
- 사용자 확인 필요: 5-12 의 실제 조작감 (마우스 감도·이동 느낌). 0절에 방법. 자동 확인은 입력 이벤트를 합성해 수치를 본 것이라 "느낌" 은 사람이 해 봐야 한다. 감도 (`MOUSE_SENSITIVITY` 0.0022) 나 점프·달리기 느낌이 어색하면 [13] 의 상수만 고치면 된다.
- 다음 작업: 6-1

### 2026-10-18 — 6-1 ~ 6-9 (6단계) (작업자: Claude Opus 5.5)

- 한 일 (`www/js/undergrounds.js`):
  - [03] 문구 추가 (`menu.*`, `map.legend.*`, `system.*`), `game.controlsHint` 에 "ESC / TAB 시스템 메뉴" 추가.
  - [09] `writeSlot(i, state, game)` 이 `serializeState` 를 거치도록 변경. `EQUIP_SLOT_KEYS`, `serializeState`, `deserializeState`, 형식 검사 `isValidState` / `isValidPlayer` / `isValidItem` / `isValidWorld` (+ `isPlainObject`, `isFiniteNum`, `isIntIn`).
  - [13] 런타임에 `changingFloor`, `dead` 추가 (6-1 메뉴 열기 조건).
  - [17] 시스템 메뉴·지도·시스템 탭 CSS.
  - [18] `SCREENS.game` 에 메뉴 열기/닫기 (`canOpenMenu`, `openMenu`, `closeMenu`, `onKeyDown`, 락 해제 → 메뉴), `params.menu` / `params.reveal`. `startNewGame` 즉시 저장, `continueGame` 형식 검사, `saveGame`.
  - [20] `MENU_TABS`, `MENU_TAB_RENDERERS`, `createSystemMenu`, `clearTooltips`, 지도 (`mapLayout`, `mapCellFill`, `mapIconOf`, `drawDungeonMap`, `drawMapIcons`, `drawMapPlayer`, `renderMapTab`), 시스템 탭 (`renderSystemTab`, `leaveToMainMenu`).
  - [21] `startDebugGame` 에 `&menu=`, `&reveal=1`. [22] `__TEST__` 에 6단계 이름 (4.7).
- `tools/selftest.mjs`: 테스트 2개 추가 → 총 28개 ("저장·불러오기 왕복", "지도 배치").
- 결정 (문서에 없던 것): U22 (저장 실패), U23 (ESC 외의 이유로 락이 풀려도 메뉴 열림). 지도의 계단 아이콘은 첫 디딤 칸에, 시설 칸은 바닥색을 달리 칠함. 시스템 탭에 슬롯 번호·마지막 저장 시각·성소 안내 표시. `readSlot` 은 바꾸지 않고 이어하기에서만 엄격하게 검사 (6-5 메모).
- 검증:
  - `node --check` 통과, selftest `PASS 28, FAIL 0, SKIP 0`, `npm test` (ESLint + Playwright e2e) 통과, 줄바꿈 CRLF 유지 (`undergrounds.js`, `selftest.mjs`, `PROGRESS.md`).
  - Playwright Chromium (SwiftShader) + `server.js` (9806), 저장소 밖 임시 스크립트 (`verify6.mjs`) 로 66건 자동 확인, 실패 0, 콘솔 오류 없음:
    - 지도: `&menu=map&reveal=1` 탭 5개·지도 활성·오버레이 숨김·제목 (`B1` 은 `.ug-num`)·canvas 1600×860 (+테두리)·범례 8개·시작 칸 성소 바닥색·플레이어 삼각형 픽셀, 방문하지 않은 칸은 안쪽이 배경색 (윤곽만), 지하 385층 (512칸) 칸 크기 22px. 스테이터스·인벤토리·스킬 = "준비 중입니다."
    - TAB/ESC: 열기·닫기, 열려 있는 동안 `game.time` 정지, 닫으면 진행, 다시 열면 마지막 탭 (시스템). 대화상자가 열려 있으면 ESC 는 대화상자만 닫음.
    - 실제 포인터 락: 오버레이 클릭 → 락 → `exitPointerLock()` → 메뉴가 열리고 30ms 뒤 ESC 는 무시 → 400ms 뒤 ESC 로 닫힘 → "클릭하여 계속" 이 보이고 게임 시간 정지 → 다시 클릭하면 락 (메뉴 안 열림) → 락 상태에서 TAB → 메뉴 1개만 열림.
    - 시스템 탭: 성소 안 [저장] 활성, 성소 밖 `is-disabled` (disabled 속성 없음) → 클릭 시 툴팁 3.5초에 남아 있고 4.3초에 사라짐, onClick 미호출. 성소 밖 [메인 메뉴] → 확인 대화상자 → 아니오 / ESC 면 게임 유지, 예면 저장 없이 메인 메뉴 (입력 콜백 해제). 디버그 게임은 성소 안 [저장]·[메인 메뉴] 모두 저장하지 않고 안내.
    - 실제 저장 흐름: 타이틀 → 게임 시작 → 슬롯 2 → 예 → 즉시 저장 (시작 위치, 형식 검사 통과) → 성소 다른 칸으로 이동·시선 1.0 → [저장] (위치·시선·방문 칸 저장, 마지막 저장 시각 표시) → 위치 +2m·시선 −2.5 → 성소 안 [메인 메뉴] (대화상자 없이 저장 후 이동) → 슬롯 2 요약 "지하 1층 · 백룸 · Lv 1" → 이어하기 → 같은 위치·시선·시드·방문 칸, 성소 안, 슬롯 2.
    - 형식이 틀린 데이터 (`player: { level: 3 }` 만 있는 슬롯) → 이어하기 → "저장 데이터를 불러올 수 없습니다." 토스트, 슬롯 화면 유지.
    - 영어 + 낮음 품질: 탭·버튼·지도 제목 영어.
  - 스크린샷 직접 확인: 지하 1층 지도 (공개 / 방문한 칸만), 지하 5층 void 보스 층 지도 (☠·상인·포탈·계단), 지하 385층 지도, 새 게임에서 2칸 방문한 지도 (시선 방향 삼각형), 시스템 탭 (성소 안 / 밖 + 툴팁 / 메인 메뉴 확인 대화상자 / 영어), 이어하기 직후 화면.
  - 처음 확인 때 고친 것: canvas 가 `.ug-ui *` 의 `box-sizing: border-box` 로 1598×858 로 줄어 표시됨 → `content-box`. 범례·지도의 ☠ 가 작은 그림 문자로 대체됨 → 기호 글꼴 우선 (`MAP_ICON_FONT`). 툴팁이 위 안내 문구와 겹침 → 버튼 위 여백 40px.
  - 참고: 이번에는 `git status` 가 `dubious ownership` 오류 없이 동작했다 (1절 10번).
- 사용자 확인 필요: 6-10 (0절에 방법). 5절 U22·U23.
- 다음 작업: 7-1 (`changeFloor` 동안 `g.changingFloor = true` 로 메뉴가 열리지 않게 할 것. 층을 옮긴 뒤 지도 탭은 메뉴를 열 때마다 새로 그리므로 따로 할 일 없음)

### 2026-10-18 — 6-10 사용자 확인, 7-1 ~ 7-5 (7단계) (작업자: Claude Opus 5.5)

- 6-10: 사용자가 실제 브라우저에서 4가지 (ESC/TAB 열고 닫기, 성소 밖 저장 툴팁, 성소 안 저장 → 메인 메뉴 → 이어하기 같은 위치) 모두 정상 동작을 확인 → `[x]`.
- 한 일 (`www/js/undergrounds.js`):
  - [08] `collectFloorTriggers`, `floorTriggerAt`, `TRIGGER_FLOOR_CHANGE`, `STAIRS_TRIGGER_PROGRESS`, `PORTAL_TRIGGER_RADIUS`. [11] `buildFacilities` 는 트리거를 만들지 않고 `buildDungeonView` 가 `collectFloorTriggers` 를 쓴다.
  - [13] 런타임 `transition`, `wasInTrigger`. `updateFloorTriggers`, `changeFloor`, `swapFloor`, `placePlayer`, `snapshotFloorRuntime`, `restoreFloorRuntime`, `clearFloorRuntime`, `FLOOR_FADE_TIME`.
  - [17] `showToast(content, ms, className)` (DOM 노드 허용), 층 토스트·검은 막 CSS. [18] `SCREENS.game` 의 `fade`, `updateTransition`, `params.pitch`, `floorLabelNode` (지도 제목도 이것으로 바꿈, CSS `.ug-map-floor` → `.ug-map-num`).
  - [21] `startDebugGame` 의 `&at=`, `debugRuntime()` 에 `renderer`. [22] `__TEST__` 에 7단계 이름 (4.7).
- `tools/selftest.mjs`: 테스트 2개 추가 → 총 30개. "층 이동 트리거" (지하 1·2·5·12·40·385층: 트리거 개수, 모든 도착 위치가 트리거 밖, 계단 앞 통로에서 진행 방향으로 충돌 처리하며 걸으면 진행도 0.80~0.81 에서 처음 발동, 포탈 옆 칸에서 걸으면 중심 2m 에서 발동), "층 런타임 스냅샷" (6.9 필드, 죽은 몬스터 제외, 위층 기록·저장 왕복). 처음 작성 때 "지하 1층에 내려와서 도착" 을 시험해 실패 → 지하 1층에는 위 계단이 없으므로 테스트를 고침 (코드 문제 아님).
- 결정 (문서에 없던 것): 층 이동 때 재사용 대기·버프·게임 시간은 유지하고 시선은 수평으로 되돌림. 연출 중 포인터 락이 풀려도 연출은 끝까지 진행. 지하 1층에서 위 계단 트리거가 생겨도 무시 (안전장치, 생성 규칙상 없음).
- 검증:
  - `node --check` 통과, selftest `PASS 30, FAIL 0, SKIP 0`, `npm test` (ESLint + Playwright e2e) 통과, 줄바꿈 CRLF 유지.
  - Playwright Chromium (SwiftShader) + `server.js`, 저장소 밖 임시 스크립트 2개, 44건 자동 확인, 실패 0, 콘솔 오류 없음:
    - `verify7.mjs` (33건): `#debug=game&floor=1&seed=3&at=stairsDown&fakeLock=1` 에서 SHIFT+W 로 실제로 걸어 내려감 → 진행도 0.811·높이 −4.87m 에서 시작 → 연출 중 TAB 무시·검은 막 불투명도 증가 → 지하 2층 (테마 바뀜) 위 계단 앞에서 계단을 등지고 시작·방문 칸 1개·트리거 밖, 위층 기록 (시드 3·백룸·방문 칸·빈 스냅샷), HUD `B2`·테마, 토스트 (숫자 `.ug-num`), 지도 탭 새 층. 위 계단으로 걸어 올라가기 → 지하 1층 시드·백룸·방문 칸 복원, 아래 계단 앞, 위층 기록 비움. 다시 내려가면 새 지하 2층 (U17). `wasInTrigger` 재발동 방지, 포탈 → 같은 층 번호·다른 테마·포탈 옆 칸, 포탈로 떠난 층은 기록 안 함. 오르내리기 6회 (`Math.random` 고정) 동안 geometries 1층 26 / 2층 27 로 같음 (4.6). `&at=` 5종 시작 시 층 이동 안 함.
    - `verify7b.mjs` (11건): 일반 게임 (슬롯 3) → 아래 계단 → 지하 2층 성소에서 [메인 메뉴] (저장) → 저장 데이터에 지하 2층·위층 기록·위치·시선 → 슬롯 요약 "지하 2층 · …" → 이어하기 → 같은 층·위치 → 위 계단 → 처음 지하 1층 (시드·백룸·방문 칸) 복원.
  - 처음 실행 때 B 이후가 실패 → 원인은 SwiftShader 에서 용암 테마가 초당 2~3프레임이라 게임 시간이 느리게 흘러 20초 제한을 넘긴 것 (8절 29번). 낮음 품질·대기 시간 연장 후 통과.
  - 스크린샷 직접 확인: 지하 2층 도착 (void, 토스트 "지하 층 B2 왜곡된 차원"), `&at=stairsUp` (brick 위 계단), `&at=portal` (lava 포탈), `&at=stairsDown` (void 아래 계단의 보라색 균열), `&at=boss`·`&at=merchant`.
- 사용자 확인 필요: 7-6 (0절에 방법).
- 다음 작업: 8-1 (몬스터. `snapshotFloorRuntime` / `restoreFloorRuntime` / `clearFloorRuntime` 에 연결하고, 층 교체 `swapFloor` 의 7번 "없으면 몬스터 새로 생성" 자리에 몬스터 생성을 넣는다)

### 2026-10-18 — 7-6 사용자 확인, 층 정보 저장 규칙 변경 반영 (문서만) (작업자: Claude Opus 5.5)

- 7-6: 사용자가 3가지 (내려가기 테마 변경, 다시 올라오기 복원, 포탈) 모두 동작 확인 → `[x]`.
- 사용자가 AGENTS.md "던전 구성요소" 끝에 층 정보 저장 규칙을 추가했다: 지나간 층의 지형 배치는 모두 저장, 다음 층도 미리 정해 저장 (내려가면 그 아래층까지), 올라갔다 다시 내려와도 초기화하지 않음, 포탈은 맨 위층까지 모든 층 초기화 ("초기화" = 테마·지형 배치를 다시 무작위로). 몬스터는 처음 문구 "현재 층만 저장" 을 질문으로 확인한 뒤 사용자가 "현재 층과 이전 층" 으로 고쳤다 (계단을 오가며 몬스터를 피하는 것 방지).
- 한 일 (코드는 바꾸지 않음):
  - AGENTS.md: 포탈 설명에 "이용하면 모든 층 초기화", 층 정보 저장 규칙 아래에 "이전 층" 의 뜻 (직전에 있던 층, 위·아래 모두)·목적·그 밖의 지나온 층은 몬스터 새로 생성·포탈 직후에는 이전 층 없음을 보충. "방랑 상인 판매 규칙" 첫 줄 (처음 진입할 때 생성, 다시 들어가면 재고·품절 그대로, 포탈로 초기화된 층은 새로), "던전 테마" (이웃한 층은 다른 테마, 지나온 층·미리 정한 층은 그대로, 몬스터는 현재·이전 층만, 포탈 초기화), "몬스터 > 생성 규칙" 첫 줄, "보스" 의 처치한 보스 문구 (몬스터를 새로 생성하는 경우에도 다시 안 나옴) 를 고쳤다.
  - 이 문서: 0절, 5절 U8·U16~U19 갱신 (U17·U18·U19 확정) + U24 (보스 층에서 포탈) 추가, 6.1 (`world.runtime` 추가, `history` 의 뜻, 저장하는 것), 6.9 (새 규칙), 6-6 메모, 7절 표·7-6 `[x]`·**7단계 보완 7-7 ~ 7-12 추가** (`applyFloorChange` 의사 코드, 방문 칸 압축, 현재 층 몬스터 저장, 테스트 기대값 변경 허용 범위, 브라우저 확인), 8-14·8-17, 15-x 상인 품절 메모, 16-4·16단계 체크 항목, 8절 28번 수정·30번 추가, 4.7, 부록 G 머리말 (옛 규칙 코드임을 표시).
- 결정 (문서에 없던 것, 5절): U16 (새 층은 이웃한 정해진 층의 테마를 뺌), U18 의 압축 방법 (방문 칸 비트열 base64, 7-8), U24 (보스 층 포탈 = 새 층이므로 보스 있음). 저장 형식은 필드를 더하기만 하므로 `SAVE_VERSION` 은 1 그대로 두고, 이전 형식 (다음 층 기록·`world.runtime` 없음, 기록 방문 칸이 배열) 도 읽는다 (7-7~7-10).
- 검증: 문서만 바꿈. AGENTS.md·PROGRESS.md 줄바꿈 CRLF 유지.
- 사용자 확인 필요: AGENTS.md 에서 고친 문구 (특히 "방랑 상인 판매 규칙" 첫 줄 — 지나온 층에 다시 가면 재고·품절이 그대로라는 해석), 5절 U16·U24.
- 다음 작업: 7-7

### 2026-10-18 — 7-7 ~ 7-11 (7단계 보완: 층 정보 저장 새 규칙) (작업자: Claude Opus 5.5)

- 사용자 확인: "방랑 상인 판매 규칙" 문구 (지나온 층에 다시 가면 재고·품절 그대로) 와 U24 (보스 층 포탈 = 새 층) 를 그대로 진행하라고 함 → U24 확정.
- 한 일 (`www/js/undergrounds.js`):
  - [09] `HISTORY_LIMIT` 삭제. `makeFloorRecord`, `ensureNextFloor`, 새 `applyFloorChange` (7-7 의사 코드), 방문 칸 압축 `encodeVisited` / `decodeVisited` / `isValidVisitedField` (`VISITED_CODE_RE`, `VISITED_CODE_MAX_SIDE`), `isValidRuntimeSnapshot`. `createNewGameState` 의 `world.runtime: null`. `serializeState` 는 현재 층 스냅샷을 저장 문자열에만, `deserializeState` 는 `world.runtime` 이 없으면 null. `isValidWorld` 에 `world.runtime`·기록 방문 칸 형식.
  - [13] `createGameRuntime` 이 처음에 `ensureNextFloor(state, Math.random)`, 끝에 불러오기면 `world.runtime` 복원 후 `state.world.runtime = null`. `snapshotFloorRuntime`·`swapFloor` 주석 갱신.
  - [22] `__TEST__` 에 `makeFloorRecord, ensureNextFloor, encodeVisited, decodeVisited`.
- `tools/selftest.mjs`: **AGENTS.md 규칙 변경에 따라 기대값을 바꿨다 (8절 21번의 예외, 7-10)**. 옛 "층 이동 기록 (위층 복귀 시 지도·테마 유지, 몬스터는 바로 위층만)" 테스트를 지우고 "층 이동 기록 (층 정보 저장 규칙, 7-7)"·"층 기록 불변 조건 (무작위 이동 2000번)" 으로 대신했다. "저장·불러오기 왕복" 의 `'위층 기록 2개'` → `'1,2,4'` (3개), 가짜 런타임에 몬스터·시체 목록. 새 테스트 "기록의 방문 칸 압축 (7-8)", "이전 형식 저장 데이터 (7-9)". → 테스트 총 33개.
- 결정 (문서와 다른 점): 7-9 의 설명은 `state.world.runtime` 에 스냅샷을 넣는 것이었는데, 저장한 뒤 플레이 중에 낡은 스냅샷이 state 에 남아 저장 문자열에만 넣도록 바꿨다 (7-9 메모).
- 검증:
  - `node --check` 통과, selftest `PASS 33, FAIL 0, SKIP 0`, `npm test` (ESLint + Playwright e2e) 통과, 줄바꿈 CRLF 유지.
  - 처음 selftest: 예상대로 옛 규칙 테스트 2개만 실패 ("현재 층과 아래층 기록은 없어야 함", "위층 기록 2개") → 7-10 에서 새 규칙으로 고침.
  - 압축 크기 측정: 512칸 층 방문 칸 배열 JSON 3,882자 → 373자, 512칸 모두 방문한 기록 1000개 = 저장 JSON 500,053 바이트.
  - Playwright Chromium (SwiftShader, 낮음 품질) 저장소 밖 임시 스크립트 `verify7c.mjs` 25건, 실패 0, 콘솔 오류 없음: 시작 시 지하 2층이 미리 정해짐 → 내려가면 그 시드·테마, 지하 3층 미리 정함, 지하 1층 기록 = 압축 방문 칸 + 빈 스냅샷 → 올라가면 지하 1층 복원·지하 2층이 이전 층 → 다시 내려가면 같은 지하 2층 (시드·테마·방문 칸) → 미리 정한 지하 3층 → 포탈 (같은 층 번호·새 테마·새 시드, 기록은 다음 층 하나) → 올라가면 처음과 다른 새 지하 2층. 일반 게임: 새 게임 즉시 저장에 지하 2층 기록·`world.runtime`, 플레이 중 `state.world.runtime` 은 null, 지하 2층 성소에서 저장 → 기록 `1,3` (지하 1층에 스냅샷) → 이어하기 → 올라가기·다시 내려가기 모두 같은 층.
  - 처음 실행 때 NG 2건: A9 (지하 2층 방문 칸 4 → 5칸) 은 떠날 때 순간 이동한 계단 칸이 방문 칸에 더해진 정상 동작 → 스크립트의 비교 시점을 고침. B2 (`state.world.runtime` 이 null 이 아님) 는 위 "결정" 의 코드 수정으로 해결.
  - 참고: 이번 확인 때 9806 포트에는 2026-10-18 00:31 에 시작된 `node server.js` (PID 25752, 사용자가 7-6 확인 때 띄운 것으로 보임) 가 이미 있어 그 서버를 그대로 썼다 (같은 `www`, no-cache). AI 가 띄운 서버는 `EADDRINUSE` 로 시작하지 않았고, 사용자 서버는 건드리지 않았다.
  - 스크린샷 확인: 포탈 → 위층 이동 직후 (void 지하 2층, 토스트).
- 사용자 확인 필요: 7-12 (0절에 방법).
- 다음 작업: 8-1

### 2026-10-18 — 7-12 사용자 확인, 8-1 ~ 8-16 (8단계) (작업자: Claude Opus 5.5)

- 7-12: 사용자가 2가지 (내려가기 → 올라가기 → 다시 내려가기에서 같은 층, 포탈 뒤 위층은 처음 보는 층) 모두 확인 → `[x]`.
- 한 일 (`www/js/undergrounds.js`):
  - [07] `computeDamage`, `monsterAttacker`, `ELEMENT_PCT_KEY`, `MONSTER_RES_MIN/MAX`.
  - [13] `grantExp`. 런타임 필드 (`noMonsters, flow, hurtAt, uiEvents, viewModel, swingT`), `createGameRuntime(state, arrival, { debug, noMonsters })` 에서 몬스터 생성/복원, `updateGame` 에 전투 갱신 순서 (사망 후 정지), `swapFloor` 7번 생성, `restoreFloorRuntime` 실제 복원, `clearFloorRuntime` 자원 해제.
  - [14] 생성 계획·상태 (`planFloorMonsters`, `createMonsterState`, `monsterRewardMuls`, `spawnFloorMonsters`), 외형 (`MONSTER_MODELS` 백룸 4종, `genericMonsterModel`, `getMonsterModel`, `ensureMonsterMesh`, HP 막대, `syncWorldVisuals`), AI (`updateMonsters`, 시야, 흐름장 길찾기, 돌아가기, 배회, 밀어내기, `knockMonster`), 백룸 특수 행동 (`MONSTER_BEHAVIORS`), `applyEffect` (빈 함수), 주인공 피격 (`hitPlayer`, `damagePlayer`), 몬스터 피격·처치 (`damageMonster`, `killMonster`, `rollMonsterDrops` 빈 함수), 시체 (`makeCorpse`, `applyCorpsePose`, `corpseFromRecord`), 투사체, 포자 구름 (`createGroundZone`), 골드 (`dropGold`, `updateDrops`), 떠오르는 글자, `spawnDebugMonster`.
  - [15] `updatePlayerActions`, `tryUseActiveSlot`, `useBasicAttack`, `meleeSweep`, `firePlayerBolt`, 화면 무기 (`syncViewModel`, `VIEW_MODEL_SHAPES`).
  - [03] 문구 (`hud.gold`, `game.levelUp`, `death.*`). [17] CSS (골드·피격·레벨 업 토스트·사망 화면). [18] `SCREENS.game` (카메라를 장면에 추가, `updateFeedback`, `showDeath`, `levelUpNode`, 디버그 옵션). [19] HUD 골드. [21] `startDebugGame` 의 `&monster`·`&elite`·`&noMonsters`·`debugOpts`. [22] `__TEST__` (4.7).
- `tools/selftest.mjs`: 테스트 6개 추가 → 총 39개 ("피해 계산", "경험치·레벨업", "몬스터 배치 계획", "몬스터 상태·보상 배수", "몬스터 길찾기", "몬스터 투사체"). 처음 작성한 "몬스터 길찾기" 가 성소 3×3 의 모서리 칸으로 가는 경로를 기대해 실패 → 모서리 칸은 다른 성소 칸을 거쳐야만 닿으므로 경로가 없는 것이 맞아, 통로와 붙은 성소 칸으로 고치고 모서리 칸은 "경로 없음" 을 확인하도록 바꿈 (코드 문제 아님).
- 결정 (문서에 없던 것, 5절): U25 (성소 안 주인공은 감지·공격 안 함), U26 (백룸 외 몬스터는 10단계까지 임시 외형·공통 행동). 그 밖: 길찾기는 흐름장 (주인공 칸 BFS 1회), 48m 밖 대기 몬스터는 갱신 안 함, 메시는 80m 안에 들어올 때 생성, 돌아가는 중에는 다시 감지 안 함, 근접 사거리는 중심 거리 ≤ 사거리 + 주인공 반지름, HUD 에 골드 표시, 카메라를 장면에 추가 (화면 무기).
- 검증:
  - `node --check` 통과, selftest `PASS 39, FAIL 0, SKIP 0`, `npm test` (ESLint + Playwright e2e) 통과, 줄바꿈 CRLF 유지.
  - AGENTS.md 밸런스 목표 (자체 테스트): 그림자 Lv1 을 기본 공격 4회에 처치 (목표 4~6), 주인공은 그림자 공격을 13회 버팀 (목표 10~15).
  - Playwright Chromium (SwiftShader, 낮음 품질) + `server.js`, 저장소 밖 임시 스크립트 2개 46건, 실패 0, 콘솔 오류 없음:
    - `verify8a.mjs` (12건): 지하 1층 몬스터 38마리 (= round(128 × 0.3))·백룸 4종·성소 구역 안 0마리·가까운 것만 3D, `&monster=` 4종, 다른 테마 4종 생성.
    - `verify8b.mjs` (34건): 그림자 감지·추적·근접 피격 (HP 100 → 92.1, 가장자리 붉게) → 우클릭 연속 공격으로 처치 → 시체 (옆으로 눕힘)·경험치 12.75·동전 / 경험치 79 에서 처치 → Lv2·HP 회복·토스트 "레벨 업! / Lv / 2" / 마네킹: 보는 동안 위치 그대로 → 등을 돌리면 7m 다가옴 → 다시 보면 멈춤 / 형광등: 전격 투사체·명중·떠 있는 높이 1.6m / 카펫 덩어리 처치 → 포자 구름 → 독 피해 → 4초 뒤 사라짐 / 성소: 추적하던 그림자가 성소에 못 들어오고 성소 안 주인공 피해 0, 돌아감 / 층 이동: 지하 1층 38마리 (한 마리 HP 절반·시체 1구) → 지하 2층 39마리 → 올라오면 지하 1층 몬스터·HP·시체 그대로 → 다시 내려가면 지하 2층 그대로 → 두 층 떨어졌다 돌아온 지하 1층은 새 몬스터·시체 없음 / 일반 게임 저장·이어하기 → 몬스터 38마리 종류·위치·HP 그대로 / HP 1 에서 맞아 "쓰러졌습니다" (게임 정지, TAB 무시) → [마지막 저장에서 다시 시작] → HP 100·몬스터 복원 / 디버그 게임 사망 → [다시 시작] / 몬스터 3마리 처치 뒤 텍스처 수 6 → 7 (공유 텍스처 1개만 늘고 HP 막대·숫자 텍스처는 정리됨).
  - 스크린샷 직접 확인: 4종 외형 (그림자 반투명·흰 눈, 마네킹 얼굴 없음, 형광등 부유·전선, 카펫 덩어리·곰팡이), 시체·동전·피해 숫자, 포자 구름, 사망 화면. 화면 무기 (쇠파이프) 가 처음에는 세로로 크게 보여 손잡이 기준 방향 벡터로 자세를 다시 잡았다 (`VIEW_GRIP`, `VIEW_BASE_QUAT`).
- 사용자 확인 필요: 8-17 (0절에 방법), 5절 U25·U26.
- 다음 작업: 9-1

### 2026-10-18 — 9-1 ~ 9-9 (9단계) (작업자: Claude Opus 5.5)

- 사용자 요청: "테스트는 나중에 몰아서 하자" — 사용자 확인 항목은 0절에 남겨 두고 단계를 계속 진행한다.
- 한 일 (`www/js/undergrounds.js`):
  - [06] `STATUS_ICON`, `BLEED_DEFAULT_DOT_PCT`. [07] `calcDerivedStats` 가 주인공 둔화를 이동·공격 속도에 반영.
  - [13] `g.player` 에 `isPlayer, effects, statusImmune, moving`. `updateGame` 에 `updatePlayerStatus`. 빙결·기절이면 이동·점프 불가.
  - [14] 빈 함수였던 `applyEffect` 를 실제 구현 (순수 함수) + `tickEffects`, `effectMagnitude`, `isDisabled`, `applyStatusToPlayer`, `applyStatusToMonster`, `updatePlayerStatus`, `addBuff`, `tickBuffs`, `tickMonsterStatus`, `monsterSpeed`. `hitPlayer` (감전 반영, 상태이상 연결), `damagePlayer(g, n, quiet)`, `damageMonster` (감전 반영), `resolveMeleeHit` (`attack.stun` → 기절), `updateMonster` (빙결·기절·공포·둔화), 배회·돌아가기 속도.
  - [15] `tryUseActiveSlot` 은 빙결·기절이면 false. [17] 아이콘 CSS. [19] `updateHudEffects`. [22] `__TEST__` (4.7).
- `tools/selftest.mjs`: 테스트 3개 추가 → 총 42개. 8단계 "몬스터 투사체" 테스트의 가짜 주인공에 `effects: []` 를 더함 (9단계에서 `hitPlayer` 가 주인공의 감전을 읽게 되어 준비물이 런타임 구조를 따라가야 했음, 기대값은 그대로).
- 결정 (문서에 없던 것): U27 (몬스터 출혈의 초당 피해 = 원래 피해의 10%). 지속 피해는 다시 방어·저항을 거치지 않고 받는 피해 % 만 곱함. 둔화가 겹치면 시간·크기 모두 큰 쪽. 지속 피해는 화면 가장자리를 붉게 하지 않음. 버프는 성소에 들어가도 유지.
- 검증:
  - `node --check` 통과, selftest `PASS 42, FAIL 0, SKIP 0`, `npm test` 통과, 줄바꿈 CRLF 유지.
  - Playwright Chromium (SwiftShader, 낮음 품질) + `server.js`, 저장소 밖 임시 스크립트 `verify9.mjs` 17건, 실패 0, 콘솔 오류 없음: 카펫 덩어리 근접 공격으로 중독 → 지속 피해 (화면 붉게 안 함) / HUD 아이콘 "화, 중×3, 둔, 감 + 둥근 버프" 와 남은 초 (`.ug-num`) / 버프 수정자 반영, 둔화로 걷기 3.64 m/s / 성소에 들어가면 상태이상 해제 (버프 유지), 성소 안에서는 안 걸림 / 빙결 중 W 무시 → 풀리면 5.20 m/s, 둔화 30% → 3.64 m/s / 기절 중 공격 불가 → 풀리면 공격 / 몬스터: 빙결 정지, 공포 도망 (9m → 15.3m), 화상 지속 피해로 처치 → 경험치·시체 / 버프 아이콘이 시간이 끝나면 사라짐 / 바위 골렘 (임시 외형) 근접 공격 → 주인공 기절.
  - 스크린샷 직접 확인: HUD 오른쪽 위 상태이상·버프 아이콘.
- 사용자 확인 필요: 0절 (9단계 상태이상은 8-17 과 함께), 5절 U27.
- 다음 작업: 10-1

### 2026-10-18 — 10-1 ~ 10-7 (10단계) (작업자: Claude Opus 5.5)

- 사용자 요청: "AGENTS.md, PROGRESS.md 를 읽고 10단계도 진행해 줘". 사용자 확인 (10-8) 은 0절에 남기고 진행 (사용자 확인은 나중에 몰아서).
- 한 일 (`www/js/undergrounds.js`):
  - [14] 외형: 판타지 벽돌벽·동굴·용암·왜곡된 차원 16종 + 보스 5종 `MONSTER_MODELS`, 공용 도형 (반구·고리·반원·삼각 날개), 정예 금색 테두리·이름표 (`addEliteOutline`, `monsterDisplayName`, `updateMonsterHpBar`).
  - [14] 행동: 예비 동작을 근접·범위·광선 공통으로 (`resolveWindup` → `resolveMeleeHit` / `resolveAura` / `fireBeam`), 훅 `onChase`·`onAttack`·`modifyDamage` 추가, 특수 행동 9종 (6.8·10-1), 예약 행동 `monsterSchedule`, 투사체 확장 (`launchMonsterShot`, 유도·수명·모양·`onPlayerHit`), 연출 (`spawnPuff`·`spawnRing`·`spawnBeamFlash`·`spawnFlameBreath`·`spawnFallingRock`), 공격 판정은 `g.monsters` 사본을 돈다.
  - [14] 생성: `eliteChance`·`planFloorMonsters` 정예, `planNestMonsters` 둥지, `planBoss` 보스, `spawnFloorMonsters` 가 셋을 만든다. 작은 개체 (`small`, `SMALL_MUL`, 보상 `SPLIT_CHILD_REWARD_MUL`).
  - [14] 보스: 구역 (`bossZoneOf`·`attachBossZone`, `moveMonsterBy` 범위 제한), 실행기 (`updateBoss`·`startBossFight`·`bossWalkHome`·`updateBossDash`·`onBossDefeated`), 패턴 표 `BOSS_PATTERNS` (5종 15패턴), 예고 `showTelegraph`, 소환 `summonMinions`, HP 단계 `bossHpMarkReached`. 보스는 밀리지 않는다 (`separateMonsters`).
  - [13] 주인공 넉백·중력 당김 (`knockPlayer`, `applyForcedMovement`, `player.knock`·`player.pull`, 층 이동 때 해제), 런타임 `bossFight`, 스냅샷의 `small`, 복원 때 보스 구역·처치 기록 확인. `applyStatusToPlayer` 는 `opts.resPct` 를 받는다 (U32).
  - [15] 화면 무기 재질을 반투명 목록으로 (8절 32번). [03] 문구 (`monster.elite`, `combat.block`, `combat.stunned`, `game.bossDefeated`). [17] CSS (보스 HP 막대, 보스 토스트, `.ug-pull`). [18] `SCREENS.game` (중력 당김 화면, 보스 처치 토스트 `bossDefeatedNode`). [19] `updateHudBoss`. [22] `__TEST__` (4.7).
- `tools/selftest.mjs`: 테스트 6개 추가 → 총 48개 ("정예 확률·공터 둥지 배치", "보스 배치·공터 구역", "작은 개체·런타임 스냅샷", "광선·부채꼴·보스 HP 단계 판정", "외형·특수 행동·보스 패턴 표", "유도 투사체"). 기존 테스트의 기대값은 고치지 않았다 (스냅샷의 `small` 은 작은 개체만 넣어 기존 형식 유지).
- 결정 (문서에 없던 것, 5절): U28 (특수 행동 세부값, 포자 구름은 버섯 자리), U29 (보스 패턴 세부값), U30 (정예 표시), U31 (둥지 세부), U32 (거미줄 둔화는 저항 무시). U26 해결.
- 검증:
  - `node --check` 통과, selftest `PASS 48, FAIL 0, SKIP 0`, `npm test` (ESLint + Playwright e2e) 통과, 줄바꿈 CRLF 유지.
  - Playwright Chromium (SwiftShader, 낮음 품질) + `server.js`, 저장소 밖 임시 스크립트 `verify10.mjs` 100건, 실패 0, 콘솔 오류 없음: 백룸 4종 회귀 (그림자 명중·형광등 투사체·마네킹 멈춤/접근·카펫 포자 구름) / 오크 넉백 2.00m / 바위 골렘 기절 / 주술사 자기 회복·화염구 (착탄 반경) 명중 / 박쥐 높이 1.70~2.94m·공격 후 물러남 / 거미줄 둔화 50% (피해 없음) / 포자 구름 (버섯 자리)·중독·죽을 때 폭발 피해 / 임프 4m 순간이동·재사용 10초 / 슬라임 분열 2마리 (HP ×0.4·크기 ×0.6·보상 ×0.315)·작은 것은 분열 안 함 / 흑요석 골렘 충격파 (근접 범위 밖) / 도롱뇽 숨결 화상 / 공허의 눈 조준선 → 광선 명중·둔화 → 조준선 숨김 / 추적자 보라 연기 → 등 뒤 2.6m·다음 8초 / 해파리 밝아짐 → 펄스 / 수호상 막기 / 지하 5층: 보스 1마리 (공터 중심·구역·Lv6)·시작 위치는 전투 아님·둥지 (5·6마리, 정예 포함) / 보스 5종: 구역에 들어오면 HP 막대 (이름·수치), 패턴 15종 모두 실행, 정전 밝기 0.05·그림자 소환·종이 / 궁수 4마리 (66%·33%)·돌진 / 새끼 거미·거미줄 지대 / 임프·용암 웅덩이 / 중력 당김·유도 구체 / 구역 밖 10초 → 돌아감·HP 막대 숨김·회복 / 용암 군주 처치 → 처치 기록·토스트·막대 제거 / 계단으로 6층 갔다 돌아오면 보스 HP·정예 수·몬스터 수 그대로, 보스 처치 후 7층까지 갔다 돌아와 몬스터를 새로 생성해도 보스 없음.
  - 처음 실행 때 NG 들: 대부분 검증 스크립트 문제 (레벨을 올린 뒤 HP 를 안 채움, 강한 주인공이 한 방에 처치, 재사용 0 인 패턴 감지, 같은 프레임에 명중해 사라진 투사체 — 8절 34번). 코드 문제로 고친 것: 분열한 새끼가 같은 휘두르기에 맞음 (8절 31번), 보스가 "4m 안" 패턴 거리 밖에서 멈춤 (8절 33번), 둥지 첫 자리를 못 찾으면 정예가 빠질 수 있음 (처음 놓인 한 마리를 정예로), 보스 HP 수치 반올림 (`1052 / 1051`), 예고 표시가 화면 무기를 덧칠 (8절 32번), 박쥐 날개가 조명 각도에 따라 안 보임 (약한 자체 발광).
  - 스크린샷 직접 확인 (`shots10.mjs`·`shots10b.mjs`): 16종 + 보스 5종 외형, 정예 3종 (금색 테두리·"정예 …" 이름표), 보스 HP 막대, 예고 표시 6종 (결재 도장 원·철퇴 부채꼴·돌진 선·화산탄 원·거미줄 폭탄 원·차원 균열 원).
  - 9806 포트에 사용자 서버가 없어 AI 가 `node server.js` 를 띄워 확인하고 끝난 뒤 종료했다.
- 사용자 확인 필요: 10-8 (0절에 방법), 5절 U28~U32.
- 다음 작업: 11-1

### 2026-10-22 — 몬스터 배회 (사용자 지시), 11-1 ~ 11-3 (11단계) (작업자: Claude Opus 5.5)

- 사용자 요청: "AGENTS.md, PROGRESS.md 를 읽고 다음 단계 진행해 줘 (몬스터의 행동은 테마가 아닌 몬스터마다 달라야 하고, 일단 정예와 보스는 나중에 구상예정, 기본 몬스터들은 주변 10칸 내에서 배회하다 플레이어가 보이면 접근해 공격하는 패턴으로 구현해줘)". 1절 1번에 따라 사용자 지시를 먼저 반영하고 11단계를 진행했다. AGENTS.md 는 고치지 않고 5절 U33 에 기록.
- 판단: 특수 행동·공격 방식은 10단계부터 이미 몬스터마다 (`MONSTER_BEHAVIORS[id]`, 공격 데이터) 였고, 모두 같았던 것은 대기 중 "생성 칸 안 배회" 뿐이라 이것을 몬스터별 방식으로 바꿨다. 정예·보스는 "나중에 구상" 이므로 바꾸지 않았다 (보스는 배회 없음, 정예는 일반 몬스터와 같은 AI 라 그 종류의 배회를 그대로 따른다).
- 한 일 (`www/js/undergrounds.js`):
  - [14] 배회 (U33): `MONSTER_WANDER` (19종, 같은 테마 안에서도 모두 다름), `monsterWander`·`planWanderLeg`·`setWanderGoal`·`wanderSpot`, 범위 `wanderArea`/`wanderAreaCells` (`WANDER_RANGE_CELLS = 10`), 무리 `wandersAsPack`·`wanderLeaders`·`wanderLeaderOf`, 길찾기 공용 `cellBfs`·`pathFromPrev`·`pathWaypoint` (`cellDistances`·`findCellPath`·`monsterReturn` 이 씀). `alertGroup` 이 추적 시작 자리 (`home`) 를 기억, `startReturn`/`monsterReturn` 은 그리로 (`returnTarget`). `updateMonsters` 가 48m 밖 대기 몬스터도 0.25초마다 배회만 (`FAR_WANDER_STEP`). 런타임 몬스터 `nest` (+ 스냅샷), 분열한 슬라임은 부모의 `nest` 를 이어받음. `MONSTER_WANDER_SPEED` 삭제.
  - [13] `STAT_IDS`, `spendStatPoint`. [20] 스테이터스 탭 (`statusTabModel`, `renderStatusTab`, `statusHead`, `statusSection`, `statusStatRow`, `fmtInt`, `fmtPct`, `RES_COLORS`). [17] CSS `.ug-status-*`. [03] 문구 `status.*`, `stat.*`, `unit.*`, `res.*` (한국어·영어). [21] `debugSetLevel`, 디버그 해시 `&level=`·`&skills=all`. [22] `__TEST__` (4.7).
- `tools/selftest.mjs`: 테스트 6개 추가 → 총 54개 ("몬스터별 배회 방식 표", "배회 범위", "배회" (가짜 런타임으로 900초: 범위 밖으로 안 나감·4칸 이상 돌아다님·고블린 무리 32m 안·둥지는 공터 안·`nest` 스냅샷 왕복), "스테이터스 탭 표시 값", "스탯 포인트 사용·디버그 레벨", "다국어 키 (한국어·영어 같은 키)"). 기존 테스트의 기대값은 고치지 않았다. 처음 작성한 "배회 범위" 는 지하 1층 시드 3 에 둥지가 없어 실패 → 둥지 확인을 세 층 합계로 바꿈 (테스트 가정 문제, 코드 문제 아님).
- 결정 (문서에 없던 것, 5절): U33 (배회 세부, 10칸 범위는 사용자 확정), U34 (스테이터스 표시 자릿수).
- 검증:
  - `node --check` 통과, selftest `PASS 54, FAIL 0, SKIP 0`, `npm test` (ESLint + Playwright e2e) 통과, 줄바꿈 CRLF 유지.
  - Playwright Chromium (SwiftShader, 낮음 품질) + `server.js`, 저장소 밖 임시 스크립트 `verify11.mjs` 49건, 실패 0, 콘솔 오류 없음: 스테이터스 탭 Lv1 값 (HP 100 / 100, 물리 공격력 7, 공격 간격 0.76초, 치명타 6.5%, 걷기 5.2 m/s, 방어력 3, 감소율 4.8%, 화염 0.0% / 75.0%)·숫자 글꼴 D2Coding·글자 Pretendard·넘침 없음 / 포인트 0 에서 [+] → 툴팁, 값 그대로 / `&level=20` → 포인트 19·19, [+] 3번 → 26·25·24, 남은 16, 최대 HP 404 → 416 (`g.derived`·HUD 즉시) / 영어 + `&skills=all` → 이름·원소 저항 3.0%·넘침 없음 / 배회 (게임 시간 120초를 `updateMonsters` 로 흘림): 벽돌벽 6층 49마리·동굴 9층 42마리 모두 칸을 옮김 (48m 밖도), 범위 밖 0, 둥지는 공터 안에서 움직임, 포자 버섯 9마리는 제자리 / 오크: 노릴 수 없으면 배회 → 보이면 추적·공격 (HP 100 → 74) → 안 보이면 4초 뒤 돌아가기 → 추적을 시작한 자리 (0.55m) 에서 대기 → 다시 배회.
  - 스크린샷 직접 확인 (한국어 Lv1·Lv20, 영어 Lv20). 처음에는 "같은 레벨 몬스터의 공격 기준" 안내가 막기 확률 아래에 있어 감소율 바로 아래로 옮김 (행의 `hint`).
  - 9806 포트에 사용자 서버가 없어 AI 가 `node server.js` 를 띄워 확인하고 끝난 뒤 종료했다.
- 사용자 확인 필요: 11-4 (0절에 방법), 5절 U33 (임시 결정 부분)·U34.
- 다음 작업: 12-1

### 2026-10-22 — 11-4 사용자 확인 (문서만) (작업자: Claude Opus 5.5)

- 사용자: "직접 확인사항 둘 모두 확인했어. 스테이터스 찍힘 및 그에 따라 스탯 변경이 확인됐고 몬스터도 조우됐어. 일단 이 부분은 문서에만 반영해줘".
- 반영: 11-4 `[x]`, 0절 "사용자 확인 대기" 에서 11-4 (스테이터스 탭·몬스터 배회) 항목 삭제, 5절 U33 에 확인 사실 기록 (세부 ①~⑦ 은 하나씩 확정된 것이 아니므로 상태는 "일부 확정" 그대로). U34 (표시 자릿수) 는 따로 언급이 없어 미확인 그대로.
- 코드 변경 없음.
- 다음 작업: 12-1

### 2026-10-24 — 12-1 ~ 12-9 (12단계) (작업자: Claude Opus 5.5)

- 사용자 요청: "AGENTS.md, PROGRESS.md 를 먼저 읽고 다음 작업 진행해 줘". 12-10 (사용자 확인) 은 0절에 남기고 진행 (사용자 확인은 나중에 몰아서).
- 한 일 (`www/js/undergrounds.js`):
  - [05] `AFFIX_PREFIX` (17종), `RARE_NAME_FIRST`·`RARE_NAME_SECOND` (각 14개), `CONSUMABLE_DESC` (21종 ko/en), `CONSUMABLE_COLORS`·`CONSUMABLE_ITEM_COLORS`.
  - [07] `equipPrice`·`equipSellPrice` (`STARTER_SELL_PRICE`, `EQUIP_SELL_RATE`). `computeDamage` 의 kind `'item'` (물리·마법 % 제외). `calcDerivedStats` 가 버프의 `staminaRegenMul` 을 곱한다.
  - [09] `isValidItem` 이 등급·이름·부가 옵션·각인까지 검사 (`isValidAffix`).
  - [13] `spendStamina` 가 `noStaminaCost` 버프면 소모하지 않음, `updateGame` 에 `updateRecall`, 런타임 `recall`, `swapFloor` 가 귀환 취소, 바닥 아이템 복원 검사 `isValidDropItem`.
  - [14] `rollMonsterDrops` (빈 함수였음) 구현, 바닥 상자 모양 (`itemColor`, `dropMat`, `syncDropVisual`), `updateDrops` 장비·소모품 줍기·가득 참 안내, 투사체 중력·수평 거리 제한·`onImpact`, `damagePlayer` 가 피격 시 귀환 취소.
  - [15] `tryUseActiveSlot` 소모품 사용 (12-8), `VIEW_MODEL_SHAPES` 도형·발광 (12-9).
  - [16] 장비 생성 (`generateEquipment`·`rollEquipTier`·`equipRarityWeights`·`rollAffix`·`rollEngraving`·`affixPrefix`), 인벤토리 조작 (`addItem`·`removeItemAt`·`consumeConsumable`·`equipItem`·`unequipItem`·`moveInventoryItem`·`setActionSlot`·`swapActionSlots`), 드롭 계획 (`planMonsterDrops`·`rollConsumableId`), 소모품 (`useConsumable`·`CONSUMABLE_HANDLERS`·`healPlayer`·`throwItem`·`throwImpact`·`monstersInBlast`·`updateRecall`·`cancelRecall`·`recallDestination`).
  - [17] CSS `.ug-inv-*`, `.ug-item*`, `.ug-item-pop*`, `.ug-item-menu*`, 줍기 토스트, `.ug-hud-cast*`. [18] `SCREENS.game` 이 `pickup`·`toast` 이벤트를 토스트로 (`pickupNode`), `&drops=1`. [19] HUD 귀환 시전 막대. [20] 인벤토리 탭 (아이콘·칸·드래그·팝업·상세 정보, 12-6). [21] 디버그 `&items=1` (`debugFillInventory`)·`&drops=1` (`spawnDebugDrops`). [03] 문구 `inv.*`·`item.*`·`equipSlot.*`·`itemType.*`·`itemCat.*`·`consTier.*`·`affix.*` (한국어·영어). [22] `__TEST__` (4.7).
- `tools/selftest.mjs`: 테스트 6개 추가 → 총 60개 ("장비 생성", "장비 가격", "인벤토리 조작", "드롭 계획·바닥 아이템 기록", "소모품 효과", "상세 정보 문구·디버그 인벤토리"). 기존 테스트의 기대값은 고치지 않았다. 새 테스트를 처음 돌렸을 때의 실패 2건은 테스트 작성 실수였다: 지하 10층 단계 비율을 1단계 40% 로 적음 (12-1 규칙은 없는 단계의 확률을 가장 높은 단계에 → 2단계 70%·1단계 30%), 장비 재료를 만드는 `makeEquipInstance` 가 같은 상태의 uid 를 써서 uid 기대값이 어긋남 (재료는 다른 상태에서 만들도록 고침).
- 결정 (문서에 없던 것, 5절): U35 (소모품 사용 세부), U36 (드롭·줍기·인벤토리 세부).
- 검증:
  - `node --check` 통과, selftest `PASS 60, FAIL 0, SKIP 0`, `npm test` (ESLint + Playwright e2e) 통과, 줄바꿈 CRLF 유지 (작업 중 `sed -i` 로 LF 가 되어 node 로 되돌림 — 8절 35번).
  - Playwright Chromium (SwiftShader, 낮음 품질) + `server.js`, 저장소 밖 임시 스크립트 `verify12.mjs` 35건, 실패 0, 콘솔 오류·경고 없음: 인벤토리 40칸·장착 7칸·행동 슬롯 7칸·사용 칸 "33 / 40"·숫자 D2Coding / 글자 Pretendard / 우클릭 상세 정보 (희귀: 이름·판매가·아이템 레벨)·밖을 누르면 닫힘·길게 누르기 (소모품 설명) / 요구 레벨 미달 토스트·클릭 장착 (원래 무기는 그 칸, 물리 공격력 변화)·장착 칸 클릭 해제 / 드래그 6종 (장비 → 장착 칸, 장착 칸 → 지정 칸, 소모품 → 행동 슬롯, 장비 → 행동 슬롯 실패 토스트, 행동 슬롯 → 바깥 해제, 행동 슬롯끼리·인벤토리 칸끼리 교환) / 소모품 메뉴 [사용] (개수 −1·HP 회복)·[7] 등록 / 영어 상세 정보·넘침 없음 / 바닥 아이템 6개 자동 줍기 (물약은 기존 칸에 합침, 골드 25)·"획득" 토스트·가득 차면 안내 / 보스 처치 → 장비 2 + 소모품 3·스냅샷 포함 / 화염병 포물선 → 오크 명중 폭발·화상·불타는 지면·개수 감소 / 귀환 주문서 시전 막대 → 3초 뒤 성소 구역·1개 소모, 그림자에게 맞으면 취소 (소모 안 됨)·토스트.
  - 처음 실행 때 NG 6건은 모두 검증 스크립트 문제였다 (async 조건 함수가 기다리지 않음, 짧은 우클릭 사이에 프레임 없음, 물약이 기존 칸에 합쳐지는 것을 셈에 넣지 않음 — 8절 36번). 게임 코드는 고치지 않았다.
  - 스크린샷 직접 확인: 인벤토리 (한국어·영어), 희귀 장비·소모품 상세 정보, 소모품 메뉴, 바닥 상자 (등급·분류 색)·동전, 보스 드롭, 화염병 폭발·불타는 지면, 귀환 시전 막대, 화면 무기 (강철 장검·견습생 지팡이·대검).
  - 9806 포트에 사용자 서버가 없어 AI 가 `node server.js` 를 띄워 확인하고 끝난 뒤 종료했다.
- 사용자 확인 필요: 12-10 (0절에 방법), 5절 U35·U36.
- 남은 문제: 장비·소모품을 버리는 기능 없음 (AGENTS.md 에 없음, 0절 알려진 문제).
- 다음 작업: 13-1

### 2026-10-24 — AGENTS.md 변경 (두 주인공) 반영 (문서만) (작업자: Claude Opus 5.5)

- 사용자: "AGENTS.md 내용 상당수를 변경했어. '주인공 초기 스테이터스와, 스테이터스별 실제 게임 적용 수치' 단락 및 그 아래쪽은 수정하지 않았으니, 이 단락 위쪽 내용을 다시 읽고 아래쪽 내용 및 PROGRESS.md 에 반영해 줘" → 작업 중 "AGENTS.md 일부 내용 추가로 수정했으니 다시 읽고 진행해 줘" (플래시: 신규 획득 불가·행동 슬롯에 장착된 채 시작·빛은 부채꼴 범위).
- AGENTS.md 위쪽의 변경 (`git diff` 로 확인): 두 세계관 ("마틴" = RPG, "에릭" = 공포 게임), 빈 슬롯에서 주인공 선택 (기본 마틴), "던전 구성요소 (공통)" — 계단 → 엘리베이터, 복도 개수 제한 없음, 포탈·상인은 마틴만, 에릭의 성소는 지하 1층에 1곳만, 새 단락 "던전 특징 (에릭)" (캐비닛·서랍형 장롱·플래시·배터리·어둠·플래시 불빛 시야), "에릭 특별 규칙" (레벨업·공격 없음, 보스급 1~2기 배회·추적·4초 해제·캐비닛·엘리베이터, 노이즈 3단계), 스테이터스·스킬 탭은 에릭에게 없음, 스킬 탭에서 행동 슬롯 등록.
- AGENTS.md 아래쪽에 반영 (사용자 요청 범위, 새 수치는 만들지 않고 위쪽 문구를 옮기거나 마틴 전용임을 밝힘): 스테이터스 수치 단락 = 마틴 기준 + 계단 → 엘리베이터, 초기 상태에 에릭의 시작 소지품, 스킬 = 마틴 전용, S5 Lv5 엘리베이터, 아이템 단락에 "에릭 전용 아이템" (플래시·배터리 표), 전지의 주문서 엘리베이터, 방랑 상인 = 마틴 전용, 던전 테마의 포털 = 마틴만, 몬스터 단락에 에릭 규칙 요약과 "마틴 규칙" 범위, 생성 규칙의 계단 → 엘리베이터 (2곳). 위쪽 71행의 "계단을 오가며" 는 요청 범위 밖이라 그대로 두었다 (엘리베이터로 읽음, 0절에 확인 요청).
- 이 문서: 0절 (현재 상태·다음 작업·확인 요청·알려진 문제), 3.5 (`&hero=eric`, `&fps=1` → 20단계), 4.3 (주인공 id, 계단 → 엘리베이터 용어와 코드 id 유지), 4.7 (이후 단계 이름), 5절 U37 ~ U48 추가·U4 (20단계)·U15 (공통) 고침, 6.1·6.3 (예정 필드), 7절 단계표 + 16 ~ 19단계 새로 (16 공통: 주인공 선택·엘리베이터·버리기 / 17 에릭 던전·캐비닛·서랍장 / 18 에릭 플래시·어둠·화면 / 19 에릭 몬스터·노이즈), 옛 16단계 마무리 → 20단계 (20-1 ~ 20-8, 최종 점검 목록에 주인공 선택·엘리베이터·에릭 규칙 추가), 13·14·15단계에 "마틴 전용" 표시, 13-5 에 스킬 탭 행동 슬롯 등록 문구, 14-5 S5.
- 결정 (5절, 모두 미확인): U37 (엘리베이터 구현 — 조각 구조·코드 id 유지, 바닥 평평), U38 (주인공 선택 UI·`hero`), U39 (에릭 던전 생성), U40 (캐비닛·서랍장 세부·내용물), U41 (플래시·배터리 데이터·누르는 순간에만 토글), U42 (어둠 거리 — 1칸 = 16m 이면 마틴보다 밝아지는 문제, 사용자 확인 필요), U43 (에릭 몬스터: 테마 보스 1~2기·레벨 1 고정·근접 공격·속도), U44 (시야 판정), U45 (노이즈 불투명도), U46 (에릭 상태·화면: HP 100·장비 없음·HUD), U47 (에릭은 지하 1층 성소에서만 저장 — 사용자 확인 필요), U48 (아이템 버리기).
- 코드 변경 없음 (`www/js/undergrounds.js`, `tools/selftest.mjs` 그대로). AGENTS.md·PROGRESS.md 줄바꿈 CRLF 유지 확인.
- 다음 작업: 13-1 (사용자가 에릭·엘리베이터를 먼저 하라고 하면 16단계부터)

### 2026-10-24 — AGENTS.md 두 번째 수정 반영 (문서만) (작업자: Claude Opus 5.5)

- 사용자: "에릭은 어둠 범위 부분을 수정했어. (2칸) (에릭의 경우 범위를 벗어난 어둠 영역은 지형까지 잘 안보일 정도로 어두워야 해.) 저장 관련 내용도 수정해서 '엘리베이터 내부' 도 저장 가능 영역에 추가했어. 그리고 에릭 플레이 시 몬스터의 공격은 1방에 주인공을 바로 사망시킬 수 있는 위력이 되어야 해. 이외 수정된 내용 확인해 문서에 다시 반영해 줘".
- AGENTS.md 위쪽의 바뀐 곳 (`git diff` 로 확인): 어둠 "앞 3칸" → "앞 2칸", 시스템 탭 [메인 메뉴] 의 저장 조건에 "엘리베이터 내부" 추가, 71행 "계단을 오가며" → "층을 오가며". 시스템 탭 [저장] 버튼 줄은 "성소 영역에서만 활성화" 그대로라 사용자 말씀대로 엘리베이터 내부도 포함해 읽었다 (0절에 확인 요청).
- AGENTS.md 아래쪽: "에릭 전용 아이템" 의 플래시 설명에 2칸·"지형까지 잘 안 보일 정도로 어둡게", "몬스터" 단락의 에릭 문구에 "공격은 한 번에 주인공을 사망시킬 수 있는 위력" (대화로 받은 요구를 사양서에 옮김).
- 이 문서: 0절 (확인 요청 목록 갱신), 5절 U37 (엘리베이터 내부 = 저장 가능 영역이 되어 "걸어 들어가면 이동" → "안쪽 버튼 판 클릭으로 이동"), U40 (서랍 내용물에서 생명력 물약 뺌), U42 (일부 확정: 2칸 / 10칸 / 7칸 / 20칸·범위 밖 아주 어둡게, 조명으로 범위를 만드는 구현안), U43 (일부 확정: 한 방에 사망, 레벨·수치는 쓰지 않음, 엘리베이터 안 주인공은 노리지 않음), U44 (시야 거리 2칸), U46 (HUD 에서 HP 막대도 숨김), U47 (일부 확정: 저장 가능 영역 = 성소 구역 또는 엘리베이터 내부, 마틴·에릭 공통). 7절 16단계 (16-3·16-4 고침, 16-5 저장 가능 영역 `canSaveHere` 추가, 뒤 번호 하나씩 밀림 → 16-8 까지), 17-4 (상호작용 공용 함수는 16-4 에서 먼저), 18-3·18-4·19-2·19-5, 20-7 점검 목록.
- 코드 변경 없음. AGENTS.md·PROGRESS.md 줄바꿈 CRLF 유지 확인.
- 다음 작업: 13-1

### 2026-10-24 — 앞 단계 점검, 16-1 ~ 16-7 (16단계, 사용자 지시로 에릭 작업부터) (작업자: Claude Opus 5.5)

- 사용자 요청: "에릭 추가 때문에 게임 시작 확인 물을 때 선택 받도록 바꿔야 할 텐데? 일단 앞 단계부터 다시 점검해서 에릭 추가 작업부터 작업 진행해 줘". 1절 1번에 따라 사용자 지시를 우선해 진행 순서를 16 → 17 → 18 → 19 → 13 → 14 → 15 → 20 으로 바꿨다 (번호는 그대로, 7절 단계표 아래에 기록).
- 앞 단계 점검: 0~12단계 결과물을 2026-10-24 AGENTS.md 에 비춰 보고 바뀌는 곳을 7절 "앞 단계 점검" 표로 정리 (1 슬롯·2 생성·3 상태·4 3D·5 HUD·6 메뉴·저장·7 층 이동·8 몬스터·10 보스·11 스테이터스·12 인벤토리 → 16~19단계 작업에 넣음, 9 상태이상은 바뀌는 것 없음).
- 한 일 (`www/js/undergrounds.js`, 7절 16단계의 "(구현됨)" 참고): 주인공 데이터·`hero` (16-1), 빈 슬롯 대화상자의 주인공 선택·슬롯 요약 노드 (16-2), 계단 → 엘리베이터 (평평한 바닥, 문·버튼 판·표시등, 공용 재질, 16-3), 조준 + 왼쪽 클릭 상호작용과 버튼 판으로 층 이동 (16-4), 저장 가능 영역 = 성소 구역 또는 엘리베이터 내부 (16-5), 화면 문구 (16-6), 아이템 버리기 (16-7).
- `tools/selftest.mjs`: 계단을 전제로 한 테스트 4개를 엘리베이터 규칙으로 바꿨다 — **기대값의 근거인 AGENTS.md 가 바뀌었으므로 8절 21번의 예외**: "던전 - 계단 바닥 높이 (입구 0m → 끝 ±6m)" → "던전 - 엘리베이터 (바닥 평평·문·버튼 판·내부 2칸)", "계단 디딤판 높이 = floorHeightAt" → "조준 상호작용 (엘리베이터 버튼 판)", "그리기용 상자" (계단 칸 디딤판 8개·void 위 계단 난간 +6m → 칸마다 바닥 1개·난간 1.2m), "층 이동 트리거 (걸어서 닿음)" (계단 진행도 0.8 발동 → 걸어서 발동은 포탈만, 엘리베이터 안에서는 트리거 없음). 새 테스트 3개 ("주인공 (hero) 상태·저장 형식", "저장 가능 영역", "아이템 버리기") → 총 63개.
- 결정: 5절 U37 (엘리베이터) 의 임시안대로 구현. 조각 구조·코드 id 는 바꾸지 않았다 (기존 저장 데이터의 층이 같게 유지되도록). 엘리베이터 문은 충돌 없음 (6m 안이면 열림). 상호작용 거리 2.6m·30°.
- 검증:
  - `node --check` 통과, selftest `PASS 63, FAIL 0, SKIP 0`, `npm test` (ESLint + Playwright e2e) 통과, 줄바꿈 CRLF 유지.
  - Playwright Chromium (SwiftShader, 낮음 품질) + `server.js`, 저장소 밖 임시 스크립트 `verify16.mjs` 27건, 실패 0, 콘솔 오류·경고 없음: 빈 슬롯 대화상자의 주인공 버튼 2개·기본 마틴·에릭 선택 (대화상자는 열린 채) → [예] → 에릭 새 게임 즉시 저장 (`hero: 'eric'`) / 슬롯 요약 "에릭 · 지하 1층 · 백룸", "마틴 · 지하 1층 · 백룸 · Lv 1"·숫자 글꼴·이어하기 대화상자 요약 / 엘리베이터 끝까지 걸어가도 층 이동 없음·엘리베이터 안 = 저장 가능·HUD "엘리베이터 — 저장 가능"·시스템 탭 [저장] 활성 / 버튼 판 조준 "클릭 | 아래층으로" → 클릭 → 지하 3층 위층 엘리베이터 앞 → "위층으로" 클릭 → 지하 2층 아래층 엘리베이터 앞 / 버리기 (소모품 메뉴·장비 상세 정보, 취소하면 그대로).
  - 처음 실행 때 NG 1건은 검증 스크립트 문제였다: 메뉴의 탭을 누른 뒤 화면 가운데를 클릭하자 Playwright 의 마우스 이동이 (가짜 포인터 락 중이라) 시점 회전이 되어 조준이 풀림 (8절 37번). 게임 코드는 고치지 않았다.
  - 스크린샷 직접 확인: 주인공 선택 대화상자 (마틴·에릭 선택), 슬롯 화면, 엘리베이터 테마 5종 (문이 열린 안쪽), 버튼 판 앞 안내.
  - 9806 포트에 사용자 서버가 없어 AI 가 `node server.js` 를 띄워 확인하고 끝난 뒤 종료했다.
- 사용자 확인 필요: 16-8 (0절에 방법). 엘리베이터 내부가 긴 금속 통로처럼 보이는 점 (0절 알려진 문제).
- 남은 문제: 지금은 에릭을 골라도 게임 내용은 마틴과 같다 (에릭 전용 규칙은 17~19단계).
- 다음 작업: 17-1

### 2026-10-24 — 엘리베이터 1칸으로 (사용자 결정, 문서만) (작업자: Claude Opus 5.5)

- 사용자: "엘리베이터 크기는 1칸 크기로 줄이고, 남은 공간은 복도형 통로로 만드는 게 낫겠어. 지금 작업하기보다는 문서에만 반영해 줘".
- 반영: 5절 U37 (확정: 엘리베이터 = `stairsStep2` 1칸 (폭 6m · 깊이 11m), `stairsStep1` = 복도형 통로, 엘리베이터 내부 = 1칸), U43·U47·6.8 (엘리베이터 내부 1칸), 7절 16-9 (고칠 곳·바꿀 테스트 목록) 추가·16-8 메모, 19-2·20-7, 0절 (다음 작업 16-9 → 17-1, 알려진 문제·확인 방법). AGENTS.md 아래쪽 "생성 금지 칸" 의 "엘리베이터 3칸" → "엘리베이터 조각 3칸 (앞 통로 포함)" (1칸 엘리베이터와 헷갈리지 않게). AGENTS.md 위쪽의 "3칸으로 구성 (엘리베이터 바로 앞 1칸 크기의 통로 포함)" 은 새 구조 (통로 2칸 + 엘리베이터 1칸) 와도 맞아 그대로 둠.
- 코드 변경 없음 (지금 코드는 내부 2칸 그대로, 16-9 에서 고친다). 줄바꿈 CRLF 유지.
- 다음 작업: 16-9 → 17-1

### 2026-10-24 — 13-1 ~ 13-7, 14-0 ~ 14-6, 15단계 일부 (사용자 지시로 중단) (작업자: Claude Opus 5.5)

- 사용자 요청: "AGENTS.md, PROGRESS.md 를 읽고 13단계부터 이어서 작업해 줘" → 15단계 도중 "작업 지금 중지하고 남은 사항은 인수인계 문서에 남겨줘". 진행 순서를 13 → 14 → 15 로 바꿈 (7절 단계표 아래 기록). 사용자 확인 (13-8·14-7) 은 0절에 남기고 진행 (사용자 확인은 나중에 몰아서).
- 13단계 (스킬 트리 화면): 7절 13-7 아래 "(구현됨)" 참고. 규칙 함수 `canLearnSkill`·`learnSkill`, 스킬 탭 (보기 영역 끌기·방향키·휠 스크롤, 노드 상태·연결선, 상세 패널, 행동 슬롯 등록). 보조형 글자색을 HUD·인벤토리도 노랑으로 맞춤.
- 14단계 (스킬 효과): 7절 14-6 아래 "(구현됨)" 참고. `castSkill` + 액티브 30개 핸들러, 패시브 훅, 피격 훅 (막기·반격·가시 갑옷·마력 보호막·불굴·넉백 면역), HUD (자원 부족·보호막). AGENTS.md 의 방패 "막기" 가 지금까지 없어서 함께 구현했다 (U49 ㉓). 세부 결정 5절 U49 (미확인).
- 15단계 (방랑 상인): 재고·구매·판매 순수 함수, 상인 상호작용, 상점 UI 를 썼으나 검증 전에 중단 — 7절 15단계 "(부분 완료)" 메모에 들어간 코드·남은 일 ①②③·확인할 것을 적었다. 결정 5절 U50 (미확인).
- `tools/selftest.mjs`: 테스트 5개 추가 → 총 68개 ("스킬 활성화·레벨 업 규칙", "스킬 트리 배치·상태·스크롤·설명문", "스킬 실행 공통", "피격 훅", "순간이동·조준 지점·돌진 경로·탐험가의 감각"). 기존 테스트의 기대값은 고치지 않았다. 가짜 런타임 준비물 추가: "몬스터 투사체"·"유도 투사체" 에 `zones, buffs, cooldowns` (14단계 런타임 구조). 16-4 "조준 상호작용" 테스트는 대상을 엘리베이터로 거름 (상인이 목록에 들어와서, 엘리베이터 기대값은 그대로).
- 검증 (13·14단계):
  - `node --check` 통과, selftest `PASS 68, FAIL 0, SKIP 0`, `npm test` (ESLint + Playwright e2e) 통과 (15단계 코드를 넣은 뒤에도 `node --check`·selftest 68·ESLint 통과 — e2e 는 15단계 뒤에 다시 돌리지 않음), 줄바꿈 CRLF 유지.
  - Playwright Chromium (SwiftShader, 낮음 품질) + `server.js`, 저장소 밖 임시 스크립트: `verify13.mjs` 52건 (노드 45·연결선 48·처음 가운데·활성화/레벨 업·포인트·연결선 금색·행동 슬롯 등록/옮김/해제·잠김/미활성/포인트 없음/최대 레벨 툴팁·빈 곳/노드 위 끌기·방향키 60px·끝에서 멈춤·휠·탭을 다시 열면 가운데·D4 로 최대 HP +4%·ESC 후 HUD 슬롯·TAB 으로 다시 열기·한국어/영어 45개 상세 패널 넘침 없음·영어 이름표 두 줄 이내·콘솔 오류 없음), `verify14.mjs` 44건 (`g.paused = true` + `updateGame(g, 0.05)` 로 시간을 고정 간격으로 흘림: 30개 액티브 스킬의 피해·범위·관통·튕김 (−10% 씩)·지대·출혈·기절·공포·넉백·돌진 거리·순간이동 거리·버프 수치·처형 반환·원소 부여·반격·결계의 투사체 소멸과 회복·시간 왜곡·불굴·HUD 보호막·자원 부족 슬롯, 콘솔 오류 없음). 처음 실행 때 NG 는 모두 검증 스크립트 문제였다 (장면 정리 안 함·화염구 비행 시간·연속 베기 표본 시각·`-Infinity` 직렬화·치명타 난수 — 난수를 고정해 다시 확인). 게임 코드에서 고친 것: 연쇄 번개 첫 줄기가 카메라 옆에서 시작해 화면을 덮음 → 눈 앞 2.5m 에서 시작, 임시 성역의 낮은 반구가 눈높이 바로 아래라 이상하게 보임 → 바닥의 금색 원, 대지 분쇄 부채꼴의 첫 프레임 크기.
  - 스크린샷 직접 확인: 스킬 탭 (한국어 처음·M0 선택·등록·왼쪽 위 끝·오른쪽 아래 끝·최대 레벨, 영어 X1), 화염구 폭발, 눈보라, 연쇄 번개, 대지 분쇄, HUD 버프 아이콘·마력 보호막, 자원 부족 슬롯, 임시 성역. 연결선이 이름표 글자를 가로질러 이름표에 어두운 바탕을 넣음, 한국어 줄바꿈 `word-break: keep-all`.
  - 9806 포트에 사용자 서버가 없어 AI 가 `node server.js` 를 띄워 확인하고 끝난 뒤 종료했다. (인수인계 문서를 쓰는 중 셸 명령의 백틱이 명령으로 실행되어 `npm start` 서버가 하나 더 떴다 → 바로 종료함. 문서·코드는 바뀌지 않았다.)
- 사용자 확인 필요: 13-8, 14-7 (0절에 방법), 5절 U49·U50.
- 남은 문제 / 다음 작업: 15단계 마무리 (7절 15단계 메모 ①②③) → 16-9 → 17-1.

### 2026-10-25 — 15-1 ~ 15-4 마무리, 15-6 (AGENTS.md 상점 1×1·주변 3칸) (작업자: Claude Opus 5.5)

- 사용자 요청: "AGENTS.md, PROGRESS.md 를 읽고, 다음 작업 진행해 줘" → 작업 중 "AGENTS.md 의 일부 내용 (방랑 상인 칸 관련) 을 수정했어. 작업 중 이 사항도 반영해 줘".
- AGENTS.md 변경 (`git diff` 로 확인, "던전 구성요소 (공통)" 의 방랑 상인): "3*3 크기로 구성" → "1*1 크기로 구성", "몬스터는 방랑 상인의 임시 상점 주변 3칸 이내로는 접근하지 않음" 추가. AGENTS.md 아래쪽 ("생성 금지 칸" 의 "상인 방") 은 사용자 요청 범위 밖이라 고치지 않았다 (0절 알려진 문제).
- 한 일 (`www/js/undergrounds.js`, 7절 15단계의 "(구현됨)" 참고):
  - 15-6: 상인 조각 1×1 방형 칸, 공터 3×3 칸과 4칸 이상 띄우기 (`merchantClearingOk`), 상점 주변 3칸 표시 (`markMerchantZone`, `cell.merchantZone`), 몬스터가 들어갈 수 없는 칸 판정 `monsterBarred` 를 생성·이동·자리·길찾기·배회에 적용, `merchantLayout` 이 칸의 출입구 변으로 방향을 정함, 장식 예외 역할 이름 (`merchantRoom` → `merchantCenter`), 디버그 `&at=merchant` 시점 (카운터 앞), 불러오기 저장 위치가 벽 안이면 시작 위치로 (`playerStartPosition`).
  - 15단계 확인 중 고친 것: 상호작용 클릭 `input.leftClicked` 를 포인터 락 중에 누른 것만 기록 (상점 [닫기] 클릭이 다음 프레임에 상인 클릭으로 처리되어 상점이 바로 다시 열렸다. 실제 게임에서도 "클릭하여 계속" 클릭이 락 직후 같은 프레임이면 엘리베이터 버튼 판 클릭이 될 수 있었다 — 8절 38번).
- `tools/selftest.mjs`: 테스트 5개 추가 → 총 73개 ("방랑 상인 재고", "방랑 상인 구매·판매·품절 유지", "상인 상호작용", "불러오기 시작 위치", "상점 주변 3칸 = 몬스터가 들어갈 수 없는 칸"). 기존 테스트 변경 2건: ① "던전 생성 - 구조 검사" 의 `PIECE_SIZE.merchant` 9 → 1 — **기대값의 근거인 AGENTS.md 가 바뀌었으므로 8절 21번의 예외** (옛 값은 주석으로 남김), 상점 주변 칸 표시·공터와의 거리 검사를 더함. ② "배회" 테스트는 기대값이 아니라 준비 조건 (시드 4·지하 12층 던전에 해골 궁수·고블린 무리가 있음) 이 생성 결과 변경으로 깨져, 시드 4 부터 조건을 만족하는 층을 찾도록 준비부만 고침 (8절 39번). 새 테스트는 규칙을 일부러 깨뜨린 사본 6개 (그 외 분류 3종·희귀 25%·주변 2칸·에릭 제외 삭제·몬스터 금지에서 상점 주변 삭제·품절 기록 삭제) 로 실패하는지 확인했다.
- 결정 (5절): U50 ① 문구 (상점 칸)·⑦ 추가 (ESC 는 상점 전체를 닫음, 상세 정보에 판매가·구매가 둘 다), U51 새로 (상점 1×1·주변 3칸의 해석 — 체비쇼프 거리, 몬스터는 범위 밖에서 계속 노림, 투사체는 그대로, 공터와 띄우기, 이전 저장 데이터 지형 변화).
- 검증:
  - `node --check` 통과, selftest `PASS 73, FAIL 0, SKIP 0`, `npm test` (ESLint + Playwright e2e) 통과, 줄바꿈 CRLF 유지 (node 로 LF 단독 0 확인).
  - 생성 재시도: 9개 층 × 시드 40개 = 360개에서 재시도 합계 4 (변경 전) → 6 (변경 후), 상점 주변 칸 평균 14칸·최대 33칸.
  - Playwright Chromium (SwiftShader, 낮음 품질 1280×720) + `server.js`, 저장소 밖 임시 스크립트 `verify15.mjs` 39건, 실패 0: 시작 칸 = 1×1 상점 칸 (주변 3칸 안)·HUD "클릭 거래하기"·같은 자리 왼쪽 클릭 → 상점·일시정지 / 소모품 6줄 (지하 3층)·장비 6줄 / [1] [5] 구매 (개수·골드·토스트·소지 골드 표시)·[최대] = 골드 한도 2개·모자라는 [5] 회색 + "골드가 부족합니다." 툴팁·바깥 클릭은 팝업만 닫음·붉은 가격 / 장비 구매 → `merchantSoldOut [0]`·품절 표시·품절 클릭은 안내만 / 우클릭 상세 정보 (판매가 + 구매가)·길게 누르기 / 판매 탭 40칸·칸 아래 판매가 (6 G)·[1] [5] [모두]·1개 판매·희귀 장비 확인 대화상자 → 판매 / ESC 닫힘·게임 재개·다시 열어도 품절 유지·[닫기] / 영어·한국어 지하 20층 소모품 10줄과 지하 3층이 패널 안·글자 넘침 없음 / 상점 주변 칸 경계 바로 안의 주인공을 오크가 보고 추적하지만 20초 동안 주변 칸에 들어오지 않음 (가장 가까이 온 거리 = 경계 앞), 주인공이 밖으로 나오면 공격. 콘솔 오류 없음 (경고는 스크린샷 때문에 SwiftShader 가 내는 "GPU stall due to ReadPixels" 드라이버 성능 경고뿐).
  - 처음 실행 때 NG 는 모두 검증 스크립트 문제였다: 팝업을 ESC 로 닫으려 함 (ESC 는 상점 전체를 닫음 — U50 ⑦), 상세 정보의 가격 줄 개수 (판매가 줄도 있음), 대화상자 버튼 자리에서 (0,0) 으로 옮긴 마우스 이동이 가짜 락 중 시점 회전이 됨 (8절 37번), 몬스터를 감지 거리 (14m) 밖 16m 에 둠. 게임 코드에서 고친 것은 위의 `input.leftClicked` 하나.
  - 스크린샷 직접 확인: 상인 칸 (백룸·벽돌·동굴·용암·왜곡된 차원 — 16m 방 가운데의 천막·카운터·상인), 구매 탭·수량 팝업·상세 정보·판매 탭·희귀 판매 확인 (한국어), 영어 구매·판매 탭, 지하 20층 (한국어·영어), 지도 (상점 = 초록 1칸), 위에서 본 층 모습.
  - 9806 포트에 사용자 서버가 없어 AI 가 `node server.js` 를 띄워 확인하고 끝난 뒤 종료했다.
- 사용자 확인 필요: 15-5 (0절에 방법), 5절 U50·U51.
- 남은 문제: 이전 저장 데이터의 층 지형이 바뀜 (0절 알려진 문제).
- 다음 작업: 16-9 (엘리베이터 1칸) → 17-1.

### 2026-10-25 — 16-9 (엘리베이터 1칸) (작업자: Claude Opus 5.5)

- 사용자 요청: "테스트는 나중에 종합 플레이를 하며 확인하자. 일단 다음 작업 진행해 줘" (사용자 확인은 계속 나중에 몰아서).
- 한 일 (`www/js/undergrounds.js`, 7절 16-9 의 "(구현됨)"): 엘리베이터 = `stairsStep2` 1칸 (내부 11m), `stairsStep1` = 복도형 통로 (테마 장식이 놓임). `isElevatorInterior`·`elevatorLayout`·`ELEVATOR_LEN`·`DECOR_ROLES`·백룸 걸레받이·지도 칸 색과 아이콘. 던전 조각 구조·생성 결과·도착 위치는 그대로.
- `tools/selftest.mjs`: "던전 - 엘리베이터" (내부 1칸·문 위치·길이 11m), "저장 가능 영역" (내부 칸 4 → 2) 의 기대값을 바꿈 — **근거는 2026-10-24 사용자 결정 (U37) 이므로 8절 21번의 예외**, 옛 값은 주석. 총 73개 그대로.
- 검증: `node --check`, selftest `PASS 73, FAIL 0, SKIP 0`, `npm test` 통과, CRLF 유지. Playwright (낮음 품질) 저장소 밖 임시 스크립트 `verify169.mjs` 7건 통과 — 지하 2층 `&at=stairsDown` 에서 W 로 걸어 들어가면 앞 통로 → 복도 (저장 불가) → 엘리베이터 (저장 가능) 순서, 안쪽 끝에서 버튼 판 조준·HUD "아래층으로"·"엘리베이터 — 저장 가능", 왼쪽 클릭 → 지하 3층 위층 엘리베이터 앞 통로 도착, 콘솔 오류 없음. 처음 NG 1건은 스크립트가 게임을 일시정지한 채 HUD 를 읽은 것 (일시정지 중에는 안내를 숨김). 스크린샷 직접 확인: 테마 5종 앞 통로에서 본 모습 (복도 끝의 닫힌 문·▼ 표시등)·문 앞 (열린 문·짧은 내부·버튼 판)·안쪽 끝에서 돌아본 모습 (문에서 6m 넘게 떨어져 닫힘), 지도 (엘리베이터 색·아이콘은 끝 1칸).
- 다음 작업: 17-1.

### 2026-10-25 — 17-1 ~ 17-6, 18-1 ~ 18-4 (에릭: 던전·가구·플래시·어둠·화면) (작업자: Claude Opus 5.5)

- 사용자 요청: 16-9 에 이어 "다음 작업 진행" → 작업 중 "작업 18-5 까지만 진행하고 문서에 진행상황 반영 후 중지해 줘" (18-5·17-7 은 사용자 확인 항목이라 18-4 까지 구현하고 중지).
- 순서: 17-1 → 17-2 → 17-3 → 17-4 → 17-5 → **18-1 → 17-6** → 18-2 → 18-3 → 18-4. 17-6 (서랍에서 꺼내기) 이 배터리 데이터 (18-1) 를 써서 순서를 바꿨다 (7절 단계표 아래).
- 한 일 (`www/js/undergrounds.js`, 7절 17·18단계의 "(구현됨)"):
  - 17-1 에릭 던전 생성 (`generateDungeon(seed, floor, hero)`, 마틴은 난수 순서까지 같아 지형이 바뀌지 않음), 성소가 없는 층의 새 게임·불러오기 시작 위치.
  - 17-2 ~ 17-6 캐비닛·서랍형 장롱: 배치 (`planEricFurniture`), 모양·충돌·장식 피하기 (`ctx.wallFaces`), 조준 상호작용과 상태별 안내 문구 (`interactLabelKey`), 숨기 (`enterCabinet`·`exitCabinet`, 검은 막 + 틈, 시점 제한, 피해 없음, 플래시 꺼짐), 서랍 (`useDrawer`, `world.drawersTaken` 저장·층 기록).
  - 18-1 플래시 (`kind: 'tool'`)·배터리 (`CONSUMABLES.battery`, `hero: 'eric'`)·에릭 새 게임·검사·등록 규칙·아이콘·상세 정보·도구 메뉴, 에릭 경험치 없음. 18-2 플래시 켜고 끄기 (누르는 순간, `input.rightClicked`)·에너지·배터리 자동 교체·0.5초 뒤 꺼짐. 18-3 어둠 (`ERIC_DARK`, 에릭 층 전용 SpotLight, `setEricDarkness`·`aimFlash`·`updateEricDarkness`). 18-4 메뉴 탭 3개 (`menuTabsOf`), 에릭 HUD (플래시 막대·배터리, HP·MP·레벨·골드 숨김), 인벤토리 탭 (장착 칸·골드 숨김).
- `tools/selftest.mjs`: 테스트 9개 추가 → 총 82개 ("던전 생성 - 마틴 결과 고정", "던전 생성 - 에릭", "에릭 가구 배치", "에릭 가구 상호작용 대상", "캐비닛 숨기·나오기", "서랍형 장롱", "에릭 새 게임·플래시·배터리 데이터", "플래시 켜고 끄기…", "주인공별 메뉴 탭·에릭 어둠 값"). `checkDungeon(d, floor, hero)` 에 주인공 인자 (에릭: 포탈·상인 0, 성소 지하 1층 1곳·그 밖 0, 보스 공터 없음). 기존 테스트 변경: "소모품 21종"·"소모품 개수·재사용 대기 키" 는 **기대값 21 그대로**, 세는 대상에서 에릭 전용 (`hero`) 배터리를 뺐다 (근거: 2026-10-24 AGENTS.md 의 별도 표 "에릭 전용 아이템"). 마틴 결과 고정 테스트의 지문은 17-1 작업 직전 생성기로 계산했다.
- 결정 (5절): U40·U41·U42·U46 에 구현 세부·값을 덧붙임 (모두 미확인).
- 검증:
  - `node --check`, selftest `PASS 82, FAIL 0, SKIP 0`, `npm test` (ESLint + Playwright e2e) 통과, CRLF 유지.
  - Playwright (낮음 품질) 저장소 밖 임시 스크립트 `verify1718.mjs` 29건 통과, 콘솔 오류 없음: 테마 5종 지하 2층에서 플래시 꺼짐 안개 32 → 160m·카메라 170m / 우클릭 → 켜짐 112 → 320m / HUD (HP·MP·레벨·골드 숨김, 스태미너·플래시 막대, 배터리 ×1, 슬롯 "플래 ON")·켜진 동안 에너지 감소·다시 우클릭 → 꺼짐 / 지하 3층 캐비닛 8개·"클릭 숨기" → 숨음 (플래시 꺼짐·검은 막·"나오기")·마우스를 크게 움직여도 ±40° / ±15°·안에서 플래시 못 켬·다시 클릭 → 나옴 / 서랍 위 칸 "열기" → 열림 → "가져가기" → 하급 활력 물약 +1 → "비어 있음" / 메뉴 탭 3개·인벤토리 장착 칸·골드 숨김·플래시 메뉴 [버리기] 회색·플래시 상세 정보 (에너지·팔거나 버릴 수 없음)·배터리 메뉴 [사용] 회색·등록 없음.
  - 회귀: `verify169.mjs` 7건·`verify15.mjs` 39건 (마틴 엘리베이터·상점) 다시 통과.
  - 스크린샷 직접 확인: 테마 5종 × 플래시 꺼짐/켜짐, 캐비닛 앞·숨은 화면 (틈으로 맞은편 벽)·서랍 열림·인벤토리 (한국어·영어). 처음 값 (테마 주변광 × 0.05) 은 백룸만 너무 밝아 (2칸 너머 벽이 또렷함), 주변광 + 반구광 합을 테마와 상관없이 0.025 로 맞추도록 바꿨다 (U42).
  - 9806 포트에 사용자 서버가 없어 AI 가 `node server.js` 를 띄워 확인하고 끝난 뒤 종료했다.
- 사용자 확인 필요: 17-7, 18-5 (0절에 방법), 5절 U39 ~ U42·U46.
- 남은 문제: 에릭 층의 몬스터는 아직 마틴 규칙 (19단계에서 보스급 1~2기로 바꿈) — 에릭은 공격 수단이 없어 쓰러질 수 있다.
- 다음 작업: 19-1.

### 2026-10-25 — 19-1 ~ 19-4 (에릭의 몬스터·노이즈) (작업자: Claude Opus 5.5)

- 사용자 요청: "19-4 단계까지 진행해 줘" (19-5 는 사용자 확인 항목).
- 한 일 (`www/js/undergrounds.js`, 7절 19단계의 "(구현됨)"): 생성 계획 `planEricMonsters`·`spawnEricMonsters`·`setupEricMonster` (테마 보스 외형 1~2기, 도착 칸에서 8칸 이상, 에릭 층은 일반 몬스터·정예·둥지·보스 없음), 행동 `updateEricMonster`·`ericMoveTo`·`ericWander`·`resolveEricAttack` (느린 배회 → 발견 → 달리기 속도로 추적 → 4초 안 보이면 해제, 마지막으로 본 자리로, 0.5초 예비 동작 뒤 한 방에 사망), 엘리베이터 내부 칸 `ericBarred`·`playerTargetable` 의 엘리베이터 내부, 시야 `ericMonsterSees` (U44), 노이즈 `ericNoiseLevel`·`updateHudNoise` (U45). 스냅샷 `eric: true`, 처치 불가 (`damageMonster`), 그리는 거리 330m. 함께 고친 것: `findCellPath` 시작점이 칸 밖이면 null (확인 스크립트가 몬스터를 벽 너머로 옮기자 `edges` 를 읽다 멈춤), 에릭 어둠에서 왜곡된 차원 하늘 (별·성운) 을 감춤 (플래시를 켜면 안개 끝이 320m 로 멀어져 성운이 보랏빛으로 드러났다).
- `tools/selftest.mjs`: 테스트 4개 추가 → 총 86개 ("에릭 몬스터 생성 계획", "에릭 몬스터 시야", "에릭 노이즈 단계", "에릭 몬스터 행동"). 기존 테스트의 기대값은 고치지 않았다. 처음 실행 때 실패 2건은 테스트 문제였다: 1기·2기 비율을 인접 시드 (`seed × 100 + r`) 로 만든 난수의 첫 값으로 셈 (고르지 않음 → 해시 시드로), 등 뒤 판정 중 몬스터가 배회하며 몸을 돌림 (판정 한 번만 보도록). 규칙을 일부러 깨뜨린 사본 6개 (엘리베이터 노림 허용·해제 40초·한 방 아님·캐비닛 안도 봄·추적 중 3단계 없음·엘리베이터 진입 허용) 로 각 테스트가 실패하는 것을 확인.
- 결정 (5절): U43·U44·U45 에 구현 세부를 덧붙임 (미확인).
- 검증:
  - `node --check`, selftest `PASS 86, FAIL 0, SKIP 0`, `npm test` 통과, CRLF 유지.
  - Playwright (낮음 품질) 저장소 밖 임시 스크립트 `verify19.mjs` 16건 통과, 콘솔 오류 없음: 테마 5종 층에서 테마 보스 외형 1~2기·에릭 모드·도착 칸에서 8칸 이상 (17~32칸)·게임 시간 30초 동안 10m 넘게 배회 / 노이즈 1·2·3단계 불투명도 0.06·0.12·0.2·3단계만 가장자리 어둡게 / 정면 12m 에서 발견 → 추적 → HP 99999 여도 한 방에 사망 → "쓰러졌습니다" 화면 / 캐비닛에 숨으면 마지막으로 본 자리까지 와도 공격하지 않고 4초 뒤 해제. 회귀: `verify169.mjs` 7·`verify15.mjs` 39·`verify1718.mjs` 29건 다시 통과.
  - 스크린샷 직접 확인: 테마 5종 몬스터를 플래시로 비춘 모습 (야근·간수장·거미 여왕·용암 군주·차원 포식자), 노이즈 1·2·3단계 (3단계에서도 벽·바닥이 잘 보임), 사망 화면, 숨은 화면 + 노이즈.
  - 9806 포트에 사용자 서버가 없어 AI 가 `node server.js` 를 띄워 확인하고 끝난 뒤 종료했다.
- 사용자 확인 필요: 19-5 (0절에 방법), 5절 U43 ~ U45.
- 다음 작업: 20-1.

### 2026-10-25 — AGENTS.md 두 번째 변경 반영 (문서만) (작업자: Claude Opus 5.5)

- 사용자: "AGENTS.md 일부 내용을 변경했어. 이 사항을 AGENTS.md 내 '주인공 초기 스테이터스와, 스테이터스별 실제 게임 적용 수치' 단락 이후 부분 및 PROGRESS.md 문서에 반영해 줘".
- AGENTS.md 의 바뀐 곳 (`git diff` 로 확인): "던전 특징 (에릭)" — 서랍형 장롱이 일자형·ㄱ자형에도 1/4·한 층 16개 이상, 배터리는 장롱에서 낮은 확률 (층마다 4개 이상)·여러 개여도 1칸, 새 아이템 야광봉·카드키·빛 바랜 주문서, 내려가는 엘리베이터는 처음에 비활성 (오른쪽 카드 리더기에 카드키) / "에릭 특별 규칙" — 발소리 (걷기 5칸·달리기 20칸) 를 듣고 다가가는 의심 모드, 추적 해제 4초 → 8초, 캐비닛 8초면 의심·추적 모두 해제, 노이즈 2단계 문구 "주위 5칸" → "주위 10칸" / "조작" — 대상을 정면으로 보고 F 키로 상호작용, 마우스 왼쪽 버튼으로 행동 슬롯 사용. 아래쪽 "아이템 > 공통 규칙" 의 소모품 사용 버튼 (왼쪽) 은 사용자가 이미 고쳐 두었다.
- AGENTS.md 아래쪽에 반영 (위쪽 문구를 옮기기만 하고 새 수치는 만들지 않음): "아이템" 머리말 (에릭 전용 아이템 목록), "공통 규칙" 의 겹치기 (에릭 전용 아이템은 아래 표 참조), "에릭 전용 아이템" 표 — 배터리 비고 (장롱·층마다 4개 이상·1칸), 야광봉·카드키·빛 바랜 주문서 행 추가 + "플래시는 추가로 얻을 수 없고 나머지는 장롱에서", "몬스터" 단락의 에릭 요약 (의심 모드·8초·캐비닛 8초·야광봉 불빛은 못 봄·빛 바랜 주문서). "행동 공통" 의 "4초" 는 마틴 규칙이라 그대로.
- 이 문서: 0절 (현재 상태·다음 작업·확인 요청 ①~⑧·알려진 문제), 4.7 (21~23단계 예정 이름), 5절 U40·U41·U43 에 변경 표시, U45 = **확인 필요** (1단계·2단계 거리가 같아짐), 새 U52 (장롱 배치·내용물·보장) ~ U58 (조작), 6.1 (예정 필드 `glowsticks`·`elevatorUnlocked`), 7절 단계표에 21 (조작 변경)·22 (에릭 장롱·아이템·카드키)·23 (에릭 의심 모드·8초·노이즈) 와 순서 (21 → 22 → 23 → 20), 17·18·19단계 머리말에 바뀌는 곳 안내, 20-7 최종 점검 목록 (조작·에릭 던전 특징·특별 규칙).
- 코드 변경 없음 (`www/js/undergrounds.js`, `tools/selftest.mjs` 그대로 — selftest 86 통과 상태). AGENTS.md·PROGRESS.md 줄바꿈 CRLF 유지 확인.
- 다음 작업: 21-1.

### 2026-10-25 — 21-1 ~ 21-4, 22-1 ~ 22-6, 23-1 ~ 23-3 (조작 변경·에릭 장롱/아이템/카드키·에릭 몬스터 의심 모드) (작업자: Claude Opus 5.5)

- 사용자 요청: "AGENTS.md, PROGRESS.md 를 읽고 다음 작업 진행해 줘 (내가 확인할 사항 제외하고)". 사용자 확인 항목 (21-5·22-7·23-5) 과 사용자 답이 필요한 23-4 (U45 노이즈 거리) 를 빼고 21 → 22 → 23 단계를 진행하고 23-4 앞에서 멈췄다.
- 한 일 (`www/js/undergrounds.js`, 7절 21·22·23단계의 "(구현됨)"):
  - 21 조작: 상호작용 = F 키 (`INTERACT_KEY`, 누르고 있어도 한 번), 행동 슬롯 = 왼쪽 버튼 (`input.mouseLeft`, 락 중에 누른 것만, 프레임 사이의 아주 짧은 클릭도 `leftClicked` 로 한 번 시도), 플래시 = 왼쪽 버튼 누르는 순간, 오른쪽 버튼은 게임 중 아무 일도 없음 (`mouseRight`·`rightClicked` 삭제). HUD 안내 키 "F" (`interact.key`), "클릭하여 계속" 아래 조작 안내 2줄 (`game.controlsHint2`).
  - 22 에릭: 장롱 배치·내용물·보장 (`planEricFurniture`), 에릭 전용 아이템 3종 + 아이템별 겹치기 (`stackMaxOf`)·카드키 1개·버리기 불가·`useReason`, 아이콘 3종, 야광봉 (`dropGlowstick`, `world.glowsticks` + 층 기록·2층 이상 멀어지면 지움, 조명 4개 배정, 멀리서 보이는 빛점, 카메라 far 1200m), 카드키·아래층 엘리베이터 잠금 (리더기·잠긴 문 충돌·▼ 꺼짐·`world.elevatorUnlocked` + 층 기록·올라와 도착한 층은 활성), 빛 바랜 주문서 (`pickWarpDestination`·`updateFadedWarp`·화면 어두워짐·추적 해제·도착 5칸 안 몬스터 옮김·순간이동 중 노릴 수 없음).
  - 23 에릭 몬스터: 발소리 (`footstepRange`·`updateEricSenses`·`hearFootstep`), 의심 모드 (`suspect`, 배회 속도·도착/막힘이면 배회·발견하면 추적), 추적 해제 8초, 캐비닛 8초면 모두 해제, `ericStuckTime` (배회와 같은 막힘 판정).
- `tools/selftest.mjs`: 테스트 5개 추가 → 총 91개 ("에릭 전용 아이템 겹치기·버리기·등록", "야광봉", "카드키·아래층 엘리베이터 잠금", "빛 바랜 주문서", "에릭 발소리·의심 모드·캐비닛 8초"). **기존 테스트의 기대값 변경 2건 — 근거는 2026-10-25 AGENTS.md 변경이므로 8절 21번의 예외**: "에릭 가구 배치" (장롱 조각 종류 ㅏ·십자 → 4종, 1/2 → 종류별 1/2·1/4 + 16개 보충, 빈칸 50% · 배터리 45 / 활력 물약 35 / 탐색 주문서 20 → 새 표 40 / 20 / 20 / 15 / 5 + 배터리 4개 이상·카드키 1개, 가구끼리 벽면·바닥 겹침 없음 추가), "에릭 몬스터 행동" (숨은 채 4.2초 뒤 idle → 4.2초엔 아직 chase, 8.2초 뒤 idle). 규칙을 일부러 깨뜨린 사본 9개 (캐비닛 30초·추적 해제 4초·걷기 7칸·추적 중 발소리로 의심·야광봉 3층·올라와도 잠김·배터리 2개 보장·카드키 여러 개·주문서 거리) 로 새 테스트가 모두 실패하는 것을 확인 (처음엔 3개를 놓쳐 테스트를 보강).
- 결정 (5절): U52 ~ U57 에 구현 세부 (확인한 장롱 개수, 1칸 최대 999개, 야광봉 빛·빛점·카메라 far, 리더기 위치·이전 저장 데이터는 활성, 순간이동 중 노릴 수 없음, 발소리 = 이동 키 기준) 를 덧붙임 (모두 미확인). U45 는 그대로 **확인 필요**.
- 검증:
  - `node --check`, selftest `PASS 91, FAIL 0, SKIP 0`, `npm test` (ESLint + Playwright e2e) 통과, CRLF 유지.
  - Playwright (낮음 품질) 저장소 밖 임시 스크립트: `verify21.mjs` 21건 (F 로만 상점·캐비닛, 왼쪽 버튼 3.2초 → 기본 공격 5회·짧은 클릭 1회·오른쪽 버튼 무반응·[닫기]/"클릭하여 계속" 클릭은 공격 아님·F 누르고 있어도 한 번·물약·마력 화살 연속·플래시는 누르는 순간만·안내 2줄 한국어/영어), `verify22.mjs` 25건 (테마 2종: 잠긴 문을 걸어서 못 지나감·"F | 카드 찍기"·카드키 없이 F 그대로·카드키 소모 → 활성·안으로 들어가 버튼 판 F → 지하 4층 (새 층 잠김, 지하 3층 기록 활성) / 야광봉 왼쪽 버튼·조명·카메라 far·12칸 (192m) 밖에서 빛점 보임·저장 / 빛 바랜 주문서 추적 해제·무적·283m 순간이동·어두워졌다 밝아짐·도착 5칸 안 몬스터 없음 / 카드키 메뉴·상세 정보·야광봉 등록 / 장롱 16개·F 로 카드키), `verify23.mjs` 10건 (걷기 70m 들림·90m 안 들림·달리기 90m 들림·330m 안 들림·멈춤 안 들림·배회 속도로 다가옴·의심 중 노이즈 2단계·오다가 발견 → 추적·숨은 지 7.5초 의심 → 8초 해제). 앞 단계 스크립트는 클릭을 F·왼쪽 버튼으로, verify19 의 "4초 해제" 를 "6초엔 추적·9초엔 해제" 로 바꿔 다시 통과: `verify19` 16·`verify1718` 29·`verify169` 7·`verify15` 39건. 콘솔 오류 없음.
  - 스크린샷 직접 확인: 카드 리더기 붉은 불 → 초록 불·문 열림·토스트, 야광봉 가까이 (초록 빛)·멀리 (빛점), 새 아이콘 3종 (인벤토리 한국어·영어), 카드키 상세 정보, 순간이동 중 화면.
  - 처음 빛점 (화면 15px, 높이 0.12m 고정) 은 멀리서 아래 절반이 바닥에 가려져 잘 안 보였다 → 크기 22px·거리에 따라 띄움.
  - 확인 중 발견한 기존 문제: 벽에 바짝 붙어 벽을 보면 화면이 하얗게 날아간다 (마틴·에릭 공통, 눈 위치의 손전등·둘레 빛). 이번 작업에서 생긴 것이 아니어서 고치지 않고 0절 "알려진 문제" 에 적었다 (잠긴 엘리베이터 문 앞에서 특히 잘 보임).
  - 9806 포트에 사용자 서버가 없어 AI 가 `node server.js` 를 띄워 확인하고 끝난 뒤 종료했다.
- 사용자 확인 필요: 21-5·22-7·23-5 (0절에 방법), 5절 U52 ~ U58, **U45 (23-4 를 하려면 답이 필요)**.
- 다음 작업: 23-4 (사용자 답 뒤) → 20-1.

### 2026-10-25 — 23-4 (에릭 노이즈 거리 20칸 / 10칸) (작업자: Claude Opus 5.5)

- 사용자: "AGENTS.md 를 수정했어. (1단계는 20칸) 내용대로 진행해 줘. 23-4까지만 진행하고 아직 20단계는 진행하지 말아줘".
- AGENTS.md 의 바뀐 곳 (`git diff` 로 확인): "에릭 특별 규칙" 의 노이즈 1단계 "근처 (주위 10칸)" → "근처 (주위 20칸)". 2단계 "주위 10칸"·3단계 "추적 모드" 는 그대로.
- 한 일: [14] `ERIC_NOISE` 1단계 10칸 → 20칸 (320m), 2단계 5칸 → 10칸 (160m) (불투명도 0.06 / 0.12 / 0.2 그대로). 5절 U45 = 확정, 7절 23-4 `[x]`, 20-7 점검 목록, 0절.
- `tools/selftest.mjs`: "에릭 노이즈 단계" 의 기대값 변경 (321m 0단계·320m 1단계·161m 1단계·160m 2단계·80m 2단계) — **근거는 2026-10-25 AGENTS.md 수정 (사용자 확정) 이므로 8절 21번의 예외**, 옛 값은 주석. 총 91개 그대로.
- 검증: `node --check`, selftest `PASS 91, FAIL 0, SKIP 0`, `npm test` 통과, CRLF 유지. Playwright `verify19.mjs` (노이즈 확인 거리를 240m·120m 로 바꿈 — 1단계 0.06·2단계 0.12·추적 3단계 0.2 + 가장자리 어둡게) 16건, `verify23.mjs` 10건 통과, 콘솔 오류 없음. 9806 포트에 사용자 서버가 없어 AI 가 `node server.js` 를 띄워 확인하고 끝난 뒤 종료했다.
- 다음 작업: 20-1 — **사용자 지시로 아직 시작하지 않는다** (지시가 있을 때 진행).

### 2026-10-25 — 20-1 ~ 20-4, 20-6 ~ 20-8 (20단계 마무리, 20-5 제외) (작업자: Claude Sonnet 5.5)

- 사용자 요청: "AGENTS.md, PROGRESS.md 를 읽고 20단계를 진행해 줘". AGENTS.md 는 `git diff 45d8d35 HEAD` 로 확인 — 세션 시작 이후 바뀐 곳은 노이즈 1단계 "주위 20칸" 한 줄뿐이고 이미 23-4 로 반영됨. 20-5 는 U4 가 미확정이라 PROGRESS.md 규칙 ("U4 가 확정되면") 대로 보류.
- 한 일 (`www/js/undergrounds.js`, 7절 20단계의 "(구현됨)"):
  - 20-1: `__TEST__` 에 `TOOL_DESC, MENU_TABS, EQUIP_SLOT_KEYS, itemTypeKey` 추가 (동적 번역 키의 정의역 검사용). 번역 누락 검사 자체 테스트.
  - 20-3: `&fps=1` 오버레이 (`updateFpsOverlay`, `app.fps`·`app.perf`, `debugRuntime().perf`, CSS `.ug-fps`). 성능은 측정만 했고 코드 최적화는 하지 않았다 (필요 없음 — 7절 20-3).
  - 20-6: 새 게임 이야기 장면 (`SCREENS.intro`, `introFrame`, `INTRO_TIMING`, 번역 `intro.*`, `startNewGame` 이 이야기 → 게임 시작·저장 순서).
- `tools/selftest.mjs`: 테스트 4개 추가 → 총 95개 ("번역 누락 검사", "저장 데이터 크기", "새 게임 이야기 장면", "AGENTS.md 표 ↔ 코드 데이터 대조"). `import { readFileSync } from 'node:fs'` 추가. 기존 테스트의 기대값은 고치지 않았다 (직전 23-4 의 노이즈 변경은 그 기록에). 새 테스트가 실제로 잡는지 변이로 확인: 번역 키 삭제·자리표시자 불일치 4건, 스킬 소모·소모품 가격·부가 옵션 범위 수치 변경 4건 모두 실패로 잡힘 (처음엔 "숫자 앞 `+`" 정규식과 정적 키 판정 오류를 한 번씩 고쳤다).
- AGENTS.md 표 대조 (20-7): 스킬 44개·소모품 21종·무기 / 방어구 / 보조 / 반지·부가 옵션 17종·각인 5종·몬스터 20종 + 보스 5종·상태이상의 이름·수치 883건이 모두 일치 (불일치 0). 감사 스크립트를 그대로 자체 테스트로 남겼다.
- 성능 측정 (20-3, 낮음이 아닌 보통 품질, 헤드리스 SwiftShader — CPU 렌더링이라 FPS 자체는 의미 없음, CPU 시간·draw call·삼각형만): 지하 400층 (512칸) 테마 5종, 몬스터 178~183마리 — 갱신 0.4~0.7ms, 그리기 CPU 0.4~0.6ms, draw call 15~122, 삼각형 4.6만~33.7만 / 최악 (몬스터 180마리를 모두 주인공 근처로 모아 추적) — 갱신 0.6~0.7ms (루프 평균 1.6~2.0ms), 그리기 2.0~2.7ms, draw call 803~1051, 삼각형 12.8만~43.7만.
- 저장 데이터 크기 (20-4): 마틴 789,258 글자, 에릭 1,019,833 글자 (목표 1,000,000). 5절 U60, 사용자 보고.
- 검증: `node --check`, selftest `PASS 95, FAIL 0, SKIP 0`, ESLint 통과, `npm test` 통과, CRLF 유지.
  - Playwright (저장소 밖 임시 스크립트): `verify20.mjs` 51건 (실제 UI 흐름: 타이틀 → 메뉴 → 슬롯 (빈 슬롯 문구·주인공 선택·삭제 2차 확인) → 새 게임 (이야기 장면·건너뛰기·저장) → 시스템 메뉴 (에릭 3탭 / 마틴 5탭·성소 안 [저장] 활성·성소 밖 비활성 + 툴팁 4초·[메인 메뉴] 규칙) → 이어하기 → 설정 (저장해야 적용·취소·localStorage·언어·해상도) + 낮음 1280×720 + 화면 16종 × 두 언어의 번역 키 노출 검사), `verify5b.mjs` 18건 (WASD·SHIFT 8.32 m/s·스태미너·탈진·점프·시점·슬롯 선택·메뉴·벽 충돌).
  - 앞 단계 회귀 (조작 변경 뒤 스크립트를 새 조작에 맞춘 것): verify10 100·verify11 49·verify12 35·verify13 52·verify14 44·verify15 39·verify16 27·verify169 7·verify1718 29·verify19 16·verify21 21·verify22 25·verify23 10건 모두 통과. 5~9단계 확인 스크립트는 임시 폴더에서 사라져 다시 돌리지 못했고, 그 범위는 verify5b·verify20·selftest 가 대신한다.
  - 스크린샷 직접 확인: 이야기 장면 (한국어), 영어 스테이터스 화면 (글자 넘침 없음), 지도 탭 (격자·미방문 흐림·범례).
  - 스크립트 쪽 문제 (게임 문제 아님) 3건을 고쳤다: verify10 이 옛 계단 트리거로 층을 옮김 (엘리베이터 버튼 판 상호작용 `useInteractable` 로 변경), verify5b 의 달리기 속도 측정 구간에 키 입력 지연이 섞임, 번역 키 모양 검사가 버전 "v0.0.1" 을 키로 오인.
  - 9806 포트에 사용자 서버가 없어 AI 가 `node server.js` 를 띄워 확인하고 끝난 뒤 종료했다.
- 사용자 확인 필요: 20-9 (0절에 방법), 5절 U59·U60, **20-5 를 하려면 U4 (조건부 3인칭의 조건) 가 필요**.
- 다음 작업: 없음 (20-5 는 U4 답을 받은 뒤).

### 2026-10-25 — 에릭 서랍 기록 보관 범위 (현재 층 ± 1), 3인칭 조건 기록 (작업자: Claude Sonnet 5.5)

- 사용자: "(3인칭 전환 조건은) 특정 스킬 사용 시 유효시간 동안 3인칭으로 전환되도록 하려고 했어. 아직은 보류 (문서에만 남겨줘). 에릭의 경우 모든 층의 장롱 서랍을 다 저장하지 말고, 현 위치 기준 위아래 1층까지만 저장하고 있는지 확인해줘. 2층 이상 멀어진 층까지 서랍 내 상태를 저장할 필요는 없어."
- 3인칭: 5절 U4 와 7절 20-5 에 조건을 적고 보류. 코드·AGENTS.md 는 건드리지 않았다.
- 서랍 기록 확인 결과: **이전에는 모든 층의 층 기록에 `drawersTaken` 이 남았다** (야광봉만 2층 이상 멀어지면 지우고 있었음) — 1000층 극단에서 서랍 기록만 257KB. 그래서 고쳤다 (5절 U61).
- 한 일 (`www/js/undergrounds.js`): `DRAWER_KEEP_FLOORS` (2) + `pruneFarFloorRecords(history, floor)` — 거리 2 이상인 층 기록의 `drawersTaken`·`glowsticks` 를 비움. `applyFloorChange` 가 층 이동 때마다, `deserializeState` 가 불러올 때 (이전 형식 저장 데이터 정리) 부른다. 야광봉의 인라인 정리 코드는 이 함수로 합쳤다 (동작 같음). `__TEST__` 에 `DRAWER_KEEP_FLOORS, pruneFarFloorRecords` 추가.
- `tools/selftest.mjs`: 테스트 1개 추가 → 총 96개 ("에릭 서랍 기록은 현재 층과 위·아래 1층까지만 보관": 거리 1 은 보관·거리 2 는 지움·2층 이상 멀어졌다 돌아오면 새것·1층 거리 안에서 돌아오면 유지·포탈 초기화·이전 형식 저장 데이터는 불러올 때 현재 층 ± 1 만 남김·야광봉도 같은 범위). "저장 데이터 크기" 테스트는 에릭 한도를 목표 (1,000,000) 로 되돌리고 서랍 기록이 남은 층 기록이 1개뿐인지 확인을 더했다 — 에릭 1000층 극단 **1,019,833 → 765,088 글자**. 변이 4건 (서랍 정리 끔·보관 범위 3층·불러올 때 정리 끔·층 이동 때 정리 끔) 모두 실패로 잡힘.
- 검증: `node --check`, selftest `PASS 96, FAIL 0, SKIP 0`, ESLint 통과, CRLF 유지. Playwright `verify-drawer.mjs` 7건 (실제 게임에서 서랍 칸을 가져간 뒤 엘리베이터 경로로 층 이동: 1층 거리는 기록 보관·돌아오면 가져간 칸 그대로, 2층 멀어지면 기록 지움·돌아오면 서랍이 새것 (그 칸에 아이템이 다시 들어 있음)·저장 데이터에 서랍 기록이 현재 층 ± 1 에만). 앞 단계 회귀 (서랍·층 이동·엘리베이터를 쓰는 스크립트) 는 아래 줄.
- 알아 둘 점: 저장 이후에 2층 이상 멀어졌다가 돌아오면 그 층의 서랍이 새것으로 채워지므로, 서랍에서 얻을 수 있는 아이템 (배터리·야광봉·카드키 등) 을 같은 층에서 다시 얻을 수 있다. 카드키는 한 번 쓰면 `elevatorUnlocked` (층 기록, 모든 층에 보관) 로 그 층 엘리베이터가 계속 열려 있으므로 다시 찾을 필요는 없다.

---

## 부록 A. tools/selftest.mjs

> 2026-10-17 에 `tools/selftest.mjs` 로 만들었다. **이후의 기준은 이 부록이 아니라 실제 파일**이다 (ESLint 통과를 위한 수정과 1단계 테스트 2개가 더해져 있음, 9절 참고).

0-1 에서 이 내용 그대로 `tools/selftest.mjs` 를 만든다. 이후 단계에서 테스트를 추가할 때는 마지막 `console.log` 바로 위에 `test(...)` 를 추가한다. 기존 테스트의 기대값은 바꾸지 않는다 (8절 21번).

```js
// tools/selftest.mjs - 브라우저 없이 undergrounds.js 의 순수 로직을 검사한다.
// 실행: node tools/selftest.mjs   (프로젝트 루트에서)
import { registerHooks } from 'node:module';

// three.module.min.js 안의 './three.core.js' import 를 실제 파일 './three.core.min.js' 로 연결
// (브라우저에서는 undergrounds.html 의 importmap 이 같은 일을 한다)
registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === './three.core.js') specifier = './three.core.min.js';
        return nextResolve(specifier, context);
    },
});

const mod = await import(new URL('../www/js/undergrounds.js', import.meta.url).href);
const T = mod.__TEST__ || {};

let pass = 0, fail = 0, skip = 0;
function test(name, needs, fn) {
    const missing = needs.filter((n) => typeof T[n] === 'undefined');
    if (missing.length > 0) { skip++; console.log(`SKIP  ${name}  (아직 없음: ${missing.join(', ')})`); return; }
    try { fn(); pass++; console.log(`PASS  ${name}`); }
    catch (e) { fail++; console.log(`FAIL  ${name}\n      → ${e.message}`); }
}
function eq(actual, expected, label) {
    if (actual !== expected) throw new Error(`${label}: 기대값 ${JSON.stringify(expected)}, 실제값 ${JSON.stringify(actual)}`);
}
function near(actual, expected, eps, label) {
    if (typeof actual !== 'number' || Math.abs(actual - expected) > eps) throw new Error(`${label}: 기대값 ${expected} (±${eps}), 실제값 ${actual}`);
}
function ok(cond, label) { if (!cond) throw new Error(label); }

// ---------------------------------------------------------------- 유틸
test('RNG 결정성 (같은 시드 = 같은 수열)', ['createRng'], () => {
    const a = T.createRng(42), b = T.createRng(42), c = T.createRng(43);
    let same = true;
    for (let i = 0; i < 10; i++) {
        const x = a(), y = b();
        eq(x, y, `${i}번째 값`);
        ok(x >= 0 && x < 1, `0 이상 1 미만이어야 함: ${x}`);
        if (x !== c()) same = false;
    }
    ok(!same, '다른 시드인데 수열이 같음');
});

// ---------------------------------------------------------------- 공식
test('필요 경험치 (AGENTS.md 예시값)', ['expToNext'], () => {
    eq(T.expToNext(1), 80, 'Lv1'); eq(T.expToNext(5), 894, 'Lv5'); eq(T.expToNext(10), 2529, 'Lv10');
    eq(T.expToNext(20), 7155, 'Lv20'); eq(T.expToNext(30), 13145, 'Lv30');
});
test('처치 경험치 레벨차 보정', ['killExp'], () => {
    near(T.killExp(1, 1), 15, 1e-9, '같은 레벨');
    near(T.killExp(10, 1), 60 * 1.5, 1e-9, '몬스터가 9레벨 높음 → 1.5배 상한');
    near(T.killExp(1, 20), 15 * 0.2, 1e-9, '몬스터가 19레벨 낮음 → 0.2배 하한');
});
test('물리 피해 감소율 (방어력 23, 공격자 Lv1 → 27.7%)', ['physReduction'], () => {
    near(T.physReduction(23, 1), 23 / 83, 1e-9, '감소율');
    near(T.physReduction(100000, 1), 0.8, 1e-9, '상한 80%');
});
test('새 게임 시작 시 파생 수치', ['createNewGameState', 'calcDerivedStats'], () => {
    const s = T.createNewGameState(0);
    const d = T.calcDerivedStats(s);
    eq(s.floor, 1, '시작 층'); eq(s.player.level, 1, '레벨');
    near(d.maxHp, 100, 1e-9, '최대 HP'); near(d.maxMp, 50, 1e-9, '최대 MP'); near(d.maxStamina, 100, 1e-9, '최대 스태미너');
    near(d.physAtk, 6.9, 1e-9, '물리 공격력'); near(d.magicAtk, 4.6, 1e-9, '마법 공격력');
    near(d.critChance, 6.5, 1e-9, '치명타 확률(%)'); near(d.critDamage, 150, 1e-9, '치명타 피해(%)');
    near(d.walkSpeed, 5.2, 1e-9, '걷기 속도'); near(d.runSpeed, 8.32, 1e-9, '달리기 속도');
    near(d.attackInterval, 0.8 / 1.05, 1e-9, '실제 공격 간격'); near(d.hpRegen, 0.4, 1e-9, 'HP 회복');
    near(d.mpRegen, 1.0, 1e-9, 'MP 회복'); near(d.staminaRegen, 27.5, 1e-9, '스태미너 회복');
    near(d.defense, 3, 1e-9, '방어력');
    for (const el of ['fire', 'cold', 'lightning', 'poison']) near(d.res[el], 0, 1e-9, `저항 ${el}`);
    eq(s.player.skills.BA, 1, '기본 공격 Lv1');
    eq(JSON.stringify(s.player.actionSlots[0]), JSON.stringify({ type: 'skill', id: 'BA' }), '1번 행동 슬롯');
    eq(JSON.stringify(s.player.actionSlots[1]), JSON.stringify({ type: 'item', id: 'hp1' }), '2번 행동 슬롯');
    const potions = s.player.inventory.filter((it) => it && it.id === 'hp1').reduce((n, it) => n + it.count, 0);
    eq(potions, 3, '하급 생명력 물약 개수');
    eq(s.player.inventory.length, 40, '인벤토리 칸 수');
    eq(s.theme, 'backrooms', '지하 1층 테마');
    ok(s.world && Array.isArray(s.world.visited) && Array.isArray(s.world.merchantSoldOut), 'world.visited / merchantSoldOut 배열');
    ok(s.world.history && typeof s.world.history === 'object' && Object.keys(s.world.history).length === 0, 'world.history 는 빈 객체');
    eq(s.world.bossDefeated, false, 'world.bossDefeated');
});

// ---------------------------------------------------------------- 데이터 테이블
const SKILL_COORDS = {
    BA: [0, 0],
    M0: [0, 1], M1: [-1, 2], M2: [-2, 3], M3: [-3, 4], M4: [0, 2], M5: [0, 3], M6: [0, 4], M7: [1, 2], M8: [2, 3], M9: [3, 4],
    A0: [1, 0], A1: [2, 1], A2: [3, 2], A3: [4, 3], A4: [2, 0], A5: [3, 0], A6: [4, 0], A7: [2, -1], A8: [3, -2], A9: [4, -3],
    D0: [0, -1], D1: [1, -2], D2: [2, -3], D3: [3, -4], D4: [0, -2], D5: [0, -3], D6: [0, -4], D7: [-1, -2], D8: [-2, -3], D9: [-3, -4],
    S0: [-1, 0], S1: [-2, -1], S2: [-3, -2], S3: [-4, -3], S4: [-2, 0], S5: [-3, 0], S6: [-4, 0], S7: [-2, 1], S8: [-3, 2], S9: [-4, 3],
    X1: [4, 4], X2: [4, -4], X3: [-4, -4], X4: [-4, 4],
};
const PASSIVES = ['M2', 'M5', 'M8', 'A2', 'A5', 'A8', 'D2', 'D4', 'D6', 'D7', 'S1', 'S5', 'S7', 'S8', 'X2'];
test('스킬 45개 - 좌표·종류·이름·최대 레벨', ['SKILLS'], () => {
    eq(T.SKILLS.length, 45, '스킬 개수');
    const ids = new Set();
    for (const s of T.SKILLS) {
        ok(!ids.has(s.id), `중복 id ${s.id}`);
        ids.add(s.id);
        ok(SKILL_COORDS[s.id], `알 수 없는 id ${s.id}`);
        eq(`${s.x},${s.y}`, SKILL_COORDS[s.id].join(','), `${s.id} 좌표`);
        eq(s.type, PASSIVES.includes(s.id) ? 'passive' : 'active', `${s.id} 종류`);
        ok(typeof s.nameKo === 'string' && s.nameKo && typeof s.nameEn === 'string' && s.nameEn, `${s.id} 이름 누락`);
    }
    const total = T.SKILLS.reduce((n, s) => n + s.maxLv, 0) - 1; // 기본 공격은 Lv1 로 시작
    eq(total, 374, '모든 스킬 최대 레벨까지 필요한 스킬 포인트');
});
test('스킬 연결선 48개', ['SKILL_LINKS'], () => {
    eq(T.SKILL_LINKS.length, 48, '연결선 개수');
    const key = (a, b) => [a, b].sort().join('-');
    const set = new Set(T.SKILL_LINKS.map(([a, b]) => key(a, b)));
    eq(set.size, 48, '중복 없는 연결선 개수');
    const expect = [['BA', 'M0'], ['BA', 'A0'], ['BA', 'D0'], ['BA', 'S0'],
        ['M9', 'X1'], ['A3', 'X1'], ['A9', 'X2'], ['D3', 'X2'], ['D9', 'X3'], ['S3', 'X3'], ['S9', 'X4'], ['M3', 'X4']];
    for (const b of 'MADS') {
        for (const s of [1, 4, 7]) expect.push([`${b}0`, `${b}${s}`], [`${b}${s}`, `${b}${s + 1}`], [`${b}${s + 1}`, `${b}${s + 2}`]);
    }
    for (const [a, b] of expect) ok(set.has(key(a, b)), `연결선 누락: ${a}-${b}`);
});
test('소모품 21종', ['CONSUMABLES'], () => {
    const ids = Object.keys(T.CONSUMABLES);
    eq(ids.length, 21, '소모품 개수');
    for (const p of ['hp', 'mp', 'sta', 'cure', 'throw', 'elixir', 'scroll']) {
        for (const t of [1, 2, 3]) ok(T.CONSUMABLES[`${p}${t}`], `소모품 누락: ${p}${t}`);
    }
    eq(T.CONSUMABLES.hp1.price, 20, '하급 생명력 물약 가격');
    eq(T.CONSUMABLES.scroll3.price, 250, '귀환 주문서 가격');
});
test('장비 기본 아이템 36종 (시작 3 + 무기 15 + 방어구 9 + 보조 6 + 반지 3)', ['EQUIP_BASES'], () => {
    eq(Object.keys(T.EQUIP_BASES).length, 36, '장비 기본 아이템 개수');
    for (const p of ['sword', 'gsword', 'dagger', 'wand', 'staff', 'helm', 'armor', 'boots', 'shield', 'tome', 'ring']) {
        for (const t of [1, 2, 3]) ok(T.EQUIP_BASES[`${p}${t}`], `장비 누락: ${p}${t}`);
    }
    for (const id of ['pipe0', 'tracksuit0', 'shoes0']) ok(T.EQUIP_BASES[id], `시작 장비 누락: ${id}`);
    eq(T.EQUIP_BASES.gsword3.atk, 70, '미스릴 클레이모어 공격력');
    eq(T.EQUIP_BASES.staff2.magic, 28, '마법사 지팡이 마력');
});
const THEME_MONSTERS = {
    backrooms: ['br_shade', 'br_mannequin', 'br_lamp', 'br_mold', 'br_boss'],
    brick: ['bk_goblin', 'bk_archer', 'bk_orc', 'bk_shaman', 'bk_boss'],
    cave: ['cv_bat', 'cv_spider', 'cv_golem', 'cv_spore', 'cv_boss'],
    lava: ['lv_imp', 'lv_slime', 'lv_golem', 'lv_salamander', 'lv_boss'],
    void: ['vd_watcher', 'vd_stalker', 'vd_jelly', 'vd_sentinel', 'vd_boss'],
};
test('테마 5종·몬스터 25종', ['THEMES', 'MONSTER_TYPES'], () => {
    eq(Object.keys(T.THEMES).sort().join(','), 'backrooms,brick,cave,lava,void', '테마 id');
    eq(Object.keys(T.MONSTER_TYPES).length, 25, '몬스터 종류 수');
    for (const theme in THEME_MONSTERS) {
        const th = T.THEMES[theme];
        const normals = THEME_MONSTERS[theme].slice(0, 4), boss = THEME_MONSTERS[theme][4];
        ok(th.nameKo && th.nameEn, `${theme} 테마 이름`);
        eq([...th.monsters].sort().join(','), [...normals].sort().join(','), `${theme} 일반 몬스터`);
        eq(th.boss, boss, `${theme} 보스`);
        let sum = 0;
        for (const id of THEME_MONSTERS[theme]) {
            const m = T.MONSTER_TYPES[id];
            ok(m, `몬스터 정의 없음: ${id}`);
            eq(m.id, id, `${id} id`);
            eq(m.theme, theme, `${id} 테마`);
            eq(m.boss, id === boss, `${id} 보스 여부`);
            ok(m.nameKo && m.nameEn, `${id} 이름`);
            for (const k of ['hpMul', 'atkMul', 'defMul', 'speed']) ok(typeof m[k] === 'number', `${id}.${k} 숫자`);
            for (const el of ['fire', 'cold', 'lightning', 'poison']) ok(m.res[el] >= -50 && m.res[el] <= 75, `${id} 저항 범위 (${el})`);
            if (id !== boss) sum += m.weight;
        }
        eq(sum, 100, `${theme} 출현 가중치 합`);
    }
    // AGENTS.md 표와 대조 (일부)
    eq(T.MONSTER_TYPES.br_mannequin.speed, 7, '사무용 마네킹 이동 속도');
    eq(T.MONSTER_TYPES.bk_archer.attack.range, 20, '해골 궁수 사거리');
    eq(T.MONSTER_TYPES.cv_golem.defMul, 2.5, '바위 골렘 방어 배수');
    eq(T.MONSTER_TYPES.lv_boss.hpMul, 14, '용암 군주 HP 배수');
    eq(T.MONSTER_TYPES.lv_slime.res.cold, -50, '마그마 슬라임 냉기 저항');
    eq(T.MONSTER_TYPES.vd_jelly.res.lightning, 75, '별무리 해파리 전격 저항');
});
test('다음 테마 고르기 (현재 테마 제외, 나머지 4종 모두 나옴)', ['pickNextTheme'], () => {
    const ids = Object.keys(THEME_MONSTERS);
    for (const cur of ids) {
        const seen = new Set();
        for (let i = 0; i < 40; i++) {
            const next = T.pickNextTheme(cur, () => (i + 0.5) / 40);
            ok(ids.includes(next), `알 수 없는 테마 ${next}`);
            ok(next !== cur, `현재 테마 ${cur} 와 같은 테마가 나옴`);
            seen.add(next);
        }
        eq(seen.size, 4, `${cur} 다음에 나올 수 있는 테마 수`);
    }
});

// ---------------------------------------------------------------- 던전
const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
const OPP = { N: 'S', E: 'W', S: 'N', W: 'E' };
const PIECE_SIZE = { straight: 3, corner: 3, cross: 5, tee: 4, stairsUp: 3, stairsDown: 3, portal: 1, deadEnd: 1, merchant: 9, clearing: 13, sanctuary: 13 };
function neighborKey(c, dir) { return `${c.gx + DIRS[dir][0]},${c.gz + DIRS[dir][1]}`; }
function checkDungeon(d, floor) {
    const errs = [];
    const target = Math.min(512, 127 + floor);
    if (!(d.cells instanceof Map)) return ['cells 가 Map 이 아님'];
    if (d.cells.size !== target) errs.push(`칸 수 ${d.cells.size} (기대 정확히 ${target})`);
    for (const [k, c] of d.cells) {
        if (k !== `${c.gx},${c.gz}`) errs.push(`키 ${k} 와 좌표 ${c.gx},${c.gz} 불일치`);
        for (const dir of 'NESW') {
            const e = c.edges[dir];
            if (!['wall', 'door', 'open'].includes(e)) { errs.push(`${k} ${dir} 변 값 이상: ${e}`); continue; }
            const nk = neighborKey(c, dir);
            const n = d.cells.get(nk);
            if (!n) { if (e !== 'wall') errs.push(`${k} ${dir} 쪽은 빈 공간인데 ${e}`); continue; }
            if (n.edges[OPP[dir]] !== e) errs.push(`${k} ${dir}=${e} 와 이웃 ${nk} ${OPP[dir]}=${n.edges[OPP[dir]]} 불일치`);
            if (e === 'open' && n.pieceId !== c.pieceId) errs.push(`${k}-${nk}: 서로 다른 조각 사이는 open 불가`);
        }
        if (errs.length > 20) return errs;
    }
    // 도달 가능성 (BFS)
    const first = d.cells.keys().next().value;
    const seen = new Set([first]);
    const q = [first];
    while (q.length) {
        const c = d.cells.get(q.shift());
        for (const dir of 'NESW') {
            if (c.edges[dir] === 'wall') continue;
            const nk = neighborKey(c, dir);
            if (!seen.has(nk) && d.cells.has(nk)) { seen.add(nk); q.push(nk); }
        }
    }
    if (seen.size !== d.cells.size) errs.push(`도달 불가 칸 ${d.cells.size - seen.size}개`);
    // 조각 개수·크기
    const count = {};
    for (const p of d.pieces) {
        count[p.type] = (count[p.type] || 0) + 1;
        if (p.cells.length !== PIECE_SIZE[p.type]) errs.push(`${p.type} 조각 칸 수 ${p.cells.length}`);
        for (const k of p.cells) {
            const c = d.cells.get(k);
            if (!c || c.pieceId !== p.id) errs.push(`조각 ${p.id} 의 칸 ${k} 불일치`);
        }
    }
    const want = { stairsUp: floor === 1 ? 0 : 1, stairsDown: 1, portal: 1, merchant: 1 };
    for (const t in want) if ((count[t] || 0) !== want[t]) errs.push(`${t} 개수 ${count[t] || 0} (기대 ${want[t]})`);
    const sc = count.sanctuary || 0;
    if (sc < 1 || sc > 4) errs.push(`성소 개수 ${sc}`);
    const centers = d.pieces.filter((p) => p.type === 'sanctuary').map((p) => d.cells.get(p.center));
    for (let i = 0; i < centers.length; i++) {
        for (let j = i + 1; j < centers.length; j++) {
            const dist = Math.abs(centers[i].gx - centers[j].gx) + Math.abs(centers[i].gz - centers[j].gz);
            if (dist < 20) errs.push(`성소 사이 거리 ${dist} < 20`);
        }
    }
    // 외부 출입구 개수 (계단·포탈·상점은 정확히 1개)
    for (const p of d.pieces) {
        if (!['stairsUp', 'stairsDown', 'portal', 'merchant'].includes(p.type)) continue;
        let doors = 0;
        for (const k of p.cells) {
            const c = d.cells.get(k);
            for (const dir of 'NESW') {
                const n = d.cells.get(neighborKey(c, dir));
                if (n && n.pieceId !== p.id && c.edges[dir] === 'door') doors++;
            }
        }
        if (doors !== 1) errs.push(`${p.type} 외부 출입구 ${doors}개 (기대 1)`);
    }
    // 보스 층 (5의 배수) 에는 보스용 공터
    if (floor % 5 === 0) {
        const bp = d.pieces[d.bossPieceId];
        if (!bp || bp.type !== 'clearing') errs.push(`보스 층인데 bossPieceId 가 공터가 아님 (${d.bossPieceId})`);
    } else if (d.bossPieceId !== null) {
        errs.push(`보스 층이 아닌데 bossPieceId = ${d.bossPieceId} (null 이어야 함)`);
    }
    return errs;
}
test('던전 생성 - 결정성 (같은 시드·층 = 같은 결과)', ['generateDungeon'], () => {
    const a = T.generateDungeon(7, 3), b = T.generateDungeon(7, 3);
    eq([...a.cells.keys()].join('|'), [...b.cells.keys()].join('|'), '칸 목록');
});
test('던전 생성 - 구조 검사 (층 1·2·5·10·50·200·385·400, 시드 각 25개)', ['generateDungeon'], () => {
    for (const floor of [1, 2, 5, 10, 50, 200, 385, 400]) {
        for (let seed = 1; seed <= 25; seed++) {
            const d = T.generateDungeon(seed, floor);
            const errs = checkDungeon(d, floor);
            if (errs.length) throw new Error(`층 ${floor} 시드 ${seed}: ${errs.slice(0, 5).join(' / ')}`);
        }
    }
});
test('던전 - 지하 1층 새 게임 시작 위치는 성소 영역', ['generateDungeon', 'getSpawn'], () => {
    for (let seed = 1; seed <= 10; seed++) {
        const d = T.generateDungeon(seed, 1);
        const sp = T.getSpawn(d, 'newGame');
        const c = d.cells.get(sp.cellKey);
        ok(c && c.sanctuaryZone === true, `시드 ${seed}: 시작 칸 ${sp.cellKey} 가 성소 영역이 아님`);
    }
});
test('던전 - 도착 방식별 시작 위치 (newGame·descend·ascend·portal)', ['generateDungeon', 'getSpawn'], () => {
    const YAW = { N: 0, W: Math.PI / 2, S: Math.PI, E: -Math.PI / 2 };
    for (const floor of [1, 2, 9]) {
        for (let seed = 1; seed <= 10; seed++) {
            const d = T.generateDungeon(seed, floor);
            const kinds = floor === 1 ? ['newGame', 'ascend', 'portal'] : ['descend', 'ascend', 'portal'];
            for (const kind of kinds) {
                const sp = T.getSpawn(d, kind);
                const c = d.cells.get(sp.cellKey);
                ok(c, `층 ${floor} 시드 ${seed} ${kind}: 칸 ${sp.cellKey} 없음`);
                near(sp.x, c.gx * 16 + 8, 1e-9, `${kind} x (칸 중심)`);
                near(sp.z, c.gz * 16 + 8, 1e-9, `${kind} z (칸 중심)`);
                ok(c.pieceType !== 'portal' && c.role !== 'stairsStep1' && c.role !== 'stairsStep2', `${kind}: 트리거 칸(${c.role})에서 시작하면 안 됨`);
                ok(Object.values(YAW).some((y) => Math.abs(y - sp.yaw) < 1e-9), `${kind}: yaw ${sp.yaw} 는 4방향 값이어야 함`);
                const want = { descend: 'stairsUp', ascend: 'stairsDown' }[kind];
                if (want) eq(`${c.pieceType}/${c.role}`, `${want}/stairsFront`, `${kind} 시작 칸`);
            }
        }
    }
});
test('던전 - 계단 바닥 높이 (입구 0m → 끝 ±6m, 단조)', ['generateDungeon', 'floorHeightAt'], () => {
    for (let seed = 1; seed <= 15; seed++) {
        const d = T.generateDungeon(seed, 5);
        for (const p of d.pieces) {
            if (p.type !== 'stairsUp' && p.type !== 'stairsDown') continue;
            const f = d.cells.get(p.cells[0]);
            const [dx, dz] = DIRS[p.dir];
            const sx = f.gx * 16 + 8, sz = f.gz * 16 + 8;
            const sign = p.type === 'stairsDown' ? -1 : 1;
            let prev = 0;
            for (let s = 0; s < 40; s += 0.5) {
                const h = T.floorHeightAt(d, sx + dx * s, sz + dz * s);
                ok(sign * h >= sign * prev - 1e-9, `시드 ${seed} ${p.type}: ${s}m 지점 높이 ${h} 가 이전 ${prev} 보다 역행`);
                prev = h;
            }
            near(T.floorHeightAt(d, sx + dx * 8.01, sz + dz * 8.01), 0, 0.01, '계단 시작 높이');
            near(T.floorHeightAt(d, sx + dx * 39.9, sz + dz * 39.9), sign * 6, 0.05, '계단 끝 높이');
        }
    }
});
test('던전 - 칸별 벽 상자 (중심·문·열린 변은 통과, 벽 변은 막힘)', ['generateDungeon', 'buildCellBoxes'], () => {
    const inside = (b, x, z) => x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ;
    const mid = { N: [8, 0.3], S: [8, 15.7], W: [0.3, 8], E: [15.7, 8] };
    for (const floor of [1, 6]) {
        for (let seed = 1; seed <= 10; seed++) {
            const d = T.generateDungeon(seed, floor);
            for (const c of d.cells.values()) {
                const boxes = T.buildCellBoxes(c);
                const x0 = c.gx * 16, z0 = c.gz * 16;
                const blocked = (lx, lz) => boxes.some((b) => inside(b, x0 + lx, z0 + lz));
                const name = `층 ${floor} 시드 ${seed} 칸 ${c.gx},${c.gz}(${c.shape})`;
                ok(!blocked(8, 8), `${name}: 중심이 막힘`);
                for (const dir of 'NESW') {
                    const [lx, lz] = mid[dir];
                    const e = c.edges[dir];
                    if (e === 'wall') ok(blocked(lx, lz), `${name}: ${dir} 는 벽인데 통과됨`);
                    else ok(!blocked(lx, lz), `${name}: ${dir} 는 ${e} 인데 막힘`);
                    if (e === 'door') {
                        const pts = (dir === 'N' || dir === 'S') ? [[5.4, lz], [10.6, lz]] : [[lx, 5.4], [lx, 10.6]];
                        for (const [a, b] of pts) ok(!blocked(a, b), `${name}: ${dir} 문 폭이 6m 보다 좁음`);
                    }
                }
            }
        }
    }
});

// ---------------------------------------------------------------- 층 이동 기록
test('층 이동 기록 (위층 복귀 시 지도·테마 유지, 몬스터는 바로 위층만)', ['createNewGameState', 'applyFloorChange'], () => {
    let k = 7;
    const rnd = () => { k = (k * 9301 + 49297) % 233280; return k / 233280; };   // 테스트용 고정 난수
    const s = T.createNewGameState(0);
    s.dungeonSeed = 111;
    s.world.visited = ['0,0', '0,1'];
    const snapA = { monsters: [{ typeId: 'br_shade' }], corpses: [], drops: [] };
    let r = T.applyFloorChange(s, 'descend', snapA, rnd);
    eq(s.floor, 2, '내려간 층');
    eq(r.restored, false, '처음 가는 아래층은 새로 생성');
    ok(s.theme !== 'backrooms', '층을 옮기면 테마가 바뀌어야 함');
    eq(s.world.visited.length, 0, '새 층 방문 기록');
    eq(s.world.position, null, '새 층 위치 (getSpawn 사용)');
    const seed2 = s.dungeonSeed, theme2 = s.theme;
    s.world.visited = ['5,5'];
    s.world.merchantSoldOut = [2];
    const snapB = { monsters: [{ typeId: 'x' }], corpses: [{ typeId: 'y' }], drops: [] };
    T.applyFloorChange(s, 'descend', snapB, rnd);
    eq(s.floor, 3, '지하 3층');
    eq(s.world.history[1].runtime, null, '두 층 위 (지하 1층) 몬스터는 유지하지 않음');
    eq(JSON.stringify(s.world.history[2].runtime), JSON.stringify(snapB), '바로 위층 (지하 2층) 몬스터 유지');
    r = T.applyFloorChange(s, 'ascend', { monsters: [], corpses: [], drops: [] }, rnd);
    eq(s.floor, 2, '올라간 층');
    eq(r.restored, true, '위층 복원');
    eq(s.dungeonSeed, seed2, '위층 지도 (시드) 유지');
    eq(s.theme, theme2, '위층 테마 유지');
    eq(s.world.visited.join('|'), '5,5', '위층 방문 기록 유지');
    eq(s.world.merchantSoldOut.join('|'), '2', '위층 상인 품절 기록 유지');
    eq(JSON.stringify(r.runtime), JSON.stringify(snapB), '바로 위층이던 층의 몬스터·시체 복원');
    ok(!s.world.history[2] && !s.world.history[3], '현재 층과 아래층 기록은 없어야 함');
    r = T.applyFloorChange(s, 'ascend', null, rnd);
    eq(s.floor, 1, '지하 1층');
    eq(s.dungeonSeed, 111, '지하 1층 지도 유지');
    eq(s.theme, 'backrooms', '지하 1층 테마 유지');
    eq(s.world.visited.join('|'), '0,0|0,1', '지하 1층 방문 기록 유지');
    eq(r.runtime, null, '두 층 위였던 층의 몬스터는 새로 생성');
    const snapE = { monsters: [{ typeId: 'z' }], corpses: [], drops: [] };
    r = T.applyFloorChange(s, 'descend', snapE, rnd);
    eq(s.floor, 2, '다시 지하 2층');
    eq(r.restored, false, '아래층은 다시 새로 생성');
    ok(s.dungeonSeed !== seed2, '아래층으로 다시 내려가면 새 지도');
    const beforeTheme = s.theme;
    r = T.applyFloorChange(s, 'portal', null, rnd);
    eq(s.floor, 2, '포탈은 층 번호 유지');
    ok(s.theme !== beforeTheme, '포탈로 이동해도 테마가 바뀜');
    eq(JSON.stringify(s.world.history[1].runtime), JSON.stringify(snapE), '포탈 이동 뒤에도 바로 위층 몬스터 유지');
    const s2 = JSON.parse(JSON.stringify(s));   // 저장·불러오기 (JSON 왕복)
    T.applyFloorChange(s2, 'ascend', null, rnd);
    eq(s2.floor, 1, 'JSON 왕복 후 올라가기');
    eq(s2.dungeonSeed, 111, 'JSON 왕복 후 지하 1층 지도 유지');
    let threw = false;
    try { T.applyFloorChange(s2, 'ascend', null, rnd); } catch (e) { threw = true; }
    ok(threw, '지하 1층에서 위로 가면 오류');
    const s3 = T.createNewGameState(1);   // 기록 보관 한도 50층
    for (let i = 0; i < 60; i++) T.applyFloorChange(s3, 'descend', null, rnd);
    eq(s3.floor, 61, '60번 내려감');
    const keys = Object.keys(s3.world.history).map(Number);
    eq(keys.length, 50, '위층 기록은 50층까지만');
    eq(Math.min(...keys), 11, '가장 오래된 기록 층');
});

console.log(`\n결과: PASS ${pass}, FAIL ${fail}, SKIP ${skip}`);
process.exit(fail > 0 ? 1 : 0);
```

---

## 부록 B. 던전 생성 참조 구현 ([08] 섹션)

> 2026-10-25 AGENTS.md 변경으로 상인 조각이 3×3 → 1×1 방형 칸이 되었고 (`merchant: { rotations: 4, cells: [[0, 0, 'room', 'merchantCenter']], links: [], connectors: [[0, 'N']] }`, `PIECE_SIZE.merchant = 1`), `tryPlaceAt` 에 `merchantClearingOk` (상점 칸과 공터 3×3 칸 사이 체비쇼프 거리 4 이상), 생성 성공 직후 `markMerchantZone` 이 더해졌다 (U51). 아래 코드는 그 전 모습이다 (기준은 실제 파일).

### B.1 알고리즘 설명

1. 목표 칸 수 `target = min(512, 127 + floor)`.
2. 시작 조각을 (0, 0) 에 놓는다. 지하 1층 = 성소 (새 게임 시작 위치), 그 외 = 십자 복도.
3. 필수 조각 목록: 아래 계단, 포탈, 상인 (+ 2층 이상이면 위 계단, 성소 1개, + 5의 배수 층이면 보스용 공터). 순서를 섞는다. 추가 성소 시도 횟수는 0~3 중 무작위 (성소는 총 1~4개).
4. **프런티어** = 아직 연결되지 않은 출입구 목록 `{ 칸, 방향 }` (그 방향의 이웃 칸이 비어 있는 것만).
5. 반복:
   - 칸 수 = target 이고 필수 조각을 모두 놓았으면 끝.
   - 프런티어가 비면 실패 (다른 난수로 처음부터 다시).
   - `reserve` = 남은 필수 조각의 칸 수 합, `room = target − 현재 칸 수 − reserve` (일반 조각에 쓸 수 있는 칸 수).
   - 필수 조각 차례 (현재 칸 수가 다음 배치 지점 이상, 또는 `room < 13`) 이면 모든 프런티어에서 놓아 본다. 성공하면 다음 반복. 보스용 공터를 놓았으면 그 조각 id 를 `bossPieceId` 에 기록한다.
   - 추가 성소: 4% 확률로 시도 (`room ≥ 13`, 다른 성소와 맨해튼 거리 20 이상).
   - 일반 성장: 크기가 `room` 이하인 조각 중 가중치로 하나 골라 무작위 프런티어 3곳에 놓아 본다.
6. 조각 놓기 (`tryPlaceAt`): 프런티어 `{ 칸 A, 방향 d }` 의 이웃 칸 T 에, 조각 (회전 변형 중 하나) 의 `반대(d)` 방향 출입구가 오도록 위치를 맞춘다. 조각의 모든 칸이 비어 있어야 한다. 놓으면 A–T 사이 변을 `door` 로 만들고, 조각 안의 링크를 연결한다. 조각의 다른 출입구 중 이미 칸이 있는 쪽은, 그 칸이 마주 보는 프런티어였을 때만 `door` 로 연결하고 (고리가 생김), 아니면 벽으로 둔다. 빈 쪽은 프런티어에 추가한다. 기존 프런티어 중 이웃이 채워진 것은 지운다.
7. 끝나면 남은 프런티어는 그대로 벽이 된다 (막다른 길).
8. 실패하면 `attempt + 1` 로 다른 난수를 써서 다시 (최대 50회, 실제로는 거의 0~1회).

조각은 항상 기존 조각의 출입구에 붙여서 놓으므로 모든 칸이 걸어서 연결된다. 일반 조각은 남은 칸 수 이하만 고르고 1칸짜리 `deadEnd` 가 있으므로 블록 수가 목표와 정확히 같아진다.

### B.2 코드

필요한 것: [01] `CELL_SIZE`, `CELL_HEIGHT` / [02] `clamp`, `hashInts`, `createRng` (부록 D 에 있음).

```js
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
    merchant: (() => {
        const b = roomBlock('merchantRoom', 'merchantCenter');
        return { rotations: 4, cells: b.cells, links: b.links, connectors: [[b.idx(0, -1), 'N']] };   // 입구는 한 방향
    })(),
    clearing: roomWithPassages('clearingRoom', 'clearingCenter'),
    sanctuary: roomWithPassages('sanctuaryZone', 'sanctuaryCenter'),
};
const PIECE_SIZE = { straight: 3, corner: 3, cross: 5, tee: 4, stairsUp: 3, stairsDown: 3, portal: 1, deadEnd: 1, merchant: 9, clearing: 13, sanctuary: 13 };
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
function tryGenerateDungeon(rng, floor) {
    const target = Math.min(512, 127 + floor);
    const d = { floor, targetCount: target, cells: new Map(), pieces: [], frontier: [], bossPieceId: null };
    const startType = floor === 1 ? 'sanctuary' : 'cross';
    commitPiece(d, startType, PIECE_VARIANTS[startType][0], 0, 0, null, null);
    const required = [];
    if (floor >= 2) required.push('stairsUp', 'sanctuary');
    required.push('stairsDown', 'portal', 'merchant');
    if (floor % 5 === 0) required.push('clearing');   // 보스 층: 보스가 있을 공터
    rng.shuffle(required);
    let extraSanctuaries = rng.int(0, 3);
    const step = (target * 0.8) / required.length;   // 필수 조각을 목표의 80% 안에 고르게 배치
    let nextCheckpoint = step;
    for (let guard = 0; guard < 20000; guard++) {
        if (d.cells.size >= target && required.length === 0) {
            delete d.frontier;   // 남은 프런티어는 벽 (막다른 길) 으로 둔다
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
// 같은 (seed, floor) 는 항상 같은 던전
function generateDungeon(seed, floor) {
    for (let attempt = 0; attempt < 50; attempt++) {
        const d = tryGenerateDungeon(createRng(hashInts(seed, floor, attempt)), floor);
        if (d) {
            d.seed = seed;
            d.attempt = attempt;
            return d;
        }
    }
    throw new Error(`던전 생성 실패: seed=${seed}, floor=${floor}`);
}

// --- 위치 관련 보조 함수
function cellAtWorld(d, x, z) { return d.cells.get(cellKey(Math.floor(x / CELL_SIZE), Math.floor(z / CELL_SIZE))) || null; }
function cellCenter(cell) { return { x: cell.gx * CELL_SIZE + CELL_SIZE / 2, z: cell.gz * CELL_SIZE + CELL_SIZE / 2 }; }
// 도착 방식별 시작 위치. arrival: 'newGame' | 'descend' (내려와서 도착) | 'ascend' (올라와서 도착) | 'portal'
function getSpawn(d, arrival) {
    let cell = null, face = 'N';
    if (arrival === 'newGame') {
        const p = d.pieces.find((q) => q.type === 'sanctuary');
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

// --- 계단
const STAIRS_DEPTH = 6;   // 계단이 내려가는 / 올라가는 높이 (m)
// 계단 진행도: step1 칸의 시작 변 = 0, step2 칸의 끝 변 = 1. 계단 칸이 아니면 0
function stairsProgress(d, cell, x, z) {
    const idx = cell.role === 'stairsStep1' ? 0 : (cell.role === 'stairsStep2' ? 1 : -1);
    if (idx < 0) return 0;
    const dir = d.pieces[cell.pieceId].dir;
    const x0 = cell.gx * CELL_SIZE, z0 = cell.gz * CELL_SIZE;
    let local;   // 칸 안에서 진행 방향으로 들어온 거리
    if (dir === 'S') local = z - z0;
    else if (dir === 'N') local = z0 + CELL_SIZE - z;
    else if (dir === 'E') local = x - x0;
    else local = x0 + CELL_SIZE - x;
    return clamp((idx * CELL_SIZE + local) / (2 * CELL_SIZE), 0, 1);
}
// (x, z) 의 바닥 높이. 계단 칸만 0 이 아니다
function floorHeightAt(d, x, z) {
    const cell = cellAtWorld(d, x, z);
    if (!cell || cell.role === 'stairsFront') return 0;
    if (cell.pieceType !== 'stairsUp' && cell.pieceType !== 'stairsDown') return 0;
    return (cell.pieceType === 'stairsDown' ? -STAIRS_DEPTH : STAIRS_DEPTH) * stairsProgress(d, cell, x, z);
}

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
```

---

## 부록 C. 상자 목록 → 지오메트리 하나 ([10] 섹션)

BufferGeometryUtils 가 없으므로 상자들을 직접 하나의 `BufferGeometry` 로 만든다. UV 는 월드 좌표 ÷ `tile` 이라서 텍스처가 상자 사이에서 자연스럽게 이어진다. (삼각형 감김 방향·법선 검증 완료)

```js
// 축 정렬 상자 목록 → BufferGeometry 1개. box: { minX, maxX, minY, maxY, minZ, maxZ }
// tile: 텍스처 1장이 덮는 길이 (m). 예: 4 → 4m 마다 반복
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
```

---

## 부록 D. 0단계 골격 (undergrounds.js 전체 교체용)

0-2 에서 `www/js/undergrounds.js` 를 이 내용으로 바꾼다. (Node import·헤드리스 Edge 표시 검증 완료)

```js
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
const STORAGE_KEY_SETTINGS = 'undergrounds.settings';
const STORAGE_KEY_SLOT_PREFIX = 'undergrounds.save.';   // 뒤에 0~3 을 붙임
const DEFAULT_SETTINGS = { lang: 'ko', quality: 'normal' };

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

// ===== [03] 다국어 =====
const I18N = {
    ko: {
        'game.title': 'Undergrounds',
        'title.clickToContinue': '계속하려면 클릭하세요',
    },
    en: {
        'game.title': 'Undergrounds',
        'title.clickToContinue': 'Click to continue',
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

// ===== [04] 데이터 - 스킬 =====
// ===== [05] 데이터 - 아이템·장비 =====
// ===== [06] 데이터 - 몬스터·상태이상 =====
// ===== [07] 공식 (스탯·전투·경험치) =====
// ===== [08] 던전 생성 =====

// ===== [09] 게임 상태·저장 =====
function storageGet(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
function storageSet(key, value) { try { window.localStorage.setItem(key, value); return true; } catch (e) { console.error('[저장 실패]', e); return false; } }
function storageRemove(key) { try { window.localStorage.removeItem(key); } catch (e) { /* 무시 */ } }
function loadSettings() {
    const raw = storageGet(STORAGE_KEY_SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    try {
        const o = JSON.parse(raw);
        return {
            lang: (o.lang === 'ko' || o.lang === 'en') ? o.lang : DEFAULT_SETTINGS.lang,
            quality: (o.quality === 'low' || o.quality === 'normal') ? o.quality : DEFAULT_SETTINGS.quality,
        };
    } catch (e) { return { ...DEFAULT_SETTINGS }; }
}
function saveSettings(settings) { return storageSet(STORAGE_KEY_SETTINGS, JSON.stringify(settings)); }

// ===== [10] 렌더링 - 공용 (텍스처·재질) =====
// ===== [11] 렌더링 - 던전 =====
// ===== [12] 입력 =====
// ===== [13] 플레이어 =====
// ===== [14] 몬스터·전투·투사체 =====
// ===== [15] 스킬 실행 =====
// ===== [16] 아이템 사용·드롭·상점 =====

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
    color: #e8e2d0; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; font-size: 28px; user-select: none; }
.ug-canvas { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; display: block; }
.ug-ui { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; pointer-events: none; }
.ug-ui * { pointer-events: auto; }
.ug-ui .ug-hud, .ug-ui .ug-hud * { pointer-events: none; }
.ug-fill { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.ug-center { display: flex; flex-direction: column; align-items: center; justify-content: center; }
`;
function injectStyle() {
    if (document.getElementById('ug-style')) return;
    const style = document.createElement('style');
    style.id = 'ug-style';
    style.textContent = STYLE_TEXT;
    document.head.appendChild(style);
}

// ===== [18] UI - 메뉴 화면 =====
const SCREENS = {};   // 화면 이름 → { enter(params), exit(), update(dt) }
SCREENS.title = {
    enter() {
        const root = el('div', 'ug-fill ug-center');
        root.appendChild(el('div', '', t('game.title')));
        root.appendChild(el('div', '', t('title.clickToContinue')));
        app.uiRoot.appendChild(root);
    },
    exit() { },
    update(dt) { },
};

// ===== [19] UI - HUD =====
// ===== [20] UI - 시스템 메뉴 =====

// ===== [21] 메인 (initialize·루프) =====
const app = {
    container: null, stage: null, stageScale: 1, canvas: null, uiRoot: null,
    renderer: null, scene: null, camera: null,
    settings: null, screen: null, screenName: '', lastTime: 0,
};
function showScreen(name, params) {
    const next = SCREENS[name];
    if (!next) throw new Error('없는 화면: ' + name);
    if (app.screen && app.screen.exit) app.screen.exit();
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
    if (app.screen && app.screen.update) app.screen.update(dt);
    app.renderer.render(app.scene, app.camera);
}
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
        app.camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 200);
        fitStage();
        window.addEventListener('resize', fitStage);
        app.lastTime = performance.now();
        requestAnimationFrame(frame);
        showScreen('title');
    },
};

// ===== [22] 내보내기 =====
export const __TEST__ = { clamp, lerp, hashInts, createRng };
export default Undergrounds;
if (typeof window !== 'undefined') window.Undergrounds = Undergrounds;
```

골격 설명:
- 렌더러는 한 번만 만든다 (`antialias: true`). 그래픽 품질 설정은 내부 해상도만 바꾼다 (`applyGraphicsQuality`).
- 화면 (`SCREENS.이름`) 은 `enter(params)` / `exit()` / `update(dt)` 를 가진다. `showScreen` 이 바꿀 때 `app.uiRoot` 를 비운다. 3D 객체는 각 화면이 `enter` 에서 `app.scene` 에 넣고 `exit` 에서 빼고 dispose 한다.
- `frame` 은 `dt` 를 0.05초로 제한한다.

---

## 부록 E. 입력·포인터 락 ([12] 섹션)

5-2 에서 [12] 섹션에 넣는다. `initialize` 에서 stage·canvas 를 만든 뒤 `setupInput()` 을 한 번 호출하고, `frame()` 의 렌더링 뒤에 `endInputFrame()` 을 호출한다. (`node --check` · Node import 검증 완료)

```js
const input = {
    keys: new Set(),          // 지금 눌려 있는 키 (e.code)
    pressed: new Set(),       // 이번 프레임에 새로 눌린 키 (endInputFrame 에서 비움)
    mouseRight: false,        // 오른쪽 버튼을 누르고 있는 중
    leftClicked: false,       // 이번 프레임에 왼쪽 버튼을 눌렀음
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
    window.addEventListener('blur', () => { input.keys.clear(); input.mouseRight = false; });
    app.stage.addEventListener('contextmenu', (e) => e.preventDefault());
    app.stage.addEventListener('mousedown', (e) => {
        if (e.button === 2) input.mouseRight = true;
        if (e.button === 0) input.leftClicked = true;
    });
    window.addEventListener('mouseup', (e) => { if (e.button === 2) input.mouseRight = false; });
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
        if (!locked) input.mouseRight = false;
        if (input.onLockChange) input.onLockChange(locked);
    });
}
// 반드시 클릭 이벤트 핸들러 안에서 호출한다 (키 입력·타이머에서 호출하면 브라우저가 거부)
function requestLock() {
    try {
        const p = app.canvas.requestPointerLock();
        if (p && typeof p.catch === 'function') p.catch(() => { /* 락 해제 직후 재요청 등: 무시, 오버레이 유지 */ });
    } catch (e) { /* 무시 */ }
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
```

사용 예:
- 게임 업데이트에서 `if (input.locked) { … 시점·이동·공격 처리 … }`
- 우클릭 연속 사용: `if (input.locked && input.mouseRight) tryUseActiveSlot();`
- 상호작용: `if (input.locked && input.leftClicked) tryInteract();`
- 한 번 눌림 판정 (점프 등): `input.pressed.has('Space')`, 계속 눌림 (이동·달리기): `input.keys.has('KeyW')`

---

## 부록 F. 원-상자 충돌 ([13] 섹션)

주인공·몬스터의 발밑 원 (XZ 평면) 과 벽 상자 (`view.collision`) 의 충돌. 모든 벽 상자는 높이가 충분하므로 2D 로 처리한다. (생성된 던전 20개에서 무작위 이동 40만 회, 벽 관통·이탈 0)

```js
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
```

---

## 부록 G. 테마·층 기록 ([09] 섹션)

> **2026-10-18: 아래 코드는 옛 규칙** (위층만 기록·다시 내려가면 새 층·위로 50층 제한·몬스터는 바로 위층만) 이다. AGENTS.md 의 층 정보 저장 규칙이 바뀌어 같은 날 7-7 에서 새 규칙 (7-7 의 의사 코드, 6.9) 으로 바꿨다. **기준은 실제 파일** ([09] `makeFloorRecord`, `ensureNextFloor`, `applyFloorChange`) 이며 이 부록은 기록용으로만 남긴다.

3-8 에서 [09] 섹션에 넣는다. 순수 함수이며 3D·몬스터 객체는 다루지 않는다. 7단계의 `changeFloor` 가 이 함수로 상태를 바꾼 뒤 그 결과대로 던전·몬스터를 다시 만든다. (자체 테스트 "층 이동 기록" 으로 검증 완료)

```js
const THEME_IDS = ['backrooms', 'brick', 'cave', 'lava', 'void'];
const HISTORY_LIMIT = 50;   // 위층 기록을 보관하는 최대 층 수 (U18)

// 현재 테마와 다른 테마를 무작위로 고른다 (U16). rnd: () => 0 이상 1 미만
function pickNextTheme(current, rnd) {
    const others = THEME_IDS.filter((id) => id !== current);
    return others[Math.floor(rnd() * others.length)];
}

// 층 이동 시 state 를 바꾼다 (AGENTS.md "던전 테마" + U16~U19)
//   kind:           'descend' (아래 계단) | 'ascend' (위 계단) | 'portal'
//   leavingRuntime: 떠나는 층의 몬스터·시체·바닥 아이템 스냅샷 (6.9, 없으면 null)
//   rnd:            () => 0 이상 1 미만 (새 시드·테마 결정, 게임에서는 Math.random)
// 반환: { restored: 위층 기록을 복원했으면 true, runtime: 복원할 스냅샷 (null 이면 몬스터를 새로 생성) }
function applyFloorChange(state, kind, leavingRuntime, rnd) {
    const w = state.world;
    const history = w.history;
    const leaving = {
        floor: state.floor, seed: state.dungeonSeed, theme: state.theme,
        visited: w.visited.slice(), merchantSoldOut: w.merchantSoldOut.slice(),
        bossDefeated: w.bossDefeated, runtime: leavingRuntime || null,
    };
    let restored = null;
    if (kind === 'descend') {
        history[leaving.floor] = leaving;                 // 떠나는 층은 이제 위층이 되므로 기록
        state.floor = leaving.floor + 1;
    } else if (kind === 'ascend') {
        if (leaving.floor <= 1) throw new Error('지하 1층에서는 위로 갈 수 없음');
        state.floor = leaving.floor - 1;
        restored = history[state.floor] || null;          // 떠나는 층 (아래층) 은 기록하지 않는다 (U17)
    } else if (kind !== 'portal') {
        throw new Error('알 수 없는 층 이동: ' + kind);
    }                                                     // portal: 같은 층 번호의 새 층, 떠나는 층은 기록하지 않음
    // 현재 층과 그 아래 층의 기록은 지운다 (아래층은 항상 새로 생성)
    for (const key of Object.keys(history)) if (Number(key) >= state.floor) delete history[key];
    if (restored) {
        state.dungeonSeed = restored.seed;
        state.theme = restored.theme;
        w.visited = restored.visited.slice();
        w.merchantSoldOut = restored.merchantSoldOut.slice();
        w.bossDefeated = restored.bossDefeated;
    } else {
        state.dungeonSeed = Math.floor(rnd() * 2147483647);
        state.theme = pickNextTheme(leaving.theme, rnd);
        w.visited = [];
        w.merchantSoldOut = [];
        w.bossDefeated = false;
    }
    w.position = null;                                    // 시작 위치는 getSpawn(dungeon, kind) 로 정한다
    // 너무 오래된 기록은 삭제, 몬스터·시체는 바로 위층 기록에만 남긴다
    for (const key of Object.keys(history)) {
        const f = Number(key);
        if (f < state.floor - HISTORY_LIMIT) delete history[key];
        else if (f !== state.floor - 1) history[key].runtime = null;
    }
    return { restored: !!restored, runtime: restored ? restored.runtime : null };
}
```
