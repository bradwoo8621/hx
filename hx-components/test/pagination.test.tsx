import {reactive} from '@hx/data';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {HxPagination, type HxObject, type HxPaginationProps} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

type PaginationModel = {
	pageNumber: number;
	pageSize?: number;
	totalPages?: number;
	totalItems?: number;
};

const renderPagination = (
	model: HxObject<PaginationModel>,
	props: Partial<HxPaginationProps<PaginationModel>> = {}
) => {
	return renderWithProvider(<HxPagination $model={model} {...props}/>);
};

describe('HxPagination', () => {
	it('renders the page number, total pages, total items and page size', async () => {
		const model = reactive<PaginationModel>({pageNumber: 1, pageSize: 20, totalPages: 5, totalItems: 100});
		const {container} = renderPagination(model, {showPageSize: true});
		const root = queryByDataAttr(container, 'data-hx-pagination')!;
		expect(root).not.toBeNull();
		await waitFor(() =>
			expect(container.querySelector('[data-hx-label][data-hx-pagination-page-number]')!.textContent).toBe('1')
		);
		expect(container.querySelector('[data-hx-label][data-hx-pagination-total-pages]')!.textContent).toBe('5');
		expect(container.querySelector('[data-hx-pagination-total-items-value]')!.textContent).toBe('100');
		expect(container.querySelector('[data-hx-label][data-hx-pagination-page-size-value]')!.textContent).toBe('20');
		expect(container.textContent).toContain('HxCommon.OfTotalPages');
		expect(container.textContent).toContain('HxCommon.PerPage');
	});

	it('renders simple page labels when there is only one page', () => {
		const model = reactive<PaginationModel>({pageNumber: 1, pageSize: 20, totalPages: 1});
		const {container} = renderPagination(model);
		expect(container.querySelector('[data-hx-pagination-previous-page]')).toBeNull();
		expect(container.querySelector('[data-hx-pagination-next-page]')).toBeNull();
		expect(container.querySelector('[data-hx-label][data-hx-pagination-page-number]')!.textContent).toBe('1');
		expect(container.querySelector('[data-hx-label][data-hx-pagination-total-pages]')!.textContent).toBe('1');
	});

	it('moves to the next and previous page and writes back to the model', async () => {
		const model = reactive<PaginationModel>({pageNumber: 1, pageSize: 20, totalPages: 5});
		const {container} = renderPagination(model);
		const next = queryByDataAttr(container, 'data-hx-pagination-next-page')!;
		fireEvent.click(next);
		await waitFor(() => expect(model.pageNumber).toBe(2));

		const previous = queryByDataAttr(container, 'data-hx-pagination-previous-page')!;
		fireEvent.click(previous);
		await waitFor(() => expect(model.pageNumber).toBe(1));
	});

	it('disables the previous button on the first page', () => {
		const model = reactive<PaginationModel>({pageNumber: 1, pageSize: 20, totalPages: 5});
		const {container} = renderPagination(model);
		const previous = queryByDataAttr(container, 'data-hx-pagination-previous-page') as HTMLButtonElement;
		expect(previous.disabled).toBe(true);
	});

	it('hides the next button on the last page', () => {
		const model = reactive<PaginationModel>({pageNumber: 5, pageSize: 20, totalPages: 5});
		const {container} = renderPagination(model);
		expect(container.querySelector('[data-hx-pagination-next-page]')).toBeNull();
	});

	it('calls the change callbacks and onPageChanged', async () => {
		const model = reactive<PaginationModel>({pageNumber: 1, pageSize: 20, totalPages: 5});
		const onPageNumberChange = vi.fn(async (_model: unknown, _data: { pageNumber: number }) => (void 0));
		const onPageChanged = vi.fn(async () => (void 0));
		const {container} = renderPagination(model, {onPageNumberChange, onPageChanged});
		fireEvent.click(queryByDataAttr(container, 'data-hx-pagination-next-page')!);
		await waitFor(() => expect(onPageNumberChange).toHaveBeenCalledTimes(1));
		await waitFor(() => expect(onPageChanged).toHaveBeenCalledTimes(1));
		expect(onPageNumberChange.mock.calls[0][1].pageNumber).toBe(2);
	});

	it('rolls back the page number when the change callback rejects', async () => {
		const model = reactive<PaginationModel>({pageNumber: 1, pageSize: 20, totalPages: 5});
		const onPageNumberChange = vi.fn(async () => {
			throw new Error('failed');
		});
		const {container} = renderPagination(model, {onPageNumberChange});
		fireEvent.click(queryByDataAttr(container, 'data-hx-pagination-next-page')!);
		await waitFor(() => expect(onPageNumberChange).toHaveBeenCalledTimes(1));
		await waitFor(() =>
			expect(container.querySelector('[data-hx-label][data-hx-pagination-page-number]')!.textContent).toBe('1')
		);
		expect(model.pageNumber).toBe(1);
	});

	it('changes the page size through the page size select', async () => {
		const model = reactive<PaginationModel>({pageNumber: 1, pageSize: 20, totalPages: 5});
		const {container} = renderPagination(model, {allowedPageSizes: [20, 50]});
		const selects = container.querySelectorAll<HTMLElement>('[data-hx-select]');
		expect(selects).toHaveLength(2);
		const pageSizeSelect = selects[1];
		fireEvent.click(pageSizeSelect);
		const option50 = await screen.findByText('50');
		fireEvent.click(option50);
		await waitFor(() => expect(model.pageSize).toBe(50));
	});

	it('supports custom read and write functions', async () => {
		const model = reactive({current: 1, size: 20, pages: 5});
		const write = vi.fn();
		const {container} = renderWithProvider(
			<HxPagination $model={model}
			              read={(_, value) => ({
				              pageNumber: (value as {current: number}).current,
				              pageSize: (value as {size: number}).size,
				              totalPages: (value as {pages: number}).pages
			              })}
			              write={write}/>
		);
		await waitFor(() =>
			expect(container.querySelector('[data-hx-label][data-hx-pagination-page-number]')!.textContent).toBe('1')
		);
		fireEvent.click(queryByDataAttr(container, 'data-hx-pagination-next-page')!);
		await waitFor(() => expect(write).toHaveBeenCalledTimes(1));
		expect(write.mock.calls[0][1].pageNumber).toBe(2);
	});

	it('writes to a nested field when $field is given', async () => {
		const model = reactive({paging: {pageNumber: 1, pageSize: 20, totalPages: 5}});
		const {container} = renderWithProvider(<HxPagination $model={model} $field="paging"/>);
		fireEvent.click(queryByDataAttr(container, 'data-hx-pagination-next-page')!);
		await waitFor(() => expect(model.paging.pageNumber).toBe(2));
	});

	it('marks the loading position and spinner', () => {
		const model = reactive<PaginationModel>({pageNumber: 1, pageSize: 20, totalPages: 5});
		const {container} = renderPagination(model, {loading: 'end'});
		expect(queryByDataAttr(container, 'data-hx-pagination')!.getAttribute('data-hx-pagination-loading-position')).toBe('end');
		expect(queryByDataAttr(container, 'data-hx-pagination-loading')).not.toBeNull();
		expect(container.querySelector('[data-hx-pagination-loading] svg')).not.toBeNull();
	});

	it('forwards ref and marks the hidden state', () => {
		const model = reactive<PaginationModel>({pageNumber: 1, pageSize: 20, totalPages: 5});
		const ref = {current: null as HTMLDivElement | null};
		const {container} = renderWithProvider(<HxPagination $model={model} $visible={false} ref={ref}/>);
		const root = queryByDataAttr(container, 'data-hx-pagination')!;
		expect(root.getAttribute('data-hx-visible')).toBe('no');
		expect(ref.current).not.toBeNull();
		expect(ref.current!.hasAttribute('data-hx-pagination')).toBe(true);
	});
});
