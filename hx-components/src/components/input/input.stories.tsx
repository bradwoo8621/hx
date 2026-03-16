import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-ignore
import React, {useRef, useState} from 'react';
import {HxInput, type HxInputType, HxWithCheckInput} from './input';

const meta: Meta<HxInputType> = {
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
		$disabled: true
	}
};

export const ReadOnly: Story = {
	args: {
		$model: ERO.reactive({text: 'This input is read-only'}),
		// @ts-ignore
		$field: 'text',
		$readonly: true
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

export const WithReactiveChangeDisplay: Story = {
	render: (args) => {
		const [displayText, setDisplayText] = React.useState('Initial value: Hello, Reactive!');

		const ref = useRef<HTMLInputElement>(null);
		// Create reactive model
		const [model] = useState(() => ERO.reactive({text: 'Hello, Reactive!'}));

		// Listen for changes using reactive object mechanism
		React.useEffect(() => {
			const handleChange = (event: any) => {
				setDisplayText(`Current value: ${event.newValue ?? ''}`);
			};

			ERO.on(model, 'text', handleChange);

			return () => {
				ERO.off(model, 'text', handleChange);
			};
		}, [model]);

		return <div style={{display: 'flex', flexDirection: 'column', gap: '12px', width: '300px'}}>
			{/* @ts-expect-error $field detected as never, don't know why */}
			<HxInput {...args} $model={model} $field={'text'} placeholder="Type something..."
			         ref={ref}/>
			<div style={{padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px'}}>
				{displayText}
			</div>
		</div>;
	},
	args: {
		placeholder: 'Type something to see changes...'
	}
};

export const DefaultWithCheck: Story = {
	render: (args) => {
		const [model] = useState(() => ERO.reactive({text: 'With check.'}));
		// @ts-expect-error $field detected as never, don't know why
		return <HxWithCheckInput {...args} $model={model} $field="text"/>;
	}
};
