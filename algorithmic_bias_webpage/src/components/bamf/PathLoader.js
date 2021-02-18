"use strict";

import * as THREE from "three";
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader.js';
import {GlowingShader} from "./shaders/GlowingShader.js";
//import {OuterGlowShader} from "./shaders/OuterGlowShader.js";

class PathLoader {
    constructor(){
        this.vertices = [];
    }

    async init(){
        return await this.loadSvg();

    }

    async loadSvg(){
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

                //create mesh for translating and adjusting vertices
                let mesh = new THREE.Mesh(geometry,new THREE.Material());
                
                let positionAttribute = mesh.geometry.getAttribute( 'position' );
                console.log("pos attribute",positionAttribute);

                let localVertex = new THREE.Vector3();

                for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex ++ ) {
                    localVertex.fromBufferAttribute( positionAttribute, vertexIndex ).multiplyScalar(3);
                    switchedVertices.push(localVertex.x);
                    switchedVertices.push(0);
                    switchedVertices.push(localVertex.y);

                    normals.push(0);
                    normals.push(1);
                    normals.push(0);

                }

                mesh.geometry.setAttribute("position",new THREE.Float32BufferAttribute( switchedVertices, 3 ))
                mesh.geometry.setAttribute("normal", THREE.Float32BufferAttribute( normals, 3 ))

                console.log(mesh.geometry);


                //set center of vertices to zero with bounding box
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

    setupShader(){
        let shader = GlowingShader;
        //let shader = OuterGlowShader;
        let uniforms =  {
            "transparent_color":{
                value: {
                    r: 0,
                    g: 0.8,
                    b: 1 },
                type: "c",
                glsltype: "vec3"
            },
            "start": {
              value: 0.0,
              type: "f",
              glslType: "float"
            },
            "end": {
              value: 1.0,
              type: "f",
              glsltype: "float"
            },
            "alpha": {
              value: 1.0,
              type: "f",
              glsltype: "float"
            },
            "time": {
              type: "f",
              glsltype: "float"
            },
            "phaseSpeed": {
              value: 10,
              type: "f",
              glsltype: "float"
            },
            "thickness": {
              value: 1.20528104,
              type: "f",
              glsltype: "float"
            },
            "contrast": {
              value: 19.0752604,
              type: "f",
              glsltype: "float"
            },
            "electricitySpeed": {
              value: 0.27169517,
              type: "f",
              glsltype: "float"
            },
            "flashSpeed": {
              value: 0.0,
              type: "f",
              glsltype: "float"
            },
            "turbulence": {
              value: 2.6210239,
              type: "f",
              glsltype: "float"
            },
            "waverSpeed": {
              value: 0.47451395,
              type: "f",
              glsltype: "float"
            },
            "electric_color": {
              value: {
                r: 1.0,
                g: 1.0,
                b: 1.0
              },
              type: "c",
              glsltype: "vec3"
            }
        } 

        // this.material = new THREE.MeshNormalMaterial();
	
        // this.material.onBeforeCompile = function ( shader ) {
        //     console.log( shader )
        //     shader.uniforms = uniforms,
        //     shader.vertexShader = glowShader.vertexShader;
        //     shader.fragmentShader = glowShader.fragmentShade;
            
        //     this.materialShader = shader;
        // };
        
        // this.material.extensions = {
        //     derivatives: true
        // };

        this.material = new THREE.RawShaderMaterial({
            extensions: {derivatives: true},
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
        })

    }
    getVertices(){
        console.log("path vertices", this.vertices);
        return this.vertices;
    }


}    
export {PathLoader}
