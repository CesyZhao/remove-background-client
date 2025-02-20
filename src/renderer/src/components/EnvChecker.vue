<script setup lang="ts">
import Loading from './Loading.vue'
import { defineEmits, onMounted, ref, watch } from 'vue'
import bridge from '../ipc/Bridge'
import { EnvStatus } from '@common/definitions/bridge'

const { env } = bridge.modules

const emit = defineEmits(['env-ready'])

const envStatus = ref(EnvStatus.Checking)

const loading = ref(true)
const loadingText = ref('检测环境中...')
const tip = ref(`检测到必要的运行环境 <div class="python">Python</div> 缺失`)

watch(envStatus, (newValue) => {
  const { PythonNotInstalled, RemBGNotInstalled, RemBGInstalled } = EnvStatus
  loading.value = ![PythonNotInstalled, RemBGNotInstalled, RemBGInstalled].includes(newValue)
  if (newValue === RemBGInstalled) {
    emit('env-ready')
  } else if (newValue === RemBGNotInstalled) {
    tip.value = '应用部署失败'
  }
})

const checkEnv = async () => {
  try {
    const pythonStatus = await env.installPython()
    envStatus.value = pythonStatus
    tip.value = '应用部署中...'
    const status = await env.installRemBG()
    envStatus.value = status
  } catch (e) {
    envStatus.value = e
  }
}

const installPython = () => {
  env.installPython(false)
}

onMounted(() => {
  checkEnv()
})
</script>

<template>
  <Loading v-if="loading" :loading-text="loadingText" />
  <div v-if="envStatus === EnvStatus.PythonNotInstalled" class="env-tips">
    <span v-html="tip"></span>

    <div class="actions">
      <div class="action" @click="installPython">去安装</div>
      <div class="action" @click="checkEnv">我已安装</div>
    </div>
  </div>
</template>

<style scoped>
.env-tips {
  font-size: 18px;
}
.actions {
  display: flex;
  margin: -6px;
  font-size: 14px;
  justify-content: space-between;
  padding: 32px 12px 0;
}

.action {
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  border-radius: 20px;
  padding: 0 20px;
  line-height: 28px;
  font-size: 14px;
  border: 1px solid var(--ev-button-alt-border);
  color: var(--ev-button-alt-text);
  background-color: var(--ev-button-alt-bg);
}

.action:hover {
  border-color: var(--ev-button-alt-hover-border);
  color: var(--ev-button-alt-hover-text);
  background-color: var(--ev-button-alt-hover-bg);
}

:deep(.python) {
  display: inline;
  background: -webkit-linear-gradient(315deg, #3178c6 45%, #f0dc4e);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}
</style>
