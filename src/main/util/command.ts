import { exec } from 'child_process'
import { ISetting } from '@common/definitions/setting'
import path from 'path'

export const executeRembgCommand = (command: string): Promise<void> => {
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

export const buildRembgCommand = (imagePath: string, outputPath: string, settings: ISetting[]): string => {
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
    command.push('-b', bgcolor + '')
  }

  command.push(imagePath, outputPath)
  return command.join(' ')
}
