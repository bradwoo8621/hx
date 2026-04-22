// @ts-expect-error import React
import React, {isValidElement, type ReactElement} from 'react';
import type {HxObject} from '../../types';
import {forceInterposeToChildren, HxConsole} from '../../utils';
import {HxButton} from '../button';
import {TriangleDown} from '../icons';
import {HxLabel} from '../label';
import type {HxAction, HxActionsColor, HxActionsLeading, HxActionsLeadingLabel, HxActionVarious} from './types';

export interface ContentBuildOptions<T extends object, L> {
	actions: L,
	$model: HxObject<T> | undefined;
	disabled: boolean;
	color: HxActionsColor;
	various: HxActionVarious;
	openPopup: () => void;
	closePopup: () => void;
}

const buildContentByStr = <T extends object>(options: ContentBuildOptions<T, string>) => {
	const {actions, $model, disabled, color, various, openPopup} = options;
	const text = <>
		<HxLabel text={actions}/>
		<HxLabel text={<TriangleDown/>}/>
	</>;
	return <HxButton text={text} $model={$model} $disabled={disabled} color={color} various={various}
	                 onClick={openPopup}/>;
};

// eslint-disable-next-line
const buildPopupOpenIconButton = <T extends object>(options: ContentBuildOptions<T, any>) => {
	const {$model, disabled, color, various, openPopup} = options;
	return <HxButton data-hx-button-svg-icon=""
	                 text={<HxLabel text={<TriangleDown/>}/>}
	                 $model={$model}
	                 $disabled={disabled} color={color} various={various} onClick={openPopup}/>;
};

const buildContentByButton = <T extends object>(options: ContentBuildOptions<T, HxAction>) => {
	const {actions: button, $model, disabled, color, various, closePopup} = options;

	const interposed = {color, various};

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
	return forceInterposeToChildren(interposed, button);
};

const buildContentByLabel = <T extends object>(options: ContentBuildOptions<T, HxActionsLeadingLabel>) => {
	const {actions, $model, disabled, color, various, openPopup} = options;

	return <HxButton text={<>
		{actions}
		<HxLabel text={<TriangleDown/>}/>
	</>} $model={$model} $disabled={disabled} color={color} various={various} onClick={openPopup}/>;
};

const buildByValidElement = <T extends object>(options: ContentBuildOptions<T, ReactElement>, popup: boolean) => {
	const {actions} = options;

	// @ts-expect-error ignore the displayName existing check
	const type = actions.type === 'string' ? actions.type : actions.type.displayName;
	switch (type) {
		case 'HxButton': {
			return popup
				? <>
					{buildContentByButton({...options, actions: actions as HxAction})}
					{buildPopupOpenIconButton(options)}
				</>
				: buildContentByButton({...options, actions: actions as HxAction});
		}
		case 'HxLabel': {
			return popup
				? buildContentByLabel({...options, actions: actions as HxActionsLeadingLabel})
				: (void 0);
		}
		default: {
			HxConsole.error(`Component[type=${type}] not supported to render as HxAction, ignored.`);
			return (void 0);
		}
	}
};

export const buildContent = <T extends object>(options: ContentBuildOptions<T, HxActionsLeading>) => {
	const {actions} = options;

	if (typeof actions === 'string') {
		return buildContentByStr({...options, actions: actions as string});
	} else if (Array.isArray(actions)) {
		return <>
			{actions.map(a => buildByValidElement({...options, actions: a as ReactElement}, false))}
			{buildPopupOpenIconButton(options)}
		</>;
	} else if (isValidElement(actions)) {
		return buildByValidElement({...options, actions: actions as ReactElement}, true);
	}
};
