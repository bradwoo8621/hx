import type {WithPartial} from '../../types';
import type {HxTabBodyContainerType, HxTabsBorderRadius, HxTabsPaddingB, HxTabsPaddingT, HxTabsPaddingX} from './types';

/**
 * Global configuration settings for HxTabs components
 * These settings can be used to set default behavior and styling across all tab instances
 */
export interface HxTabsSettings {
	/** Whether to show a border around the tabs content container by default */
	border?: boolean;
	/** Default border radius size for tabs container corners */
	borderRadius?: HxTabsBorderRadius;
	/** Default horizontal (left and right) padding for the content container */
	paddingX?: HxTabsPaddingX;
	/** Default top padding for the content container */
	paddingT?: HxTabsPaddingT;
	/** Default bottom padding for the content container */
	paddingB?: HxTabsPaddingB;
	/** Default layout container type for the tab body content area */
	containerType?: HxTabBodyContainerType;
}

/**
 * Default values for tabs component configuration
 * These values are used when no explicit props are provided to HxTabs components
 */
export const HxTabsDefaults: WithPartial<Required<HxTabsSettings>, 'borderRadius' | 'paddingX' | 'paddingT' | 'paddingB'> = {
	border: false,
	containerType: 'grid'
};

/**
 * Configure global default settings for all HxTabs components
 * @param settings - Partial settings object to override default values
 */
export const configHxTabs = (settings: HxTabsSettings) => {
	HxTabsDefaults.border = settings.border ?? HxTabsDefaults.border;
	HxTabsDefaults.borderRadius = settings.borderRadius?.trim() as HxTabsBorderRadius;
	HxTabsDefaults.paddingX = settings.paddingX?.trim() as HxTabsPaddingX;
	HxTabsDefaults.paddingT = settings.paddingT?.trim() as HxTabsPaddingT;
	HxTabsDefaults.paddingB = settings.paddingB?.trim() as HxTabsPaddingB;
	HxTabsDefaults.containerType = settings.containerType?.trim() as HxTabBodyContainerType || HxTabsDefaults.containerType;
};
