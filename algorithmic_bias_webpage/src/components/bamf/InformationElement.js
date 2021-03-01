"use strict";

import * as THREE from "three";

class InformationElement    {
    constructor(scene,font,position,content = "Das ist eine neue Information über das Bamf",isImage,scale=0.5){
        this.scene = scene;
        this.font = font;
        this.position = position;
        this.content = content;
        if (isImage){
            this.imgPath = content;
        }
        this.isImage = isImage;
        this.scale = scale;

    }

    init(){
        //ADD TEXT
        if(this.isImage){
            this.obj = this.setupImage();
        }
        else {            
            this.obj = this.setupText(this.font);
        }

        this.scene.add(this.obj);

        //BOUNDING BOX for clicking
        this.createBBox();

    }

    createBBox(){
        //BOUNDING BOX for clicking
        const box3 = new THREE.Box3().setFromObject(this.obj);

        const dimensions = new THREE.Vector3().subVectors( box3.max, box3.min );
        console.log("dimensions",dimensions)
        if(dimensions.x === 0) dimensions.x=1;
        if(dimensions.y === 0) dimensions.y=1;
        if(dimensions.z === 0) dimensions.z=1;
        const boxGeo = new THREE.BoxBufferGeometry(dimensions.x, dimensions.y, dimensions.z).scale(1.2,1.2,1.2);

        const matrix = new THREE.Matrix4().setPosition(dimensions.addVectors(box3.min, box3.max).multiplyScalar( 0.5 ));
        boxGeo.applyMatrix4(matrix);

        this.bbox = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial( { color: 0xDDDfff,visible:false} ));
        this.scene.add(this.bbox);
    }

    setupText(pLoadedFont){
        let text;
        //this.loadFont().then( pLoadedFont => {
        const color = 0x000000;
        const matLite = new THREE.MeshBasicMaterial( {
            color: color,
            transparent: false,
            opacity: 1,
            side: THREE.DoubleSide
        } );

        const shapes = pLoadedFont.generateShapes(this.content, 10);

        const geometry = new THREE.ShapeBufferGeometry( shapes );

        geometry.computeBoundingBox();
        geometry.scale(this.scale,this.scale,this.scale);

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

    rotate(axis,angle){
        if (axis === "X"){
            this.obj.rotateX(angle);
            //this.bbox.rotateX(angle);
        }
        else if (axis === "Y"){
            this.obj.rotateY(angle);
        }
        else if (axis === "Z"){
            this.obj.rotateZ(angle);
        }
        this.createBBox();
    }


}

export {InformationElement};