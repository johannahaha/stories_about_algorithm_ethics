"use strict";

import * as THREE from "three";

class InformationElement    {
    constructor(mesh,position,fontJson,content = "Das ist eine neue Information über das Bamf"){
        this.mesh = mesh;
        this.position = position;
        this.fontJson = fontJson;
        this.content = content;

        this.mesh.position.x = position.x;
        this.mesh.position.y = position.y;
        this.mesh.position.z = position.z;
        
        let text = this.setupFont();
        console.log("constructor text");
        this.text = text;

    }

    addToScene(scene){
        //this.text.position.x = this.mesh.position.x;
        //this.text.position.y = this.mesh.position.y;
        //this.text.position.z = this.mesh.position.z; 
        scene.add(this.mesh);
        scene.add(this.text);
    }

    async loadFont() {
        //let loaded Font = await 

    }
    setupFont(){
        let text;
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

        //load fonts
        const loader = new THREE.FontLoader(manager);
        let loadedFont;
        console.log("lets load the font");
		loader.load( '/threeAssets/helvetiker_regular.typeface.json',
        //loader.load(this.fontJson, 
            //onLoad callback
            function ( font ) {
                console.log("loading font...");
                //loadedFont = font;
            },
            
            // onProgress callback
            function ( xhr ) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            
            // onError callback
            function ( err ) {
                console.log( 'An error happened' );
        });
        const color = 0xffffff;
        const matLite = new THREE.MeshBasicMaterial( {
            color: color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        } );
        const message = "Das ist eine neue Information über das Bamf";
        console.log("font",loadedFont);

        const shapes = loadedFont.generateShapes( message, 1000 );
        console.log("shapes",shapes);

        const geometry = new THREE.ShapeBufferGeometry( shapes );

        geometry.computeBoundingBox();

        const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

        geometry.translate( xMid, 0, 0 );

        text = new THREE.Mesh( geometry, matLite ); 
        console.log("text created", text);

        console.log("returned text:", text);
        return text;
            
    }

}

export {InformationElement};