/*
크롬 확장 프로그램 화면

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

let gameInstance;
let canvasInstance;
window.addEventListener('load', function(){
    // shuttingstar_canvas_root 영역에 게임 화면 배치
    const root = document.getElementById('shuttingstar_canvas_root');
    ShuttingStars.setBeforeInitializeHook(function(broker) {
        broker.apply({
            fOuterWidth  : function() { return window.innerWidth; },
            fOuterHeight : function() { return window.innerHeight; },
            chromeExtensionMode : true
        });
    });
    // 게임 초기화 및 동작 시작
    ShuttingStars.init(root, './', function(broker) {
        // Nothing here
    }).then(() => {
        // 로딩화면 숨기기
        document.getElementById('shuttingstars_init_loading').style.display = 'none';
    });
});