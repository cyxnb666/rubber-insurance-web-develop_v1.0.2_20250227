import request from '@/request/index'

/**
 * 列表
 */
export function selectNonPolicyInsurers(data: any) {
    return request({
        url: '/policy/selectNonPolicyInsurers',
        method: 'post',
        data
    })
}

/**
 * 导出数据
 */
export function exportData(data: any) {
    return request({
        url: '/policy/export',
        method: 'post',
        data: {
            data
        },
        responseType: 'blob',
        isDownload: true,
        name: '非平台分户清单.xlsx'
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