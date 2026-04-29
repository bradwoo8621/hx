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
export type HxUploadErrorMessage = string;
/**
 * upload single file
 * - callback: if uploading supports percentage state updating, call this function
 * - return error message: when failed to upload
 * - void: when successful
 */
export type HxUploadFileFunc = (callback: HxUploadFileCallbackFunc) => Promise<HxUploadErrorMessage | void>;

export type HxUploadColor = HxColor;
export type HxUploadTriggerVariant = HxButtonVariant | 'dnd';
export type HxUploadListVariant = 'list' | 'gallery';
export type HxUploadReadDataFunc<T extends object> = <V>($model: HxObject<T>, $field: ModelPath<T> | HxDataPath, value?: V) => Array<HxUploadFile>;
export type HxUploadWriteDataFunc<T extends object> = ($model: HxObject<T>, $field: ModelPath<T> | HxDataPath, data: Array<HxUploadFile>) => void;

export interface HxUploadUploading extends HxUploadFile {
	percentageSupport?: boolean;
	func: HxUploadFileFunc;
}

/**
 * upload files function.
 * return an array represents for
 * - [0]: upload file details,
 * - [1]: support file uploading percentage update or not,
 * - [2]: upload file function.
 */
export type HxUploadUploadFilesFunc<T extends object> = (files: Array<File>, $model: HxObject<T>, context: HxContext) => Array<HxUploadUploading>;
export type HxUploadDownloadFileFunc<T extends object> = (file: HxUploadFile, $model: HxObject<T>, context: HxContext) => Promise<void>;
