import {ERO} from '@hx/data';

export class StringUtils {
	static isEmpty(value?: string): boolean {
		return value == null || value.length === 0;
	}

	static isBlank(value?: string): boolean {
		return value == null || value.trim().length === 0;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static asStr(value?: any): string | null | undefined {
		value = ERO.revoke(value);
		return value == null ? value : value.toString();
	};

	/**
	 * check the given strings are same or not.
	 * - null, undefined and empty string are treated same.
	 */
	static isSameStr(s1: string | null | undefined, s2: string | null | undefined): boolean {
		s1 = ERO.revoke(s1);
		s2 = ERO.revoke(s2);
		if (s1 == null) {
			return s2 == null || s2.length === 0;
		} else if (s2 == null) {
			return s1.length === 0;
		} else {
			return s1 === s2;
		}
	}

	static stripWhitespace(value: string): string {
		const chars: Array<string> = [];
		for (const char of value) {
			if (char.trim().length !== 0) {
				chars.push(char);
			}
		}
		return chars.join('');
	}

	static hasNumericChar(value: string): boolean {
		for (const char of value) {
			if (char >= '0' && char <= '9') {
				return true;
			}
		}
		return false;
	}

	/**
	 * Normalize a raw numeric string into its canonical parts:
	 * - keep at most one minus sign at the start,
	 * - keep only the first decimal point,
	 * - require at least one digit (`0`–`9`) to be valid,
	 * - strip leading zeros from the integer part (all-zero → `'0'`),
	 * - strip trailing zeros from the fraction part,
	 * - collapse negative zero (`-0`) to `'0'`.
	 *
	 * Returns a tuple `[valid, normalized, integer, fraction]`:
	 * - `valid` — `true` when the string consists of an optional leading `-`,
	 *   digits `0`–`9`, at most one `.`, and at least one digit.
	 * - `normalized` — the canonical number string (integer defaults to `'0'`
	 *   when absent, e.g. `.5` → `0.5`).
	 * - `negative` - the canonical number is negative or not.
	 * - `integer` — the integer digits without sign or decimal point;
	 *   defaults to `0` when the integer part is empty.
	 * - `fraction` — the fractional digits with trailing zeros removed;
	 *   empty when there is no decimal point or the fraction is all zeros.
	 *
	 * When `valid` is `false`: `normalized` is the raw input, `negative` is false, `integer` and
	 * `fraction` are both empty strings.
	 */
	static normalizeToNumber(raw: string): [boolean, string, boolean, string, string] {
		const length = raw.length;
		if (length === 0) {
			return [false, '', false, '', ''];
		}
		let hasMinus = false;
		let hasDecimalPoint = false;
		const integerPart: Array<string> = [];
		const fractionPart: Array<string> = [];
		let index = 0;
		while (index < length) {
			const char = raw[index];
			const charCode = char.charCodeAt(0);
			switch (charCode) {
				// -
				case 45: {
					if (index === 0) {
						hasMinus = true;
						break;
					} else {
						return [false, raw, false, '', ''];
					}
				}
				// .
				case 46: {
					if (hasDecimalPoint) {
						return [false, raw, false, '', ''];
					} else {
						hasDecimalPoint = true;
						break;
					}
				}
				// 0 - 9
				case 48:
				case 49:
				case 50:
				case 51:
				case 52:
				case 53:
				case 54:
				case 55:
				case 56:
				case 57: {
					if (hasDecimalPoint) {
						fractionPart.push(char);
					} else {
						integerPart.push(char);
					}
					break;
				}
				default: {
					return [false, raw, false, '', ''];
				}
			}
			index += 1;
		}

		if (integerPart.length === 0 && fractionPart.length === 0) {
			return [false, raw, false, '', ''];
		}

		if (integerPart.length > 0) {
			const firstNotZeroIndex = integerPart.findIndex(ch => ch !== '0');
			if (firstNotZeroIndex !== -1) {
				integerPart.splice(0, firstNotZeroIndex);
			} else {
				// clear all
				integerPart.length = 0;
			}
		}
		const integer = integerPart.length === 0 ? '0' : integerPart.join('');
		if (fractionPart.length > 0) {
			let lastNotZeroIndex = -1;
			for (let idx = fractionPart.length - 1; idx >= 0; idx--) {
				if (fractionPart[idx] !== '0') {
					lastNotZeroIndex = idx;
					break;
				}
			}
			if (lastNotZeroIndex !== fractionPart.length - 1) {
				fractionPart.splice(lastNotZeroIndex + 1);
			}
		}
		const fraction = fractionPart.length === 0 ? '' : fractionPart.join('');
		if (hasDecimalPoint && fractionPart.length > 0) {
			return [true, (hasMinus ? '-' : '') + integer + '.' + fraction, hasMinus, integer, fraction];
		} else if (hasMinus && integer === '0') {
			return [true, integer, false, integer, fraction];
		} else {
			return [true, (hasMinus ? '-' : '') + integer, false, integer, fraction];
		}
	}

	static computeTextWidth(text: string, style: CSSStyleDeclaration) {
		const span = document.createElement('span');
		span.style.position = 'fixed';
		span.style.top = '-1000px';
		span.style.left = '100vw';
		span.style.visibility = 'hidden';
		span.style.whiteSpace = 'nowrap';
		Object.keys(style).forEach((key: string) => {
			if (key.startsWith('font') || key === 'textTransform') {
				// @ts-expect-error ignore check
				span.style[key] = style[key];
			}
		});
		span.textContent = text;
		document.body.appendChild(span);
		const width = span.offsetWidth;
		document.body.removeChild(span);
		return width;
	}

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}
}

