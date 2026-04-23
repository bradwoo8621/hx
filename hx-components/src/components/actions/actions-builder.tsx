// @ts-expect-error import React
import React, {
	isValidElement,
	type KeyboardEventHandler,
	type MouseEvent,
	type MouseEventHandler,
	type ReactElement,
	type ReactNode
} from 'react';
import type {HxObject, HxSyntheticEventHandler, WithRequired} from '../../types';
import {forceInterposeToChildren, HxConsole} from '../../utils';
import {HxButton, type HxButtonColor, type HxButtonVarious} from '../button';
import {DotsY} from '../icons';
import {HxLabel} from '../label';
import {HxSeparator} from '../separator';
import type {
	HxAction,
	HxActionGroup,
	HxActionGroups,
	HxActionsLeading,
	HxActionsLeadingLabel,
	HxActionsTailing
} from './types';

export interface ContentBuildOptions<T extends object, L> {
	actions?: L,
	$model: HxObject<T> | undefined;
	disabled: boolean;
	color?: HxButtonColor;
	various: HxButtonVarious;
	openPopup: () => void;
	closePopup: () => void;
	buildPopupTrigger: boolean;
	onTriggerKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
	buttonAdditionalProps?: {
		tabIndex?: number;
		onMouseEnter?: MouseEventHandler<HTMLButtonElement>;
	}
}

type ContentBuildInnerOptions<T extends object, L> = WithRequired<ContentBuildOptions<T, L>, 'actions'>;

const buildContentByStr = <T extends object>(options: ContentBuildInnerOptions<T, string>) => {
	const {actions, $model, disabled, color, various, openPopup, onTriggerKeyDown} = options;
	const text = <>
		<HxLabel text={actions}/>
		<HxLabel text={<DotsY/>}/>
	</>;
	return <HxButton text={text} $model={$model} $disabled={disabled} color={color} various={various}
	                 onClick={openPopup} onKeyDown={onTriggerKeyDown}/>;
};

const buildContentByLabel = <T extends object>(options: ContentBuildInnerOptions<T, HxActionsLeadingLabel>) => {
	const {actions, $model, disabled, color, various, openPopup, onTriggerKeyDown} = options;

	const text = <>
		{actions}
		<HxLabel text={<DotsY/>}/>
	</>;
	return <HxButton text={text} $model={$model} $disabled={disabled} color={color} various={various}
	                 onClick={openPopup} onKeyDown={onTriggerKeyDown}/>;
};

// eslint-disable-next-line
const buildPopupOpenIconButton = <T extends object>(options: ContentBuildOptions<T, any>) => {
	const {$model, disabled, color, various, openPopup, onTriggerKeyDown} = options;
	return <HxButton data-hx-button-svg-icon=""
	                 text={<HxLabel text={<DotsY/>}/>}
	                 $model={$model}
	                 $disabled={disabled} color={color} various={various}
	                 onClick={openPopup} onKeyDown={onTriggerKeyDown}/>;
};

const buildContentByButton = <T extends object>(options: ContentBuildInnerOptions<T, HxAction>) => {
	const {actions: button, $model, disabled, color, various, closePopup, buttonAdditionalProps} = options;

	const interposed = {various};

	if (disabled) {
		// @ts-expect-error ignore type check
		interposed.$diabled = true;
	}
	if (button.props.$model == null) {
		// @ts-expect-error ignore type check
		interposed.$model = $model;
	}
	if (button.props.onClick == null) {
		// @ts-expect-error ignore type check
		interposed.onClick = closePopup;
	} else {
		const onClick = button.props.onClick;
		// @ts-expect-error ignore type check
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		interposed.onClick = (...args: Array<any>) => {
			closePopup();
			// @ts-expect-error ignore type check
			onClick(...args);
		};
	}
	if (color != null) {
		// @ts-expect-error ignore type check
		interposed.color = color;
	}
	if (buttonAdditionalProps != null) {
		if (buttonAdditionalProps.tabIndex != null) {
			// @ts-expect-error ignore type check
			interposed.tabIndex = buttonAdditionalProps.tabIndex;
		}
		if (buttonAdditionalProps.onMouseEnter != null) {
			const onMouseEnter = button.props.onMouseEnter;
			if (onMouseEnter == null) {
				// @ts-expect-error ignore type check
				interposed.onMouseEnter = buttonAdditionalProps.onMouseEnter;
			} else {
				const additionalOnMouseEnter = buttonAdditionalProps.onMouseEnter;
				// @ts-expect-error ignore type check
				interposed.onMouseEnter = ((ev: MouseEvent<HTMLButtonElement>, ...args) => {
					additionalOnMouseEnter(ev);
					onMouseEnter(ev, ...args);
				}) as HxSyntheticEventHandler<MouseEvent<HTMLButtonElement>, T>;
			}
		}
	}
	return forceInterposeToChildren(interposed, button);
};

const buildByValidElement = <T extends object>(options: ContentBuildInnerOptions<T, ReactElement>) => {
	const {actions, buildPopupTrigger} = options;

	// @ts-expect-error ignore the displayName existing check
	const type = actions.type === 'string' ? actions.type : actions.type.displayName;
	switch (type) {
		case 'HxButton': {
			return buildPopupTrigger
				? <>
					{buildContentByButton({...options, actions: actions as HxAction})}
					{buildPopupOpenIconButton(options)}
				</>
				: buildContentByButton({...options, actions: actions as HxAction});
		}
		case 'HxLabel': {
			return buildPopupTrigger
				? buildContentByLabel({...options, actions: actions as HxActionsLeadingLabel})
				: (void 0);
		}
		default: {
			HxConsole.error(`Component[type=${type}] not supported to render as HxAction, ignored.`);
			return (void 0);
		}
	}
};

export const buildContent = <T extends object>(options: ContentBuildOptions<T, HxActionsLeading | HxActionsTailing>) => {
	const {actions, buildPopupTrigger} = options;

	if (actions == null) {
		return buildPopupTrigger ? buildPopupOpenIconButton(options) : (void 0);
	} else if (typeof actions === 'string') {
		return buildContentByStr({...options, actions: actions as string});
	} else if (Array.isArray(actions)) {
		const hasGroup = actions.some(action => Array.isArray(action));
		if (hasGroup) {
			return <>
				{(actions as HxActionGroups).reduce((acc, a) => {
					const thisRound: Array<ReactNode> = [];
					if (Array.isArray(a)) {
						a.forEach(a => {
							const node = buildByValidElement({
								...options,
								actions: a as ReactElement,
								buildPopupTrigger: false
							});
							if (node != null) {
								thisRound.push(node);
							}
						});
					} else {
						const node = buildByValidElement({
							...options,
							actions: a as ReactElement,
							buildPopupTrigger: false
						});
						if (node != null) {
							thisRound.push(node);
						}
					}
					if (thisRound.length !== 0) {
						if (acc.length !== 0) {
							acc.push(<HxSeparator direction="dir-x" key={acc.length}/>);
						}
						acc.push(...thisRound);
					}
					return acc;
				}, [] as Array<ReactNode>)}
				{buildPopupTrigger ? buildPopupOpenIconButton(options) : (void 0)}
			</>;
		} else {
			return <>
				{(actions as HxActionGroup).map(a => buildByValidElement({
					...options,
					actions: a as ReactElement,
					buildPopupTrigger: false
				}))}
				{buildPopupTrigger ? buildPopupOpenIconButton(options) : (void 0)}
			</>;
		}
	} else if (isValidElement(actions)) {
		return buildByValidElement({...options, actions: actions as ReactElement});
	}
};
