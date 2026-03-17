import {HxContextDefaults} from '../defaults';
import type {HxLanguageCode} from './types';

/**
 * Get the fallback language code for the given language code
 * Example: "zh-CN" → "zh" → default language
 * Supports "-", "_", "." as separators
 * @param code Language code to get fallback for
 * @returns Fallback language code, returns undefined if already at default language
 */
export const fallbackLanguage = (code: HxLanguageCode): HxLanguageCode | undefined => {
	let lastPartIndex = code.lastIndexOf('-');
	if (lastPartIndex < 0) {
		lastPartIndex = code.lastIndexOf('_');
	}
	if (lastPartIndex < 0) {
		lastPartIndex = code.lastIndexOf('.');
	}
	if (lastPartIndex === -1) {
		if (code === HxContextDefaults.languageCode) {
			return (void 0);
		} else {
			return HxContextDefaults.languageCode;
		}
	} else {
		return code.substring(0, lastPartIndex);
	}
};
