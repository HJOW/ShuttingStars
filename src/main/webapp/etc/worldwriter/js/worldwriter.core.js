/**
 * worldwriter.core.js
 *
 * WorldWriter 의 기능 구현부.
 *  - 저장소 추상화 (localStorage / 백엔드 파일 저장)
 *  - 설정 및 프로젝트 데이터 모델
 *  - AI 공급자 호출 (OpenAI / Claude / LM Studio)
 *  - 1 ~ 4 단계 생성 파이프라인
 *
 * 화면 구현은 worldwriter.ui.js 에서 담당한다.
 */

import { LZ } from './worldwriter.lz.js';

/* ------------------------------------------------------------------ *
 *  공통 유틸
 * ------------------------------------------------------------------ */

/** 짧고 충돌 가능성이 낮은 식별자 생성 */
function newId(prefix) {
    const rand = Math.random().toString(36).substring(2, 8);
    return (prefix || 'id') + '_' + Date.now().toString(36) + '_' + rand;
}

/** 값이 비어있는지 확인 */
function isBlank(text) {
    return text === null || text === undefined || String(text).trim().length === 0;
}

/** 깊은 복사 (JSON 으로 표현 가능한 데이터 전용) */
function clone(obj) {
    return obj === undefined ? obj : JSON.parse(JSON.stringify(obj));
}

/** 숫자를 최소/최대 범위 안으로 맞춘다. */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/** 문자열의 뒷부분만 잘라낸다. (직전 내용 참고용) */
function tailOf(text, length) {
    if (isBlank(text)) return '';
    const str = String(text);
    return str.length <= length ? str : '...' + str.substring(str.length - length);
}

/** 긴 본문을 AI 수정 맥락에 넣을 때 앞뒤를 남겨 크기를 제한한다. */
function excerptOf(text, length) {
    const str = String(text || '');
    if (str.length <= length) return str;
    const half = Math.floor((length - 80) / 2);
    return str.substring(0, half) + '\n\n... (중간 생략) ...\n\n' + str.substring(str.length - half);
}

/** 사용자에게 보이는 코어 메시지. 프롬프트 언어와 UI 언어를 구분한다. */
function localize(ko, en, settings = Settings.current) {
    return settings.language === 'en' ? en : ko;
}

/**
 * `activeGenerations` 선언이 담당하는 값을 보관한다.
 */
const activeGenerations = new Set();
/**
 * `BOOK_LENGTH` 선언이 담당하는 값을 보관한다.
 */
const BOOK_LENGTH = { min: 100000, target: 125000, max: 150000 };

/* ------------------------------------------------------------------ *
 *  실행 환경 판별
 *
 *  electron 데스크톱 앱이면 preload 가 노출한 브리지에, 백엔드(node.js / python)
 *  위에서 동작 중이면 백엔드에 파일 저장과 AI 호출 중계를 위임한다.
 *  둘 다 아니면 localStorage 와 브라우저 직접 호출을 사용한다.
 * ------------------------------------------------------------------ */

/**
 * `Env` 선언이 담당하는 값을 보관한다.
 */
const Env = {
    mode: 'local',      // 'local' | 'server' | 'desktop'
    backend: null,      // 백엔드 또는 데스크톱 앱이 알려준 정보
    desktop: null,      // electron preload 가 노출한 브리지
    detected: false,

/**
 * `detect` 작업을 수행한다.
 */
    async detect() {
        if (this.detected) return this.mode;
        this.detected = true;

        // electron 빌드에서는 브리지가 먼저 존재하므로 네트워크 확인이 필요 없다.
        const bridge = (typeof window !== 'undefined') ? window.worldwriterDesktop : null;
        if (bridge && typeof bridge.storeGet === 'function') {
            this.desktop = bridge;
            this.mode = 'desktop';
            try {
                this.backend = await bridge.info();
            } catch (e) {
                this.backend = null;
            }
            return this.mode;
        }

        try {
            const res = await fetch('./api/health', { method: 'GET' });
            if (res.ok) {
                const info = await res.json();
                if (info && info.ok) {
                    this.mode = 'server';
                    this.backend = info;
                }
            }
        } catch (e) {
            // 정적 환경이거나 백엔드가 없는 경우이다. localStorage 를 사용한다.
            this.mode = 'local';
        }
        return this.mode;
    },

/**
 * `isServer` 작업을 수행한다.
 */
    isServer() { return this.mode === 'server'; },

/**
 * `isDesktop` 작업을 수행한다.
 */
    isDesktop() { return this.mode === 'desktop'; }
};

/** 데스크톱 브리지 응답에서 오류를 확인하고 결과를 돌려준다. */
function desktopResult(body) {
    if (!body) throw new Error(localize('데스크톱 앱이 응답하지 않았습니다.', 'The desktop app did not respond.'));
    if (body.error) throw new Error(body.error);
    return body;
}

/* ------------------------------------------------------------------ *
 *  저장소 추상화
 *
 *  key 는 사용자 단위로 구분되며, 실제 저장 위치는 실행 환경에 따라 달라진다.
 *   - local   : localStorage (LZ 압축 적용)
 *   - server  : 백엔드의 파일 저장소 (~/.worldwriter/<사용자명>/)
 *   - desktop : electron 앱 데이터 폴더의 파일 저장소 (<userData>/data/<사용자명>/)
 * ------------------------------------------------------------------ */

/**
 * `Storage` 선언이 담당하는 값을 보관한다.
 */
const Storage = {
    user: '',

/**
 * `setUser` 작업을 수행한다.
 */
    setUser(userName) {
        this.user = String(userName || '').trim();
    },

    /** localStorage 에서 사용할 실제 키 이름 */
    localKey(key) {
        return 'ww.' + encodeURIComponent(this.user) + '.' + key;
    },

/**
 * `get` 작업을 수행한다.
 */
    async get(key, defaultValue) {
        if (Env.isDesktop()) {
            const body = desktopResult(await Env.desktop.storeGet(this.user, key));
            return (body.value === null || body.value === undefined) ? clone(defaultValue) : body.value;
        }
        if (Env.isServer()) {
            const res = await fetch('./api/store?user=' + encodeURIComponent(this.user)
                + '&key=' + encodeURIComponent(key));
            if (!res.ok) throw new Error(localize('저장소 읽기에 실패했습니다.', 'Could not read storage.') + ' (' + res.status + ')');
            const body = await res.json();
            return (body.value === null || body.value === undefined) ? clone(defaultValue) : body.value;
        }
        const raw = window.localStorage.getItem(this.localKey(key));
        if (raw === null) return clone(defaultValue);
        try {
            return JSON.parse(LZ.decompress(raw));
        } catch (e) {
            console.error('저장된 데이터를 읽지 못했습니다: ' + key, e);
            return clone(defaultValue);
        }
    },

/**
 * `set` 작업을 수행한다.
 */
    async set(key, value) {
        if (Env.isDesktop()) {
            desktopResult(await Env.desktop.storeSet(this.user, key, value));
            return;
        }
        if (Env.isServer()) {
            const res = await fetch('./api/store?user=' + encodeURIComponent(this.user)
                + '&key=' + encodeURIComponent(key), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: value })
            });
            if (!res.ok) throw new Error(localize('저장소 쓰기에 실패했습니다.', 'Could not write storage.') + ' (' + res.status + ')');
            return;
        }
        const packed = LZ.compress(JSON.stringify(value));
        try {
            window.localStorage.setItem(this.localKey(key), packed);
        } catch (e) {
            throw new Error(localize('브라우저 저장 공간이 부족합니다. 오래된 프로젝트나 책을 삭제해 주세요.', 'Browser storage is full. Delete old projects or books.'));
        }
    },

/**
 * `remove` 작업을 수행한다.
 */
    async remove(key) {
        if (Env.isDesktop()) {
            desktopResult(await Env.desktop.storeRemove(this.user, key));
            return;
        }
        if (Env.isServer()) {
            await fetch('./api/store?user=' + encodeURIComponent(this.user)
                + '&key=' + encodeURIComponent(key), { method: 'DELETE' });
            return;
        }
        window.localStorage.removeItem(this.localKey(key));
    },

    /** 사용 중인 저장 공간(바이트)을 돌려준다. 파일 저장 모드에서는 null. */
    usage() {
        if (Env.isServer() || Env.isDesktop()) return null;
        let total = 0;
        const prefix = 'ww.' + encodeURIComponent(this.user) + '.';
        for (let i = 0; i < window.localStorage.length; i++) {
            const k = window.localStorage.key(i);
            if (k && k.indexOf(prefix) === 0) {
                total += (window.localStorage.getItem(k) || '').length * 2;
            }
        }
        return total;
    }
};

/* ------------------------------------------------------------------ *
 *  AI 공급자 정의
 * ------------------------------------------------------------------ */

/**
 * `PROVIDERS` 선언이 담당하는 값을 보관한다.
 */
const PROVIDERS = {
    openai: {
        label: 'OpenAI',
        defaultModel: 'gpt-4o',
        defaultBaseUrl: 'https://api.openai.com/v1',
        needsApiKey: true,
        needsBaseUrl: false
    },
    claude: {
        label: 'Claude',
        defaultModel: 'claude-opus-5',
        defaultBaseUrl: 'https://api.anthropic.com',
        needsApiKey: true,
        needsBaseUrl: false
    },
    lmstudio: {
        label: 'LM Studio',
        defaultModel: 'local-model',
        defaultBaseUrl: 'http://localhost:1234',
        needsApiKey: false,
        needsBaseUrl: true
    }
};

/**
 * `DEFAULT_SETTINGS` 선언이 담당하는 값을 보관한다.
 */
const DEFAULT_SETTINGS = {
    provider: 'openai',
    apiKeys: { openai: '', claude: '', lmstudio: '' },
    models: { openai: '', claude: '', lmstudio: '' },
    lmStudioUrl: 'http://localhost:1234',
    language: 'ko',
    darkMode: false
};

/**
 * `LANGUAGE_NAMES` 선언이 담당하는 값을 보관한다.
 */
const LANGUAGE_NAMES = { ko: '한국어', en: 'English' };

/** 로그인 전에도 언어/테마를 적용하기 위한 별도 보관 키 */
const UI_PREF_KEY = 'ww.uipref';

/**
 * `Settings` 선언이 담당하는 값을 보관한다.
 */
const Settings = {
    current: clone(DEFAULT_SETTINGS),

    /**
     * 저장된 설정을 읽어 기본값과 병합한다.
     * @returns {Promise<object>} 현재 적용된 설정
     */
    async load() {
        const saved = await Storage.get('settings', null);
        this.current = Object.assign(clone(DEFAULT_SETTINGS), saved || {});
        this.current.apiKeys = Object.assign({}, DEFAULT_SETTINGS.apiKeys, this.current.apiKeys || {});
        this.current.models = Object.assign({}, DEFAULT_SETTINGS.models, this.current.models || {});
        return this.current;
    },

/**
 * `save` 작업을 수행한다.
 */
    async save(settings) {
        const merged = Object.assign(clone(DEFAULT_SETTINGS), settings || {});
        merged.apiKeys = Object.assign({}, DEFAULT_SETTINGS.apiKeys, merged.apiKeys || {});
        merged.models = Object.assign({}, DEFAULT_SETTINGS.models, merged.models || {});
        this.current = merged;
        await Storage.set('settings', this.current);
        // 로그인 화면에서도 언어/다크모드를 적용할 수 있도록 사본을 남긴다.
        try {
            window.localStorage.setItem(UI_PREF_KEY, JSON.stringify({
                language: this.current.language,
                darkMode: this.current.darkMode
            }));
        } catch (e) { /* 저장 실패는 무시한다. */ }
        return this.current;
    },

    /** 로그인 전에 사용할 표시 설정 */
    readUiPreference() {
        try {
            const raw = window.localStorage.getItem(UI_PREF_KEY);
            if (raw) return Object.assign({ language: 'ko', darkMode: false }, JSON.parse(raw));
        } catch (e) { /* 무시 */ }
        return { language: 'ko', darkMode: false };
    },

    /** 현재 선택된 공급자의 모델명 (미입력 시 기본값) */
    modelOf(settings) {
        const conf = settings || this.current;
        const spec = PROVIDERS[conf.provider] || PROVIDERS.openai;
        const chosen = (conf.models || {})[conf.provider];
        return isBlank(chosen) ? spec.defaultModel : String(chosen).trim();
    },

/**
 * `baseUrlOf` 작업을 수행한다.
 */
    baseUrlOf(settings) {
        const conf = settings || this.current;
        const spec = PROVIDERS[conf.provider] || PROVIDERS.openai;
        if (conf.provider === 'lmstudio') {
            const url = isBlank(conf.lmStudioUrl) ? spec.defaultBaseUrl : String(conf.lmStudioUrl).trim();
            return url.replace(/\/+$/, '');
        }
        return spec.defaultBaseUrl;
    },

/**
 * `apiKeyOf` 작업을 수행한다.
 */
    apiKeyOf(settings) {
        const conf = settings || this.current;
        return String((conf.apiKeys || {})[conf.provider] || '').trim();
    },

/**
 * `languageName` 작업을 수행한다.
 */
    languageName(settings) {
        const conf = settings || this.current;
        return LANGUAGE_NAMES[conf.language] || LANGUAGE_NAMES.ko;
    }
};

/* ------------------------------------------------------------------ *
 *  AI 호출
 * ------------------------------------------------------------------ */

/** 응답 본문에서 오류 메시지를 최대한 읽어낸다. */
async function readErrorMessage(res) {
    let detail = '';
    try {
        const text = await res.text();
        try {
            const json = JSON.parse(text);
            detail = (json.error && (json.error.message || json.error.type)) || json.message || text;
        } catch (e) {
            detail = text;
        }
    } catch (e) { /* 무시 */ }
    return localize('AI 호출에 실패했습니다.', 'AI request failed.') + ' (HTTP ' + res.status + ') ' + String(detail).substring(0, 400);
}

