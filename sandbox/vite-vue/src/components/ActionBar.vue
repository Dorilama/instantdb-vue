<template>
  <div class="action-bar">
    <div>
      Remaining todos: {{ props.todos.filter((todo) => !todo.done).length }}
    </div>
    <div style="cursor: pointer" @click="deleteCompleted(props.todos)">
      Delete Completed
    </div>
  </div>
</template>

<script lang="ts" setup>
import { deleteCompleted } from "@/db/todo";
import type { Todo } from "@/db";

const props = defineProps<{ todos: Todo[] }>();
</script>

<style scoped>
.action-bar {
  display: flex;
  justify-content: space-between;
  width: 328px;
  padding: 10px;
  border: 1px solid lightgray;
  font-size: 10px;
}
.footer {
  margin-top: 20px;
  font-size: 10px;
}
</style>
