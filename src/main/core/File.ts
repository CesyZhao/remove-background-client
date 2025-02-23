import { IpcMainEvent, dialog } from 'electron'
import {
  BridgeEvent,
  EventCode,
  FileSelectorCommand,
  FileSelectorType
} from '@common/definitions/bridge'
import { fileSelectorCommandMap } from '@definitions/bridge'
import BaseModule from './Base'
import { exec } from 'child_process'
import path from 'path'
import { ISetting } from '@common/definitions/setting'
import SettingModule from './Setting'
import { shell } from 'electron'
import fs from 'fs'
import sharp from 'sharp'

class FileModule extends BaseModule {
  private settingModule: SettingModule

  constructor() {
    super()
    this.settingModule = new SettingModule()
  }

  protected registerEvents(): void {
    this.registerHandler<[Array<FileSelectorType>]>(
      BridgeEvent.PickFileOrDirectory,
      this.handlePickFileOrDirectory
    )
    this.registerHandler<[string]>(BridgeEvent.GetImagePreview, this.handleGetImagePreview)
    this.registerHandler<[string]>(BridgeEvent.RemoveBackground, this.handleRemoveBackground)
    this.registerHandler<[string]>(
      BridgeEvent.RemoveBackgroundBatch,
      this.handleRemoveBackgroundBatch
    )
    this.registerHandler<[string]>(BridgeEvent.GetDirectoryImages, this.handleGetDirectoryImages)
    this.registerHandler<[string]>(BridgeEvent.DeleteImage, this.deleteImage)
    this.registerHandler<[string]>(BridgeEvent.RevealInFinder, this.revealInFinder)
  }

