import type {HxBorderRadius, HxPadding} from '../../types';

export interface HxCalloutSettings {
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
 * Default configuration values for HxCallout component.
 * These values are used when the corresponding prop is not explicitly specified.
 */
export const HxCalloutDefaults: Required<HxCalloutSettings> = {
	border: false,
	borderRadius: 'lg',
	paddingX: 'xl',
	paddingT: 'xl',
	paddingB: 'xl'
};

/**
 * Configure global default settings for all HxCallout components.
 * Use this function to set application-wide defaults for Box container styling.
 *
 * @example
 * // Set global default to have border with large radius
 * configHxCallout({
 *   border: true,
 *   borderRadius: 'lg',
 *   paddingX: 'md'
 * });
 */
export const configHxCallout = (settings: HxCalloutSettings) => {
	HxCalloutDefaults.border = settings.border ?? HxCalloutDefaults.border;
	HxCalloutDefaults.borderRadius = settings.borderRadius?.trim() as HxBorderRadius || HxCalloutDefaults.borderRadius;
	HxCalloutDefaults.paddingX = settings.paddingX?.trim() as HxPadding || HxCalloutDefaults.paddingX;
	HxCalloutDefaults.paddingT = settings.paddingT?.trim() as HxPadding || HxCalloutDefaults.paddingT;
	HxCalloutDefaults.paddingB = settings.paddingB?.trim() as HxPadding || HxCalloutDefaults.paddingB;
};
