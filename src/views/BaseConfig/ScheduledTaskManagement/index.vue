<template>
  <div class="risk-forecast-page">
    <a-card :bordered="false" class="card-section">
      <div class="section-header">
        <span class="section-title">月度风险预警测算</span>
        <span class="section-subtitle" @click="openRiskAlertTask" style="cursor: pointer;">预警任务</span>
      </div>
      <a-form layout="inline">
        <a-form-item label="预警区域">
          <a-tree-select v-model:value="monthlyForm.area" show-search style="width: 200px"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" placeholder="请选择区域" allow-clear multiple
            :show-checked-strategy="SHOW_ALL" tree-default-expand-all :tree-data="processedAreaOptions"
            :tree-node-filter-prop="'areaname'"
            :field-names="{ children: 'children', label: 'areaname', value: 'areacode' }"
            :disabled="!monthlyForm.isEditing" :max-tag-count="2" />
        </a-form-item>
        <a-form-item label="测算时间(当月)">
          <a-date-picker v-model:value="monthlyForm.date" :format="dateFormat" placeholder="月度日期选择"
            :disabled="!monthlyForm.isEditing" :showToday="false" popup-class-name="monthly-picker"
            @openChange="handleOpenChange" :disabledDate="disabledDate" />
        </a-form-item>
        <a-form-item>
          <a-button :type="monthlyForm.isEditing ? 'primary' : 'default'" @click="handleMonthlyEdit">
            {{ monthlyForm.isEditing ? '保存' : '编辑' }}
          </a-button>
        </a-form-item>
        <a-form-item>
          <a-switch v-model:checked="monthlyForm.enabled" :disabled="!monthlyForm.isEditing"
            @change="handleMonthlySwitch" />
        </a-form-item>
      </a-form>
    </a-card>

    <a-card :bordered="false" class="card-section" style="margin-top: 24px;">
      <div class="section-header">
        <span class="section-title">结算周期理赔测算</span>
        <span class="section-subtitle" @click="openCalculationTask" style="cursor: pointer;">测算任务</span>
      </div>

      <a-table :columns="columns" :data-source="tableData" :pagination="false" row-key="key">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'area'">
            <template v-if="column.key === 'area'">
              <a-tree-select v-model:value="record.area" show-search style="width: 200px"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" placeholder="请选择区域" allow-clear multiple
                :show-checked-strategy="SHOW_ALL" tree-default-expand-all :tree-data="processedAreaOptions"
                :tree-node-filter-prop="'areaname'"
                :field-names="{ children: 'children', label: 'areaname', value: 'areacode' }"
                :disabled="!record.isEditing" :max-tag-count="2" />
            </template>
          </template>
          <template v-else-if="column.key === 'time'">
            <a-date-picker v-model:value="record.date" :format="tableDateFormat"
              :popup-class-name="`calculation-picker-${record.key}`" placeholder="月度日期选择" :disabled="!record.isEditing"
              :showToday="false" @openChange="(open) => handleOpenChange2(open, record.key)" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button :type="record.isEditing ? 'primary' : 'default'" @click="handleRowEdit(record)"
              style="margin-right: 8px;">
              {{ record.isEditing ? '保存' : '编辑' }}
            </a-button>
            <a-switch style="margin-left: 12px;" v-model:checked="record.enabled" :disabled="!record.isEditing"
              @change="(checked) => handleRowSwitch(checked, record)" />
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
  <RiskAlertTaskDialog ref="riskAlertTaskDialogRef" />
  <RiskCalculationTaskDialog ref="riskCalculationTaskDialogRef" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { TreeSelect } from 'ant-design-vue';
