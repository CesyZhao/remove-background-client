<script setup lang="ts">
import { IconQuestionCircleFill } from '@arco-design/web-vue/es/icon'
import { Ref, ref, watch, onMounted } from 'vue'
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
  const result = await fileModule.pickFileOrDirectory([FileSelectorType.Folder])
  if (result) {
    setting.value = result
    await handleValueChange(setting.key, result)
  }
}

const initSettings = async () => {
  try {
    const settingsData = await settingModule.getSetting()
    appSetting.value = settingsData
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

const handleValueChange = async (key: string, value: any) => {
  try {
    await settingModule.writeSetting(key, value)
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
    <Transition>
      <div v-show="visible" class="setting-popper">
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
              <!-- 路径选择 -->
              <template v-if="setting.type === 'path'">
                <a-input v-model="setting.value" readonly size="small">
                  <template #append>
                    <span class="clickable" @click="handlePathSelect(setting)">选择</span>
                  </template>
                </a-input>
              </template>

              <!-- 下拉选择 -->
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

              <!-- 布尔值 -->
              <a-switch
                v-else-if="setting.type === 'boolean'"
                v-model="setting.value"
                size="small"
                @change="(value) => handleValueChange(setting.key, value)"
              />

              <!-- 数字输入 -->
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

              <!-- 颜色选择 -->
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
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  background-color: #fff;
  padding: 24px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 8px;
  background: var(--color-background);
  box-shadow: 0 0 2px 0 var(--theme-color-3);
  z-index: 99;
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
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
