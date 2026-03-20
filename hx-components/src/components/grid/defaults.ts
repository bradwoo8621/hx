import type {
	HxGridAlignContent,
	HxGridAlignItems,
	HxGridBorderRadius,
	HxGridColumns,
	HxGridGapX,
	HxGridGapY,
	HxGridJustifyContent,
	HxGridJustifyItems,
	HxGridPaddingB,
	HxGridPaddingT,
	HxGridPaddingX
} from './grid';

/**
 * Global configuration settings for HxGrid component.
 * Allows overriding default behavior of all Grid instances application-wide.
 */
export interface HxGridSettings {
	/** Default number of columns for grid layouts */
	columns?: HxGridColumns;
	/** Default justify items alignment */
	justifyItems?: HxGridJustifyItems;
	/** Default justify content alignment */
	justifyContent?: HxGridJustifyContent;
	/** Default align items alignment */
	alignItems?: HxGridAlignItems;
	/** Default align content alignment for wrapped items */
	alignContent?: HxGridAlignContent;
	/** Whether to show border by default */
	border?: boolean;
	/** Default border radius size */
	borderRadius?: HxGridBorderRadius;
	/** Default horizontal gap between columns */
	gapX?: HxGridGapX;
	/** Default vertical gap between rows */
	gapY?: HxGridGapY;
	/** Default horizontal padding for grid containers */
	paddingX?: HxGridPaddingX;
	/** Default top padding for grid containers */
	paddingT?: HxGridPaddingT;
	/** Default bottom padding for grid containers */
	paddingB?: HxGridPaddingB;
}

/**
 * Default configuration values for HxGrid component.
 * These values are used when the corresponding prop is not explicitly specified.
 */
export const HxGridDefaults: Required<HxGridSettings> = {
	columns: 12,
	justifyItems: 'normal',
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
 * Configure global default settings for all HxGrid components.
 * Use this function to set application-wide defaults for Grid layout behavior.
 *
 * @example
 * // Set global default to 16 columns with small gap
 * configHxGrid({
 *   columns: 16,
 *   gapX: 'sm',
 *   gapY: 'sm'
 * });
 */
export const configHxGrid = (settings: HxGridSettings) => {
	HxGridDefaults.columns = settings.columns ?? HxGridDefaults.columns;
	HxGridDefaults.justifyItems = settings.justifyItems?.trim() as HxGridJustifyItems || HxGridDefaults.justifyItems;
	HxGridDefaults.justifyContent = settings.justifyContent?.trim() as HxGridJustifyContent || HxGridDefaults.justifyContent;
	HxGridDefaults.alignItems = settings.alignItems?.trim() as HxGridAlignItems || HxGridDefaults.alignItems;
	HxGridDefaults.alignContent = settings.alignContent?.trim() as HxGridAlignContent || HxGridDefaults.alignContent;
	HxGridDefaults.border = settings.border ?? HxGridDefaults.border;
	HxGridDefaults.borderRadius = settings.borderRadius?.trim() as HxGridBorderRadius || HxGridDefaults.borderRadius;
	HxGridDefaults.gapX = settings.gapX?.trim() as HxGridGapX || HxGridDefaults.gapX;
	HxGridDefaults.gapY = settings.gapY?.trim() as HxGridGapY || HxGridDefaults.gapY;
	HxGridDefaults.paddingX = settings.paddingX?.trim() as HxGridPaddingX || HxGridDefaults.paddingX;
	HxGridDefaults.paddingT = settings.paddingT?.trim() as HxGridPaddingT || HxGridDefaults.paddingT;
	HxGridDefaults.paddingB = settings.paddingB?.trim() as HxGridPaddingB || HxGridDefaults.paddingB;
};
