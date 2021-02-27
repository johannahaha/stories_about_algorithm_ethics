<template>
    <div>
        <div v-if="!preloading" id="container"></div>
        <div id="instructions">
            <span style="font-size: 36px">Click to play</span>
            <br /><br />
            Look: click and drag your mouse
            Pause: click on pause
            Close Element: click on element;
            <!-- <ul v-for="(info, id) in informations" :key="id">
            <li>{{info.text}}</li>
          </ul> -->
            <p>{{ informations[1].content }}</p>
        </div>
        <button id="pause">pause</button>
        <transition @before-enter="beforeEnterInfo" @enter="enterInfo" @leave="leaveInfo">
            <div class="info" v-if="infoElement2" @click="stopInfo">
                {{ informations[1].content }}
            </div>
        </transition>

        <div id="container"></div>
    </div>
</template>

<script>
"use strict";

//#region imports
import * as THREE from "three";
import {gsap} from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
//import { PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js';
//import { Curves } from 'three/examples//jsm/curves/CurveExtras.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

//MY CLASSES
import { InformationElement } from './InformationElement.js';
import { PathLoader } from './loaders/PathLoader.js';
import {InfoFontLoader} from './loaders/InfoFontLoader.js';
import {ModelLoader} from './loaders/ModelLoader.js';
import {AudioLoader} from './loaders/AudioLoader.js';
import {PlayerControls} from './PlayerControls.js';
import {InformationManager} from './InformationManager.js';
//import {Ground} from './Ground.js'
//#endregion

//#region Variables
//HELPERS
//import {VertexTangentsHelper} from 'three/examples/jsm/helpers/VertexTangentsHelper.js';
//import {VertexNormalsHelper} from 'three/examples/jsm/helpers/VertexNormalsHelper.js';

//VARIABLES
let scene, renderer
let overviewControls, controls;

//follow path
let firstLoop = true;
let direction = new THREE.Vector3(0,0,0);

let frame;

//camera
let camera, cameraHelper, cameraEye, overviewCamera; 
let cameraHelperOn = true;

let helperTubeGeometry;
let pathVertices,path;
let font;
let models;
let audios;
//let ground;

let guiParameters;

let infoManager;
let informationRunning = false;
let informationPhase = false;
//let infoSegments = [12,20,30,40];
//let infoSegmentsDone = [];
//let infoPos = new THREE.Vector3();
// const mouse = new THREE.Vector2();
// const raycaster = new THREE.Raycaster();

// //TODO: resizing
const windowSize = new THREE.Vector2( window.offsetWidth, window.offsetHeight);


//#endregion

