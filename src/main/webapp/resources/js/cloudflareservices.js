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
 * 참고 (테스트용) : https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 * 참고 (서버인증) : https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
*/

class SSCloudFlareBroker {
    siteKey = '1x00000000000000000000AA'; // Site Key (1x00000000000000000000AA 는 테스트 키로 항상 통과합니다. 실제 발급받은 Sitekey 를 넣어 주세요.)

    appendWidget(querySelector, configs) {
        const selfs = this;

        if(typeof(turnstile) == 'undefined') throw 'There is no cloudflare API url.';
        if(typeof(querySelector) == 'undefined' || querySelector == null) querySelector = document.body;

        let callOptions = {};
        callOptions.sitekey = this.siteKey;

        for(let key in configs) {
            callOptions[key] = configs[key];
        }

        if(typeof(callOptions.callback) != 'function') callOptions.callback = function(token) {}

        const widgetId = turnstile.render(querySelector, callOptions);
        return widgetId;
    }

    reset(widgetId) {
        if(typeof(turnstile) == 'undefined') throw 'There is no cloudflare API url.';
        turnstile.reset(widgetId);
    }

    remove(widgetId) {
        if(typeof(turnstile) == 'undefined') throw 'There is no cloudflare API url.';
        turnstile.remove(widgetId);
    }

    getResponse(widgetId) {
        if(typeof(turnstile) == 'undefined') throw 'There is no cloudflare API url.';
        return turnstile.getResponse(widgetId);
    }

    isExpired(widgetId) {
        if(typeof(turnstile) == 'undefined') throw 'There is no cloudflare API url.';
        return turnstile.isExpired(widgetId);
    }

    execute(querySelector) {
        if(typeof(turnstile) == 'undefined') throw 'There is no cloudflare API url.';
        turnstile.execute(querySelector);
    }

    async verify(token, remoteIp, secretKey) {
        try {
            const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    secret: secretKey,
                    response: token,
                    remoteip: remoteIp,
                })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Turnstile validation error:", error);
            return { success: false, "error-codes": ["internal-error"] };
        }
    }
}

window.SSCloudFlare = new SSCloudFlareBroker();