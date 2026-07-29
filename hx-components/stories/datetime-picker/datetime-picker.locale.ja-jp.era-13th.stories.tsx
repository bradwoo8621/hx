import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/13thCentury', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese calendar — 13th century eras (建仁 ~ 正安)
// ---------------------------------------------------------------------------

export const JaJapanese13th: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1201/02/20'})} forceLang="ja-JP"
			             label="First day of 建仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1204/02/26'})} forceLang="ja-JP"
			             label="Last day of 建仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1204/02/27'})} forceLang="ja-JP"
			             label="First day of 元久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1206/05/03'})} forceLang="ja-JP"
			             label="Last day of 元久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1206/05/04'})} forceLang="ja-JP"
			             label="First day of 建永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1207/10/31'})} forceLang="ja-JP"
			             label="Last day of 建永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1207/11/01'})} forceLang="ja-JP"
			             label="First day of 承元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1211/03/15'})} forceLang="ja-JP"
			             label="Last day of 承元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1211/03/16'})} forceLang="ja-JP"
			             label="First day of 建暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1213/12/12'})} forceLang="ja-JP"
			             label="Last day of 建暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1213/12/13'})} forceLang="ja-JP"
			             label="First day of 建保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1219/04/18'})} forceLang="ja-JP"
			             label="Last day of 建保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1219/04/19'})} forceLang="ja-JP"
			             label="First day of 承久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1222/04/19'})} forceLang="ja-JP"
			             label="Last day of 承久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1222/04/20'})} forceLang="ja-JP"
			             label="First day of 貞応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1224/11/26'})} forceLang="ja-JP"
			             label="Last day of 貞応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1224/11/27'})} forceLang="ja-JP"
			             label="First day of 元仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1225/04/26'})} forceLang="ja-JP"
			             label="Last day of 元仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1225/04/27'})} forceLang="ja-JP"
			             label="First day of 嘉禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1227/12/16'})} forceLang="ja-JP"
			             label="Last day of 嘉禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1227/12/17'})} forceLang="ja-JP"
			             label="First day of 安貞"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1229/03/11'})} forceLang="ja-JP"
			             label="Last day of 安貞"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1229/03/12'})} forceLang="ja-JP"
			             label="First day of 寛喜"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1232/04/08'})} forceLang="ja-JP"
			             label="Last day of 寛喜"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1232/04/09'})} forceLang="ja-JP"
			             label="First day of 貞永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1233/04/21'})} forceLang="ja-JP"
			             label="Last day of 貞永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1233/04/22'})} forceLang="ja-JP"
			             label="First day of 天福"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1234/11/11'})} forceLang="ja-JP"
			             label="Last day of 天福"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1234/11/12'})} forceLang="ja-JP"
			             label="First day of 文暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1235/09/25'})} forceLang="ja-JP"
			             label="Last day of 文暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1235/09/26'})} forceLang="ja-JP"
			             label="First day of 嘉禎"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1238/11/29'})} forceLang="ja-JP"
			             label="Last day of 嘉禎"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1238/11/30'})} forceLang="ja-JP"
			             label="First day of 暦仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1239/02/13'})} forceLang="ja-JP"
			             label="Last day of 暦仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1239/02/14'})} forceLang="ja-JP"
			             label="First day of 延応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1240/07/22'})} forceLang="ja-JP"
			             label="Last day of 延応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1240/07/23'})} forceLang="ja-JP"
			             label="First day of 仁治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1243/03/04'})} forceLang="ja-JP"
			             label="Last day of 仁治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1243/03/05'})} forceLang="ja-JP"
			             label="First day of 寛元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1247/03/06'})} forceLang="ja-JP"
			             label="Last day of 寛元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1247/03/07'})} forceLang="ja-JP"
			             label="First day of 宝治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1249/03/24'})} forceLang="ja-JP"
			             label="Last day of 宝治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1249/03/25'})} forceLang="ja-JP"
			             label="First day of 建長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1256/10/11'})} forceLang="ja-JP"
			             label="Last day of 建長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1256/10/12'})} forceLang="ja-JP"
			             label="First day of 康元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1257/03/20'})} forceLang="ja-JP"
			             label="Last day of 康元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1257/03/21'})} forceLang="ja-JP"
			             label="First day of 正嘉"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1259/04/01'})} forceLang="ja-JP"
			             label="Last day of 正嘉"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1259/04/02'})} forceLang="ja-JP"
			             label="First day of 正元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1260/04/19'})} forceLang="ja-JP"
			             label="Last day of 正元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1260/04/20'})} forceLang="ja-JP"
			             label="First day of 文応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1261/02/26'})} forceLang="ja-JP"
			             label="Last day of 文応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1261/02/27'})} forceLang="ja-JP"
			             label="First day of 弘長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1264/03/05'})} forceLang="ja-JP"
			             label="Last day of 弘長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1264/03/06'})} forceLang="ja-JP"
			             label="First day of 文永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1275/05/01'})} forceLang="ja-JP"
			             label="Last day of 文永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1275/05/02'})} forceLang="ja-JP"
			             label="First day of 建治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1278/03/07'})} forceLang="ja-JP"
			             label="Last day of 建治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1278/03/08'})} forceLang="ja-JP"
			             label="First day of 弘安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1288/05/04'})} forceLang="ja-JP"
			             label="Last day of 弘安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1288/05/05'})} forceLang="ja-JP"
			             label="First day of 正応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1293/08/11'})} forceLang="ja-JP"
			             label="Last day of 正応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1293/08/12'})} forceLang="ja-JP"
			             label="First day of 永仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1299/05/01'})} forceLang="ja-JP"
			             label="Last day of 永仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1299/05/02'})} forceLang="ja-JP"
			             label="First day of 正安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1302/11/28'})} forceLang="ja-JP"
			             label="Last day of 正安"/>
		</HxGrid>;
	}
};
