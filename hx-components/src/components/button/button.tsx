import type {ModelPath, ReactiveObject} from '@hx/data';
// @ts-ignore
import React, {
	type ButtonHTMLAttributes,
	type ForwardedRef,
	forwardRef,
	type ReactElement,
	type ReactNode,
	type RefAttributes
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useForceUpdate} from '../../hooks';
import type {ComponentDataProps, DisabledProps, StdProps} from '../../types';
import type {HxColor, HxHtmlElementProps, HxOmittedAttributes} from '../types';
import {unwrapToReactEvents} from '../utils';
import {HxButtonDefaults} from './defaults';

export type HxButtonColor = HxColor;
export type HxButtonVarious = 'solid' | 'outline' | 'ghost';

export interface HxExtButtonProps<T extends object>
	extends StdProps<T>, DisabledProps<ReactiveObject & T>, ComponentDataProps<ReactiveObject & T> {
	color?: HxButtonColor;
	various?: HxButtonVarious;
	/* ignored when "$field" passed */
	uppercase?: boolean;
	/* use as button text, ignored when "$field" passed */
	text?: ReactNode;
	/* use value as button text */
	$field?: ModelPath<T>;
}

export type OmittedButtonHTMLProps =
	| HxOmittedAttributes
	| 'color';

export type HxButtonProps<T extends object> =
	HxExtButtonProps<T>
	& HxHtmlElementProps<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>, OmittedButtonHTMLProps, T>;

type HxButtonType = <T extends ReactiveObject & object>(
	props: HxButtonProps<T> & RefAttributes<HTMLButtonElement>
) => ReactElement | null;

export const HxButton =
	forwardRef(<T extends ReactiveObject & object>(props: HxButtonProps<T>, ref: ForwardedRef<HTMLButtonElement>) => {
		const {
			$model, $field,
			color = HxButtonDefaults.color, various = HxButtonDefaults.various,
			uppercase = true, text,
			children, ...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);
		const forceUpdate = useForceUpdate();

		const restProps = unwrapToReactEvents(rest, $model, context, forceUpdate);

		return <button {...restProps}
		               type="button"
		               data-hx-button
		               data-hx-visible={visible ?? true}
		               data-hx-disabled={disabled ?? false} disabled={disabled ?? false}
		               data-hx-color={color}
		               data-hx-various={various}
		               ref={ref}>
			{children}
		</button>;
	}) as unknown as HxButtonType;