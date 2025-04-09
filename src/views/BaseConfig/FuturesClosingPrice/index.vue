<template>
  <div class="FuturesClosingPrice">
    <TableLayout @tableChange="tableChange" @onSearch="onSearch" :loading="state.tableData.loading">
    </TableLayout>
  </div>
</template>

<script lang="ts" setup>
import { reactive, provide, onMounted } from "vue";
import { getClosingPriceList } from './api'

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
    }
  }
}

const state = reactive(<StateType>{
  formItems: [
    {
      label: '时间',
      prop: 'dateRange',
      itemType: 'a-range-picker',
    }
  ],
  formData: {
    dateRange: [],
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
      },
      {
        title: '日期',
        dataIndex: 'closingDate',
        key: 'closingDate',
        align: 'center',
        customRender: ({ text }) => {
          return text ? text.substring(0, 10) : '';
        }
      },
      {
        title: '收盘价',
        dataIndex: 'closingPrice',
        key: 'closingPrice',
        align: 'center'
      },
      {
        title: '导入时间',
        dataIndex: 'createTime',
        key: 'createTime',
        align: 'center'
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

provide('formData', state.formData);
provide('configs', state.formItems);
provide('tableData', state.tableData);

const getTableData = async () => {
  try {
    const params = {
      condition: {
        start: state.formData.dateRange?.[0] || '',
        end: state.formData.dateRange?.[1] || ''
      },
      pageNo: state.tableData.pagination.current,
      pageSize: state.tableData.pagination.pageSize
    };
    
    state.tableData.loading = true
    const res = await getClosingPriceList(params);
    state.tableData.dataSource = res.records || [];
    state.tableData.pagination.total = res.total || 0;
  } catch (error) {
    console.error('获取期货收盘价格列表失败:', error);
  } finally {
    state.tableData.loading = false
  }
}

const tableChange = (pagination: any) => {
  state.tableData.pagination = pagination;
  getTableData();
}

const onSearch = (type: boolean) => {
  if (type) {
    state.tableData.pagination.current = 1;
  }
  getTableData();
}

onMounted(() => {
  getTableData();
})
</script>

<style lang="scss" scoped>
.FuturesClosingPrice {
  height: 100%;
  width: 100%;
}
</style>