/** OpenAI 호환 (OpenAI, LM Studio) 채팅 호출 */
async function callOpenAiCompatible(conf, request) {
    const baseUrl = Settings.baseUrlOf(conf).replace(/\/+$/, '');
    const apiKey = Settings.apiKeyOf(conf);
    // LM Studio 설정에는 서버 주소만 입력받으므로 /v1 을 붙여준다.
    const url = baseUrl + (conf.provider === 'lmstudio' ? '/v1' : '') + '/chat/completions';

    const messages = [];
    if (!isBlank(request.system)) messages.push({ role: 'system', content: request.system });
    request.messages.forEach(function (m) { messages.push(m); });

    const headers = { 'Content-Type': 'application/json' };
    if (!isBlank(apiKey)) headers['Authorization'] = 'Bearer ' + apiKey;

    // 일부 최신 모델은 max_tokens 대신 max_completion_tokens 만 허용한다.
    const attempt = async function (tokenField) {
        const body = { model: Settings.modelOf(conf), messages: messages };
        body[tokenField] = request.maxTokens;
        return await fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body) });
    };

    let res = await attempt('max_tokens');
    if (res.status === 400) {
        const message = await res.clone().text();
        if (message.indexOf('max_completion_tokens') >= 0) {
            res = await attempt('max_completion_tokens');
        }
    }
    if (!res.ok) throw new Error(await readErrorMessage(res));

    const body = await res.json();
    const choice = (body.choices || [])[0];
    if (!choice) throw new Error(localize('AI 응답이 비어 있습니다.', 'The AI response is empty.'));
    const content = choice.message && choice.message.content;
    if (Array.isArray(content)) {
        return content.map(function (p) { return p.text || ''; }).join('');
    }
    return String(content || '');
}

/** Anthropic Claude Messages API 호출 */
async function callClaude(conf, request) {
    const baseUrl = Settings.baseUrlOf(conf).replace(/\/+$/, '');
    const apiKey = Settings.apiKeyOf(conf);

    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        // 브라우저에서 직접 호출할 때 필요한 헤더이다.
        'anthropic-dangerous-direct-browser-access': 'true'
    };

    const body = {
        model: Settings.modelOf(conf),
        max_tokens: request.maxTokens,
        messages: request.messages
    };
    if (!isBlank(request.system)) body.system = request.system;

    const res = await fetch(baseUrl + '/v1/messages', {
        method: 'POST', headers: headers, body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));

    const json = await res.json();
    if (json.stop_reason === 'refusal') {
        const reason = json.stop_details && json.stop_details.explanation;
        throw new Error(localize('AI가 요청을 거절했습니다. ', 'The AI refused the request. ', conf) + (reason || ''));
    }
    return (json.content || [])
        .filter(function (b) { return b.type === 'text'; })
        .map(function (b) { return b.text; })
        .join('');
}

/* ------------------------------------------------------------------ *
 *  AI 작업용 WebSocket 연결 (server 모드 전용)
 *
 *  AI 한 번 호출이 수 분까지 걸릴 수 있어 일반 HTTP 요청은 브라우저·프록시의
 *  시간 제한에 걸리기 쉽다. 백엔드가 WebSocket 을 제공하면 그 연결로 요청을 보내고
 *  진행 알림을 받아 연결을 살려 둔다.
 *
 *  연결이 끊겨도 서버는 작업을 계속하므로, 다시 연결해 같은 작업 id 로 붙으면
 *  진행 상태나 완료된 결과를 그대로 받는다. WebSocket 을 쓸 수 없는 환경
 *  (구버전 백엔드, 소켓을 막는 프록시)에서는 기존 `/api/ai` 호출로 되돌아간다.
 * ------------------------------------------------------------------ */

/** 연결 시도 실패 후 다시 시도하기까지의 간격(ms) */
const AI_SOCKET_RETRY_MS = 2000;

/** 연결을 기다리는 최대 시간(ms). 이 안에 열리지 않으면 HTTP 로 처리한다. */
const AI_SOCKET_OPEN_TIMEOUT = 8000;

/** 진행 알림이 이 시간 동안 없으면 연결이 죽은 것으로 보고 다시 붙는다. */
const AI_SOCKET_SILENCE_MS = 60000;

/**
 * `AiSocket` 선언이 담당하는 값을 보관한다.
 */
const AiSocket = {
    /** 'idle' | 'connecting' | 'open' | 'closed' | 'unsupported' */
    state: 'idle',

    /** 열려 있는 WebSocket */
    socket: null,

    /** 서버가 알려준 규약 정보 */
    info: null,

    /** 진행 중이거나 결과를 기다리는 작업 : Map<id, job> */
    jobs: new Map(),

    /** 연결을 기다리는 대기열 */
    waiting: [],

    /** 사용자가 끈 경우 다시 연결하지 않는다. */
    stopped: false,

    /** 이 백엔드가 WebSocket 을 제공하는지 확인한다. */
    supported() {
        if (typeof WebSocket === 'undefined') return false;
        if (!Env.isServer()) return false;
        // 구버전 백엔드는 health 에 websocket 표시가 없다.
        return !!(Env.backend && Env.backend.websocket);
    },

    /** 연결할 주소를 만든다. (현재 페이지 주소 기준) */
    url() {
        const path = (Env.backend && Env.backend.wsPath) || '/api/ws';
        const base = new URL(path, window.location.href);
        base.protocol = (base.protocol === 'https:') ? 'wss:' : 'ws:';
        return base.toString();
    },

    /**
     * 연결을 열고 기다린다. 이미 열려 있으면 그대로 돌려준다.
     * @returns {Promise<WebSocket|null>} 열린 소켓. 열 수 없으면 null
     */
    connect() {
        if (!this.supported()) {
            this.state = 'unsupported';
            return Promise.resolve(null);
        }
        if (this.socket && this.state === 'open') return Promise.resolve(this.socket);
        if (this.state === 'connecting') {
            return new Promise((resolve) => { this.waiting.push(resolve); });
        }

        this.state = 'connecting';
        this.stopped = false;
        return new Promise((resolve) => {
            let settled = false;
            const done = (socket) => {
                if (settled) return;
                settled = true;
                const queue = this.waiting;
                this.waiting = [];
                queue.forEach(function (fn) { fn(socket); });
                resolve(socket);
            };

            let socket;
            try {
                socket = new WebSocket(this.url());
            } catch (e) {
                this.state = 'closed';
                done(null);
                return;
            }
            this.socket = socket;

            const timer = setTimeout(() => {
                if (this.state !== 'open') {
                    try { socket.close(); } catch (e) { /* 무시 */ }
                    this.state = 'closed';
                    done(null);
                }
            }, AI_SOCKET_OPEN_TIMEOUT);

            socket.onopen = () => {
                clearTimeout(timer);
                this.state = 'open';
                // 아직 못 보낸 요청은 보내고, 서버가 이미 받은 작업에는 다시 붙는다.
                this.jobs.forEach((job) => this.submit(job));
                done(socket);
            };
            socket.onmessage = (event) => this.receive(event);
            socket.onerror = () => { /* onclose 에서 함께 처리한다. */ };
            socket.onclose = () => {
                clearTimeout(timer);
                this.socket = null;
                this.state = this.stopped ? 'idle' : 'closed';
                done(null);
                // 기다리는 작업이 남아 있으면 다시 연결해 결과를 받아 온다.
                if (!this.stopped && this.hasPending()) {
                    setTimeout(() => { this.connect(); }, AI_SOCKET_RETRY_MS);
                }
            };
        });
    },

    /**
     * 작업을 서버에 보낸다. 상태에 따라 새 요청과 재접속을 구분한다.
     *  - pending/sent : 아직 서버가 받았는지 모르므로 요청을 보낸다.
     *                   (서버는 같은 id 를 다시 받으면 새로 시작하지 않고 붙여 준다)
     *  - running      : 서버가 이미 받아 진행 중이므로 다시 붙기만 한다.
     * @param {object} job 작업 객체
     * @returns {void}
     */
    submit(job) {
        if (job.state === 'done' || job.state === 'error') return;
        if (job.state === 'running') {
            this.send({ type: 'attach', id: job.id });
            return;
        }
        if (this.send({ type: 'ai', id: job.id, payload: job.payload })) job.state = 'sent';
    },

    /** 결과를 기다리는 작업이 남아 있는지 확인한다. */
    hasPending() {
        let pending = false;
        this.jobs.forEach(function (job) {
            if (job.state !== 'done' && job.state !== 'error') pending = true;
        });
        return pending;
    },

    /** 메시지를 보낸다. */
    send(message) {
        if (!this.socket || this.state !== 'open') return false;
        try {
            this.socket.send(JSON.stringify(message));
            return true;
        } catch (e) {
            return false;
        }
    },

    /** 서버가 보낸 메시지를 처리한다. */
    receive(event) {
        let message;
        try {
            message = JSON.parse(event.data);
        } catch (e) {
            return;
        }
        if (message.type === 'hello') {
            this.info = message;
            return;
        }
        const job = message.id ? this.jobs.get(message.id) : null;
        if (!job) return;

        job.lastMessageAt = Date.now();
        if (message.type === 'accepted' || message.type === 'progress') {
            job.state = 'running';
            if (typeof message.elapsed === 'number') job.elapsed = message.elapsed;
            if (typeof job.onProgress === 'function') {
                try { job.onProgress(this.describe(job)); } catch (e) { /* 표시 실패는 무시한다. */ }
            }
            return;
        }
        if (message.type === 'result') {
            job.state = 'done';
            this.jobs.delete(job.id);
            job.resolve(String(message.text || ''));
            return;
        }
        if (message.type === 'error') {
            job.state = 'error';
            this.jobs.delete(job.id);
            job.reject(new Error(message.error || localize('AI 호출에 실패했습니다.', 'AI request failed.')));
        }
    },

    /** 작업 상태 요약 */
    describe(job) {
        return {
            id: job.id,
            state: job.state,
            elapsed: Date.now() - job.startedAt,
            since: Date.now() - (job.lastMessageAt || job.startedAt)
        };
    },

    /**
     * 진행 중인 AI 작업 목록을 돌려준다. 화면에서 "계속 진행 중"을 보여줄 때 쓴다.
     * @returns {Array<object>} 작업 요약 목록
     */
    status() {
        const out = [];
        this.jobs.forEach((job) => out.push(this.describe(job)));
        return out;
    },

    /**
     * AI 호출 하나를 WebSocket 으로 보내고 결과를 기다린다.
     * @param {object} payload `/api/ai` 와 같은 형식의 요청
     * @param {{onProgress?: Function}} [options] 진행 알림 콜백
     * @returns {Promise<string>} AI 응답 본문
     */
    request(payload, options) {
        const opts = options || {};
        const id = newId('job');
        const self = this;

        return new Promise(function (resolve, reject) {
            const job = {
                id: id,
                state: 'pending',
                startedAt: Date.now(),
                lastMessageAt: Date.now(),
                elapsed: 0,
                payload: payload,
                onProgress: opts.onProgress,
                resolve: resolve,
                reject: reject
            };
            self.jobs.set(id, job);

            // 진행 알림이 오래 끊기면 연결을 새로 열어 작업에 다시 붙는다.
            job.watchdog = setInterval(function () {
                if (!self.jobs.has(id)) {
                    clearInterval(job.watchdog);
                    return;
                }
                if (Date.now() - job.lastMessageAt < AI_SOCKET_SILENCE_MS) return;
                job.lastMessageAt = Date.now();
                if (self.state === 'open') self.submit(job);
                else self.connect();
            }, AI_SOCKET_SILENCE_MS / 2);
            if (job.watchdog && job.watchdog.unref) job.watchdog.unref();

            const cleanup = function () { clearInterval(job.watchdog); };
            const originalResolve = job.resolve;
            const originalReject = job.reject;
            job.resolve = function (value) { cleanup(); originalResolve(value); };
            job.reject = function (error) { cleanup(); originalReject(error); };

            self.connect().then(function (socket) {
                if (!socket) {
                    self.jobs.delete(id);
                    job.reject(new Error(localize('AI 서버 연결(WebSocket)을 열지 못했습니다.',
                        'Could not open the AI server connection (WebSocket).')));
                    return;
                }
                // onopen 에서 이미 보냈을 수 있다. 서버가 같은 id 를 중복 처리하지 않는다.
                if (job.state === 'pending') self.submit(job);
            });
        });
    },

    /** 연결을 닫는다. (로그아웃·테스트 정리용) */
    disconnect() {
        this.stopped = true;
        this.jobs.clear();
        if (this.socket) {
            try { this.socket.close(); } catch (e) { /* 무시 */ }
        }
        this.socket = null;
        this.state = 'idle';
    }
};

/** 백엔드 중계를 통한 호출 (CORS 회피) */
/** 백엔드에 보낼 요청 본문을 만든다. HTTP 와 WebSocket 이 같은 형식을 쓴다. */
function backendPayload(conf, request) {
    return {
        provider: conf.provider,
        language: conf.language,
        model: Settings.modelOf(conf),
        apiKey: Settings.apiKeyOf(conf),
        baseUrl: Settings.baseUrlOf(conf),
        system: request.system || '',
        messages: request.messages,
        maxTokens: request.maxTokens
    };
}

/**
 * 백엔드 중계를 통한 호출.
 * WebSocket 을 쓸 수 있으면 그쪽으로 보내 시간 제한을 피하고, 안 되면 HTTP 로 처리한다.
 */
async function callViaBackend(conf, request) {
    if (AiSocket.supported()) {
        try {
            return await AiSocket.request(backendPayload(conf, request), { onProgress: request.onProgress });
        } catch (error) {
            // 연결 자체를 열지 못한 경우에만 HTTP 로 되돌아간다. (공급자 오류는 그대로 알린다)
            if (String(error && error.message).indexOf('WebSocket') < 0) throw error;
            console.warn('WebSocket 을 쓰지 못해 HTTP 로 AI 를 호출합니다.', error);
        }
    }
    return await callViaBackendHttp(conf, request);
}

