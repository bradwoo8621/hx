import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-ignore
import React from 'react';
import {HxInput} from './index';

const meta: Meta<typeof HxInput> = {
	title: 'Components/Input',
	component: HxInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		selectAll: {
			name: 'Select All on Focus',
			description: 'Automatically select all text when input is focused',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'true'}
			}
		},
		$model: {
			name: 'Data Model',
			control: 'text'
		},
		$field: {
			name: 'Field name of Data Model',
			description: 'Follows reactive object path standard',
			control: 'text'
		},
		placeholder: {
			name: 'Placeholder',
			control: 'text'
		},
		type: {
			name: 'Input Type',
			control: {
				type: 'select'
			},
			options: ['text', 'password'],
			defaultValue: 'text'
		},
		$visible: {
			name: 'Visible',
			control: 'boolean'
		},
		$disabled: {
			name: 'Disabled',
			control: 'boolean'
		},
		$readonly: {
			name: 'Readonly',
			control: 'boolean'
		},
		onChange: {
			action: 'changed',
			table: {
				disable: true
			}
		},
		onFocus: {
			action: 'focused',
			table: {
				disable: true
			}
		},
		onBlur: {
			action: 'blurred',
			table: {
				disable: true
			}
		}
	}
};

export default meta;

type Story = StoryObj<typeof HxInput>;

export const Default: Story = {
	args: {
		$model: ERO.reactive({}),
		// @ts-ignore
		$field: 'text',
		placeholder: 'Enter some text...',
		onChange: console.log
	}
};

export const WithValue: Story = {
	args: {
		$model: ERO.reactive({text: 'Hello, World!'}),
		// @ts-ignore
		$field: 'text',
		onChange: console.log
	}
};

export const Password: Story = {
	args: {
		$model: ERO.reactive({}),
		// @ts-ignore
		$field: 'text',
		type: 'password',
		placeholder: 'Enter password...',
		onChange: console.log
	}
};

export const Disabled: Story = {
	args: {
		$model: ERO.reactive({text: 'This input is disabled'}),
		// @ts-ignore
		$field: 'text',
		disabled: true
	}
};

export const ReadOnly: Story = {
	args: {
		$model: ERO.reactive({text: 'This input is read-only'}),
		// @ts-ignore
		$field: 'text',
		readOnly: true
	}
};

export const SelectAllDisabled: Story = {
	args: {
		$model: ERO.reactive({text: 'Click here - text will not auto-select'}),
		// @ts-ignore
		$field: 'text',
		selectAll: false,
		onChange: console.log
	}
};
