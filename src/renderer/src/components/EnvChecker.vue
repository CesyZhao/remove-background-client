<script setup lang="ts">
import Loading from './Loading.vue'
import { defineEmits, onMounted, ref, watch } from 'vue'
import { EnvStatus } from '../definitions/env'

const emit = defineEmits(['env-ready'])

const envStatus = ref(EnvStatus.Checking)

const loading = ref(true)
const loadingText = ref('检测环境中...')
const tip = ref(`检测到必要的运行环境 <div class="python">Python</div> 缺失`)

const installPython = () => {
  const { process } = window.electron
  const { platform } = process
  const isMac = platform === 'darwin'
  const macDownloadUrl = 'https://www.python.org/ftp/python/3.10.10/python-3.10.10-macos11.pkg'
  const windowsDownloadUrl = 'https://www.python.org/ftp/python/3.10.10/python-3.10.10-amd64.exe'

  window.electron.ipcRenderer.send('download-python', isMac ? macDownloadUrl : windowsDownloadUrl)
}

const deployRemBG = () => {
  window.electron.ipcRenderer.send('deploy-rembg')
}

window.electron.onEnvCheckReply((result: EnvStatus) => {
  envStatus.value = result
})

watch(envStatus, (newValue) => {
  const { PythonNotInstalled, RembgIsInstalling, RembgNotInstalled, RembgInstalled } = EnvStatus
  if ([PythonNotInstalled, RembgNotInstalled, RembgInstalled].includes(newValue)) {
    loading.value = false
  }
  if (newValue === RembgIsInstalling) {
    loading.value = true
    loadingText.value = '应用部署中...'
  } else if (newValue === RembgInstalled) {
    emit('env-ready')
  } else if (newValue === RembgNotInstalled) {
    tip.value = '应用部署失败，请联系作者'
  }
})

onMounted(() => {
  setTimeout(() => {
    window.electron.ipcRenderer.send('env-check')
  }, 1000)
})
</script>

<template>
  <Loading v-if="loading" :loading-text="loadingText" />
  <div v-else class="env-tips">
    <span v-html="tip"></span>

    <div v-if="envStatus === EnvStatus.PythonNotInstalled" class="actions">
      <div class="action" @click="installPython">去安装</div>
      <div class="action" @click="deployRemBG">我已安装</div>
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
