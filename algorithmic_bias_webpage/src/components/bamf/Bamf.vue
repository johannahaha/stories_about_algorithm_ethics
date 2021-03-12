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
                content: "Imagine describing a picture. \nYour voice is analyzed by an algorithm. \nThis recognizes which dialect you may have. \nYou are more likely to stay if your dialect matches where you were born. \nAnd the person who decides whether you stay sees the result.",
                german:"Stell dir vor, du beschreibst ein Bild. \nDeine Stimme wird von einem Algorithmus analysiert. \nDieser erkennt, welchen Dialekt du moeglicherweise hast. \nEs ist wahrscheinlicher, dass du bleiben kannst, wenn dein Dialekt zu deinem Geburtsort passt. \nUnd die Person, die entscheidet, ob du bleibst, sieht das Ergebnis.",
                isImage: false,
                scale: 0.2
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
                content: "It should recognize a person's Arabic dialect \nand should distinguish between, for example, Arabic Levantine and Egyptian Arabic.\nThis should help to identify or verify the person's country of origin.",
                german:"Es sollte den arabischen Dialekt einer Person erkennen \nund z. B. zwischen levantinischem und aegyptischem Arabisch unterscheiden.\nDies sollte helfen, das Herkunftsland der Person zu identifizieren oder zu verifizieren.",
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
                content: "By 2019, the total costs for the dialect recognition software amounted to over two million euros. \nBut what exactly is happening here?",
                german:"Bis 2019 betrugen die Gesamtkosten fuer die Dialekterkennungssoftware \nueber zwei Millionen Euro.\nDoch was genau passiert hier?",
                isImage: false,
                scale: 0.2
            },
            {
                id: 5,
                content: "Language has been used as a proxy for origin in asylum decisions in Germany before. \nThis took the form of language certificates. \nIn such an examination, an Arabic language expert triggers, among other things, \nthe use of regional expressions or local information in the person \nto identify the Arabic dialect and verify the country of origin.",
                german:"Die Sprache wurde bei Asylentscheidungen in Deutschland \nschon frueher als Proxy fuer die Herkunft verwendet. \nDas geschah in Form von Sprachzertifikaten. \nBei einer solchen Untersuchung loest ein*e arabische*r Sprachexpert*in unter anderem \ndie Verwendung regionaler Ausdruecke oder lokaler Informationen bei der Person aus, \num den arabischen Dialekt zu erkennen und das Herkunftsland zu verifizieren.",
                isImage: false,
                scale: 0.11
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
                content: "Machine learning is a process of using mathematical methods to \nrecognize patterns in training data and checking them against test data. \nFor an Arabic dialect recognition algorithm, \nthe data is Arabic speech samples with dialect labels.",
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
                content: "After listening to thousands of such samples, \nit may be able to tell that \nthe dark sphere is Irish and the light sphere is Scottish",
                german:"Nach dem Anhoeren tausender solcher Proben kann es vielleicht erkennen, \ndass die dunkle Kugel irisch und die helle Kugel schottisch ist",
                isImage: false,
                scale: 0.2
            },
            {
                id: 11,
                content: "To make this decision clearer, the user is not given a yes or no answer, \nbut a percentage of how strong the decision is. \nFor example: 70% Irish, 30% Scottish.\n\nThat means I'm 70% sure this is Irish, \nbut it could also be 30% Scottish.",
                german:"Um diese Entscheidung deutlicher zu machen, \nwird dem Benutzer nicht eine Ja- oder Nein-Antwort gegeben, \nsondern ein Prozentsatz, wie stark die Entscheidung ist. \nZum Beispiel: 70 % irisch, 30 % schottisch. \n\nDas bedeutet: Ich bin mir zu 70 % sicher, dass dies irisch ist, \naber es koennte auch zu 30 % schottisch sein.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 12,
                content: "To see if the algorithm works, testing data is used. \nThe labels are hidden and the algorithm has the task, \nto detect which dialect is spoken in each test sample.",
                german: "Um zu Ueberpruefen, ob der Algorithmus funktioniert, werden Testdaten verwendet. \nDie Labels sind versteckt und der Algorithmus hat die Aufgabe zu erkennen, \nwelcher Dialekt in jeder Testdatenprobe gesprochen wird.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 13,
                content: "Accuracy tells us how many of these tests were correct. \nFor example, our English dialect recognition algorithm could be applied \nwhen 90% of the test patterns were correctly recognized.",
                german: "Die Accuracy sagt uns, wie viele dieser Tests richtig waren. \nUnsere englische Dialekterkennung konnte z. B. angewendet werden, \nwenn 90 % der Testdaten richtig erkannt wurden.",
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
                content: "That means, that many Scottish voices could be wrongly detected as Irish.",
                german:"Das bedeutet, dass viele schottische Stimmen faelschlicherweise als Irisch erkannt werden wuerden.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 16,
                content: "Let us return to our Arabic algorithm. The BAMF algorithm has an accuracy of 85 %, for Arabic - Levantine 90 %. \nThis means that 15 % (or 10 %) of all test patterns were misrecognised.",
                german: "Kehren wir zurueck zu unserem arabischen Algorithmus. \nDer BAMF-Algorithmus hat eine Genauigkeit von 85 %, fuer Arabisch - Levantitisch 90 % . \nDas bedeutet, dass 15 % (bzw. 10 %) aller Testmuster falsch erkannt wurden.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 17,
                content: "This is a huge number. \nIf we look at the 10.000 people this algorithm was used on, \nthe algorithm was probably wrong in 1500 cases.",
                german:"Das ist eine hohe Zahl. \nWenn wir die 10.000 Personen, bei denen der Algorithmus verwendetet wurde betrachten, \nlag der Algorithmus wahrscheinlich in 1500 Faellen falsch.",
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
                content: "They mean that the algorithm is 76 % sure that dialect is Gulf Arabic. \nThis 76 % does not include the previously calculated accuracy. \nSo: the algorithm is 76 % sure that the dialect is Gulf Arabic, \nbut this certainty is only 85 % correct.",
                german: "Sie bedeuten, dass der Algorithmus zu 76 % sicher ist, \ndass der Dialekt Golf-Arabisch ist. Diese 76 % beinhalten nicht die zuvor errechnete Genauigkeit. \nAlso: Der Algorithmus ist sich zwar zu 76 % sicher, dass der Dialekt Golf-Arabisch ist, \naber diese Sicherheit ist nur zu 85 % korrekt.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 20,
                content: "That is not so much. \nEven though, informations like this \nare used in an Asylum decision process.",
                german: "Das ist nicht sonderlich viel. \nDennoch werden Informationen wie diese \nfuer Asylentscheidungsprozessen in Betracht gezogen.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 21,
                content: "The algorithm is only to be used for Arabic major dialects. \nJournalist Anna Biselli spoke with a refugee who speaks a Kurdish dialect and \nwhose speech sample nevertheless ran through the algorithm. \nHis dialect was recognised as 'Turkish'. \nThis could have been a reason for the decision to reject his asylum application. \n(the whole article is linked in the ressources)",
                german: "Der Algorithmus ist nur für arabische Grossdialekte zu verwenden. \nDie Journalistin Anna Biselli sprach mit einem Gefluechteten, der einen kurdischen Dialekt spricht und \ndessen Sprachprobe trotzdem durch den Algorithmus lief. \nSein Dialekt wurde als 'tuerkisch' erkannt. \nDas könnte ein Grund fuer die Entscheidung gewesen sein, seinen Asylantrag abzulehnen. \n(der ganze Artikel ist in den Ressourcen verlinkt)",
                isImage: false,
                scale: 0.15
            },
            {
                id: 22,
                content: "With stories like this, it is interesting to take a closer look \nat how the algorithm is used by decision makers of the BAMF. \nAnna Biselli published the training documents of the BAMF for the decision makers.",
                german:"Mit Geschichten wie dieser ist es interessant, einen genaueren Blick darauf zu werfen, \nwie der Algorithmus von den Entscheider*innen des BAMF genutzt wird. \nAnna Biselli hat die Schulungsunterlagen des BAMF fuer die Entscheider*innen veroeffentlicht.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 23,
                content: "The person for whom the algorithm is used must speak Arabic. \nThey are to speak into a telephone and describe a given picture for about two minutes.",
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
                german: "Dieses Ergebnis sollte niemals allein fuer eine Asylentscheidung verwendet werden, \naber es sollte als zusaetzliche Information oder Indiz fuer den/die Entscheider*in dienen.",
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
                content:"The algorithm was also used for people \nwho come from non-Arabic-speaking countries \nsuch as Kenya or Venezuela.",
                german: "Der Algorithmus wurde ausserdem fuer Personen verwendet, \ndie aus nicht-arabischsprachigen Laendern \nwie Kenia oder Venezuela stammen.",
                isImage: false,
                scale: 0.1
            },
            {
                id: 28,
                content: "Another interesting fact about the training documents is \nthat the sound-to-noise ratio (SNR) is marked as 'not relevant' in the documents. \nThis is an important measure of the quality of the sound \nwhich should be taken into account.",
                german:"Eine weitere interessante Tatsache ueber die Trainingsdokumente ist, \ndass der Rauschabstand (SNR) in den Dokumenten als 'nicht relevant' markiert ist. \nDas ist ein wichtiges Masse fuer die Qualitaet des Klangs, \ndie beruecksichtigt werden sollte.",
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
                content: "Looking at this map, we can see that \nthe Arabic dialects are not bound by borders. \nCan we assume that a dialect refers \nto a country of origin at all?",
                german:"Wenn man sich diese Karte ansieht, kann man erkennen, dass \ndie arabischen Dialekte nicht an Grenzen gebunden sind. \nKoennen wir ueberhaupt davon ausgehen, dass sich ein Dialekt auf\nein Herkunftsland bezieht?",
                isImage: false,
                scale: 0.1
            },
            {
                id: 33,
                content: "Moreover, a person does not automatically have the \ndialect of the region in which they were born. \nThe dialect is strongly connected with socialization.",
                german: "Ausserdem hat eine Person nicht automatisch den Dialekt der Region, \nin der sie geboren wurde. \nDer Dialekt ist stark mit der Sozialisation verbunden.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 34,
                content: "You have to take into account \nwhere a person grew up, \ntheir level of education, \ntheir social group or family, \ntheir social class and \ntheire socialization. \nThe individual biography strongly influences the dialect.",
                german:"Man muss beruecksichtigen, \nwo eine Person aufgewachsen ist, \nihren Bildungsstand, \n ihre soziale Gruppe oder ihre Familie, \nihre soziale Schicht und \nihre Sozialisierung. \nDie individuelle Biographie beeinflusst den Dialekt stark.",
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
                content: "Often a dialect can also depend on social groups \nand be suppressed and unlearned by people, for example, \nto belong to a different group or to hide the fact \nthat they belong to a marginalized minority.",
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
                content: "Therefore, the result of the algorithm could be explained by factors \nthat are not directly related to the country of origin.",
                german: "Daher koennte das Ergebnis des Algorithmus durch Faktoren \nerklaert werden, die nicht direkt mit dem Herkunftsland zusammenhaengen.",
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
                content: "If asylum is denied because the country of origin was found to be wrong,\nthe person has only one week to file an appeal of that decision.\nWith that time frame, it is usually only possible for people \nwho are already connected to nonprofit organizations \nor other people who can help.",
                german:"Wenn Asyl abgelehnt wird, weil das Herkunftsland als falsch erkannt wurde, \nhat die Person nur eine Woche Zeit, um gegen diese Entscheidung zu klagen.\nMit diesem Zeitrahmen ist es meist nur fuer Menschen moeglich, \ndie bereits mit gemeinnuetzigen Organisationen \noder anderen Menschen, die helfen koennen, verbunden sind.",
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
                german: "Obwohl es angekuendigt wurde, \ngibt es noch keine wissenschaftliche Begleitung dieses Algorithmus.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 43,
                content: "BAMF plans a pilot project to use this algorithm across the EU.",
                german: "Das BAMF plant ein Pilotproject, um den Algorithmus in der EU zu verwenden.",
                isImage: false,
                scale: 0.2
            },
            {
                id: 44,
                content: "stories about algorithm ethics. \nthe BAMF case. \n\njohanna hartmann",
                german: "stories about algorithm ethics. \nder BAMF Fall. \n\nJohanna Hartmann",
                isImage: false,
                scale: 0.2
            },
            {
                id: 55,
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