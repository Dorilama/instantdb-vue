<template>
  <header class="navbar bg-base-100 hidden lg:flex">
    <div class="navbar-start">
      <ul class="menu menu-horizontal px-1">
        <li v-for="r of routes" :key="r.path">
          <RouterLink :to="r.path">
            {{ r.meta.label || "" }}
          </RouterLink>
        </li>
      </ul>
    </div>
    <div class="navbar-end">
      <a class="btn">Button</a>
    </div>
  </header>
  <div class="btm-nav lg:hidden">
    <RouterLink :to="home?.path || '/'">
      <span class="btm-nav-label">Home</span>
    </RouterLink>

    <div>
      <button @click="control?.showModal()" class="w-full h-full">
        <span class="btm-nav-label">Menu</span>
      </button>
      <dialog
        ref="bottom-navigation-control"
        class="modal modal-bottom sm:modal-middle"
      >
        <div class="modal-box">
          <ul class="menu bg-base-100 rounded-box p-2">
            <template v-for="r of routes" :key="r.path"
              ><li>
                <RouterLink :to="r.path">{{ r.meta.label }}</RouterLink>
              </li></template
            >
          </ul>

          <div class="modal-action">
            <form method="dialog">
              <button class="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>

    <!-- <div class="dropdown dropdown-top flex">
      <div
        ref="bottom-navigation-control"
        tabindex="0"
        role="button"
        class="flex flex-center"
      >
        <span class="btm-nav-label">Pages</span>
      </div>
      <ul
        tabindex="0"
        class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
      >
        <template v-for="r of routes" :key="r.path"
          ><li v-if="r !== home">
            <RouterLink :to="r.path">{{ r.meta.label }}</RouterLink>
          </li></template
        >
      </ul>
    </div> -->
  </div>
</template>
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";
const router = useRouter();
const route = useRoute();
const routes = router.getRoutes();
const home = routes.find((r) => r.path == "/");
const control = useTemplateRef<HTMLDialogElement>("bottom-navigation-control");
</script>
