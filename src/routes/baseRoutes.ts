export const getBaseRoutes = () => {
    return [
        {
            path: '/',
            name: 'Main',
            component: 'Main',
            children: [
                {
                    path: 'RubberTradingDataCenter',
                    name: 'RubberTradingDataCenter',
                    component: 'RubberTradingDataCenter',
                    meta: {
                        title: '橡胶交易数据中心',
                        icon: 'rubberTradingDataCenter_icon'
                    }
                },
                {
                    path: 'farmerPlantingManagement',
                    name: 'FarmerPlantingManagement',
                    component: null,
                    meta: {
                        title: '农户种植信息管理',
                        icon: 'farmerPlantingManagement_icon',
                    },
                    children: [
                        {
                            path: 'plantingInfoPending',
                            name: 'PlantingInfoPending',
                            meta: {
                                title: '种植信息待确认',
                                icon: ""
                            },
                            component: 'FarmerPlantingManagement/PlantingInfoPending',
                        },
                        {
                            path: 'plantingInfoConfirmed',
                            name: 'PlantingInfoConfirmed',
                            meta: {
                                title: '种植信息已确认',
                                icon: ""
                            },
                            component: 'FarmerPlantingManagement/PlantingInfoConfirmed',
                        },
                        {
                            path: 'plantingInfoUpdated',
                            name: 'PlantingInfoUpdated',
                            meta: {
                                title: '种植信息变更确认',
                                icon: ""
                            },
                            component: 'FarmerPlantingManagement/PlantingInfoUpdated',
                        },
                    ]
                },
                {
                    path: 'coverageQuery',
                    name: 'CoverageQuery',
                    component: null,
                    meta: {
                        title: '承保查询',
                        icon: 'coverageQuery_icon',
                    },
                    children: [
                        {
                            path: 'policyInfoQuery',
                            name: 'PolicyInfoQuery',
                            meta: {
                                title: '保单信息查询',
                                icon: ""
                            },
                            component: 'CoverageQuery/PolicyInfoQuery',
                        },
                        {
                            path: 'nonPlatformSubAccountList',
                            name: 'NonPlatformSubAccountList',
                            meta: {
                                title: '非平台分户清单',
                                icon: ""
                            },
                            component: 'CoverageQuery/NonPlatformSubAccountList',
                        }
                    ]
                },
                {
                    path: 'rubberTradeQuery',
                    name: 'RubberTradeQuery',
                    component: 'RubberTradeQuery',
                    meta: {
                        title: '橡胶交易查询',
                        icon: 'rubberTradeQuery_icon'
                    },
                },
                {
                    path: 'claimManagement',
                    name: 'ClaimManagement',
                    component: null,
                    meta: {
                        title: '理赔管理',
                        icon: 'claimManagement_icon',
                    },
                    children: [
                        {
                            path: 'claimCalculation',
                            name: 'ClaimCalculation',
                            meta: {
                                title: '理赔测算',
                                icon: ""
                            },
                            component: 'ClaimManagement/ClaimCalculation',
                        },
                        {
                            path: 'claimProgressQuery',
                            name: 'ClaimProgressQuery',
                            meta: {
                                title: '理赔进度查询',
                                icon: ""
                            },
                            component: 'ClaimManagement/ClaimProgressQuery',
                        }
                    ]
                },
                {
                    path: 'riskAlert',
                    name: 'RiskAlert',
                    component: 'RiskAlert',
                    meta: {
                        title: '风险预警',
                        icon: 'riskAlert_icon'
                    },
                },
                {
                    path: 'baseConfig',
                    name: 'BaseConfig',
                    component: null,
                    meta: {
                        title: '基础配置',
                        icon: 'baseConfig_icon',
                    },
                    children: [
                        {
                            path: 'baseParams',
                            name: 'BaseParams',
                            meta: {
                                title: '基础参数',
                                icon: ""
                            },
                            component: 'BaseConfig/BaseParams',
                        },
                        {
                            path: 'futuresClosingPrice',
                            name: 'FuturesClosingPrice',
                            meta: {
                                title: '期货收盘价格',
                                icon: ""
                            },
                            component: 'BaseConfig/FuturesClosingPrice',
                        },
                        {
                            path: 'userManagement',
                            name: 'UserManagement',
                            meta: {
                                title: '用户管理',
                                icon: ""
                            },
                            component: 'BaseConfig/UserManagement',
                        },
                        {
                            path: 'scheduledTaskManagement',
                            name: 'ScheduledTaskManagement',
                            meta: {
                                title: '定时任务管理',
                                icon: ""
                            },
                            component: 'BaseConfig/ScheduledTaskManagement',
                        }
                    ]
                },
            ]
        }
    ];
};