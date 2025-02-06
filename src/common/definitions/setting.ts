export interface ISettingItem {
  name: string
  label: string
  value?: string | number | boolean
}

export interface ISetting {
  category: string
  label: string
  setting: ISettingItem[]
}
