<script setup lang="ts">
import Settings from './Settings.vue'
import FileUploader from './FileUploader.vue'
import { ref } from 'vue'

const settingVisible = ref(false)

</script>

<template>
  <Settings v-model="settingVisible" />
  <FileUploader @show-setting="settingVisible = true" />
</template>

<style></style>
