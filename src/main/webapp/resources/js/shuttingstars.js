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
    resolution = {w : 1280, h : 720}; // 렌더링 해상도, 화면 출력 품질을 결정함, 최소 크기 : 1280 720
    stageSize  = {w : 1280, h : 720}; // 게임 내 무대의 절대크기, 해상도와는 별도로, 게임 내 객체들의 위치의 범위
    fontSizeRatio = 1.0; // 글꼴 크기 비율 (해상도와 별도)
    
    dark = true;
    reverseVertical = false;
    keyList = ['S', 'D', 'F', 'H', 'J', 'K']; // 입력 키
    arrowKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT'];
    enterKey = 'ENTER';
    escKey = 'ESCAPE';

    fontFamily = 'D2Coding'; // NanumGothicCoding / D2Coding

    canvas = null; // 캔버스 객체
    ctx = null;    // 2D Context 객체
    urlCtx = './';  // URL Context Path

    frameTime = 10; // render 호출 주기
    timeMultiplier = 16.0; // 노트의 촘촘함 최대값으로, 8로 지정 시 8배속 속도의 폭타까지 등장할 수 있다는 것을 의미
    stageRows = 72; // 스테이지의 세로를 N등분하여 패턴의 시간과 매칭
    sizeFixedConst = 2; // 노트 크기 상수 (변경 불가)
    noteSpeedFixedConst = 0.25; // 노트 이동 속도 배수 (변경 불가)
    noteSpeedMultiplier = 1.0;  // 노트 이동 속도 배수 (사용자가 지정 가능)

    lastObjectId = 0; // 객체 ID 부여용 카운터
    objects = []; // 게임의 구성 요소 객체들 (렌더링 대상)
    notePlacers = []; // NotePlacer 객체들 보관

    elapsedTime = 0; // 진행 시간 (실제 시간과 단위가 다르며, 곡마다 속도가 다름, 곡의 패턴 배열의 N번째 숫자에 해당)

    usingWorker = true; // Worker 사용여부
    timeProgressKey = null; // 시간 진행 타이머 키가 들어가는 변수

    workerRender = null;
    workerSongPlaying = null;
    workerSimultaneousWork = null;

    point = 0;
    combo = 0;
    missCombo = 0;
    report = {
        PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0
    };
    hp = 100.0; // 다 깎이면 게임 오버 (gameOverEnabled 를 true 지정 시)
    gameOverEnabled = true;  // true 시 hp 0 이면 게임 오버, false 시 일단 곡 끝까지 진행은 가능
    gameOverDelayed = false; // hp 가 한번이라도 0 이하로 내려간 경우 true

    state = 'menu'; // 현재 상태, menu / songchoosing / songtitle / playing / gameover / result / setting

    song = null; // 현재 플레이 중인 곡, ShuttingStarsSong 객체
    songs = []; // 선택 가능한 곡들, ShuttingStarsSong 객체 배열
    difficulty = null; // 선택된 난이도
    audio = null;
    songThumb = null;
    videoBga = null;
    songBitGap = 0;

    songChoosing = null; // 현재 선택된 곡, ShuttingStarsSong 객체로 songs 목록에 있어야만 함
    difficultyChoosing = false; // 곡 선택은 됐고 난이도를 선택하고 있는 상황임을 표시
    difficultyChoosingList = [];// 매번 배열 추출할 수는 없으니 난이도 목록을 임시로 넣어두는 배열

    songTitleTime = 0; // 선택된 곡 준비 중 화면 남은 시간
    gameoverTime = 0; // 게임 오버 마크 화면 남은 시간

    paused = false;
    resumingTime = 0; // 일시정지 재개 전 대기 시간
    resumed = false; // 일시정지 재개 전 대기시간 완료 시 임시로 사용하는 값
    simultaneousWorkCycle = 0;

    colorManualAlpha = false;

    menuList = ['play', 'setting'];
    menuChoosing = null;

    settingList = ['fixKeypressTiming', 'fixSongTiming', 'setNoteSpeedMultiplier', 'setGraphicQuality'];
    settingChoosing = null;
    settingModifyingMode = false;
    settingsGraphicQuality = ['LOW', 'MEDIUM', 'HIGH', '4K'];
    settingGraphicQualityChoosing = null;

    keypressTiming = 0; // 키 입력 추가 딜레이 보정값
    songTiming = 0; // 음원 재생 딜레이 보정값

    // 렌더링 디버그 모드, true 시 JSON 객체를 objects 에 넣어 임의의 도형 추가 가능, 예: {type : 'circle', x: 100, y : 100, r : 10, color : 'rgb(255, 255, 255)'}
    renderDebugMode = false;
    // 배경 이미지 URL, BASE64 가능, 입력 시 화면 맨 뒤에 이미지를 바탕화면처럼 출력하고 그 위에 렌더링
    backgroundImage = null;

    language = 'en';
    stringTable = {
        'ko' : {}
    };

    constructor() {}
    
    /** 초기화 (게임이 출력될 div 영역 객체를 입력) */
    init(rootDiv) {
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
        htmls += "<div class='shuttingstars_canvas_root'>  \n";
        htmls += "    <canvas class='shuttingstars_canvas'>\n";
        htmls += "                                         \n";
        htmls += "    </canvas>                            \n";
        htmls += "</div>                                   \n";
        rootDiv.innerHTML = htmls;
        
        const canvas = document.getElementsByClassName('shuttingstars_canvas')[0];
        canvas.style.minWidth  = '1280px';
        canvas.style.minHeight = '720px';

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.settingGraphicQualityChoosing = this.settingsGraphicQuality[1];
        this.setResolution(this.resolution.w, this.resolution.h);
        this.loadSettings();

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
                selfs.handleKeyInput(event.key.toUpperCase());
            } else {
                setTimeout(() => { selfs.handleKeyInput(event.key.toUpperCase()); }, selfs.keypressTiming);
            }
        });

        document.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // TODO
            console.log(x);
            console.log(y);
        });

        let hGap = window.outerWidth  - window.innerWidth;
        let vGap = window.outerHeight - window.innerHeight;
        if(hGap < 0) hGap = 0;
        if(vGap < 0) vGap = 0;
        const fResize = function() {
            // selfs.canvas.style.width  = (window.outerWidth  - hGap + 1) + 'px';
            selfs.canvas.style.height = (window.outerHeight - vGap + 1) + 'px';
        };
        fResize();
        window.addEventListener('resize', fResize);

        this.menuChoosing = this.menuList[0];
        this.state = 'menu';
        this.resetStage();
    }

    setResolution(w, h) {
        this.resolution.w = w;
        this.resolution.h = h;
        this.canvas.width  = this.resolution.w;
        this.canvas.height = this.resolution.h;

        if(     this.resolution.w <= 1280) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0];
        else if(this.resolution.w <= 1920) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[1];
        else if(this.resolution.w <= 2560) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[2];
        else if(this.resolution.w <= 3840) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[3];
        else                               this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0];
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
                        this.resolution.w = parseInt(left);
                        this.resolution.h = parseInt(right);
                        if(this.resolution.w < 1280) this.resolution.w = 1280;
                        if(this.resolution.h <  720) this.resolution.h =  720;
                        this.setResolution(this.resolution.w, this.resolution.h);
                    } catch(e2) {
                        console.log('Resolution setting is wrong.');
                        console.error(e2);
                        console.log('Trying with default resolution...')
                    }
                    
                }
            }

            this.setResolution(this.resolution.w, this.resolution.h);
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

            localStorage.setItem('shuttingstar_settings', JSON.stringify(settingJson));
        } catch(e) {
            console.log('Failed to save settings.');
            console.error(e);
        }
    }

    /** 스테이지 초기화, 곡이 선정되지 않았을 때는 초기화만 하며, 곡이 선정된 경우는 초기화 후 곡 초기세팅까지 진행 */
    resetStage() {
        const selfs = this;
        let idx;
        this.clearTimeHandler();

        this.lastObjectId = 0;
        this.objects = [];
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
            this.objects.push(notePlacer);
            this.notePlacers.push(notePlacer);
        }

        if(this.song == null) { this.audio = null; return; }
        if(this.state != 'playing' && this.state != 'songtitle') { this.audio = null; return; }

        if(this.state == 'songtitle') {
            if(this.song.thumbnailUrl) {
                if(this.songThumb == null) {
                    this.songThumb = new Image();
                    this.songThumb.src = this.song.thumbnailUrl;
                }
            } else {
                this.songThumb = null;
            }
        }

        // 곡 플레이 세팅 중 처리
        if(this.audio == null) {
            if(typeof(this.song.musicUrl) != 'undefined' && this.song.musicUrl != null && this.song.musicUrl != '') {
                this.audio = new Audio(this.convertURL(this.song.musicUrl));
                // this.audio.addEventListener('ended', function() {
                //     console.log('SONG ENDED');
                //     console.log(this.timeElapse);
                // });
            } else {
                this.audio = null;
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

    /** 키 입력 처리 */
    handleKeyInput(key) {
        // 특수 키 확인
        if(key == this.arrowKeys[0] || key == this.arrowKeys[1] || key == this.arrowKeys[2] || key == this.arrowKeys[3] || key == this.enterKey) {
            let index = 0;
            if(this.state == 'menu') {
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
                    if(this.menuChoosing == 'play') {
                        this.audio = null;
                        this.songThumb = null;
                        this.videoBga = null;

                        this.state = 'songchoosing';
                    } else if(this.menuChoosing == 'setting') {
                        this.state = 'setting';

                        // 그래픽 퀄리티 해상도는 해상도 관련 사항이므로 따로 처리
                        if(     this.resolution.w <= 1280) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0];
                        else if(this.resolution.w <= 1920) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[1];
                        else if(this.resolution.w <= 2560) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[2];
                        else if(this.resolution.w <= 3840) this.settingGraphicQualityChoosing = this.settingsGraphicQuality[3];
                        else                               this.settingGraphicQualityChoosing = this.settingsGraphicQuality[0];
                    }
                }
            } else if(this.state == 'songchoosing') {
                if(this.songs.length <= 0) { this.state = 'menu'; return; }
                if(this.songChoosing == null) this.songChoosing = this.songs[0];

                // 인덱스 구하기
                index = 0;
                for(let idx=0; idx<this.songs.length; idx++) {
                    if(this.songs[idx] == this.songChoosing) {
                        index = idx;
                        break;
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
                } else if(key == this.enterKey) { // ENTER
                    if(this.songChoosing == null) return;

                    if(this.difficultyChoosing) {
                        this.songTitleTime = 80;
                        this.state = 'songtitle';
                        this.difficultyChoosing = false;
                    } else {
                        this.song = this.songChoosing;
                        this.difficultyChoosing = true;
                    }
                }
            } else if(this.state == 'setting') {
                if(this.settingList.indexOf(this.settingChoosing) >= 0) index = this.settingList.indexOf(this.settingChoosing);
                this.settingChoosing = this.settingList[index];

                if(key == this.enterKey) {
                    if(this.settingModifyingMode) {
                        this.settingModifyingMode = false; // 설정 변경 모드 OFF

                        if(this.settingChoosing == 'setGraphicQuality') {
                            // 그래픽 퀄리티 해상도는 해상도 관련 사항이므로 따로 처리
                            if(this.settingGraphicQualityChoosing == 'LOW') {
                                this.resolution.w = 1280;
                                this.resolution.h =  720;
                            } else if(this.settingGraphicQualityChoosing == 'MEDIUM') {
                                this.resolution.w = 1920;
                                this.resolution.h = 1080;
                            } else if(this.settingGraphicQualityChoosing == 'HIGH') {
                                this.resolution.w = 2560;
                                this.resolution.h = 1440;
                            } else if(this.settingGraphicQualityChoosing == '4K') {
                                this.resolution.w = 3840;
                                this.resolution.h = 2160;
                            } else {
                                this.resolution.w = 1280;
                                this.resolution.h =  720;
                            }
                            this.setResolution(this.resolution.w, this.resolution.h);
                        }

                        // 설정 저장
                        this.saveSettings();
                    } else {
                        this.settingModifyingMode = true; // 설정 변경 모드 ON
                    }
                } else if(this.settingModifyingMode) {
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
        } else if(key == this.escKey) {
            if(this.state == 'playing') {
                if(this.paused) {
                    this.resumingTime = 16 * _shuttingstarcore.timeMultiplier;
                    this.paused = false;
                } else {
                    this.paused = true;
                    if(this.audio != null) { this.audio.pause(); }
                }
            } else if(this.state == 'result') {
                this.state = 'menu';
            } else if(this.state == 'songchoosing') {
                if(this.difficultyChoosing) this.difficultyChoosing = false;
                else this.state = 'menu';
            } else if(this.state == 'setting') {
                if(this.settingModifyingMode) {
                    this.settingModifyingMode = false;
                    this.loadSettings();
                } else {
                    this.state = 'menu';
                }
            }
        }

        if(this.keyList.indexOf(key) < 0) return;

        let idx;
        let notePlacer = null; // 해당 키에 맞는 NotePlacer 를 찾아야 함
        for(idx=0; idx<this.notePlacers.length; idx++) {
            if(this.notePlacers[idx].key === key) {
                notePlacer = this.notePlacers[idx];
                break;
            }
        }
        if(notePlacer == null) return;
        console.log(this.elapsedTime + ', ' + key); // TODO

        // NotePlacer 폭발 처리
        notePlacer.explosing = 1;

        // 해당 NotePlacer 과 충돌/위치가 동일한 Note 가 있는지 확인
        for(idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if((obj instanceof Note)) {
                if(obj.locationIndex != notePlacer.locationIndex) continue;
                if(obj.explosing >= 1) continue;
                if(obj.explosing <= 0 && notePlacer.isConflictedVertical(obj)) {
                    // 해당 NotePlacer 과 충돌한 Note 가 얼마나 위치가 동일한지 판정 (수직으로만 이동하므로 y 좌표 및 노트 크기만 영향) - 백분율 사용
                    const distance = Math.abs(((obj.y - notePlacer.y) * 100.0) / obj.r);

                    // 거리에 따른 판정, 점수 계산
                    let resultMark = this.createResultMark(distance);
                    this.processResultMark(resultMark);
                    this.displayResultMark(resultMark);

                    obj.explosing = 1; // 폭발 시작
                    this.objects[idx] = obj;
                    break;
                }
            }
        }
    }
    
    /** 거리에 따른 판정 산출 */
    createResultMark(distance) {
        if(distance < 5.0) {
            return 'PERFECT';
        } else if(distance < 10.0) {
            return 'GREAT';
        } else if(distance < 30.0) {
            return 'GOOD';
        } else if(distance < 99.0) {
            return 'BAD';
        }
        return 'MISS';
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
        this.objects.push(new JudgeMark(resultMark));
    }

    /** 노트의 반지름 */
    getNoteRadius() {
        return ((this.stageSize.h * this.sizeFixedConst) / this.stageRows) / 2.0;
    }

    /** 화면에 객체들 출력, 동시 반복 호출되며 init 에서 시작됨 */
    render() {
        // 캔버스 비우기
        if(this.backgroundImage != null && this.backgroundImage != '') {
            // 배경 이미지 존재 시 지금 출력
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // 디버그 모드 켜진 경우 디버그용 객체 출력
        if(this.renderDebugMode) {
            this.renderDebug();
        }

        // 현재 게임 상태별 렌더링
        if(this.state == 'playing' || this.state == 'gameover') {
            this.renderPlaying();
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
        }
    }

    /** 화면 출력 - 플레이 중 출력 */
    renderPlaying() {
        // 객체 그리기
        for(let idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
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
            this.ctx.strokeText('PAUSED', this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) + 10));
        }

        // 일시정지 해제 대기시간 그리기
        if(this.resumingTime >= 1) {
            let fontSize = this.convertFontSize(12);
            this.ctx.font = fontSize + 'px ' + this.fontFamily;

            if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.textAlign = "center";
            this.ctx.strokeText('Resume in ' + this.resumingTime + ' cycle !', this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) + 10));
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

    /** 화면 출력 - 메인 메뉴 */
    renderMenu() {
        let idx;
        let rows = 0;
        let fontSize = this.convertFontSize(30);
        let opacity = 0.9;
        let gap = Math.floor(fontSize / 2.0);
        let label = '';

        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.strokeText('Shutting Stars', this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - 100 + rows));
        rows += fontSize + gap;

        for(idx=0; idx<this.menuList.length; idx++) {
            let menuOne = this.menuList[idx];

            if(menuOne == 'play'   ) label = 'PLAY';
            if(menuOne == 'setting') label = 'SETTING';

            fontSize = this.convertFontSize(20);
            this.ctx.font = fontSize + 'px ' + this.fontFamily;

            if(this.menuChoosing == menuOne) {
                opacity = 0.99;

                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                this.ctx.fillText(label, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - 100 + rows));
            } else {
                opacity = 0.3;

                if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
                else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
                this.ctx.strokeText(label, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - 100 + rows));
            }
            
            rows += fontSize + gap;
        }

        fontSize = this.convertFontSize(30);
        rows += fontSize * 5;

        fontSize = this.convertFontSize(12);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        opacity = 0.9;
        label = 'MOVE : ';
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
        label += '    ACCEPT : ' + this.enterKey;

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.fillText(label, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - 100 + rows));
        rows += fontSize + gap;
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
            this.ctx.strokeText('No songs available !', this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - (uppers - 20) + rows));
            rows += fontSize + gap;
            setTimeout(() => { selfs.state = 'menu'; }, 4000);
            return;
        } else {
            // 그외의 경우 안내문구 출력
            fontSize = this.convertFontSize(30);
            this.ctx.font = fontSize + 'px ' + this.fontFamily;
            if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
            else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
            this.ctx.textAlign = "center";
            this.ctx.strokeText('Choose what you want !', this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
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
            label = 'Composed by ' + songOne.composer + ', Notes written by ' + songOne.noteWriter + ', ' + songOne.bpm + 'BPM';
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
                    let diffOne = this.difficultyChoosingList[ddx];
                    let splits = diffOne.split(';');
                    let difficultyName = String(splits[0]).trim();
                    let difficultyNum  = parseInt(String(splits[1]).trim());

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
        label = 'MOVE : ';
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
        label += '    ACCEPT : ' + this.enterKey + '      BACK : ';
        if(this.escKey == 'ESCAPE') label += 'ESC';
        else                        label += this.escKey;

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = "center";
        this.ctx.fillText(label, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
        
        // 선택 곡 정보 출력
        if(songChoosen != null) {
            let desc = songChoosen.getDescriptionSplit();
            if(desc != null && desc.length > 0) {
                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(180, 180, 180, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(100, 100, 100, ' + opacity + ')');

                this.ctx.fillRect(Math.floor(this.canvas.width * 2.0 / 3.0), Math.floor(this.canvas.height * 3.0 / 4.0), Math.floor(this.canvas.width / 3.0), Math.floor(this.canvas.height * 1.0 / 4.0));

                fontSize = this.convertFontSize(12);
                this.ctx.font = fontSize + 'px ' + this.fontFamily;
                this.ctx.textAlign = "left";
                if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(100, 100, 100, ' + opacity + ')');
                else          this.ctx.fillStyle = this.convertColor('rgba(180, 180, 180, ' + opacity + ')');

                rows = Math.floor((this.canvas.height * 3.0 / 4.0) + fontSize) + 5;
                for(const line of desc) {
                    this.ctx.fillText(line, Math.floor(this.canvas.width * 2.0 / 3.0) + fontSize + this.getLeftMargin(), rows);
                    rows += fontSize + gap;
                }
                this.ctx.textAlign = "center";
            }
        }
    }

    /** 화면 출력 - 설정 화면 */
    renderSetting() {
        // ['fixKeypressTiming', 'fixSongTiming', 'setNoteSpeedMultiplier', 'setGraphicQuality'];
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
        this.ctx.strokeText('Settings', this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
        rows += fontSize + gap;

        for(idx=0; idx<this.settingList.length; idx++) {
            let settingOne = this.settingList[idx];
            let choosen = (this.settingChoosing == settingOne);

            label = '';
            let leftSide = '';
            let rightSide = '';

            if(choosen && this.settingModifyingMode) { leftSide = '◀'; rightSide = '▶'; }

            if(settingOne == 'fixKeypressTiming'     ) label = 'Key Press Delay - ' + leftSide + this.keypressTiming + rightSide;
            if(settingOne == 'fixSongTiming'         ) label = 'Sound Delay - '     + leftSide + this.songTiming + rightSide;
            if(settingOne == 'setNoteSpeedMultiplier') label = 'Note Speed Rate - ' + leftSide + this.noteSpeedMultiplier + rightSide;
            if(settingOne == 'setGraphicQuality'     ) label = 'Graphic Quality - ' + leftSide + this.settingGraphicQualityChoosing + rightSide;
            
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
            if(arrowKeyOne == 'ARROWUP') arrowKeyLabel = '↑';
            else if(arrowKeyOne == 'ARROWDOWN') arrowKeyLabel = '↓';
            else if(arrowKeyOne == 'ARROWLEFT') arrowKeyLabel = '←';
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
        if(songOne == null || typeof(songOne) == 'undefined') { this.song = null; this.songChoosing = null; this.state = 'songchoosing'; return; }

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
        rows += fontSize + gap;

        // 작곡가, 노트작성자, bpm 출력
        label = 'Composed by ' + songOne.composer + ', Notes written by ' + songOne.noteWriter + ', ' + songOne.bpm + 'BPM';
        fontSize = this.convertFontSize(20);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;

        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, ' + opacity + ')');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, ' + opacity + ')');
        this.ctx.textAlign = "center";
        this.ctx.fillText(label, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - 30 + rows));
    }

    /** 화면 출력 - 플레이 종료 후 결과 화면 */
    renderResult() {
        // 첫 줄
        let rows = 0;
        let fontSize = this.convertFontSize(30);
        let uppers = 150;
        let gap = Math.floor(fontSize / 2.0);

        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        if(this.dark) this.ctx.strokeStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.strokeStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.strokeText('PLAYING REPORT', this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
        rows += fontSize + (gap/2);

        fontSize = this.convertFontSize(15);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.song.name, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows)); // TODO : 난이도 표기
        rows += fontSize + gap;

        fontSize = this.convertFontSize(20);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        this.ctx.fillStyle = this.convertColor('rgba(80, 230, 80, 0.8)'); // blue
        this.ctx.textAlign = "center";
        this.ctx.fillText('PERFECT\t' + this.report.PERFECT, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
        rows += fontSize + gap;

        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        this.ctx.fillStyle = this.convertColor('rgba(180, 230, 80, 0.8)'); // green
        this.ctx.textAlign = "center";
        this.ctx.fillText('GREAT\t' + this.report.GREAT, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
        rows += fontSize + gap;

        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        this.ctx.fillStyle = this.convertColor('rgba(230, 230, 80, 0.8)'); // yellow
        this.ctx.textAlign = "center";
        this.ctx.fillText('GOOD\t' + this.report.GOOD, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
        rows += fontSize + gap;

        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        this.ctx.fillStyle = this.convertColor('rgba(230, 180, 80, 0.8)'); // purple
        this.ctx.textAlign = "center";
        this.ctx.fillText('BAD\t' + this.report.BAD, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
        rows += fontSize + gap;

        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        this.ctx.fillStyle = this.convertColor('rgba(230, 80, 80, 0.8)'); // red
        this.ctx.textAlign = "center";
        this.ctx.fillText('MISS\t' + this.report.MISS, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
        rows += fontSize + gap;

        fontSize = this.convertFontSize(15);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        if(this.dark) this.ctx.fillStyle = this.convertColor('rgba(200, 200, 200, 0.9)');
        else          this.ctx.fillStyle = this.convertColor('rgba(80, 80, 80, 0.9)');
        this.ctx.textAlign = "center";
        this.ctx.fillText('TOTAL\t' + this.point, this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
        rows += fontSize + (gap / 2);

        let escKeyLabel = this.escKey;
        if(this.escKey == 'ESCAPE') escKeyLabel = 'ESC';

        fontSize = this.convertFontSize(15);
        this.ctx.font = fontSize + 'px ' + this.fontFamily;
        this.ctx.textAlign = "center";
        this.ctx.fillText("'" + escKeyLabel + "' key to continue...", this.convertX(this.stageSize.w / 2), this.convertY((this.stageSize.h / 2) - uppers + rows));
    }

    renderHpBar() {
        // HP바 출력
        //    NotePlacer 제일 왼쪽부터 NotePlacer 제일 오른쪽 범위까지를 HP바 최대길이로 함
        //    NotePlacer 보다 상단에 위치
        const hpBarMaxWidth = this.notePlacers[this.notePlacers.length - 1].x + this.notePlacers[this.notePlacers.length - 1].r - this.notePlacers[0].x + this.notePlacers[0].r;
        const hpBarHeight = 10;
        const hpBarBorderColor = this.convertColor('rgba(200, 200, 200, 0.5)');
        let   hpBarInsideColor = String(hpBarBorderColor);

        // 현재 HP (최대 100) 에 따라 HP바 길이 결정
        let hpBarWidth = 0;
        if(this.hp > 0) {
            hpBarWidth = hpBarMaxWidth * (this.hp / 100);
        }

        // HP 잔여에 따른 컬러 변경
        if(this.hp >= 80) {
            hpBarInsideColor = this.convertColor('rgba(80, 230, 80, 0.8)'); // green
        } else if(this.hp >= 60) {
            hpBarInsideColor = this.convertColor('rgba(180, 230, 80, 0.8)'); // yellow-green
        } else if(this.hp >= 40) {
            hpBarInsideColor = this.convertColor('rgba(230, 230, 80, 0.8)'); // yellow
        } else if(this.hp >= 20) {
            hpBarInsideColor = this.convertColor('rgba(230, 180, 80, 0.8)'); // orange
        } else {
            hpBarInsideColor = this.convertColor('rgba(230, 80, 80, 0.8)'); // red
        }

        //    HP바를 화면 상단에 출력
        this.ctx.strokeStyle = hpBarBorderColor;
        this.ctx.strokeRect(this.convertX(this.notePlacers[0].x - this.notePlacers[0].r), this.convertY(10), this.convertX(hpBarMaxWidth), this.convertY(hpBarHeight));

        //    HP바 내부를 채우기
        this.ctx.fillStyle = hpBarInsideColor;
        this.ctx.fillRect(this.convertX(this.notePlacers[0].x - this.notePlacers[0].r), this.convertY(10), this.convertX(hpBarWidth), this.convertY(hpBarHeight));
    }

    renderDebug() {
        for(const obj of this.objects) {
            if(typeof(obj.draw) == 'function') continue;
            if(typeof(obj.type) == 'undefined') continue;
            if(typeof(obj.color) == 'undefined') continue;
            if(typeof(obj.x) == 'undefined') continue;
            if(typeof(obj.y) == 'undefined') continue;

            try {
                this.ctx.fillStyle = obj.color;
                if(obj.type == 'rect') {
                    this.ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
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

    /*** 공통 동시처리 프로세스 (init 에서 호출) */
    simultaneousWork(simultaneousWorkCycle) {
        // 항상 처리할 사항

        // 폭발 완료 처리
        for(let idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if(obj instanceof Note) {
                if(obj.explosing >= obj.explosingMax) {
                    this.objects.splice(idx, 1);
                    idx--;
                }
            } else if(obj instanceof NotePlacer) {
                if(obj.explosing >= obj.explosingMax) obj.explosing = 0;
            } else if(obj instanceof JudgeMark) {
                if(obj.explosing >= obj.explosingMax) {
                    this.objects.splice(idx, 1);
                    idx--;
                }
            }
        }

        // 곡 준비 중 남은 시간 처리
        if(this.state == 'songtitle') {
            if(this.songTitleTime > 0) this.songTitleTime--;
            if(this.songTitleTime <= 0) {
                this.state = 'playing';
                this.resetStage();
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

        // 일시정지 및 재개 대기 타이밍 처리
        if(this.paused) return;
        if(this.resumingTime >= 1) {
            this.resumingTime--;
            if(this.resumingTime <= 0) this.resumed = true;
            else                       this.resumed = false;
            return;
        }

        // NoteKeyObject 처리중 애니메이션 재생 진행상황 증가
        for(let idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if(obj instanceof NoteKeyObject) {
                if(obj.explosing >= 1 && obj.explosing < obj.explosingMax) {
                    if(simultaneousWorkCycle % 4 == 0) obj.explosing++;
                }
            } else if(obj instanceof JudgeMark) {
                if(obj.explosing < obj.explosingMax) {
                    if(simultaneousWorkCycle % 4 == 0) obj.explosing++;
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
        if(song == null) {  this.state = 'menu'; return; } // 곡이 선정되지 않은 경우 시간 진행 없음
        if(this.difficulty == null) { this.state = 'menu'; return; } // 곡 내 난이도가 선정되지 않은 경우 시간 진행 없음
        if(this.state != 'playing') return; // 곡이 재생 중이 아닌 경우 시간 진행 없음

        this.elapsedTime++;
        
        // 현재 시간에 해당하는 패턴이 있는지 확인
        let patternNow = null;
        let patterns = song.difficulties[this.difficulty];

        for(idx=0; idx<patterns.length; idx++) {
            const pattern = patterns[idx];
            if(this.checkEqualFloats((pattern.time * song.timeMultiplier) + this.songBitGap + song.timeConstant, this.elapsedTime * 1.0)) {
                patternNow = pattern;
                break;
            }
        }

        if(patternNow != null) {
            // 패턴이 존재하는 경우, 해당 패턴에 따라 Note 생성
            //     locationIndex 값이 음수인 경우 랜덤 부여
            if(patternNow.locationIndex < 0) {
                patternNow.locationIndex = Math.floor(Math.random() * this.notePlacers.length);
            }

            //     노트 생성
            const note = new Note(patternNow.locationIndex);
            note.id = this.lastObjectId++;
            this.objects.push(note); // 패턴 추가
        }

        // 이미 지나가버린 패턴 체크
        for(idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if((obj instanceof Note) && (obj.y <= 0)) {
                if(obj.explosing == 0) {
                    // 미스 처리
                    let resultMark = 'MISS';
                    this.processResultMark(resultMark);
                    this.displayResultMark(resultMark);

                    // 폭발 시작
                    obj.explosing = 1;
                }
            }
        }

        // 곡의 끝 체크
        //     패턴들이 매 타이밍마다 있으리란 보장이 없으므로, 패턴들 중 가장 나중에 등장하는 패턴의 시간을 알아내야 함
        let lastPatternTime = 0;
        for(idx=0; idx<patterns.length; idx++) {
            const pattern = patterns[idx];
            if(pattern.time > lastPatternTime) {
                lastPatternTime = pattern.time;
                // lastPatternTime = lastPatternTime / this.timeMultiplier;
            }
        }

        if(song.endTime > lastPatternTime + 4) {
            lastPatternTime = song.endTime;
        }

        // console.log(this.elapsedTime);
        if(this.elapsedTime > lastPatternTime) {
            this.clearTimeHandler();

            if(this.audio != null) {
                try { this.audio.pause(); } catch(ex) {}
                this.audio = null;
            }

            this.onSongEnd();
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
        for(idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if(obj instanceof Note) {
                if(obj.explosing >= 1) continue; // 폭발 중인 Note 는 이동하지 않음
                obj.y -= obj.speedY;
                if(obj.y < 0) obj.y = 0;
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
        return Math.floor(((this.getNoteRadius() * 2.0) * this.noteSpeedMultiplier * this.noteSpeedFixedConst) / (this.timeMultiplier / 8.0));
    }

    /** 노트 생성 위치 */
    getNoteCreationYLocation() {
        return Math.floor( this.getNotePlacerYLocation() + (this.getNoteRadius() * 2 * this.stageRows * this.noteSpeedMultiplier * this.noteSpeedFixedConst * (this.timeMultiplier / 8.0) ));
    }

    /** 판정선 위치 */
    getNotePlacerYLocation() {
        return Math.floor((this.getNoteRadius() * 4) + this.getTopMarginNote());
    }

    /** 폭발 중인 Note 폭발속도 가속 */
    accelerateExplosingNotes() {
        const notes = this.getNotes();
        for(let idx=0; idx<notes.length; idx++) {
            let noteOne = notes[idx];
            if(noteOne.explosing >= 1 && noteOne.explosing < noteOne.explosingMax) noteOne.explosing++;
        }
    }

    /** 폭발 중인 JudgeMark 폭발속도 가속 */
    accelerateExplosingJudgeMarks() {
        for(let idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if(obj instanceof JudgeMark) {
                if(obj.explosing < obj.explosingMax) obj.explosing++;
            }
        }
    }

    onGameOver() {
        this.accelerateExplosingNotes();
        this.accelerateExplosingJudgeMarks();

        // 게임오버 상태로 변경
        this.gameoverTime = 16 * _shuttingstarcore.timeMultiplier;
        this.state = 'gameover';
        this.paused = false;
    }

    onSongEnd() {
        this.state = 'result';
        this.paused = false;
        if(this.audio != null) {
            try { this.audio.pause(); } catch(e) { console.error(e); }
        }
        this.audio = null;
        this.songThumb = null;
        this.videoBga = null;
    }

    getNotes() {
        let arr = [];
        for(let idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if(obj instanceof Note) {
                arr.push(obj);
            }
        }
        return arr;
    }

    getNotePlacers() {
        let arr = [];
        for(let idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if(obj instanceof NotePlacer) {
                arr.push(obj);
            }
        }
        return arr;
    }

    getNotePlacer(locationIndex) {
        for(let idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
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
    bpm = 120.0; // beat per minute, 곡의 속도
    endTime = 560; // 곡 종료 시간
    timeMultiplier = 1; // 보정 시간 (노트 등장 time 값에 * 보정값으로 적용)
    timeConstant = 0; // 보정 시간 (노트 등장 time 값에 + 보정값으로 적용, timeMultiply 보다 후순위로 적용)
    
    // 난이도 별 패턴, easy, normal, hard, 그 뒤부터는 ex1, ex2, ex3, ... 순으로 난이도 이름 뒤에 ; (세미콜론) 뒤에 숫자로 난이도 표기한 문자열이 키로 사용
    //     예: easy;1, normal;3, hard;7, ex1;12, ...
    // 각 원소는 배열로 그 안에 ShuttingStarsNotePattern 패턴들이 탑재
    difficulties = {}

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
        for(const k in this.difficulties) {
            arr.push(k);
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
    r = 0;
    opacity = 1.0;
    shape = 'circle';
    color = 'rgba(200, 200, 200, 0.99)';
    fill = true; // 채우기 여부 / false 인 경우 채우기 없이 테두리만 출력
    constructor() {}
    draw(ctx) {
        if(this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(_shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y, true), _shuttingstarcore.convertX(this.r), 0, 2 * Math.PI);
            
            if(this.fill) {
                ctx.fillStyle = _shuttingstarcore.convertColor('rgba(' + this.color + ', ' + this.opacity + ')');
                ctx.fill();
            } else {
                ctx.strokeStyle = _shuttingstarcore.convertColor('rgba(' + this.color + ', ' + this.opacity + ')');
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        } else if(this.shape == 'rect') {
            if(this.fill) {
                ctx.fillStyle = _shuttingstarcore.convertColor('rgba(' + this.color + ', ' + this.opacity + ')');
                ctx.fillRect(_shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y, true), _shuttingstarcore.convertX(this.r), _shuttingstarcore.convertY(this.r));
            } else {
                ctx.strokeStyle = _shuttingstarcore.convertColor('rgba(' + this.color + ', ' + this.opacity + ')');
                ctx.lineWidth = 1;
                ctx.strokeRect(_shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y, true), _shuttingstarcore.convertX(this.r), _shuttingstarcore.convertY(this.r));
            }
        }
    }

    /** 다른 객체와의 충돌 감지 (수평 좌표는 동일하다고 가정하여 수직 충돌만 감지) */
    isConflictedVertical(otherObject) {
        if(this.shape === 'circle' && otherObject.shape === 'circle') {
            const distance = Math.abs(this.y - otherObject.y);
            return distance < this.r + otherObject.r;
        } else if(this.shape == 'rect' && otherObject.shape == 'rect') {
            return !(this.y + this.r < otherObject.y || this.y > otherObject.y + otherObject.r);
        } else if(this.shape == 'circle' && otherObject.shape == 'rect') {
            const closestY = Math.max(otherObject.y, Math.min(this.y, otherObject.y + otherObject.r));
            const dy = this.y - closestY;
            return (dy * dy) < (this.r * this.r);
        } else if(this.shape == 'rect' && otherObject.shape == 'circle') {
            const closestY = Math.max(this.y, Math.min(otherObject.y, this.y + this.r));
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
                     this.y + this.r < otherObject.y || 
                     this.y > otherObject.y + otherObject.r);
        } else if(this.shape == 'circle' && otherObject.shape == 'rect') {
            const closestX = Math.max(otherObject.x, Math.min(this.x, otherObject.x + otherObject.r));
            const closestY = Math.max(otherObject.y, Math.min(this.y, otherObject.y + otherObject.r));
            const dx = this.x - closestX;
            const dy = this.y - closestY;
            return (dx * dx + dy * dy) < (this.r * this.r);
        } else if(this.shape == 'rect' && otherObject.shape == 'circle') {
            const closestX = Math.max(this.x, Math.min(otherObject.x, this.x + this.r));
            const closestY = Math.max(this.y, Math.min(otherObject.y, this.y + this.r));
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
            return '230, 80, 80';
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
    explosing = 0; // 0 : 일반적인 상황, 그 이상으로 가면 Note 제거 (혹은 Note 제거기 동작) 1~8 : 처리 애니메이션 진행상황
    explosingMax = 8;
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
        ctx.fillText(this.key, _shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y + (this.r / 2.0) - (fontSize / 3.0), true)); // Note 중앙에 출력
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
    speedY = 10;
    constructor(locationIndex) {
        super(locationIndex);
        this.r = _shuttingstarcore.getNoteRadius();

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
        // 화면에 판정 결과 띄우기
        let fontSize = _shuttingstarcore.convertFontSize(20);
        ctx.font = fontSize + 'px ' + _shuttingstarcore.fontFamily;
        if(     this.judgeResult == 'MISS')    ctx.fillStyle = _shuttingstarcore.convertColor('rgba(230, 80, 80, 0.8)'); // red
        else if(this.judgeResult == 'BAD')     ctx.fillStyle = _shuttingstarcore.convertColor('rgba(230, 180, 80, 0.8)'); // purple
        else if(this.judgeResult == 'GOOD')    ctx.fillStyle = _shuttingstarcore.convertColor('rgba(230, 230, 80, 0.8)'); // yellow
        else if(this.judgeResult == 'GREAT')   ctx.fillStyle = _shuttingstarcore.convertColor('rgba(180, 230, 80, 0.8)'); // green
        else if(this.judgeResult == 'PERFECT') ctx.fillStyle = _shuttingstarcore.convertColor('rgba(80, 230, 80, 0.8)'); // blue

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
                ctx.fillStyle = _shuttingstarcore.convertColor('rgba(255, 0, 0, 0.9)');
            } else {
                if(_shuttingstarcore.dark) ctx.strokeStyle = _shuttingstarcore.convertColor('rgba(230, 230, 230, 0.9)');
                else ctx.fillStyle = _shuttingstarcore.convertColor('rgba(80, 80, 80, 0.9)');
            }
            ctx.fillText('COMBO ' + combo, _shuttingstarcore.convertX(midX), _shuttingstarcore.convertY(midY + 30)); // 판정 결과 아래에 출력
        }
    }

    /** 기존 투명도 (Opacity) 에 explosing 반영 */
    getNowOpacity() {
        return this.opacity * (1.0 - ((this.explosing - 1.0) / (this.explosingMax - 1.0)));
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
class ShuttingStarsUtility {
    /** 문자열 치환 */
    replaceString(originalStr, targetStr, replacements) {
        return String(originalStr).split(targetStr).join(replacements); 
    }
}
const _shuttingstarutil = new ShuttingStarsUtility();
/********************** 기타 Util 성 Class 세팅 ************************/

/********************** 외부에서 호출할 수 있도록 함수 구현 ************************/

/** 곡 추가 */
function addShuttingStarSong(song) {
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
        song.bpm            = json.bpm;
        song.endTime        = json.endTime;
        song.timeConstant   = json.timeConstant;
        song.timeMultiplier = json.timeMultiplier;
        song.difficulties   = {};

        for(let key in json.difficulties) {
            let noteArrs = json.difficulties[key];
            let arr = [];

            for(let noteJsonOne of noteArrs) {
                let patternOne = new ShuttingStarsNotePattern(noteJsonOne.locationIndex, noteJsonOne.time);
                arr.push(patternOne);
            }

            song.difficulties[key] = arr;
        }
    }
    _shuttingstarcore.songs.push(song);
}

/** 게임 활성화 - 특정 영역에 게임 캔버스를 배치하려는 경우 매개변수로 DOM객체를 입력 */
function initShuttingStars(param) {
    return _shuttingstarcore.init(param);
}