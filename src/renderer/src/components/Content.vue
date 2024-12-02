<script setup lang="ts">
import { ref } from 'vue'
import DynamicButton from './DynamicButton.vue'
import settings from '../models/Settings'
import { Message } from '@arco-design/web-vue'
import '@arco-design/web-vue/es/message/style/css.js'

const emit = defineEmits(['showSetting'])

const input = ref()

const dragover = ref(false)

const handleFileUpload = () => {
  handleFilesChange()

  // input.value.click()
}

const handleFileChange = (e) => {
  const { files } = e.target
  console.log(files, '==========')
}

const handleFilesChange = () => {
  const targetPath = settings.getSetting('targetPath')
  if (targetPath === '') {
    Message.error({
      content: '请先在设置中选择存储路径',
      duration: 3000,
      onClose() {
        emit('showSetting')
      }
    })
  }
}
</script>

<template>
  <div
    class="content"
    :class="{ dragover: dragover }"
    @dragenter="dragover = true"
    @dragleave="dragover = false"
    @drop="handleFilesChange"
  >
    上传一张图片以消除背景
    <dynamic-button class="content-button" @click="handleFileUpload">上传图片</dynamic-button>
    <input ref="input" type="file" class="content-trigger" @change="handleFileChange" />
    <div class="content-tip">或者拖放一个文件、粘贴图片或 URL。</div>
  </div>
</template>

<style lang="less" scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  width: 800px;
  height: 420px;
  &.dragover {
    border-radius: 8px;
    border: 1px solid;
    border-image: linear-gradient(var(--theme-color-1), var(--theme-color-2), var(--theme-color-3))30 30;
    animation: light 3s linear infinite;
  }
  &-trigger {
    display: none;
  }
  &-button {
    padding: 8px 24px;
    font-size: 16px;
    margin: 24px;
    border-radius: 32px;
    cursor: pointer;
  }
  &-tip {
    font-size: 12px;
  }
}
@keyframes light {

  0% {filter: hue-rotate(0deg);/*色调旋转*/}

  20% {filter: hue-rotate(100deg);/*色调旋转*/}

  40% {filter: hue-rotate(200deg);/*色调旋转*/}

  100% {filter: hue-rotate(360deg);/*色调旋转*/}

}

</style>
