import {ERO, type ReactiveRoot} from '@hx/data';
// @ts-expect-error import React
import React, {type KeyboardEvent, type MouseEvent, useState} from 'react';
import {HxButton} from '../button';
import {Clear} from '../icons';
import {HxInput} from '../input';
import {HxLabel} from '../label';
import {HxMSelect} from '../m-select';
import {useHxPopup} from '../popup';
import {HxSelect} from '../select';
import type {HxSelectOption} from '../select-options';
import {useHxTable} from './table-provider';
import type {HxTableFilterColumn, HxTableFilterColumnCriteria, HxTableFilterCriteria, HxTableProps} from './types';
import {createColumnFilterCriteria, filterStrToWords, filterWordsToStr} from './utils';

export type HxTableToolbarFilterPopupProps<T extends object, PT extends object = T> =
	& Required<
	Pick<
		HxTableProps<T, PT>,
		| 'filterColumns'
		| 'filterMatchKey' | 'filterNotMatchKey' | 'filterBetweenKey' | 'filterNotBetweenKey'
		| 'noFilterColumnKey' | 'addToFilterKey' | 'noMoreFilterColumnKey'
		| 'filterPopupConfirmKey' | 'filterPopupCancelKey' | 'filterPopupClearKey'
	>>;

export const EvtHxTable_CloseFilterPopup = 'evt-hx-table--close-filter-popup';

type MoreFilterableColumnModel = ReactiveRoot & { value?: string };

interface HxTableToolbarFilterPopupState {
	defs: Record<string, HxTableFilterColumn>;
	filtered: HxTableFilterCriteria;
	moreFilterableColumn?: boolean;
	moreFilterableColumnModel: MoreFilterableColumnModel;
	moreFilterableColumns: Array<HxSelectOption<string>>;
}

