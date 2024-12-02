<script setup lang="ts">
import Settings from './Settings.vue'
import { ref } from 'vue'
import Content from './Content.vue'

const settingVisible = ref(false)

</script>

<template>
  <Settings v-model="settingVisible" />
  <Content @show-setting="settingVisible = true" />
</template>

<style></style>
