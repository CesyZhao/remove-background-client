export enum BridgeEvent {
  InstallRemBG = 'InstallRemBG',
  InstallRemBGReply = 'InstallRemBGReply',
  InstallPython = 'InstallPython',
  InstallPythonReply = 'InstallPythonReply',
  PickFileOrDirectory = 'PickFileOrDirectory',
  PickFileOrDirectoryReply = 'PickFileOrDirectoryReply',
  GetSetting = 'GetSetting',
  GetSettingReply = 'GetSettingReply',
  WriteSetting = 'WriteSetting',
  WriteSettingReply = 'WriteSettingReply',
  RemoveBackground = 'RemoveBackground',
  RemoveBackgroundReply = 'RemoveBackgroundReply',
  GetImagePreview = 'GetImagePreview',
  GetImagePreviewReply = 'GetImagePreviewReply',
  DeleteImage = 'DeleteImage',
  DeleteImageReply = 'DeleteImageReply',
  RevealInFinder = 'RevealInFinder',
  RevealInFinderReply = 'RevealInFinderReply',
  RemoveBackgroundBatch = 'RemoveBackgroundBatch',
  RemoveBackgroundBatchReply = 'RemoveBackgroundBatchReply',
  GetDirectoryImages = 'GetDirectoryImages',
  GetDirectoryImagesReply = 'GetDirectoryImagesReply'
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
  RemBGNotInstalled = 'RemBGNotInstalled',
  PythonInstalled = 'PythonInstalled',
  RemBGInstalled = 'RemBgInstalled',
  Checking = 'Checking'
}

export enum EventCode {
  Success = 'Success',
  Error = 'Error'
}
