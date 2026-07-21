/**
 * 웹 소스 동기화 처리
 *     webpack 처리 완료 후 호출되어야 함
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

const ftpClient = require('basic-ftp');
const fs = require('fs');

/**node 서버 구동 전 추가 동작시킬 커스텀 로직을 이 함수 안에 작성 */
async function ssNodeCustom() {
    
    console.log('Copy files into electron path...');
    await fs.promises.cp('./src/main/webapp/resources', './etc/electron/web/resources', { recursive: true });
    await fs.promises.cp('./src/main/webapp/game.html', './etc/electron/web/game.html');
    console.log('Copy files into electron path... END');
}

ssNodeCustom().catch(console.error);