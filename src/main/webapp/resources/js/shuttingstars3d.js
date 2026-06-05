/**
 * Shutting Stars
 * 
 *     3D 장식 처리용 라이브러리
 *         모듈형 라이브러리로, html 에서 불러올 때 type 을 module 로 지정해야 함.
 *         three.js 의존성 존재.
 */

/*

LICENSE

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
 
 */

import * as THREE from './threejs/three.module.min.js';
import { EffectComposer  } from './threejs/postprocessing/EffectComposer.js';
import { RenderPass      } from './threejs/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './threejs/postprocessing/UnrealBloomPass.js';
import { OutputPass      } from './threejs/postprocessing/OutputPass.js';

class ShuttingStars3DModule extends ShuttingStars3DManager {
    scene = null;
    camera = null;
    renderer = null;
    renderPass = null;
    bloomPass = null;
    outputPass = null;
    effectComposer = null;
    resolution = {w : 0, h : 0};
    stageSize = {w : 0, h : 0};
    fullStages = {w : 0, h : 0};
    backLight = null;
    mainLight = null;
    gridHelper = null;
    audioVisualizer = null;

    
    init(canvas3d, coreInst) {
        // 캔버스 크기 구하기
        const canvasBound = canvas3d.getBoundingClientRect();

        // 해상도 준비
        this.resolution.w = canvasBound.width;
        this.resolution.h = canvasBound.height;
        this.stageSize = coreInst.stageSize;
        this.fullStages = coreInst.realStageSize;

        // 장면 준비
        this.scene = new THREE.Scene();
        // 카메라 준비
        // this.camera = new THREE.PerspectiveCamera(50, coreInst.fOuterWidth() / coreInst.fOuterHeight(), 0.1, 1000); // 원근법 쓰는 방식 - 좌표계가 2D와 맞지 않음
        const cameraWidth = canvasBound.width;
        const cameraHeight = canvasBound.height;
        this.camera = new THREE.OrthographicCamera(cameraWidth / (-2), cameraWidth / 2, cameraHeight / 2, cameraHeight / (-2), 0.1, 10000);
        this.camera.position.set(canvasBound.width / 2, canvasBound.height / 2, 1000);
        this.camera.lookAt(canvasBound.width / 2, canvasBound.height / 2, 0);

        // 렌더러 준비
        this.renderer = new THREE.WebGLRenderer({
            canvas : canvas3d, antialias : true, alpha : true // 배경 투명하게 하려면 alpha 는 꼭 true 로 줄 것 !
        });
        // 3D 무대의 크기 지정
        this.renderer.setSize(canvasBound.width, canvasBound.height);

        // 배경 투명 지정
        this.renderer.setClearAlpha(0);

        // Pass 준비
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(canvasBound.width, canvasBound.height));
        this.bloomPass.threshold = 0.5;
        this.bloomPass.strength = 0.4;
        this.bloomPass.radius = 0.8;
        this.outputPass = new OutputPass();
        this.effectComposer = new EffectComposer(this.renderer);
        this.effectComposer.addPass(this.renderPass);
        this.effectComposer.addPass(this.bloomPass);
        this.effectComposer.addPass(this.outputPass);

        // 메인 광원
        this.backLight = new THREE.AmbientLight(0xFFFFFF, 2);
        this.mainLight = new THREE.PointLight(0xFFFFFF, 2000, 100000, 1);
        // this.mainLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.mainLight.position.set(this.stageSize.w * 2 / 3, this.stageSize.h * 2 / 3, 100);
        this.mainLight.visible = true;

        // 오디오 시각화 객체
        this.audioVisualizer = new AudioVisualizingObject(coreInst, this);

