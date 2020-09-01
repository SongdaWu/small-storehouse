<template>
  <el-menu
        background-color="#333744"
        text-color="#fff"
        active-text-color="#ffd04b"
        unique-opened
        :collapse="collapse"
        :collapse-transition="false"
        router
        :default-active="saveIndex">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 一级菜单 -->
        <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
          <!-- 一级菜单模板 -->
          <template slot="title">
            <!-- 图标 -->
            <i :class="icoBoj[item.id]"></i>
            <!-- 文字 -->
            <span>{{item.authName}}</span>
          </template>
          <!-- 二级菜单 -->
          <el-menu-item :index="item2.path" v-for="item2 in item.children" :key="item2.id" @click="getIndex(item2.path)">
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{item2.authName}}</span>
            </template>
          </el-menu-item>
        </el-submenu>
      </el-menu>
</template>

<script>
import { instance } from '../../network/request.js'

export default {
  name: 'Menu',
  created () {
    // 创建组件时向服务器请求左侧菜单数据
    this.getMenuList()
  },
  data () {
    return {
      // 左侧菜单数据
      menulist: [],
      icoBoj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      collapse: false
    }
  },
  methods: {
    async getMenuList () {
      const { data: res } = await instance.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.menulist = res.data
      }
    },
    // 控制收缩
    toggleCollapse () {
      this.collapse = !this.collapse
      this.$emit('collapse', this.collapse)
    },
    getIndex (newIndex) {
      window.sessionStorage.setItem('activeItem', newIndex)
    }
  },
  computed: {
    saveIndex () {
      return window.sessionStorage.getItem('activeItem')
    }
  }
}
</script>

<style>
 .iconfont{
    margin-right: 10px;
  }
  .toggle-button{
    width: 200px;
    background-color: #4a5064;
    color: #FFF;
    text-align: center;
    font-size: 10px;
    line-height: 24px;
    letter-spacing: 3.5px;
    cursor: pointer;
  }
  .el-menu{
    border-right: none;
  }
  .el-submenu{
    width: 200px;
  }
</style>
