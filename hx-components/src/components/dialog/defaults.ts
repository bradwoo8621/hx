/**
 * Configuration settings for dialog components
 */
export interface HxDialogSettings {
	/** Default z-index value for all dialog instances */
	zIndex?: number;
	/** whether to allow default hide behavior, which are click on backdrop and press esc key */
	defaultHide?: boolean;
}

/**
 * Default configuration values for dialog components
 * These can be globally overridden using configHxDialog()
 */
export const HxDialogDefaults: Required<HxDialogSettings> = {
	zIndex: 1000,
	defaultHide: false
};

/**
 * Configure global dialog settings
 * @param settings - Partial settings object to override defaults
 */
export const configHxDialog = (settings: HxDialogSettings) => {
	HxDialogDefaults.zIndex = amendDialogZIndex(settings.zIndex ?? HxDialogDefaults.zIndex)!;
	HxDialogDefaults.defaultHide = settings.defaultHide ?? HxDialogDefaults.defaultHide;
};

/**
 * Validate and normalize dialog z-index values
 * Ensures z-index is at least 10 to appear above other page content
 * @param zIndex - Z-index value to validate
 * @returns Normalized z-index value or undefined if input is undefined
 */
export const amendDialogZIndex = (zIndex?: number): number | undefined => {
	if (zIndex == null) {
		return (void 0);
	}
	return zIndex < 10 ? 10 : zIndex;
};
