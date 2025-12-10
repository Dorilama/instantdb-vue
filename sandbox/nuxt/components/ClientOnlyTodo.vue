<template>
  <div>
    <p>this can run on the server and returns an empty loading query</p>
    <button @click="add">add random todo</button>
    <p>todos:</p>
    <pre>{{ JSON.stringify(data?.todos, null, 2) }}</pre>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { id } from "@dorilama/instantdb-vue";
const db = useDb();
db.tx.todos[id()]?.update;
const { error, data } = useClientOnlyQuery({ todos: {} });
function add() {
  db.transact(
    db.tx.todos[id()]!.update({
      text: crypto.getRandomValues(new Uint32Array(1))[0]!.toString(36),
      done: false,
      createdAt: Date.now(),
    })
  );
}
</script>
