import type {ReactNode} from 'react';
import type {HxLanguageCode} from '../types';

/**
 * Language subset type, supports nested structure
 * Can be string, React node, or another nested subset
 */
export interface HxLanguageSubset {
	[key: string]: string | ReactNode | HxLanguageSubset;
}

/** Complete language package type for a single language */
export type HxLanguagePackage = Record<string, string | ReactNode | HxLanguageSubset>;

/** Multiple language packages collection, key is language code, value is the language package */
export type HxLanguages = Record<HxLanguageCode, HxLanguagePackage>;

/**
 * Language change listener function type
 * @param languageCode The language code after change
 * @param type Change type: 'language-code-change' when switching language, 'languages-change' when language packages themselves change
 */
export type LanguageChangeListener = (languageCode: HxLanguageCode, type: 'language-code-change' | 'languages-change') => void;
