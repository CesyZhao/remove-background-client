import { FileOperationResult, FileSelectorType, IpcResponse, IPickFileResult } from '@common/definitions/bridge'
const { electron } = window

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

  async removeBackgroundBatch(dirPath: string) {
    return electron.removeBackgroundBatch(dirPath)
  }

  async removeBackgroundFromBase64(base64Data: string) {
    return electron.removeBackgroundFromBase64(base64Data)
  }

  async deleteImage(imagePath: string) {
    return electron.deleteImage(imagePath)
  }

  async revealInFinder(imagePath: string) {
    return electron.revealInFinder(imagePath)
  }

  async getDirectoryImages(dirPath: string) {
    return electron.getDirectoryImages(dirPath)
  }
}

export default File
