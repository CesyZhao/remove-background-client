<script setup lang="ts">
import { Ref, onMounted, ref, watch } from 'vue'
import settings from '../models/Settings'
import { ISetting } from '../definitions/setting'
import bridge from '../models/Bridge'

const visible = defineModel()


// https://blog.csdn.net/super_ying123/article/details/124285101

const appSetting: Ref<ISetting> = ref(settings.settings)

const chooseTargetPath = async () => {
  const result = await bridge.chooseDirectory()
  appSetting.value.targetPath = result
}

const handleVisibleChange = () => {
  visible.value = !visible.value
}

watch(
  appSetting,
  (newValue) => {
    settings.saveSettings(newValue)
  },
  { deep: true }
)
</script>

<template>
  <span class="iconfont icon-setting" @click="handleVisibleChange"></span>
  <Transition>
    <div v-show="visible" class="setting-popper">
      <div class="setting-item">
        <div class="setting-item-label">存储路径</div>
        <div class="setting-item-content">
          <a-input v-model="appSetting.targetPath">
            <template #append>
              <span class="clickable" @click="chooseTargetPath">选择</span>
            </template>
          </a-input>
        </div>
      </div>
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
  width: 500px;
  height: 350px;
  background-color: #fff;
  padding: 36px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 8px;
  background: var(--color-background);
  box-shadow: 0 0 2px 0 var(--theme-color-3);
}
.setting-item {
  display: flex;
  align-items: center;
  &-content {
    flex: 1;
    margin-left: 24px;
    input[type='file'] {
      display: none;
    }
  }
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
../models/Settings