"use strict";

import * as THREE from "three";

class AudioElement{
    constructor(audio){
        console.log("audio");
        this.audio = audio;
    }

    place(scene,listener,pos){
        console.log("place");
        this.sound = new THREE.PositionalAudio( listener );

        this.sound.setBuffer(this.audio);
        this.sound.setRefDistance(20);
        //sound.play();
        let spheregeo = new THREE.SphereBufferGeometry(1, 12, 12);
        this.mesh = new THREE.Mesh(spheregeo,new THREE.MeshPhongMaterial({color:0x961e68}))
        this.mesh.position.x = pos.x;
        this.mesh.position.y = pos.y;
        this.mesh.position.z = pos.z;
        scene.add(this.mesh);
        this.mesh.add(this.sound);
        console.log("mesh",this.mesh);
        scene.add(this.mesh);
        console.log(scene,pos);

    }

    play(){
        this.sound.play();
    }

    getMesh(){
        return this.mesh;
    }

}

export {AudioElement}