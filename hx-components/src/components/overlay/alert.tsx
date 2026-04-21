// @ts-expect-error import React
import React, {isValidElement, type MouseEvent, type ReactNode} from 'react';
import type {HxContext} from '../../contexts';
import type {HxColor, HxObject} from '../../types';
import {HxButton} from '../button';
import {HxFlex, type HxFlexJustifyContent} from '../flex';
import {Error as ErrorIcon, Exclamation, Info, Question, Success} from '../icons';
import {HxLabel} from '../label';
import {HxOverlay} from './overlay';
import type {HxOverlayProps} from './types';

/**
 * Type of alert dialog, determines the default icon and color scheme
 * - info: Informational message (blue)
 * - success: Success notification (green)
 * - question: Confirmation prompt for user decisions (blue with question mark)
 * - warn: Warning message (orange)
 * - error: Error notification (red)
 */
export type HxAlertType = 'info' | 'success' | 'question' | 'warn' | 'error';

/**
 * Props for HxAlert component
 * Extends base overlay props with alert-specific configuration
 */
export type HxAlertProps = Omit<HxOverlayProps, 'role' | 'maxHeight' | 'children'> & {
	/** Alert type to determine default icon and color, or custom React element to use as icon */
	type: HxAlertType | ReactNode;
	/** Main content/message to display in the alert */
	message: ReactNode;
	/** Optional buttons to render on the left side of the alert footer */
	startButtons?: ReactNode;
	/** Optional buttons to render on the right side of the alert footer */
	endButtons?: ReactNode;
};

/**
 * Base alert dialog component
 * Renders a modal alert with icon, message, and customizable action buttons
 * Supports built-in alert types with predefined icons and colors, or custom icon
 * Automatically adjusts button alignment based on which button groups are provided
 * @param props - Alert configuration properties
 */
export const HxAlert = (props: HxAlertProps) => {
	const {type, message, startButtons, endButtons, ...rest} = props;

	// Determine icon and color based on alert type, or use custom icon if provided
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

	return <HxOverlay {...rest} width="sm" role="alert">
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
		</HxFlex>
	</HxOverlay>;
};

/**
 * Props for prebuilt single-button alert variants (info/success/warn/error)
 * Omits button configuration props and provides a single confirm callback
 */
export type HxOkAlertProps = Omit<HxAlertProps, 'type' | 'startButtons' | 'endButtons'> & {
	/** Callback function triggered when user clicks the OK button */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	confirm?: (ev: MouseEvent<HTMLButtonElement>, $model: HxObject<any> | null | undefined, context: HxContext) => void;
};

/**
 * Factory function to create single-button alert variants
 * Creates an alert with a default OK button that closes the dialog after triggering the confirm callback
 * @param type - Alert type to create
 * @returns Alert component with predefined OK button
 */
const HxOkAlert = (type: HxAlertType) => {
	return (props: HxOkAlertProps) => {
		const {confirm, ...rest} = props;

		/**
		 * Handle OK button click
		 * Triggers confirm callback if provided, then closes the alert
		 */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const onOkClick = (ev: MouseEvent<HTMLButtonElement>, $model: HxObject<any>, context: HxContext) => {
			confirm?.(ev, $model, context);
			context.overlayInstance?.hide();
		};

		return <HxAlert {...rest} data-hx-alert=""
		                type={type}
		                endButtons={<HxButton various="solid" color="primary"
		                                      text="~HxCommon.OkButton"
		                                      onClick={onOkClick}/>}/>;
	};
};

/** Info alert variant with blue info icon and OK button */
export const HxInfoAlert = HxOkAlert('info');
// @ts-expect-error assign component name
HxInfoAlert.displayName = 'HxInfoAlert';
/** Success alert variant with green success icon and OK button */
export const HxSuccessAlert = HxOkAlert('success');
// @ts-expect-error assign component name
HxSuccessAlert.displayName = 'HxSuccessAlert';
/** Warning alert variant with orange warning icon and OK button */
export const HxWarnAlert = HxOkAlert('warn');
// @ts-expect-error assign component name
HxWarnAlert.displayName = 'HxWarnAlert';
/** Error alert variant with red error icon and OK button */
export const HxErrorAlert = HxOkAlert('error');
// @ts-expect-error assign component name
HxErrorAlert.displayName = 'HxErrorAlert';

/**
 * Props for question/confirmation alert
 * Omits button configuration and provides yes/no action callbacks
 */
export type HxQuestionAlertProps = Omit<HxAlertProps, 'type' | 'startButtons' | 'endButtons'> & {
	/** Required callback function triggered when user clicks the Yes/Confirm button */
	yes: <T extends object>(ev: MouseEvent<HTMLButtonElement>, $model: HxObject<T> | null | undefined, context: HxContext) => void;
	/** Optional callback function triggered when user clicks the No/Cancel button */
	no?: <T extends object>(ev: MouseEvent<HTMLButtonElement>, $model: HxObject<T> | null | undefined, context: HxContext) => void;
};

/**
 * Question/confirmation alert component
 * Renders an alert with a question mark icon and two buttons: No (cancel) and Yes (confirm)
 * @param props - Question alert configuration properties
 */
export const HxQuestionAlert = (props: HxQuestionAlertProps) => {
	const {yes, no, ...rest} = props;

	/**
	 * Handle Yes button click
	 * Triggers yes callback, then closes the alert
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onYesClick = (ev: MouseEvent<HTMLButtonElement>, $model: HxObject<any>, context: HxContext) => {
		yes(ev, $model, context);
		context.overlayInstance?.hide();
	};
	/**
	 * Handle No button click
	 * Triggers no callback if provided, then closes the alert
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onNoClick = (ev: MouseEvent<HTMLButtonElement>, $model: HxObject<any>, context: HxContext) => {
		no?.(ev, $model, context);
		context.overlayInstance?.hide();
	};

	return <HxAlert {...rest} data-hx-alert=""
	                type="question"
	                endButtons={<HxFlex gapX="xs">
		                <HxButton various="ghost" color="waive"
		                          text="~HxCommon.NoButton"
		                          onClick={onNoClick}/>
		                <HxButton various="solid" color="primary"
		                          text="~HxCommon.YesButton"
		                          onClick={onYesClick}/>
	                </HxFlex>}/>;
};

