/**
 * Configuration settings for overlay components
 */
export interface HxOverlaySettings {
	/** Default z-index value for all overlay instances */
	zIndex?: number;
	/** whether to allow default hide behavior, which are click on backdrop and press esc key */
	defaultHide?: boolean;
}

/**
 * Default configuration values for overlay components
 * These can be globally overridden using configHxOverlay()
 */
export const HxOverlayDefaults: Required<HxOverlaySettings> = {
	zIndex: 1000,
	defaultHide: false
};

/**
 * Configure global overlay settings
 * @param settings - Partial settings object to override defaults
 */
export const configHxOverlay = (settings: HxOverlaySettings) => {
	HxOverlayDefaults.zIndex = amendOverlayZIndex(settings.zIndex ?? HxOverlayDefaults.zIndex)!;
	HxOverlayDefaults.defaultHide = settings.defaultHide ?? HxOverlayDefaults.defaultHide;
};

/**
 * Validate and normalize overlay z-index values
 * Ensures z-index is at least 10 to appear above other page content
 * @param zIndex - Z-index value to validate
 * @returns Normalized z-index value or undefined if input is undefined
 */
export const amendOverlayZIndex = (zIndex?: number): number | undefined => {
	if (zIndex == null) {
		return (void 0);
	}
	return zIndex < 10 ? 10 : zIndex;
};
