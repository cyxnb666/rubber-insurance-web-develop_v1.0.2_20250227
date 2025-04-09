import request from '@/request/index'

/**
 * 查询种植信息
 * @param {*} farmerId
 * @returns
 */
export function getPlantingData(params: {
    farmerId: string,
    condition: any,
    pageNo: number,
    pageSize: number
}) {
    return request({
        url: `/farmer/plant/plant`,
        method: 'post',
        data: params
    })
}

/**
 * 查询变更记录
 * @param {*} farmerId
 * @returns
 */
export function changeHistory(farmerId: string) {
    return request({
        url: `/farmer/plant/changeHistory/${farmerId}`,
        method: 'get',
    })
}

/**
 * 获取下载列表
 * @param {*} params
 * @returns
 */
export function downloadList(params: any) {
    return request({
        url: `/farmer/plant/downloadList`,
        method: 'post',
        data: params
    })
}

/**
 * 下载实体文件
 * @param {*} exportId
 * @param {*} name
 * @returns
 */
export function downloadZip(exportId: string, name: string) {
    return request({
        url: `/farmer/plant/downloadZip/${exportId}`,
        method: 'get',
        responseType: 'blob',
        name
    })
}

/**
 * 查询全部行政区划树
 * @returns
 */
export function getCultivarCollection() {
    return request({
        url: '/auth/selectWholeAreaTree',
        method: 'post',
    })
}

/**
 * 农户种植信息分页查询
 * @param {*} data
 * @returns
 */
export function queryPlant(data: any) {
    return request({
        url: '/farmer/plant/queryPlant',
        method: 'post',
        data
    })
}

/**
 * 下载任务创建
 * @param {*} data
 * @returns
 */
export function createDownload(data: any) {
    return request({
        url: '/farmer/plant/createDownload',
        method: 'post',
        data
    })
}

/**
 * 确认种植信息
 * @param {*} data
 * @returns
 */
export function plantConfirm(data: any) {
    return request({
        url: '/api/plant/confirm',
        method: 'post',
        data
    })
}

/**
 * 获取橡胶平台信息
 * @returns
 */
export function platform() {
    return request({
        url: '/api/platform',
        method: 'get',
    })
}