import type {WithRequired} from '../../types';
import {amendPopupGapToEdge, amendPopupZIndex} from '../popup/defaults';

/**
 * Global configuration settings for select component
 */
export interface HxSelectSettings {
	/** Maximum height for the select popup dropdown before scrolling */
	maxPopupHeight?: number;
	/** Z-index base for select popup layers */
	zIndex?: number;
	/** Minimum spacing between the popup edge and viewport boundary */
	gapToEdge?: number;
	/** Show filter input when option count exceeds this threshold */
	filterWhenOptionExceed?: number;
	/** i18n translation key for loading state text */
	optionsOnLoadKey?: string;
}

/**
 * Default configuration values for select component
 */
export const HxSelectDefaults: WithRequired<HxSelectSettings, 'maxPopupHeight' | 'optionsOnLoadKey'> = {
	// Default: 8 rows * 32px row height + 2px border = 258px
	maxPopupHeight: 258,
	optionsOnLoadKey: '~HxCommon.OptionsOnLoad'
};

/**
 * Configure global select component settings
 * @param settings - Configuration options to override defaults
 */
export const configHxSelect = (settings: HxSelectSettings) => {
	HxSelectDefaults.maxPopupHeight = settings.maxPopupHeight ?? HxSelectDefaults.maxPopupHeight;
	// Enforce minimum 200px popup height
	if (HxSelectDefaults.maxPopupHeight < 200) {
		HxSelectDefaults.maxPopupHeight = 200;
	}
	HxSelectDefaults.zIndex = amendPopupZIndex(settings.zIndex);
	HxSelectDefaults.gapToEdge = amendPopupGapToEdge(settings.gapToEdge);
	HxSelectDefaults.filterWhenOptionExceed = settings.filterWhenOptionExceed;
	HxSelectDefaults.optionsOnLoadKey = settings.optionsOnLoadKey?.trim() || HxSelectDefaults.optionsOnLoadKey;
};
