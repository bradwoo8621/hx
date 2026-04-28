// @ts-expect-error import React
import React from 'react';
import type {HxObject} from '../../types';
import {HxTabsDefaults} from './defaults';
import {HxTabBody} from './tab-body';
import type {HxExtTabsProps} from './types';

/**
 * Props interface for the HxTabsBody component
 * Inherits styling and content properties from the main tabs configuration
 */
export type HxTabsBodyProps<T extends object> =
	&    Pick<HxExtTabsProps<T>,
		| 'border' | 'borderRadius'
		| 'paddingX' | 'paddingT' | 'paddingB'
		| 'contentContainerType' | 'content'
		| 'restoreScroll'>
	& { $model?: HxObject<T> };

/**
 * HxTabsBody Component
 *
 * The container component that holds all tab body content sections
 * Manages the styling of the content area including borders, padding, and border radius
 * Renders all individual tab body components, only the active tab's body is visible
 *
 * @param props - Component properties including styling, content array, and reactive model
 */
export const HxTabsBody = <T extends object>(props: HxTabsBodyProps<T>) => {
	const {
		$model,
		border, borderRadius = HxTabsDefaults.borderRadius,
		paddingX = HxTabsDefaults.paddingX,
		paddingT = HxTabsDefaults.paddingT, paddingB = HxTabsDefaults.paddingB,
		contentContainerType = HxTabsDefaults.containerType,
		content,
		restoreScroll = HxTabsDefaults.restoreScroll
	} = props;

	return <div data-hx-tabs-body=""
	            data-hx-border={border ? '' : (void 0)} data-hx-border-radius={borderRadius}
	            data-hx-padding-x={paddingX} data-hx-padding-t={paddingT} data-hx-padding-b={paddingB}>
		{/* Render all tab body components, visibility is controlled individually per tab */}
		{content.map((child, index) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const {defaultActive, header, ...rest} = child;
			return <HxTabBody {...rest}
			                  containerType={contentContainerType} restoreScroll={restoreScroll}
			                  $model={$model} index={index}
			                  key={index}/>;
		})}
	</div>;
};
