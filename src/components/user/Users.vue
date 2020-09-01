<template>
  <div>
    <!-- 面包屑表示位置 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
    <el-card>
      <!-- 添加用户区 -->
      <el-row :gutter="20">
        <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryinfo.query" clearable @clear="getUserList"  @keyup.enter.native="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="success" @click="activeDialogVisible = true">添加用户</el-button></el-col>
      </el-row>

      <!-- 添加用户的对话框 -->
      <el-dialog
        title="提示"
        :visible.sync="activeDialogVisible"
        width="50%"
        @close="closeDialog"
        :close-on-click-modal="false">
        <!-- 内容主体区域 -->
        <el-form :model="addFrom" :rules="addFromRules" ref="addFromRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addFrom.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addFrom.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addFrom.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addFrom.mobile"></el-input>
          </el-form-item>
         </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="activeDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser"  @keyup.enter.native="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户信息对话框 -->
      <el-dialog
        title="修改用户信息"
        :visible.sync="editDialogVisible"
        width="50%"
        :close-on-click-modal="false"
        @close="editFromClose">
        <!-- 信息表单 -->
        <el-form ref="editFromRef" :model="editFrom" label-width="80px" :rules="addFromRules">
          <el-form-item label="用户名">
            <el-input v-model="editFrom.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editFrom.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editFrom.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配角色对话框 -->
      <el-dialog
        title="角色分配"
        :visible.sync="setRoleDialogVisible"
        width="50%"
        :close-on-click-modal="true"
        @close="setRoleDialogClose">
         <div class="setRole">
           <p>当前的用户: {{this.userInfo.username}}</p>

           <p>当前的角色: {{this.userInfo.role_name}}</p>

           <p>
             分配新角色:
             <el-select v-model="selectNewRole" placeholder="请选择">
                 <el-option
                   v-for="item in roleList"
                   :key="item.id"
                   :label="item.roleName"
                   :value="item.id">
                 </el-option>
               </el-select>
           </p>
         </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setRoleNow">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 表单区域 -->
          <el-table :data="uersList" border stripe>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="姓名" prop="username"></el-table-column>
            <el-table-column label="邮箱" prop="email"></el-table-column>
            <el-table-column label="电话" prop="mobile"></el-table-column>
            <el-table-column label="角色" prop="role_name"></el-table-column>

              <!-- 用户状态显示 -->
            <el-table-column label="状态" width="120px">
              <template slot-scope="scope">
                <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
                </el-switch>
              </template>
            </el-table-column>

            <!-- 表单操作区域 -->
            <el-table-column label="操作" width="180px">
              <template slot-scope="scope">
                   <!-- 修改按钮 -->
                   <el-button
                   type="primary"
                   icon="el-icon-edit"
                   circle
                   @click="showEditDialog(scope.row.id)">
                   </el-button>
                  <!-- 删除按钮 -->
                  <el-button type="danger"
                             icon="el-icon-delete"
                             circle
                             @click="removeUser(scope.row.id)">
                             </el-button>
                <el-tooltip effect="dark" content="角色分配" placement="top" :enterable="false">
                   <!-- 分配角色按钮 -->
                   <el-button type="warning" icon="el-icon-setting" circle @click="setRole(scope.row)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <!-- 页码区域 -->
              <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryinfo.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="queryinfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
              </el-pagination>
    </el-card>
  </div>
</template>

