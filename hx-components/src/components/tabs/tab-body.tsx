// @ts-expect-error import React
import React from 'react';
import type {HxObject} from '../../types';
import {HxFlex} from '../flex';
import {HxGrid} from '../grid';
import {HxDiv} from '../penetrable-basic';
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
		mark: givenMark, content,
		containerType
	} = props;

	const mark = givenMark || (void 0);

	switch (containerType) {
		case 'block': {
			return <HxDiv $model={$model} data-hx-tab-body=""
			              data-hx-tab-mark={mark}>
				{content}
			</HxDiv>;
		}
		case 'flex': {
			return <HxFlex $model={$model} data-hx-tab-body=""
			               data-hx-tab-mark={mark}>
				{content}
			</HxFlex>;
		}
		case 'grid':
		default: {
			return <HxGrid $model={$model} data-hx-tab-body=""
			               data-hx-tab-mark={mark}>
				{content}
			</HxGrid>;
		}
	}
};
