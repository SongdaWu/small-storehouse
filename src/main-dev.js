import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.use(VueQuillEditor)
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
Vue.filter('dataFormat', originVal => {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const h = (dt.getHours() + '').padStart(2, '0')
  const min = (dt.getMinutes() + '').padStart(2, '0')
  const s = (dt.getMinutes() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
