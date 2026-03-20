import type {
	HxFlexAlignContent,
	HxFlexAlignItems,
	HxFlexBorderRadius,
	HxFlexDirection,
	HxFlexGapX,
	HxFlexGapY,
	HxFlexJustifyContent,
	HxFlexPaddingB,
	HxFlexPaddingT,
	HxFlexPaddingX
} from './flex';

/**
 * Global configuration settings for HxFlex component.
 * Allows overriding default behavior of all Flex instances application-wide.
 */
export interface HxFlexSettings {
	/** Default layout direction: horizontal (dir-x) or vertical (dir-y) */
	direction?: HxFlexDirection;
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
	borderRadius?: HxFlexBorderRadius;
	/** Default horizontal gap between items */
	gapX?: HxFlexGapX;
	/** Default vertical gap between items */
	gapY?: HxFlexGapY;
	/** Default horizontal padding for flex containers */
	paddingX?: HxFlexPaddingX;
	/** Default top padding for flex containers */
	paddingT?: HxFlexPaddingT;
	/** Default bottom padding for flex containers */
	paddingB?: HxFlexPaddingB;
}

/**
 * Default configuration values for HxFlex component.
 * These values are used when the corresponding prop is not explicitly specified.
 */
export const HxFlexDefaults: Required<HxFlexSettings> = {
	direction: 'dir-x',
	wrap: true,
	justifyContent: 'normal',
	alignItems: 'normal',
	alignContent: 'normal',
	border: false,
	borderRadius: 'md',
	gapX: 'md',
	gapY: 'none',
	paddingX: 'none',
	paddingT: 'none',
	paddingB: 'none'
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
	HxFlexDefaults.direction = settings.direction?.trim() as HxFlexDirection || HxFlexDefaults.direction;
	HxFlexDefaults.wrap = settings.wrap ?? HxFlexDefaults.wrap;
	HxFlexDefaults.justifyContent = settings.justifyContent?.trim() as HxFlexJustifyContent || HxFlexDefaults.justifyContent;
	HxFlexDefaults.alignItems = settings.alignItems?.trim() as HxFlexAlignItems || HxFlexDefaults.alignItems;
	HxFlexDefaults.alignContent = settings.alignContent?.trim() as HxFlexAlignContent || HxFlexDefaults.alignContent;
	HxFlexDefaults.border = settings.border ?? HxFlexDefaults.border;
	HxFlexDefaults.borderRadius = settings.borderRadius?.trim() as HxFlexBorderRadius || HxFlexDefaults.borderRadius;
	HxFlexDefaults.gapX = settings.gapX?.trim() as HxFlexGapX || HxFlexDefaults.gapX;
	HxFlexDefaults.gapY = settings.gapY?.trim() as HxFlexGapY || HxFlexDefaults.gapY;
	HxFlexDefaults.paddingX = settings.paddingX?.trim() as HxFlexPaddingX || HxFlexDefaults.paddingX;
	HxFlexDefaults.paddingT = settings.paddingT?.trim() as HxFlexPaddingT || HxFlexDefaults.paddingT;
	HxFlexDefaults.paddingB = settings.paddingB?.trim() as HxFlexPaddingB || HxFlexDefaults.paddingB;
};
