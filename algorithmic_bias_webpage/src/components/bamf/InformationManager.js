"use strict";

import * as THREE from "three";
import {gsap} from 'gsap';
import { InformationElement } from './InformationElement.js';

let InformationManager = function(scene,domElement,camera,informations,font,cameraHelper,cameraEye){
    
    this.informationPhase = false;

    this.scene = scene;
    this.domElement = domElement;
    this.camera = camera;
    this.informations = informations;
    this.font = font;
    this.cameraEye = cameraEye;
    this.cameraHelper = cameraHelper;

    let scope = this;

    let infoSegments = [12,20,30,40];
    let infoSegmentsDone = [];
    let infoPos = new THREE.Vector3();

    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    //const windowSize = new THREE.Vector2( scope.domElement.offsetWidth, scope.domElement.offsetHeight);

     //#region GSAP transitions
    
    // function beforeEnterInfo(el) {
    //     gsap.set(el, {
    //       scaleX: 0,
    //       scaleY: 0,
    //       opacity: 0
    //     })
    //   }
    // function enterInfo(el,done){
    //        gsap.to(".info",{
    //           duration: 1,
    //           scaleX: 1,
    //           scaleY: 1,
    //           opacity:1,
    //           y: windowSize.y/2,
    //           x: windowSize.x/4,
    //           onComplete: done
    //       })
    // }
    // function stopInfo(){
    //       if(scopeinformationPhase){
    //           if (scope.infoElement2){
    //                scope.infoElement2 = false;
    //           }
    //       console.log("clicked on elem");
    //       }
    //   }
      
    // function leaveInfo(){
    //       gsap.to(".info",{
    //           duration: 1,
    //           scaleX: 0,
    //           scaleY: 0,
    //           opacity: 0,
    //           onComplete: scope.informationPhase = false,
    //       })
    //   }
    
      function camToObject(object){
  
          let aabb = new THREE.Box3().setFromObject( object );
          let center = aabb.getCenter( new THREE.Vector3() );
          //var size = aabb.getSize( new THREE.Vector3() );
  
          gsap.to( scope.camera.position, {
              duration: 1,
              ease: "power4",
              x: center.x,
              y: center.y,
              z: center.z + 50, // maybe adding even more offset depending on your model
              onUpdate: function() {
                  scope.camera.lookAt( center );
                  scope.cameraHelper.update();
                  scope.cameraEye.position.copy( scope.camera.position );
                  //console.log("camera moved up");
              }
          });  
      }
      //#endregion

    function manageInfo(infoNumber){
        //FIRST INFO ELEMENT
		if (infoNumber === infoSegmentsDone[0]){
			console.log("infoPhase 1");

			//setting info Position
            let lastCam = new THREE.Camera();
            lastCam.copy(scope.camera);
           
            infoPos = (new THREE.Vector3( 0, 0, -30 )).applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
            infoPos.y = 50;
            let text = scope.informations[0].content;
            let info2 = new InformationElement(scope.scene,scope.font,infoPos,text);
            info2.init();

            camToObject(info2.getMeshObject());
            let objects = [];
            objects.push(info2.bbox);

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

        //TODO: fix the html transition
        // else if (infoNumber === infoSegmentsDone[1]){
        //     console.log("window",windowSize);
        //     scope.infoElement2 = true;
        // }

        else if (infoNumber === infoSegmentsDone[1]){

            infoPos = (new THREE.Vector3( 0, 0, -30 )).applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
            infoPos.y = 15;
            let text = scope.informations[2].content;
            let info = new InformationElement(scope.scene,scope.font,infoPos,text,scope.informations[2].isImage);
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
                    onComplete: function(){
                        scope.informationPhase = false;
                        console.log("informationPhase is false");
                        console.log(scope);}
                })
            //using bind this because it is higher order function
            //https://stackoverflow.com/a/59060545
            }.bind(this)));


        }

        else if(infoNumber === infoSegmentsDone[2]){
            let lastCam = new THREE.Camera();
            lastCam.copy(scope.camera);

            infoPos = new THREE.Vector3(-50, 50, 400);
            let text = scope.informations[3].content;
            let info = new InformationElement(scope.scene,scope.font,infoPos,text);
            info.init();

            scope.camToObject(info.getMeshObject());
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

    this.onPointerDownInfo = function(event,obj,onIntersection){
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