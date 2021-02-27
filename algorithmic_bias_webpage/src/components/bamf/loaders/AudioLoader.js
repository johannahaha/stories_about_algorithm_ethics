"use strict";

import * as THREE from "three";

class AudioLoader{
    constructor(){
        this.audios = [];
    }

    async init(){
        let paths = ['/sound/irish.wav'];

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

        const loader = new THREE.AudioLoader(manager);

        let loading = await Promise.all(paths.map(async (path) => {
            const audio = await loader.loadAsync(path);
            this.audios.push(audio);
          }));

        return loading;
    }

    getAudios(){
        return this.audios;
    }
}

export {AudioLoader};