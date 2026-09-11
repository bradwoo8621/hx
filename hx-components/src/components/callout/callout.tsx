// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	isValidElement,
	type ReactElement,
	type ReactNode,
	type RefAttributes
} from 'react';
import type {HxColor} from '../../types';
import {HxBox} from '../box';
import {HxFlex} from '../flex';
import {Error as ErrorIcon, Exclamation, Info, Question, Success} from '../icons';
import {HxLabel} from '../label';
import {HxCalloutDefaults} from './defaults';
import type {HxCalloutProps} from './types';

export type HxCalloutType = <T extends object>(
	props: HxCalloutProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

export const HxCallout =
	forwardRef(<T extends object>(props: HxCalloutProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {$model, kind, message, ...rest} = props;

		// noinspection DuplicatedCode
		let color: HxColor | undefined = (void 0);
		let icon: ReactNode;
		switch (kind) {
			case 'info': {
				color = 'info';
				icon = <Info/>;
				break;
			}
			case 'success': {
				color = 'success';
				icon = <Success/>;
				break;
			}
			case 'question': {
				color = 'primary';
				icon = <Question/>;
				break;
			}
			case 'warn': {
				color = 'warn';
				icon = <Exclamation/>;
				break;
			}
			case 'error': {
				color = 'danger';
				icon = <ErrorIcon/>;
				break;
			}
			default: {
				// Use custom element as icon if valid React element is provided
				if (isValidElement(kind)) {
					icon = kind;
				} else {
					// Fallback to error type for invalid values
					color = 'danger';
					icon = <ErrorIcon/>;
				}
				break;
			}
		}

		// set default value
		Object.keys(HxCalloutDefaults).forEach(key => {
			const prop = key as keyof typeof HxCalloutDefaults;
			// @ts-expect-error ignore the type check
			rest[prop] = rest[prop] ?? HxCalloutDefaults[prop];
		});

		return <HxFlex {...rest} $model={$model}
		               direction="dir-y"
		               data-hx-callout=""
		               ref={ref}>
			<HxBox data-hx-callout-background="" data-hx-color={color}/>
			<HxFlex alignItems="start" gapX="sm" wrap={false} data-hx-callout-content="">
				<HxLabel text={icon} color={color} data-hx-callout-icon=""/>
				<HxLabel text={message}/>
			</HxFlex>
		</HxFlex>;
	}) as unknown as HxCalloutType;
// @ts-expect-error assign component name
HxCallout.displayName = 'HxCallout';
