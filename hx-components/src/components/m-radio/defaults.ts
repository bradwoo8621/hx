import type {WithRequired} from '../../types';
import type {HxMRadioDirection} from './m-radio.tsx';

/**
 * Global configuration settings for select component
 */
export interface HxMRadioSettings {
	direction?: HxMRadioDirection;
	onOptionsChange?: 'none' | 'clear';
	/** i18n translation key for loading state text */
	optionsOnLoadKey?: string;
	/** i18n translation key for empty options state text */
	noOptionsKey?: string;
}

type RequiredProps =
	| 'direction'
	| 'onOptionsChange'
	| 'optionsOnLoadKey'
	| 'noOptionsKey';

export const HxMRadioDefaults: WithRequired<HxMRadioSettings, RequiredProps> = {
	direction: 'dir-y',
	onOptionsChange: 'clear',
	optionsOnLoadKey: '~HxCommon.SelectOptionsOnLoad',
	noOptionsKey: '~HxCommon.SelectNoOptions'
};

export const configHxMRadio = (settings: HxMRadioSettings) => {
	HxMRadioDefaults.direction = settings.direction?.trim() as HxMRadioDirection || HxMRadioDefaults.direction;
	HxMRadioDefaults.onOptionsChange = settings.onOptionsChange ?? HxMRadioDefaults.onOptionsChange;
	HxMRadioDefaults.optionsOnLoadKey = settings.optionsOnLoadKey?.trim() || HxMRadioDefaults.optionsOnLoadKey;
	HxMRadioDefaults.noOptionsKey = settings.noOptionsKey?.trim() || HxMRadioDefaults.noOptionsKey;
};
