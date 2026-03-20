import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error React import is provided by the framework
import React from 'react';
import {HxInput} from '../input';
import {HxGrid} from './grid';

const meta = {
	title: 'Components/Layout/Grid',
	component: HxGrid,
	tags: ['autodocs'],
	argTypes: {
		$model: {
			name: 'Data Model',
			control: 'text',
			table: {disable: true}
		},
		$field: {
			name: 'Field name of Data Model',
			control: 'text',
			table: {disable: true}
		},
		columns: {
			control: 'select',
			options: [12, 15, 16],
			description: 'Number of columns in grid layout',
			defaultValue: 12
		},
		border: {
			control: 'boolean',
			description: 'Whether to show border around grid container',
			defaultValue: false
		},
		gapX: {
			control: 'select',
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			description: 'Horizontal gap between grid columns',
			defaultValue: 'md'
		},
		gapY: {
			control: 'select',
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			description: 'Vertical gap between grid rows',
			defaultValue: 'none'
		},
		$visible: {
			name: 'Visible',
			control: 'boolean'
		}
	}
} satisfies Meta<typeof HxGrid>;

export default meta;
type Story = StoryObj<typeof HxGrid>;

/**
 * Default 12-column grid layout with medium gap
 */
export const Default: Story = {
	args: {
		$model: ERO.reactive({}),
		columns: 12,
		gapX: 'md'
	},
	render: (args) => (
		<HxGrid {...args}>
			<div style={{padding: '8px 16px', background: '#f0f0f0'}} data-hx-grid-cols="6">Column 1 (6 cols)</div>
			<div style={{padding: '8px 16px', background: '#e0e0e0'}} data-hx-grid-cols="6">Column 2 (6 cols)</div>
			<div style={{padding: '8px 16px', background: '#d0d0d0'}} data-hx-grid-cols="4">Column 3 (4 cols)</div>
			<div style={{padding: '8px 16px', background: '#c0c0c0'}} data-hx-grid-cols="4">Column 4 (4 cols)</div>
			<div style={{padding: '8px 16px', background: '#b0b0b0'}} data-hx-grid-cols="4">Column 5 (4 cols)</div>
		</HxGrid>
	)
};

/**
 * 16-column grid layout
 */
export const Columns16: Story = {
	args: {
		$model: ERO.reactive({}),
		columns: 16,
		gapX: 'sm'
	},
	render: (args) => (
		<HxGrid {...args}>
			<div style={{padding: '8px 16px', background: '#f0f0f0'}} data-hx-grid-cols="4">Column 1 (4 cols)</div>
			<div style={{padding: '8px 16px', background: '#e0e0e0'}} data-hx-grid-cols="4">Column 2 (4 cols)</div>
			<div style={{padding: '8px 16px', background: '#d0d0d0'}} data-hx-grid-cols="4">Column 3 (4 cols)</div>
			<div style={{padding: '8px 16px', background: '#c0c0c0'}} data-hx-grid-cols="4">Column 4 (4 cols)</div>
			<div style={{padding: '8px 16px', background: '#b0b0b0'}} data-hx-grid-cols="16">Column 5 (16 cols)</div>
		</HxGrid>
	)
};

/**
 * Grid layout with border enabled
 */
export const WithBorder: Story = {
	args: {
		$model: ERO.reactive({}),
		columns: 12,
		gapX: 'md',
		border: true,
		paddingX: 'md',
		paddingT: 'md',
		paddingB: 'md'
	},
	render: (args) => (
		<HxGrid {...args}>
			<div style={{padding: '8px 16px', background: '#f0f0f0'}} data-hx-grid-cols="6">Column 1 (6 cols)</div>
			<div style={{padding: '8px 16px', background: '#e0e0e0'}} data-hx-grid-cols="6">Column 2 (6 cols)</div>
		</HxGrid>
	)
};

/**
 * Different gap size variations
 */
