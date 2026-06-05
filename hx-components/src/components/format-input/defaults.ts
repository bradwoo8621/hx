export interface HxFormatInputSettings {
	forceUseEnFormat?: boolean;
	ymdSeparator?: string;
}

export const HxFormatInputDefaults: Required<HxFormatInputSettings> = {
	forceUseEnFormat: false,
	ymdSeparator: '/'
};

export const configHxFormatInput = (settings: HxFormatInputSettings) => {
	HxFormatInputDefaults.forceUseEnFormat = settings.forceUseEnFormat ?? HxFormatInputDefaults.forceUseEnFormat;
	HxFormatInputDefaults.ymdSeparator = settings.ymdSeparator ?? HxFormatInputDefaults.ymdSeparator;
	HxFormatInputDefaults.ymdSeparator = ['/', '-'].includes(HxFormatInputDefaults.ymdSeparator) ? HxFormatInputDefaults.ymdSeparator : '/';
};