        // 그리드 디버거
        this.gridHelper = new THREE.GridHelper(10, 10);
    }

    /** shuttingstars.js 에서 resetStage 메소드 내에서 state 가 songtitle 일 때 호출됨 (즉 곡 플레이 직전 초기화 작업 중 호출됨) */
    onSongPlayPreparing(coreInst) {
        let idx;
        let newObj;

        coreInst.object3ds = [];
        if(! coreInst.disable3d) {
            if(coreInst.state == 'songtitle' || coreInst.state == 'playing') {
                // 노트 그리기
                this.synchronizeNotePart(coreInst);
                
                // NotePlacer 그리기
                this.synchronizeNotePlacerPart(coreInst);

                // 행성 그리기
                this.synchronizePlanetPart(coreInst);

                // 시각화
                coreInst.object3ds.push(this.audioVisualizer);
            }
        }
    }

    /** shuttingstars.js 에서 곡 플레이 종료 시 호출  */
    onSongEnd(coreInst){
        if(coreInst.object3ds) {
            for(let idx=0; idx<coreInst.object3ds.length; idx++) {
                coreInst.object3ds[idx].dispose();
            }
        }
        coreInst.object3ds = [];
    }

    /** 동기화 - Notes */
    synchronizeNotePart(coreInst) {
        if(! coreInst.disable3d) {
            if(coreInst.state == 'songtitle' || coreInst.state == 'playing') {
                // 노트 등 객체 그리기
                if(coreInst.use3d.notes) {
                    // 노트 그리기
                    for(let idx=0; idx<coreInst.objectsPlaying.length; idx++) {
                        const objOne = coreInst.objectsPlaying[idx];
                        if(objOne.shape != 'circle') continue;
                        if(! (objOne instanceof Note)) continue;

                        const newObj = new SphereObject(this);
                        newObj.uniqueSerial = objOne.uniqueSerial;
                        newObj.x = this.convertX(objOne.x);
                        newObj.y = this.convertY(objOne.y);
                        newObj.z = 1;
                        newObj.r = this.convertX(objOne.r);
                        newObj.opacity = objOne.opacity;
                        newObj.fill = true;
                        newObj.hidden = false;
                        newObj.setColor(objOne.color);
                        newObj.prepareDefaults();
                        coreInst.object3ds.push(newObj);
                    }
                }
            }
        }
    }

    /** 동기화 - NotePlacer */
    synchronizeNotePlacerPart(coreInst) {
        if(coreInst.use3d.notePlacer) {
            for(let idx=0; idx<coreInst.objectsPlaying.length; idx++) {
                const objOne = coreInst.objectsPlaying[idx];
                if(objOne.shape != 'circle') continue;
                if(! (objOne instanceof NotePlacer)) continue;

                const newObj = new SphereObject(this);
                newObj.uniqueSerial = objOne.uniqueSerial;
                newObj.x = this.convertX(objOne.x);
                newObj.y = this.convertY(objOne.y);
                newObj.z = 1;
                newObj.r = this.convertX(objOne.r);
                newObj.opacity = 0.1;
                if(newObj.explosing == 1) newObj.opacity = 0.2;
                if(newObj.explosing == 2) newObj.opacity = 0.5;
                if(newObj.explosing == 3) newObj.opacity = 0.8;
                if(newObj.explosing == 4) newObj.opacity = 0.5;
                if(newObj.explosing == 5) newObj.opacity = 0.2;
                newObj.fill = false;
                newObj.hidden = false;
                newObj.setColor(objOne.color);
                newObj.prepareDefaults();
                coreInst.object3ds.push(newObj);
            }
        }
    }

    /** 동기화 - 행성 */
    synchronizePlanetPart(coreInst) {
        if(coreInst.use3d.planet) {
            // 지구 객체 그리기
            if(coreInst.notePlacers.length >= 1) {
                let x      = Math.round((coreInst.notePlacers[0].x + coreInst.notePlacers[coreInst.notePlacers.length-1].x) / 2.0);
                let radius = Math.round((coreInst.notePlacers[coreInst.notePlacers.length-1].x - coreInst.notePlacers[0].x) / 2.0) * 8;
                let y      = coreInst.getHpBarYLocation() - radius;

                let arr = coreInst.calculateHpColor();
                let r, g, b;
                r = arr[0];
                g = arr[1];
                b = arr[2];
                
                const hpBarInsideColor = coreInst.convertColor('rgb(' + r + ', ' + g + ', ' + b + ')');

                const newObj = new SphereObject(this);
                newObj.uniqueSerial = ShuttingStarsUtility.randomInt();
                newObj.x = this.convertX(x);
                newObj.y = this.convertY(y);
                newObj.z = 1;
                newObj.r = this.convertX(r);
                newObj.opacity = 1.0;
                newObj.fill = true;
                newObj.hidden = false;
                newObj.setColor(hpBarInsideColor);
                newObj.prepareDefaults();
                coreInst.object3ds.push(newObj);
            }
        }
    }

    /** 동시 처리 (반복 호출됨) */
    simultaneousJob(coreInst) {
        super.simultaneousJob(coreInst);
        let newObj;
        let idx;

        /*
        coreInst.object3ds = [];
        
        // 노트 그리기
        this.synchronizeNotePart(coreInst);
        
        // NotePlacer 그리기
        this.synchronizeNotePlacerPart(coreInst);

        // 행성 그리기
        this.synchronizePlanetPart(coreInst);

        // 시각화
        coreInst.object3ds.push(this.audioVisualizer);
        */

        // 동기화
        for(idx=0; idx<coreInst.objectsPlaying.length; idx++) {
            const objOne = coreInst.objectsPlaying[idx];
            const obj3d  = coreInst.find3DObject(objOne.uniqueSerial);
            if(obj3d == null) continue;

            obj3d.setPosition(this.convertX(objOne.x), this.convertY(objOne.y), 1);
            if(objOne.r) obj3d.setR(this.convertX(objOne.r));
            if(objOne.color  ) obj3d.setColor(objOne.color);
            if(objOne.opacity) { obj3d.setOpacity(objOne.opacity); }

            if(objOne.explosing) {
                if(objOne.explosing >= 2) obj3d.hidden = true;
                if(objOne.explosing >= objOne.explosingMax) obj3d.hidden = true;
            }
        }

        // 폭발 객체 동기화 (순방향)
        for(idx=0; idx<coreInst.objects.length; idx++) {
            const objOne = coreInst.objects[idx];
            if(objOne.shape != 'circle') continue;
            if(objOne instanceof VirtualKey) continue;
            if(objOne instanceof MouseEventArea) continue;
            if(objOne instanceof MouseClickHighlighter) continue;
            if(objOne instanceof Starlight) continue;

            let lightRadius = 1.5;
            if(objOne.explosing <= 3) lightRadius += (0.1 * objOne.explosing);
            else                      lightRadius = 1.8 - (0.2 * (objOne.explosing - 3));

            newObj = coreInst.find3DObject(objOne.uniqueSerial);
            if(newObj == null) {
                newObj = new LightPoint(this, lightRadius);
                newObj.uniqueSerial = objOne.uniqueSerial;
                newObj.x = this.convertX(objOne.x);
                newObj.y = this.convertY(objOne.y);
                newObj.z = 1;
                newObj.r = this.convertX(objOne.r);
                newObj.hidden = false;
                newObj.opacity = objOne.opacity;
                newObj.setColor(objOne.color);
                newObj.prepareDefaults();
                coreInst.object3ds.push(newObj);
            }
        }

        // 폭발 객체 동기화 (역방향)
        for(idx=0; idx<coreInst.object3ds.length; idx++) {
            const newObj = coreInst.object3ds[idx];
            if(newObj instanceof LightPoint) {
                if(newObj.uniqueSerial) {
                    // 폭발 객체가 아직 남아있는지 확인
                    let existsNow = false;
                    for(let jdx=0; jdx<coreInst.objects.length; jdx++) {
                        const objOne = coreInst.objects[jdx];
                        if(objOne.shape != 'circle') continue;
                        if(objOne instanceof VirtualKey) continue;
                        if(objOne instanceof MouseEventArea) continue;
                        if(objOne instanceof MouseClickHighlighter) continue;
                        if(objOne instanceof Starlight) continue;
                        if(objOne.uniqueSerial == newObj.uniqueSerial) { existsNow = true; break; }
                    }
                    if(! existsNow) {
                        newObj.dispose();
                        newObj.hidden = true;
                        coreInst.object3ds.splice(idx, 1);
                        idx--;
                    }
                }
            }
        }
    }

    /** 시각화 동작 시 호출 */
    soundVisualizing(coreInst, audioAnalyzer, audioBuffer) {
        this.audioVisualizer.onSoundVisualizing(coreInst, this, audioAnalyzer, audioBuffer);
    }

    /** 렌더링 (만들어 뒀던 객체들을 scene 에 넣기) */
    render(canvas3d, objects) {
        if(canvas3d == null) return;
        this.scene.background = null; // 배경 투명을 위한 또다른 조치

        // 일단 모든 객체 Scene 에서 제거
        this.scene.clear();

        // 광원 추가
        this.scene.add(this.backLight);
        this.scene.add(this.mainLight);

        // 그리드 추가 (디버깅용)
        this.scene.add(this.gridHelper);

        // 3D 객체 추가
        for(let idx=0; idx<objects.length; idx++) {
            const objOne = objects[idx]; // ShuttingStars3DObject 타입
            if(objOne.hidden) continue;

            const arr = objOne.getMeshes(this);
            for(let mesh of arr) {
                this.scene.add(mesh);
            }
        }

        this.effectComposer.render(); // this.renderer.render(this.scene, this.camera); 대신 사용
    }

    clear() {
        if(this.scene == null) return;
        this.scene.clear();
        if(this.renderer == null || this.camera == null) return;
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize(canvas3d, coreInst) {
        const selfs = this;
        if(this.camera == null || this.renderer == null) { setTimeout(() => { selfs.onWindowResize(canvas3d, coreInst); }, 1000); return; }
        this.camera.aspect = coreInst.fOuterWidth() / coreInst.fOuterHeight();
        this.camera.updateProjectionMatrix();

        const canvasBound = canvas3d.getBoundingClientRect();
        this.renderer.setSize(canvasBound.width, canvasBound.height);
        this.effectComposer.setSize(canvasBound.width, canvasBound.height);
        this.resolution.w = canvasBound.width;
        this.resolution.h = canvasBound.height;
        this.stageSize = coreInst.stageSize;
    }

    /** 게임 내 무대 크기 (stageSize.w) 를 실제 화면 내 좌표 (resolution.w) 로 변환 */
    convertX(x) {
        return Math.round((x * this.resolution.w / this.fullStages.w));
    }

    /** 게임 내 무대 크기 (stageSize.h) 를 실제 화면 내 좌표 (resolution.h) 로 변환 */
    convertY(y) {
        return this.resolution.h - Math.round((y * this.resolution.h / this.fullStages.h));
    }

}

