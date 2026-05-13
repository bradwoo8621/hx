// @ts-expect-error import React
import React, {type MutableRefObject, type RefObject, useRef, useState} from 'react';
import type {HxAbsolutePosition} from '../../types';
import {HxButton} from '../button';
import {Download, EyeOpen, FileText, Trash, Update, Upload} from '../icons';
import {HxLabel} from '../label';
import type {HxUploadingFile} from './types';
import type {HxUploadedFile} from './upload-item';
import {UploadItemGalleryPreview, type UploadItemGalleryPreviewBytes} from './upload-item-gallery-preview';
import {isImage, toImageSrc} from './utils';

export interface UploadItemGalleryProps {
	file: HxUploadingFile | HxUploadedFile;
	onUpload: () => void;
	onDownload: () => void;
	onDelete: () => void;
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

export const UploadItemGallery = (props: UploadItemGalleryProps) => {
	const {
		file,
		onUpload, onDownload, onDelete,
		bytesRef, percentageRef,
		isUploading, hasUploadError, errorMessage: givenErrorMessage,
		disabled
	} = props;

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

	const onPreviewClick = async () => {
		if (ref.current == null) {
			return;
		}

		const {top, left, bottom, right, width, height} = ref.current.getBoundingClientRect();
		setPreview({visible: true, rect: {top, left, bottom, right, width, height}});
	};
	const onPreviewClose = () => {
		setPreview({visible: false, rect: {top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0}});
	};

	let errorMessage = givenErrorMessage;
	if (errorMessage != null && !['~HxCommon.UploadOverMaxSize', '~HxCommon.UploadNotAcceptable', '~HxCommon.UploadError'].includes(errorMessage)) {
		// simplify custom error messages to a generic label in gallery mode (limited space)
		errorMessage = '~HxCommon.UploadError';
	}

	// render image thumbnail from raw bytes, or a generic file icon for non-image files
	const asImageOrIcon = () => {
		const checked = isImage(bytesCacheRef.current.thumbnail);
		if (checked === false) {
			return <HxLabel text={<FileText/>}/>;
		} else {
			// @ts-expect-error ignore parameter type check
			return <img src={toImageSrc(bytesCacheRef.current.thumbnail!, checked.toLowerCase())} alt=""/>;
		}
	};

	return <div data-hx-upload-file=""
	            data-hx-upload-file-error={hasUploadError ? '' : (void 0)}
	            ref={ref}>
		{isUploading
			? <>
				<HxLabel text={<>
					<HxLabel text={<Update data-hx-animation="spin" data-hx-upload-file-uploading=""/>}/>
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
							{/* eslint-disable-next-line react-hooks/refs */}
							{asImageOrIcon()}
						</div>
					{preview.visible
						? <UploadItemGalleryPreview bytesRef={bytesCacheRef}
						                            triggerRect={preview.rect} triggerRef={ref}
						                            onClose={onPreviewClose}/>
						: (void 0)}
						<HxLabel text={<>
							{/* eslint-disable-next-line react-hooks/refs */}
							{isImage(bytesCacheRef.current.thumbnail)
								? <HxButton text={<EyeOpen/>} variant="ghost" $disabled={disabled}
								            onClick={onPreviewClick}/>
								: <HxButton variant="ghost" text={<Download/>} $disabled={disabled}
								            onClick={onDownload}/>}
							<HxButton text={<Trash/>} variant="ghost" color="danger" $disabled={disabled}
							          onClick={onDelete}/>
						</>} data-hx-upload-file-action="uploaded"/>
				</>)}
	</div>;
};
