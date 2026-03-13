import type {ReactiveObject} from '@hx/data';
import type {DispatchWithoutAction, HTMLAttributes} from 'react';
import type {HxContext} from '../contexts';
import type {HtmlElementProps, HxHtmlElementProps} from './types';

export const unwrapToReactEvents =
	<
		E extends HTMLElement,
		EA extends HTMLAttributes<E>,
		O extends keyof HtmlElementProps<E, EA> | `data-hx-${string}`,
		M extends object
	>(
		props: HxHtmlElementProps<E, EA, O, M>,
		model: ReactiveObject & M,
		context: HxContext,
		forceUpdate: DispatchWithoutAction
	): Omit<HtmlElementProps<E, EA>, O> => {
		Object.keys(props).forEach((key) => {
			// @ts-ignore
			const value = props[key];
			if (value != null && typeof value === 'function'
				&& key.startsWith('on') && key.length > 2
				&& ['ABCDEFGHIJKLMNOPQRSTUVWXYZ'].includes(key[2])) {
				// @ts-ignore
				props[key] = (ev) => {
					value(ev, model, context, forceUpdate);
				};
			}
		});
		return props;
	};