<template>
  <div class="BaseParams">
    <TableLayout @tableChange="tableChange" @onSearch="onSearch" :loading="state.tableData.loading">
      <template #otherButton>
        <a-button type="primary" @click="add" style="margin-left: 10px;" :icon="h(PlusCircleOutlined)">新增</a-button>
      </template>
      <template #operator="{ record }">
        <a-button type="link" @click="editRecord(record)">修改</a-button>
        <a-button type="link" @click="deleteUserFn(record)">删除</a-button>
      </template>
    </TableLayout>
  </div>
  <BaseParamsModal v-model:open="modalVisible" :is-edit="isEdit" :record="currentRecord" @success="handleSuccess" />
</template>

<script lang="ts" setup>
import { reactive, ref, provide, h, watch, onMounted } from "vue";
import { PlusCircleOutlined } from "@ant-design/icons-vue";
import BaseParamsModal from './components/BaseParamsModal.vue';
import { pageList, deleteClaimConfig } from './api'
import { Modal, message } from 'ant-design-vue';

const modalVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref<any>(null);

interface StateType {
  formItems: object[],
  formData: object,
  tableData: {
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

const state = reactive(<StateType>{
  formItems: [
    {
      label: '年度',
      prop: 'year',
      itemType: 'a-date-picker',
      picker: 'year',
      disabledDate: (current: moment.Moment) => {
        // 限制只能选择 2025-2050 年
        return current && (current.year() < 2025 || current.year() > 2050);
      },
    },
    // {
    //   label: '月份',
    //   prop: 'month',
    //   itemType: 'a-select',
    //   options: [{ label: '全部', value: '' }],
    //   url: () => {},
    // }
  ],
  formData: {
    year: '',
    // month: '',
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
        fixed: 'left',
        resizable: true, width: 120
      },
      {
        title: '费率(%)',
        dataIndex: 'feeRate',
        key: 'feeRate',
        align: 'center',
        resizable: true, width: 120
      },
      {
        title: '保额(元)',
        dataIndex: 'amount',
        key: 'amount',
        align: 'center',
        resizable: true, width: 120
      },
      {
        title: '目标价格(元/kg)',
        dataIndex: 'targetPrice',
        key: 'targetPrice',
        align: 'center',
        resizable: true, width: 120
      },
      {
        title: '目标交胶量(kg/亩)',
        dataIndex: 'targetYield',
        key: 'targetYield',
        align: 'center',
        resizable: true, width: 120
      },
      {
        title: '最低交胶量(kg/亩)',
        dataIndex: 'targetMinYield',
        key: 'targetMinYield',
        align: 'center',
        resizable: true, width: 120
      },
      {
        title: '杂干折算系数',
        dataIndex: 'convertCoefficient',
        key: 'convertCoefficient',
        align: 'center',
        resizable: true, width: 120
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        align: 'center',
        resizable: true, width: 120
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        align: 'center',
        resizable: true, width: 120
      },
      {
        title: '更新人',
        dataIndex: 'updateBy',
        key: 'updateBy',
        align: 'center',
        resizable: true, width: 120
      },
      {
        title: '操作',
        key: 'operator',
        align: 'center',
        resizable: true, width: 120
      }
    ],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`,
      position: ['bottomCenter ']
    }
  }
});

provide('formData', state.formData);
provide('configs', state.formItems);
provide('tableData', state.tableData);

const loadData = async () => {
  state.tableData.loading = true
  try {
    const params = {
      condition: {
        // month: state.formData.month || '',
        year: state.formData.year || '',
      },
      pageNo: state.tableData.pagination.current,
      pageSize: state.tableData.pagination.pageSize
    };
    const res = await pageList(params);
    if (res) {
      state.tableData.dataSource = res.records;
      state.tableData.pagination.total = res.total;
      state.tableData.pagination.current = res.pageNo;
      state.tableData.pagination.pageSize = res.pageSize;
    }
  } catch (error) {
    console.error('获取基础参数列表失败:', error);
  } finally {
    state.tableData.loading = false
  }
};

const tableChange = (pagination: any) => {
  state.tableData.pagination = pagination;
  loadData();
}

const onSearch = (type: boolean) => {
  if (type) {
    state.tableData.pagination.current = 1;
  }
  loadData();
};

const add = () => {
  isEdit.value = false;
  currentRecord.value = null;
  modalVisible.value = true;
};

const editRecord = (record: any) => {
  isEdit.value = true;
  currentRecord.value = record;
  modalVisible.value = true;
};

const handleSuccess = (needRefresh: boolean) => {
  if (needRefresh) {
    loadData();
  }
};

const { confirm } = Modal;
const deleteUserFn = (record: any) => {
  confirm({
    title: '确认删除',
    content: `确定要删除吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteClaimConfig({ configId: record.configId });
        message.success('删除成功');
        await loadData();
      } catch (error) {
        console.error('删除失败:', error);
        message.error('删除失败');
      }
    }
  });
};
watch(() => modalVisible.value, (newVal) => {
  if (!newVal) {
    currentRecord.value = null;
  }
});
onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.BaseParams {
  height: 100%;
  width: 100%;
}
</style>