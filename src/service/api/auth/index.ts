import http from '~/service/http'
import { ILoginApi } from './types'

const authApi: ILoginApi = {
  LOGIN(params) {
    return http.post('/login', params)
  },
}

export default authApi
