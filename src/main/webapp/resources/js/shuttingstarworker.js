/** 
 * 정확한 시간 반복을 위한 Worker 
 *     참고 : https://sirius7.tistory.com/156
 * 
*/
self.onmessage = function(e) {
    const interval = e.data.interval;
    let expectedTime = Date.now() + interval;

    function fTimer() {
        const now = Date.now();
        const drift = now - expectedTime;
        expectedTime += interval;

        self.postMessage({drift, time : now});
        setTimeout(fTimer, Math.max(0, interval - drift));
    }

    setTimeout(fTimer, interval);
}
