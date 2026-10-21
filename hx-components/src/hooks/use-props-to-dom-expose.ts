import {type HTMLAttributes, isValidElement, type ReactNode} from 'react';
import type {HxContext} from '../contexts';
import type {
	HtmlElementProps,
	HxDomDataAttrName,
	HxHtmlElementProps,
	HxObject,
	HxTooltipHolder,
	HxTooltipProps
} from '../types';
import {DOMUtils, type HxProps} from '../utils';
import {useDelayedFunc} from './use-delayed-func';

export const usePropsToDomExpose = <
	E extends HTMLElement,
	EA extends HTMLAttributes<E>,
	O extends keyof HtmlElementProps<E, EA> | HxDomDataAttrName,
	T extends object
>(
	props: HxHtmlElementProps<E, EA, O, T>,
	model: HxObject<T> | undefined,
	context: HxContext,
	dataAttrs?: { key: string, default?: HxProps, visible?: boolean, disabled?: boolean, readonly?: boolean }
): HtmlElementProps<E, EA> => {
	const exposed = DOMUtils.exposePropsToDOM(props, model, context, dataAttrs);
	const tooltip = (exposed as HxTooltipHolder).tooltip;

	const {delay, clear} = useDelayedFunc(150);

	if (tooltip != null) {
		const onMouseEnter = exposed.onMouseEnter;
		exposed.onMouseEnter = (ev) => {
			const target = ev.currentTarget;
			delay('tooltip', () => {
				const type = typeof tooltip;
				context.tooltip.show({
					props: (['string', 'number', 'bigint', 'boolean', 'symbol'].includes(type) || isValidElement(tooltip))
						? {content: tooltip as ReactNode}
						: tooltip as HxTooltipProps,
					$model: model, targetEl: target
				});
			});
			onMouseEnter?.(ev);
			// stop propagation only when there is some tooltip parent
			if (target.parentElement?.closest('*[data-hx-tooltip-podium]') != null) {
				ev.stopPropagation();
			}
		};
		const onMouseLeave = exposed.onMouseLeave;
		exposed.onMouseLeave = (ev) => {
			clear('tooltip');
			context.tooltip.hide();
			onMouseLeave?.(ev);
		};
		delete (exposed as HxTooltipHolder).tooltip;
		// @ts-expect-error ignore check
		exposed['data-hx-tooltip-podium'] = '';
	}
	return exposed;
};
