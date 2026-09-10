import type {HxLanguageCode} from './language';
import type {HxThemeCode} from './theme';

export interface HxContextSettings {
	resetHtmlStyles?: boolean;
	resetBodyStyles?: boolean;
	themeCode?: HxThemeCode;
	languageCode?: HxLanguageCode;
}

export const HxDefaultThemeCode = 'light';
export const HxDefaultLanguageCode = 'en';

export const HxContextDefaults: Required<HxContextSettings> = {
	resetHtmlStyles: true,
	resetBodyStyles: true,
	themeCode: HxDefaultThemeCode,
	languageCode: HxDefaultLanguageCode
};

export const configHxContext = (settings: HxContextSettings) => {
	HxContextDefaults.resetHtmlStyles = settings.resetHtmlStyles ?? HxContextDefaults.resetHtmlStyles;
	HxContextDefaults.resetBodyStyles = settings.resetBodyStyles ?? HxContextDefaults.resetBodyStyles;
	HxContextDefaults.themeCode = settings.languageCode?.trim() || HxContextDefaults.themeCode;
	HxContextDefaults.languageCode = settings.languageCode?.trim() || HxContextDefaults.languageCode;
};
