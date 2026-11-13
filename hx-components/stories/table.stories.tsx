import {ERO, type ReactiveRoot} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {Fragment, useEffect, useState} from 'react';
import {
	HxCheckbox,
	HxDiv,
	HxLabel,
	HxMRadio,
	type HxPaginationProps,
	HxTable,
	type HxTableColumnCells,
	type HxTableFilterColumnCriteria,
	type HxTableFilterColumns,
	type HxTableFilterWordsValue,
	type HxTableFuzzyCriteria,
	type HxTableHeaderCells,
	type HxTableNestedCell,
	type HxTableOnCriteriaChanged,
	type HxTablePaginationProps,
	type HxTableProps,
	type HxTableRtColumnCells,
	type HxTableSortColumnCriteria,
	useForceUpdate
} from '../src';

interface EmployeeModel {
	id: string;
	name: string;
	age: number;
	department: string;
	score: number;
}

type DataModel = ReactiveRoot & { employees?: Array<EmployeeModel> };
const employeeModel: DataModel = ERO.reactive({
	employees: [
		{id: 'ID-00001', name: 'John Doe', age: 32, department: 'Engineering', score: 88},
		{id: 'ID-00002', name: 'Jane Smith', age: 28, department: 'Design', score: 92},
		{id: 'ID-00003', name: 'Bob Johnson', age: 45, department: 'Engineering', score: 76},
		{id: 'ID-00004', name: 'Alice Williams', age: 35, department: 'Marketing', score: 85},
		{id: 'ID-00005', name: 'Charlie Brown', age: 29, department: 'Design', score: 91},
		{id: 'ID-00006', name: 'Diana Prince', age: 38, department: 'Engineering', score: 89},
		{id: 'ID-00007', name: 'Evan Wright', age: 41, department: 'Marketing', score: 73},
		{id: 'ID-00008', name: 'Fiona Green', age: 26, department: 'Design', score: 95}
	]
});
const emptyEmployeeModel: DataModel = ERO.reactive({employees: []});

const basicHeaders: HxTableHeaderCells = [
	{title: 'ID', width: 64},
	{title: 'Name', width: 160},
	{title: 'Age', width: 80},
	{title: 'Department', width: 160},
	{title: 'Score', width: 100}
];
const multiRowsHeaders: HxTableHeaderCells = [
	{title: 'ID', rows: 2, width: 64},
	{title: 'Person', cols: 3},
	{title: 'Name', row: 2, width: 160},
	{title: 'Age', row: 2, width: 80},
	{title: 'Department', row: 2, width: 160},
	{title: 'Score', rows: 2, width: 100}
];
const multiRowsHeadersForMultiRowsByColumns: HxTableHeaderCells = [
	{title: 'ID', rows: 3, width: 64},
	{title: 'Person', cols: 2},
	{title: 'Score', rows: 3, width: 100},
	{title: 'Name', row: 2, width: 160},
	{title: 'Department', row: 2, rows: 2, width: 160},
	{title: 'Age', row: 3}
];

const basicBodyColumns: HxTableColumnCells = [
	{content: <HxLabel $field="id"/>},
	{content: <HxLabel $field="name"/>},
	{content: <HxLabel $field="age"/>},
	{content: <HxLabel $field="department"/>},
	{content: <HxLabel $field="score"/>}
];
const multiRowsBodyColumns: HxTableColumnCells = [
	{content: <HxLabel $field="id"/>, rows: 2},
	{content: <HxLabel $field="name"/>},
	{content: <HxLabel $field="age"/>, row: 2},
	{content: <HxLabel $field="department"/>, rows: 2},
	{content: <HxLabel $field="score"/>, rows: 2}
];

const paginationModel = ERO.reactive({
	pagination: {
		pageSize: 5,
		pageNumber: 1,
		totalPages: Math.max(1, Math.ceil((employeeModel.employees?.length ?? 0) / 5)),
		totalItems: employeeModel.employees?.length ?? 0
	}
});

