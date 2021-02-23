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
                id: 0,
                content: "Arabic Sounds describing a picture",
                isImage: false
            },
            {
                id: 1,
                content: "This is the result of the algorithm that is used by the BAMF since 2017. The BAMF is the institution that makes Asylum decisions in Germany.",
                isImage: false
            },
            {
                id: 2,
                content: "It detects the arabic dialect of a person and should for example differ between arabic-levantitic and egyptian arabic. That should help to detect the country of origin of the person",
                isImage: false
            },
            {
                id: 3,
                content: "In the past, that was done by arabian language certificator. To make the process more effective and less expensive, an algorithm was developed for that.",
                isImage: false
            },
            {
                id: 4,
                content: "That was called 'Digitalization'. But what exactly is happening here?",
                isImage: false
            },
            {
                id: 30,
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