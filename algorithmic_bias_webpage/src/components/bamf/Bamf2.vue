<template>
    <div id="BAMF"> 
        <h1 v-if="showInformation">BAMF geht los </h1>
        <!-- <Information v-if="showInformation" v-bind:informations="informations" /> -->
        <Scene v-bind:informations="informations" :isGerman ="isGerman"
        @endingPath="endingPath"> </Scene>
    </div>
    
</template>

<script>
//import Information from "./Information.vue";
import Scene from "./Scene.vue"

export default {
    name: "BAMF",
    components: {
        //Information,
        Scene
    },
    props:{
        isGerman: {
            type: Boolean
        }
    },
    data() {
        return { 
            showInformation: false,
            informations: [
            {
                id: 0,
                content: "You are on a path. \nYou may recognize the shape of it. \n\nClick on this text to keep following it.",
                german:"Du befindest dich auf einem Pfad. \nVielleicht erkennst du die Form des Pfads. \n\nKlicke auf diesen Text, um ihm weiter zu folgen.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 1,
                content: "This path is the border of Germany.",
                german:"Dieser Pfad ist die Grenze von Deutschland.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 2,
                content: "Maybe you've heard of algorithms and artificial intelligence \nthat make decisions about people - and make mistakes.",
                german:"Vielleicht hast du auch schonmal von Algorithmen und Künstlicher Intelligenz gehört,\n die Entscheidungen über Menschen treffen - und dabei Fehler machen. ",
                isImage: false,
                scale: 0.2
            },
            {
                id: 3,
                content: "These algorithms exist not only in other countries but also in Germany. \nThe BAMF uses such an algorithm to determine the Arabic dialect of people. \nThat enables statements about the country of origin.",
                german:"Diese Algorithmen existieren nicht nur in anderen Ländern, sondern auch in Deutschland. \nDas BAMF verwendet einen solchen Algorithmus, um den arabischen Dialekt von Personen zu bestimmen. \nDamit sollen Aussagen über das Herkunftsland getroffen werden können.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 4,
                content: "In theory, this should distinguish, for example, \nwhether a person is more likely to come from Egypt or Syria. \nA person from Syria is eligible for asylum, a person from Egypt only rarely. \nThe result of the algorithm is an indication that flows into the asylum decision.",
                german:"In der Theorie soll so zum Beispiel unterschieden werden, ob eine Person aus Ägypten oder aus Syrien kommt. \nEine Person aus Syrien ist asylberechtigt, eine Person aus Ägypten nur selten. \nDas Ergebnis des Algorithmus ist ein Indiz, der in die Asylentscheidung enfließt.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 5,
                content: "For this purpose, the refugee speaks into \na microphone for two minutes and describes a picture. \nThe algorithm evaluates the speech. \nThe decision-maker at the Bamf receives the result.",
                german:"Dazu spricht die geflüchtete Person zwei Minuten in ein Mikrofon und beschreibt ein Bild. \nDer Algorithmus wertet die Sprache aus. \nDer bzw. die Entscheider*in im Bamf erhält das Ergebnis.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 6,
                content: "The result then looks like this:",
                german:"Das Ergebnis sieht dann so aus:",
                isImage: false,
                scale: 0.2
            },
            {
                id: 7,
                content: "The algorithm costed over two million euros so far. \nThe BAMF is planning a pilot project to use this algorithm \nthroughout the EU.",
                german:"Der Algorithmus hat bereits über zwei Millionen Euro gekostet. \nDas BAMF plant ein Pilotprojekt, um diesen Algorithmus \nin der gesamten EU einzusetzen.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 8,
                content: "But what exactly is happening here? \nWhere are the potential problem areas? \nIs it ethical?",
                german:"Doch was passiert hier genau? \nWo liegen mögliche Problemstellen? \nIst es ethisch?",
                isImage: false,
                scale: 0.2
            },
            {
                id: 9,
                content: "To get to the bottom of this, \nyou will first imagine \nthat it is the English language. ",
                german:"Um dem auf den Grund zu gehen, \nwirst du dir zunächst vorstellen, \ndass es sich um die englische Sprache handelt. ",
                isImage: false,
                scale: 0.2
            },
            {
                id: 10,
                content: "Our algorithm should distinguish between different English dialects. \nFor that, we let the algorithm 'listen' to many speech recording from those dialects. \nThe algorithm tries to find patterns of the dialects. \nThat is called 'training data'. \nFor example, they sound like this.",
                german:"Damit der Algorithmus verschiedene englische Dialekte unterscheiden kann, \nhört er sich viele kleine Sprachaufnahmen der verschiedenen Dialekte an \nund sucht nach den Mustern der Dialekte. \nDie Aufnahmen nennt man Trainingsdaten. \nSie hören sich zum Beispiel so an.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 11,
                content: "If the algorithm could correctly determine \nenough of these training data, \nit has a model of English dialects. \n\nThen, it can detect that the blue ball is Irish \nand the light ball is Scottish. \nThat is called machine learning.",
                german:"Wenn der Algorithmus genug von diesen Trainingsdaten richtig bestimmen konnte, \nhat er ein Modell von englischen Dialekten. \nDanach kann er zum Beispiel wissen, dass die blaue Kugel irisch ist \nund die helle Kugel schottisch. \nDas nennt man maschinelles Lernen",
                isImage: false,
                scale: 0.2
            },
            {
                id: 12,
                content: "To see how well it does, we look at the accuracy. \nThe algorithm from the BAMF has an accuracy of 85% for most Arabic dialects. \nIn simplified terms, this means that 85% of the language samples can be correctly categorized.",
                german:"Dabei besitzt er eine bestimmte Genauigkeit. \nDer Algorithmus vom BAMF hat bei den meisten arabischen Dialekten eine Genauigkeit von 85 %. \nDas heißt vereinfacht gesagt, dass 85 % der Sprachproben richtig kategorisiert werden können.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 13,
                content: "On the other hand, this means that approximately \nevery sixth language sample is incorrectly categorized.",
                german:"Andersrum bedeutet dass, dass etwa jede sechste Sprachprobe falsch zugeordnet wird.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 14,
                content: "The algorithm has been used 10,000 times, \nso it was probably wrong for about 1500 people. \n\nThat is a high number.",
                german:"Der Algorithmus wurde bereits 10.000 Mal verwendet, \nlag also vermutlich etwa bei 1500 Personen falsch. \n\nDas ist eine hohe Zahl.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 15,
                content: "But let's assume that it would technically work flawlessly. \n\nWould it then be fair?",
                german:"Doch angenommen, er würde technisch einwandfrei funktionieren. \n\nWäre es dann fair?",
                isImage: false,
                scale: 0.2
            },
            {
                id: 16,
                content: "You need to know that before this algorithm, \nexperts made language certificates for some specific refugees. \nIn this process, a language expert talked to the person and \nelicited certain local expressions and descriptions by asking questions. \nThe algorithm does not use these local expressions specifically.",
                german:"Dazu musst du wissen, dass vor diesem Algorithmus \nbei einigen Geflüchteten Sprachzertifikate angefertigt worden sind. \nDabei hat ein Sprachexperte sich mit der Person unterhalten \nund durch Nachfragen bestimmte lokale Ausdrucke und Beschreibungen hervorgerufen. \nDiese lokalen Ausdrücke verwendet der Algorithmus nicht gezielt.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 17,
                content: "Additionally, we cannot state that \neach country has one dialect. \nPeople speak dialects across borders. \nYou'll see that when you look at this map.",
                german:"Zusätzlich sind die Gebiete, \nin denen ein Dialekt gesprochen wird, \nnicht an Ländergrenzen gebunden. \nDas wirst du erkennen, wenn du dir diese Karte anschaust.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 18,
                content: "So what does having a dialect even mean?",
                german:"Was kann so ein Dialekt also überhaupt bedeuten?",
                isImage: false,
                scale: 0.2
            },
            {
                id: 19,
                content: "Even more, a person does not automatically have the dialect of the region in which he or she was born. \nDialect and socialization are strongly linked.",
                german:"Noch dazu hat eine Person nicht automatisch den Dialekt der Region, in der sie geboren wurde. \nDer Dialekt ist stark mit der Sozialisation verbunden.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 20,
                content: "It is crucial to consider where a person grew up, \ntheir level of education, \ntheir social group or family, \ntheir social class, \nand their socialization. \nThe individual biography, i.e. especially an escape, \nstrongly influences the dialect.",
                german:"Man muss berücksichtigen, \nwo eine Person aufgewachsen ist, \nihren Bildungsstand, \nihre soziale Gruppe oder ihre Familie, \nihre soziale Schicht und ihre Sozialisierung. \nDie individuelle Biographie, also insbesondere eine Flucht, \nbeeinflusst den Dialekt stark.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 21,
                content: "For example, a person who lived in Lebanon for a long time \nbefore coming to Germany might adopt words from that dialect.",
                german:"Eine Person, die lange Zeit in Unterkünften im Libanon gelebt hat, \nbevor sie nach Deutschland kommt, könnte beispielsweise Wörter von diesem Dialekt übernehmen.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 22,
                content: "Contrary to official regulations, journalist Anna Biselli's research showed that \ndecision-makers occasionally use the algorithm on people who do not speak Arabic at all.\n The algorithm then nevertheless attempts to assign the language to an Arabic dialect.",
                german:"Recherchen der Journalistin Anna Biselli haben außerdem gezeigt, dass der Algorithmus entgegen offizieller Bestimmungen vereinzelt auch bei Personen verwendet wird,\n die gar kein arabisch sprechen. \nDer Algorithmus versucht dann trotzdem, die Sprache zu einem arabischen Dialekt zuzuordnen.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 23,
                content: "These are all sources of error\nthat have severe consequences for the person concerned.",
                german:"Das alles sind Fehlerquellen, \ndie schwere Konsequenzen für den betroffenen Menschen haben.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 24,
                content: "If a person is denied asylum because of language, \nthey have only one week to appeal. \nThen they will be deported.",
                german:"Wenn einer Person wegen der Sprache das Asyl abgelehnt wird, \nhat sie nur eine Woche Zeit zu klagen. \nDann wird sie abgeschoben.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 25,
                content: "This deadline is hard to meet. \nRefugees need contacts with people \nwho can help beforehand.",
                german:"Diese Frist ist schwer einzuhalten. \nMan braucht vorher schon Kontakte \nzu Personen, die helfen können.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 26,
                content: "To date, there is no scientific study that deals with this algorithm. \nThe BAMF has said since 2017 that they are planning one.",
                german:"Bis heute gibt es keine wissenschaftliche Studie, \ndie sich mit diesem Algorithmus beschäftigt. \nDas BAMF sagt seit 2017, dass eine geplant ist.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 27,
                content: "To date, decision-makers use this algorithm often in Asylum processes.",
                german:"Bis heute wird er oft eingesetzt.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 28,
                content: "In the future, asylum decision-makers throughout the EU could use this algorithm. ",
                german:"In Zukunft könnte er in der gesamten EU eingesetzt werden. ",
                isImage: false,
                scale: 0.2
            },
            {
                id: 29,
                content: "stories about algorithm ethics. \nthe BAMF case. \n\njohanna hartmann",
                german: "stories about algorithm ethics. \nder BAMF Fall. \n\nJohanna Hartmann",
                isImage: false,
                scale: 0.2
            },
            {
                id: 30,
                content: "click for getting to the ressources",
                german: "Klicke, um zu Quellen und Ressourcen zu gelangen",
                isImage: false,
                scale: 0.1
            }
        ]
        }
    },
    methods: {
        endingPath(){
            this.$emit("ending-path");
        }
    }
}
</script>