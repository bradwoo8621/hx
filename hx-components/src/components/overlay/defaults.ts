export interface HxOverlaySettings {
	avoidDocumentScroll?: boolean;
	zIndex?: number;
}

export const HxOverlayDefaults: Required<HxOverlaySettings> = {
	avoidDocumentScroll: false,
	zIndex: 9999
};

export const configHxOverlay = (settings: HxOverlaySettings) => {
	HxOverlayDefaults.avoidDocumentScroll = settings.avoidDocumentScroll ?? HxOverlayDefaults.avoidDocumentScroll;
	HxOverlayDefaults.zIndex = settings.zIndex ?? HxOverlayDefaults.zIndex;
	if (HxOverlayDefaults.zIndex < 1) {
		HxOverlayDefaults.zIndex = 9999;
	}
};
