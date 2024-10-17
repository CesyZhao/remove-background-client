export enum BridgeEvent {
  InstallRembg = 'InstallRembg',
  InstallRembgReply = 'InstallRembgReply',
  InstallPython = 'InstallPython',
  InstallPythonReply = 'InstallPythonReply',
  ChooseFileOrFolder = 'ChooseFileOrFolder',
  ChooseFileOrFolderReply = 'ChooseFileOrFolderReply'
}

export enum FileSelectorType {
  SingleFile = 'SingleFile',
  Multiple = 'Multiple',
  Folder = 'Folder'
}

export const fileSelectorCommandMap = new Map([
  [FileSelectorType.SingleFile, 'openFile'],
  [FileSelectorType.Multiple, 'multiSelections'],
  [FileSelectorType.Folder, 'openDirectory']
])
