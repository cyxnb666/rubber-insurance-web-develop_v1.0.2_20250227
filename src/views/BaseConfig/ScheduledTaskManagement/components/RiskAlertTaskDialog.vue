<template>
  <a-modal v-model:open="dialogVisible" title="风险预警任务" @cancel="handleClose" width="1000px" :footer="null">
    <div class="risk-alert-task">
      <TableLayout ref="tableLayoutRef1" v-if="dialogVisible" @tableChange="tableChange" @onSearch="onSearch">
        <template #otherButton>
        </template>
      </TableLayout>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, provide, nextTick } from 'vue'
import { pageRiskWarningTask } from '../api'

const dialogVisible = ref(false)
const tableLayoutRef1 = ref(null)

const state = reactive({
  formItems: [
    {
      label: '时间',
      prop: 'timeRange',
      itemType: 'a-range-picker',
      isMonthPicker: true,
      placeholder: ['开始月份', '结束月份']
    }
  ],
  formData: {
    timeRange: []
  },
  tableData: {
    loading: false,
    dataSource: [],
    columns: [
      {
        title: '年-月',
        dataIndex: 'yearMonth',
        key: 'yearMonth',
        align: 'center',
        width: 100,
        resizable: true
      },
      {
        title: '种植地点',
        dataIndex: 'plantAddress',
        key: 'plantAddress',
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
        title: '预警分户数',
        dataIndex: 'warningFarmerCount',
        key: 'warningFarmerCount',
        align: 'center',
        width: 100,
        resizable: true
      },
      {
        title: '预警测算时间',
        dataIndex: 'warningDate',
        key: 'warningDate',
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

const tableChange = (pagination) => {
  state.tableData.pagination = pagination
  loadTableData()
}

const onSearch = (isReset) => {
  if (isReset) {
    state.tableData.pagination.current = 1
  }
  loadTableData()
}

const loadTableData = async () => {
  state.tableData.loading = true
  try {
    const params = {
      condition: {
        yearMonthStart: state.formData.timeRange?.[0] || '',
        yearMonthEnd: state.formData.timeRange?.[1] || ''
      },
      pageNo: state.tableData.pagination.current,
      pageSize: state.tableData.pagination.pageSize
    }

    const res = await pageRiskWarningTask(params)
    state.tableData.dataSource = res.records || []
    state.tableData.pagination.total = res.total || 0
  } catch (error) {
    console.error('获取预警任务列表失败:', error)
  } finally {
    state.tableData.loading = false
  }
}

const handleClose = () => {
  dialogVisible.value = false
}

const open = async () => {
  dialogVisible.value = true
  // 等待DOM更新
  await nextTick()
  // 延迟执行以确保Modal动画完成
  setTimeout(() => {
    if (tableLayoutRef1.value && typeof tableLayoutRef1.value.updateTableHeight === 'function') {
      tableLayoutRef1.value.updateTableHeight()
    }
  }, 300)
  onSearch(true)
}

defineExpose({
  open
})
</script>

<style lang="scss" scoped>
.risk-alert-task {
  height: calc(80vh - 120px);
  width: 100%;
}
</style>