import {
	configHxActions,
	configHxBadge,
	configHxBox,
	configHxButton,
	configHxButtonBar,
	configHxCheckbox,
	configHxFlex,
	configHxGrid,
	configHxInput,
	configHxLabel,
	configHxMCheckbox,
	configHxMRadio,
	configHxOverlay,
	configHxPagination,
	configHxPanel,
	configHxRadio,
	configHxSelect,
	configHxSeparator,
	configHxTabs,
	configHxTextarea,
	configHxUpload,
	configHxWithCheck,
	configHxWithPopup,
	type HxActionsSettings,
	type HxBadgeSettings,
	type HxBoxSettings,
	type HxButtonBarSettings,
	type HxButtonSettings,
	type HxCheckboxSettings,
	type HxFlexSettings,
	type HxGridSettings,
	type HxInputSettings,
	type HxLabelSettings,
	type HxMCheckboxSettings,
	type HxMRadioSettings,
	type HxOverlaySettings,
	type HxPaginationSettings,
	type HxPanelSettings,
	type HxRadioSettings,
	type HxSelectSettings,
	type HxSeparatorSettings,
	type HxTabsSettings,
	type HxTextareaSettings,
	type HxUploadSettings,
	type HxWithCheckSettings,
	type HxWithPopupSettings
} from '../components';
import {configHxContext, type HxContextSettings} from '../contexts';

export interface HxSettingsAll {
	context?: HxContextSettings;

	label?: HxLabelSettings;
	badge?: HxBadgeSettings;
	input?: HxInputSettings;
	textarea?: HxTextareaSettings;
	checkbox?: HxCheckboxSettings;
	mCheckbox?: HxMCheckboxSettings;
	radio?: HxRadioSettings;
	mRadio?: HxMRadioSettings;
	select?: HxSelectSettings;
	button?: HxButtonSettings;
	actions?: HxActionsSettings;
	upload?: HxUploadSettings;

	separator?: HxSeparatorSettings;

	box?: HxBoxSettings;
	flex?: HxFlexSettings;
	grid?: HxGridSettings;
	panel?: HxPanelSettings;
	buttonBar?: HxButtonBarSettings;
	tabs?: HxTabsSettings;

	pagination?: HxPaginationSettings;

	overlay?: HxOverlaySettings;

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

	static badge(settings: HxBadgeSettings): typeof HxSettings {
		configHxBadge(settings);
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

	static checkbox(settings: HxCheckboxSettings): typeof HxSettings {
		configHxCheckbox(settings);
		return HxSettings;
	}

	static mCheckbox(settings: HxMCheckboxSettings): typeof HxSettings {
		configHxMCheckbox(settings);
		return HxSettings;
	}

	static radio(settings: HxRadioSettings): typeof HxSettings {
		configHxRadio(settings);
		return HxSettings;
	}

	static mRadio(settings: HxMRadioSettings): typeof HxSettings {
		configHxMRadio(settings);
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

	static actions(settings: HxActionsSettings): typeof HxSettings {
		configHxActions(settings);
		return HxSettings;
	}

	static upload(settings: HxUploadSettings): typeof HxSettings {
		configHxUpload(settings);
		return HxSettings;
	}

	static separator(settings: HxSeparatorSettings): typeof HxSettings {
		configHxSeparator(settings);
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

	static panel(settings: HxPanelSettings): typeof HxSettings {
		configHxPanel(settings);
		return HxSettings;
	}

	static buttonBar(settings: HxButtonBarSettings): typeof HxSettings {
		configHxButtonBar(settings);
		return HxSettings;
	}

	static tabs(settings: HxTabsSettings): typeof HxSettings {
		configHxTabs(settings);
		return HxSettings;
	}

	static pagination(settings: HxPaginationSettings): typeof HxSettings {
		configHxPagination(settings);
		return HxSettings;
	}

	static overlay(settings: HxOverlaySettings): typeof HxSettings {
		configHxOverlay(settings);
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
