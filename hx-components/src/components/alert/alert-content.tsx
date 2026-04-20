// @ts-expect-error import React
import React, {useRef} from 'react';
import {interposeToChildren} from '../../utils';
import type {HxAlertContentProps} from './types';

/**
 * Alert content container component
 * Renders the main alert content wrapper with proper ARIA role for accessibility
 * Automatically propagates the reactive model to all child components
 * @param props - Alert content properties
 */
export const HxAlertContent = <T extends object>(props: HxAlertContentProps<T>) => {
	const {
		$model,
		width,
		children,
		...rest
	} = props;

	const ref = useRef<HTMLDivElement | null>(null);
	// TODO focus the first focusable element, control tab and shift+tab, handle escape key

	return <div {...rest}
	            data-hx-alert="" role="alert"
	            data-hx-width={width}
	            ref={ref}>
		{/* Automatically pass $model to all child components for data binding */}
		{interposeToChildren({$model}, children)}
	</div>;
};