// 표준 3D 객체
class Locational3DObject extends ShuttingStars3DObject {
    x = 0;
    y = 0;
    z = 0;
    r = 1;
    color = 0x00ff00;
    fill = true;
    opacity = 1.0;
    geometry = null;
    material = null;
    mesh = null;

    constructor(manager) {
        super(manager);
    }

    setPosition(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    setR(r) {
        this.r = r;
    }

    setFill(fillyn) {
        this.fill = fillyn;
    }

    setOpacity(opa) {
        this.opacity = opa;
    }

    setColor(colorRGB) {
        let obj = colorRGB;
        if(typeof(obj) == 'number') {
            this.color = obj;
            return;
        }

        obj = String(obj);
        if(obj.indexOf('rgb(') == 0 || obj.indexOf('rgba(') == 0) {
            if(obj.indexOf('rgb(') == 0) obj = obj.substring(4, obj.length - 1);
            else                         obj = obj.substring(5, obj.length - 1);
        }
        colorRGB = obj;

        const splits = colorRGB.split(',');
        const r = parseInt(splits[0].trim());
        const g = parseInt(splits[1].trim());
        const b = parseInt(splits[2].trim());

        let hr = r.toString(16);
        let hg = g.toString(16);
        let hb = b.toString(16);

        if(hr.length == 1) hr = '0' + hr;
        if(hg.length == 1) hg = '0' + hg;
        if(hb.length == 1) hb = '0' + hb;

        this.color = parseInt('0x' + hr + '' + hg + '' + hb);
    }

    dispose() {
        if(this.geometry != null) { if(this.geometry.dispose) this.geometry.dispose(); }
        if(this.material != null) { if(this.material.dispose) this.material.dispose(); }
    }
}

// 표준 구형 객체
class SphereObject extends Locational3DObject {
    constructor(manager) {
        super(manager);
    }

