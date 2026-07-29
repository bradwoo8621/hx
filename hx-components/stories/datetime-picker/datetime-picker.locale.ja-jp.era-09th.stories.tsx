import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/09thCentury', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese calendar — 9th century eras (大同 ~ 昌泰)
// ---------------------------------------------------------------------------

export const JaJapanese09th: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0806/05/22'})} forceLang="ja-JP"
			             label="First day of 大同"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0810/09/22'})} forceLang="ja-JP"
			             label="Last day of 大同"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0810/09/23'})} forceLang="ja-JP"
			             label="First day of 弘仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0824/01/08'})} forceLang="ja-JP"
			             label="Last day of 弘仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0824/01/09'})} forceLang="ja-JP"
			             label="First day of 天長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0834/01/06'})} forceLang="ja-JP"
			             label="Last day of 天長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0834/01/07'})} forceLang="ja-JP"
			             label="First day of 承和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0848/06/16'})} forceLang="ja-JP"
			             label="Last day of 承和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0848/06/17'})} forceLang="ja-JP"
			             label="First day of 嘉祥"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0851/05/01'})} forceLang="ja-JP"
			             label="Last day of 嘉祥"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0851/05/02'})} forceLang="ja-JP"
			             label="First day of 仁寿"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0854/12/03'})} forceLang="ja-JP"
			             label="Last day of 仁寿"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0854/12/04'})} forceLang="ja-JP"
			             label="First day of 斉衡"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0857/02/24'})} forceLang="ja-JP"
			             label="Last day of 斉衡"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0857/02/25'})} forceLang="ja-JP"
			             label="First day of 天安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0859/04/18'})} forceLang="ja-JP"
			             label="Last day of 天安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0859/04/19'})} forceLang="ja-JP"
			             label="First day of 貞観"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0877/04/19'})} forceLang="ja-JP"
			             label="Last day of 貞観"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0877/04/20'})} forceLang="ja-JP"
			             label="First day of 元慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0885/02/24'})} forceLang="ja-JP"
			             label="Last day of 元慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0885/02/25'})} forceLang="ja-JP"
			             label="First day of 仁和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0889/04/30'})} forceLang="ja-JP"
			             label="Last day of 仁和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0889/05/01'})} forceLang="ja-JP"
			             label="First day of 寛平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0898/04/29'})} forceLang="ja-JP"
			             label="Last day of 寛平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0898/04/30'})} forceLang="ja-JP"
			             label="First day of 昌泰"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0901/07/19'})} forceLang="ja-JP"
			             label="Last day of 昌泰"/>
		</HxGrid>;
	}
};
