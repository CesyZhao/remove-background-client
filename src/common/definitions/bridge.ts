export enum BridgeEvent {
  InstallRemBG = 'installRemBG',
  InstallPython = 'installPython',
  PickFileOrDirectory = 'pickFileOrDirectory',
  GetImagePreview = 'getImagePreview',
  RemoveBackground = 'removeBackground',
  RemoveBackgroundFromBase64 = 'removeBackgroundFromBase64',
  RemoveBackgroundBatch = 'removeBackgroundBatch',
  GetDirectoryImages = 'getDirectoryImages',
  DeleteImage = 'deleteImage',
  RevealInFinder = 'revealInFinder',
  GetSetting = 'getSetting',
  SetSetting = 'setSetting'
}

export enum FileSelectorCommand {
  openFile = 'openFile',
  openDirectory = 'openDirectory',
  multiSelections = 'multiSelections'
}

export enum FileSelectorType {
  SingleFile = 'SingleFile',
  Multiple = 'Multiple',
  Folder = 'Folder'
}

export const fileSelectorCommandMap = new Map<FileSelectorType, FileSelectorCommand>([
  [FileSelectorType.SingleFile, FileSelectorCommand.openFile],
  [FileSelectorType.Folder, FileSelectorCommand.openDirectory]
])

export enum EnvStatus {
  PythonNotInstalled = 'PythonNotInstalled',
  RemBGNotInstalled = 'RemBGNotInstalled',
  PythonInstalled = 'PythonInstalled',
  RemBGInstalled = 'RemBgInstalled',
  RemBGInstalling = 'RemBGInstalling',
  Checking = 'Checking'
}

export enum EventCode {
  Pending = 'Pending',
  Success = 'Success',
  Error = 'Error'
}

export interface IpcResponse<T> {
  code: EventCode
  result: T
  error?: string
}

export interface FileOperationResult {
  base64?: string
  outputPath?: string
}

export interface IPickFileResult {
  path?: string
  isDirectory?: boolean
}

export type IGetImagePreviewResult = Array<{ path: string }>