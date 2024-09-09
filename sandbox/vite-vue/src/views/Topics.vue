<template>
  <div
    class="flex flex-col items-center pt-4 pb-8 px-2 gap-4 max-w-screen-lg m-auto"
  >
    <h1 class="text-4xl animate-tada">Topics</h1>

    <div class="flex flex-wrap gap-8 justify-around pb-8">
      <div
        v-for="n in 2"
        :key="`iframe-${n}`"
        class="card card-bordered border-4 overflow-hidden h-full"
      >
        <iframe v-if="src" :src="src"></iframe>
        <div
          v-else
          role="alert"
          class="alert alert-error rounded-lg rounded-tl-none rounded-tr-none"
        >
          <span
            aria-hidden="true"
            class="icon-[mdi--error-outline] text-2xl"
          ></span>

          <span>Error! topicsIframe route is missing</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const src = useRouter()
  .getRoutes()
  .find((r) => r.name === "topicsIframe")?.path;
</script>
