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

/**
 * Options for content builder utility
 * Defines all configuration needed to render actions content for both trigger and popup
 */
export interface ContentBuildOptions<T extends object, L> {
	/** Actions content to render: string, button, button group, or nested groups */
	actions?: L,
	/** Reactive model for data binding */
	$model: HxObject<T> | undefined;
	/** Whether the actions are disabled */
	disabled: boolean;
	/** Color scheme for buttons */
	color?: HxButtonColor;
	/** Style variant for buttons */
	various: HxButtonVarious;
	/** Callback to open the popup (used for trigger buttons) */
	openPopup: () => void;
	/** Callback to close the popup (used for action buttons in popup) */
	closePopup: () => void;
	/** Whether we are building content for the popup trigger (vs popup content) */
	buildPopupTrigger: boolean;
	/** Optional keyboard event handler for trigger button */
	onTriggerKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
	/** Additional props to apply to all rendered buttons */
	buttonAdditionalProps?: {
		tabIndex?: number;
		onMouseEnter?: MouseEventHandler<HTMLButtonElement>;
	}
}

/** Internal version of build options with required actions property */
type ContentBuildInnerOptions<T extends object, L> = WithRequired<ContentBuildOptions<T, L>, 'actions'>;

/**
 * Build trigger content from string
 * Renders a button with the given text and a dropdown icon
 * @param options - Build configuration
 */
const buildContentByStr = <T extends object>(options: ContentBuildInnerOptions<T, string>) => {
	const {actions, $model, disabled, color, various, openPopup, onTriggerKeyDown} = options;
	const text = <>
		<HxLabel text={actions}/>
		<HxLabel text={<DotsY/>}/>
	</>;
	return <HxButton $model={$model}
	                 text={text}
	                 $disabled={disabled} color={color} various={various}
	                 onClick={openPopup} onKeyDown={onTriggerKeyDown}/>;
};

/**
 * Build trigger content from HxLabel component
 * Wraps the label in a button with dropdown icon
 * @param options - Build configuration
 */
const buildContentByLabel = <T extends object>(options: ContentBuildInnerOptions<T, HxActionsLeadingLabel>) => {
	const {actions, $model, disabled, color, various, openPopup, onTriggerKeyDown} = options;

	const text = <>
		{actions}
		<HxLabel text={<DotsY/>}/>
	</>;
	return <HxButton text={text} $model={$model} $disabled={disabled} color={color} various={various}
	                 onClick={openPopup} onKeyDown={onTriggerKeyDown}/>;
};

/**
 * Build a standalone icon-only dropdown trigger button
 * Used when no leading content is provided (just a dots menu button)
 * @param options - Build configuration
 */
const buildPopupOpenIconButton = <T extends object>(options: ContentBuildOptions<T, unknown>) => {
	const {$model, disabled, color, various, openPopup, onTriggerKeyDown} = options;
	return <HxButton $model={$model}
	                 text={<HxLabel text={<DotsY/>}/>}
	                 $disabled={disabled} color={color} various={various}
	                 onClick={openPopup} onKeyDown={onTriggerKeyDown}
	                 data-hx-button-svg-icon=""/>;
};

/**
 * Build content from a single HxButton component
 * Injects props and wraps onClick to automatically close popup after action
 * @param options - Build configuration
 */
const buildContentByButton =
	<T extends object>(options: ContentBuildInnerOptions<T, HxAction> & { key?: string }) => {
		const {actions: button, $model, disabled, color, various, closePopup, buttonAdditionalProps, key} = options;

		// Props to interpose into the existing button
		const interposed = {various};

		// @ts-expect-error ignore type check
		if (key != null && interposed.key == null) {
			// @ts-expect-error ignore type check
			interposed.key = key;
		}
		if (disabled) {
			// @ts-expect-error ignore type check
			interposed.$disabled = true;
		}
		// Inject model if button doesn't have its own
		if (button.props.$model == null) {
			// @ts-expect-error ignore type check
			interposed.$model = $model;
		}
		// Wrap onClick to automatically close popup after action is triggered
		if (button.props.onClick == null) {
			// No existing onClick: just close popup
			// @ts-expect-error ignore type check
			interposed.onClick = closePopup;
		} else {
			// Existing onClick: close popup first, then call original handler
			const onClick = button.props.onClick;
			// @ts-expect-error ignore type check
			interposed.onClick = (...args: Array<unknown>) => {
				closePopup();
				// @ts-expect-error ignore type check
				onClick(...args);
			};
		}
		// Inject color if not provided
		// @ts-expect-error ignore type check
		if (color != null && interposed.color == null) {
			// @ts-expect-error ignore type check
			interposed.color = color;
		}
		// Inject additional button props if provided
		if (buttonAdditionalProps != null) {
			if (buttonAdditionalProps.tabIndex != null) {
				// @ts-expect-error ignore type check
				interposed.tabIndex = buttonAdditionalProps.tabIndex;
			}
			if (buttonAdditionalProps.onMouseEnter != null) {
				const onMouseEnter = button.props.onMouseEnter;
				if (onMouseEnter == null) {
					// No existing onMouseEnter: use provided one directly
					// @ts-expect-error ignore type check
					interposed.onMouseEnter = buttonAdditionalProps.onMouseEnter;
				} else {
					// Existing onMouseEnter: wrap to call both handlers
					const additionalOnMouseEnter = buttonAdditionalProps.onMouseEnter;
					// @ts-expect-error ignore type check
					interposed.onMouseEnter = ((ev: MouseEvent<HTMLButtonElement>, ...args) => {
						additionalOnMouseEnter(ev);
						onMouseEnter(ev, ...args);
					}) as HxSyntheticEventHandler<MouseEvent<HTMLButtonElement>, T>;
				}
			}
		}
		// Interpose props into the existing button component
		return forceInterposeToChildren(interposed, button);
	};

