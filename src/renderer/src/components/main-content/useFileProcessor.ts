import { ref } from 'vue'
import { IImageItem } from '@definitions/content'
import { Message } from '@arco-design/web-vue'
import bridge from '@ipc/Bridge'

const getImageItem = (filePath: string, previewUrl: string): IImageItem => {
  return {
    id: Date.now().toString() + Math.random(),
    previewUrl,
    processedUrl: '',
    processing: true,
    name: getFilenameByPath(filePath),
    path: ''
  }
}

const getFilenameByPath = (filePath: string) => {
  return filePath.split('/').pop() || '未命名'
}

const { fileModule } = bridge.modules

const useFileProcessor = () => {
  const processResult = ref<IImageItem[]>([])
  const current = ref<IImageItem | null>(null)

  const processFile = async (filePath: string, isDirectory: boolean, raw?: string) => {
    try {
      if (isDirectory) {
        const { result: images } = await fileModule.getDirectoryImages(filePath)

        for (const image of images) {
          const { result: preview } = await fileModule.getImagePreview(image.path)

          const newImage = getImageItem(image.path, preview)

          processResult.value.unshift(newImage)
        }

        if (images.length > 0) {
          current.value = processResult.value[processResult.value.length - images.length]
        }

        const { result: results } = await fileModule.removeBackgroundBatch(filePath)

        for (let i = 0; i < results.length; i++) {
          const result = results[i]
          const index = processResult.value.length - results.length + i
          if (index >= 0) {
            const imageItem = processResult.value[index]
            const { base64 = '', outputPath: path = '' } = result
            imageItem.processedUrl = base64
            imageItem.path = path
            imageItem.processing = false
          }
        }
      } else {
        let preview
        if (raw) {
          preview = raw
        } else {
          const { result } = await fileModule.getImagePreview(filePath)
          preview = result
        }
        const newImage = getImageItem(filePath, preview)
        processResult.value.unshift(newImage)
        current.value = newImage

        const { removeBackground, removeBackgroundFromBase64 } = fileModule

        const targetFunc = raw ? removeBackgroundFromBase64 : removeBackground

        const targetOrigin = raw || filePath

        const {
          result: { base64 = '', outputPath: path = '' }
        } = await targetFunc(targetOrigin)

        const index = processResult.value.findIndex((item) => item.id === newImage.id)

        if (index !== -1) {
          const imageItem = processResult.value[index]
          imageItem.processedUrl = base64
          imageItem.path = path
          imageItem.processing = false
        }
      }
    } catch (error) {
      console.error('处理文件失败:', error)
      Message.error('处理失败')
      throw error
    }
  }

  return {
    current,
    processResult,
    processFile
  }
}

export default useFileProcessor
