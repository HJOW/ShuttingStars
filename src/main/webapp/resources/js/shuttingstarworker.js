/** 
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0 
*/
/*
 * 정확한 시간 반복을 위한 Worker 
 *     참고 : https://sirius7.tistory.com/156
 * 
 * Without this file, the game will run fine, but some performance issue will be occred.
*/
self.onmessage = function(e) {
    let interval = e.data.interval;
    if(typeof(interval) == 'string') interval = parseInt(interval);
    else interval = Math.floor(interval);

    let expectedTime = Date.now() + interval;

    function fTimer() {
        const now = Date.now();
        let drift = now - expectedTime;
        let futureTime = interval - drift;

        let loops = 0;
        while(futureTime < 0) { futureTime += interval; loops++; }

        expectedTime += interval * (loops + 1);

        self.postMessage({drift, time : now});
        setTimeout(fTimer, Math.max(0, futureTime));
    }

    setTimeout(fTimer, interval);
}
