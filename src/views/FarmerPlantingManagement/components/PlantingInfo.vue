<template>
  <a-modal v-model:open="open" :title="modalTitle" :maskClosable="false" width="1100px" :footer="null"
    :style="{ height: '80vh' }">
    <div style="max-height: calc(80vh - 110px); overflow-y: auto;">
      <a-collapse class="collapse" v-model:activeKey="activeKey" :bordered="false">
        <a-collapse-panel key="1" :showArrow="false">
          <template #header>
            <div class="header">
              <div class="title" style="width: 380px"><span class="icon">●</span>农户信息 （创建时间：{{ createDate }}）
              </div>
              <a-divider style="width: calc(100% - 380px);min-width: calc(100% - 380px)" class="divider" />
              <div>
                <div class="extra" v-if="!activeKey.includes('1')">展开
                  <DownCircleOutlined class="icon" />
                </div>
                <div class="extra" v-else>收起
                  <UpCircleOutlined class="icon" />
                </div>
              </div>
            </div>
          </template>
          <a-table :dataSource="farmerInfoDataSource" :columns="farmerInfoColumns" :pagination="false"
            :scroll="{ x: 1200 }" @resizeColumn="handleResizeColumn" />
        </a-collapse-panel>
        <a-collapse-panel key="2" :showArrow="false">
          <template #header>
            <div class="header">
              <div class="title"><span class="icon">●</span>种植信息</div>
              <a-divider class="divider" />
              <div>
                <div class="extra" v-if="!activeKey.includes('2')">展开
                  <DownCircleOutlined class="icon" />
                </div>
                <div class="extra" v-else>收起
                  <UpCircleOutlined class="icon" />
                </div>
              </div>
            </div>
          </template>
          <a-table :dataSource="plantingInfoDataSource" :columns="plantingInfoColumns" :scroll="{ x: 1200 }"
            :pagination="false" @resizeColumn="handleResizeColumn" />
          <a-flex wrap="wrap" gap="large">
            <div v-for="(item, index) in images" :key="index" class="imageItem">
              <div class="name">{{ item.name }}</div>
              <div class="images">
                <a-image-preview-group>
                  <a-image v-for="(image, i) in item.images" :key="i" :width="80" :src="image" />
                </a-image-preview-group>
              </div>
            </div>
          </a-flex>
        </a-collapse-panel>
        <a-collapse-panel key="3" :showArrow="false" v-if="type">
          <template #header>
            <div class="header">
              <div class="title"><span class="icon">●</span>变更记录</div>
              <a-divider class="divider" />
              <div>
                <div class="extra" v-if="!activeKey.includes('3')">展开
                  <DownCircleOutlined class="icon" />
                </div>
                <div class="extra" v-else>收起
                  <UpCircleOutlined class="icon" />
                </div>
              </div>
            </div>
          </template>
          <div v-if="changeLogList.length" class="folded" v-for="(item, index) in changeLogList" :key="index">
            <div class="folded-header" @click="item.isShow = !item.isShow">
              <CaretDownOutlined v-if="item.isShow" />
              <CaretRightOutlined v-else />
              <div class="date">变更: {{ item.createTime }}</div>
              <div class="changeConfirmation" v-if="item.confirmBy">
                <CheckCircleFilled class="CheckCircleFilled" />
                变更确认: {{ item.confirmBy }} {{ item.confirmTime }}
              </div>
            </div>
            <div v-if="item.isShow" class="folded-content">
              <a-flex wrap="wrap" gap="large" v-if="item.changeContent">
                <div class="changeContent" v-for="(value, key) in item.changeContent" :key="key">
                  <div class="title">{{ key.replace(/\*\*/g, '') }}：</div>
                  <div class="content">{{ value }}</div>
                </div>
              </a-flex>
              <a-flex v-if="item.images && item.images.length" wrap="wrap" gap="large">
                <div v-for="(item, index) in item.images" :key="index" class="imageItem">
                  <div class="name">{{ item.fileType }}</div>
                  <div class="images">
                    <a-image v-for="(image, i) in item.images" :key="i" :width="80" :src="image" />
                  </div>
                </div>
              </a-flex>
            </div>
          </div>
          <div v-else>
            <a-empty :image="simpleImage" />
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import {
  CaretDownOutlined,
  CaretRightOutlined,
  CheckCircleFilled,
  DownCircleOutlined,
  UpCircleOutlined
} from "@ant-design/icons-vue";
import { ref, toRefs } from 'vue'
import { Empty } from 'ant-design-vue';
import MappingTables from "@/views/FarmerPlantingManagement/components/MappingTables.ts";
import { previewFile } from '@/views/RubberTradeQuery/api';

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
const props = defineProps<{
  type: boolean;
}>();
const { type } = toRefs(props)

