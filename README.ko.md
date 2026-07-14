한국어 | [English](README.md)

# Shutting Stars

HTML canvas 연습 프로젝트로, 리듬 게임을 만들고 있습니다.

## 테스트 URL

https://hjow.duckdns.org/shuttingstars/
또는
https://shuttingstars-3eddf.web.app

## 로컬에서 서버 구동 (node 사용)

node 설치가 필요합니다. (https://nodejs.org/ko)   
다음 명령어를 프로젝트 최상단 디렉토리에서 실행합니다.
```
npm install
npm start
```
이후 웹 브라우저에서 localhost:9690 으로 접속하세요.

## 로컬에서 서버 구동 (deno 사용)

deno 설치가 필요합니다. (https://deno.com/)    
다음 명령어를 프로젝트 최상단 디렉토리에서 실행합니다.
```
deno install
deno task start
```
이후 웹 브라우저에서 localhost:9690 으로 접속하세요.

## 왜 HTTP 서버를 통해 구동해야 하나요?

현재 기준, 대부분의 기능이 순수 웹 서버만으로도 동작하도록 구성되어 있으며, 동적 서버 페이지 기술 없이 호환됩니다.    
(선택사항으로, Firebase anthentication 로그인 및 클리어 기록 Firestore DB 업로드 기능이 구현되어 있습니다.)
브라우저 회사들의 CORS 정책으로 인하여, 로컬에서 플레이하더라도 반드시 웹 서버를 통한 구동이 필요합니다.    
웹 소스 경로 : src/main/webapp

## HTML 에서 사용 (원하는 페이지에 미니게임처럼 넣고 싶을 때)

Webpack 을 이용하여 JavaScript 파일들을 하나의 파일로 합쳐 사용합니다.    
(node 또는 deno 서버를 구동할 때마다 webpack 이 한번씩 동작하여 파일을 재생성합니다.)
shuttingstars.bundle.js 파일 하나를 일반 JavaScript 파일로 탑재하여 사용할 수 있습니다.    
```
<script type="text/javascript" src='resources/js/dist/shuttingstars.bundle.js'></script>
```
이후 HTML 에서 다음과 같이 게임을 활성화할 수 있습니다.
```
window.addEventListener('load', function(){
    ShuttingStars.init();
});
```
특정 위치에 배치하려는 경우, 해당 위치에 div 태그를 배치하고 id 를 shuttingstar_canvas_root 로 부여하신 후 다음과 같이 활성화하세요.
```
window.addEventListener('load', function(){
    const root = document.getElementById('shuttingstar_canvas_root');
    ShuttingStars.init(root);
});
```

## 라이센스

Copyright 2026 HJOW (hujinone22@naver.com)

이 소프트웨어는 Apache License, Version 2.0("라이선스")에 따라 사용이 허가됩니다.
라이선스를 준수하지 않고는 이 파일을 사용할 수 없습니다.
라이선스 사본은 다음에서 확인할 수 있습니다.

http://www.apache.org/licenses/LICENSE-2.0

관련 법률에서 요구하거나 서면으로 동의하지 않는 한,
이 라이선스에 따라 배포되는 소프트웨어는 "있는 그대로" 배포되며,
어떠한 종류의 명시적 또는 묵시적 보증이나 조건도 제공하지 않습니다.

라이선스에 따른 특정 언어별 사용 권한 및 제한 사항은 라이선스를 참조하십시오.

## 개인정보처리방침

https://hjow.duckdns.org/shuttingstars/privacy.html

## 메인 써드파티 곡

+ 배달의민족 무료음원 - 로봇판타지아

배달의민족 <로봇판타지아> 앨범에 포함된 각 음원(이하 “본건 음원”)의 일체 지식재산권은 ㈜우아한형제들이 보유합니다.
개인 또는 기업 사용자는 본건 음원을 모두 무상으로 자유롭게 수정·변경하여 영리적·비영리적 목적으로
사용하실 수 있습니다.

다만, 본건 음원 자체를 유상으로 판매하는 행위는 철저히 금지하고 있으니, 이를 유의하여 주시기 바랍니다.

본건 음원을 사용한 웹페이지 및 광고, 영화, 게임 등의 영상물 등의 사례는 추후 ㈜우아한형제들의 영리 또는 비영리 목적의 출판 등을 위한 자료 수집 및 연구 등의 목적으로 수집, 활용될 수 있습니다. 이와 같은 수집, 활용 행위를 원치 않는 본건
음원의 사용자는 언제든지 ㈜우아한형제들 고객센터(1600-0987 / CS@woowahan.com)로 위 수집, 활용 행위의 금지를 요청해주시기 바랍니다.

## 써드파티 효과음

Sonniss GDC GameAudio Bundle
https://sonniss.com/gdc-bundle-license/

## 써드파티 글꼴

+ 나눔고딕, 나눔명조, 나눔고딕코딩, D2Coding

‘나눔, 네이버 나눔, 나눔고딕, 네이버 나눔고딕, 나눔명조, 네이버 나눔명조, 나눔손글씨, 네이버 나눔손글씨, 나눔펜, 네이버 나눔펜, 네이버 나눔고딕에코, 나눔고딕에코, 네이버 나눔명조에코, 나눔명조에코, 네이버 나눔고딕라이트, 나눔고딕라이트, 나눔바른고딕, 네이버나눔바른고딕, 나눔스퀘어라운드, 나눔바른펜, 마루 부리, 나눔스퀘어네오’ 폰트명에 대해 NAVER(https://www.navercorp.com/)가 저작권을 소유하고 있습니다.

본 폰트 소프트웨어는 SIL 오픈 폰트 라이선스 버전 1.1에 따라 라이선스 취득을 하였습니다.

전문 : https://help.naver.com/service/30016/contents/18088?osType=PC&lang=ko

+ Google Fonts - Noto Sans Series

SIL Open font license 1.1
https://fonts.google.com/noto

## 써드파티 아이콘

+ Google Fonts - Material Symbols

Apache License 2.0
https://developers.google.com/fonts/docs/material_symbols?hl=ko

## 써드파티 Library

+ Three.js (필수, 번들 shuttingstars.bundle.js 에 포함됨)

The MIT License
Copyright © 2010-2026 three.js authors
https://github.com/mrdoob/three.js/blob/dev/LICENSE

+ JSON5 (필수, 번들 shuttingstars.bundle.js 에 포함됨)

MIT License
Copyright (c) 2012-2018 Aseem Kishore, and others.
https://github.com/json5/json5/blob/main/LICENSE.md

+ Crypto-JS (선택사항, crypto 표준 API 미지원 시 필요)

The MIT License
Copyright (c) 2009-2013 Jeff Mott  
Copyright (c) 2013-2016 Evan Vosberg
https://github.com/brix/crypto-js/blob/develop/LICENSE

+ Pure CSS (선택사항)

BSD License
Copyright 2013 Yahoo! Inc.
https://github.com/pure-css/pure/blob/main/LICENSE

+ vanillawc/wc-monaco-editor (Create Mode 에서만 사용)

Copyright (c) 2020 VanillaWC
https://github.com/vanillawc/wc-monaco-editor/blob/main/LICENSE

+ jQuery (일부 사이드 기능에서만 사용)

Projects referencing this document are released under the terms of the MIT license.
https://jquery.com/license/