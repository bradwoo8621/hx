import {ERO, type ValueChangedEvent} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-ignore
import React, {useState} from 'react';
import type {HxContext} from '../../contexts';
import type {CheckPropValue, CheckResult, HxObject} from '../../types';
import {HxInput, HxWithCheckInput} from '../input';
import {HxWithCheck} from './with-check';

const meta: Meta = {
	title: 'Components/HighOrder/WithCheck',
	// @ts-ignore
	component: HxWithCheck,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		alwaysKeepMessageDOM: {
			name: 'Always Keep Message DOM',
			description: 'Always render the message element even when there is no error',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		}
	}
};

export default meta;

type Story = StoryObj<typeof HxWithCheck>;

export const Default: Story = {
	render: (args) => {
		// Create a wrapped input component
		const HxValidatedInput = HxWithCheck(HxInput, {
			$supplyOn: (props) => props.$field
		});

		const [model] = useState(() => ERO.reactive({text: ''}));
		const [$check] = useState<CheckPropValue<typeof model>>(() => {
			return {
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

export const DefaultWithCheck: Story = {
	render: (args) => {
		const [model] = useState(() => ERO.reactive({text: 'With check.'}));
		const [$check] = useState<CheckPropValue<typeof model>>(() => {
			return {
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
