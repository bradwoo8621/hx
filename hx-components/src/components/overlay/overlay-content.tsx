// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {usePropsToDomExpose} from '../../hooks';
import {DOMUtils, HxDataPropToAttrValueComputer} from '../../utils';
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
		role, width, maxHeight, autoGrabFocus = true,
		children,
		...rest
	} = props;

	const context = useHxContext();
	const ref = useRef<HTMLDivElement | null>(null);

	// focus the first focusable element
	useEffect(() => {
		if (!autoGrabFocus) {
			// ignore focus force grabbing for toast
			return;
		}
		const el = ref.current?.querySelector(':scope [data-hx-first-element]') as HTMLElement ?? ref.current;
		if (el != null) {
			const focused = DOMUtils.focusElement(el);
			if (!focused) {
				ref.current?.focus();
			}
		}
	}, [autoGrabFocus]);

	const restProps = usePropsToDomExpose(rest, $model, context, {
		key: 'HxOverlayContent', default: {width, maxHeight}
	});

	return <div {...restProps}
	            data-hx-overlay="" role={role} tabIndex={autoGrabFocus ? -1 : (void 0)}
	            ref={ref}>
		{/* Automatically pass $model to all child components for data binding */}
		{DOMUtils.interposeToChildren({$model}, children)}
	</div>;
};

HxDataPropToAttrValueComputer.create('HxOverlayContent').register();
