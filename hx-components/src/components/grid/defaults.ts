import type {HxBorderRadius, HxGap, HxPadding, WithPartial} from '../../types';
import type {
	HxGridAlignContent,
	HxGridAlignItems,
	HxGridColumns,
	HxGridJustifyContent,
	HxGridJustifyItems
} from './types';

/**
 * Global configuration settings for HxGrid component.
 * Allows overriding default behavior of all Grid instances application-wide.
 */
export interface HxGridSettings {
	/** Default number of columns for grid layouts */
	columns?: HxGridColumns;
	/** Default inline axis alignment of a grid item inside its own cell (CSS justify-items) */
	justifyItems?: HxGridJustifyItems;
	/** Default inline axis distribution of the grid tracks themselves (CSS justify-content) */
	justifyContent?: HxGridJustifyContent;
	/** Default block axis alignment of a grid item inside its own row (CSS align-items) */
	alignItems?: HxGridAlignItems;
	/** Default block axis distribution of the grid rows, when the grid is taller than its rows (CSS align-content) */
	alignContent?: HxGridAlignContent;
	/** Whether to show border by default */
	border?: boolean;
	/** Default border radius size */
	borderRadius?: HxBorderRadius;
	/** Default horizontal gap between columns */
	gapX?: HxGap;
	/** Default vertical gap between rows */
	gapY?: HxGap;
	/** Default horizontal padding for grid containers */
	paddingX?: HxPadding;
	/** Default top padding for grid containers */
	paddingT?: HxPadding;
	/** Default bottom padding for grid containers */
	paddingB?: HxPadding;
}

/**
 * Default configuration values for HxGrid component.
 * These values are used when the corresponding prop is not explicitly specified.
 */
export const HxGridDefaults: WithPartial<Required<HxGridSettings>, 'borderRadius' | 'gapY' | 'paddingX' | 'paddingT' | 'paddingB'> = {
	columns: 12,
	justifyItems: 'normal',
	justifyContent: 'normal',
	alignItems: 'normal',
	alignContent: 'normal',
	border: false,
	gapX: 'md'
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
	HxGridDefaults.borderRadius = settings.borderRadius?.trim() as HxBorderRadius;
	HxGridDefaults.gapX = settings.gapX?.trim() as HxGap || HxGridDefaults.gapX;
	HxGridDefaults.gapY = settings.gapY?.trim() as HxGap;
	HxGridDefaults.paddingX = settings.paddingX?.trim() as HxPadding;
	HxGridDefaults.paddingT = settings.paddingT?.trim() as HxPadding;
	HxGridDefaults.paddingB = settings.paddingB?.trim() as HxPadding;
};
