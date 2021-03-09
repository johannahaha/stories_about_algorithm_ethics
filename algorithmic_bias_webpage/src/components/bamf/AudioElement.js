"use strict";

import * as THREE from "three";
import {gsap} from 'gsap';

class AudioElement{
    constructor(audio,color){
        this.audio = audio;
        this.color = color;
    }

    place(listener,parent,{x = 0, y = 0, z=0,distance = 1} = {}){
        this.sound = new THREE.PositionalAudio( listener );

        this.sound.setBuffer(this.audio);
        this.sound.setRefDistance(20);
        let spheregeo = new THREE.SphereBufferGeometry(1, 12, 12);
        this.mesh = new THREE.Mesh(spheregeo,new THREE.MeshPhongMaterial({color:this.color}))
        
        this.mesh.add(this.sound);
        parent.add(this.mesh);
        
        let aabb = parent.geometry.boundingBox.getSize( new THREE.Vector3() )

        this.mesh.position.x = (aabb.x + distance) * x
        this.mesh.position.y = (aabb.y + distance) * y
        this.mesh.position.z = (aabb.z + distance) * z

    

        gsap.from(this.mesh.position,{
            delay:2,
            duration: 2,
            ease: "elastic",
            y: 100,
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