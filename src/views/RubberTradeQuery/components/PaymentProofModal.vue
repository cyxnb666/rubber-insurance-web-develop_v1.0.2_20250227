<template>
  <a-modal :open="open" title="支付凭证" @cancel="handleCancel" :footer="null" :width="900" :maskClosable="false">
    <div class="image-container">
      <a-image-preview-group>
        <div class="image-grid">
          <div v-for="(image, index) in images" :key="index" class="image-item">
            <a-image :src="image.src">
              <template #previewMask>
                <div class="preview">
                  <EyeOutlined/>
                  预览
                </div>
                <div @click.stop="downloadFn(image.fileId)">
                  <VerticalAlignBottomOutlined/>
                  下载
                </div>
              </template>
            </a-image>
          </div>
        </div>
      </a-image-preview-group>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import {EyeOutlined, VerticalAlignBottomOutlined} from '@ant-design/icons-vue';
import {nextTick, ref, watch} from 'vue';
import {downloadFile, previewFile} from '../api';

const props = defineProps<{
  open: boolean;
  fileIds: string[];
}>();
const images = ref<string[]>([]);
const downloadFn = (fileId: string) => {
  console.log('downloadFn', fileId)
  downloadFile(fileId, `${fileId}.jpg`).then((res) => {
    console.log(res)
  })
}
const setDownloadIcon = (): void => {
  nextTick(() => {
    const dom = document.querySelector('.ant-image-preview-operations');
    const downloadIcon = document.querySelector('.downloadIcon');
    if (!downloadIcon) {
      dom?.insertAdjacentHTML('beforeend', '<li class="ant-image-preview-operations-operation downloadIcon"><span role="img" aria-label="swap" class="anticon anticon-swap ant-image-preview-operations-icon"><svg t="1736995752819" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1526" width="18" height="18"><path d="M921.84736468 997.93033544H101.54506534c-24.68943392 0-44.71162586-20.00838352-44.71162584-44.71162585V631.455181c0-24.70324234 20.02219194-44.71162586 44.71162584-44.71162585s44.71162586 20.00838352 44.71162586 44.71162585v277.05190275h730.87904765V631.455181c0-24.70324234 20.02219194-44.71162586 44.71162583-44.71162585 24.68943392 0 44.71162586 20.00838352 44.71162586 44.71162585V953.21870959c0 24.70324234-20.02219194 44.71162586-44.71162586 44.71162585z" fill="#ffffff" p-id="1527"></path><path d="M511.69621502 839.9897621c-24.68943392 0-44.71162586-20.00838352-44.71162585-44.71162585V70.54383027c0-24.70324234 20.02219194-44.71162586 44.71162585-44.71162586s44.71162586 20.00838352 44.71162585 44.71162586v724.73430598c0 24.70324234-20.02219194 44.71162586-44.71162585 44.71162585z" fill="#ffffff" p-id="1528"></path><path d="M511.69621502 869.73307344c-14.37455297 0-27.92060144-6.93182094-36.30230524-18.61373431L323.62569491 639.87831001c-14.41597819-20.04980875-9.84539506-47.998027 10.21822209-62.41400518 20.02219194-14.37455297 47.94279339-9.85920347 62.3863884 10.21822208l115.47971803 160.70225499 115.45210121-160.68844659c14.443595-20.09123397 42.37800485-24.60658347 62.38638839-10.23203048 20.04980875 14.41597819 24.62039188 42.33657964 10.21822208 62.40019679l-151.75440644 211.2272207a44.65639221 44.65639221 0 0 1-36.31611365 18.64135112z" fill="#ffffff" p-id="1529"></path></svg></span></li>');
      console.log(downloadIcon)
    }
  })
};
const loadImages = async () => {
  try {
    const imagePromises: Promise<string>[] = props.fileIds.map(async (fileId: string) => {
      const blob: any = await previewFile(fileId);
      return {
        src: URL.createObjectURL(blob),
        fileId: fileId
      };
    });

    images.value = await Promise.all(imagePromises);
  } catch (error) {
    console.error('加载图片失败:', error);
  }
};

watch(() => props.open, (newVal) => {
  if (newVal && props.fileIds?.length) {
    loadImages();
  } else {
    images.value.forEach(url => URL.revokeObjectURL(url));
    images.value = [];
  }
});

const emit = defineEmits(['update:open']);

const handleCancel = () => {
  images.value = []
  emit('update:open', false);
};
</script>

<style lang="scss" scoped>
.image-container {
  max-height: 600px;
  overflow-y: auto;
  padding: 16px;

  .image-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .image-item {
      position: relative;

      :deep(.ant-image) {
        width: 100%;
        display: block;
      }

      .magnifier-icon {
        position: absolute;
        right: 8px;
        bottom: 8px;
        width: 24px;
        height: 24px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &::after {
          content: '';
          width: 16px;
          height: 16px;
          background-size: contain;
        }
      }
    }
  }
}

.preview {
  margin-right: 10px;
}
</style>