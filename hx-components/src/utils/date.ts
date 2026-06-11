import type {HxDateTimeRelatedFormat, HxParsedDateTimeFormat} from '../types';

export interface ParsedDataTime {
	year?: string;
	month?: string;
	day?: string;
	hour?: string;
	minute?: string;
	second?: string;
}

export class DateUtils {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	static parseFormat(format: HxDateTimeRelatedFormat): HxParsedDateTimeFormat {
		if (format == null || format.length === 0) {
			return {
				hasYear: false, hasMonth: false, hasDay: false, hasDate: false,
				hasHour: false, hasMinute: false, hasSecond: false, hasTime: false,
				sequence: []
			};
		}

		const parsed: HxParsedDateTimeFormat = {
			hasYear: false, hasMonth: false, hasDay: false, hasDate: false,
			hasHour: false, hasMinute: false, hasSecond: false, hasTime: false,
			sequence: []
		};
		for (const ch of format) {
			switch (ch) {
				case 'y': {
					parsed.hasYear = true;
					parsed.hasDate = true;
					parsed.sequence.push('y');
					break;
				}
				case 'm': {
					parsed.hasMonth = true;
					parsed.hasDate = true;
					parsed.sequence.push('m');
					break;
				}
				case 'd': {
					parsed.hasDay = true;
					parsed.hasDate = true;
					parsed.sequence.push('d');
					break;
				}
				case 'h': {
					parsed.hasHour = true;
					parsed.hasTime = true;
					parsed.sequence.push('h');
					break;
				}
				case 'n': {
					parsed.hasMinute = true;
					parsed.hasTime = true;
					parsed.sequence.push('n');
					break;
				}
				case 's': {
					parsed.hasSecond = true;
					parsed.hasTime = true;
					parsed.sequence.push('s');
					break;
				}
				default: {
					parsed.sequence.push(ch);
					break;
				}
			}
		}
		return parsed;
	}

	/**
	 * Parse a formatted date/time string into its numeric components according to the given format.
	 *
	 * Walks the value against {@link HxParsedDateTimeFormat.sequence}. Numeric components
	 * (y/m/d/h/n/s) are extracted as consecutive digits (year = up to 4, others = up to 2).
	 * Any non-digit characters between numeric components are skipped regardless of their
	 * content — separators in the format string are not validated.
	 *
	 * @param value - The formatted date/time string to parse, e.g. `"2026-06-11"` or `"14:30:00"`
	 * @param format - Parsed format descriptor produced by {@link parseFormat}, defining which
	 *                 components are present and their order
	 * @returns A {@link ParsedDataTime} object with the extracted numeric strings, or `false` if:
	 *          - `value` is `null`, `undefined`, or blank after trimming
	 *          - any expected numeric component is missing or empty at its position
	 *
	 * @example
	 * ```ts
	 * const fmt = DateUtils.parseFormat('y-m-d');
	 * DateUtils.parseValue('2026-06-11', fmt);
	 * // => { year: '2026', month: '06', day: '11' }
	 *
	 * DateUtils.parseValue('2026/06/11', fmt);
	 * // => { year: '2026', month: '06', day: '11' }
	 *
	 * DateUtils.parseValue('20260611', fmt);
	 * // => { year: '2026', month: '06', day: '11' }
	 * ```
	 */
	static parseValue(value: string | null | undefined, format: HxParsedDateTimeFormat): ParsedDataTime | false {
		if (value == null || value.trim().length === 0) {
			return false;
		}

		const parsed: ParsedDataTime = {};

		const gatherNumber = (str: string): [boolean, string] => {
			let count = 0;
			for (let idx = 0; idx < str.length; idx++) {
				const ch = str[idx];
				if (ch < '0' || ch > '9') {
					break;
				}
				count = idx + 1;
			}
			const digits = str.substring(0, count);
			return [digits.length !== 0, digits];
		};
		let indexOfValue = 0;
		for (const ch of format.sequence) {
			switch (ch) {
				case 'y': {
					const [has, digits] = gatherNumber(value.substring(indexOfValue, indexOfValue + 4));
					if (has) {
						parsed.year = digits;
						indexOfValue += digits.length;
						break;
					} else {
						return false;
					}
				}
				case 'm': {
					const [has, digits] = gatherNumber(value.substring(indexOfValue, indexOfValue + 2));
					if (has) {
						parsed.month = digits;
						indexOfValue += digits.length;
						break;
					} else {
						return false;
					}
				}
				case 'd': {
					const [has, digits] = gatherNumber(value.substring(indexOfValue, indexOfValue + 2));
					if (has) {
						parsed.day = digits;
						indexOfValue += digits.length;
						break;
					} else {
						return false;
					}
				}
				case 'h': {
					const [has, digits] = gatherNumber(value.substring(indexOfValue, indexOfValue + 2));
					if (has) {
						parsed.hour = digits;
						indexOfValue += digits.length;
						break;
					} else {
						return false;
					}
				}
				case 'n': {
					const [has, digits] = gatherNumber(value.substring(indexOfValue, indexOfValue + 2));
					if (has) {
						parsed.minute = digits;
						indexOfValue += digits.length;
						break;
					} else {
						return false;
					}
				}
				case 's': {
					const [has, digits] = gatherNumber(value.substring(indexOfValue, indexOfValue + 2));
					if (has) {
						parsed.second = digits;
						indexOfValue += digits.length;
						break;
					} else {
						return false;
					}
				}
				default: {
					let skipped = 0;
					while (indexOfValue + skipped < value.length) {
						const chOfValue = value[indexOfValue + skipped];
						if (chOfValue >= '0' && chOfValue <= '9') {
							break;
						}
						skipped += 1;
					}
					indexOfValue += skipped;
					break;
				}
			}
		}

		return parsed;
	}
}
