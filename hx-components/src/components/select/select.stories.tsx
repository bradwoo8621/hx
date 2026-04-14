/**
 * Storybook documentation and examples for the HxSelect component
 * Demonstrates all available features and usage patterns
 */
import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {useState} from 'react';
import {HxInput} from '../input';
import {HxSelect} from './select';

const meta: Meta<typeof HxSelect> = {
	title: 'Components/Basic/Select',
	component: HxSelect,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
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
		options: {
			name: 'Options',
			description: 'Select options array or function that returns options',
			control: 'object'
		},
		$visible: {
			name: 'Visible',
			control: 'boolean'
		},
		$disabled: {
			name: 'Disabled',
			control: 'boolean'
		}
	}
};

export default meta;

/** Story type definition for HxSelect component */
type Story = StoryObj<typeof HxSelect>;

/**
 * Default select component example with static options
 * Shows basic single selection functionality with clear button
 */
export const Default: Story = {
	args: {
		$model: ERO.reactive({fruit: 'apple'}),
		// @ts-expect-error ignore the field type check
		$field: 'fruit',
		clearable: true,
		options: [
			{value: 'apple', label: 'Apple'},
			{value: 'banana', label: 'Banana'},
			{value: 'orange', label: 'Orange'},
			{value: 'grape', label: 'Grape'}
		]
	}
};

/**
 * Select component example with dynamic function options
 * Demonstrates custom popup dimensions, enter key support, and scroll boundary detection
 * Uses nested scroll containers to test automatic popup positioning
 */
export const WithFunctionOptions: Story = {
	args: {
		// @ts-expect-error ignore the field type check
		$field: 'number',
		clearable: true,
		minPopupWidth: 400,
		maxPopupHeight: 200,
		enterToOpenPopup: true,
		options: () => [
			{value: 1, label: 'One'},
			{value: 2, label: 'Two'},
			{value: 3, label: 'Three'},
			{value: 4, label: 'Four'},
			{value: 5, label: 'Five'},
			{value: 6, label: 'Six'},
			{value: 7, label: 'Seven'},
			{value: 8, label: 'Eight'}
		]
	},
	render: (args) => {
		const [$model] = useState(ERO.reactive({number: (void 0)}));

		return <div style={{
			margin: '600px 1200px',
			height: '400px',
			width: '600px',
			overflow: 'scroll',
			border: '1px solid red'
		}}>
			<div style={{
				margin: '350px 550px',
				height: '200px',
				width: '300px',
				overflow: 'scroll',
				border: '1px solid blue'
			}}>
				<HxSelect {...args} $model={$model} style={{minWidth: '200px', margin: '150px 250px'}}/>
			</div>
		</div>;
	}
};

/**
 * Select component with async options loading
 * Demonstrates loading state behavior with async option sources
 */
export const AsyncOptions: Story = {
	args: {
		// @ts-expect-error ignore the field type check
		$field: 'user',
		clearable: true,
		placeholderKey: 'Select a user',
		options: async () => {
			// Simulate API request delay
			await new Promise(resolve => setTimeout(resolve, 1500));
			return [
				{value: 1, label: 'John Doe'},
				{value: 2, label: 'Jane Smith'},
				{value: 3, label: 'Bob Johnson'},
				{value: 4, label: 'Alice Williams'}
			];
		}
	},
	render: (args) => {
		const [$model] = useState(ERO.reactive({user: (void 0)}));
		return <HxSelect {...args} $model={$model} style={{minWidth: '300px'}}/>;
	}
};

/**
 * Disabled select component example
 * Shows the disabled state with pre-selected value
 */
export const Disabled: Story = {
	args: {
		$model: ERO.reactive({status: 'active'}),
		// @ts-expect-error ignore the field type check
		$field: 'status',
		clearable: true,
		$disabled: true,
		options: [
			{value: 'active', label: 'Active'},
			{value: 'inactive', label: 'Inactive'},
			{value: 'pending', label: 'Pending'}
		]
	}
};

