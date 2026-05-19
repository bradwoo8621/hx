import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxPagination, type HxPaginationData} from '../src';

const meta: Meta<typeof HxPagination> = {
	title: 'Components/Basic/Pagination',
	component: HxPagination,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
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
			totalCount: 1500,
			totalPageCount: 15
		});

		return (
			<HxPagination
				$model={customModel}
				// @ts-expect-error ignore the type check
				read={(_$model: typeof customModel, value: typeof customModel) => ({
					pageNumber: value.currentPage,
					pageSize: value.itemsPerPage,
					totalPages: value.totalPageCount,
					totalItems: value.totalCount
				})}
				onPageNumberChange={(...args) => {
					console.log(args[2]);
				}}
				onPageSizeChange={(...args) => {
					console.log(args[2]);
				}}
			/>
		);
	}
};
