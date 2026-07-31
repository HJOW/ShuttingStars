/** 
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0 
*/
/*
 * Shutting Stars
 *     게임 동작 핵심 파일
 * 
 * 의존성
 *     shuttingstarsutils.js      - 공용 유틸리티
 *     shuttingstarworker.js      - 동시처리 지원
 *     shuttingstarsongs.js       - 공식 번들곡 포함
 *     shuttingstarstringtable.js - 영어 외 다른 언어 지원
 *     shuttingstarsinterface.js  - 클라우드 기능 사용
 *     shuttingstars3d.js         - 3D 기능 지원
 * 
 */

import { ShuttingStarsUtility, SSUtil, BrowserDetector, BpmDetector  } from './shuttingstarsutils.js'
import { SSBundleSongs } from './shuttingstarsongs.js'
import { SSStringTable } from './shuttingstarstringtable.js'
import { SSBackend, getSSBackendBroker, ShuttingStarsInterface } from './shuttingstarsinterface.js'
import { ShuttingStars3DManager, ShuttingStars3DObject, SS3DManager } from './shuttingstars3d.js'

/* 게임 기동 근간을 이루는 전역 객체 */
class ShuttingStarsCore {
    /*** 게임 버전 ***/
    /** @type {number} 빌드 번호 */
    build = 7;

    /** @type {string} 홈페이지 */
    homepageUrl = 'https://github.com/HJOW/shuttingstars';
    
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

    /** @type {number} 초기화 작업 중 리소스 로딩을 위한 대기 시간, 밀리초 단위  */
    initializingDelayTime = 4000;

    /*** 백엔드 **/
    /** @type {ShuttingStarsInterface|null} 백엔드 서버와의 통신을 담당하는 객체로 shuttingstarsinterface.js의 ShuttingStarsInterface 타입 객체가 들어와야 함. null 로 넣어도 게임 자체는 정상 동작하며 서버 통신관련 기능만 비활성화됨. */
    backend = null;

    /** @type {boolean} 백엔드 서버에 설정 저장기능 사용여부 */
    useCloudSettings = true;

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
    /** @type {number} 사용하는 최소 z-index 값, video, canvas 등 여러 겹 레이어 중 최하위 레이어의 z-index 값, 그 위 레이어는 +1 씩 사용하게 됨 */
    mainZindex = 1;
    /** @type {boolean} 어두운 색상 테마 적용 여부입니다. */
    dark = true;
    /** @type {boolean} 수직 반전 (convertY 메소드 사용 시 위 아래가 반전됨, 함부로 변경하지 말 것 ! 모든 render 메소드 점검해야 함.) */
    reverseVertical = false;
    /** @type {number} 글꼴 크기 비율 (해상도와 별도) */
    fontSizeRatio = 1.0;
    /** @type {boolean} 선명도 (alpha) 값 미지원하는 경우 rgb 값 자체를 변경하여 비슷하게 구현하는 기능 사용여부 */
    colorManualAlpha = false;

    /*** 글꼴 관련 ***/
    /** @type {string} 메인 폰트, alterFonts 가 뒤에 붙음, config.json 에 정의된 경우 config.json 값으로 대체됨 */
    fontFamily = 'D2 coding';
    /** @type {string|null} 메인 폰트 (사용자 설정) - 설정 값에 의헤 좌우됨, null 시 fontFamily 값을 대신 사용함 */
    mainFont = null;
    /** @type {string} 강조할 일이 있을 때 fontFamily 대신 사용되는 폰트, alterFonts 가 뒤에 붙음 */
    pointFont  = 'Nanum Pen Script';
    /** @type {string} 판정 마크에 사용될 폰트, 마찬가지로 alterFonts 가 뒤에 붙음 */
    judgeFont  = 'D2 coding';
    /** @type {string} 빌드번호 등 출력에 사용할 OCR 스타일 폰트, 마찬가지로 alterFonts 가 뒤에 붙음 */
    ocrFont    = 'OCR-A';
    /** @type {string} 대체 폰트들 */
    alterFonts = ['D2 coding', 'Nanum Gothic Coding', 'D2Coding', 'NanumGothicCoding', 'NanumGothic', 'NanumMyeongjo', 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans TC', 'Nanum Pen Script', 'ocra', 'monospace'];

    /*** DOM 영역 변수들 (게임 초기화 중 할당됨) ***/
    /** @type {HTMLElement|null} ShuttingStars 게임이 돌아가는 DOM 의 최상위 DIV */
    rootDiv = null;
    /** @type {HTMLElement|null} 위 rootDiv 를 div로 한번 더 감싼 div */
    contentRoot = null;
    /** @type {HTMLElement|null} 유튜브 영역 (미사용 시 투명) */
    youtubeDiv = null;
    /** @type {HTMLVideoElement|null} 2D 캔버스 아래에 위치한 video 태그로, 곡 플레이 시 해당 곡의 BGA가 재생되는 영역 */
    videoBga = null;
    /** @type {Object} 팝업 (별도 창이 아닌 인앱 대화상자 형태) */
    pops = {
        root : null,      // 팝업 최상위 div
        dim : null,       // 모달 팝업 구현을 위한 흐린 투명 레이어 div, canvas 보다 위층을 차지함
        config : null,    // 설정 팝업 영역 div
        login : null,     // 로그인 팝업 영역 div
        join : null,      // 회원가입 팝업 영역 div (현재 미사용)
        community : null, // 커뮤니티 팝업 영역 div
        iframes : null,   // 외부 페이지 (iframe) div
        youtube : null,   // 유튜브 팝업 div
        mysong : null     // mp3 첨부 div   
    };
    /** @type {HTMLElement|null} 상세 설정 화면 영역 */
    configDiv = null;
    /** @type {HTMLElement|null} 웹 접근성을 위한 영역 */
    accessibilityLayer = null;

    /*** DOM 영역 변수들 (Canvas 객체들) ***/
    /** @type {HTMLCanvasElement|null} 2D 캔버스 객체 (메인 게임 동작) */
    canvas = null;
    /** @type {HTMLCanvasElement|null} 3D 장식 출력용 캔버스 객체 (2D 바로 윗층에 위치) */
    canvas3d = null;
    
    /*** 입력키 설정  - config.json 에 정의된 경우 config.json 값으로 대체되며, 이후 설정에 저장됨 ***/
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
    /** @type {string} URL resource directory name */
    rsscDirName = 'resources';

    /** @type {CanvasRenderingContext2D|null} 2D Context 객체 */
    ctx = null;
    /** @type {ShuttingStars3DManager|null} ShuttingStars3DManager 객체 */
    ss3d = null;
    /** @type {boolean} true 지정 시 3D 렌더링하지 않음, 설정 화면에서 그래픽 설정 변경 시 자동 변경되는 항목이므로 손대지 말 것. */
    disable3d = false;
    /** @type {boolean} true 지정 시 게임 플레이 중 2D 렌더링하지 않음. disable3d 가 false 여야 동작함. 3D 켠다고 해도 SSNotePlacer 는 2D 것을 띄울 예정이므로 항시 false 로 둘 것 */
    disable2d = false;

    /** @type {*} Youtube IFrame API - YT.Player - 메인곡 */
    youtubePlayer = null;
    /** @type {boolean} Youtube 사용 준비여부 확인 */
    youtubePlayerReady = false;
    /** @type {boolean} Youtube 재생 종료여부 확인 */
    youtubePlayerEnded = false;
    /** @type {*} Youtube IFrame API - YT.Player - 팝업 iframe 플레이어 */
    youtubePopPlayer = null;

    /*** 3D 각 구성요소 사용여부 설정 ***/
    /** @type {Object} 게임 요소별 3D 렌더링 사용 여부를 저장합니다. */
    use3d = {
        notePlacer : false,    // NotePlacer - 3D로 띄우면 투명도가 적용이 안되어 2D 것을 사용하므로 false 지정
        notes : true,          // Note - 노트들은 3D 띄워도 별 문제 없었음
        planet : true,         // 행성 (HP바) - 3D 객체가 아예 안뜨는 문제가 있음. 그래서 true 로 두든 false 로 두든 상관이 없는 상황.
        visualization : true   // 시각화 - 구현 완료
    };

    /*** 게임 밸런스 관련 설정값 중 상수에 해당하는 값들 (저장되는 설정이 아님) ***/
    /** @type {number} render 호출 주기 (변경 불가) - 밀리초 단위로, 이 시간 주기마다 render 메소드가 호출되며, 낮을수록 화면이 부드럽게 변함. - config.json 에 정의된 경우 config.json 값으로 대체됨 */
    frameTime = 10;
    /** @type {number} 최소 시간 단위에 영향. 이 게임 내 소요시간 (elapsedTime) 최소단위는 해당곡의 1비트 시간을 이 값으로 나눈 값. */
    timeMultiplier = 16.0;
    /** @type {number} timeMultiplier 값와 같이 움직임. 1.0 으로 둘 것. */
    elapsedTimeMultiplier = 1.0;
    /** @type {number} 유튜브 사용 플레이 시 timeElapse 호출 주기에 추가 적용되는 보정값 - config.json 에 정의된 경우 config.json 값으로 대체됨 */
    songBitMoreGapYoutube = 0.1;
    /** @type {number} 스테이지의 세로를 이 숫자만큼 등분하여, 노트의 크기, 초기 생성 위치를 계산함. */
    stageRows = 72;
    /** @type {number} 노트 크기 상수, 이 값이 증가하면 노트 크기가 증가함. 노트 속도에도 비례하게 영향을 끼침. */
    sizeFixedConst = 2;
    /** @type {number} 노트 위치 보정 상수. 사용자가 변경할 수 없는 값 (변경 가능한 보정 상수는 따로 있음) */
    noteLocationConst = 0;
    /** @type {number} 노트 이동 속도 배수. 사용자가 변경할 수 없는 값 (변경 가능한 보정 상수는 따로 있음) */
    noteSpeedFixedConst = 0.25;
    /** @type {number} 일시정지 후 재개 전 대기 타임 상수 - config.json 에 정의된 경우 config.json 값으로 대체됨 */
    resumeDelayTime = 16;
    /** @type {number} pw 최대값 (10000 권장) */
    pwMax = 10000;
    /** @type {number} pw 1회 사용값 (100 권장) - 키를 눌러 NotePlacer 동작 시 1회 사용, Note 에 명중시키면 본전만큼 다시 회수됨 (MISS 혹은 헛발질하면 소모됨) */
    pwUse = 100;
    /** @type {number} 곡 로딩 기본 시간 - config.json 에 정의된 경우 config.json 값으로 대체됨 */
    songTitleBaseTime = 120;
    /** @type {number} 볼륨 상수 */
    volumeMultiplier = 1.0;
    /** @type {number} 배경 별빛 장식 최대 갯수 - config.json 에 정의된 경우 config.json 값으로 대체됨 */
    backStarlightCount = 30;
    /** @type {number} 배경 별빛 장식 X 속도 (게임 중 변경됨) */
    backStarlightSpdX = 1;
    /** @type {number} 배경 별빛 장식 Y 속도 (게임 중 변경됨) */
    backStarlightSpdY = 0;
    /** @type {number} 시각화 크기 배율 - config.json 에 정의된 경우 config.json 값으로 대체됨 */
    visualizeBarMultiplier = 1.0;

    /*** 공지사항 메시지 (타이틀 및 메뉴 화면 하단에 출력됨) - config.json 에 정의된 경우 config.json 값으로 대체됨 ***/
    /** @type {string} 공지사항 (영문) */
    noticeEn   = '';
    /** @type {string} 공지사항 (한글) */
    noticeKo   = '';
    /** @type {number} 마지막 공지사항 게시일시 (백엔드 필요) */
    noticeWhen = 0;
    
    /*** 오디오 관련 ***/
    /** @type {number} 마스터 볼륨 (0 ~ 1) */
    volume = 1.0;
    /** @type {number} 배경 음악 기본 볼륨 */
    volumeBackgroundDefault = 0.2;
    /** @type {number} 노트 이동 속도 배수 (사용자가 지정 가능) */
    noteSpeedMultiplier = 2.0;
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
    /** @type {Array<SSNotePlacer>} NotePlacer 객체들 보관 (objectsPlaying 와 중복 보관) */
    notePlacers = [];

    /** @type {number} 플레이 중 진행 시간 (실제 시간과 단위가 다르며, 곡의 BPM 반영으로 곡마다 속도가 다름, 곡의 패턴 배열의 N번째 숫자에 해당) */
    elapsedTime = 0;
    /** @type {number} 플레이 중 진행 시간 (예전 방식, 순수 timeElapse 호출 횟수로 elapsedTime 와 정수 범위 내에서는 동일해야 함) */
    elapsedTimeOld = 0;
    /** @type {number} 사이클 처리 직전 elapsedTime 값으로, 음원 로딩이 끊겼는지 판단하기 위해 사용 (게임 중 변경됨) */
    elapsedTimeLast = 0;
    /** @type {number} 버퍼 로딩 부족으로 elapsedTime 가 증가하지 않은 횟수 */
    elapsedTimeNotIncreased = 0;
    /** @type {boolean} 실제 Audio / Youtube 와 타이밍 동기화 했는지 여부 */
    elapsedTimeSynchronized = false;
    /** @type {number} 동시 처리 (timeElapse) 시작 시간 (타임스탬프로 performance.now() 관련 문서 참고) */
    timeElapseWorkStartTime = 0;
    /** @type {number} 동시 처리 (timeElapse) 종료 시간 (처리 중에는 0으로 유지되며, 처리가 종료될 때마다 잠깐 값이 세팅됨, 타임스탬프) */
    timeElapseWorkEndTime = 1;
    /** @type {number} 동시 처리 (timeElapse) 처리에 걸린 시간, 타임스탬프 */
    timeElapseWorkCycleGap = 0;

    /** @type {number} 진행 시간 (곡과 관련 없이 동시 처리 횟수) */
    simultaneousTime = 0;
    /** @type {number} 동시 처리 (simultaneousWork) 시작 시간 (타임스탬프로 performance.now() 관련 문서 참고) */
    simultaneousStartTime = 0;
    /** @type {number} 동시 처리 (simultaneousWork) 종료 시간 (처리 중에는 0으로 유지되며, 처리가 종료될 때마다 잠깐 값이 세팅됨, 타임스탬프) */
    simultaneousEndTime = 1;
    /** @type {number} 동시 처리 (simultaneousWork) 처리에 걸린 시간, 타임스탬프 */
    simultaneousCycleGap = 0;
    /** @type {number} 상태가 playing 일 때도 songtitle 화면을 띄우는 시간 (게임 중 변경됨) */
    titleDelayTime = 0;
    /** @type {number} 플레이 준비 시 titleDelayTime 값에 들어가는 초기값 */
    titleDelayTimeMax = 240;

    /** @type {number} 동시 처리 (render) 시작 시간 (타임스탬프로 performance.now() 관련 문서 참고) */
    renderStartTime = 0;
    /** @type {number} 동시 처리 (render) 종료 시간 (처리 중에는 0으로 유지되며, 처리가 종료될 때마다 잠깐 값이 세팅됨, 타임스탬프) */
    renderEndTime = 1;
    /** @type {number} 동시 처리 (render) 처리에 걸린 시간, 타임스탬프 */
    renderCycleGap = 0;

    /** @type {number} 동시 처리 (ss3d render) 시작 시간 (타임스탬프로 performance.now() 관련 문서 참고) */
    render3DStartTime = 0;
    /** @type {number} 동시 처리 (ss3d render) 종료 시간 (처리 중에는 0으로 유지되며, 처리가 종료될 때마다 잠깐 값이 세팅됨, 타임스탬프) */
    render3DEndTime = 1;
    /** @type {number} 동시 처리 (ss3d render) 처리에 걸린 시간, 타임스탬프 */
    render3DCycleGap = 0;

    /** @type {number} 동시 처리 (ss3d simultaneousWork) 시작 시간 (타임스탬프로 performance.now() 관련 문서 참고) */
    simultaneous3DStartTime = 0;
    /** @type {number} 동시 처리 (ss3d simultaneousWork) 종료 시간 (처리 중에는 0으로 유지되며, 처리가 종료될 때마다 잠깐 값이 세팅됨, 타임스탬프) */
    simultaneous3DEndTime = 1;
    /** @type {number} 동시 처리 (ss3d simultaneousWork) 처리에 걸린 시간, 타임스탬프 */
    simultaneous3DCycleGap = 0;

    /** @type {boolean} Worker 사용여부 (실제 적용되는 변수로 게임 동작 중 변경) */
    usingWorker = true;
    /** @type {boolean} Worker 사용여부 (사용자가 변경 가능) */
    usingWorkerConfig = true;
    /** @type {Function|null} 반복 진행 종료 함수가 들어가는 변수 */
    timeProgressKey = null;
    /** @type {boolean} 상태가 title 이면서 로딩은 끝났음을 나타내는 변수 */
    titleScreenWaiting = false;
    /** @type {number} render 호출을 위한 requestAnimationFrame 의 리턴 값, 닫을 때 필요 */
    reqAniKey = null;
    /** @type {boolean} render 반복 중단 신호 */
    stopRepeatRender = false;

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
    /** @type {number} pwUse 이하로 내려가면 키를 눌러도 노트 처리가 되지 않음. 서서히 회복. 최대 pwMax. */
    pw = 10000;

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

    /** @type {boolean} 하드코어 모드 (커맨드로 설정) - 판정도 빡빡해지고, PW 소모량도 대폭 증가 */
    hardcoreMode = false;
    /** @type {boolean} 결벽증 모드 (커맨드로 설정) - BAD, MISS 하나라도 발생하면 바로 게임 오버 */
    mysophobiaMode = false;
    /** @type {boolean} 노트 숨김 모드 (커맨드로 설정) */
    invisibleNoteMode = false;
    /** @type {boolean} 롱노트 거부 (커맨드로 설정) */
    noLongNote = false;

    /** @type {Array<string>} 기본 상태들 */
    basicStates = ['title', 'firstset', 'menu', 'songchoosing', 'songtitle', 'playing', 'gameover', 'result', 'listenchoosing', 'listentitle', 'listenplaying', 'setting', 'credit', 'recordlist', 'recorddet', 'empty'];
    /** @type {string} 현재 상태 값 */
    state = 'title';
    /** @type {Array<ShuttingStarsState>} 상태 객체들, 기본 상태를 제외한 상태들은 이 배열로 관리, 상태 값은 이 배열 내 객체들의 name 속성에 해당 */
    states = [];
    
    /** @type {string} 이전 상태 */
    beforeState = 'none';
    /** @type {boolean} true 시 배경에 게임 제목 강제 출력 */
    showGameTitle = false;

    /** @type {string} 기기/브라우저 특정을 위한 고유값 (독자 생성, init 호출해야 입력됨) */
    ssuuid = '';

    /** @type {string} default / mission */
    mode = 'default';
    /** @type {ShuttingStarsSong|null} 현재 플레이 중인 곡, ShuttingStarsSong 객체 */
    song = null;
    /** @type {Array<ShuttingStarsSong>} 불러온 곡들, ShuttingStarsSong 객체 배열 */
    songs = [];
    /** @type {Array<ShuttingStarsSong>} 선택 가능한 곡들, ShuttingStarsSong 객체 배열, songs 과 다른 점은 디버그 모드에 따른 노출 여부 */
    songDisplays = [];
    /** @type {Array<ShuttingStarsSong>} 랜덤 선정 가능한 곡들, ShuttingStarsSong 객체 배열 */
    songRandoms  = [];
    /** @type {Array<ShuttingStarsSong>} 감상 모드에서 사용 가능한 곡들, ShuttingStarsSong 객체 배열 */
    songCanListen = [];
    /** @type {Array<ShuttingStarsMission>} 특수한 곡들 (mission 모드일 때 선택) */
    missions = [];
    /** @type {string} default / mission / mysong */
    songChoosingMode = 'default';
    

    /** @type {Object|null} 선택된 난이도 */
    difficulty = null;
    /** @type {number} 선택된 난이도 (숫자) */
    difficultyLevel = -1;
    /** @type {boolean} 해당 난이도가 노트 자동생성 기능을 사용하는지 여부 */
    difficultyUsingAutoCreate = false;
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

    /** @type {Array<string>} 공식 곡 시리얼 목록 */
    officialSongSerials = [
        'nai4ilaHbn7g93gn34nf9afn438zJ93f8gp34qgD39p4g',
        'nai4ilaHfdhsdfhfsdhsfgfnJ93f8gp34qgD39p4g',
        'nai4ilagwaifiuIBTUcfasgp34qgD39p4g',
        'nai4ilaHbwgwgnoimomwenofnJ93f8gp34qgD39p4g',
        'nai4ilaHbn7g934634634638zJ93f8gp34qgD39p4g',
        'nai4ilaHhdhrtjrthdrthkhthgp34qgD39p4g',
        'nai4ilaaogn0iramegioamerpogm3490qmgaemfpoggsdGSDGsnmdk',
        'nai4ilahgaGARGag00ij0djfhksakgoiapwegmpowaermgpoami',
        'nai4ilagneagnorienoinm34ongAGRAEG48nfg90g04GGHansklvamslkv',
        'nai4ilaosng34gGERGI#$G#sGM3g8j0esajgg4GAEFGERRGAErgnaeorgnoaerng2',
        'nai4ilagoisnomnGARA$IMERGM$#g#4g$%ghsdbfadsbmdfak',
        'nai4ilaa25745Hhdhrt634634hgp34qgD39p4g',
        'nai4ilasdhsf3fwefwq7346341564qgD39p4g',
        'nai4ilasdh63sdgdner34gdfg64qgD39p4g',
        'nai4ilaDSVJBve8vidSVbUSDYVilb34lifdv',
        'nai4ilaaognerhervbnionvinivweWEewfoggsdGSDGsnmdk',
        'nai4ilaHbn7g563hefdkgm23GeGERGgD39p4g',
        'nai4ilaHbahERHG25643gGAREGRehERGgD39p4g',
        'nai4ilaHbAERGNAEMveranvo46365rgBFDEGRehERGgD39p4g',
        'nai4ilaHbAERGNAgrgAREGN5252hgdfsgn52AEGIEAGMERGgD39p4g',
        'nai4ilaHbAgsdgGKE35gSGSERGIEAGMERGgD39p4g',
        'nai4ilsgjklnHDH4634DHDFHIEAGMERGgD39p4g',
        'nai4ilsgjklnHDHDFHRHR643yJFGJFGJIMEAGMERGgD39p4g',
        'nai4ilaahDFHDFGHmkfmwif35gmSGESGSDGsnmdk',
        'nai4ilahDFSHShirgnn546346HSHMERHMEmSGESGSDGsnmdk',
        'nai4ilaHbAggERHERM46gERGERHMERERGgD39p4g',
        'nai4ilaHbn7g563&6482HDRHRgmogogesghefdkgm23GeGERGgD39p4g',
        'nai4ilaaTEWMB5325WGWIERGWEIGESGSDGsnmdk',
        'nai4ilTHRIENGW5235GEMROGEWOPGWEGSAGDSGERSOyMOFASP39p4g',
        'nai4ilTHRIENG75346GSDIGIOERSGgdg673yMOFASP39p4g',
        'nai4ilTHERHIERGGBberbueri7456HERHIEROMHyMOFASP39p4g'
    ];
    

    // 초기 설정 화면 관련
    /** @type {string} language / graphic */
    firstSetMode = 'language';

    // 메뉴 화면 관련
    /** @type {Array<string>} 메뉴들 */
    menuList = ['play', 'listen', 'records', 'setting', 'credit'];
    /** @type {Array<string>} 위 menuList 에 데이터가 추가됨 */
    menuListDynamic = [];
    /** @type {*|null} 현재 선택된 메뉴 항목입니다. */
    menuChoosing = null;

    // 설정 화면 관련
    /** @type {Array<string>} 설정 가능한 옵션 목록 */
    settingList = ['setNoteSpeedMultiplier', 'fixKeypressTiming', 'fixSongTiming', 'judgeTiming', 'setGraphicQuality', 'resetAll'];
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
    /** @type {string} 설정 화면 진입 직전의 state 값 */
    beforeSettingState = 'menu';

    // 타이밍 보정값
    /** @type {number} 키 입력 추가 딜레이 보정값 (설정에서 변경 가능) */
    keypressTiming = 0;
    /** @type {number} 음원 재생 딜레이 보정값 (설정에서 변경 가능) */
    songTiming = 0;
    /** @type {number} 판정 위치 보정값, 화면에 출력되는 NotePlacer 는 그대로지만, 노트와의 거리 계산 시 반영 */
    judgeTiming = 0;

    /** @type {Object} 키 누르는 중 중 여부 기록 (키에서 손가락 떼면 제거할 요량) - 게임 중 자동 측정됨 */
    keypressing = {};
    /** @type {boolean} 게임 시작 준비여부 1 - 게임 중 자동 변경되는 값 */
    songPrepared = false;
    /** @type {boolean} 게임 시작 준비여부 2 - 게임 중 자동 변경되는 값 */
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
    // 값 출력 여부
    /** @type {boolean} 곡 bit 진행시간 출력 여부 */
    timeElapseDebugMode = false;
    /** @type {boolean} 현재 수치 (점수, hp, pw) 출력 여부 */
    numberDebugMode = false;
    /** @type {boolean} 성능 지표 (각 동시처리 프로세스의 처리 속도) 출력 여부 */
    performanceDebugMode = false;
    /** @type {boolean} Core 객체 window 노출 여부 */
    coreDebugMode = false;
    
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

    // 2D 시각화 객체
    /** @type {SSAudio2DVisualizer|null} 현재 사용하는 2D 오디오 시각화 객체 */
    vizualizer2d = null;
    /** @type{Array<SSAudio2DVisualizer>} 사용 가능한 2D 오디오 시각화 객체들 */
    vizualizer2ds = [];

    /** @type{SSNoteTheme} 노트 출력 테마 */
    themeNote = null;
    /** @type{Array<SSNoteTheme>} 노트 출력 테마 목록 */
    themeNotes = [];
    /** @type{Array<string>} 기본 제공 상품들 */
    bonusDefaults = ['DEFAULT NOTE THEME', 'CLASSIC VISUALIZER', 'CIRCULAR VISUALIZER'];
    /** @type{Array<string>} 이 세션에서 사용 가능한 상품들 */
    bonusAvails = [];


    /** @type{Array<ShuttingStarsSong>} 곡 감상 모드 - 재생 목록 리스트 */
    listeningSongList = [];
    /** @type{boolean} 곡 감상 모드 - 반복 재생 여부 */
    listeningLoop     = true;

    /** @type {string} 마지막으로 성공한 초기화 (init 메소드) 단계 메시지 */
    lastInitSuccessMessage = '';

    // 내부 핵심 로직 전체에 액세스하지 못하게 막기 위한 중간 객체
    /** @type {Object} 외부에 제한된 코어 기능만 노출하는 중간 객체 */
    broker = {};

    // URL 매개변수들 (null 혹은 URLSearchParams 타입 객체가 들어감)
    /** @type {URLSearchParams|null} 현재 URL에서 읽은 쿼리 매개변수들 */
    urlParameters = null;

    /** @type {Object} 기타 페이지 URL */
    otherPages = {
        board : './community/board.html' // 'http://wo.to/board/board.php?id=a.5.hujinone11'
    }

    /** @type {Array<function(): void>} destroy 호출 시 호출해야 할 함수 리스트 */
    onDestroyTasks = [];

    // 브라우저 영역 크기 감지 함수 (플랫폼이 다른 경우 함수도 달라져야 함)
    /** @type {function(): number} 플랫폼별 브라우저 외부 너비를 반환하는 함수 */
    fOuterWidth  = function() { return window.outerWidth;  }
    /** @type {function(): number} 플랫폼별 브라우저 외부 높이를 반환하는 함수 */
    fOuterHeight = function() { return window.outerHeight; }
    /** @type {function(Object): void} 코어 초기화 직전에 실행할 훅 */
    fBeforeInit  = function(obj) {  }
    /** @type {function(Object): void} 코어 초기화 직후에 실행할 훅 */
    fAfterInit   = function(obj, coreInst) {  }
    /** @type {function(Object): void} 화면 새로고침이 필요한 경우 호출 */
    fRefresh     = function() { location.reload(); }
    /** @type {function(Object): void} 캔버스 크기 변경 처리 시 호출 */
    fCanvasResized = function(obj) {}
    /** @type {function(Object): void} 첫 기동인 경우 호출 */
    fOnFirstUse = function(broker) { broker.refreshPage(); }
    /** @type {null|function(): void} null 입력 시 게임 종료 기능 비활성화 (기본값), 게임 종료 기능 지원 시 이 곳에 함수를 넣으면 메뉴에 게임 종료가 추가되고, 해당 메뉴 선택 시 함수가 호출됨 */
    fOnShutdownCalled = null;
    /** @type {function(Object): void} 게임 동작 세부 사항마다 호출됨 */
    fGameEvent = function(e) {}

    /**
     * 객체 생성 (초기화하려면 init 메소드까지 호출해야 함)
     */
    constructor() {}
    
    /**
     * 초기화 (게임이 출력될 div 영역 객체를 입력) Promise
     * @param {HTMLElement|null} rootDiv 게임 UI를 배치할 최상위 요소
     * @param {string|null} urlContext 리소스 URL의 기준 경로
     * @param {null|function(object):void} fCustom 일부 속성을 커스텀하고 싶을 때 사용, 선택사항으로, 사용하려면 함수를 넣어야 하며,첫 번째 매개변수로 들어오는 broker 객체를 통해 설정 커스텀 가능.이 함수는 fBeforeInit 과 fAfterInit 사이에 호출됨
     * @returns {Promise<void>}
     */
    async init(rootDiv, urlContext, fCustom) {
        const selfs = this;
        this.titleScreenWaiting = false;
        try {
            if(urlContext) this.urlCtx = urlContext;

            this.readURLParameters();
            this.ssuuid = ShuttingStarsUtility.assureSSUUID();
            ShuttingStarsUtility.log('ShuttingStars - BUILD ' + ShuttingStars.build());

            this.backend = null;
            try {
                this.backend = SSBackend();
                if(this.backend != null) {
                    // 로그인 상태 변경 이벤트 부여
                    if(this.backend.authStateChangedEvents) this.backend.authStateChangedEvents.push(() => {
                        // 메뉴 목록 다시 갱신
                        selfs.getMenuList().then((menuList) => { selfs.menuListDynamic = menuList; }).catch((e) => { console.error(e); selfs.backend = null; });
                    });
                    // 지금도 메뉴 갱신
                    this.menuListDynamic = await this.getMenuList();
                    
                    // config.json 불러오기
                    const jsonConfigResp = await fetch(this.convertURL('[RSSC]json/config.json'));
                    const jsonConfigStr  = await jsonConfigResp.text();
                    const jsonConfig     = ShuttingStarsUtility.parseJSON(jsonConfigStr);

                    try { if(typeof(jsonConfig.frameTime             ) == 'number') this.frameTime              = jsonConfig.frameTime;                                                      } catch(ecf) {}
                    try { if(typeof(jsonConfig.resumeDelayTime       ) == 'number') this.resumeDelayTime        = jsonConfig.resumeDelayTime;                                                } catch(ecf) {}
                    try { if(typeof(jsonConfig.songTitleBaseTime     ) == 'number') this.songTitleBaseTime      = jsonConfig.songTitleBaseTime;                                              } catch(ecf) {}
                    try { if(typeof(jsonConfig.visualizeBarMultiplier) == 'number') this.visualizeBarMultiplier = jsonConfig.visualizeBarMultiplier;                                         } catch(ecf) {}
                    try { if(typeof(jsonConfig.backStarlightCount    ) == 'number') this.backStarlightCount     = jsonConfig.backStarlightCount;                                             } catch(ecf) {}
                    try { if(typeof(jsonConfig.noticeEn              ) == 'string') this.noticeEn               = jsonConfig.noticeEn;                                                       } catch(ecf) {}
                    try { if(typeof(jsonConfig.noticeKo              ) == 'string') this.noticeKo               = jsonConfig.noticeKo;                                                       } catch(ecf) {}
                    try { if(typeof(jsonConfig.noticeWhen            ) == 'number') this.noticeWhen             = jsonConfig.noticeWhen;                                                     } catch(ecf) {}
                    try { if(typeof(jsonConfig.mainFont              ) == 'string') this.fontFamily             = jsonConfig.mainFont;                                                       } catch(ecf) {}
                    try { if(typeof(jsonConfig.songBitMoreGapYoutube ) == 'number') this.songBitMoreGapYoutube  = jsonConfig.songBitMoreGapYoutube;                                          } catch(ecf) {}
                    try { if(typeof(jsonConfig.enterKey              ) == 'string') this.enterKey               = jsonConfig.enterKey;                                                       } catch(ecf) {}
                    try { if(typeof(jsonConfig.escKey                ) == 'string') this.escKey                 = jsonConfig.escKey;                                                         } catch(ecf) {}
                    try { if(typeof(jsonConfig.playKeys ) != 'undefined' && jsonConfig.playKeys  != null) { if(jsonConfig.playKeys.length  == 6) { this.keyList   = jsonConfig.playKeys;  }} } catch(ecf) {}
                    try { if(typeof(jsonConfig.arrowKeys) != 'undefined' && jsonConfig.arrowKeys != null) { if(jsonConfig.arrowKeys.length == 4) { this.arrowKeys = jsonConfig.arrowKeys; }} } catch(ecf) {} 

                    /*
                    // Remote Config 비활성화 - json 으로 대체
                    //     Remote Config 원격 설정 가져오기
                    const respJson = await this.backend.getRemoteConfigValues();
                    if(respJson.success) {
                        const valuesRecord = respJson.value;
                        
                        this.frameTime                = valuesRecord.frameTime.asNumber();
                        this.resumeDelayTime          = valuesRecord.resumeDelayTime.asNumber();
                        this.songTitleBaseTime        = valuesRecord.songTitleBaseTime.asNumber();
                        this.visualizeBarMultiplier   = valuesRecord.visualizeBarMultiplier.asNumber();
                        this.backStarlightCount       = valuesRecord.backStarlightCount.asNumber();
                        this.noticeEn                 = valuesRecord.noticeEn.asString();
                        this.noticeKo                 = valuesRecord.noticeKo.asString();
                        this.noticeWhen               = valuesRecord.noticeWhen.asNumber();
                    }
                    */
                }
            } catch(e) {
                ssConsoleLogs(this.trans('Cloud Manager import failed. Cloud features will be disabled.'));
                console.error(e);
                this.backend = null;
            }
            
        } catch(e) {
            console.error(e);
            this.backend = null;
        }
        try {
            this.logInit('init started');
            this.rebuildBroker();
            try { this.fBeforeInit(this.broker); this.logInit('fBeforeInit end.'); } catch(exSelf) { console.error(exSelf); this.logInit('fBeforeInit failed. ' + exSelf); }
            
            // 최상위 예약어 클래스
            let rootClassName = 'shuttingstars_root';

            // 최상위 예약어 클래스 중복 체크
            let mayBeDuplDivs = document.getElementsByClassName(rootClassName);
            if(mayBeDuplDivs.length >= 2) {
                this.logInit('duplicated root class names \'' + rootClassName + '\' !');
                throw new Error('duplicated root class names \'' + rootClassName + '\' !');
            } else if(mayBeDuplDivs.length == 1 && rootDiv != mayBeDuplDivs[0]) {
                if(rootDiv == null || typeof(rootDiv) == 'undefined') {
                    rootDiv = mayBeDuplDivs[0];
                } else if(rootDiv == mayBeDuplDivs[0]) {
                    rootDiv = mayBeDuplDivs[0];
                } else {
                    this.logInit('duplicated root class names \'' + rootClassName + '\' !');
                    throw new Error('duplicated root class names \'' + rootClassName + '\' !');
                }
            }

            // 최상단 HTML 영역 체크 (없으면 생성)
            if(typeof(rootDiv) == 'undefined' || rootDiv == null) {
                this.logInit('root div is not exist. creating start.');
                
                rootDiv = document.createElement('div');
                rootDiv.classList.add(rootClassName);
                document.body.appendChild(rootDiv);
            } else {
                if(! rootDiv.classList.contains(rootClassName)) rootDiv.classList.add(rootClassName);
            }

            this.logInit('root div prepared. ss inside dom creating....');

            let htmls = `
                <div class='shuttingstars_canvas_root'>           
                    <div class='shuttingstars_webaccessibility_layer sr_only only_for_screenreader'></div>   
                    <div class='shuttingstars_canvas_content_root' aria-hidden='true'>
                        <video class='shuttingstars_bga' preload='metadata'></video>
                        <div class='shuttingstars_youtubes invisible'></div>
                        <canvas class='shuttingstars_canvas'></canvas>   
                        <canvas class='shuttingstars_canvas_3d'></canvas>
                    </div>
                    <div class='shuttingstars_pop_root'></div>
                </div>                                     
            `;
            rootDiv.innerHTML = htmls;
            this.rootDiv = rootDiv;
            this.contentRoot = rootDiv.querySelector('.shuttingstars_canvas_content_root');
            this.videoBga    = rootDiv.querySelector('.shuttingstars_bga');
            this.youtubeDiv  = rootDiv.querySelector('.shuttingstars_youtubes');
            this.accessibilityLayer = rootDiv.querySelector('.shuttingstars_webaccessibility_layer');

            this.pops.root = this.rootDiv.querySelector('.shuttingstars_pop_root');
            this.renderPopupDiv();

            this.logInit('preparing global css...');

            // Set global CSS
            let styles = '';

            //     글꼴 설정
            let fonts = this.getRenderFontFamily();
            let targets = ['div', 'p', 'span', 'pre', 'input', 'textarea', 'select', 'button', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'table', 'tr', 'td', 'th', 'canvas', 'video', 'audio'];
            styles += '.shuttingstars_root';
            for(let domElem of targets) {
                styles += ', ';
                styles += '.shuttingstars_root ' + domElem;
            }
            styles += ' { font-family : ' + fonts + '; }\n';

            //     기본 CSS
            styles += `
                .shuttingstars_root { width: 100%; margin: 0; padding: 0; background: transparent; }
                .shuttingstars_root .full { width: 100%; }
                .shuttingstars_root .invisible { display: none !important; }
                .shuttingstars_root .only_for_screenreader { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); clip-path: polygon(0 0, 0 0, 0 0); white-space: nowrap; left: -19999px; top: -19999px; }
                .shuttingstars_root .ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .shuttingstars_root.ss_backend_guest   .ss_only_for_login_user { display: none !important; }
                .shuttingstars_root.ss_backend_logined .ss_only_for_guest      { display: none !important; }
                .shuttingstars_root button.btn       { background: transparent; border: 3px solid rgba(122, 165, 240, 0.7); color: rgba(122, 165, 240, 0.7); padding: 0.5rem 1.5rem 0.5rem 1.5rem; }
                .shuttingstars_root button.btn:hover { background: rgba(122, 165, 240, 0.1); border: 3px solid rgba(122, 165, 240, 0.8); color: rgba(122, 165, 240, 0.8); padding: 0.5rem 1.5rem 0.5rem 1.5rem; }
                .shuttingstars_root button.btn.red       { background: transparent; border: 3px solid rgba(244, 66, 66, 0.7); color: rgba(244, 66, 66, 0.7); padding: 0.5rem 1.5rem 0.5rem 1.5rem; }
                .shuttingstars_root button.btn.red:hover { background: rgba(244, 66, 66, 0.1); border: 3px solid rgba(244, 66, 66, 0.8); color: rgba(244, 66, 66, 0.8); padding: 0.5rem 1.5rem 0.5rem 1.5rem; }
                .shuttingstars_root .shuttingstars_canvas { position: absolute; left: 0px; top: 0px; }
                .shuttingstars_root .shuttingstars_youtubes { background: transparent; }
                .shuttingstars_root .shuttingstars_pop_dim  { position: fixed; left: 0px; top: 0px; width: 100%; height: 99999px; margin: 0; padding: 0; z-index: 11; background-color: rgba(80, 80, 80, 0.3); text-align: center; }
                .shuttingstars_root .shuttingstars_pop_dim2 { position: fixed; left: 0px; top: 0px; width: 100%; height: 99999px; margin: 0; padding: 0; z-index: 14; background-color: rgba(80, 80, 80, 0.3); text-align: center; }
                .shuttingstars_root .shuttingstars_pop_content { position: fixed; left: 0px; right: 0px; top : 50px; margin-left: auto; margin-right: auto; padding: 2rem 2rem 2rem 2rem; width: 500px; height: 300px; background-color: rgba(80, 80, 80, 0.9); color: rgba(180, 180, 180, 0.9); z-index: 1002; }
                .shuttingstars_root .shuttingstars_pop_content th, .shuttingstars_root .shuttingstars_pop_content td { padding: 1rem 1rem 1rem 1rem; }
                .shuttingstars_root .shuttingstars_pop_content th, .shuttingstars_root .shuttingstars_pop_content td, .shuttingstars_root .shuttingstars_pop_content input, .shuttingstars_root .shuttingstars_pop_content button {
                    font-size: 2rem;
                    line-height: 2.5rem;
                }
                .shuttingstars_root .shuttingstars_pop_content.shuttingstars_pop_content2 { z-index: 1005; }
            `;
            //     팝업 영역 CSS
            styles += `
                .shuttingstars_root .shuttingstars_pop_root .menu {
                    border: 0;
                    background: transparent;
                    margin-bottom: 10px;
                    padding: 0;
                }
                .shuttingstars_root .shuttingstars_pop_root .menu .btn_menu {
                    background-color: transparent;
                    color: rgba(120, 250, 120, 0.7);
                    border: 0;
                }
                .shuttingstars_root .shuttingstars_pop_root .menu .btn_menu:hover {
                    background-color: rgba(120, 250, 120, 0.1);
                    color: rgba(120, 250, 120, 0.8);
                }
                .shuttingstars_root .shuttingstars_pop_root .menu .btn_menu.active {
                    background-color: rgba(120, 250, 120, 0.3);
                    color: rgba(120, 250, 120, 0.99);
                }
                .shuttingstars_root .shuttingstars_pop_root .menu .btn_exit {
                    border: 0;
                    float: right;
                }
                .shuttingstars_root .shuttingstars_pop_root .menu .btn_exit:hover {
                    border: 0;
                }
            `;
            //     설정 영역 CSS
            // 상세설정 영역 공통 css 준비
            styles += `
                .shuttingstar_configlayer { margin-left: 2rem; margin-top: 2rem; font-size: 2rem; line-height: 2rem; padding: 20px 20px 20px 20px; overflow-y: auto; }
                .shuttingstar_configlayer input, .shuttingstar_configlayer select, .shuttingstar_configlayer button { font-size: 2rem; line-height: 2.5rem; }
                .shuttingstar_configlayer table, .shuttingstar_configlayer table td { border: 0; }
                .shuttingstar_configlayer table th { border: 0; text-align: left; }
                .shuttingstar_configlayer .shuttingstar_configsections th, .shuttingstar_configlayer .shuttingstar_configsections td { line-height: 3rem; }
                .shuttingstar_configlayer .shuttingstar_config_tabbuttons { width: 100%; text-align: left; }
                .shuttingstar_configlayer .shuttingstar_config_tabbuttons .btn_exit { float: right; }
                .shuttingstar_configlayer .tabarea        { display: none; }
                .shuttingstar_configlayer .tabarea.active { display: block; }
                .shuttingstar_configlayer button.tab        { background: transparent; border: 0; color: rgba(50, 230, 50, 0.7); }
                .shuttingstar_configlayer button.tab:hover  { background: rgba(50, 230, 50, 0.1); border: 0; color: rgba(50, 230, 50, 0.8); }
                .shuttingstar_configlayer button.tab.active { background: rgba(50, 230, 50, 0.2); border: 0; color: rgba(50, 230, 50, 0.9); }
                .shuttingstar_configlayer .shuttingstar_config_tabbuttons button.btn.red        { background: transparent; border: 0; color: rgba(250, 70, 70, 0.7); }
                .shuttingstar_configlayer .shuttingstar_config_tabbuttons button.btn.red:hover  { background: rgba(250, 70, 70, 0.1); border: 0; color: rgba(250, 70, 70, 0.8); }
                .shuttingstar_configlayer .shuttingstar_config_tabbuttons button.btn.red.active { background: rgba(250, 70, 70, 0.2); border: 0; color: rgba(250, 70, 70, 0.9); }
                .shuttingstar_configlayer .shuttingstar_config_inner { min-height: 500px; vertical-align: top; }
                .shuttingstar_configlayer .ta_json_song, .shuttingstar_configlayer .ta_packages { min-height: 500px; }
                .shuttingstar_configlayer .shuttingstar_tools_inner { height: 600px; overflow-y: scroll; }
                .shuttingstar_configlayer .shuttingstar_tools_inner .section { margin-bottom: 30px; }
                .shuttingstar_configcontrols { margin-top: 20px; }
            `;
            if(this.dark) {
                styles += `
                .shuttingstars_pop_content { background: rgba(80, 80, 80, 0.7); }
                .shuttingstars_pop_content, .shuttingstar_configlayer { background: rgba(80, 80, 80, 0.7); }
                .shuttingstars_pop_content input, .shuttingstars_pop_content select, .shuttingstars_pop_content textarea {
                    background: rgba(120, 120, 120, 0.7);
                    color : rgb(250, 250, 250);
                }
                `;
            } else {
                styles += `
                .shuttingstars_pop_content { background: rgba(200, 200, 200, 0.7); }
                .shuttingstars_pop_content, .shuttingstar_configlayer { background: rgba(200, 200, 200, 0.7); }
                .shuttingstars_pop_content input, .shuttingstars_pop_content select, .shuttingstars_pop_content textarea {
                    background: rgba(190, 190, 190, 0.7);
                    color : rgb(70, 70, 70);
                }
                `;
            }

            const styleElem = document.createElement('style');
            styleElem.type = 'text/css';
            styleElem.innerHTML = styles;
            document.head.appendChild(styleElem);

            // Theme 설정
            this.themeNotes.push(new SSNoteTheme('DEFAULT NOTE THEME'));
            this.themeNote = this.themeNotes[0];

            // 시각화 설정
            this.vizualizer2ds.push(new CircleTypeSSAudio2DVisualizer());
            this.vizualizer2ds.push(new BarTypeSSAudio2DVisualizer());
            this.vizualizer2d = this.vizualizer2ds[0];

            // 사용 가능한 상품 목록 - 기본값으로 초기화
            this.bonusAvails = this.bonusDefaults;

            // 언어 설정
            this.logInit('detecting system language...');
            this.stringTable = SSStringTable;

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
                } catch(exIn) { console.error(exIn); ShuttingStarsUtility.log('Cannot detect platform language. Using English...'); this.language = 'en'; }
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
            this.youtubeDiv.style.zIndex = this.mainZindex + 1;
            this.videoBga.style.zIndex = this.mainZindex + 2;
            canvas.style.zIndex = this.mainZindex + 3;
            canvas3d.style.zIndex = this.mainZindex + 4;

            this.youtubeDiv.style.background = 'transparent';
            this.videoBga.style.background = 'transparent';
            canvas3d.style.background = 'transparent';

            this.logInit('preparing 2d context...');

            this.canvas = canvas;
            this.canvas3d = canvas3d;
            this.ctx = canvas.getContext('2d');

            this.logInit('preparing canvas resolution...');

            // 3D 매니저 설정
            try {
                if(typeof(SS3DManager) != 'undefined') this.set3DManager(SS3DManager);
            } catch(ex3d) {
                ssConsoleLogs(this.trans('3D manager import failed. 3D features will be disabled.'));
                console.error(ex3d);
            }
            

            // 그래픽 해상도 설정
            this.settingGraphicQualityChoosing = this.settingsGraphicQuality[1];
            this.setResolution(this.ressets.w, this.ressets.h);

            this.logInit('detecting touchscreen...');

            // 가상 키 사용여부 지정
            if(this.virtualKeyNone) this.virtualKey = false;
            else if(this.virtualKeyForce) this.virtualKey = true;
            else (this.virtualKey = ShuttingStarsUtility.isTouchScreenPlatform());

            this.logInit('load settings...');

            // 최초 실행 감지
            const firsts = this.checkFirstUsing();

            // worker 사용 가능여부 체크 (초기값) - SSL 적용 시 기본값으로 활성화
            const rootHref = String(window.location.href);
            if(rootHref.indexOf('https:') == 0) { this.usingWorkerConfig = true; }
            
            // 설정 불러오기
            this.loadSettings();

            // worker 사용 가능여부 체크 (설정 적용 이후) - SSL 적용 안된 경우 설정값을 무시하고 worker 비활성화
            if(rootHref.indexOf('https:') != 0 && this.usingWorkerConfig) { this.usingWorkerConfig = false; }

            this.logInit('load songs...');

            // 공식 곡 불러오기
            if(typeof(SSBundleSongs) != 'undefined') {
                try {
                    for(let sdx=0; sdx<SSBundleSongs.length; sdx++) {
                        const songJsonOne = SSBundleSongs[sdx];
                        this.addSong(songJsonOne, true);
                    }
                } catch(ex3d) {
                    ssConsoleLogs(this.trans('3D manager import failed. 3D features will be disabled.'));
                    console.error(ex3d);
                }
            }
            
            // 기타 곡 불러오기
            await this.loadSongs();

            this.logInit('setting workers...');

            // 반복 처리 프로세스 (공통 동시처리 프로세스) 시작 (곡 동시처리 프로세스는 곡 초기화 시 진행)
            this.usingWorker = this.usingWorkerConfig;
            if(this.usingWorker) {
                this.workerSimultaneousWork = new Worker( this.convertURL('[RSSC]js/shuttingstarworker.js') );
                this.workerSimultaneousWork.postMessage({interval : this.frameTime});
                this.workerSimultaneousWork.onmessage = function(e) {
                    // const {drift, time} = e.data;
                    selfs.simultaneousWork();
                }
            } else {
                this.onDestroyTasks.push(ShuttingStarsUtility.repeat(() => { selfs.simultaneousWork(); }, 20));
            }

            // render 의 경우는 requestAnimationFrame 을 사용하여 브라우저에 최적화된 렌더링을 수행하도록 함
            const fRenderLoop = (timestamp) => { 
                selfs.render(); 
                if(this.stopRepeatRender) { this.stopRepeatRender = false; return;  }
                this.reqAniKey = requestAnimationFrame(fRenderLoop); // 재귀 호출
            };
            this.reqAniKey = requestAnimationFrame(fRenderLoop);
            this.onDestroyTasks.push(() => { 
                selfs.stopRepeatRender = true; 
                if(selfs.reqAniKey != null) { try { cancelAnimationFrame(selfs.reqAniKey); } catch(safes) {} }
                selfs.reqAniKey = null;
            });

            this.logInit('setting events...');

            // 키보드 키 누르기 / 떼기 이벤트 부여
            const fKeyDown = (event) => {
                if(selfs.createMode) return;
                if(selfs.keypressTiming <= 0) {
                    selfs.handleKeyInput(event.key.toUpperCase(), true);
                } else {
                    setTimeout(() => { selfs.handleKeyInput(event.key.toUpperCase(), true); }, selfs.keypressTiming);
                }
            };
            const fKeyUp = (event) => {
                if(selfs.createMode) return;
                if(selfs.keypressTiming <= 0) {
                    selfs.handleKeyRelease(event.key.toUpperCase(), true);
                } else {
                    setTimeout(() => { selfs.handleKeyRelease(event.key.toUpperCase(), true); }, selfs.keypressTiming);
                }
            };

            document.addEventListener('keydown', fKeyDown);
            document.addEventListener('keyup', fKeyUp);

            this.onDestroyTasks.push(() => { document.removeEventListener('keydown', fKeyDown); });
            this.onDestroyTasks.push(() => { document.removeEventListener('keyup'  , fKeyUp); });

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
                    if(selfs.mouseClickDebugMode) ShuttingStarsUtility.log('[MOUSECLICKED] ' + x + ', ' + y + " -> " + rx + ', ' + ry + ' in ' + rect.width + ':' + rect.height + ' to ' + selfs.getStageWidth() + ':' + selfs.getStageHeight());
                } else {
                    if(selfs.mouseClickDebugMode) ShuttingStarsUtility.log('[MOUSERELEASE] ' + x + ', ' + y + " -> " + rx + ', ' + ry + ' in ' + rect.width + ':' + rect.height + ' to ' + selfs.getStageWidth() + ':' + selfs.getStageHeight());
                }

                // 임시 객체 (충돌여부 판단 위함)
                const mouseCursorObject = new SSMouseClickHighlighter(selfs);
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
            const fMouseDown = (event) => {
                if(selfs.createMode) return;
                const obj = fMouseClickConversion(event, true);
                selfs.handleMouseClick(obj.x, obj.y, obj.cursor);
            };
            this.canvas.addEventListener('mousedown', fMouseDown);
            this.onDestroyTasks.push(() => { selfs.canvas.removeEventListener('mousedown', fMouseDown); });

            // 마우스 클릭 종료 이벤트 부여
            const fMouseUp = (event) => {
                if(selfs.createMode) return;
                const obj = fMouseClickConversion(event, false);
                selfs.handleMouseRelease(obj.x, obj.y, obj.cursor);
            };
            this.canvas.addEventListener('mouseup', fMouseUp);
            this.onDestroyTasks.push(() => { selfs.canvas.removeEventListener('mouseup', fMouseUp); });

            // 주 캔버스 위에 겹쳐져 있는 3D 장식용 캔버스에도 마우스 이벤트 동일하게 부여
            if(this.canvas3d != null) {
                const f3DMouseDown = (event) => {
                    if(selfs.createMode) return;
                    const obj = fMouseClickConversion(event, true);
                    selfs.handleMouseClick(obj.x, obj.y, obj.cursor);
                };
                this.canvas3d.addEventListener('mousedown', f3DMouseDown);
                this.onDestroyTasks.push(() => { selfs.canvas3d.removeEventListener('mousedown', f3DMouseDown); });

                const f3DMouseUp = (event) => {
                    if(selfs.createMode) return;
                    const obj = fMouseClickConversion(event, false);
                    selfs.handleMouseRelease(obj.x, obj.y, obj.cursor);
                };
                this.canvas3d.addEventListener('mouseup', f3DMouseUp);
                this.onDestroyTasks.push(() => { selfs.canvas3d.removeEventListener('mouseup', f3DMouseUp); });
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
            try { window.addEventListener('resize'  , fResize); } catch(ew) { console.error(ew); }
            try { window.addEventListener("pageshow", fResize); } catch(ew) { console.error(ew); }
            this.onDestroyTasks.push(() => { try { window.removeEventListener('resize'  , fResize); } catch(ew) { console.error(ew); } });
            this.onDestroyTasks.push(() => { try { window.removeEventListener('pageshow', fResize); } catch(ew) { console.error(ew); } });

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
                this.numberDebugMode = true;
                this.performanceDebugMode = true;
            }

            // 커맨드 설정
            this.prepareCommands();

            // 미션 생성
            this.missions.push(new EasySurviveSSMission(this));
            this.missions.push(new NormalSurviveSSMission(this));
            this.missions.push(new HardSurviveSSMission(this));
            this.missions.push(new VeryHardSurviveSSMission(this));
            this.missions.push(new CrazySurviveSSMission(this));

            // fCustom 호출
            if(typeof(fCustom) == 'function') { this.rebuildBroker(); fCustom(this.broker); }

            this.logInit('loading third parties...');
            await this.loadAfter();

            this.logInit('preparing background audio...');

            // 배경음악 준비
            let convertedURL = this.convertURL('[RSSC]songs/ai/Third_Cup_Before_Departure.mp3');
            if(ShuttingStarsUtility.isDateToday('yyyy-12-24') || ShuttingStarsUtility.isDateToday('yyyy-12-25')) {
                convertedURL = this.convertURL('[RSSC]songs/ai/Snow_on_the_Town_Square.mp3');
            }
            // Blob URL로 변환 시도
            try { convertedURL = await ShuttingStarsUtility.convertToBlobURL(convertedURL); } catch(exc) { ShuttingStarsUtility.log('Ignorable exception - ' + exc); console.error(exc); }

            try {
                this.audioBackground = new Audio(convertedURL);
                this.audioBackground.loop = true;
                // 지금 재생하면 크롬계열에서 오류 Uncaught (in promise) NotAllowedError: play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD
            } catch(exAudio) {
                console.error(exAudio);
                ShuttingStarsUtility.toast('Loading audio failed !', true);
            }

            try {
                this.se.tick     = new Audio(this.convertURL('[RSSC]se/tick.ogg'));
                this.se.accept1  = new Audio(this.convertURL('[RSSC]se/sonniss-gdc/accept01.mp3'));
                this.se.accept2  = new Audio(this.convertURL('[RSSC]se/sonniss-gdc/accept02.mp3'));
                this.se.cancel   = new Audio(this.convertURL('[RSSC]se/sonniss-gdc/cancel02.mp3'));
                this.se.special1 = new Audio(this.convertURL('[RSSC]se/sonniss-gdc/special02.mp3'));
            } catch(exAudio) {
                console.error(exAudio);
            }

            this.menuListDynamic = selfs.menuList;
            const mnList = await this.getMenuList();
            this.menuListDynamic = mnList;
            this.menuChoosing = this.menuListDynamic[0];

            await this.loadCredit();
            await this.afterInitialized();
            if(firsts) await this.setState('firstset');
            this.logInit('starting game...');

            this.rebuildBroker();
            return this.broker;
        } catch(eGlobal) {
            ShuttingStarsUtility.toast('ERROR : ' + eGlobal, true);
            console.error(eGlobal);
            ShuttingStarsUtility.toast('Last Success : ' + this.lastInitSuccessMessage);
            this.destroy();
            throw eGlobal;
        }
    }

    /**
     * 초기화 완료 후 호출
     */
    afterInitialized() {
        const selfs = this;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    selfs.rebuildBroker();
                    if(selfs.createMode) selfs.fAfterInit(selfs.broker, selfs);
                    else                 selfs.fAfterInit(selfs.broker, null);
                    selfs.logInit('fAfterInit end.'); 
                } catch(exSelf) { console.error(exSelf); selfs.logInit('fAfterInit failed. ' + exSelf); }

                selfs.handleScreenResized();
                selfs.titleScreenWaiting = true;
                selfs.accessililityLog('Press ENTER key to continue.');
                selfs.fGameEvent({ "event" : 'afterinit', "broker" : selfs.broker });
                resolve(true);
            }, selfs.initializingDelayTime);
        });
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
     * 게임 자체의 상태 변경 (Promise)
     * @param {string} state state 값
     * @returns {Promise<*>}
     */
    async setState(state) {
        const selfs = this;
        let idx;

        this.beforeState = this.state;
        this.state = state;

        // 마우스 이벤트 제거
        this.mouseEvents = [];

        // 가상 키 모두 제거
        for(idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if(obj instanceof SSVirtualKey) {
                this.objects.splice(idx, 1);
                idx--;
            }
        }

        if(this.state == 'empty') { // 빈 화면
            await this.resetStage();
        } else {
            // 공용 가상 키 및 마우스 이벤트 부여
            this.addDeclaredKeys(this.enterKey);
            this.addDeclaredKeys(this.escKey);

            // 상태 별 가상 키 및 마우스 이벤트 부여
            if(this.basicStates.indexOf(state) >= 0) { // 기본 상태들
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

                    // 곡 선택 화면 - 유튜브 기반 곡의 경우 S 키로 유튜브 접속 가능해야 함
                    if(state == 'songchoosing' || state == 'listenchoosing') {
                        this.addDeclaredKeys(this.keyList[0]);
                    }

                    // 감상 모드 - D키로 곡 선택해야 함
                    if(state == 'listenchoosing') {
                        this.addDeclaredKeys(this.keyList[1]);
                    }
                }
                // 상태 별 가상 키 및 마우스 이벤트 부여 // 종료

                // 상태별 데이터 조회 요청
                if(state == 'recordlist') {
                    if(this.selectRecordType == 'internet') { this.getInternetRecords().then((list) => { selfs.selectedRecordList = list; if(list != null && list.length >= 1) selfs.seeingRecord = selfs.selectedRecordList[0]; }); }
                }

                // 곡 준비상태 초기화
                if(state != 'playing' && state != 'listenplaying') {
                    this.songPrepared = false;
                }

                // 일부 상태는 스테이지 리셋이 필요
                if(state == 'menu' || state == 'playing' || state == 'listenplaying' || state == 'songchoosing' || state == 'songtitle' || state == 'listenchoosing' || state == 'listentitle') {
                    await this.resetStage();
                }

                // 최초 메뉴 진입 시 창 크기 다시 새로고침
                if(this.beforeState == 'title' && (state == 'menu' || state == 'songtitle' || state == 'listentitle')) {
                    this.handleScreenResized();
                }

                // 설정 화면
                if(state == 'setting') {
                    // 설정 화면 진입 시, 직전 state 백업
                    this.beforeSettingState = this.beforeState;

                    if(this.configDiv != null) {
                        // 캔버스 내 자체 설정화면 대신, 상세설정 div 레이어를 띄움
                        this.openConfigDiv();
                    }
                }
            } else { // 그외 상태들
                for(idx=0; idx<this.states.length; idx++) {
                    const stateOne = this.states[idx];
                    if(stateOne.name == state) {
                        stateOne.onStateChanged(this);
                    }
                }
            }
        }

        // 상태 변경 로깅
        if(this.backend != null) {
            try { this.backend.logEvent('STATE ' + state); } catch(ignores) {}
        }

        // 웹 접근성 관련 처리
        this.processWebAccessibility(state);

        // 이벤트
        this.fGameEvent({ "event" : 'statechanged', "broker" : this.broker, "state" : state, "before" : this.beforeState });
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
        this.broker.language                = this.language                ;
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
        this.broker.initializingDelayTime   = this.initializingDelayTime   ;
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
        this.broker.numberDebugMode         = this.numberDebugMode         ;
        this.broker.performanceDebugMode    = this.performanceDebugMode    ;
        this.broker.visualizePeakDebugMode  = this.visualizePeakDebugMode  ;
        this.broker.gameOverEnabled         = this.gameOverEnabled         ;
        this.broker.hardcoreMode            = this.hardcoreMode            ;
        this.broker.mysophobiaMode          = this.mysophobiaMode          ;
        this.broker.virtualKeyForce         = this.virtualKeyForce         ;
        this.broker.urlCtx                  = this.urlCtx                  ;
        this.broker.rsscDirName             = this.rsscDirName             ;
        this.broker.showGameTitle           = this.showGameTitle           ;
        this.broker.fOuterWidth             = this.fOuterWidth             ;
        this.broker.fOuterHeight            = this.fOuterHeight            ;
        this.broker.fOnShutdownCalled       = this.fOnShutdownCalled       ;
        this.broker.fGameEvent              = this.fGameEvent              ;
        this.broker.fRefresh                = this.fRefresh                ;
        this.broker.fCanvasResized          = this.fCanvasResized          ;
        this.broker.fOnFirstUse             = this.fOnFirstUse             ;
        this.broker.songs                   = [];
        for(let sdx=0; sdx<this.songs.length; sdx++) {
            this.broker.songs.push(this.songs[sdx]);
        }

        this.broker.apply = function(obj) {
            const brokerSelf = this;

            // createMode 는 한번 true 로 바꾸면 false 로 변경 못해야 함
            if(typeof(obj.createMode) != 'undefined') {
                if(obj.createMode) selfs.createMode = true;
            }
            
            // 기타 항목 처리
            if(typeof(obj.dark                   ) != 'undefined') { selfs.dark                    = obj.dark                    ; brokerSelf.dark                    = obj.dark                    }
            if(typeof(obj.language               ) != 'undefined') { selfs.language                = obj.language                ; brokerSelf.language                = obj.language                }
            if(typeof(obj.reverseVertical        ) != 'undefined') { selfs.reverseVertical         = obj.reverseVertical         ; brokerSelf.reverseVertical         = obj.reverseVertical         }
            if(typeof(obj.keyList                ) != 'undefined') { selfs.keyList                 = obj.keyList                 ; brokerSelf.keyList                 = obj.keyList                 }
            if(typeof(obj.arrowKeys              ) != 'undefined') { selfs.arrowKeys               = obj.arrowKeys               ; brokerSelf.arrowKeys               = obj.arrowKeys               }
            if(typeof(obj.enterKey               ) != 'undefined') { selfs.enterKey                = obj.enterKey                ; brokerSelf.enterKey                = obj.enterKey                }
            if(typeof(obj.escKey                 ) != 'undefined') { selfs.escKey                  = obj.escKey                  ; brokerSelf.escKey                  = obj.escKey                  }
            if(typeof(obj.fontFamily             ) != 'undefined') { selfs.fontFamily              = obj.fontFamily              ; brokerSelf.fontFamily              = obj.fontFamily              }
            if(typeof(obj.pointFont              ) != 'undefined') { selfs.pointFont               = obj.pointFont               ; brokerSelf.pointFont               = obj.pointFont               }
            if(typeof(obj.alterFonts             ) != 'undefined') { selfs.alterFonts              = obj.alterFonts              ; brokerSelf.alterFonts              = obj.alterFonts              }
            if(typeof(obj.volume                 ) != 'undefined') { selfs.volume                  = obj.volume                  ; brokerSelf.volume                  = obj.volume                  }
            if(typeof(obj.volumeBackgroundDefault) != 'undefined') { selfs.volumeBackgroundDefault = obj.volumeBackgroundDefault ; brokerSelf.volumeBackgroundDefault = obj.volumeBackgroundDefault }
            if(typeof(obj.initializingDelayTime  ) != 'undefined') { selfs.initializingDelayTime   = obj.initializingDelayTime   ; brokerSelf.initializingDelayTime   = obj.initializingDelayTime   }
            if(typeof(obj.noteSpeedMultiplier    ) != 'undefined') { selfs.noteSpeedMultiplier     = obj.noteSpeedMultiplier     ; brokerSelf.noteSpeedMultiplier     = obj.noteSpeedMultiplier     }
            if(typeof(obj.useAudioVisualizer     ) != 'undefined') { selfs.useAudioVisualizer      = obj.useAudioVisualizer      ; brokerSelf.useAudioVisualizer      = obj.useAudioVisualizer      }
            if(typeof(obj.renderDebugMode        ) != 'undefined') { selfs.renderDebugMode         = obj.renderDebugMode         ; brokerSelf.renderDebugMode         = obj.renderDebugMode         }
            if(typeof(obj.stringTableDebugMode   ) != 'undefined') { selfs.stringTableDebugMode    = obj.stringTableDebugMode    ; brokerSelf.stringTableDebugMode    = obj.stringTableDebugMode    }
            if(typeof(obj.keyInputDebugMode      ) != 'undefined') { selfs.keyInputDebugMode       = obj.keyInputDebugMode       ; brokerSelf.keyInputDebugMode       = obj.keyInputDebugMode       }
            if(typeof(obj.keyReleaseDebugMode    ) != 'undefined') { selfs.keyReleaseDebugMode     = obj.keyReleaseDebugMode     ; brokerSelf.keyReleaseDebugMode     = obj.keyReleaseDebugMode     }
            if(typeof(obj.mouseClickDebugMode    ) != 'undefined') { selfs.mouseClickDebugMode     = obj.mouseClickDebugMode     ; brokerSelf.mouseClickDebugMode     = obj.mouseClickDebugMode     }
            if(typeof(obj.initDebugMode          ) != 'undefined') { selfs.initDebugMode           = obj.initDebugMode           ; brokerSelf.initDebugMode           = obj.initDebugMode           }
            if(typeof(obj.songDebugMode          ) != 'undefined') { selfs.songDebugMode           = obj.songDebugMode           ; brokerSelf.songDebugMode           = obj.songDebugMode           }
            if(typeof(obj.coordinate2dDebugMode  ) != 'undefined') { selfs.coordinate2dDebugMode   = obj.coordinate2dDebugMode   ; brokerSelf.coordinate2dDebugMode   = obj.coordinate2dDebugMode   }
            if(typeof(obj.timeElapseDebugMode    ) != 'undefined') { selfs.timeElapseDebugMode     = obj.timeElapseDebugMode     ; brokerSelf.timeElapseDebugMode     = obj.timeElapseDebugMode     }
            if(typeof(obj.numberDebugMode        ) != 'undefined') { selfs.numberDebugMode         = obj.numberDebugMode         ; brokerSelf.numberDebugMode         = obj.numberDebugMode         }
            if(typeof(obj.performanceDebugMode   ) != 'undefined') { selfs.performanceDebugMode    = obj.performanceDebugMode    ; brokerSelf.performanceDebugMode    = obj.performanceDebugMode    }
            if(typeof(obj.visualizePeakDebugMode ) != 'undefined') { selfs.visualizePeakDebugMode  = obj.visualizePeakDebugMode  ; brokerSelf.visualizePeakDebugMode  = obj.visualizePeakDebugMode  }
            if(typeof(obj.gameOverEnabled        ) != 'undefined') { selfs.gameOverEnabled         = obj.gameOverEnabled         ; brokerSelf.gameOverEnabled         = obj.gameOverEnabled         }
            if(typeof(obj.hardcoreMode           ) != 'undefined') { selfs.hardcoreMode            = obj.hardcoreMode            ; brokerSelf.hardcoreMode            = obj.hardcoreMode            }
            if(typeof(obj.mysophobiaMode         ) != 'undefined') { selfs.mysophobiaMode          = obj.mysophobiaMode          ; brokerSelf.mysophobiaMode          = obj.mysophobiaMode          }
            if(typeof(obj.virtualKeyForce        ) != 'undefined') { selfs.virtualKeyForce         = obj.virtualKeyForce         ; brokerSelf.virtualKeyForce         = obj.virtualKeyForce         }
            if(typeof(obj.showGameTitle          ) != 'undefined') { selfs.showGameTitle           = obj.showGameTitle           ; brokerSelf.showGameTitle           = obj.showGameTitle           }
            if(typeof(obj.urlCtx                 ) != 'undefined') { selfs.urlCtx                  = obj.urlCtx                  ; brokerSelf.urlCtx                  = obj.urlCtx                  }
            if(typeof(obj.rsscDirName            ) != 'undefined') { selfs.rsscDirName             = obj.rsscDirName             ; brokerSelf.rsscDirName             = obj.rsscDirName             }
            if(typeof(obj.fOuterWidth            ) == 'function' ) { selfs.fOuterWidth             = obj.fOuterWidth             ; brokerSelf.fOuterWidth             = obj.fOuterWidth             }
            if(typeof(obj.fOuterHeight           ) == 'function' ) { selfs.fOuterHeight            = obj.fOuterHeight            ; brokerSelf.fOuterHeight            = obj.fOuterHeight            }
            if(typeof(obj.fOnShutdownCalled      ) == 'function' ) { selfs.fOnShutdownCalled       = obj.fOnShutdownCalled       ; brokerSelf.fOnShutdownCalled       = obj.fOnShutdownCalled       }
            if(typeof(obj.fGameEvent             ) == 'function' ) { selfs.fGameEvent              = obj.fGameEvent              ; brokerSelf.fGameEvent              = obj.fGameEvent              }
            if(typeof(obj.fRefresh               ) == 'function' ) { selfs.fRefresh                = obj.fRefresh                ; brokerSelf.fRefresh                = obj.fRefresh                }
            if(typeof(obj.fCanvasResized         ) == 'function' ) { selfs.fCanvasResized          = obj.fCanvasResized          ; brokerSelf.fCanvasResized          = obj.fCanvasResized          }
            if(typeof(obj.fOnFirstUse            ) == 'function' ) { selfs.fOnFirstUse             = obj.fOnFirstUse             ; brokerSelf.fOnFirstUse             = obj.fOnFirstUse             }

            if(typeof(obj.songs                  ) != 'undefined') {
                for(let ssdx=0; ssdx<obj.songs.length; ssdx++) {
                    selfs.addSong(obj.songs[ssdx]);
                }
            }
        }
        
        this.broker.parseSong  = function(json) { return selfs.parseSong(json); }
        this.broker.addSong    = function(song) { return selfs.addSong(song);   }
        this.broker.setSongOne = function(song, idx) { selfs.songs[idx] = song; }
        this.broker.setSong    = function(song) { selfs.song = song; }
        this.broker.setDifficultyChoosingList = function(difList) { selfs.difficultyChoosingList = difList; }
        this.broker.setDifficultyIndex = function(index) {
            selfs.difficulty                = selfs.difficultyChoosingList[parseInt(index)]; 
            selfs.difficultyLevel           = selfs.difficulty.difficultyLevel;
            selfs.difficultyUsingAutoCreate = selfs.difficulty.autoCreate;
        }
        this.broker.prepareCreateModeSong = async function() {
            selfs.difficultyChoosing = false;

            selfs.songTitleTime = selfs.songTitleBaseTime;
            if(! isNaN(selfs.song.loadingTime)) selfs.songTitleTime += selfs.song.loadingTime;

            selfs.difficultyChoosing = false;
            selfs.titleDelayTime = Math.floor(20 * (selfs.noteSpeedMultiplier - 1));

            // 곡 플레이 선택함.
            await selfs.setState('songtitle');
        }
        this.broker.playSong = async function(song, difficultyLevel, listen) {
            await selfs.playSong(song, difficultyLevel, listen);
        }
        this.broker.directSelectSong = async function(song) {
            await selfs.directSelectSong(song);
        }
        this.broker.setEmpty = function() { selfs.setState('empty'); }
        this.broker.refreshPage = function() { selfs.callRefresh(); }
        this.broker.stopSong = function() { selfs.onSongEnd(); }
        this.broker.getAllSongData = function(fFilter) { return selfs.getAllSongData(fFilter); }
        this.broker.getAllSongPromise = async function(urlCtx, fFilter) { return await selfs.getAllSongPromise(urlCtx, fFilter); }
        this.broker.getState = function() { return selfs.state; }
        this.broker.translate = function(english) { return selfs.trans(english); }
        this.broker.setStringTable = function(table) { selfs.stringTable = table; }
        this.broker.updateStringTable = function(table) { selfs.updateStringTable(table); }
        this.broker.getBackendBroker = function() {
            if(! selfs.backend) return null;
            return getSSBackendBroker(selfs.backend);
        }
        this.broker.destroy = function() { selfs.destroy(); };
        this.broker.officialSongSerials = [];
        for(let idx=0; idx<this.officialSongSerials.length; idx++) {
            this.broker.officialSongSerials.push(this.officialSongSerials[idx]);
        }
        return this.broker;
    }

    /**
     * 메뉴 목록 반환, this.menuList 에 더해 로그인 여부 등 동적으로 원소가 추가될 수 있음, Promise
     * @returns {Promise<*>} 처리 결과 (새 메뉴 목록으로 string 배열이 탑재됨)
     */
    getMenuList() {
        const selfs = this;
        return new Promise((resolve, reject) => {
            const fResolve = (newList) => {
                // newList 에 exit 존재여부 확인
                let exitExists = (newList.indexOf('exit') >= 0);
                // exit 존재 시 일단 제거
                if(exitExists) { newList.splice(newList.indexOf('exit'), 1); }
                // 게임 종료 함수가 지정된 경우, exit 다시 추가 (맨 뒤에)
                if(typeof(selfs.fOnShutdownCalled) == 'function') {
                    newList.push('exit');
                }
                resolve(newList);
            };

            if(selfs.backend == null) {
                fResolve( selfs.menuList );
                return;
            }

            const fLogined = () => {
                let newList = [];
                let classicList = selfs.menuList;

                // 기존 메뉴 대부분 그대로 유지
                for(let idx=0; idx<classicList.length; idx++) {
                    const menuOne = classicList[idx];

                    if(idx == 3) newList.push('community'); // 4번째 위치에 커뮤니티 추가
                    newList.push(menuOne);
                }

                // 로그아웃 메뉴 추가
                newList.push('logout');

                // 푸시 권한 획득
                // selfs.backend.requestPushPermission();

                // rootDiv 에 표시
                if(selfs.rootDiv != null) {
                    selfs.rootDiv.classList.add('ss_backend_logined');
                    selfs.rootDiv.classList.remove('ss_backend_guest');
                }

                // 설정 동기화 시도
                selfs.loadCloudSettings().then(() => { fResolve(newList); }).catch((exc) => { console.error(exc); fResolve(newList); });
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

                // rootDiv 에 표시
                if(selfs.rootDiv != null) {
                    selfs.rootDiv.classList.remove('ss_backend_logined');
                    selfs.rootDiv.classList.add('ss_backend_guest');
                }

                fResolve(newList);
            };
            try {
                selfs.backend.checkLogined().then((checkRes) => {
                    if(checkRes.loginAvail) {
                        // 로그인 성공
                        fLogined();
                    } else {
                        // 로그인 안됨
                        fNotLogined();
                    }
                }).catch((exc) => {
                    console.error(exc);
                    fNotLogined();
                });
            } catch(e) {
                console.error(e);
                fResolve( selfs.menuList );
            }
        });
    }

    /**
     * 가상 키 추가
     * @param {string} realkey realkey 값
     */
    addDeclaredKeys(realkey) {
        const selfs = this;
        const rkey = realkey;
        const vkey = new SSVirtualKey(this, rkey);
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

        this.fGameEvent({ "event" : 'resolutionchanged', "broker" : this.broker, "width" : w, "height" : h, "landscape" : this.screenDirLandscape });
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
                ShuttingStarsUtility.parseJSON(settingJsonStr); 
                return false;
            }
        } catch(e) {
            console.error(e);
            ShuttingStarsUtility.toast('ERROR : ' + e);
            this.resetAll(() => {
                setTimeout(() => { 
                    selfs.fGameEvent({ "event" : 'refreshpage', "broker" : selfs.broker });
                    if(typeof(selfs.fOnFirstUse) == 'function') {
                        selfs.rebuildBroker();
                        selfs.fOnFirstUse(selfs.broker);
                    }
            }, 4000);
            });
        }
        return true;
    }

    /** 화면 새로고침 호출 */
    callRefresh() {
        if(typeof(this.fRefresh) == 'function') this.fRefresh(); 
        else location.reload();
    }

    /**
     * 설정 불러오기 (Promise)
     */
    async loadSettings() {
        try {
            let settingJsonStr = localStorage.getItem('shuttingstar_settings');
            if(typeof(settingJsonStr) != 'undefined' && settingJsonStr != null && settingJsonStr != '') {
                let settingJson = ShuttingStarsUtility.parseJSON(settingJsonStr);
                
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

                if(typeof(settingJson.mainFont) != 'undefined') {
                    this.mainFont = settingJson.mainFont;
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

                if(typeof(settingJson.judgeTiming) != 'undefined') {
                    this.judgeTiming = settingJson.judgeTiming;
                    if(typeof(this.judgeTiming) == 'string') this.judgeTiming = parseInt(this.judgeTiming);
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
                        ShuttingStarsUtility.log('Resolution setting is wrong.');
                        console.error(e2);
                        ShuttingStarsUtility.log('Trying with default resolution...')
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

                if(typeof(settingJson.hardcoreMode) != 'undefined') {
                    this.hardcoreMode = settingJson.hardcoreMode;
                    if(typeof(this.hardcoreMode) == 'string') this.hardcoreMode = ( (this.hardcoreMode == 'Y' || this.hardcoreMode == 'true') ? true : false );
                }

                if(typeof(settingJson.mysophobiaMode) != 'undefined') {
                    this.mysophobiaMode = settingJson.mysophobiaMode;
                    if(typeof(this.mysophobiaMode) == 'string') this.mysophobiaMode = ( (this.mysophobiaMode == 'Y' || this.mysophobiaMode == 'true') ? true : false );
                }

                if(typeof(settingJson.invisibleNoteMode) != 'undefined') {
                    this.invisibleNoteMode = settingJson.invisibleNoteMode;
                    if(typeof(this.invisibleNoteMode) == 'string') this.invisibleNoteMode = ( (this.invisibleNoteMode == 'Y' || this.invisibleNoteMode == 'true') ? true : false );
                }

                if(typeof(settingJson.noLongNote) != 'undefined') {
                    this.noLongNote = settingJson.noLongNote;
                    if(typeof(this.noLongNote) == 'string') this.noLongNote = ( (this.noLongNote == 'Y' || this.noLongNote == 'true') ? true : false );
                }

                if(typeof(settingJson.keyList) != 'undefined') {
                    try {
                        if(typeof(settingJson.keyList) == 'string') settingJson.keyList = ShuttingStarsUtility.parseJSON(settingJson.keyList);
                        if(settingJson.keyList.length != 6) throw 'Wrong key list counts';
                        this.keyList = settingJson.keyList;
                    } catch(e2) {
                        ShuttingStarsUtility.log('Resolution setting is wrong.');
                        console.error(e2);
                        ShuttingStarsUtility.log('Trying with default resolution...');
                    }  
                }

                if(typeof(settingJson.language) != 'undefined') {
                    if(! settingJson.languageDefault) {
                        this.language = settingJson.language;
                    }
                }

                if(typeof(settingJson.usingWorkerConfig) != 'undefined') {
                    this.usingWorkerConfig = false;
                    if(settingJson.usingWorkerConfig) this.usingWorkerConfig = true;
                }

                if(typeof(settingJson.bonusAvails) != 'undefined') {
                    this.bonusAvails = settingJson.bonusAvails;
                    // 기본 활성화 상품들 체크 (없으면 추가해야 함)
                    for(let gdx=0; gdx<this.bonusDefaults.length; gdx++) {
                        const defaultOne = this.bonusDefaults[gdx];
                        if(this.bonusAvails.indexOf(defaultOne) < 0) this.bonusAvails.push(defaultOne);
                    }
                }
            }

            this.setResolution(this.ressets.w, this.ressets.h);
        } catch(e) {
            ShuttingStarsUtility.log('Failed to load settings.');
            console.error(e);
            ShuttingStarsUtility.log('Continue with default settings.');
            await this.saveSettings(false);
        }
    }

    /**
     * 설정 저장 (Promise)
     * 
     * @param {boolean} skipCloudSaves 클라우드 저장 건너뛰기 설정
     */
    async saveSettings(skipCloudSaves) {
        try {
            let settingJson = {}
            settingJson.keyList             = this.keyList;
            settingJson.arrowKeys           = this.arrowKeys;
            settingJson.enterKey            = this.enterKey;
            settingJson.escKey              = this.escKey;
            settingJson.mainFont            = this.mainFont;
            settingJson.noteSpeedMultiplier = this.noteSpeedMultiplier;
            settingJson.reverseVertical     = this.reverseVertical;
            settingJson.keypressTiming      = this.keypressTiming;
            settingJson.songTiming          = this.songTiming;
            settingJson.judgeTiming         = this.judgeTiming;
            settingJson.resolution          = Math.floor(this.ressets.h * 16 / 9) + ',' + this.ressets.h;
            settingJson.disable3d           = this.disable3d;
            settingJson.disable2d           = this.disable2d;
            settingJson.hardcoreMode        = this.hardcoreMode;
            settingJson.mysophobiaMode      = this.mysophobiaMode;
            settingJson.invisibleNoteMode   = this.invisibleNoteMode;
            settingJson.noLongNote          = this.noLongNote;
            settingJson.language            = this.language;
            settingJson.languageDefault     = this.languageDefault;
            settingJson.usingWorkerConfig   = this.usingWorkerConfig;
            settingJson.bonusAvails         = this.bonusAvails;

            localStorage.setItem('shuttingstar_settings', JSON.stringify(settingJson));
        } catch(e) {
            ShuttingStarsUtility.log('Failed to save settings.');
            console.error(e);
        }

        await this.saveCredit();

        if(skipCloudSaves) return;
        if(this.backend != null) {
            if(this.backend.logined) {
                if(this.useCloudSettings) {
                    try {
                        await this.backend.storeOuterStorage({
                            keyList             : this.keyList,
                            fontFamily          : this.fontFamily,
                            noteSpeedMultiplier : this.noteSpeedMultiplier,
                            language            : this.language,
                            languageDefault     : this.languageDefault,
                            bonusAvails         : this.bonusAvails
                        });
                    } catch(ex) {
                        console.error(ex);
                    }
                }
            }
        }
    }

    /** 설정 불러오기 (백엔드 DB 사용, Promise) */
    async loadCloudSettings() {
        if(this.backend != null) {
            if(this.backend.logined) {
                if(this.useCloudSettings) {
                    try {
                        const responses = await this.backend.getOuterStorage();
                        if(responses.success) {
                            const data = responses.data;
                            if(typeof(data.keyList            ) != 'undefined') this.keyList             = data.keyList;
                            if(typeof(data.fontFamily         ) != 'undefined') this.fontFamily          = data.fontFamily;
                            if(typeof(data.noteSpeedMultiplier) != 'undefined') this.noteSpeedMultiplier = data.noteSpeedMultiplier;
                            if(typeof(data.language           ) != 'undefined') this.language            = data.language;
                            if(typeof(data.languageDefault    ) != 'undefined') this.languageDefault     = data.languageDefault;

                            if(typeof(data.bonusAvails) != 'undefined') {
                                this.bonusAvails = data.bonusAvails;
                                // 기본 활성화 상품들 체크 (없으면 추가해야 함)
                                for(let gdx=0; gdx<this.bonusDefaults.length; gdx++) {
                                    const defaultOne = this.bonusDefaults[gdx];
                                    if(this.bonusAvails.indexOf(defaultOne) < 0) this.bonusAvails.push(defaultOne);
                                }
                            }
                            await this.saveSettings(true);
                        }
                    } catch(e) {
                        console.error(e);
                    }
                }
            }
        }
    }

    /** 게임 내 재화 불러오기 (Promise) - 메뉴의 Credit 과 의미가 다름 ! */
    async loadCredit() {
        // antiMatterCredit 로컬에서 불러오기
        try {
            const step1 = localStorage.getItem('shuttingstar_credit');
            if(step1 != null && typeof(step1) != 'undefined' && step1 != '') {
                const step2 = ShuttingStarsUtility.parseJSON(step1);
                
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
            ShuttingStarsUtility.log('Failed to load anti-matter credit.');
            console.error(e);
            this.antiMatterCredit = 0;
            this.reportSaved = { PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0, maxCombo : 0, playCount : 0, used : 0 };
        }

        // 백엔드에서 불러오기
        try {
            if(this.backend != null) {
                const checkLoginRes = await this.backend.checkLogined();
                if(checkLoginRes.loginAvail) {
                    const userInfo = await this.backend.loadUserInfo();
                    if((! userInfo.success) || (userInfo.data == null)) {
                        this.antiMatterCredit = 0;
                        this.darkMatterCredit = 0;
                        this.reportSaved = { PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0, maxCombo : 0, playCount : 0, used : 0 };
                    } else {
                        const creditInfo = userInfo.data.credits;
                        const hashes = await this.hashCredit(creditInfo);
                        if(hashes == userInfo.data.hashKey) {
                            this.antiMatterCredit = creditInfo.antiMatter;
                            this.darkMatterCredit = creditInfo.darkMatter;
                            this.reportSaved.PERFECT   = creditInfo.PERFECT;
                            this.reportSaved.GREAT     = creditInfo.GREAT;
                            this.reportSaved.GOOD      = creditInfo.GOOD;
                            this.reportSaved.BAD       = creditInfo.BAD;
                            this.reportSaved.MISS      = creditInfo.MISS;
                            this.reportSaved.maxCombo  = creditInfo.maxCombo;
                            this.reportSaved.playCount = creditInfo.playCount;
                            this.reportSaved.used      = creditInfo.used;
                        } else {
                            this.antiMatterCredit = 0;
                            this.darkMatterCredit = 0;
                            this.reportSaved = { PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0, maxCombo : 0, playCount : 0, used : 0 };
                        }
                    }
                }

                // rootDiv 에 표시
                if(this.rootDiv != null) {
                    if(checkLoginRes.loginAvail) {
                        this.rootDiv.classList.add('ss_backend_logined');
                        this.rootDiv.classList.remove('ss_backend_guest');
                    } else {
                        this.rootDiv.classList.add('ss_backend_guest');
                        this.rootDiv.classList.remove('ss_backend_logined');
                    }
                }
            }
        } catch(e) {
            ShuttingStarsUtility.log('Failed to load anti-matter credit.');
            console.error(e);
            this.antiMatterCredit = 0;
            this.reportSaved = { PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0, maxCombo : 0, playCount : 0, used : 0 };
        }
    }

    /** Credit 저장 (Promise) - backend 있는 경우 applyUserInfo 포함 */
    async saveCredit() {
        const selfs = this;
        
        // antiMatterCredit 로컬 저장
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

        const hashKey = await this.hashCredit(newPackage);

        try {
            newPackage.hashKey   = hashKey;
            localStorage.setItem('shuttingstar_credit', JSON.stringify(newPackage));
        } catch(e) {
            ShuttingStarsUtility.log('Failed to save anti-matter credit.');
            console.error(e);
        }

        // 백엔드에 저장
        try {
            if(this.backend != null) {

                await this.backend.applyUserInfo({
                    antiMatter : selfs.antiMatterCredit,
                    darkMatter : selfs.darkMatterCredit,
                    PERFECT    : selfs.reportSaved.PERFECT  ,
                    GREAT      : selfs.reportSaved.GREAT    ,
                    GOOD       : selfs.reportSaved.GOOD     ,
                    BAD        : selfs.reportSaved.BAD      ,
                    MISS       : selfs.reportSaved.MISS     ,
                    maxCombo   : selfs.reportSaved.maxCombo ,
                    playCount  : selfs.reportSaved.playCount,
                    used       : selfs.reportSaved.used     ,
                    hashKey    : hashKey
                });
            }
        } catch(e) {
            ShuttingStarsUtility.log('Failed to save anti-matter credit.');
            console.error(e);
        }
    }

    /** 곡 목록 중 출력 대상 곡 목록 갱신 */
    refreshSongDisplayList() {
        this.songDisplays  = [];
        this.songRandoms   = [];
        this.songCanListen = [];
        let idx;

        // 우선순위곡 (일반 음원 사용곡) 정리
        for(idx=0; idx<this.songs.length; idx++) {
            const songOne = this.songs[idx];
            // 기본 조건
            if(songOne.test && (! this.songDebugMode)) continue;
            if(songOne.onlyRandom) continue;

            // 여기서부턴 후순위 조건
            if(songOne.useYoutube) continue;

            this.songDisplays.push(songOne);
        }

        //  후순위곡 (유튜브 사용곡) 정리
        for(idx=0; idx<this.songs.length; idx++) {
            const songOne = this.songs[idx];
            // 기본 조건
            if(songOne.test && (! this.songDebugMode)) continue;
            if(songOne.onlyRandom) continue;

            // 이미 우선순위로 포함된 곡은 제외
            if(this.songDisplays.indexOf(songOne) >= 0) continue;

            this.songDisplays.push(songOne);
        }

        // 생존 - 랜덤 추첨 대상 곡 정리
        for(idx=0; idx<this.songs.length; idx++) {
            const songOne = this.songs[idx];
            if(songOne.test && (! this.songDebugMode)) continue;
            if(songOne.useYoutube) continue; // 유튜브 곡 미지원 (노트 자동생성이 불가능함)
            this.songRandoms.push(songOne);
        }

        // 감상 모드 - 사용 가능한 대상 곡 정리
        for(idx=0; idx<this.songs.length; idx++) {
            const songOne = this.songs[idx];
            if(songOne.test && (! this.songDebugMode)) continue;
            if(! songOne.canListen) continue;
            this.songCanListen.push(songOne);
        }
    }

    /**
     * 곡 목록 불러오기
     */
    async loadSongs() {
        let idx;
        let lastURL = null;
        let songAdded = false;

        // 공식 곡 따로 관리
        let officialSongs = [];

        // 이미 불러온 곡들 중에서도 공식 곡 따로 관리
        for(idx=0; idx<this.songs.length; idx++) {
            const songOne = this.songs[idx];
            if(this.officialSongSerials.indexOf(songOne.serial) >= 0) {
                if(officialSongs.indexOf(songOne) < 0) officialSongs.push(songOne);
            }
        }

        // 백업한 배열로 곡 목록 바꿔치기 (공식 곡만 들어있는 배열이 됨)
        this.songs = officialSongs;
        officialSongs = null;

        // json 의 songs.json 도 불러오기
        try {
            lastURL = this.convertURL('[RSSC]json/songs.json');
            let nowSongAdded = await this.loadSongsFromURL(lastURL);
            if(nowSongAdded) songAdded = true;
        } catch(e) {
            ShuttingStarsUtility.log('Failed to load songs from ' + lastURL);
            console.error(e);
        }
        

        // 스토리지에서 불러오기
        try {
            let songsArr = localStorage.getItem('shuttingstar_songs');
            if(typeof(songsArr) == 'undefined' || songsArr == null) return;
            if(songsArr == '') return;

            lastURL = '[STORAGE]' + songsArr + '[/STORAGE]';
            if(typeof(songsArr) == 'string') {
                songsArr = ShuttingStarsUtility.parseJSON(songsArr);
            }
            
            for(idx=0; idx<songsArr.length; idx++) {
                const songJsonOne = songsArr[idx];
                lastURL = '[STORAGEONE]' + songJsonOne + '[/STORAGEONE]';
                this.addSong(songJsonOne, true); // refreshSongDisplayList 포함
                songAdded = true;
            }
        } catch(e) {
            ShuttingStarsUtility.log('Failed to load songs from ' + lastURL);
            console.error(e);
        }
        if(! songAdded) {
            // songDisplays, songRandoms 도 갱신
            this.refreshSongDisplayList();
        }
    }

    /**
     * URL로부터 곡 목록 데이터를 불러와 등록 (Promise)
     * 
     * @param {string} url : 곡 목록이 들어있는 JSON 배열을 제공하는 URL
     * @returns Promise<boolean> : 곡이 하나라도 추가되었으면 true
     */
    async loadSongsFromURL(url) {
        url = this.convertURL(url);

        let songAdded = false;
        const fetchResponse = await fetch(url);
        const songsText     = await fetchResponse.text();
        const songsJson     = ShuttingStarsUtility.parseJSON(songsText);

        if(Array.isArray(songsJson)) {
            for(let idx=0; idx<songsJson.length; idx++) {
                let songJsonOne = songsJson[idx];
                try {
                    if(typeof(songJsonOne) == 'string') {
                        if(songJsonOne.indexOf('[RSSC]') == 0 || songJsonOne.indexOf('[CTX]') == 0 || songJsonOne.indexOf('http://') == 0 || songJsonOne.indexOf('https://') == 0) {
                            const childSongAdded = await this.loadSongsFromURL(songJsonOne);
                            if(childSongAdded) songAdded = true;
                            continue;
                        } else {
                            songJsonOne = ShuttingStarsUtility.parseJSON(songJsonOne);
                        }
                    }
                    this.addSong(songJsonOne, true); // refreshSongDisplayList 포함
                    songAdded = true;
                } catch(e2) {
                    ShuttingStarsUtility.log('Failed to read song info from...\n' + songJsonOne);
                    console.error(e2);
                }
            }
        } else {
            this.addSong(songJsonOne, true); // refreshSongDisplayList 포함
            songAdded = true;
        }
        
        return songAdded;
    }

    /**
     * 곡 목록 저장
     */
    saveSongs() {
        let idx;
        let list = [];
        for(idx=0; idx<this.songs.length; idx++) {
            const songOne = this.songs[idx];

            // 공식곡 제외하고 담기
            if(this.officialSongSerials.indexOf(songOne.serial) >= 0) continue;

            // MySong (파일 불러와서 즉석 생성곡은 저장해도 어짜피 다음번 접속 시 파일 액세스가 안되서 플레이가 안됨 - 제외)
            if(songOne instanceof CustomMySSSong) continue;

            // 시리얼 없는 경우 임의 시리얼 부여
            if(songOne.serial == '' || songOne.serial == null) songOne.serial = 'nonofficial_' + Math.floor(ShuttingStarsUtility.random() * 999999999) + '' + Math.floor(ShuttingStarsUtility.random() * 999999999);
            list.push(songOne.toJSONObject());
        }

        // 스토리지에 저장
        try {
            localStorage.setItem('shuttingstar_songs', JSON.stringify(list));
        } catch(e) {
            ShuttingStarsUtility.log('Failed to save songs.');
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

    /** 재화 해시 검증값 계산 (Promise) */
    async hashCredit(hashJson) {
        let hashPackage = String(hashJson['PERFECT']) + ':' + String(hashJson['GREAT']) + ':' + String(hashJson['GOOD']) + ':' + String(hashJson['BAD']) + ':' + String(hashJson['MISS']) + ':' + String(hashJson['maxCombo']) + ':' + String(hashJson['playCount']) + ":" + String(hashJson['used']);
        return await ShuttingStarsUtility.sha384str( hashPackage );
    }

    /**
     * 스테이지 초기화, 곡이 선정되지 않았을 때는 초기화만 하며, 곡이 선정된 경우는 초기화 후 곡 초기세팅까지 진행 (Promise)
     */
    async resetStage() {
        const selfs = this;
        let idx, jdx;
        let diff, resetProcessed;
        this.clearTimeHandler();
        this.hp = 100.0;
        this.pw = this.pwMax;
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

        this.fGameEvent({ "event" : 'resetstage', "broker" : this.broker });
        resetProcessed = false;

        // 상태별 처리
        if(this.basicStates.indexOf(this.state) >= 0) { // 기본 상태들
            // 곡 플레이 직전, 풀스크린 곡 타이틀 화면
            if(this.state == 'songtitle' || this.state == 'listentitle') {
                resetProcessed = true;

                this.lastObjectId = 0;
                this.objectsPlaying = [];
                this.notePlacers = [];

                for(idx=0; idx<this.keyList.length; idx++) {
                    const notePlacer = new SSNotePlacer(idx, this);
                    notePlacer.id = this.lastObjectId++;
                    this.objectsPlaying.push(notePlacer);
                    this.notePlacers.push(notePlacer);
                }

                // 곡 플레이 세팅 중 처리
                //     곡 마지막 패턴 시간 체크
                this.songLastPatternTime = 0;
                diff = this.song.difficulties[ this.difficulty.index ];
                let patterns = diff.patterns;
                for(idx=0; idx<patterns.length; idx++) {
                    const pattern = patterns[idx];
                    if(pattern.time > this.songLastPatternTime) {
                        this.songLastPatternTime = pattern.time;
                    }
                }

                // 노트 미리 생성
                if(! this.difficultyUsingAutoCreate) {
                    for(idx=0; idx<patterns.length; idx++) {
                        const pattern = patterns[idx];

                        // 패턴 ID 세팅
                        pattern.id = idx;
                        
                        // 패턴 내 노트 라인 번호가 음수로 지정된 경우, 랜덤하게 다시 지정
                        if(pattern.line < 0) {
                            pattern.line = Math.floor(ShuttingStarsUtility.random() * this.notePlacers.length);
                        }

                        if(typeof(pattern.type) == 'undefined' || pattern.type == null || pattern.type == '') pattern.type = 'normal';

                        let note;
                        if(pattern.type == 'long' && (! this.noLongNote)) {
                            note = new SSLongNote(pattern.line, this);
                            note.id = this.lastObjectId; this.lastObjectId++;
                            note.patternId = pattern.id;
                            note.originalTiming = pattern.time;
                            note.originalEndTiming = pattern.ends;
                            note.handling = false;
                            note.handlingEndTiming = note.originalTiming; // 처음에는 최대 길이를 그대로 표현하기 위해 (일부 처리 시 길이가 짧아질 예정)
                        } else {
                            note = new SSNote(pattern.line, this);
                            note.id = this.lastObjectId; this.lastObjectId++;
                            note.patternId = pattern.id;
                            note.originalTiming = pattern.time;
                        }

                        // if(idx == patterns.length - 1) { note.debugTarget = true; } // 노트 디버깅
                        this.objectsPlaying.push(note); // 노트 추가
                    }
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
                if(this.song.useYoutube) {
                    this.youtubeDiv.innerHTML = '';

                    if(this.youtubePlayer != null) { this.youtubePlayer.destroy(); this.youtubePlayer = null; }
                    this.youtubeDiv.classList.remove('invisible');
                    this.setYouTubeIframe(this.song.youtubeVideoId);
                    this.elapsedTimeSynchronized = false;
                    this.songPrepared = true;
                } else {
                    this.youtubeDiv.classList.add('invisible');
                    if(this.audio == null) {
                        if(typeof(this.song.musicUrl) != 'undefined' && this.song.musicUrl != null && this.song.musicUrl != '' && ShuttingStarsUtility.checkAccessibleURL(this.song.musicUrl)) {
                            try {
                                // 기존 Audio Context 닫기 (문제 예방 차원)
                                this.closeAudioSources();

                                // Audio URL 결정
                                let audioUrl ;
                                if(this.song.alterUrlUsing && ( this.song.musicAlterUrl != null && this.song.musicAlterUrl != '' )) {
                                    audioUrl = this.convertURL(this.song.musicAlterUrl);
                                } else {
                                    audioUrl = this.convertURL(this.song.musicUrl);
                                }

                                if(this.difficultyUsingAutoCreate) {
                                    // 노트 생성
                                    const noteCreates = await this.createAutoNotes(audioUrl, this.song.bpm, this.difficultyLevel);
                                    
                                    // 생성한 노트들 옮기기
                                    for(let n=0; n<noteCreates.length; n++) {
                                        const noteOne = noteCreates[n];
                                        this.objectsPlaying.push(noteOne);
                                    }

                                    //     Audio Context 닫기
                                    this.closeAudioSources();
                                }

                                // Blob URL로 변환 시도
                                try { audioUrl = await ShuttingStarsUtility.convertToBlobURL(audioUrl); } catch(exc) { ShuttingStarsUtility.log('Ignorable exception - ' + exc); console.error(exc); }

                                // Audio 객체 다시 생성 (실제 플레이 곡 재생을 위함)
                                this.audio = new Audio(audioUrl);
                                this.audio.volume = (this.volume * this.volumeSongAudio * this.volumeMultiplier);
                                this.audio.preload = 'auto';
                                
                                try {
                                    // Audio Context ( https://developer.mozilla.org/ko/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API ) 준비 (시각화)
                                    if(this.audio != null) {
                                        this.audioCtx       = new (window.AudioContext || window.webkitAudioContext)();
                                        this.audioAnalyser  = this.audioCtx.createAnalyser();
                                        this.audioSource    = this.audioCtx.createMediaElementSource(this.audio);
                                        this.audioSource.connect(this.audioAnalyser);
                                        this.audioAnalyser.connect(this.audioCtx.destination);
                                        this.audioAnalyser.fftSize = 256;
                                        this.audioBufferLen = this.audioAnalyser.frequencyBinCount;
                                        this.audioBuffer    = new Uint8Array(this.audioBufferLen);
                                    }
                                } catch(exInx) {
                                    ShuttingStarsUtility.log('Failed to prepare audio context.');
                                    console.error(exInx);
                
                                    this.closeAudioSources();
                                    this.audio = null;
                                }
                                this.elapsedTimeSynchronized = false;
                                this.songPrepared = true;
                            } catch(exc) {
                                console.error(exc);
                                ShuttingStarsUtility.toast('Loading audio failed !', true);
                                if(this.audio != null) { try { this.audio.remove(); } catch(egnores) {} }
                                this.songPrepared = false;
                                this.audio = null;
                                this.setState('songchoosing');
                                return;
                            }
                        } else if(typeof(this.song.bgaUrl) != 'undefined' && this.song.bgaUrl != null && this.song.bgaUrl != '' && ShuttingStarsUtility.checkAccessibleURL(this.song.bgaUrl)) {
                            // BGA URL 대신 사용
                            try {
                                // 기존 Audio Context 닫기 (문제 예방 차원)
                                this.closeAudioSources();

                                // Audio URL 결정
                                let audioUrl = this.convertURL(this.song.bgaUrl);
                                if(this.difficultyUsingAutoCreate) {
                                    // 노트 생성
                                    const noteCreates = await this.createAutoNotes(audioUrl, this.song.bpm, this.difficultyLevel);
                                    
                                    // 생성한 노트들 옮기기
                                    for(let n=0; n<noteCreates.length; n++) {
                                        const noteOne = noteCreates[n];
                                        this.objectsPlaying.push(noteOne);
                                    }

                                    //     Audio Context 닫기
                                    this.closeAudioSources();
                                }

                                this.videoBgaUrl = audioUrl;
                                this.videoBga.src = audioUrl;
                                try { this.videoBga.pause();          } catch(ignores) {}
                                try { this.videoBga.currentTime = 0;  } catch(ignores) {}

                                this.elapsedTimeSynchronized = false;
                                this.songPrepared = true;
                            } catch(exc) {
                                console.error(exc);
                                ShuttingStarsUtility.toast('Loading audio failed !', true);
                                if(this.audio != null) { try { this.audio.remove(); } catch(egnores) {} }
                                this.songPrepared = false;
                                this.audio = null;
                                this.setState('songchoosing');
                                return;
                            }
                        } else {
                            this.closeAudioSources();
                            this.audio = null;
                            
                            this.songPrepared = true;
                        }
                    }
                }
                
                // BGA 초기화
                if(this.videoBgaUrl == null) {
                    if(typeof(this.song.bgaUrl) != 'undefined' && this.song.bgaUrl != null && this.song.bgaUrl != '' && ShuttingStarsUtility.checkAccessibleURL(this.song.bgaUrl)) {
                        this.videoBgaUrl = this.convertURL(this.song.bgaUrl);
                        this.videoBga.src = this.videoBgaUrl;
                        try { this.videoBga.pause();          } catch(ignores) {}
                        try { this.videoBga.currentTime = 0;  } catch(ignores) {}
                    }
                }

                // 3D 매니저 이벤트 호출
                if(this.ss3d != null && (! this.disable3d)) {
                    this.ss3d.onSongPlayPreparing(this);
                }
            } else if(this.state == 'playing' || this.state == 'listenplaying') { // 곡이 플레이 상황일 경우 처리
                resetProcessed = true;
                diff = this.song.difficulties[ this.difficulty.index ];

                // 진행 시간 - 처리 끝난 후 아래에서 다시 초기화
                this.elapsedTime = (-1) * ((this.stageRows * 2) + this.songTiming); 
                this.elapsedTimeOld = this.elapsedTime;

                if(this.song == null) { this.closeAudioSources(); this.audio = null; this.setState('menu'); return; }

                // 반복 처리 시작 (곡의 bpm 반영)
                this.songBitGap = this.calculateSongBitGap(this.song.bpm);
                if(this.song.useYoutube) this.songBitGap += this.songBitMoreGapYoutube;
                if(this.usingWorker) {
                    this.workerSongPlaying = new Worker( this.convertURL('[RSSC]js/shuttingstarworker.js') );
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
                if(this.youtubePlayer != null) {
                    // 노트가 올라가는 시간은 주고 재생 시작
                    const playingGap = (selfs.songBitGap * selfs.stageRows * 2) + selfs.songTiming;
                    setTimeout(() => {
                        if(selfs.state != 'playing' && selfs.state != 'listenplaying') return; // 노트 생성용 재생 전 esc 눌러 나가버린 경우 --> 바로 중단

                        selfs.youtubePlayer.playVideo();

                        selfs.elapsedTime    = (selfs.youtubePlayer.getCurrentTime() * (selfs.song.bpm / 60.0) * (selfs.timeMultiplier * selfs.elapsedTimeMultiplier)) - selfs.songTiming; // 타이밍 지정
                        selfs.elapsedTimeOld = selfs.songTiming * (-1);
                    }, playingGap);
                } else if(this.audio != null) {
                    // 노트가 올라가는 시간은 주고 재생 시작
                    const playingGap = (selfs.songBitGap * selfs.stageRows * 2) + selfs.songTiming;
                    setTimeout(() => {
                        if(selfs.state != 'playing' && selfs.state != 'listenplaying') return; // 노트 생성용 재생 전 esc 눌러 나가버린 경우 --> 바로 중단

                        selfs.audio.play();

                        selfs.elapsedTime    = (selfs.audio.currentTime * (selfs.song.bpm / 60.0) * (selfs.timeMultiplier * selfs.elapsedTimeMultiplier)) - selfs.songTiming; // 타이밍 지정
                        selfs.elapsedTimeOld = selfs.songTiming * (-1);

                        if(selfs.videoBga != null) {
                            if(selfs.videoBgaUrl != null) {
                                selfs.videoBga.play();
                                selfs.videoBga.volume = 0;
                            }
                        }
                    }, playingGap);
                } else if(this.videoBga != null) {
                    // audio 와 동일하나 BGA 를 대신 사용
                    const playingGap = (selfs.songBitGap * selfs.stageRows * 2) + selfs.songTiming;
                    setTimeout(() => {
                        if(selfs.state != 'playing' && selfs.state != 'listenplaying') return; // 노트 생성용 재생 전 esc 눌러 나가버린 경우 --> 바로 중단

                        selfs.videoBga.play();
                        selfs.videoBga.volume = 0.8;

                        selfs.elapsedTime    = (selfs.videoBga.currentTime * (selfs.song.bpm / 60.0) * (selfs.timeMultiplier * selfs.elapsedTimeMultiplier)) - selfs.songTiming; // 타이밍 지정
                        selfs.elapsedTimeOld = selfs.songTiming * (-1);
                    }, playingGap);
                } else {
                    selfs.elapsedTime    = selfs.songTiming * (-1); // 타이밍 지정
                    selfs.elapsedTimeOld = selfs.songTiming * (-1);
                }
                this.playPrepared = true;

                if(this.backend != null) {
                    if(this.state == 'playing') { try { this.backend.logEvent('PLAY : ' + this.song.name + ' (' + diff.difficultyLevel + ')'); } catch(ignores) {} }
                    else                        { try { this.backend.logEvent('LISTEN : ' + this.song.name + ' (' + diff.difficultyLevel + ')'); } catch(ignores) {} }
                }
            }
        } else { // 그외의 경우
            for(let idx=0; idx<this.states.length; idx++) {
                const stateOne = this.states[idx];
                if(stateOne.name == this.state) {
                    resetProcessed = true;
                    stateOne.onStageReset(this);
                    break;
                }
            }
        }

        if(! resetProcessed) {
            this.playPrepared = false;

            this.lastObjectId = 0;
            this.objectsPlaying = [];
            this.notePlacers = [];

            for(idx=0; idx<this.keyList.length; idx++) {
                const notePlacer = new SSNotePlacer(idx, this);
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

        let contentRootWidth  = (outWidth  - this.gap.w - this.getLeftMarginPage() + 1);
        let contentRootHeight = (outHeight - this.gap.h - this.getTopMarginPage()  + 1);

        this.contentRoot.style.width  = contentRootWidth  + 'px';
        this.contentRoot.style.height = contentRootHeight + 'px';

        this.canvas.style.width  = contentRootWidth  + 'px';
        this.canvas.style.height = contentRootHeight + 'px';
        this.canvas.style.marginLeft = this.getLeftMarginPage() + 'px';
        this.canvas.style.marginTop  = this.getTopMarginPage() + 'px';
        
        if(this.configDiv != null) {
            this.configDiv.style.top    = '10px';
            this.configDiv.style.left   = '10px';
            this.configDiv.style.width  = (contentRootWidth  - 100) + 'px';
            this.configDiv.style.height = (contentRootHeight - 100) + 'px';
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

        // 유튜뷰 영역용 div 관리
        if(this.youtubeDiv != null) {
            this.youtubeDiv.style.position = 'fixed';
            this.youtubeDiv.style.left = canvasBounding.left + 'px';
            this.youtubeDiv.style.top  = canvasBounding.top + 'px';
            this.youtubeDiv.style.width  = canvasBounding.width + 'px';
            this.youtubeDiv.style.height = canvasBounding.height + 'px';
        }

        // 유튜브 플레이어 관리
        if(this.youtubePlayer != null) {
            const iframes = this.youtubePlayer.getIframe();
            if(iframes) {
                iframes.style.position = 'fixed';
                iframes.style.left = canvasBounding.left + 'px';
                iframes.style.top  = canvasBounding.top + 'px';
                iframes.style.width  = canvasBounding.width + 'px';
                iframes.style.height = canvasBounding.height + 'px';
            }
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

        // 폰트 크기 재계산
        this.calculateFontMetric(true);

        // 이벤트
        if(typeof(this.fCanvasResized) == 'function') {
            this.rebuildBroker();
            this.fCanvasResized({
                "broker" : this.broker,
                "window" : { "width" : outWidth, "height" : outHeight },
                "canvas" : {
                    "width" : canvasBounding.width, "height" : canvasBounding.height, "left" : canvasBounding.left, "top" : canvasBounding.top
                },
                "resolution" : { "width" : this.ressets.w, "height" : this.ressets.h }
            });
        }
    }

    /**
     * 키 입력 처리, vkeyExplosion 를 true 지정 시 해당 가상 키도 강조 표시
     * @param {string} key 입력 또는 해제된 키
     * @param {boolean} vkeyExplosion 가상 키 강조 효과 적용 여부
     */
    handleKeyInput(key, vkeyExplosion) {
        const selfs = this;

        if(this.keyEventDisabled && key != this.escKey) return;
        if(this.keyInputDebugMode) ShuttingStarsUtility.log('KEY INPUT : ' + ShuttingStarsUtility.floor2(this.elapsedTime) + ', ' + key);
        key = String(key);

        // 키 입력 신호 넣기
        this.keypressing[key] = new Date().getTime();

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

        // 상태별 처리
        if(this.basicStates.indexOf(this.state) >= 0) { // 기본 상태
            // ESC - DOM 팝업 떠있으면 닫기
            if(key == this.escKey && (! this.pops.dim.classList.contains('invisible'))) {
                this.pops.dim.classList.add('invisible');
                this.pops.login.classList.add('invisible');
                this.pops.community.classList.add('invisible');
                this.pops.iframes.classList.add('invisible');
                this.pops.youtube.classList.add('invisible');
                this.pops.mysong.classList.add('invisible');
                this.configDiv.classList.add('invisible');

                if(this.state == 'setting') this.setState(this.beforeSettingState);
                else                        this.setState('menu');

                this.keyEventDisabled = false;
                if(this.audioBackground != null) { 
                    if(this.state != 'playing' && this.state != 'listenplaying') this.audioBackground.play(); 
                }
                if(this.youtubePopPlayer != null) {
                    this.youtubePopPlayer.destroy();
                    this.youtubePopPlayer = null;
                }
                return;
            }

            // 탭 키 (메뉴가 아닌 다른 곳에서 설정 창 열기)
            if(this.state == 'menu' || this.state == 'songchoosing' || this.state == 'listenchoosing' || this.state == 'recordlist') {
                if(key == 'TAB') {
                    this.setState('setting');
                    return;
                }
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
            } else if(this.state == 'listenchoosing') {
                this.handleKeyInputListenChoosing(key, vkeyExplosion);
            } else if(this.state == 'setting') {
                this.handleKeyInputSetting(key, vkeyExplosion);
            } else if(this.state == 'playing' || this.state == 'listenplaying') {
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
        } else { // 그외 상태
            for(let idx=0; idx<this.states.length; idx++) {
                const stateOne = this.states[idx];
                if(stateOne.name == this.state) {
                    stateOne.handleKeyInput(key, vkeyExplosion, this);
                }
            }
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

            this.accessililityLog('Menu cursor moved to ' + (index+1) + ' (' + this.menuChoosing + ')');
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
            
            this.accessililityLog('Menu cursor moved to ' + (index+1) + ' (' + this.menuChoosing + ')');
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
            } else if(this.menuChoosing == 'listen') {
                this.playSE('accept1');
                this.setState('listenchoosing');
            } else if(this.menuChoosing == 'community') {
                this.playSE('accept1');
                this.showCommunityPopup();
            } else if(this.menuChoosing == 'login') { // 메뉴 - 로그인 (동적 메뉴)
                this.playSE('accept1');
                if(this.backend != null && this.backend.avail) {
                    this.showLoginPopup();
                }
            } else if(this.menuChoosing == 'logout') { // 메뉴 - 로그아웃 (동적 메뉴)
                this.playSE('special1');
                if(this.backend != null && this.backend.avail) {
                    this.confirm( this.trans('Do you want to logout now?') ).then((yn) => {
                        if(yn) {
                            selfs.handleLogout();
                        }
                    });
                }
            } else if(this.menuChoosing == 'exit') { // 메뉴 - 종료
                this.playSE('special1');
                this.fOnShutdownCalled();
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

        // ESC 처리
        if(key == this.escKey) {
            this.playSE('cancel');

            // 커맨드 입력 중인 경우
            if(this.isCommandInputProgressing() >= 0) {
                this.commandInputs = []; // 커맨드 입력 내용 지우기
                return;
            } // this.accessililityLog('Select difficulty for ' + this.song.name);

            // 그외의 경우
            if(this.difficultyChoosing) { // 난이도 선택 중인 경우 - 난이도 선택 해제 (다시 곡 선택 모드로)
                this.difficultyChoosing = false; 
                this.accessililityLog('Back to song choosing...');
            }
            else { this.setState('menu'); } // 그외의 경우 - 이전 화면인 메뉴로 이동
            return;
        }

        // 곡이 아무것도 준비 안된 상태로 키를 누름
        if((this.songDisplays.length <= 0 && this.songChoosingMode == 'default') || (this.missions.length <= 0 && this.songChoosingMode == 'mission')) {
            if(key == this.enterKey || key == this.escKey) {
                this.accessililityLog('No song available. Returning to menu.');
                this.setState('menu'); 
            } else {
                if(  this.songChoosingMode == 'mission') this.songChoosingMode = 'mysong';
                else                                     this.songChoosingMode = 'mission';
                if(this.songChoosingMode == 'mysong' && this.difficultyLevel < 0) this.difficultyLevel = 1;
                this.accessililityLog('Not enough content available. Switching to ' + this.songChoosingMode + ' mode.');
            }
            return;
        }

        // 커맨드 입력 여부 판단
        for(let idx=0; idx<this.keyList.length; idx++) {
            if(key == this.keyList[idx]) {
                this.handleCommand(key);
                break;
            }
        }

        // 현재 곡 선택 모드에 따라 분기
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
                this.accessililityLog('Mission cursor moved to ' + (index+1) + ' (' + this.missionChoosing.name + ')');
            } else if(key == this.arrowKeys[1]) { // DOWN
                index++;
                if(index >= this.missions.length) index = 0;
                this.missionChoosing = this.missions[index];
                this.accessililityLog('Mission cursor moved to ' + (index+1) + ' (' + this.missionChoosing.name + ')');
            } else if(key == this.arrowKeys[2]) { // LEFT
                this.songChoosingMode = 'default';
                if(this.songChoosing == null) this.songChoosing = this.songDisplays[0];
                this.accessililityLog('Default Stage Mode');
            } else if(key == this.arrowKeys[3]) { // RIGHT
                this.songChoosingMode = 'mysong';
                if(this.difficultyLevel < 0) this.difficultyLevel = 1;
                this.accessililityLog('My Song Mode');
            } else if(key == this.enterKey) { // ENTER
                if(this.missionChoosing == null) return;
                this.playSE('accept2');

                this.missionChoosing.prepare(this); // 미션 객체는 준비작업이 필요
                
                this.songTitleTime = this.songTitleBaseTime;
                this.song = this.missionChoosing;
                this.difficulty = this.song.difficulties[0]; // 미션은 난이도가 하나
                this.difficultyLevel = this.difficulty.difficultyLevel;
                this.difficultyUsingAutoCreate = this.difficulty.autoCreate;

                if(! isNaN(this.song.loadingTime)) this.songTitleTime += this.song.loadingTime;

                // 곡 플레이 선택함.
                this.mode = this.songChoosingMode;
                this.setState('songtitle');
                this.difficultyChoosing = false;
                this.titleDelayTime = this.titleDelayTimeMax;
            }

        } else if(this.songChoosingMode == 'mysong') {
            // 자기가 가지고 있는 곡으로 플레이하는 모드 - 위 아래 방향키는 난이도만 선택 가능하며, 좌우 방향키는 모드 변경, 엔터 시 파일 첨부, ESC는 메뉴로 나가기
            if(key == this.enterKey) {
                
                this.pops.dim.classList.remove('invisible');
                this.pops.mysong.classList.remove('invisible');
            } else if(key == this.escKey) {
                this.setState('menu');
                return;
            } else if(key == this.arrowKeys[0]) { // UP
                this.difficultyLevel--;
                if(this.difficultyLevel < 1) this.difficultyLevel = 19;
                this.accessililityLog('My Song Mode difficulty level changed to ' + this.difficultyLevel);
            } else if(key == this.arrowKeys[1]) { // DOWN
                this.difficultyLevel++;
                if(this.difficultyLevel > 19) this.difficultyLevel = 1;
                this.accessililityLog('My Song Mode difficulty level changed to ' + this.difficultyLevel);
            } else if(key == this.arrowKeys[2]) { // LEFT
                this.songChoosingMode = 'mission';
                this.accessililityLog('Mission Mode');
            } else if(key == this.arrowKeys[3]) { // RIGHT
                this.songChoosingMode = 'default';
                this.accessililityLog('Default Stage Mode');
            }

        } else {
            // default 모드

            if(this.songChoosing == null) this.songChoosing = this.songDisplays[0];

            // 유튜브 곡인 경우
            if(this.songChoosing.useYoutube) {
                if(key == this.keyList[0]) { // A
                    this.showYoutubePopup(this.songChoosing.youtubeVideoId);
                    return;
                }
            }

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
                    this.accessililityLog('Song cursor moved to ' + (index+1) + ' (' + this.songChoosing.name + ')');
                }
            } else if(key == this.arrowKeys[1]) { // DOWN
                if(! this.difficultyChoosing) {
                    index++;
                    if(index >= this.songDisplays.length) index = 0;
                    this.songChoosing = this.songDisplays[index];
                    this.accessililityLog('Song cursor moved to ' + (index+1) + ' (' + this.songChoosing.name + ')');
                }
            } else if(key == this.arrowKeys[2]) { // LEFT
                if(this.difficultyChoosing) {
                    index--;
                    if(index < 0) index = this.difficultyChoosingList.length - 1;
                    this.difficulty = this.difficultyChoosingList[index];
                    this.difficultyLevel = this.difficulty.difficultyLevel;
                    this.difficultyUsingAutoCreate = this.difficulty.autoCreate;
                    this.accessililityLog('Difficulty cursor moved to ' + this.difficulty.difficultyLabel + ' (' + this.difficulty.difficultyLevel + ')');
                } else {
                    this.songChoosingMode = 'mysong';
                    if(this.difficultyLevel < 0) this.difficultyLevel = 1;
                    this.accessililityLog('My Song Mode');
                }
            } else if(key == this.arrowKeys[3]) { // RIGHT
                if(this.difficultyChoosing) {
                    index++;
                    if(index >= this.difficultyChoosingList.length) index = 0;
                    this.difficulty = this.difficultyChoosingList[index];    
                    this.difficultyLevel = this.difficulty.difficultyLevel;
                    this.difficultyUsingAutoCreate = this.difficulty.autoCreate;
                    this.accessililityLog('Difficulty cursor moved to ' + this.difficulty.difficultyLabel + ' (' + this.difficulty.difficultyLevel + ')');
                } else {
                    this.songChoosingMode = 'mission';
                    if(this.missionChoosing == null) this.missionChoosing = this.missions[0];
                    this.accessililityLog('Mission Mode');
                }
            } else if(key == this.enterKey) {
                if(this.songChoosing == null) return;
                if(this.difficultyChoosing) {
                    this.playSE('accept2');
                    if(this.difficulty == null || typeof(this.difficulty) == 'undefined') this.difficulty = this.difficultyChoosingList[0];
                    this.difficultyLevel = this.difficulty.difficultyLevel;
                    this.difficultyUsingAutoCreate = this.difficulty.autoCreate;
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
                    this.difficultyLevel = this.difficulty.difficultyLevel;
                    this.difficultyUsingAutoCreate = this.difficulty.autoCreate;
                    this.difficultyChoosing = true;
                    this.accessililityLog('Select difficulty for ' + this.song.name);
                    this.accessililityLog('Difficulty cursor is now ' + this.difficulty.difficultyLabel + ' (' + this.difficulty.difficultyLevel + ')');
                }
            }
        }
    }

    /**
     * 감상 곡 목록 선택 화면 키 입력 핸들링
     * @param {string} key 입력 또는 해제된 키
     * @param {boolean} vkeyExplosion 가상 키 강조 효과 적용 여부
     */
    handleKeyInputListenChoosing(key, vkeyExplosion) {
        const selfs = this;
        let index = 0;

        // ESC 처리
        if(key == this.escKey) {
            this.playSE('cancel');
            this.setState('menu');
            return;
        }

        // 곡이 아무것도 준비 안된 상태로 키를 누른 경우
        if(this.songCanListen.length <= 0) {
            this.setState('menu'); 
            return;
        }

        // 커맨드 입력 여부 판단
        for(let idx=0; idx<this.keyList.length; idx++) {
            if(key == this.keyList[idx]) {
                this.handleCommand(key);
                break;
            }
        }

        if(this.songChoosing == null) this.songChoosing = this.songCanListen[0];

        // 유튜브 곡인 경우
        if(this.songChoosing.useYoutube) {
            if(key == this.keyList[0]) { // A
                this.showYoutubePopup(this.songChoosing.youtubeVideoId);
                return;
            }
        }

        // 곡 인덱스 구하기
        index = 0;
        for(let idx=0; idx<this.songCanListen.length; idx++) {
            if(this.songCanListen[idx] == this.songChoosing) {
                index = idx;
                break;
            }
        }

        const listenIdx = this.listeningSongList.indexOf(this.songChoosing);
        
        // 키 적용
        if(key == this.arrowKeys[0]) { // UP
            index--;
            if(index < 0) index = this.songCanListen.length - 1;
            this.songChoosing = this.songCanListen[index];
            this.accessililityLog('Song cursor moved to ' + (index+1) + ' (' + this.songChoosing.name + ')' + (listenIdx >= 0 ? ' (Already in listening list)' : ''));
        } else if(key == this.arrowKeys[1]) { // DOWN
            index++;
            if(index >= this.songCanListen.length) index = 0;
            this.songChoosing = this.songCanListen[index];
            this.accessililityLog('Song cursor moved to ' + (index+1) + ' (' + this.songChoosing.name + ')' + (listenIdx >= 0 ? ' (Already in listening list)' : ''));
        } else if(key == this.keyList[1]) { // D
            if(this.songChoosing == null) return;

            if(this.songCanListen.indexOf(this.songChoosing) < 0) { // 현재 선택된 곡이 감상 가능한 곡이 아닌 경우 - 취소 처리 및 재생 목록에서도 제거
                this.playSE('cancel');
                this.songChoosing = this.songCanListen[0];
                if(listenIdx >= 0) this.listeningSongList.splice(listenIdx, 1);
            } else {
                if(listenIdx >= 0) {
                    this.playSE('cancel');
                    this.songChoosing = null;
                    this.listeningSongList.splice(listenIdx, 1);
                    this.accessililityLog('Song removed from listening list');
                } else {
                    this.playSE('accept1');
                    this.listeningSongList.push(this.songChoosing);
                    this.accessililityLog('Song added to listening list');
                }
            }
        } else if(key == this.enterKey) {
            if(this.listeningSongList.length <= 0) {
                if(this.songChoosing == null) {
                    ShuttingStarsUtility.toast(this.trans('Please select at least one song to listen.'));
                    return;
                } else {
                    // 현재 선택된 곡을 바로 재생 목록에 넣고 이어서 진행
                    const cdx = this.songCanListen.indexOf(this.songChoosing);
                    if(cdx < 0) {
                        ShuttingStarsUtility.toast(this.trans('Please select at least one song to listen.'));
                        return;
                    }
                    this.listeningSongList.push(this.songChoosing);
                }
            }

            this.playSE('accept2');

            // 순서 섞기
            this.listeningSongList = ShuttingStarsUtility.randomizeArrayElements(this.listeningSongList);

            this.song = this.listeningSongList[0];
            this.difficultyChoosingList = this.song.getDifficultyList();

            const randomNo = Math.floor(ShuttingStarsUtility.random() * (this.difficultyChoosingList.length - 0.0001));
            this.difficulty = this.difficultyChoosingList[randomNo];
            this.difficultyLevel = this.difficulty.difficultyLevel;
            this.difficultyUsingAutoCreate = this.difficulty.autoCreate;

            this.songTitleTime = this.songTitleBaseTime;
            if(! isNaN(this.song.loadingTime)) this.songTitleTime += this.song.loadingTime;
            this.titleDelayTime = this.titleDelayTimeMax;

            this.setState('listentitle');
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
                this.saveSettings(false).then(() => {
                    selfs.setState('menu');
                });
            } else {
                if(     this.firstSetMode == 'language') this.firstSetMode = 'quality';
                else if(this.firstSetMode == 'quality' ) this.firstSetMode = 'confirm';
                else                                     this.firstSetMode = 'language';
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
                this.saveSettings(false);
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
                } else if(this.settingChoosing == 'judgeTiming') {
                    this.judgeTiming--;
                    if(this.judgeTiming < -200) this.judgeTiming = -200;
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
                } else if(this.settingChoosing == 'judgeTiming') {
                    this.judgeTiming++;
                    if(this.judgeTiming >= 200) this.judgeTiming = 200;
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
                // 이미 일시정지 중일 때 또 ESC 누름
                if(this.state == 'listenplaying') {
                    // 감상 모드인 경우는 재생 중지
                    // 재생 중단
                    this.paused = false;
                    this.stopAudio();
                    this.audio = null;
                    this.songThumb = null;
                    this.videoBgaUrl = null; // TODO
                    this.songPrepared = false;
                    this.playPrepared = false;
                    // 메뉴
                    this.setState('menu');
                }
                else this.onGameOver(); // 게임 중인 경우는 포기 처리
            } else {
                if(this.elapsedTime >= 10) {
                    // 일시정지 중이 아닐 때 --> 일시정지 시작
                    this.pauseSong();
                }
            }
        } else {
            // 노트 처리
            if(this.keyList.indexOf(key) >= 0) {
                let idx;
                let notePlacer = null; // 해당 키에 맞는 SSNotePlacer 를 찾아야 함
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
                if(objOne instanceof SSVirtualKey) {
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
            if(this.backend != null && this.backend.avail && this.backend.logined) {
                this.selectRecordType = (this.selectRecordType == 'local' ? 'internet' : 'local');
                if(this.selectRecordType == 'internet') { this.getInternetRecords().then((list) => { selfs.selectedRecordList = list; if(list != null && list.length >= 1) selfs.seeingRecord = selfs.selectedRecordList[0]; }); }
                else { this.selectedRecordList = this.getRecords(); }
                if(this.selectedRecordList.length <= 0) this.seeingRecord = null;
                else this.seeingRecord = this.selectedRecordList[0];
            } else {
                if(this.selectRecordType != 'local') {
                    this.selectedRecordList = this.getRecords();
                    this.seeingRecord = this.selectedRecordList[0];
                }
                this.selectRecordType = 'local';
            }
        } else if(key == this.arrowKeys[3]) { // RIGHT
            if(this.backend != null && this.backend.avail && this.backend.logined) {
                this.selectRecordType = (this.selectRecordType == 'local' ? 'internet' : 'local');
                if(this.selectRecordType == 'internet') { this.getInternetRecords().then((list) => { selfs.selectedRecordList = list; if(list != null && list.length >= 1) selfs.seeingRecord = selfs.selectedRecordList[0]; }); }
                else { this.selectedRecordList = this.getRecords(); }
                if(this.selectedRecordList.length <= 0) this.seeingRecord = null;
                else this.seeingRecord = this.selectedRecordList[0];
            } else {
                if(this.selectRecordType != 'local') {
                    this.selectedRecordList = this.getRecords();
                    this.seeingRecord = this.selectedRecordList[0];
                }
                this.selectRecordType = 'local';
            }
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
        if(key == this.enterKey) {
            window.open(this.homepageUrl, '_blank');
        } else {
            this.playSE('special1');
            this.setState('menu');
        }
    }

    /**
     * SSNotePlacer 호출 처리
     * @param {SSNotePlacer} notePlacer notePlacer 객체
     */
    handleNotePlacerCalled(notePlacer) {
        if(this.pw < this.getPWUsingCost()) return;

        this.pw -= this.getPWUsingCost();
        if(this.pw < 0) this.pw = 0;

        this.handleNotePlacerCalledIn(notePlacer, true);
    }

    /**
     * SSNotePlacer 호출 처리 (pw 계산 안함)
     * @param {SSNotePlacer} notePlacer notePlacer 객체
     */
    handleNotePlacerCalledIn(notePlacer, pwConsumed) {
        let idx = 0;

        // SSNotePlacer 폭발 처리
        notePlacer.explosing = 1;

        // 전 노트들 위치 다시 계산하고 처리하는 게 좋을까?

        // 해당 SSNotePlacer 에 범위 안에 들어온 노트들 수집
        let notes = [];
        let noteY, justY, rangeSize, dist;
        const rangeMultiplier = this.noteSpeedMultiplier * (this.noteSpeedFixedConst * 4);
        for(idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if((obj instanceof SSNote)) {
                if(obj.line != notePlacer.line) continue;
                if(obj.removed) continue;
                if(obj.explosing >= 1) continue;

                // 사정범위 안에 들어왔는지 여부 판별
                noteY = obj.y;
                justY = notePlacer.y + this.judgeTiming;

                dist = Math.abs(justY - noteY);
                rangeSize = (obj.r + notePlacer.r) * rangeMultiplier;

                if(dist < rangeSize) {
                    // 처리 대상 목록에 포함 (아직 결정된 것은 아님 !)
                    notes.push({
                        idx   : idx,
                        note  : obj,
                        y     : noteY,
                        dist  : dist,
                        range : rangeSize,
                        type  : 'normal'
                    });
                }
            } else if(obj instanceof SSLongNote) {
                if(obj.line != notePlacer.line) continue;
                if(obj.removed) continue;
                if(obj.explosing >= 1) continue;
                if(obj.handling) continue;
                if(obj.missed) continue;

                // 사정범위 안에 들어왔는지 여부 판별
                noteY = obj.y;
                justY = notePlacer.y + this.judgeTiming;

                dist = Math.abs(justY - noteY);
                rangeSize = (obj.r + notePlacer.r) * rangeMultiplier;

                if(dist < rangeSize) {
                    // 처리 대상 목록에 포함 (아직 결정된 것은 아님 !)
                    notes.push({
                        idx   : idx,
                        note  : obj,
                        y     : noteY,
                        dist  : dist,
                        range : rangeSize,
                        type  : 'long'
                    });
                }
            }
        }

        // 범위 내 노트 선정 및 처리
        if(notes.length >= 1) {
            // 처리 대상 중 가장 y값이 낮은 노트 찾기
            let minimumY = 99999;
            let minimumIdx   = notes[0].idx;
            let minimumNote  = notes[0].note;
            let mimimumDist  = notes[0].dist;
            let minimumRange = notes[0].range;
            for(idx=0; idx<notes.length; idx++) {
                let noteOne = notes[idx];
                if(noteOne.y < minimumY) {
                    minimumY = noteOne.y;
                    minimumIdx   = noteOne.idx;
                    minimumNote  = noteOne.note;
                    mimimumDist  = noteOne.dist;
                    minimumRange = noteOne.range;
                }
            }

            // 거리를 통한 판정 - 거리의 비율 계산 (%)
            const distance = Math.abs((mimimumDist * 100.0) / minimumRange );
            
            // 거리에 따른 판정 - 점수 계산
            let resultMark = this.createResultMarkUsingDistance(distance);
            
            // 타이밍을 통한 판정
            // let resultMark = this.createResultMarkUsingTiming(minimumNote, notePlacer);

            // 판정에 따른 효과 처리
            this.processResultMark(resultMark);

            // 판정 출력
            this.displayResultMark(resultMark);

            if(minimumNote instanceof SSLongNote) {
                if(resultMark != 'MISS') {
                    minimumNote.handling = true; // 롱노트 처리 중임을 표시
                    minimumNote.handlingStartTiming = this.elapsedTime; // 시작 시간 표시
                    minimumNote.handlingEndTiming   = this.elapsedTime; // 종료 시간도 표시 (이것으로 실제 길이가 줄어듦) - SimultaneousWork 에서도 처리해야 함
                }
            } else {
                minimumNote.explosing = 1;  // 노트의 폭발 시작
                minimumNote.removed = true; // 처리했음을 표시
            }

            // 추가 폭발 객체 추가
            if(resultMark == 'MISS') {
                // MISS
                minimumNote.missed = true;
                const newExplosinves = new SSFailExplosing(this, minimumNote.line, minimumNote.y, '255, 0, 0', '255, 0, 0');
                this.objects.push(newExplosinves);
            } else {
                // 그외 (MISS가 아님)
                const newExplosinves = new SSCorrectNoteExplosing(this, minimumNote.line, minimumNote.y, minimumNote.color, '255, 255, 255');
                this.objects.push(newExplosinves);

                if(pwConsumed) { // PW 다시 회복
                    this.pw += this.getPWUsingCost();
                    if(     resultMark ==   'GREAT') this.pw += Math.floor(this.getPWUsingCost() / 10.0);
                    else if(resultMark == 'PERFECT') this.pw += Math.floor(this.getPWUsingCost() /  5.0);
                    if(this.pw > this.pwMax) this.pw = this.pwMax;
                }
            }
        }

        // 처리 중인 롱노트에 대한 PW 회복 처리
        for(idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if(obj instanceof SSLongNote) {
                if(obj.handling && (! obj.removed) && (! obj.missed) && (obj.explosing <= 0)) {
                    if(pwConsumed) { // pw 다시 회복
                        this.pw += this.getPWUsingCost();
                        this.pw += Math.floor(this.getPWUsingCost() /  5.0); // PERFECT 로 취급
                        if(this.pw > this.pwMax) this.pw = this.pwMax;
                    }
                }
            }
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
            const tempObject = new SSMouseEventArea();
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
        if(this.keyReleaseDebugMode) ShuttingStarsUtility.log('KEY RELEASE : ' + this.elapsedTime + ', ' + key);
        key = String(key);

        const timeDiff = (typeof(this.keypressing[key]) == 'undefined' || this.keypressing[key] == null) ? 0 : new Date().getTime() - this.keypressing[key];
        this.keypressing[key] = null;

        let keyIndex = -1; // 플레이 키 (keyList) 인 경우, 몇 번째인지 기록
        if(this.keyList.indexOf(key) >= 0) keyIndex = this.keyList.indexOf(key);

        if(keyIndex >= 0) {
            for(let idx=0; idx<this.objectsPlaying.length; idx++) {
                const obj = this.objectsPlaying[idx];
                if(obj instanceof SSLongNote) {
                    if(obj.handling && obj.line == keyIndex && (! obj.removed) && (! obj.missed) && (obj.explosing <= 0)) {
                        obj.handling = false; // 롱노트 처리 중임을 해제
                        obj.handlingEndTiming = this.elapsedTime; // 종료 시간 표시
                    }
                }
            }
        }
        
        // 기타 상태별 처리
        for(let idx=0; idx<this.states.length; idx++) {
            const stateOne = this.states[idx];
            if(stateOne.name == this.state) {
                stateOne.handleKeyReleased(key, this);
            }
        }
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

    /** 로그아웃 처리 (Promise) */
    handleLogout() {
        const selfs = this;
        return new Promise((resolve, reject) => {
            if(selfs.backend == null) { selfs.saveCredit().then(() => { resolve(true); }).catch((e) => { reject(e); }); return; }
            // 로그아웃 전 사용자 정보 동기화 해야 함
            selfs.saveCredit().then(() => {
                // 백엔드 로그아웃
                selfs.backend.logout().then(() => {
                    // 로컬 스토리지에서 세션 비우기
                    try { localStorage.setItem('shuttingstar_credit'  , ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; }
                    // Credit 초기화
                    selfs.antiMatterCredit = 0;
                    selfs.darkMatterCredit = 0;
                    selfs.reportSaved = { PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0, maxCombo : 0, playCount : 0, used : 0 };
                    // DOM에 표시
                    if(selfs.rootDiv != null) {
                        selfs.rootDiv.classList.remove('ss_backend_logined');
                        selfs.rootDiv.classList.add('ss_backend_guest');
                    }
                    // 메뉴 목록 다시 갱신
                    selfs.getMenuList().then((menuList) => {
                        selfs.menuListDynamic = menuList;
                        selfs.setState('title');
                        resolve(true);
                    }).catch((e3) => { reject(e3); });
                }).catch((e2) => { reject(e2); });
            }).catch((e) => { reject(e); });
        });
    }

    /** 게임패드 입력 감지 */
    handleGamePads() {
        try {
            const gamepads = window.navigator.getGamepads();
            for(let idx=0; idx<gamepads.length; idx++) {
                const gamepadOne = gamepads[idx];
                if(gamepadOne == null) continue;

                const btns = gamepadOne.buttons;
                if(btns == null) continue;
                if(btns.length < 16) continue;

                let btn;

                // 버튼 번호는 XBOX 기준 (https://adamjones.me/blog/gamepad-mapping/) - 다른 패드 사용 시에는 번호가 다를 수가 있음

                // A
                btn = btns[0];
                if(btn.value > 0 || btn.pressed) {
                    this.handleKeyInput(this.enterKey, true);
                }

                // Menu
                btn = btns[9];
                if(btn.value > 0 || btn.pressed) {
                    this.handleKeyInput(this.escKey, true);
                }

                // LT
                btn = btns[6];
                if(btn.value > 0 || btn.pressed) {
                    this.handleKeyInput(this.keyList[0], true);
                }

                // LB
                btn = btns[4];
                if(btn.value > 0 || btn.pressed) {
                    this.handleKeyInput(this.keyList[1], true);
                }

                // X
                btn = btns[2];
                if(btn.value > 0 || btn.pressed) {
                    this.handleKeyInput(this.keyList[2], true);
                }

                // Y
                btn = btns[3];
                if(btn.value > 0 || btn.pressed) {
                    this.handleKeyInput(this.keyList[3], true);
                }

                // RB
                btn = btns[5];
                if(btn.value > 0 || btn.pressed) {
                    this.handleKeyInput(this.keyList[4], true);
                }

                // RT
                btn = btns[7];
                if(btn.value > 0 || btn.pressed) {
                    this.handleKeyInput(this.keyList[5], true);
                }

                // ARROW UP
                btn = btns[12];
                if(btn.value > 0 || btn.pressed) {
                    this.handleKeyInput(this.arrowKeys[0], true);
                }

                // ARROW DOWN
                btn = btns[13];
                if(btn.value > 0 || btn.pressed) {
                    this.handleKeyInput(this.arrowKeys[1], true);
                }

                // ARROW LEFT
                btn = btns[14];
                if(btn.value > 0 || btn.pressed) {
                    this.handleKeyInput(this.arrowKeys[2], true);
                }

                // ARROW RIGHT
                btn = btns[15];
                if(btn.value > 0 || btn.pressed) {
                    this.handleKeyInput(this.arrowKeys[3], true);
                }

            }
        } catch(e) {
            console.error(e);
        }
    }

    /**
     * 플레이 일시정지
     */
    pauseSong() {
        this.paused = true;
        if(this.audio    != null) { this.audio.pause();    }
        if(this.videoBga != null) {
            if(this.videoBgaUrl != null) this.videoBga.pause();
        }
        if(this.youtubePlayer != null) {
            this.youtubePlayer.pauseVideo();
        }

        this.fGameEvent({ "event" : 'paused', "broker" : this.broker });
    }

    /**
     * 플레이 재개
     */
    resumeSong() {
        if(this.paused) { // 일시정지 중일 때 --> 재개 처리
            this.resumingTime = this.resumeDelayTime * this.timeMultiplier;
            this.paused = false;
        }

        this.fGameEvent({ "event" : 'resumewait', "broker" : this.broker, "timeAfter" : this.resumingTime });
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
        const selfs = this;
        return new Promise((resolve, reject) => {
            selfs.afterConfirmCallback = function(yn) { resolve(yn); }
            selfs.confirmMessage = String(msg);
            selfs.confirmAsking = true;
            selfs.confirmChoosingYes = false;
            selfs.accessililityLog(msg);
        });
    }
    
    /**
     * 거리에 따른 판정 산출
     * 
     * @param {number} distance distance 값
     * @returns {string} 처리 결과 (판정)
     */
    createResultMarkUsingDistance(distance) {
        if(this.hardcoreMode) {
            if(distance < 5.0) {
                return 'PERFECT';
            } else if(distance < 15.0) {
                return 'GREAT';
            } else if(distance < 25.0) {
                return 'GOOD';
            } else if(distance < 50.0) {
                return 'BAD';
            }
        } else {
            if(distance < 10.0) {
                return 'PERFECT';
            } else if(distance < 30.0) {
                return 'GREAT';
            } else if(distance < 50.0) {
                return 'GOOD';
            }
            return 'BAD';
        }
        return 'MISS';
    }

    /**
     * 노트의 원 타이밍과 실제 시간을 비교하여 판정 산출 (사용 결과 좋은 방법은 아닌 것으로...)
     * 
     * @param {SSNote} note 
     * @param {SSNotePlacer} notePlacer
     * @returns {string} 처리 결과 (판정)
     */
    createResultMarkUsingTiming(note, notePlacer) {
        const noteTimeValue = note.originalTiming;
        let   calculated    = noteTimeValue;
        if(this.song != null) calculated = calculated * this.song.noteMultiplier + this.song.timeConstant;

        const diff = Math.abs(calculated - this.elapsedTime); // 주의 ! 밀리초 단위가 아님 ! 곡의 BPM이 반영된 계산값임에 유의 !
        let resultMark = 'MISS';
        if(this.hardcoreMode) {
            if(diff <= 1) {
                resultMark = 'PERFECT';
            } else if(diff <= 2) {
                resultMark = 'GREAT';
            } else if(diff <= 4) {
                resultMark = 'GOOD';
            } else if(diff <= 8) {
                resultMark = 'BAD';
            }
        } else {
            if(diff <= 2) {
                resultMark = 'PERFECT';
            } else if(diff <= 4) {
                resultMark = 'GREAT';
            } else if(diff <= 8) {
                resultMark = 'GOOD';
            } else if(diff <= 16) {
                resultMark = 'BAD';
            }
        }
        // console.log(calculated + ' / ' + this.elapsedTime + ' : ' + diff + ' : ' + resultMark);
        return resultMark;
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
            if(this.mysophobiaMode) this.hp = 0;
            else this.hp -= 1.0;
            if(this.hp < 0) this.hp = 0;
        } else {
            this.combo = 0;
            this.missCombo++;
            this.report.MISS++;
            if(this.mysophobiaMode) this.hp = 0;
            else this.hp -= (4.0 + (this.missCombo >= 1 ? (  this.missCombo >= 10 ? 2 : 1 ) : 0));
            if(this.hp < 0) this.hp = 0;
        }
    }
    
    /**
     * 판정 띄우기
     * @param {string} resultMark resultMark 값
     */
    displayResultMark(resultMark) {
        if(resultMark == null) return;
        this.accelerateExplosingSSJudgeMarks();
        this.objectsPlaying.push(new SSJudgeMark(this, resultMark));
    }

    /**
     * 노트의 반지름
     * @returns {number} 현재 해상도에 맞춘 노트 반지름
     */
    getNoteRadius() {
        return ((this.stageSize.h * this.sizeFixedConst) / this.stageRows) / 2.0;
    }

    /** 3D 매니저의 render 호출 (3D 매니저 로딩이 되어 있어야 사용 가능) */
    call3Drender() {
        if(this.render3DEndTime <= 0) {
            // 아직 이전 사이틀의 timeElapseIn 가 끝나지 않음
            ShuttingStarsUtility.log('3D render performance is too slow !');
            return;
        }

        this.render3DEndTime = 0;
        this.render3DStartTime = performance.now();
        
        // 3D 매니저의 render 호출
        this.ss3d.render(this.canvas3d, this.object3ds);

        // 끝났음을 표시
        this.render3DEndTime = performance.now();
        this.render3DCycleGap = this.render3DEndTime - this.render3DStartTime;
    }

    /** 3D 매니저의 simultaneousJob 호출 (3D 매니저 로딩이 되어 있어야 사용 가능) */
    call3DsimultaneousWork() {
        if(this.simultaneous3DEndTime <= 0) {
            // 아직 이전 사이틀의 timeElapseIn 가 끝나지 않음
            ShuttingStarsUtility.log('3D simultaneous performance is too slow !');
            return;
        }

        this.simultaneous3DEndTime = 0;
        this.simultaneous3DStartTime = performance.now();
        
        // 3D 매니저의 simultaneousJob 호출
        this.ss3d.simultaneousJob(this);

        // 끝났음을 표시
        this.simultaneous3DEndTime = performance.now();
        this.simultaneous3DCycleGap = this.simultaneous3DEndTime - this.simultaneous3DStartTime;
    }

    /**
     * 화면에 객체들 출력, 동시 반복 호출되며 init 에서 시작됨
     */
    render() {
        if(this.renderEndTime <= 0) {
            // 아직 이전 사이틀의 timeElapseIn 가 끝나지 않음
            ShuttingStarsUtility.log('render performance is too slow !');
            return;
        }

        this.renderEndTime = 0;
        this.renderStartTime = performance.now();
        
        // renderIn 호출
        this.renderIn();

        // 끝났음을 표시
        this.renderEndTime = performance.now();
        this.renderCycleGap = this.renderEndTime - this.renderStartTime;
    }

    /**
     * 직접 호출하지 말 것 ! ( render 를 대신 사용 )
     */
    renderIn() {
        try {
            // 캔버스 비우기
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // 좌표계 디버그 모드
            if(this.coordinate2dDebugMode) {
                this.renderCoordinate2dDebug();
            }

            // 곡 타이틀 (플레이 전 로딩시간) - 사전 로딩
            if(this.state == 'songtitle' || this.state == 'listentitle') {
                // 한 타이밍, 게임 렌더링 시도를 하여 이미지 등 리소스 캐싱 유도
                if(this.songTitleTime == this.songTitleBaseTime - 1) {
                    this.renderPlaying();
                    // 다시 비우기
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                }
            }

            // 배경 그리기
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
                    if(typeof(obj.draw) == 'function') obj.draw(this.ctx, this);
                }
            }

            // 게임 제목 강제 표시 옵션 적용 (단 title 상태인 경우는 renderTitle 에서 또 출력하므로 중복출력 방지)
            if(this.showGameTitle && (this.state != 'title')) this.renderGameTitle();

            // 현재 게임 상태별 렌더링
            if(this.basicStates.indexOf(this.state) >= 0) {
                // 기본 상태
                if(this.state == 'playing' || this.state == 'gameover' || this.state == 'listenplaying') {
                    this.renderPlaying();
                } else if(this.state == 'firstset') {
                    this.renderFirstSet();
                } else if(this.state == 'title') {
                    this.renderTitle();
                } else if(this.state == 'menu') {
                    this.renderMenu();
                } else if(this.state == 'songchoosing') {
                    this.renderSongChoosing();
                } else if(this.state == 'songtitle' || this.state == 'listentitle') {
                    this.renderSongTitle();
                } else if(this.state == 'listenchoosing') {
                    this.renderListenChoosing();
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
            } else { // 기타 상태
                for(let idx=0; idx<this.states.length; idx++) {
                    const stateOne = this.states[idx];
                    if(stateOne.name == this.state) {
                        stateOne.render(this.ctx, this);
                    }
                }
            }

            // 글로벌 객체 그리기 (우선순위 높음)
            for(let idx=0; idx<this.objects.length; idx++) {
                const obj = this.objects[idx];
                if(typeof(obj.priority) == 'undefined') continue;
                if(obj.priority == 'high') {
                    if(typeof(obj.draw) == 'function') obj.draw(this.ctx, this);
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
        let debugAreaY;
        let rows;
        let label;
        let opacity = 0.9;

        // 시각화 그리기
        if(this.useAudioVisualizer && this.playPrepared) {
            if(this.audioAnalyser != null && this.audioSource != null) this.renderAudioVisualizing();
        }

        if(! this.disable2d) {
            // 객체 그리기
            for(let idx=0; idx<this.objectsPlaying.length; idx++) {
                const obj = this.objectsPlaying[idx];
                if(obj.explosing > 0 && obj.explosing >= obj.explosingMax) continue;
                if(obj.hidden) continue;
                if(obj instanceof SSNote) {
                    if(this.invisibleNoteMode) continue;
                    if(obj.y < -300 || obj.y >= this.getStageHeight() + 300) continue;
                    if((! this.disable3d) && this.use3d.notes) continue;
                    if(this.themeNote != null) {
                        this.themeNote.draw(this.ctx, this, obj);
                    } else {
                        obj.draw(this.ctx, this);
                    }
                } else {
                    if(typeof(obj.draw) == 'function') obj.draw(this.ctx, this);
                }
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

            let message = '%1 key to resume, %2 key to give up !';
            if(this.state == 'listenplaying') message = '%1 key to resume, %2 key to stop !';
            this.ctx.strokeText(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans(message), '%1', this.enterKey), '%2', escKeyLabel), this.convertX(this.getStageWidth() / 2), this.convertY((this.getStageHeight() / 2) + ((fontSize * 2) + 10) , false));

            // 일시정지 화면 내 곡 정보 출력
            const songOne = this.song;
            rows = this.convertY(this.getStageHeight() * 3.0 / 4.0, false);

            // 곡 이름 출력
            label = songOne.name;
            fontSize = this.convertFontSize(30);
            this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();

            if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
            else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
            this.ctx.textAlign = "center";
            this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), Math.floor(rows));
            rows += this.metricSize2 + (this.metricSize2 / 2);

            // 작곡가, 노트작성자, bpm 출력
            rows = this.convertY(this.getStageHeight(), false) - (this.metricSize2 * 2);
            fontSize = this.convertFontSize(20);
            label = ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2, %3 BPM'), '%1', songOne.composer), '%2', songOne.noteWriter), '%3', String(songOne.bpm));
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
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

        // 일시정지 해제 대기시간 그리기
        if(this.resumingTime >= 1) {
            fontSize = this.convertFontSize(15);
            this.ctx.font = fontSize + 'px ' + this.getRenderFontFamily();

            if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.textAlign = "center";
            this.ctx.strokeText(ShuttingStarsUtility.replaceString(this.trans('Resume within % !'), '%', String(this.resumingTime)), this.convertX(this.getStageWidth() / 2), this.convertY((this.getStageHeight() / 2) + 10));
        }

        // 시간 디버그 출력
        debugAreaY = this.convertY(this.getStageHeight() / 10) +  + (this.metricSize2 * 5);
        if(this.timeElapseDebugMode) {
            fontSize = this.convertFontSize(12);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();

            if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.textAlign = "right";

            this.ctx.fillText(String(ShuttingStarsUtility.floor2(this.elapsedTime) + '  TIME'), this.convertX(this.getStageWidth() * 4 / 5), debugAreaY); debugAreaY += this.metricSize2;
            // this.ctx.fillText(String(ShuttingStarsUtility.floor2(this.elapsedTimeOld)), this.convertX(this.getStageWidth() * 4 / 5), debugAreaY); debugAreaY += this.metricSize2;
        }

        // 수치 디버그 출력
        if(this.numberDebugMode) {
            fontSize = this.convertFontSize(12);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();

            if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.textAlign = "right";

            this.ctx.fillText(String(ShuttingStarsUtility.floor2(this.hp) + ' / 100' + ' LIVES'), this.convertX(this.getStageWidth() * 4 / 5), debugAreaY); debugAreaY += this.metricSize2;
            this.ctx.fillText(String(this.pw + ' / ' + this.pwMax                    + ' POWER'), this.convertX(this.getStageWidth() * 4 / 5), debugAreaY); debugAreaY += this.metricSize2;
            this.ctx.fillText(String(this.point                                      + ' POINT'), this.convertX(this.getStageWidth() * 4 / 5), debugAreaY); debugAreaY += this.metricSize2;
        }

        // 성능 디버그 출력
        if(this.performanceDebugMode) {
            fontSize = this.convertFontSize(12);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();

            if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.textAlign = "right";

            debugAreaY += this.metricSize2;
            this.ctx.fillText(String(ShuttingStarsUtility.floor2(this.simultaneousCycleGap   ) + 'ms P1'), this.convertX(this.getStageWidth() * 4 / 5), debugAreaY); debugAreaY += this.metricSize2;
            this.ctx.fillText(String(ShuttingStarsUtility.floor2(this.timeElapseWorkCycleGap ) + 'ms P2'), this.convertX(this.getStageWidth() * 4 / 5), debugAreaY); debugAreaY += this.metricSize2;
            this.ctx.fillText(String(ShuttingStarsUtility.floor2(this.renderCycleGap         ) + 'ms P3'), this.convertX(this.getStageWidth() * 4 / 5), debugAreaY); debugAreaY += this.metricSize2;
            this.ctx.fillText(String(ShuttingStarsUtility.floor2(this.simultaneous3DCycleGap ) + 'ms P4'), this.convertX(this.getStageWidth() * 4 / 5), debugAreaY); debugAreaY += this.metricSize2;
            this.ctx.fillText(String(ShuttingStarsUtility.floor2(this.render3DCycleGap       ) + 'ms P5'), this.convertX(this.getStageWidth() * 4 / 5), debugAreaY); debugAreaY += this.metricSize2;
        }

        // Create Mode / Listen Mode (자동 플레이 여부) 출력
        if(this.createMode || this.state == 'listenplaying') {
            fontSize = this.convertFontSize(12);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            this.ctx.fillStyle = this.convertColor('rgba(192, 240, 80, 0.9)');
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.trans('AUTO PLAYING'), this.convertX(this.getStageWidth() / 2), this.convertY(this.getStageHeight() / 3));
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
     * 폰트 실제크기 (세로길이) 계산
     * @param {boolean} force 측정값을 강제로 다시 계산할지 여부
     */
    calculateFontMetric(force) {
        if(this.metricSize1 == 20 || force) {
            let metric1, metric2, metric3, fontSize, label;

            // 폰트 크기 측정
            // 선택된 곡인 경우, 배경색 출력
            //    곡 이름과 점유 공간 크기를 알아야 함
            fontSize = this.convertFontSize(20);
            label = 'ABCDE12345한글＆＠';
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
     * 화면 상단 중앙에 게임 제목을 출력
     * 
     * @returns {number} 출력 후 다음 행 Y 위치값
     */
    renderGameTitle() {
        const rows = this.convertY(this.getStageHeight() / 3, false);
        const fontSize = this.convertFontSize(30);
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getOcrFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.strokeText('Shutting Stars', this.convertX(this.getStageWidth() / 2), this.applyY(rows));
        return rows;
    }

    /**
     * 화면 출력 - 타이틀
     *     state - title 메인 출력 담당
     */
    renderTitle() {
        let idx;
        let rows = 0;
        let fontSize = this.convertFontSize(30);
        let opacity = 0.9;
        let gap = Math.floor(fontSize / 2.0);
        let label = '';
        
        this.calculateFontMetric(true);

        rows = this.renderGameTitle();
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
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = 'right';
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getOcrFontFamily();
        this.ctx.fillText('BUILD ' + this.build, this.convertX(this.getStageWidth() * 9 / 10), rows);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillText('Copyright 2026 HJOW', this.convertX(this.getStageWidth() * 9 / 10), rows + this.metricSize2);

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
        
        this.calculateFontMetric(true); // 글꼴 크기 계산
        gap = Math.floor(this.metricSize2 / 2.0); // 위쪽 여백 적용

        // 제목 출력
        fontSize = this.convertFontSize(30);
        rows = this.convertY(this.getStageHeight() / 5, false);
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getOcrFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.strokeText('Shutting Stars', this.convertX(this.getStageWidth() / 2), rows);
        rows += this.metricSize3 + (gap * 4);

        // 메뉴 목록 수에 따라 추가 여백 넣어야 함 (갯수가 늘어날 수록 이 여백의 크기는 줄어들도록)
        rows += Math.floor((this.getStageHeight() - rows - this.metricSize3) / this.menuListDynamic.length);

        // 선택된 메뉴가 없는 경우 첫 번째를 선택
        if(this.menuChoosing == null) this.menuChoosing = this.menuListDynamic[0];

        for(idx=0; idx<this.menuListDynamic.length; idx++) {
            let menuOne = this.menuListDynamic[idx];

            if(menuOne == 'login' || menuOne == 'logout') continue;

            if(menuOne == 'play'     ) label = this.trans('PLAY');
            if(menuOne == 'setting'  ) label = this.trans('SETTING');
            if(menuOne == 'listen'   ) label = this.trans('LISTEN');
            if(menuOne == 'credit'   ) label = this.trans('CREDIT');
            if(menuOne == 'community') label = this.trans('COMMUNITY');
            if(menuOne == 'records'  ) label = this.trans('RECORDS');
            if(menuOne == 'login'    ) label = this.trans('LOGIN');
            if(menuOne == 'logout'   ) label = this.trans('LOGOUT');
            if(menuOne == 'exit'     ) label = this.trans('EXIT');

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
            
            rows += this.metricSize1 + (gap * 2);
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
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 20), rows);

        // Copyright, 빌드 번호 출력
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = 'right';
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getOcrFontFamily();
        this.ctx.fillText('BUILD ' + this.build, this.convertX(this.getStageWidth() * 9 / 10), rows);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillText('Copyright 2026 HJOW', this.convertX(this.getStageWidth() * 9 / 10), rows + this.metricSize2);

        // 로그인된 경우 로그인된 이메일 주소 출력
        let logined = false;
        label = '';
        fontSize = this.convertFontSize(12);
        this.ctx.textAlign = 'left';
        if(this.backend != null && this.backend.avail) {
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
        } else {
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            opacity = 0.99;
            if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
            else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
            label = this.trans('OFFLINE');
            this.ctx.fillText(label, this.convertX(fontSize * 2.8), this.convertY(this.getStageHeight(), false) - (this.metricSize2 * 4.5));
        }

        // 재화 출력
        fontSize = this.convertFontSize(10);
        this.ctx.textAlign = 'left';
        label = '';        
        if(this.antiMatterCredit > 0) label += '    ' + String(this.antiMatterCredit) + ' ATC';
        if(this.darkMatterCredit > 0) label += '    ' + String(this.darkMatterCredit) + ' DMC';
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getOcrFontFamily();
        this.ctx.fillText(label.trim(), this.convertX(fontSize * 2.8), this.convertY(fontSize * 2, false));

        // 하단 공지 출력
        this.renderNoticeBottom();
    }

    /**
     * 공통 공지사항 (타이틀, 메뉴 화면에서 사용) 출력
     */
    renderNoticeBottom() {
        if(this.state == 'playing' || this.state == 'listenplaying') return;

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
        rows = this.convertY(this.getStageHeight() / 6, false);

        // 곡 목록이 비어 있는 경우를 처리
        fontSize = this.convertFontSize(20);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        let emptyState = false;
        let onlyOneState = false;

        if(this.songChoosingMode == 'mission') {
            if(this.missions.length <= 0) {
                this.ctx.strokeText(this.trans('No missions available !'), this.convertX(this.getStageWidth() / 2), rows);
                emptyState = true;
            } else if(this.missions.length == 1) {
                onlyOneState = true;
            }
        } else if(this.songChoosingMode == 'mysong') {
            emptyState = false;
            onlyOneState = false;
        } else {
            if(this.songDisplays.length <= 0) {
                this.ctx.strokeText(this.trans('No songs available !'), this.convertX(this.getStageWidth() / 2), rows);
                emptyState = true;
            } else if(this.songDisplays.length == 1) {
                onlyOneState = true;
            }
        }
        
        // 타이틀 출력
        lefts  = '';
        rights = '';
        if((this.songChoosingMode == 'mission' && this.missions.length >= 1) || (this.songChoosingMode == 'default' && this.songDisplays.length >= 1) || (this.songChoosingMode == 'mysong')) {
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
        } else if(this.songChoosingMode == 'mysong') {
            this.ctx.strokeText(lefts + this.trans('Play with your own music !') + rights, this.convertX(this.getStageWidth() / 2), rows);
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
                    if(selfs.songRandoms.length <= 0) selfs.setState('menu');
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
        let youtubeSongChoosed = null; // Youtube 기반 곡 선택 시 이 곳에 영상ID 탑재
        opacity = 0.99;

        if(this.songChoosingMode == 'mission') { // MISSION
            // mission 모드 - 난이도만 선택

            // 미션을 선택하지 않은 상태인 경우 첫 미션을 출력
            if(this.missionChoosing == null) { this.missionChoosing = this.missions[0]; }

            // 1개 행 높이 사전 계산
            row1Height = this.metricSize3 + (gap * 3);

            // 선택 중인 미션이 몇 번째인지 확인
            for(idx=0; idx<this.missions.length; idx++) {
                if(this.missions[idx] == this.missionChoosing) { currentIndex = idx; break; }
            }

            currentRow = centerY - (  (row1Height * (this.missions.length + currentIndex))); // 1바퀴 하고도 선택된 미션 전단계 만큼 위로 올려야 함

            // 미션 목록 3번 출력
            for(jdx=0; jdx<3; jdx++) {
                for(idx=0; idx<this.missions.length; idx++) {
                    let missionOne = this.missions[idx];

                    let choosen = (jdx == 1 && this.missionChoosing == missionOne);
                    if(choosen) {
                        songChoosen = missionOne;

                        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.99)');
                        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.99)');

                        this.ctx.fillRect(this.getLeftMarginPage(), this.convertY(this.getStageHeight() / 2, false), this.convertX(this.getStageWidth()), row1Height);
                    }

                    // 현재 출력하는 차례가, 중앙으로부터 얼마나 떨어져 있는지를 계산
                    const distanceFromCenter = Math.abs(Math.floor( jdx == 0 ? ( (idx - ( currentIndex + this.missions.length )) ) : (jdx == 1 ? (idx - currentIndex) : ( (( this.missions.length ) - (currentIndex - idx)) )) ));
                    opacity = (distanceFromCenter <= 0.1 ? 0.99 : (distanceFromCenter <= 1.1 ? 0.49 : ( distanceFromCenter <= 2.1 ? 0.245 : ( distanceFromCenter <= 3.1 ? 0.1245 : 0.051225 ) )));

                    // 화면이 수직 방향인 경우 하단 3분의 1 영역 이하는 더 흐리게 처리
                    if(! this.screenDirLandscape) {
                        if(currentRow >= this.convertY(this.getStageHeight() * 1.7 / 3, false)) {
                            opacity = opacity / 4;
                        }
                    }

                    // 타이틀 아래부분을 뚧고 위로 올라가는 위치인 경우 더 흐리게
                    if(currentRow + row1Height < rows) {
                        opacity = opacity / 2.0;
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
                    if(opacity >= 0.99) opacity = 0.99;
                    if(opacity <= 0) opacity = 0.0;
                }
            }
        } else if(this.songChoosingMode == 'mysong') { // MYSONG
            // mysong 모드 - 난이도만 선택하고, 엔터 키를 누르면 파일첨부 창을 띄움

            // 1개 행 높이 사전 계산
            row1Height = this.metricSize3 + (gap * 3);

            // 난이도 배열 준비 (곡 목록처럼 사용)
            const numberArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
            
            // 선택 중인 난이도가 몇 번째인지 확인
            for(idx=0; idx<numberArray.length; idx++) {
                if(numberArray[idx] == this.difficultyLevel) { currentIndex = idx; break; }
            }

            currentRow = centerY - (  (row1Height * (numberArray.length + currentIndex))); // 1바퀴 하고도 선택된 미션 전단계 만큼 위로 올려야 함

            // 난이도 목록 출력 (현재 선택된 난이도가 중앙에 표기되도록) - 3번 출력 (레벨 1 선택된 경우, 그 위로 19, 18이 떠야 하므로)
            for(jdx=0; jdx<3; jdx++) {
                for(idx=0; idx<numberArray.length; idx++) {
                    let diffOne = numberArray[idx];

                    let choosen = (jdx == 1 && this.difficultyLevel == diffOne);
                    if(choosen) {
                        songChoosen = null; // mysong 모드인 경우 일단 null 로 설정 (파일 입력받은 이후에야 곡 객체를 만들 수 있음)

                        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.99)');
                        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.99)');

                        this.ctx.fillRect(this.getLeftMarginPage(), this.convertY(this.getStageHeight() / 2, false), this.convertX(this.getStageWidth()), row1Height);
                    }

                    // 현재 출력하는 차례가, 중앙으로부터 얼마나 떨어져 있는지를 계산
                    const distanceFromCenter = Math.abs(Math.floor( jdx == 0 ? ( (idx - ( currentIndex + numberArray.length )) ) : (jdx == 1 ? (idx - currentIndex) : ( (( numberArray.length ) - (currentIndex - idx)) )) ));
                    opacity = (distanceFromCenter <= 0.1 ? 0.99 : (distanceFromCenter <= 1.1 ? 0.49 : ( distanceFromCenter <= 2.1 ? 0.245 : ( distanceFromCenter <= 3.1 ? 0.1245 : 0.051225 ) )));

                    // 화면이 수직 방향인 경우 하단 3분의 1 영역 이하는 더 흐리게 처리
                    if(! this.screenDirLandscape) {
                        if(currentRow >= this.convertY(this.getStageHeight() * 1.7 / 3, false)) {
                            opacity = opacity / 4;
                        }
                    }

                    // 타이틀 아래부분을 뚧고 위로 올라가는 위치인 경우 더 흐리게
                    if(currentRow + row1Height < rows) {
                        opacity = opacity / 2.0;
                    }

                    // 난이도 목록 출력
                    fontSize = this.convertFontSize(20);
                    label = 'Level ' + String(diffOne);
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
                    if(opacity >= 0.99) opacity = 0.99;
                    if(opacity <= 0) opacity = 0.0;
                }
            }

            
        } else { // DEFAULT
            // default 모드 - 곡을 선택해야 함
            //     곡을 선택하지 않은 상태인 경우 첫 곡을 출력
            if(this.songChoosing == null) { this.songChoosing = this.songDisplays[0]; }

            // 1개 행 높이 사전 계산
            row1Height = this.metricSize3 + this.metricSize1 + this.metricSize2 + (gap * 5);

            // 선택 중인 미션이 몇 번째인지 확인
            for(idx=0; idx<this.songDisplays.length; idx++) {
                if(this.songDisplays[idx] == this.songChoosing) { currentIndex = idx; break; }
            }

            currentRow = centerY - (  (row1Height * (this.songDisplays.length + currentIndex))); // 1바퀴 하고도 선택된 미션 전단계 만큼 위로 올려야 함

            // 곡 목록 3번 출력
            for(jdx=0; jdx<3; jdx++) {
                for(idx=0; idx<this.songDisplays.length; idx++) {
                    let songOne = this.songDisplays[idx];

                    let choosen = (jdx == 1 && this.songChoosing == songOne);
                    if(choosen) {
                        songChoosen = songOne;
                        
                        if(songOne.useYoutube) youtubeSongChoosed = songOne.youtubeVideoId;

                        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.99)');
                        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.99)');

                        if(this.difficultyChoosing) {
                            this.ctx.fillRect(this.getLeftMarginPage(), this.convertY(this.getStageHeight() / 2, false), this.convertX(this.getStageWidth()), (row1Height + this.metricSize2 + (gap * 2)));
                        } else {
                            this.ctx.fillRect(this.getLeftMarginPage(), this.convertY(this.getStageHeight() / 2, false), this.convertX(this.getStageWidth()), (row1Height));
                        }
                    }

                    // 현재 출력하는 차례가, 중앙으로부터 얼마나 떨어져 있는지를 계산
                    const distanceFromCenter = Math.abs(Math.floor( jdx == 0 ? ( (idx - ( currentIndex + this.songDisplays.length )) ) : (jdx == 1 ? (idx - currentIndex) : ( (( this.songDisplays.length ) - (currentIndex - idx)) )) ));
                    opacity = (distanceFromCenter <= 0.1 ? 0.99 : (distanceFromCenter <= 1.1 ? 0.49 : ( distanceFromCenter <= 2.1 ? 0.245 : ( distanceFromCenter <= 3.1 ? 0.1245 : 0.051225 ) )));

                    // 화면이 수직 방향인 경우 하단 3분의 1 영역 이하는 더 흐리게 처리
                    if(! this.screenDirLandscape) {
                        if(currentRow >= this.convertY(this.getStageHeight() * 1.7 / 3)) {
                            opacity = opacity / 4;
                        }
                    }

                    // 타이틀 아래부분을 뚧고 위로 올라가는 위치인 경우 더 흐리게
                    if(currentRow + row1Height < rows) {
                        opacity = opacity / 2.0;
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
                        if(diffIdx < 0) { diffIdx = 0; this.difficulty = this.difficultyChoosingList[diffIdx]; this.difficultyLevel = this.difficulty.difficultyLevel; this.difficultyUsingAutoCreate = this.difficulty.autoCreate; }
                        
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
        
        if(youtubeSongChoosed) label += '    ' + this.trans('Open YouTube : ') + this.keyList[0];

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 20), this.convertY(this.getStageHeight(), false) - (this.metricSize2 * 1.5));
        
        // 선택 곡 상세 정보 (Description) 출력
        let descX = Math.floor(this.canvas.width * 2.7 / 4.0);
        let descW = Math.floor((this.canvas.width * 1.2) / 4.0);

        if(descW < 300) {
            descX = Math.floor(this.canvas.width / 2.0);
            descW = Math.floor((this.canvas.width) / 2.0);
        }
        let desc = [];
        if(songChoosen != null) {
            desc = songChoosen.getDescriptionSplit();
        } else if(this.songChoosingMode == 'mysong') {
            desc.push(this.trans('Play with your own music !'));
            desc.push('(' + this.trans('Scores will not be saved.') + ')');
        }
        if(desc != null && desc.length > 0) {
            fontSize = this.convertFontSize(12);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            this.ctx.textAlign = "left";
            if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(180, 180, 180, ' + opacity + ')');
            else          this.ctx.fillStyle = this.convertColor('rgba(100, 100, 100, ' + opacity + ')');

            rows = Math.floor((this.canvas.height * 2.7 / 4.0) + (fontSize * 3)) + 5;
            for(const line of desc) {
                this.ctx.fillText(line, descX + fontSize + this.getLeftMarginStage(), rows);
                rows += fontSize + gap;
            }
            this.ctx.textAlign = "center";
        }

        // 적용된 커맨드 모드 정보 출력
        this.renderCommandsNow();
    }

    /**
     * 현재 적용된 커맨드 정보 출력
     */
    renderCommandsNow() {
        // 적용된 커맨드 출력
        const commandsApplied = this.getCommandsApplied();
        this.renderCommands(commandsApplied);
    }

    /**
     * 적용된 커맨드 정보 출력
     * @param {Array<string>} commandArr - 출력할 커맨드 배열
     */
    renderCommands(commandArr) {
        if(commandArr == null) return;
        if(commandArr.length <= 0) return;

        let label, idx, fontSize, rows, cols, gap;

        fontSize = this.convertFontSize(15);
        rows = this.metricSize2 * 1.5;
        cols = this.metricSize2 * 1.5;
        gap  = this.metricSize2;
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(180, 180, 180, 0.6)');
        else          this.ctx.fillStyle = this.convertColor('rgba(100, 100, 100, 0.6)');

        // 적용된 커맨드 출력
        for(idx=0; idx<commandArr.length; idx++) {
            label = commandArr[idx];
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            this.ctx.textAlign = "left";
            this.ctx.fillText(label, this.convertX(cols), this.convertY(rows, false));
            cols += (this.metricSize2 * label.length) + gap;
        }

        // 커맨드 입력 진행 중 표시
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
     * 화면 출력 - 곡 선정 화면 (감상 모드)
     */
    renderListenChoosing() {
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
        rows = this.convertY(this.getStageHeight() / 6, false);

        // 곡 목록이 비어 있는 경우를 처리
        fontSize = this.convertFontSize(20);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        let emptyState = false;

        this.songChoosingMode = 'default'; // 감상 모드에서는 곡 목록만 선택
        if(this.songCanListen.length <= 0) {
            this.ctx.strokeText(this.trans('No songs available !'), this.convertX(this.getStageWidth() / 2), rows);
            emptyState = true;
        }
        
        // 타이틀 출력
        lefts  = '';
        rights = '';
        fontSize = this.convertFontSize(30);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        if(this.difficultyChoosing) this.ctx.strokeText(this.trans('Choose difficulty !'), this.convertX(this.getStageWidth() / 2), rows);
        else this.ctx.strokeText(lefts + this.trans('Choose your song to listen !') + rights, this.convertX(this.getStageWidth() / 2), rows);
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

            setTimeout(() => {
                selfs.setState('menu');
            }, 4000);
            return;
        }

        let centerY = this.convertY(this.getStageHeight() / 2, false);
        let currentRow = centerY; // 기존 rows 값을 보존해야 하기 때문에 따로 선언
        let row1Height = 0;
        let currentIndex = 0;
        let songChoosen = null;
        let youtubeSongChoosed = null; // Youtube 기반 곡 선택 시 이 곳에 영상ID 탑재
        let seeListenSelectedSong = false;
        opacity = 0.99;

        //     곡을 선택하지 않은 상태인 경우 첫 곡을 출력
        if(this.songChoosing == null) { this.songChoosing = this.songCanListen[0]; }

        // 1개 행 높이 사전 계산
        row1Height = this.metricSize3 + this.metricSize1 + this.metricSize2 + (gap * 5);

        // 선택 중인 미션이 몇 번째인지 확인
        for(idx=0; idx<this.songCanListen.length; idx++) {
            if(this.songCanListen[idx] == this.songChoosing) { currentIndex = idx; break; }
        }

        currentRow = centerY - (  (row1Height * (this.songCanListen.length + currentIndex))); // 1바퀴 하고도 선택된 미션 전단계 만큼 위로 올려야 함

        // 곡 목록 3번 출력
        for(jdx=0; jdx<3; jdx++) {
            for(idx=0; idx<this.songCanListen.length; idx++) {
                let songOne = this.songCanListen[idx];

                // 재생 목록에 이미 포함됐는지 여부
                const listenSelected = (this.listeningSongList.indexOf(songOne) >= 0);

                let choosen = (jdx == 1 && this.songChoosing == songOne);
                if(choosen) {
                    songChoosen = songOne;
                    
                    if(songOne.useYoutube) youtubeSongChoosed = songOne.youtubeVideoId;

                    if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.99)');
                    else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.99)');

                    if(this.difficultyChoosing) {
                        this.ctx.fillRect(this.getLeftMarginPage(), this.convertY(this.getStageHeight() / 2, false), this.convertX(this.getStageWidth()), (row1Height + this.metricSize2 + (gap * 2)));
                    } else {
                        this.ctx.fillRect(this.getLeftMarginPage(), this.convertY(this.getStageHeight() / 2, false), this.convertX(this.getStageWidth()), (row1Height));
                    }
                }

                // 현재 출력하는 차례가, 중앙으로부터 얼마나 떨어져 있는지를 계산
                const distanceFromCenter = Math.abs(Math.floor( jdx == 0 ? ( (idx - ( currentIndex + this.songCanListen.length )) ) : (jdx == 1 ? (idx - currentIndex) : ( (( this.songCanListen.length ) - (currentIndex - idx)) )) ));
                opacity = (distanceFromCenter <= 0.1 ? 0.99 : (distanceFromCenter <= 1.1 ? 0.49 : ( distanceFromCenter <= 2.1 ? 0.245 : ( distanceFromCenter <= 3.1 ? 0.1245 : 0.051225 ) )));

                // 화면이 수직 방향인 경우 하단 3분의 1 영역 이하는 더 흐리게 처리
                if(! this.screenDirLandscape) {
                    if(currentRow >= this.convertY(this.getStageHeight() * 1.7 / 3)) {
                        opacity = opacity / 4.0;
                    }
                }

                // 타이틀 아래부분을 뚧고 위로 올라가는 위치인 경우 더 흐리게
                if(currentRow + row1Height < rows) {
                    opacity = opacity / 2.0;
                }

                // 곡 이름 출력
                fontSize = this.convertFontSize(20);
                label = songOne.name;
                if(listenSelected) label = '✓ ' + label;
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

                currentRow += row1Height;
                if(opacity >= 0.99) opacity = 0.99;
                if(opacity <= 0) opacity = 0.0;
            }
        }

        // 현재 중앙에 보고 있는 곡이 재생 목록에 포함됐는지 여부 체크
        seeListenSelectedSong = (this.listeningSongList.indexOf(songChoosen) >= 0);

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
        if(seeListenSelectedSong) label += '    ' + this.trans('UNSELECT : ') + this.keyList[1]; // D
        else                      label += '    ' + this.trans('SELECT : '  ) + this.keyList[1];
        label += '      ' + this.trans('PLAY : ') + this.enterKey;
        label += '      ' + this.trans('BACK : ');
        if(this.escKey == 'ESCAPE') label += 'ESC';
        else                        label += this.escKey;
        
        if(youtubeSongChoosed) label += '    ' + this.trans('Open YouTube : ') + this.keyList[0];

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 20), this.convertY(this.getStageHeight(), false) - (this.metricSize2 * 1.5));
        
        // 선택 곡 상세 정보 (Description) 출력
        let descX = Math.floor(this.canvas.width * 2.7 / 4.0);
        let descW = Math.floor((this.canvas.width * 1.2) / 4.0);

        if(descW < 300) {
            descX = Math.floor(this.canvas.width / 2.0);
            descW = Math.floor((this.canvas.width) / 2.0);
        }
        let desc = [];
        if(songChoosen != null) {
            desc = songChoosen.getDescriptionSplit();
        } else if(this.songChoosingMode == 'mysong') {
            desc.push(this.trans('Play with your own music !'));
            desc.push('(' + this.trans('Scores will not be saved.') + ')');
        }
        if(desc != null && desc.length > 0) {
            fontSize = this.convertFontSize(12);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            this.ctx.textAlign = "left";
            if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(180, 180, 180, ' + opacity + ')');
            else          this.ctx.fillStyle = this.convertColor('rgba(100, 100, 100, ' + opacity + ')');

            rows = Math.floor((this.canvas.height * 2.7 / 4.0) + (fontSize * 3)) + 5;
            for(const line of desc) {
                this.ctx.fillText(line, descX + fontSize + this.getLeftMarginStage(), rows);
                rows += fontSize + gap;
            }
            this.ctx.textAlign = "center";
        }

        // 적용된 커맨드 모드 정보 출력
        this.renderCommandsNow();
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
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getOcrFontFamily();
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
            if(settingOne == 'judgeTiming'           ) label = this.trans('Judge Timing'   ) + ' - ' + leftSide + this.judgeTiming + rightSide;
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

        // 적용된 커맨드 모드 정보 출력
        this.renderCommandsNow();
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

        /*
        // 코드 출력 (OCR 장식용)
        fontSize = this.convertFontSize(10);
        label = 'PERFECT:' + this.report.PERFECT + ',GREAT:' + this.report.GREAT + ',GOOD:' + this.report.GOOD + ',BAD:' + this.report.BAD + ',MISS:' + this.report.MISS + ',TOTAL:' + ShuttingStarsUtility.fitDigit(this.point, 10, '0') + ',RANK:' + label;
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getOcrFontFamily();
        this.ctx.textAlign = "center";
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        */

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
        this.renderCommandsNow();
    }

    /**
     * 기록 목록 그리기
     */
    renderRecordList() {
        const selfs = this;
        let idx, jdx, ddx;
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
        rows = this.convertY(this.getStageHeight() / 6, false);

        // 기록 목록이 비어 있는 경우를 처리
        fontSize = this.convertFontSize(20);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        let emptyState = false;
        let onlyOneState = false;

        if(this.selectedRecordList == null) this.selectedRecordList = [];
        if(this.selectedRecordList.length <= 0) {
            emptyState = true;
        }
        if(this.selectedRecordList.length == 1) {
            onlyOneState = true;
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

        // 곡 목록과 마찬가지 방식으로 3번 출력하여 무한 스크롤 효과 구현
        let centerY = this.convertY(this.getStageHeight() / 2, false);
        let currentRow = centerY; // 기존 rows 값을 보존해야 하기 때문에 따로 선언
        let row1Height = 0;
        let currentIndex = 0;
        let recordChoosen = null;
        let youtubeSongChoosed = null; // Youtube 기반 곡 선택 시 이 곳에 영상ID 탑재
        opacity = 0.99;

        // 1개 행 높이 사전 계산
        row1Height = (this.metricSize1 * 2) + this.metricSize2 + (gap * 4);

        // 기록 목록이 빈 경우를 처리
        if(emptyState) {
            rows += this.metricSize1 + gap;

            // ESC 표기
            let escKeyLabel = this.escKey;
            if(this.escKey == 'ESCAPE') escKeyLabel = 'ESC';

            fontSize = this.convertFontSize(30);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.trans('EMPTY !'), this.convertX(this.getStageWidth() / 2), rows);
            return;
        }

        // 선택 중인 기록이 몇 번째인지 확인
        for(idx=0; idx<this.selectedRecordList.length; idx++) {
            if(this.selectedRecordList[idx] == this.seeingRecord) { currentIndex = idx; break; }
        }

        // 1바퀴 하고도 선택된 미션 전단계 만큼 위로 올려야 함
        currentRow = ( centerY - (row1Height / 2) + (this.metricSize1 / 2) ) - (  (row1Height * (this.selectedRecordList.length + currentIndex)));

        // 3회 출력
        for(jdx=0; jdx<3; jdx++) {
            if(onlyOneState) jdx = 1;
            for(idx=0; idx<this.selectedRecordList.length; idx++) {
                const recordOne = this.selectedRecordList[idx];

                let upperY = 0;
                const choosen = (jdx == 1 && this.seeingRecord == recordOne);
                
                // 현재 선택된 기록이 보일 구역에 배경 출력
                if(choosen) {
                    recordChoosen = recordOne;

                    if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.99)');
                    else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.99)');

                    this.ctx.fillRect(this.getLeftMarginPage(), centerY - (row1Height / 2), this.convertX(this.getStageWidth()), row1Height);
                }

                // 현재 출력하는 차례가, 중앙으로부터 얼마나 떨어져 있는지를 계산
                const distanceFromCenter = Math.abs(Math.floor( jdx == 0 ? ( (idx - ( currentIndex + this.selectedRecordList.length )) ) : (jdx == 1 ? (idx - currentIndex) : ( (( this.selectedRecordList.length ) - (currentIndex - idx)) )) ));
                opacity = (distanceFromCenter <= 0.1 ? 0.99 : (distanceFromCenter <= 1.1 ? 0.49 : ( distanceFromCenter <= 2.1 ? 0.245 : ( distanceFromCenter <= 3.1 ? 0.1245 : 0.051225 ) )));

                // 화면이 수직 방향인 경우 하단 3분의 1 영역 이하는 더 흐리게 처리
                if(! this.screenDirLandscape) {
                    if(currentRow >= this.convertY(this.getStageHeight() * 1.7 / 3, false)) {
                        opacity = opacity / 4.0;
                    }
                }

                // 타이틀 아래부분을 뚧고 위로 올라가는 위치인 경우 더 흐리게
                if(currentRow + row1Height < rows) {
                    opacity = opacity / 2.0;
                }

                if(choosen) { currentRow = centerY - (this.metricSize1 / 2); }

                // 기록 이름 출력
                fontSize = this.convertFontSize(20);
                label = recordOne.song.name;
                this.ctx.textAlign = "center";
                this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
                if(choosen) {
                    if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                    else          this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                    this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), currentRow);
                } else {
                    if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                    else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                    this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), currentRow);
                }
                upperY = currentRow + (row1Height / 3); // 우측 랭크 출력 위치 미리 계산
                currentRow += this.metricSize1;
                
                // 작곡가, 노트작성자, bpm 출력
                label = ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2, %3 BPM'), '%1', recordOne.song.composer), '%2', recordOne.song.noteWriter), '%3', String(recordOne.song.bpm));
                fontSize = this.convertFontSize(15);
                this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();

                this.ctx.textAlign = "center";
                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                if(choosen) {
                    this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), currentRow);
                } else {
                    if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                    else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                    this.ctx.strokeText(label, this.convertX(this.getStageWidth() / 2), currentRow);
                }
                currentRow += this.metricSize2 + gap;

                // 점수 및 날짜 출력
                fontSize = this.convertFontSize(20);
                this.ctx.textAlign = "center";
                this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();

                const playDate = new Date();
                playDate.setTime(recordOne.date);
                label = ShuttingStarsUtility.fitDigit(recordOne.point, 8, '0') + ' / ' + ShuttingStarsUtility.formatDate(playDate, 'yyyy-MM-dd HH:mm');
                
                this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), currentRow);
                currentRow += this.metricSize1 + (gap * 3);

                // 랭크 출력
                fontSize = this.convertFontSize(80);
                this.ctx.textAlign = "center";
                this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
                label = recordOne.rank;
                let colorRank = this.judgeResultRankColor(recordOne.rank);
                this.ctx.fillStyle = this.convertColor('rgba(' + colorRank + ', ' + opacity + ')');
                this.ctx.fillText(label, this.convertX(this.getStageWidth() * 9 / 10), upperY);
                if(choosen && recordOne.rank == 'A') { // A color is silver which can be invisible in selected (white background)
                    if(this.dark) colorRank = '80, 80, 80';
                    else          colorRank = '200, 200, 200';
                    this.ctx.strokeStyle = this.convertColor('rgba(' + colorRank + ', ' + opacity + ')');
                    this.ctx.strokeText(label, this.convertX(this.getStageWidth() * 9 / 10), upperY);
                }

                if(opacity >= 0.99) opacity = 0.99;
                if(opacity <= 0) opacity = 0.0;
            }
            if(onlyOneState) break;
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
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 20), this.convertY(this.getStageHeight(), false) - (this.metricSize2 * 1.5));
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
        let report = this.seeingRecord.report;
        if(typeof(report) == 'undefined') report = {};

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
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( report.PERFECT , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rows += this.metricSize1 + (gap/4);

        label = 'GREAT';
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeMarkColor(label) + ', 0.8)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.fillStyle = defColor;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( report.GREAT , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rows += this.metricSize1 + (gap/4);

        label = 'GOOD';
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeMarkColor(label) + ', 0.8)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.fillStyle = defColor;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( report.GOOD , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rowCenter = rows; // 수직 중앙 위치 기록해두기 (랭크 출력할 때 사용)
        rows += this.metricSize1 + (gap/4);

        label = 'BAD';
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeMarkColor(label) + ', 0.8)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.fillStyle = defColor;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( report.BAD , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rows += this.metricSize1 + (gap/4);

        label = 'MISS';
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        this.ctx.fillStyle = this.convertColor('rgba(' + this.judgeMarkColor(label) + ', 0.8)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) - this.convertX(fontSize * 6), rows);
        this.ctx.fillStyle = defColor;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.fitDigit( report.MISS , 5), this.convertX(this.getStageWidth() / 2) + this.convertX(fontSize * 4), rows);
        rows += this.metricSize1 + (gap/2);

        // 점수 출력
        label = ShuttingStarsUtility.fitDigit(this.seeingRecord.point, 10);
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

        // 적용된 커맨드 표기
        this.renderCommands(this.seeingRecord.commands);

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
            let y      = this.getHpBarYLocation() - radius;  // - this.notePlacers[0].y;

            if(y + radius >= this.notePlacers[0].y) { // 가끔 HP바 (행성) 가 SSNotePlacer 위치를 덮어버리는 위치에 출력되는 경우가 있음
                ShuttingStarsUtility.log('HP BAR OVER ' + (y + radius));
                y = this.notePlacers[0].y - radius - 10;
            }
            
            this.ctx.beginPath();
            this.ctx.fillStyle = hpBarInsideColor;
            // this.ctx.arc(this.convertX(x), this.convertY(y), this.convertX(radius), 0, 2 * Math.PI);
            ShuttingStarsUtility.drawGradientedArc(this.ctx, this.convertX(x), this.convertY(y), this.convertY(radius), r, g, b, 0.8, 7);
            this.ctx.fill();
        }

        // HP바 (바형) 출력
        let barFullW = this.getStageHeight() / 5.0;
        let barRealW = (this.hp / 100.0) * barFullW; 

        let barX = (this.getStageWidth() / 2.0) - (barFullW / 2.0);
        let barY = (this.getStageHeight() * 19.0 / 20.0);

        this.ctx.fillRect(this.convertX(barX + 5), this.convertY(barY - 5), this.convertX(barRealW), this.convertY(5));

        this.ctx.font = 'normal ' + this.convertFontSize(10) + 'px ' + this.getOcrFontFamily();
        this.ctx.textAlign = "right";
        this.ctx.fillText('HP', this.convertX(barX - 5), this.convertY(barY + 2));

        // PW바 출력
        barRealW = (this.pw / this.pwMax) * barFullW;
        barY += 20;
        if(     this.pw < this.getPWUsingCost() *  1) this.ctx.fillStyle = 'rgba(250,  50,  50, 0.9)';
        else if(this.pw < this.getPWUsingCost() * 16) this.ctx.fillStyle = 'rgba(200, 125, 125, 0.9)';
        else                               this.ctx.fillStyle = 'rgba(100, 100, 250, 0.9)';
        this.ctx.fillRect(this.convertX(barX + 5), this.convertY(barY - 5), this.convertX(barRealW), this.convertY(5));

        this.ctx.font = 'normal ' + this.convertFontSize(10) + 'px ' + this.getOcrFontFamily();
        this.ctx.fillText('PW', this.convertX(barX - 5), this.convertY(barY + 2));
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

        if(this.vizualizer2d != null) this.vizualizer2d.draw(this.ctx, this, this.canvas.width, this.canvas.height, this.audioBuffer, this.audioBufferLen, this.elapsedTime, this.gameOverDelayed ? 0 : this.hp);
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

        // 기타 안내 출력
        fontSize = this.convertFontSize(12);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        opacity = 0.9;

        label = this.trans('BACK : ');
        if(this.escKey == 'ESCAPE') label += 'ESC';
        else                        label += this.escKey;

        label += '   ' + this.trans('GitHub : ');
        if(this.enterKey == 'ENTER') label += 'ENTER';
        else                         label += this.enterKey;
        
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 20), this.convertY(this.getStageHeight(), false) - (fontSize * 1.5));
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

    /** 로그인 팝업 열기 */
    showLoginPopup() {
        this.keyEventDisabled = true;
        this.pops.dim.classList.remove('invisible');
        this.pops.login.classList.remove('invisible');
        this.fGameEvent({ "event" : 'loginpopupopen', "broker" : this.broker });
    }

    /** 커뮤니티 팝업 열기 */
    showCommunityPopup() {
        const selfs = this;
        this.keyEventDisabled = true;
        this.pops.dim.classList.remove('invisible');

        const area = this.pops.community;
        const canvasBounding = this.canvas.getBoundingClientRect();

        // 영역 크기 조절
        area.style.width  = Math.floor(canvasBounding.width  - 100) + 'px';
        area.style.height = Math.floor(canvasBounding.height - 100) + 'px';
        area.style.left   = '20px';
        area.style.top    = '20px';
        
        // iframe 크기 조절
        const iframes = area.querySelector('iframe');
        iframes.style.height = Math.floor(canvasBounding.height - 150) + 'px';

        // 메뉴
        const divMenu = area.querySelector('.div_community_menu');
        const menus   = divMenu.querySelectorAll('.btn_menu');

        // 메뉴 각 항목 이벤트 중 공통항목
        const fCommonMenuClickAct = function(selfObj) {
            for(let idx=0; idx<menus.length; idx++) {
                const menuOne = menus[idx];
                menuOne.classList.remove('active');
            }
            selfObj.classList.add('active');
        }

        // 메뉴 항목별 이벤트 부여
        let menuOne = divMenu.querySelector('.btn_community_board');
        if(! menuOne.classList.contains('binded_click')) {
            menuOne.addEventListener('click', function() {
                fCommonMenuClickAct(this);
                iframes.src = selfs.otherPages.board;
                iframes.classList.remove('invisible');
            });
            menuOne.classList.add('binded_click');
        }

        // 메뉴 첫 번째 항목 클릭 처리
        if(menus) menus[0].click();

        // 영역 보이기
        area.classList.remove('invisible');

        this.fGameEvent({ "event" : 'communitypopupopen', "broker" : this.broker });
    }

    /** iframe 팝업 열기 */
    showIframePopup(url) {
        this.keyEventDisabled = true;
        this.pops.dim.classList.remove('invisible');

        const area = this.pops.iframes;
        const canvasBounding = this.canvas.getBoundingClientRect();

        area.style.width  = Math.floor(canvasBounding.width  - 100) + 'px';
        area.style.height = Math.floor(canvasBounding.height - 100) + 'px';
        area.style.left   = '20px';
        area.style.top    = '20px';
        area.classList.remove('invisible');

        const iframes = area.querySelector('iframe');
        iframes.style.height = Math.floor(canvasBounding.height - 150) + 'px';
        iframes.src = url;

        area.classList.remove('invisible');

        this.fGameEvent({ "event" : 'iframepopupopen', "broker" : this.broker, "url" : url });
    }

    /** 유튜브 영상 팝업 열기 */
    showYoutubePopup(videoId) {
        const selfs = this;
        if(typeof(YT) == 'undefined') {
            this.alert(this.trans('YouTube API is not loaded. Please check your network connection.'));
            return;
        }

        this.keyEventDisabled = true;
        this.pops.dim.classList.remove('invisible');

        const area = this.pops.youtube;
        const canvasBounding = this.canvas.getBoundingClientRect();

        area.style.width  = Math.floor(canvasBounding.width  - 100) + 'px';
        area.style.height = Math.floor(canvasBounding.height - 100) + 'px';
        area.style.left   = '20px';
        area.style.top    = '20px';
        area.classList.remove('invisible');

        const divRoot = area.querySelector('.div_youtubepop_root');
        divRoot.style.height = Math.floor(canvasBounding.height - 150) + 'px';
        divRoot.innerHTML = "<div class='div_youtubepop_in full'></div>";

        const divContent = divRoot.querySelector('.div_youtubepop_in');
        const randId = 'div_youtubepop_cont_' + ShuttingStarsUtility.randomString(8);
        divContent.id = randId;

        this.youtubePopPlayer = new YT.Player(randId, {
            videoId : videoId,
            width   : Math.floor(canvasBounding.width  * 0.9),
            height  : Math.floor(canvasBounding.height * 0.9),
            playerVars : {
                autoplay : 0,
                controls : 1
            },
            events : {
                onError : (e) => {
                    const errCode = e.data;
                    ShuttingStarsUtility.toast(selfs.trans('Cannot play this youtube video.') + ' Error code : ' + errCode);

                    selfs.keyEventDisabled = false;
                    selfs.pops.dim.classList.add('invisible');
                    selfs.pops.youtube.classList.add('invisible');
                    if(selfs.audioBackground != null) { 
                        if(selfs.state != 'playing' && selfs.state != 'listenplaying') selfs.audioBackground.play(); 
                    }
                    selfs.youtubePopPlayer.destroy();
                    selfs.youtubePopPlayer = null;
                }
            }
        });
        
        area.classList.remove('invisible');
        if(this.audioBackground != null) { this.audioBackground.pause(); }

        this.fGameEvent({ "event" : 'youtubepopupopen', "broker" : this.broker, "videoId" : videoId });
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
                selfs.saveSettings(false);
            }
        });

        this.commands.push({
            command : [5, 4, 3, 2, 1, 0],
            act : function() {
                if(selfs.noteSpeedMultiplier >= 2) selfs.noteSpeedMultiplier = Math.floor(selfs.noteSpeedMultiplier - 1);
                else selfs.noteSpeedMultiplier = Math.floor(selfs.noteSpeedMultiplier / 2.0);
                selfs.saveSettings(false);
            }
        });

        this.commands.push({
            command : [0, 1, 0, 1, 0, 1],
            act : function() {
                selfs.gameOverEnabled = (! selfs.gameOverEnabled);
            }
        });

        this.commands.push({
            command : [4, 4, 4, 4, 4, 4],
            act : function() {
                selfs.hardcoreMode = (! selfs.hardcoreMode);
            }
        });

        this.commands.push({
            command : [3, 3, 4, 4, 5, 5],
            act : function() {
                selfs.mysophobiaMode = (! selfs.mysophobiaMode);
            }
        });

        this.commands.push({
            command : [3, 3, 3, 3, 3, 3],
            act : function() {
                selfs.noLongNote = (! selfs.noLongNote);
            }
        });

        this.commands.push({
            command : [0, 2, 1, 3, 2, 4],
            act : function() {
                selfs.invisibleNoteMode = (! selfs.invisibleNoteMode);
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
     * 적용된 커맨드 목록을 문자열로 반환
     * 
     * @returns {Array<string>}
     */
    getCommandsApplied() {
        let commands = [];
        let label;

        // 배수 옵션
        if(! ShuttingStarsUtility.checkEqualFloats(this.noteSpeedMultiplier, 1.0)) {
            label = '[X' + ShuttingStarsUtility.floor2(this.noteSpeedMultiplier) + ']';
            commands.push(label);
        }

        //  게임오버 활성화 여부
        if(! this.gameOverEnabled) {
            label = '[UNDEAD]';
            commands.push(label);
        }

        //    하드코어 모드
        if(this.hardcoreMode) {
            label = '[HARDCORE]';
            commands.push(label);
        }

        //    결벽증 모드
        if(this.mysophobiaMode) {
            label = '[MYSOPHOBIA]';
            commands.push(label);
        }

        //    노트 숨김 모드
        if(this.invisibleNoteMode) {
            label = '[INVN]';
            commands.push(label);
        }

        //    롱노트 없음 모드
        if(this.noLongNote) {
            label = '[NOLONGN]';
            commands.push(label);
        }

        //    곡 생성 모드
        if(this.createMode) {
            label = '[CREATE]';
            commands.push(label);
        }

        //    감상 모드
        if(this.state == 'listenplaying') {
            label = '[LISTEN]';
            commands.push(label);
        }

        // Core 노출 여부
        if(this.coreDebugMode) {
            label = '[COREDBG]';
            commands.push(label);
        }

        return commands;
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
     */
    simultaneousWork() {
        const selfs = this;

        if(this.simultaneousEndTime <= 0) {
            // 아직 이전 사이틀의 simultaneousWorkIn 가 끝나지 않음
            ShuttingStarsUtility.log('simultaneousWork performance is too slow !');
            return;
        }

        this.simultaneousEndTime = 0;
        this.simultaneousStartTime = performance.now();
        
        // simultaneousWorkIn 호출
        this.simultaneousWorkIn().then(() => {
            selfs.simultaneousEndTime = performance.now(); // 끝났음을 표시
            selfs.simultaneousCycleGap = selfs.simultaneousEndTime - this.simultaneousStartTime;
        }).catch((e) => {
            console.error(e);
        });
    }

    /**
     * 직접 호출하지 말 것 ! ( simultaneousWork 를 통해 사용 ) Promise
     * @return {Promise<*>}
     */
    async simultaneousWorkIn() {
        this.simultaneousTime++;
        if(this.simultaneousTime >= 99999999) this.simultaneousTime = 0;

        try {
            let idx, jdx;

            if(this.youtubePlayer == null) {
                if(this.audio != null) {
                    if((! this.audio.paused) && (! this.audio.ended)) {
                        this.elapsedTime = this.convertElapsedTime(this.audio, this.song.bpm, this.songTiming);
                        this.elapsedTimeSynchronized = true;
                    }
                } else if(this.videoBga != null) {
                    if((! this.videoBga.paused) && (! this.videoBga.ended)) {
                        this.elapsedTime = this.convertElapsedTime(this.videoBga, this.song.bpm, this.songTiming);
                        this.elapsedTimeSynchronized = true;
                    }
                }
            } else {
                if(typeof(this.youtubePlayer.getPlayerState) == 'function') {
                    if(this.youtubePlayer.getPlayerState() == YT.PlayerState.PLAYING) {
                        this.elapsedTime = this.convertElapsedTime(this.youtubePlayer, this.song.bpm, this.songTiming);
                        this.elapsedTimeSynchronized = true;
                    }
                }
            }
            if(this.titleDelayTime >= 1) this.titleDelayTime--;

            // 노트 위치 처리
            this.refreshNoteYLocations();

            // pw 조금 회복
            if(this.state == 'playing' || this.state == 'listenplaying') {
                this.pw++;
                if(this.pw < 0) this.pw = 0;
                else if(this.pw > this.pwMax) this.pw = this.pwMax;
            }

            // CreateMode 인 경우 이미 폭발한 노트도 다시 살리기 (곡 플레이 진행시간을 조절할 수 있기 때문)
            if(this.createMode || this.state == 'listenplaying') {
                for(idx=0; idx<this.objectsPlaying.length; idx++) {
                    const obj = this.objectsPlaying[idx];    
                    if(obj instanceof SSNote) {
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
                if((obj instanceof SSNote) || (obj instanceof SSLongNote)) {
                    if(obj.explosing >= obj.explosingMax) {
                        obj.removed = true;
                        obj.hidden  = true;
                    }
                    // 노트는 제거하지 않음
                } else if(obj instanceof SSNotePlacer) {
                    if(obj.explosing >= obj.explosingMax) obj.explosing = 0;
                } else if(obj instanceof SSJudgeMark) {
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
                            if(obj instanceof SSVirtualKey) {
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

                if(obj instanceof SSStarlight) {
                    // Starlight 제거 파츠
                    if(obj.x < (this.getFullRenderWidth() * (-1.2)) || obj.y < this.getFullRenderHeight() * (-1.2) || obj.x > this.getFullRenderWidth() * 1.2 || obj.y > this.getFullRenderHeight() * 1.2) {
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
            if(this.state == 'songtitle' || this.state == 'listentitle') {
                if(this.songTitleTime > 0) this.songTitleTime--;
                if(this.songTitleTime <= 0) {
                    // 곡 로딩여부 체크 - 로딩 안됐으면 시간 다시 늘리기
                    if(! this.songPrepared) { this.songTitleTime = 4 * this.timeMultiplier; }
                    else {
                        if(this.youtubePlayer != null) { if(! this.youtubePlayerReady) { this.songTitleTime = 4 * this.timeMultiplier; } }
                        else if(this.audio    != null) { if(this.audio.readyState < 4) { this.songTitleTime = 4 * this.timeMultiplier; } }
                    }
                }
                if(this.songTitleTime <= 0) {
                    // 플레이 화면으로 전환
                    if(this.state == 'listentitle') this.setState('listenplaying');
                    else                            this.setState('playing');
                }
            } else if(this.state == 'gameover') { // 게임 오버 출력완료 여부 처리
                if(this.gameoverTime > 0) this.gameoverTime--;
                if(this.gameoverTime <= 0) {
                    this.onSongEnd();
                }
            } else if(this.state == 'credit') { // Credit 처리
                if(this.simultaneousTime % 2 == 0) this.creditIndexIncreases++;
                if(this.creditIndexIncreases >= this.creditIndexIncreaseMax) { this.creditIndex++; this.creditIndexIncreases = 0; }
                if(this.creditIndex < 0) this.creditIndex = 0;
                if(this.creditIndex >= this.creditContents.length) this.creditIndex = 0;
            } else if(this.state == 'playing' || this.state == 'listenplaying') { // 플레이 중 처리
                // 재개 대기 타이밍 처리, SSNoteKeyObject 처리중 애니메이션 재생 진행상황 증가
                if(! this.paused) {
                    // 재개 타이밍 처리
                    if(this.resumingTime >= 1) {
                        this.resumingTime--;
                        if(this.resumingTime <= 0) this.resumed = true;
                        else                       this.resumed = false;
                    } else {
                        // SSNoteKeyObject 처리중 애니메이션 재생 진행상황 증가
                        for(idx=0; idx<this.objectsPlaying.length; idx++) {
                            const obj = this.objectsPlaying[idx];
                            if(obj instanceof SSNoteKeyObject) {
                                if(obj.explosing >= 1 && obj.explosing < obj.explosingMax) {
                                    if(this.simultaneousTime % 4 == 0) obj.explosing += obj.explosingSpeed;
                                }
                            } else if(obj instanceof SSJudgeMark) {
                                if(obj.explosing < obj.explosingMax) {
                                    if(this.simultaneousTime % 4 == 0) obj.explosing += obj.explosingSpeed;
                                }
                            }
                        }
                    }
                }

                // create 모드 - 자동 노트 처리
                if(this.createMode || this.state == 'listenplaying') {
                    for(idx=0; idx<this.notePlacers.length; idx++) {
                        let notePlacerOne = this.notePlacers[idx];
                        for(jdx=0; jdx<this.objectsPlaying.length; jdx++) {
                            let objOne = this.objectsPlaying[jdx];
                            if(objOne instanceof SSNote) {
                                if(objOne.removed) continue;
                                if(notePlacerOne.y + 5 >= objOne.y && notePlacerOne.y - 5 <= objOne.y && notePlacerOne.isConflicted(objOne)) {
                                    this.handleNotePlacerCalled(notePlacerOne);
                                }
                            }
                        }
                    }
                }
            }

            // 게임패드 상태 확인
            this.handleGamePads();
        } catch(e) {
            console.error(e);
            ShuttingStarsUtility.toast('ERROR : ' + e);
            if(this.state == 'playing') this.onGameOver();
            else if(this.state == 'listenplaying') this.onSongEnd();
        }
    }

    /**
     * 곡 동시처리 프로세스 - 시간 진행 (calculateSongBitGap(곡의bpm) 주기마다 1회 호출)
     */
    timeElapse() {
        const selfs = this;

        if(this.timeElapseWorkEndTime <= 0) {
            // 아직 이전 사이틀의 timeElapseIn 가 끝나지 않음
            ShuttingStarsUtility.log('timeElapseWork performance is too slow !');
            return;
        }

        this.timeElapseWorkEndTime = 0;
        this.timeElapseWorkStartTime = performance.now();
        
        // timeElapseIn 호출
        this.timeElapseIn().then(() => {
            selfs.timeElapseWorkEndTime = performance.now(); // 끝났음을 표시
            selfs.timeElapseWorkCycleGap = selfs.timeElapseWorkEndTime - this.timeElapseWorkStartTime;
        }).catch((e) => {
            console.error(e);
        });
    }

    /**
     * 직접 호출하지 말 것 ! ( timeElapse 를 통해 사용 및 관리 )
     */
    async timeElapseIn() {
        try {
            if(this.paused) return;
            if(this.resumingTime >= 1) return;

            if(this.resumed) {
                if(this.audio    != null) { this.audio.play();    }
                if(this.videoBga != null) {
                    if(this.videoBgaUrl != null) { try { this.videoBga.play(); } catch(e) { console.error(e); } }
                }
                if(this.youtubePlayer != null) {
                    this.youtubePlayer.playVideo();
                }
                this.resumed = false;
            }

            const song = this.song;
            let idx, calcRealEndTime;
            let songEnded = false;

            if(song == null) { this.setState('menu'); return; } // 곡이 선정되지 않은 경우 시간 진행 없음
            if(this.difficulty == null || typeof(this.difficulty) == 'undefined') { this.setState('menu'); return; } // 곡 내 난이도가 선정되지 않은 경우 시간 진행 없음
            if(this.state != 'playing' && this.state != 'listenplaying') return; // 곡이 재생 중이 아닌 경우 시간 진행 없음

            // Audio 가 끝나지는 않았으나 로딩된 버퍼가 다 됐는지 체크하기 위하여 직전 elapsedTime 백업
            this.elapsedTimeLast = this.elapsedTime;

            // elapsedTime 갱신
            if(this.youtubePlayer != null) {
                this.elapsedTime = this.convertElapsedTime(this.youtubePlayer, this.song.bpm, this.songTiming);
                this.elapsedTimeSynchronized = true;
            } else if(this.audio != null) {
                songEnded = this.audio.ended;
                if((! this.audio.paused) && (! songEnded)) {
                    this.elapsedTime = this.convertElapsedTime(this.audio, this.song.bpm, this.songTiming);
                    // this.elapsedTime = (this.audio.currentTime * (this.song.bpm / 60.0) * (this.timeMultiplier * this.elapsedTimeMultiplier)) - this.songTiming;
                    this.elapsedTimeSynchronized = true;
                }

                if(this.elapsedTime >= 100 && this.audio.paused) {
                    this.pauseSong(); // 일시정지 처리
                }
            } else if(this.videoBga != null) {
                songEnded = this.videoBga.ended;
                if((! this.videoBga.paused) && (! songEnded)) {
                    this.elapsedTime = this.convertElapsedTime(this.videoBga, this.song.bpm, this.songTiming);
                    this.elapsedTimeSynchronized = true;
                }

                if(this.elapsedTime >= 100 && this.videoBga.paused) {
                    this.pauseSong(); // 일시정지 처리
                }
            } else {
                this.elapsedTime += 1;
            }
            this.elapsedTimeOld++;

            // Audio 버퍼 초과 탐지
            if(this.elapsedTime >= 100 && (! songEnded) && Math.abs(this.elapsedTime - this.elapsedTimeLast) < 0.1) { // 1 이 증가되어야 하는데 10분의 1도 증가하지 못했다 - 버퍼 다쓴 것
                this.elapsedTimeNotIncreased++;
            } else {
                this.elapsedTimeNotIncreased = 0;
            }
            if(this.elapsedTimeNotIncreased >= 100) {
                this.elapsedTimeNotIncreased = 0;
                this.pauseSong(); // 일시정지 처리
                ShuttingStarsUtility.toast(this.trans('Content buffer is empty. Please check your network connection.'));
            }

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

            // Create Mode 혹은 감상 모드인 경우의 롱노트 자동 처리
            if(this.createMode || this.state == 'listenplaying') {
                // 롱노트가 notePlacer 위치에 있는 경우
                for(idx=0; idx<this.objectsPlaying.length; idx++) {
                    const obj = this.objectsPlaying[idx];
                    if(obj instanceof SSLongNote) {
                        const notePlacer = this.getNotePlacer(obj.line);
                        if(notePlacer == null) continue;

                        if(obj.y <= notePlacer.y) {
                            obj.handling = true; // 누른 것으로 처리
                        }
                    }
                }    
            }

            // 이미 지나가버린 패턴 체크
            for(idx=0; idx<this.objectsPlaying.length; idx++) {
                const obj = this.objectsPlaying[idx];
                if((obj instanceof SSNote) && (obj.y <= this.getHpBarYLocation() - 1 )) {
                    if(obj.explosing <= 0) {
                        // 미스 처리
                        let resultMark = 'MISS';
                        this.processResultMark(resultMark);
                        this.displayResultMark(resultMark);
                        obj.removed = true;
                        obj.missed = true;

                        // 폭발 시작
                        obj.explosing = 1;

                        // 추가 폭발 객체 추가
                        const newExplosinves = new SSFailExplosing(this, obj.line, obj.y, '255, 0, 0', '255, 0, 0');
                        this.objects.push(newExplosinves);
                    }
                }
                if((obj instanceof SSLongNote) && (obj.y <= this.getHpBarYLocation() - 1 )) { // y 값이 바뀜
                    if(obj.explosing <= 0) {
                        if((! obj.handling) || obj.missed) {
                            // 미스 처리
                            const resultMark = 'MISS';
                            this.processResultMark(resultMark);
                            this.displayResultMark(resultMark);

                            if(obj.yEnd <= this.getHpBarYLocation() - 1) { // 종료 지점까지 HP바에 도달
                                // 폭발 시작
                                obj.explosing = 1;
                                obj.removed = true;
                                obj.missed  = true;

                                // 추가 폭발 객체 추가
                                const newExplosinves = new SSFailExplosing(this, obj.line, obj.y, '255, 0, 0', '255, 0, 0');
                                this.objects.push(newExplosinves);
                            }
                        }
                    }
                }
            }

            // 롱노트 - 아직 누르고 있는 경우 계속 처리 중 집행
            for(idx=0; idx<this.objectsPlaying.length; idx++) {
                const obj = this.objectsPlaying[idx];
                if(obj instanceof SSLongNote) {
                    if((! obj.missed) && (! obj.removed) && obj.explosing <= 0 && obj.handling) {
                        const resultMark = 'PERFECT';
                        this.processResultMark(resultMark);
                        this.displayResultMark(resultMark);

                        obj.handlingEndTiming = this.elapsedTime;
                        if(obj.yEnd <= this.getHpBarYLocation() - 1) {
                            // 폭발 시작
                            obj.explosing = 1;
                            obj.removed = true;
                            obj.missed  = false;
                        }

                        // 추가 폭발 객체 추가
                        const newExplosinves = new SSCorrectNoteExplosing(this, obj.line, obj.y, obj.color, '255, 255, 255');
                        this.objects.push(newExplosinves);
                    }
                }
            }

            // 곡의 끝 체크
            songEnded = false;
            //   곡의 명시된 종료시간과 마지막 패턴의 시간, 그리고 audio 가 존재하는 경우 실제 종료시간까지 비교해 더 큰 값 선택
            //      마지막 패턴의 시간
            let lastPatternTime = this.songLastPatternTime + this.noteLocationConst;
            if(this.song != null) lastPatternTime = lastPatternTime * this.song.noteMultiplier + this.song.timeConstant;
            //     audio 존재 시 실제 종료 시간 체크
            if(this.song != null && this.audio != null) {
                calcRealEndTime = this.calculateSongDuration(this.audio, this.song.bpm) + this.noteLocationConst + this.song.timeConstant + (this.timeMultiplier * 2);
                if(calcRealEndTime > lastPatternTime) lastPatternTime = calcRealEndTime;
            }
            //     명시된 종료 시간 체크 (높은 우선순위)
            if(this.song != null && this.song.endTime > 0) {
                calcRealEndTime = (this.song.endTime + this.noteLocationConst) * this.song.noteMultiplier + this.song.timeConstant;
                lastPatternTime = calcRealEndTime;
            }

            // 곡의 끝에 다다랐는지 확인 (단, 게임오버 출력 시에는 제외)
            songEnded = this.elapsedTime > lastPatternTime && (! (this.gameOverEnabled && this.gameOverDelayed));
            if((! songEnded) && (this.elapsedTime >= 10)) {
                // 노트들이 남았더라도 곡이 끝났으면 종료 처리
                if(this.audio != null) {
                    if(this.audio.ended) songEnded = true;
                } else if(this.videoBga != null) {
                    if(this.videoBga.ended) songEnded = true;
                } else if(this.youtubePlayer != null) {
                    if(typeof(this.youtubePlayer.getPlayerState) == 'function') {
                        if(this.youtubePlayer.getPlayerState() == YT.PlayerState.ENDED) songEnded = true;
                    }
                }
            }
            if(songEnded) {
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
        } catch(e) {
            console.error(e);
            ShuttingStarsUtility.toast('ERROR : ' + e);
            if(this.state == 'playing') this.onGameOver();
            else if(this.state == 'listenplaying') this.onSongEnd();
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
     * 폭발 중인 SSJudgeMark 폭발속도 가속
     */
    accelerateExplosingSSJudgeMarks() {
        for(let idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if(obj instanceof SSJudgeMark) {
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
        // 전 노트 및 SSNotePlacer 폭발 조치
        for(let idx=0; idx<this.objectsPlaying.length; idx++) {
            let obj = this.objectsPlaying[idx];
            if(obj.hidden) continue;
            if(typeof(obj.explosing) == 'number') {
                if(obj.explosing <= 0) obj.explosing = 1;
            }
        }

        // HP 0 처리
        this.hp = 0;
        this.gameOverDelayed = true;

        // 거대 폭발 객체 생성
        const bigExp = new SSPlanetExplosing(this, 0, 0, '180, 0, 0', '250, 80, 80');
        bigExp.x = Math.round((this.notePlacers[0].x + this.notePlacers[this.notePlacers.length-1].x) / 2.0);
        bigExp.y = this.getHpBarYLocation();
        bigExp.r = 64;
        bigExp.explosing = 1;
        this.objects.push(bigExp);

        // 폭발 가속
        this.accelerateExplosingNotes();
        this.accelerateExplosingSSJudgeMarks();

        // 게임오버 상태로 변경
        this.gameoverTime = 16 * this.timeMultiplier;
        this.setState('gameover');
        this.paused = false;
    }

    /**
     * 곡 플레이 종료 시 호출 (Promise)
     */
    async onSongEnd() {
        const selfs = this;
        const beforeState = this.state;
        let idx;

        let diff = this.song.difficulties[ this.difficulty.index ];

        if(beforeState == 'listenplaying') { // 감상 모드 재생곡 끝남 - 다음 리스트 확인
            // 재생 중단
            this.paused = false;
            this.stopAudio();
            this.audio = null;
            this.songThumb = null;
            this.videoBgaUrl = null; // TODO
            this.songPrepared = false;
            this.playPrepared = false;

            // 곡 재생 목록 확인
            let listenIdx = this.listeningSongList.indexOf(this.song);
            if(listenIdx < 0) listenIdx = 0;
            if(this.listeningLoop) {
                // 반복
                if(listenIdx + 1 >= this.listeningSongList.length) {
                    listenIdx = 0;
                    // 순서 다시 섞기
                    this.listeningSongList = ShuttingStarsUtility.randomizeArrayElements(this.listeningSongList);
                }
            }

            if(listenIdx + 1 < this.listeningSongList.length) { // 다음 곡이 존재
                // 다음 곡 재생
                this.song = this.listeningSongList[listenIdx + 1];

                this.difficultyChoosingList = this.song.getDifficultyList();
                this.difficulty = this.difficultyChoosingList[0];
                this.difficultyLevel = this.difficulty.difficultyLevel;
                this.difficultyUsingAutoCreate = this.difficulty.autoCreate;

                this.songTitleTime = this.songTitleBaseTime;
                if(! isNaN(this.song.loadingTime)) this.songTitleTime += this.song.loadingTime;
                this.titleDelayTime = this.titleDelayTimeMax;

                this.setState('listentitle'); // 다음 곡 타이틀로 이동

                // 3D 매니저 이벤트 호출
                if(this.ss3d != null) {
                    this.ss3d.onSongEnd(this);
                }
            } else {
                // 곡 재생이 불가능 - 감상 곡 목록 화면으로 이동
                this.setState('listenchoosing');
            }
        } else {
            // 결과 화면 띄우기
            this.setState('result');

            // 재생 중단
            this.paused = false;
            this.stopAudio();
            this.audio = null;
            this.songThumb = null;
            this.videoBgaUrl = null; // TODO
            this.songPrepared = false;
            this.playPrepared = false;

            // Note 갯수 체크
            let count = diff.patterns.length;
            let rank = this.judgeResultRank();

            // 기록 여부 결정
            let recordYn = true;
            if(this.createMode) recordYn = false;
            else if(this.song instanceof CustomMySSSong) recordYn = false;

            if(recordYn) {
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
                    commands : selfs.getCommandsApplied(),
                    build : this.build,
                    userAgent : window.navigator.userAgent
                });
            }

            // MySong 인 곡들을 목록에서 제거
            try {
                for(idx=0; idx<this.songs.length; idx++) {
                    const songOne = this.songs[idx];
                    if(songOne instanceof CustomMySSSong) {
                        this.songs.splice(idx, 1);
                        idx--;
                    }
                }

                for(idx=0; idx<this.songDisplays.length; idx++) {
                    const songOne = this.songDisplays[idx];
                    if(songOne instanceof CustomMySSSong) {
                        this.songDisplays.splice(idx, 1);
                        idx--;
                    }
                }

                for(idx=0; idx<this.songRandoms.length; idx++) {
                    const songOne = this.songRandoms[idx];
                    if(songOne instanceof CustomMySSSong) {
                        this.songRandoms.splice(idx, 1);
                        idx--;
                    }
                }
            } catch(e) {
                console.error(e);
            }

            // 3D 매니저 이벤트 호출
            if(this.ss3d != null) {
                this.ss3d.onSongEnd(this);
            }
        }

        if(beforeState == 'playing') { try { this.backend.logEvent('PLAY END : ' + this.song.name + ' (' + diff.difficultyLevel + ')'); } catch(ignores) {} }
        else                         { try { this.backend.logEvent('LISTEN END : ' + this.song.name + ' (' + diff.difficultyLevel + ')'); } catch(ignores) {} }

        this.fGameEvent({ "event" : 'songend', "broker" : this.broker });
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

        // Youtube 도 종료
        if(this.youtubePlayer != null) {
            this.youtubeDiv.classList.add('invisible');
            this.youtubePlayer.destroy();
            this.youtubePlayer = null;
        }
    }

    /**
     * 오디오 관련 리소스 닫기 (예외 발생해도 무시)
     */
    closeAudioSources() {
        if(this.audioSource      != null) { try { this.audioSource.disconnect();      this.audioSource      = null; } catch(exIn) { ShuttingStarsUtility.log('Error on closing audio source. You can ignore them.'); console.error(exIn); } }
        if(this.audioAnalyser    != null) { try { this.audioAnalyser.disconnect();    this.audioAnalyser    = null; } catch(exIn) { ShuttingStarsUtility.log('Error on closing audio source. You can ignore them.'); console.error(exIn); } }
        if(this.audioCtx         != null) { try { this.audioCtx.close();              this.audioCtx         = null; } catch(exIn) { ShuttingStarsUtility.log('Error on closing audio source. You can ignore them.'); console.error(exIn); } }
        if(this.audioCtxPre      != null) { try {                                     this.audioCtxPre      = null; } catch(exIn) { ShuttingStarsUtility.log('Error on closing audio source. You can ignore them.'); console.error(exIn); } }
    }

    /** 
     * 소모되는 PW 비용 반환 
     * 
     * @returns {number} 소모되는 PW 비용 
    */
    getPWUsingCost() {
        let values = this.pwUse;
        if(this.hardcoreMode) values = values * 4;
        return values;
    }

    /**
     * 현재 로드된 노트들 반환
     * @returns {Array<SSNote>} 현재 플레이 객체에 포함된 노트 목록
     */
    getNotes() {
        let arr = [];
        for(let idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if(obj instanceof SSNote) {
                arr.push(obj);
            }
        }
        return arr;
    }

    /**
     * 현재 등록된 노트 판정 객체 목록을 반환합니다.
     * @returns {Array<SSNotePlacer>} 노트 판정 객체 목록
     */
    getNotePlacers() {
        let arr = [];
        for(let idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if(obj instanceof SSNotePlacer) {
                arr.push(obj);
            }
        }
        return arr;
    }

    /**
     * 지정한 레인의 노트 판정 객체를 반환합니다.
     * @param {number} line 노트 레인의 인덱스
     * @returns {SSNotePlacer|null} 해당 레인의 판정 객체
     */
    getNotePlacer(line) {
        for(let idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if(obj instanceof SSNotePlacer) {
                if(obj.line === line) {
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
                    if(selfs.ss3d != null && selfs.canvas3d != null && (! selfs.disable3d)) { selfs.call3Drender(); }
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
                        } else { ss3dworked = true; selfs.call3DsimultaneousWork(); }
                    }
                }
            } else {
                ShuttingStarsUtility.repeat(() => {
                    if(selfs.ss3d != null && selfs.canvas3d != null && (! selfs.disable3d)) { selfs.call3Drender(); }
                }, this.frameTime * 2);

                ShuttingStarsUtility.repeat(() => {
                    if(selfs.ss3d != null) { 
                        if(selfs.disable3d) {  
                            if(ss3dworked) {
                                selfs.ss3d.clear();
                                ss3dworked = false;
                            }
                        } else { ss3dworked = true; selfs.call3DsimultaneousWork(); }
                    }
                }, this.frameTime);
            }

            this.fGameEvent({ "event" : '3dmanagerready', "broker" : this.broker });
        }
        else throw 'Only for ShuttingStars3DManager type !';
    }

    /**
     * 해당 장식 객체가 UI 관련 장식인지 확인
     * @param {SSDecorationObject} obj
     * @return {boolean} UI 관련 장식인지 여부
     */
    isUIDecorationObject(obj) {
        if(obj instanceof SSVirtualKey) return true;
        if(obj instanceof SSMouseEventArea) return true;
        if(obj instanceof SSMouseClickHighlighter) return true;
        return false;
    }

    /**
     * 해당 장식 객체가 2D 별빛 장식인지 확인
     * @param {SSDecorationObject} obj
     * @return {boolean} 
     */
    isStarlight(obj) {
        if(obj instanceof SSStarlight) return true;
        return false;
    }

    /**
     * 곡에 포함되어 있던 장식 추가문구 해석해 집행
     * @param {Object} decoJson decoJson 값
     */
    addDecoration(decoJson) {
        let obj = null;
        let type = String(decoJson.type).toLowerCase();

        if(type == 'explosion') {
            obj = new SSExplosingObject(this, 0, 0, '255, 255, 255', '255, 255, 255');
            obj.x = decoJson.x;
            obj.y = decoJson.y;
            obj.r = decoJson.r;
            obj.explosing = 1;
        } else if(type == 'star' || type == 'starlight') {
            obj = new SSStarlight(this);
            obj.x = decoJson.x;
            obj.y = decoJson.y;
            obj.r = decoJson.r;
            obj.speedX = 1;
            obj.speedY = 0;
        } else if(type == 'text') {
            obj = new SSTextDeco(this, decoJson.text, decoJson.x, decoJson.y, decoJson.fontSize, decoJson.align, decoJson.color);
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

        for(let idx=0; idx<this.songRandoms.length; idx++) {
            const songOne = this.songRandoms[idx];
            
            this.creditContents.push({ label : songOne.name, fontSize : 25 });
            this.creditContents.push({ label : ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2'), '%1', songOne.composer), '%2', songOne.noteWriter), fontSize : 15 });
            this.creditContents.push({ label : '', fontSize : 25 });
        }

        for(let idx=0; idx<3; idx++) {
            this.creditContents.push({ label : '', fontSize : 30 });
        }

        this.creditContents.push({ label : 'Third Parties', fontSize : 30 });
        this.creditContents.push({ label : '', fontSize : 30 });

        this.creditContents.push({ label : 'JSON5', fontSize : 25 });
        this.creditContents.push({ label : 'The MIT License - Copyright (c) 2012-2018 Aseem Kishore, and others.', fontSize : 15 });
        this.creditContents.push({ label : 'https://github.com/json5/json5/blob/main/LICENSE.md', fontSize : 15 });
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

        this.creditContents.push({ label : 'jQuery (Only for few features)', fontSize : 25 });
        this.creditContents.push({ label : 'Projects referencing this document are released under the terms of the MIT license.', fontSize : 15 });
        this.creditContents.push({ label : 'https://jquery.com/license/', fontSize : 15 });
        this.creditContents.push({ label : '', fontSize : 25 });

        this.creditContents.push({ label : 'Pure CSS', fontSize : 25 });
        this.creditContents.push({ label : 'The BSD License - Copyright 2013 Yahoo! Inc.', fontSize : 15 });
        this.creditContents.push({ label : 'https://github.com/pure-css/pure/blob/main/LICENSE', fontSize : 15 });
        this.creditContents.push({ label : '', fontSize : 25 });

        this.creditContents.push({ label : '나눔고딕, 나눔명조, 나눔고딕코딩, D2Coding', fontSize : 25 });
        this.creditContents.push({ label : 'SIL Open Font License, Version 1.1.', fontSize : 15 });
        this.creditContents.push({ label : 'https://help.naver.com/service/30016/contents/18088?osType=PC&lang=ko', fontSize : 15 });
        this.creditContents.push({ label : '', fontSize : 25 });

        this.creditContents.push({ label : 'Sonniss GDC GameAudio Bundle', fontSize : 25 });
        this.creditContents.push({ label : 'Unlimited User License', fontSize : 15 });
        this.creditContents.push({ label : 'https://sonniss.com/gdc-bundle-license/', fontSize : 15 });
        this.creditContents.push({ label : '', fontSize : 25 });

        // https://sonniss.com/gdc-bundle-license/

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
            <div class='shuttingstars_pop_content pop_mysong invisible'></div>
            <div class='shuttingstars_pop_content pop_community invisible'></div>
            <div class='shuttingstars_pop_content pop_youtube invisible'></div>
            <div class='shuttingstars_pop_content pop_iframe invisible'></div>

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
                        <td colspan='2' style='text-align: right;'><button type='button' class='btn btn_login_cancel red' style='font-size: 0.9rem; padding-left: 0.9rem; padding-right: 0.9rem; padding-top: 0.1rem; padding-bottom: 0.1rem;'>X</button></td>
                    </tr>
                    <tr>
                        <td colspan='2' style='text-align: center; height: 160px; vertical-align: middle;'>
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
                            <div style='line-height: 1rem;'><span class='span_desc_privacy target_translate' style='font-size: 0.9rem;'>Logging in means you agree to our Privacy Policy.</span></div>
                            <div style='line-height: 1rem;'><a href='privacy.html' target='_blank' class='a_privacy target_translate' style='font-size: 0.9rem;'>Privacy Policy</a></div>
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
                const resp = await fetch(rowOne.url);
                const text = await resp.text();
                const respSong = ShuttingStarsUtility.parseJSON(text);
                respSong.contentname = rowOne.contentname;
                selfs.addSong(respSong);
            }
        }

        const fAfter2 = function() {
            selfs.getMenuList().then((menuList) => {
                selfs.menuListDynamic = menuList;

                // selfs.backend.loadUserInfo();
                selfs.loadCredit().then(() => {
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
            });
        };

        const fAfter1 = function(respJson) {
            const success = respJson.success;
            const user    = respJson.userJson;
            if(! success) {
                selfs.toast(selfs.trans('Login failed.'));
            }

            selfs.keyEventDisabled = false;
            selfs.pops.login.classList.add('invisible');
            selfs.pops.mysong.classList.add('invisible');
            selfs.pops.iframes.classList.add('invisible');
            selfs.pops.youtube.classList.add('invisible');
            selfs.pops.dim.classList.add('invisible');

            if(selfs.audioBackground != null) {
                if(selfs.state != 'playing' && selfs.state != 'listenplaying') selfs.audioBackground.play();
            }
            if(selfs.youtubePopPlayer != null) {
                selfs.youtubePopPlayer.destroy();
                selfs.youtubePopPlayer = null;
            }

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

        // 커뮤니티 팝업 pop_community
        popInside = popRoot.querySelector('.pop_community');
        htmls = '';
        htmls = `
            <div class='div_community_menu menu'>
                <button type='button' class='btn btn_menu btn_community_board target_translate active'>BOARD</button>
                <button type='button' class='btn btn_exit red'>X</button>
            </div>
            <iframe class='ss_iframe_community full'></iframe>
        `;
        popInside.innerHTML = htmls;
        popInside.querySelector('.btn_exit').addEventListener('click', () => {
            selfs.pops.community.classList.add('invisible');
            selfs.pops.dim.classList.add('invisible');
            selfs.keyEventDisabled = false;
        });
        this.pops.community = popInside;

        // iframe 팝업
        popInside = popRoot.querySelector('.pop_iframe');
        htmls = `
            <div class='div_others_menu menu'>
                <button type='button' class='btn btn_exit red'>X</button>
            </div>
            <iframe class='ss_iframe_other full'></iframe>
        `;
        popInside.innerHTML = htmls;
        popInside.querySelector('.btn_exit').addEventListener('click', () => {
            selfs.pops.iframes.classList.add('invisible');
            selfs.pops.dim.classList.add('invisible');
            selfs.keyEventDisabled = false;
        });
        this.pops.iframes = popInside;

        // youtube 팝업
        popInside = popRoot.querySelector('.pop_youtube');
        htmls = `
            <div class='div_others_menu menu'>
                <button type='button' class='btn btn_exit red'>X</button>
            </div>
            <div class='div_youtubepop_root full'></div>
        `;
        popInside.innerHTML = htmls;
        popInside.querySelector('.btn_exit').addEventListener('click', () => {
            selfs.pops.youtube.classList.add('invisible');
            selfs.pops.dim.classList.add('invisible');
            selfs.keyEventDisabled = false;
            if(selfs.audioBackground != null) {
                if(selfs.state != 'playing' && selfs.state != 'listenplaying') selfs.audioBackground.play();
            }
            if(selfs.youtubePopPlayer != null) {
                selfs.youtubePopPlayer.destroy();
                selfs.youtubePopPlayer = null;
            }
        });
        this.pops.youtube = popInside;

        // mysong 팝업
        popInside = popRoot.querySelector('.pop_mysong');
        htmls = `
            <div class='div_mysong_menu menu'>
                <h2 class='target_translate' style='position: absolute;'>Play with your own music !</h2>
                <button type='button' class='btn btn_exit red'>X</button>
            </div>
            <div class='div_mysong_file full' style='padding-top : 50px;'>
                <table class='layout' style='width: 90%;'>
                    <colgroup>
                        <col style='width:12rem;'/>
                        <col/>
                    </colgroup>
                    <tbody>
                        <tr>
                            <th class='target_translate'>MUSIC SOURCE</th>
                            <td>
                                <select class='sel sel_mysong_sourcetype' style='width:90%'>
                                    <option value='file' class='target_translate'>File</option>
                                    <option value='url'  class='target_translate'>URL</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th class='target_translate'>MUSIC</th>
                            <td>
                                <input type='file' class='inp inp_file inp_mysong_file' accept='audio/*' style='font-size: 1rem;'/>
                                <input type='url' class='inp inp_url inp_mysong_url invisible' style='font-size: 1rem; width: 90%;'/>
                            </td>
                        </tr>
                        <tr>
                            <th class='target_translate'>BPM</th>
                            <td>
                                <input type='number' class='inp inp_mysong_bpm' value='100' min='30' max='299' step='1' style='font-size: 1rem;'/>
                                <progress class='prog prog_mysong_bpm invisible' style='height: 1.2rem; margin-left: 20px;'></progress>
                            </td>
                        </tr>
                        <tr>
                            <td colspan='2' class='center' style='text-align: center'>
                                <textarea class='full ta_mysong_json'></textarea>
                            </tr>
                        </tr>
                        <tr>
                            <td colspan='2' class='center' style='text-align: center'><button type='button' class='btn btn_mysong_accept target_translate'>PLAY</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        popInside.innerHTML = htmls;
        popInside.style.height = '400px';

        const selMysongSrc  = popInside.querySelector('.sel_mysong_sourcetype');
        const inpMysongFile = popInside.querySelector('.inp_mysong_file');
        const inpMysongUrl  = popInside.querySelector('.inp_mysong_url');
        const inpMysongBpm  = popInside.querySelector('.inp_mysong_bpm');
        const prgMysongBpm  = popInside.querySelector('.prog_mysong_bpm');
        const taMysongJson  = popInside.querySelector('.ta_mysong_json');
        const btnMysongPly  = popInside.querySelector('.btn_mysong_accept');
        let   urlMysong = null;
        let   nameMySong = null;
        let   bpmMySong = 100;
        let   jsonMySong = '';

        taMysongJson.placeholder = this.trans('Custom settings here (JSON format)');

        selMysongSrc.addEventListener('change', (e) => {
            const val = e.target.value;
            if(val == 'file') {
                inpMysongFile.classList.remove('invisible');
                inpMysongUrl.classList.add('invisible');
            } else {
                inpMysongFile.classList.add('invisible');
                inpMysongUrl.classList.remove('invisible');
            }
        });

        inpMysongFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if(file) {
                urlMysong  = URL.createObjectURL(file);
                nameMySong = file.name;

                prgMysongBpm.classList.remove('invisible');
                btnMysongPly.classList.add('invisible');
                let responsed = false;

                try {
                    BpmDetector.detect(urlMysong).then((bpmPredicted) => {
                        if(responsed) return;
                        responsed = true;

                        inpMysongBpm.value = bpmPredicted;
                        prgMysongBpm.classList.add('invisible');
                        btnMysongPly.classList.remove('invisible');
                    }).catch((e2) => {
                        ShuttingStarsUtility.log(e2);

                        if(responsed) return;
                        responsed = true;

                        prgMysongBpm.classList.add('invisible');
                        btnMysongPly.classList.remove('invisible');
                    });
                } catch(e1) {
                    ShuttingStarsUtility.log(e1);

                    if(responsed) return;
                    responsed = true;

                    prgMysongBpm.classList.add('invisible');
                    btnMysongPly.classList.remove('invisible');
                }
            } else {
                urlMysong = null;
            }
        });

        popInside.querySelector('.btn_exit').addEventListener('click', () => {
            selfs.pops.mysong.classList.add('invisible');
            selfs.pops.dim.classList.add('invisible');
            selfs.keyEventDisabled = false;
        });
        btnMysongPly.addEventListener('click', async () => {
            const sourceType = selMysongSrc.value;
            if(sourceType == 'url') {
                const mayBeUrl = inpMysongUrl.value;
                const availYn = await ShuttingStarsUtility.checkAccessibleURL(mayBeUrl);
                if(! availYn) {
                    ShuttingStarsUtility.toast(selfs.trans('This URL is not available !'));
                    return;
                }

                urlMysong  = mayBeUrl;
            }

            if(urlMysong == null) { ShuttingStarsUtility.toast(selfs.trans('Please select your file first !')); return; }

            selfs.pops.mysong.classList.add('invisible');
            selfs.pops.dim.classList.add('invisible');

            bpmMySong  = parseInt(inpMysongBpm.value);
            jsonMySong = taMysongJson.value;

            try {
                await selfs.loadMySong(urlMysong, nameMySong, bpmMySong, selfs.difficultyLevel, jsonMySong);
            } catch(e) {
                console.error(e);
                selfs.alert('ERROR : ' + e);
            }
            
        });
        this.pops.mysong = popInside;

        // 스트링 테이블 번역 적용
        const fTrans = function() {
            selfs.pops.root.querySelectorAll('.target_translate').forEach((itemOne) => {
                if(itemOne.classList.contains('target_translated')) return;
                itemOne.innerHTML = selfs.trans(itemOne.innerHTML);
                itemOne.classList.add('target_translated');
            });
        };
        setTimeout(fTrans, 1000);
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
                    <button type='button' class='btn btn_exit red'>X</button>
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
                                    <th class='target_translate'>Note Speed Rate</th>
                                    <td><input type='number' class='inp inp_notespeedrate full' step='0.1' min='1.0' max='8.0'/></td>
                                </tr>
                                <tr>
                                    <th class='target_translate'>Key Press Delay</th>
                                    <td><input type='number' class='inp inp_keypressdelay full' step='1' min='0' max='9999'/></td>
                                </tr>
                                <tr>
                                    <th class='target_translate'>Sound Delay</th>
                                    <td><input type='number' class='inp inp_sounddelay full' step='1' min='0' max='9999'/></td>
                                </tr>
                                <tr>
                                    <th class='target_translate'>Judge Timing</th>
                                    <td><input type='number' class='inp inp_judgetiming full' step='1' min='-200' max='200'/></td>
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
                                    <th class='target_translate'>Worker</th>
                                    <td>
                                        <select class='sel sel_worker full'>
                                            <option value='Y' class='target_translate'>USE</option>
                                            <option value='N' class='target_translate'>NOT USE</option>
                                        </select>
                                    </td>
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
                                <tr>
                                    <th class='target_translate'>Font</th>
                                    <td>
                                        <input type='text' class='inp inp_mainfont full' list='ss_config_mainfont_list'/>
                                        <datalist id='ss_config_mainfont_list'>
                                            <option value='D2 coding'></option>
                                            <option value='Nanum Gothic Coding'></option>
                                            <option value='Noto Sans KR'></option>
                                            <option value='Nanum Pen Script'></option>
                                        </datalist>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class='shuttingstar_configcontrols'>
                        <button type='button' class='btn btn_config_accept target_translate'>Accept</button>
                        
                        <button type='button' class='btn red btn_config_resetall target_translate' style='margin-left: 30px;'>Reset All</button>
                        <button type='button' class='btn red btn_config_deleteaccount ss_only_for_login_user target_translate'>DELETE ACCOUNT</button>
                    </div>
                </div>
                <div class='shuttingstar_songssections tabarea'>
                    <h1 class='target_translate'>Custom Songs</h1>
                    <textarea class='full ta_json_song'></textarea>
                    <div class='shuttingstar_songcontrols'>
                        <button type='button' class='btn btn_song_accept target_translate'>Save</button>
                        <a href='./create/create.html' target='_blank' style='margin-left: 20px; text-decoration: none;'>Song Creation Mode (TEST)</a>
                    </div>
                </div>
                <div class='shuttingstar_packagessections tabarea'>
                    <h1 class='target_translate'>Packages</h1>
                    <textarea class='full ta_packages'># Caution ! Lines start with '#' will be ignored.
# Add package URLs here. Enter one URL per line.
</textarea>
                    <div class='shuttingstar_packagescontrols'>
                        <button type='button' class='btn btn_packages_accept target_translate'>Save</button>
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
                        
                    </div>
                </div>
            </div>
        `;

        // 상세설정 영역 HTML 및 기타 css 적용
        this.configDiv.innerHTML = html;
        this.configDiv.style.zIndex = this.mainZindex + 16;
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
            if(itemOne.classList.contains('target_translated')) return;
            itemOne.innerHTML = selfs.trans(itemOne.innerHTML);
            itemOne.classList.add('target_translated');
        });

        // 레이어 영역 (안쪽)
        const layer = this.configDiv.querySelector('.shuttingstar_configlayer');
        layer.style.zIndex = this.mainZindex + 15;
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
        const btnReset   = controlDiv.querySelector('.btn_config_resetall');
        const btnDelAcc  = controlDiv.querySelector('.btn_config_deleteaccount');
        const btnTabExit = layer.querySelector('.shuttingstar_config_tabbuttons .btn_exit');

        const fCancel = function() {
            selfs.loadSettings();
            selfs.closeConfigDiv();
            selfs.setState(selfs.beforeSettingState);
        };
        
        btnAccept.addEventListener('click', () => {
            // 설정값들을 객체에 적용
            selfs.keypressTiming      = parseInt(String( layer.querySelector('.inp_keypressdelay').value ).trim());
            selfs.songTiming          = parseInt(String( layer.querySelector('.inp_sounddelay').value ).trim());
            selfs.noteSpeedMultiplier = parseInt(String( layer.querySelector('.inp_notespeedrate').value ).trim());
            selfs.judgeTiming         = parseInt(String( layer.querySelector('.inp_judgetiming').value ).trim());

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

            // Worker
            selfs.usingWorkerConfig = (layer.querySelector('.sel_worker ').value == 'Y');

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

            // 폰트
            this.mainFont = layer.querySelector('.inp_mainfont').value;
            this.mainFont = ShuttingStarsUtility.replaceString(this.mainFont, "'", "");
            this.mainFont = ShuttingStarsUtility.replaceString(this.mainFont, '"', '');
            this.mainFont = ShuttingStarsUtility.replaceString(this.mainFont, ',', '');

            // 설정 저장
            selfs.saveSettings(false).then(() => {
                selfs.closeConfigDiv();
                selfs.setState('menu');
            });
        });

        btnTabExit.addEventListener('click', fCancel);

        btnReset.addEventListener('click', () => {
            if(confirm(selfs.trans('Do you want to reset all?'))) selfs.resetAll(); // this.confirm 쓰면 안 됨. DOM 영역에 뜨는 버튼들이라...
        });

        if(this.backend == null) btnDelAcc.classList.add('invisible');
        else                     btnDelAcc.classList.remove('invisible');
        btnDelAcc.addEventListener('click', () => {
            if(selfs.backend == null) return;
            if(confirm( selfs.trans('Do you want to delete your all informations on this game?') )) { // this.confirm 쓰면 안 됨. DOM 영역에 뜨는 버튼들이라...
                selfs.backend.deleteAllMyData().then(() => { alert('COMPLETE !'); selfs.resetAll(); }).catch((e) => { console.error(e); ShuttingStarsUtility.toast('ERROR : ' + e); });
            }
        });

        // 버튼 이벤트 (곡)
        let ta = this.configDiv.querySelector('.ta_json_song');
        const control2Div = this.configDiv.querySelector('.shuttingstar_songcontrols');
        const btnSave     = control2Div.querySelector('.btn_song_accept');

        btnSave.addEventListener('click', () => {
            let json = String(ta.value).trim();
            try {
                // json = ShuttingStarsUtility.removeLinesStartKey(json, '#');
                json = ShuttingStarsUtility.parseJSON(json);
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

        // 버튼 이벤트 (패키지)
        let ta2 = this.configDiv.querySelector('.ta_packages');
        const control3Div = this.configDiv.querySelector('.shuttingstar_packagessections');
        const btnSave3    = control3Div.querySelector('.btn_packages_accept');

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

        // 버튼 이벤트 (도구)
        const control4Div = this.configDiv.querySelector('.shuttingstar_toolssections');

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
                BpmDetector.detect(inpUrl.value).then((bpm) => {
                    inpResult.value = bpm;
                }).catch((e) => { ShuttingStarsUtility.toast("Error : " + e); });
            } else {
                BpmDetector.detect2(inpUrl.value).then((bpm) => {
                    inpResult.value = bpm;
                }).catch((e) => { ShuttingStarsUtility.toast("Error : " + e); });
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

        inp = this.configDiv.querySelector('.inp_judgetiming');
        inp.value = (this.judgeTiming);

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

        // Worker
        sel = this.configDiv.querySelector('.sel_worker ');
        if(window.location.href.indexOf('https:') != 0) {
            this.usingWorkerConfig = false;
            const yOpt = sel.querySelector("option[value='Y']");
            yOpt.disabled = true;
            yOpt.innerHTML += ' (Only for HTTPS)'
        }
        if(this.usingWorkerConfig) sel.value = 'Y'
        else sel.value = 'N';

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

        // 폰트 설정
        inp = this.configDiv.querySelector('.inp_mainfont');
        if(this.mainFont) inp.value = this.mainFont;
        else inp.value = this.fontFamily;

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
        this.configDiv.querySelector('.inp_notespeedrate').focus();
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
        if(this.language == 'ko') return String(`
// 주의 ! '//'로 시작하는 줄은 무시됩니다.
//
// 커스텀 곡 추가 방법
//    JSON 객체 하나로 곡 하나를 정의합니다.
//        name           : (string) 곡의 이름
//      , composer       : (string) 곡 작곡가 이름
//      , noteWriter     : (string) 노트 채보 작성자 이름
//      , bgaUrl         : (string) 비워 두세요 (BGA 동영상 URL로 아직 미지원)
//      , musicUrl       : (string) 음악 파일 URL
//      , thumbnailUrl   : (string) 썸네일 이미지 URL (아직 미사용)
//      , description    : (string) 설명 (곡 선택 화면 우측 하단에 표시됨)
//      , loadingTime    : (integer) 추가 로딩 시간 (곡 선택 시 제목 화면에서 추가로 보내는 시간)
//      , bpm            : (integer) BPM (Bit per minutes)
//      , endTime        : (integer) 0을 지정 (미사용)
//      , timeMultiplier : (integer) 게임 속도 상수 (곱셈으로 적용, 어려운 경우 1 지정 권장)
//      , timeConstant   : (integer) 노트 타이밍 상수 (덧셈 적용, 어려운 경우 0 지정 권장)
//      , noteMultiplier : (integer) 노트 타이밍 상수 (곱셈 적용, 어려운 경우 1 지정 권장)
//      , serial         : (string) 빈 문자열 입력 (곡마다 고유한 값이어야 하며, 빈 문자열 입력 시 랜덤하게 변경됨)
//      , difficulties   : (array) 난이도 목록
//            element : (object)
//                difficultyLabel : (string) 난이도 키워드 (예: easy, normal, hard, ex1, ex2, ex3, ...)
//                difficultyLevel : (integer) 난이도 레벨 (숫자)
//                patterns : (array)
//                    element : (object)
//                        line : (integer) 라인 번호 (0~5 범위 지정, -1 지정 시 게임 내에서 랜덤 지정됨)
//                        time          : (number) 판정선 도달 시점 ( 초 단위가 아니며 곡의 16분의 N비트 값으로 지정, 소수 사용 가능 )
//                        type          : (string) 노트 유형 (normal / long 중에 선택, 기본 : normal)
//                        ends          : (number) long 타입 지정 시 필수값으로, 종료 시점 지정 ( time 과 같은 단위, time 값보다 커야 함 )
//    예시
//      [
//          {
//              "name" : "TEST SONG", "composer" : "HJOW", "noteWriter" : "HJOW", "bgaUrl" : "", "musicUrl" : "", thumbnailUrl : "", description : "", "bpm" : 120, "endTime" : 3700
//            , "timeConstant" : -100, "timeMultiplier" : 1, "serial" : ""
//            , "difficulties" : [
//                  {
//                       "difficultyLabel" : "easy"
//                       "difficultyLevel" : 1
//                       "patterns" : [
//                            {"line" : 1, time : 3}
//                          , {"line" : 0, time : 6}
//                          , {"line" : 4, time : 9}
//                          ...
//                       ]
//                  },
//                  {
//                       "difficultyLabel" : "normal"
//                       "difficultyLevel" : 4
//                       "patterns" : [
//                            {"line" : 2, time : 2}
//                          , {"line" : 1, time : 4}
//                          , {"line" : 4, time : 6}
//                          ...
//                       ]
//                  }
//              ]
//          }
//      ]
        `);
        return String(`
// Caution ! Lines start with '//' will be ignored.
//
// How to add your own custom songs
//    One song - one JSON object.
//        name           : (string) Song's name
//      , composer       : (string) Composer's name
//      , noteWriter     : (string) Note writer's name
//      , bgaUrl         : (string) Just input empty text (BGA feature is not supported yet)
//      , musicUrl       : (string) Music file URL
//      , thumbnailUrl   : (string) Thumbnail image file URL (just input empty text when not exist)
//      , description    : (string) Description.
//      , loadingTime    : (integer) Additional loading time
//      , bpm            : (integer) BPM (Bit per minutes)
//      , endTime        : (integer) Just set to 0 (Now this value is not used.)
//      , timeMultiplier : (integer) Game total speed multiplier (Just set 1)
//      , timeConstant   : (integer) Note timing correction value (+)
//      , noteMultiplier : (integer) Note timing correction value (×)
//      , serial         : (string) Just input empty text (Need only for official songs)
//      , difficulties   : (array)
//            element : (object)
//                difficultyLabel : (string) Difficulty Name (ex: easy, normal, hard, ex1, ex2, ex3, ...)
//                difficultyLevel : (integer) Difficulty Number
//                patterns : (array)
//                    element : (object)
//                        line : (integer) line (0~5, If you using -1 then random)
//                        time          : (number) occuring time ( Not seconds ! Need to test. ) float also OK
//                        type          : (string) note type (normal / long, default : normal)
//                        ends          : (number) long note's end time ( Only for long type )
//    example
//      [
//          {
//              "name" : "TEST SONG", "composer" : "HJOW", "noteWriter" : "HJOW", "bgaUrl" : "", "musicUrl" : "", thumbnailUrl : "", description : "", "bpm" : 120, "endTime" : 3700
//            , "timeConstant" : -100, "timeMultiplier" : 1, "serial" : ""
//            , "difficulties" : [
//                  {
//                       "difficultyLabel" : "easy"
//                       "difficultyLevel" : 1
//                       "patterns" : [
//                            {"line" : 1, time : 3}
//                          , {"line" : 0, time : 6}
//                          , {"line" : 4, time : 9}
//                          ...
//                       ]
//                  },
//                  {
//                       "difficultyLabel" : "normal"
//                       "difficultyLevel" : 4
//                       "patterns" : [
//                            {"line" : 2, time : 2}
//                          , {"line" : 1, time : 4}
//                          , {"line" : 4, time : 6}
//                          ...
//                       ]
//                  }
//              ]
//          }
//      ]
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
            if(this.stringTableDebugMode) ShuttingStarsUtility.log('[NOLANG] ' + english);
            return english;
        }

        return translated;
    }

    /**
     * StringTable 수정 (겹치는 내용 덮어쓰기 방식)
     * 
     * @param {object} newStringTable - 새로운 StringTable 객체 (JSON Plain Object)
     */
    updateStringTable(newStringTable) {
        if(this.stringTable == null) this.stringTable = {};
        if(newStringTable == null) return;
        for(let key1 in newStringTable) {
            if(typeof(this.stringTable[key1]) == 'undefined') this.stringTable[key1] = {};
            const currentLanguageTable = this.stringTable[key1];
            const newLanguageTable = newStringTable[key1];
            for(let key2 in newLanguageTable) {
                currentLanguageTable[key2] = newLanguageTable[key2];
            }
        }
    }

    /**
     * render 메소드 내에서 사용되는 font 값 중 글꼴 파트 반환, pointFont 는 강조하고 싶을 때 true 를 입력 (선택사항)
     * @param {boolean} pointFont pointFont 값
     * @returns {string} 처리 결과
     */
    getRenderFontFamily(pointFont) {
        let alters = '';
        let added = false;
        for(let idx=0; idx<this.alterFonts.length; idx++) {
            const fontOne = this.alterFonts[idx].trim();

            if(pointFont) {
                if(this.pointFont == fontOne) continue;
            } else {
                if(this.mainFont) {
                    if(this.mainFont == fontOne) continue;
                } else {
                    if(this.fontFamily == fontOne) continue;
                }
            }

            if(added) alters += ', ';

            if(fontOne == 'monospace' || fontOne == 'sans-serif' || fontOne == 'serif') alters += fontOne; // CSS 기본 폰트 그룹 - 따옴표 미사용
            else alters += "'" + fontOne + "'";

            added = true;
        }

        if(pointFont)          return "'" + this.pointFont  + "'" + (alters == '' ? '' : ', ' + alters);
        else if(this.mainFont) return "'" + this.mainFont   + "'" + (alters == '' ? '' : ', ' + alters);
        return                        "'" + this.fontFamily + "'" + (alters == '' ? '' : ', ' + alters);
    }

    /**
     * 판정 마크 출력에 쓰일 글꼴 파트 반환
     * @returns {string} 처리 결과
     */
    getJudgeFontFamily() {
        let alters = '';
        let added = false;
        for(let idx=0; idx<this.alterFonts.length; idx++) {
            const fontOne = this.alterFonts[idx].trim();

            if(added) alters += ', ';

            if(fontOne == 'monospace' || fontOne == 'sans-serif' || fontOne == 'serif') alters += fontOne; // CSS 기본 폰트 그룹 - 따옴표 미사용
            else alters += "'" + fontOne + "'";

            added = true;
        }
        return "'" + this.judgeFont + "'" + (alters == '' ? '' : ', ' + alters);
    }

    /**
     * 버전 정보 등 출력에 쓰일 OCR 스타일 글꼴 파트 반환
     * @returns {string} 처리 결과
     */
    getOcrFontFamily() {
        let alters = '';
        let added = false;
        for(let idx=0; idx<this.alterFonts.length; idx++) {
            const fontOne = this.alterFonts[idx].trim();

            if(added) alters += ', ';

            if(fontOne == 'monospace' || fontOne == 'sans-serif' || fontOne == 'serif') alters += fontOne; // CSS 기본 폰트 그룹 - 따옴표 미사용
            else alters += "'" + fontOne + "'";

            added = true;
        }
        return "'" + this.ocrFont + "'" + (alters == '' ? '' : ', ' + alters);
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
     *    예약어 [CTX], [RSSC] 지원
     *    [CTX] : URL 컨텍스트 경로
     *    [RSSC] : URL 컨텍스트 경로 내 리소스 경로
     * @param {string} url url 값
     * @returns {string} URL 컨텍스트가 적용된 URL
     */
    convertURL(url) {
        url = String(url).trim();
        if(url.indexOf('http://') == 0 || url.indexOf('https://') == 0) return url;
        if(url.indexOf('[RSSC]') == 0) url = ShuttingStarsUtility.replaceString(url, '[RSSC]', '[CTX]' + this.rsscDirName + '/');
        if(url.indexOf('[CTX]') == 0) url = ShuttingStarsUtility.replaceString(url, '[CTX]', this.urlCtx);
        if(url.indexOf('.//') == 0) url = './' + url.substring(3);
        if(url.indexOf('.') == 0) return url;

        if(this.urlCtx.indexOf('/') != this.urlCtx.length - 1) this.urlCtx += '/';
        if(url.indexOf('//') == 0) url = url.substring(1);
        if(url.indexOf('/') == 0) return this.urlCtx + url.substring(1);

        return url;
    }

    /**
     * audio 객체를 통해 게임 내 진행시간 계산
     * 
     * @param {*} audioObject : audio 또는 video 객체, 또는 Youtube Player 객체
     * @param {number} bpm         : 해당 곡이 BPM
     * @param {number} songTiming  : 타이밍 시간값
     * @returns 현재 진행 시간 값
     */
    convertElapsedTime(audioObject, bpm, songTiming) {
        let crTime = 0;
        if(typeof(audioObject.getCurrentTime) == 'function') crTime = audioObject.getCurrentTime();
        else crTime = audioObject.currentTime;
        return (crTime * (bpm / 60.0) * (this.timeMultiplier * this.elapsedTimeMultiplier)) - this.songTiming;
    }

    /**
     * audio 객체의 종료 시점의 elapsedTime 계산 (audio 객체가 로딩 끝나있어야 사용 가능)
     * 
     * 
     * @param {*} audioObject 
     * @param {*} bpm 
     * @returns 종료 시간 (게임 내 진행시간 값)
     */
    calculateSongDuration(audioObject, bpm) {
        const durationSecond = audioObject.duration;
        return (durationSecond * (bpm / 60.0) * (this.timeMultiplier * this.elapsedTimeMultiplier));
    }

    /**
     * 노트 관련 위치값 계산
     * 
     * @param {number} noteTiming 
     * @param {number} notePlacerYLoc 
     * @param {ShuttingStarsSong} song 
     * @returns {number} 계산 결과
     */
    calculateNoteY(noteTiming, notePlacerYLoc, song) {
        // 노트의 실질 위치 계산
        let calculates = notePlacerYLoc; // 일단 SSNotePlacer 위치부터 시작
        let additionals;

        // NotePlacer에 도달하기까지 남은 시간 만큼 멀리 지정 (이미 시간이 지난 경우 음수가 나올 수 있음)
        additionals  = ( (noteTiming * song.noteMultiplier) + song.timeConstant - this.elapsedTime ) + this.noteLocationConst;
        additionals  = additionals * this.getNoteRadius() * this.noteSpeedMultiplier * this.noteSpeedFixedConst * song.timeMultiplier;
        calculates  += additionals;

        return calculates;
    }

    /**
     * 노트 현재 위치 계산
     * 
     * @param {SSNote} note 
     * @param {number} notePlacerYLoc 
     * @param {ShuttingStarsSong} song 
     * @returns {number} 노트의 현재 Y 좌표
     */
    calculateNoteCurrentLocation(note, notePlacerYLoc, song) {
        if(! (note instanceof SSNote)) throw 'Cannot calculate note location. Not SSNote instance.';
        return this.calculateNoteY(note.originalTiming, notePlacerYLoc, song);
    }

    /**
     * 타이틀 화면 내 로딩 화면 중 처리 작업
     */
    loadAfter() {
        const selfs = this;
        return new Promise((resolve, reject) => {
            if(selfs.refreshOnFirstSession()) { resolve(false); return; }

            selfs.setStarlights();
            selfs.loadPlugins().then(() => {
                selfs.loadPackages().then(() => {
                    setTimeout(() => {
                        resolve(true);
                    }, 300);
                }).catch((e1) => { reject(e1) });
            }).catch((e2) => { reject(e2); });
        });
    }

    /**
     * 첫 세션 (이제 막 브라우저 띄웠는지) 여부 체크하여, 첫 세션이 맞으면 화면 새로고침 호출 후 true 반환
     * @returns {boolean} 첫 세션이면 true (반환되고, 화면 새로고침 호출됨), 그외 false
     */
    refreshOnFirstSession() {
        const selfs = this;
        const mark = sessionStorage.getItem('ss_firsts');
        if(mark == null || typeof(mark) == 'undefined' || mark == '') {
            sessionStorage.setItem('ss_firsts', 'Y');
            setTimeout(() => { selfs.fGameEvent({ "event" : 'refreshpage', "broker" : selfs.broker }); if(selfs.fRefresh) selfs.fRefresh(); }, 2000);
            return true;
        }
        return false;
    }

    /**
     * 노트들의 Y 좌표를 갱신
     */
    refreshNoteYLocations() {
        let notePlacer;
        if((this.state == 'playing' || this.state == 'listenplaying') && this.elapsedTime >= -100 && this.playPrepared && this.song != null) {
            for(let idx=0; idx<this.objectsPlaying.length; idx++) {
                const obj = this.objectsPlaying[idx];
                if((obj instanceof SSNote) || (obj instanceof SSLongNote)) {
                    // 폭발 중이거나 제거 처리된 노트는 제외
                    if(obj.removed || obj.explosing >= 1) continue;

                    // 노트에 해당하는 SSNotePlacer 찾기
                    notePlacer = this.getNotePlacer(obj.line);
                    if(notePlacer == null) continue;

                    // 이전 위치 기록
                    if(obj.tail) {
                        obj.beforeLocations.push({x : obj.x, y : obj.y});
                        if(obj.beforeLocations.length > obj.beforeLocationCountMax) obj.beforeLocations.splice(0, 1);
                    }
                }

                // 위치 적용
                if(obj instanceof SSNote) {
                    obj.y = this.calculateNoteCurrentLocation(obj, notePlacer.y, this.song);
                } else if(obj instanceof SSLongNote) {
                    obj.y    = this.calculateNoteY(obj.handlingEndTiming, notePlacer.y, this.song);
                    obj.yEnd = this.calculateNoteY(obj.originalEndTiming, notePlacer.y, this.song);
                    if(obj.handling) {
                        obj.y = notePlacer.y;
                    }
                }
            }
        }
    }

    /**
     * 장식용 별빛 세팅
     */
    setStarlights() {
        let idx;
        // 기존 별빛 제거
        for(idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if(obj instanceof SSStarlight) { this.objects.splice(idx, 1); idx--;}
        }

        // 별빛 추가
        this.backStarlightSpdX = 1;
        this.backStarlightSpdY = ShuttingStarsUtility.random();
        for(idx=0; idx<this.backStarlightCount; idx++) {
            const obj = new SSStarlight(this);
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
            if(obj instanceof SSStarlight) { count++; }
        }

        if(this.song != null) { // 곡이 선택된 상태로
            if(! this.song.autoStars) return; // 곡에서 별빛 안쓰기로 했다면 중단
        }

        // 갯수 맞춰 생성
        while(count < this.backStarlightCount) {
            // Starlight 생성 파츠
            newOne = new SSStarlight(this);

            const renderWidth = this.getFullRenderWidth();
            const renderHeight = this.getFullRenderHeight();
            const randomEdgePosition = ShuttingStarsUtility.random() * (renderWidth + renderHeight);
            if(randomEdgePosition < renderHeight) {
                newOne.x = 0;
                newOne.y = randomEdgePosition;
            } else {
                newOne.x = randomEdgePosition - renderHeight;
                newOne.y = 0;
            }

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
        for(let idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if(obj instanceof SSStarlight) {
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
                let responses = null;
                if(lineOne.indexOf('[CTX]') == 0 || lineOne.indexOf('[RSSC]') == 0) {
                    responses = await fetch(lineOne);
                    responses = await responses.text();
                } else {
                    // CORS 문제 방지를 위해 JSONP로 호출 (JSONP 콜백함수명은 URL 매개변수 callback 에 탑재됨)
                    const respJson = await ShuttingStarsUtility.jsonp(lineOne, 16000);
                    responses = respJson.response;
                }

                if(responses == null) continue;

                let json = null;
                if(typeof(responses) == 'string') json = ShuttingStarsUtility.parseJSON(responses);
                else if(typeof(responses) == 'object') json = responses;
                if(json == null) continue;

                if(typeof(json.name) != 'string') continue;
                ShuttingStarsUtility.log('Package ' + json.name + ' applied.');

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
     * 유튜브 플레이어 세팅 (참고 : https://developers.google.com/youtube/iframe_api_reference?hl=ko)
     * @param {string} videoId 
     */
    setYouTubeIframe(videoId) {
        const selfs = this;
        if(typeof(YT) == 'undefined') {
            this.alert(this.trans('YouTube API is not loaded. Please check your network connection.'));
            this.setState('menu');
            return;
        }

        if(this.youtubePlayer != null) {
            this.youtubePlayer.destroy();
            this.youtubePlayer = null;
        }

        const youtubeDivId = 'ss_youtube_div_' + ShuttingStarsUtility.randomString(8);
        this.youtubeDiv.innerHTML = "<div id='" + youtubeDivId + "'></div>";
        this.youtubeDiv.style.margin = '0';
        this.youtubeDiv.style.padding = '0';
        this.youtubeDiv.style.overflow = 'hidden';

        let canvasBounding = this.canvas.getBoundingClientRect();
        this.youtubePlayerReady = false;
        this.youtubePlayerEnded = false;
        this.youtubePlayer = new YT.Player(youtubeDivId, {
            videoId : videoId,
            width   : canvasBounding.width,
            height  : canvasBounding.height,
            playerVars : {
                autoplay : 0,
                controls : 0
            },
            events : {
                onReady : (e) => {
                    selfs.youtubePlayerReady = true;

                    const iframes = selfs.youtubePlayer.getIframe();
                    canvasBounding = selfs.canvas.getBoundingClientRect();
                    iframes.style.position = 'fixed';
                    iframes.style.left = canvasBounding.left + 'px';
                    iframes.style.top  = canvasBounding.top + 'px';
                    iframes.style.width  = canvasBounding.width + 'px';
                    iframes.style.height = canvasBounding.height + 'px';
                    iframes.style.zIndex = selfs.mainZindex + 11;
                }, onStateChange : (e) => {
                    if(e.data == YT.PlayerState.ENDED) {
                        selfs.youtubePlayerEnded = true;
                    }
                }, onError : (e) => {
                    const errCode = e.data;
                    ShuttingStarsUtility.toast(selfs.trans('Cannot play this youtube video.') + ' Error code : ' + errCode);
                    this.setState('menu');
                }
            }
        });
    }

    /**
     * 자동 노트 생성 (Promise)
     * @param {string} audioUrl 
     * @param {number} bpm
     * @param {number} difficultyLevel
     * @param {Function} eventProgress 진행률을 매개변수로 받을 수 있는 콜백 함수 (선택사항, 매개변수 1에 진행률 % 로 입력됨)
     * @return {Promise<Array<SSNoteCommon>>}
     */
    async createAutoNotes(audioUrl, bpm, difficultyLevel, eventProgress) {
        let exceptionOccured = null;
        let idx, jdx;

        let audioCtx = null;
        let audioCtxPre = null;
        let audioBufferSource = null;
        const noteCreates = [];
        
        let notePlacerPlaced = true; // NotePlacer 배치해야 아래 로직이 동작함. 배치 안되어 있으면 임시 배치
        if(this.notePlacers.length <= 0) {
            notePlacerPlaced = false;
            for(idx=0; idx<this.keyList.length; idx++) {
                const notePlacer = new SSNotePlacer(idx, this);
                notePlacer.id = this.lastObjectId++;
                this.notePlacers.push(notePlacer);
            }
        }

        try {
            // 사전에 사운드를 먼저 읽어 주파수를 분석하여 노트들을 생성 - 시작 TODO
            audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
            let audioPre     = await fetch(audioUrl);
            let audioPreBuff = await audioPre.arrayBuffer();
            let audioDecBuff = await audioCtx.decodeAudioData(audioPreBuff);
            let channelBuff;

            audioPre = null; audioPreBuff = null;
            audioCtx.close(); audioCtx = null;

            const sampleRate = audioDecBuff.sampleRate;
            const duration   = audioDecBuff.duration;
            const windowSize = 1024;
            const intervals = 60 / (bpm * this.timeMultiplier);
            const energies = [];
            let   lastEnergy = 0;

            let avg4    = 0;
            let avg8    = 0;
            let avg16   = 0;
            let avg32   = 0;
            let avg64   = 0;
            let avg256  = 0;
            let avg1024 = 0;
            let divides = 0;
            let avgLen  = 0;
            let avgCnt  = 0;

            let noteNestedCombo = 0;
            let multipleCombo = 0;
            let lastNote = null;
            let lastLines = [];

            const minTimeCycle = (this.stageRows * (this.timeMultiplier / 8));
            
            //     OfflineAudioContext 준비
            audioCtxPre = new OfflineAudioContext( audioDecBuff.numberOfChannels, audioDecBuff.length, sampleRate );
            audioBufferSource = audioCtxPre.createBufferSource();
            audioBufferSource.buffer = audioDecBuff;
            audioBufferSource.connect(audioCtxPre.destination);
            audioBufferSource.start();

            audioDecBuff = await audioCtxPre.startRendering();
            channelBuff  = audioDecBuff.getChannelData(0);

            //     분석 및 노트 생성 진행
            let timeCycle = 0;
            let maxTime = audioDecBuff.duration;
            let maxTimeCycle = maxTime * (bpm / 60.0) * this.timeMultiplier;
            for(let time=0; time<maxTime; time += intervals) {
                const center = Math.floor(time * sampleRate);
                const starts = Math.max(0, center - Math.floor(windowSize / 2));

                // 에너지 값 계산
                let energy = 0;
                for (let i = 0; i < windowSize && starts + i < channelBuff.length; i++) {
                    const v = channelBuff[starts + i];
                    energy += v * v;
                }
                energy = Math.sqrt(energy / windowSize);

                energies.push(energy); // 변화 추이 기록을 위해 배열에 넣기
                if(energies.length >= 1024) energies.splice(0, 1); // 전체를 기록할 필요는 없으므로, 적당히 남기고 맨앞 원소 제거

                // 최근 energy 데이터의 평균 구하기
                avg4    = 0;
                avg8    = 0;
                avg16   = 0;
                avg32   = 0;
                avg64   = 0;
                avg256  = 0;
                avg1024 = 0;
                divides = 0;
                avgCnt  = 0;
                avgLen  = energies.length;
                
                for(jdx=avgLen-1; jdx>=0; jdx--) {
                    if(avgCnt <    4) avg4    += energies[jdx];
                    if(avgCnt <    8) avg8    += energies[jdx];
                    if(avgCnt <   16) avg16   += energies[jdx];
                    if(avgCnt <   32) avg32   += energies[jdx];
                    if(avgCnt <   64) avg64   += energies[jdx]; 
                    if(avgCnt <  256) avg256  += energies[jdx]; 
                    if(avgCnt < 1024) avg1024 += energies[jdx];
                    avgCnt++;
                }

                divides = (avgLen <    4 ? avgLen :    8); avg4    = avg4    * 1.0 / divides;
                divides = (avgLen <    8 ? avgLen :    8); avg8    = avg8    * 1.0 / divides;
                divides = (avgLen <   16 ? avgLen :   16); avg16   = avg16   * 1.0 / divides;
                divides = (avgLen <   32 ? avgLen :   32); avg32   = avg32   * 1.0 / divides;
                divides = (avgLen <   64 ? avgLen :   64); avg64   = avg64   * 1.0 / divides;
                divides = (avgLen <  256 ? avgLen :  256); avg256  = avg256  * 1.0 / divides;
                divides = (avgLen < 1024 ? avgLen : 1024); avg1024 = avg1024 * 1.0 / divides;
                
                if(timeCycle >= minTimeCycle && energy > (lastEnergy * 1.2)) {
                    // 노트 생성여부 결정
                    let createYn = false;
                    let longNote = false;
                    let multipleCreate = 1;

                    if(lastNote == null) {
                        createYn = true; // 이전 노트가 없으면 무조건 생성
                    } else {
                        // 난이도에 따라 생성여부 결정
                        const timeGap = timeCycle - lastNote.originalTiming;
                        let properGap = 1; // 다음 노트 등장 사이 시간 허용값
                        let probability1 = 0.25;  // 노트 생성 확률
                        let probability2 = 0.01;  // 동시노트 적용 확률
                        let probability3 = 1;     // 동시노트 추가 확률
                        let probability4 = 0.001; // 롱노트 출연 확률

                        if(difficultyLevel <= 2) {
                            properGap = 64;
                        } else if(difficultyLevel <= 4) {
                            properGap = 32;
                        } else if(difficultyLevel <= 6) {
                            properGap = 16;
                        } else if(difficultyLevel <= 8) {
                            properGap = 8;
                        } else if(difficultyLevel <= 10) {
                            properGap = 4;
                        } else if(difficultyLevel <= 12) {
                            properGap = 2;
                        } else {
                            properGap = 1;

                            let leftLevel = Math.floor((difficultyLevel - 13) / 2.0);
                            if(leftLevel < 0) leftLevel = 0;
                            for(let llx=0; llx<leftLevel; llx++) {
                                properGap = properGap * 0.5;
                            }
                        }

                        if(difficultyLevel % 2 == 0) probability3 = 1.25;

                        // bpm 보정
                        if(bpm <= 45) {
                            properGap = properGap * 0.25;
                        } else if(bpm <= 90) {
                            properGap = properGap * 0.5;
                        } else if(bpm <= 180) {
                            // DO NOTHING
                        } else if(bpm <= 240) {
                            properGap = properGap * 2;
                        } else if(bpm <= 360) {
                            properGap = properGap * 3;
                        } else {
                            properGap = properGap * 4;
                        }

                        if(timeGap >= properGap) {
                            if(timeGap > properGap) {
                                noteNestedCombo = 0;
                                createYn = true;
                            } else {
                                let properNestedCombo = 99999; // 허용 연타 횟수
                                if(difficultyLevel ==  3) properNestedCombo = 4;
                                if(difficultyLevel ==  7) properNestedCombo = 16;
                                if(difficultyLevel ==  9) properNestedCombo = 32;
                                if(difficultyLevel == 11) properNestedCombo = 64;

                                if(noteNestedCombo + 1 <= properNestedCombo) {
                                    noteNestedCombo++;
                                    createYn = true;
                                }
                            }
                        }

                        // 노트 생성 최소조건 만족 - 이제 확률 적용 차례
                        if(createYn) {
                            createYn = false;
                            longNote = false;
                            probability1 = 0.25;
                            probability2 = 0.01;
                            probability3 = 1;   
                            probability4 = 0.001;
                            multipleCreate = 1;

                            // 난이도별 확률 계산
                            if(difficultyLevel <= 1) {
                                if(energy >=    avg4) { probability1 = 0.001; }
                                if(energy >=    avg8) { probability1 = 0.01;  }
                                if(energy >=   avg16) { probability1 = 0.75;  }
                                if(energy >=   avg32) { probability1 = 0.8;  probability2 = 0.01; probability4 = 0.00005;  }
                                if(energy >=   avg64) { probability1 = 0.9;  probability2 = 0.02; probability4 = 0.0001; }
                                if(energy >=  avg256) { probability1 = 0.95; probability2 = 0.05; probability4 = 0.0002;   }
                                if(energy >= avg1024) { probability1 = 0.99; probability2 = 0.1;  probability4 = 0.0005;   }
                            } else if(difficultyLevel <= 4) {
                                if(energy >=    avg4) { probability1 = 0.01;  }
                                if(energy >=    avg8) { probability1 = 0.05;  }
                                if(energy >=   avg16) { probability1 = 0.77;  probability2 = 0.001; }
                                if(energy >=   avg32) { probability1 = 0.82;  probability2 = 0.02;  probability4 = 0.0001;  }
                                if(energy >=   avg64) { probability1 = 0.9;   probability2 = 0.05;  probability4 = 0.00025;  }
                                if(energy >=  avg256) { probability1 = 0.95;  probability2 = 0.075; probability4 = 0.0005;   }
                                if(energy >= avg1024) { probability1 = 0.99;  probability2 = 0.15;  probability4 = 0.001;     }
                            } else if(difficultyLevel <= 6) {
                                if(energy >=    avg4) { probability1 = 0.05; }
                                if(energy >=    avg8) { probability1 = 0.25; }
                                if(energy >=   avg16) { probability1 = 0.8;   probability2 = 0.002; }
                                if(energy >=   avg32) { probability1 = 0.85;  probability2 = 0.05; probability4 = 0.0002; }
                                if(energy >=   avg64) { probability1 = 0.9;   probability2 = 0.1;  probability4 = 0.0005; }
                                if(energy >=  avg256) { probability1 = 0.95;  probability2 = 0.2;  probability4 = 0.009;  }
                                if(energy >= avg1024) { probability1 = 0.99;  probability2 = 0.3;  probability4 = 0.05;   }
                            } else if(difficultyLevel <= 8) {
                                if(energy >=    avg4) { probability1 = 0.1;  }
                                if(energy >=    avg8) { probability1 = 0.5;    probability2 = 0.001;  }
                                if(energy >=   avg16) { probability1 = 0.9;    probability2 = 0.005;  }
                                if(energy >=   avg32) { probability1 = 0.925;  probability2 = 0.1;  probability4 = 0.0003; }
                                if(energy >=   avg64) { probability1 = 0.95;   probability2 = 0.15; probability4 = 0.0005; }
                                if(energy >=  avg256) { probability1 = 0.975;  probability2 = 0.3;  probability4 = 0.015;  }
                                if(energy >= avg1024) { probability1 = 0.99;   probability2 = 0.75; probability4 = 0.1;    }
                            } else {
                                if(energy >=  avg4) { 
                                    probability1 = 0.1;
                                    if(difficultyLevel > 9) {
                                        probability2 = 0.1 + ( (difficultyLevel - 9) * 0.001 );
                                        if(probability2 > 0.25) probability2 = 0.25;
                                    }
                                }
                                if(energy >= avg8) {
                                    probability1 = 0.75;
                                    probability2 = 0.002;
                                    if(difficultyLevel > 9) {
                                        probability2 = 0.1 + ( (difficultyLevel - 9) * 0.005 );
                                        if(probability2 > 0.5) probability2 = 0.5;
                                    }
                                }
                                if(energy >= avg16) { 
                                    probability1 = 0.95; 
                                    probability2 = 0.025;
                                    if(difficultyLevel > 9) {
                                        probability2 = 0.1 + ( (difficultyLevel - 9) * 0.025 );
                                        if(probability2 > 0.75) probability2 = 0.75;
                                    }
                                }
                                if(energy >= avg32) { 
                                    probability1 = 0.98; 
                                    probability2 = 0.25;
                                    probability4 = 0.005;
                                    if(difficultyLevel > 9) {
                                        probability2 = 0.25 + ( (difficultyLevel - 9) * 0.05 );
                                        if(probability2 > 0.9) probability2 = 0.9;
                                    }
                                }
                                if(energy >=  avg256) { probability1 =  0.99;  probability2 =  0.99; probability4 = 0.01; }
                                if(energy >= avg1024) { probability1 = 0.999;  probability2 = 0.999; probability4 = 0.15;  }
                            }

                            // 초반, 후반 부분은 빈도 낮춤
                            if(timeCycle < minTimeCycle / 2) { probability1 = 0; probability2 = 0; }
                            if(timeCycle < minTimeCycle * 1) { probability1 = probability1 * 0.5; probability2 = probability2 * 0.5; }
                            if(timeCycle < minTimeCycle * 2) { probability1 = probability1 * 0.5; probability2 = probability2 * 0.5; }
                            if(timeCycle < minTimeCycle * 3) { probability1 = probability1 * 0.5; probability2 = probability2 * 0.5; }
                            if(timeCycle > maxTimeCycle - (minTimeCycle * 3)) { probability1 = probability1 * 0.5; probability2 = probability2 * 0.5; }
                            if(timeCycle > maxTimeCycle - (minTimeCycle * 2)) { probability1 = probability1 * 0.5; probability2 = probability2 * 0.5; }
                            if(timeCycle > maxTimeCycle - (minTimeCycle    )) { probability1 = probability1 * 0.5; probability2 = probability2 * 0.5; }
                            if(timeCycle > maxTimeCycle - (minTimeCycle / 2)) { probability1 = 0; probability2 = 0; }
                            
                            // bpm 보정
                            let ratioBpm = 1;
                            if(bpm <= 90) {
                                ratioBpm = 3 - (bpm * 2.0 / 90);
                            } else if(bpm <= 180) {
                                ratioBpm = 3 - (bpm * 2.0 / 180);
                            } else if(bpm <= 240) {
                                ratioBpm = 3 - (bpm * 2.0 / 240);
                            } else if(bpm <= 360) {
                                ratioBpm = 3 - (bpm * 2.0 / 360);
                            }
                            if(ratioBpm >= 1.25) ratioBpm = 1.25;
                            if(ratioBpm <  0.85) ratioBpm = 0.85;

                            // probability3 적용
                            probability2 = 1 - Math.pow(1 - probability2, probability3); // 확률의 곱셈 계산 (예를 들면 0.5 의 2배는 1 이 아닌 0.75 가 되어야 함)

                            // probability1, probability2 범위 유효성 검사
                            if(probability1 < 0) probability1 = 0;
                            if(probability1 > 1) probability1 = 1;
                            if(probability2 < 0) probability2 = 0;
                            if(probability2 > 1) probability2 = 1;

                            probability1 = 1 - Math.pow(1 - probability1, ratioBpm); // 확률의 곱셈 계산 (예를 들면 0.5 의 2배는 1 이 아닌 0.75 가 되어야 함)
                            probability2 = 1 - Math.pow(1 - probability2, ratioBpm);

                            // 확률 적용
                            if(ShuttingStarsUtility.random() <= probability1) createYn = true;
                            if(ShuttingStarsUtility.random() <= probability2) {
                                // 동시키 입력 콤보 계산
                                if(multipleCombo == 0) {
                                    multipleCreate++;
                                } else {
                                    for(let mc=0; mc<multipleCombo; mc++) {
                                        probability2 = probability2 * 0.5;
                                    }
                                    if(ShuttingStarsUtility.random() <= probability2) multipleCreate++;
                                }

                                // 추가 동시 키 적용
                                if(difficultyLevel >= 8) {
                                    let multiplyVal = 0.1 + (0.01 * (difficultyLevel - 8));
                                    if(multiplyVal > 0.75) multiplyVal = 0.75;

                                    probability2 = probability2 * multiplyVal;
                                    if(ShuttingStarsUtility.random() <= probability2) multipleCreate++;
                                }

                                // 적용
                                if(multipleCreate >= 2) multipleCombo++;
                                else                    multipleCombo = 0;
                            }

                            // 동시노트가 많으면 롱노트 확률 낮춤
                            if(multipleCreate >= 2) probability4 = probability4 * 0.25;
                            if(multipleCreate >= 3) probability4 = probability4 * 0.25;
                            if(multipleCreate >= 4) probability4 = probability4 * 0.5;
                            if(multipleCreate >= 5) probability4 = probability4 * 0.5;
                            if(multipleCreate >= 6) probability4 = probability4 * 0.5;

                            // 롱노트 확률 적용
                            if(this.noLongNote) longNote = false;
                            else                longNote = ( ShuttingStarsUtility.random() <= probability4 );
                        }
                    }

                    if(createYn) { // 노트 생성
                        const usedIndex = []; // 이 시간대에 이미 점유 중인 라인 번호 탑재

                        // 롱노트 중 아직 유효한 것을 찾아 usedIndex 에 등록 (그 라인에 노트 생성하지 않게)
                        for(let odx=0; odx<noteCreates.length; odx++) {
                            const noteOne = noteCreates[odx];
                            if(noteOne instanceof SSLongNote) {
                                let diffTime = Math.abs(noteOne.originalEndTiming - noteOne.originalTiming);
                                let diffTimeMultiplier = 64;
                                for(let pdx=0; pdx<difficultyLevel; pdx += 2) {
                                    diffTimeMultiplier = diffTimeMultiplier / 2.0;
                                }
                                if(diffTime <= 16) diffTime = 16;
                                if(diffTimeMultiplier <= 2) diffTimeMultiplier = 2;
                                if(noteOne.originalTiming - 4 <= timeCycle && timeCycle <= noteOne.originalTiming + (diffTime * diffTimeMultiplier)) {
                                    usedIndex.push(noteOne.line);
                                }
                            }
                        }

                        // 동시 생성 갯수에 따라 반복
                        for(let mdx=0; mdx<multipleCreate; mdx++) {

                            // 노트 생성 라인 번호 선정
                            let line = Math.floor(ShuttingStarsUtility.random() * 0.99 * this.notePlacers.length);
                            let preventInfLoop = 0;
                            if(mdx <= 1) {
                                while(usedIndex.indexOf(line) >= 0 || lastLines.indexOf(line) >= 0) {
                                    line = Math.floor(ShuttingStarsUtility.random() * 0.99 * this.notePlacers.length);
                                    preventInfLoop++;

                                    if(preventInfLoop > 100) { line = -1; lastLines = []; break; }
                                }
                            } else {
                                while(usedIndex.indexOf(line) >= 0) {
                                    line = Math.floor(ShuttingStarsUtility.random() * 0.99 * this.notePlacers.length);
                                    preventInfLoop++;

                                    if(preventInfLoop > 100) { line = -1; lastLines = []; break; }
                                }
                            }
                            
                            if(line < 0) continue;

                            // 노트 생성
                            let note;

                            if(longNote) {
                                note = new SSLongNote( line , this );
                                note.handling = false;
                            } else {
                                note = new SSNote( line , this );
                            }
                            note.id = this.lastObjectId; this.lastObjectId++;
                            note.patternId = 0;
                            if(lastNote != null) note.patternId = lastNote.patternId + 1;
                            note.originalTiming = timeCycle;

                            if(longNote) {
                                note.originalEndTiming = timeCycle + 15; // TODO : 롱노트 길이는 어떻게 선정할 건지 정해야...
                                note.handlingEndTiming = note.originalTiming;
                            }

                            noteCreates.push(note); // 노트 등록

                            // 마지막 노트 표시
                            lastNote = note;
                            usedIndex.push(line);
                        }
                        lastLines = usedIndex;
                    }
                }

                lastEnergy = energy;
                timeCycle++;

                if(typeof(eventProgress) == 'function' && timeCycle % 8 == 0) {
                    eventProgress( Math.floor((time * 100.0 / maxTime)), time, maxTime );
                }
            }
            
            //     불필요해진 객체들 정리
            audioDecBuff = null;
            channelBuff  = null;
        } catch(e) {
            exceptionOccured = e;
        }
        if(! notePlacerPlaced) {
            this.notePlacers = [];
        }

        if(exceptionOccured != null) throw exceptionOccured;
        return noteCreates;
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
        if(typeof(json) == 'string') json = ShuttingStarsUtility.parseJSON(json);

        let idx;
        let song = null;

        if(json.serial != null && typeof(json.serial) != 'undefined' && json.serial != '') {
            if(this.officialSongSerials.indexOf(json.serial) >= 0) {
                song = new OfficialSSSong();
            } else {
                song = new CustomSSSong();        
            }
        } else if(json.serial == '') {
            json.serial = 'CUSTOMSONG_' + (ShuttingStarsUtility.random() * 99999999) + '' + (ShuttingStarsUtility.random() * 99999999);
            song = new CustomSSSong();
            song.serial = json.serial;
        } else {
            throw 'This is not a valid song JSON.';
        }

        if(typeof(json.name          ) == 'undefined') throw 'This is not a valid song JSON.';
        if(typeof(json.composer      ) == 'undefined') throw 'This is not a valid song JSON.';
        if(typeof(json.noteWriter    ) == 'undefined') throw 'This is not a valid song JSON.';
        if(typeof(json.description   ) == 'undefined') throw 'This is not a valid song JSON.';
        if(typeof(json.bpm           ) == 'undefined') json.bpm
        if(typeof(json.loadingTime   ) == 'undefined') json.loadingTime      = 0;
        if(typeof(json.noteMultiplier) == 'undefined') json.noteMultiplier   = 1;
        if(typeof(json.timeConstant  ) == 'undefined') json.timeConstant     = 0;
        if(typeof(json.timeMultiplier) == 'undefined') json.timeMultiplier   = 1;

        song.name           = json.name;
        song.composer       = json.composer;
        song.noteWriter     = json.noteWriter;
        song.bgaUrl         = json.bgaUrl;
        song.musicUrl       = json.musicUrl;
        song.musicAlterUrl  = json.musicAlterUrl;
        song.useYoutube     = json.useYoutube;
        song.youtubeVideoId = json.youtubeVideoId;
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
        if(json.test      ) song.test       = true;
        if(json.onlyRandom) song.onlyRandom = true;

        song.autoStars = true;
        if(typeof(json.autoStars) != 'undefined') {
            if(json.autoStars) song.autoStars = true;
            else               song.autoStars = false;
        }

        if(typeof(json.canListen) != 'undefined') {
            if(json.canListen) song.canListen = true;
            else               song.canListen = false;
        } else {
            song.canListen = true;
        }

        for(idx=0; idx<json.difficulties.length; idx++) {
            const difficultyOne = json.difficulties[idx];
            let newObj = {};

            newObj.index = idx;
            newObj.difficultyLabel = difficultyOne.difficultyLabel;
            newObj.difficultyLevel = difficultyOne.difficultyLevel;
            newObj.patterns = [];
            newObj.autoCreate = false;

            if(difficultyOne.autoCreate) newObj.autoCreate = true;
            if(difficultyOne.patterns) {
                for(let idx2=0; idx2<difficultyOne.patterns.length; idx2++) {
                    const noteJsonOne = difficultyOne.patterns[idx2];
                    let line = noteJsonOne.line;
                    if(typeof(noteJsonOne.line) == 'undefined' && (! (typeof(noteJsonOne.locationIndex) != 'undefined') )) line = noteJsonOne.locationIndex;

                    let types = 'normal';
                    let ends = noteJsonOne.time;

                    if(noteJsonOne.type) types = noteJsonOne.type;
                    if(noteJsonOne.ends) ends  = noteJsonOne.ends;

                    let patternOne = new ShuttingStarsNotePattern(line, noteJsonOne.time, types, ends);
                    newObj.patterns.push(patternOne);
                }
            }
            
            song.difficulties.push(newObj);
        }

        if(json.serial != null && json.serial != '') {
            song.serial = json.serial;
        } else {
            song.serial = 'CUSTOMSONG_' + (ShuttingStarsUtility.random() * 99999999) + '' + (ShuttingStarsUtility.random() * 99999999);
        }

        if(json.decorations) {
            if(typeof(json.decorations) == 'string') json.decorations = ShuttingStarsUtility.parseJSON(json.decorations);
            song.decorations = json.decorations;
        }

        return song;
    }

    /**
     * 사용자가 첨부한 오디오 파일로 바로 곡 불러와 플레이하기 (Promise)
     * 
     * @param {string} mySongAudioURL 웹상에 업로드된 음악 파일 URL, 또는 사용자가 첨부한 음악 파일의 Blob URL (URL.createObjectURL() 로 생성한 URL)
     * @param {string} songName 곡 이름
     * @param {number} bpm bpm
     * @param {number} diffLevel 난이도
     * @param {*} json 기타 (선택사항) - 기타 속성 적용
     * @returns {Promise<void>}
     */
    async loadMySong(mySongAudioURL, songName, bpm, diffLevel, json) {
        const song = new CustomMySSSong();
        song.composer = '?';
        song.noteWriter = '?';
        song.noteWriter = '?';
        song.bgaUrl = '';
        song.musicUrl = mySongAudioURL;
        song.musicAlterUrl = '';
        song.thumbnailUrl = '';
        song.canListen = false;
        song.description = '|Music: ' + songName + ' (CUSTOM LEVEL)';
        song.loadingTime = 20;
        song.endTime = 0;
        song.timeConstant = 0;
        song.noteMultiplier = 1;
        song.timeMultiplier = 1;
        song.test = false;
        song.serial = 'CUSTOMSONG_' + ShuttingStarsUtility.randomString(false, 32);
        if(json) {
            if(typeof(json) == 'string') {
                json = json.trim();
                if(json == '') json = {};
                else           json = ShuttingStarsUtility.parseJSON(json);
            }
            for(let k in json) {
                song[k] = json[k];
            }
        }

        let diffLabel = 'easy';
        if(diffLevel <= 3) diffLabel = 'easy';
        else if(diffLevel <= 6) diffLabel = 'normal';
        else if(diffLevel <= 10) diffLabel = 'hard';
        else diffLabel = 'ex';

        if(typeof(song.difficulties) == 'undefined' || song.difficulties == null || song.difficulties.length <= 0) {
            song.difficulties = [{
                index : 0,
                difficultyLabel : diffLabel,
                difficultyLevel : diffLevel,
                patterns : [],
                autoCreate : true
            }];    
        } else {
            song.difficulties[0].index = 0;
            song.difficulties[0].difficultyLevel = diffLevel;
            song.difficulties[0].difficultyLabel = diffLabel;
            if(typeof(song.difficulties[0].patterns) == 'undefined') {
                song.difficulties[0].patterns = [];
                song.difficulties[0].autoCreate = true;
            }
            if(typeof(song.difficulties[0].autoCreate) == 'undefined') song.difficulties[0].autoCreate = true;
        }
        

        song.name = songName;
        song.description = '|Music: ' + songName + ' (CUSTOM LEVEL)';
        song.bpm = bpm;

        this.addSong(song);
        this.song = song;

        this.difficulty = song.difficulties[0];
        this.difficultyLevel = this.difficulty.difficultyLevel;
        this.difficultyUsingAutoCreate = true;

        this.setState('songtitle');
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
            if(typeof(json) == 'string') json = ShuttingStarsUtility.parseJSON(json);

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
            if(songOne.name == song.name && songOne.composer == song.composer && songOne.noteWriter == song.noteWriter && songOne.bpm == song.bpm && songOne.description == song.description) {
                exists = true;
                break;
            }
        }

        if(exists) throw "Duplicated song's serial";
        this.songs.push(song);

        // songDisplays 갱신
        this.refreshSongDisplayList();

        if(noSave) return returnVal;
        this.saveSongs();
        return returnVal;
    }

    /**
     * 
     * 특정곡 바로 플레이
     * 
     * @param {*} song 플레이할 곡 (ShuttingStarsSong 객체, 또는 곡의 serial 값)
     * @param {number|null} difficultyLevel 난이도 (선택사항, 사용 시 1~15 사이 자연수로 입력해야 함)
     * @param {boolean|null} listen 듣기 여부 (선택사항)
     */
    async playSong(song, difficultyLevel, listen) {
        const selfs = this;
        if(this.state == 'playing') throw new Error('Cannot use this while playing');

        try { this.stopAudio();            } catch(e) {}
        try { this.closeAudioSources();    } catch(e) {}
        try { this.clearTimeHandler();     } catch(e) {}

        if(typeof(song) == 'string') {
            // serial 로 쳐서, 기존 songs 목록에서 찾기
            for(let sdx=0; sdx<this.songs.length; sdx++) {
                if(this.songs[sdx].serial == song) {
                    song = this.songs[sdx];
                    break;
                }
            }
        }

        if(typeof(song) == 'string') { throw new Error('Cannot find song ' + song + ' in songs list'); }
        if(selfs.songs.indexOf(song) < 0) { throw new Error('Cannot find song ' + song.name + ' in songs list'); }
        selfs.song = song;

        let diffIdx = 0;
        if(typeof(difficultyLevel) == 'number') {
            for(let ddx=0; ddx<song.difficulties.length; ddx++) {
                if(song.difficulties[ddx].difficultyLevel == difficultyLevel) {
                    diffIdx = ddx;
                    break;
                }
            }
        }

        selfs.difficulty = song.difficulties[diffIdx];
        selfs.difficultyLevel = selfs.difficulty.difficultyLevel;
        selfs.difficultyUsingAutoCreate = selfs.difficulty.autoCreate;
        selfs.difficultyChoosing = false;
        selfs.titleDelayTime = Math.floor(20 * (selfs.noteSpeedMultiplier - 1));

        if(listen) await selfs.setState('listentitle');
        else       await selfs.setState('songtitle');
    }

    /**
     * 해당 곡을 선택된 상태로 만들기
     * 
     * @param {*} song 대상 곡 (ShuttingStarsSong 객체, 또는 곡의 serial 값)
     */
    async directSelectSong(song) {
        const selfs = this;
        if(this.state == 'playing') throw new Error('Cannot use this while playing');

        try { this.stopAudio();            } catch(e) {}
        try { this.closeAudioSources();    } catch(e) {}
        try { this.clearTimeHandler();     } catch(e) {}

        if(typeof(song) == 'string') {
            // serial 로 쳐서, 기존 songs 목록에서 찾기
            for(let sdx=0; sdx<this.songs.length; sdx++) {
                if(this.songs[sdx].serial == song) {
                    song = this.songs[sdx];
                    break;
                }
            }
        }

        if(typeof(song) == 'string') { throw new Error('Cannot find song ' + song + ' in songs list'); }
        if(this.songs.indexOf(song) < 0) { throw new Error('Cannot find song ' + song.name + ' in songs list'); }

        await this.setState('songchoosing');
        this.song = song;
        this.songChoosingMode = 'default';
        this.songChoosing = song;
    }

    /** 
     * 로딩된 곡 정보 전체 반환 (복제해 반환) 
     * @param {function|null} fFilter 필터링 함수 (선택사항) - 반환할 곡 정보에 대해 true/false 를 반환하는 함수, false 반환 시 해당 곡은 제외됨, 매개변수 첫 번째로 곡 정보가, 두 번째로 Broker 객체가 들어옴
     * @returns {Array<object>} 로딩된 곡 정보 전체 (Plain Object 형태의 배열로 반환)
    */
    getAllSongData(fFilter) {
        const songInfo = this.songs;
        let plainObjectArray = [];
        for(let idx=0; idx<songInfo.length; idx++) {
            const songOne = songInfo[idx];
            let json    = songOne.toJSONObject();

            json.opensource = true;
            json.official = false;
            if(songOne instanceof OfficialSSSong) {
                json.official = true;
            }

            if(songOne instanceof CustomSSSong) {
                continue;
            }

            if(songOne.composer.indexOf('우아한형제들') >= 0) {
                json.opensource = false;
            } else {
                json.opensource = (songOne.composer.indexOf('Lyria') >= 0 || songOne.composer.indexOf('ChatGPT') >= 0);
            }
            
            // serial 값이 있으면 제거
            if(json.serial) {
                json.serial = '';
            }

            if(typeof(fFilter) == 'function') {
                if(! fFilter(json, this.broker)) continue;
            }

            plainObjectArray.push(json);
        }
        return ShuttingStarsUtility.cloneObject(plainObjectArray);
    }

    /** 
     * 로딩된 곡 정보 전체 반환 (복제해 반환) 
     *     로딩 절차까지 포함
     * @param {string} urlCtx 현재 웹 경로의 URL Context
     * @param {function|null} fFilter 필터링 함수 (선택사항) - 반환할 곡 정보에 대해 true/false 를 반환하는 함수, false 반환 시 해당 곡은 제외됨, 매개변수 첫 번째로 곡 정보가, 두 번째로 Broker 객체가 들어옴
     * @returns {Promise<Array<object>>} 로딩된 곡 정보 전체 (Plain Object 형태의 배열로 반환)
    */
    async getAllSongPromise(urlCtx, fFilter) {
        // 숨김 영역에 게임 초기화, 로딩 후 삭제해야 됨
        const div = document.createElement('div');
        div.className = 'shuttingstars-hidden-corearea';
        div.setAttribute('display', 'none');
        document.body.appendChild(div);

        try { await this.init(div, urlCtx); } catch(e) { console.error(e); }
        const allSongData = this.getAllSongData(fFilter);

        try { this.destroy();                 } catch(e) { console.error(e); }
        try { document.body.removeChild(div); } catch(e) { console.error(e); }
        
        return allSongData;
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
        let storageJson = ShuttingStarsUtility.parseJSON(storageStrings);
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
        if(typeof(recordOne) == 'string') recordOne = ShuttingStarsUtility.parseJSON(recordOne);

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
        const selfs = this;
        const fAfter = function() {
            if(typeof(callbackAfter) == 'function') { callbackAfter(); }
            else { selfs.fGameEvent({ "event" : 'refreshpage', "broker" : selfs.broker }); if(selfs.fRefresh) selfs.fRefresh(); }
        }
        try { this.fGameEvent({ "event" : 'reset', "broker" : this.broker }); } catch(e) {}
        try { localStorage.setItem('shuttingstar_settings', ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        try { localStorage.setItem('shuttingstar_songs'   , ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        try { localStorage.setItem('shuttingstar_packages', ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        try { localStorage.setItem('shuttingstar_records' , ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        try { localStorage.setItem('shuttingstar_credit'  , ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }

        if(this.backend != null) {
            if(this.backend.logined) {
                this.backend.storeOuterStorage(null).then(() => {
                    fAfter();
                }).catch((e1) => {
                    console.error(e1);
                    fAfter();
                });
                return;
            }
        }
        fAfter();
    }

    /**
     * 웹 접근성 영역에 스크린 리더기용 메시지 추가 (+ 10건 넘어가면 오래된 것부터 삭제)
     * 
     * @param {string} message 
     */
    accessililityLog(message) {
        if(typeof(message) != 'string') message = '' + message;
        const leftsCount = 30; // 남길 갯수
        
        // 오래된 메시지 먼저 삭제
        const areas = this.accessibilityLayer.querySelectorAll('.div_accessibility_log');
        if(areas.length >= leftsCount) {
            for(let idx=0; idx<areas.length-leftsCount+1; idx++) {
                const areaOne = areas[idx];
                if(areaOne.parentNode != null) areaOne.parentNode.removeChild(areaOne);
            }
        }

        // 메시지 추가
        const div = document.createElement('div');
        div.classList.add('div_accessibility_log');
        div.classList.add('sr_only');
        div.classList.add('only_for_screenreader');
        div.innerText = message;
        div.setAttribute('aria-live', 'polite');
        this.accessibilityLayer.appendChild(div);
    }

    /**
     * state (화면) 변경 시마다 호출되며, 현재 화면에 대해 웹 접근성 영역에 메시지로 설명을 출력 (accessililityLog 사용)
     */
    processWebAccessibility() {
        if(this.state == 'title') {
            this.accessililityLog('ShuttingStars - Game title screen. The game is loading...');
        } else if(this.state == 'firstset') {    
            this.accessililityLog('ShuttingStars - Screen for first setting. Press ENTER key three times, then you can get into the menu screen.');
        } else if(this.state == 'menu') {
            this.accessililityLog('ShuttingStars - Menu screen.');
            for(let idx=0; idx<this.menuListDynamic.length; idx++) {
                const menuKeyword = this.menuListDynamic[idx];

                if(menuKeyword == 'play') {
                    this.accessililityLog('    Menu ' + (idx + 1) + ": Play." + (this.menuChoosing == menuKeyword ? ' (Currently selected)' : ''));
                } else if(menuKeyword == 'setting') {
                    this.accessililityLog('    Menu ' + (idx + 1) + ": Setting." + (this.menuChoosing == menuKeyword ? ' (Currently selected)' : ''));
                }  else if(menuKeyword == 'listen') {
                    this.accessililityLog('    Menu ' + (idx + 1) + ": Listen." + (this.menuChoosing == menuKeyword ? ' (Currently selected)' : ''));
                }  else if(menuKeyword == 'credit') {
                    this.accessililityLog('    Menu ' + (idx + 1) + ": Credit." + (this.menuChoosing == menuKeyword ? ' (Currently selected)' : ''));
                }  else if(menuKeyword == 'community') {
                    this.accessililityLog('    Menu ' + (idx + 1) + ": Community." + (this.menuChoosing == menuKeyword ? ' (Currently selected)' : ''));
                }  else if(menuKeyword == 'records') {
                    this.accessililityLog('    Menu ' + (idx + 1) + ": Records." + (this.menuChoosing == menuKeyword ? ' (Currently selected)' : ''));
                }  else if(menuKeyword == 'login') {
                    this.accessililityLog('    Menu ' + (idx + 1) + ": Login." + (this.menuChoosing == menuKeyword ? ' (Currently selected)' : ''));
                }  else if(menuKeyword == 'logout') {
                    this.accessililityLog('    Menu ' + (idx + 1) + ": Logout." + (this.menuChoosing == menuKeyword ? ' (Currently selected)' : ''));
                }  else if(menuKeyword == 'exit') {
                    this.accessililityLog('    Menu ' + (idx + 1) + ": Exit." + (this.menuChoosing == menuKeyword ? ' (Currently selected)' : ''));
                } else {
                    this.accessililityLog('    Menu ' + (idx + 1) + ": Not available yet." + (this.menuChoosing == menuKeyword ? ' (Currently selected)' : ''));
                }
                this.accessililityLog('Arrow keys to move up and down, ENTER key to select.');
            }
        } else if(this.state == 'songchoosing') {
            this.accessililityLog('ShuttingStars - Song choosing screen for play.');
            this.accessililityLog('Arrow keys to move up and down, ENTER key to select. ESC key to go back.');
            if(this.songChoosingMode == 'default') {
                this.accessililityLog('    Default mode is selected. You can select a song and its difficulty to play.');
            } else if(this.songChoosingMode == 'mission') {
                this.accessililityLog('    Mission mode is selected. You can select a mission to play.');
            } else {
                this.accessililityLog('    MY-SONG mode is selected. First, you can select a difficulty. Then, you can select your own mp3 file, and input this song\'s BPM, then you can play this song.');
            }
        } else if(this.state == 'songtitle') {
            this.accessililityLog('ShuttingStars - Song title screen. The game will be start soon. Please ready.');
            this.accessililityLog('    Song : ' + this.song.name);
            this.accessililityLog('    Composer : ' + this.song.composer);
            this.accessililityLog('    Note Writer : ' + this.song.noteWriter);
            this.accessililityLog('    BPM : ' + this.song.bpm);
            this.accessililityLog('    Difficulty : ' + this.difficultyLevel);
        } else if(this.state == 'playing') {
            this.accessililityLog('ShuttingStars - Game is started.');
        } else if(this.state == 'gameover') {
            this.accessililityLog('Game Over');
        } else if(this.state == 'result') {
            this.accessililityLog('ShuttingStars - Result');
            this.accessililityLog('    Song : ' + this.song.name);
            this.accessililityLog('    Composer : ' + this.song.composer);
            this.accessililityLog('    Note Writer : ' + this.song.noteWriter);
            this.accessililityLog('    Difficulty : ' + this.difficultyLevel);
            this.accessililityLog('    PERFECT : ' + this.report.PERFECT);
            this.accessililityLog('    GREAT : ' + this.report.GREAT);
            this.accessililityLog('    GOOD : ' + this.report.GOOD);
            this.accessililityLog('    BAD : ' + this.report.BAD);
            this.accessililityLog('    MISS : ' + this.report.MISS);
            this.accessililityLog('    SCORE : ' + ShuttingStarsUtility.fitDigit(this.point, 10)); // TODO
            this.accessililityLog('    RANK : ' + this.judgeResultRank());

            this.accessililityLog('ESC key to go back to menu.');
        } else if(this.state == 'listenchoosing') {
            this.accessililityLog('ShuttingStars - Song choosing screen for just listen.');
            this.accessililityLog('Arrow keys to move up and down, ENTER key to select. ESC key to go back.');
        } else if(this.state == 'listentitle') {
            this.accessililityLog('ShuttingStars - Song title screen. The song will be start soon.');
            this.accessililityLog('    Song : ' + this.song.name);
            this.accessililityLog('    Composer : ' + this.song.composer);
            this.accessililityLog('    Note Writer : ' + this.song.noteWriter);
            this.accessililityLog('    BPM : ' + this.song.bpm);
        } else if(this.state == 'setting') {
            this.accessililityLog('ShuttingStars - Setting screen.');
        } else if(this.state == 'credit') {
            this.accessililityLog('ShuttingStars - Credit screen.');
            this.accessililityLog('ESC key to go back.');
            for(let idx=0; idx<this.creditContents.length; idx++) {
                const creditOne = this.creditContents[idx];
                this.accessililityLog(creditOne.label);
            }
        }
    }

    /** 
     * init 의 역행. 게임을 종료시키고 화면에서 게임 제거.
     *     게임 동작 과정에서 등록된 이벤트 모두 해제
     */
    destroy() {
        try { this.clearTimeHandler();  } catch(e) {}
        try { this.closeAudioSources(); } catch(e) {}

        if(this.youtubePopPlayer != null) { try { this.youtubePopPlayer.destroy(); } catch(e) {} }
        if(this.youtubePlayer    != null) { try { this.youtubePlayer.destroy();    } catch(e) {} }

        for(let idx=0; idx<this.onDestroyTasks.length; idx++) {
            const taskOne = this.onDestroyTasks[idx];
            try { taskOne(); } catch(e) { console.error(e); }
        }
        this.onDestroyTasks = [];

        if(this.ss3d != null) { try { this.ss3d.destroy(this); } catch(e) {}; this.ss3d = null; }

        this.songs = [];
        this.songDisplays = [];
        this.songCanListen = [];
        this.songRandoms = [];
        this.ss3d = null;
        this.backend = null;
        this.state = 'title';
        this.titleScreenWaiting = false;

        this.rootDiv.innerHTML = '';
        this.rootDiv = null;
        ShuttingStarsUtility.log('ShuttingStars - The game core has been destroyed.');
    }
}

/*** ShuttingStars 게임 Core 객체 탑재 변수 **/
const _shuttingstarcore = new ShuttingStarsCore();

/** 
 * 각 상태들을 모아 구현하는 클래스
 *     지금은 ShuttingStarsCore 클래스에 다 구현해놨지만, 추후 state 값 별로 별도 클래스를 만들어 코드를 분리할 예정
*/
class ShuttingStarsState {
    name = ''; // state 값

    /** state 값이 이 현재의 클래스로 변경될 때 호출  */
    onStateChanged = function(coreInst) {}

    /** 스테이지가 리셋될 때 호출 */
    onStageReset = function(coreInst) {}

    /** 
     * 화면 그리기 (현재의 state값이 이 클래스에 해당되는 경우 ShuttingStarsCore 의 renderIn 1사이클마다 호출됨)
     * 
     * @param {CanvasRenderingContext2D} ctx
     * @param {ShuttingStarsCore} coreInst
    */
    render = function(ctx, coreInst) {}

    /**
     * 키보드 입력 이벤트 처리 (현재의 state 값이 이 클래스에 해당되는 경우 호출됨)
     * 
     * @param {string} key 입력된 키 코드 (웹 keypress 이벤트의 key 값)
     * @param {boolean} vkeyExplosion 가상 키 강조 효과 적용 여부
     * @param {ShuttingStarsCore} coreInst
     */
    handleKeyInput = function(key, vkeyExplosion, coreInst) {}

    /**
     * 키보드 입력 해제 이벤트 처리 (현재의 state 값이 이 클래스에 해당되는 경우 호출됨)
     * 
     * @param {string} key 입력된 키 코드 (웹 keypress 이벤트의 key 값)
     * @param {ShuttingStarsCore} coreInst
     */
    handleKeyReleased = function(key, coreInst) {}

    /** 기본 생성자 */
    constructor(obj) {
        if(typeof(obj) != 'undefined' && obj != null) {
            if(typeof(obj) == 'string') obj = ShuttingStarsUtility.parseJSON(obj);

            if(typeof(obj.name             ) == 'string'  ) this.name              = obj.name;
            if(typeof(obj.onStateChanged   ) == 'function') this.onStateChanged    = obj.onStateChanged;
            if(typeof(obj.onStageReset     ) == 'function') this.onStageReset      = obj.onStageReset;
            if(typeof(obj.render           ) == 'function') this.render            = obj.render;
            if(typeof(obj.handleKeyInput   ) == 'function') this.handleKeyInput    = obj.handleKeyInput;
            if(typeof(obj.handleKeyReleased) == 'function') this.handleKeyReleased = obj.handleKeyReleased;
        }
    }
}

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
    /** @type {number} 곡 종료 시간 임의 지정 (0으로 설정 시 곡 끝까지 사용됨) */
    endTime = 0;

    /** @type {string} 추가 패키지인 경우 추가 패키지 이름이 들어감 */
    contentname = '';

    /** @type {string} 음원 URL */
    musicUrl = '';
    /** @type {string} 음원 대체 URL */
    musicAlterUrl = '';

    /** @type {boolean} 유튜브 사용 여부, true 지정 시 youtubeVideoId 도 반드시 지정해야 함. 사용 시 음원, BGM 다 무시되며 유튜브 영상이 배경에 깔림. */
    useYoutube = false;
    /** @type {string} 유튜브 영상 ID */
    youtubeVideoId = '';

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
    /** @type {boolean} true 지정 시 곡 목록에 노출되지 않으며 랜덤 (미션 등)으로만 선정됨 */
    onlyRandom = false;
    /** @type {string} 수정하지 말 것 */
    serial = '';

    /** @type {boolean} 게임 동작 중 수정됨, ALTER URL 사용여부 */
    alterUrlUsing = false;

    /** @type {boolean} 게임 플레이가 아닌, 곡 감상 기능 이용 가능 여부 */
    canListen = false;
    
    // 난이도 별 패턴
    // 배열로, 각 원소는 JSON객체로 구성
    // 원소의 JSON키
    //     difficultyLabel : (string) easy, normal, hard, 그 뒤부터는 ex1, ex2, ex3, ... 순으로 난이도 이름 뒤에 ; (세미콜론) 뒤에 숫자로 난이도 표기한 문자열이 키로 사용
    //     difficultyLevel : (number) 1, 2, 3, ... (정수로  입력)
    //     patterns        : (array)  배열로 그 안에 ShuttingStarsNotePattern 패턴들이 탑재
    //     autoCreate      : (boolean, 선택사항) 노트 자동생성 기능 사용여부 지정 (true 시 위 patterns 배열은 의미가 없어짐, 기본값은 false)
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
     * 곡에 정의된 난이도 목록을 반환합니다.
     * @returns {Array<Object>} 난이도 객체 목록
     */
    getDifficultyList() {
        let arr = [];
        let idx;
        for(idx=0; idx<this.difficulties.length; idx++) {
            const diffOne = this.difficulties[idx];
            let obj = {
                index : diffOne.index,
                difficultyLabel : diffOne.difficultyLabel,
                difficultyLevel : diffOne.difficultyLevel,
                autoCreate : false
            };
            if(diffOne.autoCreate) obj.autoCreate = true;
            arr.push(obj);
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
        obj.useYoutube = this.useYoutube;
        obj.youtubeVideoId = this.youtubeVideoId;
        obj.thumbnailUrl = this.thumbnailUrl;
        obj.description = this.description;
        obj.loadingTime = this.loadingTime;
        obj.bpm = this.bpm;
        obj.endTime = this.endTime;
        obj.timeConstant = this.timeConstant;
        obj.timeMultiplier = this.timeMultiplier;
        obj.noteMultiplier = this.noteMultiplier;
        obj.test = this.test;
        obj.onlyRandom = this.onlyRandom;
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

            diffObj.autoCreate = false;
            if(diffOne.autoCreate) diffObj.autoCreate = true;

            if(diffOne.patterns) {
                for(jdx=0; jdx<diffOne.patterns.length; jdx++) {
                    const noteObjOne = diffOne.patterns[jdx];
                    let noteJsonOne = {};
                    noteJsonOne.line = noteObjOne.line;
                    noteJsonOne.time = noteObjOne.time;
                    if(noteObjOne.type) noteJsonOne.type = noteObjOne.type;
                    if(noteObjOne.ends) noteJsonOne.ends = noteObjOne.ends;
                    diffObj.patterns.push(noteJsonOne);
                }
            }
            
            obj.difficulties.push(diffObj);
        }

        return obj;
    }
}

/** 공식 탑재 곡 */
class OfficialSSSong extends ShuttingStarsSong {
    /**
     * 인스턴스 초기화
     */
    constructor() { super(); }
}

/** 비공식 곡 */
class CustomSSSong extends ShuttingStarsSong {
    /**
     * 인스턴스 초기화
     */
    constructor() { super(); }
}

/** MySong 모드 곡 (사용자가 가진 오디오 파일 첨부해서 즉석 플레이하는 곡, 기록을 남기면 안되며, 플레이 후 곡 목록에서 바로 삭제) */
class CustomMySSSong extends CustomSSSong {
    /**
     * 인스턴스 초기화
     */
    constructor() { super(); }
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
    prepare(inst) {
        const allCnt = inst.songRandoms.length;
        const rand   = Math.floor(ShuttingStarsUtility.random() * allCnt);

        const choosed = inst.songRandoms[rand];
        this.musicUrl       = choosed.musicUrl;
        this.musicAlterUrl  = choosed.musicAlterUrl;
        this.bpm            = choosed.bpm;
        this.timeConstant   = 0;
        this.timeMultiplier = 1;// choosed.timeMultiplier;
        this.loadingTime    = choosed.loadingTime;
        this.composer       = choosed.composer;
        this.noteWriter     = '???';
        if(choosed.endTime > 0) this.endTime = Math.ceil(choosed.endTime / choosed.noteMultiplier) + 1;
    }
}

/** EASY 생존 미션 */
class EasySurviveSSMission extends ShuttingStarsMission {
    /**
     * 인스턴스 초기화
     * @param {ShuttingStarsCore} inst ShuttingStarsCore 객체
     */
    constructor(inst) {
        super(inst);
        this.name = 'SURVIVE (EASY)'
        let desc = inst.trans('Survive (EASY)');
        desc += '\n' + inst.trans('Random song, random notes !');
        this.description = desc;
    }
    /**
     * 사전 준비
     * @param {ShuttingStarsCore} inst ShuttingStarsCore 객체
     */
    prepare(inst) {
        super.prepare(inst);
        // this.prepareNotes(inst, 3);
        this.difficulties = [];
        this.difficulties.push({
            index : 0,
            difficultyLabel : 'easy',
            difficultyLevel : 3,
            patterns : [],
            autoCreate : true
        });
    }
}

/** NORMAL 생존 미션 */
class NormalSurviveSSMission extends ShuttingStarsMission {
    /**
     * 인스턴스 초기화
     * @param {ShuttingStarsCore} inst inst 값
     */
    constructor(inst) {
        super(inst);
        this.name = 'SURVIVE (NORMAL)'
        let desc = inst.trans('Survive (NORMAL)');
        desc += '\n' + inst.trans('Random song, random notes !');
        this.description = desc;
    }
    /**
     * 사전 준비
     * @param {ShuttingStarsCore} inst inst 값
     */
    prepare(inst) {
        super.prepare(inst);
        // this.prepareNotes(inst, 5);
        this.difficulties = [];
        this.difficulties.push({
            index : 0,
            difficultyLabel : 'normal',
            difficultyLevel : 5,
            patterns : [],
            autoCreate : true
        });
    }
}

/** HARD 생존 미션 */
class HardSurviveSSMission extends ShuttingStarsMission {
    /**
     * 인스턴스 초기화
     * @param {ShuttingStarsCore} inst inst 값
     */
    constructor(inst) {
        super(inst);
        this.name = 'SURVIVE (HARD)'
        let desc = inst.trans('Survive (HARD)');
        desc += '\n' + inst.trans('Random song, random notes !');
        this.description = desc;
    }
    /**
     * 사전 준비
     * @param {ShuttingStarsCore} inst inst 값
     */
    prepare(inst) {
        super.prepare(inst);
        // this.prepareNotes(inst, 9);
        this.difficulties = [];
        this.difficulties.push({
            index : 0,
            difficultyLabel : 'hard',
            difficultyLevel : 8,
            patterns : [],
            autoCreate : true
        });
    }
}

/** Very HARD 생존 미션 */
class VeryHardSurviveSSMission extends ShuttingStarsMission {
    /**
     * 인스턴스 초기화
     * @param {ShuttingStarsCore} inst inst 값
     */
    constructor(inst) {
        super(inst);
        this.name = 'SURVIVE (Very HARD)'
        let desc = inst.trans('Survive (Very HARD)');
        desc += '\n' + inst.trans('Random song, random notes !');
        this.description = desc;
    }
    /**
     * 사전 준비
     * @param {ShuttingStarsCore} inst inst 값
     */
    prepare(inst) {
        super.prepare(inst);
        // this.prepareNotes(inst, 9);
        this.difficulties = [];
        this.difficulties.push({
            index : 0,
            difficultyLabel : 'hard',
            difficultyLevel : 10,
            patterns : [],
            autoCreate : true
        });
    }
}

/** Crazy 생존 미션 */
class CrazySurviveSSMission extends ShuttingStarsMission {
    /**
     * 인스턴스 초기화
     * @param {ShuttingStarsCore} inst inst 값
     */
    constructor(inst) {
        super(inst);
        this.name = 'SURVIVE (CRAZY)'
        let desc = inst.trans('Survive (CRAZY)');
        desc += '\n' + inst.trans('Random song, random notes !');
        this.description = desc;
    }
    /**
     * 사전 준비
     * @param {ShuttingStarsCore} inst inst 값
     */
    prepare(inst) {
        super.prepare(inst);
        // this.prepareNotes(inst, 9);
        this.difficulties = [];
        this.difficulties.push({
            index : 0,
            difficultyLabel : 'ex',
            difficultyLevel : 12,
            patterns : [],
            autoCreate : true
        });
    }
}

/** 노트가 생성될 위치와 시간 (즉 패턴) */
class ShuttingStarsNotePattern {
    /** @type {number} 게임 내부에서 사용하는 객체 고유 식별자 */
    id = 0;
    /** @type {number} 객체가 배치된 노트 라인 번호 */
    line = 0;
    /** @type {number} 노트 패턴이 판정선에 위치할 타이밍 */
    time = 0.0;

    /** @type {string} 노트 타입 (기본값 : normal) */
    type = 'normal' // normal / long
    /** @type {number} 롱 노트인 경우, 종료 타이밍 */
    ends = 0.0;

    /**
     * 인스턴스 초기화
     * @param {number} line 노트 라인의 번호
     * @param {number} time 노트 패턴이 판정선에 위치할 타이밍
     * @param {string} type 노트 타입 (normal / long, 기본값 : normal)
     * @param {number} ends 롱 노트인 경우, 종료 타이밍
     */
    constructor(line, time, types, ends) {
        this.line = line;
        this.time = time;
        if(types) this.type = String(types);
        if(ends ) this.ends = parseFloat(ends);
    }
}

/* 게임 내 Note 및 SSNotePlacer 의 상위 클래스 */
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
     * @param {ShuttingStarsCore} coreInst 게임 코어 객체
     */
    constructor(coreInst) {
        this.uniqueSerial = 10000000 + ShuttingStarsUtility.randomInt() + (ShuttingStarsUtility.randomInt() * 10000); // 고유값
    }
    /**
     * draw 대상을 화면에 렌더링
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     * @param {ShuttingStarsCore} coreInst 게임 코어 객체
     */
    draw(ctx, coreInst) {
        if(this.hidden) return;
        if(this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(coreInst.convertX(this.x), coreInst.convertY(this.y, true), coreInst.convertX(this.r), 0, 2 * Math.PI);

            if(this.fill) {
                ctx.fillStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + this.getNowOpacity(coreInst) + ')');
                ctx.fill();
            } else {
                ctx.strokeStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + this.getNowOpacity(coreInst) + ')');
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        } else if(this.shape == 'rect') {
            if(this.fill) {
                ctx.fillStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + this.getNowOpacity(coreInst) + ')');
                ctx.fillRect(coreInst.convertX(this.x), coreInst.convertY(this.y, true), coreInst.convertX(this.r), coreInst.convertY(this.h));
            } else {
                ctx.strokeStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + this.getNowOpacity(coreInst) + ')');
                ctx.lineWidth = 1;
                ctx.strokeRect(coreInst.convertX(this.x), coreInst.convertY(this.y, true), coreInst.convertX(this.r), coreInst.convertY(this.h));
            }
        }

        if(this.tail) {
            for(let idx=this.beforeLocations.length-1; idx>=0; idx--) {
                if(idx % 4 != 0) continue;
                const beforeLoc = this.beforeLocations[idx];
                if(this.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(coreInst.convertX(beforeLoc.x), coreInst.convertY(beforeLoc.y, true), coreInst.convertX(this.r), 0, 2 * Math.PI);

                    if(this.fill) {
                        ctx.fillStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + (this.getNowOpacity(coreInst) / 2) + ')');
                        ctx.fill();
                    } else {
                        ctx.strokeStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + (this.getNowOpacity(coreInst) / 2) + ')');
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                } else if(this.shape == 'rect') {
                    if(this.fill) {
                        ctx.fillStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + (this.getNowOpacity(coreInst) / 2) + ')');
                        ctx.fillRect(coreInst.convertX(beforeLoc.x), coreInst.convertY(beforeLoc.y, true), coreInst.convertX(this.r), coreInst.convertY(this.h));
                    } else {
                        ctx.strokeStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + (this.getNowOpacity(coreInst) / 2) + ')');
                        ctx.lineWidth = 1;
                        ctx.strokeRect(coreInst.convertX(beforeLoc.x), coreInst.convertY(beforeLoc.y, true), coreInst.convertX(this.r), coreInst.convertY(this.h));
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
     * @param {ShuttingStarsCore} coreInst
     * @returns {number} 현재 불투명도
     */
    modifyExplosiveOpacity(coreInst) {
        let opa = this.opacity;
        if(this.explosing >= 1) {
            opa = 1.0 - (this.explosing * 1.0 / this.explosingMax);
        }
        return opa;
    }

    /**
     * 현재 효과 진행 상태를 종합적으로 반영한 불투명도를 반환
     * @param {ShuttingStarsCore} coreInst
     * @returns {number} 현재 불투명도
     */
    getNowOpacity(coreInst) {
        return this.modifyExplosiveOpacity(coreInst);
    }

    /**
     * 다른 객체와 적정거리 이내 접근 감지 (수직 충돌만 감지) 접근이 감지된 경우 두 객체간의 수직거리를 양수로 반환, 그외의 경우 음수를 반환
     * @param {ShuttingStarsObject} otherObject otherObject 값
     * @param {number} multiplier
     * @returns {number} 두 객체 사이의 수직 거리. 범위를 벗어나면 음수
     */
    isMeetVerticalRangeIn(otherObject, multiplier) {
        if(typeof(multiplier) == 'undefined') multiplier = 1.0;
        if(((this instanceof SSNotePlacer) && (otherObject instanceof SSNote)) || ((this instanceof SSNote) && (otherObject instanceof SSNotePlacer))) {
            const distance = Math.abs(this.y - otherObject.y);

            if(distance < (this.r + otherObject.r) * multiplier) return distance;
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
class SSNoteKeyObject extends ShuttingStarsObject {
    /** @type {string} 입력 키 */
    key = '';
    /** @type {number} 라인 번호 */
    line = 0;
    /** @type {boolean} 다크 모드 */
    dark = false;
    /**
     * 인스턴스 초기화
     * @param {number} line 노트 라인 번호
     * @param {ShuttingStarsCore} coreInst
     */
    constructor(line, coreInst) {
        super(coreInst);
        this.line = line;
        this.key = coreInst.keyList[line];
        this.color = this.getColorOfLine(line);
    }

    /**
     * 현재 효과 진행 상태를 종합적으로 반영한 불투명도를 반환
     * @param {ShuttingStarsCore} coreInst
     * @returns {number} 현재 불투명도
     */
    getNowOpacity(coreInst) {
        return this.modifyExplosiveOpacity(coreInst);
    }

    /**
     * 현재 효과 진행 상태를 반영한 내부 키 글자의 폰트 타입 반환
     * @param {ShuttingStarsCore} coreInst
     * @returns {string} font weight 값 (normal / bold)
     */
    getNowFontWeight(coreInst) {
        return 'bold';
    }
    /**
     * draw 대상을 화면에 렌더링
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     * @param {ShuttingStarsCore} coreInst
     */
    draw(ctx, coreInst) {
        super.draw(ctx, coreInst);
        if(this.hidden) return;

        // 키 표시 (중앙에 출력하며, 크기는 내부에 들어오도록 폰트 크기 계산해야 함)
        let fontSize   = coreInst.convertFontSize(Math.round(this.r / 1.1));
        let fontWeight = this.getNowFontWeight(coreInst);

        if(fontWeight != null) {
            ctx.font = fontWeight + ' ' + fontSize + 'px ' + coreInst.getRenderFontFamily();

            if(this.dark) ctx.fillStyle = coreInst.convertColor('rgba(200, 200, 200, ' + this.getNowOpacity(coreInst) + ')');
            else          ctx.fillStyle = coreInst.convertColor('rgba(80, 80, 80, ' + this.getNowOpacity(coreInst) + ')');

            ctx.textAlign = "center";
            ctx.fillText(this.key, coreInst.convertX(this.x), coreInst.convertY(this.y + (fontSize / 4.0), true)); // Note 중앙에 출력
        }
    }
    /**
     * 라인 별 컬러
     * @param {number} line 노트 레인의 인덱스
     * @param {number} gradientIndex gradientIndex 값
     * @returns {string} RGB 색상 문자열
     */
    getColorOfLine(line, gradientIndex) {
        if(typeof(gradientIndex) == 'undefined') gradientIndex = 0;
        if(gradientIndex < 0) gradientIndex = 0;
        if(gradientIndex > 3) gradientIndex = 3;
        let r, g, b;

        // 총 6개의 라인, 순서대로 빨주노초파남
        if(line == 0) {
            r = 180;
            g = 80;
            b = 180;
        } else if(line == 1) {
            r = 230;
            g = 180;
            b = 80;
        } else if(line == 2) {
            r = 230;
            g = 230;
            b = 80;
        } else if(line == 3) {
            r = 180;
            g = 230;
            b = 80;
        } else if(line == 4) {
            r = 80;
            g = 230;
            b = 80;
        } else if(line == 5) {
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
        return this.getColorOfLine(this.line, gradientIndex);
    }
}

/** Note 제거기, 화면 내 고정위치에 떠 있으며, 플레이어가 해당 키 입력 시, 해당 위치를 지나는 노트를 제거하며 점수를 획득함. 또한 노트와 위치가 얼마나 동일한지에 따라 점수 계산 */
class SSNotePlacer extends SSNoteKeyObject {
    /**
     * 인스턴스 초기화
     * @param {number} line 노트 레인의 인덱스
     * @param {ShuttingStarsCore} coreInst
     */
    constructor(line, coreInst) {
        super(line, coreInst);
        this.r = coreInst.getNoteRadius();
        this.x = (this.r * 4) + Math.round(line * this.r * 2.5) + coreInst.getLeftMarginNote();
        this.y = coreInst.getNotePlacerYLocation();
        this.key = coreInst.keyList[line];
        this.shape = 'circle';
        this.opacity = 0.3;
        this.dark = true;
        this.color = this.getColorOfLine(line);
        this.fill = false;
        this.hidden = false;
    }

    /**
     * 폭발 진행 상태를 반영한 불투명도를 계산
     * @param {ShuttingStarsCore} coreInst
     * @returns {number} 현재 불투명도
     */
    modifyExplosiveOpacity(coreInst) {
        return super.modifyExplosiveOpacity(coreInst);
    }

    /**
     * 현재 효과 진행 상태를 종합적으로 반영한 불투명도를 반환
     * @param {ShuttingStarsCore} coreInst
     * @returns {number} 현재 불투명도
     */
    getNowOpacity(coreInst) {
        const originals = super.getNowOpacity(coreInst);
        if(coreInst.pw < coreInst.getPWUsingCost()) return 0.001;
        if(coreInst.pw < coreInst.getPWUsingCost() * 8) return 0.1;
        return originals;
    }
    
    /**
     * 현재 효과 진행 상태를 반영한 내부 키 글자의 폰트 타입 반환
     * @param {ShuttingStarsCore} coreInst
     * @returns {string} font weight 값 (null / normal / bold)
     */
    getNowFontWeight(coreInst) {
        if(coreInst.pw < coreInst.getPWUsingCost()) return null;
        if(coreInst.pw < coreInst.getPWUsingCost() * 8) return 'normal';
        return 'bold';
    }
}

/** 노트 (공통 사항을 묶은 상위 클래스) */
class SSNoteCommon extends SSNoteKeyObject {
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

    /**
     * 인스턴스 초기화
     * @param {number} line 노트 레인의 인덱스
     * @param {ShuttingStarsCore} coreInst
     */
    constructor(line, coreInst) {
        super(line, coreInst);
    }

    /**
     * 현재 효과 진행 상태를 종합적으로 반영한 불투명도를 반환
     * @param {ShuttingStarsCore} coreInst
     * @returns {number} 현재 불투명도
     */
    getNowOpacity(coreInst) {
        // 0.9 부터 시작하여 급격히 감소
        if(this.explosing <= 0) {
            return this.modifyExplosiveOpacity(coreInst);
        } else {
            let opa = this.modifyExplosiveOpacity(coreInst) - (this.explosing * 0.3);
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
        return this.getColorOfLine(this.line, gradientIndex);
    }
}

/** 노트, 곡 패턴에 따라 화면 최하단에 생성되며 위로 올라감. */
class SSNote extends SSNoteCommon {
    // 생성자
    /**
     * 인스턴스 초기화
     * @param {number} line 노트 레인의 인덱스
     * @param {ShuttingStarsCore} coreInst
     */
    constructor(line, coreInst) {
        super(line, coreInst);
        this.r = coreInst.getNoteRadius();
        this.speedY = 0;
        this.removed = false;
        this.explosing = 0;
        this.hidden = false;
        this.tail = false; // TODO
        
        // SSNotePlacer 찾기
        let notePlacer = coreInst.getNotePlacer(line);
        if(notePlacer == null) { this.explosing = this.explosingMax; return; }

        this.x = notePlacer.x;

        // 노트 속도 비활성화 - 이제 노트를 패턴 시간에 맞게 생성하지 않고 미리 쫙 생성한 다음 시간대에 맞춰 위치를 조정함
        this.y = coreInst.getNoteCreationYLocation() * 2;

        this.key = coreInst.keyList[line];
        this.shape = 'circle';
        this.opacity = 0.9;
        this.color = this.getColorOfLine(line);
    }
    
    /**
     * draw 대상을 화면에 렌더링
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     * @param {ShuttingStarsCore} coreInst
     */
    draw(ctx, coreInst) {
        // super.draw(ctx, coreInst);
        if(this.hidden) return;

        // 꼬리 먼저 그리기
        if(this.tail) {
            let tailR   = 0.5;
            let tailOpa = this.getNowOpacity(coreInst);
            let calculatedR = 0;
            for(let jdx=this.beforeLocations.length-1; jdx>=0; jdx--) {
                tailR   = tailR   - 0.0625;
                tailOpa = tailOpa * 0.5;

                if(jdx % 4 == 0) continue;
                if(tailR <= 0) continue;
                if(tailOpa <= 0) continue;

                const beforeLoc = this.beforeLocations[jdx];
                for(let idx=0; idx<=3; idx++) {
                    calculatedR = Math.floor(coreInst.convertX(this.r - idx) * tailR);
                    if(calculatedR <= 0) break;

                    ctx.beginPath();
                    ctx.arc(coreInst.convertX(beforeLoc.x), coreInst.convertY(beforeLoc.y, true), calculatedR, 0, 2 * Math.PI);

                    if(this.fill) {
                        ctx.fillStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor(idx) + ', ' + tailOpa + ')');
                        ctx.fill();
                    } else {
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor(idx) + ', ' + tailOpa + ')');
                        ctx.stroke();
                    }
                }
            }
        }
        
        // 본 노트 그리기
        let rs = 0;
        for(let idx=0; idx<=5; idx++) {
            rs = this.r - (idx * 2);
            if(rs <= 0) break;

            ctx.beginPath();
            ctx.arc(coreInst.convertX(this.x), coreInst.convertY(this.y, true), coreInst.convertX(rs), 0, 2 * Math.PI);

            if(this.fill) {
                ctx.fillStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor(idx) + ', ' + this.getNowOpacity(coreInst) + ')');
                ctx.fill();
            } else {
                ctx.lineWidth = 1;
                ctx.strokeStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor(idx) + ', ' + this.getNowOpacity(coreInst) + ')');
                ctx.stroke();
            }
        }

        // 키 표시 (중앙에 출력하며, 크기는 내부에 들어오도록 폰트 크기 계산해야 함)
        if(this.explosing < 2) {
            let fontSize = coreInst.convertFontSize(Math.round(this.r / 1.1));
            ctx.font = 'bold ' + fontSize + 'px ' + coreInst.getRenderFontFamily();

            if(this.dark) ctx.fillStyle = coreInst.convertColor('rgba(200, 200, 200, ' + this.getNowOpacity(coreInst) + ')');
            else          ctx.fillStyle = coreInst.convertColor('rgba(80, 80, 80, ' + this.getNowOpacity(coreInst) + ')');

            ctx.textAlign = "center";
            ctx.fillText(this.key, coreInst.convertX(this.x), coreInst.convertY(this.y + (fontSize / 4.0), true)); // Note 중앙에 출력
        }
    }
}

/** 누르고 있어야 하는 롱노트 */
class SSLongNote extends SSNoteCommon {
    /** @type {boolean} 누르고 있는지 여부 */
    handling = false;

    /** @type {number} 이 롱노트 처리 시작 타이밍 */
    handlingStartTiming = 0;

    /** @type {number} 이 롱노트 처리 종료 타이밍 */
    handlingEndTiming = 0;

    /** @type {number} 이 롱노트가 끝나는 타이밍 */
    originalEndTiming = 0;

    /** @type {number} y 종료 좌표 */
    yEnd = 0;

    /**
     * 인스턴스 초기화
     * @param {number} line 노트 레인의 인덱스
     * @param {ShuttingStarsCore} coreInst
     */
    constructor(line, coreInst) {
        super(line, coreInst);
        this.r = coreInst.getNoteRadius();
        this.speedY = 0;
        this.removed = false;
        this.explosing = 0;
        this.hidden = false;
        this.tail = false;
        
        // SSNotePlacer 찾기
        let notePlacer = coreInst.getNotePlacer(line);
        if(notePlacer == null) { this.explosing = this.explosingMax; return; }

        this.x = notePlacer.x;

        // 노트 속도 비활성화 - 이제 노트를 패턴 시간에 맞게 생성하지 않고 미리 쫙 생성한 다음 시간대에 맞춰 위치를 조정함
        this.y = coreInst.getNoteCreationYLocation() * 2;
        this.yEnd = coreInst.getNoteCreationYLocation() * 2; // 일단 y 좌표와 동일하게 입력, 게임 중 위치 조정 시 다시 변경

        this.key = coreInst.keyList[line];
        this.shape = 'rect';
        this.opacity = 0.9;
        this.color = this.getColorOfLine(line);
    }

    /**
     * modifyExplosiveColor 관련 상태를 갱신합니다.
     * @param {number} gradientIndex gradientIndex 값
     * @returns {string} 처리 결과
     */
    modifyExplosiveColor(gradientIndex) {
        if(this.missed) {
            return '90, 90, 90';
        }
        return super.modifyExplosiveColor(gradientIndex);
    }
    
    /**
     * draw 대상을 화면에 렌더링
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     * @param {ShuttingStarsCore} coreInst
     */
    draw(ctx, coreInst) {
        // super.draw(ctx, coreInst);
        if(this.hidden) return;
        if(this.y < coreInst.getHpBarYLocation() - 1) this.y = coreInst.getHpBarYLocation() - 1; // HP바 아래로 내려가지 않도록 제한
        if(this.yEnd < this.y) return;

        const additionalY = coreInst.noteSpeedMultiplier; // 롱노트가 체감상 더 빨리 끊김 보정

        // 본 노트 그리기 (롱 노트는 꼬리가 없을 예정)
        for(let idx=0; idx<=5; idx++) {
            ctx.beginPath();
            if(this.fill) {
                ctx.fillStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor(idx) + ', ' + this.getNowOpacity(coreInst) + ')');
                ctx.fillRect(coreInst.convertX(this.x - this.r + idx), coreInst.convertY(this.y - this.r + idx), coreInst.convertX((this.r * 2) - (idx * 2)), coreInst.convertY((this.yEnd - this.y) - (idx * 2) + additionalY));
            } else {
                ctx.strokeStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor(idx) + ', ' + this.getNowOpacity(coreInst) + ')');
                ctx.strokeRect(coreInst.convertX(this.x - this.r + idx), coreInst.convertY(this.y - this.r + idx), coreInst.convertX((this.r * 2) - (idx * 2)), coreInst.convertY((this.yEnd - this.y) - (idx * 2) + additionalY));
            }
        }

        // 키 표시 (중앙에 출력하며, 크기는 내부에 들어오도록 폰트 크기 계산해야 함)
        if(this.explosing < 2 && (! this.missed)) {
            let fontSize = coreInst.convertFontSize(Math.round(this.r / 1.1));
            ctx.font = 'bold ' + fontSize + 'px ' + coreInst.getRenderFontFamily();

            if(this.dark) ctx.fillStyle = coreInst.convertColor('rgba(200, 200, 200, ' + this.getNowOpacity(coreInst) + ')');
            else          ctx.fillStyle = coreInst.convertColor('rgba(80, 80, 80, ' + this.getNowOpacity(coreInst) + ')');

            ctx.textAlign = "center";
            ctx.fillText(this.key, coreInst.convertX(this.x), coreInst.convertY(this.y + (fontSize / 4.0), true)); // Note 중앙에 출력
        }
    }
}

/** 판정 글씨와 콤보 마크 */
class SSJudgeMark extends ShuttingStarsObject {
    /** @type {string|null} PERFECT / GREAT / GOOD / BAD / MISS */
    judgeResult = null;
    /** @type {number} 폭발 효과의 현재 진행 단계 */
    explosing = 1;
    /** @type {number} 폭발 효과의 마지막 진행 단계 */
    explosingMax = 32;
    /**
     * 인스턴스를 초기화합니다.
     * @param {ShuttingStarsCore} coreInst 게임 코어 객체
     * @param {string} judgeResult judgeResult 값
     */
    constructor(coreInst, judgeResult) {
        super(coreInst);
        this.judgeResult = judgeResult;
    }

    /**
     * draw 대상을 화면에 렌더링합니다.
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     * @param {ShuttingStarsCore} coreInst
     */
    draw(ctx, coreInst) {
        // explosing 에 따른 폰트 크기 조절
        let dynamicFontSize = 26;
        if(this.explosing >=  3) dynamicFontSize--;
        if(this.explosing >=  5) dynamicFontSize--;
        if(this.explosing >=  7) dynamicFontSize--;
        if(this.explosing >=  9) dynamicFontSize--;
        if(this.explosing >= 11) dynamicFontSize--;
        if(this.explosing >= 13) dynamicFontSize--;

        // 화면에 판정 결과 띄우기
        let fontSize = coreInst.convertFontSize(dynamicFontSize);
        ctx.font = 'bold ' + fontSize + 'px ' + coreInst.getJudgeFontFamily();

        let opa = this.getNowOpacity(coreInst);
        ctx.fillStyle = coreInst.convertColor('rgba(' + coreInst.judgeMarkColor(this.judgeResult) + ', ' + opa + ')');
        
        // 노트들 중앙에 출력
        let midX = 0;
        let midY = coreInst.getStageHeight() / 2;
        let notePlacers = coreInst.getNotePlacers();

        for(let idx=0; idx<notePlacers.length; idx++) {
            midX += notePlacers[idx].x;
        }
        midX = midX / notePlacers.length;

        ctx.fillText(this.judgeResult, coreInst.convertX(midX), coreInst.convertY(midY));

        let combo = coreInst.combo;
        if(this.judgeResult == 'MISS') combo = coreInst.missCombo;

        // 콤보 띄우기
        if(combo > 1) {
            fontSize = coreInst.convertFontSize(15);
            ctx.font = 'normal ' + fontSize + 'px ' + coreInst.getRenderFontFamily();
            if(this.judgeResult == 'MISS') {
                ctx.fillStyle = coreInst.convertColor('rgba(255, 0, 0, ' + opa + ')');
            } else {
                if(coreInst.dark) ctx.strokeStyle = coreInst.convertColor('rgba(230, 230, 230, ' + opa + ')');
                else ctx.fillStyle = coreInst.convertColor('rgba(80, 80, 80, ' + opa + ')');
            }
            ctx.fillText('COMBO ' + combo, coreInst.convertX(midX), coreInst.convertY(midY + 30)); // 판정 결과 아래에 출력
        }
    }

    /**
     * 폭발 진행 상태를 반영한 불투명도를 계산
     * @param {ShuttingStarsCore} coreInst
     * @returns {number} 현재 불투명도
     */
    modifyExplosiveOpacity(coreInst) {
        let opa = 0.9;
        if(this.explosing >= 3) opa -= 0.2;
        if(this.explosing >= 4) opa -= 0.3;
        if(this.explosing >= 5) opa -= 0.4;
        if(this.explosing >= 6) opa -= (0.03 * (this.explosing - 5));
        if(opa < 0) opa = 0;
        return opa;
    }

    /**
     * 현재 효과 진행 상태를 종합적으로 반영한 불투명도를 반환
     * @param {ShuttingStarsCore} coreInst
     * @returns {number} 현재 불투명도
     */
    getNowOpacity(coreInst) {
        let opa = this.modifyExplosiveOpacity(coreInst);
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
class SSMouseEventArea extends ShuttingStarsObject {
    constructor(coreInst) {
        super(coreInst);
    }
}

/** 장식용 상위 객체 */
class SSDecorationObject extends ShuttingStarsObject {
    /** @type {string} 폭발 효과가 정점일 때 사용할 색상 */
    peakColor = '255, 255, 255';
    /** @type {string} 장식 객체의 렌더링 우선순위 */
    priority = 'low';
    /**
     * 인스턴스를 초기화합니다.
     * @param {ShuttingStarsCore} coreInst 게임 코어 객체
     */
    constructor(coreInst) {
        super(coreInst);
    }
}

/** 장식용 별빛 객체 */
class SSStarlight extends SSDecorationObject {
    /**
     * 인스턴스 초기화
     * 
     * @param {ShuttingStarsCore} coreInst 게임 코어 객체
     */
    constructor(coreInst) {
        super(0);
        this.r = Math.round(ShuttingStarsUtility.random() * 3.0) + 1;
        this.x = Math.round(ShuttingStarsUtility.random() * coreInst.getStageWidth());
        this.y = Math.round(ShuttingStarsUtility.random() * coreInst.getStageHeight());
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

/** 클래스 이름 변경을 위한 임시 클래스 */
class Starlight extends SSStarlight {
    /**
     * 인스턴스 초기화
     * 
     * @param {ShuttingStarsCore} coreInst 게임 코어 객체
     */
    constructor(coreInst) { super(coreInst); }
}

/** 장식용 폭발 객체 */
class SSExplosingObject extends SSDecorationObject {
    /**
     * 인스턴스 초기화
     * @param {ShuttingStarsCore} coreInst 게임 코어 객체
     * @param {number} line 노트 레인의 인덱스
     * @param {number} y y 값
     * @param {string} color color 값
     * @param {string} peakColor peakColor 값
     */
    constructor(coreInst, line, y, color, peakColor) {
        super(coreInst);
        this.peakColor = '255, 255, 255';
        this.priority = 'high';
        this.r = coreInst.getNoteRadius();
        this.x = (this.r * 4) + Math.round(line * this.r * 2.5) + coreInst.getLeftMarginNote();
        this.y = y;
        this.key = coreInst.keyList[line];
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
     * @param {ShuttingStarsCore} coreInst
     */
    draw(ctx, coreInst) {
        ctx.beginPath();
        ctx.arc(coreInst.convertX(this.x), coreInst.convertY(this.y, true), coreInst.convertX(this.modifyExplosiveR()), 0, 2 * Math.PI);

        ctx.fillStyle = coreInst.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + this.getNowOpacity(coreInst) + ')');
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
     * @param {ShuttingStarsCore} coreInst
     * @returns {number} 현재 불투명도
     */
    modifyExplosiveOpacity(coreInst) {
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
class SSCorrectNoteExplosing extends SSExplosingObject {
    /**
     * 인스턴스를 초기화합니다.
     * @param {ShuttingStarsCore} coreInst 게임 코어 객체
     * @param {number} line 라인 번호
     * @param {number} y y 값
     * @param {string} color color 값
     * @param {string} peakColor peakColor 값
     */
    constructor(coreInst, line, y, color, peakColor) {
        super(coreInst, line, y, color, peakColor);
        this.r = Math.round(this.r * 1.2);
    }
}

/** 노트 미스 폭발 효과 */
class SSFailExplosing extends SSExplosingObject {
    /**
     * 인스턴스 초기화
     * @param {ShuttingStarsCore} coreInst 게임 코어 객체
     * @param {number} line 라인 번호
     * @param {number} y y 값
     * @param {string} color color 값
     * @param {string} peakColor peakColor 값
     */
    constructor(coreInst, line, y, color, peakColor) {
        super(coreInst, line, y, color, peakColor);
        this.r = Math.round(this.r * 1.2);
    }
}

/** 게임오버 최종 폭발 효과 */
class SSPlanetExplosing extends SSExplosingObject {
    /**
     * 인스턴스 초기화
     * @param {ShuttingStarsCore} coreInst 게임 코어 객체
     * @param {number} line 라인 번호
     * @param {number} y y 값
     * @param {string} color color 값
     * @param {string} peakColor peakColor 값
     */
    constructor(coreInst, line, y, color, peakColor) {
        super(coreInst, line, y, color, peakColor);
    }
}

/** 마우스 클릭 표시 */
class SSMouseClickHighlighter extends SSExplosingObject {
    /**
     * 인스턴스를 초기화합니다.
     */
    constructor(coreInst) {
        super(coreInst, 0, 0, '255,255,255', '255,255,255');
    }
}

/** 텍스트 출력 장식 */
class SSTextDeco extends SSDecorationObject {
    /** @type {string} 화면에 출력할 텍스트 */
    text = '';
    /** @type {number} 텍스트 렌더링에 사용할 글꼴 크기 */
    fontSize = 10;
    /** @type {string} 텍스트의 수평 정렬 방식 */
    align = 'center';
    /**
     * 인스턴스를 초기화합니다.
     * @param {ShuttingStarsCore} coreInst 게임 코어 객체
     * @param {string} text text 값
     * @param {number} x x 값
     * @param {number} y y 값
     * @param {number} fontSize fontSize 값
     * @param {CanvasTextAlign} align align 값
     * @param {string} color color 값
     */
    constructor(coreInst, text, x, y, fontSize, align, color) {
        super(coreInst, 0);
        this.key = coreInst.keyList[0];
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
     * 폭발 진행 상태를 반영한 불투명도를 계산
     * @param {ShuttingStarsCore} coreInst
     * @returns {number} 현재 불투명도
     */
    modifyExplosiveOpacity(coreInst) {
        let opa = 0.9;
        if(this.explosing >= 3) opa -= 0.2;
        if(this.explosing >= 4) opa -= (0.02 * (this.explosing - 3));
        if(opa < 0) opa = 0;
        return opa;
    }

    /**
     * 현재 효과 진행 상태를 종합적으로 반영한 불투명도를 반환
     * @param {ShuttingStarsCore} coreInst
     * @returns {number} 현재 불투명도
     */
    getNowOpacity(coreInst) {
        let opa = this.modifyExplosiveOpacity(coreInst);
        this.opacity = opa;
        return opa;
    }

    /**
     * draw 대상을 화면에 렌더링
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     * @param {ShuttingStarsCore} coreInst
     */
    draw(ctx, coreInst) {
        this.ctx.textAlign = this.align;
        this.ctx.fillStyle = this.convertColor('rgba(' + this.color + ', ' + this.getNowOpacity(coreInst) + ')');
        this.ctx.fillText(this.text, this.convertX(this.x), this.convertY(this.y));
    }
}

/** 가상 키 객체 */
class SSVirtualKey extends SSDecorationObject {
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
     * @param {ShuttingStarsCore} coreInst 게임 코어 객체
     * @param {string} key 입력 또는 해제된 키
     */
    constructor(coreInst, key) {
        super(coreInst);

        const charUnitW = (this.fontSize * 2) + this.wGap;
        const charUnitH = (this.fontSize * 2) + this.hGap;
        const charUnitWP = Math.round(charUnitW * 1);
        const charUnitHP = Math.round(charUnitH * 1.5);

        this.key = key;
        this.shape = 'circle';
        this.x = 0;
        this.y = Math.round(coreInst.getStageHeight() - (coreInst.getStageHeight() / 9.0));
        this.r = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.opacity = 0.9;
        if(coreInst.dark) {
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
        this.fontSize = coreInst.convertFontSize(this.fontSize);
        this.x = Math.round((coreInst.getStageWidth() / 2.0) - (charUnitW * 3.0));
        this.r = Math.round(charUnitW / 2.0);

        if(this.key == coreInst.keyList[0]) { // S
            this.y -= charUnitH;
        } else if(this.key == coreInst.keyList[1]) { // D
            this.x += charUnitWP;
            this.y -= charUnitH;
        } else if(this.key == coreInst.keyList[2]) { // F
            this.x += (charUnitWP * 2);
            this.y -= charUnitH;
        } else if(this.key == coreInst.keyList[3]) { // H
            this.x += (charUnitWP * 3);
            this.y -= charUnitH;
        } else if(this.key == coreInst.keyList[4]) { // J
            this.x += (charUnitWP * 4);
            this.y -= charUnitH;
        } else if(this.key == coreInst.keyList[5]) { // K
            this.x += (charUnitWP * 5);
            this.y -= charUnitH;
        } else if(this.key == coreInst.arrowKeys[0]) { // UP
            this.x = Math.round(coreInst.getStageWidth()  * 2.0 / 4.0);
            this.y = Math.round(coreInst.getStageHeight() * 9.0 / 10.0) - charUnitH;
        } else if(this.key == coreInst.arrowKeys[1]) { // DOWN
            this.x = Math.round(coreInst.getStageWidth()  * 2.0 / 4.0);  // UP과 동일
            this.y = Math.round(coreInst.getStageHeight() * 9.0 / 10.0); // UP보다 한 칸 아래
        } else if(this.key == coreInst.arrowKeys[2]) { // LEFT
            this.x = Math.round(coreInst.getStageWidth()  * 2.0 / 4.0) - charUnitW;  // DOWN 보다 한 칸 왼쪽
            this.y = Math.round(coreInst.getStageHeight() * 9.0 / 10.0);
        } else if(this.key == coreInst.arrowKeys[3]) { // RIGHT
            this.x = Math.round(coreInst.getStageWidth()  * 2.0 / 4.0) + charUnitW;  // DOWN 보다 한 칸 오른쪽
            this.y = Math.round(coreInst.getStageHeight() * 9.0 / 10.0);
        } else if(this.key == coreInst.escKey) {
            this.x = Math.round(coreInst.getStageWidth()   * 9.0 / 10.0);
            this.y = Math.round(coreInst.getStageHeight()  * 1.0 / 10.0) + charUnitH;
        } else if(this.key == coreInst.enterKey) {
            this.x = Math.round(coreInst.getStageWidth()   * 9.0 / 10.0);
            this.y = Math.round(coreInst.getStageHeight()  * 1.0 / 10.0);
        }
    }
    /**
     * 폭발 진행 상태를 반영한 불투명도를 계산
     * @param {ShuttingStarsCore} coreInst
     * @returns {number} 현재 불투명도
     */
    modifyExplosiveOpacity(coreInst) {
        return this.opacity * (1.0 - (this.explosing * 1.0 / this.explosingMax));
    }
    /**
     * 현재 효과 진행 상태를 종합적으로 반영한 불투명도를 반환
     * @param {ShuttingStarsCore} coreInst
     * @returns {number} 현재 불투명도
     */
    getNowOpacity(coreInst) {
        return this.modifyExplosiveOpacity(coreInst);
    }
    /**
     * draw 대상을 화면에 렌더링
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     * @param {ShuttingStarsCore} coreInst
     */
    draw(ctx, coreInst) {
        if(! coreInst.virtualKey) return;
        if(coreInst.state == 'title' || coreInst.state == 'songtitle') return;

        super.draw(ctx, coreInst);

        // 중앙에 가상키 글자를 찍기
        //    먼저 글자 컬러 세팅
        if(coreInst.dark) {
            ctx.fillStyle = coreInst.convertColor('rgba(0, 0, 0, ' + this.getNowOpacity(coreInst) + ')');
        } else {
            ctx.fillStyle = coreInst.convertColor('rgba(255, 255, 255, ' + this.getNowOpacity(coreInst) + ')');
        }
        //    글자 폰트 세팅
        ctx.font = 'bold ' + this.fontSize + 'px ' + coreInst.getRenderFontFamily();

        let label = this.key;
        if(     label == 'ARROWUP'   ) label = '▲';
        else if(label == 'ARROWDOWN' ) label = '▼';
        else if(label == 'ARROWLEFT' ) label = '◀';
        else if(label == 'ARROWRIGHT') label = '▶';
        else if(label == 'ENTER'     ) label = 'ENT';
        else if(label == 'ESCAPE'    ) label = 'ESC';

        //    출력
        ctx.textAlign = 'center';
        ctx.fillText(label, coreInst.convertX(this.x), coreInst.convertY(this.y) + coreInst.convertY(this.fontSize / 4.0));
    }
}

/** 재화를 통해 활성화 / 사용 선택 가능한 대상 */
class SSBonusProduct {
    /** @type{string} name : 상품의 이름 (전체가 고유해야 함) */
    name = '';

    /** @type{boolean} availiability : 사용 가능 여부 (게임 동작 중 변경되는 값) */
    availiability = true;

    /**
     * 인스턴스를 초기화합니다.
     * @type{string} name
     */
    constructor(name) { if(name) this.name = String(name); }
}

/** 2D 오디오 시각화 공통 클래스 */
class SSAudio2DVisualizer extends SSBonusProduct {
    /** @type {number} 시각화 각 필드 길이 배수 */
    sizeMultiplier = 4;
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
     * @type{string} name
     */
    constructor(name) { super(name); }
    /**
     * draw 대상을 화면에 렌더링
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     * @param {ShuttingStarsCore} coreInst
     * @param {number} canvasWidth canvasWidth 값
     * @param {number} canvasHeight canvasHeight 값
     * @param {Uint8Array} realtimeAudioBuffer realtimeAudioBuffer 값
     * @param {number} realtimeAudioBufferLength realtimeAudioBufferLength 값
     * @param {number} elapsedTime 게임 진행 시간
     * @param {number} hp 현재 HP
     */
    draw(ctx, coreInst, canvasWidth, canvasHeight, realtimeAudioBuffer, realtimeAudioBufferLength, elapsedTime, hp) {
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
class BarTypeSSAudio2DVisualizer extends SSAudio2DVisualizer {
    /**
     * 인스턴스 초기화
     */
    constructor() { super('CLASSIC VISUALIZER'); }
    /**
     * draw 대상을 화면에 렌더링합니다.
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     * @param {ShuttingStarsCore} coreInst
     * @param {number} canvasWidth canvasWidth 값
     * @param {number} canvasHeight canvasHeight 값
     * @param {Uint8Array} realtimeAudioBuffer realtimeAudioBuffer 값
     * @param {number} realtimeAudioBufferLength realtimeAudioBufferLength 값
     * @param {number} elapsedTime 게임 진행 시간
     * @param {number} hp 현재 HP
     */
    draw(ctx, coreInst, canvasWidth, canvasHeight, realtimeAudioBuffer, realtimeAudioBufferLength, elapsedTime, hp) {
        this.calculateColor(elapsedTime, hp);
        let x = 0;

        // 막대그래프형
        const barWidth = Math.round(canvasWidth * 1.0 / realtimeAudioBufferLength) * this.sizeMultiplier * coreInst.visualizeBarMultiplier;
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
class CircleTypeSSAudio2DVisualizer extends SSAudio2DVisualizer {
    /** @type {number} 원형 시각화의 기준 반지름 */
    radius = 50;
    /**
     * 인스턴스 초기화
     */
    constructor() { super('CIRCULAR VISUALIZER'); }
    /**
     * draw 대상을 화면에 렌더링합니다.
     * @param {CanvasRenderingContext2D} ctx 렌더링에 사용할 2D 컨텍스트
     * @param {ShuttingStarsCore} coreInst
     * @param {number} canvasWidth canvasWidth 값
     * @param {number} canvasHeight canvasHeight 값
     * @param {Uint8Array} realtimeAudioBuffer realtimeAudioBuffer 값
     * @param {number} realtimeAudioBufferLength realtimeAudioBufferLength 값
     * @param {number} elapsedTime 게임 진행 시간
     * @param {number} hp 현재 HP
     */
    draw(ctx, coreInst, canvasWidth, canvasHeight, realtimeAudioBuffer, realtimeAudioBufferLength, elapsedTime, hp) {
        this.calculateColor(elapsedTime, hp);
        // 중앙 위치
        const centerX = canvasWidth  / 2;
        const centerY = canvasHeight / 2;
        const starts  = Math.floor(elapsedTime / 10.0);

        for(let i=0; i<realtimeAudioBufferLength - 32; i++) {
            // 방향
            const angle = ((i + starts) / (realtimeAudioBufferLength - 32)) * Math.PI * 2; 

            // 막대의 시작점과 끝점
            const x1 = Math.floor(centerX + Math.cos(angle) * this.radius);
            const y1 = Math.floor(centerY + Math.sin(angle) * this.radius);
            const x2 = Math.floor(centerX + Math.cos(angle) * (this.radius + (Math.random() * 50 + 100) + (realtimeAudioBuffer[i] * this.sizeMultiplier * coreInst.visualizeBarMultiplier) / 3));
            const y2 = Math.floor(centerY + Math.sin(angle) * (this.radius + (Math.random() * 50 + 100) + (realtimeAudioBuffer[i] * this.sizeMultiplier * coreInst.visualizeBarMultiplier) / 3));

            ctx.strokeStyle = 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.opacity + ')';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }
}

/** Note 모양 테마 */
class SSNoteTheme extends SSBonusProduct {
    constructor(name) { super(name); }
    /**
     * Note 그리기
     * @param {CanvasRenderingContext2D} ctx
     * @param {ShuttingStarsCore} coreInst 
     * @param {SSNote} noteObject 
     */
    draw(ctx, coreInst, noteObject) {  noteObject.draw(ctx, coreInst);  }
}

/********************** 외부에서 호출할 수 있는 객체 및 함수 구현 ************************/
class ShuttingStarsManager {
    #originalInstances = null;
    constructor(originalInst) {
        this.#originalInstances = originalInst;
    }

    /**
     * 게임 코어 초기화 전 호출할 함수 (훅) 입력
     * 
     * @param {Function} funcObj 게임 코어 초기화 전 호출할 함수, 함수의 매개변수로 설정값 변경을 위한 브로커 객체가 입력됨.
     */
    setBeforeInitializeHook(funcObj) {
        this.#originalInstances.rebuildBroker();
        this.#originalInstances.fBeforeInit = funcObj;
    }

    /**
     * 게임 코어 초기화 후 호출할 함수 (훅) 입력
     * 
     * @param {Function} funcObj 게임 코어 초기화 후 호출할 함수, 함수의 매개변수로 설정값 변경을 위한 브로커 객체가 입력됨.
     */
    setAfterInitializeHook(funcObj) {
        this.#originalInstances.rebuildBroker();
        this.#originalInstances.fAfterInit = funcObj;
    }

    /** 스트링 테이블 설정 */
    setStringTable(tableObj) {
        this.#originalInstances.stringTable = tableObj;
    }

    /** 스트링 테이블 수정 (겹치는 내용 덮어쓰기 방식) */
    updateStringTable(tableObj) {
        this.#originalInstances.updateStringTable(tableObj);
    }

    /**
     * 게임의 곡 목록에 곡을 추가
     * @param {ShuttingStarsSong} song 추가할 곡
     * @returns {ShuttingStarsSong} 실제로 목록에 추가된 곡 객체
     */
    addSong(song) {
        this.#originalInstances.addSong(song);
    }

    /** 
     * 로딩된 곡 정보 전체 반환 (복제해 반환) 
     * @param {function(object):boolean} fFilter 곡 필터링 함수, 선택사항으로, 사용하려면 함수를 넣어야 하며, 첫 번째 매개변수로 들어오는 곡 객체를 통해 필터링 가능. 반환값이 true이면 포함, false이면 제외, 매개변수 첫 번째로 곡 정보가, 두 번째로 Broker 객체가 들어옴
     * @returns {Array<object>} 로딩된 곡 정보 전체 (Plain Object 형태의 배열로 반환)
    */
    getAllSongData(fFilter) {
        return this.#originalInstances.getAllSongData(fFilter);
    }

    /** 
     * 로딩된 곡 정보 전체 반환 (복제해 반환) 
     *     로딩 절차까지 포함
     * @param {string} urlCtx 현재 웹 경로의 URL Context
     * @param {function(object):boolean} fFilter 곡 필터링 함수, 선택사항으로, 사용하려면 함수를 넣어야 하며, 첫 번째 매개변수로 들어오는 곡 객체를 통해 필터링 가능. 반환값이 true이면 포함, false이면 제외, 매개변수 첫 번째로 곡 정보가, 두 번째로 Broker 객체가 들어옴
     * @returns {Promise<Array<object>>} 로딩된 곡 정보 전체 (Plain Object 형태의 배열로 반환)
    */
    async getAllSongPromise(urlCtx, fFilter) {
        return await this.#originalInstances.getAllSongPromise(urlCtx, fFilter);
    }

    /**
     * 3D 매니저 객체를 등록하거나 해제 (Promise)
     * @param {ShuttingStars3DManager|null} obj 등록할 3D 매니저. null이면 현재 매니저를 해제
     * @returns {Promise<*>}
     */
    async set3DManager(ss3d) {
        await ShuttingStarsUtility.waitTime(1000);
        this.#originalInstances.set3DManager(ss3d);
    }

    /**
     * JSON 객체 리터럴 (Plain Object) 을 받아 ShuttingStarsState 로 변환
     * 
     * @param {object|string|ShuttingStarsState} obj 
     */
    parseStateInstance(obj) {
        if(obj == null) return null;
        if(obj instanceof ShuttingStarsState) return obj;
        return new ShuttingStarsState(obj);
    }

    /**
     * 임의의 상태를 등록
     * 
     * @param {object|string|ShuttingStarsState} obj 
     */
    registerState(obj) {
        const parsedState = this.parseStateInstance(obj);
        if(parsedState == null) return;
        this.#originalInstances.states.push(parsedState);
    }

    /**
     * 곡 바로 플레이 / 감상
     * 
     * @param {*} song 해당 곡 (객체 자체, 혹은 곡의 serial 코드)
     * @param {number} difficultyLevel 난이도 (1~15 사이 정수)
     * @param {boolean} listen 감상 여부
     */
    async playSong(song, difficultyLevel, listen) {
        await this.#originalInstances.playSong(song, difficultyLevel, listen);
    }

    /**
     * 곡 선택 화면으로 이동하며 바로 해당 곡 선택 상태로 전환
     * @param {*} song 선택할 곡 serial (string) 혹은 곡 자체 (ShuttingStarsSong 타입)
     * @returns {Promise<*>}
     */
    async directSelectSong(song) {
        await this.#originalInstances.directSelectSong(song);
    }

    /**
     * 백엔드 접근 객체 반환
     */
    getBackendBroker() {
        if(! this.#originalInstances.backend) return null;
        return getSSBackendBroker(this.#originalInstances.backend);
    }

    /** Core 디버그 모드 켜기 */
    startCoreDebug() {
        this.#originalInstances.coreDebugMode = true;
        window._sscoreinstances = this.#originalInstances;
        window._sscore = this.#originalInstances;
        return this.#originalInstances;
    }

    /** 빌드 번호 반환 */
    build() {
        return this.#originalInstances.build;
    }

    /**
     * 게임 사용 중단, 초기화 이전으로 되돌림
     */
    destroy() {
        this.#originalInstances.destroy();
    }

    /**
     * 지정한 영역에 ShuttingStars 게임 적용 (Promise)
     * @param {HTMLElement|null} mainDiv 게임 캔버스를 배치할 DOM 요소
     * @param {string|null} urlContext 리소스 URL의 기준 경로
     * @param {null|function(object):void} fCustom fCustom 일부 속성을 커스텀하고 싶을 때 사용, 선택사항으로, 사용하려면 함수를 넣어야 하며,첫 번째 매개변수로 들어오는 broker 객체를 통해 설정 커스텀 가능.이 함수는 fBeforeInit 과 fAfterInit 사이에 호출됨
     * @returns {Promise<*>}
     */
    async init(mainDiv, urlContext, fCustom) {
        try { return await this.#originalInstances.init(mainDiv, urlContext, fCustom); } catch(e) { ShuttingStarsUtility.toast('ERROR : ' + e, true); console.error(e); }
    }
}

const ShuttingStars = new ShuttingStarsManager(_shuttingstarcore);

/** 
 * 브라우저 콘솔 로딩, 미지원 브라우저 안내를 위함 
 * @param {string} msg
*/
function ssConsoleLogs(msg) {
    ShuttingStarsUtility.log(msg);
}

/**
 * 게임의 곡 목록에 곡을 추가
 * @param {ShuttingStarsSong} song 추가할 곡
 * @returns {ShuttingStarsSong} 실제로 목록에 추가된 곡 객체
 */
function addShuttingStarSong(song) {
    return ShuttingStars.addSong(song);
}

/**
 * 3D 매니저 객체를 등록하거나 해제 (Promise)
 * @param {ShuttingStars3DManager|null} obj 등록할 3D 매니저. null이면 현재 매니저를 해제
 * @returns {Promise<*>}
 */
function setShuttingStar3D(obj) {
    return ShuttingStars.set3DManager(obj);
}

/**  window 객체 내에 ShuttingStars Core 객체 삽입 (비권장) */
function prepareDebugSSCoreInstances() {
    _shuttingstarcore.coreDebugMode = true;
    window._sscoreinstances = _shuttingstarcore;
    window._sscore = _shuttingstarcore;
}

/**
 * 지정한 영역에 ShuttingStars 게임 적용 (Promise)
 * @param {HTMLElement|null} mainDiv 게임 캔버스를 배치할 DOM 요소
 * @param {string|null} urlContext 리소스 URL의 기준 경로
 * @param {null|function(object):void} fCustom fCustom 일부 속성을 커스텀하고 싶을 때 사용, 선택사항으로, 사용하려면 함수를 넣어야 하며,첫 번째 매개변수로 들어오는 broker 객체를 통해 설정 커스텀 가능.이 함수는 fBeforeInit 과 fAfterInit 사이에 호출됨
 * @returns {Promise<*>}
 */
async function initShuttingStars(mainDiv, urlContext, fCustom) {
    await ShuttingStars.init(mainDiv, urlContext, fCustom);
}

window.ShuttingStars = ShuttingStars;
window.ssmanager     = ShuttingStars;
window.SSUtil        = ShuttingStarsUtility;
window.ssutil        = ShuttingStarsUtility;

export { ShuttingStars, ShuttingStarsUtility, SSUtil, ShuttingStarsCore, ShuttingStars3DManager, ShuttingStars3DObject, ShuttingStarsSong, CustomSSSong, SSNoteCommon, SSNote, SSLongNote, SSVirtualKey, initShuttingStars, addShuttingStarSong, setShuttingStar3D, ssConsoleLogs, prepareDebugSSCoreInstances };