/** 기존 방식의 HTTP 호출 (구버전 백엔드나 소켓이 막힌 환경에서 사용) */
async function callViaBackendHttp(conf, request) {
    const res = await fetch('./api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload(conf, request))
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    const body = await res.json();
    if (body.error) throw new Error(body.error);
    return String(body.text || '');
}

/** electron 메인 프로세스를 통한 호출 (CORS 회피, API 키는 메인 프로세스에서만 사용) */
async function callViaDesktop(conf, request) {
    const body = desktopResult(await Env.desktop.ai({
        provider: conf.provider,
        language: conf.language,
        model: Settings.modelOf(conf),
        apiKey: Settings.apiKeyOf(conf),
        baseUrl: Settings.baseUrlOf(conf),
        system: request.system || '',
        messages: request.messages,
        maxTokens: request.maxTokens
    }));
    return String(body.text || '');
}

/**
 * `AI` 선언이 담당하는 값을 보관한다.
 */
const AI = {
    /**
     * AI 에게 한 번 질의하고 텍스트 응답을 받는다.
     * @param {{system?:string, prompt?:string, messages?:Array, maxTokens?:number, settings?:object}} options
     * @returns {Promise<string>}
     */
    async chat(options) {
        const conf = options.settings || Settings.current;
        const spec = PROVIDERS[conf.provider];
        if (!spec) throw new Error(localize('알 수 없는 AI 공급자입니다: ', 'Unknown AI provider: ', conf) + conf.provider);
        if (spec.needsApiKey && isBlank(Settings.apiKeyOf(conf))) {
            throw new Error(localize('설정 화면에서 ' + spec.label + ' API 키를 먼저 입력해 주세요.', 'Enter your ' + spec.label + ' API key in settings.', conf));
        }

        const request = {
            system: options.system || '',
            messages: options.messages || [{ role: 'user', content: options.prompt || '' }],
            maxTokens: options.maxTokens || 8000,
            // 백엔드가 보내는 진행 알림을 화면에 전달할 때 쓴다.
            onProgress: options.onProgress
        };

        if (Env.isDesktop()) return await callViaDesktop(conf, request);
        if (Env.isServer()) return await callViaBackend(conf, request);
        if (conf.provider === 'claude') return await callClaude(conf, request);
        return await callOpenAiCompatible(conf, request);
    },

    /** 설정 화면의 연결 확인용 호출 */
    async testConnection(settings) {
        const text = await this.chat({
            settings: settings,
            system: '너는 연결 확인용 응답기다. 다른 말 없이 요청받은 단어만 출력한다.',
            prompt: 'OK 라고만 답하세요.',
            maxTokens: 64
        });
        return text.trim();
    },

    /** JSON 응답을 요구하는 질의. 코드블록이나 앞뒤 설명이 섞여 있어도 파싱한다. */
    async chatJson(options) {
        const text = await this.chat(options);
        return parseJsonLoosely(text);
    }
};

/** 응답 문자열에서 JSON 부분만 뽑아 파싱한다. */
function parseJsonLoosely(text) {
    if (isBlank(text)) throw new Error(localize('AI 응답이 비어 있습니다.', 'The AI response is empty.'));
    let body = String(text).trim();

    // ```json ... ``` 형태의 코드블록 제거
    const fence = body.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) body = fence[1].trim();

    try {
        return JSON.parse(body);
    } catch (e) { /* 아래에서 괄호 범위를 직접 찾아본다. */ }

    let start = -1;
    for (let i = 0; i < body.length; i++) {
        const ch = body.charAt(i);
        if (ch === '{' || ch === '[') { start = i; break; }
    }
    if (start < 0) throw new Error(localize('AI 응답에서 JSON 을 찾지 못했습니다.', 'No JSON was found in the AI response.'));

    const openChar = body.charAt(start);
    const closeChar = openChar === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < body.length; i++) {
        const ch = body.charAt(i);
        if (inString) {
            if (escaped) escaped = false;
            else if (ch === '\\') escaped = true;
            else if (ch === '"') inString = false;
            continue;
        }
        if (ch === '"') { inString = true; continue; }
        if (ch === openChar) depth++;
        else if (ch === closeChar) {
            depth--;
            if (depth === 0) return JSON.parse(body.substring(start, i + 1));
        }
    }
    throw new Error(localize('AI 응답의 JSON 형식이 올바르지 않습니다.', 'The AI response contains invalid JSON.'));
}

/* ------------------------------------------------------------------ *
 *  프로젝트 데이터
 * ------------------------------------------------------------------ */

/**
 * `ITEM_KINDS` 선언이 담당하는 값을 보관한다.
 */
const ITEM_KINDS = ['characters', 'places', 'events'];

/**
 * `KIND_LABELS` 선언이 담당하는 값을 보관한다.
 */
const KIND_LABELS = {
    get characters() { return localize('등장인물', 'Characters'); },
    get places() { return localize('지역', 'Places'); },
    get events() { return localize('주요 사건', 'Major events'); }
};

/**
 * `emptyProject` 작업을 수행한다.
 */
function emptyProject(name) {
    const now = Date.now();
    return {
        id: newId('prj'),
        name: String(name || '').trim(),
        createdAt: now,
        updatedAt: now,
        description: '',
        characters: [],
        places: [],
        events: [],
        flow: [],
        targetVolumes: 0,
        books: []          // { id, index, title, chapterCount, charCount, createdAt }
    };
}

/**
 * `Projects` 선언이 담당하는 값을 보관한다.
 */
const Projects = {
    /** 프로젝트 목록 (요약 정보만) */
    async list() {
        const list = await Storage.get('projects', []);
        return Array.isArray(list) ? list : [];
    },

/**
 * `saveList` 작업을 수행한다.
 */
    async saveList(list) {
        await Storage.set('projects', list);
    },

/**
 * `create` 작업을 수행한다.
 */
    async create(name) {
        if (isBlank(name)) throw new Error(localize('프로젝트 이름을 입력해 주세요.', 'Enter a project name.'));
        const project = emptyProject(name);
        await Storage.set('project.' + project.id, project);
        const list = await this.list();
        list.push({
            id: project.id, name: project.name,
            createdAt: project.createdAt, updatedAt: project.updatedAt
        });
        await this.saveList(list);
        return project;
    },

/**
 * `load` 작업을 수행한다.
 */
    async load(projectId) {
        const project = await Storage.get('project.' + projectId, null);
        if (!project) throw new Error(localize('프로젝트를 찾을 수 없습니다.', 'Project not found.'));
        ITEM_KINDS.forEach(function (kind) {
            if (!Array.isArray(project[kind])) project[kind] = [];
        });
        if (!Array.isArray(project.flow)) project.flow = [];
        if (!Array.isArray(project.books)) project.books = [];
        // 본문 저장 직후 종료되어 메타데이터가 뒤처진 경우 본문을 기준으로 복구한다.
        const last = project.books[project.books.length - 1];
        if (last) {
            const book = await Storage.get(Books.key(project.id, last.id), null);
            if (book) project.books[project.books.length - 1] = Books.metaOf(book);
        }
        return project;
    },

/**
 * `save` 작업을 수행한다.
 */
    async save(project) {
        const saved = await Storage.get('project.' + project.id, null);
        if (saved && (saved.books || []).length > 0) {
            if (saved.targetVolumes !== project.targetVolumes
                || JSON.stringify(saved.flow) !== JSON.stringify(project.flow)) {
                throw new Error(localize('책이 있는 동안 사건 흐름과 목표 권수를 변경할 수 없습니다.',
                    'The event flow and volume count are locked while books exist.'));
            }
        }
        project.updatedAt = Date.now();
        await Storage.set('project.' + project.id, project);
        const list = await this.list();
        const found = list.filter(function (p) { return p.id === project.id; })[0];
        if (found) {
            found.name = project.name;
            found.updatedAt = project.updatedAt;
        } else {
            list.push({
                id: project.id, name: project.name,
                createdAt: project.createdAt, updatedAt: project.updatedAt
            });
        }
        await this.saveList(list);
        return project;
    },

/**
 * `remove` 작업을 수행한다.
 */
    async remove(projectId) {
        if (activeGenerations.has(projectId)) throw new Error(localize('생성을 중단한 후 삭제해 주세요.', 'Stop generation before deleting.'));
        const project = await Storage.get('project.' + projectId, null);
        if (project && Array.isArray(project.books)) {
            for (const meta of project.books) {
                await Storage.remove('book.' + projectId + '.' + meta.id);
            }
        }
        await Storage.remove('project.' + projectId);
        // 프로젝트에 딸린 AI 대화 기록도 함께 지운다.
        await Storage.remove('chat.' + projectId);
        const list = await this.list();
        await this.saveList(list.filter(function (p) { return p.id !== projectId; }));
    },

/**
 * `rename` 작업을 수행한다.
 */
    async rename(projectId, name) {
        if (isBlank(name)) throw new Error(localize('프로젝트 이름을 입력해 주세요.', 'Enter a project name.'));
        const project = await this.load(projectId);
        project.name = String(name).trim();
        await this.save(project);
        return project;
    },

    /**
     * 진행 가능한 최대 단계.
     * 1단계는 항상 열려 있고, 이후 단계는 앞 단계의 결과가 있어야 열린다.
     */
    detailsComplete(project) {
        return ITEM_KINDS.every(kind => (project[kind] || []).length > 0
            && project[kind].every(item => !isBlank(item.name) && !isBlank(item.detail)));
    },

/**
 * `validateTarget` 작업을 수행한다.
 */
    validateTarget(project, value) {
        const text = String(value).trim();
        const count = Number(text);
        if (!/^\d+$/.test(text) || !Number.isSafeInteger(count) || count < 1 || count > project.flow.length) {
            throw new Error(localize('목표 권수는 1부터 사건 수(' + project.flow.length + ') 사이의 정수여야 합니다.',
                'Volume count must be an integer between 1 and the event count (' + project.flow.length + ').'));
        }
        if (project.books.length > 0 && count !== project.targetVolumes) {
            throw new Error(localize('책이 있는 동안 목표 권수를 변경할 수 없습니다.', 'Volume count is locked while books exist.'));
        }
        return count;
    },

    /**
     * 사건 흐름 생성 전에 사용할 목표 권수를 검증한다.
     * 흐름은 최대 80개 항목으로 생성하므로 권수도 그 범위 안에서 받는다.
     * @param {object} project 대상 프로젝트
     * @param {string|number} value 목표 권수
     * @returns {number} 검증한 목표 권수
     */
    validateFlowTarget(project, value) {
        const text = String(value).trim();
        const count = Number(text);
        if (!/^\d+$/.test(text) || !Number.isSafeInteger(count) || count < 1 || count > 80) {
            throw new Error(localize('목표 권수는 사건 흐름 생성 전에 1부터 80 사이의 정수로 지정해 주세요.',
                'Before generating the event flow, set target volumes to an integer between 1 and 80.'));
        }
        return count;
    },

    /**
     * 3단계의 목표 권수를 지정한다.
     * 이미 만든 사건 흐름과 다른 권수를 선택하면 흐름을 비워 새 권수 기준으로 다시 생성하게 한다.
     * @param {object} project 대상 프로젝트
     * @param {string|number} value 목표 권수
     * @returns {Promise<{count: number, flowCleared: boolean}>} 저장할 권수와 흐름 초기화 여부
     */
    async setTargetVolumes(project, value) {
        await this.assertStructureEditable(project);
        const count = this.validateFlowTarget(project, value);
        const flowCleared = (project.flow || []).length > 0 && Number(project.targetVolumes) !== count;
        project.targetVolumes = count;
        if (flowCleared) project.flow = [];
        return { count: count, flowCleared: flowCleared };
    },

/**
 * `assertStructureEditable` 작업을 수행한다.
 */
    async assertStructureEditable(project) {
        const saved = await Storage.get('project.' + project.id, null);
        if (project.books.length > 0 || (saved && (saved.books || []).length > 0)) {
            throw new Error(localize('기존 책을 보존하기 위해 개요 재생성과 사건 흐름 변경을 잠갔습니다. 마지막 권부터 모두 삭제하면 변경할 수 있습니다.',
                'Outline regeneration and flow changes are locked to preserve existing books. Delete all books from the last volume first to unlock them.'));
        }
    },

    /**
     * 2단계 설정 항목을 하나 추가한다.
     * @param {object} project 대상 프로젝트
     * @param {string} kind characters | places | events
     * @param {{name?: string, summary?: string, detail?: string}} [values] 새 항목의 초기값
     * @returns {Promise<object>} 추가한 항목
     */
    async addItem(project, kind, values) {
        if (ITEM_KINDS.indexOf(kind) < 0) {
            throw new Error(localize('설정 항목 종류가 올바르지 않습니다.', 'The item kind is invalid.'));
        }
        await this.assertStructureEditable(project);
        const source = values || {};
        const item = {
            id: newId('itm'),
            name: String(source.name || '').trim(),
            summary: String(source.summary || '').trim(),
            detail: String(source.detail || '').trim()
        };
        project[kind].push(item);
        return item;
    },

    /**
     * 2단계 설정 항목 하나를 삭제하고 관련 사건 흐름과 목표 권수도 초기화한다.
     * @param {object} project 대상 프로젝트
     * @param {string} kind characters | places | events
     * @param {string} itemId 삭제할 항목 식별자
     * @returns {Promise<object>} 삭제한 항목
     */
    async removeItem(project, kind, itemId) {
        if (ITEM_KINDS.indexOf(kind) < 0) {
            throw new Error(localize('설정 항목 종류가 올바르지 않습니다.', 'The item kind is invalid.'));
        }
        await this.assertStructureEditable(project);
        const items = project[kind] || [];
        const index = items.findIndex(function (item) { return item.id === itemId; });
        if (index < 0) {
            throw new Error(localize('삭제할 설정 항목을 찾을 수 없습니다.', 'The item to delete was not found.'));
        }
        const removed = items.splice(index, 1)[0];
        project.flow = [];
        project.targetVolumes = 0;
        return removed;
    },

    /**
     * 2단계 설정 항목을 선택한 종류 또는 전체에서 비운다.
     * 관련 사건 흐름과 목표 권수도 함께 초기화한다.
     * @param {object} project 대상 프로젝트
     * @param {string} [kind] characters | places | events. 생략하면 전체
     * @returns {Promise<string[]>} 비운 항목 종류 목록
     */
    async clearItems(project, kind) {
        const kinds = (kind === undefined || kind === null || kind === '') ? ITEM_KINDS : [kind];
        if (kinds.some(function (entry) { return ITEM_KINDS.indexOf(entry) < 0; })) {
            throw new Error(localize('설정 항목 종류가 올바르지 않습니다.', 'The item kind is invalid.'));
        }
        await this.assertStructureEditable(project);
        kinds.forEach(function (entry) { project[entry] = []; });
        project.flow = [];
        project.targetVolumes = 0;
        return kinds;
    },

/**
 * `maxStep` 작업을 수행한다.
 */
    maxStep(project) {
        if (!project) return 1;
        // 기존 저장 데이터의 상세가 부족하더라도 작성된 책에는 접근할 수 있다.
        if ((project.books || []).length > 0) return 4;
        const hasOutline = ITEM_KINDS.some(function (k) { return (project[k] || []).length > 0; });
        if (!hasOutline) return 1;
        if (!this.detailsComplete(project)) return 2;
        if ((project.flow || []).length === 0) return 3;
        return 4;
    }
};

