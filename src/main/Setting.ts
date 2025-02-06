import path from 'path'
import { readJson } from '@main/util/file'
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

  writeSetting(setting: ISetting[]) {
    this.setting = setting
  }
}

export default Setting
