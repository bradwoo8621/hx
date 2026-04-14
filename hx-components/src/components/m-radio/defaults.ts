import type {WithRequired} from '../../types';

/**
 * Global configuration settings for select component
 */
export interface HxMRadioSettings {
	onOptionsChange?: 'none' | 'clear';
	/** i18n translation key for loading state text */
	optionsOnLoadKey?: string;
	/** i18n translation key for empty options state text */
	noOptionsKey?: string;
}

type RequiredProps =
	| 'onOptionsChange'
	| 'optionsOnLoadKey'
	| 'noOptionsKey';

export const HxMRadioDefaults: WithRequired<HxMRadioSettings, RequiredProps> = {
	onOptionsChange: 'clear',
	optionsOnLoadKey: '~HxCommon.SelectOptionsOnLoad',
	noOptionsKey: '~HxCommon.SelectNoOptions'
};

export const configHxMRadio = (settings: HxMRadioSettings) => {
	HxMRadioDefaults.onOptionsChange = settings.onOptionsChange ?? HxMRadioDefaults.onOptionsChange;
	HxMRadioDefaults.optionsOnLoadKey = settings.optionsOnLoadKey?.trim() || HxMRadioDefaults.optionsOnLoadKey;
	HxMRadioDefaults.noOptionsKey = settings.noOptionsKey?.trim() || HxMRadioDefaults.noOptionsKey;
};
