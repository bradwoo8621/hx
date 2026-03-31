import type {WithRequired} from '../../types';
import {amendPopupGapToEdge, amendPopupZIndex} from '../popup/defaults';

export interface HxSelectSettings {
	maxPopupHeight?: number;
	zIndex?: number;
	/** minimum spacing between the popup and the viewport. */
	gapToEdge?: number;
	/** enable a filter when the number of selectable options exceeds a certain threshold. */
	filterWhenOptionExceed?: number;
	/** i18n key of options on loading */
	optionsOnLoadKey?: string;
}

export const HxSelectDefaults: WithRequired<HxSelectSettings, 'maxPopupHeight' | 'optionsOnLoadKey'> = {
	/** 32 * 8 + 2 */
	maxPopupHeight: 258,
	optionsOnLoadKey: '~HxCommon.OptionsOnLoad'
};

export const configHxSelect = (settings: HxSelectSettings) => {
	HxSelectDefaults.maxPopupHeight = settings.maxPopupHeight ?? HxSelectDefaults.maxPopupHeight;
	if (HxSelectDefaults.maxPopupHeight < 200) {
		HxSelectDefaults.maxPopupHeight = 200;
	}
	HxSelectDefaults.zIndex = amendPopupZIndex(settings.zIndex);
	HxSelectDefaults.gapToEdge = amendPopupGapToEdge(settings.gapToEdge);
	HxSelectDefaults.filterWhenOptionExceed = settings.filterWhenOptionExceed;
	HxSelectDefaults.optionsOnLoadKey = settings.optionsOnLoadKey?.trim() || HxSelectDefaults.optionsOnLoadKey;
};
