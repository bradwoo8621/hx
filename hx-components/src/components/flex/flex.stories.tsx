import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-ignore
import React from 'react';
import {HxInput} from '../input';
import {HxFlex} from './flex';

const meta = {
	title: 'Components/Layout/Flex',
	component: HxFlex,
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
		direction: {
			control: 'select',
			options: ['dir-x', 'dir-y'],
			description: 'Flex container direction',
			defaultValue: 'dir-x'
		},
		border: {
			control: 'boolean',
			description: 'Whether to show border around flex container',
			defaultValue: false
		},
		gapX: {
			control: 'select',
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			description: 'Horizontal gap between flex items',
			defaultValue: 'md'
		},
		gapY: {
			control: 'select',
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			description: 'Vertical gap between flex items',
			defaultValue: 'md'
		},
		$visible: {
			name: 'Visible',
			control: 'boolean'
		}
	}
} satisfies Meta<typeof HxFlex>;

export default meta;
type Story = StoryObj<typeof HxFlex>;

/**
 * Default horizontal flex layout with medium gap
 */
export const Default: Story = {
	args: {
		$model: ERO.reactive({}),
		direction: 'dir-x',
		gapX: 'md'
	},
	render: (args) => (
		<HxFlex {...args}>
			<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 1</div>
			<div style={{padding: '8px 16px', background: '#e0e0e0'}}>Item 2</div>
			<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 3</div>
		</HxFlex>
	)
};

/**
 * Vertical flex layout with medium gap
 */
export const Vertical: Story = {
	args: {
		$model: ERO.reactive({}),
		direction: 'dir-y',
		gapY: 'md'
	},
	render: (args) => (
		<HxFlex {...args}>
			<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 1</div>
			<div style={{padding: '8px 16px', background: '#e0e0e0'}}>Item 2</div>
			<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 3</div>
		</HxFlex>
	)
};

/**
 * Flex layout with border enabled
 */
export const WithBorder: Story = {
	args: {
		$model: ERO.reactive({}),
		direction: 'dir-x',
		gapX: 'md',
		border: true
	},
	render: (args) => (
		<HxFlex {...args}>
			<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 1</div>
			<div style={{padding: '8px 16px', background: '#e0e0e0'}}>Item 2</div>
			<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 3</div>
		</HxFlex>
	)
};

/**
 * Different gap size variations
 */
export const GapSizes: Story = {
	render: () => {
		const $model = ERO.reactive({});
		return <HxFlex $model={$model} direction="dir-y" gapY="lg">
			<div>
				<h4 style={{margin: '0 0 8px 0'}}>Gap None (no gap)</h4>
				<HxFlex $model={$model} direction="dir-x" gapX="none" border>
					<div style={{padding: '4px 8px', background: '#f0f0f0'}}>Item 1</div>
					<div style={{padding: '4px 8px', background: '#e0e0e0'}}>Item 2</div>
				</HxFlex>
			</div>

			<div>
				<h4 style={{margin: '0 0 8px 0'}}>Gap SM (small)</h4>
				<HxFlex $model={$model} direction="dir-x" gapX="sm" border>
					<div style={{padding: '4px 8px', background: '#f0f0f0'}}>Item 1</div>
					<div style={{padding: '4px 8px', background: '#e0e0e0'}}>Item 2</div>
				</HxFlex>
			</div>

			<div>
				<h4 style={{margin: '0 0 8px 0'}}>Gap MD (medium - default)</h4>
				<HxFlex $model={$model} direction="dir-x" gapX="md" border>
					<div style={{padding: '4px 8px', background: '#f0f0f0'}}>Item 1</div>
					<div style={{padding: '4px 8px', background: '#e0e0e0'}}>Item 2</div>
				</HxFlex>
			</div>

			<div>
				<h4 style={{margin: '0 0 8px 0'}}>Gap LG (large)</h4>
				<HxFlex $model={$model} direction="dir-x" gapX="lg" border>
					<div style={{padding: '4px 8px', background: '#f0f0f0'}}>Item 1</div>
					<div style={{padding: '4px 8px', background: '#e0e0e0'}}>Item 2</div>
				</HxFlex>
			</div>
		</HxFlex>;
	},
	args: {}
};

/**
 * Flex layout with form elements
 */
export const FormLayout: Story = {
	render: () => {
		const $model = ERO.reactive({
			firstName: '',
			lastName: '',
			email: ''
		});

		return (
			<HxFlex $model={$model} direction="dir-y" gapY="md" style={{width: '400px'}}>
				<HxFlex $model={$model} direction="dir-x" gapX="md">
					<HxFlex $model={$model} direction="dir-y" gapY="none" style={{flex: 1}}>
						<label>First Name</label>
						<HxInput $model={$model} $field="firstName"/>
					</HxFlex>
					<HxFlex $model={$model} direction="dir-y" gapY="none" style={{flex: 1}}>
						<label>Last Name</label>
						<HxInput $model={$model} $field="lastName"/>
					</HxFlex>
				</HxFlex>

				<HxFlex $model={$model} direction="dir-y" gapY="none">
					<label>Email</label>
					<HxInput $model={$model} $field="email" type="text"/>
				</HxFlex>
			</HxFlex>
		);
	}
};

/**
 * Nested flex layout example
 */
export const Nested: Story = {
	render: () => {
		const $model = ERO.reactive({});
		return <HxFlex $model={$model} direction="dir-y" gapY="lg" border style={{padding: '16px'}}>
			<div style={{fontSize: '18px', fontWeight: 'bold'}}>Page Header</div>

			<HxFlex $model={$model} direction="dir-x" gapX="lg">
				<HxFlex $model={$model} direction="dir-y" gapY="md" style={{flex: 2}}>
					<div style={{padding: '16px', background: '#f5f5f5'}}>Main Content Area</div>
					<div style={{padding: '16px', background: '#f5f5f5'}}>Additional Content</div>
				</HxFlex>

				<HxFlex $model={$model} direction="dir-y" gapY="md" style={{flex: 1}}>
					<div style={{padding: '16px', background: '#eaeaea'}}>Sidebar Widget 1</div>
					<div style={{padding: '16px', background: '#eaeaea'}}>Sidebar Widget 2</div>
					<div style={{padding: '16px', background: '#eaeaea'}}>Sidebar Widget 3</div>
				</HxFlex>
			</HxFlex>

			<div style={{padding: '8px', background: '#f0f0f0', textAlign: 'center'}}>Page Footer</div>
		</HxFlex>;
	}
};
