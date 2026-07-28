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
			<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} forceLang="th-TH"
			             label="#1 Month of A.D. (B.E. 544)"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0100/02/27'})} forceLang="th-TH"
			             label="Julian Leap Year 0100 (B.E. 643)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0200/02/28'})} forceLang="th-TH"
			             label="Julian Leap Year 0200 (B.E. 743)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0300/03/01'})} forceLang="th-TH"
			             label="Julian Leap Year 0300 (B.E. 843)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0500/03/02'})} forceLang="th-TH"
			             label="Julian Leap Year 0500 (B.E. 1043)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0600/03/03'})} forceLang="th-TH"
			             label="Julian Leap Year 0600 (B.E. 1143)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0700/03/04'})} forceLang="th-TH"
			             label="Julian Leap Year 0700 (B.E. 1243)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0900/03/05'})} forceLang="th-TH"
			             label="Julian Leap Year 0900 (B.E. 1443)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1000/03/06'})} forceLang="th-TH"
			             label="Julian Leap Year 1000 (B.E. 1543)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1100/03/07'})} forceLang="th-TH"
			             label="Julian Leap Year 1100 (B.E. 1643)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1300/03/08'})} forceLang="th-TH"
			             label="Julian Leap Year 1300 (B.E. 1843)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1400/03/09'})} forceLang="th-TH"
			             label="Julian Leap Year 1400 (B.E. 1943)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1500/03/10'})} forceLang="th-TH"
			             label="Julian Leap Year 1500 (B.E. 2043)"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/01/01'})} forceLang="th-TH"
			             label="Last year has Gregorian reform dates"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/14'})} forceLang="th-TH"
			             label="Short months, aligned with Gregorian dates, #1"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/15'})} forceLang="th-TH"
			             label="Short months, aligned with Gregorian dates, #2"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/12/31'})} forceLang="th-TH"
			             label="Fully aligned with Gregorian dates"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2000/01/01'})} forceLang="th-TH"
			             label="New Year's Day, B.E. 2543"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2020/01/01'})} forceLang="th-TH"
			             label="New Year's Day, B.E. 2563 (Leap Year)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} forceLang="th-TH"
			             label="Someday 2026 (B.E. 2569)"/>
		</HxGrid>;
	}
};

// ---------------------------------------------------------------------------
// Japanese calendar — ja-JP
// ---------------------------------------------------------------------------

