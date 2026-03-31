import type {WithRequired} from '../../types';
import {amendPopupGapToEdge, amendPopupZIndex} from '../popup/defaults';

export interface HxSelectSettings {
	zIndex?: number;
	/** minimum spacing between the popup and the viewport. */
	gapToEdge?: number;
	/** enable a filter when the number of selectable options exceeds a certain threshold. */
	filterWhenOptionExceed?: number;
	/** i18n key of options on loading */
	optionsOnLoadKey?: string;
}

export const HxSelectDefaults: WithRequired<HxSelectSettings, 'optionsOnLoadKey'> = {
	optionsOnLoadKey: '~HxCommon.OptionsOnLoad'
};

export const configHxSelect = (settings: HxSelectSettings) => {
	HxSelectDefaults.zIndex = amendPopupZIndex(settings.zIndex);
	HxSelectDefaults.gapToEdge = amendPopupGapToEdge(settings.gapToEdge);
	HxSelectDefaults.filterWhenOptionExceed = settings.filterWhenOptionExceed;
	HxSelectDefaults.optionsOnLoadKey = settings.optionsOnLoadKey?.trim() || HxSelectDefaults.optionsOnLoadKey;
};
