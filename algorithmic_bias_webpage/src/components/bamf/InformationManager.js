"use strict";

//import router from '@/router';
import * as THREE from "three";
import {gsap} from 'gsap';
import { InformationElement } from './InformationElement.js';
import {AudioElement} from './AudioElement.js'

let InformationManager = function(scene,domElement,camera,controls,informations,font,models,audios,textures,cameraHelper,cameraEye){
    
    this.informationPhase = false;
    this.infoFollowPath = false;

    this.htmlInformation = false;
    this.htmlInfoId = 0;
    this.htmlPosition = new THREE.Vector2(0,0);

    this.scene = scene;
    this.domElement = domElement;
    this.camera = camera;
    this.controls = controls;
    this.informations = informations;
    this.font = font;
    this.models = models;
    this.audios = audios;
    this.cameraEye = cameraEye;
    this.cameraHelper = cameraHelper;

    let scope = this;

    let infoSegmentsHalf = [20,40,70,100,120,140,170,220,250,300,330,370,400,450,480,500,550,600,620,660,705,820,850,890,920,940,1000,1050,1080,1120,1200,1230,1300,1370,1410,1450,1490,1530,1580,1630,1670,1700,1730,1760,1800];
    //let infoSegmentsHalf = [20,40,1670,1710,1750,1800];

    let infoSegments = [];
    for (let i = 0; i < infoSegmentsHalf.length; i++) {
        infoSegments.push(infoSegmentsHalf[i]*2)   
    }
    console.log("info Positions to check: ",infoSegments.length);
    let infoSegmentsDone = [];
    let infoPos = new THREE.Vector3();

    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    //const windowSize = new THREE.Vector2( scope.domElement.offsetWidth, scope.domElement.offsetHeight);

    const cam = new THREE.Vector3();
    const defaultStartVector = new THREE.Vector3(0,0,-30);
    const defaultViewingDist = new THREE.Vector3(0,0,50);
    const defaultHtmlPos = new THREE.Vector2(0,0);
    const customStartVector = new THREE.Vector3();
    const customViewingDist = new THREE.Vector3();
    const customHtmlPos = new THREE.Vector2();
    const aabb = new THREE.Box3();
    const lastCam = new THREE.Camera();
    
    function camToObject(object,viewingDist,{duration = 1, rotateCam = false, rotation = undefined,onComplete,handler}  = {} ){
  
          aabb.setFromObject( object );
          let center = aabb.getCenter( new THREE.Vector3() ).add(viewingDist);
          //var size = aabb.getSize( new THREE.Vector3() );
          
          if (rotateCam & rotation !== undefined){
            gsap.to(scope.camera.rotation,{
                duration: 1.5,
                ease: "sine",
                x: rotation.x,
                y: rotation.y,
                z: rotation.z,
                onStart: function(){
                    scope.controls.enabled = false;
                },
                onUpdate: function() {
                    scope.cameraHelper.update();
                },
                onComplete: function(){
                    if (typeof onComplete === 'function'){
                        onComplete(object);
                    }
                    scope.controls.enabled = true;
                }
              })
          }

          gsap.to( scope.camera.position, {
            duration: duration,
            ease: "power3",
            x: center.x,
            y: center.y,
            z: center.z,
            onStart: function(){
                scope.controls.enabled = false;
            },
            onUpdate: function() {
                scope.cameraHelper.update();
                scope.cameraEye.position.copy( scope.camera.position );
            },
            onComplete: function(){
                if (typeof onComplete === 'function'){
                    onComplete(object);
                }
                if (typeof handler === 'function'){
                    handler(object);
                }
                scope.controls.enabled = true;
            }
        }, ); 
      }

    function infoOverPath(id,{startVector = defaultStartVector,
                        useQuaternion = true,   
                        viewingDist = defaultViewingDist,
                        height = 35,
                        afterCamToInfo,
                        onLeavingInfo,
                        infoRotAxis,
                        infoRotAngle,
                        infoTranslate} = {}){
        lastCam.copy(scope.camera);
        
        if (useQuaternion){
            infoPos = startVector.applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
            console.log("infoPos: ",infoPos);
        }
        else{
            infoPos.copy(camera.position);
        }
        infoPos.y = height + scope.controls.offset;
        let text = scope.informations[id].content;
        let scale = scope.informations[id].scale;
        let info = new InformationElement(scope.scene,scope.font,infoPos,text,false,scale);
        info.init();

        if(typeof infoRotAxis === "string" && typeof infoRotAngle === "number"){
            info.rotate(infoRotAxis,infoRotAngle);
        }

        if(infoTranslate !== undefined){
            info.translate(infoTranslate);
        }

        camToObject(info.getMeshObject(),viewingDist,{onComplete: afterCamToInfo,
        handler: function (){
            let objects = [];
            objects.push(info.bbox);
    
            //good for testing, but this should only be added when info is done animating
            window.addEventListener('pointerdown', function handler(event){ 
                scope.onPointerDownInfo(event, objects, function(){
                    gsap.to( scope.camera.position,{
                        duration: 0.5,
                        ease: "sine",
                        x: lastCam.position.x,
                        y: lastCam.position.y,
                        z: lastCam.position.z,
                        onComplete: function(){
                            if (typeof onComplete === 'function'){
                                onLeavingInfo();
                            }
                            scope.informationPhase = false;
                            }
                    })
            //using bind this because it is higher order function
            //https://stackoverflow.com/a/59060545
                })
                window.removeEventListener('pointerdown', handler);
            }.bind(this)); 
        }
    });

        return info.getMeshObject();
    }

    function infoFlyingToCam(id,{startVector = defaultStartVector,
                                viewingDist = defaultViewingDist,
                                useQuaternion = true,   
                                delay = 0,
                                infoRotAxis,
                                infoRotAngle,
                                moveInfoBack = true} = {}){

        if (useQuaternion){
            infoPos = startVector.applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
        }
        else{
            infoPos.copy(camera.position);
            infoPos.add(viewingDist);
        }
        infoPos.y = scope.controls.offset;
        let text = scope.informations[id].content;
        let scale = scope.informations[id].scale;
        let info = new InformationElement(scope.scene,scope.font,infoPos,text,scope.informations[2].isImage,scale);
        info.init();

        if(typeof infoRotAxis === "string" && typeof infoRotAngle === "number"){
            info.rotate(infoRotAxis,infoRotAngle);
        }

        gsap.from(info.obj.position,{
            delay: delay,
            duration: 2,
            x: infoPos.x - 100,
            y: 20,
            z: infoPos.z - 100,
            onComplete: function(){
                let objects = []
                objects.push(info.bbox);
                window.addEventListener('pointerdown', function handler(event){
                        scope.onPointerDownInfo(event, objects, function(){
                            if (moveInfoBack){
                                gsap.to( info.obj.position,{
                                    duration: 0.5,
                                    x: infoPos.x - 100,
                                    y: 20,
                                    z: infoPos.z - 100,
                                    onStart: function(){
                                        //scope.controls.enabled = false;
                                    },
                                    onComplete: function(){
                                        scope.informationPhase = false;
                                        //scope.controls.resetMouse();
                                        //scope.controls.enabled = true;
                                        window.removeEventListener('pointerdown', handler);
                                    }
                                })
                            }
                            else{
                                scope.informationPhase = false;
                                window.removeEventListener('pointerdown', handler);
                            }
                            
        //using bind this because it is higher order function
        //https://stackoverflow.com/a/59060545
                        })    
                }.bind(this))
            }
        })

        return info.getMeshObject();
    }

    //TODO: fix the html transition leave
    function infoAsHtml(id,{scale = 1, position = defaultHtmlPos}={}){
        scope.htmlInformation = true;
        scope.htmlInfoId = id;
        scope.htmlScale = scale;
        scope.htmlPosition = position;

        cam.set(0,0,0);
    }

    function addAxesHelper(){
        let helperGeo = new THREE.SphereBufferGeometry(0.03);
        let helper = new THREE.Mesh(helperGeo, new THREE.MeshBasicMaterial({color:0xff0000}));
        helper.position.x = camera.position.x + 0.5;
        helper.position.y = camera.position.y;
        helper.position.z = camera.position.z + 0.5;
        scene.add(helper);
        var axesHelper = new THREE.AxesHelper(1);
        helper.add( axesHelper );
    }

    function addImage(path,position,size){
        let texture = undefined;
        for (let i = 0; i < textures.length; i++) {
            if(textures[i].map.image.src.includes(path)){
                texture = textures[i];
            }
        }

        if (texture !== undefined){
            const box = new THREE.BoxGeometry(size.x,size.y,size.z);
            box.scale(5,5,5);
            let img = new THREE.Mesh(box, texture);
            img.position.copy(position);
            img.rotateY(THREE.MathUtils.degToRad(50));
            scope.scene.add(img);
            return img;
        } 
        else{
            console.log("texture not found: ",path);
        }

    }

    function addAudio(path,object,x,y,color = 0x9CBBCE){
        let audioFile = undefined;
        for (let i = 0; i < audios.length; i++) {
            if(audios[i].path.includes(path)){
                audioFile = audios[i].audio;
            }
        }
        if(audioFile !== undefined){
            let audio = new AudioElement(audioFile,color);
            audio.place(camera.children[0],object,{x:x,y:y,z:-1,distance:1});

            window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, [audio.getMesh()], function(){
                audio.play();
            }.bind(this)));
        }
        else{
            console.log("audio not found: ",path)
        }
    }

    function showingReferences() {
        console.log("info manager sending ending path")

        const event = new CustomEvent("endPath",{ 
            bubbles: true,
            detail:  {
                message: "ended path. showing references now."
        }});
        scope.domElement.dispatchEvent(event);
    }

    function manageInfo(infoNumber){

		if (infoNumber === infoSegmentsDone[0]){
            customViewingDist.set(0,0,50);
            infoOverPath(0,{useQuaternion:false,viewingDist:customViewingDist});
        }

        else if (infoNumber === infoSegmentsDone[1]){
            customHtmlPos.set(0,0.3);
            infoAsHtml(1,{scale:1.6,position:customHtmlPos});


            infoPos.copy(camera.position);
            infoPos.y += 2;
            infoPos.z += -20;

            let img = addImage('/img/bamf_training_p50_result.png',infoPos,new THREE.Vector3(3.4,4,0.2));

            gsap.from(img.position,{
                duration:1,
                y:60
            })
            
        }

        //#region done

        //TODO: bamf positioning next to path
        else if (infoNumber === infoSegmentsDone[2]){
            customViewingDist.set(-20,0,40);
            infoFlyingToCam(2,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:Math.PI,infoRotAxis:"Y"});

            infoPos = new THREE.Vector3( 20, 20, -20 ).applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
            let bamf = models[0].scene;

            infoPos.copy(scope.camera.position);
            infoPos.x += -40;
            infoPos.y = -15;
            infoPos.z += 50;

            bamf.scale.set(10,10,10);
            bamf.position.copy(infoPos);
            bamf.rotateY(THREE.MathUtils.degToRad(100));

            gsap.from(bamf.position,{
                duration:1,
                x: infoPos.x-100,
                y: -15
            })
            scope.scene.add(bamf);

            addAxesHelper();
        }

        //global see german border
        else if(infoNumber === infoSegmentsDone[3]){
            gsap.to(scope.scene.fog,{
                duration:1,
                density:0
            })
            lastCam.copy(scope.camera);

            infoPos.set(lastCam.position.x, 5000, lastCam.position.z);
            let text = scope.informations[3].content;
            let info = new InformationElement(scope.scene,scope.font,infoPos,text);
            info.init();
            info.rotate("X",-Math.PI/2);

            customStartVector.set(0,100,0);
            camToObject(info.getMeshObject(),customStartVector,{duration:2,rotateCam:true,rotation:new THREE.Vector3(-Math.PI/2,0,0),onComplete: function(){
                scope.controls.resetMouse()
            }});
            //scope.controls.enabled
            let objects = [];
            objects.push(info.bbox);

            window.addEventListener('pointerdown', function handler(event) {
                scope.onPointerDownInfo(event, objects, function(){
                    gsap.to( scope.camera.position,{
                        duration: 2,
                        ease: "power4",
                        x: lastCam.position.x,
                        y: lastCam.position.y,
                        z: lastCam.position.z,
                        onComplete: function(){
                            gsap.to(scope.scene.fog,{
                                duration:1,
                                density:0.002
                            })
                            scope.informationPhase = false;
                            window.removeEventListener('pointerdown',handler)
                        }
                    })
            //using bind this because it is higher order function
            //https://stackoverflow.com/a/59060545
            }.bind(this))}); 
        }

        else if(infoNumber === infoSegmentsDone[4]){
            customHtmlPos.set(0.5,0.5)
            infoAsHtml(4,{scale:3,position:customHtmlPos});
        }

        else if(infoNumber === infoSegmentsDone[5]){
            const angle = THREE.MathUtils.degToRad(120);
            customViewingDist.set(27,0,-9);
            infoOverPath(5,{useQuaternion:false,viewingDist: customViewingDist,infoRotAxis:"Y",infoRotAngle:angle})
        }

        //flying higher
        else if(infoNumber === infoSegmentsDone[6]){
            customHtmlPos.set(0.25,0.25);
            infoAsHtml(6,{scale:3,position:customHtmlPos});
            scope.infoFollowPath = true;
            //when the speed is lower, I want to make the delay 10.
            gsap.to(scope.controls,{
                duration: 10,
                ease: "power3",
                offset: 60,
                lookFar:100
            })
            gsap.to(scope.scene.fog,{
                duration:1,
                density:0.0005
            })
        }

        else if(infoNumber === infoSegmentsDone[7]){
            customViewingDist.set(-7.5,-7.5,-38);
            infoFlyingToCam(7,{useQuaternion:false,viewingDist:customViewingDist,delay:2})
        }

        //TODO: place audio at correc tspace
        else if(infoNumber === infoSegmentsDone[8]){

            customViewingDist.set(29.1,0,29.5);

            let obj = infoOverPath(8,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:Math.PI/2,height:-10});

            addAudio("sof_rainbow01",obj,-0.2,1);
            
            addAudio("wef_rainbow01.wav",obj,-0.1,1);

            addAudio("irm_rainbow01.wav",obj,0,1);
            
            addAudio("scm_rainbow01.wav",obj,0.1,1);
        }
       
        else if(infoNumber === infoSegmentsDone[9]){
            customHtmlPos.set(0.25,0.1);
            infoAsHtml(9,{scale:2,position:customHtmlPos});
            scope.infoFollowPath = true;
        }

        //audio in here
        else if(infoNumber === infoSegmentsDone[10]){
            customViewingDist.set(24,-8,15);
            let obj = infoFlyingToCam(10,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:-Math.PI/2,infoRotAxis:"Y"})

            addAudio("irm_rainbow01.wav",obj,0.1,1,0x143E4F);

            addAudio("scm_rainbow01.wav",obj,-0.1,1,0x9CBBCE);

        }

        else if(infoNumber === infoSegmentsDone[11]){


            customViewingDist.set(-30,0,15);
            const angle = THREE.MathUtils.degToRad(110)
            infoFlyingToCam(11,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:angle,infoRotAxis:"Y"});
        }

        else if(infoNumber === infoSegmentsDone[12]){
            customViewingDist.set(-7,0,-30);
            infoOverPath(12,{height:-20,useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:Math.PI,infoRotAxis:"Y"});
        }
        
        else if(infoNumber === infoSegmentsDone[13]){
            customViewingDist.set(10,0,30);
            infoFlyingToCam(13,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:Math.PI,infoRotAxis:"Y"});
        }

        else if(infoNumber === infoSegmentsDone[14]){
            customHtmlPos.set(0,0.8)
            infoAsHtml(14,{scale:1.5,position:customHtmlPos})
        }

        //flying lower again
        else if(infoNumber === infoSegmentsDone[15]){
            customHtmlPos.set(0.5,0.5)
            infoAsHtml(15,{scale:1.5,position:customHtmlPos})
            scope.infoFollowPath = true;
            //make duration longer later
            gsap.to(scope.controls,{
                duration: 10,
                ease: "power2",
                offset: 15,
                lookFar:30
            })
            gsap.to(scope.scene.fog,{
                duration:1,
                density:0.002
            })
        }
        else if(infoNumber === infoSegmentsDone[16]){
            customViewingDist.set(20,0,20);
            infoFlyingToCam(16,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:THREE.MathUtils.degToRad(230),infoRotAxis:"Y",moveInfoBack:false})
            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[17]){
            cam.set(0,0,0);
            camera.getWorldDirection(cam);
            console.log("cam 17", cam);
            customViewingDist.set(0,0,-80);
            infoOverPath(17,{useQuaternion:false,viewingDist:customViewingDist,height:30,infoRotAngle:Math.PI,infoRotAxis:"Y"})
        }

        else if(infoNumber === infoSegmentsDone[18]){
            cam.set(0,0,0);
            
            customViewingDist.set(10,0,-30);
            infoOverPath(18,{useQuaternion:false,viewingDist:customViewingDist,height:20,infoRotAngle:Math.PI,infoRotAxis:"Y"})

            infoPos.copy(camera.position);

            let info = addImage('/img/bamf_training_p50_result.png',infoPos,new THREE.Vector3(3.4,4,0.2));
            info.rotateY(THREE.MathUtils.degToRad(120));

            camToObject(info,customViewingDist);

            addAxesHelper();

        }

        else if(infoNumber === infoSegmentsDone[19]){
            customHtmlPos.set(0.8,0.8);
            infoAsHtml(19,{position:customHtmlPos});
            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[20]){
            
            cam.set(0,0,0);

            customViewingDist.set(0,0,20);
            infoFlyingToCam(20,{useQuaternion:false,viewingDist:customViewingDist,height:30,infoRotAngle:THREE.MathUtils.degToRad(200),infoRotAxis:"Y",moveInfoBack:false})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[21]){

            customViewingDist.set(-20,0,-20);
            const angle = THREE.MathUtils.degToRad(240)
            infoOverPath(21,{useQuaternion:false,viewingDist:customViewingDist,height:10,infoRotAngle:angle,infoRotAxis:"Y",rotateCam:true,rotation:new THREE.Vector3(0,Math.PI/2,0)})
            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[22]){
           
            customViewingDist.set(-30,0,-60);
            infoOverPath(22,{useQuaternion:false,viewingDist:customViewingDist,height:70,infoRotAngle:THREE.MathUtils.degToRad(200),infoRotAxis:"Y"})
            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[23]){
            customViewingDist.set(0,0,50);
            infoFlyingToCam(23,{useQuaternion:false,viewingDist:customViewingDist,height:8,infoRotAngle:Math.PI,infoRotAxis:"Y",moveInfoBack:false})
            addAxesHelper();
        }
        
        else if(infoNumber === infoSegmentsDone[24]){
            customHtmlPos.set(0.3,0.3);
            infoAsHtml(24,{position:customHtmlPos})
        }

        else if(infoNumber === infoSegmentsDone[25]){
            customViewingDist.set(-10,0,-35)
            infoOverPath(25,{useQuaternion:false,viewingDist:customViewingDist,height:10,infoRotAngle:THREE.MathUtils.radToDeg(180),infoRotAxis:"Y"});
            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[26]){
            customViewingDist.set(30,0,50);
            infoFlyingToCam(26,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:THREE.MathUtils.radToDeg(300),infoRotAxis:"Y"});
            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[27]){
            lastCam.copy(scope.camera);

            infoPos.set(lastCam.position.x, 130, lastCam.position.z);
            let text = scope.informations[27].content;
            let info = new InformationElement(scope.scene,scope.font,infoPos,text);
            info.init();
            info.rotate("Y",-Math.PI/2);
            //info.rotate("X",Math.PI/2);
            info.rotate("X",Math.PI/2);

            let axesHelper = new THREE.AxesHelper(5);
            info.getMeshObject().add( axesHelper );

            let rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI/2);
            rotation.multiply(lastCam.quaternion);
            console.log("rotation",rotation);

            addAxesHelper();

            gsap.to({},{
                duration:1,
                onStart: scope.controls.enabled = false,
                onUpdate: function(){
                    console.log(camera.quaternion.x);
                    scope.camera.quaternion.slerp(rotation,this.progress());
                    //scope.camera.quaternion.rotateTowards(rotation,t);
                },
                onComplete: function(){
                    console.log("cam on complete",camera.quaternion);
                    //scope.controls.resetMouse(rotation);
                    //scope.controls.enabled = true;
                }
            })

            console.log(scope.camera.quaternion);

            let objects = [];
            objects.push(info.bbox);

            window.addEventListener('pointerdown',  function handler(event) {
                scope.onPointerDownInfo(event, objects, function(){
                    gsap.to({},{
                        duration:1,
                        onUpdate: function(){
                            console.log(camera.quaternion.x);
                            scope.camera.quaternion.slerp(lastCam.quaternion,this.progress());
                            //scope.camera.quaternion.rotateTowards(rotation,t);
                        },
                        onComplete: function(){
                            scope.informationPhase = false;
                            document.removeEventListener('pointerdown',handler);
                            scope.controls.enabled = true;
                            console.log("completed",scope.informationPhase);
                        }
                    })
                //using bind this because it is higher order function
                //https://stackoverflow.com/a/59060545
                }.bind(this))}); 
            

        }

        else if(infoNumber === infoSegmentsDone[28]){
            customViewingDist.set(10,0,2);
            customHtmlPos.set(0.1,0.5);
            infoAsHtml(28,{position:customHtmlPos});

            infoPos.copy(camera.position);
            infoPos.y = 2 + scope.controls.offset;
            infoPos.add(customViewingDist)

            console.log("position image",infoPos);
            let img = addImage('bamf_training_p50_result.png',infoPos,new THREE.Vector3(1.7,2,0.2));
            img.rotateY(THREE.MathUtils.degToRad(50));

            // let info = new InformationElement(scope.scene,scope.font,infoPos,"/img/bamf_training_p50_result.png",true,1);
            // info.init();
            // info.rotate("Y",THREE.MathUtils.degToRad(50));

            addAxesHelper();

        }
        
        else if(infoNumber === infoSegmentsDone[29]){
            customViewingDist.set(30,0,15);
            infoFlyingToCam(29,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(240)})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[30]){
            customViewingDist.set(30,0,50);
            infoFlyingToCam(30,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(240),moveInfoBack:false})

            addAxesHelper();
        }

        //flying higher
        else if(infoNumber === infoSegmentsDone[31]){
            customHtmlPos.set(0.5,0.5)
            infoAsHtml(31,{position:customHtmlPos,scale:2});
            scope.infoFollowPath = true;

            //make that longer
            gsap.to(scope.controls,{
                duration: 10,
                ease: "power4",
                offset: 150,
                lookFar: 500
            });

            gsap.to(scope.scene.fog,{
                duration:1,
                density:0.0001
            });

        }

        else if(infoNumber === infoSegmentsDone[32]){
            customViewingDist.set(-20,0,-15);
            infoFlyingToCam(32,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(10)})

            infoPos.copy(camera.position);
            infoPos.z += -3;
            infoPos.x += 5;
            infoPos.y = 2 + scope.controls.offset;

            console.log("position image",infoPos);

            let img = addImage('map_arabian_dialects.png',infoPos,new THREE.Vector3(4,2.2,0.2));
            img.rotateY(THREE.MathUtils.degToRad(90));

            gsap.from(img.position,{
                duration:1,
                y:0,
                x:infoPos - 10
            })
            //info.rotate("Y",Math.PI);

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[33]){
            customViewingDist.set(-30,0,50);
            infoOverPath(33,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(0)})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[34]){
            customViewingDist.set(30,0,15);
            infoOverPath(34,{useQuaternion:false,height:-40,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(90)})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[35]){
            customHtmlPos.set(0.5,0.5)
            infoAsHtml(35,{position:customHtmlPos});
            scope.infoFollowPath = true;

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[36]){
            customViewingDist.set(60,0,-30);
            infoFlyingToCam(36,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(300)})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[37]){
            customViewingDist.set(0,0,30);
            infoOverPath(37,{useQuaternion:false,height:-20,viewingDist:customViewingDist})

            addAxesHelper();
        }

        //flying lower again
        else if(infoNumber === infoSegmentsDone[38]){
            customHtmlPos.set(0.8,0.3)
            infoAsHtml(38,{scale:1.5,position:customHtmlPos});
            scope.infoFollowPath = true;

            //make that longer
            gsap.to(scope.controls,{
                duration: 1,
                ease: "power4",
                offset: 15,
                lookFar: 500
            })
            gsap.to(scope.scene.fog,{
                duration:1,
                density:0.002
            })

            addAxesHelper();
        }

        //#endregion done
        else if(infoNumber === infoSegmentsDone[39]){
            console.log("info 39");
            customViewingDist.set(60,0,15);
            infoOverPath(39,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(20)})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[40]){
            customHtmlPos.set(0.5,0.5)
            infoAsHtml(40,{scale:1.3,position:customHtmlPos});
        }

        else if(infoNumber === infoSegmentsDone[41]){
            customHtmlPos.set(0.5,0.5)
            infoAsHtml(41,{scale:1.3,position:customHtmlPos});
        }

        else if(infoNumber === infoSegmentsDone[42]){
            customHtmlPos.set(0.5,0.5)
            infoAsHtml(42,{scale:1.6,position:customHtmlPos});
        }

        else if (infoNumber === infoSegmentsDone[43]){

            infoPos.set(0, 9000, 0);
            let text = scope.informations[43].content;
            let info = new InformationElement(scope.scene,scope.font,infoPos,text);
            info.init();
            info.rotate("X",-Math.PI/2);

            console.log("info",info);
            console.log("aabb",aabb);

            aabb.setFromObject(info.getMeshObject() );
            customViewingDist.set(0,30,0);
            let center = aabb.getCenter( new THREE.Vector3() ).add(customViewingDist);

            console.log("center",center);

            var tl = gsap.timeline();
            lastCam.copy(scope.camera);
            //var size = aabb.getSize( new THREE.Vector3() );
            
            tl.to(scope.camera.rotation,{
                duration: 2,
                ease: "none",
                x: -THREE.MathUtils.degToRad(90) + 0.5,
                z: 0,
                onStart: scope.controls.enabled = false
            })

            tl.to(scope.scene.fog,{duration:1,density:0},"-=1")
  
            tl.to( scope.camera.position, {
              duration: 3,
              ease: "power4",
              x: center.x,
              y: center.y,
              z: center.z, // maybe adding even more offset depending on your model
            }); 


            tl.to(scope.camera.rotation,{
                duration:5,
                x: -THREE.MathUtils.degToRad(90)
            }),"+=2";

            tl.to(scope.camera.position,{
                duration:2,
                y:9100,
                x:30,
                z:30,
                onComplete:() => {
                    scope.controls.resetMouse();
                    scope.controls.enabled = true;
                }

            }),"-=4";

            let objects = [];
            objects.push(info.bbox);

            window.addEventListener('pointerdown',function(event){
                scope.onPointerDownInfo(event, objects, function(){
                    // console.log(router.getRoutes());
                    // router.go();
                    showingReferences();

                    // let id = "bamf_info_references";
                    // const el = document.getElementById(id);
                    //     console.log(el);

                    // if (el) {
                    //     el.scrollIntoView({behavior: 'smooth'});
                    // }

                })
            })
        }

    }

    this.onPointerDownInfo = function(event,obj,onIntersection){
        mouse.x = ( event.offsetX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.offsetY / window.innerHeight ) * 2 + 1;

        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera( mouse, camera );

        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(obj);
        //const intersects = raycaster.intersectObjects(scene.children);

        for ( let i = 0; i < intersects.length; i ++ ) {
            intersects[ i ].object.material.color.set( 0x143E4F );
            if(typeof onIntersection !== undefined){
                onIntersection();
            }
        }
    }


    this.update = function(controlsSegment){
        if (infoSegments[0] === controlsSegment){
            let info = infoSegments.shift();
            infoSegmentsDone.push(info)
            this.informationPhase = true;

            //This can only be used with html informations, which makes sense.
            if(this.infoFollowPath){
                this.infoFollowPath = false;
                let infoHtml = document.getElementById('info');
                if (infoHtml instanceof HTMLDivElement) {
                    infoHtml.dispatchEvent(new Event("click"));
                }
                window.removeEventListener("pointerdown",this.onPointerDownInfo);
            }
            manageInfo(info);
        }

        //if one element is skipped, place it to the next to elements
        else if(scope.controls.resetCam && infoSegments[0]<controlsSegment){
            while (infoSegments[0]<controlsSegment){
                console.log("i am already here",controlsSegment);
                console.log("so I skipped this info",infoSegments[0]);
                infoSegments.shift();
                //attention: I am adding it do done, this could be a problem at the end.
                //infoSegmentsDone.push(info);
                infoSegments.unshift(controlsSegment+2);
            }
        }
    }


}

export {InformationManager}