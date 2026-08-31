import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {HxTable, type HxTableColumns, type HxTableHeaderCell, type HxTableProps} from '../src';

const employeeModel = ERO.reactive({
	employees: [
		{id: 1, name: 'John Doe', age: 32, department: 'Engineering', score: 88},
		{id: 2, name: 'Jane Smith', age: 28, department: 'Design', score: 92},
		{id: 3, name: 'Bob Johnson', age: 45, department: 'Engineering', score: 76},
		{id: 4, name: 'Alice Williams', age: 35, department: 'Marketing', score: 85},
		{id: 5, name: 'Charlie Brown', age: 29, department: 'Design', score: 91},
		{id: 6, name: 'Diana Prince', age: 38, department: 'Engineering', score: 89},
		{id: 7, name: 'Evan Wright', age: 41, department: 'Marketing', score: 73},
		{id: 8, name: 'Fiona Green', age: 26, department: 'Design', score: 95}
	]
});

const basicHeaders: HxTableHeaderCell[] = [
	{title: 'ID', width: 64},
	{title: 'Name', width: 160},
	{title: 'Age', width: 80},
	{title: 'Department', width: 160},
	{title: 'Score', width: 100}
];

const basicColumns: HxTableColumns = [
	{mark: 'id', content: 'ID'},
	{mark: 'name', content: 'Name'},
	{mark: 'age', content: 'Age'},
	{mark: 'department', content: 'Department'},
	{mark: 'score', content: 'Score'}
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
 * Basic table with a single-row header
 */
export const Default: Story = {
	args: {
		$model: employeeModel,
		$field: 'employees',
		headers: basicHeaders,
		columns: basicColumns
	}
};

/**
 * Multi-row header where group cells merge across rows (`rows`) or columns (`cols`).
 * Header cells are laid out row by row, from top-left to bottom-right,
 * and the sum of merged cells in each row must fill the full column count.
 */
export const MultiRowHeader: Story = {
	args: {
		$model: employeeModel,
		$field: 'employees',
		headers: [
			{title: 'ID', rows: 2, width: 64},
			{title: 'Person', cols: 3, tipTitle: 'Person', tipContent: 'Grouped personal information'},
			{title: 'Score', rows: 2, width: 100},
			{title: 'Name'},
			{title: 'Age'},
			{title: 'Department'}
		],
		columns: basicColumns
	}
};

/**
 * Vertical grid lines between columns
 */
export const ColumnGridLines: Story = {
	args: {
		...Default.args,
		columnGridLines: true
	}
};

/**
 * Leading row number column
 */
export const RowIndex: Story = {
	args: {
		...Default.args,
		rowIndex: true
	}
};

/**
 * Table body with a maximum height and vertical scrolling
 */
export const ScrollableBody: Story = {
	args: {
		...Default.args,
		maxBodyHeight: 240
	}
};

/**
 * Table without the outer border
 */
export const Borderless: Story = {
	args: {
		...Default.args,
		border: false
	}
};
