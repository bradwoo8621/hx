import type {WithRequired} from '../../types';
import {amendPopupGapToEdge, amendPopupZIndex} from '../popup';
import type {HxActionsColor, HxActionVarious} from './types';

/**
 * Global configuration settings for actions component
 */
export interface HxActionsSettings {
	color?: HxActionsColor;
	various?: HxActionVarious;
	/** Z-index base for actions popup layers */
	zIndex?: number;
	/** Minimum spacing between the popup edge and viewport boundary */
	gapToEdge?: number;
}

type RequiredProps =
	| 'color'
	| 'various';

/**
 * Default configuration values for actions component
 */
export const HxActionsDefaults: WithRequired<HxActionsSettings, RequiredProps> = {
	color: 'primary',
	various: 'solid'
};

/**
 * Configure global actions component settings
 * @param settings - Configuration options to override defaults
 */
export const configHxActions = (settings: HxActionsSettings) => {
	HxActionsDefaults.color = settings.color?.trim() as HxActionsColor || HxActionsDefaults.color;
	HxActionsDefaults.various = settings.various?.trim() as HxActionVarious || HxActionsDefaults.various;
	HxActionsDefaults.zIndex = amendPopupZIndex(settings.zIndex);
	HxActionsDefaults.gapToEdge = amendPopupGapToEdge(settings.gapToEdge);
};
