// @ts-expect-error import React
import React from 'react';
import type {IconProps} from './types';
import {computeSvgIconDefaults} from './utils';

export const TriangleRight = (props: IconProps) => {
	const defaultProps = computeSvgIconDefaults(props);

	return <svg {...defaultProps} data-hx-svg-icon-name="triangle-right">
		<path d="M6 11L6 4L10.5 7.5L6 11Z" fill="currentColor"/>
	</svg>;
};
