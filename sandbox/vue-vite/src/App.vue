<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import HelloWorld from "./components/HelloWorld.vue";
import { init, Query } from "@dorilama/instantdb-vue";
import { Exactly } from "@instantdb/core";

// Visit https://instantdb.com/dash to get your APP_ID :)
const APP_ID = import.meta.env["VITE_INSTANT_APP_ID"];

// Optional: Declare your schema for intellisense!
interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

type Schema = {
  todos: Todo;
};

const db = init<Schema>({ appId: APP_ID });

const query = ref<Exactly<Query, Query>>({ todos: {} });

const { isLoading, error, data } = db.useQuery(query);
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
  <p v-if="isLoading">loading</p>
  <ul v-else>
    <li v-for="todo in data?.todos || []" :key="todo.id">{{ todo.text }}</li>
  </ul>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
