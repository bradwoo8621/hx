import type {HxGap, HxPadding} from '../../types';

/**
 * Global configuration settings for HxButtonBar component
 * These settings can be overridden globally at app initialization
 */
export interface HxButtonBarSettings {
	/** Default horizontal spacing between buttons in each group */
	gap?: HxGap;
	/** Default horizontal padding for the button bar container */
	paddingX?: HxPadding;
	/** Default vertical padding (top and bottom) for the button bar container */
	paddingY?: HxPadding;
}

/**
 * Default configuration values for HxButtonBar
 * These values are used when explicit props are not provided
 * Can be globally modified using configHxButtonBar()
 */
export const HxButtonBarDefaults: Required<HxButtonBarSettings> = {
	gap: 'xs',
	paddingX: 'lg',
	paddingY: 'md'
};

/**
 * Configure global default settings for all HxButtonBar instances
 * Should be called once during app initialization before rendering components
 * @param settings - Partial settings to override default values
 */
export const configHxButtonBar = (settings: HxButtonBarSettings) => {
	HxButtonBarDefaults.gap = settings.gap?.trim() as HxGap || HxButtonBarDefaults.gap;
	HxButtonBarDefaults.paddingX = settings.paddingX?.trim() as HxPadding || HxButtonBarDefaults.paddingX;
	HxButtonBarDefaults.paddingY = settings.paddingY?.trim() as HxPadding || HxButtonBarDefaults.paddingY;
};