export class StringChange {
	/** Common unchanged text before the change (empty for replace-all) */
	readonly prefix: string;
	/** Common unchanged text after the change (empty for replace-all) */
	readonly suffix: string;
	/** Characters removed from oldValue at the change point */
	readonly deleted: string;
	/** Characters added to newValue at the change point */
	readonly inserted: string;
	/** Start position of the change in both oldValue and newValue (shared prefix length) */
	readonly start: number;
	/** End position (exclusive) of the deleted portion in oldValue */
	readonly endOfOld: number;
	/** End position (exclusive) of the inserted portion in newValue */
	readonly endOfNew: number;
	/**
	 * The kind of change detected:
	 * - `none`         — no change, old and new values are identical
	 * - `insert`       — new characters added, nothing removed
	 * - `delete`       — characters removed, nothing added
	 * - `replace-part` — characters removed and added, with shared context before/after
	 * - `replace-all`  — entire value replaced, no shared prefix or suffix
	 */
	readonly type: 'none' | 'insert' | 'delete' | 'replace-part' | 'replace-all';

	private constructor(fields: {
		prefix: string; suffix: string;
		deleted: string; inserted: string;
		start: number; endOfOld: number; endOfNew: number;
		type: 'none' | 'insert' | 'delete' | 'replace-part' | 'replace-all';
	}) {
		({
			prefix: this.prefix, suffix: this.suffix,
			deleted: this.deleted, inserted: this.inserted,
			start: this.start, endOfOld: this.endOfOld, endOfNew: this.endOfNew,
			type: this.type
		} = fields);
	}

	// noinspection JSUnusedGlobalSymbols
	isNoChange(): boolean {
		return this.type === 'none';
	}

	// noinspection JSUnusedGlobalSymbols
	isInsert(): boolean {
		return this.type === 'insert';
	}

	// noinspection JSUnusedGlobalSymbols
	isDelete(): boolean {
		return this.type === 'delete';
	}

	// noinspection JSUnusedGlobalSymbols
	isReplacePart(): boolean {
		return this.type === 'replace-part';
	}

	// noinspection JSUnusedGlobalSymbols
	isReplaceAll(): boolean {
		return this.type === 'replace-all';
	}

	/**
	 * Detect the single contiguous change between old and new value
	 * caused by an input operation (type, delete, paste, or replace selection).
	 *
	 * The `type` field on the result is auto-computed:
	 * - `none`        — `deleted` and `inserted` are both empty
	 * - `insert`      — `deleted` is empty, `inserted` is not
	 * - `delete`      — `inserted` is empty, `deleted` is not
	 * - `replace-part` — both non-empty with shared prefix or suffix
	 * - `replace-all` — both non-empty, no shared context (Ctrl+A overwrite)
	 *
	 * Paste is just a multi-character insert (or replace if there is a selection),
	 * so it fits naturally into the same categories.
	 */
	static of(oldValue: string, newValue: string): StringChange {
		if (oldValue === newValue) {
			return new StringChange({
				prefix: oldValue, suffix: '', deleted: '', inserted: '',
				start: oldValue.length, endOfOld: oldValue.length, endOfNew: newValue.length,
				type: 'none'
			});
		}

		// 1. Scan from the start to find the common prefix
		//    Everything before this point is identical in both strings.
		const maxPrefixLen = Math.min(oldValue.length, newValue.length);
		let prefixLen = 0;
		while (prefixLen < maxPrefixLen && oldValue[prefixLen] === newValue[prefixLen]) {
			prefixLen++;
		}

		// 2. Scan from the end to find the common suffix
		//    Everything after this point (from the tail) is identical in both strings.
		//    Only scan within the remaining range (after prefix removal).
		const oldTail = oldValue.length - prefixLen;
		const newTail = newValue.length - prefixLen;
		const maxSuffixLen = Math.min(oldTail, newTail);
		let suffixLen = 0;
		while (
			suffixLen < maxSuffixLen
			&& oldValue[oldValue.length - 1 - suffixLen] === newValue[newValue.length - 1 - suffixLen]
			) {
			suffixLen++;
		}

		// 3. The middle portion between prefix and suffix is the changed part
		//    - deleted: what was in oldValue but is no longer present
		//    - inserted: what is in newValue that wasn't there before
		const prefix = oldValue.slice(0, prefixLen);
		const suffix = oldValue.slice(oldValue.length - suffixLen);
		const deleted = oldValue.slice(prefixLen, oldValue.length - suffixLen);
		const inserted = newValue.slice(prefixLen, newValue.length - suffixLen);

		// 4. Determine the change type from deleted / inserted / shared context
		let type: 'none' | 'insert' | 'delete' | 'replace-part' | 'replace-all';
		if (deleted === '') {
			type = 'insert';
		} else if (inserted === '') {
			type = 'delete';
		} else if (prefix === '' && suffix === '') {
			type = 'replace-all';
		} else {
			type = 'replace-part';
		}

		return new StringChange({
			prefix, suffix, deleted, inserted,
			start: prefixLen,
			endOfOld: oldValue.length - suffixLen,
			endOfNew: newValue.length - suffixLen,
			type
		});
	}
}
