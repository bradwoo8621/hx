import type {HxPadding} from '../../types';

export interface HxTooltipSettings {
	/** Default z-index value for all tooltip instances */
	zIndex?: number;
	/** default delay in millisecond for showing tooltip */
	showDelay?: number;
	/** Default horizontal padding size */
	paddingX?: HxPadding;
	/** Default vertical padding size */
	paddingY?: HxPadding;
	/**
	 * Default arrow size base, actually size depends on direction.
	 * direction is vertical -> width: size * 2, height: size;
	 * direction is horizontal -> width: size, height: size * 2
	 */
	arrowSize?: number;
	/** Default tooltip animation gap size */
	animationGapSize?: number;
}

export const HxTooltipDefaults: Required<HxTooltipSettings> = {
	zIndex: 1500,
	showDelay: 100,
	paddingX: 'sm',
	paddingY: 'xs',
	arrowSize: 8,
	animationGapSize: 16
};

export const configHxTooltip = (settings: HxTooltipSettings) => {
	HxTooltipDefaults.zIndex = Math.max(15, settings.zIndex ?? HxTooltipDefaults.zIndex);
	HxTooltipDefaults.showDelay = Math.max(30, settings.showDelay ?? HxTooltipDefaults.showDelay);
	HxTooltipDefaults.paddingX = settings.paddingX?.trim() as HxPadding || HxTooltipDefaults.paddingX;
	HxTooltipDefaults.paddingY = settings.paddingY?.trim() as HxPadding || HxTooltipDefaults.paddingY;
	HxTooltipDefaults.arrowSize = Math.max(0, settings.arrowSize ?? HxTooltipDefaults.arrowSize);
	HxTooltipDefaults.animationGapSize = Math.max(0, settings.animationGapSize ?? HxTooltipDefaults.animationGapSize);
};
