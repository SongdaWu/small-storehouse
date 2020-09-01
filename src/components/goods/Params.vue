  <template>
  <div>
    <!-- 面包屑表示位置 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert
          title="只能选择三级分类哦"
          type="warning"
          :closable="false"
          show-icon>
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col :span="2.5">
          <div class="lcenter">选择商品分类：</div>
        </el-col>
      <!-- 选择商品分类的联级框 -->
        <el-col :span="5">
            <el-cascader
                v-model="selectCateKeys"
                :options="cateList"
                @change="handleChange"
                :props="cateProps">
                </el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
          <!-- 动态参数面板 -->
          <el-tab-pane label="动态参数" name="many">
            <!-- 添加动态参数的按钮 -->
            <el-button type="success" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
            <!-- 动态参数表格 -->
            <el-table :data="manyParameterList" border stripe>
              <!-- 展开行 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handelClose(scope.row, index)">
                  {{item}}
                  </el-tag>
                  <!-- 输入文本框 -->
                  <!-- 此处有bug暂不修改 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    style="width: 120px;"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <!-- 添加按钮 -->
                  <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <!-- 索引 -->
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <!-- 表格的操作区域 -->
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">修改参数</el-button>
                    <el-button type="danger" icon="el-icon-delete" @click="removeParameter(scope.row.attr_id)">删除参数</el-button>
                  </template>
                </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- 静态参数面板 -->
          <el-tab-pane label="静态属性" name="only">
            <!-- 添加静态参数的按钮 -->
            <el-button type="success" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
            <!-- 静态属性表格 -->
            <el-table :data="onlyParameterList" border stripe>
              <!-- 展开行 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handelClose(scope.row, index)">
                  {{item}}
                  </el-tag>
                  <!-- 输入文本框 -->
                  <!-- 此处有bug暂不修改 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    style="width: 120px;"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <!-- 添加按钮 -->
                  <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
                  </el-table-column>
              <!-- 索引 -->
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <!-- 表格的操作区域 -->
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">修改属性</el-button>
                    <el-button type="danger" icon="el-icon-delete" @click="removeParameter(scope.row.attr_id)">删除属性</el-button>
                  </template>
                </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
    </el-card>

    <!-- 对话框区域 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="addDialogClose">
      <el-form
        ref="addFromRef"
        :model="addFrom"
        label-width="100px"
        :rules="addFromRules">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addFrom.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFromNow">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改属性对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="30%"
      @close="editDialogClose">
      <el-form
        ref="editFromRef"
        :model="editFrom"
        label-width="100px"
        :rules="addFromRules">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editFrom.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFromNow" @keyup.enter.native="editFromNow">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { instance } from '../../network/request.js'
