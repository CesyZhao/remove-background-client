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
    this.registerHandler<[string]>(BridgeEvent.DeleteImage, this.deleteImage)
    this.registerHandler<[string]>(BridgeEvent.RevealInFinder, this.revealInFinder)

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

      this.sendReply(event, BridgeEvent.PickFileOrDirectoryReply, {
        result: result.canceled ? undefined : result.filePaths[0],
        code: EventCode.Success
      })
    } catch (e) {
      this.sendReply(event, BridgeEvent.PickFileOrDirectoryReply, {
        result: undefined,
        code: EventCode.Error
      })
    }
  }

  private getOutputPath(imagePath: string, settings: ISetting[]): string {
    const basicSettings = settings.find((s) => s.category === 'basic_setting')
    const outputDir = basicSettings?.settings.find((s) => s.key === 'output_directory')
      ?.value as string
    const format = basicSettings?.settings.find((s) => s.key === 'output_format')?.value as string

    const fileName = path.basename(imagePath, path.extname(imagePath))
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
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`执行失败: ${stderr}`))
          return
        }
        resolve()
      })
    })
  }

  private async handleGetImagePreview(event: IpcMainEvent, imagePath: string): Promise<void> {
    try {
      const imageBuffer = fs.readFileSync(imagePath)
      const base64Image = imageBuffer.toString('base64')
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
