import fs from 'fs'
import { ISetting } from '@common/definitions/setting'
import path from 'path'
import { ImageProcessor } from '../core/ImageProcessor'

// 修改 executeRembgCommand 支持批量输入
export const executeRembgCommand = async (command: string): Promise<any> => {
  const processor = await ImageProcessor.init({
    modelPath: path.join(__dirname, '../../resources/u2net'),
    inputSize: 1024
  })

  // 解析批量路径参数（示例：rembg batch input_dir output_dir）
  const [_, inputPath, outputDir] = command.match(/rembg batch (.*?) (.*)/) || []

  // 获取目录下所有图片文件
  const files = await fs.promises.readdir(inputPath)
  const imagePaths = files
    .filter((f) => ['.jpg', '.png', '.webp'].includes(path.extname(f).toLowerCase()))
    .map((f) => path.join(inputPath, f))

  return processor.batchProcess(imagePaths, outputDir)
}

// 删除 buildRembgCommand 函数及其相关代码
export const buildRembgCommand = (
  imagePath: string,
  outputPath: string,
  settings: ISetting[]
): string => {
  const modelSettings = settings.find((s) => s.category === 'model_setting')?.settings || []
  const postSettings = settings.find((s) => s.category === 'post_process_setting')?.settings || []

  const command = ['rembg', 'i']

  command.push('-m', 'u2net_custom')

  // 指定自定义模型路径和输入尺寸
  const modelPath = path.join(__dirname, '../../resources/u2net.onnx')

  const xCommand: Record<string, any> = {
    model_path: modelPath
  }

  // 边缘优化参数
  if (modelSettings.find((s) => s.key === 'edge_refinement')?.value) {
    xCommand.edge_feather = modelSettings.find((s) => s.key === 'edge_feather')?.value
    xCommand.edge_padding = modelSettings.find((s) => s.key === 'edge_padding')?.value
    xCommand.mask_post_process = modelSettings.find((s) => s.key === 'mask_post_process')?.value // 新增
    xCommand.edge_smoothing = modelSettings.find((s) => s.key === 'edge_smoothing')?.value // 新增
  }

  console.log(JSON.stringify(xCommand))

  command.push('-x', `'${JSON.stringify(xCommand)}'`)

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
  console.log(command.join(' '))
  return command.join(' ')
}
