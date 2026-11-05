import {ERO, reactive} from '@hx/data';
// @ts-expect-error import React
import React, {type KeyboardEvent, type ReactNode, useEffect, useState} from 'react';
import {useHxContext} from '../../contexts';
import {useForceUpdate} from '../../hooks';
import {I18NUtils} from '../../utils';
import {HxButton} from '../button';
import {Close} from '../icons';
import {HxInput} from '../input';
import {HxLabel} from '../label';
import {useHxPopup} from '../popup';
import {HxSelect} from '../select';
import {useHxTable} from './table-provider';
import {filterMethodLabel, filterValueText, type HxTableFilterMethodLabels} from './table-toolbar-utils';
import type {HxTableFilterColumn, HxTableFilterCriteria, HxTableFilterMethod} from './types';

export interface HxTableToolbarFilterPanelProps {
	/** The filterable columns declared on the table */
	columns: Array<HxTableFilterColumn>;
	/** The filter criteria currently committed to the table */
	committed: HxTableFilterCriteria;
	/** i18n translation key or React node for the panel title */
	filterKey: ReactNode;
	/** i18n translation key or React node for the empty draft hint */
	noFilterKey: ReactNode;
	/** i18n translation key or React node for the add button */
	addKey: ReactNode;
	/** i18n translation key or React node for the reset button */
	resetKey: ReactNode;
	/** i18n translation key or React node for the apply button */
	applyKey: ReactNode;
	/** i18n translation key or React node for the unchanged draft hint */
	noChangesKey: ReactNode;
	/** i18n translation key or React node for the changed draft hint */
	unsavedChangesKey: ReactNode;
	/** i18n translation keys or React nodes for the filter methods */
	methodLabels: HxTableFilterMethodLabels;
}

const comparable = (list: HxTableFilterCriteria): string => {
	return list.map(item => {
		const value = Array.isArray(item.value) ? item.value.join(',') : item.value;
		return `${typeof item.key === 'string' ? item.key : ''}:${item.method ?? ''}:${value ?? ''}`;
	}).join('|');
};

/**
 * Filter popover content: edits a draft of the filter criteria and commits it on Apply.
 * The content is destroyed when the popover closes, which discards the draft.
 */
