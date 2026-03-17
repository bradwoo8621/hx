import {ERO, type ModelPath} from '@hx/data';
// @ts-ignore
import React, {
	type ButtonHTMLAttributes,
	type ForwardedRef,
	forwardRef,
	type PropsWithoutRef,
	type ReactElement,
	type ReactNode,
	type RefAttributes
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useForceUpdate} from '../../hooks';
import type {CheckProps, ComponentDataProps, DisabledProps, StdProps} from '../../types';
import {HxLabel} from '../label';
import type {HxColor, HxHtmlElementProps, HxOmittedAttributes} from '../types';
import {safeToDom, wrapToReactEvents} from '../utils';
import {HxWithCheck} from '../with-check';
import {HxButtonDefaults} from './defaults';

export type HxButtonColor = HxColor;
export type HxButtonVarious = 'solid' | 'outline' | 'ghost';

export interface HxExtButtonProps<T extends object>
	extends StdProps<T>, DisabledProps<T>, ComponentDataProps<T> {
	color?: HxButtonColor;
	various?: HxButtonVarious;
	/* apply uppercase transform or not, ignored when "$field" passed */
	uppercase?: boolean;
	/** allow value from model applying i18n or not */
	i18nValueAllowed?: boolean;
	/* use as button text, ignored when "$field" passed */
	text?: ReactNode;
	/* use value as button text */
	$field?: ModelPath<T>;
}

export type OmittedButtonHTMLProps =
	| HxOmittedAttributes
	| 'disabled' | 'type' | 'value'
	| 'color'
	| 'children';

export type HxButtonProps<T extends object> = PropsWithoutRef<
	& HxExtButtonProps<T>
	& HxHtmlElementProps<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>, OmittedButtonHTMLProps, T>
>;

export type HxButtonType = <T extends object>(
	props: HxButtonProps<T> & RefAttributes<HTMLButtonElement>
) => ReactElement | null;

export const HxButton =
	forwardRef(<T extends object>(props: HxButtonProps<T>, ref: ForwardedRef<HTMLButtonElement>) => {
		const {
			$model, $field,
			color = HxButtonDefaults.color, various = HxButtonDefaults.various,
			uppercase = HxButtonDefaults.uppercase, i18nValueAllowed = HxButtonDefaults.i18nValueAllowed,
			text,
			...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);
		const forceUpdate = useForceUpdate();

		let buttonText = text;
		let textUppercase = uppercase;
		let valueFromModel = false;
		if ($field != null && $field.length !== 0) {
			// ignore the text and uppercase
			textUppercase = false;
			buttonText = ERO.getValue($model, $field);
			valueFromModel = true;
		}
		if (typeof buttonText === 'string' && buttonText.length !== 0) {
			if (valueFromModel) {
				if (i18nValueAllowed) {
					// to identify it needs i18n
					buttonText = <HxLabel text={`~${buttonText}`}/>;
				} else {
					// value from model, keep it, ignore the case transform
					textUppercase = false;
				}
			} else {
				// value not from model, treated as i18n label anyway
				buttonText = <HxLabel text={buttonText}/>;
			}
		}

		const restProps = safeToDom(wrapToReactEvents(rest, $model, context, forceUpdate));

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
		</button>;
	}) as unknown as HxButtonType;

/** button with check */
export type HxWithCheckButtonType = <T extends object>(
	props: HxButtonProps<T> & CheckProps<T> & RefAttributes<HTMLButtonElement>
) => ReactElement | null;
export const HxWithCheckButton = HxWithCheck(HxButton) as unknown as HxWithCheckButtonType;
