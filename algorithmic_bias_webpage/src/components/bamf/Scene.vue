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
        <transition @enter="enterInfo" @leave="leaveInfo">
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
import { PathLoader } from './PathLoader.js';
import {InfoFontLoader} from './InfoFontLoader.js';
import {PlayerControls} from './PlayerControls.js'
import {Ground} from './Ground.js'
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
// let binormal = new THREE.Vector3();
// let normal = new THREE.Vector3();
// let position = new THREE.Vector3();
// let lookAt = new THREE.Vector3();
// let lookAhead = false;
let frame;

//camera
let camera, cameraHelper, cameraEye, overviewCamera; 
let cameraHelperOn = true;

let helperTubeGeometry;
let pathVertices,path;
let font;
let ground;

let guiParameters;

let informationsPhase = false;
let infoSegments = [2,5,10,20];
let infoSegmentsDone = [];
let infoPos = new THREE.Vector3();
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

//TODO: resizing
let windowSize; 

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
        if(informationsPhase){
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
    },
    camToObject: function(object){

        let aabb = new THREE.Box3().setFromObject( object );
        let center = aabb.getCenter( new THREE.Vector3() );
        //var size = aabb.getSize( new THREE.Vector3() );

        gsap.to( camera.position, {
            duration: 1,
            ease: "power4",
            x: center.x,
            y: center.y,
            z: center.z + 50, // maybe adding even more offset depending on your model
            onUpdate: function() {
                camera.lookAt( center );
                cameraHelper.update();
                cameraEye.position.copy( camera.position );
                //console.log("camera moved up");
            }
        });  
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
        scene.fog = new THREE.FogExp2(scene.background, 0.002);

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
        // let planeGeometry = new THREE.PlaneBufferGeometry(10000, 20000);
        // let planeMaterial = new THREE.MeshPhongMaterial({ color: 0x262626, depthWrite: false });
        // let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        // planeMesh.rotation.x = -Math.PI / 2;
        // planeMesh.position.y = 0;
        // planeMesh.receiveShadow = true;
        ground = new Ground();
        ground.init();
        scene.add(ground);

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

        //SVG path
        this.initPath(pathVertices,parent);

		cameraHelper.visible = cameraHelperOn;
		cameraEye.visible = cameraHelperOn;
    
        //RENDERER
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.context.getExtension('OES_standard_derivatives');
        container.appendChild(renderer.domElement);

        windowSize = new THREE.Vector2( renderer.domElement.offsetWidth, renderer.domElement.offsetHeight);

        //CONTROLS
        overviewControls = new OrbitControls(overviewCamera, renderer.domElement);
        

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
    onPointerDownInfo: function(event,obj,onIntersection){
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera( mouse, camera );

        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(obj);
        //const intersects = raycaster.intersectObjects(scene.children);
        console.log(intersects);

        for ( let i = 0; i < intersects.length; i ++ ) {
            intersects[ i ].object.material.color.set( 0xff0000 );
            if(typeof onIntersection !== undefined){
                onIntersection();
            }
        }
    },
    stopInformationPhase: function(){
        controls.start();
        controls.update(true);
        informationsPhase = false;
        console.log("informationPhase stopped.")
        window.removeEventListener( 'pointerdown',  this.onPointerDownInfo);
    },
    // },
    manageInformation: function(info){
        informationsPhase = true;

        //FIRST INFO ELEMENT
		if (info === infoSegmentsDone[0]){
			console.log("infoPhase 1");

			//setting info Position
            let lastCam = new THREE.Camera();
            lastCam.copy(camera);
           
            infoPos = (new THREE.Vector3( 0, 0, -30 )).applyQuaternion( camera.quaternion ).add( camera.position );
            infoPos.y = 50;
            let text = this.informations[0].content;
            let info2 = new InformationElement(scene,font,infoPos,text);
            info2.init();

            this.camToObject(info2.getMeshObject());
            let objects = []
            objects.push(info2.bbox);

            window.addEventListener('pointerdown', (event) => this.onPointerDownInfo(event, objects, function(){
                gsap.to( camera.position,{
                    duration: 2,
                    ease: "power4",
                    x: lastCam.position.x,
                    y: lastCam.position.y,
                    z: lastCam.position.z,
                    onComplete: this.stopInformationPhase
                })
            //using bind this because it is higher order function
            //https://stackoverflow.com/a/59060545
            }.bind(this))); 
        }

        else if (info === infoSegmentsDone[1]){
            console.log("window",windowSize);
            this.infoElement2 = true;
        }

        else if (info === infoSegmentsDone[2]){

            infoPos = (new THREE.Vector3( 0, 0, -30 )).applyQuaternion( camera.quaternion ).add( camera.position );
            infoPos.y = 15;
            let text = this.informations[2].content;
            let info = new InformationElement(scene,font,infoPos,text,this.informations[2].isImage);
            info.init();

            gsap.from(info.obj.position,{
                duration: 2,
                x: infoPos.x - 100,
                y: 20,
                z: infoPos.z - 100,
            })
            let objects = []
            objects.push(info.bbox);
            window.addEventListener('pointerdown', (event) => this.onPointerDownInfo(event, objects, function(){
                gsap.to( info.obj.position,{
                    duration: 1,
                    x: infoPos.x - 100,
                    y: 20,
                    z: infoPos.z - 100,
                    onComplete: this.stopInformationPhase
                })
            //using bind this because it is higher order function
            //https://stackoverflow.com/a/59060545
            }.bind(this)));


        }

        else if (info === infoSegmentsDone[3]){

            infoPos = (new THREE.Vector3( 0, 0, -30)).applyQuaternion( camera.quaternion ).add( camera.position );
            infoPos.y = 10;
            let path = this.informations[3].content;
            let info = new InformationElement(scene,font,infoPos,path,this.informations[3].isImage);
            info.init();

            gsap.from(info.obj.position,{
                duration: 3,
                x: infoPos.x*5,
                y: infoPos.y*5
            })    

            let objects = []
            objects.push(info.bbox);
            window.addEventListener('pointerdown', (event) => this.onPointerDownInfo(event, objects, function(){
                gsap.to( info.obj.position,{
                    duration: 1,
                    x: infoPos.x*5,
                    y: infoPos.y*5,
                    onComplete: this.stopInformationPhase
                })
            }.bind(this)));



            


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
				controls.update(false);
				overviewControls.update();
			}

			else{
				controls.update(true);
				console.log(controls.segment);
                if (infoSegments[0] === controls.segment){
                    let info = infoSegments.shift();
                    infoSegmentsDone.push(info)
                    console.log(infoSegments);
                    controls.stop();
					this.manageInformation(info);
				}
				overviewControls.update();
			}
            ground.update();
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
      Promise.all([this.preLoadPath(),this.preLoadFont()])
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

