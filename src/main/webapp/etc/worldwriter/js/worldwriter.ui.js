/**
 * worldwriter.ui.js
 *
 * WorldWriter 의 화면 구현부.
 * html / css 파일에 의존하지 않고, 필요한 style 태그와 모든 요소를 여기서 동적으로 만든다.
 *
 * 화면 구성
 *   1. 로그인   : 사용자명(닉네임) 입력
 *   2. 초기화면 : 프로젝트 목록 + 프로젝트 생성 + 설정
 *   3. 작업화면 : 상단 툴바 + 좌측 사이드바(1~4단계) + 중앙 메인 영역
 */

import {
    WorldWriter, Env, Storage, Settings, Projects, Books, AI, Pipeline,
    PROVIDERS, ITEM_KINDS, KIND_LABELS
} from './worldwriter.core.js';

/* ------------------------------------------------------------------ *
 *  다국어 문자열
 * ------------------------------------------------------------------ */

const I18N = {
    ko: {
        'app.title': 'WorldWriter',
        'app.tagline': '판타지 소설 자동 집필 도구',

        'common.ok': '확인',
        'common.cancel': '취소',
        'common.save': '저장',
        'common.saved': '저장했습니다.',
        'common.delete': '삭제',
        'common.close': '닫기',
        'common.generate': '생성',
        'common.regenerate': '다시 생성',
        'common.edit': '편집',
        'common.error': '오류',
        'common.working': '처리 중입니다...',
        'common.export': '내보내기',
        'common.name': '이름',
        'common.summary': '한 줄 요약',
        'common.detail': '상세 설명',
        'common.chars': '자',

        'login.name': '사용자명 (닉네임)',
        'login.placeholder': '예) 홍길동',
        'login.start': '시작하기',
        'login.needName': '사용자명을 입력해 주세요.',

        'home.projects': '프로젝트 목록',
        'home.new': '프로젝트 생성',
        'home.settings': '설정',
        'home.empty': '아직 만들어진 프로젝트가 없습니다. "프로젝트 생성" 으로 시작해 보세요.',
        'home.open': '열기',
        'home.rename': '이름 변경',
        'home.newTitle': '프로젝트 생성',
        'home.newLabel': '프로젝트 이름',
        'home.deleteConfirm': '프로젝트 "{0}" 을(를) 삭제할까요? 생성된 책 내용도 함께 지워집니다.',
        'home.logout': '사용자 변경',
        'home.storageLocal': '저장 위치: 브라우저 (localStorage, 압축 저장)',
        'home.storageServer': '저장 위치: 서버 파일 ({0})',
        'home.usage': '사용 중인 저장 공간: 약 {0}',

        'settings.title': '설정',
        'settings.provider': 'AI 공급자',
        'settings.apiKey': 'API 키',
        'settings.apiKeyNone': 'LM Studio 는 API 키가 필요하지 않습니다. (필요한 경우에만 입력)',
        'settings.model': '모델명',
        'settings.modelHint': '비워두면 기본값 "{0}" 을(를) 사용합니다.',
        'settings.lmUrl': 'LM Studio 서버 주소',
        'settings.language': '기본 언어',
        'settings.darkMode': '어두운 화면(다크 모드) 사용',
        'settings.test': '연결 확인',
        'settings.testing': '확인 중...',
        'settings.testOk': '연결에 성공했습니다. 응답: {0}',

        'toolbar.home': '초기화면',
        'toolbar.settings': '설정',

        'step.1': '1. 소설 설명',
        'step.2': '2. 인물 / 지역 / 사건',
        'step.3': '3. 사건 흐름',
        'step.4': '4. 책 생성',
        'step.locked': '앞 단계를 먼저 완료해 주세요.',

        'step1.title': '만들려는 소설에 대한 설명',
        'step1.guide': '여기에 적은 내용은 소설에 반드시 반영됩니다. 적지 않은 부분은 AI가 알아서 창작합니다.',
        'step1.placeholder': '예) 마법이 사라져가는 대륙에서, 마지막 정령사가 된 소녀가 잊힌 신들의 유적을 찾아 떠나는 이야기. 주인공은 겁이 많지만 고집이 세다. ...',
        'step1.generate': '2단계 내용 생성',
        'step1.confirmRegen': '이미 만들어진 2단계 이후 내용이 지워지고 새로 만들어집니다. 계속할까요?',
        'step1.done': '2단계 내용을 생성했습니다.',
        'step1.needDescription': '소설에 대한 설명을 먼저 입력해 주세요.',

        'step2.title': '등장인물 / 지역 / 주요 사건',
        'step2.guide': '항목을 눌러 상세 설명을 직접 작성하거나, AI로 자동 생성할 수 있습니다.',
        'step2.detailBtn': 'AI로 상세 설명 생성',
        'step2.detailPlaceholder': '상세 설명을 직접 작성할 수 있습니다.',
        'step2.empty': '아직 생성된 항목이 없습니다. 1단계에서 먼저 생성해 주세요.',
        'step2.hasDetail': '상세 작성됨',
        'step2.noDetail': '상세 미작성',
        'step2.progress': '상세 설명 {0} / {1} 항목 작성 완료',
        'step2.next': '3단계로 이동',
        'step2.prev': '1단계로 돌아가기',
        'step2.detailAll': '비어 있는 상세 설명 모두 생성',

        'step3.title': '사건 흐름',
        'step3.guide': '항목을 끌어서 순서를 바꾸거나 삭제할 수 있습니다.',
        'step3.generate': '사건 흐름 생성',
        'step3.empty': '아직 사건 흐름이 없습니다. "사건 흐름 생성" 을 눌러 주세요.',
        'step3.confirmRegen': '기존 사건 흐름이 지워지고 새로 만들어집니다. 계속할까요?',
        'step3.main': '주요',
        'step3.count': '사건 {0}개',
        'step3.next': '4단계로 이동',
        'step3.prev': '2단계로 돌아가기',
        'step3.deleteConfirm': '이 사건을 목록에서 지울까요?',
        'step3.hasBooks': '이미 생성된 책이 있어 사건 흐름을 바꾸면 이후 권의 내용과 어긋날 수 있습니다.',

        'step4.title': '책 생성',
        'step4.targetVolumes': '목표 권수',
        'step4.targetGuide': '전체 사건 흐름을 몇 권으로 나눌지 정합니다. 한 권은 약 10만 ~ 15만 자를 목표로 합니다.',
        'step4.setTarget': '목표 권수 설정',
        'step4.newBook': '새 책 생성',
        'step4.empty': '아직 생성된 책이 없습니다.',
        'step4.bookInfo': '{0}장 / 약 {1}자',
        'step4.deleteLast': '마지막 책 삭제',
        'step4.deleteConfirm': '"{0}" 을(를) 삭제할까요? 되돌릴 수 없습니다.',
        'step4.deleteOnlyLast': '맨 끝에 있는 책부터 삭제할 수 있습니다.',
        'step4.chapter': '장 선택',
        'step4.reviseAi': 'AI에게 수정 요청',
        'step4.reviseTitle': 'AI 수정 요청',
        'step4.revisePlaceholder': '예) 전투 장면을 더 긴박하게 묘사하고, 주인공의 두려움을 드러내 주세요.',
        'step4.reviseDone': '수정된 내용을 반영했습니다.',
        'step4.generating': '{0} / {1} : {2}',
        'step4.generatingTitle': '책 생성 중',
        'step4.cancel': '중단',
        'step4.cancelling': '현재 장을 마친 뒤 중단합니다...',
        'step4.done': '{0} 생성이 끝났습니다.',
        'step4.allDone': '목표 권수({0}권)만큼 모두 생성했습니다.',
        'step4.needTarget': '먼저 목표 권수를 1 이상의 숫자로 입력해 주세요.',
        'step4.selectBook': '위 목록에서 책을 선택하면 내용을 보거나 수정할 수 있습니다.',
        'step4.volumeOf': '{0}권',
        'step4.exportBook': '이 책 내보내기'
    },
    en: {
        'app.title': 'WorldWriter',
        'app.tagline': 'Fantasy novel writing assistant',

        'common.ok': 'OK',
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.saved': 'Saved.',
        'common.delete': 'Delete',
        'common.close': 'Close',
        'common.generate': 'Generate',
        'common.regenerate': 'Regenerate',
        'common.edit': 'Edit',
        'common.error': 'Error',
        'common.working': 'Working...',
        'common.export': 'Export',
        'common.name': 'Name',
        'common.summary': 'Summary',
        'common.detail': 'Details',
        'common.chars': 'chars',

        'login.name': 'User name (nickname)',
        'login.placeholder': 'e.g. John',
        'login.start': 'Start',
        'login.needName': 'Please enter a user name.',

        'home.projects': 'Projects',
        'home.new': 'New project',
        'home.settings': 'Settings',
        'home.empty': 'No projects yet. Create one to get started.',
        'home.open': 'Open',
        'home.rename': 'Rename',
        'home.newTitle': 'New project',
        'home.newLabel': 'Project name',
        'home.deleteConfirm': 'Delete project "{0}"? Generated books will be removed too.',
        'home.logout': 'Switch user',
        'home.storageLocal': 'Storage: browser localStorage (compressed)',
        'home.storageServer': 'Storage: server files ({0})',
        'home.usage': 'Storage in use: about {0}',

        'settings.title': 'Settings',
        'settings.provider': 'AI provider',
        'settings.apiKey': 'API key',
        'settings.apiKeyNone': 'LM Studio does not require an API key.',
        'settings.model': 'Model name',
        'settings.modelHint': 'Leave empty to use the default "{0}".',
        'settings.lmUrl': 'LM Studio server address',
        'settings.language': 'Default language',
        'settings.darkMode': 'Use dark mode',
        'settings.test': 'Test connection',
        'settings.testing': 'Testing...',
        'settings.testOk': 'Connection succeeded. Response: {0}',

        'toolbar.home': 'Home',
        'toolbar.settings': 'Settings',

        'step.1': '1. Description',
        'step.2': '2. Cast / Places / Events',
        'step.3': '3. Event flow',
        'step.4': '4. Books',
        'step.locked': 'Finish the previous step first.',

        'step1.title': 'Describe the novel you want',
        'step1.guide': 'Whatever you write here must appear in the novel. The rest is invented by the AI.',
        'step1.placeholder': 'e.g. On a continent where magic is fading, the last spirit caller sets out to find the ruins of forgotten gods...',
        'step1.generate': 'Generate step 2',
        'step1.confirmRegen': 'Existing step 2+ content will be replaced. Continue?',
        'step1.done': 'Step 2 content generated.',
        'step1.needDescription': 'Please describe the novel first.',

        'step2.title': 'Characters / Places / Events',
        'step2.guide': 'Open an item to write details yourself, or let the AI generate them.',
        'step2.detailBtn': 'Generate details with AI',
        'step2.detailPlaceholder': 'You can write the details yourself.',
        'step2.empty': 'Nothing generated yet. Run step 1 first.',
        'step2.hasDetail': 'detailed',
        'step2.noDetail': 'no details',
        'step2.progress': 'Details written for {0} of {1} items',
        'step2.next': 'Go to step 3',
        'step2.prev': 'Back to step 1',
        'step2.detailAll': 'Generate all missing details',

        'step3.title': 'Event flow',
        'step3.guide': 'Drag items to reorder, or delete them.',
        'step3.generate': 'Generate event flow',
        'step3.empty': 'No event flow yet. Press "Generate event flow".',
        'step3.confirmRegen': 'The existing flow will be replaced. Continue?',
        'step3.main': 'main',
        'step3.count': '{0} events',
        'step3.next': 'Go to step 4',
        'step3.prev': 'Back to step 2',
        'step3.deleteConfirm': 'Remove this event from the list?',
        'step3.hasBooks': 'Books already exist; changing the flow may conflict with later volumes.',

        'step4.title': 'Books',
        'step4.targetVolumes': 'Target volumes',
        'step4.targetGuide': 'How many volumes to split the event flow into. Each volume targets 100k-150k characters.',
        'step4.setTarget': 'Set target volumes',
        'step4.newBook': 'Create next book',
        'step4.empty': 'No books yet.',
        'step4.bookInfo': '{0} chapters / about {1} chars',
        'step4.deleteLast': 'Delete last book',
        'step4.deleteConfirm': 'Delete "{0}"? This cannot be undone.',
        'step4.deleteOnlyLast': 'Only the last book can be deleted.',
        'step4.chapter': 'Chapter',
        'step4.reviseAi': 'Ask AI to revise',
        'step4.reviseTitle': 'AI revision request',
        'step4.revisePlaceholder': 'e.g. Make the battle scene more tense and show the hero’s fear.',
        'step4.reviseDone': 'The revision has been applied.',
        'step4.generating': '{0} / {1} : {2}',
        'step4.generatingTitle': 'Writing the book',
        'step4.cancel': 'Stop',
        'step4.cancelling': 'Stopping after the current chapter...',
        'step4.done': '{0} finished.',
        'step4.allDone': 'All {0} volumes have been generated.',
        'step4.needTarget': 'Enter a target volume count of 1 or more.',
        'step4.selectBook': 'Pick a book above to read or edit it.',
        'step4.volumeOf': 'Volume {0}',
        'step4.exportBook': 'Export this book'
    }
};

