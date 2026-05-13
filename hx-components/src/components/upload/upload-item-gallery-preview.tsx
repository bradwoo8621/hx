// @ts-expect-error import React
import React, {type MutableRefObject, type RefObject, useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {useHxContext} from '../../contexts';
import type {HxAbsolutePosition} from '../../types';
import {BodyScrollLock} from '../../utils';
import {HxButton} from '../button';
import {HxButtonBar} from '../button-bar';
import {Close, ZoomIn, ZoomOut} from '../icons';
import {HxUploadDefaults} from './defaults';

export interface UploadItemGalleryPreviewProps {
	bytesRef: MutableRefObject<Uint8Array<ArrayBuffer> | null>;
	triggerRect: HxAbsolutePosition;
	triggerRef: RefObject<HTMLDivElement>;
	onClose: () => void;
}

/**
 * Possible render states for preview backdrop animation
 * - hidden: Backdrop is not visible
 * - prepare: Initial state before animation starts (enables transition to work)
 * - active: Backdrop is fully visible and interactive
 * - hide: Backdrop is in the process of being hidden (transitioning out)
 */
type RenderState = 'prepare' | 'active' | 'hide';

export const UploadItemGalleryPreview = (props: UploadItemGalleryPreviewProps) => {
	const {
		// bytesRef,
		triggerRect, triggerRef,
		onClose
	} = props;

	const context = useHxContext();
	const rootRef = useRef<HTMLDivElement | null>(null);
	const backdropRef = useRef<HTMLDivElement | null>(null);
	/** Tracks current animation state of the backdrop */
	const renderStateRef = useRef<RenderState>('prepare');
	useEffect(() => {
		if (renderStateRef.current === 'prepare') {
			renderStateRef.current = 'active';
			backdropRef.current?.setAttribute('data-hx-upload-preview-state', 'active');
		}
	}, []);
	useEffect(() => {
		BodyScrollLock.lock();

		return () => {
			BodyScrollLock.unlock();
		};
	}, []);

	const onCloseClick = () => {
		const {top, left, width, height} = triggerRef.current!.getBoundingClientRect();
		rootRef.current!.style.setProperty('--upload-preview-backdrop-top', `${top}px`);
		rootRef.current!.style.setProperty('--upload-preview-backdrop-left', `${left}px`);
		rootRef.current!.style.setProperty('--upload-preview-backdrop-width', `${width}px`);
		rootRef.current!.style.setProperty('--upload-preview-backdrop-height', `${height}px`);
		requestAnimationFrame(() => {
			renderStateRef.current = 'hide';
			backdropRef.current?.addEventListener('transitionend', () => {
				rootRef.current!.style.display = 'none';
				onClose();
			}, {once: true});
			backdropRef.current?.setAttribute('data-hx-upload-preview-state', 'hide');
		});
	};

	const rootStyle = {
		zIndex: HxUploadDefaults.previewZIndex,
		'--upload-preview-backdrop-top': `${triggerRect.top}px`,
		'--upload-preview-backdrop-left': `${triggerRect.left}px`,
		'--upload-preview-backdrop-width': `${triggerRect.width}px`,
		'--upload-preview-backdrop-height': `${triggerRect.height}px`
	};

	return createPortal(
		<div data-hx-portal-root=""
		     data-hx-theme={context.theme.current()} data-hx-language={context.language.current()}
		     style={rootStyle} ref={rootRef}>
			<div data-hx-upload-preview-backdrop=""
				// eslint-disable-next-line react-hooks/refs
				 data-hx-upload-preview-state={renderStateRef.current}
				 ref={backdropRef}/>
			<div data-hx-upload-preview-content="">
				<div data-hx-upload-preview-rect="">

				</div>
				<HxButtonBar leading={<>
					<HxButton text={<ZoomOut/>} variant="ghost"/>
					<HxButton text={<ZoomIn/>} variant="ghost"/>
				</>} tailing={<HxButton text={<Close/>} variant="ghost" onClick={onCloseClick}/>}
				             data-hx-upload-preview-action=""/>
			</div>
		</div>,
		document.body);
};
