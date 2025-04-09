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
 * 获取测算信息
 */
export function getMeasures() {
    return request({
        url: '/measure/selectWholeMeasures',
        method: 'post'
    })
}

/**
 * 启用/停用测算
 */
export function toggleMeasureStatus(params: any) {
    return request({
        url: '/measure/enableOrDisableMeasure',
        method: 'post',
        data: params
    })
}

// 更新测算配置
export function updateMeasure(params: any) {
    return request({
        url: '/measure/updateMeasure',
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

// 查询测算任务列表
export function selectStaticisPreClaims(params: any) {
    return request({
        url: '/measure/selectStaticisPreClaims',
        method: 'post',
        data: params
    })
}

/**
 * 获取风险预警任务列表
 */
export function pageRiskWarningTask(params: any) {
    return request({
        url: '/riskwarning/pageRiskWarningTask',
        method: 'post',
        data: params
    })
}