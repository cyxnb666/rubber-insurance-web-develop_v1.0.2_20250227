<template>
  <a-modal width="800px" v-model:open="open" @cancel="cancel" title="下载任务" :maskClosable="false" centered :footer="null"
    :style="{ height: '80vh' }">
    <div class="download-task-container">
      <div class="fixed-header">
        <div class="refresh">
          <a-button type="primary" shape="circle" :icon="h(SyncOutlined)" @click="onSearch" />
        </div>
      </div>
      
      <div class="table-container">
        <TableLayout ref="tableLayoutRef" @tableChange="handleTableChange" @onSearch="onSearch">
          <template #otherButton>
          </template>
          <template #operator="{ record }">
            <a-button type="link" @click="downloadFn(record)" :loading="record.loading"
              :disabled="record.exportStatus === 'N'">
              下载
            </a-button>
          </template>
        </TableLayout>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { SyncOutlined } from '@ant-design/icons-vue';
import { h, ref, reactive, provide, onMounted, watch, nextTick } from 'vue';
import { downloadList, downloadZip } from "@/views/FarmerPlantingManagement/api.ts";
import TableLayout from '@/components/TableLayout/index.vue';

const tableLayoutRef = ref(null);

const columns = [
  {
    title: '任务名称',
    key: 'taskName',
    dataIndex: 'taskName',
    align: 'center'
  },
  {
    title: '创建时间',
    key: 'createTime',
    dataIndex: 'createTime',
    align: 'center'
  },
  {
    title: '创建人',
    key: 'createName',
    dataIndex: 'createName',
    align: 'center'
  },
  {
    title: '下载状态',
    key: 'downloadStatus',
    dataIndex: 'downloadStatus',
    align: 'center',
    customRender: ({ record }) => ({
      'N': '待打包',
      'S': '打包完成',
    }[record.exportStatus] || '')
  },
  {
    title: '操作',
    key: 'operator',
    dataIndex: 'operate',
    align: 'center'
  },
];

const open = ref(false);

const tableData = reactive({
  loading: false,
  dataSource: [],
  columns: columns,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
    position: ['bottomCenter']
  },
  showOperator: true,
  operatorWidth: 120
});

provide('tableData', tableData);
provide('configs', []);
provide('formData', {});

const state = ref({
  exportType: ''
});

watch(open, async (newValue) => {
  if (newValue) {
    await nextTick();
    setTimeout(() => {
      if (tableLayoutRef.value) {
        tableLayoutRef.value.updateTableHeight();
      }
    }, 100);
    
    setTimeout(() => {
      if (tableLayoutRef.value) {
        tableLayoutRef.value.updateTableHeight();
      }
    }, 500);
  }
});

const handleTableChange = (pagination) => {
  tableData.pagination.current = pagination.current;
  tableData.pagination.pageSize = pagination.pageSize;
  onSearch(false);
};

const onSearch = (resetPage = true) => {
  if (resetPage) {
    tableData.pagination.current = 1;
  }
  
  tableData.loading = true;
  const params = {
    condition: {
      exportType: state.value.exportType
    },
    pageNo: tableData.pagination.current,
    pageSize: tableData.pagination.pageSize
  };

  downloadList(params).then((res) => {
    tableData.dataSource = res.records?.map(item => ({ ...item, loading: false })) || [];
    tableData.pagination.total = res.total;
    
    nextTick(() => {
      if (tableLayoutRef.value) {
        tableLayoutRef.value.updateTableHeight();
      }
    });
  }).finally(() => {
    tableData.loading = false;
  });
};

const downloadFn = (row) => {
  row.loading = true;
  downloadZip(row.exportId, row.name).finally(() => {
    row.loading = false;
  });
};

const initialize = (type) => {
  state.value.exportType = type;
  open.value = true;
  onSearch(true);
};

const cancel = () => {
  tableData.dataSource = [];
  tableData.pagination.current = 1;
};

defineExpose({ initialize });
</script>

<style scoped lang="scss">
.download-task-container {
  height: calc(80vh - 110px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fixed-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fff;
  padding-bottom: 10px;
}

.refresh {
  width: 100%;
  text-align: right;
}

.table-container {
  flex: 1;
  height: calc(100% - 40px);
  overflow: hidden;
}

:deep(.table_layout_container) {
  height: 100%;
  overflow: hidden;
}

:deep(.table_form) {
  display: none;
}

:deep(.table_body_wrap) {
  height: 100% !important;
  overflow: hidden;
}

:deep(.table-content) {
  height: 100%;
  overflow: hidden;
}

:deep(.ant-table-wrapper) {
  height: 100%;
}

:deep(.ant-spin-nested-loading) {
  height: 100%;
}

:deep(.ant-spin-container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.ant-table) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.ant-table-container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.ant-table-body) {
  flex: 1;
  overflow-y: auto !important;
  min-height: calc(80vh - 220px) !important;
}

:deep(.ant-table-thead) {
  position: sticky !important;
  top: 0 !important;
  z-index: 2 !important;
}

:deep(.ant-table-header) {
  overflow-y: hidden !important;
}

:deep(.ant-pagination) {
  margin: 16px 0 !important;
}

:deep(.ant-table-content) {
  overflow: auto !important;
}
</style>