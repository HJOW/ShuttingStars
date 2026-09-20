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
 *   4. 우측 사이드바 : AI 채팅. 화면 맥락을 함께 보내고 도구로 화면을 조작한다.
 *                      같은 도구를 WebMCP 와 백엔드 MCP 도 사용한다.
 */

import {
    WorldWriter, Env, Storage, Settings, Projects, Books, AI, Pipeline,
    Backup, AiSocket, Tools, Chat, WebMcp, PROVIDERS, ITEM_KINDS, KIND_LABELS
} from './worldwriter.core.js';

/* ------------------------------------------------------------------ *
 *  다국어 문자열
 * ------------------------------------------------------------------ */

/**
 * `I18N` 선언이 담당하는 값을 보관한다.
 */
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
        'common.add': '추가',
        'common.reset': '초기화',
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
        'home.storageLocal': '저장 위치: 브라우저',
        'home.storageServer': '저장 위치: 서버 내 파일로 저장',
        'home.storageDesktop': '저장 위치: 앱 폴더 내 파일로 저장',
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
        'step1.confirmRegen': '인물·지역·주요 사건과 상세 설명을 새로 만들고 기존 사건 흐름을 비웁니다. 계속할까요?',
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
        'step2.addItem': '항목 추가',
        'step2.resetAll': '2단계 초기화',
        'step2.resetAllConfirm': '등장인물·지역·주요 사건을 모두 삭제하고 1단계로 돌아갑니다. 사건 흐름과 목표 권수도 함께 초기화됩니다. 계속할까요?',
        'step2.resetKindConfirm': '{0} 항목을 모두 삭제합니다. 사건 흐름과 목표 권수도 함께 초기화됩니다. 계속할까요?',
        'step2.deleteItemConfirm': '"{0}" 항목을 삭제합니다. 사건 흐름과 목표 권수도 함께 초기화됩니다. 계속할까요?',
        'step2.newItem': '새 항목',

        'step3.title': '사건 흐름',
        'step3.guide': '항목을 끌어서 순서를 바꾸거나 삭제할 수 있습니다.',
        'step3.generate': '사건 흐름 생성',
        'step3.empty': '아직 사건 흐름이 없습니다. "사건 흐름 생성" 을 눌러 주세요.',
        'step3.confirmRegen': '기존 사건 흐름이 지워지고 새로 만들어집니다. 계속할까요?',
        'step3.targetVolumes': '목표 권수',
        'step3.targetGuide': '사건 흐름을 생성하기 전에 전체 이야기를 몇 권으로 구성할지 정합니다. AI는 이 권수에 맞춰 권별 전환점과 흐름을 구성합니다.',
        'step3.setTarget': '목표 권수 설정',
        'step3.targetChangeConfirm': '목표 권수를 바꾸면 현재 사건 흐름을 지우고 새 권수 기준으로 다시 생성해야 합니다. 계속할까요?',
        'step3.main': '주요',
        'step3.count': '사건 {0}개',
        'step3.next': '4단계로 이동',
        'step3.prev': '2단계로 돌아가기',
        'step3.deleteConfirm': '이 사건을 목록에서 지울까요?',
        'step3.hasBooks': '기존 책을 보존하기 위해 개요 재생성·사건 흐름·목표 권수를 잠갔습니다. 마지막 권부터 모두 삭제하면 변경할 수 있습니다.',

        'step4.title': '책 생성',
        'step4.newBook': '다음 1권 생성',
        'step4.allBooks': '새 책 전체 생성',
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
        'step4.cancelling': '현재 응답을 저장한 뒤 중단합니다...',
        'step4.done': '{0} 생성이 끝났습니다.',
        'step4.allDone': '목표 권수({0}권)만큼 모두 생성했습니다.',
        'step4.selectBook': '위 목록에서 책을 선택하면 내용을 보거나 수정할 수 있습니다.',
        'step4.volumeOf': '{0}권',
        'step4.exportBook': '이 책 내보내기',
        'step4.exportFormatTitle': '책 내보내기 형식',
        'step4.exportFormatGuide': '저장할 파일 형식을 선택해 주세요.',
        'step4.exportTxt': 'TXT 파일',
        'step4.exportPdf': 'PDF 파일',
        'step4.exportPdfChecking': 'PDF 라이브러리 연결 확인 중...',
        'step4.exportPdfUnavailable': 'PDF 라이브러리에 연결할 수 없어 현재 사용할 수 없습니다.',
        'step4.exportStart': '내보내기',
        'step4.exportTxtDone': 'TXT 파일을 내보냈습니다.',
        'step4.exportPdfDone': 'PDF 파일을 내보냈습니다.',
        'step2.needDetails': '모든 인물·지역·주요 사건의 상세 설명을 저장하면 3단계로 이동할 수 있습니다.',
        'step4.resume': '중단한 책 이어쓰기',
        'step4.paused': '{0}의 진행분을 저장했습니다. 이어쓰기로 계속할 수 있습니다.',
        'step4.status.paused': '중단됨',
        'step4.status.writing': '작성 중 / 이어쓰기 가능',
        'step4.status.error': '오류 후 이어쓰기 가능',
        'step4.status.complete': '완료',
        'step4.lengthProgress': '{0}자 / 목표 {1}자',
        'step4.saveOrganize': '저장 후 자동정리',
        'step4.organizingTitle': '이후 책 자동정리 중',
        'step4.organizing': '{0} / {1} : {2}',
        'step4.organizeDone': '이후 책 {0}권의 장 {1}개를 변경 내용에 맞게 정리했습니다.',
        'step4.organizeNone': '이 책 뒤에는 정리할 책이 없습니다. 변경 내용을 저장했습니다.',
        'step4.organizeStopped': '자동정리를 중단했습니다. 이미 정리한 내용은 저장되어 있습니다.',
        'step4.costGuide': '권당 10만~15만 자를 위해 여러 번 호출합니다. 짧은 응답은 추가 집필하며, 한 번에 최대 120회 호출 후 진행분을 저장하고 멈춥니다.',
        'chat.title': 'AI 채팅',
        'chat.placeholder': '화면에 대해 묻거나 작업을 요청하세요. (Enter 전송, Shift+Enter 줄바꿈)',
        'chat.send': '보내기',
        'chat.reset': '대화 초기화',
        'chat.resetConfirm': '지금까지의 대화 내용을 모두 지웁니다. 계속할까요?',
        'chat.close': '닫기',
        'chat.empty': '연결된 AI와 대화할 수 있습니다. 현재 화면과 입력 내용을 함께 전달하며, 요청하면 화면 작업도 대신 수행합니다.',
        'chat.thinking': 'AI가 생각하는 중입니다...',
        'chat.usingTool': '도구 실행 중: {0}',
        'chat.failed': '채팅에 실패했습니다.',
        'chat.working': '작업 진행 중:',
        'progress.aiLive': '서버에서 작업 중 · {0}초 경과 (연결 유지 중)',
        'progress.aiSilent': '서버 응답을 기다리는 중 · {0}초 경과',
        'progress.aiLocal': '{0}초 경과',
        'backup.button': '백업',
        'backup.title': '프로젝트 백업',
        'backup.hint': '이 프로젝트의 모든 내용(설명·설정·사건 흐름·책 본문·AI 대화)을 JSON 파일로 내려받습니다. 설정 화면의 값은 포함되지 않습니다.',
        'backup.done': '백업 파일을 내려받았습니다.',
        'restore.button': '복원',
        'restore.title': '프로젝트 복원',
        'restore.nameLabel': '새 프로젝트 이름',
        'restore.summary': '백업된 이름: {0} / 책 {1}권 / 대화 {2}개. 기존 프로젝트를 덮어쓰지 않고 새 프로젝트로 추가합니다.',
        'restore.badFile': '백업 파일을 읽지 못했습니다.',
        'restore.done': '{0} 프로젝트를 복원했습니다.',
        'chat.mcpOn': 'MCP 연결됨',
        'chat.webmcpOn': 'WebMCP',
        'chat.mcpOnHint': '백엔드 MCP 서버에 연결되어 있어 외부 MCP 클라이언트도 이 화면의 도구를 쓸 수 있습니다.',
        'chat.webmcpOnHint': '브라우저의 WebMCP 표준에 도구를 등록했습니다.',
        'chat.webmcpOffHint': '이 브라우저는 WebMCP 표준을 지원하지 않습니다. 채팅과 도구는 그대로 동작하며, 페이지 안에서는 window.WorldWriterWebMCP 로 도구를 쓸 수 있습니다.',
        'tool.needProject': '먼저 프로젝트를 열어야 합니다.',
        'tool.noProject': '프로젝트를 찾을 수 없습니다: {0}',
        'tool.noBook': '책을 찾을 수 없습니다: {0}',
        'tool.noBooks': '삭제할 책이 없습니다.',
        'tool.noItem': '설정 항목을 찾을 수 없습니다: {0}',
        'tool.noFlow': '사건을 찾을 수 없습니다: {0}',
        'tool.noChapter': '장을 찾을 수 없습니다: {0}',
        'tool.needBook': '먼저 책을 선택해 주세요.',
        'tool.needTarget': '목표 권수를 먼저 지정해 주세요.',
        'tool.badKind': '설정 종류가 잘못되었습니다: {0}',
        'tool.badStep': '단계는 1~4 사이여야 합니다.',
        'tool.stepLocked': '{0}단계는 아직 열 수 없습니다. 앞 단계를 먼저 완료해 주세요.',
        'tool.badLanguage': '언어는 ko 또는 en 만 사용할 수 있습니다.',
        'tool.busy': '이미 다른 생성 작업이 진행 중입니다.',
        'tool.finished': '작업을 마쳤습니다.',
        'tool.outlineDone': '설정 목록을 생성했습니다.',
        'tool.detailDone': '상세 설명을 생성했습니다.',
        'tool.detailAllDone': '상세 설명 {0}개를 생성했습니다.',
        'tool.flowDone': '사건 흐름 {0}개를 생성했습니다.',
        'tool.reviseDone': '{0} 수정을 마쳤습니다.',
        'tool.bookDone': '{0} 생성을 마쳤습니다. (상태: {1})'
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
        'common.add': 'Add',
        'common.reset': 'Reset',
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
        'home.storageLocal': 'Storage: browser',
        'home.storageServer': 'Storage: files on the server',
        'home.storageDesktop': 'Storage: files in the app folder',
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
        'step1.confirmRegen': 'Replace characters, places, events and their details, and clear the event flow? Continue?',
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
        'step2.addItem': 'Add item',
        'step2.resetAll': 'Reset step 2',
        'step2.resetAllConfirm': 'This deletes all characters, places and events, then returns to step 1. The event flow and target volumes will also be cleared. Continue?',
        'step2.resetKindConfirm': 'This deletes all {0} items. The event flow and target volumes will also be cleared. Continue?',
        'step2.deleteItemConfirm': 'Delete "{0}"? The event flow and target volumes will also be cleared. Continue?',
        'step2.newItem': 'New item',

        'step3.title': 'Event flow',
        'step3.guide': 'Drag items to reorder, or delete them.',
        'step3.generate': 'Generate event flow',
        'step3.empty': 'No event flow yet. Press "Generate event flow".',
        'step3.confirmRegen': 'The existing flow will be replaced. Continue?',
        'step3.targetVolumes': 'Target volumes',
        'step3.targetGuide': 'Choose how many volumes the whole story will have before generating the event flow. The AI will plan turning points and flow around this count.',
        'step3.setTarget': 'Set target volumes',
        'step3.targetChangeConfirm': 'Changing target volumes clears the current event flow. You will need to regenerate it for the new target. Continue?',
        'step3.main': 'main',
        'step3.count': '{0} events',
        'step3.next': 'Go to step 4',
        'step3.prev': 'Back to step 2',
        'step3.deleteConfirm': 'Remove this event from the list?',
        'step3.hasBooks': 'Outline regeneration, event flow and volume count are locked to preserve books. Delete all books from the last volume first to unlock them.',

        'step4.title': 'Books',
        'step4.newBook': 'Create next book',
        'step4.allBooks': 'Create all remaining books',
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
        'step4.cancelling': 'Stopping after saving the current response...',
        'step4.done': '{0} finished.',
        'step4.allDone': 'All {0} volumes have been generated.',
        'step4.selectBook': 'Pick a book above to read or edit it.',
        'step4.volumeOf': 'Volume {0}',
        'step4.exportBook': 'Export this book',
        'step4.exportFormatTitle': 'Book export format',
        'step4.exportFormatGuide': 'Choose the file format to save.',
        'step4.exportTxt': 'TXT file',
        'step4.exportPdf': 'PDF file',
        'step4.exportPdfChecking': 'Checking the PDF library connection...',
        'step4.exportPdfUnavailable': 'The PDF library is unavailable right now.',
        'step4.exportStart': 'Export',
        'step4.exportTxtDone': 'TXT file exported.',
        'step4.exportPdfDone': 'PDF file exported.',
        'step2.needDetails': 'Save details for all characters, places and major events to unlock step 3.',
        'step4.resume': 'Resume unfinished book',
        'step4.paused': 'Progress for {0} saved. Resume to continue.',
        'step4.status.paused': 'Paused',
        'step4.status.writing': 'Writing / resumable',
        'step4.status.error': 'Error / resumable',
        'step4.status.complete': 'Complete',
        'step4.lengthProgress': '{0} chars / target {1} chars',
        'step4.saveOrganize': 'Save and reconcile later books',
        'step4.organizingTitle': 'Reconciling later books',
        'step4.organizing': '{0} / {1} : {2}',
        'step4.organizeDone': 'Reconciled {1} chapter(s) across {0} later book(s) for the change.',
        'step4.organizeNone': 'There are no later books to reconcile. The change was saved.',
        'step4.organizeStopped': 'Reconciliation stopped. Already reconciled text was saved.',
        'step4.costGuide': 'Reaching 100k–150k characters takes multiple requests. Short responses require more writing. Each run stops after at most 120 requests, preserving progress.',
        'chat.title': 'AI chat',
        'chat.placeholder': 'Ask about this screen or request a task. (Enter to send, Shift+Enter for a new line)',
        'chat.send': 'Send',
        'chat.reset': 'Reset chat',
        'chat.resetConfirm': 'This clears the whole conversation. Continue?',
        'chat.close': 'Close',
        'chat.empty': 'Chat with the connected AI. It receives the current screen and what you typed, and can run the screen actions you ask for.',
        'chat.thinking': 'The AI is thinking...',
        'chat.usingTool': 'Running tool: {0}',
        'chat.failed': 'The chat request failed.',
        'chat.working': 'Working:',
        'progress.aiLive': 'Working on the server · {0}s elapsed (connection alive)',
        'progress.aiSilent': 'Waiting for the server · {0}s elapsed',
        'progress.aiLocal': '{0}s elapsed',
        'backup.button': 'Back up',
        'backup.title': 'Back up project',
        'backup.hint': 'Downloads everything in this project (description, world-building, event flow, book text, AI chat) as a JSON file. Settings screen values are not included.',
        'backup.done': 'Backup file downloaded.',
        'restore.button': 'Restore',
        'restore.title': 'Restore project',
        'restore.nameLabel': 'New project name',
        'restore.summary': 'Backed up name: {0} / {1} book(s) / {2} chat message(s). This adds a new project and never overwrites an existing one.',
        'restore.badFile': 'Could not read the backup file.',
        'restore.done': 'Restored the project {0}.',
        'chat.mcpOn': 'MCP connected',
        'chat.webmcpOn': 'WebMCP',
        'chat.mcpOnHint': 'Connected to the backend MCP server, so external MCP clients can use the tools on this screen.',
        'chat.webmcpOnHint': 'Tools are registered with the WebMCP standard API of this browser.',
        'chat.webmcpOffHint': 'This browser does not support the WebMCP standard. Chat and tools still work, and window.WorldWriterWebMCP exposes the tools inside the page.',
        'tool.needProject': 'Open a project first.',
        'tool.noProject': 'Project not found: {0}',
        'tool.noBook': 'Book not found: {0}',
        'tool.noBooks': 'There is no book to delete.',
        'tool.noItem': 'Item not found: {0}',
        'tool.noFlow': 'Event not found: {0}',
        'tool.noChapter': 'Chapter not found: {0}',
        'tool.needBook': 'Select a book first.',
        'tool.needTarget': 'Set the target volume count first.',
        'tool.badKind': 'Unknown item kind: {0}',
        'tool.badStep': 'The step must be between 1 and 4.',
        'tool.stepLocked': 'Step {0} is still locked. Finish the earlier steps first.',
        'tool.badLanguage': 'The language must be ko or en.',
        'tool.busy': 'Another generation task is already running.',
        'tool.finished': 'Done.',
        'tool.outlineDone': 'Generated the world-building lists.',
        'tool.detailDone': 'Generated the detail.',
        'tool.detailAllDone': 'Generated {0} details.',
        'tool.flowDone': 'Generated {0} events.',
        'tool.reviseDone': 'Finished revising {0}.',
        'tool.bookDone': 'Finished {0}. (status: {1})'
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

