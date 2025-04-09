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
import { reactive, provide, onMounted, h, watch } from "vue";
import {
  VerticalAlignBottomOutlined,
} from "@ant-design/icons-vue";
import { getAreaTree } from '@/views/RubberTradeQuery/api';
import MappingTables from "@/views/FarmerPlantingManagement/components/MappingTables.ts";
import { selectNonPolicyInsurers, exportData, getDictList } from './api'

const transformAreaData = (data: any[]): any[] => {
  return data.map(item => ({
    value: item.areacode,
    label: item.areaname,
    children: item.children ? transformAreaData(item.children) : []
  }));
};

interface StateType {
  formItems: any[],
  formData: {
    insuredName: string,
    idNumber: string,
    productName: string,
    policyNo: string,
    year: string,
    policyType: string,
    plantingArea: string,
    updateTime: any[]
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
      label: '保单号',
      prop: 'policyNo',
      itemType: 'a-input'
    },
    {
      label: '保险产品名称',
      prop: 'productName',
      itemType: 'a-select',
      options: []
    },
    {
      label: '年度',
      prop: 'year',
      itemType: 'a-date-picker',
      picker: 'year',
      valueFormat: 'YYYY',
      disabledDate: (current) => {
        return current && current.year() < 2025;
      }
    },
    {
      label: '保单类型',
      prop: 'policyType',
      itemType: 'a-select',
      options: [
        { label: '全部', value: '' },
        { label: '个体', value: '1' },
        { label: '集体', value: '2' }
      ]
    },
    {
      label: '种植区域',
      prop: 'plantingArea',
      itemType: 'a-tree-select',
      fieldNames: {
        value: 'areacode',
        label: 'areaname',
      },
      options: [],
      select: (value: any, node: any) => {
        state.formData.provenceCode = '';
        state.formData.cityCode = '';
        state.formData.districtCode = '';
        state.formData.townCode = '';
        state.formData.villageCode = '';

        const key = MappingTables.areaLevel[node.areaLevel];
        state.formData[key] = value;
      }
    },
    {
      label: '更新时间',
      prop: 'updateTime',
      itemType: 'a-range-picker',
    }
  ],
  formData: {
    insuredName: '',
    idNumber: '',
    policyNo: '',
    productName: '',
    year: '',
    policyType: '',
    plantingArea: '',
    updateTime: [],
    provenceCode: '',
    cityCode: '',
    districtCode: '',
    townCode: '',
    villageCode: '',
    beginDate: '',
    endDate: '',
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
        resizable: true, width: 200,
        fixed: 'left'
      },
      {
        title: '保单类型',
        dataIndex: 'policytypeName',
        key: 'policytypeName',
        align: 'center',
        resizable: true, width: 80,
      },
      {
        title: '保险产品名称',
        dataIndex: 'riskname',
        key: 'riskname',
        align: 'center',
        resizable: true, width: 180
      },
      {
        title: '被保险人姓名/单位名称',
        dataIndex: 'insuredname',
        key: 'insuredname',
        align: 'center',
        resizable: true, width: 180
      },
      {
        title: '证件类型',
        dataIndex: 'identifytypeName',
        key: 'identifytypeName',
        align: 'center',
        resizable: true, width: 80
      },
      {
        title: '身份证号/营业执照编号',
        dataIndex: 'identifynumber',
        key: 'identifynumber',
        align: 'center',
        resizable: true, width: 180,
        customRender: ({ text }) => {
          if (!text) return '';
          return text.replace(/(\w{3})\w*(\w{4})/, '$1*****$2');
        }
      },
      {
        title: '年度',
        dataIndex: 'yearly',
        key: 'yearly',
        align: 'center',
        resizable: true, width: 80
      },
      {
        title: '起保时间',
        dataIndex: 'startdate',
        key: 'startdate',
        align: 'center',
        resizable: true, width: 100
      },
      {
        title: '终保时间',
        dataIndex: 'enddate',
        key: 'enddate',
        align: 'center',
        resizable: true, width: 100
      },
      {
        title: '种植区域(保单维度)',
        dataIndex: 'address',
        key: 'address',
        align: 'center',
        resizable: true, width: 180
      },
      {
        title: '投保面积(亩)',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'center',
        resizable: true, width: 100
      },
      {
        title: '手机号',
        dataIndex: 'insuredphone',
        key: 'insuredphone',
        align: 'center',
        resizable: true, width: 120,
        customRender: ({ text }) => {
          if (!text) return '';
          return text.replace(/(\d{3})\d*(\d{4})/, '$1****$2');
        }
      },
      {
        title: '种植详细名称',
        dataIndex: 'insuredaddress',
        key: 'insuredaddress',
        align: 'center',
        resizable: true, width: 100
      },
      {
        title: '自缴保费',
        dataIndex: 'farmerPremium',
        key: 'farmerPremium',
        align: 'center',
        resizable: true, width: 100
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        align: 'center',
        resizable: true, width: 100
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
    const areaFormItem = state.formItems.find((item: any) => item.prop === 'plantingArea');
    if (areaFormItem) {
      const res = await getAreaTree();
      areaFormItem.options = res;
    }
  } catch (err) {
    console.error('获取区域树失败:', err);
  }
};

