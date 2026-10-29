import type {WithPartial} from '../../types';
import {amendOverlayZIndex, HxOverlayDefaults} from '../overlay/defaults';
import type {HxUploadColor, HxUploadVariant} from './types';

export interface HxUploadSettings {
	color?: HxUploadColor;
	variant?: HxUploadVariant;
	buttonUploadKey?: string;
	galleryUploadKey?: string;
	dndUploadKey?: string;
	dndDescKey?: string;
	filesOverMaxCountKey?: string;
	fileOverMaxSizeKey?: string;
	fileNotAcceptableKey?: string;
	fileReadErrorKey?: string;
	fileUploadErrorKey?: string;
	previewZIndex?: number;
}

export const HxUploadDefaults: WithPartial<Required<HxUploadSettings>, 'dndDescKey'> = {
	color: 'primary',
	variant: 'solid',
	buttonUploadKey: '~HxCommon.ButtonUpload',
	galleryUploadKey: '~HxCommon.GalleryUpload',
	dndUploadKey: '~HxCommon.DndUpload',
	filesOverMaxCountKey: '~HxCommon.UploadOverMaxCount',
	fileOverMaxSizeKey: '~HxCommon.UploadOverMaxSize',
	fileNotAcceptableKey: '~HxCommon.UploadNotAcceptable',
	fileReadErrorKey: '~HxCommon.UploadReadFileError',
	fileUploadErrorKey: '~HxCommon.UploadError',
	previewZIndex: HxOverlayDefaults.zIndex
};

export const configHxUpload = (settings: HxUploadSettings) => {
	HxUploadDefaults.color = settings.color?.trim() as HxUploadColor || HxUploadDefaults.color;
	HxUploadDefaults.variant = settings.variant?.trim() as HxUploadVariant || HxUploadDefaults.variant;
	HxUploadDefaults.buttonUploadKey = settings.buttonUploadKey?.trim() || HxUploadDefaults.buttonUploadKey;
	HxUploadDefaults.galleryUploadKey = settings.galleryUploadKey?.trim() || HxUploadDefaults.galleryUploadKey;
	HxUploadDefaults.dndUploadKey = settings.dndUploadKey?.trim() || HxUploadDefaults.dndUploadKey;
	HxUploadDefaults.dndDescKey = settings.dndDescKey?.trim() || HxUploadDefaults.dndDescKey;
	HxUploadDefaults.filesOverMaxCountKey = settings.filesOverMaxCountKey?.trim() || HxUploadDefaults.filesOverMaxCountKey;
	HxUploadDefaults.fileOverMaxSizeKey = settings.fileOverMaxSizeKey?.trim() || HxUploadDefaults.fileOverMaxSizeKey;
	HxUploadDefaults.fileNotAcceptableKey = settings.fileNotAcceptableKey?.trim() || HxUploadDefaults.fileNotAcceptableKey;
	HxUploadDefaults.fileReadErrorKey = settings.fileReadErrorKey?.trim() || HxUploadDefaults.fileReadErrorKey;
	HxUploadDefaults.fileUploadErrorKey = settings.fileUploadErrorKey?.trim() || HxUploadDefaults.fileUploadErrorKey;
	HxUploadDefaults.previewZIndex = amendOverlayZIndex(settings.previewZIndex) ?? HxUploadDefaults.previewZIndex;
};
