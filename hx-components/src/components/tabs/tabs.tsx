import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useDualRef} from '../../hooks';
import {exposePropsToDOM, resolveChildModel} from '../../utils';
import {HxTabsBody} from './tabs-body';
import {HxTabsHeader} from './tabs-header';
import {HxTabsProvider, useHxTabs} from './tabs-provider';
import type {HxTabsProps} from './types';

export const HxTabsInner =
	forwardRef(<T extends object>(props: HxTabsProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			border, borderRadius,
			paddingX, paddingT, paddingB,
			contentContainerType, content,
			restoreScroll,
			...rest
		} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);
		const contentRef = useRef<{
			map: Record<string, number>; array: Array<string | null>; activeIndex: number;
		}>({map: {}, array: [], activeIndex: -1});
		const tabsContext = useHxTabs();
		const containerRef = useDualRef(ref);

		const marks = content.map(({mark}) => mark ?? null);
		useEffect(() => {
			const originActiveIndex = contentRef.current.activeIndex;

			let activeIndex: number = originActiveIndex;
			contentRef.current.map = content.reduce((acc, {mark, defaultActive}, index) => {
				if (mark != null && acc[mark] != null) {
					acc[mark] = index;
				}
				if (defaultActive === true && activeIndex === -1) {
					activeIndex = index;
				}
				return acc;
			}, {} as Record<string, number>);
			contentRef.current.array = content.map(({mark}) => mark ?? null);
			if (activeIndex === -1) {
				activeIndex = 0;
			} else if (originActiveIndex >= contentRef.current.array.length) {
				activeIndex = 0;
			}
			contentRef.current.activeIndex = activeIndex;

			if (originActiveIndex !== activeIndex) {
				context.forceUpdate();
			}

			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [...marks]);
		useEffect(() => {
			const computeTabIndex = (markOrIndex: string | number) => {
				let tabIndex: number;
				if (typeof markOrIndex === 'string') {
					tabIndex = contentRef.current.map[markOrIndex];
				} else {
					tabIndex = markOrIndex;
				}
				return tabIndex;
			};
			const onCheckActive = (markOrIndex: string | number, callback: (active: boolean) => void) => {
				const tabIndex = computeTabIndex(markOrIndex);
				if (tabIndex < 0 || tabIndex >= contentRef.current.array.length) {
					callback(false);
				} else {
					callback(tabIndex === contentRef.current.activeIndex);
				}
			};
			const onActive = (markOrIndex: string | number) => {
				const tabIndex = computeTabIndex(markOrIndex);
				if (tabIndex >= 0 && tabIndex < contentRef.current.array.length) {
					tabsContext.checkActiveable(tabIndex, contentRef.current.array[tabIndex] ?? (void 0), (activeable: boolean) => {
						if (activeable) {
							const mark = contentRef.current.array[tabIndex] ?? (void 0);
							if (mark == null) {
								containerRef.current?.removeAttribute('data-hx-tabs-active-mark');
							} else {
								containerRef.current?.setAttribute('data-hx-tabs-active-mark', mark);
							}
							containerRef.current?.setAttribute('data-hx-tabs-active-index', '' + tabIndex);
							tabsContext.doActive(tabIndex, contentRef.current.array[tabIndex] ?? (void 0));
						}
					});
				}
			};
			tabsContext.onCheckActive(onCheckActive);
			tabsContext.onActive(onActive);

			return () => {
				tabsContext.offCheckActive(onCheckActive);
				tabsContext.offActive(onActive);
			};
		}, [containerRef, tabsContext]);

		if (contentRef.current.activeIndex === -1) {
			return (void 0);
		}

		const $modelToChild = resolveChildModel($model, $field);
		const restProps = exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            data-hx-tabs=""
		            data-hx-model-path={ERO.loosePathOf($model, $field)}
		            data-hx-visible={(visible ?? true) ? '' : 'no'}
		            ref={containerRef}>
			<HxTabsHeader $model={$modelToChild}
			              border={border} borderRadius={borderRadius}
			              content={content}/>
			<HxTabsBody $model={$modelToChild}
			            border={border} borderRadius={borderRadius}
			            paddingX={paddingX} paddingT={paddingT} paddingB={paddingB}
			            contentContainerType={contentContainerType}
			            content={content}
			            restoreScroll={restoreScroll}/>
		</div>;
	});
HxTabsInner.displayName = 'HxTabsInner';

/**
 * Type definition for the HxTabs component function signature
 */
export type HxTabsType = <T extends object>(
	props: HxTabsProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * HxTabs Component
 *
 * A flexible tabs component that allows switching between different content sections.
 * Features include:
 * - Customizable styling with borders, padding, and border radius options
 * - Support for reactive data binding with $model and $field
 * - Disabled and visible tab states with reactive control
 * - Default active tab configuration
 * - Programmatic navigation via tab marks or indices
 * - Automatic scrolling for tab headers with many items
 *
 * @example
 * ```tsx
 * // Basic usage
 * <HxTabs
 *   content={[
 *     { mark: 'tab1', header: 'Tab 1', body: <div>Content 1</div> },
 *     { mark: 'tab2', header: 'Tab 2', body: <div>Content 2</div> }
 *   ]}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Tabs with border and custom padding
 * <HxTabs
 *   border={true}
 *   borderRadius="md"
 *   paddingX="lg"
 *   paddingT="lg"
 *   paddingB="lg"
 *   content={tabsContent}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Tabs with default active tab
 * <HxTabs
 *   content={[
 *     { mark: 'tab1', header: 'Tab 1', body: <div>Content 1</div> },
 *     { mark: 'tab2', header: 'Tab 2', body: <div>Content 2</div>, defaultActive: true }
 *   ]}
 * />
 * ```
 */
export const HxTabs =
	forwardRef(<T extends object>(props: HxTabsProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		return <HxTabsProvider>
			{/* @ts-expect-error ignore type check */}
			<HxTabsInner {...props} ref={ref}/>
		</HxTabsProvider>;
	}) as unknown as HxTabsType;
// @ts-expect-error assign component name
HxTabs.displayName = 'HxTabs';
