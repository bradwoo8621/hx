import type {WithRequired} from '../../types';
import type {HxMCheckboxDirection} from './m-checkbox';

/**
 * Global configuration settings for HxMCheckbox component
 */
export interface HxMCheckboxSettings {
	/** Default layout direction of radio options */
	direction?: HxMCheckboxDirection;
	/** Behavior when options change: 'none' do nothing, 'clear' clear selected value */
	onOptionsChange?: 'none' | 'clear';
	/** i18n translation key for loading state text when options are being fetched */
	optionsOnLoadKey?: string;
	/** i18n translation key for empty state text when no options available */
	noOptionsKey?: string;
}

/**
 * Required configuration properties for HxMCheckbox defaults
 */
type RequiredProps =
	| 'direction'
	| 'onOptionsChange'
	| 'optionsOnLoadKey'
	| 'noOptionsKey';

/**
 * Default configuration values for HxMCheckbox component
 */
export const HxMCheckboxDefaults: WithRequired<HxMCheckboxSettings, RequiredProps> = {
	direction: 'dir-y',
	onOptionsChange: 'clear',
	optionsOnLoadKey: '~HxCommon.SelectOptionsOnLoad',
	noOptionsKey: '~HxCommon.SelectNoOptions'
};

/**
 * Configure global default settings for all HxMCheckbox instances
 * @param settings - Configuration options to override defaults
 */
export const configHxMCheckbox = (settings: HxMCheckboxSettings) => {
	HxMCheckboxDefaults.direction = settings.direction?.trim() as HxMCheckboxDirection || HxMCheckboxDefaults.direction;
	HxMCheckboxDefaults.onOptionsChange = settings.onOptionsChange ?? HxMCheckboxDefaults.onOptionsChange;
	HxMCheckboxDefaults.optionsOnLoadKey = settings.optionsOnLoadKey?.trim() || HxMCheckboxDefaults.optionsOnLoadKey;
	HxMCheckboxDefaults.noOptionsKey = settings.noOptionsKey?.trim() || HxMCheckboxDefaults.noOptionsKey;
};
