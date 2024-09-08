<template>
  <div
    class="flex flex-col items-center pt-4 pb-8 px-2 gap-4 max-w-screen-lg m-auto"
  >
    <h1 class="text-4xl">Typing indicator</h1>
    <div class="flex flex-wrap gap-8 justify-around pb-8">
      <div class="card card-compact card-bordered border-4 overflow-hidden">
        <div class="card-body flex flex-col gap-4">
          <div
            class="flex gap-2 min-h-12"
            :class="{ skeleton: presence.isLoading.value }"
          >
            <div
              v-for="peer of peers"
              :key="peer.userId"
              class="avatar placeholder indicator"
            >
              <span
                v-if="activeMap[peer.userId]"
                class="indicator-item badge badge-secondary"
              ></span>
              <div
                class="text-neutral w-12 rounded-full border-4"
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
            <div class="label">
              <span class="label-text-alt">Your bio</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { chatRoomoom } from "@/db";
import { computed, watchEffect } from "vue";

const route = useRoute();

const presence = chatRoomoom.usePresence();

const src = useRouter()
  .getRoutes()
  .find((r) => r.name === "cursorsIframe")?.path;

const spaceId = computed(() => {
  return presence.user?.value?.userId || "";
});

const color = computed(() => {
  return presence.user?.value?.color?.replace("#", "") || "000";
});

function makeSrc(id: string, color: string, custom?: string) {
  return `${src}?spaceid=${spaceId.value}-${id}&color=${color}${
    custom ? `&custom=${custom}` : ""
  }`;
}

const { active, inputProps } = chatRoomoom.useTypingIndicator("chat");

const peers = computed(() =>
  Object.values(presence.peers.value).filter(
    (p) => p.userId && p.path == route.path
  )
);
const activeMap = computed(() =>
  Object.fromEntries(
    active.value.map((activePeer) => [activePeer.userId, activePeer])
  )
);

watchEffect(() => {
  console.log(presence.isLoading.value);
});
</script>
