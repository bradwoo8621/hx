import {HxConsole} from '../../utils';
import {HxNumFormatPatternParser} from './format-input-number-pattern';
import type {HxFormatInputParsedPattern, HxFormatInputPattern} from './types';

export const parsePattern = (pattern?: HxFormatInputPattern): HxFormatInputParsedPattern | false => {
	if (pattern == null) {
		return false;
	}
	switch (typeof pattern) {
		case 'string': {
			const parsers = [
				HxNumFormatPatternParser
			];
			for (const parser of parsers) {
				const parsed = parser.parse(pattern);
				if (parsed !== false) {
					return parsed;
				}
			}
			break;
		}
		case 'object': {
			const types = [
				'number'
			];
			if (types.includes(pattern.type)) {
				return pattern;
			}
			break;
		}
	}

	HxConsole.error('Undetermined format input pattern, will downgrade to HxInput.', pattern);
	return false;
};
