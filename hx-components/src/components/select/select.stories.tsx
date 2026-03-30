import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
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

type Story = StoryObj<typeof HxSelect>;

export const Default: Story = {
	args: {
		$model: ERO.reactive({fruit: 'apple'}),
		// @ts-expect-error ignore the field type check
		$field: 'fruit',
		options: [
			{value: 'apple', label: 'Apple'},
			{value: 'banana', label: 'Banana'},
			{value: 'orange', label: 'Orange'},
			{value: 'grape', label: 'Grape'}
		]
	}
};

export const WithFunctionOptions: Story = {
	args: {
		$model: ERO.reactive({number: 2}),
		// @ts-expect-error ignore the field type check
		$field: 'number',
		options: () => [
			{value: 1, label: 'One'},
			{value: 2, label: 'Two'},
			{value: 3, label: 'Three'},
			{value: 4, label: 'Four'},
			{value: 5, label: 'Five'}
		],
		minWidth: 250
	}
};
