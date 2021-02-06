"use strict";

import * as THREE from "three";
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader.js';

class PathLoader {
    constructor(){
        this.vertices = [];
    }

    init(){
        return this.loadSvg()
        .then(data => {
            console.log(" I am in the path then", data);
            this.createBorder(data)})
        .catch(err => console.log("Error during Initialization of SVG; ", err));
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
            const loader = new SVGLoader(manager);
            let loadedSvgData = await loader.loadAsync('/threeAssets/border.svg');
            //console.log("I loaded this", svgData);
            return loadedSvgData;
        }

        catch (err){  
            console.error('ERROR: ', err.message);
        }

    }

    createBorder(data){
        const paths = data.paths;
        const group = new THREE.Group();
        console.log("path lenght", paths.length);

		if (paths.length === 1){

			const path = paths[0];

			const material = new THREE.MeshBasicMaterial( {
				color: path.color,
				side: THREE.DoubleSide,
				depthWrite: false
			} );

            const shapes = path.toShapes( true );

            if (shapes.length ===1){
                //create shape of svg points
                const shape = shapes[0];
                const geometry = new THREE.ShapeGeometry( shape );
                console.log(geometry);
                let switchedVertices = [];
                for (let i =0; i < geometry.vertices.length; i=i+2){
                    let v = geometry.vertices[i];
                //geometry.vertices.forEach(v => {
                    v.z = v.y;
                    v.y = 0;
                    v.multiplyScalar(3);
                    switchedVertices.push(v);
                }//)
                geometry.vertices = switchedVertices;

                //set center of vertices to zero with bounding box
                let mesh = new THREE.Mesh(geometry,new THREE.Material());
                mesh.geometry.computeBoundingBox();
                let bb = mesh.geometry.boundingBox;
                mesh.geometry.translate(-bb.max.x/2,0,-bb.max.z/2);
                this.vertices = mesh.geometry.vertices;
                return this.vertices;
            }
            else{
                console.log("shape length is not one");
            }
            //if shapes.length not = 1
			// for ( let j = 0; j < shapes.length; j ++ ) {

			// 	const shape = shapes[ j ];
            //  const geometry = new THREE.ShapeGeometry( shape );
            //  console.log(j, "geometry", geometry);
			// 	const mesh = new THREE.Mesh( geometry, material );
			// 	group.add( mesh );
			// }

        }
        else{
            console.log("path length is not one");
        }
        //console.log("group", group);
		//scene.add( group );
    }

    getVertices(){
        console.log("path vertices", this.vertices);
        return this.vertices;
    }


}    
export {PathLoader}
