/** 
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0 
*/
/*
 * 
 * 백엔드 서버 / DB 통신 구현 파트
 *     필요 시 shuttingstars.js 보다 먼저 불러와야 함 
 *     Crypto-JS 의존성 있음
 * 
 * Backend interface file
 *    Without this file, the game will run fine, just login and internet recording feature will be disabled.
*/

import { ShuttingStarsUtility, SSUtil, BrowserDetector  } from './shuttingstarsutils.js'

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
    applyUserInfo() {
        return new Promise((resolve, reject) => { resolve({ success : false }); })
    }
    deleteAllMyData() {
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
    getAdditionalContents() {
        return new Promise((resolve, reject) => { resolve({ success : false, list : [] }); })
    }
    requestPushPermission() {
        return new Promise((resolve, reject) => { 
            resolve({ success : false });
        });
    }
    getOuterStorage() {
        return new Promise((resolve, reject) => { resolve({ success : false, data : {} }); })
    }
    storeOuterStorage(jsonObject) {
        return new Promise((resolve, reject) => { resolve({ success : false });  });
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

        if(! this.avail) {
            this.usingGoogleLogin = true;

            // Firebase 활성화
            try { this.auth         = firebase.auth();         } catch(e) { console.error(e); }
            try { this.firestore    = firebase.firestore();    } catch(e) { console.error(e); }
            try { this.messaging    = firebase.messaging();    } catch(e) { console.error(e); }
            try { this.remoteConfig = firebase.remoteConfig(); } catch(e) { console.error(e); }
            try { this.rtdb         = firebase.database();     } catch(e) { console.error(e); }
            try { this.perf         = firebase.performance();  } catch(e) { console.error(e); }
            try { this.analytics    = firebase.analytics();    } catch(e) { console.error(e); }

            // 인증 유지력 지정
            this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

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
        }
        
        this.avail = true;
    }

    /** 구글 로그인 열기 */
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

                    // 로그인 처리
                    selfs.user = user;
                    selfs.logined = true;
                    if(selfs.analytics != null) { selfs.analytics.setUserId(selfs.user.uid); }

                    // 응답
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

    /** 세션 유지 여부 확인 */
    checkLogined() {
        const selfs = this;
        return new Promise((resolve, reject) => {
            const userObj = selfs.auth.currentUser;
            const fNotLogined = () => {
                selfs.logined = false;
                selfs.user = null;
                resolve({ success : true, loginAvail : selfs.logined });
            };

            if(userObj) {
                if(typeof(userObj.uid) != 'undefined' && typeof(userObj.email) != 'undefined') {
                    selfs.user = userObj;
                    selfs.logined = true;
                    resolve({ success : true, loginAvail : selfs.logined });
                } else {
                    fNotLogined();    
                }
            } else {
                fNotLogined();
            }
        });
    }

    /** 로그아웃 */
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

    /** 사용자 정보 동기화 (다운로드) - Promise */
    loadUserInfo() {
        const selfs = this;
        return new Promise((resolve, reject) => {
            try {
                if(selfs.firestore == null) { resolve({success : false, message : 'Failed to load firebase firestore'}); return; }
                if(! selfs.logined) { resolve({success : false, message : 'Not logined'}); return; }

                // 데이터 조회
                const collOne = selfs.firestore.collection('user');
                const query = collOne.where('uid', '==', selfs.user.uid).limit(1);
                query.get().then((snapshot) => {
                    if(snapshot.empty) {
                        resolve({success : true, data : null });
                    } else {
                        let responsed = false;
                        snapshot.docs.forEach((doc) => { 
                            if(responsed) return;
                            responsed = true;
                            resolve({success : true, data : doc.data() });
                        });
                    }
                }).catch((ex2) => { reject(ex2); });
            } catch(exc) {
                reject(exc);
                resolve({ success : false }); 
            }
        });
    }

    /** 사용자 정보 동기화 (업로드) - Promise */
    applyUserInfo(creditJson) {
        const selfs = this;
        return new Promise((resolve, reject) => { 

            try {
                if(selfs.firestore == null) { resolve({success : false, message : 'Failed to load firebase firestore'}); return; }
                if(! selfs.logined) { resolve({success : false, message : 'Not logined'}); return; }

                // 데이터 만들기
                let record = {};
                
                record.uid = selfs.user.uid;
                record.email = selfs.user.email;
                record.date = new Date().getTime();
                record.credits = creditJson;

                // Firestore 상에 데이터 존재여부 검사
                let existsAlready = true;
                const collOne = selfs.firestore.collection('user');
                const query = collOne.where('uid', '==', selfs.user.uid).limit(1);
                query.get().then((snapshot) => {
                    if(snapshot.empty) existsAlready = false;
                    const fAfter = () => {
                        selfs.firestore.collection('user').add(record).then((docRef) => {
                            resolve({ success : true });
                        }).catch((ex4) => { reject(ex4); });
                    };

                    if(existsAlready) { // 데이터 이미 존재 시 삭제하고 다시 넣기 --> 여기선 삭제해야 함
                        const batch = selfs.firestore.batch();
                        snapshot.docs.forEach((doc) => { 
                            batch.delete(doc.ref);
                        });
                        batch.commit().then(() => {
                            fAfter();
                        }).catch((ex3) => { reject(ex3); });
                    } else {
                        fAfter();
                    }
                }).catch((ex2) => { reject(ex2); });
            } catch(exc) {
                reject(exc);
            }
        });
    }

    /** 탈퇴 - 이 계정 정보 (uid) 가 있는 모든 데이터 삭제 + 로그아웃 처리도 진행 */
    deleteAllMyData() {
        const selfs = this;
        return new Promise((resolve, reject) => {
            selfs.checkLogined().then((checkRes) => {
                if(! checkRes.success   ) { reject('Not logined !'); return; }
                if(! checkRes.loginAvail) { reject('Not logined !'); return; }
                if(selfs.firestore == null) { resolve({success : false, message : 'Failed to load firebase firestore'}); return; }
                
                selfs.deleteAllMyDataIn(false).then((counts) => {
                    selfs.logout().then((logoutRes) => { resolve(logoutRes); }).catch((exc) => { reject(exc); });
                }).catch((ex) => { reject(ex); });
            }).catch((e) => {
                reject(e);
            });
        });
    }

    /** 직접 호출하지 말 것 */
    async deleteAllMyDataIn(recursives) {
        const selfs = this;
        let counts = 0;

        // Firestore 에서 이 사용자의 데이터 삭제
        const collections = ['highscore', 'board', 'additionals', 'user', 'cloudconfigs'];
        let notEmptyDetected = false;

        for(let idx=0; idx<collections.length; idx++) {
            const collName = collections[idx];
            const collOne  = selfs.firestore.collection(collName);
            const query    = collOne.where('uid', '==', selfs.user.uid).limit(500); // 최대 500개까지만 삭제 가능
            const snapshot = await query.get();

            if(snapshot.empty) continue;
            notEmptyDetected = true; // empty 가 아닌 경우 일단 표시 (재귀 호출해 다시 돌려야 함)

            const batch = selfs.firestore.batch();
            snapshot.docs.forEach((doc) => { batch.delete(doc.ref); counts++; });

            await batch.commit();
        }
        if(notEmptyDetected) counts += await this.deleteAllMyDataIn(true);
        if(recursives) return counts;

        /*
        // RTDB 에서 이 사용자의 데이터 삭제
        const ssuuid = localStorage.getItem('SSUUID');
        if(typeof(ssuuid) != 'undefined' && ssuuid != null && ssuuid.trim() != '') {
            const rtdbRef = selfs.rtdb.ref('/userdb/ ' + ssuuid);
            await rtdbRef.remove();
            counts++;
        }
        */

        return counts;
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

    getAdditionalContents() {
        const selfs = this;
        return new Promise((resolve, reject) => { 
            try {
                if(selfs.firestore == null) { resolve({success : false, list : [], message : 'Failed to load firebase firestore'}); return; }
                if(! selfs.logined) { throw ('No logined.'); }

                let arr = [];
                selfs.firestore.collection('additionals').where('uid', '==', selfs.user.uid).get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        arr.push(doc.data());
                    });
                    resolve({ success : true, list : arr }); 
                }).catch((e) => { reject(e); });
            } catch(exc) {
                reject(exc);
            }
        });
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

    /** 외부 저장소 (일부 설정 동기화에 사용) 불러오기 (Promise) - Firestore 가 아닌 Realtime Database 사용
     * 
     * @return {Promise} { success : true/false, data : object }
    */
    getOuterStorage() {
        const selfs = this;
        return new Promise((resolve, reject) => { 
            try {
                // 데이터 조회
                selfs.firestore.collection('cloudconfigs').where('uid', '==', selfs.user.uid).get().then((snapshot) => {
                    if(snapshot.empty) {
                        resolve({ success : true, data : {} });
                        return;
                    }

                    let responsed = false;
                    snapshot.docs.forEach((doc) => { 
                        if(responsed) return;
                        responsed = true;

                        const cloudData = doc.data();
                        let record = {};
                        for(let k in cloudData) {
                            if(k == 'uid') continue; // uid 는 제외
                            record[k] = cloudData[k];
                        }

                        resolve({ success : true, data : record });
                    });
                }).catch((ex2) => { 
                    console.log(ex2);
                    resolve({ success : false, message : 'ERROR : ' + ex2 });
                });

                /*
                // SSUUID 가 준비되지 않은 경우 - 중단
                let ssuuid = localStorage.getItem('SSUUID');
                if(typeof(ssuuid) == 'undefined' || ssuuid == null) ssuuid = '';
                ssuuid = ssuuid.trim();
                if(ssuuid == '') {
                    resolve({ success : false, data : {}, message : 'SSUUID is not prepared.' }); // 실패
                    return;    
                }

                // SSUUID 로 RTDB 조회
                selfs.rtdb.ref('/userdb/ ' + ssuuid).get().then((snapshot) => {
                    if(snapshot.exists()){
                        resolve({ success : true, data : snapshot.val() });
                    } else {
                        resolve({ success : true, data : {} });
                    }
                }).catch((error) => {
                    console.error(error);
                    resolve({ success : false, data : {}, message : 'ERROR : ' + error });
                });
                */
            } catch(e) {
                console.log(e);
                resolve({ success : false, message : 'ERROR : ' + e, data : {} });
            }
        });
    }

    /** 
     * 외부 저장소 (일부 설정 동기화에 사용) 저장 / 삭제 (Promise) - Firestore 가 아닌 Realtime Database 사용
     * @param {Object|null} jsonObject 저장할 JSON 객체, null 인 경우 삭제
     * @return {Promise} { success : true/false, message : string }
     */
    storeOuterStorage(jsonObject) {
        const selfs = this;
        return new Promise((resolve, reject) => {
            try {
                // 계정 로그인되지 않은 경우 - 중단
                if((! selfs.logined) || (selfs.user == null) || (typeof(selfs.user) == 'undefined') || (typeof(selfs.user.uid) == 'undefined')) {
                    resolve({ success : false, message : 'Please login first' }); // 실패
                    return;    
                }

                // Firestore 에서 데이터가 있는지 먼저 체크
                selfs.firestore.collection('cloudconfigs').where('uid', '==', selfs.user.uid).get().then((snapshot) => {
                    let record;
                    const fRegister = function() {
                        record = {};
                        for(let k in jsonObject) {
                            record[k] = jsonObject[k];
                        }
                        record.uid = selfs.user.uid;
                        selfs.firestore.collection('cloudconfigs').add(record).then((docRef) => {
                            resolve({ success : true });
                        }).catch((ex4) => {
                            console.log(ex4);
                            resolve({ success : false, message : 'ERROR : ' + ex4 });
                        });
                    };
                    if(snapshot.empty) {
                        if(jsonObject != null) {
                            fRegister();
                        } else {
                            resolve({ success : true });
                        }
                    } else {
                        // 수정인 경우도 일단 삭제 후 다시 등록
                        const batch = selfs.firestore.batch();
                        snapshot.docs.forEach((doc) => { 
                            batch.delete(doc.ref);
                        });
                        batch.commit().then(() => {
                            if(jsonObject != null) {
                                fRegister();
                            } else {
                                resolve({ success : true });
                            }
                        }).catch((ex3) => { 
                            console.log(ex3);
                            resolve({ success : false, message : 'ERROR : ' + ex3 });
                        });
                    }
                });

                /*
                // SSUUID 가 준비되지 않은 경우 - 중단
                let ssuuid = localStorage.getItem('SSUUID');
                if(typeof(ssuuid) == 'undefined' || ssuuid == null) ssuuid = '';
                ssuuid = ssuuid.trim();
                if(ssuuid == '') {
                    resolve({ success : false, message : 'SSUUID is not prepared.' }); // 실패
                    return;    
                }
                selfs.rtdb.ref('/userdb/ ' + ssuuid).get().then((snapshot) => {
                    if(snapshot.exists()) { // 기존 데이터 존재
                        if(jsonObject == null) { // 삭제 요청 건
                            snapshot.ref.remove().then(() => {
                                resolve({ success : true }); // 삭제 완료    
                            }).catch((error) => {
                                console.error(error);
                                resolve({ success : false, message : 'ERROR : ' + error }); // 삭제 실패
                            });
                        } else { // 기존 데이터 수정 요청 건
                            jsonObject.moddate = new Date().getTime();
                            jsonObject.uid = selfs.user.uid;
                            snapshot.ref.set(jsonObject).then(() => {
                                resolve({ success : true }); // 수정 완료    
                            }).catch((error) => {
                                console.error(error);
                                resolve({ success : false, message : 'ERROR : ' + error }); // 수정 실패
                            });
                        }
                    } else {
                        if(jsonObject == null) { // 삭제 요청 건
                            resolve({ success : true }); // 삭제 완료
                        } else { // 신규 등록 요청 건
                            jsonObject.regdate = new Date().getTime();
                            jsonObject.uid = selfs.user.uid;
                            selfs.rtdb.ref('/userdb/ ' + ssuuid).set(jsonObject).then(() => {
                                resolve({ success : true }); // 등록 완료    
                            }).catch((error) => {
                                console.error(error);
                                resolve({ success : false, message : 'ERROR : ' + error }); // 등록 실패
                            });
                        }
                    }
                }).catch((e2) => {
                    console.error(e2);
                    resolve({ success : false, message : 'ERROR : ' + e2 }); // 처리 실패    
                });
                */
            } catch(e) {
                console.error(e);
                resolve({ success : false, message : 'ERROR : ' + e }); // 처리 실패
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
        try { this.analytics.logEvent(eventMsg); } catch(e) { console.error(e); }
    }
}

/** ShuttingStarsInterface 대행 객체 */
class ShuttingStarsBroker extends ShuttingStarsInterface {
    /** @type {ShuttingStarsInterface} 원본 객체 */
    #originalInstance = null;

    constructor(originalInstance) {
        this.#originalInstance = originalInstance;
    }

    openGoogleLogin() { return this.#originalInstance.openGoogleLogin(); }
    login(json) { return this.#originalInstance.login(json); }
    checkLogined(userJson) {
        return this.#originalInstance.checkLogined(userJson);
    }
    logout() {
        return this.#originalInstance.logout();
    }
    applyUserInfo() {
        return this.#originalInstance.applyUserInfo();
    }
    deleteAllMyData() {
        return this.#originalInstance.deleteAllMyData();
    }
    createUser(json) {
        return this.#originalInstance.createUser(json);
    }
    listAdditionalSongs() {
        return this.#originalInstance.listAdditionalSongs();
    }
    listRankBoard() {
        return this.#originalInstance.listRankBoard();
    }
    registerRankRecord(json) {
        return this.#originalInstance.registerRankRecord(json);
    }
    listBoardIds() {
        return this.#originalInstance.listBoardIds();
    }
    listPost(boardId) {
        return this.#originalInstance.listPost(boardId);
    }
    writePost(boardId, text) {
        return this.#originalInstance.writePost(boardId, text);
    }
    modifyPost(boardId, postNo, text) {
        return this.#originalInstance.modifyPost(boardId, postNo, text);
    }
    deletePost(boardId, postNo) {
        return this.#originalInstance.deletePost(boardId, postNo);
    }
    getAdditionalContents() {
        return this.#originalInstance.getAdditionalContents();
    }
    requestPushPermission() {
        return this.#originalInstance.requestPushPermission();
    }
    getOuterStorage() {
        return this.#originalInstance.getOuterStorage();
    }
    storeOuterStorage(jsonObject) {
        return this.#originalInstance.storeOuterStorage(jsonObject);
    }
    getRemoteConfigValues() {
        return this.#originalInstance.getRemoteConfigValues();
    }
    perfTraceStart(traceName) { return this.#originalInstance.perfTraceStart(traceName); }
    perfTraceStop(traceObj) { this.#originalInstance.perfTraceStop(traceObj); }
    logEvent(eventMsg) { this.#originalInstance.logEvent(eventMsg); }
}

/** 직접 호출하지 말 것 (shuttingstars.js 에서 호출함) */
function __ssBackEnd() {
    let _ssbackend;
    if(ShuttingStarsUtility.detectFirebaseInitialized()) _ssbackend = new FirebaseHostingImplementation(); // Firebase 사용 가능한 경우 (Firebase 호스팅 환경) 자동 사용
    else _ssbackend = null;
    return _ssbackend;
}

/** 브로커 생성 */
function getSSBackendBroker(originalInstance) {
    return new ShuttingStarsBroker(originalInstance);
}

const SSBackend = __ssBackEnd;
export default SSBackend;
export { SSBackend, getSSBackendBroker, ShuttingStarsInterface, ShuttingStarsBroker };