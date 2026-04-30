import type {WithPartial} from '../../types';
import type {HxUploadColor, HxUploadVariant} from './types';

export interface HxUploadSettings {
	color?: HxUploadColor;
	variant?: HxUploadVariant;
	buttonUploadKey?: string;
	galleryUploadKey?: string;
	dndUploadKey?: string;
	dndDescKey?: string;
}

export const HxUploadDefaults: WithPartial<Required<HxUploadSettings>, 'dndDescKey'> = {
	color: 'primary',
	variant: 'solid',
	buttonUploadKey: '~HxCommon.ButtonUpload',
	galleryUploadKey: '~HxCommon.GalleryUpload',
	dndUploadKey: '~HxCommon.DndUpload'
};

export const configHxUpload = (settings: HxUploadSettings) => {
	HxUploadDefaults.color = settings.color?.trim() as HxUploadColor || HxUploadDefaults.color;
	HxUploadDefaults.variant = settings.variant?.trim() as HxUploadVariant || HxUploadDefaults.variant;
	HxUploadDefaults.buttonUploadKey = settings.buttonUploadKey?.trim() || HxUploadDefaults.buttonUploadKey;
	HxUploadDefaults.galleryUploadKey = settings.galleryUploadKey?.trim() || HxUploadDefaults.galleryUploadKey;
	HxUploadDefaults.dndUploadKey = settings.dndUploadKey?.trim() || HxUploadDefaults.dndUploadKey;
	HxUploadDefaults.dndDescKey = settings.dndDescKey?.trim() || HxUploadDefaults.dndDescKey;
};
