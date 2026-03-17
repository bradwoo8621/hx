import {ERO, type ModelPath} from '@hx/data';
// @ts-ignore
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type PropsWithoutRef,
	type ReactElement,
	type ReactNode,
	type RefAttributes,
	useEffect
} from 'react';
import {type HxLanguageCode, useHxContext} from '../../contexts';
import {useDataMonitor, useForceUpdate} from '../../hooks';
import {HxFmt, type HxFormats} from '../../settings';
import type {CheckProps, HxObject, StdProps, WithRequired} from '../../types';
import type {HxColor, HxHtmlElementProps, HxOmittedAttributes} from '../types';
import {delI18NPrefix, isI18NKey, safeToDom, wrapToReactEvents} from '../utils';
import {HxWithCheck} from '../with-check';
import {HxLabelDefaults} from './defaults';

export type HxLabelColor = HxColor;

export interface HxExtLabelProps<T extends object>
	extends StdProps<T> {
	color?: HxLabelColor;
	/** use i18n when value from model, or not */
	valueUseI18N?: boolean;
	/**
	 * use as label text, ignored when "$model" and "$field" passed
	 * - starts with "~" means i18n key. leading "~" can escape by "\~", note only the first "~" can be escaped by this way.
	 * - otherwise it is a label.
	 */
	text?: ReactNode;
	/* use value as label text */
	$model?: HxObject<T>,
	/* use value as label text */
	$field?: ModelPath<T>;
	/** ignore i18n when format passed, no matter where the value is from */
	format?: HxFormats;
	/**
	 * identify this label is for message of with check or not.
	 * default false
	 */
	role?: 'with-check-msg';
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

export const HxLabel =
	forwardRef(<T extends object>(props: HxLabelProps<T>, ref: ForwardedRef<HTMLSpanElement>) => {
		const {
			$model, $field,
			color, valueUseI18N = HxLabelDefaults.valueUseI18N,
			text, format, role,
			...rest
		} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);
		const forceUpdate = useForceUpdate();

		useEffect(() => {
			if (($model != null && $field != null && $field.length !== 0 && valueUseI18N)
				|| isI18NKey(text)) {
				const onLangChange = async (_languageCode: HxLanguageCode) => {
					forceUpdate();
				};
				context.language.on(onLangChange);

				return () => {
					context.language.off(onLangChange);
				};
			}
		}, [$model, $field, valueUseI18N, text]);

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
					labelText = context.language.get(labelOrKey);
				}
			}
		}

		const restProps = safeToDom(wrapToReactEvents(rest, $model, context, forceUpdate));

		return <span {...restProps} data-hx-label="" data-hx-label-role={role}
		             data-hx-color={color}
		             data-hx-visible={visible ?? true}
		             ref={ref}>
			{labelText}
		</span>;
	}) as unknown as HxLabelType;

/** button with check */
export type HxWithCheckLabelType = <T extends object>(
	props: WithRequired<HxLabelProps<T>, '$model'> & CheckProps<T> & RefAttributes<HTMLSpanElement>
) => ReactElement | null;
export const HxWithCheckLabel = HxWithCheck(HxLabel) as unknown as HxWithCheckLabelType;