const loadData = async () => {
  state.tableData.loading = true;
  try {
    const params = {
      condition: {
        policyNo: state.formData.policyNo,
        insuredname: state.formData.insuredName,
        identifynumber: state.formData.idNumber,
        riskcode: state.formData.productName,
        policytype: state.formData.policyType,
        yearly: state.formData.year,
        beginDate: state.formData.beginDate,
        endDate: state.formData.endDate,
        provenceCode: state.formData.provenceCode,
        cityCode: state.formData.cityCode,
        districtCode: state.formData.districtCode,
        townCode: state.formData.townCode,
        villageCode: state.formData.villageCode
      },
      pageNo: state.tableData.pagination.current,
      pageSize: state.tableData.pagination.pageSize
    }
    const res = await selectNonPolicyInsurers(params)
    state.tableData.dataSource = res.records || []
    state.tableData.pagination.total = res.total
  } catch (error) {
    console.error('获取表格数据失败:', error)
  } finally {
    state.tableData.loading = false
  }
}

watch(
  () => state.formData.updateTime,
  (value) => {
    if (value && value.length) {
      state.formData.beginDate = value[0]
      state.formData.endDate = value[1]
    } else {
      state.formData.beginDate = ''
      state.formData.endDate = ''
    }
  }
)

watch(
  () => state.formData.plantingArea,
  (value, node) => {
    if (!value) {
      state.formData.provenceCode = '';
      state.formData.cityCode = '';
      state.formData.districtCode = '';
      state.formData.townCode = '';
      state.formData.villageCode = '';
    }
  }
)

onMounted(() => {
  loadAreaTree();
  loadProductNames();
  loadData();
});

const loadProductNames = async () => {
  try {
    const params = {
      dictType: 'RISK'
    };
    const res = await getDictList(params);
    const productNameFormItem = state.formItems.find(item => item.prop === 'productName');
    if (productNameFormItem) {
      productNameFormItem.options = [
        { label: '全部', value: '' },
        ...res.map((item: any) => ({
          label: item.dictValue,
          value: item.dictCode
        }))
      ];
    }
  } catch (error) {
    console.error('获取保险产品名称数据失败:', error);
  }
};

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
      policyNo: state.formData.policyNo,
      insuredname: state.formData.insuredName,
      identifynumber: state.formData.idNumber,
      riskcode: state.formData.productName,
      policytype: state.formData.policyType,
      yearly: state.formData.year,
      beginDate: state.formData.beginDate,
      endDate: state.formData.endDate,
      provenceCode: state.formData.provenceCode,
      cityCode: state.formData.cityCode,
      districtCode: state.formData.districtCode,
      townCode: state.formData.townCode,
      villageCode: state.formData.villageCode
    };
    await exportData(params);
  } catch (error) {
    console.error('导出失败:', error);
  }
};
</script>

<style lang="scss" scoped>
.AnotherPolicyQuery {
  height: 100%;
  width: 100%;
}
</style>
