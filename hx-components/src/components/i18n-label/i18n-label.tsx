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
import type {HtmlElementProps, HxColor, HxOmittedAttributes} from '../types';

export const isI18NKey = (label: string): [boolean, string] => {
	if (label.startsWith('~') && label.length !== 1) {
		return [true, label.substring(1)];
	} else if (label.startsWith('\\~')) {
		return [false, label.substring(1)];
	} else {
		return [false, label];
	}
};

export type HxI18NLabelColor = HxColor;

export interface HxExtI18NLabelProps {
	/**
	 * - starts with "~" means i18n key. leading "~" can escape by "\~", note only the first "~" can be escaped by this way.
	 * - otherwise it is a label.
	 */
	label: string;
	color?: HxI18NLabelColor;
	/**
	 * identify this label is for message of with check or not.
	 * default false
	 */
	forWithCheck?: boolean;
}

export type HxI18NLabelProps = PropsWithoutRef<
	& HxExtI18NLabelProps
	& Omit<HtmlElementProps<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>, HxOmittedAttributes>
>;

export const HxI18NLabel =
	forwardRef((props: HxI18NLabelProps, ref: ForwardedRef<HTMLSpanElement>) => {
		const {label, color, forWithCheck = false} = props;

		const context = useHxContext();
		const forceUpdate = useForceUpdate();

		useEffect(() => {
			if (isI18NKey(label)) {
				const onLangChange = async (_languageCode: HxLanguageCode) => {
					forceUpdate();
				};
				context.language.on(onLangChange);

				return () => {
					context.language.off(onLangChange);
				};
			}
		}, [label]);

		let text: ReactNode;
		const [isI18N, labelOrKey] = isI18NKey(label);
		if (isI18N) {
			text = context.language.get(labelOrKey);
		} else {
			text = label;
		}

		return <span data-hx-i18n-label=""
		             data-hx-color={color}
		             data-hx-for-with-check={forWithCheck}
		             ref={ref}>
			{text}
		</span>;
	});