/* ------------------------------------------------------------------ *
 *  책 본문 저장 (프로젝트와 분리해 한 번에 다루는 데이터 크기를 줄인다.)
 * ------------------------------------------------------------------ */

/**
 * `Books` 선언이 담당하는 값을 보관한다.
 */
const Books = {
/**
 * `key` 작업을 수행한다.
 */
    key(projectId, bookId) { return 'book.' + projectId + '.' + bookId; },

/**
 * `load` 작업을 수행한다.
 */
    async load(projectId, bookId) {
        const book = await Storage.get(this.key(projectId, bookId), null);
        if (!book) throw new Error(localize('책 내용을 찾을 수 없습니다.', 'Book content not found.'));
        if (!Array.isArray(book.chapters)) book.chapters = [];
        return book;
    },

/**
 * `save` 작업을 수행한다.
 */
    async save(projectId, book) {
        await Storage.set(this.key(projectId, book.id), book);
    },

/**
 * `remove` 작업을 수행한다.
 */
    async remove(projectId, bookId) {
        if (activeGenerations.has(projectId)) throw new Error(localize('생성을 중단한 후 삭제해 주세요.', 'Stop generation before deleting.'));
        const project = await Projects.load(projectId);
        if (project.books[project.books.length - 1]?.id !== bookId) {
            throw new Error(localize('마지막 권부터 삭제할 수 있습니다.', 'Only the last volume can be deleted.'));
        }
        project.books.pop();
        await Projects.save(project);
        await Storage.remove(this.key(projectId, bookId));
    },

/**
 * `charCount` 작업을 수행한다.
 */
    charCount(book) {
        return (book.chapters || []).reduce(
            /** 각 장의 본문 글자 수를 누적한다. */
            function (sum, ch) { return sum + (ch.text || '').length; }, 0);
    },

    /** 프로젝트에 보관하는 책 요약 정보 */
    metaOf(book) {
        return {
            id: book.id,
            index: book.index,
            title: book.title,
            chapterCount: (book.chapters || []).length,
            charCount: Books.charCount(book),
            status: book.status || 'complete', // 이전 버전의 책은 그대로 보존한다.
            createdAt: book.createdAt
        };
    },

    /** 책 전체를 하나의 텍스트로 합친다. (내보내기용) */
    toPlainText(book) {
        return (book.chapters || []).map(
            /** 내보낼 장의 제목과 본문을 텍스트로 변환한다. */
            function (ch) {
            return ch.title + '\n\n' + ch.text;
            }).join('\n\n\n');
    }
};

/* ------------------------------------------------------------------ *
 *  프롬프트 구성
 * ------------------------------------------------------------------ */

/**
 * `AUTHOR_PERSONA` 선언이 담당하는 값을 보관한다.
 */
const AUTHOR_PERSONA = '너는 판타지 장편 소설을 집필하는 전문 작가이자 기획자다. '
    + '설정의 일관성을 지키고, 진부한 표현을 피하며, 독자가 몰입할 수 있는 글을 쓴다.';

/**
 * `languageInstruction` 작업을 수행한다.
 */
function languageInstruction(settings) {
    return '모든 결과물은 ' + Settings.languageName(settings) + '(으)로 작성한다.';
}

/** 항목 목록을 프롬프트에 넣을 수 있는 문자열로 만든다. */
function itemsToText(items, withDetail) {
    if (!items || items.length === 0) return '(없음)';
    return items.map(function (item, idx) {
        let line = (idx + 1) + '. ' + item.name + ' : ' + (item.summary || '');
        if (withDetail && !isBlank(item.detail)) {
            line += '\n   상세: ' + String(item.detail);
        }
        return line;
    }).join('\n');
}

/** 1~2단계 설정을 요약한 세계관 설명 */
function worldSummary(project, withDetail) {
    return [
        '[소설 개요]',
        project.description || '(미작성)',
        '',
        '[등장인물]',
        itemsToText(project.characters, withDetail),
        '',
        '[주요 지역]',
        itemsToText(project.places, withDetail),
        '',
        '[주요 사건]',
        itemsToText(project.events, withDetail)
    ].join('\n');
}

/** 3단계 사건 흐름을 프롬프트용 문자열로 만든다. */
function flowToText(flow, markIndex) {
    if (!flow || flow.length === 0) return '(없음)';
    return flow.map(function (item, idx) {
        const mark = (markIndex === idx) ? '   <== 지금 집필할 부분' : '';
        return (idx + 1) + '. ' + item.title + ' : ' + (item.summary || '') + mark;
    }).join('\n');
}

/* ------------------------------------------------------------------ *
 *  생성 파이프라인
 * ------------------------------------------------------------------ */

/**
 * `Pipeline` 선언이 담당하는 값을 보관한다.
 */
