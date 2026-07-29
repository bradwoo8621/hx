import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/16thCentury', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese calendar — 16th century eras (文亀 ~ 慶長)
// ---------------------------------------------------------------------------

export const JaJapanese16th: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1501/03/11'})} forceLang="ja-JP"
			             label="First day of 文亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1504/03/10'})} forceLang="ja-JP"
			             label="Last day of 文亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1504/03/11'})} forceLang="ja-JP"
			             label="First day of 永正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1521/09/01'})} forceLang="ja-JP"
			             label="Last day of 永正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1521/09/02'})} forceLang="ja-JP"
			             label="First day of 大永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1528/08/29'})} forceLang="ja-JP"
			             label="Last day of 大永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1528/08/30'})} forceLang="ja-JP"
			             label="First day of 享禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1532/08/07'})} forceLang="ja-JP"
			             label="Last day of 享禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1532/08/08'})} forceLang="ja-JP"
			             label="First day of 天文"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1555/11/01'})} forceLang="ja-JP"
			             label="Last day of 天文"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1555/11/02'})} forceLang="ja-JP"
			             label="First day of 弘治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1558/03/09'})} forceLang="ja-JP"
			             label="Last day of 弘治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1558/03/10'})} forceLang="ja-JP"
			             label="First day of 永禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1570/05/02'})} forceLang="ja-JP"
			             label="Last day of 永禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1570/05/03'})} forceLang="ja-JP"
			             label="First day of 元亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1573/08/06'})} forceLang="ja-JP"
			             label="Last day of 元亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1573/08/07'})} forceLang="ja-JP"
			             label="First day of 天正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1592/12/07'})} forceLang="ja-JP"
			             label="Last day of 天正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1592/12/08'})} forceLang="ja-JP"
			             label="First day of 文禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1596/10/26'})} forceLang="ja-JP"
			             label="Last day of 文禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1596/10/27'})} forceLang="ja-JP"
			             label="First day of 慶長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1615/07/12'})} forceLang="ja-JP"
			             label="Last day of 慶長"/>
		</HxGrid>;
	}
};
