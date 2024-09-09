<template>
  <label class="swap swap-rotate">
    <input type="checkbox" :value="theme" @change="toggle" />

    <div
      class="swap-on h-10 w-10 fill-current icon-[mdi--white-balance-sunny]"
    ></div>

    <div
      class="swap-off h-10 w-10 fill-current icon-[mdi--moon-and-stars]"
    ></div>
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLocalSettings, useThemeUpdater } from "@/utils/composables";
useThemeUpdater();

const settings = useLocalSettings();
const theme = computed(() => settings.value.theme);
function toggle() {
  if (settings.value.theme === "light") {
    settings.value.theme = "dark";
  } else {
    settings.value.theme = "light";
  }
}
</script>
