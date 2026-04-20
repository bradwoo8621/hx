// @ts-expect-error import React
import React, {useRef} from 'react';
import {interposeToChildren} from '../../utils';
import type {HxDialogPortalProps} from './types';

/**
 * Props interface for dialog content component
 * Omits internal portal-specific properties from base dialog props
 */
export type HxDialogContentProps<T extends object> = Omit<HxDialogPortalProps<T>, '$overlayHandle' | 'zIndex'>;

/**
 * Dialog content container component
 * Renders the main dialog content wrapper with proper ARIA role for accessibility
 * Automatically propagates the reactive model to all child components
 * @param props - Dialog content properties
 */
export const HxDialogContent = <T extends object>(props: HxDialogContentProps<T>) => {
	const {
		$model, children,
		...rest
	} = props;

	const ref = useRef<HTMLDivElement | null>(null);

	return <div {...rest} data-hx-dialog="" role="dialog" ref={ref}>
		{/* Automatically pass $model to all child components for data binding */}
		{interposeToChildren({$model}, children)}
	</div>;
};
