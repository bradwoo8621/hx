// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type ReactNode, type RefAttributes} from 'react';
import {HxFlex, type HxFlexJustifyContent, type HxFlexProps} from '../flex';
import {HxButtonBarDefaults} from './defaults';

/**
 * Props for HxButtonBar component
 * Extends HxFlexProps to inherit all flex layout capabilities
 * Automatically manages button alignment based on provided button groups
 */
export interface HxButtonBarProps<T extends object> extends Omit<HxFlexProps<T>, 'justifyContent' | 'children'> {
	/** Button group to render on the leading (left in LTR, right in RTL) side of the bar */
	leading?: ReactNode;
	/** Button group to render on the tailing (right in LTR, left in RTL) side of the bar */
	tailing?: ReactNode;
}

/**
 * Component type definition for HxButtonBar
 */
export type HxButtonBarType = <T extends object>(
	props: HxButtonBarProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Button Bar layout component
 * A specialized flex container for organizing action buttons in forms, dialogs and page headers
 * Automatically aligns buttons based on which groups are provided:
 * - Both leading and tailing: space-between alignment
 * - Only leading: left-aligned
 * - Only tailing: right-aligned
 * Inherits all layout capabilities from HxFlex component
 * @param props - Button bar configuration properties
 * @param ref - Forwarded ref to the underlying flex container element
 */
export const HxButtonBar =
	forwardRef(<T extends object>(props: HxButtonBarProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			gapX = HxButtonBarDefaults.gap, gapY = HxButtonBarDefaults.gap,
			paddingX = HxButtonBarDefaults.paddingX,
			paddingT = HxButtonBarDefaults.paddingY, paddingB = HxButtonBarDefaults.paddingY,
			leading, tailing,
			...rest
		} = props;

		/**
		 * Dynamically determine alignment based on provided button groups:
		 * - Both groups present: space between
		 * - Only leading: align start
		 * - Only tailing: align end
		 */
		let justifyContent: HxFlexJustifyContent = 'space-between';
		if (leading == null) {
			// Align to right if only tailing buttons are present
			justifyContent = 'end';
		} else if (tailing == null) {
			// Align to left if only leading buttons are present
			justifyContent = 'start';
		}

		return <HxFlex {...rest}
		               paddingX={paddingX} paddingT={paddingT} paddingB={paddingB}
		               justifyContent={justifyContent}
		               ref={ref}>
			{leading != null
				? <HxFlex gapX={gapX} gapY={gapY}>
					{leading}
				</HxFlex>
				: null}
			{tailing != null
				? <HxFlex gapX={gapX} gapY={gapY}>
					{tailing}
				</HxFlex>
				: null}
		</HxFlex>;
	}) as unknown as HxButtonBarType;
// @ts-expect-error assign component name
HxButtonBar.displayName = 'HxButtonBar';

/**
 * Compact variant of HxButtonBar
 * A pre-configured version with no internal padding, designed to be embedded inside
 * other components (like form footers, panel headers) where padding is already provided
 * by the parent container. Inherits all other functionality from HxButtonBar.
 * @param props - Button bar configuration properties
 * @param ref - Forwarded ref to the underlying flex container element
 */
export const HxCompactButtonBar =
	forwardRef(<T extends object>(props: HxButtonBarProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			paddingX = 'none', paddingT = 'none', paddingB = 'none',
			...rest
		} = props;

		return <HxButtonBar {...rest}
		                    paddingX={paddingX} paddingT={paddingT} paddingB={paddingB}
		                    data-hx-button-bar=""
		                    ref={ref}/>;
	}) as unknown as HxButtonBarType;
// @ts-expect-error assign component name
HxCompactButtonBar.displayName = 'HxCompactButtonBar';
