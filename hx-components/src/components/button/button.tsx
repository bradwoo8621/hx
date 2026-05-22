import {ERO, type ModelPath} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ButtonHTMLAttributes,
	type ForwardedRef,
	forwardRef,
	isValidElement,
	type ReactElement,
	type ReactNode,
	type RefAttributes
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import type {
	DisabledProps,
	HxColor,
	HxDataPath,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxStdProps,
	HxWidthConstrainedProps
} from '../../types';
import {DOMUtils, I18NUtils} from '../../utils';
import {HxLabel} from '../label';
import {HxButtonDefaults} from './defaults';

export type HxButtonColor = HxColor;
/** Button visual variants: solid fill, outlined border, or ghost/transparent */
export type HxButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';

/**
 * Properties for the HxButton component.
 * Extends standard HTML button attributes with reactive data binding capabilities.
 */
export interface HxExtButtonProps<T extends object>
	extends HxStdProps<T>, DisabledProps<T>, HxWidthConstrainedProps {
	/** Button color theme from design system palette */
	color?: HxButtonColor;
	/** Button visual style variant */
	variant?: HxButtonVariant;
	/** Apply uppercase text transform. Ignored when $field is specified. */
	uppercase?: boolean;
	/** Whether to apply i18n translation to values retrieved from the model */
	valueUseI18N?: boolean;
	/** Static button text content. Ignored when $field is specified. */
	text?: ReactNode;
	/** Optional reactive model */
	$model?: HxObject<T>,
	/** Path to reactive field on $model whose value will be used as button text */
	$field?: ModelPath<T> | HxDataPath;
}

export type OmittedButtonHTMLProps =
	| HxOmittedAttributes
	| 'disabled' | 'type' | 'value'
	| 'color'
	| 'children';

export type HxButtonProps<T extends object> =
	& HxExtButtonProps<T>
	& HxHtmlElementProps<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>, OmittedButtonHTMLProps, T>;

export type HxButtonType = <T extends object>(
	props: HxButtonProps<T> & RefAttributes<HTMLButtonElement>
) => ReactElement | null;

/**
 * Reactive button component with support for dynamic text from reactive models.
 * Features multiple visual variants, automatic i18n translation, and reactive disabled/visible states.
 *
 * @example
 * ```tsx
 * // Basic static button
 * <HxButton text="Click Me" onClick={() => alert('Clicked!')} />
 * ```
 *
 * @example
 * ```tsx
 * // Button with text from reactive model
 * <HxButton $model={userModel} $field="status" />
 * ```
 *
 * @example
 * ```tsx
 * // Outline variant with custom color
 * <HxButton text="Cancel" variant="outline" color="secondary" />
 * ```
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
			color = HxButtonDefaults.color, variant = HxButtonDefaults.variant,
			uppercase = HxButtonDefaults.uppercase, valueUseI18N = HxButtonDefaults.valueUseI18N,
			text,
			...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);

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
					buttonText = <HxLabel text={I18NUtils.addI18NPrefix(buttonText)}/>;
				} else {
					// value from model, keep it, ignore the case transform
					textUppercase = false;
				}
			} else {
				// value not from model, treated as i18n label anyway
				buttonText = <HxLabel text={buttonText}/>;
			}
		} else if (isValidElement(buttonText)) {
			buttonText = DOMUtils.interposeToChildren({$model}, buttonText);
		}

		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context);

		return <button {...restProps}
		               type="button"
		               data-hx-button=""
		               data-hx-model-path={ERO.loosePathOf($model, $field)}
		               data-hx-visible={(visible ?? true) ? '' : 'no'}
		               data-hx-disabled={(disabled ?? false) ? '' : (void 0)} disabled={disabled ?? false}
		               data-hx-color={color}
		               data-hx-button-variant={variant}
		               data-hx-text-uppercase={textUppercase ? '' : (void 0)}
		               ref={ref}>
			{buttonText}
		</button>;
	}) as unknown as HxButtonType;
// @ts-expect-error assign component name
HxButton.displayName = 'HxButton';