/**
 * `appendChild` 작업을 수행한다.
 */
function appendChild(parent, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) {
        child.forEach(function (c) { appendChild(parent, c); });
        return;
    }
    parent.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
}

/**
 * `clearNode` 작업을 수행한다.
 */
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

/**
 * `formatNumber` 작업을 수행한다.
 */
function formatNumber(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * `formatDate` 작업을 수행한다.
 */
function formatDate(ms) {
    const d = new Date(ms);
    const pad = function (n) { return n < 10 ? '0' + n : String(n); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
        + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

/* ------------------------------------------------------------------ *
 *  스타일
 * ------------------------------------------------------------------ */

/**
 * `STYLE_ID` 선언이 담당하는 값을 보관한다.
 */
const STYLE_ID = 'worldwriter-style';

/**
 * `CSS` 선언이 담당하는 값을 보관한다.
 */
const CSS = `
.ww-app {
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
.ww-sidebar { display: flex; flex-direction: column; }
.ww-side-steps { flex: 1; min-height: 0; overflow-y: auto; }
.ww-side-tools {
    border-top: 1px solid var(--ww-border); padding-top: 10px; margin-top: 10px;
    display: flex; flex-direction: column; gap: 6px; flex: 0 0 auto;
}
.ww-side-tools .ww-btn { width: 100%; text-align: left; }
.ww-main h2 { margin: 0 0 6px 0; font-size: 18px; }
.ww-guide { color: var(--ww-text-dim); font-size: 13px; margin: 0 0 16px 0; line-height: 1.6; }
.ww-actions { display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0; align-items: center; }
.ww-spacer { flex: 1; }

/* 2단계 */
.ww-groups { display: flex; flex-direction: column; gap: 20px; }
.ww-group { min-width: 0; }
.ww-group-title { font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
.ww-group-actions { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; }
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
.ww-progress-live { margin-top: 8px; font-size: 12px; color: var(--ww-text-dim); min-height: 16px; }
.ww-bar { height: 8px; border-radius: 4px; background: var(--ww-panel-2); overflow: hidden; margin-top: 10px; }
.ww-bar > div { height: 100%; background: var(--ww-accent); width: 0%; transition: width 0.25s; }

.ww-toast {
    position: fixed; left: 50%; bottom: 26px; transform: translateX(-50%);
    background: var(--ww-panel); color: var(--ww-text); border: 1px solid var(--ww-border);
    box-shadow: var(--ww-shadow); padding: 11px 18px; border-radius: 8px; z-index: 1100;
    max-width: 80vw; line-height: 1.5;
}

/* --- AI 채팅 사이드바 --- */
.ww-shell { display: flex; align-items: stretch; min-height: 100vh; }
.ww-shell-main { flex: 1; min-width: 0; }
.ww-chat {
    width: 360px; flex: 0 0 360px; height: 100vh; position: sticky; top: 0;
    display: flex; flex-direction: column;
    background: var(--ww-panel); border-left: 1px solid var(--ww-border);
}
.ww-chat-head {
    display: flex; align-items: center; gap: 8px; padding: 10px 12px;
    border-bottom: 1px solid var(--ww-border); flex: 0 0 auto;
}
.ww-chat-title { font-weight: 600; flex: 1; }
.ww-chat-badge { font-size: 11px; color: var(--ww-text-dim); }
.ww-chat-icon {
    border: 1px solid var(--ww-border); background: var(--ww-panel); color: var(--ww-text);
    width: 30px; height: 30px; border-radius: 6px; cursor: pointer; font-size: 14px;
    font-family: inherit; line-height: 1; padding: 0;
}
.ww-chat-icon:hover { background: var(--ww-panel-2); }
.ww-chat-list { flex: 1; overflow-y: auto; padding: 12px; min-height: 0; }
.ww-chat-empty { color: var(--ww-text-dim); font-size: 12.5px; line-height: 1.7; }
.ww-chat-msg { margin-bottom: 10px; display: flex; }
.ww-chat-msg.user { justify-content: flex-end; }
.ww-chat-msg.tool {
    display: block; font-size: 11.5px; color: var(--ww-text-dim);
    background: var(--ww-panel-2); border-radius: 6px; padding: 6px 8px;
    word-break: break-word; line-height: 1.5;
}
.ww-chat-tool-name { font-weight: 600; }
.ww-chat-bubble {
    max-width: 88%; padding: 9px 11px; border-radius: 10px; line-height: 1.65;
    white-space: pre-wrap; word-break: break-word; background: var(--ww-panel-2);
}
.ww-chat-msg.user .ww-chat-bubble { background: var(--ww-accent); color: var(--ww-accent-text); }
.ww-chat-status { padding: 0 12px 6px 12px; font-size: 12px; color: var(--ww-text-dim); min-height: 18px; }
.ww-chat-foot { border-top: 1px solid var(--ww-border); padding: 10px 12px; flex: 0 0 auto; }
.ww-chat-input {
    width: 100%; resize: vertical; min-height: 46px; padding: 8px 10px;
    border: 1px solid var(--ww-border); border-radius: 7px;
    background: var(--ww-bg); color: var(--ww-text); font-family: inherit; font-size: 13px; line-height: 1.6;
}
.ww-chat-buttons { display: flex; gap: 6px; align-items: center; margin-top: 8px; }
.ww-chat-buttons .ww-btn { flex: 1; }
.ww-chat-open {
    position: fixed; right: 18px; bottom: 18px; z-index: 900;
    width: 46px; height: 46px; border-radius: 50%; cursor: pointer; font-size: 19px;
    border: 1px solid var(--ww-border); background: var(--ww-panel); color: var(--ww-text);
    box-shadow: var(--ww-shadow);
}
.ww-chat-open:hover { background: var(--ww-panel-2); }

@media (max-width: 900px) {
    .ww-chat { width: 300px; flex-basis: 300px; }
}

@media (max-width: 720px) {
    .ww-sidebar { width: 150px; flex-basis: 150px; }
    .ww-main { padding: 16px 14px 50px 14px; }
    .ww-step { font-size: 12.5px; padding: 9px 8px; }
}
`;

/**
 * `injectStyle` 작업을 수행한다.
 */
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

/**
 * `state` 선언이 담당하는 값을 보관한다.
 */
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
    cancelRequested: false,
    titleProgress: null,
    pdfStatus: 'idle',       // idle | checking | ready | unavailable
    jsPDF: null
};

/**
 * `USER_KEY` 선언이 담당하는 값을 보관한다.
 */
const USER_KEY = 'ww.currentUser';

/** 4단계에서 필요할 때만 불러오는 jsPDF ES 모듈 CDN 주소 */
const JSPDF_CDN_URL = 'https://cdn.jsdelivr.net/npm/jspdf@4.2.1/dist/jspdf.es.min.js';

/**
 * 현재 화면과 알려진 작업 진행률을 브라우저 창 제목에 반영한다.
 * @returns {string} 적용한 브라우저 창 제목
 */
function updateDocumentTitle() {
    const base = (state.screen === 'workspace' && state.project)
        ? state.project.name + ' - World Writer'
        : 'World Writer';
    const progress = state.titleProgress && state.titleProgress.percent;
    const title = Number.isFinite(progress) ? Math.round(progress) + '% - ' + base : base;
    if (typeof document !== 'undefined') document.title = title;
    return title;
}

/* ------------------------------------------------------------------ *
 *  공통 대화상자
 * ------------------------------------------------------------------ */

/**
 * `openOverlay` 작업을 수행한다.
 */
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

/**
 * `closeOverlay` 작업을 수행한다.
 */
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
                h('button.ww-btn', { text: t('common.cancel'),
                    /** 확인 대화상자를 취소 결과로 닫는다. */
                    onClick: function () { finish(false); } }),
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
                h('button.ww-btn', { text: t('common.cancel'),
                    /** 입력 대화상자를 값 없이 닫는다. */
                    onClick: function () { finish(null); } }),
                h('button.ww-btn.primary', { text: options.confirmLabel || t('common.ok'), onClick: submit })
            ));
        overlay = openOverlay(modal, { onClose: function () { finish(null); } });
        setTimeout(
            /** 대화상자가 표시된 다음 입력 필드에 초점을 맞춘다. */
            function () { field.focus(); }, 0);
    });
}

