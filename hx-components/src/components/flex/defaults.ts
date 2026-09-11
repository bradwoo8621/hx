import type {HxBorderRadius, HxDirection, HxGap, HxPadding, WithPartial} from '../../types';
import type {HxFlexAlignContent, HxFlexAlignItems, HxFlexJustifyContent} from './types';

/**
 * Global configuration settings for HxFlex component.
 * Allows overriding default behavior of all Flex instances application-wide.
 */
export interface HxFlexSettings {
	/** Default layout direction: horizontal (dir-x) or vertical (dir-y) */
	direction?: HxDirection;
	/** Whether to wrap items to next line by default */
	wrap?: boolean;
	/** Default justify content alignment */
	justifyContent?: HxFlexJustifyContent;
	/** Default align items alignment */
	alignItems?: HxFlexAlignItems;
	/** Default align content alignment for wrapped items */
	alignContent?: HxFlexAlignContent;
	/** Whether to show border by default */
	border?: boolean;
	/** Default border radius size */
	borderRadius?: HxBorderRadius;
	/** Default horizontal gap between items */
	gapX?: HxGap;
	/** Default vertical gap between items */
	gapY?: HxGap;
	/** Default horizontal padding for flex containers */
	paddingX?: HxPadding;
	/** Default top padding for flex containers */
	paddingT?: HxPadding;
	/** Default bottom padding for flex containers */
	paddingB?: HxPadding;
}

/**
 * Default configuration values for HxFlex component.
 * These values are used when the corresponding prop is not explicitly specified.
 */
export const HxFlexDefaults: WithPartial<Required<HxFlexSettings>, 'borderRadius' | 'gapX' | 'gapY' | 'paddingX' | 'paddingT' | 'paddingB'> = {
	direction: 'dir-x',
	wrap: true,
	justifyContent: 'normal',
	alignItems: 'normal',
	alignContent: 'normal',
	border: false
};

/**
 * Configure global default settings for all HxFlex components.
 * Use this function to set application-wide defaults for Flex layout behavior.
 *
 * @example
 * // Set global default to vertical layout with small gap
 * configHxFlex({
 *   direction: 'dir-y',
 *   gapY: 'sm',
 *   wrap: false
 * });
 */
export const configHxFlex = (settings: HxFlexSettings) => {
	HxFlexDefaults.direction = settings.direction?.trim() as HxDirection || HxFlexDefaults.direction;
	HxFlexDefaults.wrap = settings.wrap ?? HxFlexDefaults.wrap;
	HxFlexDefaults.justifyContent = settings.justifyContent?.trim() as HxFlexJustifyContent || HxFlexDefaults.justifyContent;
	HxFlexDefaults.alignItems = settings.alignItems?.trim() as HxFlexAlignItems || HxFlexDefaults.alignItems;
	HxFlexDefaults.alignContent = settings.alignContent?.trim() as HxFlexAlignContent || HxFlexDefaults.alignContent;
	HxFlexDefaults.border = settings.border ?? HxFlexDefaults.border;
	HxFlexDefaults.borderRadius = settings.borderRadius?.trim() as HxBorderRadius;
	HxFlexDefaults.gapX = settings.gapX?.trim() as HxGap;
	HxFlexDefaults.gapY = settings.gapY?.trim() as HxGap;
	HxFlexDefaults.paddingX = settings.paddingX?.trim() as HxPadding;
	HxFlexDefaults.paddingT = settings.paddingT?.trim() as HxPadding;
	HxFlexDefaults.paddingB = settings.paddingB?.trim() as HxPadding;
};