const sortAndFilterColumns: HxTableFilterColumns = [
	{
		key: 'id', type: 'select', text: 'ID',
		options: [
			{label: 'Odd', value: 1},
			{label: 'Even', value: 2}
		]
	},
	{key: 'name', type: 'words', text: 'Name'},
	{
		key: 'department', type: 'm-select', text: 'Department', defaultValue: ['Engineering'],
		options: [
			{label: 'Design', value: 'Design'},
			{label: 'Engineering', value: 'Engineering'},
			{label: 'Marketing', value: 'Marketing'}
		]
	},
	{key: 'age', type: 'range', text: 'Age'},
	{key: 'score', type: 'range', text: 'Score'}
];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pagination: HxTablePaginationProps<any> = {
	$model: paginationModel,
	$field: 'pagination',
	allowedPageSizes: [5, 10]
};

const rowValueOf = (row: EmployeeModel, key: string): unknown => {
	return (row as unknown as Record<string, unknown>)[key];
};
const criteriaValueOf = (row: EmployeeModel, key: string): unknown => {
	if (key === 'id') {
		// demo mapping: the ID column filter compares the odd/even parity of the id number
		return Number(row.id.slice(-1)) % 2 === 1 ? 1 : 2;
	}
	return rowValueOf(row, key);
};
const compareCriteriaValue = (left: unknown, right: unknown): number => {
	const leftNumber = Number(left);
	const rightNumber = Number(right);
	if (!isNaN(leftNumber) && !isNaN(rightNumber)) {
		return leftNumber - rightNumber;
	}
	return `${left}`.localeCompare(`${right}`);
};
const textOf = (value: unknown): string => {
	return value == null ? '' : `${value}`.trim().toLowerCase();
};
// words syntax matching: top-level entries are alternatives (or), nested arrays are and-groups,
// an empty string entry matches rows without a value, tokens match by case-insensitive containment
const matchesWordsValue = (cell: unknown, value: HxTableFilterWordsValue): boolean => {
	if (value == null) {
		// no value, no condition
		return true;
	}
	const cellText = textOf(cell);
	const matchesToken = (token: string): boolean => {
		return token === '' ? cellText === '' : cellText.includes(textOf(token));
	};
	if (Array.isArray(value)) {
		return value.some(item => {
			return Array.isArray(item) ? item.every(matchesToken) : matchesToken(item);
		});
	}
	return matchesToken(value);
};
// fuzzy matching: any field contains the tokens, same or/and/no-value shape as the words syntax
const matchesFuzzyValue = (row: EmployeeModel, value: HxTableFuzzyCriteria): boolean => {
	if (value == null) {
		// no value, no condition
		return true;
	}
	const fieldTexts = ['id', 'name', 'department']
		.map(key => textOf(rowValueOf(row, key)));
	const containsToken = (token: string): boolean => {
		return token === ''
			? fieldTexts.some(text => text === '')
			: fieldTexts.some(text => text.includes(token));
	};
	if (Array.isArray(value)) {
		return value.some(item => {
			return Array.isArray(item) ? item.every(containsToken) : containsToken(item);
		});
	}
	return containsToken(value);
};
const matchesCriteria = (row: EmployeeModel, criteria: HxTableFilterColumnCriteria): boolean => {
	const cell = criteriaValueOf(row, `${criteria.key}`);
	const value = criteria.value;
	const columnDef = sortAndFilterColumns.find(column => column.key === criteria.key);
	const wordsColumn = columnDef != null
		&& (columnDef.type === 'words'
			|| ((columnDef.type === 'select' || columnDef.type === 'm-select') && columnDef.options == null));
	if (wordsColumn) {
		// words columns: match by the words syntax, not by option equality
		const matches = matchesWordsValue(cell, value);
		return criteria.method === 'not-match' ? !matches : matches;
	}
	const equals = (candidate: unknown) => compareCriteriaValue(cell, candidate) === 0;
	switch (criteria.method) {
		case 'not-match':
			return Array.isArray(value) ? !value.some(equals) : !equals(value);
		case 'between': {
			if (!Array.isArray(value)) {
				return equals(value);
			}
			const aboveLower = value[0] == null || `${value[0]}`.trim() === '' || compareCriteriaValue(cell, value[0]) >= 0;
			const belowUpper = value[1] == null || `${value[1]}`.trim() === '' || compareCriteriaValue(cell, value[1]) <= 0;
			return aboveLower && belowUpper;
		}
		case 'not-between': {
			if (!Array.isArray(value)) {
				return !equals(value);
			}
			const belowLower = value[0] != null && `${value[0]}`.trim() !== '' && compareCriteriaValue(cell, value[0]) < 0;
			const aboveUpper = value[1] != null && `${value[1]}`.trim() !== '' && compareCriteriaValue(cell, value[1]) > 0;
			return belowLower || aboveUpper;
		}
		case 'match':
		default:
			return Array.isArray(value) ? value.some(equals) : equals(value);
	}
};
const compareCriteriaRows = (left: EmployeeModel, right: EmployeeModel, criteria: Array<HxTableSortColumnCriteria>): number => {
	for (const item of criteria) {
		const result = compareCriteriaValue(rowValueOf(left, `${item.key}`), rowValueOf(right, `${item.key}`));
		if (result !== 0) {
			return item.method === 'asc' ? result : -result;
		}
	}
	return 0;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onCriteriaChange: HxTableOnCriteriaChanged<any> = async (_, data) => {
	if (data.pagination!.pageSize === 5) {
		data.pagination!.totalPages = 2;
	} else {
		data.pagination!.pageNumber = 1;
		data.pagination!.totalPages = 1;
	}
};

const meta: Meta<HxTableProps<typeof employeeModel>> = {
	title: 'Components/Basic/Table',
	component: HxTable,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		border: {
			name: 'Show Border',
			description: 'Whether to draw the outer border of the table',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'true'}
			}
		},
		borderRadius: {
			name: 'Border Radius',
			description: 'Radius of the table outer corners',
			control: {
				type: 'select'
			},
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			table: {
				defaultValue: {summary: 'md'}
			}
		},
		columnGridLines: {
			name: 'Column Grid Lines',
			description: 'Whether to draw vertical grid lines between columns. Ignored when any header cell has a row or column span.',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		},
		rowIndex: {
			name: 'Row Index',
			description: 'Whether to show the row number column',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		},
		scrollHeight: {
			name: 'Vertical Scroll Height',
			description: 'Maximum height of the table header and body; a vertical scrollbar appears when the content exceeds it',
			control: {
				type: 'number'
			}
		}
	}
};

