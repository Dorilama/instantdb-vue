import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/Todo.vue"),
    meta: { label: "Todo", isNav: true },
  },
  {
    path: "/signin",
    name: "signin",
    component: () => import("@/views/Signin.vue"),
    meta: { label: "Sign in" },
  },
  { path: "/signup", redirect: "/signin" },
  {
    path: "/cursors",
    name: "cursors",
    component: () => import("@/views/Cursors.vue"),
    meta: { label: "Cursors", isNav: true },
  },
  {
    path: "/cursors-iframe",
    name: "cursorsIframe",
    component: () => import("@/views/CursorsIframe.vue"),
  },
  {
    path: "/typing",
    name: "typing",
    component: () => import("@/views/Typing.vue"),
    meta: { label: "Typing", isNav: true },
  },
  {
    path: "/typing-iframe",
    name: "typingIframe",
    component: () => import("@/views/TypingIframe.vue"),
  },
  {
    path: "/topics",
    name: "topics",
    component: () => import("@/views/Topics.vue"),
    meta: { label: "Topics", isNav: true },
  },
  {
    path: "/topics-iframe",
    name: "topicsIframe",
    component: () => import("@/views/TopicsIframe.vue"),
  },
  {
    path: "/rooms",
    name: "rooms",
    component: () => import("@/views/Rooms.vue"),
    meta: { label: "Rooms", isNav: true },
  },
  {
    path: "/rooms2",
    name: "rooms2",
    component: () => import("@/views/Rooms2.vue"),
    meta: { label: "Rooms", isNav: true },
  },
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
