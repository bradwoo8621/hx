// @ts-expect-error import React
import React, {isValidElement, MouseEvent, type ReactNode, useEffect, useRef} from 'react';
import {type HxContext, useHxContext, useHxOverlayInstance} from '../../contexts';
import type {HxColor, HxObject} from '../../types';
import {HxButton} from '../button';
import {HxFlex, type HxFlexJustifyContent} from '../flex';
import {Error as ErrorIcon, Exclamation, Info, Question, Success} from '../icons';
import {HxLabel} from '../label';
import {HxOverlayDefaults} from './defaults.ts';
import {HxOverlay} from './overlay';
import type {HxOverlayProps, HxToastRole} from './types';

/**
 * Type of toast notification, determines the default icon and color scheme
 * - info: General informational tips and notifications (blue)
 * - success: Operation success feedback (green)
 * - question: Confirmation prompts requiring user action (blue with question mark)
 * - warn: Warning reminders for risky operations (orange)
 * - error: Error and failure notifications (red)
 */
export type HxToastType = 'info' | 'success' | 'question' | 'warn' | 'error';

/**
 * Props for HxToast component
 * Extends base overlay props with toast-specific configuration
 * Disables backdrop click and ESC key close by default for non-intrusive notifications
 */
export type HxToastProps =
	Omit<HxOverlayProps, 'role' | 'width' | 'maxHeight' | 'hideOnClickBackdrop' | 'hideOnEscape' | 'children'>
	& {
	role: HxToastRole;
	/**
	 * Toast type to determine default icon and color scheme,
	 * or custom React element to use as icon for fully customized appearance
	 */
	type: HxToastType | ReactNode;
	/** Main content/message to display in the toast */
	message: ReactNode;
	/** Optional buttons to render on the left side of the toast footer */
	startButtons?: ReactNode;
	/** Optional buttons to render on the right side of the toast footer */
	endButtons?: ReactNode;
	/**
	 * Auto dismiss configuration:
	 * - true: Use default auto close delay from global config
	 * - false: Disable auto close, requires manual dismissal
	 * - number: Auto close after specified milliseconds (minimum 2000ms to ensure readability)
	 */
	dismissDelay?: boolean | number;
	/** Callback function triggered when user clicks the Dismiss button */
	onDismissed?: <T extends object>(ev: MouseEvent<HTMLElement> | undefined, $model: HxObject<T> | null | undefined, context: HxContext) => void;
};

type HxToastDismissBarProps<T extends object> = Pick<HxToastProps, 'onDismissed' | 'dismissDelay'> & {
	$model?: HxObject<T>;
	color?: HxColor
}

const HxToastDismissBar = <T extends object>(props: HxToastDismissBarProps<T>) => {
	const {$model, onDismissed, dismissDelay, color} = props;

	const context = useHxContext();
	const instanceContext = useHxOverlayInstance();
	const dismissBarRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (dismissBarRef.current != null) {
			dismissBarRef.current.addEventListener('transitionend', () => {
				onDismissed?.(void 0, $model, context);
				instanceContext.hide();
			}, {once: true});
			dismissBarRef.current.setAttribute('data-hx-toast-dismiss', '');
		}
	});
	/**
	 * Calculate auto dismiss timeout:
	 * - true: use global default toast dismiss delay
	 * - number: use provided value, minimum 2000ms to ensure users have time to read
	 * - false/undefined: disable auto dismiss (-1)
	 */
	const dismissTimeout = dismissDelay === true
		? HxOverlayDefaults.toastDismissDelay
		: (typeof dismissDelay === 'number'
			? Math.max(2000, dismissDelay)
			: -1);

	if (dismissTimeout === -1) {
		return (void 0);
	} else {
		return <HxFlex data-hx-toast-dismiss-bar=""
		               data-hx-color={color}
		               style={{transitionDuration: `${dismissTimeout}ms`}}
		               ref={dismissBarRef}/>;
	}
};

/**
 * Toast notification component
 * Lightweight, non-intrusive notification that appears at the edge of the screen
 * Does not block user interaction with the rest of the page
 * Supports auto-dismiss with animated progress indicator and custom action buttons
 * @param props - Toast configuration properties
 */
export const HxToast = (props: HxToastProps) => {
	const {type, message, startButtons, endButtons, onDismissed, dismissDelay, ...rest} = props;

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

	return <HxOverlay {...rest}
	                  data-hx-toast=""
	                  hideOnClickBackdrop={false} hideOnEscape={false}
	                  width="md">
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
			{/* Animated progress bar that indicates remaining time before auto dismiss */}
			<HxToastDismissBar onDismissed={onDismissed} dismissDelay={dismissDelay} color={color}/>
		</HxFlex>
	</HxOverlay>;
};

/**
 * Props for prebuilt single-button toast variants (info/success/warn/error)
 * Omits button configuration props and provides a single dismiss callback
 */
export type HxDismissibleToastProps = Omit<HxToastProps, 'type' | 'startButtons' | 'endButtons'>;

/**
 * Factory function to create single-button toast variants
 * Creates a toast with a default Dismiss button that closes the notification after triggering the confirm callback
 * @param type - Toast type to create
 * @param dismissDelay - Auto dismiss configuration for this toast variant
 * @returns Toast component with predefined Dismiss button
 */
const HxDismissibleToast = (type: HxToastType, dismissDelay: boolean | number = true) => {
	return (props: HxDismissibleToastProps) => {
		const {onDismissed, dismissDelay: delay, ...rest} = props;

		/**
		 * Handle Dismiss button click
		 * Triggers confirm callback if provided, then closes the toast notification
		 */
		const onDismissClick = <T extends object>(ev: MouseEvent<HTMLButtonElement>, $model: HxObject<T>, context: HxContext) => {
			onDismissed?.(ev, $model, context);
			context.overlayInstance?.hide();
		};

		return <HxToast {...rest}
		                type={type}
		                dismissDelay={delay ?? dismissDelay}
		                onDismissed={onDismissed}
		                endButtons={<HxButton various="outline" color="waive"
		                                      text="~HxCommon.DismissButton" // I18n key for "OK" button text, automatically adapts to current language
		                                      onClick={onDismissClick}/>}/>;
	};
};

/** Info toast variant with blue info icon and Dismiss button, auto closes after default delay */
export const HxInfoToast = HxDismissibleToast('info');
// @ts-expect-error assign component name
HxInfoToast.displayName = 'HxInfoToast';
/** Success toast variant with green success icon and Dismiss button, auto closes after default delay */
export const HxSuccessToast = HxDismissibleToast('success');
// @ts-expect-error assign component name
HxSuccessToast.displayName = 'HxSuccessToast';
/** Warning toast variant with orange warning icon and Dismiss button, auto closes after default delay */
export const HxWarnToast = HxDismissibleToast('warn');
// @ts-expect-error assign component name
HxWarnToast.displayName = 'HxWarnToast';
/** Error toast variant with red error icon and Dismiss button, does NOT auto close by default */
export const HxErrorToast = HxDismissibleToast('error', false);
// @ts-expect-error assign component name
HxErrorToast.displayName = 'HxErrorToast';
