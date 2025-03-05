<script setup lang="ts">
import { IconQuestionCircleFill } from '@arco-design/web-vue/es/icon'
import { Ref, ref, onMounted } from 'vue'
import { ISetting, ISettingItem } from '@common/definitions/setting'
import bridge from '@ipc/Bridge'
import vClickOutside from '@directives/click-outside'
import { FileSelectorType } from '@common/definitions/bridge'

const { settingModule, fileModule } = bridge.modules

const visible = defineModel<boolean>()
const appSetting: Ref<ISetting[]> = ref([])

// 添加缺失的方法
const handlePopoverVisibleChange = () => {
  visible.value = !visible.value
}

const closePopover = () => {
  visible.value = false
}

// 修改类型定义
const handlePathSelect = async (setting: ISettingItem) => {
  const { result: path } = await fileModule.pickFileOrDirectory([FileSelectorType.Folder])
  if (path) {
    await handleValueChange(setting.key, path)
  }
}

const initSettings = async () => {
  try {
    const settingsData = settingModule.getSetting()
    appSetting.value = settingsData
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

const handleValueChange = async (key: string, value) => {
  try {
    await settingModule.writeSetting(key, value)
    await initSettings()
  } catch (error) {
    console.error('Failed to save setting:', error)
  }
}

onMounted(() => {
  initSettings()
})
</script>

<template>
  <div v-click-outside="closePopover">
    <span class="iconfont icon-setting" @click="handlePopoverVisibleChange"></span>
    <Transition name="modal">
      <div v-show="visible" class="setting-mask">
        <div class="setting-popper">
          <div class="setting-header">
            <h2>设置</h2>
            <a-button type="text" @click="closePopover">
              <template #icon><icon-close /></template>
            </a-button>
          </div>
          <div class="setting-content">
            <div v-for="category in appSetting" :key="category.category" class="setting-category">
              <h3 class="category-title">{{ category.title }}</h3>
              <div v-for="setting in category.settings" :key="setting.key" class="setting-item">
                <div class="setting-item-label">
                  <a-tooltip position="top">
                    <template #content>
                      {{ setting.description }}
                    </template>
                    {{ setting.title }}
                    <icon-question-circle-fill class="tip-icon" />
                  </a-tooltip>
                </div>
                <div class="setting-item-content">
                  <template v-if="setting.type === 'path'">
                    <a-input v-model="setting.value" readonly size="small">
                      <template #append>
                        <span class="clickable" @click="handlePathSelect(setting)">选择</span>
                      </template>
                    </a-input>
                  </template>

                  <a-select
                    v-else-if="setting.type === 'select'"
                    v-model="setting.value"
                    size="small"
                    @change="(value) => handleValueChange(setting.key, value)"
                  >
                    <a-option v-for="option in setting.options" :key="option" :value="option">
                      {{ option }}
                    </a-option>
                  </a-select>

                  <a-switch
                    v-else-if="setting.type === 'boolean'"
                    v-model="setting.value"
                    size="small"
                    @change="(value) => handleValueChange(setting.key, value)"
                  />

                  <div v-else-if="setting.type === 'number'" class="slider-wrapper">
                    <a-slider
                      v-model="setting.value"
                      :min="setting.min"
                      :max="setting.max"
                      :step="1"
                      size="small"
                      @change="(value) => handleValueChange(setting.key, value)"
                    />
                  </div>

                  <a-input
                    v-else-if="setting.type === 'color'"
                    v-model="setting.value"
                    type="color"
                    size="small"
                    @change="(value) => handleValueChange(setting.key, value)"
                  />
                </div>
              </div>
            </div>
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
  right: 24px;
  cursor: pointer;
  color: var(--color-text-2);
  transition: all 0.3s ease;

  &:hover {
    transform: rotate(30deg);
    color: rgb(var(--primary-6));
  }
}

.setting-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

.setting-popper {
  position: relative;
  width: 480px;
  max-height: 90vh;
  background: var(--color-bg-1);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
}

.setting-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-1);
  }
}

.setting-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.setting-category {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }

  .category-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-1);
    margin-bottom: 20px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--color-border);
  }
}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  &-label {
    width: 120px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--color-text-2);

    .tip-icon {
      font-size: 14px;
      color: var(--color-text-3);
      opacity: 0.6;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: var(--color-text-2);
        opacity: 1;
      }
    }
  }

  &-content {
    flex: 1;
    margin-left: 24px;
  }
}

.clickable {
  cursor: pointer;
  color: rgb(var(--primary-6));
  
  &:hover {
    color: rgb(var(--primary-5));
  }
}

.slider-wrapper {
  padding: 6px 0;
}

// 弹窗动画
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
  
  .setting-popper {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  
  .setting-popper {
    transform: scale(0.95) translateY(20px);
  }
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  
  .setting-popper {
    transform: scale(1) translateY(0);
  }
}
</style>
