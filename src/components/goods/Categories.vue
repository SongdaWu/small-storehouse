<template>
  <div>
    <!-- 面包屑表示位置 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类按钮位置 -->
      <el-row>
        <el-col>
          <el-button type="success" style="margin-bottom: 10px;" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
    <!-- 表格区域 -->
      <tree-table
      :data="cateList"
      :columns="columns"
      :selection-type="false"
      :expand-type="false"
      show-index
      index-text="#"
      border
      :show-row-hover="false">
      <!-- 是否有效这一列的模板 -->
      <template slot="isok" slot-scope="scope">
        <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: rgb(103, 194, 58)"></i>
        <i class="el-icon-error" v-else style="color: red"></i>
      </template>
      <!-- 排序这一列的模板 -->
      <template slot="sort" slot-scope="scope">
        <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
        <el-tag type="warning" v-else-if="scope.row.cat_level === 1">二级</el-tag>
        <el-tag type="success" v-else>三级</el-tag>
      </template>
      <!-- 操作列的模板 -->
      <template slot="opt" slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" @click="showEditCateDialog(scope.row)">修改</el-button>
        <el-button type="danger" icon="el-icon-delete" @click="showDeleteCateDialog(scope.row.cat_id)">删除</el-button>
      </template>
      </tree-table>
    <!-- 分页区域 -->
      <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :page-sizes="[3, 5, 10, 15]"
            :current-page="querInfo.pagenum"
            :page-size="querInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
      </el-pagination>

      <!-- 以下对话框区域 -->

      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="closeAddCateDialog">
        <!-- 表单区域 -->
        <el-form
          ref="addCateFromRef"
          :model="addCateFrom"
          label-width="100px"
          :rules="addCateFromRules">
        <el-form-item label="分类名称: " prop="cat_name">
            <el-input v-model="addCateFrom.cat_name"></el-input>
        </el-form-item>
         <el-form-item label="父级分类: ">
           <el-cascader
               v-model="selectId"
               :options="parentCateList"
               @change="handleChange"
               :props="cascaderProps"
               clearable
               >
            </el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate"  @keyup.enter.native="addCate">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑商品分类对话框 -->
      <el-dialog
        title="编辑商品分类"
        :visible.sync="editCateDialogVisible"
        width="30%"
        @close="closeEditCateDialog">
        <el-form
          ref="editCateFromRef"
          :model="editFrom"
          label-width="100px"
          :rules="addCateFromRules">
          <el-form-item label="分类名称: " prop="cat_name">
            <el-input v-model="editFrom.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate"  @keyup.enter.native="editCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { instance } from '../../network/request.js'
export default {
  name: 'Categories',
  data () {
    return {
      // 商品列表
      cateList: [],
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总数据数
      total: 0,
      // 为表格指定列定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      },
      {
        label: '是否有效',
        // 表示把当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用的模板名称
        template: 'isok'
      },
      {
        label: '排序',
        // 表示把当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用的模板名称
        template: 'sort'
      },
      {
        label: '操作',
        // 表示把当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用的模板名称
        template: 'opt'
      }
      ],
      // 控制添加分类对话框的显示
      addCateDialogVisible: false,
      // 添加分类的表单
      addCateFrom: {
        cat_name: '',
        // 分类层级
        cat_level: 0,
        // 父级分类id
        cat_pid: 0
      },
      // 添加分类表单的校验规则
      addCateFromRules: {
        cat_name: [
          {
            required: true,
            message: '一定要填分类名称哦',
            trigger: 'blur'
          }
        ]
      },
      // 前两级的商品列表作为父级列表
      parentCateList: [],
      // 级联选择器的配置
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 与一个数组绑定记录级联选择器所选的东西
      selectId: [],
      // 控制显示编辑商品分类
      editCateDialogVisible: false,
      // 保存要修改的商品分类
      editFrom: {
        cat_name: '',
        id: null
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获得商品分类列表
    async getCateList () {
      const { data: res } = await instance.get('categories', { params: this.querInfo })
      if (res.meta.status !== 200) {
        this.$message.warning('请求商品列表失败，请稍后再试')
      } else {
        this.cateList = res.data.result
        this.total = res.data.total
      }
    },
    // 监听每页显示多少个数据的改变
    handleSizeChange (newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页码的改变
    handleCurrentChange (newCurrent) {
      this.querInfo.pagenum = newCurrent
      this.getCateList()
    },
    // 点击按钮展示添加分类对话框
    showAddCateDialog () {
      // 展开对话框时获得父级分类列表的数据
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 当添加分类对话框关闭时重置表单与级联选择
    closeAddCateDialog () {
      this.$refs.addCateFromRef.resetFields()
      this.selectId = []
      this.addCateFrom.cat_level = 0
      this.addCateFrom.cat_pid = 0
    },
    // 获取前两级的商品分类列表
    async getParentCateList () {
      const { data: res } = await instance.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        this.$message.warning('请求父级分类列表失败，请稍后再试')
      } else {
        this.parentCateList = res.data
      }
    },
    // 当在级联选择器中作出选择时
    handleChange () {
      console.log(this.selectId)
      if (this.selectId.length > 0) {
        this.addCateFrom.cat_pid = this.selectId[this.selectId.length - 1]
        this.addCateFrom.cat_level = this.selectId.length
      } else {
        this.addCateFrom.cat_pid = 0
        this.addCateFrom.cat_level = 0
      }
    },
    // 点击按钮添加新的商品分类
    addCate () {
      this.$refs.addCateFromRef.validate(async (ruleRes) => {
        if (!ruleRes) {
        } else {
          const { data: res } = await instance.post('categories', this.addCateFrom)
          if (res.meta.status !== 201) {
            this.$message.warning('添加分类失败，请稍后再试')
          } else {
            this.$message.success('添加分类成功成功')
            this.getCateList()
            this.addCateDialogVisible = false
          }
        }
      })
    },
    // 删除对话框的显示
    async showDeleteCateDialog (id) {
      const confirmRes = await this.$confirm('此操作将永久删除该商品分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      if (confirmRes === 'cancel') {
        return this.$message('已取消删除')
      } else {
        const { data: res } = await instance.delete('categories/' + id)
        if (res.meta.status !== 200) {
          this.$message.warning('删除失败，请稍后再试')
        } else {
          this.$message.success('删除成功')
          this.getCateList()
        }
      }
    },
    // 显示编辑商品分类对话框
    showEditCateDialog (role) {
      this.editFrom.cat_name = role.cat_name
      this.editFrom.id = role.cat_id
      this.editCateDialogVisible = true
    },
    // 确认修改商品分类
    async editCate () {
      this.$refs.editCateFromRef.validate(async (ruleRes) => {
        if (!ruleRes) {
        } else {
          const { data: res } = await instance.put('categories/' + this.editFrom.id,
            { cat_name: this.editFrom.cat_name })
          if (res.meta.status !== 200) {
            this.$message.warning('修改失败，请稍后再试')
          } else {
            this.$message.success('修改成功')
            this.getCateList()
            this.editCateDialogVisible = false
          }
        }
      })
    },
    // 商品分类对话框关闭时重置表单
    closeEditCateDialog () {
      this.$refs.editCateFromRef.resetFields()
    }
  }
}

</script>

<style>

</style>
