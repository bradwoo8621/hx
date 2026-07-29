import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/19thCentury', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese calendar — 19th century eras (享和 ~ 明治)
// ---------------------------------------------------------------------------

export const JaJapanese19th: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1801/02/05'})} forceLang="ja-JP"
			             label="First day of 享和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1804/02/10'})} forceLang="ja-JP"
			             label="Last day of 享和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1804/02/11'})} forceLang="ja-JP"
			             label="First day of 文化"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1818/04/21'})} forceLang="ja-JP"
			             label="Last day of 文化"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1818/04/22'})} forceLang="ja-JP"
			             label="First day of 文政"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1830/12/09'})} forceLang="ja-JP"
			             label="Last day of 文政"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1830/12/10'})} forceLang="ja-JP"
			             label="First day of 天保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1844/12/01'})} forceLang="ja-JP"
			             label="Last day of 天保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1844/12/02'})} forceLang="ja-JP"
			             label="First day of 弘化"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1848/02/27'})} forceLang="ja-JP"
			             label="Last day of 弘化"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1848/02/28'})} forceLang="ja-JP"
			             label="First day of 嘉永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1854/11/26'})} forceLang="ja-JP"
			             label="Last day of 嘉永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1854/11/27'})} forceLang="ja-JP"
			             label="First day of 安政"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1860/03/17'})} forceLang="ja-JP"
			             label="Last day of 安政"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1860/03/18'})} forceLang="ja-JP"
			             label="First day of 万延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1861/02/18'})} forceLang="ja-JP"
			             label="Last day of 万延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1861/02/19'})} forceLang="ja-JP"
			             label="First day of 文久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1864/02/19'})} forceLang="ja-JP"
			             label="Last day of 文久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1864/02/20'})} forceLang="ja-JP"
			             label="First day of 元治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1865/04/06'})} forceLang="ja-JP"
			             label="Last day of 元治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1865/04/07'})} forceLang="ja-JP"
			             label="First day of 慶応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1868/10/22'})} forceLang="ja-JP"
			             label="Last day of 慶応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1868/10/23'})} forceLang="ja-JP"
			             label="First day of 明治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1912/07/29'})} forceLang="ja-JP"
			             label="Last day of 明治"/>
		</HxGrid>;
	}
};
