<template>
  <div>
    <!-- 面包屑表示位置 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="warning" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '2'">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { instance } from '../../network/request.js'

export default {
  name: 'Right',
  data () {
    return {
      rightsList: []
    }
  },
  created () {
    this.getRightsList()
  },
  methods: {
    async getRightsList () {
      const { data: res } = await instance.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('权限列表数据请求失败')
      } else {
        this.rightsList = res.data
      }
    }
  }
}
</script>

<style>
</style>
