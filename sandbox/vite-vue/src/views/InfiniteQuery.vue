<template>
  <div class="flex flex-col items-center pt-4 pb-8 px-2 gap-4">
    <h1 class="text-4xl">Infinite Query</h1>
    <div class="card card-bordered rounded-lg bg-base-100 sm:min-w-96">
      <TodoForm :todos="data?.todos || []" :room="chatRoom" />
      <TodoList
        :class="[isLoading && 'skeleton min-h-10']"
        :todos="data?.todos || []"
      />
      <div
        class="flex justify-between items-center gap-8 p-2"
        :class="[
          (data?.todos.length == 0 || (data?.todos.length || 0) > 1) &&
            'border-t',
        ]"
      >
        <label class="label"
          >Limit:
          <input
            class="join-item input input-ghost rounded-br-none"
            style="width: 150px"
            placeholder="limit"
            type="number"
            v-model="pageSize"
          />
        </label>

        <button
          class="btn btn-ghost btn-xs"
          :disabled="!canLoadNextPage"
          @click="loadNextPage()"
        >
          Load more
        </button>
      </div>
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
import { useTemplateRef, watchEffect, ref, computed } from "vue";
import { db, schema, chatRoom } from "@/db";
import TodoForm from "@/components/TodoForm.vue";
import TodoList from "@/components/TodoList.vue";
import { type InstaQLParams } from "@dorilama/instantdb-vue";

const pageSize = ref(4);

const query = computed(
  () =>
    ({
      todos: {
        $: { limit: pageSize.value, order: { serverCreatedAt: "asc" } },
      },
    }) satisfies InstaQLParams<typeof schema>,
);

const { isLoading, data, error, loadNextPage, canLoadNextPage } =
  db.useInfiniteQuery(query);
const alertError = useTemplateRef("alert-error");
watchEffect(() => {
  if (error.value && alertError.value) {
    alertError.value?.scrollIntoView();
  }
});
</script>

<style scoped></style>
