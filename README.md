# instantdb-vue

Unofficial port of [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md) for Vue.

Compatible with `@instantdb/core` 0.22.84.

```vue
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

The aim of this library is to have @instantdb/react for Vue with feature parity. You should be able to follow the react docs and examples using this library. Arguments are reactive so you can use refs or getters. `Cursors` component has a separate import from `@dorilama/instantdb-vue/components`. Some of the functions return also a `stop` function to manually clear all side-effects and break live updates.

## Vue-specific Configuration

In addition to the standard InstantDB config options, you can pass Vue-specific options via `__extra_vue`:

```ts
const db = init({
  appId: "my-app-id",
  schema,
  // Optional: enable date objects for timestamps
  useDateObjects: true,
  // Vue-specific options
  __extra_vue: {
    // Skip query subscriptions on server (useful for SSR/Nuxt)
    clientOnlyUseQuery: true,
    // Set isLoading to false when query is null (instead of staying true)
    stopLoadingOnNullQuery: true,
  },
});
```

### SSR / Nuxt Support

When using Nuxt or other SSR frameworks, you may want to skip query subscriptions on the server to avoid hydration mismatches. Use the `clientOnlyUseQuery` flag:

```ts
// composables/instant.ts
import { init } from "@dorilama/instantdb-vue";
import schema from "../instant.schema";

function createDb() {
  const config = useRuntimeConfig();
  return init({
    appId: config.public.instantAppId,
    schema,
    __extra_vue: { clientOnlyUseQuery: true },
  });
}

let db: ReturnType<typeof createDb>;

export function useDb() {
  if (!db) {
    db = createDb();
  }
  return db;
}

// Optional: helper for client-only queries
export const useClientOnlyQuery: typeof db.useQuery = (query) => {
  const db = useDb();
  if (typeof window === "undefined") {
    return {
      isLoading: ref(true),
      data: shallowRef(undefined),
      pageInfo: shallowRef(undefined),
      error: shallowRef(undefined),
      stop: () => {},
    };
  }
  return db.useQuery(query);
};
```

## Cursors Component

The `Cursors` component displays real-time cursor positions for multiplayer experiences:

```vue
<script setup>
import { Cursors } from "@dorilama/instantdb-vue/components";

const room = db.room("chat", "room-id");
</script>
<template>
  <Cursors :room="room" :space-id="'my-space'" :user-cursor-color="'#00FF00'">
    <YourContent />
  </Cursors>
</template>
```

The `CursorSchema` type is also exported for typing your cursor data:

```ts
import type { CursorSchema } from "@dorilama/instantdb-vue";
// { x: number; y: number; xPercent: number; yPercent: number; color: string }
```

---

Related: [this](https://github.com/Dorilama/instantdb-byos#readme) library tries to bring the same SDK for multiple signal-based reactivity.