export const GapSizes: Story = {
	render: () => {
		const $model = ERO.reactive({});
		return <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
			<div>
				<h4 style={{margin: '0 0 8px 0'}}>Gap None (no gap)</h4>
				<HxGrid $model={$model} columns={12} gapX="none" border>
					<div style={{padding: '4px 8px', background: '#f0f0f0'}} data-hx-grid-cols="6">Item 1</div>
					<div style={{padding: '4px 8px', background: '#e0e0e0'}} data-hx-grid-cols="6">Item 2</div>
				</HxGrid>
			</div>

			<div>
				<h4 style={{margin: '0 0 8px 0'}}>Gap SM (small)</h4>
				<HxGrid $model={$model} columns={12} gapX="sm" border>
					<div style={{padding: '4px 8px', background: '#f0f0f0'}} data-hx-grid-cols="6">Item 1</div>
					<div style={{padding: '4px 8px', background: '#e0e0e0'}} data-hx-grid-cols="6">Item 2</div>
				</HxGrid>
			</div>

			<div>
				<h4 style={{margin: '0 0 8px 0'}}>Gap MD (medium - default)</h4>
				<HxGrid $model={$model} columns={12} gapX="md" border>
					<div style={{padding: '4px 8px', background: '#f0f0f0'}} data-hx-grid-cols="6">Item 1</div>
					<div style={{padding: '4px 8px', background: '#e0e0e0'}} data-hx-grid-cols="6">Item 2</div>
				</HxGrid>
			</div>

			<div>
				<h4 style={{margin: '0 0 8px 0'}}>Gap LG (large)</h4>
				<HxGrid $model={$model} columns={12} gapX="lg" border>
					<div style={{padding: '4px 8px', background: '#f0f0f0'}} data-hx-grid-cols="6">Item 1</div>
					<div style={{padding: '4px 8px', background: '#e0e0e0'}} data-hx-grid-cols="6">Item 2</div>
				</HxGrid>
			</div>
		</div>;
	},
	args: {}
};

/**
 * Grid layout with form elements
 */
export const FormLayout: Story = {
	render: () => {
		const $model = ERO.reactive({
			firstName: 'John',
			lastName: 'Doe',
			email: 'john.doe@gmail.com',
			phone: '123456',
			address: 'Somewhere',
			city: 'Some city',
			country: 'Some country'
		});

		return (
			<HxGrid $model={$model} columns={12} border={true} gapX="md" gapY="md"
			        paddingX="lg" paddingT="md" paddingB="md"
			        style={{width: '700px'}}>
				{/* @ts-expect-error $model passed by parent */}
				<HxInput $field="firstName" label="First Name" gCols="6"/>
				{/* @ts-expect-error $model passed by parent */}
				<HxInput $field="lastName" label="Last Name" gCols="6"/>
				{/* @ts-expect-error $model passed by parent */}
				<HxInput $field="email" label="Email" gCols="8"/>
				{/* @ts-expect-error $model passed by parent */}
				<HxInput $field="phone" label="Phone" gCols="4"/>
				{/* @ts-expect-error $model passed by parent */}
				<HxInput $field="address" label="Address" gCols="12"/>
				{/* @ts-expect-error $model passed by parent */}
				<HxInput $field="city" label="City" gCols="6"/>
				{/* @ts-expect-error $model passed by parent */}
				<HxInput $field="country" label="Country" gCols="6"/>
			</HxGrid>
		);
	}
};

/**
 * Nested grid layout example
 */
export const Nested: Story = {
	render: () => {
		const $model = ERO.reactive({});
		return <HxGrid $model={$model} columns={12} gapY="lg" paddingX="lg" paddingT="lg" paddingB="lg" border>
			<div style={{fontSize: '18px', fontWeight: 'bold'}} data-hx-grid-cols="12">Page Header</div>
			{/* @ts-expect-error $model passed by parent */}
			<HxGrid columns={12} gapX="lg" data-hx-grid-cols="12">
				{/* @ts-expect-error $model passed by parent */}
				<HxGrid columns={12} gapY="md" style={{background: '#f5f5f5', padding: '16px'}} gCols="8">
					<div style={{fontWeight: 'bold', marginBottom: '8px'}} data-hx-grid-cols="12">Main Content Area
					</div>
					<div style={{padding: '8px', background: '#fff'}} data-hx-grid-cols="6">Content 1</div>
					<div style={{padding: '8px', background: '#fff'}} data-hx-grid-cols="6">Content 2</div>
				</HxGrid>
				{/* @ts-expect-error $model passed by parent */}
				<HxGrid columns={12} gapY="md" style={{background: '#eaeaea', padding: '16px'}} gCols="4">
					<div style={{fontWeight: 'bold', marginBottom: '8px'}} data-hx-grid-cols="12">Sidebar</div>
					<div style={{padding: '8px', background: '#fff'}} data-hx-grid-cols="12">Widget 1</div>
					<div style={{padding: '8px', background: '#fff'}} data-hx-grid-cols="12">Widget 2</div>
					<div style={{padding: '8px', background: '#fff'}} data-hx-grid-cols="12">Widget 3</div>
				</HxGrid>
			</HxGrid>

			<div style={{padding: '8px', background: '#f0f0f0', textAlign: 'center'}} data-hx-grid-cols="12">
				Page Footer
			</div>
		</HxGrid>;
	}
};
