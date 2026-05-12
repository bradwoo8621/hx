import type {ModelPath} from '@hx/data';
import type {HxContext} from '../../contexts';
import type {HxColor, HxDataPath, HxObject} from '../../types';
import type {HxButtonVariant} from '../button';

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
export type HxUploadReadDataFunc<T extends object> = <V>($model: HxObject<T>, $field: ModelPath<T> | HxDataPath, value: V | null | undefined, context: HxContext) => Array<HxUploadFile>;
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
export type HxUploadDownloadFileFunc<T extends object> = (file: HxUploadFile, $model: HxObject<T>, context: HxContext) => Promise<void>;
