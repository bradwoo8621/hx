import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {HxDateTimePicker} from '../../src';

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
	args: {
		$model: ERO.reactive({date: '2024/06/10'}),
		$field: 'date',
		displayFormat: (value) => value ? value.format('MMMM D, YYYY') : (void 0),
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
