<template>
    <div> 
        <p v-if="!startBamf">
        This is the introduction. Everything About this project is explained here. 
        <button @click="startBamf = true">Start exploring</button>
        </p>
        <Bamf v-if="startBamf"/>
    </div>
</template>

<script lang="ts">

import Bamf from "./bamf/Bamf.vue"

export default{
    name: "Introduction",
    components: {
        Bamf
    },
    data() {
        return{
            startBamf: false
        }
    }

}
</script>

<style>

</style>
