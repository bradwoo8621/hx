export interface HxWithPopupSettings {
	/** minimum spacing between the popup and the viewport. */
	gapToEdge?: number;
	/** enable a filter when the number of selectable options exceeds a certain threshold. */
	filterWhenOptionExceed?: number;
}

export const HxWithPopupDefaults: Required<HxWithPopupSettings> = {
	gapToEdge: 5,
	filterWhenOptionExceed: 10
};

export const configHxWithPopup = (settings: HxWithPopupSettings) => {
	HxWithPopupDefaults.gapToEdge = settings.gapToEdge ?? HxWithPopupDefaults.gapToEdge;
	if (HxWithPopupDefaults.gapToEdge < 2) {
		HxWithPopupDefaults.gapToEdge = 2;
	}
	HxWithPopupDefaults.filterWhenOptionExceed = settings.filterWhenOptionExceed ?? HxWithPopupDefaults.filterWhenOptionExceed;
};
