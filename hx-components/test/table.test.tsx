import {reactive} from '@hx/data';
import {waitFor} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {HxTable, type HxObject, type HxTableProps} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

type Row = {name: string, age: number};
type TableModel = {rows: Array<Row>};

const headers = [{title: 'Name'}, {title: 'Age'}];
const columns = (_model: unknown, _array: Array<Row>, row: Row) => [
	{content: row.name},
	{content: row.age}
];

const renderTable = (
	model: HxObject<TableModel>,
	props: Partial<HxTableProps<TableModel>> = {}
) => {
	return renderWithProvider(
		<HxTable $model={model} $field="rows"
		         headers={headers}
		         columns={columns as never}
		         {...props}/>
	);
};

describe('HxTable', () => {
	it('renders headers and body cells for each row', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}]});
		const {container} = renderTable(model);
		expect(queryByDataAttr(container, 'data-hx-table')).not.toBeNull();

		await waitFor(() =>
			expect(container.querySelectorAll('[data-hx-table-body-cell]')).toHaveLength(4)
		);
		const headerCells = [...container.querySelectorAll('[data-hx-table-header-cell]')]
			.filter(el => el.textContent === 'Name' || el.textContent === 'Age');
		expect(headerCells).toHaveLength(2);
		const bodyText = queryByDataAttr(container, 'data-hx-table')!.textContent ?? '';
		expect(bodyText).toContain('Ada');
		expect(bodyText).toContain('36');
		expect(bodyText).toContain('Grace');
		expect(bodyText).toContain('40');
		expect(container.querySelectorAll('[data-hx-table-body-cell][data-hx-table-row-number="1"]')).toHaveLength(2);
		expect(container.querySelectorAll('[data-hx-table-body-cell][data-hx-table-row-number="2"]')).toHaveLength(2);
	});

	it('renders the no-data cell when the model array is empty', async () => {
		const model = reactive<TableModel>({rows: []});
		const {container} = renderTable(model, {noDataKey: 'Nothing here'});
		await waitFor(() =>
			expect(queryByDataAttr(container, 'data-hx-table-body-no-data-cell')).not.toBeNull()
		);
		expect(queryByDataAttr(container, 'data-hx-table-body-no-data-cell')!.textContent).toBe('Nothing here');
	});

	it('renders row index cells when rowIndex is enabled', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}]});
		const {container} = renderTable(model, {rowIndex: true});
		await waitFor(() =>
			expect(container.querySelectorAll('[data-hx-table-row-index-label]')).toHaveLength(2)
		);
		const indices = [...container.querySelectorAll('[data-hx-table-row-index-label]')].map(el => el.textContent);
		expect(indices).toEqual(['1', '2']);
	});

	it('applies stripe, grid line and border settings', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}]});
		const {container} = renderTable(model, {
			columnGridLines: true,
			rowGridLines: true,
			stripeRow: true
		});
		const table = queryByDataAttr(container, 'data-hx-table')!;
		expect(table.getAttribute('data-hx-border')).toBe('');
		expect(table.getAttribute('data-hx-border-radius')).toBe('md');
		await waitFor(() =>
			expect(container.querySelectorAll('[data-hx-table-body-cell]').length).toBeGreaterThan(0)
		);
		const cell = container.querySelector('[data-hx-table-body-cell]')!;
		expect(cell.hasAttribute('data-hx-table-cell-stripe-row')).toBe(true);
		expect(cell.hasAttribute('data-hx-table-cell-column-grid-line')).toBe(true);
	});

	it('renders as a form from a single object', async () => {
		const model = reactive({row: {name: 'Ada', age: 36}});
		const {container} = renderWithProvider(
			<HxTable $model={model} $field="row"
			         headers={headers}
			         columns={columns as never}
			         renderAsForm
			         ignoreHeaders/>
		);
		await waitFor(() =>
			expect(container.querySelectorAll('[data-hx-table-body-cell]')).toHaveLength(2)
		);
		const text = queryByDataAttr(container, 'data-hx-table')!.textContent ?? '';
		expect(text).toContain('Ada');
		expect(text).toContain('36');
	});

	it('supports static column declarations', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}]});
		const {container} = renderWithProvider(
			<HxTable $model={model} $field="rows"
			         headers={headers}
			         columns={[{content: 'static A'}, {content: 'static B'}]}/>
		);
		await waitFor(() =>
			expect(container.querySelectorAll('[data-hx-table-body-cell]')).toHaveLength(2)
		);
		expect(queryByDataAttr(container, 'data-hx-table')!.textContent).toContain('static A');
		expect(queryByDataAttr(container, 'data-hx-table')!.textContent).toContain('static B');
	});

	it('marks the hidden state and forwards the ref', async () => {
		const model = reactive<TableModel>({rows: []});
		const ref = {current: null as HTMLDivElement | null};
		const {container} = renderWithProvider(
			<HxTable $model={model} $field="rows" headers={headers} columns={columns as never} $visible={false} ref={ref}/>
		);
		await waitFor(() => expect(queryByDataAttr(container, 'data-hx-table')).not.toBeNull());
		expect(queryByDataAttr(container, 'data-hx-table')!.getAttribute('data-hx-visible')).toBe('no');
		expect(ref.current).not.toBeNull();
		expect(ref.current!.hasAttribute('data-hx-table')).toBe(true);
	});

	it('renders scrollable content when scrollHeight is set', () => {
		const model = reactive<TableModel>({rows: []});
		const {container} = renderTable(model, {scrollHeight: 200});
		expect(queryByDataAttr(container, 'data-hx-table-content')!.hasAttribute('data-hx-table-content-v-scroll')).toBe(true);
	});

	it('applies declared default criteria through renderPrepare', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}]});
		const {container} = renderTable(model, {
			sortColumns: [{key: 'name', text: 'Name', defaultMethod: 'asc'}],
			filterColumns: [{key: 'name', text: 'Name', defaultValue: 'Ada'}],
			onCriteriaChanged: async () => (void 0),
			renderPrepare: (_model, criteria) => {
				let rows = [...(model.rows ?? [])];
				if (criteria.filter != null) {
					rows = rows.filter(row => criteria.filter!.every(item => `${row.name}` === `${item.value}`));
				}
				return rows;
			}
		});

		await waitFor(() => expect(container.querySelectorAll('[data-hx-table-body-cell]')).toHaveLength(2));
	});

	it('renders the toolbar scaffold when sort columns are declared', async () => {
		const model = reactive<TableModel>({rows: []});
		const {container} = renderTable(model, {
			sortColumns: [{key: 'name', text: 'Name'}],
			onCriteriaChanged: async () => (void 0)
		});

		await waitFor(() => expect(queryByDataAttr(container, 'data-hx-table-toolbar')).not.toBeNull());
		expect(queryByDataAttr(container, 'data-hx-table-criteria-operate')).not.toBeNull();
		expect(queryByDataAttr(container, 'data-hx-table-criteria-display')).not.toBeNull();
	});

	it('renders pagination in the footer when a criteria handler is supplied', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}]});
		const {container} = renderTable(model, {
			onCriteriaChanged: async () => (void 0),
			pagination: {$model: model, showPageSize: true}
		});
		await waitFor(() =>
			expect(container.querySelector('[data-hx-table-footer]')).not.toBeNull()
		);
		expect(container.querySelector('[data-hx-pagination]')).not.toBeNull();
	});
});
