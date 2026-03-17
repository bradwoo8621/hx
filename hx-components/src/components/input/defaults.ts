export interface HxInputSettings {
	/** select all text when focused, or not. default true */
	selectAll?: boolean;
}

export const HxInputDefaults: Required<HxInputSettings> = {
	selectAll: true
};

export const configHxInput = (settings: HxInputSettings) => {
	HxInputDefaults.selectAll = settings.selectAll ?? HxInputDefaults.selectAll;
};
