import {type HTMLAttributes} from 'react';
import type {HxBorderRadius, HxHtmlElementProps} from '../../types';
import type {HxExtLabelProps, OmittedLabelHTMLProps} from '../label';

export type HxBadgeVariant = 'solid' | 'outline' | 'dashed';
export type HxBadgeSize = 'sm' | 'std';
export type HxBadgeBorderRadius = HxBorderRadius | 'round'

export type ExcludedBadgeDataAttrNames =
	| 'data-hx-badge'
	| 'data-hx-label-opaque';

export type HxExtBadgeProps<T extends object> =
	& Omit<HxExtLabelProps<T>, ExcludedBadgeDataAttrNames | 'opaque' | 'borderRadius'>
	& {
	/** Badge variant style */
	variant?: HxBadgeVariant;
	/** Badge size */
	size?: HxBadgeSize;
	/** Badge border radius */
	borderRadius?: HxBadgeBorderRadius;
};

export type OmittedBadgeHTMLProps = OmittedLabelHTMLProps;

export type HxBadgeProps<T extends object> =
	& HxExtBadgeProps<T>
	& HxHtmlElementProps<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>, OmittedBadgeHTMLProps, T>
