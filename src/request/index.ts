import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { Modal, notification } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { createVNode } from 'vue';
import router from '../routes/index.ts';


// 是否显示重新登录
const isRelogin = { show: false };
axios.defaults.timeout = 3000000;

axios.defaults.baseURL = import.meta.env.VITE_APP_BASE_API;
// 返回其他状态吗
axios.defaults.validateStatus = function (status) {
    return status >= 200 && status <= 500; // 默认的
};
// 跨域请求，允许保存 cookie
axios.defaults.withCredentials = true;
// NProgress Configuration
NProgress.configure({
    showSpinner: false,
});

// HTTP request 拦截
axios.interceptors.request.use(
    (config: any) => {
        NProgress.start();
        // start progress bar
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers['X-Access-Token'] = token;
        }
        const utcTimestamp = Date.now();
        config.headers.timestamp = utcTimestamp.toString();
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// HTTP response 拦截
axios.interceptors.response.use(
    async (res: any) => {
        NProgress.done();
        if (!res) return Promise.reject(new Error('请求失败'));
        const status = res.status || 200;
        if (res.config?.url?.includes('/auth/getVerifyCode') && status === 200) {
            return Promise.resolve(res.data);
        }
        if (res.config?.responseType === 'blob' && status === 200) {
            const contentType = res.headers['content-type'];
            if (contentType?.startsWith('application/octet-stream')) {
                return Promise.resolve(res.data);
            }
            if (contentType && (
                contentType.includes('application/zip') ||
                contentType.includes('application/x-zip-compressed')
            )) {
                const blob = new Blob([res.data], { type: contentType });
                if (res) {
                    const aLink = document.createElement('a');
                    aLink.style.display = 'none';
                    aLink.href = URL.createObjectURL(blob);
                    // aLink.download = res.config.name;
                    aLink.download = '下载文件.zip';
                    document.body.appendChild(aLink);
                    aLink.click();
                    document.body.removeChild(aLink);
                    URL.revokeObjectURL(aLink.href);
                    return Promise.resolve();
                }
                return Promise.resolve(blob);
            }


            const reader = new FileReader();
            reader.readAsText(res.data, 'utf-8'); // 读取blob数据为文本
            reader.onload = function (e: any) {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    if (jsonData) {
                        notification.error({
                            message: '提示',
                            description: jsonData.messages[0].message,
                            duration: 3,
                        });
                        return Promise.reject()
                    }
                } catch (error) {
                    // 处理解析JSON时可能出现的错误
                    console.error('Error parsing JSON:', error);
                    const blob = new Blob([res.data], { type: res.data.type });
                    if (res.config?.isDownload) {
                        const aLink = document.createElement('a');
                        aLink.style.display = 'none';
                        aLink.href = URL.createObjectURL(blob);
                        aLink.download = res.config.name;
                        document.body.appendChild(aLink);
                        aLink.click();
                        document.body.removeChild(aLink);
                        return Promise.resolve(); // 已经处理了下载-返回
                    }
                    return Promise.resolve(blob); // 不处理下载-返回
                }
            };
            reader.onerror = function (error) {
                // 处理FileReader可能出现的错误
                console.error('FileReader error:', error);
            };

        } else if (status !== 200) {
            if (status === 401 && res.data?.retCode === '9401') {
                if (!isRelogin.show) {
                    isRelogin.show = true;
                    Modal.confirm({
                        title: '系统提示',
                        centered: true,
                        icon: createVNode(ExclamationCircleOutlined),
                        content: createVNode('div', {}, '登录状态已过期，您可以继续留在该页面，或者重新登录'),
                        onOk() {
                            isRelogin.show = false;
                            router.push('/login');
                        },
                        onCancel() {
                            isRelogin.show = false;
                        },
                        class: 'test',
                    });
                }
                return Promise.reject('无效的会话，或者会话已过期，请重新登录。');
            }
            console.log('网络请求错误', res);
            notification.error({
                message: '系统提示',
                description: `服务器请求【${status}】异常，请联系管理员`,
                duration: 3,
            });
            return Promise.reject(new Error('接口异常'));
        } else if (res.data instanceof Object) {
            const { retCode, retMsg, retData } = res.data;

            // 处理登录失效的情况
            if (retCode === '9991' || retCode === '9401') {
                if (!isRelogin.show) {
                    isRelogin.show = true;
                    Modal.confirm({
                        title: '系统提示',
                        centered: true,
                        icon: createVNode(ExclamationCircleOutlined),
                        content: createVNode('div', {}, '登录状态已过期，您可以继续留在该页面，或者重新登录'),
                        onOk() {
                            isRelogin.show = false;
                            router.push('/login');
                        },
                        onCancel() {
                            isRelogin.show = false;
                        },
                        class: 'test',
                    });
                }
                return Promise.reject('无效的会话，或者会话已过期，请重新登录。');
            }
            // 处理成功响应
            if (retCode === '0000') {
                return Promise.resolve(retData);
            }

            // 处理其他错误情况
            notification.error({
                message: '提示',
                description: retMsg || '系统异常',
                duration: 3,
            });
            return Promise.reject(retMsg);
        }
        return Promise.resolve(res.data);
    },
    (error) => {
        NProgress.done();
        return Promise.reject(new Error(error));
    },
);

export default axios;
