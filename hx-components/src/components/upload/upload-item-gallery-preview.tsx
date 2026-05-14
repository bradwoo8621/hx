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
import type {HxUploadImageType} from './types';
import {isImage, toImageSrc} from './utils.ts';

export interface UploadItemGalleryPreviewBytes {
	/**
	 * - unchecked: undefined,
	 * - checked and not image: false,
	 * - is image: HxUploadImageType
	 */
	checked?: HxUploadImageType | false;
	thumbnail?: Uint8Array<ArrayBuffer>;
	thumbnailUrl?: string;
	full?: Uint8Array<ArrayBuffer>;
	fullUrl?: string;
}

export interface UploadItemGalleryPreviewProps {
	bytesRef: MutableRefObject<UploadItemGalleryPreviewBytes>;
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

const asImage = (bytesRef: MutableRefObject<UploadItemGalleryPreviewBytes>) => {
	if (bytesRef.current.fullUrl != null) {
		return <img src={bytesRef.current.fullUrl} alt=""/>;
	}
	if (bytesRef.current.full == null) {
		// image bytes not loaded
		return (void 0);
	}
	// typically never happen, since the checked will be assigned in thumbnail outside
	// anyway, check it if it is not assigned
	if (bytesRef.current.checked == null) {
		bytesRef.current.checked = isImage(bytesRef.current.full);
	}
	if (bytesRef.current.checked) {
		// @ts-expect-error ignore parameter type check
		bytesRef.current.fullUrl = toImageSrc(bytesRef.current.full, bytesRef.current.checked.toLowerCase());
		return <img src={bytesRef.current.fullUrl} alt=""/>;
	}
	return (void 0);
};

export const UploadItemGalleryPreview = (props: UploadItemGalleryPreviewProps) => {
	const {
		bytesRef,
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

	const onZoomOutClick = () => {
		if (rootRef.current == null) {
			return;
		}
		const size = Math.max(0.2, parseFloat(rootRef.current.style.getPropertyValue('--upload-preview-image-ratio') || '1'));
		rootRef.current?.style.setProperty('--upload-preview-image-ratio', `${size - 0.1}`);
	};
	// no upper bound intentionally — the image container uses overflow:auto,
	// so zooming in enables natural scroll rather than breaking layout
	const onZoomInClick = () => {
		if (rootRef.current == null) {
			return;
		}
		const size = parseFloat(rootRef.current.style.getPropertyValue('--upload-preview-image-ratio') || '1');
		rootRef.current?.style.setProperty('--upload-preview-image-ratio', `${size + 0.1}`);
	};
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
		'--upload-preview-backdrop-height': `${triggerRect.height}px`,
		'--upload-preview-image-ratio': '1'
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
					<div>{asImage(bytesRef)}</div>
				</div>
				<HxButtonBar leading={<>
					<HxButton text={<ZoomOut/>} variant="ghost" onClick={onZoomOutClick}/>
					<HxButton text={<ZoomIn/>} variant="ghost" onClick={onZoomInClick}/>
				</>} tailing={<HxButton text={<Close/>} variant="ghost" onClick={onCloseClick}/>}
				             data-hx-upload-preview-action=""/>
			</div>
		</div>,
		document.body);
};
