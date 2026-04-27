// @ts-expect-error import React
import React from 'react';
import type {IconProps} from './types';
import {computeSvgIconDefaults} from './utils';

export const TriangleLeft = (props: IconProps) => {
	const defaultProps = computeSvgIconDefaults(props);

	return <svg {...defaultProps} data-hx-svg-icon-name="triangle-left">;
		<path d="M9 4L9 11L4.5 7.5L9 4Z" fill="currentColor"/>
	</svg>;
};
