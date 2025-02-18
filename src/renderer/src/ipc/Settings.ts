import { ISetting } from '@definitions/setting'
import { AppStorageKeys } from '@definitions/app'
import { BridgeEvent, EventCode } from '@common/definitions/bridge'

const { electron } = window
const { ipcRenderer } = electron

class Settings {
  settings!: ISetting

  constructor() {

  }

  saveSettings(settings: ISetting): void {
    const key = AppStorageKeys.setting
    // 更新setting实例
    this.settings = settings
    localStorage.setItem(key, JSON.stringify(settings))
  }

  saveSetting(key: keyof ISetting, value: string) {
    this.settings[key] = value
    localStorage.setItem(key, JSON.stringify(settings))
  }

  getSetting() {
    return new Promise((resolve, reject) => {
      const func = electron[`on${BridgeEvent.GetSettingReply}`]

      func(({ result, code }) => {
        code === EventCode.Success ? resolve(result) : reject(code)
      })

      ipcRenderer.send(BridgeEvent.GetSetting)
    })
  }
}

const settings = new Settings()

export default settings
