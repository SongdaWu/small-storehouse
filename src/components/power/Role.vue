<template>
  <div>
    <!-- 面包屑表示位置 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮位置 -->
      <el-row>
        <el-col>
          <el-button type="success" @click="addUserbtn">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表展示 -->
      <el-table :data="rolesList" border stripe>
        <!-- 权限浏览 -->
         <el-table-column type="expand">
           <template slot-scope="scope">
            <el-row :class="{'bdbot':true, 'bdtop': index === 0, 'vcenter':true}" v-for="(item, index) in scope.row.children" :key="item.id">
              <!-- 一级权限 -->
               <el-col :span="5">
                 <el-tag
                 closable
                 @close="removeRightById(scope.row, item.id, item.authName)">{{item.authName}}</el-tag>
                 <i class="el-icon-caret-right"></i>
               </el-col>
               <!-- 二级权限 -->
               <el-col :span="19">
                 <el-row :class="{'bdtop': index2 !== 0}" v-for="(item2, index2) in item.children" :key="item2.id">
                   <el-col :span="7">
                     <el-tag type="warning"
                     closable
                     @close="removeRightById(scope.row, item2.id, item2.authName)">{{item2.authName}}</el-tag>
                     <i class="el-icon-caret-right"></i>
                   </el-col>
                   <!-- 三级权限 -->
                   <el-col :span="17">
                     <el-tag
                     type="success"
                     v-for="item3 in item2.children"
                     :key="item3.id"
                     closable
                     @close="removeRightById(scope.row, item3.id, item3.authName)">
                     {{item3.authName}}
                     </el-tag>
                   </el-col>
                 </el-row>
               </el-col>
             </el-row>
           </template>
         </el-table-column>

        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="small" @click="editRoleDialog(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="small" @click="removerole(scope.row)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="small" @click="setRightDialogVisible(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="权限分配"
      :visible.sync="rightDialogVisible"
      width="50%"
      @close="setRightDialogClose">
      <!-- 权限树形展示 -->
      <el-tree
      ref="rightTree"
      :data="rightTree"
      :props="treeprops"
      show-checkbox
      node-key="id"
      :default-checked-keys="saveNodeId"
      default-expand-all>
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRight">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="权限分配"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      :close-on-click-modal="false"
       @close="editRoleFromClose">
      <!-- 表单区域 -->
     <el-form
        ref="editRoleFromRef"
        :model="editRoleFrom"
        label-width="80px"
        :rules="editRoleFromRules">
        <el-form-item label="角色名称"  prop="name">
          <el-input v-model="editRoleFrom.name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRoleFrom.desc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole"  @keyup.enter.native="editRole">确 定</el-button>
      </span>
    </el-dialog>
   <!-- 添加角色对话框 -->
    <el-dialog
      title="权限分配"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @close="addRoleFromClose">
      <!-- 添加角色表单 -->
     <el-form
        ref="addRoleFromRef"
        :model="addRoleFrom"
        label-width="80px"
        :rules="editRoleFromRules">
      <el-form-item label="角色名称"  prop="name">
          <el-input v-model="addRoleFrom.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleFrom.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { instance } from '../../network/request.js'

