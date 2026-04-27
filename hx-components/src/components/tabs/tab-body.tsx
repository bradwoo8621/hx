// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import type {HxObject} from '../../types';
import {HxFlex} from '../flex';
import {HxGrid} from '../grid';
import {HxDiv} from '../penetrable-basic';
import {useHxTabs} from './tabs-provider';
import type {HxTab, HxTabBodyContainerType} from './types';

export type HxTabBodyProps<T extends object> =
	& Omit<HxTab<T>, 'defaultActive' | 'header' | '$visible' | '$disabled'>
	& {
	containerType: HxTabBodyContainerType;
	$model?: HxObject<T>,
	index: number;
};

export const HxTabBody = <T extends object>(props: HxTabBodyProps<T>) => {
	const {
		$model,
		mark: givenMark, index: tabIndex, content,
		containerType
	} = props;

	const tabsContext = useHxTabs();
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const onDoActive = (index: number, _: string | null | undefined) => {
			if (index !== tabIndex) {
				ref.current?.removeAttribute('data-hx-tab-active');
			} else {
				ref.current?.setAttribute('data-hx-tab-active', '');
			}
		};

		tabsContext.onDoActive(onDoActive);

		return () => {
			tabsContext.offDoActive(onDoActive);
		};
	}, [tabIndex, tabsContext]);
	useEffect(() => {
		tabsContext.checkActive(tabIndex, (active) => {
			if (active) {
				ref.current?.setAttribute('data-hx-tab-active', '');
			}
		});
	}, [tabIndex, tabsContext]);

	const mark = givenMark || (void 0);

	switch (containerType) {
		case 'block': {
			return <HxDiv $model={$model} data-hx-tab-body=""
			              data-hx-tab-index={tabIndex} data-hx-tab-mark={mark}
			              ref={ref}>
				{content}
			</HxDiv>;
		}
		case 'flex': {
			return <HxFlex $model={$model} data-hx-tab-body=""
			               data-hx-tab-index={tabIndex} data-hx-tab-mark={mark}
			               ref={ref}>
				{content}
			</HxFlex>;
		}
		case 'grid':
		default: {
			return <HxGrid $model={$model} data-hx-tab-body=""
			               data-hx-tab-index={tabIndex} data-hx-tab-mark={mark}
			               ref={ref}>
				{content}
			</HxGrid>;
		}
	}
};
