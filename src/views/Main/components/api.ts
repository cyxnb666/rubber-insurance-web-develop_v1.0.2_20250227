import request from '@/request/index'

/**
 * 登出接口
 * @returns {Promise}
 */
export function logout() {
    return request({
        url: '/auth/logout',
        method: 'get'
    })
}