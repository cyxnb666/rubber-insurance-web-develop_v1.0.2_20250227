<template>
  <a-modal :open="open" :title="isEdit ? '人员编辑' : '人员新增'" :maskClosable="false" @cancel="handleCancel" @ok="handleOk"
    width="600px">
    <template #footer>
      <a-button key="back" @click="handleCancel">取消</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="handleOk">确定</a-button>
    </template>
    <a-form ref="formRef" :model="formData" :rules="rules" label-placement="left" :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }">
      <a-form-item label="姓名" name="name">
        <a-input v-model:value="formData.name" placeholder="请输入姓名" :maxlength="20" :disabled="isEdit" />
      </a-form-item>

      <a-form-item label="工号" name="workId">
        <a-input v-model:value="formData.workId" placeholder="请输入工号" :maxlength="20" :disabled="isEdit" />
      </a-form-item>

      <a-form-item label="手机号" name="phone">
        <a-input v-model:value="formData.phone" placeholder="请输入手机号" :maxlength="20" :disabled="isEdit" />
      </a-form-item>

      <a-form-item label="归属机构" name="organization">
        <a-tree-select v-model:value="formData.organization" style="width: 100%"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" :tree-data="treeData" placeholder="请选择归属机构"
          tree-default-expand-all :field-names="fieldNames" :disabled="isEdit" 
          :show-search="true" :tree-node-filter-prop="'name'" />
      </a-form-item>

      <a-form-item label="数据范围" name="dataScope">
        <a-tree-select v-model:value="formData.dataScope" style="width: 100%"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" :tree-data="computedDataScopeTree"
          placeholder="请选择数据范围" tree-default-expand-all :field-names="fieldNames" multiple
          :show-search="true" :tree-node-filter-prop="'name'" />
      </a-form-item>

      <a-form-item label="功能授权" name="permissions">
        <div class="tree-container">
          <a-tree v-model:checkedKeys="formData.permissions" :tree-data="permissionsTree" checkable
            :selectable="false" />
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import { saveUserInfo } from '../api';
import { message } from 'ant-design-vue';

const props = defineProps<{
  open: boolean;
  isEdit: boolean;
  editData?: any;
  treeData: any[];
  dataScopeTree: any[];
  menuTree: any[];
}>();

const emit = defineEmits(['update:open', 'success']);
const loading = ref<boolean>(false);

const formRef = ref<FormInstance>();
const fieldNames = {
  label: 'name',
  value: 'key',
  children: 'children'
};

const transformDataScopeTree = (data: any[]) => {
  return data.map(item => ({
    name: item.comcname,
    key: item.comcode,
    children: item.children ? transformDataScopeTree(item.children) : null
  }));
};

const computedDataScopeTree = computed(() => {
  return transformDataScopeTree(props.dataScopeTree || []);
});

const formData = reactive({
  name: '',
  workId: '',
  phone: '',
  organization: '',
  dataScope: [],
  permissions: [],
});

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  workId: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  organization: [{ required: true, message: '请选择归属机构', trigger: 'change' }],
  dataScope: [{ required: true, message: '请选择数据范围', trigger: 'change' }],
};

const convertRoutesToPermissionsTree = (menus: any[]) => {
  return menus.map(menu => {
    const node = {
      title: menu.menuName,
      key: menu.menuId.toString(),
      children: menu.children ? convertRoutesToPermissionsTree(menu.children) : undefined
    };
    return node;
  });
};

const permissionsTree = computed(() => {
  return convertRoutesToPermissionsTree(props.menuTree || []);
});
const resetFormData = () => {
  Object.assign(formData, {
    name: '',
    workId: '',
    phone: '',
    organization: '',
    dataScope: [],
    permissions: [],
  });
};
// 回显
watch(() => props.editData, (newVal) => {
  if (newVal) {
    Object.assign(formData, {
      name: newVal.name,
      workId: newVal.workId,
      phone: newVal.phone,
      organization: newVal.organization,
      dataScope: newVal.dataScope || [],
      permissions: newVal.permissions || [],
    });
  } else {
    resetFormData();
  }
}, { immediate: true });
const handleCancel = () => {
  emit('update:open', false);
  formRef.value?.resetFields();
  resetFormData();
};

const handleOk = () => {
  loading.value = true;
  formRef.value?.validate()
    .then(() => {
      const saveData = {
        menus: formData.permissions.map(id => ({
          menuId: parseInt(id)
        })),
        userCompany: formData.dataScope.map(code => ({
          comcode: code
        })),
        userEntity: {
          comcode: formData.organization,
          telephone: formData.phone,
          usercode: formData.workId,
          username: formData.name
        },
        isAdd: !props.isEdit
      };

      // 如果是新增，需要添加 source 字段
      if (!props.isEdit) {
        saveData.userEntity.source = 'outside';
      }

      return saveUserInfo(saveData);
    })
    .then(() => {
      message.success(props.isEdit ? '编辑成功' : '新增成功');
      emit('success', true);
      emit('update:open', false);
    })
    .catch(error => {
      console.error(props.isEdit ? '编辑失败:' : '新增失败:', error);
      message.error(props.isEdit ? '编辑失败' : '新增失败');
    })
    .finally(() => {
      loading.value = false;
    });
};

watch(() => props.open, (newVal) => {
  if (newVal && !props.isEdit && formData.organization) {
    // 检查数据范围树中是否存在对应的机构编码
    const findNode = (nodes: any[]): boolean => {
      for (const node of nodes) {
        if (node.comcode === formData.organization) {
          formData.dataScope = [formData.organization];
          return true;
        }
        if (node.children && findNode(node.children)) {
          return true;
        }
      }
      return false;
    };

    // 数据范围树中查找
    findNode(props.dataScopeTree);
  }
});
</script>


<style lang="scss" scoped>
.tree-container {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  padding: 4px 8px;
}

.tree-container::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 3px;
}

.tree-container::-webkit-scrollbar-track {
  background-color: #f0f0f0;
}
</style>