    prepareDefaults() {
        this.geometry = new THREE.SphereGeometry(this.r);
        this.material = new THREE.MeshStandardMaterial({ color : this.color, wireframe: (! this.fill), transparent : true, opacity : this.opacity });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(this.x, this.y, this.z);
    }

    setColor(colorRGB) {
        super.setColor(colorRGB);
        if(this.material != null) this.material.color.setHex(this.color);
    }

    setOpacity(opa) {
        super.setOpacity(opa);
        if(this.material != null) {
            this.material.opacity = opa;
            this.material.needsUpdate = true;
        }
    }

    setFill(fillyn) {
        super.setFill(fillyn);
        if(this.material != null) {
            this.material.wireframe = (! fillyn);
            this.material.needsUpdate = true;
        }
    }

    setPosition(x, y, z) {
        super.setPosition(x, y, z);
        if(this.mesh != null) this.mesh.position.set(this.x, this.y, this.z);
    }

    setR(r) {
        super.setR(r);
        // SphereGeometry 에서 반지름은 중간에 변경이 불가능
    }

    getMeshes(manager) {
        return [ this.mesh ];
    }
}

/** 광원 객체 */
class LightPoint extends SphereObject {
    bright = 1.5;
    light = null;

    constructor(manager, bright) {
        super(manager);
        this.bright = bright;
    }

