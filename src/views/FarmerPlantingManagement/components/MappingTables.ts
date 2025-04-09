const mappingTables = {
    "farmerName": "被保险人姓名/单位名称",
    "cardNo": "身份证号码/营业执照编号",
    "provinceCode": "被保险人所在地址-省编码",
    "cityCode": "被保险人所在地址-市编码",
    "districtCode": "被保险人所在地址-区县编码",
    "townCode": "被保险人所在地址-乡镇编码",
    "villageCode": "被保险人所在地址-村编码",
    "linkerName": "联系人（单位投保）",
    "linkerPhone": "手机",
    "linkerEmail": "邮箱地址",
    "bankAccountNo": "银行卡号/账号",
    "bankName": "开户银行名称",
    "platformId": "平台",
    "farmerId": "农户Id",
    "landOperation": "土地经营方式 1：自有 2：租赁 3：承包",
    "plantArea": "种植面积（亩）",
    "plant8Area": "其中：树龄8年以上的面积",
    "plantInsuranceArea": "种植保险投保面积",
    "incomeInsuranceArea": "收入保险投保面积",
    "fileName": "附件名称",
    "filePath": "附件路径",
    "fileType": "附件类型",
    "fileSuffix": "附件后缀",
    "fileUrl": "附件链接"
}
const landOperation = {
    "1": "自有",
    "2": "租赁",
    "3": "承包"
}
const fileType = {
    "CARD": "身份证/营业执照",
    "BANK": "银行卡(账户信息)",
    "FOREST": "林权证",
    "CONTRACT": "承保合同",
    "LAND_CONTRACT": "土地流转合同",
    "PAYCERTIFICATE": "支付凭证",
    "OTHER": "其他证明材料"
}
const areaLevel = {
    "1": "provenceCode",
    "2": "cityCode",
    "3": "districtCode",
    "4": "townCode",
    "5": "villageCode",
}
export default {
    mappingTables,
    landOperation,
    fileType,
    areaLevel
};
