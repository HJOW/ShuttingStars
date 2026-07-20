/** 
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0 
 * 
 * Cloudflare 서비스를 사용하기 위한 중간 JS
 *     위 라이센스는 이 js 파일에 한정되며, 
 *     Cloudflare 제공 js URL은 Cloudflare 의 라이센스를 따름.
 * 
 * 이 파일 이용을 위해서는 html 내 head 태그 안쪽에 다음 두 줄이 들어가야 함.
 * 
 *     <script type="text/javascript" src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
 *     <link rel="preconnect" href="https://challenges.cloudflare.com" />
 * 참고 : https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
*/

class SSCloudFlareBroker {
    siteKey = ''; // Site Key

    appendWidget(querySelector, configs) {
        const selfs = this;

        if(typeof(turnstile) == 'undefined') throw 'There is no cloudflare API url.';
        const widgetId = turnstile.render(querySelector, {
            sitekey : selfs.siteKey,
            callback : function(token) {
                console.log(token);
            }
        });
        return widgetId;
    }

    reset(widgetId) {
        if(typeof(turnstile) == 'undefined') throw 'There is no cloudflare API url.';
        turnstile.reset(widgetId);
    }

    getResponse(widgetId) {
        if(typeof(turnstile) == 'undefined') throw 'There is no cloudflare API url.';
        return turnstile.getResponse(widgetId);
    }

    remove(widgetId) {
        if(typeof(turnstile) == 'undefined') throw 'There is no cloudflare API url.';
        turnstile.remove(widgetId);
    }
}

window.SSCloudFlare = new SSCloudFlareBroker();