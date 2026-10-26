import {nanoid} from 'nanoid';
// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {useDelayedFunc} from '../../hooks';
import type {HxTooltipInstanceHandle} from '../../types';
import {UTCDate} from '../../utils';
import {useHxContext} from '../context';
import {type HxTooltipShowOptions, useHxTooltip} from './context';
import {HxTooltipDefaults} from './defaults';
import {HxTooltip} from './tooltip';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface HxTooltipPortalState extends Partial<HxTooltipShowOptions<any>> {
	handle?: HxTooltipInstanceHandle;
}

export const HxTooltipPortal = () => {
	const context = useHxContext();
	const tooltipContext = useHxTooltip();
	const ref = useRef<HxTooltipPortalState>({});
	const {delay, clear} = useDelayedFunc(HxTooltipDefaults.showDelay);

	useEffect(() => {
		const onShow = <T extends object>(options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void) => {
			let handle = nanoid(10) + '@' + UTCDate.now().getTime();
			while (handle === ref.current.handle) {
				handle = nanoid(10) + '@' + UTCDate.now().getTime();
			}
			ref.current = {handle};
			context.forceUpdate();
			delay('tooltip', () => {
				// check target element still there
				const targetEl = options.targetEl;
				if (targetEl.isConnected && targetEl.offsetWidth > 0 && targetEl.offsetHeight > 0) {
					ref.current = {handle, ...options};
					context.forceUpdate();
				}
			}, options.props.showDelay == null ? (void 0) : Math.max(100, options.props.showDelay));
			callback(handle);
		};
		const onHide = (handle: HxTooltipInstanceHandle) => {
			if (handle === ref.current.handle) {
				// clear
				clear('tooltip');
				ref.current = {};
				context.forceUpdate();
			}
		};

		tooltipContext.onShow(onShow);
		tooltipContext.onHide(onHide);

		return () => {
			tooltipContext.offShow(onShow);
			tooltipContext.offHide(onHide);
		};
	}, [context, tooltipContext, delay, clear]);

	// eslint-disable-next-line react-hooks/refs
	if (ref.current.handle == null || ref.current.props == null) {
		return (void 0);
	}
	const targetEl = ref.current.targetEl;
	// eslint-disable-next-line react-hooks/refs
	if (targetEl == null || !targetEl.isConnected || (targetEl.offsetWidth ?? 0) < 1 || (targetEl.offsetHeight ?? 0) < 1) {
		return (void 0);
	}

	// @ts-expect-error ignore check
	// eslint-disable-next-line react-hooks/refs
	return createPortal(<HxTooltip {...ref.current}/>, document.body);
};
