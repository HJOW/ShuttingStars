/** 
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0 
*/
/* 
 * Shutting Stars
 *     유튜브에 게시된 저작권 프리 음악에 대한 곡 정보 및 노트 패턴 관리를 위한 객체
 */
/** 유튜브 곡 정보 및 패턴 데이터베이스 객체 */
const SSYoutubeMusicStore = {
    database : {}, // key 는 유튜브 Video ID, 값은 URL (곡 정보가 탑재된 JSON 이 위치한 URL)
    urlCtx : '',
    rsscDirName : 'resources',
    init : async function(urlCtx, rsscDirName) { // 초기화, 이 메소드 내에서 database 를 불러와야 함
        SSYoutubeMusicStore.urlCtx      = urlCtx;
        SSYoutubeMusicStore.rsscDirName = rsscDirName;
        // 같은 경로 상의 database.json 파일을 불러와서 database 를 초기화
        try {
            const response = await fetch(SSYoutubeMusicStore.convertURL('[RSSC]js/youtubestores/database.json'));
            const texts =  await response.text();
            SSYoutubeMusicStore.database = SSUtil.parseJSON(texts); // JSON5 호환
        } catch(e) {
            console.error(e);
        }
    },
    find : async function(url) {
        return await SSYoutubeMusicStore.findByVideoId(SSUtil.getYoutubeVideoId(url));
    },
    findByVideoId : async function(videoId) {
        try {
            if(SSYoutubeMusicStore.database[videoId]) {
                const url = SSYoutubeMusicStore.database[videoId];
                const response = await fetch(url);
                const texts =  await response.text();
                return SSUtil.parseJSON(texts); // JSON5 호환
            }
        } catch(e) {
            console.error(e);
        }
        return null;
    },
    destroy : function() {
        SSYoutubeMusicStore.database = {};
    },
    convertURL(url) {
        url = String(url).trim();
        if(url.indexOf('http://') == 0 || url.indexOf('https://') == 0) return url;
        if(url.indexOf('[RSSC]') == 0) url = SSUtil.replaceString(url, '[RSSC]', '[CTX]' + SSYoutubeMusicStore.rsscDirName + '/');
        if(url.indexOf('[CTX]') == 0) url = SSUtil.replaceString(url, '[CTX]', SSYoutubeMusicStore.urlCtx);
        if(url.indexOf('.//') == 0) url = './' + url.substring(3);
        if(url.indexOf('.') == 0) return url;

        if(SSYoutubeMusicStore.urlCtx.indexOf('/') != SSYoutubeMusicStore.urlCtx.length - 1) SSYoutubeMusicStore.urlCtx += '/';
        if(url.indexOf('//') == 0) url = url.substring(1);
        if(url.indexOf('/') == 0) return SSYoutubeMusicStore.urlCtx + url.substring(1);

        return url;
    }
}

window.SSYoutubeMSStore = SSYoutubeMusicStore;
export { SSYoutubeMusicStore };