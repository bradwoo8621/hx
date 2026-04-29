import type {HxButtonColor, HxButtonVariant} from './button';

export interface HxButtonSettings {
	/** color of button, default primary */
	color?: HxButtonColor;
	/** variant of button, default solid */
	variant?: HxButtonVariant;
	/** apply uppercase transform or not, default true */
	uppercase?: boolean;
	/** use i18n when value from model, or not, default false */
	valueUseI18N?: boolean;
}

export const HxButtonDefaults: Required<HxButtonSettings> = {
	color: 'primary',
	variant: 'solid',
	uppercase: true,
	valueUseI18N: false
};

export const configHxButton = (settings: HxButtonSettings) => {
	HxButtonDefaults.color = settings.color?.trim() as HxButtonColor || HxButtonDefaults.color;
	HxButtonDefaults.variant = settings.variant?.trim() as HxButtonVariant || HxButtonDefaults.variant;
	HxButtonDefaults.uppercase = settings.uppercase ?? HxButtonDefaults.uppercase;
	HxButtonDefaults.valueUseI18N = settings.valueUseI18N ?? HxButtonDefaults.valueUseI18N;
};
