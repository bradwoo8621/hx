import type {HxButtonColor, HxButtonVarious} from './button';

export interface HxButtonSettings {
	color?: HxButtonColor;
	various?: HxButtonVarious;
	/** apply uppercase transform or not, default true */
	uppercase?: boolean;
	/** allow value from model applying i18n or not, default false */
	i18nValueAllowed?: boolean;
}

export const HxButtonDefaults: Required<HxButtonSettings> = {
	color: 'primary',
	various: 'solid',
	uppercase: true,
	i18nValueAllowed: false
};

export const configHxButton = (settings: HxButtonSettings) => {
	HxButtonDefaults.color = settings.color?.trim() as HxButtonColor || HxButtonDefaults.color;
	HxButtonDefaults.various = settings.various?.trim() as HxButtonVarious || HxButtonDefaults.various;
	HxButtonDefaults.uppercase = settings.uppercase ?? HxButtonDefaults.uppercase;
	HxButtonDefaults.i18nValueAllowed = settings.i18nValueAllowed ?? HxButtonDefaults.i18nValueAllowed;
};
