import type {WithPartial} from '../../types';
import type {HxTabsBorderRadius, HxTabsPaddingB, HxTabsPaddingT, HxTabsPaddingX} from './types';

export interface HxTabsSettings {
	border?: boolean;
	borderRadius?: HxTabsBorderRadius;
	paddingX?: HxTabsPaddingX;
	paddingT?: HxTabsPaddingT;
	paddingB?: HxTabsPaddingB;
}

export const HxTabsDefaults: WithPartial<Required<HxTabsSettings>, 'borderRadius' | 'paddingX' | 'paddingT' | 'paddingB'> = {
	border: false
};

export const configHxTabs = (settings: HxTabsSettings) => {
	HxTabsDefaults.border = settings.border ?? HxTabsDefaults.border;
	HxTabsDefaults.borderRadius = settings.borderRadius?.trim() as HxTabsBorderRadius;
	HxTabsDefaults.paddingX = settings.paddingX?.trim() as HxTabsPaddingX;
	HxTabsDefaults.paddingT = settings.paddingT?.trim() as HxTabsPaddingT;
	HxTabsDefaults.paddingB = settings.paddingB?.trim() as HxTabsPaddingB;
};
