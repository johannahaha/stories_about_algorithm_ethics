<template>
    <div class="bamf">
        <div v-if="!preloading" id="container"></div>
        <div id="instructions" v-if="!isGerman">
            <span>Click to Explore</span>
            <ul>
                <li>
                    Pause: Click on the Pause Button
                </li>
                <li>
                    Look Around: Click and Drag your mouse
                </li>
                <li>
                    Keep Following Path: Click on Text
                </li>
            </ul>
        </div>
        <div id="instructions" v-if="isGerman">
            <span>Klicke, um fortzusetzen.</span>
            <ul>
                <li>
                    Pause: Klicke auf den Pause-Knopf
                </li>
                <li>
                    Umschauen: Klicke und Ziehe mit deiner Maus
                </li>
                <li>
                    Folge dem Pfad weiter: Klicke auf den Text
                </li>
            </ul>
        </div>
        <button id="pause">pause</button>
        <Information 
        v-bind="htmlProps"
        :informations="informations"
        :windowSize="windowSize"
        :isGerman="isGerman"
        @click="htmlProps.infoElement = false"
        @information-closed="stopInformationPhase"> </Information>
        <div id="container"></div>
    </div>
</template>

<script>
"use strict";

//#region imports
import Information from './Information.vue';

import * as THREE from "three";

//MY CLASSES
//import { InformationElement } from './InformationElement.js';
import { PathLoader } from './loaders/PathLoader.js';
import {InfoFontLoader} from './loaders/InfoFontLoader.js';
import {ModelLoader} from './loaders/ModelLoader.js';
import {AudioLoader} from './loaders/AudioLoader.js';
import {TextureLoader} from './loaders/TextureLoader.js';
import {PlayerControls} from './PlayerControls.js';
import {InformationManager} from './InformationManager.js';
//import {Ground} from './Ground.js'
//#endregion


//VARIABLES
let scene, renderer
let controls;


let frame;

//camera
let camera, cameraHelper, cameraEye;
//let cameraHelperOn = true; 

let helperTubeGeometry;
let pathVertices,path;
let font;
let models;
let audios;
let textures;
//let ground

let infoManager;
let informationRunning = false;
let informationPhase = false;

// //TODO: resizin


//#endregion

