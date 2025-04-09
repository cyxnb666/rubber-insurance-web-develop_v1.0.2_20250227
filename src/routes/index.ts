import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";
import { useStore } from "@/store";
import { message } from "ant-design-vue";
import { getBaseRoutes } from './baseRoutes';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login/index.vue')
    },
    {
        path: '/',
        name: 'Root',
        component: () => import('@/views/Loading/index.vue')
    },
    {
        path: '/loading',
        name: 'Loading',
        component: () => import('@/views/Loading/index.vue')
    },
    {
        path: '/:catchAll(.*)',
        component: () => import('@/views/Error/404.vue')
    }
]
const router = createRouter({
    history: createWebHashHistory('/rubber_insurance_web/'),
    routes: routes
})
function filterRoutesByMenus(routes: any[], userMenus: any[]): any[] {
    const menuMappingNames = userMenus.map(menu => menu.menuMappingName);

    return routes.map(route => {
        const newRoute = { ...route };
        if (newRoute.children) {
            const filteredChildren = newRoute.children.filter(child => {
                // 检查当前路由是否在菜单列表中
                const isInMenus = menuMappingNames.includes(child.name);

                if (child.children) {
                    // 过滤子菜单
                    child.children = child.children.filter(grandChild =>
                        menuMappingNames.includes(grandChild.name)
                    );
                    // 如果有子菜单被保留，则保留父菜单
                    return child.children.length > 0 || isInMenus;
                }
                return isInMenus;
            });

            newRoute.children = filteredChildren;
        }
        return newRoute;
    });
}
function hasPermission(to: any, userMenus: any[]): boolean {
    // 特殊路由如登录、404等始终允许访问
    const whiteList = ['/login', '/loading', '/404'];
    if (whiteList.includes(to.path)) {
        return true;
    }

    // 如果是根路径，允许访问
    if (to.path === '/') {
        return true;
    }

    // 检查目标路由名称是否在用户的菜单列表中
    // 转换为名称数组用于权限判断
    const menuNames = userMenus.map(menu => menu.menuMappingName);

    // 检查是否为二级路由
    if (to.matched.length > 1) {
        // 假设to.matched[1]是要检查的路由
        return menuNames.includes(to.matched[to.matched.length - 1].name);
    }

    return menuNames.includes(to.name);
}
// 路由守卫
router.beforeEach((to, _, next) => {
    const token = sessionStorage.getItem('token');

    if (to.path === '/' && to.query.token) {
        next();
        return;
    }

    if (to.path === '/loading') {
        next();
        return;
    }

    // 未登录且非登录页，重定向到登录页
    if (!["/login", "/loading", "/", "/404"].includes(to.path) && !token) {
        next({ path: "/login", replace: true })
        message.error("请先登录")
        return
    }

    // 已登录状态下的权限验证
    if (to.path !== '/' && to.path !== '/login' && to.path !== '/404') {
        const store = useStore();
        const userMenus = JSON.parse(sessionStorage.getItem('menus') || '[]');

        // 如果路由未加载，先加载路由
        if (store.routes.length < 1) {
            const filteredRoutes = filterRoutesByMenus(getBaseRoutes(), userMenus);
            store.addRoutes(filteredRoutes, router);

            // 检查权限
            if (!hasPermission(to, userMenus)) {
                next({ path: "/404", replace: true });
                return;
            }

            next({ path: to.path, replace: true });
        } else {
            // 路由已加载，只需检查权限
            if (!hasPermission(to, userMenus)) {
                next({ path: "/404", replace: true });
                return;
            }

            next();
        }
    } else if (to.path === '/') {
        next({ path: "/login", replace: true });
    } else {
        next();
    }
})
// 导出
export default router


export const loadAsyncRoutes = (userMenus: any[]) => {
    const store = useStore();
    // 每次获取新的路由配置副本
    const filteredRoutes = filterRoutesByMenus(getBaseRoutes(), userMenus);
    return store.addRoutes(filteredRoutes, router);
};