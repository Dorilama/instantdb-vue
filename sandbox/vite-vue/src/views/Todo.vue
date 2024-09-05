<template>
  <div class="flex flex-col items-center pt-4 pb-8 px-2 gap-4">
    <h1 class="text-4xl">Todo</h1>
    <div class="card card-bordered rounded-lg bg-base-100 sm:min-w-96">
      <TodoForm :todos="data?.todos || []" :room="chatRoomoom" />
      <TodoList
        :class="[isLoading && 'skeleton min-h-10']"
        :todos="data?.todos || []"
      />
      <ActionBar :todos="data?.todos || []" />
      <div
        v-if="error"
        ref="alert-error"
        role="alert"
        class="alert alert-error rounded-lg rounded-tl-none rounded-tr-none"
      >
        <span
          aria-hidden="true"
          class="icon-[mdi--error-outline] text-2xl"
        ></span>

        <span>Error! {{ error.message || "unknown error." }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useTemplateRef, watchEffect } from "vue";
import { db, chatRoomoom } from "@/db";
import TodoForm from "@/components/TodoForm.vue";
import TodoList from "@/components/TodoList.vue";
import ActionBar from "@/components/TodoFooter.vue";

const { isLoading, data, error } = db.useQuery({ todos: {} });
const alertError = useTemplateRef("alert-error");
watchEffect(() => {
  if (error.value && alertError.value) {
    alertError.value?.scrollIntoView();
  }
});
</script>

<style scoped></style>
