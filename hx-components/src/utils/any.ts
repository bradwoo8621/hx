export class AnyUtils {
	static readonly noop = () => {
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static isEmpty(value: any, trim: boolean): boolean {
		if (value == null) {
			return true;
		} else if (typeof value === 'string') {
			if (trim) {
				return value.trim().length === 0;
			} else {
				return value.length === 0;
			}
		} else {
			return false;
		}
	}

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}
}
