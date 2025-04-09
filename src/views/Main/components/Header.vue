<template>
  <div class="HeaderView">
    <div class="projectIconAndTitle">
      <img class="projectIcon" src="../../../assets/images/pageLogo.png" alt="">
    </div>
    <a-dropdown>
      <a class="ant-dropdown-link" @click.prevent>
        您好! {{ userName }}
        <DownOutlined />
      </a>
      <template #overlay>
        <a-menu>
          <!-- <a-menu-item>
            <a href="javascript:;" style="color: #46B180" @click="editPassword">修改密码</a>
          </a-menu-item> -->
          <a-menu-item>
            <a href="javascript:;" style="color: red" @click="outLogin">退出登录</a>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script lang="ts" setup>
import { DownOutlined } from '@ant-design/icons-vue';
import {onMounted, ref} from "vue";
import { logout } from './api';
import { useRouter } from 'vue-router';
const router = useRouter();
import { message } from 'ant-design-vue';
import { sessionManager } from '@/utils/sessionManager';

const userName = ref('管理员')
const editPassword = () => {
  console.log('editPassword')
}
const outLogin = async () => {
  try {
    await logout();
    sessionManager.clearSession();
    // 清除登录信息
    sessionStorage.clear();
    message.success('退出成功');
    // 跳转到登录页
    await router.push('/login');
  } catch (error) {
    console.error('退出失败:', error);
  }
}
onMounted(()=>{
  userName.value = JSON.parse(sessionStorage.getItem('userInfo') || '{}').username
})
</script>

<style lang="scss" scoped>
.HeaderView {
  background-color: #46B180;
  height: 64px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .projectIconAndTitle {
    .projectIcon {
      height: 36px;
      margin-left: 20px;
    }
  }

  .ant-dropdown-link {
    color: #FFFFFF;
    margin-right: 20px;
    font-size: 16px;
    font-weight: 400;
  }
}

</style>
