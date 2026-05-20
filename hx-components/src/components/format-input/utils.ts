import type {
	HxFormatInputPatternKit,
	HxFormatInputParsedPattern,
	HxFormatInputParsedPatterns,
	HxFormatInputPattern
} from './types';

export const buildKit =
	<K extends HxFormatInputPatternKit, P extends HxFormatInputParsedPattern>(options: {
		parse: (pattern: string) => P | false;
		is: (pattern: HxFormatInputParsedPatterns) => pattern is P;
		create: (parsed: P) => K
	}) => {
		const {parse, is, create} = options;

		return (pattern: HxFormatInputPattern): K | false => {
			if (typeof pattern === 'string') {
				const parsed = parse(pattern);
				if (parsed === false) {
					return false;
				} else {
					return create(parsed);
				}
			} else if (is(pattern)) {
				return create(pattern);
			} else {
				return false;
			}
		};
	};