    prepareDefaults() {
        this.light = new THREE.PointLight(this.color, this.bright, 800, 1);
        this.light.position.set(this.x, this.y, this.z);
        this.light.visible = true;
    }

    getMeshes(manager) {
        return [ this.light ];
    }
}

/** 3D 시각화 담당 클래스 */
class AudioVisualizingObject extends ShuttingStars3DObject {
    preparedMeshes = [];
    vertexShader = null;
    fragmentShader = null;

    shaderMaterial = null;
    geometry = null;
    mainMesh = null;

    uniforms = {
        u_time : { value : 0 },
        u_frequency : {value : 0 },
        u_size : {value : 50.0 },
        u_red : {value : 1.0},
        u_green : {value : 1.0},
        u_blue : {value : 1.0}
    };
    
    constructor(coreInst, manager) {
        super(); 
        this.init(coreInst, manager);
    }

    /** 초기화 */
    init(coreInst, manager) {
        if(coreInst.useAudioVisualizer && coreInst.use3d.visualization) {
            if(this.shaderMaterial == null) {
                // 참고 : https://waelyasmina.net/articles/how-to-create-a-3d-audio-visualizer-using-three-js/
                const vertexShaderCodes = `
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
                float pnoise(vec3 P, vec3 rep) {
                    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
                    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
                    Pi0 = mod289(Pi0);
                    Pi1 = mod289(Pi1);
                    vec3 Pf0 = fract(P); // Fractional part for interpolation
                    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
                    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
                    vec4 iy = vec4(Pi0.yy, Pi1.yy);
                    vec4 iz0 = Pi0.zzzz;
                    vec4 iz1 = Pi1.zzzz;

                    vec4 ixy = permute(permute(ix) + iy);
                    vec4 ixy0 = permute(ixy + iz0);
                    vec4 ixy1 = permute(ixy + iz1);

                    vec4 gx0 = ixy0 * (1.0 / 7.0);
                    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
                    gx0 = fract(gx0);
                    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
                    vec4 sz0 = step(gz0, vec4(0.0));
                    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
                    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

                    vec4 gx1 = ixy1 * (1.0 / 7.0);
                    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
                    gx1 = fract(gx1);
                    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
                    vec4 sz1 = step(gz1, vec4(0.0));
                    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
                    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

                    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
                    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
                    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
                    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
                    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
                    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
                    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
                    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

                    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
                    g000 *= norm0.x;
                    g010 *= norm0.y;
                    g100 *= norm0.z;
                    g110 *= norm0.w;
                    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
                    g001 *= norm1.x;
                    g011 *= norm1.y;
                    g101 *= norm1.z;
                    g111 *= norm1.w;

                    float n000 = dot(g000, Pf0);
                    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
                    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
                    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
                    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
                    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
                    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
                    float n111 = dot(g111, Pf1);

                    vec3 fade_xyz = fade(Pf0);
                    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
                    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
                    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
                    return 2.2 * n_xyz;
                }
                uniform float u_frequency;
                uniform float u_time;
                uniform float u_size;
                void main() { 
                    float noise = u_size * pnoise(position + u_time, vec3(10.));
                    float displacement = (u_frequency / 10.) * (noise / 10.);
                    vec3 newPosition = position + normal * displacement;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0); 
                }
                `;
                
                const fragmentShaderCodes = `
                uniform float u_red;
                uniform float u_green;
                uniform float u_blue;
                void main() { gl_FragColor = vec4(vec3(u_red, u_green, u_blue), 1. ); }
                `;

                this.shaderMaterial = new THREE.ShaderMaterial({
                    wireframe : true,
                    uniforms : this.uniforms,
                    vertexShader : vertexShaderCodes,
                    fragmentShader : fragmentShaderCodes
                });
                this.geometry = new THREE.IcosahedronGeometry(200, 30); // 크기 및 복잡도 지정
                this.mainMesh = new THREE.Mesh(this.geometry, this.shaderMaterial);
                this.preparedMeshes.push(this.mainMesh);
            }
        } else {
            this.shaderMaterial = null;
            this.preparedMeshes = [];
        }
    }

