// @ts-expect-error import React
import React, {type CSSProperties, isValidElement, useEffect, useRef, useState} from 'react';
import type {HxTooltipInstanceHandle, HxTooltipPosition} from '../../types';
import {DOMUtils, I18NUtils} from '../../utils';
import {useHxContext} from '../context';
import type {HxTooltipShowOptions} from './context';
import {HxTooltipDefaults} from './defaults';

interface HxTooltipState {
	handle: HxTooltipInstanceHandle;
	initialized: boolean;
}

interface HxTooltipStatusRef {
	status: 'prepare' | 'ready' | 'located';
	position: HxTooltipPosition;
	top: number;
	left: number;
}

export const HxTooltip = <T extends object>(props: HxTooltipShowOptions<T> & { handle: HxTooltipInstanceHandle }) => {
	const {handle, props: {content, position = 'top'}, $model, targetEl} = props;

	const context = useHxContext();
	const [state, setState] = useState<HxTooltipState>({handle, initialized: false});
	const rootRef = useRef<HTMLDivElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const arrowRef = useRef<HTMLDivElement>(null);
	const statusRef = useRef<HxTooltipStatusRef>({status: 'prepare', position, top: -9999, left: -9999});

	useEffect(() => {
		if (state.handle !== handle) {
			// change initialized to false, to trigger the rendered removing
			statusRef.current = {status: 'prepare', position, top: -9999, left: -9999};
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
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					top: targetElTop, bottom: _targetElBottom, left: targetElLeft, right: _targetElRight,
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					width: targetElWidth, height: _targetElHeight
				} = targetEl.getBoundingClientRect();
				// eslint-disable-next-line prefer-const
				let {width: tooltipWidth, height: tooltipHeight} = tooltipRef.current.getBoundingClientRect();
				let topOfReady = 0, leftOfReady = 0, topOfLocated = 0, leftOfLocated = 0;
				while (true) {
					// eslint-disable-next-line no-useless-assignment
					let located = false;
					switch (statusRef.current.position) {
						case 'top':
						default: {
							tooltipHeight += HxTooltipDefaults.arrowSize;
							topOfReady = targetElTop - tooltipHeight - HxTooltipDefaults.animationGapSize;
							topOfLocated = topOfReady + HxTooltipDefaults.animationGapSize;
							leftOfReady = targetElLeft + targetElWidth / 2 - tooltipWidth / 2;
							leftOfLocated = leftOfReady;
							located = true;
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
				arrowRef.current?.setAttribute('data-hx-tooltip-position', statusRef.current.position);
				const dom = tooltipRef.current;
				dom.style.setProperty('--hx-tooltip-top', `${topOfReady}px`);
				dom.style.setProperty('--hx-tooltip-left', `${leftOfReady}px`);
				dom.setAttribute('data-hx-tooltip-status', 'ready');

				let retryTime = 0;
				const toLocated = () => {
					if (retryTime < 5) {
						const {top, left} = dom.getBoundingClientRect();
						if (Math.abs(topOfReady - top) > 2 || Math.abs(leftOfReady - left) > 2) {
							retryTime += 1;
							setTimeout(toLocated, 10);
							return;
						}
					}
					// change status to located, to trigger the rendered moving to proper position
					statusRef.current = {
						status: 'located', position: statusRef.current.position,
						top: topOfLocated, left: leftOfLocated
					};
					dom.style.setProperty('--hx-tooltip-top', `${topOfLocated}px`);
					dom.style.setProperty('--hx-tooltip-left', `${leftOfLocated}px`);
					dom.setAttribute('data-hx-tooltip-status', 'located');
				};
				setTimeout(toLocated, 10);
				break;
			}
			case 'ready':
			case 'located':
			default: {
				// do nothing
				break;
			}
		}
	}, [position, state.initialized, targetEl]);

	if (!state.initialized) {
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
		// eslint-disable-next-line react-hooks/refs
		'--hx-tooltip-top': `${statusRef.current.top}px`,
		// eslint-disable-next-line react-hooks/refs
		'--hx-tooltip-left': `${statusRef.current.left}px`
	};

	return <div data-hx-portal-root=""
	            data-hx-theme={context.theme.current()}
	            data-hx-language={context.language.current()}
	            style={{zIndex: HxTooltipDefaults.zIndex}}
	            ref={rootRef}>
		{/* eslint-disable-next-line react-hooks/refs */}
		<div data-hx-tooltip="" data-hx-tooltip-handle={handle} data-hx-tooltip-status={statusRef.current.status}
		     style={style}
		     ref={tooltipRef}>
			<div data-hx-tooltip-content=""
			     data-hx-padding-x={HxTooltipDefaults.paddingX} data-hx-padding-y={HxTooltipDefaults.paddingY}>
				{tooltipContent}
			</div>
			{/* eslint-disable-next-line react-hooks/refs */}
			<div data-hx-tooltip-arrow="" data-hx-tooltip-position={statusRef.current.position}
				// @ts-expect-error ignore check
				 style={{'--hx-tooltip-arrow-size': `${HxTooltipDefaults.arrowSize}px`}}
				 ref={arrowRef}/>
		</div>
	</div>;
};
