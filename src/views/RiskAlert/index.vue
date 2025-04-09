<template>
  <div class="AnotherPolicyQuery">
    <TableLayout @tableChange="tableChange" @onSearch="onSearch" :loading="state.tableData.loading">
      <template #otherButton>
        <div style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
          <a-button type="primary" @click="onExport" style="margin-left: 10px;" :icon="h(VerticalAlignBottomOutlined)">
            导出
          </a-button>
        </div>
      </template>
      <template #operator="{ record }">
        <a-button type="link" @click="detailInfo(record)">详细信息</a-button>
        <a-button type="link" @click="deleteUserFn(record)">删除</a-button>
      </template>
    </TableLayout>
    <div class="warningPlaceholder">
      <a-popover placement="left" overlayClassName="warning-popover">
        <template #content>
          <div class="warning-content">
            <p>预警：</p>
            <p>1、保单每亩实际交胶量kg/亩（当月实际交胶量/投保面积）＞月目标产量（kg/亩）20%以上</p>
            <p>2、保单每亩实际交胶量kg/亩（当月实际交胶量/投保面积）＜乡镇月实际平均交胶量（kg/亩）10%以上、且小于月最低产量</p>
            <p>3、保单每亩实际交胶量kg/亩（当月实际交胶量/投保面积）＜小于月最低产量</p>
          </div>
        </template>
        <a-button type="link" :icon="h(QuestionCircleOutlined)" style="color: #46B180;"></a-button>
      </a-popover>
    </div>
  </div>
  <RiskDetailDialog ref="riskDetailRef" />
</template>

<script lang="ts" setup>
import { ref, reactive, provide, onMounted, h } from "vue";
import {
  VerticalAlignBottomOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons-vue";
import { message, Modal } from 'ant-design-vue';
import RiskDetailDialog from './components/RiskDetailDialog.vue';
import { getAreaTree, pageRiskWarning, deleteRiskWarning, exportRiskWarning } from './api'

const riskDetailRef = ref(null);
const detailDialogVisible = ref(false);
const currentRecord = ref<any>(null);

interface StateType {
  formItems: any[],
  formData: {
    date: string,
    plantingArea: string,
  },
  tableData: {
    loading: boolean,
    dataSource: any[],
    columns: any[],
    pagination: {
      current: number,
      pageSize: number,
      total: number,
      showSizeChanger: boolean,
      showTotal: (total: number) => string,
      position: string[]
    }
  }
}

const state = reactive<StateType>({
  formItems: [
    {
      label: '时间',
      prop: 'date',
      itemType: 'a-date-picker',
      picker: 'month',
      valueFormat: 'YYYY-MM',
      format: 'YYYY-MM',
      placeholder: '请选择月份'
    },
    {
      label: '种植区域',
      prop: 'plantingArea',
      itemType: 'a-tree-select',
      url: getAreaTree,
      fieldNames: {
        label: 'areaname',
        value: 'areacode',
        children: 'children'
      },
      treeNodeFilterProp: 'areaname',
      showSearch: true,
      allowClear: true,
      treeDefaultExpandAll: true,
      options: []
    },
  ],
  formData: {
    date: '',
    plantingArea: '',
  },

  tableData: {
    loading: false,
    dataSource: [],
    columns: [
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        align: 'center',
        resizable: true,
        width: 220,
        fixed: 'left'
      },
      {
        title: '年-月',
        dataIndex: 'yearMonth',
        key: 'yearMonth',
        align: 'center',
        resizable: true,
        width: 120
      },
      {
        title: '种植区域(保单维度)',
        dataIndex: 'plantAddress',
        key: 'plantAddress',
        align: 'center',
        resizable: true,
        width: 180
      },
      {
        title: '交易总产量',
        dataIndex: 'tradeCount',
        key: 'tradeCount',
        align: 'center',
        resizable: true,
        width: 100
      },
      {
        title: '目标产量(kg/亩)',
        dataIndex: 'targetCount',
        key: 'targetCount',
        align: 'center',
        resizable: true,
        width: 120
      },
      {
        title: '乡镇月平均产量(kg/亩)',
        dataIndex: 'townAverCount',
        key: 'townAverCount',
        align: 'center',
        resizable: true,
        width: 180
      },
      {
        title: '预警分户数',
        dataIndex: 'farmerCount',
        key: 'farmerCount',
        align: 'center',
        resizable: true,
        width: 100
      },
      {
        title: '预警时间',
        dataIndex: 'warningDate',
        key: 'warningDate',
        align: 'center',
        resizable: true,
        width: 180
      },
      {
        title: '操作',
        key: 'operator',
        align: 'center',
        width: 150,
        fixed: 'right',
      }
    ],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showTotal: (total: number) => `共 ${total} 条`,
      position: ['bottomCenter']
    }
  }
});

provide('formData', state.formData);
provide('configs', state.formItems);
provide('tableData', state.tableData);

const loadAreaTree = async () => {
  try {
    const res = await getAreaTree();
    const areaFormItem = state.formItems.find(item => item.prop === 'plantingArea');
    if (areaFormItem) {
      areaFormItem.options = res;
    }
  } catch (error) {
    console.error('获取区域树失败:', error);
  }
};

const loadData = async () => {
  state.tableData.loading = true;
  try {
    const params = {
      condition: {
        areaCode: state.formData.plantingArea || '',
        yearMonth: state.formData.date ? state.formData.date.substring(0, 7) : ''  // 只取 YYYY-MM
      },
      pageNo: state.tableData.pagination.current,
      pageSize: state.tableData.pagination.pageSize
    };

    const res = await pageRiskWarning(params);
    if (res) {
      state.tableData.dataSource = res.records || [];
      state.tableData.pagination.total = res.total;
    }
  } catch (error) {
    console.error('获取列表数据失败:', error);
  } finally {
    state.tableData.loading = false;
  }
};

onMounted(() => {
  loadAreaTree();
  loadData();
});

const tableChange = (pagination: any) => {
  state.tableData.pagination.current = pagination.current;
  state.tableData.pagination.pageSize = pagination.pageSize;
  loadData();
};

const onSearch = async (resetPage: boolean) => {
  if (resetPage) {
    state.tableData.pagination.current = 1;
  }
  await loadData();
};

const onExport = async () => {
  try {
    const params = {
      yearMonth: state.formData.date || '',
      areaCode: state.formData.plantingArea || ''
    };
    await exportRiskWarning(params);
  } catch (error) {
    console.error('导出失败:', error);
    message.error('导出失败');
  }
};

const { confirm } = Modal;
const deleteUserFn = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该条预警信息吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      return deleteRiskWarning(record.warningId)
        .then(() => {
          message.success('删除成功');
          return loadData();
        })
        .catch(error => {
          console.error('删除失败:', error);
          message.error('删除失败');
          throw error;
        });
    }
  });
};
const detailInfo = (record: any) => {
  riskDetailRef.value.initialize(record);
};
</script>

<style lang="scss" scoped>
.AnotherPolicyQuery {
  height: 100%;
  width: 100%;
  position: relative;
}
.warningPlaceholder {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}
</style>
