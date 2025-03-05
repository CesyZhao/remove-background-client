import { app } from 'electron'
import { BridgeEvent, EventCode, IpcResponse } from '@common/definitions/bridge'
import { ISetting } from '@common/definitions/setting'
import BaseModule from './Base'
import path from 'path'
import { isSettingCategory, readJson, writeJson } from '@util/file'

class SettingModule extends BaseModule {
  private settingPath: string
  private setting!: ISetting[]

  constructor(ignoreEvents?: boolean) {
    super('setting', ignoreEvents)
    // 修改路径获取方式
    this.settingPath = path.join(app.getAppPath(), 'src', 'main', 'setting.json')
    this.init()
  }

  private async loadSettings() {
    try {
      const data = await readJson(this.settingPath)
      if (Array.isArray(data) && data.every((item) => isSettingCategory(item))) {
        this.setting = data as ISetting[]
      } else {
        this.setting = []
      }
    } catch (e) {
      console.error('Failed to load settings:', e)
      this.setting = []
    }
  }

  protected registerEvents(): void {
    this.registerHandler(BridgeEvent.GetSetting, this.handleGetSetting)
    this.registerHandler(BridgeEvent.SetSetting, this.handleWriteSetting)
  }

  private async init() {
    await this.loadSettings()
  }

  private async handleGetSetting(): Promise<IpcResponse<ISetting[]>> {
    try {
      const settings = await this.getSetting()
      return {
        result: settings,
        code: EventCode.Success
      }
    } catch (error) {
      throw {
        code: EventCode.Error,
        result: {}
      }
    }
  }

  private async handleWriteSetting(_, key: string, value: never): Promise<void> {
    console.log(key, '---------')
    console.log(value, '++++++++')
    try {
      await this.writeSetting(key, value)
    } catch (e) {
      throw {
        code: EventCode.Error
      }
    }
  }

  async getSetting() {
    if (!this.setting) {
      await this.loadSettings()
    }
    return this.setting
  }

  async writeSetting(key: string, value: never) {
    if (!this.setting) {
      await this.loadSettings()
    }

    let updated = false
    this.setting.forEach((category) => {
      category.settings.forEach((setting) => {
        if (setting.key === key) {
          setting.value = value
          updated = true
        }
      })
    })

    if (updated) {
      await this.saveSettings()
    }
  }

  private async saveSettings() {
    await writeJson(this.settingPath, JSON.stringify(this.setting))
  }

  destroy(): void {
    // 清理资源（如果需要）
    this.setting = []
  }
}

export default SettingModule
