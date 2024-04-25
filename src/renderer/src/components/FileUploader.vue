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
  <div class="file-uploader" :class="{ 'dragover': dragover }" @dragenter="dragover = true" @dragleave="dragover = false" @drop="handleFilesChange">
    上传一张图片以消除背景
    <dynamic-button class="file-uploader-button" @click="handleFileUpload">上传图片</dynamic-button>
    <input ref="input" type="file" class="file-uploader-trigger" @change="handleFileChange" />
    <div class="file-uploader-tip">或者拖放一个文件、粘贴图片或 URL。</div>
  </div>
</template>

<style lang="less" scoped>
.file-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  width: 800px;
  height: 420px;
  &.dragover {
    border: 1px solid red;
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
</style>