export const HxTableToolbarFilterPanel = (props: HxTableToolbarFilterPanelProps) => {
	const {
		columns, committed,
		filterKey, noFilterKey,
		addKey, resetKey, applyKey,
		noChangesKey, unsavedChangesKey,
		methodLabels
	} = props;

	const context = useHxContext();
	const tableContext = useHxTable();
	const popupContext = useHxPopup();

	interface FilterEntryModel {
		column: string;
		method: HxTableFilterMethod;
		value?: string;
		valueTo?: string;
	}

	const [draft, setDraft] = useState<HxTableFilterCriteria>(() => committed.map(item => ({...item})));
	const [entryModel] = useState(() => reactive<FilterEntryModel>({
		column: columns[0].key,
		method: columns[0].range === true ? 'and' : 'match',
		value: (void 0),
		valueTo: (void 0)
	}));
	const forceUpdate = useForceUpdate();

	const entryColumn = columns.find(column => column.key === entryModel.column) ?? columns[0];
	const range = entryColumn.range === true;
	const methods: Array<HxTableFilterMethod> = range ? ['and', 'or'] : ['match', 'unmatch'];

	const columnOf = (key: HxTableFilterCriteria[number]['key']): HxTableFilterColumn | undefined => {
		return columns.find(column => column.key === key);
	};
	const labelOf = (key: HxTableFilterCriteria[number]['key']): string => {
		const column = columnOf(key);
		return I18NUtils.asText(column?.text ?? key, context);
	};
	const dirty = comparable(draft) !== comparable(committed);

	useEffect(() => {
		// column changed, the available methods depend on the column range
		const onColumnChanged = () => {
			const column = columns.find(item => item.key === entryModel.column);
			entryModel.method = column?.range === true ? 'and' : 'match';
			forceUpdate();
		};
		ERO.on(entryModel, 'column', onColumnChanged);
		return () => {
			ERO.off(entryModel, 'column', onColumnChanged);
		};
	}, [entryModel, columns, forceUpdate]);

	const addFilter = () => {
		const value = (entryModel.value ?? '').trim();
		const valueTo = (entryModel.valueTo ?? '').trim();
		if (range) {
			if (value.length === 0 || valueTo.length === 0) {
				return;
			}
			setDraft([...draft, {key: entryModel.column, method: entryModel.method, value: [value, valueTo]}]);
		} else {
			if (value.length === 0) {
				return;
			}
			setDraft([...draft, {key: entryModel.column, method: entryModel.method, value}]);
		}
		ERO.setValue(entryModel, 'value', (void 0));
		ERO.setValue(entryModel, 'valueTo', (void 0));
	};
	const onEntryValueKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			addFilter();
		}
	};
	const removeFilter = (index: number) => {
		setDraft(draft => draft.filter((_, itemIndex) => itemIndex !== index));
	};
	const reset = () => {
		setDraft(committed.map(item => ({...item})));
	};
	const apply = () => {
		if (!dirty) {
			return;
		}
		tableContext.filterChange(draft, (dataUpdated) => {
			if (dataUpdated) {
				popupContext.hide();
			}
		});
	};

	return <div data-hx-table-toolbar-panel="filter">
		<div data-hx-table-toolbar-panel-head><HxLabel text={filterKey}/></div>
		<div data-hx-table-toolbar-panel-entry>
			<HxSelect $model={entryModel} $field="column"
			          options={columns.map(column => ({
				          value: column.key,
				          label: I18NUtils.asText(column.text, context)
			          }))}
			          data-hx-table-toolbar-panel-column=""/>
			<HxSelect $model={entryModel} $field="method"
			          options={methods.map(method => ({value: method, label: filterMethodLabel(method, methodLabels)}))}
			          data-hx-table-toolbar-panel-method=""/>
			<HxInput $model={entryModel} $field="value"
			         emitChangeDelay={0}
			         data-hx-table-toolbar-panel-value=""
			         onKeyDown={onEntryValueKeyDown}/>
			{range
				? <HxInput $model={entryModel} $field="valueTo"
				           emitChangeDelay={0}
				           data-hx-table-toolbar-panel-value=""
				           onKeyDown={onEntryValueKeyDown}/>
				: (void 0)}
			<HxButton data-hx-table-toolbar-panel-add=""
			          variant="outline"
			          uppercase={false}
			          text={addKey}
			          onClick={addFilter}/>
		</div>
		<div data-hx-table-toolbar-panel-list="">
			{draft.length === 0
				? <div data-hx-table-toolbar-panel-empty=""><HxLabel text={noFilterKey}/></div>
				: draft.map((item, index) => {
					return <div data-hx-table-toolbar-panel-item="" key={index}>
						<span data-hx-table-toolbar-panel-label="">{labelOf(item.key)}</span>
						<HxLabel text={filterMethodLabel(item.method, methodLabels)}/>
						<span data-hx-table-toolbar-panel-value-text="">{filterValueText(item.value)}</span>
						<span data-hx-table-toolbar-panel-spacer=""/>
						<HxButton data-hx-table-toolbar-panel-remove=""
						          variant="ghost" color="waive"
						          uppercase={false}
						          text={<Close/>}
						          onClick={() => removeFilter(index)}/>
					</div>;
				})}
		</div>
		<div data-hx-table-toolbar-panel-foot="">
			<span data-hx-table-toolbar-panel-dirty=""
			      data-hx-table-toolbar-panel-dirty-active={dirty ? '' : (void 0)}>
				<HxLabel text={dirty ? unsavedChangesKey : noChangesKey}/>
			</span>
			<span data-hx-table-toolbar-panel-spacer=""/>
			<HxButton data-hx-table-toolbar-panel-reset=""
			          variant="ghost" color="waive"
			          uppercase={false}
			          text={resetKey}
			          onClick={reset}/>
			<HxButton data-hx-table-toolbar-panel-apply=""
			          color="primary"
			          variant="solid"
			          uppercase={false}
			          text={applyKey}
			          $disabled={!dirty}
			          onClick={apply}/>
		</div>
	</div>;
};
