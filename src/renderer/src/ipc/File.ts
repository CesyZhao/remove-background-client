import {
  BridgeEvent,
  FileOperationResult,
  FileSelectorType,
  IGetImagePreviewResult,
  IpcResponse,
  IPickFileResult
} from '@common/definitions/bridge'
const { electron } = window
import { upperFirst } from 'lodash'

class File {
  async pickFileOrDirectory(types: FileSelectorType[]): Promise<IpcResponse<IPickFileResult>> {
    return electron.pickFileOrDirectory(types)
  }

  async getImagePreview(imagePath: string): Promise<IpcResponse<string>> {
    return electron.getImagePreview(imagePath)
  }

  async removeBackground(imagePath: string): Promise<IpcResponse<FileOperationResult>> {
    return electron.removeBackground(imagePath)
  }

  async removeBackgroundBatch(dirPath: string): Promise<IpcResponse<FileOperationResult[]>> {
    return electron.removeBackgroundBatch(dirPath)
  }

  async removeBackgroundFromBase64(base64Data: string): Promise<IpcResponse<FileOperationResult>> {
    return electron.removeBackgroundFromBase64(base64Data)
  }

  async deleteImage(imagePath: string) {
    return electron.deleteImage(imagePath)
  }

  async revealInFinder(imagePath: string) {
    return electron.revealInFinder(imagePath)
  }

  async getDirectoryImages(dirPath: string): Promise<IpcResponse<IGetImagePreviewResult>> {
    return electron.getDirectoryImages(dirPath)
  }

  setProgressCallback(callback: (SingleFile: FileOperationResult) => void) {
    const funcName = `on${upperFirst(BridgeEvent.ProgressCallback)}`
    return electron[funcName](callback)
  }

  cancelProgressCallback() {
    const funcName = `cancel${upperFirst(BridgeEvent.ProgressCallback)}`
    return electron[funcName]()
  }
}

export default File
