<script setup lang="ts">
import { db } from "./db";
import TodoForm from "./components/TodoForm.vue";
import TodoList from "./components/TodoList.vue";
import ActionBar from "./components/ActionBar.vue";
import { watchEffect } from "vue";

import { Cursors } from "@dorilama/instantdb-vue/components";

const { isLoading, data, error } = db.useQuery({ todos: {} });
const room = db.room("chat", "main");
const randomId = Math.random().toString(36).slice(2, 6);
const user = {
  name: `User#${randomId}`,
};
const {
  user: myPresence,
  peers,
  publishPresence,
  isLoading: isLoadingPresence,
} = room.usePresence();

watchEffect(() => {
  if (isLoadingPresence.value) {
    return;
  }
  publishPresence(user);
});
room.useTopicEffect("notification", (event, peer) => {
  console.log(`${peer.name} just created a todo: ${event.text}`);
});
</script>

<template>
  <Cursors :room="room">
    <div v-if="isLoading"><p>Data is loading...</p></div>
    <div v-else>
      <div class="container">
        <div class="header">Todo</div>
        <TodoForm :todos="data?.todos || []" :room="room" />
        <TodoList :todos="data?.todos || []" />
        <ActionBar :todos="data?.todos || []" />
        <div v-if="error">
          <p>Error: {{ error.message || "unknown error" }}</p>
        </div>
        <p>Room: {{ room.id }}</p>
        <ul v-if="Object.values(peers).length">
          <li v-for="peer of peers" :key="peer.name">{{ peer.name }}</li>
        </ul>
        <p v-else>nobody here</p>
      </div>
    </div></Cursors
  >
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
