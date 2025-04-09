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
import { getAreaTree, pageClaimProgress, exportClaimProgress, getDictList } from './api';
import { VerticalAlignBottomOutlined } from "@ant-design/icons-vue";
import { message } from 'ant-design-vue';

interface StateType {
  formItems: any[],
  formData: {
    insuredName: string,
    idNumber: string,
    policyNo: string,
    regisno: string,
    claimProcess: string,
    plantingArea: string,
    reportTime: any[]
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
      label: '报案号',
      prop: 'regisno',
      itemType: 'a-input'
    },
    {
      label: '理赔进度',
      prop: 'claimProcess',
      itemType: 'a-select',
      options: []
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
    },
    {
      label: '报案时间',
      prop: 'reportTime',
      itemType: 'a-range-picker',
      valueFormat: 'YYYY-MM-DD'
    }
  ],
  formData: {
    insuredName: '',
    idNumber: '',
    policyNo: '',
    regisno: '',
    claimProcess: '',
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
        title: '报案号',
        dataIndex: 'regisno',
        key: 'regisno',
        align: 'center',
        width: 220,
        resizable: true,
        fixed: 'left',
      },
      {
        title: '被保险人姓名/单位名称',
        dataIndex: 'insuredname',
        key: 'insuredname',
        align: 'center',
        width: 180,
        resizable: true,
        fixed: 'left',
      },
      {
        title: '结算周期',
        dataIndex: 'taskName',
        key: 'taskName',
        align: 'center',
        width: 220,
        resizable: true
      },
      {
        title: '身份证号/营业执照编号',
        dataIndex: 'identifynumber',
        key: 'identifynumber',
        align: 'center',
        width: 180,
        resizable: true,
        customRender: ({ text }) => {
          if (!text) return '';
          return text.replace(/(\w{3})\w*(\w{4})/, '$1*****$2');
        }
      },
      {
        title: '种植区域',
        dataIndex: 'plantAddress',
        key: 'plantAddress',
        align: 'center',
        width: 180,
        resizable: true
      },
      {
        title: '报案时间',
        dataIndex: 'reportTime',
        key: 'reportTime',
        align: 'center',
        width: 180,
        resizable: true
      },
      {
        title: '理赔进度',
        dataIndex: 'currentNode',
        key: 'currentNode',
        align: 'center',
        width: 80,
        resizable: true,
      },
      {
        title: '平台',
        dataIndex: 'platformName',
        key: 'platformName',
        align: 'center',
        width: 180,
        resizable: true,
      },
      {
        title: '赔付时间',
        dataIndex: 'cliamTime',
        key: 'cliamTime',
        align: 'center',
        width: 100,
        resizable: true,
      },
      {
        title: '实际赔付金额',
        dataIndex: 'claimAmount',
        key: 'claimAmount',
        align: 'center',
        width: 100,
        resizable: true,
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        align: 'center',
        width: 80,
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
        areaCode: state.formData.plantingArea || '',
        currentNode: state.formData.claimProcess || '',
        identifynumber: state.formData.idNumber || '',
        insuredname: state.formData.insuredName || '',
        policyNo: state.formData.policyNo || '',
        regisno: state.formData.regisno || '',
        reportTimeStart: state.formData.reportTime?.[0] || '',
        reportTimeEnd: state.formData.reportTime?.[1] || ''
      },
      pageNo: state.tableData.pagination.current,
      pageSize: state.tableData.pagination.pageSize
    };

    const res = await pageClaimProgress(params);
    if (res) {
      state.tableData.dataSource = res.records;
      state.tableData.pagination.total = res.total;
      state.tableData.pagination.pageSize = res.pageSize;
    }
  } catch (error) {
    console.error('获取理赔进度数据失败:', error);
  } finally {
    state.tableData.loading = false;
  }
};

const onExport = async () => {
  try {
    const params = {
      areaCode: state.formData.plantingArea || '',
      currentNode: state.formData.claimProcess || '',
      identifynumber: state.formData.idNumber || '',
      insuredname: state.formData.insuredName || '',
      regisno: state.formData.regisno || '',
      reportTimeStart: state.formData.reportTime?.[0] || '',
      reportTimeEnd: state.formData.reportTime?.[1] || ''
    };
    await exportClaimProgress(params);
  } catch (error) {
    console.error('导出失败:', error);
    message.error('导出失败');
  }
};

const loadDictData = async () => {
  try {
    const res = await getDictList({
      dictType: "CLAIM_PROGRESS"
    });

    const claimProcessItem = state.formItems.find(item => item.prop === 'claimProcess');
    if (claimProcessItem) {
      claimProcessItem.options = [
        { label: '全部', value: '' },
        ...res.map((item: any) => ({
          label: item.dictValue,
          value: item.dictCode
        }))
      ];
    }
  } catch (error) {
    console.error('获取理赔进度字典数据失败:', error);
  }
};

onMounted(() => {
  loadDictData();
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
</script>

<style lang="scss" scoped>
.AnotherPolicyQuery {
  height: 100%;
  width: 100%;
}
</style>
