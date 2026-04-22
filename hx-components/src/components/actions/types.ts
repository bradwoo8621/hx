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

export type HxAction = ReactElement<ComponentProps<HxButtonType>>;
export type HxActionGroup = [HxAction, ...Array<HxAction>];
export type HxActionGroups = [HxAction | HxActionGroup, ...Array<HxAction | HxActionGroup>];
export type HxActionsLeadingLabel = ReactElement<ComponentProps<HxLabelType>>;
export type HxActionsLeading =
	| string
	| HxActionsLeadingLabel
	| HxAction
	| HxActionGroup;
export type HxActionsTailing =
	| HxAction
	| HxActionGroup;
// | HxActionGroups;

export type HxActionsColor = HxButtonColor;
export type HxActionVarious = Exclude<HxButtonVarious, 'ghost'>;

export interface HxExtActionsProps<T extends object>
	extends HxEditProps<T>, HxWidthConstrainedProps {
	color?: HxActionsColor;
	various?: HxActionVarious;
	leading: HxActionsLeading;
	tailing: HxActionsTailing;
	/** Z-index for the popup layer */
	zIndex?: number;
	/** Minimum gap between popup edge and viewport boundary */
	gapToEdge?: number;
	/** Optional reactive model */
	$model?: HxObject<T>,
}

export type OmittedActionsHTMLProps =
	| HxOmittedAttributes
	| 'children';

export type HxActionsProps<T extends object> =
	& HxExtActionsProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedActionsHTMLProps, T>;

export type HxActionsType = <T extends object>(
	props: HxActionsProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/** Event emitted when try to close popup */
export const EvtHxActions_ClosePopup = 'evt-hx-actions--close-popup';
