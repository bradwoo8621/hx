import {type ReactNode} from 'react';
import type {HxFlexProps} from '../flex';

export type HxCalloutKind = 'info' | 'success' | 'question' | 'warn' | 'error';

export type ExcludedCalloutDataAttrNames =
	| 'data-hx-callout'
	| 'data-hx-flex-direction' | 'data-hx-flex-wrap'
	| 'data-hx-callout-background'
	| 'data-hx-callout-content' | 'data-hx-callout-icon';

export interface HxCalloutProps<T extends object>
	extends Omit<HxFlexProps<T>, ExcludedCalloutDataAttrNames | 'direction' | 'wrap' | 'children'> {
	/**
	 * Preset look of the callout: `'info'`, `'success'`, `'question'`, `'warn'` or `'error'` picks the
	 * matching icon and color. A React element is used as the icon as is, without applying a color;
	 * any other value falls back to the `'error'` look.
	 */
	kind: HxCalloutKind | ReactNode;
	/** Content shown next to the icon */
	message: ReactNode;
}
