<template>
    <div> 
        <div class=bamf_intro v-if="!startedBamf"> 
            <section id=bamf_intro_start>
                <h2>arabic dialect recognition algorithm</h2>

                <div class="bamf_intro_start_language">
                    <div class="bamf_intro_start_language_item">
                        The German Federal Office for Migration and Refugees (BAMF) uses an algorithm to identify the country of origin of refugees. How ethical is that? The exploration will take you about seven minutes. Please turn up your sound.<br>
                        <button @click="startBamf(false)">Start exploring</button>
                    </div>
                    <div class="bamf_intro_start_language_item">
                        Das Bundesamt für Migration und Flüchtlinge (BAMF) nutzt einen Algorithmus, um das Herkunftsland von Geflüchteten zu ermitteln. Wie ethisch ist das? Die Reise wird etwa sieben Minuten dauern. Bitte schalte den Ton an deinem Gerät an.<br>
                        <button @click="startBamf(true)">Beginne die Reise</button>
                    </div>
                </div>
                <button id="toreference" @click="scrollToElement('bamf_intro_references')"> References </button>
            </section>
            <section id="bamf_intro_references"> 

                <button @click="scrollToElement('bamf_intro_start')"> Back to Project </button>
                
                <h2>References and Ressources</h2>

                <ul>
                    <li>AlgorithmWatch. (2020). Automating Society Report 2020. AlgorithmWatch gGmbH. <a href="https://automatingsociety.algorithmwatch.org">https://automatingsociety.algorithmwatch.org</a></li>

                    <li>Biselli, Anna. (2017, March 17). Software, die an der Realität scheitern muss. Zeit Online. <a href="https://www.zeit.de/digital/internet/2017-03/bamf-asylbewerber-sprach-analyse-software-computerlinguistik ">https://www.zeit.de/digital/internet/2017-03/bamf-asylbewerber-sprach-analyse-software-computerlinguistik </a> 
                    </li>

                    <li>Biselli, Anna. (2018, August 20). Eine Software des BAMF bringt Menschen in Gefahr. Vice. <a href="https://www.vice.com/de/article/a3q8wj/fluechtlinge-bamf-sprachanalyse-software-entscheidet-asyl">https://www.vice.com/de/article/a3q8wj/fluechtlinge-bamf-sprachanalyse-software-entscheidet-asyl</a></li>

                    <li>Biselli, Anna. (2018, December 28). Die IT-Tools des BAMF: Fehler vorprogrammiert. Netzpolitik.org. <a href="https://netzpolitik.org/2018/die-it-tools-des-bamf-fehler-vorprogrammiert/">https://netzpolitik.org/2018/die-it-tools-des-bamf-fehler-vorprogrammiert/</a></li>

                    <li>Bundesamt für Migration und Flüchtlinge. (2019). Digitalisierungsagenda 2020. <a href="https://www.bamf.de/DE/Themen/Digitalisierung/Digitalisierungsagenda/digitalisierungsagenda-node.html">https://www.bamf.de/DE/Themen/Digitalisierung/Digitalisierungsagenda/digitalisierungsagenda-node.html</a>  </li>

                    <li>Bundesamt für Migration und Flüchtlinge. (2020, October 12). Digitalisierung und Identitätsmanagement im Asylverfahren in Europa [Meldung] <a href="https://www.bamf.de/SharedDocs/Meldungen/DE/2020/20201012-digitalisierung-asylverfahren-va-eu-rp.html">https://www.bamf.de/SharedDocs/Meldungen/DE/2020/20201012-digitalisierung-asylverfahren-va-eu-rp.html</a> </li>

                    <li>Bundesamt für Migration und Flüchtlinge. (2020, März 23). Antwort auf Informationsfreiheitsanfrage #182855: Sprachbiometrie-Software. <a href="https://fragdenstaat.de/a/182855">https://fragdenstaat.de/a/182855</a></li>

                    <li>Bundestag-Drucksache 19/6647. (2018). Antwort der Bundesregierung auf die Kleine Anfrage der Abgeordneten Ulla Jelpke, Dr. André Hahn, Gökay Akbulut, weiterer Abgeordneter und der Fraktion DIE LINKE. Einsatz von IT-Assistenzsystemen im Bundesamt für Migration und Flüchtlinge.</li>

                    <li>Bundestag-Drucksache 19/190. (2017). Antwort auf die Kleine Anfrage der Abgeordneten Dr. Petra Sitte, Anke Domscheit-Berg, Dr. André Hahn, weiterer Abgeordneter und der Fraktion DIE LINKE. Einsatz von Akzenterkennungssoftware durch das Bundesamt für Migration und Flüchtlinge. </li>
                </ul>

                <h2>Assets used</h2>

                <ul>
                    <li> Bundesamt für Migration und Flüchtlinge. (2017). Integriertes Identitätsmanagment - Plausibilisierung, Datenqualität und Sicherheitsaspekte. Einfürhung in die neuen IT-Tools. Schulung AVS-Mitarbeiter, Entscheider und Volljuristen [presentation slides]. <a href="https://fragdenstaat.de/anfrage/foliensatze-und-interpretationshilfen-zu-sprachanalyse/">https://fragdenstaat.de/anfrage/foliensatze-und-interpretationshilfen-zu-sprachanalyse/</a></li>

                    <li> Demirsahin, I., Kjartansson, O., Gutkin, A., & Rivera, C. (2020). Open-source Multi-speaker Corpora of the English Accents in the British Isles European Language Resources Association (ELRA). <a href="https://www.aclweb.org/anthology/2020.lrec-1.804">https://www.aclweb.org/anthology/2020.lrec-1.804</a> </li>
                </ul>

            </section>
        </div>
        <Bamf id="sketch" v-if="startedBamf" @endingPath="endingPath" :isGerman="german"/>
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
            startedBamf: false,
            showReferences:false,
            scrollToReference:false,
            german: false,
        }
    },
    methods: {
        scrollToElement(id){
            const el = document.getElementById(id);

            if (el) {
                el.scrollIntoView({behavior: 'smooth'});
            }
        },
        //starting bamg element, setting the language
        startBamf(isGerman){
            this.german = isGerman;
            this.startedBamf=true;
            document.body.classList.toggle('sketch');
        },

        //scroll to ressources after ending path
        endingPath(){
            this.startedBamf=false;
            document.body.classList.toggle('sketch');
            this.scrollToReference = true;
        }
    },
    updated(){
        if(this.scrollToReference){
            const el = document.getElementById("toreference");
            this.scrollToReference = false;
            el.click();

        }

    }

}
</script>

<style lang="scss">
@import "@/assets/_config.scss";

.bamf_intro{
    background: $dark;
    position: absolute;
    display: block;
}

.bamf_intro_start_language{
    display: flex;
    flex-direction: column;
    justify-content: center;

      &_item{
          margin: 1rem;
          align-self: center;
      }
    }

#bamf_intro_start{
    height:100vh;
    width: 100vw;
    padding-left: 5%;
    padding-right: 5%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;

    h2{
        align-self: center;
        padding: 2rem 0;
        //position: absolute;;
    }
}

#bamf_intro_references{
    //height:100vh;
    width: 100vw;
    margin: 0 auto;
    padding-left: 5%;
    padding-right: 5%;
    display:block;
    position: relative;

    button{
        margin-top:5vh;
        align-self: center;
        //position: absolute;
    }

    h2{
        align-self: center;
        padding: 2rem 0;
        position: relative;
    }

    ul{
        //padding: 10rem;
        padding:0;
        position: relative;

        li{
        list-style: none;
        padding: 1rem;
        text-align: left;

        a{
            text-decoration: underline;
            color: $lightmiddle;
        }
    }
    }

    
}

#sketch{
    overflow: hidden;
}

button{
    @include buttonStyle;
}


</style>>

