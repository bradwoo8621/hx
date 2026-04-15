import type {WithRequired} from '../../types';
import type {HxMRadioDirection} from './m-radio';

/**
 * Global configuration settings for HxMRadio component
 */
export interface HxMRadioSettings {
	/** Default layout direction of radio options */
	direction?: HxMRadioDirection;
	/** Behavior when options change: 'none' do nothing, 'clear' clear selected value */
	onOptionsChange?: 'none' | 'clear';
	/** i18n translation key for loading state text when options are being fetched */
	optionsOnLoadKey?: string;
	/** i18n translation key for empty state text when no options available */
	noOptionsKey?: string;
}

/**
 * Required configuration properties for HxMRadio defaults
 */
type RequiredProps =
	| 'direction'
	| 'onOptionsChange'
	| 'optionsOnLoadKey'
	| 'noOptionsKey';

/**
 * Default configuration values for HxMRadio component
 */
export const HxMRadioDefaults: WithRequired<HxMRadioSettings, RequiredProps> = {
	direction: 'dir-y',
	onOptionsChange: 'clear',
	optionsOnLoadKey: '~HxCommon.SelectOptionsOnLoad',
	noOptionsKey: '~HxCommon.SelectNoOptions'
};

/**
 * Configure global default settings for all HxMRadio instances
 * @param settings - Configuration options to override defaults
 */
export const configHxMRadio = (settings: HxMRadioSettings) => {
	HxMRadioDefaults.direction = settings.direction?.trim() as HxMRadioDirection || HxMRadioDefaults.direction;
	HxMRadioDefaults.onOptionsChange = settings.onOptionsChange ?? HxMRadioDefaults.onOptionsChange;
	HxMRadioDefaults.optionsOnLoadKey = settings.optionsOnLoadKey?.trim() || HxMRadioDefaults.optionsOnLoadKey;
	HxMRadioDefaults.noOptionsKey = settings.noOptionsKey?.trim() || HxMRadioDefaults.noOptionsKey;
};
