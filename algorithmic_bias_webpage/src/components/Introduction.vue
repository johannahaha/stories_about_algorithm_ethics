<template>
    <div> 
        <div class=bamf_intro v-if="!startedBamf"> 
            <section id=bamf_intro_start>
                <h2>Arabic dialect recognition algorithm</h2>
                The German agency for refugees uses an algorithm to detect the country of origin of refugees. 
                <button @click="startBamf">Start exploring</button>
                <button @click="scrollToElement('bamf_intro_references')"> Referenzen </button>
            </section>
            <section id="bamf_intro_references"> 

                <button @click="scrollToElement('bamf_intro_start')"> Back to Project </button>
                
                <h2>References and Ressources </h2>

                <ul>
                    <li>AlgorithmWatch. (2020). Automating Society Report 2020. AlgorithmWatch gGmbH. https://automatingsociety.algorithmwatch.org </li>

                    <li>Biselli, A. (2018, August 20). Eine Software des BAMF bringt Menschen in Gefahr. Vice. https://www.vice.com/de/article/a3q8wj/fluechtlinge-bamf-sprachanalyse-software-entscheidet-asyl </li>

                    <li>Bundesamt für Migration und Flüchtlinge. (2019). Digitalisierungsagenda 2020. https://www.bamf.de/DE/Themen/Digitalisierung/Digitalisierungsagenda/digitalisierungsagenda-node.html </li>

                    <li>Bundesamt für Migration und Flüchtlinge. (2020, October 12). Digitalisierung und Identitätsmanagement im Asylverfahren in Europa [Meldung] https://www.bamf.de/SharedDocs/Meldungen/DE/2020/20201012-digitalisierung-asylverfahren-va-eu-rp.html </li>

                    <li>Bundestag-Drucksache 19/6647. (2018). Antwort der Bundesregierung auf die Kleine Anfrage der Abgeordneten Ulla Jelpke, Dr. André Hahn, Gökay Akbulut, weiterer Abgeordneter und der Fraktion DIE LINKE. Einsatz von IT-Assistenzsystemen im Bundesamt für Migration und Flüchtlinge.</li>
                </ul>
            </section>
        </div>
        <Bamf id="sketch" v-if="startedBamf"/>
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
            startedBamf: false
        }
    },
    methods: {
        scrollToElement(id){
            const el = document.getElementById(id);
            console.log(el);

            if (el) {
            // Use el.scrollIntoView() to instantly scroll to the element
                el.scrollIntoView({behavior: 'smooth'});
            }
        },
        startBamf(){
            this.startedBamf=true;
            document.body.classList.toggle('sketch');
        }
    }

}
</script>

<style scoped lang="scss">


#bamf_intro_start{
    height:100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    //position: relative;
}

#bamf_intro_references{
    height:100vh;
    width: 80vw;
    margin: auto auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items:flex-start;
    //position: relative;

    button{
        margin-top:5vh;
        align-self: center;
        //position: absolute;
    }

    h2{
        align-self: center;
        //position: absolute;;
    }

    ul{
        //padding: 10rem;
        padding:0;
        //position: absolute;

        li{
        list-style: none;
        padding: 1rem;
        text-align: left;

        a{
            text-decoration: none;
            text-color:black;
        }
    }
    }

    
}

#sketch{
    overflow: hidden;
}

</style>>

