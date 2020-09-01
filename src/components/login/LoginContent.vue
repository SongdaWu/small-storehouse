<template>
  <div>
    <el-form ref="loginForm" :model="loginForm" :rules="loginFormRules" class="login-content">
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
      </el-form-item>
      <el-form-item class="btns">
        <el-button type="primary" @click='login' @keyup.enter.native="login">登录</el-button>
        <el-button type="info" @click="resetLoginFrom">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { instance } from '../../network/request.js'
export default {
  name: 'LoginContent',
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '宝宝要填写用户名才行哦', trigger: 'blur' },
          { min: 1, max: 100, message: '只能输入3至5个字符呢', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '要填写密码哦，亲', trigger: 'blur' },
          { min: 1, max: 100, message: '只能输入6到10个字符呢', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginFrom () {
      this.$refs.loginForm.resetFields()
    },
    login () {
      this.$refs.loginForm.validate(async vaild => {
        if (!vaild) return
        const { data: res } = await instance.post('login', this.loginForm)
        if (res.meta.status !== 200) {
          this.$message.error('登录失败了哦')
        } else {
          this.$message({
            duration: 500,
            message: '恭喜你，登录成功',
            type: 'success'
          })
          window.sessionStorage.setItem('token', res.data.token)
          this.$router.push('/home')
        }
      })
    }
  }
}
</script>

<style>
  .login-logo img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
  .btns{
    display: flex;
    justify-content: flex-end;
    /* float: right; */
  }
  .login-content{
    width: 100%;
    padding: 10px;
    position: absolute;
    bottom: 0;
    box-sizing: border-box;
  }
</style>
