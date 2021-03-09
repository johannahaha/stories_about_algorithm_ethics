<template>
  <div>
    <Header></Header>
    <router-view/>
  </div>
</template>



<script>
import Header from "./components/layout/Header.vue";

export default{
  name:"app",
  components:{
    Header
  }
}
</script>

<style lang="scss">
@import "./assets/_config.scss";

html,body{
  margin:0;
  min-height: 100vh;
  min-height: -webkit-fill-available;
  height: -webkit-fill-available;
  &.sketch{
    overflow:hidden;
  }

}

#app {
  font-family: Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $light;
  margin:0;
  position: relative;
  background: $dark;
}

#home{
  margin:0;
    text-align: center;
    color: $light;
}

.about{
  width: 70vw;
}

</style>

