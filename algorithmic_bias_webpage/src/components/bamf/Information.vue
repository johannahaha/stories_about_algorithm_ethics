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
        style(){
            return 'font-size: '+ this.scale + 'rem';
        },
        posPercentX(){
            console.log("recalcutlating percents");
            return -100 * this.x;
        },
        posPercentY(){
            return -100 * this.y;
        },
        posX(){
            return this.windowSize.x * this.x;
        },
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

            // this.posPercentX =  -100 * this.position.x;
            // this.posPercentY = -100 * this.position.y;
            // this.posX = this.windowSize.x * this.position.x;
            // this.posY = this.windowSize.y * this.position.y;

            gsap.to(el,{
                onStart: console.log("starting info",this.posX,this.posY,this.posPercentX,this.posPercentY),
                duration: 1,
                opacity:1,
                x: this.posX,
                y: this.posY,
                xPercent:this.posPercentX,
                yPercent:this.posPercentY,
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