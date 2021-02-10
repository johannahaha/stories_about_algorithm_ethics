"use strict";

import * as THREE from "three";

class InfoFontLoader {
    constructor(){
        this.loadedFont;
    }

    init(){
        return this.loadSvg();
    }

    async loadSvg(){
        try{
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
            const loader = new THREE.FontLoader(manager);
            this.loadedFont = await loader.loadAsync('/threeAssets/helvetiker_regular.typeface.json');
            return this.loadedFont;
        }
        catch (err){  
            console.error('ERROR: ', err.message);
        }
    }
}

export {InfoFontLoader};
