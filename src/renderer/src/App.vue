<script setup lang="ts">
import EnviromentChecker from '@components/environment-checker/index.vue'
import Entry from '@components/entry/index.vue'
import { ref } from 'vue'

const envReady = ref(false)

</script>

<template>
  <enviroment-checker v-if="!envReady" @env-ready="envReady = true" />
  <entry v-else />
</template>
