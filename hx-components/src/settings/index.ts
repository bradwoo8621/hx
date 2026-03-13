import {configHxButton, configHxInput, type HxButtonSettings, type HxInputSettings} from '../components';
import {configHxContext, type HxContextSettings} from '../contexts';

export class HxSettings {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	static context(settings: HxContextSettings): HxSettings {
		configHxContext(settings);
		return HxSettings;
	}

	static input(settings: HxInputSettings): HxSettings {
		configHxInput(settings);
		return HxSettings;
	}

	static button(settings: HxButtonSettings): HxSettings {
		configHxButton(settings);
		return HxSettings;
	}
}
