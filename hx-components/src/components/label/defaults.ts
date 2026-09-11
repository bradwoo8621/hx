import type {HxPadding, WithRequired} from '../../types';

export interface HxLabelSettings {
	/** use i18n when value from model, or not, default false */
	valueUseI18N?: boolean;
	/** Default horizontal padding size */
	paddingX?: HxPadding;
	/** Default vertical padding size */
	paddingY?: HxPadding;
}

export const HxLabelDefaults: WithRequired<HxLabelSettings, 'valueUseI18N'> = {
	valueUseI18N: false
};

export const configHxLabel = (settings: HxLabelSettings) => {
	HxLabelDefaults.valueUseI18N = settings.valueUseI18N ?? HxLabelDefaults.valueUseI18N;
	HxLabelDefaults.paddingX = settings.paddingX?.trim() as HxPadding;
	HxLabelDefaults.paddingY = settings.paddingY?.trim() as HxPadding;
};
