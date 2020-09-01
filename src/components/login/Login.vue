<template>
  <div class="login-style">
    <div class="login-logo">
      <img src="../../assets/img/logo.png" alt="">
    </div>
    <LoginContent></LoginContent>
  </div>
</template>

<script>
import LoginContent from './LoginContent.vue'

export default {
  name: 'Login',
  components: {
    LoginContent
  }
}
</script>

<style>
  .login-style{
    position: absolute;
    width: 450px;
    height: 300px;
    top: 50%;
    left: 50%;
/*    margin-top: -150px;
    margin-left: -225px; */
    transform: translate(-50%, -50%);
    background-color: #fff;
    border-radius: 3px;
  }
  .login-logo{
    width: 130px;
    height: 130px;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    background-color: #fff;
  }
</style>