export default {
  name: 'Scene',
  props: {
    informations:{
      type: Array
    }
  },
  data: function(){
    return{
      preloading: true,
      infoElement2: false
    }
  },
  methods: {
    //TODO: fix html element gsap
    //#region GSAP transitions
    beforeEnterInfo(el) {
      gsap.set(el, {
        scaleX: 0,
        scaleY: 0,
        opacity: 0
      })
    },
    enterInfo(el,done){
         gsap.to(".info",{
            duration: 1,
            scaleX: 1,
            scaleY: 1,
            opacity:1,
            y: windowSize.y/2,
            x: windowSize.x/4,
            onComplete: done
        })
    },
    stopInfo(){
        if(informationPhase){
            if (this.infoElement2){
                 this.infoElement2 = false;
            }
        console.log("clicked on elem");
        }
    },
    leaveInfo(){
        gsap.to(".info",{
            duration: 1,
            scaleX: 0,
            scaleY: 0,
            opacity: 0,
            onComplete: this.stopInformationPhase,
        })
        infoManager.informationPhase = false;
        infoManager.htmlInformation = false;
    },
     //#endregion

    //#region THREE js
    preLoadPath: function (){
        path = new PathLoader();
        return path.init()
            .then((data) => {
                path.createBorder(data);
                console.log("I am in the scene then");
                pathVertices = path.getVertices();
                console.log(pathVertices);
            })
    },      
    preLoadFont: function (){
      let fontLoad = new InfoFontLoader();
      return fontLoad.init()
        .then((loadedFont) => {
          font = loadedFont;
        })
    },
    preLoadModels: function(){
        let modelLoader = new ModelLoader();
        return modelLoader.init()
        .then((m)  => {
            console.log("model promise",m);
            models = modelLoader.getModels();
            console.log("models saved",models);
        })
    },
    preLoadAudio: function(){
        let audioLoader = new AudioLoader();
        return audioLoader.init()
        .then((res) => {
            console.log("audio promise",res);
            audios = audioLoader.getAudios();
            console.log("audios saved",audios);
        })
    },
    initPath: function(pathVertices,parent) {
        //SPLINE
        let spline = new THREE.CatmullRomCurve3(pathVertices);
        console.log("spline",spline);
        console.log(spline);
        
        spline.curveType = 'catmullrom';
        spline.closed = true;
        console.log("spline here", spline);

        //segments need to be at least spline.length/2 for a smooth followPath
        console.log("calculating segments...");
        let segments = Math.floor(spline.points.length/2);
        console.log("segments",segments);
        
        //TUBE HELPER GEOMETRY
        helperTubeGeometry = new THREE.TubeBufferGeometry( spline, segments, 2, 10, false );
        helperTubeGeometry.computeTangents(); //for helper function
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
        // const material = new THREE.MeshPhongMaterial( 
        //   { color: 0xA64E2E } );
        // const wireframeMaterial = new THREE.MeshBasicMaterial( 
        //   { color: 0x000000, opacity: 0.3, wireframe: true, transparent: true } );
        path.setupShader();
        let mesh = new THREE.Mesh( pathGeometry, path.material );

        //BOX FOR SHADER TESTING
        let geo = new THREE.BoxGeometry();
        let box = new THREE.Mesh(geo, path.material);
        scene.add(box);
        

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
        //scene.background = new THREE.Color('#f43df1');
        //scene.background = new THREE.Color(0x0D0D0D);
        scene.background = new THREE.Color(0xffffff);
        //scene.fog = new THREE.FogExp2(scene.background, 0.002);

        overviewCamera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 100000 );
        overviewCamera.position.set( -50, 50, 200 );
        
        //path following camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.y = 5;
        const listener = new THREE.AudioListener();
        camera.add( listener );

        const light = new THREE.DirectionalLight( 0xffffff, 0.7 );
        light.position.set( 500, 500, 0 ).normalize();
        scene.add( light );

        const light2 = new THREE.DirectionalLight( 0xff5566, 0.4 );
        light2.position.set( -500, -100, 0 ).normalize();
        scene.add( light2 );

        scene.add(new THREE.AmbientLight(0xffffff,0.3))  

        // FLOOR
        //same as other geometry
        // let planeGeometry = new THREE.PlaneBufferGeometry(10000, 20000);
        // let planeMaterial = new THREE.MeshPhongMaterial({ color: 0x262626, depthWrite: false });
        // let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        // planeMesh.rotation.x = -Math.PI / 2;
        // planeMesh.position.y = 0;
        // planeMesh.receiveShadow = true;
        //ground = new Ground();
        //ground.init();
        //scene.add(ground);

        //PARENT  FOR CAMERA
        let parent = new THREE.Object3D();
        scene.add(parent);
        parent.add(camera);
        cameraHelper = new THREE.CameraHelper( camera );
        scene.add( cameraHelper );
        
        // debug camera
		cameraEye = new THREE.Mesh( new THREE.SphereBufferGeometry(5), new THREE.MeshBasicMaterial({color: 0xdddddd }));
		parent.add( cameraEye );

        //INFORMATION ELEMENT 
        console.log("font", font);
        let info = new InformationElement(scene,font,new THREE.Vector3(-40,0,40));
        info.init();

		cameraHelper.visible = cameraHelperOn;
		cameraEye.visible = cameraHelperOn;
    
        //RENDERER
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.getContext().getExtension('OES_standard_derivatives');
        renderer.outputEncoding = THREE.sRGBEncoding
        console.log("extensions",console.log(renderer.getContext().getSupportedExtensions()));

        //SVG path
        this.initPath(pathVertices,parent);

        console.log(models);
        scene.add(models[0].scene);

        container.appendChild(renderer.domElement);
        //windowSize = new THREE.Vector2( renderer.domElement.offsetWidth, renderer.domElement.offsetHeight);

        //CONTROLS
        overviewControls = new OrbitControls(overviewCamera, renderer.domElement);
        
        infoManager = new InformationManager(scene,renderer.domElement,camera,this.informations,font,models,audios,cameraHelper,cameraEye);

        camera.rotation.order = 'YXZ';
        controls = new PlayerControls(camera,renderer.domElement,helperTubeGeometry,cameraEye,cameraHelper);
        let menu = document.querySelector("#instructions");

        menu.addEventListener( 'click', function () {
			controls.enabled = true;
			controls.connect();
			menu.style.display = 'none';
		});

        let pause = document.querySelector("#pause");

        pause.addEventListener('click', function (){
			controls.enabled = false;
			menu.style.display = 'block';
        })

        //GUI
        const gui = new GUI( { width: 300 } );
        guiParameters = {
			animationView: true
        };

		gui.add(guiParameters,'animationView' ).onChange( function () {
			overviewControls.update();
            if(guiParameters.animationView){
                controls.start();
            }
            else{
                controls.stop();
            }
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
    stopInformationPhase: function(){
        controls.start();
        controls.update(true);
        //informationPhase = false;
        informationRunning = false;
        console.log("informationPhase stopped.")
        window.removeEventListener( 'pointerdown',  this.onPointerDownInfo);
    },  
    animateCamera: function() {
        console.log("animate camera called");
        cameraHelper.visible = cameraHelperOn;
        cameraEye.visible = cameraHelperOn;
    },
    animate: function() {
		try{
			frame = requestAnimationFrame(this.animate);
            informationPhase = infoManager.informationPhase;
			if (informationPhase){
				controls.update(false);
				overviewControls.update();

                if(!informationRunning){
                    controls.stop();
                    informationRunning = true;
                    console.log("htmlInfo?",infoManager.htmlInformation);

                    if(infoManager.htmlInformation){
                        console.log("html info registered");
                        this.infoElement2 = true;
                    }
                    console.log("starting InformationPhase, Controls stop")
                }
			}

			else{
				controls.update(true);
                infoManager.update(controls.segment);

                if(informationRunning){
                    this.stopInformationPhase();
                }
				overviewControls.update();
			}
            path.update();
            //ground.update();
			renderer.render( scene, guiParameters.animationView === true ? camera : overviewCamera );
		}
		catch(err){
			cancelAnimationFrame(frame);
			console.log("animation error", err);
		}
    },
    //#endregion
  },  
  mounted() {
      Promise.all([this.preLoadPath(),
      this.preLoadFont(),
      this.preLoadModels(),
      this.preLoadAudio()])
      .then(res => {
        console.log(res);
        this.init();
        this.preloading = true;
      })
      .then(res => {
          console.log("Let's go, animation",res)
          this.animate()
      }) 
      //.catch(alert);
  }
}
</script>

<style scoped>
#container {
    height: 100vh;
    position: relative;
}

#home {
    margin: 0;
}

#instructions {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;

    color: red;
    text-align: center;
    font-family: Arial;
    font-size: 14px;
    line-height: 24px;

    cursor: pointer;
}

#pause {
    background: none;
    margin: 0;
}

.info {
    position: absolute;
    color: #ffffff;
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
    text-align: center;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    z-index: 1;
}
</style>

