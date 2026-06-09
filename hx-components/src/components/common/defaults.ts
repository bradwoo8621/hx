import type {HxDateFormat, HxDateTimeFormat, HxTimeFormat} from './types';

export interface HxCommonSettings {
	modelDateTimeFormat?: string;
	modelDateFormat?: string;
	modelTimeFormat?: string;
}

export const HxModelDateTimeFormat: HxDateTimeFormat = 'YYYY/MM/DDTHH:mm:ss';
export const HxModelDateFormat: HxDateFormat = 'YYYY/MM/DD';
export const HxModelTimeFormat: HxTimeFormat = 'HH:mm:ss';

export const HxCommonDefaults: Required<HxCommonSettings> = {
	modelDateTimeFormat: HxModelDateTimeFormat,
	modelDateFormat: HxModelDateFormat,
	modelTimeFormat: HxModelTimeFormat
};

export const configHxCommon = (settings: HxCommonSettings) => {
	HxCommonDefaults.modelDateTimeFormat = settings.modelDateTimeFormat || HxCommonDefaults.modelDateTimeFormat;
	HxCommonDefaults.modelDateFormat = settings.modelDateFormat || HxCommonDefaults.modelDateFormat;
	HxCommonDefaults.modelTimeFormat = settings.modelTimeFormat || HxCommonDefaults.modelTimeFormat;
};
