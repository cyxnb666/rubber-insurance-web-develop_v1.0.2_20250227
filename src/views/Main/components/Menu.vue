<template>
  <div class="MenuView">
    <a-menu v-model:openKeys="state.openKeys" v-model:selectedKeys="state.selectedKeys" @click="clickMenu" mode="inline"
      :items="state.items"></a-menu>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch, h, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

interface stateType {
  selectedKeys: string[];
  openKeys: string[];
  preOpenKeys: string[];
  items: Array<any>;
}

const state = reactive<stateType>({
  selectedKeys: [],
  openKeys: [],
  preOpenKeys: [],
  items: []
});

const props = defineProps({
  isCollapse: Boolean
});

// 根据路由表设置菜单项
const setRoutes = () => {
  // 获取路由表中的主路由（通常是Layout包含的子路由）
  const mainRoute = router.options.routes.find(route => route.name === 'Main');
  if (!mainRoute || !mainRoute.children) return;

  const traverse = (array: any[]): Array<any> => {
    return array.map((item: any) => {
      const { children, meta } = item;

      // 创建菜单项
      return {
        key: item.name,
        label: meta?.title || item.name,
        title: meta?.title || item.name,
        icon: meta?.icon ? () => h('span', { class: `menu-icon ${meta.icon}` }) : null,
        children: children && children.length ? traverse(children) : null,
      };
    });
  };

  state.items = traverse(mainRoute.children);
};

// 菜单点击事件
const clickMenu = (item: any) => {
  const { key } = item;
  router.push({ name: key });
};

// 监听openKeys变化
watch(
  () => state.openKeys,
  (_val, oldVal) => {
    state.preOpenKeys = oldVal;
  },
);

// 监听路由变化，更新selectedKeys
watch(
  () => route,
  (_val) => {
    state.selectedKeys = [_val.name as string];
  },
  { deep: true, immediate: true }
);

// 监听折叠状态
watch(
  () => props.isCollapse,
  (val) => {
    if (val) {
      state.preOpenKeys = [...state.openKeys];
      state.openKeys = [];
    } else {
      state.openKeys = [...state.preOpenKeys];
    }
  }
);

onMounted(() => {
  const { name, matched } = route;
  state.selectedKeys = [name as string];

  // 根据当前路由路径设置初始展开的菜单
  if (matched.length > 2) {
    state.openKeys = matched.slice(1, matched.length - 1).map((item: any) => item.name);
  }

  setRoutes();
});
</script>

<style lang="scss" scoped>
.MenuView {
  width: 100%;
  height: calc(100vh - 64px - 48px);
  overflow-y: auto;
}

:deep(.ant-menu-title-content) {
  text-align: start;
}

.menu-icon {
  margin-right: 8px;
  font-size: 16px;
}
</style>