<template>
  <div
    class="flex justify-between items-center gap-8 p-2"
    :class="[(todos.length == 0 || todos.length > 1) && 'border-t']"
  >
    <p class="text-sm leading-8">
      Remaining todos:
      <span class="font-mono border rounded-md p-1">
        <span v-if="remainingTodo < 100" class="countdown"
          ><span :style="`--value: ${remainingTodo}`"></span
        ></span>
        <span v-else>{{ remainingTodo }}</span>
      </span>
    </p>
    <button class="btn btn-ghost btn-xs" @click="deleteCompleted(props.todos)">
      Delete Completed
    </button>
  </div>
</template>

<script lang="ts" setup>
import { deleteCompleted } from "@/db/todo";
import type { Todo } from "@/db";
import { computed } from "vue";

const props = defineProps<{ todos: Todo[] }>();
const remainingTodo = computed(() => {
  return props.todos.filter((todo) => !todo.done).length;
});
</script>

<style scoped></style>
