export type SettingType = 'path' | 'select' | 'boolean' | 'number' | 'color'

export interface ISettingItem {
  key: string
  title: string
  type: SettingType
  description: string
  value?: string | number | boolean
  options?: string[]
  min?: number
  max?: number
}

export interface ISetting {
  category: string
  title: string
  settings: ISettingItem[]
}
