// @ts-expect-error import React
import React, {type MutableRefObject, type RefObject, useEffect, useRef, useState} from 'react';
import {useHxContext} from '../../contexts';
import type {HxAbsolutePosition} from '../../types';
import {HxConsole} from '../../utils';
import {HxButton} from '../button';
import {Download, EyeOpen, FileText, Trash, Update, Upload} from '../icons';
import {HxLabel} from '../label';
import type {HxUploadingFile} from './types';
import type {HxUploadedFile} from './upload-item';
import {UploadItemGalleryPreview, type UploadItemGalleryPreviewBytes} from './upload-item-gallery-preview';
import {isImage, releaseImage, toImageSrc} from './utils';

export interface UploadItemGalleryProps {
	file: HxUploadingFile | HxUploadedFile;
	onUpload: () => void;
	onDelete: () => void;
	onDownload: (bytes?: Uint8Array<ArrayBuffer>) => void;
	onPreview?: () => Promise<Uint8Array<ArrayBuffer> | undefined>;
	onThumbnail?: () => Promise<Uint8Array<ArrayBuffer> | undefined>;
	bytesRef: MutableRefObject<Uint8Array<ArrayBuffer> | null>;
	percentageRef: RefObject<HTMLDivElement>;
	isUploading: boolean;
	hasUploadError: boolean;
	errorMessage?: string;
	disabled: boolean;
}

interface UploadItemGalleryPreviewState {
	visible: boolean;
	rect: Required<HxAbsolutePosition>;
}

// render image thumbnail from raw bytes, or a generic file icon for non-image files
const asImageOrIcon = (bytesCacheRef: MutableRefObject<UploadItemGalleryPreviewBytes>) => {
	if (bytesCacheRef.current.checked == null) {
		bytesCacheRef.current.checked = isImage(bytesCacheRef.current.thumbnail);
		if (bytesCacheRef.current.checked === false) {
			return <HxLabel text={<FileText/>}/>;
		} else {
			// @ts-expect-error ignore parameter type check
			bytesCacheRef.current.thumbnailUrl = toImageSrc(bytesCacheRef.current.thumbnail!, bytesCacheRef.current.checked.toLowerCase());
			return <img src={bytesCacheRef.current.thumbnailUrl} alt=""/>;
		}
	} else if (bytesCacheRef.current.thumbnailUrl == null) {
		return <HxLabel text={<FileText/>}/>;
	} else {
		return <img src={bytesCacheRef.current.thumbnailUrl} alt=""/>;
	}
};

