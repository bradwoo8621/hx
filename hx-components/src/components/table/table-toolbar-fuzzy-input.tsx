import {ERO, type ValueChangedEvent} from '@hx/data';
// @ts-expect-error import React
import React, {type FocusEvent, type KeyboardEvent, useEffect, useRef} from 'react';
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
		| 'fuzzyFilter' | 'fuzzyPlaceholderKey'
	>>;

export const HxTableToolbarFuzzyInput =
	<T extends object, PT extends object = T>(props: HxTableToolbarFuzzyInputProps<T, PT>) => {
		const {fuzzyFilter, fuzzyPlaceholderKey} = props;

		const tableContext = useHxTable();
		const {delay} = useDelayedFunc();
		const ref = useRef<HTMLInputElement>(null);
		const $fuzzyFilterModel = useFuncResultRef(() => {
			return ERO.reactive({value: '', lastCommittedValue: ''});
		});
		const commitValueFuncRef = useRef((value?: string) => {
			return () => {
				const fuzzyWords = filterStrToWords(value);
				$fuzzyFilterModel.current.lastCommittedValue = value ?? '';
				tableContext.fuzzyChange(fuzzyWords, (dataSynchronized, error) => {
					if (dataSynchronized && error == null) {
						tableContext.dataChanged();
					}
				});
			};
		});

		useEffect(() => {
			if (fuzzyFilter === 'change') {
				const onChange = (ev: ValueChangedEvent) => {
					const value = ev.newValue as undefined | string;
					delay('fuzzy-change', commitValueFuncRef.current(value), 200);
				};
				const model = $fuzzyFilterModel.current;
				ERO.on(model, 'value', onChange);
				return () => {
					ERO.off(model, 'value', onChange);
				};
			}
		}, [fuzzyFilter, $fuzzyFilterModel, delay]);

		const onKeyDown = (ev: KeyboardEvent<HTMLInputElement>) => {
			if (!['enter', 'enter+blur'].includes(fuzzyFilter)) {
				return;
			}
			if (ev.key === 'Enter' && !ev.nativeEvent.isComposing) {
				const value = ref.current?.value;
				delay('fuzzy-change', commitValueFuncRef.current(value), 200);
			}
		};
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const onBlur = (_ev: FocusEvent<HTMLInputElement>) => {
			if (fuzzyFilter !== 'enter+blur') {
				return;
			}
			const value = ref.current?.value;
			if ((value ?? '') === $fuzzyFilterModel.current.lastCommittedValue) {
				return;
			} else {
				delay('fuzzy-change', commitValueFuncRef.current(value), 0);
			}
		};

		return <HxInput $model={$fuzzyFilterModel.current} $field="value"
		                prefix={[<HxLabel data-hx-label-input-embed="" data-hx-label-svg-icon=""
		                                  text={<MagnifyingGlass/>}/>]}
		                placeholder={fuzzyPlaceholderKey}
		                data-hx-table-toolbar-fuzzy=""
		                onKeyDown={onKeyDown} onBlur={onBlur}
		                ref={ref}/>;
	};
