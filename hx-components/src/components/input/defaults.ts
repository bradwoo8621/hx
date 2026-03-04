export interface HxInputSettings {
	selectAll?: boolean;
}

export const HxInputDefaults: Required<HxInputSettings> = {
	selectAll: true
};

export const configHxInput = (settings: HxInputSettings) => {
	HxInputDefaults.selectAll = settings.selectAll ?? HxInputDefaults.selectAll;
};
