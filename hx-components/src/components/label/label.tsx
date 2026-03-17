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
import type {HxObject, StdProps} from '../../types';
import type {HxColor, HxHtmlElementProps, HxOmittedAttributes} from '../types';
import {wrapToReactEvents} from '../utils';

export const isI18NKey = (text: ReactNode): [true, string] | [false, ReactNode] => {
	if (typeof text !== 'string') {
		return [false, text];
	}

	if (text.startsWith('~') && text.length !== 1) {
		return [true, text.substring(1)];
	} else if (text.startsWith('\\~')) {
		return [false, text.substring(1)];
	} else {
		return [false, text];
	}
};

export type HxLabelColor = HxColor;

export interface HxExtLabelProps<T extends object>
	extends StdProps<T> {
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
	color?: HxLabelColor;
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
			text, color, role,
			...rest
		} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);
		const forceUpdate = useForceUpdate();

		useEffect(() => {
			if (isI18NKey(text)) {
				const onLangChange = async (_languageCode: HxLanguageCode) => {
					forceUpdate();
				};
				context.language.on(onLangChange);

				return () => {
					context.language.off(onLangChange);
				};
			}
		}, [text]);

		let label: ReactNode;
		if ($model != null && $field != null && $field.length !== 0) {
			// no more i18n check when get value from model
			label = ERO.getValue($model, $field);
		} else {
			const [isI18N, labelOrKey] = isI18NKey(text);
			if (isI18N) {
				label = context.language.get(labelOrKey);
			} else {
				label = text;
			}
		}

		const restProps = wrapToReactEvents(rest, $model, context, forceUpdate);

		return <span {...restProps} data-hx-label="" data-hx-label-role={role}
		             data-hx-color={color}
		             data-hx-visible={visible ?? true}
		             ref={ref}>
			{label}
		</span>;
	}) as unknown as HxLabelType;
