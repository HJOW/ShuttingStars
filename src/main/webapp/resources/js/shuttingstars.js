/**
 * Shutting Stars
 * 
 *     핵심 JavaScript Library
 *     주의 (usingWorker 사용 시 shuttingstarworker.js 와 같이 사용해야 함)
 */

/*

LICENSE

Copyright 2026 HJOW (hujinone22@naver.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. 
 
 */

/* 게임 기동 근간을 이루는 전역 객체 */
class ShuttingStarsCore {
    /*** 게임 버전 ***/
    /** @type {number} 빌드 번호 */
    build = 3;
    
    /*** 화면 크기와 캔버스 렌더링 해상도 관련 ***/
    /** @type {{w: number, h: number}} 렌더링 해상도, 화면 출력 품질을 결정함. */
    resolution    = {w : 1280, h : 720};
    /** @type {{w: number, h: number}} 해상도의 설정값 (기기 방향과 관계없이 더 긴 길이가 w, 짧은 길이가 h) */
    ressets       = {w : 1280, h : 720};

    /** @type {{w: number, h: number}} 게임 내 무대의 절대크기, 해상도와는 별도로, 게임 내 객체들의 위치의 범위 */
    stageSize     = {w : 1280, h : 720};
    /** @type {{w: number, h: number}} 화면 비율에 맞게 변형된 실제 크기. 화면 비율이 16:9보다 커지는 경우 stageSize 와 값이 달라짐. 이 경우 stageSize 외 영역에는 장식용 객체만 배치될 수 있음. */
    realStageSize = {w : 1280, h : 720};

    /** @type {{w: number, h: number}} 브라우저 영역 Outer 크기와 Inner 크기 간 차이, 게임 초기화 시 계산하며, 이후 창 크기 변경될 때마다 canvas 크기값 계산에 사용됨 */
    gap = { w : 0, h : 0 };
    /** @type {Object} 페이지, 스테이지, 노트 영역별 여백 설정 */
    margins = {
        page  : { left :  0, top : 0 }, // 페이지 전체 여백
        stage : { left :  0, top : 0 }, // 스테이지 여백 (캔버스 내 빈 공간으로 구현됨)
        note  : { left : 20, top : 0 }  // 노트 여백 (노트 안쪽 여백)
    };

    /** @type {boolean} 기기 방향값, 수평 방향이면 true, 수직 방향이면 false (창 크기 변경 시 자동 탐지되어 변경됨) */
    screenDirLandscape = true;

    /*** 백엔드 **/
    /** @type {ShuttingStarsInterface|null} 백엔드 서버와의 통신을 담당하는 객체로 shuttingstarsinterface.js의 ShuttingStarsInterface 타입 객체가 들어와야 함. null 로 넣어도 게임 자체는 정상 동작하며 서버 통신관련 기능만 비활성화됨. */
    backend = null;

    /*** 대체 모드 (게임 구동이 아닌 다른 형태로 이 js 사용 시 변경) ***/
    /** @type {boolean} 곡 생성 모드, true 시 키보드 컨트롤 불가하며 자동 플레이가 진행됨. 플레이 완주해도 기록이 남지 않음. 기본값은 물론 false. */
    createMode = false;

    /*** 가상키 출력 관련 설정 ***/
    /** @type {boolean} 가상 키 출력 여부 */
    virtualKey      = false;
    /** @type {boolean} 가상 키 강제 비활성화 옵션 (init 에서만 효과가 있음) */
    virtualKeyNone  = false;
    /** @type {boolean} 가상 키 강제 활성화 옵션 (init 에서만 효과가 있음, virtualKeyNone 보다 우선순위 낮음) */
    virtualKeyForce = false;

    /*** 화면 출력 관련 세부 설정 ***/
    /** @type {number} z-index 값, BGA 출력되는 video 영역 z-index 가 이 값으로 설정되며, 그 위의 메인 canvas 가 이 값 + 1, 그 위 3D 담당 canvas 가 이 값 + 2 의 z-index 를 가짐. */
    canvasZindex = 1;
    /** @type {boolean} 어두운 색상 테마 적용 여부입니다. */
    dark = true;
    /** @type {boolean} 수직 반전 (convertY 메소드 사용 시 위 아래가 반전됨, 함부로 변경하지 말 것 ! 모든 render 메소드 점검해야 함.) */
    reverseVertical = false;
    /** @type {number} 글꼴 크기 비율 (해상도와 별도) */
    fontSizeRatio = 1.0;
    /** @type {boolean} 선명도 (alpha) 값 미지원하는 경우 rgb 값 자체를 변경하여 비슷하게 구현하는 기능 사용여부 */
    colorManualAlpha = false;

    /*** 글꼴 관련 ***/
    /** @type {string} 메인 폰트, alterFonts 가 뒤에 붙음 */
    fontFamily = 'D2Coding';
    /** @type {string} 강조할 일이 있을 때 fontFamily 대신 사용되는 폰트, alterFonts 가 뒤에 붙음 */
    pointFont  = 'NanumMyeongjo';
    /** @type {string} 대체 폰트, 여러 개 지정 시 뒤쪽에 한 칸 띄고 다음 폰트를 기재하면 된다. */
    alterFonts = 'NanumGothicCoding NanumGothic "Noto Sans KR" "Noto Sans JP" "Noto Sans SC"';

    /*** DOM 영역 변수들 (게임 초기화 중 할당됨) ***/
    /** @type {HTMLElement|null} ShuttingStars 게임이 돌아가는 DOM 의 최상위 DIV */
    rootDiv = null;
    /** @type {HTMLElement|null} 위 rootDiv 를 div로 한번 더 감싼 div */
    contentRoot = null;
    /** @type {HTMLVideoElement|null} 2D 캔버스 아래에 위치한 video 태그로, 곡 플레이 시 해당 곡의 BGA가 재생되는 영역 */
    videoBga = null;
    /** @type {Object} 팝업 (별도 창이 아닌 인앱 대화상자 형태) */
    pops = {
        root : null,     // 팝업 최상위 div
        dim : null,      // 모달 팝업 구현을 위한 흐린 투명 레이어 div, canvas 보다 위층을 차지함
        config : null,   // 설정 팝업 영역 div
        login : null,    // 로그인 팝업 영역 div
        join : null      // 회원가입 팝업 영역 div (현재 미사용)
    };
    /** @type {HTMLElement|null} 상세 설정 영역 */
    configDiv = null;

    /*** DOM 영역 변수들 (Canvas 객체들) ***/
    /** @type {HTMLCanvasElement|null} 2D 캔버스 객체 (메인 게임 동작) */
    canvas = null;
    /** @type {HTMLCanvasElement|null} 3D 장식 출력용 캔버스 객체 (2D 바로 윗층에 위치) */
    canvas3d = null;
    
    /*** 입력키 설정 ***/
    /** @type {Array<string>} 곡 플레이 시 입력 키 (6자리) */
    keyList = ['S', 'D', 'F', 'H', 'J', 'K'];
    /** @type {Array<string>} 방향키 */
    arrowKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT'];
    /** @type {string} 확인 키 */
    enterKey = 'ENTER';
    /** @type {string} 취소 키 */
    escKey = 'ESCAPE';
    
    /** @type {boolean} true 시 키 입력 처리가 먹히지 않음. 인앱 팝업이 떴을 때 이 값을 true로 넣어 뒷배경에서 게임이 멋대로 돌아가는 현상을 방지함. 즉 함부로 손대면 안 됨 ! */
    keyEventDisabled = false;

    /** @type {AudioContext|null} Audio Context 객체 (미지원 시 null 유지) */
    audioCtx = null;
    /** @type {string} URL Context Path */
    urlCtx = './';

    /** @type {CanvasRenderingContext2D|null} 2D Context 객체 */
    ctx = null;
    /** @type {ShuttingStars3DManager|null} ShuttingStars3DManager 객체 */
    ss3d = null;
    /** @type {boolean} true 지정 시 3D 렌더링하지 않음, 설정 화면에서 그래픽 설정 변경 시 자동 변경되는 항목이므로 손대지 말 것. */
    disable3d = false;
    /** @type {boolean} true 지정 시 게임 플레이 중 2D 렌더링하지 않음. disable3d 가 false 여야 동작함. 3D 켠다고 해도 NotePlacer 는 2D 것을 띄울 예정이므로 항시 false 로 둘 것 */
    disable2d = false;

    /*** 3D 각 구성요소 사용여부 설정 ***/
    /** @type {Object} 게임 요소별 3D 렌더링 사용 여부를 저장합니다. */
    use3d = {
        notePlacer : false,    // NotePlacer - 3D로 띄우면 투명도가 적용이 안되어 2D 것을 사용하므로 false 지정
        notes : true,          // Note - 노트들은 3D 띄워도 별 문제 없었음
        planet : true,         // 행성 (HP바) - 3D 객체가 아예 안뜨는 문제가 있음. 그래서 true 로 두든 false 로 두든 상관이 없는 상황.
        visualization : true   // 시각화 - 구현 완료
    };

    /*** 게임 밸런스 관련 설정값 중 상수에 해당하는 값들 (저장되는 설정이 아님) ***/
    /** @type {number} render 호출 주기 (변경 불가) - 밀리초 단위로, 이 시간 주기마다 render 메소드가 호출되며, 낮을수록 화면이 부드럽게 변함. */
    frameTime = 10;
    /** @type {number} 최소 시간 단위에 영향. 이 게임 내 소요시간 (elapsedTime) 최소단위는 해당곡의 1비트 시간을 이 값으로 나눈 값. */
    timeMultiplier = 16.0;
    /** @type {number} timeMultiplier 값와 같이 움직임. 1.0 으로 둘 것. */
    elapsedTimeMultiplier = 1.0;
    /** @type {number} 스테이지의 세로를 이 숫자만큼 등분하여, 노트의 크기, 초기 생성 위치를 계산함. */
    stageRows = 72;
    /** @type {number} 노트 크기 상수, 이 값이 증가하면 노트 크기가 증가함. 노트 속도에도 비례하게 영향을 끼침. */
    sizeFixedConst = 2;
    /** @type {number} 노트 위치 보정 상수. 사용자가 변경할 수 없는 값 (변경 가능한 보정 상수는 따로 있음) */
    noteLocationConst = 0;
    /** @type {number} 노트 이동 속도 배수. 사용자가 변경할 수 없는 값 (변경 가능한 보정 상수는 따로 있음) */
    noteSpeedFixedConst = 0.25;
    /** @type {number} 일시정지 후 재개 전 대기 타임 상수 */
    resumeDelayTime = 16;
    /** @type {number} 곡 로딩 기본 시간 */
    songTitleBaseTime = 120;
    /** @type {number} 볼륨 상수 */
    volumeMultiplier = 1.0;
    /** @type {number} 배경 별빛 장식 최대 갯수 */
    backStarlightCount = 30;
    /** @type {number} 배경 별빛 장식 X 속도 (게임 중 변경됨) */
    backStarlightSpdX = 1;
    /** @type {number} 배경 별빛 장식 Y 속도 (게임 중 변경됨) */
    backStarlightSpdY = 0;

    /*** 공지사항 메시지 (타이틀 및 메뉴 화면 하단에 출력됨) ***/
    /** @type {string} 공지사항 (영문) */
    noticeEn   = '';
    /** @type {string} 공지사항 (한글) */
    noticeKo   = '';
    /** @type {number} 마지막 공지사항 게시일시 (백엔드 필요) */
    noticeWhen = 0;
    

    /** @type {number} 마스터 볼륨 (0 ~ 1) */
    volume = 1.0;
    /** @type {number} 배경 음악 기본 볼륨 */
    volumeBackgroundDefault = 0.2;
    /** @type {number} 노트 이동 속도 배수 (사용자가 지정 가능) */
    noteSpeedMultiplier = 1.0;
    /** @type {boolean} 시각화 사용여부 */
    useAudioVisualizer = true;

    /** @type {number} 배경음악 볼륨 (게임 진행 중 변경됨) */
    volumeBackground = 1.0;
    /** @type {number} 플레이 곡 볼륨 (게임 진행 중 변경됨) */
    volumeSongAudio  = 1.0;
    /** @type {number} 배경음악 볼륨 페이드 인/아웃 속도값 (음수일 때는 volumeBackground 값이 감소하며 0 이하가 되면 멈춤, 양수일 때는 값이 증가하며 1 이상이 되면 멈춤) */
    volumeBackgroundSpeed = 0;

    /** @type {number} 객체 ID 부여용 카운터 */
    lastObjectId = 0;
    /** @type {Array<ShuttingStarsObject>} 항상 렌더링 대상인 객체들 (주로 장식) */
    objects = [];
    /** @type {Array<ShuttingStarsObject>} 상태가 playing 중일 때 렌더링 대상 객체들 (NotePlacer, Note 등 주요 게임 구성요소) */
    objectsPlaying = [];
    /** @type {Array<ShuttingStars3DObject>} 항상 렌더링 대상인 3D 객체들 (장식, ShuttingStars3DObject 타입만 원소로 입력해야 함) */
    object3ds = [];
    /** @type {Array<NotePlacer>} NotePlacer 객체들 보관 (objectsPlaying 와 중복 보관) */
    notePlacers = [];

    /** @type {number} 진행 시간 (실제 시간과 단위가 다르며, 곡의 BPM 반영으로 곡마다 속도가 다름, 곡의 패턴 배열의 N번째 숫자에 해당) */
    elapsedTime = 0;
    /** @type {number} 진행 시간 (예전 방식, 순수 timeElapsed 호출 횟수로 elapsedTime 와 정수 범위 내에서는 동일해야 함) */
    elapsedTimeOld = 0;
    /** @type {number} 진행 시간 (곡과 관련 없이 동시 처리 횟수) */
    simultaneousTime = 0;
    /** @type {number} 상태가 playing 일 때도 songtitle 화면을 띄우는 시간 (게임 중 변경됨) */
    titleDelayTime = 0;
    /** @type {number} 플레이 준비 시 titleDelayTime 값에 들어가는 초기값 */
    titleDelayTimeMax = 240;

    /** @type {boolean} Worker 사용여부 */
    usingWorker = true;
    /** @type {number|null} 시간 진행 타이머 키가 들어가는 변수 */
    timeProgressKey = null;
    /** @type {boolean} 상태가 title 이면서 로딩은 끝났음을 나타내는 변수 */
    titleScreenWaiting = false;

    // Worker 종료 함수들
    /** @type {Function|null} 렌더링 Worker 반복을 중단하는 함수입니다. */
    workerRender = null;
    /** @type {Function|null} 곡 진행 Worker 반복을 중단하는 함수입니다. */
    workerSongPlaying = null;
    /** @type {Function|null} 동시 작업 Worker 반복을 중단하는 함수입니다. */
    workerSimultaneousWork = null;

    /** @type {number} 점수 (곡 플레이 시작 시 초기화) */
    point = 0;
    /** @type {number} 콤보 (곡 플레이 시작 / MISS나 BAD 발생 시 초기화) */
    combo = 0;
    /** @type {number} 최대 콤보 (곡 플레이 시작 / 최대 combo값 갱신 시 초기화) */
    maxCombo = 0;
    /** @type {number} 미스 콤보 (곡 플레이 시작 / MISS 외 판정 발생 시 초기화) */
    missCombo = 0;
    /** @type {Object} 판정 종류별 누적 횟수 (곡 플레이 시작 시 초기화) */
    report = {
        PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0 // 각 판정별 통계
    };
    /** @type {number} 다 깎이면 게임 오버 (gameOverEnabled 를 true 지정 시) 물론 곡 플레이 시작 시 초기화 */
    hp = 100.0;

    /** @type {number} 게임 내 재화 1 (플레이 중 획득) */
    antiMatterCredit = 0;
    /** @type {number} 게임 내 재화 2 (플레이만으로는 획득 불가) */
    darkMatterCredit = 0;
    /** @type {Object} 판정 종류별 누적 횟수 (누적) */
    reportSaved = {
        PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0, maxCombo : 0, playCount : 0, used : 0
    }
    
    /** @type {string} local / internet */
    selectRecordType = 'local';
    /** @type {number} 기록 조회 화면에서 사용 */
    selectedRecordIndex = -1;
    /** @type {Array<string>} 기록 조회 화면 들어갈 때 탑재됨 */
    selectedRecordList = [];
    /** @type {*|null} 기록 조회 시 해당 기록 JSON 객체 탑재 */
    seeingRecord = null;

    /** @type {boolean} true 시 hp 0 이면 게임 오버, false 시 일단 곡 끝까지 진행은 가능 */
    gameOverEnabled = true;
    /** @type {boolean} hp 가 한번이라도 0 이하로 내려간 경우 true */
    gameOverDelayed = false;

    /** @type {string} 현재 상태, title / firstset / menu / songchoosing / songtitle / playing / gameover / result / setting / credit */
    state = 'title';
    /** @type {string} 이전 상태 */
    beforeState = 'none';

    /** @type {string} default / mission */
    mode = 'default';
    /** @type {ShuttingStarsSong|null} 현재 플레이 중인 곡, ShuttingStarsSong 객체 */
    song = null;
    /** @type {Array<ShuttingStarsSong>} 불러온 곡들, ShuttingStarsSong 객체 배열 */
    songs = [];
    /** @type {Array<ShuttingStarsSong>} 선택 가능한 곡들, ShuttingStarsSong 객체 배열, songs 과 다른 점은 디버그 모드에 따른 노출 여부 */
    songDisplays = [];
    /** @type {Array<ShuttingStarsMission>} 특수한 곡들 (mission 모드일 때 선택) */
    missions = [];
    /** @type {string} default / mission */
    songChoosingMode = 'default';

    /** @type {Object|null} 선택된 난이도 */
    difficulty = null;
    /** @type {HTMLAudioElement|null} 현재 선택된 곡의 오디오 객체 */
    audio = null;
    /** @type {string|null} 현재 선택된 곡의 썸네일 이미지 URL */
    songThumb = null;
    /** @type {string|null} 현재 선택된 곡의 BGA URL */
    videoBgaUrl = null;
    /** @type {number} 현재 선택된 곡의 1사이클 길이 (bpm에 따라 다름) */
    songBitGap = 0;
    /** @type {number} 현재 선택된 곡의 마지막 패턴의 시간 */
    songLastPatternTime = 0;
    /** @type {MediaElementAudioSourceNode|null} 시각화를 위한 변수 중 하나 */
    audioSource = null;

    /** @type {AnalyserNode|null} Audio Analyser 객체 (미지원 시 null 유지) */
    audioAnalyser = null;
    /** @type {number} Audio 시각화에 쓰일 배열 크기 */
    audioBufferLen = 0;
    /** @type {Uint8Array|null} Audio 시각화에 쓰일 배열 */
    audioBuffer = null;

    /** @type {ShuttingStarsSong|null} 현재 선택된 곡, ShuttingStarsSong 객체로 songs 목록에 있어야만 함 */
    songChoosing = null;
    /** @type {ShuttingStarsMission|null} 현재 선택된 미션입니다. */
    missionChoosing = null;
    /** @type {boolean} 곡 선택은 됐고 난이도를 선택하고 있는 상황임을 표시 */
    difficultyChoosing = false;
    /** @type {Array<string>} 매번 배열 추출할 수는 없으니 난이도 목록을 임시로 넣어두는 배열 */
    difficultyChoosingList = [];

    /** @type {HTMLAudioElement|null} 플레이 곡이 아닌, 배경 곡 */
    audioBackground = null;
    /** @type {boolean} 배경 음악의 재생 여부입니다. */
    audioBackgroundPlaying = false;

    /** @type {Object} 효과음 (Audio 객체를 원소로 함) */
    se = {
        tick : null,
        accept1 : null,
        accept2 : null,
        cancel : null,
        wrong : null,
        special1 : null
    }

    /** @type {number} 선택된 곡 준비 중 화면 남은 시간 */
    songTitleTime = 0;
    /** @type {number} 게임 오버 마크 화면 남은 시간 */
    gameoverTime = 0;
    /** @type {number} 일시정지 후 재개 전 대기 시간 */
    resumingTime = 0;

    /** @type {boolean} 일시정지 여부 - 사용자 조작에 따라 변경됨 */
    paused = false;
    /** @type {boolean} 일시정지 재개 전 대기시간 완료 시 임시로 사용하는 값 - 당연히 게임 중에 변경됨 */
    resumed = false;
    /** @type {number} 현재 동시 처리 사이클 번호입니다. */
    simultaneousWorkCycle = 0;

    /** @type {Array<string>} 공식 곡 시리얼 목록 */
    officialSongSerials = [
        'nai4ilaHbn7g93gn34nf9afn438zJ93f8gp34qgD39p4g',
        'nai4ilaHfdhsdfhfsdhsfgfnJ93f8gp34qgD39p4g',
        'nai4ilagwaifiuIBTUcfasgp34qgD39p4g',
        'nai4ilaHbwgwgnoimomwenofnJ93f8gp34qgD39p4g',
        'nai4ilaHbn7g934634634638zJ93f8gp34qgD39p4g',
        'nai4ilaHhdhrtjrthdrthkhthgp34qgD39p4g'
    ];

    

    // 초기 설정 화면 관련
    /** @type {string} language / graphic */
    firstSetMode = 'language';

    // 메뉴 화면 관련
    /** @type {Array<string>} 메뉴들 */
    menuList = ['play', 'records', 'setting', 'credit'];
    /** @type {Array<string>} 위 menuList 에 데이터가 추가됨 */
    menuListDynamic = [];
    /** @type {*|null} 현재 선택된 메뉴 항목입니다. */
    menuChoosing = null;

    // 설정 화면 관련
    /** @type {Array<string>} 설정 가능한 옵션 목록 */
    settingList = ['fixKeypressTiming', 'fixSongTiming', 'setNoteSpeedMultiplier', 'setGraphicQuality', 'resetAll'];
    /** @type {string|null} 설정 화면에서 현재 선택 중인 설정 항목 */
    settingChoosing = null;
    /** @type {boolean} 설정값을 수정 모드 (변경할 설정 항목을 선택한 상황을 의미) */
    settingModifyingMode = false;
    /** @type {Array<string>} 선택 가능한 그래픽 품질 목록입니다. */
    settingsGraphicQuality = ['LOW', 'MEDIUM', 'HIGH'];
    /** @type {string|null} 현재 선택된 그래픽 품질 */
    settingGraphicQualityChoosing = null;
    /** @type {boolean} 전체 초기화 선택 시 다시 묻고 있는지 여부. */
    settingResetReask = false;

    // 타이밍 보정값
    /** @type {number} 키 입력 추가 딜레이 보정값 (설정에서 변경 가능) */
    keypressTiming = 0;
    /** @type {number} 음원 재생 딜레이 보정값 (설정에서 변경 가능) */
    songTiming = 0;

    /** @type {Object} 키 누르는 중 중 여부 기록 (키에서 손가락 떼면 제거할 요량) - 게임 중 자동 측정됨 */
    keypressing = {};
    /** @type {boolean} 게임 시작 준비여부 - 게임 중 자동 변경되는 값 */
    playPrepared = false;

    // 렌더링 디버그 모드, true 시 JSON 객체를 objects 에 넣어 임의의 도형 추가 가능, 예: {type : 'circle', x: 100, y : 100, r : 10, color : 'rgb(255, 255, 255)'}
    /** @type {boolean} 임의 도형 렌더링 디버그 */
    renderDebugMode = false;
    // 스트링 테이블 디버그 모드, 번역 가능 키워드가 화면에 나올 때마다 콘솔에도 출력
    /** @type {boolean} 번역 키 출력 디버그 */
    stringTableDebugMode = true;
    // 키보드 입력 디버그 모드
    /** @type {boolean} 키 입력 디버그 */
    keyInputDebugMode = false;
    /** @type {boolean} 키 해제 디버그 */
    keyReleaseDebugMode = false;
    // 마우스 클릭 디버그 모드
    /** @type {boolean} 마우스 클릭 디버그 */
    mouseClickDebugMode = false;
    // 좌표계 디버그 모드
    /** @type {boolean} 2D 좌표계 디버그 */
    coordinate2dDebugMode = false;
    // init 디버그 모드
    /** @type {boolean} 초기화 과정 디버그 */
    initDebugMode = false;
    // 테스트 곡 노출 여부
    /** @type {boolean} 테스트 곡 노출 여부 */
    songDebugMode = false;
    // 시간 소요 출력 여부
    /** @type {boolean} 작업 소요 시간 출력 여부 */
    timeElapseDebugMode = false;

    // 2D 시각화 객체
    /** @type {Audio2DVisualizer|null} 현재 사용하는 2D 오디오 시각화 객체 */
    vizualizer2d = null;
    
    // 마우스 이벤트 처리기
    /** @type {Array<Object>} 마우스 입력 판정 영역 목록 */
    mouseEvents = [];

    // 곡 선택 화면에서 커맨드 입력을 방음
    /** @type {Array<string>} 곡 선택 화면에서 누적된 키 입력 값들 (커맨드 입력 판정에 사용) */
    commandInputs = [];
    /** @type {Array<Object>} 곡 선택 화면에서 사용할 커맨드 정의 목록 */
    commands = [];

    /** @type {string|null} 게임 배경에 표시할 이미지 URL 또는 BASE64 데이터, 없으면 투명 (clearRect) 사용 */
    backgroundImage = null;

    /** @type {Array<string>} 크레딧 화면에 출력할 텍스트 목록 */
    creditContents = [];
    /** @type {number} 현재 출력 중인 크레딧의 순번 */
    creditIndex = 0;
    /** @type {number} 크레딧이 올라가는 위치값 */
    creditIndexIncreases = 0;
    /** @type {number} 크레딧이 올라가는 위치 한도값 (이 값을 넘어서면 다음 크레딧을 정위치에 올림.) - 크레딧이 올라가는 속도를 제어하는 데 사용 */
    creditIndexIncreaseMax = 100;

    // 언어
    /** @type {string} 현재 선택된 언어 코드 */
    language = 'en';
    /** @type {boolean} 기본 플랫폼 언어 사용여부 (true 시 게임 초기화할 때 위 language 값이 브라우저 언어 코드값으로 바뀜) */
    languageDefault = true;
    /** @type {Object} 언어별 번역 문자열 테이블 (shuttingstarstringtable.js 참고) */
    stringTable = {
        'ko' : {}
    };

    // 글자 실제 크기 (게임 동작 중 자동 측정됨)
    /** @type {number} 기본 본문 글꼴의 실측 크기 */
    metricSize1 = 20;
    /** @type {number} 보조 글꼴의 실측 크기 */
    metricSize2 = 15;
    /** @type {number} 강조 글꼴의 실측 크기 */
    metricSize3 = 30;

    // confirm (예/아니오 묻기) 진행 중 여부
    /** @type {boolean} 확인 대화상자가 열려 있는지 여부 */
    confirmAsking = false;
    /** @type {string} 확인 대화상자에 표시할 메시지 */
    confirmMessage = '';
    /** @type {boolean} true 시 "예" 를 선택 중임을 의미 */
    confirmChoosingYes = false;
    /** @type {function(boolean): void} 확인 대화상자 선택 후 호출할 콜백 함수, 매개변수 yn 에는 true/false 입력됨. */
    afterConfirmCallback = function(yn) {}

    /** @type {Array<string>} 적용 완료된 플러그인 식별자 목록 */
    pluginApplied = [];

    /** @type {string} 마지막으로 성공한 초기화 (init 메소드) 단계 메시지 */
    lastInitSuccessMessage = '';

    // 내부 핵심 로직 전체에 액세스하지 못하게 막기 위한 중간 객체
    /** @type {Object} 외부에 제한된 코어 기능만 노출하는 중간 객체 */
    broker = {};

    // URL 매개변수들 (null 혹은 URLSearchParams 타입 객체가 들어감)
    /** @type {URLSearchParams|null} 현재 URL에서 읽은 쿼리 매개변수들 */
    urlParameters = null;

    // 브라우저 영역 크기 감지 함수 (플랫폼이 다른 경우 함수도 달라져야 함)
    /** @type {function(): number} 플랫폼별 브라우저 외부 너비를 반환하는 함수 */
    fOuterWidth  = function() { return window.outerWidth;  }
    /** @type {function(): number} 플랫폼별 브라우저 외부 높이를 반환하는 함수 */
    fOuterHeight = function() { return window.outerHeight; }
    /** @type {function(Object): void} 코어 초기화 직전에 실행할 훅 */
    fBeforeInit  = function(obj) {  }
    /** @type {function(Object): void} 코어 초기화 직후에 실행할 훅 */
    fAfterInit   = function(obj) {  }

    /**
     * 객체 생성 (초기화하려면 init 메소드까지 호출해야 함)
     */
    constructor() {}
    
    /**
     * 초기화 (게임이 출력될 div 영역 객체를 입력)
     * @param {HTMLElement} rootDiv 게임 UI를 배치할 최상위 요소
     * @param {string} urlContext 리소스 URL의 기준 경로
     */
    init(rootDiv, urlContext) {
        const selfs = this;
        this.titleScreenWaiting = false;
        try {
            if(urlContext) this.urlCtx = urlContext;

            this.readURLParameters();
            this.rebuildBroker();

            this.backend = (typeof(__ssBackEnd) == 'undefined' || __ssBackEnd == null) ? null : __ssBackEnd();
            if(this.backend != null) {
                // 로그인 상태 변경 이벤트 부여
                if(this.backend.authStateChangedEvents) this.backend.authStateChangedEvents.push(() => {
                    selfs.getMenuList().then((menuList) => { selfs.menuListDynamic = menuList; });
                });
                // 원격 설정 가져오기
                this.backend.getRemoteConfigValues().then((respJson) => {
                    if(respJson.success) {
                        const valuesRecord = respJson.value;
                        
                        selfs.frameTime                = valuesRecord.frameTime.asNumber();
                        selfs.resumeDelayTime          = valuesRecord.resumeDelayTime.asNumber();
                        selfs.songTitleBaseTime        = valuesRecord.songTitleBaseTime.asNumber();
                        selfs.visualizeBarMultiplier   = valuesRecord.visualizeBarMultiplier.asNumber();
                        selfs.backStarlightCount       = valuesRecord.backStarlightCount.asNumber();
                        selfs.noticeEn                 = valuesRecord.noticeEn.asString();
                        selfs.noticeKo                 = valuesRecord.noticeKo.asString();
                        selfs.noticeWhen               = valuesRecord.noticeWhen.asNumber();
                    }
                });
            }
            
        } catch(e) {
            console.error(e);
            this.backend = null;
        }
        try {
            this.logInit('init started');
            try { this.fBeforeInit(this.broker); this.logInit('fBeforeInit end.'); } catch(exSelf) { console.error(exSelf); this.logInit('fBeforeInit failed. ' + exSelf); }
            
            // Set HTML
            if(typeof(rootDiv) == 'undefined') {
                this.logInit('root div is not exist. creating start.');

                // 예약어 클래스가 이미 존재하는지 확인
                let additionalNumber = 0;
                let rootClassName = 'shuttingstars_root';
                let remains = document.getElementsByClassName(rootClassName);
                while(remains != null && remains.length >= 1) { // 예약어가 없는 고유 영역을 확정 (이미 쓰는 경우 숫자를 +1씩 더해서 고유하게 만듦)
                    additionalNumber++;
                    rootClassName = 'shuttingstars_root' + additionalNumber;
                    remains = document.getElementsByClassName(rootClassName);
                }
                remains = null;
                
                rootDiv = document.body;
                rootDiv.innerHTML = "<div class='" + rootClassName + "'></div>"
                rootDiv = document.getElementsByClassName(rootClassName)[0];
            }

            this.logInit('root div prepared. ss inside dom creating....');

            let htmls = `
                <div class='shuttingstars_canvas_root'>              
                    <div class='shuttingstars_canvas_content_root'>
                        <video class='shuttingstars_bga' preload='metadata'></video>
                        <canvas class='shuttingstars_canvas'></canvas>   
                        <canvas class='shuttingstars_canvas_3d'></canvas>
                        <div class='shuttingstars_pop_root'></div>
                    </div>
                </div>                                     
            `;
            rootDiv.innerHTML = htmls;
            this.rootDiv = rootDiv;
            this.contentRoot = rootDiv.querySelector('.shuttingstars_canvas_content_root');
            this.videoBga = rootDiv.querySelector('.shuttingstars_bga');
            this.pops.root = this.rootDiv.querySelector('.shuttingstars_pop_root');
            this.renderPopupDiv();

            this.logInit('preparing global css...');

            // Set global CSS
            let styles = '';

            //     글꼴 설정
            let fonts = this.getRenderFontFamily();
            fonts = fonts.split(' ').join(', ');
            let targets = ['div', 'p', 'span', 'pre', 'input', 'textarea', 'select', 'button', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'table', 'tr', 'td', 'th', 'canvas', 'video', 'audio'];
            styles += '.shuttingstars_root';
            for(let domElem of targets) {
                styles += ', ';
                styles += '.shuttingstars_root ' + domElem;
            }
            styles += ' { font-family : ' + fonts + '; }\n';

            //     기본 CSS
            styles += `
                .shuttingstars_root { width: 100%; margin: 0; padding: 0; }
                .shuttingstars_root .full { width: 100%; }
                .shuttingstars_root .invisible { display: none !important; }
                .shuttingstars_root .ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .shuttingstars_root button.btn       { background: transparent; border: 3px solid rgba(122, 165, 240, 0.7); color: rgba(122, 165, 240, 0.7); padding: 0.5rem 1.5rem 0.5rem 1.5rem; }
                .shuttingstars_root button.btn:hover { background: rgba(122, 165, 240, 0.1); border: 3px solid rgba(122, 165, 240, 0.8); color: rgba(122, 165, 240, 0.8); padding: 0.5rem 1.5rem 0.5rem 1.5rem; }
                .shuttingstars_root button.btn.red       { background: transparent; border: 3px solid rgba(244, 66, 66, 0.7); color: rgba(244, 66, 66, 0.7); padding: 0.5rem 1.5rem 0.5rem 1.5rem; }
                .shuttingstars_root button.btn.red:hover { background: rgba(244, 66, 66, 0.1); border: 3px solid rgba(244, 66, 66, 0.8); color: rgba(244, 66, 66, 0.8); padding: 0.5rem 1.5rem 0.5rem 1.5rem; }
                .shuttingstars_root .shuttingstars_pop_dim  { position: fixed; left: 0px; top: 0px; width: 100%; height: 99999px; margin: 0; padding: 0; z-index: 1001; background-color: rgba(80, 80, 80, 0.3); text-align: center; }
                .shuttingstars_root .shuttingstars_pop_dim2 { position: fixed; left: 0px; top: 0px; width: 100%; height: 99999px; margin: 0; padding: 0; z-index: 1004; background-color: rgba(80, 80, 80, 0.3); text-align: center; }
                .shuttingstars_root .shuttingstars_pop_content { position: fixed; left: 0px; right: 0px; top : 50px; margin-left: auto; margin-right: auto; padding: 2rem 2rem 2rem 2rem; width: 400px; height: 300px; background-color: rgba(80, 80, 80, 0.9); color: rgba(180, 180, 180, 0.9); z-index: 1002; }
                .shuttingstars_root .shuttingstars_pop_content th, .shuttingstars_root .shuttingstars_pop_content td { padding: 1rem 1rem 1rem 1rem; }
                .shuttingstars_root .shuttingstars_pop_content th, .shuttingstars_root .shuttingstars_pop_content td, .shuttingstars_root .shuttingstars_pop_content input, .shuttingstars_root .shuttingstars_pop_content button {
                    font-size: 2rem;
                    line-height: 2.5rem;
                }
                .shuttingstars_root .shuttingstars_pop_content.shuttingstars_pop_content2 { z-index: 1005; }
            `;
            //     설정 영역 CSS
            // 상세설정 영역 공통 css 준비
            styles += `
                .shuttingstar_configlayer { margin-left: 2rem; margin-top: 2rem; font-size: 2rem; line-height: 2rem; padding: 20px 20px 20px 20px; overflow-y: auto; }
                .shuttingstar_configlayer input, .shuttingstar_configlayer select, .shuttingstar_configlayer button { font-size: 2rem; line-height: 2.5rem; }
                .shuttingstar_configlayer table, .shuttingstar_configlayer table td { border: 0; }
                .shuttingstar_configlayer table th { border: 0; text-align: left; }
                .shuttingstar_configlayer .shuttingstar_configsections th, .shuttingstar_configlayer .shuttingstar_configsections td { line-height: 3rem; }
                .shuttingstar_configlayer .tabarea        { display: none; }
                .shuttingstar_configlayer .tabarea.active { display: block; }
                .shuttingstar_configlayer button.tab        { background: transparent; border: 3px solid rgba(50, 230, 50, 0.7); color: rgba(50, 230, 50, 0.7); }
                .shuttingstar_configlayer button.tab:hover  { background: rgba(50, 230, 50, 0.1); border: 3px solid rgba(50, 230, 50, 0.8); color: rgba(50, 230, 50, 0.8); }
                .shuttingstar_configlayer button.tab.active { background: rgba(50, 230, 50, 0.2); border: 3px solid rgba(50, 230, 50, 0.9); color: rgba(50, 230, 50, 0.9); }
                .shuttingstar_configlayer .shuttingstar_config_inner { min-height: 500px; vertical-align: top; }
                .shuttingstar_configlayer .ta_json_song, .shuttingstar_configlayer .ta_packages { min-height: 500px; }
                .shuttingstar_configlayer .shuttingstar_tools_inner { height: 600px; overflow-y: scroll; }
                .shuttingstar_configlayer .shuttingstar_tools_inner .section { margin-bottom: 30px; }
                .shuttingstar_configcontrols { margin-top: 20px; }
            `;
            if(this.dark) {
                styles += `
                .shuttingstars_canvas_config { background: rgba(80, 80, 80, 0.7); }
                .shuttingstars_canvas_config, .shuttingstar_configlayer { background: rgba(80, 80, 80, 0.7); }
                .shuttingstars_canvas_config input, .shuttingstars_canvas_config select, .shuttingstars_canvas_config textarea {
                    background: rgba(120, 120, 120, 0.7);
                    color : rgb(250, 250, 250);
                }
                `;
            } else {
                styles += `
                .shuttingstars_canvas_config { background: rgba(200, 200, 200, 0.7); }
                .shuttingstars_canvas_config, .shuttingstar_configlayer { background: rgba(200, 200, 200, 0.7); }
                .shuttingstars_canvas_config input, .shuttingstars_canvas_config select, .shuttingstars_canvas_config textarea {
                    background: rgba(190, 190, 190, 0.7);
                    color : rgb(70, 70, 70);
                }
                `;
            }

            const styleElem = document.createElement('style');
            styleElem.type = 'text/css';
            styleElem.innerHTML = styles;
            document.head.appendChild(styleElem);

            this.logInit('detecting system language...');

            // 언어 설정
            if(this.languageDefault) {
                try {
                    // 지원 언어 목록
                    let allows = ['en'];
                    for(let k in this.stringTable) {
                        allows.push(k);
                    }

                    // 플랫폼 기본 언어 탐지
                    let platformLang = window.navigator.language;
                    if(typeof(platformLang) == 'undefined' || platformLang == 'null') platformLang = 'en';
                    if(typeof(platformLang) != 'string') platformLang = String(platformLang).trim();
                    // 2자리가 아닌 경우 자르기
                    if(platformLang.length > 2) platformLang = platformLang.substring(0, 2);
                    // 소문자로 강제 변환
                    platformLang = platformLang.toLowerCase();

                    // 플랫폼 언어가 준비된 언어 목록 안에 있으면 선택
                    if(allows.indexOf(platformLang) >= 0) this.language = platformLang;
                    else this.language = 'en'; // 없으면 영어
                } catch(exIn) { console.error(exIn); console.log('Cannot detect platform language. Using English...'); this.language = 'en'; }
            }

            this.logInit('preparing canvas...');

            // 캔버스 설정
            const canvas = rootDiv.querySelector('.shuttingstars_canvas');
            const canvas3d = rootDiv.querySelector('.shuttingstars_canvas_3d');

            if(this.detectScreenLandscape()) {
                canvas.style.minWidth  = '960px';
                canvas.style.minHeight = '540px';
                canvas3d.style.minWidth  = '960px';
                canvas3d.style.minHeight = '540px';
            } else {
                canvas.style.minWidth  = '540px';
                canvas.style.minHeight = '960px';
                canvas3d.style.minWidth  = '540px';
                canvas3d.style.minHeight = '960px';
            }
            this.videoBga.style.zIndex = this.canvasZindex;
            canvas.style.zIndex = this.canvasZindex+1;
            canvas3d.style.zIndex = this.canvasZindex+2;
            canvas3d.style.background = 'transparent';

            this.logInit('preparing 2d context...');

            this.canvas = canvas;
            this.canvas3d = canvas3d;
            this.ctx = canvas.getContext('2d');

            this.logInit('preparing canvas resolution...');

            // 그래픽 해상도 설정
            this.settingGraphicQualityChoosing = this.settingsGraphicQuality[1];
            this.setResolution(this.ressets.w, this.ressets.h);

            this.logInit('detecting touchscreen...');

            // 시각화 설정
            this.vizualizer2d = new CircleTypeAudio2DVisualizer(); // new BarTypeAudio2DVisualizer();

            // 가상 키 사용여부 지정
            if(this.virtualKeyNone) this.virtualKey = false;
            else if(this.virtualKeyForce) this.virtualKey = true;
            else (this.virtualKey = ShuttingStarsUtility.isTouchScreenPlatform());

            this.logInit('load settings...');

            // 최초 실행 감지
            const firsts = this.checkFirstUsing();
            
            // 설정 불러오기
            this.loadSettings();

            this.logInit('load songs...');
            
            // 곡 불러오기
            this.loadSongs();

            this.logInit('setting workers...');

            // worker 사용 가능여부 체크
            if(String(window.location.href).indexOf('http') != 0) this.usingWorker = false;

            // 반복 처리 프로세스 2개 (렌더링, 공통 동시처리 프로세스) 시작 (곡 동시처리 프로세스는 곡 초기화 시 진행)
            if(this.usingWorker) {
                this.workerRender = new Worker( this.convertURL('[CTX]/resources/js/shuttingstarworker.js') );
                this.workerRender.postMessage({interval : this.frameTime});
                this.workerRender.onmessage = function(e) {
                    selfs.render();
                }

                this.workerSimultaneousWork = new Worker( this.convertURL('[CTX]/resources/js/shuttingstarworker.js') );
                this.workerSimultaneousWork.postMessage({interval : this.frameTime});
                this.workerSimultaneousWork.onmessage = function(e) {
                    // const {drift, time} = e.data;
                    selfs.simultaneousWork(selfs.simultaneousWorkCycle); selfs.simultaneousWorkCycle++; if(selfs.simultaneousWorkCycle >= 10000) selfs.simultaneousWorkCycle = 0;
                }
            } else {
                ShuttingStarsUtility.repeat(() => { selfs.render(); }, this.frameTime);
                ShuttingStarsUtility.repeat(() => { selfs.simultaneousWork(selfs.simultaneousWorkCycle); selfs.simultaneousWorkCycle++; if(selfs.simultaneousWorkCycle >= 10000) selfs.simultaneousWorkCycle = 0; }, 20);
            }

            this.logInit('setting events...');

            // 키보드 키 누르기 시작하는 이벤트 부여
            document.addEventListener('keydown', (event) => {
                if(selfs.createMode) return;
                if(selfs.keypressTiming <= 0) {
                    selfs.handleKeyInput(event.key.toUpperCase(), true);
                } else {
                    setTimeout(() => { selfs.handleKeyInput(event.key.toUpperCase(), true); }, selfs.keypressTiming);
                }
            });

            // 키보드 키에서 손가락 떼는 이벤트 부여
            document.addEventListener('keyup', (event) => {
                if(selfs.createMode) return;
                if(selfs.keypressTiming <= 0) {
                    selfs.handleKeyRelease(event.key.toUpperCase(), true);
                } else {
                    setTimeout(() => { selfs.handleKeyInput(event.key.toUpperCase(), true); }, selfs.keypressTiming);
                }
            });

            // 마우스 이벤트 공통사항
            const fMouseClickConversion = function(event, mouseDown) {
                let obj = {};

                const rect = canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                // 실제좌표가 canvas 의 해상도와 다르므로 변환이 필요
                const rx = Math.floor((x * selfs.getFullRenderWidth())  / rect.width );
                const ry = Math.floor((y * selfs.getFullRenderHeight()) / rect.height);

                if(mouseDown) {
                    if(selfs.mouseClickDebugMode) console.log('[MOUSECLICKED] ' + x + ', ' + y + " -> " + rx + ', ' + ry + ' in ' + rect.width + ':' + rect.height + ' to ' + selfs.getStageWidth() + ':' + selfs.getStageHeight());
                } else {
                    if(selfs.mouseClickDebugMode) console.log('[MOUSERELEASE] ' + x + ', ' + y + " -> " + rx + ', ' + ry + ' in ' + rect.width + ':' + rect.height + ' to ' + selfs.getStageWidth() + ':' + selfs.getStageHeight());
                }

                // 임시 객체 (충돌여부 판단 위함)
                const mouseCursorObject = new MouseClickHighlighter(0, 0, '255, 255, 255', '255, 255, 255');
                mouseCursorObject.type = 'circle';
                mouseCursorObject.x    = rx;
                mouseCursorObject.y    = ry;
                mouseCursorObject.r    = 3;
                mouseCursorObject.fill = true;
                mouseCursorObject.explosing = 1;
                selfs.objects.push(mouseCursorObject);

                obj.x = rx;
                obj.y = ry;
                obj.cursor = mouseCursorObject;
                return obj;
            };

            // 마우스 클릭 시작 이벤트 부여
            this.canvas.addEventListener('mousedown', (event) => {
                if(selfs.createMode) return;
                const obj = fMouseClickConversion(event, true);
                selfs.handleMouseClick(obj.x, obj.y, obj.cursor);
            });

            // 마우스 클릭 종료 이벤트 부여
            this.canvas.addEventListener('mouseup', (event) => {
                if(selfs.createMode) return;
                const obj = fMouseClickConversion(event, false);
                selfs.handleMouseRelease(obj.x, obj.y, obj.cursor);
            });

            // 주 캔버스 위에 겹쳐져 있는 3D 장식용 캔버스에도 마우스 이벤트 동일하게 부여
            if(this.canvas3d != null) {
                this.canvas3d.addEventListener('mousedown', (event) => {
                    if(selfs.createMode) return;
                    const obj = fMouseClickConversion(event, true);
                    selfs.handleMouseClick(obj.x, obj.y, obj.cursor);
                });

                this.canvas3d.addEventListener('mouseup', (event) => {
                    if(selfs.createMode) return;
                    const obj = fMouseClickConversion(event, false);
                    selfs.handleMouseRelease(obj.x, obj.y, obj.cursor);
                });
            }

            // 화면 크기 계산 - 화면 크기변경 이벤트 부여를 위해
            let outWidth  = this.fOuterWidth();
            let outHeight = this.fOuterHeight();

            this.gap.w = outWidth  - window.innerWidth;
            this.gap.h = outHeight - window.innerHeight;
            if(this.gap.w < 0) this.gap.w = 0;
            if(this.gap.h < 0) this.gap.h = 0;

            // 화면 크기변경 시 호출될 함수
            const fResize = function() {
                selfs.handleScreenResized();
            };
            fResize(); // 지금 바로 1회 호출
            // 창 크기 변경 이벤트로 등록
            window.addEventListener('resize', fResize);

            this.logInit('setting configuration screens...');

            // 설정 화면, PC인 경우 HTML 방식의 설정 화면 사용, 그외의 경우 canvas 방식의 설정 사용
            if(ShuttingStarsUtility.isTouchScreenPlatform()) this.configDiv = null;
            else this.configDiv = rootDiv.querySelector('.shuttingstars_canvas_config');
            this.renderConfigDiv();
            if(this.configDiv != null) {
                this.configDiv.classList.add('invisible');
                this.pops.config = this.configDiv;
            }

            // Create 모드인 경우 설정 변경
            if(this.createMode) {
                this.logInit('applying creating mode...');
                this.songDebugMode = true;
                this.gameOverEnabled = false;
                this.timeElapseDebugMode = true;
            }

            // 커맨드 설정
            this.prepareCommands();

            // 미션 생성
            this.missions.push(new EasySurvive(this));
            this.missions.push(new NormalSurvive(this));
            this.missions.push(new HardSurvive(this));

            this.logInit('loading third parties...');

            this.loadAfter().then(() => {
                selfs.logInit('preparing background audio...');
                try {
                    selfs.audioBackground = new Audio(this.convertURL('[CTX]/resources/songs/woowahan/track09.mp3'));
                    selfs.audioBackground.loop = true;
                    // 지금 재생하면 크롬계열에서 오류 Uncaught (in promise) NotAllowedError: play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD
                } catch(exAudio) {
                    console.error(exAudio);
                    ShuttingStarsUtility.toast('Loading audio failed !', true);
                }

                try {
                    selfs.se.tick     = new Audio(this.convertURL('[CTX]/resources/se/tick.ogg'));
                    selfs.se.accept1  = new Audio(this.convertURL('[CTX]/resources/se/kurage-kosho/button25.mp3'));
                    selfs.se.accept2  = new Audio(this.convertURL('[CTX]/resources/se/kurage-kosho/button36.mp3'));
                    selfs.se.cancel   = new Audio(this.convertURL('[CTX]/resources/se/kurage-kosho/button82.mp3'));
                    selfs.se.special1 = new Audio(this.convertURL('[CTX]/resources/se/kurage-kosho/button83.mp3'));
                } catch(exAudio) {
                    console.error(exAudio);
                }

                selfs.menuListDynamic = selfs.menuList;
                selfs.getMenuList().then((menuList) => {
                    selfs.menuListDynamic = menuList;
                    selfs.logInit('starting game...');

                    // 최초 실행인 경우 최초 설정 화면 띄우기
                    if(firsts) this.setState('firstset');

                    selfs.afterInitialized();
                }).catch((exmenu) => {
                    ShuttingStarsUtility.toast('ERROR : ' + exmenu, true);
                    console.error(exmenu);
                });
            }).catch((e) => {
                ShuttingStarsUtility.toast('ERROR : ' + e, true);
                console.error(e);
                ShuttingStarsUtility.toast('Last Success : ' + selfs.lastInitSuccessMessage);
                selfs.afterInitialized();
            });
        } catch(eGlobal) {
            ShuttingStarsUtility.toast('ERROR : ' + eGlobal, true);
            console.error(eGlobal);
            ShuttingStarsUtility.toast('Last Success : ' + this.lastInitSuccessMessage);
        }
    }

    /**
     * 초기화 완료 후 호출
     */
    afterInitialized() {
        const selfs = this;
        this.menuChoosing = this.menuListDynamic[0];
        setTimeout(() => { selfs.handleScreenResized(); selfs.titleScreenWaiting = true; }, 2000);
        // this.setState('menu'); // 바로 넘기지 않고, 엔터 키를 눌렀을 때 넘길 예정

        try { this.fAfterInit(this.broker); this.logInit('fAfterInit end.'); } catch(exSelf) { console.error(exSelf); this.logInit('fAfterInit failed. ' + exSelf); }
    }

    /**
     * init 작업 진행현황 기록 (디버그 모드 시에만 의미 있음)
     * @param {string} msg msg 값
     */
    logInit(msg) {
        this.lastInitSuccessMessage = msg;
        if(this.initDebugMode) ShuttingStarsUtility.toast(msg);
    }

    /**
     * 게임 자체의 상태 변경
     * @param {string} state state 값
     */
    setState(state) {
        const selfs = this;
        let idx;

        this.beforeState = this.state;
        this.state = state;

        // 마우스 이벤트 제거
        this.mouseEvents = [];

        // 가상 키 모두 제거
        for(idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if(obj instanceof VirtualKey) {
                this.objects.splice(idx, 1);
                idx--;
            }
        }

        // 공용 가상 키 및 마우스 이벤트 부여
        this.addDeclaredKeys(this.enterKey);
        this.addDeclaredKeys(this.escKey);

        // 상태 별 가상 키 및 마우스 이벤트 부여
        if(state == 'playing') {
            // 플레이 중 - 설정된 키 모두 출력
            for(idx=0; idx<this.keyList.length; idx++) {
                let keyOne = this.keyList[idx];
                this.addDeclaredKeys(keyOne);
            }

        } else {
            // 그외의 경우 - 방향키

            // 방향키
            for(idx=0; idx<this.arrowKeys.length; idx++) {
                this.addDeclaredKeys(this.arrowKeys[idx]);
            }
        }
        // 상태 별 가상 키 및 마우스 이벤트 부여 // 종료

        // 상태별 데이터 조회 요청
        if(state == 'recordlist') {
            if(this.selectRecordType == 'internet') { this.getInternetRecords().then((list) => { selfs.selectedRecordList = list; if(list != null && list.length >= 1) selfs.seeingRecord = selfs.selectedRecordList[0]; }); }
        }

        // 일부 상태는 스테이지 리셋이 필요
        if(state == 'menu' || state == 'playing' || state == 'songchoosing' || state == 'songtitle') {
            this.resetStage();
        }

        // 최초 메뉴 진입 시 창 크기 다시 새로고침
        if(this.beforeState == 'title' && state == 'menu') {
            this.handleScreenResized();
        }

        // 상태 변경 로깅
        if(this.backend != null) {
            try { this.backend.logEvent('STATE ' + state); } catch(ignores) {}
        }
    }

    /**
     * URL 로부터 매개변수 읽기
     */
    readURLParameters() {
        // Check this browser support window.location.search and URLSearchParams
        if(typeof(URLSearchParams       ) == 'undefined') { this.urlParameters = null; return; }
        if(typeof(window.location.search) == 'undefined') { this.urlParameters = null; return; }

        try { this.urlParameters = new URLSearchParams(window.location.search); } catch(e) { console.error(e); this.urlParameters = null; }
    }

    /**
     * Broker 재생성 (변경 가능한 변수들만 대리로 변경할 수 있도록 하는 중간 매개 객체)
     * @returns {Object} 새로 구성된 broker 객체
     */
    rebuildBroker() {
        const selfs = this;
        this.broker = { };
        this.broker.createMode              = this.createMode              ;
        this.broker.dark                    = this.dark                    ;
        this.broker.reverseVertical         = this.reverseVertical         ;
        this.broker.keyList                 = this.keyList                 ;
        this.broker.arrowKeys               = this.arrowKeys               ;
        this.broker.enterKey                = this.enterKey                ;
        this.broker.escKey                  = this.escKey                  ;
        this.broker.fontFamily              = this.fontFamily              ;
        this.broker.pointFont               = this.pointFont               ;
        this.broker.alterFonts              = this.alterFonts              ;
        this.broker.volume                  = this.volume                  ;
        this.broker.volumeBackgroundDefault = this.volumeBackgroundDefault ;
        this.broker.noteSpeedMultiplier     = this.noteSpeedMultiplier     ;
        this.broker.useAudioVisualizer      = this.useAudioVisualizer      ;
        this.broker.renderDebugMode         = this.renderDebugMode         ;
        this.broker.stringTableDebugMode    = this.stringTableDebugMode    ;
        this.broker.keyInputDebugMode       = this.keyInputDebugMode       ;
        this.broker.keyReleaseDebugMode     = this.keyReleaseDebugMode     ;
        this.broker.mouseClickDebugMode     = this.mouseClickDebugMode     ;
        this.broker.initDebugMode           = this.initDebugMode           ;
        this.broker.songDebugMode           = this.songDebugMode           ;
        this.broker.coordinate2dDebugMode   = this.coordinate2dDebugMode   ;
        this.broker.timeElapseDebugMode     = this.timeElapseDebugMode     ;
        this.broker.visualizePeakDebugMode  = this.visualizePeakDebugMode  ;
        this.broker.gameOverEnabled         = this.gameOverEnabled         ;
        this.broker.virtualKeyForce         = this.virtualKeyForce         ;
        this.broker.urlCtx                  = this.urlCtx                  ;
        this.broker.songs                   = this.songs                   ;
        this.broker.fOuterWidth             = this.fOuterWidth             ;
        this.broker.fOuterHeight            = this.fOuterHeight            ;
        this.broker.apply = function(obj) {
            if(typeof(obj.createMode             ) != 'undefined') selfs.createMode              = obj.createMode              ;
            if(typeof(obj.dark                   ) != 'undefined') selfs.dark                    = obj.dark                    ;
            if(typeof(obj.reverseVertical        ) != 'undefined') selfs.reverseVertical         = obj.reverseVertical         ;
            if(typeof(obj.keyList                ) != 'undefined') selfs.keyList                 = obj.keyList                 ;
            if(typeof(obj.arrowKeys              ) != 'undefined') selfs.arrowKeys               = obj.arrowKeys               ;
            if(typeof(obj.enterKey               ) != 'undefined') selfs.enterKey                = obj.enterKey                ;
            if(typeof(obj.escKey                 ) != 'undefined') selfs.escKey                  = obj.escKey                  ;
            if(typeof(obj.fontFamily             ) != 'undefined') selfs.fontFamily              = obj.fontFamily              ;
            if(typeof(obj.pointFont              ) != 'undefined') selfs.pointFont               = obj.pointFont               ;
            if(typeof(obj.alterFonts             ) != 'undefined') selfs.alterFonts              = obj.alterFonts              ;
            if(typeof(obj.volume                 ) != 'undefined') selfs.volume                  = obj.volume                  ;
            if(typeof(obj.volumeBackgroundDefault) != 'undefined') selfs.volumeBackgroundDefault = obj.volumeBackgroundDefault ;
            if(typeof(obj.noteSpeedMultiplier    ) != 'undefined') selfs.noteSpeedMultiplier     = obj.noteSpeedMultiplier     ;
            if(typeof(obj.useAudioVisualizer     ) != 'undefined') selfs.useAudioVisualizer      = obj.useAudioVisualizer      ;
            if(typeof(obj.renderDebugMode        ) != 'undefined') selfs.renderDebugMode         = obj.renderDebugMode         ;
            if(typeof(obj.stringTableDebugMode   ) != 'undefined') selfs.stringTableDebugMode    = obj.stringTableDebugMode    ;
            if(typeof(obj.keyInputDebugMode      ) != 'undefined') selfs.keyInputDebugMode       = obj.keyInputDebugMode       ;
            if(typeof(obj.keyReleaseDebugMode    ) != 'undefined') selfs.keyReleaseDebugMode     = obj.keyReleaseDebugMode     ;
            if(typeof(obj.mouseClickDebugMode    ) != 'undefined') selfs.mouseClickDebugMode     = obj.mouseClickDebugMode     ;
            if(typeof(obj.initDebugMode          ) != 'undefined') selfs.initDebugMode           = obj.initDebugMode           ;
            if(typeof(obj.songDebugMode          ) != 'undefined') selfs.songDebugMode           = obj.songDebugMode           ;
            if(typeof(obj.coordinate2dDebugMode  ) != 'undefined') selfs.coordinate2dDebugMode   = obj.coordinate2dDebugMode   ;
            if(typeof(obj.timeElapseDebugMode    ) != 'undefined') selfs.timeElapseDebugMode     = obj.timeElapseDebugMode     ;
            if(typeof(obj.visualizePeakDebugMode ) != 'undefined') selfs.visualizePeakDebugMode  = obj.visualizePeakDebugMode  ;
            if(typeof(obj.gameOverEnabled        ) != 'undefined') selfs.gameOverEnabled         = obj.gameOverEnabled         ;
            if(typeof(obj.virtualKeyForce        ) != 'undefined') selfs.virtualKeyForce         = obj.virtualKeyForce         ;
            if(typeof(obj.urlCtx                 ) != 'undefined') selfs.urlCtx                  = obj.urlCtx                  ;
            if(typeof(obj.fOuterWidth            ) != 'undefined') selfs.fOuterWidth             = obj.fOuterWidth             ;
            if(typeof(obj.fOuterHeight           ) != 'undefined') selfs.fOuterHeight            = obj.fOuterHeight            ;
            if(typeof(obj.songs                  ) != 'undefined') selfs.songs                   = obj.songs                   ;
        }
        this.broker.parseSong  = function(json) { return selfs.parseSong(json); }
        this.broker.addSong    = function(song) { return selfs.addSong(song);   }
        this.broker.setSongOne = function(song, idx) { selfs.songs[idx] = song; }
        this.broker.setSong    = function(song) { selfs.song = song; }
        this.broker.setDifficultyChoosingList = function(difList) { selfs.difficultyChoosingList = difList; }
        this.broker.setDifficultyIndex = function(index) { selfs.difficulty = selfs.difficultyChoosingList[parseInt(index)]; }
        this.broker.prepareCreateModeSong = function() {
            selfs.difficultyChoosing = false;

            selfs.songTitleTime = selfs.songTitleBaseTime;
            if(! isNaN(selfs.song.loadingTime)) selfs.songTitleTime += selfs.song.loadingTime;

            // 곡 플레이 선택함.
            selfs.setState('songtitle');
            selfs.difficultyChoosing = false;
            selfs.titleDelayTime = Math.floor(20 * (selfs.noteSpeedMultiplier - 1));
        }
        this.broker.stopSong = function() { selfs.onSongEnd(); }
        this.broker.officialSongSerials = this.officialSongSerials;
        return this.broker;
    }

    /**
     * 메뉴 목록 반환, this.menuList 에 더해 로그인 여부 등 동적으로 원소가 추가될 수 있음, Promise
     * @returns {Promise<*>} 처리 결과 (새 메뉴 목록으로 string 배열이 탑재됨)
     */
    getMenuList() {
        const selfs = this;
        return new Promise((resolve, reject) => {
            if(selfs.backend == null) {
                resolve( selfs.menuList );
                return;
            }

            try {
                // User 정보 로컬 스토리지에서 탐지
                let userInfo = localStorage.getItem('shuttingstar_session');
                if(userInfo == null || typeof(userInfo) == 'undefined' || userInfo == '' || userInfo == 'undefined') userInfo = null;
                if(userInfo != null) {
                    if(typeof(userInfo) == 'string') userInfo = JSON.parse(userInfo);
                    if(userInfo.uid == null || typeof(userInfo.uid) == 'undefined') userInfo = null;
                }

                const fLogined = () => {
                    let newList = [];
                    let classicList = selfs.menuList;

                    // 기존 메뉴 그대로 유지
                    for(let idx=0; idx<classicList.length; idx++) {
                        const menuOne = classicList[idx];
                        newList.push(menuOne);
                    }

                    // 로그인된 경우, 로그아웃 메뉴 추가
                    newList.push('logout');

                    // 푸시 권한 획득
                    // selfs.backend.requestPushPermission();

                    resolve(newList);
                };

                const fNotLogined = () => {
                    selfs.backend.logined = false;
                    selfs.backend.user = null;

                    let newList = [];
                    let classicList = selfs.menuList;

                    // 기존 메뉴 그대로 유지
                    for(let idx=0; idx<classicList.length; idx++) {
                        const menuOne = classicList[idx];
                        newList.push(menuOne);
                    }

                    // 로그인 안된 경우, 로그인 메뉴 추가
                    newList.push('login');

                    resolve(newList);
                };

                if(userInfo == null) {
                    // 로그인 안됨
                    fNotLogined();
                } else {
                    if(typeof(userInfo) == 'string') userInfo = JSON.parse(userInfo);
                    selfs.backend.user = userInfo;
                    if(! selfs.backend.sessionChecked) {
                        selfs.backend.checkLogined(selfs.backend.user).then((res) => {
                            if(res.loginAvail) {
                                // 로그인 성공
                                fLogined();
                            } else {
                                // 로그인 안됨
                                fNotLogined();
                            }
                        }).catch((e) => { console.error(e); resolve( selfs.menuList ); });
                        return;
                    }
                }
            } catch(e) {
                console.error(e);
            }
            resolve( selfs.menuList );
        });
    }

    /**
     * 가상 키 추가
     * @param {string} realkey realkey 값
     */
    addDeclaredKeys(realkey) {
        const selfs = this;
        const rkey = realkey;
        const vkey = new VirtualKey(rkey);
        selfs.objects.push(vkey);
        
        vkey.click = function() {
            if(selfs.keypressTiming <= 0) {
                selfs.handleKeyInput(rkey, false);
            } else {
                setTimeout(() => { selfs.handleKeyInput(rkey, false); }, selfs.keypressTiming);
            }
        };

        vkey.release = function() {
            if(selfs.keypressTiming <= 0) {
                selfs.handleKeyRelease(rkey);
            } else {
                setTimeout(() => { selfs.handleKeyRelease(rkey); }, selfs.keypressTiming);
            }
        }

        selfs.mouseEvents.push({
            type : 'circle',
            x : vkey.x,
            y : vkey.y,
            r : vkey.r, // rect 인 경우 w 대신
            click : () => {
                vkey.click();
                vkey.explosing = 1;
            },
            release : () => {
                vkey.release();
            }
        });
    }

    /**
     * 해상도 (그래픽 품질) 변경, 디스플레이 방향이 landscape 이라고 가정하에 매개변수를 넣어야 함.
     * @param {number} w w 값
     * @param {number} h h 값
     */
    setResolution(w, h) {
        this.ressets.w = w;
        this.ressets.h = h;

        let outWidth  = this.fOuterWidth();
        let outHeight = this.fOuterHeight();
        let ratio = (outWidth - this.gap.w) / (outHeight - this.gap.h);

        this.screenDirLandscape = this.detectScreenLandscape();

        let temp;
        if(this.screenDirLandscape) {
            if(this.stageSize.w < this.stageSize.h) {
                temp = this.stageSize.w;
                this.stageSize.w = this.stageSize.h;
                this.stageSize.h = temp;
                this.canvas.style.minWidth  = '960px';
                this.canvas.style.minHeight = '540px';
            }
            this.resolution.w = w;
            this.resolution.h = h;
        } else {
            if(this.stageSize.w > this.stageSize.h) {
                temp = this.stageSize.w;
                this.stageSize.w = this.stageSize.h;
                this.stageSize.h = temp;
                this.canvas.style.minWidth  = '540px';
                this.canvas.style.minHeight = '960px';
            }
            this.resolution.w = h;
            this.resolution.h = w;
        }
        this.canvas.width  = Math.floor(this.resolution.h * ratio); // this.resolution.w;
        this.canvas.height = this.resolution.h;
        if(this.canvas3d != null) {
            this.canvas3d.width  = Math.floor(this.resolution.h * ratio);
            this.canvas3d.height = this.resolution.h;
        }

        this.realStageSize.h = this.stageSize.h;
        this.realStageSize.w = this.stageSize.h * (ratio);

        if(ratio < 1.69) { // 가로 : 세로 비율이 16:9보다 작은 경우 - 가로 길이를 다시 현 디스플레이 비율에 맞게 변경 (설정값은 높이만 가지고 판단하므로)
            this.stageSize.w  = Math.floor(this.stageSize.h  * ratio);
            this.resolution.w = Math.floor(this.resolution.h * ratio);
        }
        
        if(this.ressets.h <= 720) {
            this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0]; 
        } else {
            if(this.disable3d) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[1];
            else               this.settingGraphicQualityChoosing = this.settingsGraphicQuality[2];
        }
    }

    /**
     * 디스플레이 방향 (수직 portrait / 수평 landscape) 구분, landscape 인 경우 true, 그외의 경우 false 반환
     * @returns {boolean} 처리 결과
     */
    detectScreenLandscape() {
        return (this.fOuterWidth() >= this.fOuterHeight());
    }

    /**
     * 최초 사용 감지
     * @returns {boolean} 처리 결과
     */
    checkFirstUsing() {
        const selfs = this;
        const settingJsonStr = localStorage.getItem('shuttingstar_settings');
        try {
            if(typeof(settingJsonStr) != 'undefined' && settingJsonStr != null && settingJsonStr != '') {
                JSON.parse(settingJsonStr);
                return false;
            }
        } catch(e) {
            console.error(e);
            ShuttingStarsUtility.toast('ERROR : ' + e);
            this.resetAll(() => {
                setTimeout(() => { location.reload(); }, 4000);
            });
        }
        return true;
    }

    /**
     * 설정 불러오기
     */
    loadSettings() {
        try {
            let settingJsonStr = localStorage.getItem('shuttingstar_settings');
            if(typeof(settingJsonStr) != 'undefined' && settingJsonStr != null && settingJsonStr != '') {
                let settingJson = JSON.parse(settingJsonStr);
                
                if(typeof(settingJson.keyList) != 'undefined') {
                    if(settingJson.keyList.length == this.keyList.length) {
                        this.keyList = settingJson.keyList;
                    }
                }

                if(typeof(settingJson.arrowKeys) != 'undefined') {
                    if(settingJson.arrowKeys.length == this.arrowKeys.length) {
                        this.arrowKeys = settingJson.arrowKeys;
                    }
                }
                
                if(typeof(settingJson.enterKey) != 'undefined') {
                    this.enterKey = settingJson.enterKey;
                }

                if(typeof(settingJson.escKey) != 'undefined') {
                    this.escKey = settingJson.escKey;
                }

                if(typeof(settingJson.fontFamily) != 'undefined') {
                    this.fontFamily = settingJson.fontFamily;
                }

                if(typeof(settingJson.noteSpeedMultiplier) != 'undefined') {
                    this.noteSpeedMultiplier = settingJson.noteSpeedMultiplier;
                    if(typeof(this.noteSpeedMultiplier) == 'string') this.noteSpeedMultiplier = parseFloat(this.noteSpeedMultiplier);
                }

                if(typeof(settingJson.reverseVertical) != 'undefined') {
                    this.reverseVertical = settingJson.reverseVertical;
                    if(typeof(this.reverseVertical) == 'string') this.reverseVertical = ( (this.reverseVertical == 'Y' || this.reverseVertical == 'true') ? true : false );
                }

                if(typeof(settingJson.keypressTiming) != 'undefined') {
                    this.keypressTiming = settingJson.keypressTiming;
                    if(typeof(this.keypressTiming) == 'string') this.keypressTiming = parseInt(this.keypressTiming);
                }

                if(typeof(settingJson.songTiming) != 'undefined') {
                    this.songTiming = settingJson.songTiming;
                    if(typeof(this.songTiming) == 'string') this.songTiming = parseInt(this.songTiming);
                }

                if(typeof(settingJson.resolution) != 'undefined') {
                    try {
                        let res = settingJson.resolution.split(',');
                        let left  = String(res[0]).trim();
                        let right = String(res[1]).trim();
                        if(isNaN(left )) left  = '1280';
                        if(isNaN(right)) right = '720';
                        this.ressets.w = parseInt(left);
                        this.ressets.h = parseInt(right);
                        if(this.ressets.w < 1280) this.ressets.w = 1280;
                        if(this.ressets.h <  720) this.ressets.h =  720;
                        this.setResolution(this.ressets.w, this.ressets.h);
                    } catch(e2) {
                        console.log('Resolution setting is wrong.');
                        console.error(e2);
                        console.log('Trying with default resolution...')
                    }    
                }

                if(typeof(settingJson.disable3d) != 'undefined') {
                    this.disable3d = settingJson.disable3d;
                    if(typeof(this.disable3d) == 'string') this.disable3d = ( (this.disable3d == 'Y' || this.disable3d == 'true') ? true : false );
                }

                if(typeof(settingJson.disable2d) != 'undefined') {
                    this.disable2d = settingJson.disable2d;
                    if(typeof(this.disable2d) == 'string') this.disable2d = ( (this.disable2d == 'Y' || this.disable2d == 'true') ? true : false );
                }

                if(typeof(settingJson.keyList) != 'undefined') {
                    try {
                        if(typeof(settingJson.keyList) == 'string') settingJson.keyList = JSON.parse(settingJson.keyList);
                        if(settingJson.keyList.length != 6) throw 'Wrong key list counts';
                        this.keyList = settingJson.keyList;
                    } catch(e2) {
                        console.log('Resolution setting is wrong.');
                        console.error(e2);
                        console.log('Trying with default resolution...');
                    }  
                }

                if(typeof(settingJson.language) != 'undefined') {
                    if(! settingJson.languageDefault) {
                        this.language = settingJson.language;
                    }
                }
            }

            this.setResolution(this.ressets.w, this.ressets.h);
        } catch(e) {
            console.log('Failed to load settings.');
            console.error(e);
            console.log('Continue with default settings.');
            this.saveSettings();
        }
        this.loadCredit();
    }

    /**
     * 설정 저장
     */
    saveSettings() {
        try {
            let settingJson = {}
            settingJson.keyList = this.keyList;
            settingJson.arrowKeys = this.arrowKeys;
            settingJson.enterKey = this.enterKey;
            settingJson.escKey = this.escKey;
            settingJson.fontFamily = this.fontFamily;
            settingJson.noteSpeedMultiplier = this.noteSpeedMultiplier;
            settingJson.reverseVertical = this.reverseVertical;
            settingJson.keypressTiming = this.keypressTiming;
            settingJson.songTiming = this.songTiming;
            settingJson.resolution = Math.floor(this.ressets.h * 16 / 9) + ',' + this.ressets.h;
            settingJson.disable3d = this.disable3d;
            settingJson.disable2d = this.disable2d;
            settingJson.language = this.language;
            settingJson.languageDefault = this.languageDefault;
            settingJson.keyList = this.keyList;

            localStorage.setItem('shuttingstar_settings', JSON.stringify(settingJson));
        } catch(e) {
            console.log('Failed to save settings.');
            console.error(e);
        }

        this.saveCredit();
    }

    /** Credit 불러오기 (Promise) */
    async loadCredit() {
        // antiMatterCredit 불러오기
        try {
            const step1 = localStorage.getItem('shuttingstar_credit');
            if(step1 != null && typeof(step1) != 'undefined' && step1 != '') {
                const step2 = JSON.parse(step1);
                
                const hashKey1 = step2.hashKey;
                const hashKey2 = await this.hashCredit(step2);

                if(hashKey1 == hashKey2) {
                    this.antiMatterCredit = step2.credit;
                    this.reportSaved = { PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0, maxCombo : 0, playCount : 0, used : 0 };
                    this.reportSaved.PERFECT   = step2.PERFECT;
                    this.reportSaved.GREAT     = step2.GREAT;
                    this.reportSaved.GOOD      = step2.GOOD;
                    this.reportSaved.BAD       = step2.BAD;
                    this.reportSaved.MISS      = step2.MISS;
                    this.reportSaved.maxCombo  = step2.maxCombo;
                    this.reportSaved.playCount = step2.playCount;
                    this.reportSaved.used      = step2.used;

                } else {
                    this.antiMatterCredit = 0;
                }
            }
        } catch(e) {
            console.log('Failed to load anti-matter credit.');
            console.error(e);
            this.antiMatterCredit = 0;
            this.reportSaved = { PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0, maxCombo : 0, playCount : 0, used : 0 };
        }
    }

    /** Credit 저장 (Promise) */
    async saveCredit() {
        // antiMatterCredit 저장
        try {
            const newPackage = {};
            newPackage.PERFECT   = this.reportSaved.PERFECT;
            newPackage.GREAT     = this.reportSaved.GREAT;
            newPackage.GOOD      = this.reportSaved.GOOD;
            newPackage.BAD       = this.reportSaved.BAD;
            newPackage.MISS      = this.reportSaved.MISS;
            newPackage.maxCombo  = this.reportSaved.maxCombo;
            newPackage.playCount = this.reportSaved.playCount;
            newPackage.used      = this.reportSaved.used;
            newPackage.credit    = this.antiMatterCredit;
            newPackage.hashKey   = await this.hashCredit(newPackage);

            localStorage.setItem('shuttingstar_credit', JSON.stringify(newPackage));
        } catch(e) {
            console.log('Failed to save anti-matter credit.');
            console.error(e);
        }
    }

    /**
     * 곡 목록 불러오기
     */
    loadSongs() {
        let idx;

        // 공식곡은 지우면 안되니 백업
        let officialSongs = [];

        for(idx=0; idx<this.songs.length; idx++) {
            const songOne = this.songs[idx];
            if(this.officialSongSerials.indexOf(songOne.serial) >= 0) {
                officialSongs.push(songOne);
            }
        }

        // 백업한 배열로 곡 목록 바꿔치기
        this.songs = officialSongs;

        // songDisplays 도 갱신
        if(this.songDebugMode) {
            this.songDisplays = this.songs;
        } else {
            this.songDisplays = [];
            for(idx=0; idx<this.songs.length; idx++) {
                const songOne = this.songs[idx];
                if(songOne.test) continue;
                this.songDisplays.push(songOne);
            }
        }
        
        // 스토리지에서 불러오기
        try {
            let songsArr = localStorage.getItem('shuttingstar_songs');
            if(typeof(songsArr) == 'undefined' || songsArr == null) return;
            if(songsArr == '') return;
            if(typeof(songsArr) == 'string') {
                songsArr = JSON.parse(songsArr);
            }
            
            for(idx=0; idx<songsArr.length; idx++) {
                const songJsonOne = songsArr[idx];
                this.addSong(songJsonOne, true);
            }
        } catch(e) {
            console.log('Failed to load songs.');
            console.error(e);
        }
    }

    /**
     * 곡 목록 저장
     */
    saveSongs() {
        let idx;

        // 공식곡 제외하고 담기
        let list = [];
        for(idx=0; idx<this.songs.length; idx++) {
            const songOne = this.songs[idx];
            if(this.officialSongSerials.indexOf(songOne.serial) >= 0) continue;

            // 시리얼 없는 경우 임의 시리얼 부여
            if(songOne.serial == '' || songOne.serial == null) songOne.serial = 'nonofficial_' + Math.floor(ShuttingStarsUtility.random() * 999999999) + '' + Math.floor(ShuttingStarsUtility.random() * 999999999);
            list.push(songOne.toJSONObject());
        }

        // 스토리지에 저장
        try {
            localStorage.setItem('shuttingstar_songs', JSON.stringify(list));
        } catch(e) {
            console.log('Failed to save songs.');
            console.error(e);
        }
    }

    /**
     * 곡 처리 프로세스 반복주기 계산, bpm 은 number 타입 (소수 가능) 을 넣어야 함
     * @param {number} bpm bpm 값
     * @returns {number} 처리 결과
     */
    calculateSongBitGap(bpm) {
        return Math.round((60000 / bpm) / this.timeMultiplier);
    }

    /** Credit 해시 검증값 계산 (Promise) */
    async hashCredit(hashJson) {
        let hashPackage = String(hashJson['PERFECT']) + ':' + String(hashJson['GREAT']) + ':' + String(hashJson['GOOD']) + ':' + String(hashJson['BAD']) + ':' + String(hashJson['MISS']) + ':' + String(hashJson['maxCombo']) + ':' + String(hashJson['playCount']) + ":" + String(hashJson['used']);
        await ShuttingStarsUtility.sha384str( hashPackage );
    }

    /**
     * 스테이지 초기화, 곡이 선정되지 않았을 때는 초기화만 하며, 곡이 선정된 경우는 초기화 후 곡 초기세팅까지 진행
     */
    resetStage() {
        const selfs = this;
        let idx;
        this.clearTimeHandler();
        this.hp = 100.0;
        this.point = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.missCombo = 0;
        this.report = {
            PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0
        };
        this.songBitGap = 0;
        this.elapsedTime = 0;
        this.elapsedTimeOld = 0;
        this.resumed = false;
        this.paused = false;
        this.gameOverDelayed = false;
        this.resumingTime = 0;

        // 곡 플레이 직전, 풀스크린 곡 타이틀 화면
        if(this.state == 'songtitle') {
            this.lastObjectId = 0;
            this.objectsPlaying = [];
            this.notePlacers = [];

            for(idx=0; idx<this.keyList.length; idx++) {
                const notePlacer = new NotePlacer(idx);
                notePlacer.id = this.lastObjectId++;
                this.objectsPlaying.push(notePlacer);
                this.notePlacers.push(notePlacer);
            }

            // 곡 플레이 세팅 중 처리
            //     곡 마지막 패턴 시간 체크
            this.songLastPatternTime = 0;
            let diff = this.song.difficulties[ this.difficulty.index ];
            let patterns = diff.patterns;
            for(idx=0; idx<patterns.length; idx++) {
                const pattern = patterns[idx];
                if(pattern.time > this.songLastPatternTime) {
                    this.songLastPatternTime = pattern.time;
                }
            }

            // 노트 미리 생성
            for(idx=0; idx<patterns.length; idx++) {
                const pattern = patterns[idx];

                // 패턴 ID 세팅
                pattern.id = idx;
                
                // 패턴 내 노트 라인 번호가 음수로 지정된 경우, 랜덤하게 다시 지정
                if(pattern.locationIndex < 0) {
                    pattern.locationIndex = Math.floor(ShuttingStarsUtility.random() * this.notePlacers.length);
                }

                // 노트 생성
                const note = new Note(pattern.locationIndex);
                note.id = this.lastObjectId; this.lastObjectId++;
                note.patternId = pattern.id;
                note.originalTiming = pattern.time;
                // if(idx == patterns.length - 1) { note.debugTarget = true; } // 노트 디버깅
                this.objectsPlaying.push(note); // 노트 추가
            }

            // 썸네일 체크해 이미지 객체 만들기
            if(this.song.thumbnailUrl) {
                if(this.songThumb == null) {
                    this.songThumb = new Image();
                    this.songThumb.src = this.convertURL(this.song.thumbnailUrl);
                }
            } else {
                this.songThumb = null;
            }

            //     배경음악 페이드 아웃 시작
            if(this.volumeBackgroundSpeed >= 0 && this.volumeBackground > 0) { this.volumeBackgroundSpeed = (-1) * 0.01; }

            //     곡 오디오 세팅
            if(this.audio == null) {
                if(typeof(this.song.musicUrl) != 'undefined' && this.song.musicUrl != null && this.song.musicUrl != '' && ShuttingStarsUtility.checkAccessibleURL(this.song.musicUrl)) {
                    try {
                        if(this.song.alterUrlUsing && ( this.song.musicAlterUrl != null && this.song.musicAlterUrl != '' )) this.audio = new Audio(this.convertURL(this.song.musicAlterUrl));
                        else this.audio = new Audio(this.convertURL(this.song.musicUrl));
                        
                        this.audio.volume = (this.volume * this.volumeSongAudio * this.volumeMultiplier);
                        
                        this.closeAudioSources();
                        try {
                            // Audio Context ( https://developer.mozilla.org/ko/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API )
                            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                            this.audioAnalyser = this.audioCtx.createAnalyser();
        
                            this.audioSource = this.audioCtx.createMediaElementSource(this.audio);
        
                            this.audioSource.connect(this.audioAnalyser);
                            this.audioAnalyser.connect(this.audioCtx.destination);
                            this.audioAnalyser.fftSize = 256;
        
                            this.audioBufferLen = this.audioAnalyser.frequencyBinCount; // fftSize 의 절반값
                            this.audioBuffer = new Uint8Array(this.audioBufferLen);
                        } catch(exInx) {
                            console.log('Failed to prepare audio context.');
                            console.log(exInx);
        
                            this.closeAudioSources();
                        }
                    } catch(exc) {
                        console.error(exc);
                        ShuttingStarsUtility.toast('Loading audio failed !', true);
                        if(this.audio != null) { try { this.audio.remove(); } catch(egnores) {} }
                        this.audio = null;
                        this.setState('songchoosing');
                        return;
                    }
                } else {
                    this.audio = null;
                    this.closeAudioSources();
                }
            }
            
            // BGA 초기화
            if(this.videoBgaUrl == null) {
                if(typeof(this.song.bgaUrl) != 'undefined' && this.song.bgaUrl != null && this.song.bgaUrl != '' && ShuttingStarsUtility.checkAccessibleURL(this.song.bgaUrl)) {
                    this.videoBgaUrl = this.song.bgaUrl;
                    this.videoBga.src = this.videoBgaUrl;
                }
            }

            // 3D 매니저 이벤트 호출
            if(this.ss3d != null && (! this.disable3d)) {
                this.ss3d.onSongPlayPreparing(this);
            }
        } else if(this.state == 'playing') { // 곡이 플레이 상황일 경우 처리

            // 진행 시간 - 처리 끝난 후 아래에서 다시 초기화
            this.elapsedTime = (-1) * ((this.stageRows * 2) + this.songTiming); 
            this.elapsedTimeOld = this.elapsedTime;
            if(this.song == null) { this.closeAudioSources(); this.audio = null; this.setState('menu'); return; }

            // 반복 처리 시작 (곡의 bpm 반영)
            this.songBitGap = this.calculateSongBitGap(this.song.bpm);
            if(this.usingWorker) {
                this.workerSongPlaying = new Worker( this.convertURL('[CTX]/resources/js/shuttingstarworker.js') );
                this.workerSongPlaying.postMessage({interval : selfs.songBitGap});
                this.workerSongPlaying.onmessage = function(e) {
                    // const {drift, time} = e.data;
                    selfs.timeElapse();
                }
            } else {
                this.timeProgressKey = ShuttingStarsUtility.repeat(() => { selfs.timeElapse(); }, selfs.songBitGap);
            }

            // 백그라운드 음악 페이드 아웃 시작
            if(this.audioBackground != null && this.audioBackgroundPlaying) this.volumeBackgroundSpeed = (-1) * 0.01;

            // 오디오 재생 시작 + 시간 타이밍 맞추기
            if(this.audio != null) {
                setTimeout(() => {
                    if(selfs.state != 'playing') return; // 곡 재생 전 esc 눌러 나가버린 경우
                    selfs.audio.play();

                    selfs.elapsedTime = (selfs.audio.currentTime * (selfs.song.bpm / 60.0) * (selfs.timeMultiplier * selfs.elapsedTimeMultiplier)) - selfs.songTiming; // 타이밍 지정
                    selfs.elapsedTimeOld = selfs.songTiming * (-1);

                    if(selfs.videoBga != null) {
                        if(selfs.videoBgaUrl != null) selfs.videoBga.play();
                    }
                }, (selfs.songBitGap * selfs.stageRows * 2) + selfs.songTiming); // 노트가 올라가는 시간은 주고 재생 시작
            } else {
                selfs.elapsedTime    = selfs.songTiming * (-1); // 타이밍 지정
                selfs.elapsedTimeOld = selfs.songTiming * (-1);
            }
            this.playPrepared = true;

            if(this.backend != null) {
                try { this.backend.logEvent('PLAY : ' + thos.song.name + ' (' + diff.difficultyLevel + ')'); } catch(ignores) {}
            }
        } else {
            this.playPrepared = false;

            this.lastObjectId = 0;
            this.objectsPlaying = [];
            this.notePlacers = [];

            for(idx=0; idx<this.keyList.length; idx++) {
                const notePlacer = new NotePlacer(idx);
                notePlacer.id = this.lastObjectId++;
                this.objectsPlaying.push(notePlacer);
                this.notePlacers.push(notePlacer);
            }

            // 배경 오디오 존재 시 재생
            if(this.audioBackground != null) {
                if(this.state == 'menu') {
                    if(! this.audioBackgroundPlaying) {
                        this.audioBackground.currentTime = 0;
                        this.audioBackground.loop = true;
                        this.audioBackground.play();
                        this.audioBackgroundPlaying = true;
                        this.volumeBackground = 0;
                        this.audioBackground.volume = this.volume * this.volumeBackground * this.volumeMultiplier;
                        this.volumeBackgroundSpeed = 0.01;
                    }
                }
            }
        }
    }

    /**
     * 화면 크기 변경 대응
     */
    handleScreenResized() {
        this.screenDirLandscape = this.detectScreenLandscape();

        let outWidth  = this.fOuterWidth();
        let outHeight = this.fOuterHeight();

        this.contentRoot.style.width  = (outWidth  - this.gap.w - this.getLeftMarginPage() + 1) + 'px';
        this.contentRoot.style.height = (outHeight - this.gap.h - this.getTopMarginPage()  + 1) + 'px';

        this.canvas.style.width  = (outWidth  - this.gap.w - this.getLeftMarginPage() + 1) + 'px';
        this.canvas.style.height = (outHeight - this.gap.h - this.getTopMarginPage()  + 1) + 'px';
        this.canvas.style.marginLeft = this.getLeftMarginPage() + 'px';
        this.canvas.style.marginTop  = this.getTopMarginPage() + 'px';
        
        if(this.configDiv != null) {
            this.configDiv.style.top    = '10px';
            this.configDiv.style.left   = '10px';
            this.configDiv.style.width  = (outWidth  - this.gap.w - this.getLeftMarginPage() - 100) + 'px';
            this.configDiv.style.height = (outHeight - this.gap.h - this.getTopMarginPage()  - 100) + 'px';
        }
        
        // 해상도 변경
        this.setResolution(this.ressets.w, this.ressets.h);
        const canvasBounding = this.canvas.getBoundingClientRect();

        // bga 용 video 관리
        if(this.videoBga != null) {
            this.videoBga.style.position = 'fixed';
            this.videoBga.style.left = canvasBounding.left + 'px';
            this.videoBga.style.top  = canvasBounding.top + 'px';
            this.videoBga.style.width  = canvasBounding.width + 'px';
            this.videoBga.style.height = canvasBounding.height + 'px';
        }

        // 3d 장식용 캔버스 관리
        if(this.canvas3d != null) {
            this.canvas3d.style.position = 'fixed';
            this.canvas3d.style.left = canvasBounding.left + 'px';
            this.canvas3d.style.top  = canvasBounding.top + 'px';
            this.canvas3d.style.width  = canvasBounding.width + 'px';
            this.canvas3d.style.height = canvasBounding.height + 'px';
        }

        if(this.ss3d != null) {
            this.ss3d.onWindowResize(this.canvas3d, this);
        }

        this.calculateFontMetric(true);
    }

    /**
     * 키 입력 처리, vkeyExplosion 를 true 지정 시 해당 가상 키도 강조 표시
     * @param {string} key 입력 또는 해제된 키
     * @param {boolean} vkeyExplosion 가상 키 강조 효과 적용 여부
     */
    handleKeyInput(key, vkeyExplosion) {
        const selfs = this;

        if(this.keyEventDisabled && key != this.escKey) return;
        if(this.keyInputDebugMode) console.log('KEY INPUT : ' + ShuttingStarsUtility.floor2(this.elapsedTime) + ', ' + key);
        key = String(key);

        // 키 입력 신호 넣기
        this.keypressing[key] = new Date().getTime();

        // ESC - DOM 팝업 떠있으면 닫기
        if(key == this.escKey && (! this.pops.dim.classList.contains('invisible'))) {
            this.pops.dim.classList.add('invisible');
            this.pops.login.classList.add('invisible');
            this.configDiv.classList.add('invisible');
            this.setState('menu');
            this.keyEventDisabled = false;
            return;
        }

        // CONFIRM 묻고 있는 상황이면 CONFIRM 최우선 처리
        if(this.confirmAsking) {
            if(key == this.arrowKeys[2]) { // LEFT
                this.confirmChoosingYes = (! this.confirmChoosingYes);
            } else if(key == this.arrowKeys[3]) { // RIGHT
                this.confirmChoosingYes = (! this.confirmChoosingYes);
            } else if(key == this.enterKey) {
                this.playSE('accept1');
                this.afterConfirmCallback(this.confirmChoosingYes);
                this.confirmAsking = false;
            }
            return;
        }

        // 타이틀 화면 키 핸들링
        if(this.state == 'title') {
            this.handleKeyInputTitle(key, vkeyExplosion);
        } else if(this.state == 'firstset') { 
            this.handleKeyInputFirstSet(key, vkeyExplosion);
        } else if(this.state == 'menu') { 
            this.handleKeyInputMenu(key, vkeyExplosion);
        } else if(this.state == 'songchoosing') {
            this.handleKeyInputSongChoosing(key, vkeyExplosion);
        } else if(this.state == 'setting') {
            this.handleKeyInputSetting(key, vkeyExplosion);
        } else if(this.state == 'playing') {
            this.handleKeyInputPlaying(key, vkeyExplosion);
        } else if(this.state == 'recordlist') {
            this.handleKeyInputRecordList(key, vkeyExplosion);
        } else if(this.state == 'recorddet') {
            this.handleKeyInputRecordDetail(key, vkeyExplosion);
        } else if(this.state == 'result') {
            this.handleKeyInputResult(key, vkeyExplosion);
        } else if(this.state == 'credit') {
            this.handleKeyInputCredit(key, vkeyExplosion);
        }
    }

    /**
     * 타이틀 화면 키 입력 핸들링
     * @param {string} key 입력 또는 해제된 키
     * @param {boolean} vkeyExplosion 가상 키 강조 효과 적용 여부
     */
    handleKeyInputTitle(key, vkeyExplosion) {
        if(! this.titleScreenWaiting) return;
        if(key == this.enterKey || key == 'ENTER') {
            this.playSE('special1');
            this.setState('menu');

            if(this.audioBackground != null) {
                this.audioBackground.currentTime = 0;
                this.audioBackground.loop = true;
                this.audioBackground.volume = this.volumeBackgroundDefault * (this.volume * this.volumeBackground * this.volumeMultiplier);
                this.audioBackground.play();
                this.audioBackgroundPlaying = true;
            }
        }
    }

    /**
     * 메뉴 화면 키 입력 핸들링
     * @param {string} key 입력 또는 해제된 키
     * @param {boolean} vkeyExplosion 가상 키 강조 효과 적용 여부
     */
    handleKeyInputMenu(key, vkeyExplosion) {
        const selfs = this;
        let index = 0;

        // 메뉴 상태
        if(this.menuListDynamic.indexOf(selfs.menuChoosing) >= 0) index = this.menuListDynamic.indexOf(selfs.menuChoosing);
        this.menuChoosing = this.menuListDynamic[index];

        if(key == this.arrowKeys[0]) { // UP
            index--;
            if(index < 0) index = this.menuListDynamic.length - 1;
            this.menuChoosing = this.menuListDynamic[index];
        } else if(key == this.arrowKeys[1]) { // DOWN
            index++;
            if(index >= this.menuListDynamic.length) index = 0;
            this.menuChoosing = this.menuListDynamic[index];

            if(this.backend == null || (! this.backend.avail)) {
                if(this.menuChoosing == 'login' || this.menuChoosing == 'logout') {
                    index = 0;
                    this.menuChoosing = this.menuListDynamic[index];
                }
            }
            
        } else if(key == this.enterKey) { // ENTER
            if(this.menuChoosing == 'play') { // 메뉴 - 플레이에 커서가 있는 상태에서 엔터 키 누름
                this.audio = null;
                this.songThumb = null;
                this.videoBgaUrl = null; // TODO

                this.playSE('accept1');
                this.setState('songchoosing');
            } else if(selfs.menuChoosing == 'setting') { // 메뉴 - 설정에 커서가 있는 상태에서 엔터 키 누름
                // 그래픽 퀄리티 해상도는 해상도+3D 관련 사항이므로 따로 처리
                if(this.resolution.h <= 720) {
                    this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0];
                } else {
                    if(this.disable3d) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[1];
                    else               this.settingGraphicQualityChoosing = this.settingsGraphicQuality[2];
                }

                this.playSE('accept1');
                this.setState('setting');
                if(selfs.configDiv != null) {
                    // 캔버스 내 자체 설정화면 대신, 상세설정 div 레이어를 띄움
                    this.openConfigDiv();
                }
            } else if(this.menuChoosing == 'credit') { // 메뉴 - 크레딧에 커서가 있는 상태에서 엔터 키 누름
                this.playSE('special1');
                this.prepareCreditList();
                this.setState('credit');
            } else if(this.menuChoosing == 'records') { // 메뉴 - 기록
                this.playSE('accept1');
                this.selectedRecordList = selfs.getRecords();
                this.selectRecordType = 'local';
                this.seeingRecord = null;
                if(this.selectedRecordList.length >= 1) this.seeingRecord = this.selectedRecordList[0];
                this.setState('recordlist');
            } else if(this.menuChoosing == 'login') { // 메뉴 - 로그인 (동적 메뉴)
                this.playSE('accept1');
                if(this.backend != null && this.backend.avail) {
                    this.keyEventDisabled = true;
                    this.pops.dim.classList.remove('invisible');
                    this.pops.login.classList.remove('invisible');
                }
            } else if(this.menuChoosing == 'logout') { // 메뉴 - 로그아웃 (동적 메뉴)
                this.playSE('special1');
                if(this.backend != null && this.backend.avail) {
                    this.confirm( this.trans('Do you want to logout now?') ).then((yn) => {
                        if(yn) {
                            selfs.backend.logout().then(() => {
                                try { localStorage.setItem('shuttingstar_session' , ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; }
                                selfs.getMenuList().then((menuList) => {
                                    selfs.menuListDynamic = menuList;
                                    selfs.setState('title');
                                });
                            });
                        }
                    });
                }
            }
        }
    }

    /**
     * 곡 선택 화면 키 입력 핸들링
     * @param {string} key 입력 또는 해제된 키
     * @param {boolean} vkeyExplosion 가상 키 강조 효과 적용 여부
     */
    handleKeyInputSongChoosing(key, vkeyExplosion) {
        const selfs = this;
        let index = 0;

        // 커맨드 입력 여부 판단
        for(let idx=0; idx<this.keyList.length; idx++) {
            if(key == this.keyList[idx]) {
                this.handleCommand(key);
                break;
            }
        }

        // ESC 처리
        if(key == this.escKey) {
            this.playSE('cancel');

            // 커맨드 입력 중인 경우
            if(this.isCommandInputProgressing() >= 0) {
                this.commandInputs = []; // 커맨드 입력 내용 지우기
                return;
            }

            // 그외의 경우
            if(this.difficultyChoosing) { this.difficultyChoosing = false; } // 난이도 선택 중인 경우 - 난이도 선택 해제 (다시 곡 선택 모드로)
            else { this.setState('menu'); } // 그외의 경우 - 이전 화면인 메뉴로 이동
            return;
        }

        // 곡이 아무것도 준비 안된 상태로 방향키 혹은 엔터 키를 누름 - 메뉴로 돌아감
        if((this.songDisplays.length <= 0 && this.songChoosingMode == 'default') || (this.missions.length <= 0 && this.songChoosingMode == 'mission')) { this.setState('menu'); return; }
        if(this.songChoosingMode == 'mission') {
            // mission 모드

            if(this.missionChoosing == null) this.missionChoosing = this.missions[0];

            // 미션 인덱스 구하기
            index = 0;
            for(let idx=0; idx<this.missions.length; idx++) {
                if(this.missions[idx] == this.missionChoosing) {
                    index = idx;
                    break;
                }
            }

            // 키 적용
            if(key == this.arrowKeys[0]) { // UP
                index--;
                if(index < 0) index = this.missions.length - 1;
                this.missionChoosing = this.missions[index];
            } else if(key == this.arrowKeys[1]) { // DOWN
                index++;
                if(index >= this.missions.length) index = 0;
                this.missionChoosing = this.missions[index];
            } else if(key == this.arrowKeys[2]) { // LEFT
                this.songChoosingMode = 'default';
                if(this.songChoosing == null) this.songChoosing = this.songDisplays[0];
            } else if(key == this.arrowKeys[3]) { // RIGHT
                this.songChoosingMode = 'default';
                if(this.songChoosing == null) this.songChoosing = this.songDisplays[0];
            } else if(key == this.enterKey) { // ENTER
                if(this.missionChoosing == null) return;
                this.playSE('accept2');

                this.missionChoosing.prepare(this); // 노트 이 시점에 생성
                

                this.songTitleTime = this.songTitleBaseTime;
                this.song = this.missionChoosing;
                this.difficulty = this.song.difficulties[0]; // 미션은 난이도가 하나

                if(! isNaN(this.song.loadingTime)) this.songTitleTime += this.song.loadingTime;

                // 곡 플레이 선택함.
                this.mode = this.songChoosingMode;
                this.setState('songtitle');
                this.difficultyChoosing = false;
                this.titleDelayTime = this.titleDelayTimeMax;
            }

        } else {
            // default 모드

            if(this.songChoosing == null) this.songChoosing = this.songDisplays[0];

            // 곡/난이도 인덱스 구하기
            index = 0;
            if(this.difficultyChoosing) {
                for(let idx=0; idx<this.difficultyChoosingList.length; idx++) {
                    if(this.difficulty == this.difficultyChoosingList[idx]) {
                        index = idx;
                        break;
                    }
                }
            } else {
                for(let idx=0; idx<this.songDisplays.length; idx++) {
                    if(this.songDisplays[idx] == this.songChoosing) {
                        index = idx;
                        break;
                    }
                }
            }
            
            // 키 적용
            if(key == this.arrowKeys[0]) { // UP
                if(! this.difficultyChoosing) {
                    index--;
                    if(index < 0) index = this.songDisplays.length - 1;
                    this.songChoosing = this.songDisplays[index];
                }
            } else if(key == this.arrowKeys[1]) { // DOWN
                if(! this.difficultyChoosing) {
                    index++;
                    if(index >= this.songDisplays.length) index = 0;
                    this.songChoosing = this.songDisplays[index];
                }
            } else if(key == this.arrowKeys[2]) { // LEFT
                if(this.difficultyChoosing) {
                    index--;
                    if(index < 0) index = this.difficultyChoosingList.length - 1;
                    this.difficulty = this.difficultyChoosingList[index];
                } else {
                    this.songChoosingMode = 'mission';
                    if(this.missionChoosing == null) this.missionChoosing = this.missions[0];
                }
            } else if(key == this.arrowKeys[3]) { // RIGHT
                if(this.difficultyChoosing) {
                    index++;
                    if(index >= this.difficultyChoosingList.length) index = 0;
                    this.difficulty = this.difficultyChoosingList[index];    
                } else {
                    this.songChoosingMode = 'mission';
                    if(this.missionChoosing == null) this.missionChoosing = this.missions[0];
                }
            } else if(key == this.enterKey) {
                if(this.songChoosing == null) return;
                if(this.difficultyChoosing) {
                    this.playSE('accept2');
                    if(this.difficulty == null || typeof(this.difficulty) == 'undefined') this.difficulty = this.difficultyChoosingList[0];
                    this.songTitleTime = this.songTitleBaseTime;
                    if(! isNaN(this.song.loadingTime)) this.songTitleTime += this.song.loadingTime;

                    // 곡 플레이 선택함.
                    this.mode = 'default';
                    this.setState('songtitle');
                    this.difficultyChoosing = false;
                    this.titleDelayTime = this.titleDelayTimeMax;
                } else {
                    this.playSE('accept1');
                    this.song = this.songChoosing;
                    this.difficultyChoosingList = this.song.getDifficultyList();
                    this.difficulty = this.difficultyChoosingList[0];
                    this.difficultyChoosing = true;
                }
            }
        }
    }

    /**
     * 최초 설정 화면 키 입력 핸들링
     * @param {string} key 입력 또는 해제된 키
     * @param {boolean} vkeyExplosion 가상 키 강조 효과 적용 여부
     */
    handleKeyInputFirstSet(key, vkeyExplosion) {
        const selfs = this;
        let index = 0;

        if(key == this.arrowKeys[0]) { // UP
            if(     this.firstSetMode == 'language') this.firstSetMode = 'confirm';
            else if(this.firstSetMode == 'quality' ) this.firstSetMode = 'language';
            else                                     this.firstSetMode = 'quality';
        } else if(key == this.arrowKeys[1]) { // DOWN
            if(     this.firstSetMode == 'language') this.firstSetMode = 'quality';
            else if(this.firstSetMode == 'quality' ) this.firstSetMode = 'confirm';
            else                                     this.firstSetMode = 'language';
        } else if(key == this.arrowKeys[2] || key == this.arrowKeys[3]) { // LEFT / RIGHT
            if(this.firstSetMode == 'language') {
                if(this.language == 'ko') this.language = 'en';
                else this.language = 'ko';
            } else if(this.firstSetMode == 'quality' ) {
                this.disable3d = true;
                if(this.ressets.h <= 720) {
                    this.ressets.w = 1920;
                    this.ressets.h = 1080;
                    this.setResolution(1920, 1080);
                } else {
                    this.ressets.w = 1280;
                    this.ressets.h =  720;
                    this.setResolution(1280,  720);
                }
            }
        } else if(key == this.enterKey) {
            if(this.firstSetMode == 'confirm') {
                this.playSE('accept1');
                this.saveSettings();
                this.setState('menu');
            }
        }
    }

    /**
     * 설정 화면 키 입력 핸들링
     * @param {string} key 입력 또는 해제된 키
     * @param {boolean} vkeyExplosion 가상 키 강조 효과 적용 여부
     */
    handleKeyInputSetting(key, vkeyExplosion) {
        const selfs = this;
        let index = 0;

        if(this.settingList.indexOf(this.settingChoosing) >= 0) index = this.settingList.indexOf(this.settingChoosing);
        this.settingChoosing = this.settingList[index];

        if(key == this.enterKey) {
            if(this.settingChoosing == 'resetAll') {
                if(this.settingResetReask) {
                    this.playSE('special1');
                    // 초기화
                    this.resetAll();
                } else {
                    this.playSE('accept1');
                    // 한번 더 물어봄
                    this.settingResetReask = true;
                }
            } else if(this.settingModifyingMode) {
                this.playSE('accept1');
                this.settingModifyingMode = false; // 설정 변경 모드 OFF

                if(this.settingChoosing == 'setGraphicQuality') {
                    // 그래픽 퀄리티 해상도는 해상도 관련 사항이므로 따로 처리
                    this.disable3d = true;
                    if(this.settingGraphicQualityChoosing == 'LOW') {
                        this.ressets.w = 1280;
                        this.ressets.h =  720;
                    } else if(this.settingGraphicQualityChoosing == 'MEDIUM') {
                        this.ressets.w = 1920;
                        this.ressets.h = 1080;
                    } else if(this.settingGraphicQualityChoosing == 'HIGH') {
                        this.ressets.w = 1920;
                        this.ressets.h = 1080;
                        this.disable3d = false;
                    }
                    this.setResolution(this.ressets.w, this.ressets.h);
                }

                // 설정 저장
                this.saveSettings();
            } else {
                this.playSE('accept1');
                this.settingModifyingMode = true; // 설정 변경 모드 ON
            }
        } else if(key == this.escKey) {
            this.playSE('cancel');
            this.settingResetReask = false;
            if(this.settingModifyingMode) {
                this.settingModifyingMode = false;
                this.loadSettings();
            } else {
                this.setState('menu');
            }
        } else if(this.settingModifyingMode) {
            this.settingResetReask = false;
            if(key == this.arrowKeys[2]) { // LEFT
                if(this.settingChoosing == 'fixKeypressTiming') {
                    this.keypressTiming--;
                    if(this.keypressTiming < 0) this.keypressTiming = 0;
                } else if(this.settingChoosing == 'fixSongTiming') {
                    this.songTiming--;
                    if(this.songTiming < 0) this.songTiming = 0;
                } else if(this.settingChoosing == 'setNoteSpeedMultiplier') {
                    this.noteSpeedMultiplier--;
                    if(this.noteSpeedMultiplier < 0.1) this.noteSpeedMultiplier = 0.1;
                } else if(this.settingChoosing == 'setGraphicQuality') {
                    let idxChoose = this.settingsGraphicQuality.indexOf(this.settingGraphicQualityChoosing);
                    idxChoose--;
                    if(idxChoose < 0) idxChoose = this.settingsGraphicQuality.length - 1;
                    this.settingGraphicQualityChoosing = this.settingsGraphicQuality[idxChoose];
                }
            } else if(key == this.arrowKeys[3]) { // RIGHT
                if(this.settingChoosing == 'fixKeypressTiming') {
                    this.keypressTiming++;
                    if(this.keypressTiming >= 1000) this.keypressTiming = 1000;
                } else if(this.settingChoosing == 'fixSongTiming') {
                    this.songTiming++;
                    if(this.songTiming >= 1000) this.songTiming = 1000;
                } else if(this.settingChoosing == 'setNoteSpeedMultiplier') {
                    this.noteSpeedMultiplier++;
                    if(this.noteSpeedMultiplier >= 8.0) this.noteSpeedMultiplier = 8.0;
                } else if(this.settingChoosing == 'setGraphicQuality') {
                    let idxChoose = this.settingsGraphicQuality.indexOf(this.settingGraphicQualityChoosing);
                    if(idxChoose < 0) idxChoose = 0;
                    idxChoose++;
                    if(idxChoose >= this.settingsGraphicQuality.length) idxChoose = 0;
                    this.settingGraphicQualityChoosing = this.settingsGraphicQuality[idxChoose];
                }
            }
        } else {
            this.settingResetReask = false;
            if(key == this.arrowKeys[0]) { // UP
                index--;
                if(index < 0) index = 0;
                this.settingChoosing = this.settingList[index];
            } else if(key == this.arrowKeys[1]) { // DOWN
                index++;
                if(index >= this.settingList.length) index = this.settingList.length - 1;
                this.settingChoosing = this.settingList[index];
            }
        }
    }

    /**
     * 플레이 화면 키 입력 핸들링
     * @param {string} key 입력 또는 해제된 키
     * @param {boolean} vkeyExplosion 가상 키 강조 효과 적용 여부
     */
    handleKeyInputPlaying(key, vkeyExplosion) {
        const selfs = this;
        let index = 0;

        if(key == this.enterKey) {
            // 플레이 중이며 엔터 키
            if(this.paused) { // 일시정지 중일 때 --> 재개 처리
                this.resumeSong();
            }
        } else if(key == this.escKey) {
            // 플레이 중이며 ESC키
            if(this.paused) {
                // 이미 일시정지 중일 때 또 ESC 누름 --> 포기 처리
                this.onGameOver();
            } else {
                // 일시정지 중이 아닐 때 --> 일시정지 시작
                this.pauseSong();
            }
        } else {
            // 노트 처리
            if(this.keyList.indexOf(key) >= 0) {
                let idx;
                let notePlacer = null; // 해당 키에 맞는 NotePlacer 를 찾아야 함
                for(idx=0; idx<this.notePlacers.length; idx++) {
                    if(this.notePlacers[idx].key === key) {
                        notePlacer = this.notePlacers[idx];
                        break;
                    }
                }
                if(notePlacer == null) return;

                this.handleNotePlacerCalled(notePlacer);
            }
        }

        // 가상 키 강조
        if(vkeyExplosion) {
            // 해당 가상 키 찾기
            for(let idx=0; idx<this.objects.length; idx++) {
                const objOne = this.objects[idx];
                if(objOne instanceof VirtualKey) {
                    if(key == objOne.key) {
                        objOne.explosing = 1;
                        break;
                    }
                }
            }
        }
    }

    /**
     * 기록 목록 화면 키 입력 핸들링
     * @param {string} key 입력 또는 해제된 키
     * @param {boolean} vkeyExplosion 가상 키 강조 효과 적용 여부
     */
    handleKeyInputRecordList(key, vkeyExplosion) {
        const selfs = this;
        let index = 0;

        if(this.seeingRecord == null && this.selectedRecordList.length >= 1) this.seeingRecord = this.selectedRecordList[0];
                
        // 기록 인덱스 구하기
        index = 0;
        for(let idx=0; idx<this.selectedRecordList.length; idx++) {
            if(this.selectedRecordList[idx] == this.seeingRecord) {
                index = idx;
                break;
            }
        }
        
        // 키 적용
        if(key == this.arrowKeys[0]) { // UP
            index--;
            if(index < 0) index = this.selectedRecordList.length - 1;
            this.seeingRecord = this.selectedRecordList[index];
        } else if(key == this.arrowKeys[1]) { // DOWN
            index++;
            if(index >= this.selectedRecordList.length) index = 0;
            this.seeingRecord = this.selectedRecordList[index];
        } else if(key == this.arrowKeys[2]) { // LEFT
            this.selectRecordType = (this.selectRecordType == 'local' ? 'internet' : 'local');
            if(this.backend == null) this.selectRecordType == 'local';
            if(this.selectRecordType == 'internet') { this.getInternetRecords().then((list) => { selfs.selectedRecordList = list; if(list != null && list.length >= 1) selfs.seeingRecord = selfs.selectedRecordList[0]; }); }
            else { this.selectedRecordList = this.getRecords(); }
        } else if(key == this.arrowKeys[3]) { // RIGHT
            this.selectRecordType = (this.selectRecordType == 'local' ? 'internet' : 'local');
            if(this.backend == null) this.selectRecordType == 'local';
            if(this.selectRecordType == 'internet') { this.getInternetRecords().then((list) => { selfs.selectedRecordList = list; if(list != null && list.length >= 1) selfs.seeingRecord = selfs.selectedRecordList[0]; }); }
            else { this.selectedRecordList = this.getRecords(); }
        } else if(key == this.enterKey) { // ENTER
            if(this.seeingRecord == null) return;
            this.playSE('accept1');
            this.setState('recorddet');
        } else if(key == this.escKey) {
            this.playSE('cancel');
            this.setState('menu');
        }
    }

    /**
     * 기록 상세 화면 키 입력 핸들링
     * @param {string} key 입력 또는 해제된 키
     * @param {boolean} vkeyExplosion 가상 키 강조 효과 적용 여부
     */
    handleKeyInputRecordDetail(key, vkeyExplosion) {
        this.playSE('accept1');
        this.setState('recordlist');
    }

    /**
     * 결과 화면 키 입력 핸들링
     * @param {string} key 입력 또는 해제된 키
     * @param {boolean} vkeyExplosion 가상 키 강조 효과 적용 여부
     */
    handleKeyInputResult(key, vkeyExplosion) {
        if(key == this.escKey) {
            this.setState('menu');
        }
    }

    /**
     * 크레딧 화면 입력 핸들링
     * @param {string} key 입력 또는 해제된 키
     * @param {boolean} vkeyExplosion 가상 키 강조 효과 적용 여부
     */
    handleKeyInputCredit(key, vkeyExplosion) {
        this.playSE('special1');
        this.setState('menu');
    }

    /**
     * NotePlacer 호출 처리
     * @param {NotePlacer} notePlacer notePlacer 객체
     */
    handleNotePlacerCalled(notePlacer) {
        let idx = 0;

        // NotePlacer 폭발 처리
        notePlacer.explosing = 1;

        // 해당 NotePlacer 과 충돌 중인 노트들 수집
        let notes = [];
        for(idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if((obj instanceof Note)) {
                if(obj.locationIndex != notePlacer.locationIndex) continue;
                if(obj.removed) continue;
                if(obj.explosing >= 1) continue;

                const dist = notePlacer.isMeetVerticalRangeIn(obj);
                if(dist < 0) continue;

                notes.push({
                    idx : idx,
                    note : obj,
                    y : obj.y,
                    dist : dist
                });
            }
        }

        if(notes.length <= 0) return; // 충돌한 노트가 없으면 중단

        // 가장 y값이 낮은 노트 찾기
        let minimumY = 99999;
        let minimumIdx  = notes[0].idx;
        let minimumNote = notes[0].note;
        let mimimumDist = notes[0].dist;
        for(idx=0; idx<notes.length; idx++) {
            let noteOne = notes[idx];
            if(noteOne.y < minimumY) {
                minimumY = noteOne.y;
                minimumIdx  = noteOne.idx;
                minimumNote = noteOne.note;
                mimimumDist = noteOne.dist;
            }
        }

        // 거리를 백분율로 환산 - 이후 노트 속도 반영해야 함
        const distance = Math.abs((mimimumDist * 100.0) / ( (minimumNote.r + notePlacer.r) * _shuttingstarcore.noteSpeedMultiplier * (_shuttingstarcore.noteSpeedFixedConst * 4) ) );

        // 거리에 따른 판정, 점수 계산
        let resultMark = this.createResultMark(distance);
        this.processResultMark(resultMark);
        this.displayResultMark(resultMark);

        minimumNote.explosing = 1;  // 노트의 폭발 시작
        minimumNote.removed = true; // 처리했음을 표시

        // 추가 폭발 객체 추가
        if(resultMark == 'MISS') {
            minimumNote.missed = true;
            const newExplosinves = new FailExplosing(obj.locationIndex, obj.y, '255, 0, 0', '255, 0, 0');
            this.objects.push(newExplosinves);
        } else {
            const newExplosinves = new CorrectNoteExplosing(minimumNote.locationIndex, minimumNote.y, minimumNote.color, '255, 255, 255');
            this.objects.push(newExplosinves);
        }
    }

    /**
     * 마우스 클릭 / 터치 이벤트 처리, mouseCursorObject 는 마우스 클릭 위치에 생성되는 임시 객체로 isConflicted 지원
     * @param {number} x x 값
     * @param {number} y y 값
     * @param {ShuttingStarsObject} mouseCursorObject mouseCursorObject 값
     */
    handleMouseClick(x, y, mouseCursorObject) {
        const selfs = this;

        if(this.state == 'title' && this.titleScreenWaiting) {
            // 로딩 끝난 이후 타이틀 화면에서는 아무데나 터치하면 메뉴로 넘어가야 함
            this.setState('menu');
            return;
        }

        // 각 영역 별 터치 지점을 mouseEvents 배열에 담아놨음
        for(let mdx=0; mdx<selfs.mouseEvents.length; mdx++) {
            const evOne = selfs.mouseEvents[mdx];
            // 임시 객체 (충돌여부 판단 위함)
            const tempObject = new MouseEventArea();
            tempObject.type = evOne.type;
            tempObject.x    = evOne.x;
            tempObject.y    = evOne.y;
            tempObject.r    = evOne.r;
            if(tempObject.h) tempObject.h = evOne.h;
            tempObject.fill = true;

            if(mouseCursorObject.isConflicted(tempObject)) {
                if(typeof(evOne.click) == 'function') evOne.click();
            }
        }
    }

    /**
     * 키 입력 해제 (손가락을 뗌) 처리
     * @param {string} key 입력 또는 해제된 키
     */
    handleKeyRelease(key) {
        if(this.keyReleaseDebugMode) console.log('KEY RELEASE : ' + this.elapsedTime + ', ' + key);
        key = String(key);

        const timeDiff = (typeof(this.keypressing[key]) == 'undefined' || this.keypressing[key] == null) ? 0 : new Date().getTime() - this.keypressing[key];
        this.keypressing[key] = null;

        // TODO 롱노트 구현 시 꼭 수정되어야 하는 파트
    }

    /**
     * 마우스 클릭 해제 / 터치 해제 이벤트 처리, mouseCursorObject 는 마우스 클릭 위치에 생성되는 임시 객체로 isConflicted 지원
     * @param {number} x x 값
     * @param {number} y y 값
     * @param {ShuttingStarsObject} mouseCursorObject mouseCursorObject 값
     */
    handleMouseRelease(x, y, mouseCursorObject) {
        const selfs = this;
        // 각 영역 별 터치 지점을 mouseEvents 배열에 담아놨음
        for(let mdx=0; mdx<selfs.mouseEvents.length; mdx++) {
            const evOne = selfs.mouseEvents[mdx];
            // 임시 객체 (충돌여부 판단 위함)
            const tempObject = new ShuttingStarsObject();
            tempObject.type = evOne.type;
            tempObject.x    = evOne.x;
            tempObject.y    = evOne.y;
            tempObject.r    = evOne.r;
            if(tempObject.h) tempObject.h = evOne.h;
            tempObject.fill = true;

            if(mouseCursorObject.isConflicted(tempObject)) {
                if(typeof(evOne.release) == 'function') evOne.release();
            }
        }
    }

    /**
     * 플레이 일시정지
     */
    pauseSong() {
        this.paused = true;
        if(this.audio != null) { this.audio.pause(); }
        if(this.videoBga != null) {
            if(this.videoBgaUrl != null) this.videoBga.pause();
        }
    }

    /**
     * 플레이 재개
     */
    resumeSong() {
        if(this.paused) { // 일시정지 중일 때 --> 재개 처리
            this.resumingTime = this.resumeDelayTime * this.timeMultiplier;
            this.paused = false;
        }
    }

    /**
     * 강력 알림 메시지 출력
     * @param {string} msg msg 값
     * @param {number|boolean} red 빨간색 성분 또는 경고 강조 여부
     */
    alert(msg, red) {
        ShuttingStarsUtility.toast(String(msg), red);
    }

    /**
     * 예 / 아니오 선택 받기 (Promise)
     * @param {string} msg msg 값
     */
    confirm(msg) {
        return new Promise((resolve, reject) => {
            this.afterConfirmCallback = function(yn) { resolve(yn); }
            this.confirmMessage = String(msg);
            this.confirmAsking = true;
            this.confirmChoosingYes = false;
        });
    }
    
    /**
     * 거리에 따른 판정 산출
     * @param {number} distance distance 값
     * @returns {string} 처리 결과
     */
    createResultMark(distance) {
        if(distance < 10.0) {
            return 'PERFECT';
        } else if(distance < 30.0) {
            return 'GREAT';
        } else if(distance < 50.0) {
            return 'GOOD';
        }
        return 'BAD';
    }
    
    /**
     * 판정 결과에 따라 HP, 콤보 처리
     * @param {string} resultMark resultMark 값
     */
    processResultMark(resultMark) {
        if(resultMark == null) return;
        if(resultMark == 'PERFECT') {
            this.point += (100 * (this.combo + 1));
            this.combo++;
            if(this.maxCombo < this.combo) this.maxCombo = this.combo;
            this.missCombo = 0;
            this.report.PERFECT++;

            this.hp += this.combo;
            if(this.hp > 100) this.hp = 100;
        } else if(resultMark == 'GREAT') {
            this.point += (70 * (this.combo + 1));
            this.combo++;
            if(this.maxCombo < this.combo) this.maxCombo = this.combo;
            this.missCombo = 0;
            this.report.GREAT++;

            this.hp += (this.combo / 2.0);
            if(this.hp > 100) this.hp = 100;
        } else if(resultMark == 'GOOD') {
            this.point += (50 * (this.combo + 1));
            this.combo++;
            if(this.maxCombo < this.combo) this.maxCombo = this.combo;
            this.missCombo = 0;
            this.report.GOOD++;

            this.hp += (this.combo / 4.0);
            if(this.hp > 100) this.hp = 100;
        } else if(resultMark == 'BAD') {
            this.combo = 0;
            this.missCombo = 0;
            this.report.BAD++;
            this.hp -= 1.0;
            if(this.hp < 0) this.hp = 0;
        } else {
            this.combo = 0;
            this.missCombo++;
            this.report.MISS++;
            this.hp -= (4.0 + (this.missCombo >= 1 ? (  this.missCombo >= 10 ? 2 : 1 ) : 0));
            if(this.hp < 0) this.hp = 0;
        }
    }
    
    /**
     * 판정 띄우기
     * @param {string} resultMark resultMark 값
     */
    displayResultMark(resultMark) {
        if(resultMark == null) return;
        this.accelerateExplosingJudgeMarks();
        this.objectsPlaying.push(new JudgeMark(resultMark));
    }

    /**
     * 노트의 반지름
     * @returns {number} 현재 해상도에 맞춘 노트 반지름
     */
    getNoteRadius() {
        return ((this.stageSize.h * this.sizeFixedConst) / this.stageRows) / 2.0;
    }

    /**
     * 화면에 객체들 출력, 동시 반복 호출되며 init 에서 시작됨
     */
    render() {
        try {
            // 캔버스 비우기
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // 좌표계 디버그 모드
            if(this.coordinate2dDebugMode) {
                this.renderCoordinate2dDebug();
            }

            // 곡 타이틀 (플레이 전 로딩시간)
            if(this.state == 'songtitle') {
                // 한 타이밍, 게임 렌더링 시도를 하여 이미지 등 리소스 캐싱 유도
                if(this.songTitleTime == this.songTitleBaseTime - 1) {
                    this.renderPlaying();
                    // 다시 비우기
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                }
            }

            if(this.dark) this.ctx.fillStyle = 'rgba(5, 5, 5, 0.9)';
            else          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            if(this.backgroundImage != null && this.backgroundImage != '') {
                // 배경 이미지 존재 시 지금 출력
                this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
            }

            // 디버그 모드 켜진 경우 디버그용 객체 출력
            if(this.renderDebugMode) {
                this.renderDebug();
            }

            // 글로벌 객체 그리기 (우선순위 낮음)
            for(let idx=0; idx<this.objects.length; idx++) {
                const obj = this.objects[idx];
                if(typeof(obj.priority) == 'undefined') continue;
                if(obj.priority == 'low') {
                    if(typeof(obj.draw) == 'function') obj.draw(this.ctx);
                }
            }

            // 현재 게임 상태별 렌더링
            if(this.state == 'playing' || this.state == 'gameover') {
                this.renderPlaying();
            } else if(this.state == 'firstset') {
                this.renderFirstSet();
            } else if(this.state == 'title') {
                this.renderTitle();
            } else if(this.state == 'menu') {
                this.renderMenu();
            } else if(this.state == 'songchoosing') {
                this.renderSongChoosing();
            } else if(this.state == 'songtitle') {
                this.renderSongTitle();
            } else if(this.state == 'result') {
                this.renderResult();
            } else if(this.state == 'recordlist') {
                this.renderRecordList();
            } else if(this.state == 'recorddet') {
                this.renderRecordResult();
            } else if(this.state == 'setting') {
                this.renderSetting();
            } else if(this.state == 'credit') {
                this.renderCredit();
            }

            // 글로벌 객체 그리기 (우선순위 높음)
            for(let idx=0; idx<this.objects.length; idx++) {
                const obj = this.objects[idx];
                if(typeof(obj.priority) == 'undefined') continue;
                if(obj.priority == 'high') {
                    if(typeof(obj.draw) == 'function') obj.draw(this.ctx);
                }
            }

            // confirm 그리기
            if(this.confirmAsking) {
                this.renderConfirmBlock();
            }
        } catch(e) {
            console.error(e);
        }
    }

    /**
     * 화면 출력 - 플레이 중 출력
     */
    renderPlaying() {
        // titleDelayTime 값이 있으면, 플레이 중임에도 타이틀 화면 출력
        //    노트 올라오는 속도 때문에 게임이 시작됐음에도 곡이 늦게 재생도록 한 데에 대한 대응책, 노트속도 배수에 따라 이 값을 조절할 예정
        if(this.titleDelayTime >= 1) {
            this.renderSongTitle();
            return;
        }

        let fontSize;

        // 시각화 그리기
        if(this.useAudioVisualizer && this.playPrepared) {
            if(this.audioAnalyser != null && this.audioSource != null) this.renderAudioVisualizing();
        }

        if(! this.disable2d) {
            // 객체 그리기
            for(let idx=0; idx<this.objectsPlaying.length; idx++) {
                const obj = this.objectsPlaying[idx];
                if(obj.explosing >= obj.explosingMax) continue;
                if(obj.hidden) continue;
                if(obj instanceof Note) {
                    if(obj.y < -300 || obj.y >= this.getStageHeight() + 300) continue;
                    if((! this.disable3d) && this.use3d.notes) continue;
                }
                if(typeof(obj.draw) == 'function') obj.draw(this.ctx);
            }

            // HP바 그리기
            this.renderHpBar();
        }

        // 일시정지 상태 그리기
        if(this.paused) {
            fontSize = this.convertFontSize(20);
            this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();

            if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.textAlign = "center";
            this.ctx.strokeText(this.trans('PAUSED'), this.convertX(this.getStageWidth() / 2), this.convertY((this.getStageHeight() / 2) + 10));

            fontSize = this.convertFontSize(12);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();

            let escKeyLabel = this.escKey;
            if(this.escKey == 'ESCAPE') escKeyLabel = 'ESC';

            if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.textAlign = "center";
            this.ctx.strokeText(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('%1 key to resume, %2 key to give up !'), '%1', this.enterKey), '%2', escKeyLabel), this.convertX(this.getStageWidth() / 2), this.convertY((this.getStageHeight() / 2) + ((fontSize * 2) + 10) , false));
        }

        // 일시정지 해제 대기시간 그리기
        if(this.resumingTime >= 1) {
            fontSize = this.convertFontSize(15);
            this.ctx.font = fontSize + 'px ' + this.getRenderFontFamily();

            if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.textAlign = "center";
            this.ctx.strokeText(ShuttingStarsUtility.replaceString(this.trans('Resume within % !'), '%', String(this.resumingTime)), this.convertX(this.getStageWidth() / 2), this.convertY((this.getStageHeight() / 2) + 10));
        }

        // 시간 소요 디버그 출력
        if(this.timeElapseDebugMode) {
            fontSize = this.convertFontSize(12);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();

            if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.textAlign = "right";
            this.ctx.fillText(String(ShuttingStarsUtility.floor2(this.elapsedTime   )), this.convertX(this.getStageWidth() * 3 / 5), this.convertY(this.getStageHeight() / 10));
            this.ctx.fillText(String(ShuttingStarsUtility.floor2(this.elapsedTimeOld)), this.convertX(this.getStageWidth() * 3 / 5), this.convertY(this.getStageHeight() / 10) + this.metricSize2);
        }

        // 게임 오버 그리기
        if(this.state == 'gameover') {
            fontSize = this.convertFontSize(20);
            this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();

            this.ctx.fillStyle = this.convertColor('rgba(250, 40, 40, 0.9)');
            this.ctx.textAlign = "center";
            this.ctx.fillText('GAME OVER', this.convertX(this.getStageWidth() / 2), this.convertY((this.getStageHeight() / 2) + 20, false));
        }
    }

    /**
     * 폰트 실제크기 계산
     * @param {boolean} force 측정값을 강제로 다시 계산할지 여부
     */
    calculateFontMetric(force) {
        if(this.metricSize1 == 20 || force) {
            let metric1, metric2, metric3, fontSize, label;

            // 폰트 크기 측정
            // 선택된 곡인 경우, 배경색 출력
            //    곡 이름과 점유 공간 크기를 알아야 함
            fontSize = this.convertFontSize(20);
            label = 'ABCDE12345';
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            metric1 = this.ctx.measureText(label);

            fontSize = this.convertFontSize(15);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            metric2 = this.ctx.measureText(label);

            fontSize = this.convertFontSize(30);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            metric3 = this.ctx.measureText(label);

            this.metricSize1 = this.convertY(metric1.actualBoundingBoxAscent + metric1.fontBoundingBoxDescent, false);
            this.metricSize2 = this.convertY(metric2.actualBoundingBoxAscent + metric2.fontBoundingBoxDescent, false);
            this.metricSize3 = this.convertY(metric3.actualBoundingBoxAscent + metric3.fontBoundingBoxDescent, false);
        }
    }

    /**
     * 화면 출력 - 타이틀
     */
    renderTitle() {
        let idx;
        let rows = 0;
        let fontSize = this.convertFontSize(30);
        let opacity = 0.9;
        let gap = Math.floor(fontSize / 2.0);
        let label = '';
        
        this.calculateFontMetric(true);

        rows = this.convertY(this.getStageHeight() / 3, false);
        fontSize = this.convertFontSize(30);
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.strokeText('Shutting Stars', this.convertX(this.getStageWidth() / 2), this.applyY(rows));

        rows += this.metricSize3 + gap;

        fontSize = this.convertFontSize(15);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        label = 'Please wait...';
        if(this.titleScreenWaiting) {
            if(this.virtualKey) label = 'Touch here to start';
            else                label = '% key to start';
        }
        rows = this.convertY(this.getStageHeight(), false) - (this.metricSize2 * 3);
        this.ctx.fillText(ShuttingStarsUtility.replaceString(this.trans(label), '%', this.enterKey), this.convertX(this.getStageWidth() / 2), rows);

        // Copyright, 빌드 번호 출력
        fontSize = this.convertFontSize(12);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = 'right';
        this.ctx.fillText('Copyright 2026 HJOW', this.convertX(this.getStageWidth() * 9 / 10), rows);
        this.ctx.fillText('BUILD ' + this.build, this.convertX(this.getStageWidth() * 9 / 10), rows + this.metricSize2);

        // 로그인된 경우 로그인된 이메일 주소 출력
        if(this.backend != null && this.backend.avail) {
            if(this.backend.logined) {
                if(this.backend.user) {
                    fontSize = this.convertFontSize(12);
                    this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
                    opacity = 0.9;
                    if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                    else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                    this.ctx.textAlign = 'left';

                    this.ctx.fillText(this.backend.user.email, this.convertX(fontSize * 1.5), rows);
                }
            }
        }

        this.renderNoticeBottom();
    }

    /**
     * 화면 출력 - 메인 메뉴
     */
    renderMenu() {
        const selfs = this;
        let idx;
        let rows = 0;
        let fontSize = this.convertFontSize(30);
        let opacity = 0.9;
        let gap = Math.floor(fontSize / 2.0);
        let label = '';
        
        this.calculateFontMetric(true);
        gap = Math.floor(this.metricSize2 / 2.0);

        fontSize = this.convertFontSize(30);
        rows = this.convertY(this.getStageHeight() / 5, false);
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.strokeText('Shutting Stars', this.convertX(this.getStageWidth() / 2), rows);
        rows += (this.metricSize3 * 2) + gap;

        if(this.menuChoosing == null) this.menuChoosing = this.menuListDynamic[0];

        for(idx=0; idx<this.menuListDynamic.length; idx++) {
            let menuOne = this.menuListDynamic[idx];

            if(menuOne == 'login' || menuOne == 'logout') continue;

            if(menuOne == 'play'   ) label = this.trans('PLAY');
            if(menuOne == 'setting') label = this.trans('SETTING');
            if(menuOne == 'credit' ) label = this.trans('CREDIT');
            if(menuOne == 'records') label = this.trans('RECORDS');
            if(menuOne == 'login'  ) label = this.trans('LOGIN');
            if(menuOne == 'logout' ) label = this.trans('LOGOUT');

            fontSize = this.convertFontSize(20);

            if(this.menuChoosing == menuOne) {
                this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
                opacity = 0.99;

                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), rows);
            } else {
                this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
                opacity = 0.3;

                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                this.ctx.fillText(label, this.convertX(this.getStageWidth()  / 2), rows);
            }
            
            rows += (this.metricSize1 * 2) + gap;
        }

        fontSize = this.convertFontSize(30);
        rows += this.metricSize3 * 5;

        // 조작키 안내 출력
        fontSize = this.convertFontSize(12);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        opacity = 0.9;
        label = this.trans('MOVE : ');
        for(idx=0; idx<this.arrowKeys.length; idx++) {
            let arrowKeyOne = this.arrowKeys[idx];
            let arrowKeyLabel = String(arrowKeyOne);
            if(arrowKeyOne == 'ARROWUP') arrowKeyLabel = '↑';
            else if(arrowKeyOne == 'ARROWDOWN') arrowKeyLabel = '↓';
            else if(arrowKeyOne == 'ARROWLEFT') arrowKeyLabel = '←';
            else if(arrowKeyOne == 'ARROWRIGHT') arrowKeyLabel = '→';
            else arrowKeyLabel = String(arrowKeyOne);

            label += arrowKeyLabel;
        }
        label += '    ' + this.trans('ACCEPT : ') + this.enterKey;
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = 'left';
        rows = this.convertY(this.getStageHeight(), false) - (this.metricSize2 * 3);
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 10), rows);

        // Copyright, 빌드 번호 출력
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = 'right';
        this.ctx.fillText('Copyright 2026 HJOW', this.convertX(this.getStageWidth() * 9 / 10), rows);
        this.ctx.fillText('BUILD ' + this.build, this.convertX(this.getStageWidth() * 9 / 10), rows + this.metricSize2);

        // 로그인된 경우 로그인된 이메일 주소 출력
        if(this.backend != null && this.backend.avail) {
            let logined = false;
            let label = '';

            fontSize = this.convertFontSize(12);
            this.ctx.textAlign = 'left';
            
            if(this.menuChoosing == 'login' || this.menuChoosing == 'logout') {
                this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
                opacity = 0.99;
                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
            } else {
                this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
                opacity = 0.6;
                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
            }

            if(this.backend.logined) {
                if(this.backend.user) {
                    logined = true;
                }
            }

            if(logined) {
                label = this.backend.user.email + ' (' + this.trans('LOGOUT') + ")";
            } else {
                label = this.trans('GUEST') + ' (' + this.trans('LOGIN') + ")";;
            }
            this.ctx.fillText(label, this.convertX(fontSize * 2.8), this.convertY(this.getStageHeight(), false) - (this.metricSize2 * 4.5));
        }

        this.renderNoticeBottom();
    }

    /**
     * 공통 공지사항 (타이틀, 메뉴 화면에서 사용) 출력
     */
    renderNoticeBottom() {
        if(this.state == 'playing') return;

        let label = (this.language == 'ko' ? this.noticeKo : this.noticeEn);
        if(label == null) return;

        let x = ((Math.round(this.simultaneousTime / 4.0) % Math.round(this.getStageWidth())) * 3) - this.getStageWidth();

        const fontSize = this.convertFontSize(12);
        const opacity = 0.9;
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, this.convertX(x), this.convertY(this.getStageHeight(), false) - (this.metricSize2 * 1.2));
    }

    /**
     * 화면 출력 - 곡 선정 화면
     */
    renderSongChoosing() {
        const selfs = this;
        let idx, ddx, jdx;
        let rows = 0;
        let cols = 0;
        let fontSize = this.convertFontSize(20);
        let opacity = 0.9;
        let gap = Math.floor(fontSize / 2.0);
        let label = '';
        let lefts, rights;

        this.calculateFontMetric();
        gap = Math.floor(this.metricSize2 / 2.0);

        // 최초 Y 좌표 계산
        rows = this.convertY(this.getStageHeight() / 5, false);

        // 곡 목록이 비어 있는 경우를 처리
        fontSize = this.convertFontSize(20);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        let emptyState = false;

        if(this.songChoosingMode == 'mission') {
            if(this.missions.length <= 0) {
                this.ctx.strokeText(this.trans('No missions available !'), this.convertX(this.getStageWidth() / 2), rows);
                emptyState = true;
            }
        } else {
            if(this.songDisplays.length <= 0) {
                this.ctx.strokeText(this.trans('No songs available !'), this.convertX(this.getStageWidth() / 2), rows);
                emptyState = true;
            }
        }
        
        // 타이틀 출력
        lefts  = '';
        rights = '';
        if((this.songChoosingMode == 'mission' && this.missions.length >= 1) || (this.songChoosingMode == 'default' && this.songDisplays.length >= 1)) {
            lefts  = '◀ ';
            rights = ' ▶';
        }
        fontSize = this.convertFontSize(30);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        if(this.songChoosingMode == 'mission') {
            this.ctx.strokeText(lefts + this.trans('Choose your mission !') + rights, this.convertX(this.getStageWidth() / 2), rows);
        } else {
            if(this.difficultyChoosing) this.ctx.strokeText(this.trans('Choose difficulty !'), this.convertX(this.getStageWidth() / 2), rows);
            else this.ctx.strokeText(lefts + this.trans('Choose your song !') + rights, this.convertX(this.getStageWidth() / 2), rows);
        }
        rows += (this.metricSize3 * 2) + (gap);

        // 곡 목록이 빈 경우 처리
        if(emptyState) {
            rows += this.metricSize1 + gap;

            // ESC 표기
            let escKeyLabel = this.escKey;
            if(this.escKey == 'ESCAPE') escKeyLabel = 'ESC';

            fontSize = this.convertFontSize(30);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.trans('EMPTY !'), this.convertX(this.getStageWidth() / 2), rows);

            if(this.songChoosingMode == 'mission') {
                setTimeout(() => {
                    // 곡/미션 목록으로 되돌려야 하는데, 미션/곡 목록도 없으면, 메뉴로 이동
                    if(selfs.songDisplays.length <= 0) selfs.setState('menu');
                    else selfs.songChoosingMode = 'default';    
                }, 4000);
            } else {
                setTimeout(() => {
                    // 곡/미션 목록으로 되돌려야 하는데, 미션/곡 목록도 없으면, 메뉴로 이동
                    if(selfs.missions.length <= 0) selfs.setState('menu');
                    else selfs.songChoosingMode = 'mission';    
                }, 4000);
            }
            return;
        }

        let centerY = this.convertY(this.getStageHeight() / 2, false);
        let currentRow = centerY; // 기존 rows 값을 보존해야 하기 때문에 따로 선언
        let row1Height = 0;
        let currentIndex = 0;
        let songChoosen = null;
        let opacityOne = 0;
        opacity = 0.99;

        if(this.songChoosingMode == 'mission') {
            // mission 모드 - 난이도만 선택

            // 미션을 선택하지 않은 상태인 경우 첫 미션을 출력
            if(this.missionChoosing == null) { this.missionChoosing = this.missions[0]; }

            // 1개 행 높이 사전 계산
            row1Height = this.metricSize3 + (gap * 3);

            // 선택 중인 미션이 몇 번째인지 확인
            for(idx=0; idx<this.missions.length; idx++) {
                if(this.missions[idx] == this.missionChoosing) { currentIndex = idx; break; }
            }

            // 미션 목록 3번 출력
            for(jdx=0; jdx<3; jdx++) {
                if(jdx == 0) {
                    currentRow = centerY - (  (row1Height * (this.missions.length + currentIndex))); // 1바퀴 하고도 선택된 미션 전단계 만큼 위로 올려야 함
                    opacityOne = ( 0.5 / (this.missions.length + currentIndex) );
                    opacity = 0.5 - opacityOne;
                }
                for(idx=0; idx<this.missions.length; idx++) {
                    let missionOne = this.missions[idx];

                    if(currentRow + row1Height < rows) { // 타이틀 아래부분을 뚧고 위로 올라가는 위치인 경우 출력하지 않음
                        currentRow += row1Height + gap;
                        continue;
                    }

                    let choosen = (jdx == 1 && this.missionChoosing == missionOne);
                    if(choosen) {
                        songChoosen = missionOne;

                        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.99)');
                        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.99)');

                        this.ctx.fillRect(this.getLeftMarginPage(), this.convertY(this.getStageHeight() / 2, false), this.convertX(this.getStageWidth()), row1Height);
                    }

                    // 화면이 수직 방향인 경우 하단 3분의 1 영역 이하는 더 흐리게 처리
                    if(! this.screenDirLandscape) {
                        if(currentRow >= this.convertY(this.getStageHeight() * 1.7 / 3, false)) {
                            opacity = opacity / 4;
                        }
                    }

                    // 미션 이름 출력
                    fontSize = this.convertFontSize(20);
                    label = missionOne.name;
                    this.ctx.textAlign = "center";
                    this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
                    if(choosen) {
                        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.99)');
                        else          this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.99)');
                        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), this.convertY(this.getStageHeight() / 2, false) + (row1Height / 2));
                    } else {
                        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), currentRow + (row1Height / 2));
                    }

                    currentRow += row1Height;
                    if(jdx == 0 || (jdx == 1 && idx < currentIndex)) opacity += opacityOne;
                    else opacity -= opacityOne;
                    if(opacity >= 0.99) opacity = 0.99;
                    if(opacity <= 0) opacity = 0.0;
                }
            }
        } else {
            // default 모드 - 곡을 선택해야 함
            //     곡을 선택하지 않은 상태인 경우 첫 곡을 출력
            if(this.songChoosing == null) { this.songChoosing = this.songDisplays[0]; }

            // 1개 행 높이 사전 계산
            row1Height = this.metricSize3 + this.metricSize1 + this.metricSize2 + (gap * 5);

            // 선택 중인 미션이 몇 번째인지 확인
            for(idx=0; idx<this.songDisplays.length; idx++) {
                if(this.songDisplays[idx] == this.songChoosing) { currentIndex = idx; break; }
            }

            // 곡 목록 3번 출력
            for(jdx=0; jdx<3; jdx++) {
                if(jdx == 0) {
                    currentRow = centerY - (  (row1Height * (this.songDisplays.length + currentIndex))); // 1바퀴 하고도 선택된 미션 전단계 만큼 위로 올려야 함
                    opacityOne = ( 0.5 / (this.songDisplays.length + currentIndex) );
                    opacity = 0.5 - opacityOne;
                }
                for(idx=0; idx<this.songDisplays.length; idx++) {
                    let songOne = this.songDisplays[idx];

                    if(currentRow + row1Height < rows) { // 타이틀 아래부분을 뚧고 위로 올라가는 위치인 경우 출력하지 않음
                        currentRow += row1Height + gap;
                        continue;
                    }

                    let choosen = (jdx == 1 && this.songChoosing == songOne);
                    if(choosen) {
                        songChoosen = songOne;

                        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.99)');
                        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.99)');

                        if(this.difficultyChoosing) {
                            this.ctx.fillRect(this.getLeftMarginPage(), this.convertY(this.getStageHeight() / 2, false), this.convertX(this.getStageWidth()), (row1Height + this.metricSize2 + (gap * 2)));
                        } else {
                            this.ctx.fillRect(this.getLeftMarginPage(), this.convertY(this.getStageHeight() / 2, false), this.convertX(this.getStageWidth()), (row1Height));
                        }
                    }

                    // 화면이 수직 방향인 경우 하단 3분의 1 영역 이하는 더 흐리게 처리
                    if(! this.screenDirLandscape) {
                        if(currentRow >= this.convertY(this.getStageHeight() * 1.7 / 3)) {
                            opacity = opacity / 4;
                        }
                    }

                    // 곡 이름 출력
                    fontSize = this.convertFontSize(20);
                    label = songOne.name;
                    this.ctx.textAlign = "center";
                    this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
                    if(choosen) {
                        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.99)');
                        else          this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.99)');
                        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), this.convertY(this.getStageHeight() / 2, false) + (row1Height / 3));
                    } else {
                        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), currentRow + (row1Height / 3));
                    }

                    // 작곡가, 노트작성자, bpm 출력
                    label = ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2, %3 BPM'), '%1', songOne.composer), '%2', songOne.noteWriter), '%3', String(songOne.bpm));
                    fontSize = this.convertFontSize(15);
                    this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();

                    this.ctx.textAlign = "center";
                    if(choosen) {
                        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                        else          this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), this.convertY(this.getStageHeight() / 2, false) + (row1Height * 2 / 3));
                    } else {
                        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                        this.ctx.strokeText(label, this.convertX(this.getStageWidth() / 2), currentRow + (row1Height * 2 / 3));
                    }

                    // 현재 선택된 곡이고, 난이도 선택해야 하는 차례인 경우
                    if(choosen && this.difficultyChoosing) {
                        fontSize = this.convertFontSize(15);
                        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();

                        if(this.difficultyChoosingList.length == 0) this.difficultyChoosingList = this.songChoosing.getDifficultyList();
                        let diffIdx = this.difficultyChoosingList.indexOf(this.difficulty);
                        if(diffIdx < 0) { diffIdx = 0; this.difficulty = this.difficultyChoosingList[diffIdx]; }
                        
                        cols = 0;
                        this.ctx.textAlign = "center";
                        for(ddx=0; ddx<this.difficultyChoosingList.length; ddx++) {
                            const diffOne = this.difficultyChoosingList[ddx];
                            const difficultyName = diffOne.difficultyLabel;
                            const difficultyNum  = diffOne.difficultyLevel;
                            const colors = this.difficultyNumberColor(difficultyNum);
                            this.ctx.fillStyle = this.convertColor('rgba(' + colors + ', ' + opacity + ')');

                            label = '';

                            if(ddx == diffIdx) label += '[';
                            
                            if(     difficultyName == 'easy'  ) label += 'EASY';
                            else if(difficultyName == 'normal') label += 'NORMAL';
                            else if(difficultyName == 'hard'  ) label += 'HARD';
                            else label += 'EX';

                            label += ' (' + difficultyNum + ')';
                            if(ddx == diffIdx) label += ']';

                            fontSize = this.convertFontSize(15);
                            if(ddx == diffIdx) this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
                            else               this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();

                            if(ddx == diffIdx) this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) + cols - (diffIdx * fontSize * 2), this.convertY(this.getStageHeight() / 2, false) + (row1Height));
                            else               this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) + cols - (diffIdx * fontSize * 2), this.convertY(this.getStageHeight() / 2, false) + (row1Height));
                            cols += (fontSize * label.length) + 20;
                        }
                    }

                    currentRow += row1Height;
                    if(jdx == 0 || (jdx == 1 && idx < currentIndex)) opacity += opacityOne;
                    else opacity -= opacityOne;
                    if(opacity >= 0.99) opacity = 0.99;
                    if(opacity <= 0) opacity = 0.0;
                }
            }
        }

        // 기타 안내 출력
        fontSize = this.convertFontSize(12);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        opacity = 0.9;
        label = this.trans('MOVE : ');
        for(idx=0; idx<this.arrowKeys.length; idx++) {
            let arrowKeyOne = this.arrowKeys[idx];
            let arrowKeyLabel = String(arrowKeyOne);
            if(arrowKeyOne == 'ARROWUP') arrowKeyLabel = '↑';
            else if(arrowKeyOne == 'ARROWDOWN') arrowKeyLabel = '↓';
            else if(arrowKeyOne == 'ARROWLEFT') arrowKeyLabel = '←';
            else if(arrowKeyOne == 'ARROWRIGHT') arrowKeyLabel = '→';
            else arrowKeyLabel = String(arrowKeyOne);

            label += arrowKeyLabel;
        }
        label += '    ' + this.trans('ACCEPT : ') + this.enterKey + '      ' + this.trans('BACK : ');
        if(this.escKey == 'ESCAPE') label += 'ESC';
        else                        label += this.escKey;

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 10), this.convertY(this.getStageHeight(), false) - (fontSize * 1.5));
        
        // 선택 곡 상세 정보 (Description) 출력
        if(songChoosen != null) {
            let descX = Math.floor(this.canvas.width * 2.7 / 4.0);
            let descW = Math.floor((this.canvas.width * 1.2) / 4.0);

            if(descW < 300) {
                descX = Math.floor(this.canvas.width / 2.0);
                descW = Math.floor((this.canvas.width) / 2.0);
            }

            let desc = songChoosen.getDescriptionSplit();
            if(desc != null && desc.length > 0) {
                /*
                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(180, 180, 180, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(100, 100, 100, ' + opacity + ')');

                this.ctx.fillRect(descX, Math.floor(this.canvas.height * 2.7 / 4.0), descW, Math.floor(this.canvas.height * 1.2 / 4.0));
                */

                fontSize = this.convertFontSize(12);
                this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
                this.ctx.textAlign = "left";
                // if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(100, 100, 100, ' + opacity + ')');
                // else          this.ctx.fillStyle = this.convertColor('rgba(180, 180, 180, ' + opacity + ')');
                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(180, 180, 180, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(100, 100, 100, ' + opacity + ')');

                rows = Math.floor((this.canvas.height * 2.7 / 4.0) + fontSize) + 5;
                for(const line of desc) {
                    this.ctx.fillText(line, descX + fontSize + this.getLeftMarginStage(), rows);
                    rows += fontSize + gap;
                }
                this.ctx.textAlign = "center";
            }
        }

        // 적용된 커맨드 모드 정보 출력
        this.renderCommands();
    }

    /**
     * 적용된 커맨드 정보 출력
     */
    renderCommands() {
        let label, idx, fontSize, rows, cols, gap;

        fontSize = this.convertFontSize(15);
        rows = this.metricSize2 * 1.5;
        cols = this.metricSize2 * 1.5;
        gap  = this.metricSize2;
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(180, 180, 180, 0.6)');
        else          this.ctx.fillStyle = this.convertColor('rgba(100, 100, 100, 0.6)');

        if(! ShuttingStarsUtility.checkEqualFloats(this.noteSpeedMultiplier, 1.0)) {
            label = '[X' + ShuttingStarsUtility.floor2(this.noteSpeedMultiplier) + ']';
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            this.ctx.textAlign = "left";
            this.ctx.fillText(label, this.convertX(cols), this.convertY(rows, false));
            cols += (this.metricSize2 * label.length) + gap;
        }

        //    게임오버 활성화
        if(! this.gameOverEnabled) {
            label = '[UNDEAD]';
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            this.ctx.textAlign = "left";
            this.ctx.fillText(label, this.convertX(cols), this.convertY(rows, false));
            cols += (this.metricSize2 * label.length) + gap;
        }

        //    커맨드 입력 진행 중 표시
        const numCommandInput = this.isCommandInputProgressing();
        if(numCommandInput >= 0) {
            label = '[';
            for(idx=numCommandInput+2; idx<this.commandInputs.length; idx++) {
                label += this.keyList[ this.commandInputs[idx] ];
            }
            if(this.commandInputs.length == 8) label += ']';
            else label += '|]';

            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            this.ctx.textAlign = "left";
            this.ctx.fillText(label, this.convertX(cols), this.convertY(rows, false));
            cols += (this.metricSize2 * label.length) + gap;
        }
    }

    /**
     * 화면 출력 - 최초 설정
     */
    renderFirstSet() {
        let idx;
        let rows = 0;
        let fontSize = this.convertFontSize(30);
        let opacity = 0.9;
        let gap = Math.floor(fontSize / 2.0);
        let label = '';
        let label2 = '';
        
        this.calculateFontMetric(true);

        gap = Math.floor(this.metricSize2 / 2.0);

        fontSize = this.convertFontSize(30);
        rows = this.convertY(this.getStageHeight() / 5, false);
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.strokeText('Shutting Stars', this.convertX(this.getStageWidth() / 2), rows);
        rows += (this.metricSize3 * 2) + gap;


        fontSize = this.convertFontSize(20);
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.trans('First Settings'), this.convertX(this.getStageWidth() / 2), rows);
        rows += (this.metricSize1 * 2) + gap;


        fontSize = this.convertFontSize(20);
        let firstSetMenuList = ['language', 'quality', 'confirm'];
        for(idx=0; idx<firstSetMenuList.length; idx++) {
            const settingOne = firstSetMenuList[idx];
            const choosen    = (this.firstSetMode == settingOne);

            label = '';
            label2 = '';

            if(settingOne == 'language') {
                label = this.trans('Language') + ' :\t';
                if(choosen) {
                    if(this.language == 'ko') {
                        label2 = 'English ◀[한글]▶';
                    } else {
                        this.language = 'en';
                        label2 = '◀[English]▶ 한글';
                    }
                } else {
                    if(this.language == 'ko') {
                    label2 = 'English [한글]';
                    } else {
                        this.language = 'en';
                        label2 = '[English] 한글';
                    }
                }
            } else if(settingOne == 'quality') {
                label = this.trans('Quality') + ' :\t';
                if(choosen) {
                    if(this.ressets.h <= 720) {
                        label2 = '◀[' + this.trans('LOW') + ']▶ ' + this.trans('MEDIUM');
                    } else {
                        this.ressets.w = 1920;
                        this.ressets.h = 1080;
                        label2 = this.trans('LOW') + ' ◀[' + this.trans('MEDIUM') + ']▶';
                    }
                } else {
                    if(this.ressets.h <= 720) {
                        label2 = '[' + this.trans('LOW') + '] ' + this.trans('MEDIUM');
                    } else {
                        this.ressets.w = 1920;
                        this.ressets.h = 1080;
                        label2 = this.trans('LOW') + ' [' + this.trans('MEDIUM') + ']';
                    }
                }
            } else {
                if(choosen) {
                    label = '[[' + this.trans('START') + ']]';
                } else {
                    label = this.trans('START');
                }
            }

            this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
            opacity = 0.8;
            if(choosen) opacity = 0.99;

            if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
            else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');

            if(settingOne == 'language' || settingOne == 'quality') {
                this.ctx.textAlign = "left";
                this.ctx.fillText(label, this.convertX(this.getStageWidth() * 3 / 8), rows);
                this.ctx.textAlign = "right";
                this.ctx.fillText(label2, this.convertX(this.getStageWidth() * 5 / 8), rows);
            } else {
                this.ctx.textAlign = "center";
                this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), rows);
            }

            rows += (this.metricSize1 * 2) + gap;
        }


        fontSize = this.convertFontSize(12);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        opacity = 0.9;
        label = this.trans('MOVE : ');
        for(idx=0; idx<this.arrowKeys.length; idx++) {
            let arrowKeyOne = this.arrowKeys[idx];
            let arrowKeyLabel = String(arrowKeyOne);
            if(     arrowKeyOne == 'ARROWUP'   ) arrowKeyLabel = '↑';
            else if(arrowKeyOne == 'ARROWDOWN' ) arrowKeyLabel = '↓';
            else if(arrowKeyOne == 'ARROWLEFT' ) arrowKeyLabel = '←';
            else if(arrowKeyOne == 'ARROWRIGHT') arrowKeyLabel = '→';
            else arrowKeyLabel = String(arrowKeyOne);

            label += arrowKeyLabel;
        }
        label += '    ' + this.trans('ACCEPT : ') + this.enterKey;

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), this.convertY((this.getStageHeight() * 9 / 10), false));
        rows += fontSize + gap;
    }

    /**
     * 화면 출력 - 설정 화면
     */
    renderSetting() {
        let idx;
        let rows = 0;
        let fontSize = this.convertFontSize(30);
        let opacity = 0.9;
        let gap = Math.floor(fontSize / 2.0);
        let label = '';

        this.calculateFontMetric();
        gap = Math.floor(this.metricSize2 / 2.0);

        if(this.settingChoosing == null) this.settingChoosing = this.settingList[0];

        rows = this.convertY(this.getStageHeight() / 5, false);

        fontSize = this.convertFontSize(30);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.strokeText(this.trans('Settings'), this.convertX(this.getStageWidth()/ 2), rows);
        rows += this.metricSize3 + gap;

        for(idx=0; idx<this.settingList.length; idx++) {
            let settingOne = this.settingList[idx];
            let choosen = (this.settingChoosing == settingOne);

            label = '';
            let leftSide = '';
            let rightSide = '';

            if(choosen && this.settingModifyingMode) { leftSide = '◀'; rightSide = '▶'; }

            if(settingOne == 'fixKeypressTiming'     ) label = this.trans('Key Press Delay') + ' - ' + leftSide + this.keypressTiming + rightSide;
            if(settingOne == 'fixSongTiming'         ) label = this.trans('Sound Delay'    ) + ' - ' + leftSide + this.songTiming + rightSide;
            if(settingOne == 'setNoteSpeedMultiplier') label = this.trans('Note Speed Rate') + ' - ' + leftSide + this.noteSpeedMultiplier + rightSide;
            if(settingOne == 'setGraphicQuality'     ) label = this.trans('Graphic Quality') + ' - ' + leftSide + this.settingGraphicQualityChoosing + rightSide;
            if(settingOne == 'resetAll') {
                label = this.trans('Reset ALL')
                if(this.settingResetReask) {
                    label += ShuttingStarsUtility.replaceString(this.trans(' - % key to reset all now !'), '%', this.enterKey);
                }
            }
            
            fontSize = this.convertFontSize(20);
            if(choosen) {
                this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
                if(this.settingModifyingMode) opacity = 0.99;
                else opacity = 0.8;

                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), rows);
            } else {
                this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
                opacity = 0.3;

                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), rows);
            }
            
            rows += this.metricSize1 + (gap*2);
        }

        fontSize = this.convertFontSize(30);
        rows += this.metricSize3 * 3;

        fontSize = this.convertFontSize(12);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        opacity = 0.9;
        label = this.trans('MOVE : ');
        for(idx=0; idx<this.arrowKeys.length; idx++) {
            let arrowKeyOne = this.arrowKeys[idx];
            let arrowKeyLabel = String(arrowKeyOne);
            if(     arrowKeyOne == 'ARROWUP'   ) arrowKeyLabel = '↑';
            else if(arrowKeyOne == 'ARROWDOWN' ) arrowKeyLabel = '↓';
            else if(arrowKeyOne == 'ARROWLEFT' ) arrowKeyLabel = '←';
            else if(arrowKeyOne == 'ARROWRIGHT') arrowKeyLabel = '→';
            else arrowKeyLabel = String(arrowKeyOne);

            label += arrowKeyLabel;
        }
        label += '    ' + this.trans('ACCEPT : ') + this.enterKey;

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), this.convertY((this.getStageHeight() * 9 / 10), false));
        rows += fontSize + gap;
    }

    /**
     * 화면 출력 - 곡 시작 직전 썸네일과 곡 제목 크게 뜨는 화면, 사용자는 아무것도 할 수 없으며, 시간이 지나면 자동으로 playing 상태로 전환되어 플레이가 시작됨
     */
    renderSongTitle() {
        const selfs = this;
        let songOne = this.song;
        let idx;
        let rows = 0;
        let fontSize = this.convertFontSize(20);
        let opacity = 0.9;
        let gap = Math.floor(fontSize / 2.0);
        let label = '';

        this.calculateFontMetric();
        gap = Math.floor(this.metricSize2 / 2.0);

        if(songOne == null || typeof(songOne) == 'undefined') { songOne = this.song; this.songChoosing = this.song; }
        if(songOne == null || typeof(songOne) == 'undefined') { this.song = null; this.songChoosing = null; this.setState('songchoosing'); this.resetStage(); return; }

        // Thumb 있으면 먼저 출력
        if(this.songThumb != null) {
            try { this.ctx.drawImage(this.songThumb, 0, 0, this.canvas.width, this.canvas.height); } catch(e) { console.error(e); }
        }

        // 곡 이름 출력
        label = songOne.name;
        fontSize = this.convertFontSize(30);
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = "center";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), this.convertY(this.getStageHeight() / 3, false));

        // 작곡가, 노트작성자, bpm 출력
        fontSize = this.convertFontSize(20);
        label = ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2, %3 BPM'), '%1', songOne.composer), '%2', songOne.noteWriter), '%3', String(songOne.bpm));
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        rows = this.convertY(this.getStageHeight(), false) - (this.metricSize2 * 2);
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(fontSize * 2), rows);

        // 난이도 표기
        label = String(this.difficulty.difficultyLevel);
        fontSize = this.convertFontSize(40);
        rows -= this.metricSize2 / 2;
        this.ctx.fillStyle = this.convertColor('rgba(' + this.difficultyNumberColor(this.difficulty.difficultyLevel) + ', 0.9)');
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.textAlign = "right";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() - (fontSize * 2)), rows);
    }

    /**
     * 화면 출력 - 플레이 종료 후 결과 화면
     */
    renderResult() {
        // 첫 줄
        let rows = 0;
        let rowCenter = 0;
        let fontSize = this.convertFontSize(30);
        let gap = Math.floor(fontSize / 2.0);
        let label = '';
        let defColor = null;

        this.calculateFontMetric();
        gap = Math.floor(this.metricSize2 / 2.0);

        if(this.dark) defColor = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          defColor = this.convertColor('rgba(80, 80, 80, 0.9)');

        // create 모드 출력
        if(this.createMode) {
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();    
            this.ctx.strokeStyle = defColor;
            this.ctx.textAlign = "right";
            this.ctx.strokeText(this.trans('CREATE MODE'), this.convertX(this.getStageWidth() - 10), this.convertY(30, false));
        }

        // 타이틀 출력
        rows = this.convertY(this.getStageHeight() / 6, false);
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.strokeStyle = defColor;
        this.ctx.textAlign = "center";
        this.ctx.strokeText(this.trans('PLAYING REPORT'), this.convertX(this.getStageWidth() / 2), rows);
        rows += (this.metricSize3 * 2) + (gap/2);

        // 판정별 숫자 출력
        fontSize = this.convertFontSize(20);
        label = 'PERFECT';
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeMarkColor(label) + ', 0.8)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.fillStyle = defColor;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( this.report.PERFECT , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rows += this.metricSize1 + (gap/4);

        label = 'GREAT';
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeMarkColor(label) + ', 0.8)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.fillStyle = defColor;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( this.report.GREAT , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rows += this.metricSize1 + (gap/4);

        label = 'GOOD';
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeMarkColor(label) + ', 0.8)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.fillStyle = defColor;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( this.report.GOOD , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rowCenter = rows; // 수직 중앙 위치 기록해두기 (랭크 출력할 때 사용)
        rows += this.metricSize1 + (gap/4);

        label = 'BAD';
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeMarkColor(label) + ', 0.8)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.fillStyle = defColor;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( this.report.BAD , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rows += this.metricSize1 + (gap/4);

        label = 'MISS';
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeMarkColor(label) + ', 0.8)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.fillStyle = defColor;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( this.report.MISS , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rows += this.metricSize1 + (gap/2);

        // 점수 출력
        label = ShuttingStarsUtility.fitDigit(this.point, 10);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(this.trans('TOTAL'), this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.textAlign = "right";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rows += this.metricSize1 + gap;

        // 랭크 출력
        this.ctx.font = 'bold ' + this.convertFontSize(100) + 'px ' + this.getRenderFontFamily();
        this.ctx.textAlign = "center";
        label = this.judgeResultRank();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeResultRankColor(label) + ', 0.9)');
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 7), rowCenter + (this.metricSize3 * 3 / 2));

        // 곡 이름 출력
        label = this.song.name;
        fontSize = this.convertFontSize(30);
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        rows = this.convertY(this.getStageHeight()) - ((this.metricSize3 * 3) + gap);

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(fontSize * 2), rows);

        // 작곡가, 노트작성자, bpm 출력
        fontSize = this.convertFontSize(20);
        rows = this.convertY(this.getStageHeight(), false) - ((fontSize * 2) + (gap * 2));
        label = ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2, %3 BPM'), '%1', this.song.composer), '%2', this.song.noteWriter), '%3', String(this.song.bpm));
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(fontSize * 2), rows);

        // 난이도 표기
        label = String(this.difficulty.difficultyLevel);
        fontSize = this.convertFontSize(40);
        rows -= this.convertFontSize(5);
        this.ctx.fillStyle = this.convertColor('rgba(' + this.difficultyNumberColor(this.difficulty.difficultyLevel) + ', 0.9)');
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.textAlign = "right";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() - (fontSize * 2)), rows);

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');

        // ESC 표기
        let escKeyLabel = this.escKey;
        if(this.escKey == 'ESCAPE') escKeyLabel = 'ESC';

        fontSize = this.convertFontSize(15);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.replaceString(this.trans("% key to continue..."), '%', escKeyLabel), this.convertX(this.getStageWidth() - (fontSize * 2)), rows + (this.metricSize2 + gap * 2));

        // 적용된 커맨드 모드 정보 출력
        this.renderCommands();
    }

    /**
     * 기록 목록 그리기
     */
    renderRecordList() {
        const selfs = this;
        let idx, ddx;
        let rows = 0;
        let cols = 0;
        let fontSize = this.convertFontSize(20);
        let opacity = 0.9;
        let gap = Math.floor(fontSize / 2.0);
        let divideCount = 2;
        let label = '';
        let lefts, rights;
        
        this.calculateFontMetric();
        gap = Math.floor(this.metricSize2 / 2.0);

        // 해상도 별 조치
        if(this.resolution.h <=  720) divideCount = 4; // 한 페이지 내에 출력 가능한 곡/미션 수를 조정하는 값 (현재 선택된 값 위에 이 갯수만큼만 있을 수 있음)

        // 최초 Y 좌표 계산
        rows = this.convertY(this.getStageHeight() / 5, false);

        // 기록 목록이 비어 있는 경우를 처리
        fontSize = this.convertFontSize(20);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        let emptyState = false;

        if(this.selectedRecordList == null) this.selectedRecordList = [];
        if(this.selectedRecordList.length <= 0) {
            this.ctx.strokeText(this.trans('No records !'), this.convertX(this.getStageWidth() / 2), rows);
            emptyState = true;
        }

        if(emptyState) {
            rows += this.metricSize1 + gap;

            // ESC 표기
            let escKeyLabel = this.escKey;
            if(this.escKey == 'ESCAPE') escKeyLabel = 'ESC';

            fontSize = this.convertFontSize(15);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            this.ctx.textAlign = "right";
            this.ctx.fillText(ShuttingStarsUtility.replaceString(this.trans("% key to continue..."), '%', escKeyLabel), this.convertX(this.getStageWidth()) - (fontSize * 2), this.convertY(this.getStageHeight(), false) - (this.metricSize2 * 2));

            if(this.selectRecordType == 'internet') {
                setTimeout(() => {
                    // 로컬 목록으로 되돌려야 하는데, 로컬 목록도 없으면, 메뉴로 이동
                    let lst = selfs.getRecords();
                    if(lst == null || lst.length <= 0) {
                        selfs.setState('menu');
                    } else {
                        selfs.selectRecordType = 'local';
                    }
                }, 4000);
            } else {
                setTimeout(() => {
                    // 인터넷 목록으로 바꿔야 하는데, 인터넷 목록도 비어 있으면 메뉴로 이동
                    selfs.getInternetRecords().then((list) => {
                        selfs.selectedRecordList = list;
                        if(list == null) selfs.setState('menu');
                        else selfs.selectRecordType = 'internet';
                    });
                }, 4000);
            }
            return;
        }

        // 타이틀 출력
        lefts  = '';
        rights = '';
        if(this.selectRecordType == 'internet' || this.backend != null) {
            lefts  = '◀ ';
            rights = ' ▶';
        }
        fontSize = this.convertFontSize(30);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        if(this.backend != null && this.backend.avail) {
            this.ctx.strokeText(lefts + this.trans('RECORD') + ' - ' + (this.selectRecordType == 'internet' ? this.trans('INTERNET') : this.trans('LOCAL')) + rights, this.convertX(this.getStageWidth() / 2), rows);
        } else {
            this.ctx.strokeText(lefts + this.trans('RECORD') + rights, this.convertX(this.getStageWidth() / 2), rows);
        }
        rows += this.metricSize3 + gap;
        

        // 기록을 선택하지 않은 상태인 경우 첫 기록을 출력
        if(this.seeingRecord == null) { this.seeingRecord = this.selectedRecordList[0]; }

        // 기록 목록을 다 출력할 수는 없으니, 현재 선택된 기록 앞뒤 2개만 출력
        //    현재 선택된 기록을 중앙에 두고, 앞 2개, 뒤 2개를 찾아야 함 (가능한 만큼만)
        let frontRecords = [];
        let backRecords = [];
        let recordChoosen = null;
        let current = false;
        for(idx=0; idx<this.selectedRecordList.length; idx++) {
            let songOne = this.selectedRecordList[idx];
            if(songOne == this.seeingRecord) {
                current = true; // 현재 선택된 곡, backRecords 에 넣기 (frontRecords 에 넣어도 문제는 없음)
                backRecords.push(songOne);
                continue;
            }
            if(! current) { // 아직 현재 선택된 곡을 만나기 이전 - 일단 frontRecords 에 넣고, 원소가 2개를 초과하면 먼저 넣은 것을 제거한다.
                frontRecords.push(songOne);
                if(frontRecords.length > 2) frontRecords.splice(0, 1);
            } else { // 현재 선택된 곡을 지남 - backRecords 에 넣고, 원소가 3개 (현재 선택된 곡이 포함되어 있으므로) 가 되면 반복문을 중지한다.
                backRecords.push(songOne);
                if(backRecords.length >= 3) break;
            }
        }

        // 하나의 배열로 병합
        let displayRecords = [];
        for(idx=0; idx<frontRecords.length; idx++) { displayRecords.push(frontRecords[idx]); }
        for(idx=0; idx<backRecords.length; idx++) { displayRecords.push(backRecords[idx]); }
        frontRecords = null;
        backRecords = null;

        let displayedSongs = 0;

        // 출력
        for(idx=0; idx<displayRecords.length; idx++) {
            let recordOne = displayRecords[idx];
            let choosen = (this.seeingRecord == recordOne);
            let upperY = 0;

            // 선택된 곡 배경색 출력
            if(choosen) {
                recordChoosen = recordOne;

                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');

                this.ctx.fillRect(0, rows - (this.metricSize1 + gap), this.canvas.width - (this.getLeftMarginStage() * 2), this.metricSize1 + (this.metricSize2 * 2) + gap*5);
            }

            // 곡 이름 출력
            opacity = 0.99;
            // if(choosen) opacity = 0.99;
            // else opacity = 0.3;

            fontSize = this.convertFontSize(20);
            label = recordOne.song.name;
            this.ctx.textAlign = "center";
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            if(choosen) {
                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), rows);
            } else {
                if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                this.ctx.strokeText(label, this.convertX(this.getStageWidth() / 2), rows);
            }
            upperY = rows - gap;
            rows += this.metricSize1 + gap;

            // 작곡가, 노트작성자, bpm 출력
            label = ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2, %3 BPM'), '%1', recordOne.song.composer), '%2', recordOne.song.noteWriter), '%3', String(recordOne.song.bpm));
            fontSize = this.convertFontSize(15);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();

            // if(this.songChoosing == recordOne) opacity = 0.99;
            // else opacity = 0.3;

            this.ctx.textAlign = "center";
            if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
            else          this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
            if(choosen) {
                this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), rows);
            } else {
                if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                this.ctx.strokeText(label, this.convertX(this.getStageWidth() / 2), rows);
            }
            rows += this.metricSize2 + gap;

            // 점수 출력
            fontSize = this.convertFontSize(20);
            this.ctx.textAlign = "left";
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            label = String(recordOne.point);
            this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), rows);

            // 랭크 출력
            fontSize = this.convertFontSize(80);
            this.ctx.textAlign = "center";
            this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
            label = recordOne.rank;
            this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeResultRankColor(label) + ', ' + opacity + ')');
            this.ctx.fillText(label, this.convertX(this.getStageWidth() * 9 / 10), upperY + this.metricSize3 + (gap * 2));

            rows += this.metricSize2 + (gap*2);
            displayedSongs++;
        }

        // 빈 공간 띄우기
        while(displayedSongs < 5) {
            rows += this.metricSize3 + gap*2;
            displayedSongs++;
        }

        // 기타 안내 출력
        fontSize = this.convertFontSize(12);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        opacity = 0.9;
        label = this.trans('MOVE : ');
        for(idx=0; idx<this.arrowKeys.length; idx++) {
            let arrowKeyOne = this.arrowKeys[idx];
            let arrowKeyLabel = String(arrowKeyOne);
            if(arrowKeyOne == 'ARROWUP') arrowKeyLabel = '↑';
            else if(arrowKeyOne == 'ARROWDOWN') arrowKeyLabel = '↓';
            else if(arrowKeyOne == 'ARROWLEFT') arrowKeyLabel = '←';
            else if(arrowKeyOne == 'ARROWRIGHT') arrowKeyLabel = '→';
            else arrowKeyLabel = String(arrowKeyOne);

            label += arrowKeyLabel;
        }
        label += '    ' + this.trans('ACCEPT : ') + this.enterKey + '      ' + this.trans('BACK : ');
        if(this.escKey == 'ESCAPE') label += 'ESC';
        else                        label += this.escKey;

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 10), this.convertY(this.getStageHeight() - (this.metricSize2 * 1.5), false));
    }

    /**
     * 기록 조회 그리기
     */
    renderRecordResult() {
        // 첫 줄
        let rows = 0;
        let rowCenter = 0;
        let fontSize = this.convertFontSize(30);
        let gap = Math.floor(fontSize / 2.0);
        let label = '';
        let defColor = null;

        this.calculateFontMetric();
        gap = Math.floor(this.metricSize2 / 2.0);

        if(this.dark) defColor = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          defColor = this.convertColor('rgba(80, 80, 80, 0.9)');

        // 타이틀 출력
        rows = this.convertY(this.getStageHeight() / 6, false);
        fontSize = this.convertFontSize(30);
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.strokeStyle = defColor;
        this.ctx.textAlign = "center";
        this.ctx.strokeText(this.trans('PLAYING REPORT'), this.convertX(this.getStageWidth() / 2), rows);
        rows += this.metricSize3 + (gap/2);

        // 판정별 숫자 출력
        fontSize = this.convertFontSize(20);
        label = 'PERFECT';
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeMarkColor(label) + ', 0.8)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.fillStyle = defColor;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( this.report.PERFECT , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rows += this.metricSize1 + (gap/4);

        label = 'GREAT';
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeMarkColor(label) + ', 0.8)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.fillStyle = defColor;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( this.report.GREAT , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rows += this.metricSize1 + (gap/4);

        label = 'GOOD';
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeMarkColor(label) + ', 0.8)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.fillStyle = defColor;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( this.report.GOOD , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rowCenter = rows; // 수직 중앙 위치 기록해두기 (랭크 출력할 때 사용)
        rows += this.metricSize1 + (gap/4);

        label = 'BAD';
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeMarkColor(label) + ', 0.8)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.fillStyle = defColor;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( this.report.BAD , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rows += this.metricSize1 + (gap/4);

        label = 'MISS';
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeMarkColor(label) + ', 0.8)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.fillStyle = defColor;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( this.report.MISS , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rows += this.metricSize1 + (gap/2);

        // 점수 출력
        label = ShuttingStarsUtility.fitDigit(this.point, 10);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(this.trans('TOTAL'), this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.textAlign = "right";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rows += this.metricSize1 + gap;

        // 랭크 출력
        this.ctx.font = 'bold ' + this.convertFontSize(100) + 'px ' + this.getRenderFontFamily();
        this.ctx.textAlign = "center";
        label = this.judgeResultRank(this.seeingRecord);
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeResultRankColor(label) + ', 0.9)');
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 7), rowCenter + (this.metricSize3 * 3 / 2));

        // 곡 이름 출력
        label = this.seeingRecord.song.name;
        fontSize = this.convertFontSize(30);
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        rows = this.convertY(this.getStageHeight(), false) - ((this.metricSize3 * 3) + gap);

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(fontSize * 2), rows);

        // 작곡가, 노트작성자, bpm 출력
        fontSize = this.convertFontSize(20);
        rows = this.convertY(this.getStageHeight()) - ((fontSize * 2) + (gap * 2));
        label = ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2, %3 BPM'), '%1', this.seeingRecord.song.composer), '%2', this.seeingRecord.song.noteWriter), '%3', String(this.seeingRecord.song.bpm));
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(fontSize * 2), rows);

        // 난이도 표기
        label = String(this.seeingRecord.level);
        fontSize = this.convertFontSize(40);
        rows -= this.convertFontSize(5);
        this.ctx.fillStyle = this.convertColor('rgba(' + this.difficultyNumberColor(this.seeingRecord.level) + ', 0.9)');
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.textAlign = "right";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() - (fontSize * 2)), rows);

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');

        // ESC 표기
        let escKeyLabel = this.escKey;
        if(this.escKey == 'ESCAPE') escKeyLabel = 'ESC';

        fontSize = this.convertFontSize(15);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.replaceString(this.trans("% key to continue..."), '%', escKeyLabel), this.convertX(this.getStageWidth() - (fontSize * 2)), this.convertY(this.getStageHeight() - (fontSize), false));
    }

    /**
     * HP 표시 수단 (즉 행성) 그리기
     */
    renderHpBar() {
        let arr = this.calculateHpColor();
        let r, g, b;
        r = arr[0];
        g = arr[1];
        b = arr[2];
        
        const hpBarInsideColor = this.convertColor('rgba(' + r + ', ' + g + ', ' + b + ', 0.8)');

        // HP바 (행성형) 출력
        if(this.notePlacers.length >= 1) {
            let x      = Math.round((this.notePlacers[0].x + this.notePlacers[this.notePlacers.length-1].x) / 2.0);
            let radius = Math.round((this.notePlacers[this.notePlacers.length-1].x - this.notePlacers[0].x) / 2.0) * 8;
            let y      = this.getHpBarYLocation() - radius;
            
            this.ctx.beginPath();
            this.ctx.fillStyle = hpBarInsideColor;
            // this.ctx.arc(this.convertX(x), this.convertY(y), this.convertX(radius), 0, 2 * Math.PI);
            ShuttingStarsUtility.drawGradientedArc(this.ctx, this.convertX(x), this.convertY(y), this.convertX(radius), r, g, b, 0.8, 7);
            this.ctx.fill();
        }
        
        /*
        // 기존 바형 HP바
        const hpBarMaxWidth = this.notePlacers[this.notePlacers.length - 1].x + this.notePlacers[this.notePlacers.length - 1].r - this.notePlacers[0].x + this.notePlacers[0].r;
        const hpBarHeight = this.getHpBarHeight();
        const hpBarBorderColor = this.convertColor('rgba(200, 200, 200, 0.5)');
        let   hpBarInsideColor = String(hpBarBorderColor);

        // HP바 (직선형)
        // 현재 HP (최대 100) 에 따라 HP바 길이 결정
        let hpBarWidth = 0;
        if(this.hp > 0) {
            hpBarWidth = hpBarMaxWidth * (this.hp / 100);
        }

        //    HP바를 화면 상단에 출력
        this.ctx.strokeStyle = hpBarBorderColor;
        this.ctx.strokeRect(this.convertX(this.notePlacers[0].x - this.notePlacers[0].r), this.convertY(this.getHpBarYLocation()), this.convertX(hpBarMaxWidth), this.convertY(hpBarHeight));

        //    HP바 내부를 채우기
        this.ctx.fillStyle = hpBarInsideColor;
        this.ctx.fillRect(this.convertX(this.notePlacers[0].x - this.notePlacers[0].r), this.convertY(this.getHpBarYLocation()), this.convertX(hpBarWidth), this.convertY(hpBarHeight));
        */
    }

    /**
     * 렌더링 디버그 모드에서, 디버깅 용 객체 출력
     */
    renderDebug() {
        for(const obj of this.objectsPlaying) {
            if(typeof(obj.draw)  == 'function' ) continue;
            if(typeof(obj.type)  == 'undefined') continue;
            if(typeof(obj.color) == 'undefined') continue;
            if(typeof(obj.x)     == 'undefined') continue;
            if(typeof(obj.y)     == 'undefined') continue;

            try {
                this.ctx.fillStyle = obj.color;
                if(obj.type == 'rect') {
                    this.ctx.fillRect(obj.x, obj.y, obj.r, obj.h);
                } else if(obj.type == 'circle') {
                    this.ctx.beginPath();
                    this.ctx.arc(obj.x, obj.y, obj.r, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            } catch(e) {
                console.error(e);
            }
        }
    }

    /**
     * 2D 좌표계 디버그
     */
    renderCoordinate2dDebug() {
        this.ctx.strokeStyle = 'blue';
        this.ctx.fillStyle = 'green';
        this.ctx.lineWidth = 5;
        this.ctx.font = 'normal 18px ' + this.getRenderFontFamily();
        let idx, jdx;
        
        for(idx=0; idx<this.getFullRenderWidth(); idx += 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.convertX(idx), this.convertY(0));
            this.ctx.lineTo(this.convertX(idx), this.convertY(this.getFullRenderHeight()));
            this.ctx.stroke();
        }
        
        for(jdx=0; jdx<this.getFullRenderHeight(); jdx += 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.convertX(0), this.convertY(jdx));
            this.ctx.lineTo(this.convertX(this.getFullRenderWidth()), this.convertY(jdx));
            this.ctx.stroke();
        }

        for(idx=0; idx<this.getFullRenderWidth(); idx += 100) {
            for(jdx=0; jdx<this.getFullRenderHeight(); jdx += 100) {
                this.ctx.fillText(idx + ',' + jdx, this.convertX(idx), this.convertY(jdx));
            }
        }

        // canvas 경계선에도 선 긋기
        this.ctx.lineWidth = 8;
        this.ctx.strokeStyle = 'red';
        this.ctx.beginPath();
        this.ctx.moveTo(this.convertX(0), this.convertY(0));
        this.ctx.lineTo(this.convertX(0), this.convertY(this.getStageHeight()));
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(this.convertX(0), this.convertY(0));
        this.ctx.lineTo(this.convertX(this.getStageWidth()), this.convertY(0));
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(this.convertX(0), this.convertY(this.getStageHeight()));
        this.ctx.lineTo(this.convertX(this.getStageWidth()), this.convertY(this.getStageHeight()));
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(this.convertX(this.getStageWidth()), this.convertY(0));
        this.ctx.lineTo(this.convertX(this.getStageWidth()), this.convertY(this.getStageHeight()));
        this.ctx.stroke();
    }   

    /**
     * 오디오 시각화 그리기
     */
    renderAudioVisualizing() {
        if(this.audioBuffer == null || this.audioBufferLen == 0) return;
        this.audioAnalyser.getByteFrequencyData(this.audioBuffer);

        if(this.ss3d != null && (! this.disable3d)) {
            this.ss3d.soundVisualizing(this, this.audioAnalyser, this.audioBuffer);
            if(this.use3d.visualization) return;
            if(this.disable2d) return;
        }

        if(this.vizualizer2d != null) this.vizualizer2d.draw(this.ctx, this.canvas.width, this.canvas.height, this.audioBuffer, this.audioBufferLen, this.elapsedTime, this.gameOverDelayed ? 0 : this.hp);
    }

    /**
     * 크레딧 그리기
     */
    renderCredit() {
        let idx;
        let displays = 0;
        let rows = 0;
        let opacity = 0.9;
        let fontSize = 0;
        let label = '';
        
        rows = this.convertFontSize(30);
        rows = rows - Math.floor( rows * ( this.creditIndexIncreases * 1.0 / this.creditIndexIncreaseMax ));

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";

        // 현재 출력 차례부터 처리
        for(idx=this.creditIndex; idx<this.creditContents.length; idx++) {
            const nows = this.creditContents[idx];

            fontSize = this.convertFontSize(nows.fontSize);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            this.ctx.fillText(nows.label, this.convertX(this.getStageWidth() / 2), this.convertY(rows, false));
            rows += fontSize;
            
            displays++;
        }

        // 다시 위로 돌아가 남은 차례 처리
        for(idx=0; idx<this.creditContents.length; idx++) { // 루프 전체 출력 - 어짜피 넘치는 영역은 숨겨지므로
            const nows = this.creditContents[idx];

            fontSize = this.convertFontSize(nows.fontSize);
            this.ctx.font = 'normal ' + this.convertFontSize(nows.fontSize) + 'px ' + this.getRenderFontFamily();
            this.ctx.fillText(nows.label, this.convertX(this.getStageWidth() / 2), this.convertY(rows, false));
            rows += fontSize;
            
            displays++;
        }
    }

    /**
     * Confirm (예/아니오) 창 그리기
     */
    renderConfirmBlock() {
        if(! this.confirmAsking) return;

        // 무조건 화면 중앙에 띄우기
        let row = (this.getStageHeight() / 2) - this.metricSize3;
        let gap = this.metricSize2;
        let gap2 = 0;
        if(this.ressets.h > 720) gap2 = this.metricSize3;

        // 전체크기 DIM 배경 사각형 그리기
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.7)');
        else          this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.7)');
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 메시지 사각형 그리기
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.99)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.99)');
        this.ctx.fillRect(0, this.convertY(row - this.metricSize3 - gap, false), this.convertX(this.getStageWidth()), ((this.metricSize3 * 3) + (gap * 2 + gap2)));

        // 메시지 그리기
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        this.ctx.font = 'normal ' + this.convertFontSize(30) + 'px ' + this.getRenderFontFamily();
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.confirmMessage, this.convertX(this.getStageWidth() / 2), this.convertY(row, false));
        row += this.metricSize3 + gap;

        // 예 / 아니오 그리기
        this.ctx.font = 'normal ' + this.convertFontSize(20) + 'px ' + this.getRenderFontFamily();
        if(this.confirmChoosingYes) {
            this.ctx.fillText('◀[' + this.trans('YES') + ']▶    ' + this.trans('NO'), this.convertX(this.getStageWidth() / 2), this.convertY(row, false));
        } else {
            this.ctx.fillText(this.trans('YES') + '    ◀[' + this.trans('NO') + ']▶', this.convertX(this.getStageWidth() / 2), this.convertY(row, false));
        }
    }

    /**
     * 커맨드 준비
     */
    prepareCommands() {
        const selfs = this;
        this.commands = [];
        this.commands.push({
            command : [0, 1, 2, 3, 4, 5],
            act : function() {
                if(selfs.noteSpeedMultiplier < 1) selfs.noteSpeedMultiplier = Math.floor(selfs.noteSpeedMultiplier * 2.0);
                else selfs.noteSpeedMultiplier = Math.floor(selfs.noteSpeedMultiplier + 1);
                selfs.saveSettings();
            }
        });
        this.commands.push({
            command : [5, 4, 3, 2, 1, 0],
            act : function() {
                if(selfs.noteSpeedMultiplier >= 2) selfs.noteSpeedMultiplier = Math.floor(selfs.noteSpeedMultiplier - 1);
                else selfs.noteSpeedMultiplier = Math.floor(selfs.noteSpeedMultiplier / 2.0);
                selfs.saveSettings();
            }
        });
        this.commands.push({
            command : [0, 1, 0, 1, 0, 1],
            act : function() {
                selfs.gameOverEnabled = (! selfs.gameOverEnabled);
            }
        });
    }

    /**
     * 커맨드 입력 처리 (곡 선택 화면에서 플레이 키 (sdfjkl) 입력 시 이 메소드가 호출됨)
     * @param {string} key 입력 또는 해제된 키
     */
    handleCommand(key) {
        let idx;
        let keyNo = -1;
        for(idx=0; idx<this.keyList.length; idx++) {
            if(key == this.keyList[idx]) {
                keyNo = idx;
                break;
            }
        }
        if(keyNo < 0) return;

        // 커맨드는 sk (양끝 플레이 키) 로 시작하고, 뒤 6자리는 각 커맨드에 따라 다름. 총 8자리로 구성

        this.commandInputs.push(keyNo);
        if(this.commandInputs.length > 8) this.commandInputs.splice(0, 1); // 8자리 넘어가면 맨 뒤의 값 제거
        if(this.commandInputs[0] != 0 || this.commandInputs[1] != 5) return; // 맨앞은 s, 그뒤에 k, 그 뒤에 커맨드가 나와야 함. 그게 되지 않으면 무효

        for(idx=0; idx<this.commands.length; idx++) {
            const commandOne = this.commands[idx];
            let equals = true;

            for(let jdx=0; jdx<commandOne.command.length; jdx++) {
                const commandKeyNoOne = commandOne.command[jdx];
                if(this.commandInputs.length < jdx + 2) {          equals = false; break; }
                if(this.commandInputs[jdx+2] != commandKeyNoOne) { equals = false; break; }
            }

            if(equals) {
                this.playSE('special1');
                commandOne.act();
                this.commandInputs = [];
                break;
            }
        }
    }

    /**
     * 커맨드 입력 중인지 탐지, 입력 중인 경우 입력 시작 위치 반환, 입력 중이지 않으면 -1 반환
     * @returns {number} 커맨드 입력 시작 위치. 입력 중이 아니면 -1
     */
    isCommandInputProgressing() {
        if(this.state != 'songchoosing') return -1; // 곡 선택 화면에서만 커맨드 입력 가능
        let idx;
        let sInputAlready = true;

        // 위치 상관없이 sk 입력 탐지 (단, sk는 연속으로 입력된 상태여야 함)
        for(idx=0; idx<this.commandInputs.length; idx++) {
            if(this.commandInputs[idx] == 0) { sInputAlready = true; continue; }
            if(sInputAlready) {
                if(this.commandInputs[idx] == 0) { continue; }
                else if(this.commandInputs[idx] == 5) { return idx - 1; } // s 시작 위치를 반환해야 하므로 뒷자리 번호를 반환
                else sInputAlready = false;
            }
        }

        return -1;
    }

    /**
     * 랭크 탐지
     * @param {Object} record record 값
     * @returns {string} 처리 결과
     */
    judgeResultRank(record) {
        let count, percents;
        if(record) {
            if(! record.clear) return 'F';
        
            // Note 갯수 체크
            count = record.notes;

            // P/S 등급 처리
            if(record.report.PERFECT == count) return 'P';
            if((record.report.PERFECT + record.report.GREAT) >= 1 && record.report.MISS <= 0) return 'S';

            // Perfect + Great 비율 체크
            percents = ((record.report.PERFECT + record.report.GREAT) * 100.0) / count;
            // 기타 등급 처리
            if(percents >=  5.0) return 'A';
            if(percents >= 10.0) return 'B';
            if(percents >= 30.0) return 'C';

            return 'D';
        }

        if(this.gameOverDelayed) return 'F';
        
        // Note 갯수 체크
        let diff = this.song.difficulties[ this.difficulty.index ];
        count = diff.patterns.length;

        // P/S 등급 처리
        if(this.report.PERFECT == count) return 'P';
        if((this.report.PERFECT + this.report.GREAT) >= 1 && this.report.MISS <= 0) return 'S';

        // Perfect + Great 비율 체크
        percents = ((this.report.PERFECT + this.report.GREAT) * 100.0) / count;
        // 기타 등급 처리
        if(percents >=  5.0) return 'A';
        if(percents >= 10.0) return 'B';
        if(percents >= 30.0) return 'C';

        return 'D';
    }

    /**
     * 랭크 컬러 반환 (rgb 파트만 반환, 예: 255, 255, 255)
     * @param {string} resultRankChar resultRankChar 값
     * @returns {string} 처리 결과
     */
    judgeResultRankColor(resultRankChar) {
        if(resultRankChar == 'P') return '255, 215, 0';
        if(resultRankChar == 'S') return '255, 215, 0';
        if(resultRankChar == 'A') return '192, 192, 192';
        if(resultRankChar == 'B') return '204, 114, 61';
        if(resultRankChar == 'C') return '47, 157, 39';
        if(resultRankChar == 'D') return '128, 65, 217';
        return '153, 0, 76';
    }

    /**
     * 판정 별 컬러 반환 (rgb 파트만 반환, 예: 255, 255, 255)
     * @param {string} judgeResult judgeResult 값
     * @returns {string} 처리 결과
     */
    judgeMarkColor(judgeResult) {
        if(     judgeResult == 'MISS'   ) return '230, 40, 40';
        else if(judgeResult == 'BAD'    ) return '102, 37, 0';
        else if(judgeResult == 'GOOD'   ) return '47, 157, 39';
        else if(judgeResult == 'GREAT'  ) return '103, 153, 250';
        else if(judgeResult == 'PERFECT') return '255, 215, 0';
        return '230, 40, 40';
    }

    /**
     * 난이도 표시 컬러 반환 (rgb 파트만 반환, 예: 255, 255, 255)
     * @param {number} difficultyNumber difficultyNumber 값
     * @returns {string} 처리 결과
     */
    difficultyNumberColor(difficultyNumber) {
        if(difficultyNumber <= 2) {
            return '159, 201, 60';
        } else if(difficultyNumber <= 3) {
            return '159, 201, 60';
        } else if(difficultyNumber == 4) {
            return '107, 153, 0';
        } else if(difficultyNumber <= 6) {
            return '153, 112, 0';
        } else if(difficultyNumber == 7) {
            return '153, 56, 0';
        } else if(difficultyNumber == 8) {
            return '102, 37, 0';
        } else {
            return '230, 40, 40';
        }
    }

    /**
     * HP 표시 컬러 계산 (r, g, b 순서대로 0~255 숫자값이 담긴 배열 반환)
     * @returns {Array<number>} 빨강, 초록, 파랑 성분 배열
     */
    calculateHpColor() {
        let   changes = 0;
        let   r, g, b;

        // HP 잔여에 따른 컬러 변경
        if(this.gameOverDelayed) {
            r = 140;
            g = 30;
            b = 30;
        } if(this.hp >= 80) {
            changes = 100 - ((this.hp - 80) * 5.0); // 100 ~ 80 을 20 ~ 0 으로 변환 후 5를 곱해 100 ~ 0 백분율로 변환
            // HP가 감소함에 따라 따라 80, 250, 80 --> 180, 230, 80 으로 변화

            r = 80 + Math.round(100 * (changes / 100.0));
            if(r >= 180) r = 180;

            g = 250 - Math.round(20 * (changes / 100.0));
            if(g < 230) g = 230;

            b = 80; // 변화 없음
        } else if(this.hp >= 60) {
            changes = 100 - ((this.hp - 60) * 5.0); // 80 ~ 60 을 20 ~ 0 으로 변환 후 5를 곱해 100 ~ 0 백분율로 변환
            // HP가 감소함에 따라 180, 230, 80 --> 230, 180, 80 으로 변화

            r = 180 + Math.round(50 * (changes / 100.0));
            if(r >= 230) r = 230;

            g = 230 - Math.round(50 * (changes / 100.0));
            if(g < 180) g = 180;

            b = 80; // 변화 없음
        } else if(this.hp >= 40) {
            changes = 100 - ((this.hp - 40) * 5.0); // 60 ~ 40 을 20 ~ 0 으로 변환 후 5를 곱해 100 ~ 0 백분율로 변환
            // HP가 감소함에 따라 230, 180, 80 --> 230, 80, 80 으로 변화

            r = 230; // 변화 없음

            g = 180 - Math.round(100 * (changes / 100.0));
            if(g < 80) g = 80;

            b = 80; // 변화 없음
        } else if(this.hp >= 20) {
            changes = 100 - ((this.hp - 20) * 5.0); // 40 ~ 20 을 20 ~ 0 으로 변환 후 5를 곱해 100 ~ 0 백분율로 변환
            // HP가 감소함에 따라 230, 80, 80 --> 200, 40, 40 으로 변화

            r = 230 - Math.round(30 * (changes / 100.0));
            if(g < 200) g = 200;

            g = 80 - Math.round(40 * (changes / 100.0));
            if(g < 40) g = 40;

            b = 80 - Math.round(40 * (changes / 100.0));
            if(b < 40) b = 40;
        } else {
            changes = 100 - (this.hp * 5.0); // 20 ~ 0 을 5를 곱해 100 ~ 0 백분율로 변환
            // HP가 감소함에 따라 200, 40, 40 --> 40, 20, 20 으로 변화

            r = 200 - Math.round(160 * (changes / 100.0));
            if(r < 40) r = 40;

            g = 40 - Math.round(20 * (changes / 100.0));
            if(g < 20) g = 20;

            b = 40 - Math.round(20 * (changes / 100.0));
            if(b < 20) b = 20;
        }
        let arr = [];
        arr.push(Math.floor(r));
        arr.push(Math.floor(g));
        arr.push(Math.floor(b));
        return arr;
    }

    /**
     * 공통 동시처리 프로세스 (init 에서 호출)
     * @param {number} simultaneousWorkCycle simultaneousWorkCycle 값
     */
    simultaneousWork(simultaneousWorkCycle) {
        try {
            let idx, jdx;
            let notePlacer;
            let calculates, additionals;
            
            this.simultaneousTime++;
            if(this.simultaneousTime >= 99999999) this.simultaneousTime = 0;

            if(this.audio != null && (! this.audio.paused) && (! this.audio.ended)) {
                this.elapsedTime = (this.audio.currentTime * (this.song.bpm / 60.0) * (this.timeMultiplier * this.elapsedTimeMultiplier)) - this.songTiming;
            }
            if(this.titleDelayTime >= 1) this.titleDelayTime--;

            // 노트 위치 처리
            if(this.state == 'playing' && this.elapsedTime >= 0 && this.playPrepared && this.song != null) {
                for(idx=0; idx<this.objectsPlaying.length; idx++) {
                    const obj = this.objectsPlaying[idx];
                    if(obj instanceof Note) {
                        // 폭발 중이거나 제거 처리된 노트는 제외
                        if(obj.removed || obj.explosing >= 1) continue;

                        // 노트에 해당하는 NotePlacer 찾기
                        notePlacer = this.getNotePlacer(obj.locationIndex);
                        if(notePlacer == null) continue;

                        // 노트의 실질 위치 계산
                        calculates = notePlacer.y; // 일단 NotePlacer 위치부터 시작

                        // NotePlacer에 도달하기까지 남은 시간 만큼 멀리 지정 (이미 시간이 지난 경우 음수가 나올 수 있음)
                        additionals  = ( (obj.originalTiming * this.song.noteMultiplier) - this.elapsedTime );
                        additionals += (this.noteLocationConst + this.song.timeConstant);
                        additionals  = additionals * this.getNoteRadius() * this.noteSpeedMultiplier * this.noteSpeedFixedConst * this.song.timeMultiplier;
                        calculates  += additionals;

                        // 이전 위치 기록
                        if(obj.tail) {
                            obj.beforeLocations.push({x : obj.x, y : obj.y});
                            if(obj.beforeLocations.length > obj.beforeLocationCountMax) obj.beforeLocations.splice(0, 1);
                        }

                        // 위치 적용
                        obj.y = calculates;
                    }
                }
            }

            // CreateMode 인 경우 이미 폭발한 노트도 다시 살리기 (곡 플레이 진행시간을 조절할 수 있기 때문)
            if(this.createMode) {
                for(idx=0; idx<this.objectsPlaying.length; idx++) {
                    const obj = this.objectsPlaying[idx];    
                    if(obj instanceof Note) {
                        if(obj.hidden) {
                            if(this.elapsedTime + this.timeMultiplier <= obj.originalTiming) {
                                obj.explosing = 0;
                                obj.removed = false;
                                obj.hidden = false;
                            }
                        }
                    }
                }
            }

            // 폭발 완료 처리
            for(idx=0; idx<this.objectsPlaying.length; idx++) {
                const obj = this.objectsPlaying[idx];
                if(obj instanceof Note) {
                    if(obj.explosing >= obj.explosingMax) {
                        this.removed = true;
                        this.hidden  = true;
                    }
                } else if(obj instanceof NotePlacer) {
                    if(obj.explosing >= obj.explosingMax) obj.explosing = 0;
                } else if(obj instanceof JudgeMark) {
                    if(obj.explosing >= obj.explosingMax) {
                        this.objectsPlaying.splice(idx, 1);
                        idx--;
                    }
                }
            }

            // 기타 폭발 / 장식 오브젝트도 처리
            for(idx=0; idx<this.objects.length; idx++) {
                const obj = this.objects[idx];
                if(typeof(obj.explosing) == 'number') {
                    if(typeof(obj.explosingMax) == 'number') {
                        if(obj.explosing >= obj.explosingMax) {
                            if(obj instanceof VirtualKey) {
                                obj.explosing = 0;
                            } else {
                                this.objects.splice(idx, 1);
                                idx--;
                                continue;
                            }
                        }
                    }

                    if(obj.explosing >= 1) obj.explosing++;
                }

                if(obj instanceof Starlight) {
                    if(obj.x < (this.getFullRenderWidth() * (-3)) || obj.y < this.getFullRenderHeight() * (-3) || obj.x > this.getFullRenderWidth() * 1.1 || obj.y > this.getFullRenderHeight() * 1.1) {
                        this.objects.splice(idx, 1);
                        idx--;
                        continue;
                    }

                    // 이전 위치 기록
                    if(obj.tail) {
                        obj.beforeLocations.push({x : obj.x, y : obj.y});
                        if(obj.beforeLocations.length > obj.beforeLocationCountMax) obj.beforeLocations.splice(0, 1);
                    }

                    // 위치 적용
                    obj.x += obj.speedX;
                    obj.y += obj.speedY;
                }
            }

            // Starlight 갯수 유지
            this.remainStarlightCounts();

            // 배경음악 페이드 인/아웃 처리
            if(this.audioBackgroundPlaying && this.volumeBackgroundSpeed != 0) {
                this.volumeBackground += this.volumeBackgroundSpeed;
                if(this.volumeBackground < 0) this.volumeBackground = 0;
                if(this.volumeBackground > this.volumeBackgroundDefault) this.volumeBackground = this.volumeBackgroundDefault;
                this.audioBackground.volume = this.volume * this.volumeBackground * this.volumeMultiplier;
                if(this.volumeBackground <= 0) {
                    this.audioBackground.pause();
                    this.audioBackgroundPlaying = false;
                }
            }

            // 곡 준비 중 남은 시간 처리
            if(this.state == 'songtitle') {
                if(this.songTitleTime > 0) this.songTitleTime--;
                if(this.songTitleTime <= 0) {
                    this.setState('playing');
                    return;
                }
            }

            // 게임 오버 출력완료 여부 처리
            if(this.state == 'gameover') {
                if(this.gameoverTime > 0) this.gameoverTime--;
                if(this.gameoverTime <= 0) {
                    this.onSongEnd();
                    return;
                }
            }

            // Credit 처리
            if(this.state == 'credit') {
                if(this.simultaneousTime % 2 == 0) this.creditIndexIncreases++;
                if(this.creditIndexIncreases >= this.creditIndexIncreaseMax) { this.creditIndex++; this.creditIndexIncreases = 0; }
                if(this.creditIndex < 0) this.creditIndex = 0;
                if(this.creditIndex >= this.creditContents.length) this.creditIndex = 0;
            }

            // 재개 대기 타이밍 처리, NoteKeyObject 처리중 애니메이션 재생 진행상황 증가
            if(! this.paused) {
                // 재개 타이밍 처리
                if(this.resumingTime >= 1) {
                    this.resumingTime--;
                    if(this.resumingTime <= 0) this.resumed = true;
                    else                       this.resumed = false;
                    return;
                }

                // NoteKeyObject 처리중 애니메이션 재생 진행상황 증가
                for(idx=0; idx<this.objectsPlaying.length; idx++) {
                    const obj = this.objectsPlaying[idx];
                    if(obj instanceof NoteKeyObject) {
                        if(obj.explosing >= 1 && obj.explosing < obj.explosingMax) {
                            if(simultaneousWorkCycle % 4 == 0) obj.explosing += obj.explosingSpeed;
                        }
                    } else if(obj instanceof JudgeMark) {
                        if(obj.explosing < obj.explosingMax) {
                            if(simultaneousWorkCycle % 4 == 0) obj.explosing += obj.explosingSpeed;
                        }
                    }
                }
            }

            // create 모드
            if(this.createMode) {
                if(this.state == 'playing') {
                    for(idx=0; idx<this.notePlacers.length; idx++) {
                        let notePlacerOne = this.notePlacers[idx];
                        for(jdx=0; jdx<this.objectsPlaying.length; jdx++) {
                            let objOne = this.objectsPlaying[jdx];
                            if(objOne instanceof Note) {
                                if(objOne.removed) continue;
                                if(notePlacerOne.y + 5 >= objOne.y && notePlacerOne.y - 5 <= objOne.y && notePlacerOne.isConflicted(objOne)) {
                                    this.handleNotePlacerCalled(notePlacerOne);
                                }
                            }
                        }
                    }
                }
            }
        } catch(e) {
            console.error(e);
            ShuttingStarsUtility.toast('ERROR : ' + e);
            if(this.state == 'playing') this.onGameOver();
        }
    }

    /**
     * 곡 동시처리 프로세스 - 시간 진행 (calculateSongBitGap(곡의bpm) 주기마다 1회 호출)
     */
    timeElapse() {
        try {
            if(this.paused) return;
            if(this.resumingTime >= 1) return;

            if(this.resumed) {
                if(this.audio    != null) { this.audio.play(); }
                if(this.videoBga != null) {
                    if(this.videoBgaUrl != null) { try { this.videoBga.play(); } catch(e) { console.error(e); } }
                }
                this.resumed = false;
            }

            const song = this.song;
            let idx;
            if(song == null) { this.setState('menu'); return; } // 곡이 선정되지 않은 경우 시간 진행 없음
            if(this.difficulty == null || typeof(this.difficulty) == 'undefined') { this.setState('menu'); return; } // 곡 내 난이도가 선정되지 않은 경우 시간 진행 없음
            if(this.state != 'playing') return; // 곡이 재생 중이 아닌 경우 시간 진행 없음

            if(this.audio != null && (! this.audio.paused) && (! this.audio.ended)) {
                this.elapsedTime = (this.audio.currentTime * (this.song.bpm / 60.0) * (this.timeMultiplier * this.elapsedTimeMultiplier)) - this.songTiming;
            } else {
                this.elapsedTime++;
            }
            this.elapsedTimeOld++;

            /*
            // 노트 디버깅
            for(idx=0; idx<this.objectsPlaying.length; idx++) { 
                const obj = this.objectsPlaying[idx];
                if(! (obj instanceof Note)) continue;
                if(obj.debugTarget) { console.log( ShuttingStarsUtility.floor2( this.elapsedTime ) + '\t' + ShuttingStarsUtility.floor2( obj.originalTiming ) + '\t' + ShuttingStarsUtility.floor2( obj.y ) ); }
            }
            */
            
            /*
            // 노트 생성 프로세스 비활성화 - 이제 노트를 패턴 시간에 맞게 생성하지 않고 미리 쫙 생성한 다음 시간대에 맞춰 위치를 조정함

            // 현재 시간에 해당하는 패턴이 있는지 확인
            let diff = song.difficulties[ this.difficulty.index ];
            let patterns = diff.patterns;

            for(idx=0; idx<patterns.length; idx++) {
                const pattern = patterns[idx];
                if(this.checkEqualFloats((pattern.time * song.timeMultiplier) + this.songBitGap + song.timeConstant, this.elapsedTime * 1.0)) {
                    // 패턴이 존재하는 경우, 해당 패턴에 따라 Note 생성
                    //     locationIndex 값이 음수인 경우 랜덤 부여
                    if(pattern.locationIndex < 0) {
                        pattern.locationIndex = Math.floor(ShuttingStarsUtility.random() * this.notePlacers.length);
                    }
                    //     노트 생성
                    const note = new Note(pattern.locationIndex);
                    note.id = this.lastObjectId++;
                    this.objectsPlaying.push(note); // 패턴 추가
                }
            }
        */

            // 현재 시간에 해당하는 등장 장식이 있는지 확인
            let decos = song.decorations;
            for(idx=0; idx<decos.length; idx++) {
                const decoOne = decos[idx];
                if(typeof(decoOne.time) != 'number') continue;
                if(typeof(decoOne.type) == 'undefined') continue;
                if(this.checkEqualFloats((decoOne.time * song.timeMultiplier) + this.songBitGap + song.timeConstant, this.elapsedTime * 1.0)) {
                    this.addDecoration(decoOne);
                }
            }

            // 이미 지나가버린 패턴 체크
            for(idx=0; idx<this.objectsPlaying.length; idx++) {
                const obj = this.objectsPlaying[idx];
                if((obj instanceof Note) && (obj.y <= this.getHpBarYLocation() - 1 )) {
                    if(obj.explosing == 0) {
                        // 미스 처리
                        let resultMark = 'MISS';
                        this.processResultMark(resultMark);
                        this.displayResultMark(resultMark);
                        obj.removed = true;
                        obj.missed = true;

                        // 폭발 시작
                        obj.explosing = 1;

                        // 추가 폭발 객체 추가
                        const newExplosinves = new FailExplosing(obj.locationIndex, obj.y, '255, 0, 0', '255, 0, 0');
                        this.objects.push(newExplosinves);
                    }
                }
            }

            // 곡의 끝 체크
            //     곡의 명시된 종료시간과 마지막 패턴의 시간 비교해 더 큰 값 선택
            let lastPatternTime = this.songLastPatternTime + this.noteLocationConst;
            if(this.song != null) lastPatternTime = lastPatternTime * this.song.noteMultiplier + this.song.timeConstant;
            let calcRealEndTime = song.endTime + this.noteLocationConst;
            if(this.song != null) calcRealEndTime = calcRealEndTime * this.song.noteMultiplier + this.song.timeConstant;
            if(calcRealEndTime > lastPatternTime + 4) {
                lastPatternTime = calcRealEndTime;
            }
            // 곡의 끝에 다다랐는지 확인 (단, 게임오버 출력 시에는 제외)
            if(this.elapsedTime > lastPatternTime && (! (this.gameOverEnabled && this.gameOverDelayed))) {
                this.clearTimeHandler();

                if(this.audio != null) {
                    try { this.audio.pause();  } catch(ex) { console.error(ex); } // 오디오 끄기
                    try { this.audio.remove(); } catch(ex) { console.error(ex); } 
                    this.audio = null;
                }

                if(this.videoBga != null) {
                    if(this.videoBgaUrl != null) {
                        try { this.videoBga.pause(); } catch(ex) { console.error(ex); } // BGA 끄기
                        this.videoBgaUrl = null;
                    }
                }

                this.onSongEnd(); // 종료
                return;
            }

            // hp 체크 (0 미만이면 게임 오버 처리)
            if(this.hp <= 0) {
                this.gameOverDelayed = true;
                if(this.gameOverEnabled) {
                    this.clearTimeHandler();
                    this.onGameOver();
                    return;
                }
            }
            
            // 스테이지에 남아있는 노트 이동은 하지 않음 - 이제 노트를 패턴 시간에 맞게 생성하지 않고 미리 쫙 생성한 다음 시간대에 맞춰 위치를 조정함
            /*
            for(idx=0; idx<this.objectsPlaying.length; idx++) {
                const obj = this.objectsPlaying[idx];
                if(obj instanceof Note) {
                    if(obj.removed) continue;
                    if(obj.explosing >= 1) continue; // 폭발 중인 Note 는 이동하지 않음
                    obj.y -= obj.speedY;
                    if(obj.y < 0) obj.y = 0;

                    // if(obj.id == 9) console.log('N9 ' + obj.y + ' S ' + obj.speedY);
                }
            }
            */
        } catch(e) {
            console.error(e);
            ShuttingStarsUtility.toast('ERROR : ' + e);
            if(this.state == 'playing') this.onGameOver();
        }
    }

    /**
     * 곡 동시처리 프로세스 종료 (시작하려면 곡 선택 후 resetStage 가 호출되어야 함)
     */
    clearTimeHandler() {
        if(this.timeProgressKey != null) {
            if(typeof(this.timeProgressKey) == 'function') {
                this.timeProgressKey();
            } else {
                clearInterval(this.timeProgressKey);
            }
            this.timeProgressKey = null;
        }
        if(this.workerSongPlaying != null) {
            try { this.workerSongPlaying.terminate(); } catch(e) { console.error(e); }
            this.workerSongPlaying = null;
        }
    }

    /**
     * [미사용] 노트 속도 (Deprecated - 더 이상 이 방식을 쓰지 않음)
     * @returns {number} 프레임당 노트 이동 거리
     */
    getNoteMoveSpeed() {
        // 설정값에 따른 속도 반환
        // 노트들이 곡의 bpm 에 맞는 타이밍마다 이 메소드의 리턴값 만큼 이동함 (이미 bpm 이 반영되어 있음)
        return ((this.getNoteRadius() * 2.0) * this.noteSpeedMultiplier * this.noteSpeedFixedConst) / (this.timeMultiplier / 8.0);
    }

    /**
     * 노트 생성 위치 (이제는 곡 플레이 초기화 시 다 만들어놓고 위치를 매번 갱신하므로, 초기화할 때 만드는 위치로만 사용함)
     * @returns {number} 노트가 생성될 Y 좌표
     */
    getNoteCreationYLocation() {
        return this.getNotePlacerYLocation() + (this.getNoteRadius() * 2 * this.stageRows * this.noteSpeedMultiplier * this.noteSpeedFixedConst * ((this.timeMultiplier * this.elapsedTimeMultiplier) / 8.0) );
    }

    /**
     * 판정선 위치
     * @returns {number} 노트 판정선의 Y 좌표
     */
    getNotePlacerYLocation() {
        return (this.getNoteRadius() * 4) + this.getTopMarginNote();
    }

    /**
     * HP바 Y좌표
     * @returns {number} 처리 결과
     */
    getHpBarYLocation() {
        return 15;
    }

    /**
     * 폭발 중인 Note 폭발속도 가속
     */
    accelerateExplosingNotes() {
        const notes = this.getNotes();
        for(let idx=0; idx<notes.length; idx++) {
            let noteOne = notes[idx];
            if(noteOne.explosing >= 1 && noteOne.explosing < noteOne.explosingMax) {
                noteOne.explosing++;
                noteOne.explosingSpeed++;
            }
        }
    }

    /**
     * 폭발 중인 JudgeMark 폭발속도 가속
     */
    accelerateExplosingJudgeMarks() {
        for(let idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if(obj instanceof JudgeMark) {
                if(obj.explosing < obj.explosingMax) {
                    obj.explosing++;
                    obj.explosingSpeed += 2;
                }
            }
        }
    }

    /**
     * 게임 오버 판정 시 호출
     */
    onGameOver() {
        // 전 노트 및 NotePlacer 폭발 조치
        for(let idx=0; idx<this.objectsPlaying.length; idx++) {
            let obj = this.objectsPlaying[idx];
            if(typeof(obj.explosing) == 'number') {
                if(obj.explosing <= 0) obj.explosing = 1;
            }
        }

        // HP 0 처리
        this.hp = 0;
        this.gameOverDelayed = true;

        // 거대 폭발 객체 생성
        const bigExp = new PlanetExplosing(0, 0, '180, 0, 0', '250, 80, 80');
        bigExp.x = Math.round((this.notePlacers[0].x + this.notePlacers[this.notePlacers.length-1].x) / 2.0);
        bigExp.y = this.getHpBarYLocation();
        bigExp.r = 64;
        bigExp.explosing = 1;
        this.objects.push(bigExp);

        // 폭발 가속
        this.accelerateExplosingNotes();
        this.accelerateExplosingJudgeMarks();

        // 게임오버 상태로 변경
        this.gameoverTime = 16 * _shuttingstarcore.timeMultiplier;
        this.setState('gameover');
        this.paused = false;
    }

    /**
     * 곡 플레이 종료 시 호출
     */
    onSongEnd() {
        this.setState('result');
        this.paused = false;
        this.stopAudio();
        this.audio = null;
        this.songThumb = null;
        this.videoBgaUrl = null; // TODO
        this.playPrepared = false;

        // Note 갯수 체크
        let diff = this.song.difficulties[ this.difficulty.index ];
        let count = diff.patterns.length;
        let rank = this.judgeResultRank();

        if(! this.createMode) {
            // Credit 반영
            this.reportSaved.PERFECT  += this.report.PERFECT;
            this.reportSaved.GREAT    += this.report.GREAT;
            this.reportSaved.GOOD     += this.report.GOOD;
            this.reportSaved.BAD      += this.report.BAD;
            this.reportSaved.MISS     += this.report.MISS;
            this.reportSaved.maxCombo += this.maxCombo;
            this.reportSaved.playCount++;
            this.antiMatterCredit += ( this.reportSaved.maxCombo ) * Math.floor(((this.hp >= 1 ? 4 : 1) * (3 + diff.difficultyLevel)) / 4.0);
            this.saveCredit();

            // 기록 남기기
            this.addRecords({
                date : new Date().getTime(),
                mode : this.mode,
                song : { serial : this.song.serial, name : this.song.name, composer : this.song.composer, noteWriter : this.song.noteWriter, bpm : this.song.bpm },
                difficulty : this.difficulty.difficultyLabel,
                level : this.difficulty.difficultyLevel,
                point : this.point,
                report : this.report,
                notes : count,
                combo : this.maxCombo,
                rank : rank,
                hp : this.hp,
                gameover : this.gameOverDelayed,
                clear : (this.hp >= 1 && (! this.gameOverDelayed)),
                notehistory : [],
                build : this.build,
                userAgent : window.navigator.userAgent
            });
        }
        
        // 3D 매니저 이벤트 호출
        if(this.ss3d != null) {
            this.ss3d.onSongEnd(this);
        }
    }

    /**
     * 곡 재생 종료
     */
    stopAudio() {
        if(this.audio != null) {
            try { this.audio.pause();  } catch(e) { console.error(e); }
            try { this.audio.remove(); } catch(e) { console.error(e); }
            this.audio = null;
        }
        this.closeAudioSources();

        // BGA도 종료
        if(this.videoBga != null) {
            if(this.videoBgaUrl != null) {
                try { this.videoBga.pause(); } catch(ex) {  console.error(ex); } // BGA 끄기
                this.videoBgaUrl = null;
            }
        }
    }

    /**
     * 오디오 관련 리소스 닫기 (예외 발생해도 무시)
     */
    closeAudioSources() {
        if(this.audioSource   != null) { try { this.audioSource.disconnect();   this.audioSource   = null; } catch(exIn) { console.log('Error on closing audio source. You can ignore them.'); console.log(exIn); } }
        if(this.audioAnalyser != null) { try { this.audioAnalyser.disconnect(); this.audioAnalyser = null; } catch(exIn) { console.log('Error on closing audio source. You can ignore them.'); console.log(exIn); } }
        if(this.audioCtx      != null) { try { this.audioCtx.close();           this.audioCtx      = null; } catch(exIn) { console.log('Error on closing audio source. You can ignore them.'); console.log(exIn); } }
    }

    /**
     * 현재 로드된 노트들 반환
     * @returns {Array<Note>} 현재 플레이 객체에 포함된 노트 목록
     */
    getNotes() {
        let arr = [];
        for(let idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if(obj instanceof Note) {
                arr.push(obj);
            }
        }
        return arr;
    }

    /**
     * 현재 등록된 노트 판정 객체 목록을 반환합니다.
     * @returns {Array<NotePlacer>} 노트 판정 객체 목록
     */
    getNotePlacers() {
        let arr = [];
        for(let idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if(obj instanceof NotePlacer) {
                arr.push(obj);
            }
        }
        return arr;
    }

    /**
     * 지정한 레인의 노트 판정 객체를 반환합니다.
     * @param {number} locationIndex 노트 레인의 인덱스
     * @returns {NotePlacer|null} 해당 레인의 판정 객체
     */
    getNotePlacer(locationIndex) {
        for(let idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if(obj instanceof NotePlacer) {
                if(obj.locationIndex === locationIndex) {
                    return obj;
                }
            }
        }
        return null;
    }

    /**
     * 고유 일련번호와 일치하는 첫 번째 3D 객체를 찾습니다.
     * @param {number} uniqueSerial uniqueSerial 값
     * @returns {ShuttingStars3DObject|null} 일치하는 첫 번째 3D 객체
     */
    find3DObject(uniqueSerial) {
        for(let idx=0; idx<this.object3ds.length; idx++) {
            const obj = this.object3ds[idx];
            if(obj.uniqueSerial === uniqueSerial) {
                return obj;
            }
        }
        return null;
    }

    /**
     * 고유 일련번호와 일치하는 모든 3D 객체를 찾습니다.
     * @param {number} uniqueSerial uniqueSerial 값
     * @returns {Array<ShuttingStars3DObject>} 일치하는 3D 객체 목록
     */
    find3DObjects(uniqueSerial) {
        let arr = [];
        for(let idx=0; idx<this.object3ds.length; idx++) {
            const obj = this.object3ds[idx];
            if(obj.uniqueSerial === uniqueSerial) {
                arr.push(obj);
            }
        }
        return arr;
    }

    /**
     * 스테이지의 왼쪽 여백을 반환합니다.
     * @returns {number} 스테이지 왼쪽 여백
     */
    getLeftMarginStage() {
        return this.margins.stage.left;
    }

    /**
     * 스테이지의 위쪽 여백을 반환합니다.
     * @returns {number} 스테이지 위쪽 여백
     */
    getTopMarginStage() {
        return this.margins.stage.top;
    }

    /**
     * 노트 영역의 왼쪽 여백을 반환합니다.
     * @returns {number} 노트 영역 왼쪽 여백
     */
    getLeftMarginNote() {
        return this.margins.note.left;
    }

    /**
     * 노트 영역의 위쪽 여백을 반환합니다.
     * @returns {number} 노트 영역 위쪽 여백
     */
    getTopMarginNote() {
        return this.margins.note.top;
    }

    /**
     * 페이지의 왼쪽 여백을 반환합니다.
     * @returns {number} 페이지 왼쪽 여백
     */
    getLeftMarginPage() {
        return this.margins.page.left;
    }

    /**
     * 페이지의 위쪽 여백을 반환합니다.
     * @returns {number} 페이지 위쪽 여백
     */
    getTopMarginPage() {
        return this.margins.page.top;
    }

    /**
     * 게임 스테이지 너비를 반환합니다.
     * @returns {number} 게임 스테이지 너비
     */
    getStageWidth() {
        return this.stageSize.w - this.getLeftMarginStage();
    }

    /**
     * 게임 스테이지 높이를 반환합니다.
     * @returns {number} 게임 스테이지 높이
     */
    getStageHeight() {
        return this.stageSize.h - this.getTopMarginStage()
    }

    /**
     * 전체 렌더링 영역 너비 반환
     * @returns {number} 전체 렌더링 영역 너비
     */
    getFullRenderWidth() {
        return this.realStageSize.w - this.getLeftMarginStage();
    }

    /**
     * 전체 렌더링 영역 높이 반환
     * @returns {number} 전체 렌더링 영역 높이
     */
    getFullRenderHeight() {
        return this.realStageSize.h - this.getTopMarginStage();
    }

    /**
     * 3D 매니저 (ShuttingStars3DManager 객체) 입력
     * @param {ShuttingStars3DManager|null} ss3d ss3d 값
     */
    set3DManager(ss3d) {
        const selfs = this;
        let ss3dworked = false;
        if(ss3d == null) { this.ss3d = null; return; }
        if(ss3d instanceof ShuttingStars3DManager) {
            this.ss3d = ss3d; this.ss3d.init(this.canvas3d, this);
            if(this.usingWorker) {
                this.workerRender = new Worker( this.convertURL('/resources/js/shuttingstarworker.js') );
                this.workerRender.postMessage({interval : this.frameTime * 2});
                this.workerRender.onmessage = function(e) {
                    if(selfs.ss3d != null && selfs.canvas3d != null && (! selfs.disable3d)) { selfs.ss3d.render(selfs.canvas3d, selfs.object3ds); }
                }

                this.workerRender = new Worker( this.convertURL('/resources/js/shuttingstarworker.js') );
                this.workerRender.postMessage({interval : this.frameTime});
                this.workerRender.onmessage = function(e) {
                    if(selfs.ss3d != null) { 
                        if(selfs.disable3d) {  
                            if(ss3dworked) {
                                selfs.ss3d.clear();
                                ss3dworked = false;
                            }
                        } else { ss3dworked = true; selfs.ss3d.simultaneousJob(selfs); }
                    }
                }
            } else {
                ShuttingStarsUtility.repeat(() => {
                    if(selfs.ss3d != null && selfs.canvas3d != null && (! selfs.disable3d)) { selfs.ss3d.render(selfs.canvas3d, selfs.object3ds); }
                }, this.frameTime * 2);

                ShuttingStarsUtility.repeat(() => {
                    if(selfs.ss3d != null) { 
                        if(selfs.disable3d) {  
                            if(ss3dworked) {
                                selfs.ss3d.clear();
                                ss3dworked = false;
                            }
                        } else { ss3dworked = true; selfs.ss3d.simultaneousJob(selfs); }
                    }
                }, this.frameTime);
            }
        }
        else throw 'Only for ShuttingStars3DManager type !';
    }

    /**
     * 곡에 포함되어 있던 장식 추가문구 해석해 집행
     * @param {Object} decoJson decoJson 값
     */
    addDecoration(decoJson) {
        let obj = null;
        let type = String(decoJson.type).toLowerCase();

        if(type == 'explosion') {
            obj = new ExplosingObject(0, 0, '255, 255, 255', '255, 255, 255');
            obj.x = decoJson.x;
            obj.y = decoJson.y;
            obj.r = decoJson.r;
            obj.explosing = 1;
        } else if(type == 'star' || type == 'starlight') {
            obj = new Starlight();
            obj.x = decoJson.x;
            obj.y = decoJson.y;
            obj.r = decoJson.r;
            obj.speedX = 1;
            obj.speedY = 0;
        } else if(type == 'text') {
            obj = new TextDeco(decoJson.text, decoJson.x, decoJson.y, decoJson.fontSize, decoJson.align, decoJson.color);
            if(decoJson.explosingMax) obj.explosingMax = decoJson.explosingMax;
        }
        if(obj != null) this.objects.push(obj);
    }

    /**
     * Credit 목록 그리기
     */
    prepareCreditList() {
        this.creditContents = [];
        this.creditIndex = 0;

        for(let idx=0; idx<5; idx++) {
            this.creditContents.push({ label : '', fontSize : 30 });
        }

        this.creditContents.push({ label : 'Shutting Stars', fontSize : 30 });
        this.creditContents.push({ label : this.trans('Made by HJOW'), fontSize : 15 });
        this.creditContents.push({ label : '', fontSize : 30 });

        this.creditContents.push({ label : 'LICENSE', fontSize : 25 });
        this.creditContents.push({ label : '', fontSize : 15 });
        this.creditContents.push({ label : 'Copyright 2026 HJOW (hujinone22@naver.com)', fontSize : 15 });
        this.creditContents.push({ label : ShuttingStarsUtility.replaceString(this.trans('Visit % for detail...'), '%', 'https://shuttingstars-3eddf.web.app/license.html'), fontSize : 15 });
        
        for(let idx=0; idx<3; idx++) {
            this.creditContents.push({ label : '', fontSize : 30 });
        }

        this.creditContents.push({ label : 'Songs', fontSize : 30 });
        this.creditContents.push({ label : '', fontSize : 30 });

        for(let idx=0; idx<this.songDisplays.length; idx++) {
            const songOne = this.songDisplays[idx];
            
            this.creditContents.push({ label : songOne.name, fontSize : 25 });
            this.creditContents.push({ label : ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2'), '%1', songOne.composer), '%2', songOne.noteWriter), fontSize : 15 });
            this.creditContents.push({ label : '', fontSize : 25 });
        }

        for(let idx=0; idx<3; idx++) {
            this.creditContents.push({ label : '', fontSize : 30 });
        }

        this.creditContents.push({ label : 'Third Parties', fontSize : 30 });
        this.creditContents.push({ label : '', fontSize : 30 });

        this.creditContents.push({ label : 'jQuery (Only for Create Mode)', fontSize : 25 });
        this.creditContents.push({ label : 'Projects referencing this document are released under the terms of the MIT license.', fontSize : 15 });
        this.creditContents.push({ label : 'https://jquery.com/license/', fontSize : 15 });
        this.creditContents.push({ label : '', fontSize : 25 });

        this.creditContents.push({ label : 'Three.js', fontSize : 25 });
        this.creditContents.push({ label : 'The MIT License - Copyright © 2010-2026 three.js authors', fontSize : 15 });
        this.creditContents.push({ label : 'https://github.com/mrdoob/three.js/blob/dev/LICENSE', fontSize : 15 });
        this.creditContents.push({ label : '', fontSize : 25 });

        this.creditContents.push({ label : 'Crypto-JS', fontSize : 25 });
        this.creditContents.push({ label : 'The MIT License', fontSize : 15 });
        this.creditContents.push({ label : 'Copyright (c) 2009-2013 Jeff Mott', fontSize : 15 });
        this.creditContents.push({ label : 'Copyright (c) 2013-2016 Evan Vosberg', fontSize : 15 });
        this.creditContents.push({ label : 'https://github.com/brix/crypto-js/blob/develop/LICENSE', fontSize : 15 });
        this.creditContents.push({ label : '', fontSize : 25 });

        this.creditContents.push({ label : 'Pure CSS', fontSize : 25 });
        this.creditContents.push({ label : 'The BSD License - Copyright 2013 Yahoo! Inc.', fontSize : 15 });
        this.creditContents.push({ label : 'https://github.com/pure-css/pure/blob/main/LICENSE', fontSize : 15 });
        this.creditContents.push({ label : '', fontSize : 25 });

        this.creditContents.push({ label : '나눔고딕, 나눔명조, 나눔고딕코딩, D2Coding', fontSize : 25 });
        this.creditContents.push({ label : 'SIL Open Font License, Version 1.1.', fontSize : 15 });
        this.creditContents.push({ label : 'https://help.naver.com/service/30016/contents/18088?osType=PC&lang=ko', fontSize : 15 });
        this.creditContents.push({ label : '', fontSize : 25 });

        for(let idx=0; idx<3; idx++) {
            this.creditContents.push({ label : '', fontSize : 30 });
        }

        let escKeyLabel = this.escKey;
        if(this.escKey == 'ESCAPE') escKeyLabel = 'ESC';
        this.creditContents.push({ label : ShuttingStarsUtility.replaceString(this.trans('% key to continue...'), '%', escKeyLabel), fontSize : 15 });

        for(let idx=0; idx<3; idx++) {
            this.creditContents.push({ label : '', fontSize : 30 });
        }
    }

    /**
     * 팝업 화면 구현 (캔버스에 그리지 않고, 별도 div에 출력)
     */
    renderPopupDiv() {
        const selfs = this;
        const popRoot = this.pops.root;
        popRoot.innerHTML = `
            <div class='shuttingstars_pop_dim invisible'></div>
            <div class='shuttingstars_pop_content shuttingstars_canvas_config invisible'></div>  
            <div class='shuttingstars_pop_content pop_login invisible'></div>

            <div class='shuttingstars_pop_dim2 invisible'></div>
            <div class='shuttingstars_pop_content shuttingstars_pop_content2 pop_conf invisible'></div>
        `;

        let popInside = popRoot.querySelector('.shuttingstars_pop_dim');
        this.pops.dim = popInside;

        popInside = popRoot.querySelector('.pop_login');
        let htmls = '';
        htmls = `
            <table class='table_login_form full'>
                <colgroup>
                    <col style='width: 10rem;'/>
                    <col/>
                </colgroup>
                <tbody>
                    <tr>
                        <td colspan='2' style='text-align: right;'><button type='button' class='target_translate btn btn_login_cancel red' style='font-size: 0.9rem; padding-left: 0.9rem; padding-right: 0.9rem; padding-top: 0.1rem; padding-bottom: 0.1rem;'>X</button></td>
                    </tr>
                    <tr>
                        <td colspan='2' style='text-align: center; height: 180px; vertical-align: middle;'>
                            <button class="gsi-material-button btn_login">
                                <div class="gsi-material-button-state"></div>
                                <div class="gsi-material-button-content-wrapper">
                                    <div class="gsi-material-button-icon">
                                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;">
                                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                            <path fill="none" d="M0 0h48v48H0z"></path>
                                        </svg>
                                    </div>
                                    <span class="gsi-material-button-contents">Continue with Google</span>
                                    <span style="display: none;">Continue with Google</span>
                                </div>
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td colspan='2' style='text-align: center; vertical-align: middle;'>
                            <a href='privacy.html' target='_blank' class='a_privacy target_translate' style='font-size: 0.8rem;'>Privacy Policy</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
        popInside.innerHTML = htmls;
        this.pops.login = popInside;

        const fLoadAddiContent = async function(rowOne) {
            if(rowOne.uid != selfs.user.uid) return;
            if(rowOne.type == 'song') {
                let resp = await fetch(rowOne.url);
                resp.contentname = rowOne.contentname;
                selfs.addSong(resp);
            }
        }

        const fAfter2 = function() {
            selfs.getMenuList().then((menuList) => {
                selfs.menuListDynamic = menuList;
                selfs.backend.getAdditionalContents().then((resp) => {
                    if(resp.success) {
                        const list = resp.list;
                        for(const rowOne in list) {
                            fLoadAddiContent(rowOne);
                        }
                    }
                });
                // selfs.backend.requestPushPermission();
            });
        };

        const fAfter1 = function(respJson) {
            const success = respJson.success;
            const user    = respJson.userJson;
            if(! success) {
                selfs.toast(selfs.trans('Login failed.'));
            } else {
                localStorage.setItem('shuttingstar_session', JSON.stringify(user));
            }

            selfs.keyEventDisabled = false;
            selfs.pops.login.classList.add('invisible');
            selfs.pops.dim.classList.add('invisible');

            fAfter2();
            if(selfs.backend.authStateChangedEvents) selfs.backend.authStateChangedEvents.push(fAfter2);
        }

        const fLogin = function() {
            if(selfs.backend.usingGoogleLogin) {
                selfs.backend.openGoogleLogin().then((respJson) => {
                    fAfter1(respJson);
                });
            }
        }

        let btn;
        btn = popInside.querySelector('.btn_login');
        btn.addEventListener('click', fLogin);

        btn = popInside.querySelector('.btn_login_cancel');
        btn.addEventListener('click', () => {
            selfs.keyEventDisabled = false;
            selfs.pops.login.classList.add('invisible');
            selfs.pops.dim.classList.add('invisible');
        });

        // 스트링 테이블 번역 적용
        this.pops.root.querySelectorAll('.target_translate').forEach((itemOne) => {
            itemOne.innerHTML = selfs.trans(itemOne.innerHTML);
        });
    }

    /**
     * 상세 설정화면 구현 (캔버스에 그리지 않고, 별도 div에 출력) renderPopupDiv 보다 나중에 호출되어야 함
     */
    renderConfigDiv() {
        if(this.configDiv == null) return;
        const selfs = this;

        // 상세설정 영역 HTML 준비
        let html = `
            <div class='shuttingstar_configlayer'>
                <div class='shuttingstar_config_tabbuttons'>
                    <button type='button' class='btn tab active target_translate' data-tabarea='.shuttingstar_configsections'>Configuration</button>
                    <button type='button' class='btn tab        target_translate' data-tabarea='.shuttingstar_songssections'>Custom Songs</button>
                    <button type='button' class='btn tab        target_translate' data-tabarea='.shuttingstar_packagessections'>Packages</button>
                    <button type='button' class='btn tab        target_translate' data-tabarea='.shuttingstar_toolssections'>Tools</button>
                </div>
                <div class='shuttingstar_configsections tabarea active'>
                    <h1 class='target_translate'>Configuration</h1>
                    <div class='shuttingstar_config_inner'>
                        <table class='shuttingstar_configtable full'>
                            <caption style='display: none;'>Configuration</caption>
                            <colgroup>
                                <col style='width: 25rem;'/>
                                <col/>
                            </colgroup>
                            <tbody>
                                <tr>
                                    <th class='target_translate'>Key Press Delay</th>
                                    <td><input type='number' class='inp inp_keypressdelay full' step='1' min='0' max='9999'/></td>
                                </tr>
                                <tr>
                                    <th class='target_translate'>Sound Delay</th>
                                    <td><input type='number' class='inp inp_sounddelay full' step='1' min='0' max='9999'/></td>
                                </tr>
                                <tr>
                                    <th class='target_translate'>Note Speed Rate</th>
                                    <td><input type='number' class='inp inp_notespeedrate full' step='0.1' min='1.0' max='8.0'/></td>
                                </tr>
                                <tr>
                                    <th class='target_translate'>Graphic Quality</th>
                                    <td><select class='sel sel_graphicquality full'></select></td>
                                </tr>
                                <tr>
                                    <th class='target_translate'>Language</th>
                                    <td><select class='sel sel_language full'></select></td>
                                </tr>
                                <tr>
                                    <th class='target_translate'>Line Keys</th>
                                    <td>
                                        <span style='margin-left: 20px;'><span style='margin-right:1rem;'>1</span><input type='text' class='inp inp_linekey inp_linekey_1' maxlength='1' style='width:4rem; text-align: center;'/></span>
                                        <span style='margin-left: 20px;'><span style='margin-right:1rem;'>2</span><input type='text' class='inp inp_linekey inp_linekey_2' maxlength='1' style='width:4rem; text-align: center;'/></span>
                                        <span style='margin-left: 20px;'><span style='margin-right:1rem;'>3</span><input type='text' class='inp inp_linekey inp_linekey_3' maxlength='1' style='width:4rem; text-align: center;'/></span>
                                        <span style='margin-left: 20px;'><span style='margin-right:1rem;'>4</span><input type='text' class='inp inp_linekey inp_linekey_4' maxlength='1' style='width:4rem; text-align: center;'/></span>
                                        <span style='margin-left: 20px;'><span style='margin-right:1rem;'>5</span><input type='text' class='inp inp_linekey inp_linekey_5' maxlength='1' style='width:4rem; text-align: center;'/></span>
                                        <span style='margin-left: 20px;'><span style='margin-right:1rem;'>6</span><input type='text' class='inp inp_linekey inp_linekey_6' maxlength='1' style='width:4rem; text-align: center;'/></span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class='shuttingstar_configcontrols'>
                        <button type='button' class='btn btn_config_accept target_translate'>Accept</button>
                        <button type='button' class='btn btn_config_cancel target_translate red'>Cancel</button>
                        
                        <button type='button' class='btn btn_config_resetall target_translate' style='margin-left: 30px;'>Reset All</button>
                    </div>
                </div>
                <div class='shuttingstar_songssections tabarea'>
                    <h1 class='target_translate'>Custom Songs</h1>
                    <textarea class='full ta_json_song'></textarea>
                    <div class='shuttingstar_songcontrols'>
                        <button type='button' class='btn btn_song_accept target_translate'>Save</button>
                        <button type='button' class='btn btn_song_cancel target_translate red'>Cancel</button>
                    </div>
                </div>
                <div class='shuttingstar_packagessections tabarea'>
                    <h1 class='target_translate'>Packages</h1>
                    <textarea class='full ta_packages'># Caution ! Lines start with '#' will be ignored.
# Add package URLs here. Enter one URL per line.
</textarea>
                    <div class='shuttingstar_packagescontrols'>
                        <button type='button' class='btn btn_packages_accept target_translate'>Save</button>
                        <button type='button' class='btn btn_packages_cancel target_translate red'>Cancel</button>
                    </div>
                </div>
                <div class='shuttingstar_toolssections tabarea'>
                    <h1 class='target_translate'>Tools</h1>
                    <div class='shuttingstar_tools_inner'>
                        <div class='section tools_detect_bpm'>
                            <h2>BPM Detector (TEST)</h2>
                            <div class='section'>
                                URL <input type='text' class='inp inp_detect_bpm_url'/>
                            </div>
                            <div class='section'>
                                <audio class='audio audio_detect_bpm' controls/>
                            </div>
                            <div class='section'>
                                <select class='sel sel_detect_bpm_method'>
                                    <option value='1'>1</option>
                                    <option value='2'>2</option>
                                </select>
                                <button type='button' class='btn btn_detect_bpm'>DETECT</button><br/>
                                <input type='text' class='inp inp_detect_bpm_result' style='width: 150px;' readonly/>
                            </div>
                        </div>
                        <div class='section tools_create_mode'>
                            <h2>Song Creation Mode (TEST)</h2>
                            <div class='section'>
                                <a href='./create/create.html' target='_blank'>POPUP</a>
                            </div>
                        </div>
                    </div>
                    <div class='shuttingstar_toolcontrols'>
                        <button type='button' class='btn btn_tool_cancel target_translate red'>Cancel</button>
                    </div>
                </div>
            </div>
        `;

        // 상세설정 영역 HTML 및 기타 css 적용
        this.configDiv.innerHTML = html;
        this.configDiv.style.zIndex = 1002;
        this.configDiv.style.position = 'fixed';
        this.configDiv.style.top    = '10px';
        this.configDiv.style.left   = '10px';
        this.configDiv.style.width  = (this.fOuterWidth()  - this.gap.w - this.getLeftMarginPage() - 100) + 'px';
        this.configDiv.style.height = (this.fOuterHeight() - this.gap.h - this.getTopMarginPage()  - 100) + 'px';
        this.configDiv.style.textAlign = 'center';
        this.configDiv.style.verticalAlign = 'middle';
        this.configDiv.style.overflowY = 'auto';

        // 스트링 테이블 번역 적용
        this.configDiv.querySelectorAll('.target_translate').forEach((itemOne) => {
            itemOne.innerHTML = selfs.trans(itemOne.innerHTML);
        });

        // 레이어 영역 (안쪽)
        const layer = this.configDiv.querySelector('.shuttingstar_configlayer');
        layer.style.zIndex = this.canvasZindex + 3;
        layer.style.width  = '90%';
        layer.style.minHeight = Math.floor((this.fOuterHeight() - this.gap.h) / 2.0) + 'px';

        // 탭 이벤트
        layer.querySelectorAll('button.tab').forEach((itemOne) => {
            itemOne.addEventListener('click', function(e) {
                const btn = e.target;

                // 탭 버튼과 탭 영역들 다 비활성화
                layer.querySelectorAll('button.tab').forEach((itemTwo) => {
                    itemTwo.classList.remove('active');
                });
                layer.querySelectorAll('.tabarea').forEach((itemTwo) => {
                    itemTwo.classList.remove('active');
                });

                // 이 버튼 활성화
                btn.classList.add('active');

                // 해당 영역도 활성화
                layer.querySelector(btn.getAttribute('data-tabarea')).classList.add('active');
            });
        });
        
        // 버튼 이벤트 (설정)
        const controlDiv = this.configDiv.querySelector('.shuttingstar_configcontrols');
        const btnAccept  = controlDiv.querySelector('.btn_config_accept');
        const btnCancel  = controlDiv.querySelector('.btn_config_cancel');
        const btnReset   = controlDiv.querySelector('.btn_config_resetall');

        const fCancel = function() {
            selfs.loadSettings();
            selfs.closeConfigDiv();
            selfs.setState('menu');
        };
        
        btnAccept.addEventListener('click', () => {
            // 설정값들을 객체에 적용
            selfs.keypressTiming      = parseInt(String( layer.querySelector('.inp_keypressdelay').value ).trim());
            selfs.songTiming          = parseInt(String( layer.querySelector('.inp_sounddelay').value ).trim());
            selfs.noteSpeedMultiplier = parseInt(String( layer.querySelector('.inp_notespeedrate').value ).trim());

            //     그래픽 품질
            selfs.settingGraphicQualityChoosing = layer.querySelector('.sel_graphicquality').value;
            if(selfs.settingGraphicQualityChoosing == 'LOW') {
                selfs.ressets.w = 1280;
                selfs.ressets.h =  720;
                selfs.disable3d = true;
            } else if(selfs.settingGraphicQualityChoosing == 'MEDIUM') {
                selfs.ressets.w = 1920;
                selfs.ressets.h = 1080;
                selfs.disable3d = true;
            } else if(selfs.settingGraphicQualityChoosing == 'HIGH') {
                selfs.ressets.w = 1920;
                selfs.ressets.h = 1080;
                selfs.disable3d = false;
            } else {
                selfs.ressets.w = 1280;
                selfs.ressets.h =  720;
            }
            selfs.setResolution(selfs.ressets.w, selfs.ressets.h);

            //     언어
            selfs.language = layer.querySelector('.sel_language').value;
            selfs.languageDefault = false;

            //     라인 키
            // 라인 키 설정
            let specialKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'ENTER', 'ESCAPE'];
            let tempKey = null;
            tempKey = layer.querySelector('.inp_linekey_1').value;
            tempKey = String(tempKey).trim().toUpperCase();
            if(tempKey.length != 1 && specialKeys.indexOf(tempKey) < 0) tempKey = this.keyList[0];
            this.keyList[0] = tempKey;

            tempKey = layer.querySelector('.inp_linekey_2').value;
            tempKey = String(tempKey).trim().toUpperCase();
            if(tempKey.length != 1 && specialKeys.indexOf(tempKey) < 0) tempKey = this.keyList[1];
            this.keyList[1] = tempKey;

            tempKey = layer.querySelector('.inp_linekey_3').value;
            tempKey = String(tempKey).trim().toUpperCase();
            if(tempKey.length != 1 && specialKeys.indexOf(tempKey) < 0) tempKey = this.keyList[2];
            this.keyList[2] = tempKey;

            tempKey = layer.querySelector('.inp_linekey_4').value;
            tempKey = String(tempKey).trim().toUpperCase();
            if(tempKey.length != 1 && specialKeys.indexOf(tempKey) < 0) tempKey = this.keyList[3];
            this.keyList[3] = tempKey;

            tempKey = layer.querySelector('.inp_linekey_5').value;
            tempKey = String(tempKey).trim().toUpperCase();
            if(tempKey.length != 1 && specialKeys.indexOf(tempKey) < 0) tempKey = this.keyList[4];
            this.keyList[4] = tempKey;

            tempKey = layer.querySelector('.inp_linekey_6').value;
            tempKey = String(tempKey).trim().toUpperCase();
            if(tempKey.length != 1 && specialKeys.indexOf(tempKey) < 0) tempKey = this.keyList[5];
            this.keyList[5] = tempKey;

            // 설정 저장
            selfs.saveSettings();
            selfs.closeConfigDiv();
            selfs.setState('menu');
        });

        btnCancel.addEventListener('click', fCancel);

        btnReset.addEventListener('click', () => {
            if(confirm(selfs.trans('Do you want to reset all?'))) selfs.resetAll(); // this.confirm 쓰면 안 됨. DOM 영역에 뜨는 버튼들이라...
        });

        // 버튼 이벤트 (곡)
        let ta = this.configDiv.querySelector('.ta_json_song');
        const control2Div = this.configDiv.querySelector('.shuttingstar_songcontrols');
        const btnSave     = control2Div.querySelector('.btn_song_accept');
        const btnCancel2  = control2Div.querySelector('.btn_song_cancel');

        btnSave.addEventListener('click', () => {
            let json = String(ta.value).trim();
            try {
                json = ShuttingStarsUtility.removeLinesStartKey(json, '#');
                json = JSON.parse(json);
                localStorage.setItem('shuttingstar_songs', JSON.stringify(json));
                this.loadSongs();
            } catch(ejson) {
                console.error(ejson);
                alert(this.trans('ERROR') + ' : ' + ejson);
                return;
            }

            selfs.closeConfigDiv();
            selfs.setState('menu');
        });

        btnCancel2.addEventListener('click', fCancel);

        // 버튼 이벤트 (패키지)
        let ta2 = this.configDiv.querySelector('.ta_packages');
        const control3Div = this.configDiv.querySelector('.shuttingstar_packagessections');
        const btnSave3    = control3Div.querySelector('.btn_packages_accept');
        const btnCancel3  = control3Div.querySelector('.btn_packages_cancel');

        btnSave3.addEventListener('click', () => {
            let urls = String(ta2.value).trim();
            try {
                localStorage.setItem('shuttingstar_packages', urls);
                this.loadPackages().then(() => { selfs.loadSongs(); }).catch((ex) => { console.error(ex); });
            } catch(ejson) {
                console.error(ejson);
                alert(this.trans('ERROR') + ' : ' + ejson);
                return;
            }

            selfs.closeConfigDiv();
            selfs.setState('menu');
        });
        btnCancel3.addEventListener('click', fCancel);

        // 버튼 이벤트 (도구)
        const control4Div = this.configDiv.querySelector('.shuttingstar_toolssections');
        const btnCancel4 = control4Div.querySelector('.btn_tool_cancel');

        btnCancel4.addEventListener('click', fCancel);

        // Detect BPM
        let toolAreaOne = this.configDiv.querySelector('.tools_detect_bpm');
        let btnAct = toolAreaOne.querySelector('.btn_detect_bpm');
        let inpUrl = toolAreaOne.querySelector('.inp_detect_bpm_url');
        let inpResult = toolAreaOne.querySelector('.inp_detect_bpm_result');

        const areaDetectBpm = toolAreaOne;
        btnAct.addEventListener('click', () => {
            const audioObj = areaDetectBpm.querySelector('.audio_detect_bpm');
            audioObj.src = inpUrl.value;

            const selMethod = areaDetectBpm.querySelector('.sel_detect_bpm_method');
            if(selMethod.value == '1') {
                detectBpm(inpUrl.value).then((bpm) => {
                    inpResult.value = bpm;
                });
            } else {
                detectBpm2(inpUrl.value).then((bpm) => {
                    inpResult.value = bpm;
                });
            }
        });
    }

    /**
     * 상세설정 창 열기
     */
    openConfigDiv() {
        let idx;

        // 설정화면 입력 요소들에 현재값 입력하기
        let inp = this.configDiv.querySelector('.inp_keypressdelay');
        inp.value = (this.keypressTiming);

        inp = this.configDiv.querySelector('.inp_sounddelay');
        inp.value = (this.songTiming);

        inp = this.configDiv.querySelector('.inp_notespeedrate');
        inp.value = (this.noteSpeedMultiplier);

        if(this.resolution.w <= 1280) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0];
        else {
            this.settingGraphicQualityChoosing = this.settingsGraphicQuality[1];
            if(! this.disable3d) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[2];
        }
        
        // 그래픽 설정
        let sel = this.configDiv.querySelector('.sel_graphicquality');
        let html = '';
        for(idx=0; idx<this.settingsGraphicQuality.length; idx++) {
            const values = ShuttingStarsUtility.purifyHTML( this.settingsGraphicQuality[idx] );
            let   labels = ShuttingStarsUtility.purifyHTML(this.trans(String(values)));
            if(values == 'HIGH') labels += ' (' + this.trans('EXPERIMENTAL') + ')';

            html += "<option value='" + values + "'>" + labels + "</option>";
        }
        sel.innerHTML = html;
        sel.value = this.settingGraphicQualityChoosing;
        
        // 언어 설정
        sel = this.configDiv.querySelector('.sel_language');
        html = '';
        html += "<option value='en'>English</option>";
        html += "<option value='ko'>한글</option>";
        sel.innerHTML = html;
        sel.value = this.language;

        // 라인 키 설정
        inp = this.configDiv.querySelector('.inp_linekey_1');
        inp.value = this.keyList[0];

        inp = this.configDiv.querySelector('.inp_linekey_2');
        inp.value = this.keyList[1];

        inp = this.configDiv.querySelector('.inp_linekey_3');
        inp.value = this.keyList[2];

        inp = this.configDiv.querySelector('.inp_linekey_4');
        inp.value = this.keyList[3];

        inp = this.configDiv.querySelector('.inp_linekey_5');
        inp.value = this.keyList[4];

        inp = this.configDiv.querySelector('.inp_linekey_6');
        inp.value = this.keyList[5];

        // 커스텀 곡 입력 요소들에 현재값 입력하기
        let ta = this.configDiv.querySelector('.ta_json_song');
        //     공식곡 제외하고 담기
        let list = [];
        for(idx=0; idx<this.songs.length; idx++) {
            const songOne = this.songs[idx];
            if(this.officialSongSerials.indexOf(songOne.serial) >= 0) continue;

            // 시리얼 없는 경우 임의 시리얼 부여
            if(songOne.serial == '' || songOne.serial == null) songOne.serial = 'nonofficial_' + Math.floor(ShuttingStarsUtility.random() * 999999999) + '' + Math.floor(ShuttingStarsUtility.random() * 999999999);
            list.push(songOne);
        }

        // JSON으로 변환해 텍스트 영역에 담기
        ta.value = this.defaultCustomSongComments() + '\n' + JSON.stringify(list);
        
        // 영역 전체를 노출시키고 포커스
        this.keyEventDisabled = true;
        this.pops.dim.classList.remove('invisible');
        this.configDiv.classList.remove('invisible');
        this.configDiv.querySelector('.inp_keypressdelay').focus();
    }

    /**
     * 상세설정 창 닫기
     */
    closeConfigDiv() {
        this.configDiv.classList.add('invisible');
        this.pops.dim.classList.add('invisible');
        this.keyEventDisabled = false;
        this.canvas.focus();
    }

    /**
     * 커스텀 곡 JSON 상단 주석 내용 반환
     * @returns {string} 처리 결과
     */
    defaultCustomSongComments() {
        return String(`
# Caution ! Lines start with '#' will be ignored.
#
# How to add your own custom songs
#    One song - one JSON object.
#        name           : (string) Song's name
#      , composer       : (string) Composer's name
#      , noteWriter     : (string) Note writer's name
#      , bgaUrl         : (string) Just input empty text (BGA feature is not supported yet)
#      , musicUrl       : (string) Music file URL
#      , thumbnailUrl   : (string) Thumbnail image file URL (just input empty text when not exist)
#      , description    : (string) Description.
#      , loadingTime    : (integer) Additional loading time
#      , bpm            : (integer) BPM (Bit per minutes)
#      , endTime        : (integer) This song's length ( Not seconds ! Need to test. )
#      , timeMultiplier : (integer) Game total speed multiplier (Just set 1)
#      , timeConstant   : (integer) Note timing correction value (+)
#      , noteMultiplier : (integer) Note timing correction value (×)
#      , serial         : (string) Just input empty text (Need only for official songs)
#      , difficulties   : (array)
#            element : (object)
#                difficultyLabel : (string) Difficulty Name (ex: easy, normal, hard, ex1, ex2, ex3, ...)
#                difficultyLevel : (integer) Difficulty Number
#                patterns : (array)
#                    element : (object)
#                        locationIndex : (integer) line (0~5, If you using -1 then random)
#                        time          : (number) occuring time ( Not seconds ! Need to test. ) float also OK
#    example
#      [
#          {
#              "name" : "TEST SONG", "composer" : "HJOW", "noteWriter" : "HJOW", "bgaUrl" : "", "musicUrl" : "", thumbnailUrl : "", description : "", "bpm" : 120, "endTime" : 3700
#            , "timeConstant" : -100, "timeMultiplier" : 1, "serial" : ""
#            , "difficulties" : [
#                  {
#                       "difficultyLabel" : "easy"
#                       "difficultyLevel" : 1
#                       "patterns" : [
#                            {"locationIndex" : 1, time : 3}
#                          , {"locationIndex" : 0, time : 6}
#                          , {"locationIndex" : 4, time : 9}
#                          ...
#                       ]
#                  },
#                  {
#                       "difficultyLabel" : "normal"
#                       "difficultyLevel" : 4
#                       "patterns" : [
#                            {"locationIndex" : 2, time : 2}
#                          , {"locationIndex" : 1, time : 4}
#                          , {"locationIndex" : 4, time : 6}
#                          ...
#                       ]
#                  }
#              ]
#          }
#      ]
        `).trim();
    }

    /**
     * 언어 번역 (stringTable 이용, 없으면 매개변수 값 그대로 반환)
     * @param {string} english english 값
     * @returns {string} 처리 결과
     */
    trans(english) {
        if(typeof(this.language) == 'undefined') return english;
        if(this.language == 'en') return english;

        let stringTableChoosed = this.stringTable[this.language];
        if(typeof(stringTableChoosed) == 'undefined') return english;

        let translated = stringTableChoosed[english];
        if(typeof(translated) == 'undefined') {
            if(this.stringTableDebugMode) console.log('[NOLANG] ' + english);
            return english;
        }

        return translated;
    }

    /**
     * render 메소드 내에서 사용되는 font 값 중 글꼴 파트 반환, pointFont 는 강조하고 싶을 때 true 를 입력 (선택사항)
     * @param {boolean} pointFont pointFont 값
     * @returns {string} 처리 결과
     */
    getRenderFontFamily(pointFont) {
        let alters = '';
        if(this.alterFonts != null && this.alterFonts != '') {
            let splits = this.alterFonts.split(' ');
            for(let idx=0; idx<splits.length; idx++) {
                if(idx >= 1) alters += ', ';
                alters += "'" + splits[idx].trim() + "'";
            }
        }

        if(pointFont) return "'" + this.pointFont  + "'" + (alters == '' ? '' : ', ' + alters);
        return               "'" + this.fontFamily + "'" + (alters == '' ? '' : ', ' + alters);
    }
    
    /**
     * 게임 내 무대 크기 (stageSize.w) 를 실제 화면 내 좌표 (resolution.w) 로 변환
     * @param {number} x x 값
     * @returns {number} 처리 결과
     */
    convertX(x) {
        return Math.round((x * this.resolution.w / this.getStageWidth()) + this.getLeftMarginStage());
    }

    /**
     * 게임 내 무대 크기 (stageSize.h) 를 실제 화면 내 좌표 (resolution.h) 로 변환
     * @param {number} y y 값
     * @param {boolean} allowReverse 수직 반전 설정을 적용할지 여부
     * @returns {number} 처리 결과
     */
    convertY(y, allowReverse) {
        if(allowReverse) {
            if(this.reverseVertical) {
                return (this.resolution.h - ( y * this.resolution.h / this.getStageHeight() )) + this.getTopMarginStage();
            }
        }
        return Math.round((y * this.resolution.h / this.getStageHeight()) + this.getTopMarginStage());
    }

    /**
     * convertY 본작업 없이 reverseVertical 만 반영
     * @param {number} y y 값
     * @returns {number} 수직 반전 설정이 적용된 Y 좌표
     */
    applyY(y) {
        if(this.reverseVertical) {
            return (this.resolution.h - y);
        }
        return y;
    }

    /**
     * reverseConvertX 결과를 계산합니다.
     * @param {number} x x 값
     * @returns {number} 처리 결과
     */
    reverseConvertX(x) {
        return (x * this.getStageWidth() / this.resolution.w) + this.getLeftMarginStage();
    }

    /**
     * reverseConvertY 결과를 계산합니다.
     * @param {number} y y 값
     * @returns {number} 처리 결과
     */
    reverseConvertY(y) {
        return (y * this.getStageHeight() / this.resolution.h) + this.getTopMarginStage();
    }

    /**
     * 컬러 변환 시도 (alpha 값 미지원 시)
     * @param {string} rgbaColor rgbaColor 값
     * @returns {string} 렌더링에 사용할 CSS 색상 문자열
     */
    convertColor(rgbaColor) {
        if(rgbaColor.indexOf('rgba(') != 0) return rgbaColor;

        // rgba 컬러의 opacity (alpha) 값이 의미가 없는 경우가 있어, rgb 컬러로 변환
        if(this.colorManualAlpha) {
            const rgbaValues = rgbaColor.substring(5, rgbaColor.length - 1).split(',').map(s => s.trim());
            const br = parseInt(rgbaValues[0]);
            const bg = parseInt(rgbaValues[1]);
            const bb = parseInt(rgbaValues[2]);
            const ba = parseInt(rgbaValues[3]);

            let r = Math.floor((br / 255.0) * (ba) * 255.0);
            let g = Math.floor((bg / 255.0) * (ba) * 255.0);
            let b = Math.floor((bb / 255.0) * (ba) * 255.0);

            if(! this.dark) {
                r = 255 - r;
                g = 255 - g;
                b = 255 - b;
            }
            
            return 'rgb(' + r + ', ' + g + ', ' + b + ')';
        }
        return rgbaColor;
    }

    /**
     * 폰트 크기 변환
     * @param {number} num num 값
     * @returns {number} 처리 결과
     */
    convertFontSize(num) {
        return Math.floor(num * (this.resolution.h * 1.0 / this.stageSize.h) * this.fontSizeRatio); // 해상도와 스테이지 크기 비율 구하기 (세로 길이만 반영)
    }

    /**
     * URL 변환
     * @param {string} url url 값
     * @returns {string} URL 컨텍스트가 적용된 URL
     */
    convertURL(url) {
        url = String(url).trim();
        if(url.indexOf('http://') == 0 || url.indexOf('https://') == 0) return url;
        if(url.indexOf('[CTX]') == 0) url = ShuttingStarsUtility.replaceString(url, '[CTX]', this.urlCtx);
        if(url.indexOf('.') == 0) return url;

        if(this.urlCtx.indexOf('/') == this.urlCtx.length - 1) this.urlCtx += '/';
        if(url.indexOf('/') == 0) return this.urlCtx + url.substring(1);

        return url;
    }

    /**
     * 타이틀 화면 내 로딩 화면 중 처리 작업
     */
    loadAfter() {
        const selfs = this;
        return new Promise((resolve, reject) => {
            selfs.setStarlights();
            selfs.loadPlugins().then(() => {
                selfs.loadPackages().then(() => {
                    setTimeout(() => {
                        resolve(true);
                    }, 300);
                }).catch((e1) => { reject(e2) });
            }).catch((e2) => { reject(e2); });
        });
    }

    /**
     * 장식용 별빛 세팅
     */
    setStarlights() {
        let idx;
        // 기존 별빛 제거
        for(idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if(obj instanceof Starlight) { this.objects.splice(idx, 1); idx--;}
        }

        // 별빛 추가
        this.backStarlightSpdX = 1;
        this.backStarlightSpdY = ShuttingStarsUtility.random();
        for(idx=0; idx<this.backStarlightCount; idx++) {
            const obj = new Starlight();
            obj.speedX = this.backStarlightSpdX;
            obj.speedY = this.backStarlightSpdY;
            this.objects.push(obj);
        }
    }

    /**
     * 장식용 별빛 갯수 맞추기
     */
    remainStarlightCounts() {
        let idx, count, newOne;
        count = 0;
        // 기존 별빛 수 세기
        for(idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if(obj instanceof Starlight) { count++; }
        }

        if(this.song != null) { // 곡이 선택된 상태로
            if(! this.song.autoStars) return; // 곡에서 별빛 안쓰기로 했다면 중단
        }

        // 갯수 맞춰 생성
        while(count < this.backStarlightCount) {
            newOne = new Starlight();
            newOne.y = -2 + (ShuttingStarsUtility.random() * this.convertX(this.getFullRenderHeight() * 2));
            if(newOne.y >= this.convertX(this.getFullRenderHeight())) newOne.x = newOne.y - this.convertX(this.getFullRenderHeight());
            else newOne.x = -2;
            newOne.speedX = this.backStarlightSpdX;
            newOne.speedY = this.backStarlightSpdY;
            this.objects.push(newOne);

            count++;
        }
    }

    /**
     * 장식용 별빛 방향 일괄 바꾸기
     * @param {number} xSpeed xSpeed 값
     * @param {number} ySpeed ySpeed 값
     */
    modifyStarlightDirections(xSpeed, ySpeed) {
        this.backStarlightSpdX = xSpeed;
        this.backStarlightSpdY = ySpeed;
        for(idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if(obj instanceof Starlight) {
                obj.speedX = xSpeed;
                obj.speedY = ySpeed;
            }
        }
    }

    /**
     * 곡 패키지 불러오기
     * @returns {Promise<void>} 패키지 로드 작업
     */
    async loadPackages() {
        let idx, jdx;

        let packages = localStorage.getItem('shuttingstar_packages');
        if(packages == null || typeof(packages) == 'undefined') return;
        if(packages == '') return;
        packages = ShuttingStarsUtility.removeLinesStartKey(packages, '#');

        const splits = packages.split('\n');
        for(idx=0; idx<splits.length; idx++) {
            let lineOne = String(splits[idx]).trim();
            if(lineOne == '') continue;

            try {
                const responses = await fetch(lineOne);
                const json = responses.json();

                if(typeof(json.name) != 'string') continue;
                console.log('Package ' + json.name + ' applied.');

                let songs = json.songs;
                if(typeof(songs) != 'undefined' && songs != null) {
                    for(jdx=0; jdx<songs.length; jdx++) {
                        this.addSong(songs[jdx]);
                    }
                }
            } catch(e) {
                console.error('Fail to load packages from ' + lineOne);
                console.error(e);
                continue;
            }
        }
    }

    /**
     * 틱 효과음 재생
     */
    playTick() {
        if(this.se.tick == null) return;
        try {
            this.se.tick.currentTime = 0;
            this.se.tick.play();
        } catch(e) { console.error(e); }
    }

    /**
     * 효과음 재생
     * @param {string} seKey seKey 값
     */
    playSE(seKey) {
        if(this.se[seKey] == null || typeof(this.se[seKey]) == 'undefined') return;
        try {
            this.se[seKey].currentTime = 0;
            this.se[seKey].play();
        } catch(e) { console.error(e); }
    }

    /**
     * 플러그인 불러오기
     * @returns {Promise<void>} 플러그인 로드 작업
     */
    async loadPlugins() {
        this.pluginApplied = [];
    }

    /**
     * JSON 객체를 읽어 ShuttingStarsSong 객체 생성
     * @param {Object|string} json json 값
     * @returns {ShuttingStarsSong} 변환된 곡 객체
     */
    parseSong(json) {
        if(typeof(json) == 'string') json = JSON.parse(json);

        let idx;
        let song = new ShuttingStarsSong();

        song.name           = json.name;
        song.composer       = json.composer;
        song.noteWriter     = json.noteWriter;
        song.bgaUrl         = json.bgaUrl;
        song.musicUrl       = json.musicUrl;
        song.musicAlterUrl  = json.musicAlterUrl;
        song.thumbnailUrl   = json.thumbnailUrl;
        song.description    = json.description;
        song.loadingTime    = json.loadingTime;
        song.bpm            = json.bpm;
        song.endTime        = json.endTime;
        song.noteMultiplier = json.noteMultiplier;
        song.timeConstant   = json.timeConstant;
        song.timeMultiplier = json.timeMultiplier;
        song.difficulties   = [];
        song.decorations    = [];

        song.test = false;
        if(json.test) song.test = true;

        song.autoStars = true;
        if(typeof(json.autoStars) != 'undefined') {
            if(json.autoStars) song.autoStars = true;
            else               song.autoStars = false;
        }

        for(idx=0; idx<json.difficulties.length; idx++) {
            const difficultyOne = json.difficulties[idx];
            let newObj = {};

            newObj.index = idx;
            newObj.difficultyLabel = difficultyOne.difficultyLabel;
            newObj.difficultyLevel = difficultyOne.difficultyLevel;
            newObj.patterns = [];

            for(let idx2=0; idx2<difficultyOne.patterns.length; idx2++) {
                const noteJsonOne = difficultyOne.patterns[idx2];
                let patternOne = new ShuttingStarsNotePattern(noteJsonOne.locationIndex, noteJsonOne.time);
                newObj.patterns.push(patternOne);
            }
            song.difficulties.push(newObj);
        }

        if(json.serial != null && json.serial != '') {
            song.serial = json.serial;
        } else {
            song.serial = 'CUSTOMSONG_' + (ShuttingStarsUtility.random() * 99999999) + '' + (ShuttingStarsUtility.random() * 99999999);
        }

        if(json.decorations) {
            if(typeof(json.decorations) == 'string') json.decorations = JSON.parse(json.decorations);
            song.decorations = json.decorations;
        }

        return song;
    }

    /**
     * 외부에서 곡 추가 시 호출
     * @param {ShuttingStarsSong} song 추가하거나 처리할 곡
     * @param {boolean} noSave 곡 목록 저장을 생략할지 여부
     * @returns {ShuttingStarsSong} 실제로 목록에 추가된 곡 객체
     */
    addSong(song, noSave) {
        let returnVal = null;
        let idx;
        if(! (song instanceof ShuttingStarsSong)) {
            let json = song;
            if(typeof(json) == 'string') json = JSON.parse(json);

            song = this.parseSong(json);
            returnVal = song;
        } else {
            returnVal = song;
        }

        // 시리얼 없으면 발급
        if(song.serial == null || song.serial == '') {
            song.serial = 'CUSTOMSONG_' + (ShuttingStarsUtility.random() * 99999999) + '' + (ShuttingStarsUtility.random() * 99999999);
        }

        // Alter URL 유효여부 검사
        song.alterUrlUsing = false;
        if(song.musicAlterUrl != null && song.musicAlterUrl != '') {
            const target = song;
            ShuttingStarsUtility.checkAccessibleURL(song.musicAlterUrl).then((availYn) => {
                target.alterUrlUsing = availYn;
            });
        }

        // 중복 체크
        let exists = false;
        for(idx=0; idx<this.songs.length; idx++) {
            const songOne = this.songs[idx];
            if(song.serial != '' && songOne.serial == song.serial) {
                exists = true;
                break;
            }
            if(songOne.name == song.name && songOne.composer == song.composer && songOne.noteWriter == song.noteWriter) {
                exists = true;
                break;
            }
        }

        if(exists) throw "Duplicated song's serial";
        this.songs.push(song);

        // songDisplays 갱신
        if(this.songDebugMode) {
            this.songDisplays = this.songs;
        } else {
            this.songDisplays = [];
            for(idx=0; idx<this.songs.length; idx++) {
                const songOne = this.songs[idx];
                if(songOne.test) continue;
                this.songDisplays.push(songOne);
            }
        }

        if(noSave) return returnVal;
        this.saveSongs();
        return returnVal;
    }

    /**
     * 부동소수 동일여부 확인 (노트 생성 타이밍에 사용, ShuttingStarsUtility 에 있는 동일 메소드와 오차범위를 다르게 지정하게 될 수 있어 분리함)
     * @param {number} a a 값
     * @param {number} b b 값
     * @returns {boolean} 두 값이 허용 오차 안에서 같은지 여부
     */
    checkEqualFloats(a, b) {
        return Math.abs(a - b) < 0.000001;
    }

    /**
     * 저장된 로컬 기록들 반환
     * @returns {Array<Object>} 최신 기록부터 정렬된 로컬 기록 목록
     */
    getRecords() {
        let storageStrings = localStorage.getItem('shuttingstar_records');
        if(typeof(storageStrings) == 'undefined' || storageStrings == '' || storageStrings == null) return [];
        let storageJson = JSON.parse(storageStrings);
        if(storageJson == null) storageJson = [];
        return storageJson;
    }

    /**
     * 저장된 인터넷 기록들 반환, 백엔드 연결 없으면 null 반환, Promise
     * @returns {Promise<*>} 처리 결과
     */
    getInternetRecords() {
        const selfs = this;
        return new Promise((resolve, reject) => {
            if(selfs.backend == null) { resolve(null); return; }
            if(! selfs.backend.avail) { resolve(null); return; }
            try {
                selfs.backend.listRankBoard().then((resp) => {
                    if(! resp.success) { resolve([]); return; }
                    resolve(resp.list);
                }).catch((e) => {
                    console.error(e);
                    resolve([]);
                });
            } catch(ex) {
                console.error(ex);
                resolve([]);
            }
        });
    }

    /**
     * 기록 저장
     * @param {Object} recordOne recordOne 값
     */
    addRecords(recordOne) {
        if(typeof(recordOne) == 'undefined') return;
        if(recordOne == null) return;
        if(recordOne == '') return;
        if(typeof(recordOne) == 'string') recordOne = JSON.parse(recordOne);

        let recordArray = this.getRecords();
        if(recordArray == null) recordArray = [];
        recordArray.unshift(recordOne); // 첫 번째 자리에 추가
        
        let deletes = -1;
        let idx;
        while(recordArray.length > 100) {
            // 뒤에서부터 시작해서, 클리어 안한 것 위주로 먼저 삭제
            for(let idx=recordArray.length-1; idx>=0; idx--) {
                let recOne = recordArray[idx];
                if(! recOne.clear) {
                    deletes = idx;
                    break;
                }
            }
            if(deletes >= 0) {
                recordArray.splice(deletes, 1); 
            } else {
                // 전부 클리어한 것만 남아있는 상황이므로, 맨 뒤의 원소 삭제
                recordArray.splice(recordArray.length - 1, 1); 
            }
            if(recordArray.length <= 100) break;
        }

        localStorage.setItem('shuttingstar_records', JSON.stringify(recordArray));

        // 로그인된 경우 Firestore 에도 기록
        if(recordOne.clear) {
            if(this.backend != null && this.backend.avail) {
                if(this.backend.logined) {
                    this.backend.registerRankRecord(recordOne);
                }
            }
        }
    }

    /**
     * 설정 전체 초기화 (로컬 스토리지에 저장된 ShuttingStars 관련 저장값들을 모두 삭제)
     * @param {Function} callbackAfter 작업 완료 후 호출할 콜백 (넣지 않으면, 설정 전체 초기화 후 화면을 새로고침함)
     */
    resetAll(callbackAfter) {
        const fAfter = function() {
            if(typeof(callbackAfter) == 'function') callbackAfter();
            else location.reload();
        }
        try { localStorage.setItem('shuttingstar_settings', ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        try { localStorage.setItem('shuttingstar_songs'   , ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        try { localStorage.setItem('shuttingstar_packages', ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        try { localStorage.setItem('shuttingstar_records' , ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        try { localStorage.setItem('shuttingstar_session' , ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        try { localStorage.setItem('shuttingstar_credit'  , ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        fAfter();
    }
}

/*** ShuttingStars 게임 Core 객체 탑재 변수 **/
const _shuttingstarcore = new ShuttingStarsCore();

/** 곡 */
class ShuttingStarsSong {
    /** @type {number} 인스턴스를 식별하는 고유 일련번호입니다. */
    uniqueSerial = ShuttingStarsUtility.randomInt();

    // 기본정보
    /** @type {string} 곡 이름 */
    name = '';
    /** @type {string} 작곡가 */
    composer = '';
    /** @type {string} 노트 작가 */
    noteWriter = '';
    /** @type {string} 설명 */
    description = '';
    /** @type {number} beat per minute, 곡의 속도 */
    bpm = 120.0;
    /** @type {number} 곡 종료 시간 */
    endTime = 560;

    /** @type {string} 추가 패키지인 경우 추가 패키지 이름이 들어감 */
    contentname = '';

    /** @type {string} 음원 URL */
    musicUrl = '';
    /** @type {string} 음원 대체 URL */
    musicAlterUrl = '';

    /** @type {string} 썸네일 이미지 URL (BASE64 가능) */
    thumbnailUrl = '';
    /** @type {string} 플레이 중 배경 영상 URL 로 쓰려고 했으나, 아직은 미지원 */
    bgaUrl = '';

    /** @type {number} 추가 로딩시간 (곡 선택 후 곡 타이틀이 풀스크린으로 나오는 시간 증가, 0으로 해도 기본 시간이 존재함) */
    loadingTime = 10;
    /** @type {number} 보정 배수 (패턴 타이밍 값에  보정값으로 적용) */
    noteMultiplier = 1;
    /** @type {number} 보정 시간 (노트 위치 값에  보정값으로 적용) */
    timeMultiplier = 1;
    /** @type {number} 보정 시간 (노트 위치 값에 + 보정값으로 적용, timeMultiply 보다 후순위로 적용) */
    timeConstant = 0;
    /** @type {boolean} 자동 Starlight 생성 */
    autoStars = true;
    /** @type {boolean} true 지정 시 곡 디버그 모드에서만 노출됨 */
    test = false;
    /** @type {string} 수정하지 말 것 */
    serial = '';

    /** @type {boolean} 게임 동작 중 수정됨, ALTER URL 사용여부 */
    alterUrlUsing = false;
    
    // 난이도 별 패턴
    // 배열로, 각 원소는 JSON객체로 구성
    // 원소의 JSON키
    //     difficultyLabel : easy, normal, hard, 그 뒤부터는 ex1, ex2, ex3, ... 순으로 난이도 이름 뒤에 ; (세미콜론) 뒤에 숫자로 난이도 표기한 문자열이 키로 사용
    //     difficultyLevel : 1, 2, 3, ... (정수로  입력)
    //     patterns : 배열로 그 안에 ShuttingStarsNotePattern 패턴들이 탑재
    /** @type {Array<Object>} 곡에 정의된 난이도 및 패턴 목록입니다. */
    difficulties = [];

    // 장식
    /** @type {Array<Object>} 곡에 정의된 장식 객체 목록입니다. */
    decorations = [];

    /**
     * 인스턴스를 초기화합니다.
     */
    constructor() {
        this.uniqueSerial = 10000000 + ShuttingStarsUtility.randomInt() + (ShuttingStarsUtility.randomInt() * 10000); // 고유값
    }

    /**
     * 노트 생성 위치
     * @returns {number} 노트가 생성될 Y 좌표
     */
    getNoteCreationYLocation() {
        return _shuttingstarcore.getNoteCreationYLocation();
    }

    /**
     * 곡에 정의된 난이도 목록을 반환합니다.
     * @returns {Array<Object>} 난이도 객체 목록
     */
    getDifficultyList() {
        let arr = [];
        let idx;
        for(idx=0; idx<this.difficulties.length; idx++) {
            const diffOne = this.difficulties[idx];
            arr.push({
                index : diffOne.index,
                difficultyLabel : diffOne.difficultyLabel,
                difficultyLevel : diffOne.difficultyLevel
            });
        }
        return arr;
    }

    /**
     * 곡 설명을 출력 가능한 줄 목록으로 나눕니다.
     * @returns {Array<string>} 설명의 각 줄
     */
    getDescriptionSplit() {
        let desc = this.description;
        if(desc == null) return '';
        desc = desc.trim();
        
        const splits = desc.split('|');
        let arr = [];
        for(let line of splits) {
            if(line.trim() == '') continue;
            arr.push(line);
        }
        return arr;
    }

    /**
     * 곡 정보를 저장 가능한 일반 객체로 변환합니다.
     * @returns {Object} 직렬화 가능한 곡 정보
     */
    toJSONObject() {
        let idx, jdx;
        let obj = {};
        obj.name = this.name;
        obj.composer = this.composer;
        obj.noteWriter = this.noteWriter;
        obj.bgaUrl = this.bgaUrl;
        obj.musicUrl = this.musicUrl;
        obj.musicAlterUrl = this.musicAlterUrl;
        obj.thumbnailUrl = this.thumbnailUrl;
        obj.description = this.description;
        obj.loadingTime = this.loadingTime;
        obj.bpm = this.bpm;
        obj.endTime = this.endTime;
        obj.timeConstant = this.timeConstant;
        obj.timeMultiplier = this.timeMultiplier;
        obj.noteMultiplier = this.noteMultiplier;
        obj.test = this.test;
        obj.autoStars = this.autoStars;
        obj.serial = this.serial;
        obj.decorations = this.decorations;
        obj.difficulties = [];
        

        for(idx=0; idx<this.difficulties.length; idx++) {
            let diffOne = this.difficulties[idx];
            let diffObj = {};
            diffObj.index = diffOne.index;
            diffObj.difficultyLabel = diffOne.difficultyLabel;
            diffObj.difficultyLevel = diffOne.difficultyLevel;
            diffObj.patterns = [];

            for(jdx=0; jdx<diffOne.patterns.length; jdx++) {
                const noteObjOne = diffOne.patterns[jdx];
                let noteJsonOne = {};
                noteJsonOne.locationIndex = noteObjOne.locationIndex;
                noteJsonOne.time = noteObjOne.time;
                diffObj.patterns.push(noteJsonOne);
            }
            obj.difficulties.push(diffObj);
        }

        return obj;
    }
}

/** 미션 (mission 모드) 기본 구조 */
class ShuttingStarsMission extends ShuttingStarsSong {
    /**
     * 인스턴스 초기화
     * @param {ShuttingStarsCore} inst ShuttingStarsCore 객체
     */
    constructor(inst) { super(); }
    /**
     * 객체 사전준비
     * @param {ShuttingStarsCore} inst ShuttingStarsCore 객체
     */
    prepare(inst) {}
    /**
     * 노트들을 난이도에 맞게 사전생성, Survive 미션 공통 메소드이며, prepare 메소드를 통해 호출되도록 만들 예정
     * @param {ShuttingStarsCore} inst ShuttingStarsCore 객체
     * @param {number} level 난이도 레벨
     */
    prepareNotes(inst, level) {
        const allCnt = inst.songDisplays.length;
        const rand   = Math.floor(ShuttingStarsUtility.random() * allCnt);

        const choosed = inst.songDisplays[rand];
        this.musicUrl       = choosed.musicUrl;
        this.musicAlterUrl  = choosed.musicAlterUrl;
        this.bpm            = choosed.bpm;
        this.endTime        = choosed.endTime;
        this.timeConstant   = choosed.timeConstant;
        this.timeMultiplier = choosed.timeMultiplier;
        this.loadingTime    = choosed.loadingTime;
        this.composer       = choosed.composer;
        this.noteWriter     = '?';

        // 난이도는 하나만 생성
        this.difficulties = [];
        let difficulty = {};
        difficulty.index = 0;
        difficulty.difficultyLevel = level;
        if(level <= 4) difficulty.difficultyLabel = 'easy';
        else if(level <= 6) difficulty.difficultyLabel = 'normal';
        else if(level <= 10) difficulty.difficultyLabel = 'hard';
        else difficulty.difficultyLabel = 'ex1';

        difficulty.patterns = [];
        let idx;

        // 난이도에 맞게 패턴 랜덤생성 확률 결정
        let bpmRev = (Math.abs(300.0 - this.bpm) / 300.0); // bpm 이 빠르면 더 쉬워져야 하므로 만든 상수
        let rateMin   = 0.1 + (0.005 * bpmRev);   // 랜덤값 최소값
        let ratePoint = 0.05;                     // 랜덤값이 이 이하로 나와야 노트 생성
        let rateAfter = 0.00025 * bpmRev;         // 노트 생성 안한 타이밍 당 노트 생성확률 증가폭
        
        for(idx=0; idx<level; idx++) {
            ratePoint += (0.02    * bpmRev);
            rateAfter += (0.00025 * bpmRev);
            rateMin   -= (0.002   * bpmRev);
        }

        // 결정한 확률대로 노트 생성
        let noteCreatedAfter = 0;
        let randValue = 0;
        for(idx=this.loadingTime * _shuttingstarcore.timeMultiplier + 100; idx<this.endTime; idx++) {
            randValue = ShuttingStarsUtility.random() + rateMin; // rateMin ~ (9.99999 + rateMin)
            randValue -= (rateAfter * noteCreatedAfter);
            if(randValue < 0) randValue = 0;
            if(randValue > 1) randValue = 1;

            if(randValue <= ratePoint) {
                // console.log(idx + '\t MATCHED \t' + randValue + '\t' + ratePoint + ', ' + (rateAfter * noteCreatedAfter));
                noteCreatedAfter = 0; // 초기화
                difficulty.patterns.push({ locationIndex : -1, time : idx }); // 노트 타이밍 생성
            } else {
                // console.log(idx + '\t NOT MATCHED \t' + randValue + '\t' + ratePoint + ', ' + (rateAfter * noteCreatedAfter));
                noteCreatedAfter++; // 다음 번 타이밍에 노트 생성할 확률 증가
            }
        }
        
        this.difficulties.push(difficulty);
    }
}

/** EASY 생존 미션 */
class EasySurvive extends ShuttingStarsMission {
    /**
     * 인스턴스 초기화
     * @param {ShuttingStarsCore} inst ShuttingStarsCore 객체
     */
    constructor(inst) {
        super(inst);
        this.name = 'SURVIVE (EASY)'
        let desc = inst.trans('Survive (EASY)');
        desc += '\n' + inst.trans('Random song, random notes (May not fit tempos)');
        this.description = desc;
    }
    /**
     * 사전 준비
     * @param {ShuttingStarsCore} inst ShuttingStarsCore 객체
     */
    prepare(inst) {
        this.prepareNotes(inst, 3);
    }
}

/** NORMAL 생존 미션 */
class NormalSurvive extends ShuttingStarsMission {
    /**
     * 인스턴스 초기화
     * @param {ShuttingStarsCore} inst inst 값
     */
    constructor(inst) {
        super(inst);
        this.name = 'SURVIVE (NORMAL)'
        let desc = inst.trans('Survive (NORMAL)');
        desc += '\n' + inst.trans('Random song, random notes (May not fit tempos)');
        this.description = desc;
    }
    /**
     * 사전 준비
     * @param {ShuttingStarsCore} inst inst 값
     */
    prepare(inst) {
        this.prepareNotes(inst, 5);
    }
}

/** HARD 생존 미션 */
class HardSurvive extends ShuttingStarsMission {
    /**
     * 인스턴스 초기화
     * @param {ShuttingStarsCore} inst inst 값
     */
    constructor(inst) {
        super(inst);
        this.name = 'SURVIVE (HARD)'
        let desc = inst.trans('Survive (HARD)');
        desc += '\n' + inst.trans('Random song, random notes (May not fit tempos)');
        this.description = desc;
    }
    /**
     * 사전 준비
     * @param {ShuttingStarsCore} inst inst 값
     */
    prepare(inst) {
        this.prepareNotes(inst, 9);
    }
}

/** 노트가 생성될 위치와 시간 (즉 패턴) */
class ShuttingStarsNotePattern {
    /** @type {number} 게임 내부에서 사용하는 객체 고유 식별자 */
    id = 0;
    /** @type {number} 객체가 배치된 노트 라인 번호 */
    locationIndex = 0;
    /** @type {number} 노트 패턴이 판정선에 위치할 타이밍 */
    time = 0.0;
    /**
     * 인스턴스 초기화
     * @param {number} locationIndex 노트 라인의 번호
     * @param {number} time 노트 패턴이 판정선에 위치할 타이밍
     */
    constructor(locationIndex, time) {
        this.locationIndex = locationIndex;
        this.time = time;
    }
}

/* 게임 내 Note 및 NotePlacer 의 상위 클래스 */
class ShuttingStarsObject {
    /** @type {number} 인스턴스를 식별하는 고유 번호 */
    uniqueSerial = ShuttingStarsUtility.randomInt();
    /** @type {number} 게임 내부에서 사용하는 객체 식별자 */
    id = 0;
    /** @type {number} 객체의 X 좌표 */
    x = 0;
    /** @type {number} 객체의 Y 좌표 */
    y = 0;
    /** @type {number} 원의 반지름 또는 사각형의 너비 */
    r = 0;
    /** @type {number} 객체의 높이 (사각형일 때만 사용) */
    h = 0;
    /** @type {number} X 속도 */
    speedX = 0;
    /** @type {number} Y 속도 */
    speedY = 0;
    /** @type {Array<{x: number, y: number}>} >} >}>} 이전 위치 (꼬리 렌더링에 사용) */
    beforeLocations = [];
    /** @type {number} 꼬리 렌더링에 보관할 이전 좌표의 최대 개수 */
    beforeLocationCountMax = 32;
    /** @type {boolean} 꼬리 출력 (이전 위치 사용) */
    tail = false;
    /** @type {boolean} 렌더링에서 숨길지 여부 */
    hidden = false;
    /** @type {number} 객체의 불투명도 */
    opacity = 1.0;
    /** @type {string} 렌더링할 도형 종류 */
    shape = 'circle';
    /** @type {string} 객체의 색상 (rgba 혹은 rgb 키워드 포함 전체를 입력해야 함) */
    color = 'rgba(200, 200, 200, 0.99)';
    /** @type {boolean} 도형 내부 채움 여부 (false 시 테두리만 그려짐) */
    fill = true;
    /** @type {number} 폭발 (강조) 효과의 현재 진행 단계 */
    explosing = 0;
    /** @type {number} 폭발 (강조) 효과의 최종 진행 단계 */
    explosingMax = 8;
    /** @type {number} 폭발 (강조) 효과의 진행 속도 */
    explosingSpeed = 1;
    /**
     * 인스턴스 초기화
     */
    constructor() {
        this.uniqueSerial = 10000000 + ShuttingStarsUtility.randomInt() + (ShuttingStarsUtility.randomInt() * 10000); // 고유값
    }
    /**
     * draw 대상을 화면에 렌더링
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     */
    draw(ctx) {
        if(this.hidden) return;
        if(this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(_shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y, true), _shuttingstarcore.convertX(this.r), 0, 2 * Math.PI);

            if(this.fill) {
                ctx.fillStyle = _shuttingstarcore.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + this.modifyExplosiveOpacity() + ')');
                ctx.fill();
            } else {
                ctx.strokeStyle = _shuttingstarcore.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + this.modifyExplosiveOpacity() + ')');
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        } else if(this.shape == 'rect') {
            if(this.fill) {
                ctx.fillStyle = _shuttingstarcore.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + this.modifyExplosiveOpacity() + ')');
                ctx.fillRect(_shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y, true), _shuttingstarcore.convertX(this.r), _shuttingstarcore.convertY(this.h));
            } else {
                ctx.strokeStyle = _shuttingstarcore.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + this.modifyExplosiveOpacity() + ')');
                ctx.lineWidth = 1;
                ctx.strokeRect(_shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y, true), _shuttingstarcore.convertX(this.r), _shuttingstarcore.convertY(this.h));
            }
        }

        if(this.tail) {
            for(let idx=this.beforeLocations.length-1; idx>=0; idx--) {
                if(idx % 4 != 0) continue;
                const beforeLoc = this.beforeLocations[idx];
                if(this.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(_shuttingstarcore.convertX(beforeLoc.x), _shuttingstarcore.convertY(beforeLoc.y, true), _shuttingstarcore.convertX(this.r), 0, 2 * Math.PI);

                    if(this.fill) {
                        ctx.fillStyle = _shuttingstarcore.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + (this.modifyExplosiveOpacity() / 2) + ')');
                        ctx.fill();
                    } else {
                        ctx.strokeStyle = _shuttingstarcore.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + (this.modifyExplosiveOpacity() / 2) + ')');
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                } else if(this.shape == 'rect') {
                    if(this.fill) {
                        ctx.fillStyle = _shuttingstarcore.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + (this.modifyExplosiveOpacity() / 2) + ')');
                        ctx.fillRect(_shuttingstarcore.convertX(beforeLoc.x), _shuttingstarcore.convertY(beforeLoc.y, true), _shuttingstarcore.convertX(this.r), _shuttingstarcore.convertY(this.h));
                    } else {
                        ctx.strokeStyle = _shuttingstarcore.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + (this.modifyExplosiveOpacity() / 2) + ')');
                        ctx.lineWidth = 1;
                        ctx.strokeRect(_shuttingstarcore.convertX(beforeLoc.x), _shuttingstarcore.convertY(beforeLoc.y, true), _shuttingstarcore.convertX(this.r), _shuttingstarcore.convertY(this.h));
                    }
                }
            }
            
        }
    }

    /**
     * modifyExplosiveColor 관련 상태를 갱신
     * @param {number} gradientIndex gradientIndex 값
     * @returns {string} 처리 결과
     */
    modifyExplosiveColor(gradientIndex) {
        return this.color;
    }

    /**
     * 폭발 진행 상태를 반영한 불투명도를 계산
     * @returns {number} 현재 불투명도
     */
    modifyExplosiveOpacity() {
        let opa = this.opacity;
        if(this.explosing >= 1) {
            opa = 1.0 - (this.explosing * 1.0 / this.explosingMax);
        }
        return opa;
    }

    /**
     * 다른 객체와 적정거리 이내 접근 감지 (수직 충돌만 감지) 접근이 감지된 경우 두 객체간의 수직거리를 양수로 반환, 그외의 경우 음수를 반환
     * @param {ShuttingStarsObject} otherObject otherObject 값
     * @returns {number} 두 객체 사이의 수직 거리. 범위를 벗어나면 음수
     */
    isMeetVerticalRangeIn(otherObject) {
        if(((this instanceof NotePlacer) && (otherObject instanceof Note)) || ((this instanceof Note) && (otherObject instanceof NotePlacer))) {
            const distance = Math.abs(this.y - otherObject.y);

            if(distance < (this.r + otherObject.r) * _shuttingstarcore.noteSpeedMultiplier * (_shuttingstarcore.noteSpeedFixedConst * 4)) return distance;
            return -1;
        }
        return -1;
    }

    /**
     * 다른 객체와의 충돌 감지 (수평 좌표는 동일하다고 가정하여 수직 충돌만 감지)
     * @param {ShuttingStarsObject} otherObject otherObject 값
     * @returns {boolean} 처리 결과
     */
    isConflictedVertical(otherObject) {
        if(this.shape === 'circle' && otherObject.shape === 'circle') {
            const distance = Math.abs(this.y - otherObject.y);
            return distance < this.r + otherObject.r;
        } else if(this.shape == 'rect' && otherObject.shape == 'rect') {
            return !(this.y + this.h < otherObject.y || this.y > otherObject.y + otherObject.h);
        } else if(this.shape == 'circle' && otherObject.shape == 'rect') {
            const closestY = Math.max(otherObject.y, Math.min(this.y, otherObject.y + otherObject.h));
            const dy = this.y - closestY;
            return (dy * dy) < (this.r * this.r);
        } else if(this.shape == 'rect' && otherObject.shape == 'circle') {
            const closestY = Math.max(this.y, Math.min(otherObject.y, this.y + this.h));
            const dy = otherObject.y - closestY;
            return (dy * dy) < (otherObject.r * otherObject.r);
        }
        return false;
    }

    /**
     * 다른 객체와의 충돌 감지
     * @param {ShuttingStarsObject} otherObject otherObject 값
     * @returns {boolean} 처리 결과
     */
    isConflicted(otherObject) {
        if(this.shape === 'circle' && otherObject.shape === 'circle') {
            const dx = this.x - otherObject.x;
            const dy = this.y - otherObject.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < this.r + otherObject.r;
        } else if(this.shape == 'rect' && otherObject.shape == 'rect') {
            return !(this.x + this.r < otherObject.x || 
                     this.x > otherObject.x + otherObject.r || 
                     this.y + this.h < otherObject.y || 
                     this.y > otherObject.y + otherObject.h);
        } else if(this.shape == 'circle' && otherObject.shape == 'rect') {
            const closestX = Math.max(otherObject.x, Math.min(this.x, otherObject.x + otherObject.r));
            const closestY = Math.max(otherObject.y, Math.min(this.y, otherObject.y + otherObject.h));
            const dx = this.x - closestX;
            const dy = this.y - closestY;
            return (dx * dx + dy * dy) < (this.r * this.r);
        } else if(this.shape == 'rect' && otherObject.shape == 'circle') {
            const closestX = Math.max(this.x, Math.min(otherObject.x, this.x + this.r));
            const closestY = Math.max(this.y, Math.min(otherObject.y, this.y + this.h));
            const dx = otherObject.x - closestX;
            const dy = otherObject.y - closestY;
            return (dx * dx + dy * dy) < (otherObject.r * otherObject.r);
        }
        return false;
    }
}

/** Note 제거기 혹은 Note 그 자체의 상위 클래스, "키"를 가짐 */
class NoteKeyObject extends ShuttingStarsObject {
    /** @type {string} 입력 키 */
    key = '';
    /** @type {number} 라인 번호 */
    locationIndex = 0;
    /** @type {boolean} 다크 모드 */
    dark = false;
    /**
     * 인스턴스 초기화
     * @param {number} locationIndex 노트 라인 번호
     */
    constructor(locationIndex) {
        super();
        this.locationIndex = locationIndex;
        this.key = _shuttingstarcore.keyList[locationIndex];
        this.color = this.getColorOfLocationIndex(locationIndex);
    }
    /**
     * 현재 효과 진행 상태를 반영한 불투명도를 반환
     * @returns {number} 현재 불투명도
     */
    getNowOpacity() {
        return this.opacity * (1.0 - (this.explosing * 1.0 / this.explosingMax));
    }
    /**
     * draw 대상을 화면에 렌더링
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     */
    draw(ctx) {
        super.draw(ctx);
        if(this.hidden) return;

        // 키 표시 (중앙에 출력하며, 크기는 내부에 들어오도록 폰트 크기 계산해야 함)
        let fontSize = _shuttingstarcore.convertFontSize(Math.round(this.r / 1.1));
        ctx.font = 'bold ' + fontSize + 'px ' + _shuttingstarcore.getRenderFontFamily();

        // 글자 출력
        if(this.dark) ctx.fillStyle = _shuttingstarcore.convertColor('rgba(200, 200, 200, ' + this.getNowOpacity() + ')');
        else          ctx.fillStyle = _shuttingstarcore.convertColor('rgba(80, 80, 80, ' + this.getNowOpacity() + ')');

        ctx.textAlign = "center";
        ctx.fillText(this.key, _shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y + (fontSize / 4.0), true)); // Note 중앙에 출력
    }
    /**
     * 라인 별 컬러
     * @param {number} locationIndex 노트 레인의 인덱스
     * @param {number} gradientIndex gradientIndex 값
     * @returns {string} RGB 색상 문자열
     */
    getColorOfLocationIndex(locationIndex, gradientIndex) {
        if(typeof(gradientIndex) == 'undefined') gradientIndex = 0;
        if(gradientIndex < 0) gradientIndex = 0;
        if(gradientIndex > 3) gradientIndex = 3;
        let r, g, b;

        // 총 6개의 라인, 순서대로 빨주노초파남
        if(locationIndex == 0) {
            r = 180;
            g = 80;
            b = 180;
        } else if(locationIndex == 1) {
            r = 230;
            g = 180;
            b = 80;
        } else if(locationIndex == 2) {
            r = 230;
            g = 230;
            b = 80;
        } else if(locationIndex == 3) {
            r = 180;
            g = 230;
            b = 80;
        } else if(locationIndex == 4) {
            r = 80;
            g = 230;
            b = 80;
        } else if(locationIndex == 5) {
            r = 80;
            g = 230;
            b = 230;
        } else {
            r = 200;
            g = 200;
            b = 200;
        }

        if(gradientIndex >= 1) {
            return this.applyGradientIndex(r, g, b, gradientIndex);
        }

        return r + ', ' + g + ', ' + b;
    }
    /**
     * RGB 색상에 지정한 그라데이션 단계를 적용
     * @param {number} r r 값
     * @param {number} g g 값
     * @param {number} b b 값
     * @param {number} gradientIndex gradientIndex 값
     * @returns {string} 그라데이션이 적용된 RGB 색상 문자열
     */
    applyGradientIndex(r, g, b, gradientIndex) {
        if(gradientIndex >= 1) {
            r = r + Math.floor(((250 - r) / 7.0) * (gradientIndex + 1));
            g = g + Math.floor(((250 - g) / 7.0) * (gradientIndex + 1));
            b = b + Math.floor(((250 - b) / 7.0) * (gradientIndex + 1));
        }
        return r + ', ' + g + ', ' + b;
    }
    /**
     * modifyExplosiveColor 관련 상태를 갱신
     * @param {number} gradientIndex gradientIndex 값
     * @returns {string} 처리 결과
     */
    modifyExplosiveColor(gradientIndex) {
        if(this.explosing >= 3) return '255, 255, 255';
        return this.getColorOfLocationIndex(this.locationIndex, gradientIndex);
    }
}

/** Note 제거기, 화면 내 고정위치에 떠 있으며, 플레이어가 해당 키 입력 시, 해당 위치를 지나는 노트를 제거하며 점수를 획득함. 또한 노트와 위치가 얼마나 동일한지에 따라 점수 계산 */
class NotePlacer extends NoteKeyObject {
    /**
     * 인스턴스 초기화
     * @param {number} locationIndex 노트 레인의 인덱스
     */
    constructor(locationIndex) {
        super(locationIndex);
        this.r = _shuttingstarcore.getNoteRadius();
        this.x = (this.r * 4) + Math.round(locationIndex * this.r * 2.5) + _shuttingstarcore.getLeftMarginNote();
        this.y = _shuttingstarcore.getNotePlacerYLocation();
        this.key = _shuttingstarcore.keyList[locationIndex];
        this.shape = 'circle';
        this.opacity = 0.2;
        this.dark = true;
        this.color = this.getColorOfLocationIndex(locationIndex);
        this.fill = false;
        this.hidden = false;
    }
}

/** 노트, 곡 패턴에 따라 화면 최하단에 생성되며 위로 올라감. */
class Note extends NoteKeyObject {
    /** @type {boolean} 노트 처리 여부를 지정, true 여도 아직 삭제된 것이 아니므로 (충돌효과 중) 렌더링은 해야 함 */
    removed = false;
    /** @type {boolean} 미스로 인해 처리되는 경우를 표시 */
    missed = false;

    // 게임 처리 중 초기화됨
    /** @type {number} 노트를 생성한 패턴의 식별자 */
    patternId = 0;   
    /** @type {number} 보정 전 원래 노트 타이밍 */
    originalTiming = 0;

    // 이동할 때마다 콘솔로 위치를 띄울 것인지 지정
    /** @type {boolean} 디버그 강조 대상 여부 */
    debugTarget = false;

    // 생성자
    /**
     * 인스턴스 초기화
     * @param {number} locationIndex 노트 레인의 인덱스
     */
    constructor(locationIndex) {
        super(locationIndex);
        this.r = _shuttingstarcore.getNoteRadius();
        this.speedY = 0;
        this.removed = false;
        this.explosing = 0;
        this.hidden = false;
        this.tail = false; // TODO
        
        // NotePlacer 찾기
        let notePlacer = _shuttingstarcore.getNotePlacer(locationIndex);
        if(notePlacer == null) { this.explosing = this.explosingMax; return; }

        this.x = notePlacer.x;

        // 노트 속도 비활성화 - 이제 노트를 패턴 시간에 맞게 생성하지 않고 미리 쫙 생성한 다음 시간대에 맞춰 위치를 조정함
        // NOTE SPEED 관련
        // this.speedY = _shuttingstarcore.getNoteMoveSpeed();
        this.y = _shuttingstarcore.getNoteCreationYLocation() * 2;

        this.key = _shuttingstarcore.keyList[locationIndex];
        this.shape = 'circle';
        this.opacity = 0.9;
        this.color = this.getColorOfLocationIndex(locationIndex);
    }
    /**
     * 현재 효과 진행 상태를 반영한 불투명도를 반환합니다.
     * @returns {number} 현재 불투명도
     */
    getNowOpacity() {
        // 0.9 부터 시작하여 급격히 감소
        if(this.explosing <= 0) {
            return this.opacity;
        } else {
            let opa = this.opacity - (this.explosing * 0.3);
            if(opa < 0) opa = 0;
            return opa;
        }
    }

    /**
     * modifyExplosiveColor 관련 상태를 갱신합니다.
     * @param {number} gradientIndex gradientIndex 값
     * @returns {string} 처리 결과
     */
    modifyExplosiveColor(gradientIndex) {
        if(this.explosing >= 3) {
            if(this.missed) {
                return '255, 0, 0';
            } else {
                return '255, 255, 255';   
            }
        }
        return this.getColorOfLocationIndex(this.locationIndex, gradientIndex);
    }

    /**
     * draw 대상을 화면에 렌더링합니다.
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     */
    draw(ctx) {
        super.draw(ctx);
        if(this.hidden) return;

        // 꼬리 먼저 그리기
        if(this.tail) {
            let tailR   = 0.5;
            let tailOpa = this.modifyExplosiveOpacity();
            let calculatedR = 0;
            for(let jdx=this.beforeLocations.length-1; jdx>=0; jdx--) {
                tailR   = tailR   - 0.0625;
                tailOpa = tailOpa * 0.5;

                if(jdx % 4 == 0) continue;
                if(tailR <= 0) continue;
                if(tailOpa <= 0) continue;

                const beforeLoc = this.beforeLocations[jdx];
                for(let idx=0; idx<=3; idx++) {
                    calculatedR = Math.floor(_shuttingstarcore.convertX(this.r - idx) * tailR);
                    if(calculatedR <= 0) break;

                    ctx.beginPath();
                    ctx.arc(_shuttingstarcore.convertX(beforeLoc.x), _shuttingstarcore.convertY(beforeLoc.y, true), calculatedR, 0, 2 * Math.PI);

                    if(this.fill) {
                        ctx.fillStyle = _shuttingstarcore.convertColor('rgba(' + this.modifyExplosiveColor(idx) + ', ' + tailOpa + ')');
                        ctx.fill();
                    } else {
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = _shuttingstarcore.convertColor('rgba(' + this.modifyExplosiveColor(idx) + ', ' + tailOpa + ')');
                        ctx.stroke();
                    }
                }
            }
        }
        
        // 본 노트 그리기
        for(let idx=0; idx<=3; idx++) {
            ctx.beginPath();
            ctx.arc(_shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y, true), _shuttingstarcore.convertX(this.r - idx), 0, 2 * Math.PI);

            if(this.fill) {
                ctx.fillStyle = _shuttingstarcore.convertColor('rgba(' + this.modifyExplosiveColor(idx) + ', ' + this.modifyExplosiveOpacity() + ')');
                ctx.fill();
            } else {
                ctx.lineWidth = 1;
                ctx.strokeStyle = _shuttingstarcore.convertColor('rgba(' + this.modifyExplosiveColor(idx) + ', ' + this.modifyExplosiveOpacity() + ')');
                ctx.stroke();
            }

            if(this.r - idx <= 3) break;
        }

        // 키 표시 (중앙에 출력하며, 크기는 내부에 들어오도록 폰트 크기 계산해야 함)
        if(this.explosing < 2) {
            let fontSize = _shuttingstarcore.convertFontSize(Math.round(this.r / 1.1));
            ctx.font = 'bold ' + fontSize + 'px ' + _shuttingstarcore.getRenderFontFamily();

            if(this.dark) ctx.fillStyle = _shuttingstarcore.convertColor('rgba(200, 200, 200, ' + this.getNowOpacity() + ')');
            else          ctx.fillStyle = _shuttingstarcore.convertColor('rgba(80, 80, 80, ' + this.getNowOpacity() + ')');

            ctx.textAlign = "center";
            ctx.fillText(this.key, _shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y + (fontSize / 4.0), true)); // Note 중앙에 출력
        }
    }
}

/** 판정 글씨와 콤보 마크 */
class JudgeMark extends ShuttingStarsObject {
    /** @type {string|null} PERFECT / GREAT / GOOD / BAD / MISS */
    judgeResult = null;
    /** @type {number} 폭발 효과의 현재 진행 단계 */
    explosing = 1;
    /** @type {number} 폭발 효과의 마지막 진행 단계 */
    explosingMax = 16;
    /**
     * 인스턴스를 초기화합니다.
     * @param {string} judgeResult judgeResult 값
     */
    constructor(judgeResult) {
        super();
        this.judgeResult = judgeResult;
    }

    /**
     * draw 대상을 화면에 렌더링합니다.
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     */
    draw(ctx) {
        // explosing 에 따른 폰트 크기 조절
        let dynamicFontSize = 26;
        if(this.explosing >=  3) dynamicFontSize--;
        if(this.explosing >=  5) dynamicFontSize--;
        if(this.explosing >=  7) dynamicFontSize--;
        if(this.explosing >=  9) dynamicFontSize--;
        if(this.explosing >= 11) dynamicFontSize--;
        if(this.explosing >= 13) dynamicFontSize--;

        // 화면에 판정 결과 띄우기
        let fontSize = _shuttingstarcore.convertFontSize(dynamicFontSize);
        ctx.font = 'bold ' + fontSize + 'px ' + _shuttingstarcore.getRenderFontFamily();

        let opa = this.getNowOpacity();
        ctx.fillStyle = _shuttingstarcore.convertColor('rgba(' + _shuttingstarcore.judgeMarkColor(this.judgeResult) + ', ' + opa + ')');
        
        // 노트들 중앙에 출력
        let midX = 0;
        let midY = _shuttingstarcore.getStageHeight() / 2;
        let notePlacers = _shuttingstarcore.getNotePlacers();

        for(let idx=0; idx<notePlacers.length; idx++) {
            midX += notePlacers[idx].x;
        }
        midX = midX / notePlacers.length;

        ctx.fillText(this.judgeResult, _shuttingstarcore.convertX(midX), _shuttingstarcore.convertY(midY));

        let combo = _shuttingstarcore.combo;
        if(this.judgeResult == 'MISS') combo = _shuttingstarcore.missCombo;

        // 콤보 띄우기
        if(combo > 1) {
            fontSize = _shuttingstarcore.convertFontSize(15);
            ctx.font = 'normal ' + fontSize + 'px ' + _shuttingstarcore.getRenderFontFamily();
            if(this.judgeResult == 'MISS') {
                ctx.fillStyle = _shuttingstarcore.convertColor('rgba(255, 0, 0, ' + opa + ')');
            } else {
                if(_shuttingstarcore.dark) ctx.strokeStyle = _shuttingstarcore.convertColor('rgba(230, 230, 230, ' + opa + ')');
                else ctx.fillStyle = _shuttingstarcore.convertColor('rgba(80, 80, 80, ' + opa + ')');
            }
            ctx.fillText('COMBO ' + combo, _shuttingstarcore.convertX(midX), _shuttingstarcore.convertY(midY + 30)); // 판정 결과 아래에 출력
        }
    }

    /**
     * 현재 효과 진행 상태를 반영한 불투명도 반환
     * @returns {number} 현재 불투명도
     */
    getNowOpacity() {
        let opa = 0.9;
        if(this.explosing >= 3) opa -= 0.2;
        if(this.explosing >= 4) opa -= 0.3;
        if(this.explosing >= 5) opa -= 0.4;
        if(this.explosing >= 6) opa -= (0.03 * (this.explosing - 5));
        if(opa < 0) opa = 0;
        this.opacity = opa;
        return opa;
    }

    /**
     * 다른 객체와의 충돌 감지 (수평 좌표는 동일하다고 가정하여 수직 충돌만 감지) - 판정 마크는 충돌 없음
     * @param {ShuttingStarsObject} otherObject otherObject 값
     * @returns {boolean} 처리 결과
     */
    isConflictedVertical(otherObject) {
        return false;
    }

    /**
     * 다른 객체와의 충돌 감지 - 판정 마크는 충돌 없음
     * @param {ShuttingStarsObject} otherObject otherObject 값
     * @returns {boolean} 처리 결과
     */
    isConflicted(otherObject) {
        return false;
    }
}

/** 마우스 클릭 지점 확인을 위한 객체 (충돌여부 판단을 통해 해당 객체를 클릭했음을 인식) */
class MouseEventArea extends ShuttingStarsObject {

}

/** 장식용 상위 객체 */
class DecorationObject extends ShuttingStarsObject {
    /** @type {string} 폭발 효과가 정점일 때 사용할 색상 */
    peakColor = '255, 255, 255';
    /** @type {string} 장식 객체의 렌더링 우선순위 */
    priority = 'low';
    /**
     * 인스턴스를 초기화합니다.
     * @param {number} locationIndex 라인 번호
     */
    constructor(locationIndex) {
        super(locationIndex);
    }
}

/** 장식용 별빛 객체 */
class Starlight extends DecorationObject {
    /**
     * 인스턴스 초기화
     */
    constructor() {
        super(0);
        this.r = Math.round(ShuttingStarsUtility.random() * 3.0) + 1;
        this.x = Math.round(ShuttingStarsUtility.random() * _shuttingstarcore.getStageWidth());
        this.y = Math.round(ShuttingStarsUtility.random() * _shuttingstarcore.getStageHeight());
        this.shape = 'circle';
        this.opacity = 0.5 + (0.49 * ShuttingStarsUtility.random());
        this.color = '255, 255, 255';
        this.priority = 'low';
        this.dark = false;
        this.fill = true;
        this.speedX = 0;
        this.speedY = 0;
        this.explosing = 0;
    }
}

/** 장식용 폭발 객체 */
class ExplosingObject extends DecorationObject {
    /**
     * 인스턴스 초기화
     * @param {number} locationIndex 노트 레인의 인덱스
     * @param {number} y y 값
     * @param {string} color color 값
     * @param {string} peakColor peakColor 값
     */
    constructor(locationIndex, y, color, peakColor) {
        super(locationIndex);
        this.peakColor = '255, 255, 255';
        this.priority = 'high';
        this.r = _shuttingstarcore.getNoteRadius();
        this.x = (this.r * 4) + Math.round(locationIndex * this.r * 2.5) + _shuttingstarcore.getLeftMarginNote();
        this.y = y;
        this.key = _shuttingstarcore.keyList[locationIndex];
        this.shape = 'circle';
        this.opacity = 0.1;
        this.color = color; // 255, 0, 0 과 같이 rgb 정수와 쉼표만 들어가야 함
        this.dark = false;
        this.fill = true;
        this.speedX = 0;
        this.speedY = 0;
        this.explosing = 1; // 폭발 객체이므로

        if(peakColor) {
            this.peakColor = peakColor;
        }
    }

    /**
     * draw 대상을 화면에 렌더링
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     */
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(_shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y, true), _shuttingstarcore.convertX(this.modifyExplosiveR()), 0, 2 * Math.PI);

        ctx.fillStyle = _shuttingstarcore.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + this.modifyExplosiveOpacity() + ')');
        ctx.fill();
    }

    /**
     * 폭발 진행 상태를 반영한 반지름을 계산
     * @returns {number} 현재 폭발 반지름
     */
    modifyExplosiveR() {
        let r = this.r;
        let max = this.r * 1.5;
        // this.explosing 값이 0~5 일 때는 r 값이 점진적으로 증가 (최대 1.5배까지), 이후 6~8 까지는 점진적으로 감소 (0까지)
        r = ((max - this.r) / 5.0) * this.explosing + this.r;
        if(this.explosing >= 6) {
            r = r - (max / 3.0);
            if(r < 0) r = 0;
        }

        return r;
    }

    /**
     * modifyExplosiveColor 관련 상태를 갱신
     * @returns {string} 처리 결과
     */
    modifyExplosiveColor() {
        let color = this.color;
        let splits = color.split(',');
        let eplits = this.peakColor.split(',');
        let r, g, b, er, eg, eb;

        r = parseInt(String(splits[0]).trim());
        g = parseInt(String(splits[1]).trim());
        b = parseInt(String(splits[2]).trim());

        er = parseInt(String(eplits[0]).trim());
        eg = parseInt(String(eplits[1]).trim());
        eb = parseInt(String(eplits[2]).trim());

        let oroginalR = r;
        let oroginalG = g;
        let oroginalB = b;

        let rd = er - r;
        let gd = eg - g;
        let bd = eb - b;

        // this.explosing 값이 0~5 일 때는 밝기가 점진적으로 증가 (255, 255, 255 까지) 이후 고정
        if(this.explosing <= 5) {
            r = oroginalR + ((rd / 5.0) * (this.explosing));
            g = oroginalG + ((gd / 5.0) * (this.explosing));
            b = oroginalB + ((bd / 5.0) * (this.explosing));
        } else if(this.explosing >= 6) {
            r = er - ((rd / 3.0) * (this.explosing - 5));
            g = eg - ((gd / 3.0) * (this.explosing - 5));
            b = eb - ((bd / 3.0) * (this.explosing - 5));
        }

        r = Math.floor(r);
        g = Math.floor(g);
        b = Math.floor(b);

        color = '' + r + ', ' + g + ', ' + b;

        return color;
    }

    /**
     * 폭발 진행 상태를 반영한 불투명도를 계산
     * @returns {number} 현재 불투명도
     */
    modifyExplosiveOpacity() {
        let opa = this.opacity;
        let d = 1.0 - opa;
        // this.explosing 값이 0~5 일 때는 밝기가 점진적으로 증가 1.0까지 이후 6~8 에서 0까지 점진적으로 감소
        if(this.explosing <= 5) {
            opa = opa + ((d / 5.0) * this.explosing);
        } else if(this.explosing >= 6) {
            opa = 1 - (0.33 * (this.explosing - 5));
        }

        return opa;
    }
}

/** 노트 명중 효과 */
class CorrectNoteExplosing extends ExplosingObject {
    /**
     * 인스턴스를 초기화합니다.
     * @param {number} locationIndex 라인 번호
     * @param {number} y y 값
     * @param {string} color color 값
     * @param {string} peakColor peakColor 값
     */
    constructor(locationIndex, y, color, peakColor) {
        super(locationIndex, y, color, peakColor);
    }
}

/** 노트 미스 폭발 효과 */
class FailExplosing extends ExplosingObject {
    /**
     * 인스턴스 초기화
     * @param {number} locationIndex 라인 번호
     * @param {number} y y 값
     * @param {string} color color 값
     * @param {string} peakColor peakColor 값
     */
    constructor(locationIndex, y, color, peakColor) {
        super(locationIndex, y, color, peakColor);
    }
}

/** 게임오버 최종 폭발 효과 */
class PlanetExplosing extends ExplosingObject {
    /**
     * 인스턴스 초기화
     * @param {number} locationIndex 라인 번호
     * @param {number} y y 값
     * @param {string} color color 값
     * @param {string} peakColor peakColor 값
     */
    constructor(locationIndex, y, color, peakColor) {
        super(locationIndex, y, color, peakColor);
    }
}

/** 마우스 클릭 표시 */
class MouseClickHighlighter extends ExplosingObject {
    /**
     * 인스턴스를 초기화합니다.
     */
    constructor() {
        super(0, 0, '255,255,255', '255,255,255');
    }
}

/** 텍스트 출력 장식 */
class TextDeco extends DecorationObject {
    /** @type {string} 화면에 출력할 텍스트 */
    text = '';
    /** @type {number} 텍스트 렌더링에 사용할 글꼴 크기 */
    fontSize = 10;
    /** @type {string} 텍스트의 수평 정렬 방식 */
    align = 'center';
    /**
     * 인스턴스를 초기화합니다.
     * @param {string} text text 값
     * @param {number} x x 값
     * @param {number} y y 값
     * @param {number} fontSize fontSize 값
     * @param {CanvasTextAlign} align align 값
     * @param {string} color color 값
     */
    constructor(text, x, y, fontSize, align, color) {
        super(locationIndex);
        this.key = _shuttingstarcore.keyList[locationIndex];
        this.priority = 'high';
        this.r = 0;
        this.x = x;
        this.y = y;
        this.text = text;
        this.fontSize = fontSize;
        this.align = align;
        this.shape = 'circle';
        this.opacity = 1.0;
        this.color = color; // 255, 0, 0 과 같이 rgb 정수와 쉼표만 들어가야 함
        this.peakColor = color;
        this.dark = false;
        this.fill = true;
        this.speedX = 0;
        this.speedY = 0;
        this.explosing = 1;
    }

    /**
     * 현재 효과 진행 상태를 반영한 불투명도를 반환
     * @returns {number} 현재 불투명도
     */
    getNowOpacity() {
        let opa = 0.9;
        if(this.explosing >= 3) opa -= 0.2;
        if(this.explosing >= 4) opa -= (0.02 * (this.explosing - 3));
        if(opa < 0) opa = 0;
        this.opacity = opa;
        return opa;
    }

    /**
     * draw 대상을 화면에 렌더링
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     */
    draw(ctx) {
        this.ctx.textAlign = this.align;
        this.ctx.fillStyle = this.convertColor('rgba(' + this.color + ', ' + this.getNowOpacity() + ')');
        this.ctx.fillText(this.text, this.convertX(this.x), this.convertY(this.y));
    }
}

/** 가상 키 객체 */
class VirtualKey extends DecorationObject {
    /** @type {string} 객체에 연결된 입력 키 */
    key = 'S';
    /** @type {number} 텍스트 렌더링에 사용할 글꼴 크기 */
    fontSize = 30;
    /** @type {number} 가상 키의 가로 여백 */
    wGap = 12;
    /** @type {number} 가상 키의 세로 여백 */
    hGap = 12;
    /** @type {Function} 가상 키를 누를 때 호출할 콜백 */
    click = function() {};
    /** @type {Function} 가상 키를 놓을 때 호출할 콜백 */
    release = function() {}
    /**
     * 인스턴스 초기화
     * @param {string} key 입력 또는 해제된 키
     */
    constructor(key) {
        super(0);

        const charUnitW = (this.fontSize * 2) + this.wGap;
        const charUnitH = (this.fontSize * 2) + this.hGap;
        const charUnitWP = Math.round(charUnitW * 1);
        const charUnitHP = Math.round(charUnitH * 1.5);

        this.key = key;
        this.shape = 'circle';
        this.x = 0;
        this.y = Math.round(_shuttingstarcore.getStageHeight() - (_shuttingstarcore.getStageHeight() / 9.0));
        this.r = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.opacity = 0.9;
        if(_shuttingstarcore.dark) {
            this.color = '200, 200, 200';
            this.peakColor = '255, 255, 255';
        } else {
            this.color = '100, 100, 100';
            this.peakColor = '50, 50, 50';
        }
        this.fill = true;
        this.priority = 'high';
        this.explosing = 0;
        this.explosing = 2;
        this.fontSize = _shuttingstarcore.convertFontSize(this.fontSize);
        this.x = Math.round((_shuttingstarcore.getStageWidth() / 2.0) - (charUnitW * 3.0));
        this.r = Math.round(charUnitW / 2.0);

        if(this.key == _shuttingstarcore.keyList[0]) { // S
            this.y -= charUnitH;
        } else if(this.key == _shuttingstarcore.keyList[1]) { // D
            this.x += charUnitWP;
            this.y -= charUnitH;
        } else if(this.key == _shuttingstarcore.keyList[2]) { // F
            this.x += (charUnitWP * 2);
            this.y -= charUnitH;
        } else if(this.key == _shuttingstarcore.keyList[3]) { // H
            this.x += (charUnitWP * 3);
            this.y -= charUnitH;
        } else if(this.key == _shuttingstarcore.keyList[4]) { // J
            this.x += (charUnitWP * 4);
            this.y -= charUnitH;
        } else if(this.key == _shuttingstarcore.keyList[5]) { // K
            this.x += (charUnitWP * 5);
            this.y -= charUnitH;
        } else if(this.key == _shuttingstarcore.arrowKeys[0]) { // UP
            this.x = Math.round(_shuttingstarcore.getStageWidth()  * 2.0 / 4.0);
            this.y = Math.round(_shuttingstarcore.getStageHeight() * 9.0 / 10.0) - charUnitH;
        } else if(this.key == _shuttingstarcore.arrowKeys[1]) { // DOWN
            this.x = Math.round(_shuttingstarcore.getStageWidth()  * 2.0 / 4.0);  // UP과 동일
            this.y = Math.round(_shuttingstarcore.getStageHeight() * 9.0 / 10.0); // UP보다 한 칸 아래
        } else if(this.key == _shuttingstarcore.arrowKeys[2]) { // LEFT
            this.x = Math.round(_shuttingstarcore.getStageWidth()  * 2.0 / 4.0) - charUnitW;  // DOWN 보다 한 칸 왼쪽
            this.y = Math.round(_shuttingstarcore.getStageHeight() * 9.0 / 10.0);
        } else if(this.key == _shuttingstarcore.arrowKeys[3]) { // RIGHT
            this.x = Math.round(_shuttingstarcore.getStageWidth()  * 2.0 / 4.0) + charUnitW;  // DOWN 보다 한 칸 오른쪽
            this.y = Math.round(_shuttingstarcore.getStageHeight() * 9.0 / 10.0);
        } else if(this.key == _shuttingstarcore.escKey) {
            this.x = Math.round(_shuttingstarcore.getStageWidth()   * 9.0 / 10.0);
            this.y = Math.round(_shuttingstarcore.getStageHeight()  * 1.0 / 10.0) + charUnitH;
        } else if(this.key == _shuttingstarcore.enterKey) {
            this.x = Math.round(_shuttingstarcore.getStageWidth()   * 9.0 / 10.0);
            this.y = Math.round(_shuttingstarcore.getStageHeight()  * 1.0 / 10.0);
        }
    }
    /**
     * 현재 효과 진행 상태를 반영한 불투명도를 반환
     * @returns {number} 현재 불투명도
     */
    getNowOpacity() {
        return this.opacity * (1.0 - (this.explosing * 1.0 / this.explosingMax));
    }
    /**
     * draw 대상을 화면에 렌더링
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     */
    draw(ctx) {
        if(! _shuttingstarcore.virtualKey) return;
        if(_shuttingstarcore.state == 'title' || _shuttingstarcore.state == 'songtitle') return;

        super.draw(ctx);

        // 중앙에 가상키 글자를 찍기
        //    먼저 글자 컬러 세팅
        if(_shuttingstarcore.dark) {
            ctx.fillStyle = _shuttingstarcore.convertColor('rgba(0, 0, 0, ' + this.getNowOpacity() + ')');
        } else {
            ctx.fillStyle = _shuttingstarcore.convertColor('rgba(255, 255, 255, ' + this.getNowOpacity() + ')');
        }
        //    글자 폰트 세팅
        ctx.font = 'bold ' + this.fontSize + 'px ' + _shuttingstarcore.getRenderFontFamily();

        let label = this.key;
        if(     label == 'ARROWUP'   ) label = '▲';
        else if(label == 'ARROWDOWN' ) label = '▼';
        else if(label == 'ARROWLEFT' ) label = '◀';
        else if(label == 'ARROWRIGHT') label = '▶';
        else if(label == 'ENTER'     ) label = 'ENT';
        else if(label == 'ESCAPE'    ) label = 'ESC';

        //    출력
        ctx.textAlign = 'center';
        ctx.fillText(label, _shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y) + _shuttingstarcore.convertY(this.fontSize / 4.0));
    }
}

/** 2D 오디오 시각화 공통 클래스 */
class Audio2DVisualizer {
    /** @type {number} 시각화 각 필드 길이 배수 */
    sizeMultiplier = 2.2;
    /** @type {number} 원의 반지름 또는 사각형의 너비 */
    r = 0;
    /** @type {number} 컬러 GREEN */
    g = 0;
    /** @type {number} 컬러 BLUE */
    b = 0;
    /** @type {number} 객체의 불투명도 */
    opacity = 0.3;
    /**
     * 인스턴스를 초기화합니다.
     */
    constructor() {}
    /**
     * draw 대상을 화면에 렌더링
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     * @param {number} canvasWidth canvasWidth 값
     * @param {number} canvasHeight canvasHeight 값
     * @param {Uint8Array} realtimeAudioBuffer realtimeAudioBuffer 값
     * @param {number} realtimeAudioBufferLength realtimeAudioBufferLength 값
     * @param {number} elapsedTime 게임 진행 시간
     * @param {number} hp 현재 HP
     */
    draw(ctx, canvasWidth, canvasHeight, realtimeAudioBuffer, realtimeAudioBufferLength, elapsedTime, hp) {
        // 이 메소드에 시각화 구현
    }
    /**
     * 진행시간과 HP 상태에 따른 컬러 계산
     * @param {number} elapsedTime 게임 진행 시간
     * @param {number} hp 현재 HP
     */
    calculateColor(elapsedTime, hp) {
        this.r = 120;
        this.g = 150;
        this.b = 150;

        let elapsed1000 = elapsedTime % 1000;
        if(elapsed1000 >= 0 && elapsed1000 < 250) {
            this.r += 10;
            this.g += 50;
            this.b += 20;
        } else if(elapsed1000 >= 250 && elapsed1000 < 500) {
            this.r += 15;
            this.g += 30;
            this.b += 30;
        } else if(elapsed1000 >= 500 && elapsed1000 < 750) {
            this.r += 15;
            this.g += 20;
            this.b += 40;
        } else {
            this.r += 30;
            this.g += 10;
            this.b += 50;
        }

        this.r += Math.floor(( 100.0 - hp ));
        this.g -= Math.floor(( 100.0 - hp ) / 2);
        this.b -= Math.floor(( 100.0 - hp ) / 2);
    }
}

/** 바형 2D 오디오 시각화 클래스 */
class BarTypeAudio2DVisualizer extends Audio2DVisualizer {
    /**
     * 인스턴스 초기화
     */
    constructor() { super(); }
    /**
     * draw 대상을 화면에 렌더링합니다.
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     * @param {number} canvasWidth canvasWidth 값
     * @param {number} canvasHeight canvasHeight 값
     * @param {Uint8Array} realtimeAudioBuffer realtimeAudioBuffer 값
     * @param {number} realtimeAudioBufferLength realtimeAudioBufferLength 값
     * @param {number} elapsedTime 게임 진행 시간
     * @param {number} hp 현재 HP
     */
    draw(ctx, canvasWidth, canvasHeight, realtimeAudioBuffer, realtimeAudioBufferLength, elapsedTime, hp) {
        this.calculateColor(elapsedTime, hp);
        let x = 0;

        // 막대그래프형
        const barWidth = Math.round(canvasWidth * 1.0 / realtimeAudioBufferLength) * this.sizeMultiplier;
        let barHeight;
        for(let i=0; i<realtimeAudioBufferLength; i++) {
            barHeight = realtimeAudioBuffer[i]; // 0 ~ 255

            // convert ~255 to ~canvas.height
            barHeight = ((barHeight * (canvasHeight - 10) / 1.5) / 255.0) + Math.floor(Math.random() * 10);

            ctx.fillStyle = 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.opacity + ')';
            ctx.fillRect(x, canvasHeight - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }
    }
}

/** 원형 2D 오디오 시각화 클래스 */
class CircleTypeAudio2DVisualizer extends Audio2DVisualizer {
    /** @type {number} 원형 시각화의 기준 반지름 */
    radius = 100;
    /**
     * 인스턴스 초기화
     */
    constructor() { super(); }
    /**
     * draw 대상을 화면에 렌더링합니다.
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     * @param {number} canvasWidth canvasWidth 값
     * @param {number} canvasHeight canvasHeight 값
     * @param {Uint8Array} realtimeAudioBuffer realtimeAudioBuffer 값
     * @param {number} realtimeAudioBufferLength realtimeAudioBufferLength 값
     * @param {number} elapsedTime 게임 진행 시간
     * @param {number} hp 현재 HP
     */
    draw(ctx, canvasWidth, canvasHeight, realtimeAudioBuffer, realtimeAudioBufferLength, elapsedTime, hp) {
        this.calculateColor(elapsedTime, hp);
        // 중앙 위치
        const centerX = canvasWidth  / 2;
        const centerY = canvasHeight / 2;

        for(let i=0; i<realtimeAudioBufferLength; i++) {
            // 방향
            const angle = (i / realtimeAudioBufferLength) * Math.PI * 2; 

            // 막대의 시작점과 끝점
            const x1 = Math.floor(centerX + Math.cos(angle) * this.radius);
            const y1 = Math.floor(centerY + Math.sin(angle) * this.radius);
            const x2 = Math.floor(centerX + Math.cos(angle) * (this.radius + (Math.random() * 50) + (realtimeAudioBuffer[i] * this.sizeMultiplier) / 3));
            const y2 = Math.floor(centerY + Math.sin(angle) * (this.radius + (Math.random() * 50) + (realtimeAudioBuffer[i] * this.sizeMultiplier) / 3));

            ctx.strokeStyle = 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.opacity + ')';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }
}

/********************** 기타 Util 성 prototype 세팅 ************************/
if(!String.prototype.hexEncode) {
	/**
	 * 문자열의 각 UTF-16 코드 단위를 4자리 16진수 문자열로 인코딩
	 * @returns {string} 16진수로 인코딩된 문자열
	 */
	String.prototype.hexEncode = function(){
	    var hex, i;

	    var result = "";
	    for (i=0; i<this.length; i++) {
	        hex = this.charCodeAt(i).toString(16);
	        result += ("000"+hex).slice(-4);
	    }

	    return result
	}
}

if(!String.prototype.hexDecode) {
	/**
	 * 4자리 16진수 단위로 인코딩된 문자열을 원래 문자열로 디코딩
	 * @returns {string} 디코딩된 문자열
	 */
	String.prototype.hexDecode = function(){
	    var j;
	    var hexes = this.match(/.{1,4}/g) || [];
	    var back = "";
	    for(j = 0; j<hexes.length; j++) {
	        back += String.fromCharCode(parseInt(hexes[j], 16));
	    }

	    return back;
	}
}

/********************** // 기타 Util 성 prototype 세팅 ************************/
/********************** 3D 를 다루는 Class 세팅 ************************/
class ShuttingStars3DManager {
    /**
     * 초기화 작업 (scene, renderer 를 여기서 생성)
     * @param {HTMLCanvasElement} canvas3d 3D 렌더링 대상 캔버스
     * @param {ShuttingStarsCore} coreInst 게임 코어 인스턴스
     */
    init(canvas3d, coreInst) {}
    /**
     * 동시처리 작업이 필요한 경우 여기서 진행
     * @param {ShuttingStarsCore} coreInst 게임 코어 인스턴스
     */
    simultaneousJob(coreInst) {}
    /**
     * 렌더링 시마다 호출해야 함
     * @param {HTMLCanvasElement} canvas3d 3D 렌더링 대상 캔버스
     * @param {Array<ShuttingStars3DObject>} objects objects 값
     */
    render(canvas3d, objects) {} // object3ds
    /**
     * 창 크기 변경 시 호출해야 함
     * @param {HTMLCanvasElement} canvas3d 3D 렌더링 대상 캔버스
     * @param {ShuttingStarsCore} coreInst 게임 코어 인스턴스
     */
    onWindowResize(canvas3d, coreInst) {}
}
class ShuttingStars3DObject {
    /** @type {number} 인스턴스를 식별하는 고유 일련번호 */
    uniqueSerial = -1;
    /** @type {boolean} 숨김 여부 */
    hidden = false;
    /**
     * 인스턴스 초기화
     * @param {ShuttingStars3DManager} manager 3D 관리자 인스턴스
     */
    constructor(manager) {}
    /**
     * 3D 객체가 관리하는 메시 목록을 반환
     * @param {ShuttingStars3DManager} manager 3D 관리자 인스턴스
     * @returns {Array<*>} 처리 결과
     */
    getMeshes(manager) { return []; }
    /**
     * 3D 객체가 점유한 리소스를 해제
     */
    dispose() {}
}
/********************** // 3D 를 다루는 Class 세팅 ************************/
/********************** 브라우저 감지 Class 세팅 ************************/
class BrowserDetector {
    /**
     * 인스턴스를 초기화합니다.
     */
    constructor() {

    }
    /**
     * 현재 브라우저의 이름과 버전 정보를반환
     * @returns {Object} 처리 결과
     */
    getBrowserInformation() {
        return {
            name : 'Unknown',
            version : 'Unknown'
        };
    }
}
/********************** // 브라우저 감지 Class 세팅 ************************/
/********************** 기타 Util 성 Class 세팅 ************************/
class ShuttingStarsUtilityClass {
    /** @type {number} 토스트 메시지에 부여할 고유 순번의 현재 최대값 */
    toastIndex = 0;

    /**
     * 문자열 치환
     * @param {string} originalStr originalStr 값
     * @param {string} targetStr targetStr 값
     * @param {Object} replacements replacements 값
     * @returns {string} 처리 결과
     */
    replaceString(originalStr, targetStr, replacements) {
        return String(originalStr).split(targetStr).join(replacements); 
    }

    /**
     * 해당 문자열을 각 줄로 나눠, commentChar 문자로 시작하는 줄 제거하고 다시 합쳐 반환
     * @param {string} originalString originalString 값
     * @param {string} commentChar commentChar 값
     * @returns {string} 지정한 주석 줄이 제거된 문자열
     */
    removeLinesStartKey(originalString, commentChar) {
        let res = '';
        let splits = String(originalString).split('\n');

        for(const line of splits) {
            if(line.trim().indexOf(commentChar) == 0) continue;
            res += line + '\n';
        }
        return res.trim();
    }

    /**
     * 문자열에서 따옴표, <> 기호를 HTML 특수문자로 변환
     * @param {string} str str 값
     * @returns {string} HTML 특수문자로 치환된 문자열
     */
    purifyHTML(str) {
        if(str == null) return '';
        str = String(str);
        str = this.replaceString(str, '<', '&lt;');
        str = this.replaceString(str, '>', '&gt;');
        str = this.replaceString(str, '"', '&quot;');
        str = this.replaceString(str, "'", '&apos;');
        return str;
    }

    /**
     * 자연수 (양의 정수)와 자리수(역시 양의 정수) 입력 받아, 해당 자리수에 맞는 문자열로 변환, 숫자를 표현하고 남은 자리수는 빈 문자열(공백) 로 앞부분을 채움
     * @param {number} naturalValue naturalValue 값
     * @param {number} digit digit 값
     * @returns {string} 지정한 자릿수에 맞춘 문자열
     */
    fitDigit(naturalValue, digit) {
        let res = String(naturalValue);
        while(res.length < digit) {
            res = ' ' + res;
        }
        return res;
    }

    /**
     * 모바일 환경인지 감지
     * @returns {boolean} 처리 결과
     */
    isTouchScreenPlatform() {
        let val1 = false;
        let val2 = false;
        try { val1 = window.matchMedia('(pointer: coarse)').matches;           } catch(e) {}
        try { val2 = 'ontouchstart' in window || navigator.maxTouchPoints > 0; } catch(e) {}
        return val1 || val2;
    }

    /**
     * 토스트 메시지 출력, msg 에는 출력할 텍스트 입력 (필수), red 는 배경색 강조표시로 bool (true/false, 선택사항) 로 입력, duration 은 유지시간으로 정수값 (milliseconds, 선택사항) 입력
     * @param {string} msg msg 값
     * @param {number|boolean} red 빨간색 성분 또는 경고 강조 여부
     * @param {number} duration 표시 유지 시간(밀리초)
     */
    toast(msg, red, duration) {
        let uniqNo = this.toastIndex;
        this.toastIndex++;

        msg = String(msg);

        let uniqid = 'toast' + (ShuttingStarsUtility.random() * 99999999) + '' + uniqNo;
        let area = document.createElement('div');
        area.id = uniqid;
        area.classList.add('toast');
        area.classList.add('sstoast');
        area.classList.add(uniqid);
        area.innerHTML = this.replaceString(this.replaceString(msg, '<', ''), '>', '');
        area.title = msg;
        area.style.position = 'fixed';
        
        let width = 400;
        let height = 30;
        let bopa = 0.6;
        let fopa = 0.9;
        let locationBottom = 20;
        let reds = 'N';
        if(red) reds = 'Y';
        
        area.dataset.bottom  = String(locationBottom);
        area.dataset.index   = String(uniqNo);
        area.dataset.removed = 'N';

        area.style.bottom = locationBottom + 'px';
        area.style.left = (window.outerWidth - 100 - width) + 'px';
        area.style.width = width + 'px';
        area.style.height = height + 'px';
        area.style.textAlign = 'left';
        if(reds == 'Y') {
            area.style.background = 'rgba(134, 35, 35, ' + bopa + ')';
            area.style.color = 'rgba(255, 255, 255, ' + fopa + ')';
        } else {
            area.style.background = 'rgba(35, 134, 35, ' + bopa + ')';
            area.style.color = 'rgba(255, 255, 255, ' + fopa + ')';
        }
        area.style.fontSize = (height - 10) + 'px';
        area.style.fontFamily = 'D2Coding, NanumGothicCoding';
        area.style.padding = '15px 5px 5px 15px';
        area.style.whiteSpace = 'nowrap';
        area.style.textOverflow = 'ellipsis';
        area.style.overflow = 'hidden';
        area.style.borderRadius = '3px';

        const fResetBottom = () => {
            // 다른 토스트 메시지가 있으면 지금 이 토스트 메시지 위치 변경해야 함
            let otherToasts = document.body.querySelectorAll('.sstoast');
            if(otherToasts.length >= 1) {
                let locationBottomMax = 20;
                for(let idx=0; idx<otherToasts.length; idx++) {
                    try {
                        const otherToastOne = otherToasts[idx];

                        // 제거된 객체 제외
                        if(otherToastOne.dataset.removed == 'Y') continue;

                        // 동일 객체 제외
                        let otherId = otherToastOne.id;
                        if(uniqid == otherId) continue;

                        // 순번 더 높은 객체 제외
                        let strIndex = otherToastOne.dataset.index;
                        let intIndex = parseInt(strIndex);
                        if(uniqNo < intIndex) continue;

                        // bottom 최대값 체크
                        let strBottom = otherToastOne.dataset.bottom;
                        let intBottom = parseInt(strBottom);
                        if(intBottom > locationBottomMax) locationBottomMax = intBottom;
                    } catch(ignores) {}
                }
                locationBottom = locationBottomMax + (height * 2);
                area.style.bottom = locationBottom + 'px';
                area.dataset.bottom = String(locationBottom);
            }
        };
        fResetBottom();

        document.body.appendChild(area);
        
        let times = 10000;
        if(msg.length >= 12) times += (msg.length - 12) * 500;
        if(duration) times = duration;

        const fClick = () => {
            if(times > 5000) times = 5000;
        };

        area.addEventListener('click', fClick);
        let timer = setInterval(() => {
            if(times <= 5000) {
                bopa -= 0.00012 * ( 5000.0 - (times) );
                fopa -= 0.00015 * ( 5000.0 - (times) );

                if(bopa < 0) bopa = 0;
                if(fopa < 0) fopa = 0;
                
                if(reds == 'Y') {
                    area.style.background = 'rgba(134, 35, 35, ' + bopa + ')';
                    area.style.color = 'rgba(255, 255, 255, ' + fopa + ')';
                } else {
                    area.style.background = 'rgba(35, 134, 35, ' + bopa + ')';
                    area.style.color = 'rgba(255, 255, 255, ' + fopa + ')';
                }
            }
            fResetBottom();

            times -= 50;
            if(times <= 0) {
                area.dataset.removed = 'Y';
                area.style.display = 'none';
                area.removeEventListener('click', fClick);
                area.remove();
                if(timer != null) clearInterval(timer);    
            }
        }, 50);
    }

    /**
     * fnWork 함수를 timeGapMillis 주기로 반복 호출, 오차 방지 포함, 참고 : https://sirius7.tistory.com/156 , 이 반복을 종료하는 함수를 반환함.
     * @param {Function} fnWork fnWork 값
     * @param {number} timeGapMillis timeGapMillis 값
     * @returns {Function} 반복 호출을 중단하는 함수
     */
    repeat(fnWork, timeGapMillis) {
        if(typeof(fnWork)        != 'function') throw 'fnWork should be a function !';
        if(typeof(timeGapMillis) != 'number'  ) throw 'timeGapMillis should be a number !';
        timeGapMillis = Math.floor(timeGapMillis);

        let expected = Date.now() + timeGapMillis;
        let switchStop = false;

        const fStep = function() {
            if(switchStop) return;
            fnWork();
            if(switchStop) return;

            let drift = Date.now() - expected;
            let futureTime = timeGapMillis - drift;

            let loops = 0;
            while(futureTime < 0) { futureTime += timeGapMillis; loops++; }

            expected += timeGapMillis * (loops + 1);
            
            setTimeout(fStep, Math.max(0, futureTime));
        }
        setTimeout(fStep, timeGapMillis);

        return function() { switchStop = true; }
    }

    /**
     * 부동소수 동일여부 확인
     * @param {number} a a 값
     * @param {number} b b 값
     * @returns {boolean} 두 값이 허용 오차 안에서 같은지 여부
     */
    checkEqualFloats(a, b) {
        return Math.abs(a - b) < 0.000001;
    }

    /**
     * 소수 2째자리까지 남기고 반올림
     * @param {number} numbers numbers 값
     * @returns {number} 처리 결과
     */
    round2(numbers) {
        return Math.round(numbers * 100.0) / 100.0;
    }

    /**
     * 소수 3째자리까지 남기고 반올림
     * @param {number} numbers numbers 값
     * @returns {number} 처리 결과
     */
    round3(numbers) {
        return Math.round(numbers * 1000.0) / 1000.0;
    }

    /**
     * 소수 2째자리까지 남기고 버림
     * @param {number} numbers numbers 값
     * @returns {number} 처리 결과
     */
    floor2(numbers) {
        return Math.floor(numbers * 100.0) / 100.0;
    }

    /**
     * 소수 3째자리까지 남기고 버림
     * @param {number} numbers numbers 값
     * @returns {number} 처리 결과
     */
    floor3(numbers) {
        return Math.floor(numbers * 1000.0) / 1000.0;
    }

    /**
     * 0 ~ 4294967296 사이 랜덤 정수 반환
     * @returns {number} 0 이상 4294967296 미만의 난수
     */
    randomInt() {
        if(window.crypto) {
            try {
                const buff = new Uint32Array(1);
                window.crypto.getRandomValues(buff);
                return buff[0];
            } catch(ignores) {}
        }
        return Math.floor(this.random() * 4294967296);
    }

    /**
     * 0 ~ 1.0 사이 랜덤 수 반환
     * @returns {number} 0 이상 1 미만의 난수
     */
    random() {
        // crypto 사용 가능한 경우 더 확실한 random 반환
        if(window.crypto) {
            try {
                const buff = new Uint32Array(1);
                window.crypto.getRandomValues(buff);
                return buff[0] / 4294967296.0;
            } catch(ignores) {}
        }
        return Math.random();
    }

    /**
     * 그라디언트 적용 원을 2D 로 그리기
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     * @param {number} x x 값
     * @param {number} y y 값
     * @param {number} radius radius 값
     * @param {number|boolean} red 빨간색 성분 또는 경고 강조 여부
     * @param {number} green green 값
     * @param {number} blue blue 값
     * @param {number} alpha alpha 값
     * @param {number} depth depth 값
     */
    drawGradientedArc(ctx, x, y, radius, red, green, blue, alpha, depth) {
        ctx.beginPath();
        if(typeof(depth) == 'undefined') depth = 5;
        if(typeof(depth) == 'string') depth = parseInt(depth);

        let rad = radius;
        let r = red;
        let g = green;
        let b = blue;
        let dep = depth;

        // 메인 원 그리기
        ctx.fillStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
        ctx.arc(x, y, rad, 0, 2 * Math.PI);
        ctx.fill();

        for(let idx=0; idx<dep; idx++) {
            ctx.beginPath();

            // 작은 원 그리기
            rad--;

            r = r + Math.round((255 - r) * 0.1);
            g = g + Math.round((255 - g) * 0.1);
            b = b + Math.round((255 - b) * 0.1);

            ctx.fillStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
            ctx.arc(x, y, rad, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    /**
     * URL 유효성 확인
     * @param {string} url url 값
     * @returns {boolean} 처리 결과
     */
    checkValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
     * URL 유효성 확인, 접속 가능 여부도 판단 (Promise)
     * @param {string} url url 값
     * @returns {Promise<*>} 처리 결과
     */
    checkAccessibleURL(url) {
        return new Promise((resolve, reject) => {
            let urlx;
            try {
                urlx = new URL(url);
            } catch(e) {
                resolve(false);
                return;
            }

            if(urlx.protocol != 'http:' && urlx.protocol != 'https:') {
                resolve(false);
                return;
            }

            try {
                fetch(urlx.href, {method : 'HEAD'}).then((r) => {
                    resolve(true);
                }).catch((e) => { resolve(false); });
            } catch(e) {
                resolve(false);
            }
        });
    }

    /** 
     * 해당 문자열을 SHA-256 암호화 (Promise)
     * 
     * @param {string} str 암호화할 값
     * @returns {Promise<*>} 암호화 결과 (HEX String 으로 반환)
    */
    sha256str(str) {
        return new Promise((resolve, reject) => {
            if(typeof(CryptoJS) != 'undefined') {
                resolve(CryptoJS.SHA256( String(str) ).toString());
            } else if(typeof(crypto) != 'undefined') {
                const msgBuff = new TextEncoder().encode( String(str) );
                crypto.subtle.digest('SHA-256', msgBuff).then((hashBuff) => {
                    const hashArr = Array.from(new Uint8Array(hashBuff));
                    const hashHex = hashArr.map((b) => { return b.toString(16).padStart(2, '0') }).join('');
                    resolve(hashHex);
                });
            } else reject('No CryptoJS detected.');
        });
    }

    /** 
     * 해당 문자열을 SHA-384 (SHA 버전 2임 ! 384는 자리수일 뿐) 암호화 (Promise)
     * 
     * @param {string} str 암호화할 값
     * @returns {Promise<*>} 암호화 결과 (HEX String 으로 반환)
    */
    sha384str(str) {
        return new Promise((resolve, reject) => {
            if(typeof(CryptoJS) != 'undefined') {
                resolve(CryptoJS.SHA384( String(str) ).toString());
            } else if(typeof(crypto) != 'undefined') {
                const msgBuff = new TextEncoder().encode( String(str) );
                crypto.subtle.digest('SHA-384', msgBuff).then((hashBuff) => {
                    const hashArr = Array.from(new Uint8Array(hashBuff));
                    const hashHex = hashArr.map((b) => { return b.toString(16).padStart(2, '0') }).join('');
                    resolve(hashHex);
                });
            } else reject('No CryptoJS detected.');
        });
    }

    /** 
     * 해당 문자열을 SHA-3 암호화 (Promise)
     *     CryptoJS 필요 (아직 웹표준 Crypto API 는 SHA3 미지원)
     * 
     * @param {string} str 암호화할 값
     * @returns {Promise<*>} 암호화 결과 (HEX String 으로 반환)
    */
    sha3str(str) {
        return new Promise((resolve, reject) => {
            if(typeof(CryptoJS) != 'undefined') {
                resolve(CryptoJS.SHA3( String(str) ).toString());
            } else reject('No CryptoJS detected.');
        });
    }
}
const ShuttingStarsUtility = new ShuttingStarsUtilityClass();
const SSUtil = ShuttingStarsUtility;
/********************** // 기타 Util 성 Class 세팅 ************************/

/********************** 외부에서 호출할 수 있도록 함수 구현 ************************/

/**
 * 게임의 곡 목록에 곡을 추가
 * @param {ShuttingStarsSong} song 추가할 곡
 * @returns {ShuttingStarsSong} 실제로 목록에 추가된 곡 객체
 */
function addShuttingStarSong(song) {
    return _shuttingstarcore.addSong(song);
}

/**
 * 3D 매니저 객체를 등록하거나 해제
 * @param {ShuttingStars3DManager|null} obj 등록할 3D 매니저. null이면 현재 매니저를 해제
 * @returns {void}
 */
function setShuttingStar3D(obj) {
    setTimeout(function() { _shuttingstarcore.set3DManager(obj); }, 1000);
}

/**
 * 지정한 영역에 ShuttingStars 게임 적용
 * @param {HTMLElement} mainDiv 게임 캔버스를 배치할 DOM 요소
 * @param {string} urlContext 리소스 URL의 기준 경로
 * @returns {*|undefined} 코어 초기화 결과
 */
function initShuttingStars(mainDiv, urlContext) {
    try { return _shuttingstarcore.init(mainDiv, urlContext); } catch(e) { ShuttingStarsUtility.toast('ERROR : ' + e, true); console.error(e); }
}
