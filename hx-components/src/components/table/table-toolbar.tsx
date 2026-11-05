import {reactive} from '@hx/data';
// @ts-expect-error import React
import React, {type ReactNode, useEffect, useRef, useState} from 'react';
import {useHxContext} from '../../contexts';
import {I18NUtils} from '../../utils';
import {HxBadge} from '../badge';
import {HxButton} from '../button';
import {ArrowDown, ArrowUp, Clear, Filter, MagnifyingGlass, Sort} from '../icons';
import {HxInput} from '../input';
import {HxLabel} from '../label';
import {HxPopupProvider, usePopupVisibleRef} from '../popup';
import {useHxTable} from './table-provider';
import {HxTableToolbarFilterPanel} from './table-toolbar-filter-panel';
import {HxTableToolbarSortPanel} from './table-toolbar-sort-panel';
import {filterMethodLabel, filterValueText, type HxTableFilterMethodLabels} from './table-toolbar-utils';
import type {
	HxTableDataCriteria,
	HxTableFilterCriteria,
	HxTableFilterMethod,
	HxTableProps,
	HxTableSortCriteria,
	HxTableSortMethod
} from './types';

export type HxTableToolbarProps<T extends object, PT extends object = T> =
	Pick<HxTableProps<T, PT>,
		| 'sort' | 'filter'
		| 'toolbarSearchPlaceholderKey'
		| 'toolbarSortKey' | 'toolbarFilterKey'
		| 'toolbarAddKey' | 'toolbarResetKey' | 'toolbarApplyKey' | 'toolbarClearAllKey'
		| 'toolbarNoChangesKey' | 'toolbarUnsavedChangesKey'
		| 'toolbarNoSortKey' | 'toolbarNoFilterKey'
		| 'toolbarAscKey' | 'toolbarDescKey'
		| 'toolbarFilterMatchKey' | 'toolbarFilterUnmatchKey'
		| 'toolbarFilterAndKey' | 'toolbarFilterOrKey'>;

type HxTableToolbarEntryKind = 'sort' | 'filter';

interface HxTableToolbarChip {
	kind: HxTableToolbarEntryKind;
	index: number;
	key: string | ReactNode;
	sortMethod?: HxTableSortMethod;
	filterMethod?: HxTableFilterMethod;
	value?: unknown;
}

const HxTableToolbarEntryButton = (props: { kind: HxTableToolbarEntryKind }) => {
	const {kind} = props;

	const ref = useRef<HTMLButtonElement>(null);
	const {visibleRef} = usePopupVisibleRef({elementRef: ref});
	const open = () => {
		visibleRef.current.show(false, {position: 'bottom', alignTo: 'right', minWidth: 340, maxHeight: 420});
	};
	const onClick = () => {
		if (visibleRef.current.isVisible()) {
			visibleRef.current.hide();
		} else {
			open();
		}
	};

	return <HxButton data-hx-table-toolbar-entry={kind}
	                 data-hx-button-svg-icon=""
	                 variant="ghost" color="waive"
	                 uppercase={false}
	                 text={kind === 'sort' ? <Sort/> : <Filter/>}
	                 ref={ref}
	                 onClick={onClick}/>;
};

/**
 * Table toolbar: the only entry for sort and filter. The toolbar row holds the
 * global search box and the sort/filter entry buttons; the condition bar below
 * shows the committed criteria as chips. Panels are non-modal popovers, and
 * every panel edit stays in a draft until Apply commits it in one criteria change.
 */
