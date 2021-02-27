"use strict";

import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
//import {GlowingShader} from "./shaders/GlowingShader.js";
//import {OuterGlowShader} from "./shaders/OuterGlowShader.js";

class ModelLoader {
    constructor(){
       this.models = [];
    }

    async init(){
        let paths = ['/threeAssets/bamfschildneu.gltf'];

        const manager = new THREE.LoadingManager();
        manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
            console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        };

        manager.onLoad = function ( ) {
            console.log( 'Loading complete!');
        };


        manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
            console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        };

        manager.onError = function ( url ) {
            console.log( 'There was an error loading ' + url );
        };
        const loader = new GLTFLoader(manager);

        let loading = await Promise.all(paths.map(async (path) => {
            const model = await loader.loadAsync(path);
            this.models.push(model);
          }));
        //let model = await loader.loadAsync('/threeAssets/bamfschildneu.glb');
        //this.models.push(model);
        return loading;
    }


    getModels(){
        return this.models;
    }
}
export {ModelLoader}