import dayjs from 'dayjs'
import RiskAlertTaskDialog from './components/RiskAlertTaskDialog.vue'
import RiskCalculationTaskDialog from './components/RiskCalculationTaskDialog.vue'
import { getAreaTree, getMeasures, toggleMeasureStatus, updateMeasure } from './api'
const transformAreaCodes = (areaCodes: string[]) => {
  const result = {
    provenceCode: [],
    cityCode: [],
    districtCode: [],
    townCode: [],
    villageCode: []
  };

  areaCodes.forEach(code => {
    const areaLength = code.length;
    if (areaLength === 2) {
      result.provenceCode.push(code);
    } else if (areaLength === 4) {
      result.cityCode.push(code);
    } else if (areaLength === 6) {
      result.districtCode.push(code);
    } else if (areaLength === 9) {
      result.townCode.push(code);
    } else if (areaLength === 12) {
      result.villageCode.push(code);
    }
  });

  return result;
};
// 区域树数据,过滤 areaLevel 为 5 的节点
const processedAreaOptions = computed(() => {
  const processTree = (nodes: any[]): any[] => {
    if (!nodes) return [];
    
    return nodes
      .map(node => ({
        ...node,
        children: node.children ? processTree(node.children) : []
      }))
      .filter(node => node.areaLevel !== "5" && (node.children.length > 0 || node.areaLevel === "4"));
  };
  
  return processTree(areaOptions.value);
});

const dateFormat = 'DD' // 只显示日期 
const tableDateFormat = 'MM-DD' // 显示月份和日期
const riskAlertTaskDialogRef = ref(null)
const riskCalculationTaskDialogRef = ref(null)
const { SHOW_ALL } = TreeSelect;
const disabledDate = (current: dayjs.Dayjs) => {
  // 使用表单中的日期来判断月份
  if (!monthlyForm.date) return false;
  const measureMonth = monthlyForm.date.month();
  return current.month() !== measureMonth;
};
const monthlyForm = reactive({
  taskId: '',
  date: null,
  area: [],
  date: null,
  enabled: true,
  isEditing: false,
})

const tableData = ref([
  {
    key: 1,
    taskId: '',
    period: '',
    area: [],
    date: null,
    enabled: true,
    isEditing: false,
    popupClassName: 'calculation-picker'
  },
  {
    key: 2,
    taskId: '',
    period: '',
    area: [],
    date: null,
    enabled: true,
    isEditing: false,
    popupClassName: 'calculation-picker'
  },
  {
    key: 3,
    taskId: '',
    period: '',
    area: [],
    date: null,
    enabled: true,
    isEditing: false,
    popupClassName: 'calculation-picker'
  }
])

const areaOptions = ref([])
const loadAreaTree = async () => {
  try {
    const res = await getAreaTree()
    areaOptions.value = res
  } catch (error) {
    console.error('获取区域树失败:', error)
    message.error('获取区域数据失败')
  }
}

const columns = [
  {
    title: '理赔测算周期',
    dataIndex: 'period',
    key: 'period'
  },
  {
    title: '测算区域',
    dataIndex: 'area',
    key: 'area'
  },
  {
    title: '测算时间(当年)',
    dataIndex: 'time',
    key: 'time'
  },
  {
    title: '操作',
    key: 'action'
  }
]

const handleOpenChange = (open) => {
  if (open) {
    setTimeout(() => {
      const picker = document.querySelector('.monthly-picker .ant-picker-panel')
      if (picker) {
        const header = picker.querySelector('.ant-picker-header')
        if (header) header.style.display = 'none'
        
        // 隐藏星期行
        const weekRow = picker.querySelector('.ant-picker-content thead')
        if (weekRow) weekRow.style.display = 'none'
      }
    }, 100)
  }
}

const handleOpenChange2 = (open, key) => {
  if (open) {
    setTimeout(() => {
      const picker = document.querySelector(`.calculation-picker-${key} .ant-picker-header`)
      if (picker) {
        const yearBtn = picker.querySelector('.ant-picker-year-btn')
        const superPrevBtn = picker.querySelector('.ant-picker-header-super-prev-btn')
        const superNextBtn = picker.querySelector('.ant-picker-header-super-next-btn')

        if (yearBtn) yearBtn.style.display = 'none'
        if (superPrevBtn) superPrevBtn.style.display = 'none'
        if (superNextBtn) superNextBtn.style.display = 'none'
      }
    }, 100)
  }
}

