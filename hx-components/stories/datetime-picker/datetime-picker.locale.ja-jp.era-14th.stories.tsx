import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/14thCentury', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese calendar — 14th century eras (乾元 ~ 応永)
// ---------------------------------------------------------------------------

export const JaJapanese14th: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1302/11/29'})} calendarLocale="ja-JP"
			             label="First day of 乾元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1303/08/12'})} calendarLocale="ja-JP"
			             label="Last day of 乾元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1303/08/13'})} calendarLocale="ja-JP"
			             label="First day of 嘉元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1306/12/21'})} calendarLocale="ja-JP"
			             label="Last day of 嘉元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1306/12/22'})} calendarLocale="ja-JP"
			             label="First day of 徳治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1308/10/16'})} calendarLocale="ja-JP"
			             label="Last day of 徳治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1308/10/17'})} calendarLocale="ja-JP"
			             label="First day of 延慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1311/05/05'})} calendarLocale="ja-JP"
			             label="Last day of 延慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1311/05/06'})} calendarLocale="ja-JP"
			             label="First day of 応長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1312/03/27'})} calendarLocale="ja-JP"
			             label="Last day of 応長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1312/03/28'})} calendarLocale="ja-JP"
			             label="First day of 正和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1317/02/10'})} calendarLocale="ja-JP"
			             label="Last day of 正和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1317/02/11'})} calendarLocale="ja-JP"
			             label="First day of 文保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1319/05/05'})} calendarLocale="ja-JP"
			             label="Last day of 文保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1319/05/06'})} calendarLocale="ja-JP"
			             label="First day of 元応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1321/03/02'})} calendarLocale="ja-JP"
			             label="Last day of 元応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1321/03/03'})} calendarLocale="ja-JP"
			             label="First day of 元亨"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1324/12/16'})} calendarLocale="ja-JP"
			             label="Last day of 元亨"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1324/12/17'})} calendarLocale="ja-JP"
			             label="First day of 正中"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1326/05/03'})} calendarLocale="ja-JP"
			             label="Last day of 正中"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1326/05/04'})} calendarLocale="ja-JP"
			             label="First day of 嘉暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1329/09/05'})} calendarLocale="ja-JP"
			             label="Last day of 嘉暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1329/09/06'})} calendarLocale="ja-JP"
			             label="First day of 元徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1331/08/16'})} calendarLocale="ja-JP"
			             label="Last day of 元徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1331/08/17'})} calendarLocale="ja-JP"
			             label="First day of 元弘"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1334/02/05'})} calendarLocale="ja-JP"
			             label="Last day of 元弘"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1334/02/06'})} calendarLocale="ja-JP"
			             label="First day of 建武"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1336/03/07'})} calendarLocale="ja-JP"
			             label="Last day of 建武"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1336/03/08'})} calendarLocale="ja-JP"
			             label="First day of 延元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1340/05/05'})} calendarLocale="ja-JP"
			             label="Last day of 延元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1340/05/06'})} calendarLocale="ja-JP"
			             label="First day of 興国"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1346/12/15'})} calendarLocale="ja-JP"
			             label="Last day of 興国"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1346/12/16'})} calendarLocale="ja-JP"
			             label="First day of 正平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1370/07/31'})} calendarLocale="ja-JP"
			             label="Last day of 正平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1370/08/01'})} calendarLocale="ja-JP"
			             label="First day of 建徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1372/04/08'})} calendarLocale="ja-JP"
			             label="Last day of 建徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1372/04/09'})} calendarLocale="ja-JP"
			             label="First day of 文中"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1375/06/03'})} calendarLocale="ja-JP"
			             label="Last day of 文中"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1375/06/04'})} calendarLocale="ja-JP"
			             label="First day of 天授"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1379/03/29'})} calendarLocale="ja-JP"
			             label="Last day of 天授"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1379/03/30'})} calendarLocale="ja-JP"
			             label="First day of 康暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1381/02/17'})} calendarLocale="ja-JP"
			             label="Last day of 康暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1381/02/18'})} calendarLocale="ja-JP"
			             label="First day of 弘和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1384/05/05'})} calendarLocale="ja-JP"
			             label="Last day of 弘和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1384/05/06'})} calendarLocale="ja-JP"
			             label="First day of 元中"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1387/08/29'})} calendarLocale="ja-JP"
			             label="Last day of 元中"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1387/08/30'})} calendarLocale="ja-JP"
			             label="First day of 至徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1387/08/30'})} calendarLocale="ja-JP"
			             label="Last day of 至徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1387/08/31'})} calendarLocale="ja-JP"
			             label="First day of 嘉慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1389/02/16'})} calendarLocale="ja-JP"
			             label="Last day of 嘉慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1389/02/17'})} calendarLocale="ja-JP"
			             label="First day of 康応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1390/04/02'})} calendarLocale="ja-JP"
			             label="Last day of 康応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1390/04/03'})} calendarLocale="ja-JP"
			             label="First day of 明徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1394/07/12'})} calendarLocale="ja-JP"
			             label="Last day of 明徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1394/07/13'})} calendarLocale="ja-JP"
			             label="First day of 応永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1428/05/05'})} calendarLocale="ja-JP"
			             label="Last day of 応永"/>
		</HxGrid>;
	}
};
