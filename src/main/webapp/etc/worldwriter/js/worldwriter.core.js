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

/** 사용자에게 보이는 코어 메시지. 프롬프트 언어와 UI 언어를 구분한다. */
function localize(ko, en, settings = Settings.current) {
    return settings.language === 'en' ? en : ko;
}

const activeGenerations = new Set();
const BOOK_LENGTH = { min: 100000, target: 125000, max: 150000 };

/* ------------------------------------------------------------------ *
 *  실행 환경 판별
 *
 *  백엔드(node.js / python) 위에서 동작 중이면 파일 저장 및 AI 호출 중계를
 *  백엔드에 위임하고, 그렇지 않으면 localStorage 와 직접 호출을 사용한다.
 * ------------------------------------------------------------------ */

const Env = {
    mode: 'local',      // 'local' | 'server'
    backend: null,      // 백엔드가 알려준 정보
    detected: false,

    async detect() {
        if (this.detected) return this.mode;
        this.detected = true;
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

    isServer() { return this.mode === 'server'; }
};

/* ------------------------------------------------------------------ *
 *  저장소 추상화
 *
 *  key 는 사용자 단위로 구분되며, 실제 저장 위치는 실행 환경에 따라 달라진다.
 *   - local  : localStorage (LZ 압축 적용)
 *   - server : 백엔드의 파일 저장소 (~/.worldwriter/<사용자명>/)
 * ------------------------------------------------------------------ */

const Storage = {
    user: '',

    setUser(userName) {
        this.user = String(userName || '').trim();
    },

    /** localStorage 에서 사용할 실제 키 이름 */
    localKey(key) {
        return 'ww.' + encodeURIComponent(this.user) + '.' + key;
    },

    async get(key, defaultValue) {
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

    async set(key, value) {
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

    async remove(key) {
        if (Env.isServer()) {
            await fetch('./api/store?user=' + encodeURIComponent(this.user)
                + '&key=' + encodeURIComponent(key), { method: 'DELETE' });
            return;
        }
        window.localStorage.removeItem(this.localKey(key));
    },

    /** 사용 중인 저장 공간(바이트)을 돌려준다. 백엔드 모드에서는 null. */
    usage() {
        if (Env.isServer()) return null;
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

const DEFAULT_SETTINGS = {
    provider: 'openai',
    apiKeys: { openai: '', claude: '', lmstudio: '' },
    models: { openai: '', claude: '', lmstudio: '' },
    lmStudioUrl: 'http://localhost:1234',
    language: 'ko',
    darkMode: false
};

const LANGUAGE_NAMES = { ko: '한국어', en: 'English' };

/** 로그인 전에도 언어/테마를 적용하기 위한 별도 보관 키 */
const UI_PREF_KEY = 'ww.uipref';

const Settings = {
    current: clone(DEFAULT_SETTINGS),

    async load() {
        const saved = await Storage.get('settings', null);
        this.current = Object.assign(clone(DEFAULT_SETTINGS), saved || {});
        this.current.apiKeys = Object.assign({}, DEFAULT_SETTINGS.apiKeys, this.current.apiKeys || {});
        this.current.models = Object.assign({}, DEFAULT_SETTINGS.models, this.current.models || {});
        return this.current;
    },

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

    baseUrlOf(settings) {
        const conf = settings || this.current;
        const spec = PROVIDERS[conf.provider] || PROVIDERS.openai;
        if (conf.provider === 'lmstudio') {
            const url = isBlank(conf.lmStudioUrl) ? spec.defaultBaseUrl : String(conf.lmStudioUrl).trim();
            return url.replace(/\/+$/, '');
        }
        return spec.defaultBaseUrl;
    },

    apiKeyOf(settings) {
        const conf = settings || this.current;
        return String((conf.apiKeys || {})[conf.provider] || '').trim();
    },

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

/** 백엔드 중계를 통한 호출 (CORS 회피) */
async function callViaBackend(conf, request) {
    const res = await fetch('./api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            provider: conf.provider,
            language: conf.language,
            model: Settings.modelOf(conf),
            apiKey: Settings.apiKeyOf(conf),
            baseUrl: Settings.baseUrlOf(conf),
            system: request.system || '',
            messages: request.messages,
            maxTokens: request.maxTokens
        })
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    const body = await res.json();
    if (body.error) throw new Error(body.error);
    return String(body.text || '');
}

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
            maxTokens: options.maxTokens || 8000
        };

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

const ITEM_KINDS = ['characters', 'places', 'events'];

const KIND_LABELS = {
    get characters() { return localize('등장인물', 'Characters'); },
    get places() { return localize('지역', 'Places'); },
    get events() { return localize('주요 사건', 'Major events'); }
};

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

const Projects = {
    /** 프로젝트 목록 (요약 정보만) */
    async list() {
        const list = await Storage.get('projects', []);
        return Array.isArray(list) ? list : [];
    },

    async saveList(list) {
        await Storage.set('projects', list);
    },

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

    async remove(projectId) {
        if (activeGenerations.has(projectId)) throw new Error(localize('생성을 중단한 후 삭제해 주세요.', 'Stop generation before deleting.'));
        const project = await Storage.get('project.' + projectId, null);
        if (project && Array.isArray(project.books)) {
            for (const meta of project.books) {
                await Storage.remove('book.' + projectId + '.' + meta.id);
            }
        }
        await Storage.remove('project.' + projectId);
        const list = await this.list();
        await this.saveList(list.filter(function (p) { return p.id !== projectId; }));
    },

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

    async assertStructureEditable(project) {
        const saved = await Storage.get('project.' + project.id, null);
        if (project.books.length > 0 || (saved && (saved.books || []).length > 0)) {
            throw new Error(localize('기존 책을 보존하기 위해 개요 재생성과 사건 흐름 변경을 잠갔습니다. 마지막 권부터 모두 삭제하면 변경할 수 있습니다.',
                'Outline regeneration and flow changes are locked to preserve existing books. Delete all books from the last volume first to unlock them.'));
        }
    },

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

const Books = {
    key(projectId, bookId) { return 'book.' + projectId + '.' + bookId; },

    async load(projectId, bookId) {
        const book = await Storage.get(this.key(projectId, bookId), null);
        if (!book) throw new Error(localize('책 내용을 찾을 수 없습니다.', 'Book content not found.'));
        if (!Array.isArray(book.chapters)) book.chapters = [];
        return book;
    },

    async save(projectId, book) {
        await Storage.set(this.key(projectId, book.id), book);
    },

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

    charCount(book) {
        return (book.chapters || []).reduce(function (sum, ch) { return sum + (ch.text || '').length; }, 0);
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
        return (book.chapters || []).map(function (ch) {
            return ch.title + '\n\n' + ch.text;
        }).join('\n\n\n');
    }
};

/* ------------------------------------------------------------------ *
 *  프롬프트 구성
 * ------------------------------------------------------------------ */

const AUTHOR_PERSONA = '너는 판타지 장편 소설을 집필하는 전문 작가이자 기획자다. '
    + '설정의 일관성을 지키고, 진부한 표현을 피하며, 독자가 몰입할 수 있는 글을 쓴다.';

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

        const targetCount = clamp(project.events.length * 4, 24, 80);
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
    }
};

/* ------------------------------------------------------------------ *
 *  외부 공개
 * ------------------------------------------------------------------ */

const WorldWriter = {
    version: '0.1.0',
    Env: Env,
    Storage: Storage,
    Settings: Settings,
    Projects: Projects,
    Books: Books,
    AI: AI,
    Pipeline: Pipeline,
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
    PROVIDERS, ITEM_KINDS, KIND_LABELS
};
export default WorldWriter;
