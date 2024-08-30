<template>
  <div class="todo-list">
    <div v-for="todo in props.todos" :key="todo.id" class="todo">
      <input
        type="checkbox"
        :key="todo.id"
        class="checkbox"
        :checked="todo.done"
        @change="toggleDone(todo)"
      />
      <div class="todo-text">
        <span
          :style="{ textDecoration: todo.done ? 'line-through' : 'none' }"
          >{{ todo.text }}</span
        >
      </div>
      <span class="delete" @click="deleteTodo(todo)">𝘟</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { tx } from "@dorilama/instantdb-vue";
import { db, Todo } from "../db";

const props = defineProps<{ todos: Todo[] }>();

function toggleDone(todo: Todo) {
  db.transact(tx.todos[todo.id].update({ done: !todo.done }));
}

function deleteTodo(todo: Todo) {
  db.transact(tx.todos[todo.id].delete());
}
</script>

<style scoped>
.todo-list {
  box-sizing: inherit;
  width: 350px;
}
.checkbox {
  font-size: 30px;
  margin-left: 5px;
  margin-right: 20px;
  cursor: pointer;
}
.todo {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid lightgray;
  border-bottom-width: 0px;
}
.todo-text {
  flex-grow: 1;
  overflow: hidden;
}
.delete {
  width: 25px;
  cursor: pointer;
  color: lightgray;
}
</style>
