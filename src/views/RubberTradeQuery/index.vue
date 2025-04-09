<template>
  <div class="RubberTradeQuery">
    <TableLayout @tableChange="tableChange" @onSearch="onSearch" :loading="state.tableData.loading">
      <template #operator="{ record }">
        <a-button type="link" @click="showPaymentProof(record)" :loading="record.loading"
          :disabled="!record.fileIds || record.fileIds.length === 0">查看</a-button>
      </template>
    </TableLayout>
  </div>
  <PaymentProofModal v-model:open="proofModalVisible" :fileIds="currentFileIds" />
</template>

<script lang="ts" setup>
import { reactive, provide, h, ref, onMounted } from "vue";
import PaymentProofModal from './components/PaymentProofModal.vue';
import { pageTransactionRecord, getAreaTree, downloadFile } from './api';

const proofModalVisible = ref(false);
const currentFileIds = ref<string[]>([]);

const showPaymentProof = (record: any) => {
  if (record.fileIds?.length) {
    currentFileIds.value = record.fileIds;
    proofModalVisible.value = true;
  }
};
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
      label: '被保险人姓名/单位名称',
      prop: 'insuredName',
      itemType: 'a-input',
    },
    {
      label: '身份证号码/营业执照编号',
      prop: 'idNumber',
      itemType: 'a-input',
    },
    {
      label: '交易品种',
      prop: 'tradeType',
      itemType: 'a-select',
      options: [{ label: '全部', value: '' }, { label: '鲜胶', value: 'FRESH_GLUE' }, { label: '杂胶', value: 'MIXED_GLUE' }],
    },
    {
      label: '交易时间',
      prop: 'tradeDate',
      itemType: 'a-range-picker',
    },
    {
      label: '支付时间',
      prop: 'paymentDate',
      itemType: 'a-range-picker',
    },
    {
      label: '种植地',
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
    {
      label: '交易-支付时间大于15天',
      prop: 'timeExceed',
      itemType: 'a-select',
      options: [{ label: '全部', value: '' }, { label: '是', value: '1' }, { label: '否', value: '2' }],
    }
  ],
  formData: {
    insuredName: '',
    idNumber: '',
    tradeType: '',
    tradeDate: [],
    paymentDate: [],
    plantingArea: '',
    timeExceed: '',
  },
  tableData: {
    loading: false,
    dataSource: [],
    columns: [
      {
        title: '订单号',
        dataIndex: 'orderNo',
        key: 'orderNo',
        align: 'center',
        resizable: true,
        width: 120,
        fixed: 'left',
      },
      {
        title: '被保险人姓名/单位名称',
        dataIndex: 'insuredName',
        key: 'insuredName',
        align: 'center',
        resizable: true,
        width: 180,
        fixed: 'left'
      },
      {
        title: '交易平台',
        dataIndex: 'platformName',
        key: 'platformName',
        align: 'center',
        resizable: true,
        width: 120,
        fixed: 'left'
      },
      {
        title: '身份证号码/营业执照编号',
        dataIndex: 'insuredIdno',
        key: 'insuredIdno',
        align: 'center',
        resizable: true,
        width: 180,
        customRender: ({ text }) => {
          if (!text) return '';
          return text.replace(/(\w{3})\w*(\w{4})/, '$1*****$2');
        }
      },
      {
        title: '交易品种',
        dataIndex: 'breed',
        key: 'breed',
        align: 'center',
        customRender: ({ text }) => text === 'FRESH_GLUE' ? '鲜胶' : '干胶',
        resizable: true,
        width: 120
      },
      {
        title: '重量(kg)',
        dataIndex: 'weight',
        key: 'weight',
        align: 'center',
        resizable: true,
        width: 120
      },
      {
        title: '干含率(%)',
        dataIndex: 'dryContend',
        key: 'dryContend',
        align: 'center',
        resizable: true,
        width: 120
      },
      {
        title: '干胶重量(kg)',
        dataIndex: 'dryWeight',
        key: 'dryWeight',
        align: 'center',
        resizable: true,
        width: 120
      },
      {
        title: '干胶交易单价(元/kg)',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        align: 'center',
        resizable: true,
        width: 180
      },
      {
        title: '交易金额',
        dataIndex: 'tradingPrice',
        key: 'tradingPrice',
        align: 'center',
        resizable: true,
        width: 120
      },
      {
        title: '支付方式',
        dataIndex: 'payType',
        key: 'payType',
        align: 'center',
        customRender: ({ text }) => text === 'ONLINE' ? '线上' : '线下',
        resizable: true,
        width: 120
      },
      {
        title: '支付时间',
        dataIndex: 'payTime',
        key: 'payTime',
        align: 'center',
        resizable: true,
        width: 120
      },
      {
        title: '种植区域(保单维度)',
        dataIndex: 'plantArea',
        key: 'plantArea',
        align: 'center',
        resizable: true,
        width: 180
      },
      {
        title: '收胶站点',
        dataIndex: 'collectingStation',
        key: 'collectingStation',
        align: 'center',
        resizable: true,
        width: 120
      },
      {
        title: '收取方式',
        dataIndex: 'collectingType',
        key: 'collectingType',
        align: 'center',
        resizable: true,
        width: 120
      },
      {
        title: '收胶人',
        dataIndex: 'collectingPerson',
        key: 'collectingPerson',
        align: 'center',
        resizable: true,
        width: 120
      },
      {
        title: '交易时间',
        dataIndex: 'tradingTime',
        key: 'tradingTime',
        align: 'center',
        resizable: true,
        width: 120
      },
      {
        title: '保单号',
        dataIndex: 'poliocyNo',
        key: 'poliocyNo',
        align: 'center',
        resizable: true,
        width: 120
      },
      {
        title: '支付凭证',
        key: 'operator',
        align: 'center',
        resizable: true,
        width: 120,
        fixed: 'right',
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
const transformAreaData = (data: any[]): any[] => {
  return data.map(item => ({
    value: item.areacode,
    label: item.areaname,
    children: item.children ? transformAreaData(item.children) : []
  }));
};
const loadData = async () => {
  state.tableData.loading = true
  try {
    const params = {
      condition: {
        insuredName: state.formData.insuredName || '',
        insuredIdno: state.formData.idNumber || '',
        breed: state.formData.tradeType || '',
        tradingTimeStart: state.formData.tradeDate?.[0] || '',
        tradingTimeEnd: state.formData.tradeDate?.[1] || '',
        payTimeStart: state.formData.paymentDate?.[0] || '',
        payTimeEnd: state.formData.paymentDate?.[1] || '',
        regionCode: state.formData.plantingArea || '',
        payTimeOutOf15day: state.formData.timeExceed || ''
      },
      pageNo: state.tableData.pagination.current,
      pageSize: state.tableData.pagination.pageSize
    };

    const res = await pageTransactionRecord(params);
    if (res) {
      state.tableData.dataSource = res.records;
      state.tableData.pagination.total = res.total;
      state.tableData.pagination.current = res.pageNo;
      state.tableData.pagination.pageSize = res.pageSize;
    }
  } catch (error) {
    console.error('获取交易记录失败:', error);
  }
  finally {
    state.tableData.loading = false;
  }
};
provide('formData', state.formData);
provide('configs', state.formItems);
provide('tableData', state.tableData);

const tableChange = (pagination: any) => {
  state.tableData.pagination = pagination;
  loadData();
}

const onSearch = async (type: boolean) => {
  if (type) {
    state.tableData.pagination.current = 1;
  }
  await loadData();
}

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

onMounted(() => {
  loadAreaTree();
  loadData();
});
</script>

<style lang="scss" scoped>
.RubberTradeQuery {
  height: 100%;
  width: 100%;
}
</style>