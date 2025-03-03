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
import { exec } from 'child_process'
import path from 'path'
import { ISetting } from '@common/definitions/setting'
import SettingModule from './Setting'
import { shell } from 'electron'
import fs from 'fs'
import sharp from 'sharp'
import { tmpdir } from 'os'
import { IpcResponse, FileOperationResult } from '@common/definitions/bridge'

class FileModule extends BaseModule {
  private settingModule: SettingModule

  constructor() {
    super('file')
    this.settingModule = new SettingModule()
  }

  protected registerEvents(): void {
    this.registerHandler(BridgeEvent.PickFileOrDirectory, this.handlePickFileOrDirectory)
    this.registerHandler(BridgeEvent.GetImagePreview, this.handleGetImagePreview)
    this.registerHandler(BridgeEvent.RemoveBackground, this.handleRemoveBackground)
    this.registerHandler(
      BridgeEvent.RemoveBackgroundFromBase64,
      this.handleRemoveBackgroundFromBase64
    )
    this.registerHandler(BridgeEvent.RemoveBackgroundBatch, this.handleRemoveBackgroundBatch)
    this.registerHandler(BridgeEvent.GetDirectoryImages, this.handleGetDirectoryImages)
    this.registerHandler(BridgeEvent.DeleteImage, this.deleteImage)
    this.registerHandler(BridgeEvent.RevealInFinder, this.revealInFinder)
  }

  private async handlePickFileOrDirectory(
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
        code: EventCode.Error
      }
    }
  }

  private async handleGetImagePreview(imagePath: string): Promise<IpcResponse<string>> {
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
        code: EventCode.Error
      }
    }
  }

  private async handleRemoveBackground(
    imagePath: string
  ): Promise<IpcResponse<FileOperationResult>> {
    try {
      const settings = await this.settingModule.getSetting()
      const outputPath = this.getOutputPath(imagePath, settings)
      const command = this.buildRembgCommand(imagePath, outputPath, settings)

      await this.executeRembgCommand(command)

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
      throw {
        code: EventCode.Error
      }
    }
  }

  private async handleRemoveBackgroundFromBase64(
    base64Data: string
  ): Promise<IpcResponse<FileOperationResult>> {
    const tempPath = path.join(tmpdir(), `temp-${Date.now()}.png`)
    try {
      const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '')
      const imageBuffer = Buffer.from(base64Image, 'base64')
      await fs.promises.writeFile(tempPath, imageBuffer)

      const settings = await this.settingModule.getSetting()
      const outputPath = this.getOutputPath(tempPath, settings)
      const command = this.buildRembgCommand(tempPath, outputPath, settings)

      await this.executeRembgCommand(command)

      const processedBuffer = await fs.promises.readFile(outputPath)
      const processedBase64 = processedBuffer.toString('base64')
      const mimeType = outputPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
      const dataUrl = `data:${mimeType};base64,${processedBase64}`

      return {
        result: {
          base64: dataUrl,
          outputPath
        },
        code: EventCode.Success
      }
    } catch (error) {
      throw {
        code: EventCode.Error
      }
    } finally {
      await fs.promises.unlink(tempPath).catch(console.error)
    }
  }

  private async handleGetDirectoryImages(
    dirPath: string
  ): Promise<IpcResponse<IGetImagePreviewResult>> {
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
      return {
        result: images,
        code: EventCode.Success
      }
    } catch (error) {
      throw {
        code: EventCode.Error
      }
    }
  }

  private async deleteImage(imagePath: string): Promise<IpcResponse<void>> {
    try {
      await fs.promises.unlink(imagePath)
      return {
        code: EventCode.Success
      }
    } catch (error) {
      throw {
        code: EventCode.Error
      }
    }
  }

  private async revealInFinder(imagePath: string): Promise<IpcResponse<void>> {
    try {
      await shell.showItemInFolder(imagePath)
      return {
        code: EventCode.Success
      }
    } catch (error) {
      throw {
        code: EventCode.Error
      }
    }
  }

  private async processDirectoryFlat(
    dirPath: string,
    baseDir: string,
    settings: ISetting[]
  ): Promise<Array<FileOperationResult>> {
    const results: Array<FileOperationResult> = []
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        const subResults = await this.processDirectoryFlat(fullPath, baseDir, settings)
        results.push(...subResults)
      } else {
        const ext = path.extname(entry.name).toLowerCase()
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          const outputPath = this.getOutputPath(fullPath, settings, baseDir) // 传入 baseDir

          // 确保输出目录存在
          await fs.promises.mkdir(path.dirname(outputPath), { recursive: true })

          const command = this.buildRembgCommand(fullPath, outputPath, settings)
          console.log(command, '------------')
          await this.executeRembgCommand(command)

          const imageBuffer = await fs.promises.readFile(outputPath)
          const base64Image = imageBuffer.toString('base64')
          const mimeType = outputPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
          const dataUrl = `data:${mimeType};base64,${base64Image}`

          results.push({
            base64: dataUrl,
            outputPath
          })
        }
      }
    }

    return results
  }

  private async processDirectory(
    dirPath: string,
    baseDir: string,
    settings: ISetting[]
  ): Promise<Array<{ base64: string; path: string }>> {}

  private async handleRemoveBackgroundBatch(
    dirPath: string
  ): Promise<IpcResponse<FileOperationResult[]>> {
    try {
      const settings = await this.settingModule.getSetting()
      const results = await this.processDirectoryFlat(dirPath, dirPath, settings)
      return {
        result: results,
        code: EventCode.Success
      }
    } catch (error) {
      throw {
        code: EventCode.Error
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

  private buildRembgCommand(imagePath: string, outputPath: string, settings: ISetting[]): string {
    const modelSettings = settings.find((s) => s.category === 'model_setting')?.settings || []
    const postSettings = settings.find((s) => s.category === 'post_process_setting')?.settings || []

    const command = ['rembg', 'i']

    command.push('-m', 'u2net_custom')

    // 指定自定义模型路径和输入尺寸
    const modelPath = path.join(__dirname, '../../resources/u2net.onnx')
    command.push('-x', `'{ "model_path": "${modelPath}" }'`)

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
      const childProcess = exec(
        command,
        {
          timeout: 30000, // 30 秒超时
          maxBuffer: 1024 * 1024 * 10 // 增加缓冲区大小到 10MB
        },
        (error, stdout, stderr) => {
          if (error) {
            reject(new Error(`执行失败: ${stderr}`))
            return
          }
          resolve()
        }
      )

      // 设置更高的进程优先级
      if (process.platform === 'darwin') {
        exec(`renice -n -10 -p ${childProcess.pid}`)
      }
    })
  }
}

export default FileModule
