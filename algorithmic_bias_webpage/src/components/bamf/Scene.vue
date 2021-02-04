<template>
    <div>
        <div v-if="!preloading" id="container"> </div> 
        <div v-else> loading .....</div>
        <div id="container"></div> 
    </div>    
</template>

<script>
"use strict";

import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Curves } from 'three/examples//jsm/curves/CurveExtras.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

//MY CLASSES
import { InformationElement } from './InformationElement.js';
import { PathLoader } from './PathLoader.js';

//HELPER
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {VertexTangentsHelper} from 'three/examples/jsm/helpers/VertexTangentsHelper.js';
import {VertexNormalsHelper} from 'three/examples/jsm/helpers/VertexNormalsHelper.js';

//VARIABLES
let scene, renderer
let overviewControls, informationControls;
let firstLoop = true;

let direction = new THREE.Vector3(0,0,0);
let binormal = new THREE.Vector3();
let normal = new THREE.Vector3();
let position = new THREE.Vector3();
let lookAt = new THREE.Vector3();
let camera, cameraHelper, cameraEye, overviewCamera, informationCamera;
let cameraHelperOn = true;
let lookAhead = true;
let frame;

let helperTubeGeometry, pathGeometry, mesh, parent, spline;
let pathVertices;

let box;

let guiParameters;

let informationsPhase = false;

