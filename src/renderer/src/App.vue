<script setup lang="ts">
import Index from '@components/environment-checker/index.vue'
import Index from '@components/entry/index.vue'
import { ref } from 'vue'

const envReady = ref(false)

</script>

<template>
  <Index v-if="!envReady" @env-ready="envReady = true" />
  <Index v-else />
</template>
