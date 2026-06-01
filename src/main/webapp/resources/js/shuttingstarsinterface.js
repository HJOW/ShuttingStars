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
    requestPushPermission() {
        return new Promise((resolve, reject) => { 
            resolve({ success : false });
        });
    }
    getRemoteConfigValues() {
        return new Promise((resolve, reject) => { resolve({ success : false, value : null }); })
    }
}

/** Firebase 호스팅 기본제공 API 이용 방식 */
class FirebaseHostingImplementation extends ShuttingStarsInterface {
    authStateChangedEvents = [];
    pushPermRequestedTime = 0;
    pushPermGranted = 'none';
    constructor() {
        super();
        const selfs = this;

        // Firebase 활성화
        this.auth         = firebase.auth();
        this.firestore    = firebase.firestore();
        this.messaging    = firebase.messaging();
        this.remoteConfig = firebase.remoteConfig();
        // this.rtdb         = firebase.database();

        // Analytics 등 사용
        firebase.analytics();
        firebase.performance();

        // 인증 상태 이벤트 부여
        this.auth.onAuthStateChanged((user) => {
            if(user) {
                selfs.user = user;
                selfs.logined = true;
            } else {
                selfs.logined = false;
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
                const googles = new firebase.auth.GoogleAuthProvider();
                this.auth.signInWithPopup(googles).then((result) => {
                    let credential = result.credential;
                    let token = credential.accessToken;
                    let user = result.user;
                    selfs.user = user;
                    selfs.logined = true;
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

    createUser(json) {
        const selfs = this;
        return new Promise((resolve, reject) => {
            try {
                    selfs.auth.createUserWithEmailAndPassword(json.email, json.password).then((userCredential) => {
                    selfs.user = userCredential.user;
                    selfs.logined = true;
                    resolve({
                        success : true,
                        userJson : userCredential.user
                    });
                }).catch((e) => { reject(e); });
            } catch(exc) {
                reject(exc);
            }
        });
    }

    login(json) {
        const selfs = this;
        return new Promise((resolve, reject) => {
            try {
                selfs.auth.signInWithEmailAndPassword(json.email, json.password).then((userCredential) => {
                    selfs.user = userCredential.user;
                    selfs.logined = true;
                    resolve({
                        success : true,
                        userJson : userCredential.user
                    });
                }).catch((e) => { reject(e); });
            } catch(exc) {
                reject(exc);
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
                if(! selfs.logined) { throw ('No logined.'); }
                let record = {};
                for(const k in json) {
                    record[k] = json[k];
                }
                record.uid = selfs.user.uid;
                record.email = selfs.user.email;
                selfs.firestore.collection('highscore').add(record).then((docRef) => { resolve({ success : true }); }).catch((e) => { reject(e); });
            } catch(exc) {
                reject(exc);
            }
        });
    }

    listRankBoard() {
        const selfs =  this;
        return new Promise((resolve, reject) => {
            let arr = [];
            selfs.firestore.collection('highscore').get().then((querySnapshot) => { // TODO 테스트
                querySnapshot.forEach((doc) => {
                    doc = doc.data();
                    arr.push(doc);
                });
                resolve({ success : true, list : arr }); 
            });
        })
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
                const val = selfs.remoteConfig.getAll();
                resolve({ success : true, value : val });
            } catch(e) {
                reject(e);
            }
        });
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