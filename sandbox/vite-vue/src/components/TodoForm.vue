<template>
  <div class="join">
    <button
      class="join-item btn btn-square btn-ghost text-2xl rounded-bl-none"
      @click="toggleAll(props.todos)"
      aria-label="toggle all"
    >
      <span
        aria-hidden="true"
        :class="
          willCheck
            ? 'icon-[mdi--checkbox-multiple-marked]'
            : 'icon-[mdi--checkbox-multiple-blank-outline]'
        "
      ></span>
    </button>
    <form @submit="onSubmit" class="join-item w-full border-l">
      <input
        class="join-item input input-ghost w-full rounded-br-none"
        placeholder="What needs to be done?"
        type="text"
        v-model="model"
      />
    </form>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { addTodo, toggleAll, willCheckAll } from "@/db/todo";
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

const willCheck = computed(() => {
  return willCheckAll(props.todos);
});
</script>

<style scoped></style>
