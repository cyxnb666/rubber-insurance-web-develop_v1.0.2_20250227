<template>
  <div class="PlantingInfoConfirmed">
    <TableLayout @tableChange="tableChange" @onSearch="onSearch" :defaultValues="{ confirmType: '1' }">
      <template #otherButton>
        <a-button type="primary" @click="downloadFn" style="margin-left: 10px;" :icon="h(VerticalAlignBottomOutlined)">
          下载
        </a-button>
        <a-button type="primary" @click="downloadRecord" style="margin-left: 10px;"
                  :icon="h(BarsOutlined)">
          下载记录
        </a-button>
      </template>
      <template #operator="{ record }">
        <a-button type="link" @click="plantingInfo(record,false)" :loading="record.loading">种植信息</a-button>
        <a-button type="link" @click="plantingInfo(record,true)" :loading="record.loading">变更记录</a-button>
      </template>
    </TableLayout>
    <PlantingInfo ref="PlantingInfoRef" :type="state.type"/>
    <CreateDownloadTask ref="CreateDownloadTaskRef"/>
    <DownloadTask ref="DownloadTaskRef"/>
  </div>
</template>

<script lang="ts" setup>
import {reactive, provide, h, ref, watch, onMounted} from "vue";
import {BarsOutlined, VerticalAlignBottomOutlined} from "@ant-design/icons-vue";
import PlantingInfo from "@/views/FarmerPlantingManagement/components/PlantingInfo.vue";
import {
  changeHistory,
  getCultivarCollection,
  getPlantingData,
  platform,
  queryPlant
} from "@/views/FarmerPlantingManagement/api.ts";
import {message} from "ant-design-vue";
import CreateDownloadTask from "@/views/FarmerPlantingManagement/components/CreateDownloadTask.vue";
import DownloadTask from "@/views/FarmerPlantingManagement/components/DownloadTask.vue";
import MappingTables from "@/views/FarmerPlantingManagement/components/MappingTables.ts";

const DownloadTaskRef = ref(null)
const CreateDownloadTaskRef = ref(null)

interface stateType {
  type: boolean,
  formItems: object[],
  formData: object,
  tableData: {
    loading: boolean,
    labelCol: object,
    dataSource: object[],
    columns: object[],
    pagination: {
      current: number,
      pageSize: number,
      total: number,
      showSizeChanger: boolean,
    },
  }
}

