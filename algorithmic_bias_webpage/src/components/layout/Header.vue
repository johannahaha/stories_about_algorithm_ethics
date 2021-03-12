<template>
    <header class= "header">
        <h1>Stories about Algorithm Ethics </h1>
        <div class="nav">
            <router-link to="/">Home</router-link> |
            <router-link to="/about">About</router-link>
        </div>
    </header>    
</template>

<style scoped lang="scss">

@import "@/assets/_config.scss";

@include media-md{

    .header{

        position: absolute;
        h1{
            font-size: 1.5rem !important;
        }

        nav{
            font-size: 1rem !important;
        }
    }
}

.header{
    color: $light;
    margin: 0 auto;
    padding-top: 1rem;
    padding-left: 2rem;
    display:flex;
    flex-direction: row;
    align-items: center;
    position: absolute;
    z-index:1;

    h1{
        padding:0;
        margin:0;
        font-size:1rem;
    }

    .nav {
        margin-left:2rem;
        font-size:1rem;
    
        a {
            font-weight: bold;
            color: $light;
            text-decoration: none;
            align-self: center;

            &.router-link-exact-active{
                color: $lightmiddle;
            }
        }
    }
}

a{
text-decoration: none;
color: $lightmiddle;
}

</style>
