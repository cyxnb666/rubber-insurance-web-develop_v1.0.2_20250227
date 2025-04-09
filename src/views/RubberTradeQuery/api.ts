import request from '@/request/index'

/**
 * 获取列表
 */
export function pageTransactionRecord(params: any) {
    return request({
        url: '/transaction/pageTransactionRecord',
        method: 'post',
        data: params
    })
}

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
 * 预览文件
 */
export function previewFile(fileId: string) {
    return request({
        url: '/file/download',
        method: 'get',
        params: {fileId},
        responseType: 'blob',
        isDownload: false
    })
}

/**
 * 下载文件
 */
export function downloadFile(fileId: string, name: string) {
    return request({
        url: '/file/download',
        method: 'get',
        params: {fileId},
        responseType: 'blob',
        isDownload: true,
        name
    })
}