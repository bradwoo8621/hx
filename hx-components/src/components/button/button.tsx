import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, isValidElement, type ReactElement, type RefAttributes} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import {DOMUtils, HxDataPropToAttrValueComputer, I18NUtils} from '../../utils';
import {HxLabel} from '../label';
import {HxButtonDefaults} from './defaults';
import type {HxButtonProps} from './types';

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
			valueUseI18N = HxButtonDefaults.valueUseI18N,
			text,
			...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);

		let buttonText = text;
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
					rest.uppercase = false;
				}
			} else {
				// value not from model, treated as i18n label anyway
				buttonText = <HxLabel text={buttonText}/>;
			}
		} else if (isValidElement(buttonText)) {
			buttonText = DOMUtils.interposeToChildren({$model}, buttonText);
		}

		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context, {
			key: 'HxButton', default: HxButtonDefaults, visible, disabled
		});

		return <button {...restProps}
		               type="button"
		               data-hx-button=""
		               data-hx-model-path={ERO.loosePathOf($model, $field)}
		               disabled={disabled ?? false}
		               ref={ref}>
			{buttonText}
		</button>;
	}) as unknown as HxButtonType;
// @ts-expect-error assign component name
HxButton.displayName = 'HxButton';

HxDataPropToAttrValueComputer.create('HxButton')
	.propsAsIs({
		variant: 'data-hx-button-variant',
		uppercase: 'data-hx-button-text-uppercase'
	})
	.and('color', 'hovered').register();
