import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/18thCentury', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese calendar — 18th century eras (宝永 ~ 寛政)
// ---------------------------------------------------------------------------

export const JaJapanese18th: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1704/03/13'})} forceLang="ja-JP"
			             label="First day of 宝永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1711/04/24'})} forceLang="ja-JP"
			             label="Last day of 宝永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1711/04/25'})} forceLang="ja-JP"
			             label="First day of 正徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1716/06/21'})} forceLang="ja-JP"
			             label="Last day of 正徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1716/06/22'})} forceLang="ja-JP"
			             label="First day of 享保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1736/04/27'})} forceLang="ja-JP"
			             label="Last day of 享保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1736/04/28'})} forceLang="ja-JP"
			             label="First day of 元文"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1741/02/26'})} forceLang="ja-JP"
			             label="Last day of 元文"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1741/02/27'})} forceLang="ja-JP"
			             label="First day of 寛保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1744/02/20'})} forceLang="ja-JP"
			             label="Last day of 寛保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1744/02/21'})} forceLang="ja-JP"
			             label="First day of 延享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1748/07/11'})} forceLang="ja-JP"
			             label="Last day of 延享"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1748/07/12'})} forceLang="ja-JP"
			             label="First day of 寛延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1751/10/26'})} forceLang="ja-JP"
			             label="Last day of 寛延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1751/10/27'})} forceLang="ja-JP"
			             label="First day of 宝暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1764/06/01'})} forceLang="ja-JP"
			             label="Last day of 宝暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1764/06/02'})} forceLang="ja-JP"
			             label="First day of 明和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1772/11/15'})} forceLang="ja-JP"
			             label="Last day of 明和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1772/11/16'})} forceLang="ja-JP"
			             label="First day of 安永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1781/04/01'})} forceLang="ja-JP"
			             label="Last day of 安永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1781/04/02'})} forceLang="ja-JP"
			             label="First day of 天明"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1789/01/24'})} forceLang="ja-JP"
			             label="Last day of 天明"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1789/01/25'})} forceLang="ja-JP"
			             label="First day of 寛政"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1801/02/04'})} forceLang="ja-JP"
			             label="Last day of 寛政"/>
		</HxGrid>;
	}
};
