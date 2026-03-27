import type {HxWithPopupSettings} from '../components';
import {
	configHxBox,
	configHxButton,
	configHxFlex,
	configHxGrid,
	configHxInput,
	configHxLabel,
	configHxPopup,
	configHxSelect,
	configHxSeparator,
	configHxTextarea,
	configHxWithCheck,
	configHxWithPopup,
	type HxBoxSettings,
	type HxButtonSettings,
	type HxFlexSettings,
	type HxGridSettings,
	type HxInputSettings,
	type HxLabelSettings,
	type HxPopupSettings,
	type HxSelectSettings,
	type HxSeparatorSettings,
	type HxTextareaSettings,
	type HxWithCheckSettings
} from '../components';
import {configHxContext, type HxContextSettings} from '../contexts';

export interface HxSettingsAll {
	context?: HxContextSettings;

	label?: HxLabelSettings;
	input?: HxInputSettings;
	textarea?: HxTextareaSettings;
	select?: HxSelectSettings;
	button?: HxButtonSettings;

	separator?: HxSeparatorSettings;

	popup?: HxPopupSettings;

	box?: HxBoxSettings;
	flex?: HxFlexSettings;
	grid?: HxGridSettings;

	withCheck?: HxWithCheckSettings;
	withPopup?: HxWithPopupSettings;
}

export class HxSettings {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	static context(settings: HxContextSettings): typeof HxSettings {
		configHxContext(settings);
		return HxSettings;
	}

	static label(settings: HxLabelSettings): typeof HxSettings {
		configHxLabel(settings);
		return HxSettings;
	}

	static input(settings: HxInputSettings): typeof HxSettings {
		configHxInput(settings);
		return HxSettings;
	}

	static textarea(settings: HxTextareaSettings): typeof HxSettings {
		configHxTextarea(settings);
		return HxSettings;
	}

	static select(settings: HxSelectSettings): typeof HxSettings {
		configHxSelect(settings);
		return HxSettings;
	}

	static button(settings: HxButtonSettings): typeof HxSettings {
		configHxButton(settings);
		return HxSettings;
	}

	static separator(settings: HxSeparatorSettings): typeof HxSettings {
		configHxSeparator(settings);
		return HxSettings;
	}

	static popup(settings: HxPopupSettings): typeof HxSettings {
		configHxPopup(settings);
		return HxSettings;
	}

	static box(settings: HxBoxSettings): typeof HxSettings {
		configHxBox(settings);
		return HxSettings;
	}

	static flex(settings: HxFlexSettings): typeof HxSettings {
		configHxFlex(settings);
		return HxSettings;
	}

	static grid(settings: HxGridSettings): typeof HxSettings {
		configHxGrid(settings);
		return HxSettings;
	}

	static withCheck(settings: HxWithCheckSettings): typeof HxSettings {
		configHxWithCheck(settings);
		return HxSettings;
	}

	static withPopup(settings: HxWithPopupSettings): typeof HxSettings {
		configHxWithPopup(settings);
		return HxSettings;
	}

	static setup(settings: HxSettingsAll): typeof HxSettings {
		Object.keys(settings).forEach((key) => {
			const value = settings[key as keyof HxSettingsAll];
			if (value != null) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				HxSettings[key as keyof HxSettingsAll](value as any);
			}
		});

		return HxSettings;
	}
}
