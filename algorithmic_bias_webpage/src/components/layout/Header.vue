<template>
    <header class= "header">
        <h1>Algorithmic Bias</h1>
        <div class="nav">
            <router-link to="/">Home</router-link> |
            <router-link to="/about">About</router-link>
        </div>
    </header>    
</template>

<style scoped lang="scss">

@import "@/assets/_config.scss";
    .header{
        color: $light;
        position: absolute;
        margin: 0 auto 0 2rem;
        padding-top: 1rem;
        display:flex;
        flex-direction: row;
        align-items: center;
        position: fixed;
        z-index:1;

        h1{
            padding:0;
            margin:0;
        }

        .nav {
            margin-left:2rem;
        
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
