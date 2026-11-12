import {ERO, type ReactiveRoot} from '@hx/data';
// @ts-expect-error import React
import React, {type KeyboardEvent, type MouseEvent, useState} from 'react';
import {HxButton} from '../button';
import {ChevronDown, ChevronUp, Clear, SortAsc, SortDesc} from '../icons';
import {HxLabel} from '../label';
import {useHxPopup} from '../popup';
import {HxSelect} from '../select';
import type {HxSelectOption} from '../select-options';
import {useHxTable} from './table-provider';
import type {HxTableProps, HxTableSortColumn, HxTableSortColumnCriteria, HxTableSortCriteria} from './types';

export type HxTableToolbarSortPopupProps<T extends object, PT extends object = T> =
	& Required<
	Pick<
		HxTableProps<T, PT>,
		| 'sortColumns'
		| 'noSortColumnKey' | 'addToSortKey' | 'noMoreSortColumnKey'
		| 'sortPopupConfirmKey' | 'sortPopupCancelKey' | 'sortPopupClearKey'
	>>;

export const EvtHxTable_CloseSortPopup = 'evt-hx-table--close-sort-popup';

type MoreSortableColumnModel = ReactiveRoot & { value?: string };

interface HxTableToolbarSortPopupState {
	defs: Record<string, HxTableSortColumn>;
	sorted: HxTableSortCriteria;
	moreSortableColumn?: boolean;
	moreSortableColumnModel: MoreSortableColumnModel;
	moreSortableColumns: Array<HxSelectOption<string>>;
}

