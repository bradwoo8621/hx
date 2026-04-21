import type {HxFlexGapX, HxFlexPaddingT, HxFlexPaddingX} from '../flex';

export interface HxButtonBarSettings {
	gap?: HxFlexGapX;
	paddingX?: HxFlexPaddingX;
	paddingY?: HxFlexPaddingT;
}

export const HxButtonBarDefaults: Required<HxButtonBarSettings> = {
	gap: 'xs',
	paddingX: 'lg',
	paddingY: 'md'
};

export const configHxButtonBar = (settings: HxButtonBarSettings) => {
	HxButtonBarDefaults.gap = settings.gap?.trim() as HxFlexGapX || HxButtonBarDefaults.gap;
	HxButtonBarDefaults.paddingX = settings.paddingX?.trim() as HxFlexPaddingX || HxButtonBarDefaults.paddingX;
	HxButtonBarDefaults.paddingY = settings.paddingY?.trim() as HxFlexPaddingT || HxButtonBarDefaults.paddingY;
};
