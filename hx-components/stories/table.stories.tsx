import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {useEffect, useState} from 'react';
import {
	HxCheckbox,
	HxLabel,
	HxTable,
	type HxTableColumnCells,
	type HxTableHeaderCells,
	type HxTableProps,
	useForceUpdate
} from '../src';

const employeeModel = ERO.reactive({
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

const emptyEmployeeModel = ERO.reactive({
	employees: [] as Array<(typeof employeeModel.employees)[number]>
});

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
	{title: 'Age', row: 3, width: 80}
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
		maxBodyHeight: {
			name: 'Max Body Height',
			description: 'Maximum height of the table body; a vertical scrollbar appears when the content exceeds it',
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
			noData: false
		}));
		const forceUpdate = useForceUpdate();
		const [state, setState] = useState({
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

			return () => {
				renderFlags.forEach(path => ERO.off(flags, path, forceUpdate));
				gridFlags.forEach(flag => ERO.off(flags, flag, onGridFlagChange));
				dataFlags.forEach(flag => ERO.off(flags, flag, onDataFlagChange));
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
					maxBodyHeight={flags.scrollableBody ? 240 : (void 0)}
					ignoreHeaders={flags.ignoreHeaders}
					style={{width: '800px'}}
				/>
				<div style={{display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px'}}>
					<HxLabel text="Table Rendering Options"/>
					<div style={{display: 'flex', gap: '4px'}}>
						<HxCheckbox $model={flags} $field="border" text="Border"/>
						<HxCheckbox $model={flags} $field="columnGridLines" text="Column Grid Lines"/>
						<HxCheckbox $model={flags} $field="rowGridLines" text="Row Grid Lines"/>
						<HxCheckbox $model={flags} $field="scrollableBody" text="Scrollable Body"/>
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
				</div>
			</div>
		);
	}
};
