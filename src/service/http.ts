import axios, { AxiosRequestConfig } from 'axios'
import NProgress from 'nprogress'
import { base, jwt } from '~/service/config'
import type { ResType } from './types'

axios.defaults.baseURL = `${base}/api`
axios.defaults.timeout = 10000
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

axios.interceptors.request.use(
  (config): AxiosRequestConfig<any> => {
    // replace this with your own getting token method eg: from localStorage

    const token = jwt
    if (token) {
      // @ts-ignore

      config.headers.Authorization = `bearer ${token}`
      console.log(config)
    }
    return config
  },
  (error) => {
    return error
  }
)

axios.interceptors.response.use(
  (res) => {
    return res
  },
  (error) => {
    if (error.response) {
      const code = error.response.status
      if (code === 401) {
        // do something here maybe remove user token and redirect to login page
      }
      return error.response
    }
    return error
  }
)

interface Http {
  get<T>(url: string, params?: unknown): Promise<ResType<T>>
  post<T>(url: string, params?: unknown): Promise<ResType<T>>
  upload<T>(url: string, params: unknown): Promise<ResType<T>>
  download(url: string): void
}

const http: Http = {
  get(url, params) {
    return new Promise((resolve, reject) => {
      NProgress.start()
      axios
        .get(url, { params })
        .then((res) => {
          NProgress.done()
          resolve(res.data)
        })
        .catch((err) => {
          NProgress.done()
          reject(err.data)
        })
    })
  },
  post(url, params) {
    return new Promise((resolve, reject) => {
      NProgress.start()
      axios
        .post(url, JSON.stringify(params))
        .then((res) => {
          NProgress.done()
          resolve(res.data)
        })
        .catch((err) => {
          NProgress.done()
          reject(err.data)
        })
    })
  },
  upload(url, file) {
    return new Promise((resolve, reject) => {
      NProgress.start()
      axios
        .post(url, file, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((res) => {
          NProgress.done()
          resolve(res.data)
        })
        .catch((err) => {
          NProgress.done()
          reject(err.data)
        })
    })
  },
  download(url) {
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = url
    iframe.onload = function () {
      document.body.removeChild(iframe)
    }
    document.body.appendChild(iframe)
  },
}
export default http