export default meta;
type Story = StoryObj<HxTableProps<typeof employeeModel>>;

/**
 * Basic table with a single-row header; the checkboxes toggle grid lines,
 * row index, body scrolling and the outer border, updating the table live
 */
export const Default: Story = {
	render: () => {
		const [flags] = useState(() => ERO.reactive({
			border: true,
			columnGridLines: false,
			rowGridLines: false,
			rowIndex: false,
			scrollableBody: false,
			ignoreHeaders: false,
			multiRowsHeaders: false,
			multiRowsBodyColumns: false,
			noData: false,
			pagination: false,
			paginationPosition: 'end'
		}));
		const forceUpdate = useForceUpdate();

		interface State {
			$model: DataModel;
			headers: HxTableHeaderCells;
			columns: HxTableColumnCells;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			pagination?: HxPaginationProps<any>;
		}

		const [state, setState] = useState<State>({
			$model: employeeModel,
			headers: basicHeaders, columns: basicBodyColumns
		});
		useEffect(() => {
			const renderFlags = ['border', 'columnGridLines', 'rowGridLines', 'rowIndex', 'scrollableBody', 'ignoreHeaders'];
			renderFlags.forEach(flag => ERO.on(flags, flag, forceUpdate));

			const onGridFlagChange = () => {
				if (flags.multiRowsBodyColumns) {
					flags.multiRowsHeaders = true;
				}
				setState(state => {
					return {
						...state,
						headers: flags.multiRowsBodyColumns
							? multiRowsHeadersForMultiRowsByColumns
							: (flags.multiRowsHeaders ? multiRowsHeaders : basicHeaders),
						columns: flags.multiRowsBodyColumns ? multiRowsBodyColumns : basicBodyColumns
					};
				});
			};
			const gridFlags = ['multiRowsHeaders', 'multiRowsBodyColumns'];
			gridFlags.forEach(flag => ERO.on(flags, flag, onGridFlagChange));

			const onDataFlagChange = () => {
				setState(state => {
					return {
						...state,
						$model: flags.noData ? emptyEmployeeModel : employeeModel
					};
				});
			};
			const dataFlags = ['noData'];
			dataFlags.forEach(flag => ERO.on(flags, flag, onDataFlagChange));

			const onPaginationFlagChange = () => {
				if (flags.pagination) {
					setState(state => {
						return {
							...state,
							pagination: {
								...(state.pagination ?? pagination),
								position: flags.paginationPosition
							}
						};
					});
				} else {
					setState(state => {
						const newState = {...state};
						delete newState.pagination;
						return newState;
					});
				}
			};
			const paginationFlags = ['pagination', 'paginationPosition'];
			paginationFlags.forEach(flag => ERO.on(flags, flag, onPaginationFlagChange));

			return () => {
				renderFlags.forEach(path => ERO.off(flags, path, forceUpdate));
				gridFlags.forEach(flag => ERO.off(flags, flag, onGridFlagChange));
				dataFlags.forEach(flag => ERO.off(flags, flag, onDataFlagChange));
				paginationFlags.forEach(flag => ERO.off(flags, flag, onPaginationFlagChange));
			};
		}, [flags, forceUpdate]);

		return (
			<div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
				<HxTable
					$model={state.$model}
					$field="employees"
					headers={state.headers}
					columns={state.columns}
					border={flags.border}
					columnGridLines={flags.columnGridLines}
					rowGridLines={flags.rowGridLines}
					rowIndex={flags.rowIndex}
					scrollHeight={flags.scrollableBody ? 240 : (void 0)}
					ignoreHeaders={flags.ignoreHeaders}
					pagination={state.pagination}
					onCriteriaChanged={state.pagination != null ? onCriteriaChange : (void 0)}
					// @ts-expect-error ignore check
					renderPrepare={() => state.$model.employees ?? []}
					style={{width: '800px'}}
				/>
				<div style={{display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px'}}>
					<HxLabel text="Table Rendering Options"/>
					<div style={{display: 'flex', gap: '4px'}}>
						<HxCheckbox $model={flags} $field="border" text="Border"/>
						<HxCheckbox $model={flags} $field="columnGridLines" text="Column Grid Lines"/>
						<HxCheckbox $model={flags} $field="rowGridLines" text="Row Grid Lines"/>
						<HxCheckbox $model={flags} $field="scrollableBody" text="Scrollable Body"
						/>
					</div>
					<HxLabel text="Table Layout Options"/>
					<HxLabel text="Multi-row toggles may flicker: layout is computed after the grid relayouts."
					         style={{
						         fontSize: 'var(--hx-font-size-xs)',
						         color: 'var(--hx-text-color-assistant)',
						         marginBlockStart: '-12px'
					         }}/>
					<div style={{display: 'flex', gap: '4px'}}>
						<HxCheckbox $model={flags} $field="ignoreHeaders" text="Ignore Header"/>
						<HxCheckbox $model={flags} $field="rowIndex" text="Row Index"/>
						<HxCheckbox $model={flags} $field="multiRowsBodyColumns" text="Multiple Rows Body Row"/>
						<HxCheckbox $model={flags} $field="multiRowsHeaders" text="Multiple Rows Header"
						            $disabled={flags.multiRowsBodyColumns}/>
					</div>
					<HxLabel text="Table Data Options"/>
					<div style={{display: 'flex', gap: '4px'}}>
						<HxCheckbox $model={flags} $field="noData" text="No Data"/>
					</div>
					<HxLabel text="Table Pagination Options"/>
					<div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
						<HxCheckbox $model={flags} $field="pagination" text="Pagination"/>
						<HxMRadio $model={flags} options={[
							{value: 'start', label: 'Start of Footer'},
							{value: 'end', label: 'End of Footer'}
						]} $field="paginationPosition" direction="dir-x" $disabled={!flags.pagination}/>
					</div>
				</div>
			</div>
		);
	}
};

const flexibleColumnsHeaders: HxTableHeaderCells = [
	{title: 'ID', width: 'minmax(40px, 48px)'},
	{title: 'Name', width: 150},
	{title: 'Age', width: 'fit-content(80px)'},
	{title: 'Department', width: '1fr'},
	{title: 'Score', width: 200}
];

/**
 * Columns with flexible / CSS-function widths: "1fr" takes the remaining space,
 * fit-content() clamps by content, minmax() is used as-is; the fixed-width columns
 * keep their px sizes exactly
 */
export const FlexibleColumns: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees"
				headers={flexibleColumnsHeaders}
				columns={basicBodyColumns}
				border={true}
				columnGridLines={true}
				rowGridLines={false}
				style={{width: '800px'}}
			/>
		</div>;
	}
};

