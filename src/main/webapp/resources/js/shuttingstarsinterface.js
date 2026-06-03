/** 
 * 
 * 백엔드 서버 / DB 통신 구현 파트
 *     필요 시 shuttingstars.js 보다 먼저 불러와야 함 
 *     Crypto-JS 의존성 있음
 * 
 * Backend interface file
 *    Without this file, the game will run fine, just login and internet recording feature will be disabled.
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

/** 중간 인터페이스 구현 */
class ShuttingStarsInterface {
    avail = false; // false 인 경우 사용 불가
    auth = null;
    firestore = null;
    rtdb = null;
    messaging = null;
    remoteConfig = null;
    perf = null;
    analytics = null;
    usingGoogleLogin = false;
    sessionChecked = false;
    logined = false;
    user = null;
    openGoogleLogin() { return new Promise((resolve, reject) => { resolve({ success : false }); }) }
    login(json) {
        return new Promise((resolve, reject) => { resolve({ success : false, userJson : null }); })
    }
    checkLogined(userJson) {
        return new Promise((resolve, reject) => { resolve({ success : false, loginAvail : false}); })
    }
    logout() {
        return new Promise((resolve, reject) => { resolve({ success : false }); })
    }
    createUser(json) {
        return new Promise((resolve, reject) => { resolve({ success : false, userJson : null }); })
    }
    listAdditionalSongs() {
        return new Promise((resolve, reject) => { resolve({ success : false, songs : [] }); })
    }
    listRankBoard() {
        return new Promise((resolve, reject) => { resolve({ success : false, list : [] }); })
    }
    registerRankRecord(json) {
        return new Promise((resolve, reject) => { resolve({ success : false }); })
    }
    listBoardIds() {
        return [];
    }
    listPost(boardId) {
        return new Promise((resolve, reject) => { resolve({ success : false, list : [] }); })
    }
    writePost(boardId, text) {
        return new Promise((resolve, reject) => { resolve({ success : false }); })
    }
    modifyPost(boardId, postNo, text) {
        return new Promise((resolve, reject) => { resolve({ success : false }); })
    }
    deletePost(boardId, postNo) {
        return new Promise((resolve, reject) => { resolve({ success : false }); })
    }
    requestPushPermission() {
        return new Promise((resolve, reject) => { 
            resolve({ success : false });
        });
    }
    getRemoteConfigValues() {
        return new Promise((resolve, reject) => { resolve({ success : false, value : null }); })
    }
    perfTraceStart(traceName) { return null; }
    perfTraceStop(traceObj) {}
    logEvent(eventMsg) {}
}

/** Firebase 호스팅 기본제공 API 이용 방식 */
class FirebaseHostingImplementation extends ShuttingStarsInterface {
    authStateChangedEvents = [];
    pushPermRequestedTime = 0;
    pushPermGranted = 'none';
    constructor() {
        super();
        const selfs = this;

        this.usingGoogleLogin = true;

        // Firebase 활성화
        try { this.auth         = firebase.auth();         } catch(e) { console.error(e); }
        try { this.firestore    = firebase.firestore();    } catch(e) { console.error(e); }
        try { this.messaging    = firebase.messaging();    } catch(e) { console.error(e); }
        try { this.remoteConfig = firebase.remoteConfig(); } catch(e) { console.error(e); }
        try { this.rtdb         = firebase.database();     } catch(e) { console.error(e); }
        try { this.perf         = firebase.performance();  } catch(e) { console.error(e); }
        try { this.analytics    = firebase.analytics();    } catch(e) { console.error(e); }

        // 인증 상태 이벤트 부여
        this.auth.onAuthStateChanged((user) => {
            if(user) {
                selfs.user = user;
                selfs.logined = true;
            } else {
                selfs.logined = false;
                if(selfs.analytics != null) { selfs.analytics.setUserId(''); }
            }

            for(let idx=0; idx<selfs.authStateChangedEvents.length; idx++) {
                const fAuthStateHandler = selfs.authStateChangedEvents[idx];
                if(typeof(fAuthStateHandler) == 'function') fAuthStateHandler(selfs);
            }
        });

        // Remote Config
        this.remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
        this.remoteConfig.defaultConfig = {
            frameTime              : 10
          , resumeDelayTime        : 16
          , songTitleBaseTime      : 120
          , visualizeBarMultiplier : 2.2
          , backStarlightCount     : 20
          , noticeEn : ''
          , noticeKo : ''
          , noticeWhen : 0
        };
        
        this.avail = true;
    }

    openGoogleLogin() {
        const selfs = this;
        return new Promise((resolve, reject) => {
            try {
                if(selfs.auth == null) { resolve({success : false, userJson : null, message : 'Failed to load firebase authentication'}); return; }
                const googles = new firebase.auth.GoogleAuthProvider();
                selfs.auth.signInWithPopup(googles).then((result) => {
                    let credential = result.credential;
                    let token = credential.accessToken;
                    let user = result.user;
                    selfs.user = user;
                    selfs.logined = true;
                    if(selfs.analytics != null) { selfs.analytics.setUserId(selfs.user.uid); }
                    resolve({ success : true, userJson : user, credential : credential });
                }).catch((e) => {
                    console.error(e);
                    ShuttingStarsUtility.toast('ERROR:' + e);
                    reject(e);
                });
            } catch(ex) {
                console.error(ex);
                ShuttingStarsUtility.toast('ERROR:' + ex);
                reject(ex);
            }
        });
    }

