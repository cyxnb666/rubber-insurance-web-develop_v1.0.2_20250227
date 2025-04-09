<template>
  <div class="page-container">
    <div class="tree-container">
      <div class="search-wrapper">
        <a-input-search v-model:value="searchValue" placeholder="请输入搜索内容" class="fixed-search" @change="onSearchChange"
          allow-clear />
        <div class="search-navigation" v-if="matchedNodes.length > 0">
          <span class="match-info">{{ currentMatchIndex + 1 }}/{{ matchedNodes.length }}</span>
          <a-button type="link" size="small" @click="navigateToPrev" :disabled="currentMatchIndex <= 0">
            <UpOutlined />上一个
          </a-button>
          <a-button type="link" size="small" @click="navigateToNext"
            :disabled="currentMatchIndex >= matchedNodes.length - 1">
            <DownOutlined />下一个
          </a-button>
        </div>
      </div>

      <div class="tree-scroll-container">
        <a-spin :spinning="treeLoading">
          <a-tree v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys" :tree-data="treeData"
            :field-names="fieldNames" :loading="treeLoading" :auto-expand-parent="autoExpandParent" @select="onSelect"
            @expand="onExpand">
            <template #title="{ title, name, key }">
              <span :ref="el => { if (searchValue && name && name.includes(searchValue)) matchRefs[key] = el }">
                <span v-if="searchValue && name && name.includes(searchValue)">
                  {{ name.substr(0, name.indexOf(searchValue)) }}
                  <span style="color: #f50">{{ searchValue }}</span>
                  {{ name.substr(name.indexOf(searchValue) + searchValue.length) }}
                </span>
                <span v-else>{{ name }}</span>
              </span>
            </template>
          </a-tree>
        </a-spin>
      </div>
    </div>
    <div class="content-container">
      <TableLayout @tableChange="tableChange" @onSearch="onSearch" :loading="state.tableData.loading">
        <template #otherButton>
          <a-button type="primary" @click="addUser" style="margin-left: 10px;"
            :icon="h(PlusCircleOutlined)">新增</a-button>
        </template>
        <template #operator="{ record }">
          <a-button type="link" @click="editAuth(record)"
            :loading="!!editingLoadingMap[record.usercode]">编辑授权</a-button>
          <a-button type="link" @click="deleteUserFn(record)">删除</a-button>
        </template>
      </TableLayout>
    </div>
  </div>
  <UserDialog v-model:open="dialogVisible" :is-edit="isEdit" :edit-data="editData" :menu-tree="menuTreeData"
    :tree-data="treeData" :data-scope-tree="dataScopeTree" @success="handleDialogSuccess" />
  <DataScopeDialog v-model:open="dataScopeVisible" :comcodes="currentUserComcodes" :data-scope-tree="dataScopeTree" />
</template>

<script lang="ts" setup>
import UserDialog from './components/UserDialog.vue';
import DataScopeDialog from './components/DataScopeDialog.vue';
import { reactive, ref, provide, h, watch, onMounted, nextTick } from "vue";
import { PlusCircleOutlined } from "@ant-design/icons-vue";
import { getCompanyTree, getUserList, updateUserStatus, getUserDetail, getCompanyTreeByArea, deleteUser, getAllMenuTree, saveUserInfo, getUserScopeDetail } from './api'
import { Switch, message, Spin, Modal } from 'ant-design-vue';
function transformTreeData(node: any) {
  return {
    name: node.comcname,       // a-tree 用来展示文本的属性
    key: node.comcode,         // a-tree 用来唯一标识节点的属性
    children: (node.children || []).map((child: any) => transformTreeData(child))
  }
}
const searchValue = ref('');
const expandedKeys = ref<string[]>(['53000000']);
const selectedKeys = ref<string[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const editData = ref<any>(null);
const currentComcode = ref('');
const menuTreeData = ref([]);
const treeLoading = ref(false);
const dataScopeVisible = ref(false);
const currentUserComcodes = ref<string[]>([]);
const editingLoadingMap = reactive<Record<string, boolean>>({});
const dataList = ref([]);
const autoExpandParent = ref(true);
const matchedNodes = ref([]);
const currentMatchIndex = ref(-1);
const matchRefs = ref({});

// 查找所有匹配节点
const findMatchedNodes = () => {
  matchedNodes.value = [];

  const findMatches = (nodes) => {
    if (!nodes) return;

    for (const node of nodes) {
      if (node.name && node.name.includes(searchValue.value)) {
        matchedNodes.value.push(node.key);
      }
      if (node.children && node.children.length > 0) {
        findMatches(node.children);
      }
    }
  };

  findMatches(treeData.value);
};
// 导航到下一个匹配项
const navigateToNext = () => {
  if (currentMatchIndex.value < matchedNodes.value.length - 1) {
    currentMatchIndex.value++;
    scrollToCurrentMatch();
  }
};

// 导航到上一个匹配项
const navigateToPrev = () => {
  if (currentMatchIndex.value > 0) {
    currentMatchIndex.value--;
    scrollToCurrentMatch();
  }
};
const scrollToCurrentMatch = () => {
  nextTick(() => {
    const currentKey = matchedNodes.value[currentMatchIndex.value];
    const element = matchRefs.value[currentKey];

    if (element) {
      // 滚动元素到视图
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
};
const generateList = (data) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const key = node.key;
    const name = node.name;
    dataList.value.push({ key, name });
    if (node.children) {
      generateList(node.children);
    }
  }
};
const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else {
        const result = getParentKey(key, node.children);
        if (result) {
          parentKey = result;
        }
      }
    }
  }
  return parentKey;
};
const onExpand = (keys) => {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};
const addUser = () => {
  // 设置默认选中的菜单权限
  const defaultPermissions = ['12', '10', '13', '15', '16', '4'];

  editData.value = {
    name: '',
    workId: '',
    phone: '',
    organization: currentComcode.value, // 设置当前选中的机构编码
    dataScope: [], // 数据范围保持为空数组,在UserDialog中会尝试找到对应的数据因为可能没得
    permissions: defaultPermissions
  };

  isEdit.value = false;
  dialogVisible.value = true;
};

