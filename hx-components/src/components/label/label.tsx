import type {ModelPath} from '@hx/data';
// @ts-ignore
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type PropsWithoutRef,
	type ReactNode,
	useEffect
} from 'react';
import {type HxLanguageCode, useHxContext} from '../../contexts';
import {useForceUpdate} from '../../hooks';
import type {HxObject, StdProps} from '../../types';
import type {HxColor, HxHtmlElementProps, HxOmittedAttributes} from '../types';

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
	 * - starts with "~" means i18n key. leading "~" can escape by "\~", note only the first "~" can be escaped by this way.
	 * - otherwise it is a label.
	 */
	/* use as button text, ignored when "$field" passed */
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

export const HxLabel =
	forwardRef(<T extends object>(props: HxLabelProps<T>, ref: ForwardedRef<HTMLSpanElement>) => {
		const {text, color, role} = props;

		const context = useHxContext();
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
		const [isI18N, labelOrKey] = isI18NKey(text);
		if (isI18N) {
			label = context.language.get(labelOrKey);
		} else {
			label = text;
		}

		return <span data-hx-label="" data-hx-label-role={role}
		             data-hx-color={color}
		             ref={ref}>
			{label}
		</span>;
	});