const Pipeline = {

    /**
     * 1단계 -> 2단계.
     * 소설 설명을 바탕으로 등장인물 / 지역 / 주요 사건 목록을 생성한다.
     */
    async generateOutline(project, settings) {
        await Projects.assertStructureEditable(project);
        if (isBlank(project.description)) {
            throw new Error(localize('소설에 대한 설명을 먼저 입력해 주세요.', 'Describe the novel first.'));
        }
        const conf = settings || Settings.current;

        const system = AUTHOR_PERSONA + ' ' + languageInstruction(conf)
            + ' 결과는 반드시 JSON 하나만 출력하며, 설명이나 코드블록 표시를 덧붙이지 않는다.';

        const prompt = [
            '아래는 사용자가 만들고자 하는 판타지 소설에 대한 설명이다.',
            '사용자가 명시한 내용은 반드시 그대로 반영하고, 언급되지 않은 부분은 자연스럽게 창작해 채워라.',
            '',
            '[사용자 설명]',
            project.description,
            '',
            '위 설명을 바탕으로 다음 JSON 구조로 답하라.',
            '- characters : 등장인물 6~12명',
            '- places : 주요 지역 5~10곳',
            '- events : 소설 전체를 관통하는 주요 사건 8~15개 (시간 순서대로)',
            'name 은 고유명사 위주의 짧은 이름, summary 는 한 줄(80자 이내) 요약이다.',
            '',
            '{',
            '  "characters": [ { "name": "", "summary": "" } ],',
            '  "places":     [ { "name": "", "summary": "" } ],',
            '  "events":     [ { "name": "", "summary": "" } ]',
            '}'
        ].join('\n');

        const json = await AI.chatJson({ settings: conf, system: system, prompt: prompt, maxTokens: 8000 });

        const toItems = function (list) {
            if (!Array.isArray(list)) return [];
            return list.filter(function (row) { return row && !isBlank(row.name); }).map(function (row) {
                return {
                    id: newId('itm'),
                    name: String(row.name).trim(),
                    summary: String(row.summary || '').trim(),
                    detail: ''
                };
            });
        };

        const outline = Object.fromEntries(ITEM_KINDS.map(kind => [kind, toItems(json?.[kind])]));
        if (ITEM_KINDS.some(kind => outline[kind].length === 0)) {
            throw new Error(localize('AI가 유효한 목록을 만들지 못했습니다. 설명을 조금 더 구체적으로 작성해 보세요.', 'The AI did not return valid characters, places and events. Try a more detailed description.'));
        }
        Object.assign(project, outline);

        // 뒤 단계 결과는 새 설정과 맞지 않으므로 비운다.
        project.flow = [];
        return project;
    },

    /**
     * 2단계. 특정 항목의 상세 설명을 생성한다.
     * @param {string} kind characters | places | events
     */
    async generateItemDetail(project, kind, itemId, settings) {
        const conf = settings || Settings.current;
        const item = (project[kind] || []).filter(function (i) { return i.id === itemId; })[0];
        if (!item) throw new Error(localize('항목을 찾을 수 없습니다.', 'Item not found.'));

        const label = KIND_LABELS[kind] || '항목';
        const system = AUTHOR_PERSONA + ' ' + languageInstruction(conf)
            + ' 설명문만 출력하고 제목이나 머리말은 붙이지 않는다.';

        const focus = kind === 'characters'
            ? '외모, 성격, 배경, 능력, 다른 인물과의 관계, 이야기에서 맡는 역할을 400~700자로 서술하라.'
            : (kind === 'places'
                ? '지리와 풍경, 문화와 세력, 역사, 이야기에서 이 지역이 갖는 의미를 400~700자로 서술하라.'
                : '사건의 발단과 전개, 관련 인물과 장소, 결과와 파급 효과를 400~700자로 서술하라.');

        const prompt = [
            worldSummary(project, false),
            '',
            '위 설정을 바탕으로, 아래 ' + label + ' 항목의 상세 설명을 작성하라.',
            '',
            '대상 ' + label + ' : ' + item.name,
            '한 줄 요약 : ' + (item.summary || '(없음)'),
            '',
            focus,
            '다른 설정과 모순되지 않아야 한다.'
        ].join('\n');

        const text = await AI.chat({ settings: conf, system: system, prompt: prompt, maxTokens: 3000 });
        item.detail = text.trim();
        return item;
    },

    /**
     * 3단계. 사건 흐름을 생성한다.
     * 2단계의 주요 사건을 모두 포함하되, 사이사이를 세분화된 사건으로 채운다.
     */
    async generateFlow(project, settings) {
        const conf = settings || Settings.current;
        await Projects.assertStructureEditable(project);
        if (!Projects.detailsComplete(project)) {
            throw new Error(localize('모든 인물·지역·주요 사건의 상세 설명을 먼저 작성해 주세요.',
                'Complete the details for every character, place and major event first.'));
        }
        if ((project.events || []).length === 0) {
            throw new Error(localize('2단계의 주요 사건이 없습니다. 먼저 2단계를 완료해 주세요.', 'No major events exist. Complete step 2 first.'));
        }

        const targetVolumes = Projects.validateFlowTarget(project, project.targetVolumes);
        const targetCount = clamp(Math.max(project.events.length * 4, targetVolumes), 24, 80);
        const system = AUTHOR_PERSONA + ' ' + languageInstruction(conf)
            + ' 결과는 반드시 JSON 배열 하나만 출력하며, 설명이나 코드블록 표시를 덧붙이지 않는다.';

        const prompt = [
            worldSummary(project, true),
            '[주요 사건 ID]',
            ...project.events.map(event => event.id + ': ' + event.name),
            '',
            '위 설정을 바탕으로 소설 전체의 사건 흐름을 시간 순서대로 나열하라.',
            '- [주요 사건] 목록의 사건은 반드시 모두 포함해야 한다.',
            '- 주요 사건 사이를 잇는 세부 사건(만남, 갈등, 이동, 복선, 전투, 반전 등)을 추가해 흐름을 촘촘하게 만들어라.',
            '- 이 소설은 총 ' + targetVolumes + '권으로 구성한다. 각 권이 도입·전개·전환·절정 등 뚜렷한 이야기 단위를 갖고 다음 권으로 자연스럽게 이어지도록 사건을 배치하라.',
            '- 각 권에 하나 이상의 사건 항목이 배정될 수 있도록 전체 항목 수는 최소 ' + targetVolumes + '개여야 한다.',
            '- 각 항목은 소설 한 장(章) 분량에 해당하는 크기여야 한다.',
            '- 전체 항목 수는 ' + targetCount + '개 내외로 한다.',
            '- 주요 사건은 반드시 각각 별도 항목으로 포함한다. sourceEventId에는 해당 주요 사건 ID를 그대로 쓴다. 세부 사건은 null이다.',
            '',
            '[ { "title": "사건 제목", "summary": "이 사건에서 벌어지는 일 두 줄 이내 요약", "sourceEventId": "주요 사건 ID 또는 null" } ]'
        ].join('\n');

        const json = await AI.chatJson({ settings: conf, system: system, prompt: prompt, maxTokens: 16000 });
        const rows = Array.isArray(json) ? json : (Array.isArray(json?.flow) ? json.flow : []);

        const flow = rows.filter(function (row) { return row && !isBlank(row.title); }).map(function (row) {
            return {
                id: newId('flw'),
                title: String(row.title).trim(),
                summary: String(row.summary || '').trim(),
                sourceEventId: project.events.some(event => event.id === row.sourceEventId) ? row.sourceEventId : null,
                main: project.events.some(event => event.id === row.sourceEventId)
            };
        });

        if (flow.length === 0) throw new Error(localize('AI가 사건 흐름을 만들지 못했습니다. 다시 시도해 주세요.', 'The AI did not create an event flow. Try again.'));
        // 누락은 원래 사건의 설명으로 보완한다. 비용이 드는 재호출 없이 주요 사건 순서를 유지한다.
        for (let i = 0; i < project.events.length; i++) {
            const event = project.events[i];
            if (flow.some(item => item.sourceEventId === event.id)) continue;
            const nextIds = new Set(project.events.slice(i + 1).map(item => item.id));
            const nextIndex = flow.findIndex(item => nextIds.has(item.sourceEventId));
            flow.splice(nextIndex < 0 ? flow.length : nextIndex, 0, {
                id: newId('flw'), title: event.name, summary: event.detail || event.summary,
                main: true, sourceEventId: event.id
            });
        }
        if (flow.length < targetVolumes) {
            throw new Error(localize('AI가 목표 권수에 배정할 만큼의 사건을 만들지 못했습니다. 다시 시도해 주세요.',
                'The AI did not create enough events for the target volumes. Try again.'));
        }
        project.flow = flow;
        return project;
    },

    /**
     * 사건 흐름을 목표 권수만큼 나눈다.
     * @returns {Array<Array>} 권별 사건 배열
     */
    splitFlowByVolumes(flow, totalVolumes) {
        const volumes = [];
        const count = Number(totalVolumes);
        if (!Number.isSafeInteger(count) || count < 1 || count > flow.length) {
            throw new Error(localize('목표 권수는 1부터 사건 수 사이의 정수여야 합니다.', 'Volume count must be an integer between 1 and the event count.'));
        }
        const base = Math.floor(flow.length / count);
        const extra = flow.length % count;
        let cursor = 0;
        for (let v = 0; v < count; v++) {
            const size = base + (v < extra ? 1 : 0);
            volumes.push(flow.slice(cursor, cursor + size));
            cursor += size;
        }
        return volumes;
    },

    /**
     * 4단계. 다음 권을 생성한다.
     * 사건 흐름 중 이번 권 구간을 사건 단위로 나누어 순차 생성한다.
     * 목표 분량까지 사건별로 여러 번 호출하며, 미완성 권은 저장된 본문에서 이어 쓴다.
     *
     * @param {object} project
     * @param {{onProgress?:Function, settings?:object, cancelled?:Function}} options
     */
    async generateNextBook(project, options) {
        if (activeGenerations.has(project.id)) {
            throw new Error(localize('이미 이 프로젝트의 책을 생성 중입니다.', 'A book is already being generated for this project.'));
        }
        activeGenerations.add(project.id);
        try {
            Object.assign(project, await Projects.load(project.id));
            return await this.writeBook(project, options);
        } finally {
            activeGenerations.delete(project.id);
        }
    },

    /** 마지막 완료 권 바로 뒤에 다음 한 권만 추가한다. */
    async generateFollowingBook(project, options) {
        if (activeGenerations.has(project.id)) {
            throw new Error(localize('이미 이 프로젝트의 책을 생성 중입니다.', 'A book is already being generated for this project.'));
        }
        activeGenerations.add(project.id);
        try {
            Object.assign(project, await Projects.load(project.id));
            const last = project.books[project.books.length - 1];
            if (last && last.status && last.status !== 'complete') {
                throw new Error(localize('마지막 책이 아직 완성되지 않았습니다. 먼저 이어쓰기를 완료해 주세요.',
                    'The last book is unfinished. Resume it before creating the following book.'));
            }
            return await this.writeBook(project, options);
        } finally {
            activeGenerations.delete(project.id);
        }
    },

    /** 목표 권수까지 남은 책을 차례대로 생성한다. 중단하면 현재 권의 진행분을 남긴다. */
    async generateAllBooks(project, options) {
        if (activeGenerations.has(project.id)) {
            throw new Error(localize('이미 이 프로젝트의 책을 생성 중입니다.', 'A book is already being generated for this project.'));
        }
        activeGenerations.add(project.id);
        try {
            Object.assign(project, await Projects.load(project.id));
            const total = Projects.validateTarget(project, project.targetVolumes);
            let latest = null;
            while (project.books.length < total || project.books.some(book => book.status && book.status !== 'complete')) {
                latest = await this.writeBook(project, options);
                if (latest.status !== 'complete' || (options?.cancelled && options.cancelled())) return latest;
                Object.assign(project, await Projects.load(project.id));
            }
            return latest;
        } finally {
            activeGenerations.delete(project.id);
        }
    },

/**
 * `writeBook` 작업을 수행한다.
 */
    async writeBook(project, options) {
        const opts = options || {};
        const conf = opts.settings || Settings.current;
        const onProgress = opts.onProgress || function () { };
        const cancelled = opts.cancelled || function () { return false; };
        const total = Projects.validateTarget(project, project.targetVolumes);
        const last = project.books[project.books.length - 1];
        let book = last ? await Books.load(project.id, last.id) : null;
        if (!book?.generation || book.status === 'complete') {
            if (!Projects.detailsComplete(project)) {
                throw new Error(localize('모든 설정의 상세 설명을 먼저 작성해 주세요.', 'Complete all setting details first.'));
            }
            const index = project.books.length;
            if (index >= total) throw new Error(localize('목표 권수만큼 모두 생성되었습니다.', 'All target volumes have been generated.'));
            const volumes = this.splitFlowByVolumes(project.flow, total);
            const items = volumes[index];
            book = {
                id: newId('bok'), index, title: localize((index + 1) + '권', 'Volume ' + (index + 1), conf),
                createdAt: Date.now(), status: 'paused', chapters: [],
                generation: {
                    version: 1, items: clone(items), total,
                    offset: volumes.slice(0, index).reduce((sum, volume) => sum + volume.length, 0),
                    targetChars: BOOK_LENGTH.target, nextChapter: 0, requestCount: 0,
                    language: conf.language,
                    // API 키를 포함하지 않는 집필 당시 설정 사본.
                    world: Object.fromEntries(['description', ...ITEM_KINDS, 'flow'].map(key => [key, clone(project[key])]))
                }
            };
            // AI 호출 전 빈 책과 목록을 등록하여 이후 모든 진행분을 찾을 수 있게 한다.
            await Books.save(project.id, book);
            project.books.push(Books.metaOf(book));
            await Projects.save(project);
        }
        const generation = book.generation;
        const slice = generation.items;
        const writingSettings = { ...conf, language: generation.language };
        const checkpoint = async () => {
            await Books.save(project.id, book);
            project.books[book.index] = Books.metaOf(book);
            await Projects.save(project);
        };
        let calls = 0;
        let shortResponses = 0;
        try {
            book.status = 'writing';
            await checkpoint();
            for (let i = 0; i < slice.length; i++) {
                const item = slice[i];
                const target = Math.floor(generation.targetChars / slice.length)
                    + (i < generation.targetChars % slice.length ? 1 : 0);
                let chapter = book.chapters[i];
                if (!chapter) {
                    chapter = { id: newId('cht'), flowId: item.id,
                        title: localize((i + 1) + '장. ', 'Chapter ' + (i + 1) + '. ', writingSettings) + item.title, text: '' };
                    book.chapters.push(chapter);
                }
                generation.nextChapter = i;
                while (chapter.text.length < target) {
                    if (cancelled()) {
                        book.status = 'paused';
                        await checkpoint();
                        return book;
                    }
                    if (calls >= 120 || shortResponses >= 3) {
                        throw new Error(localize('짧은 응답 또는 요청 횟수 제한으로 중단했습니다. 저장된 책을 확인하고 이어쓰기를 실행해 주세요.',
                            'Paused after repeated short responses or the request limit. Review the saved book and resume.'));
                    }
                    let previousText = chapter.text || book.chapters[i - 1]?.text || '';
                    if (!previousText && book.index > 0) {
                        const prev = await Books.load(project.id, project.books[book.index - 1].id);
                        previousText = prev.chapters[prev.chapters.length - 1]?.text || '';
                    }
                    const remaining = target - chapter.text.length;
                    onProgress({ phase: 'writing', current: i + 1, total: slice.length, title: item.title,
                        charCount: Books.charCount(book), targetChars: generation.targetChars });
                    const text = await this.writeChapter(generation.world, {
                        settings: writingSettings, flowIndex: generation.offset + i, item, previousText,
                        targetChars: Math.min(5000, remaining), remainingChars: remaining,
                        continuation: chapter.text.length > 0, volumeIndex: book.index, volumeTotal: generation.total,
                        isFirstOfBook: i === 0 && chapter.text.length === 0,
                        isLastOfBook: i === slice.length - 1 && remaining <= 5000
                    });
                    calls++;
                    generation.requestCount++;
                    if (isBlank(text)) throw new Error(localize('AI 응답이 비어 있습니다. 저장된 위치부터 다시 시도할 수 있습니다.',
                        'The AI response was empty. You can resume from the saved position.'));
                    shortResponses = text.length < Math.min(200, remaining) ? shortResponses + 1 : 0;
                    chapter.text += (chapter.text ? '\n\n' : '') + text;
                    await checkpoint();
                    onProgress({ phase: 'saved', current: i + 1, total: slice.length, title: item.title,
                        charCount: Books.charCount(book), targetChars: generation.targetChars });
                    if (Books.charCount(book) > BOOK_LENGTH.max) {
                        throw new Error(localize('본문이 15만 자를 초과했습니다. 저장된 본문을 줄인 후 이어쓰기를 실행해 주세요.',
                            'The book exceeds 150,000 characters. Shorten the saved text, then resume.'));
                    }
                }
                generation.nextChapter = i + 1;
                await checkpoint();
            }
            const length = Books.charCount(book);
            if (length < BOOK_LENGTH.min || length > BOOK_LENGTH.max) {
                throw new Error(localize('책 분량을 확인해 주세요. 완료 범위는 10만~15만 자입니다.',
                    'Review the book length. Completion requires 100,000–150,000 characters.'));
            }
            book.status = 'complete';
            await checkpoint();
            return book;
        } catch (error) {
            book.status = 'error';
            try { await checkpoint(); } catch (saveError) { console.error(saveError); }
            throw error;
        }
    },

    /** 사건 하나를 소설 본문으로 집필한다. */
    async writeChapter(project, params) {
        const conf = params.settings || Settings.current;

        const system = AUTHOR_PERSONA + ' ' + languageInstruction(conf) + ' '
            + '너는 지금 장편 소설의 본문을 집필하고 있다. '
            + '해설이나 요약, 머리말, 장 제목, 마크다운 기호를 쓰지 말고 소설 본문만 출력한다. '
            + '대화와 묘사, 인물의 내면을 균형 있게 배치한다.';

        const prompt = [
            worldSummary(project, true),
            '',
            '[전체 사건 흐름]',
            flowToText(project.flow, params.flowIndex),
            '',
            '[이번에 집필할 사건]',
            '제목 : ' + params.item.title,
            '내용 : ' + (params.item.summary || ''),
            '',
            '[직전까지 쓰인 본문의 끝부분]',
            isBlank(params.previousText) ? '(이 권의 시작 부분이다.)' : tailOf(params.previousText, 2000),
            '',
            '[집필 지시]',
            '- 위 "이번에 집필할 사건" 하나만 다룬다. 뒤의 사건까지 미리 진행하지 않는다.',
            '- 직전 본문에서 자연스럽게 이어지도록 시작한다. 같은 문장을 반복하지 않는다.',
            '- 분량은 공백 포함 ' + params.targetChars + '자 내외로 한다.',
            params.continuation ? '- 현재 사건을 이어 쓰는 중이다. 앞부분을 다시 출력하거나 사건을 처음부터 시작하지 않는다.' : '',
            params.remainingChars > params.targetChars
                ? '- 이 사건에는 아직 약 ' + params.remainingChars + '자가 필요하다. 지금은 갈등과 묘사를 전개하고 결말은 뒤로 남겨라.'
                : '- 이번 응답에서 이 사건을 마무리하라.',
            (params.isFirstOfBook && params.volumeIndex > 0)
                ? '- 이 부분은 ' + (params.volumeIndex + 1) + '권의 시작이다. 앞 권의 흐름을 짧게 환기한 뒤 진행한다.'
                : '',
            (params.isLastOfBook && params.volumeIndex + 1 < params.volumeTotal)
                ? '- 이 부분은 ' + (params.volumeIndex + 1) + '권의 마지막이다. 다음 권으로 이어질 여운을 남긴다.'
                : '',
            '- 본문 외의 어떤 텍스트도 출력하지 않는다.'
        ].filter(function (line) { return line !== ''; }).join('\n');

        const maxTokens = clamp(Math.round(params.targetChars * 2.2), 3000, 32000);
        const text = await AI.chat({ settings: conf, system: system, prompt: prompt, maxTokens: maxTokens });
        return text.trim();
    },

    /** 4단계. AI에게 특정 장의 수정을 요청한다. */
    async reviseChapter(project, chapter, instruction, settings) {
        const conf = settings || Settings.current;
        if (isBlank(instruction)) throw new Error(localize('수정 요청 내용을 입력해 주세요.', 'Enter revision instructions.'));

        const system = AUTHOR_PERSONA + ' ' + languageInstruction(conf) + ' '
            + '너는 이미 쓰인 소설 본문을 요청에 맞게 고쳐 쓴다. '
            + '수정한 본문 전체만 출력하고, 설명이나 변경 목록은 출력하지 않는다.';

        const prompt = [
            worldSummary(project, true),
            '',
            '[수정 요청]',
            instruction,
            '',
            '[원본 본문]',
            chapter.text,
            '',
            '요청을 반영한 본문 전체를 다시 출력하라. 요청과 무관한 부분은 최대한 그대로 둔다.'
        ].join('\n');

        const maxTokens = clamp(Math.round(chapter.text.length * 2.2), 4000, 32000);
        const text = await AI.chat({ settings: conf, system: system, prompt: prompt, maxTokens: maxTokens });
        return text.trim();
    },

    /** 수정된 권 뒤의 모든 권을 장 순서대로 정리하고, 매 장을 즉시 저장한다. */
    async reconcileFollowingBooks(project, changedBookId, change, options) {
        if (activeGenerations.has(project.id)) {
            throw new Error(localize('이미 이 프로젝트의 책을 생성 중입니다.', 'Another book task is already running for this project.'));
        }
        activeGenerations.add(project.id);
        try {
            Object.assign(project, await Projects.load(project.id));
            const sourceIndex = project.books.findIndex(book => book.id === changedBookId);
            if (sourceIndex < 0) throw new Error(localize('수정한 책을 찾을 수 없습니다.', 'The edited book could not be found.'));
            const later = project.books.slice(sourceIndex + 1);
            const opts = options || {};
            const cancelled = opts.cancelled || function () { return false; };
            const onProgress = opts.onProgress || function () { };
            const conf = opts.settings || Settings.current;
            const source = await Books.load(project.id, changedBookId);
            let previousText = source.chapters[source.chapters.length - 1]?.text || '';
            let updatedChapters = 0;
            const totalChapters = later.reduce((sum, meta) => sum + (meta.chapterCount || 0), 0);

            for (let bookOffset = 0; bookOffset < later.length; bookOffset++) {
                if (cancelled()) return { updatedBooks: bookOffset, updatedChapters, cancelled: true };
                const book = await Books.load(project.id, later[bookOffset].id);
                for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
                    if (cancelled()) return { updatedBooks: bookOffset, updatedChapters, cancelled: true };
                    const chapter = book.chapters[chapterIndex];
                    onProgress({ current: updatedChapters + 1, total: Math.max(1, totalChapters),
                        bookTitle: book.title, title: chapter.title });
                    chapter.text = await this.reviseFollowingChapter(project, chapter, {
                        settings: conf, previousText, change
                    });
                    previousText = chapter.text;
                    updatedChapters++;
                    await Books.save(project.id, book);
                    project.books[sourceIndex + 1 + bookOffset] = Books.metaOf(book);
                    await Projects.save(project);
                }
            }
            return { updatedBooks: later.length, updatedChapters, cancelled: false };
        } finally {
            activeGenerations.delete(project.id);
        }
    },

    /** 뒤 권 정리에 쓰는 장 단위 AI 수정 요청. */
    async reviseFollowingChapter(project, chapter, params) {
        const conf = params.settings || Settings.current;
        const change = params.change || {};
        const system = AUTHOR_PERSONA + ' ' + languageInstruction(conf) + ' '
            + '너는 장편 소설의 연속성을 편집한다. 수정된 본문 전체만 출력하고 설명이나 변경 목록은 출력하지 않는다.';
        const prompt = [
            worldSummary(project, true),
            '',
            '[앞 권에서 바뀐 장]',
            '장 제목: ' + (change.chapterTitle || ''),
            '[수정 전 발췌]', excerptOf(change.beforeText, 24000),
            '[수정 후 발췌]', excerptOf(change.afterText, 24000),
            '',
            '[직전 장의 최신 끝부분]',
            isBlank(params.previousText) ? '(없음)' : tailOf(params.previousText, 3000),
            '',
            '[정리할 현재 장 원문]', chapter.text,
            '',
            '[편집 지시]',
            '- 앞 권의 수정으로 인해 현재 장과 이후 전개에 생긴 모순만 자연스럽게 고친다.',
            '- 현재 장이 맡은 사건과 분량, 문체는 최대한 유지한다.',
            '- 직전 장의 최신 내용에서 자연스럽게 이어지게 한다.',
            '- 본문 외의 텍스트를 출력하지 않는다.'
        ].join('\n');
        const maxTokens = clamp(Math.round((chapter.text || '').length * 2.2), 4000, 32000);
        const text = await AI.chat({ settings: conf, system, prompt, maxTokens });
        if (isBlank(text)) throw new Error(localize('AI가 정리할 본문을 반환하지 않았습니다.', 'The AI returned no revised text.'));
        return text.trim();
    }
};