export default {
    components: { Information },
  name: 'Scene',
  props: {
    isGerman: {
        type: Boolean
    },
    informations:{
      type: Array
    }
  },
  data: function(){
    return{
      preloading: true,
      htmlProps: {
        infoElement: false,
        infoId: 0,
        scale: 1,
        x:0,
        y:0
      },
      windowSize: new THREE.Vector2(0,0)
    }
  },
  methods: {
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
    preLoadTextures: function(){
        let textureLoader = new TextureLoader();
        return textureLoader.init()
        .then(()=>{
            textures = textureLoader.getTextures();
        })
    },
    initPath: function(pathVertices,parent) {
        //SPLINE
        let spline = new THREE.CatmullRomCurve3(pathVertices);
        spline.curveType = 'catmullrom';
        spline.closed = true;

        //segments need to be at least spline.length/2 for a smooth followPath
        let segments = Math.floor(spline.points.length);
        
        //TUBE HELPER GEOMETRY
        helperTubeGeometry = new THREE.TubeBufferGeometry( spline, segments, 2, 10, false );
        helperTubeGeometry.computeTangents(); //for helper function

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

        path.setupShader(); //this should later include the shaderMaterial, right now it is just a normal material
        let mesh = new THREE.Mesh( pathGeometry, path.material );
        mesh.scale.set(4, 4, 4);
		parent.add( mesh );

    },
    init: function() {
        let container = document.getElementById('container');

        //SCENE
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x05181D);
        scene.fog = new THREE.FogExp2(scene.background, 0.002);

        // overviewCamera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 100000 );
        // overviewCamera.position.set( -50, 50, 200 );
        
        //path following camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.y = 5;
        const listener = new THREE.AudioListener();
        camera.add( listener ); //stored as camera.children

        //LIGHT
        const light = new THREE.DirectionalLight( 0xDFEDF2, 0.7 );
        light.position.set( 500, 500, 0 ).normalize();
        scene.add( light );

        const light2 = new THREE.DirectionalLight( 0x082126, 0.4 );
        light2.position.set( -500, -100, 0 ).normalize();
        scene.add( light2 );

        scene.add(new THREE.AmbientLight(0xDFEDF2,0.3))  

        //PARENT  FOR CAMERA
        let parent = new THREE.Object3D();
        scene.add(parent);
        parent.add(camera);
        cameraHelper = new THREE.CameraHelper( camera );
        scene.add( cameraHelper );
		cameraEye = new THREE.Mesh( new THREE.SphereBufferGeometry(5), new THREE.MeshBasicMaterial({color: 0xdddddd }));
		parent.add( cameraEye );
		cameraHelper.visible = false;
		cameraEye.visible = false;
    
        //RENDERER
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.getContext().getExtension('OES_standard_derivatives');
        renderer.outputEncoding = THREE.sRGBEncoding
        container.appendChild(renderer.domElement);

        //SVG path
        this.initPath(pathVertices,parent);

        //CONTROLS
        camera.rotation.order = 'YXZ';
        controls = new PlayerControls(parent,camera,renderer.domElement,helperTubeGeometry,cameraEye,cameraHelper);

        //INFOMANAGER
        infoManager = new InformationManager(scene,renderer.domElement,camera,controls,this.informations,font,models,audios,textures,this.isGerman,cameraHelper,cameraEye);

        //INSTRUCTIONS HTML
        let menu = document.querySelector("#instructions");

        menu.addEventListener( 'click', function () {
			controls.enabled = true;
			controls.connect();
			menu.style.display = 'none';
		});

        let pause = document.querySelector("#pause");

        pause.addEventListener('click', function (){
			controls.enabled = false;
			menu.style.display = 'flex';
        })

        this.windowSize = new THREE.Vector2( renderer.domElement.offsetWidth, renderer.domElement.offsetHeight);
        window.addEventListener( 'resize', this.onWindowResize, false );
        window.addEventListener('endPath',this.endingPath);

    },
    onWindowResize: function() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

        this.windowSize = new THREE.Vector2( renderer.domElement.offsetWidth, renderer.domElement.offsetHeight);

	},
    endingPath: function(){
        this.$emit("ending-path");
    },
    stopInformationPhase: function(){
        controls.startFollow(infoManager.infoFollowPath);
        controls.update(true);
        informationRunning = false;
        if(infoManager.htmlInformation){
            this.htmlProps.infoElement = false;
            infoManager.informationPhase = false;
            infoManager.htmlInformation = false;
        }
        this.scale = 1;
        window.removeEventListener( 'pointerdown',  infoManager.onPointerDownInfo);
    },  
    animateCamera: function() {
        scene.fog = new THREE.FogExp2(scene.background, 0);
        cameraHelper.visible = true;
        cameraEye.visible = true;
    },
    animate: function() {
		try{
			frame = requestAnimationFrame(this.animate);
            informationPhase = infoManager.informationPhase;
			if (informationPhase){
				controls.update(false);

                if(!informationRunning){
                    controls.stopFollow(infoManager.infoFollowPath);
                    informationRunning = true;

                    if(infoManager.htmlInformation){
                        this.htmlProps.infoId = infoManager.htmlInfoId;
                        this.htmlProps.scale = infoManager.htmlScale;
                        this.htmlProps.x = infoManager.htmlPosition.x;
                        this.htmlProps.y = infoManager.htmlPosition.y;
                        console.log("html info registered",this.htmlProps);
                        this.htmlProps.infoElement = true;

                        if(infoManager.infoFollowPath){
                            //Faking , that there is no information on the screen
                            //so that it keeps following the path
                            //handling of the info happens in Manager
                            informationPhase = false;
                            infoManager.informationPhase = false;
                            infoManager.htmlInformation = false;
                            informationRunning = false;
                        }
                    }
                    //console.log("starting InformationPhase, Controls stop")
                }
			}

			else{
                if(informationRunning){
                    this.stopInformationPhase();
                }
				controls.update(true);
                infoManager.update(controls.segment);
			}
            path.update();
            //ground.update();
            renderer.render(scene,camera);
			//renderer.render( scene, guiParameters.animationView === true ? camera : overviewCamera );
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
      this.preLoadAudio(),
      this.preLoadTextures()])
      .then(res => {
        console.log(res);
        this.init();
        this.preloading = true;
        console.log("window",this.windowSize);
      })
      .then(res => {
          console.log("Let's go, animation",res)
          this.animate()
      }) 
      //.catch(alert);
  }
}
</script>

<style scoped lang="scss">

@import "@/assets/_config.scss";

.bamf{
    min-height: 100%; 
    height: 100vh;
    overflow: hidden;
    margin: 0 auto;
    left: 0;
    top: 0;
    position:relative;

    #instructions {
        margin: 0 auto;
        width: 50vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background: $dark;
        color: $lightmiddle;
        text-align: center;
        font-family: Arial;
        font-size: 14px;
        line-height: 24px;

        cursor: pointer;

        span{
            text-align: left;
            margin-bottom: 1rem;
            font-size:1.8rem;
            font-weight: 600;
        }

        ul{
            list-style: none;
            text-align: left;
            margin-left: 0;
            padding-left: 0;

            li{
                font-size: 1.2rem;
                padding: 1rem;
            }
        }
    }

    #pause {
        @include buttonStyle;
        margin: 0.25rem;
        padding: 0.5rem;
        z-index:2;
        position: absolute;
    }
}

#container {
    min-height: 100%; 
    height: 100vh;
    display: block;
}

#home {
    margin: 0;
}

.header{
    background: none;
}


</style>

