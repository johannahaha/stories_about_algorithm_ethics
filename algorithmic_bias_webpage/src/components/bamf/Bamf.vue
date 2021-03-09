<template>
    <div id="bamf"> 
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
                content: "Arabic voice describing a picture",
                isImage: false,
                scale: 0.3
            },
            {
                id: 1,
                content: "This is the result of the algorithm that is used by the BAMF since 2017. \nThe BAMF is the institution that makes Asylum decisions in Germany.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 2,
                content: "It detects the arabic dialect of a person and should for example differ between \narabic-levantitic and egyptian arabic. \nThat should help to detect the country of origin of the person.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 3,
                content: "Since 2017, the algorithm was used over 10.000 times across Germany.\n",
                isImage: false,
                scale: 0.2
            },
            {
                id: 4,
                content: "But what exactly is happening here?",
                isImage: false,
                scale: 0.2
            },
            {
                id: 5,
                content: "Language was used as a Proxy for Origin in Asylum decisions in Germany before. \nThat happened in form of language certificates. \nDuring such a session, an arabic language expert tries to for example trigger \nregional expressions or local informations to verify the country of origin.",
                isImage: false,
                scale: 0.13
            },
            {
                id: 6,
                content: "The algorithm works differently. \nIt uses Machine Learning.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 7,
                content: "Machine Learning is a process where patterns in training data \nare detected with mathematical methods. \nFor an arabic dialect recognition algorithm, \nthe data are arabic samples with dialect labels.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 8,
                content: "Let's imagine, the language was English. \nSome data samples would look (or sound) like this.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 9,
                content: "Which using each training sample, the algorithm learns, what patterns make up Scottish, Irish or Southern English dialects.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 10,
                content: "After hearing thousands of those samples, \nit can maybe detect that the dark sphere is Irish and the light sphere is Scottish",
                isImage: false,
                scale: 0.2
            },
            {
                id: 11,
                content: "To make this decision clearer, it will not give the user a yes or no answer, \nbut a percentage of how strong the decision is. \nFor example: 70 % Irish, 30% Scottish. \nThat means: I am 70 % sure that this is Irish, but it could also be Scottish to 30%.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 12,
                content: "To see if the algorithm works, testing data is used. \nThe labels are hidden and the algorithm has the task, to detect which language that is.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 13,
                content: "The accuracy tells us, how many of those tests were correct. \nOur English language recognition could for example be applied, \nif 90 % of the test samples were detected correctly",
                isImage: false,
                scale: 0.1
            },
            {
                id: 14,
                content: "How good the algorithm can differ between Scottish and Irish English, depends strongly on the dataset that is used. \nIf we have a lot of Scottish Voices and only a few Irish voices, the algorithm is good with Scottish but bad with Irish",
                isImage: false,
                scale: 0.1
            },
            {
                id: 15,
                content: "That means, that many Scottish voice could be wrongly detected as Irish.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 16,
                content: "Let us go back to our Arabic Algorithm. The Bamf Algorithm has a accuracy of 85 %. \nThat means, that 15% of all test samples were labeled incorrectly.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 17,
                content: "This is a huge number. \nIf we look at the 10.000 people this algorithm was used on, \nthe algorithm was probably wrong in 1500 cases.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 18,
                content: "Let us look at our image again. \nWhat does those numbers now mean?",
                isImage: false,
                scale: 0.2
            },
            {
                id: 19,
                content: "They mean, that the algorithm was 70% sure, that the Arabic is levantitic \nThis 70 % do not include the accuracy. \nSo: The algorithm is 70% sure that the Arabic is levantitic, but that sureness is only correct to 85%. \nIn total, the algorithm has a sureness of 59 % that this person soke arabic levantitic ",
                isImage: false,
                scale: 0.2
            },
            {
                id: 20,
                content: "59 % is not much. \nEven though, informations like this \nare used in an Asylum decision.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 21,
                content: "Moreover, even though the algorithm should be used only for arabic language. \nJournalist Anna Biselli talked to a kurdish refugee,\n whose kurdish was detected as 'turkish',\n even though he was from Syria. \n\nBecause of that, he should be then abgeschoben",
                isImage: false,
                scale: 0.15
            },
            {
                id: 22,
                content: "With stories like this, it is interesting to take a closer look \nat how the algorithm is used by decision makers of the bamf. \nAnna Biselli published the training documents of the Bamf for the decision makers.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 23,
                content: "The person that the algorithm is used for must be speaking arabian. \nThey should speek into a telephone and describe a given picture for around two minutes.",
                isImage: false,
                scale: 0.15
            },
            {
                id: 24,
                content: "Their voice is recorded and analized. \nThe decision maker receives a result \nthat might look like this.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 25,
                content: "This result should never be used for an asylum decision all alone, \nbut should function as additional information or help for the decision maker.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 26,
                content: "This is explicitly written in the training documents, \nbut in reality there were cases where those rules were not followed.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 27,
                content: "For example, the algorithm should never be used for kurdish speaking persons, \nbecause obviously they do not speak arabic. This is no single case. \nMany refugees whom this was used for were from Kenya or Venezuela, \nwhere Arabian is not a common language.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 28,
                content: "Another interesting fact about the training documents is, \nthat the Sound-Noise-Ratio (SNR) is marked as 'not relevant' in the documents. \nThose are important measurements for the quality of the sound \nwhich should be considered.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 29,
                content: "With bad audio quality, this speech algorithm can never get to a good result.",
                isImage: false,
                scale: 0.2
            },

            {
                id: 30,
                content: "But let us assume for a second, that the algorithm would work with a high accuracy \nand that all the decision makers use it correctly. Would it be ethical then?",
                isImage: false,
                scale: 0.2
            },
            {
                id: 31,
                content: "For that, we need to look more closely at dialects and what it means to have a dialect.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 32,
                content: "When you look at this map, you can see that \nthe arabic dialects are not bound to borders. \nCan we assume, that a dialect refers to a country of origin at all?",
                isImage: false,
                scale: 0.1
            },
            {
                id: 33,
                content: "Moreover, a person does not automatically have the dialect of the region \nwhere they were born. The dialect is strongly connected to sozialization",
                isImage: false,
                scale: 0.2
            },
            {
                id: 34,
                content: "One has to consider where a person grew up,\nwhere they went to school,\nwho was their social group or their family \nand where they were socialized. \nThe biography is an important part here",
                isImage: false,
                scale: 0.2
            },
            {
                id: 35,
                content: "Especially for people who flew this often long flight can influence the language a lot.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 36,
                content: "Often, a dialect can also depend on social groups and might be supressed and unlearned by persons,\nfor example to belong to another group or hide that they belong to a marginilized minority.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 37,
                content: "All those complex social and biographic factors play an important role in ones dialect.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 38,
                content: "Therefore, the result of the algorithm could be explained by factors \nthat are not directly related to the country of origin.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 39,
                content: "An asylum seeker could explain the result in the hearing if asked. \nThat is not always the case, since the algorithm was applied used after the hearing, \nwhen a language certificate was planned but then substituted with the algorithm.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 40,
                content: "When asylum is denied because the country of origin was detected as false, \nthe person only has one week to take legal action against this decision.\nMostly this timeframe makes it only possible for people \nwho they are already linked to non profit organizations \nor other people who can help.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 41,
                content: "That means, that this algorithm could influence decisions \nthat are fare reaching and drastic for the people \nthat the asylum is falsely denied to.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 42,
                content: "stories about algorithm ethics. \nthe bamf case. \n\njohanna hartmann",
                isImage: false,
                scale: 0.2
            }
        ]
        }
    },
    methods: {
    }
}
</script>

<style scoped>

.bamf{
    overflow: hidden;
}
</style>