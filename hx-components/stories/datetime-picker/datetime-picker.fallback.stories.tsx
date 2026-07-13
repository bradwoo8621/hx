import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {HxDateTimePicker} from '../../src';

const meta: Meta<typeof HxDateTimePicker> = {
	title: 'Components/Basic/DateTimePicker/Fallback',
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

/** Time picker only — falls back to format-input (no ymd). */
export const TimePicker: Story = {
	args: {
		$model: ERO.reactive({time: '14:30:00'}),
		$field: 'time',
		displayFormat: '@d:hns',
		valueFormat: 'h:n:s',
		clearable: true
	}
};

/** Time picker (hours and minutes only, no seconds) — falls back to format-input (no ymd). */
export const HoursMinutes: Story = {
	args: {
		$model: ERO.reactive({time: '14:30'}),
		$field: 'time',
		displayFormat: '@d:hn',
		valueFormat: 'h:n',
		clearable: true
	}
};

/** Year-month picker (no day) — falls back to format-input (ymd incomplete). */
export const YearMonth: Story = {
	args: {
		$model: ERO.reactive({date: '2024/06'}),
		$field: 'date',
		displayFormat: '@d/ym',
		valueFormat: 'y/m',
		clearable: true
	}
};

/** Pure time via dayjs format string — falls back to format-input (no ymd). */
export const DayjsTime: Story = {
	args: {
		$model: ERO.reactive({time: '14:30:00'}),
		$field: 'time',
		displayFormat: 'HH:mm:ss',
		valueFormat: 'h:n:s',
		availableParts: 'h:n:s',
		clearable: true
	}
};
