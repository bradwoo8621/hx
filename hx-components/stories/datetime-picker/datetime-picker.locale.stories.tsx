import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
import type {Dayjs} from 'dayjs';
// @ts-expect-error import React
import React, {type ReactNode} from 'react';
import {
	DateLocaleUtils,
	HxDateTimePicker,
	type HxDateTimePickerDisplayFormatFunc,
	type HxDateTimePickerProps,
	HxFlex,
	HxGrid,
	HxLabel,
	type HxLanguageCode
} from '../../src';

const meta: Meta<typeof HxDateTimePicker> = {
	title: 'Components/Basic/DateTimePicker/Locale',
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

export default meta;
type Story = StoryObj<typeof HxDateTimePicker>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isGregorian = (forceLang: HxLanguageCode | undefined): forceLang is undefined => {
	return forceLang == null || forceLang === 'gregory' || (forceLang.trim().length === 0);
};

const LocaleStory = <T extends object>(args: Omit<HxDateTimePickerProps<T>, 'displayFormat'> & { label: string }) => {
	const lang = args.forceLang as HxLanguageCode | undefined;
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
						`${year}`.padStart(4, '0'),
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

	return <HxFlex direction="dir-y" gCols={6}>
		<HxLabel text={args.label}/>
		<HxDateTimePicker {...args} displayFormat={displayFormat}/>
	</HxFlex>;
};

// ---------------------------------------------------------------------------
// Gregorian calendar
// ---------------------------------------------------------------------------

export const Gregory: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg" minWidth={800}>
			<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} forceLang="gregory"
			             label="#1 Month of A.D."/>
			<div/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1980/01/01'})} forceLang="gregory"
			             label="New Year's Day, some year, 20th century"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} forceLang="gregory"
			             label="Someday 2026"/>
		</HxGrid>;
	}
};

// ---------------------------------------------------------------------------
// Minguo (ROC) calendar — zh-TW
// ---------------------------------------------------------------------------

export const TwMinguo: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} forceLang="zh-TW"
			             label="#1 Month of A.D."/>
			<div/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/01/01'})} forceLang="zh-TW"
			             label="Last year has Gregorian reform dates"/>
			<div/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/14'})} forceLang="zh-TW"
			             label="Short months, aligned with Gregorian dates, #1"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/15'})} forceLang="zh-TW"
			             label="Short months, aligned with Gregorian dates, #2"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/12/31'})} forceLang="zh-TW"
			             label="Fully aligned with Gregorian dates"/>
			<div/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1900/01/01'})} forceLang="zh-TW"
			             label="New Year's Day, first year, 20th century"/>
			<div/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1911/12/31'})} forceLang="zh-TW"
			             label="Last day of 民國前"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1912/01/01'})} forceLang="zh-TW"
			             label="First day of 民國"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} forceLang="zh-TW" label="Someday 2026"/>
		</HxGrid>;
	}
};
