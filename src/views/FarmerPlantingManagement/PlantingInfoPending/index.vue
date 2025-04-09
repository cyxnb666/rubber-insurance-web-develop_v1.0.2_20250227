<template>
  <div class="PlantingInfoPending">
    <TableLayout @tableChange="tableChange" @onSearch="onSearch" :loading="state.tableData.loading"
      :defaultValues="{ confirmType: '0' }">
      <template #otherButton>
        <a-button type="primary" @click="infoConfirmation" style="margin-left: 10px;" :icon="h(CheckSquareOutlined)">
          信息确认
        </a-button>
        <a-button type="primary" @click="downloadFn" style="margin-left: 10px;" :icon="h(VerticalAlignBottomOutlined)">
          下载
        </a-button>
        <a-button type="primary" @click="downloadRecord" style="margin-left: 10px;" :icon="h(BarsOutlined)">
          下载记录
        </a-button>
      </template>
      <template #operator="{ record }">
        <a-button type="link" @click="plantingInfo(record)" :loading="record.loading">种植信息</a-button>
      </template>
    </TableLayout>
    <PlantingInfo ref="PlantingInfoRef" :type="false" />
    <CreateDownloadTask ref="CreateDownloadTaskRef" />
    <DownloadTask ref="DownloadTaskRef" />
  </div>
</template>

<script lang="ts" setup>
import { reactive, provide, h, createVNode, ref, watch, onMounted } from "vue";
import {
  CheckSquareOutlined,
  ExclamationCircleOutlined,
  VerticalAlignBottomOutlined,
  BarsOutlined
} from "@ant-design/icons-vue";
import { message, Modal } from 'ant-design-vue';
import PlantingInfo from '../components/PlantingInfo.vue'
import {
  getCultivarCollection,
  getPlantingData,
  plantConfirm,
  platform,
  queryPlant
} from "@/views/FarmerPlantingManagement/api.ts";
import CreateDownloadTask from "@/views/FarmerPlantingManagement/components/CreateDownloadTask.vue";
import DownloadTask from "@/views/FarmerPlantingManagement/components/DownloadTask.vue";
import MappingTables from "@/views/FarmerPlantingManagement/components/MappingTables.ts";

const PlantingInfoRef = ref(null)
const DownloadTaskRef = ref(null)

interface stateType {
  formItems: object[],
  formData: object,
  tableData: {
    loading: boolean,
    dataSource: object[],
    labelCol: object,
    columns: object[],
    pagination: {
      current: number,
      pageSize: number,
      total: number,
      showSizeChanger: boolean,
    },
    rowSelection: object,
  }
}

