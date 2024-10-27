import { FileSelectorType } from '../../common/definitions/bridge'

export const fileSelectorCommandMap = new Map([
  [FileSelectorType.SingleFile, 'openFile'],
  [FileSelectorType.Multiple, 'multiSelections'],
  [FileSelectorType.Folder, 'openDirectory']
])
