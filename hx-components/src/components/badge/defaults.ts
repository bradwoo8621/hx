import type {HxBadgeBorderRadius, HxBadgeSize, HxBadgeVariant} from './badge';

export interface HxBadgeSettings {
	/** Badge variant style */
	variant?: HxBadgeVariant;
	/** Badge size */
	size?: HxBadgeSize;
	/** Badge border radius */
	borderRadius?: HxBadgeBorderRadius;
}

export const HxBadgeDefaults: Required<HxBadgeSettings> = {
	variant: 'solid',
	size: 'sm',
	borderRadius: 'round'
};

export const configHxBadge = (settings: HxBadgeSettings) => {
	HxBadgeDefaults.variant = settings.variant?.trim() as HxBadgeVariant || HxBadgeDefaults.variant;
	HxBadgeDefaults.size = settings.size?.trim() as HxBadgeSize || HxBadgeDefaults.size;
	HxBadgeDefaults.borderRadius = settings.borderRadius?.trim() as HxBadgeBorderRadius || HxBadgeDefaults.borderRadius;
};
