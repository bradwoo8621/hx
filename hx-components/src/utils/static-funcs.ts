export const noop = () => {
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isEmpty = (value: any, trim: boolean): boolean => {
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
};
