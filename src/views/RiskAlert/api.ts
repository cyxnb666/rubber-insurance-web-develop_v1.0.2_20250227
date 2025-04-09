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
 * 获取风险预警列表
 */
export function pageRiskWarning(params: any) {
    return request({
        url: '/riskwarning/pageRiskWarning',
        method: 'post',
        data: params
    })
}

/**
 * 获取预警农户列表
 */
export function pageWarningFarmer(warningId: string, params: any) {
    return request({
        url: `/riskwarning/pageWarningFarmer/?warningId=${warningId}`,
        method: 'post',
        data: params
    })
}

/**
 * 删除风险预警
 */
export function deleteRiskWarning(warningId: string) {
    return request({
        url: '/riskwarning/deleteRiskWarning',
        method: 'get',
        params: { warningId }
    })
}

/**
 * 导出风险预警
 */
export function exportRiskWarning(condition: any) {
    return request({
        url: '/riskwarning/exportRiskWarning',
        method: 'post',
        data: {
            condition
        },
        responseType: 'blob',
        isDownload: true,
        name: '风险预警数据.xlsx'
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