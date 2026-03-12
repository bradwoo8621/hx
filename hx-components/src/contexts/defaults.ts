import type {HxLanguageCode} from './language-context';
import type {HxThemeCode} from './theme-context';

export interface HxContextSettings {
	themeCode?: HxThemeCode;
	languageCode?: HxLanguageCode;
}

export const HxContextDefaults: Required<HxContextSettings> = {
	themeCode: 'light',
	languageCode: 'en'
};

export const configHxContext = (settings: HxContextSettings) => {
	HxContextDefaults.themeCode = settings.languageCode?.trim() || HxContextDefaults.themeCode;
	HxContextDefaults.languageCode = settings.languageCode?.trim() || HxContextDefaults.languageCode;
};
