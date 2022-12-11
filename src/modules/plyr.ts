import type { UserModule } from '~/types'
// @ts-ignore
import VuePlyr from 'vue-plyr'
import 'vue-plyr/dist/vue-plyr.css'
export const install: UserModule = ({ app, router, isClient }) => {
  app.use(VuePlyr)
}