  private async processDirectory(
    dirPath: string,
    baseDir: string,
    settings: ISetting[]
  ): Promise<Array<{ base64: string; path: string }>> {
    const results: Array<{ base64: string; path: string }> = []
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        const subResults = await this.processDirectory(fullPath, baseDir, settings)
        results.push(...subResults)
      } else {
        const ext = path.extname(entry.name).toLowerCase()
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          const outputPath = this.getOutputPath(fullPath, settings, baseDir) // 传入 baseDir

          // 确保输出目录存在
          await fs.promises.mkdir(path.dirname(outputPath), { recursive: true })

          const command = this.buildRembgCommand(fullPath, outputPath, settings)
          await this.executeRembgCommand(command)

          const imageBuffer = await fs.promises.readFile(outputPath)
          const base64Image = imageBuffer.toString('base64')
          const mimeType = outputPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
          const dataUrl = `data:${mimeType};base64,${base64Image}`

          results.push({
            base64: dataUrl,
            path: outputPath
          })
        }
      }
    }

    return results
  }

  private async handleRemoveBackgroundBatch(event: IpcMainEvent, dirPath: string): Promise<void> {
    try {
      const settings = await this.settingModule.getSetting()
      const results = await this.processDirectory(dirPath, dirPath, settings)

      this.sendReply(event, BridgeEvent.RemoveBackgroundBatchReply, {
        result: results,
        code: EventCode.Success
      })
    } catch (error) {
      this.sendReply(event, BridgeEvent.RemoveBackgroundBatchReply, {
        code: EventCode.Error,
        error: error.message
      })
    }
  }

  private async handleRemoveBackground(event: IpcMainEvent, imagePath: string): Promise<void> {
    try {
      const settings = await this.settingModule.getSetting()
      const outputPath = this.getOutputPath(imagePath, settings)
      const command = this.buildRembgCommand(imagePath, outputPath, settings)

      await this.executeRembgCommand(command)

      // 读取处理后的图片并转换为 base64
      const imageBuffer = fs.readFileSync(outputPath)
      const base64Image = imageBuffer.toString('base64')
      const mimeType = outputPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
      const dataUrl = `data:${mimeType};base64,${base64Image}`

      this.sendReply(event, BridgeEvent.RemoveBackgroundReply, {
        result: dataUrl,
        outputPath,
        code: EventCode.Success
      })
    } catch (error) {
      this.sendReply(event, BridgeEvent.RemoveBackgroundReply, {
        code: EventCode.Error,
        error: error.message
      })
    }
  }

  private async handlePickFileOrDirectory(
    event: IpcMainEvent,
    commands: Array<FileSelectorType>
  ): Promise<void> {
    const commandList: FileSelectorCommand[] = commands.map((command) => {
      return fileSelectorCommandMap.get(command) || FileSelectorCommand.openFile
    })

    try {
      const result = await dialog.showOpenDialog({
        properties: commandList
      })

      if (result.canceled || !result.filePaths[0]) {
        this.sendReply(event, BridgeEvent.PickFileOrDirectoryReply, {
          result: undefined,
          code: EventCode.Success
        })
        return
      }

      const filePath = result.filePaths[0]
      const stats = await fs.promises.stat(filePath)

      this.sendReply(event, BridgeEvent.PickFileOrDirectoryReply, {
        result: {
          path: filePath,
          isDirectory: stats.isDirectory()
        },
        code: EventCode.Success
      })
    } catch (e) {
      this.sendReply(event, BridgeEvent.PickFileOrDirectoryReply, {
        result: undefined,
        code: EventCode.Error
      })
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

  private buildRembgCommand(imagePath: string, outputPath: string, settings: ISetting[]): string {
    const modelSettings = settings.find((s) => s.category === 'model_setting')?.settings || []
    const postSettings = settings.find((s) => s.category === 'post_process_setting')?.settings || []

    const command = ['rembg', 'i']

    // 添加模型参数
    const modelName = modelSettings.find((s) => s.key === 'model_name')?.value
    if (modelName) {
      command.push('-m', modelName as string)
    }

    // Alpha matting 参数
    if (modelSettings.find((s) => s.key === 'alpha_matting')?.value) {
      command.push('-a')
      command.push(
        '-af',
        modelSettings.find((s) => s.key === 'alpha_matting_foreground_threshold')?.value as string
      )
      command.push(
        '-ab',
        modelSettings.find((s) => s.key === 'alpha_matting_background_threshold')?.value as string
      )
      command.push(
        '-ae',
        modelSettings.find((s) => s.key === 'alpha_matting_erode_size')?.value as string
      )
    }

    // 后处理参数
    if (postSettings.find((s) => s.key === 'post_process_mask')?.value) {
      command.push('-p')
    }

    const bgcolor = postSettings.find((s) => s.key === 'background_color')?.value
    if (bgcolor && bgcolor !== '#ffffff') {
      command.push('-b', bgcolor)
    }

    command.push(imagePath, outputPath)
    return command.join(' ')
  }

  private executeRembgCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const childProcess = exec(command, {
        timeout: 30000, // 30 秒超时
        maxBuffer: 1024 * 1024 * 10 // 增加缓冲区大小到 10MB
      }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`执行失败: ${stderr}`))
          return
        }
        resolve()
      })
  
      // 设置更高的进程优先级
      if (process.platform === 'darwin') {
        exec(`renice -n -10 -p ${childProcess.pid}`)
      }
    })
  }

  private async handleGetImagePreview(event: IpcMainEvent, imagePath: string): Promise<void> {
    try {
      // 使用 sharp 压缩图片后再转换为 base64
      const thumbnail = await sharp(imagePath)
        .resize(500, 500, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toBuffer()

      const base64Image = thumbnail.toString('base64')
      const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
      const dataUrl = `data:${mimeType};base64,${base64Image}`

      this.sendReply(event, BridgeEvent.GetImagePreviewReply, {
        result: dataUrl,
        code: EventCode.Success
      })
    } catch (error) {
      this.sendReply(event, BridgeEvent.GetImagePreviewReply, {
        code: EventCode.Error,
        error: error.message
      })
    }
  }

  private async handleGetDirectoryImages(event: IpcMainEvent, dirPath: string): Promise<void> {
    try {
      const images: { path: string }[] = []
      const processDir = async (dir: string) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            await processDir(fullPath)
          } else {
            const ext = path.extname(entry.name).toLowerCase()
            if (['.jpg', '.jpeg', '.png'].includes(ext)) {
              images.push({ path: fullPath })
            }
          }
        }
      }

      await processDir(dirPath)
      this.sendReply(event, BridgeEvent.GetDirectoryImagesReply, {
        result: images,
        code: EventCode.Success
      })
    } catch (error) {
      this.sendReply(event, BridgeEvent.GetDirectoryImagesReply, {
        code: EventCode.Error,
        error: error.message
      })
    }
  }

  async deleteImage(event: IpcMainEvent, imagePath: string): Promise<void> {
    try {
      await fs.unlinkSync(imagePath)
      this.sendReply(event, BridgeEvent.DeleteImageReply, {
        code: EventCode.Success
      })
    } catch (error) {
      this.sendReply(event, BridgeEvent.DeleteImageReply, {
        code: EventCode.Error
      })
    }
  }

  async revealInFinder(event: IpcMainEvent, imagePath: string): Promise<void> {
    try {
      await shell.showItemInFolder(imagePath)
      this.sendReply(event, BridgeEvent.RevealInFinderReply, {
        code: EventCode.Success
      })
    } catch (error) {
      this.sendReply(event, BridgeEvent.RevealInFinderReply, {
        code: EventCode.Error
      })
    }
  }
}

export default FileModule
