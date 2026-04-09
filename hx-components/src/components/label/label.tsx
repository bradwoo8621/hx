import {ERO, type ModelPath} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	isValidElement,
	type PropsWithoutRef,
	type ReactElement,
	type ReactNode,
	type RefAttributes,
	useEffect
} from 'react';
import {type HxLanguageCode, useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import {HxFmt, type HxFormats} from '../../settings';
import type {
	CheckProps,
	HxBorderRadius,
	HxColor,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxPadding,
	StdProps,
	WithRequired
} from '../../types';
import {delI18NPrefix, exposePropsToDOM, isI18NKey} from '../../utils';
import {HxWithCheck} from '../with-check';
import {HxLabelDefaults} from './defaults';

/** Label text color from design system palette */
export type HxLabelColor = HxColor;
export type HxLabelBorderRadius = HxBorderRadius;
/** Horizontal margin size around the label */
export type HxLabelPaddingX = HxPadding | 'text-indent';
/** Vertical margin size around the label */
export type HxLabelPaddingY = HxPadding;

/**
 * Properties for the HxLabel component.
 * Supports static text, dynamic reactive text, i18n translation, and value formatting.
 */
export interface HxExtLabelProps<T extends object>
	extends StdProps<T> {
	/** Text color theme */
	color?: HxLabelColor;
	/** Whether to use opaque (solid) background for the label */
	opaque?: boolean;
	/** Whether the element is clickable */
	clickable?: boolean;
	/** Whether the element is hoverable */
	hoverable?: boolean;
	/** Whether the element is hovered, only for hoverable is not enabled */
	hovered?: boolean;
	/** Whether the element is active */
	active?: boolean;
	/** Border radius size for the label corners */
	borderRadius?: HxLabelBorderRadius;
	/** Whether to apply i18n translation to values retrieved from the reactive model */
	valueUseI18N?: boolean;
	/**
	 * Static label text content. Ignored when both $model and $field are specified.
	 * - Values starting with "~" are treated as i18n translation keys
	 * - Leading "~" can be escaped with "\~" to display literal "~" as first character
	 */
	text?: ReactNode;
	/** Reactive model object to get dynamic label text from */
	$model?: HxObject<T>,
	/** Path to field on $model whose value will be used as label text */
	$field?: ModelPath<T>;
	/** Format type to apply to the value. Overrides i18n translation when specified. */
	format?: HxFormats;
	/**
	 * Special role identifier:
	 * - 'check-msg' for form validation error messages
	 */
	role?: 'check-msg';
	paddingX?: HxLabelPaddingX;
	paddingY?: HxLabelPaddingY;
}

export type OmittedLabelHTMLProps =
	| HxOmittedAttributes
	| 'role';

export type HxLabelProps<T extends object> = PropsWithoutRef<
	& HxExtLabelProps<T>
	& HxHtmlElementProps<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>, OmittedLabelHTMLProps, T>
>;

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
			color, opaque = false, clickable, hoverable, hovered, active, borderRadius,
			paddingX, paddingY,
			valueUseI18N = HxLabelDefaults.valueUseI18N,
			text, format, role,
			...rest
		} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);

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
				const [is] = isI18NKey(text);
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
					const i18nText = context.language.get(delI18NPrefix(labelText));
					if (i18nText != null) {
						labelText = i18nText;
					}
				}
			} else {
				// value not from model, check it is i18n key or not
				const [isI18N, labelOrKey] = isI18NKey(labelText);
				if (isI18N) {
					labelText = context.language.get(labelOrKey) || labelText;
				}
			}
		}

		// analysis the text value, put it on dom attribute
		let labelTextValue: string | undefined;
		if (isValidElement(labelText)) {
			labelTextValue = labelText.props?.['data-hx-label-text'];
		} else {
			labelTextValue = `${labelText}`;
		}
		const restProps = exposePropsToDOM(rest, $model, context);

		return <span {...restProps}
		             data-hx-label=""
		             data-hx-model-path={ERO.loosePathOf($model, $field)}
		             data-hx-label-role={role}
		             data-hx-label-text={labelTextValue}
		             data-hx-color={color} data-hx-label-opaque={opaque ? '' : (void 0)}
		             data-hx-label-clickable={clickable ? '' : (void 0)}
		             data-hx-label-hoverable={hoverable ? '' : (void 0)}
		             data-hx-label-hovered={hovered ? '' : (void 0)} data-hx-label-active={active ? '' : (void 0)}
		             data-hx-label-border-radius={borderRadius}
		             data-hx-label-padding-x={paddingX} data-hx-label-padding-y={paddingY}
		             data-hx-visible={(visible ?? true) ? '' : (void 0)}
		             ref={ref}>
			{labelText}
		</span>;
	}) as unknown as HxLabelType;
// @ts-expect-error assign component name
HxLabel.displayName = 'HxLabel';

/**
 * Label component with built-in validation support.
 * Combines HxLabel functionality with HxWithCheck validation capabilities,
 * primarily used for displaying form validation error messages.
 *
 * @example
 * ```tsx
 * <HxWithCheckLabel
 *   $model={formModel}
 *   $field="email"
 *   role="check-msg"
 * />
 * ```
 */
export type HxWithCheckLabelType = <T extends object>(
	props: WithRequired<HxLabelProps<T>, '$model'> & CheckProps<T> & RefAttributes<HTMLSpanElement>
) => ReactElement | null;
export const HxWithCheckLabel = HxWithCheck(HxLabel) as unknown as HxWithCheckLabelType;
// @ts-expect-error assign component name
HxWithCheckLabel.displayName = 'HxWithCheckLabel';
