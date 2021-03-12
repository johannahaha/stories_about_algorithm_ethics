"use strict";

import * as THREE from "three";

class TextureLoader{
    constructor(){
        this.textures = [];
    }
    
    async init(){
        let paths = ['/img/bamf_training_p50.png','/img/bamf_training_p50_result.png','/img/map_arabian_dialects.png'];

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

        const loader = new THREE.TextureLoader(manager);

        let loading = await Promise.all(paths.map(async (path) => {
            await loader.loadAsync(path).then((texture) => {
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                });
                this.textures.push(material);
            })
        }));

        return loading;
    }

    getTextures(){
        return this.textures;
    }
}

export{TextureLoader}