import type {HxContext} from '../../contexts';
import {HxConsole} from '../../utils';
import {HxFormatInputNumberPatternKit} from './format-input-number-kit';
import type {HxFormatInputParsedPattern, HxFormatInputPattern, HxFormatInputPatternKit} from './types';

export interface HxFormatInputPatternKitBuilder {
	build(pattern: HxFormatInputPattern): HxFormatInputPatternKit | false;
}

export class HxFormatInputPatternKits implements HxFormatInputPatternKit {
	private static KITS: Array<HxFormatInputPatternKitBuilder> = [
		HxFormatInputNumberPatternKit
	];
	private readonly _inner: HxFormatInputPatternKit;

	private constructor(inner: HxFormatInputPatternKit) {
		this._inner = inner;
	}

	getPattern(): HxFormatInputParsedPattern {
		return this._inner.getPattern();
	}

	correct(oldValue: string, newValue: string, isBackspace: boolean, context: HxContext): [string, number] {
		return this._inner.correct(oldValue, newValue, isBackspace, context);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toModel(value: string | null | undefined, context: HxContext): any | null | undefined {
		return this._inner.toModel(value, context);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fromModel(value: any | null | undefined, context: HxContext): string | null | undefined {
		return this._inner.fromModel(value, context);
	}

	static register(builder: HxFormatInputPatternKitBuilder, ...more: Array<HxFormatInputPatternKitBuilder>): void {
		HxFormatInputPatternKits.KITS.push(builder, ...more);
	}

	static build(pattern?: HxFormatInputPattern): HxFormatInputPatternKits | false {
		if (pattern == null) {
			return false;
		}

		for (const kit of HxFormatInputPatternKits.KITS) {
			const built = kit.build(pattern);
			if (built !== false) {
				return new HxFormatInputPatternKits(built);
			}
		}

		HxConsole.error('Undetermined format input pattern, will downgrade to HxInput.', pattern);
		return false;
	}
}