const fixColumnsHeaders: HxTableHeaderCells = [
	{title: 'ID', width: 150},
	{title: 'Name', width: 200},
	{title: 'Age', width: 100},
	{title: 'Department', width: 200},
	{title: 'Score', width: 200}
];

export const RowIndex: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees"
				headers={fixColumnsHeaders}
				columns={basicBodyColumns}
				border={true}
				columnGridLines={true}
				rowGridLines={false}
				rowIndex={true}
				scrollHeight={240}
				style={{width: '800px'}}
			/>
		</div>;
	}
};

export const RowIndexAndNoData: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={emptyEmployeeModel}
				$field="employees"
				headers={fixColumnsHeaders}
				columns={basicBodyColumns}
				border={true}
				columnGridLines={true}
				rowGridLines={false}
				rowIndex={true}
				scrollHeight={240}
				style={{width: '800px'}}
			/>
		</div>;
	}
};

export const FixStart3Columns: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees"
				headers={fixColumnsHeaders}
				columns={basicBodyColumns}
				fixedStartColumns={3}
				border={true}
				columnGridLines={true}
				rowGridLines={false}
				rowIndex={true}
				style={{width: '800px'}}
			/>
		</div>;
	}
};

export const FixEnd2Columns: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees"
				headers={fixColumnsHeaders}
				columns={basicBodyColumns}
				fixedEndColumns={2}
				border={true}
				columnGridLines={true}
				rowGridLines={false}
				rowIndex={true}
				style={{width: '800px'}}
			/>
		</div>;
	}
};

