import { PipelineType, pipeline, env } from '@huggingface/transformers'
import path from 'path'

env.localModelPath = path.join(__dirname, '../../resources/')
env.allowRemoteModels = false


class Pipeline {
  static task: PipelineType = 'background-removal'
  static model = path.join(__dirname, '../../resources/rmbg-2.0') // 改为本地路径
  static instance

  static async getInstance() {
    if (!this.instance) {
      try {
        // 手动加载配置文件
        this.instance = await pipeline(this.task, this.model)
      } catch (error) {
        console.error('加载模型失败:', error)
        throw error
      }
    }
    return this.instance
  }
}

export default Pipeline