/** 다국어 문자열 조회. {0}, {1} 자리에 인자를 채운다. */
function t(key) {
    const lang = (Settings.current && Settings.current.language) || state.language || 'ko';
    const table = I18N[lang] || I18N.ko;
    let text = table[key];
    if (text === undefined) text = I18N.ko[key];
    if (text === undefined) return key;
    for (let i = 1; i < arguments.length; i++) {
        text = text.split('{' + (i - 1) + '}').join(String(arguments[i]));
    }
    return text;
}

/* ------------------------------------------------------------------ *
 *  DOM 생성 도우미
 * ------------------------------------------------------------------ */

/**
 * 요소를 만든다.
 * @param {string} tag 'div', 'button.primary', 'span#id' 처럼 클래스/아이디 표기 가능
 * @param {object} props 속성 (on* 은 이벤트 리스너)
 * @param {...*} children 자식 요소 또는 문자열
 */
function h(tag, props) {
    const idSplit = tag.split('#');
    const classSplit = idSplit[0].split('.');
    const el = document.createElement(classSplit[0] || 'div');
    if (idSplit[1]) el.id = idSplit[1];
    for (let i = 1; i < classSplit.length; i++) el.classList.add(classSplit[i]);

    const options = props || {};
    Object.keys(options).forEach(function (key) {
        const value = options[key];
        if (value === null || value === undefined || value === false) return;
        if (key.indexOf('on') === 0 && typeof value === 'function') {
            el.addEventListener(key.substring(2).toLowerCase(), value);
        } else if (key === 'text') {
            el.textContent = String(value);
        } else if (key === 'html') {
            el.innerHTML = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(el.style, value);
        } else if (key === 'dataset' && typeof value === 'object') {
            Object.assign(el.dataset, value);
        } else if (key in el && key !== 'list' && key !== 'type') {
            el[key] = value;
        } else {
            el.setAttribute(key, value === true ? '' : value);
        }
    });

    for (let i = 2; i < arguments.length; i++) {
        appendChild(el, arguments[i]);
    }
    return el;
}

function appendChild(parent, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) {
        child.forEach(function (c) { appendChild(parent, c); });
        return;
    }
    parent.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
}

function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

