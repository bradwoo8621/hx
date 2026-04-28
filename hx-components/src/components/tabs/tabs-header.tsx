import type {ValueChangedEvent} from '@hx/data';
import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {Fragment, isValidElement, type ReactNode, useEffect, useRef} from 'react';
import type {HxObject} from '../../types';
import {interposeToChildren} from '../../utils';
import {DotsY} from '../icons';
import {HxLabel} from '../label';
import {HxSelect} from '../select';
import type {HxSelectOption} from '../select-options';
import {HxTabHeader} from './tab-header';
import {useHxTabs} from './tabs-provider';
import type {HxExtTabsProps} from './types';

export type HxTabsHeaderProps<T extends object> =
	& Pick<HxExtTabsProps<T>, 'border' | 'borderRadius' | 'content'>
	& { $model?: HxObject<T> };

interface HxMoreTabOptions {
	items: Array<HxSelectOption<number>>;
	options: () => Promise<Array<HxSelectOption<number>>>;
	$model: HxObject<{ value?: number }>;
}

export const HxTabsHeader = <T extends object>(props: HxTabsHeaderProps<T>) => {
	const {
		$model,
		border, borderRadius,
		content
	} = props;

	const tabsContext = useHxTabs();
	const headerRef = useRef<HTMLDivElement>(null);
	const indicatorRef = useRef<HTMLDivElement>(null);
	const moreTabRef = useRef<HTMLDivElement>(null);
	const moreTabOptionsRef = useRef<HxMoreTabOptions>({
		items: [],
		options: async (): Promise<Array<HxSelectOption<number>>> => moreTabOptionsRef.current.items,
		$model: ERO.reactive({})
	});

	useEffect(() => {
		const computeMoreTabs = () => {
			if (headerRef.current == null || moreTabRef.current == null) {
				return;
			}
			const headerWidth = headerRef.current.scrollWidth;
			const tabsWidth = headerRef.current.parentElement!.clientWidth;
			if (headerWidth <= tabsWidth) {
				// no more tabs button
				moreTabRef.current?.setAttribute('data-hx-visible', 'no');
			} else {
				const moreTabs: Array<number> = [];
				const {left: tabsLeft} = headerRef.current.parentElement!.getBoundingClientRect();
				const tabsRight = tabsLeft + tabsWidth - moreTabRef.current.clientWidth;
				headerRef.current.querySelectorAll(':scope > div[data-hx-tab-header]').forEach((tab, index) => {
					const {left: tabLeft, right: tabRight} = tab.getBoundingClientRect();
					if (tabLeft < tabsLeft || tabRight > tabsRight) {
						moreTabs.push(index);
					}
				});
				moreTabOptionsRef.current.items = moreTabs.map(index => {
					const {header, $disabled} = content[index];
					let label: ReactNode;
					if (isValidElement(header)) {
						label = interposeToChildren({$model}, header);
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
				delete moreTabOptionsRef.current.$model.value;
				ERO.emit(moreTabOptionsRef.current.$model, 'options', (void 0), (void 0));
				moreTabRef.current.setAttribute('data-hx-visible', '');
			}
		};
		const relocateTab = () => {
			if (indicatorRef.current == null || headerRef.current == null) {
				return;
			}
			const activeTab: HTMLElement | null = headerRef.current.querySelector(':scope > div[data-hx-tab-header][data-hx-tab-active]');
			if (activeTab == null) {
				return;
			}
			const {left: tabsLeft} = headerRef.current.parentElement!.getBoundingClientRect();
			const tabsWidth = headerRef.current.parentElement!.clientWidth;
			const tabsRight = tabsLeft + tabsWidth - (moreTabRef.current?.clientWidth ?? 0);
			const {left: tabLeft, width: tabWidth, right: tabRight} = activeTab.getBoundingClientRect();
			if (tabLeft < tabsLeft || tabRight > tabsRight) {
				headerRef.current.addEventListener('scrollend', () => {
					indicatorRef.current!.style.setProperty('--tabs-tab-indicator-left', `${activeTab.offsetLeft}px`);
					indicatorRef.current!.style.setProperty('--tabs-tab-indicator-width', `${tabWidth}px`);
				}, {once: true});
				const offsetLeft = activeTab.offsetLeft;
				headerRef.current.scrollTo({left: offsetLeft, behavior: 'instant'});
			} else {
				indicatorRef.current!.style.setProperty('--tabs-tab-indicator-left', `${activeTab.offsetLeft}px`);
				indicatorRef.current!.style.setProperty('--tabs-tab-indicator-width', `${tabWidth}px`);
			}
		};
		tabsContext.getActive(() => {
			relocateTab();
			computeMoreTabs();
		});

		const onActiveChanged = (active: boolean) => {
			if (active) {
				relocateTab();
				computeMoreTabs();
			}
		};

		const onMoreTabOptionSelected = (ev: ValueChangedEvent) => {
			tabsContext.active(ev.newValue as number);
		};
		const moreTabOptionsModel = moreTabOptionsRef.current.$model;
		ERO.on(moreTabOptionsModel, 'value', onMoreTabOptionSelected);
		tabsContext.onActiveChanged(onActiveChanged);

		return () => {
			ERO.off(moreTabOptionsModel, 'value', onMoreTabOptionSelected);
			tabsContext.offActiveChanged(onActiveChanged);
		};
	}, [$model, content, tabsContext]);

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
		<div data-hx-tabs-header-more-tab="" ref={moreTabRef}>
			{/* eslint-disable-next-line react-hooks/refs */}
			<HxSelect $model={moreTabOptionsRef.current.$model} $field="value"
				// eslint-disable-next-line react-hooks/refs
				      options={moreTabOptionsRef.current.options} optionsDependsOn="options"
				      clearable={false} filter={false} placeholder={false}
				      downIcon={<DotsY/>}/>
		</div>
	</div>;
};
