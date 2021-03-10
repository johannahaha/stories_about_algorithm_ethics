<template>
    <transition @before-enter="beforeEnterInfo" @enter="enterInfo" @leave="leaveInfo">
        <div id="info" :style="style" v-if="infoElement">
                {{ informations[infoId].content }}
        </div>
    </transition>
</template>

<script>
import {gsap} from 'gsap';
import {Vector2} from 'three';

//TODO: resizing
//let windowSize;

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
        },
        scale:{
            type: Number
        },
        position: {
            type: Vector2
        }
    },
    computed: {
        style(){
            return 'font-size: '+ this.scale + 'rem';
        },
        posPercentLeft(){
            return '"'+this.position.x+'vw"'
        },
        posPercentTop(){
            return '"'+this.position.y+'vh"'
        }
    },
    methods: {
        //#region GSAP transitions
        beforeEnterInfo(el) {
        gsap.set(el, {
            scaleX: 1,
            scaleY: 1,
            opacity: 0
        })
        },
        enterInfo(el,done){
            gsap.to(el,{
                duration: 1,
                scaleX: 1,
                scaleY: 1,
                opacity:1,
                x: this.position.x,
                y: this.position.y,
                xPercent:-50,
                yPercent:-50,
                //xPercent:this.position.x, 
                //left:this.posPercentLeft, 
                //yPercent:this.position.y, 
                //top:this.posPercentTop, 
                onComplete: done
            })
        },
        leaveInfo(el,done){
            gsap.to(el,{
                duration: 0.5,
                scaleX: 0,
                scaleY: 0,
                y:0,
                onComplete: this.onClose, done//this.stopInformationPhase,
            })
        },
        onClose(){
            this.$emit("information-closed")
        }
    },
    mounted(){
        //windowSize = new Vector2( window.offsetWidth, window.offsetHeight);
    }
    
}
</script>

<style scoped lang="scss">
@import "@/assets/_config.scss";

#info {
    white-space: pre-line;
    position: absolute;
    color: $light;
    /* //width: 100vw;
    //height: 100vh; */
    box-sizing: border-box;
    text-align: center;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    z-index: 1;
}
</style>