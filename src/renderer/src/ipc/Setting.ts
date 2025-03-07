import { IpcResponse } from '@common/definitions/bridge'
import { ISetting, ISettingItem } from '@common/definitions/setting'
const { electron } = window

class Setting {
  private setting: ISetting[] = []

  constructor() {
    this.initSettings()
  }

  private async initSettings() {
    try {
      const { result: setting } = await electron.getSetting<IpcResponse<ISetting[]>>()
      this.setting = setting
    } catch (error) {
      console.error('Error initializing settings:', error)
      this.setting = []
    }
  }

  async refreshSettings() {
    await this.initSettings()
  }

  async writeSetting(key: string, value: string | number | boolean) {
    await electron.setSetting(key, value)
    await this.initSettings()
  }

  async resetSetting() {
    const result = await electron.resetSetting()
    await this.initSettings()
    return result
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
