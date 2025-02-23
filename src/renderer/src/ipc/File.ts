import { BridgeEvent, EventCode, FileSelectorType } from '@common/definitions/bridge'
const { electron } = window
const { ipcRenderer } = electron

interface ProcessedImage {
  base64: string
  path: string
}

interface IPickResult {
  path: string,
  isDirectory: boolean
}

class File {
  async pickFileOrDirectory(types: FileSelectorType[]): Promise<IPickResult> {
    return new Promise((resolve, reject) => {
      const func = electron[`on${BridgeEvent.PickFileOrDirectoryReply}`]

      func(({ result, code }) => {
        code === EventCode.Success ? resolve(result) : reject(code)
      })

      ipcRenderer.send(BridgeEvent.PickFileOrDirectory, types)
    })
  }

  async getImagePreview(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const func = electron[`on${BridgeEvent.GetImagePreviewReply}`]

      func(({ result, code, error }) => {
        if (code === EventCode.Success) {
          resolve(result)
        } else {
          reject(error || '预览图片加载失败')
        }
      })

      ipcRenderer.send(BridgeEvent.GetImagePreview, imagePath)
    })
  }

  async removeBackground(imagePath: string): Promise<ProcessedImage> {
    return new Promise<ProcessedImage>((resolve, reject) => {
      const func = electron[`on${BridgeEvent.RemoveBackgroundReply}`]

      func(({ result, outputPath, code, error }) => {
        if (code === EventCode.Success) {
          resolve({
            base64: result,
            path: outputPath
          })
        } else {
          reject(error || '图片处理失败')
        }
      })

      ipcRenderer.send(BridgeEvent.RemoveBackground, imagePath)
    })
  }

  async removeBackgroundBatch(dirPath: string): Promise<ProcessedImage[]> {
    return new Promise<ProcessedImage[]>((resolve, reject) => {
      const func = electron[`on${BridgeEvent.RemoveBackgroundBatchReply}`]

      func(({ result, code, error }) => {
        if (code === EventCode.Success) {
          resolve(result)
        } else {
          reject(error || '批量处理图片失败')
        }
      })

      ipcRenderer.send(BridgeEvent.RemoveBackgroundBatch, dirPath)
    })
  }

  async deleteImage(imagePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const func = electron[`on${BridgeEvent.DeleteImageReply}`]

      func(({ code, error }) => {
        if (code === EventCode.Success) {
          resolve()
        } else {
          reject(error || '删除图片失败')
        }
      })

      ipcRenderer.send(BridgeEvent.DeleteImage, imagePath)
    })
  }

  async revealInFinder(imagePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const func = electron[`on${BridgeEvent.RevealInFinderReply}`]

      func(({ code, error }) => {
        if (code === EventCode.Success) {
          resolve()
        } else {
          reject(error || '在文件夹中显示失败')
        }
      })

      ipcRenderer.send(BridgeEvent.RevealInFinder, imagePath)
    })
  }

  async getDirectoryImages(dirPath: string): Promise<{ path: string }[]> {
    return new Promise((resolve, reject) => {
      const func = electron[`on${BridgeEvent.GetDirectoryImagesReply}`]

      func(({ result, code, error }) => {
        if (code === EventCode.Success) {
          resolve(result)
        } else {
          reject(error || '获取文件夹图片失败')
        }
      })

      ipcRenderer.send(BridgeEvent.GetDirectoryImages, dirPath)
    })
  }
}

export default File
