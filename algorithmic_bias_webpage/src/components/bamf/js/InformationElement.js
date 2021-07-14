"use strict";

import * as THREE from "three";
//import {PositionalAudioHelper} from "three/examples/jsm/helpers/PositionalAudioHelper.js";

class InformationElement    {
    constructor(scene,font,position,content = "Das ist eine neue Information über das Bamf",isImage,scale=0.5,audio){
        this.scene = scene;
        this.font = font;
        this.position = position;
        this.content = content;
        if (isImage){
            this.imgPath = content;
        }
        this.isImage = isImage;
        this.scale = scale;
        this.audio = audio;
    }

    init(){
        //add object
        if(this.isImage){
            //right now, no information element is an image. but this might be useful for later
            this.obj = this.setupImage();
        }
        else {            
            this.obj = this.setupText(this.font);
        }

        if (this.audio != undefined){
            //const sound = new THREE.PositionalAudio(this.scene.getObjectByName("listener"));
            //sound.setBuffer(this.audio);
            // if (this.audio.isPlaying){
            //     this.audio.stop();
            // }
            // this.audio.setRefDistance(30);
            // this.audio.setRolloffFactor(0.25);
            // this.audio.setVolume(2.0);
            // this.audio.setMaxDistance(60);

            // this.obj.add(this.audio);
            //this.audio.play();

        }
        this.scene.add(this.obj);

        //BOUNDING BOX for clicking
        this.createBBox(0xffDDDD);

    }

    //Create invisible bounding box, that can be used for the Raycaster
    createBBox(color){

        if (this.bbox !== undefined){
            this.scene.remove(this.bbox);
            this.bbox.geometry.dispose();
            this.bbox.material.dispose();
            this.bbox = undefined;
        }

        const box3 = new THREE.Box3().setFromObject(this.obj);

        const dimensions = new THREE.Vector3().subVectors( box3.max, box3.min );
        if(dimensions.x === 0) dimensions.x=1;
        if(dimensions.y === 0) dimensions.y=1;
        if(dimensions.z === 0) dimensions.z=1;

        const boxGeo = new THREE.BoxBufferGeometry(dimensions.x, dimensions.y, dimensions.z).scale(1.1,1.1,1.1);

        this.bbox = new THREE.Mesh(boxGeo, new THREE.MeshPhongMaterial( {color: color,visible:false,wireframe:true,wireframeLinewidth: 5} ));

        //move to center of object
        this.bbox.position.copy(dimensions.addVectors(box3.min, box3.max).multiplyScalar( 0.5 ))
        
        this.scene.add(this.bbox);
    }

    //create the text and add it to scene
    setupText(pLoadedFont){
        let text;

        const color = 0x9CBBCE;
        const matLite = new THREE.MeshPhongMaterial( {
            color: color,
            side: THREE.DoubleSide
        } );

        const shapes = pLoadedFont.generateShapes(this.content, 10);

        const geometry = new THREE.ShapeBufferGeometry( shapes );

        geometry.scale(this.scale,this.scale,this.scale);
        geometry.computeBoundingBox();

        //translate 0.5 in x and y direction
        const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
        const yMid = 0.5 * ( geometry.boundingBox.max.y - geometry.boundingBox.min.y );

        geometry.translate(xMid,yMid,0);

        text = new THREE.Mesh( geometry, matLite ); 

        text.position.x += this.position.x;
        text.position.y += this.position.y;
        text.position.z += this.position.z;

        return text;
    }

    getMeshObject(){
        return this.obj;
    }

    //create image and add it to scene
    //right now, no information element is an image. but this might be useful for later
    setupImage(){
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

        return img;

    }

    //rotate info element with angle around axis
    rotate(axis,angle){
        if (axis === "X"){
            this.obj.rotateX(angle);
            this.bbox.rotateX(angle);
        }
        else if (axis === "Y"){
            this.obj.rotateY(angle);
            this.bbox.rotateY(angle);
        }
        else if (axis === "Z"){
            this.obj.rotateZ(angle);
            this.bbox.rotateZ(angle);
        }
    }

    //translate element with vector
    translate(vec){
        this.obj.geometry.translate(vec.x,vec.y,vec.z);
        this.bbox.geometry.translate(vec.x,vec.y,vec.z);
    }


}

export {InformationElement};