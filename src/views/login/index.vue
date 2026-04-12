<script setup lang="ts">
import { User, Lock } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { loginApi } from '@/api/user'

// 定义store
const userStore = useUserStore()
// 定义路由
const router = useRouter()

// 基础数据
const userData = ref({
  username: '',
  password: ''
})

// 记住我
const remenber = ref(false)
const handleRemenber = () => {
  console.log(remenber.value)

}

// 点击登录
const login = async () => {
  // 验证字段
  console.log(userData.value)
  const res = await loginApi(userData.value.username, userData.value.password)
  console.log(res)
  if (res.code === 200) {
    userStore.userInfo = res.data.userInfo
    userStore.setToken(res.data.token)
    router.push('/')
    setTimeout(() => {
      ElMessage.success('登录成功')
    }, 500)
  }

}

// 忘记密码
const forgetPassword = () => {
  ElMessage('请联系管理员')
}

// 页面加载完毕时
onMounted(() => {

})
</script>

<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <el-form size="large" autocomplete="off">
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item>
          <el-input v-model="userData.username" :prefix-icon="User" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="userData.password" name="password" :prefix-icon="Lock" type="password" placeholder="请输入密码"
            @keydown.enter="login"></el-input>
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox v-model="remenber" @change="handleRemenber">记住我</el-checkbox>
            <el-link type="primary" @click="forgetPassword">忘记密码？</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button class="button" type="primary" auto-insert-space @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  background-color: #fff;

  .bg {
    background:
      url('@/style/images/logo2.png') no-repeat 60% center / 240px auto,
      url('@/style/images/login_bg.jpg') no-repeat center / cover;
  }

  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;

    .title {
      margin: 0 auto;
    }

    .button {
      width: 100%;
    }

    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>