/**
 * Non-clearable select component example
 * Shows select without clear button (user cannot deselect once an option is chosen)
 */
export const NonClearable: Story = {
	args: {
		$model: ERO.reactive({role: 'user'}),
		// @ts-expect-error ignore the field type check
		$field: 'role',
		clearable: false,
		options: [
			{value: 'admin', label: 'Administrator'},
			{value: 'moderator', label: 'Moderator'},
			{value: 'user', label: 'Regular User'}
		]
	}
};

/**
 * Select with custom placeholder text
 * Demonstrates custom placeholder configuration
 */
export const CustomPlaceholder: Story = {
	args: {
		// @ts-expect-error ignore the field type check
		$field: 'country',
		clearable: true,
		placeholderKey: 'Choose your country',
		options: [
			{value: 'us', label: 'United States'},
			{value: 'ca', label: 'Canada'},
			{value: 'uk', label: 'United Kingdom'},
			{value: 'au', label: 'Australia'}
		]
	},
	render: (args) => {
		const [$model] = useState(ERO.reactive({country: (void 0)}));
		return <HxSelect {...args} $model={$model} style={{minWidth: '300px'}}/>;
	}
};

/**
 * Select with dependent options
 * Shows options that refresh when another field changes
 */
export const DependentOptions: Story = {
	render: () => {
		const [$model] = useState(ERO.reactive({
			category: 'fruit',
			item: (void 0)
		}));

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const options = (model: any) => {
			if (model.category === 'fruit') {
				return [
					{value: 'apple', label: 'Apple'},
					{value: 'banana', label: 'Banana'},
					{value: 'orange', label: 'Orange'}
				];
			} else if (model.category === 'vegetable') {
				return [
					{value: 'carrot', label: 'Carrot'},
					{value: 'broccoli', label: 'Broccoli'},
					{value: 'spinach', label: 'Spinach'}
				];
			}
			return [];
		};

		return <div style={{display: 'flex', gap: '16px'}}>
			<HxSelect
				$model={$model}
				// @ts-expect-error ignore the field type check
				$field="category"
				clearable={false}
				placeholderKey="Select category"
				options={[
					{value: 'fruit', label: 'Fruit'},
					{value: 'vegetable', label: 'Vegetable'}
				]}
				style={{minWidth: '200px'}}
			/>
			<HxSelect
				$model={$model}
				// @ts-expect-error ignore the field type check
				$field="item"
				clearable={true}
				placeholderKey="Select item"
				options={options}
				optionsDependsOn="category"
				style={{minWidth: '200px'}}
			/>
		</div>;
	}
};

/**
 * Select with large option list
 * Demonstrates scrolling behavior with many options
 */
export const LargeOptionListAndSort: Story = {
	args: {
		// @ts-expect-error ignore the field type check
		$field: 'number',
		clearable: true,
		maxPopupHeight: 300,
		options: Array.from({length: 50}, (_, i) => ({
			value: 50 - i,
			label: `Option ${50 - i}`
		})),
		sort: true
	},
	render: (args) => {
		const [$model] = useState(ERO.reactive({number: (void 0)}));
		return <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: '64px'}}>
			{/* @ts-expect-error ignore the field type check */}
			<HxInput $model={$model} $field="previous" placholder="Previous tab target"/>
			<HxSelect {...args} $model={$model} style={{minWidth: '200px'}}/>
			{/* @ts-expect-error ignore the field type check */}
			<HxInput $model={$model} $field="next" placholder="Next tab target"/>
		</div>;
	}
};

/**
 * Select with empty options
 * Shows the empty state when no options are available
 */
export const EmptyOptions: Story = {
	args: {
		// @ts-expect-error ignore the field type check
		$field: 'item',
		clearable: true,
		options: []
	},
	render: (args) => {
		const [$model] = useState(ERO.reactive({item: (void 0)}));
		return <HxSelect {...args} $model={$model} style={{minWidth: '200px'}}/>;
	}
};
