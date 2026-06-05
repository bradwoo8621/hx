export interface HxFormatInputSettings {
	forceUseEnFormat?: boolean;
	date: string;
	time: string;
	datetime: string;
}

export const HxFormatInputDefaults: Required<HxFormatInputSettings> = {
	forceUseEnFormat: false,
	date: '@d/ymd',
	time: '@d:hns',
	datetime: '@d/ymd :hns'
};

export const configHxFormatInput = (settings: HxFormatInputSettings) => {
	HxFormatInputDefaults.forceUseEnFormat = settings.forceUseEnFormat ?? HxFormatInputDefaults.forceUseEnFormat;
	// no valid check here, have faith in user!
	HxFormatInputDefaults.date = settings.date ?? HxFormatInputDefaults.date;
	HxFormatInputDefaults.time = settings.time ?? HxFormatInputDefaults.time;
	HxFormatInputDefaults.datetime = settings.datetime ?? HxFormatInputDefaults.datetime;
};
