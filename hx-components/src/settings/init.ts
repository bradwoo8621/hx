import {
	configHxButton,
	configHxInput,
	configHxLabel,
	type HxButtonSettings,
	type HxInputSettings,
	type HxLabelSettings
} from '../components';
import {configHxWithCheck, type HxWithCheckSettings} from '../components/with-check';
import {configHxContext, type HxContextSettings} from '../contexts';

export interface HxSettingsAll {
	context?: HxContextSettings;

	label?: HxLabelSettings;
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

	static label(settings: HxLabelSettings): HxSettings {
		configHxLabel(settings);
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
		Object.keys(settings).forEach((key) => {
			const value = settings[key as keyof HxSettingsAll];
			if (value != null) {
				HxSettings[key as keyof HxSettingsAll](value);
			}
		});

		return HxSettings;
	}
}
