/**
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0
*/
/*
 * Shutting Stars
 *     홈페이지 동작을 구현하는 파일로, index.html 과 같이 동작
 *     게임에는 영향이 없으며 bundle 에 포함되지 않음
 * 
 */

window.addEventListener('load', async function() {
    const homepageRoot = document.getElementById('ss_homepage_root');

    const backgroundDiv = homepageRoot.querySelector('.ss_homepage_back');
    const homepageDiv   = homepageRoot.querySelector('.ss_homepage_main');

    const topbar = homepageDiv.querySelector('.ss_topbar');
    const profileDiv = topbar.querySelector('.ss_topbar_user_profile');
    const menuRoot = homepageDiv.querySelector('.pure-menu-list');
    const contentDiv = homepageDiv.querySelector('.ss_content');

    const iframeMain = homepageDiv.querySelector('.iframe_ss');
    const btnStart   = homepageDiv.querySelector('.btn_ss_gamestart');
    const btnLogin   = profileDiv.querySelector('.btn_login');
    const btnLogout  = profileDiv.querySelector('.btn_logout');
    const spanEmail = profileDiv.querySelector('.ss_user_profile_email');

    let brk = null;

    // 게임 엔진 로딩 초반 타이밍 이벤트
    ShuttingStars.setBeforeInitializeHook(function(broker) {
        broker.setEmpty();
        // 캔버스 크기 이벤트 미리 주기
        broker.fCanvasResized = function(obj) {
            const canvasSize = obj.canvas;
            contentDiv.style.width  = canvasSize.width + 'px';
            contentDiv.style.height = canvasSize.height + 'px';
        }

        brk = broker;
    });

    // 게임 엔진 초기화 막바지 타이밍
    ShuttingStars.init(backgroundDiv, './', async function(broker) {
        broker.setEmpty();
        broker.apply({
            showGameTitle : true
        });

        // 번역
        homepageRoot.querySelectorAll('.target_translate').forEach((itemOne) => {
            if(itemOne.classList.contains('target_translated')) return;
            // 내용 번역
            itemOne.innerHTML = broker.translate(itemOne.innerHTML);
            // title 속성이 있는 경우 title 속성도 번역
            if(typeof(itemOne.title) != 'undefined' && itemOne.title != null && itemOne.title.length > 0) {
                itemOne.title = broker.translate(itemOne.title);
            }

            // 번역했음을 표시
            itemOne.classList.add('target_translated');
            itemOne.setAttribute('lang', broker.language);
        });

        brk = broker;

        // 홈 버튼 이벤트
        const fHome = function() {
            iframeMain.classList.add('invisible');
            btnStart.classList.remove('invisible');
            if(brk != null) {
                brk.apply({
                    showGameTitle : true
                });
            }

            menuRoot.querySelectorAll('.pure-menu-item').forEach(function(item) {
                item.classList.remove('pure-menu-selected');
            });
            menuRoot.querySelector('.li_ss_home').classList.add('pure-menu-selected');
        }

        // 시작 버튼 이벤트
        const fStart = function() {
            let width  = 1280;
            let height = 720;

            // 기기 화면 방향 및 크기에 따라 창 크기 조정 (16:9, 9:16 모두 지원)
            if(window.innerHeight < window.innerWidth) {
                if(window.innerHeight < height) {
                    height = window.innerHeight;
                }

                if(window.screen) {
                    height = window.screen.height - 30;
                }

                width = Math.floor(height * 16 / 9);
            } else {
                if(window.innerWidth < width) {
                    width = window.innerWidth;
                }

                if(window.screen) {
                    width = window.screen.width - 10;
                }

                height = Math.floor(width * 9 / 16);
            }

            window.open('game.html', 'shuttingstars_game', 'width=' + width + ',height=' + height + ',menubar=no,location=yes,resizable=yes,scrollbars=no,status=no,toolbar=no');
            fHome();

            // 시작 버튼에 포커스
            setTimeout(() => {
                btnStart.focus();
            }, 1000);
        };

        // 버튼 및 링크 이벤트 부여
        homepageDiv.querySelector('.a_ss_home').addEventListener('click', fHome);
        homepageDiv.querySelector('.pure-menu-heading').addEventListener('click', fHome);
        homepageDiv.querySelector('.a_ss_gamestart').addEventListener('click', fStart);
        btnStart.addEventListener('click', fStart);
        btnLogin.addEventListener('click', async function() {
            if(brk != null) {
                const backends = brk.getBackendBroker();
                const res = await backends.openGoogleLogin();
                if(res.success) {
                    if(res.userJson) {
                        // 새로고침
                        location.reload();
                    }
                }
            }
        });
        btnLogout.addEventListener('click', async function() {
            if(brk != null) {
                const backends = brk.getBackendBroker();
                backends.logout().then(() => {
                    // 새로고침
                    location.reload();
                });
            }
        });
        

        homepageDiv.querySelector('.a_ss_board').addEventListener('click', function() {
            iframeMain.src = './community/board.html';
            iframeMain.classList.remove('invisible');

            menuRoot.querySelectorAll('.pure-menu-item').forEach(function(item) {
                item.classList.remove('pure-menu-selected');
            });
            menuRoot.querySelector('.li_ss_board').classList.add('pure-menu-selected');
            btnStart.classList.add('invisible');
        });

        homepageDiv.querySelector('.a_ss_songs').addEventListener('click', function() {
            iframeMain.src = './community/opensongs.html';
            iframeMain.classList.remove('invisible');

            menuRoot.querySelectorAll('.pure-menu-item').forEach(function(item) {
                item.classList.remove('pure-menu-selected');
            });
            menuRoot.querySelector('.li_ss_songs').classList.add('pure-menu-selected');
            btnStart.classList.add('invisible');
        });

        homepageDiv.querySelector('.a_ss_github').addEventListener('click', function() {
            fHome();
            window.open('https://github.com/HJOW/ShuttingStars', '_blank');
        });

        homepageDiv.querySelector('.a_ss_createmode').addEventListener('click', function() {
            fHome();
            window.open('./create/create.html', '_blank');
        });

        homepageDiv.querySelector('.a_ss_deleteacc').addEventListener('click', function() {
            fHome();
            window.open('./exit.html', '_blank');
        });

        // 창 크기 변경 이벤트
        const fResize = function() {
            iframeMain.style.height = (window.innerHeight - topbar.offsetHeight - 20) + 'px';
            iframeMain.style.border = '0px';
            iframeMain.style.background = 'transparent';
        }
        fResize();

        // 백엔드 필요 메뉴 제거 // backend_needed
        homepageRoot.querySelectorAll('.backend_needed').forEach(function(item) {
            item.classList.add('invisible');
        });
        homepageRoot.querySelectorAll('.login_needed').forEach(function(item) {
            item.classList.add('invisible');
        });
        homepageRoot.querySelectorAll('.login_no').forEach(function(item) {
            item.classList.add('invisible');
        });
        let logined = false;
        let userNick = '';
        if(brk != null) {
            const backends = brk.getBackendBroker();
            if(backends != null) {
                let res = await backends.checkLogined();
                if(res.success) logined = res.loginAvail;
                else logined = false;

                if(logined) userNick = res.userJson.email;
                spanEmail.innerHTML = SSUtil.purifyHTML(userNick);

                homepageRoot.querySelectorAll('.backend_needed').forEach(function(item) {
                    item.classList.remove('invisible');
                });
            }
        }
        if(logined) {
            homepageRoot.querySelectorAll('.login_needed').forEach(function(item) {
                item.classList.remove('invisible');
            });
        } else {
            homepageRoot.querySelectorAll('.login_no').forEach(function(item) {
                item.classList.remove('invisible');
            });
        }

        // 첫 메뉴 선택 처리
        menuRoot.querySelector('.li_ss_home').classList.add('pure-menu-selected');
    }).then(function() {
        // 게임 엔진 초기화 완료 후

        
    }); 
});