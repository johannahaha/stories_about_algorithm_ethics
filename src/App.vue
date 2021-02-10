<template>
  <div id="nav">
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

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin:0;
  overflow: hidden;
}

#home{
  margin:0;
}

#nav {
  padding: 0.5rem;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>

