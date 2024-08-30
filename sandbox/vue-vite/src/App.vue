<script setup lang="ts">
import { db } from "./db";
import TodoForm from "./components/TodoForm.vue";
import TodoList from "./components/TodoList.vue";
import ActionBar from "./components/ActionBar.vue";

const { isLoading, data, error } = db.useQuery({ todos: {} });
</script>

<template>
  <div v-if="isLoading"><p>Data is loading...</p></div>
  <div v-else>
    <div class="container">
      <div class="header">Todo</div>
      <TodoForm :todos="data?.todos || []" />
      <TodoList :todos="data?.todos || []" />
      <ActionBar :todos="data?.todos || []" />
    </div>
    <div v-if="error">
      <p>Error: {{ error.message || "unknown error" }}</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  box-sizing: border-box;
  background-color: #fafafa;
  font-family: code, monospace;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.header {
  letter-spacing: 2px;
  font-size: 50px;
  color: lightgray;
  margin-bottom: 10px;
}
</style>
