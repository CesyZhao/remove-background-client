<script setup lang="ts">
import { ref, nextTick } from 'vue'
import bridge from '@ipc/Bridge'
import { FileSelectorType } from '@common/definitions/bridge'
import DynamicButton from './DynamicButton.vue'

const { fileModule } = bridge.modules

const previewUrl = ref('')
const processedUrl = ref('')
const processing = ref(false)
const loading = ref(false)

const handleSelectFile = async () => {
  try {
    loading.value = true
    const imagePath = await fileModule.pickFileOrDirectory([FileSelectorType.SingleFile])

    if (imagePath) {
      const preview = await fileModule.getImagePreview(imagePath)
      previewUrl.value = preview
      await nextTick()
      
      processing.value = true
      const processed = await fileModule.removeBackground(imagePath)
      processedUrl.value = processed
      
      // 延迟移除 loading 状态，确保动画顺序正确
      setTimeout(() => {
        processing.value = false
      }, 800)
    }
  } catch (error) {
    console.error('处理图片失败:', error)
  } finally {
    loading.value = false
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
    <template v-if="!previewUrl">
      <div class="empty-state">
        <DynamicButton :loading="loading" @click="handleSelectFile">选择图片</DynamicButton>
        <p class="tip">支持 jpg、png 格式的图片</p>
      </div>
    </template>
    <template v-else>
      <div class="image-container">
        <div class="image-wrapper" :class="{ processing }">
          <div class="checkerboard-background"></div>
          <div class="image-layer preview-layer">
            <img :src="previewUrl" class="preview-image" />
            <div class="background-overlay" :class="{ 'slide-out': processedUrl && !processing }"></div>
          </div>
          <div class="image-layer processed-layer">
            <img v-if="processedUrl" :src="processedUrl" class="processed-image" :class="{ 'fade-in': !processing }" />
          </div>
          <div v-if="processing" class="processing-mask">
            <a-spin dot size="large" />
          </div>
        </div>
        <div class="actions">
          <DynamicButton @click="resetImage">重新选择</DynamicButton>
          <DynamicButton :loading="loading" :disabled="processing" @click="handleSelectFile">
            继续处理
          </DynamicButton>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="less">
.content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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

.image-container {
  max-width: 80%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.image-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  width: 600px;
  height: 400px;
  background: #fff;

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
    
    &.preview-layer {
      z-index: 2;
    }
    
    &.processed-layer {
      z-index: 3;
    }
  }

  .preview-image,
  .processed-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .background-overlay {
    position: absolute;
    inset: 0;
    background: #fff;
    transform: translateX(0);
    transition: transform 0.8s ease;

    &.slide-out {
      transform: translateX(-100%);
    }
  }

  .processed-image {
    opacity: 0;
    transition: opacity 0.8s ease;

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

.actions {
  display: flex;
  gap: 16px;
}
</style>
