import type {WithRequired} from '../../types';
import type {HxLabelPaddingX, HxLabelPaddingY} from './label';

export interface HxLabelSettings {
	/** use i18n when value from model, or not, default false */
	valueUseI18N?: boolean;
	/** Default horizontal padding size */
	paddingX?: HxLabelPaddingX;
	/** Default vertical padding size */
	paddingY?: HxLabelPaddingY;
}

export const HxLabelDefaults: WithRequired<HxLabelSettings, 'valueUseI18N'> = {
	valueUseI18N: false
};

export const configHxLabel = (settings: HxLabelSettings) => {
	HxLabelDefaults.valueUseI18N = settings.valueUseI18N ?? HxLabelDefaults.valueUseI18N;
	HxLabelDefaults.paddingX = settings.paddingX?.trim() as HxLabelPaddingX || HxLabelDefaults.paddingX;
	HxLabelDefaults.paddingY = settings.paddingY?.trim() as HxLabelPaddingY || HxLabelDefaults.paddingY;
};