const open = ref<boolean>(false);
const modalTitle = ref<string>('种植信息');
const createDate = ref<string>('')
const activeKey = ref(['1']);
const farmerInfoDataSource = ref([])
const farmerInfoColumns = ref([
  { title: '被保险人姓名/单位名称', dataIndex: 'farmerName', key: 'farmerName', align: 'center', resizable: true, width: 250 },
  { title: '身份证号码/营业执照编号', dataIndex: 'cardNo', key: 'cardNo', align: 'center', resizable: true, width: 180 },
  { title: '证件类型', dataIndex: 'cardTypeCnm', key: 'cardTypeCnm', align: 'center', resizable: true, width: 180 },
  { title: '被保险人所在地址', dataIndex: 'farmerAddress', key: 'farmerAddress', align: 'center', resizable: true, width: 180 },
  { title: '联系人(单位投保)', dataIndex: 'linkerName', key: 'linkerName', align: 'center', resizable: true, width: 180 },
  { title: '手机号', dataIndex: 'linkerPhone', key: 'linkerPhone', align: 'center', resizable: true, width: 180 },
  { title: '邮箱地址', dataIndex: 'linkerEmail', key: 'linkerEmail', align: 'center', resizable: true, width: 180 },
  { title: '银行卡号/账号', dataIndex: 'bankAccountNo', key: 'bankAccountNo', align: 'center', resizable: true, width: 180 },
  { title: '开户银行名称', dataIndex: 'bankName', key: 'bankName', align: 'center', resizable: true, width: 180 },
])
const plantingInfoDataSource = ref([])
const plantingInfoColumns = ref([
  {
    title: '土地经营方式(自有/租赁/承包)', dataIndex: 'landOperation', key: 'landOperation', align: 'center', resizable: true, width: 200
  },
  { title: '种植地点', dataIndex: 'plantAddress', key: 'plantAddress', align: 'center', resizable: true, width: 180 },
  { title: '种植面积(亩)', dataIndex: 'plantArea', key: 'plantArea', align: 'center', resizable: true, width: 180 },
  { title: '其中:树龄8年以上的面积(亩)', dataIndex: 'plant8Area', key: 'plant8Area', align: 'center', resizable: true, width: 200 },
  { title: '种植保险投保面积(亩)', dataIndex: 'plantInsuranceArea', key: 'plantInsuranceArea', align: 'center', resizable: true, width: 180 },
  { title: '收入保险投保面积(亩)', dataIndex: 'incomeInsuranceArea', key: 'incomeInsuranceArea', align: 'center', resizable: true, width: 180 },
])
// 定义 fileType 到 name 的映射
const fileTypeToName = {
  CARD: '身份证/营业执照',
  BANK: '银行卡(账户信息)',
  FOREST: '林权证',
  CONTRACT: '承包合同',
  LAND_CONTRACT: '土地流转合同',
  OTHER: '其他证明材料'
};
const handleResizeColumn = (w: number, column: any) => {
  column.width = w;
};
const images = ref([])
const changeLogList = ref([])
const initialize = async (title: string, data: any, changeRecords?: any[]) => {
  if (!data) {
    open.value = true;
    return;
  }

  farmerInfoDataSource.value = [data];
  plantingInfoDataSource.value = data.farmerPlants || [];
  createDate.value = data.createDate || '';
  modalTitle.value = title;

  if (data?.attachments) {
    images.value = await Promise.all(
      data.attachments.reduce((acc, { fileType, fileId }) => {
        const name = fileTypeToName[fileType] || fileType;
        const category = acc.find(c => c.fileType === fileType) || { name, images: [], fileType };
        if (fileId) {
          category.images.push(
            previewFile(fileId).then(blob => URL.createObjectURL(blob))
          );
        }
        if (!acc.includes(category)) {
          acc.push(category);
        }
        return acc;
      }, [])
        .map(async category => ({
          ...category,
          images: await Promise.all(category.images)
        }))
    );
  }

  if (changeRecords?.length) {
    Promise.all(changeRecords.map((item: any) => {
      try {
        const content = typeof item.changeContent === 'string'
          ? JSON.parse(item.changeContent)
          : item.changeContent || {};

        item.changeContent = {};

        if (content.farmer) {
          content.farmer.forEach((change: any) => {
            item.changeContent[change.propertyName] = `${change.origValue} → ${change.newValue}`;
          });
        }

        if (content.plants) {
          content.plants.forEach((plant: any, index: number) => {
            if (plant.correctType === '1') {
              // 处理修改类型
              item.changeContent[plant.propertyName] = `${plant.origValue} → ${plant.newValue}`;
            } else {
              // 保持原有新增/删除的处理逻辑
              const prefix = plant.correctType === '0' ? '新增' : '删除';
              item.changeContent[`种植信息 ${index + 1}`] = `${prefix}: ${plant.correctMessage}`;
            }
          });
        }

        const attachments = content.attachments || [];

        if (attachments.length) {
          const fileChanges = {
            added: [],
            deleted: []
          };

          return Promise.all(attachments.map(async (file) => {
            if (file.correctType === '0' || file.correctType === '2') {
              const fileId = file.correctType === '0' ? file.changeFileId : file.origFileId;
              try {
                const blob = await previewFile(fileId);
                const url = URL.createObjectURL(blob);

                if (file.correctType === '0') {
                  fileChanges.added.push({
                    fileType: file.changeFileTypeName,
                    url: url
                  });
                } else if (file.correctType === '2') {
                  fileChanges.deleted.push({
                    fileType: file.origFileTypeName,
                    url: url
                  });
                }
              } catch (error) {
                console.error('Error previewing file:', error);
              }
            }
          })).then(() => {
            item.images = [];
            if (fileChanges.added.length) {
              item.images.push({
                fileType: '新增附件',
                images: fileChanges.added.map(f => f.url)
              });
            }
            if (fileChanges.deleted.length) {
              item.images.push({
                fileType: '删除附件',
                images: fileChanges.deleted.map(f => f.url)
              });
            }
            item.isShow = false;
            return item;
          });
        }

        item.isShow = false;
        return Promise.resolve(item);

      } catch (error) {
        console.error('Error processing change record:', error);
        return Promise.resolve({
          ...item,
          changeContent: {},
          isShow: false
        });
      }
    })).then(results => {
      changeLogList.value = results;
    });
  } else {
    changeLogList.value = [];
  }

  open.value = true;
};
const setLabel = (key: string) => {
  return MappingTables.mappingTables[key]
}
const setValue = (key: string, value: string) => {
  console.log(key)
  return MappingTables[key][value]
}
defineExpose({ initialize })
</script>