/**
 * Build content from a valid React element
 * Dispatches to appropriate builder based on component type (HxButton or HxLabel)
 * @param options - Build configuration
 */
const buildByValidElement =
	<T extends object>(options: ContentBuildInnerOptions<T, ReactElement> & { key?: string }): ReactNode => {
		const {actions, buildPopupTrigger, key} = options;

		// Get component type display name to handle different element types
		// @ts-expect-error ignore the displayName existing check
		const type = actions.type === 'string' ? actions.type : actions.type.displayName;
		switch (type) {
			case 'HxButton': {
				return buildPopupTrigger
					? [
						buildContentByButton({...options, actions: actions as HxAction, key}),
						buildPopupOpenIconButton(options)
					]
					: buildContentByButton({...options, actions: actions as HxAction, key});
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

/**
 * Main content builder function
 * Renders appropriate content based on the type of actions provided
 * Handles all cases: string, single button, button group, and nested groups with separators
 * Can build both trigger content and popup content based on buildPopupTrigger flag
 *
 * @param options - Build configuration
 */
export const buildContent = <T extends object>(options: ContentBuildOptions<T, HxActionsLeading | HxActionsTailing>) => {
	const {actions, buildPopupTrigger} = options;

	// No actions provided: render just the icon button if building trigger
	if (actions == null) {
		return buildPopupTrigger ? buildPopupOpenIconButton(options) : (void 0);
	}
	// String type: render string button with dropdown icon
	else if (typeof actions === 'string') {
		return buildContentByStr({...options, actions: actions as string});
	}
	// Array type: handle button groups and nested groups
	else if (Array.isArray(actions)) {
		// Check if array contains nested groups (arrays inside array)
		const hasGroup = actions.some(action => Array.isArray(action));
		if (hasGroup) {
			// Nested groups: render with separators between groups
			return <>
				{(actions as HxActionGroups).reduce((acc, a) => {
					const thisRound: Array<ReactNode> = [];
					if (Array.isArray(a)) {
						// Process each button in the group
						a.forEach(a => {
							const node = buildByValidElement({
								...options,
								actions: a as ReactElement,
								buildPopupTrigger: false,
								key: `option-${acc.length}`
							});
							if (node != null) {
								thisRound.push(node);
							}
						});
					} else {
						// Single button not in a group
						const node = buildByValidElement({
							...options,
							actions: a as ReactElement,
							buildPopupTrigger: false,
							key: `option-${acc.length}`
						});
						if (node != null) {
							thisRound.push(node);
						}
					}
					// Add separator between groups
					if (thisRound.length !== 0) {
						if (acc.length !== 0) {
							acc.push(<HxSeparator direction="dir-x" key={`separator-${acc.length}`}/>);
						}
						acc.push(...thisRound);
					}
					return acc;
				}, [] as Array<ReactNode>)}
				{buildPopupTrigger ? buildPopupOpenIconButton(options) : (void 0)}
			</>;
		} else {
			// Flat array of buttons (single group): render without separators
			return <>
				{(actions as HxActionGroup).map((a, index) => buildByValidElement({
					...options,
					actions: a as ReactElement,
					buildPopupTrigger: false,
					key: `option-${index}`
				}))}
				{buildPopupTrigger ? buildPopupOpenIconButton(options) : (void 0)}
			</>;
		}
	}
	// Valid React element: dispatch to element-specific builder
	else if (isValidElement(actions)) {
		return buildByValidElement({...options, actions: actions as ReactElement});
	}
};
