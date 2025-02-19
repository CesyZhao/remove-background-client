<script setup lang="ts">
import { Ref, ref, watch } from 'vue'

import bridge from '@ipc/Bridge'
import vClickOutside from '@directives/click-outside'
import { FileSelectorType } from '@common/definitions/bridge'
import { ISetting } from '@common/definitions/setting';


const visible = defineModel()

const { setting: settingModule, file } = bridge.modules

const setting = settingModule.getSetting()

console.log(settingModule, '---------------------')

const appSetting: Ref<ISetting> = ref(setting)

const chooseTargetPath = async () => {
  const result = await file.pickFileOrDirectory([FileSelectorType.Folder])
  appSetting.value.targetPath = result
}

const handlePopoverVisibleChange = () => {
  visible.value = !visible.value
}

const closePopover = () => {
  visible.value = false
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
  <div v-click-outside="closePopover">
    <span class="iconfont icon-setting" @click="handlePopoverVisibleChange"></span>
    <Transition>
      <div v-show="visible" class="setting-popper" >
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
  </div>
</template>

<style scoped lang="less">
.icon-setting {
  font-size: 24px;
  position: fixed;
  top: 16px;
  right: 16px;
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
../ipc/Setting