// @ts-expect-error import React
import React, {type MutableRefObject, type RefObject} from 'react';
import {HxButton} from '../button';
import {EyeOpen, FileText, Trash, Update, Upload} from '../icons';
import {HxLabel} from '../label';
import type {HxUploadingFile} from './types';
import type {HxUploadedFile} from './upload-item';
import {isImage} from './utils';

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

export const UploadItemGallery = (props: UploadItemGalleryProps) => {
	const {
		file,
		onUpload, /*onDownload,*/ onDelete,
		bytesRef, percentageRef,
		isUploading, hasUploadError, errorMessage: givenErrorMessage,
		disabled
	} = props;

	const onPreviewClick = async () => {
		if (bytesRef.current != null) {
			console.log('preview click');
		}
	};

	let errorMessage = givenErrorMessage;
	if (errorMessage != null && !['~HxCommon.UploadOverMaxSize', '~HxCommon.UploadNotAcceptable', '~HxCommon.UploadError'].includes(errorMessage)) {
		// simplify custom error messages to a generic label in gallery mode (limited space)
		errorMessage = '~HxCommon.UploadError';
	}

	// render image thumbnail from raw bytes, or a generic file icon for non-image files
	const asImageOrIcon = () => {
		const checked = isImage(bytesRef.current);
		if (checked === false) {
			return <HxLabel text={<FileText/>}/>;
		} else {
			// @ts-expect-error ignore check
			return <img src={toImageSrc(bytesRef.current!, checked.toLowerCase())} alt=""/>;
		}
	};

	return <div data-hx-upload-file=""
	            data-hx-upload-file-error={hasUploadError ? '' : (void 0)}>
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
					<HxLabel text={<>
						<HxButton text={<EyeOpen/>} variant="ghost" $disabled={disabled}
						          onClick={onPreviewClick}/>
						<HxButton text={<Trash/>} variant="ghost" color="danger" $disabled={disabled}
						          onClick={onDelete}/>
					</>} data-hx-upload-file-action="uploaded"/>
				</>)}
	</div>;
};