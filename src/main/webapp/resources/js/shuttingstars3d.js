/**
 * Shutting Stars
 * 
 *     3D 장식 처리용 라이브러리
 *         모듈형 라이브러리로, html 에서 불러올 때 type 을 module 로 지정해야 함.
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

import * as THREE from './three.module.min.js';

class ShuttingStars3DModule extends ShuttingStars3DManager {
    scene = null;
    camera = null;
    renderer = null;
    resolution = {w : 0, h : 0};
    stageSize = {w : 0, h : 0};
    mainLight = null;
    gridHelper = null;
    init(canvas3d, coreInst) {
        const canvasBound = canvas3d.getBoundingClientRect();
        // 해상도 준비
        this.resolution.w = canvasBound.width;
        this.resolution.h = canvasBound.height;
        this.stageSize = coreInst.stageSize;

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

        // 메인 광원
        this.mainLight = new THREE.PointLight(0xFFFFFF, 0.9, 1000, 1);
        // this.mainLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.mainLight.position.set(this.stageSize.w * 2 / 3, this.stageSize.h * 2 / 3, 100);
        this.mainLight.visible = true;

        // 그리드 디버거
        this.gridHelper = new THREE.GridHelper(10, 10);
    }

    simultaneousJob(coreInst) {
        super.simultaneousJob(coreInst);
        let idx;

        coreInst.object3ds = [];

        /*
        for(idx=0; idx<coreInst.objectsPlaying.length; idx++) {
            const objOne = coreInst.objectsPlaying[idx];
            if(objOne.shape != 'circle') continue;

            const newObj = new SphereObject(this);
            newObj.x = this.convertX(objOne.x);
            newObj.y = this.convertY(objOne.y);
            newObj.z = 0;
            newObj.r = this.convertX(objOne.r);
            newObj.prepareDefaults();
            coreInst.object3ds.push(newObj);
        }
        */

        for(idx=0; idx<coreInst.objects.length; idx++) {
            const objOne = coreInst.objects[idx];
            if(objOne.shape != 'circle') continue;
            if(objOne instanceof VirtualKey) continue;
            if(objOne instanceof MouseEventArea) continue;
            if(objOne instanceof MouseClickHighlighter) continue;
            if(objOne instanceof Starlight) continue;
            const newObj = new SphereObject(this);
            newObj.x = this.convertX(objOne.x);
            newObj.y = this.convertY(objOne.y);
            newObj.z = 1;
            newObj.r = this.convertX(objOne.r);
            newObj.setColor(objOne.color);
            newObj.prepareDefaults();
            coreInst.object3ds.push(newObj);
        }


        /*
        let tempObj = new SphereObject(this);
        tempObj.x = this.convertX(10);
        tempObj.y = this.convertY(10);
        tempObj.z = 10;
        tempObj.r = this.convertX(10);
        tempObj.prepareDefaults();
        coreInst.object3ds.push(tempObj);

        tempObj = new SphereObject(this);
        tempObj.x = this.convertX(10);
        tempObj.y = this.convertY(this.stageSize.h - 10);
        tempObj.z = 10;
        tempObj.r = this.convertX(10);
        tempObj.prepareDefaults();
        coreInst.object3ds.push(tempObj);

        tempObj = new SphereObject(this);
        tempObj.x = this.convertX(this.stageSize.w - 10);
        tempObj.y = this.convertY(10);
        tempObj.z = 10;
        tempObj.r = this.convertX(10);
        tempObj.prepareDefaults();
        coreInst.object3ds.push(tempObj);

        tempObj = new SphereObject(this);
        tempObj.x = this.convertX(this.stageSize.w - 10);
        tempObj.y = this.convertY(this.stageSize.h - 10);
        tempObj.z = 10;
        tempObj.r = this.convertX(10);
        tempObj.prepareDefaults();
        coreInst.object3ds.push(tempObj);
        */
    }

    render(canvas3d, objects) {
        if(canvas3d == null) return;
        this.scene.background = null; // 배경 투명을 위한 또다른 조치

        // 일단 모든 객체 Scene 에서 제거
        this.scene.clear();

        // 광원 추가
        this.scene.add(this.mainLight);

        // 그리드 추가 (디버깅용)
        this.scene.add(this.gridHelper);

        // 3D 객체 추가
        for(let idx=0; idx<objects.length; idx++) {
            const objOne = objects[idx]; // ShuttingStars3DObject 타입
            const arr = objOne.getMeshes(this);
            for(let mesh of arr) {
                this.scene.add(mesh);
            }
        }

        this.renderer.render(this.scene, this.camera);
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
        this.resolution.w = canvasBound.width;
        this.resolution.h = canvasBound.height;
        this.stageSize = coreInst.stageSize;
    }

    /** 게임 내 무대 크기 (stageSize.w) 를 실제 화면 내 좌표 (resolution.w) 로 변환 */
    convertX(x) {
        return Math.round((x * this.resolution.w / this.stageSize.w));
    }

    /** 게임 내 무대 크기 (stageSize.h) 를 실제 화면 내 좌표 (resolution.h) 로 변환 */
    convertY(y) {
        return this.resolution.h - Math.round((y * this.resolution.h / this.stageSize.h));
    }

}

// 표준 구형 객체
class SphereObject extends ShuttingStars3DObject {
    x = 0;
    y = 0;
    z = 0;
    r = 1;
    color = 0x00ff00;
    constructor(manager) {
        super(manager);
    }

    prepareDefaults() {
        this.geometry = new THREE.SphereGeometry(this.r);
        this.material = new THREE.MeshBasicMaterial({ color : this.color, wireframe: false });
        this.sphere = new THREE.Mesh(this.geometry, this.material);
        this.sphere.position.set(this.x, this.y, this.z);
    }

    getMeshes(manager) {
        return [ this.sphere ];
    }

    setColor(colorRGB) { // color : 255, 0, 0 형식
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