    /** 주기적으로 호출됨 (60000 / 음악bpm / 16 밀리초마다) */
    onSoundVisualizing(coreInst, manager, audioAnalyzer, audioBuffer) {
        const selfs = this;
        if(audioBuffer == null || audioBuffer.length <= 0) { this.preparedMeshes = []; return; }

        this.init(coreInst, manager);
        if(this.shaderMaterial != null) {
            // 곡 주파수 데이터 전체 평균 구하기
            let avg = 0;
            for(let idx=0; idx<audioBuffer.length; idx++) {
                avg += audioBuffer[idx];
            }
            avg = avg / audioBuffer.length;

            // 곡 진행 시간
            let time = (coreInst.elapsedTime < 0 ? 0 : coreInst.elapsedTime);

            let hp = coreInst.hp + 0; // 100 이 최대
            if(coreInst.gameOverDelayed) hp = 0;

            /*
            HP와 곡 진행 시간에 따라 컬러를 변경
            진행 시간이 지날수록 흰색에서 은은한 초록/파랑 계열로 이동하며,
            HP가 떨어질수록 붉은 기운 추가
            HP가 20 이하일 때는 0에 가까워질수록 검은색에 가까워지도록 변경
            */
            const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
            const lerp = (start, end, ratio) => start + (end - start) * ratio;

            let progress = 0.0;
            if(coreInst.song && typeof coreInst.song.endTime === 'number' && coreInst.song.endTime > 0) {
                progress = clamp(time / coreInst.song.endTime, 0.0, 1.0);
            } else {
                progress = clamp(time / 120.0, 0.0, 1.0); // 기본값: 2분 기준
            }

            const white = { r: 1.0, g: 1.0, b: 1.0 };
            const softGreen = { r: 0.75, g: 1.0, b: 0.85 };
            const softBlue  = { r: 0.7,  g: 0.9, b: 1.0 };

            let baseColor;
            if(progress < 0.5) {
                const ratio = progress * 2.0;
                baseColor = {
                    r: lerp(white.r, softGreen.r, ratio),
                    g: lerp(white.g, softGreen.g, ratio),
                    b: lerp(white.b, softGreen.b, ratio)
                };
            } else {
                const ratio = (progress - 0.5) * 2.0;
                baseColor = {
                    r: lerp(softGreen.r, softBlue.r, ratio),
                    g: lerp(softGreen.g, softBlue.g, ratio),
                    b: lerp(softGreen.b, softBlue.b, ratio)
                };
            }

            const hpRatio = clamp(hp / 100.0, 0.0, 1.0);
            const danger = 1.0 - hpRatio;

            let red = clamp(baseColor.r + danger * 0.35, 0.0, 1.0);
            let green = clamp(baseColor.g - danger * 0.15, 0.0, 1.0);
            let blue = clamp(baseColor.b - danger * 0.15, 0.0, 1.0);

            if(hp <= 20) {
                const blackFade = clamp((20 - hp) / 20.0, 0.0, 1.0);
                red   = red   * (1.0 - blackFade) + 0.18 * blackFade;
                green = green * (1.0 - blackFade);
                blue  = blue  * (1.0 - blackFade);
            }

            this.uniforms.u_red.value   = red;
            this.uniforms.u_green.value = green;
            this.uniforms.u_blue.value  = blue;


            // https://waelyasmina.net/articles/how-to-create-a-3d-audio-visualizer-using-three-js/ 참고하여 구현 중
            // uniform 에 값을 넣어 쉐이더에 값을 전달
            this.uniforms.u_time.value = time;
            this.uniforms.u_frequency.value = avg;
            this.shaderMaterial.uniforms.u_time.value = this.uniforms.u_time.value;
            this.shaderMaterial.uniforms.u_frequency.value = this.uniforms.u_frequency.value;
            this.shaderMaterial.uniforms.u_red.value = this.uniforms.u_red.value;
            this.shaderMaterial.uniforms.u_green.value = this.uniforms.u_green.value;
            this.shaderMaterial.uniforms.u_blue.value = this.uniforms.u_blue.value;

            // Mesh 객체 위치 지정
            this.mainMesh.position.set( coreInst.convertX(coreInst.getStageWidth() * 2 / 3), coreInst.convertY(coreInst.getStageHeight() * 2 / 3), 50);
        }        
    }

    /** Three.js Mesh 객체 반환 */
    getMeshes(manager) {
        return this.preparedMeshes;
    }
}

// 샘플 객체
class SampleObject extends SphereObject {
    constructor(manager) {
        super(manager);
        this.x = 20;
        this.y = 20;
        this.z = 0;
        this.r = 20;
        this.prepareDefaults();
    }
}

setShuttingStar3D(new ShuttingStars3DModule());