<template>
    <transition @before-enter="beforeEnterInfo" @enter="enterInfo" @leave="leaveInfo">
        <div class="info" v-if="infoElement">
                {{ informations[infoId].content }}
        </div>
    </transition>
</template>

<script>
import {gsap} from 'gsap';
import {Vector2} from 'three';

//TODO: resizing
let windowSize;

export default {
    props: {
        infoElement:{
            type: Boolean
        },
        informations:{
            type: Array
        },
        infoId:{
            type: Number
        }
    },
    methods: {
        //#region GSAP transitions
        beforeEnterInfo(el) {
        gsap.set(el, {
            scaleX: 0,
            scaleY: 0,
            opacity: 0
        })
        },
        enterInfo(el,done){
            gsap.to(el,{
                duration: 1,
                scaleX: 1,
                scaleY: 1,
                opacity:1,
                y: windowSize.y/2,
                x: windowSize.x/4,
                onComplete: done
            })
        },
        leaveInfo(el,done){
            console.log("leaving info");
            gsap.to(el,{
                duration: 3,
                scaleX: 0,
                scaleY: 0,
                y:0,
                onComplete: this.onClose, done//this.stopInformationPhase,
            })
        },
        onClose(){
            console.log("close this");
            this.$emit("information-closed")
        }
    },
    mounted(){
        windowSize = new Vector2( window.offsetWidth, window.offsetHeight);
    }
    
}
</script>

<style scoped>
.info {
    position: absolute;
    color: black;
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
    text-align: center;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    z-index: 1;
}
</style>