export default {
  name: 'Scene',
  data: function(){
    return{
      preloading: false
    }
  },
  methods: {
    preLoadData: function (){
      let path = new PathLoader();
      return path.init()
        .then((res) => {
            console.log("I am in the scene then");
            pathVertices = path.getVertices();
            console.log(pathVertices);
            })
        .catch(() => console.log("Error initializung Path Cooridnates"));
    },
    initPath: function(pathVertices) {
        //SPLINE
        // spline = new THREE.CatmullRomCurve3( [
        //   new THREE.Vector3( -40, 0, -40 ),
        //   new THREE.Vector3( -40, 0, 40 ),
        //   new THREE.Vector3( -40, 0, 140 ),
        //   new THREE.Vector3( 40, 0, 40 ),
        //   new THREE.Vector3( 40, 0, -40 )]);
        spline = [];
        console.log("path",pathVertices);
        pathVertices.forEach(v => {
            spline.push(v);
        });
        console.log(spline);
        //spline = pathCoordinates
        
        spline.curveType = 'catmullrom';
        spline.closed = true;
        console.log("spline", spline);

				if ( mesh !== undefined ) {
					parent.remove( mesh );
					mesh.geometry.dispose();
        }
        
        //TUBE GEOMETRY
				const extrudePath = spline;
        helperTubeGeometry = new THREE.TubeBufferGeometry( extrudePath, 50, 2, 10, false );
        BufferGeometryUtils.computeTangents(helperTubeGeometry); //for helper function
        console.log("tube geo", helperTubeGeometry);

        //EXTRUDE GEOMETRY
        const extrudeSettings = {
					steps: 100,
					bevelEnabled: false,
					extrudePath: spline
				};

        //
				const points = [], sides = 3;
				for ( let i = 0; i < sides; i ++ ) {
					const radius = 3;
					const a = 2 * i / sides * Math.PI;
					points.push( new THREE.Vector2( Math.cos( a ) * radius, Math.sin( a ) * radius ) );
				}

				const shape = new THREE.Shape( points );
        pathGeometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
        //BufferGeometryUtils.computeTangents(pathGeometry); //for helper function
        console.log(pathGeometry);

        //MATERIAL
        const material = new THREE.MeshPhongMaterial( 
          { color: 0xb00000 } );
        const wireframeMaterial = new THREE.MeshBasicMaterial( 
          { color: 0x000000, opacity: 0.3, wireframe: true, transparent: true } );
        
        mesh = new THREE.Mesh( pathGeometry, material );
				//const wireframe = new THREE.Mesh( helperTubeGeometry, wireframeMaterial );
        //mesh.add( wireframe );

        mesh.scale.set(4, 4, 4);
        console.log("mesh",mesh);

        //HELPERS
        // let helper = new VertexTangentsHelper( mesh, 10, 0x00ffff, 2 );
        // parent.add(helper);

        // let helper2 = new VertexNormalsHelper( mesh, 4, 0xff00ff, 2 );
        // parent.add(helper2);


				parent.add( mesh );
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
        
        //path following camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.y = 5;

        //camera when an information is seen
        informationCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        const light = new THREE.DirectionalLight( 0xffffff, 0.7 );
        light.position.set( 1, 1, 0 ).normalize();
        scene.add( light );

        const light2 = new THREE.DirectionalLight( 0xff5566, 0.4 );
        light2.position.set( -3, -1, 0 ).normalize();
        scene.add( light2 );

        scene.add(new THREE.AmbientLight(0xffffff,0.3))     

        //SVG path
        this.initPath(pathVertices);

        //INFORMATION ELEMENT 
        const boxGeo = new THREE.BoxBufferGeometry(10,10,10);
        const boxMat = new THREE.MeshPhongMaterial({color:0x00ff00});
        box = new THREE.Mesh(boxGeo,boxMat);
        let info = new InformationElement(scene,new THREE.Vector3(-40,0,40),box);
        info.init()

        // FLOOR
        //same as other geometry
        let planeGeometry = new THREE.PlaneBufferGeometry(10000, 10000);
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
        
        // debug camera
				cameraEye = new THREE.Mesh( new THREE.SphereBufferGeometry( 5 ), new THREE.MeshBasicMaterial( { color: 0xdddddd } ) );
				parent.add( cameraEye );

				cameraHelper.visible = cameraHelperOn;
				cameraEye.visible = cameraHelperOn;
    
        //RENDERER
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        //CONTROLS
        overviewControls = new OrbitControls(overviewCamera, renderer.domElement);
        informationControls = new OrbitControls(camera,renderer.domElement);

        //GUI
        const gui = new GUI( { width: 300 } );
        guiParameters = {
          animationView: true
        };

				gui.add(guiParameters,'animationView' ).onChange( function () {

          overviewControls.update();
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
        try{
          frame = requestAnimationFrame(this.animate);
          //this.render();
          if (informationsPhase){
            informationControls.update();
            renderer.render( scene, guiParameters.animationView === true ? camera : overviewCamera );
          }
          else{
            this.followPath();
            overviewControls.update();
            renderer.render( scene, guiParameters.animationView === true ? camera : overviewCamera );
            if (position.z >= 500.0){
              informationsPhase = true;
              let info2 = new InformationElement(scene,position,box,"Die zweite Info");
              info2.init();
            }
          }
        }
        catch(err){
          cancelAnimationFrame(frame);
          console.log("animation error", err);
        }
        //renderer.render( scene, guiParameters.animationView === true ? camera : overviewCamera );
    },
    render: function() {
        console.log("old render function");
        //controls.update();
        //renderer.render( scene, guiParameters.animationView === true ? camera : overviewCamera );
				//renderer.render( scene, camera );

    },
    followPath: function (){
        // animate camera along spline
        //if (firstLoop) {console.log("direction ",direction);}
        const time = Date.now();
        //if (firstLoop) {console.log("time: ",time);}
        const looptime = 20 * 2000;
        const t = ( time % looptime ) / looptime;
        //if (firstLoop) {console.log("t: ",t);}
        //if (firstLoop) {console.log("helperTubeGeometry: ",helperTubeGeometry.parameters);}
        helperTubeGeometry.parameters.path.getPointAt( t, position );
        position.multiplyScalar( 4);

        // interpolation

        const segments = helperTubeGeometry.tangents.length;
        //if (firstLoop) {console.log("tangenten: ",helperTubeGeometry.tangents);}
        const pickt = t * segments;
        const pick = Math.floor( pickt );
        //if (firstLoop) {console.log("pick: ",pick);}
        const pickNext = ( pick + 1 ) % segments;

        //if (firstLoop) {console.log("binormals: ",helperTubeGeometry.binormals);}
        binormal.subVectors( helperTubeGeometry.binormals[ pickNext ], helperTubeGeometry.binormals[ pick ] );
        binormal.multiplyScalar( pickt - pick ).add( helperTubeGeometry.binormals[ pick ] );

        //tangente copied into direction
        //if (firstLoop) {console.log("t ",t);}
        helperTubeGeometry.parameters.path.getTangentAt( t, direction );
        const offset = 15;

        //the bug is somewhere at the tangente, that sets the wrong direction. It works differently if the tube is in 3D
        // so if one Z value is changed.

        //if (firstLoop) {console.log("binormal ",binormal);}
        //if (firstLoop) {console.log("direction ",direction);}

        //normal.copy( binormal ).cross(direction);

        //if the spine is not 3d (on one y level), this is always the normal.
        normal.x = 0;
        normal.y = 1;
        normal.z = 0;
        //normal.copy(binormal);

        // we move on a offset on its binormal
        position.add( normal.clone().multiplyScalar( offset ) );

        camera.position.copy( position );
        cameraEye.position.copy( position );

        // using arclength for stablization in look ahead

        helperTubeGeometry.parameters.path.getPointAt( ( t + 30 / helperTubeGeometry.parameters.path.getLength() ) % 1, lookAt );
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
    }
  },
  mounted() {
      this.preLoadData()
      .then(()=> {
        this.init();
        this.preloading = true;
      })
      .then(()=> console.log("Let's go, animation"))
      .then(()=> this.animate());
  }
}
</script>

<style scoped>

#container {
  height: 600px;
}
</style>