const selectedRowKeys = ref<any>([])
const onSelectChange = (keys: string | number[]) => {
  selectedRowKeys.value = keys;
};
const state = reactive(<stateType>{
  type: false,
  formItems: [
    {
      label: '被保险人姓名/单位名称',
      prop: 'farmerName',
      itemType: 'a-input',
    },
    {
      label: '身份证号码/营业执照编号',
      prop: 'cardNo',
      itemType: 'a-input',
    },
    {
      label: '更新时间',
      prop: 'updateDate',
      itemType: 'a-range-picker',
    },
    {
      label: '平台',
      prop: 'platFormId',
      itemType: 'a-select',
      url: platform,
      fieldNames: {
        value: 'platformId',
        label: 'platformName',
      },
      options: [],
    },
    {
      label: '种植地点',
      prop: 'placePlanting',
      itemType: 'a-tree-select',
      url: getCultivarCollection,
      fieldNames: {
        value: 'areacode',
        label: 'areaname',
      },
      options: [],
      select: (value: any, node: any) => {
        // 清空所有区域代码
        state.formData.provenceCode = '';
        state.formData.cityCode = '';
        state.formData.districtCode = '';
        state.formData.townCode = '';
        state.formData.villageCode = '';

        // 只设置当前选中层级的代码
        const key = MappingTables.areaLevel[node.areaLevel];
        state.formData[key] = value;
      }
    },

    {
      label: '合计投保面积',
      prop: 'totalInsuredArea',
      itemType: 'input-range',
    },
    {
      label: '是否投保',
      prop: 'isPolicy',
      itemType: 'a-select',
      options: [
        {
          label: '是',
          value: '1',
        },
        {
          label: '否',
          value: '0',
        },
      ],
    },
  ],
  formData: {
    farmerName: '',
    cardNo: '',
    updateDate: [],
    platFormId: '',
    updateStartDate: '',
    updateEndDate: '',
    placePlanting: '',
    maxPlantArea: '',
    minPlantArea: '',
    isPolicy: '',
    confirmType: '1',
    totalInsuredArea: [],
    provenceCode: '', // 省
    cityCode: '', // 市
    districtCode: '', // 区县
    townCode: '', // 镇
    villageCode: '', // 乡
  },
  tableData: {
    loading: false,
    dataSource: [],
    labelCol: {span: 6},
    columns: [
      {title: '种植信息ID', dataIndex: 'farmerId', key: 'farmerId', align: 'center', fixed: 'left', resizable: true, width: 120},
      {title: '平台', dataIndex: 'platformName', key: 'platformName', align: 'center', fixed: 'left', resizable: true, width: 120},
      {title: '被保险人姓名/单位名称', dataIndex: 'farmerName', key: 'farmerName', align: 'center', resizable: true, width: 150, fixed: 'left'},
      { title: '证件类型', dataIndex: 'cardTypeCnm', key: 'cardTypeCnm', align: 'center', resizable: true, width: 120 },
      {title: '身份证号码/营业执照编号', dataIndex: 'cardNo', key: 'cardNo', align: 'center', resizable: true, width: 180, customRender: ({ text }) => {
          if (!text) return '';
          return text.replace(/(\w{3})\w*(\w{4})/, '$1*****$2');
        }},
      {title: '被保险人所在地址', dataIndex: 'farmerAddress', key: 'farmerAddress', align: 'center', resizable: true, width: 120},
      {title: '合计投保面积', dataIndex: 'sumArea', key: 'sumArea', align: 'center', resizable: true, width: 120},
      {title: '联系人(单位投保)', dataIndex: 'linkerName', key: 'linkerName', align: 'center', resizable: true, width: 120},
      {title: '手机号', dataIndex: 'linkerPhone', key: 'linkerPhone', align: 'center', resizable: true, width: 120, customRender: ({ text }) => {
          if (!text) return '';
          return text.replace(/(\d{3})\d*(\d{4})/, '$1****$2');
        }},
      {title: '邮箱地址', dataIndex: 'linkerEmail', key: 'linkerEmail', align: 'center', resizable: true, width: 120},
      {title: '银行卡号/账号', dataIndex: 'bankAccountNo', key: 'bankAccountNo', align: 'center', resizable: true, width: 120, customRender: ({ text }) => {
          if (!text) return '';
          return text.replace(/(\d{3})\d*(\d{4})/, '$1****$2');
        }},
      {title: '开户银行名称', dataIndex: 'bankName', key: 'bankName', align: 'center', resizable: true, width: 120},
      {title: '年度', dataIndex: 'yearly', key: 'yearly', align: 'center', resizable: true, width: 120},
      {title: '保单号', dataIndex: 'policyNo', key: 'policyNo', align: 'center', resizable: true, width: 120},
      {title: '创建时间', dataIndex: 'createDate', key: 'createDate', align: 'center', resizable: true, width: 120},
      {title: '更新时间', dataIndex: 'updateDate', key: 'updateDate', align: 'center', resizable: true, width: 120},
      {
        title: '查看',
        key: 'operator',
        align: 'center',
        resizable: true, 
        width: 220,
        fixed: 'right',
      },
    ],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`,
      position: ['bottomCenter ']
    },
    rowKey: 'farmerId',
    rowSelection: {
      selectedRowKeys: selectedRowKeys,
      onChange: onSelectChange
    }
  },
});
watch(
    () => state.formData.updateDate,
    (value) => {
      if (value && value.length) {
        state.formData.updateStartDate = value[0]
        state.formData.updateEndDate = value[1]
      } else {
        state.formData.updateStartDate = ''
        state.formData.updateEndDate = ''
      }
    }
)
watch(
    () => state.formData.placePlanting,
    (value) => {
      if (!value) {
        state.formData.provenceCode = ''
        state.formData.cityCode = ''
        state.formData.districtCode = ''
        state.formData.townCode = ''
        state.formData.villageCode = ''
      }
    }
)
provide('formData', state.formData)
provide('configs', state.formItems)
provide('tableData', state.tableData)
const PlantingInfoRef = ref(null)
const plantingInfo = (record: any, type: boolean) => {
  record.loading = true;
  
  if (type) {
    // 变更记录接口
    changeHistory(record.farmerId).then((res) => {
      state.type = type;
      PlantingInfoRef.value.initialize('变更记录', res.farmerDtos, res.changeRecords);
    }).finally(() => {
      record.loading = false;
    });
  } else {
    // 种植信息接口
    const params = {
      condition: {
        farmerId: record.farmerId,
        ...state.formData
      },
      pageNo: state.tableData.pagination.current,
      pageSize: state.tableData.pagination.pageSize,
    };
    getPlantingData(params).then((res) => {
      state.type = type;
      PlantingInfoRef.value.initialize('种植信息', res, []);
    }).finally(() => {
      record.loading = false;
    });
  }
};
const downloadRecord = () => {
  DownloadTaskRef.value.initialize('PLANT_S_CONFIRM')
}
const inputRangeChange = (value: number, key: string) => {
  state.formData[key] = value
}
provide('inputRangeChange', inputRangeChange)
const tableChange = (pagination: any) => {
  state.tableData.pagination = pagination
  onSearch(false)
}
const onSearch = (type: boolean) => {
  if (type) {
    state.tableData.pagination.current = 1
  }
  const param = {
    condition: {
      ...state.formData
    },
    pageNo: state.tableData.pagination.current,
    pageSize: state.tableData.pagination.pageSize,
  }
  state.tableData.loading = true
  queryPlant(param).then((res) => {
    res.records?.forEach((item: any) => {
      item.loading = false
    })
    state.tableData.dataSource = res.records || []
    state.tableData.pagination.total = res.total
  }).finally(() => {
    state.tableData.loading = false
  })
}
const downloadFn = () => {
  if (state.tableData.dataSource && state.tableData.dataSource.length) {
    const farmerName = state.tableData.dataSource[0].farmerName
    let total = state.tableData.pagination.total
    let params = {
      ...state.formData,
      taskName: `${farmerName}等${total}户`
    }
    if (selectedRowKeys.value.length) {
      total = selectedRowKeys.value.length
      params = {
        ...state.formData,
        confirmType: '1',
        taskName: `${farmerName}等${total}户`,
        farmerIds: selectedRowKeys.value
      }
    }
    CreateDownloadTaskRef.value.initialize(params)
  } else {
    message.error('请先查询后再下载数据')
  }
}
onMounted(() => {
  onSearch(true)
})
</script>

<style lang="scss" scoped>
.PlantingInfoConfirmed {
  height: 100%;
  width: 100%;
}
</style>
