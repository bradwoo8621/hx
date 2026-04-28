// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import type {HxObject} from '../../types';
import {HxTabHeader} from './tab-header';
import {useHxTabs} from './tabs-provider.tsx';
import type {HxExtTabsProps} from './types';

export type HxTabsHeaderProps<T extends object> =
	& Pick<HxExtTabsProps<T>, 'border' | 'borderRadius' | 'content'>
	& { $model?: HxObject<T> };

export const HxTabsHeader = <T extends object>(props: HxTabsHeaderProps<T>) => {
	const {
		$model,
		border, borderRadius,
		content
	} = props;

	const tabsContext = useHxTabs();
	const headerRef = useRef<HTMLDivElement>(null);
	const indicatorRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const locateActiveIndicator = () => {
			if (indicatorRef.current == null || headerRef.current == null) {
				return;
			}
			const activeTab = headerRef.current.querySelector(':scope > div[data-hx-tab-header][data-hx-tab-active]');
			if (activeTab == null) {
				return;
			}
			const {left} = headerRef.current.getBoundingClientRect();
			const {left: tabLeft, width: tabWidth} = activeTab.getBoundingClientRect();
			indicatorRef.current.style.setProperty('--tabs-tab-indicator-left', `${tabLeft - left}px`);
			indicatorRef.current.style.setProperty('--tabs-tab-indicator-width', `${tabWidth}px`);
		};
		tabsContext.getActive(locateActiveIndicator);

		const onActiveChanged = (active: boolean) => {
			if (active) {
				locateActiveIndicator();
			}
		};
		tabsContext.onActiveChanged(onActiveChanged);

		return () => {
			tabsContext.offActiveChanged(onActiveChanged);
		};
	}, [tabsContext]);

	return <div data-hx-tabs-header=""
	            data-hx-border-radius={borderRadius}
	            ref={headerRef}>
		{content.map((child, index) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const {defaultActive, body, ...rest} = child;
			return <HxTabHeader {...rest} $model={$model} index={index}
			                    border={border} borderRadius={borderRadius}
			                    key={index}/>;
		})}
		<div data-hx-tabs-header-active-indicator=""
		     data-hx-visible={border ? 'no' : (void 0)}
		     ref={indicatorRef}/>
	</div>;
};
