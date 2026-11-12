import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {useFuncResultRef} from '../../hooks';
import {MagnifyingGlass} from '../icons';
import {HxInput} from '../input';
import {HxLabel} from '../label';
import type {HxTableProps} from './types';

export type HxTableToolbarFuzzyInputProps<T extends object, PT extends object = T> =
	Required<Pick<
		HxTableProps<T, PT>,
		| 'fuzzyPlaceholderKey'
	>>;

export const HxTableToolbarFuzzyInput =
	<T extends object, PT extends object = T>(props: HxTableToolbarFuzzyInputProps<T, PT>) => {
		const {fuzzyPlaceholderKey} = props;

		const $fuzzyFilterModel = useFuncResultRef(() => {
			const model = ERO.reactive({value: ''});

			return model;
		});

		return <HxInput $model={$fuzzyFilterModel.current} $field="value"
		                prefix={[<HxLabel data-hx-label-input-embed="" data-hx-label-svg-icon=""
		                                  text={<MagnifyingGlass/>}/>]}
		                placeholder={fuzzyPlaceholderKey}
		                data-hx-table-toolbar-fuzzy=""/>;
	};
