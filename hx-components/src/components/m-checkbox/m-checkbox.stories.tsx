import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxMCheckbox, HxWithCheckMCheckbox} from './m-checkbox';

const meta: Meta<typeof HxMCheckbox> = {
	title: 'Components/Basic/Checkbox Group',
	component: HxMCheckbox,
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
			description: 'Checkbox option list',
			control: 'object'
		},
		maxChecked: {
			name: 'Max Checked',
			description: 'Maximum number of options that can be selected',
			control: {type: 'number', min: 1}
		},
		direction: {
			name: 'Layout Direction',
			description: 'Direction of checkbox options layout',
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
			description: 'Horizontal gap between checkbox options',
			control: {type: 'select'},
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl']
		},
		gapY: {
			name: 'Vertical Gap',
			description: 'Vertical gap between checkbox options',
			control: {type: 'select'},
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl']
		},
		enterToSwitchValue: {
			name: 'Enter Key to Switch',
			description: 'Enable Enter key to toggle checkbox value',
			control: 'boolean'
		},
		spaceToSwitchValue: {
			name: 'Space Key to Switch',
			description: 'Enable Space key to toggle checkbox value',
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
type Story = StoryObj<typeof HxMCheckbox>;

/**
 * Basic vertical checkbox group (default layout)
 */
export const Basic: Story = {
	render: () => {
		const model = ERO.reactive({
			hobbies: [] as string[]
		});

		return <HxMCheckbox
			$model={model}
			$field="hobbies"
			options={[
				{label: 'Reading', value: 'reading'},
				{label: 'Sports', value: 'sports'},
				{label: 'Music', value: 'music'},
				{label: 'Travel', value: 'travel'}
			]}
			style={{width: '400px'}}
		/>;
	}
};

/**
 * Horizontal checkbox group layout
 */
export const Horizontal: Story = {
	render: () => {
		const model = ERO.reactive({
			skills: [] as string[]
		});

		return <HxMCheckbox
			$model={model}
			$field="skills"
			direction="dir-x"
			gapX="lg"
			options={[
				{label: 'JavaScript', value: 'js'},
				{label: 'TypeScript', value: 'ts'},
				{label: 'React', value: 'react'}
			]}
			style={{width: '400px'}}
		/>;
	}
};

/**
 * Multi-column horizontal checkbox layout
 */
export const MultiColumn: Story = {
	render: () => {
		const model = ERO.reactive({
			fruits: [] as string[]
		});

		return <HxMCheckbox
			$model={model}
			$field="fruits"
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
 * Checkbox group with maximum selection limit
 */
export const MaxChecked: Story = {
	render: () => {
		const model = ERO.reactive({
			topics: ['tech', 'business'] as string[]
		});

		return <HxMCheckbox
			$model={model}
			$field="topics"
			maxChecked={2}
			options={[
				{label: 'Technology', value: 'tech'},
				{label: 'Business', value: 'business'},
				{label: 'Science', value: 'science'},
				{label: 'Art', value: 'art'},
				{label: 'Sports', value: 'sports'}
			]}
			style={{width: '400px'}}
		/>;
	}
};

/**
 * Checkbox group with custom gaps
 */
export const CustomGaps: Story = {
	render: () => {
		const model = ERO.reactive({
			categories: [] as string[]
		});

		return <HxMCheckbox
			$model={model}
			$field="categories"
			direction="dir-y"
			gapY="lg"
			options={[
				{label: 'Category A', value: 'a'},
				{label: 'Category B', value: 'b'},
				{label: 'Category C', value: 'c'},
				{label: 'Category D', value: 'd'}
			]}
			style={{width: '400px'}}
		/>;
	}
};

/**
 * Disabled checkbox group
 */
export const Disabled: Story = {
	render: () => {
		const model = ERO.reactive({
			roles: ['user'] as string[]
		});

		return <HxMCheckbox
			$model={model}
			$field="roles"
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
 * Checkbox group with disabled individual options
 */
export const DisabledOptions: Story = {
	render: () => {
		const model = ERO.reactive({
			permissions: ['read'] as string[]
		});

		return <HxMCheckbox
			$model={model}
			$field="permissions"
			options={[
				{label: 'Read', value: 'read'},
				{label: 'Write', value: 'write'},
				{label: 'Delete', value: 'delete', $disabled: true},
				{label: 'Admin', value: 'admin', $disabled: true}
			]}
			style={{width: '400px'}}
		/>;
	}
};

/**
 * Checkbox group with custom keyboard event configuration
 */
export const CustomKeyboard: Story = {
	render: () => {
		const model = ERO.reactive({
			agreement: [] as string[]
		});

		return <HxMCheckbox
			$model={model}
			$field="agreement"
			enterToSwitchValue={true}
			spaceToSwitchValue={false}
			options={[
				{label: 'I agree to terms', value: 'terms'},
				{label: 'I agree to privacy policy', value: 'privacy'}
			]}
			style={{width: '400px'}}
		/>;
	}
};

/**
 * HxWithCheckMCheckbox integrated with validation
 */
export const WithCheck: Story = {
	render: () => {
		const model = ERO.reactive({
			interests: [] as string[]
		});

		return <HxWithCheckMCheckbox
			$model={model}
			$field="interests"
			options={[
				{label: 'Music', value: 'music'},
				{label: 'Reading', value: 'reading'},
				{label: 'Sports', value: 'sports'},
				{label: 'Travel', value: 'travel'}
			]}
			style={{width: '400px'}}
		/>;
	}
};
