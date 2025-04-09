<template>
  <a-modal width="1200px" v-model:open="open" @cancel="handleCancel" title="预警详细信息" :maskClosable="false" centered
    :footer="null" :style="{ height: '80vh' }">
    <div class="modal-content-wrapper">
      <!-- 查询区域 -->
      <div class="query-section">
        <a-form layout="inline">
          <a-form-item label="预警类型：">
            <a-select v-model:value="state.formData.warningType" style="width: 200px;" @change="onSearch(true)">
              <a-select-option v-for="item in state.formItems[0].options" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="onSearch(true)">查询</a-button>
            <a-button style="margin-left: 8px"
              @click="() => { state.formData.warningType = ''; onSearch(true); }">重置</a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 表格区域 -->
      <div class="table-section">
        <a-table :dataSource="state.tableData.dataSource" :columns="state.tableData.columns"
          :loading="state.tableData.loading" :pagination="state.tableData.pagination" @change="tableChange"
          size="middle" :scroll="{ x: 1100, y: 'calc(100% - 80px)' }" />
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { pageWarningFarmer, getDictList } from '../api';

const open = ref(false);
const recordData = ref(null);

const state = reactive({
  formItems: [
    {
      label: '预警类型',
      prop: 'warningType',
      itemType: 'a-select',
      options: [
        { label: '全部', value: '' }
      ],
    }
  ],
  formData: {
    warningType: ''
  },
  tableData: {
    loading: false,
    dataSource: [],
    columns: [
      {
        title: '保单号',
        dataIndex: 'policyNo',
        key: 'policyNo',
        align: 'center',
        width: 120,
      },
      {
        title: '保单类型',
        dataIndex: 'policytype',
        key: 'policytype',
        align: 'center',
        width: 120,
        customRender: ({ text }) => {
          if (text === '1') return '个体';
          if (text === '2') return '集体';
          return text || '';
        }
      },
      {
        title: '被保险人姓名/单位名称',
        dataIndex: 'insuredname',
        key: 'insuredname',
        align: 'center',
        width: 180,
      },
      {
        title: '身份证号码/营业执照编号',
        dataIndex: 'identifynumber',
        key: 'identifynumber',
        align: 'center',
        width: 180,
      },
      {
        title: '预警类型',
        dataIndex: 'warningType',
        key: 'warningType',
        align: 'center',
        width: 120,
        customRender: ({ text }) => {
          if (text === '1') return '指标1';
          if (text === '2') return '指标2';
          if (text === '3') return '指标3';
          return text || '';
        }
      },
      {
        title: '投保面积',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'center',
        width: 120
      },
      {
        title: '交易总产量(kg)',
        dataIndex: 'tradeCount',
        key: 'tradeCount',
        align: 'center',
        width: 120,
      },
      {
        title: '胶农月平均产量(kg/亩)',
        dataIndex: 'monthAverCount',
        key: 'monthAverCount',
        align: 'center',
        width: 180,
      },
      {
        title: '目标产量(kg/亩)',
        dataIndex: 'targetCount',
        key: 'targetCount',
        align: 'center',
        width: 120,
      },
      {
        title: '乡镇月平均产量(kg/亩)',
        dataIndex: 'townAverCount',
        key: 'townAverCount',
        align: 'center',
        width: 180,
      },
      {
        title: '种植地点',
        dataIndex: 'plantAddress',
        key: 'plantAddress',
        align: 'center',
        width: 120,
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
});

const loadData = async () => {
  if (!recordData.value?.warningId) return;

  state.tableData.loading = true;
  try {
    const params = {
      condition: state.formData.warningType || '',
      pageNo: state.tableData.pagination.current,
      pageSize: state.tableData.pagination.pageSize
    };

    const res = await pageWarningFarmer(recordData.value.warningId, params);
    if (res) {
      state.tableData.dataSource = res.records || [];
      state.tableData.pagination.total = res.total;
    }
  } catch (error) {
    console.error('获取详细数据失败:', error);
  } finally {
    state.tableData.loading = false;
  }
};
const loadWarningTypeDict = async () => {
  try {
    const res = await getDictList({
      dictType: "WARNING_TYPE"
    });

    state.formItems[0].options = [
      { label: '全部', value: '' },
      ...res.map((item) => ({
        label: item.dictValue,
        value: item.dictCode
      }))
    ];
  } catch (error) {
    console.error('获取预警类型字典数据失败:', error);
  }
};

const tableChange = (pagination) => {
  state.tableData.pagination.current = pagination.current;
  state.tableData.pagination.pageSize = pagination.pageSize;
  loadData();
};

const onSearch = async (resetPage) => {
  if (resetPage) {
    state.tableData.pagination.current = 1;
  }
  await loadData();
};

const handleCancel = () => {
  open.value = false;
};


const initialize = (record) => {
  recordData.value = record;
  state.formData.warningType = '';
  state.tableData.pagination.current = 1;
  open.value = true;

  // 加载字典和数据
  loadWarningTypeDict();
  loadData();
};

defineExpose({ initialize });
</script>


<style lang="scss" scoped>
.modal-content-wrapper {
  height: calc(80vh - 110px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.query-section {
  padding: 0 0 10px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.table-section {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: calc(100% - 50px);
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
}

:deep(.ant-table-container) {
  height: 100%;
}

:deep(.ant-table-header) {
  overflow: hidden !important;
  margin-bottom: 0 !important;
}

:deep(.ant-table-body) {
  overflow-y: auto !important;
  overflow-x: auto !important;
  max-height: calc(100% - 80px) !important;
}

:deep(.ant-table-pagination.ant-pagination) {
  margin: 0px !important;
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
}

:deep(.ant-modal-body) {
  padding: 24px 24px 16px 24px;
  height: 80vh;
  overflow-y: hidden;
}

:deep(.ant-table-thead > tr > th),
:deep(.ant-table-tbody > tr > td) {
  padding: 12px 8px;
}

:deep(.ant-pagination) {
  position: relative;
  bottom: 0;
  margin-top: 10px !important;
}
</style>