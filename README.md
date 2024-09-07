# instantdb-vue

Unofficial port of [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md) for vue

```
// ༼ つ ◕_◕ ༽つ Real-time Chat
// ----------------------------------
// * Updates instantly
// * Multiplayer
// * Works offline
<script setup>
import { init, tx, id } from "@dorilama/instantdb-vue";
const db = init({ appId: "my-app-id" });
// 1. Read
const { isLoading, error, data } = db.useQuery({
  messages: {},
});

// 2. Write
const addMessage = (message) => {
  db.transact(tx.messages[id()].update(message));
};
</script>
<template>
  <!-- 3. Render! -->
  <UI :data="data" @add="addMessage" />
</template>
```
