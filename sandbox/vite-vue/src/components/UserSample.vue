<template>
    <p>user: {{ user.id }}</p>
</template>
<script setup lang="ts">
import { db, } from "@/db";
const user = db.useUser()
</script>