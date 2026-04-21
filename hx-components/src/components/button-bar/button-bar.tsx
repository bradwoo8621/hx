// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type ReactNode, type RefAttributes} from 'react';
import {HxFlex, type HxFlexJustifyContent, type HxFlexProps} from '../flex';
import {HxButtonBarDefaults} from './defaults.ts';

export interface HxButtonBarProps<T extends object> extends Omit<HxFlexProps<T>, 'justifyContent' | 'children'> {
	leading?: ReactNode;
	tailing?: ReactNode;
}

export type HxButtonBarType = <T extends object>(
	props: HxButtonBarProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

export const HxButtonBar =
	forwardRef(<T extends object>(props: HxButtonBarProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			gapX = HxButtonBarDefaults.gap, gapY = HxButtonBarDefaults.gap,
			paddingX = HxButtonBarDefaults.paddingX,
			paddingT = HxButtonBarDefaults.paddingY, paddingB = HxButtonBarDefaults.paddingY,
			leading, tailing,
			...rest
		} = props;

		// Adjust footer alignment based on provided button groups
		let justifyContent: HxFlexJustifyContent = 'space-between';
		if (leading == null) {
			// Align to right if only end buttons are present
			justifyContent = 'end';
		} else if (tailing == null) {
			// Align to left if only start buttons are present
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

export const HxCompactButtonBar =
	forwardRef(<T extends object>(props: HxButtonBarProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			paddingX = 'none', paddingT = 'none', paddingB = 'none',
			...rest
		} = props;

		return <HxButtonBar {...rest}
		                    paddingX={paddingX} paddingT={paddingT} paddingB={paddingB}
		                    ref={ref}/>;
	}) as unknown as HxButtonBarType;
// @ts-expect-error assign component name
HxCompactButtonBar.displayName = 'HxCompactButtonBar';
