<template>
  <div class="AnotherPolicyQuery">
    <TableLayout @tableChange="tableChange" @onSearch="onSearch" :loading="state.tableData.loading">
      <template #otherButton>
        <a-button type="primary" @click="onExport" style="margin-left: 10px;" :icon="h(VerticalAlignBottomOutlined)">
          导出
        </a-button>
      </template>
    </TableLayout>
  </div>
</template>

<script lang="ts" setup>
import { reactive, provide, onMounted, h } from "vue";
import { getAreaTree, pagePreClaims, selectClaimMeasures, exportClaim } from './api';
import {
  VerticalAlignBottomOutlined,
} from "@ant-design/icons-vue";

interface StateType {
  formItems: any[],
  formData: {
    insuredName: string,
    idNumber: string,
    settlementPeriod: string,
    year: string,
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
      label: '被保险人姓名/单位名称',
      prop: 'insuredName',
      itemType: 'a-input',
      placeholder: '请输入'
    },
    {
      label: '身份证号码/营业执照编号',
      prop: 'idNumber',
      itemType: 'a-input',
      placeholder: '请输入'
    },
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
      label: '结算周期',
      prop: 'settlementPeriod',
      itemType: 'a-select',
      options: [],
      fieldNames: {
        label: 'taskName',
        value: 'taskId'
      }
    },
    {
      label: '种植区域',
      prop: 'plantingArea',
      itemType: 'a-tree-select',
      fieldNames: {
        label: 'areaname',
        value: 'areacode',
        children: 'children'
      },
      url: getAreaTree,
      treeNodeFilterProp: 'areaname',
      options: [],
      treeDefaultExpandAll: true,
      showSearch: true,
      allowClear: true,
    }
  ],
  formData: {
    insuredName: '',
    idNumber: '',
    settlementPeriod: '',
    year: '',
    plantingArea: '',
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
        width: 220,
        fixed: 'left',
        resizable: true
      },
      {
        title: '被保险人姓名/单位名称',
        dataIndex: 'insuredname',
        key: 'insuredname',
        align: 'center',
        width: 180,
        resizable: true,
        fixed: 'left'
      },
      {
        title: '身份证号/营业执照编号',
        dataIndex: 'identifyNumber',
        key: 'identifyNumber',
        align: 'center',
        width: 180,
        resizable: true,
        customRender: ({ text }) => {
          if (!text) return '';
          return text.replace(/(\w{3})\w*(\w{4})/, '$1*****$2');
        },
        fixed: 'left'
      },
      {
        title: '种植区域(保单维度)',
        dataIndex: 'address',
        key: 'address',
        align: 'center',
        width: 180,
        resizable: true
      },
      {
        title: '种植地点',
        dataIndex: 'insuredAddress',
        key: 'insuredAddress',
        align: 'center',
        width: 100,
        resizable: true
      },
      {
        title: '投保面积',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'center',
        width: 120,
        resizable: true
      },
      {
        title: '年度',
        dataIndex: 'yearly',
        key: 'yearly',
        align: 'center',
        width: 120,
        resizable: true
      },
      {
        title: '结算周期',
        dataIndex: 'taskName',
        key: 'taskName',
        align: 'center',
        width: 100,
        resizable: true
      },
      {
        title: '鲜转干重量(kg)',
        dataIndex: 'freshDryWeight',
        key: 'freshDryWeight',
        align: 'center',
        width: 100,
        resizable: true
      },
      {
        title: '杂转干重量(kg)',
        dataIndex: 'miscellaneousDryWeight',
        key: 'miscellaneousDryWeight',
        align: 'center',
        width: 100,
        resizable: true
      },
      {
        title: '杂干折算系',
        dataIndex: 'convertCoefficient',
        key: 'convertCoefficient',
        align: 'center',
        width: 100,
        resizable: true
      },
      {
        title: '合计干胶重量(kg)',
        dataIndex: 'totalDryWeight',
        key: 'totalDryWeight',
        align: 'center',
        width: 160,
        resizable: true
      },
      {
        title: '乡镇结算周期平均交胶量',
        dataIndex: 'townAvgWeight',
        key: 'townAvgWeight',
        align: 'center',
        width: 180,
        resizable: true
      },
      {
        title: '分户每亩平均交胶量(kg/亩)',
        dataIndex: 'farmerAvgWeight',
        key: 'farmerAvgWeight',
        align: 'center',
        width: 180,
        resizable: true
      },
      {
        title: '结算周期最低交胶量(kg/亩)',
        dataIndex: 'periodMinWeight',
        key: 'periodMinWeight',
        align: 'center',
        width: 180,
        resizable: true
      },
      {
        title: '理算交胶量',
        dataIndex: 'claimWeight',
        key: 'claimWeight',
        align: 'center',
        width: 100,
        resizable: true
      },
      {
        title: '合计理算交胶量(kg)',
        dataIndex: 'claimTotalWeight',
        key: 'claimTotalWeight',
        align: 'center',
        width: 160,
        resizable: true
      },
      {
        title: '实际价格P',
        dataIndex: 'actualPrice',
        key: 'actualPrice',
        align: 'center',
        width: 100,
        resizable: true
      },
      {
        title: '每亩赔偿金额',
        dataIndex: 'claimAmount',
        key: 'claimAmount',
        align: 'center',
        width: 100,
        resizable: true
      },
      {
        title: '预计赔偿金额(元)',
        dataIndex: 'claimTotalAmount',
        key: 'claimTotalAmount',
        align: 'center',
        width: 160,
        resizable: true
      },
      {
        title: '测算时间',
        dataIndex: 'calcTime',
        key: 'calcTime',
        align: 'center',
        width: 100,
        resizable: true
      },
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
    const areaFormItem = state.formItems.find((item: any) => item.prop === 'plantingArea');
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
        identifynumber: state.formData.idNumber || '',
        insuredname: state.formData.insuredName || '',
        period: state.formData.settlementPeriod || '',
        townCodes: state.formData.plantingArea ? [state.formData.plantingArea] : [],
        yearly: state.formData.year ? Number(state.formData.year) : null
      },
      pageNo: state.tableData.pagination.current,
      pageSize: state.tableData.pagination.pageSize
    };

    const res = await pagePreClaims(params);
    if (res) {
      state.tableData.dataSource = res.records;
      state.tableData.pagination.total = res.total;
      state.tableData.pagination.pageSize = res.size;
    }
  } catch (error) {
    console.error('获取理赔测算数据失败:', error);
  } finally {
    state.tableData.loading = false;
  }
};

const loadSettlementPeriods = async () => {
  try {
    const res = await selectClaimMeasures();
    const settlementFormItem = state.formItems.find(item => item.prop === 'settlementPeriod');
    if (settlementFormItem) {
      settlementFormItem.options = [
        { taskId: '', taskName: '全部' },
        ...res
      ];
    }
  } catch (error) {
    console.error('获取结算周期数据失败:', error);
  }
};

const onExport = async () => {
  try {
    const params = {
      identifynumber: state.formData.idNumber || '',
      insuredname: state.formData.insuredName || '',
      period: state.formData.settlementPeriod || '',
      townCodes: state.formData.plantingArea ? [state.formData.plantingArea] : [],
      yearly: state.formData.year ? Number(state.formData.year) : null
    };
    await exportClaim(params);
  } catch (error) {
    console.error('导出失败:', error);
    message.error('导出失败');
  }
};

onMounted(() => {
  loadAreaTree();
  loadSettlementPeriods();
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
</script>

<style lang="scss" scoped>
.AnotherPolicyQuery {
  height: 100%;
  width: 100%;
}
</style>
