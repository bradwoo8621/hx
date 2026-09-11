import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	isValidElement,
	type ReactElement,
	type ReactNode,
	type RefAttributes,
	useEffect
} from 'react';
import {type HxLanguageCode, useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import {DOMUtils, HxDataPropToAttrValueComputer, HxDataUtils, HxFmt, I18NUtils} from '../../utils';
import {HxLabelDefaults} from './defaults';
import type {HxLabelProps} from './types';

export type HxLabelType = <T extends object>(
	props: HxLabelProps<T> & RefAttributes<HTMLSpanElement>
) => ReactElement | null;

/**
 * Reactive label component with built-in i18n support and value formatting.
 * Automatically updates when language changes or reactive model values update.
 * Supports both static text and dynamic text from reactive data models.
 *
 * @example
 * ```tsx
 * // Static label with i18n key
 * <HxLabel text="~user.email.label" />
 * ```
 *
 * @example
 * ```tsx
 * // Dynamic label from reactive model
 * <HxLabel $model={userModel} $field="fullName" />
 * ```
 *
 * @example
 * ```tsx
 * // Formatted date label
 * <HxLabel $model={orderModel} $field="createdAt" format="df" />
 * ```
 *
 * @features
 * - Automatic i18n translation for static and dynamic text
 * - Reactive updates when language changes or model values update
 * - Built-in value formatting support (dates, numbers, currencies, etc.)
 * - Special support for form validation error messages via role prop
 * - Reactive visible state management
 * - Lightweight and accessible as native span element
 */
export const HxLabel =
	forwardRef(<T extends object>(props: HxLabelProps<T>, ref: ForwardedRef<HTMLSpanElement>) => {
		const {
			$model, $field,
			valueUseI18N = HxLabelDefaults.valueUseI18N, text, format,
			...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled} = useDataMonitor(props);

		useEffect(() => {
			let useI18N: boolean;
			if (format != null) {
				// format will be applied to any value, no matter what the value is from
				// and format will pass the context
				// so it is possibly use i18n, make it be true
				useI18N = true;
			} else if ($model != null && $field != null && $field.length !== 0) {
				// $model, $field defined, use i18n or not depends on value of valueUseI18N
				useI18N = valueUseI18N;
			} else {
				// depends on the text is i18n key prefixed or not
				const [is] = I18NUtils.isI18NKey(text);
				useI18N = is;
			}
			if (useI18N) {
				// basically, the real text is not needed,
				// the only thing here is register a listener on language change
				// and refresh me when event captured
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const onLangChange = async (_languageCode: HxLanguageCode) => {
					context.forceUpdate();
				};
				context.language.on(onLangChange);

				return () => {
					context.language.off(onLangChange);
				};
			}
		}, [$model, $field, valueUseI18N, text, format, context]);

		let labelText: ReactNode = text;
		let valueFromModel = false;
		if ($model != null && $field != null && $field.length !== 0) {
			// no more i18n check when get value from model
			labelText = ERO.getValue($model, $field);
			valueFromModel = true;
		}
		if (format != null) {
			labelText = HxFmt.format(labelText, context, format);
		} else if (typeof labelText === 'string' && labelText.length !== 0) {
			if (valueFromModel) {
				// value from model
				if (valueUseI18N) {
					// try to transform to i18n
					const i18nText = context.language.get(I18NUtils.delI18NPrefix(labelText));
					if (i18nText != null) {
						labelText = i18nText;
					}
				}
			} else {
				// value not from model, check it is i18n key or not
				const [isI18N, labelOrKey] = I18NUtils.isI18NKey(labelText);
				if (isI18N) {
					labelText = context.language.get(labelOrKey) || labelText;
				} else {
					// not an i18n key, but "\~" leading is an escaped "~",
					// take the text with the escaping "\" removed
					labelText = labelOrKey;
				}
			}
		} else if (isValidElement(labelText)) {
			labelText = DOMUtils.interposeToChildren({$model: HxDataUtils.resolveChildModel($model, $field)}, labelText);
		}

		// analysis the text value, put it on dom attribute
		let labelTextValue: string | undefined;
		if (isValidElement(labelText)) {
			labelTextValue = labelText.props?.['data-hx-label-text'];
		} else {
			labelTextValue = `${labelText ?? ''}`;
		}
		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context, {
			key: 'HxLabel', default: HxLabelDefaults, visible, disabled
		});

		return <span {...restProps}
		             data-hx-label=""
		             data-hx-model-path={ERO.loosePathOf($model, $field)}
		             data-hx-label-text={labelTextValue}
		             ref={ref}>
			{labelText}
		</span>;
	}) as unknown as HxLabelType;
// @ts-expect-error assign component name
HxLabel.displayName = 'HxLabel';

HxDataPropToAttrValueComputer.create('HxLabel')
	.propsAsIs({
		opaque: 'data-hx-label-opaque',
		clickable: 'data-hx-label-clickable',
		hoverable: 'data-hx-label-hoverable',
		active: 'data-hx-label-active',
		indent: 'data-hx-label-text-indent'
	})
	.and('color', 'hovered')
	.register();
