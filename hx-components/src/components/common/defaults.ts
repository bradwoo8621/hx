import type {HxDateFirstDayOfWeek, HxDateFormat, HxDateTimeFormat, HxTimeFormat} from '../../types';

export const HxModelDateTimeFormat: HxDateTimeFormat = 'y/m/dTh:n:s';
export const HxModelDateFormat: HxDateFormat = 'y/m/d';
export const HxModelTimeFormat: HxTimeFormat = 'h:n:s';

export interface HxCommonSettings {
	/** the default datetime value format in model */
	datetimeValueFormat?: HxDateTimeFormat;
	/** the default date value format in model */
	dateValueFormat?: HxDateFormat;
	/** the default time value format in model */
	timeValueFormat?: HxTimeFormat;
	/** the default first day of week */
	firstDayOfWeek?: HxDateFirstDayOfWeek;
}

export const HxCommonDefaults: Required<HxCommonSettings> = {
	datetimeValueFormat: HxModelDateTimeFormat,
	dateValueFormat: HxModelDateFormat,
	timeValueFormat: HxModelTimeFormat,
	firstDayOfWeek: 'sun'
};

export const configHxCommon = (settings: HxCommonSettings) => {
	HxCommonDefaults.datetimeValueFormat = settings.datetimeValueFormat || HxCommonDefaults.datetimeValueFormat;
	HxCommonDefaults.dateValueFormat = settings.dateValueFormat || HxCommonDefaults.dateValueFormat;
	HxCommonDefaults.timeValueFormat = settings.timeValueFormat || HxCommonDefaults.timeValueFormat;
	HxCommonDefaults.firstDayOfWeek = (settings.firstDayOfWeek?.trim() as HxDateFirstDayOfWeek) || HxCommonDefaults.firstDayOfWeek;
	// guard
	if (!['sun', 'mon'].includes(HxCommonDefaults.firstDayOfWeek)) {
		HxCommonDefaults.firstDayOfWeek = 'sun';
	}
};
