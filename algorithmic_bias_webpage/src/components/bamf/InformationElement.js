"use strict";

import * as THREE from "three";

class InformationElement    {
    constructor(scene,font,position,mesh,content = "Das ist eine neue Information über das Bamf"){
        this.scene = scene;
        this.font = font;
        this.position = position;
        this.mesh = mesh;
        this.content = content;

        this.mesh.position.x = position.x;
        this.mesh.position.y = position.y;
        this.mesh.position.z = position.z;
    }

    init(){
        //this.loadFont()
        //.then(font => this.setupText(font))
        //.then(text => {
        //    this.scene.add(text);
        //    this.scene.add(this.mesh);
        //})
        //.catch(err => console.log("Error during Initialization of Information Element; ", err));
        let text = this.setupText(this.font);
        this.text = text;
        this.scene.add(text);
        //this.scene.add(this.mesh);
    }

    // async loadFont() {
    //     try{
    //         const manager = new THREE.LoadingManager();
    //         manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    //             console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    //         };

    //         manager.onLoad = function ( ) {
    //             console.log( 'Loading complete!');
    //         };


    //         manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    //             console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    //         };

    //         manager.onError = function ( url ) {
    //             console.log( 'There was an error loading ' + url );
    //         };
    //         const loader = new THREE.FontLoader(manager);
    //         let loadedFont = await loader.loadAsync('/threeAssets/helvetiker_regular.typeface.json');
    //         return loadedFont;
    //     }
    //     catch (err){  
    //         console.error('ERROR: ', err.message);
    //     }
    // }

    setupText(pLoadedFont){
        let text;
        //this.loadFont().then( pLoadedFont => {
        const color = 0xffffff;
        const matLite = new THREE.MeshBasicMaterial( {
            color: color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        } );

        const shapes = pLoadedFont.generateShapes(this.content, 10);

        const geometry = new THREE.ShapeBufferGeometry( shapes );

        geometry.computeBoundingBox();
        geometry.scale(0.5,0.5,0.5);

        const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

        geometry.translate( xMid, 0, 0 );

        text = new THREE.Mesh( geometry, matLite ); 

        text.position.x = this.position.x;
        text.position.y = this.position.y;
        text.position.z = this.position.z;
        //console.log("returned text:", text);
        return text;
    }

    getText(){
        return this.text;
    }

    onClick(){
        
    }

}

export {InformationElement};