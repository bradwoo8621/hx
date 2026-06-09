import type {WithPartial} from '../../types';

export interface HxFormatInputSettings {
	forceUseEnFormat?: boolean;
	date: string;
	time: string;
	datetime: string;
	modelFormat?: string;
}

export const HxFormatDefaultDatePattern = '@d/ymd';
export const HxFormatDefaultTimePattern = '@d:hns';
export const HxFormatDefaultDateTimePattern = '@d/ymd :hns';

export const HxFormatInputDefaults: WithPartial<Required<HxFormatInputSettings>, 'modelFormat'> = {
	forceUseEnFormat: false,
	date: HxFormatDefaultDatePattern,
	time: HxFormatDefaultTimePattern,
	datetime: HxFormatDefaultDateTimePattern
};

export const configHxFormatInput = (settings: HxFormatInputSettings) => {
	HxFormatInputDefaults.forceUseEnFormat = settings.forceUseEnFormat ?? HxFormatInputDefaults.forceUseEnFormat;
	// no valid check here, have faith in user!
	HxFormatInputDefaults.date = settings.date ?? HxFormatInputDefaults.date;
	HxFormatInputDefaults.time = settings.time ?? HxFormatInputDefaults.time;
	HxFormatInputDefaults.datetime = settings.datetime ?? HxFormatInputDefaults.datetime;
	HxFormatInputDefaults.modelFormat = settings.modelFormat ?? HxFormatInputDefaults.modelFormat;
};