<style lang="scss" scoped>
.collapse {
  background-color: #FFFFFF;

  :deep(.ant-collapse-item) {
    border: none !important;

    .ant-collapse-header {
      padding: 10px 0 !important;
    }
  }

  :deep(.ant-collapse-item):first-child {
    .ant-collapse-header {
      padding-top: 0 !important;
    }
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title {
    width: 80px;
    font-size: 14px;
    font-weight: 500;
    color: #3D3D3D;

    .icon {
      margin-right: 8px;
      color: #46B180;
    }
  }

  .divider {
    width: calc(100% - 160px);
    min-width: calc(100% - 160px);
    margin: 0;
  }
}

.extra {
  width: 60px;
  text-align: right;
  font-size: 14px;
  font-weight: 500;
  color: #46B180;

  .icon {
    margin-left: 8px;
  }
}

::v-deep .ant-table-thead tr {
  height: 42px;

  .ant-table-cell {
    background-color: #F6F7FA;
    font-size: 14px;
    padding: 0;
    color: #333333;
    font-weight: 600;
  }
}

.ant-flex {
  margin-top: 10px;
}

.imageItem {
  .name {
    font-size: 14px;
    color: #5E5F61;
    font-weight: 400;
    margin-bottom: 10px;
  }

  .images {
    :deep(.ant-image) {
      margin-right: 10px;

      &:last-child {
        margin-right: 0;
      }
    }
  }
}

.folded {
  background-color: #F8F8F9;
  width: 100%;
  margin-bottom: 10px;
  padding: 10px 20px;
  border-radius: 2px;

  &:last-child {
    margin-bottom: 0;
  }

  &-header {
    width: 100%;
    cursor: pointer;
    display: flex;
    align-items: center;

    .date,
    .changeConfirmation {
      margin-left: 10px;
      margin-right: 100px;
      font-size: 14px;
      color: #333333;

      .CheckCircleFilled {
        margin-right: 8px;
        color: #46B180;
      }
    }
  }

  &-content {
    margin-top: 10px;
  }
}

.changeContent {
  display: flex;
  margin-bottom: 8px;
  width: 100%;

  .title {
    font-weight: bold;
    white-space: nowrap;
    margin-right: 8px;
  }

  .content {
    white-space: pre-line;
  }
}

.ant-flex-gap-large {
  gap: 4px !important;
}
</style>
