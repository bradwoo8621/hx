import type {HxContext} from '../../contexts';
import type {HxFormatInputDateTimeParsedPattern, HxFormatInputParsedPattern, HxFormatInputPatternKit} from './types';
import {buildKit} from './utils.ts';

export class HxFormatInputDateTimePatternParser {
}

export class HxFormatInputDateTimePatternKit implements HxFormatInputPatternKit {
	getPattern(): HxFormatInputParsedPattern {
		throw new Error('Method not implemented.');
	}

	correct(oldValue: string, newValue: string, isBackspace: boolean, context: HxContext): [string, number] {
		throw new Error('Method not implemented.');
	}

	toModel(value: string | null | undefined, context: HxContext) {
		throw new Error('Method not implemented.');
	}

	fromModel(value: any | null | undefined, context: HxContext): string | null | undefined {
		throw new Error('Method not implemented.');
	}

	static readonly build = buildKit<HxFormatInputDateTimePatternKit, HxFormatInputDateTimeParsedPattern>({
		parse: (pattern: string) => HxFormatInputDateTimePatternParser.parse(pattern),
		is: (pattern): pattern is HxFormatInputDateTimeParsedPattern => pattern.type === 'datetime',
		create: (parsed) => new HxFormatInputDateTimePatternKit(parsed)
	});
}
