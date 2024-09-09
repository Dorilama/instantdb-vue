<template>
  <div class="btm-nav btm-nav-sm lg:hidden border-t">
    <RouterLink :to="home.path">
      <span class="btm-nav-label indicator"
        ><span class="p-1 px-4">Todo</span
        ><span
          v-if="count.byPath[home.path]"
          class="badge badge-accent indicator-item indicator-start sm:indicator-top sm:indicator-end"
          >{{ count.byPath[home.path] }}</span
        ></span
      >
    </RouterLink>

    <button @click="control?.showModal()">
      <span class="btm-nav-label indicator"
        ><span class="p-1 px-4">Menu</span
        ><span
          v-if="count.total"
          class="badge badge-accent indicator-item indicator-start sm:indicator-top sm:indicator-end"
          >{{ count.total }}</span
        ></span
      >
    </button>

    <button v-if="isLoading" class="rounded-none skeleton" disabled></button>
    <button
      v-else-if="user"
      class="rounded-none w-1/3 sm:w-auto"
      @click="db.auth.signOut()"
    >
      <span class="btm-nav-label flex flex-col items-center w-full">
        <span
          class="badge w-full sm:w-fit"
          :style="{ borderColor: myPresence?.color }"
          ><span class="overflow-hidden">{{ user.email }}</span></span
        >
        <span>Sign out</span></span
      >
    </button>
    <RouterLink to="/signin" v-else class="rounded-none font-bold">
      <span class="btm-nav-label">Sign in</span>
    </RouterLink>
  </div>

  <dialog
    ref="bottom-navigation-control"
    class="modal modal-bottom sm:modal-middle"
  >
    <div class="modal-box">
      <span class="text-md">Menu</span>
      <ul class="menu bg-base-100 rounded-box p-2">
        <template v-for="r of routes" :key="r.path"
          ><li>
            <RouterLink :to="r.path" @click="control?.close()"
              >{{ r.meta.label
              }}<span v-if="count.byPath[r.path]" class="badge badge-accent">{{
                count.byPath[r.path]
              }}</span></RouterLink
            >
          </li></template
        >
      </ul>
      <ThemeController />

      <div class="modal-action sm:hidden">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { RouterLink } from "vue-router";
import { db } from "@/db";
import { usePeerStats } from "@/db/composables";
import ThemeController from "./ThemeController.vue";

const control = useTemplateRef<HTMLDialogElement>("bottom-navigation-control");

const { isLoading, user, error } = db.useAuth();
const { user: myPresence, home, routes, count } = usePeerStats();
</script>
