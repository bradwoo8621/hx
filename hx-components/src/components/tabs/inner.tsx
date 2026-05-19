import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useDualRef} from '../../hooks';
import {exposePropsToDOM, resolveChildModel} from '../../utils';
import {HxTabsBody} from './tabs-body';
import {HxTabsHeader} from './tabs-header';
import {useHxTabs} from './tabs-provider';
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