const dataScopeTree = ref<any[]>([]);

const editAuth = async (record: any) => {
  editingLoadingMap[record.usercode] = true;
  try {
    const userDetailRes = await getUserDetail({ userCode: record.usercode });
    if (!userDetailRes.userEntity) {
      message.warning('该用户已停用');
      return;
    }
    const userDetail = {
      name: userDetailRes.userEntity.username,
      workId: userDetailRes.userEntity.usercode,
      phone: userDetailRes.userEntity.telephone,
      organization: userDetailRes.userEntity.comcode,
      dataScope: userDetailRes.userCompany.map(item => item.comcode),
      permissions: userDetailRes.menus.map((menu: any) => menu.menuId.toString())
    };

    isEdit.value = true;
    editData.value = userDetail;
    dialogVisible.value = true;
  } catch (error) {
    console.error('获取用户详情失败:', error);
    message.error('获取用户详情失败');
  } finally {
    editingLoadingMap[record.usercode] = false;
  }
};


watch(() => dialogVisible.value, (newVal) => {
  if (!newVal) {
    editData.value = null;
  }
});
const fieldNames = {
  title: 'name',
  key: 'key',
  children: 'children'
};

const treeData = ref<any[]>([]);

const onSearchChange = (e) => {
  const value = e.target.value;
  searchValue.value = value;

  // 重置匹配状态
  matchRefs.value = {};

  // 如果有搜索内容，自动执行搜索
  if (value) {
    // 延迟执行搜索，等待树展开后再计算匹配
    setTimeout(() => {
      findMatchedNodes();
      if (matchedNodes.value.length > 0) {
        currentMatchIndex.value = 0;
        scrollToCurrentMatch();
      }
    }, 300);
  } else {
    // 清空搜索内容时重置状态
    matchedNodes.value = [];
    currentMatchIndex.value = -1;
  }
};
watch(searchValue, value => {
  if (!value) {
    // 如果搜索值为空，重置为默认展开状态
    expandedKeys.value = ['53000000'];
    autoExpandParent.value = true;
    return;
  }

  // 如果扁平列表为空，先生成
  if (dataList.value.length === 0 && treeData.value.length > 0) {
    generateList(treeData.value);
  }

  // 找到所有匹配项的父节点
  const expanded = [];
  dataList.value.forEach(item => {
    if (item.name && item.name.indexOf(value) > -1) {
      const parentKey = getParentKey(item.key, treeData.value);
      if (parentKey && expanded.indexOf(parentKey) === -1) {
        expanded.push(parentKey);
      }
      // 添加匹配项自己的 key，以确保它可见
      if (expanded.indexOf(item.key) === -1) {
        expanded.push(item.key);
      }
    }
  });

  expandedKeys.value = expanded.length ? expanded : ['53000000'];
  autoExpandParent.value = true;
});
watch(treeData, () => {
  dataList.value = [];
  if (treeData.value.length > 0) {
    generateList(treeData.value);
  }
}, { immediate: true });

const onSelect = async (selectedKeys: string[], info: any) => {
  if (selectedKeys.length > 0) {
    currentComcode.value = selectedKeys[0];
    await loadUserList();
  }
};

const loadUserList = async () => {
  state.tableData.loading = true
  try {
    const params = {
      condition: {
        comcode: currentComcode.value,
        usercode: state.formData.usercode || '',
        username: state.formData.username || ''
      },
      pageNo: state.tableData.pagination.current,
      pageSize: state.tableData.pagination.pageSize
    };

    const res = await getUserList(params);
    if (res) {
      state.tableData.dataSource = res.records;
      state.tableData.pagination.total = res.total;
      state.tableData.pagination.current = res.pageNo;
      state.tableData.pagination.pageSize = res.pageSize;
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
  } finally {
    state.tableData.loading = false;
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
    },
  }
}

