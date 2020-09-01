<template>
  <div class="interface-style">
    <Login></Login>
  </div>
</template>

<script>
import Login from '../../components/login/Login.vue'

export default {
  name: 'LoginInterface',
  components: {
    Login
  }
}
</script>

<style>
  .interface-style {
    height: 100%;
    background-color: #2b4b6b;
  }
</style>
