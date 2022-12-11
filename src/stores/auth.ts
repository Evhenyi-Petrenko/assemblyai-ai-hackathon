import { ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  let token = ref('')

  function setToken(name: string) {
    token = name
  }

  return {
    setNewName,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