/* ------------------------------------------------------------------ *
 *  외부 공개
 * ------------------------------------------------------------------ */


/* ------------------------------------------------------------------ *
 *  프로젝트 백업과 복원
 *
 *  한 프로젝트의 모든 내용(설명·세계관·사건 흐름·책 본문·AI 대화 기록)을
 *  JSON 하나로 묶는다. 설정 화면의 값(공급자·API 키·모델명·언어·다크 모드)과
 *  사용자명은 프로젝트의 내용이 아니므로 담지 않는다.
 * ------------------------------------------------------------------ */

/** 백업 파일임을 알아보기 위한 표시 */
const BACKUP_FORMAT = 'worldwriter.project';

/** 백업 형식 버전. 구조가 바뀌면 올린다. */
const BACKUP_VERSION = 1;

/**
 * `Backup` 선언이 담당하는 값을 보관한다.
 */
const Backup = {
    /**
     * 프로젝트 하나를 백업용 객체로 만든다.
     * @param {string} projectId 프로젝트 id
     * @returns {Promise<object>} 백업 객체 (그대로 JSON 으로 저장하면 된다)
     */
    async create(projectId) {
        const project = await Projects.load(projectId);
        const books = [];
        for (const meta of project.books) {
            try {
                books.push(await Books.load(projectId, meta.id));
            } catch (e) {
                // 본문이 없는 책은 건너뛴다. 목록 정보는 프로젝트에 남아 있다.
                console.warn('백업에서 제외된 책: ' + meta.id, e);
            }
        }
        const chat = await Storage.get('chat.' + projectId, null);

        return {
            format: BACKUP_FORMAT,
            version: BACKUP_VERSION,
            app: WorldWriter.version,
            exportedAt: Date.now(),
            project: clone(project),
            books: books,
            chat: (chat && Array.isArray(chat.messages)) ? { version: 1, messages: chat.messages } : { version: 1, messages: [] }
        };
    },

    /**
     * 백업 파일 이름을 만든다.
     * @param {object} project 프로젝트(또는 백업 객체의 project)
     * @param {number} [at] 기준 시각(ms)
     * @returns {string} 파일 이름
     */
    fileName(project, at) {
        const when = new Date(at || Date.now());
        const two = function (value) { return String(value).padStart(2, '0'); };
        const stamp = when.getFullYear() + two(when.getMonth() + 1) + two(when.getDate())
            + '-' + two(when.getHours()) + two(when.getMinutes());
        const name = String((project && project.name) || 'project')
            .replace(/[\\/:*?"<>|]/g, '_')
            .trim()
            .substring(0, 60);
        return (name.length === 0 ? 'project' : name) + '-backup-' + stamp + '.json';
    },

    /**
     * 백업 객체가 이 프로그램의 것인지 확인한다.
     * @param {object} data 백업 객체
     * @returns {object} 확인된 백업 객체
     */
    validate(data) {
        const invalid = function () {
            return new Error(localize('WorldWriter 백업 파일이 아닙니다.', 'This is not a WorldWriter backup file.'));
        };
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw invalid();
        if (data.format !== BACKUP_FORMAT) throw invalid();
        if (Number(data.version) > BACKUP_VERSION) {
            throw new Error(localize('더 새로운 버전에서 만든 백업 파일입니다. 프로그램을 최신으로 올려 주세요.',
                'This backup was made by a newer version. Please update the app first.'));
        }
        const project = data.project;
        if (!project || typeof project !== 'object' || isBlank(project.name)) throw invalid();
        ITEM_KINDS.forEach(function (kind) {
            if (project[kind] !== undefined && !Array.isArray(project[kind])) throw invalid();
        });
        if (project.flow !== undefined && !Array.isArray(project.flow)) throw invalid();
        if (data.books !== undefined && !Array.isArray(data.books)) throw invalid();
        return data;
    },

    /**
     * 백업 객체로 새 프로젝트를 만든다. 기존 프로젝트를 덮어쓰지 않는다.
     * @param {object} data 백업 객체
     * @param {string} [name] 새 프로젝트 이름 (생략하면 백업에 담긴 이름)
     * @returns {Promise<object>} 새로 만들어진 프로젝트
     */
    async restore(data, name) {
        this.validate(data);
        const source = clone(data.project);
        const projectName = isBlank(name) ? source.name : String(name).trim();
        if (isBlank(projectName)) throw new Error(localize('프로젝트 이름을 입력해 주세요.', 'Enter a project name.'));

        // 새 id 로 복원해 같은 백업을 여러 번 불러와도 서로 영향을 주지 않는다.
        const project = Object.assign(emptyProject(projectName), {
            description: source.description || '',
            characters: Array.isArray(source.characters) ? source.characters : [],
            places: Array.isArray(source.places) ? source.places : [],
            events: Array.isArray(source.events) ? source.events : [],
            flow: Array.isArray(source.flow) ? source.flow : [],
            targetVolumes: Number(source.targetVolumes) > 0 ? Number(source.targetVolumes) : 0,
            createdAt: Number(source.createdAt) > 0 ? Number(source.createdAt) : Date.now(),
            updatedAt: Date.now(),
            books: []
        });

        // 책 본문을 먼저 저장하고, 목록 정보는 본문에서 다시 계산한다.
        const books = Array.isArray(data.books) ? data.books.slice() : [];
        books.sort(function (a, b) { return (a.index || 0) - (b.index || 0); });
        for (let i = 0; i < books.length; i++) {
            const book = clone(books[i]);
            book.id = book.id || newId('book');
            book.index = i;
            if (!Array.isArray(book.chapters)) book.chapters = [];
            await Books.save(project.id, book);
            project.books.push(Books.metaOf(book));
        }

        await Storage.set('project.' + project.id, project);
        const list = await Projects.list();
        list.push({
            id: project.id, name: project.name,
            createdAt: project.createdAt, updatedAt: project.updatedAt
        });
        await Projects.saveList(list);

        // AI 대화 기록도 새 프로젝트의 대화로 복원한다.
        const messages = (data.chat && Array.isArray(data.chat.messages)) ? data.chat.messages : [];
        if (messages.length > 0) {
            await Storage.set('chat.' + project.id, { version: 1, messages: messages });
        }
        return project;
    }
};

/* ------------------------------------------------------------------ *
 *  도구(Tool) 레지스트리
 *
 *  채팅 AI, WebMCP, 백엔드 MCP 가 모두 같은 도구 목록을 사용한다.
 *  실제 화면 조작은 UI 가 등록한 어댑터(worldwriter.ui.js 의 ToolAdapter)가 맡고,
 *  이 레지스트리는 도구 정의·인자 검증·호출 경로만 담당한다.
 *
 *  제외 기능 : 사용자 전환과 AI 공급자 설정(유형/주소/API 키/모델명) 변경은
 *  도구로 제공하지 않는다. 외부에서 이 두 가지를 바꿀 수 없어야 하기 때문이다.
 * ------------------------------------------------------------------ */

/** 도구 정의 목록. `params` 의 키는 인자명, 값은 { type, required, description } 이다. */
const TOOL_SPECS = [
    {
        name: 'get_screen',
        description: '현재 열려 있는 화면 종류, 단계, 프로젝트, 화면에 입력되어 있는 값을 돌려준다.',
        params: {}
    },
    {
        name: 'list_projects',
        description: '저장된 프로젝트 목록을 최근 수정 순으로 돌려준다.',
        params: {}
    },
    {
        name: 'create_project',
        description: '새 프로젝트를 만든다. 만든 뒤 열지는 않는다.',
        params: { name: { type: 'string', required: true, description: '프로젝트 이름' } }
    },
    {
        name: 'open_project',
        description: '프로젝트를 열어 작업 화면으로 이동한다.',
        params: { projectId: { type: 'string', required: true, description: '프로젝트 id' } }
    },
    {
        name: 'rename_project',
        description: '프로젝트 이름을 바꾼다.',
        params: {
            projectId: { type: 'string', required: true, description: '프로젝트 id' },
            name: { type: 'string', required: true, description: '새 이름' }
        }
    },
    {
        name: 'delete_project',
        description: '프로젝트와 그 안의 책 본문을 삭제한다. 되돌릴 수 없다.',
        params: { projectId: { type: 'string', required: true, description: '프로젝트 id' } }
    },
    {
        name: 'go_home',
        description: '홈(프로젝트 목록) 화면으로 이동한다.',
        params: {}
    },
    {
        name: 'go_step',
        description: '열려 있는 프로젝트의 1~4단계 화면으로 이동한다.',
        params: { step: { type: 'number', required: true, description: '1: 소설 설명, 2: 설정 검토, 3: 사건 흐름, 4: 책 생성' } }
    },
    {
        name: 'get_project',
        description: '열려 있는 프로젝트의 설명·설정 항목·사건 흐름·책 목록을 돌려준다. 책 본문은 포함하지 않는다.',
        params: {}
    },
    {
        name: 'set_description',
        description: '1단계의 소설 설명을 바꾸고 저장한다.',
        params: { text: { type: 'string', required: true, description: '소설 설명 전체 내용' } }
    },
    {
        name: 'generate_outline',
        description: '소설 설명을 바탕으로 등장인물·지역·주요 사건 목록을 AI로 생성한다. 책이 있으면 거부된다.',
        params: {}
    },
    {
        name: 'list_items',
        description: '2단계의 설정 항목을 돌려준다.',
        params: { kind: { type: 'string', description: 'characters | places | events. 생략하면 전부' } }
    },
    {
        name: 'update_item',
        description: '설정 항목의 이름·한 줄 요약·상세 설명을 바꾸고 저장한다. 보낸 값만 바뀐다.',
        params: {
            kind: { type: 'string', required: true, description: 'characters | places | events' },
            itemId: { type: 'string', required: true, description: '항목 id' },
            name: { type: 'string', description: '새 이름' },
            summary: { type: 'string', description: '새 한 줄 요약' },
            detail: { type: 'string', description: '새 상세 설명' }
        }
    },
    {
        name: 'add_item',
        description: '2단계에 등장인물·지역·주요 사건 항목을 하나 추가하고 저장한다. 책이 있으면 거부된다.',
        params: {
            kind: { type: 'string', required: true, description: 'characters | places | events' },
            name: { type: 'string', description: '항목 이름. 생략하면 기본 이름' },
            summary: { type: 'string', description: '한 줄 요약' },
            detail: { type: 'string', description: '상세 설명' }
        }
    },
    {
        name: 'remove_item',
        description: '2단계의 설정 항목 하나를 삭제하고 사건 흐름·목표 권수도 비운다. 되돌릴 수 없으며 책이 있으면 거부된다.',
        params: {
            kind: { type: 'string', required: true, description: 'characters | places | events' },
            itemId: { type: 'string', required: true, description: '삭제할 항목 id' }
        }
    },
    {
        name: 'clear_items',
        description: '2단계 항목을 선택한 종류 또는 전체에서 삭제하고 사건 흐름·목표 권수도 비운다. 되돌릴 수 없으며 책이 있으면 거부된다.',
        params: { kind: { type: 'string', description: 'characters | places | events. 생략하면 2단계 전체' } }
    },
    {
        name: 'generate_item_detail',
        description: '설정 항목 하나의 상세 설명을 AI로 생성하고 저장한다.',
        params: {
            kind: { type: 'string', required: true, description: 'characters | places | events' },
            itemId: { type: 'string', required: true, description: '항목 id' }
        }
    },
    {
        name: 'generate_all_details',
        description: '상세 설명이 비어 있는 설정 항목을 순서대로 모두 생성한다. 항목 수만큼 AI를 호출하므로 오래 걸린다.',
        params: {}
    },
    {
        name: 'get_flow',
        description: '3단계의 사건 흐름 목록을 순서대로 돌려준다.',
        params: {}
    },
    {
        name: 'generate_flow',
        description: '3단계에서 지정한 목표 권수를 반영해 세부 사건을 포함한 사건 흐름을 AI로 생성한다. 모든 상세 설명이 있어야 하고 책이 있으면 거부된다.',
        params: {}
    },
    {
        name: 'move_flow_item',
        description: '사건 흐름의 순서를 바꾸고 즉시 저장한다.',
        params: {
            flowId: { type: 'string', required: true, description: '옮길 사건 id' },
            toIndex: { type: 'number', required: true, description: '옮길 위치(0부터 시작)' }
        }
    },
    {
        name: 'remove_flow_item',
        description: '사건 흐름에서 사건 하나를 지우고 즉시 저장한다.',
        params: { flowId: { type: 'string', required: true, description: '지울 사건 id' } }
    },
    {
        name: 'set_target_volumes',
        description: '3단계에서 사건 흐름 생성 전에 목표 권수를 지정한다. 기존 흐름과 다른 값이면 흐름을 비워 다시 생성하게 하며, 책이 있으면 거부된다.',
        params: { count: { type: 'number', required: true, description: '목표 권수' } }
    },
    {
        name: 'list_books',
        description: '생성된 책의 제목·장 수·글자 수·상태를 돌려준다.',
        params: {}
    },
    {
        name: 'open_book',
        description: '책을 선택해 본문 편집 화면에 표시한다.',
        params: {
            bookId: { type: 'string', required: true, description: '책 id' },
            chapterIndex: { type: 'number', description: '선택할 장 번호(0부터 시작)' }
        }
    },
    {
        name: 'get_chapter',
        description: '장 본문을 돌려준다. 책과 장을 생략하면 지금 열려 있는 장을 읽는다.',
        params: {
            bookId: { type: 'string', description: '책 id' },
            chapterId: { type: 'string', description: '장 id' },
            maxChars: { type: 'number', description: '돌려줄 최대 글자 수(기본 8000)' }
        }
    },
    {
        name: 'set_chapter_text',
        description: '장 본문을 통째로 바꾸고 저장한다. autoOrganize가 true이면 이후 책들도 변경 내용에 맞춰 AI로 순차 정리한다.',
        params: {
            bookId: { type: 'string', required: true, description: '책 id' },
            chapterId: { type: 'string', required: true, description: '장 id' },
            text: { type: 'string', required: true, description: '새 본문 전체' },
            autoOrganize: { type: 'boolean', description: '저장 후 이후 책 자동정리 여부' }
        }
    },
    {
        name: 'revise_chapter',
        description: '수정 지시를 AI에 보내 장 본문을 고치고 저장한다.',
        params: {
            bookId: { type: 'string', required: true, description: '책 id' },
            chapterId: { type: 'string', required: true, description: '장 id' },
            instruction: { type: 'string', required: true, description: '어떻게 고칠지에 대한 지시' }
        }
    },
    {
        name: 'export_book_text',
        description: '책 전체를 장 제목과 본문을 합친 텍스트로 돌려준다.',
        params: {
            bookId: { type: 'string', required: true, description: '책 id' },
            maxChars: { type: 'number', description: '돌려줄 최대 글자 수(기본 20000)' }
        }
    },
    {
        name: 'delete_last_book',
        description: '마지막 권을 삭제한다. 마지막 권만 지울 수 있다.',
        params: {}
    },
    {
        name: 'generate_next_book',
        description: '마지막 완료 권 바로 뒤에 다음 한 권만 생성한다. 미완성 마지막 권이 있으면 거부된다. 오래 걸리므로 백그라운드로 실행하고 즉시 돌아온다.',
        params: {}
    },
    {
        name: 'resume_last_book',
        description: '마지막 미완성 권의 이어쓰기를 시작한다. 오래 걸리므로 백그라운드로 실행하고 즉시 돌아온다.',
        params: {}
    },
    {
        name: 'generate_all_books',
        description: '목표 권수까지 남은 모든 책을 순서대로 생성한다. 중단하면 현재 권의 진행분을 저장한다. 오래 걸리므로 백그라운드로 실행하고 즉시 돌아온다.',
        params: {}
    },
    {
        name: 'generation_status',
        description: '책 생성 진행 상황을 돌려준다.',
        params: {}
    },
    {
        name: 'stop_generation',
        description: '진행 중인 책 생성이나 일괄 상세 생성을 중단한다. 그때까지 작성된 내용은 남는다.',
        params: {}
    },
    {
        name: 'backup_project',
        description: '프로젝트 전체(설명·설정·사건 흐름·책 본문·AI 대화)를 백업 JSON 으로 만든다. 설정 화면의 값은 담기지 않는다. 화면에서는 이 내용을 파일로 내려받는다.',
        params: {
            projectId: { type: 'string', description: '생략하면 열려 있는 프로젝트' },
            maxChars: { type: 'number', description: '돌려줄 JSON 최대 글자 수(기본 200000). 넘으면 내용 대신 크기만 알려 준다.' }
        }
    },
    {
        name: 'restore_project',
        description: '백업 JSON 으로 새 프로젝트를 만든다. 기존 프로젝트를 덮어쓰지 않는다.',
        params: {
            json: { type: 'string', required: true, description: '백업 파일의 JSON 내용' },
            name: { type: 'string', description: '새 프로젝트 이름(생략하면 백업에 담긴 이름)' }
        }
    },
    {
        name: 'get_display_settings',
        description: '표시 설정(언어, 다크 모드)과 현재 저장 모드를 돌려준다. AI 공급자 설정은 제공하지 않는다.',
        params: {}
    },
    {
        name: 'set_display_settings',
        description: '표시 설정(언어, 다크 모드)을 바꾼다. AI 공급자 설정은 바꿀 수 없다.',
        params: {
            language: { type: 'string', description: 'ko 또는 en' },
            darkMode: { type: 'boolean', description: '다크 모드 사용 여부' }
        }
    }
];

/**
 * `Tools` 선언이 담당하는 값을 보관한다.
 */
const Tools = {
    /** UI 가 등록한 어댑터. 키는 도구 이름이며 값은 async 함수이다. */
    adapter: null,

    /** 도구가 실행될 때마다 알림을 받는 함수 목록 (WebMCP/MCP 호출 표시용) */
    listeners: [],

    /**
     * 화면 조작 어댑터를 등록한다. UI 초기화 시 한 번 호출한다.
     * @param {Object<string, Function>} adapter 도구 이름별 처리 함수
     */
    setAdapter(adapter) {
        this.adapter = adapter || null;
    },

    /** 도구 실행 알림을 받을 함수를 추가한다. */
    onCall(listener) {
        if (typeof listener === 'function') this.listeners.push(listener);
    },

    /** 도구 정의 목록(설명용 사본) */
    list() {
        return TOOL_SPECS.map(function (spec) {
            return { name: spec.name, description: spec.description, params: clone(spec.params) };
        });
    },

    /** MCP 규격의 inputSchema 형태로 도구 목록을 돌려준다. */
    listForMcp() {
        return TOOL_SPECS.map(function (spec) {
            const properties = {};
            const required = [];
            Object.keys(spec.params).forEach(function (key) {
                const param = spec.params[key];
                properties[key] = { type: param.type || 'string', description: param.description || '' };
                if (param.required) required.push(key);
            });
            return {
                name: spec.name,
                description: spec.description,
                inputSchema: { type: 'object', properties: properties, required: required }
            };
        });
    },

    /** 이름으로 도구 정의를 찾는다. */
    specOf(name) {
        return TOOL_SPECS.find(function (spec) { return spec.name === name; }) || null;
    },

    /**
     * 인자를 도구 정의에 맞게 확인하고 형을 맞춘다.
     * @param {object} spec 도구 정의
     * @param {object} args 호출 인자
     * @returns {object} 정리된 인자
     */
    normalizeArgs(spec, args) {
        const input = args && typeof args === 'object' ? args : {};
        const out = {};
        Object.keys(spec.params).forEach(function (key) {
            const param = spec.params[key];
            let value = input[key];
            if (value === undefined || value === null || value === '') {
                if (param.required) {
                    throw new Error(localize(spec.name + ' 도구에는 ' + key + ' 값이 필요합니다.',
                        'The ' + spec.name + ' tool requires the ' + key + ' argument.'));
                }
                return;
            }
            if (param.type === 'number') {
                const num = Number(value);
                if (!isFinite(num)) {
                    throw new Error(localize(key + ' 값은 숫자여야 합니다.', 'The ' + key + ' argument must be a number.'));
                }
                value = num;
            } else if (param.type === 'boolean') {
                value = (value === true || value === 'true' || value === 1 || value === '1');
            } else {
                value = String(value);
            }
            out[key] = value;
        });
        return out;
    },

    /**
     * 도구를 실행한다. 모든 호출 경로(채팅, WebMCP, 백엔드 MCP)가 이 함수를 지난다.
     * @param {string} name 도구 이름
     * @param {object} [args] 호출 인자
     * @param {{source?: string}} [options] 호출 출처 표시 (chat | webmcp | mcp)
     * @returns {Promise<object>} 도구 결과
     */
    async call(name, args, options) {
        const spec = this.specOf(name);
        if (!spec) throw new Error(localize('없는 도구입니다: ', 'Unknown tool: ') + name);
        if (!this.adapter || typeof this.adapter[name] !== 'function') {
            throw new Error(localize('화면이 아직 준비되지 않아 도구를 실행할 수 없습니다.',
                'The screen is not ready, so the tool cannot run.'));
        }
        const normalized = this.normalizeArgs(spec, args);
        const source = (options && options.source) || 'chat';
        this.listeners.forEach(function (listener) {
            try { listener({ phase: 'start', name: name, args: normalized, source: source }); } catch (e) { /* 무시 */ }
        });
        try {
            const result = await this.adapter[name](normalized);
            const value = (result === undefined) ? { ok: true } : result;
            this.listeners.forEach(function (listener) {
                try { listener({ phase: 'done', name: name, args: normalized, source: source, result: value }); } catch (e) { /* 무시 */ }
            });
            return value;
        } catch (error) {
            this.listeners.forEach(function (listener) {
                try { listener({ phase: 'error', name: name, args: normalized, source: source, error: error }); } catch (e) { /* 무시 */ }
            });
            throw error;
        }
    }
};

/* ------------------------------------------------------------------ *
 *  AI 채팅
 *
 *  화면 맥락과 도구 목록을 함께 전달해, 질문 답변뿐 아니라 화면 조작까지
 *  요청할 수 있게 한다. 대화 기록은 현재 저장 모드(파일/localStorage)에 남는다.
 * ------------------------------------------------------------------ */

/** 한 번의 사용자 요청에서 허용할 최대 도구 호출 횟수 */
const CHAT_MAX_TOOL_CALLS = 8;

/** 저장할 대화 기록의 최대 개수 */
const CHAT_MAX_HISTORY = 60;

/**
 * `Chat` 선언이 담당하는 값을 보관한다.
 */
const Chat = {
    /** 대화 기록 : [{ role: 'user'|'assistant'|'tool', text, at }] */
    history: [],
    loaded: false,

    /** 대화가 속한 프로젝트 id. 비어 있으면 홈 화면의 공용 대화이다. */
    projectId: '',

    /** 현재 대화를 저장할 키. 프로젝트 대화는 백업에 함께 담긴다. */
    key() {
        return this.projectId ? ('chat.' + this.projectId) : 'chat';
    },

    /**
     * 대화 범위를 바꾼다. 프로젝트를 열면 그 프로젝트의 대화를, 홈에서는 공용 대화를 쓴다.
     * @param {string} [projectId] 프로젝트 id (없으면 홈 대화)
     * @returns {Promise<Array>} 해당 범위의 대화 기록
     */
    async setScope(projectId) {
        const next = String(projectId || '');
        if (this.loaded && next === this.projectId) return this.history;
        this.projectId = next;
        this.loaded = false;
        return await this.load();
    },

    /** 저장된 대화 기록을 읽어 온다. */
    async load() {
        const saved = await Storage.get(this.key(), null);
        this.history = (saved && Array.isArray(saved.messages)) ? saved.messages : [];
        this.loaded = true;
        return this.history;
    },

    /** 대화 기록을 저장한다. 너무 길어지면 오래된 것부터 버린다. */
    async save() {
        if (this.history.length > CHAT_MAX_HISTORY) {
            this.history = this.history.slice(this.history.length - CHAT_MAX_HISTORY);
        }
        await Storage.set(this.key(), { version: 1, messages: this.history });
    },

    /** 대화를 초기화한다. 현재 범위(프로젝트 또는 홈)의 기록만 지운다. */
    async clear() {
        this.history = [];
        await Storage.set(this.key(), { version: 1, messages: [] });
    },

    /** 기록에 한 줄 추가한다. */
    append(role, text, extra) {
        const entry = Object.assign({ role: role, text: String(text || ''), at: Date.now() }, extra || {});
        this.history.push(entry);
        return entry;
    },

    /** AI 에게 보낼 시스템 프롬프트를 만든다. */
    systemPrompt(screen) {
        const lang = Settings.languageName();
        const tools = Tools.list().map(function (tool) {
            const params = Object.keys(tool.params).map(function (key) {
                const param = tool.params[key];
                return key + '(' + (param.type || 'string') + (param.required ? ', 필수' : '') + '): ' + (param.description || '');
            });
            return '- ' + tool.name + ' : ' + tool.description
                + (params.length > 0 ? '\n    인자 ' + params.join(' / ') : '');
        }).join('\n');

        return [
            'You are the built-in assistant of WorldWriter, a web app that writes fantasy novels with AI.',
            'Answer in ' + lang + '.',
            'You can both answer questions and operate the screen with the tools below.',
            '',
            'Current screen state (JSON):',
            JSON.stringify(screen),
            '',
            'Available tools:',
            tools,
            '',
            'You cannot switch users or change AI provider settings (provider, base url, API key, model). Refuse those requests.',
            '',
            'Reply with a single JSON object and nothing else.',
            'To run a tool: {"tool": "<name>", "args": { ... }}',
            'To answer the user: {"reply": "<text>"}',
            'Run one tool at a time and wait for its result. Use at most ' + CHAT_MAX_TOOL_CALLS + ' tool calls per request.',
            'Before destructive tools (delete_project, delete_last_book, remove_flow_item, remove_item, clear_items, set_chapter_text, generate_outline, generate_flow), make sure the user asked for it.',
            'Long generation tools cost money and time; only run them when the user asks.'
        ].join('\n');
    },

    /** AI 에게 보낼 대화 메시지 목록을 만든다. */
    buildMessages(screen) {
        const messages = [];
        this.history.slice(-20).forEach(function (entry) {
            if (entry.role === 'user') messages.push({ role: 'user', content: entry.text });
            else if (entry.role === 'assistant') messages.push({ role: 'assistant', content: entry.text });
            else if (entry.role === 'tool') messages.push({ role: 'user', content: '[도구 결과] ' + entry.text });
        });
        if (messages.length === 0) messages.push({ role: 'user', content: '안녕하세요.' });
        return messages;
    },

    /**
     * 사용자의 채팅 한 줄을 처리한다. 필요하면 도구를 실행하고 최종 답변을 돌려준다.
     * @param {string} text 사용자 입력
     * @param {{onUpdate?: Function, screen?: object}} [options] 진행 알림
     * @returns {Promise<string>} 최종 답변
     */
    async send(text, options) {
        const opts = options || {};
        const notify = typeof opts.onUpdate === 'function' ? opts.onUpdate : function () { };
        if (!this.loaded) await this.load();
        if (isBlank(text)) throw new Error(localize('보낼 내용을 입력해 주세요.', 'Enter a message to send.'));

        this.append('user', text);
        await this.save();

        let answer = '';
        for (let turn = 0; turn <= CHAT_MAX_TOOL_CALLS; turn++) {
            const screen = (Tools.adapter && typeof Tools.adapter.get_screen === 'function')
                ? await Tools.adapter.get_screen({})
                : (opts.screen || {});

            const raw = await AI.chat({
                system: this.systemPrompt(screen),
                messages: this.buildMessages(screen),
                maxTokens: 4000
            });

            let decision;
            try {
                decision = parseJsonLoosely(raw);
            } catch (e) {
                // JSON 이 아니면 그대로 답변으로 본다.
                decision = { reply: String(raw || '') };
            }
            if (Array.isArray(decision)) decision = decision[0] || {};

            if (decision && decision.tool && turn < CHAT_MAX_TOOL_CALLS) {
                const name = String(decision.tool);
                notify({ phase: 'tool', name: name, args: decision.args || {} });
                let resultText;
                try {
                    const result = await Tools.call(name, decision.args || {}, { source: 'chat' });
                    resultText = name + ' → ' + JSON.stringify(result).substring(0, 4000);
                } catch (error) {
                    resultText = name + ' → ' + localize('실패: ', 'failed: ') + (error && error.message ? error.message : String(error));
                }
                this.append('tool', resultText, { tool: name });
                await this.save();
                notify({ phase: 'toolDone', name: name, text: resultText });
                continue;
            }

            answer = String((decision && (decision.reply || decision.answer || decision.text)) || raw || '');
            break;
        }

        if (isBlank(answer)) {
            answer = localize('도구 실행을 마쳤습니다.', 'Finished running the tools.');
        }
        this.append('assistant', answer);
        await this.save();
        notify({ phase: 'answer', text: answer });
        return answer;
    }
};

/* ------------------------------------------------------------------ *
 *  WebMCP 와 백엔드 MCP 연결
 *
 *  WebMCP : 브라우저(또는 확장/에이전트)가 이 페이지의 도구를 쓸 수 있도록
 *           navigator.modelContext 에 등록하고 window.WorldWriterWebMCP 로도 노출한다.
 *  백엔드 MCP : 서버 모드에서 열린 페이지가 백엔드에 도구 목록을 등록하고
 *           긴 폴링으로 호출을 받아 실행한 뒤 결과를 돌려준다.
 *           (생성 파이프라인이 화면 쪽 구현이므로 페이지가 실행 주체이다.)
 * ------------------------------------------------------------------ */

/** 백엔드 호출 대기(긴 폴링) 실패 시 다시 시도하기까지의 간격(ms) */
const MCP_RETRY_DELAY = 3000;

/**
 * `WebMcp` 선언이 담당하는 값을 보관한다.
 */
const WebMcp = {
    /** navigator.modelContext 등록 여부 */
    registered: false,

    /**
     * 표준 WebMCP API 지원 상태
     *  'unknown'      : 아직 확인하지 않음
     *  'standard'     : navigator.modelContext 에 등록 완료
     *  'unsupported'  : 표준 API 가 없는 브라우저 (전역 객체만 제공)
     *  'incompatible' : modelContext 는 있으나 아는 등록 함수가 없음
     *  'rejected'     : 등록을 시도했으나 브라우저가 거절함
     */
    support: 'unknown',

    /** 지원 상태가 바뀌면 호출되는 함수. UI 가 표시를 갱신하는 데 쓴다. */
    onChange: null,

    /** 백엔드 MCP 연결 여부 */
    bridged: false,

    /** 이 페이지의 연결 식별자 */
    clientId: '',

    /** 연결을 멈추기 위한 플래그 */
    stopped: false,

    /**
     * 페이지의 도구를 WebMCP 로 노출한다.
     * 표준 API(navigator.modelContext)가 있으면 등록하고, 없어도 전역 객체는 항상 노출한다.
     * @returns {boolean} 표준 API 등록 성공 여부
     */
    expose() {
        if (typeof window === 'undefined') return false;

        // 표준 API 가 없어도 채팅과 백엔드 MCP 는 그대로 동작한다.
        // 이 전역 객체는 어떤 브라우저에서든 노출해, 확장/에이전트가 쓸 수 있게 한다.
        window.WorldWriterWebMCP = {
            version: 1,
            /** 표준 WebMCP 등록 여부와 지원 상태 */
            get support() { return WebMcp.support; },
            get registered() { return WebMcp.registered; },
            /** 사용할 수 있는 도구 목록 (MCP inputSchema 형식) */
            listTools() { return Tools.listForMcp(); },
            /** 도구를 실행한다. */
            async callTool(name, args) {
                return await Tools.call(name, args, { source: 'webmcp' });
            }
        };

        const context = window.navigator && window.navigator.modelContext;
        const tools = this.describeTools();

        if (!context) {
            // 표준 WebMCP 를 지원하지 않는 브라우저이다. 전역 객체만 쓰면 된다.
            this.setSupport('unsupported');
        } else if (typeof context.provideContext === 'function') {
            this.tryRegister(function () { return context.provideContext({ tools: tools }); });
        } else if (typeof context.registerTool === 'function') {
            // 초안에 따라 도구를 하나씩 등록하는 형태도 있다.
            this.tryRegister(function () {
                const results = tools.map(function (tool) { return context.registerTool(tool); });
                return Promise.all(results.filter(function (r) { return r && typeof r.then === 'function'; }));
            });
        } else {
            this.setSupport('incompatible');
            console.info('navigator.modelContext 가 있지만 아는 등록 방식이 아닙니다. window.WorldWriterWebMCP 로만 제공합니다.');
        }

        try {
            window.dispatchEvent(new CustomEvent('worldwriter-webmcp-ready', {
                detail: { tools: tools.length, support: this.support, registered: this.registered }
            }));
        } catch (e) {
            // CustomEvent 를 만들지 못하는 환경이어도 도구 제공에는 영향이 없다.
        }
        return this.registered;
    },

    /** 표준 API 에 넘길 도구 목록을 만든다. */
    describeTools() {
        return Tools.listForMcp().map(function (tool) {
            return {
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
                /** WebMCP 호출을 내부 도구 레지스트리로 전달한다. */
                async execute(args) {
                    const result = await Tools.call(tool.name, args, { source: 'webmcp' });
                    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
                }
            };
        });
    },

    /** 지원 상태를 바꾸고 화면에 알린다. */
    setSupport(state) {
        this.support = state;
        this.registered = (state === 'standard');
        if (typeof this.onChange === 'function') {
            try { this.onChange(state); } catch (e) { /* 표시 갱신 실패는 무시한다. */ }
        }
        return this.registered;
    },

    /**
     * 표준 API 등록을 시도한다.
     * 등록 함수가 동기 예외를 던지거나, 나중에 거부되는 프라미스를 돌려주는 경우를 모두 처리한다.
     * 어느 쪽이든 전역 객체(window.WorldWriterWebMCP)는 그대로 쓸 수 있다.
     * @param {Function} run 등록을 수행하는 함수
     * @returns {boolean} 등록 성공 여부(비동기 거절은 나중에 되돌린다)
     */
    tryRegister(run) {
        const self = this;
        let result;
        try {
            result = run();
        } catch (error) {
            self.setSupport('rejected');
            console.warn('WebMCP 등록에 실패했습니다. window.WorldWriterWebMCP 로만 제공합니다.', error);
            return false;
        }
        self.setSupport('standard');
        if (result && typeof result.then === 'function') {
            result.then(null, function (error) {
                // 브라우저가 사용자 승인 등을 이유로 나중에 거절할 수 있다.
                self.setSupport('rejected');
                console.warn('WebMCP 등록이 거절되었습니다. window.WorldWriterWebMCP 로만 제공합니다.', error);
            });
        }
        return self.registered;
    },

    /**
     * 백엔드 MCP 서버에 이 페이지를 연결한다. 서버 모드에서만 동작한다.
     * 등록 후에는 긴 폴링으로 호출을 기다리며, 실패하면 잠시 뒤 다시 시도한다.
     * @returns {Promise<boolean>} 연결 시작 여부
     */
    async connectBackend() {
        if (!Env.isServer()) return false;
        if (this.bridged) return true;
        this.clientId = this.clientId || newId('page');
        this.stopped = false;
        try {
            await this.register();
        } catch (e) {
            console.warn('MCP 백엔드 등록에 실패했습니다.', e);
            return false;
        }
        this.bridged = true;
        this.pollLoop();
        return true;
    },

    /** 백엔드에 도구 목록을 등록한다. */
    async register() {
        const res = await fetch('./api/mcp/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client: this.clientId,
                user: Storage.user,
                tools: Tools.listForMcp()
            })
        });
        if (!res.ok) throw new Error('register ' + res.status);
        return await res.json();
    },

    /** 백엔드 연결을 끊는다. */
    disconnect() {
        this.stopped = true;
        this.bridged = false;
    },

    /** 호출을 기다렸다가 실행하고 결과를 돌려보내는 반복 동작 */
    async pollLoop() {
        while (!this.stopped) {
            let call = null;
            try {
                const res = await fetch('./api/mcp/poll?client=' + encodeURIComponent(this.clientId));
                if (!res.ok) throw new Error('poll ' + res.status);
                const body = await res.json();
                call = body && body.call;
            } catch (e) {
                // 서버가 잠시 응답하지 않아도 페이지는 계속 쓸 수 있어야 한다.
                await new Promise(function (resolve) { setTimeout(resolve, MCP_RETRY_DELAY); });
                try { await this.register(); } catch (registerError) { /* 다음 회차에 다시 시도한다. */ }
                continue;
            }
            if (!call) continue;

            let payload;
            try {
                const result = await Tools.call(call.name, call.args || {}, { source: 'mcp' });
                payload = { id: call.id, result: result };
            } catch (error) {
                payload = { id: call.id, error: (error && error.message) ? error.message : String(error) };
            }
            try {
                await fetch('./api/mcp/result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.assign({ client: this.clientId }, payload))
                });
            } catch (e) { /* 결과 전달 실패는 호출 쪽에서 시간 초과로 처리된다. */ }
        }
    }
};

