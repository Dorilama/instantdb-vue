import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/views/Todo.vue"),
    meta: { label: "Todo", isNav: true },
  },
  {
    path: "/signin",
    component: () => import("@/views/Signin.vue"),
    meta: { label: "Sign in" },
  },
  { path: "/signup", redirect: "/signin" },
];

export const router = createRouter({
  history: createWebHistory(),
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
  linkActiveClass: "active",
});
