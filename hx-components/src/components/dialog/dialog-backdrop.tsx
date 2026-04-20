// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {useHxContext, useHxOverlayInstance} from '../../contexts';
import {BodyScrollLock} from '../../utils';

type RenderState = 'hidden' | 'prepare' | 'active' | 'hide';

export const HxDialogBackdrop = () => {
	const context = useHxContext();
	const instanceContext = useHxOverlayInstance();
	const ref = useRef<HTMLDivElement | null>(null);
	const renderStateRef = useRef<RenderState>('hidden');

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
	useEffect(() => {
		const onHide = () => {
			renderStateRef.current = 'hide';
			ref.current?.nextElementSibling?.addEventListener('transitionend', () => {
				renderStateRef.current = 'hidden';
				ref.current?.setAttribute('data-hx-dialog-state', 'hidden');
				instanceContext.hideComplete();
			}, {once: true});
			ref.current?.setAttribute('data-hx-dialog-state', 'hide');
		};
		instanceContext.onHide(onHide);

		return () => {
			instanceContext.offHide(onHide);
		};
	}, [context, instanceContext]);
	useEffect(() => {
		BodyScrollLock.lock();
		return () => {
			BodyScrollLock.unlock();
		};
	}, []);

	return <div data-hx-dialog-backdrop="" role="dialog-backdrop"
		// eslint-disable-next-line react-hooks/refs
		        data-hx-dialog-state={renderStateRef.current}
		        ref={ref}/>;
};
