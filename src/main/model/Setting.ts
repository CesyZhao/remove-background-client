import path from 'path'
import { readJson, writeJson } from '@main/util/file'
import { ISetting } from '@common/definitions/setting'

class Setting {
  settingPath!: string
  setting!: ISetting[]

  constructor() {
    this.settingPath = path.join(__dirname, '/config/setting.json')
  }

  async getSetting() {
    let setting
    try {
      setting = await readJson(this.settingPath)
    } catch (e) {
      setting = {}
    }
    this.setting = setting
    return this.setting
  }

  async writeSetting(key: string, value: never) {
    this.setting.forEach((category) => {
      category.settings.forEach((setting) => {
        if (setting.key === key) {
          setting.value = value
        }
      })
    })
    await writeJson(this.settingPath, JSON.stringify(this.setting))
  }
}

export default Setting
