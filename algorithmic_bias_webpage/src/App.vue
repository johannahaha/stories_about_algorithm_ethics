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

*{
  margin: 0;
  padding: 0;
  outline: 0;
  box-sizing: border-box; 
}

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

@include media-md{
    
    #home div{

      section{
        padding-left: 15%;
        padding-right: 15%;
      }

      .bamf_intro_start_language{
        display: flex;
        flex-direction: row;
        justify-content: center
      }
    }
}

@include media-lg{
    #home div{

      section{
        padding-left: 20%;
        padding-right: 20%;
      }

    }
}

@include media-xl{
    #home div{

      section{
        padding-left: 25%;
        padding-right: 25%;
      }

    }

}

</style>

