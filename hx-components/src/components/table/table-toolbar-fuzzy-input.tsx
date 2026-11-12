import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type KeyboardEvent, useRef} from 'react';
import {useDelayedFunc, useFuncResultRef} from '../../hooks';
import {MagnifyingGlass} from '../icons';
import {HxInput} from '../input';
import {HxLabel} from '../label';
import {useHxTable} from './table-provider';
import type {HxTableProps} from './types';
import {filterStrToWords} from './utils';

export type HxTableToolbarFuzzyInputProps<T extends object, PT extends object = T> =
	Required<Pick<
		HxTableProps<T, PT>,
		| 'fuzzyPlaceholderKey'
	>>;

export const HxTableToolbarFuzzyInput =
	<T extends object, PT extends object = T>(props: HxTableToolbarFuzzyInputProps<T, PT>) => {
		const {fuzzyPlaceholderKey} = props;

		const tableContext = useHxTable();
		const {delay} = useDelayedFunc();
		const ref = useRef<HTMLInputElement>(null);
		const $fuzzyFilterModel = useFuncResultRef(() => ERO.reactive({value: ''}));

		const onKeyDown = (ev: KeyboardEvent<HTMLInputElement>) => {
			if (ev.key === 'Enter') {
				const fuzzyWords = filterStrToWords(ref.current?.value);
				delay('fuzzy-change', () => {
					tableContext.fuzzyChange(fuzzyWords, (dataSynchronized, error) => {
						if (dataSynchronized && error == null) {
							tableContext.dataChanged();
						}
					});
				}, 200);
			}
		};

		return <HxInput $model={$fuzzyFilterModel.current} $field="value"
		                prefix={[<HxLabel data-hx-label-input-embed="" data-hx-label-svg-icon=""
		                                  text={<MagnifyingGlass/>}/>]}
		                placeholder={fuzzyPlaceholderKey}
		                data-hx-table-toolbar-fuzzy=""
		                onKeyDown={onKeyDown}
		                ref={ref}/>;
	};
