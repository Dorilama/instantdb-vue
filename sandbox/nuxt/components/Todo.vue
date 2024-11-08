<template>
  <div>
    <p>
      this must run on the client only unless you use the experimental config
      flag clientOnlyUseQuery
    </p>
    <button @click="add">add random todo</button>
    <p>todos:</p>
    <pre>{{ JSON.stringify(data?.todos, null, 2) }}</pre>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { id } from "@dorilama/instantdb-vue";
const db = useDb();

const { error, data } = db.useQuery({ todos: {} });
function add() {
  db.transact(
    db.tx.todos[id()].update({
      text: crypto.getRandomValues(new Uint32Array(1))[0].toString(36),
      done: false,
      createdAt: Date.now(),
    })
  );
}
</script>
