import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {createMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

const meta = createMeta('Components/Basic/DateTimePicker/Locale/Japanese/JulianLeap');
export default meta;

export const JaJapaneseJulianLeap: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
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
		</HxGrid>;
	}
};
