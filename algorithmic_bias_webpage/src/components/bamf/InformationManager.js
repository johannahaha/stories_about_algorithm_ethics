"use strict";

import * as THREE from "three";
import {gsap} from 'gsap';
import { InformationElement } from './InformationElement.js';
import {AudioElement} from './AudioElement.js'

let InformationManager = function(scene,domElement,camera,controls,informations,font,models,audios,cameraHelper,cameraEye){
    
    this.informationPhase = false;
    this.htmlInformation = false;
    this.htmlInfoId = 0;

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

    let infoSegments = [12,20,30,40,50,60,70,80,90,100,110,120,130,140];
    //let infoSegments = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
    let infoSegmentsDone = [];
    let infoPos = new THREE.Vector3();

    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    const cam = new THREE.Vector3();
    const defaultStartVector = new THREE.Vector3(0,0,-30);
    const defaultViewingDist = new THREE.Vector3(0,0,50);
    const customStartVector = new THREE.Vector3();
    const customViewingDist = new THREE.Vector3();
    const aabb = new THREE.Box3();
    const lastCam = new THREE.Camera();
    
    function camToObject(object,viewingDist,rotateCam = false, rotation = undefined,onComplete){
  
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
                    console.log("START",camera.rotation.x);
                },
                onUpdate: function() {
                    //scope.camera.lookAt( center );
                    scope.cameraHelper.update();
                    //scope.cameraEye.position.copy( scope.camera.position );
                    //console.log("camera moved up");
                },
                onComplete: function(){
                    scope.controls.resetMouse();
                    scope.controls.enable = true;
    
                    console.log("DONE",camera.rotation.x);
                }
              })
          }


          gsap.to( scope.camera.position, {
            duration: 3,
            ease: "power4",
            x: center.x,
            y: center.y,
            z: center.z, // maybe adding even more offset depending on your model
            onUpdate: function() {
                //scope.camera.lookAt( center );
                scope.cameraHelper.update();
                scope.cameraEye.position.copy( scope.camera.position );
                //console.log("camera moved up");
            },
            onComplete: function(){
                if (typeof onComplete === 'function'){
                    onComplete();
                }
            }
        }, ); 
      }

      //TODO SCALE
    function infoOverPath(id,{startVector = defaultStartVector,viewingDist = defaultViewingDist,onComplete} = {}){
        lastCam.copy(scope.camera);
        
        infoPos = startVector.applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
        infoPos.y = 50;
        let text = scope.informations[id].content;
        let scale = scope.informations[id].scale;
        let info2 = new InformationElement(scope.scene,scope.font,infoPos,text,false,scale);
        info2.init();

        camToObject(info2.getMeshObject(),viewingDist,onComplete);
        let objects = [];
        objects.push(info2.bbox);
        console.log("objects",objects);

        window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, objects, function(){
            gsap.to( scope.camera.position,{
                duration: 2,
                ease: "power4",
                x: lastCam.position.x,
                y: lastCam.position.y,
                z: lastCam.position.z,
                onComplete: function(){
                    scope.informationPhase = false;
                    console.log("informationPhase is false");
                    console.log(scope);}
            })
        //using bind this because it is higher order function
        //https://stackoverflow.com/a/59060545
        }.bind(this))); 
    }

    function infoFlyingToCam(id,{startVector = defaultStartVector} = {}){
        infoPos = startVector.applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
        infoPos.y = 15;
        let text = scope.informations[id].content;
        let scale = scope.informations[id].scale;
        let info = new InformationElement(scope.scene,scope.font,infoPos,text,scope.informations[2].isImage,scale);
        info.init();

        gsap.from(info.obj.position,{
            duration: 2,
            x: infoPos.x - 100,
            y: 20,
            z: infoPos.z - 100,
        })
        let objects = []
        objects.push(info.bbox);
        window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, objects, function(){
            gsap.to( info.obj.position,{
                duration: 1,
                x: infoPos.x - 100,
                y: 20,
                z: infoPos.z - 100,
                onComplete: function(){scope.informationPhase = false}
            })
        //using bind this because it is higher order function
        //https://stackoverflow.com/a/59060545
        }.bind(this)));
    }

    function infoAsHtml(id,{scale = 1}={}){
        scope.htmlInformation = true;
        scope.htmlInfoId = id;
        scope.htmlScale = scale;
        console.log("html information",scope.htmlInformation);
    }

    function manageInfo(infoNumber){
        //DONE
		if (infoNumber === infoSegmentsDone[0]){
			console.log("infoPhase 1");

			//setting info Position
            infoOverPath(0);
        }

        //TODO: fix the html transition leave
        else if (infoNumber === infoSegmentsDone[1]){
            //console.log("window",windowSize);
            //scope.infoElement2 = true;
           infoAsHtml(1,{scale:1.2});

        }

        //TODO: bamf positioning next to path
        //TODO: bamf not gsap animated
        //bamf model in here
        else if (infoNumber === infoSegmentsDone[2]){
            customStartVector.set(-30,0,0)
            infoFlyingToCam(2,{startVector:customStartVector});
            //infoPos = new THREE.Vector3( 20, 20, -20 ).applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
            let bamf = models[0].scene;
            console.log("bamf",bamf);
            //bamf.material.metalness = 0;
            infoPos = customStartVector.set(-30,0,0).applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
            infoPos.y = 15;
            bamf.position.set(infoPos.x - 100 ,infoPos.y,infoPos.z - 100);
            bamf.scale.set(5,5,5);
            //bamf.rotation.y = Math.PI/2
            console.log(models[0])

            scope.scene.add(models[0].scene);



        }

        //DONE
        //global see german border
        else if(infoNumber === infoSegmentsDone[3]){
            lastCam.copy(scope.camera);

            infoPos.set(lastCam.position.x, 5000, lastCam.position.z);
            let text = scope.informations[3].content;
            let info = new InformationElement(scope.scene,scope.font,infoPos,text);
            info.init();
            info.rotate("X",-Math.PI/2);
            customStartVector.set(0,100,0)
            camToObject(info.getMeshObject(),customStartVector,true,new THREE.Vector3(-Math.PI/2,0,0));
            let objects = [];
            objects.push(info.bbox);

            window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, objects, function(){
                gsap.to( scope.camera.position,{
                    duration: 2,
                    ease: "power4",
                    x: lastCam.position.x,
                    y: lastCam.position.y,
                    z: lastCam.position.z,
                    onComplete: function(){scope.informationPhase = false}
                })
            //using bind this because it is higher order function
            //https://stackoverflow.com/a/59060545
            }.bind(this))); 
        }

        //DONE, maybe place in center or somewhere else
        else if(infoNumber === infoSegmentsDone[4]){
            infoAsHtml(4);
        }

        //TODO: more centered over path
        else if(infoNumber === infoSegmentsDone[5]){
            cam.set(0,0,-1);
            camera.getWorldDirection(cam);
            cam.y = 0;
            console.log("cam",cam);
            console.log("cam 30",cam.addScalar(30));
            customViewingDist.set(20,0,20)
            infoOverPath(5,{startVector:cam.addScalar(30),viewingDist: customViewingDist})
            //infoOverPath(5,new THREE.Vector3(30,0,30));
        }

        //DONE, same as 4
        else if(infoNumber === infoSegmentsDone[6]){
            infoAsHtml(6);
        }

        //TODO: bad, this is really bad. Position in front of me please. Z is doing something here.
        else if(infoNumber === infoSegmentsDone[7]){
            cam.set(0,0,0)
            camera.getWorldDirection(cam);
            infoFlyingToCam(7,{viewingDist:cam.addScalar(20)});
        }

        //audio in here
        else if(infoNumber === infoSegmentsDone[8]){
            customStartVector.set(-30,0,0);
            customViewingDist.set(50,0,0);

            infoOverPath(8,{startVector:customStartVector,viewingDist:customViewingDist})//onComplete:function(){
            //         let cross = new THREE.Vector3();
            //         camera.getWorldDirection(cross);
            //         cross.cross(camera.up);
            //         console.log("cross",cross);
            //         // console.log("infoPos",infoPos);
            //         let irishPos = camera.clone().position.addScaledVector(cross,5);
            //         let irish = new AudioElement(audios[0],"#222a8f");
            //         console.log("irish",irishPos);
            //         irish.place(scene,camera.children[0],irishPos);

            //         window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, [irish.getMesh()], function(){
            //             irish.play();
            //         }.bind(this)));
            //     }
            // });
        }
        
        else if(infoNumber === infoSegmentsDone[9]){
            infoAsHtml(9);
        }

        //audio in here
        else if(infoNumber === infoSegmentsDone[10]){
            infoFlyingToCam(10,{startVector:new THREE.Vector3( 0, 0, -30 )})
            // infoPos = (new THREE.Vector3( 0, 0, -30 )).applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
            // infoPos.y = 20;
            // let text = scope.informations[10].content;
            // let info = new InformationElement(scope.scene,scope.font,infoPos,text);
            // info.init();        

            let cross = new THREE.Vector3();
            camera.getWorldDirection(cross);
            cross.cross(camera.up);
            console.log("cross",cross);
            // console.log("infoPos",infoPos);
            let irishPos = camera.clone().position.addScaledVector(cross,5);
            let irish = new AudioElement(audios[0],"#222a8f");
            console.log("irish",irishPos);
            irish.place(scene,camera.children[0],irishPos);

            window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, [irish.getMesh()], function(){
                irish.play();
            }.bind(this)));

            let scottish = new AudioElement(audios[1],"#3a8f22");
            let scottishPos = camera.clone().position.addScaledVector(cross,-5);
            console.log("scottish",scottishPos);
            scottish.place(scene,camera.children[0],scottishPos);

            window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, [scottish.getMesh()], function(){
                scottish.play();
            }.bind(this)));

            // window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, [info.bbox], function(){
            //     scope.informationPhase = false;
            // }.bind(this)));

            console.log("scene",scene)
        }

        else if(infoNumber === infoSegmentsDone[11]){
            cam.set(0,0,0);
            camera.getWorldDirection(cam);
            infoFlyingToCam(7,{viewingDist:cam.addScalar(50)});
        }

        else if(infoNumber === infoSegmentsDone[12]){
            cam.set(0,0,0);
            camera.getWorldDirection(cam);
            infoOverPath(12,{startVector:new THREE.Vector(-30,0,0),viewingDist:cam.addScalar(20)});
        }
        

        else if (infoNumber === infoSegmentsDone[30]){
            infoPos = (new THREE.Vector3( 0, 0, -30)).applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
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
            console.log(infoSegments);
            //controls.stop();
            this.informationPhase = true;
            manageInfo(info);
        }
    }


}

export {InformationManager}