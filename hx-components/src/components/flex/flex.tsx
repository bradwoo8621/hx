// @ts-expect-error React import is provided by the framework
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type PropsWithoutRef,
	type  ReactElement,
	type  RefAttributes
} from 'react';
import type {ComponentDataProps, DisabledProps, HxHtmlElementProps, HxOmittedAttributes, StdProps} from '../../types';

export interface HxExtFlexProps<T extends object>
	extends StdProps<T>, DisabledProps<T>, ComponentDataProps<T> {
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
		const {} = props;

		return <div ref={ref}>

		</div>;
	}) as unknown as HxFlexType;