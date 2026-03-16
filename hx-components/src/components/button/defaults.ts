import type {HxButtonColor, HxButtonVarious} from './button';

export interface HxButtonSettings {
	color?: HxButtonColor;
	various?: HxButtonVarious;
	uppercase?: boolean;
}

export const HxButtonDefaults: Required<HxButtonSettings> = {
	color: 'primary',
	various: 'solid',
	uppercase: true
};

export const configHxButton = (settings: HxButtonSettings) => {
	HxButtonDefaults.color = settings.color?.trim() as HxButtonColor || HxButtonDefaults.color;
	HxButtonDefaults.various = settings.various?.trim() as HxButtonVarious || HxButtonDefaults.various;
	HxButtonDefaults.uppercase = settings.uppercase ?? HxButtonDefaults.uppercase;
};
