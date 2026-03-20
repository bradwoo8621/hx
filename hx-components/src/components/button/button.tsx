import {ERO, type ModelPath} from '@hx/data';
// @ts-expect-error React import is provided by the framework
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
import type {
	CheckProps,
	ComponentDataProps,
	DisabledProps,
	HxColor,
	HxHtmlElementProps,
	HxOmittedAttributes,
	StdProps
} from '../../types';
import {addI18NPrefix, exposePropsToDOM} from '../../utils';
import {HxLabel} from '../label';
import {HxWithCheck} from '../with-check';
import {HxButtonDefaults} from './defaults';

export type HxButtonColor = HxColor;
/** Button visual variants: solid fill, outlined border, or ghost/transparent */
export type HxButtonVarious = 'solid' | 'outline' | 'ghost';

/**
 * Properties for the HxButton component.
 * Extends standard HTML button attributes with reactive data binding capabilities.
 */
export interface HxExtButtonProps<T extends object>
	extends StdProps<T>, DisabledProps<T>, ComponentDataProps<T> {
	/** Button color theme from design system palette */
	color?: HxButtonColor;
	/** Button visual style variant */
	various?: HxButtonVarious;
	/** Apply uppercase text transform. Ignored when $field is specified. */
	uppercase?: boolean;
	/** Whether to apply i18n translation to values retrieved from the model */
	valueUseI18N?: boolean;
	/** Static button text content. Ignored when $field is specified. */
	text?: ReactNode;
	/** Path to reactive field on $model whose value will be used as button text */
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

/**
 * Reactive button component with support for dynamic text from reactive models.
 * Features multiple visual variants, automatic i18n translation, and reactive disabled/visible states.
 *
 * @component
 * @example
 * // Basic static button
 * <HxButton text="Click Me" onClick={() => alert('Clicked!')} />
 *
 * @example
 * // Button with text from reactive model
 * <HxButton $model={userModel} $field="status" />
 *
 * @example
 * // Outline variant with custom color
 * <HxButton text="Cancel" various="outline" color="secondary" />
 *
 * @features
 * - Static or reactive dynamic text from data models
 * - Three visual variants: solid (default), outline, and ghost
 * - Automatic i18n translation support for button text
 * - Reactive disabled/visible state management
 * - Built-in label component integration
 * - Full keyboard and accessibility support
 */
export const HxButton =
	forwardRef(<T extends object>(props: HxButtonProps<T>, ref: ForwardedRef<HTMLButtonElement>) => {
		const {
			$model, $field,
			color = HxButtonDefaults.color, various = HxButtonDefaults.various,
			uppercase = HxButtonDefaults.uppercase, valueUseI18N = HxButtonDefaults.valueUseI18N,
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
			buttonText = ERO.getValue($model, $field);
			valueFromModel = true;
		}
		if (typeof buttonText === 'string' && buttonText.length !== 0) {
			if (valueFromModel) {
				if (valueUseI18N) {
					// make sure the text pass to label is indicated as an i18n key
					buttonText = <HxLabel text={addI18NPrefix(buttonText)}/>;
				} else {
					// value from model, keep it, ignore the case transform
					textUppercase = false;
				}
			} else {
				// value not from model, treated as i18n label anyway
				buttonText = <HxLabel text={buttonText}/>;
			}
		}

		const restProps = exposePropsToDOM(rest, $model, context, forceUpdate);

		return <button {...restProps}
		               type="button"
		               data-hx-button=""
		               data-hx-visible={visible ?? true}
		               data-hx-disabled={disabled ?? false} disabled={disabled ?? false}
		               data-hx-color={color}
		               data-hx-button-various={various}
		               data-hx-text-uppercase={textUppercase}
		               ref={ref}>
			{buttonText}
		</button>;
	}) as unknown as HxButtonType;
// @ts-expect-error assign component name
HxButton.displayName = 'HxButton';

/**
 * Button component with built-in validation support.
 * Combines HxButton functionality with HxWithCheck validation capabilities.
 *
 * @component
 * @example
 * <HxWithCheckButton
 *   $model={formModel}
 *   $field="terms"
 *   required
 *   text="Agree and Submit"
 * />
 */
export type HxWithCheckButtonType = <T extends object>(
	props: HxButtonProps<T> & CheckProps<T> & RefAttributes<HTMLButtonElement>
) => ReactElement | null;
export const HxWithCheckButton = HxWithCheck(HxButton) as unknown as HxWithCheckButtonType;
// @ts-expect-error assign component name
HxWithCheckButton.displayName = 'HxWithCheckButton';
