<script setup lang="ts">
import { RouterView } from "vue-router";
import { chatRoomoom } from "@/db";
import { Cursors } from "@dorilama/instantdb-vue/components";
import Header from "@/components/Header.vue";
</script>

<template>
  <Cursors :room="chatRoomoom">
    <Header></Header>
    <main>
      <RouterView />
    </main>
  </Cursors>
</template>

<style scoped></style>
