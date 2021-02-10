<template>
    <div>
        <h1>TodoList</h1>
        <div v-bind:key="todo.id" v-for="todo in todoList"> 
            <TodoItem v-bind:todo_prop="todo" v-on:del-todo="$emit('del-todo',todo.id)"/>
        <!--<div v-bind:key="todo.id" v-for="todo in todoList"> -->
        </div>
    </div>
</template>

<script>
import TodoItem from "./TodoItem.vue"

export default {
    name: "TodoList",
    props: ["todoList"],
    components: {
        TodoItem
    }
}
</script>

<style scoped>

</style>