import {configHxInput, type HxInputSettings} from '../components';
import {configHxContext, type HxContextSettings} from '../contexts';

export class HxSettings {
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
}
