// @ts-expect-error import React
import React, {type MutableRefObject, useEffect, useRef} from 'react';
import {type HxOverlayInstanceInnerContext, useHxContext, useHxOverlayInstance} from '../../contexts';
import {BodyScrollLock, computeTransitionAndAnimation} from '../../utils';
import type {HxAlertBackdropProps} from './types';

/**
 * Possible render states for alert backdrop animation
 * - hidden: Backdrop is not visible
 * - prepare: Initial state before animation starts (enables transition to work)
 * - active: Backdrop is fully visible and interactive
 * - hide: Backdrop is in the process of being hidden (transitioning out)
 */
type RenderState = 'hidden' | 'prepare' | 'active' | 'hide';

const doHide = (
	ref: MutableRefObject<HTMLDivElement | null>,
	renderStateRef: MutableRefObject<RenderState>,
	instanceContext: HxOverlayInstanceInnerContext
) => {
	if (ref.current == null || ref.current.nextElementSibling == null) {
		return;
	}

	renderStateRef.current = 'hide';
	ref.current?.setAttribute('data-hx-alert-state', 'hide');
	const {any, time} = computeTransitionAndAnimation(ref.current.nextElementSibling as HTMLElement);
	if (any) {
		setTimeout(() => {
			renderStateRef.current = 'hidden';
			ref.current?.setAttribute('data-hx-alert-state', 'hidden');
			instanceContext.hideComplete();
		}, time);
	} else {
		renderStateRef.current = 'hidden';
		ref.current?.setAttribute('data-hx-alert-state', 'hidden');
		instanceContext.hideComplete();
	}
};
/**
 * Alert backdrop component
 * Renders a semi-transparent overlay behind alert content that blocks interaction with the page
 * Handles smooth enter/exit animations using CSS transitions
 * Automatically locks body scroll when shown and unlocks when hidden
 * Follows ARIA accessibility guidelines for alert backdrops
 */
export const HxAlertBackdrop = (props: HxAlertBackdropProps) => {
	const {defaultHide} = props;

	const context = useHxContext();
	const instanceContext = useHxOverlayInstance();
	const ref = useRef<HTMLDivElement | null>(null);
	/** Tracks current animation state of the backdrop */
	const renderStateRef = useRef<RenderState>('hidden');

	/**
	 * Handle backdrop enter animation when component mounts
	 * Uses requestAnimationFrame to ensure prepare state is applied before activating transition
	 */
	useEffect(() => {
		if (renderStateRef.current === 'hidden') {
			renderStateRef.current = 'prepare';
			ref.current?.setAttribute('data-hx-alert-state', 'prepare');
			requestAnimationFrame(() => {
				renderStateRef.current = 'active';
				ref.current?.setAttribute('data-hx-alert-state', 'active');
			});
		}
	}, []);

	/**
	 * Handle backdrop exit animation when hide event is received
	 * Listens for transitionend event on the alert content element before marking hide as complete
	 * Notifies overlay instance when hide animation is fully finished
	 */
	useEffect(() => {
		const onHide = () => {
			doHide(ref, renderStateRef, instanceContext);
		};
		instanceContext.onHide(onHide);

		return () => {
			instanceContext.offHide(onHide);
		};
	}, [context, instanceContext]);

	/**
	 * Lock body scroll when backdrop is mounted, unlock when unmounted
	 * Prevents scrolling of underlying page content while alert is open
	 */
	useEffect(() => {
		BodyScrollLock.lock();

		return () => {
			BodyScrollLock.unlock();
		};
	}, []);

	const onBackdropClick = () => {
		if (!defaultHide) {
			return;
		}

		doHide(ref, renderStateRef, instanceContext);
	};

	return <div onClick={onBackdropClick}
	            data-hx-alert-backdrop="" role="alert-backdrop"
		// eslint-disable-next-line react-hooks/refs
		        data-hx-alert-state={renderStateRef.current}
		        ref={ref}/>;
};
