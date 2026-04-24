import type {WithRequired} from '../../types';
import {amendPopupGapToEdge, amendPopupZIndex} from '../popup';
import type {HxActionsColor, HxActionsVarious} from './types';

/**
 * Global configuration settings for HxActions component
 * These settings can be overridden globally at app initialization or per-component
 */
export interface HxActionsSettings {
	/** Default color scheme for all actions triggers, defaults to 'primary' */
	color?: HxActionsColor;
	/** Default style variant for all actions triggers, defaults to 'solid' */
	various?: HxActionsVarious;
	/** Default z-index base for actions popup layers, controls stack order of all action popups */
	zIndex?: number;
	/** Default minimum spacing between the popup edge and viewport boundary, prevents popup from being clipped */
	gapToEdge?: number;
}

/** Properties that have required default values */
type RequiredProps =
	| 'color'
	| 'various';

/**
 * Default configuration values for HxActions component
 * These values are used when no explicit props are provided
 * Can be globally modified using configHxActions() function during app initialization
 */
export const HxActionsDefaults: WithRequired<HxActionsSettings, RequiredProps> = {
	color: 'primary',
	various: 'solid'
};

/**
 * Configure global default settings for all HxActions component instances
 * Should be called once during app initialization before rendering any components
 * Automatically validates and normalizes z-index and gapToEdge values using popup utilities
 * @param settings - Partial configuration options to override default values
 */
export const configHxActions = (settings: HxActionsSettings) => {
	HxActionsDefaults.color = settings.color?.trim() as HxActionsColor || HxActionsDefaults.color;
	HxActionsDefaults.various = settings.various?.trim() as HxActionsVarious || HxActionsDefaults.various;
	HxActionsDefaults.zIndex = amendPopupZIndex(settings.zIndex);
	HxActionsDefaults.gapToEdge = amendPopupGapToEdge(settings.gapToEdge);
};
