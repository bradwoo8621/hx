import type {WithRequired} from '../../types';
import {amendPopupGapToEdge, amendPopupZIndex} from '../popup/defaults';

/**
 * Global configuration settings for select component
 */
export interface HxSelectSettings {
	onOptionsChange?: 'none' | 'clear';
	/** Minimum width for the select popup dropdown */
	minPopupWidth?: number;
	/** Maximum height for the select popup dropdown */
	maxPopupHeight?: number;
	/** Z-index base for select popup layers */
	zIndex?: number;
	/** Minimum spacing between the popup edge and viewport boundary */
	gapToEdge?: number;
	/** Popup with at minimum same width with trigger */
	sameWidthAtMinimum?: boolean;
	enterToOpenPopup?: boolean;
	spaceToOpenPopup?: boolean;
	showSelectedOnPopupOpen?: boolean;
	/** Show filter input when option count exceeds this threshold */
	filterWhenOptionExceed?: number;
	/** Whether to show placeholder when no option selected */
	placeholder?: boolean;
	/** i18n translation key for placeholder text */
	placeholderKey?: string;
	/** i18n translation key for loading state text */
	optionsOnLoadKey?: string;
}

type RequiredProps =
	| 'sameWidthAtMinimum'
	| 'onOptionsChange'
	| 'maxPopupHeight'
	| 'enterToOpenPopup'
	| 'spaceToOpenPopup'
	| 'showSelectedOnPopupOpen'
	| 'placeholder'
	| 'placeholderKey'
	| 'optionsOnLoadKey';

/**
 * Default configuration values for select component
 */
export const HxSelectDefaults: WithRequired<HxSelectSettings, RequiredProps> = {
	sameWidthAtMinimum: true,
	onOptionsChange: 'clear',
	// Default: 8 rows * 32px row height + 2px border = 258px
	maxPopupHeight: 258,
	enterToOpenPopup: false,
	spaceToOpenPopup: true,
	showSelectedOnPopupOpen: true,
	placeholder: true,
	placeholderKey: '~HxCommon.SelectPlaceHolder',
	optionsOnLoadKey: '~HxCommon.OptionsOnLoad'
};

/**
 * Configure global select component settings
 * @param settings - Configuration options to override defaults
 */
export const configHxSelect = (settings: HxSelectSettings) => {
	HxSelectDefaults.sameWidthAtMinimum = settings.sameWidthAtMinimum ?? HxSelectDefaults.sameWidthAtMinimum;
	HxSelectDefaults.onOptionsChange = settings.onOptionsChange ?? HxSelectDefaults.onOptionsChange;
	HxSelectDefaults.minPopupWidth = settings.minPopupWidth;
	HxSelectDefaults.maxPopupHeight = settings.maxPopupHeight ?? HxSelectDefaults.maxPopupHeight;
	// Enforce minimum 200px popup max height
	if (HxSelectDefaults.maxPopupHeight < 200) {
		HxSelectDefaults.maxPopupHeight = 200;
	}
	HxSelectDefaults.zIndex = amendPopupZIndex(settings.zIndex);
	HxSelectDefaults.gapToEdge = amendPopupGapToEdge(settings.gapToEdge);
	HxSelectDefaults.enterToOpenPopup = settings.enterToOpenPopup ?? HxSelectDefaults.enterToOpenPopup;
	HxSelectDefaults.spaceToOpenPopup = settings.spaceToOpenPopup ?? HxSelectDefaults.spaceToOpenPopup;
	HxSelectDefaults.filterWhenOptionExceed = settings.filterWhenOptionExceed;
	HxSelectDefaults.showSelectedOnPopupOpen = settings.showSelectedOnPopupOpen ?? HxSelectDefaults.showSelectedOnPopupOpen;
	HxSelectDefaults.placeholder = settings.placeholder ?? HxSelectDefaults.placeholder;
	HxSelectDefaults.placeholderKey = settings.placeholderKey?.trim() || HxSelectDefaults.placeholderKey;
	HxSelectDefaults.optionsOnLoadKey = settings.optionsOnLoadKey?.trim() || HxSelectDefaults.optionsOnLoadKey;
};
