import { IpcMainEvent } from 'electron'
import { getFileByPath, isSettingCategory, readJson, writeJson } from '@util/file'
import { ISetting } from '@common/definitions/setting'
import { BridgeEvent, EventCode } from '@common/definitions/bridge'
import BaseModule from './Base'
import { app } from 'electron'
import path from 'path'

class SettingModule extends BaseModule {
  private settingPath: string
  private setting!: ISetting[]

  constructor() {
    super()
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
    this.registerHandler(BridgeEvent.WriteSetting, this.handleWriteSetting)
  }

  private async init() {
    await this.loadSettings()
  }

  private async handleGetSetting(event: IpcMainEvent): Promise<void> {
    try {
      const settings = await this.getSetting()
      console.log(settings, '================')
      event.reply(BridgeEvent.GetSettingReply, {
        data: settings,
        code: EventCode.Success
      })
    } catch (e) {
      event.reply(BridgeEvent.GetSettingReply, {
        code: EventCode.Error,
        error: e
      })
    }
  }

  private async handleWriteSetting(event: IpcMainEvent, key: string, value: never): Promise<void> {
    try {
      await this.writeSetting(key, value)
      event.reply(BridgeEvent.WriteSettingReply, {
        code: EventCode.Success
      })
    } catch (e) {
      event.reply(BridgeEvent.WriteSettingReply, {
        code: EventCode.Error,
        error: e
      })
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
