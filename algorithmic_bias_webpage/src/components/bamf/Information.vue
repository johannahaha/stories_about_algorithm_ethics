<template>
    <transition @before-enter="beforeEnterInfo" @enter="enterInfo" @leave="leaveInfo">
        <div id="info" :style="style" v-if="infoElement">
                {{content}}
        </div>
    </transition>
</template>

<script>
import {gsap} from 'gsap';
import {Vector2} from 'three';

//TODO: resizing
//et windowSize = new Vector2( window.offsetWidth, window.offsetHeight);

export default {
    props: {
        infoElement:{
            type: Boolean
        },
        informations:{
            type: Array
        },
        windowSize:{
            type: Vector2
        },
        infoId:{
            type: Number
        },
        scale:{
            type: Number
        },
        x: {
            type: Number
        },
        y: {
            type: Number
        },
        isGerman: {
            type: Boolean
        }
    },
    computed: {
        //returns text in german or english
        content(){
            let text;
            if(this.isGerman){
                text = this.informations[this.infoId].german;
            }
            else{
                text = this.informations[this.infoId].content;
            }
            return text;
        },
        //set fonr size
        style(){
            if (window.innerWidth < 768) {
                return 'font-size: 1rem';
            } else {
                return 'font-size: '+ this.scale + 'rem';
            }
        },
        //calc percentage for "xPercent" in gsap
        posPercentX(){
            return -100 * this.x;
        },
        //calc percentage for "yPercent" in gsap
        posPercentY(){
            return -100 * this.y;
        },
        //calc position for "x" in gsap
        posX(){
            return this.windowSize.x * this.x;
        },
        //calc position for "y" in gsap
        posY(){
            return this.windowSize.y * this.y;
        }
    },
    methods: {
        //#region GSAP transitions
        beforeEnterInfo(el) {
            gsap.set(el, {
                scaleX: 1,
                scaleY: 1,
                opacity: 0,
                transformOrigin:"0% 0%"
            })
        },
        enterInfo(el,done){
            gsap.to(el,{
                duration: 1,
                opacity:1,
                x: this.posX,
                y: this.posY,
                xPercent:this.posPercentX,
                yPercent:this.posPercentY,
                onComplete: done
            })
        },
        leaveInfo(el,done){
            gsap.to(el,{
                duration: 0.5,
                scaleX: 0,
                scaleY: 0,
                y:0,
                onComplete: this.onClose, done
            })
        },
        onClose(){
            this.$emit("information-closed")
        }
    },
    mounted(){
    }
    
}
</script>

<style scoped lang="scss">
@import "@/assets/_config.scss";

#info {
    white-space: pre-line;
    position: absolute;
    color: $light;
    text-align: left;
    padding:2rem;
    box-sizing: border-box;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    z-index: 1;
}
</style>