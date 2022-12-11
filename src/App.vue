<script setup lang="ts">
import { useHead } from '@vueuse/head'
useHead({
  title: '3d head',
  meta: [{ name: 'description', content: 'Waffly' }],
})
</script>

<template>
  <router-view />
</template>
<style>
body {
  background: #f2f2f2;
}
</style>
