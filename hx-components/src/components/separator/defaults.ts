import type {HxSeparatorColor, HxSeparatorDirection, HxSeparatorMarginX, HxSeparatorMarginY} from './separator';

/**
 * Global configuration settings for HxSeparator component.
 * Allows overriding default behavior of all Separator instances application-wide.
 */
export interface HxSeparatorSettings {
	/** Default separator direction */
	direction?: HxSeparatorDirection;
	/** Default separator color */
	color?: HxSeparatorColor;
	/** Default horizontal margin size */
	marginX?: HxSeparatorMarginX;
	/** Default vertical margin size */
	marginY?: HxSeparatorMarginY;
}

/**
 * Default configuration values for HxSeparator component.
 * These values are used when the corresponding prop is not explicitly specified.
 */
export const HxSeparatorDefaults: Required<HxSeparatorSettings> = {
	direction: 'dir-x',
	color: 'default',
	marginX: 'none',
	marginY: 'none'
};

/**
 * Configure global default settings for all HxSeparator components.
 * Use this function to set application-wide defaults for separator styling.
 *
 * @example
 * // Set global default to use primary color with medium vertical margin
 * configHxSeparator({
 *   color: 'primary',
 *   marginY: 'md'
 * });
 */
export const configHxSeparator = (settings: HxSeparatorSettings) => {
	HxSeparatorDefaults.direction = settings.direction?.trim() as HxSeparatorDirection || HxSeparatorDefaults.direction;
	HxSeparatorDefaults.color = settings.color?.trim() as HxSeparatorColor || HxSeparatorDefaults.color;
	HxSeparatorDefaults.marginX = settings.marginX?.trim() as HxSeparatorMarginX || HxSeparatorDefaults.marginX;
	HxSeparatorDefaults.marginY = settings.marginY?.trim() as HxSeparatorMarginY || HxSeparatorDefaults.marginY;
};