export const FixStart2End2Columns: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees"
				headers={fixColumnsHeaders}
				columns={basicBodyColumns}
				fixedStartColumns={2}
				fixedEndColumns={2}
				border={true}
				columnGridLines={true}
				rowGridLines={false}
				rowIndex={true}
				style={{width: '800px'}}
			/>
		</div>;
	}
};

export const FixStart2End2ColumnsAndScrollable: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees"
				headers={fixColumnsHeaders}
				columns={basicBodyColumns}
				fixedStartColumns={2}
				fixedEndColumns={2}
				border={true}
				columnGridLines={true}
				rowGridLines={false}
				rowIndex={true}
				scrollHeight={240}
				style={{width: '800px'}}
			/>
		</div>;
	}
};

const fixColumnsMultiRowsHeaders: HxTableHeaderCells = [
	{title: 'ID', rows: 2, width: 150},
	{title: 'Person', cols: 3},
	{title: 'Name', row: 2, width: 200},
	{title: 'Age', row: 2, width: 100},
	{title: 'Department', row: 2, width: 200},
	{title: 'Score', rows: 2, width: 200}
];

export const FixStart2End2ColumnsAndScrollableOnMultipleRowsHeader: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees"
				headers={fixColumnsMultiRowsHeaders}
				columns={basicBodyColumns}
				fixedStartColumns={2}
				fixedEndColumns={2}
				border={true}
				columnGridLines={true}
				rowGridLines={false}
				rowIndex={true}
				scrollHeight={240}
				style={{width: '800px'}}
			/>
		</div>;
	}
};

const fixColumnsMultiRowsHeadersForMultiRowsByColumns: HxTableHeaderCells = [
	{title: 'ID', rows: 3, width: 150},
	{title: 'Person', cols: 2},
	{title: 'Score', rows: 3, width: 200},
	{title: 'Name', row: 2, width: 200},
	{title: 'Department', row: 2, rows: 2, width: 300},
	{title: 'Age', row: 3}
];

export const FixStart2End2ColumnsAndScrollableOnMultipleRowsHeaderAndBody: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees"
				headers={fixColumnsMultiRowsHeadersForMultiRowsByColumns}
				columns={multiRowsBodyColumns}
				fixedStartColumns={2}
				fixedEndColumns={1}
				border={true}
				columnGridLines={true}
				rowGridLines={false}
				rowIndex={true}
				scrollHeight={240}
				style={{width: '800px'}}
			/>
		</div>;
	}
};

