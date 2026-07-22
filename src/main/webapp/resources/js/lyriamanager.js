/**
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0
*/
/*
 * Shutting Stars
 *     Google Lyria 기반 음악 생성
 *     lyria.html 과 같이 동작
 */

const INTERACTIONS_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const API_KEY_STORAGE_NAME = 'shuttingstars.lyria.apiKey';

window.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.lyria-form');
    const apiKeyInput = document.querySelector('#lyria-api-key');
    const saveApiKeyInput = document.querySelector('#lyria-save-api-key');
    const modelInput = document.querySelector('#lyria-model');
    const promptInput = document.querySelector('#lyria-prompt');
    const submitButton = form.querySelector('[type="submit"]');
    const status = document.querySelector('.lyria-status');
    const result = document.querySelector('.lyria-result');
    const audio = document.querySelector('.lyria-audio');
    const download = document.querySelector('.lyria-download');
    const resetButton = document.querySelector('.lyria-reset');
    let audioUrl = null;

    const setStatus = (message, state = '') => {
        status.textContent = message;
        status.dataset.state = state;
    };

    const removeSavedApiKey = () => {
        try {
            window.localStorage.removeItem(API_KEY_STORAGE_NAME);
        } catch (error) {
            console.warn('Could not remove the saved Lyria API key:', error);
        }
    };

    const saveApiKey = () => {
        if (!saveApiKeyInput.checked || !apiKeyInput.value.trim()) return;
        try {
            window.localStorage.setItem(API_KEY_STORAGE_NAME, apiKeyInput.value.trim());
        } catch (error) {
            console.warn('Could not save the Lyria API key:', error);
        }
    };

    try {
        const savedApiKey = window.localStorage.getItem(API_KEY_STORAGE_NAME);
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
            saveApiKeyInput.checked = true;
        }
    } catch (error) {
        console.warn('Could not read the saved Lyria API key:', error);
    }

    saveApiKeyInput.addEventListener('change', () => {
        if (saveApiKeyInput.checked) saveApiKey();
        else removeSavedApiKey();
    });
    apiKeyInput.addEventListener('input', saveApiKey);

    const base64ToBlob = (base64, mimeType) => {
        const binary = window.atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
        return new Blob([bytes], { type: mimeType || 'audio/mpeg' });
    };

    const releaseAudio = () => {
        if (audioUrl) window.URL.revokeObjectURL(audioUrl);
        audioUrl = null;
        audio.removeAttribute('src');
        audio.load();
        download.removeAttribute('href');
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const apiKey = apiKeyInput.value.trim();
        const prompt = promptInput.value.trim();
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
            const response = await window.fetch(INTERACTIONS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
                body: JSON.stringify({ model, input: prompt })
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload?.error?.message || `요청에 실패했습니다. (${response.status})`);

            const generatedAudio = payload.output_audio;
            if (!generatedAudio?.data) throw new Error('응답에서 생성된 오디오를 찾지 못했습니다.');

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

    resetButton.addEventListener('click', () => {
        releaseAudio();
        result.hidden = true;
        promptInput.value = '';
        setStatus('새 음악을 만들 준비가 되었습니다.');
        promptInput.focus();
    });

    window.addEventListener('beforeunload', releaseAudio);
});
