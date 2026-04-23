// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type HTMLAttributes, type ReactElement, type RefAttributes} from 'react';
import type {HxHtmlElementProps} from '../../types';
import {type HxExtLabelProps, HxLabel, type HxLabelBorderRadius, type OmittedLabelHTMLProps} from '../label';
import {HxBadgeDefaults} from './defaults.ts';

export type HxBadgeVariant = 'solid' | 'outline' | 'dashed';
export type HxBadgeSize = 'sm' | 'std';
export type HxBadgeBorderRadius = HxLabelBorderRadius | 'round'

export type HxExtBadgeProps<T extends object> =
	& Omit<HxExtLabelProps<T>, 'opaque' | 'borderRadius' | 'paddingX'>
	& {
	/** Badge variant style */
	variant?: HxBadgeVariant;
	/** Badge size */
	size?: HxBadgeSize;
	/** Badge border radius */
	borderRadius?: HxBadgeBorderRadius;
};

export type HxBadgeProps<T extends object> =
	& HxExtBadgeProps<T>
	& HxHtmlElementProps<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>, OmittedLabelHTMLProps, T>

export type HxBadgeType = <T extends object>(
	props: HxBadgeProps<T> & RefAttributes<HTMLSpanElement>
) => ReactElement | null;

/**
 * HxBadge Component
 * Badge component for displaying status indicators, tags, counts and other annotations
 * Built on top of HxLabel for consistent text rendering and reactive capabilities
 */
export const HxBadge =
	forwardRef(<T extends object>(props: HxBadgeProps<T>, ref: ForwardedRef<HTMLSpanElement>) => {
		const {
			variant = HxBadgeDefaults.variant, size = HxBadgeDefaults.size, borderRadius = HxBadgeDefaults.borderRadius,
			color = 'primary',
			...rest
		} = props;

		return <HxLabel {...rest}
		                opaque={variant === 'solid'} color={color}
		                borderRadius={borderRadius !== 'round' ? borderRadius : (void 0)}
		                paddingX="md"
		                data-hx-badge=""
		                data-hx-badge-variant={variant}
		                data-hx-badge-size={size}
		                data-hx-badge-border-radius={borderRadius === 'round' ? 'round' : (void 0)}
		                ref={ref}/>;
	}) as unknown as HxBadgeType;
// @ts-expect-error assign component name
HxBadge.displayName = 'HxBadge';
