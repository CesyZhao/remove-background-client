import Env from '@ipc/Env'
import File from '@ipc/File'
import Setting from '@ipc/Setting'

export interface ModuleMap {
  env: Env
  file: File
  setting: Setting
}

class Bridge {
  modules: ModuleMap

  constructor() {
    this.modules = {
      env: new Env(),
      file: new File(),
      setting: new Setting()
    }
  }
}

const bridge = new Bridge()

export default bridge
