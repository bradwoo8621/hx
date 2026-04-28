// @ts-expect-error import React
import React, {
	isValidElement,
	type KeyboardEventHandler,
	type MouseEventHandler,
	type ReactNode,
	useEffect,
	useRef
} from 'react';
import {useDataMonitor} from '../../hooks';
import type {HxObject} from '../../types';
import {interposeToChildren} from '../../utils';
import {HxLabel} from '../label';
import {useHxTabs} from './tabs-provider';
import type {HxTab, HxTabsProps} from './types';

/**
 * Props interface for the individual HxTabHeader component
 * Inherits tab configuration properties from HxTab and styling properties from the main tabs
 */
export type HxTabHeaderProps<T extends object> =
	& Omit<HxTab<T>, 'defaultActive' | 'body'>
	& Pick<HxTabsProps<T>, 'border' | 'borderRadius'>
	& {
	/** Reactive model passed down from the parent tabs component */
	$model?: HxObject<T>;
	/** Zero-based index of this tab in the tabs array */
	index: number;
};

/**
 * HxTabHeader Component
 *
 * Individual tab header element that represents a single tab in the tabs header strip
 * Features:
 * - Reactive disabled and visible states that automatically update
 * - Keyboard accessibility support (Space key to activate)
 * - Active state management via the tabs context
 * - Automatic content interposition for reactive binding support in custom headers
 * - ARIA accessible attributes and keyboard navigation support
 *
 * @param props - Component properties including tab configuration, styling, and index
 */
export const HxTabHeader = <T extends object>(props: HxTabHeaderProps<T>) => {
	const {
		$model,
		mark: givenMark, index: tabIndex, header,
		border, borderRadius
	} = props;

	/** Normalized tab mark, undefined if no mark is provided */
	const mark = givenMark || (void 0);

	/** Access the tabs context for state management */
	const tabsContext = useHxTabs();
	/** Get reactive visible and disabled states from the data monitor hook */
	const {visible, disabled} = useDataMonitor(props);
	/** Reference to the tab header DOM element */
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		/**
		 * Handler for getActive requests from the tabs context
		 * Returns this tab's index and mark if it is currently active
		 */
		const onGetActive = (callback: (index: number, mark: string | null | undefined) => void) => {
			if (ref.current?.hasAttribute('data-hx-tab-active')) {
				callback(tabIndex, mark);
			}
		};

		/**
		 * Handler for checkActiveable requests
		 * Returns whether this tab can be activated (not disabled)
		 */
		const onCheckActiveable = (index: number, _: string | null | undefined, callback: (activeable: boolean) => void) => {
			if (index === tabIndex) {
				callback(!disabled);
			}
		};

		/**
		 * Handler for doActive events
		 * Updates this tab's active state when a tab activation occurs
		 * Fires activeChanged event for both activation and deactivation
		 */
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const onDoActive = (index: number, _: string | null | undefined) => {
				if (index !== tabIndex) {
					// Another tab was activated, deactivate this one
					ref.current?.removeAttribute('data-hx-tab-active');
					tabsContext.activeChanged(false, tabIndex, mark);
				} else {
					// This tab was activated
					ref.current?.setAttribute('data-hx-tab-active', '');
					tabsContext.activeChanged(true, tabIndex, mark);
				}
			};

		// Register event listeners with the tabs context
		tabsContext.onGetActive(onGetActive);
		tabsContext.onCheckActiveable(onCheckActiveable);
		tabsContext.onDoActive(onDoActive);

		// Cleanup event listeners on unmount
		return () => {
			tabsContext.offGetActive(onGetActive);
			tabsContext.offCheckActiveable(onCheckActiveable);
			tabsContext.offDoActive(onDoActive);
		};
	}, [disabled, mark, tabIndex, tabsContext]);

	/**
	 * Initial active state check on mount
	 * Verifies if this tab should be active when it first renders
	 */
	useEffect(() => {
		tabsContext.checkActive(tabIndex, (active) => {
			if (active) {
				ref.current?.setAttribute('data-hx-tab-active', '');
				tabsContext.activeChanged(true, tabIndex, mark);
			}
		});
	}, [mark, tabIndex, tabsContext]);

	/**
	 * Click event handler for the tab header
	 * Activates this tab when clicked, if it is visible and not disabled
	 */
	const onTabHeaderClick: MouseEventHandler<HTMLDivElement> = () => {
		if (!visible || disabled) {
			return;
		}
		tabsContext.active(tabIndex);
	};

	/**
	 * Keyboard event handler for accessibility
	 * Supports Space key to activate the tab when it has focus
	 * @param ev - Keyboard event object
	 */
	const onTabHeaderKeyDown: KeyboardEventHandler<HTMLDivElement> = (ev) => {
		if (!visible || disabled) {
			return;
		}
		switch (ev.key) {
			case ' ': {
				tabsContext.active(tabIndex);
				ev.preventDefault();
				break;
			}
		}
	};

	/**
	 * Process the header content
	 * If header is a React element, interpose the $model context to make it reactive
	 * If header is text, wrap it in an HxLabel component with reactive support
	 */
	let content: ReactNode;
	if (isValidElement(header)) {
		content = interposeToChildren({$model}, header);
	} else {
		content = <HxLabel $model={$model} text={header}/>;
	}

	return <div tabIndex={0} onClick={onTabHeaderClick} onKeyDown={onTabHeaderKeyDown}
	            data-hx-tab-header=""
	            data-hx-tab-index={tabIndex} data-hx-tab-mark={mark}
	            data-hx-border={border ? '' : (void 0)} data-hx-border-radius={borderRadius}
	            data-hx-visible={(visible ?? true) ? '' : 'no'}
	            data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
	            ref={ref}>
		{content}
	</div>;
};
