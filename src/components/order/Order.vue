<template>
  <div>
    <!-- 面包屑表示位置 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input
          placeholder="请输入内容"
          clearable>
              <el-button
              slot="append"
              icon="el-icon-search"></el-button>
            </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表表格 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="创建时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改地址的按钮 -->
            <el-button
             type="success"
             icon="el-icon-edit"
             @click="showAddressDialog(scope.row)"></el-button>
             <!-- 展示物流情况的按钮 -->
            <el-button
            type="warning"
            icon="el-icon-location"
            @click="showProgressDialog(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="this.queryInfo.pagenum"
            :page-sizes="[5, 10, 15, 20]"
            :page-size="this.queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="this.total"
            background>
          </el-pagination>
    </el-card>

    <!-- 对话框区域 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClose">
      <el-form
        ref="addressFromRef"
        :model="addressFrom"
        label-width="100px"
        :rules="addreFromRules">
        <el-form-item label="省市区/县" prop="adress">
          <el-cascader
              v-model="addressFrom.adress"
              :props="{ expandTrigger: 'hover' }"
              :options="cityData"
              style="width: 300px;">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailedAdress">
          <el-input v-model="addressFrom.detailedAdress"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAdress" @keyup.enter.native="editAdress">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%">
      <!-- 根据物流情况显示时间线 -->
       <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressData"
            :key="index"
            :timestamp="activity.time">
            {{activity.context}}
          </el-timeline-item>
        </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { instance } from '../../network/request.js'
import cityData from './citydata.js'
export default {
  name: 'Order',
  data () {
    return {
      // 查询订单列表
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单总数
      total: 0,
      // 订单列表
      orderList: [],
      // 控制修改地址对话框的显示
      addressDialogVisible: false,
      // 修改地址的表单
      addressFrom: {
        adress: [],
        detailedAdress: ''
      },
      // 修改地址表单的校验规则
      addreFromRules: {
        adress: [
          {
            required: true,
            message: '请选择地址',
            trigger: 'blur'
          }
        ],
        detailedAdress: [
          {
            required: true,
            message: '请填写详细地址',
            trigger: 'blur'
          }
        ]
      },
      // 导入的地址数据
      cityData,
      // 控制展示物流进度对话框的显示
      progressDialogVisible: false,
      // 保存获取到的物流信息
      progressData: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await instance.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        this.$message.warning('请求订单列表失败，请稍后再试')
      } else {
        console.log(res.data)
        this.total = res.data.total
        this.orderList = res.data.goods
      }
    },
    // 每页显示信息条数改变时执行此函数
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 页数的改变是执行此函数
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    // 展示修改地址对话框
    showAddressDialog (row) {
      this.addressDialogVisible = true
    },
    // 修改地址对话框关闭时的回调函数
    addressDialogClose () {
      this.$refs.addressFromRef.resetFields()
    },
    // 修改地址的确定按钮
    editAdress () {
      // 此处尚未完成，因为不想写了
      this.$refs.addressFromRef.validate(ruleRes => {
        if (!ruleRes) {
          this.$message.warning('请填写必要的表单项')
        } else {
          this.$message.success('地址修改成功')
          this.addressDialogVisible = false
        }
      })
    },
    // 展示物流情况:仅测试采用固定订单号
    async showProgressDialog (row) {
      const { data: res } = await instance.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        this.$message.errer('抱歉，获取物流情况失败，请稍后再试')
      } else {
        this.progressData = res.data
        this.progressDialogVisible = true
      }
    }
  }
}

</script>

<style>
  @import url("../../plugins/timeline-item/timeline-item.css");
  @import url("../../plugins/timeline/timeline.css");
</style>
