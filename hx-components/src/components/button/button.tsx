import {ERO, type ModelPath, type ReactiveObject} from '@hx/data';
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
import {HxI18NLabel} from '../i18n-label';
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

export type HxButtonType = <T extends ReactiveObject & object>(
	props: HxButtonProps<T> & RefAttributes<HTMLButtonElement>
) => ReactElement | null;

export const HxButton =
	forwardRef(<T extends ReactiveObject & object>(props: HxButtonProps<T>, ref: ForwardedRef<HTMLButtonElement>) => {
		const {
			$model, $field,
			color = HxButtonDefaults.color, various = HxButtonDefaults.various,
			uppercase = HxButtonDefaults.uppercase, text,
			children, ...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);
		const forceUpdate = useForceUpdate();

		let buttonText = text;
		let textUppercase = uppercase;
		if ($field != null && $field.length !== 0) {
			// ignore the text and uppercase
			textUppercase = false;
			buttonText = ERO.getValue($model, $field);
		}
		if (buttonText != null) {
			if (typeof buttonText === 'string') {
				buttonText = <HxI18NLabel label={buttonText}/>;
			} else {
				// ignore the uppercase if text is not string
				textUppercase = false;
			}
		}

		const restProps = unwrapToReactEvents(rest, $model, context, forceUpdate);

		return <button {...restProps}
		               type="button"
		               data-hx-button=""
		               data-hx-visible={visible ?? true}
		               data-hx-disabled={disabled ?? false} disabled={disabled ?? false}
		               data-hx-color={color}
		               data-hx-various={various}
		               data-hx-uppercase={textUppercase}
		               ref={ref}>
			{buttonText}
			{children}
		</button>;
	});