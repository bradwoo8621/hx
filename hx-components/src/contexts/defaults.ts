import type {HxLanguageCode, HxThemeCode} from './types';

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

/**
 * All settings must be set before hx context initialized, otherwise it doesn't work.
 */
export const configHxContext = (settings: HxContextSettings) => {
	HxContextDefaults.resetHtmlStyles = settings.resetHtmlStyles ?? HxContextDefaults.resetHtmlStyles;
	HxContextDefaults.resetBodyStyles = settings.resetBodyStyles ?? HxContextDefaults.resetBodyStyles;
	HxContextDefaults.themeCode = settings.themeCode?.trim() || HxContextDefaults.themeCode;
	HxContextDefaults.languageCode = settings.languageCode?.trim() || HxContextDefaults.languageCode;
};
