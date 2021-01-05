<template>
    <div class="todo-item" v-bind:class="{'is-complete':todo_prop.completed}">
        <p>
            <input type="checkbox" v-on:change="markComplete"/>
            {{todo_prop.title}}
            <button @click="$emit('del-todo',todo_prop.id)" class = "del-button">x</button>
        </p>
    </div>
</template>

<script>
export default{
    name: "TodoItem",
    props: ["todo_prop"],
    methods:{
        markComplete(){
            console.log(12);
            //this.todo.completed = !this.todo.completed;
        }
    }
}
</script>

<style scoped>

.is-complete{
    text-decoration: line-through;
}

</style>