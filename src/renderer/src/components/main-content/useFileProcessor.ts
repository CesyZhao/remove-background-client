import { ref } from 'vue'
import { IImageItem } from '@definitions/content'
import { Message } from '@arco-design/web-vue'

const getImageItem = (): IImageItem => {
  return {
    id: '',
    previewUrl: '',
    processedUrl: '',
    processing: false,
    name: '',
    path: ''
  }
}

const getFilenameByPath = (filePath: string) => {
  return filePath.path.split('/').pop() || '未命名'
}

const useFileProcessor = (filePath: string, isDirectory: boolean) => {
  const imageList = ref<IImageItem[]>([])

  const processFile = async () => {
    try {

      if (isDirectory) {
        const { result: images } = await fileModule.getDirectoryImages(filePath)

        for (const image of images) {
          const { result: preview } = await fileModule.getImagePreview(image.path)

          const newImage = getImageItem()
          newImage.id = Date.now().toString() + Math.random()
          newImage.previewUrl = preview
          newImage.processing = true
          newImage.name = getFilenameByPath(image.path)

          imageList.value.push(newImage)
        }

        if (images.length > 0) {
          currentImage.value = imageList.value[imageList.value.length - images.length]
        }

        const { result: results } = await fileModule.removeBackgroundBatch(filePath)

        for (let i = 0; i < results.length; i++) {
          const result = results[i]
          const index = imageList.value.length - results.length + i
          if (index >= 0) {
            imageList.value[index].processedUrl = result.base64
            imageList.value[index].path = result.path
            imageList.value[index].processing = false
          }
        }
      } else {
        const { result: preview } = await fileModule.getImagePreview(filePath)
        const newImage: ImageItem = {
          id: Date.now().toString(),
          previewUrl: preview,
          processedUrl: '',
          processing: true,
          path: '',
          name: filePath.split('/').pop() || '未命名'
        }
        imageList.value.push(newImage)
        currentImage.value = newImage

        const {
          result: { base64, outputPath: path }
        } = await fileModule.removeBackground(filePath)
        const index = imageList.value.findIndex((item) => item.id === newImage.id)
        if (index !== -1) {
          imageList.value[index].processedUrl = base64
          imageList.value[index].path = path
          setTimeout(() => {
            imageList.value[index].processing = false
          }, 100)
        }
      }
    } catch (error) {
      console.error('处理文件失败:', error)
      Message.error('处理失败')
      throw error
    }
  }

}

export default useFileProcessor
