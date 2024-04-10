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
}

const setting = new Setting()

export default setting