<script>
import { instance } from '../../network/request.js'
export default {
  name: 'Users',
  data () {
    // 手机验证规则
    const checkMobile = (rule, value, cb) => {
      const reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (reg.test(value)) {
        cb()
      } else {
        cb(new Error('手机号码格式不正确哦'))
      }
    }
    // 邮箱验证规则
    const checkEmail = (rule, value, cb) => {
      const reg = /^([a-zA-z0-9_-])+@([a-zA-z0-9_-])+(\.[a-zA-z0-9_-])+/
      if (reg.test(value)) {
        cb()
      } else {
        cb(new Error('邮箱格式不正确哦'))
      }
    }
    return {
      queryinfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      // 保存用户列表
      uersList: [],
      total: 0,
      // 控制添加用户对话框的显示于隐藏
      activeDialogVisible: false,
      // 添加用户表单
      addFrom: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 填写规则，trigger是触发验证的时机
      addFromRules: {
        username: [
          {
            required: true,
            message: '填写用户名哦，亲',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '必须输入3到10个字符的名字哦',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '记得填写密码哦',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '必须输入6到15个字符的密码哦',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '填个邮箱不过分吧',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '填个手机号码吧',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      // 控制修改信息对话框的显示
      editDialogVisible: false,
      // 取得的用户信息对象
      editFrom: {},
      // 控制角色分配对话框的显示
      setRoleDialogVisible: false,
      // 显示角色分配时对当前用户信息进行保存
      userInfo: {},
      // 保存角色列表
      roleList: [],
      // 选中的新角色会被保存在这
      selectNewRole: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await instance.get('users', { params: this.queryinfo })
      if (res.meta.status !== 200) {
        return this.$message.error('用户列表获取失败')
      } else {
        this.uersList = res.data.users
        this.total = res.data.total
      }
    },
    // 监听每页要显示多少条数据
    handleSizeChange (newSize) {
      this.queryinfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变
    handleCurrentChange (newPage) {
      this.queryinfo.pagenum = newPage
      this.getUserList()
    },
    // 监听开关状态改变
    async userStateChange (userinfo) {
      const { data: res } = await instance.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('用户状态修改失败')
      } else {
        this.$message.success('用户状态修改成功')
      }
    },
    // 关闭对话框重置表单
    closeDialog () {
      this.$refs.addFromRef.resetFields()
    },
    // 按确定后要对整个表单进行验证,并添加到数据库
    addUser () {
      this.$refs.addFromRef.validate(async (res) => {
        if (!res) {
        } else {
          const { data: res } = await instance.post('users', this.addFrom)
          if (res.meta.status !== 201) {
            console.log(res)
            this.$message.error('添加用户失败，请稍后再试')
          } else {
            this.$message.success('添加用户成功')
            this.activeDialogVisible = !this.activeDialogVisible
            this.getUserList()
          }
        }
      })
    },
    // 弹出修改用户信息的对话框
    async showEditDialog (id) {
      const { data: res } = await instance.get(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('请求数据失败')
      } else {
        this.editFrom = res.data
        this.editDialogVisible = true
      }
      // console.log(res)
      // console.log(id)
    },
    editFromClose () {
      this.$refs.editFromRef.resetFields()
    },
    editUser () {
      this.$refs.editFromRef.validate(async (res) => {
        if (!res) {
        } else {
          const { data: res } = await instance.put('users/' + this.editFrom.id, {
            email: this.editFrom.email,
            mobile: this.editFrom.email
          })
          if (res.meta.status !== 200) {
            console.log(res)
            this.$message.error('更新用户信息失败，请稍后再试')
          } else {
            this.$message.success('更新用户信息成功')
            this.editDialogVisible = false
            this.getUserList()
          }
        }
      })
    },
    // 删除用户
    async removeUser (id) {
      const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      if (confirmRes === 'confirm') {
        const { data: res } = await instance.delete('users/' + id)
        if (res.meta.status !== 200) {
          this.$message.error('删除失败，请稍后再试')
        } else {
          this.$message.success('删除成功')
          this.getUserList()
        }
      } else {
        this.$message('已取消删除')
      }
    },
    // 分配角色按钮
    async setRole (user) {
      this.userInfo = user
      const { data: res } = await instance.get('roles')
      if (res.meta.status !== 200) {
        this.$message.warning('请求角色列表失败，请稍后重试')
      } else {
        this.roleList = res.data
        this.setRoleDialogVisible = true
      }
      console.log(user)
    },
    // 关闭分配角色对话框时清除保存的信息
    setRoleDialogClose () {
      this.selectNewRole = ''
      this.userInfo = {}
    },
    // 点击确认分配角色
    async setRoleNow () {
      const { data: res } = await instance.put(`users/${this.userInfo.id}/role`, { rid: this.selectNewRole })
      if (res.meta.status !== 200) {
        this.$message.warning('修改用户角色失败，请稍后重试')
      } else {
        this.$message.success('修改用户角色成功')
        this.getUserList()
        this.setRoleDialogVisible = false
      }
    }
  }
}
</script>

<style>
  .el-breadcrumb{
    margin-bottom: 15px;
  }
  .el-table{
    margin-top: 15px;
  }
  .el-pagination{
    margin-top: 15px;
    text-align: center;
  }
  .setRole{
    line-height: 40px;
  }
</style>
