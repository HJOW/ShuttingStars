English | [한글](README.ko.md)

# Shutting Stars

This is now my just practice project for javascript web with canvas
to make my own rhythm game !

## TEST URL

https://hjow.duckdns.org/shuttingstars/
OR
https://shuttingstars-3eddf.web.app

## Simply run this game on local PC (using node)

Install node (https://nodejs.org)       
Then, run following command on project directory.    
```
npm install
npm start
```
Then, open "localhost:9690" with your web browser.

## Simply run this game on local PC (using deno)

Install deno (https://deno.com/)    
Then, run following command on project directory.    
```
deno install
deno task start
```
Then, open "localhost:9690" with your web browser.

## Why HTTP Server needs ?

As of now, it is configured to operate using only a pure web server and is compatible without dynamic server pages.    
(Some feature using firebase authentication and firestore to upload clear records. - Not necessary)
Due to browser companies' CORS policies, it must be run through a web server even when playing locally. 
WEB Sources : src/main/webapp

## Use in HTML

Webpack is used to bundle the JavaScript files into a single file.    
You can use it by loading `shuttingstars.bundle.js` as a normal JavaScript file.    
```
<script type="text/javascript" src='resources/js/dist/shuttingstars.bundle.js'></script>
```
After that, you can activate the game from HTML as follows.
```
window.addEventListener('load', function(){
    ShuttingStars.init();
});
```

## LICENSE

Copyright 2026 HJOW (hujinone22@naver.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. 

## Privacy Policy

https://hjow.duckdns.org/shuttingstars/privacy.html

## Major Third Party Songs

+ Woowahan free songs - robot fantasia

All intellectual property rights to each track included in the 배달의민족 <Robot Fantasia> album (hereinafter referred to as the “Subject Tracks”) are held by 우아한형제들 Inc.

Individual or corporate users may freely modify and alter all Subject Tracks free of charge for use in both commercial and non-commercial purposes.

However, please be aware that the act of selling the Subject Tracks themselves for a fee is strictly prohibited.

Web pages, advertisements, films, games, and other video materials using Subject Tracks may be collected and utilized in the future for purposes such as data collection and research for publications, for commercial or non-commercial purposes by 우아한형제들 Inc. Users of Subject Tracks who do not wish for such collection or utilization to be prohibited may contact the 우아한형제들 Customer Center (1600-0987 / CS@woowahan.com) at any time.

## Third Party SFX

Sonniss GDC GameAudio Bundle
https://sonniss.com/gdc-bundle-license/

## Third Party Fonts

+ Nanum Gothic, Nanum Myeongjo, Nanum Gothic Coding, D2Coding

Copyright (c) 2010, NAVER Corporation (https://www.navercorp.com/) with Reserved Font Name Nanum, Naver Nanum, NanumGothic, Naver NanumGothic, NanumMyeongjo, Naver NanumMyeongjo, NanumBrush, Naver NanumBrush, NanumPen, Naver NanumPen, Naver NanumGothicEco, NanumGothicEco, Naver NanumMyeongjoEco, NanumMyeongjoEco, Naver NanumGothicLight, NanumGothicLight, NanumBarunGothic, Naver NanumBarunGothic, NanumSquareRound, NanumBarunPen, MaruBuri, NanumSquareNeo

This Font Software is licensed under the SIL Open Font License, Version 1.1.

Visit https://help.naver.com/service/30016/contents/18088?osType=PC&lang=ko

+ Google Fonts - Noto Sans Series

SIL Open font license 1.1
https://fonts.google.com/noto

## Third Party Icons

+ Google Fonts - Material Symbols

Apache License 2.0
https://developers.google.com/fonts/docs/material_symbols?hl=ko

## Third Party Libraries

+ Three.js (Necessary, bundled on shuttingstars.bundle.js)

The MIT License
Copyright © 2010-2026 three.js authors
https://github.com/mrdoob/three.js/blob/dev/LICENSE

+ Crypto-JS (Only for crypto API not supported browsers)

The MIT License
Copyright (c) 2009-2013 Jeff Mott  
Copyright (c) 2013-2016 Evan Vosberg
https://github.com/brix/crypto-js/blob/develop/LICENSE

+ Pure CSS

BSD License
Copyright 2013 Yahoo! Inc.
https://github.com/pure-css/pure/blob/main/LICENSE

+ jQuery (Only for few side features)

Projects referencing this document are released under the terms of the MIT license.
https://jquery.com/license/

+ vanillawc/wc-monaco-editor (Only for Create Mode)

Copyright (c) 2020 VanillaWC
https://github.com/vanillawc/wc-monaco-editor/blob/main/LICENSE