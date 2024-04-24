<script setup lang="ts">
import EnvChecker from './components/EnvChecker.vue'
import Content from './components/Content.vue'
import { ref } from 'vue'

const envReady = ref(false)

document.body.setAttribute('arco-theme', 'dark')
</script>

<template>
  <EnvChecker v-if="!envReady" @env-ready="envReady = true" />
  <Content v-else />
</template>
