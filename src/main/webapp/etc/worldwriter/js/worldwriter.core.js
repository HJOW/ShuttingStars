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
            if (!res.ok) throw new Error('저장소 읽기에 실패했습니다. (' + res.status + ')');
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
            if (!res.ok) throw new Error('저장소 쓰기에 실패했습니다. (' + res.status + ')');
            return;
        }
        const packed = LZ.compress(JSON.stringify(value));
        try {
            window.localStorage.setItem(this.localKey(key), packed);
        } catch (e) {
            throw new Error('브라우저 저장 공간이 부족합니다. 오래된 프로젝트나 책을 삭제해 주세요.');
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
    return 'AI 호출에 실패했습니다. (HTTP ' + res.status + ') ' + String(detail).substring(0, 400);
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
    if (!choice) throw new Error('AI 응답이 비어 있습니다.');
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
        throw new Error('AI가 요청을 거절했습니다. ' + (reason || ''));
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
        if (!spec) throw new Error('알 수 없는 AI 공급자입니다: ' + conf.provider);
        if (spec.needsApiKey && isBlank(Settings.apiKeyOf(conf))) {
            throw new Error('설정 화면에서 ' + spec.label + ' API 키를 먼저 입력해 주세요.');
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
    if (isBlank(text)) throw new Error('AI 응답이 비어 있습니다.');
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
    if (start < 0) throw new Error('AI 응답에서 JSON 을 찾지 못했습니다.');

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
    throw new Error('AI 응답의 JSON 형식이 올바르지 않습니다.');
}

/* ------------------------------------------------------------------ *
 *  프로젝트 데이터
 * ------------------------------------------------------------------ */

const ITEM_KINDS = ['characters', 'places', 'events'];

const KIND_LABELS = {
    characters: '등장인물',
    places: '지역',
    events: '주요 사건'
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
        if (isBlank(name)) throw new Error('프로젝트 이름을 입력해 주세요.');
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
        if (!project) throw new Error('프로젝트를 찾을 수 없습니다.');
        ITEM_KINDS.forEach(function (kind) {
            if (!Array.isArray(project[kind])) project[kind] = [];
        });
        if (!Array.isArray(project.flow)) project.flow = [];
        if (!Array.isArray(project.books)) project.books = [];
        return project;
    },

    async save(project) {
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
        if (isBlank(name)) throw new Error('프로젝트 이름을 입력해 주세요.');
        const project = await this.load(projectId);
        project.name = String(name).trim();
        await this.save(project);
        return project;
    },

    /**
     * 진행 가능한 최대 단계.
     * 1단계는 항상 열려 있고, 이후 단계는 앞 단계의 결과가 있어야 열린다.
     */
    maxStep(project) {
        if (!project) return 1;
        const hasOutline = ITEM_KINDS.some(function (k) { return (project[k] || []).length > 0; });
        if (!hasOutline) return 1;
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
        if (!book) throw new Error('책 내용을 찾을 수 없습니다.');
        if (!Array.isArray(book.chapters)) book.chapters = [];
        return book;
    },

    async save(projectId, book) {
        await Storage.set(this.key(projectId, book.id), book);
    },

    async remove(projectId, bookId) {
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
            line += '\n   상세: ' + String(item.detail).replace(/\s+/g, ' ').substring(0, 800);
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
        if (isBlank(project.description)) {
            throw new Error('소설에 대한 설명을 먼저 입력해 주세요.');
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

        project.characters = toItems(json.characters);
        project.places = toItems(json.places);
        project.events = toItems(json.events);

        if (project.characters.length === 0 && project.places.length === 0 && project.events.length === 0) {
            throw new Error('AI가 유효한 목록을 만들지 못했습니다. 설명을 조금 더 구체적으로 작성해 보세요.');
        }

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
        if (!item) throw new Error('항목을 찾을 수 없습니다.');

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
        if ((project.events || []).length === 0) {
            throw new Error('2단계의 주요 사건이 없습니다. 먼저 2단계를 완료해 주세요.');
        }

        const targetCount = clamp(project.events.length * 4, 24, 80);
        const system = AUTHOR_PERSONA + ' ' + languageInstruction(conf)
            + ' 결과는 반드시 JSON 배열 하나만 출력하며, 설명이나 코드블록 표시를 덧붙이지 않는다.';

        const prompt = [
            worldSummary(project, true),
            '',
            '위 설정을 바탕으로 소설 전체의 사건 흐름을 시간 순서대로 나열하라.',
            '- [주요 사건] 목록의 사건은 반드시 모두 포함해야 한다.',
            '- 주요 사건 사이를 잇는 세부 사건(만남, 갈등, 이동, 복선, 전투, 반전 등)을 추가해 흐름을 촘촘하게 만들어라.',
            '- 각 항목은 소설 한 장(章) 분량에 해당하는 크기여야 한다.',
            '- 전체 항목 수는 ' + targetCount + '개 내외로 한다.',
            '- main 값은 [주요 사건] 목록에 있던 사건이면 true, 새로 추가한 세부 사건이면 false 이다.',
            '',
            '[ { "title": "사건 제목", "summary": "이 사건에서 벌어지는 일 두 줄 이내 요약", "main": true } ]'
        ].join('\n');

        const json = await AI.chatJson({ settings: conf, system: system, prompt: prompt, maxTokens: 16000 });
        const rows = Array.isArray(json) ? json : (Array.isArray(json.flow) ? json.flow : []);

        const flow = rows.filter(function (row) { return row && !isBlank(row.title); }).map(function (row) {
            return {
                id: newId('flw'),
                title: String(row.title).trim(),
                summary: String(row.summary || '').trim(),
                main: row.main === true
            };
        });

        if (flow.length === 0) throw new Error('AI가 사건 흐름을 만들지 못했습니다. 다시 시도해 주세요.');
        project.flow = flow;
        return project;
    },

    /**
     * 사건 흐름을 목표 권수만큼 나눈다.
     * @returns {Array<Array>} 권별 사건 배열
     */
    splitFlowByVolumes(flow, totalVolumes) {
        const volumes = [];
        const count = Math.max(1, totalVolumes);
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
     * (10만 자 이상을 한 번에 생성할 수 없으므로 사건마다 한 번씩 호출한다.)
     *
     * @param {object} project
     * @param {{onProgress?:Function, settings?:object, cancelled?:Function}} options
     */
    async generateNextBook(project, options) {
        const opts = options || {};
        const conf = opts.settings || Settings.current;
        const onProgress = opts.onProgress || function () { };
        const cancelled = opts.cancelled || function () { return false; };

        if ((project.flow || []).length === 0) throw new Error('3단계 사건 흐름을 먼저 만들어 주세요.');
        const total = Math.max(1, project.targetVolumes || 1);
        const index = project.books.length;
        if (index >= total) throw new Error('목표 권수만큼 모두 생성되었습니다.');

        const volumes = this.splitFlowByVolumes(project.flow, total);
        const slice = volumes[index] || [];
        if (slice.length === 0) throw new Error('이번 권에 배정된 사건이 없습니다. 목표 권수를 줄여 주세요.');

        // 한 권 10만 ~ 15만 자를 목표로, 사건 하나가 담당할 분량을 계산한다.
        const perChapter = clamp(Math.round(125000 / slice.length), 1500, 7000);

        const book = {
            id: newId('bok'),
            index: index,
            title: (index + 1) + '권',
            createdAt: Date.now(),
            chapters: []
        };

        // 직전 권의 마지막 부분을 이어쓰기 참고 자료로 사용한다.
        let previousText = '';
        if (index > 0) {
            const prevMeta = project.books[index - 1];
            try {
                const prevBook = await Books.load(project.id, prevMeta.id);
                const lastChapter = prevBook.chapters[prevBook.chapters.length - 1];
                previousText = lastChapter ? lastChapter.text : '';
            } catch (e) {
                previousText = '';
            }
        }

        const globalOffset = volumes.slice(0, index).reduce(function (sum, v) { return sum + v.length; }, 0);

        for (let i = 0; i < slice.length; i++) {
            if (cancelled()) break;
            const item = slice[i];
            onProgress({ phase: 'writing', current: i + 1, total: slice.length, title: item.title });

            const text = await this.writeChapter(project, {
                settings: conf,
                flowIndex: globalOffset + i,
                item: item,
                previousText: previousText,
                targetChars: perChapter,
                volumeIndex: index,
                volumeTotal: total,
                isFirstOfBook: i === 0,
                isLastOfBook: i === slice.length - 1
            });

            book.chapters.push({
                id: newId('cht'),
                flowId: item.id,
                title: (i + 1) + '. ' + item.title,
                text: text
            });
            previousText = text;

            // 중간에 중단되더라도 진행분이 남도록 매 장마다 저장한다.
            await Books.save(project.id, book);
            onProgress({ phase: 'saved', current: i + 1, total: slice.length, title: item.title });
        }

        if (book.chapters.length === 0) {
            await Books.remove(project.id, book.id);
            throw new Error('생성이 취소되었습니다.');
        }

        project.books.push(Books.metaOf(book));
        await Projects.save(project);
        return book;
    },

    /** 사건 하나를 소설 본문으로 집필한다. */
    async writeChapter(project, params) {
        const conf = params.settings || Settings.current;

        const system = AUTHOR_PERSONA + ' ' + languageInstruction(conf) + ' '
            + '너는 지금 장편 소설의 본문을 집필하고 있다. '
            + '해설이나 요약, 머리말, 장 제목, 마크다운 기호를 쓰지 말고 소설 본문만 출력한다. '
            + '대화와 묘사, 인물의 내면을 균형 있게 배치한다.';

        const prompt = [
            worldSummary(project, false),
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
        if (isBlank(instruction)) throw new Error('수정 요청 내용을 입력해 주세요.');

        const system = AUTHOR_PERSONA + ' ' + languageInstruction(conf) + ' '
            + '너는 이미 쓰인 소설 본문을 요청에 맞게 고쳐 쓴다. '
            + '수정한 본문 전체만 출력하고, 설명이나 변경 목록은 출력하지 않는다.';

        const prompt = [
            worldSummary(project, false),
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