export const UploadItemGallery = (props: UploadItemGalleryProps) => {
	const {
		file,
		onUpload, onDelete, onDownload, onPreview, onThumbnail,
		bytesRef, percentageRef,
		isUploading, hasUploadError, errorMessage: givenErrorMessage,
		disabled
	} = props;

	const context = useHxContext();
	const ref = useRef<HTMLDivElement | null>(null);
	const bytesCacheRef = useRef<UploadItemGalleryPreviewBytes>({
		// eslint-disable-next-line react-hooks/refs
		thumbnail: bytesRef.current ?? (void 0),
		// eslint-disable-next-line react-hooks/refs
		full: bytesRef.current ?? (void 0)
	});
	const [preview, setPreview] = useState<UploadItemGalleryPreviewState>({
		visible: false,
		rect: {top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0}
	});
	useEffect(() => {
		// load thumbnail when bytes not provided
		if (onThumbnail == null) {
			return;
		}

		if (bytesCacheRef.current.thumbnail == null) {
			(async () => {
				let bytes: Uint8Array<ArrayBuffer> | undefined = (void 0);
				try {
					bytes = await onThumbnail();
				} catch (e) {
					// ignore exception
					HxConsole.warn('Failed to get image thumbnail.', e);
				}
				if (bytes != null) {
					delete bytesCacheRef.current.checked;
					bytesCacheRef.current.thumbnail = bytes;
					context.forceUpdate();
				} else if (onPreview != null) {
					try {
						bytes = await onPreview();
					} catch (e) {
						// ignore exception
						HxConsole.warn('Failed to get image preview.', e);
					}
					if (bytes != null) {
						delete bytesCacheRef.current.checked;
						bytesCacheRef.current.thumbnail = bytes;
						bytesCacheRef.current.full = bytes;
						context.forceUpdate();
					}
				}
			})();
		}
	}, [context, onPreview, onThumbnail]);
	useEffect(() => {
		// clear the url cache
		const bytesCache = bytesCacheRef;
		return () => {
			if (!bytesCache.current.checked) {
				return;
			}

			if (bytesCache.current.thumbnailUrl != null) {
				if (bytesCache.current.thumbnailUrl == bytesCache.current.fullUrl) {
					delete bytesCache.current.fullUrl;
				}
				releaseImage(bytesCache.current.thumbnailUrl);
			}
			if (bytesCache.current.fullUrl != null) {
				releaseImage(bytesCache.current.fullUrl);
			}
		};
	}, []);

	const onPreviewClick = () => {
		if (ref.current == null) {
			return;
		}

		const {top, left, bottom, right, width, height} = ref.current.getBoundingClientRect();
		setPreview({visible: true, rect: {top, left, bottom, right, width, height}});
	};
	const onPreviewClose = () => {
		setPreview({visible: false, rect: {top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0}});
	};
	const onDownloadClick = () => {
		onDownload(bytesCacheRef.current.full);
	};

	let errorMessage = givenErrorMessage;
	if (errorMessage != null && !['~HxCommon.UploadOverMaxSize', '~HxCommon.UploadNotAcceptable', '~HxCommon.UploadError'].includes(errorMessage)) {
		// simplify custom error messages to a generic label in gallery mode (limited space)
		errorMessage = '~HxCommon.UploadError';
	}

	return <div data-hx-upload-file=""
	            data-hx-upload-file-error={hasUploadError ? '' : (void 0)}
	            ref={ref}>
		{isUploading
			? <>
				<HxLabel text={<>
					<HxLabel text={<Update data-hx-svg-icon-animation="spin" data-hx-upload-file-uploading=""/>}/>
					<HxButton text={<Trash/>} variant="ghost" color="danger" onClick={onDelete}/>
				</>} data-hx-upload-file-action="uploading"/>
				{(file as HxUploadingFile).percentageSupport
					? <div data-hx-upload-file-percentage="" ref={percentageRef}/>
					: (void 0)}
			</>
			: (hasUploadError
				? <>
					<HxLabel text={errorMessage} data-hx-upload-file-error-msg="" data-hx-label-check-msg=""/>
					<HxLabel text={<>
						<HxButton variant="ghost" text={<Upload/>} onClick={onUpload}/>
						<HxButton variant="ghost" text={<Trash/>} color="danger" onClick={onDelete}/>
					</>} data-hx-upload-file-action="upload-failed"/>
				</>
				: <>
					{/* thumbnail preview, works on images only. or show corresponding icons of the mime type? */}
					<div data-hx-upload-file-thumbnail="">
						{asImageOrIcon(bytesCacheRef)}
					</div>
					{preview.visible
						?
						<UploadItemGalleryPreview onPreview={onPreview} onDownload={onDownload} bytesRef={bytesCacheRef}
						                          triggerRect={preview.rect} triggerRef={ref}
						                          onClose={onPreviewClose}/>
						: (void 0)}
					<HxLabel text={<>
						{/* eslint-disable-next-line react-hooks/refs */}
						{bytesCacheRef.current.checked
							? <HxButton text={<EyeOpen/>} variant="ghost" $disabled={disabled}
							            onClick={onPreviewClick}/>
							: <HxButton variant="ghost" text={<Download/>} $disabled={disabled}
							            onClick={onDownloadClick}/>}
						<HxButton text={<Trash/>} variant="ghost" color="danger" $disabled={disabled}
						          onClick={onDelete}/>
					</>} data-hx-upload-file-action="uploaded"/>
				</>)}
	</div>;
};
