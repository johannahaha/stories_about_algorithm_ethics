<template>
    <div>
        <h5>Hello</h5>
        <!--<div> {{currentInfo}} </div> -->
    </div>
</template>

<script>
export default {
    name: "Information",
    props: ["informations"],
    data(){
        return{
            activeId: 1,
        }
    },
    created() {
        window.addEventListener('scroll', this.handleScroll);
    },
    unmounted() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        handleScroll (event) {
            //activeId += 1;
            //console.log(activeId);
        // Any code to be executed when the window is scrolled
        }
    }//,
    //computed: {
        //currentInfo: function(){
            //console.log(this.informations.filter(i => i.id === activeId).text);
            //return this.informations.filter(i => i.id === activeId).text;
        //}
    //}
}
</script>