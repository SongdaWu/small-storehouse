import Vue from 'vue'
import VueRouter from 'vue-router'
// 路由采取懒加载的方式，作用是避免js代码过多导致页面卡顿或者打开缓慢，还能减少总体积
// 实现路由懒加载需要安装@babel/plugin-syntax-dynamic-import插件

const LoginInterface = () => import(/* webpackChunkName: "LoginInterface-Home-Welcome" */ '../views/loginInterface/LoginInterface.vue')
// import LoginInterface from '../views/loginInterface/LoginInterface.vue'
const Home = () => import(/* webpackChunkName: "LoginInterface-Home-Welcome" */ '../views/home/Home.vue')
// import Home from '../views/home/Home.vue'
const Welcome = () => import(/* webpackChunkName: "LoginInterface-Home-Welcome" */ '../views/home/childHome/Welcome.vue')
// import Welcome from '../views/home/childHome/Welcome.vue'

const Users = () => import(/* webpackChunkName: "Users-Right-Role" */ '../components/user/Users.vue')
// import Users from '../components/user/Users.vue'
const Right = () => import(/* webpackChunkName: "Users-Right-Role" */ '../components/power/Right.vue')
// import Right from '../components/power/Right.vue'
const Role = () => import(/* webpackChunkName: "Users-Right-Role" */ '../components/power/Role.vue')
// import Role from '../components/power/Role.vue'

const Categories = () => import(/* webpackChunkName: "Categories-Params" */ '../components/goods/Categories.vue')
// import Categories from '../components/goods/Categories.vue'
const Params = () => import(/* webpackChunkName: "Categories-Params" */ '../components/goods/Params.vue')
// import Params from '../components/goods/Params.vue'

const GoodsList = () => import(/* webpackChunkName: "Add-GoodsList" */ '../components/goods/GoodsList.vue')
// import GoodsList from '../components/goods/GoodsList.vue'
const Add = () => import(/* webpackChunkName: "Add-GoodsList" */ '../components/goods/Add.vue')
// import Add from '../components/goods/Add.vue'
const Edit = () => import(/* webpackChunkName: "Add-GoodsList" */ '../components/goods/Edit.vue')

const Order = () => import(/* webpackChunkName: "Order" */ '../components/order/Order.vue')
// import Order from '../components/order/Order.vue'

const Report = () => import(/* webpackChunkName: "Report" */ '../components/report/Report.vue')
// import Report from '../components/report/Report.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/loginInterface'
  },
  {
    path: '/loginInterface',
    component: LoginInterface
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Right
      },
      {
        path: '/roles',
        component: Role
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: GoodsList
      },
      {
        path: '/add',
        component: Add
      },
      {
        path: '/orders',
        component: Order
      },
      {
        path: '/reports',
        component: Report
      },
      {
        path: '/edit',
        component: Edit
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/loginInterface') {
    return next()
  } else {
    const tokenStr = window.sessionStorage.getItem('token')
    if (tokenStr) {
      return next()
    } else {
      return next('/loginInterface')
    }
  }
})

export default router
