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
    init(canvas3d, coreInst) {
        // 장면 준비
        this.scene = new THREE.Scene();
        // 카메라 준비
        this.camera = new THREE.PerspectiveCamera(50, coreInst.fOuterWidth() / coreInst.fOuterHeight(), 0.1, 1000);
        this.camera.position.set(0, 0, 1000);
        this.camera.lookAt(0, 0, 0);

        // 렌더러 준비
        this.renderer = new THREE.WebGLRenderer({
            canvas : canvas3d, antialias : true, alpha : true // 배경 투명하게 하려면 alpha 는 꼭 true 로 줄 것 !
        });
        // 3D 무대의 크기 지정
        const canvasBound = canvas3d.getBoundingClientRect();
        this.renderer.setSize(canvasBound.width, canvasBound.height);

        // 배경 투명 지정
        this.renderer.setClearAlpha(0);

        // 샘플 객체
        // coreInst.object3ds.push(new SampleObject(this));
    }

    render(canvas3d, objects) {
        if(canvas3d == null) return;
        this.scene.background = null; // 배경 투명을 위한 또다른 조치
        this.scene.clear();

        for(let idx=0; idx<objects.length; idx++) {
            const objOne = objects[idx]; // ShuttingStars3DObject 타입
            const arr = objOne.getMeshes(this);
            for(let mesh of arr) {
                this.scene.add(mesh);
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize(canvas3d, coreInst) {
        const selfs = this;
        if(this.camera == null || this.renderer == null) { setTimeout(() => { selfs.onWindowResize(canvas3d, coreInst); }, 1000); return; }
        this.camera.aspect = coreInst.fOuterWidth() / coreInst.fOuterHeight();
        this.camera.updateProjectionMatrix();

        const canvasBound = canvas3d.getBoundingClientRect();
        this.renderer.setSize(canvasBound.width, canvasBound.height);
    }
}

// 샘플 객체
class SampleObject extends ShuttingStars3DObject {
    geometry = null;
    material = null;
    sphere = null;
    constructor(manager) {
        super(manager);
        this.geometry = new THREE.SphereGeometry(20, 30, 40);
        this.material = new THREE.MeshBasicMaterial({ color : 0x00ff00, wireframe: false });
        this.sphere = new THREE.Mesh(this.geometry, this.material);
    }

    getMeshes(manager) {
        return [ this.sphere ];
    }
}

setTimeout(() => {
    _shuttingstarcore.set3DManager(new ShuttingStars3DModule())
}, 2000);