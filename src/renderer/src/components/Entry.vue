<script setup lang="ts">
import { ref } from 'vue'
import Settings from '@components/Setting.vue'
import Content from '@components/Content.vue'

const settingVisible = ref(false)

</script>

<template>
  <Settings v-model="settingVisible" />
  <Content @show-setting="settingVisible = true" />
</template>

<style></style>
