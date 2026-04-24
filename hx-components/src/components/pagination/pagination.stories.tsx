import type { Meta, StoryObj } from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import { ERO } from '@hx/data';
import { HxPagination } from './pagination';
import type { HxPaginationData } from './types';

const meta: Meta<typeof HxPagination> = {
	title: 'Components/Basic/Pagination',
	component: HxPagination,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		color: {
			control: 'select',
			options: ['primary', 'success', 'danger', 'warning', 'info', 'waive'],
			description: 'Button color theme',
			defaultValue: 'primary'
		},
		various: {
			control: 'select',
			options: ['solid', 'outline', 'ghost', 'dashed', 'text'],
			description: 'Button variant style',
			defaultValue: 'ghost'
		},
		showPageSize: {
			control: 'boolean',
			description: 'Whether to show page size selector even with only one option',
			defaultValue: false
		}
	}
};

export default meta;
type Story = StoryObj<typeof HxPagination>;

const defaultModel: HxPaginationData = {
	pageNumber: 1,
	pageSize: 20,
	totalPages: 10,
	totalItems: 200
};

/**
 * Default pagination with basic functionality
 */
export const Default: Story = {
	args: {
		$model: ERO.reactive(defaultModel)
	}
};

/**
 * Pagination with different color themes
 */
export const ColorVariants: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
			<HxPagination $model={ERO.reactive({ ...defaultModel, color: 'primary' })} color="primary" />
			<HxPagination $model={ERO.reactive({ ...defaultModel, color: 'success' })} color="success" />
			<HxPagination $model={ERO.reactive({ ...defaultModel, color: 'danger' })} color="danger" />
			<HxPagination $model={ERO.reactive({ ...defaultModel, color: 'warning' })} color="warn" />
		</div>
	)
};

/**
 * Pagination with different button variants
 */
export const ButtonVariants: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
			<HxPagination $model={ERO.reactive(defaultModel)} various="solid" />
			<HxPagination $model={ERO.reactive(defaultModel)} various="outline" />
			<HxPagination $model={ERO.reactive(defaultModel)} various="ghost" />
		</div>
	)
};

/**
 * Pagination with page size selector
 */
export const WithPageSizeSelector: Story = {
	args: {
		$model: ERO.reactive(defaultModel),
		allowedPageSizes: [10, 20, 50, 100]
	}
};

/**
 * Pagination that shows page size even with only one option
 */
export const ShowFixedPageSize: Story = {
	args: {
		$model: ERO.reactive(defaultModel),
		allowedPageSizes: [20],
		showPageSize: true
	}
};

/**
 * Pagination when there is only one page
 */
export const SinglePage: Story = {
	args: {
		$model: ERO.reactive({
			pageNumber: 1,
			pageSize: 20,
			totalPages: 1,
			totalItems: 15
		})
	}
};

/**
 * Pagination with large number of pages
 */
export const LargeDataset: Story = {
	args: {
		$model: ERO.reactive({
			pageNumber: 35,
			pageSize: 20,
			totalPages: 125,
			totalItems: 2493
		}),
		showPageSize: true,
		allowedPageSizes: [10, 20]
	}
};

/**
 * Pagination with custom format function for non-standard model structure
 */
export const CustomFormat: Story = {
	render: () => {
		const customModel = ERO.reactive({
			currentPage: 3,
			itemsPerPage: 50,
			totalCount: 500,
			totalPageCount: 10
		});

		return (
			<HxPagination
				$model={customModel}
				// @ts-expect-error ignore the type check
				format={(_$model: typeof customModel, value: typeof customModel) => ({
					pageNumber: value.currentPage,
					pageSize: value.itemsPerPage,
					totalPages: value.totalPageCount,
					totalItems: value.totalCount
				})}
			/>
		);
	}
};
