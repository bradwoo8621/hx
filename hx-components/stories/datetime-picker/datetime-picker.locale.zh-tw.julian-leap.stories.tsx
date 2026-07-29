import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, LocaleStory, type Story} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Minguo/JulianLeap', ...baseMeta};

export const ZhTwJulianLeap: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
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
		</HxGrid>;
	}
};
