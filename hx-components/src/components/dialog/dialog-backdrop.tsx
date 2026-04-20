// @ts-expect-error import React
import React, {type MutableRefObject, useEffect, useRef} from 'react';
import {type HxOverlayInstanceInnerContext, useHxContext, useHxOverlayInstance} from '../../contexts';
import {BodyScrollLock, computeTransitionAndAnimation} from '../../utils';
import type {HxDialogBackdropProps} from './types';

/**
 * Possible render states for dialog backdrop animation
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
	ref.current?.setAttribute('data-hx-dialog-state', 'hide');
	const {any, time} = computeTransitionAndAnimation(ref.current.nextElementSibling as HTMLElement);
	if (any) {
		setTimeout(() => {
			renderStateRef.current = 'hidden';
			ref.current?.setAttribute('data-hx-dialog-state', 'hidden');
			instanceContext.hideComplete();
		}, time);
	} else {
		renderStateRef.current = 'hidden';
		ref.current?.setAttribute('data-hx-dialog-state', 'hidden');
		instanceContext.hideComplete();
	}
};
/**
 * Dialog backdrop component
 * Renders a semi-transparent overlay behind dialog content that blocks interaction with the page
 * Handles smooth enter/exit animations using CSS transitions
 * Automatically locks body scroll when shown and unlocks when hidden
 * Follows ARIA accessibility guidelines for dialog backdrops
 */
export const HxDialogBackdrop = (props: HxDialogBackdropProps) => {
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
			ref.current?.setAttribute('data-hx-dialog-state', 'prepare');
			requestAnimationFrame(() => {
				renderStateRef.current = 'active';
				ref.current?.setAttribute('data-hx-dialog-state', 'active');
			});
		}
	}, []);

	/**
	 * Handle backdrop exit animation when hide event is received
	 * Listens for transitionend event on the dialog content element before marking hide as complete
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
	 * Prevents scrolling of underlying page content while dialog is open
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
	            data-hx-dialog-backdrop="" role="dialog-backdrop"
		// eslint-disable-next-line react-hooks/refs
		        data-hx-dialog-state={renderStateRef.current}
		        ref={ref}/>;
};
