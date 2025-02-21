import { BridgeEvent, EventCode, FileSelectorType } from '@common/definitions/bridge'
const { electron } = window
const { ipcRenderer } = electron

interface ImageResult {
  preview: string
  processed?: string
}

class File {
  async pickFileOrDirectory(types: FileSelectorType[]): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      const func = electron[`on${BridgeEvent.PickFileOrDirectoryReply}`]

      func(({ result, code }) => {
        code === EventCode.Success ? resolve(result) : reject(code)
      })

      ipcRenderer.send(BridgeEvent.PickFileOrDirectory, types)
    })
  }

  private async getImagePreview(imagePath: string): Promise<string> {
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

  async removeBackground(imagePath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const func = electron[`on${BridgeEvent.RemoveBackgroundReply}`]

      func(({ result, code, error }) => {
        if (code === EventCode.Success) {
          resolve(result)
        } else {
          reject(error || '图片处理失败')
        }
      })

      ipcRenderer.send(BridgeEvent.RemoveBackground, imagePath)
    })
  }
}

export default File
