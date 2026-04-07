/**
 * Storybook documentation and examples for the HxSelect component
 * Demonstrates all available features and usage patterns
 */
import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {useState} from 'react';
import {HxSelect} from './index';

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
