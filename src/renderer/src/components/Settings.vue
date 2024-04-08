<script setup lang="ts">
import { ref } from 'vue'

const popperVisible = ref(false)


</script>

<template>
  <span class="iconfont icon-setting" @click="popperVisible = !popperVisible"></span>
  <Transition>
    <div class="setting-popper" v-show="popperVisible">
      <a-radio></a-radio>
    </div>
  </Transition>
</template>

<style scoped lang="less">
.icon-setting {
  font-size: 24px;
  position: fixed;
  top: 40px;
  right: 60px;
  cursor: pointer;
}
.setting-popper {
  width: 600px;
  height: 400px;
  background-color: #fff;
  padding: 20px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 8px;
  background: var(--color-background);
  box-shadow: 0 0 2px 0 var(--theme-color-3);
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
