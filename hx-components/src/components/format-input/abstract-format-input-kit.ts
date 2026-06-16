import type {HxContext} from '../../contexts';
import type {HxFormatInputChange, HxFormatInputPatternKit} from './types.ts';

export abstract class AbstractHxFormatInputPatternKit implements HxFormatInputPatternKit {
	protected abstract correctDelete(change: HxFormatInputChange, context: HxContext): [string, number];

	protected abstract correctInsert(change: HxFormatInputChange, context: HxContext): [string, number];

	protected abstract correctReplacePart(change: HxFormatInputChange, context: HxContext): [string, number];

	protected abstract correctReplaceAll(change: HxFormatInputChange, context: HxContext): [string, number];

	correct(change: HxFormatInputChange, context: HxContext): [string, number] {
		switch (change.type) {
			case 'delete': {
				return this.correctDelete(change, context);
			}
			case 'insert': {
				return this.correctInsert(change, context);
			}
			case 'replace-part': {
				return this.correctReplacePart(change, context);
			}
			case 'replace-all': {
				return this.correctReplaceAll(change, context);
			}
			case 'none':
			default: {
				return [change.newValue, -1];
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	abstract fromModel(value: any, context: HxContext): string | null | undefined;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	abstract toModel(value: string | null | undefined, context: HxContext): any;
}
