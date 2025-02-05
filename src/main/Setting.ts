import path from "path"
import { readJson } from '@main/util/file'

class Setting {
	settingPath!: string

	constructor () {
		this.settingPath = path.join(__dirname, '/config/setting.json')
	}

	getSetting () {
		return readJson(this.settingPath)
	}
}
