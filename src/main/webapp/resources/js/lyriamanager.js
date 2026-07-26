/**
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0
*/
/*
 * Shutting Stars
 *     Google Lyria 기반 음악 생성
 *     lyria.html 과 같이 동작
 *     게임에는 영향이 없으며 bundle 에 포함되지 않음
 * 
 * API 참고 : https://ai.google.dev/gemini-api/docs/music-generation?hl=ko
 * 요금제 : https://ai.google.dev/gemini-api/docs/pricing?hl=ko
 */

/** Lyria 음악 생성 요청을 보낼 Interactions API 주소 */
const INTERACTIONS_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
/** 브라우저 로컬 스토리지에서 API 키를 구분하는 이름 */
const API_KEY_STORAGE_NAME = 'shuttingstars.lyria.apiKey';

/** 화면 요소를 연결하고 음악 생성 화면의 이벤트를 준비한다. */
window.addEventListener('DOMContentLoaded', () => {
    /** 음악 생성 요청을 받는 폼 */
    const form = document.querySelector('.lyria-form');
    /** 사용자가 입력하는 Google API 키 입력란 */
    const apiKeyInput = document.querySelector('#lyria-api-key');
    /** API 키의 로컬 저장 여부를 정하는 체크박스 */
    const saveApiKeyInput = document.querySelector('#lyria-save-api-key');
    /** 호출할 Lyria 모델을 고르는 선택 상자 */
    const modelInput = document.querySelector('#lyria-model');
    /** 여러 줄 음악 설명과 가사를 입력하는 입력란 */
    const promptInput = document.querySelector('#lyria-prompt');
    /** 음악 생성을 시작하는 제출 버튼 */
    const submitButton = form.querySelector('[type="submit"]');
    /** 진행 상황이나 오류를 사용자에게 알리는 문구 영역 */
    const status = document.querySelector('.lyria-status');
    /** 생성 성공 후 재생기와 다운로드 버튼을 보여 주는 영역 */
    const result = document.querySelector('.lyria-result');
    /** 생성된 음악을 페이지에서 미리 듣는 오디오 재생기 */
    const audio = document.querySelector('.lyria-audio');
    /** 생성된 음악 파일을 내려받는 링크 */
    const download = document.querySelector('.lyria-download');
    /** 결과를 지우고 다음 음악 생성을 준비하는 버튼 */
    const resetButton = document.querySelector('.lyria-reset');
    /** 현재 생성 음원을 가리키는 임시 브라우저 URL */
    let audioUrl = null;

    /** 상태 문구와 오류 여부를 화면에 표시한다. */
    const setStatus = (message, state = '') => {
        status.textContent = message;
        status.dataset.state = state;
    };

    /** 저장해 둔 API 키를 로컬 스토리지에서 삭제한다. */
    const removeSavedApiKey = () => {
        try {
            window.localStorage.removeItem(API_KEY_STORAGE_NAME);
        } catch (error) {
            console.warn('Could not remove the saved Lyria API key:', error);
        }
    };

    /** 저장 체크 상태일 때 현재 API 키를 로컬 스토리지에 보관한다. */
    const saveApiKey = () => {
        if (!saveApiKeyInput.checked || !apiKeyInput.value.trim()) return;
        try {
            window.localStorage.setItem(API_KEY_STORAGE_NAME, apiKeyInput.value.trim());
        } catch (error) {
            console.warn('Could not save the Lyria API key:', error);
        }
    };

    /** 이전에 저장한 API 키가 있으면 입력란과 저장 체크박스를 복원한다. */
    try {
        /** 로컬 스토리지에 보관된 API 키 */
        const savedApiKey = window.localStorage.getItem(API_KEY_STORAGE_NAME);
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
            saveApiKeyInput.checked = true;
        }
    } catch (error) {
        console.warn('Could not read the saved Lyria API key:', error);
    }

    /** 저장 체크박스 변경 시 API 키를 저장하거나 즉시 삭제한다. */
    saveApiKeyInput.addEventListener('change', () => {
        if (saveApiKeyInput.checked) saveApiKey();
        else removeSavedApiKey();
    });
    /** 저장 중인 API 키가 바뀌면 변경 내용을 바로 반영한다. */
    apiKeyInput.addEventListener('input', saveApiKey);

    /** API 응답의 base64 오디오 문자열을 브라우저 재생용 Blob으로 바꾼다. */
    const base64ToBlob = (base64, mimeType) => {
        /** base64를 디코딩한 이진 문자열 */
        const binary = window.atob(base64);
        /** 이진 문자열을 담을 바이트 배열 */
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
        return new Blob([bytes], { type: mimeType || 'audio/mpeg' });
    };

    /** 이전 생성 음원의 임시 URL과 재생·다운로드 연결을 해제한다. */
    const releaseAudio = () => {
        if (audioUrl) window.URL.revokeObjectURL(audioUrl);
        audioUrl = null;
        audio.removeAttribute('src');
        audio.load();
        download.removeAttribute('href');
    };

    /** 폼 제출 시 선택한 모델에 음악 생성을 요청하고 결과를 화면에 연결한다. */
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        /** 공백을 제거한 API 키 */
        const apiKey = apiKeyInput.value.trim();
        /** 공백을 제거한 음악 프롬프트 */
        const prompt = promptInput.value.trim();
        /** 선택 상자가 제공하는 Lyria 모델 ID */
        const model = modelInput.value;
        if (!apiKey || !prompt) {
            setStatus('Google API 키와 음악 프롬프트를 모두 입력해 주세요.', 'error');
            return;
        }

        releaseAudio();
        result.hidden = true;
        submitButton.disabled = true;
        saveApiKey();
        setStatus('Lyria 3 Pro가 음악을 생성하고 있습니다. 몇 분 정도 걸릴 수 있습니다.');

        try {
            /** Google Interactions API의 음악 생성 응답 */
            const response = await window.fetch(INTERACTIONS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
                body: JSON.stringify({ model, input: prompt })
            });
            /** JSON으로 변환한 API 응답 본문 */
            const payload = await response.json();
            if (!response.ok) throw new Error(payload?.error?.message || `요청에 실패했습니다. (${response.status})`);

            /** 응답에 포함된 base64 인코딩 오디오 정보 */
            const generatedAudio = payload.output_audio;
            if (!generatedAudio?.data) throw new Error('응답에서 생성된 오디오를 찾지 못했습니다.');

            /** 응답이 제공한 MIME 타입 또는 기본 MP3 타입 */
            const mimeType = generatedAudio.mime_type || generatedAudio.mimeType || 'audio/mpeg';
            audioUrl = window.URL.createObjectURL(base64ToBlob(generatedAudio.data, mimeType));
            audio.src = audioUrl;
            download.href = audioUrl;
            download.download = `lyria-song-${new Date().toISOString().replace(/[:.]/g, '-')}.mp3`;
            result.hidden = false;
            setStatus('음악 생성이 완료되었습니다. 재생하거나 곡을 다운로드할 수 있습니다.');
        } catch (error) {
            console.error('Lyria music generation failed:', error);
            setStatus(`음악 생성에 실패했습니다. ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
        }
    });

    /** 초기화 버튼 클릭 시 결과 음원을 정리하고 프롬프트 입력란을 비운다. */
    resetButton.addEventListener('click', () => {
        releaseAudio();
        result.hidden = true;
        promptInput.value = '';
        setStatus('새 음악을 만들 준비가 되었습니다.');
        promptInput.focus();
    });

    /** 페이지를 떠날 때 생성 음원용 임시 URL을 정리한다. */
    window.addEventListener('beforeunload', releaseAudio);
});