/** 잠시 떴다 사라지는 알림 */
function toast(message) {
    const node = h('div.ww-toast', { text: message });
    state.root.appendChild(node);
/**
 * `setTimeout` 작업을 수행한다.
 */
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
    // 서버 모드에서는 AI 작업이 살아 있는지 함께 보여 준다. (오래 걸리는 호출 확인용)
    const liveLine = h('div.ww-progress-live', {});
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
        h('div.ww-modal-body', {}, line, opts.showBar === false ? null : barWrap, liveLine),
        opts.onCancel ? foot : null);

    const overlay = openOverlay(modal, { closeOnBackdrop: false });
    const titleToken = {};

    const startedAt = Date.now();
    const tick = setInterval(function () {
        liveLine.textContent = liveStatusText(startedAt);
    }, 1000);

    return {
        setText: function (text) { line.textContent = text; },
        setProgress: function (current, total) {
            const percent = total > 0 ? Math.max(0, Math.min(100, Math.round(current / total * 100))) : 0;
            bar.style.width = percent + '%';
            state.titleProgress = { token: titleToken, percent: percent };
            updateDocumentTitle();
        },
        close: function () {
            clearInterval(tick);
            closeOverlay(overlay);
            if (state.titleProgress && state.titleProgress.token === titleToken) {
                state.titleProgress = null;
                updateDocumentTitle();
            }
        }
    };
}

/**
 * 진행 중인 작업이 살아 있는지 알려 주는 한 줄을 만든다.
 * 서버 모드에서는 백엔드가 WebSocket 으로 보내는 진행 알림을 기준으로 표시한다.
 * @param {number} startedAt 작업 시작 시각(ms)
 * @returns {string} 표시할 문구
 */
