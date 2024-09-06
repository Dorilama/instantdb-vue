<script setup lang="ts">
import { watchEffect } from "vue";
import { RouterView, useRoute } from "vue-router";
import { chatRoomoom } from "@/db";
import { useUserPresenceValue } from "./db/composables";
import { Cursors } from "@dorilama/instantdb-vue/components";
import Header from "@/components/Header.vue";
import BottomNav from "@/components/BottomNav.vue";

const userPresenceValue = useUserPresenceValue();

const {
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

const route = useRoute();
</script>

<template>
  <Cursors
    v-if="route.name !== 'cursorsIframe'"
    :room="chatRoomoom"
    :user-cursor-color="userPresenceValue.color"
    :space-id="userPresenceValue.path"
    class="min-h-dvh"
    id="asdf"
  >
    <Header></Header>
    <main class="pb-24 lg:pb-0">
      <RouterView />

      <div class="w-full flex justify-center">
        <div role="alert" class="alert max-w-prose mx-2 my-4">
          <span class="icon-[mdi--information-outline] text-xl"></span>
          <div>
            <h3 class="font-bold">This is a realtime app!</h3>
            <span v-if="!Object.values(peers).length" class="text-sm"
              >Open this page in an incognito tab or another browser to see the
              realtime interactions</span
            ><span v-else>
              <span class="lg:hidden"
                >You can see how many people are live on a page in the bottom
                navigation</span
              >
              <span class="hidden lg:block"
                >You can see how many people are live on a page in the top
                header</span
              >
            </span>
          </div>
        </div>
      </div>
    </main>

    <BottomNav></BottomNav>
    <template v-if="route.name === 'cursors'" v-slot:cursor
      ><div class="hidden"></div
    ></template>
  </Cursors>
  <RouterView v-else />
</template>

<style scoped></style>
