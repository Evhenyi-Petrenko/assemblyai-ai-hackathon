<script lang="ts" setup>
import authApi from '../service/api/auth/'
import { setToken } from '~/service/config'

authApi
  .LOGIN({
    email: 'admin@dd.cc',
    password: 'elonmusk',
  })
  .then((response) => {
    setToken(response.access_token)
  })
</script>
<template>
  <main class="container text-gray-700 dark:text-gray-200">
    <router-view />
    <Footer />
  </main>
</template>
