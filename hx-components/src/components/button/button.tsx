import type {ReactiveObject} from '@hx/data';
// @ts-ignore
import React, {
	type ButtonHTMLAttributes,
	type ForwardedRef,
	forwardRef,
	type MouseEventHandler,
	type ReactElement,
	type RefAttributes
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useForceUpdate} from '../../hooks';
import type {EditSingleFieldProps} from '../../types';
import type {HxColor, HxHtmlElementProps, HxOmittedAttributes} from '../types';
import {unwrapToReactEvents} from '../utils.ts';
import {HxButtonDefaults} from './defaults';

export type HxButtonColor = HxColor;
export type HxButtonVarious = 'solid' | 'soft' | 'surface' | 'outline' | 'ghost';

export interface HxExtButtonProps<T extends object> extends EditSingleFieldProps<T> {
	color?: HxButtonColor;
	various?: HxButtonVarious;
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
			onClick, ...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);
		const forceUpdate = useForceUpdate();

		const onButtonClick: MouseEventHandler<HTMLButtonElement> = (ev) => {
			// TODO
			onClick?.(ev, $model, context, forceUpdate);
		};

		const restProps = unwrapToReactEvents(rest, $model, context, forceUpdate);

		return <button {...restProps}
		               type="button"
		               onClick={onButtonClick}
		               data-hx-button
		               data-hx-visible={visible ?? true}
		               data-hx-disabled={disabled ?? false}
		               data-hx-color={color}
		               data-hx-various={various}
		               ref={ref}/>;
	}) as unknown as HxButtonType;