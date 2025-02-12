import EnvModule from './Env'
import FileModule from './File'
import SettingModule from './Setting'

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
