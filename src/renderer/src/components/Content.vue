<script setup lang="ts">
import { ref, nextTick } from 'vue'
import bridge from '@ipc/Bridge'
import { FileSelectorType } from '@common/definitions/bridge'
import DynamicButton from './DynamicButton.vue'

const { fileModule } = bridge.modules

const previewUrl = ref('')
const processedUrl = ref('')
const processing = ref(false)

interface ImageItem {
  id: string
  previewUrl: string
  processedUrl: string
  processing: boolean
  name: string
}

const imageList = ref<ImageItem[]>([])
const loading = ref(false)

const currentImage = ref<ImageItem | null>(null)

const selectImage = (image: ImageItem) => {
  currentImage.value = image
}

const handleSelectFile = async () => {
  try {
    loading.value = true
    const imagePath = await fileModule.pickFileOrDirectory([FileSelectorType.SingleFile])

    if (imagePath) {
      const preview = await fileModule.getImagePreview(imagePath)
      const newImage: ImageItem = {
        id: Date.now().toString(),
        previewUrl: preview,
        processedUrl: '',
        processing: true,
        name: imagePath.split('/').pop() || '未命名'
      }
      imageList.value.push(newImage)
      currentImage.value = newImage
      
      const processed = await fileModule.removeBackground(imagePath)
      const index = imageList.value.findIndex(item => item.id === newImage.id)
      if (index !== -1) {
        imageList.value[index].processedUrl = processed
        setTimeout(() => {
          imageList.value[index].processing = false
        }, 100)
      }
    }
  } catch (error) {
    console.error('处理图片失败:', error)
  } finally {
    loading.value = false
  }
}

const removeImage = (id: string) => {
  const index = imageList.value.findIndex(item => item.id === id)
  if (index !== -1) {
    imageList.value.splice(index, 1)
  }
}

const resetImage = () => {
  previewUrl.value = ''
  processedUrl.value = ''
  processing.value = false
}
</script>

<template>
  <div class="content">
    <div class="main-content">
      <template v-if="imageList.length === 0">
        <div class="empty-state">
          <DynamicButton :loading="loading" @click="handleSelectFile">选择图片</DynamicButton>
          <p class="tip">支持 jpg、png 格式的图片</p>
        </div>
      </template>
      <template v-else>
        <div class="preview-area">
          <div class="toolbar">
            <div class="tool-group">
              <a-button class="tool-button">
                <template #icon><icon-plus /></template>
                背景
                <a-tag size="small" class="tag">新的</a-tag>
              </a-button>
              <a-button class="tool-button">
                <template #icon><icon-refresh /></template>
                擦除/恢复
              </a-button>
              <a-button class="tool-button">
                <template #icon><icon-image /></template>
                效果
              </a-button>
              <a-button class="tool-button">
                <template #icon><icon-palette /></template>
                创建设计
              </a-button>
            </div>
            <div class="actions">
              <a-button-group>
                <a-button>
                  <template #icon><icon-undo /></template>
                </a-button>
                <a-button>
                  <template #icon><icon-redo /></template>
                </a-button>
              </a-button-group>
              <a-button type="primary">
                下载
                <template #icon><icon-down /></template>
              </a-button>
            </div>
          </div>
          <div class="image-wrapper" :class="{ processing: currentImage?.processing }">
            <div class="checkerboard-background"></div>
            <div class="image-layer preview-layer" :class="{ hidden: currentImage?.processedUrl }">
              <img :src="currentImage?.previewUrl" class="preview-image" />
            </div>
            <div class="image-layer processed-layer">
              <img
                v-if="currentImage?.processedUrl"
                :src="currentImage?.processedUrl"
                class="processed-image"
                :class="{ 'fade-in': !currentImage?.processing }"
              />
            </div>
            <div v-if="currentImage?.processing" class="processing-mask">
              <a-spin dot size="large" />
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="image-list" v-if="imageList.length">
      <div class="add-button" @click="handleSelectFile">
        <icon-plus />
      </div>
      <div
        v-for="item in imageList"
        :key="item.id"
        class="list-item"
        :class="{ active: currentImage?.id === item.id }"
        @click="selectImage(item)"
      >
        <div class="thumbnail">
          <img :src="item.processedUrl || item.previewUrl" />
          <div v-if="item.processing" class="processing-indicator">
            <a-spin dot />
          </div>
          <div class="hover-mask">
            <a-button type="text" class="delete-btn" @click.stop="removeImage(item.id)">
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  min-height: 0;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  .tip {
    color: var(--color-text-3);
    font-size: 14px;
  }
}

.preview-area {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 24px;
  
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .tool-group {
      display: flex;
      gap: 8px;

      .tag {
        margin-left: 4px;
        background: var(--color-primary-light-1);
        border: none;
        color: #fff;
      }
    }

    .actions {
      display: flex;
      gap: 8px;
    }
  }

  .image-wrapper {
    flex: 1;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    min-height: 0;
    width: 600px;
    height: 450px;

    .checkerboard-background {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
        linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
      background-size: 16px 16px;
      background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
      z-index: 1;
    }

    .image-layer {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;

      &.preview-layer {
        &.hidden {
          opacity: 0;
        }
      }

      &.processed-layer {
        z-index: 3;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transition: opacity 0.8s ease;
      }
    }

    .processed-image {
      opacity: 0;
      
      &.fade-in {
        opacity: 1;
      }
    }

    .processing-mask {
      position: absolute;
      inset: 0;
      z-index: 4;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.image-list {
  height: 60px;
  min-height: 60px;
  border-top: 1px solid var(--color-border);
  padding: 8px 12px;
  display: flex;
  gap: 8px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-fill-3);
    border-radius: 2px;
  }

  .add-button {
    width: 44px;
    height: 44px;
    border: 1px dashed var(--color-border-2);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    color: var(--color-text-3);
    transition: all 0.3s;

    &:hover {
      border-color: var(--color-primary-light-4);
      color: var(--color-primary);
      background: var(--color-fill-2);
    }
  }

  .list-item {
    width: 44px;
    flex-shrink: 0;
    cursor: pointer;
    
    .thumbnail {
      width: 44px;
      height: 44px;
      border: 1px solid var(--color-border-2);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
      transition: all 0.3s;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .processing-indicator {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .hover-mask {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;

        .delete-btn {
          color: #fff;
          
          &:hover {
            color: var(--color-primary-light-4);
          }
        }
      }

      &:hover .hover-mask {
        opacity: 1;
      }
    }

    &.active .thumbnail {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 1px var(--color-primary);
    }

    &:hover .thumbnail {
      border-color: var(--color-primary-light-4);
    }
  }
}
</style>
