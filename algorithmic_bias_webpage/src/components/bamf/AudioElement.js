"use strict";

import * as THREE from "three";
import {gsap} from 'gsap';

class AudioElement{
    constructor(audio,color){
        console.log("audio");
        this.audio = audio;
        this.color = color;
    }

    place(scene,listener,pos){
        console.log("place");
        this.sound = new THREE.PositionalAudio( listener );

        this.sound.setBuffer(this.audio);
        this.sound.setRefDistance(20);
        //sound.play();
        let spheregeo = new THREE.SphereBufferGeometry(1, 12, 12);
        this.mesh = new THREE.Mesh(spheregeo,new THREE.MeshPhongMaterial({color:this.color}))
        this.mesh.position.x = pos.x;
        this.mesh.position.y = 50;
        this.mesh.position.z = pos.z;
        this.mesh.add(this.sound);
        scene.add(this.mesh);

        gsap.to(this.mesh.position,{
            delay:2,
            duration: 2,
            ease: "elastic",
            y: pos.y,
        })



    }

    play(){
        this.sound.play();
    }

    getMesh(){
        return this.mesh;
    }

}

export {AudioElement}