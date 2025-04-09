import request from '@/request/index'

/**
 * 获取公司树
 * @param params {rootComcode: string}
 * @returns {Promise}
 */
export function getCompanyTree(params: { rootComcode: string }) {
    return request({
        url: '/company/getCompanyTree',
        method: 'post',
        data: params
    })
}

/**
 * 获取用户列表 
 */
export function getUserList(params: any) {
    return request({
        url: '/user/pageListUser',
        method: 'post',
        data: params
    })
}

/**
 * 更新用户状态
 */
export function updateUserStatus(params: {
    isEnable: string,
    userCode: string
}) {
    return request({
        url: '/user/updateUserStatus',
        method: 'get',
        params
    })
}
/**
 * 删除用户
 */
export function deleteUser(usercode: string) {
    return request({
        url: `/user/deleteUser/${usercode}`,
        method: 'get'
    })
}

/**
 * 获取用户详情
 */
export function getUserDetail(params: { userCode: string }) {
    return request({
        url: '/user/userDetail',
        method: 'get',
        params
    })
}

/**
 * 获取数据范围树
 */
export function getCompanyTreeByArea(params: { comcode: string }) {
    return request({
        url: '/company/getCompanyTreeByareaMapping',
        method: 'get',
        params
    })
}

/**
 * 获取所有菜单树
 */
export function getAllMenuTree() {
    return request({
        url: '/menu/getAllmenuTree',
        method: 'get'
    })
}

/**
 * 保存用户信息
 */
export function saveUserInfo(params: any) {
    return request({
        url: '/user/saveUserInfo',
        method: 'post',
        data: params
    })
}

/**
 * 获取用户数据范围详情
 */
export function getUserScopeDetail(params: any) {
    return request({
        url: '/user/selectUserDataRanges',
        method: 'post',
        data: params
    })
}