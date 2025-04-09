<template>
  <a-config-provider :locale="zhCN" :theme="state.theme">
    <router-view></router-view>
  </a-config-provider>
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import {reactive} from "vue";

dayjs.locale("zh-cn");

interface stateType {
  theme: object
}

const state = reactive(<stateType>{
  theme: {
    token: {
      colorPrimary: '#46B180',
      colorLink: '#46B180',
    }
  }
})
</script>
<style lang="scss">
html, body {
  height: 100%;
}

#app {
  height: 100%;
  overflow: hidden;
}

::-webkit-scrollbar {
  width: 0.107rem;
  height: 0.107rem;
  background-color: rgba(0, 0, 0, .2);
}

::-webkit-scrollbar-track {
  // -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 0.133rem;
  background-color:#F6F7FA;
}

::-webkit-scrollbar-thumb {
  border-radius: 0.133rem;
  -webkit-box-shadow: inset 0 0 6px rgba(103, 103, 103, 0.3);
  background-color: #f7f4f4;
}

.ant-modal-root div[aria-hidden="true"] {
  display: none !important;
}

.ant-modal-content {
  padding: 0 !important;

  .ant-modal-close {
    top: 10px;
    color: #FFFFFF;
  }

  .ant-modal-header {
    background-color: #46B180;
    padding: 10px 20px;
    margin-bottom: 0;

    .ant-modal-title {
      color: #FFFFFF;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .ant-modal-body {
    padding: 20px;
  }

  .ant-modal-footer {
    margin-top: 0;
    padding: 0 20px 10px 20px;
  }
}

input:-webkit-autofill {

  -webkit-box-shadow: 0 0 0 1000px white inset;

  -webkit-text-fill-color: #333;

}
.ant-btn,.ant-input-affix-wrapper{
  border-radius: 2px;
}
.ant-select-single .ant-select-selector {
  border-radius: 2px;
}
.ant-input-number .ant-input-number-input {
  border-radius: 2px;
}
.ant-picker {
  border-radius: 2px;
}
::-webkit-scrollbar {
  width: 6.5px;
  height: 6.5px;
}
.ant-tabs-card.ant-tabs-top >.ant-tabs-nav .ant-tabs-tab {
  border-radius: 10px 10px 0 0;
}
.ant-menu-light.ant-menu-inline .ant-menu-sub.ant-menu-inline{
  background: rgba(70, 177, 128, 0.08);
}
.ant-tabs-tab.ant-tabs-tab-with-remove{
  // background: #E0E2E4 !important;
}
</style>
