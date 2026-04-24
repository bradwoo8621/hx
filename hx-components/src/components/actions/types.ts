import type {ComponentProps, HTMLAttributes, ReactElement, RefAttributes} from 'react';
import type {
	HxEditProps,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxWidthConstrainedProps
} from '../../types';
import type {HxButtonColor, HxButtonType, HxButtonVarious} from '../button';
import type {HxLabelType} from '../label';

/** A single action item, must be a valid HxButton component instance */
export type HxAction = ReactElement<ComponentProps<HxButtonType>>;
/** A group of action items, will be rendered with a divider between groups */
export type HxActionGroup = [HxAction, ...Array<HxAction>];
/** Multiple action groups, allows nested grouping of actions */
export type HxActionGroups = [HxAction | HxActionGroup, ...Array<HxAction | HxActionGroup>];
/** Custom label type for leading trigger, must be a valid HxLabel component instance */
export type HxActionsLeadingLabel = ReactElement<ComponentProps<HxLabelType>>;

/**
 * Supported types for the leading trigger element of HxActions:
 * - string: will be rendered as a default button with a dropdown arrow
 * - HxActionsLeadingLabel: custom HxLabel as trigger
 * - HxAction: single HxButton as trigger
 * - HxActionGroup: multiple buttons as trigger (will be rendered side by side)
 */
export type HxActionsLeading =
	| string
	| HxActionsLeadingLabel
	| HxAction
	| HxActionGroup;

/**
 * Supported types for the tailing popup content of HxActions:
 * - HxAction: single action button
 * - HxActionGroup: group of related action buttons
 * - HxActionGroups: multiple groups of actions with dividers between them
 */
export type HxActionsTailing =
	| HxAction
	| HxActionGroup
	| HxActionGroups;

/** Color scheme for actions component, inherited from HxButton colors */
export type HxActionsColor = HxButtonColor;
/** Style variant for actions component, excludes ghost variant which is not suitable for this component */
export type HxActionsVarious = Exclude<HxButtonVarious, 'link'>;

/**
 * Extended props for HxActions component
 * Defines all configuration options specific to the actions component
 */
export interface HxExtActionsProps<T extends object>
	extends HxEditProps<T>, HxWidthConstrainedProps {
	/** Color scheme of the trigger button(s), same as HxButton colors */
	color?: HxActionsColor;
	/** Style variant of the trigger button(s), same as HxButton variants (excluding ghost) */
	various?: HxActionsVarious;
	/**
	 * Leading trigger element(s), can be string, label, single button or button group
	 * If not provided, defaults to a standard "More" button with ellipsis icon
	 */
	leading?: HxActionsLeading;
	/**
	 * Tailing popup content, can be single action, action group or multiple action groups
	 * This content will be rendered in the dropdown popup when trigger is clicked
	 */
	tailing: HxActionsTailing;
	/** Z-index for the popup layer, controls stack order relative to other overlays */
	zIndex?: number;
	/** Minimum gap between popup edge and viewport boundary, prevents popup from being cut off */
	gapToEdge?: number;
	/** Optional reactive model for data binding and state management */
	$model?: HxObject<T>,
}

/** HTML props that are omitted from the component's root element */
export type OmittedActionsHTMLProps =
	| HxOmittedAttributes
	| 'children';

/** Full props interface for HxActions component, combines custom props with HTML element props */
export type HxActionsProps<T extends object> =
	& HxExtActionsProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedActionsHTMLProps, T>;

/** Component type definition for HxActions */
export type HxActionsType = <T extends object>(
	props: HxActionsProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Event emitted when keyboard navigation tries to hover the previous option in the popup
 * Used for internal keyboard navigation handling
 */
export const EvtHxActions_HoverPreviousOption = 'evt-hx-actions--hover-previous-option';
/**
 * Event emitted when keyboard navigation tries to hover the next option in the popup
 * Used for internal keyboard navigation handling
 */
export const EvtHxActions_HoverNextOption = 'evt-hx-actions--hover-next-option';
/**
 * Event emitted when keyboard navigation tries to select the currently hovered option
 * Used for internal keyboard navigation handling
 */
export const EvtHxActions_SelectHoverOption = 'evt-hx-actions--select-hover-option';
/**
 * Event emitted when trying to close the popup (via ESC key or outside click)
 * Used for internal popup state management
 */
export const EvtHxActions_ClosePopup = 'evt-hx-actions--close-popup';
