import request from '@/request/index'

/**
 * 获取基础参数列表 
 */
export function pageList(params: any) {
    return request({
        url: '/claimConfig/pageList',
        method: 'post',
        data: params
    })
}

/**
 * 保存
 */
export function saveClaimConfig(params: any) {
    return request({
        url: '/claimConfig/saveClaimConfig',
        method: 'post',
        data: params
    })
}

/**
 * 删除用户
 */
export function deleteClaimConfig(params: {
    isEnable: string,
    userCode: string
}) {
    return request({
        url: '/claimConfig/deleteClaimConfig',
        method: 'get',
        params
    })
}