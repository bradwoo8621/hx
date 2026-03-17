import {configHxButton, configHxInput, type HxButtonSettings, type HxInputSettings} from '../components';
import {configHxWithCheck, type HxWithCheckSettings} from '../components/with-check';
import {configHxContext, type HxContextSettings} from '../contexts';

export interface HxSettingsAll {
	context?: HxContextSettings;

	input?: HxInputSettings;
	button?: HxButtonSettings;

	withCheck?: HxWithCheckSettings;
}

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

	static withCheck(settings: HxWithCheckSettings): HxSettings {
		configHxWithCheck(settings);
		return HxSettings;
	}

	static setup(settings: HxSettingsAll): HxSettings {
		const S = HxSettings;

		settings.context != null && S.context(settings.context);

		settings.input != null && S.input(settings.input);
		settings.button != null && S.button(settings.button);

		settings.withCheck != null && S.withCheck(settings.withCheck);

		return HxSettings;
	}
}