const openRiskAlertTask = () => {
  riskAlertTaskDialogRef.value.open()
}
const openCalculationTask = () => {
  riskCalculationTaskDialogRef.value.open()
}
const handleMonthlySwitch = async (checked) => {
  try {
    const params = {
      data: {
        taskId: monthlyForm.taskId
      }
    }
    await toggleMeasureStatus(params)
    message.success(`${checked ? '启用' : '停用'}成功`)
  } catch (error) {
    monthlyForm.enabled = !checked
    console.error('切换状态失败:', error)
  }
}
const handleRowSwitch = async (checked, record) => {
  try {
    const params = {
      data: {
        taskId: record.taskId
      }
    }
    await toggleMeasureStatus(params)
    message.success(`${checked ? '启用' : '停用'}成功`)
  } catch (error) {
    record.enabled = !checked
    console.error('切换状态失败:', error)
  }
}
const handleMonthlyEdit = async () => {
  if (monthlyForm.isEditing) {
    try {
      const areaData = transformAreaCodes(monthlyForm.area);
      const params = {
        data: {
          taskId: monthlyForm.taskId,
          provinceCodes: areaData.provenceCode || [],
          cityCodes: areaData.cityCode || [],
          districtCodes: areaData.districtCode || [],
          townCodes: areaData.townCode || [],
          measureDate: monthlyForm.date?.format('DD'),
          measureMonth: monthlyForm.date?.format('MM')
        }
      };

      await updateMeasure(params);
      message.success('月度风险预警测算配置已保存');
      monthlyForm.isEditing = false;
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error('保存失败');
    }
  } else {
    monthlyForm.isEditing = true;
  }
}

const handleRowEdit = async (record) => {
  if (record.isEditing) {
    try {
      const areaData = transformAreaCodes(record.area);
      const params = {
        data: {
          taskId: record.taskId,
          provinceCodes: areaData.provenceCode || [],
          cityCodes: areaData.cityCode || [],
          districtCodes: areaData.districtCode || [],
          townCodes: areaData.townCode || [],
          measureDate: record.date?.format('DD'),
          measureMonth: record.date?.format('MM')
        }
      };

      await updateMeasure(params);
      message.success(`【${record.period}】配置已保存`);
      record.isEditing = false;
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error('保存失败');
    }
  } else {
    record.isEditing = true;
  }
}
const loadMeasures = async () => {
  try {
    const res = await getMeasures()

    const monthlyTask = res.find(item => item.taskFirstType === 'monthy')
    if (monthlyTask) {
      monthlyForm.taskId = monthlyTask.taskId
      monthlyForm.date = dayjs().month(Number(monthlyTask.measureMonth) - 1).date(Number(monthlyTask.measureDate))
      monthlyForm.area = monthlyTask.townCodes || []
      monthlyForm.enabled = monthlyTask.isEnable === '1'
    }
    const claimTasks = res.filter(item => item.taskFirstType === 'claim')
    
    tableData.value = claimTasks.map((task, index) => ({
      key: index + 1,
      taskId: task.taskId,
      period: task.taskName,
      area: task.townCodes || [],
      date: dayjs().month(Number(task.measureMonth) - 1).date(Number(task.measureDate)),
      enabled: task.isEnable === '1',
      isEditing: false,
      popupClassName: 'calculation-picker'
    }))

  } catch (error) {
    console.error('获取测算信息失败:', error)
    message.error('获取测算信息失败')
  }
}

onMounted(() => {
  loadAreaTree()
  loadMeasures()
})
</script>

<style scoped>
.risk-forecast-page {
  padding: 16px;
  color: #fff;
}

.card-section {
  border-radius: 6px;
  padding: 16px;
}

.section-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-right: 16px;
}

.section-subtitle {
  font-size: 14px;
  font-weight: bold;
  color: #46B180;
}
</style>