export const HxTableToolbarFilterPopup =
	<T extends object, PT extends object = T>(props: HxTableToolbarFilterPopupProps<T, PT>) => {
		const {
			filterColumns,
			filterMatchKey, filterNotMatchKey, filterBetweenKey, filterNotBetweenKey,
			noFilterColumnKey, addToFilterKey, noMoreFilterColumnKey,
			filterPopupConfirmKey, filterPopupCancelKey, filterPopupClearKey
		} = props;

		const tableContext = useHxTable();
		const popupContext = useHxPopup();
		const [state, setState] = useState<HxTableToolbarFilterPopupState>(() => {
			const defs = filterColumns.reduce((map, column) => {
				map[column.key] = column;
				return map;
			}, {} as Record<string, HxTableFilterColumn>);
			const filteredKeys: Record<string, true> = {};
			const filtered: HxTableFilterCriteria = [];
			tableContext.askCriteria(criteria => {
				const cloneValue = (value: HxTableFilterColumnCriteria['value']): HxTableFilterColumnCriteria['value'] => {
					if (Array.isArray(value)) {
						return value.map(v => cloneValue(v)) as HxTableFilterColumnCriteria['value'];
					} else {
						return value;
					}
				};
				// it is synchronized
				(criteria.filter ?? []).filter(column => {
					// ignore the column which not defined in definitions
					return defs[column.key] != null;
				}).forEach(column => {
					// clone it
					if (defs[column.key].type === 'words') {
						// transform the words values to plain string
						filtered.push({key: column.key, method: column.method, value: filterWordsToStr(column.value)});
					} else {
						filtered.push({key: column.key, method: column.method, value: cloneValue(column.value)});
					}
					filteredKeys[column.key] = true;
				});
			});
			const moreFilterableColumn = filtered.length < filterColumns.length;
			// @ts-expect-error ignore check
			const moreFilterableColumnModel = ERO.reactive<MoreFilterableColumnModel>({});
			const moreFilterableColumns = moreFilterableColumn
				? filterColumns.map(column => {
					// noinspection PointlessBooleanExpressionJS
					if (filteredKeys[column.key] !== true) {
						return {value: column.key, label: column.text};
					} else {
						return (void 0);
					}
				}).filter(option => option != null)
				: [];
			ERO.on(moreFilterableColumnModel, 'value', (ev) => {
				const {newValue} = ev;
				// TIP remove option leads click outside popup, leads whole popup closing
				//  so using timeout to avoid, let the select popup closed first, and repaint sort popup in next ticket round.
				setTimeout(() => {
					if (newValue != null && newValue.trim().length > 0) {
						const column = defs[newValue];
						if (column != null) {
							delete moreFilterableColumnModel.value;
							// eslint-disable-next-line react-hooks/immutability
							setState(state => {
								const moreFilterableColumns = state.moreFilterableColumns.filter(option => {
									return option.value !== column.key;
								});
								const filtered: Array<HxTableFilterColumnCriteria> = [...state.filtered, createColumnFilterCriteria(column, true)];
								const moreFilterableColumn = filtered.length < filterColumns.length;
								return {...state, moreFilterableColumn, moreFilterableColumns, filtered};
							});
						}
					}
				}, 0);
			});
			return {defs, filtered, moreFilterableColumn, moreFilterableColumnModel, moreFilterableColumns};
		});

		const checkKeyboard = (ev: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>): boolean => {
			if (ev.type === 'keydown') {
				const e = ev as KeyboardEvent<HTMLButtonElement>;
				if (e.key === ' ') {
					e.preventDefault();
				} else if (e.key !== 'Enter') {
					return false;
				}
			}
			return true;
		};
		const onFilteredColumnRemoveClick = (column: HxTableFilterColumnCriteria) => {
			return (ev: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => {
				if (!checkKeyboard(ev)) {
					return;
				}

				const columnDef = filterColumns.find(def => def.key === column.key);
				if (columnDef != null) {
					const filtered = state.filtered.filter(exists => exists !== column);
					const moreFilterableColumn = filtered.length < filterColumns.length;
					const moreFilterableColumns = [
						...state.moreFilterableColumns,
						{value: columnDef.key, label: columnDef.text}
					];
					setState({...state, moreFilterableColumn, moreFilterableColumns, filtered});
				}
				ev.stopPropagation();
			};
		};
		const onCancelClick = (ev: MouseEvent<HTMLButtonElement>) => {
			popupContext.emit(EvtHxTable_CloseFilterPopup);
			ev.stopPropagation();
		};
		const onClearClick = (ev: MouseEvent<HTMLButtonElement>) => {
			setState({
				...state,
				moreFilterableColumn: true,
				moreFilterableColumns: filterColumns.map(column => ({value: column.key, label: column.text})),
				filtered: []
			});
			ev.stopPropagation();
		};
		const onConfirmClick = (ev: MouseEvent<HTMLButtonElement>) => {
			const defs = filterColumns.reduce((map, column) => {
				map[column.key] = column;
				return map;
			}, {} as Record<string, HxTableFilterColumn>);
			const filtered = state.filtered.map(filtered => {
				return {
					key: filtered.key,
					method: filtered.method,
					value: defs[filtered.key]?.type === 'words' ? filterStrToWords(filtered.value) : filtered.value
				};
			});
			tableContext.filterChange(filtered, (dataSynchronized, error) => {
				if (dataSynchronized && error == null) {
					tableContext.repaintCriteria();
					tableContext.dataChanged();
					// close popup when no error
					popupContext.emit(EvtHxTable_CloseFilterPopup);
				}
			});
			ev.stopPropagation();
		};

		const matchOptions = [
			{value: 'match', label: filterMatchKey},
			{value: 'not-match', label: filterNotMatchKey}
		];
		const betweenOptions = [
			{value: 'between', label: filterBetweenKey},
			{value: 'not-between', label: filterNotBetweenKey}
		];

		return <>
			<div data-hx-table-filter-columns="">
				{state.filtered.length === 0
					? <div data-hx-table-no-filter-column=""><HxLabel text={noFilterColumnKey}/></div>
					: state.filtered.map((filteredColumn, index) => {
						const key = filteredColumn.key;
						const $filteredColumnModel = ERO.reactive(filteredColumn);
						const methodOptions =
							matchOptions.some(opt => opt.value === filteredColumn.method)
								? matchOptions : betweenOptions;
						const columnDef = state.defs[key];
						let valueInput;
						if (columnDef.options != null) {
							if (columnDef.type === 'm-select') {
								valueInput = <HxMSelect $model={$filteredColumnModel} $field="value"
								                        options={columnDef.options}
								                        data-hx-table-filter-column-value="m-select"/>;
							} else if (columnDef.type === 'select') {
								valueInput = <HxSelect $model={$filteredColumnModel} $field="value"
								                       options={columnDef.options}
								                       data-hx-table-filter-column-value="select"/>;
							} else {
								valueInput = <HxInput $model={$filteredColumnModel} $field="value"
								                      data-hx-table-filter-column-value="words"/>;
							}
						} else if (columnDef.type === 'range') {
							valueInput = <>
								<HxInput $model={$filteredColumnModel} $field="value.[0]"
								         $domInputBox={{
									         // @ts-expect-error ignore check
									         'data-hx-table-filter-column-value': 'range-start'
								         }}/>
								<HxLabel text="-" data-hx-table-filter-column-value="range-dash"/>
								<HxInput $model={$filteredColumnModel} $field="value.[1]"
								         $domInputBox={{
									         // @ts-expect-error ignore check
									         'data-hx-table-filter-column-value': 'range-end'
								         }}/>
							</>;
						} else {
							// words, or downgraded from select/m-select
							valueInput = <HxInput $model={$filteredColumnModel} $field="value"
							                      $domInputBox={{
								                      // @ts-expect-error ignore check
								                      'data-hx-table-filter-column-value': 'words'
							                      }}/>;
						}

						return <div data-hx-table-filter-column="" key={key}>
							<HxLabel text={`${index + 1}.`} data-hx-table-filter-column-index=""/>
							<HxLabel text={columnDef.text} data-hx-table-filter-column-key=""/>
							<HxSelect $model={$filteredColumnModel} $field="method" options={methodOptions}
							          data-hx-table-filter-column-method=""/>
							{valueInput}
							<HxButton variant="outline" color="danger" text={<Clear/>}
							          data-hx-table-filter-column-button="clear"
							          onClick={onFilteredColumnRemoveClick(filteredColumn)}
							          onKeyDown={onFilteredColumnRemoveClick(filteredColumn)}/>
						</div>;
					})}
			</div>
			<div data-hx-table-filter-more-column="">
				<HxLabel text={addToFilterKey}/>
				<HxSelect $model={state.moreFilterableColumnModel} $field="value"
				          options={state.moreFilterableColumns} sort={true}
				          $disabled={!state.moreFilterableColumn}
				          noOptionsKey={noMoreFilterColumnKey}/>
			</div>
			<div data-hx-table-filter-operators="">
				<HxButton variant="outline" color="waive" text={<HxLabel text={filterPopupCancelKey}/>}
				          data-hx-table-filter-button="cancel" onClick={onCancelClick} key="cancel"/>
				<HxButton variant="outline" color="waive" text={<HxLabel text={filterPopupClearKey}/>}
				          data-hx-table-filter-button="clear" onClick={onClearClick} key="clear"/>
				<HxButton variant="solid" color="primary" text={<HxLabel text={filterPopupConfirmKey}/>}
				          data-hx-table-filter-button="confirm" onClick={onConfirmClick} key="confirm"/>
			</div>
		</>;
	};
