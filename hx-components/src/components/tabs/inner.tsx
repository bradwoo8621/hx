// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {HxDataPropToAttrValueComputer} from '../../utils';
import type {HxTabsContentRef} from './inner-types';
import {HxTabsInner2} from './inner2';
import {useHxTabs} from './tabs-provider';
import type {HxTabsProps} from './types';

export const HxTabsInner =
	forwardRef(<T extends object>(props: HxTabsProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {content} = props;

		const context = useHxContext();
		const tabsContext = useHxTabs();
		const contentRef = useRef<HxTabsContentRef>({
			map: {}, array: [], activeIndex: -1
		});

		const marks = content.map(({mark}) => mark ?? null);
		useEffect(() => {
			const originActiveIndex = contentRef.current.activeIndex;

			// NOTE this resolution takes defaultActive (or falls back to the first tab)
			// without checking $visible/$disabled: those monitor-based states are resolved
			// by each tab header (useDataMonitor), and on the first run no header exists
			// yet to answer checkActiveable. If the picked tab turns out unavailable
			// (hidden or disabled), the tabs header's auto-advance on its first
			// resize-observer relayout corrects it within a frame.
			let activeIndex: number = originActiveIndex;
			contentRef.current.map = content.reduce((acc, {mark, defaultActive}, index) => {
				if (mark != null && acc[mark] == null) {
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
				if (originActiveIndex !== -1) {
					// rendered at least once
					// active the new index first.
					// in case of tabs is changed from [A, B, C] to [A, B], and origin active index is 2.
					// which just removed the tab C via force update,
					// and since mark and index of A and B are not changed, makes no active tab after repaint.
					tabsContext.doActive(activeIndex, contentRef.current.array[activeIndex] ?? (void 0));
				}
				context.forceUpdate();
			}

			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [...marks]);

		if (contentRef.current.activeIndex === -1) {
			return (void 0);
		} else {
			// @ts-expect-error ignore type check
			return <HxTabsInner2 {...props} contentRef={contentRef} ref={ref}/>;
		}
	});
HxTabsInner.displayName = 'HxTabsInner';

HxDataPropToAttrValueComputer.create('HxTabs').register();
