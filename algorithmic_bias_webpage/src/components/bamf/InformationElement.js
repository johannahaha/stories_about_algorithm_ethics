"use strict";

import * as THREE from "three";

class InformationElement    {
    constructor(scene,font,position,content = "Das ist eine neue Information über das Bamf",isImage){
        this.scene = scene;
        this.font = font;
        this.position = position;
        this.content = content;
        if (isImage){
            this.imgPath = content;
        }
        this.isImage = isImage;
        console.log(this);

    }

    init(){
        //ADD TEXT
        if(this.isImage){
            console.log("it is an image");
            this.obj = this.setupImage();
        }
        else {            
            console.log("it is not an image");
            this.obj = this.setupText(this.font);
        }

        this.scene.add(this.obj);

        //BOUNDING BOX for clicking
        this.bbox = new THREE.BoxHelper(this.obj, 0xffff00);
        this.bbox.material.visible = false;
        this.scene.add(this.bbox);

    }

    setupText(pLoadedFont){
        let text;
        //this.loadFont().then( pLoadedFont => {
        const color = 0xDAD7DC;
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

    getMeshObject(){
        return this.obj;
    }

    setupImage(){
        console.log("loading image");
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
        const material = new THREE.MeshBasicMaterial({
            map: loader.load(this.imgPath),
          });

        const box = new THREE.BoxGeometry(4,3,0.2);
        box.scale(5,5,5);
        let img = new THREE.Mesh(box, material);

        img.position.x = this.position.x;
        img.position.y = this.position.y;
        img.position.z = this.position.z;

        console.log("img",img);

        return img;

    }

    onClick(){
        
    }


}

export {InformationElement};