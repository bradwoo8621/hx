import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Minguo/1582', ...baseMeta};

export const ZhTw1582: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/01/01'})} forceLang="zh-TW"
			             label="Last year has Gregorian reform dates — zh-TW"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/14'})} forceLang="zh-TW"
			             label="Short months, aligned with Gregorian dates, #1 — zh-TW"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/15'})} forceLang="zh-TW"
			             label="Short months, aligned with Gregorian dates, #2 — zh-TW"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/12/31'})} forceLang="zh-TW"
			             label="Fully aligned with Gregorian dates — zh-TW"/>
		</HxGrid>;
	}
};
