"use strict";

import * as THREE from "three";
import {gsap} from 'gsap';
import { InformationElement } from './InformationElement.js';
import {AudioElement} from './AudioElement.js'

let InformationManager = function(scene,domElement,camera,informations,font,models,audios,cameraHelper,cameraEye){
    
    this.informationPhase = false;
    this.htmlInformation = false;
    this.htmlInfoId = 0;

    this.scene = scene;
    this.domElement = domElement;
    this.camera = camera;
    this.informations = informations;
    this.font = font;
    this.models = models;
    this.audios = audios;
    this.cameraEye = cameraEye;
    this.cameraHelper = cameraHelper;

    let scope = this;

    let infoSegments = [12,20,30,40,50,60,70,80,90,100,110,120,130,140];
    let infoSegmentsDone = [];
    let infoPos = new THREE.Vector3();

    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    
    function camToObject(object){
  
          let aabb = new THREE.Box3().setFromObject( object );
          let center = aabb.getCenter( new THREE.Vector3() );
          //var size = aabb.getSize( new THREE.Vector3() );
  
          gsap.to( scope.camera.position, {
              duration: 1,
              ease: "power4",
              x: center.x,
              y: center.y +50,
              z: center.z, // maybe adding even more offset depending on your model
              onUpdate: function() {
                  scope.camera.lookAt( center );
                  scope.cameraHelper.update();
                  scope.cameraEye.position.copy( scope.camera.position );
                  //console.log("camera moved up");
              }
          }); 
          
        //   gsap.to(scope.camera.rotation,{
        //     duration: 1,
        //     ease: "power4",
        //     x: object.rotation.x,
        //     y: object.rotation.y,
        //     z: object.rotation.z, // maybe adding even more offset depending on your model
        //     onUpdate: function() {
        //         scope.camera.lookAt( center );
        //         scope.cameraHelper.update();
        //         scope.cameraEye.position.copy( scope.camera.position );
        //         //console.log("camera moved up");
        //     }
        //   })
      }

    function infoOverPath(id){
        let lastCam = new THREE.Camera();
        lastCam.copy(scope.camera);
        
        infoPos = (new THREE.Vector3( 0, 0, -30 )).applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
        infoPos.y = 50;
        let text = scope.informations[id].content;
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

    function infoFlyingToCam(id,startVector){
        infoPos = startVector.applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
        infoPos.y = 15;
        let text = scope.informations[id].content;
        let info = new InformationElement(scope.scene,scope.font,infoPos,text,scope.informations[2].isImage,0.2);
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

    function infoAsHtml(id){
        scope.htmlInformation = true;
        scope.htmlInfoId = id;
        console.log("html information",scope.htmlInformation);
    }

    function manageInfo(infoNumber){
        //FIRST INFO ELEMENT
		if (infoNumber === infoSegmentsDone[0]){
			console.log("infoPhase 1");

			//setting info Position
            infoOverPath(0);
        }

        //TODO: fix the html transition
        else if (infoNumber === infoSegmentsDone[1]){
            //console.log("window",windowSize);
            //scope.infoElement2 = true;
           infoAsHtml(1);

        }

        //bamf model in here
        else if (infoNumber === infoSegmentsDone[2]){
            infoFlyingToCam(2,new THREE.Vector3( 0, 0, -30 ));
            //infoPos = new THREE.Vector3( 20, 20, -20 ).applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
            let bamf = models[0].scene;
            console.log("bamf",bamf);
            //bamf.material.metalness = 0;
            infoPos = (new THREE.Vector3( -30, 0,0)).applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
            infoPos.y = 15;
            bamf.position.set(infoPos.x - 100 ,infoPos.y,infoPos.z - 100);
            bamf.scale.set(5,5,5);
            //bamf.rotation.y = Math.PI/2
            console.log(models[0])

            scope.scene.add(models[0].scene);



        }

        //global see german border
        else if(infoNumber === infoSegmentsDone[3]){
            let lastCam = new THREE.Camera();
            lastCam.copy(scope.camera);

            infoPos = new THREE.Vector3(lastCam.position.x, 5000, lastCam.position.z);
            let text = scope.informations[3].content;
            let info = new InformationElement(scope.scene,scope.font,infoPos,text);
            info.init();
            info.rotate("X",Math.PI/2);
            info.rotate("Z",-Math.PI/2);
            //info.rotate("Z",Math.PI/);
            const axesHelper = new THREE.AxesHelper( 30 );
            axesHelper.position.x = infoPos.x;
            axesHelper.position.y = infoPos.y;
            axesHelper.position.z = infoPos.z;
            scope.scene.add( axesHelper );
            console.log("axes",axesHelper);

            camToObject(info.getMeshObject());
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

        //audio in here
        else if(infoNumber === infoSegmentsDone[4]){
            infoPos = (new THREE.Vector3( 0, 0, -30 )).applyQuaternion( scope.camera.quaternion ).add( scope.camera.position );
            infoPos.y = 20;
            let text = scope.informations[4].content;
            let info = new InformationElement(scope.scene,scope.font,infoPos,text);
            info.init();

            // console.log(camera);

            // // let spheregeo = new THREE.SphereBufferGeometry(10, 12, 12);
            // // let sphere = new THREE.Mesh(spheregeo,new THREE.MeshPhongMaterial({color:0x961e68}))
            // // sphere.position.x = infoPos.x;
            // // sphere.position.y = infoPos.y + 5;
            // // sphere.position.z = infoPos.z;
        

            let cross = new THREE.Vector3();
            camera.getWorldDirection(cross);
            cross.cross(camera.up);
            console.log("cross",cross);
            // console.log("infoPos",infoPos);
            let irishPos = camera.clone().position.addScaledVector(cross,5);
            let irish = new AudioElement(audios[0]);
            console.log("irish",irishPos);
            irish.place(scene,camera.children[0],irishPos);

            window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, [irish.getMesh()], function(){
                irish.play();
            }.bind(this)));

            let scottish = new AudioElement(audios[1]);
            let scottishPos = camera.clone().position.addScaledVector(cross,-5);
            console.log("scottish",scottishPos);
            scottish.place(scene,camera.children[0],scottishPos);

            window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, [scottish.getMesh()], function(){
                scottish.play();
            }.bind(this)));

            window.addEventListener('pointerdown', (event) => scope.onPointerDownInfo(event, [info.bbox], function(){
                scope.informationPhase = false;
            }.bind(this)));

            console.log("scene",scene)

        }

        else if(infoNumber === infoSegmentsDone[5]){
            infoOverPath(5);
        }

        else if(infoNumber === infoSegmentsDone[6]){
            infoAsHtml(6);
        }

        else if(infoNumber === infoSegmentsDone[7]){
            let cam = new THREE.Vector3();
            camera.getWorldDirection(cam);
            infoFlyingToCam(7,cam.addScalar(20));
        }

        else if(infoNumber === infoSegmentsDone[8]){
            infoOverPath(8);
        }
        
        else if(infoNumber === infoSegmentsDone[9]){
            infoAsHtml(9);
        }

        else if(infoNumber === infoSegmentsDone[10]){
            infoAsHtml(10);
        }

        else if(infoNumber === infoSegmentsDone[11]){
            infoFlyingToCam(11);
        }

        else if(infoNumber === infoSegmentsDone[12]){
            infoOverPath(12);
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