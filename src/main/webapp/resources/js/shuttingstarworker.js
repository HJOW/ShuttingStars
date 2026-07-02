/** 
 * 정확한 시간 반복을 위한 Worker 
 *     참고 : https://sirius7.tistory.com/156
 * 
 * Without this file, the game will run fine, but some performance issue will be occred.
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
