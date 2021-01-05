<template>
    <div>
        <form @submit="addTodo"> 
            <input type="text" name="title" placeholder="Add To Do" v-model="title">
            <input type="submit" name="Submit" class="btn">
        </form>
    </div>
</template>

<script>
import uuid from "uuid";

export default{
    name: "AddTodo",
    data() {
        return{
            title: ''
        }
    },
    methods: {
        addTodo(e){
            e.preventDefault();
            const newTodo = {
                id: uuid.v4(),
                title: this.title,
                completed: false,
            }
            this.$emit('add-todo',newTodo);
            this.title = "";
            console.log("i am adding the task");
        }
    }
}
</script>

<style scoped>

</style>