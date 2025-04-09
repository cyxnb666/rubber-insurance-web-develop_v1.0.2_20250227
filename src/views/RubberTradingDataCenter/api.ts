import request from '@/request/index'

/**
 * 获取昨日橡胶期货收盘价格
 */
export function getYesterdayTurnoverPrice() {
    return request({
        url: '/screen/selectYesterdayTurnoverPrice',
        method: 'post'
    })
}

/**
 * 获取今日成交数据
 */
export function getTodayTrades() {
    return request({
        url: '/screen/selectToday10Trades',
        method: 'post'
    })
}

/**
 * 获取地图统计数据
 */
export function getMapStatistics(gb, yearly) {
    return request({
        url: '/screen/selectMapStaticis',
        method: 'post',
        data: {
            data: {
                gb: gb,
                yearly: yearly
            }
        }
    })
}

/**
 * 获取干胶实际交胶量分布数据
 */
export function getDryWeightStatistics(gb, yearly) {
    return request({
        url: '/screen/selectDryWeightStaticis',
        method: 'post',
        data: {
            data: {
                gb: gb,
                yearly: yearly
            }
        }
    })
}

/**
 * 获取预警保单数据统计
 */
export function getWarnPolicyStatistics(gb, yearly) {
    return request({
        url: '/screen/selectWarnPolicyStaticis',
        method: 'post',
        data: {
            gb: gb,
            yearly: yearly
        }
    })
}

/**
 * 获取镇级理赔统计数据
 */
export function getTownClaimStatistics(gb, yearly) {
    return request({
        url: '/screen/selectTownClaimStaticis',
        method: 'post',
        data: {
            data: {
                gb: gb,
                yearly: yearly
            }
        }
    })
}

/**
 * 获取区域统计数据
 */
export function getAreaStatistics(gb, yearly) {
    return request({
        url: '/screen/selectAreaStaticis',
        method: 'post',
        data: {
            data: {
                gb: gb,
                yearly: yearly
            }
        }
    })
}

/**
 * 获取理赔统计数据
 */
export function getClaimStatistics(gb: string, period: string, yearly: number) {
    return request({
        url: '/screen/selectClaimStaticis',
        method: 'post',
        data: {
            gb: gb,
            period: period,
            yearly: yearly
        }
    })
}

/**
 * 获取出险保单数和服务次数统计数据
 */
export function getTownServiceStatistics(gb: string, period: string, yearly: number) {
    return request({
        url: '/screen/selectTownServiceStaticis',
        method: 'post',
        data: {
            data: {
                gb: gb,
                period: period, // 永远都是传空值
                yearly: yearly
            }
        }
    })
}