// @ts-expect-error import React
import React, {type MutableRefObject, useEffect, useRef} from 'react';
import {BodyScrollLock, DOMUtils, HxConsole} from '../../utils';
import {type HxOverlayInternalContext, useHxOverlayInternalContext} from './overlay-internal-context';
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
	internalContext: HxOverlayInternalContext
) => {
	if (ref.current == null || ref.current.nextElementSibling == null) {
		return;
	}

	DOMUtils.safeOnTransitionOrAnimationEnd(ref.current.nextElementSibling as HTMLElement, () => {
		renderStateRef.current = 'hidden';
		ref.current?.setAttribute('data-hx-overlay-state', 'hidden');
		internalContext.hideComplete();
	});
	renderStateRef.current = 'hide';
	ref.current?.setAttribute('data-hx-overlay-state', 'hide');
};

/**
 * Overlay backdrop component.
 * Renders a semi-transparent overlay behind overlay content that blocks interaction with the page.
 * Handles smooth enter/exit animations using CSS transitions.
 * Automatically locks body scroll when shown and unlocks when hidden.
 * Follows ARIA accessibility guidelines for overlay backdrops.
 */
export const HxOverlayBackdrop = (props: HxOverlayBackdropProps) => {
	const {role} = props;

	const internalContext = useHxOverlayInternalContext();
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
			window.requestAnimationFrame(() => {
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
			if (renderStateRef.current === 'prepare') {
				HxConsole.warn('DO NOT call hide during overlay preparing stage, it needs time.');
				return;
			}
			if (renderStateRef.current !== 'active') {
				return;
			}
			doHide(ref, renderStateRef, internalContext);
		};
		internalContext.onHide(onHide);

		return () => {
			internalContext.offHide(onHide);
		};
	}, [internalContext]);

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

	return <div data-hx-overlay-backdrop="" role={`overlay-${role}-backdrop`} tabIndex={-1}
		// eslint-disable-next-line react-hooks/refs
		        data-hx-overlay-state={renderStateRef.current}
		        ref={ref}/>;
};
