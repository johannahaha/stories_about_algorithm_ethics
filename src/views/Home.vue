<template>
    <div id="home"> 
        <Introduction />
    </div>
</template>

<script>
import Introduction from "../components/Introduction.vue"
export default {
    name: "Home",
    components: {
        Introduction
    }
    
}
</script>

<style scoped>
#home{
    text-align: center;
    color: #2d305a;
    margin-top: 60px;
}
</style>