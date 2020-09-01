<template>
  <div>
    <!-- 面包屑表示位置 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
          placeholder="请输入内容"
          v-model="queryInfo.query"
          clearable
          @clear="getGoodsList"
          @keyup.enter.native="getGoodsList">
              <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"></el-button>
            </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="success" @click="goAddGoods">添加商品</el-button>
        </el-col>
      </el-row>
        <!-- 商品表格展示区域 -->
        <el-table :data="goodsList" border stripe class="goods-table">
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="商品名称" prop="goods_name"></el-table-column>
          <el-table-column label="商品价格(元)" prop="goods_price" width="120px"></el-table-column>
          <el-table-column label="商品重量" prop="goods_weight" width="100px"></el-table-column>
          <el-table-column label="创建时间" prop="add_time" width="180px">
            <template slot-scope="scope">
              {{scope.row.add_time | dataFormat}}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="230px">
            <template slot-scope="scope">
              <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="goEditGoods(scope.row.goods_id)">编辑</el-button>
              <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              @click="removeGoodsById(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      <!-- 分页区域 -->
      <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="this.queryInfo.pagenum"
            :page-sizes="[10, 15, 20, 30]"
            :page-size="this.queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="this.total"
            background>
          </el-pagination>
    </el-card>
    <!-- 编辑商品对话框 -->
<!--    <el-dialog
      title="编辑商品信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose">
      <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="editFormRules">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog> -->
  </div>
</template>

<script>
// import _ from 'lodash'
import { instance } from '../../network/request.js'
export default {
  name: 'GoodsList',
  data () {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 获取商品列表
      goodsList: [],
      // 数据库中商品总数
      total: 0
      // 控制编辑商品对话框的显示
      // editDialogVisible: false,
      // // 修改商品信息的表单
      // editForm: {},
      // // 修改商品信息的校验规则
      // editFormRules: {
      //   goods_name: [
      //     {
      //       required: true,
      //       message: '一定要填商品名称哦',
      //       trigger: 'blur'
      //     }
      //   ],
      //   goods_price: [
      //     {
      //       required: true,
      //       message: '一定要填商品价格哦',
      //       trigger: 'blur'
      //     }
      //   ],
      //   goods_weight: [
      //     {
      //       required: true,
      //       message: '请填写商品重量',
      //       trigger: 'blur'
      //     }
      //   ],
      //   goods_number: [
      //     {
      //       required: true,
      //       message: '填个商品数量吧',
      //       trigger: 'blur'
      //     }
      //   ]
      // }

    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList () {
      const { data: res } = await instance.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        this.$message.warning('请求商品列表失败，请稍后再试')
      } else {
        console.log(res.data)
        this.total = res.data.total
        this.goodsList = res.data.goods
      }
    },
    // 当分页器改变每页显示条数时执行此回调函数
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 当分页器改变页数时执行此回调函数
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    // 删除商品
    async removeGoodsById (row) {
      const confirmRes = await this.$confirm('此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      if (confirmRes === 'cancel') {
        return this.$message('已取消删除')
      } else {
        const { data: res } = await instance.delete('goods/' + row.goods_id)
        if (res.meta.status !== 200) {
          this.$message.warning('删除失败，请稍后再试')
        } else {
          this.$message.success('删除成功')
          this.getGoodsList()
        }
      }
    },
    // 点击添加按钮跳转至添加页面
    goAddGoods () {
      this.$router.push('/add')
    },
    // // 编辑商品信息对话框结束时的回调
    // editDialogClose () {
    //   this.$refs.editFormRef.resetFields()
    // },
    // 点击跳转至编辑商品页面
    async goEditGoods (id) {
      window.sessionStorage.setItem('editGoodsId', id)
      this.$router.push('/edit')
    }
  }
}

</script>

<style>
</style>
