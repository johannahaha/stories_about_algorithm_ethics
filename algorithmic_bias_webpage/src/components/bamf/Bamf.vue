<template>
    <div> 
        <h1 @click="showInformation = true">Bamf geht los </h1>
        <div v-if="!showInformation"></div>
        <!-- <Information v-if="showInformation" v-bind:informations="informations" /> -->
        <Scene> </Scene>
    
    </div>
    
</template>

<script>
import Information from "./Information.vue";
import Scene from "./Scene.vue"

export default {
    name: "Bamf",
    components: {
        //Information,
        Scene
    },
    data() {
        return { 
            showInformation: false,
            informations: [
            {
                id: 1,
                text: "The Algorithm is used to detect arabic dialects"
            },
            {
                id: 2,
                text: "It is used for refugees to verify their region of origin."
            },
            {
                id: 3,
                text: "It is one more element on a asylum decision."
            }
        ]
        }
    },
    methods: {
    }
}
</script>