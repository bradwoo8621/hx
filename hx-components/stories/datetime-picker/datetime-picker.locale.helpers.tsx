import type {StoryObj} from '@storybook/react-vite';
import type {Dayjs} from 'dayjs';
// @ts-expect-error import React
import React, {type ReactNode} from 'react';
import {
	DateLocaleUtils,
	DateJaUtils,
	DateThUtils,
	DateZhTWUtils,
	HxDateTimePicker,
	type HxDateTimePickerDisplayFormatFunc,
	type HxDateTimePickerProps,
	HxFlex,
	HxLabel,
	type HxLanguageCode, DateKoUtils
} from '../../src';

// eslint-disable-next-line react-refresh/only-export-components
export const baseMeta = {
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
	},
	args: {
		valueFormat: 'y/m/d',
		$field: 'date',
		clearable: false
	}
};

DateZhTWUtils.enable();
DateJaUtils.enable();
DateKoUtils.enable();
DateThUtils.enable();

export type Story = StoryObj<typeof HxDateTimePicker>;

// eslint-disable-next-line react-refresh/only-export-components
export const isGregorian = (forceLang: HxLanguageCode | undefined): forceLang is undefined => {
	return forceLang == null || forceLang === 'gregory' || (forceLang.trim().length === 0);
};

export const LocaleStory = <T extends object>(args: Omit<HxDateTimePickerProps<T>, 'displayFormat'> & {
	label: string; gCols?: number;
}) => {
	const lang = args.calendarLocale as HxLanguageCode | undefined;
	const gregorian = isGregorian(lang);
	const displayFormat: HxDateTimePickerDisplayFormatFunc = (value?: Dayjs): ReactNode | null | undefined => {
		if (value == null || !value.isValid()) {
			return '';
		} else if (gregorian) {
			const date = value.toDate();
			return [
				'Gregory',
				[
					`${date.getFullYear()}`.padStart(4, '0'),
					`${date.getMonth() + 1}`.padStart(2, '0'),
					`${date.getDate()}`.padStart(2, '0')
				].join('-')
			].join(' ');
		} else {
			const date = value.toDate();
			const [era, year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang!, gregorian);
			return [
				[
					era,
					[
						`${era === '西暦' ? date.getFullYear() : year}`.padStart(4, '0'),
						`${month}`.padStart(2, '0'),
						`${day}`.padStart(2, '0')
					].join('-')
				].join(' '),
				[
					'(',
					[
						'Gregory',
						[
							`${date.getFullYear()}`.padStart(4, '0'),
							`${date.getMonth() + 1}`.padStart(2, '0'),
							`${date.getDate()}`.padStart(2, '0')
						].join('-')
					].join(' '),
					')'
				].join('')
			].join(' ');
		}
	};

	return <HxFlex direction="dir-y" gCols={args.gCols ?? 6}>
		<HxLabel text={args.label}/>
		<HxDateTimePicker {...args} displayFormat={displayFormat}/>
	</HxFlex>;
};