function liveStatusText(startedAt) {
    const seconds = Math.round((Date.now() - startedAt) / 1000);
    if (seconds < 3) return '';

    const jobs = AiSocket.status();
    if (jobs.length === 0) return t('progress.aiLocal', seconds);

    // 마지막 알림을 받은 지 얼마 안 됐으면 연결이 살아 있는 것이다.
    const freshest = jobs.reduce(function (best, job) {
        return (best === null || job.since < best.since) ? job : best;
    }, null);
    const alive = freshest.since < ((AiSocket.info && AiSocket.info.heartbeatMs) || 15000) * 2;
    return t(alive ? 'progress.aiLive' : 'progress.aiSilent', seconds);
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

/**
 * `applyTheme` 작업을 수행한다.
 */
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

/**
 * `renderLogin` 작업을 수행한다.
 */
function renderLogin() {
    updateDocumentTitle();
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
            // 사용자별 저장소가 정해진 뒤에 대화 기록을 읽고 백엔드 MCP 에 연결한다.
            Chat.loaded = false;
            try { await Chat.load(); } catch (chatError) { console.error(chatError); }
            WebMcp.connectBackend().catch(function (mcpError) { console.warn(mcpError); });
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
/**
 * `setTimeout` 작업을 수행한다.
 */
    setTimeout(function () { input.focus(); }, 0);
}

/* ------------------------------------------------------------------ *
 *  2) 초기 화면 (프로젝트 목록)
 * ------------------------------------------------------------------ */

/**
 * 홈 화면에 보여줄 저장 위치 안내 문구를 만든다.
 * 접속 위치와 관계없이 어디에 저장되는지만 간략히 알린다.
 * 서버의 실제 경로는 화면에 표시하지 않는다.
 * @param {string} mode 실행 환경 (local | server | desktop)
 * @returns {string} 안내 문구
 */
function storageNoteText(mode) {
    if (mode === 'desktop') return t('home.storageDesktop');
    if (mode === 'server') return t('home.storageServer');
    return t('home.storageLocal');
}

/**
 * `goHome` 작업을 수행한다.
 */
async function goHome() {
    state.screen = 'home';
    state.project = null;
    state.projects = await Projects.list();
    // 홈에서는 프로젝트에 매이지 않는 공용 대화를 쓴다.
    await useChatScope('');
    renderHome();
}

/** 채팅 범위를 현재 화면에 맞춘다. 실패해도 화면 이동은 막지 않는다. */
async function useChatScope(projectId) {
    try {
        await Chat.setScope(projectId);
    } catch (e) {
        console.error(e);
        Chat.history = [];
    }
    renderChatPanel();
}

/**
 * `renderHome` 작업을 수행한다.
 */
function renderHome() {
    updateDocumentTitle();
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
    const storageNote = storageNoteText(Env.mode);

    const view = h('div.ww-home', {},
        h('div.ww-home-head', {},
            h('h2', { text: t('home.projects') }),
            h('button.ww-btn.primary', { text: t('home.new'), onClick: createProject }),
            h('button.ww-btn', { text: t('restore.button'), onClick: restoreProject }),
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

/**
 * `createProject` 작업을 수행한다.
 */
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

/**
 * `openProject` 작업을 수행한다.
 */
async function openProject(projectId) {
    try {
        const project = await Projects.load(projectId);
        state.project = project;
        state.screen = 'workspace';
        // 대화 기록은 프로젝트마다 따로 보관하며 백업에 함께 담긴다.
        await useChatScope(project.id);
        // 마지막으로 진행된 지점을 열어준다.
        if (project.books.length > 0) state.step = 4;
        else if (project.flow.length > 0) state.step = 3;
        else if (ITEM_KINDS.some(function (k) { return project[k].length > 0; })) state.step = 2;
        else state.step = 1;
        state.step = Math.min(state.step, Projects.maxStep(project));
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

/**
 * `openSettings` 작업을 수행한다.
 */
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

/**
 * `renderWorkspace` 작업을 수행한다.
 */
function renderWorkspace() {
    updateDocumentTitle();
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

    // 단계 메뉴 아래쪽에 프로젝트 단위 도구를 모아 둔다.
    const sideTools = h('div.ww-side-tools', {},
        h('button.ww-btn.small', {
            text: '⭳ ' + t('backup.button'),
            title: t('backup.hint'),
            onClick: backupProject
        }));

    const sidebar = h('div.ww-sidebar', {},
        h('div.ww-side-steps', {},
            steps,
            maxStep < 4 ? h('div.ww-step-note', { text: t('step.locked') }) : null),
        sideTools);

    const main = h('div.ww-main', {});
    if (state.step === 1) renderStep1(main);
    else if (state.step === 2) renderStep2(main);
    else if (state.step === 3) renderStep3(main);
    else renderStep4(main);

    mount(h('div.ww-workspace', {}, toolbar, h('div.ww-body', {}, sidebar, main)));
}

/**
 * 텍스트를 파일로 내려받는다. (책 내보내기와 프로젝트 백업이 함께 쓴다)
 * @param {string} fileName 저장할 파일 이름
 * @param {string} text 파일 내용
 * @param {string} [mime] 파일 형식
 */
function downloadText(fileName, text, mime) {
    const blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = h('a', { href: url, download: fileName });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
/**
 * `setTimeout` 작업을 수행한다.
 */
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

/** jsPDF CDN 모듈을 실제로 불러와 PDF 내보내기 가능 여부를 확인한다. */
async function ensurePdfAvailable() {
    if (state.pdfStatus === 'ready') return true;
    if (state.pdfStatus === 'checking') return false;
    state.pdfStatus = 'checking';
    try {
        // jsPDF 공식 ES 모듈 형식의 named export를 사용한다.
        const module = await import(JSPDF_CDN_URL);
        if (typeof module.jsPDF !== 'function') throw new Error('jsPDF export is unavailable');
        state.jsPDF = module.jsPDF;
        state.pdfStatus = 'ready';
        return true;
    } catch (error) {
        console.warn('jsPDF CDN에 연결할 수 없습니다.', error);
        state.pdfStatus = 'unavailable';
        return false;
    } finally {
        // 확인 완료 후 현재 4단계 화면의 PDF 선택 상태를 즉시 갱신한다.
        if (state.screen === 'workspace' && state.step === 4) renderWorkspace();
    }
}

/** 캔버스 폭에 맞게 텍스트를 줄 단위로 나눈다. 한글 글리프도 안전하게 다룬다. */
function wrapPdfText(context, text, maxWidth) {
    const lines = [];
    let line = '';
    for (const char of String(text || '')) {
        if (char === '\n') {
            lines.push(line);
            line = '';
        } else if (!line || context.measureText(line + char).width <= maxWidth) {
            line += char;
        } else {
            lines.push(line);
            line = char;
        }
    }
    lines.push(line);
    return lines;
}

/**
 * 한글을 포함한 본문을 브라우저 글꼴로 페이지 이미지화해 PDF로 저장한다.
 * jsPDF 기본 14개 글꼴은 UTF-8 글리프를 보장하지 않으므로, 텍스트를 캔버스에 그려
 * 어떤 시스템 글꼴 환경에서도 깨지지 않는 PDF 페이지로 넣는다.
 */
async function downloadBookPdf(project, book) {
    if (state.pdfStatus !== 'ready' || typeof state.jsPDF !== 'function') {
        throw new Error(t('step4.exportPdfUnavailable'));
    }
    const pageWidth = 1240;
    const pageHeight = 1754;
    const margin = 92;
    const lineHeight = 30;
    const canvas = document.createElement('canvas');
    canvas.width = pageWidth;
    canvas.height = pageHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('PDF canvas context is unavailable.');
    context.font = '18px "Malgun Gothic", "Apple SD Gothic Neo", "Segoe UI", sans-serif';
    const lines = wrapPdfText(context, book.title + '\n\n' + Books.toPlainText(book), pageWidth - margin * 2);
    const linesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);
    const pdf = new state.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

    for (let start = 0, page = 0; start < lines.length; start += linesPerPage, page++) {
        if (page > 0) pdf.addPage();
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, pageWidth, pageHeight);
        context.fillStyle = '#1d2129';
        context.textBaseline = 'top';
        context.font = '18px "Malgun Gothic", "Apple SD Gothic Neo", "Segoe UI", sans-serif';
        lines.slice(start, start + linesPerPage).forEach(function (line, index) {
            context.fillText(line, margin, margin + index * lineHeight);
        });
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        // 긴 소설도 브라우저 렌더링이 멈추지 않도록 페이지마다 제어권을 돌려준다.
        await new Promise(function (resolve) { setTimeout(resolve, 0); });
    }
    pdf.save(project.name + ' - ' + book.title + '.pdf');
}

/** TXT/PDF 중 원하는 책 내보내기 형식을 고르는 레이어를 연다. */
function openBookExportDialog(project, book) {
    let overlay;
    const pdfReady = state.pdfStatus === 'ready';
    const format = h('select.ww-select', {},
        h('option', { value: 'txt', text: t('step4.exportTxt') }),
        h('option', { value: 'pdf', text: t('step4.exportPdf'), disabled: !pdfReady }));
    const hint = h('div.ww-hint', {
        text: pdfReady ? '' : t(state.pdfStatus === 'unavailable' ? 'step4.exportPdfUnavailable' : 'step4.exportPdfChecking')
    });
    const close = function () { closeOverlay(overlay); };
    const exportBook = async function () {
        const selected = format.value;
        close();
        try {
            if (selected === 'pdf') {
                await withProgress(t('step4.exportFormatTitle'), book.title, async function () {
                    await downloadBookPdf(project, book);
                });
                toast(t('step4.exportPdfDone'));
            } else {
                downloadText(project.name + ' - ' + book.title + '.txt', Books.toPlainText(book), 'text/plain');
                toast(t('step4.exportTxtDone'));
            }
        } catch (error) {
            await showError(error);
        }
    };
    const modal = h('div.ww-modal', {},
        h('div.ww-modal-head', { text: t('step4.exportFormatTitle') }),
        h('div.ww-modal-body', {},
            h('div.ww-modal-message', { text: t('step4.exportFormatGuide') }),
            format, hint),
        h('div.ww-modal-foot', {},
            h('button.ww-btn', { text: t('common.cancel'), onClick: close }),
            h('button.ww-btn.primary', { text: t('step4.exportStart'), onClick: exportBook })));
    overlay = openOverlay(modal, { onClose: close });
}

/**
 * 파일 선택 창을 띄워 텍스트 파일 하나를 읽는다.
 * @param {string} accept 허용할 확장자/형식
 * @returns {Promise<{name: string, text: string}|null>} 고른 파일. 취소하면 null
 */
function pickTextFile(accept) {
    return new Promise(function (resolve) {
        const input = h('input', { type: 'file', accept: accept || '', style: { display: 'none' } });
        let settled = false;
        const finish = function (value) {
            if (settled) return;
            settled = true;
            if (input.parentNode) input.parentNode.removeChild(input);
            resolve(value);
        };
        input.addEventListener('change', function () {
            const file = input.files && input.files[0];
            if (!file) { finish(null); return; }
            const reader = new FileReader();
            reader.onload = function () { finish({ name: file.name, text: String(reader.result || '') }); };
            reader.onerror = function () { finish(null); };
            reader.readAsText(file, 'utf-8');
        });
        // 취소를 감지할 수 없는 브라우저도 있으므로 창 복귀 시에도 정리한다.
        input.addEventListener('cancel', function () { finish(null); });
        document.body.appendChild(input);
        input.click();
    });
}

/** 현재 프로젝트 전체를 JSON 파일로 내려받는다. */
async function backupProject() {
    const project = state.project;
    if (!project) return;
    try {
        await Projects.save(project);
        const data = await withProgress(t('backup.title'), t('common.working'), async function () {
            return await Backup.create(project.id);
        });
        downloadText(Backup.fileName(project, data.exportedAt), JSON.stringify(data), 'application/json');
        toast(t('backup.done'));
    } catch (e) {
        await showError(e);
    }
}

/** 백업 파일을 골라 새 프로젝트로 복원한다. */
async function restoreProject() {
    const picked = await pickTextFile('application/json,.json');
    if (!picked) return;

    let data;
    try {
        data = Backup.validate(JSON.parse(picked.text));
    } catch (e) {
        await showAlert(t('restore.title'), t('restore.badFile') + '\n' + ((e && e.message) ? e.message : String(e)));
        return;
    }

    // 복원 전에 이름을 바꿀 기회를 준다.
    const name = await showPrompt({
        title: t('restore.title'),
        label: t('restore.nameLabel'),
        hint: t('restore.summary', data.project.name, (data.books || []).length, ((data.chat || {}).messages || []).length),
        value: data.project.name
    });
    if (name === null) return;

    try {
        const project = await withProgress(t('restore.title'), t('common.working'), async function () {
            return await Backup.restore(data, name);
        });
        await goHome();
        toast(t('restore.done', project.name));
    } catch (e) {
        await showError(e);
    }
}

/** 프로젝트를 저장하고 화면을 다시 그린다. */
async function saveProject(rerenderAfter) {
    await Projects.save(state.project);
    if (rerenderAfter !== false) renderWorkspace();
}

/* --------------------------- 1단계 --------------------------- */

/**
 * `renderStep1` 작업을 수행한다.
 */
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
        project.books.length > 0 ? h('p.ww-guide', { text: t('step3.hasBooks') }) : null,
        textarea,
        h('div.ww-actions', {},
            h('button.ww-btn.primary', { text: t('step1.generate'), disabled: project.books.length > 0, onClick: generate }),
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

/**
 * 2단계의 지정한 종류에 빈 설정 항목을 추가하고 곧바로 편집 상태로 연다.
 * @param {string} kind characters | places | events
 * @returns {Promise<void>}
 */
async function addStep2Item(kind) {
    const project = state.project;
    try {
        const item = await Projects.addItem(project, kind, { name: t('step2.newItem') });
        await Projects.save(project);
        state.openItems[item.id] = true;
        renderWorkspace();
    } catch (error) {
        await showError(error);
    }
}

/**
 * 2단계의 지정한 종류 또는 전체 설정을 확인 후 초기화한다.
 * @param {string} [kind] characters | places | events. 생략하면 전체
 * @returns {Promise<void>}
 */
async function resetStep2Items(kind) {
    const project = state.project;
    const all = !kind;
    const label = all ? t('step2.resetAll') : KIND_LABELS[kind];
    const message = all ? t('step2.resetAllConfirm') : t('step2.resetKindConfirm', label);
    const confirmed = await showConfirm(label, message, t('common.reset'), true);
    if (!confirmed) return;
    try {
        await Projects.clearItems(project, kind);
        await Projects.save(project);
        state.openItems = {};
        if (all || !ITEM_KINDS.some(function (entry) { return project[entry].length > 0; })) state.step = 1;
        renderWorkspace();
    } catch (error) {
        await showError(error);
    }
}

/**
 * `renderStep2` 작업을 수행한다.
 */
function renderStep2(main) {
    const project = state.project;

    const totalItems = ITEM_KINDS.reduce(function (sum, k) { return sum + project[k].length; }, 0);
    const detailed = ITEM_KINDS.reduce(function (sum, k) {
        return sum + project[k].filter(function (i) { return !WorldWriter.util.isBlank(i.detail); }).length;
    }, 0);

    const groups = ITEM_KINDS.map(function (kind) {
        const items = project[kind];
        const rows = items.map(function (item) { return renderStep2Item(kind, item); });
        return h('section.ww-group', {},
            h('div.ww-group-title', {},
                h('span', { text: KIND_LABELS[kind] }),
                h('span.ww-badge', { text: String(items.length) }),
                h('div.ww-group-actions', {},
                    h('button.ww-btn.small', {
                        text: t('common.add'),
                        title: t('step2.addItem'),
                        onClick: function () { addStep2Item(kind); }
                    }),
                    h('button.ww-btn.small.danger', {
                        text: t('common.reset'),
                        disabled: items.length === 0,
                        onClick: function () { resetStep2Items(kind); }
                    }))),
            rows.length > 0 ? rows : h('div.ww-hint', { text: '-' }));
    });

    appendChild(main, [
        h('h2', { text: t('step2.title') }),
        h('p.ww-guide', { text: t('step2.guide') + ' (' + t('step2.progress', detailed, totalItems) + ')' }),
        h('div.ww-actions', {},
            h('button.ww-btn', { text: t('step2.prev'),
                /** 이전 단계 화면으로 이동한다. */
                onClick: function () { state.step = 1; renderWorkspace(); } }),
            h('button.ww-btn', { text: t('step2.detailAll'), onClick: generateAllDetails }),
            h('button.ww-btn.danger', {
                text: t('step2.resetAll'),
                disabled: totalItems === 0,
                onClick: function () { resetStep2Items(); }
            }),
            h('div.ww-spacer', {}),
            h('button.ww-btn.primary', {
                text: t('step2.next'),
                disabled: !Projects.detailsComplete(project),
                onClick: async function () {
                    if (!Projects.detailsComplete(project)) return;
                    try {
                        await Projects.save(project);
                        state.step = 3;
                        renderWorkspace();
                    } catch (e) { await showError(e); }
                }
            })),
        totalItems === 0 ? h('p.ww-guide', { text: t('step2.empty') })
            : (!Projects.detailsComplete(project) ? h('p.ww-guide', { text: t('step2.needDetails') }) : null),
        h('div.ww-groups', {}, groups)
    ]);
}

/**
 * `renderStep2Item` 작업을 수행한다.
 */
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
            }),
            h('button.ww-btn.danger', {
                text: t('common.delete'),
                onClick: async function () {
                    const confirmed = await showConfirm(
                        t('common.delete'),
                        t('step2.deleteItemConfirm', item.name || t('step2.newItem')),
                        t('common.delete'),
                        true
                    );
                    if (!confirmed) return;
                    try {
                        await Projects.removeItem(project, kind, item.id);
                        await Projects.save(project);
                        delete state.openItems[item.id];
                        if (!ITEM_KINDS.some(function (entry) { return project[entry].length > 0; })) state.step = 1;
                        renderWorkspace();
                    } catch (error) {
                        await showError(error);
                    }
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

/**
 * `renderStep3` 작업을 수행한다.
 */
function renderStep3(main) {
    const project = state.project;
    const hasTarget = Number.isSafeInteger(project.targetVolumes) && project.targetVolumes > 0;

    const setTarget = async function () {
        const value = await showPrompt({
            title: t('step3.setTarget'),
            label: t('step3.targetVolumes'),
            hint: t('step3.targetGuide'),
            type: 'number',
            value: project.targetVolumes || 3
        });
        if (value === null) return;
        let count;
        try { count = Projects.validateFlowTarget(project, value); }
        catch (error) { await showError(error); return; }
        if (project.flow.length > 0 && project.targetVolumes !== count) {
            const confirmed = await showConfirm(t('step3.setTarget'), t('step3.targetChangeConfirm'), t('common.regenerate'), true);
            if (!confirmed) return;
        }
        try {
            await Projects.setTargetVolumes(project, count);
            await saveProject();
        } catch (error) {
            await showError(error);
        }
    };

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
        h('p.ww-guide', { text: t('step3.targetGuide') }),
        h('div.ww-actions', {},
            h('button.ww-btn', { text: t('step3.prev'),
                /** 설정 검토 단계 화면으로 이동한다. */
                onClick: function () { state.step = 2; renderWorkspace(); } }),
            h('button.ww-btn.small', {
                text: t('step3.setTarget'),
                disabled: project.books.length > 0,
                onClick: setTarget
            }),
            h('span.ww-badge', {
                text: t('step3.targetVolumes') + ': ' + (hasTarget ? project.targetVolumes : '-')
            }),
            h('button.ww-btn' + (project.flow.length === 0 ? '.primary' : ''), {
                text: project.flow.length === 0 ? t('step3.generate') : t('common.regenerate'),
                disabled: project.books.length > 0 || !Projects.detailsComplete(project) || !hasTarget,
                onClick: generate
            }),
            h('span.ww-badge', { text: t('step3.count', project.flow.length) }),
            h('div.ww-spacer', {}),
            h('button.ww-btn.primary', {
                text: t('step3.next'),
                disabled: project.flow.length === 0 || !hasTarget,
                onClick: function () { state.step = 4; renderWorkspace(); }
            }))
    ];

    if (project.flow.length === 0) {
        appendChild(main, header.concat([h('div.ww-empty', { text: t('step3.empty') })]));
        return;
    }

    appendChild(main, header.concat([renderFlowList()]));
}

/**
 * `renderFlowList` 작업을 수행한다.
 */
function renderFlowList() {
    const project = state.project;
    const container = h('div.ww-flow', {});
    let dragFrom = -1;

    project.flow.forEach(function (item, index) {
        const row = h('div.ww-flow-item', { draggable: project.books.length === 0 },
            h('span.ww-grip', { text: '☰' }),
            h('span.ww-flow-no', { text: String(index + 1) }),
            h('div.ww-flow-text', {},
                h('div.ww-flow-title', {},
                    item.title,
                    item.main ? h('span.ww-badge.on', { text: t('step3.main'), style: { marginLeft: '6px' } }) : null),
                h('div.ww-flow-summary', { text: item.summary || '' })),
            h('button.ww-btn.small.danger', {
                text: t('common.delete'),
                disabled: project.books.length > 0,
                onClick: async function (ev) {
                    ev.stopPropagation();
                    if (project.books.length > 0) return;
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
            if (project.books.length > 0) return;
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

/**
 * `renderStep4` 작업을 수행한다.
 */
function renderStep4(main) {
    const project = state.project;
    // PDF 선택지는 처음에는 비활성화하고, 4단계에 들어온 뒤 CDN 모듈을 확인해 켠다.
    if (state.pdfStatus === 'idle') ensurePdfAvailable();
    const hasTarget = (project.targetVolumes || 0) > 0;
    const unfinished = project.books.find(meta => meta.status && meta.status !== 'complete');
    const allDone = hasTarget && project.books.length >= project.targetVolumes && !unfinished;

    const header = [
        h('h2', { text: t('step4.title') }),
        h('p.ww-guide', { text: t('step4.costGuide') }),
        h('div.ww-actions', {},
            h('button.ww-btn', { text: t('step3.title'),
                /** 사건 흐름 단계 화면으로 이동한다. */
                onClick: function () { state.step = 3; renderWorkspace(); } }),
            h('span.ww-badge', {
                text: t('step3.targetVolumes') + ': ' + (hasTarget ? project.targetVolumes : '-')
            }),
            h('div.ww-spacer', {}),
            h('button.ww-btn.primary', {
                text: t('step4.allBooks'), disabled: allDone,
                onClick: generateAllBooks
            }),
            unfinished
                ? h('button.ww-btn', { text: t('step4.resume'), onClick: resumeLastBook })
                : h('button.ww-btn', { text: t('step4.newBook'), disabled: allDone, onClick: generateFollowingBook }),
            project.books.length > 0
                ? h('button.ww-btn.danger', { text: t('step4.deleteLast'), onClick: deleteLastBook })
                : null)
    ];

    if (allDone) {
        header.push(h('p.ww-guide', { text: t('step4.allDone', project.targetVolumes) }));
    }

    const tabs = h('div.ww-books', {}, project.books.map(function (meta) {
        return h('button.ww-book-tab' + (state.currentBookId === meta.id ? '.active' : ''), {
            text: meta.title + ' (' + t('step4.bookInfo', meta.chapterCount, formatNumber(meta.charCount)) + ') — ' + t('step4.status.' + (meta.status || 'complete')),
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

/**
 * `selectBook` 작업을 수행한다.
 */
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

/**
 * `renderBookEditor` 작업을 수행한다.
 */
function renderBookEditor() {
    const project = state.project;
    const book = state.currentBook;
    const index = Math.min(state.currentChapterIndex, Math.max(0, book.chapters.length - 1));
    const chapter = book.chapters[index];

    if (!chapter) return h('div.ww-empty', { text: t('step4.empty') });

    // 이 화면을 연 시점의 원문은 자동정리가 어떤 변경을 전달할지 판단하는 기준이다.
    const savedText = chapter.text;
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
            await persistBook(project, book);
            renderWorkspace();
            toast(t('common.saved'));
        } catch (e) {
            await showError(e);
        }
    };

    const saveAndOrganize = async function () {
        try {
            await persistBook(project, book);
            const bookIndex = project.books.findIndex(function (meta) { return meta.id === book.id; });
            if (chapter.text === savedText || bookIndex < 0 || bookIndex === project.books.length - 1) {
                renderWorkspace();
                toast(bookIndex === project.books.length - 1 ? t('step4.organizeNone') : t('common.saved'));
                return;
            }

            state.cancelRequested = false;
            const progress = openProgress(t('step4.organizingTitle'), {
                text: t('common.working'),
                cancelLabel: t('step4.cancel'),
                onCancel: function () {
                    state.cancelRequested = true;
                    progress.setText(t('step4.cancelling'));
                }
            });
            try {
                const result = await Pipeline.reconcileFollowingBooks(project, book.id, {
                    chapterTitle: chapter.title, beforeText: savedText, afterText: chapter.text
                }, {
                    cancelled: function () { return state.cancelRequested; },
                    onProgress: function (info) {
                        progress.setText(t('step4.organizing', info.current, info.total,
                            info.bookTitle + ' · ' + info.title));
                        progress.setProgress(info.current - 1, info.total);
                    }
                });
                progress.close();
                state.project = await Projects.load(project.id);
                state.currentBook = book;
                renderWorkspace();
                toast(result.cancelled ? t('step4.organizeStopped')
                    : t('step4.organizeDone', result.updatedBooks, result.updatedChapters));
            } catch (error) {
                progress.close();
                state.project = await Projects.load(project.id);
                state.currentBook = book;
                renderWorkspace();
                await showError(error);
            }
        } catch (error) {
            await showError(error);
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

    const exportBook = function () { openBookExportDialog(project, book); };

    return h('div.ww-editor', {},
        h('div.ww-editor-head', {},
            h('label.ww-label', { text: t('step4.chapter'), style: { margin: '0' } }),
            chapterSelect,
            h('span.ww-badge', { text: formatNumber(chapter.text.length) + ' ' + t('common.chars') })),
        textArea,
        h('div.ww-actions', {},
            h('button.ww-btn.primary', { text: t('common.save'), onClick: saveChapter }),
            h('button.ww-btn', { text: t('step4.saveOrganize'), onClick: saveAndOrganize }),
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

/** 전체 생성·다음 권 생성·이어쓰기에 공통으로 쓰는 진행 화면을 연다. */
async function runBookGeneration(create) {
    const project = state.project;

    if (!(project.targetVolumes > 0)) {
        await showAlert(t('step3.setTarget'), t('step3.targetGuide'));
        return;
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
        const book = await create(project, {
            cancelled: function () { return state.cancelRequested; },
            onProgress: function (info) {
                progress.setText(t('step4.generating', info.current, info.total, info.title)
                    + '\n' + t('step4.lengthProgress', formatNumber(info.charCount), formatNumber(info.targetChars)));
                progress.setProgress(info.charCount, info.targetChars);
            }
        });
        progress.close();
        state.currentBookId = book.id;
        state.currentBook = book;
        state.currentChapterIndex = 0;
        renderWorkspace();
        toast(t(book.status === 'complete' ? 'step4.done' : 'step4.paused', book.title));
    } catch (e) {
        progress.close();
        try {
            state.project = await Projects.load(project.id);
            const last = state.project.books[state.project.books.length - 1];
            if (last) {
                state.currentBookId = last.id;
                state.currentBook = await Books.load(project.id, last.id);
            }
        } catch (loadError) { console.error(loadError); }
        renderWorkspace();
        await showError(e);
    }
}

/** 마지막 미완성 권을 이어 쓴다. */
async function resumeLastBook() {
    return runBookGeneration(function (project, options) { return Pipeline.generateNextBook(project, options); });
}

/** 마지막 완료 권 바로 다음에 한 권만 생성한다. */
async function generateFollowingBook() {
    return runBookGeneration(function (project, options) { return Pipeline.generateFollowingBook(project, options); });
}

/** 남은 목표 권수를 모두 순서대로 생성한다. */
async function generateAllBooks() {
    return runBookGeneration(function (project, options) { return Pipeline.generateAllBooks(project, options); });
}

/**
 * `deleteLastBook` 작업을 수행한다.
 */
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
        state.project = await Projects.load(project.id);
        if (state.currentBookId === last.id) {
            state.currentBookId = null;
            state.currentBook = null;
        }
        renderWorkspace();
    } catch (e) {
        await showError(e);
    }
}

/* ------------------------------------------------------------------ *
 *  AI 채팅 사이드바와 도구 어댑터
 *
 *  채팅, WebMCP, 백엔드 MCP 가 모두 코어의 Tools 를 거쳐 아래 어댑터를 호출한다.
 *  각 처리는 화면에서 버튼을 눌렀을 때와 같은 저장 경로를 사용하며,
 *  사용자 전환과 AI 공급자 설정 변경은 어댑터에 두지 않는다.
 * ------------------------------------------------------------------ */

/** 열려 있는 프로젝트를 확인한다. */
function requireProject() {
    if (!state.project) throw new Error(t('tool.needProject'));
    return state.project;
}

/** id 로 책 메타데이터를 찾는다. */
function findBookMeta(project, bookId) {
    const meta = project.books.find(function (b) { return b.id === bookId; });
    if (!meta) throw new Error(t('tool.noBook', bookId));
    return meta;
}

/** 편집 대상 책을 읽어 온다. 화면에 열려 있으면 그 사본을 그대로 쓴다. */
async function loadBookFor(project, bookId) {
    if (state.currentBook && state.currentBook.id === bookId) return state.currentBook;
    findBookMeta(project, bookId);
    return await Books.load(project.id, bookId);
}

/** 책 본문 변경을 저장하고 목록 정보를 갱신한다. */
async function persistBook(project, book) {
    await Books.save(project.id, book);
    updateBookMeta(book);
    await Projects.save(project);
}

/** 설정 항목 종류를 확인한다. */
function requireKind(kind) {
    if (ITEM_KINDS.indexOf(kind) < 0) throw new Error(t('tool.badKind', kind));
    return kind;
}

/** 현재 화면 상태를 도구와 AI 에게 전달할 형태로 모은다. */
function collectScreenContext() {
    const project = state.project;
    const context = {
        screen: state.screen,
        language: state.language,
        darkMode: state.darkMode,
        storageMode: Env.mode,
        user: state.user,
        busy: !!(state.generation && state.generation.running)
    };

    if (state.screen === 'home') {
        context.projects = state.projects.map(function (meta) {
            return { id: meta.id, name: meta.name, updatedAt: meta.updatedAt };
        });
        return context;
    }
    if (!project) return context;

    context.step = state.step;
    context.maxStep = Projects.maxStep(project);
    context.project = {
        id: project.id,
        name: project.name,
        // 입력 중인 값도 그대로 전달한다. (저장 버튼을 누르지 않아도 화면 내용이 보이도록)
        description: project.description || '',
        targetVolumes: project.targetVolumes || 0,
        counts: {
            characters: project.characters.length,
            places: project.places.length,
            events: project.events.length,
            flow: project.flow.length,
            books: project.books.length
        }
    };

    if (state.step === 2) {
        context.items = {};
        ITEM_KINDS.forEach(function (kind) {
            context.items[kind] = project[kind].map(function (item) {
                return {
                    id: item.id, name: item.name, summary: item.summary || '',
                    hasDetail: !WorldWriter.util.isBlank(item.detail),
                    detail: WorldWriter.util.tailOf(item.detail || '', 400)
                };
            });
        });
        context.openItemIds = Object.keys(state.openItems).filter(function (id) { return state.openItems[id]; });
    } else if (state.step === 3) {
        context.flow = project.flow.map(function (item, index) {
            return { index: index, id: item.id, title: item.title, summary: item.summary || '', main: !!item.main };
        });
    } else if (state.step === 4) {
        context.books = project.books.map(function (meta) {
            return {
                id: meta.id, index: meta.index, title: meta.title,
                chapterCount: meta.chapterCount, charCount: meta.charCount, status: meta.status || 'complete'
            };
        });
        if (state.currentBook) {
            const index = Math.min(state.currentChapterIndex, Math.max(0, state.currentBook.chapters.length - 1));
            const chapter = state.currentBook.chapters[index];
            context.openBook = {
                id: state.currentBook.id,
                title: state.currentBook.title,
                chapters: state.currentBook.chapters.map(function (ch, i) {
                    return { index: i, id: ch.id, title: ch.title, charCount: (ch.text || '').length };
                })
            };
            if (chapter) {
                context.openChapter = {
                    id: chapter.id, index: index, title: chapter.title,
                    charCount: (chapter.text || '').length,
                    textTail: WorldWriter.util.tailOf(chapter.text || '', 1200)
                };
            }
        }
    }
    return context;
}

/** 진행 중인 긴 작업(책 생성, 일괄 상세 생성)의 상태 */
state.generation = { running: false, kind: '', title: '', current: 0, total: 0, charCount: 0, targetChars: 0, message: '', error: '' };

/** 긴 작업을 백그라운드로 실행한다. 채팅/MCP 는 기다리지 않고 상태만 확인한다. */
function runBackground(kind, task) {
    if (state.generation.running) throw new Error(t('tool.busy'));
    state.cancelRequested = false;
    state.generation = { running: true, kind: kind, title: '', current: 0, total: 0, charCount: 0, targetChars: 0, message: '', error: '' };
    Promise.resolve()
        .then(task)
        .then(function (message) {
            state.generation.running = false;
            state.generation.message = message || t('tool.finished');
        })
        .catch(function (error) {
            state.generation.running = false;
            state.generation.error = (error && error.message) ? error.message : String(error);
        })
        .then(function () {
            if (state.screen === 'workspace') renderWorkspace();
            renderChatPanel();
        });
    return { started: true, kind: kind };
}

/** 코어의 Tools 에 등록할 화면 조작 어댑터 */
const ToolAdapter = {
/**
 * `get_screen` 작업을 수행한다.
 */
    async get_screen() {
        return collectScreenContext();
    },

/**
 * `list_projects` 작업을 수행한다.
 */
    async list_projects() {
        const list = await Projects.list();
        state.projects = list;
        return {
            projects: list.slice().sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); })
                .map(function (meta) { return { id: meta.id, name: meta.name, updatedAt: meta.updatedAt }; })
        };
    },

/**
 * `create_project` 작업을 수행한다.
 */
    async create_project(args) {
        const project = await Projects.create(args.name);
        if (state.screen === 'home') await goHome();
        return { id: project.id, name: project.name };
    },

/**
 * `open_project` 작업을 수행한다.
 */
    async open_project(args) {
        await openProject(args.projectId);
        if (!state.project || state.project.id !== args.projectId) throw new Error(t('tool.noProject', args.projectId));
        return { ok: true, step: state.step, name: state.project.name };
    },

/**
 * `rename_project` 작업을 수행한다.
 */
    async rename_project(args) {
        await Projects.rename(args.projectId, args.name);
        if (state.project && state.project.id === args.projectId) state.project.name = args.name.trim();
        if (state.screen === 'home') await goHome(); else rerender();
        return { ok: true };
    },

/**
 * `delete_project` 작업을 수행한다.
 */
    async delete_project(args) {
        await Projects.remove(args.projectId);
        if (state.project && state.project.id === args.projectId) await goHome();
        else if (state.screen === 'home') await goHome();
        return { ok: true };
    },

/**
 * `go_home` 작업을 수행한다.
 */
    async go_home() {
        await goHome();
        return { ok: true, screen: 'home' };
    },

/**
 * `go_step` 작업을 수행한다.
 */
    async go_step(args) {
        const project = requireProject();
        const step = Math.round(args.step);
        if (step < 1 || step > 4) throw new Error(t('tool.badStep'));
        if (step > Projects.maxStep(project)) throw new Error(t('tool.stepLocked', step));
        state.step = step;
        renderWorkspace();
        return { ok: true, step: step };
    },

/**
 * `get_project` 작업을 수행한다.
 */
    async get_project() {
        const project = requireProject();
        return {
            id: project.id, name: project.name,
            description: project.description || '',
            targetVolumes: project.targetVolumes || 0,
            characters: project.characters, places: project.places, events: project.events,
            flow: project.flow,
            books: project.books
        };
    },

/**
 * `set_description` 작업을 수행한다.
 */
    async set_description(args) {
        const project = requireProject();
        project.description = args.text;
        await Projects.save(project);
        if (state.step === 1) renderWorkspace();
        return { ok: true, length: project.description.length };
    },

/**
 * `generate_outline` 작업을 수행한다.
 */
    async generate_outline() {
        const project = requireProject();
        return runBackground('outline', async function () {
            await Pipeline.generateOutline(project);
            await Projects.save(project);
            state.step = Math.min(2, Projects.maxStep(project));
            return t('tool.outlineDone');
        });
    },

/**
 * `list_items` 작업을 수행한다.
 */
    async list_items(args) {
        const project = requireProject();
        const kinds = args.kind ? [requireKind(args.kind)] : ITEM_KINDS;
        const out = {};
        kinds.forEach(function (kind) {
            out[kind] = project[kind].map(function (item) {
                return { id: item.id, name: item.name, summary: item.summary || '', detail: item.detail || '' };
            });
        });
        return out;
    },

/**
 * `update_item` 작업을 수행한다.
 */
    async update_item(args) {
        const project = requireProject();
        const kind = requireKind(args.kind);
        const item = project[kind].find(function (i) { return i.id === args.itemId; });
        if (!item) throw new Error(t('tool.noItem', args.itemId));
        if (args.name !== undefined) item.name = args.name;
        if (args.summary !== undefined) item.summary = args.summary;
        if (args.detail !== undefined) item.detail = args.detail;
        await Projects.save(project);
        if (state.step === 2) renderWorkspace();
        return { ok: true, item: { id: item.id, name: item.name, summary: item.summary, detail: item.detail } };
    },

    /**
     * 2단계 설정 항목을 추가한다.
     * @param {{kind: string, name?: string, summary?: string, detail?: string}} args 도구 인자
     * @returns {Promise<object>} 추가한 항목
     */
    async add_item(args) {
        const project = requireProject();
        const kind = requireKind(args.kind);
        const item = await Projects.addItem(project, kind, {
            name: args.name === undefined ? t('step2.newItem') : args.name,
            summary: args.summary,
            detail: args.detail
        });
        await Projects.save(project);
        if (state.screen === 'workspace') {
            state.openItems[item.id] = true;
            renderWorkspace();
        }
        return { ok: true, item: item };
    },

    /**
     * 2단계 설정 항목을 선택한 종류 또는 전체에서 삭제한다.
     * @param {{kind?: string}} args 도구 인자
     * @returns {Promise<object>} 초기화 결과
     */
    async clear_items(args) {
        const project = requireProject();
        const kind = args.kind === undefined ? undefined : requireKind(args.kind);
        const cleared = await Projects.clearItems(project, kind);
        await Projects.save(project);
        state.openItems = {};
        if (!kind || !ITEM_KINDS.some(function (entry) { return project[entry].length > 0; })) state.step = 1;
        if (state.screen === 'workspace') renderWorkspace();
        return { ok: true, cleared: cleared };
    },

    /**
     * 2단계 설정 항목 하나를 삭제한다.
     * @param {{kind: string, itemId: string}} args 도구 인자
     * @returns {Promise<object>} 삭제 결과
     */
    async remove_item(args) {
        const project = requireProject();
        const kind = requireKind(args.kind);
        const removed = await Projects.removeItem(project, kind, args.itemId);
        await Projects.save(project);
        delete state.openItems[args.itemId];
        if (!ITEM_KINDS.some(function (entry) { return project[entry].length > 0; })) state.step = 1;
        if (state.screen === 'workspace') renderWorkspace();
        return { ok: true, removed: removed };
    },

/**
 * `generate_item_detail` 작업을 수행한다.
 */
    async generate_item_detail(args) {
        const project = requireProject();
        const kind = requireKind(args.kind);
        return runBackground('itemDetail', async function () {
            await Pipeline.generateItemDetail(project, kind, args.itemId);
            await Projects.save(project);
            return t('tool.detailDone');
        });
    },

/**
 * `generate_all_details` 작업을 수행한다.
 */
    async generate_all_details() {
        const project = requireProject();
        const targets = [];
        ITEM_KINDS.forEach(function (kind) {
            project[kind].forEach(function (item) {
                if (WorldWriter.util.isBlank(item.detail)) targets.push({ kind: kind, item: item });
            });
        });
        if (targets.length === 0) return { ok: true, generated: 0 };
        return runBackground('details', async function () {
            state.generation.total = targets.length;
            for (let i = 0; i < targets.length; i++) {
                if (state.cancelRequested) break;
                state.generation.current = i + 1;
                state.generation.title = targets[i].item.name;
                await Pipeline.generateItemDetail(project, targets[i].kind, targets[i].item.id);
                await Projects.save(project);
            }
            return t('tool.detailAllDone', state.generation.current);
        });
    },

/**
 * `get_flow` 작업을 수행한다.
 */
    async get_flow() {
        const project = requireProject();
        return {
            flow: project.flow.map(function (item, index) {
                return { index: index, id: item.id, title: item.title, summary: item.summary || '', main: !!item.main };
            })
        };
    },

/**
 * `generate_flow` 작업을 수행한다.
 */
    async generate_flow() {
        const project = requireProject();
        return runBackground('flow', async function () {
            await Pipeline.generateFlow(project);
            await Projects.save(project);
            state.step = Math.min(3, Projects.maxStep(project));
            return t('tool.flowDone', project.flow.length);
        });
    },

/**
 * `move_flow_item` 작업을 수행한다.
 */
    async move_flow_item(args) {
        const project = requireProject();
        await Projects.assertStructureEditable(project);
        const from = project.flow.findIndex(function (item) { return item.id === args.flowId; });
        if (from < 0) throw new Error(t('tool.noFlow', args.flowId));
        const to = Math.max(0, Math.min(project.flow.length - 1, Math.round(args.toIndex)));
        const moved = project.flow.splice(from, 1)[0];
        project.flow.splice(to, 0, moved);
        await Projects.save(project);
        if (state.step === 3) renderWorkspace();
        return { ok: true, from: from, to: to };
    },

/**
 * `remove_flow_item` 작업을 수행한다.
 */
    async remove_flow_item(args) {
        const project = requireProject();
        await Projects.assertStructureEditable(project);
        const index = project.flow.findIndex(function (item) { return item.id === args.flowId; });
        if (index < 0) throw new Error(t('tool.noFlow', args.flowId));
        project.flow.splice(index, 1);
        await Projects.save(project);
        if (state.step === 3) renderWorkspace();
        return { ok: true, remaining: project.flow.length };
    },

/**
 * `set_target_volumes` 작업을 수행한다.
 */
    async set_target_volumes(args) {
        const project = requireProject();
        const result = await Projects.setTargetVolumes(project, args.count);
        await Projects.save(project);
        if (state.step === 3 || state.step === 4) renderWorkspace();
        return { ok: true, targetVolumes: result.count, flowCleared: result.flowCleared };
    },

/**
 * `list_books` 작업을 수행한다.
 */
    async list_books() {
        const project = requireProject();
        return {
            targetVolumes: project.targetVolumes || 0,
            books: project.books.map(function (meta) {
                return {
                    id: meta.id, index: meta.index, title: meta.title,
                    chapterCount: meta.chapterCount, charCount: meta.charCount,
                    status: meta.status || 'complete'
                };
            })
        };
    },

/**
 * `open_book` 작업을 수행한다.
 */
    async open_book(args) {
        const project = requireProject();
        findBookMeta(project, args.bookId);
        state.step = 4;
        await selectBook(args.bookId);
        if (args.chapterIndex !== undefined && state.currentBook) {
            state.currentChapterIndex = Math.max(0, Math.min(state.currentBook.chapters.length - 1, Math.round(args.chapterIndex)));
            renderWorkspace();
        }
        return {
            ok: true,
            chapters: (state.currentBook ? state.currentBook.chapters : []).map(function (ch, i) {
                return { index: i, id: ch.id, title: ch.title, charCount: (ch.text || '').length };
            })
        };
    },

/**
 * `get_chapter` 작업을 수행한다.
 */
    async get_chapter(args) {
        const project = requireProject();
        const bookId = args.bookId || state.currentBookId;
        if (!bookId) throw new Error(t('tool.needBook'));
        const book = await loadBookFor(project, bookId);
        let chapter;
        if (args.chapterId) chapter = book.chapters.find(function (ch) { return ch.id === args.chapterId; });
        else chapter = book.chapters[Math.min(state.currentChapterIndex, book.chapters.length - 1)];
        if (!chapter) throw new Error(t('tool.noChapter', args.chapterId || ''));
        const limit = args.maxChars ? Math.max(200, Math.round(args.maxChars)) : 8000;
        const text = chapter.text || '';
        return {
            bookId: book.id, chapterId: chapter.id, title: chapter.title,
            charCount: text.length,
            truncated: text.length > limit,
            text: text.substring(0, limit)
        };
    },

/**
 * `set_chapter_text` 작업을 수행한다.
 */
    async set_chapter_text(args) {
        const project = requireProject();
        const book = await loadBookFor(project, args.bookId);
        const chapter = book.chapters.find(function (ch) { return ch.id === args.chapterId; });
        if (!chapter) throw new Error(t('tool.noChapter', args.chapterId));
        const beforeText = chapter.text;
        chapter.text = args.text;
        await persistBook(project, book);
        if (state.currentBookId === book.id) state.currentBook = book;
        if (state.step === 4) renderWorkspace();
        if (args.autoOrganize && beforeText !== chapter.text) {
            return runBackground('organize', async function () {
                const result = await Pipeline.reconcileFollowingBooks(project, book.id, {
                    chapterTitle: chapter.title, beforeText, afterText: chapter.text
                }, {
                    cancelled: function () { return state.cancelRequested; },
                    onProgress: function (info) {
                        state.generation.current = info.current;
                        state.generation.total = info.total;
                        state.generation.title = info.bookTitle + ' · ' + info.title;
                    }
                });
                state.project = await Projects.load(project.id);
                return result.cancelled ? t('step4.organizeStopped')
                    : t('step4.organizeDone', result.updatedBooks, result.updatedChapters);
            });
        }
        return { ok: true, charCount: chapter.text.length };
    },

/**
 * `revise_chapter` 작업을 수행한다.
 */
    async revise_chapter(args) {
        const project = requireProject();
        const book = await loadBookFor(project, args.bookId);
        const chapter = book.chapters.find(function (ch) { return ch.id === args.chapterId; });
        if (!chapter) throw new Error(t('tool.noChapter', args.chapterId));
        return runBackground('revise', async function () {
            state.generation.title = chapter.title;
            const revised = await Pipeline.reviseChapter(project, chapter, args.instruction);
            chapter.text = revised;
            await persistBook(project, book);
            if (state.currentBookId === book.id) state.currentBook = book;
            return t('tool.reviseDone', chapter.title);
        });
    },

/**
 * `export_book_text` 작업을 수행한다.
 */
    async export_book_text(args) {
        const project = requireProject();
        const book = await loadBookFor(project, args.bookId);
        const text = Books.toPlainText(book);
        const limit = args.maxChars ? Math.max(500, Math.round(args.maxChars)) : 20000;
        return {
            bookId: book.id, title: book.title, charCount: text.length,
            truncated: text.length > limit,
            text: text.substring(0, limit)
        };
    },

/**
 * `delete_last_book` 작업을 수행한다.
 */
    async delete_last_book() {
        const project = requireProject();
        if (project.books.length === 0) throw new Error(t('tool.noBooks'));
        const last = project.books[project.books.length - 1];
        await Books.remove(project.id, last.id);
        state.project = await Projects.load(project.id);
        if (state.currentBookId === last.id) {
            state.currentBookId = null;
            state.currentBook = null;
        }
        if (state.screen === 'workspace') renderWorkspace();
        return { ok: true, deleted: last.title, remaining: state.project.books.length };
    },

/**
 * `generate_next_book` 작업을 수행한다.
 */
    async generate_next_book() {
        const project = requireProject();
        if (!(project.targetVolumes > 0)) throw new Error(t('tool.needTarget'));
        return runBackground('book', async function () {
            const book = await Pipeline.generateFollowingBook(project, {
                cancelled: function () { return state.cancelRequested; },
                onProgress: function (info) {
                    state.generation.current = info.current;
                    state.generation.total = info.total;
                    state.generation.title = info.title;
                    state.generation.charCount = info.charCount;
                    state.generation.targetChars = info.targetChars;
                }
            });
            state.currentBookId = book.id;
            state.currentBook = book;
            state.currentChapterIndex = 0;
            return t('tool.bookDone', book.title, t('step4.status.' + (book.status || 'complete')));
        });
    },

/** 마지막 미완성 권 이어쓰기 */
    async resume_last_book() {
        const project = requireProject();
        return runBackground('book', async function () {
            const book = await Pipeline.generateNextBook(project, {
                cancelled: function () { return state.cancelRequested; },
                onProgress: function (info) {
                    state.generation.current = info.current;
                    state.generation.total = info.total;
                    state.generation.title = info.title;
                    state.generation.charCount = info.charCount;
                    state.generation.targetChars = info.targetChars;
                }
            });
            state.currentBookId = book.id;
            state.currentBook = book;
            state.currentChapterIndex = 0;
            return t('tool.bookDone', book.title, t('step4.status.' + (book.status || 'complete')));
        });
    },

/** 목표 권수까지 남은 모든 권 생성 */
    async generate_all_books() {
        const project = requireProject();
        if (!(project.targetVolumes > 0)) throw new Error(t('tool.needTarget'));
        return runBackground('book', async function () {
            const book = await Pipeline.generateAllBooks(project, {
                cancelled: function () { return state.cancelRequested; },
                onProgress: function (info) {
                    state.generation.current = info.current;
                    state.generation.total = info.total;
                    state.generation.title = info.title;
                    state.generation.charCount = info.charCount;
                    state.generation.targetChars = info.targetChars;
                }
            });
            if (book) {
                state.currentBookId = book.id;
                state.currentBook = book;
                state.currentChapterIndex = 0;
            }
            return book ? t('tool.bookDone', book.title, t('step4.status.' + (book.status || 'complete'))) : t('tool.finished');
        });
    },

/**
 * `generation_status` 작업을 수행한다.
 */
    async generation_status() {
        const g = state.generation;
        return {
            running: g.running, kind: g.kind, title: g.title,
            current: g.current, total: g.total,
            charCount: g.charCount, targetChars: g.targetChars,
            message: g.message, error: g.error,
            cancelRequested: state.cancelRequested,
            // 백엔드로 보낸 AI 요청이 아직 진행 중인지도 함께 알려 준다.
            aiTransport: AiSocket.supported() ? 'websocket' : (Env.isServer() ? 'http' : Env.mode),
            aiSocketState: AiSocket.state,
            aiRequests: AiSocket.status()
        };
    },

/**
 * `stop_generation` 작업을 수행한다.
 */
    async stop_generation() {
        if (!state.generation.running) return { ok: true, running: false };
        state.cancelRequested = true;
        return { ok: true, stopping: true };
    },

/**
 * `backup_project` 작업을 수행한다.
 */
    async backup_project(args) {
        const projectId = args.projectId || (state.project && state.project.id);
        if (!projectId) throw new Error(t('tool.needProject'));
        if (state.project && state.project.id === projectId) await Projects.save(state.project);
        const data = await Backup.create(projectId);
        const json = JSON.stringify(data);
        const limit = args.maxChars ? Math.max(1000, Math.round(args.maxChars)) : 200000;
        const summary = {
            fileName: Backup.fileName(data.project, data.exportedAt),
            charCount: json.length,
            books: data.books.length,
            chatMessages: data.chat.messages.length
        };
        // 백업은 잘라 내면 복원할 수 없으므로, 너무 크면 내용 대신 크기만 알려 준다.
        if (json.length > limit) return Object.assign({ tooLarge: true, maxChars: limit }, summary);
        return Object.assign({ tooLarge: false, json: json }, summary);
    },

/**
 * `restore_project` 작업을 수행한다.
 */
    async restore_project(args) {
        let data;
        try {
            data = JSON.parse(args.json);
        } catch (e) {
            throw new Error(t('restore.badFile'));
        }
        const project = await Backup.restore(data, args.name);
        if (state.screen === 'home') await goHome();
        return { ok: true, id: project.id, name: project.name, books: project.books.length };
    },

/**
 * `get_display_settings` 작업을 수행한다.
 */
    async get_display_settings() {
        return {
            language: Settings.current.language,
            darkMode: !!Settings.current.darkMode,
            storageMode: Env.mode
        };
    },

/**
 * `set_display_settings` 작업을 수행한다.
 */
    async set_display_settings(args) {
        const next = WorldWriter.util.clone(Settings.current);
        if (args.language !== undefined) {
            if (args.language !== 'ko' && args.language !== 'en') throw new Error(t('tool.badLanguage'));
            next.language = args.language;
        }
        if (args.darkMode !== undefined) next.darkMode = args.darkMode;
        await Settings.save(next);
        state.language = next.language;
        state.darkMode = !!next.darkMode;
        applyTheme();
        rerender();
        return { ok: true, language: next.language, darkMode: state.darkMode };
    }
};

/* --------------------------- 채팅 사이드바 --------------------------- */

/** 채팅 화면 상태 */
state.chat = { open: false, busy: false, status: '', draft: '' };

/** 채팅 패널 DOM (열려 있을 때만 존재) */
let chatPanel = null;

/** 대화 한 줄을 화면 요소로 만든다. */
function renderChatMessage(entry) {
    if (entry.role === 'tool') {
        return h('div.ww-chat-msg.tool', {},
            h('span.ww-chat-tool-name', { text: '⚙ ' + (entry.tool || 'tool') }),
            h('span', { text: ' ' + entry.text.substring(0, 300) }));
    }
    return h('div.ww-chat-msg.' + (entry.role === 'user' ? 'user' : 'ai'), {},
        h('div.ww-chat-bubble', { text: entry.text }));
}

/** 채팅 패널을 다시 그린다. 열려 있지 않으면 아무것도 하지 않는다. */
function renderChatPanel() {
    if (!chatPanel) return;
    const list = chatPanel.querySelector('.ww-chat-list');
    const status = chatPanel.querySelector('.ww-chat-status');
    if (list) {
        clearNode(list);
        if (Chat.history.length === 0) {
            list.appendChild(h('div.ww-chat-empty', { text: t('chat.empty') }));
        } else {
            Chat.history.forEach(function (entry) { list.appendChild(renderChatMessage(entry)); });
        }
        list.scrollTop = list.scrollHeight;
    }
    if (status) {
        const generation = state.generation;
        let text = state.chat.status;
        if (!text && generation.running) {
            text = t('chat.working') + ' ' + (generation.title || generation.kind);
        }
        // 백엔드로 보낸 AI 요청이 진행 중이면 경과 시간을 덧붙인다.
        const jobs = AiSocket.status();
        if (text && jobs.length > 0) {
            text += ' · ' + Math.round(jobs[0].elapsed / 1000) + 's';
        }
        status.textContent = text || '';
    }
}

/** 채팅 패널을 만든다. */
function buildChatPanel() {
    const list = h('div.ww-chat-list', {});
    const status = h('div.ww-chat-status', {});

    const input = h('textarea.ww-chat-input', {
        rows: 2,
        placeholder: t('chat.placeholder'),
        value: state.chat.draft || '',
        onInput: function (ev) { state.chat.draft = ev.target.value; }
    });

    const send = async function () {
        const text = input.value.trim();
        if (text.length === 0 || state.chat.busy) return;
        input.value = '';
        state.chat.draft = '';
        state.chat.busy = true;
        state.chat.status = t('chat.thinking');
        renderChatPanel();
        try {
            await Chat.send(text, {
                onUpdate: function (info) {
                    if (info.phase === 'tool') state.chat.status = t('chat.usingTool', info.name);
                    else if (info.phase === 'toolDone') state.chat.status = t('chat.thinking');
                    else if (info.phase === 'answer') state.chat.status = '';
                    renderChatPanel();
                }
            });
        } catch (e) {
            Chat.append('assistant', t('chat.failed') + ' ' + ((e && e.message) ? e.message : String(e)));
            try { await Chat.save(); } catch (saveError) { /* 저장 실패는 화면 표시로 충분하다. */ }
        } finally {
            state.chat.busy = false;
            state.chat.status = '';
            renderChatPanel();
            input.focus();
        }
    };

    input.addEventListener('keydown', function (ev) {
        // Enter 로 전송, Shift+Enter 로 줄바꿈
        if (ev.key === 'Enter' && !ev.shiftKey) {
            ev.preventDefault();
            send();
        }
    });

    const reset = h('button.ww-chat-icon', {
        title: t('chat.reset'),
        text: '↺',
        onClick: async function () {
            if (state.chat.busy) return;
            const ok = await showConfirm(t('chat.reset'), t('chat.resetConfirm'), t('chat.reset'), true);
            if (!ok) return;
            await Chat.clear();
            renderChatPanel();
        }
    });

    const panel = h('div.ww-chat', {},
        h('div.ww-chat-head', {},
            h('span.ww-chat-title', { text: t('chat.title') }),
            h('span.ww-chat-badge', {
                text: WebMcp.bridged ? t('chat.mcpOn') : (WebMcp.registered ? t('chat.webmcpOn') : ''),
                // 표준 WebMCP 를 지원하지 않는 브라우저에서도 채팅과 도구는 그대로 쓸 수 있다.
                title: WebMcp.bridged ? t('chat.mcpOnHint') : (WebMcp.registered ? t('chat.webmcpOnHint') : t('chat.webmcpOffHint'))
            }),
            h('button.ww-chat-icon', {
                title: t('chat.close'), text: '✕',
                onClick: function () { toggleChat(false); }
            })),
        list,
        status,
        h('div.ww-chat-foot', {},
            input,
            h('div.ww-chat-buttons', {},
                h('button.ww-btn.small.primary', { text: t('chat.send'), onClick: send }),
                reset)));

    return panel;
}

/** 채팅 사이드바를 열거나 닫는다. */
async function toggleChat(open) {
    const next = (open === undefined) ? !state.chat.open : !!open;
    state.chat.open = next;
    if (next && !Chat.loaded) {
        try { await Chat.load(); } catch (e) { console.error(e); }
    }
    rerender();
    if (next && chatPanel) {
        const input = chatPanel.querySelector('.ww-chat-input');
        if (input) input.focus();
    }
}

/** 로그인 뒤의 모든 화면에 채팅 사이드바(또는 열기 버튼)를 붙인다. */
function attachChat(view) {
    chatPanel = null;
    if (state.screen === 'login') return view;

    if (!state.chat.open) {
        const opener = h('button.ww-chat-open', {
            title: t('chat.title'), text: '💬',
            onClick: function () { toggleChat(true); }
        });
        return h('div.ww-shell', {}, h('div.ww-shell-main', {}, view), opener);
    }

    chatPanel = buildChatPanel();
    const shell = h('div.ww-shell.with-chat', {}, h('div.ww-shell-main', {}, view), chatPanel);
    setTimeout(renderChatPanel, 0);
    return shell;
}

/* ------------------------------------------------------------------ *
 *  화면 전환
 * ------------------------------------------------------------------ */

/**
 * `mount` 작업을 수행한다.
 */
function mount(view) {
    // 열려 있는 모달은 유지하지 않는다. (화면이 바뀌면 함께 닫힌다.)
    clearNode(state.root);
    state.root.appendChild(attachChat(view));
}

/**
 * `rerender` 작업을 수행한다.
 */
function rerender() {
    if (state.screen === 'login') renderLogin();
    else if (state.screen === 'home') renderHome();
    else renderWorkspace();
}

/* ------------------------------------------------------------------ *
 *  진입점
 * ------------------------------------------------------------------ */

/**
 * `WorldWriterUI` 선언이 담당하는 값을 보관한다.
 */
const WorldWriterUI = {
    /**
     * UI 를 초기화한다. index.html 의 DOMContentLoaded 시점에 호출된다.
     * @param {HTMLElement} rootElement
     */
    async init(rootElement) {
        state.root = rootElement || document.body;
        injectStyle();

        // 채팅/WebMCP/백엔드 MCP 가 함께 쓰는 화면 조작 어댑터를 등록한다.
        Tools.setAdapter(ToolAdapter);
        // 브라우저가 나중에 WebMCP 등록을 거절하면 채팅 패널 표시를 되돌린다.
        WebMcp.onChange = function () { renderChatPanel(); };
        WebMcp.expose();

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
    storageNoteText: storageNoteText,
    core: WorldWriter,
    t: t
};

if (typeof window !== 'undefined') {
    window.WorldWriterUI = WorldWriterUI;
}

export { WorldWriterUI };
export default WorldWriterUI;
