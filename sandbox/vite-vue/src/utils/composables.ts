import { onMounted } from "vue";

export function useHideInstantDevTools() {
  onMounted(() => {
    const el = document.body.lastElementChild as HTMLElement;
    const app = document.getElementById("app");
    if (app && el && !app.contains(el)) {
      el.style.display = "none";
    }
  });
}
