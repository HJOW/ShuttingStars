/** 백엔드 서버 / DB 통신 구현 파트, shuttingstars.js 보다 먼저 불러와야 함 */

/** 중간 인터페이스 구현 */
class ShuttingStarsInterface {
    
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