const formHeaders: HxTableHeaderCells = [
	{title: '', width: '25%'},
	{title: '', width: '25%'},
	{title: '', width: '25%'},
	{title: '', width: '25%'}
];
const formBodyColumns: HxTableColumnCells = [
	{content: <HxLabel text="ID"/>},
	{content: <HxLabel $field="id"/>},
	{content: <Fragment/>, cols: 2},
	{content: <HxLabel text="Name"/>, row: 2},
	{content: <HxLabel $field="name"/>, row: 2},
	{content: <HxLabel text="Age"/>, row: 2},
	{content: <HxLabel $field="age"/>, row: 2},
	{content: <HxLabel text="Department"/>, row: 3},
	{content: <HxLabel $field="department"/>, cols: 3, row: 3},
	{content: <HxLabel text="Score"/>, row: 4},
	{content: <HxLabel $field="score"/>, cols: 3, row: 4}
];
const formPaginationModel = ERO.reactive({
	pagination: {
		pageSize: 1,
		pageNumber: 1,
		totalPages: employeeModel.employees?.length ?? 0,
		totalItems: employeeModel.employees?.length ?? 0
	}
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formPagination: HxTablePaginationProps<any> = {
	$model: formPaginationModel,
	$field: 'pagination',
	showPageSize: false,
	allowedPageSizes: [1]
};

export const RenderAsForm: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees.[0]"
				headers={formHeaders}
				columns={formBodyColumns}
				border={true}
				columnGridLines={true}
				rowGridLines={false}
				rowIndex={false}
				ignoreHeaders={true}
				renderAsForm={true}
				style={{width: '800px'}}
			/>
		</div>;
	}
};

export const RenderAsFormWithPagination: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees"
				headers={formHeaders}
				columns={formBodyColumns}
				border={true}
				columnGridLines={true}
				rowGridLines={false}
				rowIndex={false}
				ignoreHeaders={true}
				renderAsForm={true}
				pagination={formPagination}
				style={{width: '800px'}}
			/>
		</div>;
	}
};

const nestedBodyColumns: HxTableColumnCells = [
	{content: <HxLabel $field="id"/>},
	{content: <HxLabel $field="name"/>},
	{content: <HxLabel $field="age"/>},
	{content: <HxLabel $field="department"/>},
	{content: <HxLabel $field="score"/>},
	{
		nested: true,
		content: <HxDiv style={{padding: '8px 12px', display: 'flex', flexDirection: 'column', rowGap: '4px'}}>
			<HxLabel $field="id"/>
			<HxLabel $field="department"/>
			<HxLabel $field="score"/>
		</HxDiv>
	} as HxTableNestedCell
];

/**
 * Nested rows with the row index column: hovering a row index swaps the number
 */
export const NestedRows: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees"
				headers={fixColumnsHeaders}
				columns={nestedBodyColumns}
				border={true}
				columnGridLines={true}
				rowGridLines={true}
				rowIndex={true}
				style={{width: '800px'}}
			/>
		</div>;
	}
};

/**
 * Nested rows without the row index column: a narrow expand column is
 */
export const NestedRowsNoRowIndex: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees"
				headers={fixColumnsHeaders}
				columns={nestedBodyColumns}
				border={true}
				columnGridLines={true}
				rowGridLines={false}
				scrollHeight={600}
				style={{width: '800px'}}
			/>
		</div>;
	}
};

const groupRemarkStyle = {fontSize: 'var(--hx-font-size-xs)', color: 'var(--hx-text-color-assistant)'};
const scoreOf = (rowIndex: number): number => employeeModel.employees?.[rowIndex]?.score ?? 0;

/**
 * Standard group cells follow the table column grid (including the row index column),
 * like an ordinary extra row appended under a specific data row; full-line group cells
 * ignore columns and always grab the whole line
 */
