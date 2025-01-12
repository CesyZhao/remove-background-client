import path from "path"

class Setting {
	settingPath!: string

	constructor () {
		this.settingPath = path.join(__dirname, '/config/setting.json')
	}

	getSetting () {
		return readJson(this.settingPath)
	}
}