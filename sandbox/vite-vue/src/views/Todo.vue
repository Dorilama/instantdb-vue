<template>
  <div v-if="isLoading"><p>Data is loading...</p></div>
  <div v-else class="flex flex-col items-center pt-4 pb-8 px-2 gap-4">
    <h1 class="text-4xl">Todo</h1>
    <div class="card card-bordered rounded-lg bg-base-100 sm:min-w-96">
      <TodoForm :todos="data?.todos || []" :room="chatRoomoom" />
      <TodoList :todos="data?.todos || []" />
      <ActionBar :todos="data?.todos || []" />
    </div>
    <!-- <div class="container">
      <div class="header">Todo</div>
      <TodoForm :todos="data?.todos || []" :room="chatRoomoom" />
      <TodoList :todos="data?.todos || []" />
      <ActionBar :todos="data?.todos || []" />
      <div v-if="error">
        <p>Error: {{ error.message || "unknown error" }}</p>
      </div>
    </div> -->
  </div>
</template>
<script setup lang="ts">
import { db, chatRoomoom } from "@/db";
import TodoForm from "@/components/TodoForm.vue";
import TodoList from "@/components/TodoList.vue";
import ActionBar from "@/components/TodoFooter.vue";

const { isLoading, data, error } = db.useQuery({ todos: {} });
</script>

<style scoped></style>
