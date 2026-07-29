import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/17thCentury', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese calendar — 17th century eras (元和 ~ 元禄)
// ---------------------------------------------------------------------------

export const JaJapanese17th: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1615/07/13'})} forceLang="ja-JP"
			             label="First day of 元和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1624/02/29'})} forceLang="ja-JP"
			             label="Last day of 元和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1624/03/01'})} forceLang="ja-JP"
			             label="First day of 寛永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1644/12/15'})} forceLang="ja-JP"
			             label="Last day of 寛永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1644/12/16'})} forceLang="ja-JP"
			             label="First day of 正保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1648/02/14'})} forceLang="ja-JP"
			             label="Last day of 正保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1648/02/15'})} forceLang="ja-JP"
			             label="First day of 慶安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1652/09/17'})} forceLang="ja-JP"
			             label="Last day of 慶安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1652/09/18'})} forceLang="ja-JP"
			             label="First day of 承応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1655/04/12'})} forceLang="ja-JP"
			             label="Last day of 承応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1655/04/13'})} forceLang="ja-JP"
			             label="First day of 明暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1658/07/22'})} forceLang="ja-JP"
			             label="Last day of 明暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1658/07/23'})} forceLang="ja-JP"
			             label="First day of 万治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1661/04/24'})} forceLang="ja-JP"
			             label="Last day of 万治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1661/04/25'})} forceLang="ja-JP"
			             label="First day of 寛文"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1673/09/20'})} forceLang="ja-JP"
			             label="Last day of 寛文"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1673/09/21'})} forceLang="ja-JP"
			             label="First day of 延宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1681/09/28'})} forceLang="ja-JP"
			             label="Last day of 延宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1681/09/29'})} forceLang="ja-JP"
			             label="First day of 天和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1684/02/20'})} forceLang="ja-JP"
			             label="Last day of 天和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1684/02/21'})} forceLang="ja-JP"
			             label="First day of 貞享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1688/09/29'})} forceLang="ja-JP"
			             label="Last day of 貞享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1688/09/30'})} forceLang="ja-JP"
			             label="First day of 元禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1704/03/12'})} forceLang="ja-JP"
			             label="Last day of 元禄"/>
		</HxGrid>;
	}
};