export const JaJapanese: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} forceLang="ja-JP"
			             label="#1 Month of A.D."/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0100/02/27'})} forceLang="ja-JP"
			             label="Julian Leap Year 0100"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0200/02/28'})} forceLang="ja-JP"
			             label="Julian Leap Year 0200"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0300/03/01'})} forceLang="ja-JP"
			             label="Julian Leap Year 0300"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0500/03/02'})} forceLang="ja-JP"
			             label="Julian Leap Year 0500"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0600/03/03'})} forceLang="ja-JP"
			             label="Julian Leap Year 0600"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0700/03/04'})} forceLang="ja-JP"
			             label="Julian Leap Year 0700"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0900/03/05'})} forceLang="ja-JP"
			             label="Julian Leap Year 0900"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1000/03/06'})} forceLang="ja-JP"
			             label="Julian Leap Year 1000"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1100/03/07'})} forceLang="ja-JP"
			             label="Julian Leap Year 1100"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1300/03/08'})} forceLang="ja-JP"
			             label="Julian Leap Year 1300"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1400/03/09'})} forceLang="ja-JP"
			             label="Julian Leap Year 1400"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1500/03/10'})} forceLang="ja-JP"
			             label="Julian Leap Year 1500"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/01/01'})} forceLang="ja-JP"
			             label="Last year has Gregorian reform dates"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/14'})} forceLang="ja-JP"
			             label="Short months, aligned with Gregorian dates, #1"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/15'})} forceLang="ja-JP"
			             label="Short months, aligned with Gregorian dates, #2"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/12/31'})} forceLang="ja-JP"
			             label="Fully aligned with Gregorian dates"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2019/05/01'})} forceLang="ja-JP"
			             label="First day of 令和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} forceLang="ja-JP"
			             label="Someday 2026 (令和 8)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1989/01/08'})} forceLang="ja-JP"
			             label="First day of 平成"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2019/04/30'})} forceLang="ja-JP"
			             label="Last day of 平成"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1926/12/25'})} forceLang="ja-JP"
			             label="First day of 昭和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1989/01/07'})} forceLang="ja-JP"
			             label="Last day of 昭和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1912/07/30'})} forceLang="ja-JP"
			             label="First day of 大正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1926/12/24'})} forceLang="ja-JP"
			             label="Last day of 大正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1868/10/23'})} forceLang="ja-JP"
			             label="First day of 明治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1912/07/29'})} forceLang="ja-JP"
			             label="Last day of 明治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1865/04/07'})} forceLang="ja-JP"
			             label="First day of 慶応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1868/10/22'})} forceLang="ja-JP"
			             label="Last day of 慶応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1864/02/20'})} forceLang="ja-JP"
			             label="First day of 元治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1865/04/06'})} forceLang="ja-JP"
			             label="Last day of 元治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1861/02/19'})} forceLang="ja-JP"
			             label="First day of 文久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1864/02/19'})} forceLang="ja-JP"
			             label="Last day of 文久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1860/03/18'})} forceLang="ja-JP"
			             label="First day of 万延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1861/02/18'})} forceLang="ja-JP"
			             label="Last day of 万延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1854/11/27'})} forceLang="ja-JP"
			             label="First day of 安政"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1860/03/17'})} forceLang="ja-JP"
			             label="Last day of 安政"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1848/02/28'})} forceLang="ja-JP"
			             label="First day of 嘉永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1854/11/26'})} forceLang="ja-JP"
			             label="Last day of 嘉永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1844/12/02'})} forceLang="ja-JP"
			             label="First day of 弘化"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1848/02/27'})} forceLang="ja-JP"
			             label="Last day of 弘化"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1830/12/10'})} forceLang="ja-JP"
			             label="First day of 天保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1844/12/01'})} forceLang="ja-JP"
			             label="Last day of 天保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1818/04/22'})} forceLang="ja-JP"
			             label="First day of 文政"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1830/12/09'})} forceLang="ja-JP"
			             label="Last day of 文政"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1804/02/11'})} forceLang="ja-JP"
			             label="First day of 文化"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1818/04/21'})} forceLang="ja-JP"
			             label="Last day of 文化"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1801/02/05'})} forceLang="ja-JP"
			             label="First day of 享和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1804/02/10'})} forceLang="ja-JP"
			             label="Last day of 享和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1789/01/25'})} forceLang="ja-JP"
			             label="First day of 寛政"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1801/02/04'})} forceLang="ja-JP"
			             label="Last day of 寛政"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1781/04/02'})} forceLang="ja-JP"
			             label="First day of 天明"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1789/01/24'})} forceLang="ja-JP"
			             label="Last day of 天明"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1772/11/16'})} forceLang="ja-JP"
			             label="First day of 安永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1781/04/01'})} forceLang="ja-JP"
			             label="Last day of 安永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1764/06/02'})} forceLang="ja-JP"
			             label="First day of 明和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1772/11/15'})} forceLang="ja-JP"
			             label="Last day of 明和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1751/10/27'})} forceLang="ja-JP"
			             label="First day of 宝暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1764/06/01'})} forceLang="ja-JP"
			             label="Last day of 宝暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1748/07/12'})} forceLang="ja-JP"
			             label="First day of 寛延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1751/10/26'})} forceLang="ja-JP"
			             label="Last day of 寛延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1744/02/21'})} forceLang="ja-JP"
			             label="First day of 延享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1748/07/11'})} forceLang="ja-JP"
			             label="Last day of 延享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1741/02/27'})} forceLang="ja-JP"
			             label="First day of 寛保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1744/02/20'})} forceLang="ja-JP"
			             label="Last day of 寛保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1736/04/28'})} forceLang="ja-JP"
			             label="First day of 元文"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1741/02/26'})} forceLang="ja-JP"
			             label="Last day of 元文"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1716/06/22'})} forceLang="ja-JP"
			             label="First day of 享保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1736/04/27'})} forceLang="ja-JP"
			             label="Last day of 享保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1711/04/25'})} forceLang="ja-JP"
			             label="First day of 正徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1716/06/21'})} forceLang="ja-JP"
			             label="Last day of 正徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1704/03/13'})} forceLang="ja-JP"
			             label="First day of 宝永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1711/04/24'})} forceLang="ja-JP"
			             label="Last day of 宝永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1688/09/30'})} forceLang="ja-JP"
			             label="First day of 元禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1704/03/12'})} forceLang="ja-JP"
			             label="Last day of 元禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1684/02/21'})} forceLang="ja-JP"
			             label="First day of 貞享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1688/09/29'})} forceLang="ja-JP"
			             label="Last day of 貞享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1681/09/29'})} forceLang="ja-JP"
			             label="First day of 天和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1684/02/20'})} forceLang="ja-JP"
			             label="Last day of 天和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1673/09/21'})} forceLang="ja-JP"
			             label="First day of 延宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1681/09/28'})} forceLang="ja-JP"
			             label="Last day of 延宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1661/04/25'})} forceLang="ja-JP"
			             label="First day of 寛文"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1673/09/20'})} forceLang="ja-JP"
			             label="Last day of 寛文"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1658/07/23'})} forceLang="ja-JP"
			             label="First day of 万治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1661/04/24'})} forceLang="ja-JP"
			             label="Last day of 万治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1655/04/13'})} forceLang="ja-JP"
			             label="First day of 明暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1658/07/22'})} forceLang="ja-JP"
			             label="Last day of 明暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1652/09/18'})} forceLang="ja-JP"
			             label="First day of 承応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1655/04/12'})} forceLang="ja-JP"
			             label="Last day of 承応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1648/02/15'})} forceLang="ja-JP"
			             label="First day of 慶安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1652/09/17'})} forceLang="ja-JP"
			             label="Last day of 慶安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1644/12/16'})} forceLang="ja-JP"
			             label="First day of 正保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1648/02/14'})} forceLang="ja-JP"
			             label="Last day of 正保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1624/03/01'})} forceLang="ja-JP"
			             label="First day of 寛永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1644/12/15'})} forceLang="ja-JP"
			             label="Last day of 寛永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1615/07/13'})} forceLang="ja-JP"
			             label="First day of 元和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1624/02/29'})} forceLang="ja-JP"
			             label="Last day of 元和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1596/10/27'})} forceLang="ja-JP"
			             label="First day of 慶長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1615/07/12'})} forceLang="ja-JP"
			             label="Last day of 慶長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1592/12/08'})} forceLang="ja-JP"
			             label="First day of 文禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1596/10/26'})} forceLang="ja-JP"
			             label="Last day of 文禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1573/08/07'})} forceLang="ja-JP"
			             label="First day of 天正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1592/12/07'})} forceLang="ja-JP"
			             label="Last day of 天正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1570/05/03'})} forceLang="ja-JP"
			             label="First day of 元亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1573/08/06'})} forceLang="ja-JP"
			             label="Last day of 元亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1558/03/10'})} forceLang="ja-JP"
			             label="First day of 永禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1570/05/02'})} forceLang="ja-JP"
			             label="Last day of 永禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1555/11/02'})} forceLang="ja-JP"
			             label="First day of 弘治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1558/03/09'})} forceLang="ja-JP"
			             label="Last day of 弘治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1532/08/08'})} forceLang="ja-JP"
			             label="First day of 天文"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1555/11/01'})} forceLang="ja-JP"
			             label="Last day of 天文"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1528/08/30'})} forceLang="ja-JP"
			             label="First day of 享禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1532/08/07'})} forceLang="ja-JP"
			             label="Last day of 享禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1521/09/02'})} forceLang="ja-JP"
			             label="First day of 大永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1528/08/29'})} forceLang="ja-JP"
			             label="Last day of 大永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1504/03/11'})} forceLang="ja-JP"
			             label="First day of 永正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1521/09/01'})} forceLang="ja-JP"
			             label="Last day of 永正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1501/03/11'})} forceLang="ja-JP"
			             label="First day of 文亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1504/03/10'})} forceLang="ja-JP"
			             label="Last day of 文亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1492/07/28'})} forceLang="ja-JP"
			             label="First day of 明応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1501/03/10'})} forceLang="ja-JP"
			             label="Last day of 明応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1489/08/30'})} forceLang="ja-JP"
			             label="First day of 延徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1492/07/27'})} forceLang="ja-JP"
			             label="Last day of 延徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1487/08/07'})} forceLang="ja-JP"
			             label="First day of 長享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1489/08/29'})} forceLang="ja-JP"
			             label="Last day of 長享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1469/05/07'})} forceLang="ja-JP"
			             label="First day of 文明"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1487/08/06'})} forceLang="ja-JP"
			             label="Last day of 文明"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1467/03/12'})} forceLang="ja-JP"
			             label="First day of 応仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1469/05/06'})} forceLang="ja-JP"
			             label="Last day of 応仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1466/03/09'})} forceLang="ja-JP"
			             label="First day of 文正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1467/03/11'})} forceLang="ja-JP"
			             label="Last day of 文正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1460/12/30'})} forceLang="ja-JP"
			             label="First day of 寛正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1466/03/08'})} forceLang="ja-JP"
			             label="Last day of 寛正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1457/10/07'})} forceLang="ja-JP"
			             label="First day of 長禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1460/12/29'})} forceLang="ja-JP"
			             label="Last day of 長禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1455/08/03'})} forceLang="ja-JP"
			             label="First day of 康正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1457/10/06'})} forceLang="ja-JP"
			             label="Last day of 康正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1452/08/03'})} forceLang="ja-JP"
			             label="First day of 享徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1455/08/02'})} forceLang="ja-JP"
			             label="Last day of 享徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1449/08/06'})} forceLang="ja-JP"
			             label="First day of 宝徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1452/08/02'})} forceLang="ja-JP"
			             label="Last day of 宝徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1444/02/14'})} forceLang="ja-JP"
			             label="First day of 文安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1449/08/05'})} forceLang="ja-JP"
			             label="Last day of 文安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1441/02/26'})} forceLang="ja-JP"
			             label="First day of 嘉吉"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1444/02/13'})} forceLang="ja-JP"
			             label="Last day of 嘉吉"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1429/09/14'})} forceLang="ja-JP"
			             label="First day of 永享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1441/02/25'})} forceLang="ja-JP"
			             label="Last day of 永享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1428/05/06'})} forceLang="ja-JP"
			             label="First day of 正長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1429/09/13'})} forceLang="ja-JP"
			             label="Last day of 正長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1394/07/13'})} forceLang="ja-JP"
			             label="First day of 応永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1428/05/05'})} forceLang="ja-JP"
			             label="Last day of 応永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1390/04/03'})} forceLang="ja-JP"
			             label="First day of 明徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1394/07/12'})} forceLang="ja-JP"
			             label="Last day of 明徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1389/02/17'})} forceLang="ja-JP"
			             label="First day of 康応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1390/04/02'})} forceLang="ja-JP"
			             label="Last day of 康応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1387/08/31'})} forceLang="ja-JP"
			             label="First day of 嘉慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1389/02/16'})} forceLang="ja-JP"
			             label="Last day of 嘉慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1387/08/30'})} forceLang="ja-JP"
			             label="First day of 至徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1387/08/30'})} forceLang="ja-JP"
			             label="Last day of 至徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1384/05/06'})} forceLang="ja-JP"
			             label="First day of 元中"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1387/08/29'})} forceLang="ja-JP"
			             label="Last day of 元中"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1381/02/18'})} forceLang="ja-JP"
			             label="First day of 弘和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1384/05/05'})} forceLang="ja-JP"
			             label="Last day of 弘和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1379/03/30'})} forceLang="ja-JP"
			             label="First day of 康暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1381/02/17'})} forceLang="ja-JP"
			             label="Last day of 康暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1375/06/04'})} forceLang="ja-JP"
			             label="First day of 天授"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1379/03/29'})} forceLang="ja-JP"
			             label="Last day of 天授"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1372/04/09'})} forceLang="ja-JP"
			             label="First day of 文中"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1375/06/03'})} forceLang="ja-JP"
			             label="Last day of 文中"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1370/08/01'})} forceLang="ja-JP"
			             label="First day of 建徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1372/04/08'})} forceLang="ja-JP"
			             label="Last day of 建徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1346/12/16'})} forceLang="ja-JP"
			             label="First day of 正平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1370/07/31'})} forceLang="ja-JP"
			             label="Last day of 正平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1340/05/06'})} forceLang="ja-JP"
			             label="First day of 興国"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1346/12/15'})} forceLang="ja-JP"
			             label="Last day of 興国"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1336/03/08'})} forceLang="ja-JP"
			             label="First day of 延元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1340/05/05'})} forceLang="ja-JP"
			             label="Last day of 延元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1334/02/06'})} forceLang="ja-JP"
			             label="First day of 建武"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1336/03/07'})} forceLang="ja-JP"
			             label="Last day of 建武"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1331/08/17'})} forceLang="ja-JP"
			             label="First day of 元弘"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1334/02/05'})} forceLang="ja-JP"
			             label="Last day of 元弘"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1329/09/06'})} forceLang="ja-JP"
			             label="First day of 元徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1331/08/16'})} forceLang="ja-JP"
			             label="Last day of 元徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1326/05/04'})} forceLang="ja-JP"
			             label="First day of 嘉暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1329/09/05'})} forceLang="ja-JP"
			             label="Last day of 嘉暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1324/12/17'})} forceLang="ja-JP"
			             label="First day of 正中"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1326/05/03'})} forceLang="ja-JP"
			             label="Last day of 正中"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1321/03/03'})} forceLang="ja-JP"
			             label="First day of 元亨"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1324/12/16'})} forceLang="ja-JP"
			             label="Last day of 元亨"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1319/05/06'})} forceLang="ja-JP"
			             label="First day of 元応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1321/03/02'})} forceLang="ja-JP"
			             label="Last day of 元応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1317/02/11'})} forceLang="ja-JP"
			             label="First day of 文保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1319/05/05'})} forceLang="ja-JP"
			             label="Last day of 文保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1312/03/28'})} forceLang="ja-JP"
			             label="First day of 正和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1317/02/10'})} forceLang="ja-JP"
			             label="Last day of 正和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1311/05/06'})} forceLang="ja-JP"
			             label="First day of 応長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1312/03/27'})} forceLang="ja-JP"
			             label="Last day of 応長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1308/10/17'})} forceLang="ja-JP"
			             label="First day of 延慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1311/05/05'})} forceLang="ja-JP"
			             label="Last day of 延慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1306/12/22'})} forceLang="ja-JP"
			             label="First day of 徳治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1308/10/16'})} forceLang="ja-JP"
			             label="Last day of 徳治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1303/08/13'})} forceLang="ja-JP"
			             label="First day of 嘉元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1306/12/21'})} forceLang="ja-JP"
			             label="Last day of 嘉元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1302/11/29'})} forceLang="ja-JP"
			             label="First day of 乾元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1303/08/12'})} forceLang="ja-JP"
			             label="Last day of 乾元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1299/05/02'})} forceLang="ja-JP"
			             label="First day of 正安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1302/11/28'})} forceLang="ja-JP"
			             label="Last day of 正安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1293/08/12'})} forceLang="ja-JP"
			             label="First day of 永仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1299/05/01'})} forceLang="ja-JP"
			             label="Last day of 永仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1288/05/05'})} forceLang="ja-JP"
			             label="First day of 正応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1293/08/11'})} forceLang="ja-JP"
			             label="Last day of 正応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1278/03/08'})} forceLang="ja-JP"
			             label="First day of 弘安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1288/05/04'})} forceLang="ja-JP"
			             label="Last day of 弘安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1275/05/02'})} forceLang="ja-JP"
			             label="First day of 建治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1278/03/07'})} forceLang="ja-JP"
			             label="Last day of 建治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1264/03/06'})} forceLang="ja-JP"
			             label="First day of 文永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1275/05/01'})} forceLang="ja-JP"
			             label="Last day of 文永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1261/02/27'})} forceLang="ja-JP"
			             label="First day of 弘長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1264/03/05'})} forceLang="ja-JP"
			             label="Last day of 弘長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1260/04/20'})} forceLang="ja-JP"
			             label="First day of 文応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1261/02/26'})} forceLang="ja-JP"
			             label="Last day of 文応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1259/04/02'})} forceLang="ja-JP"
			             label="First day of 正元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1260/04/19'})} forceLang="ja-JP"
			             label="Last day of 正元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1257/03/21'})} forceLang="ja-JP"
			             label="First day of 正嘉"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1259/04/01'})} forceLang="ja-JP"
			             label="Last day of 正嘉"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1256/10/12'})} forceLang="ja-JP"
			             label="First day of 康元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1257/03/20'})} forceLang="ja-JP"
			             label="Last day of 康元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1249/03/25'})} forceLang="ja-JP"
			             label="First day of 建長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1256/10/11'})} forceLang="ja-JP"
			             label="Last day of 建長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1247/03/07'})} forceLang="ja-JP"
			             label="First day of 宝治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1249/03/24'})} forceLang="ja-JP"
			             label="Last day of 宝治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1243/03/05'})} forceLang="ja-JP"
			             label="First day of 寛元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1247/03/06'})} forceLang="ja-JP"
			             label="Last day of 寛元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1240/07/23'})} forceLang="ja-JP"
			             label="First day of 仁治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1243/03/04'})} forceLang="ja-JP"
			             label="Last day of 仁治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1239/02/14'})} forceLang="ja-JP"
			             label="First day of 延応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1240/07/22'})} forceLang="ja-JP"
			             label="Last day of 延応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1238/11/30'})} forceLang="ja-JP"
			             label="First day of 暦仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1239/02/13'})} forceLang="ja-JP"
			             label="Last day of 暦仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1235/09/26'})} forceLang="ja-JP"
			             label="First day of 嘉禎"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1238/11/29'})} forceLang="ja-JP"
			             label="Last day of 嘉禎"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1234/11/12'})} forceLang="ja-JP"
			             label="First day of 文暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1235/09/25'})} forceLang="ja-JP"
			             label="Last day of 文暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1233/04/22'})} forceLang="ja-JP"
			             label="First day of 天福"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1234/11/11'})} forceLang="ja-JP"
			             label="Last day of 天福"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1232/04/09'})} forceLang="ja-JP"
			             label="First day of 貞永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1233/04/21'})} forceLang="ja-JP"
			             label="Last day of 貞永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1229/03/12'})} forceLang="ja-JP"
			             label="First day of 寛喜"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1232/04/08'})} forceLang="ja-JP"
			             label="Last day of 寛喜"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1227/12/17'})} forceLang="ja-JP"
			             label="First day of 安貞"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1229/03/11'})} forceLang="ja-JP"
			             label="Last day of 安貞"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1225/04/27'})} forceLang="ja-JP"
			             label="First day of 嘉禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1227/12/16'})} forceLang="ja-JP"
			             label="Last day of 嘉禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1224/11/27'})} forceLang="ja-JP"
			             label="First day of 元仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1225/04/26'})} forceLang="ja-JP"
			             label="Last day of 元仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1222/04/20'})} forceLang="ja-JP"
			             label="First day of 貞応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1224/11/26'})} forceLang="ja-JP"
			             label="Last day of 貞応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1219/04/19'})} forceLang="ja-JP"
			             label="First day of 承久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1222/04/19'})} forceLang="ja-JP"
			             label="Last day of 承久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1213/12/13'})} forceLang="ja-JP"
			             label="First day of 建保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1219/04/18'})} forceLang="ja-JP"
			             label="Last day of 建保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1211/03/16'})} forceLang="ja-JP"
			             label="First day of 建暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1213/12/12'})} forceLang="ja-JP"
			             label="Last day of 建暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1207/11/01'})} forceLang="ja-JP"
			             label="First day of 承元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1211/03/15'})} forceLang="ja-JP"
			             label="Last day of 承元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1206/05/04'})} forceLang="ja-JP"
			             label="First day of 建永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1207/10/31'})} forceLang="ja-JP"
			             label="Last day of 建永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1204/02/27'})} forceLang="ja-JP"
			             label="First day of 元久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1206/05/03'})} forceLang="ja-JP"
			             label="Last day of 元久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1201/02/20'})} forceLang="ja-JP"
			             label="First day of 建仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1204/02/26'})} forceLang="ja-JP"
			             label="Last day of 建仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1199/05/04'})} forceLang="ja-JP"
			             label="First day of 正治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1201/02/19'})} forceLang="ja-JP"
			             label="Last day of 正治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1190/04/18'})} forceLang="ja-JP"
			             label="First day of 建久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1199/05/03'})} forceLang="ja-JP"
			             label="Last day of 建久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1185/08/21'})} forceLang="ja-JP"
			             label="First day of 文治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1190/04/17'})} forceLang="ja-JP"
			             label="Last day of 文治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1184/04/23'})} forceLang="ja-JP"
			             label="First day of 元暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1185/08/20'})} forceLang="ja-JP"
			             label="Last day of 元暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1182/06/03'})} forceLang="ja-JP"
			             label="First day of 寿永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1184/04/22'})} forceLang="ja-JP"
			             label="Last day of 寿永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1181/07/21'})} forceLang="ja-JP"
			             label="First day of 養和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1182/06/02'})} forceLang="ja-JP"
			             label="Last day of 養和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1177/08/11'})} forceLang="ja-JP"
			             label="First day of 治承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1181/07/20'})} forceLang="ja-JP"
			             label="Last day of 治承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1175/08/04'})} forceLang="ja-JP"
			             label="First day of 安元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1177/08/10'})} forceLang="ja-JP"
			             label="Last day of 安元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1171/04/28'})} forceLang="ja-JP"
			             label="First day of 承安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1175/08/03'})} forceLang="ja-JP"
			             label="Last day of 承安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1169/04/15'})} forceLang="ja-JP"
			             label="First day of 嘉応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1171/04/27'})} forceLang="ja-JP"
			             label="Last day of 嘉応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1166/09/03'})} forceLang="ja-JP"
			             label="First day of 仁安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1169/04/14'})} forceLang="ja-JP"
			             label="Last day of 仁安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1165/06/12'})} forceLang="ja-JP"
			             label="First day of 永万"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1166/09/02'})} forceLang="ja-JP"
			             label="Last day of 永万"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1163/04/05'})} forceLang="ja-JP"
			             label="First day of 長寛"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1165/06/11'})} forceLang="ja-JP"
			             label="Last day of 長寛"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1161/09/11'})} forceLang="ja-JP"
			             label="First day of 応保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1163/04/04'})} forceLang="ja-JP"
			             label="Last day of 応保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1160/01/17'})} forceLang="ja-JP"
			             label="First day of 永暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1161/09/10'})} forceLang="ja-JP"
			             label="Last day of 永暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1159/04/27'})} forceLang="ja-JP"
			             label="First day of 平治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1160/01/16'})} forceLang="ja-JP"
			             label="Last day of 平治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1156/05/04'})} forceLang="ja-JP"
			             label="First day of 保元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1159/04/26'})} forceLang="ja-JP"
			             label="Last day of 保元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1154/11/04'})} forceLang="ja-JP"
			             label="First day of 久寿"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1156/05/03'})} forceLang="ja-JP"
			             label="Last day of 久寿"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1151/02/02'})} forceLang="ja-JP"
			             label="First day of 仁平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1154/11/03'})} forceLang="ja-JP"
			             label="Last day of 仁平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1145/07/29'})} forceLang="ja-JP"
			             label="First day of 久安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1151/02/01'})} forceLang="ja-JP"
			             label="Last day of 久安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1144/03/01'})} forceLang="ja-JP"
			             label="First day of 天養"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1145/07/28'})} forceLang="ja-JP"
			             label="Last day of 天養"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1142/05/05'})} forceLang="ja-JP"
			             label="First day of 康治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1144/02/29'})} forceLang="ja-JP"
			             label="Last day of 康治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1141/07/17'})} forceLang="ja-JP"
			             label="First day of 永治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1142/05/04'})} forceLang="ja-JP"
			             label="Last day of 永治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1135/05/04'})} forceLang="ja-JP"
			             label="First day of 保延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1141/07/16'})} forceLang="ja-JP"
			             label="Last day of 保延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1132/08/18'})} forceLang="ja-JP"
			             label="First day of 長承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1135/05/03'})} forceLang="ja-JP"
			             label="Last day of 長承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1131/02/05'})} forceLang="ja-JP"
			             label="First day of 天承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1132/08/17'})} forceLang="ja-JP"
			             label="Last day of 天承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1126/01/29'})} forceLang="ja-JP"
			             label="First day of 大治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1131/02/04'})} forceLang="ja-JP"
			             label="Last day of 大治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1124/04/10'})} forceLang="ja-JP"
			             label="First day of 天治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1126/01/28'})} forceLang="ja-JP"
			             label="Last day of 天治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1120/04/17'})} forceLang="ja-JP"
			             label="First day of 保安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1124/04/09'})} forceLang="ja-JP"
			             label="Last day of 保安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1118/04/10'})} forceLang="ja-JP"
			             label="First day of 元永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1120/04/16'})} forceLang="ja-JP"
			             label="Last day of 元永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1113/07/20'})} forceLang="ja-JP"
			             label="First day of 永久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1118/04/09'})} forceLang="ja-JP"
			             label="Last day of 永久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1110/07/20'})} forceLang="ja-JP"
			             label="First day of 天永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1113/07/19'})} forceLang="ja-JP"
			             label="Last day of 天永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1108/08/10'})} forceLang="ja-JP"
			             label="First day of 天仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1110/07/19'})} forceLang="ja-JP"
			             label="Last day of 天仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1106/04/16'})} forceLang="ja-JP"
			             label="First day of 嘉承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1108/08/09'})} forceLang="ja-JP"
			             label="Last day of 嘉承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1104/02/17'})} forceLang="ja-JP"
			             label="First day of 長治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1106/04/15'})} forceLang="ja-JP"
			             label="Last day of 長治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1099/09/03'})} forceLang="ja-JP"
			             label="First day of 康和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1104/02/16'})} forceLang="ja-JP"
			             label="Last day of 康和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1097/11/27'})} forceLang="ja-JP"
			             label="First day of 承徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1099/09/02'})} forceLang="ja-JP"
			             label="Last day of 承徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1096/12/23'})} forceLang="ja-JP"
			             label="First day of 永長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1097/11/26'})} forceLang="ja-JP"
			             label="Last day of 永長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1094/12/21'})} forceLang="ja-JP"
			             label="First day of 嘉保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1096/12/22'})} forceLang="ja-JP"
			             label="Last day of 嘉保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1087/04/13'})} forceLang="ja-JP"
			             label="First day of 寛治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1094/12/20'})} forceLang="ja-JP"
			             label="Last day of 寛治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1084/02/13'})} forceLang="ja-JP"
			             label="First day of 応徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1087/04/12'})} forceLang="ja-JP"
			             label="Last day of 応徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1081/02/16'})} forceLang="ja-JP"
			             label="First day of 永保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1084/02/12'})} forceLang="ja-JP"
			             label="Last day of 永保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1077/11/23'})} forceLang="ja-JP"
			             label="First day of 承暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1081/02/15'})} forceLang="ja-JP"
			             label="Last day of 承暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1074/08/29'})} forceLang="ja-JP"
			             label="First day of 承保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1077/11/22'})} forceLang="ja-JP"
			             label="Last day of 承保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1069/04/19'})} forceLang="ja-JP"
			             label="First day of 延久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1074/08/28'})} forceLang="ja-JP"
			             label="Last day of 延久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1065/08/08'})} forceLang="ja-JP"
			             label="First day of 治暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1069/04/18'})} forceLang="ja-JP"
			             label="Last day of 治暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1058/09/04'})} forceLang="ja-JP"
			             label="First day of 康平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1065/08/07'})} forceLang="ja-JP"
			             label="Last day of 康平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1053/01/17'})} forceLang="ja-JP"
			             label="First day of 天喜"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1058/09/03'})} forceLang="ja-JP"
			             label="Last day of 天喜"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1046/04/20'})} forceLang="ja-JP"
			             label="First day of 永承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1053/01/16'})} forceLang="ja-JP"
			             label="Last day of 永承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1044/11/30'})} forceLang="ja-JP"
			             label="First day of 寛徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1046/04/19'})} forceLang="ja-JP"
			             label="Last day of 寛徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1040/11/16'})} forceLang="ja-JP"
			             label="First day of 長久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1044/11/29'})} forceLang="ja-JP"
			             label="Last day of 長久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1037/04/27'})} forceLang="ja-JP"
			             label="First day of 長暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1040/11/15'})} forceLang="ja-JP"
			             label="Last day of 長暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1028/07/31'})} forceLang="ja-JP"
			             label="First day of 長元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1037/04/26'})} forceLang="ja-JP"
			             label="Last day of 長元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1024/07/19'})} forceLang="ja-JP"
			             label="First day of 万寿"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1028/07/30'})} forceLang="ja-JP"
			             label="Last day of 万寿"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1021/02/08'})} forceLang="ja-JP"
			             label="First day of 治安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1024/07/18'})} forceLang="ja-JP"
			             label="Last day of 治安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1017/04/29'})} forceLang="ja-JP"
			             label="First day of 寛仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1021/02/07'})} forceLang="ja-JP"
			             label="Last day of 寛仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1012/12/31'})} forceLang="ja-JP"
			             label="First day of 長和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1017/04/28'})} forceLang="ja-JP"
			             label="Last day of 長和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1004/07/26'})} forceLang="ja-JP"
			             label="First day of 寛弘"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1012/12/30'})} forceLang="ja-JP"
			             label="Last day of 寛弘"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0999/01/18'})} forceLang="ja-JP"
			             label="First day of 長保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1004/07/25'})} forceLang="ja-JP"
			             label="Last day of 長保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0995/02/27'})} forceLang="ja-JP"
			             label="First day of 長徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0999/01/17'})} forceLang="ja-JP"
			             label="Last day of 長徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0990/11/12'})} forceLang="ja-JP"
			             label="First day of 正暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0995/02/26'})} forceLang="ja-JP"
			             label="Last day of 正暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0989/08/13'})} forceLang="ja-JP"
			             label="First day of 永祚"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0990/11/11'})} forceLang="ja-JP"
			             label="Last day of 永祚"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0987/04/10'})} forceLang="ja-JP"
			             label="First day of 永延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0989/08/12'})} forceLang="ja-JP"
			             label="Last day of 永延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0985/05/02'})} forceLang="ja-JP"
			             label="First day of 寛和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0987/04/09'})} forceLang="ja-JP"
			             label="Last day of 寛和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0983/04/20'})} forceLang="ja-JP"
			             label="First day of 永観"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0985/05/01'})} forceLang="ja-JP"
			             label="Last day of 永観"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0978/12/04'})} forceLang="ja-JP"
			             label="First day of 天元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0983/04/19'})} forceLang="ja-JP"
			             label="Last day of 天元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0976/07/18'})} forceLang="ja-JP"
			             label="First day of 貞元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0978/12/03'})} forceLang="ja-JP"
			             label="Last day of 貞元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0973/12/25'})} forceLang="ja-JP"
			             label="First day of 天延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0976/07/17'})} forceLang="ja-JP"
			             label="Last day of 天延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0970/03/30'})} forceLang="ja-JP"
			             label="First day of 天禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0973/12/24'})} forceLang="ja-JP"
			             label="Last day of 天禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0968/08/18'})} forceLang="ja-JP"
			             label="First day of 安和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0970/03/29'})} forceLang="ja-JP"
			             label="Last day of 安和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0964/07/15'})} forceLang="ja-JP"
			             label="First day of 康保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0968/08/17'})} forceLang="ja-JP"
			             label="Last day of 康保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0961/02/21'})} forceLang="ja-JP"
			             label="First day of 応和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0964/07/14'})} forceLang="ja-JP"
			             label="Last day of 応和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0957/11/01'})} forceLang="ja-JP"
			             label="First day of 天徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0961/02/20'})} forceLang="ja-JP"
			             label="Last day of 天徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0947/04/27'})} forceLang="ja-JP"
			             label="First day of 天暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0957/10/31'})} forceLang="ja-JP"
			             label="Last day of 天暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0938/05/27'})} forceLang="ja-JP"
			             label="First day of 天慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0947/04/26'})} forceLang="ja-JP"
			             label="Last day of 天慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0931/05/01'})} forceLang="ja-JP"
			             label="First day of 承平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0938/05/26'})} forceLang="ja-JP"
			             label="Last day of 承平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0923/04/16'})} forceLang="ja-JP"
			             label="First day of 延長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0931/04/30'})} forceLang="ja-JP"
			             label="Last day of 延長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0901/07/20'})} forceLang="ja-JP"
			             label="First day of 延喜"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0923/04/15'})} forceLang="ja-JP"
			             label="Last day of 延喜"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0898/04/30'})} forceLang="ja-JP"
			             label="First day of 昌泰"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0901/07/19'})} forceLang="ja-JP"
			             label="Last day of 昌泰"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0889/05/01'})} forceLang="ja-JP"
			             label="First day of 寛平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0898/04/29'})} forceLang="ja-JP"
			             label="Last day of 寛平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0885/02/25'})} forceLang="ja-JP"
			             label="First day of 仁和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0889/04/30'})} forceLang="ja-JP"
			             label="Last day of 仁和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0877/04/20'})} forceLang="ja-JP"
			             label="First day of 元慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0885/02/24'})} forceLang="ja-JP"
			             label="Last day of 元慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0859/04/19'})} forceLang="ja-JP"
			             label="First day of 貞観"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0877/04/19'})} forceLang="ja-JP"
			             label="Last day of 貞観"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0857/02/25'})} forceLang="ja-JP"
			             label="First day of 天安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0859/04/18'})} forceLang="ja-JP"
			             label="Last day of 天安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0854/12/04'})} forceLang="ja-JP"
			             label="First day of 斉衡"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0857/02/24'})} forceLang="ja-JP"
			             label="Last day of 斉衡"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0851/05/02'})} forceLang="ja-JP"
			             label="First day of 仁寿"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0854/12/03'})} forceLang="ja-JP"
			             label="Last day of 仁寿"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0848/06/17'})} forceLang="ja-JP"
			             label="First day of 嘉祥"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0851/05/01'})} forceLang="ja-JP"
			             label="Last day of 嘉祥"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0834/01/07'})} forceLang="ja-JP"
			             label="First day of 承和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0848/06/16'})} forceLang="ja-JP"
			             label="Last day of 承和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0824/01/09'})} forceLang="ja-JP"
			             label="First day of 天長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0834/01/06'})} forceLang="ja-JP"
			             label="Last day of 天長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0810/09/23'})} forceLang="ja-JP"
			             label="First day of 弘仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0824/01/08'})} forceLang="ja-JP"
			             label="Last day of 弘仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0806/05/22'})} forceLang="ja-JP"
			             label="First day of 大同"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0810/09/22'})} forceLang="ja-JP"
			             label="Last day of 大同"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0782/08/23'})} forceLang="ja-JP"
			             label="First day of 延暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0806/05/21'})} forceLang="ja-JP"
			             label="Last day of 延暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0781/01/05'})} forceLang="ja-JP"
			             label="First day of 天応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0782/08/22'})} forceLang="ja-JP"
			             label="Last day of 天応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0770/10/05'})} forceLang="ja-JP"
			             label="First day of 宝亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0781/01/04'})} forceLang="ja-JP"
			             label="Last day of 宝亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0767/08/20'})} forceLang="ja-JP"
			             label="First day of 神護景雲"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0770/10/04'})} forceLang="ja-JP"
			             label="Last day of 神護景雲"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0765/01/11'})} forceLang="ja-JP"
			             label="First day of 天平神護"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0767/08/19'})} forceLang="ja-JP"
			             label="Last day of 天平神護"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0757/08/22'})} forceLang="ja-JP"
			             label="First day of 天平宝字"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0765/01/10'})} forceLang="ja-JP"
			             label="Last day of 天平宝字"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0749/07/06'})} forceLang="ja-JP"
			             label="First day of 天平勝宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0757/08/21'})} forceLang="ja-JP"
			             label="Last day of 天平勝宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0749/04/18'})} forceLang="ja-JP"
			             label="First day of 天平感宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0749/07/05'})} forceLang="ja-JP"
			             label="Last day of 天平感宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0729/08/09'})} forceLang="ja-JP"
			             label="First day of 天平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0749/04/17'})} forceLang="ja-JP"
			             label="Last day of 天平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0724/02/08'})} forceLang="ja-JP"
			             label="First day of 神亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0729/08/08'})} forceLang="ja-JP"
			             label="Last day of 神亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0717/11/21'})} forceLang="ja-JP"
			             label="First day of 養老"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0724/02/07'})} forceLang="ja-JP"
			             label="Last day of 養老"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0715/09/06'})} forceLang="ja-JP"
			             label="First day of 霊亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0717/11/20'})} forceLang="ja-JP"
			             label="Last day of 霊亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0708/01/15'})} forceLang="ja-JP"
			             label="First day of 和銅"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0715/09/05'})} forceLang="ja-JP"
			             label="Last day of 和銅"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0704/05/14'})} forceLang="ja-JP"
			             label="First day of 慶雲"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0708/01/14'})} forceLang="ja-JP"
			             label="Last day of 慶雲"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0701/03/25'})} forceLang="ja-JP"
			             label="First day of 大宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0704/05/13'})} forceLang="ja-JP"
			             label="Last day of 大宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0686/07/23'})} forceLang="ja-JP"
			             label="First day of 朱鳥"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0701/03/24'})} forceLang="ja-JP"
			             label="Last day of 朱鳥"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0672/01/04'})} forceLang="ja-JP"
			             label="First day of 白鳳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0686/07/22'})} forceLang="ja-JP"
			             label="Last day of 白鳳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0650/02/18'})} forceLang="ja-JP"
			             label="First day of 白雉"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0672/01/03'})} forceLang="ja-JP"
			             label="Last day of 白雉"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0645/01/04'})} forceLang="ja-JP"
			             label="First day of 大化"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0650/02/17'})} forceLang="ja-JP"
			             label="Last day of 大化"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} forceLang="ja-JP"
			             label="First day of 西暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0645/01/03'})} forceLang="ja-JP"
			             label="Last day of 西暦"/>
		</HxGrid>;
	}
};
