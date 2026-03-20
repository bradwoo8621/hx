import type {ModelPath} from '@hx/data';
// @ts-expect-error React import is provided by the framework
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type PropsWithoutRef,
	type  ReactElement,
	type  RefAttributes
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useForceUpdate} from '../../hooks';
import type {
	ComponentDataProps,
	HxBorderRadius,
	HxDirection,
	HxGap,
	HxHtmlElementProps,
	HxOmittedAttributes,
	HxPadding,
	StdProps
} from '../../types';
import {safeToDom, wrapToReactEvents} from '../../utils';
import {HxFlexDefaults} from './defaults.ts';

export type HxFlexDirection = HxDirection;
export type HxFlexBorderRadius = HxBorderRadius;
export type HxFlexGapX = HxGap;
export type HxFlexGapY = HxGap;
export type HxFlexPaddingX = HxPadding;
export type HxFlexPaddingT = HxPadding;
export type HxFlexPaddingB = HxPadding;

export interface HxExtFlexProps<T extends object>
	extends StdProps<T>, ComponentDataProps<T> {
	direction?: HxFlexDirection;
	border?: boolean;
	borderRadius?: HxFlexBorderRadius;
	gapX?: HxFlexGapX;
	gapY?: HxFlexGapY;
	paddingX?: HxFlexPaddingX;
	paddingT?: HxFlexPaddingT;
	paddingB?: HxFlexPaddingB;
	$field?: ModelPath<T>;
}

export type OmittedFlexHTMLProps = HxOmittedAttributes;

export type HxFlexProps<T extends object> = PropsWithoutRef<
	& HxExtFlexProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedFlexHTMLProps, T>
>;

export type HxFlexType = <T extends object>(
	props: HxFlexProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

export const HxFlex =
	forwardRef(<T extends object>(props: HxFlexProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			direction = HxFlexDefaults.direction,
			border = HxFlexDefaults.border, borderRadius = HxFlexDefaults.borderRadius,
			gapX = HxFlexDefaults.gapX, gapY = HxFlexDefaults.gapY,
			paddingX = HxFlexDefaults.paddingX,
			paddingT = HxFlexDefaults.paddingT, paddingB = HxFlexDefaults.paddingB,
			children,
			...rest
		} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);
		const forceUpdate = useForceUpdate();

		const restProps = safeToDom(wrapToReactEvents(rest, $model, context, forceUpdate));

		return <div {...restProps}
		            data-hx-flex=""
		            data-hx-flex-direction={direction} data-hx-flex-border={border}
		            data-hx-flex-gap-x={gapX} data-hx-flex-gap-y={gapY}
		            data-hx-flex-padding-x={paddingX}
		            data-hx-flex-padding-t={paddingT} data-hx-flex-padding-b={paddingB}
		            data-hx-visible={visible ?? true}
		            ref={ref}>
			{children}
		</div>;
	}) as unknown as HxFlexType;