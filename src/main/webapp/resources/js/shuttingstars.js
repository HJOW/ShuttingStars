/**
 * Shutting Stars
 */

/* 게임 기동 근간을 이루는 전역 객체 */
class ShuttingStarsCore {
    resolution = {w : 1280, h : 720}; // 게임 내 무대의 절대크기
    dark = true;
    keyList = ['S', 'D', 'F', 'H', 'J', 'K']; // 입력 키

    canvas = null; // 캔버스 객체
    ctx = null;    // 2d 컨텍스트 객체

    frameTime = 16; // 1000 / 60
    timeMultiplier = 8.0;
    stageRows = 256; // 스테이지의 세로를 N등분하여 패턴의 시간과 매칭

    lastObjectId = 0; // 객체 ID 부여용 카운터
    objects = []; // 게임의 구성 요소 객체들 (렌더링 대상)
    notePlacers = []; // NotePlacer 객체들 보관

    elapsedTime = 0; // 진행 시간 (실제 시간과 단위가 다르며, 곡마다 속도가 다름, 곡의 패턴 배열의 N번째 숫자에 해당)
    timeProgressKey = null; // 시간 진행 타이머 키가 들어가는 변수

    point = 0;
    combo = 0;
    report = {
        PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0
    };
    hp = 100.0; // 다 깎이면 게임 오버
    state = 'menu'; // menu / songchoosing / playing / result

    song = null; // 현재 플레이 중인 곡, ShuttingStarsSong 객체
    songs = []; // 선택 가능한 곡들, ShuttingStarsSong 객체 배열

    paused = false;
    resumingTime = 0;
    simultaneousWorkCycle = 0;
    
