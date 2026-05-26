export interface HxFormatInputSettings {
	forceUseEnFormat?: boolean;
}

export const HxFormatInputDefaults: Required<HxFormatInputSettings> = {
	forceUseEnFormat: false
};

export const configHxFormatInput = (settings: HxFormatInputSettings) => {
	HxFormatInputDefaults.forceUseEnFormat = settings.forceUseEnFormat ?? HxFormatInputDefaults.forceUseEnFormat;
};