export const HxTableToolbarSortPopup =
	<T extends object, PT extends object = T>(props: HxTableToolbarSortPopupProps<T, PT>) => {
		const {
			sortColumns,
			noSortColumnKey, addToSortKey, noMoreSortColumnKey,
			sortPopupConfirmKey, sortPopupCancelKey, sortPopupClearKey
		} = props;

		const tableContext = useHxTable();
		const popupContext = useHxPopup();
		const [state, setState] = useState<HxTableToolbarSortPopupState>(() => {
			const defs = sortColumns.reduce((map, column) => {
				map[column.key] = column;
				return map;
			}, {} as Record<string, HxTableSortColumn>);
			const sortedKeys: Record<string, true> = {};
			const sorted: HxTableSortCriteria = [];
			tableContext.askCriteria(criteria => {
				// it is synchronized
				(criteria.sort ?? []).filter(column => {
					// ignore the column which not defined in definitions
					return defs[column.key] != null;
				}).forEach(column => {
					// clone it
					sorted.push({key: column.key, method: column.method});
					sortedKeys[column.key] = true;
				});
			});
			const moreSortableColumn = sorted.length < sortColumns.length;
			// @ts-expect-error ignore check
			const moreSortableColumnModel = ERO.reactive<MoreSortableColumnModel>({});
			const moreSortableColumns = moreSortableColumn
				? sortColumns.map(column => {
					// noinspection PointlessBooleanExpressionJS
					if (sortedKeys[column.key] !== true) {
						return {value: column.key, label: column.text};
					} else {
						return (void 0);
					}
				}).filter(option => option != null)
				: [];
			ERO.on(moreSortableColumnModel, 'value', (ev) => {
				const {newValue} = ev;
				// TIP remove option leads click outside popup, leads whole popup closing
				//  so using timeout to avoid, let the select popup closed first, and repaint sort popup in next ticket round.
				setTimeout(() => {
					if (newValue != null && newValue.trim().length > 0) {
						const column = defs[newValue];
						if (column != null) {
							delete moreSortableColumnModel.value;
							// eslint-disable-next-line react-hooks/immutability
							setState(state => {
								const moreSortableColumns = state.moreSortableColumns.filter(option => {
									return option.value !== column.key;
								});
								const sorted: Array<HxTableSortColumnCriteria> = [
									...state.sorted,
									{key: column.key, method: 'asc'}
								];
								const moreSortableColumn = sorted.length < sortColumns.length;
								return {...state, moreSortableColumn, moreSortableColumns, sorted};
							});
						}
					}
				}, 0);
			});
			return {defs, sorted, moreSortableColumn, moreSortableColumnModel, moreSortableColumns};
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
		const onSortedColumnAscClick = (column: HxTableSortColumnCriteria) => {
			return (ev: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => {
				if (!checkKeyboard(ev)) {
					return;
				}

				if (column.method !== 'asc') {
					column.method = 'asc';
					ev.currentTarget.setAttribute('data-hx-active', '');
					ev.currentTarget.nextElementSibling?.removeAttribute('data-hx-active');
				}
				ev.stopPropagation();
			};
		};
		const onSortedColumnDescClick = (column: HxTableSortColumnCriteria) => {
			return (ev: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => {
				if (!checkKeyboard(ev)) {
					return;
				}

				if (column.method !== 'desc') {
					column.method = 'desc';
					ev.currentTarget.setAttribute('data-hx-active', '');
					ev.currentTarget.previousElementSibling?.removeAttribute('data-hx-active');
				}
				ev.stopPropagation();
			};
		};
		const onSortedColumnMoveUpClick = (column: HxTableSortColumnCriteria) => {
			return (ev: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => {
				if (!checkKeyboard(ev)) {
					return;
				}

				const index = state.sorted.indexOf(column);
				if (index === 0) {
					return;
				}

				const prevColumn = state.sorted[index - 1];
				state.sorted[index - 1] = column;
				state.sorted[index] = prevColumn;
				setState({...state, sorted: state.sorted});
				ev.stopPropagation();
			};
		};
		const onSortedColumnMoveDownClick = (column: HxTableSortColumnCriteria) => {
			return (ev: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => {
				if (!checkKeyboard(ev)) {
					return;
				}

				const index = state.sorted.indexOf(column);
				if (index === state.sorted.length - 1) {
					return;
				}

				const nextColumn = state.sorted[index + 1];
				state.sorted[index + 1] = column;
				state.sorted[index] = nextColumn;
				setState({...state, sorted: state.sorted});
				ev.stopPropagation();
			};
		};
		const onSortedColumnRemoveClick = (column: HxTableSortColumnCriteria) => {
			return (ev: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => {
				if (!checkKeyboard(ev)) {
					return;
				}

				const columnDef = sortColumns.find(def => def.key === column.key);
				if (columnDef != null) {
					const sorted = state.sorted.filter(exists => exists !== column);
					const moreSortableColumn = sorted.length < sortColumns.length;
					const moreSortableColumns = [
						...state.moreSortableColumns,
						{value: columnDef.key, label: columnDef.text}
					];
					setState({...state, moreSortableColumn, moreSortableColumns, sorted});
				}
				ev.stopPropagation();
			};
		};
		const onCancelClick = (ev: MouseEvent<HTMLButtonElement>) => {
			popupContext.emit(EvtHxTable_CloseSortPopup);
			ev.stopPropagation();
		};
		const onClearClick = (ev: MouseEvent<HTMLButtonElement>) => {
			setState({
				...state,
				moreSortableColumn: true,
				moreSortableColumns: sortColumns.map(column => ({value: column.key, label: column.text})),
				sorted: []
			});
			ev.stopPropagation();
		};
		const onConfirmClick = (ev: MouseEvent<HTMLButtonElement>) => {
			tableContext.sortChange(state.sorted, (dataSynchronized, error) => {
				if (dataSynchronized && error == null) {
					tableContext.repaintCriteria();
					tableContext.dataChanged();
					// close popup when no error
					popupContext.emit(EvtHxTable_CloseSortPopup);
				}
			});
			ev.stopPropagation();
		};

		return <>
			<div data-hx-table-sort-columns="">
				{state.sorted.length === 0
					? <div data-hx-table-no-sort-column=""><HxLabel text={noSortColumnKey}/></div>
					: state.sorted.map((sortedColumn, index) => {
						const key = sortedColumn.key;
						const columnDef = state.defs[key];
						return <div data-hx-table-sort-column="" key={key}>
							<HxLabel text={`${index + 1}.`} data-hx-table-sort-column-index=""/>
							<HxLabel text={columnDef.text} data-hx-table-sort-column-key=""/>
							<HxButton variant="outline" text={<SortAsc/>} data-hx-table-sort-column-button="asc"
							          data-hx-active={sortedColumn.method === 'asc' ? '' : (void 0)}
							          onClick={onSortedColumnAscClick(sortedColumn)}
							          onKeyDown={onSortedColumnAscClick(sortedColumn)}/>
							<HxButton variant="outline" text={<SortDesc/>} data-hx-table-sort-column-button="desc"
							          data-hx-active={sortedColumn.method === 'desc' ? '' : (void 0)}
							          onClick={onSortedColumnDescClick(sortedColumn)}
							          onKeyDown={onSortedColumnDescClick(sortedColumn)}/>
							<HxButton variant="outline" text={<ChevronUp/>} data-hx-table-sort-column-button="up"
							          $disabled={index === 0}
							          onClick={onSortedColumnMoveUpClick(sortedColumn)}
							          onKeyDown={onSortedColumnMoveUpClick(sortedColumn)}/>
							<HxButton variant="outline" text={<ChevronDown/>} data-hx-table-sort-column-button="down"
							          $disabled={(index === state.sorted.length - 1)}
							          onClick={onSortedColumnMoveDownClick(sortedColumn)}
							          onKeyDown={onSortedColumnMoveDownClick(sortedColumn)}/>
							<HxButton variant="outline" color="danger" text={<Clear/>}
							          data-hx-table-sort-column-button="clear"
							          onClick={onSortedColumnRemoveClick(sortedColumn)}
							          onKeyDown={onSortedColumnRemoveClick(sortedColumn)}/>
						</div>;
					})}
			</div>
			<div data-hx-table-sort-more-column="">
				<HxLabel text={addToSortKey}/>
				<HxSelect $model={state.moreSortableColumnModel} $field="value"
				          options={state.moreSortableColumns} sort={true}
				          $disabled={!state.moreSortableColumn}
				          noOptionsKey={noMoreSortColumnKey}/>
			</div>
			<div data-hx-table-sort-operators="">
				<HxButton variant="outline" color="waive" text={<HxLabel text={sortPopupCancelKey}/>}
				          data-hx-table-sort-button="cancel" onClick={onCancelClick} key="cancel"/>
				<HxButton variant="outline" color="waive" text={<HxLabel text={sortPopupClearKey}/>}
				          data-hx-table-sort-button="clear" onClick={onClearClick} key="clear"/>
				<HxButton variant="solid" color="primary" text={<HxLabel text={sortPopupConfirmKey}/>}
				          data-hx-table-sort-button="confirm" onClick={onConfirmClick} key="confirm"/>
			</div>
		</>;
	};
