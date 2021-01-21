<template>
    <div>
        <div id="container"></div> 
    </div>    
</template>

<script>
"use strict";

import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Curves } from 'three/examples//jsm/curves/CurveExtras.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

import { InformationElement } from './InformationElement.js';

//VARIABLES
let scene, renderer, controls;
let firstLoop = true;

let direction = new THREE.Vector3(0,0,0);
let binormal = new THREE.Vector3();
let normal = new THREE.Vector3();
let position = new THREE.Vector3();
let lookAt = new THREE.Vector3();
let camera, cameraHelper, cameraEye, overviewCamera;
let cameraHelperOn = true;
let lookAhead = true;

let tubeGeometry, mesh, parent, sampleClosedSpline;

let box;

let guiParameters;

export default {
  name: 'Scene',
  methods: {
    getJsonFile (fileName) {
        this.currentJsonFile = require('@/assets/' + fileName + '.json')
    },
    initPath: function() {
        //SPLINE
        sampleClosedSpline = new THREE.CatmullRomCurve3( [
          new THREE.Vector3( -40, 0, -40 ),
          new THREE.Vector3( -40, 0, 40 ),
          new THREE.Vector3( -40, 0, 140 ),
          new THREE.Vector3( 40, 0, 40 ),
          new THREE.Vector3( 40, 0, -40 )]);
        
        sampleClosedSpline.curveType = 'catmullrom';
        //sampleClosedSpline.closed = true;

				if ( mesh !== undefined ) {

					parent.remove( mesh );
					mesh.geometry.dispose();

				}
				const extrudePath = sampleClosedSpline;
				tubeGeometry = new THREE.TubeBufferGeometry( extrudePath, 100, 1, 10, false );

        // 3D shape
        const material = new THREE.MeshPhongMaterial( 
          { color: 0xffffff } );
        const wireframeMaterial = new THREE.MeshBasicMaterial( 
          { color: 0x000000, opacity: 0.3, wireframe: true, transparent: true } );
        
        mesh = new THREE.Mesh( tubeGeometry, material );
				const wireframe = new THREE.Mesh( tubeGeometry, wireframeMaterial );
				mesh.add( wireframe );

        mesh.scale.set(4, 4, 4);
				parent.add( mesh );
    },
    addExtrude: function(){
      tubeGeometry = new THREE.BufferGeometry().setFromPoints( sampleClosedSpline);

      //const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
      this.addGeometry(tubeGeometry);
    },
    animateCamera: function() {
      console.log("animate camera called");
			cameraHelper.visible = cameraHelperOn;
			cameraEye.visible = cameraHelperOn;
    },
    init: function() {
        let container = document.getElementById('container');
        if (firstLoop) {console.log("beginning direction ",direction);}
        //SCENE
        scene = new THREE.Scene();
        scene.background = new THREE.Color('#f43df1');
        scene.background = new THREE.Color(0x2F252D);
        scene.fog = new THREE.FogExp2(scene.background, 0.002);

        overviewCamera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 10000 );
        overviewCamera.position.set( -50, 50, 200 );
        
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.y = 5;
        //camera.lookAt( 0, 0, 0 );

         //LIGHT
        const light = new THREE.AmbientLight( 0x404040 ); // soft white light 
        scene.add( light );

        const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        scene.add( directionalLight );    


        //INFORMATION CUBE 
        const boxGeo = new THREE.BoxBufferGeometry(10,10,10);
        const boxMat = new THREE.MeshPhongMaterial({color:0x00ff00});
        box = new THREE.Mesh(boxGeo,boxMat);
        let info = new InformationElement(scene,box,new THREE.Vector3(-40,0,40));
        info.init()//.then(info.addToScene(scene));
        //scene.add(info);

        // FLOOR
        //same as other geometry
        let planeGeometry = new THREE.PlaneBufferGeometry(1000, 1000);
        let planeMaterial = new THREE.MeshPhongMaterial({ color: 0x261F26, depthWrite: false });
        let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        planeMesh.rotation.x = -Math.PI / 2;
        planeMesh.position.y = 0;
        planeMesh.receiveShadow = true;
        scene.add(planeMesh);

        //PARENT  FOR CAMERA
        parent = new THREE.Object3D();
        scene.add(parent);
        parent.add(camera);
        cameraHelper = new THREE.CameraHelper( camera );
        scene.add( cameraHelper );

        this.initPath();
        //this.addExtrude();
        
        // debug camera
				cameraEye = new THREE.Mesh( new THREE.SphereBufferGeometry( 5 ), new THREE.MeshBasicMaterial( { color: 0xdddddd } ) );
				parent.add( cameraEye );

				cameraHelper.visible = cameraHelperOn;
				cameraEye.visible = cameraHelperOn;
    
        //RENDERER
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        controls = new OrbitControls(overviewCamera, renderer.domElement);

        const gui = new GUI( { width: 300 } );
        // get the default value 
        guiParameters = {
         //material: icosaMaterial.color.getHex(),
          animationView: true
        };

				gui.add(guiParameters,'animationView' ).onChange( function () {

          controls.update();
					//this.animateCamera();

				} );

        window.addEventListener( 'resize', this.onWindowResize, false );

    },
    onWindowResize: function() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			},
    animate: function() {
        requestAnimationFrame(this.animate);
        //this.mesh.rotation.x += 0.01;
        //this.mesh.rotation.y += 0.02;
        controls.update();
        this.render();
        renderer.render( scene, guiParameters.animationView === true ? camera : overviewCamera );
        //renderer.render(scene, camera);
    },
    render: function() {
      // animate camera along spline
        if (firstLoop) {console.log("direction ",direction);}
				const time = Date.now();
				const looptime = 20 * 2000;
				const t = ( time % looptime ) / looptime;
        if (firstLoop) {console.log("tubeGeometry: ",tubeGeometry.parameters);}
				tubeGeometry.parameters.path.getPointAt( t, position );
				position.multiplyScalar( 4);

				// interpolation

				const segments = tubeGeometry.tangents.length;
				const pickt = t * segments;
				const pick = Math.floor( pickt );
        const pickNext = ( pick + 1 ) % segments;

				binormal.subVectors( tubeGeometry.binormals[ pickNext ], tubeGeometry.binormals[ pick ] );
        binormal.multiplyScalar( pickt - pick ).add( tubeGeometry.binormals[ pick ] );
    
        //tangente copied into direction
        if (firstLoop) {console.log("t ",t);}
        tubeGeometry.parameters.path.getTangentAt( t, direction );
        const offset = 15;

        //the bug is somewhere at the tangente, that sets the wrong direction. It works differently if the tube is in 3D
        // so if one Z value is changed.
        
        if (firstLoop) {console.log("binormal ",binormal);}
        if (firstLoop) {console.log("direction ",direction);}

        normal.copy( binormal ).cross(direction);
        //normal.copy(binormal);

				// we move on a offset on its binormal
				position.add( normal.clone().multiplyScalar( offset ) );

				camera.position.copy( position );
				cameraEye.position.copy( position );

				// using arclength for stablization in look ahead

				tubeGeometry.parameters.path.getPointAt( ( t + 30 / tubeGeometry.parameters.path.getLength() ) % 1, lookAt );
				lookAt.multiplyScalar( 4);

				// camera orientation 2 - up orientation via normal
				if ( !lookAhead ){ 
          lookAt.copy( position ).add( direction );
        }
        camera.matrix.lookAt( camera.position, lookAt, normal );
        camera.quaternion.setFromRotationMatrix( camera.matrix,camera.rotation.order );

        if (firstLoop) {
          console.log("end position: ",position);
          firstLoop = false;
        }
      
        //console.log(camera);

				cameraHelper.update();

        //controls.update();
        renderer.render( scene, guiParameters.animationView === true ? camera : overviewCamera );
				//renderer.render( scene, camera );

    }
  },
  mounted() {
      this.init();
      this.animate();
  }
}
</script>

<style scoped>

#container {
  height: 600px;
}
</style>