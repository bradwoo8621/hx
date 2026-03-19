/**
 * check the given strings are same or not.
 * - null, undefined and empty string are treated same.
 */
export const isSameStr = (s1: string | null | undefined, s2: string | null | undefined): boolean => {
	if (s1 == null) {
		return s2 == null || s2.length === 0;
	} else if (s2 == null) {
		return s1.length === 0;
	} else {
		return s1 === s2;
	}
};
