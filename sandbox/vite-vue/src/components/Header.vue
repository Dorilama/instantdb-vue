<template>
  <header class="navbar hidden lg:flex border-b">
    <div class="navbar-start">
      <ul class="menu menu-horizontal px-1">
        <li>
          <RouterLink :to="home.path" class="indicator">
            {{ home.meta.label || "Home"
            }}<span
              v-if="count.byPath[home.path]"
              class="badge badge-accent indicator-item"
              >{{ count.byPath[home.path] }}</span
            ></RouterLink
          >
        </li>
        <template v-for="r of routes" :key="r.path">
          <li v-if="r !== home">
            <RouterLink :to="r.path" class="indicator">
              {{ r.meta.label ?? r.path
              }}<span
                v-if="count.byPath[r.path]"
                class="badge badge-accent indicator-item"
                >{{ count.byPath[r.path] }}</span
              ></RouterLink
            >
          </li>
        </template>
      </ul>
    </div>
    <div class="navbar-end gap-4">
      <button v-if="isLoading" class="btn skeleton" disabled>
        <span class="opacity-0" aria-hidden="true">Sign in</span>
      </button>
      <template v-else-if="user">
        <span class="badge" :style="{ borderColor: myPresence?.color }">{{
          user.email
        }}</span>
        <button class="btn" @click="db.auth.signOut()">
          <span class="btm-nav-label">Sign out</span>
        </button></template
      >
      <RouterLink to="/signin" v-else class="btn font-bold">
        <span class="btm-nav-label">Sign in</span>
      </RouterLink>
    </div>
  </header>
</template>
<script setup lang="ts">
import { RouterLink } from "vue-router";
import { db } from "@/db";
import { usePeerStats } from "@/db/composables";

const { user: myPresence, home, routes, count } = usePeerStats();

const { isLoading, user, error } = db.useAuth();
</script>
