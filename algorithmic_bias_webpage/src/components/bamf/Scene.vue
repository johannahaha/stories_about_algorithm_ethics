<template>
    <div>
        <div v-if="!preloading" id="container"> </div> 
        <div id="instructions">
          <span style="font-size:36px">Click to play</span>
          <br /><br />
          Move: WASD<br/>
          Jump: SPACE<br/>
          Look: MOUSE
        </div>
        <div id="container"></div> 
    </div>    
</template>

<script>
"use strict";

import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import { PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js';
//import { Curves } from 'three/examples//jsm/curves/CurveExtras.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

//MY CLASSES
import { InformationElement } from './InformationElement.js';
import { PathLoader } from './PathLoader.js';
import {InfoFontLoader} from './InfoFontLoader.js';

//HELPERS
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
//import {VertexTangentsHelper} from 'three/examples/jsm/helpers/VertexTangentsHelper.js';
//import {VertexNormalsHelper} from 'three/examples/jsm/helpers/VertexNormalsHelper.js';

//VARIABLES
let scene, renderer
let overviewControls, informationControls;

//follow path
let firstLoop = true;
let direction = new THREE.Vector3(0,0,0);
let binormal = new THREE.Vector3();
let normal = new THREE.Vector3();
let position = new THREE.Vector3();
let lookAt = new THREE.Vector3();
let lookAhead = true;
let frame;

//camera
let camera, cameraHelper, cameraEye, overviewCamera; 
let cameraHelperOn = true;

let helperTubeGeometry;
let pathVertices;
let font;

let box;

let guiParameters;

let informationsPhase = false;
let t = 0;

export default {
  name: 'Scene',
  data: function(){
    return{
      preloading: true
    }
  },
  methods: {
    preLoadPath: function (){
      let path = new PathLoader();
      return path.init()
        .then(() => {
          console.log("I am in the scene then");
          pathVertices = path.getVertices();
          console.log(pathVertices);
          })
        .catch(() => console.log("Error during loading path"));
    },      
    preLoadFont: function (){
      let fontLoad = new InfoFontLoader();
      return fontLoad.init()
        .then((loadedFont) => {
          font = loadedFont;
        })
        .catch(() => console.log("Error during loading font"));
    },
    initPath: function(pathVertices,parent) {
        //SPLINE
        // spline = new THREE.CatmullRomCurve3( [
        //   new THREE.Vector3( -40, 0, -40 ),
        //   new THREE.Vector3( -40, 0, 40 ),
        //   new THREE.Vector3( -40, 0, 140 ),
        //   new THREE.Vector3( 40, 0, 40 ),
        //   new THREE.Vector3( 40, 0, -40 )]);
        let spline = new THREE.CatmullRomCurve3(pathVertices);
        console.log("spline",spline);
        console.log(spline);
        
        spline.curveType = 'catmullrom';
        spline.closed = true;
        console.log("spline here", spline);

				// if ( mesh !== undefined ) {
				// 	parent.remove( mesh );
				// 	mesh.geometry.dispose();
        //   console.log("mesh was disposed");
        // }

        //segments need to be at least spline.length/2 for a smooth followPath
        console.log("calculating segments...");
        let segments = Math.floor(spline.points.length/2);
        console.log("segments",segments);
        
        //TUBE HELPER GEOMETRY
        helperTubeGeometry = new THREE.TubeBufferGeometry( spline, segments, 2, 10, false );
        BufferGeometryUtils.computeTangents(helperTubeGeometry); //for helper function
        console.log("tube geo", helperTubeGeometry);

        //EXTRUDE GEOMETRY
        const extrudeSettings = {
					steps: segments,
					bevelEnabled: false,
					extrudePath: spline
				};

        //detailed settings for extrusion
				const points = [], sides = 3;
				for ( let i = 0; i < sides; i ++ ) {
					const radius = 3;
					const a = 2 * i / sides * Math.PI;
					points.push( new THREE.Vector2( Math.cos( a ) * radius, Math.sin( a ) * radius ) );
				}

				const shape = new THREE.Shape( points );
        let pathGeometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );

        console.log("path geo", pathGeometry);

        //MATERIAL
        const material = new THREE.MeshPhongMaterial( 
          { color: 0xb00000 } );
        // const wireframeMaterial = new THREE.MeshBasicMaterial( 
        //   { color: 0x000000, opacity: 0.3, wireframe: true, transparent: true } );
        
        let mesh = new THREE.Mesh( pathGeometry, material );
        

        mesh.scale.set(4, 4, 4);
        console.log("mesh",mesh);

        //HELPERS
        //let mesh2 = new THREE.Mesh(helperTubeGeometry,new THREE.MeshBasicMaterial({color:0xfff000}));
        //mesh2.scale.set(4,4,4);
        //mesh.add( wireframe );

        //const wireframe = new THREE.Mesh( helperTubeGeometry, wireframeMaterial );

        // BufferGeometryUtils.computeTangents(pathGeometry); //for helper function
        // let helper = new VertexTangentsHelper( mesh, 10, 0x00ffff, 2 );
        // parent.add(helper);

        // let helper2 = new VertexNormalsHelper( mesh, 4, 0xff00ff, 2 );
        // parent.add(helper2);


				parent.add( mesh );
        //parent.add( mesh2 );
    },
    init: function() {
      console.log("I am in the init");
        let container = document.getElementById('container');
        if (firstLoop) {console.log("beginning direction ",direction);}

        //SCENE
        scene = new THREE.Scene();
        scene.background = new THREE.Color('#f43df1');
        scene.background = new THREE.Color(0x2F252D);
        //scene.fog = new THREE.FogExp2(scene.background, 0.002);

        overviewCamera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 100000 );
        overviewCamera.position.set( -50, 50, 200 );
        
        //path following camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.y = 5;

        //camera when an information is seen
        //informationCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        const light = new THREE.DirectionalLight( 0xffffff, 0.7 );
        light.position.set( 1, 1, 0 ).normalize();
        scene.add( light );

        const light2 = new THREE.DirectionalLight( 0xff5566, 0.4 );
        light2.position.set( -3, -1, 0 ).normalize();
        scene.add( light2 );

        scene.add(new THREE.AmbientLight(0xffffff,0.3))     

        // FLOOR
        //same as other geometry
        let planeGeometry = new THREE.PlaneBufferGeometry(10000, 20000);
        let planeMaterial = new THREE.MeshPhongMaterial({ color: 0x261F26, depthWrite: false });
        let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        planeMesh.rotation.x = -Math.PI / 2;
        planeMesh.position.y = 0;
        planeMesh.receiveShadow = true;
        scene.add(planeMesh);

        //PARENT  FOR CAMERA
        let parent = new THREE.Object3D();
        scene.add(parent);
        parent.add(camera);
        cameraHelper = new THREE.CameraHelper( camera );
        scene.add( cameraHelper );
        
        // debug camera
				cameraEye = new THREE.Mesh( new THREE.SphereBufferGeometry( 5 ), new THREE.MeshBasicMaterial( { color: 0xdddddd } ) );
				parent.add( cameraEye );

        //INFORMATION ELEMENT 
        const boxGeo = new THREE.BoxBufferGeometry(10,10,10);
        const boxMat = new THREE.MeshPhongMaterial({color:0x00ff00});
        box = new THREE.Mesh(boxGeo,boxMat);
        console.log("font", font);
        let info = new InformationElement(scene,font,new THREE.Vector3(-40,0,40),box);
        info.init()

        //SVG path
        this.initPath(pathVertices,parent);

				cameraHelper.visible = cameraHelperOn;
				cameraEye.visible = cameraHelperOn;
    
        //RENDERER
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        //CONTROLS
        overviewControls = new OrbitControls(overviewCamera, renderer.domElement);
        
        // informationControls = new FirstPersonControls(camera,renderer.domElement);
        // informationControls.onMouseDown = () => {
        //   t += 0.0005;
        // }

        informationControls = new PointerLockControls(camera,renderer.domElement);
        let menu = document.querySelector("#instructions");

        menu.addEventListener( 'click', function () {

					informationControls.lock();

				} );

        informationControls.addEventListener( 'lock', function () {
          console.log("mouse captured");
          menu.style.display = 'none';

        } );

        informationControls.addEventListener( 'unlock', function () {

          menu.style.display = 'block';

        } );


        //informationControls = new OrbitControls(camera,renderer.domElement);
      // informationControls.enabled = true;
      // informationControls.maxPolarAngle = Math.PI/2;
      // informationControls.minPolarAngle = - Math.PI/2;
      // informationControls.enableZoom = false;
      // informationControls.enablePan = false;
      // informationControls.enableDamping = false;
      // informationControls.enableKeys = false;

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
        console.log("done with init");

    },
    onWindowResize: function() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			},
    followPath: function (isMoving){
        // animate camera along spline
        if (firstLoop) {console.log("direction ",direction);}
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

        if (isMoving){
          //t += 0.00003;
          if (pick == 20){
            this.manageInformation(1);
          }
        }

    },
    manageInformation: function(info){
      informationsPhase = true
      if (info === 1){
          console.log("camera", camera);
          // informationControls.enabled = true;
          // informationControls.enableZoom = false;
          // informationControls.maxAzimuthAngle = Math.PI/2;
          // informationControls.minAzimuthAngle = - Math.PI/2;
          console.log("controls",informationControls);
          //informationControls.maxPolarAngle = Math.PI/2;
          //informationControls.minPolarAngle = - Math.PI/2;
          console.log(position);
          position.add( normal.clone().multiplyScalar(15) );
          let info2 = new InformationElement(scene,font,position,box,"Die zweite Info");
          info2.init();
      }
    },    
    animateCamera: function() {
      console.log("animate camera called");
			cameraHelper.visible = cameraHelperOn;
			cameraEye.visible = cameraHelperOn;
    },
    animate: function() {
        try{
          frame = requestAnimationFrame(this.animate);
          if (informationsPhase){
            informationControls.update();
            overviewControls.update();
            this.followPath(false);
            // informationControls.update();
            // overviewControls.update();
            // camera.matrix.lookAt( camera.position, lookAt, normal );
            //camera.quaternion.setFromRotationMatrix( camera.matrix,camera.rotation.order );
          }
          else{
            //informationControls.update();
            overviewControls.update();
            this.followPath(true);
          }
          renderer.render( scene, guiParameters.animationView === true ? camera : overviewCamera );
        }
        catch(err){
          cancelAnimationFrame(frame);
          console.log("animation error", err);
        }
    },
  },  
  mounted() {
      //TO DO: when there is an error, it is still looping through the other thens
      this.preLoadPath()
      .then(() => this.preLoadFont())
      .then(()=> {
        this.init();
        this.preloading = true;
      })
      .then(()=> console.log("Let's go, animation"))
      .then(()=> this.animate())
      .catch(() => "Error during mounting");
  }
}
</script>

<style scoped>

#container {
  height: 100vh;
}

#home{
    margin: 0;
}

#instructions {
				width: 100vw;
				height: 100vh;

				display: -webkit-box;
				display: -moz-box;
				display: box;

				-webkit-box-orient: horizontal;
				-moz-box-orient: horizontal;
				box-orient: horizontal;

				-webkit-box-pack: center;
				-moz-box-pack: center;
				box-pack: center;

				-webkit-box-align: center;
				-moz-box-align: center;
				box-align: center;

				color: red;
				text-align: center;
				font-family: Arial;
				font-size: 14px;
				line-height: 24px;

				cursor: pointer;
			}
</style>