/** 바이트 수를 읽기 쉬운 문자열로 */
function humanSize(bytes) {
    if (bytes === null || bytes === undefined) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function formatNumber(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(ms) {
    const d = new Date(ms);
    const pad = function (n) { return n < 10 ? '0' + n : String(n); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
        + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

/* ------------------------------------------------------------------ *
 *  스타일
 * ------------------------------------------------------------------ */

const STYLE_ID = 'worldwriter-style';

const CSS = `
#worldwriter_root, .ww-app {
    --ww-bg: #f5f6f8;
    --ww-panel: #ffffff;
    --ww-panel-2: #f0f1f4;
    --ww-text: #1d2129;
    --ww-text-dim: #6b7280;
    --ww-border: #d8dbe0;
    --ww-accent: #4a5ee0;
    --ww-accent-text: #ffffff;
    --ww-danger: #c0392b;
    --ww-shadow: 0 2px 10px rgba(0,0,0,0.08);
}
.ww-app[data-theme="dark"] {
    --ww-bg: #16181d;
    --ww-panel: #212429;
    --ww-panel-2: #2a2e35;
    --ww-text: #e6e8ec;
    --ww-text-dim: #9aa1ad;
    --ww-border: #3a3f47;
    --ww-accent: #6c7ff2;
    --ww-accent-text: #ffffff;
    --ww-danger: #e06c5b;
    --ww-shadow: 0 2px 10px rgba(0,0,0,0.45);
}
body { margin: 0; }
.ww-app {
    box-sizing: border-box;
    font-family: "Segoe UI", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
    font-size: 14px;
    color: var(--ww-text);
    background: var(--ww-bg);
    min-height: 100vh;
}
.ww-app *, .ww-app *::before, .ww-app *::after { box-sizing: border-box; }

.ww-btn {
    border: 1px solid var(--ww-border);
    background: var(--ww-panel);
    color: var(--ww-text);
    padding: 7px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    line-height: 1.4;
}
.ww-btn:hover:not(:disabled) { background: var(--ww-panel-2); }
.ww-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.ww-btn.primary { background: var(--ww-accent); border-color: var(--ww-accent); color: var(--ww-accent-text); }
.ww-btn.primary:hover:not(:disabled) { filter: brightness(1.08); }
.ww-btn.danger { color: var(--ww-danger); border-color: var(--ww-danger); background: transparent; }
.ww-btn.small { padding: 4px 9px; font-size: 12px; }
.ww-btn.link { border: none; background: none; color: var(--ww-accent); padding: 2px 4px; }

.ww-input, .ww-textarea, .ww-select {
    width: 100%;
    border: 1px solid var(--ww-border);
    background: var(--ww-panel);
    color: var(--ww-text);
    border-radius: 6px;
    padding: 8px 10px;
    font-family: inherit;
    font-size: 14px;
}
.ww-textarea { resize: vertical; line-height: 1.6; }
.ww-input:focus, .ww-textarea:focus, .ww-select:focus { outline: 2px solid var(--ww-accent); outline-offset: -1px; }
.ww-field { margin-bottom: 14px; }
.ww-label { display: block; font-size: 12px; color: var(--ww-text-dim); margin-bottom: 5px; }
.ww-hint { font-size: 12px; color: var(--ww-text-dim); margin-top: 4px; line-height: 1.5; }
.ww-check { display: flex; align-items: center; gap: 8px; cursor: pointer; }

/* 로그인 / 초기화면 */
.ww-center {
    min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;
}
.ww-card {
    background: var(--ww-panel); border: 1px solid var(--ww-border);
    border-radius: 10px; box-shadow: var(--ww-shadow); padding: 26px;
}
.ww-login { width: 100%; max-width: 380px; }
.ww-brand { font-size: 24px; font-weight: 700; margin: 0 0 4px 0; }
.ww-tagline { color: var(--ww-text-dim); margin: 0 0 22px 0; font-size: 13px; }

.ww-home { max-width: 860px; margin: 0 auto; padding: 28px 20px 60px 20px; }
.ww-home-head { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
.ww-home-head h2 { margin: 0; font-size: 19px; flex: 1; }
.ww-projects { display: flex; flex-direction: column; gap: 10px; }
.ww-project {
    display: flex; align-items: center; gap: 10px; padding: 14px 16px;
    background: var(--ww-panel); border: 1px solid var(--ww-border); border-radius: 8px;
}
.ww-project:hover { border-color: var(--ww-accent); }
.ww-project-main { flex: 1; min-width: 0; cursor: pointer; }
.ww-project-name { font-weight: 600; margin-bottom: 3px; word-break: break-all; }
.ww-project-meta { font-size: 12px; color: var(--ww-text-dim); }
.ww-empty {
    padding: 40px 20px; text-align: center; color: var(--ww-text-dim);
    border: 1px dashed var(--ww-border); border-radius: 8px;
}
.ww-foot-note { margin-top: 20px; font-size: 12px; color: var(--ww-text-dim); line-height: 1.7; }

/* 작업화면 */
.ww-workspace { display: flex; flex-direction: column; height: 100vh; }
.ww-toolbar {
    display: flex; align-items: center; gap: 10px; padding: 10px 16px;
    background: var(--ww-panel); border-bottom: 1px solid var(--ww-border); flex: 0 0 auto;
}
.ww-toolbar-title { flex: 1; font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ww-body { flex: 1; display: flex; min-height: 0; }
.ww-sidebar {
    width: 220px; flex: 0 0 220px; background: var(--ww-panel);
    border-right: 1px solid var(--ww-border); padding: 14px 10px; overflow-y: auto;
}
.ww-step {
    display: block; width: 100%; text-align: left; border: none; background: none;
    color: var(--ww-text); padding: 11px 12px; border-radius: 7px; cursor: pointer;
    font-size: 13.5px; font-family: inherit; margin-bottom: 4px; line-height: 1.4;
}
.ww-step:hover:not(:disabled) { background: var(--ww-panel-2); }
.ww-step.active { background: var(--ww-accent); color: var(--ww-accent-text); font-weight: 600; }
.ww-step:disabled { opacity: 0.38; cursor: not-allowed; }
.ww-step-note { font-size: 11px; color: var(--ww-text-dim); padding: 8px 12px; line-height: 1.5; }
.ww-main { flex: 1; overflow-y: auto; padding: 22px 26px 60px 26px; min-width: 0; }
.ww-main h2 { margin: 0 0 6px 0; font-size: 18px; }
.ww-guide { color: var(--ww-text-dim); font-size: 13px; margin: 0 0 16px 0; line-height: 1.6; }
.ww-actions { display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0; align-items: center; }
.ww-spacer { flex: 1; }

/* 2단계 */
.ww-groups { display: flex; flex-direction: column; gap: 20px; }
.ww-group-title { font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
.ww-badge {
    font-size: 11px; padding: 1px 7px; border-radius: 10px;
    background: var(--ww-panel-2); color: var(--ww-text-dim); font-weight: 400;
}
.ww-badge.on { background: var(--ww-accent); color: var(--ww-accent-text); }
.ww-item {
    border: 1px solid var(--ww-border); border-radius: 8px; background: var(--ww-panel); margin-bottom: 8px;
}
.ww-item-head {
    display: flex; align-items: center; gap: 10px; padding: 11px 14px; cursor: pointer;
}
.ww-item-name { font-weight: 600; flex: 0 0 auto; }
.ww-item-summary { color: var(--ww-text-dim); font-size: 12.5px; flex: 1; min-width: 0;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ww-item-body { padding: 0 14px 14px 14px; border-top: 1px solid var(--ww-border); }
.ww-item-body .ww-actions { margin: 10px 0 0 0; }

/* 3단계 */
.ww-flow { display: flex; flex-direction: column; gap: 6px; }
.ww-flow-item {
    display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px;
    background: var(--ww-panel); border: 1px solid var(--ww-border); border-radius: 8px; cursor: grab;
}
.ww-flow-item.dragging { opacity: 0.4; }
.ww-flow-item.drop-target { border-color: var(--ww-accent); border-style: dashed; }
.ww-flow-no { color: var(--ww-text-dim); font-size: 12px; min-width: 26px; padding-top: 2px; }
.ww-flow-text { flex: 1; min-width: 0; }
.ww-flow-title { font-weight: 600; margin-bottom: 2px; }
.ww-flow-summary { font-size: 12.5px; color: var(--ww-text-dim); line-height: 1.5; }
.ww-grip { color: var(--ww-text-dim); cursor: grab; user-select: none; padding-top: 2px; }

/* 4단계 */
.ww-books { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.ww-book-tab {
    padding: 8px 14px; border: 1px solid var(--ww-border); border-radius: 20px;
    background: var(--ww-panel); cursor: pointer; font-size: 13px; font-family: inherit; color: var(--ww-text);
}
.ww-book-tab.active { background: var(--ww-accent); border-color: var(--ww-accent); color: var(--ww-accent-text); }
.ww-editor { display: flex; flex-direction: column; gap: 10px; }
.ww-editor-head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.ww-editor-head .ww-select { width: auto; min-width: 220px; flex: 1; }
.ww-chapter-text { min-height: 420px; font-size: 15px; line-height: 1.9; }

/* 모달 / 알림 */
.ww-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 1000;
}
.ww-modal {
    background: var(--ww-panel); border-radius: 10px; box-shadow: var(--ww-shadow);
    width: 100%; max-width: 480px; max-height: 88vh; display: flex; flex-direction: column;
}
.ww-modal.wide { max-width: 620px; }
.ww-modal-head { padding: 16px 20px; border-bottom: 1px solid var(--ww-border); font-weight: 600; }
.ww-modal-body { padding: 18px 20px; overflow-y: auto; }
.ww-modal-foot {
    padding: 12px 20px; border-top: 1px solid var(--ww-border);
    display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;
}
.ww-modal-message { line-height: 1.7; white-space: pre-wrap; word-break: break-word; }

.ww-progress-line { margin-top: 12px; font-size: 13px; color: var(--ww-text-dim); }
.ww-bar { height: 8px; border-radius: 4px; background: var(--ww-panel-2); overflow: hidden; margin-top: 10px; }
.ww-bar > div { height: 100%; background: var(--ww-accent); width: 0%; transition: width 0.25s; }

.ww-toast {
    position: fixed; left: 50%; bottom: 26px; transform: translateX(-50%);
    background: var(--ww-panel); color: var(--ww-text); border: 1px solid var(--ww-border);
    box-shadow: var(--ww-shadow); padding: 11px 18px; border-radius: 8px; z-index: 1100;
    max-width: 80vw; line-height: 1.5;
}

@media (max-width: 720px) {
    .ww-sidebar { width: 150px; flex-basis: 150px; }
    .ww-main { padding: 16px 14px 50px 14px; }
    .ww-step { font-size: 12.5px; padding: 9px 8px; }
}
`;

function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
}

/* ------------------------------------------------------------------ *
 *  화면 상태
 * ------------------------------------------------------------------ */

const state = {
    root: null,
    user: '',
    language: 'ko',
    darkMode: false,
    screen: 'login',      // login | home | workspace
    projects: [],
    project: null,
    step: 1,
    openItems: {},        // 2단계에서 펼쳐진 항목
    currentBookId: null,
    currentBook: null,
    currentChapterIndex: 0,
    cancelRequested: false
};

const USER_KEY = 'ww.currentUser';

/* ------------------------------------------------------------------ *
 *  공통 대화상자
 * ------------------------------------------------------------------ */

function openOverlay(modal, options) {
    const opts = options || {};
    const overlay = h('div.ww-overlay', {
        onClick: function (ev) {
            if (ev.target === overlay && opts.closeOnBackdrop !== false && opts.onClose) opts.onClose();
        }
    }, modal);
    state.root.appendChild(overlay);
    return overlay;
}

function closeOverlay(overlay) {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
}

/** 알림 대화상자 */
function showAlert(title, message) {
    return new Promise(function (resolve) {
        let overlay;
        const done = function () { closeOverlay(overlay); resolve(); };
        const modal = h('div.ww-modal', {},
            h('div.ww-modal-head', { text: title }),
            h('div.ww-modal-body', {}, h('div.ww-modal-message', { text: message })),
            h('div.ww-modal-foot', {}, h('button.ww-btn.primary', { text: t('common.ok'), onClick: done })
            ));
        overlay = openOverlay(modal, { onClose: done });
        const btn = modal.querySelector('button');
        if (btn) btn.focus();
    });
}

/** 확인 대화상자 */
function showConfirm(title, message, confirmLabel, danger) {
    return new Promise(function (resolve) {
        let overlay;
        const finish = function (value) { closeOverlay(overlay); resolve(value); };
        const modal = h('div.ww-modal', {},
            h('div.ww-modal-head', { text: title }),
            h('div.ww-modal-body', {}, h('div.ww-modal-message', { text: message })),
            h('div.ww-modal-foot', {},
                h('button.ww-btn', { text: t('common.cancel'), onClick: function () { finish(false); } }),
                h('button.ww-btn' + (danger ? '.danger' : '.primary'), {
                    text: confirmLabel || t('common.ok'),
                    onClick: function () { finish(true); }
                })
            ));
        overlay = openOverlay(modal, { onClose: function () { finish(false); } });
    });
}

/** 한 줄 또는 여러 줄 입력 대화상자 */
function showPrompt(options) {
    return new Promise(function (resolve) {
        let overlay;
        const finish = function (value) { closeOverlay(overlay); resolve(value); };

        const field = options.multiline
            ? h('textarea.ww-textarea', { rows: 6, placeholder: options.placeholder || '' })
            : h('input.ww-input', { type: options.type || 'text', placeholder: options.placeholder || '' });
        field.value = options.value === undefined ? '' : String(options.value);

        const submit = function () { finish(field.value); };
        if (!options.multiline) {
            field.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') submit(); });
        }

        const modal = h('div.ww-modal' + (options.multiline ? '.wide' : ''), {},
            h('div.ww-modal-head', { text: options.title }),
            h('div.ww-modal-body', {},
                options.label ? h('label.ww-label', { text: options.label }) : null,
                field,
                options.hint ? h('div.ww-hint', { text: options.hint }) : null),
            h('div.ww-modal-foot', {},
                h('button.ww-btn', { text: t('common.cancel'), onClick: function () { finish(null); } }),
                h('button.ww-btn.primary', { text: options.confirmLabel || t('common.ok'), onClick: submit })
            ));
        overlay = openOverlay(modal, { onClose: function () { finish(null); } });
        setTimeout(function () { field.focus(); }, 0);
    });
}

/** 잠시 떴다 사라지는 알림 */
function toast(message) {
    const node = h('div.ww-toast', { text: message });
    state.root.appendChild(node);
    setTimeout(function () {
        if (node.parentNode) node.parentNode.removeChild(node);
    }, 2600);
}

/**
 * 진행 상황 표시가 있는 작업 실행기.
 * @returns {{setText:Function, setProgress:Function, close:Function}}
 */
function openProgress(title, options) {
    const opts = options || {};
    const line = h('div.ww-progress-line', { text: opts.text || t('common.working') });
    const bar = h('div', {});
    const barWrap = h('div.ww-bar', {}, bar);

    const foot = h('div.ww-modal-foot', {});
    let cancelButton = null;
    if (opts.onCancel) {
        cancelButton = h('button.ww-btn.danger', {
            text: opts.cancelLabel || t('common.cancel'),
            onClick: function () {
                cancelButton.disabled = true;
                opts.onCancel();
            }
        });
        foot.appendChild(cancelButton);
    }

    const modal = h('div.ww-modal', {},
        h('div.ww-modal-head', { text: title }),
        h('div.ww-modal-body', {}, line, opts.showBar === false ? null : barWrap),
        opts.onCancel ? foot : null);

    const overlay = openOverlay(modal, { closeOnBackdrop: false });

    return {
        setText: function (text) { line.textContent = text; },
        setProgress: function (current, total) {
            bar.style.width = (total > 0 ? Math.round(current / total * 100) : 0) + '%';
        },
        close: function () { closeOverlay(overlay); }
    };
}

/** 오류를 사용자에게 보여준다. */
function showError(error) {
    console.error(error);
    const message = (error && error.message) ? error.message : String(error);
    return showAlert(t('common.error'), message);
}

/** 작업 중 대기 표시를 띄우고 실행한다. */
async function withProgress(title, text, task) {
    const progress = openProgress(title, { text: text, showBar: false });
    try {
        return await task(progress);
    } finally {
        progress.close();
    }
}

/* ------------------------------------------------------------------ *
 *  테마 적용
 * ------------------------------------------------------------------ */

function applyTheme() {
    if (!state.root) return;
    state.root.classList.add('ww-app');
    state.root.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
    document.documentElement.style.colorScheme = state.darkMode ? 'dark' : 'light';
    document.body.style.background = state.darkMode ? '#16181d' : '#f5f6f8';
}

/* ------------------------------------------------------------------ *
 *  1) 로그인 화면
 * ------------------------------------------------------------------ */

function renderLogin() {
    const input = h('input.ww-input', {
        type: 'text',
        placeholder: t('login.placeholder'),
        value: state.user || ''
    });

    const start = async function () {
        const name = input.value.trim();
        if (name.length === 0) {
            await showAlert(t('common.error'), t('login.needName'));
            input.focus();
            return;
        }
        try {
            await withProgress(t('app.title'), t('common.working'), async function () {
                await WorldWriter.init(name);
            });
            state.user = name;
            state.language = Settings.current.language;
            state.darkMode = Settings.current.darkMode;
            try { window.localStorage.setItem(USER_KEY, name); } catch (e) { /* 무시 */ }
            applyTheme();
            await goHome();
        } catch (e) {
            await showError(e);
        }
    };

    input.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') start(); });

    const view = h('div.ww-center', {},
        h('div.ww-card.ww-login', {},
            h('h1.ww-brand', { text: t('app.title') }),
            h('p.ww-tagline', { text: t('app.tagline') }),
            h('div.ww-field', {},
                h('label.ww-label', { text: t('login.name') }),
                input),
            h('button.ww-btn.primary', {
                text: t('login.start'),
                style: { width: '100%' },
                onClick: start
            })
        ));

    mount(view);
    setTimeout(function () { input.focus(); }, 0);
}

/* ------------------------------------------------------------------ *
 *  2) 초기 화면 (프로젝트 목록)
 * ------------------------------------------------------------------ */

async function goHome() {
    state.screen = 'home';
    state.project = null;
    state.projects = await Projects.list();
    renderHome();
}

function renderHome() {
    const list = state.projects.slice().sort(function (a, b) {
        return (b.updatedAt || 0) - (a.updatedAt || 0);
    });

    const rows = list.map(function (meta) {
        const open = function () { openProject(meta.id); };
        return h('div.ww-project', {},
            h('div.ww-project-main', { onClick: open },
                h('div.ww-project-name', { text: meta.name }),
                h('div.ww-project-meta', { text: formatDate(meta.updatedAt || meta.createdAt) })),
            h('button.ww-btn.small', { text: t('home.open'), onClick: open }),
            h('button.ww-btn.small', {
                text: t('home.rename'),
                onClick: async function () {
                    const name = await showPrompt({
                        title: t('home.rename'), label: t('home.newLabel'), value: meta.name
                    });
                    if (name === null) return;
                    try {
                        await Projects.rename(meta.id, name);
                        await goHome();
                    } catch (e) { await showError(e); }
                }
            }),
            h('button.ww-btn.small.danger', {
                text: t('common.delete'),
                onClick: async function () {
                    const ok = await showConfirm(t('common.delete'),
                        t('home.deleteConfirm', meta.name), t('common.delete'), true);
                    if (!ok) return;
                    try {
                        await Projects.remove(meta.id);
                        await goHome();
                    } catch (e) { await showError(e); }
                }
            })
        );
    });

    const usage = Storage.usage();
    const storageNote = Env.isServer()
        ? t('home.storageServer', (Env.backend && Env.backend.storagePath) || 'server')
        : t('home.storageLocal');

    const view = h('div.ww-home', {},
        h('div.ww-home-head', {},
            h('h2', { text: t('home.projects') }),
            h('button.ww-btn.primary', { text: t('home.new'), onClick: createProject }),
            h('button.ww-btn', { text: t('home.settings'), onClick: openSettings })),
        rows.length > 0
            ? h('div.ww-projects', {}, rows)
            : h('div.ww-empty', { text: t('home.empty') }),
        h('div.ww-foot-note', {},
            h('div', { text: state.user }),
            h('div', { text: storageNote }),
            usage !== null ? h('div', { text: t('home.usage', humanSize(usage)) }) : null,
            h('button.ww-btn.link', {
                text: t('home.logout'),
                onClick: function () {
                    state.screen = 'login';
                    renderLogin();
                }
            })
        ));

    mount(view);
}

async function createProject() {
    const name = await showPrompt({ title: t('home.newTitle'), label: t('home.newLabel') });
    if (name === null) return;
    try {
        await Projects.create(name);
        await goHome();
    } catch (e) {
        await showError(e);
    }
}

async function openProject(projectId) {
    try {
        const project = await Projects.load(projectId);
        state.project = project;
        state.screen = 'workspace';
        // 마지막으로 진행된 지점을 열어준다.
        if (project.books.length > 0) state.step = 4;
        else if (project.flow.length > 0) state.step = 3;
        else if (ITEM_KINDS.some(function (k) { return project[k].length > 0; })) state.step = 2;
        else state.step = 1;
        state.openItems = {};
        state.currentBookId = null;
        state.currentBook = null;
        renderWorkspace();
    } catch (e) {
        await showError(e);
    }
}

/* ------------------------------------------------------------------ *
 *  설정 화면
 * ------------------------------------------------------------------ */

function openSettings() {
    const draft = WorldWriter.util.clone(Settings.current);
    let overlay;

    const body = h('div.ww-modal-body', {});
    const rebuild = function () {
        clearNode(body);
        const spec = PROVIDERS[draft.provider] || PROVIDERS.openai;

        const providerSelect = h('select.ww-select', {
            onChange: function (ev) { draft.provider = ev.target.value; rebuild(); }
        }, Object.keys(PROVIDERS).map(function (key) {
            return h('option', { value: key, text: PROVIDERS[key].label, selected: draft.provider === key });
        }));

        const apiKeyInput = h('input.ww-input', {
            type: 'password',
            value: (draft.apiKeys || {})[draft.provider] || '',
            placeholder: spec.needsApiKey ? 'sk-...' : '',
            onInput: function (ev) { draft.apiKeys[draft.provider] = ev.target.value; }
        });

        const modelInput = h('input.ww-input', {
            type: 'text',
            value: (draft.models || {})[draft.provider] || '',
            placeholder: spec.defaultModel,
            onInput: function (ev) { draft.models[draft.provider] = ev.target.value; }
        });

        const lmUrlInput = h('input.ww-input', {
            type: 'text',
            value: draft.lmStudioUrl || '',
            placeholder: 'http://localhost:1234',
            onInput: function (ev) { draft.lmStudioUrl = ev.target.value; }
        });

        const languageSelect = h('select.ww-select', {
            onChange: function (ev) { draft.language = ev.target.value; }
        },
            h('option', { value: 'ko', text: '한국어', selected: draft.language === 'ko' }),
            h('option', { value: 'en', text: 'English', selected: draft.language === 'en' }));

        const darkCheck = h('input', {
            type: 'checkbox', checked: draft.darkMode === true,
            onChange: function (ev) {
                draft.darkMode = ev.target.checked;
                // 미리 적용해 보여준다.
                state.darkMode = draft.darkMode;
                applyTheme();
            }
        });

        appendChild(body, [
            h('div.ww-field', {}, h('label.ww-label', { text: t('settings.provider') }), providerSelect),
            h('div.ww-field', {},
                h('label.ww-label', { text: t('settings.apiKey') }),
                apiKeyInput,
                spec.needsApiKey ? null : h('div.ww-hint', { text: t('settings.apiKeyNone') })),
            h('div.ww-field', {},
                h('label.ww-label', { text: t('settings.model') }),
                modelInput,
                h('div.ww-hint', { text: t('settings.modelHint', spec.defaultModel) })),
            spec.needsBaseUrl
                ? h('div.ww-field', {}, h('label.ww-label', { text: t('settings.lmUrl') }), lmUrlInput)
                : null,
            h('div.ww-field', {}, h('label.ww-label', { text: t('settings.language') }), languageSelect),
            h('div.ww-field', {}, h('label.ww-check', {}, darkCheck, h('span', { text: t('settings.darkMode') })))
        ]);
    };
    rebuild();

    const testButton = h('button.ww-btn', {
        text: t('settings.test'),
        onClick: async function () {
            testButton.disabled = true;
            const original = testButton.textContent;
            testButton.textContent = t('settings.testing');
            try {
                const answer = await AI.testConnection(draft);
                await showAlert(t('settings.test'), t('settings.testOk', answer.substring(0, 60)));
            } catch (e) {
                await showError(e);
            } finally {
                testButton.disabled = false;
                testButton.textContent = original;
            }
        }
    });

    const cancel = function () {
        // 미리보기로 바뀐 테마를 되돌린다.
        state.darkMode = Settings.current.darkMode;
        applyTheme();
        closeOverlay(overlay);
    };

    const save = async function () {
        try {
            await Settings.save(draft);
            state.language = Settings.current.language;
            state.darkMode = Settings.current.darkMode;
            applyTheme();
            closeOverlay(overlay);
            rerender();
            toast(t('common.saved'));
        } catch (e) {
            await showError(e);
        }
    };

    const modal = h('div.ww-modal', {},
        h('div.ww-modal-head', { text: t('settings.title') }),
        body,
        h('div.ww-modal-foot', {},
            testButton,
            h('button.ww-btn', { text: t('common.cancel'), onClick: cancel }),
            h('button.ww-btn.primary', { text: t('common.save'), onClick: save })));

    overlay = openOverlay(modal, { onClose: cancel });
}

/* ------------------------------------------------------------------ *
 *  3) 작업 화면
 * ------------------------------------------------------------------ */

function renderWorkspace() {
    const project = state.project;
    const maxStep = Projects.maxStep(project);

    const toolbar = h('div.ww-toolbar', {},
        h('button.ww-btn', { text: '← ' + t('toolbar.home'), onClick: goHome }),
        h('div.ww-toolbar-title', { text: project.name }),
        h('button.ww-btn', { text: t('toolbar.settings'), onClick: openSettings }));

    const steps = [1, 2, 3, 4].map(function (step) {
        const enabled = step <= maxStep;
        return h('button.ww-step' + (state.step === step ? '.active' : ''), {
            text: t('step.' + step),
            disabled: !enabled,
            onClick: function () {
                state.step = step;
                renderWorkspace();
            }
        });
    });

    const sidebar = h('div.ww-sidebar', {},
        steps,
        maxStep < 4 ? h('div.ww-step-note', { text: t('step.locked') }) : null);

    const main = h('div.ww-main', {});
    if (state.step === 1) renderStep1(main);
    else if (state.step === 2) renderStep2(main);
    else if (state.step === 3) renderStep3(main);
    else renderStep4(main);

    mount(h('div.ww-workspace', {}, toolbar, h('div.ww-body', {}, sidebar, main)));
}

/** 프로젝트를 저장하고 화면을 다시 그린다. */
async function saveProject(rerenderAfter) {
    await Projects.save(state.project);
    if (rerenderAfter !== false) renderWorkspace();
}

/* --------------------------- 1단계 --------------------------- */

function renderStep1(main) {
    const project = state.project;

    const textarea = h('textarea.ww-textarea', {
        rows: 14,
        placeholder: t('step1.placeholder'),
        value: project.description || '',
        onInput: function (ev) { project.description = ev.target.value; }
    });

    const generate = async function () {
        if (WorldWriter.util.isBlank(project.description)) {
            await showAlert(t('common.error'), t('step1.needDescription'));
            return;
        }
        const hasOutline = ITEM_KINDS.some(function (k) { return project[k].length > 0; });
        if (hasOutline) {
            const ok = await showConfirm(t('common.regenerate'), t('step1.confirmRegen'), t('common.regenerate'), true);
            if (!ok) return;
        }
        try {
            await Projects.save(project);
            await withProgress(t('step1.generate'), t('common.working'), async function () {
                await Pipeline.generateOutline(project);
                await Projects.save(project);
            });
            state.step = 2;
            state.openItems = {};
            renderWorkspace();
            toast(t('step1.done'));
        } catch (e) {
            await showError(e);
        }
    };

    appendChild(main, [
        h('h2', { text: t('step1.title') }),
        h('p.ww-guide', { text: t('step1.guide') }),
        textarea,
        h('div.ww-actions', {},
            h('button.ww-btn.primary', { text: t('step1.generate'), onClick: generate }),
            h('button.ww-btn', {
                text: t('common.save'),
                onClick: async function () {
                    await Projects.save(project);
                    toast(t('common.saved'));
                }
            }))
    ]);
}

/* --------------------------- 2단계 --------------------------- */

function renderStep2(main) {
    const project = state.project;

    const totalItems = ITEM_KINDS.reduce(function (sum, k) { return sum + project[k].length; }, 0);
    const detailed = ITEM_KINDS.reduce(function (sum, k) {
        return sum + project[k].filter(function (i) { return !WorldWriter.util.isBlank(i.detail); }).length;
    }, 0);

    if (totalItems === 0) {
        appendChild(main, [
            h('h2', { text: t('step2.title') }),
            h('div.ww-empty', { text: t('step2.empty') })
        ]);
        return;
    }

    const groups = ITEM_KINDS.map(function (kind) {
        const items = project[kind];
        const rows = items.map(function (item) { return renderStep2Item(kind, item); });
        return h('div', {},
            h('div.ww-group-title', {},
                h('span', { text: KIND_LABELS[kind] }),
                h('span.ww-badge', { text: String(items.length) })),
            rows.length > 0 ? rows : h('div.ww-hint', { text: '-' }));
    });

    appendChild(main, [
        h('h2', { text: t('step2.title') }),
        h('p.ww-guide', { text: t('step2.guide') + ' (' + t('step2.progress', detailed, totalItems) + ')' }),
        h('div.ww-actions', {},
            h('button.ww-btn', { text: t('step2.prev'), onClick: function () { state.step = 1; renderWorkspace(); } }),
            h('button.ww-btn', { text: t('step2.detailAll'), onClick: generateAllDetails }),
            h('div.ww-spacer', {}),
            h('button.ww-btn.primary', {
                text: t('step2.next'),
                onClick: function () { state.step = 3; renderWorkspace(); }
            })),
        h('div.ww-groups', {}, groups)
    ]);
}

function renderStep2Item(kind, item) {
    const project = state.project;
    const opened = state.openItems[item.id] === true;
    const hasDetail = !WorldWriter.util.isBlank(item.detail);

    const head = h('div.ww-item-head', {
        onClick: function () {
            state.openItems[item.id] = !opened;
            renderWorkspace();
        }
    },
        h('span.ww-item-name', { text: item.name }),
        h('span.ww-item-summary', { text: item.summary || '' }),
        h('span.ww-badge' + (hasDetail ? '.on' : ''), {
            text: hasDetail ? t('step2.hasDetail') : t('step2.noDetail')
        }));

    if (!opened) return h('div.ww-item', {}, head);

    const nameInput = h('input.ww-input', {
        type: 'text', value: item.name,
        onInput: function (ev) { item.name = ev.target.value; }
    });
    const summaryInput = h('input.ww-input', {
        type: 'text', value: item.summary || '',
        onInput: function (ev) { item.summary = ev.target.value; }
    });
    const detailArea = h('textarea.ww-textarea', {
        rows: 9, placeholder: t('step2.detailPlaceholder'), value: item.detail || '',
        onInput: function (ev) { item.detail = ev.target.value; }
    });

    const generateDetail = async function () {
        try {
            await withProgress(t('step2.detailBtn'), item.name, async function () {
                await Pipeline.generateItemDetail(project, kind, item.id);
                await Projects.save(project);
            });
            renderWorkspace();
        } catch (e) {
            await showError(e);
        }
    };

    const body = h('div.ww-item-body', {},
        h('div.ww-field', {}, h('label.ww-label', { text: t('common.name') }), nameInput),
        h('div.ww-field', {}, h('label.ww-label', { text: t('common.summary') }), summaryInput),
        h('div.ww-field', {}, h('label.ww-label', { text: t('common.detail') }), detailArea),
        h('div.ww-actions', {},
            h('button.ww-btn.primary', { text: t('step2.detailBtn'), onClick: generateDetail }),
            h('button.ww-btn', {
                text: t('common.save'),
                onClick: async function () {
                    await Projects.save(project);
                    renderWorkspace();
                    toast(t('common.saved'));
                }
            })));

    return h('div.ww-item', {}, head, body);
}

/** 상세 설명이 비어 있는 항목을 모두 생성한다. */
async function generateAllDetails() {
    const project = state.project;
    const targets = [];
    ITEM_KINDS.forEach(function (kind) {
        project[kind].forEach(function (item) {
            if (WorldWriter.util.isBlank(item.detail)) targets.push({ kind: kind, item: item });
        });
    });
    if (targets.length === 0) {
        await showAlert(t('step2.detailAll'), t('step2.progress', 0, 0));
        return;
    }

    state.cancelRequested = false;
    const progress = openProgress(t('step2.detailAll'), {
        text: '',
        onCancel: function () { state.cancelRequested = true; }
    });

    try {
        for (let i = 0; i < targets.length; i++) {
            if (state.cancelRequested) break;
            progress.setText((i + 1) + ' / ' + targets.length + ' : ' + targets[i].item.name);
            progress.setProgress(i, targets.length);
            await Pipeline.generateItemDetail(project, targets[i].kind, targets[i].item.id);
            await Projects.save(project);
        }
    } catch (e) {
        await showError(e);
    } finally {
        progress.close();
        renderWorkspace();
    }
}

/* --------------------------- 3단계 --------------------------- */

function renderStep3(main) {
    const project = state.project;

    const generate = async function () {
        if (project.flow.length > 0) {
            const ok = await showConfirm(t('common.regenerate'), t('step3.confirmRegen'), t('common.regenerate'), true);
            if (!ok) return;
        }
        try {
            await withProgress(t('step3.generate'), t('common.working'), async function () {
                await Pipeline.generateFlow(project);
                await Projects.save(project);
            });
            renderWorkspace();
        } catch (e) {
            await showError(e);
        }
    };

    const header = [
        h('h2', { text: t('step3.title') }),
        h('p.ww-guide', {
            text: t('step3.guide')
                + (project.books.length > 0 ? ' ' + t('step3.hasBooks') : '')
        }),
        h('div.ww-actions', {},
            h('button.ww-btn', { text: t('step3.prev'), onClick: function () { state.step = 2; renderWorkspace(); } }),
            h('button.ww-btn' + (project.flow.length === 0 ? '.primary' : ''), {
                text: project.flow.length === 0 ? t('step3.generate') : t('common.regenerate'),
                onClick: generate
            }),
            h('span.ww-badge', { text: t('step3.count', project.flow.length) }),
            h('div.ww-spacer', {}),
            h('button.ww-btn.primary', {
                text: t('step3.next'),
                disabled: project.flow.length === 0,
                onClick: function () { state.step = 4; renderWorkspace(); }
            }))
    ];

    if (project.flow.length === 0) {
        appendChild(main, header.concat([h('div.ww-empty', { text: t('step3.empty') })]));
        return;
    }

    appendChild(main, header.concat([renderFlowList()]));
}

function renderFlowList() {
    const project = state.project;
    const container = h('div.ww-flow', {});
    let dragFrom = -1;

    project.flow.forEach(function (item, index) {
        const row = h('div.ww-flow-item', { draggable: true },
            h('span.ww-grip', { text: '☰' }),
            h('span.ww-flow-no', { text: String(index + 1) }),
            h('div.ww-flow-text', {},
                h('div.ww-flow-title', {},
                    item.title,
                    item.main ? h('span.ww-badge.on', { text: t('step3.main'), style: { marginLeft: '6px' } }) : null),
                h('div.ww-flow-summary', { text: item.summary || '' })),
            h('button.ww-btn.small.danger', {
                text: t('common.delete'),
                onClick: async function (ev) {
                    ev.stopPropagation();
                    const ok = await showConfirm(t('common.delete'), t('step3.deleteConfirm'), t('common.delete'), true);
                    if (!ok) return;
                    project.flow.splice(index, 1);
                    await saveProject();
                }
            }));

        row.addEventListener('dragstart', function (ev) {
            dragFrom = index;
            row.classList.add('dragging');
            ev.dataTransfer.effectAllowed = 'move';
            // Firefox 는 데이터가 설정되어야 드래그가 시작된다.
            ev.dataTransfer.setData('text/plain', String(index));
        });
        row.addEventListener('dragend', function () {
            row.classList.remove('dragging');
            Array.prototype.forEach.call(container.children, function (c) { c.classList.remove('drop-target'); });
        });
        row.addEventListener('dragover', function (ev) {
            ev.preventDefault();
            ev.dataTransfer.dropEffect = 'move';
            row.classList.add('drop-target');
        });
        row.addEventListener('dragleave', function () { row.classList.remove('drop-target'); });
        row.addEventListener('drop', async function (ev) {
            ev.preventDefault();
            row.classList.remove('drop-target');
            const from = dragFrom >= 0 ? dragFrom : parseInt(ev.dataTransfer.getData('text/plain'), 10);
            if (isNaN(from) || from === index) return;
            const moved = project.flow.splice(from, 1)[0];
            project.flow.splice(index, 0, moved);
            dragFrom = -1;
            await saveProject();
        });

        container.appendChild(row);
    });

    return container;
}

/* --------------------------- 4단계 --------------------------- */

function renderStep4(main) {
    const project = state.project;
    const hasTarget = (project.targetVolumes || 0) > 0;
    const allDone = hasTarget && project.books.length >= project.targetVolumes;

    const setTarget = async function () {
        const value = await showPrompt({
            title: t('step4.setTarget'),
            label: t('step4.targetVolumes'),
            hint: t('step4.targetGuide'),
            type: 'number',
            value: project.targetVolumes || 3
        });
        if (value === null) return;
        const count = parseInt(value, 10);
        if (isNaN(count) || count < 1) {
            await showAlert(t('common.error'), t('step4.needTarget'));
            return;
        }
        project.targetVolumes = count;
        await saveProject();
    };

    const header = [
        h('h2', { text: t('step4.title') }),
        h('p.ww-guide', { text: t('step4.targetGuide') }),
        h('div.ww-actions', {},
            h('button.ww-btn', { text: t('step3.title'), onClick: function () { state.step = 3; renderWorkspace(); } }),
            h('span.ww-badge', {
                text: t('step4.targetVolumes') + ': ' + (hasTarget ? project.targetVolumes : '-')
            }),
            // 책이 하나라도 생성된 뒤에는 권수 변경을 막는다. (기존 권과 배분이 어긋나기 때문)
            project.books.length === 0
                ? h('button.ww-btn.small', { text: t('step4.setTarget'), onClick: setTarget })
                : null,
            h('div.ww-spacer', {}),
            h('button.ww-btn.primary', {
                text: t('step4.newBook'),
                disabled: allDone,
                onClick: generateNextBook
            }),
            project.books.length > 0
                ? h('button.ww-btn.danger', { text: t('step4.deleteLast'), onClick: deleteLastBook })
                : null)
    ];

    if (allDone) {
        header.push(h('p.ww-guide', { text: t('step4.allDone', project.targetVolumes) }));
    }

    const tabs = h('div.ww-books', {}, project.books.map(function (meta) {
        return h('button.ww-book-tab' + (state.currentBookId === meta.id ? '.active' : ''), {
            text: meta.title + ' (' + t('step4.bookInfo', meta.chapterCount, formatNumber(meta.charCount)) + ')',
            onClick: function () { selectBook(meta.id); }
        });
    }));

    appendChild(main, header);

    if (project.books.length === 0) {
        appendChild(main, h('div.ww-empty', { text: t('step4.empty') }));
        return;
    }

    appendChild(main, tabs);

    if (!state.currentBook) {
        appendChild(main, h('div.ww-empty', { text: t('step4.selectBook') }));
        return;
    }

    appendChild(main, renderBookEditor());
}

async function selectBook(bookId) {
    try {
        const book = await Books.load(state.project.id, bookId);
        state.currentBookId = bookId;
        state.currentBook = book;
        state.currentChapterIndex = 0;
        renderWorkspace();
    } catch (e) {
        await showError(e);
    }
}

function renderBookEditor() {
    const project = state.project;
    const book = state.currentBook;
    const index = Math.min(state.currentChapterIndex, Math.max(0, book.chapters.length - 1));
    const chapter = book.chapters[index];

    if (!chapter) return h('div.ww-empty', { text: t('step4.empty') });

    const chapterSelect = h('select.ww-select', {
        onChange: function (ev) {
            state.currentChapterIndex = parseInt(ev.target.value, 10);
            renderWorkspace();
        }
    }, book.chapters.map(function (ch, i) {
        return h('option', { value: String(i), text: ch.title, selected: i === index });
    }));

    const textArea = h('textarea.ww-textarea.ww-chapter-text', {
        value: chapter.text,
        onInput: function (ev) { chapter.text = ev.target.value; }
    });

    const saveChapter = async function () {
        try {
            await Books.save(project.id, book);
            updateBookMeta(book);
            await Projects.save(project);
            renderWorkspace();
            toast(t('common.saved'));
        } catch (e) {
            await showError(e);
        }
    };

    const reviseChapter = async function () {
        const instruction = await showPrompt({
            title: t('step4.reviseTitle'),
            placeholder: t('step4.revisePlaceholder'),
            multiline: true
        });
        if (instruction === null || WorldWriter.util.isBlank(instruction)) return;
        try {
            await withProgress(t('step4.reviseTitle'), chapter.title, async function () {
                const revised = await Pipeline.reviseChapter(project, chapter, instruction);
                chapter.text = revised;
                await Books.save(project.id, book);
                updateBookMeta(book);
                await Projects.save(project);
            });
            renderWorkspace();
            toast(t('step4.reviseDone'));
        } catch (e) {
            await showError(e);
        }
    };

    const exportBook = function () {
        const text = Books.toPlainText(book);
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = h('a', { href: url, download: project.name + ' - ' + book.title + '.txt' });
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    };

    return h('div.ww-editor', {},
        h('div.ww-editor-head', {},
            h('label.ww-label', { text: t('step4.chapter'), style: { margin: '0' } }),
            chapterSelect,
            h('span.ww-badge', { text: formatNumber(chapter.text.length) + ' ' + t('common.chars') })),
        textArea,
        h('div.ww-actions', {},
            h('button.ww-btn.primary', { text: t('common.save'), onClick: saveChapter }),
            h('button.ww-btn', { text: t('step4.reviseAi'), onClick: reviseChapter }),
            h('div.ww-spacer', {}),
            h('button.ww-btn', { text: t('step4.exportBook'), onClick: exportBook })));
}

/** 프로젝트에 보관된 책 요약 정보를 갱신한다. */
function updateBookMeta(book) {
    const meta = Books.metaOf(book);
    const list = state.project.books;
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === book.id) { list[i] = meta; return; }
    }
    list.push(meta);
}

async function generateNextBook() {
    const project = state.project;

    if (!(project.targetVolumes > 0)) {
        const value = await showPrompt({
            title: t('step4.setTarget'),
            label: t('step4.targetVolumes'),
            hint: t('step4.targetGuide'),
            type: 'number',
            value: 3
        });
        if (value === null) return;
        const count = parseInt(value, 10);
        if (isNaN(count) || count < 1) {
            await showAlert(t('common.error'), t('step4.needTarget'));
            return;
        }
        project.targetVolumes = count;
        await Projects.save(project);
    }

    state.cancelRequested = false;
    const progress = openProgress(t('step4.generatingTitle'), {
        text: t('common.working'),
        cancelLabel: t('step4.cancel'),
        onCancel: function () {
            state.cancelRequested = true;
            progress.setText(t('step4.cancelling'));
        }
    });

    try {
        const book = await Pipeline.generateNextBook(project, {
            cancelled: function () { return state.cancelRequested; },
            onProgress: function (info) {
                if (info.phase === 'writing') {
                    progress.setText(t('step4.generating', info.current, info.total, info.title));
                    progress.setProgress(info.current - 1, info.total);
                } else {
                    progress.setProgress(info.current, info.total);
                }
            }
        });
        progress.close();
        state.currentBookId = book.id;
        state.currentBook = book;
        state.currentChapterIndex = 0;
        renderWorkspace();
        toast(t('step4.done', book.title));
    } catch (e) {
        progress.close();
        await showError(e);
        renderWorkspace();
    }
}

async function deleteLastBook() {
    const project = state.project;
    if (project.books.length === 0) return;
    const last = project.books[project.books.length - 1];

    const ok = await showConfirm(t('common.delete'),
        t('step4.deleteConfirm', last.title) + '\n' + t('step4.deleteOnlyLast'),
        t('common.delete'), true);
    if (!ok) return;

    try {
        await Books.remove(project.id, last.id);
        project.books.pop();
        if (state.currentBookId === last.id) {
            state.currentBookId = null;
            state.currentBook = null;
        }
        await saveProject();
    } catch (e) {
        await showError(e);
    }
}

/* ------------------------------------------------------------------ *
 *  화면 전환
 * ------------------------------------------------------------------ */

function mount(view) {
    // 열려 있는 모달은 유지하지 않는다. (화면이 바뀌면 함께 닫힌다.)
    clearNode(state.root);
    state.root.appendChild(view);
}

function rerender() {
    if (state.screen === 'login') renderLogin();
    else if (state.screen === 'home') renderHome();
    else renderWorkspace();
}

/* ------------------------------------------------------------------ *
 *  진입점
 * ------------------------------------------------------------------ */

const WorldWriterUI = {
    /**
     * UI 를 초기화한다. index.html 의 DOMContentLoaded 시점에 호출된다.
     * @param {HTMLElement} rootElement
     */
    async init(rootElement) {
        state.root = rootElement || document.body;
        injectStyle();

        const pref = Settings.readUiPreference();
        state.language = pref.language;
        state.darkMode = pref.darkMode;
        Settings.current.language = pref.language;
        applyTheme();

        await Env.detect();

        try {
            state.user = window.localStorage.getItem(USER_KEY) || '';
        } catch (e) {
            state.user = '';
        }

        state.screen = 'login';
        renderLogin();
    },

    // 디버깅 편의를 위해 내부 상태와 코어를 함께 노출한다.
    state: state,
    core: WorldWriter,
    t: t
};

if (typeof window !== 'undefined') {
    window.WorldWriterUI = WorldWriterUI;
}

export { WorldWriterUI };
export default WorldWriterUI;
