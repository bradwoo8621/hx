import type {ValueChangedEvent} from '@hx/data';
import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {Fragment, isValidElement, type ReactNode, useEffect, useRef} from 'react';
import type {HxObject} from '../../types';
import {DOMUtils} from '../../utils';
import {DotsY} from '../icons';
import {HxLabel} from '../label';
import {HxSelect} from '../select';
import type {HxSelectOption} from '../select-options';
import {HxTabHeader} from './tab-header';
import {HxTabProvider} from './tab-provider';
import {useHxTabs} from './tabs-provider';
import type {HxExtTabsProps} from './types';

/**
 * Props interface for the HxTabsHeader component
 * Inherits relevant styling and content properties from the main tabs props
 */
export type HxTabsHeaderProps<T extends object> =
	& Pick<HxExtTabsProps<T>, 'border' | 'borderRadius' | 'content'>
	& { $model?: HxObject<T> };

/**
 * Internal interface for the "more tabs" dropdown configuration
 * Used to manage overflow tabs when there are too many to fit in the header width
 */
interface HxMoreTabOptions {
	/** Array of select options for overflow tabs */
	items: Array<HxSelectOption<number>>;
	/** Async function to fetch the options (returns the items array) */
	options: () => Promise<Array<HxSelectOption<number>>>;
	/** Reactive model for the dropdown select component */
	$model: HxObject<{ value?: number }>;
}

/**
 * HxTabsHeader Component
 *
 * The header strip of the tabs component that renders all tab headers and active indicator
 * Features:
 * - Automatic horizontal scrolling when there are too many tabs to fit
 * - Overflow "more" dropdown that contains tabs that don't fit in the visible area
 * - Animated active indicator that moves between tabs when selection changes
 * - Automatic scrolling to keep the active tab visible in the viewport
 * - Reactive support for dynamic tab changes, visibility, and disabled states
 *
 * @param props - Component properties including styling, tab content, and reactive model
 */
