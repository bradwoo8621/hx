import type {WithPartial} from '../../types';
import {amendPopupGapToEdge, amendPopupZIndex} from '../popup';

/**
 * Global configuration settings for HxMSelect component
 */
export interface HxMSelectSettings {
	/** Default rendering in compact mode or not */
	compact?: boolean;
	/** Default render clear icon or not */
	clearable?: boolean;
	/** Behavior when options change: 'none' do nothing, 'clear' clear selected value */
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
	/** Whether to open popup when key enter pressed */
	enterToOpenPopup?: boolean;
	/** Whether to open popup when key space pressed */
	spaceToOpenPopup?: boolean;
	/** Whether to show the selected option when popup open */
	showSelectedOnPopupOpen?: boolean;
	/** Show filter input when option count exceeds this threshold */
	filterWhenOptionExceed?: number;
	/** Whether to show placeholder when no option selected */
	placeholder?: boolean;
	/** i18n translation key for placeholder text */
	placeholderKey?: string;
	/** i18n translation key for filter placeholder text */
	filterPlaceholderKey?: string;
	/** i18n translation key for loading state text */
	optionsOnLoadKey?: string;
	/** i18n translation key for empty options state text */
	noOptionsKey?: string;
}

/**
 * Default configuration values for HxMSelect component
 */
export const HxMSelectDefaults: WithPartial<Required<HxMSelectSettings>, 'zIndex' | 'gapToEdge' | 'minPopupWidth'> = {
	compact: false,
	clearable: true,
	onOptionsChange: 'clear',
	// Default: 8 rows * 32px row height + 2px border = 258px
	maxPopupHeight: 258,
	sameWidthAtMinimum: true,
	enterToOpenPopup: false,
	spaceToOpenPopup: true,
	showSelectedOnPopupOpen: true,
	filterWhenOptionExceed: 8,
	placeholder: true,
	placeholderKey: '~HxCommon.SelectPlaceholder',
	filterPlaceholderKey: '~HxCommon.SelectFilterPlaceholder',
	optionsOnLoadKey: '~HxCommon.SelectOptionsOnLoad',
	noOptionsKey: '~HxCommon.SelectNoOptions'
};

/**
 * Configure global default settings for all HxMSelect instances
 * @param settings - Configuration options to override defaults
 */
export const configHxMSelect = (settings: HxMSelectSettings) => {
	HxMSelectDefaults.compact = settings.compact ?? HxMSelectDefaults.compact;
	HxMSelectDefaults.clearable = settings.clearable ?? HxMSelectDefaults.clearable;
	HxMSelectDefaults.onOptionsChange = settings.onOptionsChange ?? HxMSelectDefaults.onOptionsChange;
	HxMSelectDefaults.minPopupWidth = settings.minPopupWidth;
	HxMSelectDefaults.maxPopupHeight = settings.maxPopupHeight ?? HxMSelectDefaults.maxPopupHeight;
	// Enforce minimum 200px popup max height
	if (HxMSelectDefaults.maxPopupHeight < 200) {
		HxMSelectDefaults.maxPopupHeight = 200;
	}
	HxMSelectDefaults.zIndex = amendPopupZIndex(settings.zIndex);
	HxMSelectDefaults.gapToEdge = amendPopupGapToEdge(settings.gapToEdge);
	HxMSelectDefaults.sameWidthAtMinimum = settings.sameWidthAtMinimum ?? HxMSelectDefaults.sameWidthAtMinimum;
	HxMSelectDefaults.enterToOpenPopup = settings.enterToOpenPopup ?? HxMSelectDefaults.enterToOpenPopup;
	HxMSelectDefaults.spaceToOpenPopup = settings.spaceToOpenPopup ?? HxMSelectDefaults.spaceToOpenPopup;
	HxMSelectDefaults.filterWhenOptionExceed = settings.filterWhenOptionExceed ?? HxMSelectDefaults.filterWhenOptionExceed;
	if (HxMSelectDefaults.filterWhenOptionExceed < 8) {
		HxMSelectDefaults.filterWhenOptionExceed = 8;
	}
	HxMSelectDefaults.showSelectedOnPopupOpen = settings.showSelectedOnPopupOpen ?? HxMSelectDefaults.showSelectedOnPopupOpen;
	HxMSelectDefaults.placeholder = settings.placeholder ?? HxMSelectDefaults.placeholder;
	HxMSelectDefaults.placeholderKey = settings.placeholderKey?.trim() || HxMSelectDefaults.placeholderKey;
	HxMSelectDefaults.filterPlaceholderKey = settings.filterPlaceholderKey?.trim() || HxMSelectDefaults.filterPlaceholderKey;
	HxMSelectDefaults.optionsOnLoadKey = settings.optionsOnLoadKey?.trim() || HxMSelectDefaults.optionsOnLoadKey;
	HxMSelectDefaults.noOptionsKey = settings.noOptionsKey?.trim() || HxMSelectDefaults.noOptionsKey;
};
