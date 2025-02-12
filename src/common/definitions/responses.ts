import { EventCode } from './events'

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