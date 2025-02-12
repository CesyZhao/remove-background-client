import EnvModule from './Env'
import FileModule from './File'

export interface ModuleMap {
  env: EnvModule
  file: FileModule
}

class Bridge {
  private modules: ModuleMap

  constructor() {
    this.modules = {
      env: new EnvModule(),
      file: new FileModule()
    }
  }

  public destroy(): void {
    Object.values(this.modules).forEach((module) => {
      module.destroy()
    })
  }
}

export default Bridge
