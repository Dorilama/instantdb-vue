<template>
  <div class="flex flex-col items-center pt-4 pb-8 px-2 gap-4">
    <h1 class="text-4xl">Todo</h1>
    <div class="card card-bordered rounded-lg bg-base-100 sm:min-w-96">
      <TodoForm :todos="data?.todos || []" :room="chatRoom" />
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
    <p class="text-l">
      Connection status:
      <span class="badge badge-primary badge-outline">{{
        connectionStatus
      }}</span>
    </p>
    <button class="btn btn-outline" @click="toggle">
      {{ query ? "Pause" : "Restore" }} live update
    </button>
    <button class="btn btn-outline" @click="stop">
      Stop live update without recover
    </button>
    <button
      class="btn btn-outline mt-4"
      :class="[
        once.isLoading.value && 'skeleton',
        once.error.value && 'btn-error',
      ]"
      @click="queryOnce"
      :disabled="once.isLoading.value"
    >
      {{ queryOnceText }}
    </button>
    <button
      class="btn btn-outline mt-4"
      :class="[
        userOnce.isLoading.value && 'skeleton',
        userOnce.error.value && 'btn-error',
      ]"
      @click="getAuth"
      :disabled="userOnce.isLoading.value"
    >
      {{ userOnceText }}
    </button>
    <button
      class="btn btn-outline mt-4"
      :class="[!localId && 'skeleton']"
      @click="idCount++"
    >
      LocalId {{ idCount }}: {{ localId || "loading" }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, watchEffect, ref, computed } from "vue";
import { db, chatRoom, type Todo } from "@/db";
import TodoForm from "@/components/TodoForm.vue";
import TodoList from "@/components/TodoList.vue";
import ActionBar from "@/components/TodoFooter.vue";
import { type User } from "@dorilama/instantdb-vue";

const q = { todos: {} };

const query = ref(q);

const { isLoading, data, error, stop } = db.useQuery(query);
const alertError = useTemplateRef("alert-error");
watchEffect(() => {
  if (error.value && alertError.value) {
    alertError.value?.scrollIntoView();
  }
});

function toggle() {
  if (query.value) {
    //@ts-ignore
    query.value = null;
  } else {
    query.value = q;
  }
}

const once = {
  todos: ref<Todo[] | null>(null),
  error: ref<string | null>(null),
  isLoading: ref(false),
};

async function queryOnce() {
  if (once.isLoading.value) {
    return;
  }
  once.isLoading.value = true;
  once.error.value = null;
  try {
    const result = await db.queryOnce({ todos: {} });
    once.todos.value = result.data.todos;
  } catch (error) {
    if (error instanceof Error) {
      once.error.value = error.message || "unknown error";
    } else {
      once.error.value = "unknown error";
    }
    once.todos.value = null;
  }
  once.isLoading.value = false;
}

const queryOnceText = computed(() => {
  if (once.error.value) {
    return `QueryOnce Error: ${once.error.value} Click to update`;
  }
  if (once.todos.value === null) {
    return `Use QueryOnce to get a static count of todos`;
  }
  return `QueryOnce: ${
    Object.values(once.todos.value).length
  } todos. Click to update`;
});

const connectionStatus = db.useConnectionStatus();

const userOnce = {
  user: ref<User | null>(null),
  error: ref<string | null>(null),
  isLoading: ref(false),
  firstLoad: ref(true),
};

async function getAuth() {
  if (userOnce.isLoading.value) {
    return;
  }
  userOnce.isLoading.value = true;
  userOnce.error.value = null;
  try {
    const result = await db.getAuth();
    userOnce.user.value = result;
  } catch (error) {
    if (error instanceof Error) {
      userOnce.error.value = error.message || "unknown error";
    } else {
      userOnce.error.value = "unknown error";
    }
    userOnce.user.value = null;
  }
  userOnce.isLoading.value = false;
  userOnce.firstLoad.value = false;
}

const userOnceText = computed(() => {
  if (userOnce.error.value) {
    return `GetAuth Error: ${userOnce.error.value} Click to update`;
  }
  if (userOnce.user.value === null) {
    if (userOnce.firstLoad.value) {
      return `Use GetAuth to get the static value of the user`;
    }
    return `Not logged in. Click to update.`;
  }
  return `User: ${
    userOnce.user.value.email || "missing email"
  }. Click to update`;
});

const idCount = ref(0);

const localId = db.useLocalId(() => "device" + idCount.value);
</script>

<style scoped></style>
