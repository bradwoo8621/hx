// @ts-expect-error import React
import React from 'react';
import type {IconProps} from './types';
import {computeSvgIconDefaults} from './utils';

export const TriangleDown = (props: IconProps) => {
	const defaultProps = computeSvgIconDefaults(props);

	return <svg {...defaultProps} data-hx-svg-icon-name="triangle-down">
		<path d="M4 6H11L7.5 10.5L4 6Z" fill="currentColor"/>
	</svg>;
};
