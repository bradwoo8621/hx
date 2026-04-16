import {ERO, type ValueChangedEvent} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {useEffect, useRef, useState} from 'react';
import type {HxContext} from '../../contexts';
import type {CheckPropValue, CheckResult, HxObject} from '../../types';
import {HxConsole} from '../../utils';
import {House} from '../icons';
import {HxLabel} from '../label';
import {HxWithCheck} from '../with-check';
import {HxInput, type HxInputType, HxWithCheckInput} from './input';

const meta: Meta<HxInputType> = {
	title: 'Components/Basic/Input',
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
		$field: 'text',
		placeholder: 'Enter some text...',
		onChange: HxConsole.log
	}
};

export const WithValue: Story = {
	args: {
		$model: ERO.reactive({text: 'Hello, World!'}),
		$field: 'text',
		onChange: HxConsole.log
	}
};

export const Password: Story = {
	args: {
		$model: ERO.reactive({}),
		$field: 'text',
		type: 'password',
		placeholder: 'Enter password...',
		onChange: HxConsole.log
	}
};

export const Disabled: Story = {
	args: {
		$model: ERO.reactive({text: 'This input is disabled'}),
		$field: 'text',
		$disabled: true
	}
};

export const ReadOnly: Story = {
	args: {
		$model: ERO.reactive({text: 'This input is read-only'}),
		$field: 'text',
		$readonly: true
	}
};

export const SelectAllDisabled: Story = {
	args: {
		$model: ERO.reactive({text: 'Click here - text will not auto-select'}),
		$field: 'text',
		selectAll: false,
		onChange: HxConsole.log
	}
};

export const PrefixIcon: Story = {
	args: {
		$model: ERO.reactive({text: 'With prefix icon'}),
		$field: 'text',
		prefix: [
			<HxLabel text={<House marginT={3}/>}
			         data-hx-label-input-embed="" data-hx-label-svg-icon=""/>
		]
	}
};

export const WithReactiveChangeDisplay: Story = {
	render: (args) => {
		const [displayText, setDisplayText] = useState('Initial value: Hello, Reactive!');

		const ref = useRef<HTMLInputElement>(null);
		// Create reactive model
		const [model] = useState(() => ERO.reactive({obj: {text: 'Hello, Reactive!'}}));

		// Listen for changes using reactive object mechanism
		useEffect(() => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const handleChange = (event: any) => {
				setDisplayText(`Current value: ${event.newValue ?? ''}`);
			};

			ERO.on(model, 'obj.text', handleChange);

			return () => {
				ERO.off(model, 'obj.text', handleChange);
			};
		}, [model]);

		return <div style={{display: 'flex', flexDirection: 'column', gap: '12px', width: '300px'}}>
			<HxInput {...args} $model={model} $field={'obj.text'} placeholder="Type something..."
			         ref={ref}/>
			<div style={{
				padding: '8px',
				marginTop: '100px',
				border: '1px solid #e0e0e0',
				borderRadius: '4px',
				fontSize: '14px'
			}}>
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
		// Create a wrapped input component
		const HxValidatedInput = HxWithCheck(HxInput, {
			$supplyOn: (props) => props.$field
		});

		const [model] = useState(() => ERO.reactive({text: ''}));
		const [$check] = useState<CheckPropValue<typeof model>>(() => {
			return {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				handle: (event: ValueChangedEvent, _model: HxObject<typeof model>, _context: HxContext): CheckResult => {
					const {newValue} = event;
					if (newValue == null || newValue.trim().length < 3) {
						return 'Value must be at least 3 characters long';
					}
					return (void 0);
				}
			};
		});

		// @ts-expect-error Component props type compatibility
		return <HxValidatedInput {...args} $model={model} $field="text" $check={$check}
		                         placeholder="Enter text (min 3 chars)"/>;
	}
};

export const WithCheckLongMessage: Story = {
	render: (args) => {
		const [model] = useState(() => ERO.reactive({text: 'With check.'}));
		const [$check] = useState<CheckPropValue<typeof model>>(() => {
			return {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				handle: (event: ValueChangedEvent, _model: HxObject<typeof model>, _context: HxContext): CheckResult => {
					const {newValue} = event;
					if (newValue == null || newValue.trim().length === 0) {
						return 'Value cannot be empty. And very very very very very long message.';
					} else {
						return (void 0);
					}
				}
			};
		});

		return <HxWithCheckInput {...args} $model={model} $field="text" $check={$check}/>;
	}
};

export const AlwaysKeepMessageDOM: Story = {
	render: (args) => {
		const [model] = useState(() => ERO.reactive({text: ''}));
		const [$check] = useState<CheckPropValue<typeof model>>(() => {
			return {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				handle: (event: ValueChangedEvent, _model: HxObject<typeof model>, _context: HxContext): CheckResult => {
					const {newValue} = event;
					if (newValue == null || newValue.trim().length < 5) {
						return 'Value must be at least 5 characters';
					}
					return (void 0);
				}
			};
		});

		return <HxWithCheckInput {...args} $model={model} $field="text" $check={$check} alwaysKeepMessageDOM
		                         placeholder="Enter text (min 5 chars)"/>;
	}
};

export const MultipleValidationRules: Story = {
	render: (args) => {
		const [model] = useState(() => ERO.reactive({email: ''}));
		const [$check] = useState<CheckPropValue<typeof model>>(() => {
			return {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				handle: (event: ValueChangedEvent, _model: HxObject<typeof model>, _context: HxContext): CheckResult => {
					const {newValue} = event;
					if (newValue == null || newValue.trim().length === 0) {
						return 'Email is required';
					}
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					if (!emailRegex.test(newValue)) {
						return 'Please enter a valid email address';
					}
					return (void 0);
				}
			};
		});

		return <HxWithCheckInput {...args} $model={model} $field="email" $check={$check}
		                         placeholder="Enter email address" type="text"/>;
	}
};
