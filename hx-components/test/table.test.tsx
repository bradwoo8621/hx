import {reactive} from '@hx/data';
import {fireEvent, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {
	type HxObject,
	HxTable,
	type HxTableDataCriteria,
	type HxTableOnCriteriaChanged,
	type HxTableProps
} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

type Row = { name: string, age: number };
type PaginationState = { pageNumber: number, pageSize: number, totalPages: number, totalItems: number };
type TableModel = { rows: Array<Row>, pagination?: PaginationState };

const headers = [{title: 'Name'}, {title: 'Age'}];
const columns = (_model: unknown, _array: Array<Row>, row: Row) => [
	{content: row.name},
	{content: row.age}
];

const sortColumnsForPopup = [
	{key: 'name', text: 'Name', defaultMethod: 'asc' as const},
	{key: 'age', text: 'Age'}
];

const sortPopupOf = (): HTMLElement =>
	document.querySelector<HTMLElement>('[data-hx-popup-for-table-sort]')!;

const sortedRowsOf = (): Array<HTMLElement> =>
	[...document.querySelectorAll<HTMLElement>('[data-hx-popup-for-table-sort] [data-hx-table-sort-column]')];

const openSortPopup = async (container: HTMLElement) => {
	fireEvent.click(container.querySelector<HTMLElement>('[data-hx-table-toolbar-button="sort"]')!);
	await waitFor(() => expect(sortPopupOf()).not.toBeNull(), {timeout: 3000});
};

const pickSortOption = async (text: string) => {
	const select = sortPopupOf().querySelector<HTMLElement>('[data-hx-table-sort-more-column] [data-hx-select]')!;
	fireEvent.click(select);
	await waitFor(() => expect(document.querySelectorAll('[data-hx-select-option]').length).toBeGreaterThan(0));
	const option = [...document.querySelectorAll<HTMLElement>('[data-hx-select-option]')]
		.find(el => el.textContent?.trim() === text)!;
	fireEvent.click(option);
};

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
			<HxTable $model={model} $field="rows" headers={headers} columns={columns as never} $visible={false}
			         ref={ref}/>
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
			filterColumns: [{key: 'name', type: 'words', text: 'Name', defaultValue: 'Ada'}],
			onCriteriaChanged: async () => (void 0),
			// @ts-expect-error ignore check
			renderPrepare: (_model, criteria): Array<Row> => {
				let rows = [...(model.rows ?? [])];
				if (criteria.filter != null) {
					// words criteria are normalized to lowercase by readFilterWordsValue
					rows = rows.filter(row => criteria.filter!.every(item => `${row.name}`.toLowerCase() === `${item.value}`));
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
		expect(queryByDataAttr(container, 'data-hx-table-toolbar-criteria')).not.toBeNull();
		expect(queryByDataAttr(container, 'data-hx-table-toolbar-criteria-applied')).toBeNull();
	});

	it('renders no toolbar without sort, filter or fuzzy declarations', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}]});
		const {container} = renderTable(model, {
			onCriteriaChanged: async () => (void 0),
			// explicit 'none' must not render the toolbar either
			fuzzyFilter: 'none'
		});

		await waitFor(() => expect(container.querySelector('[data-hx-table-body-cell]')).not.toBeNull());
		expect(queryByDataAttr(container, 'data-hx-table-toolbar')).toBeNull();
	});

	it('flows sort changes into renderPrepare without a criteria handler', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}]});
		const {container} = renderTable(model, {
			sortColumns: sortColumnsForPopup,
			// @ts-expect-error ignore check
			renderPrepare: (_model, criteria): Array<Row> => {
				const rows = [...model.rows];
				if (criteria.sort != null) {
					const {key, method} = criteria.sort[0];
					rows.sort((left, right) => {
						const result = `${(left as unknown as Record<string, unknown>)[key]}`
							.localeCompare(`${(right as unknown as Record<string, unknown>)[key]}`);
						return method === 'asc' ? result : -result;
					});
				}
				return rows;
			}
		});

		await waitFor(() => expect(queryByDataAttr(container, 'data-hx-table-toolbar')).not.toBeNull());
		// the declared default method 'asc' on name reaches renderPrepare through the seeded criteria
		await waitFor(() => expect(container.querySelector<HTMLElement>('[data-hx-table-body-cell]')?.textContent).toBe('Ada'));

		await openSortPopup(container);
		fireEvent.click(sortedRowsOf()[0].querySelector<HTMLElement>('[data-hx-table-sort-column-button="desc"]')!);
		fireEvent.click(sortPopupOf().querySelector<HTMLElement>('[data-hx-table-sort-button="confirm"]')!);

		// no handler involved: the pipeline keeps the applied criteria and renderPrepare re-sorts
		await waitFor(() => expect(container.querySelector<HTMLElement>('[data-hx-table-body-cell]')?.textContent).toBe('Grace'));
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

	it('keeps footer-driven page flips without a criteria handler', async () => {
		const model = reactive<TableModel>({
			rows: [
				{name: 'Ada', age: 36}, {name: 'Aria', age: 27}, {name: 'Alice', age: 31},
				{name: 'Aaron', age: 24}, {name: 'Amber', age: 29}, {name: 'Austin', age: 33},
				{name: 'Alan', age: 22}, {name: 'Abel', age: 26}, {name: 'Alma', age: 30},
				{name: 'Anya', age: 28}, {name: 'Axel', age: 25}, {name: 'Amy', age: 32}
			],
			pagination: {pageNumber: 1, pageSize: 5, totalPages: 3, totalItems: 12}
		});
		const {container} = renderTable(model, {
			pagination: {$model: model, $field: 'pagination', allowedPageSizes: [5]}
		});
		await waitFor(() => expect(container.querySelector('[data-hx-pagination]')).not.toBeNull());

		fireEvent.click(container.querySelector<HTMLElement>('[data-hx-pagination-next-page]')!);
		await waitFor(() => expect(model.pagination?.pageNumber).toBe(2));

		// the mount-time criteria seed must not roll the flip back after the repaint settles
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(model.pagination?.pageNumber).toBe(2);
		expect(container.querySelector<HTMLElement>('[data-hx-table-body-cell]')?.textContent).toBe('Austin');
	});

	it('opens the sort popup with the declared default criteria', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}]});
		const {container} = renderTable(model, {
			sortColumns: sortColumnsForPopup,
			onCriteriaChanged: async () => (void 0)
		});

		await openSortPopup(container);
		const rows = sortedRowsOf();
		expect(rows).toHaveLength(1);
		expect(rows[0].textContent).toContain('Name');
		expect(rows[0].querySelector('[data-hx-table-sort-column-button="asc"][data-hx-active]')).not.toBeNull();
		expect(rows[0].querySelector('[data-hx-table-sort-column-button="desc"][data-hx-active]')).toBeNull();
	});

	it('adds a column from the select and moves it up', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}]});
		const {container} = renderTable(model, {
			sortColumns: sortColumnsForPopup,
			onCriteriaChanged: async () => (void 0)
		});

		await openSortPopup(container);
		const select = sortPopupOf().querySelector<HTMLElement>('[data-hx-table-sort-more-column] [data-hx-select]')!;
		fireEvent.click(select);
		await waitFor(() => expect(document.querySelectorAll('[data-hx-select-option]')).toHaveLength(1));
		const option = [...document.querySelectorAll<HTMLElement>('[data-hx-select-option]')]
			.find(el => el.textContent?.trim() === 'Age')!;
		fireEvent.click(option);

		await waitFor(() => expect(sortedRowsOf()).toHaveLength(2));
		expect(sortedRowsOf()[0].textContent).toContain('Name');

		fireEvent.click(sortedRowsOf()[1].querySelector<HTMLElement>('[data-hx-table-sort-column-button="up"]')!);
		await waitFor(() => expect(sortedRowsOf()[0].textContent).toContain('Age'));
		expect(sortedRowsOf()[1].textContent).toContain('Name');
	});

	it('removes a sorted column and re-adds it from the select', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}]});
		const {container} = renderTable(model, {
			sortColumns: sortColumnsForPopup,
			onCriteriaChanged: async () => (void 0)
		});

		await openSortPopup(container);
		fireEvent.click(sortedRowsOf()[0].querySelector<HTMLElement>('[data-hx-table-sort-column-button="clear"]')!);
		await waitFor(() => expect(sortedRowsOf()).toHaveLength(0));
		expect(sortPopupOf().querySelector('[data-hx-table-no-sort-column]')).not.toBeNull();

		const select = sortPopupOf().querySelector<HTMLElement>('[data-hx-table-sort-more-column] [data-hx-select]')!;
		fireEvent.click(select);
		await waitFor(() => expect(document.querySelectorAll('[data-hx-select-option]')).toHaveLength(2));
		const option = [...document.querySelectorAll<HTMLElement>('[data-hx-select-option]')]
			.find(el => el.textContent?.trim() === 'Name')!;
		fireEvent.click(option);

		await waitFor(() => expect(sortedRowsOf()).toHaveLength(1));
		expect(sortedRowsOf()[0].textContent).toContain('Name');
	});

	it('toggles the sort direction of a column', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}]});
		const {container} = renderTable(model, {
			sortColumns: sortColumnsForPopup,
			onCriteriaChanged: async () => (void 0)
		});

		await openSortPopup(container);
		fireEvent.click(sortedRowsOf()[0].querySelector<HTMLElement>('[data-hx-table-sort-column-button="desc"]')!);
		await waitFor(() =>
			expect(sortedRowsOf()[0].querySelector('[data-hx-table-sort-column-button="desc"][data-hx-active]')).not.toBeNull());
		expect(sortedRowsOf()[0].querySelector('[data-hx-table-sort-column-button="asc"][data-hx-active]')).toBeNull();
	});

	it('clears all columns through the popup clear button', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}]});
		const {container} = renderTable(model, {
			sortColumns: sortColumnsForPopup,
			onCriteriaChanged: async () => (void 0)
		});

		await openSortPopup(container);
		fireEvent.click(sortPopupOf().querySelector<HTMLElement>('[data-hx-table-sort-button="clear"]')!);
		await waitFor(() => expect(sortedRowsOf()).toHaveLength(0));
		expect(sortPopupOf().querySelector('[data-hx-table-no-sort-column]')).not.toBeNull();
	});

	it('applies the criteria on confirm and closes the popup', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}]});
		const onCriteriaChanged = vi.fn<HxTableOnCriteriaChanged<TableModel>>(async () => (void 0));
		const {container} = renderTable(model, {
			sortColumns: sortColumnsForPopup,
			onCriteriaChanged
		});

		await openSortPopup(container);
		await pickSortOption('Age');
		await waitFor(() => expect(sortedRowsOf()).toHaveLength(2));
		fireEvent.click(sortPopupOf().querySelector<HTMLElement>('[data-hx-table-sort-button="confirm"]')!);

		await waitFor(() =>
			expect(document.querySelector('[data-hx-popup-for-table-sort]')).toBeNull(), {timeout: 3000});
		await waitFor(() =>
			expect(container.querySelector('[data-hx-table-toolbar-criteria-applied]')).not.toBeNull());
		const calls = onCriteriaChanged.mock.calls;
		const sortChanges = calls.filter(call => call[1].type === 'sort-change');
		expect(sortChanges).toHaveLength(1);
		expect(sortChanges[0][1].sort).toEqual([{key: 'name', method: 'asc'}, {key: 'age', method: 'asc'}]);
	});

	it('closes the popup on cancel without applying criteria', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}]});
		const onCriteriaChanged = vi.fn<HxTableOnCriteriaChanged<TableModel>>(async () => (void 0));
		const {container} = renderTable(model, {
			sortColumns: sortColumnsForPopup,
			onCriteriaChanged
		});

		await openSortPopup(container);
		await pickSortOption('Age');
		await waitFor(() => expect(sortedRowsOf()).toHaveLength(2));
		fireEvent.click(sortPopupOf().querySelector<HTMLElement>('[data-hx-table-sort-button="cancel"]')!);

		await waitFor(() =>
			expect(document.querySelector('[data-hx-popup-for-table-sort]')).toBeNull(), {timeout: 3000});
		const calls = onCriteriaChanged.mock.calls;
		expect(calls.filter(call => call[1].type === 'sort-change')).toHaveLength(0);
	});

	it('syncs the criteria pagination fixed by renderPrepare back to the pagination model', async () => {
		const model = reactive<TableModel>({
			rows: [
				{name: 'Ada', age: 36}, {name: 'Aria', age: 27}, {name: 'Alice', age: 31},
				{name: 'Aaron', age: 24}, {name: 'Amber', age: 29}, {name: 'Austin', age: 33},
				{name: 'Alan', age: 22}, {name: 'Abel', age: 26}, {name: 'Alma', age: 30},
				{name: 'Anya', age: 28}, {name: 'Axel', age: 25}, {name: 'Amy', age: 32}
			],
			// stale state as if the whole (unfiltered) data set had 30 items
			pagination: {pageNumber: 5, pageSize: 5, totalPages: 6, totalItems: 30}
		});
		renderTable(model, {
			pagination: {$model: model, $field: 'pagination', allowedPageSizes: [5]},
			filterColumns: [{key: 'name', type: 'words', text: 'Name', defaultValue: ['a']}],
			onCriteriaChanged: async () => (void 0),
			// @ts-expect-error ignore check
			renderPrepare: (_model, criteria): Array<Row> => {
				const rows = criteria.filter != null
					? model.rows.filter(row => row.name.toLowerCase().includes('a'))
					: [...model.rows];
				if (criteria.pagination != null) {
					// fix the filtered totals by mutating the criteria pagination in place
					const pageSize = criteria.pagination.pageSize ?? 5;
					criteria.pagination.totalItems = rows.length;
					criteria.pagination.totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
					criteria.pagination.pageNumber = Math.min(criteria.pagination.pageNumber ?? 1, criteria.pagination.totalPages);
				}
				return rows;
			}
		});

		await waitFor(() => {
			expect(model.pagination?.pageNumber).toBe(3);
			expect(model.pagination?.totalItems).toBe(12);
			expect(model.pagination?.totalPages).toBe(3);
		});
	});

	it('syncs pagination corrections made in onCriteriaChanged without renderPrepare', async () => {
		const model = reactive<TableModel>({
			rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}],
			pagination: {pageNumber: 1, pageSize: 5, totalPages: 1, totalItems: 2}
		});
		const onCriteriaChanged: HxTableOnCriteriaChanged<TableModel> = async (_, data) => {
			// simulate a server response correcting the totals
			data.pagination!.totalPages = 2;
			data.pagination!.totalItems = 8;
		};
		const {container} = renderTable(model, {
			pagination: {$model: model, $field: 'pagination', allowedPageSizes: [5]},
			sortColumns: sortColumnsForPopup,
			onCriteriaChanged
		});

		await openSortPopup(container);
		fireEvent.click(sortPopupOf().querySelector<HTMLElement>('[data-hx-table-sort-button="confirm"]')!);

		await waitFor(() => {
			expect(model.pagination?.totalPages).toBe(2);
			expect(model.pagination?.totalItems).toBe(8);
		});
	});

	it('reconciles applied criteria when declaration props change', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}]});
		const criteriaChanges: Array<HxTableDataCriteria> = [];
		const onCriteriaChanged: HxTableOnCriteriaChanged<TableModel> = async (_, data) => {
			criteriaChanges.push(data);
		};
		const filterColumnsWithDefault = [
			{key: 'name', type: 'words' as const, text: 'Name', defaultValue: ['a']},
			{key: 'age', type: 'range' as const, text: 'Age'}
		];
		const filterColumnsWithoutName = [{key: 'age', type: 'range' as const, text: 'Age'}];

		const {rerender} = renderTable(model, {
			filterColumns: filterColumnsWithDefault,
			onCriteriaChanged
		});
		// the default filter is applied and shown as a badge
		await waitFor(() =>
			expect(document.querySelector('[data-hx-table-toolbar-applied-filter]')).not.toBeNull());

		rerender(<HxTable $model={model} $field="rows"
		                  headers={headers}
		                  columns={columns as never}
		                  filterColumns={filterColumnsWithoutName}
		                  onCriteriaChanged={onCriteriaChanged}/>);

		await waitFor(() => expect(criteriaChanges[criteriaChanges.length - 1]?.type).toBe('props-change'));
		expect(criteriaChanges[criteriaChanges.length - 1]?.filter).toBeUndefined();
		// the toolbar badge disappears after the reconciliation repaint
		await waitFor(() =>
			expect(document.querySelector('[data-hx-table-toolbar-applied-filter]')).toBeNull());
	});

	// filter popup and fuzzy filter coverage
	const filterPopupOf = (): HTMLElement =>
		document.querySelector<HTMLElement>('[data-hx-popup-for-table-filter]')!;

	const openFilterPopup = async (container: HTMLElement) => {
		fireEvent.click(container.querySelector<HTMLElement>('[data-hx-table-toolbar-button="filter"]')!);
		await waitFor(() => expect(filterPopupOf()).not.toBeNull(), {timeout: 3000});
	};

	const addFilterColumn = async (label: string) => {
		const select = filterPopupOf().querySelector<HTMLElement>('[data-hx-table-filter-more-column] [data-hx-select]')!;
		fireEvent.click(select);
		await waitFor(() => expect(document.querySelectorAll('[data-hx-select-option]').length).toBeGreaterThan(0));
		const option = [...document.querySelectorAll<HTMLElement>('[data-hx-select-option]')]
			.find(el => el.textContent?.trim() === label)!;
		fireEvent.click(option);
		// the column row is added on the next tick (see the timeout note in the popup)
		await waitFor(() => {
			const row = [...filterPopupOf().querySelectorAll<HTMLElement>('[data-hx-table-filter-column]')]
				.find(el => el.querySelector('[data-hx-table-filter-column-key]')?.textContent?.includes(label));
			expect(row).toBeTruthy();
		});
	};

	const pickFilterMethod = async (index: number) => {
		const method = filterPopupOf().querySelector<HTMLElement>('[data-hx-table-filter-column-method]')!;
		fireEvent.click(method);
		await waitFor(() => expect(document.querySelectorAll('[data-hx-select-option]').length).toBe(2));
		fireEvent.click(document.querySelectorAll<HTMLElement>('[data-hx-select-option]')[index]);
	};

	type FilterItem = NonNullable<HxTableDataCriteria['filter']>[number];
	const matchesFilterItem = (row: Row, item: FilterItem): boolean => {
		const value = item.value;
		const asArray = Array.isArray(value);
		const first = asArray ? value[0] : value;
		const second = asArray ? value[1] : undefined;
		const matches = item.key === 'age'
			? (first == null || Number(first) <= row.age) && (second == null || row.age <= Number(second))
			: `${row.name}`.toLowerCase().includes(`${first ?? ''}`.toLowerCase());
		return item.method === 'not-match' || item.method === 'not-between' ? !matches : matches;
	};
	const filterRows = (rows: Array<Row>, criteria: HxTableDataCriteria): Array<Row> => {
		let result = rows;
		if (criteria.filter != null && criteria.filter.length !== 0) {
			result = result.filter(row => criteria.filter!.every(item => matchesFilterItem(row, item)));
		}
		if (criteria.fuzzy != null && criteria.fuzzy !== '') {
			const fuzzyWords = Array.isArray(criteria.fuzzy) ? criteria.fuzzy : [criteria.fuzzy];
			result = result.filter(row => fuzzyWords.every(word => `${row.name}`.toLowerCase().includes(`${word}`.toLowerCase())));
		}
		return result;
	};
	const firstBodyCellOf = (container: HTMLElement): string | null | undefined =>
		container.querySelector<HTMLElement>('[data-hx-table-body-cell]')?.textContent;

	it('opens the filter popup with the declared default criteria', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}]});
		const {container} = renderTable(model, {
			filterColumns: [{key: 'name', type: 'words', text: 'Name', defaultValue: ['a']}],
			onCriteriaChanged: async () => (void 0)
		});

		await openFilterPopup(container);
		const rowsInPopup = [...filterPopupOf().querySelectorAll('[data-hx-table-filter-column]')];
		expect(rowsInPopup).toHaveLength(1);
		expect(rowsInPopup[0].querySelector('[data-hx-table-filter-column-key]')?.textContent).toContain('Name');
		// the seeded words value round-trips to its plain string form in the popup
		const input = filterPopupOf().querySelector<HTMLInputElement>('[data-hx-table-filter-column-value="words"] input')!;
		expect(input.value).toBe('a');
	});

	it('applies a words filter on confirm', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}, {name: 'Aria', age: 27}]});
		const onCriteriaChanged = vi.fn<HxTableOnCriteriaChanged<TableModel>>(async () => (void 0));
		const {container} = renderTable(model, {
			filterColumns: [{key: 'name', type: 'words', text: 'Name'}],
			onCriteriaChanged,
			// @ts-expect-error ignore check
			renderPrepare: (_model, criteria): Array<Row> => filterRows([...model.rows], criteria)
		});

		await openFilterPopup(container);
		await addFilterColumn('Name');
		fireEvent.change(filterPopupOf().querySelector<HTMLInputElement>('[data-hx-table-filter-column-value="words"] input')!,
			{target: {value: 'aria'}});
		fireEvent.click(filterPopupOf().querySelector<HTMLElement>('[data-hx-table-filter-button="confirm"]')!);

		await waitFor(() => {
			const calls = onCriteriaChanged.mock.calls.filter(call => call[1].type === 'filter-change');
			expect(calls).toHaveLength(1);
			expect(calls[0][1].filter).toEqual([{key: 'name', method: 'match', value: 'aria'}]);
		});
		await waitFor(() => expect(filterPopupOf()).toBeNull());
		await waitFor(() => expect(firstBodyCellOf(container)).toBe('Aria'));
	});

	it('switches the words method to not-match on confirm', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}, {name: 'Aria', age: 27}]});
		const onCriteriaChanged = vi.fn<HxTableOnCriteriaChanged<TableModel>>(async () => (void 0));
		const {container} = renderTable(model, {
			filterColumns: [{key: 'name', type: 'words', text: 'Name', defaultValue: ['ad']}],
			onCriteriaChanged,
			// @ts-expect-error ignore check
			renderPrepare: (_model, criteria): Array<Row> => filterRows([...model.rows], criteria)
		});

		await openFilterPopup(container);
		await pickFilterMethod(1);
		fireEvent.click(filterPopupOf().querySelector<HTMLElement>('[data-hx-table-filter-button="confirm"]')!);

		await waitFor(() => {
			const calls = onCriteriaChanged.mock.calls.filter(call => call[1].type === 'filter-change');
			expect(calls).toHaveLength(1);
			expect(calls[0][1].filter).toEqual([{key: 'name', method: 'not-match', value: 'ad'}]);
		});
		// not-match keeps the rows whose name does not contain "ad"
		await waitFor(() => expect(firstBodyCellOf(container)).toBe('Grace'));
	});

	it('applies a range between filter on confirm', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}, {name: 'Aria', age: 27}]});
		const onCriteriaChanged = vi.fn<HxTableOnCriteriaChanged<TableModel>>(async () => (void 0));
		const {container} = renderTable(model, {
			filterColumns: [{key: 'age', type: 'range', text: 'Age'}],
			onCriteriaChanged,
			// @ts-expect-error ignore check
			renderPrepare: (_model, criteria): Array<Row> => filterRows([...model.rows], criteria)
		});

		await openFilterPopup(container);
		await addFilterColumn('Age');
		fireEvent.change(filterPopupOf().querySelector<HTMLInputElement>('[data-hx-table-filter-column-value="range-start"] input')!,
			{target: {value: '27'}});
		fireEvent.change(filterPopupOf().querySelector<HTMLInputElement>('[data-hx-table-filter-column-value="range-end"] input')!,
			{target: {value: '36'}});
		fireEvent.click(filterPopupOf().querySelector<HTMLElement>('[data-hx-table-filter-button="confirm"]')!);

		await waitFor(() => {
			const calls = onCriteriaChanged.mock.calls.filter(call => call[1].type === 'filter-change');
			expect(calls).toHaveLength(1);
			expect(calls[0][1].filter).toEqual([{key: 'age', method: 'between', value: ['27', '36']}]);
		});
		// Ada (36) and Aria (27) fall in the range
		await waitFor(() => expect(firstBodyCellOf(container)).toBe('Ada'));
		await waitFor(() => expect(container.querySelectorAll('[data-hx-table-body-cell]')).toHaveLength(4));
	});

	it('drops an all-blank range filter on confirm', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}]});
		const onCriteriaChanged = vi.fn<HxTableOnCriteriaChanged<TableModel>>(async () => (void 0));
		const {container} = renderTable(model, {
			filterColumns: [{key: 'age', type: 'range', text: 'Age'}],
			onCriteriaChanged,
			// @ts-expect-error ignore check
			renderPrepare: (_model, criteria): Array<Row> => filterRows([...model.rows], criteria)
		});

		await openFilterPopup(container);
		await addFilterColumn('Age');
		// leave both range inputs blank
		fireEvent.click(filterPopupOf().querySelector<HTMLElement>('[data-hx-table-filter-button="confirm"]')!);

		await waitFor(() => {
			const calls = onCriteriaChanged.mock.calls.filter(call => call[1].type === 'filter-change');
			expect(calls).toHaveLength(1);
			expect(calls[0][1].filter).toEqual([]);
		});
		// nothing filtered: both rows render
		await waitFor(() => expect(container.querySelectorAll('[data-hx-table-body-cell]')).toHaveLength(4));
	});

	it('keeps the applied criteria when canceling the filter popup', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}]});
		const onCriteriaChanged = vi.fn<HxTableOnCriteriaChanged<TableModel>>(async () => (void 0));
		const {container} = renderTable(model, {
			filterColumns: [{key: 'name', type: 'words', text: 'Name', defaultValue: ['ad']}],
			onCriteriaChanged,
			// @ts-expect-error ignore check
			renderPrepare: (_model, criteria): Array<Row> => filterRows([...model.rows], criteria)
		});
		// the seeded default filters the body to Ada only
		await waitFor(() => expect(firstBodyCellOf(container)).toBe('Ada'));

		await openFilterPopup(container);
		fireEvent.change(filterPopupOf().querySelector<HTMLInputElement>('[data-hx-table-filter-column-value="words"] input')!,
			{target: {value: 'grace'}});
		fireEvent.click(filterPopupOf().querySelector<HTMLElement>('[data-hx-table-filter-button="cancel"]')!);

		await waitFor(() => expect(filterPopupOf()).toBeNull());
		expect(onCriteriaChanged.mock.calls.filter(call => call[1].type === 'filter-change')).toHaveLength(0);
		await waitFor(() => expect(firstBodyCellOf(container)).toBe('Ada'));
	});

	it('removes the applied filter through clear and confirm', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}]});
		const onCriteriaChanged = vi.fn<HxTableOnCriteriaChanged<TableModel>>(async () => (void 0));
		const {container} = renderTable(model, {
			filterColumns: [{key: 'name', type: 'words', text: 'Name', defaultValue: ['ad']}],
			onCriteriaChanged,
			// @ts-expect-error ignore check
			renderPrepare: (_model, criteria): Array<Row> => filterRows([...model.rows], criteria)
		});
		await waitFor(() => expect(firstBodyCellOf(container)).toBe('Ada'));

		await openFilterPopup(container);
		fireEvent.click(filterPopupOf().querySelector<HTMLElement>('[data-hx-table-filter-button="clear"]')!);
		fireEvent.click(filterPopupOf().querySelector<HTMLElement>('[data-hx-table-filter-button="confirm"]')!);

		await waitFor(() => {
			const calls = onCriteriaChanged.mock.calls.filter(call => call[1].type === 'filter-change');
			expect(calls).toHaveLength(1);
			expect(calls[0][1].filter).toEqual([]);
		});
		// both rows render again
		await waitFor(() => expect(container.querySelectorAll('[data-hx-table-body-cell]')).toHaveLength(4));
	});

	it('commits the fuzzy filter on enter', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}]});
		const onCriteriaChanged = vi.fn<HxTableOnCriteriaChanged<TableModel>>(async () => (void 0));
		const {container} = renderTable(model, {
			fuzzyFilter: 'enter',
			onCriteriaChanged,
			// @ts-expect-error ignore check
			renderPrepare: (_model, criteria): Array<Row> => filterRows([...model.rows], criteria)
		});

		const input = document.querySelector<HTMLInputElement>('input[data-hx-table-toolbar-fuzzy]')!;
		fireEvent.change(input, {target: {value: 'grace'}});
		fireEvent.keyDown(input, {key: 'Enter'});

		await waitFor(() => {
			const calls = onCriteriaChanged.mock.calls.filter(call => call[1].type === 'fuzzy-change');
			expect(calls).toHaveLength(1);
			expect(calls[0][1].fuzzy).toBe('grace');
		});
		await waitFor(() => expect(firstBodyCellOf(container)).toBe('Grace'));
	});

	it('commits the fuzzy filter on blur in enter+blur mode', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}]});
		const onCriteriaChanged = vi.fn<HxTableOnCriteriaChanged<TableModel>>(async () => (void 0));
		const {container} = renderTable(model, {
			fuzzyFilter: 'enter+blur',
			onCriteriaChanged,
			// @ts-expect-error ignore check
			renderPrepare: (_model, criteria): Array<Row> => filterRows([...model.rows], criteria)
		});

		const input = document.querySelector<HTMLInputElement>('input[data-hx-table-toolbar-fuzzy]')!;
		fireEvent.change(input, {target: {value: 'grace'}});
		fireEvent.blur(input);

		await waitFor(() => {
			const calls = onCriteriaChanged.mock.calls.filter(call => call[1].type === 'fuzzy-change');
			expect(calls).toHaveLength(1);
			expect(calls[0][1].fuzzy).toBe('grace');
		});
		await waitFor(() => expect(firstBodyCellOf(container)).toBe('Grace'));
	});

	it('debounces fuzzy commits in change mode', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}, {name: 'Grace', age: 40}]});
		const onCriteriaChanged = vi.fn<HxTableOnCriteriaChanged<TableModel>>(async () => (void 0));
		renderTable(model, {
			fuzzyFilter: 'change',
			onCriteriaChanged,
			// @ts-expect-error ignore check
			renderPrepare: (_model, criteria): Array<Row> => filterRows([...model.rows], criteria)
		});

		const input = document.querySelector<HTMLInputElement>('input[data-hx-table-toolbar-fuzzy]')!;
		fireEvent.change(input, {target: {value: 'gr'}});
		fireEvent.change(input, {target: {value: 'grace'}});

		await waitFor(() => {
			const calls = onCriteriaChanged.mock.calls.filter(call => call[1].type === 'fuzzy-change');
			expect(calls).toHaveLength(1);
			expect(calls[0][1].fuzzy).toBe('grace');
		});
	});

	it('renders no fuzzy input in none mode', async () => {
		const model = reactive<TableModel>({rows: [{name: 'Ada', age: 36}]});
		const {container} = renderTable(model, {
			sortColumns: [{key: 'name', text: 'Name'}],
			fuzzyFilter: 'none',
			onCriteriaChanged: async () => (void 0)
		});

		await waitFor(() => expect(queryByDataAttr(container, 'data-hx-table-toolbar')).not.toBeNull());
		expect(document.querySelector('input[data-hx-table-toolbar-fuzzy]')).toBeNull();
	});
});
