export interface HxPopupSettings {
	avoidDocumentScroll?: boolean;
	zIndex?: number;
}

export const HxPopupDefaults: Required<HxPopupSettings> = {
	avoidDocumentScroll: false,
	zIndex: 9999
};

export const configHxPopup = (settings: HxPopupSettings) => {
	HxPopupDefaults.avoidDocumentScroll = settings.avoidDocumentScroll ?? HxPopupDefaults.avoidDocumentScroll;
	HxPopupDefaults.zIndex = settings.zIndex ?? HxPopupDefaults.zIndex;
	if (HxPopupDefaults.zIndex < 1) {
		HxPopupDefaults.zIndex = 9999;
	}
};
