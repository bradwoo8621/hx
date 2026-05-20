// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const asStr = (value?: any): string | null | undefined => {
	return value == null ? value : value.toString();
};

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

export const computeTextWidth = (text: string, style: CSSStyleDeclaration) => {
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
};