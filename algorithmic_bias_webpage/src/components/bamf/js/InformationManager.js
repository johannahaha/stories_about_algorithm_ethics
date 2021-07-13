"use strict";

//import router from '@/router';
import * as THREE from "three";
import {gsap} from 'gsap';
import { InformationElement } from './InformationElement.js';
//import {AudioElement} from './AudioElement.js'

let InformationManager = function(scene,domElement,camera,controls,informations,font,audios,textures,isGerman){
    
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
    this.audios = audios;
    this.isGerman = isGerman;

    let scope = this;

    //segments at which infos are displayed, will be *2 later
    // let infoSegmentsHalfBeforeUpdate = [20,40,70,100,120,140,170,220,250,300,330,370,400,450,480,500,550,600,620,660,705,820,850,890,920,940,1000,1060,1090,1120,1200,1230,1300,1370,1410,1450,1490,1530,1580,1630,1670,1695,1720,1750,1780,1800]

    //let infoSegmentsHalf = [20,40,70,100,120,140,170,220,370,450,550,600,650,670,690,700,920,980,1050,1070,1100,1120,1370,1530,1580,1630,1640,1650]
    let infoSegmentsHalf = [20,220,370,690,700,920,980,1050,1070,1100,1120,1370,1530,1580,1630,1700,1750,1780,1800]

    let infoSegments = [];
    for (let i = 0; i < infoSegmentsHalf.length; i++) {
        infoSegments.push(infoSegmentsHalf[i]*2)   
    }
    let infoSegmentsDone = [];
    let infoPos = new THREE.Vector3();

    //raycaster
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    //vectors used for the animation
    const defaultStartVector = new THREE.Vector3(0,0,-30);
    const defaultViewingDist = new THREE.Vector3(0,0,50);
    const defaultHtmlPos = new THREE.Vector2(0,0);
    //const customStartVector = new THREE.Vector3();
    const customViewingDist = new THREE.Vector3();
    const customHtmlPos = new THREE.Vector2();
    const aabb = new THREE.Box3();
    const lastCam = new THREE.Camera();

    //const music1 = findAudio("music_1.mp3");
    const music2 = findAudio("music_2.mp3");
    const music3 = findAudio("music_3.mp3");
    //const music4 = findAudio("music_4.mp3");
    //const music5 = findAudio("music_5.mp3");
    
    //camera goes to the center of an object, optionally also rotates
    function camToObject(object,viewingDist,{duration = 1, rotateCam = false, rotation = undefined,onComplete,handler}  = {} ){
  
          aabb.setFromObject( object );
          let center = aabb.getCenter( new THREE.Vector3() ).add(viewingDist);
          
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

    //Information Elements is displayed over path and cam is flying towards it
    function infoOverPath(id,{startVector = defaultStartVector,
                        useQuaternion = true,   
                        viewingDist = defaultViewingDist,
                        height = 35,
                        afterCamToInfo,
                        onLeavingInfo,
                        infoRotAxis,
                        infoRotAngle,
                        infoTranslate,
                        audio = undefined} = {}){
        lastCam.copy(scope.camera);
        
        if (useQuaternion){
            infoPos = startVector.applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
        }
        else{
            infoPos.copy(camera.position);
        }
        infoPos.y = height + scope.controls.offset;
        let text;
        if(isGerman){
            text = scope.informations[id].german;
        }
        else{
            text = scope.informations[id].content;
        }
        let scale = scope.informations[id].scale;
        let info = new InformationElement(scope.scene,scope.font,infoPos,text,false,scale,audio);
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

    //information Element is flying towards cam
    function infoFlyingToCam(id,{startVector = defaultStartVector,
                                viewingDist = defaultViewingDist,
                                useQuaternion = true,   
                                delay = 0,
                                infoRotAxis,
                                infoRotAngle,
                                moveInfoBack = true,
                                audio = undefined} = {}){

        if (useQuaternion){
            infoPos = startVector.applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
        }
        else{
            infoPos.copy(camera.position);
            infoPos.add(viewingDist);
        }
        infoPos.y = scope.controls.offset;
        let text;
        if(isGerman){
            text = scope.informations[id].german;
        }
        else{
            text = scope.informations[id].content;
        }
        let scale = scope.informations[id].scale;
        let info = new InformationElement(scope.scene,scope.font,infoPos,text,scope.informations[2].isImage,scale,audio);
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
                                    onComplete: function(){
                                        scope.informationPhase = false;
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

    //display info as HTML, Scene.vue manages the rest to display Information.vue
    function infoAsHtml(id,{scale = 1, position = defaultHtmlPos}={}){
        scope.htmlInformation = true;
        scope.htmlInfoId = id;
        scope.htmlScale = scale;
        scope.htmlPosition = position;
    }

    //add image at specific position
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

    //add audio element to info element
    // function addAudio(path,object,x,y,color = 0x9CBBCE){
    //     let audioFile = undefined;
    //     for (let i = 0; i < audios.length; i++) {
    //         if(audios[i].path.includes(path)){
    //             audioFile = audios[i].audio;
    //         }
    //     }
    //     if(audioFile !== undefined){
    //         let audio = new AudioElement(audioFile,color);
    //         audio.place(camera.children[0],object,{x:x,y:y,z:-1,distance:1});

    //         window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, [audio.getMesh()], function(){
    //             audio.play();
    //         }.bind(this)));
    //     }
    //     else{
    //         console.log("audio not found: ",path)
    //     }
    // }

    //helper: axes
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

    //emit event to change speed with the updated speed value
    function changeSpeed(speedUpdate){
        const event = new CustomEvent("changeSpeed",{ 
            bubbles: true,
            detail:  {
                speed: speedUpdate
        }});
        console.log("emitting event so change speed", speedUpdate);
        scope.domElement.dispatchEvent(event);
    }

    //dispatches event to show references
    function showingReferences() {

        const event = new CustomEvent("endPath",{ 
            bubbles: true,
            detail:  {
                message: "ended path. showing references now."
        }});
        scope.domElement.dispatchEvent(event);
    }

    //main function of information handling
    //manages what happens for each information
    function manageInfo(infoNumber){

        //done
		if (infoNumber === infoSegmentsDone[0]){
            customViewingDist.set(0,0,50);
            infoOverPath(0,{useQuaternion:false,viewingDist:customViewingDist,audio:music2});
            changeSpeed(0.04);
        }
        //#region done
        // else if (infoNumber === infoSegmentsDone[1]){
        //     customHtmlPos.set(0,0.3);
        //     infoAsHtml(1,{scale:3,position:customHtmlPos});


        //     // infoPos.copy(camera.position);
        //     // infoPos.y += 2;
        //     // infoPos.z += -20;

        //     //let img = addImage('/img/bamf_training_p50_result.png',infoPos,new THREE.Vector3(3.4,4,0.2));

        //     // gsap.from(infoPos,{
        //     //     duration:1,
        //     //     y:60
        //     // })
            
        // }

        // else if (infoNumber === infoSegmentsDone[2]){
        //     customViewingDist.set(-20,0,40);
        //     infoFlyingToCam(2,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:Math.PI,infoRotAxis:"Y",audio:music1});

        //     infoPos = new THREE.Vector3( 20, 20, -20 ).applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
        //     //let bamf = models[0].scene;

        //     infoPos.copy(scope.camera.position);
        //     // infoPos.x += -40;
        //     // infoPos.y = -15;
        //     // infoPos.z += 50;

        //     // bamf.scale.set(10,10,10);
        //     // bamf.position.copy(infoPos);
        //     // bamf.rotateY(THREE.MathUtils.degToRad(100));

        //     gsap.from(infoPos,{
        //         duration:1,
        //         x: infoPos.x -140,
        //         y: infoPos.y -15,
        //         z: infoPos.z -50
        //     })
        //     //scope.scene.add(bamf);
            
        // }

        // //global see german border
        // else if(infoNumber === infoSegmentsDone[3]){
        //     gsap.to(scope.scene.fog,{
        //         duration:1,
        //         density:0
        //     })
        //     lastCam.copy(scope.camera);

        //     infoPos.set(lastCam.position.x, 5000, lastCam.position.z);
        //     let text;
        //     if(isGerman){
        //         text = scope.informations[3].german;
        //     }
        //     else{
        //         text = scope.informations[3].content;
        //     }
        //     let info = new InformationElement(scope.scene,scope.font,infoPos,text);
        //     info.init();
        //     info.rotate("X",-Math.PI/2);
        //     info.bbox.scale.set(3,3,3);
        //     scope.camera.far = 1000000;
        //     scope.camera.updateProjectionMatrix();
        //     customStartVector.set(0,100,0);
        //     camToObject(info.getMeshObject(),customStartVector,{audio:music5,duration:2,rotateCam:true,rotation:new THREE.Vector3(-Math.PI/2,0,0),onComplete: function(){
        //         scope.controls.resetMouse()
        //     }});

        //     let objects = [];
        //     objects.push(info.bbox);

        //     window.addEventListener('pointerdown', function handler(event) {
        //         scope.onPointerDownInfo(event, objects, function(){
        //             gsap.to( scope.camera.position,{
        //                 duration: 2,
        //                 ease: "power4",
        //                 x: lastCam.position.x,
        //                 y: lastCam.position.y,
        //                 z: lastCam.position.z,
        //                 onComplete: function(){
        //                     gsap.to(scope.scene.fog,{
        //                         duration:1,
        //                         density:0.002
        //                     })
        //                     gsap.to(scope.camera,{
        //                         far: 1000
        //                     })
        //                     scope.camera.updateProjectionMatrix();
        //                     scope.informationPhase = false;
        //                     window.removeEventListener('pointerdown',handler)
        //                 }
        //             })
        //     //using bind this because it is higher order function
        //     //https://stackoverflow.com/a/59060545
        //     }.bind(this))}); 
        // }

        // else if(infoNumber === infoSegmentsDone[4]){
        //     customHtmlPos.set(0.5,0.2)
        //     infoAsHtml(4,{scale:1,position:customHtmlPos});
        // }

        // else if(infoNumber === infoSegmentsDone[5]){
        //     const angle = THREE.MathUtils.degToRad(120);
        //     customViewingDist.set(35,0,-11);
        //     infoOverPath(5,{useQuaternion:false,viewingDist: customViewingDist,infoRotAxis:"Y",infoRotAngle:angle,audio:music1})
        //     //changeSpeed(0.001);
        // }

        // //image
        // else if(infoNumber === infoSegmentsDone[6]){
        //     customHtmlPos.set(0.1,0.9);
        //     infoAsHtml(6,{scale:2,position:customHtmlPos});

        //     infoPos.copy(camera.position);
        //     infoPos.y += 2;
        //     infoPos.z += -20;

        //     let img = addImage('/img/bamf_training_p50_result.png',infoPos,new THREE.Vector3(3.4,4,0.2));

        //     gsap.from(img.position,{
        //         duration:1,
        //         y:60
        //     })
           
        //     //scope.infoFollowPath = true;

        //     // gsap.to(scope.controls,{
        //     //     duration: 10,
        //     //     ease: "power3",
        //     //     offset: 60,
        //     //     lookFar:100
        //     // })
        //     // gsap.to(scope.scene.fog,{
        //     //     duration:1,
        //     //     density:0.0005
        //     // })
        // }
        //#endregion

        else if(infoNumber === infoSegmentsDone[1]){
            customViewingDist.set(-7.5,-7.5,-38);
            infoFlyingToCam(7,{useQuaternion:false,viewingDist:customViewingDist,delay:0.5,audio:music3});
            gsap.to(scope.controls,{
                duration: 5,
                ease: "power3",
                offset: 60,
                lookFar:100,
                onComplete: function(){
                    console.log("completed");
                    changeSpeed(0.02);
                }
            })
            gsap.to(scope.scene.fog,{
                duration:1,
                density:0.003
            })
            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[2]){

            customViewingDist.set(40,0,40);

            infoOverPath(8,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:Math.PI/2,height:-10});

        }
        //#region done 2
        // else if(infoNumber === infoSegmentsDone[9]){
        //     //customHtmlPos.set(0.25,0.1);
        //     customViewingDist.set(20,0,20);
        //     infoOverPath(9,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:Math.PI/2,height:10});
        //     addAxesHelper();
        // }

        // else if(infoNumber === infoSegmentsDone[10]){
        //     customViewingDist.set(50,-16,30);
        //     let obj = infoFlyingToCam(10,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:-Math.PI/2,infoRotAxis:"Y",audio:music4})


        //     addAudio("sof_rainbow01.mp3",obj,-0.2,1);
            
        //     addAudio("wef_rainbow01.mp3",obj,-0.1,1);

        //     addAudio("irm_rainbow01.mp3",obj,0,1);
            
        //     addAudio("scm_rainbow01.mp3",obj,0.1,1);

        // }

        // else if(infoNumber === infoSegmentsDone[11]){


        //     customViewingDist.set(-30,0,15);
        //     const angle = THREE.MathUtils.degToRad(110)
        //     let obj = infoFlyingToCam(11,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:angle,infoRotAxis:"Y",audio:music1,height:10});


        //     addAudio("irm_rainbow01.mp3",obj,0.1,1,0x143E4F);

        //     addAudio("scm_rainbow01.mp3",obj,-0.1,1,0x9CBBCE);
        // }

        // else if(infoNumber === infoSegmentsDone[12]){
        //     customHtmlPos.set(0,0.8);
        //     infoAsHtml(12,{scale:1.6,position:customHtmlPos});
        //     //customViewingDist.set(-7,0,-30);
        //     //infoOverPath(12,{height:-20,useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:Math.PI,infoRotAxis:"Y"});
        //     changeSpeed(0.002);
        // }
        
        // else if(infoNumber === infoSegmentsDone[13]){
        //     customViewingDist.set(60,0,60);
        //     const angle = THREE.MathUtils.degToRad(30)
        //     infoOverPath(13,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:angle,infoRotAxis:"Y",height:-20});
        //     addAxesHelper();
        // }
        //#endregion

        else if(infoNumber === infoSegmentsDone[3]){
            customHtmlPos.set(0,0.8)
            infoAsHtml(14,{scale:1.5,position:customHtmlPos})
            scope.infoFollowPath = true;
            changeSpeed(0.002);
        }

        //flying lower again
        else if(infoNumber === infoSegmentsDone[4]){
            customHtmlPos.set(0.5,0.5)
            infoAsHtml(15,{scale:1.5,position:customHtmlPos})
            scope.infoFollowPath = true;
            //make duration longer later
            gsap.to(scope.controls,{
                duration: 10,
                ease: "power2",
                offset: 15,
                lookFar:30,
                onComplete: changeSpeed(0.03)
            })
            gsap.to(scope.scene.fog,{
                duration:1,
                density:0.002
            })
        }

        else if(infoNumber === infoSegmentsDone[5]){
            customViewingDist.set(0,0,-55);
            infoOverPath(16,{useQuaternion:false,viewingDist:customViewingDist,height:15,infoRotAngle:Math.PI,infoRotAxis:"Y"})
            changeSpeed(0.005);

            
        }

        else if(infoNumber === infoSegmentsDone[6]){

            customViewingDist.set(0,0,30);
            infoFlyingToCam(17,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:THREE.MathUtils.degToRad(210),infoRotAxis:"Y",moveInfoBack:false})
    

            infoPos.copy(camera.position);
            infoPos.z += -6;
            infoPos.x += 10;
            infoPos.y = 2 + scope.controls.offset;

            let img = addImage('map_arabian_dialects.png',infoPos,new THREE.Vector3(4,2.2,0.2));
            img.rotateY(THREE.MathUtils.degToRad(70));

            gsap.from(img.position,{
                duration:2,
                y:0,
                x:infoPos - 10
            })
            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[7]){
            
            customViewingDist.set(10,0,-30);
            infoOverPath(18,{useQuaternion:false,viewingDist:customViewingDist,height:20,infoRotAngle:Math.PI,infoRotAxis:"Y"})

            scope.infoFollowPath = true;
            changeSpeed(0.002);
            // infoPos.copy(camera.position);

            // let info = addImage('/img/bamf_training_p50_result.png',infoPos,new THREE.Vector3(3.4,4,0.2));
            // info.rotateY(THREE.MathUtils.degToRad(120));

            // camToObject(info,customViewingDist);

        }

        else if(infoNumber === infoSegmentsDone[8]){
            customHtmlPos.set(0.8,0.8);
            infoAsHtml(19,{position:customHtmlPos,scale:1.4});
            
        }

        else if(infoNumber === infoSegmentsDone[9]){

            customViewingDist.set(0,10,40);
            infoFlyingToCam(20,{useQuaternion:false,viewingDist:customViewingDist,height:50,infoRotAngle:THREE.MathUtils.degToRad(210),infoRotAxis:"Y",moveInfoBack:false})

            
        }

        else if(infoNumber === infoSegmentsDone[10]){
            customHtmlPos.set(0.2,0.8);
            infoAsHtml(21,{position:customHtmlPos,scale:1.4});
            // customViewingDist.set(-20,0,-20);
            // const angle = THREE.MathUtils.degToRad(240)
            // infoOverPath(21,{useQuaternion:false,viewingDist:customViewingDist,height:10,infoRotAngle:angle,infoRotAxis:"Y",rotateCam:true,rotation:new THREE.Vector3(0,Math.PI/2,0)})

            gsap.to(scope.controls,{
                duration: 5,
                ease: "power3",
                offset: 60,
                lookFar:100,
                onComplete: changeSpeed(0.02)
            })
            gsap.to(scope.scene.fog,{
                duration:1,
                density:0.002
            })
            
        }

        else if(infoNumber === infoSegmentsDone[11]){

            customViewingDist.set(50,0,40);
            infoOverPath(22,{useQuaternion:false,viewingDist:customViewingDist,height:20,infoRotAngle:THREE.MathUtils.degToRad(70),infoRotAxis:"Y"})
            
        }

        else if(infoNumber === infoSegmentsDone[12]){
            customViewingDist.set(0,0,-50);
            infoFlyingToCam(23,{useQuaternion:false,viewingDist:customViewingDist,height:8,infoRotAngle:THREE.MathUtils.degToRad(330),infoRotAxis:"Y",moveInfoBack:false})

            gsap.to(scope.controls,{
                duration: 5,
                ease: "power3",
                offset: 15,
                lookFar:100,
                onComplete: changeSpeed(0.005)
            })
            gsap.to(scope.scene.fog,{
                duration:1,
                density:0.002
            })
            addAxesHelper()
            
        }
        
        else if(infoNumber === infoSegmentsDone[13]){
            customViewingDist.set(-30,0,-50);
            infoFlyingToCam(24,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:THREE.MathUtils.radToDeg(100),infoRotAxis:"Y"});
        }

        else if(infoNumber === infoSegmentsDone[14]){
            customViewingDist.set(10,0,35)
            infoOverPath(25,{useQuaternion:false,viewingDist:customViewingDist,height:10,infoRotAngle:THREE.MathUtils.radToDeg(50),infoRotAxis:"Y"});
            
        }

        else if(infoNumber === infoSegmentsDone[15]){
            customViewingDist.set(30,0,15);
            infoAsHtml(26,{scale:1.3,position:customHtmlPos});

            scope.infoFollowPath = true;
            
        }
        //#region special now out 
        // else if(infoNumber === infoSegmentsDone[16]){
        //     lastCam.copy(scope.camera);

        //     infoPos.set(lastCam.position.x, 130, lastCam.position.z);
        //     let text;
        //     if(isGerman){
        //         text = scope.informations[27].german;
        //     }
        //     else{
        //         text = scope.informations[27].content;
        //     }
        //     let info = new InformationElement(scope.scene,scope.font,infoPos,text);
        //     info.init();
        //     info.rotate("Y",-Math.PI/2);
        //     info.rotate("X",Math.PI/2);

        //     let rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI/2);
        //     rotation.multiply(lastCam.quaternion);

        //     gsap.to({},{
        //         duration:1,
        //         onStart: scope.controls.enabled = false,
        //         onUpdate: function(){
        //             scope.camera.quaternion.slerp(rotation,this.progress());
        //         },
        //     })

        //     let objects = [];
        //     objects.push(info.bbox);

        //     window.addEventListener('pointerdown',  function handler(event) {
        //         scope.onPointerDownInfo(event, objects, function(){
        //             gsap.to({},{
        //                 duration:1,
        //                 onUpdate: function(){
        //                     scope.camera.quaternion.slerp(lastCam.quaternion,this.progress());
        //                 },
        //                 onComplete: function(){
        //                     scope.informationPhase = false;
        //                     document.removeEventListener('pointerdown',handler);
        //                     scope.controls.enabled = true;
        //                 }
        //             })
        //         //using bind this because it is higher order function
        //         //https://stackoverflow.com/a/59060545
        //         }.bind(this))}); 
            

        // }
        ////#endregion

        else if(infoNumber === infoSegmentsDone[17]){
            customViewingDist.set(10,0,2);
            customHtmlPos.set(0.1,0.5);
            infoAsHtml(28,{position:customHtmlPos});

            infoPos.copy(camera.position);
            infoPos.y = 2 + scope.controls.offset;
            infoPos.add(customViewingDist)

            let img = addImage('bamf_training_p50_result.png',infoPos,new THREE.Vector3(1.7,2,0.2));
            img.rotateY(THREE.MathUtils.degToRad(50));

            gsap.from(img.position,{
                duration:1,
                x:infoPos + 200
            })

        }
        
        else if(infoNumber === infoSegmentsDone[18]){
            customViewingDist.set(30,0,15);
            infoFlyingToCam(29,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(240)})

            
        }

        else if(infoNumber === infoSegmentsDone[19]){
            customViewingDist.set(30,0,50);
            infoFlyingToCam(30,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(240),moveInfoBack:false})

            
        }

        //flying higher
        else if(infoNumber === infoSegmentsDone[31]){
            customHtmlPos.set(0.5,0.5)
            infoAsHtml(31,{position:customHtmlPos,scale:2});
            scope.infoFollowPath = true;

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

            let img = addImage('map_arabian_dialects.png',infoPos,new THREE.Vector3(4,2.2,0.2));
            img.rotateY(THREE.MathUtils.degToRad(90));

            gsap.from(img.position,{
                duration:2,
                y:0,
                x:infoPos - 10
            })
            
        }

        else if(infoNumber === infoSegmentsDone[33]){
            customViewingDist.set(-30,0,50);
            infoOverPath(33,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(0)})

            
        }

        else if(infoNumber === infoSegmentsDone[34]){
            customViewingDist.set(30,0,15);
            infoOverPath(34,{useQuaternion:false,height:-40,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(90)})

            
        }

        else if(infoNumber === infoSegmentsDone[35]){
            customHtmlPos.set(0.5,0.5)
            infoAsHtml(35,{position:customHtmlPos});
            scope.infoFollowPath = true;

            
        }

        else if(infoNumber === infoSegmentsDone[36]){
            customViewingDist.set(60,0,-30);
            infoFlyingToCam(36,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(300)})

            
        }

        else if(infoNumber === infoSegmentsDone[37]){
            customViewingDist.set(0,0,30);
            infoOverPath(37,{useQuaternion:false,height:-20,viewingDist:customViewingDist})

            
        }

        //flying lower again
        else if(infoNumber === infoSegmentsDone[38]){
            customHtmlPos.set(0.8,0.3)
            infoAsHtml(38,{scale:1.5,position:customHtmlPos});
            scope.infoFollowPath = true;

            gsap.to(scope.controls,{
                duration: 10,
                ease: "power4",
                offset: 15,
                lookFar: 500
            })
            gsap.to(scope.scene.fog,{
                duration:1,
                density:0.002
            })

            
        }

        //#endregion done
        else if(infoNumber === infoSegmentsDone[16]){
            customViewingDist.set(30,0,15);
            infoAsHtml(27,{scale:1.3,position:customHtmlPos});

            scope.infoFollowPath = true;

            //showingReferences(); //delete later
        }

        else if(infoNumber === infoSegmentsDone[17]){
            customHtmlPos.set(0.5,0.5)
            infoAsHtml(28,{scale:1.3,position:customHtmlPos});

            scope.infoFollowPath = true;
        }

        // else if(infoNumber === infoSegmentsDone[18]){
        //     customHtmlPos.set(0.5,0.5)
        //     infoAsHtml(29,{scale:1.3,position:customHtmlPos});
        // }

        // else if(infoNumber === infoSegmentsDone[19]){
        //     customHtmlPos.set(0.5,0.5)
        //     infoAsHtml(30,{scale:1.6,position:customHtmlPos});
        // }

        // else if(infoNumber === infoSegmentsDone[20]){
        //     customHtmlPos.set(0.5,0.5)
        //     infoAsHtml(31,{scale:2,position:customHtmlPos});
        // }

        else if (infoNumber === infoSegmentsDone[18]){

            infoPos.set(0, 9000, 0);
            let text = scope.informations[29].content;
            let info = new InformationElement(scope.scene,scope.font,infoPos,text);
            info.init();
            info.rotate("X",-Math.PI/2);

            aabb.setFromObject(info.getMeshObject() );
            customViewingDist.set(0,30,0);
            let center = aabb.getCenter( new THREE.Vector3() ).add(customViewingDist);

            const tl = gsap.timeline();
            lastCam.copy(scope.camera);
            
            tl.to(scope.camera.rotation,{
                duration: 2,
                ease: "none",
                x: -THREE.MathUtils.degToRad(90) + 0.5,
                z: 0,
                onStart: scope.controls.enabled = false,
                onComplete: function(){
                    scope.camera.far = 1000000;
                    scope.camera.updateProjectionMatrix();
                }
            })
            tl.to(scope.scene.fog,{duration:1,density:0},"-=1")
  
            tl.to( scope.camera.position, {
              duration: 3,
              ease: "power4",
              x: center.x,
              y: center.y,
              z: center.z,
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

            text = scope.informations[45].content;
            let info2 = new InformationElement(scope.scene,scope.font,infoPos,text);
            info2.init();
            info2.rotate("X",-Math.PI/2);
            info2.translate(customViewingDist.set(0,0,-100));

            tl.from(info2.obj.position,{
                duration:1,
                y:0,
                onComplete: function(){
                    let objects = [];
                    objects.push(info.bbox);

                    window.addEventListener('pointerdown',function(event){
                        scope.onPointerDownInfo(event, objects, function(){
                            showingReferences();
                        })
                    })
                }
            })
        }

    }

    function findAudio(path){
        let audioFile = undefined;
        for (let i = 0; i < audios.length; i++) {
            if(audios[i].path.includes(path)){
                console.log(audios[i].path);
                audioFile = audios[i].audio;
            }
        }
        const sound = new THREE.PositionalAudio(scope.scene.getObjectByName("listener"));
        sound.setBuffer(audioFile);
        return sound;
    }

    this.onPointerDownInfo = function(event,obj,onIntersection){
        mouse.x = ( event.offsetX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.offsetY / window.innerHeight ) * 2 + 1;

        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera( mouse, camera );

        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(obj);

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
            console.log(controlsSegment/2);

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

        //if one element is skipped, place a new trigger for it at the next segment
        else if(scope.controls.resetCam && infoSegments[0]<controlsSegment){
            while (infoSegments[0]<controlsSegment){
                console.log("i am already here",controlsSegment);
                console.log("so I skipped this info",infoSegments[0]);
                infoSegments.shift();
                infoSegments.unshift(controlsSegment+2);
            }
        }
    }


}

export {InformationManager}