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
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin:0;
  position: relative;
}

#home{
  margin:0;
}


#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>

