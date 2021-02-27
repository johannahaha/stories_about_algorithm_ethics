"use strict";

import * as THREE from "three";

class AudioElement{
    constructor(audio,listener,mesh){
        this.audio = audio;
        this.listener = listener;
        this.mesh = mesh;
    }

    place(){
        const sound = new THREE.PositionalAudio( this.listener );

        sound.setBuffer(this.audio);
        sound.setRefDistance(20);
        sound.play();

        this.mesh.add(sound);

    }

}

export {AudioElement}