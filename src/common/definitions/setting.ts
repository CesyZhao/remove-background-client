export interface ISettingItem {
  key: string
  title: string
  value?: string | number | boolean
}

export interface ISetting {
  category: string
  title: string
  settings: ISettingItem[]
}
