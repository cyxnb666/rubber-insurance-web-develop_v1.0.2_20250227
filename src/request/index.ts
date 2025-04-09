import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { notification } from 'ant-design-vue';

// 配置axios默认值
axios.defaults.timeout = 30000;
axios.defaults.baseURL = import.meta.env.VITE_APP_BASE_API;
// 返回状态码范围
axios.defaults.validateStatus = function (status) {
    return status >= 200 && status <= 500;
};
// 跨域请求，允许保存cookie
axios.defaults.withCredentials = true;

// NProgress配置
NProgress.configure({
    showSpinner: false,
});

// HTTP request拦截
axios.interceptors.request.use(
    (config: any) => {
        NProgress.start(); // 开始进度条

        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // 添加时间戳到请求头
        const timestamp = Date.now();
        config.headers.timestamp = timestamp.toString();

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// HTTP response拦截
axios.interceptors.response.use(
    (res: any) => {
        NProgress.done(); // 结束进度条

        if (!res) return Promise.reject(new Error('请求失败'));

        const status = res.status || 200;

        // 处理HTTP错误状态码
        if (status !== 200) {
            notification.error({
                message: '系统提示',
                description: `服务器请求【${status}】异常，请联系管理员`,
                duration: 3,
            });
            return Promise.reject(new Error('接口异常'));
        }

        // 处理响应数据
        if (res.data instanceof Object) {
            const { code, message: msg, data } = res.data;

            // 处理成功响应
            if (code === 200 || code === 0 || code === '0000') {
                return Promise.resolve(data);
            }

            // 处理登录失效
            if (code === 401 || code === 403) {
                notification.error({
                    message: '登录提示',
                    description: '登录状态已过期，请重新登录',
                    duration: 3,
                });
                return Promise.reject('登录状态已过期，请重新登录');
            }

            // 处理其他错误情况
            notification.error({
                message: '提示',
                description: msg || '系统异常',
                duration: 3,
            });
            return Promise.reject(msg || '系统异常');
        }

        return Promise.resolve(res.data);
    },
    (error) => {
        NProgress.done();

        // 处理网络错误等
        notification.error({
            message: '网络异常',
            description: error.message || '网络请求失败',
            duration: 3,
        });

        return Promise.reject(error);
    },
);

export default axios;