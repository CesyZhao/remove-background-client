import { app } from 'electron'
import { BridgeEvent, EventCode, IpcResponse } from '@common/definitions/bridge'
import { ISetting } from '@common/definitions/setting'
import BaseModule from './Base'
import path from 'path'
import { readJson, writeJson, isFileExist, isSettingCategory } from '@util/file' // 新增 readFileRaw

class SettingModule extends BaseModule {
  private settingPath: string
  private defaultSettingPath: string
  private setting!: ISetting[]

  constructor(ignoreEvents?: boolean) {
    super('setting', ignoreEvents)
    const appPath = app.getAppPath()
    this.settingPath = path.join(appPath, 'src', 'main', 'setting.json')
    this.defaultSettingPath = path.join(appPath, 'src', 'main', 'default-setting.json')
    this.init()
  }

  protected registerEvents(): void {
    this.registerHandler(BridgeEvent.GetSetting, this.handleGetSetting)
    this.registerHandler(BridgeEvent.SetSetting, this.handleWriteSetting)
    this.registerHandler(BridgeEvent.ResetSetting, this.handleResetSetting) // 新增事件注册
  }

  // 新增重置处理方法
  private async handleResetSetting(): Promise<IpcResponse<boolean>> {
    try {
      await this.resetToDefault()
      return {
        result: true,
        code: EventCode.Success
      }
    } catch (error) {
      console.error('重置设置失败:', error)
      throw {
        code: EventCode.Error,
        result: false
      }
    }
  }

  // 新增重置核心逻辑
  private async resetToDefault(): Promise<void> {
    const defaultSettings = await this.loadDefaultSettings()
    await writeJson(this.settingPath, JSON.stringify(defaultSettings))
    this.setting = defaultSettings
  }

  private async loadDefaultSettings(): Promise<ISetting[]> {
    // 直接从文件读取原始数据，避免任何修改
    const rawData = await readJson(this.defaultSettingPath)
    return rawData as ISetting[]
  }

  private async loadSettings() {
    try {
      // 如果用户设置文件不存在，从默认配置创建
      if (!(await isFileExist(this.settingPath))) {
        const defaultSettings = await this.loadDefaultSettings()
        await writeJson(this.settingPath, JSON.stringify(defaultSettings))
      }

      // 加载用户配置
      const userData = await readJson(this.settingPath)

      // 验证配置有效性
      if (!Array.isArray(userData) || !userData.every((item) => isSettingCategory(item))) {
        // 用户配置损坏时，用默认配置重置
        const defaultSettings = await this.loadDefaultSettings()
        await writeJson(this.settingPath, JSON.stringify(defaultSettings))
        this.setting = defaultSettings
      } else {
        this.setting = userData as ISetting[]
      }
    } catch (e) {
      console.error('Settings initialization failed:', e)
      // 错误处理时也使用默认配置
      try {
        const defaultSettings = await this.loadDefaultSettings()
        this.setting = defaultSettings
        await writeJson(this.settingPath, JSON.stringify(defaultSettings))
      } catch (error) {
        console.error('Critical error loading default settings:', error)
        this.setting = []
      }
    }
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
