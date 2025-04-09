<template>
  <a-modal v-model:open="dialogVisible" title="预警测算任务" @cancel="handleClose" width="1000px" :footer="null">
    <div class="risk-calculation-task">
      <TableLayout @tableChange="tableChange" v-if="dialogVisible" @onSearch="onSearch">
        <template #otherButton>
        </template>
      </TableLayout>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, provide, onMounted, nextTick } from 'vue'
import { selectClaimMeasures, selectStaticisPreClaims } from '../api'
import dayjs from 'dayjs'

const dialogVisible = ref(false)
const state = reactive({
  formItems: [
    {
      label: '年度',
      prop: 'year',
      itemType: 'a-date-picker',
      picker: 'year',
      disabledDate: (current: any) => {
        return current && current.year() < 2025;
      },
      valueFormat: 'YYYY'
    },
    {
      label: '周期',
      prop: 'settlementPeriod',
      itemType: 'a-select',
      options: [],
      fieldNames: {
        label: 'taskName',
        value: 'taskId'
      }
    }
  ],
  formData: {
    year: '',
    settlementPeriod: ''
  },
  tableData: {
    loading: false,
    dataSource: [],
    columns: [
      {
        title: '年度',
        dataIndex: 'yearly',
        key: 'yearly',
        align: 'center',
        width: 100,
        resizable: true
      },
      {
        title: '周期',
        dataIndex: 'taskName',
        key: 'taskName',
        align: 'center',
        width: 100,
        resizable: true
      },
      {
        title: '测算区域',
        dataIndex: 'calcAddress',
        key: 'calcAddress',
        align: 'center',
        width: 200,
        resizable: true
      },
      {
        title: '分户数',
        dataIndex: 'farmerCount',
        key: 'farmerCount',
        align: 'center',
        width: 100,
        resizable: true
      },
      {
        title: '理赔测算时间',
        dataIndex: 'calcTime',
        key: 'calcTime',
        align: 'center',
        width: 180,
        resizable: true
      }
    ],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`,
      position: ['bottomCenter']
    }
  }
})

provide('formData', state.formData)
provide('configs', state.formItems)
provide('tableData', state.tableData)

const loadSettlementPeriods = async () => {
  try {
    const res = await selectClaimMeasures()
    const settlementFormItem = state.formItems.find(item => item.prop === 'settlementPeriod')
    if (settlementFormItem) {
      settlementFormItem.options = [
        { taskId: '', taskName: '全部' },
        ...res
      ];
    }
  } catch (error) {
    console.error('获取结算周期数据失败:', error)
  }
}

// 分页变化
const tableChange = (pagination) => {
  state.tableData.pagination.current = pagination.current
  state.tableData.pagination.pageSize = pagination.pageSize
  loadTableData()
}

// 查询
const onSearch = (isReset) => {
  if (isReset) {
    state.tableData.pagination.current = 1
  }
  loadTableData()
}

// 加载表格数据
const loadTableData = async () => {
  state.tableData.loading = true
  try {
    const params = {
      condition: {
        taskId: state.formData.settlementPeriod || '',
        yearly: state.formData.year ? Number(dayjs(state.formData.year).format('YYYY')) : null
      },
      pageNo: state.tableData.pagination.current,
      pageSize: state.tableData.pagination.pageSize
    }

    const res = await selectStaticisPreClaims(params)
    if (res) {
      state.tableData.dataSource = res.records
      state.tableData.pagination.total = res.total
      state.tableData.pagination.current = res.current
      state.tableData.pagination.pageSize = res.size
    }
  } catch (error) {
    console.error('获取测算任务数据失败:', error)
  } finally {
    state.tableData.loading = false
  }
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
}

// 打开弹窗
const open = async () => {
  dialogVisible.value = true
  onSearch(true)
}

defineExpose({
  open
})

onMounted(() => {
  loadSettlementPeriods()
})
</script>

<style lang="scss" scoped>
.risk-calculation-task {
  height: calc(80vh - 100px);
  width: 100%;
}
</style>