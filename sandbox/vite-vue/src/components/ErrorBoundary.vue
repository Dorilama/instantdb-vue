<template>
  <div v-if="error">{{ error.message }}</div>
    <div v-else>
        <slot></slot>
    </div>
</template>
<script setup lang="ts">
import { ref,onErrorCaptured } from 'vue'
const error = ref()
onErrorCaptured((err)=>{
    error.value = err
    return false
})
</script>
