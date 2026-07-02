import type {HxDateTimeRelatedFormat, WithPartial} from '../../types';
import type {HxFormatInputDateTimePattern} from './types';

export interface HxFormatInputSettings {
	/** Whether to force English locale format for number kit */
	forceUseEnFormat?: boolean;
	/** Default value format for datetime kit, e.g. `y/m/d h:n:s` */
	datetimeValueFormat?: HxDateTimeRelatedFormat;
	/** Whether to show underscore placeholder chars when datetime value is empty */
	datetimeCharPlaceholderOnEmpty?: boolean;
}

export const HxFormatDefaultDatePattern: HxFormatInputDateTimePattern = '@d/ymd';
export const HxFormatDefaultTimePattern: HxFormatInputDateTimePattern = '@d:hns';
export const HxFormatDefaultDateTimePattern: HxFormatInputDateTimePattern = '@d/ymd :hns';

export const HxFormatInputDefaults: WithPartial<Required<HxFormatInputSettings>, 'datetimeValueFormat'> = {
	forceUseEnFormat: false,
	datetimeCharPlaceholderOnEmpty: false
};

export const configHxFormatInput = (settings: HxFormatInputSettings) => {
	HxFormatInputDefaults.forceUseEnFormat = settings.forceUseEnFormat ?? HxFormatInputDefaults.forceUseEnFormat;
	HxFormatInputDefaults.datetimeValueFormat = settings.datetimeValueFormat;
	HxFormatInputDefaults.datetimeCharPlaceholderOnEmpty = settings.datetimeCharPlaceholderOnEmpty ?? HxFormatInputDefaults.datetimeCharPlaceholderOnEmpty;
};
