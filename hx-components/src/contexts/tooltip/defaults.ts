import type {HxPadding} from '../../types';

export interface HxTooltipSettings {
	/** Default z-index value for all tooltip instances */
	zIndex?: number;
	/** default delay in millisecond for showing tooltip */
	showDelay?: number;
	/** default deplasy in millisecond for hiding tooltip, after showing */
	hideDelay?: number;
	/** Default horizontal padding size */
	paddingX?: HxPadding;
	/** Default vertical padding size */
	paddingY?: HxPadding;
	/**
	 * Default arrow size base, actually size depends on direction.
	 * direction is vertical -> width: size * 2, height: size;
	 * direction is horizontal -> width: size, height: size * 2.
	 */
	arrowSize?: number;
	/**
	 * default minimum trigger size, typically is 5 times arrow size.
	 * arrow direction is vertical -> trigger width: size * 5,;
	 * arrow direction is horizontal -> trigger height: size * 5.
	 * will check when position is not any of top/bottom/left/right.
	 *
	 * the recommended minimum size must a little bit greater than arrowSize + 2 * border radius.
	 * e.g. arrow size is 8, border radius is 6, then the min trigger size should be 24.
	 * 20 may still work, but doesn't look very good. and size less than 20 will break the visual effect.
	 */
	minTriggerSize?: number;
	/** Default tooltip animation gap size */
	animationGapSize?: number;
	/** Default tooltip gap to viewport edge */
	gapToEdge?: number;
}

export const HxTooltipDefaults: Required<HxTooltipSettings> = {
	zIndex: 1500,
	showDelay: 300,
	hideDelay: 5000,
	paddingX: 'sm',
	paddingY: 'xs',
	arrowSize: 8,
	minTriggerSize: 40,
	animationGapSize: 16,
	gapToEdge: 0
};

export const configHxTooltip = (settings: HxTooltipSettings) => {
	HxTooltipDefaults.zIndex = Math.max(15, settings.zIndex ?? HxTooltipDefaults.zIndex);
	HxTooltipDefaults.showDelay = Math.max(100, settings.showDelay ?? HxTooltipDefaults.showDelay);
	HxTooltipDefaults.hideDelay = Math.max(1000, settings.hideDelay ?? HxTooltipDefaults.hideDelay);
	HxTooltipDefaults.paddingX = settings.paddingX?.trim() as HxPadding || HxTooltipDefaults.paddingX;
	HxTooltipDefaults.paddingY = settings.paddingY?.trim() as HxPadding || HxTooltipDefaults.paddingY;
	HxTooltipDefaults.arrowSize = Math.max(0, settings.arrowSize ?? HxTooltipDefaults.arrowSize);
	HxTooltipDefaults.minTriggerSize = Math.max(0, settings.minTriggerSize ?? HxTooltipDefaults.minTriggerSize);
	HxTooltipDefaults.animationGapSize = Math.max(0, settings.animationGapSize ?? HxTooltipDefaults.animationGapSize);
	HxTooltipDefaults.gapToEdge = Math.max(0, settings.gapToEdge ?? HxTooltipDefaults.gapToEdge);
};
