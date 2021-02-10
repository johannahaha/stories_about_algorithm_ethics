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
        //const group = new THREE.Group();
        console.log("path lenght", paths.length);

		if (paths.length === 1){

			const path = paths[0];

			// const material = new THREE.MeshBasicMaterial( {
			// 	color: path.color,
			// 	side: THREE.DoubleSide,
			// 	depthWrite: false
			// } );

            const shapes = path.toShapes( true );

            if (shapes.length ===1){
                //create shape of svg points
                const shape = shapes[0];
                const geometry = new THREE.ShapeGeometry( shape );
                console.log(geometry);
                let switchedVertices = [];
                let normals = [];

                let mesh = new THREE.Mesh(geometry,new THREE.Material());
                
                let positionAttribute = mesh.geometry.getAttribute( 'position' );
                console.log("pos attribute",positionAttribute);

                let localVertex = new THREE.Vector3();
                //const globalVertex = new THREE.Vector3();

                for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex ++ ) {
                    localVertex.fromBufferAttribute( positionAttribute, vertexIndex );
                    switchedVertices.push(localVertex.x);
                    switchedVertices.push(0);
                    switchedVertices.push(localVertex.y);

                    normals.push(0);
                    normals.push(1);
                    normals.push(0);
                    //console.log(vertexIndex,localVertex);
                    //localVertex.setZ(localVertex.getY(vertexIndex));
                    //localVertex.setY(0);

                    //globalVertex.copy( localVertex ).applyMatrix4( mesh.matrixWorld );
                    //globalVertex.multiplyScalar(3);
                    //switchedVertices.push(localVertex);
                }
                //mesh.geometry.setAttribute("position",switchedVertices);
                mesh.geometry.setAttribute("position",new THREE.Float32BufferAttribute( switchedVertices, 3 ))
                mesh.geometry.setAttribute("normal", THREE.Float32BufferAttribute( normals, 3 ))
                //mesh.geometry.setAttribute("normal",normals);
                //mesh.geometry.computeVertexNormals();
                console.log(mesh.geometry);
                // for (let i =0; i < geometry.vertices.length; i=i+2){
                //     let v = geometry.vertices[i];
                // //geometry.vertices.forEach(v => {
                //     v.z = v.y;
                //     v.y = 0;
                //     v.multiplyScalar(3);
                //     switchedVertices.push(v);
                // }//)
                // geometry.vertices = switchedVertices;

                //set center of vertices to zero with bounding box
                //let mesh = new THREE.Mesh(geometry,new THREE.Material());
                mesh.geometry.computeBoundingBox();
                let bb = mesh.geometry.boundingBox;
                console.log("bb",bb);
                mesh.geometry.translate(-bb.max.x/2,0,-bb.max.z/2);

                //transform this bufferGeoMesh to array of vectors
                positionAttribute = mesh.geometry.getAttribute( 'position' );
                for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex ++ ) {
                    let v = localVertex.fromBufferAttribute( positionAttribute, vertexIndex )
                    this.vertices.push(new THREE.Vector3(v.x,v.y,v.z));
                }    
                //this.vertices = mesh.geometry.vertices;
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
