import type {HxCheckboxValuePair} from './checkbox';

export interface HxCheckboxSettings {
	values?: HxCheckboxValuePair;
}

export const HxCheckboxDefaults: Required<HxCheckboxSettings> = {
	values: [true, false]
};

export const configHxCheckbox = (settings: HxCheckboxSettings) => {
	HxCheckboxDefaults.values = settings.values ?? HxCheckboxDefaults.values;
};
