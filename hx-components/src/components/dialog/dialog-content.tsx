// @ts-expect-error import React
import React, {useRef} from 'react';
import {interposeToChildren} from '../../utils';
import type {HxDialogContentProps} from './types';

/**
 * Dialog content container component
 * Renders the main dialog content wrapper with proper ARIA role for accessibility
 * Automatically propagates the reactive model to all child components
 * @param props - Dialog content properties
 */
export const HxDialogContent = <T extends object>(props: HxDialogContentProps<T>) => {
	const {
		$model,
		width, maxHeight,
		children,
		...rest
	} = props;

	const ref = useRef<HTMLDivElement | null>(null);
	// TODO focus the first focusable element, control tab and shift+tab, handle escape key

	return <div {...rest}
	            data-hx-dialog="" role="dialog"
	            data-hx-width={width} data-hx-max-height={maxHeight}
	            ref={ref}>
		{/* Automatically pass $model to all child components for data binding */}
		{interposeToChildren({$model}, children)}
	</div>;
};
