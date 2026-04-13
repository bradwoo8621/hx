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
 * Allows overriding default behavior of all Grid instances application-wide.
 */
export interface HxPanelSettings {
	// panel
	/** Whether to show border by default */
	border?: boolean;
	/** Default border radius size */
	borderRadius?: HxPanelBorderRadius;
	collapsible?: boolean;
	defaultCollapsed?: boolean;
	// header
	headerJustifyContent?: HxPanelHeaderJustifyContent;
	headerAlignItems?: HxPanelHeaderAlignItems;
	headerAlignContent?: HxPanelHeaderAlignContent;
	headerGapX?: HxPanelHeaderGapX;
	headerGapY?: HxPanelHeaderGapY;
	headerPaddingX?: HxPanelHeaderPaddingX;
	headerPaddingT?: HxPanelHeaderPaddingT;
	headerPaddingB?: HxPanelHeaderPaddingB;
	// body
	bodyColumns?: HxPanelBodyColumns;
	bodyJustifyItems?: HxPanelBodyJustifyItems;
	bodyJustifyContent?: HxPanelBodyJustifyContent;
	bodyAlignItems?: HxPanelBodyAlignItems;
	bodyAlignContent?: HxPanelBodyAlignContent;
	bodyGapX?: HxPanelBodyGapX;
	bodyGapY?: HxPanelBodyGapY;
	bodyPaddingX?: HxPanelBodyPaddingX;
	bodyPaddingT?: HxPanelBodyPaddingT;
	bodyPaddingB?: HxPanelBodyPaddingB;
}

export const HxPanelDefaults: Required<HxPanelSettings> = {
	// panel
	border: true,
	borderRadius: 'md',
	collapsible: false,
	defaultCollapsed: false,
	// header
	headerJustifyContent: 'space-between',
	headerAlignItems: 'start',
	headerAlignContent: 'start',
	headerGapX: 'md',
	headerGapY: 'none',
	headerPaddingX: 'md',
	headerPaddingT: 'none',
	headerPaddingB: 'none',
	// body
	bodyColumns: 12,
	bodyJustifyItems: 'normal',
	bodyJustifyContent: 'normal',
	bodyAlignItems: 'normal',
	bodyAlignContent: 'normal',
	bodyGapX: 'md',
	bodyGapY: 'none',
	bodyPaddingX: 'md',
	bodyPaddingT: 'none',
	bodyPaddingB: 'none'
};

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
	HxPanelDefaults.headerGapX = settings.headerGapX?.trim() as HxPanelHeaderGapX || HxPanelDefaults.headerGapX;
	HxPanelDefaults.headerGapY = settings.headerGapY?.trim() as HxPanelHeaderGapY || HxPanelDefaults.headerGapY;
	HxPanelDefaults.headerPaddingX = settings.headerPaddingX?.trim() as HxPanelHeaderPaddingX || HxPanelDefaults.headerPaddingX;
	HxPanelDefaults.headerPaddingT = settings.headerPaddingT?.trim() as HxPanelHeaderPaddingT || HxPanelDefaults.headerPaddingT;
	HxPanelDefaults.headerPaddingB = settings.headerPaddingB?.trim() as HxPanelHeaderPaddingB || HxPanelDefaults.headerPaddingB;
	// body
	HxPanelDefaults.bodyColumns = settings.bodyColumns ?? HxPanelDefaults.bodyColumns;
	HxPanelDefaults.bodyJustifyItems = settings.bodyJustifyItems?.trim() as HxPanelBodyJustifyItems || HxPanelDefaults.bodyJustifyItems;
	HxPanelDefaults.bodyJustifyContent = settings.bodyJustifyContent?.trim() as HxPanelBodyJustifyContent || HxPanelDefaults.bodyJustifyContent;
	HxPanelDefaults.bodyAlignItems = settings.bodyAlignItems?.trim() as HxPanelBodyAlignItems || HxPanelDefaults.bodyAlignItems;
	HxPanelDefaults.bodyAlignContent = settings.bodyAlignContent?.trim() as HxPanelBodyAlignContent || HxPanelDefaults.bodyAlignContent;
	HxPanelDefaults.bodyGapX = settings.bodyGapX?.trim() as HxPanelBodyGapX || HxPanelDefaults.bodyGapX;
	HxPanelDefaults.bodyGapY = settings.bodyGapY?.trim() as HxPanelBodyGapY || HxPanelDefaults.bodyGapY;
	HxPanelDefaults.bodyPaddingX = settings.bodyPaddingX?.trim() as HxPanelBodyPaddingX || HxPanelDefaults.bodyPaddingX;
	HxPanelDefaults.bodyPaddingT = settings.bodyPaddingT?.trim() as HxPanelBodyPaddingT || HxPanelDefaults.bodyPaddingT;
	HxPanelDefaults.bodyPaddingB = settings.bodyPaddingB?.trim() as HxPanelBodyPaddingB || HxPanelDefaults.bodyPaddingB;
};
