/**
 * Global configuration settings for popup component system
 */
export interface HxWithPopupSettings {
	/** Z-index base for popup layers */
	zIndex?: number;
	/** Minimum spacing between the popup edge and viewport boundary */
	gapToEdge?: number;
}

/**
 * Default configuration values for popup components
 */
export const HxWithPopupDefaults: Required<HxWithPopupSettings> = {
	zIndex: 2000,
	gapToEdge: 5
};

/**
 * Configure global popup settings
 * @param settings - Configuration options to override defaults
 */
export const configHxWithPopup = (settings: HxWithPopupSettings) => {
	HxWithPopupDefaults.zIndex = amendPopupZIndex(settings.zIndex) ?? HxWithPopupDefaults.zIndex;
	HxWithPopupDefaults.gapToEdge = amendPopupGapToEdge(settings.gapToEdge ?? HxWithPopupDefaults.gapToEdge)!;
};

/**
 * Validate and amend popup z-index value (minimum 10)
 * @param zIndex - Input z-index value
 * @returns Validated z-index or undefined if input is null/undefined
 */
export const amendPopupZIndex = (zIndex?: number): number | undefined => {
	if (zIndex == null) {
		return (void 0);
	}
	return zIndex < 10 ? 10 : zIndex;
};

/**
 * Validate and amend popup gap-to-edge value (minimum 2px)
 * @param gapToEdge - Input gap value in pixels
 * @returns Validated gap value or undefined if input is null/undefined
 */
export const amendPopupGapToEdge = (gapToEdge?: number): number | undefined => {
	if (gapToEdge == null) {
		return (void 0);
	}
	return gapToEdge < 2 ? 2 : gapToEdge;
};
