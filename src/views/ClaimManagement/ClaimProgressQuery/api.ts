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
 * 获取理赔进度列表数据
 */
export function pageClaimProgress(params: any) {
    return request({
        url: '/claimProgress/pageClaimProgress',
        method: 'post',
        data: params
    })
}

/**
 * 导出理赔进度
 */
export function exportClaimProgress(data: any) {
    return request({
        url: '/claimProgress/exportClaimProgress',
        method: 'post',
        data: data,
        responseType: 'blob',
        isDownload: true,
        name: '理赔进度数据.xlsx'
    })
}

/**
 * 获取字典列表数据
 */
export function getDictList(params: any) {
    return request({
        url: '/dict/getDictList',
        method: 'post',
        data: params
    })
}