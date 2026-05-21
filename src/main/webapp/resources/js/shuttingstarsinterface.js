/** 백엔드 서버 / DB 통신 구현 파트, shuttingstars.js 보다 먼저 불러와야 함 */
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
    login(json) {
        return new Promise((resolve, reject) => { resolve(true); })
    }
    listAdditionalSongs() {
        return new Promise((resolve, reject) => { resolve([]); })
    }
    listRankBoard() {
        return new Promise((resolve, reject) => { resolve([]); })
    }
    registerRankRecord(json) {
        return new Promise((resolve, reject) => { resolve(true); })
    }
}

/** Firebase 호스팅 기본제공 API 이용 방식 */
class FirebaseHostingImplementation extends ShuttingStarsInterface {
     
}

/** Servlet 기반 서버와 통신하는 방식 */
class ServletImplementation extends ShuttingStarsInterface {

}

let _tempinterface = null;
if(typeof(firebase) == 'undefined') _tempinterface = new ServletImplementation();
else                                _tempinterface = new FirebaseHostingImplementation();

const _ssbackend = _tempinterface;
_tempinterface = null;