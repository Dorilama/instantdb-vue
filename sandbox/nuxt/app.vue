<template>
  <div>
    <div v-if="appId">
      <h1>hello</h1>
      <Todo />
      <ClientOnly><Todo /></ClientOnly>
      <ClientOnlyTodo />
    </div>
    <p v-else>
      add your instant appId in .env (INSTANT_APP_ID="") or directly in nuxt
      config
    </p>
  </div>
</template>
<script setup lang="ts">
const config = useRuntimeConfig();
const appId = config.public.instantAppId;
</script>
