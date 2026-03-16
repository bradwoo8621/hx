// @ts-ignore
import React, {type ForwardedRef, forwardRef, type ReactNode, useEffect, useState} from 'react';
import {type HxLanguageCode, useHxContext} from '../../contexts';
import {useForceUpdate} from '../../hooks';

export const isI18NKey = (label: string): [boolean, string] => {
	if (label.startsWith('~') && label.length !== 1) {
		return [true, label.substring(1)];
	} else if (label.startsWith('\\~')) {
		return [false, label.substring(1)];
	} else {
		return [false, label];
	}
};

export interface HxI18NLabelProps {
	/**
	 * - starts with "~" means i18n key. leading "~" can escape by "\~", note only the first "~" can be escaped by this way.
	 * - otherwise it is a label.
	 */
	label: string;
}

export const HxI18NLabel =
	forwardRef((props: HxI18NLabelProps, ref: ForwardedRef<HTMLSpanElement>) => {
		const {label} = props;

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
		if (isI18NKey(label)) {
			text = context.language.get(label);
		} else {
			text = label;
		}

		return <span data-hx-i18n-label="" ref={ref}>
			{text}
		</span>;
	});
