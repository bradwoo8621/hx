import {reactive} from '@hx/data';
// @ts-expect-error import React
import React, {type ReactNode, useState} from 'react';
import {useHxContext} from '../../contexts';
import {I18NUtils} from '../../utils';
import {HxButton} from '../button';
import {Close, TriangleDown, TriangleUp} from '../icons';
import {HxLabel} from '../label';
import {useHxPopup} from '../popup';
import {HxSelect} from '../select';
import {useHxTable} from './table-provider';
import type {HxTableSortCriteria, HxTableSortMethod, HxTableSortProps} from './types';

export interface HxTableToolbarSortPanelProps {
	/** The sortable columns declared on the table */
	entries: HxTableSortProps;
	/** The sort criteria currently committed to the table */
	committed: HxTableSortCriteria;
	/** i18n translation key or React node for the panel title */
	sortKey: ReactNode;
	/** i18n translation key or React node for the empty draft hint */
	noSortKey: ReactNode;
	/** i18n translation key or React node for ascending direction */
	ascKey: ReactNode;
	/** i18n translation key or React node for descending direction */
	descKey: ReactNode;
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
}

const comparable = (list: HxTableSortCriteria): string => {
	return list.map(item => `${typeof item.key === 'string' ? item.key : ''}:${item.method}`).join('|');
};

/**
 * Sort popover content: edits a draft of the sort criteria and commits it on Apply.
 * The content is destroyed when the popover closes, which discards the draft.
 */
export const HxTableToolbarSortPanel = (props: HxTableToolbarSortPanelProps) => {
	const {
		entries, committed,
		sortKey, noSortKey, ascKey, descKey,
		addKey, resetKey, applyKey,
		noChangesKey, unsavedChangesKey
	} = props;

	const context = useHxContext();
	const tableContext = useHxTable();
	const popupContext = useHxPopup();

	const [draft, setDraft] = useState<HxTableSortCriteria>(() => committed.map(item => ({...item})));
	const [entryModel] = useState(() => reactive({column: entries[0].key}));
	const [entryMethod, setEntryMethod] = useState<HxTableSortMethod>('asc');

	const labelOf = (key: HxTableSortCriteria[number]['key']): string => {
		const entry = entries.find(item => item.key === key);
		return I18NUtils.asText(entry?.text ?? key, context);
	};
	const dirty = comparable(draft) !== comparable(committed);

	const addSort = () => {
		const key = entryModel.column;
		setDraft(draft => {
			const index = draft.findIndex(item => item.key === key);
			if (index === -1) {
				return [...draft, {key, method: entryMethod}];
			}
			return draft.map((item, itemIndex) => itemIndex === index ? {...item, method: entryMethod} : item);
		});
	};
	const toggleDirection = (index: number) => {
		setDraft(draft => draft.map((item, itemIndex) => {
			if (itemIndex !== index) {
				return item;
			}
			return {...item, method: item.method === 'asc' ? 'desc' : 'asc'};
		}));
	};
	const removeSort = (index: number) => {
		setDraft(draft => draft.filter((_, itemIndex) => itemIndex !== index));
	};
	const reset = () => {
		setDraft(committed.map(item => ({...item})));
	};
	const apply = () => {
		if (!dirty) {
			return;
		}
		tableContext.sortChange(draft, (dataUpdated) => {
			if (dataUpdated) {
				popupContext.hide();
			}
		});
	};

	return <div data-hx-table-toolbar-panel="sort">
		<div data-hx-table-toolbar-panel-head><HxLabel text={sortKey}/></div>
		<div data-hx-table-toolbar-panel-entry>
			<HxSelect $model={entryModel} $field="column"
			          options={entries.map(entry => ({value: entry.key, label: I18NUtils.asText(entry.text, context)}))}
			          data-hx-table-toolbar-panel-column=""/>
			<div data-hx-table-toolbar-panel-segment="">
				<HxButton data-hx-table-toolbar-panel-segment-item="asc"
				          variant={entryMethod === 'asc' ? 'solid' : 'ghost'}
				          color={entryMethod === 'asc' ? 'primary' : 'waive'}
				          uppercase={false}
				          text={ascKey}
				          onClick={() => setEntryMethod('asc')}/>
				<HxButton data-hx-table-toolbar-panel-segment-item="desc"
				          variant={entryMethod === 'desc' ? 'solid' : 'ghost'}
				          color={entryMethod === 'desc' ? 'primary' : 'waive'}
				          uppercase={false}
				          text={descKey}
				          onClick={() => setEntryMethod('desc')}/>
			</div>
			<HxButton data-hx-table-toolbar-panel-add=""
			          variant="outline"
			          uppercase={false}
			          text={addKey}
			          onClick={addSort}/>
		</div>
		<div data-hx-table-toolbar-panel-list="">
			{draft.length === 0
				? <div data-hx-table-toolbar-panel-empty=""><HxLabel text={noSortKey}/></div>
				: draft.map((item, index) => {
					return <div data-hx-table-toolbar-panel-item=""
					            key={typeof item.key === 'string' ? item.key : index}>
						<span data-hx-table-toolbar-panel-order="">{index + 1}</span>
						<span data-hx-table-toolbar-panel-label="">{labelOf(item.key)}</span>
						<span data-hx-table-toolbar-panel-spacer=""/>
						<HxButton data-hx-table-toolbar-panel-direction=""
						          variant="outline"
						          uppercase={false}
						          text={item.method === 'asc' ? <TriangleUp/> : <TriangleDown/>}
						          onClick={() => toggleDirection(index)}/>
						<HxButton data-hx-table-toolbar-panel-remove=""
						          variant="ghost" color="waive"
						          uppercase={false}
						          text={<Close/>}
						          onClick={() => removeSort(index)}/>
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
