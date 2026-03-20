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

export interface HxFlexSettings {
	direction?: HxFlexDirection;
	wrap?: boolean;
	justifyContent?: HxFlexJustifyContent;
	alignItems?: HxFlexAlignItems;
	alignContent?: HxFlexAlignContent;
	border?: boolean;
	borderRadius?: HxFlexBorderRadius;
	gapX?: HxFlexGapX;
	gapY?: HxFlexGapY;
	paddingX?: HxFlexPaddingX;
	paddingT?: HxFlexPaddingT;
	paddingB?: HxFlexPaddingB;
}

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
