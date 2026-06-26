import type {HxContext} from '../../contexts';
import {HxConsole} from '../../utils';
import {HxFormatInputDateTimePatternKit} from './format-input-datetime-kit';
import {HxFormatInputNumberPatternKit} from './format-input-number-kit';
import type {
	HxFormatInputChange,
	HxFormatInputDispatcherProps,
	HxFormatInputPatternKit,
	HxFormatInputPatternKits
} from './types';

/**
 * Build a pattern kit from dispatch props.
 *
 * Each built-in kit (number, datetime) implements this interface as a
 * static factory. The returned tuple separates the kit instance from
 * the remaining props — the full dispatch props with {@code pattern}
 * and all pattern-related properties stripped, leaving only the
 * generic input attributes to be forwarded.
 *
 * @returns a tuple of {@code [kit, remainingProps]} on success, or
 *          {@code false} when the dispatched pattern does not match
 *          this kit type.
 */
export interface HxFormatInputPatternKitBuilder {
	build<T extends object>(props: HxFormatInputDispatcherProps<T>): [HxFormatInputPatternKit, Omit<HxFormatInputDispatcherProps<T>, 'pattern'>] | false;
}

export class HxFormatInputPatternKitsInner implements HxFormatInputPatternKits {
	private static KITS: Array<HxFormatInputPatternKitBuilder> = [
		HxFormatInputNumberPatternKit,
		HxFormatInputDateTimePatternKit
	];
	private readonly _inner: HxFormatInputPatternKit;
	private _lambdaOfToModel: HxFormatInputPatternKit['toModel'] | undefined = (void 0);
	private _lambdaOfFromModel: HxFormatInputPatternKit['fromModel'] | undefined = (void 0);

	private constructor(inner: HxFormatInputPatternKit) {
		this._inner = inner;
	}

	correct(change: HxFormatInputChange, context: HxContext): [string, number] {
		return this._inner.correct(change, context);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toModel(value: string | null | undefined, context: HxContext): any | null | undefined {
		return this._inner.toModel(value, context);
	}

	lambdaOfToModel(): HxFormatInputPatternKits['toModel'] {
		if (this._lambdaOfToModel != null) {
			return this._lambdaOfToModel;
		}

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		this._lambdaOfToModel = (...args) => that.toModel(...args);
		return this._lambdaOfToModel;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fromModel(value: any | null | undefined, context: HxContext): string | null | undefined {
		return this._inner.fromModel(value, context);
	}

	lambdaOfFromModel(): HxFormatInputPatternKits['fromModel'] {
		if (this._lambdaOfFromModel != null) {
			return this._lambdaOfFromModel;
		}

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		this._lambdaOfFromModel = (...args) => that.fromModel(...args);
		return this._lambdaOfFromModel;
	}

	// noinspection JSUnusedGlobalSymbols
	static register(builder: HxFormatInputPatternKitBuilder, ...more: Array<HxFormatInputPatternKitBuilder>): void {
		HxFormatInputPatternKitsInner.KITS.push(builder, ...more);
	}

	static build<T extends object>(props?: HxFormatInputDispatcherProps<T>): [HxFormatInputPatternKits, Omit<HxFormatInputDispatcherProps<T>, 'pattern'>] | false {
		if (props == null) {
			return false;
		}

		for (const kit of HxFormatInputPatternKitsInner.KITS) {
			const built = kit.build(props);
			if (built !== false) {
				return [new HxFormatInputPatternKitsInner(built[0]), built[1]];
			}
		}

		HxConsole.error('Undetermined format input pattern, will downgrade to HxInput.', props);
		return false;
	}
}
