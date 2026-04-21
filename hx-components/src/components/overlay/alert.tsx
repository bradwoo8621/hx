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

export type HxAlertType = 'info' | 'success' | 'question' | 'warn' | 'error';

export type HxAlertProps = Omit<HxOverlayProps, 'role' | 'maxHeight' | 'children'> & {
	type: HxAlertType | ReactNode;
	message: ReactNode;
	startButtons?: ReactNode;
	endButtons?: ReactNode;
};

export const HxAlert = (props: HxAlertProps) => {
	const {type, message, startButtons, endButtons, ...rest} = props;

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
			if (isValidElement(type)) {
				icon = type;
			} else {
				color = 'danger';
				icon = <ErrorIcon/>;
			}
			break;
		}
	}

	let justifyContent: HxFlexJustifyContent = 'space-between';
	if (startButtons == null) {
		justifyContent = 'end';
	} else if (endButtons == null) {
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

export type HxOkAlertProps = Omit<HxAlertProps, 'type' | 'startButtons' | 'endButtons'> & {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	confirm?: (ev: MouseEvent<HTMLButtonElement>, $model: HxObject<any> | null | undefined, context: HxContext) => void;
};
const HxOkAlert = (type: HxAlertType) => {
	return (props: HxOkAlertProps) => {
		const {confirm, ...rest} = props;

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

export const HxInfoAlert = HxOkAlert('info');
// @ts-expect-error assign component name
HxInfoAlert.displayName = 'HxInfoAlert';
export const HxSuccessAlert = HxOkAlert('success');
// @ts-expect-error assign component name
HxSuccessAlert.displayName = 'HxSuccessAlert';
export const HxWarnAlert = HxOkAlert('warn');
// @ts-expect-error assign component name
HxWarnAlert.displayName = 'HxWarnAlert';
export const HxErrorAlert = HxOkAlert('error');
// @ts-expect-error assign component name
HxErrorAlert.displayName = 'HxErrorAlert';

export type HxQuestionAlertProps = Omit<HxAlertProps, 'type' | 'startButtons' | 'endButtons'> & {
	yes: <T extends object>(ev: MouseEvent<HTMLButtonElement>, $model: HxObject<T> | null | undefined, context: HxContext) => void;
	no?: <T extends object>(ev: MouseEvent<HTMLButtonElement>, $model: HxObject<T> | null | undefined, context: HxContext) => void;
};
export const HxQuestionAlert = (props: HxQuestionAlertProps) => {
	const {yes, no, ...rest} = props;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onYesClick = (ev: MouseEvent<HTMLButtonElement>, $model: HxObject<any>, context: HxContext) => {
		yes(ev, $model, context);
		context.overlayInstance?.hide();
	};
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

