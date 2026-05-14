// @ts-expect-error import React
import React, {type DispatchWithoutAction, type MutableRefObject, type RefObject, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import type {HxObject} from '../../types';
import {noop} from '../../utils';
import type {
	HxUploadDownloadFileFunc,
	HxUploadErrorMessage,
	HxUploadFile,
	HxUploadFilePercentage,
	HxUploadingFile,
	HxUploadPreviewFileFunc,
	HxUploadThumbnailFileFunc,
	HxUploadVariant
} from './types';
import {UploadItemGallery} from './upload-item-gallery';
import {UploadItemList} from './upload-item-list';
import {mapError} from './utils';

export interface HxUploadedFile {
	details: HxUploadFile;
}

export type OnFileUploadedFunc = (details: HxUploadFile) => void;
export type OnFileDeleteFunc = (details: HxUploadFile) => void;

export interface HxUploadingItemProps<T extends object> {
	$model: HxObject<T>;
	maxFileSize: number;
	file: HxUploadingFile | HxUploadedFile;
	variant: HxUploadVariant;
	onDownload: HxUploadDownloadFileFunc<T>;
	onPreview?: HxUploadPreviewFileFunc<T>;
	onThumbnail?: HxUploadThumbnailFileFunc<T>;
	onUploaded: OnFileUploadedFunc;
	onDelete: OnFileDeleteFunc;
	disabled: boolean;
}

interface UploadingState {
	uploading: boolean;
	percentage: HxUploadFilePercentage;
	error?: { message: HxUploadErrorMessage };
}

const upload = async (
	file: HxUploadingFile,
	isDeletedRef: MutableRefObject<boolean>,
	isUploadingRef: MutableRefObject<UploadingState>,
	percentageRef: RefObject<HTMLDivElement>,
	forceUpdate: DispatchWithoutAction,
	onUploaded: OnFileUploadedFunc
) => {
	// core upload routine: calls the per-file upload function, drives the progress bar,
	// and reports success/error back via isUploadingRef. uses requestAnimationFrame to
	// let React flush the "uploading" state before the async work begins.
	if (!isUploadingRef.current.uploading) {
		isUploadingRef.current.uploading = true;
		isUploadingRef.current.percentage = 0;
		forceUpdate();
	}

	requestAnimationFrame(async () => {
		const {percentageSupport, upload} = file;
		const callback = percentageSupport ? (percentage: HxUploadFilePercentage) => {
			if (isDeletedRef.current) {
				return;
			}
			isUploadingRef.current.percentage = percentage;
			percentageRef.current?.style?.setProperty('--upload-file-percentage-width', `${percentage}`);
		} : noop;
		const fileOrError = await upload(callback);
		if (fileOrError != null) {
			if (typeof fileOrError === 'string') {
				if (fileOrError.trim().length !== 0) {
					isUploadingRef.current.error = {message: fileOrError.trim()};
				} else {
					isUploadingRef.current.error = {message: 'error'};
				}
			} else {
				delete isUploadingRef.current.error;
			}
		} else {
			isUploadingRef.current.error = {message: 'error'};
		}
		isUploadingRef.current.uploading = false;
		if (isDeletedRef.current) {
			return;
		}
		isUploadingRef.current.percentage = 100;
		forceUpdate();
		if (isUploadingRef.current.error == null) {
			// call callback function only when uploaded (no error)
			onUploaded(file.details);
		}
	});
};

export const HxUploadItem = <T extends object>(props: HxUploadingItemProps<T>) => {
	const {
		$model,
		maxFileSize,
		file,
		variant, onDownload, onPreview, onThumbnail, onUploaded, onDelete,
		disabled
	} = props;

	const context = useHxContext();
	const isUploadingRef = useRef<UploadingState>({
		uploading: (file as HxUploadingFile).upload != null, percentage: 0
	});
	const bytesRef = useRef<Uint8Array<ArrayBuffer> | null>((file as HxUploadingFile).details.bytes ?? null);
	const percentageRef = useRef<HTMLDivElement>(null);
	const isDeletedRef = useRef(false);
	useEffect(() => {
		if (isUploadingRef.current.uploading) {
			(async () => {
				await upload(
					file as HxUploadingFile,
					isDeletedRef, isUploadingRef, percentageRef,
					context.forceUpdate,
					onUploaded);
			})();
		}
	}, [context, file, onUploaded]);

	// eslint-disable-next-line react-hooks/refs
	if (isDeletedRef.current) {
		return (void 0);
	}

	const handleUpload = async () => {
		const f = file as HxUploadingFile;
		if (f.details.size != null && f.details.size > maxFileSize) {
			isUploadingRef.current.uploading = false;
			isUploadingRef.current.error = {message: '~HxCommon.UploadOverMaxSize'};
			context.forceUpdate();
		} else {
			await upload(
				f,
				isDeletedRef, isUploadingRef, percentageRef,
				context.forceUpdate,
				onUploaded);
		}
	};
	const handleDownload = async () => {
		await onDownload(file.details, $model, context);
	};
	const handleDelete = () => {
		isDeletedRef.current = true;
		context.forceUpdate();
		if (isUploadingRef.current.uploading) {
			// still on uploading, send abort signal
			const {abort} = file as HxUploadingFile;
			abort?.abort('Cancel manually');
		}
		onDelete(file.details);
	};

	// map known error codes to i18n message keys; pass through custom messages as-is
	// eslint-disable-next-line react-hooks/refs
	const errorMessage: string | undefined = mapError(isUploadingRef.current.error != null, isUploadingRef.current.error?.message);

	if (variant !== 'gallery') {
		// list-style layout (button / dnd): file icon + name + actions in a single row
		return <UploadItemList file={file}
		                       onUpload={handleUpload} onDownload={handleDownload} onDelete={handleDelete}
		                       percentageRef={percentageRef}
			// eslint-disable-next-line react-hooks/refs
			                   isUploading={isUploadingRef.current.uploading}
			// eslint-disable-next-line react-hooks/refs
			                   hasUploadError={isUploadingRef.current.error != null} errorMessage={errorMessage}
			                   disabled={disabled}/>;
	} else {
		// gallery layout: thumbnail block with hover actions and image preview
		const handlePreview = async () => {
			if (onPreview != null) {
				return await onPreview(file.details, $model, context);
			} else {
				return (void 0);
			}
		};
		const handleThumbnail = async () => {
			if (onThumbnail != null) {
				return await onThumbnail(file.details, $model, context);
			} else {
				return (void 0);
			}
		};
		return <UploadItemGallery file={file}
		                          onUpload={handleUpload} onDelete={handleDelete}
		                          onDownload={handleDownload} onPreview={handlePreview} onThumbnail={handleThumbnail}
		                          bytesRef={bytesRef} percentageRef={percentageRef}
			// eslint-disable-next-line react-hooks/refs
			                      isUploading={isUploadingRef.current.uploading}
			// eslint-disable-next-line react-hooks/refs
			                      hasUploadError={isUploadingRef.current.error != null} errorMessage={errorMessage}
			                      disabled={disabled}/>;
	}
};
