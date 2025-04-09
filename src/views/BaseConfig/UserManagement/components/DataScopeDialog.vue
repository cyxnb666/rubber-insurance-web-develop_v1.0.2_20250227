<template>
    <a-modal :open="open" title="数据范围详情" :footer="null" :maskClosable="false" width="800px" @cancel="handleCancel">
      <div class="tree-container">
        <a-tree 
          :tree-data="treeData"
          :fieldNames="fieldNames"
          :checkedKeys="checkedKeys"
          :selectable="false"
          checkable
          disabled
        />
      </div>
    </a-modal>
  </template>
  
  <script lang="ts" setup>
  import { ref, watch } from 'vue';
  
  const props = defineProps<{
    open: boolean;
    comcodes: string[];
    dataScopeTree: any[];
  }>();
  
  const emit = defineEmits(['update:open']);
  
  const fieldNames = {
    title: 'comcname',
    key: 'comcode',
    children: 'children'
  };
  
  const treeData = ref<any[]>([]);
  const checkedKeys = ref<string[]>([]);
  
  const handleCancel = () => {
    emit('update:open', false);
  };
  
  watch(
    () => props.open,
    (newVal) => {
      if (newVal) {
        treeData.value = props.dataScopeTree;
        checkedKeys.value = props.comcodes;
      }
    }
  );
  
  watch(
    () => props.comcodes,
    (newVal) => {
      if (newVal) {
        checkedKeys.value = newVal;
      }
    }
  );
  </script>
  
  <style lang="scss" scoped>
  .tree-container {
    max-height: 500px;
    overflow-y: auto;
    padding: 8px;
  
    &::-webkit-scrollbar {
      width: 6px;
    }
  
    &::-webkit-scrollbar-thumb {
      background-color: #d9d9d9;
      border-radius: 3px;
    }
  
    &::-webkit-scrollbar-track {
      background-color: #f0f0f0;
    }
  }
  </style>