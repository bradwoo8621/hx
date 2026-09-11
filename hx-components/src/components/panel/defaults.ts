import type {HxBorderRadius, HxGap, HxPadding, WithPartial} from '../../types';
import type {HxFlexAlignContent, HxFlexAlignItems, HxFlexJustifyContent} from '../flex';
import type {
	HxGridAlignContent,
	HxGridAlignItems,
	HxGridColumns,
	HxGridJustifyContent,
	HxGridJustifyItems
} from '../grid';

/**
 * Global configuration settings for HxPanel component.
 * Allows overriding default behavior of all Panel instances application-wide.
 */
export interface HxPanelSettings {
	// panel
	/** Whether to show border by default */
	border?: boolean;
	/** Default border radius size */
	borderRadius?: HxBorderRadius;
	/** Whether the panel is collapsible by default */
	collapsible?: boolean;
	/** Whether the panel is collapsed by default when collapsible */
	defaultCollapsed?: boolean;
	// header
	/** Default justify-content value for panel header flex layout */
	headerJustifyContent?: HxFlexJustifyContent;
	/** Default align-items value for panel header flex layout */
	headerAlignItems?: HxFlexAlignItems;
	/** Default align-content value for panel header flex layout */
	headerAlignContent?: HxFlexAlignContent;
	/** Default horizontal gap size between header items */
	headerGapX?: HxGap;
	/** Default vertical gap size between header items */
	headerGapY?: HxGap;
	/** Default horizontal padding for panel header */
	headerPaddingX?: HxPadding;
	/** Default top padding for panel header */
	headerPaddingT?: HxPadding;
	/** Default bottom padding for panel header */
	headerPaddingB?: HxPadding;
	// body
	/** Default number of grid columns for panel body */
	bodyColumns?: HxGridColumns;
	/** Default justify-items value for panel body grid layout */
	bodyJustifyItems?: HxGridJustifyItems;
	/** Default justify-content value for panel body grid layout */
	bodyJustifyContent?: HxGridJustifyContent;
	/** Default align-items value for panel body grid layout */
	bodyAlignItems?: HxGridAlignItems;
	/** Default align-content value for panel body grid layout */
	bodyAlignContent?: HxGridAlignContent;
	/** Default horizontal gap size between body grid items */
	bodyGapX?: HxGap;
	/** Default vertical gap size between body grid items */
	bodyGapY?: HxGap;
	/** Default horizontal padding for panel body */
	bodyPaddingX?: HxPadding;
	/** Default top padding for panel body */
	bodyPaddingT?: HxPadding;
	/** Default bottom padding for panel body */
	bodyPaddingB?: HxPadding;
	/** Default to restore scroll to initial state on panel re-expand */
	restoreScroll?: boolean;
}

/**
 * Default configuration values for all HxPanel instances
 */
export const HxPanelDefaults: WithPartial<
	Required<HxPanelSettings>,
	| 'headerGapX' | 'headerGapY' | 'headerPaddingX' | 'headerPaddingT' | 'headerPaddingB'
	| 'bodyGapX' | 'bodyGapY' | 'bodyPaddingX' | 'bodyPaddingT' | 'bodyPaddingB'
> = {
	// panel
	border: true,
	borderRadius: 'md',
	collapsible: false,
	defaultCollapsed: false,
	// header
	headerJustifyContent: 'space-between',
	headerAlignItems: 'start',
	headerAlignContent: 'start',
	// body
	bodyColumns: 12,
	bodyJustifyItems: 'normal',
	bodyJustifyContent: 'normal',
	bodyAlignItems: 'normal',
	bodyAlignContent: 'normal',
	restoreScroll: true
};

/**
 * Configure global default settings for all HxPanel components
 * @param settings - Configuration options to override defaults
 */
export const configHxPanel = (settings: HxPanelSettings) => {
	// panel
	HxPanelDefaults.border = settings.border ?? HxPanelDefaults.border;
	HxPanelDefaults.borderRadius = settings.borderRadius?.trim() as HxBorderRadius || HxPanelDefaults.borderRadius;
	HxPanelDefaults.collapsible = settings.collapsible ?? HxPanelDefaults.collapsible;
	HxPanelDefaults.defaultCollapsed = settings.defaultCollapsed ?? HxPanelDefaults.defaultCollapsed;
	// header
	HxPanelDefaults.headerJustifyContent = settings.headerJustifyContent?.trim() as HxFlexJustifyContent || HxPanelDefaults.headerJustifyContent;
	HxPanelDefaults.headerAlignItems = settings.headerAlignItems?.trim() as HxFlexAlignItems || HxPanelDefaults.headerAlignItems;
	HxPanelDefaults.headerAlignContent = settings.headerAlignContent?.trim() as HxFlexAlignContent || HxPanelDefaults.headerAlignContent;
	HxPanelDefaults.headerGapX = settings.headerGapX?.trim() as HxGap;
	HxPanelDefaults.headerGapY = settings.headerGapY?.trim() as HxGap;
	HxPanelDefaults.headerPaddingX = settings.headerPaddingX?.trim() as HxPadding;
	HxPanelDefaults.headerPaddingT = settings.headerPaddingT?.trim() as HxPadding;
	HxPanelDefaults.headerPaddingB = settings.headerPaddingB?.trim() as HxPadding;
	// body
	HxPanelDefaults.bodyColumns = settings.bodyColumns ?? HxPanelDefaults.bodyColumns;
	HxPanelDefaults.bodyJustifyItems = settings.bodyJustifyItems?.trim() as HxGridJustifyItems || HxPanelDefaults.bodyJustifyItems;
	HxPanelDefaults.bodyJustifyContent = settings.bodyJustifyContent?.trim() as HxGridJustifyContent || HxPanelDefaults.bodyJustifyContent;
	HxPanelDefaults.bodyAlignItems = settings.bodyAlignItems?.trim() as HxGridAlignItems || HxPanelDefaults.bodyAlignItems;
	HxPanelDefaults.bodyAlignContent = settings.bodyAlignContent?.trim() as HxGridAlignContent || HxPanelDefaults.bodyAlignContent;
	HxPanelDefaults.bodyGapX = settings.bodyGapX?.trim() as HxGap;
	HxPanelDefaults.bodyGapY = settings.bodyGapY?.trim() as HxGap;
	HxPanelDefaults.bodyPaddingX = settings.bodyPaddingX?.trim() as HxPadding;
	HxPanelDefaults.bodyPaddingT = settings.bodyPaddingT?.trim() as HxPadding;
	HxPanelDefaults.bodyPaddingB = settings.bodyPaddingB?.trim() as HxPadding;
	HxPanelDefaults.restoreScroll = settings.restoreScroll ?? HxPanelDefaults.restoreScroll;
};
