import { BridgeEvent, EventCode } from '@common/definitions/bridge'
import { ISetting, ISettingItem } from '@common/definitions/setting'

const { electron } = window
const { ipcRenderer } = electron

class Setting {
  private settings: ISetting[] = []

  constructor() {
    this.initSettings()
  }

  private async initSettings(): Promise<void> {
    try {
      const settings = await this.getSetting()
      this.settings = settings as ISetting[]
    } catch (error) {
      console.error('Failed to initialize settings:', error)
    }
  }

  async getSetting(): Promise<ISetting[]> {
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

  getSettingValue(key: string): string | number | boolean | undefined {
    for (const category of this.settings) {
      const setting = category.settings.find(item => item.key === key)
      if (setting) {
        return setting.value
      }
    }
    return undefined
  }

  getSettingsByCategory(category: string): ISettingItem[] {
    const categoryData = this.settings.find(item => item.category === category)
    return categoryData?.settings || []
  }
}

export default Setting
