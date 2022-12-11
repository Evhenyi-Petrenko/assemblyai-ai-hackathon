import { ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  let token = ref('')

  function setToken(name: string) {
    // @ts-ignore
    token = name
  }

  return {
    setToken,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
