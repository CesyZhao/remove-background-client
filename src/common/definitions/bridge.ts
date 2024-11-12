export enum BridgeEvent {
  InstallRembg = 'InstallRembg',
  InstallRembgReply = 'InstallRembgReply',
  InstallPython = 'InstallPython',
  InstallPythonReply = 'InstallPythonReply',
  pickFileOrDirectory = 'pickFileOrDirectory',
  pickFileOrDirectoryReply = 'pickFileOrDirectoryReply'
}

export enum FileSelectorType {
  SingleFile = 'SingleFile',
  Multiple = 'Multiple',
  Folder = 'Folder'
}

export enum EnvStatus {
  PythonNotInstalled = 'PythonNotInstalled',
  RembgNotInstalled = 'RembgNotInstalled',
  PythonInstalled = 'PythonInstalled',
  RembgInstalled = 'RembgInstalled',
  Checking = 'Checking'
}
