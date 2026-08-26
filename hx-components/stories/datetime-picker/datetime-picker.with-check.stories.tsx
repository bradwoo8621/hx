import {ERO, type ValueChangedEvent} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {useState} from 'react';
import {
	type CheckPropValue,
	type CheckResult,
	type HxContext,
	HxDateTimePicker,
	type HxObject,
	HxWithCheckDateTimePicker
} from '../../src';

const meta: Meta<typeof HxDateTimePicker> = {
	title: 'Components/Basic/DateTimePicker/WithCheck',
	component: HxDateTimePicker,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		$model: {table: {disable: true}},
		$field: {table: {disable: true}},
		displayFormat: {
			control: 'text',
			description: 'hx pattern (@d/ymd), dayjs format string, or format function'
		},
		clearable: {control: 'boolean'},
		$disabled: {control: 'boolean'}
	}
};

export default meta;
type Story = StoryObj<typeof HxDateTimePicker>;

/** Date picker with a validation check: empty value or a year before 2024 fails. */
export const DefaultWithCheck: Story = {
	render: (args) => {
		const [model] = useState(() => ERO.reactive({date: '2024/06/10'}));
		const [$check] = useState<CheckPropValue<typeof model>>(() => {
			return {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				handle: (event: ValueChangedEvent, _model: HxObject<typeof model>, _context: HxContext): CheckResult => {
					const {newValue} = event;
					if (newValue == null) {
						return 'Date is required';
					}
					const year = Number(String(newValue).split('/')[0]);
					if (year < 2024) {
						return 'Date must be in 2024 or later';
					}
					return (void 0);
				}
			};
		});

		return <HxWithCheckDateTimePicker {...args} $model={model} $field="date" $check={$check}
		                                   displayFormat="@d/ymd" valueFormat="y/m/d" clearable/>;
	}
};
