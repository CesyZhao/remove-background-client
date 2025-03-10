import { dialog } from 'electron'
import {
  BridgeEvent,
  EventCode,
  FileSelectorCommand,
  FileSelectorType,
  IGetImagePreviewResult,
  IPickFileResult
} from '@common/definitions/bridge'
import { fileSelectorCommandMap } from '@definitions/bridge'
import BaseModule from './Base'
import path from 'path'
import { ISetting } from '@common/definitions/setting'
import SettingModule from './Setting'
import { shell } from 'electron'
import fs from 'fs'
import sharp from 'sharp'
import { tmpdir } from 'os'
import { IpcResponse, FileOperationResult } from '@common/definitions/bridge'
import { buildRembgCommand, executeRembgCommand } from '@util/command'
import { ImageProcessor } from './ImageProcessor' // 替换旧命令模块
import { pathToFileURL } from 'url'

class FileModule extends BaseModule {
  private settingModule: SettingModule
  private imageProcessor: ImageProcessor

  constructor() {
    super('file')
    this.settingModule = new SettingModule(true)
    this.initProcessor()
  }

  async initProcessor() {
    try {
      this.imageProcessor = await ImageProcessor.init({
        inputSize: 1024
      })
    } catch (error) {
      console.error('初始化处理器失败:', error)
      throw error
    }
  }

  protected registerEvents(): void {
    this.registerHandler(BridgeEvent.PickFileOrDirectory, this.handlePickFileOrDirectory)
    this.registerHandler(BridgeEvent.GetImagePreview, this.handleGetImagePreview)
    this.registerHandler(BridgeEvent.RemoveBackground, this.handleRemoveBackground)
    // this.registerHandler(
    //   BridgeEvent.RemoveBackgroundFromBase64,
    //   this.handleRemoveBackgroundFromBase64
    // )
    this.registerHandler(BridgeEvent.RemoveBackgroundBatch, this.handleRemoveBackgroundBatch)
    // this.registerHandler(BridgeEvent.GetDirectoryImages, this.handleGetDirectoryImages)
    // this.registerHandler(BridgeEvent.DeleteImage, this.deleteImage)
    // this.registerHandler(BridgeEvent.RevealInFinder, this.revealInFinder)
  }

  private async handlePickFileOrDirectory(
    _,
    commands: Array<FileSelectorType>
  ): Promise<IpcResponse<IPickFileResult>> {
    try {
      const commandList = commands.map(
        (command) => fileSelectorCommandMap.get(command) || FileSelectorCommand.openFile
      )
      const result = await dialog.showOpenDialog({ properties: commandList })

      if (result.canceled || !result.filePaths[0]) {
        return {
          result: {},
          code: EventCode.Success
        }
      }

      const filePath = result.filePaths[0]
      const stats = await fs.promises.stat(filePath)

      return {
        result: {
          path: filePath,
          isDirectory: stats.isDirectory()
        },
        code: EventCode.Success
      }
    } catch (error) {
      throw {
        code: EventCode.Error,
        result: {}
      }
    }
  }

  private async handleGetImagePreview(_, imagePath: string): Promise<IpcResponse<string>> {
    try {
      const thumbnail = await sharp(imagePath)
        .resize(500, 500, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toBuffer()

      const base64Image = thumbnail.toString('base64')
      const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
      const dataUrl = `data:${mimeType};base64,${base64Image}`

      return {
        result: dataUrl,
        code: EventCode.Success
      }
    } catch (error) {
      throw {
        code: EventCode.Error,
        result: ''
      }
    }
  }

  private async handleRemoveBackground(
    _,
    imagePath: string
  ): Promise<IpcResponse<FileOperationResult>> {
    try {
      const settings = await this.settingModule.getSetting()
      const outputPath = this.getOutputPath(imagePath, settings)
      // 使用新处理器处理图片
      await this.imageProcessor.removeBackground(imagePath, outputPath)

      const imageBuffer = fs.readFileSync(outputPath)
      const base64Image = imageBuffer.toString('base64')
      const mimeType = outputPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
      const dataUrl = `data:${mimeType};base64,${base64Image}`

      return {
        result: {
          outputPath,
          base64: dataUrl
        },
        code: EventCode.Success
      }
    } catch (error) {
      console.error('背景移除失败:', error) // 改进错误日志
      throw {
        code: EventCode.Error,
        result: { message: error.message }
      }
    }
  }

  private async handleRemoveBackgroundBatch(
    _,
    dirPath: string
  ): Promise<IpcResponse<FileOperationResult[]>> {
    try {
      const settings = await this.settingModule.getSetting()

      // 获取目录下所有图片文件
      const files = await fs.promises.readdir(dirPath)
      const imagePaths = files
        .filter((f) => ['.jpg', '.png', '.webp'].includes(path.extname(f).toLowerCase()))
        .map((f) => path.join(dirPath, f))

      // 批量处理
      const { success } = await this.imageProcessor.batchProcess(imagePaths, dirPath)

      // 生成结果集
      const results = await Promise.all(
        success.map(async (outputPath) => {
          const imageBuffer = await fs.promises.readFile(outputPath)
          const base64Image = imageBuffer.toString('base64')
          const mimeType = outputPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
          return {
            base64: `data:${mimeType};base64,${base64Image}`,
            outputPath
          }
        })
      )

      return {
        result: results,
        code: EventCode.Success
      }
    } catch (error) {
      console.error('批量处理失败:', error)
      throw {
        code: EventCode.Error,
        result: []
      }
    }
  }

  private getOutputPath(imagePath: string, settings: ISetting[], baseDir?: string): string {
    const basicSettings = settings.find((s) => s.category === 'basic_setting')
    const outputDir = basicSettings?.settings.find((s) => s.key === 'output_directory')
      ?.value as string
    const format = basicSettings?.settings.find((s) => s.key === 'output_format')?.value as string

    const fileName = path.basename(imagePath, path.extname(imagePath))

    if (baseDir) {
      // 获取选择的文件夹名称
      const folderName = path.basename(baseDir)
      // 获取文件相对于基础目录的路径
      const relativePath = path.relative(baseDir, path.dirname(imagePath))
      // 组合路径：输出目录/文件夹名称/相对路径/文件名
      return path.join(outputDir, folderName, relativePath, `${fileName}_nobg.${format}`)
    }

    return path.join(outputDir, `${fileName}_nobg.${format}`)
  }
}

export default FileModule
