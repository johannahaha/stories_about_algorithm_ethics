"use strict";

import * as THREE from "three";
//import {SmokeShader} from "./shaders/SmokeShader.js";
//import {BasicShader} from "./BasicShader.js";

let Ground = function(){
    THREE.Group.apply(this,arguments);
    let clock = new THREE.Clock();
    let scope = this;

    const uniforms = {
        "time":{value:0.0},
        "resolution":{value: new THREE.Vector2(window.innerWidth,window.innerHeight)},
        "speed":{value:1.0}
    }
    

    function initShader(){

        let planeGeometry = new THREE.PlaneBufferGeometry(10000, 20000);
        let planeMaterial = new THREE.MeshPhongMaterial({ color: 0x262626, depthWrite: false });
        //let shader = SmokeShader;
        //let shader = BasicShader;
        //const uniforms = THREE.UniformsUtils.clone( shader.uniforms );
        // console.log("uniforms",uniforms);
         
        // //TODO: fog
        // let planeMaterial = new THREE.ShaderMaterial({
        //     //credits for shader: http://shaderfrog.com/view/2459
        //     uniforms: uniforms,
        //     vertexShader: shader.vertexShader,
        //     fragmentShader: shader.fragmentShader
        // })

        console.log("uniforms",planeMaterial);
        //planeMaterial.uniforms.resolution.value.x = window.innerWidth;
        //planeMaterial.uniforms.resolution.value.y = window.innerHeight;
        
        let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        planeMesh.rotation.x = -Math.PI / 2;
        planeMesh.position.y = 0;
        planeMesh.receiveShadow = true;

        scope.add(planeMesh);

    }

    this.init = function(){
        initShader();
    }

    this.update = function(){
        uniforms.time.value = clock.getElapsedTime();
    }
}

Ground.prototype = Object.create(THREE.Group.prototype);
Ground.prototype.constructor = Ground;

export {Ground}