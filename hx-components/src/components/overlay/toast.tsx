// @ts-expect-error import React
import React, {isValidElement, MouseEvent, type ReactNode} from 'react';
import type {HxContext} from '../../contexts';
import type {HxColor, HxObject} from '../../types';
import {HxButton} from '../button';
import {HxFlex, type HxFlexJustifyContent} from '../flex';
import {Error as ErrorIcon, Exclamation, Info, Question, Success} from '../icons';
import {HxLabel} from '../label';
import {HxOverlayDefaults} from './defaults.ts';
import {HxOverlay} from './overlay';
import type {HxOverlayProps} from './types';

export type HxToastType = 'info' | 'success' | 'question' | 'warn' | 'error';

export type HxToastProps =
	Omit<HxOverlayProps, 'width' | 'maxHeight' | 'hideOnClickBackdrop' | 'hideOnEscape' | 'children'>
	& {
	type: HxToastType | ReactNode;
	message: ReactNode;
	startButtons?: ReactNode;
	endButtons?: ReactNode;
	dismissDelay?: boolean | number;
};

export const HxToast = (props: HxToastProps) => {
	const {type, message, startButtons, endButtons, dismissDelay, ...rest} = props;

	// noinspection DuplicatedCode
	let color: HxColor | undefined = (void 0);
	let icon: ReactNode;
	switch (type) {
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
			if (isValidElement(type)) {
				icon = type;
			} else {
				// Fallback to error type for invalid values
				color = 'danger';
				icon = <ErrorIcon/>;
			}
			break;
		}
	}

	// Adjust footer alignment based on provided button groups
	let justifyContent: HxFlexJustifyContent = 'space-between';
	if (startButtons == null) {
		// Align to right if only end buttons are present
		justifyContent = 'end';
	} else if (endButtons == null) {
		// Align to left if only start buttons are present
		justifyContent = 'start';
	}

	let dismissTimeout = dismissDelay === true
		? HxOverlayDefaults.toastDismissDelay
		: (typeof dismissDelay === 'number'
			? Math.max(2000, dismissDelay)
			: -1);

	return <HxOverlay {...rest}
	                  data-hx-tost=""
	                  hideOnClickBackdrop={false} hideOnEscape={false}
	                  width="sm">
		<HxFlex direction="dir-y" paddingX="xl" paddingT="xl" paddingB="xl">
			<HxFlex data-hx-margin-b="lg" alignItems="start" gapX="xs" wrap={false}>
				<HxLabel text={icon} color={color}/>
				<HxLabel text={message}/>
			</HxFlex>
			<HxFlex justifyContent={justifyContent}>
				{startButtons != null
					? <HxFlex>
						{startButtons}
					</HxFlex>
					: null}
				{endButtons != null
					? <HxFlex>
						{endButtons}
					</HxFlex>
					: null}
			</HxFlex>
			{dismissTimeout !== -1
				? <HxFlex data-hx-toast-dismiss-bar=""
				          data-hx-color={color}
				          style={{transitionDuration: `${dismissTimeout}ms`}}/>
				: null}
		</HxFlex>
	</HxOverlay>;
};

/**
 * Props for prebuilt single-button alert variants (info/success/warn/error)
 * Omits button configuration props and provides a single confirm callback
 */
export type HxDismissibleToastProps =
	Omit<HxToastProps, 'type' | 'dismissDelay' | 'startButtons' | 'endButtons'>
	& {
	/** Callback function triggered when user clicks the OK button */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	confirm?: (ev: MouseEvent<HTMLButtonElement>, $model: HxObject<any> | null | undefined, context: HxContext) => void;
};

/**
 * Factory function to create single-button alert variants
 * Creates an alert with a default OK button that closes the dialog after triggering the confirm callback
 * @param type - Alert type to create
 * @param dismissDelay
 * @returns Alert component with predefined OK button
 */
const HxDismissibleToast = (type: HxToastType, dismissDelay: boolean | number = true) => {
	return (props: HxDismissibleToastProps) => {
		const {confirm, ...rest} = props;

		/**
		 * Handle OK button click
		 * Triggers confirm callback if provided, then closes the alert
		 */
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const onDismissClick = (ev: MouseEvent<HTMLButtonElement>, $model: HxObject<any>, context: HxContext) => {
				confirm?.(ev, $model, context);
				context.overlayInstance?.hide();
			};

		return <HxToast {...rest}
		                type={type}
		                dismissDelay={dismissDelay}
		                endButtons={<HxButton various="solid" color="primary"
		                                      text="~HxCommon.DismissButton" // I18n key for "OK" button text, automatically adapts to current language
		                                      onClick={onDismissClick}/>}/>;
	};
};

/** Info alert variant with blue info icon and OK button */
export const HxInfoToast = HxDismissibleToast('info');
// @ts-expect-error assign component name
HxInfoToast.displayName = 'HxInfoToast';
/** Success alert variant with green success icon and OK button */
export const HxSuccessToast = HxDismissibleToast('success');
// @ts-expect-error assign component name
HxSuccessToast.displayName = 'HxSuccessToast';
/** Warning alert variant with orange warning icon and OK button */
export const HxWarnToast = HxDismissibleToast('warn');
// @ts-expect-error assign component name
HxWarnToast.displayName = 'HxWarnToast';
/** Error alert variant with red error icon and OK button */
export const HxErrorToast = HxDismissibleToast('error', false);
// @ts-expect-error assign component name
HxErrorToast.displayName = 'HxErrorToast';