    checkLogined(userJson) {
        const selfs = this;
        return new Promise((resolve, reject) => {
            resolve({ success : true, loginAvail : selfs.logined });
        });
    }

    logout() {
        const selfs = this;
        return new Promise((resolve, reject) => {
            selfs.logined = false;
            selfs.user = null;
            try {
                if(selfs.auth == null) { resolve({success : false, userJson : null, message : 'Failed to load firebase authentication'}); return; }
                selfs.auth.signOut().then(() => {
                    setTimeout(() => { selfs.authStateChangedEvents = []; }, 1000);
                    resolve({ success : true });
                }).catch((e) => { reject(e); });
            } catch(exc) {
                reject(exc);
            }
        });
    }

    registerRankRecord(json) {
        const selfs = this;
        return new Promise((resolve, reject) => {
            try {
                if(selfs.firestore == null) { resolve({success : false, message : 'Failed to load firebase firestore'}); return; }
                if(! selfs.logined) { throw ('No logined.'); }
                let record = {};
                for(const k in json) {
                    record[k] = json[k];
                }
                record.uid = selfs.user.uid;
                record.email = selfs.user.email;
                record.date = new Date().getTime();
                selfs.firestore.collection('highscore').add(record).then((docRef) => { resolve({ success : true }); }).catch((e) => { reject(e); });
            } catch(exc) {
                reject(exc);
            }
        });
    }

    listRankBoard() {
        const selfs =  this;
        return new Promise((resolve, reject) => {
            if(selfs.firestore == null) { resolve({success : false, list : [], message : 'Failed to load firebase firestore'}); return; }

            let arr = [];
            selfs.firestore.collection('highscore').get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    doc = doc.data();
                    arr.push(doc);
                });
                resolve({ success : true, list : arr }); 
            });
        })
    }



    listBoardIds() {
        return ['preboard'];
    }
    listPost(boardId, condition) {
        return new Promise((resolve, reject) => {
            let arr = [];
            selfs.firestore.collection('board').get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    doc = doc.data();
                    if(doc.boardName != 'preboard') return;
                    if(condition) {
                        for(const k in condition) {
                            if(doc[k] != condition[k]) return;
                        }
                    }

                    arr.push(doc);
                });
                resolve({ success : true, list : arr }); 
            });
        });
    }
    writePost(boardId, text) {
        return new Promise((resolve, reject) => {
            try {
                if(selfs.firestore == null) { resolve({success : false, message : 'Failed to load firebase firestore'}); return; }
                if(text.length >= 256) { resolve({success : false, message : 'Too long !'}); return; }
                if(! selfs.logined) { throw ('No logined.'); }

                let record = {};
                for(const k in json) {
                    record[k] = json[k];
                }
                record.uid = selfs.user.uid;
                record.boardName = boardId;
                record.regdate = new Date().getTime();
                selfs.firestore.collection('board').add(record).then((docRef) => { resolve({ success : true }); }).catch((e) => { reject(e); });
            } catch(exc) {
                reject(exc);
            }
        })
    }
    modifyPost(boardId, postNo, text) {
        return new Promise((resolve, reject) => { resolve({ success : false }); })
    }
    deletePost(boardId, postNo) {
        return new Promise((resolve, reject) => { resolve({ success : false }); })
    }


    requestPushPermission() {
        const selfs = this;
        return new Promise((resolve, reject) => { 
            try {
                const nows = new Date().getTime();
                if(nows - selfs.pushPermRequestedTime < 1000 * 60 * 5) {
                    resolve({ success : ( selfs.pushPermGranted == 'granted' ) , message : selfs.pushPermGranted });
                    return;
                }

                Notification.requestPermission().then((permission) => {
                    if(permission === 'granted') {
                        selfs.pushPermGranted = permission;
                        resolve({ success : true, message : permission });
                    } else {
                        selfs.pushPermGranted = permission;
                        resolve({ success : false, message : permission });
                    }
                }).catch((ex) => {
                    resolve({ success : false, message : ex });
                });
            } catch(e) {
                resolve({ success : false, message : e });
            }
        });
    }

    getRemoteConfigValues() {
        const selfs = this;
        return new Promise((resolve, reject) => {
            try {
                if(selfs.remoteConfig == null) { resolve({success : false, value : '', message : 'Failed to load firebase remoteConfig'}); return; }
                const val = selfs.remoteConfig.getAll();
                resolve({ success : true, value : val });
            } catch(e) {
                reject(e);
            }
        });
    }

    perfTraceStart(traceName) {
        const traceObj = this.perf.trace(traceName);
        traceObj.start();
        return traceObj;
    }

    perfTraceStop(traceObj) {
        traceObj.stop();
    }

    logEvent(eventMsg) {
        this.analytics.logEvent(eventMsg);
    }
}

/** Servlet 기반 서버와 통신하는 방식 (직접 구현해야 함) */
class ServletImplementation extends ShuttingStarsInterface {

}

/** 직접 호출하지 말 것 (shuttingstars.js 에서 호출함) */
function __ssBackEnd() {
    let _ssbackend;
    if(typeof(firebase) == 'undefined') _ssbackend = new ServletImplementation(); // 서블릿 따로 구현하는 경우 ServletImplementation 에도 구현을 해야 함
    else                                _ssbackend = new FirebaseHostingImplementation(); // Firebase 사용 가능한 경우 (Firebase 호스팅 환경) 자동 사용
    return _ssbackend;
}