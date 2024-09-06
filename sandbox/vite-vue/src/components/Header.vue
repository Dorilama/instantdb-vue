<template>
  <header class="navbar hidden lg:flex border-b">
    <div class="navbar-start">
      <ul class="menu menu-horizontal px-1">
        <li v-for="r of routes" :key="r.path">
          <RouterLink :to="r.path">
            {{ r.meta.label || "" }}
          </RouterLink>
        </li>
      </ul>
    </div>
    <div class="navbar-end gap-4">
      <button v-if="isLoading" class="btn skeleton" disabled>
        <span class="opacity-0" aria-hidden="true">Sign in</span>
      </button>
      <template v-else-if="user">
        <span class="badge">{{ user.email }}</span>
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
import { useRouter, RouterLink } from "vue-router";
import { db } from "@/db";

const router = useRouter();
const routes = router.getRoutes().filter((r) => r.meta.isNav === true);

const { isLoading, user, error } = db.useAuth();
</script>