    /** 초기화 (게임이 출력될 div 영역 객체를 입력) */
    init(rootDiv) {
        if(typeof(rootDiv) == 'undefined') {
            rootDiv = document.body;
            rootDiv.innerHTML = "<div id='shuttingstars_root'></div>"
            rootDiv = document.getElementById('shuttingstars_root');
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

        this.canvas.width  = this.resolution.w;
        this.canvas.height = this.resolution.h;

        const selfs = this;

        // 반복 처리 프로세스 2개 (렌더링, 공통 동시처리 프로세스) 시작 (곡 동시처리 프로세스는 곡 초기화 시 진행)
        setInterval(() => { selfs.render(); }, this.frameTime);
        setInterval(() => { selfs.simultaneousWork(selfs.simultaneousWorkCycle); selfs.simultaneousWorkCycle++; if(selfs.simultaneousWorkCycle >= 10000) selfs.simultaneousWorkCycle = 0; }, 20);

        document.addEventListener('keydown', (event) => {
            selfs.handleKeyInput(event.key.toUpperCase());
        });

        let vGap = window.outerHeight - window.innerHeight;
        if(vGap < 0) vGap = 0;
        const fResize = function() {
            selfs.canvas.style.height = (window.outerHeight - vGap + 1) + 'px';
        };
        fResize();
        window.addEventListener('resize', fResize);

        this.resetStage();
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
        this.report = {
            PERFECT : 0, GREAT : 0, GOOD : 0, BAD : 0, MISS : 0
        };

        for(idx=0; idx<this.keyList.length; idx++) {
            const notePlacer = new NotePlacer(idx);
            notePlacer.id = this.lastObjectId++;
            this.objects.push(notePlacer);
            this.notePlacers.push(notePlacer);
        }

        if(this.song == null) return;
        this.elapsedTime = 0;

        // 곡 동시처리 프로세스 시작
        this.timeProgressKey = setInterval(() => { selfs.timeElapse(); }, Math.round((60000 / this.song.bpm) / this.timeMultiplier));
    }

    /** 키 입력 처리 */
    handleKeyInput(key) {
        // 특수 키 확인
        if(key == 'ARROWUP' || key == 'ARROWDOWN' || key == 'ARROWLEFT' || key == 'ARROWRIGHT' || key == 'ENTER') {
            // TODO

        } else if(key == 'ESCAPE') {
            if(this.state == 'playing') {
                if(this.paused) {
                    this.resumingTime = 40;
                    this.paused = false;
                } else {
                    this.paused = true;
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

        // NotePlacer 폭발 처리
        notePlacer.explosing = 1;

        // 해당 NotePlacer 과 충돌/위치가 동일한 Note 가 있는지 확인
        for(idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if((obj instanceof Note)) {
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
            this.report.PERFECT++;

            this.hp += this.combo;
            if(this.hp > 100) this.hp = 100;
        } else if(resultMark == 'GREAT') {
            this.point += (70 * (this.combo + 1));
            this.combo++;
            this.report.GREAT++;

            this.hp += (this.combo / 2.0);
            if(this.hp > 100) this.hp = 100;
        } else if(resultMark == 'GOOD') {
            this.point += (50 * (this.combo + 1));
            this.combo++;
            this.report.GOOD++;

            this.hp += (this.combo / 4.0);
            if(this.hp > 100) this.hp = 100;
        } else if(resultMark == 'BAD') {
            this.combo = 0;
            this.report.BAD++;
            this.hp -= 1.0;
            if(this.hp < 0) this.hp = 0;
        } else {
            this.combo = 0;
            this.report.MISS++;
            this.hp -= 4.0;
            if(this.hp < 0) this.hp = 0;
        }
    }
    
    /** 판정 띄우기 */
    displayResultMark(resultMark) {
        if(resultMark == null) return;
        this.objects.push(new JudgeMark(resultMark));
    }

    /** 화면에 객체들 출력, 동시 반복 호출되며 init 에서 시작됨 */
    render() {
        // 캔버스 비우기
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if(this.state == 'playing') {
            this.renderPlaying();
        } else if(this.state == 'menu') {
            this.renderMenu();
        } else if(this.state == 'songchoosing') {
            this.renderSongChoosing();
        } else if(this.state == 'result') {
            this.renderResult();
        }

        
    }

    renderPlaying() {
        // 객체 그리기
        for(let idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            obj.draw(this.ctx);
        }

        // HP바 그리기
        this.renderHpBar();

        // 일시정지 상태 그리기
        if(this.paused) { // TODO
            let fontSize = 20;
            this.ctx.font = fontSize + 'px Nanum Gothic Coding';

            if(this.dark) this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.9)';
            else          this.ctx.strokeStyle = 'rgba(80, 80, 80, 0.9)';
            this.ctx.strokeText('PAUSED', this.convertX(this.resolution.w / 2 - fontSize * (6/2)), this.convertY(this.resolution.h / 2));
        }

        // 일시정지 해제 대기시간 그리기
        if(this.resumingTime >= 1) {
            let fontSize = 12;
            this.ctx.font = fontSize + 'px Nanum Gothic Coding';

            if(this.dark) this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.9)';
            else          this.ctx.strokeStyle = 'rgba(80, 80, 80, 0.9)';
            this.ctx.strokeText('Resume in ' + this.resumingTime + ' cycle !', this.convertX(this.resolution.w / 2 - fontSize * (20/2)), this.convertY(this.resolution.h / 2));
        }
    }

    renderMenu() {
        // TODO
    }

    renderSongChoosing() {

    }

    renderResult() {

    }

    renderHpBar() {
        // HP바 출력
        //    NotePlacer 제일 왼쪽부터 NotePlacer 제일 오른쪽 범위까지를 HP바 최대길이로 함
        //    NotePlacer 보다 상단에 위치
        const hpBarMaxWidth = this.notePlacers[this.notePlacers.length - 1].x + this.notePlacers[this.notePlacers.length - 1].r - this.notePlacers[0].x + this.notePlacers[0].r;
        const hpBarHeight = 10;
        const hpBarBorderColor = 'rgba(200, 200, 200, 0.5)';
        let   hpBarInsideColor = 'rgba(200, 200, 200, 0.5)';

        // 현재 HP (최대 100) 에 따라 HP바 길이 결정
        let hpBarWidth = 0;
        if(this.hp > 0) {
            hpBarWidth = hpBarMaxWidth * (this.hp / 100);
        }

        // HP 잔여에 따른 컬러 변경
        if(this.hp >= 80) {
            hpBarInsideColor = 'rgba(80, 230, 80, 0.8)'; // green
        } else if(this.hp >= 60) {
            hpBarInsideColor = 'rgba(180, 230, 80, 0.8)'; // yellow-green
        } else if(this.hp >= 40) {
            hpBarInsideColor = 'rgba(230, 230, 80, 0.8)'; // yellow
        } else if(this.hp >= 20) {
            hpBarInsideColor = 'rgba(230, 180, 80, 0.8)'; // orange
        } else {
            hpBarInsideColor = 'rgba(230, 80, 80, 0.8)'; // red
        }

        //    HP바를 화면 상단에 출력
        this.ctx.strokeStyle = hpBarBorderColor;
        this.ctx.strokeRect(_shuttingstarcore.convertX(this.notePlacers[0].x - this.notePlacers[0].r), _shuttingstarcore.convertY(10), _shuttingstarcore.convertX(hpBarMaxWidth), _shuttingstarcore.convertY(hpBarHeight));

        //    HP바 내부를 채우기
        this.ctx.fillStyle = hpBarInsideColor;
        this.ctx.fillRect(_shuttingstarcore.convertX(this.notePlacers[0].x - this.notePlacers[0].r), _shuttingstarcore.convertY(10), _shuttingstarcore.convertX(hpBarWidth), _shuttingstarcore.convertY(hpBarHeight));
    }

    /*** 공통 동시처리 프로세스 (init 에서 호출) */
    simultaneousWork(simultaneousWorkCycle) {
        // 항상 처리할 사항
        for(let idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if((obj instanceof JudgeMark) || (obj instanceof Note)) {
                if(obj.explosing >= 8) {
                    this.objects.splice(idx, 1);
                    idx--;
                }
            } else if(obj instanceof NotePlacer) {
                if(obj.explosing >= 8) obj.explosing = 0;
            }
        }

        // 일시정지 및 재개 대기 타이밍 처리
        if(this.paused) return;
        if(this.resumingTime >= 1) {
            this.resumingTime--;
            return;
        }

        // NoteKeyObject 처리중 애니메이션 재생 진행상황 증가
        for(let idx=0; idx<this.objects.length; idx++) {
            const obj = this.objects[idx];
            if((obj instanceof NoteKeyObject) || (obj instanceof JudgeMark)) {
                if(obj.explosing >= 1 && obj.explosing < 8) {
                    if(simultaneousWorkCycle % 4 == 0) obj.explosing++;
                }
            }
        }
    }

    /** 곡 동시처리 프로세스 - 시간 진행 (해당 곡의 timeMultiplier 분의 1비트) */
    timeElapse() {
        if(this.paused) return;
        if(this.resumingTime >= 1) return;

        const song = this.song;
        let idx;
        if(song == null) {  this.state = 'menu'; return; } // 곡이 선정되지 않은 경우, 시간 진행 없음
        if(this.state != 'playing') return; // 곡이 재생 중이 아닌 경우, 시간 진행 없음

        this.elapsedTime++;
        
        // 현재 시간에 해당하는 패턴이 있는지 확인
        let patternNow = null;
        for(idx=0; idx<song.patterns.length; idx++) {
            const pattern = song.patterns[idx];
            if(pattern.time === this.elapsedTime * this.timeMultiplier) {
                patternNow = pattern;
                break;
            }
        }

        if(patternNow != null) {
            // 패턴이 존재하는 경우, 해당 패턴에 따라 Note 생성
            const note = new Note(patternNow.locationIndex);
            note.speedY = song.getNoteMoveSpeed();
            note.y = song.getNoteMoveSpeed() * this.stageRows; // 곡의 비트가 여기서 stageRows 번이 더 진행되었을 때 NotePlacer 에 도달하는 위치

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
        for(idx=0; idx<song.patterns.length; idx++) {
            const pattern = song.patterns[idx];
            if(pattern.time > lastPatternTime) {
                lastPatternTime = pattern.time;
            }
        }
        //    마지막 패턴 등장시간 + 2초 뒤에 종료
        if(this.elapsedTime * this.timeMultiplier > lastPatternTime + 2000) {
            this.clearTimeHandler();
            this.onSongEnd();
        }

        // hp 체크 (0 미만이면 게임 오버 처리)
        if(this.hp <= 0) {
            this.clearTimeHandler();
            this.onGameOver();
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
            clearInterval(this.timeProgressKey);
            this.timeProgressKey = null;
        }
    }

    onGameOver() {
        // TODO 게임 오버 구현
    }

    onSongEnd() {
        // TODO 게임 종료 구현
        _shuttingstarcore.state = 'result';
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

    getLeftMargin() {
        return 20;
    }

    getTopMargin() {
        return 0;
    }
    
    /** 게임 내 무대 크기 (resolution.w, resolution.h) 를 실제 화면 내 좌표 (window.outerWidth, window.outerHeight) 로 변환 */
    convertX(x) {
        return x * this.resolution.w / window.outerWidth;
        // return x;
    }
    convertY(y) {
        return y * this.resolution.h / window.outerHeight;
        // return y;
    }
}
const _shuttingstarcore = new ShuttingStarsCore();

/** 곡 */
class ShuttingStarsSong {
    name = '';
    patterns = []; // ShuttingStarsNotePattern 배열
    bpm = 120.0; // beat per minute, 곡의 속도

    getNoteMoveSpeed() {
        return 20;
    }
}

/** 노트가 생성될 위치와 시간 (즉 패턴) */
class ShuttingStarsNotePattern {
    locationIndex = 0;
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
    shape = 'circle';
    color = 'rgba(200, 200, 200, 0.99)';
    fill = true; // 채우기 여부 / false 인 경우 채우기 없이 테두리만 출력
    constructor() {}
    draw(ctx) {
        if(this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(_shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y), _shuttingstarcore.convertX(this.r), 0, 2 * Math.PI);
            
            if(this.fill) {
                ctx.fillStyle = this.color;
                ctx.fill();
            } else {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        } else if(this.shape == 'rect') {
            if(this.fill) {
                ctx.fillStyle = this.color;
                ctx.fillRect(_shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y), _shuttingstarcore.convertX(this.r), _shuttingstarcore.convertY(this.r));
            } else {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1;
                ctx.strokeRect(_shuttingstarcore.convertX(this.x), _shuttingstarcore.convertY(this.y), _shuttingstarcore.convertX(this.r), _shuttingstarcore.convertY(this.r));
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
    opacity = 1.0;
    dark = false;
    explosing = 0; // 0 : 일반적인 상황, 그 이상으로 가면 Note 제거 (혹은 Note 제거기 동작) 1~8 : 처리 애니메이션 진행상황
    constructor(locationIndex) {
        super();
        this.locationIndex = locationIndex;
        this.key = _shuttingstarcore.keyList[locationIndex];
    }
    /** 기존 투명도 (Opacity) 에 explosing 반영 */
    getNowOpacity() {
        return this.opacity * (1.0 - (this.explosing / 8.0));
    }
    draw(ctx) {
        super.draw(ctx);

        // 키 표시 (중앙에 출력하며, 크기는 내부에 들어오도록 폰트 크기 계산해야 함)
        let fontSize = Math.round(this.r / 1.1);
        ctx.font = fontSize + 'px Nanum Gothic Coding';

        if(this.dark) ctx.strokeStyle = 'rgba(200, 200, 200, ' + this.getNowOpacity() + ')';
        else          ctx.strokeStyle = 'rgba(80, 80, 80, ' + this.getNowOpacity() + ')';
        ctx.strokeText(this.key, _shuttingstarcore.convertX(this.x + (this.r / 2.0) - (fontSize / 1.2)), _shuttingstarcore.convertY(this.y + (this.r / 2.0) - (fontSize / 3.0))); // Note 중앙에 출력
    }
}

/** Note 제거기, 화면 내 고정위치에 떠 있으며, 플레이어가 해당 키 입력 시, 해당 위치를 지나는 노트를 제거하며 점수를 획득함. 또한 노트와 위치가 얼마나 동일한지에 따라 점수 계산 */
class NotePlacer extends NoteKeyObject {
    constructor(locationIndex) {
        super(locationIndex);
        this.r = 10;
        this.x = 20 + Math.round(locationIndex * this.r * 2.5) + _shuttingstarcore.getLeftMargin();
        this.y = 40 + _shuttingstarcore.getTopMargin();
        this.key = _shuttingstarcore.keyList[locationIndex];
        this.shape = 'circle';
        this.opacity = 0.2;
        this.dark = true;
        this.color = 'rgba(' + this.getColorOfLocationIndex(locationIndex) + ', ' + this.getNowOpacity() + ')';
        this.fill = false;
    }
}

/** 노트, 곡 패턴에 따라 화면 최하단에 생성되며 위로 올라감. */
class Note extends NoteKeyObject {
    speedY = 10;
    constructor(locationIndex) {
        super(locationIndex);
        this.r = 10;
        this.x = 20 + Math.round(locationIndex * this.r * 2.5) + _shuttingstarcore.getLeftMargin();
        this.y = _shuttingstarcore.resolution.h + _shuttingstarcore.getTopMargin();
        this.key = _shuttingstarcore.keyList[locationIndex];
        this.shape = 'circle';
        this.opacity = 0.9;
        this.color = 'rgba(' + this.getColorOfLocationIndex(locationIndex) + ', ' + this.getNowOpacity() + ')';
    }
    /** 기존 투명도 (Opacity) 에 explosing 반영 */
    getNowOpacity() {
        // this.explosing 반영된 opacity 값 반환
        // this.opacity 값인 0.9 에서 시작, this.explosing 값이 0~3 까지 증가하는 동안 점진적으로 1.0 까지 증가
        // 이후 this.explosing 값이 4~8 까지 점진적으로 감소하여 8 이 되면 0이 되어야 함
        let opacity = this.opacity;
        if(this.explosing >= 0 && this.explosing <= 3) {
            opacity += (0.1 * this.explosing); // 0.9 -> 1.0
        } else if(this.explosing > 3 && this.explosing <= 8) {
            opacity += (0.4 - (0.08 * (this.explosing - 3))); // 1.0 -> 0.0
        } else if(this.explosing > 8) {
            opacity = 0.0;
        }
        return opacity;
    }
}

/** 판정 글씨와 콤보 마크 */
class JudgeMark extends ShuttingStarsObject {
    judgeResult = null; // PERFECT / GREAT / GOOD / BAD / MISS
    explosing = 0; // 0 : 일반적인 상황, 그 이상으로 가면 이 마크 제거 (혹은 Note 제거기 동작) 1~8 : 처리 애니메이션 진행상황
    constructor(judgeResult) {
        super();
        this.judgeResult = judgeResult;
    }

    draw(ctx) {
        // 화면에 판정 결과 띄우기
        let fontSize = 20;
        ctx.font = fontSize + 'px Nanum Gothic Coding';
        if(     this.judgeResult == 'MISS')    ctx.fillStyle = 'rgba(230, 80, 80, 0.8)'; // red
        else if(this.judgeResult == 'BAD')     ctx.fillStyle = 'rgba(230, 180, 80, 0.8)'; // purple
        else if(this.judgeResult == 'GOOD')    ctx.fillStyle = 'rgba(230, 230, 80, 0.8)'; // yellow
        else if(this.judgeResult == 'GREAT')   ctx.fillStyle = 'rgba(180, 230, 80, 0.8)'; // green
        else if(this.judgeResult == 'PERFECT') ctx.fillStyle = 'rgba(80, 230, 80, 0.8)'; // blue

        let midX = _shuttingstarcore.resolution.w / 2;
        let midY = _shuttingstarcore.resolution.h / 2;
        ctx.fillText(this.judgeResult, _shuttingstarcore.convertX(midX), _shuttingstarcore.convertY(midY)); // 화면 중앙에 출력

        // 콤보 띄우기
        if(_shuttingstarcore.combo > 1) {
            fontSize = 15;
            ctx.font = fontSize + 'px Nanum Gothic Coding';
            if(_shuttingstarcore.dark) ctx.strokeStyle = 'rgba(230, 230, 230, 0.9)';
            else ctx.strokeStyle = 'rgba(80, 80, 80, 0.9)';
            ctx.fillText('COMBO ' + _shuttingstarcore.combo, _shuttingstarcore.convertX(midX), _shuttingstarcore.convertY(midY + 30)); // 판정 결과 아래에 출력
        }
    }

    /** 기존 투명도 (Opacity) 에 explosing 반영 */
    getNowOpacity() {
        return this.opacity * (1.0 - (this.explosing / 8.0));
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