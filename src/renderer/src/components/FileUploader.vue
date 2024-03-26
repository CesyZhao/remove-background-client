<script setup lang="ts">

import DynamicButton from './DynamicButton.vue'
</script>

<template>
  <div class="file-uploader">
    上传一张图片以消除背景
<!--    <div class="file-uploader-button">-->
<!--      -->
<!--    </div>-->
    <dynamic-button class="file-uploader-button">上传图片</dynamic-button>
    <div class="file-uploader-tip">
      或者拖放一个文件、粘贴图片或 URL。
    </div>
  </div>
</template>

<style lang="less" scoped>
  .file-uploader {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 20px;
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
