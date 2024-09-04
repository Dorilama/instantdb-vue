<template>
  <header className="navbar bg-base-100">
    <div className="navbar-start">
      <ul className="menu menu-horizontal px-1">
        <li v-for="r of router.getRoutes()" :key="r.path">
          <RouterLink
            class="text-gray-500 transition hover:text-gray-500/75"
            :to="r.path"
          >
            {{ r.meta.label || "" }}
          </RouterLink>
        </li>
      </ul>
    </div>
    <div className="navbar-end">
      <a className="btn">Button</a>
    </div>
  </header>
</template>
<script setup lang="ts">
import { useRouter, useRoute, RouterLink } from "vue-router";
const router = useRouter();
const route = useRoute();
</script>
