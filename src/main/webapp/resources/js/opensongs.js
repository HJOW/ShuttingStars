/**
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0
*/
/*
 * Shutting Stars
 *     오픈소스 곡 목록을 불러옴
 *     opensongs.html 과 같이 동작
 *     게임에는 영향이 없으며 bundle 에 포함되지 않음
 * 
 */

window.addEventListener('load', function() {
    // 브라우저 언어를 감지해 한국어/영어 중 표시 언어를 결정한다.
    function detectLocale() {
        const language = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        return language.indexOf('ko') === 0 ? 'ko' : 'en';
    }

    // 언어별 UI 문자열 사전
    const i18n = {
        en: {
            pageTitle: 'Open Songs',
            pageDesc: 'List of open-license songs included in Shutting Stars',
            licenseNote: 'Allowed for general and commercial use, but you may not claim ownership.',
            loading: 'Loading...',
            searchPlaceholder: 'Search songs',
            songCount: function(count) { return 'Total ' + count + ' songs'; },
            noSongs: 'No songs to display.',
            colTitle: 'Title',
            colComposer: 'Composer',
            colBpm: 'BPM',
            colDownload: 'Download',
            colPlay: 'Play',
            noValue: '-',
            noTitle: '(Untitled)',
            download: 'Download',
            play: 'Play',
            nowPlaying: 'Now playing',
            loadError: 'An error occurred while loading the list. '
        },
        ko: {
            pageTitle: 'Open Songs',
            licenseNote: '일반 및 상업 목적으로 사용이 허용되지만, 소유권을 주장하실 수는 없습니다.',
            pageDesc: 'Shutting Stars에 수록된 오픈 라이선스 곡 목록',
            loading: '로딩 중...',
            searchPlaceholder: '곡 검색',
            songCount: function(count) { return '총 ' + count + '곡'; },
            noSongs: '표시할 곡이 없습니다.',
            colTitle: '음악 제목',
            colComposer: '작곡가',
            colBpm: 'BPM',
            colDownload: '다운로드',
            colPlay: '재생',
            noValue: '-',
            noTitle: '(제목 없음)',
            download: '다운로드',
            play: '재생',
            nowPlaying: '재생 중',
            loadError: '목록을 불러오는 중 오류가 발생했습니다. '
        }
    };

    // 선택된 언어 문자열을 화면 요소에 반영한다.
    function applyStaticTexts(t) {
        const titleRoot = document.getElementById('pageTitle');
        const descRoot = document.getElementById('pageDesc');
        const licenseNoteRoot = document.getElementById('licenseNote');
        const countRoot = document.getElementById('songCount');
        const searchRoot = document.getElementById('songSearch');
        const emptyRoot = document.getElementById('songEmpty');
        const colTitleRoot = document.getElementById('colTitle');
        const colComposerRoot = document.getElementById('colComposer');
        const colBpmRoot = document.getElementById('colBpm');
        const colDownloadRoot = document.getElementById('colDownload');
        const colPlayRoot = document.getElementById('colPlay');

        if (titleRoot) titleRoot.textContent = t.pageTitle;
        if (descRoot) descRoot.textContent = t.pageDesc;
        if (licenseNoteRoot) licenseNoteRoot.textContent = t.licenseNote;
        if (countRoot) countRoot.textContent = t.loading;
        if (searchRoot) {
            searchRoot.placeholder = t.searchPlaceholder;
            searchRoot.setAttribute('aria-label', t.searchPlaceholder);
        }
        if (emptyRoot) emptyRoot.textContent = t.noSongs;
        if (colTitleRoot) colTitleRoot.textContent = t.colTitle;
        if (colComposerRoot) colComposerRoot.textContent = t.colComposer;
        if (colBpmRoot) colBpmRoot.textContent = t.colBpm;
        if (colDownloadRoot) colDownloadRoot.textContent = t.colDownload;
        if (colPlayRoot) colPlayRoot.textContent = t.colPlay;
    }

    const locale = detectLocale();
    const t = i18n[locale] || i18n.en;
    applyStaticTexts(t);

    // 이미 불러온 곡 행만 검색어에 따라 표시한다.
    function filterSongRows() {
        const rowsRoot = document.getElementById('songRows');
        const searchRoot = document.getElementById('songSearch');
        const emptyRoot = document.getElementById('songEmpty');
        if (!rowsRoot || !searchRoot || !emptyRoot) return;

        const keyword = searchRoot.value.trim().toLowerCase();
        let visibleCount = 0;
        Array.prototype.forEach.call(rowsRoot.querySelectorAll('tr'), function(row) {
            const matches = row.textContent.toLowerCase().indexOf(keyword) >= 0;
            row.style.display = matches ? '' : 'none';
            if (matches) visibleCount += 1;
        });
        emptyRoot.style.display = visibleCount > 0 ? 'none' : 'block';
    }

    const searchRoot = document.getElementById('songSearch');
    if (searchRoot) searchRoot.addEventListener('input', filterSongRows);

    let activePlayerDock = null;

    // 플레이어 컨트롤 제거
    function removeActivePlayer() {
        if (activePlayerDock && activePlayerDock.parentNode) {
            const activeAudio = activePlayerDock.querySelector('audio');
            if (activeAudio) {
            activeAudio.pause();
            activeAudio.removeAttribute('src');
            activeAudio.load();
            }
            activePlayerDock.parentNode.removeChild(activePlayerDock);
        }
        activePlayerDock = null;
    }

    // Audio 재생 (컨트롤러 노출)
    function playSongAudio(title, audioUrl) {
        if (!audioUrl) return;

        removeActivePlayer();

        const dock = document.createElement('div');
        dock.className = 'song-player-dock';

        const panel = document.createElement('div');
        panel.className = 'song-player-panel';

        const titleRoot = document.createElement('div');
        titleRoot.className = 'song-player-title';
        titleRoot.textContent = t.nowPlaying + ': ' + title;

        const audio = document.createElement('audio');
        audio.controls = true;
        audio.loop = true;
        audio.autoplay = true;
        audio.src = audioUrl;

        panel.appendChild(titleRoot);
        panel.appendChild(audio);
        dock.appendChild(panel);
        document.body.appendChild(dock);

        activePlayerDock = dock;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function() {});
        }
    }

    const urlCtx = '../'; // (URL Context 여기서 참고 !)
    ShuttingStars.setBeforeInitializeHook(function(broker) {
        broker.apply({
            initializingDelayTime : 500
        });
    });

    // 곡 목록 불러오기
    ShuttingStars.getAllSongPromise(urlCtx, function(songOne) {
        if(! songOne.official  ) return false;
        if(! songOne.opensource) return false;
        return true;
    }).then(function(songs) {
        const rowsRoot = document.getElementById('songRows');
        const countRoot = document.getElementById('songCount');
        const searchRoot = document.getElementById('songSearch');
        const emptyRoot = document.getElementById('songEmpty');
        if (!rowsRoot || !countRoot || !emptyRoot) return;

        rowsRoot.innerHTML = '';
        emptyRoot.style.display = 'none';

        const songList = Array.isArray(songs) ? songs : [];
        countRoot.textContent = t.songCount(songList.length);
        if (searchRoot) searchRoot.style.display = '';

        if (songList.length <= 0) {
            emptyRoot.style.display = 'block';
            return;
        }

        // 주석의 [RSSC] 토큰을 실제 resources 상대 경로로 치환한다.
        function resolveUrl(url) {
            if (!url || typeof url !== 'string') return '';
            url = url.replace('[RSSC]', urlCtx + 'resources/');
            url = url.replace('[CTX]', urlCtx);
            return url;
        }

        // 값이 비어 있을 때 대체 텍스트를 넣어 테이블 셀을 생성한다.
        function cellText(value, fallbackText, fallbackClassName) {
            const td = document.createElement('td');
            if (value === undefined || value === null || value === '') {
                td.textContent = fallbackText;
                td.className = fallbackClassName;
            } else {
                td.textContent = String(value);
            }
            return td;
        }

        // 곡 목록 출력
        songList.forEach(function(song) {
            const tr = document.createElement('tr');
            const title = song && song.name ? song.name : t.noTitle;
            const composer = song && song.composer ? song.composer : '';
            const bpm = song && song.bpm !== undefined && song.bpm !== null ? song.bpm : '';

            tr.appendChild(cellText(title, t.noTitle, ''));
            tr.appendChild(cellText(composer, t.noValue, 'song-composer-empty'));
            tr.appendChild(cellText(bpm, t.noValue, 'song-bpm-empty'));

            const downloadTd = document.createElement('td');
            const downloadUrl = resolveUrl(song && (song.musicUrl || song.musicAlterUrl));
            if (downloadUrl) {
                const a = document.createElement('a');
                a.className = 'song-download-link';
                a.href = downloadUrl;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.textContent = t.download;
                downloadTd.appendChild(a);
            } else {
                downloadTd.className = 'song-download-empty';
                downloadTd.textContent = t.noValue;
            }
            tr.appendChild(downloadTd);

            const playTd = document.createElement('td');
            if (downloadUrl) {
                const playButton = document.createElement('button');
                playButton.className = 'song-play-button';
                playButton.type = 'button';
                playButton.textContent = t.play;
                playButton.addEventListener('click', function() {
                    playSongAudio(title, downloadUrl);
                });
                playTd.appendChild(playButton);
            } else {
                playTd.className = 'song-play-empty';
                playTd.textContent = t.noValue;
            }
            tr.appendChild(playTd);

            rowsRoot.appendChild(tr);
        });

        filterSongRows();

        // console.log(rowsRoot.innerHTML)
    }).catch(function(error) {
        const errorRoot = document.getElementById('loadError');
        if (errorRoot) {
            errorRoot.textContent = t.loadError + (error && error.message ? error.message : '');
            errorRoot.style.display = 'block';
        }
    });
});