<template>
  <a-modal v-model:open="open" title="创建下载任务" @ok="handleOk" @cancel="cancel" :maskClosable="false" centered
           :confirm-loading="confirmLoading">
    <a-form
        :model="formState"
        autocomplete="off"
        layout="vertical"
        ref="formRef"
    >
      <a-form-item
          label="任务名称"
          name="taskName"
          :rules="[{ required: true, message: '请填写任务名称' }]"
      >
        <a-input v-model:value="formState.taskName"/>
      </a-form-item>
    </a-form>
    <div class="tips howToDownload">下载方式: 1、选择框选中下载。2、根据查询条件结果批量下载.</div>
    <div class="tips">注: 下载包含大量影像数据下载结果稍慢, 创建任务后请前往下载记录列表中查看下载进度并下载。</div>
  </a-modal>
</template>
<script setup lang="ts">
import {ref} from 'vue';
import {message} from "ant-design-vue";
import {createDownload} from "@/views/FarmerPlantingManagement/api.ts";

interface FormState {
  taskName: string;
}

const formState = ref<FormState>({
  taskName: '',
});
const formRef = ref();
const open = ref<boolean>(false);
const confirmLoading = ref<boolean>(false);
const initialize = (params: any) => {
  formState.value = params
  open.value = true;
}
const handleOk = () => {
  formRef.value
      .validate()
      .then(() => {
        confirmLoading.value = true;
        createDownload(formState.value).then(() => {
          message.success('创建下载任务成功')
          open.value = false;
        }).finally(() => {
          confirmLoading.value = false;
        })
      })
      .catch(() => {
      });
}
const cancel = () => {
  formState.value = {
    taskName: '',
  }
  console.log(formState.value)
}
defineExpose({initialize})
</script>


<style scoped lang="scss">
.tips {
  color: #5E5F61;
}

.howToDownload {
  margin-bottom: 10px;
}
</style>