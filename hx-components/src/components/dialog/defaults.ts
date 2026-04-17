export interface HxDialogSettings {
	zIndex?: number;
}

export const HxDialogDefaults: Required<HxDialogSettings> = {
	zIndex: 1000
};

export const configHxDialog = (settings: HxDialogSettings) => {
	HxDialogDefaults.zIndex = amendDialogZIndex(settings.zIndex ?? HxDialogDefaults.zIndex)!;
};

export const amendDialogZIndex = (zIndex?: number): number | undefined => {
	if (zIndex == null) {
		return (void 0);
	}
	return zIndex < 10 ? 10 : zIndex;
};
