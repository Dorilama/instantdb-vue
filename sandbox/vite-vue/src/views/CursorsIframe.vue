<template>
  <Cursors
    :room="chatRoom"
    class="w-screen h-screen flex items-center justify-center"
    :space-id="spaceId"
    :user-cursor-color="color ? '#' + color : ''"
    @touchmove="scroll(false)"
    @touchend="scroll(true)"
    :propagate="true"
  >
    <p>Move your cursor around! ✨</p>
    <template v-if="custom" v-slot:cursor>
      <div
        class="badge"
        :style="[color && `background-color: ${'#' + color};`]"
      >
        {{ custom }}
      </div>
    </template>
  </Cursors>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { chatRoom } from "@/db";
import { Cursors } from "@dorilama/instantdb-vue/components";
import { useHideInstantDevTools } from "@/utils/composables";

const route = useRoute();
const spaceId = route.query.spaceid as string;
const color = route.query.color as string;
const custom = route.query.custom as string;

function scroll(allow: boolean) {
  if (allow) {
    window.parent.document.body.classList.remove("block-scroll");
  } else {
    window.parent.document.body.classList.add("block-scroll");
  }
}

useHideInstantDevTools();
</script>
