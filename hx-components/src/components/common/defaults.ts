import type {HxDateFormat, HxDateTimeFormat, HxTimeFormat} from './types';

export interface HxCommonSettings {
	modelDateTimeFormat?: string;
	modelDateFormat?: string;
	modelTimeFormat?: string;
}

/**
 * y: 4 digits year
 * m: 2 digits month
 * d: 2 digits day
 * h: 2 digits hour
 * n: 2 digits minute
 * s: 2 digits second
 * any other chars will be kept as is
 */
export const HxModelDateTimeFormat: HxDateTimeFormat = 'y/m/dTh:n:s';
/**
 * y: 4 digits year
 * m: 2 digits month
 * d: 2 digits day
 * hns: not allowed
 * any other chars will be kept as is
 */
export const HxModelDateFormat: HxDateFormat = 'y/m/d';
/**
 * ymd: not allowed
 * h: 2 digits hour
 * n: 2 digits minute
 * s: 2 digits second
 * any other chars will be kept as is
 */
export const HxModelTimeFormat: HxTimeFormat = 'h:n:s';

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
