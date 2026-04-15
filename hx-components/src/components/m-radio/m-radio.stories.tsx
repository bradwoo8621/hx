import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxMRadio, HxWithCheckMRadio} from './m-radio';

const meta: Meta<typeof HxMRadio> = {
	title: 'Components/Basic/Radio Group',
	component: HxMRadio,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		$model: {
			name: 'Data Model',
			control: 'object',
			table: {disable: true}
		},
		$field: {
			name: 'Field name of Data Model',
			control: 'text',
			table: {disable: true}
		},
		options: {
			name: 'Options',
			description: 'Radio option list',
			control: 'object'
		},
		direction: {
			name: 'Layout Direction',
			description: 'Direction of radio options layout',
			control: {type: 'select'},
			options: ['dir-x', 'dir-y'],
			table: {
				defaultValue: {summary: 'dir-y'}
			}
		},
		lanes: {
			name: 'Lanes',
			description: 'Number of columns (dir-x) or rows (dir-y) for layout',
			control: {type: 'number', min: 1, max: 10}
		},
		gapX: {
			name: 'Horizontal Gap',
			description: 'Horizontal gap between radio options',
			control: {type: 'select'},
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl']
		},
		gapY: {
			name: 'Vertical Gap',
			description: 'Vertical gap between radio options',
			control: {type: 'select'},
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl']
		},
		enterToSwitchValue: {
			name: 'Enter Key to Switch',
			description: 'Enable Enter key to switch radio value',
			control: 'boolean'
		},
		spaceToSwitchValue: {
			name: 'Space Key to Switch',
			description: 'Enable Space key to switch radio value',
			control: 'boolean'
		},
		$disabled: {
			name: 'Disabled',
			control: 'boolean'
		},
		$visible: {
			name: 'Visible',
			control: 'boolean'
		}
	}
};

export default meta;
type Story = StoryObj<typeof HxMRadio>;

/**
 * Basic vertical radio group (default layout)
 */
export const Basic: Story = {
	render: () => {
		const model = ERO.reactive({
			gender: 'male'
		});

		return <HxMRadio
			$model={model}
			$field="gender"
			options={[
				{label: 'Male', value: 'male'},
				{label: 'Female', value: 'female'},
				{label: 'Other', value: 'other'}
			]}
			style={{width: '400px'}}
		/>;
	}
};

/**
 * Horizontal radio group layout
 */
export const Horizontal: Story = {
	render: () => {
		const model = ERO.reactive({
			status: 'active'
		});

		return <HxMRadio
			$model={model}
			$field="status"
			direction="dir-x"
			gapX="lg"
			options={[
				{label: 'Active', value: 'active'},
				{label: 'Inactive', value: 'inactive'},
				{label: 'Pending', value: 'pending'}
			]}
			style={{width: '400px'}}
		/>;
	}
};

/**
 * Multi-column horizontal radio layout
 */
export const MultiColumn: Story = {
	render: () => {
		const model = ERO.reactive({
			fruit: 'apple'
		});

		return <HxMRadio
			$model={model}
			$field="fruit"
			direction="dir-x"
			lanes={3}
			gapX="md"
			gapY="md"
			options={[
				{label: 'Apple', value: 'apple'},
				{label: 'Banana', value: 'banana'},
				{label: 'Orange', value: 'orange'},
				{label: 'Grape', value: 'grape'},
				{label: 'Mango', value: 'mango'},
				{label: 'Strawberry', value: 'strawberry'}
			]}
			style={{width: '600px'}}
		/>;
	}
};

/**
 * Radio group with custom gaps
 */
export const CustomGaps: Story = {
	render: () => {
		const model = ERO.reactive({
			level: 'mid'
		});

		return <HxMRadio
			$model={model}
			$field="level"
			direction="dir-y"
			gapY="lg"
			options={[
				{label: 'Junior', value: 'junior'},
				{label: 'Mid', value: 'mid'},
				{label: 'Senior', value: 'senior'},
				{label: 'Expert', value: 'expert'}
			]}
			style={{width: '400px'}}
		/>;
	}
};

/**
 * Disabled radio group
 */
export const Disabled: Story = {
	render: () => {
		const model = ERO.reactive({
			role: 'user'
		});

		return <HxMRadio
			$model={model}
			$field="role"
			$disabled={true}
			options={[
				{label: 'User', value: 'user'},
				{label: 'Admin', value: 'admin'},
				{label: 'Guest', value: 'guest'}
			]}
			style={{width: '400px'}}
		/>;
	}
};

/**
 * Radio group with disabled individual options
 */
export const DisabledOptions: Story = {
	render: () => {
		const model = ERO.reactive({
			plan: 'basic'
		});

		return <HxMRadio
			$model={model}
			$field="plan"
			options={[
				{label: 'Basic Plan', value: 'basic'},
				{label: 'Premium Plan', value: 'premium'},
				{label: 'Enterprise Plan', value: 'enterprise', $disabled: true},
				{label: 'Custom Plan', value: 'custom', $disabled: true}
			]}
			style={{width: '400px'}}
		/>;
	}
};

/**
 * Radio group with custom keyboard event configuration
 */
export const CustomKeyboard: Story = {
	render: () => {
		const model = ERO.reactive({
			agreement: 'no'
		});

		return <HxMRadio
			$model={model}
			$field="agreement"
			enterToSwitchValue={true}
			spaceToSwitchValue={false}
			options={[
				{label: 'Yes, I agree', value: 'yes'},
				{label: 'No, I disagree', value: 'no'}
			]}
			style={{width: '400px'}}
		/>;
	}
};

/**
 * HxWithCheckMRadio integrated with validation
 */
export const WithCheck: Story = {
	render: () => {
		const model = ERO.reactive({
			category: ''
		});

		return <HxWithCheckMRadio
			$model={model}
			$field="category"
			options={[
				{label: 'Category A', value: 'a'},
				{label: 'Category B', value: 'b'},
				{label: 'Category C', value: 'c'}
			]}
			style={{width: '400px'}}
		/>;
	}
};
