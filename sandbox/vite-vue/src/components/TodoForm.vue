<template>
  <div class="form">
    <div class="toggle-all" @click="toggleAll(props.todos)">⌄</div>
    <form @submit="onSubmit">
      <input
        class="input"
        autoFocus
        placeholder="What needs to be done?"
        type="text"
        v-model="model"
      />
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { addTodo, toggleAll } from "@/db/todo";
import type { Todo } from "@/db";

const props = defineProps<{
  todos: Todo[];
}>();

const model = ref("");

function onSubmit(e: Event) {
  e.preventDefault();
  addTodo(model.value);
  model.value = "";
}
</script>

<style scoped>
.form {
  box-sizing: inherit;
  display: flex;
  border: 1px solid lightgray;
  border-bottom-width: 0px;
  width: 350px;
}
.toggle-all {
  font-size: 30px;
  cursor: pointer;
  margin-left: 11px;
  margin-top: -6px;
  width: 15px;
  margin-right: 12px;
}
.input {
  background-color: transparent;
  font-family: code, monospace;
  width: 287px;
  padding: 10px;
  font-style: italic;
}
</style>
