/** 
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0 
*/
/*
 * Shutting Stars
 *     WebMCP 사용 지원 파일 (AI가 접속했을 때, AI에게 사용법을 알려주는 역할)
 *     참고 : https://developer.chrome.com/docs/ai/webmcp?hl=ko
 */

/** WebMCP 지원 클래스 */
class SSWebMCP {
    #coreInstance = null;
    constructor(coreInst) {
        this.#coreInstance = coreInst;
    }

    /**
     * AI 도구 등록
     */
    async registerTools() {
        await document.modelContext.registerTool({
            name : 'get_state',
            description : `Get the current state code of the game such as, title, menu, song choosing, playing, result, ...
                title : The title screen of the game. Loading basic resources, then the game request "press enter key to continue" to you.
                firstset : Basic setting screen of the game. This screen is shown only once when you first play the game. You can set your language, and graphic quality.
                menu : The main menu of the game. Arrow keys to move, ENTER key to select.
                songchoosing : The song choosing screen of the game. You can choose a song to play. Use Arrow keys to move, ENTER key to select a song (ENTER again to select a difficulty), ESC key to cancel or go back to menu.
                songtitle : Loading screen of the song you choose. Please wait.
                playing : The game is playing now. Using S, D, F, H, J, K keys to play, ESC to pause. (ESC again to stop and go to menu)
                result : The result screen of the game. This screen is shown after you finish playing a song. (ESC to go to menu)
                listenchoosing : The song choosing screen of the game. You can just listen a song without playing.
                listentitle : Loading screen of the song you choose. Please wait.
                listenplaying : The game is playing a song without playing. You can just listen a song. ESC to pause. (ESC again to stop and go to menu)
                fitting : You can adjust some constant settings in this screen, Such as note location, judge timing, .... You can also test these values right now. ENTER key to save, ESC key to cancel and go to menu.
                gameover : Game over. Just wait to see result or go to menu.
                credit : Credit screen. ESC to go to menu.
                recordlist : You can see your playing record list in this screen. ESC to go to menu. 
                recorddet : You can see your playing record detail in this screen. ESC to go to list.
                setting : Setting screen for the game. ESC to go back to menu. This screen is for real person. (If you are AI, it is better to see another WebMCP tool to use this feature.)
                empty : This state shows just background decoration in homepage. The game is not running now.
            `,
            inputSchema : {
                type : 'object',
                properties : {}
            },
            outputSchema : {
                type : 'string'
            },
            execute : () => {
                return this.#coreInstance.state;
            }
        });

        await document.modelContext.registerTool({
            name : 'get_accessibility_logs',
            description : `Get log messages for accessibility. You can see the game screen descriptions by this logs.`,
            inputSchema : {
                type : 'object',
                properties : {}
            },
            outputSchema : {
                type : 'array',
                items : {
                    type : 'string'
                }
            },
            execute : () => {
                const arr = [];
                const accessibilityDiv = this.#coreInstance.accessibilityLayer;
                accessibilityDiv.querySelectorAll('.div_accessibility_log').forEach((div) => {
                    arr.push(div.innerText);
                });

                return arr;
            }
        });

        await document.modelContext.registerTool({
            name : 'describe_screen',
            description : `Just describe the current screen of the game.`,
            inputSchema : {
                type : 'object',
                properties : {}
            },
            outputSchema : {
                type : 'string'
            },
            execute : () => {
                let msg, idx;
                if(this.#coreInstance.state == 'title') {
                    if(this.#coreInstance.titleScreenWaiting) {
                        return 'On title screen. Waiting for user ENTER key input to continue.';
                    } else {
                        return 'On title screen. Loading basic resources. Please wait.';
                    }
                } else if(this.#coreInstance.state == 'firstset') {
                    if(this.#coreInstance.firstSetMode == 'language') {
                        if(this.#coreInstance.language == 'ko') {
                            return 'On first-setting screen, you choosing the language. Current language is Korean. You can choose English or Korean. Use left/right key to change, ENTER key to confirm and go to next.';
                        } else {
                            return 'On first-setting screen, you choosing the language. Current language is English. You can choose English or Korean. Use left/right key to change, ENTER key to confirm and go to next.';
                        }
                    } else if(this.#coreInstance.firstSetMode == 'quality') {
                        if(this.#coreInstance.ressets.h <= 720) {
                            return 'On first-setting screen, you choosing the graphic quality. Current graphic quality is low. You can choose low and medium. Use left/right key to change, ENTER key to confirm and go to next.';
                        } else if(this.#coreInstance.ressets.h <= 1080) {
                            return 'On first-setting screen, you choosing the graphic quality. Current graphic quality is medium. You can choose low and medium. Use left/right key to change, ENTER key to confirm and go to next.';
                        }
                    } else {
                        return 'On first-setting screen, just press ENTER key to go to adjustment screen.';
                    }
                } else if(this.#coreInstance.state == 'fitting') {
                    return 'On adjustment screen. ESC key to go to menu.';
                } else if(this.#coreInstance.state == 'menu') {
                    msg = 'On menu screen.';
                    msg += '\n Menu list is...';

                    for(idx=0; idx<this.#coreInstance.menuListDynamic.length; idx++) {
                        let menuOne = this.#coreInstance.menuListDynamic[idx];
                        if(this.#coreInstance.menuChoosing == menuOne) {
                            msg += '\n ' + (idx+1) + 'th menu (CHOOSING) is ' + menuOne.name + '.';
                        } else {
                            msg += '\n ' + (idx+1) + 'th menu is ' + menuOne.name + '.';
                        }
                    }
                    msg += '\n Arrow up/down key to move, ENTER key to select.';

                    return msg;
                }


                return 'UNKNOWN;'
            }
        });


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
    try {
        const mcpInst = new SSWebMCP(coreInst);
        mcpInst.registerTools();
        return mcpInst;
    } catch(exmcp) {
        console.error(exmcp);
        return null;
    }
    
}

export { SSWebMCP, initSSWebMCP };