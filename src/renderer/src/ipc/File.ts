import { BridgeEvent, EventCode, FileSelectorType } from '@common/definitions/bridge'
const { electron } = window
const { ipcRenderer } = electron

class File {
  async pickFileOrDirectory(types: FileSelectorType[]): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      const func = electron[`on${BridgeEvent.PickFileOrDirectoryReply}`]

      func(({ result, code }) => {
        code === EventCode.Success ? resolve(result) : reject(code)
      })

      ipcRenderer.send(BridgeEvent.PickFileOrDirectory, types)
    })
  }
}

export default File
