import sharp from 'sharp'
import path from 'path'
import Pipeline from './Pipeline'
import { RawImage } from '@huggingface/transformers'

type ImageProcessorConfig = {
  inputSize: number
}

export class ImageProcessor {
  private static instance: ImageProcessor

  private constructor(private config: ImageProcessorConfig) {}

  public static async init(config: ImageProcessorConfig) {
    if (!this.instance) {
      // 初始化管道实例
      await Pipeline.getInstance()

      ImageProcessor.instance = new ImageProcessor(config)
    }
    return this.instance
  }

  static getInstance() {
    return ImageProcessor.instance
  }

  async removeBackground(imagePath: string, outputPath: string): Promise<void> {
    try {
      const model = await Pipeline.getInstance()

      const image = await sharp(imagePath)
        .resize(this.config.inputSize, this.config.inputSize, {
          fit: 'cover',
          withoutEnlargement: true
        })
        .toBuffer()

      // 使用正确的 MIME 类型创建 Blob
      const imageBlob = new Blob([image], { type: 'image/jpeg' }) // 根据实际格式调整
      const rawImage = await RawImage.fromBlob(imageBlob)
      let mask

      try {
        // 添加错误处理包装模型调用
        const { mask: result } = await model(rawImage)
        mask = result
      } catch (error) {
        console.error('蒙版生成失败:', error)
        throw error
      }

      // 确保 mask 存在后再处理
      if (!mask) {
        throw new Error('未生成有效蒙版')
      }

      // 恢复输出处理并添加流控制
      await sharp(image)
        .composite([{ input: mask, blend: 'dest-in' }])
        .toFile(outputPath)
    } catch (error) {
      console.error('背景移除失败:', error)
      throw error // 保持错误冒泡
    }
  }

  // 保持原有批量处理方法不变
  async batchProcess(imagePaths: string[], outputDir: string) {
    const results = { success: [] as string[], failed: [] as string[] }

    // 并行处理控制（建议根据硬件配置调整）
    const concurrency = 4 // 推荐 M1 芯片设置为 4-6
    const queue = imagePaths.map((p, i) => ({
      input: p,
      output: path.join(outputDir, `${path.parse(p).name}_${i}.png`)
    }))

    const promises = queue.map(async ({ input, output }) => {
      try {
        await this.removeBackground(input, output)
        return { status: 'success', path: output }
      } catch (error) {
        console.error(`处理失败: ${input}`, error)
        return { status: 'failed', path: input }
      }
    })

    // 使用 Promise.allSettled 处理并发
    const settled = await Promise.allSettled(promises)
    settled.forEach((result) => {
      if (result.status === 'fulfilled') {
        result.value.status === 'success'
          ? results.success.push(result.value.path)
          : results.failed.push(result.value.path)
      } else {
        results.failed.push(result.reason.path)
      }
    })

    return results
  }
}
