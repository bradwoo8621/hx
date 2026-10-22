import {type HTMLAttributes, isValidElement, type ReactNode, useRef} from 'react';
import type {HxContext} from '../contexts';
import type {
	HtmlElementProps,
	HxDomDataAttrName,
	HxHtmlElementProps,
	HxObject,
	HxTooltipHolder,
	HxTooltipInstanceHandle,
	HxTooltipProps
} from '../types';
import {DOMUtils, type HxProps} from '../utils';

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

	const instanceHandleRef = useRef<HxTooltipInstanceHandle | undefined>();

	// eslint-disable-next-line react-hooks/refs
	if (tooltip != null) {
		const onMouseEnter = exposed.onMouseEnter;
		exposed.onMouseEnter = (ev) => {
			const target = ev.currentTarget;
			const type = typeof tooltip;
			context.tooltip.show({
				props: (['string', 'number', 'bigint', 'boolean', 'symbol'].includes(type) || isValidElement(tooltip))
					? {content: tooltip as ReactNode}
					: tooltip as HxTooltipProps,
				$model: model, targetEl: target
			}, (handle) => {
				instanceHandleRef.current = handle;
			});
			onMouseEnter?.(ev);
			// stop propagation only when there is some tooltip parent
			if (target.parentElement?.closest('*[data-hx-tooltip-podium]') != null) {
				ev.stopPropagation();
			}
		};
		const onMouseLeave = exposed.onMouseLeave;
		exposed.onMouseLeave = (ev) => {
			if (instanceHandleRef.current != null) {
				const handle = instanceHandleRef.current;
				instanceHandleRef.current = (void 0);
				context.tooltip.hide(handle);
			}
			onMouseLeave?.(ev);
		};
		delete (exposed as HxTooltipHolder).tooltip;
		// @ts-expect-error ignore check
		exposed['data-hx-tooltip-podium'] = '';
	}
	return exposed;
};