export default {
  name: 'Role',
  data () {
    return {
      // 角色列表
      rolesList: [],
      // 控制设置权限对话框
      rightDialogVisible: false,
      // 获取所有权限树
      rightTree: [],
      // 树形控件
      treeprops: {
        label: 'authName',
        children: 'children'
      },
      // 即将分配权限的id
      setRoleId: '',
      // 设置一个数组保存三级节点的id
      saveNodeId: [],
      // 控制编辑角色对话框的打开与关闭
      editRoleDialogVisible: false,
      // 编辑角色表
      editRoleFrom: {},
      // 编辑角色的规则
      editRoleFromRules: {
        name: [
          {
            required: true,
            message: '填写用户名哦，亲',
            trigger: 'blur'
          }
        ]
      },
      // 控制添加角色对话框
      addRoleDialogVisible: false,
      // 添加角色表单
      addRoleFrom: {
        roleName: '',
        roleDesc: ''
      }
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表
    async getRoleList () {
      const { data: res } = await instance.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('请求角色列表数据失败,请稍后再试')
      } else {
        this.rolesList = res.data
        // console.log(res.data)
      }
    },
    async removeRightById (role, id, name) {
      // 先确认是否真的要删除
      const confirmRes = await this.$confirm(`是否删除${name}?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      // console.log(confirmRes)
      if (confirmRes === 'cancel') {
        return this.$message('已取消删除')
      } else {
        const { data: res } = await instance.delete(`roles/${role.id}/rights/${id}`)
        if (res.meta.status !== 200) {
          console.log('删除失败，请稍后再试')
        } else {
          role.children = res.data
        }
      }
    },
    // 弹出配置权限对话框并展示已有的权限
    async setRightDialogVisible (role) {
      this.setRoleId = role.id
      const { data: res } = await instance.get('rights/tree')
      if (res.meta.status !== 200) {
        this.$message.error('获取权限列表失败，请稍后再试')
      } else {
        // 把所有的权限放进权限树数组
        this.rightTree = res.data
        // 再取得该角色真实的权限的id并放进数组中
        this.getNodeId(role, this.saveNodeId)
        this.rightDialogVisible = !this.rightDialogVisible
      }
    },
    // 使用递归得到实际拥有的三级权限id
    getNodeId (node, array) {
      if (!node.children) {
        return array.push(node.id)
      } else {
        node.children.forEach(item => {
          this.getNodeId(item, array)
        })
      }
    },
    // 关闭分配权限对话框时重置角色权限数组
    setRightDialogClose () {
      this.saveNodeId = []
    },
    // 点击打开编辑角色对话框
    editRoleDialog (role) {
      this.editRoleFrom = {
        name: role.roleName,
        desc: role.roleDesc,
        id: role.id
      }
      this.editRoleDialogVisible = true
    },
    // 编辑角色对话框关闭时重置表单
    editRoleFromClose () {
      this.$refs.editRoleFromRef.resetFields()
    },
    // 按确定后修改角色
    editRole () {
      this.$refs.editRoleFromRef.validate(async (ruleRes) => {
        if (!ruleRes) {
        } else {
          const { data: res } = await instance.put('roles/' + this.editRoleFrom.id,
            {
              roleName: this.editRoleFrom.name,
              roleDesc: this.editRoleFrom.desc
            })
          if (res.meta.status !== 200) {
            this.$message.warning('修改角色失败，请稍后再试')
          } else {
            this.$message.success('修改角色信息成功')
            this.editRoleDialogVisible = false
            this.getRoleList()
          }
        }
      })
    },
    // 删除角色
    async removerole (role) {
      const confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      if (confirmRes === 'cancel') {
        return this.$message('已取消删除')
      } else {
        const { data: res } = await instance.delete('roles/' + role.id)
        if (res.meta.status !== 200) {
          this.$message.warning('删除失败，请稍后再试')
        } else {
          this.$message.success('删除成功')
          this.getRoleList()
        }
      }
    },
    // 添加角色对话框关闭时的操作
    addRoleFromClose () {
      this.$refs.addRoleFromRef.resetFields()
    },
    // 按确定添加角色
    addRole () {
      this.$refs.addRoleFromRef.validate(async (ruleRes) => {
        if (!ruleRes) {
        } else {
          const { data: res } = await instance.post('roles', this.addRoleFrom)
          if (res.meta.status !== 201) {
            console.log(this.addRoleFrom)
          } else {
            this.$message.success('添加角色成功')
            this.getRoleList()
            this.addRoleDialogVisible = false
          }
        }
      })
    },
    // 添加角色对话框打开按钮
    addUserbtn () {
      this.addRoleDialogVisible = true
    },
    // 点击确定设置权限
    async setRight () {
      const setrightIdArray = [
        ...this.$refs.rightTree.getCheckedKeys(),
        ...this.$refs.rightTree.getHalfCheckedKeys()
      ]
      // console.log(setrightIdArray)
      const idStr = setrightIdArray.join(',')
      // console.log(idStr)
      const { data: res } = await instance.post(`roles/${this.setRoleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        this.$message.warning('更新权限失败，请稍后再试')
      } else {
        this.$message.success('更新权限成功')
        this.getRoleList()
        this.rightDialogVisible = false
      }
    }
  }
}

</script>

<style>

</style>