const state = reactive(<StateType>{
  formItems: [
    {
      label: '姓名',
      prop: 'username',
      itemType: 'a-input',
      labelWidth: 80,
    },
    {
      label: '工号',
      prop: 'usercode',
      itemType: 'a-input',
      labelWidth: 80,
    }
  ],
  formData: {
    username: '',
    usercode: '',
  },
  tableData: {
    loading: false,
    dataSource: [],
    columns: [
      {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        align: 'center',
        fixed: 'left',

        customRender: ({ index }) => index + 1
      },
      { title: '姓名', dataIndex: 'username', key: 'username', align: 'center', },
      { title: '工号', dataIndex: 'usercode', key: 'usercode', align: 'center', },
      {
        title: '数据范围',
        dataIndex: 'comshortname',
        key: 'comshortname',
        align: 'center',

        customRender: ({ text, record }) => h('a', {
          onClick: () => showDataScope(record)
        }, text)
      },
      {
        title: '状态',
        dataIndex: 'isEnable',
        key: 'isEnable',
        align: 'center',

        customRender: ({ text, record }) => h(Switch, {
          checked: text === '1',
          checkedChildren: '启用',
          unCheckedChildren: '停用',
          onChange: (checked: boolean) => handleStatusChange(checked, record)
        })
      },
      {
        title: '操作',
        key: 'operator',
        align: 'center',
        width: 220
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

const tableChange = async (pagination: any) => {
  state.tableData.pagination = pagination;
  await loadUserList();
}

const onSearch = async (type: boolean) => {
  if (type) {
    state.tableData.pagination.current = 1;
  }
  await loadUserList();
}
const handleStatusChange = async (checked: boolean, record: any) => {
  try {
    await updateUserStatus({
      isEnable: checked ? '1' : '0',
      userCode: record.usercode
    });

    message.success(`已${checked ? '启用' : '停用'}该用户`);
    await loadUserList();
  } catch (error) {
    console.error('修改用户状态失败:', error);
    message.error('修改状态失败');
  }
};
const { confirm } = Modal;
const deleteUserFn = (record: any) => {
  confirm({
    title: '确认删除',
    content: `确定要删除用户 ${record.username} 吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      return deleteUser(record.usercode)
        .then(() => {
          message.success('删除成功');
          return loadUserList();
        })
        .catch(error => {
          console.error('删除用户失败:', error);
          message.error('删除用户失败');
          throw error;
        });
    }
  });
};

const handleDialogSuccess = async (success: boolean) => {
  if (success) {
    await loadUserList();
  }
};
const showDataScope = async (record: any) => {
  try {
    const res = await getUserScopeDetail({ usercode: record.usercode });
    currentUserComcodes.value = res;
    dataScopeVisible.value = true;
  } catch (error) {
    console.error('获取用户数据范围失败:', error);
    message.error('获取用户数据范围失败');
  }
};
const loadCompanyTree = async () => {
  treeLoading.value = true;
  try {
    const res = await getCompanyTree({ rootComcode: '' });
    treeData.value = [transformTreeData(res)];
    currentComcode.value = res.comcode;
    selectedKeys.value = [currentComcode.value];
    await loadUserList();
  } catch (error) {
    console.error('获取公司树失败:', error);
  } finally {
    treeLoading.value = false;
  }
};
const loadMenuTree = async () => {
  try {
    const res = await getAllMenuTree();
    menuTreeData.value = res;
  } catch (error) {
    console.error('获取菜单树失败:', error);
    message.error('获取菜单树失败');
  }
};
const loadInitialData = async () => {
  try {
    // 获取通用的数据范围树
    const companyTreeRes = await getCompanyTreeByArea({ comcode: '' });
    dataScopeTree.value = companyTreeRes;

    await loadCompanyTree();
    await loadMenuTree();
  } catch (error) {
    console.error('初始化数据失败:', error);
    message.error('初始化数据失败');
  }
};
onMounted(() => {
  loadInitialData();
});
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%;
  width: 100%;
  display: flex;
  gap: 16px;

  .tree-container {
    width: 30%;
    padding: 16px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .search-wrapper {
      margin-bottom: 8px;
      flex-shrink: 0;

      .fixed-search {
        width: 100%;
      }

      .search-navigation {
        display: flex;
        align-items: center;
        margin-top: 8px;

        .match-info {
          margin-right: 8px;
          color: #666;
          font-size: 12px;
        }
      }
    }

    .tree-scroll-container {
      flex-grow: 1;
      overflow-y: auto;
      padding-right: 4px;
    }
  }

  .content-container {
    padding: 16px;
    width: 70%;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
}
</style>