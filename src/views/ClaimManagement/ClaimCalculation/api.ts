import request from '@/request/index'

/**
 * 获取种植地区域树
 */
export function getAreaTree() {
    return request({
        url: '/auth/selectWholeAreaTree',
        method: 'post'
    })
}

/**
 * 获取理赔测算列表数据
 */
export function pagePreClaims(params: any) {
    return request({
        url: '/claim/pagePreClaims',
        method: 'post',
        data: params
    })
}

/**
 * 获取结算周期数据
 */
export function selectClaimMeasures() {
    return request({
        url: '/measure/selectClaimMeasures',
        method: 'post'
    })
}

/**
 * 导出理赔测算
 */
export function exportClaim(data: any) {
    return request({
        url: '/claim/export',
        method: 'post',
        data: {
            data
        },
        responseType: 'blob',
        isDownload: true,
        name: '理赔测算数据.xlsx'
    })
}