/**
 * `WorldWriter` 선언이 담당하는 값을 보관한다.
 */
const WorldWriter = {
    version: '0.1.0',
    Env: Env,
    Storage: Storage,
    Settings: Settings,
    Projects: Projects,
    Books: Books,
    AI: AI,
    Pipeline: Pipeline,
    Backup: Backup,
    AiSocket: AiSocket,
    Tools: Tools,
    Chat: Chat,
    WebMcp: WebMcp,
    PROVIDERS: PROVIDERS,
    ITEM_KINDS: ITEM_KINDS,
    KIND_LABELS: KIND_LABELS,
    util: {
        newId: newId,
        isBlank: isBlank,
        clone: clone,
        clamp: clamp,
        tailOf: tailOf,
        parseJsonLoosely: parseJsonLoosely
    },

    /** 저장소 및 설정 초기화. 사용자명이 정해진 뒤 호출한다. */
    async init(userName) {
        await Env.detect();
        Storage.setUser(userName);
        await Settings.load();
        return { mode: Env.mode, settings: Settings.current };
    }
};

if (typeof window !== 'undefined') {
    window.WorldWriter = WorldWriter;
}

export {
    WorldWriter, Env, Storage, Settings, Projects, Books, AI, Pipeline,
    Backup, AiSocket, Tools, Chat, WebMcp, PROVIDERS, ITEM_KINDS, KIND_LABELS
};
export default WorldWriter;
