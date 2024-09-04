import { createMemoryHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/views/Todo.vue"),
    meta: { label: "Todo" },
  },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return {
        el: to.hash,
      };
    } else {
      return { top: 0 };
    }
  },
  linkActiveClass: "text-teal-600",
  linkExactActiveClass: "text-teal-700",
});
