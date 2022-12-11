// base api
export const base = import.meta.env.VITE_BASE_API
export function setToken(token: any) {
  jwt = token
}
export let jwt: any
