import { EnvModule } from './modules/EnvModule'
import { FileModule } from './modules/FileModule'
import { BridgeModuleMap } from '../definitions/bridge'

class Bridge {
  private modules: BridgeModuleMap

  constructor() {
    this.modules = {
      env: new EnvModule(),
      file: new FileModule()
    }
    this.initializeModules()
  }

  private initializeModules(): void {
    Object.values(this.modules).forEach((module) => {
      module.initialize()
    })
  }

  public destroy(): void {
    Object.values(this.modules).forEach((module) => {
      module.destroy()
    })
  }

  public getModule<K extends keyof BridgeModuleMap>(name: K): BridgeModuleMap[K] {
    return this.modules[name]
  }
}

export default Bridge
