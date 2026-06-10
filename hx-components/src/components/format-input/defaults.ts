import type {WithPartial, HxDateTimeRelatedFormat} from '../../types';
import type {HxFormatInputDateTimePattern, HxFormatInputDateTimeUsePlaceholder} from './types';

export interface HxFormatInputSettings {
	forceUseEnFormat?: boolean;
	datetimeValueFormat?: HxDateTimeRelatedFormat;
	datetimeUsePlaceholder?: HxFormatInputDateTimeUsePlaceholder;
}

export const HxFormatDefaultDatePattern: HxFormatInputDateTimePattern = '@d/ymd';
export const HxFormatDefaultTimePattern: HxFormatInputDateTimePattern = '@d:hns';
export const HxFormatDefaultDateTimePattern: HxFormatInputDateTimePattern = '@d/ymd :hns';

export const HxFormatInputDefaults: WithPartial<Required<HxFormatInputSettings>, 'datetimeValueFormat'> = {
	forceUseEnFormat: false,
	datetimeUsePlaceholder: 'yes'
};

export const configHxFormatInput = (settings: HxFormatInputSettings) => {
	HxFormatInputDefaults.forceUseEnFormat = settings.forceUseEnFormat ?? HxFormatInputDefaults.forceUseEnFormat;
	HxFormatInputDefaults.datetimeValueFormat = settings.datetimeValueFormat;
	HxFormatInputDefaults.datetimeUsePlaceholder = settings.datetimeUsePlaceholder || HxFormatInputDefaults.datetimeUsePlaceholder;
	if (!['yes', 'no', 'auto'].includes(HxFormatInputDefaults.datetimeUsePlaceholder)) {
		HxFormatInputDefaults.datetimeUsePlaceholder = 'yes';
	}
};
