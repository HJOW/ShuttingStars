/** 
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0 

 * Shutting Stars
 *     electron 빌드 구동 파일
 * 
 */

const { app, BrowserWindow } = require('electron')

console.log('Electron version: ' + process.versions.electron);

app.whenReady().then(() => {
    function createWindow () {
        const win = new BrowserWindow({
            width: 1280,
            height: 720
        });
    
        win.setFullScreen(true);
        win.loadFile('./web/electron.html');
        return win;
    }

    createWindow();

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    app.on('window-all-closed', () => {
        if(process.platform !== 'darwin') {
            app.quit();
        }
    });
});