import request from '@/request/index'

import { sessionManager } from '@/utils/sessionManager';

/**
 * 获取验证码
 * @returns {Promise<Blob>}
 */
export function getVerifyCode() {
    return request({
        url: '/auth/getVerifyCode',
        method: 'get',
        responseType: 'blob',
        headers: {
            'JSESSIONID': sessionManager.getSessionId()
        }
    })
}

/**
 * 登录接口
 * @param encryptInfo 加密后的Base64字符串
 * @returns {Promise}
 */
export function login(encryptInfo: string) {
    return request({
        url: '/auth/login',
        method: 'get',
        params: { encryptInfo },
        headers: {
            'JSESSIONID': sessionManager.getSessionId()
        }
    })
}

/**
 * 通过Token登录
 * @param token {string} PICC Token
 * @returns {Promise}
 */
export function loginByPiccToken(token: string) {
    return request({
        url: '/auth/loginByPiccToken',
        method: 'get',
        params: { token }
    })
}