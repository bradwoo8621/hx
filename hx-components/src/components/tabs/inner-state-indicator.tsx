// @ts-expect-error import React
import React, {type MutableRefObject, useEffect, useRef} from 'react';
import type {HxTabsContentRef} from './inner-types';
import {useHxTabs} from './tabs-provider';

export const HxTabsInnerStateIndicator = (
	props: { contentRef: MutableRefObject<HxTabsContentRef> }
) => {
	const {contentRef} = props;

	const tabsContext = useHxTabs();
	const ref = useRef<HTMLDivElement>(null);
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
		const syncActive = (index: number, mark: string | null | undefined) => {
			if (mark == null) {
				ref.current?.removeAttribute('data-hx-tabs-active-mark');
				ref.current?.parentElement?.removeAttribute('data-hx-tabs-active-mark');
			} else {
				ref.current?.setAttribute('data-hx-tabs-active-mark', mark);
				ref.current?.parentElement?.setAttribute('data-hx-tabs-active-mark', mark);
			}
			ref.current?.setAttribute('data-hx-tabs-active-index', '' + index);
			ref.current?.parentElement?.setAttribute('data-hx-tabs-active-index', '' + index);
		};
		const onActive = (markOrIndex: string | number) => {
			const tabIndex = computeTabIndex(markOrIndex);
			if (tabIndex >= 0 && tabIndex < contentRef.current.array.length) {
				tabsContext.checkActiveable(tabIndex, contentRef.current.array[tabIndex] ?? (void 0), (activeable: boolean) => {
					if (activeable) {
						const mark = contentRef.current.array[tabIndex] ?? (void 0);
						syncActive(tabIndex, mark);
						tabsContext.doActive(tabIndex, contentRef.current.array[tabIndex] ?? (void 0));
					}
				});
			}
		};
		const onActiveChanged = (active: boolean, index: number, mark: string | null | undefined) => {
			if (active) {
				syncActive(index, mark);
			}
		};
		tabsContext.onCheckActive(onCheckActive);
		tabsContext.onActive(onActive);
		tabsContext.onActiveChanged(onActiveChanged);

		return () => {
			tabsContext.offCheckActive(onCheckActive);
			tabsContext.offActive(onActive);
			tabsContext.offActiveChanged(onActiveChanged);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <div data-hx-tabs-state-indicator="" ref={ref}/>;
};