export const GroupCells: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees"
				headers={fixColumnsHeaders}
				rowIndex={true}
				border={true}
				columnGridLines={true}
				rowGridLines={true}
				style={{width: '800px'}}
				columns={(_$model, _array, _row, rowIndex) => {
					const score = scoreOf(rowIndex);
					if (score < 80) {
						// low score: standard group cells following the column grid
						const cells: HxTableRtColumnCells = [...basicBodyColumns, [
							{content: <HxLabel text="Remark" style={groupRemarkStyle}/>, cols: 2},
							{
								content: <HxLabel text={`Low score (${score}), attention required`}
								                  style={groupRemarkStyle}/>, cols: 4
							}
						]];
						return cells;
					}
					if (score >= 90) {
						// high score: one full-line group cell grabbing all columns
						const cells: HxTableRtColumnCells = [...basicBodyColumns, [
							{
								fullLine: true,
								content: <HxLabel text={`Excellent score (${score})`} style={groupRemarkStyle}/>
							}
						]];
						return cells;
					}
					// mid score: no group row
					return basicBodyColumns;
				}}
			/>
		</div>;
	}
};

/**
 * Standard and full-line group cells mixed under the same data row:
 * grid cells occupy the first group line, full-line cells each take a whole
 * following line (row numbers restart at 1 within the group cells)
 */
export const GroupCellsMixed: Story = {
	render: () => {
		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees"
				headers={fixColumnsHeaders}
				rowIndex={true}
				border={true}
				columnGridLines={true}
				rowGridLines={true}
				style={{width: '800px'}}
				columns={(_$model, _array, _row, rowIndex) => {
					const score = scoreOf(rowIndex);
					if (score < 80) {
						const cells: HxTableRtColumnCells = [...basicBodyColumns, [
							{content: <HxLabel text="Remark" style={groupRemarkStyle}/>, cols: 2},
							{
								content: <HxLabel text={`Low score (${score}), attention required`}
								                  style={groupRemarkStyle}/>, cols: 4
							},
							{
								fullLine: true,
								row: 2,
								content: <HxLabel text="Follow-up plan will be created" style={groupRemarkStyle}/>
							}
						]];
						return cells;
					}
					if (score >= 90) {
						const cells: HxTableRtColumnCells = [...basicBodyColumns, [
							{content: <HxLabel text="Remark" style={groupRemarkStyle}/>, cols: 2},
							{content: <HxLabel text={`Excellent score (${score})`} style={groupRemarkStyle}/>, cols: 4},
							{
								fullLine: true,
								row: 2,
								content: <HxLabel text="Nominated as employee of the month" style={groupRemarkStyle}/>
							},
							{fullLine: true, row: 3, content: <HxLabel text="Bonus approved" style={groupRemarkStyle}/>}
						]];
						return cells;
					}
					return basicBodyColumns;
				}}
			/>
		</div>;
	}
};

const mixedNestedCell: HxTableNestedCell = {
	nested: true,
	content: <HxDiv style={{padding: '8px 12px', display: 'flex', flexDirection: 'column', rowGap: '4px'}}>
		<HxLabel $field="id"/>
		<HxLabel $field="department"/>
		<HxLabel $field="score"/>
	</HxDiv>
};

/**
 * All cell kinds in one table: every data row carries the nested cell,
 * low-score rows also append standard group cells plus a full-line group cell,
 * high-score rows append two full-line group cells; the checkboxes toggle the
 * row index column and the two nested-row hover options live
 */
