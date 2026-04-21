import type {IconProps, SvgIconDataAttributeKey, SvgIconDefaultProps} from './types';

export const computeSvgIconDefaults = (props: IconProps): SvgIconDefaultProps => {
	const dataAttrs = Object.keys(props).reduce((acc, key) => {
		if (key.startsWith('data-hx-')) {
			// @ts-expect-error ignore check
			acc[key] = props[key];
		} else {
			switch (key) {
				case 'marginT': {
					// @ts-expect-error ignore check
					acc['data-hx-margin-t'] = props[key];
					break;
				}
				case 'marginR': {
					// @ts-expect-error ignore check
					acc['data-hx-margin-r'] = props[key];
					break;
				}
				case 'marginB': {
					// @ts-expect-error ignore check
					acc['data-hx-margin-b'] = props[key];
					break;
				}
				case 'marginL': {
					// @ts-expect-error ignore check
					acc['data-hx-margin-l'] = props[key];
					break;
				}
				default: {
					// do nothing
				}
			}
		}
		return acc;
	}, {} as Record<SvgIconDataAttributeKey, string | bigint | number | boolean>);

	return {
		width: 15,
		height: 15,
		viewBox: `0 0 15 15`,
		fill: 'none',
		xmlns: 'http://www.w3.org/2000/svg',
		'data-hx-svg-icon': '',
		style: props.style,
		...dataAttrs
	};
};