export const HxTabsHeader = <T extends object>(props: HxTabsHeaderProps<T>) => {
	const {
		$model,
		border, borderRadius,
		content
	} = props;

	/** Access the tabs context for state management and events */
	const tabsContext = useHxTabs();
	/** Reference to the main header container DOM element */
	const tabsHeaderRef = useRef<HTMLDivElement>(null);
	/** Reference to the active tab indicator DOM element */
	const tabActiveIndicatorRef = useRef<HTMLDivElement>(null);
	/** Reference to the overflow "more tabs" dropdown container */
	const moreTabRef = useRef<HTMLDivElement>(null);
	/** Reference to the overflow dropdown configuration and state */
	const moreTabStateRef = useRef<HxMoreTabOptions>({
		items: [],
		options: async (): Promise<Array<HxSelectOption<number>>> => moreTabStateRef.current.items,
		$model: ERO.reactive({})
	});

	useEffect(() => {
		/**
		 * Calculate which tabs are overflowing the header width and update the "more" dropdown
		 * Tabs that don't fit in the visible area are moved to the overflow dropdown
		 * Automatically shows/hides the more dropdown only when there are overflow tabs
		 */
		const computeMoreTabs = () => {
			if (tabsHeaderRef.current == null || moreTabRef.current == null) {
				return;
			}
			const headerWidth = tabsHeaderRef.current.scrollWidth;
			const tabsWidth = tabsHeaderRef.current.clientWidth;
			if (headerWidth <= tabsWidth) {
				// All tabs fit, hide the more dropdown
				moreTabRef.current?.setAttribute('data-hx-visible', 'no');
			} else {
				const moreTabs: Array<number> = [];

				const ltr = getComputedStyle(tabsHeaderRef.current).direction !== 'rtl';
				const {
					left: moreTabLeft = 0, right: moreTabRight = 0
				} = moreTabRef.current?.getBoundingClientRect() ?? {};
				const moreTabWidth = moreTabRight - moreTabLeft;
				const {left: tabsLeft, right: tabsRight} = tabsHeaderRef.current.getBoundingClientRect();
				const availableTabsLeft = ltr ? tabsLeft : (tabsLeft + moreTabWidth);
				const availableTabsRight = ltr ? (tabsRight - moreTabWidth) : tabsRight;

				tabsHeaderRef.current.querySelectorAll(':scope > div[data-hx-tab-header]').forEach((tab, index) => {
					const {left: tabLeft, right: tabRight} = tab.getBoundingClientRect();
					if (tabLeft < availableTabsLeft || tabRight > availableTabsRight) {
						moreTabs.push(index);
					}
				});
				// Build select options for overflow tabs
				moreTabStateRef.current.items = moreTabs.map(index => {
					const {header, $disabled} = content[index];
					let label: ReactNode;
					if (isValidElement(header)) {
						label = DOMUtils.interposeToChildren({$model}, header);
					} else {
						label = <HxLabel $model={$model} text={header}/>;
					}
					return {
						value: index,
						displayLabel: <Fragment/>,
						label,
						$disabled
					};
				});
				// Reset dropdown value and trigger options update
				delete moreTabStateRef.current.$model.value;
				ERO.emit(moreTabStateRef.current.$model, 'options', (void 0), (void 0));
				moreTabRef.current.setAttribute('data-hx-visible', '');
			}
		};
		const relocateIndicator = (activeTab: HTMLElement) => {
			if (tabActiveIndicatorRef.current == null || tabsHeaderRef.current == null) {
				return;
			}

			const ltr = getComputedStyle(tabsHeaderRef.current).direction !== 'rtl';

			const {left: tabLeft, right: tabRight} = activeTab.getBoundingClientRect();
			const tabWidth = tabRight - tabLeft;

			// Active tab is visible, just update indicator position
			let indicatorLeft = activeTab.offsetLeft;
			if (!ltr) {
				const {left: tabsLeft, right: tabsRight} = tabsHeaderRef.current!.getBoundingClientRect();
				const tabsWidth = tabsRight - tabsLeft;
				indicatorLeft = tabsWidth - activeTab.offsetLeft - tabWidth;
			}
			tabActiveIndicatorRef.current!.style.setProperty('--hx-tabs-tab-indicator-left-this', `${indicatorLeft}px`);
			tabActiveIndicatorRef.current!.style.setProperty('--hx-tabs-tab-indicator-width-this', `${tabWidth}px`);
		};
		/**
		 * Adjust the scroll position to keep the active tab visible in the header viewport.
		 * Also updates the position and width of the active tab indicator to match the active tab.
		 * Automatically scrolls the header if active tab is partially or fully out of view.
		 */
		const relocateTab = () => {
			if (tabsHeaderRef.current == null) {
				return;
			}
			const activeTab: HTMLElement | null = tabsHeaderRef.current.querySelector(':scope > div[data-hx-tab-header][data-hx-tab-active]');
			if (activeTab == null) {
				return;
			}

			const ltr = getComputedStyle(tabsHeaderRef.current).direction !== 'rtl';

			const {left: moreTabLeft = 0, right: moreTabRight = 0} = moreTabRef.current?.getBoundingClientRect() ?? {};
			const moreTabWidth = moreTabRight - moreTabLeft;

			const {left: tabsLeft, right: tabsRight} = tabsHeaderRef.current!.getBoundingClientRect();
			const tabsWidth = tabsRight - tabsLeft;
			const availableTabsWidth = tabsWidth - moreTabWidth;
			const availableTabsLeft = ltr ? tabsLeft : (tabsLeft + moreTabWidth);
			const availableTabsRight = ltr ? (tabsRight - moreTabWidth) : tabsRight;

			const {left: tabLeft, right: tabRight} = activeTab.getBoundingClientRect();
			const tabWidth = tabRight - tabLeft;

			const scrollGutterSize = 20;

			if (tabLeft < availableTabsLeft || tabRight > availableTabsRight) {
				// Active tab is out of view, scroll to make it visible
				tabsHeaderRef.current.addEventListener('scrollend', () => {
					relocateIndicator(activeTab);
				}, {once: true});

				// TIP all the following value of left of scroll to are tested, and don't know why yet
				if (tabWidth + scrollGutterSize > availableTabsWidth) {
					// width of active tab is greater than available tabs width
					if (ltr) {
						// scroll to very left
						tabsHeaderRef.current.scrollTo({left: activeTab.offsetLeft});
					} else {
						// TIP offset left is negative
						// scroll to very right
						tabsHeaderRef.current.scrollTo({
							left: activeTab.offsetLeft - moreTabWidth - scrollGutterSize - (availableTabsWidth - scrollGutterSize - tabWidth)
						});
					}
				} else {
					if (ltr) {
						tabsHeaderRef.current.scrollTo({left: activeTab.offsetLeft - availableTabsWidth + tabWidth + scrollGutterSize});
					} else {
						// TIP offset left is negative
						tabsHeaderRef.current.scrollTo({left: activeTab.offsetLeft - moreTabWidth - scrollGutterSize});
					}
				}
			} else {
				relocateIndicator(activeTab);
			}
		};
		const relayout = () => {
			relocateTab();
			computeMoreTabs();
		};
		tabsContext.getActive(relayout);

		const tabsHeader = tabsHeaderRef.current;
		let resizeObserver: ResizeObserver | undefined = (void 0);
		if (tabsHeader != null) {
			resizeObserver = new ResizeObserver(relayout);
			resizeObserver.observe(tabsHeader);
			tabsHeader.addEventListener('scrollend', computeMoreTabs);
		}

		/**
		 * Event handler for when a tab is selected from the overflow more dropdown
		 * Triggers activation of the selected tab via the tabs context
		 */
		const onMoreTabOptionSelected = (ev: ValueChangedEvent) => {
			tabsContext.active(ev.newValue as number);
		};
		// Register event listeners
		const moreTabOptionsModel = moreTabStateRef.current.$model;
		ERO.on(moreTabOptionsModel, 'value', onMoreTabOptionSelected);

		/**
		 * Event handler for when the active tab changes
		 * Updates the scroll position and more dropdown whenever a new tab is activated
		 */
		const onActiveChanged = (active: boolean) => {
			if (active) {
				relayout();
			}
		};
		tabsContext.onActiveChanged(onActiveChanged);

		// Cleanup event listeners on unmount
		return () => {
			resizeObserver?.disconnect();
			tabsHeader?.removeEventListener('scrollend', computeMoreTabs);
			ERO.off(moreTabOptionsModel, 'value', onMoreTabOptionSelected);
			tabsContext.offActiveChanged(onActiveChanged);
		};
	}, [$model, content, tabsContext]);

	return <div data-hx-tabs-header=""
	            data-hx-border-radius={borderRadius}
	            ref={tabsHeaderRef}>
		{content.map((child, index) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const {defaultActive, body, ...rest} = child;
			return <HxTabProvider key={index}>
				<HxTabHeader {...rest} $model={$model} index={index}
				             border={border} borderRadius={borderRadius}/>
			</HxTabProvider>;
		})}
		<div data-hx-tabs-header-active-indicator=""
		     data-hx-visible={border ? 'no' : (void 0)}
		     ref={tabActiveIndicatorRef}/>
		<div data-hx-tabs-header-more-tab="" ref={moreTabRef}>
			{/* eslint-disable-next-line react-hooks/refs */}
			<HxSelect $model={moreTabStateRef.current.$model} $field="value"
				// eslint-disable-next-line react-hooks/refs
				      options={moreTabStateRef.current.options} optionsDependsOn="options"
				      clearable={false} filter={false} placeholder={false}
				      downIcon={<DotsY/>}/>
		</div>
	</div>;
};
