<template>
  <div class="btm-nav btm-nav-sm lg:hidden border-t">
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
                <RouterLink :to="r.path" @click="control?.close()">{{
                  r.meta.label
                }}</RouterLink>
              </li></template
            >
          </ul>

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
    </div>

    <button v-if="isLoading" class="rounded-none skeleton" disabled></button>
    <button
      v-else-if="user"
      class="rounded-none w-1/3 sm:w-auto"
      @click="db.auth.signOut()"
    >
      <span class="btm-nav-label flex flex-col items-center w-full">
        <span
          class="badge w-full sm:w-fit"
          :style="{ borderColor: fixedRandomColor }"
          ><span class="overflow-hidden">{{ user.email }}</span></span
        >
        <span>Sign out</span></span
      >
    </button>
    <RouterLink to="/signin" v-else class="rounded-none font-bold">
      <span class="btm-nav-label">Sign in</span>
    </RouterLink>
  </div>
</template>
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { db } from "@/db";
import { fixedRandomColor } from "@/db/composables";

const router = useRouter();
const routes = router.getRoutes().filter((r) => r.meta.isNav === true);
const home = routes.find((r) => r.path == "/");
const control = useTemplateRef<HTMLDialogElement>("bottom-navigation-control");

const { isLoading, user, error } = db.useAuth();
</script>
