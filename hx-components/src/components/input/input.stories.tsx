import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-ignore
import React from 'react';
import {HxInput, type HxInputProps} from './index';

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
		value: {
			name: 'Value',
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
		disabled: {
			name: 'Disabled',
			control: 'boolean'
		},
		readOnly: {
			name: 'Read Only',
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
		placeholder: 'Enter some text...',
		onChange: console.log
	}
};

export const WithValue: Story = {
	args: {
		value: 'Hello, World!',
		onChange: console.log
	}
};

export const Password: Story = {
	args: {
		type: 'password',
		placeholder: 'Enter password...',
		onChange: console.log
	}
};

export const Disabled: Story = {
	args: {
		value: 'This input is disabled',
		disabled: true
	}
};

export const ReadOnly: Story = {
	args: {
		value: 'This input is read-only',
		readOnly: true
	}
};

export const SelectAllDisabled: Story = {
	args: {
		value: 'Click here - text will not auto-select',
		selectAll: false,
		onChange: console.log
	}
};

export const WithLabelWrapper: Story = {
	render: (args: HxInputProps) => (
		<div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
			<label htmlFor="custom-input">Custom Label</label>
			<HxInput id="custom-input" {...args} />
		</div>
	),
	args: {
		placeholder: 'Enter value...',
		onChange: console.log
	}
};

export const MultipleInputs: Story = {
	render: () => (
		<div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
			<div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
				<label htmlFor="first-name">First Name</label>
				<HxInput id="first-name" placeholder="Enter first name"/>
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
				<label htmlFor="last-name">Last Name</label>
				<HxInput id="last-name" placeholder="Enter last name"/>
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
				<label htmlFor="email">Email</label>
				<HxInput id="email" type="email" placeholder="Enter email"/>
			</div>
		</div>
	)
};
