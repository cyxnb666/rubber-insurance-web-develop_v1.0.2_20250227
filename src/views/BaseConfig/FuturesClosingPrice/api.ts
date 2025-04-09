import request from '@/request/index'

/**
 * 获取期货收盘价格列表
 */
export function getClosingPriceList(data: any) {
    return request({
        url: '/closingprice/pageListClosingPrice',
        method: 'post',
        data
    })
}