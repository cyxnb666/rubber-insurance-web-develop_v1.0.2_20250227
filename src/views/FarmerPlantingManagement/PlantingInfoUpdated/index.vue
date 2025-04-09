<template>
  <div class="PlantingInfoUpdated">
    <TableLayout @tableChange="tableChange" @onSearch="onSearch" :defaultValues="{ confirmType: '2' }">
      <template #otherButton>
        <a-button type="primary" @click="infoConfirmation" style="margin-left: 10px;" :icon="h(CheckSquareOutlined)">
          变更确认
        </a-button>
        <a-button type="primary" @click="downloadFn" style="margin-left: 10px;" :icon="h(VerticalAlignBottomOutlined)">
          下载
        </a-button>
        <a-button type="primary" @click="downloadRecord" style="margin-left: 10px;" :icon="h(BarsOutlined)">
          下载记录
        </a-button>
      </template>
      <template #operator="{ record }">
        <a-button type="link" @click="plantingInfo(record)" :loading="record.loading">变更记录</a-button>
      </template>
    </TableLayout>
    <PlantingInfo ref="PlantingInfoRef" :type="true" />
    <CreateDownloadTask ref="CreateDownloadTaskRef" />
    <DownloadTask ref="DownloadTaskRef" />
  </div>
</template>

<script lang="ts" setup>
import { reactive, provide, h, ref, createVNode, onMounted } from "vue";
import {
  BarsOutlined,
  CheckSquareOutlined,
  ExclamationCircleOutlined,
  VerticalAlignBottomOutlined
} from "@ant-design/icons-vue";
import PlantingInfo from "@/views/FarmerPlantingManagement/components/PlantingInfo.vue";
import { message, Modal } from "ant-design-vue";
import { changeHistory, plantConfirm, queryPlant } from "@/views/FarmerPlantingManagement/api.ts";
import CreateDownloadTask from "@/views/FarmerPlantingManagement/components/CreateDownloadTask.vue";
import DownloadTask from "@/views/FarmerPlantingManagement/components/DownloadTask.vue";

interface stateType {
  selectedRowKeys: any[],
  formItems: object[],
  formData: object,
  tableData: {
    loading: boolean,
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

const DownloadTaskRef = ref(null)
const CreateDownloadTaskRef = ref(null)

const onSelectChange = (selectedRowKeys: string | number[]) => {
  state.selectedRowKeys = selectedRowKeys;
};
const state = reactive(<stateType>{
  selectedRowKeys: [],
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
  ],
  formData: {
    confirmType: '2',
    farmerName: '',
    cardNo: '',
  },
  tableData: {
    loading: false,
    dataSource: [],
    columns: [
      { title: '种植信息ID', dataIndex: 'farmerId', key: 'farmerId', align: 'center', fixed: 'left', resizable: true, width: 120 },
      { title: '平台', dataIndex: 'platformName', key: 'platformName', align: 'center', fixed: 'left', resizable: true, width: 120 },
      { title: '被保险人姓名/单位名称', dataIndex: 'farmerName', key: 'farmerName', align: 'center', resizable: true, width: 180, fixed: 'left'},
      { title: '证件类型', dataIndex: 'cardTypeCnm', key: 'cardTypeCnm', align: 'center', resizable: true, width: 120 },
      {
        title: '身份证号码/营业执照编号', dataIndex: 'cardNo', key: 'cardNo', align: 'center', resizable: true, width: 180, customRender: ({ text }) => {
          if (!text) return '';
          return text.replace(/(\w{3})\w*(\w{4})/, '$1*****$2');
        }
      },
      { title: '被保险人所在地址', dataIndex: 'farmerAddress', key: 'farmerAddress', align: 'center', resizable: true, width: 120 },
      { title: '联系人(单位投保)', dataIndex: 'linkerName', key: 'linkerName', align: 'center', resizable: true, width: 120 },
      {
        title: '手机号', dataIndex: 'linkerPhone', key: 'linkerPhone', align: 'center', resizable: true, width: 120, customRender: ({ text }) => {
          if (!text) return '';
          return text.replace(/(\d{3})\d*(\d{4})/, '$1****$2');
        }
      },
      { title: '邮箱地址', dataIndex: 'linkerEmail', key: 'linkerEmail', align: 'center', resizable: true, width: 120 },
      {
        title: '银行卡号/账号', dataIndex: 'bankAccountNo', key: 'bankAccountNo', align: 'center', resizable: true, width: 120, customRender: ({ text }) => {
          if (!text) return '';
          return text.replace(/(\d{3})\d*(\d{4})/, '$1****$2');
        }
      },
      { title: '开户银行名称', dataIndex: 'bankName', key: 'bankName', align: 'center', resizable: true, width: 120 },
      { title: '年度', dataIndex: 'yearly', key: 'yearly', align: 'center', resizable: true, width: 120 },
      { title: '保单号', dataIndex: 'policyNo', key: 'policyNo', align: 'center', resizable: true, width: 120 },
      { title: '更新时间', dataIndex: 'updateDate', key: 'updateDate', align: 'center', resizable: true, width: 120 },
      {
        title: '查看',
        key: 'operator',
        align: 'center',
        fixed: 'right',
        resizable: true, width: 120
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
    rowSelection: {
      onChange: onSelectChange
    },
    rowKey: 'farmerId'
  },
});
provide('formData', state.formData)
provide('configs', state.formItems)
provide('tableData', state.tableData)
provide('span', 8)
const PlantingInfoRef = ref(null)
const downloadRecord = () => {
  DownloadTaskRef.value.initialize('CHANGE_N_CONFIRM')
}
const plantingInfo = (record: any) => {
  record.loading = true
  changeHistory(record.farmerId).then((res) => {
    PlantingInfoRef.value.initialize('变更记录', res.farmerDtos, res.changeRecords)
  }).finally(() => {
    record.loading = false
  })
}
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
    if (state.selectedRowKeys.length) {
      total = state.selectedRowKeys.length
      params = {
        ...state.formData,
        confirmType: '2',
        taskName: `${farmerName}等${total}户`,
        farmerIds: state.selectedRowKeys
      }
    }
    CreateDownloadTaskRef.value.initialize(params)
  } else {
    message.error('请先查询后再下载数据')
  }
}
const infoConfirmation = () => {
  let msg = '将根据查询条件结果批量确认,'
  if (state.selectedRowKeys.length) {
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
      if (state.selectedRowKeys.length) {
        param = {
          confirmType: '2',
          farmerIds: state.selectedRowKeys
        }
      }
      return plantConfirm(param).then(() => {
        message.success('信息确认成功')
        if (state.selectedRowKeys.length) {
          state.selectedRowKeys = []
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
.PlantingInfoUpdated {
  height: 100%;
  width: 100%;
}
</style>
