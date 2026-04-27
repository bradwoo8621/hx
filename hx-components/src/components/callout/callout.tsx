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
import {HxFlex, type HxFlexProps} from '../flex';
import {Error as ErrorIcon, Exclamation, Info, Question, Success} from '../icons';
import {HxLabel} from '../label';

export type HxCalloutKind = 'info' | 'success' | 'question' | 'warn' | 'error';

export interface HxCalloutProps<T extends object> extends Omit<HxFlexProps<T>, 'children'> {
	kind: HxCalloutKind | ReactNode;
	message: ReactNode;
}

export type HxCalloutType = <T extends object>(
	props: HxCalloutProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

export const HxCallout =
	forwardRef(<T extends object>(props: HxCalloutProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model,
			kind, message,
			...rest
		} = props;

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
				color = 'info';
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

		return <HxFlex {...rest} $model={$model}
		               direction="dir-y"
		               paddingX="xl" paddingT="xl" paddingB="xl"
		               borderRadius="lg"
		               data-hx-callout=""
		               data-hx-callout-color={color}
		               ref={ref}>
			<div data-hx-callout-background=""/>
			<HxFlex alignItems="start" gapX="xs" wrap={false} data-hx-callout-content="">
				<HxLabel text={icon} color={color} data-hx-callout-icon=""/>
				<HxLabel text={message}/>
			</HxFlex>
		</HxFlex>;
	}) as unknown as HxCalloutType;
// @ts-expect-error assign component name
HxCallout.displayName = 'HxCallout';
