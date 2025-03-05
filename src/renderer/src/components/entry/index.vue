<script setup lang="ts">
import { ref } from 'vue'
import Indexs from '@components/setting/index.vue'
import Index from '@components/main-content/index.vue'

const settingVisible = ref(false)
</script>

<template>
  <Indexs v-model="settingVisible" />
  <Index @show-setting="settingVisible = true" />
</template>

<style></style>
