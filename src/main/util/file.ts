import path from 'path'
import fs from 'fs'
import { ISetting } from '@common/definitions/setting'

export const getFilePath = (pathBasedOnDiractory: string) => {
  const targetPath = path.join(__dirname, pathBasedOnDiractory)
  return targetPath
}

export const readJson = (filePath: string) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err)
        return
      }
      try {
        const json = JSON.parse(data)
        resolve(json) // 使用json数据
      } catch (err) {
        reject(err)
      }
    })
  })
}

export const writeJson = (filePath: string, data: string) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, 'utf-8', (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve(void 0)
    })
  })
}

// 添加一个辅助函数来验证设置类别
export const isSettingCategory = (obj: unknown): obj is ISetting => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'settings' in obj &&
    Array.isArray((obj as ISetting).settings) &&
    (obj as ISetting).settings.every((setting) => setting.value !== undefined)
  )
}
