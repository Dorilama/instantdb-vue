<template>
  <div
    class="flex flex-col items-center pt-4 pb-8 px-2 gap-4 max-w-screen-lg m-auto"
  >
    <ul class="flex gap-2">
      <li v-for="[name, text] of Object.entries(emoji)" :key="name">
        <button
          class="btn btn-outline text-xl"
          @click="publishTopic({ text: name, color: user?.color })"
          :ref="(el) => assignRef(el as HTMLElement ,name)"
        >
          {{ text }}
        </button>
      </li>
    </ul>
    <p>Click a button! ✨</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";
import { chatRoom } from "@/db";
import { useHideInstantDevTools } from "@/utils/composables";

const emoji = {
  fire: "🔥",
  wave: "👋",
  confetti: "🎉",
  heart: "❤️",
} as const;

const emojiRefs: {
  [K in keyof typeof emoji]: Ref<HTMLElement | undefined>;
} = {
  fire: ref(),
  wave: ref(),
  confetti: ref(),
  heart: ref(),
};

function assignRef(el: HTMLElement | null, key: string) {
  if (!el) {
    return;
  }
  if (!emojiRefs[key as keyof typeof emoji]) {
    return;
  }
  emojiRefs[key as keyof typeof emoji].value = el;
}

const publishTopic = chatRoom.usePublishTopic("emoji");

chatRoom.useTopicEffect("emoji", (event, peer, topic) => {
  console.log(event, peer, topic);
  const el = emojiRefs[event.text as keyof typeof emoji];
  if (!el.value) {
    return;
  }
  el.value.classList.add("animate-tada", "btn-primary", "bg-primary");
  if (event.color) {
    el.value.style.backgroundColor = event.color;
    el.value.style.borderColor = event.color;
  }
  setTimeout(() => {
    if (!el.value) {
      return;
    }
    el.value.classList.remove("animate-tada", "btn-primary", "bg-primary");
    el.value.style.backgroundColor = "";
    el.value.style.borderColor = "";
  }, 1000);
});

const { user } = chatRoom.usePresence();

useHideInstantDevTools();
</script>
