<template>
    <div class="loading-container">
        <a-spin :spinning="true" tip="正在登录中..." size="large">
            <div class="content">
                <img src="../../assets/images/loginLogo.png" alt="logo" class="logo">
                <div class="title">橡胶收入保险管理平台</div>
            </div>
        </a-spin>
    </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { loginByPiccToken } from '@/views/Login/api';
import { loadAsyncRoutes } from '@/routes';

const router = useRouter();
const route = useRoute();

const handleLogin = async () => {
    try {
        // 从URL中获取token
        const token = route.query.token as string;

        if (!token) {
            message.error('未获取到登录信息');
            router.push('/login');
            return;
        }

        const res = await loginByPiccToken(token);

        if (res) {
            sessionStorage.setItem('token', res.token);
            sessionStorage.setItem('userInfo', JSON.stringify({
                usercode: res.usercode,
                username: res.username,
                comcode: res.comcode,
                comshortname: res.comshortname
            }));
            sessionStorage.setItem('menus', JSON.stringify(res.menus));

            await loadAsyncRoutes(res.menus);

            const firstValidMenu = res.menus.find(menu =>
                menu.menuLevel === 2 && menu.parentMenuMappingName
            );

            if (firstValidMenu) {
                router.push(`/${firstValidMenu.parentMenuMappingName}/${firstValidMenu.menuMappingName}`);
            } else {
                message.error('没有可访问的菜单权限');
                router.push('/login');
            }
        } else {
            message.error('登录失败');
            router.push('/login');
        }
    } catch (error) {
        console.error('登录失败:', error);
        message.error('登录失败，请重试');
        router.push('/login');
    }
};

onMounted(() => {
    handleLogin();
});
</script>

<style lang="scss" scoped>
.loading-container {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f2f5;

    .content {
        text-align: center;
        padding: 32px;

        .logo {
            width: 300px;
            margin-bottom: 24px;
        }

        .title {
            font-size: 24px;
            color: rgba(0, 0, 0, 0.85);
            font-weight: 500;
            margin-top: 16px;
        }
    }
}

:deep(.ant-spin-text) {
    margin-top: 8px;
    font-size: 16px;
}

:deep(.ant-spin-dot) {
    font-size: 36px;
}
</style>