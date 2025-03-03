import { BridgeEvent, EventCode } from '@common/definitions/bridge'
import { ISetting, ISettingItem } from '@common/definitions/setting'
const { electron } = window

class Setting {
  private setting: ISetting[] = []

  constructor() {
    this.initSettings()
  }

  private async initSettings() {
    return electron.getSetting()
  }

  async refreshSettings() {
    await this.initSettings()
  }

  async writeSetting(key: string, value: string | number | boolean) {
    await electron.writeSetting({ key, value })
  }

  getSetting(): ISetting[] {
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
