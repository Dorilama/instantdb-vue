<script setup lang="ts">
import { RouterView } from "vue-router";
import { chatRoomoom } from "@/db";
import { Cursors } from "@dorilama/instantdb-vue/components";
import Header from "@/components/Header.vue";
import BottomNav from "@/components/BottomNav.vue";
</script>

<template>
  <Cursors :room="chatRoomoom">
    <Header></Header>
    <main class="pb-12 lg:pb-0">
      <RouterView />
    </main>
    <BottomNav></BottomNav>
  </Cursors>
</template>

<style scoped></style>
