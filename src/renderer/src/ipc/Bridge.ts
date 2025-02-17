import Env from '@ipc/Env'
import File from '@ipc/File'

export interface ModuleMap {
  env: Env
  file: File
}

class Bridge {
  private modules: ModuleMap
  constructor() {
    this.modules = {
      env: new Env(),
      file: new File()
    }
  }

}

const bridge = new Bridge()

export default bridge
