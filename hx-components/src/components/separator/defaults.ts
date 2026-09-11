import type {HxColor, HxDirection, HxMargin, HxSize, WithPartial} from '../../types';

/**
 * Global configuration settings for HxSeparator component.
 * Allows overriding default behavior of all Separator instances application-wide.
 */
export interface HxSeparatorSettings {
	/** Default separator direction */
	direction?: HxDirection;
	/** Default separator color */
	color?: HxColor;
	/** Default separator line length (horizontal) or height (vertical); thickness is fixed at 1px */
	size?: HxSize;
	/** Default horizontal margin size */
	marginX?: HxMargin;
	/** Default vertical margin size */
	marginY?: HxMargin;
}

/**
 * Default configuration values for HxSeparator component.
 * These values are used when the corresponding prop is not explicitly specified.
 */
export const HxSeparatorDefaults: WithPartial<Required<HxSeparatorSettings>, 'color' | 'size'> = {
	direction: 'dir-x',
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
	HxSeparatorDefaults.direction = settings.direction?.trim() as HxDirection || HxSeparatorDefaults.direction;
	HxSeparatorDefaults.color = settings.color?.trim() as HxColor || HxSeparatorDefaults.color;
	HxSeparatorDefaults.size = settings.size?.trim() as HxSize || HxSeparatorDefaults.size;
	HxSeparatorDefaults.marginX = settings.marginX?.trim() as HxMargin || HxSeparatorDefaults.marginX;
	HxSeparatorDefaults.marginY = settings.marginY?.trim() as HxMargin || HxSeparatorDefaults.marginY;
};
