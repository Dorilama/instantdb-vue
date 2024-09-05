<template>
  <div
    class="flex justify-between items-center gap-8 p-2"
    :class="[!todos.length && 'border-t']"
  >
    <p class="text-sm">
      Remaining todos: {{ props.todos.filter((todo) => !todo.done).length }}
    </p>
    <button class="btn btn-ghost btn-xs" @click="deleteCompleted(props.todos)">
      Delete Completed
    </button>
  </div>
</template>

<script lang="ts" setup>
import { deleteCompleted } from "@/db/todo";
import type { Todo } from "@/db";

const props = defineProps<{ todos: Todo[] }>();
</script>

<style scoped>
.action-barz {
  display: flex;
  justify-content: space-between;
  width: 328px;
  padding: 10px;
  border: 1px solid lightgray;
  font-size: 10px;
}
.footerz {
  margin-top: 20px;
  font-size: 10px;
}
</style>
