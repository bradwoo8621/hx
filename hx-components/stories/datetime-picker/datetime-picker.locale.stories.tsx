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
	type HxLanguageCode,
	HxSeparator
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
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0100/02/27'})} forceLang="zh-TW"
			             label="Julian Leap Year 0100 (ROC -1812)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0200/02/28'})} forceLang="zh-TW"
			             label="Julian Leap Year 0200 (ROC -1712)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0300/03/01'})} forceLang="zh-TW"
			             label="Julian Leap Year 0300 (ROC -1612)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0500/03/02'})} forceLang="zh-TW"
			             label="Julian Leap Year 0500 (ROC -1412)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0600/03/03'})} forceLang="zh-TW"
			             label="Julian Leap Year 0600 (ROC -1312)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0700/03/04'})} forceLang="zh-TW"
			             label="Julian Leap Year 0700 (ROC -1212)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0900/03/05'})} forceLang="zh-TW"
			             label="Julian Leap Year 0900 (ROC -1012)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1000/03/06'})} forceLang="zh-TW"
			             label="Julian Leap Year 1000 (ROC -912)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1100/03/07'})} forceLang="zh-TW"
			             label="Julian Leap Year 1100 (ROC -812)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1300/03/08'})} forceLang="zh-TW"
			             label="Julian Leap Year 1300 (ROC -612)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1400/03/09'})} forceLang="zh-TW"
			             label="Julian Leap Year 1400 (ROC -512)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1500/03/10'})} forceLang="zh-TW"
			             label="Julian Leap Year 1500 (ROC -412)"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/01/01'})} forceLang="zh-TW"
			             label="Last year has Gregorian reform dates"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/14'})} forceLang="zh-TW"
			             label="Short months, aligned with Gregorian dates, #1"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/15'})} forceLang="zh-TW"
			             label="Short months, aligned with Gregorian dates, #2"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/12/31'})} forceLang="zh-TW"
			             label="Fully aligned with Gregorian dates"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1900/01/01'})} forceLang="zh-TW"
			             label="New Year's Day, first year, 20th century"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1911/12/31'})} forceLang="zh-TW"
			             label="Last day of 民國前"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1912/01/01'})} forceLang="zh-TW"
			             label="First day of 民國"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} forceLang="zh-TW" label="Someday 2026"/>
		</HxGrid>;
	}
};

// ---------------------------------------------------------------------------
// Buddhist calendar — th
// ---------------------------------------------------------------------------

export const ThBuddhist: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} forceLang="th"
			             label="#1 Month of A.D. (B.E. 544)"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0100/02/27'})} forceLang="th"
			             label="Julian Leap Year 0100 (B.E. 643)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0200/02/28'})} forceLang="th"
			             label="Julian Leap Year 0200 (B.E. 743)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0300/03/01'})} forceLang="th"
			             label="Julian Leap Year 0300 (B.E. 843)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0500/03/02'})} forceLang="th"
			             label="Julian Leap Year 0500 (B.E. 1043)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0600/03/03'})} forceLang="th"
			             label="Julian Leap Year 0600 (B.E. 1143)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0700/03/04'})} forceLang="th"
			             label="Julian Leap Year 0700 (B.E. 1243)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0900/03/05'})} forceLang="th"
			             label="Julian Leap Year 0900 (B.E. 1443)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1000/03/06'})} forceLang="th"
			             label="Julian Leap Year 1000 (B.E. 1543)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1100/03/07'})} forceLang="th"
			             label="Julian Leap Year 1100 (B.E. 1643)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1300/03/08'})} forceLang="th"
			             label="Julian Leap Year 1300 (B.E. 1843)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1400/03/09'})} forceLang="th"
			             label="Julian Leap Year 1400 (B.E. 1943)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1500/03/10'})} forceLang="th"
			             label="Julian Leap Year 1500 (B.E. 2043)"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/01/01'})} forceLang="th"
			             label="Last year has Gregorian reform dates"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/14'})} forceLang="th"
			             label="Short months, aligned with Gregorian dates, #1"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/15'})} forceLang="th"
			             label="Short months, aligned with Gregorian dates, #2"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/12/31'})} forceLang="th"
			             label="Fully aligned with Gregorian dates"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2000/01/01'})} forceLang="th"
			             label="New Year's Day, B.E. 2543"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2020/01/01'})} forceLang="th"
			             label="New Year's Day, B.E. 2563 (Leap Year)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} forceLang="th"
			             label="Someday 2026 (B.E. 2569)"/>
		</HxGrid>;
	}
};
