import type {HxFlexBorderRadius, HxFlexDirection, HxFlexGapX, HxFlexGapY} from './flex';

export interface HxFlexSettings {
	direction?: HxFlexDirection;
	border?: boolean;
	borderRadius?: HxFlexBorderRadius;
	gapX?: HxFlexGapX;
	gapY?: HxFlexGapY;
}

export const HxFlexDefaults: Required<HxFlexSettings> = {
	direction: 'dir-x',
	border: false,
	borderRadius: 'md',
	gapX: 'md',
	gapY: 'none'
};

export const configHxFlex = (settings: HxFlexSettings) => {
	HxFlexDefaults.direction = settings.direction?.trim() as HxFlexDirection || HxFlexDefaults.direction;
	HxFlexDefaults.border = settings.border ?? HxFlexDefaults.border;
	HxFlexDefaults.borderRadius = settings.borderRadius?.trim() as HxFlexBorderRadius || HxFlexDefaults.borderRadius;
	HxFlexDefaults.gapX = settings.gapX?.trim() as HxFlexGapX || HxFlexDefaults.gapX;
	HxFlexDefaults.gapY = settings.gapY?.trim() as HxFlexGapY || HxFlexDefaults.gapY;
};
