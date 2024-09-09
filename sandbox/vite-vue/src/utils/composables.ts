import { onMounted, watchEffect } from "vue";
import { useStorage, useMounted } from "@vueuse/core";

export function useHideInstantDevTools() {
  onMounted(() => {
    const el = document.body.lastElementChild as HTMLElement;
    const app = document.getElementById("app");
    if (app && el && !app.contains(el)) {
      el.style.display = "none";
    }
  });
}

export function useLocalSettings() {
  return useStorage(
    "settings",
    {
      theme: globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "ligh",
    },
    localStorage,
    { mergeDefaults: true }
  );
}

export function useThemeUpdater() {
  const settings = useLocalSettings();
  const isMounted = useMounted();

  watchEffect(() => {
    if (!isMounted) {
      return;
    }
    document.documentElement.dataset.theme = settings.value.theme;
  });
}
