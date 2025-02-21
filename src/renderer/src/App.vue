<script setup lang="ts">
import EnvChecker from '@components/EnvChecker.vue'
import Entry from '@components/Entry.vue'
import { ref } from 'vue'

const envReady = ref(false)

</script>

<template>
  <EnvChecker v-if="!envReady" @env-ready="envReady = true" />
  <Entry v-else />
</template>
