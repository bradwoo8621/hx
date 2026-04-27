// @ts-expect-error import React
import React from 'react';
import type {IconProps} from './types';
import {computeSvgIconDefaults} from './utils';

export const TriangleUp = (props: IconProps) => {
	const defaultProps = computeSvgIconDefaults(props);

	return <svg {...defaultProps} data-hx-svg-icon-name="triangle-up">;
		<path d="M4 9H11L7.5 4.5L4 9Z" fill="currentColor"/>
	</svg>;
};
