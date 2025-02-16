import EnvModule from '@core/Env'
import FileModule from '@core/File'
import SettingModule from '@core/Setting'

export interface ModuleMap {
  env: EnvModule
  file: FileModule
  setting: SettingModule
}

class Bridge {
  private modules: ModuleMap

  constructor() {
    this.modules = {
      env: new EnvModule(),
      file: new FileModule(),
      setting: new SettingModule()
    }
  }

  public getModule<K extends keyof ModuleMap>(name: K): ModuleMap[K] {
    return this.modules[name]
  }

  public destroy(): void {
    Object.values(this.modules).forEach((module) => {
      module.destroy()
    })
  }
}

export default Bridge
