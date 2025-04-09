<template>
  <div class="MenuView">
    <a-menu
        v-model:openKeys="state.openKeys"
        v-model:selectedKeys="state.selectedKeys"
        @click="clickMenu"
        mode="inline"
        :items="state.items"
    ></a-menu>
  </div>
</template>

<script lang="ts" setup>
import {reactive, watch, h, onMounted, toRefs} from 'vue';
import {useRouter, useRoute} from 'vue-router'
import {useStore} from "@/store";
import {computed} from "@vue/reactivity";

const router = useRouter()
const store = useStore()
// 动态路由表
const routes = computed(() => store.routes)
const route = useRoute()

interface stateType {
  selectedKeys: string[],
  openKeys: string[],
  preOpenKeys: string[],
  items: Array<any>
}

const state = reactive(<stateType>{
  selectedKeys: [],
  openKeys: [],
  preOpenKeys: [],
  items: []
});
const props = defineProps({
  isCollapse: Boolean
});
const setRoutes = () => {
  const traverse = (array: any): Array<any> => {
    return array.map((item: any) => {
      const {children} = item
      const icon = new URL(`../../../assets/images/${item.meta.icon}.png`, import.meta.url)
      const selectedIcon = new URL(`../../../assets/images/selected_${item.meta.icon}.png`, import.meta.url)
          .href;
      return {
        key: item.name,
        label: item.meta.title,
        title: item.meta.title,
        icon: item.meta.icon ? (value: any) => {
          const selectedKey = state.selectedKeys[0]
          const key = value.children && value.children.length ? value.children.find((item: any) => item.key === selectedKey)?.key : value.key
          if (selectedKey === key) {
            return h('img', {src: selectedIcon, width: '16px', height: '16px'})
          }
          return h('img', {src: icon, width: '16px', height: '16px'})
        } : null,
        children: children && children.length ? traverse(children) : null,
      }
    })
  }
  state.items = traverse(routes.value[0].children)
}
const clickMenu = (item: any) => {
  const {key} = item
  router.push({name: key})
}
watch(
    () => state.openKeys,
    (_val, oldVal) => {
      state.preOpenKeys = oldVal;
    },
);
watch(
    () => route,
    (_val) => {
      state.selectedKeys = [_val.name as string];
    },
    {deep: true, immediate: true}
);
onMounted(() => {
  const {name, matched} = route
  state.selectedKeys = [name as string];
  if (matched.length > 2) {
    state.openKeys = matched.slice(1, matched.length - 1).map((item: any) => item.name)
  }
  setRoutes()
})
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
</style>
