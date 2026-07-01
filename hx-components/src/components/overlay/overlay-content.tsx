// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {DOMUtils} from '../../utils';
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
		role, width, maxHeight,
		children,
		...rest
	} = props;

	const ref = useRef<HTMLDivElement | null>(null);

	// focus the first focusable element
	useEffect(() => {
		const el = ref.current?.querySelector('[data-hx-first-element]') as HTMLElement ?? ref.current;
		if (el != null) {
			DOMUtils.focusElement(el);
		}
	}, []);

	return <div {...rest}
	            data-hx-overlay="" role={role}
	            data-hx-width={width} data-hx-max-height={maxHeight}
	            ref={ref}>
		{/* Automatically pass $model to all child components for data binding */}
		{DOMUtils.interposeToChildren({$model}, children)}
	</div>;
};
