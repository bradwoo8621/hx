import type {HxColor} from '../../types';
import type {HxLabelPaddingX} from '../label';
import type {HxBadgeBorderRadius, HxBadgeSize, HxBadgeVariant} from './types';

export interface HxBadgeSettings {
	/** Badge color */
	color?: HxColor;
	/** Badge variant style */
	variant?: HxBadgeVariant;
	/** Badge size */
	size?: HxBadgeSize;
	/** Badge border radius */
	borderRadius?: HxBadgeBorderRadius;
	/** Badge padding x */
	paddingX?: HxLabelPaddingX;
}

export const HxBadgeDefaults: Required<HxBadgeSettings> = {
	color: 'primary',
	variant: 'solid',
	size: 'sm',
	borderRadius: 'round',
	paddingX: 'md'
};

export const configHxBadge = (settings: HxBadgeSettings) => {
	HxBadgeDefaults.color = settings.color?.trim() as HxColor || HxBadgeDefaults.color;
	HxBadgeDefaults.variant = settings.variant?.trim() as HxBadgeVariant || HxBadgeDefaults.variant;
	HxBadgeDefaults.size = settings.size?.trim() as HxBadgeSize || HxBadgeDefaults.size;
	HxBadgeDefaults.borderRadius = settings.borderRadius?.trim() as HxBadgeBorderRadius || HxBadgeDefaults.borderRadius;
	HxBadgeDefaults.paddingX = settings.paddingX?.trim() as HxLabelPaddingX || HxBadgeDefaults.paddingX;
};
