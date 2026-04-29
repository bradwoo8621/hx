import type {WithPartial} from '../../types';
import type {HxUploadColor, HxUploadListVariant, HxUploadTriggerVariant} from './types';

export interface HxUploadSettings {
	color?: HxUploadColor;
	triggerVariant?: HxUploadTriggerVariant;
	listVariant?: HxUploadListVariant;
	buttonUploadKey?: string;
	galleryUploadKey?: string;
	dndUploadKey?: string;
	dndDescKey?: string;
}

export const HxUploadDefaults: WithPartial<Required<HxUploadSettings>, 'dndDescKey'> = {
	color: 'primary',
	triggerVariant: 'solid',
	listVariant: 'list',
	buttonUploadKey: '~HxCommon.ButtonUpload',
	galleryUploadKey: '~HxCommon.GalleryUpload',
	dndUploadKey: '~HxCommon.DndUpload'
};

export const configHxUpload = (settings: HxUploadSettings) => {
	HxUploadDefaults.color = settings.color?.trim() as HxUploadColor || HxUploadDefaults.color;
	HxUploadDefaults.triggerVariant = settings.triggerVariant?.trim() as HxUploadTriggerVariant || HxUploadDefaults.triggerVariant;
	HxUploadDefaults.listVariant = settings.listVariant?.trim() as HxUploadListVariant || HxUploadDefaults.listVariant;
	HxUploadDefaults.buttonUploadKey = settings.buttonUploadKey?.trim() || HxUploadDefaults.buttonUploadKey;
	HxUploadDefaults.galleryUploadKey = settings.galleryUploadKey?.trim() || HxUploadDefaults.galleryUploadKey;
	HxUploadDefaults.dndUploadKey = settings.dndUploadKey?.trim() || HxUploadDefaults.dndUploadKey;
	HxUploadDefaults.dndDescKey = settings.dndDescKey?.trim() || HxUploadDefaults.dndDescKey;
};
