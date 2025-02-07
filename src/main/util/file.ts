import path from 'path'
import fs from 'fs'

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
