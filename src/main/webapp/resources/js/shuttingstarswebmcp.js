/** 
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0 
*/
/*
 * Shutting Stars
 *     WebMCP 사용 지원 파일
 * 
 */

class SSWebMCP {
    #coreInstance = null;
    constructor(coreInst) {
        this.#coreInstance = coreInst;
    }
}

/**
 * WebMCP 초기화
 *    
 * @returns {SSWebMCP | null} WebMCP 관리 객체, 단 웹 브라우저가 WebMCP 미지원 시 null 가 반환됨
 */
function initSSWebMCP(coreInst) {
    if(!coreInst) throw new Error('SSWebMCP.initSSWebMCP() : coreInst is null or undefined.');
    // WebMCP 지원 여부 확인
    if(typeof(document.modelContext             ) == 'undefined' || document.modelContext              == null) return null;
    if(typeof(document.modelContext.registerTool) == 'undefined' || document.modelContext.registerTool == null) return null;
    return new SSWebMCP(coreInst);
}

export { SSWebMCP, initSSWebMCP };