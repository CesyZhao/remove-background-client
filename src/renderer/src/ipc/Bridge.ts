import Env from '@ipc/Env'
import File from '@ipc/File'
import Setting from '@ipc/Setting'

export interface ModuleMap {
  envModule: Env
  fileModule: File
  settingModule: Setting
}

class Bridge {
  modules: ModuleMap

  constructor() {
    this.modules = {
      envModule: new Env(),
      fileModule: new File(),
      settingModule: new Setting()
    }
  }
}

const bridge = new Bridge()

export default bridge
