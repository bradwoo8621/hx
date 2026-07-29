import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/08thCentury', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese calendar — 8th century eras (大宝 ~ 延暦)
// ---------------------------------------------------------------------------

export const JaJapanese08th: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0701/03/25'})} calendarLocale="ja-JP"
			             label="First day of 大宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0704/05/13'})} calendarLocale="ja-JP"
			             label="Last day of 大宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0704/05/14'})} calendarLocale="ja-JP"
			             label="First day of 慶雲"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0708/01/14'})} calendarLocale="ja-JP"
			             label="Last day of 慶雲"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0708/01/15'})} calendarLocale="ja-JP"
			             label="First day of 和銅"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0715/09/05'})} calendarLocale="ja-JP"
			             label="Last day of 和銅"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0715/09/06'})} calendarLocale="ja-JP"
			             label="First day of 霊亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0717/11/20'})} calendarLocale="ja-JP"
			             label="Last day of 霊亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0717/11/21'})} calendarLocale="ja-JP"
			             label="First day of 養老"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0724/02/07'})} calendarLocale="ja-JP"
			             label="Last day of 養老"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0724/02/08'})} calendarLocale="ja-JP"
			             label="First day of 神亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0729/08/08'})} calendarLocale="ja-JP"
			             label="Last day of 神亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0729/08/09'})} calendarLocale="ja-JP"
			             label="First day of 天平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0749/04/17'})} calendarLocale="ja-JP"
			             label="Last day of 天平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0749/04/18'})} calendarLocale="ja-JP"
			             label="First day of 天平感宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0749/07/05'})} calendarLocale="ja-JP"
			             label="Last day of 天平感宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0749/07/06'})} calendarLocale="ja-JP"
			             label="First day of 天平勝宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0757/08/21'})} calendarLocale="ja-JP"
			             label="Last day of 天平勝宝"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0757/08/22'})} calendarLocale="ja-JP"
			             label="First day of 天平宝字"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0765/01/10'})} calendarLocale="ja-JP"
			             label="Last day of 天平宝字"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0765/01/11'})} calendarLocale="ja-JP"
			             label="First day of 天平神護"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0767/08/19'})} calendarLocale="ja-JP"
			             label="Last day of 天平神護"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0767/08/20'})} calendarLocale="ja-JP"
			             label="First day of 神護景雲"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0770/10/04'})} calendarLocale="ja-JP"
			             label="Last day of 神護景雲"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0770/10/05'})} calendarLocale="ja-JP"
			             label="First day of 宝亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0781/01/04'})} calendarLocale="ja-JP"
			             label="Last day of 宝亀"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0781/01/05'})} calendarLocale="ja-JP"
			             label="First day of 天応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0782/08/22'})} calendarLocale="ja-JP"
			             label="Last day of 天応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0782/08/23'})} calendarLocale="ja-JP"
			             label="First day of 延暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0806/05/21'})} calendarLocale="ja-JP"
			             label="Last day of 延暦"/>
		</HxGrid>;
	}
};
