import type {HxBorderRadius, HxPadding, WithRequired} from '../../types';

export interface HxBoxSettings {
	/** Whether to show border by default */
	border?: boolean;
	/** Default border radius size */
	borderRadius?: HxBorderRadius;
	/** Default horizontal padding for box containers */
	paddingX?: HxPadding;
	/** Default top padding for box containers */
	paddingT?: HxPadding;
	/** Default bottom padding for box containers */
	paddingB?: HxPadding;
}

/**
 * Default configuration values for HxBox component.
 * These values are used when the corresponding prop is not explicitly specified.
 */
export const HxBoxDefaults: WithRequired<HxBoxSettings, 'border'> = {
	border: false
};

/**
 * Configure global default settings for all HxBox components.
 * Use this function to set application-wide defaults for Box container styling.
 *
 * @example
 * // Set global default to have border with large radius
 * configHxBox({
 *   border: true,
 *   borderRadius: 'lg',
 *   paddingX: 'md'
 * });
 */
export const configHxBox = (settings: HxBoxSettings) => {
	HxBoxDefaults.border = settings.border ?? HxBoxDefaults.border;
	HxBoxDefaults.borderRadius = settings.borderRadius?.trim() as HxBorderRadius;
	HxBoxDefaults.paddingX = settings.paddingX?.trim() as HxPadding;
	HxBoxDefaults.paddingT = settings.paddingT?.trim() as HxPadding;
	HxBoxDefaults.paddingB = settings.paddingB?.trim() as HxPadding;
};
