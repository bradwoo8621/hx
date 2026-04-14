import type {WithPartial} from '../../types';
import type {HxBoxBorderRadius, HxBoxPaddingB, HxBoxPaddingT, HxBoxPaddingX} from './box';

export interface HxBoxSettings {
	/** Whether to show border by default */
	border?: boolean;
	/** Default border radius size */
	borderRadius?: HxBoxBorderRadius;
	/** Default horizontal padding for box containers */
	paddingX?: HxBoxPaddingX;
	/** Default top padding for box containers */
	paddingT?: HxBoxPaddingT;
	/** Default bottom padding for box containers */
	paddingB?: HxBoxPaddingB;
}

/**
 * Default configuration values for HxBox component.
 * These values are used when the corresponding prop is not explicitly specified.
 */
export const HxBoxDefaults: WithPartial<Required<HxBoxSettings>, 'borderRadius' | 'paddingX' | 'paddingT' | 'paddingB'> = {
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
	HxBoxDefaults.borderRadius = settings.borderRadius?.trim() as HxBoxBorderRadius;
	HxBoxDefaults.paddingX = settings.paddingX?.trim() as HxBoxPaddingX;
	HxBoxDefaults.paddingT = settings.paddingT?.trim() as HxBoxPaddingT;
	HxBoxDefaults.paddingB = settings.paddingB?.trim() as HxBoxPaddingB;
};
