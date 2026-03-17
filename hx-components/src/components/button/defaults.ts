import type {HxButtonColor, HxButtonVarious} from './button';

export interface HxButtonSettings {
	/** color of button, default primary */
	color?: HxButtonColor;
	/** various of button, default solid */
	various?: HxButtonVarious;
	/** apply uppercase transform or not, default true */
	uppercase?: boolean;
	/** use i18n when value from model, or not, default false */
	valueUseI18N?: boolean;
}

export const HxButtonDefaults: Required<HxButtonSettings> = {
	color: 'primary',
	various: 'solid',
	uppercase: true,
	valueUseI18N: false
};

export const configHxButton = (settings: HxButtonSettings) => {
	HxButtonDefaults.color = settings.color?.trim() as HxButtonColor || HxButtonDefaults.color;
	HxButtonDefaults.various = settings.various?.trim() as HxButtonVarious || HxButtonDefaults.various;
	HxButtonDefaults.uppercase = settings.uppercase ?? HxButtonDefaults.uppercase;
	HxButtonDefaults.valueUseI18N = settings.valueUseI18N ?? HxButtonDefaults.valueUseI18N;
};
