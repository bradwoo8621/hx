import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {useEffect, useState} from 'react';
import {useForceUpdate} from '../../hooks';
import {HxCheckbox} from './index';

const meta: Meta<typeof HxCheckbox> = {
	title: 'Components/Basic/Checkbox',
	component: HxCheckbox,
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
		text: {
			name: 'Label Text',
			description: 'Checkbox label text content',
			control: 'text'
		},
		values: {
			name: 'Value Pair',
			description: 'Custom value pair for checked/unchecked states: [checkedValue, uncheckedValue]',
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
type Story = StoryObj<typeof HxCheckbox>;

// Create a reactive model for demo
const createDemoModel = (initialValue: boolean | string | number = false) => {
	return ERO.reactive({checked: initialValue});
};

export const Basic: Story = {
	render: () => {
		const model = createDemoModel(false);
		// @ts-expect-error ignore the field type check
		return <HxCheckbox $model={model} $field="checked" text="Basic Checkbox"/>;
	}
};

export const Checked: Story = {
	render: () => {
		const model = createDemoModel(true);
		// @ts-expect-error ignore the field type check
		return <HxCheckbox $model={model} $field="checked" text="Checked by Default"/>;
	}
};

export const Disabled: Story = {
	render: () => {
		const model = createDemoModel(true);
		// @ts-expect-error ignore the field type check
		return <HxCheckbox $model={model} $field="checked" text="Disabled Checkbox" $disabled={true}/>;
	}
};

export const DisabledUnchecked: Story = {
	render: () => {
		const model = createDemoModel(false);
		// @ts-expect-error ignore the field type check
		return <HxCheckbox $model={model} $field="checked" text="Disabled Unchecked" $disabled={true}/>;
	}
};

export const NoLabel: Story = {
	render: () => {
		const model = createDemoModel(false);
		// @ts-expect-error ignore the field type check
		return <HxCheckbox $model={model} $field="checked"/>;
	}
};

export const CustomValues: Story = {
	render: () => {
		const [model] = useState(createDemoModel('yes'));
		const forceUpdate = useForceUpdate();
		useEffect(() => {
			ERO.on(model, 'checked', forceUpdate);
			return () => {
				ERO.off(model, 'checked', forceUpdate);
			};
		}, [model, forceUpdate]);

		return (
			<div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
				<HxCheckbox
					$model={model}
					// @ts-expect-error ignore the field type check
					$field="checked"
					text="Custom Value Pair (yes/no)"
					values={['yes', 'no']}
				/>
				<div>Current value: {JSON.stringify(ERO.getValue(model, 'checked'))}</div>
			</div>
		);
	}
};

export const NumericValues: Story = {
	render: () => {
		const [model] = useState(createDemoModel(1));
		const forceUpdate = useForceUpdate();
		useEffect(() => {
			ERO.on(model, 'checked', forceUpdate);
			return () => {
				ERO.off(model, 'checked', forceUpdate);
			};
		}, [model, forceUpdate]);
		return (
			<div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
				<HxCheckbox
					$model={model}
					// @ts-expect-error ignore the field type check
					$field="checked"
					text="Numeric Value Pair (1/0)"
					values={[1, 0]}
				/>
				<div>Current value: {ERO.getValue(model, 'checked')}</div>
			</div>
		);
	}
};

export const CustomValueChecker: Story = {
	render: () => {
		// Check if value is greater than 10
		const [model] = useState(createDemoModel(15));
		const forceUpdate = useForceUpdate();
		useEffect(() => {
			ERO.on(model, 'checked', forceUpdate);
			return () => {
				ERO.off(model, 'checked', forceUpdate);
			};
		}, [model, forceUpdate]);
		return (
			<div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
				<HxCheckbox
					$model={model}
					// @ts-expect-error ignore the field type check
					$field="checked"
					text="Custom Checker (checked when value > 10)"
					values={['high', 'low', (val: number) => val > 10]}
				/>
				<div>Current value: {ERO.getValue(model, 'checked')}</div>
			</div>
		);
	}
};
