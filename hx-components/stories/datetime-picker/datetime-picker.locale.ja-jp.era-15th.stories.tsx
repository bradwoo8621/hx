import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/15thCentury', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese calendar — 15th century eras (正長 ~ 明応)
// ---------------------------------------------------------------------------

export const JaJapanese15th: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1428/05/06'})} calendarLocale="ja-JP"
			             label="First day of 正長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1429/09/13'})} calendarLocale="ja-JP"
			             label="Last day of 正長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1429/09/14'})} calendarLocale="ja-JP"
			             label="First day of 永享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1441/02/25'})} calendarLocale="ja-JP"
			             label="Last day of 永享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1441/02/26'})} calendarLocale="ja-JP"
			             label="First day of 嘉吉"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1444/02/13'})} calendarLocale="ja-JP"
			             label="Last day of 嘉吉"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1444/02/14'})} calendarLocale="ja-JP"
			             label="First day of 文安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1449/08/05'})} calendarLocale="ja-JP"
			             label="Last day of 文安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1449/08/06'})} calendarLocale="ja-JP"
			             label="First day of 宝徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1452/08/02'})} calendarLocale="ja-JP"
			             label="Last day of 宝徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1452/08/03'})} calendarLocale="ja-JP"
			             label="First day of 享徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1455/08/02'})} calendarLocale="ja-JP"
			             label="Last day of 享徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1455/08/03'})} calendarLocale="ja-JP"
			             label="First day of 康正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1457/10/06'})} calendarLocale="ja-JP"
			             label="Last day of 康正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1457/10/07'})} calendarLocale="ja-JP"
			             label="First day of 長禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1460/12/29'})} calendarLocale="ja-JP"
			             label="Last day of 長禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1460/12/30'})} calendarLocale="ja-JP"
			             label="First day of 寛正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1466/03/08'})} calendarLocale="ja-JP"
			             label="Last day of 寛正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1466/03/09'})} calendarLocale="ja-JP"
			             label="First day of 文正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1467/03/11'})} calendarLocale="ja-JP"
			             label="Last day of 文正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1467/03/12'})} calendarLocale="ja-JP"
			             label="First day of 応仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1469/05/06'})} calendarLocale="ja-JP"
			             label="Last day of 応仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1469/05/07'})} calendarLocale="ja-JP"
			             label="First day of 文明"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1487/08/06'})} calendarLocale="ja-JP"
			             label="Last day of 文明"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1487/08/07'})} calendarLocale="ja-JP"
			             label="First day of 長享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1489/08/29'})} calendarLocale="ja-JP"
			             label="Last day of 長享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1489/08/30'})} calendarLocale="ja-JP"
			             label="First day of 延徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1492/07/27'})} calendarLocale="ja-JP"
			             label="Last day of 延徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1492/07/28'})} calendarLocale="ja-JP"
			             label="First day of 明応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1501/03/10'})} calendarLocale="ja-JP"
			             label="Last day of 明応"/>
		</HxGrid>;
	}
};
