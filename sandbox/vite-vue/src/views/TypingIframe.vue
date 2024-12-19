<template>
  <div
    class="flex flex-col items-center pt-4 pb-8 px-2 gap-4 max-w-screen-lg m-auto"
  >
    <div
      class="flex gap-2 min-h-12"
      :class="{ skeleton: presence.isLoading.value }"
    >
      <div
        v-for="[id, peer] of peers"
        :key="id"
        class="avatar placeholder indicator"
      >
        <span
          v-if="activeMap[peer.userId]"
          class="indicator-item loading loading-dots loading-xs"
        ></span>
        <div
          class="rounded-full border-4"
          :class="[peers.length > 4 ? 'w-8' : 'w-12']"
          :style="{ borderColor: peer.color }"
        >
          <span class="text-2xl">{{
            peer.userId.replace(/^Anon-/, "")[0]
          }}</span>
        </div>
      </div>
    </div>
    <label class="form-control">
      <div class="label"></div>
      <textarea
        class="textarea textarea-bordered h-24"
        placeholder="Write something here..."
        @keydown="inputProps.onKeyDown"
        @blur="inputProps.onBlur"
      ></textarea>
      <div class="label min-h-8">
        <span v-if="typingText" class="label-text-alt">{{ typingText }}</span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { chatRoom } from "@/db";
import { computed } from "vue";
import { useHideInstantDevTools } from "@/utils/composables";

const route = useRoute();

const presence = chatRoom.usePresence();

const { active, inputProps } = chatRoom.useTypingIndicator("typing");

const peers = computed(() =>
  Object.entries(presence.peers.value).filter(
    ([id, p]) => p.userId && p.path == route.path
  )
);

const activeMap = computed(() =>
  Object.fromEntries(
    active.value.map((activePeer) => {
      return [activePeer.userId, activePeer];
    })
  )
);

const typingText = computed(() => {
  if (active.value.length === 0) {
    return "";
  }
  if (active.value.length === 1) {
    return `${active.value[0].userId} is typing...`;
  }
  if (active.value.length === 2) {
    return `${active.value[0].userId} and ${active.value[1].userId} are typing...`;
  }
  return `${active.value[0].userId} and ${
    active.value.length - 1
  } others are typing...`;
});

useHideInstantDevTools();
</script>
