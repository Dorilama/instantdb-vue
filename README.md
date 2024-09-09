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
import { Cursors } from "@dorilama/instantdb-vue/components";

const db = init({ appId: "my-app-id" });
// 1. Read
const { isLoading, error, data } = db.useQuery({
  messages: {},
});
const room = db.room("chat", "main");

// 2. Write
const addMessage = (message) => {
  db.transact(tx.messages[id()].update(message));
};
</script>
<template>
  <!-- 3. Render! -->
  <Cursors :room="room">
    <UI :data="data" @add="addMessage" />
  </Cursors>
</template>
```

The aim of this library is to have @instantdb/react for vue with feature parity. You should be able to follow the react docs and examples using this library. Arguments are reactive so you can use refs or getters. `Cursors` component has a separate import from `@dorilama/instantdb-vue/components`. Some of the functions return also a `stop` function to manually clear all side-effects and break live updated.
