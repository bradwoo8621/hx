// @ts-expect-error import React
import React, {type MutableRefObject, useEffect, useRef} from 'react';
import {type HxOverlayInstanceInnerContext, useHxContext, useHxOverlayInstance} from '../../contexts';
import {BodyScrollLock, computeTransitionAndAnimation} from '../../utils';
import {HxOverlayDefaults} from './defaults';
import type {HxOverlayBackdropProps} from './types';

/**
 * Possible render states for overlay backdrop animation
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
	ref.current?.setAttribute('data-hx-overlay-state', 'hide');
	const {any, time} = computeTransitionAndAnimation(ref.current.nextElementSibling as HTMLElement);
	if (any) {
		setTimeout(() => {
			renderStateRef.current = 'hidden';
			ref.current?.setAttribute('data-hx-overlay-state', 'hidden');
			instanceContext.hideComplete();
		}, time);
	} else {
		renderStateRef.current = 'hidden';
		ref.current?.setAttribute('data-hx-overlay-state', 'hidden');
		instanceContext.hideComplete();
	}
};
/**
 * Overlay backdrop component
 * Renders a semi-transparent overlay behind overlay content that blocks interaction with the page
 * Handles smooth enter/exit animations using CSS transitions
 * Automatically locks body scroll when shown and unlocks when hidden
 * Follows ARIA accessibility guidelines for overlay backdrops
 */
export const HxOverlayBackdrop = (props: HxOverlayBackdropProps) => {
	const {
		role,
		hideOnClickBackdrop = HxOverlayDefaults.hideOnClickBackdrop, hideOnEscape = HxOverlayDefaults.hideOnEscape
	} = props;

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
			ref.current?.setAttribute('data-hx-overlay-state', 'prepare');
			requestAnimationFrame(() => {
				renderStateRef.current = 'active';
				ref.current?.setAttribute('data-hx-overlay-state', 'active');
			});
		}
	}, []);

	/**
	 * Handle backdrop exit animation when hide event is received
	 * Listens for transitionend event on the overlay content element before marking hide as complete
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
	 * Prevents scrolling of underlying page content while overlay is open
	 */
	useEffect(() => {
		if (['toast-tl', 'toast-tr', 'toast-br', 'toast-bl'].includes(role)) {
			return;
		}

		BodyScrollLock.lock();

		return () => {
			BodyScrollLock.unlock();
		};
	}, [role]);
	useEffect(() => {
		if (!hideOnEscape) {
			return;
		}

		const div = ref.current?.nextElementSibling as HTMLElement | null;
		const onKeyDown = (ev: KeyboardEvent) => {
			switch (ev.key) {
				case 'Escape': {
					doHide(ref, renderStateRef, instanceContext);
					ev.preventDefault();
					break;
				}
			}
		};
		div?.addEventListener('keydown', onKeyDown);

		return () => {
			div?.removeEventListener('keydown', onKeyDown);
		};
	}, [hideOnEscape, instanceContext]);

	const onBackdropClick = () => {
		if (!hideOnClickBackdrop) {
			return;
		}

		doHide(ref, renderStateRef, instanceContext);
	};

	return <div onClick={onBackdropClick}
	            data-hx-overlay-backdrop="" role={`overlay-${role}-backdrop`}
		// eslint-disable-next-line react-hooks/refs
		        data-hx-overlay-state={renderStateRef.current}
		        ref={ref}/>;
};
