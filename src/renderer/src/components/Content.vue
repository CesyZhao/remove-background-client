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
  name: string,
  path: string
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
        path: '',
        name: imagePath.split('/').pop() || '未命名'
      }
      imageList.value.push(newImage)
      currentImage.value = newImage

      const { base64, path } = await fileModule.removeBackground(imagePath)
      const index = imageList.value.findIndex((item) => item.id === newImage.id)
      if (index !== -1) {
        imageList.value[index].processedUrl = base64
        imageList.value[index].path = path
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
  const index = imageList.value.findIndex((item) => item.id === id)
  if (index !== -1) {
    imageList.value.splice(index, 1)
  }
}

const resetImage = () => {
  previewUrl.value = ''
  processedUrl.value = ''
  processing.value = false
}

// 添加图片尺寸相关的响应式变量
const imageSize = ref({ width: 0, height: 0 })

// 监听图片加载完成事件
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  const maxWidth = 800
  const maxHeight = 600
  const ratio = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight, 1)

  imageSize.value = {
    width: Math.floor(img.naturalWidth * ratio),
    height: Math.floor(img.naturalHeight * ratio)
  }

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
          <div class="preview-content">
            <div
              class="image-wrapper"
              :class="{ processing: currentImage?.processing }"
              :style="{
                width: imageSize.width ? `${imageSize.width}px` : '500px',
                height: imageSize.height ? `${imageSize.height}px` : '375px'
              }"
            >
              <div
                v-if="currentImage?.processedUrl && !currentImage?.processing"
                class="checkerboard-background"
              ></div>
              <div
                class="image-layer preview-layer"
                :class="{ hidden: currentImage?.processedUrl && !currentImage?.processing }"
              >
                <img
                  :src="currentImage?.previewUrl"
                  class="preview-image"
                  @load="handleImageLoad"
                />
              </div>
              <div class="image-layer processed-layer">
                <img
                  :src="currentImage?.processedUrl"
                  class="processed-image"
                  :style="{
                    opacity: currentImage?.processedUrl && !currentImage?.processing ? 1 : 0
                  }"
                />
              </div>
              <div v-if="currentImage?.processing" class="processing-mask">
                <a-spin dot size="large" />
              </div>
            </div>
            <div class="preview-footer">
              <div class="image-actions">
                <a-button-group class="zoom-actions">
                  <a-button>
                    <template #icon><icon-minus /></template>
                  </a-button>
                  <a-button>
                    <template #icon><icon-plus /></template>
                  </a-button>
                </a-button-group>
                <a-button>
                  <template #icon><icon-copy /></template>
                </a-button>
                <a-button>
                  <template #icon><icon-undo /></template>
                </a-button>
                <a-button>
                  <template #icon><icon-redo /></template>
                </a-button>
              </div>
            </div>
          </div>
          <div class="side-tools">
            <a-button class="tool-button">
              <template #icon><icon-plus /></template>
              背景
              <a-tag size="small" class="tag">新的</a-tag>
            </a-button>

            <a-button class="tool-button" @click.stop="removeImage(currentImage?.id || '')">
              <template #icon><icon-delete /></template>
              删除
            </a-button>
          </div>
        </div>
      </template>
    </div>
    <div v-if="imageList.length" class="image-list">
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
            <a-spin :size="12" />
          </div>
          <!-- <div class="hover-mask">
            <a-button type="text" class="delete-btn" @click.stop="removeImage(item.id)">
              <template #icon><icon-delete /></template>
            </a-button>
          </div> -->
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
  gap: 24px;
  padding: 24px;

  .preview-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    .image-wrapper {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      transition:
        width 0.3s,
        height 0.3s;
      // 移除固定宽高
      // width: 500px;
      // height: 375px;

      .processing-mask {
        position: absolute;
        inset: 0;
        z-index: 10;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;

        :deep(.arco-spin) {
          .arco-spin-dot {
            width: 24px;
            height: 24px;
          }
        }
      }

      .checkerboard-background {
        position: absolute;
        inset: 0;
        background-image: linear-gradient(45deg, #f5f5f5 25%, transparent 25%),
          linear-gradient(-45deg, #f5f5f5 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #f5f5f5 75%),
          linear-gradient(-45deg, transparent 75%, #f5f5f5 75%);
        background-size: calc(100% / 25) calc(100% / 25);
        background-position:
          0 0,
          0 calc(100% / 50),
          calc(100% / 50) calc(100% / -50),
          calc(100% / -50) 0;
        z-index: 1;
      }

      .image-layer {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        &.preview-layer {
          z-index: 2;
        }
        &.hidden {
          width: 0;
        }

        &.processed-layer {
          z-index: 3;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: opacity 0.3s ease;
        }
      }

      .image-actions {
        position: absolute;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        z-index: 5;
        background: rgba(255, 255, 255, 0.9);
        padding: 4px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .arco-btn {
          padding: 0 8px;
          height: 32px;
          color: var(--color-text-2);

          &:hover {
            color: rgb(var(--primary-6));
            background: var(--color-fill-2);
          }
        }
      }
    }

    .preview-footer {
      .download-btn {
        min-width: 120px;
        height: 36px;
        border-radius: 18px;
      }
    }
  }

  .side-tools {
    width: 200px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .tool-button {
      width: 100%;
      justify-content: flex-start;
      padding: 8px 16px;
      border-radius: 20px;
      height: 40px;
      background: var(--color-bg-2);
      border: none;

      :deep(.arco-icon) {
        font-size: 18px;
      }

      .tag {
        margin-left: 4px;
        background: rgb(var(--primary-6));
        border: none;
        color: #fff;
        border-radius: 10px;
        padding: 0 6px;
        font-size: 12px;
        line-height: 16px;
      }

      &:hover {
        background: var(--color-fill-2);
      }
    }
  }
}

.image-list {
  height: 60px;
  min-height: 60px;
  border-top: 1px solid var(--color-border);
  padding: 0 12px;
  display: flex;
  align-items: center;
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
