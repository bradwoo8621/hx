import {HxWithPopupDefaults} from '../with-popup/defaults';

export interface HxSelectSettings {
	/** minimum spacing between the popup and the viewport. */
	gapToEdge?: number;
	/** enable a filter when the number of selectable options exceeds a certain threshold. */
	filterWhenOptionExceed?: number;
}

interface InternalHxSelectSettings {
	_gapToEdge?: number;
	_filterWhenOptionExceed?: number;
}

export const HxSelectDefaults: Required<HxSelectSettings> & InternalHxSelectSettings = {
	get gapToEdge(): number {
		return this._gapToEdge ?? HxWithPopupDefaults.gapToEdge;
	},
	get filterWhenOptionExceed(): number {
		return this._filterWhenOptionExceed ?? HxWithPopupDefaults.filterWhenOptionExceed;
	}
};

export const configHxSelect = (settings: HxSelectSettings) => {
	HxSelectDefaults._gapToEdge = settings.gapToEdge ?? HxSelectDefaults._gapToEdge;
	HxSelectDefaults._filterWhenOptionExceed = settings.filterWhenOptionExceed ?? HxSelectDefaults._filterWhenOptionExceed;
};
