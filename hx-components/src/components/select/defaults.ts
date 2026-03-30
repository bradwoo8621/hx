import type {WithPartial} from '../../types';
import {HxWithPopupDefaults} from '../with-popup/defaults';

export interface HxSelectSettings {
	/** minimum spacing between the popup and the viewport. */
	gapToEdge?: number;
	/** enable a filter when the number of selectable options exceeds a certain threshold. */
	filterWhenOptionExceed?: number;
}

interface InternalHxSelectSettings {
	_filterWhenOptionExceed?: number;
}

export const HxSelectDefaults: WithPartial<Required<HxSelectSettings>, 'gapToEdge'> & InternalHxSelectSettings = {
	get filterWhenOptionExceed(): number {
		return this._filterWhenOptionExceed ?? HxWithPopupDefaults.filterWhenOptionExceed;
	}
};

export const configHxSelect = (settings: HxSelectSettings) => {
	HxSelectDefaults.gapToEdge = settings.gapToEdge;
	HxSelectDefaults._filterWhenOptionExceed = settings.filterWhenOptionExceed ?? HxSelectDefaults._filterWhenOptionExceed;
};
