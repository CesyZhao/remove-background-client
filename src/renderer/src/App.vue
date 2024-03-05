<script setup lang="ts">
import EnvChecker from './components/EnvChecker.vue'
import FileUploader from './components/FileUploader.vue'
import { ref } from 'vue'

const envReady = ref(false)
</script>

<template>
  <EnvChecker v-if="!envReady" @env-ready="envReady = true" />
  <FileUploader v-else />
</template>
