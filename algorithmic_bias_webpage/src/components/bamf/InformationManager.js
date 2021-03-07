"use strict";

import * as THREE from "three";
import {gsap} from 'gsap';
import { InformationElement } from './InformationElement.js';
//import {AudioElement} from './AudioElement.js'

let InformationManager = function(scene,domElement,camera,controls,informations,font,models,audios,cameraHelper,cameraEye){
    
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

    let infoSegments = [20,40,920,970,1000,1050,1090,1120,1200,1230,1300,1370,1410,1450,1490,1530,1580]
    //let infoSegments = [20,40,70,100,120,140,170,220,250,300,330,370,400,450,480,500,550,600,620,660,705,820,850,890,920,970,1000,1050,1090,1120];
    let infoSegmentsDone = [];
    let infoPos = new THREE.Vector3();

    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    //const windowSize = new THREE.Vector2( scope.domElement.offsetWidth, scope.domElement.offsetHeight);

    const cam = new THREE.Vector3();
    const defaultStartVector = new THREE.Vector3(0,0,-30);
    const defaultViewingDist = new THREE.Vector3(0,0,50);
    const defaultHtmlPos = new THREE.Vector2(50,0);
    //const customStartVector = new THREE.Vector3();
    const customViewingDist = new THREE.Vector3();
    //const customHtmlPos = new THREE.Vector2();
    const aabb = new THREE.Box3();
    const lastCam = new THREE.Camera();
    
    function camToObject(object,viewingDist,{rotateCam = false, rotation = undefined,onComplete}  = {} ){
  
          aabb.setFromObject( object );
          let center = aabb.getCenter( new THREE.Vector3() ).add(viewingDist);
          //var size = aabb.getSize( new THREE.Vector3() );
          
          if (rotateCam & rotation !== undefined){
            gsap.to(scope.camera.rotation,{
                duration: 1,
                ease: "none",
                x: rotation.x,
                y: rotation.y,
                z: rotation.z,
                onStart: function(){
                    scope.controls.enable = false;
                },
                onUpdate: function() {
                    //scope.camera.lookAt( center );
                    scope.cameraHelper.update();
                    //scope.cameraEye.position.copy( scope.camera.position );
                    //console.log("camera moved up");
                },
                onComplete: function(){
                    //scope.controls.resetMouse();
                    scope.controls.enable = true;
                }
              })
          }

          gsap.to( scope.camera.position, {
            duration: 3,
            ease: "power4",
            x: center.x,
            y: center.y,
            z: center.z, // maybe adding even more offset depending on your model
            onStart: function(){
                scope.controls.enable = false;
            },
            onUpdate: function() {
                //scope.camera.lookAt( center );
                scope.cameraHelper.update();
                scope.cameraEye.position.copy( scope.camera.position );
                //console.log("camera moved up");
            },
            onComplete: function(){
                if (typeof onComplete === 'function'){
                    onComplete(object);
                }
                //scope.controls.resetMouse();
                scope.controls.enable = true;
            }
        }, ); 
      }

      //TODO SCALE
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
            let debug = new THREE.Vector3()
            debug.copy(startVector)
            //console.log("quaternion")
            //console.log(JSON.parse(JSON.stringify(debug.applyQuaternion(scope.camera.quaternion))));
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

        camToObject(info.getMeshObject(),viewingDist,{onComplete: afterCamToInfo});
        let objects = [];
        objects.push(info.bbox);

        //good for testing, but this should only be added when info is done animating
        window.addEventListener('pointerdown', function handler(event){ 
            scope.onPointerDownInfo(event, objects, function(){
                gsap.to( scope.camera.position,{
                    duration: 2,
                    ease: "power4",
                    x: lastCam.position.x,
                    y: lastCam.position.y,
                    z: lastCam.position.z,
                    onStart: function(){
                        scope.controls.enable = false;
                    },
                    onComplete: function(){
                        if (typeof onComplete === 'function'){
                            //console.log("custom leaving function");
                            onLeavingInfo();
                        }
                        scope.informationPhase = false;
                        //console.log("informationPhase is false");
                        //console.log(scope);
                        //scope.controls.resetMouse();
                        scope.controls.enable = true;
                        }
                })
        //using bind this because it is higher order function
        //https://stackoverflow.com/a/59060545
            })
            window.removeEventListener('pointerdown', handler);
        }.bind(this)); 

        return info.getMeshObject();
    }

    function infoFlyingToCam(id,{startVector = defaultStartVector,
                                viewingDist = defaultViewingDist,
                                useQuaternion = true,   
                                delay = 0,
                                infoRotAxis,
                                infoRotAngle,
                                moveInfoBack = true} = {}){
        //infoPos = startVector.applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
        if (useQuaternion){
            infoPos = startVector.applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
            let debug = new THREE.Vector3()
            debug.copy(startVector)
            //console.log("quaternion")
            //console.log(JSON.parse(JSON.stringify(debug.applyQuaternion(scope.camera.quaternion))));
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
                //console.log("completed animation");
                let objects = []
                objects.push(info.bbox);
                window.addEventListener('pointerdown', function handler(event){
                        scope.onPointerDownInfo(event, objects, function(){
                            if (moveInfoBack){
                                gsap.to( info.obj.position,{
                                    duration: 1,
                                    x: infoPos.x - 100,
                                    y: 20,
                                    z: infoPos.z - 100,
                                    onStart: function(){
                                        scope.controls.enable = false;
                                    },
                                    onComplete: function(){
                                        scope.informationPhase = false;
                                        //scope.controls.resetMouse();
                                        scope.controls.enable = true;
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
                window.removeEventListener('pointerdown', handler);        
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

        // if(keepFollowingPath > 0){
        //     scope.infoFollowPath = true;
        // }

        console.log(camera.rotation);
        cam.set(0,0,0);
    }

    function addAxesHelper(){
        let helperGeo = new THREE.SphereBufferGeometry(0.03);
        let helper = new THREE.Mesh(helperGeo, new THREE.MeshBasicMaterial({color:0xff0000}));
        console.log(helper);
        helper.position.x = camera.position.x + 0.5;
        helper.position.y = camera.position.y;
        helper.position.z = camera.position.z + 0.5;
        scene.add(helper);
        var axesHelper = new THREE.AxesHelper(1);
        helper.add( axesHelper );
    }

    //TODO: sometimes it is somehow losing the counter and the informations are not triggered anymore.
    function manageInfo(infoNumber){
        //DONE
		if (infoNumber === infoSegmentsDone[0]){
			console.log("infoPhase 1");

			//setting info Position
            infoOverPath(0);
        }

        //DONE
        else if (infoNumber === infoSegmentsDone[1]){
            //console.log("window",windowSize);
            //scope.infoElement2 = true;
            infoAsHtml(1,{scale:1.2});

            infoPos.copy(camera.position);
            infoPos.z += -20;
            infoPos.y = 2 + scope.controls.offset;

            let info = new InformationElement(scope.scene,scope.font,infoPos,"/img/Bamf2017_Schulung_Seite_050.png",true,1);
            info.init();
            //info.rotate("Y",-Math.PI/2);

            customViewingDist.set(0,0,30);

            camToObject(info.getMeshObject(),customViewingDist);
            // scope.infoFollowPath = true;
            // console.log("keep following path");

        }

        //#region done

        // //TODO: bamf positioning next to path
        // //TODO: bamf not gsap animated
        // //bamf model in here
        // else if (infoNumber === infoSegmentsDone[2]){
        //     customStartVector.set(0,0,-20);
        //     infoFlyingToCam(2,{startVector:customStartVector});
        //     infoPos = new THREE.Vector3( 20, 20, -20 ).applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
        //     let bamf = models[0].scene;
        //     console.log("bamf",bamf);
        //     //bamf.material.metalness = 0;
        //     infoPos.set(-30,0,0).applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
        //     infoPos.y = 15;
        //     bamf.position.set(infoPos.x - 100 ,infoPos.y,infoPos.z - 100);
        //     bamf.scale.set(5,5,5);
        //     //bamf.rotation.y = Math.PI/2
        //     console.log(models[0])

        //     scope.scene.add(models[0].scene);
        // }

        // //DONE
        // //global see german border
        // else if(infoNumber === infoSegmentsDone[3]){
        //     lastCam.copy(scope.camera);

        //     infoPos.set(lastCam.position.x, 5000, lastCam.position.z);
        //     let text = scope.informations[3].content;
        //     let info = new InformationElement(scope.scene,scope.font,infoPos,text);
        //     info.init();
        //     info.rotate("X",-Math.PI/2);
        //     customStartVector.set(0,100,0)
        //     camToObject(info.getMeshObject(),customStartVector,{rotateCam:true,rotation:new THREE.Vector3(-Math.PI/2,0,0)});
        //     let objects = [];
        //     objects.push(info.bbox);

        //     window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, objects, function(){
        //         gsap.to( scope.camera.position,{
        //             duration: 2,
        //             ease: "power4",
        //             x: lastCam.position.x,
        //             y: lastCam.position.y,
        //             z: lastCam.position.z,
        //             onComplete: function(){scope.informationPhase = false}
        //         })
        //     //using bind this because it is higher order function
        //     //https://stackoverflow.com/a/59060545
        //     }.bind(this))); 
        // }

        // //DONE, maybe place in center or somewhere else
        // else if(infoNumber === infoSegmentsDone[4]){
        //     customHtmlPos.set(50,50)
        //     infoAsHtml(4,{position:customHtmlPos});
        // }

        // //DONE
        // else if(infoNumber === infoSegmentsDone[5]){
        //     const angle = Math.PI/2;
        //     customViewingDist.set(27,0,-9);
        //     console.log(JSON.parse(JSON.stringify(customViewingDist)));
        //     infoOverPath(5,{useQuaternion:false,viewingDist: customViewingDist,infoRotAxis:"Y",infoRotAngle:angle})
        // }

        //DONE
        // else if(infoNumber === infoSegmentsDone[1]){
        //     infoAsHtml(6,{scale:3});
        //     scope.infoFollowPath = true;
        //     //when the speed is lower, I want to make the delay 10.
        //     gsap.to(scope.controls,{
        //         duration: 1,
        //         ease: "power3",
        //         offset: 60,
        //         lookFar:60
        //     })
        // }

        // //DONE
        // else if(infoNumber === infoSegmentsDone[7]){
        //     customViewingDist.set(-7.5,-7.5,-38);
        //     infoFlyingToCam(7,{useQuaternion:false,viewingDist:customViewingDist,delay:2})
        // }

        // //TODO: place audio at correc tspace
        // else if(infoNumber === infoSegmentsDone[8]){

        //     customViewingDist.set(29.1,0,29.5);

        //     infoOverPath(8,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:Math.PI/2,height:-10,afterCamToInfo:function(object){
        //             //let cross = new THREE.Vector3(center.x,center.y,center.z);
        //             //camera.getWorldDirection(cross);
        //             //center.cross(camera.up);
        //             //console.log("new center", center);
        //             //console.log("cross",cross);
        //             // console.log("infoPos",infoPos);
        //             //let irishPos = camera.clone().position.add(center);
        //             let irish = new AudioElement(audios[0],"#222a8f");
        //             //console.log("irish",irishPos);
        //             irish.place(camera.children[0],object,{y:1});

        //             window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, [irish.getMesh()], function(){
        //                 irish.play();
        //             }.bind(this)));
        //         }
        //     });
        // }
        
        // //TODO: maybe keep following path a bit while reading this
        // else if(infoNumber === infoSegmentsDone[9]){
        //     customHtmlPos.set(windowSize.x/4,0);
        //     infoAsHtml(9,{scale:2});
        //     scope.infoFollowPath = true;
        // }

        // //audio in here
        // else if(infoNumber === infoSegmentsDone[10]){
        //     customViewingDist.set(-24,-8,-15);
        //     let infoParent = infoFlyingToCam(10,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:Math.PI/2,infoRotAxis:"Y"})
        //     let irish = new AudioElement(audios[0],"#222a8f");
        //     irish.place(camera.children[0],infoParent,{y:1,x:0.1,z:-1,distance:1});

        //     window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, [irish.getMesh()], function(){
        //         irish.play();
        //     }.bind(this)));

        //     let scottish = new AudioElement(audios[1],"#3a8f22");
        //     scottish.place(camera.children[0],infoParent,{y:1,x:-0.1,z:-1,distance:1});

        //     window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, [scottish.getMesh()], function(){
        //         scottish.play();
        //     }.bind(this)));

        //     console.log(scope.controls.getClock());

        //     //this is because here comes a steap curve and otherwise the rotation is messed up.
        //     //this was the most efficient fix.
        //     scope.controls.enableMouseControl = false;

        // }

        // else if(infoNumber === infoSegmentsDone[11]){
        //     //scope.controls.resetMouse();
        //     //scope.controls.enableMouseControl = true;
        //     cam.set(0,0,0);
        //     camera.getWorldDirection(cam);
        //     console.log("cam 11", cam);
        //     customViewingDist.set(-30,0,15);
        //     const angle = THREE.MathUtils.degToRad(110)
        //     infoFlyingToCam(11,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:angle,infoRotAxis:"Y"});
        // }

        // else if(infoNumber === infoSegmentsDone[12]){
        //     cam.set(0,0,0);
        //     camera.getWorldDirection(cam);
        //     console.log("cam 12", cam.multiplyScalar(30));
        //     customViewingDist.set(-7,0,-30);
        //     infoOverPath(12,{height:-20,useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:Math.PI,infoRotAxis:"Y"});
        //     //infoAsHtml(12,{scale:1.5})
        // }
        
        // else if(infoNumber === infoSegmentsDone[13]){
        //     cam.set(0,0,0);
        //     camera.getWorldDirection(cam);
        //     console.log("cam 13", cam);
        //     customViewingDist.set(10,0,30);
        //     infoFlyingToCam(13,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:Math.PI,infoRotAxis:"Y"});
        //     //infoAsHtml(13,{scale:1.5})
        // }
        // else if(infoNumber === infoSegmentsDone[14]){
        //     infoAsHtml(14,{scale:1.5})
        // }
        // else if(infoNumber === infoSegmentsDone[15]){
        //     infoAsHtml(15,{scale:1.5})
        //     scope.infoFollowPath = true;
        //     //make duration longer later
        //     gsap.to(scope.controls,{
        //         duration: 1,
        //         ease: "power2",
        //         offset: 15,
        //         lookFar:30
        //     })
        // }
        // else if(infoNumber === infoSegmentsDone[16]){
        //     cam.set(0,0,0);
        //     camera.getWorldDirection(cam);
        //     console.log("cam 16", cam);
        //     customViewingDist.set(-20,0,20);
        //     infoFlyingToCam(16,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:Math.PI,infoRotAxis:"Y",moveInfoBack:false})
        // }

        // else if(infoNumber === infoSegmentsDone[17]){
        //     cam.set(0,0,0);
        //     camera.getWorldDirection(cam);
        //     console.log("cam 17", cam);
        //     customViewingDist.set(0,0,-80);
        //     infoOverPath(17,{useQuaternion:false,viewingDist:customViewingDist,height:30,infoRotAngle:Math.PI,infoRotAxis:"Y"})
        // }

        // else if(infoNumber === infoSegmentsDone[2]){
        //     cam.set(0,0,0);
        // //     camera.getWorldDirection(cam);
        // //     console.log("cam 17", cam);
            
        //     customViewingDist.set(10,0,-30);
        //     infoOverPath(18,{useQuaternion:false,viewingDist:customViewingDist,height:30,infoRotAngle:Math.PI,infoRotAxis:"Y"})
        //     addAxesHelper();
        // }

        // else if(infoNumber === infoSegmentsDone[3]){
        //     cam.set(0,0,0);
        //     customViewingDist.set(-30,0,-15);
        //     infoAsHtml(19);
        //     addAxesHelper();
        // }

        // else if(infoNumber === infoSegmentsDone[2]){
            
        //     cam.set(0,0,0);

        //     customViewingDist.set(-20,0,-5);
        //     infoFlyingToCam(20,{useQuaternion:false,viewingDist:customViewingDist,height:30,infoRotAngle:Math.PI/3,infoRotAxis:"Y",moveInfoBack:false})

        //     addAxesHelper();
        // }

        // else if(infoNumber === infoSegmentsDone[3]){

        //     customViewingDist.set(30,0,-15);
        //     const angle = THREE.MathUtils.degToRad(130)
        //     infoOverPath(21,{useQuaternion:false,viewingDist:customViewingDist,height:10,infoRotAngle:angle,infoRotAxis:"Y"})
        //     addAxesHelper();
        // }

        // else if(infoNumber === infoSegmentsDone[4]){
           
        //     customViewingDist.set(0,0,-60);
        //     infoOverPath(22,{useQuaternion:false,viewingDist:customViewingDist,height:70,infoRotAngle:Math.PI,infoRotAxis:"Y"})
        //     addAxesHelper();
        // }

        // else if(infoNumber === infoSegmentsDone[5]){
        //     customViewingDist.set(30,0,40);
        //     infoFlyingToCam(23,{useQuaternion:false,viewingDist:customViewingDist,height:8,infoRotAngle:Math.PI,infoRotAxis:"Y",moveInfoBack:false})
        //     addAxesHelper();
        // }

        //#endregion done

        else if(infoNumber === infoSegmentsDone[2]){
            customViewingDist.set(-30,0,-15);
            infoAsHtml(24)
        }

        else if(infoNumber === infoSegmentsDone[3]){
            customViewingDist.set(-40,0,-35);
            infoOverPath(25,{useQuaternion:false,viewingDist:customViewingDist,height:10,infoRotAngle:THREE.MathUtils.radToDeg(90),infoRotAxis:"Y"});
            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[4]){
            customViewingDist.set(30,0,50);
            infoFlyingToCam(26,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:THREE.MathUtils.radToDeg(300),infoRotAxis:"Y"});
            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[5]){
            // customViewingDist.set(-30,0,-30);
            // infoOverPath(27,{useQuaternion:false,viewingDist:customViewingDist,infoRotAngle:THREE.MathUtils.radToDeg(240),infoRotAxis:"Y",infoTranslate:new Vector3(70,0,20)});
            // addAxesHelper();

            lastCam.copy(scope.camera);

            infoPos.set(lastCam.position.x, 100, lastCam.position.z);
            let text = scope.informations[27].content;
            let info = new InformationElement(scope.scene,scope.font,infoPos,text);
            info.init();
            info.rotate("Y",Math.PI);
            info.rotate("X",Math.PI/2);

            let rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2);
            rotation.multiply(lastCam.quaternion);
            console.log("rotation",rotation);

            //scope.camera.quaternion.rotateTowards(rotation,0.5);
            //scope.controls.resetMouse();

            //let t = {value:0.0};

            gsap.to({},{
                duration:1,
                onStart: scope.controls.enable = false,
                onUpdate: function(){
                    console.log(camera.quaternion.x);
                    scope.camera.quaternion.slerp(rotation,this.progress());
                    //scope.camera.quaternion.rotateTowards(rotation,t);
                },
                onComplete: function(){
                    console.log("cam on complete",camera.quaternion);
                    scope.controls.resetMouse(rotation);
                    //scope.controls.enable = true;
                }
            })

            console.log(scope.camera.quaternion);

            let objects = [];
            objects.push(info.bbox);

            window.addEventListener('pointerdown',  function handler(event) {
                scope.onPointerDownInfo(event, objects, function(){
                    gsap.to({},{
                        duration:1,
                        onStart: scope.controls.enable = false,
                        onUpdate: function(){
                            console.log(camera.quaternion.x);
                            scope.camera.quaternion.slerp(lastCam.quaternion,this.progress());
                            //scope.camera.quaternion.rotateTowards(rotation,t);
                        },
                        onComplete: function(){
                            scope.informationPhase = false;
                            document.removeEventListener('pointerdown',handler)

                        }
                    })
                //using bind this because it is higher order function
                //https://stackoverflow.com/a/59060545
                }.bind(this))}); 
            

        }

        else if(infoNumber === infoSegmentsDone[6]){
            customViewingDist.set(-30,0,-15);
            infoAsHtml(28);
        }
        
        else if(infoNumber === infoSegmentsDone[7]){
            customViewingDist.set(30,0,15);
            infoFlyingToCam(29,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(240)})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[8]){
            customViewingDist.set(30,0,50);
            infoFlyingToCam(30,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(240),moveInfoBack:false})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[9]){
            infoAsHtml(31);
            scope.infoFollowPath = true;

            //make that longer
            gsap.to(scope.controls,{
                duration: 1,
                ease: "power4",
                offset: 150,
                lookFar: 500
            })

        }

        else if(infoNumber === infoSegmentsDone[10]){
            customViewingDist.set(30,0,15);
            infoFlyingToCam(32,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(230)})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[11]){
            customViewingDist.set(-30,0,-15);
            infoOverPath(33,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(270)})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[12]){
            customViewingDist.set(-30,0,-15);
            infoOverPath(34,{useQuaternion:false,height:-40,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(270)})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[13]){
            customViewingDist.set(-30,0,-15);
            infoAsHtml(35);
            scope.infoFollowPath = true;

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[14]){
            customViewingDist.set(30,0,15);
            infoFlyingToCam(36,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(270)})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[15]){
            customViewingDist.set(-30,0,-15);
            infoOverPath(37,{useQuaternion:false,height:-20,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(270)})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[16]){
            customViewingDist.set(-30,0,-15);
            infoAsHtml(38);
            scope.infoFollowPath = true;

            //make that longer
            gsap.to(scope.controls,{
                duration: 1,
                ease: "power4",
                offset: 15,
                lookFar: 500
            })

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[17]){
            customViewingDist.set(-30,0,-15);
            infoOverPath(39,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(270)})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[17]){
            customViewingDist.set(-30,0,-15);
            infoOverPath(40,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(270)})

            addAxesHelper();
        }

        else if(infoNumber === infoSegmentsDone[17]){
            customViewingDist.set(-30,0,-15);
            infoOverPath(41,{useQuaternion:false,viewingDist:customViewingDist,infoRotAxis:"Y",infoRotAngle:THREE.MathUtils.degToRad(270)})

            addAxesHelper();
        }

        else if (infoNumber === infoSegmentsDone[30]){
            infoPos = defaultStartVector.applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
            infoPos.y = 10;
            let path = scope.informations[3].content;
            let info = new InformationElement(scope.scene,scope.font,infoPos,path,scope.informations[3].isImage);
            info.init();

            gsap.from(info.obj.position,{
                duration: 3,
                x: infoPos.x*5,
                y: infoPos.y*5
            })    

            let objects = [];
            objects.push(info.bbox);
            window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, objects, function(){
                gsap.to( info.obj.position,{
                    duration: 1,
                    x: infoPos.x*5,
                    y: infoPos.y*5,
                    onComplete: scope.informationPhase = false
                })
            }.bind(this)));
        }

    }

    //TO DO: maybe do loading of models and audio here?

    this.onPointerDownInfo = function(event,obj,onIntersection){
        mouse.x = ( event.offsetX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.offsetY / window.innerHeight ) * 2 + 1;

        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera( mouse, camera );

        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(obj);
        //const intersects = raycaster.intersectObjects(scene.children);

        for ( let i = 0; i < intersects.length; i ++ ) {
            intersects[ i ].object.material.color.set( 0xff0000 );
            if(typeof onIntersection !== undefined){
                onIntersection();
            }
        }
    }


    this.update = function(controlsSegment){
        if (infoSegments[0] === controlsSegment){
            let info = infoSegments.shift();
            infoSegmentsDone.push(info)
            //console.log(infoSegments);
            //controls.stop();
            this.informationPhase = true;

            //This can only be used with html informations, which makes sense.
            if(this.infoFollowPath){
                console.log("stop following path");
                this.infoFollowPath = false;
                let infoHtml = document.getElementById('info');
                console.log("info",infoHtml);
                if (infoHtml instanceof HTMLDivElement) {
                    console.log("clicking");
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