const selectedRowKeys = ref<any>([])
const CreateDownloadTaskRef = ref<any>(null)
const onSelectChange = (keys: string | number[]) => {
  selectedRowKeys.value = keys;
};
const state = reactive(<stateType>{
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
    confirmType: '0',
    totalInsuredArea: [],
    provenceCode: '', // 省
    cityCode: '', // 市
    districtCode: '', // 区县
    townCode: '', // 镇
    villageCode: '', // 乡
  },
  tableData: {
    loading: false,
    labelCol: { span: 6 },
    dataSource: [],
    columns: [
      { title: '种植信息ID', dataIndex: 'farmerId', key: 'farmerId', align: 'center', fixed: 'left', resizable: true, width: 120 },
      { title: '平台', dataIndex: 'platformName', key: 'platformName', align: 'center', fixed: 'left', resizable: true, width: 120 },
      { title: '被保险人姓名/单位名称', dataIndex: 'farmerName', key: 'farmerName', align: 'center', fixed: 'left', width: 170, resizable: true},
      { title: '证件类型', dataIndex: 'cardTypeCnm', key: 'cardTypeCnm', align: 'center', resizable: true, width: 120 },
      {
        title: '身份证号码/营业执照编号', dataIndex: 'cardNo', key: 'cardNo', align: 'center', width: 170, resizable: true, customRender: ({ text }) => {
          if (!text) return '';
          return text.replace(/(\w{3})\w*(\w{4})/, '$1*****$2');
        }
      },
      { title: '被保险人所在地址', dataIndex: 'farmerAddress', key: 'farmerAddress', align: 'center', width: 140, resizable: true, },
      { title: '合计投保面积', dataIndex: 'sumArea', key: 'sumArea', align: 'center', width: 100, resizable: true, },
      { title: '联系人(单位投保)', dataIndex: 'linkerName', key: 'linkerName', align: 'center', width: 120, resizable: true, },
      {
        title: '手机号', dataIndex: 'linkerPhone', key: 'linkerPhone', align: 'center', width: 120, resizable: true, customRender: ({ text }) => {
          if (!text) return '';
          return text.replace(/(\d{3})\d*(\d{4})/, '$1****$2');
        }
      },
      { title: '邮箱地址', dataIndex: 'linkerEmail', key: 'linkerEmail', align: 'center', width: 120, resizable: true, },
      {
        title: '银行卡号/账号', dataIndex: 'bankAccountNo', key: 'bankAccountNo', align: 'center', width: 120, resizable: true, customRender: ({ text }) => {
          if (!text) return '';
          return text.replace(/(\d{3})\d*(\d{4})/, '$1****$2');
        }
      },
      { title: '开户银行名称', dataIndex: 'bankName', key: 'bankName', align: 'center', width: 110, resizable: true, },
      { title: '年度', dataIndex: 'yearly', key: 'yearly', align: 'center', width: 120, resizable: true, },
      { title: '创建时间', dataIndex: 'createDate', key: 'createDate', align: 'center', width: 120, resizable: true, },
      { title: '更新时间', dataIndex: 'updateDate', key: 'updateDate', align: 'center', width: 120, resizable: true, },
      {
        title: '查看',
        key: 'operator',
        align: 'center',
        fixed: 'right',
        width: 120,
        resizable: true,
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
const downloadRecord = () => {
  DownloadTaskRef.value.initialize('PLANT_N_CONFIRM')
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
        confirmType: '0',
        taskName: `${farmerName}等${total}户`,
        farmerIds: selectedRowKeys.value
      }
    }
    CreateDownloadTaskRef.value.initialize(params)
  } else {
    message.error('请先查询后再下载数据')
  }
}
const plantingInfo = (record: any) => {
  record.loading = true
  const params = {
    condition: {
      farmerId: record.farmerId,
      ...state.formData
    },
    pageNo: state.tableData.pagination.current,
    pageSize: state.tableData.pagination.pageSize,
  };
  getPlantingData(params).then((res) => {
    PlantingInfoRef.value.initialize('种植信息', res)
  }).finally(() => {
    record.loading = false
  })
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
const infoConfirmation = () => {
  let msg = '将根据查询条件结果批量确认,'
  if (selectedRowKeys.value.length) {
    msg = '将根据选中数据确认,'
  }
  Modal.confirm({
    title: '信息确认',
    icon: createVNode(ExclamationCircleOutlined),
    content: `${msg}信息确认后数据将流转至已确认,建议先将数据下载留存记录后再完成信息确认?`,
    centered: true,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      let param = {
        ...state.formData
      }
      if (selectedRowKeys.value.length) {
        param = {
          confirmType: '0',
          farmerIds: selectedRowKeys.value
        }
      }
      return plantConfirm(param).then(() => {
        message.success('信息确认成功')
        if (selectedRowKeys.value.length) {
          selectedRowKeys.value = []
        }
        onSearch(true)
      })
    },
    onCancel() {
      console.log('Cancel');
    },
  });
}
onMounted(() => {
  onSearch(true)
})
</script>

<style lang="scss" scoped>
.PlantingInfoPending {
  height: 100%;
  width: 100%;
}
</style>
