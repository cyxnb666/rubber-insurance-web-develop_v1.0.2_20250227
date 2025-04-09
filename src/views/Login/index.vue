<template>
  <div class="LoginView" id="LoginView">
    <div class="LoginBox">
      <div class="LoginBox-title">
        <img src="../../assets/images/loginLogo.png" alt="" :width="500" :height="80">
        <a-divider class="divider" />
        <div>橡胶收入保险管理平台</div>
      </div>
      <div class="loginForm">
        <div class="formBox">
          <div class="formBox-header">
            <img src="../../assets/images/piccLogo.png" :width="117" :height="40" alt="">
            <a-divider type="vertical" />
            <div class="title">橡胶收入管理平台</div>
          </div>
          <div class="tips">请输入工号和密码</div>
          <a-form :model="loginForm" name="basic" autocomplete="off" @finish="onFinish" @finishFailed="onFinishFailed">
            <a-form-item name="username" :rules="[{ required: true, message: '请输入工号!' }]">
              <a-input placeholder="请输入工号" v-model:value="loginForm.username" />
            </a-form-item>

            <a-form-item name="password" :rules="[{ required: true, message: '请输入密码!' }]">
              <a-input-password placeholder="请输入密码" v-model:value="loginForm.password" />
            </a-form-item>

            <a-form-item name="code" :rules="[{ required: true, message: '请输入验证码!' }]" class="code">
              <a-input placeholder="请输入验证码" v-model:value="loginForm.code">
              </a-input>
              <img :src="verifyCodeUrl" width="136px" height="56px" alt="验证码" @click="refreshVerifyCode"
                style="cursor: pointer;">
            </a-form-item>
            <a-form-item :wrapper-col="{ span: 24 }" c>
              <a-button class="submit" type="primary" html-type="submit" :loading="loading">登 录</a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import autofit from 'autofit.js'
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { getVerifyCode, login } from './api';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { loadAsyncRoutes } from '@/routes';
import { sm4 } from 'sm-crypto';
import { Buffer } from 'buffer';

const router = useRouter();
const verifyCodeUrl = ref('');

const encryptionKey = 'e56bc2799c48111d8fcc6bae70d77c51';

interface FormState {
  username: string;
  password: string;
  code: string;
}

const loading = ref<boolean>(false);
const loginForm = reactive<FormState>({
  username: '',
  password: '',
  code: '',
});

const onFinish = async (values: FormState) => {
    const paramsToEncrypt = {
        usercode: values.username,
        cipher: values.password,
        verifyCode: values.code
    };
    
    let encryptInfo;
    try {
        const encryptedHex = sm4.encrypt(JSON.stringify(paramsToEncrypt), encryptionKey, {
            mode: 'ecb'
        });
        encryptInfo = Buffer.from(encryptedHex, 'hex').toString('base64');
    } catch (error) {
        console.error('加密失败:', error);
        message.error('登录加密失败');
        return;
    }
    
    loading.value = true;
    try {
        const res = await login(encryptInfo);
        if (res) {
            message.success('登录成功');
            sessionStorage.setItem('token', res.token);
            sessionStorage.setItem('userInfo', JSON.stringify({
                usercode: res.usercode,
                username: res.username,
                comcode: res.comcode,
                comshortname: res.comshortname
            }));
            sessionStorage.setItem('menus', JSON.stringify(res.menus));

            // 加载路由
            await loadAsyncRoutes(res.menus);

            // 找到第一个有效的二级菜单进行跳转
            const firstValidMenu = res.menus.find(menu => 
                menu.menuLevel === 2 && menu.parentMenuMappingName
            );

            if (firstValidMenu) {
                await router.push(`/${firstValidMenu.parentMenuMappingName}/${firstValidMenu.menuMappingName}`);
            } else {
                message.error('没有可访问的菜单权限');
            }
        }
    } catch (error) {
        console.error('登录失败:', error);
        refreshVerifyCode();
    } finally {
        loading.value = false;
    }
};

const onFinishFailed = (errorInfo: any) => {
  console.error('表单验证失败:', errorInfo);
  message.error('请填写完整的登录信息');
};
const refreshVerifyCode = async () => {
  try {
    const blob = await getVerifyCode();
    if (verifyCodeUrl.value) {
      console.log('清除旧的URL:', verifyCodeUrl.value);
      URL.revokeObjectURL(verifyCodeUrl.value);
    }

    const newUrl = URL.createObjectURL(new Blob([blob], { type: 'image/png' }));
    verifyCodeUrl.value = newUrl;
  } catch (error) {
    console.error('验证码刷新失败:', error);
  }
};
onMounted(() => {
  autofit.init({
    dh: 1080,
    dw: 1920,
    el: "#LoginView",
    resize: true
  })
  refreshVerifyCode();
})
onBeforeUnmount(() => {
  if (verifyCodeUrl.value) {
    URL.revokeObjectURL(verifyCodeUrl.value);
  }
});
</script>

<style lang="scss" scoped>
.LoginView {
  width: 100%;
  height: 100%;
  background-image: url("../../assets/images/loginBG.png");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;

  .LoginBox {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 200px;

    &-title {
      padding-top: 20px;
      height: 570px;
      color: #FFFFFF;
      font-weight: 600;
      font-size: 40px;

      .divider {
        height: 2px;
        background-color: #FFFFFF;
        margin: 54px 0;
      }
    }

    .loginForm {
      width: 580px;
      height: 570px;
      background-color: rgba(255, 255, 255, 0.4);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      .formBox {
        width: 570px;
        height: 560px;
        background-color: #FFFFFF;
        border-radius: 8px;
        padding: 36px 58px 52px;

        &-header {
          display: flex;
          align-items: center;

          .ant-divider {
            height: 32px;
            margin: 0 16px;
          }

          .title {
            font-weight: 700;
            font-size: 24px;
            color: #333333;
          }
        }

        .tips {
          font-weight: 400;
          font-size: 18px;
          color: rgba(51, 51, 51, 0.6012);
          margin-top: 45px;
          margin-bottom: 35px;
        }
      }
    }
  }
}

:deep(.ant-input-password .ant-input) {
  height: 46px;
  // border-radius: 2px;
}

:deep(.ant-form-item:first-child .ant-input) {
  height: 56px;
  // border-radius: 2px;
}

:deep(.ant-input) {
  // border-radius: 2px;
}

.code {
  :deep(.ant-form-item-control-input-content) {
    display: flex;

    .ant-input {
      width: calc(100% - 146px);
    }

    img {
      margin-left: 18px;
    }
  }

}


.submit {
  width: 100%;
  height: 56px;
  margin-top: 46px;
  border-radius: 2px;
}
</style>
