<script setup lang="ts" name="IndexPage">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '~/stores/user'
import { isDark, toggleDark } from '~/composables'
const user = useUserStore()
const name = ref(user.savedName)

const router = useRouter()
const go = () => {
  if (name.value) router.push(`/audio/${encodeURIComponent(name.value)}`)
}

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
