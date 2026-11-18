import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type MutableRefObject, type RefObject, useEffect, useRef, useState} from 'react';
import {type HxContext, useHxContext} from '../../contexts';
import {useFuncResultRef} from '../../hooks';
import type {HxAbsolutePosition, HxComponentDataProps} from '../../types';
import {HxConsole} from '../../utils';
import {HxButton} from '../button';
import {Download, EyeOpen, FileText, Trash, Update, Upload} from '../icons';
import {HxLabel} from '../label';
import {HxUploadDefaults} from './defaults';
import type {HxUploadedFile, HxUploadingFile, HxUploadPreviewFileFunc, HxUploadThumbnailFileFunc} from './types';
import {UploadItemGalleryPreview, type UploadItemGalleryPreviewBytes} from './upload-item-gallery-preview';
import {isImage, releaseImage, toImageSrc} from './utils';

export interface UploadItemGalleryProps<T extends object> extends HxComponentDataProps<T> {
	file: HxUploadingFile | HxUploadedFile;
	onUpload: () => void;
	onDelete: () => void;
	onDownload: (bytes?: Uint8Array<ArrayBuffer>) => void;
	onPreview?: HxUploadPreviewFileFunc<T>;
	onThumbnail?: HxUploadThumbnailFileFunc<T>;
	bytesRef: MutableRefObject<Uint8Array<ArrayBuffer> | null>;
	percentageRef: RefObject<HTMLDivElement>;
	isUploading: boolean;
	hasUploadError: boolean;
	errorMessage?: string;
	disabled: boolean;
}

interface UploadItemGalleryPreviewState {
	visible: boolean;
	rect: Required<HxAbsolutePosition> & { ltr: boolean };
}

// render image thumbnail from raw bytes, or a generic file icon for non-image files
const asImageOrIcon = (bytesCacheRef: MutableRefObject<UploadItemGalleryPreviewBytes>) => {
	if (bytesCacheRef.current.checked == null) {
		bytesCacheRef.current.checked = isImage(bytesCacheRef.current.thumbnail);
		if (bytesCacheRef.current.checked === false) {
			return <HxLabel text={<FileText/>} data-hx-upload-file-icon=""/>;
		} else {
			// @ts-expect-error ignore parameter type check
			bytesCacheRef.current.thumbnailUrl = toImageSrc(bytesCacheRef.current.thumbnail!, bytesCacheRef.current.checked.toLowerCase());
			return <img src={bytesCacheRef.current.thumbnailUrl} alt="" data-hx-upload-file-image=""/>;
		}
	} else if (bytesCacheRef.current.thumbnailUrl == null) {
		return <HxLabel text={<FileText/>} data-hx-upload-file-icon=""/>;
	} else {
		return <img src={bytesCacheRef.current.thumbnailUrl} alt="" data-hx-upload-file-image=""/>;
	}
};

interface UploadItemGalleryPreviewFuncs {
	onPreview: () => Promise<Uint8Array<ArrayBuffer> | undefined>;
	onThumbnail: () => Promise<Uint8Array<ArrayBuffer> | undefined>;
}

const createThumbnailAndPreviewFuncs =
	<T extends object>(options: Pick<UploadItemGalleryProps<T>, '$model' | 'file' | 'onPreview' | 'onThumbnail'>, context: HxContext): UploadItemGalleryPreviewFuncs => {
		const {$model, file, onPreview, onThumbnail} = options;
		return {
			onPreview: async () => {
				if (onPreview != null) {
					return await onPreview(file.details, $model, context);
				} else {
					return (void 0);
				}
			},
			onThumbnail: async () => {
				if (onThumbnail != null) {
					return await onThumbnail(file.details, $model, context);
				} else {
					return (void 0);
				}
			}
		};
	};

const loadThumbnail = async (
	bytesCacheRef: MutableRefObject<UploadItemGalleryPreviewBytes & UploadItemGalleryPreviewFuncs>,
	context: HxContext
): Promise<void> => {
	if (bytesCacheRef.current.thumbnail == null) {
		let toThumbnailOnly = true;

		let bytes: Uint8Array<ArrayBuffer> | undefined = (void 0);
		try {
			bytes = await bytesCacheRef.current.onThumbnail();
		} catch (e) {
			// ignore exception
			HxConsole.warn('Failed to get image thumbnail.', e);
		}

		if (bytes == null) {
			// load by onThumbnail failed
			toThumbnailOnly = false;
			try {
				bytes = await bytesCacheRef.current.onPreview();
			} catch (e) {
				// ignore exception
				HxConsole.warn('Failed to get image preview.', e);
			}
		}

		if (bytes != null) {
			delete bytesCacheRef.current.checked;
			bytesCacheRef.current.thumbnail = bytes;
			if (!toThumbnailOnly) {
				bytesCacheRef.current.full = bytes;
			}
			context.forceUpdate();
		}
	}
};

