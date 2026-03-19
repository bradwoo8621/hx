export interface HxInputSettings {
	/** select all text when focused, or not. default true */
	selectAll?: boolean;
	/** emit value changed on blur, or not. default false, means emit event on change */
	emitChangeOnBlur?: boolean;
	/**
	 * delay time (in ms) of emit value change event. default 150ms.
	 * effective only when "emitChangeOnBlur" is false
	 */
	emitChangeDelay?: number;
}

export const HxInputDefaults: Required<HxInputSettings> = {
	selectAll: true,
	emitChangeOnBlur: false,
	emitChangeDelay: 150
};

export const configHxInput = (settings: HxInputSettings) => {
	HxInputDefaults.selectAll = settings.selectAll ?? HxInputDefaults.selectAll;
	HxInputDefaults.emitChangeOnBlur = settings.emitChangeOnBlur ?? HxInputDefaults.emitChangeOnBlur;
	HxInputDefaults.emitChangeDelay = settings.emitChangeDelay ?? HxInputDefaults.emitChangeDelay;
	if (HxInputDefaults.emitChangeDelay < 0) {
		HxInputDefaults.emitChangeDelay = 0;
	}
};
