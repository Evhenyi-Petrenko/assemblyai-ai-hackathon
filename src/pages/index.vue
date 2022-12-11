<script setup lang="ts" name="IndexPage">
import { useI18n } from 'vue-i18n'

import { isDark, toggleDark } from '~/composables'

const { t } = useI18n()
</script>

<template>
  <div class="container">
    <button
      class="icon-btn mx-2 !outline-none"
      :title="t('button.toggle_dark')"
      @click="toggleDark()"
    >
      <carbon-moon v-if="isDark" />
      <carbon-sun v-else />
    </button>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
