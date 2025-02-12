export enum BridgeEvent {
  InstallRembg = 'InstallRembg',
  InstallRembgReply = 'InstallRembgReply',
  InstallPython = 'InstallPython',
  InstallPythonReply = 'InstallPythonReply',
  PickFileOrDirectory = 'PickFileOrDirectory',
  PickFileOrDirectoryReply = 'PickFileOrDirectoryReply'
}

export enum FileSelectorType {
  SingleFile = 'SingleFile',
  Multiple = 'Multiple',
  Folder = 'Folder'
}

export enum FileSelectorCommand {
  openFile = 'openFile',
  multiSelections = 'multiSelections',
  openDirectory = 'openDirectory'
}

export enum EnvStatus {
  PythonNotInstalled = 'PythonNotInstalled',
  RembgNotInstalled = 'RembgNotInstalled',
  PythonInstalled = 'PythonInstalled',
  RembgInstalled = 'RembgInstalled',
  Checking = 'Checking'
}

export enum EventCode {
  Success = 'Success',
  Error = 'Error'
}
