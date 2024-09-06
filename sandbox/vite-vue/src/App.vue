<script setup lang="ts">
import { watchEffect } from "vue";
import { RouterView } from "vue-router";
import { chatRoomoom } from "@/db";
import { Cursors } from "@dorilama/instantdb-vue/components";
import Header from "@/components/Header.vue";
import BottomNav from "@/components/BottomNav.vue";
import { useUserPresenceValue } from "./db/composables";

const userPresenceValue = useUserPresenceValue();

const {
  user: myPresence,
  peers,
  publishPresence,
  isLoading: isLoadingPresence,
} = chatRoomoom.usePresence();

watchEffect(() => {
  const presence = userPresenceValue.value;
  if (isLoadingPresence.value) {
    return;
  }
  publishPresence(presence);
});
</script>

<template>
  <Cursors
    :room="chatRoomoom"
    :user-cursor-color="userPresenceValue.color"
    :space-id="userPresenceValue.page"
    class="min-h-dvh"
  >
    <Header></Header>
    <main class="pb-12 lg:pb-0">
      <RouterView />
    </main>
    <BottomNav></BottomNav>
  </Cursors>
</template>

<style scoped></style>
