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

    virtualKey = false; // 가상 키 출력 여부

    fontSizeRatio = 1.0; // 글꼴 크기 비율 (해상도와 별도)
    canvasZindex = 1;    // canvas 태그의 z-index
    
    dark = true;
    reverseVertical = false;
    keyList = ['S', 'D', 'F', 'H', 'J', 'K']; // 입력 키
    arrowKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT'];
    enterKey = 'ENTER';
    escKey = 'ESCAPE';

    fontFamily = 'D2Coding'; // NanumGothicCoding / D2Coding

    canvas = null;    // 캔버스 객체
    configDiv = null; // 상세 설정 영역

    ctx = null;      // 2D Context 객체
    audioCtx = null; // Audio Context 객체 (미지원 시 null 유지)
    urlCtx = './';   // URL Context Path

    useAudioVisualizer = true;
    audioAnalyser = null; // Audio Analyser 객체 (미지원 시 null 유지)
    audioBufferLen = 0;   // Audio 시각화에 쓰일 배열 크기
    audioBuffer = null;   // Audio 시각화에 쓰일 배열

    frameTime = 10;             // render 호출 주기 (변경 불가)
    timeMultiplier = 16.0;      // 노트의 촘촘함 최대값으로, 8로 지정 시 8배속 속도의 폭타까지 등장할 수 있다는 것을 의미 (변경 불가)
    stageRows = 72;             // 스테이지의 세로를 N등분하여 패턴의 시간과 매칭 (변경 불가)
    sizeFixedConst = 2;         // 노트 크기 상수 (변경 불가)
    noteSpeedFixedConst = 0.25; // 노트 이동 속도 배수 (변경 불가)
    resumeDelayTime = 16;       // 일시정지 후 재개 전 대기 타임 (변경 불가)
    songTitleBaseTime = 80;     // 곡 로딩 기본 시간 (변경 불가)

    noteSpeedMultiplier = 2.0;  // 노트 이동 속도 배수 (사용자가 지정 가능)

    lastObjectId = 0;   // 객체 ID 부여용 카운터
    objects = [];       // 항상 렌더링 대상인 객체들
    objectsPlaying = []; // 상태가 playing 중일 때 렌더링 대상 객체들
    notePlacers    = []; // NotePlacer 객체들 보관

    elapsedTime = 0; // 진행 시간 (실제 시간과 단위가 다르며, 곡마다 속도가 다름, 곡의 패턴 배열의 N번째 숫자에 해당)

    usingWorker = true; // Worker 사용여부
    timeProgressKey = null; // 시간 진행 타이머 키가 들어가는 변수

    workerRender = null;
    workerSongPlaying = null;
    workerSimultaneousWork = null;

    point = 0;     // 점수
    combo = 0;     // 콤보
    missCombo = 0; // 미스 콤보
    report = {
        PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0 // 각 판정별 통계
    };
    hp = 100.0; // 다 깎이면 게임 오버 (gameOverEnabled 를 true 지정 시)

    gameOverEnabled = true;  // true 시 hp 0 이면 게임 오버, false 시 일단 곡 끝까지 진행은 가능
    gameOverDelayed = false; // hp 가 한번이라도 0 이하로 내려간 경우 true

    state = 'title'; // 현재 상태, title / menu / songchoosing / songtitle / playing / gameover / result / setting / credit

    song = null; // 현재 플레이 중인 곡, ShuttingStarsSong 객체
    songs = []; // 선택 가능한 곡들, ShuttingStarsSong 객체 배열

    difficulty = null; // 선택된 난이도
    audio = null;      // 현재 선택된 곡의 오디오 객체
    songThumb = null;  // 현재 선택된 곡의 썸네일 이미지 URL
    videoBga = null;   // 현재 선택된 곡의 BGA URL
    songBitGap = 0;    // 현재 선택된 곡의 1사이클 길이 (bpm에 따라 다름)
    songLastPatternTime = 0; // 현재 선택된 곡의 마지막 패턴의 시간
    audioSource = null; // 시각화를 위한 변수 중 하나

    songChoosing = null; // 현재 선택된 곡, ShuttingStarsSong 객체로 songs 목록에 있어야만 함
    difficultyChoosing = false; // 곡 선택은 됐고 난이도를 선택하고 있는 상황임을 표시
    difficultyChoosingList = [];// 매번 배열 추출할 수는 없으니 난이도 목록을 임시로 넣어두는 배열

    songTitleTime = 0; // 선택된 곡 준비 중 화면 남은 시간
    gameoverTime = 0; // 게임 오버 마크 화면 남은 시간
    resumingTime = 0; // 일시정지 후 재개 전 대기 시간

    paused = false;
    resumed = false; // 일시정지 재개 전 대기시간 완료 시 임시로 사용하는 값
    simultaneousWorkCycle = 0;

    officialSongSerials = ['nai4ilaHbn7g93gn34nf9afn438zJ93f8gp34qgD39p4g'];

    colorManualAlpha = false;

    menuList = ['play', 'setting', 'credit'];
    menuChoosing = null;

    settingList = ['fixKeypressTiming', 'fixSongTiming', 'setNoteSpeedMultiplier', 'setGraphicQuality', 'resetAll'];
    settingChoosing = null;
    settingModifyingMode = false;
    settingsGraphicQuality = ['LOW', 'MEDIUM', 'HIGH', '4K'];
    settingGraphicQualityChoosing = null;
    settingResetReask = false;

    keypressTiming = 0; // 키 입력 추가 딜레이 보정값
    songTiming = 0; // 음원 재생 딜레이 보정값

    // 렌더링 디버그 모드, true 시 JSON 객체를 objects 에 넣어 임의의 도형 추가 가능, 예: {type : 'circle', x: 100, y : 100, r : 10, color : 'rgb(255, 255, 255)'}
    renderDebugMode = false;
    // 스트링 테이블 디버그 모드, 번역 가능 키워드가 화면에 나올 때마다 콘솔에도 출력
    stringTableDebugMode = true;
    // 키보드 입력 디버그 모드
    keyInputDebugMode = false;
    // 마우스 클릭 디버그 모드
    mouseClickDebugMode = true;
    
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

    // 불러온 플러그인 목록
    pluginApplied = [];

    constructor() {}
    
    /** 초기화 (게임이 출력될 div 영역 객체를 입력) */
    init(rootDiv) {
        try {
            // Set HTML
            if(typeof(rootDiv) == 'undefined') {
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
            rootDiv.innerHTML = "";
            let htmls = '';
            htmls += "<div class='shuttingstars_canvas_root'>      \n";
            htmls += "    <canvas class='shuttingstars_canvas'>    \n";
            htmls += "                                             \n";
            htmls += "    </canvas>                                \n";
            htmls += "    <div class='shuttingstars_canvas_config'>\n";
            htmls += "    </div>                                   \n";
            htmls += "</div>                                       \n";
            rootDiv.innerHTML = htmls;

            // Set global CSS
            let styles = `
                .shuttingstars_root .full { width: 100%; }
                .shuttingstars_root .invisible { display: none !important; }
                .shuttingstars_root .ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            `;
            const styleElem = document.createElement('style');
            styleElem.type = 'text/css';
            styleElem.innerHTML = styles;
            document.head.appendChild(styleElem);

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

            // 캔버스 설정
            const canvas = rootDiv.querySelector('.shuttingstars_canvas');
            if(this.detectScreenLandscape()) {
                canvas.style.minWidth  = '1280px';
                canvas.style.minHeight = '720px';
            } else {
                canvas.style.minWidth  = '720px';
                canvas.style.minHeight = '1280px';
            }
            canvas.style.zIndex    = this.canvasZindex;

            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');

            // 그래픽 해상도 설정
            this.settingGraphicQualityChoosing = this.settingsGraphicQuality[1];
            this.setResolution(this.ressets.w, this.ressets.h);

            // 가상 키 사용여부 지정
            this.virtualKey = ShuttingStarsUtility.isTouchScreenPlatform();

            // 설정 불러오기
            this.loadSettings();
            
            // 곡 불러오기
            this.loadSongs();

            const selfs = this;

            // worker 사용 가능여부 체크
            if(String(window.location.href).indexOf('http') != 0) this.usingWorker = false;

            // 반복 처리 프로세스 2개 (렌더링, 공통 동시처리 프로세스) 시작 (곡 동시처리 프로세스는 곡 초기화 시 진행)
            if(this.usingWorker) {
                this.workerRender = new Worker( this.convertURL('/resources/js/shuttingstarworker.js') );
                this.workerRender.postMessage({interval : this.frameTime});
                this.workerRender.onmessage = function(e) {
                    // const {drift, time} = e.data;
                    selfs.render();
                }

                this.workerSimultaneousWork = new Worker( this.convertURL('/resources/js/shuttingstarworker.js') );
                this.workerSimultaneousWork.postMessage({interval : this.frameTime});
                this.workerSimultaneousWork.onmessage = function(e) {
                    // const {drift, time} = e.data;
                    selfs.simultaneousWork(selfs.simultaneousWorkCycle); selfs.simultaneousWorkCycle++; if(selfs.simultaneousWorkCycle >= 10000) selfs.simultaneousWorkCycle = 0;
                }
            } else {
                this.repeat(() => { selfs.render(); }, this.frameTime);
                this.repeat(() => { selfs.simultaneousWork(selfs.simultaneousWorkCycle); selfs.simultaneousWorkCycle++; if(selfs.simultaneousWorkCycle >= 10000) selfs.simultaneousWorkCycle = 0; }, 20);
            }

            document.addEventListener('keydown', (event) => {
                if(selfs.keypressTiming <= 0) {
                    selfs.handleKeyInput(event.key.toUpperCase(), true);
                } else {
                    setTimeout(() => { selfs.handleKeyInput(event.key.toUpperCase(), true); }, selfs.keypressTiming);
                }
            });

            this.canvas.addEventListener('click', (event) => { // TODO
                const rect = canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                // 실제좌표가 canvas 의 해상도와 다르므로 변환이 필요
                const rx = Math.floor((x * selfs.stageSize.w) / rect.width );
                const ry = Math.floor((y * selfs.stageSize.h) / rect.height);

                if(selfs.mouseClickDebugMode) console.log('[MOUSECLICKED] ' + x + ', ' + y + " -> " + rx + ', ' + ry);

                // 임시 객체 (충돌여부 판단 위함)
                const mouseCursorObject = new ExplosingObject(0, 0, '255, 255, 255', '255, 255, 255');
                mouseCursorObject.type = 'circle';
                mouseCursorObject.x    = rx;
                mouseCursorObject.y    = ry;
                mouseCursorObject.r    = 3;
                mouseCursorObject.fill = true;
                mouseCursorObject.explosing = 1;
                selfs.objects.push(mouseCursorObject);

                selfs.handleMouseClick(rx, ry, mouseCursorObject);
            });

            let hGap = window.outerWidth  - window.innerWidth;
            let vGap = window.outerHeight - window.innerHeight;
            if(hGap < 0) hGap = 0;
            if(vGap < 0) vGap = 0;

            const fResize = function() {
                // selfs.canvas.style.width  = (window.outerWidth  - hGap + 1) + 'px';
                selfs.canvas.style.height = (window.outerHeight - vGap + 1) + 'px';
                selfs.renderConfigDiv();

                // 기기의 방향이 바뀐 경우를 처리
                if((window.outerWidth < window.outerHeight && selfs.canvas.width > selfs.canvas.height) || (window.outerWidth > window.outerHeight && selfs.canvas.width < selfs.canvas.height)) {
                    selfs.setResolution(selfs.ressets.w, selfs.ressets.h);
                }
            };
            fResize();
            window.addEventListener('resize', fResize);

            // 설정 화면, PC인 경우 HTML 방식의 설정 화면 사용, 그외의 경우 canvas 방식의 설정 사용
            if(ShuttingStarsUtility.isTouchScreenPlatform()) this.configDiv = null;
            else this.configDiv = rootDiv.querySelector('.shuttingstars_canvas_config');
            this.renderConfigDiv();
            this.configDiv.style.display = 'none';

            this.loadAfter().then(() => {
                selfs.afterInitialized();
            }).catch((e) => {
                console.error(e);
                selfs.afterInitialized();
            });
        } catch(eGlobal) {
            ShuttingStarsUtility.toast('ERROR : ' + eGlobal, true);
            console.error(eGlobal);
        }
    }

    /** 초기화 완료 후 호출 */
    afterInitialized() {
        this.menuChoosing = this.menuList[0];
        this.setState('menu');
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

        // 일부 상태는 스테이지 리셋이 필요
        if(state == 'menu' || state == 'playing') {
            this.resetStage();
        }
    }

    /** 가상 키 추가 */
    addDeclaredKeys(realkey) {
        const selfs = this;
        const rkey = realkey;
        const vkey = new VirtualKey(rkey);
        selfs.objects.push(vkey);
        
        vkey.callback = function() {
            if(selfs.keypressTiming <= 0) {
                selfs.handleKeyInput(rkey, false);
            } else {
                setTimeout(() => { selfs.handleKeyInput(rkey, false); }, selfs.keypressTiming);
            }
        };

        selfs.mouseEvents.push({
            type : 'circle',
            x : vkey.x,
            y : vkey.y,
            r : vkey.r, // rect 인 경우 w 대신
            callback : () => {
                vkey.callback();
                vkey.explosing = 1;
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
        
        if(     this.ressets.w <= 1280) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0];
        else if(this.ressets.w <= 1920) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[1];
        else if(this.ressets.w <= 2560) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[2];
        else if(this.ressets.w <= 3840) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[3];
        else                            this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0];
    }

    /** 디스플레이 방향 (수직 portrait / 수평 landscape) 구분, landscape 인 경우 true, 그외의 경우 false 반환 */
    detectScreenLandscape() {
        return (window.outerWidth >= window.outerHeight);
    }

    /** 설정 불러오기 */
    loadSettings() {
        try {
            let settingJsonStr = localStorage.getItem('shuttingstar_settings');
            if(settingJsonStr) {
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
                    if(typeof(this.reverseVertical) == 'string') this.reverseVertical = ( (this.reverseVertical == 'Y' || this.this.reverseVertical == 'true') ? true : false );
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
            settingJson.resolution = this.resolution.w + ',' + this.resolution.h;
            settingJson.language = this.language;
            settingJson.languageDefault = this.languageDefault;

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
        
        // 스토리지에서 불러오기
        try {
            let songsArr = localStorage.getItem('shuttingstar_songs');
            if(typeof(songsArr) == 'undefined' || songsArr == null) return;
            if(typeof(songsArr) == 'string') songsArr = JSON.parse(songsArr);
            
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
            list.push(songOne);
        }

        // 스토리지에 저장
        try {
            localStorage.setItem('shuttingstar_songs', JSON.stringify(list));
        } catch(e) {
            console.log('Failed to save songs.');
            console.error(e);
        }
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
        
        for(idx=0; idx<this.keyList.length; idx++) {
            const notePlacer = new NotePlacer(idx);
            notePlacer.id = this.lastObjectId++;
            this.objectsPlaying.push(notePlacer);
            this.notePlacers.push(notePlacer);
        }

        if(this.song == null) { this.closeAudioSources(); this.audio = null; return; }

        // 곡 플레이 직전, 풀스크린 곡 타이틀 화면
        if(this.state == 'songtitle') {
            // 썸네일 체크해 이미지 객체 만들기
            if(this.song.thumbnailUrl) {
                if(this.songThumb == null) {
                    this.songThumb = new Image();
                    this.songThumb.src = this.song.thumbnailUrl;
                }
            } else {
                this.songThumb = null;
            }

            //     곡 오디오 세팅
            if(this.audio == null) {
                if(typeof(this.song.musicUrl) != 'undefined' && this.song.musicUrl != null && this.song.musicUrl != '') {
                    this.audio = new Audio(this.convertURL(this.song.musicUrl));
                    
                    this.closeAudioSources();
                    if(this.useAudioVisualizer) {
                        try {
                            // Audio Context ( https://developer.mozilla.org/ko/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API )
                            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                            this.audioAnalyser = this.audioCtx.createAnalyser();
        
                            this.audio = new Audio(this.convertURL(this.song.musicUrl));
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
                } else {
                    this.audio = null;
                    this.closeAudioSources();
                }
            }
        }

        if(this.state != 'playing') { return; }

        // 곡 플레이 세팅 중 처리
        //     곡 마지막 패턴 시간 체크
        this.songLastPatternTime = 0;
        let diff = song.difficulties[ this.difficulty.index ];
        let patterns = diff.patterns;
        for(idx=0; idx<patterns.length; idx++) {
            const pattern = patterns[idx];
            if(pattern.time > this.songLastPatternTime) {
                this.songLastPatternTime = pattern.time;
            }
        }

        
        
        // 곡이 플레이 상황일 경우만 처리
        if(this.state != 'playing') return;
        this.elapsedTime = 0;

        const songBitGap = Math.round((60000 / this.song.bpm) / this.timeMultiplier);
        this.songBitGap = songBitGap;
        if(this.usingWorker) {
            this.workerSongPlaying = new Worker( this.convertURL('/resources/js/shuttingstarworker.js') );
            this.workerSongPlaying.postMessage({interval : songBitGap});
            this.workerSongPlaying.onmessage = function(e) {
                // const {drift, time} = e.data;
                selfs.timeElapse();
            }
        } else {
            this.timeProgressKey = this.repeat(() => { selfs.timeElapse(); }, songBitGap);
        }

        if(this.audio != null) {
            setTimeout(() => {
                selfs.audio.play();
            }, (songBitGap * this.stageRows * 2) + this.songTiming); // 노트가 올라가는 시간은 주고 재생 시작
        }
    }

    /** 키 입력 처리, vkeyExplosion 를 true 지정 시 해당 가상 키도 강조 표시 */
    handleKeyInput(key, vkeyExplosion) {
        if(this.keyInputDebugMode) console.log('KEY INPUT : ' + this.elapsedTime + ', ' + key);

        // 방향키와 엔터 키 확인
        if(key == this.arrowKeys[0] || key == this.arrowKeys[1] || key == this.arrowKeys[2] || key == this.arrowKeys[3] || key == this.enterKey) {
            let index = 0;
            if(this.state == 'menu') { 
                // 메뉴 상태

                if(this.menuList.indexOf(this.menuChoosing) >= 0) index = this.menuList.indexOf(this.menuChoosing);
                this.menuChoosing = this.menuList[index];

                if(key == this.arrowKeys[0]) { // UP
                    index--;
                    if(index < 0) index = this.menuList.length - 1;
                    this.menuChoosing = this.menuList[index];
                } else if(key == this.arrowKeys[1]) { // DOWN
                    index++;
                    if(index >= this.menuList.length) index = 0;
                    this.menuChoosing = this.menuList[index];
                } else if(key == this.enterKey) { // ENTER
                    if(this.menuChoosing == 'play') { // 메뉴 - 플레이에 커서가 있는 상태에서 엔터 키 누름
                        this.audio = null;
                        this.songThumb = null;
                        this.videoBga = null;

                        this.setState('songchoosing');
                    } else if(this.menuChoosing == 'setting') { // 메뉴 - 설정에 커서가 있는 상태에서 엔터 키 누름
                        // 그래픽 퀄리티 해상도는 해상도 관련 사항이므로 따로 처리
                        if(     this.resolution.w <= 1280) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0];
                        else if(this.resolution.w <= 1920) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[1];
                        else if(this.resolution.w <= 2560) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[2];
                        else if(this.resolution.w <= 3840) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[3];
                        else                               this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0];

                        this.setState('setting');
                        if(this.configDiv != null) {
                            // 캔버스 내 자체 설정화면 대신, 상세설정 div 레이어를 띄움
                            this.openConfigDiv();
                        }
                    } else if(this.menuChoosing == 'credit') { // 메뉴 - 크레딧에 커서가 있는 상태에서 엔터 키 누름
                        this.prepareCreditList();
                        this.setState('credit');
                    }
                }
            } else if(this.state == 'songchoosing') { // 곡 선택 상태
                if(this.songs.length <= 0) { this.setState('menu'); return; } // 곡이 아무것도 준비 안된 상태로 방향키 혹은 엔터 키를 누름 - 메뉴로 돌아감
                if(this.songChoosing == null) this.songChoosing = this.songs[0];

                // 인덱스 구하기
                index = 0;
                if(this.difficultyChoosing) {
                    for(let idx=0; idx<this.difficultyChoosingList.length; idx++) {
                        if(this.difficulty == this.difficultyChoosingList[idx]) {
                            index = idx;
                            break;
                        }
                    }
                } else {
                    for(let idx=0; idx<this.songs.length; idx++) {
                        if(this.songs[idx] == this.songChoosing) {
                            index = idx;
                            break;
                        }
                    }
                }
                
                // 키 적용
                if(key == this.arrowKeys[0]) { // UP
                    index--;
                    if(index < 0) index = this.songs.length - 1;
                    this.songChoosing = this.songs[index];
                } else if(key == this.arrowKeys[1]) { // DOWN
                    index++;
                    if(index >= this.songs.length) index = 0;
                    this.songChoosing = this.songs[index];
                } else if(key == this.arrowKeys[2]) { // LEFT
                    index--;
                    if(index < 0) index = this.difficultyChoosingList.length - 1;
                    this.difficulty = this.difficultyChoosingList[index];
                } else if(key == this.arrowKeys[2]) { // RIGHT
                    index++;
                    if(index >= this.difficultyChoosingList.length) index = 0;
                    this.difficulty = this.difficultyChoosingList[index];
                } else if(key == this.enterKey) { // ENTER
                    if(this.songChoosing == null) return;

                    if(this.difficultyChoosing) {
                        if(this.difficulty == null || typeof(this.difficulty) == 'undefined') this.difficulty = this.difficultyChoosingList[0];
                        this.songTitleTime = this.songTitleBaseTime;
                        if(! isNaN(this.song.loadingTime)) this.songTitleTime += this.song.loadingTime;
                        this.setState('songtitle');
                        this.difficultyChoosing = false;
                    } else {
                        this.song = this.songChoosing;
                        this.difficultyChoosingList = this.song.getDifficultyList();
                        this.difficulty = this.difficultyChoosingList[0];
                        this.difficultyChoosing = true;
                    }
                }
            } else if(this.state == 'setting') { // 설정 상태
                if(this.settingList.indexOf(this.settingChoosing) >= 0) index = this.settingList.indexOf(this.settingChoosing);
                this.settingChoosing = this.settingList[index];

                if(key == this.enterKey) {
                    if(this.settingChoosing == 'resetAll') {
                        if(this.settingResetReask) {
                            // 초기화
                            try { localStorage.clear(); } catch(er) { console.error(er); return; }
                            location.reload();
                        } else {
                            // 한번 더 물어봄
                            this.settingResetReask = true;
                        }
                    } else if(this.settingModifyingMode) {
                        this.settingModifyingMode = false; // 설정 변경 모드 OFF

                        if(this.settingChoosing == 'setGraphicQuality') {
                            // 그래픽 퀄리티 해상도는 해상도 관련 사항이므로 따로 처리
                            if(this.settingGraphicQualityChoosing == 'LOW') {
                                this.ressets.w = 1280;
                                this.ressets.h =  720;
                            } else if(this.settingGraphicQualityChoosing == 'MEDIUM') {
                                this.ressets.w = 1920;
                                this.ressets.h = 1080;
                            } else if(this.settingGraphicQualityChoosing == 'HIGH') {
                                this.ressets.w = 2560;
                                this.ressets.h = 1440;
                            } else if(this.settingGraphicQualityChoosing == '4K') {
                                this.ressets.w = 3840;
                                this.ressets.h = 2160;
                            } else {
                                this.ressets.w = 1280;
                                this.ressets.h =  720;
                            }
                            this.setResolution(this.ressets.w, this.ressets.h);
                        }

                        // 설정 저장
                        this.saveSettings();
                    } else {
                        this.settingModifyingMode = true; // 설정 변경 모드 ON
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
                
            } else if(this.state == 'playing' && key == this.enterKey) { 
                // 플레이 중이며 엔터 키
                if(this.paused) { // 일시정지 중일 때 --> 재개 처리
                    this.resumingTime = this.resumeDelayTime * _shuttingstarcore.timeMultiplier;
                    this.paused = false;
                }
            }
        } else if(key == this.escKey) { // ESC키
            if(this.state == 'playing') {
                // 플레이 중이며 ESC키
                if(this.paused) {
                    // 이미 일시정지 중일 때 또 ESC 누름 --> 포기 처리
                    this.onGameOver();
                } else {
                    // 일시정지 중이 아닐 때 --> 일시정지 시작
                    this.paused = true;
                    if(this.audio != null) { this.audio.pause(); }
                }
            } else if(this.state == 'result') {
                this.setState('menu');
            } else if(this.state == 'songchoosing') {
                if(this.difficultyChoosing) { this.difficultyChoosing = false; }
                else { this.setState('menu'); }
            } else if(this.state == 'setting') {
                this.settingResetReask = false;
                if(this.settingModifyingMode) {
                    this.settingModifyingMode = false;
                    this.loadSettings();
                } else {
                    this.setState('menu');
                }
            } else if(this.state == 'credit') {
                this.setState('menu');
            }
        }

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

    handleNotePlacerCalled(notePlacer) {
        // NotePlacer 폭발 처리
        notePlacer.explosing = 1;

        // 해당 NotePlacer 과 충돌/위치가 동일한 Note 가 있는지 확인
        for(let idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if((obj instanceof Note)) {
                if(obj.locationIndex != notePlacer.locationIndex) continue;
                if(obj.explosing >= 1) continue;

                // 두 객체 간의 거리 (y좌표 차이, 절대값)
                const dist = notePlacer.isMeetVerticalRangeIn(obj);
                if(dist < 0) continue; // 접근 여부 판정에는 노트 속도 보너스가 이미 반영되어 있음

                // 거리를 백분율로 환산 - 이후 노트 속도 보너스 반영해야 함
                const distance = Math.abs((dist * 100.0) / ( (obj.r + notePlacer.r) * _shuttingstarcore.noteSpeedMultiplier * (_shuttingstarcore.noteSpeedFixedConst * 4) ) );

                // 거리에 따른 판정, 점수 계산
                let resultMark = this.createResultMark(distance);
                this.processResultMark(resultMark);
                this.displayResultMark(resultMark);

                obj.explosing = 1; // 노트의 폭발 시작
                this.objectsPlaying[idx] = obj;

                // 추가 폭발 객체 추가
                const newExplosinves = new ExplosingObject(obj.locationIndex, obj.y, obj.color, '255, 255, 255');
                this.objects.push(newExplosinves);
                break;
            }
        }
    }

    /** 마우스 클릭 / 터치 이벤트 처리, mouseCursorObject 는 마우스 클릭 위치에 생성되는 임시 객체로 isConflicted 지원 */
    handleMouseClick(x, y, mouseCursorObject) {
        const selfs = this;
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
                if(typeof(evOne.callback) == 'function') evOne.callback();
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
            this.missCombo = 0;
            this.report.PERFECT++;

            this.hp += this.combo;
            if(this.hp > 100) this.hp = 100;
        } else if(resultMark == 'GREAT') {
            this.point += (70 * (this.combo + 1));
            this.combo++;
            this.missCombo = 0;
            this.report.GREAT++;

            this.hp += (this.combo / 2.0);
            if(this.hp > 100) this.hp = 100;
        } else if(resultMark == 'GOOD') {
            this.point += (50 * (this.combo + 1));
            this.combo++;
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
            this.hp -= 4.0;
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
        // 캔버스 비우기
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
    }

    /** 화면 출력 - 플레이 중 출력 */
    renderPlaying() {
        // 시각화 그리기
        if(this.audioAnalyser != null && this.audioSource != null) this.renderAudioVisualizing();

        // 객체 그리기
        for(let idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if(typeof(obj.draw) == 'function') obj.draw(this.ctx);
        }

        // HP바 그리기
        this.renderHpBar();

        // 일시정지 상태 그리기
        if(this.paused) {
            let fontSize = this.convertFontSize(20);
            this.ctx.font = fontSize + 'px ' + this.fontFamily;

            if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.textAlign = "center";
            this.ctx.strokeText(this.trans('PAUSED'), this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) + 10));

            fontSize = this.convertFontSize(12);
            this.ctx.font = fontSize + 'px ' + this.fontFamily;

            let escKeyLabel = this.escKey;
            if(this.escKey == 'ESCAPE') escKeyLabel = 'ESC';

            if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.textAlign = "center";
            this.ctx.strokeText(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('%1 key to resume, %2 key to give up !'), '%1', this.enterKey), '%2', escKeyLabel), this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) + (fontSize * 2) + 10));
        }

        // 일시정지 해제 대기시간 그리기
        if(this.resumingTime >= 1) {
            let fontSize = this.convertFontSize(15);
            this.ctx.font = fontSize + 'px ' + this.fontFamily;

            if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.textAlign = "center";
            this.ctx.strokeText(ShuttingStarsUtility.replaceString(this.trans('Resume within % !'), '%', String(this.resumingTime)), this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) + 10));
        }

        // 게임 오버 그리기
        if(this.state == 'gameover') {
            let fontSize = this.convertFontSize(20);
            this.ctx.font = fontSize + 'px ' + this.fontFamily;

            this.ctx.fillStyle = this.convertColor('rgba(250, 80, 80, 0.9)');
            this.ctx.textAlign = "center";
            this.ctx.fillText('GAME OVER', this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) + 20));
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

        rows = (this.stageSize.h / 2) - 100 + rows;
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.strokeText('Shutting Stars', this.convertX(this.stageSize.w / 2), this.convertY(rows));

        rows = this.stageSize.h - fontSize - gap;
        fontSize = this.convertFontSize(15);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.trans('Please wait...'), this.convertX(this.stageSize.w / 2), this.convertY(rows));

        fontSize = this.convertFontSize(12);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = 'right';
        this.ctx.fillText('BUILD ' + this.build, this.convertX(this.stageSize.w - (fontSize * 1.5)), this.convertY(this.stageSize.h - (fontSize * 1.5)));
    }

    /** 화면 출력 - 메인 메뉴 */
    renderMenu() {
        let idx;
        let rows = 0;
        let fontSize = this.convertFontSize(30);
        let opacity = 0.9;
        let gap = Math.floor(fontSize / 2.0);
        let label = '';

        rows = (this.stageSize.h / 2) - 100 + rows;
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.strokeText('Shutting Stars', this.convertX(this.stageSize.w / 2), this.convertY(rows));
        rows += fontSize + gap;

        for(idx=0; idx<this.menuList.length; idx++) {
            let menuOne = this.menuList[idx];

            if(menuOne == 'play'   ) label = this.trans('PLAY');
            if(menuOne == 'setting') label = this.trans('SETTING');
            if(menuOne == 'credit' ) label = this.trans('CREDIT');

            fontSize = this.convertFontSize(20);
            this.ctx.font = fontSize + 'px ' + this.fontFamily;

            if(this.menuChoosing == menuOne) {
                opacity = 0.99;

                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                this.ctx.fillText(label, this.convertX(this.stageSize.w / 2), this.convertY(rows));
            } else {
                opacity = 0.3;

                if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                this.ctx.strokeText(label, this.convertX(this.stageSize.w / 2), this.convertY(rows));
            }
            
            rows += fontSize + gap;
        }

        fontSize = this.convertFontSize(30);
        rows += fontSize * 5;

        fontSize = this.convertFontSize(12);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
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
        this.ctx.fillText(label, this.convertX(this.stageSize.w / 2), this.convertY(rows));
        rows += fontSize + gap;

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = 'right';
        this.ctx.fillText('BUILD ' + this.build, this.convertX(this.stageSize.w - (fontSize * 1.5)), this.convertY(this.stageSize.h - (fontSize * 1.5)));
    }

    /** 화면 출력 - 곡 선정 화면 */
    renderSongChoosing() {
        const selfs = this;
        let idx, ddx;
        let rows = 0;
        let cols = 0;
        let fontSize = this.convertFontSize(20);
        let opacity = 0.9;
        let uppers = 150;
        let gap = Math.floor(fontSize / 2.0);
        let label = '';

        // 곡 목록이 비어 있으면 안내문구 출력 후 메뉴로 이동
        if(this.songs.length <= 0) {
            fontSize = this.convertFontSize(20);
            this.ctx.font = fontSize + 'px ' + this.fontFamily;
            if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.strokeText(this.trans('No songs available !'), this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - (uppers - 20) + rows));
            rows += fontSize + gap;
            setTimeout(() => { selfs.setState('menu'); }, 4000);
            return;
        } else {
            // 그외의 경우 안내문구 출력
            fontSize = this.convertFontSize(30);
            this.ctx.font = fontSize + 'px ' + this.fontFamily;
            if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.textAlign = "center";
            this.ctx.strokeText(this.trans('Choose what you want !'), this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
            rows += fontSize + gap;
        }

        // 곡을 선택하지 않은 상태인 경우 첫 곡을 출력
        if(this.songChoosing == null) { this.songChoosing = this.songs[0]; }

        // 곡 목록을 다 출력할 수는 없으니, 현재 선택된 곡 앞뒤 2개만 출력
        //    현재 선택된 곡을 중앙에 두고, 앞 2개, 뒤 2개를 찾아야 함 (가능한 만큼만)
        let frontSongs = [];
        let backSongs = [];
        let songChoosen = null;
        let current = false;
        for(idx=0; idx<this.songs.length; idx++) {
            let songOne = this.songs[idx];
            if(songOne == this.songChoosing) {
                current = true; // 현재 선택된 곡, backSongs 에 넣기 (frontSongs 에 넣어도 문제는 없음)
                backSongs.push(songOne);
                continue;
            }
            if(! current) { // 아직 현재 선택된 곡을 만나기 이전 - 일단 frontSongs 에 넣고, 원소가 2개를 초과하면 먼저 넣은 것을 제거한다.
                frontSongs.push(songOne);
                if(frontSongs.length > 2) frontSongs.splice(0, 1);
            } else { // 현재 선택된 곡을 지남 - backSongs 에 넣고, 원소가 3개 (현재 선택된 곡이 포함되어 있으므로) 가 되면 반복문을 중지한다.
                backSongs.push(songOne);
                if(backSongs.length >= 3) break;
            }
        }

        // 하나의 배열로 병합
        let displaySongs = [];
        for(idx=0; idx<frontSongs.length; idx++) { displaySongs.push(frontSongs[idx]); }
        for(idx=0; idx<backSongs.length; idx++) { displaySongs.push(backSongs[idx]); }
        frontSongs = null;
        backSongs = null;

        let displayedSongs = 0;

        // 출력
        for(idx=0; idx<displaySongs.length; idx++) {
            let songOne = displaySongs[idx];
            let choosen = (this.songChoosing == songOne);

            fontSize = this.convertFontSize(20);
            if(choosen) {
                songChoosen = songOne;

                // 선택된 곡인 경우, 배경색 먼저 출력
                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                if(this.difficultyChoosing) {
                    this.ctx.fillRect(0, this.convertY((this.stageSize.h / 2) - uppers + rows - (fontSize + (gap / 2))), this.canvas.width - (this.getLeftMargin() * 2), this.convertY((fontSize * 4) + gap));
                } else {
                    this.ctx.fillRect(0, this.convertY((this.stageSize.h / 2) - uppers + rows - (fontSize + (gap / 2))), this.canvas.width - (this.getLeftMargin() * 2), this.convertY((fontSize * 3) + gap));
                }
            }

            // 곡 이름 출력
            label = songOne.name;
            this.ctx.font = fontSize + 'px ' + this.fontFamily;

            opacity = 0.99;
            // if(choosen) opacity = 0.99;
            // else opacity = 0.3;

            this.ctx.textAlign = "center";
            if(choosen) {
                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                this.ctx.fillText(label, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
            } else {
                if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                this.ctx.strokeText(label, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
            }

            rows += fontSize + gap;

            // 작곡가, 노트작성자, bpm 출력
            label = ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2, %3 BPM'), '%1', songOne.composer), '%2', songOne.noteWriter), '%3', String(songOne.bpm));
            fontSize = this.convertFontSize(15);
            this.ctx.font = fontSize + 'px ' + this.fontFamily;

            // if(this.songChoosing == songOne) opacity = 0.99;
            // else opacity = 0.3;

            this.ctx.textAlign = "center";
            if(choosen) {
                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                this.ctx.fillText(label, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
            } else {
                if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                this.ctx.strokeText(label, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
            }

            rows += fontSize + gap;

            // 현재 선택된 곡이고, 난이도 선택해야 하는 차례인 경우
            if(choosen && this.difficultyChoosing) {
                fontSize = this.convertFontSize(15);
                this.ctx.font = fontSize + 'px ' + this.fontFamily;

                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                else          this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');

                if(this.difficultyChoosingList.length == 0) this.difficultyChoosingList = this.songChoosing.getDifficultyList();
                let diffIdx = this.difficultyChoosingList.indexOf(this.difficulty);
                if(diffIdx < 0) { diffIdx = 0; this.difficulty = this.difficultyChoosingList[diffIdx]; }
                
                cols = 0;
                this.ctx.textAlign = "center";
                for(ddx=0; ddx<this.difficultyChoosingList.length; ddx++) {
                    const diffOne = this.difficultyChoosingList[ddx];
                    const difficultyName = diffOne.difficultyLabel;
                    const difficultyNum  = diffOne.difficultyLevel;

                    label = '';

                    if(ddx == diffIdx) label += '[';
                    
                    if(     difficultyName == 'easy'  ) label += 'EASY';
                    else if(difficultyName == 'normal') label += 'NORMAL';
                    else if(difficultyName == 'hard'  ) label += 'HARD';
                    else label += 'EX';

                    label += ' (' + difficultyNum + ')';
                    if(ddx == diffIdx) label += ']';

                    if(ddx == diffIdx) this.ctx.fillText(label, this.convertX(this.stageSize.w / 2) + cols - (diffIdx * fontSize * 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
                    else               this.ctx.strokeText(label, this.convertX(this.stageSize.w / 2) + cols - (diffIdx * fontSize * 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
                    cols += (fontSize * label.length) + 20;
                }
                rows += gap;
            }

            rows += fontSize + gap;
            displayedSongs++;
        }

        // 빈 공간 띄우기
        fontSize = this.convertFontSize(35);
        while(displayedSongs < 5) {
            rows += fontSize + gap;
            displayedSongs++;
        }

        // 기타 안내 출력
        fontSize = this.convertFontSize(12);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
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
        this.ctx.textAlign = "center";
        this.ctx.fillText(label, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
        
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
                this.ctx.font = fontSize + 'px ' + this.fontFamily;
                this.ctx.textAlign = "left";
                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(100, 100, 100, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(180, 180, 180, ' + opacity + ')');

                rows = Math.floor((this.canvas.height * 2.7 / 4.0) + fontSize) + 5;
                for(const line of desc) {
                    this.ctx.fillText(line, descX + fontSize + this.getLeftMargin(), rows);
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
        let uppers = 120;
        let label = '';

        if(this.settingChoosing == null) this.settingChoosing = this.settingList[0];

        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.strokeText(this.trans('Settings'), this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
        rows += fontSize + gap;

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
            this.ctx.font = fontSize + 'px ' + this.fontFamily;
            if(choosen) {
                if(this.settingModifyingMode) opacity = 0.99;
                else opacity = 0.8;

                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                this.ctx.fillText(label, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
            } else {
                opacity = 0.3;

                if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                this.ctx.strokeText(label, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
            }
            
            rows += fontSize + gap;
        }

        fontSize = this.convertFontSize(30);
        rows += fontSize * 3;

        fontSize = this.convertFontSize(12);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        opacity = 0.9;
        label = 'MOVE : ';
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
        label += '    ACCEPT : ' + this.enterKey;

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.fillText(label, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
        rows += fontSize + gap;
    }

    /** 화면 출력 - 곡 시작 직전 썸네일과 곡 제목 크게 뜨는 화면, 사용자는 아무것도 할 수 없으며, 시간이 지나면 자동으로 playing 상태로 전환되어 플레이가 시작됨 */
    renderSongTitle() {
        const selfs = this;
        let songOne = this.songChoosing;
        let idx;
        let rows = 0;
        let fontSize = this.convertFontSize(20);
        let opacity = 0.9;
        let gap = Math.floor(fontSize / 2.0);
        let label = '';

        if(songOne == null || typeof(songOne) == 'undefined') { songOne = this.song; this.songChoosing = this.song; }
        if(songOne == null || typeof(songOne) == 'undefined') { this.song = null; this.songChoosing = null; this.setState('songchoosing'); this.resetStage(); return; }

        // Thumb 있으면 먼저 출력
        if(this.songThumb != null) {
            this.ctx.drawImage(this.songThumb, 0, 0, this.convertX(this.stageSize.w), this.convertY(this.stageSize.h));
        }

        // 곡 이름 출력
        label = songOne.name;
        fontSize = this.convertFontSize(30);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = "center";
        this.ctx.fillText(label, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - 30 + rows));

        // 작곡가, 노트작성자, bpm 출력
        fontSize = this.convertFontSize(20);
        rows = this.stageSize.h - ((fontSize * 2) + gap);
        label = ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2, %3 BPM'), '%1', songOne.composer), '%2', songOne.noteWriter), '%3', String(songOne.bpm));
        this.ctx.font = fontSize + 'px ' + this.fontFamily;

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(fontSize * 2), this.convertY((rows)));

        // 난이도 표기
        label = String(this.difficulty.difficultyLevel);
        fontSize = this.convertFontSize(40);
        rows -= this.convertFontSize(5);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        this.ctx.textAlign = "right";
        this.ctx.fillText(label, this.convertX(this.resolution.w - (fontSize * 2)), this.convertY((rows)));
    }

    /** 화면 출력 - 플레이 종료 후 결과 화면 */
    renderResult() {
        // 첫 줄
        let rows = 0;
        let fontSize = this.convertFontSize(30);
        let gap = Math.floor(fontSize / 2.0);
        let label = '';

        rows = (this.stageSize.h / 6);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.strokeText(this.trans('PLAYING REPORT'), this.convertX(this.stageSize.w / 2), this.convertY(rows));
        rows += fontSize + (gap/2);

        fontSize = this.convertFontSize(20);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        this.ctx.fillStyle = this.convertColor('rgba(80, 230, 80, 0.8)'); // blue
        this.ctx.textAlign = "center";
        this.ctx.fillText('PERFECT\t' + ShuttingStarsUtility.fitDigit( this.report.PERFECT , 5), this.convertX(this.stageSize.w / 2), this.convertY(rows));
        rows += fontSize + (gap/4);

        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        this.ctx.fillStyle = this.convertColor('rgba(180, 230, 80, 0.8)'); // green
        this.ctx.textAlign = "center";
        this.ctx.fillText('GREAT  \t' + ShuttingStarsUtility.fitDigit( this.report.GREAT , 5), this.convertX(this.stageSize.w / 2), this.convertY(rows));
        rows += fontSize + (gap/4);

        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        this.ctx.fillStyle = this.convertColor('rgba(230, 230, 80, 0.8)'); // yellow
        this.ctx.textAlign = "center";
        this.ctx.fillText('GOOD   \t' + ShuttingStarsUtility.fitDigit( this.report.GOOD , 5), this.convertX(this.stageSize.w / 2), this.convertY(rows));
        rows += fontSize + (gap/4);

        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        this.ctx.fillStyle = this.convertColor('rgba(230, 180, 80, 0.8)'); // purple
        this.ctx.textAlign = "center";
        this.ctx.fillText('BAD    \t' + ShuttingStarsUtility.fitDigit( this.report.BAD , 5), this.convertX(this.stageSize.w / 2), this.convertY(rows));
        rows += fontSize + (gap/4);

        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        this.ctx.fillStyle = this.convertColor('rgba(230, 80, 80, 0.8)'); // red
        this.ctx.textAlign = "center";
        this.ctx.fillText('MISS   \t' + ShuttingStarsUtility.fitDigit( this.report.MISS , 5), this.convertX(this.stageSize.w / 2), this.convertY(rows));
        rows += fontSize + (gap/2);

        label = ShuttingStarsUtility.fitDigit(this.point, 10) + ' (' + this.judgeResultRank() + ')';
        fontSize = this.convertFontSize(15);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.trans('TOTAL') + '  \t' + label, this.convertX(this.stageSize.w / 2), this.convertY(rows));
        rows += fontSize + gap;

        // 곡 이름 출력
        label = this.song.name;
        fontSize = this.convertFontSize(30);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        rows = this.stageSize.h - ((fontSize * 3) + gap);

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(fontSize * 2), this.convertY(rows));

        // 작곡가, 노트작성자, bpm 출력
        fontSize = this.convertFontSize(20);
        rows = this.stageSize.h - ((fontSize * 2) + (gap * 2));
        label = ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2, %3 BPM'), '%1', this.song.composer), '%2', this.song.noteWriter), '%3', String(this.song.bpm));
        this.ctx.font = fontSize + 'px ' + this.fontFamily;

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "left";
        this.ctx.fillText(label, this.convertX(fontSize * 2), this.convertY((rows)));

        // 난이도 표기
        label = String(this.difficulty.difficultyLevel);
        fontSize = this.convertFontSize(40);
        rows -= this.convertFontSize(5);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        this.ctx.textAlign = "right";
        this.ctx.fillText(label, this.convertX(this.stageSize.w - (fontSize * 2)), this.convertY((rows)));

        // ESC 표기
        let escKeyLabel = this.escKey;
        if(this.escKey == 'ESCAPE') escKeyLabel = 'ESC';

        fontSize = this.convertFontSize(15);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        this.ctx.textAlign = "right";
        this.ctx.fillText(ShuttingStarsUtility.replaceString(this.trans("% key to continue..."), '%', escKeyLabel), this.convertX(this.stageSize.w - fontSize), this.convertY(rows + (fontSize + gap * 2)));
    }

    renderHpBar() {
        // HP바 출력
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
        const barWidth = (this.canvas.width / this.audioBufferLen) * 2.5;
        let barHeight, barColorVariable;
        let x = 0;

        for(let i=0; i<this.audioBufferLen; i++) {
            barHeight = this.audioBuffer[i]; // 0 ~ 255
            // convert ~255 to ~canvas.height
            barHeight = ((barHeight * (this.canvas.height - 10)) / 255.0);

            barColorVariable = ((barHeight * 100.0) / 255.0); // convert ranges

            this.ctx.fillStyle = 'rgba(' + (barColorVariable + 140) + ', 100, 120, 0.3)';
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }
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
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";

        // 현재 출력 차례부터 처리
        for(idx=this.creditIndex; idx<this.creditContents.length; idx++) {
            const nows = this.creditContents[idx];

            fontSize = this.convertFontSize(nows.fontSize);
            this.ctx.font = fontSize + 'px ' + this.fontFamily;
            this.ctx.fillText(nows.label, this.convertX(this.stageSize.w / 2), this.convertY(rows));
            rows += fontSize;
            
            displays++;
        }

        // 다시 위로 돌아가 남은 차례 처리
        for(idx=0; idx<this.creditContents.length; idx++) { // 루프 전체 출력 - 어짜피 넘치는 영역은 숨겨지므로
            const nows = this.creditContents[idx];

            this.ctx.font = this.convertFontSize(nows.fontSize) + 'px ' + this.fontFamily;
            this.ctx.fillText(nows.label, this.convertX(this.stageSize.w / 2), this.convertY(rows));
            rows += fontSize;
            
            displays++;
        }
    }

    /** 랭크 탐지 */
    judgeResultRank() {
        if(this.gameOverDelayed) return 'F';
        
        // Note 갯수 체크
        let diff = this.song.difficulties[ this.difficulty.index ];
        let count = diff.patterns.length;

        // P/S 등급 처리
        if(this.report.PERFECT == count) return 'P';
        if((this.report.PERFECT + this.report.GREAT) >= 1 && this.report.MISS <= 0) return 'S';

        // Perfect + Great 비율 체크
        let percents = ((this.report.PERFECT + this.report.GREAT) * 100.0) / count;
        // 기타 등급 처리
        if(percents >=  5.0) return 'A';
        if(percents >= 10.0) return 'B';
        if(percents >= 30.0) return 'C';

        return 'D';
    }

    /*** 공통 동시처리 프로세스 (init 에서 호출) */
    simultaneousWork(simultaneousWorkCycle) {
        let idx;
        // 항상 처리할 사항

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

        // 기타 폭발 오브젝트도 처리
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
            this.creditIndexIncreases++;
            if(this.creditIndexIncreases >= this.creditIndexIncreaseMax) { this.creditIndex++; this.creditIndexIncreases = 0; }
            if(this.creditIndex < 0) this.creditIndex = 0;
            if(this.creditIndex >= this.creditContents.length) this.creditIndex = 0;
        }

        // 일시정지 및 재개 대기 타이밍 처리
        if(this.paused) return;
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

    /** 곡 동시처리 프로세스 - 시간 진행 (해당 곡의 timeMultiplier 분의 1비트) */
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
        if(this.difficulty == null || typeof(this.difficulty) == 'undefined') { this.setState('menu'); this.resetStage(); return; } // 곡 내 난이도가 선정되지 않은 경우 시간 진행 없음
        if(this.state != 'playing') return; // 곡이 재생 중이 아닌 경우 시간 진행 없음

        this.elapsedTime++;
        
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

                    // 폭발 시작
                    obj.explosing = 1;

                    // 추가 폭발 객체 추가
                    const newExplosinves = new ExplosingObject(obj.locationIndex, obj.y, '255, 0, 0', '255, 0, 0');
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
        
        // 스테이지에 남아있는 노트 이동
        for(idx=0; idx<this.objectsPlaying.length; idx++) {
            const obj = this.objectsPlaying[idx];
            if(obj instanceof Note) {
                if(obj.explosing >= 1) continue; // 폭발 중인 Note 는 이동하지 않음
                obj.y -= obj.speedY;
                if(obj.y < 0) obj.y = 0;

                // if(obj.id == 9) console.log('N9 ' + obj.y + ' S ' + obj.speedY);
            }
        }
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

    /** 노트 속도 */
    getNoteMoveSpeed() {
        // 설정값에 따른 속도 반환
        // 노트들이 곡의 bpm 에 맞는 타이밍마다 이 메소드의 리턴값 만큼 이동함 (이미 bpm 이 반영되어 있음)
        return ((this.getNoteRadius() * 2.0) * this.noteSpeedMultiplier * this.noteSpeedFixedConst) / (this.timeMultiplier / 8.0);
    }

    /** 노트 생성 위치 */
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
        const bigExp = new ExplosingObject(0, 0, '180, 0, 0', '250, 80, 80');
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
    }

    /** 곡 재생 종료 */
    stopAudio() {
        if(this.audio != null) {
            try { this.audio.pause(); } catch(e) { console.error(e); }
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

    getLeftMargin() {
        return 0;
    }

    getTopMargin() {
        return 0;
    }

    getLeftMarginNote() {
        return 20;
    }

    getTopMarginNote() {
        return 0;
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

        for(let idx=0; idx<this.songs.length; idx++) {
            const songOne = this.songs[idx];
            
            this.creditContents.push({ label : songOne.name, fontSize : 25 });
            this.creditContents.push({ label : ShuttingStarsUtility.replaceString(ShuttingStarsUtility.replaceString(this.trans('Composed by %1, Notes written by %2'), '%1', songOne.composer), '%2', songOne.noteWriter), fontSize : 15 });
            this.creditContents.push({ label : '', fontSize : 25 });
        }

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

    /** 상세 설정화면 구현 (캔버스에 그리지 않고, 별도 div에 출력) */
    renderConfigDiv() {
        if(this.configDiv == null) return;
        const selfs = this;

        // 상세설정 영역 공통 css 준비
        let styles = `
            .shuttingstar_configlayer { margin-left: 2rem; margin-top: 2rem; font-size: 2rem; line-height: 2rem; }
            .shuttingstar_configlayer input, .shuttingstar_configlayer select, .shuttingstar_configlayer button { font-size: 2rem; line-height: 2rem; }
            .shuttingstar_configlayer button       { background: transparent; border: 3px solid rgba(122, 165, 240, 0.4); color: rgba(122, 165, 240, 0.4); padding: 0.5rem 1.5rem 0.5rem 1.5rem; }
            .shuttingstar_configlayer button:hover { background: rgba(122, 165, 240, 0.1); border: 3px solid rgba(122, 165, 240, 0.6); color: rgba(122, 165, 240, 0.6); padding: 0.5rem 1.5rem 0.5rem 1.5rem; }
            .shuttingstar_configlayer button.red       { background: transparent; border: 3px solid rgba(244, 66, 66, 0.4); color: rgba(244, 66, 66, 0.4); padding: 0.5rem 1.5rem 0.5rem 1.5rem; }
            .shuttingstar_configlayer button.red:hover { background: rgba(244, 66, 66, 0.1); border: 3px solid rgba(244, 66, 66, 0.6); color: rgba(244, 66, 66, 0.6); padding: 0.5rem 1.5rem 0.5rem 1.5rem; }
            .shuttingstar_configlayer table, .shuttingstar_configlayer table td { border: 0; }
            .shuttingstar_configlayer table th { border: 0; text-align: left; }
            .shuttingstar_configlayer .tabarea        { display: none; }
            .shuttingstar_configlayer .tabarea.active { display: block; }
            .shuttingstar_configlayer button.tab        { background: transparent; border: 3px solid rgba(50, 230, 50, 0.4); color: rgba(50, 230, 50, 0.4); }
            .shuttingstar_configlayer button.tab:hover  { background: rgba(50, 230, 50, 0.1); border: 3px solid rgba(50, 230, 50, 0.5); color: rgba(50, 230, 50, 0.6); }
            .shuttingstar_configlayer button.tab.active { background: rgba(50, 230, 50, 0.2); border: 3px solid rgba(50, 230, 50, 0.9); color: rgba(50, 230, 50, 0.9); }
            .shuttingstar_configlayer .shuttingstar_config_inner { min-height: 600px; vertical-align: top; }
            .shuttingstar_configlayer .ta_json_song, .shuttingstar_configlayer .ta_packages { min-height: 600px; }
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

        // 상세설정 영역 공통 css 적용
        const styleElem = document.createElement('style');
        styleElem.type = 'text/css';
        styleElem.innerHTML = styles;
        document.head.appendChild(styleElem);

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
                    </div>
                    <div class='shuttingstar_toolcontrols'>
                        <button type='button' class='btn btn_tool_cancel target_translate red'>Cancel</button>
                    </div>
                </div>
            </div>
        `;

        // 상세설정 영역 HTML 및 기타 css 적용
        this.configDiv.innerHTML = html;
        this.configDiv.style.zIndex = this.canvasZindex + 1;
        this.configDiv.style.position = 'fixed';
        this.configDiv.style.top  = this.canvas.offsetTop  + 'px';
        this.configDiv.style.left = this.canvas.offsetLeft + 'px';
        this.configDiv.style.width = this.canvas.offsetWidth + 'px';
        this.configDiv.style.height = this.canvas.offsetHeight + 'px';
        this.configDiv.style.textAlign = 'center';
        this.configDiv.style.verticalAlign = 'middle';

        // 스트링 테이블 번역 적용
        this.configDiv.querySelectorAll('.target_translate').forEach((itemOne) => {
            itemOne.innerHTML = this.trans(itemOne.innerHTML);
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
            selfs.keypressTiming      = parseInt(String( layer.querySelector('.inp_keypressdelay').value ).trim());
            selfs.songTiming          = parseInt(String( layer.querySelector('.inp_sounddelay').value ).trim());
            selfs.noteSpeedMultiplier = parseInt(String( layer.querySelector('.inp_notespeedrate').value ).trim());

            selfs.settingGraphicQualityChoosing = layer.querySelector('.sel_graphicquality').value;
            if(selfs.settingGraphicQualityChoosing == 'LOW') {
                selfs.ressets.w = 1280;
                selfs.ressets.h =  720;
            } else if(selfs.settingGraphicQualityChoosing == 'MEDIUM') {
                selfs.ressets.w = 1920;
                selfs.ressets.h = 1080;
            } else if(selfs.settingGraphicQualityChoosing == 'HIGH') {
                selfs.ressets.w = 2560;
                selfs.ressets.h = 1440;
            } else if(selfs.settingGraphicQualityChoosing == '4K') {
                selfs.ressets.w = 3840;
                selfs.ressets.h = 2160;
            } else {
                selfs.ressets.w = 1280;
                selfs.ressets.h =  720;
            }
            selfs.setResolution(selfs.ressets.w, selfs.ressets.h);
            selfs.language = layer.querySelector('.sel_language').value;
            selfs.languageDefault = false;
            selfs.saveSettings();
            selfs.closeConfigDiv();
            selfs.setState('menu');
        });

        btnCancel.addEventListener('click', fCancel);

        btnReset.addEventListener('click', () => {
            if(confirm(selfs.trans('Do you want to reset all?'))) {
                try { localStorage.clear(); } catch(er) { console.error(er); alert(selfs.trans('Reset failed - ' + er)); return; }
                location.reload();
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

        if(     this.resolution.w <= 1280) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0];
        else if(this.resolution.w <= 1920) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[1];
        else if(this.resolution.w <= 2560) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[2];
        else if(this.resolution.w <= 3840) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[3];
        else                               this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0];
        
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
        this.configDiv.style.display = 'block';
        this.configDiv.querySelector('.inp_keypressdelay').focus();
    }

    /** 상세설정 창 닫기 */
    closeConfigDiv() {
        this.configDiv.style.display = 'none';
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
#                        time          : (integer) occuring time ( Not seconds ! Need to test. )
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
    
    /** 게임 내 무대 크기 (stageSize.w) 를 실제 화면 내 좌표 (resolution.w) 로 변환 */
    convertX(x) {
        return (x * this.resolution.w / this.stageSize.w) + this.getLeftMargin();
        // return x;
    }

    /** 게임 내 무대 크기 (stageSize.h) 를 실제 화면 내 좌표 (resolution.h) 로 변환 */
    convertY(y, allowReverse) {
        if(allowReverse) {
            if(this.reverseVertical) {
                return (this.resolution.h - ( y * this.resolution.h / this.stageSize.h )) + this.getTopMargin();
            }
        }
        return (y * this.resolution.h / this.stageSize.h) + this.getTopMargin();

        // if(allowReverse) { if(this.reverseVertical) return this.stageSize.h - y; }
        // return y;
    }

    reverseConvertX(x) {
        return (x * this.stageSize.w / this.resolution.w) + this.getLeftMargin();
    }

    reverseConvertY(y) {
        return (y * this.stageSize.h / this.resolution.h) + this.getTopMargin();
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
        for(idx=0; idx<20; idx++) {
            const obj = new Starlight();
            this.objects.push(obj);
        }
    }

    /** 곡 패키지 불러오기 */
    async loadPackages() {
        let idx, jdx;

        let packages = localStorage.getItem('shuttingstar_packages');
        if(packages == null || typeof(packages) == 'undefined') return;
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

    /** 플러그인 불러오기 */
    async loadPlugins() {
        this.pluginApplied = [];
    }

    /** 외부에서 곡 추가 시 호출 */
    addSong(song, noSave) {
        let idx;
        if(! (song instanceof ShuttingStarsSong)) {
            let json = song;
            if(typeof(json) == 'string') json = JSON.parse(json);

            song = new ShuttingStarsSong();
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
            song.timeConstant   = json.timeConstant;
            song.timeMultiplier = json.timeMultiplier;
            song.difficulties   = [];
            song.decorations    = [];

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

            song.serial = '';
            if(json.serial != null && json.serial != '') {
                // 저장된 다른 곡들 중 시리얼 충돌 확인해야 함
                let exists = false;
                for(let songOne of this.songs) {
                    if(songOne.serial == json.serial) {
                        exists = true;
                        break;
                    }
                }
                if(! exists) song.serial = json.serial; // 충돌 안하는 시리얼이면 넣기
            }

            if(json.decorations) {
                if(typeof(json.decorations) == 'string') json.decorations = JSON.parse(json.decorations);
                song.decorations = json.decorations;
            }
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

        if(! exists) {
            // 추가
            this.songs.push(song);
        }

        if(noSave) return;
        this.saveSongs();
    }

    /** 부동소수 동일여부 확인 */
    checkEqualFloats(a, b) {
        return Math.abs(a - b) < 0.000001;
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
    timeMultiplier = 1; // 보정 시간 (노트 등장 time 값에 * 보정값으로 적용)
    timeConstant = 0; // 보정 시간 (노트 등장 time 값에 + 보정값으로 적용, timeMultiply 보다 후순위로 적용)
    serial = ''; // 수정하지 말 것
    
    // 난이도 별 패턴
    // 배열로, 각 원소는 JSON객체로 구성
    // 원소의 JSON키
    //     difficultyLabel : easy, normal, hard, 그 뒤부터는 ex1, ex2, ex3, ... 순으로 난이도 이름 뒤에 ; (세미콜론) 뒤에 숫자로 난이도 표기한 문자열이 키로 사용
    //     difficultyLevel : 1, 2, 3, ... (정수로  입력)
    //     patterns : 배열로 그 안에 ShuttingStarsNotePattern 패턴들이 탑재
    difficulties = []

    // 장식
    decorations = [];

    constructor() {}

    /** 노트 속도 */
    getNoteMoveSpeed() {
        // 설정값에 따른 속도 반환
        // 노트들이 곡의 bpm 에 맞는 타이밍마다 이 메소드의 리턴값 만큼 이동함 (이미 bpm 이 반영되어 있음)
        return _shuttingstarcore.getNoteMoveSpeed();
    }

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
}

/** 노트가 생성될 위치와 시간 (즉 패턴) */
class ShuttingStarsNotePattern {
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
        ctx.font = fontSize + 'px ' + _shuttingstarcore.fontFamily;

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
    constructor(locationIndex) {
        super(locationIndex);
        this.r = _shuttingstarcore.getNoteRadius();
        this.speedY = 10;

        // NotePlacer 찾기
        let notePlacer = _shuttingstarcore.getNotePlacer(locationIndex);
        if(notePlacer == null) { this.explosing = this.explosingMax; return; }

        this.x = notePlacer.x;

        // NOTE SPEED 관련
        this.speedY = _shuttingstarcore.getNoteMoveSpeed();
        this.y = _shuttingstarcore.getNoteCreationYLocation();

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
        ctx.font = fontSize + 'px ' + _shuttingstarcore.fontFamily;

        let opa = this.getNowOpacity();
        if(     this.judgeResult == 'MISS')    ctx.fillStyle = _shuttingstarcore.convertColor('rgba(230, 80, 80, '  + opa + ')'); // red
        else if(this.judgeResult == 'BAD')     ctx.fillStyle = _shuttingstarcore.convertColor('rgba(230, 180, 80, ' + opa + ')'); // purple
        else if(this.judgeResult == 'GOOD')    ctx.fillStyle = _shuttingstarcore.convertColor('rgba(230, 230, 80, ' + opa + ')'); // yellow
        else if(this.judgeResult == 'GREAT')   ctx.fillStyle = _shuttingstarcore.convertColor('rgba(180, 230, 80, ' + opa + ')'); // green
        else if(this.judgeResult == 'PERFECT') ctx.fillStyle = _shuttingstarcore.convertColor('rgba(80, 230, 80, '  + opa + ')'); // blue

        let midX = _shuttingstarcore.stageSize.w / 2;
        let midY = _shuttingstarcore.stageSize.h / 2;
        ctx.fillText(this.judgeResult, _shuttingstarcore.convertX(midX), _shuttingstarcore.convertY(midY)); // 화면 중앙에 출력

        let combo = _shuttingstarcore.combo;
        if(this.judgeResult == 'MISS') combo = _shuttingstarcore.missCombo;

        // 콤보 띄우기
        if(combo > 1) {
            fontSize = _shuttingstarcore.convertFontSize(15);
            ctx.font = fontSize + 'px ' + _shuttingstarcore.fontFamily;
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
        this.x = Math.round(Math.random() * _shuttingstarcore.stageSize.w);
        this.y = Math.round(Math.random() * _shuttingstarcore.stageSize.h);
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
    fontSize = 15;
    wGap = 8;
    hGap = 8;
    callback = function() {};
    constructor(key) {
        super(0);

        const charUnitW = (this.fontSize * 2) + this.wGap;
        const charUnitH = (this.fontSize * 2) + this.hGap;
        const charUnitWP = Math.round(charUnitW * 1.5);

        this.key = key;
        this.shape = 'circle';
        this.x = 0;
        this.y = Math.round(_shuttingstarcore.stageSize.h - (_shuttingstarcore.stageSize.h / 10.0));
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
        this.x = Math.round((_shuttingstarcore.stageSize.w / 2.0) - (charUnitW * 3.0));
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
            this.x = Math.round(_shuttingstarcore.stageSize.w * 2.0 / 4.0);
            this.y = Math.round(_shuttingstarcore.stageSize.h * 9.0 / 10.0) - charUnitH;
        } else if(this.key == _shuttingstarcore.arrowKeys[1]) { // DOWN
            this.x = Math.round(_shuttingstarcore.stageSize.w * 2.0 / 4.0);  // UP과 동일
            this.y = Math.round(_shuttingstarcore.stageSize.h * 9.0 / 10.0); // UP보다 한 칸 아래
        } else if(this.key == _shuttingstarcore.arrowKeys[2]) { // LEFT
            this.x = Math.round(_shuttingstarcore.stageSize.w * 2.0 / 4.0) - charUnitW;  // DOWN 보다 한 칸 왼쪽
            this.y = Math.round(_shuttingstarcore.stageSize.h * 9.0 / 10.0);
        } else if(this.key == _shuttingstarcore.arrowKeys[3]) { // RIGHT
            this.x = Math.round(_shuttingstarcore.stageSize.w * 2.0 / 4.0) + charUnitW;  // DOWN 보다 한 칸 오른쪽
            this.y = Math.round(_shuttingstarcore.stageSize.h * 9.0 / 10.0);
        } else if(this.key == _shuttingstarcore.escKey) {
            if(_shuttingstarcore.state == 'playing') {
                this.x += (charUnitWP * 7);
                this.y -= charUnitH;
            } else {
                this.x = Math.round(_shuttingstarcore.stageSize.w * 2.0 / 4.0) + (charUnitW * 3);  // DOWN 보다 세 칸 오른쪽
                this.y = Math.round(_shuttingstarcore.stageSize.h * 9.0 / 10.0);
            }
        } else if(this.key == _shuttingstarcore.enterKey) {
            if(_shuttingstarcore.state == 'playing') {
                this.x += (charUnitWP * 8);
                this.y -= charUnitH;
            } else {
                this.x = Math.round(_shuttingstarcore.stageSize.w * 2.0 / 4.0) - (charUnitW * 3);  // DOWN 보다 세 칸 왼쪽
                this.y = Math.round(_shuttingstarcore.stageSize.h * 9.0 / 10.0);
            }
        }

        this.x = _shuttingstarcore.convertX(this.x);
        this.y = _shuttingstarcore.convertY(this.y);
        this.r = _shuttingstarcore.convertX(this.r);
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
        ctx.font = this.fontSize + 'px ' + _shuttingstarcore.fontFamily;

        let label = this.key;
        if(     label == 'ARROWUP'   ) label = '▲';
        else if(label == 'ARROWDOWN' ) label = '▼';
        else if(label == 'ARROWLEFT' ) label = '◀';
        else if(label == 'ARROWRIGHT') label = '▶';
        else if(label == 'ENTER'     ) label = 'ENT';
        else if(label == 'ESCAPE'    ) label = 'ESC';

        //    출력
        ctx.textAlign = 'center';
        ctx.fillText(label, this.x, this.y + _shuttingstarcore.convertY(this.fontSize / 4.0)); // x, y는 convert 이미 처리된 좌표이므로 주의 !
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
        let locationBottom = 100;
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
                let locationBottomMax = 100;
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
}
const ShuttingStarsUtility = new ShuttingStarsUtilityClass();
const SSUtil = ShuttingStarsUtility;
/********************** // 기타 Util 성 Class 세팅 ************************/

/********************** 외부에서 호출할 수 있도록 함수 구현 ************************/

/** 곡 추가 */
function addShuttingStarSong(song) {
    _shuttingstarcore.addSong(song);
}

/** 게임 활성화 - 특정 영역에 게임 캔버스를 배치하려는 경우 매개변수로 DOM객체를 입력 */
function initShuttingStars(param) {
    try { return _shuttingstarcore.init(param); } catch(e) { ShuttingStarsUtility.toast('ERROR : ' + e, true); console.error(e); }
}