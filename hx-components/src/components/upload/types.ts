import type {ModelPath} from '@hx/data';
import {type HTMLAttributes, type ReactNode} from 'react';
import {type HxContext} from '../../contexts';
import type {
	HxColor,
	HxDataPath,
	HxEditSingleFieldProps,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxWidthConstrainedProps
} from '../../types';
import type {HxButtonVariant} from '../button';
import type {HxWithCheckCreateOptions, HxWithCheckProps} from '../with-check';

export interface HxUploadFile {
	name: string;
	size?: number;
	mimeType?: string;
}

/** upload percentage, from 0 to 100 */
export type HxUploadFilePercentage = number;
export type HxUploadFileCallbackFunc = (percentage: HxUploadFilePercentage) => void;
/** error message, support i18n */
export type HxUploadErrorMessage = 'over-max-size' | 'not-acceptable' | 'error' | string;
/**
 * upload single file
 * - callback: if uploading supports percentage state updating, call this function
 * - return error message: when failed to upload
 * - HxUploadFile: when successful, return the data of uploaded file
 */
export type HxUploadFileFunc = (callback: HxUploadFileCallbackFunc) => Promise<HxUploadFile | HxUploadErrorMessage>;

export type HxUploadColor = HxColor;
export type HxUploadVariant = HxButtonVariant | 'dnd' | 'gallery';
/** read existing uploaded files from the data model; override to transform raw model values into HxUploadFile[] */
export type HxUploadReadDataFunc<T extends object> = <V>($model: HxObject<T>, $field: ModelPath<T> | HxDataPath, value: V | null | undefined, context: HxContext) => Array<HxUploadFile>;
/** write uploaded files back into the data model; override to control how files are persisted */
export type HxUploadWriteDataFunc<T extends object> = ($model: HxObject<T>, $field: ModelPath<T> | HxDataPath, data: Array<HxUploadFile>, context: HxContext) => void;

export interface HxUploadingFile {
	details: HxUploadFile & {
		// use bytes to check file type and preview.
		// only works on gallery mode
		bytes?: Uint8Array<ArrayBuffer>
	};
	upload: HxUploadFileFunc;
	percentageSupport?: boolean;
	abort?: AbortController;
}

/**
 * upload files function, return the functions which prepared for each file uploading.
 * note the upload not starts yet.
 *
 * returned promise CANNOT be rejected!
 */
export type HxUploadUploadFilesFunc<T extends object> = (files: Array<File>, $model: HxObject<T>, context: HxContext) => Promise<Array<HxUploadingFile>>;
/** download a previously uploaded file; implementor decides how (open in new tab, trigger download, etc.) */
export type HxUploadDownloadFileFunc<T extends object> = (file: HxUploadFile, $model: HxObject<T>, context: HxContext) => Promise<void>;
/** download the preview file bytes; return undefined if any error occurred, DONOT return the rejected promise */
export type HxUploadPreviewFileFunc<T extends object> = (file: HxUploadFile, $model: HxObject<T>, context: HxContext) => Promise<Uint8Array<ArrayBuffer> | undefined>;
/** download the thumbnail file bytes; return undefined if any error occurred, DONOT return the rejected promise */
export type HxUploadThumbnailFileFunc<T extends object> = (file: HxUploadFile, $model: HxObject<T>, context: HxContext) => Promise<Uint8Array<ArrayBuffer> | undefined>;
export type HxUploadImageType = 'JPEG' | 'PNG' | 'GIF' | 'WEBP' | 'BMP' | 'APNG' | 'AVIF';

export interface HxExtUploadProps<T extends object>
	extends HxEditSingleFieldProps<T>, HxWidthConstrainedProps {
	color?: HxUploadColor;
	variant?: HxUploadVariant;
	maxFileCount?: number;
	maxFileSize?: number;
	/** https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file#accept */
	accept?: string | Array<string>;
	/** https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file#capture */
	capture?: boolean;
	read?: HxUploadReadDataFunc<T>;
	write?: HxUploadWriteDataFunc<T>;
	/**
	 * upload selected files (could be one file, depends on max file count and selection).
	 * returns an array immediately, each element contains the file and an asynchronized function,
	 * component do the following based on returned array:
	 * - append the selected files to list
	 * - show the uploading status
	 */
	upload: HxUploadUploadFilesFunc<T>;
	/**
	 * download file, implement it all by yourself.
	 * e.g. open a new tab to show the file if the file can be open directly in browser,
	 * or just start to download directly.
	 */
	download: HxUploadDownloadFileFunc<T>;
	/**
	 * get bytes of image file for preview purpose, only works when variant is "gallery"
	 */
	preview?: HxUploadPreviewFileFunc<T>;
	/**
	 * get thumbnail bytes of image file, only works when variant is "gallery".
	 * if this function is not provided, use the "preview" function to get full bytes.
	 */
	thumbnail?: HxUploadThumbnailFileFunc<T>;
	buttonUploadKey?: ReactNode;
	galleryUploadKey?: ReactNode;
	dndUploadKey?: ReactNode;
	dndDescKey?: ReactNode;
}

export type OmittedUploadHTMLProps = HxOmittedAttributes;

export type HxUploadBaseInnerProps<T extends object> =
	& HxExtUploadProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedUploadHTMLProps, T>;

export type HxUploadInnerProps<T extends object> =
	& Omit<HxWithCheckProps<T, HxUploadBaseInnerProps<T>>, '$domCheckBox'>
	& HxWithCheckCreateOptions<T, HxUploadBaseInnerProps<T>>
	& { $withCheck: boolean }

export type HxUploadProps<T extends object> = HxUploadBaseInnerProps<T>;
