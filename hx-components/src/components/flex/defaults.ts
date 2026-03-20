import type {
	HxFlexBorderRadius,
	HxFlexDirection,
	HxFlexGapX,
	HxFlexGapY,
	HxFlexPaddingB,
	HxFlexPaddingT,
	HxFlexPaddingX
} from './flex';

export interface HxFlexSettings {
	direction?: HxFlexDirection;
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
	HxFlexDefaults.border = settings.border ?? HxFlexDefaults.border;
	HxFlexDefaults.borderRadius = settings.borderRadius?.trim() as HxFlexBorderRadius || HxFlexDefaults.borderRadius;
	HxFlexDefaults.gapX = settings.gapX?.trim() as HxFlexGapX || HxFlexDefaults.gapX;
	HxFlexDefaults.gapY = settings.gapY?.trim() as HxFlexGapY || HxFlexDefaults.gapY;
	HxFlexDefaults.paddingX = settings.paddingX?.trim() as HxFlexPaddingX || HxFlexDefaults.paddingX;
	HxFlexDefaults.paddingT = settings.paddingT?.trim() as HxFlexPaddingT || HxFlexDefaults.paddingT;
	HxFlexDefaults.paddingB = settings.paddingB?.trim() as HxFlexPaddingB || HxFlexDefaults.paddingB;
};
