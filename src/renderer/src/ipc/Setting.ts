import { BridgeEvent, EventCode } from '@common/definitions/bridge'
import { ISetting, ISettingItem } from '@common/definitions/setting'

const { electron } = window
const { ipcRenderer } = electron

class Setting {
  private setting: ISetting[] = []

  constructor() {
    this.initSettings()
  }

  private async initSettings(): Promise<void> {
    try {
      const setting = await this.getSettingFromMain()
      console.log(setting, '+++++++++++++++++++++')
      this.setting = setting as ISetting[]
    } catch (error) {
      console.error('Failed to initialize settings:', error)
    }
  }

  async getSettingFromMain(): Promise<ISetting[]> {
    return new Promise((resolve, reject) => {
      const func = electron[`on${BridgeEvent.GetSettingReply}`]

      func(({ data, code, error }) => {
        code === EventCode.Success ? resolve(data) : reject(error)
      })

      ipcRenderer.send(BridgeEvent.GetSetting)
    })
  }

  async writeSetting(key: string, value: string | number | boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const func = electron[`on${BridgeEvent.WriteSettingReply}`]

      func(({ code, error }) => {
        code === EventCode.Success ? resolve() : reject(error)
      })

      ipcRenderer.send(BridgeEvent.WriteSetting, key, value)
    })
  }

  getSetting() {
    return this.setting
  }

  getSettingValue(key: string): string | number | boolean | undefined {
    for (const category of this.setting) {
      const setting = category.settings.find((item) => item.key === key)
      if (setting) {
        return setting.value
      }
    }
    return undefined
  }

  getSettingsByCategory(category: string): ISettingItem[] {
    const categoryData = this.setting.find((item) => item.category === category)
    return categoryData?.settings || []
  }
}

export default Setting
