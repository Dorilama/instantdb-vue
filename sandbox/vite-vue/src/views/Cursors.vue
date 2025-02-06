<template>
  <div class="flex flex-col items-center pt-4 pb-8 px-2 gap-4 max-w-screen-lg m-auto">
    <h1 class="text-4xl">Cursors</h1>
    <h2 class="self-start text-2xl">Default cursor</h2>
    <div class="flex flex-wrap gap-8 justify-around pb-8">
      <div v-for="n in 2" :key="`iframe-${n}`" class="card card-bordered border-4 overflow-hidden">
        <iframe v-if="src" :src="makeSrc('r1', n == 1 ? 'f5a442' : color)"></iframe>
        <div v-else role="alert" class="alert alert-error rounded-lg rounded-tl-none rounded-tr-none">
          <span aria-hidden="true" class="icon-[mdi--error-outline] text-2xl"></span>

          <span>Error! coursorsIframe route is missing</span>
        </div>
      </div>
    </div>

    <h2 class="self-start text-2xl">Custom cursor</h2>
    <div class="flex flex-wrap gap-8 justify-around">
      <div v-for="n in 2" :key="`iframe-${n}`" class="card card-bordered border-4 overflow-hidden">
        <iframe v-if="src" :src="makeSrc('r2', n == 1 ? '4287f5' : color, 'hello-world')"></iframe>
        <div v-else role="alert" class="alert alert-error rounded-lg rounded-tl-none rounded-tr-none">
          <span aria-hidden="true" class="icon-[mdi--error-outline] text-2xl"></span>

          <span>Error! coursorsIframe route is missing</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { chatRoom, db } from "@/db";
import { computed } from "vue";

const { user } = db.rooms.usePresence(chatRoom);

const src = useRouter()
  .getRoutes()
  .find((r) => r.name === "cursorsIframe")?.path;

const spaceId = computed(() => {
  return user?.value?.userId || "";
});

const color = computed(() => {
  return user?.value?.color?.replace("#", "") || "000";
});

function makeSrc(id: string, color: string, custom?: string) {
  return `${src}?spaceid=${spaceId.value}-${id}&color=${color}${custom ? `&custom=${custom}` : ""
    }`;
}
</script>

<style global>
.block-scroll {
  height: 100%;
  overflow: hidden;
}
</style>