export default {
  name: 'Params',
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 联级选择框的配置
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 被选择的商品分类的路径节点id保存在此
      selectCateKeys: [],
      // 点击的标签页单元名称将被保存在此
      activeName: 'many',
      // 保存动态属性
      manyParameterList: [],
      // 保存静态属性
      onlyParameterList: [],
      // 控制添加对话框的显示
      addDialogVisible: false,
      // 添加表单
      addFrom: {
        attr_name: ''
      },
      // 添加表单的校验规则
      addFromRules: {
        attr_name: [
          {
            required: true,
            message: '请填写名称',
            trigger: 'blur'
          }
        ]
      },
      // 控制修改属性对话的弹出
      editDialogVisible: false,
      // 修改属性的表单
      editFrom: {
        attr_id: null,
        attr_name: ''
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 得到商品分类列表
    async getCateList () {
      const { data: res } = await instance.get('categories')
      if (res.meta.status !== 200) {
        this.$message.warning('请求分类列表失败，请稍后再试')
      } else {
        this.cateList = res.data
        // console.log(this.cateList)
      }
    },
    // 定义级联选择框选择改变的动作
    handleChange () {
      if (this.selectCateKeys.length < 3) {
        // this.$message.warning('抱歉，只能选择三级商品分类哦')
        this.selectCateKeys = []
        this.manyParameterList = []
        this.onlyParameterList = []
      } else {
        // 正确选择后获取属性
        this.getParamsList()
      }
    },
    // 点击标签页单元时的事件处理函数
    handleClick () {
      if (this.selectCateKeys.length === 3) {
        this.getParamsList()
      }
    },
    // 获取指定分类下的参数列表
    async getParamsList () {
      const { data: res } = await instance.get(`categories/${this.selectCateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        console.log(res)
        this.$message.warning('请求参数失败，请稍后再试')
      } else {
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // 控制文本框与按钮的交替显示
          item.inputVisible = false
          // 文本框的输入内容
          item.inputValue = ''
        })
        if (this.activeName === 'many') {
          this.manyParameterList = res.data
        } else {
          this.onlyParameterList = res.data
        }
      }
    },
    // 关闭添加对话框时清空内容
    addDialogClose () {
      this.$refs.addFromRef.resetFields()
    },
    // 确认添加属性
    addFromNow () {
      this.$refs.addFromRef.validate(async (ruleRes) => {
        if (!ruleRes) {
        } else {
          const { data: res } = await instance.post(`categories/${this.selectCateId}/attributes`,
            {
              attr_name: this.addFrom.attr_name,
              attr_sel: this.activeName
            })
          if (res.meta.status !== 201) {
            this.$message.warning('添加失败，请稍后再试')
          } else {
            this.$message.success('添加成功')
            this.getParamsList()
            this.addDialogVisible = false
          }
        }
      })
    },
    // 关闭修改属性对话框时清空表单
    editDialogClose () {
      this.$refs.editFromRef.resetFields()
    },
    // 显示修改对话框
    showEditDialog (editTarget) {
      this.editFrom.attr_id = editTarget.attr_id
      this.editFrom.attr_name = editTarget.attr_name
      this.editDialogVisible = true
    },
    // 确认修改属性
    editFromNow () {
      this.$refs.editFromRef.validate(async (ruleRes) => {
        if (!ruleRes) {
        } else {
          const { data: res } = await instance.put(`categories/${this.selectCateId}/attributes/${this.editFrom.attr_id}`,
            {
              attr_name: this.editFrom.attr_name,
              attr_sel: this.activeName
            })
          if (res.meta.status !== 200) {
            this.$message.warning('修改失败，请稍后再试')
          } else {
            this.$message.success('修改成功')
            this.getParamsList()
            this.editDialogVisible = false
          }
        }
      })
    },
    // 删除属性
    async removeParameter (id) {
      const confirmRes = await this.$confirm(`此操作将永久删除该${this.titleText}, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      if (confirmRes === 'cancel') {
        return this.$message('已取消删除')
      } else {
        const { data: res } = await instance.delete(`categories/${this.selectCateId}/attributes/${id}`)
        if (res.meta.status !== 200) {
          this.$message.warning('删除失败，请稍后再试')
        } else {
          this.$message.success('删除成功')
          this.getParamsList()
        }
      }
    },
    // 文本框失去焦点或者按下回车时执行
    async handleInputConfirm (item) {
      item.inputVisible = false
      // 去除空格后长度为如果0，则证明输入的内容没有意义
      if (item.inputValue.trim().length === 0) {
        item.inputValue = ''
        item.inputVisible = false
      } else {
        var saveArray = [].concat(item.attr_vals)
        saveArray.push(item.inputValue.trim())
        const { data: res } = await instance.put(`categories/${this.selectCateId}/attributes/${item.attr_id}`,
          {
            attr_name: item.attr_name,
            attr_sel: this.activeName,
            attr_vals: saveArray.join(' ')
          })
        if (res.meta.status !== 200) {
          this.$message.warning('添加失败，请稍后再试')
        } else {
          this.$message.success('添加成功')
          item.attr_vals.push(item.inputValue.trim())
          item.inputValue = ''
          item.inputVisible = false
        }
      }
    },
    // 点击按钮时显示文本输入框
    showInput (item) {
      item.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick的方法是当页面上元素重新渲染时，回调输入的函数
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除标签
    async handelClose (item, index) {
      var saveArray = [].concat(item.attr_vals)
      saveArray.splice(index, 1)
      const { data: res } = await instance.put(`categories/${this.selectCateId}/attributes/${item.attr_id}`,
        {
          attr_name: item.attr_name,
          attr_sel: this.activeName,
          attr_vals: saveArray.join(' ')
        })
      if (res.meta.status !== 200) {
        this.$message.warning('删除失败，请稍后再试')
      } else {
        this.$message.success('删除成功')
        item.attr_vals.splice(index, 1)
        item.inputValue = ''
        item.inputVisible = false
      }
    }
  },
  computed: {
    // 控制按钮可不可用
    isBtnDisabled () {
      if (this.selectCateKeys.length < 3) {
        return true
      } else {
        return false
      }
    },
    // 三级商品分类的id经常被调用，所以做一个计算属性
    selectCateId () {
      if (this.selectCateKeys.length < 3) {
        return null
      } else {
        return this.selectCateKeys[2]
      }
    },
    // 动态计算添加对话框的标题
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}

</script>

<style>

</style>
