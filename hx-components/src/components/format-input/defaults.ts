import type {WithPartial} from '../../types';
import type {HxDateTimeRelatedFormat} from '../common';
import type {HxFormatInputDateTimePattern} from './types';

export interface HxFormatInputSettings {
	forceUseEnFormat?: boolean;
	datetimeValueFormat?: HxDateTimeRelatedFormat;
}

export const HxFormatDefaultDatePattern: HxFormatInputDateTimePattern = '@d/ymd';
export const HxFormatDefaultTimePattern: HxFormatInputDateTimePattern = '@d:hns';
export const HxFormatDefaultDateTimePattern: HxFormatInputDateTimePattern = '@d/ymd :hns';

export const HxFormatInputDefaults: WithPartial<Required<HxFormatInputSettings>, 'datetimeValueFormat'> = {
	forceUseEnFormat: false
};

export const configHxFormatInput = (settings: HxFormatInputSettings) => {
	HxFormatInputDefaults.forceUseEnFormat = settings.forceUseEnFormat ?? HxFormatInputDefaults.forceUseEnFormat;
	HxFormatInputDefaults.datetimeValueFormat = settings.datetimeValueFormat;
};
