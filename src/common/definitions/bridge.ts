import { IpcMainEvent } from 'electron'

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

export interface BridgeResponse<T = unknown> {
  code: EventCode
  result?: T
  error?: Error
}

export interface InstallResponse {
  status: string
  code: EventCode
}

export interface FilePickerResponse {
  result: string | null
  code: EventCode
}

export type BridgeEventHandler = (event: IpcMainEvent, ...args: unknown[]) => void | Promise<void>
