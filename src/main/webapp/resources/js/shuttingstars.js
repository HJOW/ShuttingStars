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
    build = 1;
    
    resolution = {w : 1280, h : 720}; // 렌더링 해상도, 화면 출력 품질을 결정함, 최소 크기 : 1280 720
    ressets    = {w : 1280, h : 720}; // 해상도의 설정값 (기기 방향과 관계없이 더 긴 길이가 w)
    stageSize  = {w : 1280, h : 720}; // 게임 내 무대의 절대크기, 해상도와는 별도로, 게임 내 객체들의 위치의 범위

    backend = null;

    virtualKey = false;      // 가상 키 출력 여부
    virtualKeyNone = false;  // 가상 키 강제 비활성화 옵션 (init 에서만 효과가 있음)
    virtualKeyForce = false; // 가상 키 강제 활성화 옵션 (init 에서만 효과가 있음, virtualKeyNone 보다 우선순위 낮음)

    fontSizeRatio = 1.0; // 글꼴 크기 비율 (해상도와 별도)
    canvasZindex = 1;    // canvas 태그의 z-index

    rootDiv = null;
    pops = {
        root : null,
        dim : null,
        config : null,
        login : null,
        join : null
    };
    
    createMode = false; // 곡 생성 모드, 키보드 컨트롤 불가

    dark = true;             // 다크 모드 (기본)
    reverseVertical = false; // 수직 반전
    
    keyList = ['S', 'D', 'F', 'H', 'J', 'K']; // 입력 키
    arrowKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT'];
    enterKey = 'ENTER';
    escKey = 'ESCAPE';
    
    keyEventDisabled = false;

    fontFamily = 'D2Coding'; // 메인 폰트, alterFonts 가 뒤에 붙음
    pointFont  = 'NanumMyeongjo'; // 강조할 일이 있을 때 fontFamily 대신 사용되는 폰트, alterFonts 가 뒤에 붙음
    alterFonts = 'NanumGothicCoding NanumGothic'; // 대체 폰트, 여러 개 지정 시 뒤쪽에 한 칸 띄고 다음 폰트를 기재하면 된다.

    canvas = null;    // 캔버스 객체 (메인 게임 동작)
    canvas3d = null;  // 3D 장식 출력용 캔버스 객체
    configDiv = null; // 상세 설정 영역

    ctx = null;       // 2D Context 객체
    ss3d = null;      // ShuttingStars3DManager 객체
    disable3d = true; // true 지정 시 3D 렌더링하지 않음

    audioCtx = null; // Audio Context 객체 (미지원 시 null 유지)
    urlCtx = './';   // URL Context Path

    frameTime = 10;                // render 호출 주기 (변경 불가)
    timeMultiplier = 32.0;         // 노트의 촘촘함 최대값으로, 8로 지정 시 8배속 속도의 폭타까지 등장할 수 있다는 것을 의미 (변경 불가)
    stageRows = 72;                // 스테이지의 세로를 N등분하여 패턴의 시간과 매칭 (변경 불가)
    sizeFixedConst = 2;            // 노트 크기 상수 (변경 불가)
    noteLocationConst = 0;         // 노트 위치 보정 상수 (변경 불가)
    noteSpeedFixedConst = 0.25;    // 노트 이동 속도 배수 (변경 불가)
    resumeDelayTime = 16;          // 일시정지 후 재개 전 대기 타임 (변경 불가)
    songTitleBaseTime = 120;       // 곡 로딩 기본 시간 (변경 불가)
    volumeMultiplier = 1.0;        // 볼륨 상수 (변경 불가)
    visualizeBarMultiplier = 2.2;  // 시각화 각 필드 길이 배수 (변경 불가)
    backStarlightCount = 20;       // 배경 별빛 장식 갯수

    noticeEn   = ''; // 공지사항 (영문)
    noticeKo   = ''; // 공지사항 (한글)
    noticeWhen = 0;  // 마지막 공지사항 게시일시 (백엔드 필요)
    
    margins = { // 여백 (빈 공간)
        page  : { left :  0, top : 0 },
        stage : { left :  0, top : 0 },
        note  : { left : 20, top : 0 }
    };

    volume = 1.0; // 마스터 볼륨 (0 ~ 1)
    volumeBackgroundDefault = 0.2; // 배경 음악 기본 볼륨
    noteSpeedMultiplier = 1.0;     // 노트 이동 속도 배수 (사용자가 지정 가능)
    useAudioVisualizer = true;     // 시각화 사용여부

    volumeBackground = 1.0; // 배경음악 볼륨 (게임 진행 중 변경됨)
    volumeSongAudio  = 1.0; // 플레이 곡 볼륨 (게임 진행 중 변경됨)
    volumeBackgroundSpeed = 0; // 배경음악 볼륨 페이드 인/아웃 속도값 (음수일 때는 volumeBackground 값이 감소하며 0 이하가 되면 멈춤, 양수일 때는 값이 증가하며 1 이상이 되면 멈춤)

    lastObjectId = 0;    // 객체 ID 부여용 카운터
    objects = [];        // 항상 렌더링 대상인 객체들 (주로 장식)
    objectsPlaying = []; // 상태가 playing 중일 때 렌더링 대상 객체들 (NotePlacer, Note 등 주요 게임 구성요소)
    object3ds = [];      // 항상 렌더링 대상인 3D 객체들 (장식, ShuttingStars3DObject 타입만 원소로 입력해야 함)
    notePlacers = [];    // NotePlacer 객체들 보관 (objectsPlaying 와 중복 보관)

    elapsedTime = 0;      // 진행 시간 (실제 시간과 단위가 다르며, 곡의 BPM 반영으로 곡마다 속도가 다름, 곡의 패턴 배열의 N번째 숫자에 해당)
    simultaneousTime = 0; // 진행 시간 (곡과 관련 없이 동시 처리 횟수)
    titleDelayTime = 0;   // 상태가 playing 일 때도 songtitle 화면을 띄우는 시간

    usingWorker = true; // Worker 사용여부
    timeProgressKey = null; // 시간 진행 타이머 키가 들어가는 변수
    titleScreenWaiting = false; // 상태가 title 이면서 로딩은 끝났음을 나타내는 변수

    workerRender = null;
    workerSongPlaying = null;
    workerSimultaneousWork = null;

    point = 0;     // 점수
    combo = 0;     // 콤보
    maxCombo = 0;  // 최대 콤보
    missCombo = 0; // 미스 콤보
    report = {
        PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0 // 각 판정별 통계
    };
    hp = 100.0; // 다 깎이면 게임 오버 (gameOverEnabled 를 true 지정 시)
    
    selectRecordType = 'local'; // local / internet
    selectedRecordIndex = -1; // 기록 조회 화면에서 사용
    selectedRecordList = []; // 기록 조회 화면 들어갈 때 탑재됨
    seeingRecord = null; // 기록 조회 시 해당 기록 JSON 객체 탑재

    gameOverEnabled = true;  // true 시 hp 0 이면 게임 오버, false 시 일단 곡 끝까지 진행은 가능
    gameOverDelayed = false; // hp 가 한번이라도 0 이하로 내려간 경우 true

    state = 'title'; // 현재 상태, title / menu / songchoosing / songtitle / playing / gameover / result / setting / credit

    mode = 'default'; // default / mission
    song = null; // 현재 플레이 중인 곡, ShuttingStarsSong 객체
    songs = [];  // 불러온 곡들, ShuttingStarsSong 객체 배열
    songDisplays = []; // 선택 가능한 곡들, ShuttingStarsSong 객체 배열, songs 과 다른 점은 디버그 모드에 따른 노출 여부
    missions = []; // 특수한 곡들 (mission 모드일 때 선택)
    songChoosingMode = 'default'; // default / mission

    difficulty = null; // 선택된 난이도
    audio = null;      // 현재 선택된 곡의 오디오 객체
    songThumb = null;  // 현재 선택된 곡의 썸네일 이미지 URL
    videoBga = null;   // 현재 선택된 곡의 BGA URL
    songBitGap = 0;    // 현재 선택된 곡의 1사이클 길이 (bpm에 따라 다름)
    songLastPatternTime = 0; // 현재 선택된 곡의 마지막 패턴의 시간
    audioSource = null; // 시각화를 위한 변수 중 하나

    audioAnalyser = null; // Audio Analyser 객체 (미지원 시 null 유지)
    audioBufferLen = 0;   // Audio 시각화에 쓰일 배열 크기
    audioBuffer = null;   // Audio 시각화에 쓰일 배열

    songChoosing = null; // 현재 선택된 곡, ShuttingStarsSong 객체로 songs 목록에 있어야만 함
    missionChoosing = null;
    difficultyChoosing = false; // 곡 선택은 됐고 난이도를 선택하고 있는 상황임을 표시
    difficultyChoosingList = [];// 매번 배열 추출할 수는 없으니 난이도 목록을 임시로 넣어두는 배열

    audioBackground = null; // 플레이 곡이 아닌, 배경 곡
    audioBackgroundPlaying = false;

    se = { // 효과음 (Audio 객체를 원소로 함)
        tick : null
    }

    songTitleTime = 0; // 선택된 곡 준비 중 화면 남은 시간
    gameoverTime = 0; // 게임 오버 마크 화면 남은 시간
    resumingTime = 0; // 일시정지 후 재개 전 대기 시간

    paused = false;
    resumed = false; // 일시정지 재개 전 대기시간 완료 시 임시로 사용하는 값
    simultaneousWorkCycle = 0;

    officialSongSerials = [
        'nai4ilaHbn7g93gn34nf9afn438zJ93f8gp34qgD39p4g',
        'nai4ilaHbwgwgnoimomwenofnJ93f8gp34qgD39p4g'
    ];

    colorManualAlpha = false;

    menuList = ['play', 'records', 'setting', 'credit'];
    menuListDynamic = []; // 위 menuList 에 데이터가 추가됨
    menuChoosing = null;

    settingList = ['fixKeypressTiming', 'fixSongTiming', 'setNoteSpeedMultiplier', 'setGraphicQuality', 'resetAll'];
    settingChoosing = null;
    settingModifyingMode = false;
    settingsGraphicQuality = ['LOW', 'MEDIUM', 'HIGH'];
    settingGraphicQualityChoosing = null;
    settingResetReask = false;

    keypressTiming = 0; // 키 입력 추가 딜레이 보정값
    songTiming = 0; // 음원 재생 딜레이 보정값

    keypressing = {}; // 키 누르는 중 중 여부 기록 (키에서 손가락 떼면 제거할 요량)
    playPrepared = false; // 게임 시작 준비여부

    // 렌더링 디버그 모드, true 시 JSON 객체를 objects 에 넣어 임의의 도형 추가 가능, 예: {type : 'circle', x: 100, y : 100, r : 10, color : 'rgb(255, 255, 255)'}
    renderDebugMode = false;
    // 스트링 테이블 디버그 모드, 번역 가능 키워드가 화면에 나올 때마다 콘솔에도 출력
    stringTableDebugMode = true;
    // 키보드 입력 디버그 모드
    keyInputDebugMode = false;
    keyReleaseDebugMode = false;
    // 마우스 클릭 디버그 모드
    mouseClickDebugMode = false;
    // init 디버그 모드
    initDebugMode = false;
    // 테스트 곡 노출 여부
    songDebugMode = false;
    // 시간 소요 출력 여부
    timeElapseDebugMode = false;
    // 시각화 중 피크치 디버깅
    visualizePeakDebugMode = false;

    // 시각화 피크치 디버깅 데이터
    visualizePeakDebugRecordTime = 0;
    visualizePeakDebugShortestTime = 2; // 얼마나 시간을 촘촘하게 측정할 것인지 지정
    visualizePeakDebugAvgtGap = 10; // 이 시간 동안의 평균을 측정
    visualizePeakDebugData = [];
    
    // 마우스 이벤트 처리기
    mouseEvents = [];

    // 배경 이미지 URL, BASE64 가능, 입력 시 화면 맨 뒤에 이미지를 바탕화면처럼 출력하고 그 위에 렌더링
    backgroundImage = null;

    // 크레딧 출력 목록
    creditContents = [];
    creditIndex = 0; // 현재 출력 중인 순번
    creditIndexIncreases = 0; // creditIndex 증가속도를 줄이기 위한 수단
    creditIndexIncreaseMax = 100;

    // 언어
    language = 'en';
    languageDefault = true; // 기본 플랫폼 언어 사용여부
    // 언어 번역 테이블
    stringTable = {
        'ko' : {}
    };

    metricSize1 = 20;
    metricSize2 = 15;
    metricSize3 = 30;

    // 불러온 플러그인 목록
    pluginApplied = [];

    // init 에서 마지막으로 성공한 작업 메시지 (디버그 목적)
    lastInitSuccessMessage = '';

    // 브라우저 영역 크기 감지 함수 (외부에서 변경해야 할 일이 있음)
    fOuterWidth  = function() { return window.outerWidth;  }
    fOuterHeight = function() { return window.outerHeight; }
    fBeforeInit  = function(obj) {  }
    fAfterInit   = function(obj) {  }

    constructor() {}
    
    /** 초기화 (게임이 출력될 div 영역 객체를 입력) */
    init(rootDiv) {
        const selfs = this;
        try {
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
            this.titleScreenWaiting = false;
            this.logInit('init started');
            try { this.fBeforeInit(this); this.logInit('fBeforeInit end.'); } catch(exSelf) { console.error(exSelf); this.logInit('fBeforeInit failed. ' + exSelf); }
            
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
                    <canvas class='shuttingstars_canvas'></canvas>   
                    <canvas class='shuttingstars_canvas_3d'></canvas>
                    <div class='shuttingstars_pop_root'></div>
                </div>                                     
            `;
            rootDiv.innerHTML = htmls;
            this.rootDiv = rootDiv;
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
                .shuttingstar_configlayer { margin-left: 2rem; margin-top: 2rem; font-size: 2rem; line-height: 2rem; padding: 20px 20px 20px 20px; }
                .shuttingstar_configlayer input, .shuttingstar_configlayer select, .shuttingstar_configlayer button { font-size: 2rem; line-height: 2rem; }
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
                canvas.style.minWidth  = '1280px';
                canvas.style.minHeight = '720px';
                canvas3d.style.minWidth  = '1280px';
                canvas3d.style.minHeight = '720px';
            } else {
                canvas.style.minWidth  = '720px';
                canvas.style.minHeight = '1280px';
                canvas3d.style.minWidth  = '720px';
                canvas3d.style.minHeight = '1280px';
            }
            canvas.style.zIndex = this.canvasZindex;
            canvas3d.style.zIndex = this.canvasZindex+1;
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

            // 가상 키 사용여부 지정
            if(this.virtualKeyNone) this.virtualKey = false;
            else if(this.virtualKeyForce) this.virtualKey = true;
            else (this.virtualKey = ShuttingStarsUtility.isTouchScreenPlatform());

            this.logInit('load settings...');

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
                const rx = Math.floor((x * selfs.getStageWidth())  / rect.width );
                const ry = Math.floor((y * selfs.getStageHeight()) / rect.height);

                if(mouseDown) {
                    if(selfs.mouseClickDebugMode) console.log('[MOUSECLICKED] ' + x + ', ' + y + " -> " + rx + ', ' + ry);
                } else {
                    if(selfs.mouseClickDebugMode) console.log('[MOUSERELEASE] ' + x + ', ' + y + " -> " + rx + ', ' + ry);
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

            let hGap = outWidth  - window.innerWidth;
            let vGap = outHeight - window.innerHeight;
            if(hGap < 0) hGap = 0;
            if(vGap < 0) vGap = 0;

            // 화면 크기변경 시 호출될 함수
            const fResize = function() {
                // selfs.canvas.style.width  = (outWidth  - hGap + 1) + 'px';
                selfs.canvas.style.height = (selfs.fOuterHeight() - vGap - selfs.getTopMarginPage() + 1) + 'px';
                selfs.canvas.style.marginLeft = selfs.getLeftMarginPage() + 'px';
                selfs.canvas.style.marginTop  = selfs.getTopMarginPage() + 'px';
                selfs.renderConfigDiv();

                // 기기의 방향이 바뀐 경우를 처리
                if((outWidth < outHeight && selfs.canvas.width > selfs.canvas.height) || (outWidth > outHeight && selfs.canvas.width < selfs.canvas.height)) {
                    selfs.setResolution(selfs.ressets.w, selfs.ressets.h);
                }

                // 3d 장식용 캔버스 관리
                if(selfs.canvas3d != null) {
                    selfs.canvas3d.style.position = 'fixed';

                    const canvasBounding = selfs.canvas.getBoundingClientRect();
                    selfs.canvas3d.style.left = canvasBounding.left + 'px';
                    selfs.canvas3d.style.top  = canvasBounding.top + 'px';
                    selfs.canvas3d.style.width  = canvasBounding.width + 'px';
                    selfs.canvas3d.style.height = canvasBounding.height + 'px';
                }

                if(selfs.ss3d != null) {
                    selfs.ss3d.onWindowResize(selfs.canvas3d, selfs);
                }

                selfs.calculateFontMetric(true);
            };
            fResize(); // 지금 바로 1회 호출
            // 창 크기 변경 이벤트로도 등록
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
            }

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
                    selfs.se.tick = new Audio(this.convertURL('[CTX]/resources/se/tick.ogg'));
                } catch(exAudio) {
                    console.error(exAudio);
                }

                selfs.menuListDynamic = selfs.menuList;
                selfs.getMenuList().then((menuList) => {
                    selfs.menuListDynamic = menuList;
                    selfs.logInit('starting game...');
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

    /** 초기화 완료 후 호출 */
    afterInitialized() {
        this.menuChoosing = this.menuListDynamic[0];
        this.titleScreenWaiting = true;
        // this.setState('menu'); // 바로 넘기지 않고, 엔터 키를 눌렀을 때 넘길 예정

        try { this.fAfterInit(this); this.logInit('fAfterInit end.'); } catch(exSelf) { console.error(exSelf); this.logInit('fAfterInit failed. ' + exSelf); }
    }

    /** init 작업 진행현황 기록 (디버그 모드 시에만 의미 있음) */
    logInit(msg) {
        this.lastInitSuccessMessage = msg;
        if(this.initDebugMode) ShuttingStarsUtility.toast(msg);
    }

    /** 게임 자체의 상태 변경 */
    setState(state) {
        const selfs = this;
        let idx;

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
    }

    /** 메뉴 목록 반환, this.menuList 에 더해 로그인 여부 등 동적으로 원소가 추가될 수 있음, Promise */
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

    /** 가상 키 추가 */
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

    /** 해상도 (그래픽 품질) 변경, 디스플레이 방향이 landscape 이라고 가정하에 매개변수를 넣어야 함.  */
    setResolution(w, h) {
        this.ressets.w = w;
        this.ressets.h = h;

        let temp;
        if(this.detectScreenLandscape()) {
            if(this.stageSize.w < this.stageSize.h) {
                temp = this.stageSize.w;
                this.stageSize.w = this.stageSize.h;
                this.stageSize.h = temp;
                this.canvas.style.minWidth  = '1280px';
                this.canvas.style.minHeight = '720px';
            }
            this.resolution.w = w;
            this.resolution.h = h;
        } else {
            if(this.stageSize.w > this.stageSize.h) {
                temp = this.stageSize.w;
                this.stageSize.w = this.stageSize.h;
                this.stageSize.h = temp;
                this.canvas.style.minWidth  = '720px';
                this.canvas.style.minHeight = '1280px';
            }
            this.resolution.w = h;
            this.resolution.h = w;
        }
        this.canvas.width  = this.resolution.w;
        this.canvas.height = this.resolution.h;
        
        if(this.ressets.h <= 720) {
            this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0]; 
        } else {
            if(this.disable3d) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[1];
            else               this.settingGraphicQualityChoosing = this.settingsGraphicQuality[2];
        }
    }

    /** 디스플레이 방향 (수직 portrait / 수평 landscape) 구분, landscape 인 경우 true, 그외의 경우 false 반환 */
    detectScreenLandscape() {
        return (this.fOuterWidth() >= this.fOuterHeight());
    }

    /** 설정 불러오기 */
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
    }

    /** 설정 저장 */
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
            settingJson.resolution = this.ressets.w + ',' + this.ressets.h;
            settingJson.disable3d = this.disable3d;
            settingJson.language = this.language;
            settingJson.languageDefault = this.languageDefault;
            settingJson.keyList = this.keyList;

            localStorage.setItem('shuttingstar_settings', JSON.stringify(settingJson));
        } catch(e) {
            console.log('Failed to save settings.');
            console.error(e);
        }
    }

    /** 곡 목록 불러오기 */
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

    /** 곡 목록 저장 */
    saveSongs() {
        let idx;

        // 공식곡 제외하고 담기
        let list = [];
        for(idx=0; idx<this.songs.length; idx++) {
            const songOne = this.songs[idx];
            if(this.officialSongSerials.indexOf(songOne.serial) >= 0) continue;

            // 시리얼 없는 경우 임의 시리얼 부여
            if(songOne.serial == '' || songOne.serial == null) songOne.serial = 'nonofficial_' + Math.floor(Math.random() * 999999999) + '' + Math.floor(Math.random() * 999999999);
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

    /** 곡 처리 프로세스 반복주기 계산, bpm 은 number 타입 (소수 가능) 을 넣어야 함 */
    calculateSongBitGap(bpm) {
        return Math.round((60000 / bpm) / this.timeMultiplier);
    }

    /** 스테이지 초기화, 곡이 선정되지 않았을 때는 초기화만 하며, 곡이 선정된 경우는 초기화 후 곡 초기세팅까지 진행 */
    resetStage() {
        const selfs = this;
        let idx;
        this.clearTimeHandler();

        this.lastObjectId = 0;
        this.objectsPlaying = [];
        this.notePlacers = [];
        this.hp = 100.0;
        this.point = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.missCombo = 0;
        this.report = {
            PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0
        };
        this.songBitGap = 0;
        this.resumed = false;
        this.paused = false;
        this.gameOverDelayed = false;
        this.elapsedTime = 0;
        this.resumingTime = 0;

        if(this.visualizePeakDebugData.length >= 1 && this.state == 'playing' && this.elapsedTime >= 80) this.consoleVisualizeDebugData();
        this.visualizePeakDebugData = [];
        this.visualizePeakDebugRecordTime = 0;
        
        for(idx=0; idx<this.keyList.length; idx++) {
            const notePlacer = new NotePlacer(idx);
            notePlacer.id = this.lastObjectId++;
            this.objectsPlaying.push(notePlacer);
            this.notePlacers.push(notePlacer);
        }

        // 곡 플레이 직전, 풀스크린 곡 타이틀 화면
        if(this.state == 'songtitle') {
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
                if(typeof(this.song.musicUrl) != 'undefined' && this.song.musicUrl != null && this.song.musicUrl != '') {
                    try {
                        this.audio = new Audio(this.convertURL(this.song.musicUrl));
                        this.audio.volume = (this.volume * this.volumeSongAudio * this.volumeMultiplier);
                        
                        this.closeAudioSources();
                        if(this.useAudioVisualizer) {
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
                        }
                        
                        // this.audio.addEventListener('ended', function() {
                        //     console.log('SONG ENDED');
                        //     console.log(this.timeElapse);
                        // });
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
        
        // 곡이 플레이 상황일 경우 처리
        if(this.state == 'playing') {
            this.elapsedTime = -1000; // 처리 끝난 후 아래에서 다시 초기화
            if(this.song == null) { this.closeAudioSources(); this.audio = null; this.setState('menu'); return; }

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
                    pattern.locationIndex = Math.floor(Math.random() * this.notePlacers.length);
                }

                // 노트 생성
                const note = new Note(pattern.locationIndex);
                note.id = this.lastObjectId; this.lastObjectId++;
                note.patternId = pattern.id;
                note.originalTiming = pattern.time;
                // if(idx == patterns.length - 1) { note.debugTarget = true; } // 노트 디버깅
                this.objectsPlaying.push(note); // 노트 추가
            }

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

            // 오디오 재생 시작 + 시간 타이밍 맞추기
            if(this.audio != null) {
                setTimeout(() => {
                    selfs.audio.play();
                    if(selfs.audioBackground != null && selfs.audioBackgroundPlaying) selfs.volumeBackgroundSpeed = (-1) * 0.01;

                    selfs.visualizePeakDebugData = [];
                    selfs.visualizePeakDebugRecordTime = 0;

                    selfs.elapsedTime = (selfs.audio.currentTime * (selfs.song.bpm / 60) * selfs.timeMultiplier) - selfs.songTiming; // 타이밍 지정
                }, (selfs.songBitGap * selfs.stageRows * 2) + selfs.songTiming); // 노트가 올라가는 시간은 주고 재생 시작
            } else {
                selfs.elapsedTime = selfs.songTiming * (-1); // 타이밍 지정
            }
            this.playPrepared = true;
        } else {
            this.playPrepared = false;
        }
    }


    /** 키 입력 처리, vkeyExplosion 를 true 지정 시 해당 가상 키도 강조 표시 */
    handleKeyInput(key, vkeyExplosion) {
        const selfs = this;

        if(this.keyEventDisabled) return;
        if(this.keyInputDebugMode) console.log('KEY INPUT : ' + ShuttingStarsUtility.floor2(this.elapsedTime) + ', ' + key);
        key = String(key);

        // 키 입력 신호 넣기
        this.keypressing[key] = new Date().getTime();

        // 타이틀 화면 키 핸들링
        if(this.state == 'title') {
            this.handleKeyInputTitle(key, vkeyExplosion);
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

    /** 타이틀 화면 키 입력 핸들링 */
    handleKeyInputTitle(key, vkeyExplosion) {
        if(key == this.enterKey || key == 'ENTER') {
            this.playTick();
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

    /** 메뉴 화면 키 입력 핸들링 */
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
                this.videoBga = null;

                this.playTick();
                this.setState('songchoosing');
            } else if(selfs.menuChoosing == 'setting') { // 메뉴 - 설정에 커서가 있는 상태에서 엔터 키 누름
                // 그래픽 퀄리티 해상도는 해상도+3D 관련 사항이므로 따로 처리
                if(this.resolution.h <= 720) {
                    this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0];
                } else {
                    if(this.disable3d) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[1];
                    else               this.settingGraphicQualityChoosing = this.settingsGraphicQuality[2];
                }

                this.playTick();
                this.setState('setting');
                if(selfs.configDiv != null) {
                    // 캔버스 내 자체 설정화면 대신, 상세설정 div 레이어를 띄움
                    this.openConfigDiv();
                }
            } else if(this.menuChoosing == 'credit') { // 메뉴 - 크레딧에 커서가 있는 상태에서 엔터 키 누름
                this.playTick();
                this.prepareCreditList();
                this.setState('credit');
            } else if(this.menuChoosing == 'records') { // 메뉴 - 기록
                this.playTick();
                this.selectedRecordList = selfs.getRecords();
                this.selectRecordType = 'local';
                this.seeingRecord = null;
                if(this.selectedRecordList.length >= 1) this.seeingRecord = this.selectedRecordList[0];
                this.setState('recordlist');
            } else if(this.menuChoosing == 'login') { // 메뉴 - 로그인 (동적 메뉴)
                this.playTick();
                if(this.backend != null && this.backend.avail) {
                    this.keyEventDisabled = true;
                    this.pops.dim.classList.remove('invisible');
                    this.pops.login.classList.remove('invisible');
                }
            } else if(this.menuChoosing == 'logout') { // 메뉴 - 로그아웃 (동적 메뉴)
                this.playTick();
                if(this.backend != null && this.backend.avail) {
                    if(confirm( this.trans('Do you want to logout now?') )) {
                        this.backend.logout().then(() => {
                            try { localStorage.setItem('shuttingstar_session' , ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; }
                            selfs.getMenuList().then((menuList) => {
                                selfs.menuListDynamic = menuList;
                                selfs.setState('title');
                            });
                        });
                    }
                }
            }
        }
    }

    /** 곡 선택 화면 키 입력 핸들링 */
    handleKeyInputSongChoosing(key, vkeyExplosion) {
        const selfs = this;
        let index = 0;

        // ESC 처리는 공통 사항
        if(key == this.escKey) {
            this.playTick();
            if(this.difficultyChoosing) { this.difficultyChoosing = false; }
            else { this.setState('menu'); }
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
                this.playTick();

                this.missionChoosing.prepare(this); // 노트 이 시점에 생성
                

                this.songTitleTime = this.songTitleBaseTime;
                this.song = this.missionChoosing;
                this.difficulty = this.song.difficulties[0]; // 미션은 난이도가 하나

                if(! isNaN(this.song.loadingTime)) this.songTitleTime += this.song.loadingTime;

                // 곡 플레이 선택함.
                this.mode = this.songChoosingMode;
                this.setState('songtitle');
                this.difficultyChoosing = false;
                this.titleDelayTime = Math.floor(20 * (this.noteSpeedMultiplier - 1));
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
                this.playTick();

                if(this.difficultyChoosing) {
                    if(this.difficulty == null || typeof(this.difficulty) == 'undefined') this.difficulty = this.difficultyChoosingList[0];
                    this.songTitleTime = this.songTitleBaseTime;
                    if(! isNaN(this.song.loadingTime)) this.songTitleTime += this.song.loadingTime;

                    // 곡 플레이 선택함.
                    this.mode = 'default';
                    this.setState('songtitle');
                    this.difficultyChoosing = false;
                    this.titleDelayTime = Math.floor(20 * (this.noteSpeedMultiplier - 1));
                } else {
                    this.song = this.songChoosing;
                    this.difficultyChoosingList = this.song.getDifficultyList();
                    this.difficulty = this.difficultyChoosingList[0];
                    this.difficultyChoosing = true;
                }
            }
        }
    }

    /** 설정 화면 키 입력 핸들링 */
    handleKeyInputSetting(key, vkeyExplosion) {
        const selfs = this;
        let index = 0;

        if(this.settingList.indexOf(this.settingChoosing) >= 0) index = this.settingList.indexOf(this.settingChoosing);
        this.settingChoosing = this.settingList[index];

        if(key == this.enterKey) {
            if(this.settingChoosing == 'resetAll') {
                if(this.settingResetReask) {
                    this.playTick();
                    // 초기화
                    this.resetAll();
                } else {
                    this.playTick();
                    // 한번 더 물어봄
                    this.settingResetReask = true;
                }
            } else if(this.settingModifyingMode) {
                this.playTick();
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
                this.playTick();
                this.settingModifyingMode = true; // 설정 변경 모드 ON
            }
        } else if(key == this.escKey) {
            this.playTick();
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

    /** 플레이 화면 키 입력 핸들링 */
    handleKeyInputPlaying(key, vkeyExplosion) {
        const selfs = this;
        let index = 0;

        if(key == this.enterKey) {
            // 플레이 중이며 엔터 키
            if(this.paused) { // 일시정지 중일 때 --> 재개 처리
                this.resumingTime = this.resumeDelayTime * _shuttingstarcore.timeMultiplier;
                this.paused = false;
            }
        } else if(key == this.escKey) {
            // 플레이 중이며 ESC키
            if(this.paused) {
                // 이미 일시정지 중일 때 또 ESC 누름 --> 포기 처리
                this.onGameOver();
            } else {
                // 일시정지 중이 아닐 때 --> 일시정지 시작
                this.paused = true;
                if(this.audio != null) { this.audio.pause(); }
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

    /** 기록 목록 화면 키 입력 핸들링 */
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
            this.playTick();
            this.setState('recorddet');
        } else if(key == this.escKey) {
            this.playTick();
            this.setState('menu');
        }
    }

    /** 기록 상세 화면 키 입력 핸들링 */
    handleKeyInputRecordDetail(key, vkeyExplosion) {
        this.playTick();
        this.setState('recordlist');
    }

    /** 결과 화면 키 입력 핸들링 */
    handleKeyInputResult(key, vkeyExplosion) {
        if(key == this.escKey) {
            this.setState('menu');
        }
    }

    /** 크레딧 화면 입력 핸들링 */
    handleKeyInputCredit(key, vkeyExplosion) {
        this.playTick();
        this.setState('menu');
    }

    /** NotePlacer 호출 처리 */
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
        const newExplosinves = new CorrectNoteExplosing(minimumNote.locationIndex, minimumNote.y, minimumNote.color, '255, 255, 255');
        this.objects.push(newExplosinves);
    }

    /** 마우스 클릭 / 터치 이벤트 처리, mouseCursorObject 는 마우스 클릭 위치에 생성되는 임시 객체로 isConflicted 지원 */
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

    /** 키 입력 해제 (손가락을 뗌) 처리 */
    handleKeyRelease(key) {
        if(this.keyReleaseDebugMode) console.log('KEY RELEASE : ' + this.elapsedTime + ', ' + key);
        key = String(key);

        const timeDiff = (typeof(this.keypressing[key]) == 'undefined' || this.keypressing[key] == null) ? 0 : new Date().getTime() - this.keypressing[key];
        this.keypressing[key] = null;

        // TODO
    }

    /** 마우스 클릭 해제 / 터치 해제 이벤트 처리, mouseCursorObject 는 마우스 클릭 위치에 생성되는 임시 객체로 isConflicted 지원 */
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
    
    /** 거리에 따른 판정 산출 */
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
    
    /** 판정 결과에 따라 HP, 콤보 처리 */
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
    
    /** 판정 띄우기 */
    displayResultMark(resultMark) {
        if(resultMark == null) return;
        this.accelerateExplosingJudgeMarks();
        this.objectsPlaying.push(new JudgeMark(resultMark));
    }

    /** 노트의 반지름 */
    getNoteRadius() {
        return ((this.stageSize.h * this.sizeFixedConst) / this.stageRows) / 2.0;
    }

    /** 화면에 객체들 출력, 동시 반복 호출되며 init 에서 시작됨 */
    render() {
        try {
            // 캔버스 비우기
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
        } catch(e) {
            console.error(e);
        }
    }

    /** 화면 출력 - 플레이 중 출력 */
    renderPlaying() {
        // titleDelayTime 값이 있으면, 플레이 중임에도 타이틀 화면 출력
        //    노트 올라오는 속도 때문에 게임이 시작됐음에도 곡이 늦게 재생도록 한 데에 대한 대응책, 노트속도 배수에 따라 이 값을 조절할 예정
        if(this.titleDelayTime >= 1) {
            this.renderSongTitle();
            return;
        }

        // BGA 그리기
        if(this.song) {
            if(this.song.bgaUrl != null && typeof(this.song.bgaUrl) != 'undefined') {
                // let img = new Image();
                // img.src = this.song.bgaUrl;
                // this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                // this.song.bgaUrl
            }
        }

        let fontSize;

        // 시각화 그리기
        if(this.audioAnalyser != null && this.audioSource != null && this.playPrepared) this.renderAudioVisualizing();

        // 객체 그리기
        for(let idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if(obj.explosing >= obj.explosingMax) continue;
            if(typeof(obj.draw) == 'function') obj.draw(this.ctx);
        }

        // HP바 그리기
        this.renderHpBar();

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
            this.ctx.strokeText(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('%1 key to resume, %2 key to give up !'), '%1', this.enterKey), '%2', escKeyLabel), this.convertX(this.getStageWidth() / 2), this.convertY((this.getStageHeight() / 2) + ((fontSize * 2) + 10) ));
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
            this.ctx.fillText(String(ShuttingStarsUtility.floor2(this.elapsedTime)), this.convertX(this.getStageWidth() * 9 / 10), this.convertY(this.getStageHeight() / 10));
        }

        // 게임 오버 그리기
        if(this.state == 'gameover') {
            fontSize = this.convertFontSize(20);
            this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();

            this.ctx.fillStyle = this.convertColor('rgba(250, 40, 40, 0.9)');
            this.ctx.textAlign = "center";
            this.ctx.fillText('GAME OVER', this.convertX(this.getStageWidth() / 2), this.convertY((this.getStageHeight() / 2) + 20));
        }
    }

    /** 폰트 실제크기 계산 */
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

            this.metricSize1 = (metric1.actualBoundingBoxAscent + metric1.fontBoundingBoxDescent);
            this.metricSize2 = (metric2.actualBoundingBoxAscent + metric2.fontBoundingBoxDescent);
            this.metricSize3 = (metric3.actualBoundingBoxAscent + metric3.fontBoundingBoxDescent);
        }
    }

    /** 화면 출력 - 타이틀 */
    renderTitle() {
        let idx;
        let rows = 0;
        let fontSize = this.convertFontSize(30);
        let opacity = 0.9;
        let gap = Math.floor(fontSize / 2.0);
        let label = '';
        
        this.calculateFontMetric(true);

        rows = this.convertY(this.getStageHeight() / 3);
        fontSize = this.convertFontSize(30);
        this.ctx.font = 'bold ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.strokeText('Shutting Stars', this.convertX(this.getStageWidth() / 2), rows);

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
        this.ctx.fillText(ShuttingStarsUtility.replaceString(this.trans(label), '%', this.enterKey), this.convertX(this.getStageWidth() / 2), this.convertY(this.getStageHeight()) - (this.metricSize2 * 3));

        // 빌드 번호 출력
        fontSize = this.convertFontSize(12);
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = 'right';
        this.ctx.fillText('BUILD ' + this.build, this.convertX(this.getStageWidth() - (fontSize * 1.5)), this.convertY(this.getStageHeight()) - (this.metricSize2 * 3));

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

                    this.ctx.fillText(this.backend.user.email, this.convertX(fontSize * 1.5), this.convertY(this.getStageHeight()) - (this.metricSize2 * 3));
                }
            }
        }

        this.renderNoticeBottom();
    }

    /** 화면 출력 - 메인 메뉴 */
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
        rows = this.convertY(this.getStageHeight() / 5);
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
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 10), this.convertY(this.getStageHeight()) - (this.metricSize2 * 3));
        rows += this.metricSize2 + gap;

        // 빌드 번호 출력
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = 'right';
        this.ctx.fillText('BUILD ' + this.build, this.convertX(this.getStageWidth() - (fontSize * 1.5)), this.convertY(this.getStageHeight()) - (this.metricSize2 * 3));

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
            this.ctx.fillText(label, this.convertX(fontSize * 2.8), this.convertY(this.getStageHeight()) - (this.metricSize2 * 4.5));
        }

        this.renderNoticeBottom();
    }

    /** 공통 공지사항 (타이틀, 메뉴 화면에서 사용) 출력 */
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
        this.ctx.fillText(label, this.convertX(x), this.convertY(this.getStageHeight()) - (this.metricSize2 * 1.5));
    }

    /** 화면 출력 - 곡 선정 화면 */
    renderSongChoosing() {
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
        if(this.resolution.h <=  720) {
            divideCount = 4; // 한 페이지 내에 출력 가능한 곡/미션 수를 조정하는 값 (현재 선택된 값 위에 이 갯수만큼만 있을 수 있음)
        }

        // 최초 Y 좌표 계산
        rows = this.convertY(this.getStageHeight() / 5);

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
        
        if(emptyState) {
            rows += this.metricSize1 + gap;

            // ESC 표기
            let escKeyLabel = this.escKey;
            if(this.escKey == 'ESCAPE') escKeyLabel = 'ESC';

            fontSize = this.convertFontSize(15);
            this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
            this.ctx.textAlign = "right";
            this.ctx.fillText(ShuttingStarsUtility.replaceString(this.trans("% key to continue..."), '%', escKeyLabel), this.convertX(this.getStageWidth()) - (this.metricSize2 * 2), this.convertY(this.getStageHeight()) - (this.metricSize2 * 2));

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
            this.ctx.strokeText(lefts + this.trans('Choose your song !') + rights, this.convertX(this.getStageWidth() / 2), rows);
        }
        rows += (this.metricSize3 * 2) + (gap);

        let displayedSongs = 0;
        let songChoosen = null;
        let current = false;

        if(this.songChoosingMode == 'mission') {
            // mission 모드 - 난이도만 선택

            // 미션을 선택하지 않은 상태인 경우 첫 미션을 출력
            if(this.missionChoosing == null) { this.missionChoosing = this.missions[0]; }

            // 미션 목록을 다 출력할 수는 없으니, 현재 선택된 미션 앞뒤 2개만 출력
            //    현재 선택된 미션을 중앙에 두고, 앞 2개, 뒤 2개를 찾아야 함 (가능한 만큼만)
            let frontMissions = [];
            let backMissions = [];
            current = false;

            for(idx=0; idx<this.missions.length; idx++) {
                let missionOne = this.missions[idx];
                if(missionOne == this.missionChoosing) {
                    current = true; // 현재 선택된 곡, backSongs 에 넣기 (frontSongs 에 넣어도 문제는 없음)
                    backMissions.push(missionOne);
                    continue;
                }
                if(! current) { // 아직 현재 선택된 곡을 만나기 이전 - 일단 frontSongs 에 넣고, 원소가 2개에 도달하면 먼저 넣은 것을 제거한다.
                    frontMissions.push(missionOne);
                    if(frontMissions.length >= divideCount) frontMissions.splice(0, 1);
                } else { // 현재 선택된 곡을 지남 - backSongs 에 넣고, 원소가 3개 (현재 선택된 곡이 포함되어 있으므로) 가 되면 반복문을 중지한다.
                    backMissions.push(missionOne);
                    if(backMissions.length >= divideCount+1) break;
                }
            }

            // 하나의 배열로 병합
            let displayMissions = [];
            for(idx=0; idx<frontMissions.length; idx++) { displayMissions.push(frontMissions[idx]); }
            for(idx=0; idx<backMissions.length; idx++) { displayMissions.push(backMissions[idx]); }
            frontMissions = null;
            backMissions = null;

            // 출력
            for(idx=0; idx<displayMissions.length; idx++) {
                let missionOne = displayMissions[idx];
                let choosen = (this.missionChoosing == missionOne);

                // 선택된 곡 배경색 출력
                if(choosen) {
                    songChoosen = missionOne;

                    if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                    else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');

                    this.ctx.fillRect(0, rows - this.metricSize1, this.canvas.width - (this.getLeftMarginStage() * 2), this.metricSize1 + (gap*3));
                }

                // 곡 이름 출력
                opacity = 0.99;
                // if(choosen) opacity = 0.99;
                // else opacity = 0.3;

                fontSize = this.convertFontSize(20);
                label = missionOne.name;
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

                rows += this.metricSize1 + (gap*3);
            }

        } else {
            // default 모드 - 곡을 선택해야 함

            // 곡을 선택하지 않은 상태인 경우 첫 곡을 출력
            if(this.songChoosing == null) { this.songChoosing = this.songDisplays[0]; }

            // 곡 목록을 다 출력할 수는 없으니, 현재 선택된 곡 앞뒤 2개만 출력
            //    현재 선택된 곡을 중앙에 두고, 앞 2개, 뒤 2개를 찾아야 함 (가능한 만큼만)
            let frontSongs = [];
            let backSongs = [];
            current = false;
            for(idx=0; idx<this.songDisplays.length; idx++) {
                let songOne = this.songDisplays[idx];
                if(songOne == this.songChoosing) {
                    current = true; // 현재 선택된 곡, backSongs 에 넣기 (frontSongs 에 넣어도 문제는 없음)
                    backSongs.push(songOne);
                    continue;
                }
                if(! current) { // 아직 현재 선택된 곡을 만나기 이전 - 일단 frontSongs 에 넣고, 원소가 2개에 도달하면 먼저 넣은 것을 제거한다.
                    frontSongs.push(songOne);
                    if(frontSongs.length >= divideCount) frontSongs.splice(0, 1);
                } else { // 현재 선택된 곡을 지남 - backSongs 에 넣고, 원소가 3개 (현재 선택된 곡이 포함되어 있으므로) 가 되면 반복문을 중지한다.
                    backSongs.push(songOne);
                    if(backSongs.length >= divideCount+1) break;
                }
            }

            // 하나의 배열로 병합
            let displaySongs = [];
            for(idx=0; idx<frontSongs.length; idx++) { displaySongs.push(frontSongs[idx]); }
            for(idx=0; idx<backSongs.length; idx++) { displaySongs.push(backSongs[idx]); }
            frontSongs = null;
            backSongs = null;

            // 출력
            for(idx=0; idx<displaySongs.length; idx++) {
                let songOne = displaySongs[idx];
                let choosen = (this.songChoosing == songOne);

                // 선택된 곡 배경색 출력
                if(choosen) {
                    songChoosen = songOne;

                    if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                    else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');

                    if(this.difficultyChoosing) {
                        this.ctx.fillRect(0, rows - (this.metricSize1 + gap), this.canvas.width - (this.getLeftMarginStage() * 2), this.metricSize1 + (this.metricSize2 * 4) + (gap*3));
                    } else {
                        this.ctx.fillRect(0, rows - (this.metricSize1 + gap), this.canvas.width - (this.getLeftMarginStage() * 2), this.metricSize1 + (this.metricSize2 * 3) + (gap*3));
                    }
                }

                // 곡 이름 출력
                opacity = 0.99;
                // if(choosen) opacity = 0.99;
                // else opacity = 0.3;

                fontSize = this.convertFontSize(20);
                label = songOne.name;
                this.ctx.textAlign = "center";
                this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
                if(choosen) {
                    if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                    else          this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                    this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), (rows));
                } else {
                    if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                    else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                    this.ctx.strokeText(label, this.convertX(this.getStageWidth() / 2), (rows));
                }

                rows += this.metricSize1 + gap;

                // 작곡가, 노트작성자, bpm 출력
                label = ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2, %3 BPM'), '%1', songOne.composer), '%2', songOne.noteWriter), '%3', String(songOne.bpm));
                fontSize = this.convertFontSize(15);
                this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();

                // if(this.songChoosing == songOne) opacity = 0.99;
                // else opacity = 0.3;

                this.ctx.textAlign = "center";
                if(choosen) {
                    if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                    else          this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                    this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), (rows));
                } else {
                    if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                    else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                    this.ctx.strokeText(label, this.convertX(this.getStageWidth() / 2), (rows));
                }

                rows += this.metricSize2 + gap;

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

                        if(ddx == diffIdx) this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) + cols - (diffIdx * fontSize * 2), (rows));
                        else               this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2) + cols - (diffIdx * fontSize * 2), (rows));
                        cols += (fontSize * label.length) + 20;
                    }
                }

                rows += this.metricSize2 + (gap*4);
                displayedSongs++;
            }
        }

        // 빈 공간 띄우기
        fontSize = this.convertFontSize(35);
        while(displayedSongs < 5) {
            rows += this.metricSize3 + gap;
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
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 10), this.convertY(this.getStageHeight()) - (fontSize * 1.5));
        
        // 선택 곡 정보 출력
        if(songChoosen != null) {
            let descX = Math.floor(this.canvas.width * 2.7 / 4.0);
            let descW = Math.floor((this.canvas.width * 1.2) / 4.0);

            if(descW < 300) {
                descX = Math.floor(this.canvas.width / 2.0);
                descW = Math.floor((this.canvas.width) / 2.0);
            }

            let desc = songChoosen.getDescriptionSplit();
            if(desc != null && desc.length > 0) {
                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(180, 180, 180, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(100, 100, 100, ' + opacity + ')');

                this.ctx.fillRect(descX, Math.floor(this.canvas.height * 2.7 / 4.0), descW, Math.floor(this.canvas.height * 1.2 / 4.0));

                fontSize = this.convertFontSize(12);
                this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
                this.ctx.textAlign = "left";
                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(100, 100, 100, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(180, 180, 180, ' + opacity + ')');

                rows = Math.floor((this.canvas.height * 2.7 / 4.0) + fontSize) + 5;
                for(const line of desc) {
                    this.ctx.fillText(line, descX + fontSize + this.getLeftMarginStage(), rows);
                    rows += fontSize + gap;
                }
                this.ctx.textAlign = "center";
            }
        }
    }

    /** 화면 출력 - 설정 화면 */
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

        rows = this.convertY(this.getStageHeight() / 5);

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
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), this.convertY((this.getStageHeight() * 9 / 10)));
        rows += fontSize + gap;
    }

    /** 화면 출력 - 곡 시작 직전 썸네일과 곡 제목 크게 뜨는 화면, 사용자는 아무것도 할 수 없으며, 시간이 지나면 자동으로 playing 상태로 전환되어 플레이가 시작됨 */
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
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 2), this.convertY(this.getStageHeight() / 3));

        // 작곡가, 노트작성자, bpm 출력
        fontSize = this.convertFontSize(20);
        label = ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2, %3 BPM'), '%1', songOne.composer), '%2', songOne.noteWriter), '%3', String(songOne.bpm));
        this.ctx.font = 'normal ' + fontSize + 'px ' + this.getRenderFontFamily();
        rows = this.convertY(this.getStageHeight()) - (this.metricSize2 * 2);
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

    /** 화면 출력 - 플레이 종료 후 결과 화면 */
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
            this.ctx.strokeText(this.trans('CREATE MODE'), this.convertX(this.getStageWidth() - 10), this.convertY(30));
        }

        // 타이틀 출력
        rows = this.convertY(this.getStageHeight() / 6);
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
        rows = this.convertY(this.getStageHeight()) - ((fontSize * 2) + (gap * 2));
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
    }

    /** 기록 목록 그리기 */
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
        rows = this.convertY(this.getStageHeight() / 5);

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
            this.ctx.fillText(ShuttingStarsUtility.replaceString(this.trans("% key to continue..."), '%', escKeyLabel), this.convertX(this.getStageWidth()) - (fontSize * 2), this.convertY(this.getStageHeight()) - (this.metricSize2 * 2));

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
        this.ctx.fillText(label, this.convertX(this.getStageWidth() / 10), this.convertY(this.getStageHeight() - (this.metricSize2 * 1.5)));
    }

    /** 기록 조회 그리기 */
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
        rows = this.convertY(this.getStageHeight() / 6);
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
        rows = this.convertY(this.getStageHeight()) - ((this.metricSize3 * 3) + gap);

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
        this.ctx.fillText(ShuttingStarsUtility.replaceString(this.trans("% key to continue..."), '%', escKeyLabel), this.convertX(this.getStageWidth() - (fontSize * 2)), this.convertY(this.getStageHeight() - (fontSize)));
    }

    /** HP 표시 수단 (즉 행성) 그리기 */
    renderHpBar() {
        let arr = this.calculateHpColor();
        let r, g, b;
        r = arr[0];
        g = arr[1];
        b = arr[2];
        
        const hpBarInsideColor = this.convertColor('rgba(' + r + ', ' + g + ', ' + b + ', 0.8)');

        // HP바 (행성형) 출력
        let x      = Math.round((this.notePlacers[0].x + this.notePlacers[this.notePlacers.length-1].x) / 2.0);
        let radius = Math.round((this.notePlacers[this.notePlacers.length-1].x - this.notePlacers[0].x) / 2.0) * 8;
        let y      = this.getHpBarYLocation() - radius;
        
        this.ctx.beginPath();
        this.ctx.fillStyle = hpBarInsideColor;
        this.ctx.arc(this.convertX(x), this.convertY(y), this.convertX(radius), 0, 2 * Math.PI);
        this.ctx.fill();
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

    /** 렌더링 디버그 모드에서, 디버깅 용 객체 출력 */
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

    /** 오디오 시각화 그리기 */
    renderAudioVisualizing() {
        if(this.audioBuffer == null || this.audioBufferLen == 0) return;
        
        this.audioAnalyser.getByteFrequencyData(this.audioBuffer);

        // 막대그래프형 - 크기 계산
        const barWidth = Math.round(this.canvas.width * 1.0 / this.audioBufferLen) * this.visualizeBarMultiplier;
        let barHeight, barColorVariable;
        let x = 0;

        // 디버그 데이터
        let peakData = null;
        let oldData;
        if(this.visualizePeakDebugMode) {
            peakData = {}
            peakData.time = this.elapsedTime;
            peakData.values = [];

            oldData = this.visualizePeakDebugRecordTime;
            if(this.visualizePeakDebugRecordTime + this.visualizePeakDebugShortestTime >= this.elapsedTime) peakData = null;
            else this.visualizePeakDebugRecordTime = this.elapsedTime;
        }

        for(let i=0; i<this.audioBufferLen; i++) {
            barHeight = this.audioBuffer[i]; // 0 ~ 255

            if(peakData != null) peakData.values.push(barHeight);

            // convert ~255 to ~canvas.height
            barHeight = ((barHeight * (this.canvas.height - 10) / 1.5) / 255.0);

            barColorVariable = ((barHeight * 100.0) / 255.0); // convert ranges

            this.ctx.fillStyle = 'rgba(' + (barColorVariable + 140) + ', 100, 120, 0.1)';
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }

        if(peakData != null) this.visualizePeakDebugData.push(peakData);
    }

    /** 크레딧 그리기 */
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
            this.ctx.fillText(nows.label, this.convertX(this.getStageWidth() / 2), this.convertY(rows));
            rows += fontSize;
            
            displays++;
        }

        // 다시 위로 돌아가 남은 차례 처리
        for(idx=0; idx<this.creditContents.length; idx++) { // 루프 전체 출력 - 어짜피 넘치는 영역은 숨겨지므로
            const nows = this.creditContents[idx];

            fontSize = this.convertFontSize(nows.fontSize);
            this.ctx.font = 'normal ' + this.convertFontSize(nows.fontSize) + 'px ' + this.getRenderFontFamily();
            this.ctx.fillText(nows.label, this.convertX(this.getStageWidth() / 2), this.convertY(rows));
            rows += fontSize;
            
            displays++;
        }
    }

    /** 랭크 탐지 */
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

    /** 랭크 컬러 반환 (rgb 파트만 반환, 예: 255, 255, 255) */
    judgeResultRankColor(resultRankChar) {
        if(resultRankChar == 'P') return '255, 215, 0';
        if(resultRankChar == 'S') return '255, 215, 0';
        if(resultRankChar == 'A') return '192, 192, 192';
        if(resultRankChar == 'B') return '204, 114, 61';
        if(resultRankChar == 'C') return '47, 157, 39';
        if(resultRankChar == 'D') return '128, 65, 217';
        return '153, 0, 76';
    }

    /** 판정 별 컬러 반환 (rgb 파트만 반환, 예: 255, 255, 255) */
    judgeMarkColor(judgeResult) {
        if(     judgeResult == 'MISS'   ) return '230, 40, 40';
        else if(judgeResult == 'BAD'    ) return '102, 37, 0';
        else if(judgeResult == 'GOOD'   ) return '47, 157, 39';
        else if(judgeResult == 'GREAT'  ) return '103, 153, 250';
        else if(judgeResult == 'PERFECT') return '255, 215, 0';
        return '230, 40, 40';
    }

    /** 난이도 표시 컬러 반환 (rgb 파트만 반환, 예: 255, 255, 255) */
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

    /** HP 표시 컬러 계산 (r, g, b 순서대로 0~255 숫자값이 담긴 배열 반환) */
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

    /*** 공통 동시처리 프로세스 (init 에서 호출) */
    simultaneousWork(simultaneousWorkCycle) {
        let idx, jdx;
        let notePlacer;
        let calculates, additionals;
        
        this.simultaneousTime++;
        if(this.simultaneousTime >= 99999999) this.simultaneousTime = 0;

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

                    // 위치 적용
                    obj.y = calculates;
                }
            }
        }

        // 폭발 완료 처리
        for(idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if(obj instanceof Note) {
                if(obj.explosing >= obj.explosingMax) {
                    this.objectsPlaying.splice(idx, 1);
                    idx--;
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
                if(obj.x < (-20) || obj.y < this.getStageHeight() * (-20) || obj.x > this.getStageWidth() + 20 || obj.y > this.getStageHeight() + 20) {
                    this.objects.splice(idx, 1);
                    idx--;
                    continue;
                }
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
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    /** 곡 동시처리 프로세스 - 시간 진행 (calculateSongBitGap(곡의bpm) 주기마다 1회 호출) */
    timeElapse() {
        if(this.paused) return;
        if(this.resumingTime >= 1) return;

        if(this.resumed) {
            if(this.audio != null) { this.audio.play(); }
            this.resumed = false;
        }

        const song = this.song;
        let idx;
        if(song == null) { this.setState('menu'); return; } // 곡이 선정되지 않은 경우 시간 진행 없음
        if(this.difficulty == null || typeof(this.difficulty) == 'undefined') { this.setState('menu'); return; } // 곡 내 난이도가 선정되지 않은 경우 시간 진행 없음
        if(this.state != 'playing') return; // 곡이 재생 중이 아닌 경우 시간 진행 없음

        this.elapsedTime++;
        if(this.audio != null && (! this.audio.paused) && (! this.audio.ended)) {
            this.elapsedTime = (this.audio.currentTime * (this.song.bpm / 60) * this.timeMultiplier) - this.songTiming;
        }
        if(this.titleDelayTime >= 1) this.titleDelayTime--;

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
                    pattern.locationIndex = Math.floor(Math.random() * this.notePlacers.length);
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
        let lastPatternTime = this.songLastPatternTime;
        if(song.endTime > lastPatternTime + 4) {
            lastPatternTime = song.endTime;
        }
        // 곡의 끝에 다다랐는지 확인 (단, 게임오버 출력 시에는 제외)
        if(this.elapsedTime > lastPatternTime && (! (this.gameOverEnabled && this.gameOverDelayed))) {
            this.clearTimeHandler();

            if(this.audio != null) {
                try { this.audio.pause(); } catch(ex) {} // 오디오 끄기
                this.audio = null;
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
    }

    /** 곡 동시처리 프로세스 종료 (시작하려면 곡 선택 후 resetStage 가 호출되어야 함) */
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

    /** 노트 속도 (Deprecated 더 이상 이 방식을 쓰지 않음) */
    getNoteMoveSpeed() {
        // 설정값에 따른 속도 반환
        // 노트들이 곡의 bpm 에 맞는 타이밍마다 이 메소드의 리턴값 만큼 이동함 (이미 bpm 이 반영되어 있음)
        return ((this.getNoteRadius() * 2.0) * this.noteSpeedMultiplier * this.noteSpeedFixedConst) / (this.timeMultiplier / 8.0);
    }

    /** 노트 생성 위치 (이제는 곡 플레이 초기화 시 다 만들어놓고 위치를 매번 갱신하므로, 초기화할 때 만드는 위치로만 사용함) */
    getNoteCreationYLocation() {
        return this.getNotePlacerYLocation() + (this.getNoteRadius() * 2 * this.stageRows * this.noteSpeedMultiplier * this.noteSpeedFixedConst * (this.timeMultiplier / 8.0) );
    }

    /** 판정선 위치 */
    getNotePlacerYLocation() {
        return (this.getNoteRadius() * 4) + this.getTopMarginNote();
    }

    /** HP바 Y좌표 */
    getHpBarYLocation() {
        return 15;
    }

    /** 폭발 중인 Note 폭발속도 가속 */
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

    /** 폭발 중인 JudgeMark 폭발속도 가속 */
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

    /** 게임 오버 판정 시 호출 */
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

    /** 곡 플레이 종료 시 호출 */
    onSongEnd() {
        this.setState('result');
        this.paused = false;
        this.stopAudio();
        this.audio = null;
        this.songThumb = null;
        this.videoBga = null;
        this.playPrepared = false;

        // Note 갯수 체크
        let diff = this.song.difficulties[ this.difficulty.index ];
        let count = diff.patterns.length;
        let rank = this.judgeResultRank();

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
        });
    }

    /** 곡 재생 종료 */
    stopAudio() {
        if(this.audio != null) {
            try { this.audio.pause();  } catch(e) { console.error(e); }
            try { this.audio.remove(); } catch(e) { console.error(e); }
            this.audio = null;
        }
        this.closeAudioSources();
    }

    /** 오디오 관련 리소스 닫기 (예외 발생해도 무시) */
    closeAudioSources() {
        if(this.audioSource   != null) { try { this.audioSource.disconnect();   this.audioSource   = null; } catch(exIn) { console.log('Error on closing audio source. You can ignore them.'); console.log(exIn); } }
        if(this.audioAnalyser != null) { try { this.audioAnalyser.disconnect(); this.audioAnalyser = null; } catch(exIn) { console.log('Error on closing audio source. You can ignore them.'); console.log(exIn); } }
        if(this.audioCtx      != null) { try { this.audioCtx.close();           this.audioCtx      = null; } catch(exIn) { console.log('Error on closing audio source. You can ignore them.'); console.log(exIn); } }
    }

    /** 현재 로드된 노트들 반환 */
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

    getLeftMarginStage() {
        return this.margins.stage.left;
    }

    getTopMarginStage() {
        return this.margins.stage.top;
    }

    getLeftMarginNote() {
        return this.margins.note.left;
    }

    getTopMarginNote() {
        return this.margins.note.top;
    }

    getLeftMarginPage() {
        return this.margins.page.left;
    }

    getTopMarginPage() {
        return this.margins.page.top;
    }

    getStageWidth() {
        return this.stageSize.w - this.getLeftMarginPage();
    }

    getStageHeight() {
        return this.stageSize.h - this.getTopMarginPage();
    }

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
                this.workerRender.postMessage({interval : this.frameTime * 2});
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
                }, this.frameTime * 2);
            }
        }
        else throw 'Only for ShuttingStars3DManager type !';
    }

    /** 곡에 포함되어 있던 장식 추가문구 해석해 집행 */
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

    /** Credit 목록 그리기 */
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

    /** 팝업 화면 구현 (캔버스에 그리지 않고, 별도 div에 출력) */
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
        let htmls = `
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
                        <td colspan='2' style='text-align: center; height: 250px; vertical-align: middle;'>
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
                </tbody>
            </table>
        `;
        popInside.innerHTML = htmls;
        this.pops.login = popInside;

        const fAfter2 = function() {
            selfs.getMenuList().then((menuList) => {
                selfs.menuListDynamic = menuList;
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
            selfs.backend.openGoogleLogin().then((respJson) => {
                fAfter1(respJson);
            });
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

    /** 상세 설정화면 구현 (캔버스에 그리지 않고, 별도 div에 출력) renderPopupDiv 보다 나중에 호출되어야 함 */
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
                                        <span style='margin-left: 20px;'><span>1</span><input type='text' class='inp inp_linekey inp_linekey_1' maxlength='1' style='width:2rem;'/></span>
                                        <span style='margin-left: 20px;'><span>2</span><input type='text' class='inp inp_linekey inp_linekey_2' maxlength='1' style='width:2rem;'/></span>
                                        <span style='margin-left: 20px;'><span>3</span><input type='text' class='inp inp_linekey inp_linekey_3' maxlength='1' style='width:2rem;'/></span>
                                        <span style='margin-left: 20px;'><span>4</span><input type='text' class='inp inp_linekey inp_linekey_4' maxlength='1' style='width:2rem;'/></span>
                                        <span style='margin-left: 20px;'><span>5</span><input type='text' class='inp inp_linekey inp_linekey_5' maxlength='1' style='width:2rem;'/></span>
                                        <span style='margin-left: 20px;'><span>6</span><input type='text' class='inp inp_linekey inp_linekey_6' maxlength='1' style='width:2rem;'/></span>
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
        this.configDiv.style.top  = this.canvas.offsetTop  + 'px';
        this.configDiv.style.left = this.canvas.offsetLeft + 'px';
        this.configDiv.style.width = this.canvas.offsetWidth + 'px';
        this.configDiv.style.height = this.canvas.offsetHeight + 'px';
        this.configDiv.style.textAlign = 'center';
        this.configDiv.style.verticalAlign = 'middle';

        // 스트링 테이블 번역 적용
        this.configDiv.querySelectorAll('.target_translate').forEach((itemOne) => {
            itemOne.innerHTML = selfs.trans(itemOne.innerHTML);
        });

        // 레이어 영역 (안쪽)
        const layer = this.configDiv.querySelector('.shuttingstar_configlayer');
        layer.style.zIndex = this.canvasZindex + 2;
        layer.style.width  = '80%';
        layer.style.height = Math.round(this.canvas.offsetHeight * 0.8) + 'px';

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
            if(confirm(selfs.trans('Do you want to reset all?'))) {
                selfs.resetAll();
            }
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

    /** 상세설정 창 열기 */
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
            html += "<option value='" + this.settingsGraphicQuality[idx] + "'>" + this.settingsGraphicQuality[idx] + "</option>";
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
            if(songOne.serial == '' || songOne.serial == null) songOne.serial = 'nonofficial_' + Math.floor(Math.random() * 999999999) + '' + Math.floor(Math.random() * 999999999);
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

    /** 상세설정 창 닫기 */
    closeConfigDiv() {
        this.configDiv.classList.add('invisible');
        this.pops.dim.classList.add('invisible');
        this.keyEventDisabled = false;
        this.canvas.focus();
    }

    /** 커스텀 곡 JSON 상단 주석 내용 반환 */
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
#      , timeConstant   : (integer) Note timing correction value (+)
#      , timeMultiplier : (integer) Note timing correction value (×)
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

    /** 언어 번역 (stringTable 이용, 없으면 매개변수 값 그대로 반환) */
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

    /** render 메소드 내에서 사용되는 font 값 중 글꼴 파트 반환, pointFont 는 강조하고 싶을 때 true 를 입력 (선택사항) */
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
    
    /** 게임 내 무대 크기 (stageSize.w) 를 실제 화면 내 좌표 (resolution.w) 로 변환 */
    convertX(x) {
        return Math.round((x * this.resolution.w / this.getStageWidth()) + this.getLeftMarginStage());
    }

    /** 게임 내 무대 크기 (stageSize.h) 를 실제 화면 내 좌표 (resolution.h) 로 변환 */
    convertY(y, allowReverse) {
        if(allowReverse) {
            if(this.reverseVertical) {
                return (this.resolution.h - ( y * this.resolution.h / this.getStageHeight() )) + this.getTopMarginStage();
            }
        }
        return Math.round((y * this.resolution.h / this.getStageHeight()) + this.getTopMarginStage());
    }

    reverseConvertX(x) {
        return (x * this.getStageWidth() / this.resolution.w) + this.getLeftMarginStage();
    }

    reverseConvertY(y) {
        return (y * this.getStageHeight() / this.resolution.h) + this.getTopMarginStage();
    }

    /** 컬러 변환 시도 (alpha 값 미지원 시) */
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

    /** 폰트 크기 변환 */
    convertFontSize(num) {
        return Math.floor(num * (this.resolution.h * 1.0 / this.stageSize.h) * this.fontSizeRatio); // 해상도와 스테이지 크기 비율 구하기 (세로 길이만 반영)
    }

    /** URL 변환 */
    convertURL(url) {
        url = String(url).trim();
        if(url.indexOf('http://') == 0 || url.indexOf('https://') == 0) return url;
        if(url.indexOf('[CTX]') == 0) url = ShuttingStarsUtility.replaceString(url, '[CTX]', this.urlCtx);
        if(url.indexOf('.') == 0) return url;

        if(this.urlCtx.indexOf('/') == this.urlCtx.length - 1) this.urlCtx += '/';
        if(url.indexOf('/') == 0) return this.urlCtx + url.substring(1);

        return url;
    }

    /** 타이틀 화면 내 로딩 화면 중 처리 작업 */
    loadAfter() {
        const selfs = this;
        return new Promise((resolve, reject) => {
            selfs.addStarlights();
            selfs.loadPlugins().then(() => {
                selfs.loadPackages().then(() => {
                    setTimeout(() => {
                        resolve(true);
                    }, 300);
                }).catch((e1) => { reject(e2) });
            }).catch((e2) => { reject(e2); });
        });
    }

    /** 장식용 별빛 추가 */
    addStarlights() {
        let idx;
        // 기존 별빛 제거
        for(idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if(obj instanceof Starlight) { this.objects.splice(idx, 1); idx--;}
        }

        // 별빛 추가
        for(idx=0; idx<this.backStarlightCount; idx++) {
            const obj = new Starlight();
            obj.speedX = 1;
            obj.speedY = 0;
            this.objects.push(obj);
        }
    }

    /** 장식용 별빛 갯수 맞추기 */
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
            newOne.x = -2;
            newOne.speedX = 1;
            this.objects.push(newOne);

            count++;
        }
    }

    /** 곡 패키지 불러오기 */
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

    /** 틱 효과음 재생 */
    playTick() {
        if(this.se.tick == null) return;
        try {
            this.se.tick.currentTime = 0;
            this.se.tick.play();
        } catch(e) { console.error(e); }
    }

    /** 플러그인 불러오기 */
    async loadPlugins() {
        this.pluginApplied = [];
    }

    /** JSON 객체를 읽어 ShuttingStarsSong 객체 생성 */
    parseSong(json) {
        if(typeof(json) == 'string') json = JSON.parse(json);

        let idx;
        let song = new ShuttingStarsSong();

        song.name           = json.name;
        song.composer       = json.composer;
        song.noteWriter     = json.noteWriter;
        song.bgaUrl         = json.bgaUrl;
        song.musicUrl       = json.musicUrl;
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
            song.serial = 'CUSTOMSONG_' + (Math.random() * 99999999) + '' + (Math.random() * 99999999);
        }

        if(json.decorations) {
            if(typeof(json.decorations) == 'string') json.decorations = JSON.parse(json.decorations);
            song.decorations = json.decorations;
        }

        return song;
    }

    /** 외부에서 곡 추가 시 호출 */
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
            song.serial = 'CUSTOMSONG_' + (Math.random() * 99999999) + '' + (Math.random() * 99999999);
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

    /** 부동소수 동일여부 확인 (노트 생성 타이밍에 사용) */
    checkEqualFloats(a, b) {
        return Math.abs(a - b) < 0.000001;
    }

    /** 저장된 로컬 기록들 반환 */
    getRecords() {
        let storageStrings = localStorage.getItem('shuttingstar_records');
        if(typeof(storageStrings) == 'undefined' || storageStrings == '' || storageStrings == null) return [];
        let storageJson = JSON.parse(storageStrings);
        if(storageJson == null) storageJson = [];
        return storageJson;
    }

    /** 저장된 인터넷 기록들 반환, 백엔드 연결 없으면 null 반환, Promise */
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

    /** 기록 저장 */
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

    /** 전체 초기화 */
    resetAll() {
        const fAfter = function() { location.reload(); }
        try { localStorage.setItem('shuttingstar_settings', ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        try { localStorage.setItem('shuttingstar_songs'   , ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        try { localStorage.setItem('shuttingstar_packages', ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        try { localStorage.setItem('shuttingstar_records' , ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        try { localStorage.setItem('shuttingstar_session' , ''); } catch(e) { try { localStorage.clear(); } catch(e2) {}; fAfter(); return; }
        fAfter();
    }

    /** 시각화 디버깅 데이터 콘솔에 출력 */
    consoleVisualizeDebugData() {
        let idx, jdx;
        let line;
        let averages = []; // TODO : 그냥 평균을 낼 게 아니라 일정 시간 동안만 평균을 내야 함

        let maxLen = 0;
        // 각 데이터 길이 최대 필드 감지
        for(idx=0; idx<this.visualizePeakDebugData.length; idx++) {
            const dataOne = this.visualizePeakDebugData[idx];
            if(maxLen <= dataOne.values.length) maxLen = dataOne.values.length;
        }

        // 평균 데이터 미리 0으로 채우기 (합 먼저 진행)
        for(idx=0; idx<maxLen; idx++) {
            averages.push(0);
        }

        console.log('[ DATA START ]');
        for(idx=0; idx<this.visualizePeakDebugData.length; idx++) {
            const dataOne = this.visualizePeakDebugData[idx];
            
            line = String(dataOne.time);
            for(jdx=0; jdx<dataOne.values.length; jdx++) {
                line += ', ' + String(dataOne.values[jdx]);
                averages[jdx] += dataOne.values[jdx];
            }
            console.log(line);
        }
        console.log('[ DATA END ]');

        // 평균 산출
        console.log('[ AVERAGES ]');
        line = '';
        for(idx=0; idx<averages.length; idx++) {
            averages[idx] = averages[idx] * 1.0 / this.visualizePeakDebugData.length;
            if(idx > 0) line += ', ';
            line += String(averages[idx]);
            console.log(line);
        }

        // 평균 이상인 시간대 출력
        console.log('[ OVERTIMES ]');
        for(idx=0; idx<this.visualizePeakDebugData.length; idx++) {
            const dataOne = this.visualizePeakDebugData[idx];
            let peaks = 0;

            for(jdx=0; jdx<dataOne.values.length; jdx++) {
                const valueOne = dataOne.values[jdx];
                if(valueOne > averages[jdx]) {
                    peaks++;
                }
            }

            if(peaks >= averages.length / 2.0) console.log(dataOne.time);
        }
    }
}

const _shuttingstarcore = new ShuttingStarsCore();

/** 곡 */
class ShuttingStarsSong {
    name = '';
    composer = '';
    noteWriter = ''; // 노트 작가
    description = ''; // 설명
    musicUrl = ''; // 음원 URL
    thumbnailUrl = ''; // 썸네일 이미지 URL (BASE64 가능)
    bgaUrl = ''; // 플레이 중 배경 영상 URL 로 쓰려고 했으나, 아직은 미지원
    loadingTime = 10; // 추가 로딩시간 (곡 선택 후 곡 타이틀이 풀스크린으로 나오는 시간 증가, 0으로 해도 기본 시간이 존재함)
    bpm = 120.0; // beat per minute, 곡의 속도
    endTime = 560; // 곡 종료 시간
    noteMultiplier = 1; // 보정 배수 (패턴 타이밍 값에 * 보정값으로 적용)
    timeMultiplier = 1; // 보정 시간 (노트 위치 값에 * 보정값으로 적용)
    timeConstant = 0; // 보정 시간 (노트 위치 값에 + 보정값으로 적용, timeMultiply 보다 후순위로 적용)
    autoStars = true; // 자동 Starlight 생성
    test = false; // true 지정 시 곡 디버그 모드에서만 노출됨
    serial = ''; // 수정하지 말 것
    
    // 난이도 별 패턴
    // 배열로, 각 원소는 JSON객체로 구성
    // 원소의 JSON키
    //     difficultyLabel : easy, normal, hard, 그 뒤부터는 ex1, ex2, ex3, ... 순으로 난이도 이름 뒤에 ; (세미콜론) 뒤에 숫자로 난이도 표기한 문자열이 키로 사용
    //     difficultyLevel : 1, 2, 3, ... (정수로  입력)
    //     patterns : 배열로 그 안에 ShuttingStarsNotePattern 패턴들이 탑재
    difficulties = [];

    // 장식
    decorations = [];

    constructor() {}

    /** 노트 생성 위치 */
    getNoteCreationYLocation() {
        return _shuttingstarcore.getNoteCreationYLocation();
    }

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

    toJSONObject() {
        let idx, jdx;
        let obj = {};
        obj.name = this.name;
        obj.composer = this.composer;
        obj.noteWriter = this.noteWriter;
        obj.bgaUrl = this.bgaUrl;
        obj.musicUrl = this.musicUrl;
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
    constructor(inst) { super(); }
    prepare(inst) {}
    prepareNotes(inst, level) {
        const allCnt = inst.songDisplays.length;
        const rand   = Math.floor(Math.random() * allCnt);

        const choosed = inst.songDisplays[rand];
        this.musicUrl       = choosed.musicUrl;
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
            randValue = Math.random() + rateMin; // rateMin ~ (9.99999 + rateMin)
            randValue -= (rateAfter * noteCreatedAfter);
            if(randValue < 0) randValue = 0;
            if(randValue > 1) randValue = 1;

            if(randValue <= ratePoint) {
                console.log(idx + '\t MATCHED \t' + randValue + '\t' + ratePoint + ', ' + (rateAfter * noteCreatedAfter));
                noteCreatedAfter = 0; // 초기화
                difficulty.patterns.push({ locationIndex : -1, time : idx }); // 노트 타이밍 생성
            } else {
                console.log(idx + '\t NOT MATCHED \t' + randValue + '\t' + ratePoint + ', ' + (rateAfter * noteCreatedAfter));
                noteCreatedAfter++; // 다음 번 타이밍에 노트 생성할 확률 증가
            }
        }
        
        this.difficulties.push(difficulty);
    }
}

class EasySurvive extends ShuttingStarsMission {
    constructor(inst) {
        super(inst);
        this.name = 'SURVIVE (EASY)'
        let desc = inst.trans('Survive (EASY)');
        desc += '\n' + inst.trans('Random song, random notes (May not fit tempos)');
        this.description = desc;
    }
    prepare(inst) {
        this.prepareNotes(inst, 3);
    }
}

class NormalSurvive extends ShuttingStarsMission {
    constructor(inst) {
        super(inst);
        this.name = 'SURVIVE (NORMAL)'
        let desc = inst.trans('Survive (NORMAL)');
        desc += '\n' + inst.trans('Random song, random notes (May not fit tempos)');
        this.description = desc;
    }
    prepare(inst) {
        this.prepareNotes(inst, 5);
    }
}

class HardSurvive extends ShuttingStarsMission {
    constructor(inst) {
        super(inst);
        this.name = 'SURVIVE (HARD)'
        let desc = inst.trans('Survive (HARD)');
        desc += '\n' + inst.trans('Random song, random notes (May not fit tempos)');
        this.description = desc;
    }
    prepare(inst) {
        this.prepareNotes(inst, 9);
    }
}

/** 노트가 생성될 위치와 시간 (즉 패턴) */
class ShuttingStarsNotePattern {
    id = 0; // 고유 번호, 게임 내에서 초기화됨
    locationIndex = 0; // 음수 지정 시 랜덤 생성
    time = 0.0;
    constructor(locationIndex, time) {
        this.locationIndex = locationIndex;
        this.time = time;
    }
}

/* 게임 내 Note 및 NotePlacer 의 상위 클래스 */
class ShuttingStarsObject {
    id = 0;
    x = 0;
    y = 0;
    r = 0; // rect 타입인 경우 w 대신
    h = 0;
    speedX = 0;
    speedY = 0;
    opacity = 1.0;
    shape = 'circle';
    color = 'rgba(200, 200, 200, 0.99)';
    fill = true; // 채우기 여부 / false 인 경우 채우기 없이 테두리만 출력
    explosing = 0; // 0 : 일반적인 상황, 1~8 : 폭발 처리 애니메이션 진행상황
    explosingMax = 8;
    explosingSpeed = 1; // 폭발 속도
    constructor() {}
    draw(ctx) {
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
                ctx.fillStyle = _shuttingstarcore.convertColor('rgba(' + this.color + ', ' + this.opacity + ')');
                ctx.fillRect(_shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y, true), _shuttingstarcore.convertX(this.r), _shuttingstarcore.convertY(this.h));
            } else {
                ctx.strokeStyle = _shuttingstarcore.convertColor('rgba(' + this.color + ', ' + this.opacity + ')');
                ctx.lineWidth = 1;
                ctx.strokeRect(_shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y, true), _shuttingstarcore.convertX(this.r), _shuttingstarcore.convertY(this.h));
            }
        }
    }

    modifyExplosiveColor() {
        return this.color;
    }

    modifyExplosiveOpacity() {
        let opa = this.opacity;
        if(this.explosing >= 1) {
            opa = 1.0 - (this.explosing * 1.0 / this.explosingMax);
        }
        return opa;
    }

    /** 다른 객체와 적정거리 이내 접근 감지 (수직 충돌만 감지) 접근이 감지된 경우 두 객체간의 수직거리를 양수로 반환, 그외의 경우 음수를 반환 */
    isMeetVerticalRangeIn(otherObject) {
        if(((this instanceof NotePlacer) && (otherObject instanceof Note)) || ((this instanceof Note) && (otherObject instanceof NotePlacer))) {
            const distance = Math.abs(this.y - otherObject.y);

            if(distance < (this.r + otherObject.r) * _shuttingstarcore.noteSpeedMultiplier * (_shuttingstarcore.noteSpeedFixedConst * 4)) return distance;
            return -1;
        }
        return -1;
    }

    /** 다른 객체와의 충돌 감지 (수평 좌표는 동일하다고 가정하여 수직 충돌만 감지) */
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

    /** 다른 객체와의 충돌 감지 */
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

    /** 라인 별 컬러 */
    getColorOfLocationIndex(locationIndex) {
        // 총 6개의 라인, 순서대로 빨주노초파남
        if(locationIndex == 0) {
            return '180, 80, 180';
        } else if(locationIndex == 1) {
            return '230, 180, 80';
        } else if(locationIndex == 2) {
            return '230, 230, 80';
        } else if(locationIndex == 3) {
            return '180, 230, 80';
        } else if(locationIndex == 4) {
            return '80, 230, 80';
        } else if(locationIndex == 5) {
            return '80, 230, 230';
        }
        return '200, 200, 200';
    }
}

/** Note 제거기 혹은 Note 그 자체의 상위 클래스, "키"를 가짐 */
class NoteKeyObject extends ShuttingStarsObject {
    key = '';
    locationIndex = 0;
    dark = false;
    constructor(locationIndex) {
        super();
        this.locationIndex = locationIndex;
        this.key = _shuttingstarcore.keyList[locationIndex];
    }
    /** 기존 투명도 (Opacity) 에 explosing 반영 */
    getNowOpacity() {
        return this.opacity * (1.0 - (this.explosing * 1.0 / this.explosingMax));
    }
    draw(ctx) {
        super.draw(ctx);

        // 키 표시 (중앙에 출력하며, 크기는 내부에 들어오도록 폰트 크기 계산해야 함)
        let fontSize = _shuttingstarcore.convertFontSize(Math.round(this.r / 1.1));
        ctx.font = 'bold ' + fontSize + 'px ' + _shuttingstarcore.getRenderFontFamily();

        if(this.dark) ctx.fillStyle = _shuttingstarcore.convertColor('rgba(200, 200, 200, ' + this.getNowOpacity() + ')');
        else          ctx.fillStyle = _shuttingstarcore.convertColor('rgba(80, 80, 80, ' + this.getNowOpacity() + ')');

        ctx.textAlign = "center";
        ctx.fillText(this.key, _shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y + (fontSize / 4.0), true)); // Note 중앙에 출력
    }
}

/** Note 제거기, 화면 내 고정위치에 떠 있으며, 플레이어가 해당 키 입력 시, 해당 위치를 지나는 노트를 제거하며 점수를 획득함. 또한 노트와 위치가 얼마나 동일한지에 따라 점수 계산 */
class NotePlacer extends NoteKeyObject {
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
    }
}

/** 노트, 곡 패턴에 따라 화면 최하단에 생성되며 위로 올라감. */
class Note extends NoteKeyObject {
    removed = false; // 노트 처리 여부를 지정, true 여도 아직 삭제된 것이 아니므로 (충돌효과 중) 렌더링은 해야 함

    // 게임 처리 중 초기화됨
    patternId = 0;   
    originalTiming = 0;

    // 이동할 때마다 콘솔로 위치를 띄울 것인지 지정
    debugTarget = false;

    // 생성자
    constructor(locationIndex) {
        super(locationIndex);
        this.r = _shuttingstarcore.getNoteRadius();
        this.speedY = 0;
        this.removed = false;
        this.explosing = 0;

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
    /** 기존 투명도 (Opacity) 에 explosing 반영 */
    getNowOpacity() {
        // this.explosing 반영된 opacity 값 반환
        // this.opacity 값인 0.9 에서 시작, this.explosing 값이 0~3 까지 증가하는 동안 점진적으로 1.0 까지 증가
        // 이후 this.explosing 값이 4~8 까지 점진적으로 감소하여 8 이 되면 0이 되어야 함
        let opacity = this.opacity;
        if(this.explosing >= 0 && this.explosing <= 3) {
            opacity += (0.1 * this.explosing); // 0.9 -> 1.0
        } else if(this.explosing > 3 && this.explosing <= this.explosingMax) {
            opacity += (0.4 - (0.08 * (this.explosing - 3))); // 1.0 -> 0.0
        } else if(this.explosing > this.explosingMax) {
            opacity = 0.0;
        }
        return opacity;
    }
}

/** 판정 글씨와 콤보 마크 */
class JudgeMark extends ShuttingStarsObject {
    judgeResult = null; // PERFECT / GREAT / GOOD / BAD / MISS
    explosing = 1; // 0 : 일반적인 상황, 그 이상으로 가면 이 마크 제거 (혹은 Note 제거기 동작) 1~16 : 처리 애니메이션 진행상황
    explosingMax = 16;
    constructor(judgeResult) {
        super();
        this.judgeResult = judgeResult;
    }

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
        
        let midX = _shuttingstarcore.getStageWidth()  / 2;
        let midY = _shuttingstarcore.getStageHeight() / 2;
        ctx.fillText(this.judgeResult, _shuttingstarcore.convertX(midX), _shuttingstarcore.convertY(midY)); // 화면 중앙에 출력

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

    /** 기존 투명도 (Opacity) 에 explosing 반영 */
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

    /** 다른 객체와의 충돌 감지 (수평 좌표는 동일하다고 가정하여 수직 충돌만 감지) - 판정 마크는 충돌 없음 */
    isConflictedVertical(otherObject) {
        return false;
    }

    /** 다른 객체와의 충돌 감지 - 판정 마크는 충돌 없음 */
    isConflicted(otherObject) {
        return false;
    }
}

/** 마우스 클릭 지점 확인을 위한 객체 (충돌여부 판단을 통해 해당 객체를 클릭했음을 인식) */
class MouseEventArea extends ShuttingStarsObject {

}

/** 장식용 상위 객체 */
class DecorationObject extends ShuttingStarsObject {
    peakColor = '255, 255, 255';
    priority = 'low';
    constructor(locationIndex) {
        super(locationIndex);
    }
}

/** 장식용 별빛 객체 */
class Starlight extends DecorationObject {
    constructor() {
        super(0);
        this.r = Math.round(Math.random() * 3.0) + 1;
        this.x = Math.round(Math.random() * _shuttingstarcore.getStageWidth());
        this.y = Math.round(Math.random() * _shuttingstarcore.getStageHeight());
        this.shape = 'circle';
        this.opacity = 0.5 + (0.49 * Math.random());
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

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(_shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y, true), _shuttingstarcore.convertX(this.modifyExplosiveR()), 0, 2 * Math.PI);

        ctx.fillStyle = _shuttingstarcore.convertColor('rgba(' + this.modifyExplosiveColor() + ', ' + this.modifyExplosiveOpacity() + ')');
        ctx.fill();
    }

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
    constructor(locationIndex, y, color, peakColor) {
        super(locationIndex, y, color, peakColor);
    }
}

/** 노트 미스 폭발 효과 */
class FailExplosing extends ExplosingObject {
    constructor(locationIndex, y, color, peakColor) {
        super(locationIndex, y, color, peakColor);
    }
}

/** 게임오버 최종 폭발 효과 */
class PlanetExplosing extends ExplosingObject {
    constructor(locationIndex, y, color, peakColor) {
        super(locationIndex, y, color, peakColor);
    }
}

/** 마우스 클릭 표시 */
class MouseClickHighlighter extends ExplosingObject {
    constructor() {
        super(0, 0, '255,255,255', '255,255,255');
    }
}

/** 텍스트 출력 장식 */
class TextDeco extends DecorationObject {
    text = '';
    fontSize = 10;
    align = 'center';
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

    getNowOpacity() {
        let opa = 0.9;
        if(this.explosing >= 3) opa -= 0.2;
        if(this.explosing >= 4) opa -= (0.02 * (this.explosing - 3));
        if(opa < 0) opa = 0;
        this.opacity = opa;
        return opa;
    }

    draw(ctx) {
        this.ctx.textAlign = this.align;
        this.ctx.fillStyle = this.convertColor('rgba(' + this.color + ', ' + this.getNowOpacity() + ')');
        this.ctx.fillText(this.text, this.convertX(this.x), this.convertY(this.y));
    }
}

/** 가상 키 객체 */
class VirtualKey extends DecorationObject {
    key = 'S';
    fontSize = 30;
    wGap = 12;
    hGap = 12;
    click = function() {};
    release = function() {}
    constructor(key) {
        super(0);

        const charUnitW = (this.fontSize * 2) + this.wGap;
        const charUnitH = (this.fontSize * 2) + this.hGap;
        const charUnitWP = Math.round(charUnitW * 1.5);
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
    getNowOpacity() {
        return this.opacity * (1.0 - (this.explosing * 1.0 / this.explosingMax));
    }
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

/********************** 기타 Util 성 prototype 세팅 ************************/
if(!String.prototype.hexEncode) {
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
    /** 초기화 작업 (scene, renderer 를 여기서 생성) */
    init(canvas3d, coreInst) {}
    /** 동시처리 작업이 필요한 경우 여기서 진행 */
    simultaneousJob(coreInst) {}
    /** 렌더링 시마다 호출해야 함 */
    render(canvas3d, objects) {} // object3ds
    /** 창 크기 변경 시 호출해야 함 */
    onWindowResize(canvas3d, coreInst) {}
}
class ShuttingStars3DObject {
    constructor(manager) {}
    getMeshes(manager) { return []; }
}
/********************** // 3D 를 다루는 Class 세팅 ************************/
/********************** 기타 Util 성 Class 세팅 ************************/
class ShuttingStarsUtilityClass {
    toastIndex = 0;

    /** 문자열 치환 */
    replaceString(originalStr, targetStr, replacements) {
        return String(originalStr).split(targetStr).join(replacements); 
    }

    /** 해당 문자열을 각 줄로 나눠, commentChar 문자로 시작하는 줄 제거하고 다시 합쳐 반환 */
    removeLinesStartKey(originalString, commentChar) {
        let res = '';
        let splits = String(originalString).split('\n');

        for(const line of splits) {
            if(line.trim().indexOf(commentChar) == 0) continue;
            res += line + '\n';
        }
        return res.trim();
    }

    /** 자연수 (양의 정수)와 자리수(역시 양의 정수) 입력 받아, 해당 자리수에 맞는 문자열로 변환, 숫자를 표현하고 남은 자리수는 빈 문자열(공백) 로 앞부분을 채움 */
    fitDigit(naturalValue, digit) {
        let res = String(naturalValue);
        while(res.length < digit) {
            res = ' ' + res;
        }
        return res;
    }

    /** 모바일 환경인지 감지 */
    isTouchScreenPlatform() {
        let val1 = false;
        let val2 = false;
        try { val1 = window.matchMedia('(pointer: coarse)').matches;           } catch(e) {}
        try { val2 = 'ontouchstart' in window || navigator.maxTouchPoints > 0; } catch(e) {}
        return val1 || val2;
    }

    /** 토스트 메시지 출력, msg 에는 출력할 텍스트 입력 (필수), red 는 배경색 강조표시로 bool (true/false, 선택사항) 로 입력, duration 은 유지시간으로 정수값 (milliseconds, 선택사항) 입력  */
    toast(msg, red, duration) {
        let uniqNo = this.toastIndex;
        this.toastIndex++;

        msg = String(msg);

        let uniqid = 'toast' + (Math.random() * 99999999) + '' + uniqNo;
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

    /** fnWork 함수를 timeGapMillis 주기로 반복 호출, 오차 방지 포함, 참고 : https://sirius7.tistory.com/156 , 이 반복을 종료하는 함수를 반환함. */
    repeat(fnWork, timeGapMillis) {
        let expected = Date.now() + timeGapMillis;
        let switchStop = false;

        const fStep = function() {
            if(switchStop) return;
            fnWork();
            if(switchStop) return;

            const drift = Date.now() - expected;
            expected += timeGapMillis;
            
            setTimeout(fStep, Math.max(0, timeGapMillis - drift));
        }
        setTimeout(fStep, timeGapMillis);

        return function() { switchStop = true; }
    }

    round2(numbers) {
        return Math.round(numbers * 100.0) / 100.0;
    }

    round3(numbers) {
        return Math.round(numbers * 1000.0) / 1000.0;
    }

    floor2(numbers) {
        return Math.floor(numbers * 100.0) / 100.0;
    }

    floor3(numbers) {
        return Math.floor(numbers * 1000.0) / 1000.0;
    }
}
const ShuttingStarsUtility = new ShuttingStarsUtilityClass();
const SSUtil = ShuttingStarsUtility;
/********************** // 기타 Util 성 Class 세팅 ************************/

/********************** 외부에서 호출할 수 있도록 함수 구현 ************************/

/** 곡 추가 */
function addShuttingStarSong(song) {
    return _shuttingstarcore.addSong(song);
}

/** 3D 매니저 등록 / 해제 */
function setShuttingStar3D(obj) {
    setTimeout(function() { _shuttingstarcore.set3DManager(obj); }, 1000);
}

/** 게임 활성화 - 특정 영역에 게임 캔버스를 배치하려는 경우 매개변수로 DOM객체를 입력 */
function initShuttingStars(param) {
    try { return _shuttingstarcore.init(param); } catch(e) { ShuttingStarsUtility.toast('ERROR : ' + e, true); console.error(e); }
}