export const AllCellsMixed: Story = {
	render: () => {
		const [flags] = useState(() => ERO.reactive({
			rowIndex: true,
			nestedRowHover: true,
			nestedRowIndependentHover: true
		}));
		const forceUpdate = useForceUpdate();
		useEffect(() => {
			const hoverFlags = ['rowIndex', 'nestedRowHover', 'nestedRowIndependentHover'];
			hoverFlags.forEach(flag => ERO.on(flags, flag, forceUpdate));
			return () => {
				hoverFlags.forEach(flag => ERO.off(flags, flag, forceUpdate));
			};
		}, [flags, forceUpdate]);

		return <div style={{display: 'flex', flexDirection: 'column', rowGap: '24px', alignItems: 'flex-start'}}>
			<HxTable
				$model={employeeModel}
				$field="employees"
				headers={fixColumnsHeaders}
				rowIndex={flags.rowIndex}
				nestedRow={true}
				nestedRowHover={flags.nestedRowHover}
				nestedRowIndependentHover={flags.nestedRowIndependentHover}
				border={true}
				columnGridLines={true}
				rowGridLines={true}
				style={{width: '800px'}}
				columns={(_$model, _array, _row, rowIndex) => {
					const score = scoreOf(rowIndex);
					if (score < 80) {
						// low score: nested cell + standard group cells + one full-line group cell
						const cells: HxTableRtColumnCells = [...basicBodyColumns, mixedNestedCell, [
							{content: <HxLabel text="Remark" style={groupRemarkStyle}/>, cols: 2},
							{
								content: <HxLabel text={`Low score (${score}), attention required`}
								                  style={groupRemarkStyle}/>, cols: 4
							},
							{
								fullLine: true,
								row: 2,
								content: <HxLabel text="Follow-up plan will be created" style={groupRemarkStyle}/>
							}
						]];
						return cells;
					}
					if (score >= 90) {
						// high score: nested cell + standard group cells + two full-line group cells
						const cells: HxTableRtColumnCells = [...basicBodyColumns, mixedNestedCell, [
							{content: <HxLabel text="Remark" style={groupRemarkStyle}/>, cols: 2},
							{content: <HxLabel text={`Excellent score (${score})`} style={groupRemarkStyle}/>, cols: 4},
							{
								fullLine: true,
								row: 2,
								content: <HxLabel text="Nominated as employee of the month" style={groupRemarkStyle}/>
							},
							{fullLine: true, row: 3, content: <HxLabel text="Bonus approved" style={groupRemarkStyle}/>}
						]];
						return cells;
					}
					// mid score: nested cell only
					return [...basicBodyColumns, mixedNestedCell];
				}}
			/>
			<div style={{display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px'}}>
				<HxLabel text="Table Options"/>
				<div style={{display: 'flex', gap: '4px'}}>
					<HxCheckbox $model={flags} $field="rowIndex" text="Row Index"/>
					<HxCheckbox $model={flags} $field="nestedRowHover" text="Nested Row Hover"/>
					<HxCheckbox $model={flags} $field="nestedRowIndependentHover" text="Nested Row Independent Hover"/>
				</div>
			</div>
		</div>;
	}
};

/**
 * Table toolbar scaffold and the sort/filter criteria pipeline. The declared
 * columns and the fuzzy flag feed the criteria pipeline, and renderPrepare
 * applies the criteria to the rows and fixes the filtered totals in place —
 * the table syncs them back to the pagination model, so the footer bar shows
 * the corrected page and totals after every filter/fuzzy change.
 */
export const SortAndFilter: Story = {
	render: () => {
		return <HxTable
			$model={employeeModel}
			$field="employees"
			headers={basicHeaders}
			columns={basicBodyColumns}
			border={true}
			columnGridLines={true}
			rowGridLines={true}
			style={{width: '800px'}}
			sortColumns={[
				{key: 'name', text: 'Name', defaultMethod: 'asc'},
				{key: 'age', text: 'Age', defaultMethod: 'desc'},
				{key: 'score', text: 'Score'}
			]}
			filterColumns={sortAndFilterColumns}
			fuzzyFilter="enter+blur"
			pagination={pagination}
			onCriteriaChanged={async () => (void 0)}
			// @ts-expect-error ignore check
			renderPrepare={(_$model, criteria) => {
				let rows = [...(employeeModel.employees ?? [])];
				if (criteria.fuzzy != null) {
					rows = rows.filter(row => matchesFuzzyValue(row, criteria.fuzzy));
				}
				if (criteria.filter != null) {
					rows = rows.filter(row => criteria.filter!.every(item => matchesCriteria(row, item)));
				}
				if (criteria.sort != null) {
					rows = rows.sort((left, right) => compareCriteriaRows(left, right, criteria.sort!));
				}
				if (criteria.pagination != null) {
					// fix the filtered totals by mutating the criteria pagination in place;
					// the table syncs them back to the pagination model after this returns
					const pageSize = criteria.pagination.pageSize ?? 5;
					criteria.pagination.totalItems = rows.length;
					criteria.pagination.totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
					criteria.pagination.pageNumber = Math.min(criteria.pagination.pageNumber ?? 1, criteria.pagination.totalPages);
				}
				return rows;
			}}/>;
	}
};
