// @ts-expect-error import React
import React, {type DispatchWithoutAction, type MutableRefObject, type RefObject, useEffect, useRef} from 'react';
import {type HxContext, useHxContext} from '../../contexts';
import type {HxObject} from '../../types';
import {AnyUtils, HxConsole} from '../../utils';
import {HxUploadDefaults} from './defaults';
import type {
	HxUploadDownloadFileFunc,
	HxUploadedFile,
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
import {useHxUpload} from './upload-provider';
import {mapError} from './utils';

export interface HxUploadingItemProps<T extends object> {
	$model: HxObject<T>;
	maxFileSize: number;
	file: HxUploadingFile | HxUploadedFile;
	variant: HxUploadVariant;
	onDownload: HxUploadDownloadFileFunc<T>;
	onPreview?: HxUploadPreviewFileFunc<T>;
	onThumbnail?: HxUploadThumbnailFileFunc<T>;
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
	onUploaded: (oldDetails: HxUploadFile, newDetails: HxUploadFile) => void
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
		const {details: oldDetails, percentageSupport, upload: doUpload} = file;
		const callback = percentageSupport ? (percentage: HxUploadFilePercentage) => {
			if (isDeletedRef.current) {
				return;
			}
			isUploadingRef.current.percentage = percentage;
			percentageRef.current?.style?.setProperty('--hx-upload-file-percentage-width-this', `${percentage}`);
		} : AnyUtils.noop;
		let fileOrError: HxUploadFile | string | undefined;
		try {
			fileOrError = await doUpload(callback);
		} catch (e) {
			HxConsole.warn('Failed to upload', e);
			fileOrError = (void 0);
		}
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
			onUploaded(oldDetails, file.details);
		}
	});
};

const uploadFile = async (
	file: HxUploadingFile, maxFileSize: number,
	context: HxContext, refs: {
		isUploadingRef: MutableRefObject<UploadingState>,
		isDeletedRef: MutableRefObject<boolean>,
		percentageRef: RefObject<HTMLDivElement>,
	}, onUploaded: (oldDetails: HxUploadFile, newDetails: HxUploadFile) => void): Promise<void> => {
	const {isUploadingRef, isDeletedRef, percentageRef} = refs;

	if (file.details.size != null && file.details.size > maxFileSize) {
		isUploadingRef.current.uploading = false;
		isUploadingRef.current.error = {message: HxUploadDefaults.fileOverMaxSizeKey};
		context.forceUpdate();
	} else {
		await upload(file, isDeletedRef, isUploadingRef, percentageRef, context.forceUpdate, onUploaded);
	}
};

export const HxUploadItem = <T extends object>(props: HxUploadingItemProps<T>) => {
	const {
		$model, maxFileSize, file,
		variant, onDownload, onPreview, onThumbnail,
		disabled
	} = props;

	const context = useHxContext();
	const uploadContext = useHxUpload();
	const isUploadingRef = useRef<UploadingState>({
		uploading: (file as HxUploadingFile).upload != null, percentage: 0
	});
	const bytesRef = useRef<Uint8Array<ArrayBuffer> | null>((file as HxUploadingFile).details.bytes ?? null);
	const percentageRef = useRef<HTMLDivElement>(null);
	const isDeletedRef = useRef(false);
	useEffect(() => {
		if (isUploadingRef.current.uploading) {
			(async () => {
				await uploadFile(file as HxUploadingFile, maxFileSize, context, {
					isUploadingRef, isDeletedRef, percentageRef
				}, (oldDetails, newDetails) => {
					uploadContext.fileUploaded(oldDetails, newDetails);
				});
			})();
		}
		// trigger this effect unless file changed
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [file, uploadContext, context]);

	if (isDeletedRef.current) {
		return (void 0);
	}

	const handleUpload = async () => {
		if (disabled) {
			return;
		}
		await uploadFile(file as HxUploadingFile, maxFileSize, context, {
			isUploadingRef, isDeletedRef, percentageRef
		}, (oldDetails, newDetails) => {
			uploadContext.fileUploaded(oldDetails, newDetails);
		});
	};
	const handleDownload = async (bytes?: Uint8Array<ArrayBuffer>) => {
		if (disabled) {
			return;
		}

		// try to pass the origin details object to function, that's why here use "if"
		if (bytes == null) {
			await onDownload(file.details, $model, context);
		} else {
			await onDownload({...file.details, bytes}, $model, context);
		}
	};
	const handleDelete = () => {
		if (disabled) {
			return;
		}
		isDeletedRef.current = true;
		context.forceUpdate();
		if (isUploadingRef.current.uploading) {
			// still on uploading, send abort signal
			const {abort} = file as HxUploadingFile;
			abort?.abort('Cancel, uploading file deleted manually.');
		}
		uploadContext.fileDeleted(file);
	};

	// map known error codes to i18n message keys; pass through custom messages as-is
	const errorMessage: string | undefined = mapError(isUploadingRef.current.error != null, isUploadingRef.current.error?.message);

	if (variant !== 'gallery') {
		// list-style layout (button / dnd): file icon + name + actions in a single row
		return <UploadItemList file={file}
		                       onUpload={handleUpload} onDownload={handleDownload} onDelete={handleDelete}
		                       percentageRef={percentageRef}
		                       isUploading={isUploadingRef.current.uploading}
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
		                          isUploading={isUploadingRef.current.uploading}
		                          hasUploadError={isUploadingRef.current.error != null} errorMessage={errorMessage}
		                          disabled={disabled}/>;
	}
};
