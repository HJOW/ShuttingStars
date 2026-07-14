/** 
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0 
*/
/* 유틸리티 (필수) */

try { if(console) { console.log(`
ShuttingStars - LICENSE

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

    Visit https://github.com/HJOW/ShuttingStars/blob/main/LICENSE
`); console.log(`
Using third-party libraries are included.
Three.js
    MIT License
    Visit https://github.com/mrdoob/three.js/blob/dev/LICENSE
`); }} catch(nothings) {}

import JSON5 from './json5.min.mjs';

class ShuttingStarsUtilityClass {
    /** @type {number} 토스트 메시지에 부여할 고유 순번의 현재 최대값 */
    toastIndex = 0;

    /** @type {Array<object>} jsonp 요청 */
    jsonpRequests = [];

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
        area.style.zIndex = '1100';

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
     * 로그 출력
     * @param {*} msg 로그
     */
    log(msg) {
        try { if(typeof(console) == 'undefined') { window.console.log(msg); } else console.log(msg); } catch(e) {}
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
     * 랜덤 글자 반환, 0~9 및 a~Z 까지 나올 수 있음 
     * @returns {string} 랜덤 글자
    */
    randomChar() {
        let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let idx = Math.floor(this.random() * chars.length);
        return chars.charAt(idx);
    }

    /** 랜덤 글자 반환, 0~9 및 A~Z 까지 나올 수 있음 (소문자가 제외됨) 
     * * @returns {string} 랜덤 글자
    */
    randomBigChar() {
        let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let idx = Math.floor(this.random() * chars.length);
        return chars.charAt(idx);
    }

    /** 랜덤 문자열 반환 (숫자 및 알파벳으로 구성)
     * 
     * @param {boolean} allCases true 인 경우 알파벳 소문자도 포함, false 인 경우 알파벳은 대문자만 포함됨
     * @param {number} length 문자열 길이
     * @returns {string} 랜덤 문자열
    */
    randomString(allCases, length) {
        let result = '';
        for(let idx=0; idx<length; idx++) {
            if(allCases) {
                result += this.randomChar();
            } else {
                result += this.randomBigChar();
            }
        }
        return result;
    }

    /**
     * 0 ~ 1.0 사이 랜덤 수 반환 (1 은 포함되지 않음)
     * @returns {number} 0 이상 1 미만의 난수
     */
    random() {
        let randStep1, randStep2;
        // crypto 사용 가능한 경우 더 확실한 random 반환
        if(window.crypto) {
            try {
                const buff = new Uint32Array(1);
                window.crypto.getRandomValues(buff);
                
                randStep1 = buff[0] / 4294967296.0;
            } catch(failed) { randStep1 = Math.random(); }
        } else {
            randStep1 = Math.random();
        }
        
        // 좀더 뒤섞기
        //     값을 역 전환 (1에서 뺄셈)
        //     0.0 ~ 0.2 인 경우 0.4 ~ 0.6 범위로 변경
        //     0.2 ~ 0.4 인 경우 0.6 ~ 0.8 범위로 변경
        //     0.4 ~ 0.6 인 경우 0.8 ~ 1.0 범위로 변경
        //     0.6 ~ 0.8 인 경우 0.0 ~ 0.2 범위로 변경
        //     0.8 ~ 1.0 인 경우 0.2 ~ 0.4 범위로 변경
        randStep2 = 1.0 - randStep1;
        if(randStep2 < 0.2) randStep2 += 0.4;
        else if(randStep2 < 0.4) randStep2 += 0.4;
        else if(randStep2 < 0.6) randStep2 += 0.4;
        else if(randStep2 < 0.8) randStep2 -= 0.6;
        else randStep2 -= 0.6;
        return randStep2;
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
     * 일정 시간 (밀리초) 만큼 기다림. Promise.
     * @returns {Promise<*>}
     */
    waitTime(timeMilliSeconds) {
        return new Promise((resolve, reject) => {
            setTimeout(() => { resolve(true); }, timeMilliSeconds);
        });
    }

    /**
     * Firebase 사용 준비 여부 반환
     * @returns {boolean}
     */
    detectFirebaseInitialized() {
        if(typeof(firebase) == 'undefined') return false;
        if(typeof(firebase.apps) == 'undefined') return false;
        if(firebase.apps == null) return false;
        if(firebase.apps.length <= 0) return false;
        return true;
    }

    /** 브라우저/기기 상에 SSUUID (기기 고유값으로 사용) 값 존재를 최대한 보장 */
    assureSSUUID() {
        let ssuuid = localStorage.getItem('SSUUID');
        if(typeof(ssuuid) == 'undefined' || ssuuid == null) ssuuid = '';
        ssuuid = ssuuid.trim();
        if(ssuuid == '') {
            ssuuid = 'SS' + this.randomString(false, 16) + new Date().getTime();
            localStorage.setItem('SSUUID', ssuuid);
        }
        return ssuuid;
    }

    /** 배열을 받아 내부의 원소를 랜덤하게 섞은 새 배열을 반환 */
    randomizeArrayElements(array) {
        if(!Array.isArray(array)) return array;
        let res = array.slice();
        for(let idx=res.length - 1; idx>0; idx--) {
            let randIdx = Math.floor(this.random() * (idx + 0.999));
            let temp = res[idx];
            res[idx] = res[randIdx];
            res[randIdx] = temp;
        }
        return res;
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

    /**
     * 해당 URL로 JSONP 요청 (Promise)
     *     JSONP callback 함수명은 GET 방식 매개변수 callback 에 탑재됨
     *     
     * 
     * @param {string} url JSONP 요청 URL
     * @param {number} timeout 타임아웃 (밀리초, 선택사항)
     * @returns {Promise<object>} 처리 결과 (요청 정보와 응답 데이터가 포함된 객체로 반환)
     */
    jsonp(url, timeout) {
        const selfs = this;
        return new Promise((resolve, reject) => {
            let uniqNos = 0;
            for(let idx=0; idx<selfs.jsonpRequests.length; idx++) {
                const reqObj = selfs.jsonpRequests[idx];
                const thisUniqNo = reqObj.seq;

                if(uniqNos < thisUniqNo) uniqNos = thisUniqNo;
            }
            uniqNos++;

            let callbackName = 'ssjsonp_' + uniqNos;
            let responsed = false;
            let scriptObj = null;
            if(typeof(timeout) == 'undefined' || isNaN(timeout)) timeout = 16000;

            // URL에 콜백함수 이름을 전달해야 함
            //    URL 에 [CALLBACK] 문자열이 없으면
            let appenderCallbackName = 'ssjsonpc.' + callbackName;
            if(url.indexOf('[CALLBACK]') < 0) {
                if(url.indexOf('?callback') < 0) {
                    // URL 에 ?callback= 이 없으면 아예 ?callback= 를 추가해서 뒤에 콜백함수 이름 전달
                    url += '?callback=' + encodeURIComponent(appenderCallbackName);
                } else {
                    // URL 에 ?callback= 이 있으면 callback 매개변수 값을 변경해야 함
                    let urlx = new URL(url);
                    let params = urlx.searchParams;
                    params.set('callback', appenderCallbackName);
                    urlx.search = params.toString();
                    url = urlx.toString();
                }
            } else {
                // URL 에 [CALLBACK] 문자열이 있으면 해당 문자열을 콜백함수 이름으로 치환
                url = this.replaceString(url, '[CALLBACK]', encodeURIComponent(appenderCallbackName));
            }

            // 작업 완료 후 처리할 함수 미리 정의
            const fCleanAfter = () => {
                if(typeof(window.ssjsonpc) != 'undefined') {
                    if(typeof(window.ssjsonpc[callbackName]) != 'undefined') {
                        delete window.ssjsonpc[callbackName];
                    }
                }

                for(let idx=0; idx<selfs.jsonpRequests.length; idx++) {
                    const reqObj = selfs.jsonpRequests[idx];
                    if(reqObj.seq == uniqNos) {
                        selfs.jsonpRequests.splice(idx, 1);
                        break;
                    }
                }

                if(scriptObj != null) {
                    scriptObj.remove();
                    scriptObj = null;
                }
            };

            // 요청 객체 생성
            const requests = {};
            requests.seq = uniqNos;
            requests.url = url;
            requests.callbackName = callbackName;
            requests.response = null;
            requests.callback = function(obj) {
                if(responsed) return;
                responsed = true;

                requests.response = obj;
                requests.callback = null;

                setTimeout(fCleanAfter, 500);
                resolve(requests);
            }

            // 타임아웃 부여
            setTimeout(() => {
                if(responsed) return;
                responsed = true;
                requests.response = null;
                requests.callback = null;
                setTimeout(fCleanAfter, 500);
                reject('Timeout');
            });
            
            // window 에 콜백함수 탑재
            if(typeof(window.ssjsonpc) == 'undefined') window.ssjsonpc = {};
            window.ssjsonpc[callbackName] = requests.callback;
            selfs.jsonpRequests.push(requests);

            // script 태그 생성
            scriptObj = document.createElement('script');
            scriptObj.src = url;
            
            // script 태그 부착
            document.body.appendChild(scriptObj);
        });
    }

    /**
     * JSON 문자열 파싱 (JSON5 지원 - 참고 : https://github.com/json5/json5 )
     * 
     * @param {string} str JSON5 문자열
     * @returns {object} 처리 결과
     */
    parseJSON(str) {
        return JSON5.parse(str);
    }
}

/** Browser 감지 클래스 (TODO 미완성) */
class BrowserDetectorClass {
    /**
     * 인스턴스를 초기화합니다.
     */
    constructor() { }
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

/**
 * BPM Detector 클래스 (StackOverflow 답변 참고 자료)
 */
class BpmDetectorClass {
    /**
    곡의 BPM 감지 (Promise)

    This script is not my own codes.
    References from 
        https://stackoverflow.com/questions/30110701/how-can-i-use-js-webaudioapi-for-beat-detection
            Posted by Etheryte, modified by community. See post 'Timeline' for change history
            Retrieved 2026-05-24, License - CC BY-SA 4.0
        http://joesul.li/van/beat-detection-using-web-audio/
            There is no license mention.

    @returns {Promise<number>} BPM 값
    */
    detect(audioURL) {
        return new Promise((resolve, reject) => {
            function prepare(buffer) {
                var offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
                var source = offlineContext.createBufferSource();
                source.buffer = buffer;
                var filter = offlineContext.createBiquadFilter();
                filter.type = "lowpass";
                source.connect(filter);
                filter.connect(offlineContext.destination);
                source.start(0);
                offlineContext.startRendering();
                offlineContext.oncomplete = function(e) {
                    process(e);
                };
            }
            
            function process(e) {
                var filteredBuffer = e.renderedBuffer;
                //If you want to analyze both channels, use the other channel later
                var data = filteredBuffer.getChannelData(0);
                var max = arrayMax(data);
                var min = arrayMin(data);
                var threshold = min + (max - min) * 0.98;
                var peaks = getPeaksAtThreshold(data, threshold);
                var intervalCounts = countIntervalsBetweenNearbyPeaks(peaks);
                var tempoCounts = groupNeighborsByTempo(intervalCounts);
                tempoCounts.sort(function(a, b) {
                    return b.count - a.count;
                });
                if (tempoCounts.length) {
                    // output.innerHTML = tempoCounts[0].tempo;
                    resolve(tempoCounts[0].tempo);
                } else {
                    reject(tempoCounts);
                }
            }
            
            // http://tech.beatport.com/2014/web-audio/beat-detection-using-web-audio/
            function getPeaksAtThreshold(data, threshold) {
                var peaksArray = [];
                var length = data.length;
                for (var i = 0; i < length;) {
                    if (data[i] > threshold) {
                        peaksArray.push(i);
                        // Skip forward ~ 1/4s to get past this peak.
                        i += 10000;
                    }
                    i++;
                }
                return peaksArray;
            }
            
            function countIntervalsBetweenNearbyPeaks(peaks) {
                var intervalCounts = [];
                peaks.forEach(function(peak, index) {
                    for (var i = 0; i < 10; i++) {
                        var interval = peaks[index + i] - peak;
                        var foundInterval = intervalCounts.some(function(intervalCount) {
                            if (intervalCount.interval === interval) return intervalCount.count++;
                        });
                        //Additional checks to avoid infinite loops in later processing
                        if (!isNaN(interval) && interval !== 0 && !foundInterval) {
                            intervalCounts.push({
                                interval: interval,
                                count: 1
                            });
                        }
                    }
                });
                return intervalCounts;
            }
            
            function groupNeighborsByTempo(intervalCounts) {
                var tempoCounts = [];
                intervalCounts.forEach(function(intervalCount) {
                    //Convert an interval to tempo
                    var theoreticalTempo = 60 / (intervalCount.interval / 44100);
                    theoreticalTempo = Math.round(theoreticalTempo);
                    if (theoreticalTempo === 0) {
                        return;
                    }
                    // Adjust the tempo to fit within the 90-180 BPM range
                    while (theoreticalTempo < 90) theoreticalTempo *= 2;
                    while (theoreticalTempo > 180) theoreticalTempo /= 2;
                
                    var foundTempo = tempoCounts.some(function(tempoCount) {
                        if (tempoCount.tempo === theoreticalTempo) return tempoCount.count += intervalCount.count;
                    });
                    if (!foundTempo) {
                        tempoCounts.push({
                            tempo: theoreticalTempo,
                            count: intervalCount.count
                        });
                    }
                });
                return tempoCounts;
            }
            
            // http://stackoverflow.com/questions/1669190/javascript-min-max-array-values
            function arrayMin(arr) {
                var len = arr.length,
                    min = Infinity;
                while (len--) {
                    if (arr[len] < min) {
                        min = arr[len];
                    }
                }
                return min;
            }
            
            function arrayMax(arr) {
                var len = arr.length,
                    max = -Infinity;
                while (len--) {
                    if (arr[len] > max) {
                        max = arr[len];
                    }
                }
                return max;
            }


            var context = new(window.AudioContext || window.webkitAudioContext)();
            fetch(audioURL).then((resp1) => {
                resp1.arrayBuffer().then((arrayBuffer) => {
                    context.decodeAudioData(arrayBuffer, function(buffer) {
                        prepare(buffer);
                    });
                });
            });
        });
    }

    /**
     * 다른 BPM Detecting 방식 (Promise)
     *     Posted by Timothy Moody
     *     Retrieved 2026-05-24, License - CC BY-SA 3.0
     * @returns {Promise<number>} BPM 값
     */
    detect2(audioURL) {
        return new Promise((resolve, reject) => {
            var request;
            function createBuffers(url) {

                // Fetch Audio Track via AJAX with URL
                request = new XMLHttpRequest();

                request.open('GET', url, true);
                request.responseType = 'arraybuffer';

                request.onload = function(ajaxResponseBuffer) {

                    // Create and Save Original Buffer Audio Context in 'originalBuffer'
                    var audioCtx = new AudioContext();
                    var songLength = ajaxResponseBuffer.total;

                    // Arguments: Channels, Length, Sample Rate
                    var offlineCtx = new OfflineAudioContext(1, songLength, 44100);
                    source = offlineCtx.createBufferSource();
                    var audioData = request.response;
                    audioCtx.decodeAudioData(audioData, function(buffer) {

                        window.originalBuffer = buffer.getChannelData(0);
                        var source = offlineCtx.createBufferSource();
                        source.buffer = buffer;

                        // Create a Low Pass Filter to Isolate Low End Beat
                        var filter = offlineCtx.createBiquadFilter();
                        filter.type = "lowpass";
                        filter.frequency.value = 140;
                        source.connect(filter);
                        filter.connect(offlineCtx.destination);
                            // Render this low pass filter data to new Audio Context and Save in 'lowPassBuffer'
                            offlineCtx.startRendering().then(function(lowPassAudioBuffer) {
                                var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
                                var song = audioCtx.createBufferSource();
                                song.buffer = lowPassAudioBuffer;
                                song.connect(audioCtx.destination);

                                // Save lowPassBuffer in Global Array
                                window.lowPassBuffer = song.buffer.getChannelData(0);
                                console.log("Low Pass Buffer Rendered!");

                                // Overwrite our array buffer to a 10 second clip starting from 00:10s
                                window.lowPassFilter = getClip(10, 10, window.lowPassFilter);
                                // Down Sample Your Clip
                                window.lowPassBuffer = getSampleClip(window.lowPassFilter, 300);
                                // Overwrite our array to the normalized array
                                window.lowPassBuffer = normalizeArray(window.lowPassBuffer);
                                // Count the Groupings
                                let res = countFlatLineGroupings(lowPassBuffer);
                                resolve(res);
                            });
                        },
                        function(e) {});
                }
                request.send();
            }

            function getClip(length, startTime, data) {

                var clip_length = length * 44100;
                var section = startTime * 44100;
                var newArr = [];

                for (var i = 0; i < clip_length; i++) {
                    newArr.push(data[section + i]);
                }

                return newArr;
            }

            function getSampleClip(data, samples) {
                var newArray = [];
                var modulus_coefficient = Math.round(data.length / samples);

                for (var i = 0; i < data.length; i++) {
                    if (i % modulus_coefficient == 0) {
                        newArray.push(data[i]);
                    }
                }
                return newArray;
            }

            // Overwrite our array to down-sampled array.
            function normalizeArray(data) {

                var newArray = [];

                for (var i = 0; i < data.length; i++) {
                    newArray.push(Math.abs(Math.round((data[i + 1] - data[i]) * 1000)));
                }

                return newArray;
            }

            function countFlatLineGroupings(data) {
                var groupings = 0;
                var newArray = normalizeArray(data);

                function getMax(a) {
                    var m = -Infinity,
                        i = 0,
                        n = a.length;

                    for (; i != n; ++i) {
                        if (a[i] > m) {
                            m = a[i];
                        }
                    }
                    return m;
                }

                function getMin(a) {
                    var m = Infinity,
                        i = 0,
                        n = a.length;

                    for (; i != n; ++i) {
                        if (a[i] < m) {
                            m = a[i];
                        }
                    }
                    return m;
                }

                var max = getMax(newArray);
                var min = getMin(newArray);
                var count = 0;
                var threshold = Math.round((max - min) * 0.2);

                for (var i = 0; i < newArray.length; i++) {

                if (newArray[i] > threshold && newArray[i + 1] < threshold && newArray[i + 2] < threshold && newArray[i + 3] < threshold && newArray[i + 6] < threshold) {
                        count++;
                    }
                }

                return count;
            }
            createBuffers(audioURL);
        });
    }
}

const ShuttingStarsUtility = new ShuttingStarsUtilityClass();
const SSUtil = ShuttingStarsUtility;

const BrowserDetector = new BrowserDetectorClass();
const BpmDetector     = new BpmDetectorClass();

export { ShuttingStarsUtility, SSUtil, BrowserDetector, BpmDetector };