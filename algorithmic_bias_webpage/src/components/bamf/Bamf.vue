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
                content: "Arabic voice describing a picture",
                german:"Arabische Stimme beschreibt Bild",
                isImage: false,
                scale: 0.3
            },
            {
                id: 1,
                content: "This is the result of the algorithm used by BAMF since 2017. \n'BAMF' is the name of the Federal Office for Migration and Refugees, \nwhich issues asylum decisions in Germany.",
                german: "Das ist das Ergebnis des Algorithmus, den das BAMF seit 2017 verwendet. \n'BAMF' ist der Name des Bundesamts fuer Migration und Fluechtlinge, \ndas in Deutschland Asylentscheidungen trifft.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 2,
                content: "It should recognize a person's Arabic dialect \nand should distinguish between, for example, Arabic Levantine and Egyptian Arabic.\n This should help to identify or verify the person's country of origin.",
                german:"Es sollte den arabischen Dialekt einer Person erkennen \nund z. B. zwischen levantinischem und aegyptischem Arabisch unterscheiden.\n Dies sollte helfen, das Herkunftsland der Person zu identifizieren oder zu verifizieren.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 3,
                content: "Since 2017, the algorithm was used over 10.000 times across Germany.\n",
                german: "Seit 2017 wurder der Algorithmus ueber 10.000 Mal in Deutschland verwendet.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 4,
                content: "By 2019, the total costs for the dialect recognition software amounted to \nover two million euros. \nBut what exactly is happening here?",
                german:"Bis 2019 betrugen die Gesamtkosten fuer die Dialekterkennungssoftware \nueber zwei Millionen Euro.\nDoch was genau passiert hier?",
                isImage: false,
                scale: 0.2
            },
            {
                id: 5,
                content: "Language has been used as a proxy for origin in asylum decisions in Germany before. \nThis took the form of language certificates. In such an examination, an Arabic language expert triggers, among other things, the use of regional expressions or local information in the person to identify the Arabic dialect and verify the country of origin.",
                german:"Die Sprache wurde bei Asylentscheidungen in Deutschland schon frueher als Proxy fuer die Herkunft verwendet. \nDas geschah in Form von Sprachzertifikaten. \nBei einer solchen Untersuchung loest ein arabischer Sprachexperte unter anderem \ndie Verwendung regionale Ausdruecke oder lokale Informationen bei der Person aus, \num den arabischen Dialekt zu erkennen und das Herkunftsland zu verifizieren.",
                isImage: false,
                scale: 0.13
            },
            {
                id: 6,
                content: "The algorithm works differently. \nIt uses Machine Learning.",
                german:"Dieser Algorithmus funktioniert anders. Er verwendet Maschinelles Lernen.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 7,
                content: "Machine learning is a process of using mathematical methods to \recognize patterns in training data and checking them against test data. \nFor an Arabic dialect recognition algorithm, \nthe data is Arabic speech samples with dialect labels.",
                german:"Maschinelles Lernen ist ein Prozess, \nbei dem mit mathematischen Methoden Muster in Trainingsdaten \nerkannt und mit Testdaten ueberprueft werden. \nFuer einen Algorithmus zur Erkennung eines arabischen Dialekts sind die Daten \narabische Sprachproben mit Dialektbezeichnungen.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 8,
                content: "Suppose we are talking about different dialects of English. \nSome speech samples might sound like this:",
                german:"Angenommen, es geht um verschiedene Dialekte von English. \nEinige Sprachproben koennten so klingen:",
                isImage: false,
                scale: 0.2
            },
            {
                id: 9,
                content: "Using the training samples, the algorithm learns which patterns constitute Scottish, Irish, or Southern English dialects.",
                german:"Anhand der Trainingsdaten lernt der Algorithmus, welche Muster schottische, irische oder suedenglische Dialekte ausmachen.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 10,
                content: "After listening to thousands of such samples, \nit may be able to tell that the dark sphere is Irish and the light sphere is Scottish",
                german:"Nach dem Anhoeren tausender solcher Proben kann es vielleicht erkennen, \n dass die dunkle Kugel irisch und die helle Kugel schottisch ist",
                isImage: false,
                scale: 0.2
            },
            {
                id: 11,
                content: "To make this decision clearer, the user is not given a yes or no answer, \nbut a percentage of how strong the decision is. \nFor example: 70% Irish, 30% Scottish. \nThat means I'm 70% sure this is Irish, \nbut it could also be 30% Scottish.",
                german:"Um diese Entscheidung deutlicher zu machen, \nwird dem Benutzer nicht eine Ja- oder Nein-Antwort gegeben, \nsondern ein Prozentsatz, wie stark die Entscheidung ist. \nZum Beispiel: 70 % irisch, 30 % schottisch. \nDas bedeutet: Ich bin mir zu 70 % sicher, dass dies irisch ist, \naber es koennte auch zu 30 % schottisch sein.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 12,
                content: "To see if the algorithm works, testing data is used. \nThe labels are hidden and the algorithm has the task, \nto detect which dialect is spoken in each test sample.",
                german: "Um zu Überprüfen, ob der Algorithmus funktioniert, werden Testdaten verwendet. \nDie Labels sind versteckt und der Algorithmus hat die Aufgabe zu erkennen, welcher Dialekt in jeder Testdatenprobe gesprochen wird.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 13,
                content: "Accuracy tells us how many of these tests were correct. \nFor example, our English dialect recognition algorithm could be applied \nwhen 90% of the test patterns were correctly recognized.",
                german: "Die Accuracy sagt uns, wie viele dieser Tests richtig waren. \nUnsere englische Dialekterkennung konnte z. B. angewendet werden, \nwenn 90 % der Testmuster richtig erkannt wurden.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 14,
                content: "How well the algorithm can distinguish between Scottish and Irish English depends a lot on the dataset used. \nIf we have many Scottish voices and few Irish voices, the algorithm is good with Scottish, but bad with Irish.",
                german:"Wie gut der Algorithmus zwischen schottischem und irischem Englisch unterscheiden kann, haengt stark von dem verwendeten Datensatz ab. \nWenn wir viele schottische Stimmen und nur wenige irische Stimmen haben, ist der Algorithmus gut mit Schottisch, aber schlecht mit Irisch.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 15,
                content: "That means, that many Scottish voice could be wrongly detected as Irish.",
                german:"Das bedeutet, dass viele schottische Stimmen faelschlicherweise als Irisch erkannt werden wuerden.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 16,
                content: "Let us return to our Arabic algorithm. The BAMF algorithm has an accuracy of 85 %, for Arabic - Levantite 90 %. \nThis means that 15 % (or 10 %) of all test patterns were misrecognised.",
                german: "Kehren wir zurueck zu unserem arabischen Algorithmus. \nDer BAMF-Algorithmus hat eine Genauigkeit von 85 %, fuer Arabisch - Levantitisch 90 % . \nDas bedeutet, dass 15 % (bzw. 10 %) aller Testmuster falsch erkannt wurden.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 17,
                content: "This is a huge number. \nIf we look at the 10.000 people this algorithm was used on, \nthe algorithm was probably wrong in 1500 cases.",
                german:"Das ist eine hohe Zahl. \nWenn wir die 10.000 Personen, bei denen der Algorithmus verwendetet wurde betrachten, \nlag der Algorithmus in 1500 Faellen falsch.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 18,
                content: "Let us look at our result again. \nWhat does those numbers now mean?",
                german:" Kommen wir zurueck zu dem Ergebnis. \nWas bedeuten diese Zahlen nun?",
                isImage: false,
                scale: 0.2
            },
            {
                id: 19,
                content: "They mean that the algorithm is 70% sure that Arabic is Levantine. \nThis 70% does not include the previously calculated accuracy. \nSo: the algorithm is 70% sure that the Arabic is Levantite, \nbut this certainty is only 85% correct.",
                german: "Sie bedeuten, dass der Algorithmus zu 70% sicher ist, \ndass das Arabische levantitisch ist. Diese 70 % beinhalten nicht die zuvor errechnete Genauigkeit. \nAlso: Der Algorithmus ist sich zwar zu 70 % sicher, dass das Arabisch Levantitisch ist, \naber diese Sicherheit ist nur zu 85 % korrekt.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 20,
                content: "That is not so much. \nEven though, informations like this \nare used in an Asylum decision process.",
                german: "Das ist nicht sonderlich viel. \nDennoch werden Informationen wie diese fuer Asylentscheidungsprozessen in Betracht gezogen.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 21,
                content: "The algorithm is only to be used for Arabic major dialects. \nJournalist Anna Biselli spoke with a refugee who speaks a Kurdish dialect and \nwhose speech sample nevertheless ran through the algorithm. \nHis dialect was recognised as 'Turkish'. \nThis could have been a reason for the decision to reject his asylum application. \n(the whole article is linked in the ressources)",
                german: "Der Algorithmus ist nur für arabische Großdialekte zu verwenden. \nDie Journalistin Anna Biselli sprach mit einem Geflüchteten, der einen kurdischen Dialekt spricht und \n dessen Sprachprobe trotzdem durch den Algorithmus lief. \nSein Dialekt wurde als 'türkisch' erkannt. \nDas könnte ein Grund für die Entscheidung gewesen sein, seinen Asylantrag abzulehnen. \n(der ganze Artikel ist in den Ressourcen verlinkt)",
                isImage: false,
                scale: 0.15
            },
            {
                id: 22,
                content: "With stories like this, it is interesting to take a closer look \nat how the algorithm is used by decision makers of the BAMF. \nAnna Biselli published the training documents of the BAMF for the decision makers.",
                german:"Bei Geschichten wie dieser ist es interessant, einen genaueren Blick darauf zu werfen, \n wie der Algorithmus von den Entscheider*innen des BAMF genutzt wird. \nAnna Biselli hat die Schulungsunterlagen des BAMF fuer die Entscheider*innen veroeffentlicht.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 23,
                content: "The person for whom the algorithm is used must speak Arabic. \nSThey are to speak into a telephone and describe a given picture for about two minutes.",
                german:"Die Person, fuer die der Algorithmus verwendet wird, muss arabisch sprechen. \nSie soll in ein Telefon sprechen und etwa zwei Minuten lang ein vorgegebenes Bild beschreiben.",
                isImage: false,
                scale: 0.15
            },
            {
                id: 24,
                content: "Their voice is recorded and analized. \nThe decision maker receives a result.",
                german: "Ihre Stimme wird aufgezeichnet und analisiert. \nDer/die Entscheider*in erhaelt ein Ergebnis.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 25,
                content: "This result should never be used alone for an asylum decision, \nbut it should serve as additional information or indication for the decision-maker.",
                german: "Dieses Ergebnis sollte niemals allein fuer eine Asylentscheidung verwendet werden, \naber es sollte als zusaetzliche Information oder Indiz fuer den Entscheidungstraeger dienen.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 26,
                content: "This is explicitly stated in the training documents, \nbut in reality there were cases where these rules were not known or not followed.",
                german:"Dies steht ausdruecklich in den Schulungsunterlagen, \naber in der Realitaet gab es Faelle, in denen diese Regeln nicht bekannt waren oder nicht befolgt wurden.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 27,
                content:"The algorithm was also used for people \nwho come from non-Arabic-speaking countries such as Kenya or Venezuela.",
                german: "Der Algorithmus wurde außerdem fuer Personen verwendet, \ndie aus nicht-arabischsprachigen Laendern wie Kenia oder Venezuela stammen.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 28,
                content: "Another interesting fact about the training documents is \nthat the sound-to-noise ratio (SNR) is marked as 'not relevant' in the documents. \nThis is an important measure of the quality of the sound \nwhich should be taken into account.",
                german:"Eine weitere interessante Tatsache ueber die Trainingsdokumente ist, \n dass der Rauschabstand (SNR) in den Dokumenten als 'nicht relevant' markiert ist. \nDas ist ein wichtiges Maße fuer die Qualitaet des Klangs \n, die beruecksichtigt werden sollte.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 29,
                content: "With poor audio quality, this speech algorithm cannot get a good result.",
                german: "Mit schlechter Audioqualitaet kann dieser Sprachalgorithmus zu keinem guten Ergebnis kommen.",
                isImage: false,
                scale: 0.2
            },

            {
                id: 30,
                content: "But let's assume the algorithm would work with a high accuracy \nand all decision makers would apply it correctly. Would it then be ethical?",
                german: "Aber nehmen wir einmal an, der Algorithmus wuerde mit einer hohen Genauigkeit arbeiten \nund alle Entscheider*innen wuerden ihn korrekt anwenden. Waere es dann ethisch vertretbar?",
                isImage: false,
                scale: 0.2
            },
            {
                id: 31,
                content: "For that, we need to look more closely at dialects and what it means to have a dialect.",
                german: "Dafuer muessen wir uns Dialekte und was es bedeutet, einen Dialekt zu haben, genauer anschauen.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 32,
                content: "Looking at this map, we can see that \n the Arabic dialects are not bound by borders. \nCan we assume that a dialect refers to a country of origin at all?",
                german:"Wenn man sich diese Karte ansieht, kann man erkennen, dass \n die arabischen Dialekte nicht an Grenzen gebunden sind. \nKoennen wir ueberhaupt davon ausgehen, dass sich ein Dialekt auf\n ein Herkunftsland bezieht?",
                isImage: false,
                scale: 0.1
            },
            {
                id: 33,
                content: "Moreover, a person does not automatically have the \n dialect of the region in which they were born. \nThe dialect is strongly connected with socialization.",
                german: "Außerdem hat eine Person nicht automatisch den Dialekt der Region, \nin der sie geboren wurde. \nDer Dialekt ist stark mit der Sozialisation verbunden.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 34,
                content: "You have to take into account \nwhere a person grew up, \nwhat their level of education is, \nwho their social group or family was, \nwhat social class they were in and \nwhere they were socialized. \nThe individual biography strongly influences the dialect.",
                german:"Man muss beruecksichtigen, \nwo eine Person aufgewachsen ist, \nwas ihr Bildungsstand ist, \nwer ihre soziale Gruppe oder ihre Familie war, \nin welcher sozialen Schicht sie waren und \nwo sie sozialisiert wurde. \nDie individuelle Biographie beeinflusst den Dialekt stark.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 35,
                content: "A long history of refuge can therefore also influence the dialect.",
                german: "Eine lange Fluchtgeschichte kann ebenfalls Einfluss auf den Dialekt nehmen.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 36,
                content: "Often a dialect can also depend on social groups and be suppressed and unlearned by people, for example, \nto belong to a different group or to hide the fact \nthat they belong to a marginalized minority.",
                german:"Oft kann ein Dialekt auch von sozialen Gruppen abhaengen \nund von Personen unterdrueckt und verlernt werden, \num z. B. zu einer anderen Gruppe zu gehoeren oder zu verbergen, \ndass sie einer marginalisierten Minderheit angehoeren.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 37,
                content: "All these complex social and biographical factors play an important role in one's dialect.",
                german:"All diese komplexen sozialen und biografischen Faktoren spielen eine wichtige Rolle fuer den eigenen Dialekt.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 38,
                content: "Therefore, the result of the algorithm could be explained by factors \n that are not directly related to the country of origin.",
                german: "Daher koennte das Ergebnis des Algorithmus durch Faktoren \n erklaert werden, die nicht direkt mit dem Herkunftsland zusammenhaengen.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 39,
                content: "An asylum seeker could explain the result in the hearing if asked. \nThis is not always the case, because the algorithm was often applied after the interview, \nwhen a language certificate was planned, but then replaced by the algorithm.",
                german: "Ein*e Asylbewerber*in koennte das Ergebnis in der Anhoerung erklaeren, \nwenn er/sie gefragt wird. \nDas ist nicht immer der Fall, da der Algorithmus nach der Anhoerung angewandt wurde, \nwenn ein Sprachzertifikat geplant war, aber dann durch den Algorithmus ersetzt wurde.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 40,
                content: "If asylum is denied because the country of origin was found to be wrong,\n the person has only one week to file an appeal of that decision.\nWith that time frame, it is usually only possible for people \n who are already connected to nonprofit organizations \n or other people who can help.",
                german:"Wenn Asyl abgelehnt wird, weil das Herkunftsland als falsch erkannt wurde, \n hat die Person nur eine Woche Zeit, um gegen diese Entscheidung zu klagen.\nMit diesem Zeitrahmen ist es meist nur fuer Menschen moeglich, \n die bereits mit gemeinnuetzigen Organisationen \n oder anderen Menschen, die helfen koennen, verbunden sind.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 41,
                content: "That means this algorithm could influence decisions that are far-reaching and drastic for people who are wrongly denied asylum.",
                german:"Das bedeutet, dass dieser Algorithmus Entscheidungen beeinflussen kann, \ndie fuer die Menschen, denen das Asyl faelschlicherweise verweigert wird, \nweitreichend und drastisch sind.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 42,
                content: "Although it has been announced, \nthere is no scientific monitoring of this algorithm yet.",
                german: "Obwohl es angekuendigt wurde, \ngibt es noch keine wissenschaftliche ueberwachung dieses Algorithmus.",
                isImage: false,
                scale: 0.2
            },

            {
                id: 43,
                content: "stories about algorithm ethics. \nthe BAMF case. \n\njohanna hartmann",
                german: "stories about algorithm ethics. \nthe BAMF case. \n\njohanna hartmann",
                isImage: false,
                scale: 0.2
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

<style scoped>

.BAMF{
    overflow: hidden;
}
</style>