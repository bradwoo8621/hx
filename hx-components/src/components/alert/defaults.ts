/**
 * Configuration settings for dialog components
 */
export interface HxAlertSettings {
	/** Default z-index value for all dialog instances */
	zIndex?: number;
	defaultHide?: boolean;
}

/**
 * Default configuration values for dialog components
 * These can be globally overridden using configHxAlert()
 */
export const HxAlertDefaults: Required<HxAlertSettings> = {
	zIndex: 1100,
	defaultHide: false
};

/**
 * Configure global dialog settings
 * @param settings - Partial settings object to override defaults
 */
export const configHxAlert = (settings: HxAlertSettings) => {
	HxAlertDefaults.zIndex = amendAlertZIndex(settings.zIndex ?? HxAlertDefaults.zIndex)!;
	HxAlertDefaults.defaultHide = settings.defaultHide ?? HxAlertDefaults.defaultHide;
};

/**
 * Validate and normalize dialog z-index values
 * Ensures z-index is at least 10 to appear above other page content
 * @param zIndex - Z-index value to validate
 * @returns Normalized z-index value or undefined if input is undefined
 */
export const amendAlertZIndex = (zIndex?: number): number | undefined => {
	if (zIndex == null) {
		return (void 0);
	}
	return zIndex < 10 ? 10 : zIndex;
};
