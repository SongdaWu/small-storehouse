import axios from 'axios'
// 导入进度条的js和css
import NProgress from 'nprogress'

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8888/api/private/v1/',
  timeout: 5000
})
// 在请求拦截器上加入请求头（token)和展示进度条 NProgress.start()
instance.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  NProgress.start()
  return config
})
// 在响应拦截器中隐藏进度条 NProgress.done()
instance.interceptors.response.use(config => {
  NProgress.done()
  return config
})
export { instance }
