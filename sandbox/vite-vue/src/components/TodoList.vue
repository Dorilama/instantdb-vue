<template>
  <table class="table border-t rounded-none">
    <tbody>
      <tr
        v-for="todo in props.todos"
        :key="todo.id"
        class="flex justify-between"
      >
        <td class="flex-none flex items-center">
          <input
            type="checkbox"
            :key="todo.id"
            class="checkbox checkbox-sm"
            :checked="todo.done"
            @change="toggleDone(todo)"
          />
        </td>

        <td class="flex-auto flex items-center">
          <span :class="todo.done ? 'line-through' : 'no-underline'">{{
            todo.text
          }}</span>
        </td>
        <td>
          <button
            class="btn btn-ghost btn-square btn-sm text-xl"
            aria-label="delete"
            @click="deleteTodo(todo)"
          >
            <span aria-hidden="true" class="icon-[mdi--bin-outline]"></span>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { toggleDone, deleteTodo } from "@/db/todo";
import type { Todo } from "@/db";

const props = defineProps<{ todos: Todo[] }>();
</script>

<style scoped></style>