export const HxTableToolbar =
	<T extends object, PT extends object = T>(props: HxTableToolbarProps<T, PT>) => {
		const {
			sort, filter,
			toolbarSearchPlaceholderKey,
			toolbarSortKey, toolbarFilterKey,
			toolbarAddKey, toolbarResetKey, toolbarApplyKey, toolbarClearAllKey,
			toolbarNoChangesKey, toolbarUnsavedChangesKey,
			toolbarNoSortKey, toolbarNoFilterKey,
			toolbarAscKey, toolbarDescKey,
			toolbarFilterMatchKey, toolbarFilterUnmatchKey, toolbarFilterAndKey, toolbarFilterOrKey
		} = props;

		const filterMethodLabels: HxTableFilterMethodLabels = {
			match: toolbarFilterMatchKey,
			unmatch: toolbarFilterUnmatchKey,
			and: toolbarFilterAndKey,
			or: toolbarFilterOrKey
		};

		const context = useHxContext();
		const tableContext = useHxTable();

		const [criteria, setCriteria] = useState<Omit<HxTableDataCriteria, 'type'>>({});
		// criteria monitors are registered in an effect after the first render,
		// read the initial criteria (declared defaults) once mounted, and refresh
		// whenever the table asks its listeners to refresh the data
		useEffect(() => {
			const askCriteria = () => tableContext.askCriteria(current => setCriteria(current));
			askCriteria();
			tableContext.onDataChanged(askCriteria);
			return () => {
				tableContext.offDataChanged(askCriteria);
			};
		}, [tableContext]);

		// TODO the toolbar search is visual-only until HxTableDataCriteria carries the keyword
		const [searchModel] = useState(() => reactive({keyword: ''}));

		const sortCriteria: HxTableSortCriteria = criteria.sort ?? [];
		const filterCriteria: HxTableFilterCriteria = criteria.filter ?? [];

		const sortLabelOf = (key: string | ReactNode): string => {
			const entry = sort?.find(item => item.key === key);
			return I18NUtils.asText(entry?.text ?? key, context);
		};
		const filterLabelOf = (key: string | ReactNode): string => {
			const column = filter?.columns.find(item => item.key === key);
			return I18NUtils.asText(column?.text ?? key, context);
		};

		const chips: Array<HxTableToolbarChip> = [];
		sortCriteria.forEach((item, index) => {
			chips.push({kind: 'sort', index, key: item.key, sortMethod: item.method});
		});
		filterCriteria.forEach((item, index) => {
			chips.push({kind: 'filter', index, key: item.key, filterMethod: item.method, value: item.value});
		});
		const hasConditions = chips.length !== 0;

		const changeSort = (next: HxTableSortCriteria) => {
			return new Promise<void>((resolve) => {
				tableContext.sortChange(next, () => resolve());
			});
		};
		const changeFilter = (next: HxTableFilterCriteria) => {
			return new Promise<void>((resolve) => {
				tableContext.filterChange(next, () => resolve());
			});
		};
		const removeChip = (chip: HxTableToolbarChip) => {
			if (chip.kind === 'sort') {
				changeSort(sortCriteria.filter((_, index) => index !== chip.index));
			} else {
				changeFilter(filterCriteria.filter((_, index) => index !== chip.index));
			}
		};
		const clearAll = async () => {
			// criteria snapshots are accumulated one change at a time,
			// so the two clear changes must be committed in sequence
			if (sortCriteria.length !== 0) {
				await changeSort([]);
			}
			if (filterCriteria.length !== 0) {
				await changeFilter([]);
			}
		};

		return <>
			<div data-hx-table-toolbar="">
				{filter?.fuzzy === true
					? <HxInput $model={searchModel} $field="keyword"
					           prefix={[
						           <HxLabel data-hx-label-input-embed="" data-hx-label-svg-icon=""
						                    text={<MagnifyingGlass/>}/>
					           ]}
					           placeholder={toolbarSearchPlaceholderKey}
					           data-hx-table-toolbar-search=""/>
					: (void 0)}
				<div data-hx-table-toolbar-spacer=""/>
				{sort != null && sort.length !== 0
					? <HxPopupProvider
						sameWidthAtMinimum={false}
						data-hx-popup-for-table-toolbar-sort=""
						trigger={<HxTableToolbarEntryButton kind="sort"/>}>
						<HxTableToolbarSortPanel entries={sort} committed={sortCriteria}
						                         sortKey={toolbarSortKey}
						                         noSortKey={toolbarNoSortKey}
						                         ascKey={toolbarAscKey} descKey={toolbarDescKey}
						                         addKey={toolbarAddKey} resetKey={toolbarResetKey}
						                         applyKey={toolbarApplyKey}
						                         noChangesKey={toolbarNoChangesKey}
						                         unsavedChangesKey={toolbarUnsavedChangesKey}/>
					</HxPopupProvider>
					: (void 0)}
				{filter != null
					? <HxPopupProvider
						sameWidthAtMinimum={false}
						data-hx-popup-for-table-toolbar-filter=""
						trigger={<HxTableToolbarEntryButton kind="filter"/>}>
						<HxTableToolbarFilterPanel columns={filter.columns} committed={filterCriteria}
						                           filterKey={toolbarFilterKey}
						                           noFilterKey={toolbarNoFilterKey}
						                           addKey={toolbarAddKey} resetKey={toolbarResetKey}
						                           applyKey={toolbarApplyKey}
						                           noChangesKey={toolbarNoChangesKey}
						                           unsavedChangesKey={toolbarUnsavedChangesKey}
						                           methodLabels={filterMethodLabels}/>
					</HxPopupProvider>
					: (void 0)}
			</div>
			{hasConditions
				? <div data-hx-table-toolbar-conditions="">
					<div data-hx-table-toolbar-chips="">
						{chips.map(chip => {
							if (chip.kind === 'sort') {
								return <HxBadge data-hx-table-toolbar-chip="sort"
								                color="waive" variant="outline" size="sm" borderRadius="round"
								                key={`sort-${chip.index}`}
								                text={<>
									                <span data-hx-table-toolbar-chip-order="">{chip.index + 1}</span>
									                <span data-hx-table-toolbar-chip-direction="">
										                {chip.sortMethod === 'asc' ? <ArrowUp/> : <ArrowDown/>}
									                </span>
									                <span>{sortLabelOf(chip.key)}</span>
									                <HxButton data-hx-table-toolbar-chip-remove=""
									                          variant="ghost" color="waive"
									                          uppercase={false}
									                          text={<Clear/>}
									                          onClick={() => removeChip(chip)}/>
								                </>}/>;
							}
							return <HxBadge data-hx-table-toolbar-chip="filter"
							                color="waive" variant="outline" size="sm" borderRadius="round"
							                key={`filter-${chip.index}`}
							                text={<>
								                <span>{filterLabelOf(chip.key)}</span>
								                <HxLabel text={filterMethodLabel(chip.filterMethod, filterMethodLabels)}/>
								                <span>{filterValueText(chip.value)}</span>
								                <HxButton data-hx-table-toolbar-chip-remove=""
								                          variant="ghost" color="waive"
								                          uppercase={false}
								                          text={<Clear/>}
								                          onClick={() => removeChip(chip)}/>
							                </>}/>;
						})}
					</div>
					<HxButton data-hx-table-toolbar-clear-all=""
					          variant="ghost" color="waive"
					          uppercase={false}
					          text={toolbarClearAllKey}
					          onClick={clearAll}/>
				</div>
				: (void 0)}
		</>;
	};
