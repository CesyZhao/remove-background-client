import { FileSelectorType, FileSelectorCommand } from '../../common/definitions/bridge'

export const fileSelectorCommandMap: Map<FileSelectorType, FileSelectorCommand> = new Map([
  [FileSelectorType.SingleFile, FileSelectorCommand.openFile],
  [FileSelectorType.Multiple, FileSelectorCommand.multiSelections],
  [FileSelectorType.Folder, FileSelectorCommand.openDirectory]
])
