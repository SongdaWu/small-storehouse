<template>
  <el-container>
    <!-- 头部 -->
    <el-header style="padding-left: 0;">
      <div>
        <img src="../../assets/img/logo.png" alt="" class="logo">
        <span>不知名的后台管理系统</span>
      </div>
      <el-button type="info" @click="logout" class="btn">退出</el-button>
    </el-header>
    <!-- 页面主体区 -->
    <el-container>
     <!-- 左侧边栏 -->
      <el-aside :width="collapse ? '64px' : '200px'">
        <!-- 左侧菜单 -->
        <Menu ref="menu" @collapse='changeCollapse($event)'></Menu>
      </el-aside>
      <!-- 右侧主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Menu from '../../components/asideMenu/Menu.vue'

export default {
  name: 'Home',
  data () {
    return {
      collapse: false
    }
  },
  methods: {
    // 退出登录
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/loginInterface')
    },
    changeCollapse (childCollapse) {
      this.collapse = childCollapse
    }
  },
  components: {
    Menu
  }
}
</script>

<style>
  .el-container{
    height: 100%;
  }
  .el-header{
    display: flex;
    justify-content: space-between;
    background-color: #373d41;
    align-items: center;
    color: #fff;
  }
  .el-header div {
    display: flex;
    align-items: center;
  }
  .el-header div span {
    margin-left: 15px;
  }
  .el-aside{
    background-color: #333744;
    }
  .el-main{
    background-color: rgb(255, 250, 232);
  }
  .logo{
    width: 45px;
  }

</style>
