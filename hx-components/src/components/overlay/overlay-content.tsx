// @ts-expect-error import React
import React, {useRef} from 'react';
import {interposeToChildren} from '../../utils';
import type {HxOverlayContentProps} from './types';

/**
 * Overlay content container component
 * Renders the main overlay content wrapper with proper ARIA role for accessibility
 * Automatically propagates the reactive model to all child components
 * @param props - Overlay content properties
 */
export const HxOverlayContent = <T extends object>(props: HxOverlayContentProps<T>) => {
	const {
		$model,
		role = 'overlay', width, maxHeight,
		children,
		...rest
	} = props;

	const ref = useRef<HTMLDivElement | null>(null);
	// TODO focus the first focusable element, control tab and shift+tab, handle escape key

	return <div {...rest}
	            data-hx-overlay="" role={role}
	            data-hx-width={width} data-hx-max-height={maxHeight}
	            ref={ref}>
		{/* Automatically pass $model to all child components for data binding */}
		{interposeToChildren({$model}, children)}
	</div>;
};
