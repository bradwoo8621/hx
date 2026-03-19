import type {HxFlexDirection, HxFlexGapX, HxFlexGapY} from './flex';

export interface HxFlexSettings {
	direction?: HxFlexDirection;
	border?: boolean;
	gapX?: HxFlexGapX;
	gapY?: HxFlexGapY;
}

export const HxFlexDefaults: Required<HxFlexSettings> = {
	direction: 'horizontal',
	border: false,
	gapX: 'md',
	gapY: 'none'
};

export const configHxFlex = (settings: HxFlexSettings) => {
	HxFlexDefaults.direction = settings.direction?.trim() as HxFlexDirection || HxFlexDefaults.direction;
	HxFlexDefaults.border = settings.border ?? HxFlexDefaults.border;
	HxFlexDefaults.gapX = settings.gapX?.trim() as HxFlexGapX || HxFlexDefaults.gapX;
	HxFlexDefaults.gapY = settings.gapY?.trim() as HxFlexGapY || HxFlexDefaults.gapY;
};
