import type {WithPartial} from '../../types';
import type {
	HxPanelBodyAlignContent,
	HxPanelBodyAlignItems,
	HxPanelBodyColumns,
	HxPanelBodyGapX,
	HxPanelBodyGapY,
	HxPanelBodyJustifyContent,
	HxPanelBodyJustifyItems,
	HxPanelBodyPaddingB,
	HxPanelBodyPaddingT,
	HxPanelBodyPaddingX,
	HxPanelBorderRadius,
	HxPanelHeaderAlignContent,
	HxPanelHeaderAlignItems,
	HxPanelHeaderGapX,
	HxPanelHeaderGapY,
	HxPanelHeaderJustifyContent,
	HxPanelHeaderPaddingB,
	HxPanelHeaderPaddingT,
	HxPanelHeaderPaddingX
} from '../panel';

/**
 * Global configuration settings for HxPanel component.
 * Allows overriding default behavior of all Panel instances application-wide.
 */
export interface HxPanelSettings {
	// panel
	/** Whether to show border by default */
	border?: boolean;
	/** Default border radius size */
	borderRadius?: HxPanelBorderRadius;
	/** Whether the panel is collapsible by default */
	collapsible?: boolean;
	/** Whether the panel is collapsed by default when collapsible */
	defaultCollapsed?: boolean;
	// header
	/** Default justify-content value for panel header flex layout */
	headerJustifyContent?: HxPanelHeaderJustifyContent;
	/** Default align-items value for panel header flex layout */
	headerAlignItems?: HxPanelHeaderAlignItems;
	/** Default align-content value for panel header flex layout */
	headerAlignContent?: HxPanelHeaderAlignContent;
	/** Default horizontal gap size between header items */
	headerGapX?: HxPanelHeaderGapX;
	/** Default vertical gap size between header items */
	headerGapY?: HxPanelHeaderGapY;
	/** Default horizontal padding for panel header */
	headerPaddingX?: HxPanelHeaderPaddingX;
	/** Default top padding for panel header */
	headerPaddingT?: HxPanelHeaderPaddingT;
	/** Default bottom padding for panel header */
	headerPaddingB?: HxPanelHeaderPaddingB;
	// body
	/** Default number of grid columns for panel body */
	bodyColumns?: HxPanelBodyColumns;
	/** Default justify-items value for panel body grid layout */
	bodyJustifyItems?: HxPanelBodyJustifyItems;
	/** Default justify-content value for panel body grid layout */
	bodyJustifyContent?: HxPanelBodyJustifyContent;
	/** Default align-items value for panel body grid layout */
	bodyAlignItems?: HxPanelBodyAlignItems;
	/** Default align-content value for panel body grid layout */
	bodyAlignContent?: HxPanelBodyAlignContent;
	/** Default horizontal gap size between body grid items */
	bodyGapX?: HxPanelBodyGapX;
	/** Default vertical gap size between body grid items */
	bodyGapY?: HxPanelBodyGapY;
	/** Default horizontal padding for panel body */
	bodyPaddingX?: HxPanelBodyPaddingX;
	/** Default top padding for panel body */
	bodyPaddingT?: HxPanelBodyPaddingT;
	/** Default bottom padding for panel body */
	bodyPaddingB?: HxPanelBodyPaddingB;
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
	bodyAlignContent: 'normal'
};

/**
 * Configure global default settings for all HxPanel components
 * @param settings - Configuration options to override defaults
 */
export const configHxPanel = (settings: HxPanelSettings) => {
	// panel
	HxPanelDefaults.border = settings.border ?? HxPanelDefaults.border;
	HxPanelDefaults.borderRadius = settings.borderRadius?.trim() as HxPanelBorderRadius || HxPanelDefaults.borderRadius;
	HxPanelDefaults.collapsible = settings.collapsible ?? HxPanelDefaults.collapsible;
	HxPanelDefaults.defaultCollapsed = settings.defaultCollapsed ?? HxPanelDefaults.defaultCollapsed;
	// header
	HxPanelDefaults.headerJustifyContent = settings.headerJustifyContent?.trim() as HxPanelHeaderJustifyContent || HxPanelDefaults.headerJustifyContent;
	HxPanelDefaults.headerAlignItems = settings.headerAlignItems?.trim() as HxPanelHeaderAlignItems || HxPanelDefaults.headerAlignItems;
	HxPanelDefaults.headerAlignContent = settings.headerAlignContent?.trim() as HxPanelHeaderAlignContent || HxPanelDefaults.headerAlignContent;
	HxPanelDefaults.headerGapX = settings.headerGapX?.trim() as HxPanelHeaderGapX;
	HxPanelDefaults.headerGapY = settings.headerGapY?.trim() as HxPanelHeaderGapY;
	HxPanelDefaults.headerPaddingX = settings.headerPaddingX?.trim() as HxPanelHeaderPaddingX;
	HxPanelDefaults.headerPaddingT = settings.headerPaddingT?.trim() as HxPanelHeaderPaddingT;
	HxPanelDefaults.headerPaddingB = settings.headerPaddingB?.trim() as HxPanelHeaderPaddingB;
	// body
	HxPanelDefaults.bodyColumns = settings.bodyColumns ?? HxPanelDefaults.bodyColumns;
	HxPanelDefaults.bodyJustifyItems = settings.bodyJustifyItems?.trim() as HxPanelBodyJustifyItems || HxPanelDefaults.bodyJustifyItems;
	HxPanelDefaults.bodyJustifyContent = settings.bodyJustifyContent?.trim() as HxPanelBodyJustifyContent || HxPanelDefaults.bodyJustifyContent;
	HxPanelDefaults.bodyAlignItems = settings.bodyAlignItems?.trim() as HxPanelBodyAlignItems || HxPanelDefaults.bodyAlignItems;
	HxPanelDefaults.bodyAlignContent = settings.bodyAlignContent?.trim() as HxPanelBodyAlignContent || HxPanelDefaults.bodyAlignContent;
	HxPanelDefaults.bodyGapX = settings.bodyGapX?.trim() as HxPanelBodyGapX;
	HxPanelDefaults.bodyGapY = settings.bodyGapY?.trim() as HxPanelBodyGapY;
	HxPanelDefaults.bodyPaddingX = settings.bodyPaddingX?.trim() as HxPanelBodyPaddingX;
	HxPanelDefaults.bodyPaddingT = settings.bodyPaddingT?.trim() as HxPanelBodyPaddingT;
	HxPanelDefaults.bodyPaddingB = settings.bodyPaddingB?.trim() as HxPanelBodyPaddingB;
};
