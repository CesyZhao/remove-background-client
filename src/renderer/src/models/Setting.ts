import { ISetting } from '../definitions/setting'
import { AppStorageKeys } from '../definitions/app'
import settingJson from '../config/setting.json'

class Setting {
  setting!: ISetting

  restoreSetting(): void {
    const key = AppStorageKeys.setting
    const json = localStorage.getItem(key)
    const setting = json ? JSON.parse(json) : settingJson
    return setting
  }

  saveSetting(setting: ISetting): void {
    console.log(setting, '=======')
    const key = AppStorageKeys.setting
    localStorage.setItem(key, JSON.stringify(setting))
    // 更新setting实例
    this.setting = setting
  }
}

const setting = new Setting()

export default setting
