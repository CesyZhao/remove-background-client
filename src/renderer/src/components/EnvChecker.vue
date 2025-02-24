<script setup lang="ts">
import { defineEmits, onMounted, ref } from 'vue'
import bridge from '../ipc/Bridge'
import { EnvStatus } from '@common/definitions/bridge'
import { Message } from '@arco-design/web-vue'

const { envModule } = bridge.modules
const emit = defineEmits(['env-ready'])

const envStatus = ref(EnvStatus.Checking)
const currentStep = ref(0)
const steps = ref([
  {
    title: '基础环境',
    description: '等待检查',
    status: 'wait',
    loading: false
  },
  {
    title: '必要依赖',
    description: '等待检查',
    status: 'wait',
    loading: false
  },
  {
    title: '系统配置',
    description: '等待完成',
    status: 'wait',
    loading: false
  }
])

const checkEnv = async () => {
  try {
    // 基础环境检查
    currentStep.value = 0
    steps.value[0].status = 'process'
    steps.value[0].loading = true
    steps.value[0].description = '检查中...'

    const pythonStatus = await envModule.installPython()

    if (pythonStatus === EnvStatus.PythonNotInstalled) {
      steps.value[0].status = 'error'
      steps.value[0].loading = false
      steps.value[0].description = '基础环境未安装'
      envStatus.value = pythonStatus
      return
    }

    steps.value[0].status = 'finish'
    steps.value[0].loading = false
    steps.value[0].description = '基础环境环境正常'

    // 必要依赖检查
    await new Promise((resolve) => setTimeout(resolve, 500))
    currentStep.value = 1
    steps.value[1].status = 'process'
    steps.value[1].loading = true
    steps.value[1].description = '检查中...'

    const status = await envModule.installRemBG()
    envStatus.value = status

    if (status === EnvStatus.RemBGNotInstalled) {
      steps.value[1].status = 'error'
      steps.value[1].loading = false
      steps.value[1].description = '必要依赖未安装'
      steps.value[2].status = 'error'
      steps.value[2].description = '系统配置未完成'
    } else {
      steps.value[1].status = 'finish'
      steps.value[1].loading = false
      steps.value[1].description = '必要依赖安装成功'

      // 系统配置检查
      await new Promise((resolve) => setTimeout(resolve, 500))
      currentStep.value = 2
      steps.value[2].status = 'finish'
      steps.value[2].description = '系统配置完成'
      emit('env-ready')
    }

    envStatus.value = status
  } catch (e) {
    const failedStep = currentStep.value
    if (failedStep >= 0) {
      steps.value[failedStep].status = 'error'
      steps.value[failedStep].loading = false
      steps.value[failedStep].description = '检查失败'
    }
    envStatus.value = e
    Message.error('环境检查失败')
  }
}

const installPython = () => {
  envModule.installPython(false)
}

onMounted(() => {
  checkEnv()
})
</script>

<template>
  <div class="env-checker">
    <a-steps :current="currentStep + 1" :status="steps[currentStep].status">
      <a-step v-for="(step, index) in steps" :key="index">
        <template #icon>
          <div class="step-icon">
            <icon-loading v-if="step.loading" />
            <icon-check v-else-if="step.status === 'finish'" class="success-icon" />
            <icon-close v-else-if="step.status === 'error'" class="error-icon" />
            <icon-minus v-else class="wait-icon" />
          </div>
        </template>
        <template #description>
          <span
            :class="{
              'error-text': step.status === 'error',
              'success-text': step.status === 'finish',
              'active-text': step.status === 'process'
            }"
          >
            {{ step.description }}
          </span>
        </template>
        {{ step.title }}
      </a-step>
    </a-steps>

    <div v-if="envStatus === EnvStatus.PythonNotInstalled" class="actions">
      <a-space>
        <a-button type="primary" @click="installPython">
          <template #icon>
            <icon-download />
          </template>
          去安装
        </a-button>
        <a-button @click="checkEnv">我已安装</a-button>
      </a-space>
    </div>
  </div>
</template>

<style scoped>
.env-checker {
  padding: 32px;
  width: 90vw;
  margin: 0 auto;
}

.active-text {
  color: rgb(var(--primary-6));
}

.success-text {
  color: rgb(var(--success-6));
}

:deep(.arco-steps-item-finish .arco-steps-icon) {
  background-color: rgb(var(--success-6));
  color: var(--color-white);
}

:deep(
    .arco-steps-label-horizontal
      .arco-steps-item.arco-steps-item-finish
      .arco-steps-item-title::after
  ) {
  background-color: rgb(var(--success-6));
}

:deep(
    .arco-steps-label-horizontal
      .arco-steps-item.arco-steps-item-next-error
      .arco-steps-item-title::after
  ) {
  background-color: rgb(var(--danger-6)) !important;
}

.error-text {
  color: rgb(var(--danger-6));
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
