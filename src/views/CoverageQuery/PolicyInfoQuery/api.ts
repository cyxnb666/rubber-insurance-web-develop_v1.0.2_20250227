import request from '@/request/index'

/**
 * 列表
 */
export function selectPolicyInsurers(data: any) {
    return request({
        url: '/policy/selectPolicyInsurers',
        method: 'post',
        data
    })
}

/**
 * 获取保险产品名称字典
 */
export function getDictList(params: any) {
    return request({
        url: '/dict/getDictList',
        method: 'post',
        data: params
    })
}