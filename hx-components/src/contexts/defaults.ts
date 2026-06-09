import type {HxLanguageCode} from './language';
import type {HxThemeCode} from './theme';

export interface HxContextSettings {
	themeCode?: HxThemeCode;
	languageCode?: HxLanguageCode;
}

export const HxDefaultThemeCode = 'light';
export const HxDefaultLanguageCode = 'en';

export const HxContextDefaults: Required<HxContextSettings> = {
	themeCode: HxDefaultThemeCode,
	languageCode: HxDefaultLanguageCode
};

export const configHxContext = (settings: HxContextSettings) => {
	HxContextDefaults.themeCode = settings.languageCode?.trim() || HxContextDefaults.themeCode;
	HxContextDefaults.languageCode = settings.languageCode?.trim() || HxContextDefaults.languageCode;
};
