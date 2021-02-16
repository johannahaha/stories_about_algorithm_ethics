<template>
    <div> 
        <h1 v-if="showInformation">Bamf geht los </h1>
        <!-- <Information v-if="showInformation" v-bind:informations="informations" /> -->
        <Scene v-bind:informations="informations"> </Scene>
    </div>
    
</template>

<script>
//import Information from "./Information.vue";
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
                content: "The Algorithm is used to detect arabic dialects",
                isImage: false
            },
            {
                id: 2,
                content: "It is used for refugees to verify their region of origin.",
                isImage: false
            },
            {
                id: 3,
                content: "It is one more element on a asylum decision.",
                isImage: false
            },
            {
                id: 4,
                content: "/img/Bamf2017_Schulung_Seite_050.png",
                isImage: true
            }
        ]
        }
    },
    methods: {
    }
}
</script>