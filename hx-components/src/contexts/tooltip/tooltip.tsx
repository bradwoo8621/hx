// @ts-expect-error import React
import React, {type CSSProperties, isValidElement, useEffect, useRef, useState} from 'react';
import type {HxTooltipInstanceHandle, HxTooltipPosition} from '../../types';
import {DOMUtils, I18NUtils} from '../../utils';
import {useHxContext} from '../context';
import {type HxTooltipShowOptions, useHxTooltip} from './context';
import {HxTooltipDefaults} from './defaults';

interface HxTooltipState {
	handle: HxTooltipInstanceHandle;
	initialized: boolean;
}

interface HxTooltipStatusRef {
	status: 'none' | 'prepare' | 'ready' | 'located' | 'hidden';
	position: HxTooltipPosition;
	top: number;
	left: number;
}

export const HxTooltip = <T extends object>(props: HxTooltipShowOptions<T> & { handle: HxTooltipInstanceHandle }) => {
	const {
		handle, props: {
			content, position = 'top',
			zIndex = HxTooltipDefaults.zIndex,
			hideDelay = HxTooltipDefaults.hideDelay
		}, $model, targetEl
	} = props;

	const context = useHxContext();
	const tooltipContext = useHxTooltip();
	const [state, setState] = useState<HxTooltipState>({handle, initialized: false});
	const rootRef = useRef<HTMLDivElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const statusRef = useRef<HxTooltipStatusRef>({status: 'none', position, top: -9999, left: -9999});

	useEffect(() => {
		if (state.handle !== handle) {
			statusRef.current = {status: 'none', position: statusRef.current.position, top: -9999, left: -9999};
			setState({handle, initialized: false});
		}
	}, [handle, position, state.handle]);
	useEffect(() => {
		if (!state.initialized) {
			// change initialized to true, to trigger the first round rendering (invisible), for computing the size and position
			statusRef.current = {status: 'prepare', position: statusRef.current.position, top: -9999, left: -9999};
			setState(state => ({...state, initialized: true}));
		}
	}, [state.initialized]);
	useEffect(() => {
		if (!state.initialized) {
			return;
		}

		switch (statusRef.current.status) {
			case 'prepare': {
				if (targetEl == null || tooltipRef.current == null) {
					return;
				}
				const {
					top: targetElTop, bottom: targetElBottom, left: targetElLeft, right: targetElRight,
					width: targetElWidth, height: targetElHeight
				} = targetEl.getBoundingClientRect();
				let {width: tooltipWidth, height: tooltipHeight} = tooltipRef.current.getBoundingClientRect();
				const rtl = getComputedStyle(targetEl).direction === 'rtl';
				const triedPositions: Array<HxTooltipPosition> = [];
				let topOfReady = 0, leftOfReady = 0, topOfLocated = 0, leftOfLocated = 0;
				const computeLeftOnTopOrBottomSide = (position: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right') => {
					switch (position) {
						case 'top-left':
						case 'bottom-left': {
							if (rtl) {
								leftOfReady = targetElRight - tooltipWidth;
							} else {
								leftOfReady = targetElLeft;
							}
							break;
						}
						case 'top-right':
						case 'bottom-right': {
							if (rtl) {
								leftOfReady = targetElLeft;
							} else {
								leftOfReady = targetElRight - tooltipWidth;
							}
							break;
						}
						case 'top':
						case 'bottom':
						default: {
							leftOfReady = targetElLeft + targetElWidth / 2 - tooltipWidth / 2;
							break;
						}
					}
					leftOfLocated = leftOfReady;
				};
				const computeOnTopSide = (position: 'top' | 'top-left' | 'top-right') => {
					if (position !== 'top' && targetElWidth < HxTooltipDefaults.minTriggerSize) {
						// try top
						triedPositions.push(position);
						statusRef.current.position = 'top';
						return false;
					}
					tooltipHeight += HxTooltipDefaults.arrowSize;
					topOfReady = targetElTop - tooltipHeight - HxTooltipDefaults.animationGapSize;
					topOfLocated = topOfReady + HxTooltipDefaults.animationGapSize;
					if (!triedPositions.includes(position) && topOfLocated < HxTooltipDefaults.gapToEdge) {
						// never tried, check position and no enough room for tooltip
						// try bottom
						triedPositions.push(position);
						statusRef.current.position = position.replace('top', 'bottom') as 'bottom' | 'bottom-left' | 'bottom-right';
						return false;
					} else {
						computeLeftOnTopOrBottomSide(position);
						return true;
					}
				};
				const computeOnBottomSide = (position: 'bottom' | 'bottom-left' | 'bottom-right') => {
					if (position !== 'bottom' && targetElWidth < HxTooltipDefaults.minTriggerSize) {
						// try bottom
						triedPositions.push(position);
						statusRef.current.position = 'bottom';
						return false;
					}

					tooltipHeight += HxTooltipDefaults.arrowSize;
					topOfReady = targetElBottom + HxTooltipDefaults.animationGapSize;
					topOfLocated = targetElBottom;
					if (!triedPositions.includes(position)
						&& (topOfLocated + tooltipHeight + HxTooltipDefaults.gapToEdge) > (window.innerHeight || document.documentElement.clientHeight)) {
						// never tried, check position and no enough room for tooltip
						// try top
						triedPositions.push(position);
						statusRef.current.position = position.replace('bottom', 'top') as 'top' | 'top-left' | 'top-right';
						return false;
					} else {
						computeLeftOnTopOrBottomSide(position);
						return true;
					}
				};
				const computeTopOnLeftOrRightSide = (position: 'left' | 'left-top' | 'left-bottom' | 'right' | 'right-top' | 'right-bottom') => {
					switch (position) {
						case 'left-top':
						case 'right-top': {
							topOfReady = targetElTop;
							break;
						}
						case 'left-bottom':
						case 'right-bottom': {
							topOfReady = targetElBottom - tooltipHeight;
							break;
						}
						case 'left':
						case 'right':
						default: {
							topOfReady = targetElTop + targetElHeight / 2 - tooltipHeight / 2;
							break;
						}
					}
					topOfLocated = topOfReady;
				};
				const computeOnLeftSide = (position: 'left' | 'left-top' | 'left-bottom') => {
					if (position !== 'left' && targetElHeight < HxTooltipDefaults.minTriggerSize) {
						// try left
						triedPositions.push(position);
						statusRef.current.position = 'left';
						return false;
					}
					tooltipWidth += HxTooltipDefaults.arrowSize;
					if (rtl) {
						leftOfReady = targetElRight + HxTooltipDefaults.animationGapSize;
						leftOfLocated = targetElRight;
					} else {
						leftOfReady = targetElLeft - tooltipWidth - HxTooltipDefaults.animationGapSize;
						leftOfLocated = leftOfReady + HxTooltipDefaults.animationGapSize;
					}
					if (!triedPositions.includes(position)
						&& (rtl
							? (leftOfLocated + tooltipWidth + HxTooltipDefaults.gapToEdge > (window.innerWidth || document.documentElement.clientWidth))
							: (leftOfLocated < HxTooltipDefaults.gapToEdge))) {
						// never tried, check position and no enough room for tooltip
						// try right
						triedPositions.push(position);
						statusRef.current.position = position.replace('left', 'right') as 'right' | 'right-top' | 'right-bottom';
						return false;
					} else {
						computeTopOnLeftOrRightSide(position);
						return true;
					}
				};
				const computeOnRightSide = (position: 'right' | 'right-top' | 'right-bottom') => {
					if (position !== 'right' && targetElHeight < HxTooltipDefaults.minTriggerSize) {
						// try right
						triedPositions.push(position);
						statusRef.current.position = 'right';
						return false;
					}
					tooltipWidth += HxTooltipDefaults.arrowSize;
					if (rtl) {
						leftOfReady = targetElLeft - tooltipWidth - HxTooltipDefaults.animationGapSize;
						leftOfLocated = leftOfReady + HxTooltipDefaults.animationGapSize;
					} else {
						leftOfReady = targetElRight + HxTooltipDefaults.animationGapSize;
						leftOfLocated = targetElRight;
					}
					if (!triedPositions.includes(position)
						&& (rtl
							? (leftOfLocated < HxTooltipDefaults.gapToEdge)
							: (leftOfLocated + tooltipWidth + HxTooltipDefaults.gapToEdge > (window.innerWidth || document.documentElement.clientWidth)))) {
						// never tried, check position and no enough room for tooltip
						// try left
						triedPositions.push(position);
						statusRef.current.position = position.replace('right', 'left') as 'left' | 'left-top' | 'left-bottom';
						return false;
					} else {
						computeTopOnLeftOrRightSide(position);
						return true;
					}
				};

				// the tooltip width/height doesn't include arrow size now,
				// and in compute functions, they will be changed to include arrow size.
				// so for each round of computing, reset the tooltip width/height to origin
				const originTooltipWidth = tooltipWidth;
				const originTooltipHeight = tooltipHeight;
				while (true) {
					tooltipWidth = originTooltipWidth;
					tooltipHeight = originTooltipHeight;
					let located: boolean;
					switch (statusRef.current.position) {
						case 'bottom-left':
						case 'bottom-right':
						case 'bottom': {
							located = computeOnBottomSide(statusRef.current.position);
							break;
						}
						case 'left-top':
						case 'left-bottom':
						case 'left': {
							located = computeOnLeftSide(statusRef.current.position);
							break;
						}
						case 'right-top':
						case 'right-bottom':
						case 'right': {
							located = computeOnRightSide(statusRef.current.position);
							break;
						}
						case 'top-left':
						case 'top-right':
						case 'top': {
							located = computeOnTopSide(statusRef.current.position);
							break;
						}
						default: {
							located = computeOnTopSide('top');
							break;
						}
					}
					if (located) {
						break;
					}
				}
				// change status to ready, to trigger the rendered moving to start position, and show
				statusRef.current = {
					status: 'ready', position: statusRef.current.position,
					top: topOfReady, left: leftOfReady
				};
				const dom = tooltipRef.current;
				dom.style.setProperty('--hx-tooltip-top', `${topOfReady}px`);
				dom.style.setProperty('--hx-tooltip-left', `${leftOfReady}px`);
				dom.setAttribute('data-hx-tooltip-position', statusRef.current.position);
				dom.setAttribute('data-hx-tooltip-trigger-rtl', rtl ? 'rtl' : 'ltr');
				dom.setAttribute('data-hx-tooltip-status', 'ready');

				let hideTimeout: number | undefined = (void 0);
				requestAnimationFrame(() => {
					// change status to located, to trigger the rendered moving to proper position
					statusRef.current = {
						status: 'located', position: statusRef.current.position,
						top: topOfLocated, left: leftOfLocated
					};
					dom?.style.setProperty('--hx-tooltip-top', `${topOfLocated}px`);
					dom?.style.setProperty('--hx-tooltip-left', `${leftOfLocated}px`);
					dom?.setAttribute('data-hx-tooltip-status', 'located');

					hideTimeout = setTimeout(() => {
						statusRef.current = {status: 'hidden', position, top: -9999, left: -9999};
						dom?.style.setProperty('--hx-tooltip-top', `-9999px`);
						dom?.style.setProperty('--hx-tooltip-left', `-9999px`);
						dom?.setAttribute('data-hx-tooltip-status', 'hidden');
						tooltipContext.hide(handle);
					}, hideDelay);
				});

				// any scroll or resize, hide the tooltip
				const uninstall = DOMUtils.handleScrollResizeOfAncestors(targetEl, () => {
					tooltipContext.hide(handle);
				}, () => {
					tooltipContext.hide(handle);
				});

				return () => {
					if (hideTimeout != null) {
						clearTimeout(hideTimeout);
					}
					uninstall();
				};
			}
			case 'ready':
			case 'located':
			case 'hidden':
			default: {
				// do nothing
				break;
			}
		}
		// this effect will show the tooltip, and once enter this effect, cannot be rollback
		// unless initialize changed to true and status changed to prepare again
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.initialized]);

	if (!state.initialized || ['none', 'hidden'].includes(statusRef.current.status)) {
		return (void 0);
	}

	let tooltipContent;
	if (isValidElement(content)) {
		tooltipContent = DOMUtils.interposeToChildren({$model}, content);
	} else {
		const [isI18N, labelOrKey] = I18NUtils.isI18NKey(content);
		if (isI18N) {
			// no need to monitor language change, typically tooltip already hide before change language
			tooltipContent = context.language.get(labelOrKey) || content;
		} else {
			// not an i18n key, but "\~" leading is an escaped "~",
			// take the text with the escaping "\" removed
			tooltipContent = labelOrKey;
		}
	}

	const style: CSSProperties = {
		// @ts-expect-error ignore check
		'--hx-tooltip-top': `${statusRef.current.top}px`,
		'--hx-tooltip-left': `${statusRef.current.left}px`,
		'--hx-tooltip-min-trigger-size': `${HxTooltipDefaults.minTriggerSize}px`
	};

	return <div data-hx-portal-root=""
	            data-hx-theme={context.theme.currentForDOM()}
	            data-hx-language={context.language.current()}
	            style={{zIndex}}
	            ref={rootRef}>
		<div data-hx-tooltip="" data-hx-tooltip-handle={handle}
		     data-hx-tooltip-status={statusRef.current.status} data-hx-tooltip-position={statusRef.current.position}
		     style={style}
		     ref={tooltipRef}>
			<div data-hx-tooltip-content=""
			     data-hx-padding-x={HxTooltipDefaults.paddingX} data-hx-padding-y={HxTooltipDefaults.paddingY}>
				{tooltipContent}
			</div>
			<div data-hx-tooltip-arrow=""
			     style={{
				     // @ts-expect-error ignore check
				     '--hx-tooltip-arrow-size': `${HxTooltipDefaults.arrowSize}px`
			     }}/>
		</div>
	</div>;
};
