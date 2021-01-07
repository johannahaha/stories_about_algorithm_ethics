<template>
  <div id = "app">
    <TodoList v-bind:todoList="todos" v-on:del-todo="deleteTodo"/>
    <AddTodo v-on:add-todo="addTodo"/>
  </div>
</template>

<script>

import TodoList from "../components/TodoList.vue";
import AddTodo from "../components/AddTodo.vue";

export default {
  name: "App",
  components: {
    TodoList,
    AddTodo
  },
  data() {
    return {
      todos: [
        {
          id: 1,
          title: "Watch this video",
          completed: false
        },
        {
          id: 2,
          title: "Setup Vue",
          completed: true
        },
        {
          id: 3,
          title: "Take a lunch break",
          completed: false
        }

      ] 
    }
  },
  methods: {
    deleteTodo(id){
      this.todos = this.todos.filter(todo => todo.id !== id);
    },
    addTodo(newTodo){
      this.todos = [...this.todos,newTodo];
      console.log("task is added to data");
      console.log(newTodo);
    }
  } 
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