export const UploadItemGallery = <T extends object>(props: UploadItemGalleryProps<T>) => {
	const {
		$model, file,
		onUpload, onDelete, onDownload, onPreview, onThumbnail,
		bytesRef, percentageRef,
		isUploading, hasUploadError, errorMessage: givenErrorMessage,
		disabled
	} = props;

	const context = useHxContext();
	const ref = useRef<HTMLDivElement | null>(null);
	const bytesCacheRef = useFuncResultRef<UploadItemGalleryPreviewBytes & UploadItemGalleryPreviewFuncs>(() => {
		const thumbnail = bytesRef.current ?? (void 0);
		const full = bytesRef.current ?? (void 0);
		const {onPreview: onPreviewFunc, onThumbnail: onThumbnailFunc} = createThumbnailAndPreviewFuncs({
			$model, file, onPreview, onThumbnail
		}, context);
		return {
			thumbnail, full,
			onPreview: onPreviewFunc, onThumbnail: onThumbnailFunc
		};
	});
	const [preview, setPreview] = useState<UploadItemGalleryPreviewState>({
		visible: false,
		rect: {top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, ltr: true}
	});
	useEffect(() => {
		const {onPreview: onPreviewFunc, onThumbnail: onThumbnailFunc} = createThumbnailAndPreviewFuncs({
			$model, file, onPreview, onThumbnail
		}, context);
		bytesCacheRef.current.onPreview = onPreviewFunc;
		bytesCacheRef.current.onThumbnail = onThumbnailFunc;
		// load thumbnail when bytes not provided
		(async () => await loadThumbnail(bytesCacheRef, context))();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ERO.revoke($model), ERO.revoke(file.details), onPreview, onThumbnail, context]);
	useEffect(() => {
		// clear the url cache
		return () => {
			if (!bytesCacheRef.current.checked) {
				return;
			}

			if (bytesCacheRef.current.thumbnailUrl != null) {
				if (bytesCacheRef.current.thumbnailUrl == bytesCacheRef.current.fullUrl) {
					delete bytesCacheRef.current.fullUrl;
				}
				releaseImage(bytesCacheRef.current.thumbnailUrl);
			}
			if (bytesCacheRef.current.fullUrl != null) {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				releaseImage(bytesCacheRef.current.fullUrl);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onPreviewClick = () => {
		if (ref.current == null) {
			return;
		}

		const {top, left, bottom, right, width, height} = ref.current.getBoundingClientRect();
		const ltr = window.getComputedStyle(ref.current).direction !== 'rtl';
		setPreview({visible: true, rect: {top, left, bottom, right, width, height, ltr}});
	};
	const onPreviewClose = () => {
		const ltr = ref.current == null ? true : window.getComputedStyle(ref.current).direction !== 'rtl';
		setPreview({visible: false, rect: {top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, ltr}});
	};
	const onDownloadClick = () => {
		onDownload(bytesCacheRef.current.full);
	};

	let errorMessage = givenErrorMessage;
	if (errorMessage != null
		&& ![
			HxUploadDefaults.fileOverMaxSizeKey, HxUploadDefaults.fileNotAcceptableKey, HxUploadDefaults.fileUploadErrorKey
		].includes(errorMessage)) {
		// simplify custom error messages to a generic label in gallery mode (limited space)
		errorMessage = HxUploadDefaults.fileUploadErrorKey;
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
						<HxButton variant="ghost" text={<Upload/>} onClick={onUpload}
						          data-hx-upload-file-upload=""/>
						<HxButton variant="ghost" text={<Trash/>} color="danger" onClick={onDelete}
						          data-hx-upload-file-delete=""/>
					</>} data-hx-upload-file-action="upload-failed"/>
				</>
				: <>
					{/* thumbnail preview, works on images only. or show corresponding icons of the mime type? */}
					<div data-hx-upload-file-thumbnail="">
						{asImageOrIcon(bytesCacheRef)}
					</div>
					{/* the preview reads the ref-bound closures at render time; opening it requires
					    setPreview({visible: true}), whose repaint runs after the rebind effect, so it
					    always mounts with the current bindings — never a stale closure identity */}
					{preview.visible
						?
						<UploadItemGalleryPreview onPreview={bytesCacheRef.current.onPreview}
						                          onDownload={onDownload}
						                          bytesRef={bytesCacheRef}
						                          triggerRect={preview.rect} triggerRef={ref}
						                          onClose={onPreviewClose}/>
						: (void 0)}
					<HxLabel text={<>
						{bytesCacheRef.current.checked
							? <HxButton text={<EyeOpen/>} variant="ghost" $disabled={disabled}
							            data-hx-upload-file-preview=""
							            onClick={onPreviewClick}/>
							: <HxButton variant="ghost" text={<Download/>} $disabled={disabled}
							            data-hx-upload-file-download=""
							            onClick={onDownloadClick}/>}
						<HxButton text={<Trash/>} variant="ghost" color="danger" $disabled={disabled}
						          data-hx-upload-file-delete=""
						          onClick={onDelete}/>
					</>} data-hx-upload-file-action="uploaded"/>
				</>)}
	</div>;
};
