import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {Clock, HxDateTimePicker} from '../../src';

const meta: Meta<typeof HxDateTimePicker> = {
	title: 'Components/Basic/DateTimePicker/Functional',
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

/** Date picker with hx pattern. */
export const DatePicker: Story = {
	args: {
		$model: ERO.reactive({date: '2024/06/10'}),
		$field: 'date',
		displayFormat: '@d/ymd',
		valueFormat: 'y/m/d',
		clearable: true
	}
};

/** Date time picker with both date and time parts. */
export const DateTimePicker: Story = {
	args: {
		$model: ERO.reactive({datetime: '2024/06/10 14:30:00'}),
		$field: 'datetime',
		displayFormat: '@d/ymd :hns',
		valueFormat: 'y/m/d h:n:s',
		clearable: true
	}
};

/** Date picker with dayjs format string. */
export const DayjsFormat: Story = {
	args: {
		$model: ERO.reactive({date: '2024-06-10'}),
		$field: 'date',
		displayFormat: 'YYYY-MM-DD',
		valueFormat: 'y-m-d',
		clearable: true
	}
};

/** Date picker with dash separator. */
export const DateDash: Story = {
	args: {
		$model: ERO.reactive({date: '2024-06-10'}),
		$field: 'date',
		displayFormat: '@d-ymd',
		valueFormat: 'y-m-d',
		clearable: true
	}
};

/** Disabled date picker. */
export const Disabled: Story = {
	args: {
		$model: ERO.reactive({date: '2024/06/10'}),
		$field: 'date',
		displayFormat: '@d/ymd',
		valueFormat: 'y/m/d',
		$disabled: true
	}
};

/** Sunday as first day of week. */
export const SundayFirst: Story = {
	args: {
		$model: ERO.reactive({date: '2024/06/10'}),
		$field: 'date',
		displayFormat: '@d/ymd',
		valueFormat: 'y/m/d',
		firstDayOfWeek: 'sun',
		clearable: true
	}
};

/** Date picker with custom format function. */
export const CustomFormatFunc: Story = {
	argTypes: {
		displayFormat: {control: {disable: true}}
	},
	args: {
		$model: ERO.reactive({date: '2024/06/10'}),
		$field: 'date',
		displayFormat: (value) => value
			? new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'}).format(value.cloneAsJsDate())
			: (void 0),
		availableParts: 'y/m/d',
		valueFormat: 'y/m/d',
		clearable: true
	}
};

/** Placeholder shown for empty value. */
export const Placeholder: Story = {
	args: {
		$model: ERO.reactive({date: null}),
		$field: 'date',
		displayFormat: '@d/ymd',
		valueFormat: 'y/m/d',
		placeholder: true
	}
};

/** Custom placeholder text for an empty value. */
export const CustomPlaceholderKey: Story = {
	args: {
		$model: ERO.reactive({date: null}),
		$field: 'date',
		displayFormat: '@d/ymd',
		valueFormat: 'y/m/d',
		placeholderKey: 'Select a date…'
	}
};

/** Custom icon shown at the calendar trigger button. */
export const CustomCalendarIcon: Story = {
	args: {
		$model: ERO.reactive({date: '2024/06/10'}),
		$field: 'date',
		displayFormat: '@d/ymd',
		valueFormat: 'y/m/d',
		calendarIcon: <Clock/>
	}
};

/** Monday as the first day of week with a custom weekend (Friday + Saturday). */
export const MondayFirst: Story = {
	args: {
		$model: ERO.reactive({date: '2024/06/10'}),
		$field: 'date',
		displayFormat: '@d/ymd',
		valueFormat: 'y/m/d',
		firstDayOfWeek: 'mon',
		weekendDays: ['fri', 'sat'],
		clearable: true
	}
};

/** Open the popup from the keyboard with Enter or Space. */
export const KeyboardOpen: Story = {
	args: {
		$model: ERO.reactive({date: '2024/06/10'}),
		$field: 'date',
		displayFormat: '@d/ymd',
		valueFormat: 'y/m/d',
		enterToOpenPopup: true,
		spaceToOpenPopup: true,
		clearable: true
	}
};

/** Empty model opens the popup at the default value (1980/01/01) instead of today. */
export const DefaultValue: Story = {
	args: {
		$model: ERO.reactive({date: null}),
		$field: 'date',
		displayFormat: '@d/ymd',
		valueFormat: 'y/m/d',
		defaultValue: 'y1980m1d1',
		clearable: true
	}
};

/** Date-only picker whose valueFormat needs time parts; the missing ones are filled from defaultValue (23:59:59). */
export const DefaultValueFillTime: Story = {
	args: {
		$model: ERO.reactive({datetime: '2024/06/10'}),
		$field: 'datetime',
		displayFormat: '@d/ymd',
		valueFormat: 'y/m/d h:n:s',
		defaultValue: 'h23n59s59',
		clearable: true
	}
};

/** valueSyncMode=immediate writes every change straight to the model, so the Confirm button is hidden. */
export const ImmediateSync: Story = {
	args: {
		$model: ERO.reactive({datetime: '2024/06/10 14:30:00'}),
		$field: 'datetime',
		displayFormat: '@d/ymd :hns',
		valueFormat: 'y/m/d h:n:s',
		valueSyncMode: 'immediate',
		clearable: true
	}
};

/** Custom texts for the footer buttons and the time shortcuts. */
export const CustomButtonKeys: Story = {
	args: {
		$model: ERO.reactive({datetime: '2024/06/10 14:30:00'}),
		$field: 'datetime',
		displayFormat: '@d/ymd :hns',
		valueFormat: 'y/m/d h:n:s',
		clearable: true,
		todayKey: 'Now',
		clearKey: 'Clear',
		confirmKey: 'OK',
		startOfDayKey: '00:00',
		noonOfDayKey: '12:00',
		endOfDayKey: '23:59'
	}
};
