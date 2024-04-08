<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue'

const speedDeg = 0.01;
const r = 0.5;

const dom = ref()

const frameId = ref(0)

const rotateBg = () => {
  if (dom.value) {
    // eslint-disable-next-line react/no-find-dom-node
    const nativeNode = dom.value as HTMLButtonElement;
    if (nativeNode) {
      const bgPos = nativeNode.style.backgroundPosition;
      if (!bgPos) {
        nativeNode.style.backgroundPosition = "0% 50%";
      } else {
        const arr = bgPos.split(" ");
        let x = Number(arr[0].substring(0, arr[0].length - 1)) / 100 - r;
        const oldX = x;
        let y = Number(arr[1].substring(0, arr[1].length - 1)) / 100 - r;

        x = x * Math.cos(speedDeg) - y * Math.sin(speedDeg);
        y = y * Math.cos(speedDeg) + x * Math.sin(speedDeg);

        nativeNode.style.backgroundPosition = `${(x + r) * 100}% ${
          (y + r) * 100
        }%`;
      }

      frameId.value = requestAnimationFrame(rotateBg);
    }
  }
}

onMounted(() => {
  if (dom.value) {
    frameId.value = requestAnimationFrame(rotateBg);
  }
})

onBeforeUnmount(() => {
  if (frameId.value) {
    cancelAnimationFrame(frameId.value);
  }
})
</script>

<template>
  <div ref="dom" class="container">
    <slot></slot>
  </div>
</template>

<style scoped lang="less">
.container {
  padding: 13px 24px;
  background-size: 400% 1000%;
  cursor: pointer;
  background-image: radial-gradient(
    closest-side,
    var(--theme-color-1) 6%,
    var(--theme-color-2) 50%,
    var(--theme-color-3) 100%
  );
  background-position: 0% 50%;
  color: #ffffff;
  margin-right: 24px;
  box-shadow: 0 10px 20px -10px #35a2fd
}

</style>
