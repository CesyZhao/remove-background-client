import { ISetting } from '../definitions/setting'
import { AppStorageKeys } from '../definitions/app'
import settingJson from '../config/setting.json'

class Settings {
  settings!: ISetting

  constructor() {
    const key = AppStorageKeys.setting
    const json = localStorage.getItem(key)
    const settings = json ? JSON.parse(json) : settingJson
    this.settings = settings
  }

  saveSettings(settings: ISetting): void {
    const key = AppStorageKeys.setting
    // 更新setting实例
    this.settings = settings
    localStorage.setItem(key, JSON.stringify(settings))
  }

  saveSettig(key: keyof ISetting, value: string) {
    this.settings[key] = value
    localStorage.setItem(key, JSON.stringify(settings))
  }

  getSettings() {
    return this.settings
  }

  getSetting(key: string) {
    return this.settings[key]
  }
}

const settings = new Settings()

export default settings
