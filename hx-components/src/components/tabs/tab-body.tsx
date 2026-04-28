// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import type {HxObject} from '../../types';
import {restoreScroll} from '../../utils';
import {HxFlex} from '../flex';
import {HxGrid} from '../grid';
import {HxDiv} from '../penetrable-basic';
import {useHxTabs} from './tabs-provider';
import type {HxTab, HxTabBodyContainerType} from './types';

/**
 * Props interface for the individual HxTabBody component
 * Inherits tab content properties and accepts container type configuration
 */
export type HxTabBodyProps<T extends object> =
	& Omit<HxTab<T>, 'defaultActive' | 'header' | '$visible' | '$disabled'>
	& {
	/** Layout container type to use for this tab's content (block/flex/grid) */
	containerType: HxTabBodyContainerType;
	restoreScroll: boolean;
	/** Reactive model passed down from the parent tabs component */
	$model?: HxObject<T>,
	/** Zero-based index of this tab in the tabs array */
	index: number;
};

/**
 * HxTabBody Component
 *
 * Individual tab body container that holds the content for a single tab
 * Only visible when its corresponding tab header is active
 * Features:
 * - Supports multiple layout container types (block, flex, grid) for flexible content styling
 * - Automatically shows/hides based on the active tab state
 * - Reactive content support via the passed $model
 * - Optimized rendering - content remains in the DOM but hidden when inactive, preserving state
 *
 * @param props - Component properties including content, container type, and index
 */
export const HxTabBody = <T extends object>(props: HxTabBodyProps<T>) => {
	const {
		$model,
		mark: givenMark, index: tabIndex, body,
		containerType
	} = props;

	/** Access the tabs context for state management */
	const tabsContext = useHxTabs();
	/** Reference to the tab body DOM element */
	const ref = useRef<HTMLDivElement>(null);

	/**
	 * Event handler for doActive events
	 * Updates the body's visible state when the active tab changes
	 */
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const onDoActive = (index: number, _: string | null | undefined) => {
			if (index !== tabIndex) {
				// Another tab was activated, hide this body
				ref.current?.removeAttribute('data-hx-tab-active');
				restoreScroll(ref.current);
			} else {
				// This tab was activated, show this body
				ref.current?.setAttribute('data-hx-tab-active', '');
			}
		};

		tabsContext.onDoActive(onDoActive);

		return () => {
			tabsContext.offDoActive(onDoActive);
		};
	}, [tabIndex, tabsContext]);

	/**
	 * Initial active state check on mount
	 * Sets the initial visibility based on whether this tab is active when it first renders
	 */
	useEffect(() => {
		tabsContext.checkActive(tabIndex, (active) => {
			if (active) {
				ref.current?.setAttribute('data-hx-tab-active', '');
			}
		});
	}, [tabIndex, tabsContext]);

	/** Normalized tab mark, undefined if no mark is provided */
	const mark = givenMark || (void 0);

	/** Render the appropriate container type based on configuration */
	switch (containerType) {
		case 'block': {
			return <HxDiv $model={$model} data-hx-tab-body=""
			              data-hx-tab-index={tabIndex} data-hx-tab-mark={mark}
			              ref={ref}>
				{body}
			</HxDiv>;
		}
		case 'flex': {
			return <HxFlex $model={$model} data-hx-tab-body=""
			               data-hx-tab-index={tabIndex} data-hx-tab-mark={mark}
			               ref={ref}>
				{body}
			</HxFlex>;
		}
		case 'grid':
		default: {
			return <HxGrid $model={$model} data-hx-tab-body=""
			               data-hx-tab-index={tabIndex} data-hx-tab-mark={mark}
			               ref={ref}>
				{body}
			</HxGrid>;
		}
	}
};
