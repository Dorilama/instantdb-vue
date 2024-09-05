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
    <!-- <div class="navbar-end">
      <a class="btn">Button</a>
    </div> -->
  </header>
</template>
<script setup lang="ts">
import { useRouter, useRoute, RouterLink } from "vue-router";
const router = useRouter();
const routes = router.getRoutes();
</script>
