// @ts-expect-error import React
import React, {type ReactNode, useContext, useEffect, useRef, useState} from 'react';
import {type HxContext, HxHierarchyProvider} from '../../contexts';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';
import {useHxTabs} from './tabs-provider';
import type {HxTab} from './types';

export interface HxTabBodyContext extends HxReactContext {
	/**
	 * Check if this tab is currently active
	 * @param callback - Callback that receives a boolean indicating if the tab is active
	 */
	checkActive(callback: (active: boolean) => void): void;

	/**
	 * Check if this tab can be activated (visible and not disabled)
	 * @param callback - Callback that receives a boolean indicating if the tab is activeable
	 */
	checkActiveable(callback: (activeable: boolean) => void): void;

	/**
	 * Request to activate a tab
	 * @param options.markOrIndex - Tab mark (string) or index (number) to activate
	 * @param options.activeCheck - Skip activation when the target is already active, default true
	 * @param options.activeableCheck - Only activate when the target is visible and not disabled, default true
	 */
	active(options: { markOrIndex: string | number; activeCheck?: boolean, activeableCheck?: boolean }): void;
}

const Context = createHxReactContext<HxTabBodyContext>('HxTabBodyContext');

export const HxTabBodyProvider = (props: {
	mark?: HxTab['mark'], index: number, children: ReactNode
}) => {
	const {mark, index, children} = props;

	const tabsContext = useHxTabs();
	const markAndIndexRef = useRef({mark, index});
	/**
	 * Initialize the tab context with an event emitter implementation
	 * Uses useState to ensure the context instance is only created once per tabs component
	 */
	const [tabBodyContext] = useState<HxTabBodyContext>(() => new class extends AbstractHxReactContext implements HxTabBodyContext {
		/** @inheritdoc */
		checkActive(callback: (active: boolean) => void): void {
			tabsContext.checkActive(markAndIndexRef.current.index, callback);
		}

		/** @inheritdoc */
		checkActiveable(callback: (activeable: boolean) => void): void {
			tabsContext.checkActiveable(markAndIndexRef.current.index, callback);
		}

		/** @inheritdoc */
		active(options: { markOrIndex: string | number; activeCheck?: boolean, activeableCheck?: boolean }): void {
			const {markOrIndex, activeCheck = true, activeableCheck = true} = options;

			if (activeCheck) {
				tabsContext.checkActive(markOrIndex, (active) => {
					if (!active) {
						if (activeableCheck) {
							this.checkActiveable((activeable) => {
								if (activeable) {
									tabsContext.active(markOrIndex);
								}
							});
						} else {
							tabsContext.active(markOrIndex);
						}
					}
				});
			} else if (activeableCheck) {
				tabsContext.checkActiveable(markOrIndex, (activeable) => {
					if (activeable) {
						tabsContext.active(markOrIndex);
					}
				});
			} else {
				tabsContext.active(markOrIndex);
			}
		}
	});
	useEffect(() => {
		markAndIndexRef.current.mark = mark;
		markAndIndexRef.current.index = index;
	}, [mark, index]);

	return <Context.Provider value={tabBodyContext}>
		<HxHierarchyProvider context={tabBodyContext} contextDisplayName="HxTabBodyContext">
			{children}
		</HxHierarchyProvider>
	</Context.Provider>;
};

/**
 * To allow components within a tab to actively initiate the action of activating this tab.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useHxTabBody = () => useContext(Context);

// eslint-disable-next-line react-refresh/only-export-components
export const findClosestHxTabBody = (context: HxContext): HxTabBodyContext | undefined => {
	// noinspection CssInvalidHtmlTagReference
	return context.hierarchy?.closest<HxTabBodyContext>('HxTabBodyContext') ?? (void 0);
};
