// @ts-expect-error import React
import React, {type ReactNode, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import type {AbsolutePosition, RectRange} from '../../types';
import {computeGapToViewportEdges, interposeToChildren} from '../../utils';
import {type PopupRect, useHxPopupContext} from './popup-provider';

export interface HxPopupProps {
	zIndex: number;
	gapToEdge: number;

	children: ReactNode;
}

type RenderState = 'hidden' | 'prepare' | 'prepared' | 'active' | 'hide';

export const HxPopup = (props: HxPopupProps) => {
	const {
		zIndex, gapToEdge,
		children
	} = props;

	const context = useHxContext();
	const popupContext = useHxPopupContext();
	const ref = useRef<HTMLDivElement | null>(null);
	const renderStateRef = useRef<RenderState>('hidden');
	const triggerRectRef = useRef<PopupRect | undefined>();
	const domRectRef = useRef<AbsolutePosition | undefined>();

	useEffect(() => {
		const onCheckFocusElement = (triggerEl: HTMLElement, callback: (inPopup: boolean) => void) => {
			callback(triggerEl.closest('div[data-hx-popup]') == ref.current);
		};
		popupContext.onCheckFocusElement(onCheckFocusElement);
		return () => {
			popupContext.offCheckFocusElement(onCheckFocusElement);
		};
	}, [popupContext]);
	useEffect(() => {
		switch (renderStateRef.current) {
			case 'prepare': {
				const dom = ref.current;
				const {width, height} = dom?.getBoundingClientRect() ?? {width: 0, height: 0};
				const triggerRect = triggerRectRef.current!;
				const {
					top: topGap, bottom: bottomGap, left: leftGap, right: rightGap
				} = computeGapToViewportEdges(triggerRect!, gapToEdge);
				const atBottom = bottomGap >= height || topGap <= height;
				// x-axis starts with left or ends with right
				const startFromLeft = rightGap + triggerRect.width >= width || leftGap + triggerRect.width <= width;
				domRectRef.current = {
					top: atBottom ? (triggerRect.top + triggerRect.height + 2) : (void 0),
					bottom: atBottom ? (void 0) : ((window.innerHeight || document.documentElement.clientHeight) - triggerRect.top + 2),
					left: startFromLeft ? triggerRect.left : (void 0),
					right: startFromLeft ? (void 0) : ((window.innerWidth || document.documentElement.clientWidth) - triggerRect.right),
					height,
					width
				};

				renderStateRef.current = 'prepared';
				if (dom != null) {
					dom.setAttribute('data-hx-popup-state', 'prepared');
					const domRect = domRectRef.current!;
					dom.style.height = '';
					dom.style.width = domRect.width == null ? '' : (domRect.width + 'px');
					dom.style.top = domRect.top == null ? '' : (domRect.top + 'px');
					dom.style.bottom = domRect.bottom == null ? '' : (domRect.bottom + 'px');
					dom.style.left = domRect.left == null ? '' : (domRect.left + 'px');
					dom.style.right = domRect.right == null ? '' : (domRect.right + 'px');
				}
				requestAnimationFrame(() => {
					renderStateRef.current = 'active';
					const dom = ref.current!;
					dom.setAttribute('data-hx-popup-state', 'active');
					const domRect = domRectRef.current!;
					dom.style.height = domRect.height == null ? '' : (domRect.height + 'px');
				});
				break;
			}
		}
		// eslint-disable-next-line react-hooks/refs,react-hooks/exhaustive-deps
	}, [renderStateRef.current]);
	useEffect(() => {
		const onShow = <E extends HTMLElement>(triggerEl: E, popupRectRange: RectRange) => {
			const rect = triggerEl.getBoundingClientRect();
			renderStateRef.current = 'prepare';
			triggerRectRef.current = rect;
			triggerRectRef.current.minWidth = popupRectRange.minWidth ?? rect.width;
			triggerRectRef.current.maxHeight = popupRectRange.maxHeight;
			context.forceUpdate();
		};
		const onHide = () => {
			const dom = ref.current;
			if (dom != null) {
				dom.style.height = '';
			}
			dom?.addEventListener('transitionend', () => {
				renderStateRef.current = 'hidden';
				const dom = ref.current;
				dom?.setAttribute('data-hx-popup-state', 'hidden');
				context.forceUpdate();
				if (dom != null) {
					dom.style.height = '';
					dom.style.width = '';
					dom.style.top = '';
					dom.style.bottom = '';
					dom.style.left = '';
					dom.style.right = '';
				}
			}, {once: true});
			renderStateRef.current = 'hide';
			dom?.setAttribute('data-hx-popup-state', 'hide');
		};
		popupContext.onShow(onShow);
		popupContext.onHide(onHide);
		return () => {
			popupContext.offShow(onShow);
			popupContext.offHide(onHide);
		};
	}, [context, popupContext]);

	// eslint-disable-next-line react-hooks/refs
	const {minWidth, maxWidth, minHeight, maxHeight} = triggerRectRef.current ?? {};

	// always render the popup container, no matter it is used or not
	// the reason is that, in many cases, the popup content requires data,
	// which is prepared at nodes specified via the "data" property of the popup provider.
	// under such circumstances, if the content has not been rendered in advance,
	// it cannot receive the data loading events from the "data".
	return <div data-hx-popup=""
		// eslint-disable-next-line react-hooks/refs
		        data-hx-popup-state={renderStateRef.current}
		        style={{zIndex, minWidth, maxWidth, minHeight, maxHeight}}
		        ref={ref}>
		{/* eslint-disable-next-line react-hooks/refs */}
		{interposeToChildren({visible: renderStateRef.current !== 'hidden'}, children)}
	</div>;
};
