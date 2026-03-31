export interface HxWithPopupSettings {
	zIndex?: number;
	/** minimum spacing between the popup and the viewport. */
	gapToEdge?: number;
}

export const HxWithPopupDefaults: Required<HxWithPopupSettings> = {
	zIndex: 1000,
	gapToEdge: 5
};

export const configHxWithPopup = (settings: HxWithPopupSettings) => {
	HxWithPopupDefaults.zIndex = amendPopupZIndex(settings.zIndex ?? HxWithPopupDefaults.zIndex)!;
	HxWithPopupDefaults.gapToEdge = amendPopupGapToEdge(settings.gapToEdge ?? HxWithPopupDefaults.gapToEdge)!;
};

export const amendPopupZIndex = (zIndex?: number): number | undefined => {
	if (zIndex == null) {
		return (void 0);
	}
	return zIndex < 10 ? 10 : zIndex;
};

export const amendPopupGapToEdge = (gapToEdge?: number): number | undefined => {
	if (gapToEdge == null) {
		return (void 0);
	}
	return gapToEdge < 2 ? 2 : gapToEdge;
};
