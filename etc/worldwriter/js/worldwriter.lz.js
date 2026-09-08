/**
 * worldwriter.lz.js
 *
 * localStorage 용량 절감을 위한 LZ (LZW) 텍스트 압축 모듈.
 *
 * 동작 방식
 *  1. 문자열을 UTF-8 바이트 배열로 변환한다. (한글 등 모든 유니코드 문자 지원)
 *  2. 바이트 배열을 LZW 로 압축해 15비트 코드 스트림으로 만든다.
 *  3. 코드 스트림을 15비트 단위로 잘라 UTF-16 문자 하나에 담는다.
 *     (0x20 을 더해 제어문자 및 서로게이트 영역을 피한다.)
 *
 * 압축 결과가 원본보다 길어지는 짧은 문자열은 압축하지 않고 그대로 보관한다.
 * 저장 형식은 맨 앞 1글자로 구분한다.
 *   'R' + 원문                       : 비압축
 *   'C' + 원본바이트수 + '|' + 압축본 : 압축
 */

const CLEAR_CODE = 256;   // 사전 초기화 신호 코드
const FIRST_CODE = 257;   // 사전에 등록되는 첫 코드
const CODE_LIMIT = 32768; // 15비트로 표현 가능한 코드 수 (0 ~ 32767)
const CODE_BITS = 15;
const CHAR_OFFSET = 32;   // UTF-16 문자로 옮길 때 더하는 값

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** 15비트 코드들을 UTF-16 문자열로 묶어주는 기록기 */
class BitWriter {
    constructor() {
        this.chunks = [];
    }
    write(code) {
        this.chunks.push(String.fromCharCode(code + CHAR_OFFSET));
    }
    toString() {
        return this.chunks.join('');
    }
}

/** UTF-16 문자열에서 15비트 코드를 하나씩 꺼내는 판독기 */
class BitReader {
    constructor(text) {
        this.text = text;
        this.pos = 0;
    }
    hasNext() {
        return this.pos < this.text.length;
    }
    read() {
        return this.text.charCodeAt(this.pos++) - CHAR_OFFSET;
    }
}

/**
 * 문자열을 압축한다.
 * @param {string} text 원본 문자열
 * @returns {string} 저장용 문자열 (헤더 포함)
 */
export function compress(text) {
    if (typeof text !== 'string') text = String(text == null ? '' : text);
    if (text.length === 0) return 'R';

    const bytes = encoder.encode(text);
    const writer = new BitWriter();

    let dict = new Map();
    let next = FIRST_CODE;
    let w = -1;

    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if (w < 0) { w = b; continue; }

        const key = w * 256 + b;
        const found = dict.get(key);
        if (found !== undefined) { w = found; continue; }

        writer.write(w);
        if (next < CODE_LIMIT) {
            dict.set(key, next++);
        } else {
            // 사전이 가득 찼다. 초기화 신호를 보내고 처음부터 다시 시작한다.
            writer.write(CLEAR_CODE);
            dict = new Map();
            next = FIRST_CODE;
        }
        w = b;
    }
    if (w >= 0) writer.write(w);

    const packed = writer.toString();
    const body = 'C' + bytes.length + '|' + packed;

    // 압축 효과가 없으면 원문을 그대로 보관한다.
    return body.length < text.length + 1 ? body : 'R' + text;
}

/**
 * compress() 로 만든 문자열을 원래 문자열로 되돌린다.
 * @param {string} stored 저장되어 있던 문자열
 * @returns {string} 원본 문자열
 */
export function decompress(stored) {
    if (typeof stored !== 'string' || stored.length === 0) return '';

    const head = stored.charAt(0);
    if (head === 'R') return stored.substring(1);
    if (head !== 'C') {
        // 헤더가 없는 예전 형식 데이터는 원문으로 간주한다.
        return stored;
    }

    const sep = stored.indexOf('|');
    if (sep < 0) throw new Error('압축 데이터 형식이 올바르지 않습니다.');

    const byteLength = parseInt(stored.substring(1, sep), 10);
    const reader = new BitReader(stored.substring(sep + 1));

    const out = new Uint8Array(byteLength);
    let outPos = 0;

    let entries = [];      // FIRST_CODE 부터의 사전 항목 (각 항목은 바이트 배열)
    let next = FIRST_CODE;
    let prev = null;

    const emit = function(arr) {
        for (let i = 0; i < arr.length; i++) {
            if (outPos >= byteLength) return; // 마지막 패딩 방지
            out[outPos++] = arr[i];
        }
    };

    while (reader.hasNext() && outPos < byteLength) {
        const code = reader.read();

        if (code === CLEAR_CODE) {
            entries = [];
            next = FIRST_CODE;
            prev = null;
            continue;
        }

        let entry;
        if (code < 256) {
            entry = [code];
        } else if (code - FIRST_CODE < entries.length) {
            entry = entries[code - FIRST_CODE];
        } else if (prev !== null && code === next) {
            entry = prev.concat(prev[0]); // KwKwK 상황
        } else {
            throw new Error('압축 데이터가 손상되었습니다.');
        }

        emit(entry);

        if (prev !== null && next < CODE_LIMIT) {
            entries.push(prev.concat(entry[0]));
            next++;
        }
        prev = entry;
    }

    return decoder.decode(out.subarray(0, outPos));
}

export const LZ = { compress, decompress };
export default LZ;
